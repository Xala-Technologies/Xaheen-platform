/**
 * Mock File System for Unit Testing
 * Provides in-memory file system operations for isolated testing
 */

import { vi } from "vitest";
import { join, dirname, basename, extname } from "node:path";

export interface MockFile {
	readonly path: string;
	readonly content: string;
	readonly type: "file" | "directory";
	readonly stats: {
		readonly size: number;
		readonly createdAt: Date;
		readonly modifiedAt: Date;
		readonly isFile: () => boolean;
		readonly isDirectory: () => boolean;
	};
}

export interface MockFileSystemOptions {
	readonly caseSensitive?: boolean;
	readonly maxFileSize?: number;
	readonly trackHistory?: boolean;
}

export class MockFileSystem {
	private files = new Map<string, MockFile>();
	private history: Array<{ operation: string; path: string; timestamp: Date }> = [];
	private readonly options: Required<MockFileSystemOptions>;

	constructor(options: MockFileSystemOptions = {}) {
		this.options = {
			caseSensitive: true,
			maxFileSize: 10 * 1024 * 1024, // 10MB
			trackHistory: true,
			...options,
		};
	}

	/**
	 * Write file to the mock file system
	 */
	async writeFile(filePath: string, content: string): Promise<void> {
		const normalizedPath = this.normalizePath(filePath);
		
		if (content.length > this.options.maxFileSize) {
			throw new Error(`File too large: ${content.length} bytes (max: ${this.options.maxFileSize})`);
		}

		// Ensure parent directory exists
		await this.ensureDirectory(dirname(normalizedPath));

		const now = new Date();
		const file: MockFile = {
			path: normalizedPath,
			content,
			type: "file",
			stats: {
				size: content.length,
				createdAt: this.files.get(normalizedPath)?.stats.createdAt || now,
				modifiedAt: now,
				isFile: () => true,
				isDirectory: () => false,
			},
		};

		this.files.set(normalizedPath, file);
		this.recordOperation("writeFile", normalizedPath);
	}

	/**
	 * Read file from the mock file system
	 */
	async readFile(filePath: string): Promise<string> {
		const normalizedPath = this.normalizePath(filePath);
		const file = this.files.get(normalizedPath);

		if (!file) {
			throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
		}

		if (file.type !== "file") {
			throw new Error(`EISDIR: illegal operation on a directory, read '${filePath}'`);
		}

		this.recordOperation("readFile", normalizedPath);
		return file.content;
	}

	/**
	 * Check if file or directory exists
	 */
	async exists(filePath: string): Promise<boolean> {
		const normalizedPath = this.normalizePath(filePath);
		const exists = this.files.has(normalizedPath);
		this.recordOperation("exists", normalizedPath);
		return exists;
	}

	/**
	 * Get file stats
	 */
	async stat(filePath: string): Promise<MockFile["stats"]> {
		const normalizedPath = this.normalizePath(filePath);
		const file = this.files.get(normalizedPath);

		if (!file) {
			throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
		}

		this.recordOperation("stat", normalizedPath);
		return file.stats;
	}

	/**
	 * Create directory
	 */
	async mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
		const normalizedPath = this.normalizePath(dirPath);

		if (options?.recursive) {
			await this.ensureDirectory(normalizedPath);
		} else {
			const parent = dirname(normalizedPath);
			if (parent !== normalizedPath && !await this.exists(parent)) {
				throw new Error(`ENOENT: no such file or directory, mkdir '${dirPath}'`);
			}

			await this.createDirectory(normalizedPath);
		}
	}

	/**
	 * Read directory contents
	 */
	async readdir(dirPath: string): Promise<string[]> {
		const normalizedPath = this.normalizePath(dirPath);
		
		if (!await this.exists(normalizedPath)) {
			throw new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`);
		}

		const dirFile = this.files.get(normalizedPath);
		if (dirFile?.type !== "directory") {
			throw new Error(`ENOTDIR: not a directory, scandir '${dirPath}'`);
		}

		const children: string[] = [];
		const dirPrefix = normalizedPath === "/" ? "/" : `${normalizedPath}/`;

		for (const filePath of this.files.keys()) {
			if (filePath.startsWith(dirPrefix) && filePath !== normalizedPath) {
				const relativePath = filePath.substring(dirPrefix.length);
				const firstSlash = relativePath.indexOf("/");
				const childName = firstSlash === -1 ? relativePath : relativePath.substring(0, firstSlash);
				
				if (childName && !children.includes(childName)) {
					children.push(childName);
				}
			}
		}

		this.recordOperation("readdir", normalizedPath);
		return children.sort();
	}

	/**
	 * Remove file or directory
	 */
	async rm(filePath: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
		const normalizedPath = this.normalizePath(filePath);

		if (!await this.exists(normalizedPath)) {
			if (options?.force) {
				return;
			}
			throw new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
		}

		const file = this.files.get(normalizedPath)!;

		if (file.type === "directory") {
			if (!options?.recursive) {
				const children = await this.readdir(normalizedPath);
				if (children.length > 0) {
					throw new Error(`ENOTEMPTY: directory not empty, rmdir '${filePath}'`);
				}
			} else {
				// Remove all children recursively
				const pathsToRemove = Array.from(this.files.keys())
					.filter(path => path.startsWith(`${normalizedPath}/`) || path === normalizedPath)
					.sort((a, b) => b.length - a.length); // Remove deeper paths first

				for (const path of pathsToRemove) {
					this.files.delete(path);
				}
			}
		}

		this.files.delete(normalizedPath);
		this.recordOperation("rm", normalizedPath);
	}

	/**
	 * Copy file
	 */
	async copyFile(src: string, dest: string): Promise<void> {
		const content = await this.readFile(src);
		await this.writeFile(dest, content);
		this.recordOperation("copyFile", `${src} -> ${dest}`);
	}

	/**
	 * Move/rename file
	 */
	async rename(oldPath: string, newPath: string): Promise<void> {
		const normalizedOldPath = this.normalizePath(oldPath);
		const normalizedNewPath = this.normalizePath(newPath);

		const file = this.files.get(normalizedOldPath);
		if (!file) {
			throw new Error(`ENOENT: no such file or directory, rename '${oldPath}' -> '${newPath}'`);
		}

		// Ensure destination directory exists
		await this.ensureDirectory(dirname(normalizedNewPath));

		// Create new file with updated path
		const newFile: MockFile = {
			...file,
			path: normalizedNewPath,
		};

		this.files.set(normalizedNewPath, newFile);
		this.files.delete(normalizedOldPath);
		this.recordOperation("rename", `${oldPath} -> ${newPath}`);
	}

	/**
	 * Get all files matching a pattern
	 */
	glob(pattern: string): string[] {
		const regex = this.globToRegex(pattern);
		return Array.from(this.files.keys())
			.filter(path => {
				const file = this.files.get(path)!;
				return file.type === "file" && regex.test(path);
			})
			.sort();
	}

	/**
	 * Get file tree as a string representation
	 */
	getTree(rootPath = "/"): string {
		const normalizedRoot = this.normalizePath(rootPath);
		const lines: string[] = [];

		const addPath = (path: string, prefix = "", isLast = true) => {
			const file = this.files.get(path);
			if (!file) return;

			const name = basename(path) || path;
			const connector = isLast ? "└── " : "├── ";
			const typeIndicator = file.type === "directory" ? "/" : "";
			
			lines.push(`${prefix}${connector}${name}${typeIndicator}`);

			if (file.type === "directory") {
				const children = Array.from(this.files.keys())
					.filter(childPath => {
						const parent = dirname(childPath);
						return parent === path && childPath !== path;
					})
					.sort();

				children.forEach((child, index) => {
					const childPrefix = prefix + (isLast ? "    " : "│   ");
					const childIsLast = index === children.length - 1;
					addPath(child, childPrefix, childIsLast);
				});
			}
		};

		addPath(normalizedRoot);
		return lines.join("\n");
	}

	/**
	 * Clear all files and history
	 */
	clear(): void {
		this.files.clear();
		this.history = [];
	}

	/**
	 * Get operation history
	 */
	getHistory(): Array<{ operation: string; path: string; timestamp: Date }> {
		return [...this.history];
	}

	/**
	 * Get all file paths
	 */
	getAllPaths(): string[] {
		return Array.from(this.files.keys()).sort();
	}

	/**
	 * Get files by type
	 */
	getFilesByType(type: "file" | "directory"): MockFile[] {
		return Array.from(this.files.values()).filter(file => file.type === type);
	}

	/**
	 * Get total size of all files
	 */
	getTotalSize(): number {
		return Array.from(this.files.values())
			.filter(file => file.type === "file")
			.reduce((total, file) => total + file.stats.size, 0);
	}

	/**
	 * Create a snapshot of the current state
	 */
	createSnapshot(): Map<string, MockFile> {
		return new Map(this.files);
	}

	/**
	 * Restore from a snapshot
	 */
	restoreSnapshot(snapshot: Map<string, MockFile>): void {
		this.files = new Map(snapshot);
		this.recordOperation("restoreSnapshot", `${snapshot.size} files`);
	}

	// Private helper methods

	private normalizePath(path: string): string {
		let normalized = path.replace(/\\/g, "/");
		
		if (!this.options.caseSensitive) {
			normalized = normalized.toLowerCase();
		}

		// Remove duplicate slashes
		normalized = normalized.replace(/\/+/g, "/");
		
		// Remove trailing slash except for root
		if (normalized.length > 1 && normalized.endsWith("/")) {
			normalized = normalized.slice(0, -1);
		}

		return normalized;
	}

	private async ensureDirectory(dirPath: string): Promise<void> {
		const normalizedPath = this.normalizePath(dirPath);
		
		if (normalizedPath === "/" || normalizedPath === "") {
			return;
		}

		if (await this.exists(normalizedPath)) {
			const file = this.files.get(normalizedPath)!;
			if (file.type !== "directory") {
				throw new Error(`ENOTDIR: not a directory '${dirPath}'`);
			}
			return;
		}

		// Ensure parent exists
		const parent = dirname(normalizedPath);
		if (parent !== normalizedPath) {
			await this.ensureDirectory(parent);
		}

		await this.createDirectory(normalizedPath);
	}

	private async createDirectory(dirPath: string): Promise<void> {
		const normalizedPath = this.normalizePath(dirPath);
		const now = new Date();

		const directory: MockFile = {
			path: normalizedPath,
			content: "",
			type: "directory",
			stats: {
				size: 0,
				createdAt: now,
				modifiedAt: now,
				isFile: () => false,
				isDirectory: () => true,
			},
		};

		this.files.set(normalizedPath, directory);
		this.recordOperation("mkdir", normalizedPath);
	}

	private recordOperation(operation: string, path: string): void {
		if (this.options.trackHistory) {
			this.history.push({
				operation,
				path,
				timestamp: new Date(),
			});
		}
	}

	private globToRegex(pattern: string): RegExp {
		const escaped = pattern
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(/\*/g, ".*")
			.replace(/\?/g, ".");
		
		return new RegExp(`^${escaped}$`);
	}
}

/**
 * Create a mock file system with common setup
 */
export function createMockFileSystem(options?: MockFileSystemOptions): MockFileSystem {
	return new MockFileSystem(options);
}

/**
 * Create mock fs promises module for testing
 */
export function createMockFsPromises(mockFs: MockFileSystem) {
	return {
		writeFile: mock().mockImplementation((path: string, content: string) => 
			mockFs.writeFile(path, content)
		),
		readFile: mock().mockImplementation((path: string) => 
			mockFs.readFile(path)
		),
		access: mock().mockImplementation(async (path: string) => {
			if (!await mockFs.exists(path)) {
				throw new Error(`ENOENT: no such file or directory, access '${path}'`);
			}
		}),
		stat: mock().mockImplementation((path: string) => 
			mockFs.stat(path)
		),
		mkdir: mock().mockImplementation((path: string, options?: { recursive?: boolean }) => 
			mockFs.mkdir(path, options)
		),
		readdir: mock().mockImplementation((path: string) => 
			mockFs.readdir(path)
		),
		rm: mock().mockImplementation((path: string, options?: { recursive?: boolean; force?: boolean }) => 
			mockFs.rm(path, options)
		),
		copyFile: mock().mockImplementation((src: string, dest: string) => 
			mockFs.copyFile(src, dest)
		),
		rename: mock().mockImplementation((oldPath: string, newPath: string) => 
			mockFs.rename(oldPath, newPath)
		),
	};
}
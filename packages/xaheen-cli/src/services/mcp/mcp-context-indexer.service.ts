/**
 * @fileoverview MCP Context Indexer Service - EPIC 14 Story 14.1
 * @description Advanced context indexing for intelligent code generation
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, relative, resolve } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

// Context indexing schemas
const CodeElementSchema = z.object({
	id: z.string(),
	type: z.enum([
		"class",
		"interface",
		"function",
		"component",
		"service",
		"controller",
		"model",
		"type",
		"constant",
		"variable",
	]),
	name: z.string(),
	filePath: z.string(),
	startLine: z.number(),
	endLine: z.number(),
	visibility: z.enum(["public", "private", "protected"]).optional(),
	isExported: z.boolean().default(false),
	dependencies: z.array(z.string()).default([]),
	usages: z.array(z.string()).default([]),
	documentation: z.string().optional(),
	complexity: z.number().default(1),
	lastModified: z.date(),
});

const ProjectIndexSchema = z.object({
	projectRoot: z.string(),
	indexedAt: z.date(),
	totalFiles: z.number(),
	totalElements: z.number(),
	fileExtensions: z.array(z.string()),
	framework: z.string().optional(),
	language: z.string().optional(),
	elements: z.array(CodeElementSchema),
	dependencies: z.record(z.string()),
	patterns: z.array(z.string()).default([]),
	complianceLevel: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN"),
});

export type CodeElement = z.infer<typeof CodeElementSchema>;
export type ProjectIndex = z.infer<typeof ProjectIndexSchema>;

export interface IndexingOptions {
	readonly includePatterns?: string[];
	readonly excludePatterns?: string[];
	readonly maxFileSize?: number;
	readonly followSymlinks?: boolean;
	readonly analyzeComplexity?: boolean;
	readonly extractDocumentation?: boolean;
	readonly trackUsages?: boolean;
}

/**
 * Advanced context indexer for intelligent code generation
 * Provides deep analysis of project structure and code patterns
 */
export class MCPContextIndexerService {
	private projectIndex: ProjectIndex | null = null;
	private readonly indexFilePath: string;

	constructor(
		private readonly projectRoot: string = process.cwd(),
	) {
		this.indexFilePath = join(this.projectRoot, ".xaheen", "mcp-index.json");
	}

	/**
	 * Create comprehensive project index
	 */
	async createIndex(options: IndexingOptions = {}): Promise<ProjectIndex> {
		const startTime = Date.now();
		
		try {
			logger.info("📊 Creating comprehensive project index...");

			const defaultOptions: IndexingOptions = {
				includePatterns: [
					"**/*.{ts,tsx,js,jsx,vue,svelte}",
					"**/*.{json,yml,yaml,md}",
					"**/package.json",
					"**/tsconfig.json",
				],
				excludePatterns: [
					"node_modules/**",
					"dist/**",
					"build/**",
					".git/**",
					"*.log",
					"coverage/**",
					".next/**",
					".nuxt/**",
				],
				maxFileSize: 2 * 1024 * 1024, // 2MB
				followSymlinks: false,
				analyzeComplexity: true,
				extractDocumentation: true,
				trackUsages: true,
			};

			const finalOptions = { ...defaultOptions, ...options };

			// Get all files to analyze
			const files = await this.getFilesToIndex(finalOptions);
			logger.info(`📁 Found ${files.length} files to analyze`);

			// Analyze project metadata
			const projectMetadata = await this.analyzeProjectMetadata();

			// Extract code elements from files
			const elements: CodeElement[] = [];
			let processedFiles = 0;

			for (const file of files) {
				try {
					const fileElements = await this.analyzeFile(file, finalOptions);
					elements.push(...fileElements);
					processedFiles++;

					if (processedFiles % 50 === 0) {
						logger.info(`📈 Processed ${processedFiles}/${files.length} files`);
					}
				} catch (error) {
					logger.warn(`Failed to analyze file ${file}:`, error);
				}
			}

			// Analyze code patterns and relationships
			const patterns = this.analyzeCodePatterns(elements);
			const dependencies = await this.analyzeDependencies();

			// Create project index
			this.projectIndex = ProjectIndexSchema.parse({
				projectRoot: this.projectRoot,
				indexedAt: new Date(),
				totalFiles: files.length,
				totalElements: elements.length,
				fileExtensions: this.getUniqueExtensions(files),
				framework: projectMetadata.framework,
				language: projectMetadata.language,
				elements,
				dependencies,
				patterns,
				complianceLevel: process.env.NSM_CLASSIFICATION as any || "OPEN",
			});

			// Save index to file
			await this.saveIndex();

			const indexingTime = Date.now() - startTime;
			logger.success(`✅ Project index created successfully in ${indexingTime}ms`);
			logger.info(`📊 Indexed ${elements.length} code elements across ${files.length} files`);

			return this.projectIndex;
		} catch (error) {
			logger.error("Failed to create project index:", error);
			throw error;
		}
	}

	/**
	 * Load existing project index
	 */
	async loadIndex(): Promise<ProjectIndex | null> {
		try {
			const indexContent = await fs.readFile(this.indexFilePath, "utf-8");
			const rawIndex = JSON.parse(indexContent);
			
			// Parse dates from JSON
			rawIndex.indexedAt = new Date(rawIndex.indexedAt);
			rawIndex.elements = rawIndex.elements.map((element: any) => ({
				...element,
				lastModified: new Date(element.lastModified),
			}));

			this.projectIndex = ProjectIndexSchema.parse(rawIndex);
			logger.info(`📚 Loaded project index with ${this.projectIndex.totalElements} elements`);
			
			return this.projectIndex;
		} catch (error) {
			logger.warn("No existing project index found or failed to load");
			return null;
		}
	}

	/**
	 * Update index incrementally
	 */
	async updateIndex(changedFiles: string[]): Promise<ProjectIndex> {
		if (!this.projectIndex) {
			return this.createIndex();
		}

		logger.info(`🔄 Incrementally updating index for ${changedFiles.length} changed files`);

		try {
			// Remove elements from changed files
			this.projectIndex.elements = this.projectIndex.elements.filter(
				element => !changedFiles.includes(element.filePath)
			);

			// Re-analyze changed files
			for (const file of changedFiles) {
				try {
					const fileElements = await this.analyzeFile(file);
					this.projectIndex.elements.push(...fileElements);
				} catch (error) {
					logger.warn(`Failed to update analysis for file ${file}:`, error);
				}
			}

			// Update metadata
			this.projectIndex.indexedAt = new Date();
			this.projectIndex.totalElements = this.projectIndex.elements.length;

			// Re-analyze patterns
			this.projectIndex.patterns = this.analyzeCodePatterns(this.projectIndex.elements);

			await this.saveIndex();
			logger.success("✅ Index updated successfully");

			return this.projectIndex;
		} catch (error) {
			logger.error("Failed to update project index:", error);
			throw error;
		}
	}

	/**
	 * Get code elements by type
	 */
	getElementsByType(type: CodeElement["type"]): CodeElement[] {
		if (!this.projectIndex) return [];
		return this.projectIndex.elements.filter(el => el.type === type);
	}

	/**
	 * Search code elements by name or pattern
	 */
	searchElements(query: string, type?: CodeElement["type"]): CodeElement[] {
		if (!this.projectIndex) return [];

		const searchRegex = new RegExp(query, "i");
		return this.projectIndex.elements.filter(element => {
			const matchesType = !type || element.type === type;
			const matchesName = searchRegex.test(element.name);
			return matchesType && matchesName;
		});
	}

	/**
	 * Get project index statistics
	 */
	getIndexStats(): {
		totalFiles: number;
		totalElements: number;
		elementsByType: Record<string, number>;
		topPatterns: string[];
		complexityDistribution: Record<string, number>;
	} {
		if (!this.projectIndex) {
			return {
				totalFiles: 0,
				totalElements: 0,
				elementsByType: {},
				topPatterns: [],
				complexityDistribution: {},
			};
		}

		const elementsByType = this.projectIndex.elements.reduce((acc, element) => {
			acc[element.type] = (acc[element.type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const complexityDistribution = this.projectIndex.elements.reduce((acc, element) => {
			const complexity = element.complexity <= 5 ? "low" : 
							 element.complexity <= 10 ? "medium" : "high";
			acc[complexity] = (acc[complexity] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			totalFiles: this.projectIndex.totalFiles,
			totalElements: this.projectIndex.totalElements,
			elementsByType,
			topPatterns: this.projectIndex.patterns.slice(0, 10),
			complexityDistribution,
		};
	}

	/**
	 * Get current project index
	 */
	getProjectIndex(): ProjectIndex | null {
		return this.projectIndex;
	}

	/**
	 * Check if index needs refresh
	 */
	async needsRefresh(): Promise<boolean> {
		if (!this.projectIndex) return true;

		// Check if index is older than 1 hour
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		if (this.projectIndex.indexedAt < oneHourAgo) {
			return true;
		}

		// Check if package.json has changed
		try {
			const packageJsonPath = join(this.projectRoot, "package.json");
			const stats = await fs.stat(packageJsonPath);
			return stats.mtime > this.projectIndex.indexedAt;
		} catch {
			return false;
		}
	}

	// Private methods

	private async getFilesToIndex(options: IndexingOptions): Promise<string[]> {
		const { glob } = await import("glob");
		const files: string[] = [];

		for (const pattern of options.includePatterns || []) {
			const matchedFiles = await glob(pattern, {
				cwd: this.projectRoot,
				ignore: options.excludePatterns,
				dot: false,
				follow: options.followSymlinks,
			});

			files.push(...matchedFiles);
		}

		// Filter by file size
		const filteredFiles: string[] = [];
		for (const file of files) {
			try {
				const filePath = join(this.projectRoot, file);
				const stats = await fs.stat(filePath);
				
				if (!options.maxFileSize || stats.size <= options.maxFileSize) {
					filteredFiles.push(file);
				}
			} catch (error) {
				logger.warn(`Failed to check file stats for ${file}:`, error);
			}
		}

		return [...new Set(filteredFiles)]; // Remove duplicates
	}

	private async analyzeFile(
		filePath: string,
		options: IndexingOptions = {}
	): Promise<CodeElement[]> {
		const fullPath = join(this.projectRoot, filePath);
		
		try {
			const content = await fs.readFile(fullPath, "utf-8");
			const stats = await fs.stat(fullPath);
			const elements: CodeElement[] = [];

			// Analyze based on file extension
			const extension = filePath.split(".").pop();
			
			switch (extension) {
				case "ts":
				case "tsx":
				case "js":
				case "jsx":
					elements.push(...this.analyzeTypeScriptFile(filePath, content, stats.mtime));
					break;
				case "vue":
					elements.push(...this.analyzeVueFile(filePath, content, stats.mtime));
					break;
				case "svelte":
					elements.push(...this.analyzeSvelteFile(filePath, content, stats.mtime));
					break;
				case "json":
					elements.push(...this.analyzeJsonFile(filePath, content, stats.mtime));
					break;
			}

			return elements;
		} catch (error) {
			logger.warn(`Failed to analyze file ${filePath}:`, error);
			return [];
		}
	}

	private analyzeTypeScriptFile(
		filePath: string,
		content: string,
		lastModified: Date
	): CodeElement[] {
		const elements: CodeElement[] = [];
		const lines = content.split("\n");

		// Simple regex-based analysis (in a real implementation, use TypeScript AST)
		const patterns = {
			class: /^export\s+class\s+(\w+)/,
			interface: /^export\s+interface\s+(\w+)/,
			function: /^export\s+(?:function|const)\s+(\w+)/,
			component: /^export\s+const\s+(\w+)\s*[=:][^=]*(?:React\.FC|JSX\.Element)/,
			service: /^export\s+class\s+(\w+Service)/,
			type: /^export\s+type\s+(\w+)/,
		};

		lines.forEach((line, index) => {
			for (const [type, pattern] of Object.entries(patterns)) {
				const match = line.match(pattern);
				if (match) {
					elements.push({
						id: `${filePath}:${match[1]}`,
						type: type as CodeElement["type"],
						name: match[1],
						filePath,
						startLine: index + 1,
						endLine: index + 1, // Simplified
						isExported: line.includes("export"),
						dependencies: [],
						usages: [],
						complexity: this.calculateComplexity(content, match[1]),
						lastModified,
					});
				}
			}
		});

		return elements;
	}

	private analyzeVueFile(
		filePath: string,
		content: string,
		lastModified: Date
	): CodeElement[] {
		// Extract component name from file path
		const componentName = filePath.split("/").pop()?.replace(".vue", "") || "UnknownComponent";
		
		return [{
			id: `${filePath}:${componentName}`,
			type: "component",
			name: componentName,
			filePath,
			startLine: 1,
			endLine: content.split("\n").length,
			isExported: true,
			dependencies: [],
			usages: [],
			complexity: this.calculateComplexity(content, componentName),
			lastModified,
		}];
	}

	private analyzeSvelteFile(
		filePath: string,
		content: string,
		lastModified: Date
	): CodeElement[] {
		// Extract component name from file path
		const componentName = filePath.split("/").pop()?.replace(".svelte", "") || "UnknownComponent";
		
		return [{
			id: `${filePath}:${componentName}`,
			type: "component",
			name: componentName,
			filePath,
			startLine: 1,
			endLine: content.split("\n").length,
			isExported: true,
			dependencies: [],
			usages: [],
			complexity: this.calculateComplexity(content, componentName),
			lastModified,
		}];
	}

	private analyzeJsonFile(
		filePath: string,
		content: string,
		lastModified: Date
	): CodeElement[] {
		// Only analyze package.json and configuration files
		if (!filePath.includes("package.json") && !filePath.includes("config")) {
			return [];
		}

		const fileName = filePath.split("/").pop()?.replace(".json", "") || "config";
		
		return [{
			id: `${filePath}:${fileName}`,
			type: "constant",
			name: fileName,
			filePath,
			startLine: 1,
			endLine: content.split("\n").length,
			isExported: false,
			dependencies: [],
			usages: [],
			complexity: 1,
			lastModified,
		}];
	}

	private calculateComplexity(content: string, elementName: string): number {
		// Simple complexity calculation based on cyclomatic complexity indicators
		const complexityIndicators = [
			/if\s*\(/g,
			/for\s*\(/g,
			/while\s*\(/g,
			/switch\s*\(/g,
			/catch\s*\(/g,
			/\?\s*[^\s]/g, // Ternary operator
		];

		let complexity = 1; // Base complexity
		
		for (const indicator of complexityIndicators) {
			const matches = content.match(indicator);
			if (matches) {
				complexity += matches.length;
			}
		}

		return complexity;
	}

	private analyzeCodePatterns(elements: CodeElement[]): string[] {
		const patterns: string[] = [];

		// Analyze naming patterns
		const componentElements = elements.filter(el => el.type === "component");
		if (componentElements.length > 0) {
			const hasPascalCase = componentElements.every(el => /^[A-Z][a-zA-Z]+$/.test(el.name));
			if (hasPascalCase) patterns.push("PascalCase component naming");
		}

		// Analyze file organization patterns
		const serviceElements = elements.filter(el => el.type === "service");
		if (serviceElements.length > 0) {
			const hasServiceSuffix = serviceElements.every(el => el.name.endsWith("Service"));
			if (hasServiceSuffix) patterns.push("Service suffix pattern");
		}

		// Analyze export patterns
		const exportedElements = elements.filter(el => el.isExported);
		const exportRatio = exportedElements.length / elements.length;
		if (exportRatio > 0.8) patterns.push("High export visibility");

		return patterns;
	}

	private async analyzeProjectMetadata(): Promise<{
		framework?: string;
		language?: string;
	}> {
		try {
			const packageJsonPath = join(this.projectRoot, "package.json");
			const packageContent = await fs.readFile(packageJsonPath, "utf-8");
			const packageData = JSON.parse(packageContent);

			const deps = { ...packageData.dependencies, ...packageData.devDependencies };

			// Detect framework
			const framework = this.detectFramework(deps);
			
			// Detect language
			const language = deps.typescript || deps["@types/node"] ? "typescript" : 
							 Object.keys(deps).some(dep => dep.includes("babel")) ? "javascript" : 
							 "unknown";

			return { framework, language };
		} catch {
			return {};
		}
	}

	private detectFramework(dependencies: Record<string, string>): string | undefined {
		if (dependencies.next) return "nextjs";
		if (dependencies.react) return "react";
		if (dependencies.vue) return "vue";
		if (dependencies["@angular/core"]) return "angular";
		if (dependencies.svelte) return "svelte";
		if (dependencies.express) return "express";
		if (dependencies["@nestjs/core"]) return "nestjs";
		return undefined;
	}

	private async analyzeDependencies(): Promise<Record<string, string>> {
		try {
			const packageJsonPath = join(this.projectRoot, "package.json");
			const packageContent = await fs.readFile(packageJsonPath, "utf-8");
			const packageData = JSON.parse(packageContent);
			return { ...packageData.dependencies, ...packageData.devDependencies };
		} catch {
			return {};
		}
	}

	private getUniqueExtensions(files: string[]): string[] {
		const extensions = new Set<string>();
		files.forEach(file => {
			const ext = file.split(".").pop();
			if (ext) extensions.add(ext);
		});
		return Array.from(extensions);
	}

	private async saveIndex(): Promise<void> {
		if (!this.projectIndex) return;

		const indexDir = join(this.projectRoot, ".xaheen");
		
		try {
			await fs.mkdir(indexDir, { recursive: true });
		} catch {
			// Directory might already exist
		}

		await fs.writeFile(
			this.indexFilePath,
			JSON.stringify(this.projectIndex, null, 2),
			"utf-8"
		);

		logger.info(`💾 Project index saved to ${this.indexFilePath}`);
	}
}

/**
 * Create singleton context indexer instance
 */
export const mcpContextIndexer = new MCPContextIndexerService();
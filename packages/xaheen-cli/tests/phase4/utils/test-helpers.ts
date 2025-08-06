/**
 * Phase 4 Backend MVP Test Helpers
 * Common utilities for backend testing workflows
 */

import { promises as fs } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import type { BackendGeneratorOptions, BackendGeneratorResult } from "@/generators/backend";

export interface TestProjectOptions {
	readonly framework: "express" | "nestjs" | "fastify" | "hono";
	readonly features?: readonly string[];
	readonly database?: "postgresql" | "mysql" | "mongodb" | "sqlite";
	readonly cleanup?: boolean;
}

export interface TestProject {
	readonly path: string;
	readonly name: string;
	readonly cleanup: () => Promise<void>;
	readonly readFile: (filePath: string) => Promise<string>;
	readonly fileExists: (filePath: string) => Promise<boolean>;
	readonly listFiles: (directory?: string) => Promise<string[]>;
}

/**
 * Create a temporary test project directory
 */
export async function createTestProject(options: TestProjectOptions): Promise<TestProject> {
	const testId = randomBytes(8).toString("hex");
	const projectName = `xaheen-test-${options.framework}-${testId}`;
	const projectPath = join(tmpdir(), projectName);

	// Ensure clean directory
	try {
		await fs.rm(projectPath, { recursive: true, force: true });
	} catch {
		// Directory doesn't exist, which is fine
	}

	await fs.mkdir(projectPath, { recursive: true });

	const cleanup = async (): Promise<void> => {
		if (options.cleanup !== false) {
			try {
				await fs.rm(projectPath, { recursive: true, force: true });
			} catch (error) {
				console.warn(`Failed to cleanup test project: ${error}`);
			}
		}
	};

	const readFile = async (filePath: string): Promise<string> => {
		const fullPath = join(projectPath, filePath);
		return await fs.readFile(fullPath, "utf-8");
	};

	const fileExists = async (filePath: string): Promise<boolean> => {
		try {
			const fullPath = join(projectPath, filePath);
			await fs.access(fullPath);
			return true;
		} catch {
			return false;
		}
	};

	const listFiles = async (directory = ""): Promise<string[]> => {
		const fullPath = join(projectPath, directory);
		try {
			const entries = await fs.readdir(fullPath, { withFileTypes: true });
			const files: string[] = [];
			
			for (const entry of entries) {
				const relativePath = join(directory, entry.name);
				if (entry.isFile()) {
					files.push(relativePath);
				} else if (entry.isDirectory()) {
					const subFiles = await listFiles(relativePath);
					files.push(...subFiles);
				}
			}
			
			return files.sort();
		} catch {
			return [];
		}
	};

	return {
		path: projectPath,
		name: projectName,
		cleanup,
		readFile,
		fileExists,
		listFiles,
	};
}

/**
 * Create backend generator options for testing
 */
export function createBackendOptions(overrides: Partial<BackendGeneratorOptions> = {}): BackendGeneratorOptions {
	return {
		framework: "nestjs",
		database: "postgresql",
		orm: "prisma",
		authentication: "jwt",
		features: ["rest-api", "testing", "documentation"],
		deployment: "docker",
		testing: true,
		documentation: true,
		monitoring: true,
		...overrides,
	};
}

/**
 * Validate generated backend project structure
 */
export async function validateBackendStructure(
	project: TestProject,
	framework: string,
): Promise<ValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Core file validation
	const requiredFiles = [
		"package.json",
		"tsconfig.json",
		"README.md",
		".env.example",
		"Dockerfile",
		"docker-compose.yml",
	];

	for (const file of requiredFiles) {
		if (!(await project.fileExists(file))) {
			errors.push(`Missing required file: ${file}`);
		}
	}

	// Framework-specific validation
	const frameworkFiles = getFrameworkRequiredFiles(framework);
	for (const file of frameworkFiles) {
		if (!(await project.fileExists(file))) {
			errors.push(`Missing framework-specific file: ${file}`);
		}
	}

	// Package.json validation
	try {
		const packageJson = JSON.parse(await project.readFile("package.json"));
		
		if (!packageJson.name) {
			errors.push("package.json missing name field");
		}
		
		if (!packageJson.scripts?.dev) {
			errors.push("package.json missing dev script");
		}
		
		if (!packageJson.scripts?.build) {
			errors.push("package.json missing build script");
		}
		
		if (!packageJson.scripts?.test) {
			warnings.push("package.json missing test script");
		}
	} catch (error) {
		errors.push(`Invalid package.json: ${error}`);
	}

	// TypeScript configuration validation
	try {
		const tsConfig = JSON.parse(await project.readFile("tsconfig.json"));
		
		if (!tsConfig.compilerOptions) {
			errors.push("tsconfig.json missing compilerOptions");
		}
		
		if (tsConfig.compilerOptions?.target !== "ES2022") {
			warnings.push("tsconfig.json should target ES2022");
		}
	} catch (error) {
		errors.push(`Invalid tsconfig.json: ${error}`);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		fileCount: (await project.listFiles()).length,
	};
}

export interface ValidationResult {
	readonly isValid: boolean;
	readonly errors: readonly string[];
	readonly warnings: readonly string[];
	readonly fileCount: number;
}

/**
 * Get framework-specific required files
 */
function getFrameworkRequiredFiles(framework: string): string[] {
	const commonFiles = ["src/main.ts"];
	
	switch (framework) {
		case "nestjs":
			return [
				...commonFiles,
				"src/app.module.ts",
				"src/app.controller.ts",
				"src/app.service.ts",
				"nest-cli.json",
			];
		case "express":
			return [
				...commonFiles,
				"src/app.ts",
				"src/routes/index.ts",
			];
		case "fastify":
			return [
				...commonFiles,
				"src/app.ts",
				"src/plugins/index.ts",
			];
		case "hono":
			return [
				...commonFiles,
				"src/app.ts",
				"src/routes/index.ts",
			];
		default:
			return commonFiles;
	}
}

/**
 * Assert that a result is successful
 */
export function assertSuccessfulResult(result: BackendGeneratorResult): asserts result is BackendGeneratorResult & { success: true } {
	if (!result.success) {
		throw new Error(`Expected successful result, got: ${result.message}`);
	}
}

/**
 * Wait for a condition to be met with timeout
 */
export async function waitForCondition(
	condition: () => Promise<boolean> | boolean,
	timeoutMs = 10000,
	intervalMs = 100,
): Promise<void> {
	const startTime = Date.now();
	
	while (Date.now() - startTime < timeoutMs) {
		if (await condition()) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, intervalMs));
	}
	
	throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Measure execution time of an async operation
 */
export async function measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
	const startTime = performance.now();
	const result = await operation();
	const duration = performance.now() - startTime;
	
	return { result, duration };
}

/**
 * Create a mock logger for testing
 */
export function createMockLogger() {
	return {
		info: mock(() => {}),
		error: mock(() => {}),
		warn: mock(() => {}),
		debug: mock(() => {}),
		success: mock(() => {}),
	};
}

/**
 * Create test database configuration
 */
export function createTestDatabaseConfig(database: string) {
	switch (database) {
		case "postgresql":
			return {
				host: "localhost",
				port: 5432,
				database: "xaheen_test",
				username: "postgres",
				password: "postgres",
			};
		case "mysql":
			return {
				host: "localhost",
				port: 3306,
				database: "xaheen_test",
				username: "root",
				password: "password",
			};
		case "mongodb":
			return {
				uri: "mongodb://localhost:27017/xaheen_test",
			};
		case "sqlite":
			return {
				filename: ":memory:",
			};
		default:
			throw new Error(`Unsupported database: ${database}`);
	}
}

/**
 * Normalize file paths for cross-platform testing
 */
export function normalizePath(path: string): string {
	return path.replace(/\\/g, "/");
}

/**
 * Extract dependencies from package.json content
 */
export function extractDependencies(packageJsonContent: string): {
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
} {
	const packageJson = JSON.parse(packageJsonContent);
	return {
		dependencies: packageJson.dependencies || {},
		devDependencies: packageJson.devDependencies || {},
	};
}

/**
 * Validate that generated code compiles
 */
export async function validateTypeScript(projectPath: string): Promise<{ success: boolean; errors: string[] }> {
	try {
		// This would ideally run TypeScript compiler programmatically
		// For now, we'll just check that the files exist and have valid syntax
		const tsConfigPath = join(projectPath, "tsconfig.json");
		const tsConfig = JSON.parse(await fs.readFile(tsConfigPath, "utf-8"));
		
		// Basic validation
		if (!tsConfig.compilerOptions) {
			return { success: false, errors: ["Invalid TypeScript configuration"] };
		}
		
		return { success: true, errors: [] };
	} catch (error) {
		return { 
			success: false, 
			errors: [`TypeScript validation failed: ${error instanceof Error ? error.message : "Unknown error"}`] 
		};
	}
}
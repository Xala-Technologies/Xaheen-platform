/**
 * Test Helpers and Utilities
 *
 * Comprehensive utilities for testing the Xaheen CLI including filesystem mocking,
 * command execution, and assertion helpers.
 */

import { tmpdir } from "node:os";
import path from "node:path";
import { type ExecaChildProcess, execa } from "execa";
import fs from "fs-extra";
import stripAnsi from "strip-ansi";
import tmp from "tmp";
import { type MockedFunction, vi } from "vitest";
import type { CLICommand, CLIOptions } from "../types/index.js";

// Mock filesystem utilities
export interface MockFileSystem {
	[path: string]: string | MockFileSystem;
}

export class TestFileSystem {
	private mockFs: any = null;

	constructor() {
		this.mockFs = vi.hoisted(() => import("mock-fs"));
	}

	async mock(files: MockFileSystem): Promise<void> {
		const mockFs = await import("mock-fs");
		mockFs.default(files);
	}

	async restore(): Promise<void> {
		const mockFs = await import("mock-fs");
		mockFs.default.restore();
	}

	async createTempDir(prefix: string = "xaheen-test-"): Promise<string> {
		return new Promise((resolve, reject) => {
			tmp.dir({ prefix, unsafeCleanup: true }, (err, name, cleanup) => {
				if (err) {
					reject(err);
				} else {
					resolve(name);
				}
			});
		});
	}

	async copyFixtures(fixturesDir: string, targetDir: string): Promise<void> {
		await fs.ensureDir(targetDir);
		await fs.copy(fixturesDir, targetDir);
	}
}

// Command execution helpers
export class CLITestRunner {
	constructor(private cliPath: string = "dist/index.js") {}

	async runCommand(
		args: string[],
		options: {
			cwd?: string;
			env?: Record<string, string>;
			timeout?: number;
			expectError?: boolean;
		} = {},
	): Promise<{
		stdout: string;
		stderr: string;
		exitCode: number;
		duration: number;
	}> {
		const startTime = Date.now();

		try {
			const result = await execa("node", [this.cliPath, ...args], {
				cwd: options.cwd || process.cwd(),
				env: {
					...process.env,
					XAHEEN_NO_BANNER: "true",
					NODE_ENV: "test",
					...options.env,
				},
				timeout: options.timeout || 30000,
				all: true,
			});

			return {
				stdout: stripAnsi(result.stdout || ""),
				stderr: stripAnsi(result.stderr || ""),
				exitCode: result.exitCode || 0,
				duration: Date.now() - startTime,
			};
		} catch (error: any) {
			if (options.expectError) {
				return {
					stdout: stripAnsi(error.stdout || ""),
					stderr: stripAnsi(error.stderr || ""),
					exitCode: error.exitCode || 1,
					duration: Date.now() - startTime,
				};
			}
			throw error;
		}
	}

	async runInteractiveCommand(
		args: string[],
		inputs: string[],
		options: {
			cwd?: string;
			env?: Record<string, string>;
			timeout?: number;
		} = {},
	): Promise<{
		stdout: string;
		stderr: string;
		exitCode: number;
	}> {
		const child = execa("node", [this.cliPath, ...args], {
			cwd: options.cwd || process.cwd(),
			env: {
				...process.env,
				XAHEEN_NO_BANNER: "true",
				NODE_ENV: "test",
				...options.env,
			},
			timeout: options.timeout || 30000,
		});

		// Send inputs to the process
		let inputIndex = 0;
		const sendNextInput = () => {
			if (inputIndex < inputs.length && child.stdin) {
				child.stdin.write(`${inputs[inputIndex]}\n`);
				inputIndex++;
				setTimeout(sendNextInput, 100);
			} else if (child.stdin) {
				child.stdin.end();
			}
		};

		setTimeout(sendNextInput, 100);

		const result = await child;
		return {
			stdout: stripAnsi(result.stdout || ""),
			stderr: stripAnsi(result.stderr || ""),
			exitCode: result.exitCode || 0,
		};
	}
}

// Mock builders
export class MockBuilder {
	static createCLICommand(overrides: Partial<CLICommand> = {}): CLICommand {
		return {
			domain: "project",
			action: "create",
			target: "test-project",
			arguments: { target: "test-project" },
			options: {},
			...overrides,
		};
	}

	static createCLIOptions(overrides: Partial<CLIOptions> = {}): CLIOptions {
		return {
			verbose: false,
			dryRun: false,
			config: undefined,
			...overrides,
		};
	}

	static createMockFileSystem(): MockFileSystem {
		return {
			"package.json": JSON.stringify({
				name: "test-project",
				version: "1.0.0",
				type: "module",
			}),
			src: {
				"index.ts": 'console.log("Hello World");',
			},
			tests: {},
			".gitignore": "node_modules\n.env\n",
		};
	}

	static createNextJsProject(): MockFileSystem {
		return {
			"package.json": JSON.stringify({
				name: "test-nextjs-project",
				version: "1.0.0",
				scripts: {
					dev: "next dev",
					build: "next build",
					start: "next start",
				},
				dependencies: {
					next: "^14.0.0",
					react: "^18.0.0",
					"react-dom": "^18.0.0",
				},
			}),
			"next.config.js": "module.exports = {};",
			src: {
				app: {
					"layout.tsx": `export default function RootLayout({
            children,
          }: {
            children: React.ReactNode
          }) {
            return (
              <html lang="en">
                <body>{children}</body>
              </html>
            )
          }`,
					"page.tsx":
						"export default function Home() { return <div>Hello</div>; }",
				},
			},
			public: {},
		};
	}
}

// Assertion helpers
export class TestAssertions {
	static async assertFileExists(filePath: string): Promise<void> {
		const exists = await fs.pathExists(filePath);
		if (!exists) {
			throw new Error(`Expected file to exist: ${filePath}`);
		}
	}

	static async assertFileContains(
		filePath: string,
		content: string,
	): Promise<void> {
		await this.assertFileExists(filePath);
		const fileContent = await fs.readFile(filePath, "utf8");
		if (!fileContent.includes(content)) {
			throw new Error(`Expected file ${filePath} to contain: ${content}`);
		}
	}

	static async assertDirectoryExists(dirPath: string): Promise<void> {
		const stat = await fs.stat(dirPath);
		if (!stat.isDirectory()) {
			throw new Error(`Expected directory to exist: ${dirPath}`);
		}
	}

	static async assertValidPackageJson(filePath: string): Promise<void> {
		await this.assertFileExists(filePath);
		const content = await fs.readJson(filePath);

		if (!content.name) {
			throw new Error("package.json must have a name field");
		}

		if (!content.version) {
			throw new Error("package.json must have a version field");
		}
	}

	static assertCommandOutput(
		output: string,
		expectedPatterns: (string | RegExp)[],
	): void {
		for (const pattern of expectedPatterns) {
			if (typeof pattern === "string") {
				if (!output.includes(pattern)) {
					throw new Error(
						`Expected output to contain: ${pattern}\nActual output: ${output}`,
					);
				}
			} else {
				if (!pattern.test(output)) {
					throw new Error(
						`Expected output to match pattern: ${pattern}\nActual output: ${output}`,
					);
				}
			}
		}
	}

	static assertExitCode(actual: number, expected: number): void {
		if (actual !== expected) {
			throw new Error(`Expected exit code ${expected}, got ${actual}`);
		}
	}
}

// Performance measurement utilities
export class PerformanceTracker {
	private measurements: Map<string, number[]> = new Map();

	startMeasurement(name: string): () => number {
		const start = performance.now();
		return () => {
			const duration = performance.now() - start;
			this.recordMeasurement(name, duration);
			return duration;
		};
	}

	recordMeasurement(name: string, duration: number): void {
		if (!this.measurements.has(name)) {
			this.measurements.set(name, []);
		}
		this.measurements.get(name)!.push(duration);
	}

	getStats(name: string): {
		count: number;
		min: number;
		max: number;
		avg: number;
		median: number;
	} | null {
		const measurements = this.measurements.get(name);
		if (!measurements || measurements.length === 0) {
			return null;
		}

		const sorted = [...measurements].sort((a, b) => a - b);
		const sum = measurements.reduce((a, b) => a + b, 0);

		return {
			count: measurements.length,
			min: sorted[0],
			max: sorted[sorted.length - 1],
			avg: sum / measurements.length,
			median: sorted[Math.floor(sorted.length / 2)],
		};
	}

	clear(): void {
		this.measurements.clear();
	}

	getAllStats(): Record<string, ReturnType<PerformanceTracker["getStats"]>> {
		const stats: Record<
			string,
			ReturnType<PerformanceTracker["getStats"]>
		> = {};
		for (const [name] of this.measurements) {
			stats[name] = this.getStats(name);
		}
		return stats;
	}
}

// Test fixtures manager
export class TestFixtures {
	static readonly FIXTURES_DIR = path.resolve(__dirname, "fixtures");

	static async getFixture(name: string): Promise<string> {
		const fixturePath = path.join(this.FIXTURES_DIR, name);
		return fs.readFile(fixturePath, "utf8");
	}

	static async getJsonFixture<T = any>(name: string): Promise<T> {
		const content = await this.getFixture(name);
		return JSON.parse(content);
	}

	static async createFixtureProject(
		name: string,
		targetDir: string,
	): Promise<void> {
		const fixturePath = path.join(this.FIXTURES_DIR, name);
		await fs.ensureDir(targetDir);
		await fs.copy(fixturePath, targetDir);
	}
}

// Export all utilities as a default export for convenience
export const testUtils = {
	fs: TestFileSystem,
	cli: CLITestRunner,
	mock: MockBuilder,
	assert: TestAssertions,
	perf: PerformanceTracker,
	fixtures: TestFixtures,
};

export default testUtils;

/**
 * Test Utilities and Helpers
 *
 * Common utilities for testing CLI v2 functionality.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { vi } from "vitest";

export interface MockProject {
	path: string;
	cleanup: () => Promise<void>;
}

/**
 * Creates a temporary test project with the specified structure
 */
export async function createMockProject(
	structure: Record<string, string | object> = {},
): Promise<MockProject> {
	const tempDir = path.join(
		tmpdir(),
		`xaheen-test-${randomBytes(8).toString("hex")}`,
	);
	await fs.ensureDir(tempDir);

	// Create default project structure
	const defaultStructure = {
		"package.json": JSON.stringify(
			{
				name: "test-project",
				version: "1.0.0",
				scripts: {
					dev: "next dev",
					build: "next build",
				},
				dependencies: {
					next: "^14.0.0",
					react: "^18.0.0",
					"react-dom": "^18.0.0",
				},
				devDependencies: {
					"@types/node": "^20.0.0",
					typescript: "^5.0.0",
				},
			},
			null,
			2,
		),
		"tsconfig.json": JSON.stringify(
			{
				compilerOptions: {
					target: "es5",
					lib: ["dom", "dom.iterable", "es6"],
					allowJs: true,
					skipLibCheck: true,
					strict: true,
					forceConsistentCasingInFileNames: true,
					noEmit: true,
					esModuleInterop: true,
					module: "esnext",
					moduleResolution: "node",
					resolveJsonModule: true,
					isolatedModules: true,
					jsx: "preserve",
					incremental: true,
					plugins: [
						{
							name: "next",
						},
					],
					paths: {
						"@/*": ["./src/*"],
					},
				},
				include: [
					"next-env.d.ts",
					"**/*.ts",
					"**/*.tsx",
					".next/types/**/*.ts",
				],
				exclude: ["node_modules"],
			},
			null,
			2,
		),
		"next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`,
		".env.example": `DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000`,
		"src/app/page.tsx": `export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
    </main>
  )
}`,
		"src/app/layout.tsx": `export default function RootLayout({
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
		...structure,
	};

	// Create files and directories
	for (const [filePath, content] of Object.entries(defaultStructure)) {
		const fullPath = path.join(tempDir, filePath);
		await fs.ensureDir(path.dirname(fullPath));

		if (typeof content === "string") {
			await fs.writeFile(fullPath, content);
		} else {
			await fs.writeFile(fullPath, JSON.stringify(content, null, 2));
		}
	}

	return {
		path: tempDir,
		cleanup: async () => {
			await fs.remove(tempDir);
		},
	};
}

/**
 * Mock file system operations for testing
 */
export function mockFileSystem() {
	const mockFs = {
		pathExists: vi.fn(),
		readFile: vi.fn(),
		writeFile: vi.fn(),
		readJson: vi.fn(),
		writeJson: vi.fn(),
		readdir: vi.fn(),
		ensureDir: vi.fn(),
		copy: vi.fn(),
		remove: vi.fn(),
	};

	vi.mock("fs-extra", () => mockFs);

	return mockFs;
}

/**
 * Mock external commands (git, npm, etc.)
 */
export function mockExeca() {
	const mockExeca = vi.fn();

	vi.mock("execa", () => ({
		execa: mockExeca,
	}));

	return mockExeca;
}

/**
 * Create a mock service registry for testing
 */
export function createMockServiceRegistry() {
	return {
		initialize: vi.fn(),
		getTemplate: vi.fn(),
		listTemplates: vi.fn(),
		registerTemplate: vi.fn(),
	};
}

/**
 * Create mock project info for testing
 */
export function createMockProjectInfo(overrides: Partial<any> = {}) {
	return {
		isValid: true,
		name: "test-project",
		path: "/test/project",
		framework: "next",
		backend: null,
		database: null,
		platform: "web",
		packageManager: "npm",
		typescript: true,
		git: true,
		services: [],
		dependencies: {
			next: "^14.0.0",
			react: "^18.0.0",
		},
		devDependencies: {
			"@types/node": "^20.0.0",
			typescript: "^5.0.0",
		},
		scripts: {
			dev: "next dev",
			build: "next build",
		},
		...overrides,
	};
}

/**
 * Suppress console output during tests
 */
export function suppressConsoleOutput() {
	const originalConsole = { ...console };

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "info").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	return originalConsole;
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock command for testing
 */
export function createMockCommand() {
	return {
		name: vi.fn().mockReturnThis(),
		description: vi.fn().mockReturnThis(),
		argument: vi.fn().mockReturnThis(),
		option: vi.fn().mockReturnThis(),
		action: vi.fn().mockReturnThis(),
		addCommand: vi.fn().mockReturnThis(),
		parse: vi.fn().mockReturnThis(),
		opts: vi.fn().mockReturnValue({}),
		args: [],
	};
}

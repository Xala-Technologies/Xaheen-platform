/**
 * Test Utilities and Helpers
 *
 * Common utilities for testing CLI v2 functionality.
 * Extended for EPIC 7: Integration and Testing support.
 *
 * @author Backend Expert Agent & Database Architect
 * @since 2025-01-03
 */

import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { vi } from "vitest";
import { execa } from "execa";
import { performance } from "perf_hooks";

export interface MockProject {
	path: string;
	cleanup: () => Promise<void>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: {
    linesOfCode: number;
    fileSize: number;
    complexity: number;
  };
}

export interface ValidationError {
  type: 'syntax' | 'type' | 'lint' | 'accessibility' | 'performance' | 'security';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  fix?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  suggestion?: string;
}

export interface CompilationResult {
  success: boolean;
  errors: CompilationError[];
  warnings: CompilationWarning[];
  outputPath?: string;
  stats?: {
    files: number;
    duration: number;
    bundleSize?: number;
  };
}

export interface CompilationError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

export interface CompilationWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
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

/**
 * Creates an isolated test project with necessary dependencies and configuration
 * Enhanced version for EPIC 7 testing
 */
export async function createTestProject(projectName: string): Promise<string> {
  const testOutputDir = path.resolve(__dirname, '../../../test-output');
  const projectId = `${projectName}-${randomBytes(4).toString('hex')}`;
  const projectPath = path.join(testOutputDir, projectId);

  // Ensure test output directory exists
  await fs.ensureDir(testOutputDir);

  // Create project directory structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'src/components'));
  await fs.ensureDir(path.join(projectPath, 'src/pages'));
  await fs.ensureDir(path.join(projectPath, 'src/forms'));
  await fs.ensureDir(path.join(projectPath, 'src/layouts'));
  await fs.ensureDir(path.join(projectPath, 'src/services'));
  await fs.ensureDir(path.join(projectPath, 'src/hooks'));
  await fs.ensureDir(path.join(projectPath, 'src/utils'));
  await fs.ensureDir(path.join(projectPath, 'src/types'));
  await fs.ensureDir(path.join(projectPath, 'src/locales'));
  await fs.ensureDir(path.join(projectPath, 'src/locales/en'));
  await fs.ensureDir(path.join(projectPath, 'src/locales/nb-NO'));
  await fs.ensureDir(path.join(projectPath, 'src/locales/ar'));

  // Create package.json
  const packageJson = {
    name: projectId,
    version: '1.0.0',
    private: true,
    scripts: {
      'build': 'tsc',
      'test': 'vitest',
      'lint': 'eslint src',
      'type-check': 'tsc --noEmit'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0'
    },
    devDependencies: {
      'typescript': '^5.0.0',
      'vitest': '^1.0.0',
      'eslint': '^8.0.0',
      '@typescript-eslint/parser': '^6.0.0',
      '@typescript-eslint/eslint-plugin': '^6.0.0'
    }
  };

  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create TypeScript configuration
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['DOM', 'DOM.Iterable', 'ES6'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      module: 'ESNext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
        '@/components/*': ['src/components/*'],
        '@/pages/*': ['src/pages/*'],
        '@/utils/*': ['src/utils/*'],
        '@/types/*': ['src/types/*']
      }
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'build']
  };

  await fs.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create Xaheen CLI configuration
  const xaheenConfig = {
    platform: 'react',
    typescript: true,
    templates: {
      directory: '.xaheen/templates'
    },
    compliance: {
      norwegian: true,
      wcag: 'AAA',
      nsm: 'OPEN'
    },
    ai: {
      mcp: {
        enabled: true,
        server: 'localhost:3001'
      }
    }
  };

  await fs.ensureDir(path.join(projectPath, '.xaheen'));
  await fs.writeFile(
    path.join(projectPath, '.xaheen/config.json'),
    JSON.stringify(xaheenConfig, null, 2)
  );

  // Create basic index file
  await fs.writeFile(
    path.join(projectPath, 'src/index.ts'),
    `// Auto-generated test project\nexport const projectName = '${projectId}';\n`
  );

  return projectPath;
}

/**
 * Cleans up test project and all associated files
 */
export async function cleanupTestProject(projectPath: string): Promise<void> {
  try {
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
  } catch (error) {
    console.warn(`Failed to cleanup test project at ${projectPath}:`, error);
  }
}

/**
 * Validates generated code for syntax, type safety, and best practices
 */
export async function validateGeneratedCode(filePath: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!await fs.pathExists(filePath)) {
    errors.push({
      type: 'syntax',
      message: 'File does not exist',
      severity: 'error'
    });
    
    return {
      valid: false,
      errors,
      warnings,
      metrics: { linesOfCode: 0, fileSize: 0, complexity: 0 }
    };
  }

  const content = await fs.readFile(filePath, 'utf-8');
  const stats = await fs.stat(filePath);
  const lines = content.split('\n');
  
  // Basic syntax validation
  try {
    // Check for common syntax errors
    if (content.includes('{{unclosed')) {
      errors.push({
        type: 'syntax',
        message: 'Unclosed template tag detected',
        severity: 'error',
        fix: 'Close all template tags properly'
      });
    }

    // Check for TypeScript compliance
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      if (content.includes(': any')) {
        errors.push({
          type: 'type',
          message: 'Explicit any type detected',
          severity: 'error',
          rule: 'no-explicit-any',
          fix: 'Use specific types instead of any'
        });
      }

      if (!content.includes('interface ') && !content.includes('type ') && content.includes('Props')) {
        warnings.push({
          type: 'type',
          message: 'Component props should have TypeScript interface',
          rule: 'props-interface',
          suggestion: 'Define interface for component props'
        });
      }
    }

    // Check for accessibility
    if (content.includes('<button') && !content.includes('aria-label')) {
      warnings.push({
        type: 'accessibility',
        message: 'Button elements should have accessible labels',
        rule: 'button-name',
        suggestion: 'Add aria-label or accessible text content'
      });
    }

    // Check for performance patterns
    if (content.includes('useEffect') && !content.includes('useCallback')) {
      warnings.push({
        type: 'performance',
        message: 'Consider using useCallback for event handlers in useEffect',
        rule: 'exhaustive-deps',
        suggestion: 'Wrap event handlers with useCallback'
      });
    }

    // Check for security issues
    if (content.includes('dangerouslySetInnerHTML')) {
      errors.push({
        type: 'security',
        message: 'Potentially unsafe HTML injection',
        severity: 'warning',
        rule: 'no-danger',
        fix: 'Sanitize HTML content or use safe alternatives'
      });
    }

  } catch (syntaxError) {
    errors.push({
      type: 'syntax',
      message: `Syntax error: ${syntaxError}`,
      severity: 'error'
    });
  }

  // Calculate complexity (basic cyclomatic complexity)
  const complexity = calculateComplexity(content);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    metrics: {
      linesOfCode: lines.length,
      fileSize: stats.size,
      complexity
    }
  };
}

/**
 * Checks if generated TypeScript code compiles without errors
 */
export async function checkTypeScriptCompilation(projectPath: string): Promise<CompilationResult> {
  const errors: CompilationError[] = [];
  const warnings: CompilationWarning[] = [];
  
  try {
    const startTime = performance.now();
    
    const result = await execa('npx', ['tsc', '--noEmit', '--project', projectPath], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    const duration = performance.now() - startTime;
    
    return {
      success: true,
      errors,
      warnings,
      stats: {
        files: await countTypeScriptFiles(projectPath),
        duration
      }
    };
    
  } catch (error: any) {
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n');
    
    for (const line of lines) {
      const errorMatch = line.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
      if (errorMatch) {
        const [, file, lineNum, column, code, message] = errorMatch;
        errors.push({
          file: path.relative(projectPath, file),
          line: parseInt(lineNum),
          column: parseInt(column),
          code,
          message
        });
      }
      
      const warningMatch = line.match(/^(.+)\((\d+),(\d+)\): warning TS(\d+): (.+)$/);
      if (warningMatch) {
        const [, file, lineNum, column, code, message] = warningMatch;
        warnings.push({
          file: path.relative(projectPath, file),
          line: parseInt(lineNum),
          column: parseInt(column),
          code,
          message
        });
      }
    }
    
    return {
      success: false,
      errors,
      warnings
    };
  }
}

// Helper functions
function calculateComplexity(code: string): number {
  // Basic cyclomatic complexity calculation
  const complexityKeywords = [
    'if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'try',
    '&&', '||', '?', ':', 'forEach', 'map', 'filter', 'reduce'
  ];
  
  let complexity = 1; // Base complexity
  
  for (const keyword of complexityKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  return complexity;
}

async function countTypeScriptFiles(projectPath: string): Promise<number> {
  let count = 0;
  
  async function countInDirectory(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await countInDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        count++;
      }
    }
  }
  
  const srcPath = path.join(projectPath, 'src');
  if (await fs.pathExists(srcPath)) {
    await countInDirectory(srcPath);
  }
  
  return count;
}

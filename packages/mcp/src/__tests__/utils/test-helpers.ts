/**
 * @fileoverview Test Utilities and Helpers
 * @description Common testing utilities, mocks, and fixtures for comprehensive test coverage
 * @version 1.0.0
 */

import * as fs from "fs";
import { tmpdir } from "os";
import { join } from "path";

export interface MockProjectStructure {
	readonly root: string;
	readonly cleanup: () => void;
}

export interface TestComponentSpec {
	readonly name: string;
	readonly type: "functional" | "class";
	readonly props: Array<{
		readonly name: string;
		readonly type: string;
		readonly optional: boolean;
	}>;
	readonly content: string;
}

/**
 * Create a temporary test project with realistic structure
 */
export function createMockProject(
	name: string = "test-project",
): MockProjectStructure {
	const testDir = join(
		tmpdir(),
		`xala-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
	);
	const projectRoot = join(testDir, name);

	// Create directory structure
	fs.mkdirSync(projectRoot, { recursive: true });
	fs.mkdirSync(join(projectRoot, "src"), { recursive: true });
	fs.mkdirSync(join(projectRoot, "src", "components"), { recursive: true });
	fs.mkdirSync(join(projectRoot, "src", "pages"), { recursive: true });
	fs.mkdirSync(join(projectRoot, "src", "hooks"), { recursive: true });
	fs.mkdirSync(join(projectRoot, "tests"), { recursive: true });
	fs.mkdirSync(join(projectRoot, "node_modules"), { recursive: true });

	// Create package.json
	const packageJson = {
		name,
		version: "1.0.0",
		dependencies: {
			react: "^18.2.0",
			"@types/react": "^18.2.0",
			next: "^14.0.0",
			typescript: "^5.0.0",
		},
		devDependencies: {
			jest: "^29.0.0",
			eslint: "^8.0.0",
			"@typescript-eslint/eslint-plugin": "^6.0.0",
		},
		scripts: {
			dev: "next dev",
			build: "next build",
			test: "jest",
			lint: "eslint src/",
		},
	};
	fs.writeFileSync(
		join(projectRoot, "package.json"),
		JSON.stringify(packageJson, null, 2),
	);

	// Create tsconfig.json
	const tsConfig = {
		compilerOptions: {
			target: "es5",
			lib: ["dom", "es6"],
			allowJs: true,
			skipLibCheck: true,
			esModuleInterop: true,
			allowSyntheticDefaultImports: true,
			strict: true,
			forceConsistentCasingInFileNames: true,
			module: "esnext",
			moduleResolution: "node",
			resolveJsonModule: true,
			isolatedModules: true,
			noEmit: true,
			jsx: "react-jsx",
		},
		include: ["src/**/*"],
		exclude: ["node_modules"],
	};
	fs.writeFileSync(
		join(projectRoot, "tsconfig.json"),
		JSON.stringify(tsConfig, null, 2),
	);

	// Create sample components
	const buttonComponent = `
import React from 'react';

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
  readonly disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};
`;
	fs.writeFileSync(
		join(projectRoot, "src", "components", "Button.tsx"),
		buttonComponent,
	);

	const inputComponent = `
import React, { useState } from 'react';

interface InputProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly type?: 'text' | 'email' | 'password';
  readonly required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value: controlledValue,
  onChange,
  type = 'text',
  required = false
}) => {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
};
`;
	fs.writeFileSync(
		join(projectRoot, "src", "components", "Input.tsx"),
		inputComponent,
	);

	// Create a page component
	const homePage = `
import React from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface HomePageProps {
  readonly title?: string;
}

const HomePage: React.FC<HomePageProps> = ({ title = 'Welcome' }) => {
  const handleSubmit = () => {
    console.log('Form submitted');
  };

  return (
    <div className="home-page">
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email" 
          type="email" 
          required 
          placeholder="Enter your email"
        />
        <Input 
          label="Name" 
          type="text" 
          placeholder="Enter your full name"
        />
        <Button onClick={handleSubmit} variant="primary">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default HomePage;
`;
	fs.writeFileSync(join(projectRoot, "src", "pages", "HomePage.tsx"), homePage);

	// Create a custom hook
	const useCounter = `
import { useState, useCallback } from 'react';

interface UseCounterReturn {
  readonly count: number;
  readonly increment: () => void;
  readonly decrement: () => void;
  readonly reset: () => void;
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset
  };
};
`;
	fs.writeFileSync(
		join(projectRoot, "src", "hooks", "useCounter.ts"),
		useCounter,
	);

	// Create test files
	const buttonTest = `
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
`;
	fs.writeFileSync(join(projectRoot, "tests", "Button.test.tsx"), buttonTest);

	return {
		root: projectRoot,
		cleanup: (): void => {
			if (fs.existsSync(testDir)) {
				fs.rmSync(testDir, { recursive: true, force: true });
			}
		},
	};
}

/**
 * Create mock component specifications for testing
 */
export function createMockComponentSpecs(): TestComponentSpec[] {
	return [
		{
			name: "Button",
			type: "functional",
			props: [
				{ name: "children", type: "React.ReactNode", optional: false },
				{ name: "onClick", type: "() => void", optional: true },
				{ name: "variant", type: "'primary' | 'secondary'", optional: true },
				{ name: "disabled", type: "boolean", optional: true },
			],
			content: "Mock button component content",
		},
		{
			name: "Input",
			type: "functional",
			props: [
				{ name: "label", type: "string", optional: true },
				{ name: "value", type: "string", optional: true },
				{ name: "onChange", type: "(value: string) => void", optional: true },
				{ name: "placeholder", type: "string", optional: true },
				{ name: "required", type: "boolean", optional: true },
			],
			content: "Mock input component content",
		},
		{
			name: "Modal",
			type: "functional",
			props: [
				{ name: "isOpen", type: "boolean", optional: false },
				{ name: "onClose", type: "() => void", optional: false },
				{ name: "title", type: "string", optional: true },
				{ name: "children", type: "React.ReactNode", optional: true },
			],
			content: "Mock modal component content",
		},
	];
}

/**
 * Mock CLI execution results
 */
export function mockCliResults() {
	return {
		success: {
			stdout: "Command executed successfully",
			stderr: "",
			exitCode: 0,
		},
		failure: {
			stdout: "",
			stderr: "Command failed with error",
			exitCode: 1,
		},
		migration: {
			stdout: JSON.stringify({
				success: true,
				completedPhases: ["analysis", "transformation"],
				failedPhases: [],
				modifiedFiles: [
					"src/components/Button.tsx",
					"src/components/Input.tsx",
				],
				warnings: [],
				errors: [],
			}),
			stderr: "",
			exitCode: 0,
		},
	};
}

/**
 * Mock analysis results
 */
export function mockAnalysisResults() {
	return {
		projectStructure: {
			root: "/mock/project",
			framework: {
				name: "Next.js",
				version: "14.0.0",
				type: "ssr" as const,
				features: ["typescript", "tailwind", "eslint"],
			},
			architecture: {
				pattern: "layered" as const,
				complexity: "medium" as const,
				maintainability: 85,
			},
			components: [
				{
					name: "Button",
					path: "src/components/Button.tsx",
					type: "component" as const,
					props: ["children", "onClick", "variant", "disabled"],
					state: [],
					dependencies: ["react"],
					complexity: {
						cyclomatic: 3,
						cognitive: 2,
						maintainabilityIndex: 92,
					},
					performance: {
						renderTime: 0.5,
						memoryUsage: 1024,
						reRenderCount: 0,
						optimizationOpportunities: [],
					},
					accessibility: {
						score: 95,
						issues: [],
						recommendations: [],
					},
					testCoverage: {
						percentage: 90,
						lines: { covered: 18, total: 20 },
						functions: { covered: 3, total: 3 },
						branches: { covered: 4, total: 5 },
					},
				},
			],
			dependencies: [
				{
					name: "react",
					version: "18.2.0",
					latest: "18.2.0",
					type: "utility" as const,
					security: {
						vulnerabilities: [],
						riskLevel: "low" as const,
					},
					performance: {
						bundleSize: 42000,
						loadTime: 15,
					},
					maintenance: {
						lastUpdate: "2023-06-01",
						issueCount: 0,
						communitySupport: "excellent" as const,
					},
				},
			],
			quality: {
				overall: 90,
				codeQuality: 88,
				security: 95,
				performance: 87,
				accessibility: 92,
				maintainability: 89,
				testCoverage: 85,
				documentation: 80,
			},
		},
	};
}

/**
 * Create mock MCP tools
 */
export function createMockMCPTools() {
	return {
		call_tool: jest.fn(),
		list_tools: jest.fn(() =>
			Promise.resolve([
				{ name: "analyze_codebase", description: "Analyze project structure" },
				{ name: "generate_component", description: "Generate UI component" },
				{
					name: "migrate_framework",
					description: "Migrate between frameworks",
				},
			]),
		),
	};
}

/**
 * Wait for async operations in tests
 */
export const waitForAsync = (ms: number = 0): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Expect async function to throw with specific error
 */
export async function expectAsyncThrow(
	asyncFn: () => Promise<unknown>,
	expectedError?: string | RegExp,
): Promise<void> {
	try {
		await asyncFn();
		throw new Error("Expected function to throw, but it did not");
	} catch (error) {
		if (expectedError) {
			if (typeof expectedError === "string") {
				expect(error).toEqual(
					expect.objectContaining({
						message: expect.stringContaining(expectedError),
					}),
				);
			} else {
				expect((error as Error).message).toMatch(expectedError);
			}
		}
	}
}

/**
 * Create mock file system operations
 */
export function createMockFileSystem() {
	const mockFiles = new Map<string, string>();

	return {
		readFileSync: jest.fn((path: string) => {
			if (mockFiles.has(path)) {
				return mockFiles.get(path);
			}
			throw new Error(`File not found: ${path}`);
		}),
		writeFileSync: jest.fn((path: string, content: string) => {
			mockFiles.set(path, content);
		}),
		existsSync: jest.fn((path: string) => mockFiles.has(path)),
		mkdirSync: jest.fn(),
		rmSync: jest.fn(),
		files: mockFiles,
	};
}

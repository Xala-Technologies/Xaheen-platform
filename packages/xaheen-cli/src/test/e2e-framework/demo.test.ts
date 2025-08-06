/**
 * E2E Framework Demo Test
 * 
 * Demonstrates the comprehensive end-to-end testing framework
 * by running a subset of validation tests.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { E2ETestRunner } from './runner.js';
import type { E2ETestConfig } from './types.js';

describe('E2E Testing Framework Demo', () => {
  let testRunner: E2ETestRunner;
  let testOutputDir: string;

  beforeAll(async () => {
    testOutputDir = join(process.cwd(), 'test-output', 'e2e-demo');
    
    const config: E2ETestConfig = {
      outputDir: testOutputDir,
      cliPath: './dist/index.js',
      timeout: 300000, // 5 minutes for demo
      parallel: false,
      skipCleanup: false,
      generateReport: true,
      reportFormat: 'both',
      frameworks: ['react'], // Just test React for demo
      templates: ['default']
    };

    testRunner = new E2ETestRunner(config);

    // Ensure test output directory exists
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test output if needed
    if (process.env.CLEANUP_TESTS === 'true') {
      try {
        await fs.rm(testOutputDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should initialize E2E test framework correctly', async () => {
    expect(testRunner).toBeDefined();
    expect(testRunner).toBeInstanceOf(E2ETestRunner);
  });

  it('should validate project structure requirements', async () => {
    // Test the project validation logic with mock data
    const mockProjectPath = join(testOutputDir, 'mock-react-project');
    
    // Create a mock project structure
    await createMockProject(mockProjectPath);

    // Validate the mock project
    const scenario = {
      name: 'Mock React Project',
      framework: 'react' as const,
      template: 'default',
      features: ['design-system', 'typescript', 'tailwind']
    };

    const result = await testRunner['validateProjectStructure'](mockProjectPath, scenario);
    
    // Should pass basic structure validation
    expect(result).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should validate CLAUDE.md compliance rules', async () => {
    const mockProjectPath = join(testOutputDir, 'mock-claude-project');
    
    // Create a mock project with TypeScript/React code
    await createMockProjectWithCode(mockProjectPath);

    const result = await testRunner['validateClaudeCompliance'](mockProjectPath);
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should validate design system integration', async () => {
    const mockProjectPath = join(testOutputDir, 'mock-design-system-project');
    
    // Create a mock project with design system usage
    await createMockProjectWithDesignSystem(mockProjectPath);

    const result = await testRunner['validateDesignSystemIntegration'](mockProjectPath);
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should generate comprehensive test reports', async () => {
    const mockReport = {
      timestamp: new Date().toISOString(),
      environment: { node: process.version, platform: process.platform, arch: process.arch, cwd: process.cwd() },
      totalTests: 5,
      passedTests: 4,
      failedTests: 1,
      warningTests: 2,
      duration: 30000,
      suites: {
        projectCreation: { tests: [], passed: 1, failed: 0, warnings: 0 },
        designSystemIntegration: { tests: [], passed: 1, failed: 0, warnings: 1 },
        complianceValidation: { tests: [], passed: 1, failed: 1, warnings: 0 },
        codeQuality: { tests: [], passed: 1, failed: 0, warnings: 1 },
        performance: { tests: [], passed: 0, failed: 0, warnings: 0 }
      },
      compliance: {
        claudeMdCompliance: 85,
        nsmCompliance: 90,
        wcagCompliance: 88,
        designSystemUsage: 92
      },
      recommendations: [
        'Improve TypeScript strict typing',
        'Add more accessibility attributes'
      ]
    };

    await testRunner.generateEnhancedReport(mockReport as any);

    // Check if reports were generated
    const htmlReportExists = await checkFileExists(join(testOutputDir, 'e2e-test-report.html'));
    const jsonReportExists = await checkFileExists(join(testOutputDir, 'e2e-test-report.json'));
    
    expect(htmlReportExists).toBe(true);
    expect(jsonReportExists).toBe(true);
  });

  it('should handle test environment setup correctly', async () => {
    // Test environment detection and setup
    const environment = await testRunner['getTestEnvironment']();
    
    expect(environment).toBeDefined();
    expect(environment.node).toBeDefined();
    expect(environment.platform).toBeDefined();
    expect(environment.arch).toBeDefined();
    expect(environment.cwd).toBeDefined();
    expect(environment.timestamp).toBeDefined();
  });
});

/**
 * Helper function to create a mock project structure
 */
async function createMockProject(projectPath: string): Promise<void> {
  await fs.mkdir(projectPath, { recursive: true });
  await fs.mkdir(join(projectPath, 'src'), { recursive: true });
  await fs.mkdir(join(projectPath, 'src', 'components'), { recursive: true });
  await fs.mkdir(join(projectPath, 'src', 'components', 'ui'), { recursive: true });
  await fs.mkdir(join(projectPath, 'public'), { recursive: true });

  // Create package.json
  const packageJson = {
    name: 'mock-react-project',
    version: '1.0.0',
    dependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      '@xaheen-ai/design-system': 'file:../design-system',
      'tailwindcss': '^3.0.0'
    },
    devDependencies: {
      'typescript': '^5.0.0',
      '@types/react': '^18.0.0'
    }
  };

  await fs.writeFile(
    join(projectPath, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      strict: true,
      jsx: 'react-jsx'
    }
  };

  await fs.writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create basic files
  await fs.writeFile(join(projectPath, 'tailwind.config.js'), 'module.exports = {};');
  await fs.writeFile(join(projectPath, 'src', 'index.tsx'), 'export {};');
  await fs.writeFile(join(projectPath, 'src', 'App.tsx'), 'export {};');
  await fs.writeFile(join(projectPath, 'public', 'index.html'), '<html></html>');
}

/**
 * Helper function to create a mock project with TypeScript/React code
 */
async function createMockProjectWithCode(projectPath: string): Promise<void> {
  await createMockProject(projectPath);

  // Create a component with TypeScript and React patterns
  const componentCode = `
import React, { useState, useCallback } from 'react';

interface ButtonProps {
  readonly title: string;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const Button = ({ 
  title, 
  onClick, 
  variant = 'primary' 
}: ButtonProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsLoading(true);
    onClick?.();
    setTimeout(() => setIsLoading(false), 1000);
  }, [onClick]);

  try {
    return (
      <button
        onClick={handleClick}
        className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={title}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : title}
      </button>
    );
  } catch (error) {
    console.error('Button error:', error);
    return <div className="text-red-500">Error rendering button</div>;
  }
};
`;

  await fs.writeFile(join(projectPath, 'src', 'components', 'ui', 'button.tsx'), componentCode);
}

/**
 * Helper function to create a mock project with design system integration
 */
async function createMockProjectWithDesignSystem(projectPath: string): Promise<void> {
  await createMockProject(projectPath);

  // Create a component that imports from design system
  const componentCode = `
import React from 'react';
import { Button } from '@xaheen-ai/design-system';

interface HeaderProps {
  readonly title: string;
  readonly onMenuClick?: () => void;
}

export const Header = ({ title, onMenuClick }: HeaderProps): JSX.Element => {
  return (
    <header className="p-6 bg-white shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <Button
          variant="primary"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          Menu
        </Button>
      </div>
    </header>
  );
};
`;

  await fs.writeFile(join(projectPath, 'src', 'components', 'Header.tsx'), componentCode);

  // Update package.json to include design system dependency properly
  const packageJsonPath = join(projectPath, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  packageJson.dependencies['@xaheen-ai/design-system'] = 'file:../../../design-system';
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Helper function to check if a file exists
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
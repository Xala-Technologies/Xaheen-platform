/**
 * @fileoverview Enhanced Test Utilities - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Enhanced test utilities and helpers for consistent testing across MCP and frontend tests
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { join } from 'path';
import fs from 'fs-extra';
import { type MockedFunction, vi } from 'vitest';
import { TestFileSystem, CLITestRunner, PerformanceTracker } from "../test-helpers";

/**
 * Enhanced Mock Builder with additional utilities
 */
export class EnhancedMockBuilder {
  /**
   * Create realistic MCP API responses
   */
  static createMCPResponse(type: 'generate' | 'index' | 'preview' | 'apply', overrides: any = {}): any {
    const baseResponses = {
      generate: {
        success: true,
        files: [
          {
            path: 'src/components/TestComponent.tsx',
            content: 'export const TestComponent = () => <div>Test</div>;',
            encoding: 'utf-8',
          },
        ],
        linesGenerated: 25,
        filesGenerated: 1,
        generationTime: 1200,
        tokens: { input: 500, output: 300 },
        metadata: {
          platform: 'react',
          features: {},
        },
      },
      index: {
        success: true,
        indexId: 'idx_' + Date.now(),
        itemsIndexed: 42,
        totalSize: 1024 * 1024,
        indexingTime: 800,
        searchIndex: {
          components: 15,
          functions: 20,
          files: 7,
        },
      },
      preview: {
        success: true,
        previewId: 'preview_' + Date.now(),
        html: '<div class="preview">Preview Content</div>',
        css: '.preview { padding: 1rem; }',
        metadata: {
          renderTime: 150,
          dependencies: ['react', 'react-dom'],
          accessibility: { score: 95, issues: [] },
        },
      },
      apply: {
        success: true,
        appliedFiles: [
          { path: 'src/components/TestComponent.tsx', status: 'created', size: 512 },
        ],
        totalFiles: 1,
        totalSize: 512,
        applyTime: 200,
        backup: {
          backupId: 'backup_' + Date.now(),
          backupPath: '.xaheen/backups/pre-apply-' + Date.now(),
        },
      },
    };

    return { ...baseResponses[type], ...overrides };
  }

  /**
   * Create realistic component configuration
   */
  static createComponentConfig(overrides: any = {}): any {
    return {
      name: 'TestComponent',
      type: 'button',
      platform: 'react',
      features: {
        accessible: true,
        interactive: true,
        responsive: false,
        themeable: false,
      },
      styling: {
        variant: 'primary',
        size: 'md',
        borderRadius: 'lg',
        shadow: 'sm',
      },
      props: [
        { name: 'children', type: 'React.ReactNode', required: true },
        { name: 'onClick', type: '() => void', required: false },
        { name: 'disabled', type: 'boolean', required: false },
      ],
      ...overrides,
    };
  }

  /**
   * Create realistic project context
   */
  static createProjectContext(overrides: any = {}): any {
    return {
      projectRoot: '/test/project',
      framework: 'react',
      language: 'typescript',
      packageManager: 'npm',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        typescript: '^5.0.0',
      },
      scripts: {
        dev: 'next dev',
        build: 'next build',
        test: 'jest',
      },
      gitBranch: 'main',
      lastIndexed: new Date(),
      totalFiles: 156,
      totalSize: 2048000,
      ...overrides,
    };
  }

  /**
   * Create realistic context items
   */
  static createContextItems(count: number = 10): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `item_${i}`,
      type: i % 4 === 0 ? 'component' : i % 4 === 1 ? 'function' : i % 4 === 2 ? 'class' : 'file',
      path: `src/${i % 4 === 0 ? 'components' : 'utils'}/file${i}.tsx`,
      content: `export const File${i} = () => 'content';`,
      metadata: {
        extension: 'tsx',
        lines: 20 + i,
        isText: true,
        sizeBytes: 512 + i * 10,
      },
      lastModified: new Date(),
      size: 512 + i * 10,
      encoding: 'utf-8',
    }));
  }

  /**
   * Create error scenarios for testing
   */
  static createErrorScenarios(): Record<string, Error> {
    return {
      networkError: new Error('Network error: ENOTFOUND api.example.com'),
      timeoutError: new Error('Request timeout: Operation timed out after 30000ms'),
      authError: new Error('Authentication failed: Invalid API key'),
      rateLimit: new Error('Rate limit exceeded: Too many requests'),
      serverError: new Error('Internal server error: 500'),
      validationError: new Error('Validation error: Missing required field "name"'),
      permissionError: new Error('Permission denied: EACCES'),
      quotaError: new Error('Quota exceeded: Monthly limit reached'),
    };
  }
}

/**
 * Test Environment Manager for consistent test setup
 */
export class TestEnvironmentManager {
  private environments: Map<string, any> = new Map();

  /**
   * Setup standard test environment
   */
  async setupStandardEnvironment(name: string): Promise<{
    testDir: string;
    testFs: TestFileSystem;
    cliRunner: CLITestRunner;
    perfTracker: PerformanceTracker;
  }> {
    const testFs = new TestFileSystem();
    const testDir = await testFs.createTempDir(`${name}-test-`);
    const cliRunner = new CLITestRunner();
    const perfTracker = new PerformanceTracker();

    const environment = {
      testDir,
      testFs,
      cliRunner,
      perfTracker,
    };

    this.environments.set(name, environment);
    return environment;
  }

  /**
   * Setup MCP test environment with mock configuration
   */
  async setupMCPEnvironment(name: string): Promise<{
    testDir: string;
    testFs: TestFileSystem;
    mcpConfigPath: string;
    projectStructure: any;
  }> {
    const { testDir, testFs } = await this.setupStandardEnvironment(name);

    // Create MCP configuration
    const mcpConfigPath = join(testDir, '.xaheen', 'mcp.config.json');
    await fs.ensureDir(join(testDir, '.xaheen'));
    await fs.writeFile(
      mcpConfigPath,
      JSON.stringify({
        serverUrl: 'https://api.xala.ai/mcp',
        apiKey: `test_${name}_api_key_32_characters`,
        clientId: `test_${name}_client_id`,
        version: '1.0.0',
        timeout: 30000,
        retryAttempts: 3,
        enableTelemetry: true,
        securityClassification: 'OPEN',
      }, null, 2)
    );

    // Create realistic project structure
    const projectStructure = await this.createRealisticProjectStructure(testDir);

    const environment = {
      testDir,
      testFs,
      mcpConfigPath,
      projectStructure,
    };

    this.environments.set(`${name}-mcp`, environment);
    return environment;
  }

  /**
   * Setup frontend test environment with templates
   */
  async setupFrontendEnvironment(name: string): Promise<{
    testDir: string;
    testFs: TestFileSystem;
    templatesDir: string;
    outputDir: string;
  }> {
    const { testDir, testFs } = await this.setupStandardEnvironment(name);

    // Create template and output directories
    const templatesDir = join(testDir, 'templates');
    const outputDir = join(testDir, 'output');
    
    await fs.ensureDir(templatesDir);
    await fs.ensureDir(outputDir);

    // Setup standard templates
    await this.createStandardTemplates(templatesDir);

    const environment = {
      testDir,
      testFs,
      templatesDir,
      outputDir,
    };

    this.environments.set(`${name}-frontend`, environment);
    return environment;
  }

  /**
   * Cleanup all environments
   */
  async cleanup(): Promise<void> {
    for (const [name, env] of this.environments) {
      if (env.testFs) {
        await env.testFs.restore();
      }
    }
    this.environments.clear();
  }

  /**
   * Get environment by name
   */
  getEnvironment(name: string): any {
    return this.environments.get(name);
  }

  /**
   * Create realistic project structure
   */
  private async createRealisticProjectStructure(baseDir: string): Promise<any> {
    const structure = {
      'package.json': {
        name: 'test-project',
        version: '1.0.0',
        type: 'module',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          next: '^14.0.0',
          typescript: '^5.0.0',
        },
        devDependencies: {
          '@types/react': '^18.0.0',
          '@types/node': '^20.0.0',
          eslint: '^8.0.0',
          jest: '^29.0.0',
        },
        scripts: {
          dev: 'next dev',
          build: 'next build',
          test: 'jest',
          lint: 'eslint .',
        },
      },
      'tsconfig.json': {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'ES6'],
          allowJs: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
        },
      },
      'next.config.js': 'module.exports = { experimental: { appDir: true } };',
      src: {
        'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`,
        'App.tsx': `import React from 'react';

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold">Test Application</h1>
    </div>
  );
}`,
        components: {
          'Button.tsx': `import React from 'react';

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary';
}

export const Button = ({ children, onClick, variant = 'primary' }: ButtonProps): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded \${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
    >
      {children}
    </button>
  );
};`,
          'Modal.tsx': `import React from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps): JSX.Element | null => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <button onClick={onClose} className="float-right">×</button>
        {children}
      </div>
    </div>
  );
};`,
        },
        utils: {
          'helpers.ts': `export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('nb-NO');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};`,
        },
        hooks: {
          'useLocalStorage.ts': `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}`,
        },
      },
    };

    await this.writeStructureToFilesystem(baseDir, structure);
    return structure;
  }

  /**
   * Create standard templates for testing
   */
  private async createStandardTemplates(templatesDir: string): Promise<void> {
    const templates = {
      'react-component.hbs': `import React from 'react';

interface {{pascalCase name}}Props {
  readonly children: React.ReactNode;
  {{#if features.accessible}}
  readonly ariaLabel?: string;
  {{/if}}
  {{#if features.interactive}}
  readonly onClick?: () => void;
  {{/if}}
}

export const {{pascalCase name}} = ({
  children,
  {{#if features.accessible}}
  ariaLabel,
  {{/if}}
  {{#if features.interactive}}
  onClick,
  {{/if}}
}: {{pascalCase name}}Props): JSX.Element => {
  return (
    <div
      className="{{kebabCase name}}"
      {{#if features.accessible}}
      aria-label={ariaLabel}
      {{/if}}
      {{#if features.interactive}}
      onClick={onClick}
      {{/if}}
    >
      {children}
    </div>
  );
};`,

      'react-test.hbs': `import { render, screen, fireEvent } from '@testing-library/react';
import { {{pascalCase name}} } from './{{pascalCase name}}';

describe('{{pascalCase name}}', () => {
  it('renders correctly', () => {
    render(<{{pascalCase name}}>Test Content</{{pascalCase name}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  {{#if features.interactive}}
  it('handles click events', () => {
    const mockClick = vi.fn();
    render(<{{pascalCase name}} onClick={mockClick}>Click me</{{pascalCase name}}>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
  {{/if}}

  {{#if features.accessible}}
  it('has proper accessibility attributes', () => {
    render(<{{pascalCase name}} ariaLabel="Test label">Content</{{pascalCase name}}>);
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });
  {{/if}}
});`,

      'react-story.hbs': `import type { Meta, StoryObj } from '@storybook/react';
import { {{pascalCase name}} } from './{{pascalCase name}}';

const meta: Meta<typeof {{pascalCase name}}> = {
  title: 'Components/{{pascalCase name}}',
  component: {{pascalCase name}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default {{name}}',
  },
};

{{#if features.interactive}}
export const Interactive: Story = {
  args: {
    children: 'Interactive {{name}}',
    onClick: () => alert('Clicked!'),
  },
};
{{/if}}`,
    };

    for (const [filename, content] of Object.entries(templates)) {
      await fs.writeFile(join(templatesDir, filename), content);
    }
  }

  /**
   * Write structure to filesystem recursively
   */
  private async writeStructureToFilesystem(basePath: string, structure: any): Promise<void> {
    for (const [key, value] of Object.entries(structure)) {
      const currentPath = join(basePath, key);

      if (typeof value === 'string') {
        await fs.writeFile(currentPath, value);
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          await fs.writeFile(currentPath, JSON.stringify(value, null, 2));
        } else if (key.endsWith('.json')) {
          await fs.writeFile(currentPath, JSON.stringify(value, null, 2));
        } else {
          await fs.ensureDir(currentPath);
          await this.writeStructureToFilesystem(currentPath, value);
        }
      }
    }
  }
}

/**
 * Test Scenario Builder for complex test cases
 */
export class TestScenarioBuilder {
  private scenarios: Map<string, any> = new Map();

  /**
   * Add MCP workflow scenario
   */
  addMCPWorkflowScenario(name: string, config: {
    connectionConfig?: any;
    contextItems?: any[];
    generationRequests?: any[];
    expectedErrors?: string[];
    performanceThresholds?: any;
  }): this {
    this.scenarios.set(name, {
      type: 'mcp-workflow',
      ...config,
    });
    return this;
  }

  /**
   * Add frontend generation scenario
   */
  addFrontendGenerationScenario(name: string, config: {
    components?: any[];
    layouts?: any[];
    pages?: any[];
    templates?: any;
    expectedOutput?: any;
    performanceThresholds?: any;
  }): this {
    this.scenarios.set(name, {
      type: 'frontend-generation',
      ...config,
    });
    return this;
  }

  /**
   * Add error handling scenario
   */
  addErrorHandlingScenario(name: string, config: {
    errorType: string;
    triggerCondition: string;
    expectedBehavior: string;
    recoverySteps?: string[];
  }): this {
    this.scenarios.set(name, {
      type: 'error-handling',
      ...config,
    });
    return this;
  }

  /**
   * Add performance benchmark scenario
   */
  addPerformanceScenario(name: string, config: {
    operations: any[];
    thresholds: any;
    memoryLimits: any;
    concurrency?: number;
  }): this {
    this.scenarios.set(name, {
      type: 'performance',
      ...config,
    });
    return this;
  }

  /**
   * Get scenario by name
   */
  getScenario(name: string): any {
    return this.scenarios.get(name);
  }

  /**
   * Get all scenarios of a specific type
   */
  getScenariosByType(type: string): any[] {
    return Array.from(this.scenarios.values()).filter(s => s.type === type);
  }

  /**
   * Execute scenario with proper setup and teardown
   */
  async executeScenario(name: string, executor: (scenario: any) => Promise<any>): Promise<any> {
    const scenario = this.getScenario(name);
    if (!scenario) {
      throw new Error(`Scenario not found: ${name}`);
    }

    try {
      return await executor(scenario);
    } catch (error) {
      console.error(`Scenario execution failed: ${name}`, error);
      throw error;
    }
  }
}

/**
 * Test Data Validator for ensuring test data integrity
 */
export class TestDataValidator {
  /**
   * Validate MCP response structure
   */
  static validateMCPResponse(response: any, type: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response || typeof response !== 'object') {
      errors.push('Response must be an object');
      return { isValid: false, errors };
    }

    if (typeof response.success !== 'boolean') {
      errors.push('Response must have a boolean "success" field');
    }

    switch (type) {
      case 'generate':
        if (response.success) {
          if (!Array.isArray(response.files)) {
            errors.push('Generate response must have "files" array');
          }
          if (typeof response.linesGenerated !== 'number') {
            errors.push('Generate response must have "linesGenerated" number');
          }
          if (typeof response.filesGenerated !== 'number') {
            errors.push('Generate response must have "filesGenerated" number');
          }
        }
        break;

      case 'index':
        if (response.success) {
          if (typeof response.indexId !== 'string') {
            errors.push('Index response must have "indexId" string');
          }
          if (typeof response.itemsIndexed !== 'number') {
            errors.push('Index response must have "itemsIndexed" number');
          }
        }
        break;

      case 'preview':
        if (response.success) {
          if (typeof response.previewId !== 'string') {
            errors.push('Preview response must have "previewId" string');
          }
          if (typeof response.html !== 'string') {
            errors.push('Preview response must have "html" string');
          }
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate component configuration
   */
  static validateComponentConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Config must be an object');
      return { isValid: false, errors };
    }

    if (typeof config.name !== 'string' || config.name.trim() === '') {
      errors.push('Config must have a non-empty "name" string');
    }

    if (typeof config.type !== 'string' || config.type.trim() === '') {
      errors.push('Config must have a non-empty "type" string');
    }

    if (typeof config.platform !== 'string' || !['react', 'vue', 'angular', 'svelte'].includes(config.platform)) {
      errors.push('Config must have a valid "platform" string');
    }

    if (config.features && typeof config.features !== 'object') {
      errors.push('Features must be an object if provided');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate generated file structure
   */
  static validateGeneratedFiles(files: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(files)) {
      errors.push('Files must be an array');
      return { isValid: false, errors };
    }

    files.forEach((file, index) => {
      if (!file || typeof file !== 'object') {
        errors.push(`File at index ${index} must be an object`);
        return;
      }

      if (typeof file.path !== 'string' || file.path.trim() === '') {
        errors.push(`File at index ${index} must have a non-empty "path" string`);
      }

      if (typeof file.content !== 'string') {
        errors.push(`File at index ${index} must have "content" string`);
      }

      if (file.encoding && typeof file.encoding !== 'string') {
        errors.push(`File at index ${index} "encoding" must be a string if provided`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }
}

/**
 * Test Reporter for detailed test result analysis
 */
export class TestReporter {
  private results: any[] = [];
  private startTime: number = Date.now();

  /**
   * Record test result
   */
  recordResult(testName: string, result: {
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    memory?: any;
    errors?: string[];
    assertions?: number;
  }): void {
    this.results.push({
      testName,
      timestamp: new Date(),
      ...result,
    });
  }

  /**
   * Generate summary report
   */
  generateSummary(): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    totalDuration: number;
    averageDuration: number;
    memoryUsage?: any;
  } {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = Date.now() - this.startTime;
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return {
      totalTests,
      passed,
      failed,
      skipped,
      totalDuration,
      averageDuration,
    };
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport(): string {
    const summary = this.generateSummary();
    
    let report = '# Test Execution Report\n\n';
    report += `## Summary\n`;
    report += `- Total Tests: ${summary.totalTests}\n`;
    report += `- Passed: ${summary.passed}\n`;
    report += `- Failed: ${summary.failed}\n`;
    report += `- Skipped: ${summary.skipped}\n`;
    report += `- Total Duration: ${summary.totalDuration}ms\n`;
    report += `- Average Duration: ${summary.averageDuration.toFixed(2)}ms\n\n`;

    if (summary.failed > 0) {
      report += `## Failed Tests\n`;
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          report += `### ${result.testName}\n`;
          report += `- Duration: ${result.duration}ms\n`;
          if (result.errors?.length) {
            report += `- Errors:\n`;
            result.errors.forEach(error => {
              report += `  - ${error}\n`;
            });
          }
          report += '\n';
        });
    }

    return report;
  }

  /**
   * Export results to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      summary: this.generateSummary(),
      results: this.results,
      generatedAt: new Date(),
    }, null, 2);
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
    this.startTime = Date.now();
  }
}

// Export enhanced utilities
export {
  EnhancedMockBuilder as MockBuilder,
  TestEnvironmentManager,
  TestScenarioBuilder,
  TestDataValidator,
  TestReporter,
};
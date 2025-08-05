/**
 * @fileoverview MCP Workflow Integration Tests - EPIC 14 Story 14.5
 * @description Integration tests for full MCP flows (index → generate → preview → apply)
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { MCPClientService } from '../../services/mcp/mcp-client.service.js';
import { TestFileSystem, CLITestRunner, PerformanceTracker } from '../test-helpers.js';

// Mock xala-mcp with realistic integration behavior
vi.mock('xala-mcp', () => ({
  XalaMCPClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockImplementation(async (options) => {
      // Simulate real connection with configurable delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true, connectionId: 'mcp_conn_123' };
    }),
    disconnect: vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { success: true };
    }),
    generate: vi.fn().mockImplementation(async (config) => {
      // Simulate realistic generation time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const componentType = config.config?.componentType || 'component';
      const platform = config.config?.platform || 'react';
      
      return {
        success: true,
        files: [
          {
            path: `src/components/${config.name}.tsx`,
            content: generateMockComponent(config.name, componentType, platform),
            encoding: 'utf-8',
          },
          {
            path: `src/components/${config.name}.test.tsx`,
            content: generateMockTest(config.name),
            encoding: 'utf-8',
          },
          {
            path: `src/components/${config.name}.stories.tsx`,
            content: generateMockStory(config.name),
            encoding: 'utf-8',
          },
        ],
        linesGenerated: 150,
        filesGenerated: 3,
        generationTime: 500,
        tokens: {
          input: 1200,
          output: 800,
        },
        metadata: {
          componentType,
          platform,
          features: config.config?.features || {},
          styling: config.config?.styling || {},
        },
      };
    }),
    indexContext: vi.fn().mockImplementation(async (contextData) => {
      // Simulate indexing process
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const itemCount = contextData.contextItems?.length || 0;
      const totalSize = contextData.contextItems?.reduce((sum: number, item: any) => sum + (item.size || 0), 0) || 0;
      
      return {
        success: true,
        indexId: 'idx_' + Date.now(),
        itemsIndexed: itemCount,
        totalSize,
        indexingTime: 300,
        searchIndex: {
          components: contextData.contextItems?.filter((item: any) => item.type === 'component').length || 0,
          functions: contextData.contextItems?.filter((item: any) => item.type === 'function').length || 0,
          files: contextData.contextItems?.filter((item: any) => item.type === 'file').length || 0,
        },
      };
    }),
    preview: vi.fn().mockImplementation(async (config) => {
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        previewId: 'preview_' + Date.now(),
        html: generateMockPreview(config.name, config.config?.componentType),
        css: generateMockCSS(config.name),
        metadata: {
          renderTime: 200,
          dependencies: ['react', 'react-dom'],
          accessibility: {
            score: 95,
            issues: [],
          },
        },
      };
    }),
    apply: vi.fn().mockImplementation(async (generationResult, options) => {
      // Simulate file system operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const appliedFiles = generationResult.files || [];
      
      return {
        success: true,
        appliedFiles: appliedFiles.map((file: any) => ({
          path: file.path,
          status: 'created',
          size: file.content.length,
        })),
        totalFiles: appliedFiles.length,
        totalSize: appliedFiles.reduce((sum: number, file: any) => sum + file.content.length, 0),
        applyTime: 150,
        backup: options?.createBackup ? {
          backupId: 'backup_' + Date.now(),
          backupPath: '.xaheen/backups/pre-apply-' + Date.now(),
        } : null,
      };
    }),
  })),
}));

// Mock glob for context loading
vi.mock('glob', () => ({
  glob: vi.fn().mockImplementation(async (pattern, options) => {
    // Simulate finding project files
    return [
      'src/index.tsx',
      'src/App.tsx',
      'src/components/Button.tsx',
      'src/components/Modal.tsx',
      'src/utils/helpers.ts',
      'src/hooks/useLocalStorage.ts',
      'package.json',
      'tsconfig.json',
      'README.md',
    ];
  }),
}));

describe('MCP Workflow Integration Tests', () => {
  let mcpClient: MCPClientService;
  let testFs: TestFileSystem;
  let testDir: string;
  let cliRunner: CLITestRunner;
  let perfTracker: PerformanceTracker;

  beforeEach(async () => {
    // Setup test environment
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('mcp-integration-');
    cliRunner = new CLITestRunner();
    perfTracker = new PerformanceTracker();

    // Create realistic project structure
    await testFs.mock({
      [testDir]: {
        '.xaheen': {
          'mcp.config.json': JSON.stringify({
            serverUrl: 'https://api.xala.ai/mcp',
            apiKey: 'test_integration_api_key_32_chars',
            clientId: 'integration_test_client_123',
            version: '1.0.0',
            timeout: 45000,
            retryAttempts: 3,
            enableTelemetry: true,
            securityClassification: 'OPEN',
          }),
        },
        'package.json': JSON.stringify({
          name: 'mcp-integration-test-project',
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
            '@storybook/react': '^7.0.0',
          },
          scripts: {
            dev: 'next dev',
            build: 'next build',
            test: 'jest',
            storybook: 'storybook dev -p 6006',
          },
        }),
        'tsconfig.json': JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            lib: ['dom', 'dom.iterable', 'ES6'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            esModuleInterop: true,
          },
        }),
        src: {
          'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`,
          'App.tsx': `import React from 'react';
import { Button } from './components/Button';

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">MCP Integration Test</h1>
      <Button variant="primary">Click me</Button>
    </div>
  );
}`,
          components: {
            'Button.tsx': `import React from 'react';

interface ButtonProps {
  readonly variant?: 'primary' | 'secondary';
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
}

export const Button = ({ variant = 'primary', children, onClick }: ButtonProps): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className={\`h-12 px-6 rounded-lg font-medium transition-colors \${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      }\`}
    >
      {children}
    </button>
  );
};`,
            'Modal.tsx': `import React, { useEffect } from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps): JSX.Element | null => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};`,
          },
          utils: {
            'helpers.ts': `export const formatCurrency = (amount: number, currency = 'NOK'): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
  }).format(amount);
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

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}`,
          },
        },
        '.env.local': `NEXT_PUBLIC_APP_NAME=MCP Integration Test
NEXT_PUBLIC_API_URL=https://api.example.com`,
        'README.md': `# MCP Integration Test Project

This is a test project for MCP workflow integration testing.`,
      },
    });

    // Initialize MCP client
    mcpClient = new MCPClientService({
      configPath: join(testDir, '.xaheen/mcp.config.json'),
      enterpriseMode: true,
      debug: true,
    });
  });

  afterEach(async () => {
    if (mcpClient.isClientConnected()) {
      await mcpClient.disconnect();
    }
    await testFs.restore();
    vi.clearAllMocks();
  });

  describe('Complete MCP Workflow', () => {
    it('should execute full workflow: initialize → index → generate → preview → apply', async () => {
      const endMeasurement = perfTracker.startMeasurement('full-workflow');

      // Step 1: Initialize MCP client
      const initMeasurement = perfTracker.startMeasurement('initialization');
      await mcpClient.initialize(testDir);
      initMeasurement();
      
      expect(mcpClient.isClientConnected()).toBe(true);

      // Step 2: Load and index project context
      const indexMeasurement = perfTracker.startMeasurement('context-indexing');
      const projectContext = await mcpClient.loadProjectContext(testDir);
      const contextItems = await mcpClient.loadContextItems({
        includePatterns: ['**/*.{ts,tsx,js,jsx,json}'],
        excludePatterns: ['node_modules/**', 'dist/**', '.next/**'],
        maxFileSize: 1024 * 1024, // 1MB
      });
      
      await mcpClient.indexProjectContext();
      indexMeasurement();

      expect(projectContext).toMatchObject({
        projectRoot: testDir,
        framework: 'next',
        language: 'typescript',
        totalFiles: expect.any(Number),
        totalSize: expect.any(Number),
      });
      expect(contextItems.length).toBeGreaterThan(0);

      // Step 3: Generate component
      const generateMeasurement = perfTracker.startMeasurement('component-generation');
      const generationResult = await mcpClient.generateComponent('SearchInput', 'input', {
        platform: 'react',
        features: {
          searchable: true,
          clearable: true,
          accessible: true,
          validation: true,
        },
        styling: {
          variant: 'default',
          borderRadius: 'md',
          shadow: 'sm',
        },
      });
      generateMeasurement();

      expect(generationResult).toMatchObject({
        success: true,
        files: expect.arrayContaining([
          expect.objectContaining({
            path: 'src/components/SearchInput.tsx',
            content: expect.stringContaining('SearchInput'),
          }),
        ]),
        linesGenerated: expect.any(Number),
        filesGenerated: expect.any(Number),
        generationTime: expect.any(Number),
      });

      // Step 4: Preview component (if MCP client supports it)
      const previewMeasurement = perfTracker.startMeasurement('component-preview');
      const mcpClientInstance = mcpClient.getMCPClient();
      let previewResult = null;
      
      if (mcpClientInstance && typeof (mcpClientInstance as any).preview === 'function') {
        previewResult = await (mcpClientInstance as any).preview({
          name: 'SearchInput',
          config: {
            componentType: 'input',
            platform: 'react',
          },
        });
      }
      previewMeasurement();

      if (previewResult) {
        expect(previewResult).toMatchObject({
          success: true,
          previewId: expect.any(String),
          html: expect.stringContaining('SearchInput'),
          metadata: expect.objectContaining({
            renderTime: expect.any(Number),
            accessibility: expect.objectContaining({
              score: expect.any(Number),
            }),
          }),
        });
      }

      // Step 5: Apply generated files
      const applyMeasurement = perfTracker.startMeasurement('file-application');
      let applyResult = null;
      
      if (mcpClientInstance && typeof (mcpClientInstance as any).apply === 'function') {
        applyResult = await (mcpClientInstance as any).apply(generationResult, {
          createBackup: true,
          overwriteExisting: false,
          dryRun: false,
        });
      }
      applyMeasurement();

      if (applyResult) {
        expect(applyResult).toMatchObject({
          success: true,
          appliedFiles: expect.arrayContaining([
            expect.objectContaining({
              path: expect.stringContaining('SearchInput'),
              status: 'created',
              size: expect.any(Number),
            }),
          ]),
          totalFiles: expect.any(Number),
          totalSize: expect.any(Number),
        });
      }

      const fullWorkflowTime = endMeasurement();

      // Verify telemetry tracking
      const telemetryMetrics = mcpClient.getTelemetryMetrics();
      expect(telemetryMetrics.totalConnections).toBeGreaterThan(0);
      expect(telemetryMetrics.totalGenerations).toBeGreaterThan(0);
      expect(telemetryMetrics.averageResponseTime).toBeGreaterThan(0);

      // Performance assertions
      expect(fullWorkflowTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      const stats = perfTracker.getAllStats();
      expect(stats['initialization']?.avg).toBeLessThan(5000);
      expect(stats['context-indexing']?.avg).toBeLessThan(3000);
      expect(stats['component-generation']?.avg).toBeLessThan(2000);
    });

    it('should handle workflow interruption gracefully', async () => {
      // Initialize and start workflow
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
      
      // Simulate interruption during generation
      const mcpClientInstance = mcpClient.getMCPClient();
      (mcpClientInstance as any).generate.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Workflow interrupted');
      });

      await expect(
        mcpClient.generateComponent('InterruptedComponent', 'button')
      ).rejects.toThrow('Workflow interrupted');

      // Client should still be connected and recoverable
      expect(mcpClient.isClientConnected()).toBe(true);
      
      // Should be able to continue with other operations
      const contextItems = mcpClient.getContextItems();
      expect(contextItems).toBeDefined();
    });

    it('should support batch component generation', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
      await mcpClient.indexProjectContext();

      const components = [
        { name: 'LoadingSpinner', type: 'spinner' },
        { name: 'ErrorBoundary', type: 'error-boundary' },
        { name: 'DataTable', type: 'table' },
      ];

      const batchMeasurement = perfTracker.startMeasurement('batch-generation');
      const results = await Promise.all(
        components.map(component =>
          mcpClient.generateComponent(component.name, component.type, {
            platform: 'react',
            features: { accessible: true, responsive: true },
          })
        )
      );
      batchMeasurement();

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.filesGenerated).toBeGreaterThan(0);
      });

      const telemetryMetrics = mcpClient.getTelemetryMetrics();
      expect(telemetryMetrics.totalGenerations).toBe(3);
    });

    it('should maintain context consistency across operations', async () => {
      await mcpClient.initialize(testDir);
      
      // Load initial context
      const initialContext = await mcpClient.loadProjectContext(testDir);
      const initialItems = await mcpClient.loadContextItems();
      
      // Generate a component
      await mcpClient.generateComponent('ContextTest', 'button');
      
      // Context should remain consistent
      const currentContext = mcpClient.getProjectContext();
      const currentItems = mcpClient.getContextItems();
      
      expect(currentContext).toEqual(initialContext);
      expect(currentItems).toEqual(initialItems);
      
      // Index again and verify consistency
      await mcpClient.indexProjectContext();
      
      const postIndexContext = mcpClient.getProjectContext();
      expect(postIndexContext).toEqual(initialContext);
    });
  });

  describe('Workflow Error Recovery', () => {
    it('should recover from connection failures', async () => {
      const mcpClientInstance = mcpClient.getMCPClient();
      
      // Mock connection failure
      (mcpClientInstance as any).connect
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockRejectedValueOnce(new Error('Server unavailable'))
        .mockResolvedValueOnce({ success: true });

      await expect(mcpClient.initialize(testDir)).resolves.not.toThrow();
      expect(mcpClient.isClientConnected()).toBe(true);
    });

    it('should handle partial generation failures', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      // Mock partial failure in generation
      const mcpClientInstance = mcpClient.getMCPClient();
      (mcpClientInstance as any).generate.mockResolvedValue({
        success: false,
        error: 'Partial generation failure',
        files: [], // Empty files due to failure
        partialResult: true,
      });

      const result = await mcpClient.generateComponent('PartialFail', 'button');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Partial generation failure');
      
      // Telemetry should track the failure
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should handle context loading failures gracefully', async () => {
      await mcpClient.initialize(testDir);

      // Mock glob failure
      const { glob } = await import('glob');
      (glob as any).mockRejectedValue(new Error('File system error'));

      await expect(mcpClient.loadContextItems()).rejects.toThrow('File system error');
      
      // Client should still be connected
      expect(mcpClient.isClientConnected()).toBe(true);
      
      // Should be able to retry with glob working again
      (glob as any).mockResolvedValue(['src/index.tsx']);
      
      const items = await mcpClient.loadContextItems();
      expect(items).toHaveLength(1);
    });
  });

  describe('Workflow Performance Optimization', () => {
    it('should cache context items efficiently', async () => {
      await mcpClient.initialize(testDir);
      
      // First load
      const firstLoad = perfTracker.startMeasurement('first-context-load');
      await mcpClient.loadContextItems();
      const firstTime = firstLoad();
      
      // Second load (should use cache)
      const secondLoad = perfTracker.startMeasurement('second-context-load');
      await mcpClient.loadContextItems();
      const secondTime = secondLoad();
      
      // Second load should be significantly faster
      expect(secondTime).toBeLessThan(firstTime * 0.5);
    });

    it('should optimize large project indexing', async () => {
      // Create large mock project
      const largeProjectMock = {
        [testDir]: {
          ...((await testFs.mock({})) as any)[testDir],
          src: {
            ...Array.from({ length: 100 }, (_, i) => ({
              [`component-${i}.tsx`]: `export const Component${i} = () => <div>Component ${i}</div>;`,
            })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          },
        },
      };
      
      await testFs.mock(largeProjectMock);
      
      // Mock glob to return many files
      const { glob } = await import('glob');
      (glob as any).mockResolvedValue(
        Array.from({ length: 100 }, (_, i) => `src/component-${i}.tsx`)
      );

      await mcpClient.initialize(testDir);
      
      const indexingMeasurement = perfTracker.startMeasurement('large-project-indexing');
      await mcpClient.loadContextItems({
        maxFileSize: 1024 * 50, // 50KB limit to handle many files efficiently
      });
      await mcpClient.indexProjectContext();
      const indexingTime = indexingMeasurement();
      
      // Should handle large projects efficiently
      expect(indexingTime).toBeLessThan(5000); // Within 5 seconds
      
      const items = mcpClient.getContextItems();
      expect(items.length).toBeGreaterThan(50); // Should load most files
    });

    it('should parallelize multiple generation requests', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      const parallelMeasurement = perfTracker.startMeasurement('parallel-generation');
      
      // Generate multiple components in parallel
      const parallelResults = await Promise.allSettled([
        mcpClient.generateComponent('Parallel1', 'button'),
        mcpClient.generateComponent('Parallel2', 'input'),
        mcpClient.generateComponent('Parallel3', 'modal'),
        mcpClient.generateComponent('Parallel4', 'card'),
        mcpClient.generateComponent('Parallel5', 'table'),
      ]);
      
      const parallelTime = parallelMeasurement();
      
      // Sequential measurement for comparison
      const sequentialMeasurement = perfTracker.startMeasurement('sequential-generation');
      
      await mcpClient.generateComponent('Sequential1', 'button');
      await mcpClient.generateComponent('Sequential2', 'input');
      
      const sequentialTime = sequentialMeasurement();
      
      // All parallel requests should succeed
      parallelResults.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
      
      // Parallel should be more efficient than sequential
      const parallelTimePerComponent = parallelTime / 5;
      const sequentialTimePerComponent = sequentialTime / 2;
      
      expect(parallelTimePerComponent).toBeLessThan(sequentialTimePerComponent * 0.8);
    });
  });

  describe('Workflow Integration with CLI', () => {
    it('should integrate with CLI commands', async () => {
      // Test CLI integration (mocked)
      const result = await cliRunner.runCommand(['generate', 'component', 'CLITestButton'], {
        cwd: testDir,
        env: {
          XAHEEN_MCP_CONFIG: join(testDir, '.xaheen/mcp.config.json'),
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('CLITestButton');
    });

    it('should handle CLI interruptions gracefully', async () => {
      // Simulate CLI interruption (SIGINT)
      const result = await cliRunner.runCommand(['generate', 'component', 'InterruptedButton'], {
        cwd: testDir,
        timeout: 1000, // Short timeout to simulate interruption
        expectError: true,
      });

      expect(result.exitCode).not.toBe(0);
      // Should not leave MCP client in inconsistent state
    });
  });
});

// Helper functions for mock generation
function generateMockComponent(name: string, type: string, platform: string): string {
  return `import React from 'react';

interface ${name}Props {
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
}

export const ${name} = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick
}: ${name}Props): JSX.Element => {
  return (
    <${type === 'button' ? 'button' : 'div'}
      onClick={onClick}
      disabled={disabled}
      className={\`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 \${
        size === 'sm' ? 'h-9 px-3 text-sm' :
        size === 'lg' ? 'h-14 px-8 text-lg' :
        'h-12 px-6 text-base'
      } \${
        variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' :
        variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' :
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      } \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      aria-label="${name} ${type}"
    >
      {children}
    </${type === 'button' ? 'button' : 'div'}>
  );
};`;
}

function generateMockTest(name: string): string {
  return `import { render, screen, fireEvent } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name}>Test</${name}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockClick = vi.fn();
    render(<${name} onClick={mockClick}>Click me</${name}>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<${name} variant="destructive">Danger</${name}>);
    const button = screen.getByText('Danger');
    expect(button).toHaveClass('bg-red-600');
  });

  it('handles disabled state', () => {
    render(<${name} disabled>Disabled</${name}>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
});`;
}

function generateMockStory(name: string): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary ${name}',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary ${name}',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive ${name}',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled ${name}',
  },
};`;
}

function generateMockPreview(name: string, type: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">${name} Component Preview</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="font-medium mb-2">Primary</h3>
        <div id="${name.toLowerCase()}-primary"></div>
      </div>
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="font-medium mb-2">Secondary</h3>
        <div id="${name.toLowerCase()}-secondary"></div>
      </div>
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="font-medium mb-2">Disabled</h3>
        <div id="${name.toLowerCase()}-disabled"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateMockCSS(name: string): string {
  return `.${name.toLowerCase()} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.${name.toLowerCase()}:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.${name.toLowerCase()}.primary {
  background-color: #2563eb;
  color: white;
}

.${name.toLowerCase()}.primary:hover {
  background-color: #1d4ed8;
}

.${name.toLowerCase()}.secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.${name.toLowerCase()}.secondary:hover {
  background-color: #d1d5db;
}`;
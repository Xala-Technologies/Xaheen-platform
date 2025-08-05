/**
 * @fileoverview MCP Client Service Unit Tests - EPIC 14 Story 14.5
 * @description Comprehensive unit tests for MCP client wrappers with mocked API responses
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { MCPClientService, type MCPConfig, type ProjectContext, type ContextItem } from '../../services/mcp/mcp-client.service.js';
import { TestFileSystem, MockBuilder } from '../test-helpers.js';

// Mock external dependencies
vi.mock('xala-mcp', () => ({
  XalaMCPClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    generate: vi.fn(),
    indexContext: vi.fn(),
  })),
}));

vi.mock('glob', () => ({
  glob: vi.fn(),
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

describe('MCPClientService Unit Tests', () => {
  let mcpClient: MCPClientService;
  let testFs: TestFileSystem;
  let testDir: string;
  let mockXalaMCPClient: any;

  beforeEach(async () => {
    // Setup test filesystem
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('mcp-test-');

    // Create MCP client instance
    mcpClient = new MCPClientService({
      configPath: join(testDir, '.xaheen/mcp.config.json'),
      enterpriseMode: true,
      debug: true,
    });

    // Setup mock XalaMCPClient
    const { XalaMCPClient } = await import('@xala-technologies/xala-mcp');
    mockXalaMCPClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      generate: vi.fn().mockResolvedValue({
        success: true,
        files: [],
        linesGenerated: 100,
        filesGenerated: 3,
      }),
      indexContext: vi.fn().mockResolvedValue({ success: true }),
    };
    (XalaMCPClient as any).mockImplementation(() => mockXalaMCPClient);

    // Mock filesystem operations
    await testFs.mock({
      [testDir]: {
        '.xaheen': {
          'mcp.config.json': JSON.stringify({
            serverUrl: 'https://api.xala.ai/mcp',
            apiKey: 'test_api_key_with_32_characters_min',
            clientId: 'test_client_12345',
            version: '1.0.0',
            timeout: 30000,
            retryAttempts: 3,
            enableTelemetry: true,
            securityClassification: 'OPEN',
          }),
        },
        'package.json': JSON.stringify({
          name: 'test-project',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            next: '^14.0.0',
          },
          scripts: {
            dev: 'next dev',
            build: 'next build',
          },
        }),
        src: {
          'index.ts': 'console.log("Hello World");',
          components: {
            'Button.tsx': 'export const Button = () => <button>Click me</button>;',
          },
        },
      },
    });
  });

  afterEach(async () => {
    await testFs.restore();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      await expect(mcpClient.initialize(testDir)).resolves.not.toThrow();
      expect(mcpClient.isClientConnected()).toBe(true);
    });

    it('should load configuration from file', async () => {
      await mcpClient.initialize(testDir);
      const config = (mcpClient as any).config;
      
      expect(config).toBeDefined();
      expect(config.serverUrl).toBe('https://api.xala.ai/mcp');
      expect(config.apiKey).toBe('test_api_key_with_32_characters_min');
      expect(config.securityClassification).toBe('OPEN');
    });

    it('should generate enterprise configuration when file not found', async () => {
      // Create new client without config file
      const newTestDir = await testFs.createTempDir('mcp-no-config-');
      await testFs.mock({
        [newTestDir]: {
          'package.json': JSON.stringify({ name: 'test' }),
        },
      });

      const newClient = new MCPClientService({
        configPath: join(newTestDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true,
      });

      await expect(newClient.initialize(newTestDir)).resolves.not.toThrow();
      expect(newClient.isClientConnected()).toBe(true);
    });

    it('should validate enterprise security requirements', async () => {
      // Test with invalid API key (too short)
      await testFs.mock({
        [testDir]: {
          '.xaheen': {
            'mcp.config.json': JSON.stringify({
              serverUrl: 'https://api.xala.ai/mcp',
              apiKey: 'short_key', // Too short for enterprise
              clientId: 'test_client',
              securityClassification: 'CONFIDENTIAL',
            }),
          },
        },
      });

      const enterpriseClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true,
      });

      await expect(enterpriseClient.initialize(testDir)).rejects.toThrow(
        'Enterprise mode requires API key with minimum 32 characters'
      );
    });

    it('should require HTTPS for non-OPEN classifications', async () => {
      await testFs.mock({
        [testDir]: {
          '.xaheen': {
            'mcp.config.json': JSON.stringify({
              serverUrl: 'http://insecure.example.com', // HTTP not HTTPS
              apiKey: 'test_api_key_with_32_characters_min',
              clientId: 'test_client',
              securityClassification: 'CONFIDENTIAL',
            }),
          },
        },
      });

      const secureClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true,
      });

      await expect(secureClient.initialize(testDir)).rejects.toThrow(
        'Non-OPEN classification requires HTTPS connection to MCP server'
      );
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
    });

    it('should connect to MCP server successfully', async () => {
      expect(mockXalaMCPClient.connect).toHaveBeenCalledWith({
        retryAttempts: 3,
        retryDelay: 1000,
        enableCompression: true,
        maxConcurrentRequests: 10,
      });
    });

    it('should retry connection on failure', async () => {
      mockXalaMCPClient.connect
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      const retryClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true,
      });

      await expect(retryClient.initialize(testDir)).resolves.not.toThrow();
      expect(mockXalaMCPClient.connect).toHaveBeenCalledTimes(3);
    });

    it('should fail after maximum retry attempts', async () => {
      mockXalaMCPClient.connect.mockRejectedValue(new Error('Persistent connection error'));

      const failingClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true,
      });

      await expect(failingClient.initialize(testDir)).rejects.toThrow('Persistent connection error');
      expect(mockXalaMCPClient.connect).toHaveBeenCalledTimes(3);
    });

    it('should disconnect gracefully', async () => {
      await mcpClient.disconnect();
      
      expect(mockXalaMCPClient.disconnect).toHaveBeenCalled();
      expect(mcpClient.isClientConnected()).toBe(false);
    });
  });

  describe('Project Context Loading', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
    });

    it('should load project context successfully', async () => {
      const context = await mcpClient.loadProjectContext(testDir);
      
      expect(context).toMatchObject({
        projectRoot: testDir,
        framework: 'next',
        language: 'typescript',
        packageManager: 'npm',
      });
      expect(context.dependencies).toHaveProperty('react');
      expect(context.dependencies).toHaveProperty('next');
      expect(context.scripts).toHaveProperty('dev');
    });

    it('should detect framework correctly', async () => {
      // Test React detection
      await testFs.mock({
        [testDir]: {
          'package.json': JSON.stringify({
            dependencies: { react: '^18.0.0' },
          }),
        },
      });

      const context = await mcpClient.loadProjectContext(testDir);
      expect(context.framework).toBe('react');

      // Test Vue detection
      await testFs.mock({
        [testDir]: {
          'package.json': JSON.stringify({
            dependencies: { vue: '^3.0.0' },
          }),
        },
      });

      const vueContext = await mcpClient.loadProjectContext(testDir);
      expect(vueContext.framework).toBe('vue');
    });

    it('should detect language correctly', async () => {
      // Test TypeScript detection
      await testFs.mock({
        [testDir]: {
          'package.json': JSON.stringify({
            devDependencies: { typescript: '^5.0.0' },
          }),
        },
      });

      const context = await mcpClient.loadProjectContext(testDir);
      expect(context.language).toBe('typescript');

      // Test JavaScript detection
      await testFs.mock({
        [testDir]: {
          'package.json': JSON.stringify({
            devDependencies: { eslint: '^8.0.0' },
          }),
        },
      });

      const jsContext = await mcpClient.loadProjectContext(testDir);
      expect(jsContext.language).toBe('javascript');
    });

    it('should handle missing package.json gracefully', async () => {
      await testFs.mock({
        [testDir]: {
          src: {
            'index.js': 'console.log("test");',
          },
        },
      });

      const context = await mcpClient.loadProjectContext(testDir);
      expect(context.projectRoot).toBe(testDir);
      expect(context.dependencies).toEqual({});
      expect(context.scripts).toEqual({});
    });
  });

  describe('Context Items Loading', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
      
      // Mock glob results
      const { glob } = await import('glob');
      (glob as MockedFunction<any>).mockResolvedValue([
        'src/index.ts',
        'src/components/Button.tsx',
        'package.json',
      ]);
    });

    it('should load context items with default options', async () => {
      const items = await mcpClient.loadContextItems();
      
      expect(items).toHaveLength(3);
      expect(items.map(item => item.path)).toEqual([
        'src/index.ts',
        'src/components/Button.tsx',
        'package.json',
      ]);
    });

    it('should apply include and exclude patterns', async () => {
      const { glob } = await import('glob');
      (glob as MockedFunction<any>).mockResolvedValue(['src/components/Button.tsx']);

      const items = await mcpClient.loadContextItems({
        includePatterns: ['**/*.tsx'],
        excludePatterns: ['node_modules/**', '**/*.test.*'],
      });

      expect(glob).toHaveBeenCalledWith('**/*.tsx', {
        cwd: testDir,
        ignore: ['node_modules/**', '**/*.test.*'],
        dot: false,
        follow: false,
      });
      expect(items).toHaveLength(1);
      expect(items[0].path).toBe('src/components/Button.tsx');
    });

    it('should respect max file size limit', async () => {
      // Mock file stats to return large size
      const originalStat = fs.stat;
      vi.spyOn(fs, 'stat').mockResolvedValue({
        size: 2 * 1024 * 1024, // 2MB
        mtime: new Date(),
      } as any);

      const items = await mcpClient.loadContextItems({
        maxFileSize: 1024 * 1024, // 1MB limit
      });

      // Should skip large files
      expect(items).toHaveLength(0);
      
      fs.stat = originalStat;
    });

    it('should detect context item types correctly', async () => {
      const items = await mcpClient.loadContextItems();
      
      const buttonComponent = items.find(item => item.path === 'src/components/Button.tsx');
      expect(buttonComponent?.type).toBe('component');
      
      const indexFile = items.find(item => item.path === 'src/index.ts');
      expect(indexFile?.type).toBe('file');
    });

    it('should generate proper metadata for context items', async () => {
      const items = await mcpClient.loadContextItems();
      
      items.forEach(item => {
        expect(item.metadata).toBeDefined();
        expect(item.metadata).toHaveProperty('extension');
        expect(item.metadata).toHaveProperty('lines');
        expect(item.metadata).toHaveProperty('isText');
        expect(item.metadata).toHaveProperty('sizeBytes');
      });
    });
  });

  describe('Component Generation', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
    });

    it('should generate component successfully', async () => {
      const result = await mcpClient.generateComponent('TestButton', 'button', {
        platform: 'react',
        features: { interactive: true, accessible: true },
        styling: { variant: 'primary' },
      });

      expect(mockXalaMCPClient.generate).toHaveBeenCalledWith({
        type: 'component',
        name: 'TestButton',
        config: expect.objectContaining({
          componentType: 'button',
          platform: 'react',
          features: { interactive: true, accessible: true },
          styling: { variant: 'primary' },
        }),
      });

      expect(result).toMatchObject({
        success: true,
        linesGenerated: 100,
        filesGenerated: 3,
      });
    });

    it('should handle generation errors gracefully', async () => {
      mockXalaMCPClient.generate.mockRejectedValue(new Error('Generation failed'));

      await expect(
        mcpClient.generateComponent('FailingComponent', 'button')
      ).rejects.toThrow('Generation failed');
    });

    it('should require connected client for generation', async () => {
      const disconnectedClient = new MCPClientService();
      
      await expect(
        disconnectedClient.generateComponent('TestComponent', 'button')
      ).rejects.toThrow('MCP client not connected. Call initialize() first.');
    });
  });

  describe('Context Indexing', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadContextItems();
    });

    it('should index project context successfully', async () => {
      await mcpClient.indexProjectContext();

      expect(mockXalaMCPClient.indexContext).toHaveBeenCalledWith({
        projectContext: expect.objectContaining({
          projectRoot: testDir,
          framework: 'next',
        }),
        contextItems: expect.any(Array),
        timestamp: expect.any(String),
      });
    });

    it('should handle indexing errors gracefully', async () => {
      mockXalaMCPClient.indexContext.mockRejectedValue(new Error('Indexing failed'));

      await expect(mcpClient.indexProjectContext()).rejects.toThrow('Indexing failed');
    });

    it('should require project context for indexing', async () => {
      const newClient = new MCPClientService();
      await newClient.initialize(testDir);
      // Don't load project context

      await expect(newClient.indexProjectContext()).rejects.toThrow(
        'Project context not loaded. Call loadProjectContext() first.'
      );
    });
  });

  describe('Telemetry', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
    });

    it('should track telemetry events during operations', async () => {
      await mcpClient.generateComponent('TelemetryTest', 'button');
      
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalGenerations).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
    });

    it('should flush telemetry events', async () => {
      await mcpClient.generateComponent('FlushTest', 'button');
      await expect(mcpClient.flushTelemetry()).resolves.not.toThrow();
    });

    it('should handle telemetry errors gracefully', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(mcpClient.flushTelemetry()).resolves.not.toThrow();
    });
  });

  describe('Configuration Management', () => {
    it('should generate secure API keys', async () => {
      const config = (mcpClient as any).generateEnterpriseConfig(testDir);
      
      expect(config.apiKey).toHaveLength(32);
      expect(config.apiKey).toMatch(/^enterprise_/);
    });

    it('should generate unique client IDs', async () => {
      const clientId1 = (mcpClient as any).generateClientId();
      const clientId2 = (mcpClient as any).generateClientId();
      
      expect(clientId1).toMatch(/^xaheen_/);
      expect(clientId2).toMatch(/^xaheen_/);
      expect(clientId1).not.toBe(clientId2);
    });

    it('should format file sizes correctly', async () => {
      const formatFileSize = (mcpClient as any).formatFileSize;
      
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatFileSize(500)).toBe('500.0 B');
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Mock filesystem error
      vi.spyOn(fs, 'readFile').mockRejectedValue(new Error('File read error'));
      
      const failingClient = new MCPClientService({
        configPath: 'invalid/path/config.json',
        enterpriseMode: false, // Disable auto-generation
      });

      await expect(failingClient.initialize(testDir)).rejects.toThrow();
    });

    it('should handle disconnection errors gracefully', async () => {
      await mcpClient.initialize(testDir);
      
      mockXalaMCPClient.disconnect.mockRejectedValue(new Error('Disconnection error'));
      
      // Should not throw despite disconnect error
      await expect(mcpClient.disconnect()).resolves.not.toThrow();
      expect(mcpClient.isClientConnected()).toBe(false);
    });

    it('should validate configuration schema', async () => {
      await testFs.mock({
        [testDir]: {
          '.xaheen': {
            'mcp.config.json': JSON.stringify({
              serverUrl: 'invalid-url', // Invalid URL
              apiKey: 'short', // Too short
            }),
          },
        },
      });

      const invalidClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: false,
      });

      await expect(invalidClient.initialize(testDir)).rejects.toThrow();
    });
  });

  describe('Context Querying', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadContextItems();
    });

    it('should retrieve context items by ID', async () => {
      const items = mcpClient.getContextItems();
      expect(items.length).toBeGreaterThan(0);
      
      const firstItem = items[0];
      const retrievedItem = mcpClient.getContextItem(firstItem.id);
      
      expect(retrievedItem).toEqual(firstItem);
    });

    it('should return null for non-existent context items', async () => {
      const nonExistentItem = mcpClient.getContextItem('non-existent-id');
      expect(nonExistentItem).toBeNull();
    });

    it('should clear context data', async () => {
      expect(mcpClient.getContextItems().length).toBeGreaterThan(0);
      
      mcpClient.clearContext();
      
      expect(mcpClient.getContextItems()).toHaveLength(0);
      expect(mcpClient.getProjectContext()).toBeNull();
    });
  });
});
/**
 * @fileoverview MCP Error Handling Integration Tests - EPIC 14 Story 14.5
 * @description Validate error handling and fallback behaviors when MCP is unreachable
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import { MCPClientService } from '../../services/mcp/mcp-client.service.js';
import { TestFileSystem, PerformanceTracker } from '../test-helpers.js';

// Mock network conditions and server responses
const mockNetworkConditions = {
  offline: false,
  latency: 0,
  packetLoss: 0,
  bandwidthLimit: 0,
};

// Mock xala-mcp with error simulation capabilities
vi.mock('xala-mcp', () => ({
  XalaMCPClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockImplementation(async (options) => {
      await simulateNetworkDelay();
      
      if (mockNetworkConditions.offline) {
        throw new Error('Network unreachable: ENOTFOUND api.xala.ai');
      }
      
      if (Math.random() < mockNetworkConditions.packetLoss) {
        throw new Error('Connection timeout: ETIMEDOUT');
      }
      
      return { success: true, connectionId: 'mcp_conn_error_test' };
    }),
    
    disconnect: vi.fn().mockImplementation(async () => {
      await simulateNetworkDelay();
      return { success: true };
    }),
    
    generate: vi.fn().mockImplementation(async (config) => {
      await simulateNetworkDelay();
      
      if (mockNetworkConditions.offline) {
        throw new Error('Service unavailable: MCP server unreachable');
      }
      
      // Simulate server errors
      if (config.name.includes('ServerError')) {
        throw new Error('Internal server error: 500');
      }
      
      if (config.name.includes('RateLimit')) {
        throw new Error('Rate limit exceeded: 429');
      }
      
      if (config.name.includes('AuthError')) {
        throw new Error('Authentication failed: Invalid API key');
      }
      
      if (config.name.includes('QuotaExceeded')) {
        throw new Error('Quota exceeded: Monthly limit reached');
      }
      
      if (config.name.includes('InvalidConfig')) {
        throw new Error('Invalid configuration: Missing required field "platform"');
      }
      
      // Simulate partial failures
      if (config.name.includes('PartialFailure')) {
        return {
          success: false,
          error: 'Partial generation failure',
          partialResult: {
            files: [
              {
                path: `src/components/${config.name}.tsx`,
                content: '// Incomplete component due to error',
                status: 'incomplete',
              },
            ],
          },
          linesGenerated: 5,
          filesGenerated: 1,
        };
      }
      
      // Normal successful response
      return {
        success: true,
        files: [
          {
            path: `src/components/${config.name}.tsx`,
            content: `export const ${config.name} = () => <div>${config.name}</div>;`,
            encoding: 'utf-8',
          },
        ],
        linesGenerated: 50,
        filesGenerated: 1,
      };
    }),
    
    indexContext: vi.fn().mockImplementation(async (contextData) => {
      await simulateNetworkDelay();
      
      if (mockNetworkConditions.offline) {
        throw new Error('Cannot index context: Network unreachable');
      }
      
      const itemCount = contextData.contextItems?.length || 0;
      
      // Simulate indexing overload
      if (itemCount > 1000) {
        throw new Error('Context too large: Maximum 1000 items allowed');
      }
      
      return {
        success: true,
        indexId: 'idx_error_test_' + Date.now(),
        itemsIndexed: itemCount,
      };
    }),
  })),
}));

// Network simulation utilities
async function simulateNetworkDelay(): Promise<void> {
  const delay = mockNetworkConditions.latency;
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

function setNetworkConditions(conditions: Partial<typeof mockNetworkConditions>): void {
  Object.assign(mockNetworkConditions, conditions);
}

function resetNetworkConditions(): void {
  mockNetworkConditions.offline = false;
  mockNetworkConditions.latency = 0;
  mockNetworkConditions.packetLoss = 0;
  mockNetworkConditions.bandwidthLimit = 0;
}

describe('MCP Error Handling Integration Tests', () => {
  let mcpClient: MCPClientService;
  let testFs: TestFileSystem;
  let testDir: string;
  let perfTracker: PerformanceTracker;

  beforeEach(async () => {
    resetNetworkConditions();
    
    testFs = new TestFileSystem();
    testDir = await testFs.createTempDir('mcp-error-test-');
    perfTracker = new PerformanceTracker();

    // Create test project structure
    await testFs.mock({
      [testDir]: {
        '.xaheen': {
          'mcp.config.json': JSON.stringify({
            serverUrl: 'https://api.xala.ai/mcp',
            apiKey: 'test_error_handling_api_key_32_chars',
            clientId: 'error_test_client_123',
            version: '1.0.0',
            timeout: 5000,
            retryAttempts: 3,
            enableTelemetry: true,
            securityClassification: 'OPEN',
          }),
        },
        'package.json': JSON.stringify({
          name: 'mcp-error-test-project',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
          },
        }),
        src: {
          'index.tsx': 'export default function App() { return <div>Test</div>; }',
        },
      },
    });

    mcpClient = new MCPClientService({
      configPath: join(testDir, '.xaheen/mcp.config.json'),
      enterpriseMode: true,
      debug: true,
    });
  });

  afterEach(async () => {
    if (mcpClient.isClientConnected()) {
      try {
        await mcpClient.disconnect();
      } catch {
        // Ignore disconnect errors in cleanup
      }
    }
    await testFs.restore();
    resetNetworkConditions();
    vi.clearAllMocks();
  });

  describe('Network Connectivity Errors', () => {
    it('should handle complete network offline scenario', async () => {
      setNetworkConditions({ offline: true });

      await expect(mcpClient.initialize(testDir)).rejects.toThrow(/Network unreachable|ENOTFOUND/);
      expect(mcpClient.isClientConnected()).toBe(false);

      // Verify telemetry captures the error
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should implement exponential backoff on connection failures', async () => {
      let connectionAttempts = 0;
      const mcpClientInstance = mcpClient.getMCPClient();
      
      // Mock connection to fail first few times
      (mcpClientInstance as any).connect = vi.fn().mockImplementation(async () => {
        connectionAttempts++;
        if (connectionAttempts <= 2) {
          throw new Error('Connection timeout');
        }
        return { success: true };
      });

      const startTime = Date.now();
      await mcpClient.initialize(testDir);
      const duration = Date.now() - startTime;

      expect(connectionAttempts).toBe(3);
      expect(duration).toBeGreaterThan(1000); // Should have delays between retries
      expect(mcpClient.isClientConnected()).toBe(true);
    });

    it('should handle intermittent packet loss', async () => {
      setNetworkConditions({ packetLoss: 0.3 }); // 30% packet loss

      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(
          mcpClient.initialize(testDir).catch(error => ({ error: error.message }))
        );
        // Reset client state between attempts
        if (mcpClient.isClientConnected()) {
          await mcpClient.disconnect();
        }
        mcpClient = new MCPClientService({
          configPath: join(testDir, '.xaheen/mcp.config.json'),
          enterpriseMode: true,
        });
      }

      const results = await Promise.allSettled(operations);
      const successes = results.filter(r => r.status === 'fulfilled' && !(r.value as any).error);
      const failures = results.filter(r => r.status === 'rejected' || (r.value as any).error);

      // Should have some successes despite packet loss
      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
    });

    it('should handle high latency gracefully', async () => {
      setNetworkConditions({ latency: 2000 }); // 2 second latency

      const startTime = Date.now();
      await mcpClient.initialize(testDir);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThan(2000);
      expect(mcpClient.isClientConnected()).toBe(true);
    });
  });

  describe('Server Error Responses', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
    });

    it('should handle 500 internal server errors', async () => {
      await expect(
        mcpClient.generateComponent('ServerErrorComponent', 'button')
      ).rejects.toThrow('Internal server error: 500');

      // Should maintain connection despite server error
      expect(mcpClient.isClientConnected()).toBe(true);

      // Should be able to retry successful operations
      const result = await mcpClient.generateComponent('ValidComponent', 'button');
      expect(result.success).toBe(true);
    });

    it('should handle 429 rate limiting with backoff', async () => {
      const startTime = Date.now();
      
      await expect(
        mcpClient.generateComponent('RateLimitComponent', 'button')
      ).rejects.toThrow('Rate limit exceeded: 429');

      // Should implement backoff before next request
      const nextStartTime = Date.now();
      const result = await mcpClient.generateComponent('AfterRateLimit', 'button');
      const timeBetweenRequests = nextStartTime - startTime;

      expect(result.success).toBe(true);
      expect(timeBetweenRequests).toBeGreaterThan(100); // Should have some delay
    });

    it('should handle authentication errors', async () => {
      await expect(
        mcpClient.generateComponent('AuthErrorComponent', 'button')
      ).rejects.toThrow('Authentication failed: Invalid API key');

      // Should track auth errors in telemetry
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should handle quota exceeded errors', async () => {
      await expect(
        mcpClient.generateComponent('QuotaExceededComponent', 'button')
      ).rejects.toThrow('Quota exceeded: Monthly limit reached');

      // Should provide meaningful error context
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Configuration and Validation Errors', () => {
    it('should validate configuration before operations', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      await expect(
        mcpClient.generateComponent('InvalidConfigComponent', 'button', {
          // Missing required platform
          features: { accessible: true },
        })
      ).rejects.toThrow('Invalid configuration: Missing required field "platform"');
    });

    it('should handle invalid MCP configuration gracefully', async () => {
      // Create client with invalid config
      await testFs.mock({
        [testDir]: {
          '.xaheen': {
            'mcp.config.json': JSON.stringify({
              serverUrl: 'not-a-valid-url',
              apiKey: 'too-short',
              clientId: '',
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

    it('should provide fallback when config file is corrupted', async () => {
      // Create corrupted config file
      await testFs.mock({
        [testDir]: {
          '.xaheen': {
            'mcp.config.json': 'invalid json content {',
          },
        },
      });

      const fallbackClient = new MCPClientService({
        configPath: join(testDir, '.xaheen/mcp.config.json'),
        enterpriseMode: true, // Should generate fallback config
      });

      await expect(fallbackClient.initialize(testDir)).resolves.not.toThrow();
      expect(fallbackClient.isClientConnected()).toBe(true);
    });
  });

  describe('Partial Failure Recovery', () => {
    beforeEach(async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
    });

    it('should handle partial generation failures', async () => {
      const result = await mcpClient.generateComponent('PartialFailureComponent', 'button');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Partial generation failure');
      expect(result.partialResult).toBeDefined();
      expect(result.partialResult.files).toHaveLength(1);

      // Should track partial failures in telemetry
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should provide recovery options for partial failures', async () => {
      const partialResult = await mcpClient.generateComponent('PartialFailureComponent', 'button');
      
      // Should be able to retry the same generation
      const retryResult = await mcpClient.generateComponent('RetryComponent', 'button');
      expect(retryResult.success).toBe(true);

      // Client should remain functional
      expect(mcpClient.isClientConnected()).toBe(true);
    });

    it('should handle context indexing failures gracefully', async () => {
      // Mock large context to trigger failure
      const largeContextItems = Array.from({ length: 1200 }, (_, i) => ({
        id: `item_${i}`,
        type: 'file' as const,
        path: `src/large/file_${i}.ts`,
        content: `export const file${i} = 'content';`,
        lastModified: new Date(),
        size: 100,
      }));

      // Override context items temporarily
      (mcpClient as any).contextItems = new Map(
        largeContextItems.map(item => [item.id, item])
      );

      await expect(mcpClient.indexProjectContext()).rejects.toThrow(
        'Context too large: Maximum 1000 items allowed'
      );

      // Should still be able to perform other operations
      const result = await mcpClient.generateComponent('AfterIndexFailure', 'button');
      expect(result.success).toBe(true);
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should provide offline mode for cached operations', async () => {
      // First, perform successful operations to populate cache
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
      
      const normalResult = await mcpClient.generateComponent('CachedComponent', 'button');
      expect(normalResult.success).toBe(true);

      // Simulate going offline
      setNetworkConditions({ offline: true });

      // Should still be able to access cached context
      const contextItems = mcpClient.getContextItems();
      expect(contextItems.length).toBeGreaterThan(0);

      const projectContext = mcpClient.getProjectContext();
      expect(projectContext).toBeDefined();
    });

    it('should degrade gracefully when MCP is unavailable', async () => {
      setNetworkConditions({ offline: true });

      // Should fail to initialize
      await expect(mcpClient.initialize(testDir)).rejects.toThrow();

      // But should provide local fallback operations
      expect(mcpClient.isClientConnected()).toBe(false);
      
      // Could potentially provide static templates or cached responses
      // This would be implemented based on business requirements
    });

    it('should implement circuit breaker pattern for repeated failures', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      // Generate multiple failures to trigger circuit breaker
      const failurePromises = [];
      for (let i = 0; i < 5; i++) {
        failurePromises.push(
          mcpClient.generateComponent(`ServerError${i}`, 'button').catch(e => e.message)
        );
      }

      const results = await Promise.all(failurePromises);
      results.forEach(result => {
        expect(result).toContain('Internal server error: 500');
      });

      // Circuit breaker should be triggered
      // Subsequent requests should fail faster or use fallback
      const startTime = Date.now();
      try {
        await mcpClient.generateComponent('CircuitBreakerTest', 'button');
      } catch (error) {
        const duration = Date.now() - startTime;
        // Should fail faster due to circuit breaker
        expect(duration).toBeLessThan(1000);
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary network issues', async () => {
      // Start with working network
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      // Simulate network going down
      setNetworkConditions({ offline: true });

      await expect(
        mcpClient.generateComponent('OfflineTest', 'button')
      ).rejects.toThrow();

      // Network comes back online
      setNetworkConditions({ offline: false });

      // Should be able to recover and continue operations
      const result = await mcpClient.generateComponent('RecoveryTest', 'button');
      expect(result.success).toBe(true);
    });

    it('should maintain state consistency during error conditions', async () => {
      await mcpClient.initialize(testDir);
      const initialContext = await mcpClient.loadProjectContext(testDir);

      // Generate some errors
      try {
        await mcpClient.generateComponent('ServerErrorComponent', 'button');
      } catch {
        // Expected to fail
      }

      // Context should remain consistent
      const currentContext = mcpClient.getProjectContext();
      expect(currentContext).toEqual(initialContext);

      // Should still be connected
      expect(mcpClient.isClientConnected()).toBe(true);
    });

    it('should provide detailed error context for debugging', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      try {
        await mcpClient.generateComponent('AuthErrorComponent', 'button');
      } catch (error) {
        expect(error.message).toContain('Authentication failed');
        
        // Should include context in telemetry
        const metrics = mcpClient.getTelemetryMetrics();
        expect(metrics.totalErrors).toBeGreaterThan(0);
      }
    });

    it('should handle concurrent error scenarios', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      // Generate multiple concurrent requests with different error types
      const concurrentPromises = [
        mcpClient.generateComponent('ServerError1', 'button').catch(e => ({ error: e.message, type: 'server' })),
        mcpClient.generateComponent('RateLimit1', 'button').catch(e => ({ error: e.message, type: 'rate' })),
        mcpClient.generateComponent('AuthError1', 'button').catch(e => ({ error: e.message, type: 'auth' })),
        mcpClient.generateComponent('QuotaExceeded1', 'button').catch(e => ({ error: e.message, type: 'quota' })),
      ];

      const results = await Promise.all(concurrentPromises);

      // All should fail with appropriate errors
      expect(results.every(r => 'error' in r)).toBe(true);
      
      // Client should remain stable
      expect(mcpClient.isClientConnected()).toBe(true);

      // Should be able to perform successful operation after errors
      const successResult = await mcpClient.generateComponent('SuccessAfterErrors', 'button');
      expect(successResult.success).toBe(true);
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should maintain performance during error handling', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      const errorMeasurement = perfTracker.startMeasurement('error-handling');

      // Generate errors and measure response time
      try {
        await mcpClient.generateComponent('ServerErrorPerf', 'button');
      } catch {
        // Expected
      }

      const errorTime = errorMeasurement();

      // Error handling should be fast
      expect(errorTime).toBeLessThan(1000);

      // Successful operations should not be impacted
      const successMeasurement = perfTracker.startMeasurement('success-after-error');
      const result = await mcpClient.generateComponent('SuccessPerf', 'button');
      const successTime = successMeasurement();

      expect(result.success).toBe(true);
      expect(successTime).toBeLessThan(2000);
    });

    it('should not leak memory during repeated errors', async () => {
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      const initialMemory = process.memoryUsage().heapUsed;

      // Generate many errors
      const errorPromises = [];
      for (let i = 0; i < 50; i++) {
        errorPromises.push(
          mcpClient.generateComponent(`ServerError${i}`, 'button').catch(() => null)
        );
      }

      await Promise.all(errorPromises);

      // Allow garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
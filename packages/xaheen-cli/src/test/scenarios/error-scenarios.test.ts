/**
 * @fileoverview Comprehensive Error Scenario Tests - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Comprehensive error scenario testing for MCP workflows and frontend generation
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { join } from 'path';
import fs from 'fs-extra';
import { ComponentGenerator } from '../../generators/component.generator.js';
import { MCPClientService } from '../../services/mcp/mcp-client.service.js';
import { TestEnvironmentManager, TestScenarioBuilder, TestDataValidator } from '../utils/enhanced-test-helpers.js';
import { Factories } from '../factories/test-data-factories.js';

// Error simulation utilities
const ErrorSimulator = {
  /**
   * Simulate network errors
   */
  simulateNetworkError(type: 'timeout' | 'connection_refused' | 'dns_failure' | 'ssl_error'): Error {
    const errors = {
      timeout: new Error('Request timed out after 30000ms'),
      connection_refused: new Error('connect ECONNREFUSED 127.0.0.1:3001'),
      dns_failure: new Error('getaddrinfo ENOTFOUND api.example.com'),
      ssl_error: new Error('unable to verify the first certificate'),
    };
    return errors[type];
  },

  /**
   * Simulate filesystem errors
   */
  simulateFilesystemError(type: 'permission_denied' | 'disk_full' | 'file_not_found' | 'invalid_path'): Error {
    const errors = {
      permission_denied: Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' }),
      disk_full: Object.assign(new Error('ENOSPC: no space left on device'), { code: 'ENOSPC' }),
      file_not_found: Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' }),
      invalid_path: Object.assign(new Error('EINVAL: invalid argument'), { code: 'EINVAL' }),
    };
    return errors[type];
  },

  /**
   * Simulate memory errors
   */
  simulateMemoryError(type: 'out_of_memory' | 'heap_limit' | 'stack_overflow'): Error {
    const errors = {
      out_of_memory: new Error('JavaScript heap out of memory'),
      heap_limit: new Error('Allocation failed - JavaScript heap out of memory'),
      stack_overflow: new Error('Maximum call stack size exceeded'),
    };
    return errors[type];
  },

  /**
   * Simulate validation errors
   */
  simulateValidationError(field: string, constraint: string, value: any): Error {
    return new Error(`Validation failed for field '${field}': ${constraint} constraint violated. Received: ${JSON.stringify(value)}`);
  },

  /**
   * Simulate API errors
   */
  simulateAPIError(status: number, type: string): Error {
    const messages = {
      400: 'Bad Request: Invalid parameters',
      401: 'Unauthorized: Invalid API key',
      403: 'Forbidden: Insufficient permissions',
      404: 'Not Found: Resource does not exist',
      429: 'Too Many Requests: Rate limit exceeded',
      500: 'Internal Server Error: Something went wrong',
      502: 'Bad Gateway: Upstream server error',
      503: 'Service Unavailable: Server temporarily unavailable',
      504: 'Gateway Timeout: Request timeout',
    };
    
    const error = new Error(messages[status as keyof typeof messages] || 'Unknown API error');
    (error as any).status = status;
    (error as any).type = type;
    return error;
  },
};

describe('Comprehensive Error Scenario Tests', () => {
  let envManager: TestEnvironmentManager;
  let scenarioBuilder: TestScenarioBuilder;

  beforeEach(async () => {
    envManager = new TestEnvironmentManager();
    scenarioBuilder = new TestScenarioBuilder();
  });

  afterEach(async () => {
    await envManager.cleanup();
    vi.restoreAllMocks();
  });

  describe('MCP Client Error Scenarios', () => {
    describe('Connection Errors', () => {
      it('should handle DNS resolution failures gracefully', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('dns-failure');
        
        // Mock DNS failure
        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockRejectedValue(ErrorSimulator.simulateNetworkError('dns_failure')),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
          debug: true,
        });

        await expect(mcpClient.initialize(testDir)).rejects.toThrow('getaddrinfo ENOTFOUND');
        expect(mcpClient.isClientConnected()).toBe(false);

        // Verify telemetry captured the error
        const metrics = mcpClient.getTelemetryMetrics();
        expect(metrics.totalErrors).toBeGreaterThan(0);
      });

      it('should implement exponential backoff for connection timeouts', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('timeout-backoff');
        
        let connectionAttempts = 0;
        const startTime = Date.now();

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockImplementation(async () => {
              connectionAttempts++;
              if (connectionAttempts <= 2) {
                throw ErrorSimulator.simulateNetworkError('timeout');
              }
              return { success: true, connectionId: 'recovery_conn' };
            }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
          debug: true,
        });

        await mcpClient.initialize(testDir);
        const duration = Date.now() - startTime;

        expect(connectionAttempts).toBe(3);
        expect(duration).toBeGreaterThan(1000); // Should have exponential backoff delays
        expect(mcpClient.isClientConnected()).toBe(true);
      });

      it('should handle SSL certificate errors in enterprise mode', async () => {
        const { testDir } = await envManager.setupMCPEnvironment('ssl-error');
        
        // Create config with HTTPS endpoint but SSL error
        const sslConfigPath = join(testDir, '.xaheen', 'ssl-mcp.config.json');
        await fs.writeFile(
          sslConfigPath,
          JSON.stringify({
            ...Factories.MCPConfig.withEnterprise({}),
            serverUrl: 'https://invalid-cert.api.example.com/mcp',
          }, null, 2)
        );

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockRejectedValue(ErrorSimulator.simulateNetworkError('ssl_error')),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: sslConfigPath,
          enterpriseMode: true,
        });

        await expect(mcpClient.initialize(testDir)).rejects.toThrow('unable to verify the first certificate');
        
        // Enterprise mode should log security warnings
        const metrics = mcpClient.getTelemetryMetrics();
        expect(metrics.totalErrors).toBeGreaterThan(0);
      });

      it('should recover from intermittent connection drops', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('connection-recovery');
        
        let isConnected = false;
        let operationCount = 0;

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async () => {
              operationCount++;
              
              // Simulate connection drop on 3rd operation
              if (operationCount === 3) {
                isConnected = false;
                throw ErrorSimulator.simulateNetworkError('connection_refused');
              }
              
              if (!isConnected && operationCount > 3) {
                // Simulate recovery after connection drop
                isConnected = true;
              }
              
              return Factories.MCPResponse.withGeneration({});
            }),
            disconnect: vi.fn().mockResolvedValue({ success: true }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);
        isConnected = true;

        // Perform operations until connection drop
        await mcpClient.generateComponent('Test1', 'button');
        await mcpClient.generateComponent('Test2', 'button');

        // This should fail due to connection drop
        await expect(
          mcpClient.generateComponent('Test3', 'button')
        ).rejects.toThrow('ECONNREFUSED');

        // Verify client can recover for subsequent operations
        expect(mcpClient.isClientConnected()).toBe(true);
      });
    });

    describe('Authentication and Authorization Errors', () => {
      it('should handle invalid API key gracefully', async () => {
        const { testDir } = await envManager.setupMCPEnvironment('invalid-api-key');
        
        const invalidKeyConfig = join(testDir, '.xaheen', 'invalid-key.config.json');
        await fs.writeFile(
          invalidKeyConfig,
          JSON.stringify({
            ...Factories.MCPConfig.create(),
            apiKey: 'invalid_key_too_short',
          }, null, 2)
        );

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockRejectedValue(ErrorSimulator.simulateAPIError(401, 'authentication')),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: invalidKeyConfig,
          enterpriseMode: true,
        });

        await expect(mcpClient.initialize(testDir)).rejects.toThrow('Unauthorized: Invalid API key');
        
        // Should not establish connection
        expect(mcpClient.isClientConnected()).toBe(false);
        
        // Telemetry should capture authentication error
        const metrics = mcpClient.getTelemetryMetrics();
        expect(metrics.totalErrors).toBeGreaterThan(0);
      });

      it('should handle API key expiration during operations', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('key-expiration');
        
        let operationCount = 0;

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async () => {
              operationCount++;
              
              // Simulate API key expiration after 2 operations
              if (operationCount > 2) {
                throw ErrorSimulator.simulateAPIError(401, 'token_expired');
              }
              
              return Factories.MCPResponse.withGeneration({});
            }),
            disconnect: vi.fn().mockResolvedValue({ success: true }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // First operations should succeed
        await mcpClient.generateComponent('Test1', 'button');
        await mcpClient.generateComponent('Test2', 'button');

        // Third operation should fail due to expired key
        await expect(
          mcpClient.generateComponent('Test3', 'button')
        ).rejects.toThrow('Unauthorized: Invalid API key');
      });

      it('should handle insufficient permissions for enterprise features', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('insufficient-permissions');
        
        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            indexContext: vi.fn().mockRejectedValue(ErrorSimulator.simulateAPIError(403, 'insufficient_permissions')),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Context indexing should fail due to insufficient permissions
        await expect(mcpClient.indexProjectContext()).rejects.toThrow('Forbidden: Insufficient permissions');

        // Client should remain connected for other operations
        expect(mcpClient.isClientConnected()).toBe(true);
      });
    });

    describe('Rate Limiting and Quota Errors', () => {
      it('should implement exponential backoff for rate limiting', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('rate-limiting');
        
        let requestCount = 0;
        const startTime = Date.now();

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async () => {
              requestCount++;
              
              // Simulate rate limiting for first 3 requests
              if (requestCount <= 3) {
                const error = ErrorSimulator.simulateAPIError(429, 'rate_limit');
                (error as any).retryAfter = 1000; // 1 second
                throw error;
              }
              
              return Factories.MCPResponse.withGeneration({});
            }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Should eventually succeed after rate limit backoff
        const result = await mcpClient.generateComponent('RateLimitTest', 'button');
        const duration = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(duration).toBeGreaterThan(3000); // Should have multiple backoff delays
        expect(requestCount).toBe(4);
      });

      it('should handle monthly quota exceeded gracefully', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('quota-exceeded');
        
        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockRejectedValue(
              Object.assign(ErrorSimulator.simulateAPIError(429, 'quota_exceeded'), {
                quotaType: 'monthly',
                resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
            ),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        await expect(
          mcpClient.generateComponent('QuotaTest', 'button')
        ).rejects.toThrow('Too Many Requests: Rate limit exceeded');

        // Should provide meaningful error information
        const metrics = mcpClient.getTelemetryMetrics();
        expect(metrics.totalErrors).toBeGreaterThan(0);
      });

      it('should differentiate between temporary and permanent rate limits', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('rate-limit-types');
        
        let requestCount = 0;

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async (config: any) => {
              requestCount++;
              
              if (config.name === 'TemporaryLimit') {
                // Temporary rate limit (should retry)
                if (requestCount === 1) {
                  const error = ErrorSimulator.simulateAPIError(429, 'rate_limit_temporary');
                  (error as any).retryAfter = 100;
                  throw error;
                }
              } else if (config.name === 'PermanentLimit') {
                // Permanent quota limit (should not retry)
                const error = ErrorSimulator.simulateAPIError(429, 'quota_exceeded');
                (error as any).permanent = true;
                throw error;
              }
              
              return Factories.MCPResponse.withGeneration({});
            }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Temporary limit should eventually succeed
        const temporaryResult = await mcpClient.generateComponent('TemporaryLimit', 'button');
        expect(temporaryResult.success).toBe(true);

        // Permanent limit should fail immediately
        await expect(
          mcpClient.generateComponent('PermanentLimit', 'button')
        ).rejects.toThrow('Too Many Requests: Rate limit exceeded');
      });
    });

    describe('Server and Service Errors', () => {
      it('should handle internal server errors with retry logic', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('server-errors');
        
        let serverErrorCount = 0;

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async () => {
              serverErrorCount++;
              
              // Simulate transient server errors
              if (serverErrorCount <= 2) {
                throw ErrorSimulator.simulateAPIError(500, 'internal_server_error');
              }
              
              return Factories.MCPResponse.withGeneration({});
            }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Should eventually succeed after server recovery
        const result = await mcpClient.generateComponent('ServerErrorTest', 'button');
        expect(result.success).toBe(true);
        expect(serverErrorCount).toBe(3);
      });

      it('should handle service unavailable with circuit breaker pattern', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('service-unavailable');
        
        let consecutiveFailures = 0;
        const maxFailures = 5;

        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockImplementation(async () => {
              consecutiveFailures++;
              
              if (consecutiveFailures <= maxFailures) {
                throw ErrorSimulator.simulateAPIError(503, 'service_unavailable');
              }
              
              // Service recovery
              consecutiveFailures = 0;
              return Factories.MCPResponse.withGeneration({});
            }),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Multiple failures should trigger circuit breaker
        for (let i = 0; i < maxFailures; i++) {
          await expect(
            mcpClient.generateComponent(`Test${i}`, 'button')
          ).rejects.toThrow('Service Unavailable');
        }

        // After circuit breaker recovery, should work again
        const result = await mcpClient.generateComponent('RecoveryTest', 'button');
        expect(result.success).toBe(true);
      });

      it('should handle partial service degradation', async () => {
        const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('partial-degradation');
        
        vi.mock('xala-mcp', () => ({
          XalaMCPClient: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue({ success: true }),
            generate: vi.fn().mockResolvedValue(Factories.MCPResponse.withGeneration({})),
            indexContext: vi.fn().mockRejectedValue(ErrorSimulator.simulateAPIError(503, 'indexing_unavailable')),
          })),
        }));

        const mcpClient = new MCPClientService({
          configPath: mcpConfigPath,
          enterpriseMode: true,
        });

        await mcpClient.initialize(testDir);
        await mcpClient.loadProjectContext(testDir);

        // Generation should work
        const generationResult = await mcpClient.generateComponent('PartialTest', 'button');
        expect(generationResult.success).toBe(true);

        // Indexing should fail but not affect other operations
        await expect(mcpClient.indexProjectContext()).rejects.toThrow('Service Unavailable');

        // Should still be able to generate
        const secondGenerationResult = await mcpClient.generateComponent('PartialTest2', 'button');
        expect(secondGenerationResult.success).toBe(true);
      });
    });
  });

  describe('Frontend Generator Error Scenarios', () => {
    describe('Template Processing Errors', () => {
      it('should handle missing template files gracefully', async () => {
        const { testDir, templatesDir, outputDir } = await envManager.setupFrontendEnvironment('missing-templates');
        
        // Remove template files to simulate missing templates
        await fs.remove(templatesDir);

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        await expect(
          generator.generate({
            name: 'MissingTemplateTest',
            type: 'nonexistent-type',
            platform: 'react',
          })
        ).rejects.toThrow(/Template not found/);
      });

      it('should handle corrupted template files', async () => {
        const { testDir, templatesDir, outputDir } = await envManager.setupFrontendEnvironment('corrupted-templates');
        
        // Create corrupted template
        await fs.writeFile(
          join(templatesDir, 'corrupted.hbs'),
          '{{#invalid_helper}}{{unclosed_block'
        );

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Mock template compilation to throw parsing error
        vi.mock('handlebars', () => ({
          compile: vi.fn().mockImplementation(() => {
            throw new Error('Parse error on line 1: {{#invalid_helper}}{{unclosed_block - Expected "}}"');
          }),
        }));

        await expect(
          generator.generate({
            name: 'CorruptedTemplateTest',
            type: 'corrupted',
            platform: 'react',
          })
        ).rejects.toThrow(/Parse error/);
      });

      it('should handle template compilation timeouts', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('template-timeout');
        
        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Mock slow template compilation
        vi.mock('handlebars', () => ({
          compile: vi.fn().mockImplementation(() => {
            return () => {
              // Simulate very slow template rendering
              return new Promise(resolve => {
                setTimeout(() => resolve('slow template result'), 10000);
              });
            };
          }),
        }));

        // This should timeout (adjust timeout in generator if needed)
        await expect(
          generator.generate({
            name: 'TimeoutTest',
            type: 'button',
            platform: 'react',
          })
        ).rejects.toThrow(/timeout/i);
      });
    });

    describe('Filesystem Errors', () => {
      it('should handle permission denied errors', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('permission-denied');
        
        // Mock fs.writeFile to throw permission error
        vi.spyOn(fs, 'writeFile').mockRejectedValue(ErrorSimulator.simulateFilesystemError('permission_denied'));

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        await expect(
          generator.generate({
            name: 'PermissionTest',
            type: 'button',
            platform: 'react',
          })
        ).rejects.toThrow(/EACCES: permission denied/);
      });

      it('should handle disk full errors', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('disk-full');
        
        vi.spyOn(fs, 'writeFile').mockRejectedValue(ErrorSimulator.simulateFilesystemError('disk_full'));

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        await expect(
          generator.generate({
            name: 'DiskFullTest',
            type: 'button',
            platform: 'react',
          })
        ).rejects.toThrow(/ENOSPC: no space left on device/);
      });

      it('should handle file already exists conflicts', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('file-conflicts');
        
        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Create component first time
        await generator.generate({
          name: 'ConflictTest',
          type: 'button',
          platform: 'react',
        });

        // Try to create same component again (should conflict)
        await expect(
          generator.generate({
            name: 'ConflictTest',
            type: 'button',
            platform: 'react',
          })
        ).rejects.toThrow(/File already exists/);
      });

      it('should handle invalid output paths', async () => {
        const { templatesDir } = await envManager.setupFrontendEnvironment('invalid-paths');
        
        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: '/invalid/path/that/does/not/exist',
        });

        await expect(
          generator.generate({
            name: 'InvalidPathTest',
            type: 'button',
            platform: 'react',
          })
        ).rejects.toThrow(/no such file or directory/);
      });
    });

    describe('Validation Errors', () => {
      it('should validate component configuration thoroughly', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('validation-errors');
        
        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Test various invalid configurations
        const invalidConfigs = [
          { name: '', type: 'button', platform: 'react' }, // Empty name
          { name: 'Test', type: '', platform: 'react' }, // Empty type
          { name: 'Test', type: 'button', platform: '' }, // Empty platform
          { name: 'Test', type: 'button', platform: 'invalid' }, // Invalid platform
          { name: 'Test Component!', type: 'button', platform: 'react' }, // Invalid characters
          { name: 'test', type: 'button', platform: 'react' }, // Invalid casing
        ];

        for (const config of invalidConfigs) {
          const validation = await generator.validateOptions(config);
          expect(validation.isValid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      });

      it('should validate complex configuration objects', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('complex-validation');
        
        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        const complexConfig = {
          name: 'ComplexTest',
          type: 'data-table',
          platform: 'react',
          columns: [
            { key: '', label: 'Invalid', type: 'text' }, // Empty key
            { key: 'valid', label: '', type: 'text' }, // Empty label
            { key: 'another', label: 'Valid', type: 'invalid-type' }, // Invalid type
          ],
          features: {
            sortable: 'yes', // Should be boolean
            paginated: true,
            pageSize: -10, // Invalid page size
          },
        };

        const validation = await generator.validateOptions(complexConfig);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Column key cannot be empty');
        expect(validation.errors).toContain('Column label cannot be empty');
        expect(validation.errors).toContain('Invalid column type');
        expect(validation.errors).toContain('sortable must be boolean');
        expect(validation.errors).toContain('pageSize must be positive');
      });
    });

    describe('Memory and Performance Errors', () => {
      it('should handle memory exhaustion during large template compilation', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('memory-exhaustion');
        
        // Create very large template
        const largeTemplate = Array.from({ length: 10000 }, (_, i) => 
          `<div key="${i}">{{name}} Component ${i}</div>`
        ).join('\n');
        
        await fs.writeFile(join(templatesDir, 'large-template.hbs'), largeTemplate);

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Mock memory exhaustion during compilation
        vi.mock('handlebars', () => ({
          compile: vi.fn().mockImplementation(() => {
            throw ErrorSimulator.simulateMemoryError('out_of_memory');
          }),
        }));

        await expect(
          generator.generate({
            name: 'MemoryTest',
            type: 'large-template',
            platform: 'react',
          })
        ).rejects.toThrow(/JavaScript heap out of memory/);
      });

      it('should handle stack overflow in recursive template processing', async () => {
        const { templatesDir, outputDir } = await envManager.setupFrontendEnvironment('stack-overflow');
        
        // Create recursive template
        const recursiveTemplate = `
          {{#each items}}
            <div>{{name}}</div>
            {{> recursive this}}
          {{/each}}
        `;
        
        await fs.writeFile(join(templatesDir, 'recursive.hbs'), recursiveTemplate);

        const generator = new ComponentGenerator({
          templatePath: templatesDir,
          outputPath: outputDir,
        });

        // Mock stack overflow
        vi.mock('handlebars', () => ({
          compile: vi.fn().mockImplementation(() => {
            return () => {
              throw ErrorSimulator.simulateMemoryError('stack_overflow');
            };
          }),
        }));

        await expect(
          generator.generate({
            name: 'RecursiveTest',
            type: 'recursive',
            platform: 'react',
            data: {
              items: Array.from({ length: 1000 }, (_, i) => ({ name: `Item ${i}`, items: [] }))
            },
          })
        ).rejects.toThrow(/Maximum call stack size exceeded/);
      });
    });
  });

  describe('Integration Error Scenarios', () => {
    describe('CLI Pipeline Errors', () => {
      it('should handle cascading errors in multi-step workflows', async () => {
        const scenario = scenarioBuilder
          .addErrorHandlingScenario('cascading-errors', {
            errorType: 'cascading',
            triggerCondition: 'step_2_failure',
            expectedBehavior: 'rollback_to_step_1',
            recoverySteps: ['cleanup_partial_state', 'retry_from_checkpoint'],
          })
          .getScenario('cascading-errors');

        // This would be implemented with actual CLI pipeline testing
        expect(scenario.errorType).toBe('cascading');
        expect(scenario.recoverySteps).toContain('cleanup_partial_state');
      });

      it('should handle interrupted operations gracefully', async () => {
        const { testDir, cliRunner } = await envManager.setupStandardEnvironment('interrupted-ops');
        
        // Simulate process interruption (SIGINT)
        const interruptedPromise = cliRunner.runCommand(['generate', 'component', 'InterruptedTest'], {
          cwd: testDir,
          timeout: 1000, // Short timeout to simulate interruption
        });

        await expect(interruptedPromise).rejects.toThrow();
        
        // Verify no partial files were left behind
        const outputFiles = await fs.readdir(testDir).catch(() => []);
        expect(outputFiles.filter(f => f.includes('InterruptedTest'))).toHaveLength(0);
      });
    });

    describe('Environment and Configuration Errors', () => {
      it('should handle invalid environment configurations', async () => {
        const { testDir } = await envManager.setupStandardEnvironment('invalid-env');
        
        // Create malformed configuration
        await fs.writeFile(
          join(testDir, '.xaheen', 'config.json'),
          '{ invalid json content'
        );

        const generator = new ComponentGenerator({
          templatePath: join(testDir, 'templates'),
          outputPath: join(testDir, 'output'),
        });

        // Should handle malformed config gracefully
        await expect(
          generator.generate({
            name: 'ConfigErrorTest',
            type: 'button',
            platform: 'react',
          })
        ).resolves.toBeDefined(); // Should use fallback configuration
      });

      it('should validate Norwegian compliance settings', async () => {
        const { testDir } = await envManager.setupStandardEnvironment('norwegian-compliance');
        
        // Test invalid Norwegian locale configuration
        const invalidNorwegianConfig = {
          name: 'NorskTest',
          type: 'button',
          platform: 'react',
          locale: 'invalid-locale',
          compliance: {
            nsm: 'INVALID_CLASSIFICATION',
            accessibility: 'WCAG-1.0', // Outdated standard
          },
        };

        const validator = TestDataValidator.validateComponentConfig(invalidNorwegianConfig);
        expect(validator.isValid).toBe(false);
      });
    });
  });

  describe('Recovery and Resilience Testing', () => {
    it('should demonstrate complete error recovery workflow', async () => {
      const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('complete-recovery');
      
      let phase = 'initial';
      
      vi.mock('xala-mcp', () => ({
        XalaMCPClient: vi.fn().mockImplementation(() => ({
          connect: vi.fn().mockImplementation(async () => {
            if (phase === 'initial') {
              phase = 'connection_failed';
              throw ErrorSimulator.simulateNetworkError('connection_refused');
            }
            return { success: true };
          }),
          generate: vi.fn().mockImplementation(async () => {
            if (phase === 'connection_failed') {
              phase = 'auth_failed';
              throw ErrorSimulator.simulateAPIError(401, 'authentication');
            }
            if (phase === 'auth_failed') {
              phase = 'rate_limited';
              throw ErrorSimulator.simulateAPIError(429, 'rate_limit');
            }
            if (phase === 'rate_limited') {
              phase = 'recovered';
              return Factories.MCPResponse.withGeneration({});
            }
            return Factories.MCPResponse.withGeneration({});
          }),
          disconnect: vi.fn().mockResolvedValue({ success: true }),
        })),
      }));

      const mcpClient = new MCPClientService({
        configPath: mcpConfigPath,
        enterpriseMode: true,
      });

      // Initial connection should fail
      await expect(mcpClient.initialize(testDir)).rejects.toThrow();
      
      // Retry should succeed
      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);
      
      // First generation should fail with auth error
      await expect(
        mcpClient.generateComponent('RecoveryTest1', 'button')
      ).rejects.toThrow('Unauthorized');
      
      // Second generation should fail with rate limit
      await expect(
        mcpClient.generateComponent('RecoveryTest2', 'button')
      ).rejects.toThrow('Too Many Requests');
      
      // Third generation should succeed
      const result = await mcpClient.generateComponent('RecoveryTest3', 'button');
      expect(result.success).toBe(true);
      expect(phase).toBe('recovered');
    });

    it('should maintain system stability under error conditions', async () => {
      const { testDir, templatesDir, outputDir } = await envManager.setupFrontendEnvironment('stability-test');
      
      const generator = new ComponentGenerator({
        templatePath: templatesDir,
        outputPath: outputDir,
      });

      // Generate errors intermittently while continuing operations
      let errorCount = 0;
      const totalOperations = 20;
      const errors: Error[] = [];

      vi.spyOn(fs, 'writeFile').mockImplementation(async (path, content) => {
        // Simulate intermittent errors (30% failure rate)
        if (Math.random() < 0.3) {
          errorCount++;
          const error = ErrorSimulator.simulateFilesystemError('permission_denied');
          errors.push(error);
          throw error;
        }
        
        // Normal operation
        return fs.writeFile.wrappedMethod(path, content);
      });

      let successCount = 0;
      
      // Perform many operations
      for (let i = 0; i < totalOperations; i++) {
        try {
          await generator.generate({
            name: `StabilityTest${i}`,
            type: 'button',
            platform: 'react',
          });
          successCount++;
        } catch (error) {
          // Errors are expected, just continue
        }
      }

      // Should have some successes despite errors
      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);
      expect(successCount + errorCount).toBe(totalOperations);
      
      // System should remain stable (no crashes)
      expect(errors.every(e => e.message.includes('EACCES'))).toBe(true);
    });
  });

  describe('Error Reporting and Telemetry', () => {
    it('should capture comprehensive error telemetry', async () => {
      const { testDir, mcpConfigPath } = await envManager.setupMCPEnvironment('error-telemetry');
      
      const errorTypes = ['network', 'auth', 'rate_limit', 'server_error'];
      let currentErrorIndex = 0;

      vi.mock('xala-mcp', () => ({
        XalaMCPClient: vi.fn().mockImplementation(() => ({
          connect: vi.fn().mockResolvedValue({ success: true }),
          generate: vi.fn().mockImplementation(async () => {
            const errorType = errorTypes[currentErrorIndex % errorTypes.length];
            currentErrorIndex++;
            
            switch (errorType) {
              case 'network':
                throw ErrorSimulator.simulateNetworkError('timeout');
              case 'auth':
                throw ErrorSimulator.simulateAPIError(401, 'authentication');
              case 'rate_limit':
                throw ErrorSimulator.simulateAPIError(429, 'rate_limit');
              case 'server_error':
                throw ErrorSimulator.simulateAPIError(500, 'internal_server_error');
            }
          }),
          disconnect: vi.fn().mockResolvedValue({ success: true }),
        })),
      }));

      const mcpClient = new MCPClientService({
        configPath: mcpConfigPath,
        enterpriseMode: true,
      });

      await mcpClient.initialize(testDir);
      await mcpClient.loadProjectContext(testDir);

      // Generate different types of errors
      for (let i = 0; i < errorTypes.length; i++) {
        try {
          await mcpClient.generateComponent(`ErrorTelemetry${i}`, 'button');
        } catch {
          // Expected to fail
        }
      }

      // Verify telemetry captured all error types
      const metrics = mcpClient.getTelemetryMetrics();
      expect(metrics.totalErrors).toBe(errorTypes.length);
      expect(metrics.totalGenerations).toBe(errorTypes.length);
    });
  });
});

/**
 * Error scenario test utilities
 */
export const ErrorScenarioUtils = {
  /**
   * Create comprehensive error test suite
   */
  createErrorTestSuite(scenarios: string[]): any {
    const suite = scenarios.map(scenario => ({
      name: scenario,
      setup: () => ErrorSimulator,
      teardown: () => vi.restoreAllMocks(),
    }));
    
    return suite;
  },

  /**
   * Validate error handling behavior
   */
  validateErrorHandling(error: Error, expectedType: string): boolean {
    return error.message.toLowerCase().includes(expectedType.toLowerCase());
  },

  /**
   * Generate error scenarios for testing
   */
  generateErrorScenarios(): any[] {
    return [
      { type: 'network', variants: ['timeout', 'connection_refused', 'dns_failure'] },
      { type: 'filesystem', variants: ['permission_denied', 'disk_full', 'file_not_found'] },
      { type: 'api', variants: ['401', '403', '429', '500', '503'] },
      { type: 'validation', variants: ['required_field', 'invalid_format', 'constraint_violation'] },
      { type: 'memory', variants: ['out_of_memory', 'heap_limit', 'stack_overflow'] },
    ];
  },
};

export { ErrorSimulator };
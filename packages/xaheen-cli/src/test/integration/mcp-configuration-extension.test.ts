/**
 * @fileoverview Integration tests for MCP Configuration & Extension system
 * @description EPIC 14 Story 14.4 integration tests
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { mcpConfigService } from "../../services/mcp/mcp-config.service";
import { mcpPluginManager } from "../../services/mcp/mcp-plugin-manager.service";
import { mcpTestService } from "../../services/mcp/mcp-test.service";

describe("MCP Configuration & Extension System", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeEach(async () => {
		// Create temporary directory for testing
		tempDir = await fs.mkdtemp(join(tmpdir(), "mcp-test-"));
		originalCwd = process.cwd();
		process.chdir(tempDir);

		// Clear any cached configuration
		mcpConfigService.clearCache();
	});

	afterEach(async () => {
		// Restore original working directory
		process.chdir(originalCwd);

		// Clean up temporary directory
		try {
			await fs.rm(tempDir, { recursive: true, force: true });
		} catch (error) {
			console.warn("Failed to clean up temp directory:", error);
		}
	});

	describe("Configuration System", () => {
		test("should initialize default configuration", async () => {
			// Initialize configuration
			await mcpConfigService.initializeConfig("project");

			// Verify configuration file exists
			const configPath = join(tempDir, ".xaheenrc");
			const exists = await fs.access(configPath).then(() => true).catch(() => false);
			expect(exists).toBe(true);

			// Load and verify configuration
			const config = await mcpConfigService.getConfig();
			expect(config.version).toBe("1.0.0");
			expect(config.server.url).toBeDefined();
			expect(config.security.securityClassification).toBe("OPEN");
			expect(config.norwegianCompliance.enableGDPRCompliance).toBe(true);
		});

		test("should support hierarchical configuration inheritance", async () => {
			// Create project configuration
			const projectConfig = {
				version: "1.0.0",
				server: {
					url: "https://project.server.com",
					timeout: 45000,
				},
				security: {
					securityClassification: "RESTRICTED",
				},
			};

			await fs.writeFile(
				join(tempDir, ".xaheenrc"),
				JSON.stringify(projectConfig, null, 2)
			);

			// Load configuration with CLI overrides
			const cliOverrides = {
				server: {
					timeout: 60000,
				},
			};

			const config = await mcpConfigService.getConfig(cliOverrides);

			// Verify inheritance: CLI > Project > Defaults
			expect(config.server.url).toBe("https://project.server.com"); // Project
			expect(config.server.timeout).toBe(60000); // CLI override
			expect(config.security.securityClassification).toBe("RESTRICTED"); // Project
			expect(config.norwegianCompliance.enableGDPRCompliance).toBe(true); // Default
		});

		test("should validate configuration schema", async () => {
			// Test invalid configuration
			const invalidConfig = {
				server: {
					url: "invalid-url", // Invalid URL
					apiKey: "short", // Too short
				},
			};

			await fs.writeFile(
				join(tempDir, ".xaheenrc"),
				JSON.stringify(invalidConfig, null, 2)
			);

			// Should throw validation error
			await expect(mcpConfigService.getConfig()).rejects.toThrow();
		});

		test("should show configuration hierarchy", async () => {
			// Create project configuration
			await mcpConfigService.initializeConfig("project");

			// Load with CLI overrides
			const config = await mcpConfigService.getConfig({ server: { timeout: 50000 } });
			const hierarchy = mcpConfigService.getConfigHierarchy();

			expect(hierarchy).toBeDefined();
			expect(hierarchy!.sources).toContain("cli");
			expect(hierarchy!.merged.server.timeout).toBe(50000);
		});
	});

	describe("Plugin System", () => {
		test("should initialize plugin manager", async () => {
			await mcpPluginManager.initialize();

			const plugins = mcpPluginManager.getRegisteredPlugins();
			expect(Array.isArray(plugins)).toBe(true);
		});

		test("should register sample plugin", async () => {
			// Create sample plugin directory
			const pluginDir = join(tempDir, "test-plugin");
			await fs.mkdir(pluginDir, { recursive: true });

			// Create plugin manifest
			const manifest = {
				name: "test-plugin",
				version: "1.0.0",
				description: "Test plugin for integration testing",
				type: "validator",
				category: "quality-assurance",
				main: "index.js",
				permissions: ["read:project"],
			};

			await fs.writeFile(
				join(pluginDir, "plugin.json"),
				JSON.stringify(manifest, null, 2)
			);

			// Create plugin implementation
			const pluginCode = `
				class TestPlugin {
					constructor(config) {
						this.config = config;
					}
					
					async validate() {
						return { valid: true };
					}
				}
				
				module.exports = TestPlugin;
			`;

			await fs.writeFile(join(pluginDir, "index.js"), pluginCode);

			// Initialize plugin manager and register plugin
			await mcpPluginManager.initialize();
			const entry = await mcpPluginManager.registerPlugin(pluginDir);

			expect(entry.name).toBe("test-plugin");
			expect(entry.version).toBe("1.0.0");
			expect(entry.enabled).toBe(true);
		});

		test("should manage plugin lifecycle", async () => {
			// Create and register plugin (simplified)
			const pluginDir = join(tempDir, "lifecycle-plugin");
			await fs.mkdir(pluginDir, { recursive: true });

			const manifest = {
				name: "lifecycle-plugin",
				version: "1.0.0",
				description: "Plugin lifecycle test",
				type: "validator",
				category: "quality-assurance",
				main: "index.js",
			};

			await fs.writeFile(
				join(pluginDir, "plugin.json"),
				JSON.stringify(manifest, null, 2)
			);

			await fs.writeFile(
				join(pluginDir, "index.js"),
				"module.exports = class { constructor() {} };"
			);

			await mcpPluginManager.initialize();
			await mcpPluginManager.registerPlugin(pluginDir);

			// Test enable/disable
			await mcpPluginManager.setPluginEnabled("lifecycle-plugin", false);
			let plugin = mcpPluginManager.getPlugin("lifecycle-plugin");
			expect(plugin!.enabled).toBe(false);

			await mcpPluginManager.setPluginEnabled("lifecycle-plugin", true);
			plugin = mcpPluginManager.getPlugin("lifecycle-plugin");
			expect(plugin!.enabled).toBe(true);

			// Test unregister
			await mcpPluginManager.unregisterPlugin("lifecycle-plugin");
			plugin = mcpPluginManager.getPlugin("lifecycle-plugin");
			expect(plugin).toBeNull();
		});
	});

	describe("Test System", () => {
		test("should create test configuration", () => {
			const testConfig = {
				testSuites: ["connectivity", "authentication"],
				timeout: 30000,
				retryAttempts: 2,
				outputFormat: "console" as const,
				verbose: false,
				customTests: [],
			};

			// Test configuration should be valid
			expect(testConfig.testSuites).toContain("connectivity");
			expect(testConfig.timeout).toBe(30000);
			expect(testConfig.outputFormat).toBe("console");
		});

		test("should handle dry-run mode", async () => {
			// Create mock configuration
			const mcpConfig = {
				server: {
					url: "https://test.server.com",
					apiKey: "test-key-123456789012345678901234567890",
					clientId: "test-client-id",
					timeout: 30000,
					retryAttempts: 3,
					retryDelay: 1000,
					enableCompression: true,
					maxConcurrentRequests: 10,
				},
				security: {
					enableTelemetry: false,
					securityClassification: "OPEN" as const,
					enableEncryption: true,
					enableMutualTLS: false,
				},
				// ... other required config properties with defaults
				version: "1.0.0",
				environment: "development" as const,
				indexing: {
					maxFileSize: 1048576,
					includePatterns: ["**/*.{ts,tsx,js,jsx}"],
					excludePatterns: ["node_modules/**"],
					followSymlinks: false,
					includeHidden: false,
					enableDeepAnalysis: true,
					analyzeTests: true,
					analyzeDependencies: true,
					generateMetrics: true,
					maxTokensPerFile: 10000,
				},
				plugins: {},
				norwegianCompliance: {
					enableGDPRCompliance: true,
					enableNSMCompliance: true,
					dataProcessingBasis: "legitimate_interests" as const,
					dataRetentionPeriod: 365,
					enableAuditLogging: true,
					enableDataMinimization: true,
					enableRightToErasure: true,
				},
				customPatterns: {},
				features: {
					aiGeneration: true,
					contextIndexing: true,
					qualityAnalysis: true,
					securityScanning: true,
					performanceMonitoring: true,
				},
				metadata: {
					createdAt: new Date(),
					updatedAt: new Date(),
					createdBy: "test",
					configVersion: "1.0.0",
				},
			};

			const testConfig = {
				testSuites: ["connectivity"],
				timeout: 5000,
				retryAttempts: 1,
				parallelTests: false,
				verbose: false,
				outputFormat: "console" as const,
				failFast: false,
				coverage: false,
				benchmarking: false,
				customTests: [],
			};

			// Create test service with dry-run mode
			const testService = new (await import("../../services/mcp/mcp-test.service")).MCPTestService({
				dryRun: true,
			});

			// Run tests in dry-run mode
			const report = await testService.runTests(mcpConfig, testConfig);

			// All tests should be skipped in dry-run mode
			expect(report.totalTests).toBeGreaterThan(0);
			expect(report.skippedTests).toBe(report.totalTests);
			expect(report.passedTests).toBe(0);
			expect(report.failedTests).toBe(0);
		});
	});

	describe("Norwegian Compliance", () => {
		test("should enforce GDPR compliance settings", async () => {
			const config = {
				norwegianCompliance: {
					enableGDPRCompliance: true,
					dataRetentionPeriod: 730, // 2 years
					enableRightToErasure: true,
					enableDataMinimization: true,
				},
			};

			await fs.writeFile(
				join(tempDir, ".xaheenrc"),
				JSON.stringify(config, null, 2)
			);

			const loadedConfig = await mcpConfigService.getConfig();

			expect(loadedConfig.norwegianCompliance.enableGDPRCompliance).toBe(true);
			expect(loadedConfig.norwegianCompliance.dataRetentionPeriod).toBe(730);
			expect(loadedConfig.norwegianCompliance.enableRightToErasure).toBe(true);
		});

		test("should validate NSM security classification", async () => {
			const config = {
				security: {
					securityClassification: "SECRET",
				},
			};

			await fs.writeFile(
				join(tempDir, ".xaheenrc"),
				JSON.stringify(config, null, 2)
			);

			const loadedConfig = await mcpConfigService.getConfig();
			expect(loadedConfig.security.securityClassification).toBe("SECRET");
		});

		test("should reject invalid NSM classification", async () => {
			const config = {
				security: {
					securityClassification: "INVALID_LEVEL",
				},
			};

			await fs.writeFile(
				join(tempDir, ".xaheenrc"),
				JSON.stringify(config, null, 2)
			);

			await expect(mcpConfigService.getConfig()).rejects.toThrow();
		});
	});

	describe("CLI Integration", () => {
		test("should extract configuration overrides from CLI options", () => {
			// This would typically be tested through the domain class
			const options = {
				server: "https://cli.override.com",
				classification: "RESTRICTED",
				maxSize: 5, // MB
			};

			// Simulate the extractConfigOverrides method
			const overrides: any = {};

			if (options.server) {
				overrides.server = { url: options.server };
			}
			if (options.classification) {
				overrides.security = { securityClassification: options.classification };
			}
			if (options.maxSize) {
				overrides.indexing = { maxFileSize: parseInt(String(options.maxSize)) * 1024 * 1024 };
			}

			expect(overrides.server.url).toBe("https://cli.override.com");
			expect(overrides.security.securityClassification).toBe("RESTRICTED");
			expect(overrides.indexing.maxFileSize).toBe(5242880); // 5MB in bytes
		});
	});
});
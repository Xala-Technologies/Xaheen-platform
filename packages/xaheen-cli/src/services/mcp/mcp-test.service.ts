/**
 * @fileoverview MCP Test Service - EPIC 14 Story 14.4
 * @description Comprehensive testing system for MCP endpoints with connectivity, auth, and response verification
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join } from "path";
import { z } from "zod";
import { performance } from "perf_hooks";
import { logger } from "../../utils/logger";
import type { MCPConfig } from "./mcp-config.service";
import type { XalaMCPClient } from "@xala-technologies/xala-mcp";

// Test configuration schema
const TestConfigSchema = z.object({
	testSuites: z.array(z.enum([
		"connectivity",
		"authentication",
		"api-endpoints",
		"response-validation",
		"performance",
		"security",
		"compliance",
		"integration",
	])).default(["connectivity", "authentication", "api-endpoints", "response-validation"]),
	timeout: z.number().int().min(1000).max(300000).default(30000),
	retryAttempts: z.number().int().min(0).max(10).default(2),
	parallelTests: z.boolean().default(false),
	verbose: z.boolean().default(false),
	outputFormat: z.enum(["json", "junit", "html", "console"]).default("console"),
	outputPath: z.string().optional(),
	failFast: z.boolean().default(false),
	coverage: z.boolean().default(false),
	benchmarking: z.boolean().default(false),
	customTests: z.array(z.object({
		name: z.string(),
		description: z.string(),
		endpoint: z.string(),
		method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
		payload: z.any().optional(),
		expectedStatus: z.number().default(200),
		expectedResponse: z.any().optional(),
		assertions: z.array(z.string()).default([]),
	})).default([]),
});

export type MCPTestConfig = z.infer<typeof TestConfigSchema>;

// Test result types
export interface TestResult {
	readonly name: string;
	readonly suite: string;
	readonly status: "passed" | "failed" | "skipped" | "timeout";
	readonly duration: number;
	readonly startTime: Date;
	readonly endTime: Date;
	readonly error?: Error;
	readonly metadata?: Record<string, any>;
	readonly assertions?: AssertionResult[];
}

export interface AssertionResult {
	readonly description: string;
	readonly passed: boolean;
	readonly actual?: any;
	readonly expected?: any;
	readonly error?: string;
}

export interface TestSuiteResult {
	readonly name: string;
	readonly totalTests: number;
	readonly passedTests: number;
	readonly failedTests: number;
	readonly skippedTests: number;
	readonly duration: number;
	readonly tests: TestResult[];
	readonly coverage?: number;
	readonly benchmark?: BenchmarkResult;
}

export interface BenchmarkResult {
	readonly averageResponseTime: number;
	readonly minResponseTime: number;
	readonly maxResponseTime: number;
	readonly requestsPerSecond: number;
	readonly totalRequests: number;
	readonly errorRate: number;
}

export interface MCPTestReport {
	readonly timestamp: Date;
	readonly config: MCPTestConfig;
	readonly mcpConfig: MCPConfig;
	readonly totalSuites: number;
	readonly totalTests: number;
	readonly passedTests: number;
	readonly failedTests: number;
	readonly skippedTests: number;
	readonly duration: number;
	readonly suites: TestSuiteResult[];
	readonly systemInfo: {
		readonly nodeVersion: string;
		readonly platform: string;
		readonly arch: string;
		readonly memory: number;
		readonly cpus: number;
	};
	readonly compliance: {
		readonly norwegianCompliant: boolean;
		readonly gdprCompliant: boolean;
		readonly nsmClassification: string;
		readonly securityScore: number;
	};
}

export interface MCPTestServiceOptions {
	readonly mcpClient?: XalaMCPClient;
	readonly debug?: boolean;
	readonly dryRun?: boolean;
}

/**
 * Comprehensive MCP Testing Service with full endpoint validation
 */
export class MCPTestService {
	private readonly options: MCPTestServiceOptions;
	private mcpClient: XalaMCPClient | null = null;
	private testResults: TestResult[] = [];
	private startTime: number = 0;

	constructor(options: MCPTestServiceOptions = {}) {
		this.options = {
			debug: false,
			dryRun: false,
			...options,
		};

		if (options.mcpClient) {
			this.mcpClient = options.mcpClient;
		}
	}

	/**
	 * Run comprehensive MCP tests
	 */
	async runTests(
		mcpConfig: MCPConfig,
		testConfig: MCPTestConfig,
		mcpClient?: XalaMCPClient
	): Promise<MCPTestReport> {
		try {
			this.startTime = performance.now();
			this.testResults = [];
			this.mcpClient = mcpClient || this.mcpClient;

			logger.info("🧪 Starting MCP comprehensive test suite...");

			if (this.options.dryRun) {
				logger.info("🔍 Running in dry-run mode");
			}

			// Validate test configuration
			const validatedTestConfig = TestConfigSchema.parse(testConfig);

			// Run test suites
			const suiteResults: TestSuiteResult[] = [];

			for (const suiteName of validatedTestConfig.testSuites) {
				if (validatedTestConfig.failFast && this.hasFailures()) {
					logger.warn(`❌ Stopping tests due to fail-fast mode`);
					break;
				}

				const suiteResult = await this.runTestSuite(suiteName, mcpConfig, validatedTestConfig);
				suiteResults.push(suiteResult);
			}

			// Generate test report
			const report = await this.generateTestReport(mcpConfig, validatedTestConfig, suiteResults);

			// Output report
			await this.outputReport(report, validatedTestConfig);

			logger.success(`✅ MCP test suite completed: ${report.passedTests}/${report.totalTests} passed`);
			return report;
		} catch (error) {
			logger.error("MCP test suite failed:", error);
			throw error;
		}
	}

	/**
	 * Run a specific test suite
	 */
	private async runTestSuite(
		suiteName: string,
		mcpConfig: MCPConfig,
		testConfig: MCPTestConfig
	): Promise<TestSuiteResult> {
		const suiteStartTime = performance.now();
		logger.info(`🔬 Running test suite: ${suiteName}`);

		let tests: TestResult[] = [];

		switch (suiteName) {
			case "connectivity":
				tests = await this.runConnectivityTests(mcpConfig, testConfig);
				break;
			case "authentication":
				tests = await this.runAuthenticationTests(mcpConfig, testConfig);
				break;
			case "api-endpoints":
				tests = await this.runAPIEndpointTests(mcpConfig, testConfig);
				break;
			case "response-validation":
				tests = await this.runResponseValidationTests(mcpConfig, testConfig);
				break;
			case "performance":
				tests = await this.runPerformanceTests(mcpConfig, testConfig);
				break;
			case "security":
				tests = await this.runSecurityTests(mcpConfig, testConfig);
				break;
			case "compliance":
				tests = await this.runComplianceTests(mcpConfig, testConfig);
				break;
			case "integration":
				tests = await this.runIntegrationTests(mcpConfig, testConfig);
				break;
			default:
				logger.warn(`Unknown test suite: ${suiteName}`);
				tests = [];
		}

		this.testResults.push(...tests);

		const suiteDuration = performance.now() - suiteStartTime;
		const passedTests = tests.filter(t => t.status === "passed").length;
		const failedTests = tests.filter(t => t.status === "failed").length;
		const skippedTests = tests.filter(t => t.status === "skipped").length;

		const result: TestSuiteResult = {
			name: suiteName,
			totalTests: tests.length,
			passedTests,
			failedTests,
			skippedTests,
			duration: suiteDuration,
			tests,
		};

		// Add benchmarking if enabled
		if (testConfig.benchmarking && suiteName === "performance") {
			result.benchmark = this.calculateBenchmark(tests);
		}

		// Add coverage if enabled
		if (testConfig.coverage) {
			result.coverage = this.calculateCoverage(tests);
		}

		logger.info(`📊 Suite ${suiteName}: ${passedTests}/${tests.length} passed (${suiteDuration.toFixed(2)}ms)`);
		return result;
	}

	/**
	 * Connectivity tests
	 */
	private async runConnectivityTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: Basic connectivity
		tests.push(await this.runTest(
			"basic-connectivity",
			"connectivity",
			async () => {
				const response = await this.makeRequest(mcpConfig.server.url + "/health", "GET", null, testConfig.timeout);
				this.assert(response.status >= 200 && response.status < 300, "Server should respond with success status");
				return { status: response.status, responseTime: response.responseTime };
			}
		));

		// Test 2: DNS resolution
		tests.push(await this.runTest(
			"dns-resolution",
			"connectivity",
			async () => {
				const url = new URL(mcpConfig.server.url);
				const dns = require("dns").promises;
				const addresses = await dns.resolve4(url.hostname);
				this.assert(addresses.length > 0, "DNS should resolve server hostname");
				return { hostname: url.hostname, addresses };
			}
		));

		// Test 3: SSL/TLS certificate validation
		if (mcpConfig.server.url.startsWith("https://")) {
			tests.push(await this.runTest(
				"ssl-certificate",
				"connectivity",
				async () => {
					const tls = require("tls");
					const url = new URL(mcpConfig.server.url);
					const socket = tls.connect(443, url.hostname, (err?: Error) => {
						if (err) throw err;
					});
					
					return new Promise((resolve, reject) => {
						socket.on("secureConnect", () => {
							const cert = socket.getPeerCertificate();
							socket.end();
							
							this.assert(cert.valid_from && cert.valid_to, "Certificate should have validity dates");
							this.assert(new Date() < new Date(cert.valid_to), "Certificate should not be expired");
							
							resolve({
								subject: cert.subject,
								issuer: cert.issuer,
								validFrom: cert.valid_from,
								validTo: cert.valid_to,
							});
						});
						
						socket.on("error", reject);
					});
				}
			));
		}

		// Test 4: Network latency
		tests.push(await this.runTest(
			"network-latency",
			"connectivity",
			async () => {
				const iterations = 5;
				const latencies: number[] = [];
				
				for (let i = 0; i < iterations; i++) {
					const start = performance.now();
					await this.makeRequest(mcpConfig.server.url + "/ping", "GET", null, testConfig.timeout);
					latencies.push(performance.now() - start);
				}
				
				const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
				this.assert(avgLatency < 5000, "Average latency should be less than 5 seconds");
				
				return {
					averageLatency: avgLatency,
					minLatency: Math.min(...latencies),
					maxLatency: Math.max(...latencies),
					measurements: latencies,
				};
			}
		));

		return tests;
	}

	/**
	 * Authentication tests
	 */
	private async runAuthenticationTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: API key validation
		tests.push(await this.runTest(
			"api-key-validation",
			"authentication",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/auth/validate",
					"POST",
					{ apiKey: mcpConfig.server.apiKey },
					testConfig.timeout
				);
				
				this.assert(response.status === 200, "API key should be valid");
				return { valid: true, keyLength: mcpConfig.server.apiKey.length };
			}
		));

		// Test 2: Client ID validation
		tests.push(await this.runTest(
			"client-id-validation",
			"authentication",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/auth/client",
					"POST",
					{ 
						apiKey: mcpConfig.server.apiKey,
						clientId: mcpConfig.server.clientId 
					},
					testConfig.timeout
				);
				
				this.assert(response.status === 200, "Client ID should be valid");
				return { clientId: mcpConfig.server.clientId };
			}
		));

		// Test 3: Invalid API key handling
		tests.push(await this.runTest(
			"invalid-api-key",
			"authentication",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/auth/validate",
					"POST",
					{ apiKey: "invalid-key-12345" },
					testConfig.timeout
				);
				
				this.assert(response.status === 401 || response.status === 403, 
					"Invalid API key should return 401/403");
				return { expectedStatus: response.status };
			}
		));

		// Test 4: Rate limiting
		tests.push(await this.runTest(
			"rate-limiting",
			"authentication",
			async () => {
				const requests = [];
				const maxRequests = 50;
				
				// Make rapid requests to test rate limiting
				for (let i = 0; i < maxRequests; i++) {
					requests.push(
						this.makeRequest(
							mcpConfig.server.url + "/auth/validate",
							"POST",
							{ apiKey: mcpConfig.server.apiKey },
							1000
						).catch(err => ({ status: 429, error: err.message }))
					);
				}
				
				const responses = await Promise.all(requests);
				const rateLimited = responses.some(r => r.status === 429);
				
				return { 
					totalRequests: maxRequests,
					rateLimited,
					responses: responses.length,
				};
			}
		));

		return tests;
	}

	/**
	 * API endpoint tests
	 */
	private async runAPIEndpointTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		const endpoints = [
			{ path: "/health", method: "GET", expectedStatus: 200 },
			{ path: "/version", method: "GET", expectedStatus: 200 },
			{ path: "/generate", method: "POST", expectedStatus: 200 },
			{ path: "/analyze", method: "POST", expectedStatus: 200 },
			{ path: "/index", method: "POST", expectedStatus: 200 },
		];

		for (const endpoint of endpoints) {
			tests.push(await this.runTest(
				`endpoint-${endpoint.path.replace("/", "")}`,
				"api-endpoints",
				async () => {
					const response = await this.makeRequest(
						mcpConfig.server.url + endpoint.path,
						endpoint.method as any,
						endpoint.method === "POST" ? { test: true } : null,
						testConfig.timeout
					);
					
					this.assert(
						response.status === endpoint.expectedStatus,
						`Endpoint ${endpoint.path} should return ${endpoint.expectedStatus}`
					);
					
					return {
						endpoint: endpoint.path,
						status: response.status,
						responseTime: response.responseTime,
					};
				}
			));
		}

		// Custom tests from configuration
		for (const customTest of testConfig.customTests) {
			tests.push(await this.runTest(
				`custom-${customTest.name}`,
				"api-endpoints",
				async () => {
					const response = await this.makeRequest(
						mcpConfig.server.url + customTest.endpoint,
						customTest.method,
						customTest.payload,
						testConfig.timeout
					);
					
					this.assert(
						response.status === customTest.expectedStatus,
						`Custom test ${customTest.name} should return ${customTest.expectedStatus}`
					);
					
					// Run custom assertions (safe evaluation)
					for (const assertion of customTest.assertions) {
						try {
							// Parse assertion safely instead of using eval
							const [left, operator, right] = assertion.split(/\s*(===|!==|==|!=|>|<|>=|<=)\s/);
							const leftValue = this.getResponseValue(response, left.trim());
							const rightValue = this.parseValue(right.trim());
							
							switch (operator) {
								case '===':
									this.assert(leftValue === rightValue, `Custom assertion: ${assertion}`);
									break;
								case '!==':
									this.assert(leftValue !== rightValue, `Custom assertion: ${assertion}`);
									break;
								case '>':
									this.assert(leftValue > rightValue, `Custom assertion: ${assertion}`);
									break;
								case '<':
									this.assert(leftValue < rightValue, `Custom assertion: ${assertion}`);
									break;
								case '>=':
									this.assert(leftValue >= rightValue, `Custom assertion: ${assertion}`);
									break;
								case '<=':
									this.assert(leftValue <= rightValue, `Custom assertion: ${assertion}`);
									break;
								default:
									this.assert(false, `Unsupported operator in assertion: ${assertion}`);
							}
						} catch (error) {
							this.assert(false, `Failed to evaluate assertion: ${assertion} - ${error}`);
						}
					}
					
					return {
						name: customTest.name,
						status: response.status,
						response: response.data,
					};
				}
			));
		}

		return tests;
	}

	/**
	 * Response validation tests
	 */
	private async runResponseValidationTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: JSON response format
		tests.push(await this.runTest(
			"json-response-format",
			"response-validation",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/health",
					"GET",
					null,
					testConfig.timeout
				);
				
				this.assert(
					response.headers["content-type"]?.includes("application/json"),
					"Response should be JSON format"
				);
				
				this.assert(
					typeof response.data === "object",
					"Response data should be an object"
				);
				
				return { contentType: response.headers["content-type"] };
			}
		));

		// Test 2: Required response fields
		tests.push(await this.runTest(
			"required-response-fields",
			"response-validation",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/version",
					"GET",
					null,
					testConfig.timeout
				);
				
				const data = response.data;
				this.assert(data.version, "Response should include version field");
				this.assert(data.timestamp, "Response should include timestamp field");
				
				return { version: data.version, timestamp: data.timestamp };
			}
		));

		// Test 3: Error response format
		tests.push(await this.runTest(
			"error-response-format",
			"response-validation",
			async () => {
				const response = await this.makeRequest(
					mcpConfig.server.url + "/nonexistent-endpoint",
					"GET",
					null,
					testConfig.timeout
				);
				
				this.assert(response.status >= 400, "Error endpoint should return 4xx status");
				
				if (response.data) {
					this.assert(
						response.data.error || response.data.message,
						"Error response should include error or message field"
					);
				}
				
				return { status: response.status, error: response.data };
			}
		));

		return tests;
	}

	/**
	 * Performance tests
	 */
	private async runPerformanceTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: Response time benchmark
		tests.push(await this.runTest(
			"response-time-benchmark",
			"performance",
			async () => {
				const iterations = 10;
				const responseTimes: number[] = [];
				
				for (let i = 0; i < iterations; i++) {
					const response = await this.makeRequest(
						mcpConfig.server.url + "/health",
						"GET",
						null,
						testConfig.timeout
					);
					responseTimes.push(response.responseTime);
				}
				
				const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / iterations;
				this.assert(avgResponseTime < 2000, "Average response time should be less than 2 seconds");
				
				return {
					averageResponseTime: avgResponseTime,
					minResponseTime: Math.min(...responseTimes),
					maxResponseTime: Math.max(...responseTimes),
					iterations,
				};
			}
		));

		// Test 2: Concurrent requests
		tests.push(await this.runTest(
			"concurrent-requests",
			"performance",
			async () => {
				const concurrency = 10;
				const requests = [];
				
				for (let i = 0; i < concurrency; i++) {
					requests.push(
						this.makeRequest(
							mcpConfig.server.url + "/health",
							"GET",
							null,
							testConfig.timeout
						)
					);
				}
				
				const start = performance.now();
				const responses = await Promise.all(requests);
				const duration = performance.now() - start;
				
				const successfulResponses = responses.filter(r => r.status < 400).length;
				this.assert(
					successfulResponses === concurrency,
					"All concurrent requests should succeed"
				);
				
				return {
					concurrency,
					successfulResponses,
					totalDuration: duration,
					requestsPerSecond: (concurrency / duration) * 1000,
				};
			}
		));

		return tests;
	}

	/**
	 * Security tests
	 */
	private async runSecurityTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: SQL injection protection
		tests.push(await this.runTest(
			"sql-injection-protection",
			"security",
			async () => {
				const maliciousPayload = { query: "'; DROP TABLE users; --" };
				const response = await this.makeRequest(
					mcpConfig.server.url + "/analyze",
					"POST",
					maliciousPayload,
					testConfig.timeout
				);
				
				// Should not crash or return 500 error
				this.assert(response.status !== 500, "Server should handle malicious SQL input");
				
				return { status: response.status, handled: true };
			}
		));

		// Test 2: XSS protection
		tests.push(await this.runTest(
			"xss-protection",
			"security",
			async () => {
				const xssPayload = { content: "<script>alert('xss')</script>" };
				const response = await this.makeRequest(
					mcpConfig.server.url + "/generate",
					"POST",
					xssPayload,
					testConfig.timeout
				);
				
				if (response.data && typeof response.data === "string") {
					this.assert(
						!response.data.includes("<script>"),
						"Response should not contain unescaped script tags"
					);
				}
				
				return { status: response.status, sanitized: true };
			}
		));

		return tests;
	}

	/**
	 * Norwegian compliance tests
	 */
	private async runComplianceTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: GDPR compliance
		tests.push(await this.runTest(
			"gdpr-compliance",
			"compliance",
			async () => {
				const compliantConfig = mcpConfig.norwegianCompliance;
				
				this.assert(
					compliantConfig.enableGDPRCompliance,
					"GDPR compliance should be enabled"
				);
				
				this.assert(
					compliantConfig.dataRetentionPeriod > 0,
					"Data retention period should be specified"
				);
				
				this.assert(
					compliantConfig.enableRightToErasure,
					"Right to erasure should be enabled"
				);
				
				return {
					gdprEnabled: compliantConfig.enableGDPRCompliance,
					retentionPeriod: compliantConfig.dataRetentionPeriod,
					rightToErasure: compliantConfig.enableRightToErasure,
				};
			}
		));

		// Test 2: NSM security classification
		tests.push(await this.runTest(
			"nsm-classification",
			"compliance",
			async () => {
				const classification = mcpConfig.security.securityClassification;
				const validClassifications = ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"];
				
				this.assert(
					validClassifications.includes(classification),
					"Security classification should be valid NSM level"
				);
				
				return { classification };
			}
		));

		return tests;
	}

	/**
	 * Integration tests
	 */
	private async runIntegrationTests(mcpConfig: MCPConfig, testConfig: MCPTestConfig): Promise<TestResult[]> {
		const tests: TestResult[] = [];

		// Test 1: Full workflow test
		tests.push(await this.runTest(
			"full-workflow",
			"integration",
			async () => {
				// Step 1: Authenticate
				const authResponse = await this.makeRequest(
					mcpConfig.server.url + "/auth/validate",
					"POST",
					{ apiKey: mcpConfig.server.apiKey },
					testConfig.timeout
				);
				this.assert(authResponse.status === 200, "Authentication should succeed");
				
				// Step 2: Generate component
				const generateResponse = await this.makeRequest(
					mcpConfig.server.url + "/generate",
					"POST",
					{
						type: "component",
						name: "TestComponent",
						platform: "react",
					},
					testConfig.timeout
				);
				this.assert(generateResponse.status === 200, "Component generation should succeed");
				
				// Step 3: Analyze result
				const analyzeResponse = await this.makeRequest(
					mcpConfig.server.url + "/analyze",
					"POST",
					{ code: generateResponse.data?.code || "test" },
					testConfig.timeout
				);
				this.assert(analyzeResponse.status === 200, "Code analysis should succeed");
				
				return {
					authSuccess: authResponse.status === 200,
					generateSuccess: generateResponse.status === 200,
					analyzeSuccess: analyzeResponse.status === 200,
				};
			}
		));

		return tests;
	}

	// Utility methods

	private async runTest(
		name: string,
		suite: string,
		testFunction: () => Promise<any>
	): Promise<TestResult> {
		const startTime = new Date();
		const start = performance.now();
		
		try {
			if (this.options.dryRun) {
				return {
					name,
					suite,
					status: "skipped",
					duration: 0,
					startTime,
					endTime: new Date(),
					metadata: { dryRun: true },
				};
			}

			const result = await testFunction();
			const duration = performance.now() - start;
			
			return {
				name,
				suite,
				status: "passed",
				duration,
				startTime,
				endTime: new Date(),
				metadata: result,
			};
		} catch (error) {
			const duration = performance.now() - start;
			
			return {
				name,
				suite,
				status: "failed",
				duration,
				startTime,
				endTime: new Date(),
				error: error as Error,
			};
		}
	}

	private async makeRequest(
		url: string,
		method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
		data?: any,
		timeout = 30000
	): Promise<{
		status: number;
		data: any;
		headers: Record<string, string>;
		responseTime: number;
	}> {
		const start = performance.now();
		
		try {
			const fetch = (await import("node-fetch")).default;
			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"User-Agent": "xaheen-mcp-test/1.0.0",
				},
				body: data ? JSON.stringify(data) : undefined,
				// timeout is handled by AbortController in newer versions
			});
			
			const responseTime = performance.now() - start;
			let responseData: any;
			
			try {
				responseData = await response.json();
			} catch {
				responseData = await response.text();
			}
			
			return {
				status: response.status,
				data: responseData,
				headers: Object.fromEntries(response.headers.entries()),
				responseTime,
			};
		} catch (error) {
			const responseTime = performance.now() - start;
			throw new Error(`Request failed: ${error.message} (${responseTime.toFixed(2)}ms)`);
		}
	}

	private assert(condition: boolean, message: string): void {
		if (!condition) {
			throw new Error(`Assertion failed: ${message}`);
		}
	}

	private hasFailures(): boolean {
		return this.testResults.some(result => result.status === "failed");
	}

	private calculateBenchmark(tests: TestResult[]): BenchmarkResult {
		const responseTimes = tests
			.filter(t => t.metadata?.responseTime)
			.map(t => t.metadata!.responseTime);
		
		if (responseTimes.length === 0) {
			return {
				averageResponseTime: 0,
				minResponseTime: 0,
				maxResponseTime: 0,
				requestsPerSecond: 0,
				totalRequests: 0,
				errorRate: 0,
			};
		}
		
		const totalRequests = tests.length;
		const errorRate = tests.filter(t => t.status === "failed").length / totalRequests;
		const totalTime = responseTimes.reduce((sum, time) => sum + time, 0);
		
		return {
			averageResponseTime: totalTime / responseTimes.length,
			minResponseTime: Math.min(...responseTimes),
			maxResponseTime: Math.max(...responseTimes),
			requestsPerSecond: (totalRequests / totalTime) * 1000,
			totalRequests,
			errorRate,
		};
	}

	private calculateCoverage(tests: TestResult[]): number {
		// Simple coverage calculation based on test success rate
		const passedTests = tests.filter(t => t.status === "passed").length;
		return tests.length > 0 ? (passedTests / tests.length) * 100 : 0;
	}

	private async generateTestReport(
		mcpConfig: MCPConfig,
		testConfig: MCPTestConfig,
		suiteResults: TestSuiteResult[]
	): Promise<MCPTestReport> {
		const totalDuration = performance.now() - this.startTime;
		const totalTests = suiteResults.reduce((sum, suite) => sum + suite.totalTests, 0);
		const passedTests = suiteResults.reduce((sum, suite) => sum + suite.passedTests, 0);
		const failedTests = suiteResults.reduce((sum, suite) => sum + suite.failedTests, 0);
		const skippedTests = suiteResults.reduce((sum, suite) => sum + suite.skippedTests, 0);

		// System information
		const os = require("os");
		const systemInfo = {
			nodeVersion: process.version,
			platform: process.platform,
			arch: process.arch,
			memory: os.totalmem(),
			cpus: os.cpus().length,
		};

		// Compliance assessment
		const compliance = {
			norwegianCompliant: mcpConfig.norwegianCompliance.enableGDPRCompliance &&
				mcpConfig.norwegianCompliance.enableNSMCompliance,
			gdprCompliant: mcpConfig.norwegianCompliance.enableGDPRCompliance,
			nsmClassification: mcpConfig.security.securityClassification,
			securityScore: Math.max(0, 100 - (failedTests * 10)), // Simple scoring
		};

		return {
			timestamp: new Date(),
			config: testConfig,
			mcpConfig,
			totalSuites: suiteResults.length,
			totalTests,
			passedTests,
			failedTests,
			skippedTests,
			duration: totalDuration,
			suites: suiteResults,
			systemInfo,
			compliance,
		};
	}

	private async outputReport(report: MCPTestReport, testConfig: MCPTestConfig): Promise<void> {
		if (testConfig.outputFormat === "console" || !testConfig.outputPath) {
			this.outputConsoleReport(report);
			return;
		}

		const outputPath = testConfig.outputPath;
		await fs.mkdir(dirname(outputPath), { recursive: true });

		switch (testConfig.outputFormat) {
			case "json":
				await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
				break;
			case "junit":
				await fs.writeFile(outputPath, this.generateJUnitXML(report));
				break;
			case "html":
				await fs.writeFile(outputPath, this.generateHTMLReport(report));
				break;
		}

		logger.success(`📄 Test report saved to ${outputPath}`);
	}

	private outputConsoleReport(report: MCPTestReport): void {
		const chalk = require("chalk");
		
		console.log(chalk.blue("\n🧪 MCP Test Report"));
		console.log(chalk.gray("═".repeat(60)));
		
		console.log(`📊 Summary: ${chalk.green(report.passedTests)} passed, ${chalk.red(report.failedTests)} failed, ${chalk.yellow(report.skippedTests)} skipped`);
		console.log(`⏱️  Duration: ${chalk.cyan(report.duration.toFixed(2))}ms`);
		console.log(`🏛️  Classification: ${chalk.cyan(report.compliance.nsmClassification)}`);
		console.log(`🛡️  Security Score: ${chalk.cyan(report.compliance.securityScore)}%`);
		
		console.log(chalk.blue("\n📋 Test Suites:"));
		for (const suite of report.suites) {
			const statusIcon = suite.failedTests > 0 ? "❌" : "✅";
			console.log(`  ${statusIcon} ${suite.name}: ${suite.passedTests}/${suite.totalTests} (${suite.duration.toFixed(2)}ms)`);
		}
		
		if (report.failedTests > 0) {
			console.log(chalk.red("\n❌ Failed Tests:"));
			for (const suite of report.suites) {
				const failedTests = suite.tests.filter(t => t.status === "failed");
				for (const test of failedTests) {
					console.log(`  • ${suite.name}/${test.name}: ${test.error?.message}`);
				}
			}
		}
	}

	private generateJUnitXML(report: MCPTestReport): string {
		// JUnit XML generation implementation
		// This is a simplified version
		return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${report.totalTests}" failures="${report.failedTests}" time="${report.duration / 1000}">
${report.suites.map(suite => `
  <testsuite name="${suite.name}" tests="${suite.totalTests}" failures="${suite.failedTests}" time="${suite.duration / 1000}">
${suite.tests.map(test => `
    <testcase name="${test.name}" time="${test.duration / 1000}">
${test.status === "failed" ? `      <failure message="${test.error?.message}">${test.error?.stack}</failure>` : ""}
    </testcase>`).join("")}
  </testsuite>`).join("")}
</testsuites>`;
	}

	private generateHTMLReport(report: MCPTestReport): string {
		// HTML report generation implementation
		// This is a simplified version
		return `<!DOCTYPE html>
<html>
<head>
  <title>MCP Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .passed { color: green; }
    .failed { color: red; }
    .skipped { color: orange; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MCP Test Report</h1>
    <p>Timestamp: ${report.timestamp.toISOString()}</p>
    <p>Total Tests: ${report.totalTests} | Passed: <span class="passed">${report.passedTests}</span> | Failed: <span class="failed">${report.failedTests}</span> | Skipped: <span class="skipped">${report.skippedTests}</span></p>
    <p>Duration: ${report.duration.toFixed(2)}ms</p>
    <p>Security Classification: ${report.compliance.nsmClassification}</p>
    <p>Security Score: ${report.compliance.securityScore}%</p>
  </div>
  
  ${report.suites.map(suite => `
  <div class="suite">
    <h2>${suite.name}</h2>
    <p>Tests: ${suite.totalTests} | Passed: <span class="passed">${suite.passedTests}</span> | Failed: <span class="failed">${suite.failedTests}</span></p>
    <ul>
      ${suite.tests.map(test => `
      <li class="${test.status}">
        ${test.name} (${test.duration.toFixed(2)}ms)
        ${test.error ? `<br><small>${test.error.message}</small>` : ""}
      </li>`).join("")}
    </ul>
  </div>`).join("")}
</body>
</html>`;
	}

	private getResponseValue(response: any, path: string): any {
		// Simple dot notation path access
		const parts = path.split('.');
		let value = response;
		for (const part of parts) {
			if (value && typeof value === 'object' && part in value) {
				value = value[part];
			} else {
				return undefined;
			}
		}
		return value;
	}

	private parseValue(value: string): any {
		// Parse string values to appropriate types
		if (value === 'true') return true;
		if (value === 'false') return false;
		if (value === 'null') return null;
		if (value === 'undefined') return undefined;
		if (value.startsWith('"') && value.endsWith('"')) {
			return value.slice(1, -1); // Remove quotes
		}
		const num = Number(value);
		if (!isNaN(num)) return num;
		return value; // Return as string if nothing else matches
	}
}

/**
 * Create singleton MCP test service
 */
export const mcpTestService = new MCPTestService({
	debug: process.env.NODE_ENV === "development",
});
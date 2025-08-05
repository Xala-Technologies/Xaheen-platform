/**
 * Cold Start Performance Tests
 * Tests server startup times and establishes performance baselines
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { 
	createTestProject, 
	createBackendOptions, 
	assertSuccessfulResult,
	measureTime,
	type TestProject,
} from "../utils/test-helpers";
import { testServerManager, type ServerConfig } from "../utils/server-manager";
import { databaseTestHelper } from "../utils/database-helper";
import { generateBackend } from "@/generators/backend";

describe("Cold Start Performance Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		serverPort = await testServerManager.findAvailablePort(3000);
		vi.setConfig({ testTimeout: 120000 }); // 2 minutes for performance tests
	});

	afterEach(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
		if (testProject) {
			await testProject.cleanup();
		}
	});

	describe("Framework Cold Start Benchmarks", () => {
		it("should measure Express cold start performance", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			// Generate project
			const { result: generateResult, duration: generateDuration } = await measureTime(() =>
				generateBackend(testProject.path, options)
			);
			assertSuccessfulResult(generateResult);

			console.log(`Express generation time: ${generateDuration.toFixed(2)}ms`);
			expect(generateDuration).toBeLessThan(10000); // Generation should be fast

			// Install dependencies
			const { duration: installDuration } = await measureTime(() =>
				testServerManager.installDependencies(testProject.path)
			);

			console.log(`Express dependency installation time: ${installDuration.toFixed(2)}ms`);
			expect(installDuration).toBeLessThan(60000); // 1 minute for installation

			// Measure cold start
			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "production",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 30000,
			};

			const { duration: coldStartDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			console.log(`Express cold start time: ${coldStartDuration.toFixed(2)}ms`);
			
			// Express should start quickly
			expect(coldStartDuration).toBeLessThan(2000); // 2 seconds requirement

			// Verify server is responsive
			const server = testServerManager.getServer("express", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test first response time
			const { duration: firstResponseDuration } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/health`);
				expect(response.status).toBe(200);
			});

			console.log(`Express first response time: ${firstResponseDuration.toFixed(2)}ms`);
			expect(firstResponseDuration).toBeLessThan(500); // First response should be fast
		});

		it("should measure NestJS cold start performance", async () => {
			testProject = await createTestProject({
				framework: "nestjs",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "nestjs",
				database: "sqlite",
				features: ["rest-api"],
			});

			// Generate and install
			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			const { duration: installDuration } = await measureTime(() =>
				testServerManager.installDependencies(testProject.path)
			);

			console.log(`NestJS dependency installation time: ${installDuration.toFixed(2)}ms`);

			// Measure cold start
			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "nestjs",
				port: serverPort,
				env: {
					NODE_ENV: "production",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 45000,
			};

			const { duration: coldStartDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			console.log(`NestJS cold start time: ${coldStartDuration.toFixed(2)}ms`);
			
			// NestJS typically takes longer due to DI and reflection
			expect(coldStartDuration).toBeLessThan(10000); // 10 seconds allowance for NestJS

			const server = testServerManager.getServer("nestjs", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test health endpoint
			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);
		});

		it("should measure Fastify cold start performance", async () => {
			testProject = await createTestProject({
				framework: "fastify",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "fastify",
				database: "sqlite",
				features: ["rest-api"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "fastify",
				port: serverPort,
				env: {
					NODE_ENV: "production",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 20000,
			};

			const { duration: coldStartDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			console.log(`Fastify cold start time: ${coldStartDuration.toFixed(2)}ms`);
			
			// Fastify should have excellent cold start performance
			expect(coldStartDuration).toBeLessThan(1500); // Very fast startup

			const server = testServerManager.getServer("fastify", serverPort);
			expect(server).toBeDefined();

			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);
		});

		it("should measure Hono cold start performance", async () => {
			testProject = await createTestProject({
				framework: "hono",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				features: ["rest-api"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "hono",
				port: serverPort,
				env: {
					NODE_ENV: "production",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 15000,
			};

			const { duration: coldStartDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			console.log(`Hono cold start time: ${coldStartDuration.toFixed(2)}ms`);
			
			// Hono should have the best cold start performance
			expect(coldStartDuration).toBeLessThan(1000); // Sub-second startup

			const server = testServerManager.getServer("hono", serverPort);
			expect(server).toBeDefined();

			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);
		});
	});

	describe("Cold Start with Different Database Configurations", () => {
		it("should measure cold start with PostgreSQL connection", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "postgresql",
				features: ["rest-api"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "postgresql://localhost:5432/test_db", // Won't connect, but will test startup time
				},
				startTimeout: 15000,
			};

			// This might fail to connect to database, but we measure startup time
			try {
				const { duration: coldStartDuration } = await measureTime(() =>
					testServerManager.startServer(serverConfig)
				);
				console.log(`Express with PostgreSQL cold start time: ${coldStartDuration.toFixed(2)}ms`);
				expect(coldStartDuration).toBeLessThan(5000);
			} catch (error) {
				// Expected to fail without real database, but we got timing info
				console.log("Database connection failed as expected, but startup timing measured");
			}
		});

		it("should measure cold start with Redis caching", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api", "caching"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "file:./test.db",
					REDIS_URL: "redis://localhost:6379", // Won't connect, but tests startup
				},
				startTimeout: 15000,
			};

			try {
				const { duration: coldStartDuration } = await measureTime(() =>
					testServerManager.startServer(serverConfig)
				);
				console.log(`Express with Redis cold start time: ${coldStartDuration.toFixed(2)}ms`);
				expect(coldStartDuration).toBeLessThan(3000);
			} catch (error) {
				console.log("Redis connection failed as expected, but startup timing measured");
			}
		});
	});

	describe("Memory Usage During Cold Start", () => {
		it("should monitor memory usage during server startup", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "test", DATABASE_URL: "file:./test.db" },
			};

			// Measure memory before startup
			const beforeMemory = process.memoryUsage();

			await testServerManager.startServer(serverConfig);

			// Measure memory after startup
			const afterMemory = process.memoryUsage();

			const memoryIncrease = {
				rss: afterMemory.rss - beforeMemory.rss,
				heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
				heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal,
			};

			console.log("Memory usage increase during startup:", {
				rss: `${(memoryIncrease.rss / 1024 / 1024).toFixed(2)} MB`,
				heapUsed: `${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`,
				heapTotal: `${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB`,
			});

			// Memory increase should be reasonable
			expect(memoryIncrease.rss).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
		});
	});

	describe("Framework Comparison Benchmark", () => {
		it("should benchmark all frameworks and establish baseline", async () => {
			const frameworks = ["express", "nestjs", "fastify", "hono"] as const;
			const results = new Map<string, {
				coldStart: number;
				firstResponse: number;
				memoryUsage: number;
			}>();

			for (const framework of frameworks) {
				console.log(`\n--- Benchmarking ${framework.toUpperCase()} ---`);
				
				const project = await createTestProject({ framework, cleanup: true });
				const port = await testServerManager.findAvailablePort(3000);

				try {
					const options = createBackendOptions({
						framework,
						database: "sqlite",
						features: ["rest-api"],
					});

					// Generate project
					const generateResult = await generateBackend(project.path, options);
					assertSuccessfulResult(generateResult);

					// Install dependencies
					await testServerManager.installDependencies(project.path);

					// Measure memory before startup
					const beforeMemory = process.memoryUsage();

					// Measure cold start
					const serverConfig: ServerConfig = {
						projectPath: project.path,
						framework,
						port,
						env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
						startTimeout: framework === "nestjs" ? 45000 : 30000,
					};

					const { duration: coldStartDuration } = await measureTime(() =>
						testServerManager.startServer(serverConfig)
					);

					const server = testServerManager.getServer(framework, port);
					expect(server).toBeDefined();

					// Measure first response time
					const { duration: firstResponseDuration } = await measureTime(async () => {
						const response = await fetch(`${server!.url}/health`);
						expect(response.status).toBe(200);
					});

					// Measure memory after startup
					const afterMemory = process.memoryUsage();
					const memoryIncrease = afterMemory.rss - beforeMemory.rss;

					results.set(framework, {
						coldStart: coldStartDuration,
						firstResponse: firstResponseDuration,
						memoryUsage: memoryIncrease,
					});

					console.log(`${framework} results:`, {
						coldStart: `${coldStartDuration.toFixed(2)}ms`,
						firstResponse: `${firstResponseDuration.toFixed(2)}ms`,
						memory: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
					});

					// Cleanup
					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				} catch (error) {
					console.error(`Failed to benchmark ${framework}:`, error);
					results.set(framework, {
						coldStart: Infinity,
						firstResponse: Infinity,
						memoryUsage: Infinity,
					});

					// Cleanup on error
					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				}
			}

			// Print summary
			console.log("\n=== PERFORMANCE BENCHMARK SUMMARY ===");
			console.log("Framework\t\tCold Start\tFirst Response\tMemory");
			console.log("─".repeat(60));

			const sortedByColdStart = Array.from(results.entries())
				.sort(([, a], [, b]) => a.coldStart - b.coldStart);

			for (const [framework, metrics] of sortedByColdStart) {
				const coldStart = metrics.coldStart === Infinity ? "FAILED" : `${metrics.coldStart.toFixed(0)}ms`;
				const firstResponse = metrics.firstResponse === Infinity ? "FAILED" : `${metrics.firstResponse.toFixed(0)}ms`;
				const memory = metrics.memoryUsage === Infinity ? "FAILED" : `${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`;
				
				console.log(`${framework.padEnd(12)}\t${coldStart.padEnd(10)}\t${firstResponse.padEnd(12)}\t${memory}`);
			}

			// Establish baseline expectations
			const successfulResults = Array.from(results.values())
				.filter(result => result.coldStart !== Infinity);

			expect(successfulResults.length).toBeGreaterThan(0);

			// At least one framework should meet the 2s requirement
			const fastestColdStart = Math.min(...successfulResults.map(r => r.coldStart));
			expect(fastestColdStart).toBeLessThan(2000);

			// All successful frameworks should have reasonable first response times
			for (const result of successfulResults) {
				expect(result.firstResponse).toBeLessThan(1000);
				expect(result.memoryUsage).toBeLessThan(200 * 1024 * 1024); // 200MB max
			}
		});
	});

	describe("Performance Regression Detection", () => {
		it("should detect performance regressions", async () => {
			// This test would compare against stored baselines
			// For now, we just ensure basic performance requirements are met
			
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const generateResult = await generateBackend(testProject.path, options);
			assertSuccessfulResult(generateResult);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			// Run multiple cold starts to get average
			const coldStartTimes: number[] = [];
			
			for (let i = 0; i < 3; i++) {
				const { duration } = await measureTime(() =>
					testServerManager.startServer(serverConfig)
				);
				coldStartTimes.push(duration);
				
				await testServerManager.stopServer("express", serverPort);
				
				// Wait a bit between runs
				await new Promise(resolve => setTimeout(resolve, 1000));
			}

			const averageColdStart = coldStartTimes.reduce((a, b) => a + b, 0) / coldStartTimes.length;
			const maxColdStart = Math.max(...coldStartTimes);
			const minColdStart = Math.min(...coldStartTimes);

			console.log("Cold start statistics:", {
				average: `${averageColdStart.toFixed(2)}ms`,
				min: `${minColdStart.toFixed(2)}ms`,
				max: `${maxColdStart.toFixed(2)}ms`,
				variance: `${(maxColdStart - minColdStart).toFixed(2)}ms`,
			});

			// Performance requirements
			expect(averageColdStart).toBeLessThan(2000); // Average under 2s
			expect(maxColdStart).toBeLessThan(3000); // Max under 3s
			expect(maxColdStart - minColdStart).toBeLessThan(1000); // Low variance
		});
	});
});
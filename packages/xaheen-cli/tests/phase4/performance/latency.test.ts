/**
 * API Latency Performance Tests
 * Tests API response times and establishes latency baselines for all frameworks
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
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

describe("API Latency Performance Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		serverPort = await testServerManager.findAvailablePort(3000);
		// timeout configured in bun test settings
	});

	afterEach(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
		if (testProject) {
			await testProject.cleanup();
		}
	});

	describe("Single Request Latency", () => {
		it("should measure Express API latency", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Warm up the server
			await fetch(`${server!.url}/health`);
			await fetch(`${server!.url}/health`);

			// Measure multiple single requests
			const latencies: number[] = [];
			
			for (let i = 0; i < 10; i++) {
				const { duration } = await measureTime(async () => {
					const response = await fetch(`${server!.url}/health`);
					expect(response.status).toBe(200);
					await response.json();
				});
				latencies.push(duration);
			}

			const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
			const minLatency = Math.min(...latencies);
			const maxLatency = Math.max(...latencies);
			const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

			console.log("Express latency stats:", {
				average: `${avgLatency.toFixed(2)}ms`,
				min: `${minLatency.toFixed(2)}ms`,
				max: `${maxLatency.toFixed(2)}ms`,
				p95: `${p95Latency.toFixed(2)}ms`,
			});

			// Express should have low latency
			expect(avgLatency).toBeLessThan(50); // Average under 50ms
			expect(p95Latency).toBeLessThan(100); // P95 under 100ms
		});

		it("should measure NestJS API latency", async () => {
			testProject = await createTestProject({
				framework: "nestjs",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "nestjs",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "nestjs",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
				startTimeout: 45000,
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("nestjs", serverPort);

			// Warm up
			await fetch(`${server!.url}/health`);
			await fetch(`${server!.url}/health`);

			const latencies: number[] = [];
			
			for (let i = 0; i < 10; i++) {
				const { duration } = await measureTime(async () => {
					const response = await fetch(`${server!.url}/health`);
					expect(response.status).toBe(200);
					await response.json();
				});
				latencies.push(duration);
			}

			const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
			const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

			console.log("NestJS latency stats:", {
				average: `${avgLatency.toFixed(2)}ms`,
				p95: `${p95Latency.toFixed(2)}ms`,
			});

			// NestJS might have slightly higher latency due to DI overhead
			expect(avgLatency).toBeLessThan(100);
			expect(p95Latency).toBeLessThan(200);
		});

		it("should measure Fastify API latency", async () => {
			testProject = await createTestProject({
				framework: "fastify",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "fastify",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "fastify",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("fastify", serverPort);

			// Warm up
			await fetch(`${server!.url}/health`);
			await fetch(`${server!.url}/health`);

			const latencies: number[] = [];
			
			for (let i = 0; i < 10; i++) {
				const { duration } = await measureTime(async () => {
					const response = await fetch(`${server!.url}/health`);
					expect(response.status).toBe(200);
					await response.json();
				});
				latencies.push(duration);
			}

			const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
			const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

			console.log("Fastify latency stats:", {
				average: `${avgLatency.toFixed(2)}ms`,
				p95: `${p95Latency.toFixed(2)}ms`,
			});

			// Fastify should have excellent latency
			expect(avgLatency).toBeLessThan(30); // Very low average
			expect(p95Latency).toBeLessThan(60);
		});

		it("should measure Hono API latency", async () => {
			testProject = await createTestProject({
				framework: "hono",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "hono",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("hono", serverPort);

			// Warm up
			await fetch(`${server!.url}/health`);
			await fetch(`${server!.url}/health`);

			const latencies: number[] = [];
			
			for (let i = 0; i < 10; i++) {
				const { duration } = await measureTime(async () => {
					const response = await fetch(`${server!.url}/health`);
					expect(response.status).toBe(200);
					await response.json();
				});
				latencies.push(duration);
			}

			const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
			const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

			console.log("Hono latency stats:", {
				average: `${avgLatency.toFixed(2)}ms`,
				p95: `${p95Latency.toFixed(2)}ms`,
			});

			// Hono should have the best latency
			expect(avgLatency).toBeLessThan(25); // Ultra-low average
			expect(p95Latency).toBeLessThan(50);
		});
	});

	describe("Concurrent Request Latency", () => {
		it("should measure Express performance under load", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Warm up
			await fetch(`${server!.url}/health`);

			// Test concurrent requests
			const concurrency = 50;
			const { duration: totalDuration } = await measureTime(async () => {
				const promises = Array.from({ length: concurrency }, async () => {
					const startTime = performance.now();
					const response = await fetch(`${server!.url}/health`);
					expect(response.status).toBe(200);
					await response.json();
					return performance.now() - startTime;
				});

				const latencies = await Promise.all(promises);
				const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
				const maxLatency = Math.max(...latencies);

				console.log(`Express concurrent (${concurrency} requests):`, {
					totalTime: `${totalDuration.toFixed(2)}ms`,
					avgLatency: `${avgLatency.toFixed(2)}ms`,
					maxLatency: `${maxLatency.toFixed(2)}ms`,
					rps: `${(concurrency / (totalDuration / 1000)).toFixed(2)} req/s`,
				});

				expect(avgLatency).toBeLessThan(200); // Under load
				expect(maxLatency).toBeLessThan(500);
			});

			// Total time should be reasonable
			expect(totalDuration).toBeLessThan(5000); // 5 seconds for 50 requests
		});

		it("should benchmark all frameworks under concurrent load", async () => {
			const frameworks = ["express", "nestjs", "fastify", "hono"] as const;
			const concurrency = 20;
			const results = new Map<string, {
				avgLatency: number;
				maxLatency: number;
				totalTime: number;
				rps: number;
			}>();

			for (const framework of frameworks) {
				console.log(`\n--- Load testing ${framework.toUpperCase()} ---`);
				
				const project = await createTestProject({ framework, cleanup: true });
				const port = await testServerManager.findAvailablePort(3000);

				try {
					const options = createBackendOptions({
						framework,
						database: "sqlite",
						features: ["rest-api"],
					});

					const generateResult = await generateBackend(project.path, options);
					assertSuccessfulResult(generateResult);

					await testServerManager.installDependencies(project.path);

					const serverConfig: ServerConfig = {
						projectPath: project.path,
						framework,
						port,
						env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
						startTimeout: framework === "nestjs" ? 45000 : 30000,
					};

					await testServerManager.startServer(serverConfig);
					const server = testServerManager.getServer(framework, port);

					// Warm up
					await fetch(`${server!.url}/health`);
					await fetch(`${server!.url}/health`);

					// Load test
					const { duration: totalDuration } = await measureTime(async () => {
						const promises = Array.from({ length: concurrency }, async () => {
							const startTime = performance.now();
							const response = await fetch(`${server!.url}/health`);
							expect(response.status).toBe(200);
							await response.json();
							return performance.now() - startTime;
						});

						const latencies = await Promise.all(promises);
						const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
						const maxLatency = Math.max(...latencies);
						const rps = concurrency / (totalDuration / 1000);

						results.set(framework, {
							avgLatency,
							maxLatency,
							totalTime: totalDuration,
							rps,
						});

						console.log(`${framework} load test results:`, {
							avgLatency: `${avgLatency.toFixed(2)}ms`,
							maxLatency: `${maxLatency.toFixed(2)}ms`,
							totalTime: `${totalDuration.toFixed(2)}ms`,
							rps: `${rps.toFixed(2)} req/s`,
						});
					});

					// Cleanup
					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				} catch (error) {
					console.error(`Failed to load test ${framework}:`, error);
					results.set(framework, {
						avgLatency: Infinity,
						maxLatency: Infinity,
						totalTime: Infinity,
						rps: 0,
					});

					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				}
			}

			// Print comparison
			console.log("\n=== LATENCY BENCHMARK COMPARISON ===");
			console.log("Framework\t\tAvg Latency\tMax Latency\tRPS");
			console.log("─".repeat(55));

			const sortedByLatency = Array.from(results.entries())
				.sort(([, a], [, b]) => a.avgLatency - b.avgLatency);

			for (const [framework, metrics] of sortedByLatency) {
				const avgLatency = metrics.avgLatency === Infinity ? "FAILED" : `${metrics.avgLatency.toFixed(1)}ms`;
				const maxLatency = metrics.maxLatency === Infinity ? "FAILED" : `${metrics.maxLatency.toFixed(1)}ms`;
				const rps = metrics.rps === 0 ? "FAILED" : `${metrics.rps.toFixed(1)}`;
				
				console.log(`${framework.padEnd(12)}\t${avgLatency.padEnd(10)}\t${maxLatency.padEnd(10)}\t${rps}`);
			}

			// Verify performance expectations
			const successfulResults = Array.from(results.values())
				.filter(result => result.avgLatency !== Infinity);

			expect(successfulResults.length).toBeGreaterThan(0);

			// At least one framework should achieve good performance
			const bestAvgLatency = Math.min(...successfulResults.map(r => r.avgLatency));
			const bestRps = Math.max(...successfulResults.map(r => r.rps));

			expect(bestAvgLatency).toBeLessThan(100); // Best framework under 100ms average
			expect(bestRps).toBeGreaterThan(10); // At least 10 RPS
		});
	});

	describe("Database Operation Latency", () => {
		it("should measure CRUD operation latency", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			const testUser = {
				name: "Performance Test User",
				email: "perf@example.com",
				age: 25,
			};

			// Measure CREATE latency
			const { duration: createDuration } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(testUser),
				});
				expect(response.status).toBe(201);
				const data = await response.json();
				return data.id;
			});

			console.log(`CREATE operation latency: ${createDuration.toFixed(2)}ms`);
			expect(createDuration).toBeLessThan(100);

			// Get the created user ID for further operations
			const allUsersResponse = await fetch(`${server!.url}/api/users`);
			const users = await allUsersResponse.json();
			const userId = users[0].id;

			// Measure READ latency
			const { duration: readDuration } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users/${userId}`);
				expect(response.status).toBe(200);
				await response.json();
			});

			console.log(`READ operation latency: ${readDuration.toFixed(2)}ms`);
			expect(readDuration).toBeLessThan(50);

			// Measure UPDATE latency
			const { duration: updateDuration } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users/${userId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...testUser, name: "Updated Name" }),
				});
				expect(response.status).toBe(200);
				await response.json();
			});

			console.log(`UPDATE operation latency: ${updateDuration.toFixed(2)}ms`);
			expect(updateDuration).toBeLessThan(100);

			// Measure DELETE latency
			const { duration: deleteDuration } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users/${userId}`, {
					method: "DELETE",
				});
				expect(response.status).toBe(200);
			});

			console.log(`DELETE operation latency: ${deleteDuration.toFixed(2)}ms`);
			expect(deleteDuration).toBeLessThan(100);
		});
	});

	describe("Latency Under Different Conditions", () => {
		it("should measure latency with authentication", async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				authentication: "jwt",
				features: ["rest-api", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Test public endpoint latency
			const { duration: publicLatency } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/health`);
				expect(response.status).toBe(200);
				await response.json();
			});

			// Test protected endpoint latency (this will return 401, but we measure the latency)
			const { duration: protectedLatency } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users`);
				// Will be 401 Unauthorized, but that's expected
				await response.text();
			});

			console.log("Latency with authentication:", {
				public: `${publicLatency.toFixed(2)}ms`,
				protected: `${protectedLatency.toFixed(2)}ms`,
			});

			expect(publicLatency).toBeLessThan(50);
			expect(protectedLatency).toBeLessThan(100); // Auth middleware adds overhead
		});

		it("should measure latency with validation", async () => {
			testProject = await createTestProject({
				framework: "fastify",
				cleanup: true,
			});

			const options = createBackendOptions({
				framework: "fastify",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "fastify",
				port: serverPort,
				env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("fastify", serverPort);

			const validUser = {
				name: "Valid User",
				email: "valid@example.com",
				age: 25,
			};

			const invalidUser = {
				name: "", // Invalid
				email: "invalid-email", // Invalid
				age: -5, // Invalid
			};

			// Measure valid request latency
			const { duration: validLatency } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(validUser),
				});
				expect(response.status).toBe(201);
				await response.json();
			});

			// Measure invalid request latency (validation error)
			const { duration: invalidLatency } = await measureTime(async () => {
				const response = await fetch(`${server!.url}/api/users`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(invalidUser),
				});
				expect(response.status).toBe(400);
				await response.json();
			});

			console.log("Latency with validation:", {
				valid: `${validLatency.toFixed(2)}ms`,
				invalid: `${invalidLatency.toFixed(2)}ms`,
			});

			expect(validLatency).toBeLessThan(100);
			expect(invalidLatency).toBeLessThan(50); // Validation should be fast
		});
	});

	describe("Latency Baseline Establishment", () => {
		it("should establish comprehensive latency baselines", async () => {
			const frameworks = ["express", "nestjs", "fastify", "hono"] as const;
			const baselines = new Map<string, {
				healthCheck: number;
				simpleQuery: number;
				complexQuery: number;
				concurrentLoad: number;
			}>();

			for (const framework of frameworks) {
				console.log(`\n--- Establishing ${framework.toUpperCase()} baselines ---`);
				
				const project = await createTestProject({ framework, cleanup: true });
				const port = await testServerManager.findAvailablePort(3000);

				try {
					const options = createBackendOptions({
						framework,
						database: "sqlite",
						features: ["rest-api"],
					});

					const generateResult = await generateBackend(project.path, options);
					assertSuccessfulResult(generateResult);

					await testServerManager.installDependencies(project.path);

					const serverConfig: ServerConfig = {
						projectPath: project.path,
						framework,
						port,
						env: { NODE_ENV: "production", DATABASE_URL: "file:./test.db" },
						startTimeout: framework === "nestjs" ? 45000 : 30000,
					};

					await testServerManager.startServer(serverConfig);
					const server = testServerManager.getServer(framework, port);

					// Warm up
					await fetch(`${server!.url}/health`);

					// Health check baseline
					const healthLatencies: number[] = [];
					for (let i = 0; i < 5; i++) {
						const { duration } = await measureTime(async () => {
							const response = await fetch(`${server!.url}/health`);
							expect(response.status).toBe(200);
							await response.json();
						});
						healthLatencies.push(duration);
					}
					const healthBaseline = healthLatencies.reduce((a, b) => a + b, 0) / healthLatencies.length;

					// Simple query baseline (GET all users)
					const simpleLatencies: number[] = [];
					for (let i = 0; i < 3; i++) {
						const { duration } = await measureTime(async () => {
							const response = await fetch(`${server!.url}/api/users`);
							expect(response.status).toBe(200);
							await response.json();
						});
						simpleLatencies.push(duration);
					}
					const simpleBaseline = simpleLatencies.reduce((a, b) => a + b, 0) / simpleLatencies.length;

					// Complex operation baseline (CREATE user)
					const complexLatencies: number[] = [];
					for (let i = 0; i < 3; i++) {
						const { duration } = await measureTime(async () => {
							const response = await fetch(`${server!.url}/api/users`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									name: `Baseline User ${i}`,
									email: `baseline${i}@example.com`,
									age: 25,
								}),
							});
							expect(response.status).toBe(201);
							await response.json();
						});
						complexLatencies.push(duration);
					}
					const complexBaseline = complexLatencies.reduce((a, b) => a + b, 0) / complexLatencies.length;

					// Concurrent load baseline (10 concurrent requests)
					const { duration: concurrentBaseline } = await measureTime(async () => {
						const promises = Array.from({ length: 10 }, () =>
							fetch(`${server!.url}/health`).then(r => r.json())
						);
						await Promise.all(promises);
					});

					baselines.set(framework, {
						healthCheck: healthBaseline,
						simpleQuery: simpleBaseline,
						complexQuery: complexBaseline,
						concurrentLoad: concurrentBaseline,
					});

					console.log(`${framework} baselines:`, {
						healthCheck: `${healthBaseline.toFixed(2)}ms`,
						simpleQuery: `${simpleBaseline.toFixed(2)}ms`,
						complexQuery: `${complexBaseline.toFixed(2)}ms`,
						concurrentLoad: `${concurrentBaseline.toFixed(2)}ms`,
					});

					// Cleanup
					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				} catch (error) {
					console.error(`Failed to establish baselines for ${framework}:`, error);
					baselines.set(framework, {
						healthCheck: Infinity,
						simpleQuery: Infinity,
						complexQuery: Infinity,
						concurrentLoad: Infinity,
					});

					await testServerManager.stopServer(framework, port);
					await project.cleanup();
				}
			}

			// Print final baseline summary
			console.log("\n=== LATENCY BASELINES ESTABLISHED ===");
			console.log("Framework\t\tHealth\tSimple\tComplex\tConcurrent");
			console.log("─".repeat(65));

			for (const [framework, metrics] of baselines.entries()) {
				const health = metrics.healthCheck === Infinity ? "FAIL" : `${metrics.healthCheck.toFixed(0)}ms`;
				const simple = metrics.simpleQuery === Infinity ? "FAIL" : `${metrics.simpleQuery.toFixed(0)}ms`;
				const complex = metrics.complexQuery === Infinity ? "FAIL" : `${metrics.complexQuery.toFixed(0)}ms`;
				const concurrent = metrics.concurrentLoad === Infinity ? "FAIL" : `${metrics.concurrentLoad.toFixed(0)}ms`;
				
				console.log(`${framework.padEnd(12)}\t${health.padEnd(6)}\t${simple.padEnd(6)}\t${complex.padEnd(7)}\t${concurrent}`);
			}

			// Verify reasonable baselines were established
			const successfulBaselines = Array.from(baselines.values())
				.filter(baseline => baseline.healthCheck !== Infinity);

			expect(successfulBaselines.length).toBeGreaterThan(0);

			// At least one framework should meet performance targets
			const bestHealthCheck = Math.min(...successfulBaselines.map(b => b.healthCheck));
			expect(bestHealthCheck).toBeLessThan(100);
		});
	});
});
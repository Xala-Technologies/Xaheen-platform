/**
 * End-to-End CRUD Operations Tests
 * Tests complete CRUD workflows with real database connections using supertest
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import { 
	createTestProject, 
	createBackendOptions, 
	assertSuccessfulResult,
	measureTime,
	waitForCondition,
	type TestProject,
} from "../utils/test-helpers";
import { testServerManager, type ServerConfig } from "../utils/server-manager";
import { databaseTestHelper, type TestDatabase } from "../utils/database-helper";
import { generateBackend } from "@/generators/backend";

describe("E2E CRUD Operations Tests", () => {
	let testProject: TestProject;
	let testDatabase: TestDatabase;
	let serverPort: number;
	let baseUrl: string;

	beforeAll(async () => {
		// Set longer timeout for E2E tests
		// timeout configured in bun test settings
	});

	afterAll(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
	});

	describe("Express CRUD Operations", () => {
		beforeEach(async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			testDatabase = await databaseTestHelper.createTestDatabase("sqlite");
			serverPort = await testServerManager.findAvailablePort(3000);
			baseUrl = `http://localhost:${serverPort}`;
		});

		afterEach(async () => {
			await testServerManager.stopServer("express", serverPort);
			await testDatabase.cleanup();
			await testProject.cleanup();
		});

		it("should perform complete User CRUD operations", async () => {
			// Generate Express project with User model
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				orm: "mongoose",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Install dependencies and start server
			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: testDatabase.connectionString,
				},
				startTimeout: 30000,
			};

			await testServerManager.startServer(serverConfig);

			const server = testServerManager.getServer("express", serverPort);
			expect(server).toBeDefined();

			// Test data
			const testUser = {
				name: "John Doe",
				email: "john.doe@example.com",
				age: 30,
			};

			const updatedUser = {
				name: "John Smith",
				email: "john.smith@example.com",
				age: 31,
			};

			// CREATE: Test user creation
			const createResponse = await request(server!.url)
				.post("/api/users")
				.send(testUser)
				.expect(201);

			expect(createResponse.body).toHaveProperty("id");
			expect(createResponse.body.name).toBe(testUser.name);
			expect(createResponse.body.email).toBe(testUser.email);
			expect(createResponse.body.age).toBe(testUser.age);

			const userId = createResponse.body.id;

			// READ: Test getting all users
			const getAllResponse = await request(server!.url)
				.get("/api/users")
				.expect(200);

			expect(Array.isArray(getAllResponse.body)).toBe(true);
			expect(getAllResponse.body).toHaveLength(1);
			expect(getAllResponse.body[0].id).toBe(userId);

			// READ: Test getting user by ID
			const getByIdResponse = await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(200);

			expect(getByIdResponse.body.id).toBe(userId);
			expect(getByIdResponse.body.name).toBe(testUser.name);
			expect(getByIdResponse.body.email).toBe(testUser.email);

			// UPDATE: Test user update
			const updateResponse = await request(server!.url)
				.put(`/api/users/${userId}`)
				.send(updatedUser)
				.expect(200);

			expect(updateResponse.body.id).toBe(userId);
			expect(updateResponse.body.name).toBe(updatedUser.name);
			expect(updateResponse.body.email).toBe(updatedUser.email);
			expect(updateResponse.body.age).toBe(updatedUser.age);

			// Verify update
			const verifyUpdateResponse = await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(200);

			expect(verifyUpdateResponse.body.name).toBe(updatedUser.name);

			// DELETE: Test user deletion
			await request(server!.url)
				.delete(`/api/users/${userId}`)
				.expect(200);

			// Verify deletion
			await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(404);

			// Verify empty list
			const finalGetAllResponse = await request(server!.url)
				.get("/api/users")
				.expect(200);

			expect(finalGetAllResponse.body).toHaveLength(0);
		});

		it("should handle validation errors properly", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Test missing required fields
			const invalidUser = {
				email: "invalid-email", // Invalid email format
				age: -5, // Invalid age
			};

			const response = await request(server!.url)
				.post("/api/users")
				.send(invalidUser)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error).toContain("validation");
		});

		it("should handle duplicate email errors", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			const testUser = {
				name: "John Doe",
				email: "john.doe@example.com",
				age: 30,
			};

			// Create first user
			await request(server!.url)
				.post("/api/users")
				.send(testUser)
				.expect(201);

			// Try to create user with same email
			const duplicateResponse = await request(server!.url)
				.post("/api/users")
				.send(testUser)
				.expect(409);

			expect(duplicateResponse.body).toHaveProperty("error");
			expect(duplicateResponse.body.error).toContain("duplicate");
		});
	});

	describe("NestJS CRUD Operations", () => {
		beforeEach(async () => {
			testProject = await createTestProject({
				framework: "nestjs",
				cleanup: true,
			});

			testDatabase = await databaseTestHelper.createTestDatabase("sqlite");
			serverPort = await testServerManager.findAvailablePort(3000);
			baseUrl = `http://localhost:${serverPort}`;
		});

		afterEach(async () => {
			await testServerManager.stopServer("nestjs", serverPort);
			await testDatabase.cleanup();
			await testProject.cleanup();
		});

		it("should perform complete User CRUD operations with TypeORM", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "sqlite",
				orm: "typeorm",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "nestjs",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: testDatabase.connectionString,
				},
				startTimeout: 45000,
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("nestjs", serverPort);

			const testUser = {
				name: "Jane Doe",
				email: "jane.doe@example.com",
				age: 25,
			};

			// CREATE
			const createResponse = await request(server!.url)
				.post("/users")
				.send(testUser)
				.expect(201);

			expect(createResponse.body).toHaveProperty("id");
			expect(createResponse.body.name).toBe(testUser.name);

			const userId = createResponse.body.id;

			// READ
			const getAllResponse = await request(server!.url)
				.get("/users")
				.expect(200);

			expect(Array.isArray(getAllResponse.body)).toBe(true);
			expect(getAllResponse.body).toHaveLength(1);

			// READ by ID
			const getByIdResponse = await request(server!.url)
				.get(`/users/${userId}`)
				.expect(200);

			expect(getByIdResponse.body.id).toBe(userId);

			// UPDATE
			const updatedData = { name: "Jane Smith", age: 26 };
			const updateResponse = await request(server!.url)
				.patch(`/users/${userId}`)
				.send(updatedData)
				.expect(200);

			expect(updateResponse.body.name).toBe(updatedData.name);
			expect(updateResponse.body.age).toBe(updatedData.age);

			// DELETE
			await request(server!.url)
				.delete(`/users/${userId}`)
				.expect(200);

			// Verify deletion
			await request(server!.url)
				.get(`/users/${userId}`)
				.expect(404);
		});

		it("should validate DTOs properly", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("nestjs", serverPort);

			// Test validation with invalid data
			const invalidUser = {
				name: "", // Empty name
				email: "not-an-email", // Invalid email
				age: "not-a-number", // Invalid age type
			};

			const response = await request(server!.url)
				.post("/users")
				.send(invalidUser)
				.expect(400);

			expect(response.body).toHaveProperty("message");
			expect(Array.isArray(response.body.message)).toBe(true);
			expect(response.body.message.length).toBeGreaterThan(0);
		});
	});

	describe("Fastify CRUD Operations", () => {
		beforeEach(async () => {
			testProject = await createTestProject({
				framework: "fastify",
				cleanup: true,
			});

			testDatabase = await databaseTestHelper.createTestDatabase("sqlite");
			serverPort = await testServerManager.findAvailablePort(3000);
			baseUrl = `http://localhost:${serverPort}`;
		});

		afterEach(async () => {
			await testServerManager.stopServer("fastify", serverPort);
			await testDatabase.cleanup();
			await testProject.cleanup();
		});

		it("should perform complete User CRUD operations with JSON Schema validation", async () => {
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
				env: {
					NODE_ENV: "test",
					DATABASE_URL: testDatabase.connectionString,
				},
				startTimeout: 25000,
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("fastify", serverPort);

			const testUser = {
				name: "Alice Johnson",
				email: "alice.johnson@example.com",
				age: 28,
			};

			// Test the full CRUD cycle
			const createResponse = await request(server!.url)
				.post("/api/users")
				.send(testUser)
				.expect(201);

			expect(createResponse.body).toHaveProperty("id");
			const userId = createResponse.body.id;

			// Test pagination and query parameters
			const getAllResponse = await request(server!.url)
				.get("/api/users?page=1&limit=10")
				.expect(200);

			expect(getAllResponse.body).toHaveProperty("data");
			expect(getAllResponse.body).toHaveProperty("total");
			expect(getAllResponse.body).toHaveProperty("page");

			// Test GET by ID
			await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(200);

			// Test UPDATE
			const updateData = { name: "Alice Brown" };
			await request(server!.url)
				.put(`/api/users/${userId}`)
				.send(updateData)
				.expect(200);

			// Test DELETE
			await request(server!.url)
				.delete(`/api/users/${userId}`)
				.expect(204);
		});

		it("should enforce JSON Schema validation", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("fastify", serverPort);

			// Test schema validation
			const invalidUser = {
				name: 123, // Should be string
				email: "invalid-email",
				age: "not-a-number",
			};

			const response = await request(server!.url)
				.post("/api/users")
				.send(invalidUser)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error).toContain("validation");
		});
	});

	describe("Hono CRUD Operations", () => {
		beforeEach(async () => {
			testProject = await createTestProject({
				framework: "hono",
				cleanup: true,
			});

			testDatabase = await databaseTestHelper.createTestDatabase("sqlite");
			serverPort = await testServerManager.findAvailablePort(3000);
			baseUrl = `http://localhost:${serverPort}`;
		});

		afterEach(async () => {
			await testServerManager.stopServer("hono", serverPort);
			await testDatabase.cleanup();
			await testProject.cleanup();
		});

		it("should perform complete User CRUD operations with Zod validation", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				orm: "drizzle",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "hono",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: testDatabase.connectionString,
				},
				startTimeout: 20000,
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("hono", serverPort);

			const testUser = {
				name: "Bob Wilson",
				email: "bob.wilson@example.com",
				age: 35,
			};

			// CREATE
			const createResponse = await request(server!.url)
				.post("/api/users")
				.send(testUser)
				.expect(201);

			expect(createResponse.body).toHaveProperty("id");
			expect(createResponse.body.name).toBe(testUser.name);

			const userId = createResponse.body.id;

			// READ all
			const getAllResponse = await request(server!.url)
				.get("/api/users")
				.expect(200);

			expect(Array.isArray(getAllResponse.body)).toBe(true);
			expect(getAllResponse.body).toHaveLength(1);

			// READ by ID
			const getByIdResponse = await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(200);

			expect(getByIdResponse.body.id).toBe(userId);

			// UPDATE
			const updateData = { name: "Bob Johnson", age: 36 };
			const updateResponse = await request(server!.url)
				.put(`/api/users/${userId}`)
				.send(updateData)
				.expect(200);

			expect(updateResponse.body.name).toBe(updateData.name);
			expect(updateResponse.body.age).toBe(updateData.age);

			// DELETE
			await request(server!.url)
				.delete(`/api/users/${userId}`)
				.expect(200);

			// Verify deletion
			await request(server!.url)
				.get(`/api/users/${userId}`)
				.expect(404);
		});

		it("should enforce Zod schema validation", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("hono", serverPort);

			// Test Zod validation
			const invalidUser = {
				name: "", // Empty string should fail
				email: "not-an-email",
				age: -5, // Negative age should fail
			};

			const response = await request(server!.url)
				.post("/api/users")
				.send(invalidUser)
				.expect(400);

			expect(response.body).toHaveProperty("error");
			expect(response.body.error).toContain("validation");
		});
	});

	describe("Cross-Framework Performance Comparison", () => {
		it("should benchmark CRUD operation performance across frameworks", async () => {
			const frameworks = ["express", "nestjs", "fastify", "hono"] as const;
			const performanceResults = new Map<string, number>();

			for (const framework of frameworks) {
				const project = await createTestProject({ framework, cleanup: true });
				const database = await databaseTestHelper.createTestDatabase("sqlite");
				const port = await testServerManager.findAvailablePort(3000);

				try {
					const options = createBackendOptions({
						framework,
						database: "sqlite",
						features: ["rest-api"],
					});

					const result = await generateBackend(project.path, options);
					assertSuccessfulResult(result);

					await testServerManager.installDependencies(project.path);

					const serverConfig: ServerConfig = {
						projectPath: project.path,
						framework,
						port,
						env: {
							NODE_ENV: "test",
							DATABASE_URL: database.connectionString,
						},
						startTimeout: 45000,
					};

					await testServerManager.startServer(serverConfig);
					const server = testServerManager.getServer(framework, port);

					// Benchmark 100 CREATE operations
					const testUser = {
						name: "Performance Test User",
						email: `test-${Date.now()}@example.com`,
						age: 25,
					};

					const { duration } = await measureTime(async () => {
						const promises = Array.from({ length: 10 }, (_, i) => 
							request(server!.url)
								.post("/api/users" + (framework === "nestjs" ? "" : ""))
								.send({ ...testUser, email: `test-${i}-${Date.now()}@example.com` })
						);
						await Promise.all(promises);
					});

					performanceResults.set(framework, duration);

					// Cleanup
					await testServerManager.stopServer(framework, port);
					await database.cleanup();
					await project.cleanup();
				} catch (error) {
					console.warn(`Failed to benchmark ${framework}:`, error);
					performanceResults.set(framework, Infinity);

					// Cleanup on error
					await testServerManager.stopServer(framework, port);
					await database.cleanup();
					await project.cleanup();
				}
			}

			// Log performance results
			console.log("\nCRUD Performance Benchmark Results (10 operations):");
			for (const [framework, duration] of performanceResults.entries()) {
				console.log(`${framework}: ${duration.toFixed(2)}ms`);
			}

			// Verify that all frameworks completed within reasonable time
			for (const [framework, duration] of performanceResults.entries()) {
				expect(duration, `${framework} should complete within 10 seconds`).toBeLessThan(10000);
			}
		});
	});

	describe("Complex CRUD Scenarios", () => {
		beforeEach(async () => {
			testProject = await createTestProject({
				framework: "express",
				cleanup: true,
			});

			testDatabase = await databaseTestHelper.createTestDatabase("sqlite");
			serverPort = await testServerManager.findAvailablePort(3000);
		});

		afterEach(async () => {
			await testServerManager.stopServer("express", serverPort);
			await testDatabase.cleanup();
			await testProject.cleanup();
		});

		it("should handle bulk operations", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Create multiple users
			const users = Array.from({ length: 5 }, (_, i) => ({
				name: `User ${i + 1}`,
				email: `user${i + 1}@example.com`,
				age: 20 + i,
			}));

			const createPromises = users.map(user =>
				request(server!.url)
					.post("/api/users")
					.send(user)
					.expect(201)
			);

			const createResponses = await Promise.all(createPromises);
			expect(createResponses).toHaveLength(5);

			// Get all users
			const getAllResponse = await request(server!.url)
				.get("/api/users")
				.expect(200);

			expect(getAllResponse.body).toHaveLength(5);
		});

		it("should handle pagination correctly", async () => {
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
				env: { NODE_ENV: "test", DATABASE_URL: testDatabase.connectionString },
			};

			await testServerManager.startServer(serverConfig);
			const server = testServerManager.getServer("express", serverPort);

			// Create 15 users
			const users = Array.from({ length: 15 }, (_, i) => ({
				name: `User ${i + 1}`,
				email: `user${i + 1}@example.com`,
				age: 20 + i,
			}));

			for (const user of users) {
				await request(server!.url)
					.post("/api/users")
					.send(user)
					.expect(201);
			}

			// Test pagination
			const page1Response = await request(server!.url)
				.get("/api/users?page=1&limit=5")
				.expect(200);

			const page2Response = await request(server!.url)
				.get("/api/users?page=2&limit=5")
				.expect(200);

			// Verify pagination works
			expect(page1Response.body).toHaveLength(5);
			expect(page2Response.body).toHaveLength(5);

			// Verify different users
			const page1Ids = page1Response.body.map((user: any) => user.id);
			const page2Ids = page2Response.body.map((user: any) => user.id);
			
			// No overlap between pages
			expect(page1Ids.some((id: any) => page2Ids.includes(id))).toBe(false);
		});
	});
});
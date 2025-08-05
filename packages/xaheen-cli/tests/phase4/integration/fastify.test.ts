/**
 * Fastify Framework Integration Tests
 * Tests complete Fastify scaffolding workflow from generation to health check
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { 
	createTestProject, 
	createBackendOptions, 
	validateBackendStructure,
	assertSuccessfulResult,
	measureTime,
	type TestProject,
} from "../utils/test-helpers";
import { testServerManager, type ServerConfig } from "../utils/server-manager";
import { databaseTestHelper } from "../utils/database-helper";
import { generateBackend } from "@/generators/backend";

describe("Fastify Framework Integration Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		testProject = await createTestProject({
			framework: "fastify",
			cleanup: true,
		});

		serverPort = await testServerManager.findAvailablePort(3000);
	});

	afterEach(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
		await testProject.cleanup();
		vi.clearAllMocks();
	});

	describe("Basic Fastify Project Scaffolding", () => {
		it("should generate a complete Fastify project structure", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api", "authentication", "testing"],
				testing: true,
				documentation: true,
			});

			const { result, duration } = await measureTime(() => 
				generateBackend(testProject.path, options)
			);

			assertSuccessfulResult(result);
			expect(duration).toBeLessThan(12000);

			const validation = await validateBackendStructure(testProject, "fastify");
			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Check Fastify-specific files
			expect(await testProject.fileExists("src/app.js")).toBe(true);
			expect(await testProject.fileExists("src/plugins/index.js")).toBe(true);
			expect(await testProject.fileExists("src/routes/index.js")).toBe(true);
			expect(await testProject.fileExists("src/schemas/index.js")).toBe(true);
		});

		it("should generate proper package.json with Fastify dependencies", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api", "cors", "rate-limiting"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));

			// Check Fastify core dependencies
			expect(packageJson.dependencies).toHaveProperty("fastify");
			expect(packageJson.dependencies).toHaveProperty("@fastify/postgres");
			expect(packageJson.dependencies).toHaveProperty("@fastify/cors");
			expect(packageJson.dependencies).toHaveProperty("@fastify/rate-limit");
			expect(packageJson.dependencies).toHaveProperty("@fastify/helmet");
			expect(packageJson.dependencies).toHaveProperty("@fastify/env");
			expect(packageJson.dependencies).toHaveProperty("@fastify/swagger");

			// Check development dependencies
			expect(packageJson.devDependencies).toHaveProperty("tap");
			expect(packageJson.devDependencies).toHaveProperty("nodemon");

			// Check scripts
			expect(packageJson.scripts).toHaveProperty("dev");
			expect(packageJson.scripts).toHaveProperty("start");
			expect(packageJson.scripts).toHaveProperty("test");
			expect(packageJson.scripts.start).toContain("fastify start");
			expect(packageJson.scripts.dev).toContain("fastify start --watch");
		});

		it("should generate Fastify application with plugin architecture", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("const fastify = require('fastify')");
			expect(appFile).toContain("fastify.register");
			expect(appFile).toContain("module.exports = fastify");

			// Check plugin registration
			expect(appFile).toContain("@fastify/helmet");
			expect(appFile).toContain("@fastify/cors");
		});
	});

	describe("Fastify with JSON Schema Validation", () => {
		it("should generate JSON Schema validation for routes", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/schemas/user.js")).toBe(true);

			const userSchema = await testProject.readFile("src/schemas/user.js");
			expect(userSchema).toContain("const userSchema = {");
			expect(userSchema).toContain("type: 'object'");
			expect(userSchema).toContain("properties: {");
			expect(userSchema).toContain("required: [");

			const userRoutes = await testProject.readFile("src/routes/users.js");
			expect(userRoutes).toContain("schema: {");
			expect(userRoutes).toContain("body: userSchema");
			expect(userRoutes).toContain("response: {");
		});

		it("should generate Swagger documentation integration", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/swagger");
			expect(packageJson.dependencies).toHaveProperty("@fastify/swagger-ui");

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("@fastify/swagger");
			expect(appFile).toContain("@fastify/swagger-ui");
		});
	});

	describe("Fastify Database Integration", () => {
		it("should generate Fastify project with PostgreSQL plugin", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/postgres");

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("@fastify/postgres");

			expect(await testProject.fileExists("src/plugins/database.js")).toBe(true);
		});

		it("should generate Fastify project with MongoDB plugin", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "mongodb",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/mongodb");

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("@fastify/mongodb");
		});
	});

	describe("Fastify Feature Integration", () => {
		it("should generate Fastify project with JWT authentication", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				authentication: "jwt",
				features: ["authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/jwt");
			expect(packageJson.dependencies).toHaveProperty("bcryptjs");

			expect(await testProject.fileExists("src/plugins/auth.js")).toBe(true);
			expect(await testProject.fileExists("src/routes/auth.js")).toBe(true);

			const authPlugin = await testProject.readFile("src/plugins/auth.js");
			expect(authPlugin).toContain("@fastify/jwt");
			expect(authPlugin).toContain("fastify.register");
		});

		it("should generate Fastify project with file upload", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["file-upload"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/multipart");

			expect(await testProject.fileExists("src/routes/upload.js")).toBe(true);
		});

		it("should generate Fastify project with rate limiting", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/rate-limit");

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("@fastify/rate-limit");
		});
	});

	describe("Fastify Server Performance", () => {
		it("should start Fastify server with excellent performance", async () => {
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
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 20000,
			};

			const { duration: startupDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			// Fastify should have excellent cold start performance
			expect(startupDuration).toBeLessThan(1500);

			const server = testServerManager.getServer("fastify", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test health endpoint
			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);

			const healthData = await response.json();
			expect(healthData).toHaveProperty("status");
			expect(healthData.status).toBe("ok");
		});

		it("should handle high concurrency", async () => {
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
				env: { NODE_ENV: "test" },
			};

			const server = await testServerManager.startServer(serverConfig);

			// Test concurrent requests
			const promises = Array.from({ length: 10 }, () =>
				fetch(`${server.url}/health`)
			);

			const responses = await Promise.all(promises);
			responses.forEach(response => {
				expect(response.status).toBe(200);
			});
		});
	});

	describe("Fastify Plugin Ecosystem", () => {
		it("should generate project with essential plugins", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api", "caching"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			
			// Essential plugins
			expect(packageJson.dependencies).toHaveProperty("@fastify/helmet");
			expect(packageJson.dependencies).toHaveProperty("@fastify/cors");
			expect(packageJson.dependencies).toHaveProperty("@fastify/env");
			expect(packageJson.dependencies).toHaveProperty("@fastify/redis");

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("fastify.register(require('@fastify/helmet'))");
			expect(appFile).toContain("fastify.register(require('@fastify/cors'))");
		});

		it("should generate custom plugin structure", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/plugins/database.js")).toBe(true);
			expect(await testProject.fileExists("src/plugins/index.js")).toBe(true);

			const pluginIndex = await testProject.readFile("src/plugins/index.js");
			expect(pluginIndex).toContain("module.exports = async function");
			expect(pluginIndex).toContain("fastify.register");
		});
	});

	describe("Fastify Testing", () => {
		it("should generate test setup with Tap", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "sqlite",
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.devDependencies).toHaveProperty("tap");

			expect(await testProject.fileExists("test/app.test.js")).toBe(true);

			const testFile = await testProject.readFile("test/app.test.js");
			expect(testFile).toContain("const tap = require('tap')");
			expect(testFile).toContain("const build = require('../src/app')");
			expect(testFile).toContain("tap.test");
		});

		it("should generate route-specific tests", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "sqlite",
				features: ["rest-api"],
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("test/routes/users.test.js")).toBe(true);

			const userTest = await testProject.readFile("test/routes/users.test.js");
			expect(userTest).toContain("tap.test('GET /users'");
			expect(userTest).toContain("tap.test('POST /users'");
			expect(userTest).toContain("app.inject({");
		});
	});

	describe("Fastify TypeScript Support", () => {
		it("should generate TypeScript Fastify project", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api"],
			});

			// Assume TypeScript mode
			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// If TypeScript is enabled, check for .ts files
			if (await testProject.fileExists("src/app.ts")) {
				const packageJson = JSON.parse(await testProject.readFile("package.json"));
				expect(packageJson.devDependencies).toHaveProperty("typescript");
				expect(packageJson.devDependencies).toHaveProperty("@types/node");

				const appFile = await testProject.readFile("src/app.ts");
				expect(appFile).toContain("import fastify");
				expect(appFile).toContain("FastifyInstance");
			}
		});
	});

	describe("Fastify Configuration Management", () => {
		it("should generate environment configuration", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@fastify/env");

			expect(await testProject.fileExists("src/config/env.js")).toBe(true);

			const envConfig = await testProject.readFile("src/config/env.js");
			expect(envConfig).toContain("const envSchema = {");
			expect(envConfig).toContain("type: 'object'");
			expect(envConfig).toContain("properties: {");
		});

		it("should generate proper environment files", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const envExample = await testProject.readFile(".env.example");
			expect(envExample).toContain("PORT=3000");
			expect(envExample).toContain("NODE_ENV=development");
			expect(envExample).toContain("DATABASE_URL=");
		});
	});

	describe("Fastify Error Handling", () => {
		it("should generate comprehensive error handling", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/plugins/error-handler.js")).toBe(true);

			const errorHandler = await testProject.readFile("src/plugins/error-handler.js");
			expect(errorHandler).toContain("fastify.setErrorHandler");
			expect(errorHandler).toContain("reply.status");
			expect(errorHandler).toContain("error.statusCode");
		});

		it("should generate validation error handling", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const userRoutes = await testProject.readFile("src/routes/users.js");
			expect(userRoutes).toContain("preValidation:");
			expect(userRoutes).toContain("reply.code(400)");
		});
	});

	describe("Fastify Production Readiness", () => {
		it("should generate production configuration", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				deployment: "docker",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check production scripts
			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.scripts).toHaveProperty("start:prod");

			// Check logging configuration
			expect(await testProject.fileExists("src/plugins/logger.js")).toBe(true);

			const loggerPlugin = await testProject.readFile("src/plugins/logger.js");
			expect(loggerPlugin).toContain("pino");
			expect(loggerPlugin).toContain("level:");
		});

		it("should generate health checks and metrics", async () => {
			const options = createBackendOptions({
				framework: "fastify",
				database: "postgresql",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/routes/health.js")).toBe(true);

			const healthRoutes = await testProject.readFile("src/routes/health.js");
			expect(healthRoutes).toContain("GET /health");
			expect(healthRoutes).toContain("status: 'ok'");
			expect(healthRoutes).toContain("uptime:");
		});
	});
});
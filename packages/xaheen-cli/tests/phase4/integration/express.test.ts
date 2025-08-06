/**
 * Express Framework Integration Tests
 * Tests complete Express scaffolding workflow from generation to health check
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { join } from "node:path";
import { 
	createTestProject, 
	createBackendOptions, 
	validateBackendStructure,
	assertSuccessfulResult,
	waitForCondition,
	measureTime,
	type TestProject,
} from "../utils/test-helpers";
import { testServerManager, type ServerConfig } from "../utils/server-manager";
import { databaseTestHelper } from "../utils/database-helper";
import { generateBackend } from "@/generators/backend";
import type { BackendGeneratorOptions } from "@/generators/backend";

describe("Express Framework Integration Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		testProject = await createTestProject({
			framework: "express",
			cleanup: true,
		});

		// Find an available port for testing
		serverPort = await testServerManager.findAvailablePort(3000);
	});

	afterEach(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
		await testProject.cleanup();
		mock.restore();
	});

	describe("Basic Express Project Scaffolding", () => {
		it("should generate a complete Express project structure", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				orm: "mongoose",
				features: ["rest-api", "authentication", "testing"],
				testing: true,
				documentation: true,
				monitoring: true,
			});

			const { result, duration } = await measureTime(() => 
				generateBackend(testProject.path, options)
			);

			// Verify generation was successful
			assertSuccessfulResult(result);
			expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

			// Validate project structure
			const validation = await validateBackendStructure(testProject, "express");
			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Check Express-specific files
			expect(await testProject.fileExists("src/app.js")).toBe(true);
			expect(await testProject.fileExists("src/routes/index.js")).toBe(true);
			expect(await testProject.fileExists("src/middleware/index.js")).toBe(true);
			expect(await testProject.fileExists("src/models/index.js")).toBe(true);
			expect(await testProject.fileExists("src/controllers/index.js")).toBe(true);
		});

		it("should generate proper package.json with Express dependencies", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api", "cors", "rate-limiting"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));

			// Check Express core dependencies
			expect(packageJson.dependencies).toHaveProperty("express");
			expect(packageJson.dependencies).toHaveProperty("mongoose");
			expect(packageJson.dependencies).toHaveProperty("cors");
			expect(packageJson.dependencies).toHaveProperty("express-rate-limit");
			expect(packageJson.dependencies).toHaveProperty("helmet");
			expect(packageJson.dependencies).toHaveProperty("dotenv");

			// Check development dependencies
			expect(packageJson.devDependencies).toHaveProperty("nodemon");
			expect(packageJson.devDependencies).toHaveProperty("jest");
			expect(packageJson.devDependencies).toHaveProperty("supertest");

			// Check scripts
			expect(packageJson.scripts).toHaveProperty("dev");
			expect(packageJson.scripts).toHaveProperty("start");
			expect(packageJson.scripts).toHaveProperty("test");
			expect(packageJson.scripts.start).toContain("node");
			expect(packageJson.scripts.dev).toContain("nodemon");
		});

		it("should generate correct environment configuration", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const envExample = await testProject.readFile(".env.example");

			expect(envExample).toContain("PORT=3000");
			expect(envExample).toContain("NODE_ENV=development");
			expect(envExample).toContain("MONGODB_URI=");
			expect(envExample).toContain("JWT_SECRET=");

			// Check that .env file is also generated
			expect(await testProject.fileExists(".env")).toBe(true);
		});
	});

	describe("Express with Different Databases", () => {
		it("should generate Express project with PostgreSQL and Prisma", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "postgresql",
				orm: "prisma",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@prisma/client");
			expect(packageJson.devDependencies).toHaveProperty("prisma");

			// Check for Prisma schema
			expect(await testProject.fileExists("prisma/schema.prisma")).toBe(true);

			const prismaSchema = await testProject.readFile("prisma/schema.prisma");
			expect(prismaSchema).toContain("provider = \"postgresql\"");
		});

		it("should generate Express project with MySQL and TypeORM", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mysql",
				orm: "typeorm",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("typeorm");
			expect(packageJson.dependencies).toHaveProperty("mysql2");

			// Check for TypeORM configuration
			expect(await testProject.fileExists("ormconfig.json")).toBe(true);

			const ormConfig = JSON.parse(await testProject.readFile("ormconfig.json"));
			expect(ormConfig.type).toBe("mysql");
		});

		it("should generate Express project with SQLite", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				orm: "prisma",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const prismaSchema = await testProject.readFile("prisma/schema.prisma");
			expect(prismaSchema).toContain("provider = \"sqlite\"");
		});
	});

	describe("Express Feature Integration", () => {
		it("should generate Express project with authentication", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				authentication: "jwt",
				features: ["rest-api", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check authentication middleware
			expect(await testProject.fileExists("src/middleware/auth.js")).toBe(true);
			expect(await testProject.fileExists("src/routes/auth.js")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("jsonwebtoken");
			expect(packageJson.dependencies).toHaveProperty("bcryptjs");

			const authMiddleware = await testProject.readFile("src/middleware/auth.js");
			expect(authMiddleware).toContain("jsonwebtoken");
			expect(authMiddleware).toContain("Bearer");
		});

		it("should generate Express project with file upload", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api", "file-upload"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("multer");

			expect(await testProject.fileExists("src/middleware/upload.js")).toBe(true);
		});

		it("should generate Express project with email service", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api", "email"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("nodemailer");

			expect(await testProject.fileExists("src/services/email.js")).toBe(true);
		});

		it("should generate Express project with caching", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api", "caching"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("redis");

			expect(await testProject.fileExists("src/config/redis.js")).toBe(true);
			expect(await testProject.fileExists("src/middleware/cache.js")).toBe(true);
		});
	});

	describe("Express Project Dependencies Installation", () => {
		it("should install dependencies successfully using Bun", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Install dependencies
			const { duration } = await measureTime(() =>
				testServerManager.installDependencies(testProject.path)
			);

			expect(duration).toBeLessThan(60000); // Should install within 60 seconds

			// Verify node_modules exists
			expect(await testProject.fileExists("node_modules")).toBe(true);
			expect(await testProject.fileExists("bun.lockb")).toBe(true);
		});
	});

	describe("Express Server Health Check", () => {
		it("should start Express server and respond to health check", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite", // Use SQLite for faster testing
				features: ["rest-api"],
			});

			// Generate the project
			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Install dependencies
			await testServerManager.installDependencies(testProject.path);

			// Start the server
			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 30000,
			};

			const { duration: startupDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			// Verify cold start time is under 2 seconds (as per requirements)
			expect(startupDuration).toBeLessThan(2000);

			const server = testServerManager.getServer("express", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test health endpoint
			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);

			const healthData = await response.json();
			expect(healthData).toHaveProperty("status");
			expect(healthData.status).toBe("ok");
		});

		it("should handle server startup errors gracefully", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "postgresql", // This will fail without a real database
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			await testServerManager.installDependencies(testProject.path);

			const serverConfig: ServerConfig = {
				projectPath: testProject.path,
				framework: "express",
				port: serverPort,
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "postgresql://invalid:invalid@localhost:5432/invalid",
				},
				startTimeout: 10000,
			};

			// Server should fail to start due to invalid database connection
			await expect(testServerManager.startServer(serverConfig))
				.rejects.toThrow();
		});
	});

	describe("Express API Endpoints", () => {
		it("should generate working CRUD endpoints", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check that CRUD routes are generated
			const routesDir = await testProject.listFiles("src/routes");
			expect(routesDir.some(file => file.includes("users"))).toBe(true);

			// Check route content
			const userRoutes = await testProject.readFile("src/routes/users.js");
			expect(userRoutes).toContain("router.get('/')"); // GET all
			expect(userRoutes).toContain("router.get('/:id')"); // GET by ID
			expect(userRoutes).toContain("router.post('/')"); // CREATE
			expect(userRoutes).toContain("router.put('/:id')"); // UPDATE
			expect(userRoutes).toContain("router.delete('/:id')"); // DELETE
		});

		it("should generate error handling middleware", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/middleware/errorHandler.js")).toBe(true);

			const errorHandler = await testProject.readFile("src/middleware/errorHandler.js");
			expect(errorHandler).toContain("module.exports = (err, req, res, next)");
			expect(errorHandler).toContain("res.status(");
			expect(errorHandler).toContain("error:");
		});

		it("should generate validation middleware", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/middleware/validation.js")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("joi");
		});
	});

	describe("Express Security Configuration", () => {
		it("should generate security middleware", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("helmet()");
			expect(appFile).toContain("cors()");

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("helmet");
			expect(packageJson.dependencies).toHaveProperty("cors");
		});

		it("should generate rate limiting", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appFile = await testProject.readFile("src/app.js");
			expect(appFile).toContain("rateLimit");

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("express-rate-limit");
		});
	});

	describe("Express Testing Setup", () => {
		it("should generate test configuration and sample tests", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				features: ["rest-api", "testing"],
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check Jest configuration
			expect(await testProject.fileExists("jest.config.js")).toBe(true);

			// Check test files
			expect(await testProject.fileExists("tests/setup.js")).toBe(true);
			expect(await testProject.fileExists("tests/app.test.js")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.devDependencies).toHaveProperty("jest");
			expect(packageJson.devDependencies).toHaveProperty("supertest");

			// Check test script
			expect(packageJson.scripts.test).toContain("jest");
		});

		it("should generate test files with proper structure", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "sqlite",
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const testFile = await testProject.readFile("tests/app.test.js");
			expect(testFile).toContain("const request = require('supertest')");
			expect(testFile).toContain("const app = require('../src/app')");
			expect(testFile).toContain("describe(");
			expect(testFile).toContain("it(");
			expect(testFile).toContain("expect(");
		});
	});

	describe("Express Documentation Generation", () => {
		it("should generate Swagger/OpenAPI documentation", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				features: ["rest-api"],
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("swagger-ui-express");
			expect(packageJson.dependencies).toHaveProperty("swagger-jsdoc");

			expect(await testProject.fileExists("src/config/swagger.js")).toBe(true);

			const swaggerConfig = await testProject.readFile("src/config/swagger.js");
			expect(swaggerConfig).toContain("swaggerJsdoc");
			expect(swaggerConfig).toContain("apis:");
		});

		it("should generate README with proper instructions", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const readme = await testProject.readFile("README.md");
			expect(readme).toContain("# EXPRESS Backend Application");
			expect(readme).toContain("## Quick Start");
			expect(readme).toContain("npm install");
			expect(readme).toContain("npm run dev");
			expect(readme).toContain("## API Documentation");
			expect(readme).toContain("http://localhost:3000/docs");
		});
	});

	describe("Express Docker Configuration", () => {
		it("should generate proper Dockerfile", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				deployment: "docker",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const dockerfile = await testProject.readFile("Dockerfile");
			expect(dockerfile).toContain("FROM node:18-alpine");
			expect(dockerfile).toContain("WORKDIR /app");
			expect(dockerfile).toContain("COPY package*.json ./");
			expect(dockerfile).toContain("RUN npm ci");
			expect(dockerfile).toContain("EXPOSE 3000");
			expect(dockerfile).toContain("CMD [\"npm\", \"start\"]");
		});

		it("should generate docker-compose configuration", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				deployment: "docker",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const dockerCompose = await testProject.readFile("docker-compose.yml");
			expect(dockerCompose).toContain("version: '3.8'");
			expect(dockerCompose).toContain("services:");
			expect(dockerCompose).toContain("app:");
			expect(dockerCompose).toContain("database:");
			expect(dockerCompose).toContain("depends_on:");
		});
	});

	describe("Express Performance and Monitoring", () => {
		it("should generate monitoring configuration", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/middleware/logger.js")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("winston");
			expect(packageJson.dependencies).toHaveProperty("morgan");
		});

		it("should generate health check endpoint", async () => {
			const options = createBackendOptions({
				framework: "express",
				database: "mongodb",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/routes/health.js")).toBe(true);

			const healthRoute = await testProject.readFile("src/routes/health.js");
			expect(healthRoute).toContain("router.get('/health'");
			expect(healthRoute).toContain("status: 'ok'");
		});
	});
});
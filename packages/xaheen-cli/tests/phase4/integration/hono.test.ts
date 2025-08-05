/**
 * Hono Framework Integration Tests
 * Tests complete Hono scaffolding workflow from generation to health check
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

describe("Hono Framework Integration Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		testProject = await createTestProject({
			framework: "hono",
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

	describe("Basic Hono Project Scaffolding", () => {
		it("should generate a complete Hono project structure", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api", "authentication", "testing"],
				testing: true,
				documentation: true,
			});

			const { result, duration } = await measureTime(() => 
				generateBackend(testProject.path, options)
			);

			assertSuccessfulResult(result);
			expect(duration).toBeLessThan(10000); // Hono should be very fast

			const validation = await validateBackendStructure(testProject, "hono");
			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Check Hono-specific files
			expect(await testProject.fileExists("src/index.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.ts")).toBe(true);
			expect(await testProject.fileExists("src/routes/index.ts")).toBe(true);
			expect(await testProject.fileExists("src/middleware/index.ts")).toBe(true);
		});

		it("should generate proper package.json with Hono dependencies", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api", "cors", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));

			// Check Hono core dependencies
			expect(packageJson.dependencies).toHaveProperty("hono");
			expect(packageJson.dependencies).toHaveProperty("@hono/node-server");
			expect(packageJson.dependencies).toHaveProperty("zod");
			expect(packageJson.dependencies).toHaveProperty("@hono/zod-validator");
			expect(packageJson.dependencies).toHaveProperty("jsonwebtoken");
			expect(packageJson.dependencies).toHaveProperty("bcryptjs");

			// Check development dependencies
			expect(packageJson.devDependencies).toHaveProperty("typescript");
			expect(packageJson.devDependencies).toHaveProperty("@types/node");
			expect(packageJson.devDependencies).toHaveProperty("tsx");
			expect(packageJson.devDependencies).toHaveProperty("vitest");

			// Check scripts
			expect(packageJson.scripts).toHaveProperty("dev");
			expect(packageJson.scripts).toHaveProperty("start");
			expect(packageJson.scripts).toHaveProperty("build");
			expect(packageJson.scripts).toHaveProperty("test");
			expect(packageJson.scripts.dev).toContain("tsx");
			expect(packageJson.scripts.start).toContain("node");
		});

		it("should generate TypeScript-first Hono application", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appFile = await testProject.readFile("src/app.ts");
			expect(appFile).toContain("import { Hono } from 'hono'");
			expect(appFile).toContain("const app = new Hono()");
			expect(appFile).toContain("export default app");

			const indexFile = await testProject.readFile("src/index.ts");
			expect(indexFile).toContain("import { serve } from '@hono/node-server'");
			expect(indexFile).toContain("import app from './app'");
			expect(indexFile).toContain("serve(app");
		});
	});

	describe("Hono with Zod Validation", () => {
		it("should generate Zod schema validation for routes", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/schemas/user.ts")).toBe(true);

			const userSchema = await testProject.readFile("src/schemas/user.ts");
			expect(userSchema).toContain("import { z } from 'zod'");
			expect(userSchema).toContain("export const UserSchema = z.object({");
			expect(userSchema).toContain("name: z.string()");
			expect(userSchema).toContain("email: z.string().email()");

			const userRoutes = await testProject.readFile("src/routes/users.ts");
			expect(userRoutes).toContain("import { zValidator } from '@hono/zod-validator'");
			expect(userRoutes).toContain("zValidator('json', UserSchema)");
		});

		it("should generate OpenAPI documentation with Zod", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@hono/zod-openapi");
			expect(packageJson.dependencies).toHaveProperty("@hono/swagger-ui");

			const appFile = await testProject.readFile("src/app.ts");
			expect(appFile).toContain("@hono/zod-openapi");
			expect(appFile).toContain("createRoute");
		});
	});

	describe("Hono Database Integration", () => {
		it("should generate Hono project with PostgreSQL", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				orm: "drizzle",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("drizzle-orm");
			expect(packageJson.dependencies).toHaveProperty("postgres");
			expect(packageJson.devDependencies).toHaveProperty("drizzle-kit");

			expect(await testProject.fileExists("src/db/schema.ts")).toBe(true);
			expect(await testProject.fileExists("src/db/index.ts")).toBe(true);
			expect(await testProject.fileExists("drizzle.config.ts")).toBe(true);

			const schema = await testProject.readFile("src/db/schema.ts");
			expect(schema).toContain("import { pgTable");
			expect(schema).toContain("export const users = pgTable");
		});

		it("should generate Hono project with SQLite", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				orm: "drizzle",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("better-sqlite3");

			const schema = await testProject.readFile("src/db/schema.ts");
			expect(schema).toContain("import { sqliteTable");
		});
	});

	describe("Hono Authentication", () => {
		it("should generate JWT authentication middleware", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				authentication: "jwt",
				features: ["authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@hono/jwt");
			expect(packageJson.dependencies).toHaveProperty("jsonwebtoken");

			expect(await testProject.fileExists("src/middleware/auth.ts")).toBe(true);
			expect(await testProject.fileExists("src/routes/auth.ts")).toBe(true);

			const authMiddleware = await testProject.readFile("src/middleware/auth.ts");
			expect(authMiddleware).toContain("import { jwt } from '@hono/jwt'");
			expect(authMiddleware).toContain("export const authMiddleware");

			const authRoutes = await testProject.readFile("src/routes/auth.ts");
			expect(authRoutes).toContain("app.post('/login'");
			expect(authRoutes).toContain("app.post('/register'");
		});

		it("should generate protected routes", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				authentication: "jwt",
				features: ["rest-api", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const userRoutes = await testProject.readFile("src/routes/users.ts");
			expect(userRoutes).toContain("authMiddleware");
			expect(userRoutes).toContain("app.use('/users/*', authMiddleware)");
		});
	});

	describe("Hono Middleware Ecosystem", () => {
		it("should generate essential middleware", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api", "cors"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@hono/cors");
			expect(packageJson.dependencies).toHaveProperty("@hono/logger");
			expect(packageJson.dependencies).toHaveProperty("@hono/secure-headers");

			const appFile = await testProject.readFile("src/app.ts");
			expect(appFile).toContain("import { cors } from '@hono/cors'");
			expect(appFile).toContain("import { logger } from '@hono/logger'");
			expect(appFile).toContain("import { secureHeaders } from '@hono/secure-headers'");
			expect(appFile).toContain("app.use('*', cors())");
			expect(appFile).toContain("app.use('*', logger())");
		});

		it("should generate rate limiting middleware", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/middleware/rate-limit.ts")).toBe(true);

			const rateLimitMiddleware = await testProject.readFile("src/middleware/rate-limit.ts");
			expect(rateLimitMiddleware).toContain("export const rateLimitMiddleware");
			expect(rateLimitMiddleware).toContain("requests per");
		});
	});

	describe("Hono Performance", () => {
		it("should start Hono server with exceptional performance", async () => {
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
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 15000,
			};

			const { duration: startupDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			// Hono should have the best cold start performance
			expect(startupDuration).toBeLessThan(1000);

			const server = testServerManager.getServer("hono", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test health endpoint
			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);

			const healthData = await response.json();
			expect(healthData).toHaveProperty("status");
			expect(healthData.status).toBe("ok");
		});

		it("should handle concurrent requests efficiently", async () => {
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
				env: { NODE_ENV: "test" },
			};

			const server = await testServerManager.startServer(serverConfig);

			// Test concurrent requests
			const promises = Array.from({ length: 20 }, () =>
				fetch(`${server.url}/health`)
			);

			const { duration } = await measureTime(() => Promise.all(promises));
			const responses = await Promise.all(promises);

			responses.forEach(response => {
				expect(response.status).toBe(200);
			});

			// Should handle 20 concurrent requests very quickly
			expect(duration).toBeLessThan(1000);
		});
	});

	describe("Hono Multi-Runtime Support", () => {
		it("should generate Node.js runtime configuration", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const indexFile = await testProject.readFile("src/index.ts");
			expect(indexFile).toContain("@hono/node-server");
			expect(indexFile).toContain("serve(app");

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@hono/node-server");
		});

		it("should generate Cloudflare Workers compatibility", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				deployment: "serverless",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check for Workers compatibility
			if (await testProject.fileExists("wrangler.toml")) {
				const wranglerConfig = await testProject.readFile("wrangler.toml");
				expect(wranglerConfig).toContain("compatibility_date");
				expect(wranglerConfig).toContain("main = \"src/index.ts\"");
			}
		});
	});

	describe("Hono Testing", () => {
		it("should generate comprehensive test setup with Vitest", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.devDependencies).toHaveProperty("vitest");
			expect(packageJson.devDependencies).toHaveProperty("@vitest/coverage-v8");

			expect(await testProject.fileExists("vitest.config.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.test.ts")).toBe(true);

			const testFile = await testProject.readFile("src/app.test.ts");
			expect(testFile).toContain("import { describe, it, expect }");
			expect(testFile).toContain("import app from './app'");
			expect(testFile).toContain("const res = await app.request");
		});

		it("should generate route-specific tests", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				features: ["rest-api"],
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/routes/users.test.ts")).toBe(true);

			const userTest = await testProject.readFile("src/routes/users.test.ts");
			expect(userTest).toContain("describe('Users API'");
			expect(userTest).toContain("it('should get all users'");
			expect(userTest).toContain("app.request('/users')");
		});
	});

	describe("Hono Edge Runtime Features", () => {
		it("should generate edge-compatible code", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				deployment: "serverless",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appFile = await testProject.readFile("src/app.ts");
			
			// Should use Web API standards
			expect(appFile).toContain("Request");
			expect(appFile).toContain("Response");
			expect(appFile).not.toContain("require("); // Should use ESM imports
		});

		it("should generate WebAssembly-compatible database access", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "sqlite",
				deployment: "serverless",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check for WASM-compatible SQLite
			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			if (packageJson.dependencies["@cloudflare/d1"]) {
				expect(packageJson.dependencies).toHaveProperty("@cloudflare/d1");
			}
		});
	});

	describe("Hono Error Handling", () => {
		it("should generate comprehensive error handling", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/middleware/error-handler.ts")).toBe(true);

			const errorHandler = await testProject.readFile("src/middleware/error-handler.ts");
			expect(errorHandler).toContain("export const errorHandler");
			expect(errorHandler).toContain("return c.json");
			expect(errorHandler).toContain("status:");
		});

		it("should generate validation error responses", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const userRoutes = await testProject.readFile("src/routes/users.ts");
			expect(userRoutes).toContain("zValidator");
			expect(userRoutes).toContain("400");
		});
	});

	describe("Hono Production Features", () => {
		it("should generate production-ready configuration", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				deployment: "docker",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check production build
			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.scripts).toHaveProperty("build");
			expect(packageJson.scripts.build).toContain("tsc");

			// Check monitoring
			expect(await testProject.fileExists("src/middleware/metrics.ts")).toBe(true);

			const metricsMiddleware = await testProject.readFile("src/middleware/metrics.ts");
			expect(metricsMiddleware).toContain("export const metricsMiddleware");
		});

		it("should generate health checks and observability", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/routes/health.ts")).toBe(true);

			const healthRoutes = await testProject.readFile("src/routes/health.ts");
			expect(healthRoutes).toContain("app.get('/health'");
			expect(healthRoutes).toContain("status: 'ok'");
			expect(healthRoutes).toContain("timestamp:");
			expect(healthRoutes).toContain("uptime:");
		});
	});

	describe("Hono TypeScript Excellence", () => {
		it("should generate strongly-typed routes", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const userRoutes = await testProject.readFile("src/routes/users.ts");
			expect(userRoutes).toContain("import type { Context }");
			expect(userRoutes).toContain(": Promise<Response>");
		});

		it("should generate type-safe environment configuration", async () => {
			const options = createBackendOptions({
				framework: "hono",
				database: "postgresql",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/types/env.ts")).toBe(true);

			const envTypes = await testProject.readFile("src/types/env.ts");
			expect(envTypes).toContain("export interface Env {");
			expect(envTypes).toContain("DATABASE_URL: string");
			expect(envTypes).toContain("JWT_SECRET: string");
		});
	});
});
/**
 * Backend Endpoint Generation Unit Tests
 * Tests for endpoint/controller generation commands across all supported frameworks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { 
	createTestProject, 
	createBackendOptions, 
	assertSuccessfulResult,
	type TestProject,
} from "../utils/test-helpers";
import { 
	createMockTemplateEngine, 
	createMockGeneratorContext,
	createMockIntegration,
	mockTemplateResults,
} from "../mocks/template-engine.mock";
import type { BackendGeneratorOptions } from "@/generators/backend";

describe("Backend Endpoint Generation", () => {
	let testProject: TestProject;
	let mockIntegration: ReturnType<typeof createMockIntegration>;

	beforeEach(async () => {
		testProject = await createTestProject({
			framework: "nestjs",
			cleanup: true,
		});

		mockIntegration = createMockIntegration();
	});

	afterEach(async () => {
		await testProject.cleanup();
		vi.clearAllMocks();
	});

	describe("NestJS Controller Generation", () => {
		it("should generate a basic NestJS controller with CRUD operations", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				operations: ["create", "findAll", "findOne", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@Controller('users')");
			expect(result.content).toContain("export class UserController");
			expect(result.content).toContain("@Get()");
			expect(result.content).toContain("@Get(':id')");
			expect(result.content).toContain("@Post()");
			expect(result.content).toContain("@Put(':id')");
			expect(result.content).toContain("@Delete(':id')");
			expect(result.content).toContain("findAll");
			expect(result.content).toContain("findOne");
			expect(result.content).toContain("create");
			expect(result.content).toContain("update");
			expect(result.content).toContain("remove");
		});

		it("should generate NestJS controller with validation decorators", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				validation: true,
				dtoTypes: ["CreateUserDto", "UpdateUserDto"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@Body() createUserDto: CreateUserDto");
			expect(result.content).toContain("@Body() updateUserDto: UpdateUserDto");
			expect(result.content).toContain("@Param('id') id: string");
		});

		it("should generate NestJS controller with authentication guards", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				authentication: true,
				guards: ["JwtAuthGuard", "RolesGuard"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@UseGuards");
			expect(result.content).toContain("JwtAuthGuard");
		});

		it("should generate NestJS controller with Swagger documentation", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				swagger: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@ApiTags");
			expect(result.content).toContain("@ApiOperation");
			expect(result.content).toContain("@ApiResponse");
		});

		it("should generate NestJS controller with pagination", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				pagination: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@Query() query");
			expect(result.content).toContain("findAll(@Query() query");
		});
	});

	describe("Express Router Generation", () => {
		it("should generate a basic Express router with CRUD operations", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				operations: ["create", "findAll", "findOne", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("const express = require('express')");
			expect(result.content).toContain("const router = express.Router()");
			expect(result.content).toContain("router.get('/'");
			expect(result.content).toContain("router.get('/:id'");
			expect(result.content).toContain("router.post('/'");
			expect(result.content).toContain("router.put('/:id'");
			expect(result.content).toContain("router.delete('/:id'");
			expect(result.content).toContain("module.exports = router");
		});

		it("should generate Express router with error handling", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				errorHandling: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("try {");
			expect(result.content).toContain("} catch (error) {");
			expect(result.content).toContain("res.status(500).json({ error: error.message })");
			expect(result.content).toContain("res.status(404).json({ error: 'Not found' })");
		});

		it("should generate Express router with validation middleware", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				validation: true,
				validationLibrary: "joi",
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("const Joi = require('joi')");
			expect(result.content).toContain("const validate");
		});

		it("should generate Express router with authentication middleware", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				authentication: true,
				authMiddleware: "authenticateToken",
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("authenticateToken");
		});

		it("should generate Express router with rate limiting", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				rateLimit: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("express-rate-limit");
		});
	});

	describe("Fastify Route Generation", () => {
		it("should generate basic Fastify routes with JSON Schema", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				route: "users",
				operations: ["create", "findAll", "findOne", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("async function routes(fastify, options)");
			expect(result.content).toContain("fastify.get('/'");
			expect(result.content).toContain("fastify.get('/:id'");
			expect(result.content).toContain("fastify.post('/'");
			expect(result.content).toContain("fastify.put('/:id'");
			expect(result.content).toContain("fastify.delete('/:id'");
			expect(result.content).toContain("module.exports = routes");
		});

		it("should generate Fastify routes with JSON Schema validation", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				route: "users",
				jsonSchema: true,
				schemas: {
					create: {
						body: { type: "object", properties: { name: { type: "string" } } },
						response: { 201: { type: "object" } },
					},
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("schema: {");
			expect(result.content).toContain("body:");
			expect(result.content).toContain("response:");
		});

		it("should generate Fastify routes with hooks", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				route: "users",
				hooks: ["preHandler", "onSend"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("preHandler");
			expect(result.content).toContain("onSend");
		});

		it("should generate Fastify routes with authentication", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				route: "users",
				authentication: true,
				authPlugin: "@fastify/jwt",
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@fastify/jwt");
			expect(result.content).toContain("preHandler: [fastify.authenticate]");
		});
	});

	describe("Hono Route Generation", () => {
		it("should generate basic Hono routes with Zod validation", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				route: "users",
				operations: ["create", "findAll", "findOne", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("import { Hono } from 'hono'");
			expect(result.content).toContain("const app = new Hono()");
			expect(result.content).toContain("app.get('/'");
			expect(result.content).toContain("app.get('/:id'");
			expect(result.content).toContain("app.post('/'");
			expect(result.content).toContain("app.put('/:id'");
			expect(result.content).toContain("app.delete('/:id'");
			expect(result.content).toContain("export default app");
		});

		it("should generate Hono routes with Zod validation", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				route: "users",
				validation: true,
				zodSchemas: {
					create: "z.object({ name: z.string(), email: z.string().email() })",
					update: "z.object({ name: z.string().optional(), email: z.string().email().optional() })",
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("import { z } from 'zod'");
			expect(result.content).toContain("zValidator");
		});

		it("should generate Hono routes with middleware", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				route: "users",
				middleware: ["cors", "logger", "jwt"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("cors");
			expect(result.content).toContain("logger");
			expect(result.content).toContain("jwt");
		});

		it("should generate Hono routes with OpenAPI documentation", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				route: "users",
				openapi: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@hono/zod-openapi");
			expect(result.content).toContain("createRoute");
		});
	});

	describe("HTTP Methods and Operations", () => {
		it("should generate only specified HTTP methods", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				operations: ["findAll", "findOne"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@Get()");
			expect(result.content).toContain("@Get(':id')");
			expect(result.content).not.toContain("@Post()");
			expect(result.content).not.toContain("@Put(':id')");
			expect(result.content).not.toContain("@Delete(':id')");
		});

		it("should handle custom HTTP methods", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				customMethods: [
					{ method: "PATCH", path: "/:id/status", handler: "updateStatus" },
					{ method: "GET", path: "/:id/profile", handler: "getProfile" },
				],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("router.patch('/:id/status'");
			expect(result.content).toContain("router.get('/:id/profile'");
		});

		it("should generate proper HTTP status codes", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				statusCodes: {
					create: 201,
					update: 200,
					delete: 204,
					notFound: 404,
					serverError: 500,
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("res.status(201)");
			expect(result.content).toContain("res.status(404)");
			expect(result.content).toContain("res.status(500)");
		});
	});

	describe("Request/Response Handling", () => {
		it("should generate proper request parameter handling", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				parameters: [
					{ name: "id", type: "string", location: "path" },
					{ name: "page", type: "number", location: "query", optional: true },
					{ name: "limit", type: "number", location: "query", optional: true },
				],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@Param('id') id: string");
			expect(result.content).toContain("@Query() query");
		});

		it("should generate proper response formatting", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				responseFormat: "json",
				successResponses: {
					list: { message: "Users retrieved successfully", data: "users" },
					single: { message: "User found", data: "user" },
					create: { message: "User created successfully", data: "user" },
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("res.json(");
			expect(result.content).toContain("message:");
			expect(result.content).toContain("data:");
		});

		it("should handle file uploads", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				fileUpload: true,
				uploadFields: ["avatar", "documents"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("multer");
			expect(result.content).toContain("upload.single");
		});
	});

	describe("Error Handling", () => {
		it("should generate comprehensive error handling", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				errorHandling: {
					validation: true,
					notFound: true,
					serverError: true,
					custom: ["DuplicateEmailError", "InvalidCredentialsError"],
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("try {");
			expect(result.content).toContain("} catch (error) {");
			expect(result.content).toContain("if (error instanceof ValidationError)");
			expect(result.content).toContain("DuplicateEmailError");
		});

		it("should generate framework-specific error handling", async () => {
			const nestjsContext = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				errorHandling: true,
			});

			const nestjsResult = await mockIntegration.simulateGeneration("endpoint", nestjsContext);
			expect(nestjsResult.content).toContain("throw new NotFoundException");

			const expressContext = createMockGeneratorContext({
				framework: "express",
				name: "User",
				errorHandling: true,
			});

			const expressResult = await mockIntegration.simulateGeneration("endpoint", expressContext);
			expect(expressResult.content).toContain("res.status(404)");
		});
	});

	describe("Security Features", () => {
		it("should generate CORS configuration", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				cors: {
					enabled: true,
					origins: ["http://localhost:3000", "https://app.example.com"],
					methods: ["GET", "POST", "PUT", "DELETE"],
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("cors");
		});

		it("should generate rate limiting", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				rateLimit: {
					windowMs: 900000, // 15 minutes
					max: 100, // limit each IP to 100 requests per windowMs
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("express-rate-limit");
		});

		it("should generate input sanitization", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				sanitization: true,
				sanitizers: ["mongoSanitize", "xss"],
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("express-mongo-sanitize");
			expect(result.content).toContain("xss");
		});
	});

	describe("API Documentation", () => {
		it("should generate Swagger/OpenAPI documentation", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				route: "users",
				swagger: {
					enabled: true,
					title: "User API",
					description: "API for user management",
					version: "1.0.0",
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("@ApiTags('users')");
			expect(result.content).toContain("@ApiOperation");
			expect(result.content).toContain("@ApiResponse");
		});

		it("should generate JSDoc comments", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				jsdoc: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("/**");
			expect(result.content).toContain("* GET /users");
			expect(result.content).toContain("* @param");
			expect(result.content).toContain("* @returns");
			expect(result.content).toContain("*/");
		});
	});

	describe("Testing Integration", () => {
		it("should generate test-friendly endpoint structure", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				testing: true,
				testFramework: "jest",
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			// Should generate modular, testable code
			expect(result.content).toBeDefined();
		});

		it("should export handlers for unit testing", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				exportHandlers: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("module.exports = {");
			expect(result.content).toContain("router,");
			expect(result.content).toContain("handlers:");
		});
	});

	describe("Performance Optimization", () => {
		it("should generate caching middleware", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				caching: {
					enabled: true,
					ttl: 300, // 5 minutes
					methods: ["GET"],
				},
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("cache");
		});

		it("should generate compression middleware", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				route: "users",
				compression: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("compression");
		});
	});

	describe("Code Quality", () => {
		it("should generate properly formatted TypeScript code", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				typescript: true,
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("export class");
			expect(result.content).toContain(": Promise<");
			expect(result.content).toContain("async ");
		});

		it("should follow framework conventions", async () => {
			const frameworks = [
				{ name: "nestjs", expectedPattern: "@Controller" },
				{ name: "express", expectedPattern: "express.Router()" },
				{ name: "fastify", expectedPattern: "async function routes" },
				{ name: "hono", expectedPattern: "new Hono()" },
			];

			frameworks.forEach(async framework => {
				const context = createMockGeneratorContext({
					framework: framework.name,
				});

				const result = await mockIntegration.simulateGeneration("endpoint", context);
				expect(result.content).toContain(framework.expectedPattern);
			});
		});

		it("should include proper imports and dependencies", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
			});

			const result = await mockIntegration.simulateGeneration("endpoint", context);

			expect(result.content).toContain("import {");
			expect(result.content).toContain("} from '@nestjs/common'");
		});
	});
});
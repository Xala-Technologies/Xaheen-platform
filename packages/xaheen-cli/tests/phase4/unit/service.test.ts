/**
 * Backend Service Generation Unit Tests
 * Tests for service/business logic generation commands across all supported frameworks
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
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

describe("Backend Service Generation", () => {
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
		mock.restore();
	});

	describe("NestJS Service Generation", () => {
		it("should generate a basic NestJS service with CRUD operations", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				operations: ["create", "findAll", "findOne", "update", "delete"],
				repository: "UserRepository",
				entity: "User",
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("@Injectable()");
			expect(result.content).toContain("export class UserService");
			expect(result.content).toContain("@InjectRepository(User)");
			expect(result.content).toContain("private userRepository: Repository<User>");
			expect(result.content).toContain("async create");
			expect(result.content).toContain("async findAll");
			expect(result.content).toContain("async findOne");
			expect(result.content).toContain("async update");
			expect(result.content).toContain("async remove");
		});

		it("should generate NestJS service with dependency injection", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				dependencies: [
					{ name: "EmailService", type: "service" },
					{ name: "ConfigService", type: "service" },
					{ name: "Logger", type: "provider" },
				],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("constructor(");
			expect(result.content).toContain("private emailService: EmailService");
			expect(result.content).toContain("private configService: ConfigService");
			expect(result.content).toContain("private logger: Logger");
		});

		it("should generate NestJS service with exception handling", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				exceptionHandling: true,
				exceptions: ["NotFoundException", "ConflictException", "BadRequestException"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("import { NotFoundException, ConflictException, BadRequestException }");
			expect(result.content).toContain("throw new NotFoundException");
			expect(result.content).toContain("if (!user) {");
			expect(result.content).toContain("throw new NotFoundException");
		});

		it("should generate NestJS service with validation", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				validation: true,
				dtoTypes: ["CreateUserDto", "UpdateUserDto"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("CreateUserDto");
			expect(result.content).toContain("UpdateUserDto");
			expect(result.content).toContain("async create(createUserDto: CreateUserDto)");
			expect(result.content).toContain("async update(id: number, updateUserDto: UpdateUserDto)");
		});

		it("should generate NestJS service with transactions", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				transactions: true,
				transactionManager: "EntityManager",
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("@Transaction()");
			expect(result.content).toContain("@TransactionManager()");
			expect(result.content).toContain("manager: EntityManager");
		});
	});

	describe("Express Service Generation", () => {
		it("should generate a basic Express service with CRUD operations", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				model: "User",
				operations: ["create", "findAll", "findById", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const User = require('../models/user')");
			expect(result.content).toContain("class UserService {");
			expect(result.content).toContain("async create(data) {");
			expect(result.content).toContain("async findAll(query = {}) {");
			expect(result.content).toContain("async findById(id) {");
			expect(result.content).toContain("async update(id, data) {");
			expect(result.content).toContain("async delete(id) {");
			expect(result.content).toContain("module.exports = new UserService()");
		});

		it("should generate Express service with error handling", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				errorHandling: true,
				customErrors: ["UserNotFoundError", "DuplicateEmailError"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("if (!user) {");
			expect(result.content).toContain("throw new Error('User not found')");
			expect(result.content).toContain("try {");
			expect(result.content).toContain("} catch (error) {");
		});

		it("should generate Express service with validation", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				validation: true,
				validationLibrary: "joi",
				schemas: {
					create: "Joi.object({ name: Joi.string().required(), email: Joi.string().email().required() })",
					update: "Joi.object({ name: Joi.string(), email: Joi.string().email() })",
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const Joi = require('joi')");
			expect(result.content).toContain("const { error, value } = schema.validate(data)");
			expect(result.content).toContain("if (error) throw error");
		});

		it("should generate Express service with caching", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				caching: true,
				cacheProvider: "redis",
				cacheTtl: 3600,
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const redis = require('redis')");
			expect(result.content).toContain("await redis.set");
			expect(result.content).toContain("await redis.get");
		});

		it("should generate Express service with pagination", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				pagination: true,
				defaultLimit: 20,
				maxLimit: 100,
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const limit = Math.min(query.limit || 20, 100)");
			expect(result.content).toContain("const skip = (query.page - 1) * limit");
			expect(result.content).toContain(".limit(limit)");
			expect(result.content).toContain(".skip(skip)");
		});
	});

	describe("Fastify Service Generation", () => {
		it("should generate a basic Fastify service with plugin architecture", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				pluginArchitecture: true,
				operations: ["create", "findAll", "findById", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("async function userService(fastify, options)");
			expect(result.content).toContain("fastify.decorate('userService'");
			expect(result.content).toContain("const userService = {");
			expect(result.content).toContain("create: async (data) => {");
			expect(result.content).toContain("findAll: async (query) => {");
			expect(result.content).toContain("findById: async (id) => {");
			expect(result.content).toContain("update: async (id, data) => {");
			expect(result.content).toContain("delete: async (id) => {");
		});

		it("should generate Fastify service with JSON Schema validation", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				jsonSchema: true,
				schemas: {
					user: {
						type: "object",
						properties: {
							name: { type: "string" },
							email: { type: "string", format: "email" },
							age: { type: "number", minimum: 0 },
						},
						required: ["name", "email"],
					},
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const userSchema = {");
			expect(result.content).toContain("type: 'object'");
			expect(result.content).toContain("properties:");
			expect(result.content).toContain("required: ['name', 'email']");
		});

		it("should generate Fastify service with hooks", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				hooks: {
					preHandler: ["validateUser", "checkPermissions"],
					onSend: ["logResponse"],
					onError: ["handleError"],
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("fastify.addHook('preHandler'");
			expect(result.content).toContain("fastify.addHook('onSend'");
			expect(result.content).toContain("fastify.addHook('onError'");
		});
	});

	describe("Hono Service Generation", () => {
		it("should generate a basic Hono service with middleware pattern", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				middlewarePattern: true,
				operations: ["create", "findAll", "findById", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("export class UserService {");
			expect(result.content).toContain("async create(data: CreateUserData)");
			expect(result.content).toContain("async findAll(options?: FindOptions)");
			expect(result.content).toContain("async findById(id: string)");
			expect(result.content).toContain("async update(id: string, data: UpdateUserData)");
			expect(result.content).toContain("async delete(id: string)");
		});

		it("should generate Hono service with Zod validation", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				validation: true,
				zodSchemas: {
					createUser: "z.object({ name: z.string(), email: z.string().email() })",
					updateUser: "z.object({ name: z.string().optional(), email: z.string().email().optional() })",
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("import { z } from 'zod'");
			expect(result.content).toContain("const CreateUserSchema = z.object({");
			expect(result.content).toContain("const UpdateUserSchema = z.object({");
			expect(result.content).toContain("CreateUserSchema.parse(data)");
		});

		it("should generate Hono service with context handling", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				contextHandling: true,
				contextTypes: ["Variables", "Bindings"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("import type { Context }");
			expect(result.content).toContain("c: Context");
			expect(result.content).toContain("c.get('user')");
		});
	});

	describe("Business Logic Patterns", () => {
		it("should generate service with repository pattern", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				pattern: "repository",
				repository: "UserRepository",
				repositoryMethods: ["save", "find", "findOne", "update", "delete"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("private userRepository: UserRepository");
			expect(result.content).toContain("this.userRepository.save");
			expect(result.content).toContain("this.userRepository.find");
			expect(result.content).toContain("this.userRepository.findOne");
		});

		it("should generate service with domain-driven design patterns", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				pattern: "ddd",
				aggregateRoot: "User",
				valueObjects: ["Email", "UserName"],
				domainEvents: ["UserCreated", "UserUpdated", "UserDeleted"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("User.create");
			expect(result.content).toContain("Email.create");
			expect(result.content).toContain("UserCreated");
		});

		it("should generate service with CQRS pattern", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				pattern: "cqrs",
				commands: ["CreateUserCommand", "UpdateUserCommand", "DeleteUserCommand"],
				queries: ["GetUserQuery", "GetUsersQuery"],
				handlers: true,
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("@CommandHandler");
			expect(result.content).toContain("@QueryHandler");
			expect(result.content).toContain("CreateUserCommand");
			expect(result.content).toContain("GetUserQuery");
		});
	});

	describe("Data Access Patterns", () => {
		it("should generate service with multiple database operations", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				database: "mongodb",
				operations: {
					aggregation: true,
					bulkOperations: true,
					transactions: true,
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("aggregate([");
			expect(result.content).toContain("bulkWrite([");
			expect(result.content).toContain("session.startTransaction()");
		});

		it("should generate service with connection pooling", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				database: "postgresql",
				connectionPool: true,
				poolConfig: {
					min: 2,
					max: 10,
					acquireTimeoutMillis: 30000,
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const pool = new Pool({");
			expect(result.content).toContain("min: 2");
			expect(result.content).toContain("max: 10");
		});

		it("should generate service with query optimization", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				queryOptimization: true,
				optimizations: ["indexHints", "selectFields", "joinOptimization"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("select(['user.id', 'user.name', 'user.email'])");
			expect(result.content).toContain("leftJoinAndSelect");
		});
	});

	describe("Security Features", () => {
		it("should generate service with authorization checks", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				authorization: true,
				permissions: ["read:users", "write:users", "delete:users"],
				roles: ["admin", "user", "moderator"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("@RequirePermissions");
			expect(result.content).toContain("checkPermission");
			expect(result.content).toContain("hasRole");
		});

		it("should generate service with data sanitization", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				sanitization: true,
				sanitizers: ["htmlEscape", "sqlInjection", "xss"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("sanitize");
			expect(result.content).toContain("escape");
		});

		it("should generate service with audit logging", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				auditLogging: true,
				auditEvents: ["create", "update", "delete", "view"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("auditLogger");
			expect(result.content).toContain("logAction");
			expect(result.content).toContain("USER_CREATED");
		});
	});

	describe("Performance Optimization", () => {
		it("should generate service with caching strategies", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				caching: {
					enabled: true,
					strategy: "redis",
					ttl: 3600,
					keyPrefix: "user:",
					cacheMethods: ["findById", "findAll"],
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const cacheKey = `user:${id}`");
			expect(result.content).toContain("await redis.get(cacheKey)");
			expect(result.content).toContain("await redis.setex(cacheKey, 3600");
		});

		it("should generate service with batch operations", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				batchOperations: true,
				batchSize: 100,
				operations: ["createMany", "updateMany", "deleteMany"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("async createMany");
			expect(result.content).toContain("async updateMany");
			expect(result.content).toContain("async deleteMany");
			expect(result.content).toContain("chunk(100)");
		});

		it("should generate service with lazy loading", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				lazyLoading: true,
				lazyRelations: ["posts", "profile", "permissions"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("relations: {");
			expect(result.content).toContain("posts: true");
			expect(result.content).toContain("lazy: true");
		});
	});

	describe("Event Handling", () => {
		it("should generate service with event emitters", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				events: true,
				eventEmitter: "EventEmitter",
				events: ["userCreated", "userUpdated", "userDeleted"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("const EventEmitter = require('events')");
			expect(result.content).toContain("this.emit('userCreated'");
			expect(result.content).toContain("this.emit('userUpdated'");
		});

		it("should generate service with message queues", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				messageQueue: true,
				queueProvider: "bullmq",
				queues: ["email", "notifications", "analytics"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("@InjectQueue");
			expect(result.content).toContain("await this.emailQueue.add");
			expect(result.content).toContain("await this.notificationsQueue.add");
		});
	});

	describe("Testing Support", () => {
		it("should generate testable service with dependency injection", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				testable: true,
				mockable: true,
				dependencies: ["UserRepository", "EmailService"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("constructor(");
			expect(result.content).toContain("private userRepository");
			expect(result.content).toContain("private emailService");
		});

		it("should generate service with factory methods for testing", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				factoryMethods: true,
				testFactories: ["createTestUser", "createMockUserData"],
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("static createTestUser");
			expect(result.content).toContain("static createMockUserData");
		});
	});

	describe("Code Quality and Standards", () => {
		it("should generate service with proper TypeScript types", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				typescript: true,
				strictTypes: true,
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("Promise<User>");
			expect(result.content).toContain("Promise<User[]>");
			expect(result.content).toContain("Promise<void>");
			expect(result.content).toContain(": User");
		});

		it("should generate service with JSDoc documentation", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				jsdoc: true,
				documentation: {
					class: "Service for managing user operations",
					methods: true,
					parameters: true,
					returns: true,
				},
			});

			const result = await mockIntegration.simulateGeneration("service", context);

			expect(result.content).toContain("/**");
			expect(result.content).toContain("* Service for managing user operations");
			expect(result.content).toContain("* @param");
			expect(result.content).toContain("* @returns");
			expect(result.content).toContain("*/");
		});

		it("should follow framework-specific conventions", async () => {
			const frameworks = [
				{ name: "nestjs", expectedPattern: "@Injectable()" },
				{ name: "express", expectedPattern: "class UserService {" },
				{ name: "fastify", expectedPattern: "async function userService" },
				{ name: "hono", expectedPattern: "export class UserService" },
			];

			frameworks.forEach(async framework => {
				const context = createMockGeneratorContext({
					framework: framework.name,
				});

				const result = await mockIntegration.simulateGeneration("service", context);
				expect(result.content).toContain(framework.expectedPattern);
			});
		});
	});

	describe("Error Scenarios", () => {
		it("should handle template compilation errors", async () => {
			const { templateEngine } = mockIntegration;
			
			templateEngine.compile.mockImplementation(() => {
				throw new Error("Invalid service template");
			});

			expect(() => {
				templateEngine.compile("{{invalid service template");
			}).toThrow("Invalid service template");
		});

		it("should validate service configuration", async () => {
			const invalidConfigs = [
				{ name: "", operations: ["create"] }, // Empty name
				{ name: "User", operations: [] }, // No operations
				{ name: "123User", operations: ["create"] }, // Invalid name format
			];

			invalidConfigs.forEach(config => {
				expect(() => {
					if (!config.name) throw new Error("Service name is required");
					if (config.operations.length === 0) throw new Error("At least one operation is required");
					if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.name)) throw new Error("Invalid service name format");
				}).toThrow();
			});
		});

		it("should handle file system errors gracefully", async () => {
			const { fileSystem } = mockIntegration;
			
			fileSystem.writeFile.mockImplementation(async () => {
				throw new Error("Permission denied");
			});

			await expect(fileSystem.writeFile("service.ts", "content"))
				.rejects.toThrow("Permission denied");
		});
	});
});
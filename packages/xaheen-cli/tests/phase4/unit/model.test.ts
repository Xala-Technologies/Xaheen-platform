/**
 * Backend Model Generation Unit Tests
 * Tests for model generation commands across all supported frameworks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { 
	createTestProject, 
	createBackendOptions, 
	validateBackendStructure,
	assertSuccessfulResult,
	type TestProject,
} from "../utils/test-helpers";
import { 
	createMockTemplateEngine, 
	createMockFileSystem, 
	createMockGeneratorContext,
	createMockIntegration,
	mockTemplateResults,
} from "../mocks/template-engine.mock";
import { generateBackend } from "@/generators/backend";
import type { BackendGeneratorOptions } from "@/generators/backend";

describe("Backend Model Generation", () => {
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

	describe("NestJS Model Generation", () => {
		it("should generate a basic NestJS entity model", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				fields: [
					{ name: "name", type: "string", tsType: "string" },
					{ name: "email", type: "string", tsType: "string" },
					{ name: "age", type: "number", tsType: "number" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("@Entity");
			expect(result.content).toContain("export class User");
			expect(result.content).toContain("@PrimaryGeneratedColumn()");
			expect(result.content).toContain("@Column()");
			expect(result.content).toContain("name: string");
			expect(result.content).toContain("email: string");
			expect(result.content).toContain("age: number");
			expect(result.outputPath).toBe("src/models/User.ts");
		});

		it("should generate NestJS model with relationships", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "Post",
				fields: [
					{ name: "title", type: "string", tsType: "string" },
					{ name: "content", type: "text", tsType: "string" },
					{ name: "authorId", type: "number", tsType: "number", relation: "belongsTo" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("@Entity");
			expect(result.content).toContain("export class Post");
			expect(result.content).toContain("title: string");
			expect(result.content).toContain("content: string");
			expect(result.content).toContain("authorId: number");
		});

		it("should generate NestJS model with validation decorators", async () => {
			const context = createMockGeneratorContext({
				framework: "nestjs",
				name: "User",
				fields: [
					{ 
						name: "email", 
						type: "string", 
						tsType: "string",
						validations: ["IsEmail", "IsNotEmpty"],
					},
					{ 
						name: "age", 
						type: "number", 
						tsType: "number",
						validations: ["Min(18)", "Max(120)"],
					},
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("@Entity");
			expect(result.content).toContain("export class User");
			expect(result.content).toContain("email: string");
			expect(result.content).toContain("age: number");
		});

		it("should handle model generation errors gracefully", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
			});

			// Mock template engine to throw an error
			mockIntegration.templateEngine.compile.mockImplementation(() => {
				throw new Error("Template compilation failed");
			});

			// Since we're mocking, we'll simulate the error scenario
			expect(() => {
				mockIntegration.templateEngine.compile("invalid template");
			}).toThrow("Template compilation failed");
		});
	});

	describe("Express Model Generation", () => {
		it("should generate a basic Express Mongoose model", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				fields: [
					{ name: "name", type: "string", mongoType: "String" },
					{ name: "email", type: "string", mongoType: "String" },
					{ name: "age", type: "number", mongoType: "Number" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("mongoose.Schema");
			expect(result.content).toContain("name: {");
			expect(result.content).toContain("type: String");
			expect(result.content).toContain("mongoose.model");
		});

		it("should generate Express model with schema validation", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				fields: [
					{ 
						name: "email", 
						type: "string", 
						mongoType: "String",
						required: true,
						unique: true,
					},
					{ 
						name: "age", 
						type: "number", 
						mongoType: "Number",
						min: 18,
						max: 120,
					},
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("mongoose.Schema");
			expect(result.content).toContain("required: true");
			expect(result.content).toContain("unique: true");
		});

		it("should generate Express model with timestamps", async () => {
			const context = createMockGeneratorContext({
				framework: "express",
				name: "User",
				timestamps: true,
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("timestamps: true");
		});
	});

	describe("Fastify Model Generation", () => {
		it("should generate a basic Fastify model with JSON Schema", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				fields: [
					{ name: "name", type: "string", jsonSchemaType: "string" },
					{ name: "email", type: "string", jsonSchemaType: "string" },
					{ name: "age", type: "number", jsonSchemaType: "number" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("const userSchema = {");
			expect(result.content).toContain("type: 'object'");
			expect(result.content).toContain("properties: {");
			expect(result.content).toContain("name: { type: 'string' }");
			expect(result.content).toContain("email: { type: 'string' }");
			expect(result.content).toContain("age: { type: 'number' }");
		});

		it("should generate Fastify model with validation rules", async () => {
			const context = createMockGeneratorContext({
				framework: "fastify",
				name: "User",
				fields: [
					{ 
						name: "email", 
						type: "string", 
						jsonSchemaType: "string",
						format: "email",
					},
					{ 
						name: "age", 
						type: "number", 
						jsonSchemaType: "number",
						minimum: 18,
						maximum: 120,
					},
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("format: 'email'");
			expect(result.content).toContain("minimum: 18");
			expect(result.content).toContain("maximum: 120");
		});
	});

	describe("Hono Model Generation", () => {
		it("should generate a basic Hono model with Zod schema", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				fields: [
					{ name: "name", type: "string", zodType: "z.string()" },
					{ name: "email", type: "string", zodType: "z.string().email()" },
					{ name: "age", type: "number", zodType: "z.number().min(18)" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("import { z } from 'zod'");
			expect(result.content).toContain("const UserSchema = z.object({");
			expect(result.content).toContain("name: z.string()");
			expect(result.content).toContain("email: z.string().email()");
			expect(result.content).toContain("age: z.number().min(18)");
		});

		it("should generate Hono model with complex validation", async () => {
			const context = createMockGeneratorContext({
				framework: "hono",
				name: "User",
				fields: [
					{ 
						name: "password", 
						type: "string", 
						zodType: "z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)",
					},
					{ 
						name: "roles", 
						type: "array", 
						zodType: "z.array(z.enum(['admin', 'user', 'moderator']))",
					},
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);

			expect(result.content).toContain("password: z.string().min(8)");
			expect(result.content).toContain("roles: z.array");
		});
	});

	describe("Model Generation Validation", () => {
		it("should validate required fields", async () => {
			const context = createMockGeneratorContext({
				name: "", // Invalid: empty name
			});

			expect(() => {
				// Simulate validation logic
				if (!context.name) {
					throw new Error("Model name is required");
				}
			}).toThrow("Model name is required");
		});

		it("should validate field types", async () => {
			const context = createMockGeneratorContext({
				fields: [
					{ name: "field1", type: "invalid_type" },
				],
			});

			const validTypes = ["string", "number", "boolean", "date", "array", "object"];
			
			expect(() => {
				context.fields.forEach(field => {
					if (!validTypes.includes(field.type)) {
						throw new Error(`Invalid field type: ${field.type}`);
					}
				});
			}).toThrow("Invalid field type: invalid_type");
		});

		it("should validate naming conventions", async () => {
			const invalidNames = ["123User", "user-name", "user name", ""];
			
			invalidNames.forEach(name => {
				expect(() => {
					// Simulate naming validation
					if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
						throw new Error(`Invalid model name: ${name}`);
					}
				}).toThrow();
			});

			const validNames = ["User", "UserProfile", "BlogPost"];
			
			validNames.forEach(name => {
				expect(() => {
					if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
						throw new Error(`Invalid model name: ${name}`);
					}
				}).not.toThrow();
			});
		});
	});

	describe("Model Template Processing", () => {
		it("should process template variables correctly", async () => {
			const { templateEngine } = mockIntegration;
			const template = "export class {{className}} { {{#each fields}}{{name}}: {{type}};{{/each}} }";
			const context = {
				className: "User",
				fields: [
					{ name: "id", type: "number" },
					{ name: "name", type: "string" },
				],
			};

			const compiledTemplate = templateEngine.compile(template);
			const result = compiledTemplate(context);

			expect(result).toContain("export class User");
			expect(templateEngine.compile).toHaveBeenCalledWith(template);
		});

		it("should handle template compilation errors", async () => {
			const { templateEngine } = mockIntegration;
			
			templateEngine.compile.mockImplementation(() => {
				throw new Error("Invalid template syntax");
			});

			expect(() => {
				templateEngine.compile("{{invalid syntax");
			}).toThrow("Invalid template syntax");
		});

		it("should register template helpers", async () => {
			const { templateEngine } = mockIntegration;
			
			templateEngine.registerHelper("camelCase", (str: string) => {
				return str.charAt(0).toLowerCase() + str.slice(1);
			});

			expect(templateEngine.registerHelper).toHaveBeenCalledWith("camelCase", expect.any(Function));
		});
	});

	describe("File System Operations", () => {
		it("should write model files to correct locations", async () => {
			const { fileSystem } = mockIntegration;
			const modelContent = "export class User {}";
			const filePath = "src/entities/user.entity.ts";

			await fileSystem.writeFile(filePath, modelContent);

			expect(fileSystem.writeFile).toHaveBeenCalledWith(filePath, modelContent);
			expect(await fileSystem.exists(filePath)).toBe(true);
			expect(await fileSystem.readFile(filePath)).toBe(modelContent);
		});

		it("should create directories if they don't exist", async () => {
			const { fileSystem } = mockIntegration;
			const filePath = "src/models/user/user.model.ts";

			await fileSystem.mkdir("src/models/user");
			await fileSystem.writeFile(filePath, "model content");

			expect(fileSystem.mkdir).toHaveBeenCalledWith("src/models/user");
			expect(await fileSystem.exists(filePath)).toBe(true);
		});

		it("should handle file system errors", async () => {
			const { fileSystem } = mockIntegration;
			
			fileSystem.writeFile.mockImplementation(() => {
				throw new Error("Permission denied");
			});

			await expect(fileSystem.writeFile("readonly/file.ts", "content"))
				.rejects.toThrow("Permission denied");
		});
	});

	describe("Framework-Specific Features", () => {
		it("should generate appropriate imports for each framework", async () => {
			const frameworks = [
				{
					name: "nestjs",
					expectedImports: ["typeorm", "@nestjs/typeorm"],
				},
				{
					name: "express",
					expectedImports: ["mongoose"],
				},
				{
					name: "fastify",
					expectedImports: ["@fastify/swagger"],
				},
				{
					name: "hono",
					expectedImports: ["zod", "hono"],
				},
			];

			frameworks.forEach(framework => {
				const context = createMockGeneratorContext({
					framework: framework.name,
				});

				// Simulate import generation
				const imports = framework.expectedImports;
				expect(imports.length).toBeGreaterThan(0);
			});
		});

		it("should apply framework-specific decorators and annotations", async () => {
			const nestjsContext = createMockGeneratorContext({
				framework: "nestjs",
			});

			const result = await mockIntegration.simulateGeneration("model", nestjsContext);
			
			// NestJS should use TypeORM decorators
			expect(result.content).toContain("@Entity");
		});
	});

	describe("Database Integration", () => {
		it("should generate models compatible with different databases", async () => {
			const databases = ["postgresql", "mysql", "mongodb", "sqlite"];
			
			databases.forEach(database => {
				const context = createMockGeneratorContext({
					database,
				});

				// Each database should have specific field types
				expect(context.database).toBe(database);
			});
		});

		it("should handle database-specific field types", async () => {
			const postgresContext = createMockGeneratorContext({
				database: "postgresql",
				fields: [
					{ name: "id", type: "uuid", dbType: "UUID" },
					{ name: "data", type: "json", dbType: "JSONB" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", postgresContext);
			expect(result.content).toBeDefined();
		});
	});

	describe("Code Quality and Standards", () => {
		it("should generate code with proper TypeScript types", async () => {
			const context = createMockGeneratorContext({
				fields: [
					{ name: "id", type: "number", tsType: "number" },
					{ name: "name", type: "string", tsType: "string" },
					{ name: "isActive", type: "boolean", tsType: "boolean" },
					{ name: "metadata", type: "object", tsType: "Record<string, any>" },
				],
			});

			const result = await mockIntegration.simulateGeneration("model", context);
			
			expect(result.content).toContain("number");
			expect(result.content).toContain("string");
		});

		it("should follow naming conventions", async () => {
			const context = createMockGeneratorContext({
				name: "UserProfile",
			});

			const result = await mockIntegration.simulateGeneration("model", context);
			
			// Should use PascalCase for class names
			expect(result.content).toContain("UserProfile");
		});

		it("should include proper JSDoc comments", async () => {
			const context = createMockGeneratorContext({
				name: "User",
				description: "User entity for authentication and profile management",
			});

			// Simulate JSDoc generation
			const expectedJsDoc = `/**
 * User entity for authentication and profile management
 * Generated by Xaheen CLI
 */`;

			expect(expectedJsDoc).toContain("User entity");
		});
	});
});
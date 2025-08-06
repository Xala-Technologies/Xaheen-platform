/**
 * NestJS Framework Integration Tests
 * Tests complete NestJS scaffolding workflow from generation to health check
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

describe("NestJS Framework Integration Tests", () => {
	let testProject: TestProject;
	let serverPort: number;

	beforeEach(async () => {
		testProject = await createTestProject({
			framework: "nestjs",
			cleanup: true,
		});

		serverPort = await testServerManager.findAvailablePort(3000);
	});

	afterEach(async () => {
		await testServerManager.stopAllServers();
		await databaseTestHelper.cleanupAllDatabases();
		await testProject.cleanup();
		mock.restore();
	});

	describe("Basic NestJS Project Scaffolding", () => {
		it("should generate a complete NestJS project structure", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				orm: "typeorm",
				features: ["rest-api", "authentication", "testing"],
				testing: true,
				documentation: true,
				monitoring: true,
			});

			const { result, duration } = await measureTime(() => 
				generateBackend(testProject.path, options)
			);

			assertSuccessfulResult(result);
			expect(duration).toBeLessThan(15000); // NestJS might take a bit longer

			const validation = await validateBackendStructure(testProject, "nestjs");
			expect(validation.isValid).toBe(true);
			expect(validation.errors).toHaveLength(0);

			// Check NestJS-specific files
			expect(await testProject.fileExists("src/main.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.module.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.controller.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.service.ts")).toBe(true);
			expect(await testProject.fileExists("nest-cli.json")).toBe(true);
		});

		it("should generate proper package.json with NestJS dependencies", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api", "graphql", "websockets"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));

			// Check NestJS core dependencies
			expect(packageJson.dependencies).toHaveProperty("@nestjs/core");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/common");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/platform-express");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/typeorm");
			expect(packageJson.dependencies).toHaveProperty("typeorm");
			expect(packageJson.dependencies).toHaveProperty("pg");
			expect(packageJson.dependencies).toHaveProperty("reflect-metadata");
			expect(packageJson.dependencies).toHaveProperty("rxjs");

			// Check feature-specific dependencies
			expect(packageJson.dependencies).toHaveProperty("@nestjs/graphql");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/websockets");

			// Check development dependencies
			expect(packageJson.devDependencies).toHaveProperty("@nestjs/cli");
			expect(packageJson.devDependencies).toHaveProperty("@nestjs/testing");
			expect(packageJson.devDependencies).toHaveProperty("jest");
			expect(packageJson.devDependencies).toHaveProperty("supertest");
			expect(packageJson.devDependencies).toHaveProperty("typescript");

			// Check scripts
			expect(packageJson.scripts).toHaveProperty("start:dev");
			expect(packageJson.scripts).toHaveProperty("start:prod");
			expect(packageJson.scripts).toHaveProperty("build");
			expect(packageJson.scripts).toHaveProperty("test");
			expect(packageJson.scripts).toHaveProperty("test:e2e");
		});

		it("should generate correct nest-cli.json configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const nestCli = JSON.parse(await testProject.readFile("nest-cli.json"));

			expect(nestCli).toHaveProperty("collection");
			expect(nestCli).toHaveProperty("sourceRoot");
			expect(nestCli.sourceRoot).toBe("src");
			expect(nestCli).toHaveProperty("compilerOptions");
			expect(nestCli.compilerOptions).toHaveProperty("deleteOutDir");
		});

		it("should generate TypeScript configuration for NestJS", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const tsConfig = JSON.parse(await testProject.readFile("tsconfig.json"));

			expect(tsConfig.compilerOptions.target).toBe("ES2022");
			expect(tsConfig.compilerOptions.experimentalDecorators).toBe(true);
			expect(tsConfig.compilerOptions.emitDecoratorMetadata).toBe(true);
			expect(tsConfig.compilerOptions.strict).toBe(true);
			expect(tsConfig.compilerOptions.esModuleInterop).toBe(true);
		});
	});

	describe("NestJS with Different Databases", () => {
		it("should generate NestJS project with PostgreSQL and TypeORM", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				orm: "typeorm",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/typeorm");
			expect(packageJson.dependencies).toHaveProperty("typeorm");
			expect(packageJson.dependencies).toHaveProperty("pg");

			// Check database module
			expect(await testProject.fileExists("src/database/database.module.ts")).toBe(true);

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("TypeOrmModule.forRoot");
			expect(appModule).toContain("type: 'postgres'");
		});

		it("should generate NestJS project with MySQL and Prisma", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "mysql",
				orm: "prisma",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@prisma/client");
			expect(packageJson.devDependencies).toHaveProperty("prisma");

			expect(await testProject.fileExists("prisma/schema.prisma")).toBe(true);

			const prismaSchema = await testProject.readFile("prisma/schema.prisma");
			expect(prismaSchema).toContain("provider = \"mysql\"");

			// Check Prisma service
			expect(await testProject.fileExists("src/prisma/prisma.service.ts")).toBe(true);
		});

		it("should generate NestJS project with MongoDB and Mongoose", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "mongodb",
				orm: "mongoose",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/mongoose");
			expect(packageJson.dependencies).toHaveProperty("mongoose");

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("MongooseModule.forRoot");
		});
	});

	describe("NestJS Feature Integration", () => {
		it("should generate NestJS project with JWT authentication", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				authentication: "jwt",
				features: ["rest-api", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check auth module structure
			expect(await testProject.fileExists("src/auth/auth.module.ts")).toBe(true);
			expect(await testProject.fileExists("src/auth/auth.service.ts")).toBe(true);
			expect(await testProject.fileExists("src/auth/auth.controller.ts")).toBe(true);
			expect(await testProject.fileExists("src/auth/jwt.strategy.ts")).toBe(true);
			expect(await testProject.fileExists("src/auth/guards/jwt-auth.guard.ts")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/jwt");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/passport");
			expect(packageJson.dependencies).toHaveProperty("passport-jwt");
			expect(packageJson.dependencies).toHaveProperty("bcryptjs");

			const authService = await testProject.readFile("src/auth/auth.service.ts");
			expect(authService).toContain("@Injectable()");
			expect(authService).toContain("JwtService");
			expect(authService).toContain("sign");
			expect(authService).toContain("verify");
		});

		it("should generate NestJS project with GraphQL", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["graphql"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/graphql");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/apollo");
			expect(packageJson.dependencies).toHaveProperty("apollo-server-express");
			expect(packageJson.dependencies).toHaveProperty("graphql");

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("GraphQLModule.forRoot");
			expect(appModule).toContain("ApolloDriver");

			// Check for GraphQL schema files
			expect(await testProject.fileExists("src/graphql/schema.graphql")).toBe(true);
		});

		it("should generate NestJS project with WebSockets", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["websockets"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/websockets");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/platform-socket.io");
			expect(packageJson.dependencies).toHaveProperty("socket.io");

			expect(await testProject.fileExists("src/websockets/websockets.gateway.ts")).toBe(true);

			const websocketGateway = await testProject.readFile("src/websockets/websockets.gateway.ts");
			expect(websocketGateway).toContain("@WebSocketGateway");
			expect(websocketGateway).toContain("@SubscribeMessage");
		});

		it("should generate NestJS project with file upload", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["file-upload"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("multer");

			expect(await testProject.fileExists("src/upload/upload.controller.ts")).toBe(true);
			expect(await testProject.fileExists("src/upload/upload.service.ts")).toBe(true);

			const uploadController = await testProject.readFile("src/upload/upload.controller.ts");
			expect(uploadController).toContain("@UseInterceptors");
			expect(uploadController).toContain("FileInterceptor");
			expect(uploadController).toContain("@UploadedFile");
		});

		it("should generate NestJS project with caching", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["caching"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("cache-manager");
			expect(packageJson.dependencies).toHaveProperty("cache-manager-redis-store");

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("CacheModule.register");
		});
	});

	describe("NestJS Dependency Installation", () => {
		it("should install dependencies successfully using Bun", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const { duration } = await measureTime(() =>
				testServerManager.installDependencies(testProject.path)
			);

			expect(duration).toBeLessThan(120000); // NestJS has more dependencies

			expect(await testProject.fileExists("node_modules")).toBe(true);
			expect(await testProject.fileExists("bun.lockb")).toBe(true);
		});
	});

	describe("NestJS Server Health Check", () => {
		it("should start NestJS server and respond to health check", async () => {
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
				env: {
					NODE_ENV: "test",
					DATABASE_URL: "file:./test.db",
				},
				startTimeout: 45000, // NestJS takes longer to start
			};

			const { duration: startupDuration } = await measureTime(() =>
				testServerManager.startServer(serverConfig)
			);

			// Note: NestJS might take longer than 2s for cold start due to reflection and DI
			expect(startupDuration).toBeLessThan(10000);

			const server = testServerManager.getServer("nestjs", serverPort);
			expect(server).toBeDefined();
			expect(server!.isRunning()).toBe(true);

			// Test health endpoint
			const response = await fetch(`${server!.url}/health`);
			expect(response.status).toBe(200);

			const healthData = await response.json();
			expect(healthData).toHaveProperty("status");
			expect(healthData.status).toBe("ok");
		});

		it("should handle graceful shutdown", async () => {
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
				env: { NODE_ENV: "test" },
				startTimeout: 30000,
			};

			const server = await testServerManager.startServer(serverConfig);
			expect(server.isRunning()).toBe(true);

			// Test graceful shutdown
			await server.stop();
			expect(server.isRunning()).toBe(false);
		});
	});

	describe("NestJS Module System", () => {
		it("should generate modular structure with proper imports", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api", "authentication"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("@Module({");
			expect(appModule).toContain("imports: [");
			expect(appModule).toContain("controllers: [");
			expect(appModule).toContain("providers: [");

			// Check that feature modules are imported
			expect(appModule).toContain("AuthModule");
			expect(appModule).toContain("UsersModule");
		});

		it("should generate resource modules with CRUD operations", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check users module structure
			expect(await testProject.fileExists("src/users/users.module.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/users.controller.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/users.service.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/dto/create-user.dto.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/dto/update-user.dto.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/entities/user.entity.ts")).toBe(true);

			const usersController = await testProject.readFile("src/users/users.controller.ts");
			expect(usersController).toContain("@Controller('users')");
			expect(usersController).toContain("@Get()");
			expect(usersController).toContain("@Get(':id')");
			expect(usersController).toContain("@Post()");
			expect(usersController).toContain("@Patch(':id')");
			expect(usersController).toContain("@Delete(':id')");
		});

		it("should generate DTOs with validation", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const createUserDto = await testProject.readFile("src/users/dto/create-user.dto.ts");
			expect(createUserDto).toContain("export class CreateUserDto");
			expect(createUserDto).toContain("@IsString()");
			expect(createUserDto).toContain("@IsEmail()");
			expect(createUserDto).toContain("@IsNotEmpty()");

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("class-validator");
			expect(packageJson.dependencies).toHaveProperty("class-transformer");
		});
	});

	describe("NestJS Testing Setup", () => {
		it("should generate comprehensive test setup", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "sqlite",
				features: ["rest-api"],
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			// Check test configuration
			expect(await testProject.fileExists("jest.config.js")).toBe(true);
			expect(await testProject.fileExists("test/jest-e2e.json")).toBe(true);

			// Check unit test files
			expect(await testProject.fileExists("src/app.controller.spec.ts")).toBe(true);
			expect(await testProject.fileExists("src/app.service.spec.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/users.controller.spec.ts")).toBe(true);
			expect(await testProject.fileExists("src/users/users.service.spec.ts")).toBe(true);

			// Check e2e test files
			expect(await testProject.fileExists("test/app.e2e-spec.ts")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.devDependencies).toHaveProperty("@nestjs/testing");
			expect(packageJson.scripts).toHaveProperty("test");
			expect(packageJson.scripts).toHaveProperty("test:watch");
			expect(packageJson.scripts).toHaveProperty("test:cov");
			expect(packageJson.scripts).toHaveProperty("test:e2e");
		});

		it("should generate test modules with proper mocking", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				testing: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const serviceTest = await testProject.readFile("src/users/users.service.spec.ts");
			expect(serviceTest).toContain("Test.createTestingModule");
			expect(serviceTest).toContain("providers: [");
			expect(serviceTest).toContain("getRepositoryToken");
			expect(serviceTest).toContain("beforeEach");
			expect(serviceTest).toContain("describe(");
			expect(serviceTest).toContain("it(");
		});
	});

	describe("NestJS Documentation", () => {
		it("should generate Swagger/OpenAPI documentation", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/swagger");

			const mainTs = await testProject.readFile("src/main.ts");
			expect(mainTs).toContain("SwaggerModule");
			expect(mainTs).toContain("DocumentBuilder");
			expect(mainTs).toContain("SwaggerModule.setup");

			// Check that controllers have Swagger decorators
			const usersController = await testProject.readFile("src/users/users.controller.ts");
			expect(usersController).toContain("@ApiTags");
			expect(usersController).toContain("@ApiOperation");
			expect(usersController).toContain("@ApiResponse");
		});

		it("should generate comprehensive README", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				documentation: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const readme = await testProject.readFile("README.md");
			expect(readme).toContain("# NESTJS Backend Application");
			expect(readme).toContain("## Installation");
			expect(readme).toContain("npm install");
			expect(readme).toContain("## Running the app");
			expect(readme).toContain("npm run start:dev");
			expect(readme).toContain("## Test");
			expect(readme).toContain("npm run test");
			expect(readme).toContain("## API Documentation");
			expect(readme).toContain("http://localhost:3000/api");
		});
	});

	describe("NestJS Deployment Configuration", () => {
		it("should generate Docker configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				deployment: "docker",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const dockerfile = await testProject.readFile("Dockerfile");
			expect(dockerfile).toContain("FROM node:18-alpine AS builder");
			expect(dockerfile).toContain("RUN npm ci --only=production");
			expect(dockerfile).toContain("RUN npm run build");
			expect(dockerfile).toContain("CMD [\"node\", \"dist/main\"]");

			const dockerCompose = await testProject.readFile("docker-compose.yml");
			expect(dockerCompose).toContain("app:");
			expect(dockerCompose).toContain("database:");
			expect(dockerCompose).toContain("image: postgres:15-alpine");
		});

		it("should generate Kubernetes configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				deployment: "kubernetes",
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("k8s/deployment.yaml")).toBe(true);
			expect(await testProject.fileExists("k8s/service.yaml")).toBe(true);
			expect(await testProject.fileExists("k8s/ingress.yaml")).toBe(true);

			const deployment = await testProject.readFile("k8s/deployment.yaml");
			expect(deployment).toContain("apiVersion: apps/v1");
			expect(deployment).toContain("kind: Deployment");
			expect(deployment).toContain("replicas:");
		});
	});

	describe("NestJS Performance and Monitoring", () => {
		it("should generate monitoring and logging configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			expect(await testProject.fileExists("src/common/interceptors/logging.interceptor.ts")).toBe(true);
			expect(await testProject.fileExists("src/common/filters/http-exception.filter.ts")).toBe(true);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("winston");

			const mainTs = await testProject.readFile("src/main.ts");
			expect(mainTs).toContain("useGlobalInterceptors");
			expect(mainTs).toContain("useGlobalFilters");
		});

		it("should generate health check configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				monitoring: true,
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("@nestjs/terminus");

			expect(await testProject.fileExists("src/health/health.controller.ts")).toBe(true);

			const healthController = await testProject.readFile("src/health/health.controller.ts");
			expect(healthController).toContain("@HealthCheck()");
			expect(healthController).toContain("HealthCheckService");
			expect(healthController).toContain("TypeOrmHealthIndicator");
		});
	});

	describe("NestJS Security Features", () => {
		it("should generate security configuration", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const packageJson = JSON.parse(await testProject.readFile("package.json"));
			expect(packageJson.dependencies).toHaveProperty("helmet");
			expect(packageJson.dependencies).toHaveProperty("@nestjs/throttler");

			const mainTs = await testProject.readFile("src/main.ts");
			expect(mainTs).toContain("helmet()");

			const appModule = await testProject.readFile("src/app.module.ts");
			expect(appModule).toContain("ThrottlerModule");
		});

		it("should generate validation pipes", async () => {
			const options = createBackendOptions({
				framework: "nestjs",
				database: "postgresql",
				features: ["rest-api"],
			});

			const result = await generateBackend(testProject.path, options);
			assertSuccessfulResult(result);

			const mainTs = await testProject.readFile("src/main.ts");
			expect(mainTs).toContain("useGlobalPipes");
			expect(mainTs).toContain("ValidationPipe");
			expect(mainTs).toContain("whitelist: true");
			expect(mainTs).toContain("forbidNonWhitelisted: true");
		});
	});
});
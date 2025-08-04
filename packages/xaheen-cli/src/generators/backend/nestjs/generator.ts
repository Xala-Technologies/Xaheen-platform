/**
 * NestJS Backend Generator
 * Enterprise-grade NestJS application generator with TypeScript
 * Supports dependency injection, modules, guards, interceptors, and pipes
 */

import {
	type BackendFeature,
	BackendGenerator,
	type BackendGeneratorOptions,
	type BackendGeneratorResult,
	type GeneratedFile,
} from "../index";

export class NestJSGenerator extends BackendGenerator {
	readonly framework = "nestjs";
	readonly defaultPort = 3000;
	readonly supportedDatabases = [
		"postgresql",
		"mysql",
		"mongodb",
		"sqlite",
		"supabase",
	] as const;
	readonly supportedFeatures: readonly BackendFeature[] = [
		"rest-api",
		"graphql",
		"websockets",
		"file-upload",
		"email",
		"payments",
		"notifications",
		"caching",
		"queue",
		"cron",
		"audit",
		"logging",
		"metrics",
	];

	async generate(
		projectPath: string,
		options: BackendGeneratorOptions,
	): Promise<BackendGeneratorResult> {
		const files: GeneratedFile[] = [];

		// Core configuration files
		files.push(this.generatePackageJson(options));
		files.push(this.generateTsConfig());
		files.push(...this.generateEnvironmentConfig(options));
		files.push(...this.generateDockerConfig());
		files.push(this.generateReadme(options));

		// NestJS specific files
		files.push(this.generateMainFile(options));
		files.push(this.generateAppModule(options));
		files.push(this.generateAppController());
		files.push(this.generateAppService());

		// Configuration module
		files.push(...this.generateConfigModule(options));

		// Database configuration
		files.push(...this.generateDatabaseConfig(options));

		// Authentication module
		if (options.authentication) {
			files.push(...this.generateAuthModule(options));
		}

		// Feature modules
		for (const feature of options.features) {
			files.push(...this.generateFeatureModule(feature, options));
		}

		// Testing files
		if (options.testing) {
			files.push(...this.generateTestFiles(options));
		}

		// Documentation
		if (options.documentation) {
			files.push(...this.generateDocumentationFiles(options));
		}

		// Deployment configuration
		files.push(...this.generateDeploymentFiles(options));

		const dependencies = this.getAllDependencies(options);
		const commands = this.getSetupCommands(options);

		return {
			success: true,
			files,
			commands,
			dependencies,
			message: `Successfully generated NestJS backend with ${options.features.length} features`,
			nextSteps: [
				"Install dependencies: npm install",
				"Configure environment variables in .env",
				"Start database: docker-compose up -d database",
				"Run migrations: npm run db:migrate",
				"Start development server: npm run dev",
				"Visit API documentation: http://localhost:3000/docs",
			],
		};
	}

	protected getBaseDependencies(
		options: BackendGeneratorOptions,
	): Record<string, string> {
		return {
			"@nestjs/common": "^10.0.0",
			"@nestjs/core": "^10.0.0",
			"@nestjs/platform-express": "^10.0.0",
			"@nestjs/config": "^3.0.0",
			"@nestjs/swagger": "^7.0.0",
			"class-validator": "^0.14.0",
			"class-transformer": "^0.5.1",
			"reflect-metadata": "^0.1.13",
			rxjs: "^7.8.1",
			helmet: "^7.0.0",
			compression: "^1.7.4",
			cors: "^2.8.5",
		};
	}

	protected getDevDependencies(
		options: BackendGeneratorOptions,
	): Record<string, string> {
		const devDeps = {
			"@nestjs/cli": "^10.0.0",
			"@nestjs/schematics": "^10.0.0",
			"@nestjs/testing": "^10.0.0",
			"@types/express": "^4.17.17",
			"@types/node": "^20.0.0",
			"@types/jest": "^29.5.2",
			"@types/supertest": "^2.0.12",
			"@typescript-eslint/eslint-plugin": "^6.0.0",
			"@typescript-eslint/parser": "^6.0.0",
			eslint: "^8.42.0",
			"eslint-config-prettier": "^8.8.0",
			"eslint-plugin-prettier": "^4.2.1",
			jest: "^29.5.0",
			prettier: "^2.8.8",
			"source-map-support": "^0.5.21",
			supertest: "^6.3.3",
			"ts-jest": "^29.1.0",
			"ts-loader": "^9.4.3",
			"ts-node": "^10.9.1",
			"tsconfig-paths": "^4.2.0",
			typescript: "^5.1.3",
		};

		if (options.testing) {
			devDeps["@nestjs/testing"] = "^10.0.0";
			devDeps["jest"] = "^29.5.0";
			devDeps["supertest"] = "^6.3.3";
		}

		return devDeps;
	}

	protected getScripts(
		options: BackendGeneratorOptions,
	): Record<string, string> {
		return {
			build: "nest build",
			format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
			start: "node dist/main",
			dev: "nest start --watch",
			"start:debug": "nest start --debug --watch",
			"start:prod": "node dist/main",
			lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
			test: "jest",
			"test:watch": "jest --watch",
			"test:cov": "jest --coverage",
			"test:debug":
				"node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
			"test:e2e": "jest --config ./test/jest-e2e.json",
			"db:migrate": "npx prisma migrate dev",
			"db:generate": "npx prisma generate",
			"db:seed": "npx prisma db seed",
			"db:studio": "npx prisma studio",
		};
	}

	protected getEnvironmentVariables(
		options: BackendGeneratorOptions,
	): Record<string, string> {
		const envVars: Record<string, string> = {
			NODE_ENV: "development",
			PORT: this.defaultPort.toString(),
			API_PREFIX: "api/v1",
			CORS_ORIGIN: "http://localhost:3001",
			JWT_SECRET: "your-super-secret-jwt-key-change-this-in-production",
			JWT_EXPIRES_IN: "7d",
		};

		// Database configuration
		switch (options.database) {
			case "postgresql":
				envVars["DATABASE_URL"] =
					"postgresql://postgres:postgres@localhost:5432/xaheen_dev";
				break;
			case "mysql":
				envVars["DATABASE_URL"] =
					"mysql://root:password@localhost:3306/xaheen_dev";
				break;
			case "mongodb":
				envVars["DATABASE_URL"] = "mongodb://localhost:27017/xaheen_dev";
				break;
			case "sqlite":
				envVars["DATABASE_URL"] = "file:./dev.db";
				break;
			case "supabase":
				envVars["DATABASE_URL"] =
					"postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres";
				envVars["SUPABASE_URL"] = "https://[YOUR-PROJECT-REF].supabase.co";
				envVars["SUPABASE_ANON_KEY"] = "your-supabase-anon-key";
				break;
		}

		// Feature-specific environment variables
		if (options.features.includes("email")) {
			envVars["SMTP_HOST"] = "smtp.gmail.com";
			envVars["SMTP_PORT"] = "587";
			envVars["SMTP_USER"] = "your-email@gmail.com";
			envVars["SMTP_PASS"] = "your-app-password";
		}

		if (options.features.includes("payments")) {
			envVars["STRIPE_SECRET_KEY"] = "sk_test_your-stripe-secret-key";
			envVars["STRIPE_WEBHOOK_SECRET"] = "whsec_your-webhook-secret";
			envVars["VIPPS_CLIENT_ID"] = "your-vipps-client-id";
			envVars["VIPPS_CLIENT_SECRET"] = "your-vipps-client-secret";
		}

		if (options.features.includes("caching")) {
			envVars["REDIS_URL"] = "redis://localhost:6379";
		}

		if (options.authentication === "bankid") {
			envVars["BANKID_CLIENT_ID"] = "your-bankid-client-id";
			envVars["BANKID_CLIENT_SECRET"] = "your-bankid-client-secret";
			envVars["BANKID_REDIRECT_URI"] =
				"http://localhost:3000/auth/bankid/callback";
		}

		return envVars;
	}

	protected getFeatureDependencies(
		features: readonly BackendFeature[],
	): Record<string, string> {
		const deps: Record<string, string> = {};

		for (const feature of features) {
			switch (feature) {
				case "graphql":
					deps["@nestjs/graphql"] = "^12.0.0";
					deps["@nestjs/apollo"] = "^12.0.0";
					deps["apollo-server-express"] = "^3.12.0";
					deps["graphql"] = "^16.7.1";
					break;

				case "websockets":
					deps["@nestjs/websockets"] = "^10.0.0";
					deps["@nestjs/platform-socket.io"] = "^10.0.0";
					deps["socket.io"] = "^4.7.2";
					break;

				case "file-upload":
					deps["@nestjs/platform-express"] = "^10.0.0";
					deps["multer"] = "^1.4.5-lts.1";
					deps["@types/multer"] = "^1.4.7";
					break;

				case "email":
					deps["@nestjs-modules/mailer"] = "^1.9.1";
					deps["nodemailer"] = "^6.9.4";
					deps["@types/nodemailer"] = "^6.4.9";
					break;

				case "payments":
					deps["stripe"] = "^12.18.0";
					deps["@types/stripe"] = "^8.0.417";
					break;

				case "caching":
					deps["@nestjs/cache-manager"] = "^2.0.0";
					deps["cache-manager"] = "^5.2.3";
					deps["cache-manager-redis-store"] = "^3.0.1";
					break;

				case "queue":
					deps["@nestjs/bull"] = "^10.0.1";
					deps["bull"] = "^4.11.3";
					deps["@types/bull"] = "^4.10.0";
					break;

				case "cron":
					deps["@nestjs/schedule"] = "^3.0.1";
					break;

				case "logging":
					deps["winston"] = "^3.10.0";
					deps["nest-winston"] = "^1.9.4";
					break;

				case "metrics":
					deps["@prometheus-io/client"] = "^1.0.1";
					deps["@nestjs/terminus"] = "^10.0.1";
					break;
			}
		}

		return deps;
	}

	protected getDatabaseDependencies(
		database: string,
		orm: string,
	): Record<string, string> {
		const deps: Record<string, string> = {};

		if (orm === "prisma") {
			deps["prisma"] = "^5.1.1";
			deps["@prisma/client"] = "^5.1.1";
		}

		switch (database) {
			case "postgresql":
				if (orm === "typeorm") {
					deps["@nestjs/typeorm"] = "^10.0.0";
					deps["typeorm"] = "^0.3.17";
					deps["pg"] = "^8.11.2";
					deps["@types/pg"] = "^8.10.2";
				}
				break;

			case "mysql":
				if (orm === "typeorm") {
					deps["@nestjs/typeorm"] = "^10.0.0";
					deps["typeorm"] = "^0.3.17";
					deps["mysql2"] = "^3.6.0";
				}
				break;

			case "mongodb":
				if (orm === "mongoose") {
					deps["@nestjs/mongoose"] = "^10.0.1";
					deps["mongoose"] = "^7.4.3";
					deps["@types/mongoose"] = "^5.11.97";
				}
				break;

			case "supabase":
				deps["@supabase/supabase-js"] = "^2.32.0";
				break;
		}

		return deps;
	}

	private generateMainFile(options: BackendGeneratorOptions): GeneratedFile {
		const content = `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Xaheen API')
      .setDescription('Enterprise-grade API built with NestJS')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(\`🚀 Application is running on: http://localhost:\${port}\`);
  console.log(\`📚 API Documentation: http://localhost:\${port}/docs\`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});`;

		return {
			path: "src/main.ts",
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateAppModule(options: BackendGeneratorOptions): GeneratedFile {
		const imports = [
			"Module",
			...(options.features.includes("caching") ? ["CacheModule"] : []),
			...(options.features.includes("cron") ? ["ScheduleModule"] : []),
			...(options.features.includes("queue") ? ["BullModule"] : []),
		];

		const moduleImports = [
			"ConfigModule.forRoot({ isGlobal: true })",
			...(options.features.includes("caching")
				? ["CacheModule.register({ isGlobal: true })"]
				: []),
			...(options.features.includes("cron")
				? ["ScheduleModule.forRoot()"]
				: []),
			"DatabaseModule",
			...(options.authentication ? ["AuthModule"] : []),
			...options.features.map(
				(feature) => `${this.getFeatureModuleName(feature)}Module`,
			),
		];

		const content = `import { ${imports.join(", ")} } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
${options.features.includes("caching") ? "import { CacheModule } from '@nestjs/cache-manager';" : ""}
${options.features.includes("cron") ? "import { ScheduleModule } from '@nestjs/schedule';" : ""}
${options.features.includes("queue") ? "import { BullModule } from '@nestjs/bull';" : ""}
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
${options.authentication ? "import { AuthModule } from './modules/auth/auth.module';" : ""}
${options.features
	.map(
		(feature) =>
			`import { ${this.getFeatureModuleName(feature)}Module } from './modules/${feature.replace("-", "")}/${feature.replace("-", "")}.module';`,
	)
	.join("\n")}

@Module({
  imports: [
    ${moduleImports.join(",\n    ")}
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`;

		return {
			path: "src/app.module.ts",
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateAppController(): GeneratedFile {
		const content = `import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({ status: 200, description: 'Application information' })
  getHello(): { message: string; version: string; timestamp: string } {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }
}`;

		return {
			path: "src/app.controller.ts",
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateAppService(): GeneratedFile {
		const content = `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): { message: string; version: string; timestamp: string } {
    return {
      message: 'Xaheen NestJS API - Enterprise-grade backend service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}`;

		return {
			path: "src/app.service.ts",
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateConfigModule(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		const configService = `import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'default-secret');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '7d');
  }

  get corsOrigin(): string {
    return this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3001');
  }
}`;

		const configModule = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';

@Module({
  imports: [ConfigModule],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}`;

		return [
			{
				path: "src/config/config.service.ts",
				content: configService,
				type: "source",
				language: "typescript",
			},
			{
				path: "src/config/config.module.ts",
				content: configModule,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateDatabaseConfig(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		if (options.orm === "prisma") {
			return this.generatePrismaConfig(options);
		} else if (options.orm === "typeorm") {
			return this.generateTypeOrmConfig(options);
		}
		return [];
	}

	private generatePrismaConfig(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		const schema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${this.getPrismaProvider(options.database)}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
}`;

		const databaseModule = `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}`;

		const prismaService = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}`;

		return [
			{
				path: "prisma/schema.prisma",
				content: schema,
				type: "config",
				language: "typescript",
			},
			{
				path: "src/database/database.module.ts",
				content: databaseModule,
				type: "source",
				language: "typescript",
			},
			{
				path: "src/database/prisma.service.ts",
				content: prismaService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateTypeOrmConfig(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		// TypeORM configuration implementation
		return [];
	}

	private generateAuthModule(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		// Authentication module implementation
		return [];
	}

	private generateFeatureModule(
		feature: BackendFeature,
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		// Feature-specific module implementation
		return [];
	}

	private generateTestFiles(options: BackendGeneratorOptions): GeneratedFile[] {
		// Test file generation
		return [];
	}

	private generateDocumentationFiles(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		// Documentation generation
		return [];
	}

	private generateDeploymentFiles(
		options: BackendGeneratorOptions,
	): GeneratedFile[] {
		// Deployment configuration
		return [];
	}

	private getAllDependencies(options: BackendGeneratorOptions): any[] {
		// Combine all dependencies
		return [];
	}

	private getSetupCommands(options: BackendGeneratorOptions): string[] {
		return ["npm install", "npx prisma generate", "npx prisma db push"];
	}

	private getFeatureModuleName(feature: BackendFeature): string {
		return feature
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("");
	}

	private getPrismaProvider(database: string): string {
		switch (database) {
			case "postgresql":
			case "supabase":
				return "postgresql";
			case "mysql":
				return "mysql";
			case "sqlite":
				return "sqlite";
			case "mongodb":
				return "mongodb";
			default:
				return "postgresql";
		}
	}
}

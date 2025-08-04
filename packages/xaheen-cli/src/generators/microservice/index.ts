/**
 * Microservice Generator
 * Complete microservice architecture generation with enterprise features
 */

import * as fs from "fs/promises";
import * as path from "path";
import { CICDGenerator } from "./cicd.generator.js";
import { DockerGenerator } from "./docker.generator.js";
import { GrpcGenerator } from "./grpc.generator.js";
import { HealthCheckGenerator } from "./health-check.generator.js";
import { KubernetesGenerator } from "./kubernetes.generator.js";
import { MessagingGenerator } from "./messaging.generator.js";
import { MetricsGenerator } from "./metrics.generator.js";
import { MonitoringGenerator } from "./monitoring.generator.js";
import {
	GeneratedFile,
	GrpcServiceConfig,
	MessageQueueConfig,
	MicroserviceGeneratorResult,
	MicroserviceOptions,
	ServiceDiscoveryConfig,
	ServiceHealthCheck,
	ServiceMetrics,
	ServicePort,
	TracingConfig,
} from "./types.js";

export class MicroserviceGenerator {
	private healthCheckGen: HealthCheckGenerator;
	private metricsGen: MetricsGenerator;
	private dockerGen: DockerGenerator;
	private k8sGen: KubernetesGenerator;
	private grpcGen: GrpcGenerator;
	private messagingGen: MessagingGenerator;
	private cicdGen: CICDGenerator;
	private monitoringGen: MonitoringGenerator;

	constructor() {
		this.healthCheckGen = new HealthCheckGenerator();
		this.metricsGen = new MetricsGenerator();
		this.dockerGen = new DockerGenerator();
		this.k8sGen = new KubernetesGenerator();
		this.grpcGen = new GrpcGenerator();
		this.messagingGen = new MessagingGenerator();
		this.cicdGen = new CICDGenerator();
		this.monitoringGen = new MonitoringGenerator();
	}

	async generate(
		options: MicroserviceOptions,
	): Promise<MicroserviceGeneratorResult> {
		const files: GeneratedFile[] = [];
		const commands: string[] = [];
		const ports: ServicePort[] = [];
		const nextSteps: string[] = [];

		try {
			// Generate main service code based on framework
			const serviceFiles = await this.generateServiceCode(options);
			files.push(...serviceFiles);

			// Generate health checks if enabled
			if (options.features.includes("health-checks")) {
				const healthFiles = await this.healthCheckGen.generate(options);
				files.push(...healthFiles);
				ports.push({
					name: "health",
					port: 8081,
					protocol: "http",
					purpose: "Health checks",
				});
			}

			// Generate metrics if enabled
			if (options.features.includes("metrics")) {
				const metricsFiles = await this.metricsGen.generate(options);
				files.push(...metricsFiles);
				ports.push({
					name: "metrics",
					port: 9090,
					protocol: "http",
					purpose: "Prometheus metrics",
				});
			}

			// Generate gRPC service if enabled
			if (options.features.includes("grpc")) {
				const grpcFiles = await this.grpcGen.generate(options);
				files.push(...grpcFiles);
				ports.push({
					name: "grpc",
					port: 50051,
					protocol: "grpc",
					purpose: "gRPC service",
				});
			}

			// Generate messaging integration if configured
			if (options.messaging && options.messaging !== "none") {
				const messagingFiles = await this.messagingGen.generate(options);
				files.push(...messagingFiles);
			}

			// Generate Docker configuration
			if (options.deployment === "docker" || options.deployment === "both") {
				const dockerFiles = await this.dockerGen.generate(options);
				files.push(...dockerFiles);
				commands.push("docker build -t " + options.name + " .");
				commands.push("docker-compose up -d");
			}

			// Generate Kubernetes manifests
			if (
				options.deployment === "kubernetes" ||
				options.deployment === "both"
			) {
				const k8sFiles = await this.k8sGen.generate(options);
				files.push(...k8sFiles);
				commands.push("kubectl apply -f k8s/");
			}

			// Generate CI/CD pipelines
			const cicdFiles = await this.cicdGen.generate(options);
			files.push(...cicdFiles);

			// Generate monitoring configuration
			if (options.monitoring) {
				const monitoringFiles = await this.monitoringGen.generate(options);
				files.push(...monitoringFiles);
			}

			// Add main service port
			ports.push({
				name: "main",
				port: 3000,
				protocol: "http",
				purpose: "Main service API",
			});

			// Generate commands based on framework
			commands.push(...this.getFrameworkCommands(options));

			// Generate next steps
			nextSteps.push(
				`Review generated microservice at ./${options.name}`,
				"Install dependencies: npm install",
				"Configure environment variables in .env",
				"Run tests: npm test",
				"Start development: npm run dev",
			);

			if (options.deployment === "docker" || options.deployment === "both") {
				nextSteps.push(
					"Build Docker image: docker build -t " + options.name + " .",
				);
				nextSteps.push("Run with Docker Compose: docker-compose up");
			}

			if (
				options.deployment === "kubernetes" ||
				options.deployment === "both"
			) {
				nextSteps.push("Deploy to Kubernetes: kubectl apply -f k8s/");
				nextSteps.push(
					"Check deployment: kubectl get pods -l app=" + options.name,
				);
			}

			return {
				success: true,
				serviceName: options.name,
				files,
				commands,
				ports,
				nextSteps,
				message: `Microservice '${options.name}' generated successfully with ${options.framework} framework`,
			};
		} catch (error) {
			return {
				success: false,
				serviceName: options.name,
				files: [],
				commands: [],
				ports: [],
				nextSteps: ["Check error and try again"],
				message: `Failed to generate microservice: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	private async generateServiceCode(
		options: MicroserviceOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		switch (options.framework) {
			case "nestjs":
				files.push(...(await this.generateNestJSService(options)));
				break;
			case "express":
				files.push(...(await this.generateExpressService(options)));
				break;
			case "fastify":
				files.push(...(await this.generateFastifyService(options)));
				break;
			case "hono":
				files.push(...(await this.generateHonoService(options)));
				break;
		}

		// Generate common files
		files.push(this.generatePackageJson(options));
		files.push(this.generateTsConfig());
		files.push(this.generateEnvExample(options));
		files.push(this.generateReadme(options));

		return files;
	}

	private async generateNestJSService(
		options: MicroserviceOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Main application file
		files.push({
			path: `${options.name}/src/main.ts`,
			content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
${options.monitoring ? "import { PrometheusModule } from '@willsoto/nestjs-prometheus';" : ""}
${options.tracing ? "import { initTracing } from './tracing/tracing.module';" : ""}

async function bootstrap() {
  ${options.tracing ? "initTracing();" : ""}
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('${options.name} Microservice')
    .setDescription('API documentation for ${options.name}')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(\`🚀 ${options.name} microservice running on port \${port}\`);
}

bootstrap();`,
			type: "source",
		});

		// App module
		files.push({
			path: `${options.name}/src/app.module.ts`,
			content: `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
${options.features.includes("health-checks") ? "import { HealthModule } from './health/health.module';" : ""}
${options.features.includes("metrics") ? "import { PrometheusModule } from '@willsoto/nestjs-prometheus';" : ""}
${options.database === "postgresql" ? "import { TypeOrmModule } from '@nestjs/typeorm';" : ""}
${options.database === "mongodb" ? "import { MongooseModule } from '@nestjs/mongoose';" : ""}
${options.messaging === "rabbitmq" ? "import { RabbitMQModule } from './messaging/rabbitmq.module';" : ""}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local']
    }),
    ${options.features.includes("health-checks") ? "HealthModule," : ""}
    ${options.features.includes("metrics") ? "PrometheusModule.register()," : ""}
    ${this.getDatabaseModule(options)}
    ${this.getMessagingModule(options)}
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`,
			type: "source",
		});

		// App controller
		files.push({
			path: `${options.name}/src/app.controller.ts`,
			content: `import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get service status' })
  getStatus() {
    return this.appService.getStatus();
  }
}`,
			type: "source",
		});

		// App service
		files.push({
			path: `${options.name}/src/app.service.ts`,
			content: `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: '${options.name}',
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}`,
			type: "source",
		});

		return files;
	}

	private async generateExpressService(
		options: MicroserviceOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/index.ts`,
			content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
${options.features.includes("health-checks") ? "import { healthRouter } from './routes/health';" : ""}
${options.features.includes("metrics") ? "import { metricsRouter } from './routes/metrics';" : ""}
${options.tracing ? "import { initTracing } from './tracing';" : ""}

config();

const app = express();
const PORT = process.env.PORT || 3000;

${options.tracing ? "initTracing();" : ""}

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    service: '${options.name}',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

${options.features.includes("health-checks") ? "app.use('/health', healthRouter);" : ""}
${options.features.includes("metrics") ? "app.use('/metrics', metricsRouter);" : ""}

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(\`🚀 ${options.name} microservice running on port \${PORT}\`);
});`,
			type: "source",
		});

		return files;
	}

	private async generateFastifyService(
		options: MicroserviceOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/index.ts`,
			content: `import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { config } from 'dotenv';
${options.features.includes("health-checks") ? "import { healthRoutes } from './routes/health';" : ""}
${options.features.includes("metrics") ? "import { metricsPlugin } from './plugins/metrics';" : ""}

config();

const server = fastify({
  logger: true
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  // Register plugins
  await server.register(cors);
  await server.register(helmet);
  await server.register(compress);
  
  ${options.features.includes("metrics") ? "await server.register(metricsPlugin);" : ""}
  ${options.features.includes("health-checks") ? "await server.register(healthRoutes);" : ""}

  // Main route
  server.get('/', async () => {
    return {
      service: '${options.name}',
      status: 'operational',
      timestamp: new Date().toISOString()
    };
  });

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(\`🚀 ${options.name} microservice running on \${HOST}:\${PORT}\`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();`,
			type: "source",
		});

		return files;
	}

	private async generateHonoService(
		options: MicroserviceOptions,
	): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/index.ts`,
			content: `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { serve } from '@hono/node-server';
${options.features.includes("health-checks") ? "import { healthRoutes } from './routes/health';" : ""}
${options.features.includes("metrics") ? "import { metricsMiddleware } from './middleware/metrics';" : ""}

const app = new Hono();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', compress());
${options.features.includes("metrics") ? "app.use('*', metricsMiddleware());" : ""}

// Routes
app.get('/', (c) => {
  return c.json({
    service: '${options.name}',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

${options.features.includes("health-checks") ? "app.route('/health', healthRoutes);" : ""}

serve({
  fetch: app.fetch,
  port: PORT
}, () => {
  console.log(\`🚀 ${options.name} microservice running on port \${PORT}\`);
});`,
			type: "source",
		});

		return files;
	}

	private generatePackageJson(options: MicroserviceOptions): GeneratedFile {
		const dependencies: Record<string, string> = {
			dotenv: "^16.0.0",
		};

		const devDependencies: Record<string, string> = {
			"@types/node": "^20.0.0",
			typescript: "^5.0.0",
			tsx: "^4.0.0",
			nodemon: "^3.0.0",
			"@types/jest": "^29.0.0",
			jest: "^29.0.0",
			"ts-jest": "^29.0.0",
		};

		// Add framework-specific dependencies
		switch (options.framework) {
			case "nestjs":
				Object.assign(dependencies, {
					"@nestjs/common": "^10.0.0",
					"@nestjs/core": "^10.0.0",
					"@nestjs/platform-express": "^10.0.0",
					"@nestjs/config": "^3.0.0",
					"@nestjs/swagger": "^7.0.0",
					"reflect-metadata": "^0.1.13",
					rxjs: "^7.0.0",
				});
				break;
			case "express":
				Object.assign(dependencies, {
					express: "^4.18.0",
					cors: "^2.8.5",
					helmet: "^7.0.0",
					compression: "^1.7.4",
				});
				Object.assign(devDependencies, {
					"@types/express": "^4.17.17",
					"@types/cors": "^2.8.13",
					"@types/compression": "^1.7.2",
				});
				break;
			case "fastify":
				Object.assign(dependencies, {
					fastify: "^4.0.0",
					"@fastify/cors": "^8.0.0",
					"@fastify/helmet": "^11.0.0",
					"@fastify/compress": "^6.0.0",
				});
				break;
			case "hono":
				Object.assign(dependencies, {
					hono: "^3.0.0",
					"@hono/node-server": "^1.0.0",
				});
				break;
		}

		// Add database dependencies
		if (options.database === "postgresql") {
			dependencies["pg"] = "^8.11.0";
			dependencies["typeorm"] = "^0.3.0";
		} else if (options.database === "mongodb") {
			dependencies["mongoose"] = "^7.0.0";
		} else if (options.database === "redis") {
			dependencies["ioredis"] = "^5.0.0";
		}

		// Add messaging dependencies
		if (options.messaging === "rabbitmq") {
			dependencies["amqplib"] = "^0.10.0";
			devDependencies["@types/amqplib"] = "^0.10.0";
		} else if (options.messaging === "kafka") {
			dependencies["kafkajs"] = "^2.0.0";
		}

		// Add monitoring dependencies
		if (options.features.includes("metrics")) {
			dependencies["prom-client"] = "^14.0.0";
		}

		if (options.tracing) {
			dependencies["@opentelemetry/api"] = "^1.0.0";
			dependencies["@opentelemetry/sdk-node"] = "^0.40.0";
		}

		const packageJson = {
			name: options.name,
			version: "1.0.0",
			description: `${options.name} microservice`,
			main: "dist/index.js",
			scripts: {
				build: "tsc",
				start: "node dist/index.js",
				dev: "nodemon --exec tsx src/index.ts",
				test: "jest",
				"test:watch": "jest --watch",
				"test:cov": "jest --coverage",
				lint: "eslint src --ext .ts",
				format: 'prettier --write "src/**/*.ts"',
			},
			dependencies,
			devDependencies,
		};

		return {
			path: `${options.name}/package.json`,
			content: JSON.stringify(packageJson, null, 2),
			type: "config",
		};
	}

	private generateTsConfig(): GeneratedFile {
		const tsConfig = {
			compilerOptions: {
				module: "commonjs",
				declaration: true,
				removeComments: true,
				emitDecoratorMetadata: true,
				experimentalDecorators: true,
				allowSyntheticDefaultImports: true,
				target: "ES2021",
				sourceMap: true,
				outDir: "./dist",
				baseUrl: "./",
				incremental: true,
				skipLibCheck: true,
				strictNullChecks: true,
				noImplicitAny: true,
				strictBindCallApply: true,
				forceConsistentCasingInFileNames: true,
				noFallthroughCasesInSwitch: true,
				esModuleInterop: true,
				resolveJsonModule: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist", "test", "**/*spec.ts"],
		};

		return {
			path: "tsconfig.json",
			content: JSON.stringify(tsConfig, null, 2),
			type: "config",
		};
	}

	private generateEnvExample(options: MicroserviceOptions): GeneratedFile {
		let envContent = `# Service Configuration
NODE_ENV=development
PORT=3000
SERVICE_NAME=${options.name}
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=*
`;

		if (options.database === "postgresql") {
			envContent += `
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=${options.name}_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
`;
		} else if (options.database === "mongodb") {
			envContent += `
# MongoDB
MONGODB_URI=mongodb://localhost:27017/${options.name}
`;
		} else if (options.database === "redis") {
			envContent += `
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
`;
		}

		if (options.messaging === "rabbitmq") {
			envContent += `
# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@localhost:5672
`;
		} else if (options.messaging === "kafka") {
			envContent += `
# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=${options.name}
`;
		}

		if (options.authentication === "jwt") {
			envContent += `
# JWT Authentication
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=7d
`;
		}

		if (options.features.includes("service-discovery")) {
			envContent += `
# Service Discovery
CONSUL_HOST=localhost
CONSUL_PORT=8500
`;
		}

		if (options.tracing) {
			envContent += `
# Tracing
JAEGER_ENDPOINT=http://localhost:14268/api/traces
TRACING_SAMPLE_RATE=1.0
`;
		}

		return {
			path: `${options.name}/.env.example`,
			content: envContent,
			type: "config",
		};
	}

	private generateReadme(options: MicroserviceOptions): GeneratedFile {
		const content = `# ${options.name} Microservice

## Overview
${options.name} is a ${options.framework}-based microservice with enterprise-grade features.

## Features
${options.features.map((f) => `- ${f}`).join("\n")}

## Technology Stack
- Framework: ${options.framework}
- Database: ${options.database || "None"}
- Messaging: ${options.messaging || "None"}
- Deployment: ${options.deployment}

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (if using Docker deployment)
- Kubernetes cluster (if using Kubernetes deployment)

### Installation
\`\`\`bash
npm install
\`\`\`

### Configuration
Copy \`.env.example\` to \`.env\` and update the values:
\`\`\`bash
cp .env.example .env
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Testing
\`\`\`bash
npm test
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

### Production
\`\`\`bash
npm start
\`\`\`

## Docker Deployment
\`\`\`bash
docker build -t ${options.name} .
docker run -p 3000:3000 ${options.name}
\`\`\`

## Kubernetes Deployment
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

## API Documentation
API documentation is available at:
- Swagger UI: http://localhost:3000/api/docs

## Health Checks
- Liveness: http://localhost:8081/health/liveness
- Readiness: http://localhost:8081/health/readiness

## Metrics
Prometheus metrics are exposed at:
- http://localhost:9090/metrics

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
`;

		return {
			path: `${options.name}/README.md`,
			content,
			type: "documentation",
		};
	}

	private getDatabaseModule(options: MicroserviceOptions): string {
		if (options.database === "postgresql") {
			return `TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development'
    }),`;
		} else if (options.database === "mongodb") {
			return `MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/${options.name}'),`;
		}
		return "";
	}

	private getMessagingModule(options: MicroserviceOptions): string {
		if (options.messaging === "rabbitmq") {
			return "RabbitMQModule,";
		}
		return "";
	}

	private getFrameworkCommands(options: MicroserviceOptions): string[] {
		const commands: string[] = [];

		commands.push("npm install");

		if (options.framework === "nestjs") {
			commands.push("npm run build");
			commands.push("npm run start:dev");
		} else {
			commands.push("npm run dev");
		}

		return commands;
	}
}

// Export main generation function
export async function generateMicroservice(
	options: MicroserviceOptions,
): Promise<MicroserviceGeneratorResult> {
	const generator = new MicroserviceGenerator();
	return await generator.generate(options);
}

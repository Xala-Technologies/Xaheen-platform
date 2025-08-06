/**
 * Docker Generator
 * Generates Docker configuration for microservices
 */

import { GeneratedFile, MicroserviceOptions } from "./types";

export class DockerGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Generate Dockerfile
		files.push(this.generateDockerfile(options));

		// Generate docker-compose.yml
		files.push(this.generateDockerCompose(options));

		// Generate .dockerignore
		files.push(this.generateDockerIgnore(options));

		return files;
	}

	private generateDockerfile(options: MicroserviceOptions): GeneratedFile {
		const content = `# Multi-stage Dockerfile for ${options.name} microservice
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
${options.framework === "nestjs" ? "COPY tsconfig*.json ./" : "COPY tsconfig.json ./"}

# Install production dependencies
RUN npm ci --only=production && \\
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
${options.framework === "nestjs" ? "COPY tsconfig*.json ./" : "COPY tsconfig.json ./"}

# Install all dependencies
RUN npm ci

# Copy source code
COPY src ./src
${options.framework === "nestjs" ? "COPY nest-cli.json ./" : ""}

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000
${options.features.includes("health-checks") ? "EXPOSE 8081" : ""}
${options.features.includes("metrics") ? "EXPOSE 9090" : ""}
${options.features.includes("grpc") ? "EXPOSE 50051" : ""}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${options.features.includes("health-checks") ? "8081" : "3000"}/health/liveness', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]`;

		return {
			path: `${options.name}/Dockerfile`,
			content,
			type: "docker",
		};
	}

	private generateDockerCompose(options: MicroserviceOptions): GeneratedFile {
		const services: any = {
			[options.name]: {
				build: {
					context: ".",
					dockerfile: "Dockerfile",
					target: "runner",
				},
				container_name: options.name,
				restart: "unless-stopped",
				ports: ["3000:3000"],
				environment: {
					NODE_ENV: "development",
					PORT: 3000,
					SERVICE_NAME: options.name,
				},
				networks: ["microservices"],
				depends_on: this.getDependencies(options),
				volumes: ["./src:/app/src:ro", "node_modules:/app/node_modules"],
			},
		};

		// Add health check port if enabled
		if (options.features.includes("health-checks")) {
			services[options.name].ports.push("8081:8081");
		}

		// Add metrics port if enabled
		if (options.features.includes("metrics")) {
			services[options.name].ports.push("9090:9090");
		}

		// Add gRPC port if enabled
		if (options.features.includes("grpc")) {
			services[options.name].ports.push("50051:50051");
		}

		// Add database service
		if (options.database === "postgresql") {
			services.postgres = {
				image: "postgres:15-alpine",
				container_name: `${options.name}-postgres`,
				restart: "unless-stopped",
				environment: {
					POSTGRES_DB: `${options.name}_db`,
					POSTGRES_USER: "postgres",
					POSTGRES_PASSWORD: "postgres",
				},
				ports: ["5432:5432"],
				volumes: ["postgres_data:/var/lib/postgresql/data"],
				networks: ["microservices"],
				healthcheck: {
					test: ["CMD-SHELL", "pg_isready -U postgres"],
					interval: "10s",
					timeout: "5s",
					retries: 5,
				},
			};

			services[options.name].environment.DATABASE_HOST = "postgres";
			services[options.name].environment.DATABASE_PORT = 5432;
			services[options.name].environment.DATABASE_NAME = `${options.name}_db`;
			services[options.name].environment.DATABASE_USER = "postgres";
			services[options.name].environment.DATABASE_PASSWORD = "postgres";
		} else if (options.database === "mongodb") {
			services.mongodb = {
				image: "mongo:6-jammy",
				container_name: `${options.name}-mongodb`,
				restart: "unless-stopped",
				environment: {
					MONGO_INITDB_ROOT_USERNAME: "admin",
					MONGO_INITDB_ROOT_PASSWORD: "admin",
					MONGO_INITDB_DATABASE: options.name,
				},
				ports: ["27017:27017"],
				volumes: ["mongodb_data:/data/db"],
				networks: ["microservices"],
			};

			services[options.name].environment.MONGODB_URI =
				`mongodb://admin:admin@mongodb:27017/${options.name}?authSource=admin`;
		} else if (options.database === "redis") {
			services.redis = {
				image: "redis:7-alpine",
				container_name: `${options.name}-redis`,
				restart: "unless-stopped",
				command: "redis-server --appendonly yes",
				ports: ["6379:6379"],
				volumes: ["redis_data:/data"],
				networks: ["microservices"],
				healthcheck: {
					test: ["CMD", "redis-cli", "ping"],
					interval: "10s",
					timeout: "5s",
					retries: 5,
				},
			};

			services[options.name].environment.REDIS_HOST = "redis";
			services[options.name].environment.REDIS_PORT = 6379;
		}

		// Add message queue service
		if (options.messaging === "rabbitmq") {
			services.rabbitmq = {
				image: "rabbitmq:3-management-alpine",
				container_name: `${options.name}-rabbitmq`,
				restart: "unless-stopped",
				environment: {
					RABBITMQ_DEFAULT_USER: "admin",
					RABBITMQ_DEFAULT_PASS: "admin",
				},
				ports: ["5672:5672", "15672:15672"],
				volumes: ["rabbitmq_data:/var/lib/rabbitmq"],
				networks: ["microservices"],
				healthcheck: {
					test: ["CMD", "rabbitmq-diagnostics", "ping"],
					interval: "10s",
					timeout: "5s",
					retries: 5,
				},
			};

			services[options.name].environment.RABBITMQ_URI =
				"amqp://admin:admin@rabbitmq:5672";
		} else if (options.messaging === "kafka") {
			services.zookeeper = {
				image: "confluentinc/cp-zookeeper:7.4.0",
				container_name: `${options.name}-zookeeper`,
				environment: {
					ZOOKEEPER_CLIENT_PORT: 2181,
					ZOOKEEPER_TICK_TIME: 2000,
				},
				networks: ["microservices"],
			};

			services.kafka = {
				image: "confluentinc/cp-kafka:7.4.0",
				container_name: `${options.name}-kafka`,
				depends_on: ["zookeeper"],
				ports: ["9092:9092"],
				environment: {
					KAFKA_BROKER_ID: 1,
					KAFKA_ZOOKEEPER_CONNECT: "zookeeper:2181",
					KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092",
					KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
				},
				networks: ["microservices"],
			};

			services[options.name].environment.KAFKA_BROKERS = "kafka:9092";
		}

		// Add monitoring services if enabled
		if (options.monitoring) {
			services.prometheus = {
				image: "prom/prometheus:latest",
				container_name: `${options.name}-prometheus`,
				restart: "unless-stopped",
				ports: ["9091:9090"],
				volumes: [
					"./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro",
					"prometheus_data:/prometheus",
				],
				command: [
					"--config.file=/etc/prometheus/prometheus.yml",
					"--storage.tsdb.path=/prometheus",
				],
				networks: ["microservices"],
			};

			services.grafana = {
				image: "grafana/grafana:latest",
				container_name: `${options.name}-grafana`,
				restart: "unless-stopped",
				ports: ["3001:3000"],
				environment: {
					GF_SECURITY_ADMIN_PASSWORD: "admin",
				},
				volumes: [
					"grafana_data:/var/lib/grafana",
					"./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro",
					"./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro",
				],
				networks: ["microservices"],
			};
		}

		// Add tracing services if enabled
		if (options.tracing) {
			services.jaeger = {
				image: "jaegertracing/all-in-one:latest",
				container_name: `${options.name}-jaeger`,
				restart: "unless-stopped",
				environment: {
					COLLECTOR_ZIPKIN_HOST_PORT: ":9411",
				},
				ports: [
					"5775:5775/udp",
					"6831:6831/udp",
					"6832:6832/udp",
					"5778:5778",
					"16686:16686",
					"14268:14268",
					"14250:14250",
					"9411:9411",
				],
				networks: ["microservices"],
			};

			services[options.name].environment.JAEGER_ENDPOINT =
				"http://jaeger:14268/api/traces";
		}

		const compose = {
			version: "3.8",
			services,
			networks: {
				microservices: {
					driver: "bridge",
				},
			},
			volumes: {
				node_modules: {},
				...this.getVolumes(options),
			},
		};

		return {
			path: `${options.name}/docker-compose.yml`,
			content: this.formatYaml(compose),
			type: "docker",
		};
	}

	private generateDockerIgnore(options: MicroserviceOptions): GeneratedFile {
		const content = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist
build
*.tsbuildinfo

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode
.idea
*.swp
*.swo
*~
.DS_Store

# Test coverage
coverage
.nyc_output

# Documentation
docs
*.md

# Git
.git
.gitignore

# Docker
Dockerfile
docker-compose*.yml
.dockerignore

# CI/CD
.github
.gitlab-ci.yml
azure-pipelines.yml
Jenkinsfile

# Kubernetes
k8s
*.yaml
*.yml

# Temporary files
tmp
temp
*.tmp
*.temp`;

		return {
			path: `${options.name}/.dockerignore`,
			content,
			type: "config",
		};
	}

	private getDependencies(options: MicroserviceOptions): string[] {
		const deps: string[] = [];

		if (options.database === "postgresql") deps.push("postgres");
		if (options.database === "mongodb") deps.push("mongodb");
		if (options.database === "redis") deps.push("redis");
		if (options.messaging === "rabbitmq") deps.push("rabbitmq");
		if (options.messaging === "kafka") deps.push("kafka");

		return deps;
	}

	private getVolumes(options: MicroserviceOptions): Record<string, any> {
		const volumes: Record<string, any> = {};

		if (options.database === "postgresql") volumes.postgres_data = {};
		if (options.database === "mongodb") volumes.mongodb_data = {};
		if (options.database === "redis") volumes.redis_data = {};
		if (options.messaging === "rabbitmq") volumes.rabbitmq_data = {};
		if (options.monitoring) {
			volumes.prometheus_data = {};
			volumes.grafana_data = {};
		}

		return volumes;
	}

	private formatYaml(obj: any): string {
		// Simple YAML formatter (in production, use a proper YAML library)
		return JSON.stringify(obj, null, 2)
			.replace(/"/g, "")
			.replace(/,$/gm, "")
			.replace(/^\s*{/gm, "")
			.replace(/}\s*$/gm, "")
			.replace(/^\s*\[/gm, "")
			.replace(/\]\s*$/gm, "");
	}
}

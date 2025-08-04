/**
 * Infrastructure Generator System
 * Complete DevOps and deployment infrastructure generation
 * Supports Docker, Kubernetes, CI/CD, Terraform, and cloud platforms
 */

import { TerraformGenerator } from "./terraform.generator.js";

export interface InfrastructureGeneratorOptions {
	readonly type: "docker" | "k8s" | "ci" | "deployment" | "terraform";
	readonly platform:
		| "docker"
		| "kubernetes"
		| "github-actions"
		| "azure-devops"
		| "gitlab-ci"
		| "terraform"
		| "aws"
		| "azure"
		| "gcp";
	readonly environment: "development" | "staging" | "production" | "all";
	readonly services: readonly InfrastructureService[];
	readonly monitoring: boolean;
	readonly logging: boolean;
	readonly security: boolean;
	readonly scaling: boolean;
	readonly backup: boolean;
}

export interface InfrastructureService {
	readonly name: string;
	readonly type:
		| "web"
		| "api"
		| "database"
		| "cache"
		| "queue"
		| "storage"
		| "monitoring";
	readonly image?: string;
	readonly port?: number;
	readonly replicas?: number;
	readonly resources?: ServiceResources;
	readonly environment?: Record<string, string>;
	readonly volumes?: readonly ServiceVolume[];
	readonly dependencies?: readonly string[];
}

export interface ServiceResources {
	readonly cpu: string;
	readonly memory: string;
	readonly storage?: string;
}

// Type definitions for resource limits
type Environment = "development" | "staging" | "production";
type ServiceType = "web" | "api" | "database" | "cache" | "queue" | "storage" | "monitoring";
type ResourceLimits = Record<Environment, Record<ServiceType, ServiceResources>>;

export interface ServiceVolume {
	readonly name: string;
	readonly mountPath: string;
	readonly type: "persistent" | "configMap" | "secret" | "emptyDir";
	readonly size?: string;
}

export interface InfrastructureGeneratorResult {
	readonly success: boolean;
	readonly files: readonly GeneratedInfrastructureFile[];
	readonly commands: readonly string[];
	readonly message: string;
	readonly nextSteps: readonly string[];
}

export interface GeneratedInfrastructureFile {
	readonly path: string;
	readonly content: string;
	readonly type: "dockerfile" | "compose" | "k8s" | "ci" | "config" | "script" | "terraform";
	readonly language: "dockerfile" | "yaml" | "json" | "bash" | "typescript" | "hcl";
}

/**
 * Main infrastructure generator function
 * Generates infrastructure files based on type and platform
 */
export async function generateInfrastructure(
	projectPath: string,
	options: InfrastructureGeneratorOptions,
): Promise<InfrastructureGeneratorResult> {
	try {
		const generator = createInfrastructureGenerator(options.type);
		const result = await generator.generate(projectPath, options);

		return {
			success: true,
			files: result.files,
			commands: result.commands,
			message: `Successfully generated ${options.type} infrastructure for ${options.platform}`,
			nextSteps: result.nextSteps,
		};
	} catch (error) {
		return {
			success: false,
			files: [],
			commands: [],
			message: `Failed to generate infrastructure: ${error instanceof Error ? error.message : "Unknown error"}`,
			nextSteps: ["Check the error message and try again"],
		};
	}
}

/**
 * Infrastructure generator factory
 * Creates appropriate generator based on type
 */
function createInfrastructureGenerator(
	type: InfrastructureGeneratorOptions["type"],
): InfrastructureGenerator {
	switch (type) {
		case "docker":
			return new DockerGenerator();
		case "k8s":
			return new KubernetesGenerator();
		case "ci":
			return new CIGenerator();
		case "deployment":
			return new DeploymentGenerator();
		case "terraform":
			return new TerraformGenerator();
		default:
			throw new Error(`Unsupported infrastructure type: ${type}`);
	}
}

/**
 * Abstract base class for infrastructure generators
 * Provides common functionality for all infrastructure generators
 */
export abstract class InfrastructureGenerator {
	abstract readonly type: string;
	abstract readonly supportedPlatforms: readonly string[];

	abstract generate(
		projectPath: string,
		options: InfrastructureGeneratorOptions,
	): Promise<InfrastructureGeneratorResult>;

	/**
	 * Generate environment-specific configuration
	 */
	protected generateEnvironmentConfig(
		environment: string,
		services: readonly InfrastructureService[],
	): Record<string, string> {
		const config: Record<string, string> = {
			NODE_ENV: environment,
			LOG_LEVEL: environment === "production" ? "info" : "debug",
			PORT: "3000",
		};

		// Add service-specific environment variables
		for (const service of services) {
			if (service.environment) {
				Object.assign(config, service.environment);
			}
		}

		return config;
	}

	/**
	 * Generate resource limits based on environment and service type
	 */
	protected generateResourceLimits(
		environment: "development" | "staging" | "production" | "all",
		serviceType: ServiceType,
	): ServiceResources {
		const baseResources: ResourceLimits = {
			development: {
				web: { cpu: "100m", memory: "128Mi" },
				api: { cpu: "200m", memory: "256Mi" },
				database: { cpu: "500m", memory: "512Mi", storage: "1Gi" },
				cache: { cpu: "100m", memory: "128Mi" },
				queue: { cpu: "100m", memory: "128Mi" },
				storage: { cpu: "100m", memory: "128Mi", storage: "5Gi" },
				monitoring: { cpu: "100m", memory: "128Mi" },
			},
			staging: {
				web: { cpu: "200m", memory: "256Mi" },
				api: { cpu: "500m", memory: "512Mi" },
				database: { cpu: "1000m", memory: "1Gi", storage: "10Gi" },
				cache: { cpu: "200m", memory: "256Mi" },
				queue: { cpu: "200m", memory: "256Mi" },
				storage: { cpu: "200m", memory: "256Mi", storage: "20Gi" },
				monitoring: { cpu: "200m", memory: "256Mi" },
			},
			production: {
				web: { cpu: "500m", memory: "512Mi" },
				api: { cpu: "1000m", memory: "1Gi" },
				database: { cpu: "2000m", memory: "2Gi", storage: "50Gi" },
				cache: { cpu: "500m", memory: "512Mi" },
				queue: { cpu: "500m", memory: "512Mi" },
				storage: { cpu: "500m", memory: "512Mi", storage: "100Gi" },
				monitoring: { cpu: "500m", memory: "512Mi" },
			},
		};

		// Handle 'all' environment by defaulting to production resources
		const targetEnvironment: Environment = environment === "all" ? "production" : environment as Environment;
		
		return (
			baseResources[targetEnvironment]?.[serviceType] || {
				cpu: "100m",
				memory: "128Mi",
			}
		);
	}

	/**
	 * Capitalize string
	 */
	protected capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Convert to kebab-case
	 */
	protected toKebabCase(str: string): string {
		return str
			.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
			.replace(/^-/, "");
	}
}

/**
 * Docker Infrastructure Generator
 * Generates Dockerfiles, docker-compose files, and container configurations
 */
export class DockerGenerator extends InfrastructureGenerator {
	readonly type = "docker";
	readonly supportedPlatforms = ["docker"] as const;

	async generate(
		projectPath: string,
		options: InfrastructureGeneratorOptions,
	): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];
		const commands: string[] = [];

		// Generate Dockerfile for each service
		for (const service of options.services) {
			if (service.type === "web" || service.type === "api") {
				files.push(this.generateDockerfile(service, options));
			}
		}

		// Generate docker-compose files
		files.push(this.generateDockerCompose(options));

		// Generate .dockerignore
		files.push(this.generateDockerIgnore());

		commands.push(
			"docker-compose build",
			"docker-compose up -d",
			"docker-compose logs -f",
		);

		return {
			success: true,
			files,
			commands,
			message: "Docker infrastructure generated successfully",
			nextSteps: [
				"Review generated Dockerfiles",
				"Build Docker images: docker-compose build",
				"Start services: docker-compose up -d",
				"Check service logs: docker-compose logs -f",
			],
		};
	}

	private generateDockerfile(
		service: InfrastructureService,
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `# Multi-stage build for ${service.name}
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE ${service.port || 3000}
ENV PORT ${service.port || 3000}

CMD ["npm", "start"]`;

		return {
			path: `${service.name}/Dockerfile`,
			content,
			type: "dockerfile",
			language: "dockerfile",
		};
	}

	private generateDockerCompose(
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const services: Record<string, unknown> = {};

		for (const service of options.services) {
			services[service.name] = this.generateDockerComposeService(
				service,
				options,
			);
		}

		const compose = {
			version: "3.8",
			services,
			volumes: {
				postgres_data: {},
				redis_data: {},
			},
			networks: {
				xaheen_network: {
					driver: "bridge",
				},
			},
		};

		return {
			path: "docker-compose.yml",
			content: JSON.stringify(compose, null, 2),
			type: "compose",
			language: "yaml",
		};
	}

	private generateDockerComposeService(
		service: InfrastructureService,
		options: InfrastructureGeneratorOptions,
	): Record<string, unknown> {
		const serviceConfig: Record<string, unknown> = {
			networks: ["xaheen_network"],
		};

		switch (service.type) {
			case "web":
			case "api":
				serviceConfig.build = {
					context: `./${service.name}`,
					dockerfile: "Dockerfile",
				};
				serviceConfig.ports = [
					`${service.port || 3000}:${service.port || 3000}`,
				];
				serviceConfig.environment = this.generateEnvironmentConfig(
					options.environment,
					[service],
				);
				break;

			case "database":
				serviceConfig.image = "postgres:15-alpine";
				serviceConfig.environment = {
					POSTGRES_DB: "xaheen",
					POSTGRES_USER: "postgres",
					POSTGRES_PASSWORD: "postgres",
				};
				serviceConfig.ports = ["5432:5432"];
				serviceConfig.volumes = ["postgres_data:/var/lib/postgresql/data"];
				break;

			case "cache":
				serviceConfig.image = "redis:7-alpine";
				serviceConfig.ports = ["6379:6379"];
				serviceConfig.volumes = ["redis_data:/data"];
				break;
		}

		serviceConfig.restart = "unless-stopped";
		return serviceConfig;
	}

	private generateDockerIgnore(): GeneratedInfrastructureFile {
		const content = `node_modules
npm-debug.log*
.env
.env.local
.git
.gitignore
README.md
Dockerfile
.dockerignore
docker-compose*.yml`;

		return {
			path: ".dockerignore",
			content,
			type: "config",
			language: "dockerfile",
		};
	}
}

/**
 * Kubernetes Infrastructure Generator
 * Generates Kubernetes manifests and deployment configurations
 */
export class KubernetesGenerator extends InfrastructureGenerator {
	readonly type = "k8s";
	readonly supportedPlatforms = ["kubernetes"] as const;

	async generate(
		projectPath: string,
		options: InfrastructureGeneratorOptions,
	): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];

		// Generate namespace
		files.push(this.generateNamespace(options));

		// Generate manifests for each service
		for (const service of options.services) {
			files.push(...this.generateServiceManifests(service, options));
		}

		return {
			success: true,
			files,
			commands: ["kubectl apply -f k8s/"],
			message: "Kubernetes infrastructure generated successfully",
			nextSteps: [
				"Review generated Kubernetes manifests",
				"Apply manifests: kubectl apply -f k8s/",
				"Check pod status: kubectl get pods -n xaheen",
			],
		};
	}

	private generateNamespace(
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `apiVersion: v1
kind: Namespace
metadata:
  name: xaheen
  labels:
    name: xaheen
    environment: ${options.environment}`;

		return {
			path: "k8s/namespace.yaml",
			content,
			type: "k8s",
			language: "yaml",
		};
	}

	private generateServiceManifests(
		service: InfrastructureService,
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Generate Deployment
		files.push(this.generateDeployment(service, options));

		// Generate Service
		files.push(this.generateK8sService(service, options));

		return files;
	}

	private generateDeployment(
		service: InfrastructureService,
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const resources =
			service.resources ||
			this.generateResourceLimits(options.environment, service.type);

		const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service.name}
  namespace: xaheen
  labels:
    app: ${service.name}
spec:
  replicas: ${service.replicas || 1}
  selector:
    matchLabels:
      app: ${service.name}
  template:
    metadata:
      labels:
        app: ${service.name}
    spec:
      containers:
      - name: ${service.name}
        image: ${service.image || `${service.name}:latest`}
        ports:
        - containerPort: ${service.port || 3000}
        resources:
          limits:
            cpu: ${resources.cpu}
            memory: ${resources.memory}
          requests:
            cpu: ${resources.cpu}
            memory: ${resources.memory}`;

		return {
			path: `k8s/${service.name}-deployment.yaml`,
			content,
			type: "k8s",
			language: "yaml",
		};
	}

	private generateK8sService(
		service: InfrastructureService,
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `apiVersion: v1
kind: Service
metadata:
  name: ${service.name}-service
  namespace: xaheen
spec:
  selector:
    app: ${service.name}
  ports:
  - port: ${service.port || 3000}
    targetPort: ${service.port || 3000}
  type: ClusterIP`;

		return {
			path: `k8s/${service.name}-service.yaml`,
			content,
			type: "k8s",
			language: "yaml",
		};
	}
}

/**
 * CI/CD Generator
 * Generates CI/CD pipeline configurations
 */
export class CIGenerator extends InfrastructureGenerator {
	readonly type = "ci";
	readonly supportedPlatforms = [
		"github-actions",
		"azure-devops",
		"gitlab-ci",
	] as const;

	async generate(
		projectPath: string,
		options: InfrastructureGeneratorOptions,
	): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.platform) {
			case "github-actions":
				files.push(this.generateGitHubActions(options));
				break;
			case "azure-devops":
				files.push(this.generateAzureDevOps(options));
				break;
			case "gitlab-ci":
				files.push(this.generateGitLabCI(options));
				break;
		}

		return {
			success: true,
			files,
			commands: [],
			message: `CI/CD pipeline generated for ${options.platform}`,
			nextSteps: [
				"Review generated pipeline configuration",
				"Commit and push to trigger pipeline",
				"Configure secrets and environment variables",
			],
		};
	}

	private generateGitHubActions(
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run test
    - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: echo "Deploy to production"`;

		return {
			path: ".github/workflows/ci-cd.yml",
			content,
			type: "ci",
			language: "yaml",
		};
	}

	private generateAzureDevOps(
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `trigger:
- main

pool:
  vmImage: ubuntu-latest

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    - script: npm ci
    - script: npm run test
    - script: npm run build`;

		return {
			path: "azure-pipelines.yml",
			content,
			type: "ci",
			language: "yaml",
		};
	}

	private generateGitLabCI(
		options: InfrastructureGeneratorOptions,
	): GeneratedInfrastructureFile {
		const content = `stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build`;

		return {
			path: ".gitlab-ci.yml",
			content,
			type: "ci",
			language: "yaml",
		};
	}
}

/**
 * Deployment Generator
 * Generates cloud deployment configurations
 */
export class DeploymentGenerator extends InfrastructureGenerator {
	readonly type = "deployment";
	readonly supportedPlatforms = ["aws", "azure", "gcp"] as const;

	async generate(
		projectPath: string,
		options: InfrastructureGeneratorOptions,
	): Promise<InfrastructureGeneratorResult> {
		return {
			success: true,
			files: [],
			commands: [],
			message: "Deployment generator not yet implemented",
			nextSteps: [],
		};
	}
}

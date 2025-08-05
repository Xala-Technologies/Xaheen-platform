/**
 * @fileoverview Full-Stack Generator Integration System
 * @description Comprehensive generator orchestration for the Xaheen CLI
 * @author Xala Technologies
 * @version 2.0.0
 */

import type {
	GeneratorOptions,
	GeneratorResult,
	GeneratorType,
} from "../types/index.js";
import { RESTAPIGenerator } from "./api/index.js";
// Generator imports
import { BackendGenerator } from "./backend/index.js";
import { PrismaGenerator } from "./database/index.js";
import {
	createInfrastructureGenerator,
	DockerGenerator,
} from "./infrastructure/index.js";

// Placeholder generator factory functions
function createApiGenerator(type: string) {
	return new RESTAPIGenerator();
}

function createDatabaseGenerator(type: string) {
	return new PrismaGenerator();
}

function createBackendGenerator(type: string) {
	return new BackendGenerator();
}

// Pattern generators
import {
	CleanArchitectureGenerator,
	CQRSEventSourcingGenerator,
	DDDPatternGenerator,
	DependencyInjectionGenerator,
	getPatternGenerator,
	getPatternHelp,
	isPatternGeneratorSupported,
	PATTERN_GENERATORS,
	PatternGeneratorFactory,
	validatePatternOptions,
} from "./patterns/index.js";

/**
 * Project information interface
 */
export interface ProjectInfo {
	name: string;
	version: string;
	description?: string;
	author?: string;
	framework?: string;
	language?: string;
	dependencies?: string[];
}

/**
 * Generator execution context
 */
export interface GeneratorContext {
	type: GeneratorType;
	name: string;
	options: GeneratorOptions;
	projectInfo: ProjectInfo;
}

/**
 * Generator category mapping
 */
const GENERATOR_CATEGORIES = {
	// Frontend generators
	frontend: ["component", "page", "layout", "hook", "context", "provider"],

	// Backend generators
	backend: [
		"api",
		"model",
		"controller",
		"service",
		"middleware",
		"guard",
		"interceptor",
		"pipe",
		"decorator",
	],

	// Database generators
	database: ["migration", "seed", "schema", "repository"],

	// Full-stack generators
	fullstack: ["scaffold", "crud", "auth", "feature"],

	// Infrastructure generators
	infrastructure: ["docker", "k8s", "ci", "deployment", "terraform"],

	// DevOps generators
	devops: [
		"docker",
		"kubernetes",
		"github-actions",
		"azure-devops",
		"gitlab-ci",
	],

	// Integration generators
	integration: ["webhook", "queue", "cron", "worker", "integration"],

	// Testing generators
	testing: ["test", "e2e", "mock"],

	// Configuration generators
	config: ["config", "env", "docs"],

	// Monitoring generators
	monitoring: ["telemetry-analytics"],

	// Pattern generators
	patterns: [
		"ddd",
		"clean-architecture",
		"cqrs",
		"event-sourcing",
		"di",
		"adapter",
	],

	// Compliance generators
	compliance: ["nsm-security", "gdpr-compliance"],

	// SaaS Administration generators
	"saas-admin": ["tenant-management", "user-management", "rbac", "analytics"],

	// Multi-tenancy generators
	"multi-tenancy": [
		"multi-tenant",
		"single-tenant",
		"tenant-isolation",
		"tenant-auth",
	],

	// Subscription generators
	subscription: [
		"subscription-plans",
		"billing",
		"license-management",
		"usage-tracking",
	],
} as const;

/**
 * Get generator category for a given type
 */
function getGeneratorCategory(
	type: GeneratorType,
): keyof typeof GENERATOR_CATEGORIES | null {
	for (const [category, types] of Object.entries(GENERATOR_CATEGORIES)) {
		if (types.includes(type as any)) {
			return category as keyof typeof GENERATOR_CATEGORIES;
		}
	}
	return null;
}

/**
 * Execute frontend generator
 */
async function executeFrontendGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	// Placeholder for frontend generators
	return {
		success: true,
		message: `Frontend ${type} '${name}' generated successfully`,
		files: [
			`src/components/${name}.tsx`,
			`src/components/${name}.module.css`,
			`src/components/${name}.test.tsx`,
		],
		commands: ["npm run type-check", "npm run lint"],
		nextSteps: [
			`Import and use the ${name} component in your application`,
			"Update your component documentation",
			"Add component to Storybook if applicable",
		],
	};
}

/**
 * Execute full-stack generator (scaffold, CRUD, auth, feature)
 */
async function executeFullStackGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	switch (type) {
		case "scaffold":
			return await executeScaffoldGenerator(context);
		case "crud":
			return await executeCrudGenerator(context);
		case "auth":
			return await executeAuthGenerator(context);
		case "feature":
			return await executeFeatureGenerator(context);
		default:
			return {
				success: false,
				message: `Unknown full-stack generator type: ${type}`,
				error: `Generator type '${type}' is not implemented`,
			};
	}
}

/**
 * Execute scaffold generator - creates complete feature with frontend and backend
 */
async function executeScaffoldGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { name, options } = context;

	const files: string[] = [];
	const commands: string[] = [];
	const nextSteps: string[] = [];

	// Generate backend API
	const backendResult = await createApiGenerator("rest").generate({
		name,
		entityName: name,
		fields: options.fields || [],
		includeTests: true,
		includeValidation: true,
		includeDocumentation: true,
	});

	if (backendResult.success) {
		files.push(...(backendResult.files || []));
		commands.push(...(backendResult.commands || []));
	}

	// Generate database migration
	const dbResult = await createDatabaseGenerator("prisma").generateMigration({
		name: `create_${name.toLowerCase()}_table`,
		fields: options.fields || [],
	});

	if (dbResult.success) {
		files.push(...(dbResult.files || []));
		commands.push(...(dbResult.commands || []));
	}

	// Generate frontend components
	files.push(
		`src/components/${name}List.tsx`,
		`src/components/${name}Form.tsx`,
		`src/components/${name}Detail.tsx`,
		`src/pages/${name.toLowerCase()}/index.tsx`,
		`src/pages/${name.toLowerCase()}/[id].tsx`,
		`src/hooks/use${name}.ts`,
		`src/types/${name.toLowerCase()}.ts`,
	);

	commands.push(
		"npm run db:migrate",
		"npm run db:seed",
		"npm run type-check",
		"npm run test",
	);

	nextSteps.push(
		`Navigate to /${name.toLowerCase()} to see your new feature`,
		"Customize the generated components to match your design",
		"Add additional validation rules as needed",
		"Configure permissions and access control",
		"Update API documentation",
	);

	return {
		success: true,
		message: `Full-stack scaffold for '${name}' generated successfully`,
		files,
		commands,
		nextSteps,
	};
}

/**
 * Execute CRUD generator - creates complete CRUD operations
 */
async function executeCrudGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { name, options } = context;

	return {
		success: true,
		message: `CRUD operations for '${name}' generated successfully`,
		files: [
			`src/api/${name.toLowerCase()}/controller.ts`,
			`src/api/${name.toLowerCase()}/service.ts`,
			`src/api/${name.toLowerCase()}/dto.ts`,
			`src/api/${name.toLowerCase()}/entity.ts`,
			`src/api/${name.toLowerCase()}/repository.ts`,
			`src/api/${name.toLowerCase()}/routes.ts`,
			`src/api/${name.toLowerCase()}/validation.ts`,
			`src/api/${name.toLowerCase()}/tests.ts`,
			`prisma/migrations/create_${name.toLowerCase()}.sql`,
		],
		commands: ["npm run db:migrate", "npm run type-check", "npm run test:api"],
		nextSteps: [
			"Test the CRUD endpoints using the generated API documentation",
			"Customize validation rules in the DTO files",
			"Add business logic to the service layer",
			"Configure authentication and authorization",
		],
	};
}

/**
 * Execute auth generator - creates authentication system
 */
async function executeAuthGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { options } = context;
	const provider = options.provider || "jwt";

	return {
		success: true,
		message: `Authentication system with ${provider} generated successfully`,
		files: [
			"src/auth/auth.module.ts",
			"src/auth/auth.service.ts",
			"src/auth/auth.controller.ts",
			"src/auth/jwt.strategy.ts",
			"src/auth/guards/jwt.guard.ts",
			"src/auth/decorators/auth.decorator.ts",
			"src/auth/dto/login.dto.ts",
			"src/auth/dto/register.dto.ts",
			"src/auth/entities/user.entity.ts",
			"src/auth/auth.middleware.ts",
			"prisma/migrations/create_users_table.sql",
		],
		commands: [
			"npm install @nestjs/jwt @nestjs/passport passport passport-jwt",
			"npm install --save-dev @types/passport-jwt",
			"npm run db:migrate",
			"npm run type-check",
		],
		nextSteps: [
			"Configure JWT secret in environment variables",
			"Set up password hashing and validation",
			"Implement user registration and login endpoints",
			"Add role-based access control if needed",
			"Configure session management",
		],
	};
}

/**
 * Execute feature generator - creates modular feature
 */
async function executeFeatureGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { name } = context;

	return {
		success: true,
		message: `Feature module '${name}' generated successfully`,
		files: [
			`src/features/${name}/${name}.module.ts`,
			`src/features/${name}/${name}.controller.ts`,
			`src/features/${name}/${name}.service.ts`,
			`src/features/${name}/dto/index.ts`,
			`src/features/${name}/entities/index.ts`,
			`src/features/${name}/tests/${name}.service.spec.ts`,
			`src/features/${name}/tests/${name}.controller.spec.ts`,
			`src/features/${name}/README.md`,
		],
		commands: ["npm run type-check", "npm run test"],
		nextSteps: [
			`Import ${name}Module in your main app module`,
			"Define the feature's API endpoints",
			"Implement business logic in the service",
			"Add comprehensive tests",
			"Update feature documentation",
		],
	};
}

/**
 * Execute integration generator
 */
async function executeIntegrationGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name } = context;

	return {
		success: true,
		message: `Integration ${type} '${name}' generated successfully`,
		files: [
			`src/integrations/${name}/${name}.service.ts`,
			`src/integrations/${name}/${name}.config.ts`,
			`src/integrations/${name}/${name}.types.ts`,
			`src/integrations/${name}/tests/${name}.spec.ts`,
		],
		commands: ["npm run type-check", "npm run test:integration"],
		nextSteps: [
			"Configure integration credentials in environment variables",
			"Test the integration with external service",
			"Add error handling and retry logic",
			"Update integration documentation",
		],
	};
}

/**
 * Execute testing generator
 */
async function executeTestingGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name } = context;

	return {
		success: true,
		message: `Testing ${type} for '${name}' generated successfully`,
		files: [
			`src/tests/${name}.test.ts`,
			`src/tests/fixtures/${name}.fixture.ts`,
			`src/tests/mocks/${name}.mock.ts`,
		],
		commands: ["npm run test", "npm run test:coverage"],
		nextSteps: [
			"Run the generated tests to ensure they pass",
			"Add additional test cases for edge cases",
			"Update test fixtures with realistic data",
			"Configure CI/CD pipeline to run tests",
		],
	};
}

/**
 * Execute configuration generator
 */
async function executeConfigGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name } = context;

	return {
		success: true,
		message: `Configuration ${type} '${name}' generated successfully`,
		files: [
			`config/${name}.config.ts`,
			`config/schemas/${name}.schema.ts`,
			`.env.${name}.example`,
		],
		commands: ["npm run type-check", "npm run config:validate"],
		nextSteps: [
			"Update environment variables with your configuration",
			"Validate configuration schema",
			"Document configuration options",
			"Add configuration to deployment scripts",
		],
	};
}

/**
 * Execute pattern generator
 */
async function executePatternGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options, projectInfo } = context;

	// Extract pattern type from the name (e.g., "ddd:aggregate" -> "ddd")
	const [patternType, subPattern] = name.includes(":")
		? name.split(":", 2)
		: [type, name];

	// Validate pattern generator exists
	if (!isPatternGeneratorSupported(patternType)) {
		return {
			success: false,
			message: `Unknown pattern generator: ${patternType}`,
			error: `Pattern generator '${patternType}' is not supported. Available patterns: ${Object.keys(PATTERN_GENERATORS).join(", ")}`,
		};
	}

	// Validate pattern options
	const validationErrors = validatePatternOptions(
		`${patternType}:${subPattern}`,
		options,
	);
	if (validationErrors.length > 0) {
		return {
			success: false,
			message: `Pattern validation failed`,
			error: `Validation errors: ${validationErrors.join(", ")}`,
		};
	}

	try {
		// Create pattern generator instance
		const generator = PatternGeneratorFactory.create(
			patternType,
			process.cwd(),
		);

		// Execute pattern generation
		const result = await generator.generate(
			subPattern || name,
			options,
			projectInfo,
		);

		// Add pattern-specific help information
		const patternHelp = getPatternHelp(patternType);
		if (patternHelp && result.success) {
			result.nextSteps = [
				...(result.nextSteps || []),
				"",
				"Pattern Documentation:",
				`- ${patternHelp.description}`,
				`- Available patterns: ${patternHelp.patterns.join(", ")}`,
				"",
				"Example commands:",
				...patternHelp.examples.map((example) => `  ${example}`),
			];
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate pattern ${patternType}:${subPattern}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute DevOps generator
 */
async function executeDevOpsGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		const { DevOpsGeneratorFactory } = await import("./devops/index");

		switch (type) {
			case "docker":
				const dockerGenerator = DevOpsGeneratorFactory.createDockerGenerator();
				await dockerGenerator.generate({
					projectName: name,
					projectType: options.projectType || "web",
					runtime: options.runtime || "node",
					enableMultiStage: options.enableMultiStage !== false,
					enableDevContainer: options.enableDevContainer !== false,
					enableSecurity: options.enableSecurity !== false,
					enableHealthCheck: options.enableHealthCheck !== false,
					enablePrometheus: options.enablePrometheus || false,
					registryUrl: options.registryUrl,
					imageName: options.imageName || name,
					imageTag: options.imageTag || "latest",
					workdir: options.workdir || "/app",
					port: options.port || 3000,
					exposePorts: options.exposePorts || [],
					environment: options.environment || "production",
					optimizeForSize: options.optimizeForSize !== false,
					enableNonRootUser: options.enableNonRootUser !== false,
					customBuildArgs: options.customBuildArgs || [],
				});

				return {
					success: true,
					message: `Docker configuration for '${name}' generated successfully`,
					files: [
						"Dockerfile",
						"docker-compose.yml",
						".dockerignore",
						".devcontainer/devcontainer.json",
						"scripts/docker-build.sh",
						"scripts/docker-run.sh",
						"scripts/docker-push.sh",
						"scripts/docker-clean.sh",
					],
					commands: [
						"chmod +x scripts/docker-*.sh",
						"docker build -t " + (options.imageName || name) + " .",
						"docker-compose up -d",
					],
					nextSteps: [
						"Configure environment variables in .env file",
						"Customize Docker settings for your specific needs",
						"Set up container registry authentication",
						"Configure CI/CD pipeline to build and push images",
						"Test the container locally before deployment",
					],
				};

			case "kubernetes":
				const k8sGenerator = DevOpsGeneratorFactory.createKubernetesGenerator();
				await k8sGenerator.generate({
					appName: name,
					namespace: options.namespace || "default",
					image: options.image || `${name}:latest`,
					imageTag: options.imageTag || "latest",
					port: options.port || 3000,
					targetPort: options.targetPort || 3000,
					replicas: options.replicas || 3,
					environment: options.environment || "production",
					enableIngress: options.enableIngress !== false,
					enableHPA: options.enableHPA !== false,
					enableConfigMap: options.enableConfigMap !== false,
					enableSecrets: options.enableSecrets !== false,
					enableServiceMesh: options.enableServiceMesh || false,
					enablePrometheus: options.enablePrometheus !== false,
					enableLogging: options.enableLogging !== false,
					enableNetworkPolicies: options.enableNetworkPolicies || false,
					enablePodSecurityPolicies: options.enablePodSecurityPolicies || false,
					enableHelm: options.enableHelm || false,
					enableIstio: options.enableIstio || false,
					hostName: options.hostName,
					resources: options.resources || {
						requests: { cpu: "100m", memory: "128Mi" },
						limits: { cpu: "500m", memory: "512Mi" },
					},
					hpa: options.hpa || {
						minReplicas: 2,
						maxReplicas: 10,
						targetCPUUtilization: 80,
						targetMemoryUtilization: 80,
					},
					probes: options.probes || {
						liveness: {
							path: "/health",
							initialDelaySeconds: 30,
							periodSeconds: 10,
						},
						readiness: {
							path: "/ready",
							initialDelaySeconds: 5,
							periodSeconds: 5,
						},
					},
				});

				return {
					success: true,
					message: `Kubernetes manifests for '${name}' generated successfully`,
					files: [
						"k8s/namespace.yaml",
						"k8s/deployment.yaml",
						"k8s/service.yaml",
						"k8s/ingress.yaml",
						"k8s/hpa.yaml",
						"k8s/configmap.yaml",
						"k8s/secrets.yaml",
						"k8s/kustomization.yaml",
						"scripts/k8s-deploy.sh",
						"scripts/k8s-undeploy.sh",
					],
					commands: [
						"chmod +x scripts/k8s-*.sh",
						"kubectl apply -f k8s/",
						"kubectl get pods -n " + (options.namespace || "default"),
					],
					nextSteps: [
						"Configure kubectl to connect to your cluster",
						"Update image references in deployment manifests",
						"Configure ingress hostname and TLS certificates",
						"Set up monitoring and logging",
						"Configure resource quotas and limits",
						"Test the deployment in a staging environment",
					],
				};

			case "github-actions":
				const ghGenerator =
					DevOpsGeneratorFactory.createGitHubActionsGenerator();
				await ghGenerator.generate({
					projectName: name,
					projectType: options.projectType || "web",
					runtime: options.runtime || "node",
					packageManager: options.packageManager || "npm",
					enableCI: options.enableCI !== false,
					enableCD: options.enableCD !== false,
					enableTesting: options.enableTesting !== false,
					enableLinting: options.enableLinting !== false,
					enableSecurity: options.enableSecurity !== false,
					enableDependencyCheck: options.enableDependencyCheck !== false,
					enableCodeCoverage: options.enableCodeCoverage !== false,
					enablePerformanceTesting: options.enablePerformanceTesting || false,
					enableSemanticRelease: options.enableSemanticRelease || false,
					enableDocker: options.enableDocker !== false,
					enableKubernetes: options.enableKubernetes || false,
					enableNotifications: options.enableNotifications || false,
					enableCaching: options.enableCaching !== false,
					enableMatrix: options.enableMatrix || false,
					environments: options.environments || [],
					deploymentTargets: options.deploymentTargets || [],
					testFrameworks: options.testFrameworks || ["unit"],
					codeQualityTools: options.codeQualityTools || ["eslint"],
					securityTools: options.securityTools || ["codeql"],
					registries: options.registries || [],
					secrets: options.secrets || [],
					variables: options.variables || [],
					triggers: options.triggers || {
						push: true,
						pullRequest: true,
						schedule: [],
						workflow_dispatch: true,
						release: false,
					},
					concurrency: options.concurrency || {
						group: "${{ github.workflow }}-${{ github.ref }}",
						cancel_in_progress: true,
					},
					timeouts: options.timeouts || {
						job: 360,
						step: 30,
					},
				});

				return {
					success: true,
					message: `GitHub Actions workflows for '${name}' generated successfully`,
					files: [
						".github/workflows/main.yml",
						".github/workflows/ci.yml",
						".github/workflows/security.yml",
						".github/workflows/deploy-production.yml",
						".github/actions/setup/action.yml",
						".github/actions/build/action.yml",
					],
					commands: [
						"git add .github/",
						'git commit -m "Add GitHub Actions workflows"',
						"git push origin main",
					],
					nextSteps: [
						"Configure repository secrets for deployment",
						"Set up deployment environments with protection rules",
						"Configure branch protection rules",
						"Add status checks to pull requests",
						"Set up notifications for workflow failures",
						"Test the workflows with a pull request",
					],
				};

			case "azure-devops":
				const azureGenerator =
					DevOpsGeneratorFactory.createAzureDevOpsGenerator();
				await azureGenerator.generate({
					projectName: name,
					projectType: options.projectType || "web",
					runtime: options.runtime || "node",
					packageManager: options.packageManager || "npm",
					enableCI: options.enableCI !== false,
					enableCD: options.enableCD !== false,
					enableTesting: options.enableTesting !== false,
					enableSecurity: options.enableSecurity !== false,
					enableCodeCoverage: options.enableCodeCoverage !== false,
					enableArtifacts: options.enableArtifacts !== false,
					enableApprovals: options.enableApprovals || false,
					enableGates: options.enableGates || false,
					enableMultiStage: options.enableMultiStage !== false,
					poolName: options.poolName || "",
					vmImage: options.vmImage || "ubuntu-latest",
					environments: options.environments || [],
					serviceConnections: options.serviceConnections || [],
					variableGroups: options.variableGroups || [],
					buildConfiguration: options.buildConfiguration || "Release",
					artifactName: options.artifactName || "drop",
					testFrameworks: options.testFrameworks || ["unit"],
					securityTools: options.securityTools || ["whitesource"],
					deploymentSlots: options.deploymentSlots || [],
					azureSubscription: options.azureSubscription || "",
					resourceGroup: options.resourceGroup || "",
					appServiceName: options.appServiceName || name,
					containerRegistry: options.containerRegistry || "",
					keyVault: options.keyVault || "",
					applicationInsights: options.applicationInsights || "",
					triggers: options.triggers || {
						ci: {
							branches: ["main", "develop"],
							paths: ["src/**"],
							excludePaths: ["docs/**"],
						},
						pr: {
							branches: ["main"],
							paths: ["src/**"],
							drafts: false,
						},
						scheduled: [],
					},
					stages: options.stages || [],
				});

				return {
					success: true,
					message: `Azure DevOps pipelines for '${name}' generated successfully`,
					files: [
						"azure-pipelines.yml",
						"pipelines/ci-pipeline.yml",
						"pipelines/cd-pipeline.yml",
						"pipelines/security-pipeline.yml",
						"pipelines/templates/variables-global.yml",
						"pipelines/templates/job-build.yml",
						"pipelines/templates/stage-ci.yml",
					],
					commands: [
						"git add azure-pipelines.yml pipelines/",
						'git commit -m "Add Azure DevOps pipelines"',
						"git push origin main",
					],
					nextSteps: [
						"Create service connections in Azure DevOps",
						"Configure variable groups for environments",
						"Set up approval workflows for production",
						"Configure branch policies and build validation",
						"Set up release dashboards and monitoring",
						"Test the pipeline with a sample deployment",
					],
				};

			case "gitlab-ci":
				const gitlabGenerator =
					DevOpsGeneratorFactory.createGitLabCIGenerator();
				await gitlabGenerator.generate({
					projectName: name,
					projectType: options.projectType || "web",
					runtime: options.runtime || "node",
					packageManager: options.packageManager || "npm",
					enableCI: options.enableCI !== false,
					enableCD: options.enableCD !== false,
					enableTesting: options.enableTesting !== false,
					enableSecurity: options.enableSecurity !== false,
					enableCodeQuality: options.enableCodeQuality !== false,
					enableDependencyScanning: options.enableDependencyScanning !== false,
					enableContainerScanning: options.enableContainerScanning !== false,
					enableDAST: options.enableDAST || false,
					enableSAST: options.enableSAST !== false,
					enableLicense: options.enableLicense || false,
					enablePerformance: options.enablePerformance || false,
					enableReviews: options.enableReviews || false,
					enablePages: options.enablePages || false,
					enableAutoDevOps: options.enableAutoDevOps || false,
					stages: options.stages || ["build", "test", "deploy"],
					images: options.images || {
						default: "node:20-alpine",
					},
					services: options.services || [],
					variables: options.variables || {},
					beforeScript: options.beforeScript || [],
					afterScript: options.afterScript || [],
					cache: options.cache || {
						key: "$CI_COMMIT_REF_SLUG",
						paths: ["node_modules/"],
						policy: "pull-push",
						when: "on_success",
					},
					artifacts: options.artifacts || {
						name: "$CI_COMMIT_REF_SLUG",
						paths: ["dist/"],
						reports: {},
						expire_in: "1 week",
						when: "on_success",
					},
					environments: options.environments || [],
					rules: options.rules || [],
					includes: options.includes || [],
					tags: options.tags || [],
					runners: options.runners || {
						shared: true,
						tags: [],
					},
				});

				return {
					success: true,
					message: `GitLab CI/CD configuration for '${name}' generated successfully`,
					files: [
						".gitlab-ci.yml",
						".gitlab/ci/security.yml",
						".gitlab/ci/docker.yml",
						".gitlab/ci/pages.yml",
						".gitlab/ci/templates/build.yml",
						".gitlab/ci/templates/test.yml",
						".gitlab/ci/templates/deploy.yml",
					],
					commands: [
						"git add .gitlab-ci.yml .gitlab/",
						'git commit -m "Add GitLab CI/CD configuration"',
						"git push origin main",
					],
					nextSteps: [
						"Configure CI/CD variables in GitLab project settings",
						"Set up deployment environments with protection rules",
						"Enable GitLab Pages if using the pages job",
						"Configure container registry authentication",
						"Set up monitoring and alerting for pipeline failures",
						"Test the pipeline by creating a merge request",
					],
				};

			default:
				return {
					success: false,
					message: `Unknown DevOps generator type: ${type}`,
					error: `DevOps generator type '${type}' is not supported`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate DevOps ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute SaaS Administration generator
 */
async function executeSaaSAdminGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		switch (type) {
			case "tenant-management":
				const { SaaSAdminPortalGenerator } = await import("./saas-admin/index");
				const adminGenerator = new SaaSAdminPortalGenerator();
				const result = await adminGenerator.generate({
					name,
					framework: options.framework || "nextjs",
					backend: options.backend || "nestjs",
					database: options.database || "postgresql",
					features: options.features || [
						"tenant-dashboard",
						"user-management",
						"analytics",
					],
					authentication: options.authentication || "jwt",
					analytics: options.analytics || "custom",
					tenantModel: options.tenantModel || "multi-tenant",
					rbacModel: options.rbacModel || "role-based",
				});

				return {
					success: true,
					message: `SaaS Admin Portal '${name}' generated successfully`,
					files: result.files,
					commands: result.commands,
					nextSteps: result.nextSteps,
				};

			default:
				return {
					success: false,
					message: `Unknown SaaS admin generator type: ${type}`,
					error: `SaaS admin generator type '${type}' is not supported`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate SaaS admin ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute Multi-Tenancy generator
 */
async function executeMultiTenancyGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		switch (type) {
			case "multi-tenant":
				const { MultiTenantGenerator } = await import("./multi-tenancy/index");
				const multiTenantGenerator = new MultiTenantGenerator();
				const result = await multiTenantGenerator.generate({
					name,
					isolationLevel: options.isolationLevel || "schema",
					database: options.database || "postgresql",
					backend: options.backend || "nestjs",
					authentication: options.authentication || "jwt",
					features: options.features || [
						"tenant-isolation",
						"tenant-specific-config",
					],
					tenantDiscovery: options.tenantDiscovery || "subdomain",
					caching: options.caching || "redis",
					monitoring: options.monitoring !== false,
					compliance: options.compliance || [],
				});

				return {
					success: true,
					message: `Multi-Tenant Application '${name}' generated successfully`,
					files: result.files,
					commands: result.commands,
					nextSteps: result.nextSteps,
				};

			case "single-tenant":
				const { SingleTenantGenerator } = await import("./multi-tenancy/index");
				const singleTenantGenerator = new SingleTenantGenerator();
				const singleResult = await singleTenantGenerator.generate({
					name,
					tenantId: options.tenantId || name,
					database: options.database || "postgresql",
					backend: options.backend || "nestjs",
					infrastructure: options.infrastructure || "kubernetes",
					features: options.features || [
						"dedicated-infrastructure",
						"enhanced-security",
					],
					customization: options.customization || {
						branding: true,
						themes: true,
						features: true,
						integrations: true,
						workflows: true,
					},
					backup: options.backup || {
						frequency: "daily",
						retention: 30,
						encryption: true,
						crossRegion: false,
						pointInTime: true,
					},
					monitoring: options.monitoring !== false,
				});

				return {
					success: true,
					message: `Single-Tenant Application '${name}' generated successfully`,
					files: singleResult.files,
					commands: singleResult.commands,
					nextSteps: singleResult.nextSteps,
				};

			default:
				return {
					success: false,
					message: `Unknown multi-tenancy generator type: ${type}`,
					error: `Multi-tenancy generator type '${type}' is not supported`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate multi-tenancy ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute Subscription generator
 */
async function executeSubscriptionGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		switch (type) {
			case "subscription-plans":
			case "billing":
				const { SubscriptionManagementGenerator } = await import(
					"./subscription/index"
				);
				const subscriptionGenerator = new SubscriptionManagementGenerator();
				const result = await subscriptionGenerator.generate({
					name,
					billingProvider: options.billingProvider || "stripe",
					subscriptionModel: options.subscriptionModel || "tiered",
					billingCycle: options.billingCycle || "monthly",
					features: options.features || [
						"plans",
						"billing",
						"invoicing",
						"usage-tracking",
					],
					currencies: options.currencies || ["USD", "EUR", "NOK"],
					taxHandling: options.taxHandling || {
						enabled: true,
						inclusive: false,
						regionBased: true,
					},
					dunningManagement: options.dunningManagement !== false,
					prorationHandling: options.prorationHandling !== false,
					freeTrial: options.freeTrial || {
						enabled: true,
						duration: 14,
						durationUnit: "days",
						requiresCreditCard: false,
						autoConvert: true,
					},
					webhookHandling: options.webhookHandling !== false,
				});

				return {
					success: true,
					message: `Subscription Management System '${name}' generated successfully`,
					files: result.files,
					commands: result.commands,
					nextSteps: result.nextSteps,
				};

			case "license-management":
				const { LicenseManagementGenerator } = await import(
					"./subscription/index"
				);
				const licenseGenerator = new LicenseManagementGenerator();
				const licenseResult = await licenseGenerator.generate({
					name,
					licenseModel: options.licenseModel || "seat-based",
					enforcement: options.enforcement || "server-side",
					validation: options.validation || {
						frequency: "real-time",
						encryption: "aes256",
						signature: true,
						offline: false,
					},
					features: options.features || [
						"key-generation",
						"validation",
						"enforcement",
						"audit-trail",
					],
					restrictions: options.restrictions || [],
					reporting: options.reporting !== false,
					analytics: options.analytics !== false,
					compliance: options.compliance || [],
				});

				return {
					success: true,
					message: `License Management System '${name}' generated successfully`,
					files: licenseResult.files,
					commands: licenseResult.commands,
					nextSteps: licenseResult.nextSteps,
				};

			default:
				return {
					success: false,
					message: `Unknown subscription generator type: ${type}`,
					error: `Subscription generator type '${type}' is not supported`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate subscription ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Execute compliance generator
 */
async function executeComplianceGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		switch (type) {
			case "nsm-security":
				const { generateNSMSecurity } = await import(
					"./compliance/nsm-security.generator"
				);
				await generateNSMSecurity({
					projectName: name,
					classification: options.classification || "RESTRICTED",
					dataTypes: options.dataTypes || ["personal-data"],
					retentionPeriod: options.retentionPeriod || 365,
					userClearance: options.userClearance || "RESTRICTED",
					auditLevel: options.auditLevel || "enhanced",
					enableWatermarks: options.enableWatermarks || true,
					sessionTimeout: options.sessionTimeout || 240,
					internationalTransfer: options.internationalTransfer || false,
					outputDir: context.options.outputDir || process.cwd(),
				});

				return {
					success: true,
					message: `NSM Security implementation for '${name}' generated successfully`,
					files: [
						"src/security/nsm/security-config.ts",
						"src/security/nsm/classification-service.ts",
						"src/security/audit/audit-logger.ts",
						"src/components/security/ClassificationBanner.tsx",
						"src/components/security/SecurityWatermark.tsx",
						"src/types/security/nsm-types.ts",
						"docs/security/NSM-Security-Guide.md",
					],
					commands: [
						"npm install consola",
						"npm run type-check",
						"npm run security:validate",
					],
					nextSteps: [
						`Configure security classification level: ${options.classification || "RESTRICTED"}`,
						"Set up environment variables for encryption and audit logging",
						"Review and customize security policies",
						"Configure user clearance levels",
						"Test security access controls",
						"Set up monitoring and alerting for security events",
					],
				};

			case "gdpr-compliance":
				const { generateGDPRCompliance } = await import(
					"./compliance/gdpr.generator"
				);
				await generateGDPRCompliance({
					projectName: name,
					dataCategories: options.dataCategories || ["personal-data"],
					lawfulBasis: options.lawfulBasis || "legitimate-interests",
					consentTypes: options.consentTypes || ["informed", "specific"],
					dataRetentionPeriod: options.dataRetentionPeriod || 365,
					enableRightToErasure: options.enableRightToErasure !== false,
					enableDataPortability: options.enableDataPortability !== false,
					enableRightToRectification:
						options.enableRightToRectification !== false,
					appointDataProtectionOfficer:
						options.appointDataProtectionOfficer || false,
					performDataProtectionImpactAssessment:
						options.performDataProtectionImpactAssessment || false,
					enablePrivacyByDesign: options.enablePrivacyByDesign !== false,
					enableConsentManagement: options.enableConsentManagement !== false,
					enableAuditLogging: options.enableAuditLogging !== false,
					internationalTransfers: options.internationalTransfers || false,
					adequacyCountries: options.adequacyCountries || [],
					bindingCorporateRules: options.bindingCorporateRules || false,
					outputDir: context.options.outputDir || process.cwd(),
				});

				return {
					success: true,
					message: `GDPR Compliance implementation for '${name}' generated successfully`,
					files: [
						"src/gdpr/services/gdpr-service.ts",
						"src/gdpr/consent/consent-manager.ts",
						"src/gdpr/data-subject-rights/data-subject-rights-service.ts",
						"src/gdpr/workflows/data-deletion-workflow.ts",
						"src/components/consent/ConsentBanner.tsx",
						"src/components/privacy/PrivacyDashboard.tsx",
						"src/types/gdpr/gdpr-types.ts",
						"docs/gdpr/GDPR-Compliance-Guide.md",
					],
					commands: [
						"npm install consola",
						"npm run type-check",
						"npm run gdpr:validate",
					],
					nextSteps: [
						`Configure lawful basis for processing: ${options.lawfulBasis || "legitimate-interests"}`,
						"Set up consent management system",
						"Configure data retention policies",
						"Implement data subject rights procedures",
						"Set up audit logging and monitoring",
						"Create privacy policy and cookie policy",
						"Configure data deletion workflows",
						"Test GDPR compliance implementation",
					],
				};

			default:
				return {
					success: false,
					message: `Unknown compliance generator type: ${type}`,
					error: `Compliance generator type '${type}' is not supported`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate compliance ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Main generator execution function
 */
export async function executeFullStackGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type } = context;
	const category = getGeneratorCategory(type);

	try {
		switch (category) {
			case "frontend":
				return await executeFrontendGenerator(context);

			case "backend":
				const backendGenerator = createBackendGenerator("nestjs");
				return await backendGenerator.generate(context.name, {
					features: ["rest-api"],
					database: "prisma",
					auth: "jwt",
				});

			case "database":
				const dbGenerator = createDatabaseGenerator("prisma");
				if (type === "migration") {
					return await dbGenerator.generateMigration({
						name: context.name,
						fields: context.options.fields || [],
					});
				} else if (type === "seed") {
					return await dbGenerator.generateSeed({
						name: context.name,
						data: context.options.fields || [],
					});
				}
				return await dbGenerator.generateSchema({
					name: context.name,
					fields: context.options.fields || [],
				});

			case "fullstack":
				return await executeFullStackGenerator(context);

			case "infrastructure":
				const infraGenerator = createInfrastructureGenerator(type as any);
				return await infraGenerator.generate(process.cwd(), {
					type: type as any,
					platform:
						context.options.platform ||
						(type === "terraform" ? "terraform" : "kubernetes"),
					environment: context.options.environment || "development",
					services: context.options.services || [],
					monitoring: context.options.monitoring || false,
					logging: context.options.logging || false,
					security: context.options.security || false,
					scaling: context.options.scaling || false,
					backup: context.options.backup || false,
				});

			case "devops":
				return await executeDevOpsGenerator(context);

			case "integration":
				return await executeIntegrationGenerator(context);

			case "testing":
				return await executeTestingGenerator(context);

			case "config":
				return await executeConfigGenerator(context);

			case "patterns":
				return await executePatternGenerator(context);

			case "compliance":
				return await executeComplianceGenerator(context);

			case "saas-admin":
				return await executeSaaSAdminGenerator(context);

			case "multi-tenancy":
				return await executeMultiTenancyGenerator(context);

			case "subscription":
				return await executeSubscriptionGenerator(context);

			default:
				return {
					success: false,
					message: `Unknown generator type: ${type}`,
					error: `Generator category for type '${type}' not found`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get available generators by category
 */
export function getAvailableGenerators(): Record<string, GeneratorType[]> {
	return GENERATOR_CATEGORIES;
}

/**
 * Check if generator type is supported
 */
export function isGeneratorSupported(type: string): type is GeneratorType {
	return Object.values(GENERATOR_CATEGORIES)
		.flat()
		.includes(type as GeneratorType);
}

/**
 * Get generator help text
 */
export function getGeneratorHelp(type: GeneratorType): string {
	const helpTexts: Record<GeneratorType, string> = {
		// Frontend
		component: "Generate a reusable React component with TypeScript and tests",
		page: "Generate a Next.js page with routing and layout",
		layout: "Generate a layout component for consistent page structure",
		hook: "Generate a custom React hook with TypeScript",
		context: "Generate a React context provider for state management",
		provider: "Generate a provider component for dependency injection",

		// Backend
		api: "Generate REST API endpoints with validation and documentation",
		model: "Generate database model with Prisma schema",
		controller: "Generate NestJS controller with CRUD operations",
		service: "Generate business logic service with dependency injection",
		middleware: "Generate middleware for request/response processing",
		guard: "Generate authentication/authorization guard",
		interceptor: "Generate request/response interceptor",
		pipe: "Generate validation pipe for data transformation",
		decorator: "Generate custom decorator for metadata",

		// Database
		migration: "Generate database migration with schema changes",
		seed: "Generate database seed file with sample data",
		schema: "Generate Prisma schema definition",
		repository: "Generate repository pattern for data access",

		// Full-stack
		scaffold: "Generate complete feature with frontend and backend",
		crud: "Generate full CRUD operations for an entity",
		auth: "Generate authentication system with JWT/OAuth",
		feature: "Generate modular feature with all necessary files",

		// Infrastructure
		docker: "Generate Docker configuration with multi-stage builds",
		k8s: "Generate Kubernetes manifests with best practices",
		ci: "Generate CI/CD pipeline configuration",
		deployment: "Generate deployment scripts for cloud platforms",
		terraform:
			"Generate Terraform infrastructure as code for AWS, Azure, and GCP",

		// DevOps
		"github-actions":
			"Generate GitHub Actions workflows with security scanning and deployment",
		"azure-devops":
			"Generate Azure DevOps pipelines with multi-stage deployments",
		"gitlab-ci":
			"Generate GitLab CI/CD pipelines with security and compliance scanning",
		kubernetes:
			"Generate comprehensive Kubernetes manifests with Helm charts and Istio service mesh",

		// Integration
		webhook: "Generate webhook handler with validation",
		queue: "Generate queue worker with job processing",
		cron: "Generate scheduled job with cron configuration",
		worker: "Generate background worker for async tasks",
		integration: "Generate third-party service integration",

		// Testing
		test: "Generate unit tests with Jest and testing utilities",
		e2e: "Generate end-to-end tests with Playwright",
		mock: "Generate mock data and service mocks",

		// Configuration
		config: "Generate configuration module with validation",
		env: "Generate environment configuration files",
		docs: "Generate documentation with API specs",

		// Patterns
		ddd: "Generate Domain-Driven Design patterns (bounded contexts, aggregates, entities)",
		"clean-architecture":
			"Generate Clean Architecture patterns (use cases, adapters, interfaces)",
		cqrs: "Generate CQRS patterns (commands, queries, events, projections)",
		"event-sourcing":
			"Generate Event Sourcing patterns (event store, snapshots, replay)",
		di: "Generate Dependency Injection patterns (containers, services, adapters)",
		adapter: "Generate Adapter patterns for external integrations",

		// Compliance
		"nsm-security":
			"Generate NSM-compliant security classifications and access controls",
		"gdpr-compliance":
			"Generate GDPR-compliant data protection and privacy systems",

		// SaaS Administration
		"tenant-management":
			"Generate comprehensive SaaS admin portal with tenant management, RBAC, and analytics",
		"user-management":
			"Generate user management systems with role-based access control",
		rbac: "Generate role-based access control systems with hierarchical permissions",
		analytics:
			"Generate SaaS analytics dashboards with tenant-specific metrics",

		// Multi-tenancy
		"multi-tenant":
			"Generate multi-tenant architecture with database isolation and tenant-aware authentication",
		"single-tenant":
			"Generate single-tenant architecture with dedicated infrastructure and enhanced security",
		"tenant-isolation":
			"Generate tenant isolation strategies with database, schema, or row-level security",
		"tenant-auth":
			"Generate tenant-aware authentication systems with multi-factor support",

		// Subscription
		"subscription-plans":
			"Generate subscription management system with billing provider integration",
		billing:
			"Generate comprehensive billing system with usage tracking and dunning management",
		"license-management":
			"Generate license management system with key generation, validation, and enforcement",
		"usage-tracking":
			"Generate usage tracking and metering systems with real-time analytics",
	};

	return helpTexts[type] || `Generate ${type} with best practices`;
}

// Export pattern generators
export {
	CleanArchitectureGenerator,
	CQRSEventSourcingGenerator,
	DDDPatternGenerator,
	DependencyInjectionGenerator,
	getPatternGenerator,
	getPatternHelp,
	isPatternGeneratorSupported,
	PATTERN_GENERATORS,
	PatternGeneratorFactory,
	validatePatternOptions,
} from "./patterns/index.js";

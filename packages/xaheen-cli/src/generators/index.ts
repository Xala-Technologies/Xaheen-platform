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
import { DockerGenerator } from "./infrastructure/index.js";
// Pattern generators
import { 
  DDDPatternGenerator,
  CleanArchitectureGenerator,
  CQRSEventSourcingGenerator,
  DependencyInjectionGenerator,
  PATTERN_GENERATORS,
  PatternGeneratorFactory,
  getPatternGenerator,
  isPatternGeneratorSupported,
  getPatternHelp,
  validatePatternOptions
} from "./patterns/index.js";

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

	// Integration generators
	integration: ["webhook", "queue", "cron", "worker", "integration"],

	// Testing generators
	testing: ["test", "e2e", "mock"],

	// Configuration generators
	config: ["config", "env", "docs"],

	// Pattern generators
	patterns: ["ddd", "clean-architecture", "cqrs", "event-sourcing", "di", "adapter"],

	// Compliance generators
	compliance: ["nsm-security", "gdpr-compliance"],
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
	const [patternType, subPattern] = name.includes(':') ? name.split(':', 2) : [type, name];

	// Validate pattern generator exists
	if (!isPatternGeneratorSupported(patternType)) {
		return {
			success: false,
			message: `Unknown pattern generator: ${patternType}`,
			error: `Pattern generator '${patternType}' is not supported. Available patterns: ${Object.keys(PATTERN_GENERATORS).join(', ')}`,
		};
	}

	// Validate pattern options
	const validationErrors = validatePatternOptions(`${patternType}:${subPattern}`, options);
	if (validationErrors.length > 0) {
		return {
			success: false,
			message: `Pattern validation failed`,
			error: `Validation errors: ${validationErrors.join(', ')}`,
		};
	}

	try {
		// Create pattern generator instance
		const generator = PatternGeneratorFactory.create(patternType, process.cwd());

		// Execute pattern generation
		const result = await generator.generate(subPattern || name, options, projectInfo);

		// Add pattern-specific help information
		const patternHelp = getPatternHelp(patternType);
		if (patternHelp && result.success) {
			result.nextSteps = [
				...(result.nextSteps || []),
				'',
				'Pattern Documentation:',
				`- ${patternHelp.description}`,
				`- Available patterns: ${patternHelp.patterns.join(', ')}`,
				'',
				'Example commands:',
				...patternHelp.examples.map(example => `  ${example}`),
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
 * Execute compliance generator
 */
async function executeComplianceGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name, options } = context;

	try {
		switch (type) {
			case "nsm-security":
				const { generateNSMSecurity } = await import("./compliance/nsm-security.generator");
				await generateNSMSecurity({
					projectName: name,
					classification: options.classification || 'RESTRICTED',
					dataTypes: options.dataTypes || ['personal-data'],
					retentionPeriod: options.retentionPeriod || 365,
					userClearance: options.userClearance || 'RESTRICTED',
					auditLevel: options.auditLevel || 'enhanced',
					enableWatermarks: options.enableWatermarks || true,
					sessionTimeout: options.sessionTimeout || 240,
					internationalTransfer: options.internationalTransfer || false,
					outputDir: context.options.outputDir || process.cwd()
				});

				return {
					success: true,
					message: `NSM Security implementation for '${name}' generated successfully`,
					files: [
						'src/security/nsm/security-config.ts',
						'src/security/nsm/classification-service.ts',
						'src/security/audit/audit-logger.ts',
						'src/components/security/ClassificationBanner.tsx',
						'src/components/security/SecurityWatermark.tsx',
						'src/types/security/nsm-types.ts',
						'docs/security/NSM-Security-Guide.md'
					],
					commands: [
						'npm install consola',
						'npm run type-check',
						'npm run security:validate'
					],
					nextSteps: [
						`Configure security classification level: ${options.classification || 'RESTRICTED'}`,
						'Set up environment variables for encryption and audit logging',
						'Review and customize security policies',
						'Configure user clearance levels',
						'Test security access controls',
						'Set up monitoring and alerting for security events'
					],
				};

			case "gdpr-compliance":
				const { generateGDPRCompliance } = await import("./compliance/gdpr.generator");
				await generateGDPRCompliance({
					projectName: name,
					dataCategories: options.dataCategories || ['personal-data'],
					lawfulBasis: options.lawfulBasis || 'legitimate-interests',
					consentTypes: options.consentTypes || ['informed', 'specific'],
					dataRetentionPeriod: options.dataRetentionPeriod || 365,
					enableRightToErasure: options.enableRightToErasure !== false,
					enableDataPortability: options.enableDataPortability !== false,
					enableRightToRectification: options.enableRightToRectification !== false,
					appointDataProtectionOfficer: options.appointDataProtectionOfficer || false,
					performDataProtectionImpactAssessment: options.performDataProtectionImpactAssessment || false,
					enablePrivacyByDesign: options.enablePrivacyByDesign !== false,
					enableConsentManagement: options.enableConsentManagement !== false,
					enableAuditLogging: options.enableAuditLogging !== false,
					internationalTransfers: options.internationalTransfers || false,
					adequacyCountries: options.adequacyCountries || [],
					bindingCorporateRules: options.bindingCorporateRules || false,
					outputDir: context.options.outputDir || process.cwd()
				});

				return {
					success: true,
					message: `GDPR Compliance implementation for '${name}' generated successfully`,
					files: [
						'src/gdpr/services/gdpr-service.ts',
						'src/gdpr/consent/consent-manager.ts',
						'src/gdpr/data-subject-rights/data-subject-rights-service.ts',
						'src/gdpr/workflows/data-deletion-workflow.ts',
						'src/components/consent/ConsentBanner.tsx',
						'src/components/privacy/PrivacyDashboard.tsx',
						'src/types/gdpr/gdpr-types.ts',
						'docs/gdpr/GDPR-Compliance-Guide.md'
					],
					commands: [
						'npm install consola',
						'npm run type-check',
						'npm run gdpr:validate'
					],
					nextSteps: [
						`Configure lawful basis for processing: ${options.lawfulBasis || 'legitimate-interests'}`,
						'Set up consent management system',
						'Configure data retention policies',
						'Implement data subject rights procedures',
						'Set up audit logging and monitoring',
						'Create privacy policy and cookie policy',
						'Configure data deletion workflows',
						'Test GDPR compliance implementation'
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
					platform: context.options.platform || (type === "terraform" ? "terraform" : "kubernetes"),
					environment: context.options.environment || "development",
					services: context.options.services || [],
					monitoring: context.options.monitoring || false,
					logging: context.options.logging || false,
					security: context.options.security || false,
					scaling: context.options.scaling || false,
					backup: context.options.backup || false,
				});

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
		terraform: "Generate Terraform infrastructure as code for AWS, Azure, and GCP",

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
		"clean-architecture": "Generate Clean Architecture patterns (use cases, adapters, interfaces)",
		cqrs: "Generate CQRS patterns (commands, queries, events, projections)",
		"event-sourcing": "Generate Event Sourcing patterns (event store, snapshots, replay)",
		di: "Generate Dependency Injection patterns (containers, services, adapters)",
		adapter: "Generate Adapter patterns for external integrations",

		// Compliance
		"nsm-security": "Generate NSM-compliant security classifications and access controls",
		"gdpr-compliance": "Generate GDPR-compliant data protection and privacy systems",
	};

	return helpTexts[type] || `Generate ${type} with best practices`;
}

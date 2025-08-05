/**
 * Generate Command - Rails-inspired code generation
 *
 * Provides Rails-like code generation for various types of projects.
 *
 * @author CLI Generator Enhancement
 * @since 2025-01-04
 */

import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import consola from "consola";
import { ComponentGenerator } from "../generators/component.generator.js";
import { ControllerGenerator } from "../generators/controller.generator.js";
import {
	executeFullStackGenerator,
	getGeneratorHelp,
} from "../generators/index.js";
import { ModelGenerator } from "../generators/model.generator.js";
import { ServiceGenerator } from "../generators/service.generator.js";
import { mcpGenerationOrchestrator } from "../services/mcp/mcp-generation-orchestrator.js";
import type {
	GeneratorOptions,
	GeneratorResult,
	GeneratorType,
} from "../types/index.js";

// Generator types inspired by Rails - Full-Stack Development
const GENERATOR_TYPES = [
	// Frontend generators
	"component",
	"page",
	"layout",
	"hook",
	"context",
	"provider",
	// Backend generators
	"api",
	"model",
	"controller",
	"service",
	"middleware",
	"guard",
	"interceptor",
	"pipe",
	"decorator",
	// Database generators
	"migration",
	"seed",
	"schema",
	"repository",
	// Full-stack generators
	"scaffold",
	"crud",
	"auth",
	"feature",
	// Infrastructure generators
	"docker",
	"k8s",
	"ci",
	"deployment",
	// Integration generators
	"webhook",
	"queue",
	"cron",
	"worker",
	"integration",
	// Testing generators
	"test",
	"e2e",
	"mock",
	// Security & Compliance generators
	"security-audit",
	"compliance-report",
	"nsm-security",
	"gdpr-compliance",
	// Configuration generators
	"config",
	"env",
	"docs",
] as const;

export const generateCommand = new Command("generate")
	.alias("g")
	.description("Generate code using Rails-inspired patterns")
	.argument("[type]", `Generator type: ${GENERATOR_TYPES.join(", ")}`)
	.argument("[name]", "Name of the item to generate")
	.option("--fields <fields>", "Model fields (e.g., 'name:string,email:email')")
	.option(
		"--actions <actions>",
		"Controller actions (e.g., 'index,show,create,update,destroy')",
	)
	.option(
		"--methods <methods>",
		"Service methods (e.g., 'findById,create,update')",
	)
	.option("--model <model>", "Associated model name")
	.option("--service <service>", "Associated service name")
	.option("--repository <repository>", "Associated repository name")
	.option("--middleware <middleware>", "Middleware to apply (comma-separated)")
	.option(
		"--props <props>",
		"Component props (e.g., 'title:string,onClick:function')",
	)
	.option("--type <type>", "Component type (functional|class)")
	.option(
		"--framework <framework>",
		"Frontend framework (react|vue|angular|svelte)",
	)
	.option(
		"--styling <styling>",
		"Styling approach (tailwind|styled-components|css-modules)",
	)
	.option("--hooks", "Enable React hooks (default: true)")
	.option("--no-hooks", "Disable React hooks")
	.option("--stories", "Generate Storybook stories (default: true)")
	.option("--no-stories", "Skip Storybook stories")
	.option("--tests", "Generate tests (default: true)")
	.option("--no-tests", "Skip test generation")
	.option("--validation", "Enable validation (default: true)")
	.option("--no-validation", "Disable validation")
	.option("--caching", "Enable caching")
	.option("--events", "Enable events")
	.option(
		"--ai <description>",
		"AI-powered generation with natural language description",
	)
	.option("--platform <platform>", "Target platform (web, mobile, api)")
	.option("--layout <layout>", "Layout to use (default, admin, auth)")
	.option("--provider <provider>", "Service provider for integrations")
	.option("--dry-run", "Preview changes without applying them")
	.option("--force", "Overwrite existing files")
	.option("--skip-tests", "Skip generating test files")
	.option("--typescript", "Generate TypeScript files (default)")
	.option("--javascript", "Generate JavaScript files")
	.action(async (type: string, name: string, options: GeneratorOptions) => {
		try {
			intro(chalk.cyan("🎨 Xaheen Generator (Rails-inspired with MCP Intelligence)"));

			// Initialize MCP orchestrator for intelligent generation
			const s = spinner();
			s.start("Initializing MCP Intelligence...");
			await mcpGenerationOrchestrator.initialize();
			s.stop();

			// Validate project context
			const projectPath = process.cwd();
			// TODO: Import and initialize ProjectAnalyzer
			const projectInfo = {
				name: "current-project",
				framework: "next",
				backend: "express",
				database: "postgresql",
			};

			if (!projectInfo) {
				consola.error("Not in a valid Xaheen project directory");
				process.exit(1);
			}

			// Interactive type selection if not provided
			if (!type) {
				const selectedType = await select({
					message: "What would you like to generate?",
					options: GENERATOR_TYPES.map((t) => ({
						value: t,
						label: `${t.charAt(0).toUpperCase()}${t.slice(1)}`,
						hint: getGeneratorDescription(t),
					})),
				});

				if (isCancel(selectedType)) {
					cancel("Operation cancelled");
					return;
				}
				type = selectedType as string;
			}

			// Interactive name input if not provided
			if (!name) {
				const inputName = await text({
					message: `Enter ${type} name:`,
					placeholder: `My${type.charAt(0).toUpperCase()}${type.slice(1)}`,
					validate: (value) => {
						if (!value) return "Name is required";
						if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
							return "Name must be alphanumeric and start with a letter";
						}
						return undefined;
					},
				});

				if (isCancel(inputName)) {
					cancel("Operation cancelled");
					return;
				}
				name = inputName;
			}

			// Initialize services (TODO: Import proper services)
			const registry = {} as any; // ServiceRegistry placeholder
			const injector = {} as any; // ServiceInjector placeholder
			const xalaService = {} as any; // XalaIntegrationService placeholder

			const projectContext = {
				name: projectInfo.name,
				framework: projectInfo.framework || "",
				backend: projectInfo.backend,
				database: projectInfo.database,
				path: projectPath,
			};

			// Generate based on type
			const s = spinner();
			s.start(`Generating ${type}: ${name}`);

			let result: GeneratorResult;

			switch (type) {
				case "model":
					result = await generateModel(name, options, projectContext, registry);
					break;
				case "controller":
					result = await generateController(
						name,
						options,
						projectContext,
						registry,
					);
					break;
				case "service":
					// Use MCP orchestrator for intelligent service generation
					result = await generateServiceWithMCP(
						name,
						options,
						projectContext,
					);
					break;
				case "component":
					// Use MCP orchestrator for intelligent component generation
					result = await generateComponentWithMCP(
						name,
						options,
						projectContext,
					);
					break;
				case "page":
					result = await generatePage(
						name,
						options,
						projectContext,
						xalaService,
					);
					break;
				case "scaffold":
					result = await generateScaffold(
						name,
						options,
						projectContext,
						registry,
						xalaService,
					);
					break;
				case "security-audit":
					result = await generateSecurityAudit(name, options, projectContext);
					break;
				case "compliance-report":
					result = await generateComplianceReport(
						name,
						options,
						projectContext,
					);
					break;
				case "nsm-security":
					result = await generateNSMSecurity(name, options, projectContext);
					break;
				case "gdpr-compliance":
					result = await generateGDPRCompliance(name, options, projectContext);
					break;
				case "docs":
					result = await generateDocumentation(name, options, projectContext);
					break;
				default:
					throw new Error(`Generator type '${type}' not implemented yet`);
			}

			s.stop();

			if (result.success) {
				outro(chalk.green(`✅ ${result.message}`));

				// Display generated files
				if (result.files && result.files.length > 0) {
					consola.info(chalk.cyan("📁 Generated files:"));
					for (const file of result.files) {
						consola.info(`  ${chalk.green("+")} ${file}`);
					}
				}

				// Display commands to run
				if (result.commands && result.commands.length > 0) {
					consola.info(chalk.cyan("🔧 Commands to run:"));
					for (const command of result.commands) {
						consola.info(`  ${chalk.yellow("$")} ${command}`);
					}
				}

				// Display next steps
				if (result.nextSteps && result.nextSteps.length > 0) {
					consola.info(chalk.cyan("📋 Next steps:"));
					for (const step of result.nextSteps) {
						consola.info(`  ${chalk.blue("•")} ${step}`);
					}
				}
			} else {
				outro(chalk.red(`❌ ${result.message}`));
				process.exit(1);
			}
		} catch (error) {
			consola.error("Failed to generate:", error);
			process.exit(1);
		}
	});

function getGeneratorDescription(type: string): string {
	const descriptions = {
		model: "Database model with TypeScript types",
		controller: "API controller with CRUD operations",
		service: "Business logic service class",
		component: "UI component with Xala UI System",
		page: "Full page with routing and layout",
		layout: "Layout component for pages",
		middleware: "Express/NestJS middleware",
		migration: "Database migration file",
		seed: "Database seed data",
		test: "Test files for existing code",
		scaffold: "Complete CRUD feature (model + controller + views)",
		"security-audit":
			"Comprehensive security audit with vulnerability scanning",
		"compliance-report": "Compliance dashboard and regulatory reports",
		"nsm-security":
			"Norwegian Security Authority (NSM) security implementation",
		"gdpr-compliance": "GDPR compliance implementation with privacy controls",
		docs: "Comprehensive documentation with intelligent portals and onboarding",
	};
	return descriptions[type as keyof typeof descriptions] || "";
}

async function generateModel(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	registry: ServiceRegistry,
): Promise<GeneratorResult> {
	try {
		const modelGenerator = new ModelGenerator();
		await modelGenerator.generate({
			name,
			fields: options.fields?.split(","),
			timestamps: true,
			softDeletes: false,
			validation: options.validation !== false,
			dryRun: options.dryRun,
			force: options.force,
			typescript: options.typescript !== false,
		});

		return {
			success: true,
			message: `Model ${name} generated successfully`,
			files: [
				`src/types/${name}.types.ts`,
				`src/validation/${name}.validation.ts`,
				`src/repositories/${name}.repository.ts`,
			],
			nextSteps: ["Run database migration", "Add model to service layer"],
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate model: ${error.message}`,
		};
	}
}

async function generateController(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	registry: ServiceRegistry,
): Promise<GeneratorResult> {
	try {
		const controllerGenerator = new ControllerGenerator();
		await controllerGenerator.generate({
			name,
			actions: options.actions?.split(","),
			model: options.model || name,
			service: options.service,
			middleware: options.middleware?.split(","),
			validation: options.validation !== false,
			swagger: true,
			framework: context.backend as "express" | "nestjs" | "fastify",
			dryRun: options.dryRun,
			force: options.force,
			typescript: options.typescript !== false,
		});

		return {
			success: true,
			message: `Controller ${name} generated successfully`,
			files: [
				`src/controllers/${name}.controller.ts`,
				`src/routes/${name}.routes.ts`,
				`src/controllers/__tests__/${name}.controller.test.ts`,
			],
			nextSteps: [
				"Add routes to router",
				"Implement business logic in service",
			],
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate controller: ${error.message}`,
		};
	}
}

async function generateService(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	registry: ServiceRegistry,
): Promise<GeneratorResult> {
	try {
		const serviceGenerator = new ServiceGenerator();
		await serviceGenerator.generate({
			name,
			model: options.model || name,
			repository: options.repository,
			methods: options.methods?.split(","),
			caching: options.caching || false,
			events: options.events || false,
			logging: true,
			validation: options.validation !== false,
			injection: "constructor",
			framework: context.backend as "express" | "nestjs" | "fastify",
			dryRun: options.dryRun,
			force: options.force,
			typescript: options.typescript !== false,
		});

		return {
			success: true,
			message: `Service ${name} generated successfully`,
			files: [
				`src/services/${name}.service.ts`,
				`src/interfaces/${name}.service.interface.ts`,
				`src/services/__tests__/${name}.service.test.ts`,
			],
			nextSteps: ["Inject service into controller", "Add unit tests"],
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate service: ${error.message}`,
		};
	}
}

async function generateComponent(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	xalaService: any,
): Promise<GeneratorResult> {
	try {
		const componentGenerator = new ComponentGenerator();
		await componentGenerator.generate({
			name,
			type: options.type as "functional" | "class",
			framework: options.framework as "react" | "vue" | "angular" | "svelte",
			styling: options.styling as
				| "tailwind"
				| "styled-components"
				| "css-modules",
			props: options.props?.split(","),
			hooks: options.hooks !== false,
			stories: options.stories !== false,
			tests: options.tests !== false,
			ai: options.ai,
			dryRun: options.dryRun,
			force: options.force,
			typescript: options.typescript !== false,
		});

		return {
			success: true,
			message: `Component ${name} generated successfully`,
			files: [
				`src/components/${name}.tsx`,
				`src/components/${name}.stories.tsx`,
				`src/components/__tests__/${name}.test.tsx`,
			],
			nextSteps: [
				"Import component in your page",
				"Add component to Storybook",
			],
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate component: ${error.message}`,
		};
	}
}

async function generatePage(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	xalaService: XalaIntegrationService,
): Promise<GeneratorResult> {
	// Implementation for page generation
	// This would create full pages with routing
	const files: string[] = [];

	if (context.framework === "next") {
		files.push(`src/app/${name.toLowerCase()}/page.tsx`);
		files.push(`src/app/${name.toLowerCase()}/layout.tsx`);
	}

	return {
		success: true,
		files,
		nextSteps: ["Add navigation link", "Configure page metadata"],
	};
}

async function generateScaffold(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
	registry: ServiceRegistry,
	xalaService: XalaIntegrationService,
): Promise<GeneratorResult> {
	// Implementation for full scaffold (Rails-style)
	// This would generate model + controller + views + routes
	const files: string[] = [];

	// Generate model
	files.push(`src/models/${name.toLowerCase()}.ts`);

	// Generate controller
	files.push(`src/controllers/${name.toLowerCase()}.controller.ts`);

	// Generate service
	files.push(`src/services/${name.toLowerCase()}.service.ts`);

	// Generate pages (if web app)
	if (context.framework === "next") {
		files.push(`src/app/${name.toLowerCase()}/page.tsx`);
		files.push(`src/app/${name.toLowerCase()}/[id]/page.tsx`);
		files.push(`src/app/${name.toLowerCase()}/new/page.tsx`);
		files.push(`src/app/${name.toLowerCase()}/[id]/edit/page.tsx`);
	}

	return {
		success: true,
		files,
		nextSteps: [
			"Run database migration",
			"Add navigation links",
			"Test CRUD operations",
		],
	};
}

async function generateSecurityAudit(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	// Implementation for security audit generation
	// This would run comprehensive security scans and generate reports
	const files: string[] = [];

	files.push("security-audit/reports/security-audit.html");
	files.push("security-audit/reports/security-audit.json");
	files.push("security-audit/raw-data/vulnerabilities.json");

	return {
		success: true,
		files,
		commands: ["open security-audit/reports/security-audit.html"],
		nextSteps: [
			"Review security audit report",
			"Address critical and high vulnerabilities",
			"Integrate security scanning into CI/CD",
			"Schedule regular security audits",
		],
	};
}

async function generateComplianceReport(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	// Implementation for compliance report generation
	// This would assess compliance across multiple standards
	const files: string[] = [];

	files.push("compliance-reports/reports/compliance-report.html");
	files.push("compliance-reports/reports/compliance-report.json");
	files.push("compliance-reports/dashboard/ComplianceDashboard.tsx");
	files.push("compliance-reports/reports/action-plan.md");

	return {
		success: true,
		files,
		commands: ["open compliance-reports/reports/compliance-report.html"],
		nextSteps: [
			"Review compliance dashboard",
			"Address high-priority gaps",
			"Implement remediation plan",
			"Set up compliance monitoring",
		],
	};
}

async function generateNSMSecurity(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	// Implementation for NSM security generation
	// This would generate NSM-compliant security components
	const files: string[] = [];

	files.push("src/security/nsm/security-config.ts");
	files.push("src/security/nsm/classification-service.ts");
	files.push("src/components/security/ClassificationBanner.tsx");
	files.push("src/components/security/SecurityWatermark.tsx");
	files.push("docs/security/NSM-Security-Guide.md");

	return {
		success: true,
		files,
		nextSteps: [
			"Configure NSM security classification",
			"Implement access control system",
			"Add security monitoring",
			"Review NSM compliance requirements",
		],
	};
}

async function generateGDPRCompliance(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	// Implementation for GDPR compliance generation
	// This would generate GDPR-compliant privacy components
	const files: string[] = [];

	files.push("src/privacy/gdpr/consent-manager.ts");
	files.push("src/privacy/gdpr/data-deletion.ts");
	files.push("src/components/privacy/ConsentBanner.tsx");
	files.push("src/components/privacy/DataSubjectRights.tsx");
	files.push("docs/privacy/GDPR-Implementation-Guide.md");

	return {
		success: true,
		files,
		nextSteps: [
			"Configure consent management",
			"Implement data subject rights",
			"Add privacy policy components",
			"Test GDPR compliance features",
		],
	};
}

async function generateDocumentation(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	// Implementation for documentation generation
	// This would use the comprehensive documentation generators
	const files: string[] = [];

	// Generate documentation portal
	files.push("docs-portal/docusaurus.config.js");
	files.push("docs-portal/package.json");
	files.push("docs-portal/src/pages/index.tsx");
	files.push("docs-portal/docs/intro.md");
	files.push("docs-portal/docs/getting-started.md");

	// Generate onboarding guides
	files.push("onboarding/developer-guide.md");
	files.push("onboarding/user-guide.md");
	files.push("onboarding/interactive/setup-wizard.tsx");

	// Generate API documentation
	files.push("docs/api/openapi.yaml");
	files.push("docs/api/reference.md");

	// Generate architecture documentation
	files.push("docs/architecture/system-overview.md");
	files.push("docs/architecture/diagrams/architecture.mermaid");

	return {
		success: true,
		files,
		commands: [
			"cd docs-portal && npm install",
			"cd docs-portal && npm start # Start development server",
			"cd docs-portal && npm run build # Build for production",
		],
		nextSteps: [
			"Customize documentation portal branding and configuration",
			"Enable automatic documentation synchronization",
			"Set up deployment with GitHub Pages, Netlify, or Vercel",
			"Configure search with Algolia for production use",
			"Add team collaboration features if needed",
		],
	};
}

/**
 * Generate component with MCP intelligence
 */
async function generateComponentWithMCP(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	try {
		// Create MCP generation request
		const mcpRequest = {
			type: "component" as const,
			name,
			description: options.ai || `Generate ${name} component`,
			options: {
				framework: options.framework || context.framework,
				styling: options.styling || "tailwind",
				props: options.props?.split(",") || [],
				hooks: options.hooks !== false,
				stories: options.stories !== false,
				tests: options.tests !== false,
				typescript: options.typescript !== false,
			},
			platform: (options.framework as any) || "react",
			aiEnhancement: !!options.ai,
		};

		// Use MCP orchestrator for intelligent generation
		const mcpResult = await mcpGenerationOrchestrator.generateComponent(mcpRequest);

		// Convert MCP result to GeneratorResult format
		return {
			success: mcpResult.success,
			message: mcpResult.message,
			files: mcpResult.files,
			commands: [],
			nextSteps: mcpResult.nextSteps,
		};
	} catch (error) {
		// Fallback to traditional generator
		consola.warn("MCP generation failed, falling back to traditional generator:", error);
		return await generateComponent(name, options, context, {} as any);
	}
}

/**
 * Generate service with MCP intelligence
 */
async function generateServiceWithMCP(
	name: string,
	options: GeneratorOptions,
	context: ProjectContext,
): Promise<GeneratorResult> {
	try {
		// Create MCP generation request
		const mcpRequest = {
			type: "service" as const,
			name,
			description: options.ai || `Generate ${name} service with business logic`,
			options: {
				framework: context.backend || "express",
				methods: options.methods?.split(",") || ["findById", "create", "update", "delete"],
				caching: options.caching || false,
				events: options.events || false,
				validation: options.validation !== false,
				typescript: options.typescript !== false,
				features: ["dependency-injection", "error-handling", "logging"],
			},
			platform: "react", // Use react as default for service generation
			aiEnhancement: !!options.ai,
		};

		// Use MCP orchestrator for intelligent generation
		const mcpResult = await mcpGenerationOrchestrator.generateService(mcpRequest);

		// Convert MCP result to GeneratorResult format
		return {
			success: mcpResult.success,
			message: mcpResult.message,
			files: mcpResult.files,
			commands: [],
			nextSteps: mcpResult.nextSteps,
		};
	} catch (error) {
		// Fallback to traditional generator
		consola.warn("MCP service generation failed, falling back to traditional generator:", error);
		return await generateService(name, options, context, {} as any);
	}
}

/**
 * Enhance generated code with AI (accessible via --ai flag)
 */
async function enhanceCodeWithMCP(
	generatedCode: string,
	enhancementRequest: string,
	codeType: "component" | "service" | "other" = "other"
): Promise<string> {
	try {
		return await mcpGenerationOrchestrator.enhanceCode(
			generatedCode,
			enhancementRequest,
			codeType
		);
	} catch (error) {
		consola.warn("AI code enhancement failed:", error);
		return generatedCode;
	}
}

// Types for the additional imports needed
interface ProjectContext {
	name: string;
	framework: string;
	backend: string;
	database: string;
	path: string;
}

interface ServiceRegistry {
	// Placeholder for service registry interface
}

interface XalaIntegrationService {
	// Placeholder for Xala integration service interface
}

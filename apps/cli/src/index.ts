import { intro, log } from "@clack/prompts";
import { consola } from "consola";
import pc from "picocolors";
import { createCli, trpcServer } from "trpc-cli";
import z from "zod";
import {
	addAddonsHandler,
	createProjectHandler,
} from "./helpers/project-generation/command-handlers";
import {
	AddonsSchema,
	APISchema,
	BackendSchema,
	DatabaseSchema,
	DatabaseSetupSchema,
	ExamplesSchema,
	FrontendSchema,
	ORMSchema,
	PackageManagerSchema,
	ProjectNameSchema,
	RuntimeSchema,
	WebDeploySchema,
	// Enhanced schemas
	UISystemSchema,
	ComplianceSchema,
	LanguageSchema,
	AuthProviderSchema,
	IntegrationSchema,
	DocumentServiceSchema,
} from "./types";
import { getLatestCLIVersion } from "./utils/get-latest-cli-version";
import { openUrl } from "./utils/open-url";
import { renderTitle } from "./utils/render-title";
import { displaySponsors, fetchSponsors } from "./utils/sponsors";

const t = trpcServer.initTRPC.create();

const router = t.router({
	init: t.procedure
		.meta({
			description: "Create a new Xaheen project with enhanced enterprise features",
			default: true,
			negateBooleans: true,
		})
		.input(
			z.tuple([
				ProjectNameSchema.optional(),
				z.object({
					yes: z
						.boolean()
						.optional()
						.default(false)
						.describe("Use default configuration"),
					
					// Core configuration
					database: DatabaseSchema.optional(),
					orm: ORMSchema.optional(),
					auth: z.boolean().optional().default(false)
						.describe("Enable basic authentication"),
					frontend: z.array(FrontendSchema).optional(),
					addons: z.array(AddonsSchema).optional(),
					examples: z.array(ExamplesSchema).optional(),
					git: z.boolean().optional().default(true),
					packageManager: PackageManagerSchema.optional(),
					install: z.boolean().optional().default(true),
					dbSetup: DatabaseSetupSchema.optional(),
					backend: BackendSchema.optional(),
					runtime: RuntimeSchema.optional(),
					api: APISchema.optional(),
					webDeploy: WebDeploySchema.optional(),
					
					// Enhanced enterprise features - Story 3.2
					ui: UISystemSchema.optional().default("default")
						.describe("UI design system - default or xala"),
					compliance: ComplianceSchema.optional().default("none")
						.describe("Compliance level - none, gdpr, or norwegian"),
					locales: z.array(LanguageSchema).optional().default(["en"])
						.describe("Supported languages for internationalization"),
					primaryLocale: LanguageSchema.optional().default("en")
						.describe("Primary language for the application"),
					authProviders: z.array(AuthProviderSchema).optional().default([])
						.describe("Authentication providers to configure"),
					integrations: z.array(IntegrationSchema).optional().default([])
						.describe("External integrations to enable"),
					documents: z.array(DocumentServiceSchema).optional().default([])
						.describe("Document services to configure"),
					mfa: z.boolean().optional().default(false)
						.describe("Enable multi-factor authentication"),
					encryption: z.boolean().optional().default(false)
						.describe("Enable data encryption features"),
					audit: z.boolean().optional().default(false)
						.describe("Enable audit logging"),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [projectName, options] = input;
			const combinedInput = {
				projectName,
				...options,
			};
			await createProjectHandler(combinedInput);
		}),
		
	add: t.procedure
		.meta({
			description:
				"Add features, addons, or configurations to an existing Xaheen project",
		})
		.input(
			z.tuple([
				z.object({
					// Core add options
					addons: z.array(AddonsSchema).optional().default([]),
					webDeploy: WebDeploySchema.optional(),
					projectDir: z.string().optional(),
					install: z
						.boolean()
						.optional()
						.default(false)
						.describe("Install dependencies after adding features"),
					packageManager: PackageManagerSchema.optional(),
					
					// Enhanced add options
					ui: UISystemSchema.optional()
						.describe("Add or upgrade UI system"),
					compliance: ComplianceSchema.optional()
						.describe("Add compliance features"),
					locales: z.array(LanguageSchema).optional()
						.describe("Add language support"),
					authProviders: z.array(AuthProviderSchema).optional()
						.describe("Add authentication providers"),
					integrations: z.array(IntegrationSchema).optional()
						.describe("Add external integrations"),
					documents: z.array(DocumentServiceSchema).optional()
						.describe("Add document services"),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [options] = input;
			await addAddonsHandler(options);
		}),
		
	// Individual generation commands - Story 3.3
	component: t.procedure
		.meta({ description: "Generate a new component with Xaheen standards" })
		.input(
			z.tuple([
				z.string().describe("Component name"),
				z.object({
					type: z.enum(["functional", "class", "hook", "provider"]).optional().default("functional"),
					ui: UISystemSchema.optional().default("default"),
					compliance: ComplianceSchema.optional().default("none"),
					outputPath: z.string().optional(),
					typescript: z.boolean().optional().default(true),
					testing: z.boolean().optional().default(true),
					storybook: z.boolean().optional().default(false),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating component: ${name} with options:`, options);
			consola.warn("Component generation not yet implemented - coming in Story 3.3");
		}),
		
	page: t.procedure
		.meta({ description: "Generate a new page with routing and layout" })
		.input(
			z.tuple([
				z.string().describe("Page name"),
				z.object({
					route: z.string().optional(),
					layout: z.string().optional(),
					auth: z.boolean().optional().default(false),
					outputPath: z.string().optional(),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating page: ${name} with options:`, options);
			consola.warn("Page generation not yet implemented - coming in Story 3.3");
		}),
		
	model: t.procedure
		.meta({ description: "Generate a data model with database integration" })
		.input(
			z.tuple([
				z.string().describe("Model name"),
				z.object({
					type: z.enum(["entity", "dto", "schema", "interface"]).optional().default("entity"),
					database: DatabaseSchema.optional(),
					orm: ORMSchema.optional(),
					outputPath: z.string().optional(),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating model: ${name} with options:`, options);
			consola.warn("Model generation not yet implemented - coming in Story 3.3");
		}),
		
	layout: t.procedure
		.meta({ description: "Generate a layout component with responsive design" })
		.input(
			z.tuple([
				z.string().describe("Layout name"),
				z.object({
					type: z.enum(["app", "page", "component"]).optional().default("page"),
					ui: UISystemSchema.optional().default("default"),
					outputPath: z.string().optional(),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating layout: ${name} with options:`, options);
			consola.warn("Layout generation not yet implemented - coming in Story 3.3");
		}),
		
	hook: t.procedure
		.meta({ description: "Generate a custom React hook" })
		.input(
			z.tuple([
				z.string().describe("Hook name"),
				z.object({
					outputPath: z.string().optional(),
					typescript: z.boolean().optional().default(true),
					testing: z.boolean().optional().default(true),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating hook: ${name} with options:`, options);
			consola.warn("Hook generation not yet implemented - coming in Story 3.3");
		}),
		
	service: t.procedure
		.meta({ description: "Generate a service class or utility" })
		.input(
			z.tuple([
				z.string().describe("Service name"),
				z.object({
					type: z.enum(["class", "function", "api"]).optional().default("class"),
					outputPath: z.string().optional(),
					typescript: z.boolean().optional().default(true),
					testing: z.boolean().optional().default(true),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating service: ${name} with options:`, options);
			consola.warn("Service generation not yet implemented - coming in Story 3.3");
		}),
		
	feature: t.procedure
		.meta({ description: "Generate a complete feature with components, pages, and services" })
		.input(
			z.tuple([
				z.string().describe("Feature name"),
				z.object({
					includeComponents: z.boolean().optional().default(true),
					includePages: z.boolean().optional().default(true),
					includeServices: z.boolean().optional().default(true),
					includeTests: z.boolean().optional().default(true),
					ui: UISystemSchema.optional().default("default"),
					outputPath: z.string().optional(),
					overwrite: z.boolean().optional().default(false),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [name, options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Generating feature: ${name} with options:`, options);
			consola.warn("Feature generation not yet implemented - coming in Story 3.3");
		}),
		
	validate: t.procedure
		.meta({ description: "Validate project compliance and code quality" })
		.input(
			z.tuple([
				z.object({
					projectDir: z.string().optional(),
					compliance: ComplianceSchema.optional(),
					fix: z.boolean().optional().default(false),
					report: z.boolean().optional().default(true),
				}),
			]),
		)
		.mutation(async ({ input }) => {
			const [options] = input;
			// Implementation will be added in Story 3.3
			consola.info(`Validating project with options:`, options);
			consola.warn("Project validation not yet implemented - coming in Story 3.3");
		}),
		
	// Localization commands - Story 3.4
	locale: t.router({
		add: t.procedure
			.meta({ description: "Add language support to existing project" })
			.input(
				z.tuple([
					z.array(LanguageSchema).min(1).describe("Languages to add"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						setPrimary: z.boolean().optional().default(false)
							.describe("Set first language as primary"),
						generateFiles: z.boolean().optional().default(true)
							.describe("Generate translation files"),
						updateConfig: z.boolean().optional().default(true)
							.describe("Update project configuration"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [languages, options] = input;
				// Implementation will be added in Story 3.4
				consola.info(`Adding languages: ${languages.join(", ")} with options:`, options);
				consola.warn("Language addition not yet implemented - coming in Story 3.4");
			}),
			
		extract: t.procedure
			.meta({ description: "Extract translation keys from source code" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						sourcePaths: z.array(z.string()).optional()
							.describe("Source paths to scan"),
						outputPath: z.string().optional()
							.describe("Output path for extracted keys"),
						format: z.enum(["json", "yaml", "po"]).optional().default("json")
							.describe("Output format for translations"),
						includeDefaults: z.boolean().optional().default(true)
							.describe("Include default translations"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.4
				consola.info(`Extracting translation keys with options:`, options);
				consola.warn("Translation extraction not yet implemented - coming in Story 3.4");
			}),
			
		import: t.procedure
			.meta({ description: "Import translations from files" })
			.input(
				z.tuple([
					z.string().describe("Import file path"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						language: LanguageSchema.optional()
							.describe("Target language for import"),
						format: z.enum(["json", "yaml", "po", "csv"]).optional()
							.describe("Import file format"),
						merge: z.boolean().optional().default(true)
							.describe("Merge with existing translations"),
						validate: z.boolean().optional().default(true)
							.describe("Validate imported translations"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [filePath, options] = input;
				// Implementation will be added in Story 3.4
				consola.info(`Importing translations from: ${filePath} with options:`, options);
				consola.warn("Translation import not yet implemented - coming in Story 3.4");
			}),
			
		export: t.procedure
			.meta({ description: "Export translations to files" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						languages: z.array(LanguageSchema).optional()
							.describe("Languages to export"),
						outputPath: z.string().optional()
							.describe("Output directory for exports"),
						format: z.enum(["json", "yaml", "po", "csv"]).optional().default("json")
							.describe("Export file format"),
						includeEmpty: z.boolean().optional().default(false)
							.describe("Include empty translations"),
						flatten: z.boolean().optional().default(false)
							.describe("Flatten nested keys"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.4
				consola.info(`Exporting translations with options:`, options);
				consola.warn("Translation export not yet implemented - coming in Story 3.4");
			}),
			
		validate: t.procedure
			.meta({ description: "Validate translation completeness and quality" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						languages: z.array(LanguageSchema).optional()
							.describe("Languages to validate"),
						checkMissing: z.boolean().optional().default(true)
							.describe("Check for missing translations"),
						checkPlurals: z.boolean().optional().default(true)
							.describe("Validate plural forms"),
						checkFormats: z.boolean().optional().default(true)
							.describe("Validate format strings"),
						checkRtl: z.boolean().optional().default(true)
							.describe("Check RTL compatibility"),
						report: z.boolean().optional().default(true)
							.describe("Generate validation report"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.4
				consola.info(`Validating translations with options:`, options);
				consola.warn("Translation validation not yet implemented - coming in Story 3.4");
			}),
	}),
		
	sponsors: t.procedure
		.meta({ description: "Show Xaheen Platform sponsors" })
		.mutation(async () => {
			try {
				renderTitle();
				intro(pc.magenta("Xaheen Platform Sponsors"));
				const sponsors = await fetchSponsors();
				displaySponsors(sponsors);
			} catch (error) {
				consola.error(error);
				process.exit(1);
			}
		}),
		
	docs: t.procedure
		.meta({ description: "Open Xaheen Platform documentation" })
		.mutation(async () => {
			const DOCS_URL = "https://better-t-stack.dev/docs";
			try {
				await openUrl(DOCS_URL);
				log.success(pc.blue("Opened docs in your default browser."));
			} catch {
				log.message(`Please visit ${DOCS_URL}`);
			}
		}),
		
	builder: t.procedure
		.meta({ description: "Open the web-based Xaheen project builder" })
		.mutation(async () => {
			const BUILDER_URL = "https://better-t-stack.dev/new";
			try {
				await openUrl(BUILDER_URL);
				log.success(pc.blue("Opened builder in your default browser."));
			} catch {
				log.message(`Please visit ${BUILDER_URL}`);
			}
		}),
});

createCli({
	router,
	name: "xaheen",
	version: getLatestCLIVersion(),
}).run();
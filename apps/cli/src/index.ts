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
	// New service schemas - Phase 2 & 3
	TestingSchema,
	NotificationsSchema,
	PaymentsSchema,
	MonitoringSchema,
	AnalyticsSchema,
	CachingSchema,
	DevOpsSchema,
	SecuritySchema,
	I18nSchema,
	MessagingSchema,
	SearchSchema,
	CMSSchema,
	SaaSAdminSchema,
	SubscriptionsSchema,
	BackgroundJobsSchema,
	RBACSchema,
	LicensingSchema,
	MultiTenancySchema,
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
					
					// New service options - Phase 2 & 3
					testing: TestingSchema.optional()
						.describe("Testing framework and tools"),
					notifications: NotificationsSchema.optional()
						.describe("Email and notification services"),
					payments: PaymentsSchema.optional()
						.describe("Payment processing services"),
					monitoring: MonitoringSchema.optional()
						.describe("Application monitoring and error tracking"),
					analytics: AnalyticsSchema.optional()
						.describe("Analytics and user tracking services"),
					caching: CachingSchema.optional()
						.describe("Caching and CDN services"),
					devops: DevOpsSchema.optional()
						.describe("CI/CD and infrastructure tools"),
					security: SecuritySchema.optional()
						.describe("Security scanning and analysis tools"),
					i18n: I18nSchema.optional()
						.describe("Internationalization and localization tools"),
					messaging: MessagingSchema.optional()
						.describe("Message queue and pub/sub services"),
					search: SearchSchema.optional()
						.describe("Search engine services"),
					cms: CMSSchema.optional()
						.describe("Content management systems"),
					saasAdmin: SaaSAdminSchema.optional()
						.describe("SaaS administration tools"),
					subscriptions: SubscriptionsSchema.optional()
						.describe("Subscription billing and management"),
					backgroundJobs: BackgroundJobsSchema.optional()
						.describe("Background job processing"),
					rbac: RBACSchema.optional()
						.describe("Role-based access control"),
					licensing: LicensingSchema.optional()
						.describe("Software licensing and feature management"),
					multiTenancy: MultiTenancySchema.optional()
						.describe("Multi-tenant architecture patterns"),
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
					
					// New service options - Phase 2 & 3
					testing: TestingSchema.optional()
						.describe("Add testing framework"),
					notifications: NotificationsSchema.optional()
						.describe("Add notification services"),
					payments: PaymentsSchema.optional()
						.describe("Add payment processing"),
					monitoring: MonitoringSchema.optional()
						.describe("Add monitoring services"),
					analytics: AnalyticsSchema.optional()
						.describe("Add analytics services"),
					caching: CachingSchema.optional()
						.describe("Add caching services"),
					devops: DevOpsSchema.optional()
						.describe("Add DevOps tools"),
					security: SecuritySchema.optional()
						.describe("Add security tools"),
					i18n: I18nSchema.optional()
						.describe("Add internationalization"),
					messaging: MessagingSchema.optional()
						.describe("Add messaging services"),
					search: SearchSchema.optional()
						.describe("Add search services"),
					cms: CMSSchema.optional()
						.describe("Add content management"),
					saasAdmin: SaaSAdminSchema.optional()
						.describe("Add SaaS admin tools"),
					subscriptions: SubscriptionsSchema.optional()
						.describe("Add subscription management"),
					backgroundJobs: BackgroundJobsSchema.optional()
						.describe("Add background job processing"),
					rbac: RBACSchema.optional()
						.describe("Add role-based access control"),
					licensing: LicensingSchema.optional()
						.describe("Add licensing features"),
					multiTenancy: MultiTenancySchema.optional()
						.describe("Add multi-tenancy support"),
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
		
	// Authentication commands - Story 3.5
	auth: t.router({
		add: t.procedure
			.meta({ description: "Add authentication providers to existing project" })
			.input(
				z.tuple([
					z.array(AuthProviderSchema).min(1).describe("Auth providers to add"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						primary: AuthProviderSchema.optional()
							.describe("Primary auth provider"),
						mfa: z.boolean().optional().default(false)
							.describe("Enable multi-factor authentication"),
						generateComponents: z.boolean().optional().default(true)
							.describe("Generate auth components"),
						updateConfig: z.boolean().optional().default(true)
							.describe("Update project configuration"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [providers, options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Adding auth providers: ${providers.join(", ")} with options:`, options);
				consola.warn("Auth provider addition not yet implemented - coming in Story 3.5");
			}),
			
		component: t.procedure
			.meta({ description: "Generate authentication components" })
			.input(
				z.tuple([
					z.string().describe("Component name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						type: z.enum(["login", "register", "profile", "forgot-password", "mfa", "session"])
							.optional().default("login")
							.describe("Auth component type"),
						provider: AuthProviderSchema.optional()
							.describe("Target auth provider"),
						ui: UISystemSchema.optional().default("default")
							.describe("UI system to use"),
						outputPath: z.string().optional()
							.describe("Output path for component"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Generating auth component: ${name} with options:`, options);
				consola.warn("Auth component generation not yet implemented - coming in Story 3.5");
			}),
			
		page: t.procedure
			.meta({ description: "Generate authentication pages" })
			.input(
				z.tuple([
					z.string().describe("Page name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						type: z.enum(["login", "register", "dashboard", "settings", "admin"])
							.optional().default("login")
							.describe("Auth page type"),
						provider: AuthProviderSchema.optional()
							.describe("Target auth provider"),
						ui: UISystemSchema.optional().default("default")
							.describe("UI system to use"),
						route: z.string().optional()
							.describe("Page route path"),
						protected: z.boolean().optional().default(false)
							.describe("Require authentication"),
						outputPath: z.string().optional()
							.describe("Output path for page"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Generating auth page: ${name} with options:`, options);
				consola.warn("Auth page generation not yet implemented - coming in Story 3.5");
			}),
			
		service: t.procedure
			.meta({ description: "Generate authentication service classes" })
			.input(
				z.tuple([
					z.string().describe("Service name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						provider: AuthProviderSchema.optional()
							.describe("Target auth provider"),
						features: z.array(z.enum(["login", "logout", "register", "mfa", "session", "refresh"]))
							.optional().default(["login", "logout"])
							.describe("Service features to include"),
						outputPath: z.string().optional()
							.describe("Output path for service"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						testing: z.boolean().optional().default(true)
							.describe("Generate tests"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Generating auth service: ${name} with options:`, options);
				consola.warn("Auth service generation not yet implemented - coming in Story 3.5");
			}),
			
		oauth: t.procedure
			.meta({ description: "Configure OAuth providers" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						provider: z.enum(["google", "github", "microsoft", "facebook", "twitter"])
							.describe("OAuth provider to configure"),
						clientId: z.string().optional()
							.describe("OAuth client ID"),
						clientSecret: z.string().optional()
							.describe("OAuth client secret"),
						redirectUri: z.string().optional()
							.describe("OAuth redirect URI"),
						scopes: z.array(z.string()).optional()
							.describe("OAuth scopes"),
						generateEnv: z.boolean().optional().default(true)
							.describe("Update environment variables"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Configuring OAuth provider with options:`, options);
				consola.warn("OAuth configuration not yet implemented - coming in Story 3.5");
			}),
			
		session: t.procedure
			.meta({ description: "Configure session management" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						type: z.enum(["jwt", "cookie", "database", "redis"])
							.optional().default("jwt")
							.describe("Session storage type"),
						duration: z.number().optional().default(86400)
							.describe("Session duration in seconds"),
						refreshEnabled: z.boolean().optional().default(true)
							.describe("Enable token refresh"),
						secure: z.boolean().optional().default(true)
							.describe("Use secure cookies"),
						sameSite: z.enum(["strict", "lax", "none"]).optional().default("lax")
							.describe("Cookie SameSite policy"),
						generateConfig: z.boolean().optional().default(true)
							.describe("Generate configuration files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.5
				consola.info(`Configuring session management with options:`, options);
				consola.warn("Session configuration not yet implemented - coming in Story 3.5");
			}),
	}),
		
	// Integration commands - Story 3.6
	integration: t.router({
		add: t.procedure
			.meta({ description: "Add external integrations to existing project" })
			.input(
				z.tuple([
					z.array(IntegrationSchema).min(1).describe("Integrations to add"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						generateComponents: z.boolean().optional().default(true)
							.describe("Generate integration components"),
						generateServices: z.boolean().optional().default(true)
							.describe("Generate integration services"),
						generateWebhooks: z.boolean().optional().default(false)
							.describe("Generate webhook handlers"),
						updateConfig: z.boolean().optional().default(true)
							.describe("Update project configuration"),
						addEnvVars: z.boolean().optional().default(true)
							.describe("Add environment variables"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [integrations, options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Adding integrations: ${integrations.join(", ")} with options:`, options);
				consola.warn("Integration addition not yet implemented - coming in Story 3.6");
			}),
			
		component: t.procedure
			.meta({ description: "Generate integration UI components" })
			.input(
				z.tuple([
					z.string().describe("Component name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integration: IntegrationSchema.describe("Target integration"),
						type: z.enum(["widget", "dashboard", "settings", "status", "form"])
							.optional().default("widget")
							.describe("Component type"),
						ui: UISystemSchema.optional().default("default")
							.describe("UI system to use"),
						outputPath: z.string().optional()
							.describe("Output path for component"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Generating integration component: ${name} with options:`, options);
				consola.warn("Integration component generation not yet implemented - coming in Story 3.6");
			}),
			
		service: t.procedure
			.meta({ description: "Generate integration service classes" })
			.input(
				z.tuple([
					z.string().describe("Service name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integration: IntegrationSchema.describe("Target integration"),
						features: z.array(z.enum(["api", "webhooks", "events", "sync", "auth"]))
							.optional().default(["api"])
							.describe("Service features to include"),
						outputPath: z.string().optional()
							.describe("Output path for service"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						testing: z.boolean().optional().default(true)
							.describe("Generate tests"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Generating integration service: ${name} with options:`, options);
				consola.warn("Integration service generation not yet implemented - coming in Story 3.6");
			}),
			
		webhook: t.procedure
			.meta({ description: "Generate webhook handlers for integrations" })
			.input(
				z.tuple([
					z.string().describe("Webhook handler name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integration: IntegrationSchema.describe("Target integration"),
						events: z.array(z.string()).optional()
							.describe("Events to handle"),
						method: z.enum(["POST", "GET", "PUT", "DELETE"]).optional().default("POST")
							.describe("HTTP method"),
						authentication: z.enum(["signature", "token", "oauth", "none"]).optional().default("signature")
							.describe("Authentication method"),
						outputPath: z.string().optional()
							.describe("Output path for webhook"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Generating webhook handler: ${name} with options:`, options);
				consola.warn("Webhook generation not yet implemented - coming in Story 3.6");
			}),
			
		config: t.procedure
			.meta({ description: "Configure integration API keys and settings" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integration: IntegrationSchema.describe("Integration to configure"),
						apiKey: z.string().optional()
							.describe("API key or access token"),
						apiSecret: z.string().optional()
							.describe("API secret or client secret"),
						webhookUrl: z.string().optional()
							.describe("Webhook URL endpoint"),
						environment: z.enum(["development", "staging", "production"]).optional().default("development")
							.describe("Environment for configuration"),
						additionalConfig: z.record(z.string(), z.any()).optional()
							.describe("Additional configuration options"),
						updateEnv: z.boolean().optional().default(true)
							.describe("Update environment variables"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Configuring integration with options:`, options);
				consola.warn("Integration configuration not yet implemented - coming in Story 3.6");
			}),
			
		test: t.procedure
			.meta({ description: "Test integration connections and functionality" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integration: IntegrationSchema.describe("Integration to test"),
						testType: z.enum(["connection", "auth", "api", "webhook", "all"]).optional().default("connection")
							.describe("Type of test to run"),
						verbose: z.boolean().optional().default(false)
							.describe("Show detailed test output"),
						timeout: z.number().optional().default(30000)
							.describe("Test timeout in milliseconds"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Testing integration with options:`, options);
				consola.warn("Integration testing not yet implemented - coming in Story 3.6");
			}),
			
		docs: t.procedure
			.meta({ description: "Generate integration documentation" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						integrations: z.array(IntegrationSchema).optional()
							.describe("Integrations to document"),
						format: z.enum(["markdown", "html", "pdf"]).optional().default("markdown")
							.describe("Documentation format"),
						includeExamples: z.boolean().optional().default(true)
							.describe("Include code examples"),
						includeApiDocs: z.boolean().optional().default(true)
							.describe("Include API documentation"),
						outputPath: z.string().optional()
							.describe("Output path for documentation"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.6
				consola.info(`Generating integration documentation with options:`, options);
				consola.warn("Integration documentation generation not yet implemented - coming in Story 3.6");
			}),
	}),
		
	// Document commands - Story 3.7
	document: t.router({
		add: t.procedure
			.meta({ description: "Add document services to existing project" })
			.input(
				z.tuple([
					z.array(DocumentServiceSchema).min(1).describe("Document services to add"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						generateComponents: z.boolean().optional().default(true)
							.describe("Generate document components"),
						generateServices: z.boolean().optional().default(true)
							.describe("Generate document services"),
						generateTemplates: z.boolean().optional().default(true)
							.describe("Generate document templates"),
						norwegianFormats: z.boolean().optional().default(false)
							.describe("Include Norwegian-specific formats"),
						updateConfig: z.boolean().optional().default(true)
							.describe("Update project configuration"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [services, options] = input;
				// Implementation will be added in Story 3.7
				consola.info(`Adding document services: ${services.join(", ")} with options:`, options);
				consola.warn("Document service addition not yet implemented - coming in Story 3.7");
			}),
			
		component: t.procedure
			.meta({ description: "Generate document UI components" })
			.input(
				z.tuple([
					z.string().describe("Component name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						service: DocumentServiceSchema.describe("Target document service"),
						type: z.enum(["viewer", "editor", "preview", "export", "import"])
							.optional().default("viewer")
							.describe("Component type"),
						ui: UISystemSchema.optional().default("default")
							.describe("UI system to use"),
						compliance: ComplianceSchema.optional().default("none")
							.describe("Compliance requirements"),
						outputPath: z.string().optional()
							.describe("Output path for component"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.7
				consola.info(`Generating document component: ${name} with options:`, options);
				consola.warn("Document component generation not yet implemented - coming in Story 3.7");
			}),
			
		template: t.procedure
			.meta({ description: "Create document templates" })
			.input(
				z.tuple([
					z.string().describe("Template name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						type: z.enum(["invoice", "report", "contract", "letter", "form", "certificate"])
							.describe("Template type"),
						format: z.enum(["pdf", "docx", "html", "markdown"]).optional().default("pdf")
							.describe("Output format"),
						language: LanguageSchema.optional().default("en")
							.describe("Template language"),
						norwegianStandard: z.boolean().optional().default(false)
							.describe("Use Norwegian standards"),
						includeFields: z.array(z.string()).optional()
							.describe("Fields to include in template"),
						styling: z.object({
							logo: z.string().optional(),
							primaryColor: z.string().optional(),
							font: z.string().optional(),
						}).optional()
							.describe("Template styling options"),
						outputPath: z.string().optional()
							.describe("Output path for template"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.7
				consola.info(`Creating document template: ${name} with options:`, options);
				consola.warn("Document template creation not yet implemented - coming in Story 3.7");
			}),
			
		service: t.procedure
			.meta({ description: "Generate document service classes" })
			.input(
				z.tuple([
					z.string().describe("Service name"),
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						service: DocumentServiceSchema.describe("Target document service"),
						features: z.array(z.enum(["generate", "parse", "validate", "convert", "merge", "sign"]))
							.optional().default(["generate"])
							.describe("Service features to include"),
						outputPath: z.string().optional()
							.describe("Output path for service"),
						typescript: z.boolean().optional().default(true)
							.describe("Generate TypeScript"),
						testing: z.boolean().optional().default(true)
							.describe("Generate tests"),
						overwrite: z.boolean().optional().default(false)
							.describe("Overwrite existing files"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [name, options] = input;
				// Implementation will be added in Story 3.7
				consola.info(`Generating document service: ${name} with options:`, options);
				consola.warn("Document service generation not yet implemented - coming in Story 3.7");
			}),
	}),
		
	// Compliance commands - Story 3.8
	compliance: t.router({
		add: t.procedure
			.meta({ description: "Add compliance features to existing project" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						level: ComplianceSchema.describe("Compliance level to add"),
						wcagLevel: z.enum(["A", "AA", "AAA"]).optional().default("AA")
							.describe("WCAG accessibility level"),
						nsmClassification: z.enum(["OPEN", "INTERNAL", "RESTRICTED", "CONFIDENTIAL"]).optional().default("INTERNAL")
							.describe("NSM security classification"),
						generateComponents: z.boolean().optional().default(true)
							.describe("Generate compliance components"),
						generateServices: z.boolean().optional().default(true)
							.describe("Generate compliance services"),
						generatePolicies: z.boolean().optional().default(true)
							.describe("Generate compliance policies"),
						updateConfig: z.boolean().optional().default(true)
							.describe("Update project configuration"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.8
				consola.info(`Adding compliance features with options:`, options);
				consola.warn("Compliance feature addition not yet implemented - coming in Story 3.8");
			}),
			
		validate: t.procedure
			.meta({ description: "Validate project compliance against standards" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						standards: z.array(z.enum(["gdpr", "nsm", "wcag", "all"])).optional().default(["all"])
							.describe("Standards to validate against"),
						wcagLevel: z.enum(["A", "AA", "AAA"]).optional().default("AA")
							.describe("WCAG level to validate"),
						checkAccessibility: z.boolean().optional().default(true)
							.describe("Check accessibility compliance"),
						checkSecurity: z.boolean().optional().default(true)
							.describe("Check security compliance"),
						checkPrivacy: z.boolean().optional().default(true)
							.describe("Check privacy compliance"),
						checkDataProtection: z.boolean().optional().default(true)
							.describe("Check data protection compliance"),
						fix: z.boolean().optional().default(false)
							.describe("Attempt to fix violations"),
						verbose: z.boolean().optional().default(false)
							.describe("Show detailed validation output"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.8
				consola.info(`Validating compliance with options:`, options);
				consola.warn("Compliance validation not yet implemented - coming in Story 3.8");
			}),
			
		report: t.procedure
			.meta({ description: "Generate compliance report for project" })
			.input(
				z.tuple([
					z.object({
						projectDir: z.string().optional().describe("Project directory"),
						format: z.enum(["html", "pdf", "json", "markdown"]).optional().default("html")
							.describe("Report format"),
						includeViolations: z.boolean().optional().default(true)
							.describe("Include violation details"),
						includeRemediation: z.boolean().optional().default(true)
							.describe("Include remediation suggestions"),
						includeScore: z.boolean().optional().default(true)
							.describe("Include compliance scores"),
						includeCertification: z.boolean().optional().default(true)
							.describe("Include certification status"),
						includeActionItems: z.boolean().optional().default(true)
							.describe("Include action items"),
						outputPath: z.string().optional()
							.describe("Output path for report"),
						language: LanguageSchema.optional().default("en")
							.describe("Report language"),
					}),
				]),
			)
			.mutation(async ({ input }) => {
				const [options] = input;
				// Implementation will be added in Story 3.8
				consola.info(`Generating compliance report with options:`, options);
				consola.warn("Compliance report generation not yet implemented - coming in Story 3.8");
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
			const DOCS_URL = "https://Xaheen.dev/docs";
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
			const BUILDER_URL = "https://Xaheen.dev/new";
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
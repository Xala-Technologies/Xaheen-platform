import { Command } from "commander";
import { AliasResolverMiddleware } from "../../middleware/alias-resolver.middleware.js";
import type {
	CLIAction,
	CLICommand,
	CLIDomain,
	CommandRoute,
} from "../../types/index.js";
import { CLIError } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

export class CommandParser {
	private program: Command;
	private routes: Map<string, CommandRoute> = new Map();
	private legacyMappings: Map<string, CommandRoute> = new Map();
	private registeredCommands: Set<string> = new Set();
	private aliasResolver: AliasResolverMiddleware;

	constructor() {
		this.program = new Command();
		this.aliasResolver = new AliasResolverMiddleware();
		this.setupProgram();
		this.setupRoutes();
		this.setupAliasCommands();
	}

	private setupProgram(): void {
		this.program
			.name("xaheen")
			.description(
				"Xaheen CLI - Service-based architecture with AI-powered component generation",
			)
			.version("3.0.0");
	}

	private setupRoutes(): void {
		// Define the unified command routes
		const routes: CommandRoute[] = [
			// Project domain routes
			{
				pattern: "project create <name>",
				domain: "project",
				action: "create",
				handler: this.handleProjectCreate.bind(this),
				legacy: {
					xaheen: ["create"],
					xala: ["init"],
				},
			},
			{
				pattern: "project validate",
				domain: "project",
				action: "validate",
				handler: this.handleProjectValidate.bind(this),
				legacy: {
					xaheen: ["validate", "doctor"],
				},
			},

			// App domain routes (for monorepo apps)
			{
				pattern: "app create <name>",
				domain: "app",
				action: "create",
				handler: this.handleAppCreate.bind(this),
				legacy: {
					xaheen: ["create-app"],
				},
			},
			{
				pattern: "app list",
				domain: "app",
				action: "list",
				handler: this.handleAppList.bind(this),
			},
			{
				pattern: "app add <name>",
				domain: "app",
				action: "add",
				handler: this.handleAppAdd.bind(this),
			},

			// Package domain routes (for monorepo packages)
			{
				pattern: "package create <name>",
				domain: "package",
				action: "create",
				handler: this.handlePackageCreate.bind(this),
				legacy: {
					xaheen: ["create-package"],
				},
			},
			{
				pattern: "package list",
				domain: "package",
				action: "list",
				handler: this.handlePackageList.bind(this),
			},
			{
				pattern: "package add <name>",
				domain: "package",
				action: "add",
				handler: this.handlePackageAdd.bind(this),
			},

			// Service domain routes
			{
				pattern: "service add <service>",
				domain: "service",
				action: "add",
				handler: this.handleServiceAdd.bind(this),
				legacy: {
					xaheen: ["add"],
				},
			},
			{
				pattern: "service remove <service>",
				domain: "service",
				action: "remove",
				handler: this.handleServiceRemove.bind(this),
				legacy: {
					xaheen: ["remove"],
				},
			},
			{
				pattern: "service list",
				domain: "service",
				action: "list",
				handler: this.handleServiceList.bind(this),
				legacy: {
					xaheen: ["bundle list"],
				},
			},

			// Component domain routes
			{
				pattern: "component generate <description>",
				domain: "component",
				action: "generate",
				handler: this.handleComponentGenerate.bind(this),
				legacy: {
					xala: ["generate component", "components generate"],
				},
			},
			{
				pattern: "component create <name>",
				domain: "component",
				action: "create",
				handler: this.handleComponentCreate.bind(this),
				legacy: {
					xala: ["create component"],
				},
			},

			// Page domain routes
			{
				pattern: "page generate <description>",
				domain: "page",
				action: "generate",
				handler: this.handlePageGenerate.bind(this),
				legacy: {
					xala: ["generate page", "pages generate"],
				},
			},
			{
				pattern: "page create <name>",
				domain: "page",
				action: "create",
				handler: this.handlePageCreate.bind(this),
				legacy: {
					xala: ["create page"],
				},
			},
			{
				pattern: "page list",
				domain: "page",
				action: "list",
				handler: this.handlePageList.bind(this),
			},

			// Model domain routes (Laravel Eloquent-style)
			{
				pattern: "model generate <name>",
				domain: "model",
				action: "generate",
				handler: this.handleModelGenerate.bind(this),
				legacy: {
					xaheen: ["generate-model"],
					xala: ["model generate"],
				},
			},
			{
				pattern: "model create <name>",
				domain: "model",
				action: "create",
				handler: this.handleModelCreate.bind(this),
				legacy: {
					xaheen: ["create-model"],
				},
			},
			{
				pattern: "model scaffold <name>",
				domain: "model",
				action: "scaffold",
				handler: this.handleModelScaffold.bind(this),
			},
			{
				pattern: "model migrate",
				domain: "model",
				action: "migrate",
				handler: this.handleModelMigrate.bind(this),
			},

			// Make domain routes (Laravel Artisan-inspired)
			{
				pattern: "make:model <name>",
				domain: "make",
				action: "model",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:controller <name>",
				domain: "make",
				action: "controller",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:service <name>",
				domain: "make",
				action: "service",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:component <name>",
				domain: "make",
				action: "component",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:migration <name>",
				domain: "make",
				action: "migration",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:seeder <name>",
				domain: "make",
				action: "seeder",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:factory <name>",
				domain: "make",
				action: "factory",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:crud <name>",
				domain: "make",
				action: "crud",
				handler: this.handleMakeCommand.bind(this),
			},
			{
				pattern: "make:analyze <filepath>",
				domain: "make",
				action: "analyze",
				handler: this.handleMakeCommand.bind(this),
			},

			// Theme domain routes
			{
				pattern: "theme create <name>",
				domain: "theme",
				action: "create",
				handler: this.handleThemeCreate.bind(this),
				legacy: {
					xala: ["themes create"],
				},
			},
			{
				pattern: "theme list",
				domain: "theme",
				action: "list",
				handler: this.handleThemeList.bind(this),
				legacy: {
					xala: ["themes list"],
				},
			},

			// AI domain routes
			{
				pattern: "ai generate <prompt>",
				domain: "ai",
				action: "generate",
				handler: this.handleAIGenerate.bind(this),
				legacy: {
					xala: ["ai generate"],
				},
			},
			{
				pattern: "ai service <description>",
				domain: "ai",
				action: "generate",
				handler: this.handleAIService.bind(this),
			},

			// Build domain routes
			{
				pattern: "build",
				domain: "build",
				action: "create",
				handler: this.handleBuild.bind(this),
				legacy: {
					xala: ["build"],
				},
			},

			// MCP domain routes
			{
				pattern: "mcp connect",
				domain: "mcp",
				action: "create",
				handler: this.handleMCPConnect.bind(this),
			},
			{
				pattern: "mcp analyze",
				domain: "mcp",
				action: "analyze",
				handler: this.handleMCPAnalyze.bind(this),
			},
			{
				pattern: "mcp suggestions [category]",
				domain: "mcp",
				action: "analyze",
				handler: this.handleMCPSuggestions.bind(this),
			},
			{
				pattern: "mcp context",
				domain: "mcp",
				action: "analyze",
				handler: this.handleMCPContext.bind(this),
			},
			{
				pattern: "mcp generate <name>",
				domain: "mcp",
				action: "generate",
				handler: this.handleMCPGenerate.bind(this),
			},
			{
				pattern: "mcp list [platform]",
				domain: "mcp",
				action: "list",
				handler: this.handleMCPList.bind(this),
			},
			{
				pattern: "mcp info [platform]",
				domain: "mcp",
				action: "analyze",
				handler: this.handleMCPInfo.bind(this),
			},
			{
				pattern: "mcp disconnect",
				domain: "mcp",
				action: "remove",
				handler: this.handleMCPDisconnect.bind(this),
			},
			{
				pattern: "mcp deploy",
				domain: "mcp",
				action: "deploy",
				handler: this.handleMCPDeploy.bind(this),
			},

			// Help domain routes
			{
				pattern: "help [topic]",
				domain: "help",
				action: "show",
				handler: this.handleHelp.bind(this),
			},
			{
				pattern: "help search <query>",
				domain: "help",
				action: "search",
				handler: this.handleHelpSearch.bind(this),
			},
			{
				pattern: "help examples [topic]",
				domain: "help",
				action: "examples",
				handler: this.handleHelpExamples.bind(this),
			},
			{
				pattern: "aliases",
				domain: "help",
				action: "show",
				handler: this.handleAliases.bind(this),
			},

			// AI domain routes (Codebuff integration)
			{
				pattern: "ai code <prompt>",
				domain: "ai",
				action: "code",
				handler: this.handleAICode.bind(this),
			},
			{
				pattern: "ai fix-tests",
				domain: "ai",
				action: "fix-tests",
				handler: this.handleAIFixTests.bind(this),
			},
			{
				pattern: "ai norwegian <prompt>",
				domain: "ai",
				action: "norwegian",
				handler: this.handleAINorwegian.bind(this),
			},
			{
				pattern: "ai index",
				domain: "ai",
				action: "index",
				handler: this.handleAIIndex.bind(this),
			},

			// Documentation domain routes  
			{
				pattern: "docs generate [type]",
				domain: "docs",
				action: "generate",
				handler: this.handleDocsGenerate.bind(this),
				legacy: {
					xaheen: ["generate docs", "docs"],
				},
			},
			{
				pattern: "docs portal",
				domain: "docs",
				action: "portal",
				handler: this.handleDocsPortal.bind(this),
			},
			{
				pattern: "docs onboarding",
				domain: "docs",
				action: "onboarding",
				handler: this.handleDocsOnboarding.bind(this),
			},
			{
				pattern: "docs sync",
				domain: "docs",
				action: "sync",
				handler: this.handleDocsSync.bind(this),
			},
			{
				pattern: "docs watch",
				domain: "docs",
				action: "watch",
				handler: this.handleDocsWatch.bind(this),
			},

			// Security domain routes
			{
				pattern: "security-audit",
				domain: "security",
				action: "audit",
				handler: this.handleSecurityAudit.bind(this),
				legacy: {
					xaheen: ["audit"],
				},
			},
			{
				pattern: "compliance-report",
				domain: "security",
				action: "compliance",
				handler: this.handleComplianceReport.bind(this),
				legacy: {
					xaheen: ["compliance"],
				},
			},
			{
				pattern: "security-scan [project-path]",
				domain: "security",
				action: "scan",
				handler: this.handleSecurityScan.bind(this),
				legacy: {
					xaheen: ["scan"],
				},
			},

			// Template Modernization domain routes
			{
				pattern: "modernize [target]",
				domain: "templates",
				action: "modernize",
				handler: this.handleTemplateModernize.bind(this),
				legacy: {
					xaheen: ["modernize-templates", "upgrade-templates"],
				},
			},
		];

		// Register routes
		routes.forEach((route) => {
			this.registerRoute(route);
		});

		// Register legacy commands
		this.registerLegacyCommands();
	}

	/**
	 * Setup alias commands dynamically
	 */
	private setupAliasCommands(): void {
		const aliases = this.aliasResolver.getAliasManager().getAllAliases();

		aliases.forEach((alias) => {
			try {
				if (!this.registeredCommands.has(alias.alias)) {
					// Create a dynamic command for each alias
					const command = this.program
						.command(alias.alias)
						.description(
							`${alias.description} (alias for ${alias.originalCommand})`,
						)
						.allowUnknownOption()
						.action(async (...args) => {
							try {
								// Process the aliased command
								const [options] = args.slice(-1); // Last argument is always options
								const targets = args.slice(0, -1); // Everything before options

								const aliasedCommand = this.aliasResolver.processArguments([
									alias.alias,
									...targets,
								]);

								if (aliasedCommand.resolved && aliasedCommand.command) {
									// Find the appropriate handler for the resolved command
									const route = this.findRouteForCommand(
										aliasedCommand.command,
									);
									if (route) {
										await route.handler(aliasedCommand.command);
									} else {
										logger.error(
											`No handler found for aliased command: ${alias.originalCommand}`,
										);
									}
								} else {
									logger.error(`Failed to resolve alias: ${alias.alias}`);
								}
							} catch (error) {
								logger.error(`Alias command failed: ${alias.alias}`, error);
								throw error;
							}
						});

					// Add common options to alias commands
					command
						.option("-v, --verbose", "Enable verbose logging")
						.option("--dry-run", "Show what would be done without executing")
						.option("--config <path>", "Path to configuration file");

					this.registeredCommands.add(alias.alias);
					logger.debug(`Registered alias command: ${alias.alias}`);
				}
			} catch (error) {
				logger.warn(`Failed to register alias command ${alias.alias}:`, error);
			}
		});
	}

	/**
	 * Find route for a resolved command
	 */
	private findRouteForCommand(command: CLICommand): CommandRoute | undefined {
		// Look for exact pattern match first
		const exactPattern = `${command.domain} ${command.action}${command.target ? ` ${command.target}` : ""}`;
		let route = Array.from(this.routes.values()).find((r) =>
			r.pattern.includes(exactPattern),
		);

		if (!route) {
			// Look for domain + action match
			route = Array.from(this.routes.values()).find(
				(r) => r.domain === command.domain && r.action === command.action,
			);
		}

		return route;
	}

	private registerRoute(route: CommandRoute): void {
		try {
			// Check if command is already registered
			if (this.registeredCommands.has(route.pattern)) {
				logger.debug(`Command already registered: ${route.pattern}`);
				return;
			}

			const command = this.program
				.command(route.pattern)
				.description(`Execute ${route.domain} ${route.action}`)
				.action(async (...args) => {
					try {
						const [target, options] = this.parseCommandArgs(args);
						const cliCommand: CLICommand = {
							domain: route.domain,
							action: route.action,
							target,
							arguments: { target },
							options,
						};

						logger.debug(`Executing command: ${route.domain} ${route.action}`, {
							target,
							options,
						});
						await route.handler(cliCommand);
					} catch (error) {
						logger.error(
							`Command failed: ${route.domain} ${route.action}`,
							error,
						);
						throw error;
					}
				});

			// Add common options
			command
				.option("-v, --verbose", "Enable verbose logging")
				.option("--dry-run", "Show what would be done without executing")
				.option("--config <path>", "Path to configuration file");

			// Add make-specific options for AI enhancement
			if (route.domain === "make") {
				command
					.option("--ai", "Enable AI-powered generation")
					.option("--description <desc>", "Describe what you want to build")
					.option("--test", "Generate unit tests")
					.option("--withStories", "Generate Storybook stories")
					.option(
						"--accessibility <level>",
						"Set accessibility level (A/AA/AAA)",
						"AAA",
					)
					.option("--norwegian", "Enable Norwegian compliance")
					.option("--gdpr", "Enable GDPR compliance")
					.option(
						"--styling <type>",
						"Styling approach (tailwind/css-modules/styled-components)",
						"tailwind",
					)
					.option("--features <features>", "Comma-separated list of features")
					.option("--migration", "Create migration file (for models)")
					.option("--controller", "Create controller (for models)")
					.option("--resource", "Create resource controller")
					.option("--factory", "Create factory file")
					.option("--seeder", "Create seeder file")
					.option("--all", "Create all related files")
					.option("--api", "Create API-only controller")
					.option("--force", "Force overwrite existing files");
			}

			// Add MCP-specific options
			if (route.domain === "mcp") {
				command
					.option("--server <url>", "MCP server URL to connect to")
					.option("--path <path>", "Project path to analyze")
					.option(
						"--category <category>",
						"Filter suggestions by category (architecture/performance/security/accessibility)",
					)
					.option(
						"--platform <platform>",
						"Target platform (react/nextjs/vue/angular/svelte)",
						"react",
					)
					.option("--all", "Generate for all platforms")
					.option(
						"--platforms <platforms>",
						"Comma-separated list of platforms",
					)
					.option("--name <name>", "Component name to generate")
					.option("--force", "Force deployment despite critical issues");
			}

			// Add Template Modernization-specific options
			if (route.domain === "templates") {
				command
					.option('-t, --target <pattern>', 'Target template files (glob pattern)', '**/*.hbs')
					.option('-o, --output <directory>', 'Output directory for modernized templates', './modernized-templates')
					.option('-w, --wcag-level <level>', 'WCAG compliance level (A, AA, AAA)', 'AAA')
					.option('-n, --nsm-classification <level>', 'NSM security classification', 'OPEN')
					.option('--auto-fix', 'Automatically fix issues where possible', true)
					.option('--dry-run', 'Preview changes without writing files', false)
					.option('--examples', 'Generate modernization examples', false)
					.option('--analyze', 'Only analyze templates without modernizing', false)
					.option('--report', 'Generate comprehensive report', true)
					.option('--verbose', 'Verbose output', false);
			}

			// Add Security-specific options
			if (route.domain === "security") {
				if (route.action === "audit") {
					command
						.option("--tools <tools>", "Security tools to use (comma-separated)", "npm-audit,eslint-security")
						.option("--standards <standards>", "Compliance standards to check (comma-separated)", "owasp")
						.option("--classification <level>", "NSM security classification level", "OPEN")
						.option("--format <format>", "Output format (json|html|markdown|all)", "html")
						.option("--severity <level>", "Minimum severity level (low|medium|high|critical|all)", "medium")
						.option("--output <dir>", "Output directory for reports")
						.option("--scan-code", "Scan source code for vulnerabilities", true)
						.option("--scan-deps", "Scan dependencies for vulnerabilities", true)
						.option("--scan-config", "Scan configuration files", true)
						.option("--include-snyk", "Include Snyk vulnerability scanning")
						.option("--include-sonarqube", "Include SonarQube analysis")
						.option("--include-eslint", "Include ESLint security analysis", true)
						.option("--include-custom", "Include custom security rules", true)
						.option("--interactive", "Interactive mode with guided prompts");
				} else if (route.action === "compliance") {
					command
						.option("--standards <standards>", "Compliance standards to assess (comma-separated)", "gdpr,owasp")
						.option("--type <type>", "Report type (executive|detailed|technical|audit)", "detailed")
						.option("--format <format>", "Output format (json|html|pdf|all)", "html")
						.option("--classification <level>", "NSM security classification level")
						.option("--lawful-basis <basis>", "GDPR lawful basis (comma-separated)")
						.option("--output <dir>", "Output directory for reports")
						.option("--gaps", "Include gap analysis", true)
						.option("--remediation", "Include remediation planning", true)
						.option("--dashboard", "Generate interactive dashboard", true)
						.option("--metrics", "Include compliance metrics", true)
						.option("--action-plan", "Generate detailed action plan")
						.option("--timeframe <timeframe>", "Report timeframe (current|historical|projected)", "current")
						.option("--interactive", "Interactive mode with guided prompts");
				} else if (route.action === "scan") {
					command
						.option("-t, --types <types>", "Scan types: code,dependencies,secrets,configuration,compliance", "code,dependencies,secrets")
						.option("-s, --severity <levels>", "Severity levels to include: critical,high,medium,low,info", "critical,high,medium")
						.option("-c, --compliance <standards>", "Compliance standards to check: owasp,nsm,gdpr,wcag", "owasp")
						.option("--ai-enhanced", "Enable AI-powered security analysis", true)
						.option("--no-ai-enhanced", "Disable AI-powered analysis")
						.option("-f, --format <format>", "Report format: json,html,markdown,sarif", "json")
						.option("-o, --output <path>", "Output file path for the report")
						.option("--exclude <patterns>", "Comma-separated patterns to exclude")
						.option("--max-file-size <size>", "Maximum file size to scan (KB)", "1024")
						.option("--timeout <ms>", "Scan timeout in milliseconds", "300000")
						.option("--verbose", "Enable verbose logging");
				}
			}

			this.routes.set(route.pattern, route);
			this.registeredCommands.add(route.pattern);
			logger.debug(`Registered command: ${route.pattern}`);
		} catch (error) {
			logger.warn(`Failed to register command ${route.pattern}:`, error);
		}
	}

	private registerLegacyCommands(): void {
		// Note: Legacy commands are supported through the unified command structure
		// Users can still use the old commands, but they are mapped internally
		logger.debug("Legacy command support enabled via unified command mapping");
	}

	private findRouteByLegacy(
		cli: "xaheen" | "xala",
		command: string,
	): CommandRoute | undefined {
		for (const route of this.routes.values()) {
			if (route.legacy?.[cli]?.includes(command)) {
				return route;
			}
		}
		return undefined;
	}

	private parseCommandArgs(
		args: any[],
	): [string | undefined, Record<string, any>] {
		if (args.length === 0) return [undefined, {}];

		// The last argument is always the options object from commander
		const options = args[args.length - 1];
		const target = args.length > 1 ? args[0] : undefined;

		return [target, options];
	}

	// Command handlers - these will delegate to domain-specific handlers
	private async handleProjectCreate(command: CLICommand): Promise<void> {
		const { default: ProjectDomain } = await import(
			"../../domains/project/index.js"
		);
		const domain = new ProjectDomain();
		await domain.create(command);
	}

	private async handleProjectValidate(command: CLICommand): Promise<void> {
		const { default: ProjectDomain } = await import(
			"../../domains/project/index.js"
		);
		const domain = new ProjectDomain();
		await domain.validate(command);
	}

	private async handleAppCreate(command: CLICommand): Promise<void> {
		const { default: AppDomain } = await import("../../domains/app/index.js");
		const domain = new AppDomain();
		await domain.create(command);
	}

	private async handleAppList(command: CLICommand): Promise<void> {
		const { default: AppDomain } = await import("../../domains/app/index.js");
		const domain = new AppDomain();
		await domain.list(command);
	}

	private async handleAppAdd(command: CLICommand): Promise<void> {
		const { default: AppDomain } = await import("../../domains/app/index.js");
		const domain = new AppDomain();
		await domain.add(command);
	}

	private async handlePackageCreate(command: CLICommand): Promise<void> {
		const { default: PackageDomain } = await import(
			"../../domains/package/index.js"
		);
		const domain = new PackageDomain();
		await domain.create(command);
	}

	private async handlePackageList(command: CLICommand): Promise<void> {
		const { default: PackageDomain } = await import(
			"../../domains/package/index.js"
		);
		const domain = new PackageDomain();
		await domain.list(command);
	}

	private async handlePackageAdd(command: CLICommand): Promise<void> {
		const { default: PackageDomain } = await import(
			"../../domains/package/index.js"
		);
		const domain = new PackageDomain();
		await domain.add(command);
	}

	private async handleServiceAdd(command: CLICommand): Promise<void> {
		const { default: ServiceDomain } = await import(
			"../../domains/service/index.js"
		);
		const domain = new ServiceDomain();
		await domain.add(command);
	}

	private async handleServiceRemove(command: CLICommand): Promise<void> {
		const { default: ServiceDomain } = await import(
			"../../domains/service/index.js"
		);
		const domain = new ServiceDomain();
		await domain.remove(command);
	}

	private async handleServiceList(command: CLICommand): Promise<void> {
		const { default: ServiceDomain } = await import(
			"../../domains/service/index.js"
		);
		const domain = new ServiceDomain();
		await domain.list(command);
	}

	private async handleComponentGenerate(command: CLICommand): Promise<void> {
		const { default: ComponentDomain } = await import(
			"../../domains/component/index.js"
		);
		const domain = new ComponentDomain();
		await domain.generate(command);
	}

	private async handleComponentCreate(command: CLICommand): Promise<void> {
		const { default: ComponentDomain } = await import(
			"../../domains/component/index.js"
		);
		const domain = new ComponentDomain();
		await domain.create(command);
	}

	private async handlePageGenerate(command: CLICommand): Promise<void> {
		const { default: PageDomain } = await import("../../domains/page/index.js");
		const domain = new PageDomain();
		await domain.generate(command);
	}

	private async handlePageCreate(command: CLICommand): Promise<void> {
		const { default: PageDomain } = await import("../../domains/page/index.js");
		const domain = new PageDomain();
		await domain.create(command);
	}

	private async handlePageList(command: CLICommand): Promise<void> {
		const { default: PageDomain } = await import("../../domains/page/index.js");
		const domain = new PageDomain();
		await domain.list(command);
	}

	private async handleModelGenerate(command: CLICommand): Promise<void> {
		const { default: ModelDomain } = await import(
			"../../domains/model/index.js"
		);
		const domain = new ModelDomain();
		await domain.generate(command);
	}

	private async handleModelCreate(command: CLICommand): Promise<void> {
		const { default: ModelDomain } = await import(
			"../../domains/model/index.js"
		);
		const domain = new ModelDomain();
		await domain.create(command);
	}

	private async handleModelScaffold(command: CLICommand): Promise<void> {
		const { default: ModelDomain } = await import(
			"../../domains/model/index.js"
		);
		const domain = new ModelDomain();
		await domain.scaffold(command);
	}

	private async handleModelMigrate(command: CLICommand): Promise<void> {
		const { default: ModelDomain } = await import(
			"../../domains/model/index.js"
		);
		const domain = new ModelDomain();
		await domain.migrate(command);
	}

	private async handleThemeCreate(command: CLICommand): Promise<void> {
		const { default: ThemeDomain } = await import(
			"../../domains/theme/index.js"
		);
		const domain = new ThemeDomain();
		await domain.create(command);
	}

	private async handleThemeList(command: CLICommand): Promise<void> {
		const { default: ThemeDomain } = await import(
			"../../domains/theme/index.js"
		);
		const domain = new ThemeDomain();
		await domain.list(command);
	}

	private async handleAIGenerate(command: CLICommand): Promise<void> {
		const { default: AIDomain } = await import("../../domains/ai/index.js");
		const domain = new AIDomain();
		await domain.generate(command);
	}

	private async handleAIService(command: CLICommand): Promise<void> {
		const { default: AIDomain } = await import("../../domains/ai/index.js");
		const domain = new AIDomain();
		await domain.generateService(command);
	}

	private async handleBuild(command: CLICommand): Promise<void> {
		// For now, delegate to component domain for build
		const { default: ComponentDomain } = await import(
			"../../domains/component/index.js"
		);
		const domain = new ComponentDomain();
		await domain.build(command);
	}

	private async handleMCPConnect(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.connect(command);
	}

	private async handleMCPDeploy(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.deploy(command);
	}

	private async handleMCPAnalyze(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.analyze(command);
	}

	private async handleMCPSuggestions(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.suggestions(command);
	}

	private async handleMCPContext(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.context(command);
	}

	private async handleMCPGenerate(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.generate(command);
	}

	private async handleMCPList(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.list(command);
	}

	private async handleMCPInfo(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.info(command);
	}

	private async handleMCPDisconnect(command: CLICommand): Promise<void> {
		const { default: MCPDomain } = await import("../../domains/mcp/index.js");
		const domain = new MCPDomain();
		await domain.disconnect(command);
	}

	private async handleHelp(command: CLICommand): Promise<void> {
		const { default: HelpDomain } = await import("../../domains/help/index.js");
		const domain = new HelpDomain();
		await domain.show(command);
	}

	private async handleHelpSearch(command: CLICommand): Promise<void> {
		const { default: HelpDomain } = await import("../../domains/help/index.js");
		const domain = new HelpDomain();
		await domain.search(command);
	}

	private async handleHelpExamples(command: CLICommand): Promise<void> {
		const { default: HelpDomain } = await import("../../domains/help/index.js");
		const domain = new HelpDomain();
		await domain.examples(command);
	}

	private async handleAliases(command: CLICommand): Promise<void> {
		const { cliLogger } = await import("../../utils/logger.js");
		const chalk = await import("chalk");

		const helpText = this.aliasResolver.showAliasHelp();
		cliLogger.info(chalk.default.blue("🔗 Command Aliases and Shortcuts"));
		cliLogger.info(helpText);
	}

	private async handleMakeCommand(command: CLICommand): Promise<void> {
		const { default: MakeDomain } = await import("../../domains/make/index.js");
		const domain = new MakeDomain();
		await domain.execute(command);
	}

	// AI Command Handlers (Codebuff integration)
	private async handleAICode(command: CLICommand): Promise<void> {
		const { codebuffCommand } = await import("../../commands/ai.js");
		const prompt = command.target || '';
		await codebuffCommand(prompt, {
			model: command.options.model,
			dryRun: command.options.dryRun,
			autoCommit: !command.options.noAutoCommit,
			interactive: !command.options.noInteractive,
			index: command.options.index
		});
	}

	private async handleAIFixTests(command: CLICommand): Promise<void> {
		const { fixTestsCommand } = await import("../../commands/ai.js");
		await fixTestsCommand({
			model: command.options.model,
			dryRun: command.options.dryRun,
			autoCommit: !command.options.noAutoCommit,
			interactive: !command.options.noInteractive
		});
	}

	private async handleAINorwegian(command: CLICommand): Promise<void> {
		const { norwegianComplianceCommand } = await import("../../commands/ai.js");
		const prompt = command.target || '';
		await norwegianComplianceCommand(prompt, {
			model: command.options.model,
			dryRun: command.options.dryRun,
			autoCommit: !command.options.noAutoCommit,
			interactive: !command.options.noInteractive,
			index: command.options.index
		});
	}

	private async handleAIIndex(command: CLICommand): Promise<void> {
		const { createCodebuffIndex } = await import("../../lib/patch-utils.js");
		await createCodebuffIndex(process.cwd());
	}

	private async handleSecurityAudit(command: CLICommand): Promise<void> {
		const { securityAuditCommand } = await import("../../commands/security-audit.js");
		// Create a mock argv array for the security audit command
		const argv = ['node', 'xaheen', 'security-audit'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the security audit command
		await securityAuditCommand.parseAsync(argv.slice(2));
	}

	private async handleComplianceReport(command: CLICommand): Promise<void> {
		const { complianceReportCommand } = await import("../../commands/compliance-report.js");
		// Create a mock argv array for the compliance report command
		const argv = ['node', 'xaheen', 'compliance-report'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the compliance report command
		await complianceReportCommand.parseAsync(argv.slice(2));
	}

	private async handleSecurityScan(command: CLICommand): Promise<void> {
		const { securityScanCommand } = await import("../../commands/security-scan.command.js");
		// Create a mock argv array for the security scan command
		const argv = ['node', 'xaheen', 'security-scan'];
		
		// Add project path argument if provided
		if (command.args && command.args.length > 0) {
			argv.push(command.args[0]);
		}
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});
		
		// Parse and execute the security scan command
		await securityScanCommand.parseAsync(argv.slice(2));
	}

	// Template Modernization handler
	private async handleTemplateModernize(command: CLICommand): Promise<void> {
		const { modernizeTemplatesCommand } = await import("../../commands/modernize-templates.js");
		// Create a mock argv array for the modernize templates command
		const argv = ['node', 'xaheen', 'modernize'];
		
		// Add target pattern if provided
		if (command.target) {
			argv.push('--target', command.target);
		}
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the modernize templates command
		await modernizeTemplatesCommand.parseAsync(argv.slice(2));
	}

	// Documentation domain handlers
	private async handleDocsGenerate(command: CLICommand): Promise<void> {
		const { docsCommand } = await import("../../commands/docs.js");
		// Create a mock argv array for the docs generate command
		const argv = ['node', 'xaheen', 'docs'];
		
		// Add type if specified
		if (command.arguments.type) {
			argv.push('--type', command.arguments.type);
		}
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the docs command
		await docsCommand.parseAsync(argv.slice(2));
	}

	private async handleDocsPortal(command: CLICommand): Promise<void> {
		const { docsCommand } = await import("../../commands/docs.js");
		// Create a mock argv array for the docs portal command
		const argv = ['node', 'xaheen', 'docs', '--portal'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the docs portal command
		await docsCommand.parseAsync(argv.slice(2));
	}

	private async handleDocsOnboarding(command: CLICommand): Promise<void> {
		const { docsCommand } = await import("../../commands/docs.js");
		// Create a mock argv array for the docs onboarding command
		const argv = ['node', 'xaheen', 'docs', '--onboarding'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the docs onboarding command
		await docsCommand.parseAsync(argv.slice(2));
	}

	private async handleDocsSync(command: CLICommand): Promise<void> {
		const { docsCommand } = await import("../../commands/docs.js");
		// Create a mock argv array for the docs sync command
		const argv = ['node', 'xaheen', 'docs', '--sync'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the docs sync command
		await docsCommand.parseAsync(argv.slice(2));
	}

	private async handleDocsWatch(command: CLICommand): Promise<void> {
		const { docsCommand } = await import("../../commands/docs.js");
		// Create a mock argv array for the docs watch command
		const argv = ['node', 'xaheen', 'docs', '--watch'];
		
		// Add command options
		Object.entries(command.options).forEach(([key, value]) => {
			if (value !== undefined && value !== false) {
				if (value === true) {
					argv.push(`--${key}`);
				} else {
					argv.push(`--${key}`, String(value));
				}
			}
		});

		// Parse and execute the docs watch command
		await docsCommand.parseAsync(argv.slice(2));
	}

	public async parse(args?: string[]): Promise<void> {
		try {
			await this.program.parseAsync(args);
		} catch (error) {
			if (error instanceof CLIError) {
				logger.error(`CLI Error [${error.code}]: ${error.message}`);
				process.exit(1);
			} else {
				logger.error("Unexpected error:", error);
				process.exit(1);
			}
		}
	}

	public getProgram(): Command {
		return this.program;
	}

	public getRoutes(): Map<string, CommandRoute> {
		return this.routes;
	}
}

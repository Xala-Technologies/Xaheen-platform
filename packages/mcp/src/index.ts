#!/usr/bin/env node

/**
 * Xala UI System MCP Server v6.1.2
 * Multi-platform component generation server supporting React, Next.js, Vue, Angular, Svelte, Electron, React Native
 * v5.0 Semantic Architecture with comprehensive component library
 * Enhanced with shadcn-ui inspired developer experience improvements + comprehensive AI agent integration
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { EnhancedValidator } from "./utils/enhanced-validation.js";
import { ComponentGenerator } from "./generators/ComponentGenerator.js";
import { TemplateManager } from "./templates/TemplateManager.js";
import specificationTools, {
	specificationToolHandlers,
} from "./tools/specification-tools.js";
import {
	componentRetrievalTools,
	componentRetrievalToolHandlers,
} from "./tools/component-retrieval-tools.js";
import {
	quickGenerateTools,
	quickGenerateToolHandlers,
} from "./tools/quick-generate-tools.js";
import {
	cliStyleTools,
	cliStyleToolHandlers,
} from "./tools/cli-style-tools.js";
import { ComponentConfig, GenerationContext } from "./types/index.js";

// Zod schemas for validation
const ComponentConfigSchema = z.object({
	name: z.string().min(1),
	category: z.enum([
		// v6.0 Multi-platform categories
		"components",
		"data-components",
		"theme-components",
		"layouts",
		"providers",
		"patterns",
		"tools",
		// Legacy categories
		"navigation",
		"form",
		"data-display",
		"feedback",
		"interactive",
		"specialized",
		"page-template",
	]),
	platform: z
		.enum([
			"react",
			"nextjs",
			"vue",
			"angular",
			"svelte",
			"electron",
			"react-native",
		])
		.optional(),
	variant: z.string().optional(),
	size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
	theme: z
		.enum([
			"enterprise",
			"finance",
			"healthcare",
			"education",
			"ecommerce",
			"productivity",
			"oslo",
			"bergen",
			"drammen",
		])
		.optional(),
	locale: z.enum(["en", "nb-NO", "fr", "ar"]).optional(),
	platformConfig: z
		.object({
			platform: z.enum([
				"react",
				"nextjs",
				"vue",
				"angular",
				"svelte",
				"electron",
				"react-native",
			]),
			architecture: z.enum(["v5-cva", "semantic", "hybrid"]).optional(),
			features: z
				.object({
					appRouter: z.boolean().optional(),
					pagesRouter: z.boolean().optional(),
					serverComponents: z.boolean().optional(),
					compositionApi: z.boolean().optional(),
					scriptSetup: z.boolean().optional(),
					pinia: z.boolean().optional(),
					standaloneComponents: z.boolean().optional(),
					signals: z.boolean().optional(),
					ngTranslate: z.boolean().optional(),
					svelteKit: z.boolean().optional(),
					stores: z.boolean().optional(),
					mainProcess: z.boolean().optional(),
					rendererProcess: z.boolean().optional(),
					nativeApis: z.boolean().optional(),
					expo: z.boolean().optional(),
					navigation: z.boolean().optional(),
				})
				.optional(),
			outputPath: z.string().optional(),
			templateEngine: z.enum(["handlebars", "ejs"]).optional(),
		})
		.optional(),
	features: z.object({
		interactive: z.boolean().optional(),
		animated: z.boolean().optional(),
		searchable: z.boolean().optional(),
		sortable: z.boolean().optional(),
		filterable: z.boolean().optional(),
		paginated: z.boolean().optional(),
		selectable: z.boolean().optional(),
		draggable: z.boolean().optional(),
		resizable: z.boolean().optional(),
		collapsible: z.boolean().optional(),
		tooltips: z.boolean().optional(),
		icons: z.boolean().optional(),
		badges: z.boolean().optional(),
		loading: z.boolean().optional(),
		error: z.boolean().optional(),
		validation: z.boolean().optional(),
	}),
	styling: z.object({
		variant: z.enum([
			"default",
			"outline",
			"ghost",
			"destructive",
			"secondary",
		]),
		colorScheme: z.enum(["light", "dark", "auto"]).optional(),
		borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
		shadow: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
		spacing: z.enum(["compact", "comfortable", "spacious"]).optional(),
	}),
	accessibility: z.object({
		level: z.enum(["AA", "AAA"]),
		screenReader: z.boolean(),
		keyboardNavigation: z.boolean(),
		highContrast: z.boolean(),
		reducedMotion: z.boolean(),
		focusManagement: z.boolean(),
		ariaLabels: z.boolean(),
	}),
	responsive: z.object({
		breakpoints: z.array(
			z.enum(["mobile", "tablet", "desktop", "wide", "ultra"]),
		),
		mobileFirst: z.boolean(),
		adaptiveLayout: z.boolean(),
		touchOptimized: z.boolean(),
		fluidTypography: z.boolean(),
	}),
});

const GenerationContextSchema = z.object({
	projectPath: z.string().optional(),
	outputPath: z.string().optional(),
	overwrite: z.boolean().optional(),
	format: z.boolean().optional(),
	addTests: z.boolean().optional(),
	addStories: z.boolean().optional(),
	addDocs: z.boolean().optional(),
	platform: z
		.enum([
			"react",
			"nextjs",
			"vue",
			"angular",
			"svelte",
			"electron",
			"react-native",
		])
		.optional(),
	architecture: z.enum(["v5-cva", "semantic", "hybrid"]).optional(),
	templateEngine: z.enum(["handlebars", "ejs"]).optional(),
});

class XalaUISystemMCPServer {
	private server: Server;
	private componentGenerator: ComponentGenerator;
	private templateManager: TemplateManager;

	constructor() {
		this.server = new Server(
			{
				name: "xala-ui-system-mcp",
				version: "6.1.2",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.componentGenerator = new ComponentGenerator();
		this.templateManager = new TemplateManager();
		this.setupToolHandlers();
	}

	private setupToolHandlers(): void {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => {
			return {
				tools: [
					// Quick generate tools (streamlined interface)
					...quickGenerateTools,
					// Component retrieval tools (inspired by shadcn-ui MCP)
					...componentRetrievalTools,
					// CLI-style tools (familiar commands)
					...cliStyleTools,
					// Specification-based tools
					...specificationTools.tools,
					{
						name: "generate_multi_platform_component",
						description:
							"Generate components for any of the 7 supported platforms (React, Next.js, Vue, Angular, Svelte, Electron, React Native) with v5.0 semantic architecture",
						inputSchema: {
							type: "object",
							properties: {
								config: {
									type: "object",
									description: "Multi-platform component configuration",
									properties: {
										name: { type: "string", description: "Component name" },
										platform: {
											type: "string",
											enum: [
												"react",
												"nextjs",
												"vue",
												"angular",
												"svelte",
												"electron",
												"react-native",
											],
											description: "Target platform",
										},
										category: {
											type: "string",
											enum: [
												"components",
												"data-components",
												"theme-components",
												"layouts",
												"providers",
												"patterns",
												"tools",
											],
											description: "Component category",
										},
										platformConfig: {
											type: "object",
											description: "Platform-specific configuration",
											properties: {
												architecture: {
													type: "string",
													enum: ["v5-cva", "semantic", "hybrid"],
												},
												features: {
													type: "object",
													description: "Platform-specific features",
												},
											},
										},
									},
									required: ["name", "platform", "category"],
								},
							},
							required: ["config"],
						},
					},
					{
						name: "generate_all_platforms",
						description:
							"Generate component for all supported platforms simultaneously",
						inputSchema: {
							type: "object",
							properties: {
								config: {
									type: "object",
									description:
										"Component configuration (platform will be ignored)",
								},
							},
							required: ["config"],
						},
					},
					{
						name: "list_platform_components",
						description: "List available components for a specific platform",
						inputSchema: {
							type: "object",
							properties: {
								platform: {
									type: "string",
									enum: [
										"react",
										"nextjs",
										"vue",
										"angular",
										"svelte",
										"electron",
										"react-native",
									],
									description: "Platform to list components for",
								},
							},
							required: ["platform"],
						},
					},
					{
						name: "get_platform_info",
						description:
							"Get detailed information about a platform including supported features and architecture",
						inputSchema: {
							type: "object",
							properties: {
								platform: {
									type: "string",
									enum: [
										"react",
										"nextjs",
										"vue",
										"angular",
										"svelte",
										"electron",
										"react-native",
									],
									description: "Platform to get information for",
								},
							},
							required: ["platform"],
						},
					},
					{
						name: "generate_component",
						description:
							"Generate a React component using Xala UI System with full TypeScript, accessibility, and localization support (Legacy)",
						inputSchema: {
							type: "object",
							properties: {
								config: {
									type: "object",
									description: "Component configuration",
								},
								context: {
									type: "object",
									description: "Generation context and options",
								},
							},
							required: ["config"],
						},
					},
					{
						name: "generate_layout",
						description:
							"Generate a complete layout component (Admin, Web, Desktop, Mobile, Tablet)",
						inputSchema: {
							type: "object",
							properties: {
								layoutType: {
									type: "string",
									enum: ["admin", "web", "desktop", "mobile", "tablet", "base"],
									description: "Type of layout to generate",
								},
								name: {
									type: "string",
									description: "Name of the layout component",
								},
								features: {
									type: "object",
									description:
										"Layout features (sidebar, header, footer, navigation)",
								},
								theme: {
									type: "string",
									enum: [
										"enterprise",
										"finance",
										"healthcare",
										"education",
										"ecommerce",
										"productivity",
									],
									description: "Industry theme",
								},
							},
							required: ["layoutType", "name"],
						},
					},
					{
						name: "generate_page_template",
						description:
							"Generate a complete page template (Dashboard, Landing, Auth, Profile, Settings, etc.)",
						inputSchema: {
							type: "object",
							properties: {
								template: {
									type: "string",
									enum: [
										"dashboard",
										"landing",
										"auth",
										"profile",
										"settings",
										"analytics",
										"user-management",
										"content-management",
										"e-commerce",
										"blog",
									],
									description: "Type of page template",
								},
								name: {
									type: "string",
									description: "Name of the page component",
								},
								sections: {
									type: "array",
									description: "Page sections to include",
								},
								data: {
									type: "object",
									description: "Sample data for the template",
								},
							},
							required: ["template", "name"],
						},
					},
					{
						name: "generate_form",
						description:
							"Generate a complete form with validation, accessibility, and localization",
						inputSchema: {
							type: "object",
							properties: {
								name: {
									type: "string",
									description: "Name of the form component",
								},
								fields: {
									type: "array",
									description: "Form fields configuration",
								},
								validation: {
									type: "object",
									description: "Validation configuration",
								},
								submission: {
									type: "object",
									description: "Form submission configuration",
								},
							},
							required: ["name", "fields"],
						},
					},
					{
						name: "generate_data_table",
						description:
							"Generate a data table with sorting, filtering, pagination, and actions",
						inputSchema: {
							type: "object",
							properties: {
								name: {
									type: "string",
									description: "Name of the table component",
								},
								columns: {
									type: "array",
									description: "Table columns configuration",
								},
								features: {
									type: "object",
									description:
										"Table features (sorting, filtering, pagination, etc.)",
								},
								actions: {
									type: "array",
									description: "Row actions configuration",
								},
							},
							required: ["name", "columns"],
						},
					},
					{
						name: "generate_navigation",
						description:
							"Generate navigation components (Navbar, Sidebar, Breadcrumb, Tabs)",
						inputSchema: {
							type: "object",
							properties: {
								type: {
									type: "string",
									enum: [
										"navbar",
										"sidebar",
										"breadcrumb",
										"tabs",
										"pagination",
									],
									description: "Type of navigation component",
								},
								name: {
									type: "string",
									description: "Name of the navigation component",
								},
								items: {
									type: "array",
									description: "Navigation items configuration",
								},
								features: {
									type: "object",
									description:
										"Navigation features (search, user menu, theme switcher, etc.)",
								},
							},
							required: ["type", "name"],
						},
					},
					{
						name: "list_templates",
						description:
							"List all available component templates with descriptions and examples",
						inputSchema: {
							type: "object",
							properties: {
								category: {
									type: "string",
									enum: [
										"layout",
										"navigation",
										"form",
										"data-display",
										"feedback",
										"interactive",
										"specialized",
										"page-template",
										"all",
									],
									description: "Filter templates by category",
								},
							},
						},
					},
					{
						name: "get_template_config",
						description:
							"Get the default configuration for a specific template",
						inputSchema: {
							type: "object",
							properties: {
								templateName: {
									type: "string",
									description: "Name of the template",
								},
							},
							required: ["templateName"],
						},
					},
					{
						name: "validate_config",
						description: "Validate a component configuration before generation",
						inputSchema: {
							type: "object",
							properties: {
								config: {
									type: "object",
									description: "Component configuration to validate",
								},
							},
							required: ["config"],
						},
					},
					{
						name: "generate_complete_project",
						description:
							"Generate a complete project structure with multiple components, layouts, and pages",
						inputSchema: {
							type: "object",
							properties: {
								projectName: {
									type: "string",
									description: "Name of the project",
								},
								projectType: {
									type: "string",
									enum: [
										"saas",
										"admin-dashboard",
										"marketing-site",
										"e-commerce",
										"blog",
										"portfolio",
									],
									description: "Type of project to generate",
								},
								features: {
									type: "array",
									description: "Project features to include",
								},
								theme: {
									type: "string",
									description: "Project theme",
								},
							},
							required: ["projectName", "projectType"],
						},
					},
				] as Tool[],
			};
		});

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const { name, arguments: args } = request.params;

			try {
				// Handle quick generate tools first (highest priority)
				if (
					quickGenerateToolHandlers[
						name as keyof typeof quickGenerateToolHandlers
					]
				) {
					const result =
						await quickGenerateToolHandlers[
							name as keyof typeof quickGenerateToolHandlers
						](args);
					return {
						content: [
							{
								type: "text",
								text:
									typeof result === "string"
										? result
										: JSON.stringify(result, null, 2),
							},
						],
					};
				}

				// Handle CLI-style tools
				if (
					cliStyleToolHandlers[
						name as keyof typeof cliStyleToolHandlers
					]
				) {
					const result =
						await cliStyleToolHandlers[
							name as keyof typeof cliStyleToolHandlers
						](args);
					return {
						content: [
							{
								type: "text",
								text:
									typeof result === "string"
										? result
										: JSON.stringify(result, null, 2),
							},
						],
					};
				}

				// Handle component retrieval tools
				if (
					componentRetrievalToolHandlers[
						name as keyof typeof componentRetrievalToolHandlers
					]
				) {
					const result =
						await componentRetrievalToolHandlers[
							name as keyof typeof componentRetrievalToolHandlers
						](args);
					return {
						content: [
							{
								type: "text",
								text:
									typeof result === "string"
										? result
										: JSON.stringify(result, null, 2),
							},
						],
					};
				}

				// Handle specification-based tools
				if (
					specificationToolHandlers[
						name as keyof typeof specificationToolHandlers
					]
				) {
					const result =
						await specificationToolHandlers[
							name as keyof typeof specificationToolHandlers
						](args);
					return {
						content: [
							{
								type: "text",
								text:
									typeof result === "string"
										? result
										: JSON.stringify(result, null, 2),
							},
						],
					};
				}

				switch (name) {
					case "generate_multi_platform_component":
						return await this.handleGenerateMultiPlatformComponent(args);
					case "generate_all_platforms":
						return await this.handleGenerateAllPlatforms(args);
					case "list_platform_components":
						return await this.handleListPlatformComponents(args);
					case "get_platform_info":
						return await this.handleGetPlatformInfo(args);
					case "generate_component":
						return await this.handleGenerateComponent(args);
					case "generate_layout":
						return await this.handleGenerateLayout(args);
					case "generate_page_template":
						return await this.handleGeneratePageTemplate(args);
					case "generate_form":
						return await this.handleGenerateForm(args);
					case "generate_data_table":
						return await this.handleGenerateDataTable(args);
					case "generate_navigation":
						return await this.handleGenerateNavigation(args);
					case "list_templates":
						return await this.handleListTemplates(args);
					case "get_template_config":
						return await this.handleGetTemplateConfig(args);
					case "validate_config":
						return await this.handleValidateConfig(args);
					case "generate_complete_project":
						return await this.handleGenerateCompleteProject(args);
					default:
						throw new Error(`Unknown tool: ${name}`);
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
					isError: true,
				};
			}
		});
	}

	private async handleGenerateMultiPlatformComponent(args: any) {
		const { config } = args;
		const validatedConfig = ComponentConfigSchema.parse(config);

		const result =
			await this.componentGenerator.generateMultiPlatformComponent(
				validatedConfig,
			);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Multi-Platform Component: ${validatedConfig.name}
Platform: **${result.platform}**
Architecture: **${result.architecture}**

## Component Code

\`\`\`${this.getFileExtension(result.platform)}
${result.componentCode}
\`\`\`

## Types

\`\`\`typescript
${result.typesCode}
\`\`\`

## Localization Keys

\`\`\`json
${JSON.stringify(result.localizationKeys, null, 2)}
\`\`\`

## Dependencies

${result.dependencies.map((dep) => `- ${dep}`).join("\n")}

## Files Generated

${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}

## Platform Features
- **Architecture**: ${result.architecture}
- **Localization**: ${this.getLocalizationPattern(result.platform)}
- **File Extension**: ${this.getFileExtension(result.platform)}
- **Framework**: ${this.getPlatformFramework(result.platform)}`,
				},
			],
		};
	}

	private async handleGenerateAllPlatforms(args: any) {
		const { config } = args;
		const validatedConfig = ComponentConfigSchema.parse(config);

		const results =
			await this.componentGenerator.generateAllPlatforms(validatedConfig);
		const platforms = Object.keys(results);

		let response = `# Generated Component for All Platforms: ${validatedConfig.name}\n\n`;
		response += `Generated for **${platforms.length}** platforms: ${platforms.join(", ")}\n\n`;

		for (const [platform, result] of Object.entries(results)) {
			response += `## ${platform.toUpperCase()}\n\n`;
			response += `**Architecture**: ${result.architecture}\n`;
			response += `**Files**: ${result.files.length}\n`;
			response += `**Dependencies**: ${result.dependencies.length}\n\n`;
			response += `\`\`\`${this.getFileExtension(platform as any)}
${result.componentCode.slice(0, 300)}...
\`\`\`\n\n`;
		}

		response += `## Summary\n\n`;
		response += `Total files generated: **${Object.values(results).reduce((sum, result) => sum + result.files.length, 0)}**\n`;
		response += `Unique dependencies: **${new Set(Object.values(results).flatMap((result) => result.dependencies)).size}**\n`;

		return {
			content: [
				{
					type: "text",
					text: response,
				},
			],
		};
	}

	private async handleListPlatformComponents(args: any) {
		const { platform } = args;
		const components = this.componentGenerator.getAvailableComponents(platform);
		const platformConfig = this.componentGenerator.getPlatformConfig(platform);

		const componentsByCategory = components.reduce(
			(acc, component) => {
				// Simple categorization based on component name
				let category = "components";
				if (
					[
						"data-table",
						"virtual-list",
						"command-palette",
						"global-search",
					].includes(component)
				) {
					category = "data-components";
				} else if (["theme-switcher", "theme-selector"].includes(component)) {
					category = "theme-components";
				} else if (["app-shell", "layout"].includes(component)) {
					category = "layouts";
				} else if (
					component.includes("provider") ||
					component.includes("boundary")
				) {
					category = "providers";
				} else if (
					["render-props", "hoc-collection", "component-factory"].includes(
						component,
					)
				) {
					category = "patterns";
				} else if (
					["performance-monitor", "code-generator"].includes(component)
				) {
					category = "tools";
				}

				if (!acc[category]) acc[category] = [];
				acc[category]!.push(component);
				return acc;
			},
			{} as Record<string, string[]>,
		);

		let response = `# Available Components for ${platform.toUpperCase()}\n\n`;
		response += `**Total Components**: ${components.length}\n`;
		response += `**Template Path**: ${platformConfig.templatePath}\n`;
		response += `**File Extension**: ${platformConfig.fileExtension}\n`;
		response += `**Localization Pattern**: ${platformConfig.localizationPattern}\n\n`;

		for (const [category, categoryComponents] of Object.entries(
			componentsByCategory,
		)) {
			response += `## ${category.toUpperCase().replace("-", " ")}\n\n`;
			categoryComponents.forEach((component) => {
				response += `- **${component}** - ${this.getComponentDescription(component)}\n`;
			});
			response += "\n";
		}

		return {
			content: [
				{
					type: "text",
					text: response,
				},
			],
		};
	}

	private async handleGetPlatformInfo(args: any) {
		const { platform } = args;
		const platformConfig = this.componentGenerator.getPlatformConfig(platform);
		const components = this.componentGenerator.getAvailableComponents(platform);

		const response = `# Platform Information: ${platform.toUpperCase()}

## Overview
- **Platform**: ${platform}
- **Architecture**: ${this.getPlatformArchitecture(platform)}
- **Framework**: ${this.getPlatformFramework(platform)}
- **File Extension**: ${platformConfig.fileExtension}
- **Template Path**: ${platformConfig.templatePath}
- **Localization Pattern**: ${platformConfig.localizationPattern}

## Supported Features
${this.getPlatformFeatures(platform)}

## Component Library
- **Total Components**: ${components.length}
- **Categories**: ${this.getUniqueCategories(components).length}

## Architecture Details
${this.getArchitectureDetails(platform)}

## Example Usage

\`\`\`json
{
  "name": "generate_multi_platform_component",
  "arguments": {
    "config": {
      "name": "UserCard",
      "platform": "${platform}",
      "category": "components",
      "platformConfig": {
        "architecture": "semantic",
        "features": ${JSON.stringify(this.getDefaultPlatformFeatures(platform), null, 8)}
      }
    }
  }
}
\`\`\`

## Best Practices
${this.getPlatformBestPractices(platform)}
`;

		return {
			content: [
				{
					type: "text",
					text: response,
				},
			],
		};
	}

	private async handleGenerateComponent(args: any) {
		const { config, context } = args;
		const validatedConfig = ComponentConfigSchema.parse(config);
		const validatedContext = context
			? GenerationContextSchema.parse(context)
			: {};

		const result =
			await this.componentGenerator.generateComponent(validatedConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Component: ${validatedConfig.name}\n\n## Component Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Types\n\n\`\`\`typescript\n${result.typesCode}\n\`\`\`\n\n## Localization Keys\n\n\`\`\`json\n${JSON.stringify(result.localizationKeys, null, 2)}\n\`\`\`\n\n## Dependencies\n\n${result.dependencies.map((dep) => `- ${dep}`).join("\n")}\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleGenerateLayout(args: any) {
		const layoutConfig = {
			name: args.name,
			category: "layouts" as const,
			layoutType: args.layoutType,
			features: args.features || {},
			styling: {
				variant: "default" as const,
			},
			accessibility: {
				level: "AAA" as const,
				screenReader: true,
				keyboardNavigation: true,
				highContrast: false,
				reducedMotion: false,
				focusManagement: true,
				ariaLabels: true,
			},
			responsive: {
				breakpoints: ["mobile", "tablet", "desktop"] as Array<
					"mobile" | "tablet" | "desktop" | "wide" | "ultra"
				>,
				mobileFirst: true,
				adaptiveLayout: true,
				touchOptimized: true,
				fluidTypography: true,
			},
			theme: args.theme || "enterprise",
			sections: [],
		};

		const result = await this.componentGenerator.generateLayout(layoutConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Layout: ${args.name}\n\n## Layout Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleGeneratePageTemplate(args: any) {
		const pageConfig = {
			name: args.name,
			category: "page-template" as const,
			template: args.template,
			sections: args.sections || [],
			data: args.data || {},
			styling: {
				variant: "default" as const,
			},
			accessibility: {
				level: "AAA" as const,
				screenReader: true,
				keyboardNavigation: true,
				highContrast: false,
				reducedMotion: false,
				focusManagement: true,
				ariaLabels: true,
			},
			responsive: {
				breakpoints: ["mobile", "tablet", "desktop"] as Array<
					"mobile" | "tablet" | "desktop" | "wide" | "ultra"
				>,
				mobileFirst: true,
				adaptiveLayout: true,
				touchOptimized: true,
				fluidTypography: true,
			},
			features: {},
			layout: {} as any,
		};

		const result =
			await this.componentGenerator.generatePageTemplate(pageConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Page Template: ${args.name}\n\n## Page Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleGenerateForm(args: any) {
		const formConfig = {
			name: args.name,
			category: "form" as const,
			fields: args.fields,
			validation: args.validation || {
				realTime: true,
				showErrors: true,
				errorPosition: "inline",
			},
			submission: args.submission || {
				method: "POST",
				endpoint: "/api/submit",
			},
			styling: {
				variant: "default" as const,
			},
			accessibility: {
				level: "AAA" as const,
				screenReader: true,
				keyboardNavigation: true,
				highContrast: false,
				reducedMotion: false,
				focusManagement: true,
				ariaLabels: true,
			},
			responsive: {
				breakpoints: ["mobile", "tablet", "desktop"] as Array<
					"mobile" | "tablet" | "desktop" | "wide" | "ultra"
				>,
				mobileFirst: true,
				adaptiveLayout: true,
				touchOptimized: true,
				fluidTypography: true,
			},
			features: {
				validation: true,
			},
		};

		const result = await this.componentGenerator.generateForm(formConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Form: ${args.name}\n\n## Form Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleGenerateDataTable(args: any) {
		const tableConfig = {
			name: args.name,
			category: "data-display" as const,
			columns: args.columns,
			features: args.features || {
				sorting: true,
				filtering: true,
				pagination: true,
				selection: false,
				search: true,
				export: false,
			},
			actions: args.actions || [],
			styling: {
				variant: "default" as const,
			},
			accessibility: {
				level: "AAA" as const,
				screenReader: true,
				keyboardNavigation: true,
				highContrast: false,
				reducedMotion: false,
				focusManagement: true,
				ariaLabels: true,
			},
			responsive: {
				breakpoints: ["mobile", "tablet", "desktop"] as Array<
					"mobile" | "tablet" | "desktop" | "wide" | "ultra"
				>,
				mobileFirst: true,
				adaptiveLayout: true,
				touchOptimized: true,
				fluidTypography: true,
			},
		};

		const result = await this.componentGenerator.generateDataTable(tableConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Data Table: ${args.name}\n\n## Table Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleGenerateNavigation(args: any) {
		const navConfig = {
			name: args.name,
			category: "navigation" as const,
			type: args.type,
			items: args.items || [],
			features: args.features || {},
			styling: {
				variant: "default" as const,
			},
			accessibility: {
				level: "AAA" as const,
				screenReader: true,
				keyboardNavigation: true,
				highContrast: false,
				reducedMotion: false,
				focusManagement: true,
				ariaLabels: true,
			},
			responsive: {
				breakpoints: ["mobile", "tablet", "desktop"] as Array<
					"mobile" | "tablet" | "desktop" | "wide" | "ultra"
				>,
				mobileFirst: true,
				adaptiveLayout: true,
				touchOptimized: true,
				fluidTypography: true,
			},
		};

		const result = await this.componentGenerator.generateNavigation(navConfig);

		return {
			content: [
				{
					type: "text",
					text: `# Generated Navigation: ${args.name}\n\n## Navigation Code\n\n\`\`\`tsx\n${result.componentCode}\n\`\`\`\n\n## Files Generated\n\n${result.files.map((file) => `- ${file.path} (${file.type})`).join("\n")}`,
				},
			],
		};
	}

	private async handleListTemplates(args: any) {
		const templates = this.templateManager.listTemplates(
			args.category || "all",
		);

		const templateList = templates
			.map(
				(template) =>
					`## ${template.name}\n**Category:** ${template.category}\n**Description:** ${template.description}\n**Required Features:** ${template.requiredFeatures.join(", ")}\n`,
			)
			.join("\n");

		return {
			content: [
				{
					type: "text",
					text: `# Available Templates\n\n${templateList}`,
				},
			],
		};
	}

	private async handleGetTemplateConfig(args: any) {
		const template = this.templateManager.getTemplate(args.templateName);

		if (!template) {
			throw new Error(`Template not found: ${args.templateName}`);
		}

		return {
			content: [
				{
					type: "text",
					text: `# Template Configuration: ${template.name}\n\n\`\`\`json\n${JSON.stringify(template.defaultConfig, null, 2)}\n\`\`\`\n\n**Description:** ${template.description}\n**Required Features:** ${template.requiredFeatures.join(", ")}`,
				},
			],
		};
	}

	private async handleValidateConfig(args: any) {
		// Use enhanced validation for better error messages
		const validationResult = EnhancedValidator.validateComponentConfig(args.config);
		
		if (validationResult.success) {
			let response = `✅ **Configuration is valid!**\n\n`;
			
			if (validationResult.warnings && validationResult.warnings.length > 0) {
				response += `⚠️ **Warnings:**\n`;
				validationResult.warnings.forEach((warning, index) => {
					response += `${index + 1}. **${warning.field}**: ${warning.message}\n`;
					response += `   💡 Suggestion: ${warning.suggestion}\n\n`;
				});
			}
			
			response += `\`\`\`json\n${JSON.stringify(validationResult.data, null, 2)}\n\`\`\`\n\n`;
			
			// Add helpful suggestions
			const suggestions = EnhancedValidator.getValidationSuggestions(args.config);
			if (suggestions.length > 0) {
				response += `💡 **Additional Suggestions:**\n`;
				suggestions.forEach((suggestion, index) => {
					response += `${index + 1}. ${suggestion}\n`;
				});
			}
			
			return {
				content: [
					{
						type: "text",
						text: response,
					},
				],
			};
		} else {
			const errorMessage = EnhancedValidator.formatValidationError(validationResult);
			return {
				content: [
					{
						type: "text",
						text: errorMessage,
					},
				],
				isError: true,
			};
		}
	}

	private async handleGenerateCompleteProject(args: any) {
		// This would generate a complete project structure
		// For now, return a placeholder
		return {
			content: [
				{
					type: "text",
					text: `# Complete Project Generation: ${args.projectName}\n\nProject Type: ${args.projectType}\nTheme: ${args.theme || "enterprise"}\n\n🚧 Complete project generation is coming soon! This will generate:\n\n- Project structure\n- Multiple layouts\n- Page templates\n- Components\n- Navigation\n- Forms\n- Data tables\n- Localization files\n- Tests\n- Storybook stories\n- Documentation`,
				},
			],
		};
	}

	// Utility methods for multi-platform support
	private getFileExtension(platform: string): string {
		const extensions: Record<string, string> = {
			react: "tsx",
			nextjs: "tsx",
			vue: "vue",
			angular: "typescript",
			svelte: "svelte",
			electron: "tsx",
			"react-native": "tsx",
		};
		return extensions[platform] || "tsx";
	}

	private getLocalizationPattern(platform: string): string {
		const patterns: Record<string, string> = {
			react: "t()",
			nextjs: "t()",
			vue: "{{ t() }}",
			angular: "| translate",
			svelte: "{t()}",
			electron: "{t()}",
			"react-native": "t()",
		};
		return patterns[platform] || "t()";
	}

	private getPlatformFramework(platform: string): string {
		const frameworks: Record<string, string> = {
			react: "React 18+",
			nextjs: "Next.js 13+ with App Router",
			vue: "Vue 3 with Composition API",
			angular: "Angular 17+ Standalone Components",
			svelte: "Svelte 4+ with SvelteKit",
			electron: "Electron 25+ with React",
			"react-native": "React Native 0.72+ with Expo",
		};
		return frameworks[platform] || "Unknown";
	}

	private getPlatformArchitecture(platform: string): string {
		const architectures: Record<string, string> = {
			react: "v5.0 CVA Semantic",
			nextjs: "v5.0 CVA Semantic with SSR",
			vue: "Composition API with Design Tokens",
			angular: "Standalone Components with CSS Classes",
			svelte: "SvelteKit with Reactive Styling",
			electron: "Desktop Native with React",
			"react-native": "Mobile Native with Design Tokens",
		};
		return architectures[platform] || "Standard";
	}

	private getPlatformFeatures(platform: string): string {
		const features: Record<string, string[]> = {
			react: ["Server Components", "Hooks", "CVA Styling", "TypeScript Strict"],
			nextjs: [
				"App Router",
				"Pages Router",
				"Server Components",
				"SSR/SSG",
				"API Routes",
			],
			vue: [
				"Composition API",
				"Script Setup",
				"Pinia State",
				"Vue Router",
				"SFC Templates",
			],
			angular: [
				"Standalone Components",
				"Signals",
				"NgTranslate",
				"Dependency Injection",
			],
			svelte: [
				"SvelteKit",
				"Stores",
				"Reactive Statements",
				"Component Scoped CSS",
			],
			electron: [
				"Main Process",
				"Renderer Process",
				"Native APIs",
				"Window Controls",
			],
			"react-native": [
				"Expo Compatible",
				"Navigation",
				"Native Modules",
				"Platform APIs",
			],
		};

		return (
			features[platform]?.map((f) => `- ${f}`).join("\n") ||
			"- Standard features"
		);
	}

	private getComponentDescription(component: string): string {
		const descriptions: Record<string, string> = {
			navbar: "Navigation bar with responsive design and accessibility",
			modal: "Accessible modal dialog with backdrop and focus management",
			sidebar: "Collapsible sidebar navigation with nested menu support",
			header: "Page header with breadcrumbs and user actions",
			form: "Validated form with error handling and accessibility",
			card: "Content card with various layouts and interactive states",
			dashboard: "Complete dashboard layout with widgets and charts",
			"data-table":
				"Advanced data table with sorting, filtering, and pagination",
			"virtual-list": "Performance-optimized virtual list for large datasets",
			"command-palette": "Keyboard-driven command interface",
			"global-search": "Universal search with autocomplete and filtering",
			"theme-switcher": "Toggle between light and dark themes",
			"theme-selector": "Dropdown for selecting from multiple themes",
			"app-shell": "Main application layout structure",
			layout: "Flexible layout component with responsive breakpoints",
			"auth-provider": "Authentication context and state management",
			"theme-provider": "Theme context and CSS custom properties",
			"error-boundary": "Error handling and fallback UI component",
			"notification-provider": "Toast and notification system",
			"render-props": "Render props pattern implementation",
			"hoc-collection": "Higher-order components for common patterns",
			"component-factory": "Dynamic component creation and rendering",
			"performance-monitor": "Component performance tracking and metrics",
			"code-generator": "Dynamic code generation utilities",
		};
		return descriptions[component] || "Component description not available";
	}

	private getUniqueCategories(components: string[]): string[] {
		const categories = new Set<string>();
		components.forEach((component) => {
			if (
				[
					"data-table",
					"virtual-list",
					"command-palette",
					"global-search",
				].includes(component)
			) {
				categories.add("data-components");
			} else if (["theme-switcher", "theme-selector"].includes(component)) {
				categories.add("theme-components");
			} else if (["app-shell", "layout"].includes(component)) {
				categories.add("layouts");
			} else if (
				component.includes("provider") ||
				component.includes("boundary")
			) {
				categories.add("providers");
			} else if (
				["render-props", "hoc-collection", "component-factory"].includes(
					component,
				)
			) {
				categories.add("patterns");
			} else if (
				["performance-monitor", "code-generator"].includes(component)
			) {
				categories.add("tools");
			} else {
				categories.add("components");
			}
		});
		return Array.from(categories);
	}

	private getArchitectureDetails(platform: string): string {
		const details: Record<string, string> = {
			react: `- **v5.0 CVA Architecture**: Class Variance Authority for styling
- **Zero Raw HTML**: Only semantic components in pages  
- **Design Tokens**: Semantic props (spacing="lg", variant="hero")
- **Mandatory Localization**: All text uses t() functions
- **TypeScript Strict**: Explicit return types and readonly interfaces`,

			nextjs: `- **App Router Support**: Latest Next.js routing with layouts
- **Server Components**: RSC support with client boundaries
- **SSR/SSG**: Server-side rendering and static generation
- **API Routes**: Built-in API endpoint generation
- **v5.0 CVA Architecture**: Same as React with server optimizations`,

			vue: `- **Composition API**: Script setup with reactive composition
- **Single File Components**: Template, script, and style co-location
- **Pinia Integration**: Type-safe state management
- **Vue Router**: Declarative routing with guards
- **Semantic Architecture**: CSS classes with design tokens`,

			angular: `- **Standalone Components**: No NgModule dependencies
- **Angular Signals**: Reactive primitive for state management
- **Dependency Injection**: Built-in DI container
- **NgTranslate**: Internationalization with pipe syntax
- **CSS Classes**: Tailwind-based styling with semantic tokens`,

			svelte: `- **SvelteKit Ready**: Full-stack framework support
- **Reactive Statements**: Automatic reactivity with $:
- **Stores**: Global state management with writable stores
- **Component Scoped CSS**: Isolated styling with preprocessors
- **Compile-time Optimizations**: Zero runtime overhead`,

			electron: `- **Desktop Native**: Cross-platform desktop application
- **IPC Communication**: Main and renderer process communication
- **Native APIs**: File system, notifications, system tray
- **Window Management**: Custom title bar and window controls
- **React Integration**: Web technologies with native capabilities`,

			"react-native": `- **Mobile Native**: iOS and Android native performance
- **Expo Compatible**: Development and deployment toolchain
- **Platform APIs**: Camera, geolocation, push notifications
- **Native Modules**: Bridge to platform-specific code
- **Design Tokens**: Mobile-optimized spacing and typography`,
		};

		return details[platform] || "- Standard architecture patterns";
	}

	private getDefaultPlatformFeatures(platform: string): Record<string, any> {
		const defaults: Record<string, Record<string, any>> = {
			react: { serverComponents: true },
			nextjs: { appRouter: true, serverComponents: true },
			vue: { compositionApi: true, scriptSetup: true },
			angular: { standaloneComponents: true, signals: true },
			svelte: { svelteKit: true, stores: true },
			electron: { rendererProcess: true, nativeApis: true },
			"react-native": { expo: true, navigation: true },
		};

		return defaults[platform] || {};
	}

	private getPlatformBestPractices(platform: string): string {
		const practices: Record<string, string> = {
			react: `- Use functional components with hooks
- Implement proper error boundaries
- Optimize with React.memo and useMemo
- Follow v5.0 CVA architecture patterns
- Use semantic components only in pages`,

			nextjs: `- Leverage App Router for new projects
- Use Server Components for data fetching
- Implement proper loading and error states
- Optimize images with next/image
- Use semantic architecture with server-side rendering`,

			vue: `- Prefer Composition API over Options API
- Use script setup for better performance
- Implement proper TypeScript integration
- Leverage Vue's reactivity system effectively
- Use single file components with scoped styles`,

			angular: `- Use standalone components for better tree-shaking
- Implement OnPush change detection strategy
- Use Angular Signals for reactive state
- Follow Angular style guide conventions
- Implement proper lazy loading for modules`,

			svelte: `- Use SvelteKit for full-stack applications
- Leverage compile-time optimizations
- Implement proper store patterns
- Use reactive statements ($:) judiciously
- Optimize bundle size with tree-shaking`,

			electron: `- Separate main and renderer process logic
- Use contextBridge for secure IPC
- Implement proper security practices
- Optimize for different operating systems  
- Handle application lifecycle events`,

			"react-native": `- Use Expo for rapid development
- Implement proper navigation patterns
- Optimize for both iOS and Android
- Use native modules when necessary
- Follow platform-specific design guidelines`,
		};

		return practices[platform] || "- Follow standard development practices";
	}

	async run(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error("Xala UI System MCP Server v6.1.2 running on stdio");
	}
}

// Start MCP server
const server = new XalaUISystemMCPServer();
server.run().catch(console.error);

/**
 * Quick Generate Tools - Simplified interface for common use cases
 * Consolidates multiple generation functions into streamlined workflows
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ComponentGenerator } from "../generators/ComponentGenerator.js";
import type { ComponentConfig } from "../types/index.js";

// Preset configurations for common component types
const componentPresets = {
	"basic-form": {
		category: "form" as const,
		features: {
			interactive: true,
			validation: true,
			loading: false,
			error: true,
		},
		styling: {
			variant: "default" as const,
			spacing: "comfortable" as const,
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
	},
	"data-table": {
		category: "data-components" as const,
		features: {
			interactive: true,
			sortable: true,
			filterable: true,
			paginated: true,
			searchable: true,
			selectable: false,
		},
		styling: {
			variant: "default" as const,
			spacing: "comfortable" as const,
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
	},
	"navigation-menu": {
		category: "navigation" as const,
		features: {
			interactive: true,
			collapsible: true,
			tooltips: true,
			icons: true,
			badges: false,
		},
		styling: {
			variant: "default" as const,
			spacing: "comfortable" as const,
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
	},
	"dashboard-layout": {
		category: "layouts" as const,
		features: {
			interactive: true,
			collapsible: true,
			resizable: true,
		},
		styling: {
			variant: "default" as const,
			spacing: "spacious" as const,
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
			breakpoints: ["tablet", "desktop", "wide"] as Array<
				"mobile" | "tablet" | "desktop" | "wide" | "ultra"
			>,
			mobileFirst: false,
			adaptiveLayout: true,
			touchOptimized: false,
			fluidTypography: true,
		},
	},
	"modal-dialog": {
		category: "feedback" as const,
		features: {
			interactive: true,
			animated: true,
			loading: false,
			error: false,
		},
		styling: {
			variant: "default" as const,
			spacing: "comfortable" as const,
			shadow: "xl" as const,
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
	},
};

// Platform-specific optimizations
const platformOptimizations = {
	react: {
		architecture: "v5-cva" as const,
		features: { serverComponents: false },
	},
	nextjs: {
		architecture: "v5-cva" as const,
		features: { appRouter: true, serverComponents: true },
	},
	vue: {
		architecture: "semantic" as const,
		features: { compositionApi: true, scriptSetup: true },
	},
	angular: {
		architecture: "semantic" as const,
		features: { standaloneComponents: true, signals: true },
	},
	svelte: {
		architecture: "semantic" as const,
		features: { svelteKit: true, stores: true },
	},
	electron: {
		architecture: "v5-cva" as const,
		features: { rendererProcess: true, nativeApis: true },
	},
	"react-native": {
		architecture: "semantic" as const,
		features: { expo: true, navigation: true },
	},
};

export class QuickGenerateTools {
	private componentGenerator: ComponentGenerator;

	constructor() {
		this.componentGenerator = new ComponentGenerator();
	}

	/**
	 * Quick generate with smart defaults and presets
	 */
	async quickGenerate(args: {
		name: string;
		type: keyof typeof componentPresets;
		platform: keyof typeof platformOptimizations;
		customizations?: Partial<ComponentConfig>;
	}) {
		const { name, type, platform, customizations = {} } = args;

		// Get preset configuration
		const preset = componentPresets[type];
		if (!preset) {
			throw new Error(
				`Unknown component type: ${type}. Available types: ${Object.keys(componentPresets).join(", ")}`,
			);
		}

		// Get platform optimizations
		const platformConfig = platformOptimizations[platform];
		if (!platformConfig) {
			throw new Error(
				`Unsupported platform: ${platform}. Available platforms: ${Object.keys(platformOptimizations).join(", ")}`,
			);
		}

		// Build complete configuration
		const config: ComponentConfig = {
			name,
			platform,
			...preset,
			platformConfig: {
				platform,
				...platformConfig,
			},
			// Apply customizations last to override defaults
			...customizations,
			// Merge features and styling if provided in customizations
			features: {
				...preset.features,
				...(customizations.features || {}),
			},
			styling: {
				...preset.styling,
				...(customizations.styling || {}),
			},
		};

		// Generate the component
		const result =
			await this.componentGenerator.generateMultiPlatformComponent(config);

		return {
			...result,
			preset: type,
			optimizations: platformConfig,
			config: config,
		};
	}

	/**
	 * Quick generate multiple components with consistent theming
	 */
	async quickGenerateSet(args: {
		components: Array<{
			name: string;
			type: keyof typeof componentPresets;
		}>;
		platform: keyof typeof platformOptimizations;
		theme?: string;
		globalCustomizations?: Partial<ComponentConfig>;
	}) {
		const {
			components,
			platform,
			theme = "enterprise",
			globalCustomizations = {},
		} = args;

		const results = [];

		for (const component of components) {
			try {
				const result = await this.quickGenerate({
					name: component.name,
					type: component.type,
					platform,
					customizations: {
						theme: theme as any,
						...globalCustomizations,
					},
				});
				results.push(result);
			} catch (error) {
				results.push({
					name: component.name,
					type: component.type,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return {
			platform,
			theme,
			components: results,
			summary: {
				total: components.length,
				successful: results.filter((r) => !("error" in r)).length,
				failed: results.filter((r) => "error" in r).length,
			},
		};
	}

	/**
	 * Get available presets and their descriptions
	 */
	getAvailablePresets() {
		return Object.entries(componentPresets).map(([key, preset]) => ({
			type: key,
			category: preset.category,
			description: this.getPresetDescription(
				key as keyof typeof componentPresets,
			),
			features: Object.keys(preset.features).filter(
				(feature) => preset.features[feature as keyof typeof preset.features],
			),
		}));
	}

	/**
	 * Get platform-specific recommendations
	 */
	getPlatformRecommendations(platform: keyof typeof platformOptimizations) {
		const optimizations = platformOptimizations[platform];
		const recommendedTypes = this.getRecommendedTypesForPlatform(platform);

		return {
			platform,
			architecture: optimizations.architecture,
			features: optimizations.features,
			recommendedComponentTypes: recommendedTypes,
			bestPractices: this.getPlatformBestPractices(platform),
		};
	}

	// Private helper methods
	private getPresetDescription(type: keyof typeof componentPresets): string {
		const descriptions = {
			"basic-form":
				"Form with validation, error handling, and accessibility features",
			"data-table":
				"Advanced table with sorting, filtering, pagination, and search",
			"navigation-menu":
				"Responsive navigation with collapsible menus and icons",
			"dashboard-layout": "Complete dashboard layout with resizable panels",
			"modal-dialog": "Accessible modal with animations and focus management",
		};
		return descriptions[type] || "Component preset";
	}

	private getRecommendedTypesForPlatform(
		platform: keyof typeof platformOptimizations,
	): string[] {
		const recommendations = {
			react: ["basic-form", "data-table", "modal-dialog"],
			nextjs: [
				"basic-form",
				"data-table",
				"dashboard-layout",
				"navigation-menu",
			],
			vue: ["basic-form", "navigation-menu", "modal-dialog"],
			angular: ["data-table", "dashboard-layout", "basic-form"],
			svelte: ["basic-form", "navigation-menu", "modal-dialog"],
			electron: ["dashboard-layout", "data-table", "navigation-menu"],
			"react-native": ["basic-form", "navigation-menu", "modal-dialog"],
		};
		return recommendations[platform] || [];
	}

	private getPlatformBestPractices(
		platform: keyof typeof platformOptimizations,
	): string[] {
		const practices = {
			react: [
				"Use functional components with hooks",
				"Implement proper error boundaries",
				"Leverage React.memo for performance",
			],
			nextjs: [
				"Use App Router for new projects",
				"Implement Server Components where appropriate",
				"Optimize with next/image and next/font",
			],
			vue: [
				"Prefer Composition API with script setup",
				"Use reactive refs and computed properties",
				"Implement proper TypeScript integration",
			],
			angular: [
				"Use standalone components",
				"Implement OnPush change detection",
				"Leverage Angular Signals for state",
			],
			svelte: [
				"Use SvelteKit for full-stack features",
				"Leverage compile-time optimizations",
				"Implement proper store patterns",
			],
			electron: [
				"Separate main and renderer logic",
				"Use contextBridge for secure IPC",
				"Implement proper security practices",
			],
			"react-native": [
				"Use Expo for rapid development",
				"Implement platform-specific designs",
				"Optimize for mobile performance",
			],
		};
		return practices[platform] || [];
	}
}

// Tool definitions
export const quickGenerateTools: Tool[] = [
	{
		name: "quick_generate",
		description:
			"Quickly generate components using smart presets and platform optimizations",
		inputSchema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					description: "Component name",
				},
				type: {
					type: "string",
					enum: [
						"basic-form",
						"data-table",
						"navigation-menu",
						"dashboard-layout",
						"modal-dialog",
					],
					description: "Component type preset",
				},
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
				customizations: {
					type: "object",
					description: "Optional customizations to override preset defaults",
					properties: {
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
						},
						features: {
							type: "object",
							description: "Feature toggles",
						},
						styling: {
							type: "object",
							description: "Styling overrides",
						},
					},
				},
			},
			required: ["name", "type", "platform"],
		},
	},
	{
		name: "quick_generate_set",
		description:
			"Generate multiple components with consistent theming and configuration",
		inputSchema: {
			type: "object",
			properties: {
				components: {
					type: "array",
					description: "Array of components to generate",
					items: {
						type: "object",
						properties: {
							name: { type: "string" },
							type: {
								type: "string",
								enum: [
									"basic-form",
									"data-table",
									"navigation-menu",
									"dashboard-layout",
									"modal-dialog",
								],
							},
						},
						required: ["name", "type"],
					},
				},
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
					description: "Target platform for all components",
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
					description: "Global theme for all components",
					default: "enterprise",
				},
				globalCustomizations: {
					type: "object",
					description: "Global customizations applied to all components",
				},
			},
			required: ["components", "platform"],
		},
	},
	{
		name: "get_quick_presets",
		description:
			"Get available component presets with descriptions and features",
		inputSchema: {
			type: "object",
			properties: {},
		},
	},
	{
		name: "get_platform_recommendations",
		description: "Get platform-specific recommendations and best practices",
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
					description: "Platform to get recommendations for",
				},
			},
			required: ["platform"],
		},
	},
];

// Tool handlers
export const quickGenerateToolHandlers = {
	quick_generate: async (args: any) => {
		const tools = new QuickGenerateTools();
		return await tools.quickGenerate(args);
	},

	quick_generate_set: async (args: any) => {
		const tools = new QuickGenerateTools();
		return await tools.quickGenerateSet(args);
	},

	get_quick_presets: async () => {
		const tools = new QuickGenerateTools();
		return tools.getAvailablePresets();
	},

	get_platform_recommendations: async (args: any) => {
		const tools = new QuickGenerateTools();
		return tools.getPlatformRecommendations(args.platform);
	},
};

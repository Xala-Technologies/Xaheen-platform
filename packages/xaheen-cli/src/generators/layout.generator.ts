/**
 * Layout Generator - Rails-inspired layout component generation
 *
 * Generates layout components with responsive design and accessibility features
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-04
 */

import { confirm, isCancel, multiselect, select, text } from "@clack/prompts";
import chalk from "chalk";
import Handlebars from "handlebars";
import {
	BaseGenerator,
	BaseGeneratorOptions,
	GeneratorResult,
} from "./base.generator.js";

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("camelCase", (str: string) => {
	return (
		str.charAt(0).toLowerCase() +
		str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
	);
});
Handlebars.registerHelper("generatedAt", () => new Date().toISOString());

export interface LayoutGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly layoutType?:
		| "admin"
		| "auth"
		| "dashboard"
		| "landing"
		| "blog"
		| "ecommerce"
		| "mobile"
		| "custom";
	readonly framework?: "react" | "vue" | "angular" | "svelte";
	readonly styling?: "tailwind" | "styled-components" | "css-modules";
	readonly features?: string[];
	readonly responsive?: boolean;
	readonly accessibility?: "A" | "AA" | "AAA";
}

export interface LayoutFeature {
	readonly name: string;
	readonly description: string;
	readonly component: string;
}

export class LayoutGenerator extends BaseGenerator<LayoutGeneratorOptions> {
	private readonly layoutTypes = [
		{
			value: "admin",
			label: "Admin Layout",
			hint: "Dashboard with sidebar navigation",
		},
		{
			value: "auth",
			label: "Authentication Layout",
			hint: "Login/signup centered layout",
		},
		{
			value: "dashboard",
			label: "Dashboard Layout",
			hint: "Analytics and metrics layout",
		},
		{
			value: "landing",
			label: "Landing Page Layout",
			hint: "Marketing page layout",
		},
		{ value: "blog", label: "Blog Layout", hint: "Article reading layout" },
		{
			value: "ecommerce",
			label: "E-commerce Layout",
			hint: "Product catalog layout",
		},
		{
			value: "mobile",
			label: "Mobile Layout",
			hint: "Mobile-first responsive layout",
		},
		{
			value: "custom",
			label: "Custom Layout",
			hint: "Blank template to customize",
		},
	];

	private readonly layoutFeatures = [
		{ value: "header", label: "Header Navigation", hint: "Top navigation bar" },
		{
			value: "sidebar",
			label: "Sidebar Navigation",
			hint: "Side navigation panel",
		},
		{ value: "footer", label: "Footer", hint: "Page footer with links" },
		{
			value: "breadcrumbs",
			label: "Breadcrumbs",
			hint: "Navigation breadcrumbs",
		},
		{
			value: "search",
			label: "Search Bar",
			hint: "Global search functionality",
		},
		{
			value: "notifications",
			label: "Notifications",
			hint: "Toast/alert notifications",
		},
		{
			value: "theme-toggle",
			label: "Dark Mode Toggle",
			hint: "Light/dark theme switcher",
		},
		{ value: "user-menu", label: "User Menu", hint: "Profile dropdown menu" },
		{
			value: "mobile-menu",
			label: "Mobile Menu",
			hint: "Hamburger mobile navigation",
		},
	];

	getGeneratorType(): string {
		return "layout";
	}

	async generate(options: LayoutGeneratorOptions): Promise<GeneratorResult> {
		// Prompt for missing options
		const completeOptions = await this.promptForMissingOptions(options);
		await this.validateOptions(completeOptions);

		this.logger.info(`Generating layout: ${chalk.cyan(completeOptions.name)}`);

		// Detect project structure
		const projectStructure = await this.detectProjectStructure();

		// Generate layout data using Rails-inspired naming conventions
		const naming = this.getNamingConvention(completeOptions.name);
		const layoutData = {
			name: completeOptions.name,
			className: naming.className,
			layoutType: completeOptions.layoutType || "custom",
			framework: completeOptions.framework || projectStructure.frameworkType,
			styling: completeOptions.styling || "tailwind",
			features: await this.parseFeatures(completeOptions.features || []),
			responsive: completeOptions.responsive !== false,
			accessibility: completeOptions.accessibility || "AAA",
			typescript: completeOptions.typescript !== false,
			tests: completeOptions.tests !== false,
			stories: completeOptions.stories !== false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate layout component based on framework
		const layoutFile = await this.generateLayoutComponent(
			layoutData,
			completeOptions,
		);
		if (layoutFile) generatedFiles.push(layoutFile);

		// Generate Storybook stories
		if (completeOptions.stories) {
			const storyFile = await this.generateStories(layoutData, completeOptions);
			if (storyFile) generatedFiles.push(storyFile);
		}

		// Generate tests
		if (completeOptions.tests) {
			const testFile = await this.generateTests(layoutData, completeOptions);
			if (testFile) generatedFiles.push(testFile);
		}

		// Generate CSS/styles if needed
		if (layoutData.styling === "css-modules") {
			const styleFile = await this.generateStyles(layoutData, completeOptions);
			if (styleFile) generatedFiles.push(styleFile);
		}

		this.logger.success(
			`Layout ${chalk.green(completeOptions.name)} generated successfully!`,
		);

		return {
			success: true,
			message: `Layout ${completeOptions.name} generated successfully`,
			files: generatedFiles,
			nextSteps: [
				"Import layout in your page components",
				"Configure routing to use the layout",
				"Customize styling and responsive breakpoints",
				"Add layout to Storybook if using component library",
			],
		};
	}

	private async parseFeatures(
		featuresInput: string[],
	): Promise<LayoutFeature[]> {
		if (featuresInput.length === 0) {
			const selectedFeatures = await multiselect({
				message: "Select layout features to include:",
				options: this.layoutFeatures,
				required: false,
			});

			if (isCancel(selectedFeatures)) {
				return [];
			}

			return (selectedFeatures as string[]).map((feature) => {
				const featureData = this.layoutFeatures.find(
					(f) => f.value === feature,
				);
				return {
					name: feature,
					description: featureData?.hint || "",
					component: this.toPascalCase(feature.replace("-", "")) + "Component",
				};
			});
		}

		// Parse from command line
		return featuresInput.map((feature) => ({
			name: feature,
			description: "",
			component: this.toPascalCase(feature.replace("-", "")) + "Component",
		}));
	}

	private async generateLayoutComponent(
		layoutData: any,
		options: LayoutGeneratorOptions,
	): Promise<string | null> {
		const placement = this.getFilePlacement("layout", layoutData.name);

		try {
			const templateName = `layout/${layoutData.framework}-layout.hbs`;
			return await this.generateFile(
				templateName,
				placement.filePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force },
			);
		} catch (error) {
			this.logger.warn(`Failed to generate layout component: ${error}`);
			return null;
		}
	}

	private async generateStories(
		layoutData: any,
		options: LayoutGeneratorOptions,
	): Promise<string | null> {
		const placement = this.getFilePlacement("layout", layoutData.name);

		if (!placement.storyPath) return null;

		try {
			return await this.generateFile(
				"layout/stories.hbs",
				placement.storyPath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force },
			);
		} catch (error) {
			this.logger.warn(`Failed to generate stories: ${error}`);
			return null;
		}
	}

	private async generateTests(
		layoutData: any,
		options: LayoutGeneratorOptions,
	): Promise<string | null> {
		const placement = this.getFilePlacement("layout", layoutData.name);

		if (!placement.testPath) return null;

		try {
			return await this.generateFile(
				"layout/test.hbs",
				placement.testPath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force },
			);
		} catch (error) {
			this.logger.warn(`Failed to generate tests: ${error}`);
			return null;
		}
	}

	private async generateStyles(
		layoutData: any,
		options: LayoutGeneratorOptions,
	): Promise<string | null> {
		const stylePath = `src/components/layouts/${layoutData.className}.module.css`;

		try {
			return await this.generateFile(
				"layout/styles.hbs",
				stylePath,
				layoutData,
				{ dryRun: options.dryRun, force: options.force },
			);
		} catch (error) {
			this.logger.warn(`Failed to generate styles: ${error}`);
			return null;
		}
	}

	protected async promptForMissingOptions(
		options: Partial<LayoutGeneratorOptions>,
	): Promise<LayoutGeneratorOptions> {
		const result = await super.promptForMissingOptions(options);

		// Prompt for layout type if not provided
		if (!result.layoutType) {
			const layoutType = await select({
				message: "What type of layout would you like to generate?",
				options: this.layoutTypes,
			});

			if (isCancel(layoutType)) {
				throw new Error("Layout type selection cancelled");
			}

			result.layoutType = layoutType as LayoutGeneratorOptions["layoutType"];
		}

		// Prompt for accessibility level if not provided
		if (!result.accessibility) {
			const accessibility = await select({
				message: "What accessibility level should this layout support?",
				options: [
					{
						value: "A",
						label: "WCAG A",
						hint: "Basic accessibility compliance",
					},
					{
						value: "AA",
						label: "WCAG AA",
						hint: "Standard accessibility compliance",
					},
					{
						value: "AAA",
						label: "WCAG AAA",
						hint: "Highest accessibility compliance",
					},
				],
			});

			if (!isCancel(accessibility)) {
				result.accessibility = accessibility as "A" | "AA" | "AAA";
			}
		}

		return result as LayoutGeneratorOptions;
	}
}

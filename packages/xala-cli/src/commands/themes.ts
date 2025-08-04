import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import {
	type ThemeConfig,
	ThemeGenerator,
} from "../services/theme-generator.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { CommandMetadata } from "./index.js";

export interface ThemeOptions {
	readonly brand?: string;
	readonly colors?: string;
	readonly output?: string;
	readonly template?: string;
	readonly industry?: string;
	readonly accessibility?: string;
	readonly preview?: boolean;
}

export const themesCommand: CommandMetadata = {
	name: "themes",
	description: "Theme management and customization",
	options: [
		{
			flags: "--brand <name>",
			description: "Brand name for the theme",
		},
		{
			flags: "--colors <colors>",
			description:
				"Color overrides (format: primary=#0891b2,secondary=#0f766e)",
		},
		{
			flags: "--output <path>",
			description: "Output directory for theme files",
			defaultValue: "./src/themes",
		},
		{
			flags: "--industry <industry>",
			description:
				"Industry type (saas|fintech|healthcare|ecommerce|education)",
			defaultValue: "saas",
		},
		{
			flags: "--accessibility <level>",
			description: "Accessibility level (AA|AAA)",
			defaultValue: "AAA",
		},
		{
			flags: "--preview",
			description: "Preview theme before creating",
		},
	],
	subcommands: [
		{
			name: "create",
			description: "Create a new theme",
			action: createThemeAction,
		},
		{
			name: "apply",
			description: "Apply an existing theme",
			action: applyThemeAction,
		},
		{
			name: "customize",
			description: "Customize an existing theme",
			action: customizeThemeAction,
		},
		{
			name: "list",
			description: "List available themes",
			action: listThemesAction,
		},
		{
			name: "preview",
			description: "Preview a theme",
			action: previewThemeAction,
		},
	],
};

async function createThemeAction(
	themeName: string,
	options: ThemeOptions,
): Promise<void> {
	const spinner = ora("Creating theme...").start();

	try {
		const generator = new ThemeGenerator();

		const config: ThemeConfig = {
			name: themeName,
			brand: options.brand || "Your Brand",
			industry: options.industry || "saas",
			colors: parseColors(options.colors),
			accessibility: (options.accessibility as "AA" | "AAA") || "AAA",
			features: ["dark-mode", "high-contrast"],
			locales: ["en-US", "nb-NO"],
		};

		await generator.createTheme(config, {
			outputDir: options.output || "./src/themes",
			preview: options.preview || false,
		});

		spinner.succeed(chalk.green(`Theme '${themeName}' created successfully`));
	} catch (error) {
		spinner.fail(
			chalk.red(`Failed to create theme: ${(error as Error).message}`),
		);
		throw new ValidationError(
			`Theme creation failed: ${(error as Error).message}`,
		);
	}
}

async function applyThemeAction(
	themeName: string,
	options: ThemeOptions,
): Promise<void> {
	const spinner = ora(`Applying theme: ${themeName}`).start();

	try {
		const generator = new ThemeGenerator();
		await generator.applyTheme(themeName, process.cwd());

		spinner.succeed(chalk.green(`Theme '${themeName}' applied successfully`));
	} catch (error) {
		spinner.fail(
			chalk.red(`Failed to apply theme: ${(error as Error).message}`),
		);
		throw new ValidationError(
			`Theme application failed: ${(error as Error).message}`,
		);
	}
}

async function customizeThemeAction(
	themeName: string,
	options: ThemeOptions,
): Promise<void> {
	const spinner = ora(`Customizing theme: ${themeName}`).start();

	try {
		const generator = new ThemeGenerator();
		const customizations: Partial<ThemeConfig> = {
			...(options.brand && { brand: options.brand }),
			colors: parseColors(options.colors),
		};

		await generator.customizeTheme(themeName, customizations);

		spinner.succeed(
			chalk.green(`Theme '${themeName}' customized successfully`),
		);
	} catch (error) {
		spinner.fail(
			chalk.red(`Failed to customize theme: ${(error as Error).message}`),
		);
		throw new ValidationError(
			`Theme customization failed: ${(error as Error).message}`,
		);
	}
}

async function listThemesAction(): Promise<void> {
	const generator = new ThemeGenerator();
	const themes = await generator.listThemes();

	if (themes.length === 0) {
		console.log(chalk.yellow("No themes found"));
		return;
	}

	console.log(chalk.bold("\nAvailable Themes:"));
	themes.forEach((theme) => {
		const status = theme.isActive ? chalk.green("(active)") : "";
		console.log(`  ${chalk.cyan(theme.name)} - ${theme.description} ${status}`);
	});
}

async function previewThemeAction(themeName: string): Promise<void> {
	const generator = new ThemeGenerator();
	const preview = await generator.previewTheme(themeName);
	console.log(preview);
}

function parseColors(colorsString?: string): Record<string, string> {
	if (!colorsString) {
		return {
			primary: "#0ea5e9",
			secondary: "#64748b",
		};
	}

	const colors: Record<string, string> = {};
	const pairs = colorsString.split(",");

	for (const pair of pairs) {
		const [key, value] = pair.split("=");
		if (key && value) {
			colors[key.trim()] = value.trim();
		}
	}

	return colors;
}

import { Command } from "commander";
import { logger } from "../../utils/logger.js";
import { CommandMetadata } from "../index.js";

// Generate command with subcommands
const generateCommand: CommandMetadata = {
	name: "generate",
	alias: "g",
	description: "Generate components, pages, and other artifacts",
	action: async () => {
		// This will be handled by subcommands
		logger.info(
			'Use "xala-scaffold generate --help" to see available subcommands',
		);
	},
};

// Register subcommands
export function registerGenerateSubcommands(program: Command): void {
	const generate = program.commands.find((cmd) => cmd.name() === "generate");
	if (!generate) return;

	// Component subcommand
	generate
		.command("component <name>")
		.alias("c")
		.description("Generate a new component with Xala standards")
		.option("-p, --props <props...>", "Component props (name:type)")
		.option(
			"-t, --type <type>",
			"Component type (display, form, layout)",
			"display",
		)
		.option("--no-test", "Skip test file generation")
		.option("--no-story", "Skip Storybook story generation")
		.option("--no-locale", "Skip localization setup")
		.action(async (name: string, options: any) => {
			// Import dynamically to avoid circular dependencies
			const { generateComponent } = await import("./component.js");
			await generateComponent(name, options);
		});

	// Page subcommand
	generate
		.command("page <name>")
		.alias("p")
		.description("Generate a new page with routing")
		.option("-r, --route <route>", "Page route path")
		.option("-l, --layout <layout>", "Layout to use", "default")
		.option("--auth", "Require authentication")
		.option("--api", "Include API route")
		.action(async (name: string, options: any) => {
			const { generatePage } = await import("./page.js");
			await generatePage(name, options);
		});

	// Hook subcommand
	generate
		.command("hook <name>")
		.alias("h")
		.description("Generate a custom React hook")
		.option("--state", "Include state management")
		.option("--async", "Async data fetching hook")
		.action(async (name: string, options: any) => {
			const { generateHook } = await import("./hook.js");
			await generateHook(name, options);
		});

	// Service subcommand
	generate
		.command("service <name>")
		.alias("s")
		.description("Generate a service module")
		.option("--api", "API service with endpoints")
		.option("--auth", "Authentication service")
		.option("--storage", "Storage service")
		.action(async (name: string, options: any) => {
			const { generateService } = await import("./service.js");
			await generateService(name, options);
		});

	// Layout subcommand
	generate
		.command("layout <name>")
		.alias("l")
		.description("Generate a layout component")
		.option("--responsive", "Include responsive variants", true)
		.option("--nav", "Include navigation")
		.option("--sidebar", "Include sidebar")
		.action(async (name: string, options: any) => {
			const { generateLayout } = await import("./layout.js");
			await generateLayout(name, options);
		});
}

export default generateCommand;

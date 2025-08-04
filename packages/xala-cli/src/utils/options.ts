import { Command } from "commander";

export function configureGlobalOptions(program: Command): void {
	program
		.option("--debug", "Enable debug logging", false)
		.option("--no-banner", "Disable banner display", false)
		.option("--config <path>", "Path to configuration file")
		.option("--cwd <path>", "Working directory to use", process.cwd())
		.option(
			"--platform <platform>",
			"Target platform (react|vue|angular|flutter|ios|android)",
			"react",
		)
		.option("--template <template>", "Template to use")
		.option("--output <path>", "Output directory")
		.option("--verbose", "Verbose output", false)
		.option("--quiet", "Minimal output", false)
		.option("--dry-run", "Show what would be done without executing", false)
		.option("--force", "Force overwrite existing files", false)
		.option("--skip-validation", "Skip validation checks", false)
		.option("--skip-install", "Skip dependency installation", false)
		.option(
			"--package-manager <pm>",
			"Package manager to use (npm|yarn|pnpm|bun)",
			"npm",
		)
		.option(
			"--ai-provider <provider>",
			"AI provider to use (openai|anthropic|local)",
			"openai",
		)
		.option("--theme <theme>", "Theme to apply", "base-light")
		.option(
			"--locale <locale>",
			"Locale to use (en-US|nb-NO|fr-FR|ar-SA)",
			"en-US",
		)
		.option(
			"--compliance <level>",
			"Compliance level (basic|nsm|enterprise)",
			"basic",
		);

	// Setup debug logging based on options
	program.hook("preAction", (thisCommand) => {
		const options = thisCommand.opts();

		if (options.debug) {
			process.env.DEBUG = "true";
		}

		if (options.cwd) {
			process.chdir(options.cwd);
		}
	});
}

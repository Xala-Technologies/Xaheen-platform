import type { CLICommand } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";

export default class ThemeDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	public async create(command: CLICommand): Promise<void> {
		const themeName = command.target;

		if (!themeName) {
			throw new CLIError(
				"Theme name is required",
				"MISSING_THEME_NAME",
				"theme",
				"create",
			);
		}

		cliLogger.info(`Creating theme: ${themeName}`);

		try {
			// Update design configuration
			await this.configManager.updateDesignConfig({
				theme: themeName,
			});

			cliLogger.success(`Theme "${themeName}" created and set as active!`);
		} catch (error) {
			throw new CLIError(
				`Failed to create theme: ${error}`,
				"THEME_CREATE_FAILED",
				"theme",
				"create",
			);
		}
	}

	public async list(command: CLICommand): Promise<void> {
		cliLogger.info("Available themes:");

		try {
			const config = await this.configManager.loadConfig();
			const currentTheme = config.design?.theme || "default";

			const themes = [
				"default",
				"healthcare",
				"finance",
				"e-commerce",
				"dashboard",
			];

			themes.forEach((theme) => {
				const marker = theme === currentTheme ? "●" : "○";
				console.log(`  ${marker} ${theme}`);
			});
		} catch (error) {
			throw new CLIError(
				`Failed to list themes: ${error}`,
				"THEME_LIST_FAILED",
				"theme",
				"list",
			);
		}
	}
}

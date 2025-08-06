import chalk from "chalk";
import type { CLICommand } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";

export default class ComponentDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	private get registry() {
		return global.__xaheen_cli.registry;
	}

	public async generate(command: CLICommand): Promise<void> {
		const description = command.target;

		if (!description) {
			throw new CLIError(
				"Component description is required",
				"MISSING_DESCRIPTION",
				"component",
				"generate",
			);
		}

		cliLogger.ai(`Generating component from description: "${description}"`);

		try {
			// This would integrate with AI generation service
			cliLogger.info("AI component generation coming soon...");
			cliLogger.info("For now, use: xaheen component create <name>");
		} catch (error) {
			throw new CLIError(
				`Failed to generate component: ${error}`,
				"COMPONENT_GENERATE_FAILED",
				"component",
				"generate",
			);
		}
	}

	public async create(command: CLICommand): Promise<void> {
		const componentName = command.target;

		if (!componentName) {
			throw new CLIError(
				"Component name is required",
				"MISSING_COMPONENT_NAME",
				"component",
				"create",
			);
		}

		cliLogger.info(`Creating component: ${componentName}`);

		try {
			const config = await this.configManager.loadConfig();
			const platform = config.design?.platform || "react";

			const templates = this.registry.getComponentTemplatesByPlatform(platform);

			if (templates.length === 0) {
				cliLogger.warn(
					`No component templates found for platform: ${platform}`,
				);
				return;
			}

			// For now, show available templates
			cliLogger.info(`Available templates for ${platform}:`);
			templates.forEach((template) => {
				console.log(`  ${chalk.cyan(template.id)} - ${template.description}`);
			});
		} catch (error) {
			throw new CLIError(
				`Failed to create component: ${error}`,
				"COMPONENT_CREATE_FAILED",
				"component",
				"create",
			);
		}
	}

	public async build(command: CLICommand): Promise<void> {
		cliLogger.info("Building multi-platform components...");

		try {
			const config = await this.configManager.loadConfig();
			const monorepoInfo = await this.configManager.getMonorepoInfo();

			if (monorepoInfo.isMonorepo) {
				cliLogger.info(`Building ${monorepoInfo.apps.length} apps...`);
				for (const app of monorepoInfo.apps) {
					cliLogger.step(
						monorepoInfo.apps.indexOf(app) + 1,
						monorepoInfo.apps.length,
						`Building ${app}`,
					);
				}
			}

			cliLogger.success("Build completed!");
		} catch (error) {
			throw new CLIError(
				`Build failed: ${error}`,
				"BUILD_FAILED",
				"component",
				"build",
			);
		}
	}
}

import chalk from "chalk";
import type { CLICommand } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";

export default class ServiceDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	private get registry() {
		return global.__xaheen_cli.registry;
	}

	public async add(command: CLICommand): Promise<void> {
		const serviceName = command.target;

		if (!serviceName) {
			throw new CLIError(
				"Service name is required",
				"MISSING_SERVICE_NAME",
				"service",
				"add",
			);
		}

		cliLogger.info(`Adding service: ${serviceName}`);

		try {
			// Find service template
			const template = this.registry.getServiceTemplate(serviceName);

			if (!template) {
				// Show available services
				const availableServices = this.registry.getAllServiceTemplates();
				cliLogger.error(`Service "${serviceName}" not found.`);

				if (availableServices.length > 0) {
					cliLogger.info("Available services:");
					availableServices.forEach((service) => {
						console.log(`  ${chalk.cyan(service.id)} - ${service.description}`);
					});
				}
				return;
			}

			// Add service to configuration
			await this.configManager.addService(serviceName, {
				provider: template.provider,
				version: template.version,
				config: template.config,
			});

			cliLogger.success(`Service "${serviceName}" added successfully!`);

			// Show next steps
			if (template.dependencies.length > 0) {
				cliLogger.info(
					`Dependencies required: ${template.dependencies.join(", ")}`,
				);
			}
		} catch (error) {
			if (error instanceof CLIError) {
				throw error;
			}
			throw new CLIError(
				`Failed to add service: ${error}`,
				"SERVICE_ADD_FAILED",
				"service",
				"add",
			);
		}
	}

	public async remove(command: CLICommand): Promise<void> {
		const serviceName = command.target;

		if (!serviceName) {
			throw new CLIError(
				"Service name is required",
				"MISSING_SERVICE_NAME",
				"service",
				"remove",
			);
		}

		cliLogger.info(`Removing service: ${serviceName}`);

		try {
			await this.configManager.removeService(serviceName);
			cliLogger.success(`Service "${serviceName}" removed successfully!`);
		} catch (error) {
			throw new CLIError(
				`Failed to remove service: ${error}`,
				"SERVICE_REMOVE_FAILED",
				"service",
				"remove",
			);
		}
	}

	public async list(command: CLICommand): Promise<void> {
		cliLogger.info("Available services:");

		try {
			const services = this.registry.getAllServiceTemplates();
			const registryStats = this.registry.getRegistryStats();

			console.log(
				`\n${chalk.bold("Service Registry")} (${registryStats.services} services available)\n`,
			);

			// Group by category
			const categories = [...new Set(services.map((s) => s.category))];

			for (const category of categories) {
				console.log(chalk.bold.blue(`${category.toUpperCase()}:`));

				const categoryServices = services.filter(
					(s) => s.category === category,
				);

				for (const service of categoryServices) {
					console.log(
						`  ${chalk.cyan(service.id.padEnd(20))} ${chalk.gray(service.description)}`,
					);
					console.log(
						`    ${chalk.gray(`Provider: ${service.provider} v${service.version}`)}`,
					);
				}

				console.log();
			}

			// Show configured services
			const config = await this.configManager.loadConfig();
			if (config.services && Object.keys(config.services).length > 0) {
				console.log(chalk.bold.green("CONFIGURED SERVICES:"));
				for (const [serviceId, serviceConfig] of Object.entries(
					config.services,
				)) {
					console.log(
						`  ${chalk.green("✓")} ${chalk.cyan(serviceId)} (${serviceConfig.provider} v${serviceConfig.version || "latest"})`,
					);
				}
			} else {
				console.log(chalk.gray("No services configured yet."));
				console.log(
					chalk.gray("Use `xaheen service add <service>` to add services."),
				);
			}
		} catch (error) {
			throw new CLIError(
				`Failed to list services: ${error}`,
				"SERVICE_LIST_FAILED",
				"service",
				"list",
			);
		}
	}
}

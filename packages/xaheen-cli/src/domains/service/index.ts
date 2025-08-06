import chalk from "chalk";
import type { CLICommand } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";
import { registryService } from "../../services/registry/registry.service";

export default class ServiceDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	private get registry() {
		return registryService;
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

			cliLogger.success(`Service "${serviceName}" added to configuration!`);
			
			// Generate service configuration files
			await this.generateServiceFiles(template);
			
			// Show next steps
			if (template.dependencies.length > 0) {
				cliLogger.info(`Dependencies: ${template.dependencies.join(", ")}`);
				cliLogger.info(`Run: ${chalk.cyan('npm install ' + template.dependencies.join(' '))}`);
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

	private async generateServiceFiles(serviceTemplate: any): Promise<void> {
		try {
			const fs = await import('fs/promises');
			const path = await import('path');

			switch (serviceTemplate.category) {
				case 'database':
					await this.generateDatabaseConfig(serviceTemplate, fs, path);
					break;
				case 'auth':
					await this.generateAuthConfig(serviceTemplate, fs, path);
					break;
				case 'api':
					await this.generateApiConfig(serviceTemplate, fs, path);
					break;
				default:
					cliLogger.info(`Service configuration for ${serviceTemplate.category} category ready`);
			}
		} catch (error) {
			cliLogger.warn(`Failed to generate service files: ${error}`);
		}
	}

	private async generateDatabaseConfig(serviceTemplate: any, fs: any, path: any): Promise<void> {
		if (serviceTemplate.provider === 'postgresql') {
			const envContent = `
# PostgreSQL Configuration - Added by Xaheen CLI
DB_HOST=${serviceTemplate.config.host}
DB_PORT=${serviceTemplate.config.port}
DB_NAME=\${PROJECT_NAME}
DB_USER=postgres
DB_PASSWORD=\${DB_PASSWORD}
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}
`;
			
			try {
				const envPath = './.env.example';
				const existingEnv = await fs.readFile(envPath, 'utf-8').catch(() => '');
				if (!existingEnv.includes('DB_HOST')) {
					await fs.writeFile(envPath, existingEnv + envContent);
				}
				cliLogger.success('Database configuration added to .env.example');
			} catch (error) {
				cliLogger.warn('Could not update .env.example file');
			}
		}
	}

	private async generateAuthConfig(serviceTemplate: any, fs: any, path: any): Promise<void> {
		if (serviceTemplate.provider === 'nextauth') {
			const authConfig = `import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        return null
      }
    })
  ],
  session: { strategy: "jwt" }
})`;

			try {
				const authPath = './src/lib/auth.ts';
				await fs.mkdir(path.dirname(authPath), { recursive: true });
				await fs.writeFile(authPath, authConfig);
				cliLogger.success('NextAuth configuration created at src/lib/auth.ts');
			} catch (error) {
				cliLogger.warn('Could not create auth configuration file');
			}
		}
	}

	private async generateApiConfig(serviceTemplate: any, fs: any, path: any): Promise<void> {
		const apiConfig = `// API Configuration for ${serviceTemplate.name}
export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000
};

export default apiConfig;`;

		try {
			const configPath = './src/lib/api-config.ts';
			await fs.mkdir(path.dirname(configPath), { recursive: true });
			await fs.writeFile(configPath, apiConfig);
			cliLogger.success('API configuration created at src/lib/api-config.ts');
		} catch (error) {
			cliLogger.warn('Could not create API client file');
		}
	}
}

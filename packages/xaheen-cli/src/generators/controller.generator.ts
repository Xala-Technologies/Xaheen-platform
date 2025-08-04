/**
 * Controller Generator - Rails-inspired controller generation
 *
 * Generates REST API controllers with CRUD operations, validation, and error handling
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-04
 */

import { BaseGenerator } from './base.generator.js';
import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('toLowerCase', (str: string) => str.toLowerCase());
Handlebars.registerHelper('toUpperCase', (str: string) => str.toUpperCase());
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());
import chalk from 'chalk';
import { select, text, confirm, multiselect, isCancel } from '@clack/prompts';

export interface ControllerGeneratorOptions {
	readonly name: string;
	readonly actions?: string[];
	readonly model?: string;
	readonly service?: string;
	readonly middleware?: string[];
	readonly validation?: boolean;
	readonly swagger?: boolean;
	readonly framework?: 'express' | 'nestjs' | 'fastify';
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly typescript?: boolean;
}

export interface ControllerAction {
	readonly name: string;
	readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	readonly path: string;
	readonly description: string;
}

export class ControllerGenerator extends BaseGenerator<ControllerGeneratorOptions> {
	private readonly defaultActions: ControllerAction[] = [
		{ name: 'index', method: 'GET', path: '', description: 'Get all items' },
		{ name: 'show', method: 'GET', path: '/:id', description: 'Get item by ID' },
		{ name: 'create', method: 'POST', path: '', description: 'Create new item' },
		{ name: 'update', method: 'PUT', path: '/:id', description: 'Update item by ID' },
		{ name: 'destroy', method: 'DELETE', path: '/:id', description: 'Delete item by ID' },
	];

	private readonly frameworks = [
		{ value: 'express', label: 'Express.js', description: 'Fast, unopinionated web framework' },
		{ value: 'nestjs', label: 'NestJS', description: 'Progressive Node.js framework' },
		{ value: 'fastify', label: 'Fastify', description: 'Fast and low overhead web framework' },
	] as const;

	async generate(options: ControllerGeneratorOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating controller: ${chalk.cyan(options.name)}`);

		// Detect framework if not specified
		const framework = options.framework || await this.detectFramework();

		// Parse actions from string format or use defaults
		const actions = await this.parseActions(options.actions || []);

		// Generate controller data
		const controllerData = {
			name: options.name,
			className: this.toPascalCase(options.name) + 'Controller',
			serviceName: options.service || this.toPascalCase(options.name) + 'Service',
			modelName: options.model || this.toPascalCase(options.name),
			actions,
			middleware: options.middleware || [],
			validation: options.validation !== false,
			swagger: options.swagger !== false,
			framework,
			typescript: options.typescript !== false,
		};

		// Generate controller file based on framework
		await this.generateController(controllerData, options);

		// Generate routes file if needed
		if (framework === 'express') {
			await this.generateExpressRoutes(controllerData, options);
		}

		// Generate tests
		await this.generateControllerTests(controllerData, options);

		// Generate Swagger/OpenAPI documentation
		if (options.swagger) {
			await this.generateApiDocumentation(controllerData, options);
		}

		this.logger.success(`Controller ${chalk.green(options.name)} generated successfully!`);
	}

	private async detectFramework(): Promise<'express' | 'nestjs' | 'fastify'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
			const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

			if (dependencies['@nestjs/core']) return 'nestjs';
			if (dependencies['fastify']) return 'fastify';
			if (dependencies['express']) return 'express';

			// Interactive selection if no framework detected
			const selectedFramework = await select({
				message: 'Which framework are you using?',
				options: this.frameworks,
			});

			if (isCancel(selectedFramework)) {
				throw new Error('Framework selection cancelled');
			}

			return selectedFramework as 'express' | 'nestjs' | 'fastify';
		} catch {
			return 'express'; // Default fallback
		}
	}

	private async parseActions(actionsInput: string[]): Promise<ControllerAction[]> {
		if (actionsInput.length === 0) {
			// Use default CRUD actions
			const useDefaults = await confirm({
				message: 'Use default CRUD actions (index, show, create, update, destroy)?',
			});

			if (isCancel(useDefaults)) {
				throw new Error('Action selection cancelled');
			}

			if (useDefaults) {
				return this.defaultActions;
			}

			// Interactive action selection
			const selectedActions = await multiselect({
				message: 'Select controller actions:',
				options: this.defaultActions.map(action => ({
					value: action.name,
					label: `${action.name} (${action.method} ${action.path})`,
					hint: action.description,
				})),
			});

			if (isCancel(selectedActions)) {
				throw new Error('Action selection cancelled');
			}

			return this.defaultActions.filter(action => 
				(selectedActions as string[]).includes(action.name)
			);
		}

		// Parse from command line format
		return actionsInput.map(actionName => {
			const defaultAction = this.defaultActions.find(a => a.name === actionName);
			return defaultAction || {
				name: actionName,
				method: 'GET' as const,
				path: `/${actionName}`,
				description: `${actionName} action`,
			};
		});
	}

	private async generateController(controllerData: any, options: ControllerGeneratorOptions): Promise<void> {
		const templateName = `controller/${controllerData.framework}-controller.hbs`;
		const template = await this.loadTemplate(templateName);
		const content = template(controllerData);

		const fileName = `${controllerData.name}.controller.ts`;
		const filePath = path.join(process.cwd(), 'src', 'controllers', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated controller: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate controller: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateExpressRoutes(controllerData: any, options: ControllerGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('controller/express-routes.hbs');
		const content = template(controllerData);

		const fileName = `${controllerData.name}.routes.ts`;
		const filePath = path.join(process.cwd(), 'src', 'routes', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated routes: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate routes: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateControllerTests(controllerData: any, options: ControllerGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('controller/controller-test.hbs');
		const content = template(controllerData);

		const fileName = `${controllerData.name}.controller.test.ts`;
		const filePath = path.join(process.cwd(), 'src', 'controllers', '__tests__', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated tests: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate tests: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateApiDocumentation(controllerData: any, options: ControllerGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('controller/api-documentation.hbs');
		const content = template(controllerData);

		const fileName = `${controllerData.name}.api.yml`;
		const filePath = path.join(process.cwd(), 'docs', 'api', fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated API docs: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate API docs: ${chalk.yellow(filePath)}`);
		}
	}

	private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
		const templateFile = path.join(__dirname, '../templates', templatePath);
		const templateContent = await fs.readFile(templateFile, 'utf-8');
		return Handlebars.compile(templateContent);
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}

	private toPascalCase(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
	}

	protected async validateOptions(options: ControllerGeneratorOptions): Promise<void> {
		if (!options.name) {
			throw new Error('Controller name is required');
		}

		if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
			throw new Error('Controller name must be alphanumeric and start with a letter');
		}
	}
}
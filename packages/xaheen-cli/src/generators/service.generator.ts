/**
 * Service Generator - Rails-inspired service generation
 *
 * Generates business logic services with dependency injection, validation, and testing
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-04
 */

import { promises as fs } from "fs";
import Handlebars from "handlebars";
import path from "path";
import { BaseGenerator } from "./base.generator";

// Register Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("camelCase", (str: string) => {
	return (
		str.charAt(0).toLowerCase() +
		str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
	);
});
Handlebars.registerHelper("generatedAt", () => new Date().toISOString());

import { confirm, isCancel, multiselect, select, text } from "@clack/prompts";
import chalk from "chalk";

export interface ServiceGeneratorOptions {
	readonly name: string;
	readonly model?: string;
	readonly repository?: string;
	readonly methods?: string[];
	readonly caching?: boolean;
	readonly events?: boolean;
	readonly logging?: boolean;
	readonly validation?: boolean;
	readonly injection?: "constructor" | "property";
	readonly framework?: "express" | "nestjs" | "fastify";
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly typescript?: boolean;
}

export interface ServiceMethod {
	readonly name: string;
	readonly description: string;
	readonly returnType: string;
	readonly parameters: ServiceParameter[];
}

export interface ServiceParameter {
	readonly name: string;
	readonly type: string;
	readonly optional: boolean;
}

export class ServiceGenerator extends BaseGenerator<ServiceGeneratorOptions> {
	private readonly defaultMethods: ServiceMethod[] = [
		{
			name: "findMany",
			description: "Find multiple items with pagination and filtering",
			returnType: "Promise<PaginatedResult<T>>",
			parameters: [
				{ name: "options", type: "FindManyOptions", optional: true },
			],
		},
		{
			name: "findById",
			description: "Find item by ID",
			returnType: "Promise<T | null>",
			parameters: [{ name: "id", type: "string", optional: false }],
		},
		{
			name: "create",
			description: "Create new item",
			returnType: "Promise<T>",
			parameters: [{ name: "input", type: "CreateInput<T>", optional: false }],
		},
		{
			name: "update",
			description: "Update existing item",
			returnType: "Promise<T | null>",
			parameters: [
				{ name: "id", type: "string", optional: false },
				{ name: "input", type: "UpdateInput<T>", optional: false },
			],
		},
		{
			name: "delete",
			description: "Delete item by ID",
			returnType: "Promise<boolean>",
			parameters: [{ name: "id", type: "string", optional: false }],
		},
	];

	async generate(options: ServiceGeneratorOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating service: ${chalk.cyan(options.name)}`);

		// Detect framework if not specified
		const framework = options.framework || (await this.detectFramework());

		// Parse methods from string format or use defaults
		const methods = await this.parseMethods(options.methods || []);

		// Generate service data
		const serviceData = {
			name: options.name,
			className: this.toPascalCase(options.name) + "Service",
			modelName: options.model || this.toPascalCase(options.name),
			repositoryName:
				options.repository || this.toPascalCase(options.name) + "Repository",
			methods,
			caching: options.caching || false,
			events: options.events || false,
			logging: options.logging !== false,
			validation: options.validation !== false,
			injection: options.injection || "constructor",
			framework,
			typescript: options.typescript !== false,
		};

		// Generate service file based on framework
		await this.generateService(serviceData, options);

		// Generate service interface
		await this.generateServiceInterface(serviceData, options);

		// Generate tests
		await this.generateServiceTests(serviceData, options);

		// Generate module/provider registration (if NestJS)
		if (framework === "nestjs") {
			await this.generateNestJSModule(serviceData, options);
		}

		this.logger.success(
			`Service ${chalk.green(options.name)} generated successfully!`,
		);
	}

	private async detectFramework(): Promise<"express" | "nestjs" | "fastify"> {
		try {
			const packageJsonPath = path.join(process.cwd(), "package.json");
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, "utf-8"),
			);
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (dependencies["@nestjs/core"]) return "nestjs";
			if (dependencies["fastify"]) return "fastify";
			if (dependencies["express"]) return "express";

			// Interactive selection if no framework detected
			const selectedFramework = await select({
				message: "Which framework are you using?",
				options: [
					{
						value: "nestjs",
						label: "NestJS",
						hint: "Progressive Node.js framework with DI",
					},
					{
						value: "express",
						label: "Express.js",
						hint: "Fast, unopinionated web framework",
					},
					{
						value: "fastify",
						label: "Fastify",
						hint: "Fast and low overhead web framework",
					},
				],
			});

			if (isCancel(selectedFramework)) {
				throw new Error("Framework selection cancelled");
			}

			return selectedFramework as "express" | "nestjs" | "fastify";
		} catch {
			return "express"; // Default fallback
		}
	}

	private async parseMethods(methodsInput: string[]): Promise<ServiceMethod[]> {
		if (methodsInput.length === 0) {
			// Use default CRUD methods
			const useDefaults = await confirm({
				message:
					"Use default CRUD service methods (findMany, findById, create, update, delete)?",
			});

			if (isCancel(useDefaults)) {
				throw new Error("Method selection cancelled");
			}

			if (useDefaults) {
				return this.defaultMethods;
			}

			// Interactive method selection
			const selectedMethods = await multiselect({
				message: "Select service methods:",
				options: this.defaultMethods.map((method) => ({
					value: method.name,
					label: method.name,
					hint: method.description,
				})),
			});

			if (isCancel(selectedMethods)) {
				throw new Error("Method selection cancelled");
			}

			return this.defaultMethods.filter((method) =>
				(selectedMethods as string[]).includes(method.name),
			);
		}

		// Parse from command line format
		return methodsInput.map((methodName) => {
			const defaultMethod = this.defaultMethods.find(
				(m) => m.name === methodName,
			);
			return (
				defaultMethod || {
					name: methodName,
					description: `${methodName} method`,
					returnType: "Promise<any>",
					parameters: [],
				}
			);
		});
	}

	private async generateService(
		serviceData: any,
		options: ServiceGeneratorOptions,
	): Promise<void> {
		const templateName = `service/${serviceData.framework}-service.hbs`;
		const template = await this.loadTemplate(templateName);
		const content = template(serviceData);

		const fileName = `${serviceData.name}.service.ts`;
		const filePath = path.join(process.cwd(), "src", "services", fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated service: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate service: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateServiceInterface(
		serviceData: any,
		options: ServiceGeneratorOptions,
	): Promise<void> {
		const template = await this.loadTemplate("service/service-interface.hbs");
		const content = template(serviceData);

		const fileName = `${serviceData.name}.service.interface.ts`;
		const filePath = path.join(process.cwd(), "src", "interfaces", fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated service interface: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(
				`Would generate service interface: ${chalk.yellow(filePath)}`,
			);
		}
	}

	private async generateServiceTests(
		serviceData: any,
		options: ServiceGeneratorOptions,
	): Promise<void> {
		const template = await this.loadTemplate("service/service-test.hbs");
		const content = template(serviceData);

		const fileName = `${serviceData.name}.service.test.ts`;
		const filePath = path.join(
			process.cwd(),
			"src",
			"services",
			"__tests__",
			fileName,
		);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated service tests: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(
				`Would generate service tests: ${chalk.yellow(filePath)}`,
			);
		}
	}

	private async generateNestJSModule(
		serviceData: any,
		options: ServiceGeneratorOptions,
	): Promise<void> {
		const template = await this.loadTemplate("service/nestjs-module.hbs");
		const content = template(serviceData);

		const fileName = `${serviceData.name}.module.ts`;
		const filePath = path.join(process.cwd(), "src", "modules", fileName);

		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated NestJS module: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(
				`Would generate NestJS module: ${chalk.yellow(filePath)}`,
			);
		}
	}

	private async loadTemplate(
		templatePath: string,
	): Promise<HandlebarsTemplateDelegate> {
		const templateFile = path.join(__dirname, "../templates", templatePath);
		const templateContent = await fs.readFile(templateFile, "utf-8");
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
		return (
			str.charAt(0).toUpperCase() +
			str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase())
		);
	}

	protected async validateOptions(
		options: ServiceGeneratorOptions,
	): Promise<void> {
		if (!options.name) {
			throw new Error("Service name is required");
		}

		if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
			throw new Error(
				"Service name must be alphanumeric and start with a letter",
			);
		}
	}
}

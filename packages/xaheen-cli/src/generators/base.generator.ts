import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import { confirm, text, select, isCancel } from '@clack/prompts';

export interface BaseGeneratorOptions {
	readonly name: string;
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly typescript?: boolean;
	readonly tests?: boolean;
	readonly stories?: boolean;
}

export interface GeneratorResult {
	readonly success: boolean;
	readonly message: string;
	readonly files?: string[];
	readonly commands?: string[];
	readonly nextSteps?: string[];
}

export interface NamingConvention {
	readonly className: string;
	readonly fileName: string;
	readonly variableName: string;
	readonly constantName: string;
	readonly kebabCase: string;
	readonly snakeCase: string;
}

export abstract class BaseGenerator<T extends BaseGeneratorOptions = BaseGeneratorOptions> {
	protected logger = {
		info: (message: string, ...args: any[]) =>
			console.log(`[INFO] ${message}`, ...args),
		success: (message: string, ...args: any[]) =>
			console.log(`[SUCCESS] ${message}`, ...args),
		warn: (message: string, ...args: any[]) =>
			console.warn(`[WARN] ${message}`, ...args),
		error: (message: string, error?: any) => {
			console.error(`[ERROR] ${message}`);
			if (error) {
				console.error(error);
			}
		},
	};

	// Abstract methods that must be implemented
	abstract generate(options: T): Promise<GeneratorResult>;
	abstract getGeneratorType(): string;

	// Rails-inspired convenience methods
	protected async confirmOverwrite(filePath: string, force?: boolean): Promise<boolean> {
		if (force) return true;
		
		try {
			await fs.access(filePath);
			
			const shouldOverwrite = await confirm({
				message: `File ${chalk.yellow(filePath)} already exists. Overwrite?`,
			});
			
			if (isCancel(shouldOverwrite)) {
				throw new Error('Generation cancelled by user');
			}
			
			return shouldOverwrite as boolean;
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				return true; // File doesn't exist, safe to create
			}
			throw error;
		}
	}

	protected async generateFile(
		templatePath: string,
		outputPath: string,
		data: any,
		options: { dryRun?: boolean; force?: boolean } = {}
	): Promise<string> {
		const template = await this.loadTemplate(templatePath);
		const content = template(data);

		if (options.dryRun) {
			this.logger.info(`${chalk.yellow('[DRY RUN]')} Would generate: ${chalk.cyan(outputPath)}`);
			return outputPath;
		}

		const shouldProceed = await this.confirmOverwrite(outputPath, options.force);
		if (!shouldProceed) {
			this.logger.warn(`Skipped: ${chalk.yellow(outputPath)}`);
			return outputPath;
		}

		await this.ensureDirectoryExists(path.dirname(outputPath));
		await fs.writeFile(outputPath, content, 'utf-8');
		this.logger.success(`Generated: ${chalk.green(outputPath)}`);
		
		return outputPath;
	}

	protected async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
		const templateFile = path.join(__dirname, '../templates', templatePath);
		try {
			const templateContent = await fs.readFile(templateFile, 'utf-8');
			return Handlebars.compile(templateContent);
		} catch (error) {
			throw new Error(`Failed to load template: ${templatePath}. Error: ${error}`);
		}
	}

	protected async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
			this.logger.info(`Created directory: ${chalk.blue(dirPath)}`);
		}
	}

	// Naming convention helpers (Rails-inspired)
	protected getNamingConvention(name: string): NamingConvention {
		return {
			className: this.toPascalCase(name),
			fileName: this.toKebabCase(name),
			variableName: this.toCamelCase(name),
			constantName: this.toConstantCase(name),
			kebabCase: this.toKebabCase(name),
			snakeCase: this.toSnakeCase(name),
		};
	}

	protected toPascalCase(str: string): string {
		return str
			.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
			.replace(/^(.)/, (char) => char.toUpperCase());
	}

	protected toCamelCase(str: string): string {
		return str
			.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
			.replace(/^(.)/, (char) => char.toLowerCase());
	}

	protected toKebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, '-$1')
			.replace(/[-_\s]+/g, '-')
			.toLowerCase()
			.replace(/^-/, '');
	}

	protected toSnakeCase(str: string): string {
		return str
			.replace(/([A-Z])/g, '_$1')
			.replace(/[-\s]+/g, '_')
			.toLowerCase()
			.replace(/^_/, '');
	}

	protected toConstantCase(str: string): string {
		return this.toSnakeCase(str).toUpperCase();
	}

	// Project structure detection
	protected async detectProjectStructure(): Promise<{
		frameworkType: 'next' | 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';
		usesTypeScript: boolean;
		usesStorybook: boolean;
		usesJest: boolean;
		componentsDir: string;
		pagesDir?: string;
	}> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
			const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

			let frameworkType: 'next' | 'react' | 'vue' | 'angular' | 'svelte' | 'unknown' = 'unknown';
			let componentsDir = 'src/components';
			let pagesDir: string | undefined;

			if (deps['next']) {
				frameworkType = 'next';
				componentsDir = 'src/components';
				pagesDir = 'src/app';
			} else if (deps['@angular/core']) {
				frameworkType = 'angular';
				componentsDir = 'src/app/components';
			} else if (deps['vue']) {
				frameworkType = 'vue';
				componentsDir = 'src/components';
			} else if (deps['svelte']) {
				frameworkType = 'svelte';
				componentsDir = 'src/lib/components';
			} else if (deps['react']) {
				frameworkType = 'react';
				componentsDir = 'src/components';
			}

			return {
				frameworkType,
				usesTypeScript: !!(deps['typescript'] || deps['@types/node']),
				usesStorybook: !!(deps['@storybook/react'] || deps['@storybook/vue']),
				usesJest: !!(deps['jest'] || deps['@testing-library/react']),
				componentsDir,
				pagesDir,
			};
		} catch {
			return {
				frameworkType: 'unknown',
				usesTypeScript: true, // Default to TypeScript
				usesStorybook: false,
				usesJest: false,
				componentsDir: 'src/components',
			};
		}
	}

	// Interactive prompts for missing parameters
	protected async promptForMissingOptions(options: Partial<T>): Promise<T> {
		const result = { ...options } as T;

		if (!result.name) {
			const name = await text({
				message: `Enter ${this.getGeneratorType()} name:`,
				placeholder: `My${this.getGeneratorType().charAt(0).toUpperCase()}${this.getGeneratorType().slice(1)}`,
				validate: (value) => {
					if (!value) return 'Name is required';
					if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
						return 'Name must be alphanumeric and start with a letter';
					}
					return undefined;
				},
			});

			if (isCancel(name)) {
				throw new Error('Name input cancelled');
			}

			result.name = name as string;
		}

		return result;
	}

	protected async validateOptions(options: T): Promise<void> {
		if (!options.name) {
			throw new Error(`${this.getGeneratorType()} name is required`);
		}

		if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
			throw new Error(`${this.getGeneratorType()} name must be alphanumeric and start with a letter`);
		}
	}

	// File placement conventions per UI System
	protected getFilePlacement(type: string, name: string): {
		filePath: string;
		testPath?: string;
		storyPath?: string;
	} {
		const naming = this.getNamingConvention(name);
		const extension = 'tsx'; // Default to TypeScript

		switch (type) {
			case 'component':
				return {
					filePath: `src/components/${naming.className}.${extension}`,
					testPath: `src/components/__tests__/${naming.className}.test.${extension}`,
					storyPath: `src/components/${naming.className}.stories.${extension}`,
				};
			case 'page':
				return {
					filePath: `src/pages/${naming.kebabCase}/page.${extension}`,
					testPath: `src/pages/${naming.kebabCase}/__tests__/page.test.${extension}`,
				};
			case 'layout':
				return {
					filePath: `src/components/layouts/${naming.className}.${extension}`,
					testPath: `src/components/layouts/__tests__/${naming.className}.test.${extension}`,
					storyPath: `src/components/layouts/${naming.className}.stories.${extension}`,
				};
			case 'model':
				return {
					filePath: `src/types/${naming.kebabCase}.types.ts`,
					testPath: `src/types/__tests__/${naming.kebabCase}.test.ts`,
				};
			default:
				return {
					filePath: `src/${type}s/${naming.kebabCase}.${extension}`,
				};
		}
	}
}

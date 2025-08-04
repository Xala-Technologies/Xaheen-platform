/**
 * Model Generator - Rails-inspired model generation
 *
 * Generates TypeScript models with field definitions, validation, and database integration
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
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());
import chalk from 'chalk';
import { select, text, confirm, multiselect, isCancel } from '@clack/prompts';

export interface ModelGeneratorOptions {
	readonly name: string;
	readonly fields?: string[];
	readonly tableName?: string;
	readonly timestamps?: boolean;
	readonly softDeletes?: boolean;
	readonly validation?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
	readonly typescript?: boolean;
}

export interface ModelField {
	readonly name: string;
	readonly type: string;
	readonly optional: boolean;
	readonly defaultValue?: string;
	readonly validation?: string[];
}

export class ModelGenerator extends BaseGenerator<ModelGeneratorOptions> {
	private readonly fieldTypes = [
		'string',
		'number',
		'boolean',
		'Date',
		'email',
		'url',
		'uuid',
		'json',
		'text',
		'password',
		'enum',
	];

	async generate(options: ModelGeneratorOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating model: ${chalk.cyan(options.name)}`);

		// Parse fields from string format or interactive input
		const fields = await this.parseFields(options.fields || []);
		
		// Generate model files
		const modelData = {
			name: options.name,
			className: this.toPascalCase(options.name),
			tableName: options.tableName || this.toSnakeCase(options.name),
			fields,
			timestamps: options.timestamps !== false,
			softDeletes: options.softDeletes || false,
			validation: options.validation !== false,
			typescript: options.typescript !== false,
		};

		// Generate TypeScript interface
		await this.generateTypeScriptInterface(modelData, options);

		// Generate Prisma schema (if Prisma is detected)
		await this.generatePrismaModel(modelData, options);

		// Generate Drizzle schema (if Drizzle is detected)
		await this.generateDrizzleModel(modelData, options);

		// Generate validation schemas (Zod/Yup)
		await this.generateValidationSchema(modelData, options);

		// Generate repository pattern (if enabled)
		await this.generateRepository(modelData, options);

		this.logger.success(`Model ${chalk.green(options.name)} generated successfully!`);
	}

	private async parseFields(fieldsInput: string[]): Promise<ModelField[]> {
		const fields: ModelField[] = [];

		if (fieldsInput.length === 0) {
			// Interactive field input
			this.logger.info('Define your model fields (press Enter with empty name to finish):');
			
			while (true) {
				const fieldName = await text({
					message: 'Field name:',
					placeholder: 'e.g., email, firstName, age',
				});

				if (isCancel(fieldName) || !fieldName) {
					break;
				}

				const fieldType = await select({
					message: `Type for ${fieldName}:`,
					options: this.fieldTypes.map(type => ({
						value: type,
						label: type,
					})),
				});

				if (isCancel(fieldType)) {
					break;
				}

				const isOptional = await confirm({
					message: `Is ${fieldName} optional?`,
				});

				if (isCancel(isOptional)) {
					break;
				}

				const validationOptions = await multiselect({
					message: `Validation rules for ${fieldName}:`,
					options: [
						{ value: 'required', label: 'Required' },
						{ value: 'unique', label: 'Unique' },
						{ value: 'email', label: 'Email format' },
						{ value: 'min', label: 'Minimum length/value' },
						{ value: 'max', label: 'Maximum length/value' },
					],
					required: false,
				});

				fields.push({
					name: fieldName as string,
					type: fieldType as string,
					optional: isOptional as boolean,
					validation: Array.isArray(validationOptions) ? validationOptions as string[] : [],
				});
			}
		} else {
			// Parse from command line format: "name:string email:email age:number?"
			for (const fieldDef of fieldsInput) {
				const [nameAndType, ...rest] = fieldDef.split(':');
				const [name, typeAndModifiers] = nameAndType.split('');
				
				if (!typeAndModifiers) continue;

				const optional = typeAndModifiers.endsWith('?');
				const type = typeAndModifiers.replace('?', '');

				fields.push({
					name,
					type,
					optional,
					validation: [],
				});
			}
		}

		return fields;
	}

	private async generateTypeScriptInterface(modelData: any, options: ModelGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('model/typescript-interface.hbs');
		const content = template(modelData);

		const filePath = path.join(process.cwd(), 'src', 'types', `${modelData.name}.types.ts`);
		
		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate: ${chalk.yellow(filePath)}`);
		}
	}

	private async generatePrismaModel(modelData: any, options: ModelGeneratorOptions): Promise<void> {
		// Check if Prisma is configured
		const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
		
		try {
			await fs.access(prismaSchemaPath);
			
			const template = await this.loadTemplate('model/prisma-model.hbs');
			const content = template(modelData);

			if (!options.dryRun) {
				// Append to existing schema file
				await fs.appendFile(prismaSchemaPath, `\n${content}`);
				this.logger.info(`Updated Prisma schema: ${chalk.green(prismaSchemaPath)}`);
			} else {
				this.logger.info(`Would update Prisma schema: ${chalk.yellow(prismaSchemaPath)}`);
			}
		} catch {
			// Prisma not configured, skip
		}
	}

	private async generateDrizzleModel(modelData: any, options: ModelGeneratorOptions): Promise<void> {
		// Check if Drizzle is configured
		const drizzleSchemaPath = path.join(process.cwd(), 'src', 'db', 'schema.ts');
		
		try {
			await fs.access(drizzleSchemaPath);
			
			const template = await this.loadTemplate('model/drizzle-model.hbs');
			const content = template(modelData);

			const filePath = path.join(process.cwd(), 'src', 'db', 'models', `${modelData.name}.ts`);
			
			if (!options.dryRun) {
				await this.ensureDirectoryExists(path.dirname(filePath));
				await fs.writeFile(filePath, content);
				this.logger.info(`Generated Drizzle model: ${chalk.green(filePath)}`);
			} else {
				this.logger.info(`Would generate Drizzle model: ${chalk.yellow(filePath)}`);
			}
		} catch {
			// Drizzle not configured, skip
		}
	}

	private async generateValidationSchema(modelData: any, options: ModelGeneratorOptions): Promise<void> {
		if (!modelData.validation) return;

		const template = await this.loadTemplate('model/validation-schema.hbs');
		const content = template(modelData);

		const filePath = path.join(process.cwd(), 'src', 'validation', `${modelData.name}.validation.ts`);
		
		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated validation schema: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate validation schema: ${chalk.yellow(filePath)}`);
		}
	}

	private async generateRepository(modelData: any, options: ModelGeneratorOptions): Promise<void> {
		const template = await this.loadTemplate('model/repository.hbs');
		const content = template(modelData);

		const filePath = path.join(process.cwd(), 'src', 'repositories', `${modelData.name}.repository.ts`);
		
		if (!options.dryRun) {
			await this.ensureDirectoryExists(path.dirname(filePath));
			await fs.writeFile(filePath, content);
			this.logger.info(`Generated repository: ${chalk.green(filePath)}`);
		} else {
			this.logger.info(`Would generate repository: ${chalk.yellow(filePath)}`);
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

	private toSnakeCase(str: string): string {
		return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
	}

	protected async validateOptions(options: ModelGeneratorOptions): Promise<void> {
		if (!options.name) {
			throw new Error('Model name is required');
		}

		if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
			throw new Error('Model name must be alphanumeric and start with a letter');
		}
	}
}
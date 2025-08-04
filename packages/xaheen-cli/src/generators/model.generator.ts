/**
 * Model Generator - Rails-inspired model generation
 *
 * Generates TypeScript models with field definitions, validation, and database integration
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-04
 */

import { BaseGenerator, BaseGeneratorOptions, GeneratorResult } from './base.generator.js';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import { select, text, confirm, multiselect, isCancel } from '@clack/prompts';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());

export interface ModelGeneratorOptions extends BaseGeneratorOptions {
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

	getGeneratorType(): string {
		return 'model';
	}

	async generate(options: ModelGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating model: ${chalk.cyan(options.name)}`);

		// Parse fields from string format or interactive input
		const fields = await this.parseFields(options.fields || []);
		
		// Generate model files using Rails-inspired naming conventions
		const naming = this.getNamingConvention(options.name);
		const modelData = {
			name: options.name,
			className: naming.className,
			tableName: options.tableName || naming.snakeCase,
			fields,
			timestamps: options.timestamps !== false,
			softDeletes: options.softDeletes || false,
			validation: options.validation !== false,
			typescript: options.typescript !== false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate TypeScript interface
		const typeFile = await this.generateTypeScriptInterface(modelData, options);
		if (typeFile) generatedFiles.push(typeFile);

		// Generate Prisma schema (if Prisma is detected)
		const prismaFile = await this.generatePrismaModel(modelData, options);
		if (prismaFile) generatedFiles.push(prismaFile);

		// Generate Drizzle schema (if Drizzle is detected)
		const drizzleFile = await this.generateDrizzleModel(modelData, options);
		if (drizzleFile) generatedFiles.push(drizzleFile);

		// Generate validation schemas (Zod/Yup)
		const validationFile = await this.generateValidationSchema(modelData, options);
		if (validationFile) generatedFiles.push(validationFile);

		// Generate repository pattern (if enabled)
		const repositoryFile = await this.generateRepository(modelData, options);
		if (repositoryFile) generatedFiles.push(repositoryFile);

		this.logger.success(`Model ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Model ${options.name} generated successfully`,
			files: generatedFiles,
			nextSteps: [
				'Run database migration if using a database',
				'Add model to service layer',
				'Import types in components that need them',
			],
		};
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

	private async generateTypeScriptInterface(modelData: any, options: ModelGeneratorOptions): Promise<string | null> {
		const placement = this.getFilePlacement('model', modelData.name);
		
		try {
			return await this.generateFile(
				'model/typescript-interface.hbs',
				placement.filePath,
				modelData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate TypeScript interface: ${error}`);
			return null;
		}
	}

	private async generatePrismaModel(modelData: any, options: ModelGeneratorOptions): Promise<string | null> {
		// Check if Prisma is configured
		const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
		
		try {
			await this.ensureDirectoryExists(path.dirname(prismaSchemaPath));
			
			const template = await this.loadTemplate('model/prisma-model.hbs');
			const content = template(modelData);

			if (!options.dryRun) {
				// Append to existing schema file
				const fs = await import('fs/promises');
				await fs.appendFile(prismaSchemaPath, `\n${content}`);
				this.logger.info(`Updated Prisma schema: ${chalk.green(prismaSchemaPath)}`);
				return prismaSchemaPath;
			} else {
				this.logger.info(`Would update Prisma schema: ${chalk.yellow(prismaSchemaPath)}`);
				return prismaSchemaPath;
			}
		} catch {
			// Prisma not configured, skip
			return null;
		}
	}

	private async generateDrizzleModel(modelData: any, options: ModelGeneratorOptions): Promise<string | null> {
		// Check if Drizzle is configured
		const drizzleSchemaPath = path.join(process.cwd(), 'src', 'db', 'schema.ts');
		
		try {
			const fs = await import('fs/promises');
			await fs.access(drizzleSchemaPath);
			
			const filePath = path.join(process.cwd(), 'src', 'db', 'models', `${modelData.name}.ts`);
			
			return await this.generateFile(
				'model/drizzle-model.hbs',
				filePath,
				modelData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch {
			// Drizzle not configured, skip
			return null;
		}
	}

	private async generateValidationSchema(modelData: any, options: ModelGeneratorOptions): Promise<string | null> {
		if (!modelData.validation) return null;

		const filePath = path.join(process.cwd(), 'src', 'validation', `${modelData.kebabCase}.validation.ts`);
		
		try {
			return await this.generateFile(
				'model/validation-schema.hbs',
				filePath,
				modelData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate validation schema: ${error}`);
			return null;
		}
	}

	private async generateRepository(modelData: any, options: ModelGeneratorOptions): Promise<string | null> {
		const filePath = path.join(process.cwd(), 'src', 'repositories', `${modelData.kebabCase}.repository.ts`);
		
		try {
			return await this.generateFile(
				'model/repository.hbs',
				filePath,
				modelData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate repository: ${error}`);
			return null;
		}
	}

}
}
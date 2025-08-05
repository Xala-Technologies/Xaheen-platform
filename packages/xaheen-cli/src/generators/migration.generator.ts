/**
 * Migration Generator - Database schema migration generation
 *
 * Generates database migrations for Prisma, Drizzle, and other ORMs with Norwegian compliance
 *
 * @author Xaheen CLI Generator System
 * @since 2025-08-05
 */

import { confirm, isCancel, multiselect, select, text } from '@clack/prompts';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import {
	BaseGenerator,
	BaseGeneratorOptions,
	GeneratorResult,
} from './base.generator.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('includes', (array, value) => array && array.includes(value));
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());
Handlebars.registerHelper('timestamp', () => new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, ''));

export interface MigrationGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly orm?: 'prisma' | 'drizzle' | 'typeorm' | 'sequelize' | 'knex';
	readonly action?: 'create' | 'alter' | 'drop' | 'seed' | 'index' | 'constraint';
	readonly table?: string;
	readonly fields?: string[];
	readonly operations?: string[];
	readonly rollback?: boolean;
	readonly norwegian?: boolean;
	readonly dataCompliance?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export interface MigrationField {
	readonly name: string;
	readonly type: string;
	readonly nullable: boolean;
	readonly unique: boolean;
	readonly index: boolean;
	readonly defaultValue?: string;
	readonly foreignKey?: {
		table: string;
		field: string;
	};
}

export interface MigrationOperation {
	readonly type: 'add_column' | 'drop_column' | 'modify_column' | 'add_index' | 'drop_index' | 'add_constraint' | 'drop_constraint';
	readonly target: string;
	readonly field?: MigrationField;
	readonly oldField?: MigrationField;
}

export class MigrationGenerator extends BaseGenerator<MigrationGeneratorOptions> {
	private readonly migrationActions = [
		{
			value: 'create',
			label: 'Create Table',
			hint: 'Create a new database table',
		},
		{
			value: 'alter',
			label: 'Alter Table',
			hint: 'Modify existing table structure',
		},
		{
			value: 'drop',
			label: 'Drop Table',
			hint: 'Remove a database table',
		},
		{
			value: 'seed',
			label: 'Seed Data',
			hint: 'Insert initial/sample data',
		},
		{
			value: 'index',
			label: 'Manage Indexes',
			hint: 'Add or remove database indexes',
		},
		{
			value: 'constraint',
			label: 'Manage Constraints',
			hint: 'Add or remove constraints',
		},
	];

	private readonly ormSupport = [
		{
			value: 'prisma',
			label: 'Prisma',
			hint: 'Prisma ORM migrations',
		},
		{
			value: 'drizzle',
			label: 'Drizzle ORM',
			hint: 'Drizzle ORM migrations',
		},
		{
			value: 'typeorm',
			label: 'TypeORM',
			hint: 'TypeORM migrations',
		},
		{
			value: 'sequelize',
			label: 'Sequelize',
			hint: 'Sequelize migrations',
		},
		{
			value: 'knex',
			label: 'Knex.js',
			hint: 'Knex.js query builder migrations',
		},
	];

	private readonly fieldTypes = [
		'id', 'string', 'text', 'integer', 'bigint', 'decimal', 'float', 'boolean',
		'date', 'datetime', 'timestamp', 'json', 'uuid', 'email', 'url', 'enum'
	];

	private readonly commonOperations = [
		{
			value: 'add_column',
			label: 'Add Column',
			hint: 'Add a new column to the table',
		},
		{
			value: 'drop_column',
			label: 'Drop Column',
			hint: 'Remove a column from the table',
		},
		{
			value: 'modify_column',
			label: 'Modify Column',
			hint: 'Change column type or properties',
		},
		{
			value: 'add_index',
			label: 'Add Index',
			hint: 'Add database index for performance',
		},
		{
			value: 'drop_index',
			label: 'Drop Index',
			hint: 'Remove database index',
		},
		{
			value: 'add_constraint',
			label: 'Add Constraint',
			hint: 'Add foreign key or check constraint',
		},
		{
			value: 'drop_constraint',
			label: 'Drop Constraint',
			hint: 'Remove constraint',
		},
	];

	getGeneratorType(): string {
		return 'migration';
	}

	async generate(options: MigrationGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating migration: ${chalk.cyan(options.name)}`);

		// Detect ORM if not specified
		const orm = options.orm || await this.detectORM();

		// Interactive prompts for missing options
		const migrationOptions = await this.promptForMissingMigrationOptions(options, orm);

		// Generate migration data
		const naming = this.getNamingConvention(options.name);
		const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').substring(0, 14);
		
		const migrationData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			timestamp,
			orm,
			action: migrationOptions.action || 'create',
			table: migrationOptions.table || naming.snakeCase,
			fields: await this.parseFields(migrationOptions.fields || []),
			operations: await this.parseOperations(migrationOptions.operations || []),
			rollback: migrationOptions.rollback !== false,
			norwegian: migrationOptions.norwegian || false,
			dataCompliance: migrationOptions.dataCompliance || false,
			typescript: options.typescript !== false,
			hasOperation: (op: string) => migrationOptions.operations?.includes(op) || false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate main migration file
		const migrationFile = await this.generateMigrationFile(migrationData, options);
		if (migrationFile) generatedFiles.push(migrationFile);

		// Generate rollback migration if enabled
		if (migrationData.rollback) {
			const rollbackFile = await this.generateRollbackMigration(migrationData, options);
			if (rollbackFile) generatedFiles.push(rollbackFile);
		}

		// Generate seed file if this is a seed migration
		if (migrationData.action === 'seed') {
			const seedFile = await this.generateSeedFile(migrationData, options);
			if (seedFile) generatedFiles.push(seedFile);
		}

		// Generate Norwegian compliance features
		if (migrationData.norwegian || migrationData.dataCompliance) {
			const complianceFiles = await this.generateDataCompliance(migrationData, options);
			generatedFiles.push(...complianceFiles);
		}

		// Generate migration documentation
		const docsFile = await this.generateMigrationDocs(migrationData, options);
		if (docsFile) generatedFiles.push(docsFile);

		this.logger.success(`Migration ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Migration ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(migrationData),
			nextSteps: this.getNextSteps(migrationData),
		};
	}

	private async detectORM(): Promise<'prisma' | 'drizzle' | 'typeorm' | 'sequelize' | 'knex'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, 'utf-8'),
			);
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (dependencies['prisma'] || dependencies['@prisma/client']) return 'prisma';
			if (dependencies['drizzle-orm']) return 'drizzle';
			if (dependencies['typeorm']) return 'typeorm';
			if (dependencies['sequelize']) return 'sequelize';
			if (dependencies['knex']) return 'knex';

			// Interactive selection if no ORM detected
			const selectedORM = await select({
				message: 'Which ORM/query builder are you using?',
				options: this.ormSupport,
			});

			if (isCancel(selectedORM)) {
				throw new Error('ORM selection cancelled');
			}

			return selectedORM as 'prisma' | 'drizzle' | 'typeorm' | 'sequelize' | 'knex';
		} catch {
			return 'prisma'; // Default fallback
		}
	}

	private async promptForMissingMigrationOptions(
		options: MigrationGeneratorOptions,
		orm: string
	): Promise<MigrationGeneratorOptions> {
		const result = { ...options, orm };

		// Migration action selection
		if (!result.action) {
			const action = await select({
				message: 'What type of migration would you like to create?',
				options: this.migrationActions,
			});

			if (!isCancel(action)) {
				result.action = action as any;
			}
		}

		// Table name input
		if (!result.table && (result.action === 'create' || result.action === 'alter' || result.action === 'drop')) {
			const table = await text({
				message: 'Table name:',
				placeholder: 'users, products, orders',
				validate: (value) => {
					if (!value) return 'Table name is required';
					if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
						return 'Table name must be alphanumeric with underscores';
					}
					return undefined;
				},
			});

			if (!isCancel(table)) {
				result.table = table as string;
			}
		}

		// Fields for table creation
		if (result.action === 'create' && !result.fields) {
			result.fields = await this.promptForFields();
		}

		// Operations for table alteration
		if (result.action === 'alter' && !result.operations) {
			const operations = await multiselect({
				message: 'Select operations to perform:',
				options: this.commonOperations,
				required: true,
			});

			if (!isCancel(operations)) {
				result.operations = operations as string[];
			}
		}

		// Norwegian compliance
		if (result.norwegian === undefined) {
			const norwegian = await confirm({
				message: 'Include Norwegian data compliance features?',
			});

			if (!isCancel(norwegian)) {
				result.norwegian = norwegian as boolean;
			}
		}

		// Data compliance (GDPR)
		if (result.dataCompliance === undefined) {
			const dataCompliance = await confirm({
				message: 'Include GDPR data compliance features?',
			});

			if (!isCancel(dataCompliance)) {
				result.dataCompliance = dataCompliance as boolean;
			}
		}

		return result;
	}

	private async promptForFields(): Promise<string[]> {
		const fields: string[] = [];
		
		this.logger.info('Define your table fields (press Enter with empty name to finish):');
		
		while (true) {
			const fieldName = await text({
				message: 'Field name:',
				placeholder: 'id, email, name, created_at',
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

			const isNullable = await confirm({
				message: `Is ${fieldName} nullable?`,
			});

			const isUnique = await confirm({
				message: `Is ${fieldName} unique?`,
			});

			const needsIndex = await confirm({
				message: `Index ${fieldName}?`,
			});

			let fieldDef = `${fieldName}:${fieldType}`;
			if (!isCancel(isNullable) && isNullable) fieldDef += '?';
			if (!isCancel(isUnique) && isUnique) fieldDef += '@unique';
			if (!isCancel(needsIndex) && needsIndex) fieldDef += '@index';

			fields.push(fieldDef);
		}

		return fields;
	}

	private async parseFields(fieldsInput: string[]): Promise<MigrationField[]> {
		return fieldsInput.map(fieldDef => {
			const [nameAndType, ...modifiers] = fieldDef.split('@');
			const [name, type] = nameAndType.split(':');
			
			const nullable = type?.endsWith('?') || false;
			const cleanType = type?.replace('?', '') || 'string';
			
			return {
				name,
				type: cleanType,
				nullable,
				unique: modifiers.includes('unique'),
				index: modifiers.includes('index'),
			};
		});
	}

	private async parseOperations(operationsInput: string[]): Promise<MigrationOperation[]> {
		return operationsInput.map(op => ({
			type: op as any,
			target: 'table', // Simplified for now
		}));
	}

	private async generateMigrationFile(migrationData: any, options: MigrationGeneratorOptions): Promise<string | null> {
		const templateName = this.getMigrationTemplate(migrationData.orm, migrationData.action);
		const filePath = this.getMigrationFilePath(migrationData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				migrationData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate migration file: ${error}`);
			return null;
		}
	}

	private async generateRollbackMigration(migrationData: any, options: MigrationGeneratorOptions): Promise<string | null> {
		const templateName = `migration/${migrationData.orm}/rollback.hbs`;
		const filePath = this.getRollbackFilePath(migrationData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				migrationData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate rollback migration: ${error}`);
			return null;
		}
	}

	private async generateSeedFile(migrationData: any, options: MigrationGeneratorOptions): Promise<string | null> {
		const templateName = `migration/${migrationData.orm}/seed.hbs`;
		const filePath = this.getSeedFilePath(migrationData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				{
					...migrationData,
					seedData: this.generateNorwegianSeedData(migrationData.table),
				},
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate seed file: ${error}`);
			return null;
		}
	}

	private async generateDataCompliance(migrationData: any, options: MigrationGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate GDPR compliance migration
		if (migrationData.dataCompliance) {
			try {
				const gdprFile = await this.generateFile(
					'migration/compliance/gdpr-compliance.hbs',
					path.join(process.cwd(), 'migrations', 'compliance', `gdpr_${migrationData.timestamp}.sql`),
					migrationData,
					{ dryRun: options.dryRun, force: options.force }
				);
				if (gdprFile) files.push(gdprFile);
			} catch (error) {
				this.logger.warn(`Failed to generate GDPR compliance migration: ${error}`);
			}
		}

		// Generate Norwegian data retention policies
		if (migrationData.norwegian) {
			try {
				const retentionFile = await this.generateFile(
					'migration/compliance/norwegian-retention.hbs',
					path.join(process.cwd(), 'migrations', 'compliance', `norwegian_retention_${migrationData.timestamp}.sql`),
					migrationData,
					{ dryRun: options.dryRun, force: options.force }
				);
				if (retentionFile) files.push(retentionFile);
			} catch (error) {
				this.logger.warn(`Failed to generate Norwegian retention migration: ${error}`);
			}
		}

		return files;
	}

	private async generateMigrationDocs(migrationData: any, options: MigrationGeneratorOptions): Promise<string | null> {
		const templateName = 'migration/migration-docs.hbs';
		const filePath = path.join(process.cwd(), 'docs', 'migrations', `${migrationData.fileName}.md`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				migrationData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate migration documentation: ${error}`);
			return null;
		}
	}

	private getMigrationTemplate(orm: string, action: string): string {
		const templates = {
			prisma: {
				create: 'migration/prisma/create-table.hbs',
				alter: 'migration/prisma/alter-table.hbs',
				drop: 'migration/prisma/drop-table.hbs',
				seed: 'migration/prisma/seed.hbs',
				index: 'migration/prisma/index.hbs',
				constraint: 'migration/prisma/constraint.hbs',
			},
			drizzle: {
				create: 'migration/drizzle/create-table.hbs',
				alter: 'migration/drizzle/alter-table.hbs',
				drop: 'migration/drizzle/drop-table.hbs',
				seed: 'migration/drizzle/seed.hbs',
				index: 'migration/drizzle/index.hbs',
				constraint: 'migration/drizzle/constraint.hbs',
			},
			typeorm: {
				create: 'migration/typeorm/create-table.hbs',
				alter: 'migration/typeorm/alter-table.hbs',
				drop: 'migration/typeorm/drop-table.hbs',
				seed: 'migration/typeorm/seed.hbs',
				index: 'migration/typeorm/index.hbs',
				constraint: 'migration/typeorm/constraint.hbs',
			},
			sequelize: {
				create: 'migration/sequelize/create-table.hbs',
				alter: 'migration/sequelize/alter-table.hbs',
				drop: 'migration/sequelize/drop-table.hbs',
				seed: 'migration/sequelize/seed.hbs',
				index: 'migration/sequelize/index.hbs',
				constraint: 'migration/sequelize/constraint.hbs',
			},
			knex: {
				create: 'migration/knex/create-table.hbs',
				alter: 'migration/knex/alter-table.hbs',
				drop: 'migration/knex/drop-table.hbs',
				seed: 'migration/knex/seed.hbs',
				index: 'migration/knex/index.hbs',
				constraint: 'migration/knex/constraint.hbs',
			},
		};

		return templates[orm as keyof typeof templates]?.[action as keyof typeof templates.prisma] 
			|| 'migration/generic-migration.hbs';
	}

	private getMigrationFilePath(migrationData: any): string {
		const extension = migrationData.typescript && migrationData.orm !== 'prisma' ? 'ts' : 'sql';
		const timestamp = migrationData.timestamp;
		
		const paths = {
			prisma: path.join(process.cwd(), 'prisma', 'migrations', `${timestamp}_${migrationData.fileName}`, 'migration.sql'),
			drizzle: path.join(process.cwd(), 'drizzle', 'migrations', `${timestamp}_${migrationData.fileName}.sql`),
			typeorm: path.join(process.cwd(), 'src', 'migrations', `${timestamp}-${migrationData.className}.ts`),
			sequelize: path.join(process.cwd(), 'migrations', `${timestamp}-${migrationData.fileName}.js`),
			knex: path.join(process.cwd(), 'migrations', `${timestamp}_${migrationData.fileName}.ts`),
		};

		return paths[migrationData.orm as keyof typeof paths] || 
			path.join(process.cwd(), 'migrations', `${timestamp}_${migrationData.fileName}.${extension}`);
	}

	private getRollbackFilePath(migrationData: any): string {
		const timestamp = migrationData.timestamp;
		return path.join(process.cwd(), 'migrations', 'rollbacks', `${timestamp}_rollback_${migrationData.fileName}.sql`);
	}

	private getSeedFilePath(migrationData: any): string {
		const extension = migrationData.typescript ? 'ts' : 'js';
		return path.join(process.cwd(), 'seeds', `${migrationData.fileName}-seed.${extension}`);
	}

	private generateNorwegianSeedData(tableName: string): any[] {
		// Generate realistic Norwegian sample data
		const norwegianSeedData = {
			users: [
				{ name: 'Ola Nordmann', email: 'ola@example.no', city: 'Oslo' },
				{ name: 'Kari Hansen', email: 'kari@example.no', city: 'Bergen' },
				{ name: 'Lars Johansen', email: 'lars@example.no', city: 'Trondheim' },
			],
			companies: [
				{ name: 'Equinor ASA', org_number: '923609016', city: 'Stavanger' },
				{ name: 'DNB ASA', org_number: '984851006', city: 'Oslo' },
				{ name: 'Telenor ASA', org_number: '935033350', city: 'Fornebu' },
			],
			products: [
				{ name: 'Lefse', price: 25.50, category: 'Bakervarer' },
				{ name: 'Brunost', price: 45.00, category: 'Meieriprodukter' },
				{ name: 'Fårikål', price: 120.00, category: 'Måltider' },
			],
		};

		return norwegianSeedData[tableName as keyof typeof norwegianSeedData] || [];
	}

	private getRecommendedCommands(migrationData: any): string[] {
		const commands = [];
		
		switch (migrationData.orm) {
			case 'prisma':
				commands.push('npx prisma db push');
				commands.push('npx prisma generate');
				break;
			case 'drizzle':
				commands.push('npm run db:migrate');
				commands.push('npm run db:push');
				break;
			case 'typeorm':
				commands.push('npm run typeorm:migrate');
				break;
			case 'sequelize':
				commands.push('npx sequelize-cli db:migrate');
				break;
			case 'knex':
				commands.push('npx knex migrate:latest');
				break;
		}
		
		if (migrationData.action === 'seed') {
			commands.push('npm run db:seed');
		}
		
		if (migrationData.norwegian || migrationData.dataCompliance) {
			commands.push('npm run compliance:check');
		}

		return commands;
	}

	private getNextSteps(migrationData: any): string[] {
		const steps = [
			'Review the generated migration file carefully',
			'Test the migration in a development environment first',
		];

		if (migrationData.rollback) {
			steps.push('Verify the rollback migration works correctly');
		}

		if (migrationData.action === 'create') {
			steps.push('Update your models/entities to match the new table structure');
			steps.push('Generate or update TypeScript types');
		}

		if (migrationData.action === 'alter') {
			steps.push('Update application code that uses the modified table');
			steps.push('Check for breaking changes in existing queries');
		}

		if (migrationData.action === 'seed') {
			steps.push('Customize the seed data for your specific needs');
			steps.push('Consider data privacy when seeding production-like data');
		}

		if (migrationData.norwegian) {
			steps.push('Review Norwegian data retention requirements');
			steps.push('Ensure compliance with UU regulations for accessibility');
		}

		if (migrationData.dataCompliance) {
			steps.push('Review GDPR compliance features');
			steps.push('Set up data deletion and anonymization processes');
		}

		steps.push('Update database documentation');
		steps.push('Plan deployment strategy for production migration');

		return steps;
	}
}
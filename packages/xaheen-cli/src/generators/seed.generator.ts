/**
 * Seed Generator - Database seed data generation
 *
 * Generates realistic seed data with Norwegian examples and GDPR compliance
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
Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));

export interface SeedGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly orm?: 'prisma' | 'drizzle' | 'typeorm' | 'sequelize' | 'knex';
	readonly tables?: string[];
	readonly dataType?: 'realistic' | 'testing' | 'demo' | 'minimal';
	readonly recordCount?: number;
	readonly locale?: 'norwegian' | 'english' | 'mixed';
	readonly relationships?: boolean;
	readonly gdprCompliant?: boolean;
	readonly anonymized?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export interface SeedTable {
	readonly name: string;
	readonly recordCount: number;
	readonly fields: SeedField[];
	readonly relationships: SeedRelationship[];
}

export interface SeedField {
	readonly name: string;
	readonly type: 'string' | 'email' | 'phone' | 'name' | 'address' | 'company' | 'date' | 'number' | 'boolean' | 'enum';
	readonly format?: string;
	readonly nullable: boolean;
	readonly unique: boolean;
}

export interface SeedRelationship {
	readonly targetTable: string;
	readonly type: 'oneToOne' | 'oneToMany' | 'manyToMany';
	readonly foreignKey: string;
}

export class SeedGenerator extends BaseGenerator<SeedGeneratorOptions> {
	private readonly dataTypes = [
		{
			value: 'realistic',
			label: 'Realistic Data',
			hint: 'Real-looking data for development and staging',
		},
		{
			value: 'testing',
			label: 'Testing Data',
			hint: 'Structured data for automated testing',
		},
		{
			value: 'demo',
			label: 'Demo Data',
			hint: 'Polished data for demonstrations',
		},
		{
			value: 'minimal',
			label: 'Minimal Data',
			hint: 'Just enough data to test functionality',
		},
	];

	private readonly locales = [
		{
			value: 'norwegian',
			label: 'Norwegian',
			hint: 'Norwegian names, addresses, and companies',
		},
		{
			value: 'english',
			label: 'English',
			hint: 'English/International data',
		},
		{
			value: 'mixed',
			label: 'Mixed',
			hint: 'Combination of Norwegian and international data',
		},
	];

	private readonly ormSupport = [
		{
			value: 'prisma',
			label: 'Prisma',
			hint: 'Prisma ORM seed scripts',
		},
		{
			value: 'drizzle',
			label: 'Drizzle ORM',
			hint: 'Drizzle ORM seed scripts',
		},
		{
			value: 'typeorm',
			label: 'TypeORM',
			hint: 'TypeORM seed scripts',
		},
		{
			value: 'sequelize',
			label: 'Sequelize',
			hint: 'Sequelize seed scripts',
		},
		{
			value: 'knex',
			label: 'Knex.js',
			hint: 'Knex.js seed scripts',
		},
	];

	// Norwegian sample data
	private readonly norwegianData = {
		firstNames: [
			'Ola', 'Kari', 'Lars', 'Anne', 'Erik', 'Ingrid', 'Hans', 'Astrid',
			'Magnus', 'Solveig', 'Bjørn', 'Marit', 'Nils', 'Ragnhild', 'Torgeir',
			'Grete', 'Odd', 'Gunvor', 'Sven', 'Liv', 'Olav', 'Sigrid', 'Kjell'
		],
		lastNames: [
			'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen',
			'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen',
			'Eriksen', 'Berg', 'Haugen', 'Hagen', 'Johannessen', 'Danielsen'
		],
		cities: [
			'Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Kristiansand', 'Fredrikstad',
			'Sandnes', 'Tromsø', 'Sarpsborg', 'Skien', 'Ålesund', 'Sandefjord',
			'Haugesund', 'Tønsberg', 'Moss', 'Drammen', 'Bodø', 'Arendal'
		],
		companies: [
			'Equinor ASA', 'DNB ASA', 'Telenor ASA', 'Norsk Hydro ASA', 'Orkla ASA',
			'Schibsted ASA', 'Yara International ASA', 'Storebrand ASA', 'Aker Solutions ASA',
			'Norwegian Air Shuttle ASA', 'Subsea 7 SA', 'Kongsberg Gruppen ASA'
		],
		addresses: [
			'Karl Johans gate', 'Storgata', 'Kirkegata', 'Skolegata', 'Postboks',
			'Torgvegen', 'Havnegata', 'Fjellveien', 'Skogveien', 'Parkveien'
		],
		postalCodes: [
			'0150', '0151', '0152', '0153', '0154', '0155', '0156', '0157', '0158', '0159',
			'5003', '5004', '5005', '5006', '5007', '5008', '5009', '5010', '5011', '5012',
			'7030', '7031', '7032', '7033', '7034', '7035', '7036', '7037', '7038', '7039'
		],
		departments: [
			'IT-avdelingen', 'Økonomiavdelingen', 'Personalavdelingen', 'Salgsavdelingen',
			'Markedsavdelingen', 'Utviklingsavdelingen', 'Driftsavdelingen', 'Kundeservice'
		],
		products: [
			'Lefse', 'Brunost', 'Fårikål', 'Rakfisk', 'Kjøttkaker', 'Reindyrsteik',
			'Krumkake', 'Rosetter', 'Fattigmann', 'Berlinerboller', 'Skillingsboller'
		]
	};

	getGeneratorType(): string {
		return 'seed';
	}

	async generate(options: SeedGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating seed data: ${chalk.cyan(options.name)}`);

		// Detect ORM if not specified
		const orm = options.orm || await this.detectORM();

		// Interactive prompts for missing options
		const seedOptions = await this.promptForMissingSeedOptions(options, orm);

		// Generate seed data
		const naming = this.getNamingConvention(options.name);
		const seedData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			orm,
			tables: await this.parseTables(seedOptions.tables || []),
			dataType: seedOptions.dataType || 'realistic',
			recordCount: seedOptions.recordCount || 10,
			locale: seedOptions.locale || 'norwegian',
			relationships: seedOptions.relationships !== false,
			gdprCompliant: seedOptions.gdprCompliant !== false,
			anonymized: seedOptions.anonymized || false,
			typescript: options.typescript !== false,
			generatedData: {},
			...naming,
		};

		// Generate sample data for each table
		for (const table of seedData.tables) {
			seedData.generatedData[table.name] = this.generateTableData(table, seedData);
		}

		const generatedFiles: string[] = [];

		// Generate main seed file
		const seedFile = await this.generateSeedFile(seedData, options);
		if (seedFile) generatedFiles.push(seedFile);

		// Generate individual table seed files for large datasets
		if (seedData.recordCount > 100) {
			for (const table of seedData.tables) {
				const tableFile = await this.generateTableSeedFile(seedData, table, options);
				if (tableFile) generatedFiles.push(tableFile);
			}
		}

		// Generate seed utilities
		const utilsFile = await this.generateSeedUtils(seedData, options);
		if (utilsFile) generatedFiles.push(utilsFile);

		// Generate GDPR compliance data if enabled
		if (seedData.gdprCompliant) {
			const gdprFile = await this.generateGDPRCompliantData(seedData, options);
			if (gdprFile) generatedFiles.push(gdprFile);
		}

		// Generate seed documentation
		const docsFile = await this.generateSeedDocs(seedData, options);
		if (docsFile) generatedFiles.push(docsFile);

		this.logger.success(`Seed data ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Seed data ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(seedData),
			nextSteps: this.getNextSteps(seedData),
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

	private async promptForMissingSeedOptions(
		options: SeedGeneratorOptions,
		orm: string
	): Promise<SeedGeneratorOptions> {
		const result = { ...options, orm };

		// Data type selection
		if (!result.dataType) {
			const dataType = await select({
				message: 'What type of seed data would you like to generate?',
				options: this.dataTypes,
			});

			if (!isCancel(dataType)) {
				result.dataType = dataType as any;
			}
		}

		// Locale selection
		if (!result.locale) {
			const locale = await select({
				message: 'Which locale for sample data?',
				options: this.locales,
			});

			if (!isCancel(locale)) {
				result.locale = locale as any;
			}
		}

		// Record count
		if (!result.recordCount) {
			const recordCount = await text({
				message: 'How many records per table?',
				placeholder: '10',
				defaultValue: '10',
				validate: (value) => {
					const num = parseInt(value);
					if (isNaN(num) || num < 1) return 'Must be a positive number';
					if (num > 10000) return 'Maximum 10,000 records for performance';
					return undefined;
				},
			});

			if (!isCancel(recordCount)) {
				result.recordCount = parseInt(recordCount as string);
			}
		}

		// Tables to seed
		if (!result.tables) {
			const tablesInput = await text({
				message: 'Tables to seed (comma-separated):',
				placeholder: 'users,products,orders',
			});

			if (!isCancel(tablesInput) && tablesInput) {
				result.tables = (tablesInput as string).split(',').map(t => t.trim());
			}
		}

		// GDPR compliance
		if (result.gdprCompliant === undefined) {
			const gdpr = await confirm({
				message: 'Make seed data GDPR compliant (anonymized)?',
			});

			if (!isCancel(gdpr)) {
				result.gdprCompliant = gdpr as boolean;
			}
		}

		// Relationships
		if (result.relationships === undefined) {
			const relationships = await confirm({
				message: 'Generate relational data between tables?',
			});

			if (!isCancel(relationships)) {
				result.relationships = relationships as boolean;
			}
		}

		return result;
	}

	private async parseTables(tablesInput: string[]): Promise<SeedTable[]> {
		return tablesInput.map(tableName => ({
			name: tableName,
			recordCount: 10, // Default
			fields: this.inferTableFields(tableName),
			relationships: this.inferTableRelationships(tableName),
		}));
	}

	private inferTableFields(tableName: string): SeedField[] {
		const commonFields = [
			{ name: 'id', type: 'number' as const, nullable: false, unique: true },
			{ name: 'created_at', type: 'date' as const, nullable: false, unique: false },
			{ name: 'updated_at', type: 'date' as const, nullable: false, unique: false },
		];

		const tableSpecificFields: Record<string, SeedField[]> = {
			users: [
				{ name: 'email', type: 'email', nullable: false, unique: true },
				{ name: 'first_name', type: 'name', nullable: false, unique: false },
				{ name: 'last_name', type: 'name', nullable: false, unique: false },
				{ name: 'phone', type: 'phone', nullable: true, unique: false },
				{ name: 'address', type: 'address', nullable: true, unique: false },
				{ name: 'city', type: 'string', nullable: true, unique: false },
				{ name: 'postal_code', type: 'string', nullable: true, unique: false },
			],
			products: [
				{ name: 'name', type: 'string', nullable: false, unique: false },
				{ name: 'description', type: 'string', nullable: true, unique: false },
				{ name: 'price', type: 'number', nullable: false, unique: false },
				{ name: 'category', type: 'string', nullable: true, unique: false },
				{ name: 'in_stock', type: 'boolean', nullable: false, unique: false },
			],
			companies: [
				{ name: 'name', type: 'company', nullable: false, unique: false },
				{ name: 'org_number', type: 'string', nullable: true, unique: true },
				{ name: 'address', type: 'address', nullable: true, unique: false },
				{ name: 'city', type: 'string', nullable: true, unique: false },
				{ name: 'phone', type: 'phone', nullable: true, unique: false },
				{ name: 'email', type: 'email', nullable: true, unique: false },
			],
			orders: [
				{ name: 'user_id', type: 'number', nullable: false, unique: false },
				{ name: 'total_amount', type: 'number', nullable: false, unique: false },
				{ name: 'status', type: 'enum', format: 'pending,processing,shipped,delivered,cancelled', nullable: false, unique: false },
				{ name: 'order_date', type: 'date', nullable: false, unique: false },
			],
		};

		return [...commonFields, ...(tableSpecificFields[tableName] || [
			{ name: 'name', type: 'string' as const, nullable: false, unique: false },
		])];
	}

	private inferTableRelationships(tableName: string): SeedRelationship[] {
		const relationships: Record<string, SeedRelationship[]> = {
			orders: [
				{ targetTable: 'users', type: 'oneToMany', foreignKey: 'user_id' },
			],
			order_items: [
				{ targetTable: 'orders', type: 'oneToMany', foreignKey: 'order_id' },
				{ targetTable: 'products', type: 'oneToMany', foreignKey: 'product_id' },
			],
		};

		return relationships[tableName] || [];
	}

	private generateTableData(table: SeedTable, seedConfig: any): any[] {
		const data = [];
		
		for (let i = 1; i <= (table.recordCount || seedConfig.recordCount); i++) {
			const record: any = {};
			
			for (const field of table.fields) {
				record[field.name] = this.generateFieldValue(field, seedConfig.locale, i);
			}
			
			data.push(record);
		}
		
		return data;
	}

	private generateFieldValue(field: SeedField, locale: string, index: number): any {
		if (field.nullable && Math.random() < 0.1) {
			return null;
		}

		switch (field.type) {
			case 'number':
				return field.name === 'id' ? index : Math.floor(Math.random() * 1000) + 1;
				
			case 'string':
				return this.generateStringValue(field.name, locale, index);
				
			case 'email':
				const name = this.generateName(locale, index);
				return `${name.toLowerCase().replace(' ', '.')}@example.no`;
				
			case 'phone':
				return locale === 'norwegian' ? 
					`${Math.floor(Math.random() * 90000000) + 10000000}` :
					`+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
				
			case 'name':
				return this.generateName(locale, index);
				
			case 'address':
				return this.generateAddress(locale, index);
				
			case 'company':
				return this.generateCompanyName(locale, index);
				
			case 'date':
				const now = new Date();
				const randomDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
				return randomDate.toISOString();
				
			case 'boolean':
				return Math.random() < 0.5;
				
			case 'enum':
				if (field.format) {
					const options = field.format.split(',');
					return options[Math.floor(Math.random() * options.length)];
				}
				return 'default';
				
			default:
				return `${field.name}_${index}`;
		}
	}

	private generateName(locale: string, index: number): string {
		if (locale === 'norwegian' || locale === 'mixed') {
			const firstName = this.norwegianData.firstNames[index % this.norwegianData.firstNames.length];
			const lastName = this.norwegianData.lastNames[index % this.norwegianData.lastNames.length];
			return `${firstName} ${lastName}`;
		}
		
		const englishFirstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
		const englishLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
		
		const firstName = englishFirstNames[index % englishFirstNames.length];
		const lastName = englishLastNames[index % englishLastNames.length];
		return `${firstName} ${lastName}`;
	}

	private generateAddress(locale: string, index: number): string {
		if (locale === 'norwegian' || locale === 'mixed') {
			const street = this.norwegianData.addresses[index % this.norwegianData.addresses.length];
			const number = Math.floor(Math.random() * 200) + 1;
			return `${street} ${number}`;
		}
		
		const streets = ['Main St', 'Oak Ave', 'First St', 'Second St', 'Park Ave'];
		const street = streets[index % streets.length];
		const number = Math.floor(Math.random() * 9999) + 1;
		return `${number} ${street}`;
	}

	private generateCompanyName(locale: string, index: number): string {
		if (locale === 'norwegian' || locale === 'mixed') {
			return this.norwegianData.companies[index % this.norwegianData.companies.length];
		}
		
		const companies = ['Tech Corp', 'Global Industries', 'Future Systems', 'Digital Solutions', 'Innovation Labs'];
		return companies[index % companies.length];
	}

	private generateStringValue(fieldName: string, locale: string, index: number): string {
		const mappings: Record<string, () => string> = {
			category: () => locale === 'norwegian' ? 
				['Elektronikk', 'Klær', 'Hjem', 'Sport', 'Bøker'][index % 5] :
				['Electronics', 'Clothing', 'Home', 'Sports', 'Books'][index % 5],
			city: () => locale === 'norwegian' ? 
				this.norwegianData.cities[index % this.norwegianData.cities.length] :
				['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index % 5],
			postal_code: () => locale === 'norwegian' ? 
				this.norwegianData.postalCodes[index % this.norwegianData.postalCodes.length] :
				String(Math.floor(Math.random() * 90000) + 10000),
			status: () => ['active', 'inactive', 'pending'][index % 3],
			name: () => this.generateName(locale, index),
		};

		return mappings[fieldName] ? mappings[fieldName]() : `${fieldName}_${index}`;
	}

	private async generateSeedFile(seedData: any, options: SeedGeneratorOptions): Promise<string | null> {
		const templateName = this.getSeedTemplate(seedData.orm);
		const filePath = this.getSeedFilePath(seedData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				seedData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate seed file: ${error}`);
			return null;
		}
	}

	private async generateTableSeedFile(seedData: any, table: SeedTable, options: SeedGeneratorOptions): Promise<string | null> {
		const templateName = `seed/${seedData.orm}/table-seed.hbs`;
		const filePath = path.join(process.cwd(), 'seeds', 'tables', `${table.name}.${seedData.typescript ? 'ts' : 'js'}`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				{ ...seedData, currentTable: table, currentTableData: seedData.generatedData[table.name] },
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate table seed file for ${table.name}: ${error}`);
			return null;
		}
	}

	private async generateSeedUtils(seedData: any, options: SeedGeneratorOptions): Promise<string | null> {
		const templateName = 'seed/seed-utils.hbs';
		const filePath = path.join(process.cwd(), 'seeds', `utils.${seedData.typescript ? 'ts' : 'js'}`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				seedData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate seed utils: ${error}`);
			return null;
		}
	}

	private async generateGDPRCompliantData(seedData: any, options: SeedGeneratorOptions): Promise<string | null> {
		const templateName = 'seed/gdpr-compliant-data.hbs';
		const filePath = path.join(process.cwd(), 'seeds', `gdpr-data.${seedData.typescript ? 'ts' : 'js'}`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				seedData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate GDPR compliant data: ${error}`);
			return null;
		}
	}

	private async generateSeedDocs(seedData: any, options: SeedGeneratorOptions): Promise<string | null> {
		const templateName = 'seed/seed-docs.hbs';
		const filePath = path.join(process.cwd(), 'docs', 'seeds', `${seedData.fileName}.md`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				seedData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate seed documentation: ${error}`);
			return null;
		}
	}

	private getSeedTemplate(orm: string): string {
		const templates = {
			prisma: 'seed/prisma/seed.hbs',
			drizzle: 'seed/drizzle/seed.hbs',
			typeorm: 'seed/typeorm/seed.hbs',
			sequelize: 'seed/sequelize/seed.hbs',
			knex: 'seed/knex/seed.hbs',
		};

		return templates[orm as keyof typeof templates] || 'seed/generic-seed.hbs';
	}

	private getSeedFilePath(seedData: any): string {
		const extension = seedData.typescript ? 'ts' : 'js';
		
		const paths = {
			prisma: path.join(process.cwd(), 'prisma', 'seed.ts'),
			drizzle: path.join(process.cwd(), 'drizzle', 'seed.ts'),
			typeorm: path.join(process.cwd(), 'src', 'seeds', `${seedData.fileName}.ts`),
			sequelize: path.join(process.cwd(), 'seeders', `${seedData.fileName}.js`),
			knex: path.join(process.cwd(), 'seeds', `${seedData.fileName}.${extension}`),
		};

		return paths[seedData.orm as keyof typeof paths] || 
			path.join(process.cwd(), 'seeds', `${seedData.fileName}.${extension}`);
	}

	private getRecommendedCommands(seedData: any): string[] {
		const commands = [];
		
		switch (seedData.orm) {
			case 'prisma':
				commands.push('npx prisma db seed');
				break;
			case 'drizzle':
				commands.push('npm run db:seed');
				break;
			case 'typeorm':
				commands.push('npm run seed:run');
				break;
			case 'sequelize':
				commands.push('npx sequelize-cli db:seed:all');
				break;
			case 'knex':
				commands.push('npx knex seed:run');
				break;
		}
		
		commands.push('npm run db:reset'); // Reset and re-seed
		
		if (seedData.gdprCompliant) {
			commands.push('npm run data:anonymize');
		}

		return commands;
	}

	private getNextSteps(seedData: any): string[] {
		const steps = [
			'Review the generated seed data for accuracy',
			'Customize the sample data for your specific domain',
		];

		if (seedData.recordCount > 1000) {
			steps.push('Consider using the individual table seed files for better performance');
		}

		if (seedData.relationships) {
			steps.push('Verify that foreign key relationships are properly maintained');
		}

		if (seedData.locale === 'norwegian') {
			steps.push('Review Norwegian-specific data for cultural accuracy');
			steps.push('Ensure compliance with Norwegian data protection laws');
		}

		if (seedData.gdprCompliant) {
			steps.push('Implement data anonymization for production environments');
			steps.push('Set up automated data retention and deletion processes');
		}

		steps.push('Test the seed data in different environments');
		steps.push('Create seed data variants for different testing scenarios');
		steps.push('Document the seed data structure for your team');

		return steps;
	}
}
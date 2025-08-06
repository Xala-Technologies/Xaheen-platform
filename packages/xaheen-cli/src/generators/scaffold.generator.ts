/**
 * Scaffold Generator - Full-stack CRUD feature generation
 *
 * Generates complete features with frontend, backend, database, and tests
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

// Import other generators
import { ComponentGenerator } from "./component.generator";
import { PageGenerator } from "./page.generator";
import { ModelGenerator } from "./model.generator";
import { ServiceGenerator } from "./service.generator";
import { ControllerGenerator } from "./controller.generator";
import { MigrationGenerator } from "./migration.generator";
import { TestGenerator } from "./test.generator";

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('includes', (array, value) => array && array.includes(value));
Handlebars.registerHelper('camelCase', (str: string) => {
	return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_](.)/g, (_, char) => char.toUpperCase());
});
Handlebars.registerHelper('generatedAt', () => new Date().toISOString());

export interface ScaffoldGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly fields?: string[];
	readonly features?: string[];
	readonly frontend?: 'react' | 'vue' | 'angular' | 'nextjs';
	readonly backend?: 'nestjs' | 'express' | 'fastify';
	readonly database?: 'prisma' | 'drizzle' | 'typeorm';
	readonly styling?: 'tailwind' | 'styled-components' | 'css-modules';
	readonly auth?: boolean;
	readonly api?: boolean;
	readonly tests?: boolean;
	readonly norwegian?: boolean;
	readonly accessibility?: boolean;
	readonly typescript?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export interface ScaffoldField {
	readonly name: string;
	readonly type: string;
	readonly required: boolean;
	readonly unique: boolean;
	readonly validation?: string[];
	readonly displayName?: string;
	readonly searchable?: boolean;
	readonly sortable?: boolean;
}

export interface ScaffoldFeature {
	readonly name: string;
	readonly enabled: boolean;
	readonly config?: any;
}

export class ScaffoldGenerator extends BaseGenerator<ScaffoldGeneratorOptions> {
	private readonly availableFeatures = [
		{
			value: 'crud',
			label: 'CRUD Operations',
			hint: 'Create, Read, Update, Delete functionality',
		},
		{
			value: 'search',
			label: 'Search & Filter',
			hint: 'Search and filtering capabilities',
		},
		{
			value: 'pagination',
			label: 'Pagination',
			hint: 'Paginated data display',
		},
		{
			value: 'sorting',
			label: 'Sorting',
			hint: 'Column sorting functionality',
		},
		{
			value: 'validation',
			label: 'Form Validation',
			hint: 'Client and server-side validation',
		},
		{
			value: 'authentication',
			label: 'Authentication',
			hint: 'User authentication and authorization',
		},
		{
			value: 'audit',
			label: 'Audit Trail',
			hint: 'Track changes and user actions',
		},
		{
			value: 'export',
			label: 'Data Export',
			hint: 'Export data to CSV, Excel, PDF',
		},
		{
			value: 'import',
			label: 'Data Import',
			hint: 'Import data from files',
		},
		{
			value: 'notifications',
			label: 'Notifications',
			hint: 'Real-time notifications',
		},
		{
			value: 'comments',
			label: 'Comments System',
			hint: 'Add comments to records',
		},
		{
			value: 'attachments',
			label: 'File Attachments',
			hint: 'Upload and manage files',
		},
	];

	private readonly frontendFrameworks = [
		{
			value: 'react',
			label: 'React',
			hint: 'React with TypeScript',
		},
		{
			value: 'nextjs',
			label: 'Next.js',
			hint: 'Next.js with App Router',
		},
		{
			value: 'vue',
			label: 'Vue.js',
			hint: 'Vue 3 with Composition API',
		},
		{
			value: 'angular',
			label: 'Angular',
			hint: 'Angular with TypeScript',
		},
	];

	private readonly backendFrameworks = [
		{
			value: 'nestjs',
			label: 'NestJS',
			hint: 'Enterprise Node.js framework',
		},
		{
			value: 'express',
			label: 'Express.js',
			hint: 'Minimal Node.js framework',
		},
		{
			value: 'fastify',
			label: 'Fastify',
			hint: 'Fast Node.js framework',
		},
	];

	getGeneratorType(): string {
		return 'scaffold';
	}

	async generate(options: ScaffoldGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating scaffold: ${chalk.cyan(options.name)}`);

		// Interactive prompts for missing options
		const scaffoldOptions = await this.promptForMissingScaffoldOptions(options);

		// Generate scaffold data
		const naming = this.getNamingConvention(options.name);
		const scaffoldData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			pluralName: this.pluralize(options.name),
			fields: await this.parseFields(scaffoldOptions.fields || []),
			features: await this.parseFeatures(scaffoldOptions.features || ['crud']),
			frontend: scaffoldOptions.frontend || 'react',
			backend: scaffoldOptions.backend || 'nestjs',
			database: scaffoldOptions.database || 'prisma',
			styling: scaffoldOptions.styling || 'tailwind',
			auth: scaffoldOptions.auth !== false,
			api: scaffoldOptions.api !== false,
			tests: scaffoldOptions.tests !== false,
			norwegian: scaffoldOptions.norwegian || false,
			accessibility: scaffoldOptions.accessibility !== false,
			typescript: options.typescript !== false,
			hasFeature: (feature: string) => scaffoldOptions.features?.includes(feature) || false,
			...naming,
		};

		const generatedFiles: string[] = [];
		const executedCommands: string[] = [];
		const allNextSteps: string[] = [];

		this.logger.info('Generating database layer...');
		
		// 1. Generate Model
		const modelGenerator = new ModelGenerator();
		const modelResult = await modelGenerator.generate({
			name: scaffoldData.name,
			fields: scaffoldData.fields.map(f => `${f.name}:${f.type}${f.required ? '' : '?'}${f.unique ? '@unique' : ''}`),
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (modelResult.success) {
			generatedFiles.push(...(modelResult.files || []));
			executedCommands.push(...(modelResult.commands || []));
			allNextSteps.push(...(modelResult.nextSteps || []));
		}

		// 2. Generate Migration
		const migrationGenerator = new MigrationGenerator();
		const migrationResult = await migrationGenerator.generate({
			name: `create_${scaffoldData.snakeCase}_table`,
			orm: scaffoldData.database,
			action: 'create',
			table: scaffoldData.snakeCase,
			fields: scaffoldData.fields.map(f => `${f.name}:${f.type}${f.required ? '' : '?'}${f.unique ? '@unique' : ''}`),
			norwegian: scaffoldData.norwegian,
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (migrationResult.success) {
			generatedFiles.push(...(migrationResult.files || []));
			executedCommands.push(...(migrationResult.commands || []));
			allNextSteps.push(...(migrationResult.nextSteps || []));
		}

		this.logger.info('Generating backend layer...');

		// 3. Generate Service
		const serviceGenerator = new ServiceGenerator();
		const serviceResult = await serviceGenerator.generate({
			name: `${scaffoldData.name}Service`,
			type: 'business',
			methods: ['create', 'findAll', 'findOne', 'update', 'remove'],
			framework: scaffoldData.backend,
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (serviceResult.success) {
			generatedFiles.push(...(serviceResult.files || []));
			executedCommands.push(...(serviceResult.commands || []));
			allNextSteps.push(...(serviceResult.nextSteps || []));
		}

		// 4. Generate Controller
		const controllerGenerator = new ControllerGenerator();
		const controllerResult = await controllerGenerator.generate({
			name: `${scaffoldData.name}Controller`,
			endpoints: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id'],
			framework: scaffoldData.backend,
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (controllerResult.success) {
			generatedFiles.push(...(controllerResult.files || []));
			executedCommands.push(...(controllerResult.commands || []));
			allNextSteps.push(...(controllerResult.nextSteps || []));
		}

		this.logger.info('Generating frontend layer...');

		// 5. Generate List Component
		const listComponentGenerator = new ComponentGenerator();
		const listResult = await listComponentGenerator.generate({
			name: `${scaffoldData.className}List`,
			framework: scaffoldData.frontend,
			props: ['items', 'onEdit', 'onDelete', 'loading'],
			typescript: scaffoldData.typescript,
			tests: scaffoldData.tests,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (listResult.success) {
			generatedFiles.push(...(listResult.files || []));
		}

		// 6. Generate Form Component
		const formComponentGenerator = new ComponentGenerator();
		const formResult = await formComponentGenerator.generate({
			name: `${scaffoldData.className}Form`,
			framework: scaffoldData.frontend,
			props: ['initialData', 'onSubmit', 'loading'],
			typescript: scaffoldData.typescript,
			tests: scaffoldData.tests,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (formResult.success) {
			generatedFiles.push(...(formResult.files || []));
		}

		// 7. Generate Detail Component
		const detailComponentGenerator = new ComponentGenerator();
		const detailResult = await detailComponentGenerator.generate({
			name: `${scaffoldData.className}Detail`,
			framework: scaffoldData.frontend,
			props: ['data', 'onEdit', 'onDelete'],
			typescript: scaffoldData.typescript,
			tests: scaffoldData.tests,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (detailResult.success) {
			generatedFiles.push(...(detailResult.files || []));
		}

		// 8. Generate Pages
		const pageGenerator = new PageGenerator();
		const indexPageResult = await pageGenerator.generate({
			name: `${scaffoldData.pluralName}Index`,
			route: `/${scaffoldData.kebabCase}`,
			framework: scaffoldData.frontend,
			pageType: 'dynamic',
			features: ['seo', 'loading'],
			norwegian: scaffoldData.norwegian,
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (indexPageResult.success) {
			generatedFiles.push(...(indexPageResult.files || []));
		}

		const detailPageResult = await pageGenerator.generate({
			name: `${scaffoldData.className}Detail`,
			route: `/${scaffoldData.kebabCase}/[id]`,
			framework: scaffoldData.frontend,
			pageType: 'dynamic',
			features: ['seo', 'loading'],
			norwegian: scaffoldData.norwegian,
			typescript: scaffoldData.typescript,
			dryRun: options.dryRun,
			force: options.force,
		});
		
		if (detailPageResult.success) {
			generatedFiles.push(...(detailPageResult.files || []));
		}

		// 9. Generate Additional Files
		const additionalFiles = await this.generateScaffoldFiles(scaffoldData, options);
		generatedFiles.push(...additionalFiles);

		// 10. Generate Tests if enabled
		if (scaffoldData.tests) {
			this.logger.info('Generating tests...');
			
			const testGenerator = new TestGenerator();
			const testResult = await testGenerator.generate({
				name: `${scaffoldData.name}Suite`,
				testTypes: ['unit', 'integration'],
				framework: 'jest',
				testingLibrary: scaffoldData.frontend === 'react' ? 'react-testing-library' : 'none',
				coverage: true,
				mocks: true,
				fixtures: true,
				norwegian: scaffoldData.norwegian,
				accessibility: scaffoldData.accessibility,
				typescript: scaffoldData.typescript,
				dryRun: options.dryRun,
				force: options.force,
			});
			
			if (testResult.success) {
				generatedFiles.push(...(testResult.files || []));
				executedCommands.push(...(testResult.commands || []));
				allNextSteps.push(...(testResult.nextSteps || []));
			}
		}

		this.logger.success(`Scaffold ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Scaffold ${options.name} generated successfully`,
			files: generatedFiles,
			commands: [...new Set(executedCommands)], // Remove duplicates
			nextSteps: this.getScaffoldNextSteps(scaffoldData, allNextSteps),
		};
	}

	private async promptForMissingScaffoldOptions(options: ScaffoldGeneratorOptions): Promise<ScaffoldGeneratorOptions> {
		const result = { ...options };

		// Frontend framework selection
		if (!result.frontend) {
			const frontend = await select({
				message: 'Which frontend framework would you like to use?',
				options: this.frontendFrameworks,
			});

			if (!isCancel(frontend)) {
				result.frontend = frontend as any;
			}
		}

		// Backend framework selection
		if (!result.backend) {
			const backend = await select({
				message: 'Which backend framework would you like to use?',
				options: this.backendFrameworks,
			});

			if (!isCancel(backend)) {
				result.backend = backend as any;
			}
		}

		// Features selection
		if (!result.features) {
			const features = await multiselect({
				message: 'Select features to include:',
				options: this.availableFeatures,
				required: false,
			});

			if (!isCancel(features)) {
				result.features = features as string[];
			}
		}

		// Fields definition
		if (!result.fields) {
			result.fields = await this.promptForFields();
		}

		// Authentication
		if (result.auth === undefined) {
			const auth = await confirm({
				message: 'Include authentication?',
			});

			if (!isCancel(auth)) {
				result.auth = auth as boolean;
			}
		}

		// API generation
		if (result.api === undefined) {
			const api = await confirm({
				message: 'Generate API endpoints?',
			});

			if (!isCancel(api)) {
				result.api = api as boolean;
			}
		}

		// Tests generation
		if (result.tests === undefined) {
			const tests = await confirm({
				message: 'Generate tests?',
			});

			if (!isCancel(tests)) {
				result.tests = tests as boolean;
			}
		}

		// Norwegian compliance
		if (result.norwegian === undefined) {
			const norwegian = await confirm({
				message: 'Include Norwegian compliance features?',
			});

			if (!isCancel(norwegian)) {
				result.norwegian = norwegian as boolean;
			}
		}

		// Accessibility
		if (result.accessibility === undefined) {
			const accessibility = await confirm({
				message: 'Include accessibility features?',
			});

			if (!isCancel(accessibility)) {
				result.accessibility = accessibility as boolean;
			}
		}

		return result;
	}

	private async promptForFields(): Promise<string[]> {
		const fields: string[] = [];
		
		this.logger.info('Define your model fields (press Enter with empty name to finish):');
		
		while (true) {
			const fieldName = await text({
				message: 'Field name:',
				placeholder: 'email, name, description',
			});

			if (isCancel(fieldName) || !fieldName) {
				break;
			}

			const fieldType = await select({
				message: `Type for ${fieldName}:`,
				options: [
					{ value: 'string', label: 'String' },
					{ value: 'number', label: 'Number' },
					{ value: 'boolean', label: 'Boolean' },
					{ value: 'date', label: 'Date' },
					{ value: 'email', label: 'Email' },
					{ value: 'url', label: 'URL' },
					{ value: 'text', label: 'Text (Long)' },
					{ value: 'json', label: 'JSON' },
				],
			});

			if (isCancel(fieldType)) {
				break;
			}

			const isRequired = await confirm({
				message: `Is ${fieldName} required?`,
			});

			const isUnique = await confirm({
				message: `Is ${fieldName} unique?`,
			});

			let fieldDef = `${fieldName}:${fieldType}`;
			if (isCancel(isRequired) || !isRequired) fieldDef += '?';
			if (!isCancel(isUnique) && isUnique) fieldDef += '@unique';

			fields.push(fieldDef);
		}

		return fields;
	}

	private async parseFields(fieldsInput: string[]): Promise<ScaffoldField[]> {
		return fieldsInput.map(fieldDef => {
			const [nameAndType, ...modifiers] = fieldDef.split('@');
			const [name, type] = nameAndType.split(':');
			
			const required = !type?.endsWith('?');
			const cleanType = type?.replace('?', '') || 'string';
			const unique = modifiers.includes('unique');
			
			return {
				name,
				type: cleanType,
				required,
				unique,
				displayName: this.toDisplayName(name),
				searchable: ['string', 'email', 'text'].includes(cleanType),
				sortable: ['string', 'number', 'date'].includes(cleanType),
			};
		});
	}

	private async parseFeatures(featuresInput: string[]): Promise<ScaffoldFeature[]> {
		return featuresInput.map(feature => ({
			name: feature,
			enabled: true,
			config: this.getFeatureConfig(feature),
		}));
	}

	private getFeatureConfig(feature: string): any {
		const configs = {
			crud: { operations: ['create', 'read', 'update', 'delete'] },
			search: { fields: ['name', 'title', 'description'] },
			pagination: { pageSize: 20, showPageSizes: true },
			sorting: { defaultSort: 'created_at', direction: 'desc' },
			validation: { clientSide: true, serverSide: true },
			authentication: { roles: ['user', 'admin'], permissions: true },
			audit: { trackChanges: true, trackUsers: true },
			export: { formats: ['csv', 'excel'] },
			import: { formats: ['csv', 'excel'], validation: true },
			notifications: { realTime: true, email: false },
			comments: { nested: true, moderation: false },
			attachments: { maxSize: '10MB', allowedTypes: ['image', 'document'] },
		};

		return configs[feature as keyof typeof configs] || {};
	}

	private async generateScaffoldFiles(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate API types
		const typesFile = await this.generateApiTypes(scaffoldData, options);
		if (typesFile) files.push(typesFile);

		// Generate API client
		const apiClientFile = await this.generateApiClient(scaffoldData, options);
		if (apiClientFile) files.push(apiClientFile);

		// Generate hooks (for React)
		if (scaffoldData.frontend === 'react' || scaffoldData.frontend === 'nextjs') {
			const hooksFile = await this.generateReactHooks(scaffoldData, options);
			if (hooksFile) files.push(hooksFile);
		}

		// Generate store/state management
		const storeFile = await this.generateStateManagement(scaffoldData, options);
		if (storeFile) files.push(storeFile);

		// Generate routing
		const routingFile = await this.generateRouting(scaffoldData, options);
		if (routingFile) files.push(routingFile);

		// Generate validation schemas
		const validationFile = await this.generateValidationSchemas(scaffoldData, options);
		if (validationFile) files.push(validationFile);

		return files;
	}

	private async generateApiTypes(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = 'scaffold/api-types.hbs';
		const filePath = path.join(process.cwd(), 'src', 'types', `${scaffoldData.kebabCase}.types.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate API types: ${error}`);
			return null;
		}
	}

	private async generateApiClient(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = 'scaffold/api-client.hbs';
		const filePath = path.join(process.cwd(), 'src', 'services', `${scaffoldData.kebabCase}.service.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate API client: ${error}`);
			return null;
		}
	}

	private async generateReactHooks(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = 'scaffold/react-hooks.hbs';
		const filePath = path.join(process.cwd(), 'src', 'hooks', `use${scaffoldData.className}.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate React hooks: ${error}`);
			return null;
		}
	}

	private async generateStateManagement(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = 'scaffold/state-management.hbs';
		const filePath = path.join(process.cwd(), 'src', 'store', `${scaffoldData.kebabCase}.store.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate state management: ${error}`);
			return null;
		}
	}

	private async generateRouting(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = `scaffold/routing/${scaffoldData.frontend}-routing.hbs`;
		const filePath = path.join(process.cwd(), 'src', 'routes', `${scaffoldData.kebabCase}.routes.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate routing: ${error}`);
			return null;
		}
	}

	private async generateValidationSchemas(scaffoldData: any, options: ScaffoldGeneratorOptions): Promise<string | null> {
		const templateName = 'scaffold/validation-schemas.hbs';
		const filePath = path.join(process.cwd(), 'src', 'validation', `${scaffoldData.kebabCase}.validation.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				scaffoldData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate validation schemas: ${error}`);
			return null;
		}
	}

	private pluralize(word: string): string {
		// Simple pluralization rules
		if (word.endsWith('y')) {
			return word.slice(0, -1) + 'ies';
		}
		if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
			return word + 'es';
		}
		return word + 's';
	}

	private toDisplayName(fieldName: string): string {
		return fieldName
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, str => str.toUpperCase())
			.replace(/_/g, ' ')
			.trim();
	}

	private getScaffoldNextSteps(scaffoldData: any, allNextSteps: string[]): string[] {
		const steps = [
			`Complete scaffold for ${scaffoldData.className} generated successfully`,
			'',
			'📂 Generated Structure:',
			'   ├── Backend (API, Services, Controllers)',
			'   ├── Frontend (Components, Pages, Hooks)',
			'   ├── Database (Models, Migrations)',
			'   └── Tests (Unit, Integration)',
			'',
			'🚀 Next Steps:',
		];

		steps.push('1. Run database migrations to create tables');
		steps.push('2. Start your development servers (frontend + backend)');
		steps.push('3. Customize the generated components to match your design');
		steps.push('4. Configure authentication and authorization if enabled');
		steps.push('5. Test the CRUD operations through the UI');

		if (scaffoldData.norwegian) {
			steps.push('6. Review Norwegian compliance features');
			steps.push('7. Test with Norwegian accessibility tools');
		}

		if (scaffoldData.hasFeature('search')) {
			steps.push('8. Configure search indexing for better performance');
		}

		if (scaffoldData.hasFeature('export')) {
			steps.push('9. Set up file storage for exports');
		}

		steps.push('10. Deploy to staging environment for testing');

		// Add unique next steps from individual generators
		const uniqueSteps = [...new Set(allNextSteps)];
		if (uniqueSteps.length > 0) {
			steps.push('');
			steps.push('📋 Additional Steps from Generated Components:');
			uniqueSteps.forEach((step, index) => {
				steps.push(`   ${index + 1}. ${step}`);
			});
		}

		return steps;
	}
}
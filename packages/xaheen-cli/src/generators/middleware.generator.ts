/**
 * Middleware Generator - Express/NestJS middleware generation
 *
 * Generates middleware for request/response processing with security and performance features
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

export interface MiddlewareGeneratorOptions extends BaseGeneratorOptions {
	readonly name: string;
	readonly framework?: 'express' | 'nestjs' | 'fastify' | 'koa';
	readonly type?: 'auth' | 'cors' | 'logging' | 'validation' | 'rate-limit' | 'security' | 'custom';
	readonly features?: string[];
	readonly async?: boolean;
	readonly norwegian?: boolean;
	readonly typescript?: boolean;
	readonly tests?: boolean;
	readonly dryRun?: boolean;
	readonly force?: boolean;
}

export class MiddlewareGenerator extends BaseGenerator<MiddlewareGeneratorOptions> {
	private readonly middlewareTypes = [
		{
			value: 'auth',
			label: 'Authentication Middleware',
			hint: 'JWT/OAuth authentication and authorization',
		},
		{
			value: 'cors',
			label: 'CORS Middleware',
			hint: 'Cross-Origin Resource Sharing configuration',
		},
		{
			value: 'logging',
			label: 'Logging Middleware',
			hint: 'Request/response logging and monitoring',
		},
		{
			value: 'validation',
			label: 'Validation Middleware',
			hint: 'Request body and parameter validation',
		},
		{
			value: 'rate-limit',
			label: 'Rate Limiting Middleware',
			hint: 'API rate limiting and throttling',
		},
		{
			value: 'security',
			label: 'Security Middleware',
			hint: 'Security headers and protection',
		},
		{
			value: 'custom',
			label: 'Custom Middleware',
			hint: 'Generic middleware template',
		},
	];

	private readonly frameworks = [
		{
			value: 'express',
			label: 'Express.js',
			hint: 'Express.js middleware',
		},
		{
			value: 'nestjs',
			label: 'NestJS',
			hint: 'NestJS middleware/interceptor',
		},
		{
			value: 'fastify',
			label: 'Fastify',
			hint: 'Fastify middleware plugin',
		},
		{
			value: 'koa',
			label: 'Koa.js',
			hint: 'Koa.js middleware',
		},
	];

	private readonly availableFeatures = [
		{
			value: 'error-handling',
			label: 'Error Handling',
			hint: 'Comprehensive error handling and recovery',
		},
		{
			value: 'metrics',
			label: 'Metrics Collection',
			hint: 'Performance and usage metrics',
		},
		{
			value: 'caching',
			label: 'Response Caching',
			hint: 'Cache responses for performance',
		},
		{
			value: 'compression',
			label: 'Response Compression',
			hint: 'Gzip/Brotli compression',
		},
		{
			value: 'request-id',
			label: 'Request ID Tracking',
			hint: 'Unique request ID generation',
		},
		{
			value: 'user-agent',
			label: 'User Agent Parsing',
			hint: 'Parse and analyze user agents',
		},
		{
			value: 'ip-filtering',
			label: 'IP Filtering',
			hint: 'Block or allow specific IP addresses',
		},
		{
			value: 'body-parser',
			label: 'Body Parsing',
			hint: 'Parse request bodies (JSON, form, etc.)',
		},
		{
			value: 'norwegian-compliance',
			label: 'Norwegian Compliance',
			hint: 'UU and GDPR compliance features',
		},
	];

	getGeneratorType(): string {
		return 'middleware';
	}

	async generate(options: MiddlewareGeneratorOptions): Promise<GeneratorResult> {
		await this.validateOptions(options);

		this.logger.info(`Generating middleware: ${chalk.cyan(options.name)}`);

		// Detect framework if not specified
		const framework = options.framework || await this.detectFramework();

		// Interactive prompts for missing options
		const middlewareOptions = await this.promptForMissingMiddlewareOptions(options, framework);

		// Generate middleware data
		const naming = this.getNamingConvention(options.name);
		const middlewareData = {
			name: options.name,
			className: naming.className,
			fileName: naming.kebabCase,
			framework,
			type: middlewareOptions.type || 'custom',
			features: middlewareOptions.features || [],
			async: middlewareOptions.async !== false,
			norwegian: middlewareOptions.norwegian || false,
			typescript: options.typescript !== false,
			hasFeature: (feature: string) => middlewareOptions.features?.includes(feature) || false,
			...naming,
		};

		const generatedFiles: string[] = [];

		// Generate main middleware file
		const middlewareFile = await this.generateMiddlewareFile(middlewareData, options);
		if (middlewareFile) generatedFiles.push(middlewareFile);

		// Generate middleware configuration
		const configFile = await this.generateMiddlewareConfig(middlewareData, options);
		if (configFile) generatedFiles.push(configFile);

		// Generate middleware types/interfaces
		if (middlewareData.typescript) {
			const typesFile = await this.generateMiddlewareTypes(middlewareData, options);
			if (typesFile) generatedFiles.push(typesFile);
		}

		// Generate Norwegian compliance features
		if (middlewareData.norwegian || middlewareData.hasFeature('norwegian-compliance')) {
			const complianceFiles = await this.generateNorwegianCompliance(middlewareData, options);
			generatedFiles.push(...complianceFiles);
		}

		// Generate tests
		if (options.tests !== false) {
			const testFile = await this.generateMiddlewareTests(middlewareData, options);
			if (testFile) generatedFiles.push(testFile);
		}

		// Generate integration examples
		const exampleFile = await this.generateIntegrationExample(middlewareData, options);
		if (exampleFile) generatedFiles.push(exampleFile);

		this.logger.success(`Middleware ${chalk.green(options.name)} generated successfully!`);

		return {
			success: true,
			message: `Middleware ${options.name} generated successfully`,
			files: generatedFiles,
			commands: this.getRecommendedCommands(middlewareData),
			nextSteps: this.getNextSteps(middlewareData),
		};
	}

	private async detectFramework(): Promise<'express' | 'nestjs' | 'fastify' | 'koa'> {
		try {
			const packageJsonPath = path.join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(
				await fs.readFile(packageJsonPath, 'utf-8'),
			);
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (dependencies['@nestjs/core']) return 'nestjs';
			if (dependencies['fastify']) return 'fastify';
			if (dependencies['koa']) return 'koa';
			if (dependencies['express']) return 'express';

			// Interactive selection if no framework detected
			const selectedFramework = await select({
				message: 'Which backend framework are you using?',
				options: this.frameworks,
			});

			if (isCancel(selectedFramework)) {
				throw new Error('Framework selection cancelled');
			}

			return selectedFramework as 'express' | 'nestjs' | 'fastify' | 'koa';
		} catch {
			return 'express'; // Default fallback
		}
	}

	private async promptForMissingMiddlewareOptions(
		options: MiddlewareGeneratorOptions,
		framework: string
	): Promise<MiddlewareGeneratorOptions> {
		const result = { ...options, framework };

		// Middleware type selection
		if (!result.type) {
			const middlewareType = await select({
				message: 'What type of middleware would you like to create?',
				options: this.middlewareTypes,
			});

			if (!isCancel(middlewareType)) {
				result.type = middlewareType as any;
			}
		}

		// Features selection
		if (!result.features) {
			const features = await multiselect({
				message: 'Select middleware features:',
				options: this.availableFeatures,
				required: false,
			});

			if (!isCancel(features)) {
				result.features = features as string[];
				
				// Set convenience flags based on selected features
				result.norwegian = features.includes('norwegian-compliance');
			}
		}

		// Async confirmation
		if (result.async === undefined) {
			const async = await confirm({
				message: 'Make middleware asynchronous?',
			});

			if (!isCancel(async)) {
				result.async = async as boolean;
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

		return result;
	}

	private async generateMiddlewareFile(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string | null> {
		const templateName = this.getMiddlewareTemplate(middlewareData.framework, middlewareData.type);
		const filePath = this.getMiddlewareFilePath(middlewareData);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate middleware file: ${error}`);
			return null;
		}
	}

	private async generateMiddlewareConfig(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string | null> {
		const templateName = `middleware/config/${middlewareData.type}-config.hbs`;
		const filePath = path.join(process.cwd(), 'src', 'config', `${middlewareData.kebabCase}.config.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate middleware config: ${error}`);
			return null;
		}
	}

	private async generateMiddlewareTypes(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string | null> {
		const templateName = 'middleware/middleware-types.hbs';
		const filePath = path.join(process.cwd(), 'src', 'types', `${middlewareData.kebabCase}.types.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate middleware types: ${error}`);
			return null;
		}
	}

	private async generateNorwegianCompliance(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string[]> {
		const files: string[] = [];

		// Generate GDPR compliance middleware
		try {
			const gdprFile = await this.generateFile(
				'middleware/norwegian/gdpr-compliance.hbs',
				path.join(process.cwd(), 'src', 'middleware', 'compliance', 'gdpr.middleware.ts'),
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (gdprFile) files.push(gdprFile);
		} catch (error) {
			this.logger.warn(`Failed to generate GDPR compliance middleware: ${error}`);
		}

		// Generate UU accessibility middleware
		try {
			const uuFile = await this.generateFile(
				'middleware/norwegian/uu-accessibility.hbs',
				path.join(process.cwd(), 'src', 'middleware', 'compliance', 'uu-accessibility.middleware.ts'),
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
			if (uuFile) files.push(uuFile);
		} catch (error) {
			this.logger.warn(`Failed to generate UU accessibility middleware: ${error}`);
		}

		return files;
	}

	private async generateMiddlewareTests(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string | null> {
		const templateName = `middleware/test/${middlewareData.framework}-test.hbs`;
		const filePath = path.join(process.cwd(), 'src', '__tests__', 'middleware', `${middlewareData.kebabCase}.test.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			// Fallback to generic test template
			try {
				return await this.generateFile(
					'middleware/test/generic-test.hbs',
					filePath,
					middlewareData,
					{ dryRun: options.dryRun, force: options.force }
				);
			} catch (fallbackError) {
				this.logger.warn(`Failed to generate middleware tests: ${fallbackError}`);
				return null;
			}
		}
	}

	private async generateIntegrationExample(middlewareData: any, options: MiddlewareGeneratorOptions): Promise<string | null> {
		const templateName = `middleware/examples/${middlewareData.framework}-integration.hbs`;
		const filePath = path.join(process.cwd(), 'examples', 'middleware', `${middlewareData.kebabCase}-example.ts`);
		
		try {
			return await this.generateFile(
				templateName,
				filePath,
				middlewareData,
				{ dryRun: options.dryRun, force: options.force }
			);
		} catch (error) {
			this.logger.warn(`Failed to generate integration example: ${error}`);
			return null;
		}
	}

	private getMiddlewareTemplate(framework: string, type: string): string {
		const templates = {
			express: {
				auth: 'middleware/express/auth-middleware.hbs',
				cors: 'middleware/express/cors-middleware.hbs',
				logging: 'middleware/express/logging-middleware.hbs',
				validation: 'middleware/express/validation-middleware.hbs',
				'rate-limit': 'middleware/express/rate-limit-middleware.hbs',
				security: 'middleware/express/security-middleware.hbs',
				custom: 'middleware/express/custom-middleware.hbs',
			},
			nestjs: {
				auth: 'middleware/nestjs/auth-middleware.hbs',
				cors: 'middleware/nestjs/cors-middleware.hbs',
				logging: 'middleware/nestjs/logging-middleware.hbs',
				validation: 'middleware/nestjs/validation-middleware.hbs',
				'rate-limit': 'middleware/nestjs/rate-limit-middleware.hbs',
				security: 'middleware/nestjs/security-middleware.hbs',
				custom: 'middleware/nestjs/custom-middleware.hbs',
			},
			fastify: {
				auth: 'middleware/fastify/auth-plugin.hbs',
				cors: 'middleware/fastify/cors-plugin.hbs',
				logging: 'middleware/fastify/logging-plugin.hbs',
				validation: 'middleware/fastify/validation-plugin.hbs',
				'rate-limit': 'middleware/fastify/rate-limit-plugin.hbs',
				security: 'middleware/fastify/security-plugin.hbs',
				custom: 'middleware/fastify/custom-plugin.hbs',
			},
			koa: {
				auth: 'middleware/koa/auth-middleware.hbs',
				cors: 'middleware/koa/cors-middleware.hbs',
				logging: 'middleware/koa/logging-middleware.hbs',
				validation: 'middleware/koa/validation-middleware.hbs',
				'rate-limit': 'middleware/koa/rate-limit-middleware.hbs',
				security: 'middleware/koa/security-middleware.hbs',
				custom: 'middleware/koa/custom-middleware.hbs',
			},
		};

		return templates[framework as keyof typeof templates]?.[type as keyof typeof templates.express] 
			|| 'middleware/generic-middleware.hbs';
	}

	private getMiddlewareFilePath(middlewareData: any): string {
		const extension = middlewareData.typescript ? 'ts' : 'js';
		const frameworks = {
			express: path.join(process.cwd(), 'src', 'middleware', `${middlewareData.kebabCase}.middleware.${extension}`),
			nestjs: path.join(process.cwd(), 'src', 'middleware', `${middlewareData.kebabCase}.middleware.${extension}`),
			fastify: path.join(process.cwd(), 'src', 'plugins', `${middlewareData.kebabCase}.plugin.${extension}`),
			koa: path.join(process.cwd(), 'src', 'middleware', `${middlewareData.kebabCase}.middleware.${extension}`),
		};

		return frameworks[middlewareData.framework as keyof typeof frameworks] || 
			path.join(process.cwd(), 'src', 'middleware', `${middlewareData.kebabCase}.middleware.${extension}`);
	}

	private getRecommendedCommands(middlewareData: any): string[] {
		const commands = ['npm run type-check'];
		
		if (middlewareData.framework === 'nestjs') {
			commands.push('npm run build');
		}
		
		if (middlewareData.hasFeature('error-handling')) {
			commands.push('npm run test:error-handling');
		}
		
		if (middlewareData.hasFeature('metrics')) {
			commands.push('npm run metrics:test');
		}
		
		if (middlewareData.norwegian) {
			commands.push('npm run compliance:validate');
		}

		return commands;
	}

	private getNextSteps(middlewareData: any): string[] {
		const steps = [
			`Register the ${middlewareData.className} middleware in your application`,
			'Configure middleware options and environment variables',
		];

		if (middlewareData.type === 'auth') {
			steps.push('Configure JWT secrets and authentication providers');
			steps.push('Set up user authentication routes');
		}

		if (middlewareData.type === 'cors') {
			steps.push('Configure allowed origins and CORS policies');
		}

		if (middlewareData.type === 'rate-limit') {
			steps.push('Configure rate limiting thresholds and storage');
			steps.push('Set up Redis or in-memory storage for rate limiting');
		}

		if (middlewareData.type === 'validation') {
			steps.push('Define validation schemas for your routes');
		}

		if (middlewareData.hasFeature('metrics')) {
			steps.push('Set up metrics collection and monitoring dashboards');
		}

		if (middlewareData.hasFeature('caching')) {
			steps.push('Configure cache storage and invalidation strategies');
		}

		if (middlewareData.norwegian) {
			steps.push('Review Norwegian compliance requirements');
			steps.push('Test with Norwegian privacy and accessibility tools');
		}

		steps.push('Test the middleware thoroughly with your API endpoints');
		steps.push('Monitor middleware performance in production');

		return steps;
	}
}
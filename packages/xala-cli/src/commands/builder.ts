/**
 * @fileoverview Interactive Full-Stack Tech Builder Command
 * @description EPIC 12: Interactive Full-Stack Tech Builder CLI Commands
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import ora from 'ora';
import inquirer from 'inquirer';

import { registerCommand, CommandMetadata } from './index.js';
import { interactiveBuilder } from '../services/interactive-builder.js';
import { projectGenerator } from '../services/project-generator.js';
import { configLoader } from '../services/config-loader.js';
import { compatibilityChecker } from '../services/compatibility-checker.js';
import {
	BuilderCommandOptions,
	PresetGeneratorOptions,
	BundleGeneratorOptions,
	StackConfiguration,
	BuilderError
} from '../services/builder-types.js';
import { logger } from '../utils/logger.js';

/**
 * Main interactive builder command
 */
async function builderCommand(options: BuilderCommandOptions = {}): Promise<void> {
	try {
		console.log(chalk.cyan.bold('🚀 Welcome to Xaheen Interactive Tech Builder!\n'));

		// Start interactive builder
		const stack = await interactiveBuilder.startInteractiveBuilder();

		// Get target directory
		const targetPath = await getTargetPath(stack.projectName, options.output);

		// Check if directory exists and handle conflicts
		if (existsSync(targetPath) && !options.force) {
			const overwrite = await confirmOverwrite(targetPath);
			if (!overwrite) {
				console.log(chalk.yellow('Operation cancelled.'));
				return;
			}
		}

		// Show generation preview if not in interactive mode
		if (!options.interactive) {
			await showGenerationPreview(stack, targetPath);
			
			const proceed = await confirmGeneration();
			if (!proceed) {
				console.log(chalk.yellow('Generation cancelled.'));
				return;
			}
		}

		// Generate project
		const spinner = ora('Generating your full-stack application...').start();
		
		const generationResult = await projectGenerator.generateProject(stack, targetPath, {
			dryRun: options.dryRun,
			skipInstall: options.dryRun,
			verbose: options.verbose
		});

		if (generationResult.success) {
			spinner.succeed('Project generated successfully!');
			
			// Show success summary
			showSuccessSummary(stack, targetPath, generationResult);
			
			// Show next steps
			showNextSteps(stack, targetPath);
		} else {
			spinner.fail('Project generation failed');
			console.error(chalk.red('\n❌ Generation failed with errors:'));
			generationResult.errors.forEach(error => {
				console.error(chalk.red(`   • ${error}`));
			});
			
			if (generationResult.warnings.length > 0) {
				console.warn(chalk.yellow('\n⚠️  Warnings:'));
				generationResult.warnings.forEach(warning => {
					console.warn(chalk.yellow(`   • ${warning}`));
				});
			}
		}

	} catch (error) {
		logger.error('Builder command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

/**
 * Generate project from preset command
 */
async function generatePresetCommand(presetId: string, options: PresetGeneratorOptions): Promise<void> {
	try {
		console.log(chalk.cyan.bold(`📦 Generating project from preset: ${presetId}\n`));

		// Load preset
		const preset = await configLoader.getQuickPreset(presetId);
		if (!preset) {
			throw new BuilderError(`Preset "${presetId}" not found`, 'PRESET_NOT_FOUND');
		}

		// Apply customizations if provided
		let stack = preset.stack;
		if (options.projectName) {
			stack = { ...stack, projectName: options.projectName };
		}
		if (options.customizations) {
			stack = { ...stack, ...options.customizations };
		}

		// Get target directory
		const targetPath = await getTargetPath(stack.projectName, options.output);

		// Show preset info
		console.log(chalk.blue('📋 Preset Information:'));
		console.log(`   Name: ${preset.name}`);
		console.log(`   Description: ${preset.description}`);
		console.log(`   Project Type: ${preset.projectType}`);

		// Show stack summary
		console.log(chalk.blue('\n🔧 Stack Configuration:'));
		showStackSummary(stack);

		// Confirm generation
		if (!options.force) {
			const proceed = await confirmGeneration();
			if (!proceed) {
				console.log(chalk.yellow('Generation cancelled.'));
				return;
			}
		}

		// Generate project
		const generationResult = await projectGenerator.generateFromPreset(
			presetId, 
			targetPath,
			options.customizations
		);

		if (generationResult.success) {
			console.log(chalk.green('\n✅ Project generated successfully!'));
			showSuccessSummary(stack, targetPath, generationResult);
			showNextSteps(stack, targetPath);
		} else {
			console.error(chalk.red('\n❌ Generation failed'));
			generationResult.errors.forEach(error => {
				console.error(chalk.red(`   • ${error}`));
			});
		}

	} catch (error) {
		logger.error('Generate preset command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

/**
 * Generate project from bundle command
 */
async function generateBundleCommand(bundleId: string, options: BundleGeneratorOptions): Promise<void> {
	try {
		console.log(chalk.cyan.bold(`📦 Generating project from bundle: ${bundleId}\n`));

		// Bundles are pre-configured stacks for specific use cases
		const bundle = await getBundleConfiguration(bundleId);
		if (!bundle) {
			throw new BuilderError(`Bundle "${bundleId}" not found`, 'BUNDLE_NOT_FOUND');
		}

		console.log(chalk.blue('📋 Bundle Information:'));
		console.log(`   Name: ${bundle.name}`);
		console.log(`   Description: ${bundle.description}`);
		console.log(`   Category: ${bundle.category}`);
		
		if (bundle.features.length > 0) {
			console.log(`   Features: ${bundle.features.join(', ')}`);
		}

		// Show stack configuration
		console.log(chalk.blue('\n🔧 Stack Configuration:'));
		showStackSummary(bundle.stack);

		// Get target directory
		const targetPath = await getTargetPath(bundle.stack.projectName, options.output);

		// Confirm generation
		if (!options.force) {
			const proceed = await confirmGeneration();
			if (!proceed) {
				console.log(chalk.yellow('Generation cancelled.'));
				return;
			}
		}

		// Generate project
		const generationResult = await projectGenerator.generateProject(bundle.stack, targetPath, {
			dryRun: options.dryRun,
			skipInstall: options.dryRun,
			verbose: options.verbose
		});

		if (generationResult.success) {
			console.log(chalk.green('\n✅ Bundle generated successfully!'));
			showSuccessSummary(bundle.stack, targetPath, generationResult);
			showNextSteps(bundle.stack, targetPath);
		} else {
			console.error(chalk.red('\n❌ Bundle generation failed'));
			generationResult.errors.forEach(error => {
				console.error(chalk.red(`   • ${error}`));
			});
		}

	} catch (error) {
		logger.error('Generate bundle command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

/**
 * List available presets command
 */
async function listPresetsCommand(): Promise<void> {
	try {
		const config = await configLoader.loadConfiguration();
		
		console.log(chalk.cyan.bold('📦 Available Quick-Start Presets\n'));

		// Group presets by project type
		const presetsByType: Record<string, typeof config.quickPresets[0][]> = {};
		
		for (const preset of config.quickPresets) {
			if (!presetsByType[preset.projectType]) {
				presetsByType[preset.projectType] = [];
			}
			presetsByType[preset.projectType]!.push(preset);
		}

		for (const [projectType, presets] of Object.entries(presetsByType)) {
			const projectTypeInfo = config.projectTypes.find(pt => pt.id === projectType);
			const projectTypeName = projectTypeInfo?.name || projectType;
			
			console.log(chalk.blue.bold(`\n${projectTypeName}:`));
			
			for (const preset of presets) {
				console.log(`  ${chalk.green('•')} ${chalk.white.bold(preset.name)}`);
				console.log(`    ${chalk.gray(preset.description)}`);
				console.log(`    ${chalk.cyan(`Command: xala builder preset ${preset.id}`)}`);
			}
		}

		console.log(chalk.yellow('\n💡 Use "xala builder preset <preset-id>" to generate a project'));

	} catch (error) {
		logger.error('List presets command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

/**
 * List available bundles command
 */
async function listBundlesCommand(): Promise<void> {
	try {
		const bundles = await getAllBundles();
		
		console.log(chalk.cyan.bold('🎁 Available Tech Bundles\n'));

		// Group bundles by category
		const bundlesByCategory: Record<string, typeof bundles[0][]> = {};
		
		for (const bundle of bundles) {
			if (!bundlesByCategory[bundle.category]) {
				bundlesByCategory[bundle.category] = [];
			}
			bundlesByCategory[bundle.category]!.push(bundle);
		}

		for (const [category, categoryBundles] of Object.entries(bundlesByCategory)) {
			console.log(chalk.blue.bold(`\n${category.toUpperCase()}:`));
			
			for (const bundle of categoryBundles) {
				console.log(`  ${chalk.green('•')} ${chalk.white.bold(bundle.name)}`);
				console.log(`    ${chalk.gray(bundle.description)}`);
				if (bundle.price) {
					console.log(`    ${chalk.yellow(`Price: $${bundle.price}`)}`);
				}
				console.log(`    ${chalk.cyan(`Command: xala builder bundle ${bundle.id}`)}`);
			}
		}

		console.log(chalk.yellow('\n💡 Use "xala builder bundle <bundle-id>" to generate a project'));

	} catch (error) {
		logger.error('List bundles command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

/**
 * Validate configuration command
 */
async function validateConfigCommand(): Promise<void> {
	try {
		console.log(chalk.cyan.bold('🔍 Validating Builder Configuration\n'));

		const spinner = ora('Loading configuration...').start();
		const config = await configLoader.loadConfiguration();
		spinner.succeed('Configuration loaded');

		// Validate configuration integrity
		const validationSpinner = ora('Validating configuration integrity...').start();
		const errors = await configLoader.validateConfiguration();
		
		if (errors.length === 0) {
			validationSpinner.succeed('Configuration is valid');
			
			// Show configuration summary
			console.log(chalk.green('\n✅ Configuration Summary:'));
			console.log(`   Project Types: ${config.projectTypes.length}`);
			console.log(`   Quick Presets: ${config.quickPresets.length}`);
			console.log(`   Tech Categories: ${config.techCategories.length}`);
			console.log(`   Tech Options: ${Object.keys(config.techOptions).length} categories`);
			
		} else {
			validationSpinner.fail('Configuration validation failed');
			
			console.error(chalk.red('\n❌ Configuration Errors:'));
			errors.forEach(error => {
				console.error(chalk.red(`   • ${error}`));
			});
			
			process.exit(1);
		}

	} catch (error) {
		logger.error('Validate config command failed:', error);
		console.error(chalk.red(`❌ ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

// Helper functions

async function getTargetPath(projectName: string, outputPath?: string): Promise<string> {
	if (outputPath) {
		return resolve(outputPath);
	}
	
	const { targetDir } = await inquirer.prompt([
		{
			type: 'input',
			name: 'targetDir',
			message: '📁 Where would you like to create the project?',
			default: `./${projectName}`,
			validate: (input: string) => {
				if (!input || input.trim().length === 0) {
					return 'Please enter a valid directory path';
				}
				return true;
			}
		}
	]);

	return resolve(targetDir);
}

async function confirmOverwrite(targetPath: string): Promise<boolean> {
	const { overwrite } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'overwrite',
			message: `Directory "${targetPath}" already exists. Overwrite?`,
			default: false
		}
	]);

	return overwrite;
}

async function showGenerationPreview(stack: StackConfiguration, targetPath: string): Promise<void> {
	console.log(chalk.blue('\n📋 Generation Preview\n'));
	
	console.log(`${chalk.blue('Project Name:')} ${stack.projectName}`);
	console.log(`${chalk.blue('Target Path:')} ${targetPath}`);
	
	// Show file structure preview
	const structure = await projectGenerator.getProjectStructurePreview(stack);
	console.log(chalk.blue('\n📂 Project Structure:'));
	
	const sampleFiles = structure.slice(0, 10);
	sampleFiles.forEach(file => {
		console.log(`   ${file}`);
	});
	
	if (structure.length > 10) {
		console.log(`   ... and ${structure.length - 10} more files`);
	}
	
	showStackSummary(stack);
}

function showStackSummary(stack: StackConfiguration): void {
	console.log(chalk.blue('\n🔧 Tech Stack:'));
	
	const stackItems = [
		['Frontend', formatStackItem(stack.webFrontend)],
		['Backend', stack.backend],
		['Database', stack.database],
		['ORM', stack.orm],
		['Auth', stack.auth],
		['UI System', stack.uiSystem],
		['Package Manager', stack.packageManager]
	];

	stackItems.forEach(([label, value]) => {
		if (value && value !== 'none') {
			console.log(`   ${chalk.gray(label.padEnd(15))}: ${chalk.white(value)}`);
		}
	});
}

function showSuccessSummary(stack: StackConfiguration, targetPath: string, result: any): void {
	console.log(chalk.green('\n🎉 Generation Complete!\n'));
	
	console.log(`${chalk.blue('Project:')} ${stack.projectName}`);
	console.log(`${chalk.blue('Location:')} ${targetPath}`);
	console.log(`${chalk.blue('Files Generated:')} ${result.generatedFiles.length}`);
	console.log(`${chalk.blue('Generation Time:')} ${result.executionTime}ms`);
}

function showNextSteps(stack: StackConfiguration, targetPath: string): void {
	console.log(chalk.cyan('\n📋 Next Steps:\n'));
	
	console.log(`1. ${chalk.white('cd')} ${targetPath}`);
	
	if (!stack.install) {
		console.log(`2. ${chalk.white(`${stack.packageManager} install`)}`);
	}
	
	console.log(`${stack.install ? '2' : '3'}. ${chalk.white(`${stack.packageManager} run dev`)}`);
	
	console.log(chalk.gray('\n💡 Additional commands:'));
	console.log(`   ${chalk.gray('•')} ${chalk.white(`${stack.packageManager} run build`)} - Build for production`);
	console.log(`   ${chalk.gray('•')} ${chalk.white(`${stack.packageManager} run lint`)} - Run linting`);
	
	if (stack.orm === 'prisma') {
		console.log(`   ${chalk.gray('•')} ${chalk.white(`${stack.packageManager} run db:push`)} - Push database schema`);
	} else if (stack.orm === 'drizzle') {
		console.log(`   ${chalk.gray('•')} ${chalk.white(`${stack.packageManager} run db:generate`)} - Generate migrations`);
	}
}

async function confirmGeneration(): Promise<boolean> {
	const { proceed } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'proceed',
			message: '🚀 Generate project with this configuration?',
			default: true
		}
	]);

	return proceed;
}

function formatStackItem(item: string | readonly string[]): string {
	if (Array.isArray(item)) {
		return item.join(', ');
	}
	return item;
}

// Bundle definitions (these could be loaded from JSON files in the future)
async function getBundleConfiguration(bundleId: string) {
	const bundles = {
		'saas-starter': {
			id: 'saas-starter',
			name: 'SaaS Starter Bundle',
			description: 'Complete SaaS application with authentication, billing, and admin dashboard',
			category: 'starter',
			features: ['Multi-tenancy', 'Stripe Integration', 'Admin Dashboard', 'Role-based Access'],
			stack: {
				projectName: 'my-saas-app',
				webFrontend: ['next'],
				nativeFrontend: ['none'],
				backend: 'next-api',
				database: 'postgresql',
				orm: 'prisma',
				auth: 'clerk',
				uiSystem: 'xala',
				packageManager: 'pnpm',
				addons: ['turborepo', 'biome'],
				examples: [],
				git: true,
				install: true,
				runtime: 'node',
				api: 'trpc',
				webDeploy: 'vercel',
				payments: 'stripe',
				subscriptions: 'stripe-billing',
				rbac: 'casbin',
				multiTenancy: ['tenant-routing'],
				analytics: 'posthog',
				monitoring: 'sentry'
			} as StackConfiguration
		},
		'ecommerce-pro': {
			id: 'ecommerce-pro',
			name: 'E-commerce Professional',
			description: 'Full-featured e-commerce platform with inventory management',
			category: 'professional',
			price: 99,
			features: ['Inventory Management', 'Multi-vendor Support', 'Analytics Dashboard', 'SEO Optimization'],
			stack: {
				projectName: 'my-ecommerce-store',
				webFrontend: ['next'],
				nativeFrontend: ['none'],
				backend: 'next-api',
				database: 'postgresql',
				orm: 'drizzle',
				auth: 'better-auth',
				uiSystem: 'xala',
				packageManager: 'pnpm',
				addons: ['turborepo', 'pwa'],
				examples: [],
				git: true,
				install: true,
				runtime: 'node',
				api: 'trpc',
				webDeploy: 'vercel',
				payments: 'stripe',
				analytics: 'mixpanel',
				monitoring: 'sentry',
				search: 'algolia',
				caching: 'redis'
			} as StackConfiguration
		}
	};

	return (bundles as any)[bundleId] || null;
}

async function getAllBundles() {
	return [
		await getBundleConfiguration('saas-starter'),
		await getBundleConfiguration('ecommerce-pro')
	].filter(Boolean);
}

// Register all builder commands
export function register(registerCommandFn: (metadata: CommandMetadata) => void): void {
	// Main interactive builder command
	registerCommandFn({
		name: 'builder',
		description: 'Interactive full-stack tech builder',
		alias: 'build',
		options: [
			{
				flags: '-i, --interactive',
				description: 'Enable interactive mode'
			},
			{
				flags: '-o, --output <path>',
				description: 'Output directory path'
			},
			{
				flags: '--dry-run',
				description: 'Show what would be generated without creating files'
			},
			{
				flags: '-f, --force',
				description: 'Overwrite existing files'
			},
			{
				flags: '-v, --verbose',
				description: 'Verbose output'
			}
		],
		subcommands: [
			{
				name: 'preset <preset-id>',
				description: 'Generate project from quick-start preset',
				action: generatePresetCommand
			},
			{
				name: 'bundle <bundle-id>',
				description: 'Generate project from tech bundle',
				action: generateBundleCommand
			},
			{
				name: 'presets',
				description: 'List available presets',
				action: listPresetsCommand
			},
			{
				name: 'bundles',
				description: 'List available bundles',
				action: listBundlesCommand
			},
			{
				name: 'validate',
				description: 'Validate builder configuration',
				action: validateConfigCommand
			}
		],
		action: builderCommand
	});
}
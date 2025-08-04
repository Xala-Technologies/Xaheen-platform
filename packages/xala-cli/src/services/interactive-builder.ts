/**
 * @fileoverview Interactive Full-Stack Tech Builder
 * @description Beautiful, menu-driven CLI for building full-stack applications
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import figlet from 'figlet';
import gradient from 'gradient-string';

import {
	ProjectType,
	QuickPreset,
	TechOption,
	StackConfiguration,
	BuilderState,
	ValidationError,
	InteractivePromptResult,
	CategoryPrompt,
	PromptChoice,
	BuilderError
} from './builder-types.js';
import { configLoader } from './config-loader.js';
import { compatibilityChecker } from './compatibility-checker.js';

const execAsync = promisify(exec);

export class InteractiveBuilder {
	private state: BuilderState = {
		selectedProjectType: null,
		selectedPreset: null,
		currentStack: {},
		completedCategories: [],
		currentCategory: null,
		validationErrors: [],
		isValid: false
	};

	/**
	 * Start the interactive builder experience
	 */
	async startInteractiveBuilder(): Promise<StackConfiguration> {
		try {
			await this.displayWelcome();
			
			// Step 1: Choose between quick preset or custom build
			const buildType = await this.chooseBuildType();
			
			if (buildType === 'preset') {
				return await this.handleQuickPreset();
			} else {
				return await this.handleCustomBuild();
			}
		} catch (error) {
			throw new BuilderError(
				`Interactive builder failed: ${error instanceof Error ? error.message : String(error)}`,
				'BUILDER_ERROR'
			);
		}
	}

	/**
	 * Display welcome screen with beautiful ASCII art
	 */
	private async displayWelcome(): Promise<void> {
		console.clear();
		
		const title = figlet.textSync('XAHEEN', {
			font: 'Big',
			horizontalLayout: 'fitted'
		});
		
		console.log(gradient.rainbow(title));
		console.log(chalk.cyan.bold('\n🚀 Interactive Full-Stack Tech Builder\n'));
		console.log(chalk.gray('Build modern applications with guided technology selection\n'));
		
		// Show loading while checking configuration
		const spinner = ora('Loading configuration...').start();
		await configLoader.loadConfiguration();
		spinner.succeed('Configuration loaded');
	}

	/**
	 * Choose between quick presets or custom build
	 */
	private async chooseBuildType(): Promise<'preset' | 'custom'> {
		const { buildType } = await inquirer.prompt([
			{
				type: 'list',
				name: 'buildType',
				message: '🎯 How would you like to start?',
				choices: [
					{
						name: '⚡ Quick Start - Use a pre-configured template',
						value: 'preset',
						short: 'Quick Start'
					},
					{
						name: '🛠️  Custom Build - Configure each technology',
						value: 'custom',
						short: 'Custom Build'
					}
				],
				pageSize: 10
			}
		]);

		return buildType;
	}

	/**
	 * Handle quick preset selection
	 */
	private async handleQuickPreset(): Promise<StackConfiguration> {
		// First select project type to filter presets
		const projectType = await this.selectProjectType();
		this.state.selectedProjectType = projectType;

		// Show quick presets for the selected project type
		const presets = await configLoader.getPresetsForProjectType(projectType.id);
		const allPresets = await configLoader.loadConfiguration().then(config => config.quickPresets);
		
		// Include popular presets from other categories
		const popularPresets = allPresets.filter(p => 
			['saas-starter', 'fullstack-app', 'dashboard-app'].includes(p.id)
		);

		const combinedPresets = [...presets, ...popularPresets.filter(p => !presets.find(existing => existing.id === p.id))];

		if (combinedPresets.length === 0) {
			console.log(chalk.yellow('No presets available for this project type. Switching to custom build...'));
			return await this.handleCustomBuild();
		}

		const preset = await this.selectQuickPreset(combinedPresets);
		this.state.selectedPreset = preset;

		// Allow customization of the preset
		const customizePreset = await this.askCustomizePreset();
		if (customizePreset) {
			return await this.customizePresetStack(preset.stack);
		}

		// Validate and return preset stack
		await this.validateStack(preset.stack);
		return preset.stack;
	}

	/**
	 * Handle custom build flow
	 */
	private async handleCustomBuild(): Promise<StackConfiguration> {
		// Step 1: Select project type
		const projectType = await this.selectProjectType();
		this.state.selectedProjectType = projectType;

		// Step 2: Get project name
		const projectName = await this.getProjectName();
		this.state.currentStack.projectName = projectName;

		// Step 3: Apply default selections
		const defaults = await configLoader.getDefaultSelections(projectType.id);
		this.state.currentStack = { ...this.state.currentStack, ...defaults };

		// Step 4: Walk through relevant categories
		const relevantCategories = await configLoader.getRelevantCategories(projectType.id);
		const allCategories = await configLoader.loadConfiguration().then(config => 
			config.techCategories.map(tc => tc.id)
		);

		// Combine relevant categories with core ones, removing duplicates
		const categoriesToProcess = [
			...relevantCategories,
			...allCategories.filter(cat => 
				!relevantCategories.includes(cat) && 
				['packageManager', 'git', 'install'].includes(cat)
			)
		];

		for (const category of categoriesToProcess) {
			await this.processCategorySelection(category);
		}

		// Step 5: Final validation and confirmation
		const finalStack = this.state.currentStack as StackConfiguration;
		await this.validateStack(finalStack);
		await this.showStackSummary(finalStack);

		const confirmed = await this.confirmStackConfiguration();
		if (!confirmed) {
			console.log(chalk.yellow('Build cancelled.'));
			process.exit(0);
		}

		return finalStack;
	}

	/**
	 * Select project type with beautiful tiles
	 */
	private async selectProjectType(): Promise<ProjectType> {
		const config = await configLoader.loadConfiguration();
		
		const choices: PromptChoice[] = config.projectTypes.map(pt => ({
			name: `${pt.name}\n   ${chalk.gray(pt.description)}`,
			value: pt.id,
			short: pt.name
		}));

		const { projectTypeId } = await inquirer.prompt([
			{
				type: 'list',
				name: 'projectTypeId',
				message: '🏗️  What type of application are you building?',
				choices,
				pageSize: 8
			}
		]);

		const projectType = await configLoader.getProjectType(projectTypeId);
		if (!projectType) {
			throw new BuilderError(`Project type ${projectTypeId} not found`, 'PROJECT_TYPE_NOT_FOUND');
		}

		console.log(chalk.green(`✅ Selected: ${projectType.name}`));
		return projectType;
	}

	/**
	 * Select quick preset
	 */
	private async selectQuickPreset(presets: readonly QuickPreset[]): Promise<QuickPreset> {
		const choices: PromptChoice[] = presets.map(preset => ({
			name: `${preset.name}\n   ${chalk.gray(preset.description)}`,
			value: preset.id,
			short: preset.name
		}));

		const { presetId } = await inquirer.prompt([
			{
				type: 'list',
				name: 'presetId',
				message: '📦 Choose a quick-start template:',
				choices,
				pageSize: 10
			}
		]);

		const preset = await configLoader.getQuickPreset(presetId);
		if (!preset) {
			throw new BuilderError(`Preset ${presetId} not found`, 'PRESET_NOT_FOUND');
		}

		console.log(chalk.green(`✅ Selected: ${preset.name}`));
		return preset;
	}

	/**
	 * Get project name with validation
	 */
	private async getProjectName(): Promise<string> {
		const { projectName } = await inquirer.prompt([
			{
				type: 'input',
				name: 'projectName',
				message: '📝 What is your project name?',
				validate: (input: string) => {
					if (!input || input.length < 2) {
						return 'Project name must be at least 2 characters long';
					}
					if (!/^[a-z0-9-_]+$/.test(input)) {
						return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
					}
					return true;
				},
				filter: (input: string) => input.toLowerCase().trim()
			}
		]);

		console.log(chalk.green(`✅ Project name: ${projectName}`));
		return projectName;
	}

	/**
	 * Process category selection with compatibility checking
	 */
	private async processCategorySelection(category: string): Promise<void> {
		this.state.currentCategory = category;

		// Get available options with compatibility filtering
		const availableOptions = await compatibilityChecker.getAvailableOptions(
			category,
			this.state.currentStack
		);

		if (availableOptions.length === 0) {
			console.log(chalk.yellow(`⚠️  No compatible options available for ${category}, skipping...`));
			return;
		}

		// Check if there's already a selection for this category
		const currentSelection = this.getCurrentSelection(category);
		if (currentSelection && !await this.askToChangeSelection(category, currentSelection)) {
			console.log(chalk.blue(`⏭️  Keeping current selection for ${category}: ${currentSelection}`));
			return;
		}

		// Create category prompt
		const categoryPrompt = await this.createCategoryPrompt(category, availableOptions);
		const result = await this.showCategoryPrompt(categoryPrompt);

		if (!result.skipped) {
			this.updateStackSelection(category, result.selection);
			console.log(chalk.green(`✅ ${this.getCategoryDisplayName(category)}: ${this.formatSelection(result.selection)}`));
		}

		this.state.completedCategories = [...this.state.completedCategories, category];
	}

	/**
	 * Create category prompt configuration
	 */
	private async createCategoryPrompt(category: string, options: readonly TechOption[]): Promise<CategoryPrompt> {
		const displayName = this.getCategoryDisplayName(category);
		const description = this.getCategoryDescription(category);
		const allowMultiple = this.categoryAllowsMultiple(category);
		const required = this.isCategoryRequired(category);

		return {
			category,
			displayName,
			description,
			options,
			allowMultiple,
			required,
			defaultValue: this.getCurrentSelection(category)
		};
	}

	/**
	 * Show category prompt to user
	 */
	private async showCategoryPrompt(prompt: CategoryPrompt): Promise<InteractivePromptResult> {
		const choices: PromptChoice[] = prompt.options.map(option => ({
			name: `${option.name}\n   ${chalk.gray(option.description)}`,
			value: option.id,
			short: option.name
		}));

		// Add skip option for non-required categories
		if (!prompt.required) {
			choices.push({
				name: chalk.gray('⏭️  Skip this step'),
				value: '__skip__',
				short: 'Skip'
			});
		}

		const promptConfig: any = {
			type: prompt.allowMultiple ? 'checkbox' : 'list',
			name: 'selection',
			message: `${this.getCategoryIcon(prompt.category)} ${prompt.displayName}:`,
			choices,
			pageSize: Math.min(10, choices.length + 2)
		};

		if (prompt.defaultValue) {
			promptConfig.default = prompt.defaultValue;
		}

		const { selection } = await inquirer.prompt([promptConfig]);

		const skipped = selection === '__skip__' || (Array.isArray(selection) && selection.includes('__skip__'));

		return {
			category: prompt.category,
			selection: skipped ? [] : selection,
			skipped
		};
	}

	/**
	 * Ask if user wants to customize preset
	 */
	private async askCustomizePreset(): Promise<boolean> {
		const { customize } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'customize',
				message: '🎨 Would you like to customize this preset?',
				default: false
			}
		]);

		return customize;
	}

	/**
	 * Customize preset stack
	 */
	private async customizePresetStack(presetStack: StackConfiguration): Promise<StackConfiguration> {
		console.log(chalk.cyan('\n🎨 Customizing preset...\n'));
		
		this.state.currentStack = { ...presetStack };

		// Get list of customizable categories
		const customizableCategories = [
			'webFrontend', 'backend', 'database', 'orm', 'auth', 
			'uiSystem', 'analytics', 'monitoring', 'webDeploy'
		];

		const categoriesToCustomize = await this.selectCategoriesToCustomize(customizableCategories);

		for (const category of categoriesToCustomize) {
			await this.processCategorySelection(category);
		}

		return this.state.currentStack as StackConfiguration;
	}

	/**
	 * Select which categories to customize
	 */
	private async selectCategoriesToCustomize(categories: readonly string[]): Promise<readonly string[]> {
		const choices: PromptChoice[] = categories.map(cat => ({
			name: `${this.getCategoryIcon(cat)} ${this.getCategoryDisplayName(cat)}`,
			value: cat,
			short: this.getCategoryDisplayName(cat)
		}));

		const { selected } = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'selected',
				message: '⚙️  Which categories would you like to customize?',
				choices,
				pageSize: 10
			}
		]);

		return selected;
	}

	/**
	 * Ask if user wants to change current selection
	 */
	private async askToChangeSelection(category: string, currentSelection: string | readonly string[]): Promise<boolean> {
		const { change } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'change',
				message: `Current ${this.getCategoryDisplayName(category)}: ${this.formatSelection(currentSelection)}. Change it?`,
				default: false
			}
		]);

		return change;
	}

	/**
	 * Validate stack configuration
	 */
	private async validateStack(stack: StackConfiguration): Promise<void> {
		const spinner = ora('Validating configuration...').start();
		
		const errors = compatibilityChecker.validateStack(stack);
		this.state.validationErrors = errors;
		this.state.isValid = errors.length === 0;

		if (errors.length > 0) {
			spinner.fail('Configuration validation failed');
			console.log(chalk.red('\n❌ Validation Errors:'));
			
			for (const error of errors) {
				console.log(chalk.red(`   • ${error.message}`));
			}
			
			const fixErrors = await this.askToFixErrors();
			if (fixErrors) {
				await this.interactiveErrorFix(errors);
			} else {
				throw new BuilderError('Configuration validation failed', 'VALIDATION_ERROR');
			}
		} else {
			spinner.succeed('Configuration validated');
		}
	}

	/**
	 * Ask user if they want to fix validation errors
	 */
	private async askToFixErrors(): Promise<boolean> {
		const { fix } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'fix',
				message: '🔧 Would you like to fix these issues interactively?',
				default: true
			}
		]);

		return fix;
	}

	/**
	 * Interactive error fixing
	 */
	private async interactiveErrorFix(errors: readonly ValidationError[]): Promise<void> {
		console.log(chalk.cyan('\n🔧 Interactive Error Fixing\n'));

		for (const error of errors) {
			console.log(chalk.red(`❌ ${error.message}`));
			
			if (error.category && error.field) {
				const suggestions = await compatibilityChecker.suggestAlternatives(
					error.category,
					error.field,
					this.state.currentStack
				);

				if (suggestions.length > 0) {
					const fix = await this.selectErrorFix(error, suggestions);
					if (fix) {
						this.updateStackSelection(error.category, fix);
						console.log(chalk.green(`✅ Fixed: ${error.field} → ${fix}`));
					}
				}
			}
		}

		// Re-validate after fixes
		await this.validateStack(this.state.currentStack as StackConfiguration);
	}

	/**
	 * Select error fix from suggestions
	 */
	private async selectErrorFix(error: ValidationError, suggestions: readonly TechOption[]): Promise<string | null> {
		const choices: PromptChoice[] = [
			...suggestions.map(suggestion => ({
				name: `${suggestion.name} - ${suggestion.description}`,
				value: suggestion.id,
				short: suggestion.name
			})),
			{
				name: chalk.gray('Skip this fix'),
				value: '__skip__',
				short: 'Skip'
			}
		];

		const { fix } = await inquirer.prompt([
			{
				type: 'list',
				name: 'fix',
				message: `🔧 Select replacement for ${error.field}:`,
				choices,
				pageSize: 8
			}
		]);

		return fix === '__skip__' ? null : fix;
	}

	/**
	 * Show stack summary
	 */
	private async showStackSummary(stack: StackConfiguration): Promise<void> {
		console.log(chalk.cyan('\n📋 Configuration Summary\n'));
		
		const summaryItems = [
			['Project', stack.projectName],
			['Frontend', this.formatSelection(stack.webFrontend)],
			['Backend', stack.backend],
			['Database', stack.database],
			['ORM', stack.orm],
			['Auth', stack.auth],
			['Package Manager', stack.packageManager],
			['Deployment', stack.webDeploy || 'Not specified']
		];

		for (const [label, value] of summaryItems) {
			if (value && value !== 'none') {
				console.log(`${chalk.blue(label.padEnd(15))}: ${chalk.white(value)}`);
			}
		}

		if (stack.addons && stack.addons.length > 0) {
			console.log(`${chalk.blue('Add-ons'.padEnd(15))}: ${chalk.white(stack.addons.join(', '))}`);
		}
	}

	/**
	 * Confirm stack configuration
	 */
	private async confirmStackConfiguration(): Promise<boolean> {
		const { confirmed } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirmed',
				message: '🚀 Generate project with this configuration?',
				default: true
			}
		]);

		return confirmed;
	}

	/**
	 * Helper methods
	 */
	private getCurrentSelection(category: string): string | readonly string[] | undefined {
		return (this.state.currentStack as any)[category];
	}

	private updateStackSelection(category: string, selection: string | readonly string[]): void {
		(this.state.currentStack as any)[category] = selection;
	}

	private getCategoryDisplayName(category: string): string {
		const displayNames: Record<string, string> = {
			webFrontend: 'Web Frontend',
			nativeFrontend: 'Mobile Frontend',
			backend: 'Backend Framework',
			database: 'Database',
			orm: 'ORM/Database Tool',
			runtime: 'Runtime',
			auth: 'Authentication',
			packageManager: 'Package Manager',
			uiSystem: 'UI System',
			analytics: 'Analytics',
			monitoring: 'Monitoring',
			notifications: 'Notifications',
			payments: 'Payments',
			webDeploy: 'Deployment',
			api: 'API Type',
			cms: 'Content Management',
			security: 'Security Tools',
			testing: 'Testing Framework',
			devops: 'DevOps Tools'
		};

		return displayNames[category] || category;
	}

	private getCategoryDescription(category: string): string {
		const descriptions: Record<string, string> = {
			webFrontend: 'Choose your web frontend framework',
			backend: 'Select your backend framework',
			database: 'Pick your database solution',
			orm: 'Choose an ORM or database toolkit',
			auth: 'Select authentication provider',
			packageManager: 'Choose package manager',
			uiSystem: 'Pick UI component system'
		};

		return descriptions[category] || `Configure ${category}`;
	}

	private getCategoryIcon(category: string): string {
		const icons: Record<string, string> = {
			webFrontend: '🎨',
			nativeFrontend: '📱',
			backend: '⚙️',
			database: '🗄️',
			orm: '🔗',
			runtime: '🏃',
			auth: '🔐',
			packageManager: '📦',
			uiSystem: '🎭',
			analytics: '📊',
			monitoring: '👀',
			notifications: '📢',
			payments: '💳',
			webDeploy: '🚀',
			api: '🔌',
			cms: '📝',
			security: '🛡️',
			testing: '🧪',
			devops: '🔧'
		};

		return icons[category] || '⚙️';
	}

	private categoryAllowsMultiple(category: string): boolean {
		const multipleCategories = ['webFrontend', 'nativeFrontend', 'addons', 'examples', 'security', 'compliance', 'locales', 'multiTenancy', 'testing', 'devops'];
		return multipleCategories.includes(category);
	}

	private isCategoryRequired(category: string): boolean {
		const requiredCategories = ['packageManager'];
		return requiredCategories.includes(category);
	}

	private formatSelection(selection: string | readonly string[]): string {
		if (Array.isArray(selection)) {
			return selection.join(', ');
		}
		return selection;
	}
}

// Export singleton instance
export const interactiveBuilder = new InteractiveBuilder();
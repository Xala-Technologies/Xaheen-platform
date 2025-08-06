/**
 * Enhanced Contextual Help System for Xaheen CLI
 * Provides intelligent, context-aware help with interactive tutorials
 * 
 * Part of EPIC 2, Story 2.1: Modern CLI Patterns Implementation
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { EventEmitter } from "events";
import type { CommandRoute, CLICommand } from "../../types/index";
import { cliLogger } from "../../utils/logger";

export interface HelpContext {
	readonly currentCommand?: string;
	readonly recentCommands: string[];
	readonly projectType?: string;
	readonly framework?: string;
	readonly userLevel: 'beginner' | 'intermediate' | 'advanced';
	readonly preferredFormat: 'brief' | 'detailed' | 'examples';
	readonly language: string;
}

export interface HelpContent {
	readonly title: string;
	readonly description: string;
	readonly usage: string;
	readonly examples: string[];
	readonly options: Array<{
		readonly flag: string;
		readonly description: string;
		readonly required?: boolean;
		readonly defaultValue?: any;
		readonly type?: 'string' | 'number' | 'boolean';
	}>;
	readonly relatedCommands: string[];
	readonly tips: string[];
	readonly warnings: string[];
	readonly troubleshooting: Array<{
		readonly issue: string;
		readonly solution: string;
		readonly code?: string;
	}>;
	readonly workflows: Array<{
		readonly name: string;
		readonly steps: string[];
		readonly description: string;
	}>;
	readonly shortcuts: Array<{
		readonly keys: string;
		readonly description: string;
	}>;
}

export interface InteractiveHelpSession {
	readonly sessionId: string;
	readonly context: HelpContext;
	readonly breadcrumb: string[];
	readonly visited: Set<string>;
	readonly startTime: Date;
}

export interface TutorialStep {
	readonly title: string;
	readonly description: string;
	readonly command?: string;
	readonly expectedOutput?: string;
	readonly tips?: string[];
	readonly nextSteps?: string[];
}

export interface Tutorial {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
	readonly estimatedTime: string;
	readonly prerequisites: string[];
	readonly steps: TutorialStep[];
	readonly category: string;
}

/**
 * Enhanced Contextual Help System with Interactive Tutorials
 */
export class ContextualHelpSystem extends EventEmitter {
	private readonly helpDatabase: Map<string, HelpContent> = new Map();
	private readonly commandRoutes: Map<string, CommandRoute> = new Map();
	private readonly sessions: Map<string, InteractiveHelpSession> = new Map();
	private readonly tutorials: Map<string, Tutorial> = new Map();
	private readonly categories: Map<string, string[]> = new Map();

	constructor() {
		super();
		this.initializeHelpDatabase();
		this.initializeTutorials();
		this.initializeCategories();
	}

	/**
	 * Register command routes for contextual help
	 */
	public registerCommands(routes: Map<string, CommandRoute>): void {
		this.commandRoutes.clear();
		routes.forEach((route, pattern) => {
			this.commandRoutes.set(pattern, route);
			this.commandRoutes.set(`${route.domain}:${route.action}`, route);
		});
	}

	/**
	 * Get contextual help for a command
	 */
	public getHelp(command: string, context?: Partial<HelpContext>): HelpContent | null {
		const helpContent = this.helpDatabase.get(command);
		
		if (!helpContent) {
			return null;
		}

		// Customize help based on context
		if (context) {
			return this.customizeHelpForContext(helpContent, context);
		}

		return helpContent;
	}

	/**
	 * Start interactive help session
	 */
	public async startInteractiveHelp(context?: Partial<HelpContext>): Promise<void> {
		const sessionId = this.generateSessionId();
		const session: InteractiveHelpSession = {
			sessionId,
			context: {
				recentCommands: [],
				userLevel: 'intermediate',
				preferredFormat: 'detailed',
				language: 'en',
				...context
			},
			breadcrumb: [],
			visited: new Set(),
			startTime: new Date()
		};

		this.sessions.set(sessionId, session);
		this.emit('helpSessionStart', session);

		try {
			cliLogger.info(chalk.blue('\n📚 Welcome to Xaheen CLI Interactive Help System\n'));
			await this.showMainHelpMenu(session);
		} finally {
			this.sessions.delete(sessionId);
			this.emit('helpSessionEnd', session);
		}
	}

	/**
	 * Show help for specific command
	 */
	public showCommandHelp(command: string, context?: Partial<HelpContext>): void {
		const helpContent = this.getHelp(command, context);
		
		if (!helpContent) {
			cliLogger.info(chalk.yellow(`❓ No help available for command: ${command}`));
			this.suggestSimilarCommands(command);
			return;
		}

		this.displayHelpContent(helpContent, context);
		this.showAdditionalResources(command);
	}

	/**
	 * Show quick help summary
	 */
	public showQuickHelp(): void {
		cliLogger.info(chalk.blue('\n🚀 Xaheen CLI Quick Help\n'));
		
		const quickCommands = [
			'project:create <name> - Create a new project',
			'make:component <name> - Generate a component',
			'make:model <name> - Generate a model',
			'ai:generate <prompt> - AI-powered generation',
			'mcp:connect - Connect to MCP server',
			'help [command] - Get detailed help',
			'help --interactive - Start interactive help'
		];

		quickCommands.forEach(cmd => {
			const [command, description] = cmd.split(' - ');
			cliLogger.info(`  ${chalk.cyan(command.padEnd(30))} ${chalk.gray(description)}`);
		});

		cliLogger.info(chalk.green('\n💡 Pro Tips:'));
		cliLogger.info(`  ${chalk.dim('•')} Use ${chalk.cyan('xaheen help --interactive')} for guided help`);
		cliLogger.info(`  ${chalk.dim('•')} Use ${chalk.cyan('xaheen <command> --help')} for command-specific help`);
		cliLogger.info(`  ${chalk.dim('•')} Use ${chalk.cyan('xaheen tutorials')} to see available tutorials`);

		cliLogger.info(chalk.blue('\n🎯 Getting Started:'));
		cliLogger.info(`  1. ${chalk.cyan('xaheen project create my-app')} - Create your first project`);
		cliLogger.info(`  2. ${chalk.cyan('xaheen make:component Button')} - Generate a component`);
		cliLogger.info(`  3. ${chalk.cyan('xaheen mcp connect')} - Enable AI features`);
	}

	/**
	 * Search help content
	 */
	public searchHelp(query: string): Array<{ command: string; content: HelpContent; relevance: number }> {
		const results: Array<{ command: string; content: HelpContent; relevance: number }> = [];
		
		this.helpDatabase.forEach((content, command) => {
			const relevance = this.calculateRelevance(query, content);
			if (relevance > 0) {
				results.push({ command, content, relevance });
			}
		});

		return results.sort((a, b) => b.relevance - a.relevance);
	}

	/**
	 * Show available tutorials
	 */
	public async showTutorials(category?: string): Promise<void> {
		let tutorials = Array.from(this.tutorials.values());
		
		if (category) {
			tutorials = tutorials.filter(t => t.category === category);
		}

		if (tutorials.length === 0) {
			cliLogger.info(chalk.yellow('No tutorials available for this category'));
			return;
		}

		cliLogger.info(chalk.blue('\n📚 Available Tutorials\n'));

		tutorials.forEach((tutorial, index) => {
			const difficulty = this.getDifficultyIcon(tutorial.difficulty);
			const time = chalk.dim(`(~${tutorial.estimatedTime})`);
			
			cliLogger.info(`${chalk.cyan((index + 1).toString().padStart(2))}. ${difficulty} ${tutorial.title} ${time}`);
			cliLogger.info(`    ${chalk.gray(tutorial.description)}`);
			cliLogger.info('');
		});

		const { selectedTutorial } = await inquirer.prompt([
			{
				type: 'list',
				name: 'selectedTutorial',
				message: 'Select a tutorial to start:',
				choices: [
					...tutorials.map((tutorial, index) => ({
						name: `${index + 1}. ${tutorial.title}`,
						value: tutorial.id,
						short: tutorial.title
					})),
					{
						name: chalk.gray('← Back'),
						value: 'back',
						short: 'Back'
					}
				],
				pageSize: 15
			}
		]);

		if (selectedTutorial !== 'back') {
			const tutorial = this.tutorials.get(selectedTutorial);
			if (tutorial) {
				await this.runTutorial(tutorial);
			}
		}
	}

	/**
	 * Run an interactive tutorial
	 */
	public async runTutorial(tutorial: Tutorial): Promise<void> {
		cliLogger.info(chalk.blue(`\n🎓 Starting Tutorial: ${tutorial.title}\n`));
		cliLogger.info(chalk.gray(tutorial.description));
		cliLogger.info(chalk.dim(`Estimated time: ${tutorial.estimatedTime}`));

		if (tutorial.prerequisites.length > 0) {
			cliLogger.info(chalk.yellow('\n📋 Prerequisites:'));
			tutorial.prerequisites.forEach(prereq => {
				cliLogger.info(`  • ${prereq}`);
			});
		}

		const { proceed } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'proceed',
				message: 'Ready to start the tutorial?',
				default: true
			}
		]);

		if (!proceed) {
			return;
		}

		for (let i = 0; i < tutorial.steps.length; i++) {
			const step = tutorial.steps[i];
			const isLastStep = i === tutorial.steps.length - 1;

			await this.runTutorialStep(step, i + 1, tutorial.steps.length, isLastStep);
		}

		cliLogger.info(chalk.green(`\n🎉 Congratulations! You completed the "${tutorial.title}" tutorial!`));
		
		if (tutorial.steps[tutorial.steps.length - 1].nextSteps) {
			cliLogger.info(chalk.blue('\n🚀 Next Steps:'));
			tutorial.steps[tutorial.steps.length - 1].nextSteps!.forEach(step => {
				cliLogger.info(`  • ${step}`);
			});
		}
	}

	// Private helper methods

	private async showMainHelpMenu(session: InteractiveHelpSession): Promise<void> {
		const choices = [
			{
				name: '🔍 Search help topics',
				value: 'search',
				short: 'Search'
			},
			{
				name: '📚 Browse by category',
				value: 'browse',
				short: 'Browse'
			},
			{
				name: '🎓 Interactive tutorials',
				value: 'tutorials',
				short: 'Tutorials'
			},
			{
				name: '🚀 Getting started guide',
				value: 'getting-started',
				short: 'Getting Started'
			},
			{
				name: '💡 Tips and best practices',
				value: 'tips',
				short: 'Tips'
			},
			{
				name: '🔧 Troubleshooting',
				value: 'troubleshooting',
				short: 'Troubleshooting'
			},
			{
				name: '📖 Command reference',
				value: 'reference',
				short: 'Reference'
			},
			{
				name: '⚙️  Settings',
				value: 'settings',
				short: 'Settings'
			},
			{
				name: chalk.red('❌ Exit help'),
				value: 'exit',
				short: 'Exit'
			}
		];

		const { choice } = await inquirer.prompt([
			{
				type: 'list',
				name: 'choice',
				message: 'What kind of help do you need?',
				choices,
				pageSize: 12
			}
		]);

		switch (choice) {
			case 'search':
				await this.showSearchInterface(session);
				break;
			case 'browse':
				await this.showCategoryBrowser(session);
				break;
			case 'tutorials':
				await this.showTutorials();
				await this.showMainHelpMenu(session);
				break;
			case 'getting-started':
				await this.showGettingStarted(session);
				break;
			case 'tips':
				await this.showTipsAndTricks(session);
				break;
			case 'troubleshooting':
				await this.showTroubleshooting(session);
				break;
			case 'reference':
				await this.showCommandReference(session);
				break;
			case 'settings':
				await this.showHelpSettings(session);
				break;
			case 'exit':
			default:
				const sessionDuration = Date.now() - session.startTime.getTime();
				cliLogger.info(chalk.blue(`\n👋 Thanks for using Xaheen CLI Help! (${Math.round(sessionDuration / 1000)}s)`));
				cliLogger.info(chalk.dim('💡 Remember: You can always use "xaheen help <command>" for quick help'));
				return;
		}
	}

	private async showSearchInterface(session: InteractiveHelpSession): Promise<void> {
		const { query } = await inquirer.prompt([
			{
				type: 'input',
				name: 'query',
				message: '🔍 Enter search terms (command, keyword, or description):',
				validate: (input: string) => {
					if (!input.trim()) {
						return 'Please enter a search term';
					}
					return true;
				}
			}
		]);

		const results = this.searchHelp(query.trim());

		if (results.length === 0) {
			cliLogger.info(chalk.yellow(`❓ No help found for: ${query}`));
			this.suggestSearchTips();
			return await this.showMainHelpMenu(session);
		}

		await this.showSearchResults(session, results, query);
	}

	private async showSearchResults(
		session: InteractiveHelpSession,
		results: Array<{ command: string; content: HelpContent; relevance: number }>,
		query: string
	): Promise<void> {
		const choices = results.slice(0, 10).map(result => {
			const relevanceScore = Math.round(result.relevance * 10);
			const score = relevanceScore >= 8 ? '🎯' : relevanceScore >= 5 ? '✅' : '💡';
			
			return {
				name: `${score} ${chalk.cyan(result.command)} - ${result.content.description}`,
				value: result.command,
				short: result.command
			};
		});

		choices.push({
			name: chalk.gray('🔍 New search'),
			value: 'new-search',
			short: 'New Search'
		});

		choices.push({
			name: chalk.gray('← Back to main menu'),
			value: 'back',
			short: 'Back'
		});

		const { selectedCommand } = await inquirer.prompt([
			{
				type: 'list',
				name: 'selectedCommand',
				message: `🔍 Search results for "${query}" (${results.length} found):`,
				choices,
				pageSize: 12
			}
		]);

		if (selectedCommand === 'back') {
			return await this.showMainHelpMenu(session);
		}

		if (selectedCommand === 'new-search') {
			return await this.showSearchInterface(session);
		}

		const helpContent = this.helpDatabase.get(selectedCommand);
		if (helpContent) {
			session.visited.add(selectedCommand);
			session.breadcrumb.push(selectedCommand);
			
			this.displayHelpContent(helpContent, session.context);
			this.showAdditionalResources(selectedCommand);
			
			const { action } = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'What would you like to do next?',
					choices: [
						{ name: '← Back to search results', value: 'back' },
						{ name: '🔗 Show related commands', value: 'related' },
						{ name: '🎓 Find tutorials', value: 'tutorials' },
						{ name: '🏠 Main menu', value: 'menu' },
						{ name: '❌ Exit', value: 'exit' }
					]
				}
			]);

			switch (action) {
				case 'back':
					session.breadcrumb.pop();
					return await this.showSearchResults(session, results, query);
				case 'related':
					await this.showRelatedCommands(helpContent.relatedCommands);
					return await this.showSearchResults(session, results, query);
				case 'tutorials':
					await this.showRelevantTutorials(selectedCommand);
					return await this.showSearchResults(session, results, query);
				case 'menu':
					return await this.showMainHelpMenu(session);
				case 'exit':
				default:
					return;
			}
		}
	}

	private async showCategoryBrowser(session: InteractiveHelpSession): Promise<void> {
		const categories = Array.from(this.categories.keys());
		
		const choices = categories.map(category => ({
			name: `📂 ${category} (${this.categories.get(category)!.length} commands)`,
			value: category,
			short: category
		}));

		choices.push({
			name: chalk.gray('← Back to main menu'),
			value: 'back',
			short: 'Back'
		});

		const { selectedCategory } = await inquirer.prompt([
			{
				type: 'list',
				name: 'selectedCategory',
				message: '📂 Browse help by category:',
				choices,
				pageSize: 10
			}
		]);

		if (selectedCategory === 'back') {
			return await this.showMainHelpMenu(session);
		}

		await this.showCategoryCommands(session, selectedCategory);
	}

	private async showCategoryCommands(session: InteractiveHelpSession, category: string): Promise<void> {
		const commands = this.categories.get(category) || [];
		
		const choices = commands.map(command => {
			const helpContent = this.helpDatabase.get(command);
			return {
				name: `${chalk.cyan(command)} - ${helpContent?.description || 'No description'}`,
				value: command,
				short: command
			};
		});

		choices.push({
			name: chalk.gray('← Back to categories'),
			value: 'back',
			short: 'Back'
		});

		const { selectedCommand } = await inquirer.prompt([
			{
				type: 'list',
				name: 'selectedCommand',
				message: `📂 ${category} commands:`,
				choices,
				pageSize: 15
			}
		]);

		if (selectedCommand === 'back') {
			return await this.showCategoryBrowser(session);
		}

		const helpContent = this.helpDatabase.get(selectedCommand);
		if (helpContent) {
			this.displayHelpContent(helpContent, session.context);
			
			const { action } = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'What would you like to do next?',
					choices: [
						{ name: '← Back to category', value: 'back' },
						{ name: '📚 Categories', value: 'categories' },
						{ name: '🏠 Main menu', value: 'menu' }
					]
				}
			]);

			switch (action) {
				case 'back':
					return await this.showCategoryCommands(session, category);
				case 'categories':
					return await this.showCategoryBrowser(session);
				case 'menu':
				default:
					return await this.showMainHelpMenu(session);
			}
		}
	}

	private async runTutorialStep(step: TutorialStep, stepNumber: number, totalSteps: number, isLastStep: boolean): Promise<void> {
		cliLogger.info(chalk.blue(`\n📍 Step ${stepNumber}/${totalSteps}: ${step.title}\n`));
		cliLogger.info(chalk.white(step.description));

		if (step.command) {
			cliLogger.info(chalk.green('\n💻 Command to run:'));
			cliLogger.info(`  ${chalk.cyan(step.command)}`);
		}

		if (step.tips && step.tips.length > 0) {
			cliLogger.info(chalk.yellow('\n💡 Tips:'));
			step.tips.forEach(tip => {
				cliLogger.info(`  • ${tip}`);
			});
		}

		if (step.expectedOutput) {
			cliLogger.info(chalk.green('\n📤 Expected output:'));
			cliLogger.info(chalk.dim(step.expectedOutput));
		}

		if (!isLastStep) {
			const { ready } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'ready',
					message: 'Ready for the next step?',
					default: true
				}
			]);

			if (!ready) {
				const { action } = await inquirer.prompt([
					{
						type: 'list',
						name: 'action',
						message: 'What would you like to do?',
						choices: [
							{ name: '⏭️  Skip this step', value: 'skip' },
							{ name: '🔄 Repeat step explanation', value: 'repeat' },
							{ name: '❌ Exit tutorial', value: 'exit' }
						]
					}
				]);

				if (action === 'repeat') {
					return await this.runTutorialStep(step, stepNumber, totalSteps, isLastStep);
				} else if (action === 'exit') {
					cliLogger.info(chalk.yellow('Tutorial exited. You can resume anytime!'));
					return;
				}
			}
		}
	}

	private displayHelpContent(content: HelpContent, context?: Partial<HelpContext>): void {
		cliLogger.info(chalk.blue(`\n📖 ${content.title}\n`));
		cliLogger.info(chalk.white(content.description));
		
		if (content.usage) {
			cliLogger.info(chalk.green('\n📝 Usage:'));
			cliLogger.info(`  ${chalk.cyan(content.usage)}`);
		}

		if (content.options.length > 0) {
			cliLogger.info(chalk.green('\n⚙️  Options:'));
			content.options.forEach(option => {
				const required = option.required ? chalk.red(' (required)') : '';
				const type = option.type ? chalk.dim(` [${option.type}]`) : '';
				const defaultVal = option.defaultValue ? chalk.dim(` [default: ${option.defaultValue}]`) : '';
				cliLogger.info(`  ${chalk.yellow(option.flag.padEnd(25))} ${option.description}${required}${type}${defaultVal}`);
			});
		}

		if (content.examples.length > 0 && (!context || context.preferredFormat !== 'brief')) {
			cliLogger.info(chalk.green('\n💡 Examples:'));
			content.examples.forEach((example, index) => {
				cliLogger.info(`  ${chalk.dim((index + 1).toString())}. ${chalk.cyan(example)}`);
			});
		}

		if (content.shortcuts.length > 0) {
			cliLogger.info(chalk.green('\n⌨️  Keyboard Shortcuts:'));
			content.shortcuts.forEach(shortcut => {
				cliLogger.info(`  ${chalk.yellow(shortcut.keys.padEnd(15))} ${shortcut.description}`);
			});
		}

		if (content.workflows.length > 0) {
			cliLogger.info(chalk.green('\n🔄 Common Workflows:'));
			content.workflows.forEach(workflow => {
				cliLogger.info(`  ${chalk.cyan(workflow.name)}: ${workflow.description}`);
				workflow.steps.forEach((step, index) => {
					cliLogger.info(`    ${index + 1}. ${step}`);
				});
				cliLogger.info('');
			});
		}

		if (content.tips.length > 0 && context?.userLevel !== 'advanced') {
			cliLogger.info(chalk.green('\n💡 Tips:'));
			content.tips.forEach(tip => {
				cliLogger.info(`  • ${tip}`);
			});
		}

		if (content.warnings.length > 0) {
			cliLogger.info(chalk.yellow('\n⚠️  Warnings:'));
			content.warnings.forEach(warning => {
				cliLogger.info(`  • ${warning}`);
			});
		}

		if (content.relatedCommands.length > 0) {
			cliLogger.info(chalk.green('\n🔗 Related commands:'));
			content.relatedCommands.forEach(cmd => {
				cliLogger.info(`  ${chalk.cyan(cmd)}`);
			});
		}

		if (content.troubleshooting.length > 0 && context?.preferredFormat === 'detailed') {
			cliLogger.info(chalk.green('\n🔧 Troubleshooting:'));
			content.troubleshooting.forEach(item => {
				cliLogger.info(`  ${chalk.yellow('Problem:')} ${item.issue}`);
				cliLogger.info(`  ${chalk.green('Solution:')} ${item.solution}`);
				if (item.code) {
					cliLogger.info(`  ${chalk.cyan('Code:')} ${item.code}`);
				}
				cliLogger.info('');
			});
		}
	}

	private showAdditionalResources(command: string): void {
		cliLogger.info(chalk.blue('\n📚 Additional Resources:'));
		cliLogger.info(`  ${chalk.cyan('xaheen ' + command + ' --help')} - Command-specific help`);
		cliLogger.info(`  ${chalk.cyan('xaheen tutorials')} - Interactive tutorials`);
		cliLogger.info(`  ${chalk.cyan('xaheen help --interactive')} - Guided help system`);
	}

	private suggestSimilarCommands(command: string): void {
		const suggestions: string[] = [];
		const commandLower = command.toLowerCase();

		this.helpDatabase.forEach((content, cmd) => {
			if (cmd.toLowerCase().includes(commandLower) || 
				content.title.toLowerCase().includes(commandLower) ||
				content.description.toLowerCase().includes(commandLower)) {
				suggestions.push(cmd);
			}
		});

		if (suggestions.length > 0) {
			cliLogger.info(chalk.blue('\n💡 Did you mean one of these?'));
			suggestions.slice(0, 5).forEach(suggestion => {
				const helpContent = this.helpDatabase.get(suggestion);
				cliLogger.info(`  ${chalk.cyan(suggestion)} - ${chalk.gray(helpContent?.description || '')}`);
			});
		} else {
			cliLogger.info(chalk.blue('\n💡 Try these instead:'));
			cliLogger.info(`  ${chalk.cyan('xaheen help --interactive')} - Browse all available commands`);
			cliLogger.info(`  ${chalk.cyan('xaheen help search')} - Search help content`);
		}
	}

	private suggestSearchTips(): void {
		cliLogger.info(chalk.blue('\n💡 Search Tips:'));
		cliLogger.info('  • Try different keywords (e.g., "create", "generate", "component")');
		cliLogger.info('  • Use partial matches (e.g., "proj" for project-related commands)');
		cliLogger.info('  • Search by functionality (e.g., "database", "testing", "deployment")');
	}

	private async showRelatedCommands(relatedCommands: string[]): Promise<void> {
		if (relatedCommands.length === 0) {
			cliLogger.info(chalk.yellow('No related commands found'));
			return;
		}

		cliLogger.info(chalk.blue('\n🔗 Related Commands:\n'));
		relatedCommands.forEach(cmd => {
			const helpContent = this.helpDatabase.get(cmd);
			cliLogger.info(`  ${chalk.cyan(cmd)} - ${chalk.gray(helpContent?.description || 'No description')}`);
		});
	}

	private async showRelevantTutorials(command: string): Promise<void> {
		const relevantTutorials = Array.from(this.tutorials.values())
			.filter(tutorial => 
				tutorial.steps.some(step => step.command?.includes(command)) ||
				tutorial.title.toLowerCase().includes(command.toLowerCase())
			);

		if (relevantTutorials.length === 0) {
			cliLogger.info(chalk.yellow('No relevant tutorials found'));
			return;
		}

		cliLogger.info(chalk.blue('\n🎓 Relevant Tutorials:\n'));
		relevantTutorials.forEach(tutorial => {
			const difficulty = this.getDifficultyIcon(tutorial.difficulty);
			cliLogger.info(`  ${difficulty} ${chalk.cyan(tutorial.title)} ${chalk.dim(`(~${tutorial.estimatedTime})`)}`);
			cliLogger.info(`    ${chalk.gray(tutorial.description)}`);
		});
	}

	private getDifficultyIcon(difficulty: string): string {
		switch (difficulty) {
			case 'beginner': return '🟢';
			case 'intermediate': return '🟡';
			case 'advanced': return '🔴';
			default: return '⚪';
		}
	}

	private calculateRelevance(query: string, content: HelpContent): number {
		const queryLower = query.toLowerCase();
		let relevance = 0;

		// Title match (highest priority)
		if (content.title.toLowerCase().includes(queryLower)) {
			relevance += 10;
		}

		// Description match
		if (content.description.toLowerCase().includes(queryLower)) {
			relevance += 5;
		}

		// Usage match
		if (content.usage.toLowerCase().includes(queryLower)) {
			relevance += 3;
		}

		// Examples match
		content.examples.forEach(example => {
			if (example.toLowerCase().includes(queryLower)) {
				relevance += 2;
			}
		});

		// Options match
		content.options.forEach(option => {
			if (option.flag.toLowerCase().includes(queryLower) || 
				option.description.toLowerCase().includes(queryLower)) {
				relevance += 1;
			}
		});

		// Tips match
		content.tips.forEach(tip => {
			if (tip.toLowerCase().includes(queryLower)) {
				relevance += 1;
			}
		});

		return relevance;
	}

	private customizeHelpForContext(content: HelpContent, context: Partial<HelpContext>): HelpContent {
		// Clone the content to avoid modifying the original
		let customized = { ...content };

		// Filter examples based on user level
		if (context.userLevel === 'beginner') {
			customized.examples = content.examples.slice(0, 2); // Show fewer examples
			customized.tips = [...content.tips, '💡 Use --help flag with any command for quick reference'];
		} else if (context.userLevel === 'advanced') {
			// Show more technical examples and advanced options
			customized.examples = content.examples;
		}

		// Customize based on project type
		if (context.projectType || context.framework) {
			customized.tips = content.tips.filter(tip => 
				!context.projectType || tip.includes(context.projectType) ||
				!context.framework || tip.includes(context.framework) ||
				!tip.includes('React') && !tip.includes('Vue') && !tip.includes('Angular')
			);
		}

		// Add context-specific shortcuts
		if (context.framework === 'react') {
			customized.shortcuts = [
				...content.shortcuts,
				{ keys: 'Ctrl+R', description: 'Quick React component generation' }
			];
		}

		return customized;
	}

	private generateSessionId(): string {
		return `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private async showGettingStarted(session: InteractiveHelpSession): Promise<void> {
		cliLogger.info(chalk.blue('\n🚀 Getting Started with Xaheen CLI\n'));
		
		const steps = [
			'Install Xaheen CLI globally: npm install -g @xaheen-ai/cli',
			'Create your first project: xaheen project create my-app',
			'Navigate to your project: cd my-app',
			'Generate your first component: xaheen make:component Button',
			'Connect AI features: xaheen mcp connect',
			'Start development: npm run dev'
		];

		steps.forEach((step, index) => {
			cliLogger.info(`${chalk.cyan((index + 1).toString())}. ${step}`);
		});

		cliLogger.info(chalk.green('\n🎯 What you can do next:'));
		cliLogger.info('  • Explore tutorials: xaheen tutorials');
		cliLogger.info('  • Browse help: xaheen help --interactive');
		cliLogger.info('  • Check documentation: xaheen docs generate');

		await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
		return await this.showMainHelpMenu(session);
	}

	private async showTipsAndTricks(session: InteractiveHelpSession): Promise<void> {
		cliLogger.info(chalk.blue('\n💡 Xaheen CLI Tips and Best Practices\n'));

		const tips = [
			{
				category: '🚀 Productivity',
				items: [
					'Use command aliases for frequently used commands',
					'Enable AI features with --ai flag for smarter generation',
					'Use --dry-run to preview changes before applying them',
					'Leverage command history with up arrow or xaheen history'
				]
			},
			{
				category: '⚡ Performance',
				items: [
					'Use project templates for faster setup',
					'Cache dependencies with npm ci in production',
					'Use --parallel flag for concurrent operations',
					'Enable incremental builds in your CI/CD pipeline'
				]
			},
			{
				category: '🛡️ Security',
				items: [
					'Run security audits regularly: xaheen security audit',
					'Use environment variables for sensitive data',
					'Enable compliance reports: xaheen compliance report',
					'Keep dependencies updated with npm audit fix'
				]
			}
		];

		tips.forEach(tipCategory => {
			cliLogger.info(chalk.green(tipCategory.category));
			tipCategory.items.forEach(item => {
				cliLogger.info(`  • ${item}`);
			});
			cliLogger.info('');
		});

		await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
		return await this.showMainHelpMenu(session);
	}

	private async showTroubleshooting(session: InteractiveHelpSession): Promise<void> {
		cliLogger.info(chalk.blue('\n🔧 Common Issues and Solutions\n'));

		const issues = [
			{
				problem: 'Command not found error',
				solution: 'Make sure Xaheen CLI is installed globally: npm install -g @xaheen-ai/cli',
				code: 'npm list -g @xaheen-ai/cli'
			},
			{
				problem: 'Permission denied when creating files',
				solution: 'Check directory permissions and ensure you have write access',
				code: 'ls -la && pwd'
			},
			{
				problem: 'Template generation fails',
				solution: 'Clear template cache and try again',
				code: 'xaheen cache clear && xaheen make:component Button'
			},
			{
				problem: 'AI features not working',
				solution: 'Connect to MCP server and check your API keys',
				code: 'xaheen mcp connect --server https://api.xaheen.com'
			}
		];

		issues.forEach((issue, index) => {
			cliLogger.info(`${chalk.red((index + 1).toString())}. ${chalk.yellow('Problem:')} ${issue.problem}`);
			cliLogger.info(`   ${chalk.green('Solution:')} ${issue.solution}`);
			if (issue.code) {
				cliLogger.info(`   ${chalk.cyan('Try:')} ${issue.code}`);
			}
			cliLogger.info('');
		});

		cliLogger.info(chalk.blue('🆘 Still need help?'));
		cliLogger.info('  • Check GitHub issues: https://github.com/xaheen/cli/issues');
		cliLogger.info('  • Join our Discord: https://discord.gg/xaheen');
		cliLogger.info('  • Email support: support@xaheen-ai.com');

		await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
		return await this.showMainHelpMenu(session);
	}

	private async showCommandReference(session: InteractiveHelpSession): Promise<void> {
		const categories = Array.from(this.categories.keys());
		
		cliLogger.info(chalk.blue('\n📖 Command Reference\n'));

		categories.forEach(category => {
			const commands = this.categories.get(category) || [];
			cliLogger.info(chalk.green(`${category}:`));
			
			commands.forEach(command => {
				const helpContent = this.helpDatabase.get(command);
				if (helpContent) {
					cliLogger.info(`  ${chalk.cyan(command.padEnd(25))} ${chalk.gray(helpContent.description)}`);
				}
			});
			cliLogger.info('');
		});

		cliLogger.info(chalk.dim('💡 Use "xaheen help <command>" for detailed information about any command'));

		await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
		return await this.showMainHelpMenu(session);
	}

	private async showHelpSettings(session: InteractiveHelpSession): Promise<void> {
		const currentSettings = {
			userLevel: session.context.userLevel,
			preferredFormat: session.context.preferredFormat,
			language: session.context.language
		};

		cliLogger.info(chalk.blue('\n⚙️  Help System Settings\n'));
		cliLogger.info(`User Level: ${chalk.cyan(currentSettings.userLevel)}`);
		cliLogger.info(`Preferred Format: ${chalk.cyan(currentSettings.preferredFormat)}`);
		cliLogger.info(`Language: ${chalk.cyan(currentSettings.language)}`);

		const { changeSetting } = await inquirer.prompt([
			{
				type: 'list',
				name: 'changeSetting',
				message: 'What would you like to change?',
				choices: [
					{ name: 'User Level (affects detail level)', value: 'userLevel' },
					{ name: 'Preferred Format (brief/detailed/examples)', value: 'format' },
					{ name: 'Language (coming soon)', value: 'language' },
					{ name: chalk.gray('← Back to main menu'), value: 'back' }
				]
			}
		]);

		if (changeSetting === 'back') {
			return await this.showMainHelpMenu(session);
		}

		// Handle setting changes (simplified for now)
		cliLogger.info(chalk.yellow('Settings changes will be available in a future update!'));
		return await this.showMainHelpMenu(session);
	}

	private initializeHelpDatabase(): void {
		// Initialize comprehensive help content
		const helpEntries: Array<[string, HelpContent]> = [
			[
				'project:create',
				{
					title: 'Create New Project',
					description: 'Creates a new Xaheen project with the specified template and configuration.',
					usage: 'xaheen project create <project-name> [options]',
					examples: [
						'xaheen project create my-app',
						'xaheen project create my-api --template nestjs',
						'xaheen project create my-frontend --template react --features typescript,tailwind',
						'xaheen project create enterprise-app --template react --ai --norwegian'
					],
					options: [
						{
							flag: '--template <template>',
							description: 'Project template to use',
							defaultValue: 'react',
							type: 'string'
						},
						{
							flag: '--features <features>',
							description: 'Comma-separated list of features to include',
							type: 'string'
						},
						{
							flag: '--directory <dir>',
							description: 'Directory to create the project in',
							type: 'string'
						},
						{
							flag: '--ai',
							description: 'Enable AI-powered project setup',
							type: 'boolean'
						},
						{
							flag: '--norwegian',
							description: 'Enable Norwegian compliance features',
							type: 'boolean'
						}
					],
					relatedCommands: ['app:create', 'package:create', 'mcp:connect'],
					tips: [
						'Use --template to specify the project type (react, nestjs, vue, etc.)',
						'Add --features to include additional functionality like TypeScript, Tailwind CSS',
						'The project name should be in kebab-case for best practices',
						'Use --ai flag to get intelligent project setup recommendations',
						'Enable --norwegian for GDPR and Norwegian regulatory compliance'
					],
					warnings: [
						'Large projects may take several minutes to set up',
						'Ensure you have sufficient disk space (minimum 500MB recommended)'
					],
					troubleshooting: [
						{
							issue: 'Project creation fails with permission error',
							solution: 'Make sure you have write permissions to the target directory',
							code: 'sudo chmod 755 /path/to/directory'
						},
						{
							issue: 'Template not found error',
							solution: 'Use "xaheen templates list" to see available templates',
							code: 'xaheen templates list --category all'
						},
						{
							issue: 'NPM installation fails during setup',
							solution: 'Clear npm cache and try again',
							code: 'npm cache clean --force && xaheen project create my-app'
						}
					],
					workflows: [
						{
							name: 'Full Stack Setup',
							description: 'Create a complete full-stack application',
							steps: [
								'xaheen project create my-app --template react',
								'cd my-app',
								'xaheen make:model User',
								'xaheen make:component UserDashboard',
								'xaheen mcp connect'
							]
						}
					],
					shortcuts: [
						{
							keys: 'Ctrl+C',
							description: 'Cancel project creation'
						}
					]
				}
			],
			[
				'make:component',
				{
					title: 'Generate Component',
					description: 'Generates a new component with TypeScript, testing, and documentation.',
					usage: 'xaheen make:component <component-name> [options]',
					examples: [
						'xaheen make:component Button',
						'xaheen make:component UserCard --test --stories',
						'xaheen make:component NavBar --ai --description "Navigation bar with responsive design"',
						'xaheen make:component DataTable --features pagination,sorting,filtering',
						'xaheen make:component LoginForm --norwegian --accessibility AAA'
					],
					options: [
						{
							flag: '--ai',
							description: 'Enable AI-powered generation',
							type: 'boolean'
						},
						{
							flag: '--test',
							description: 'Generate test files',
							type: 'boolean'
						},
						{
							flag: '--stories',
							description: 'Generate Storybook stories',
							type: 'boolean'
						},
						{
							flag: '--description <desc>',
							description: 'Describe the component functionality',
							type: 'string'
						},
						{
							flag: '--features <features>',
							description: 'Comma-separated list of features to include',
							type: 'string'
						},
						{
							flag: '--accessibility <level>',
							description: 'Accessibility level (A/AA/AAA)',
							defaultValue: 'AAA',
							type: 'string'
						},
						{
							flag: '--norwegian',
							description: 'Enable Norwegian compliance',
							type: 'boolean'
						}
					],
					relatedCommands: ['make:page', 'make:layout', 'make:hook'],
					tips: [
						'Use PascalCase for component names (e.g., UserProfile)',
						'Add --ai flag for intelligent component generation based on description',
						'Include --test for comprehensive test coverage',
						'Use --stories to generate Storybook documentation',
						'Specify --features for advanced component functionality',
						'Always use --accessibility AAA for production components'
					],
					warnings: [
						'Component names must be unique within your project',
						'AI generation requires active MCP connection'
					],
					troubleshooting: [
						{
							issue: 'Component already exists error',
							solution: 'Use --force flag to overwrite existing files',
							code: 'xaheen make:component Button --force'
						},
						{
							issue: 'AI generation fails',
							solution: 'Check MCP connection and try again',
							code: 'xaheen mcp connect && xaheen make:component Button --ai'
						}
					],
					workflows: [
						{
							name: 'Complete Component Workflow',
							description: 'Generate a fully-featured component with all tooling',
							steps: [
								'xaheen make:component MyComponent --ai --description "Your description"',
								'xaheen make:component MyComponent --test --stories',
								'npm test MyComponent',
								'npm run storybook'
							]
						}
					],
					shortcuts: [
						{
							keys: 'mc',
							description: 'Alias for make:component'
						}
					]
				}
			],
			[
				'mcp:connect',
				{
					title: 'Connect to MCP Server',
					description: 'Connects to the Model Context Protocol server to enable AI-powered features.',
					usage: 'xaheen mcp connect [options]',
					examples: [
						'xaheen mcp connect',
						'xaheen mcp connect --server https://api.xaheen.com',
						'xaheen mcp connect --server localhost:3000 --development',
						'xaheen mcp connect --verify'
					],
					options: [
						{
							flag: '--server <url>',
							description: 'MCP server URL to connect to',
							defaultValue: 'https://api.xaheen.com',
							type: 'string'
						},
						{
							flag: '--development',
							description: 'Connect to development server',
							type: 'boolean'
						},
						{
							flag: '--verify',
							description: 'Verify connection status',
							type: 'boolean'
						},
						{
							flag: '--timeout <ms>',
							description: 'Connection timeout in milliseconds',
							defaultValue: '10000',
							type: 'number'
						}
					],
					relatedCommands: ['mcp:disconnect', 'mcp:status', 'ai:generate'],
					tips: [
						'Run this command first to enable AI features',
						'Use --development flag when working locally',
						'Connection is persistent across CLI sessions',
						'Verify connection with --verify flag if having issues'
					],
					warnings: [
						'AI features require internet connection',
						'Some features may require API authentication'
					],
					troubleshooting: [
						{
							issue: 'Connection timeout error',
							solution: 'Check your internet connection and try again',
							code: 'ping api.xaheen.com && xaheen mcp connect'
						},
						{
							issue: 'Authentication failed',
							solution: 'Ensure you have valid API credentials',
							code: 'xaheen auth login && xaheen mcp connect'
						}
					],
					workflows: [
						{
							name: 'AI Setup Workflow',
							description: 'Enable all AI features in your project',
							steps: [
								'xaheen mcp connect',
								'xaheen ai index',
								'xaheen make:component Example --ai',
								'xaheen ai suggestions'
							]
						}
					],
					shortcuts: []
				}
			]
		];

		helpEntries.forEach(([command, content]) => {
			this.helpDatabase.set(command, content);
		});
	}

	private initializeTutorials(): void {
		const tutorials: Tutorial[] = [
			{
				id: 'getting-started',
				title: 'Getting Started with Xaheen CLI',
				description: 'Learn the basics of Xaheen CLI and create your first project',
				difficulty: 'beginner',
				estimatedTime: '15 minutes',
				prerequisites: ['Node.js 18+', 'Git installed'],
				category: 'Getting Started',
				steps: [
					{
						title: 'Install Xaheen CLI',
						description: 'First, let\'s install the Xaheen CLI globally on your system.',
						command: 'npm install -g @xaheen-ai/cli',
						expectedOutput: 'Successfully installed @xaheen-ai/cli',
						tips: ['You may need to use sudo on macOS/Linux', 'Restart your terminal after installation']
					},
					{
						title: 'Create Your First Project',
						description: 'Now let\'s create a new React project with modern tooling.',
						command: 'xaheen project create my-first-app --template react --features typescript,tailwind',
						expectedOutput: 'Project created successfully!',
						tips: ['Choose a meaningful project name', 'TypeScript and Tailwind are recommended for new projects']
					},
					{
						title: 'Explore the Project Structure',
						description: 'Navigate to your project and explore the generated files.',
						command: 'cd my-first-app && ls -la',
						tips: ['Notice the clean project structure', 'All configuration files are pre-configured']
					},
					{
						title: 'Generate Your First Component',
						description: 'Let\'s create a reusable component with tests and stories.',
						command: 'xaheen make:component WelcomeCard --test --stories',
						expectedOutput: 'Component generated successfully!',
						tips: ['PascalCase is used for component names', 'Tests and stories help with documentation'],
						nextSteps: [
							'Try the AI-powered generation: xaheen make:component Button --ai',
							'Explore more templates: xaheen templates list',
							'Connect AI features: xaheen mcp connect'
						]
					}
				]
			},
			{
				id: 'ai-features',
				title: 'AI-Powered Development',
				description: 'Learn how to use Xaheen\'s AI features for faster development',
				difficulty: 'intermediate',
				estimatedTime: '20 minutes',
				prerequisites: ['Completed Getting Started tutorial', 'Internet connection'],
				category: 'AI Development',
				steps: [
					{
						title: 'Connect to AI Services',
						description: 'Enable AI features by connecting to the MCP server.',
						command: 'xaheen mcp connect',
						expectedOutput: 'Successfully connected to MCP server',
						tips: ['This enables intelligent code generation', 'Connection persists across sessions']
					},
					{
						title: 'AI-Powered Component Generation',
						description: 'Generate a component using AI with natural language description.',
						command: 'xaheen make:component ProductCard --ai --description "A card component that displays product information with image, title, price, and add to cart button"',
						expectedOutput: 'AI-generated component with smart defaults',
						tips: ['Be specific in your descriptions', 'AI considers best practices automatically']
					},
					{
						title: 'Intelligent Suggestions',
						description: 'Get contextual suggestions for your project.',
						command: 'xaheen mcp suggestions --category architecture',
						tips: ['Suggestions are based on your project structure', 'Consider implementing suggested improvements']
					}
				]
			},
			{
				id: 'full-stack-app',
				title: 'Building a Full-Stack Application',
				description: 'Create a complete application with frontend and backend',
				difficulty: 'advanced',
				estimatedTime: '45 minutes',
				prerequisites: ['Intermediate CLI knowledge', 'Database setup knowledge'],
				category: 'Full-Stack Development',
				steps: [
					{
						title: 'Create the Backend API',
						description: 'Set up a NestJS backend with database integration.',
						command: 'xaheen project create todo-api --template nestjs --features database,auth',
						tips: ['NestJS provides excellent TypeScript support', 'Authentication is pre-configured']
					},
					{
						title: 'Generate Data Models',
						description: 'Create database models for our todo application.',
						command: 'xaheen make:model Todo --migration --controller',
						tips: ['Migrations handle database schema changes', 'Controllers provide REST API endpoints']
					},
					{
						title: 'Create the Frontend',
						description: 'Build a React frontend that consumes the API.',
						command: 'xaheen project create todo-frontend --template react --features typescript,tailwind,api-client',
						tips: ['API client is pre-configured for the backend', 'Tailwind provides utility-first styling']
					},
					{
						title: 'Connect Frontend and Backend',
						description: 'Configure the frontend to communicate with the backend API.',
						command: 'xaheen make:service ApiClient --endpoint http://localhost:3001',
						tips: ['Environment variables manage different API endpoints', 'Type-safe API calls are generated automatically']
					}
				]
			}
		];

		tutorials.forEach(tutorial => {
			this.tutorials.set(tutorial.id, tutorial);
		});
	}

	private initializeCategories(): void {
		const categoryMap = new Map<string, string[]>();
		
		// Organize commands by category
		categoryMap.set('Project Management', [
			'project:create',
			'project:validate',
			'app:create',
			'package:create'
		]);
		
		categoryMap.set('Code Generation', [
			'make:component',
			'make:model',
			'make:service',
			'make:controller',
			'make:page',
			'make:layout'
		]);
		
		categoryMap.set('AI Features', [
			'mcp:connect',
			'mcp:disconnect',
			'mcp:generate',
			'mcp:suggestions',
			'ai:generate',
			'ai:code'
		]);
		
		categoryMap.set('Development Tools', [
			'docs:generate',
			'security:audit',
			'compliance:report',
			'templates:modernize'
		]);
		
		categoryMap.set('DevOps & Deployment', [
			'devops:docker',
			'devops:kubernetes',
			'devops:helm',
			'devops:github-actions'
		]);

		this.categories = categoryMap;
	}
}

export default ContextualHelpSystem;
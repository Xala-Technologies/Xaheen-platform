/**
 * Modern CLI Auto-Completion System
 * Provides intelligent command completion with contextual awareness
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { readFile, writeFile, existsSync } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Completion types
 */
export enum CompletionType {
	COMMAND = "command",
	OPTION = "option",
	ARGUMENT = "argument",
	FILE_PATH = "file_path",
	GENERATOR_NAME = "generator_name",
	PLATFORM = "platform",
	THEME = "theme",
}

/**
 * Completion suggestion schema
 */
const CompletionSuggestionSchema = z.object({
	value: z.string(),
	description: z.string(),
	type: z.nativeEnum(CompletionType),
	priority: z.number().min(0).max(100).default(50),
	insertText: z.string().optional(),
	detail: z.string().optional(),
	documentation: z.string().optional(),
	filterText: z.string().optional(),
	sortText: z.string().optional(),
	category: z.string().optional(),
	deprecated: z.boolean().default(false),
	metadata: z.record(z.any()).optional(),
});

export type CompletionSuggestion = z.infer<typeof CompletionSuggestionSchema>;

/**
 * Completion context
 */
export interface CompletionContext {
	readonly currentLine: string;
	readonly cursorPosition: number;
	readonly workingDirectory: string;
	readonly previousCommands: string[];
	readonly projectType?: string;
	readonly availableGenerators: string[];
	readonly recentFiles: string[];
	readonly environment: Record<string, string>;
}

/**
 * Completion options
 */
export interface CompletionOptions {
	readonly maxSuggestions?: number;
	readonly includeHidden?: boolean;
	readonly fuzzyMatch?: boolean;
	readonly contextAware?: boolean;
	readonly includeDescription?: boolean;
	readonly prioritizeRecent?: boolean;
	readonly caseSensitive?: boolean;
}

/**
 * Command signature for completion
 */
export interface CommandSignature {
	readonly name: string;
	readonly description: string;
	readonly options: Array<{
		readonly name: string;
		readonly alias?: string;
		readonly description: string;
		readonly type: 'string' | 'boolean' | 'number' | 'array';
		readonly required?: boolean;
		readonly choices?: string[];
		readonly default?: any;
	}>;
	readonly arguments: Array<{
		readonly name: string;
		readonly description: string;
		readonly type: 'string' | 'number' | 'file' | 'directory';
		readonly required?: boolean;
		readonly variadic?: boolean;
		readonly choices?: string[];
	}>;
	readonly examples: string[];
	readonly category: string;
}

/**
 * Modern CLI Auto-Completion System
 */
export class ModernCLICompletion extends EventEmitter {
	private readonly completionCachePath: string;
	private readonly commandSignatures: Map<string, CommandSignature> = new Map();
	private readonly recentCompletions: Map<string, number> = new Map();
	private readonly userPreferences: {
		maxSuggestions: number;
		fuzzyMatch: boolean;
		contextAware: boolean;
		prioritizeRecent: boolean;
	};

	constructor(projectPath: string, options: {
		readonly maxSuggestions?: number;
		readonly enableFuzzyMatch?: boolean;
		readonly enableContextAware?: boolean;
		readonly prioritizeRecent?: boolean;
	} = {}) {
		super();
		this.completionCachePath = join(projectPath, ".xaheen", "completion-cache.json");
		this.userPreferences = {
			maxSuggestions: options.maxSuggestions ?? 20,
			fuzzyMatch: options.enableFuzzyMatch ?? true,
			contextAware: options.enableContextAware ?? true,
			prioritizeRecent: options.prioritizeRecent ?? true,
		};
	}

	/**
	 * Initialize completion system
	 */
	public async initialize(): Promise<void> {
		try {
			await this.loadCompletionCache();
			await this.registerBuiltinCommands();
			
			logger.info("Modern CLI completion system initialized");
		} catch (error) {
			logger.error("Failed to initialize completion system:", error);
			throw error;
		}
	}

	/**
	 * Get completion suggestions
	 */
	public async getCompletions(
		context: CompletionContext,
		options: CompletionOptions = {},
	): Promise<CompletionSuggestion[]> {
		try {
			const mergedOptions = { ...this.userPreferences, ...options };
			const suggestions: CompletionSuggestion[] = [];

			const tokens = this.parseCommandLine(context.currentLine);
			const currentToken = this.getCurrentToken(tokens, context.cursorPosition);
			const completionType = this.determineCompletionType(tokens, currentToken);

			switch (completionType) {
				case CompletionType.COMMAND:
					suggestions.push(...await this.getCommandCompletions(currentToken, mergedOptions));
					break;
				case CompletionType.OPTION:
					suggestions.push(...await this.getOptionCompletions(tokens, currentToken, mergedOptions));
					break;
				case CompletionType.ARGUMENT:
					suggestions.push(...await this.getArgumentCompletions(tokens, currentToken, context, mergedOptions));
					break;
				case CompletionType.FILE_PATH:
					suggestions.push(...await this.getFilePathCompletions(currentToken, context, mergedOptions));
					break;
				case CompletionType.GENERATOR_NAME:
					suggestions.push(...await this.getGeneratorCompletions(currentToken, context, mergedOptions));
					break;
				case CompletionType.PLATFORM:
					suggestions.push(...this.getPlatformCompletions(currentToken, mergedOptions));
					break;
				case CompletionType.THEME:
					suggestions.push(...this.getThemeCompletions(currentToken, mergedOptions));
					break;
			}

			// Apply fuzzy matching
			const filteredSuggestions = mergedOptions.fuzzyMatch
				? this.applyFuzzyMatching(suggestions, currentToken.value)
				: this.applyExactMatching(suggestions, currentToken.value);

			// Sort suggestions
			const sortedSuggestions = this.sortSuggestions(filteredSuggestions, mergedOptions);

			// Limit results
			const limitedSuggestions = sortedSuggestions.slice(0, mergedOptions.maxSuggestions);

			// Update recent completions
			this.updateRecentCompletions(currentToken.value);

			return limitedSuggestions;
		} catch (error) {
			logger.error("Failed to get completions:", error);
			return [];
		}
	}

	/**
	 * Register command signature for completion
	 */
	public registerCommand(signature: CommandSignature): void {
		this.commandSignatures.set(signature.name, signature);
		logger.debug(`Registered command signature: ${signature.name}`);
	}

	/**
	 * Get command help with completion
	 */
	public async getCommandHelp(commandName: string): Promise<{
		readonly signature?: CommandSignature;
		readonly completions: CompletionSuggestion[];
		readonly examples: string[];
	}> {
		const signature = this.commandSignatures.get(commandName);
		const completions: CompletionSuggestion[] = [];

		if (signature) {
			// Add option completions
			for (const option of signature.options) {
				completions.push({
					value: `--${option.name}`,
					description: option.description,
					type: CompletionType.OPTION,
					priority: option.required ? 90 : 70,
					detail: `Type: ${option.type}${option.required ? ' (required)' : ''}`,
					documentation: option.choices ? `Choices: ${option.choices.join(', ')}` : undefined,
					category: 'Options',
				});

				if (option.alias) {
					completions.push({
						value: `-${option.alias}`,
						description: option.description,
						type: CompletionType.OPTION,
						priority: option.required ? 85 : 65,
						detail: `Alias for --${option.name}`,
						category: 'Options',
					});
				}
			}

			// Add argument completions
			for (const arg of signature.arguments) {
				completions.push({
					value: `<${arg.name}>`,
					description: arg.description,
					type: CompletionType.ARGUMENT,
					priority: arg.required ? 95 : 75,
					detail: `Type: ${arg.type}${arg.required ? ' (required)' : ''}`,
					documentation: arg.choices ? `Choices: ${arg.choices.join(', ')}` : undefined,
					category: 'Arguments',
				});
			}
		}

		return {
			signature,
			completions,
			examples: signature?.examples || [],
		};
	}

	/**
	 * Enable shell integration
	 */
	public async enableShellIntegration(shell: 'bash' | 'zsh' | 'fish' | 'powershell'): Promise<string> {
		const completionScript = this.generateShellCompletionScript(shell);
		
		const instructions = this.getShellIntegrationInstructions(shell);
		
		logger.info(`Generated ${shell} completion script`);
		return `${completionScript}\n\n${chalk.cyan('Integration Instructions:')}\n${instructions}`;
	}

	// Private methods

	private parseCommandLine(line: string): Array<{ value: string; start: number; end: number }> {
		const tokens: Array<{ value: string; start: number; end: number }> = [];
		let current = '';
		let start = 0;
		let inQuotes = false;
		let quoteChar = '';

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if ((char === '"' || char === "'") && !inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar && inQuotes) {
				inQuotes = false;
				quoteChar = '';
			} else if (char === ' ' && !inQuotes) {
				if (current) {
					tokens.push({ value: current, start, end: i });
					current = '';
				}
				// Skip whitespace
				while (i + 1 < line.length && line[i + 1] === ' ') i++;
				start = i + 1;
				continue;
			}

			current += char;
		}

		if (current) {
			tokens.push({ value: current, start, end: line.length });
		}

		return tokens;
	}

	private getCurrentToken(tokens: Array<{ value: string; start: number; end: number }>, cursorPosition: number): { value: string; start: number; end: number } {
		for (const token of tokens) {
			if (cursorPosition >= token.start && cursorPosition <= token.end) {
				return token;
			}
		}

		// If cursor is at the end, return empty token
		return { value: '', start: cursorPosition, end: cursorPosition };
	}

	private determineCompletionType(tokens: Array<{ value: string; start: number; end: number }>, currentToken: { value: string; start: number; end: number }): CompletionType {
		if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === currentToken)) {
			return CompletionType.COMMAND;
		}

		if (currentToken.value.startsWith('-')) {
			return CompletionType.OPTION;
		}

		const commandName = tokens[0]?.value;
		const signature = this.commandSignatures.get(commandName);

		if (signature) {
			const tokenIndex = tokens.indexOf(currentToken);
			
			// Check if we're completing an argument value for an option
			if (tokenIndex > 0) {
				const prevToken = tokens[tokenIndex - 1];
				if (prevToken.value.startsWith('-')) {
					const optionName = prevToken.value.replace(/^-+/, '');
					const option = signature.options.find(opt => 
						opt.name === optionName || opt.alias === optionName
					);
					
					if (option) {
						if (option.choices) {
							return CompletionType.ARGUMENT;
						}
						if (option.type === 'string' && (option.name.includes('file') || option.name.includes('path'))) {
							return CompletionType.FILE_PATH;
						}
					}
				}
			}

			// Determine based on command context
			if (commandName === 'generate' && tokenIndex === 1) {
				return CompletionType.GENERATOR_NAME;
			}
			if (currentToken.value.includes('/') || currentToken.value.includes('.')) {
				return CompletionType.FILE_PATH;
			}
		}

		return CompletionType.ARGUMENT;
	}

	private async getCommandCompletions(currentToken: { value: string; start: number; end: number }, options: CompletionOptions): Promise<CompletionSuggestion[]> {
		const suggestions: CompletionSuggestion[] = [];

		for (const [name, signature] of this.commandSignatures) {
			suggestions.push({
				value: name,
				description: signature.description,
				type: CompletionType.COMMAND,
				priority: 80,
				detail: `Category: ${signature.category}`,
				documentation: signature.examples.length > 0 ? `Example: ${signature.examples[0]}` : undefined,
				category: signature.category,
			});
		}

		return suggestions;
	}

	private async getOptionCompletions(tokens: Array<{ value: string; start: number; end: number }>, currentToken: { value: string; start: number; end: number }, options: CompletionOptions): Promise<CompletionSuggestion[]> {
		const suggestions: CompletionSuggestion[] = [];
		const commandName = tokens[0]?.value;
		const signature = this.commandSignatures.get(commandName);

		if (signature) {
			for (const option of signature.options) {
				const longOption = `--${option.name}`;
				const shortOption = option.alias ? `-${option.alias}` : null;

				suggestions.push({
					value: longOption,
					description: option.description,
					type: CompletionType.OPTION,
					priority: option.required ? 90 : 70,
					detail: `Type: ${option.type}${option.required ? ' (required)' : ''}`,
					documentation: option.choices ? `Choices: ${option.choices.join(', ')}` : undefined,
					category: 'Options',
				});

				if (shortOption) {
					suggestions.push({
						value: shortOption,
						description: option.description,
						type: CompletionType.OPTION,
						priority: option.required ? 85 : 65,
						detail: `Alias for ${longOption}`,
						category: 'Options',
					});
				}
			}
		}

		return suggestions;
	}

	private async getArgumentCompletions(tokens: Array<{ value: string; start: number; end: number }>, currentToken: { value: string; start: number; end: number }, context: CompletionContext, options: CompletionOptions): Promise<CompletionSuggestion[]> {
		const suggestions: CompletionSuggestion[] = [];
		const commandName = tokens[0]?.value;
		const signature = this.commandSignatures.get(commandName);

		if (signature) {
			const tokenIndex = tokens.indexOf(currentToken);
			
			// Check if previous token is an option that expects a value
			if (tokenIndex > 0) {
				const prevToken = tokens[tokenIndex - 1];
				if (prevToken.value.startsWith('-')) {
					const optionName = prevToken.value.replace(/^-+/, '');
					const option = signature.options.find(opt => 
						opt.name === optionName || opt.alias === optionName
					);
					
					if (option?.choices) {
						for (const choice of option.choices) {
							suggestions.push({
								value: choice,
								description: `${option.description} option`,
								type: CompletionType.ARGUMENT,
								priority: 85,
								category: 'Choices',
							});
						}
					}
				}
			}

			// Add argument completions based on position
			const argIndex = tokens.slice(1).filter(t => !t.value.startsWith('-')).indexOf(currentToken);
			if (argIndex >= 0 && argIndex < signature.arguments.length) {
				const argument = signature.arguments[argIndex];
				if (argument.choices) {
					for (const choice of argument.choices) {
						suggestions.push({
							value: choice,
							description: `${argument.description}`,
							type: CompletionType.ARGUMENT,
							priority: 90,
							category: 'Arguments',
						});
					}
				}
			}
		}

		return suggestions;
	}

	private async getFilePathCompletions(currentToken: { value: string; start: number; end: number }, context: CompletionContext, options: CompletionOptions): Promise<CompletionSuggestion[]> {
		const suggestions: CompletionSuggestion[] = [];
		
		// Add recent files
		for (const file of context.recentFiles.slice(0, 10)) {
			if (file.toLowerCase().includes(currentToken.value.toLowerCase())) {
				suggestions.push({
					value: file,
					description: 'Recent file',
					type: CompletionType.FILE_PATH,
					priority: 75,
					category: 'Recent Files',
				});
			}
		}

		// Add common paths
		const commonPaths = [
			'./src/',
			'./components/',
			'./pages/',
			'./lib/',
			'./utils/',
			'./styles/',
			'./public/',
			'./assets/',
		];

		for (const path of commonPaths) {
			if (path.toLowerCase().includes(currentToken.value.toLowerCase())) {
				suggestions.push({
					value: path,
					description: 'Common project path',
					type: CompletionType.FILE_PATH,
					priority: 60,
					category: 'Common Paths',
				});
			}
		}

		return suggestions;
	}

	private async getGeneratorCompletions(currentToken: { value: string; start: number; end: number }, context: CompletionContext, options: CompletionOptions): Promise<CompletionSuggestion[]> {
		const suggestions: CompletionSuggestion[] = [];

		for (const generator of context.availableGenerators) {
			suggestions.push({
				value: generator,
				description: `Generate ${generator}`,
				type: CompletionType.GENERATOR_NAME,
				priority: 80,
				category: 'Generators',
			});
		}

		return suggestions;
	}

	private getPlatformCompletions(currentToken: { value: string; start: number; end: number }, options: CompletionOptions): CompletionSuggestion[] {
		const platforms = [
			{ name: 'react', description: 'React.js framework' },
			{ name: 'nextjs', description: 'Next.js framework' },
			{ name: 'vue', description: 'Vue.js framework' },
			{ name: 'angular', description: 'Angular framework' },
			{ name: 'svelte', description: 'Svelte framework' },
			{ name: 'electron', description: 'Electron desktop apps' },
			{ name: 'react-native', description: 'React Native mobile apps' },
		];

		return platforms.map(platform => ({
			value: platform.name,
			description: platform.description,
			type: CompletionType.PLATFORM,
			priority: 80,
			category: 'Platforms',
		}));
	}

	private getThemeCompletions(currentToken: { value: string; start: number; end: number }, options: CompletionOptions): CompletionSuggestion[] {
		const themes = [
			{ name: 'enterprise', description: 'Enterprise business theme' },
			{ name: 'finance', description: 'Financial services theme' },
			{ name: 'healthcare', description: 'Healthcare industry theme' },
			{ name: 'education', description: 'Educational platform theme' },
			{ name: 'ecommerce', description: 'E-commerce theme' },
			{ name: 'productivity', description: 'Productivity tools theme' },
		];

		return themes.map(theme => ({
			value: theme.name,
			description: theme.description,
			type: CompletionType.THEME,
			priority: 70,
			category: 'Themes',
		}));
	}

	private applyFuzzyMatching(suggestions: CompletionSuggestion[], query: string): CompletionSuggestion[] {
		if (!query) return suggestions;

		const queryLower = query.toLowerCase();
		return suggestions.filter(suggestion => {
			const value = suggestion.value.toLowerCase();
			const filterText = (suggestion.filterText || suggestion.value).toLowerCase();
			
			// Exact match gets highest priority
			if (value.startsWith(queryLower) || filterText.startsWith(queryLower)) {
				suggestion.priority += 20;
				return true;
			}
			
			// Contains match
			if (value.includes(queryLower) || filterText.includes(queryLower)) {
				suggestion.priority += 10;
				return true;
			}
			
			// Fuzzy match (simple implementation)
			let queryIndex = 0;
			for (let i = 0; i < value.length && queryIndex < queryLower.length; i++) {
				if (value[i] === queryLower[queryIndex]) {
					queryIndex++;
				}
			}
			
			if (queryIndex === queryLower.length) {
				suggestion.priority += 5;
				return true;
			}
			
			return false;
		});
	}

	private applyExactMatching(suggestions: CompletionSuggestion[], query: string): CompletionSuggestion[] {
		if (!query) return suggestions;

		const queryLower = query.toLowerCase();
		return suggestions.filter(suggestion => {
			const value = suggestion.value.toLowerCase();
			const filterText = (suggestion.filterText || suggestion.value).toLowerCase();
			
			return value.startsWith(queryLower) || filterText.startsWith(queryLower);
		});
	}

	private sortSuggestions(suggestions: CompletionSuggestion[], options: CompletionOptions): CompletionSuggestion[] {
		return suggestions.sort((a, b) => {
			// Priority first
			if (a.priority !== b.priority) {
				return b.priority - a.priority;
			}
			
			// Recent usage if enabled
			if (options.prioritizeRecent) {
				const aRecent = this.recentCompletions.get(a.value) || 0;
				const bRecent = this.recentCompletions.get(b.value) || 0;
				if (aRecent !== bRecent) {
					return bRecent - aRecent;
				}
			}
			
			// Sort text if available
			if (a.sortText && b.sortText) {
				return a.sortText.localeCompare(b.sortText);
			}
			
			// Finally by value
			return a.value.localeCompare(b.value);
		});
	}

	private updateRecentCompletions(value: string): void {
		if (value) {
			const current = this.recentCompletions.get(value) || 0;
			this.recentCompletions.set(value, current + 1);
		}
	}

	private async loadCompletionCache(): Promise<void> {
		try {
			if (existsSync(this.completionCachePath)) {
				const content = await readFile(this.completionCachePath, 'utf8');
				const cache = JSON.parse(content);
				
				if (cache.recentCompletions) {
					for (const [key, value] of Object.entries(cache.recentCompletions)) {
						this.recentCompletions.set(key, value as number);
					}
				}
			}
		} catch (error) {
			logger.warn('Failed to load completion cache:', error);
		}
	}

	private async saveCompletionCache(): Promise<void> {
		try {
			const cache = {
				recentCompletions: Object.fromEntries(this.recentCompletions),
				lastUpdated: new Date().toISOString(),
			};
			
			await writeFile(this.completionCachePath, JSON.stringify(cache, null, 2));
		} catch (error) {
			logger.warn('Failed to save completion cache:', error);
		}
	}

	private generateShellCompletionScript(shell: 'bash' | 'zsh' | 'fish' | 'powershell'): string {
		switch (shell) {
			case 'bash':
				return `# Xaheen CLI Bash Completion
_xaheen_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    # Get completions from CLI
    local completions
    completions=$(xaheen --completion-bash "\${COMP_LINE}" "\${COMP_POINT}")
    
    COMPREPLY=( $(compgen -W "$completions" -- "$cur") )
    return 0
}

complete -F _xaheen_completion xaheen`;

			case 'zsh':
				return `# Xaheen CLI Zsh Completion
#compdef xaheen

_xaheen() {
    local context state line
    
    _arguments -C \\
        '*:: :->args' && return 0
    
    case $state in
        args)
            local completions
            completions=($(xaheen --completion-zsh "\${words[*]}" "\${CURSOR}"))
            _describe 'completions' completions
            ;;
    esac
}

_xaheen "$@"`;

			case 'fish':
				return `# Xaheen CLI Fish Completion
function __xaheen_complete
    set -l cmd (commandline -cp)
    set -l cursor (commandline -C)
    xaheen --completion-fish "$cmd" "$cursor" | string split '\n'
end

complete -c xaheen -f -a '(__xaheen_complete)'`;

			case 'powershell':
				return `# Xaheen CLI PowerShell Completion
Register-ArgumentCompleter -CommandName xaheen -ScriptBlock {
    param($commandName, $commandAst, $cursorPosition)
    
    $completions = & xaheen --completion-powershell $commandAst.ToString() $cursorPosition
    $completions | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}`;

			default:
				return '# Unsupported shell';
		}
	}

	private getShellIntegrationInstructions(shell: 'bash' | 'zsh' | 'fish' | 'powershell'): string {
		switch (shell) {
			case 'bash':
				return `1. Save the completion script to a file (e.g., ~/.xaheen-completion.bash)
2. Add this line to your ~/.bashrc or ~/.bash_profile:
   source ~/.xaheen-completion.bash
3. Restart your terminal or run: source ~/.bashrc`;

			case 'zsh':
				return `1. Save the completion script to your fpath (e.g., ~/.zsh/completions/_xaheen)
2. Add this line to your ~/.zshrc if not already present:
   fpath=(~/.zsh/completions $fpath)
3. Add this line to your ~/.zshrc:
   autoload -U compinit && compinit
4. Restart your terminal or run: source ~/.zshrc`;

			case 'fish':
				return `1. Save the completion script to ~/.config/fish/completions/xaheen.fish
2. Restart your terminal or run: fish_update_completions`;

			case 'powershell':
				return `1. Add the completion script to your PowerShell profile:
   notepad $PROFILE
2. Paste the script and save
3. Restart PowerShell or run: . $PROFILE`;

			default:
				return 'Please refer to your shell documentation for completion setup.';
		}
	}

	private async registerBuiltinCommands(): Promise<void> {
		// Register common Xaheen CLI commands
		const builtinCommands: CommandSignature[] = [
			{
				name: 'generate',
				description: 'Generate components, pages, or projects',
				category: 'Generation',
				options: [
					{
						name: 'platform',
						alias: 'p',
						description: 'Target platform',
						type: 'string',
						choices: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
					},
					{
						name: 'theme',
						alias: 't',
						description: 'Industry theme',
						type: 'string',
						choices: ['enterprise', 'finance', 'healthcare', 'education', 'ecommerce', 'productivity'],
					},
					{
						name: 'output',
						alias: 'o',
						description: 'Output directory',
						type: 'string',
					},
				],
				arguments: [
					{
						name: 'type',
						description: 'Type of generation (component, page, layout, etc.)',
						type: 'string',
						required: true,
						choices: ['component', 'page', 'layout', 'form', 'data-table', 'navigation'],
					},
					{
						name: 'name',
						description: 'Name of the generated item',
						type: 'string',
						required: true,
					},
				],
				examples: [
					'xaheen generate component Button --platform react',
					'xaheen generate page Dashboard --theme enterprise',
				],
			},
			{
				name: 'create',
				description: 'Create new projects or workspaces',
				category: 'Project',
				options: [
					{
						name: 'template',
						alias: 't',
						description: 'Project template',
						type: 'string',
						choices: ['web-app', 'mobile-app', 'desktop-app', 'library'],
					},
				],
				arguments: [
					{
						name: 'name',
						description: 'Project name',
						type: 'string',
						required: true,
					},
				],
				examples: [
					'xaheen create my-app --template web-app',
				],
			},
			{
				name: 'init',
				description: 'Initialize Xaheen CLI in existing project',
				category: 'Setup',
				options: [
					{
						name: 'force',
						alias: 'f',
						description: 'Force initialization',
						type: 'boolean',
					},
				],
				arguments: [],
				examples: [
					'xaheen init',
					'xaheen init --force',
				],
			},
		];

		for (const command of builtinCommands) {
			this.registerCommand(command);
		}
	}
}

/**
 * Default export
 */
export default ModernCLICompletion;
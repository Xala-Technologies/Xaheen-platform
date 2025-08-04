/**
 * Alias Manager Service
 * 
 * Manages command aliases and shortcuts for improved CLI usability.
 * Provides Laravel Artisan-style shortcuts and common abbreviations.
 */

import type { CLICommand, CLIDomain, CLIAction } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export interface CommandAlias {
  alias: string;
  originalCommand: string;
  domain: CLIDomain;
  action: CLIAction;
  description: string;
  example: string;
}

export interface ShortcutMapping {
  shortcut: string;
  fullCommand: string;
  description: string;
}

export class AliasManagerService {
  private aliases: Map<string, CommandAlias> = new Map();
  private shortcuts: Map<string, ShortcutMapping> = new Map();

  constructor() {
    this.initializeAliases();
    this.initializeShortcuts();
  }

  /**
   * Initialize command aliases
   */
  private initializeAliases(): void {
    const aliasDefinitions: CommandAlias[] = [
      // Laravel Artisan-style aliases
      {
        alias: 'm:m',
        originalCommand: 'make:model',
        domain: 'make',
        action: 'model',
        description: 'Create a new model (shortcut for make:model)',
        example: 'xaheen m:m User'
      },
      {
        alias: 'm:c',
        originalCommand: 'make:controller',
        domain: 'make',
        action: 'controller',
        description: 'Create a new controller (shortcut for make:controller)',
        example: 'xaheen m:c UserController'
      },
      {
        alias: 'm:comp',
        originalCommand: 'make:component',
        domain: 'make',
        action: 'component',
        description: 'Create a new component (shortcut for make:component)',
        example: 'xaheen m:comp Button'
      },
      {
        alias: 'm:s',
        originalCommand: 'make:service',
        domain: 'make',
        action: 'service',
        description: 'Create a new service (shortcut for make:service)',
        example: 'xaheen m:s UserService'
      },
      {
        alias: 'm:mig',
        originalCommand: 'make:migration',
        domain: 'make',
        action: 'migration',
        description: 'Create a new migration (shortcut for make:migration)',
        example: 'xaheen m:mig create_users_table'
      },

      // Project shortcuts
      {
        alias: 'new',
        originalCommand: 'project create',
        domain: 'project',
        action: 'create',
        description: 'Create a new project (shortcut for project create)',
        example: 'xaheen new my-app'
      },
      {
        alias: 'init',
        originalCommand: 'project create',
        domain: 'project',
        action: 'create',
        description: 'Initialize a new project (alias for project create)',
        example: 'xaheen init my-app'
      },

      // MCP shortcuts
      {
        alias: 'ai',
        originalCommand: 'mcp connect',
        domain: 'mcp',
        action: 'create',
        description: 'Connect to AI services (shortcut for mcp connect)',
        example: 'xaheen ai'
      },
      {
        alias: 'analyze',
        originalCommand: 'mcp analyze',
        domain: 'mcp',
        action: 'analyze',
        description: 'Analyze codebase with AI (shortcut for mcp analyze)',
        example: 'xaheen analyze'
      },
      {
        alias: 'suggest',
        originalCommand: 'mcp suggestions',
        domain: 'mcp',
        action: 'analyze',
        description: 'Get AI suggestions (shortcut for mcp suggestions)',
        example: 'xaheen suggest'
      },

      // Service shortcuts
      {
        alias: 'add',
        originalCommand: 'service add',
        domain: 'service',
        action: 'add',
        description: 'Add a service (shortcut for service add)',
        example: 'xaheen add auth'
      },

      // Build shortcuts
      {
        alias: 'build',
        originalCommand: 'build',
        domain: 'build',
        action: 'create',
        description: 'Build the project (shortcut)',
        example: 'xaheen build'
      },

      // Common development shortcuts
      {
        alias: 'g',
        originalCommand: 'generate',
        domain: 'component',
        action: 'generate',
        description: 'Generate components (shortcut for generate)',
        example: 'xaheen g component Button'
      },
      {
        alias: 'scaffold',
        originalCommand: 'make:crud',
        domain: 'make',
        action: 'crud',
        description: 'Scaffold CRUD operations (shortcut for make:crud)',
        example: 'xaheen scaffold User'
      }
    ];

    // Register all aliases
    aliasDefinitions.forEach(alias => {
      this.aliases.set(alias.alias, alias);
    });

    logger.debug(`Registered ${aliasDefinitions.length} command aliases`);
  }

  /**
   * Initialize keyboard shortcuts and abbreviations
   */
  private initializeShortcuts(): void {
    const shortcutDefinitions: ShortcutMapping[] = [
      // Flag shortcuts
      { shortcut: '-m', fullCommand: '--migration', description: 'Create migration' },
      { shortcut: '-c', fullCommand: '--controller', description: 'Create controller' },
      { shortcut: '-r', fullCommand: '--resource', description: 'Resource controller' },
      { shortcut: '-f', fullCommand: '--factory', description: 'Create factory' },
      { shortcut: '-s', fullCommand: '--seeder', description: 'Create seeder' },
      { shortcut: '-a', fullCommand: '--all', description: 'Create all related files' },
      { shortcut: '-t', fullCommand: '--test', description: 'Generate tests' },
      { shortcut: '-v', fullCommand: '--verbose', description: 'Verbose output' },
      { shortcut: '-h', fullCommand: '--help', description: 'Show help' },
      { shortcut: '-y', fullCommand: '--yes', description: 'Auto-confirm prompts' },
      { shortcut: '-n', fullCommand: '--no', description: 'Auto-decline prompts' },

      // AI shortcuts
      { shortcut: '--ai', fullCommand: '--ai --description', description: 'AI generation with description prompt' },
      
      // Platform shortcuts
      { shortcut: '--react', fullCommand: '--platform react', description: 'Target React platform' },
      { shortcut: '--vue', fullCommand: '--platform vue', description: 'Target Vue platform' },
      { shortcut: '--angular', fullCommand: '--platform angular', description: 'Target Angular platform' },
      { shortcut: '--next', fullCommand: '--platform nextjs', description: 'Target Next.js platform' },

      // Quality shortcuts
      { shortcut: '--aaa', fullCommand: '--accessibility AAA', description: 'WCAG AAA accessibility' },
      { shortcut: '--no', fullCommand: '--norwegian', description: 'Norwegian compliance' },
      { shortcut: '--gdpr', fullCommand: '--gdpr', description: 'GDPR compliance' }
    ];

    // Register all shortcuts
    shortcutDefinitions.forEach(shortcut => {
      this.shortcuts.set(shortcut.shortcut, shortcut);
    });

    logger.debug(`Registered ${shortcutDefinitions.length} keyboard shortcuts`);
  }

  /**
   * Resolve alias to original command
   */
  public resolveAlias(aliasCommand: string): { domain: CLIDomain; action: CLIAction; originalCommand: string } | null {
    const alias = this.aliases.get(aliasCommand);
    if (!alias) {
      return null;
    }

    return {
      domain: alias.domain,
      action: alias.action,
      originalCommand: alias.originalCommand
    };
  }

  /**
   * Expand shortcuts in command arguments
   */
  public expandShortcuts(args: string[]): string[] {
    return args.map(arg => {
      const shortcut = this.shortcuts.get(arg);
      return shortcut ? shortcut.fullCommand : arg;
    });
  }

  /**
   * Parse aliased command into proper CLI command structure
   */
  public parseAliasedCommand(input: string[]): CLICommand | null {
    if (input.length === 0) {
      return null;
    }

    const [command, ...args] = input;
    const alias = this.resolveAlias(command);

    if (!alias) {
      return null;
    }

    // Expand shortcuts in arguments
    const expandedArgs = this.expandShortcuts(args);

    // Parse target and options from expanded arguments
    const target = expandedArgs.find(arg => typeof arg === 'string' && !arg.startsWith('-'));
    const options: Record<string, any> = {};

    // Parse options
    for (let i = 0; i < expandedArgs.length; i++) {
      const arg = expandedArgs[i];
      if (typeof arg === 'string' && arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        if (value) {
          options[key] = value;
        } else {
          // Check if next argument is the value
          const nextArg = expandedArgs[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            options[key] = nextArg;
            i++; // Skip next argument
          } else {
            options[key] = true;
          }
        }
      } else if (typeof arg === 'string' && arg.startsWith('-') && arg.length === 2) {
        options[arg.substring(1)] = true;
      }
    }

    return {
      domain: alias.domain,
      action: alias.action,
      target: target?.replace(/^-+/, ''), // Remove leading dashes if any
      options
    };
  }

  /**
   * Get all available aliases
   */
  public getAllAliases(): CommandAlias[] {
    return Array.from(this.aliases.values());
  }

  /**
   * Get all available shortcuts
   */
  public getAllShortcuts(): ShortcutMapping[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Check if a command is an alias
   */
  public isAlias(command: string): boolean {
    return this.aliases.has(command);
  }

  /**
   * Get alias suggestions for partial input
   */
  public getSuggestions(partial: string): CommandAlias[] {
    return Array.from(this.aliases.values()).filter(alias => 
      alias.alias.startsWith(partial) || 
      alias.originalCommand.includes(partial) ||
      alias.description.toLowerCase().includes(partial.toLowerCase())
    );
  }

  /**
   * Register a new alias
   */
  public registerAlias(alias: CommandAlias): void {
    this.aliases.set(alias.alias, alias);
    logger.debug(`Registered new alias: ${alias.alias} -> ${alias.originalCommand}`);
  }

  /**
   * Remove an alias
   */
  public removeAlias(aliasName: string): boolean {
    const existed = this.aliases.has(aliasName);
    this.aliases.delete(aliasName);
    if (existed) {
      logger.debug(`Removed alias: ${aliasName}`);
    }
    return existed;
  }

  /**
   * Get help text for aliases
   */
  public getAliasHelp(): string {
    const aliases = this.getAllAliases();
    const shortcuts = this.getAllShortcuts();

    let help = '\n📋 Available Command Aliases:\n\n';
    
    // Group aliases by category
    const categories = {
      'Make Commands': aliases.filter(a => a.domain === 'make'),
      'Project Commands': aliases.filter(a => a.domain === 'project'),
      'AI Commands': aliases.filter(a => a.domain === 'mcp'),
      'Other Commands': aliases.filter(a => !['make', 'project', 'mcp'].includes(a.domain))
    };

    for (const [category, categoryAliases] of Object.entries(categories)) {
      if (categoryAliases.length > 0) {
        help += `${category}:\n`;
        categoryAliases.forEach(alias => {
          help += `  ${alias.alias.padEnd(12)} → ${alias.originalCommand.padEnd(20)} ${alias.description}\n`;
          help += `  ${''.padEnd(12)}   Example: ${alias.example}\n\n`;
        });
      }
    }

    help += '\n⌨️  Keyboard Shortcuts:\n\n';
    shortcuts.forEach(shortcut => {
      help += `  ${shortcut.shortcut.padEnd(12)} → ${shortcut.fullCommand.padEnd(25)} ${shortcut.description}\n`;
    });

    help += '\n💡 Usage Tips:\n';
    help += '  • Combine aliases with shortcuts: xaheen m:m User -mcf\n';
    help += '  • Use shortcuts for common flags: xaheen new app --react --aaa\n';
    help += '  • Chain multiple shortcuts: xaheen m:c UserController -r --ai\n';

    return help;
  }

  /**
   * Validate alias format
   */
  private validateAlias(alias: CommandAlias): boolean {
    return !!(
      alias.alias &&
      alias.originalCommand &&
      alias.domain &&
      alias.action &&
      alias.description &&
      alias.example
    );
  }
}
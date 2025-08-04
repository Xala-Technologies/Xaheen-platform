import { Command } from 'commander';
import { logger } from '../utils/logger.js';

// Command interface for all commands
export interface CommandInterface {
  readonly name: string;
  readonly description: string;
  readonly alias?: string;
  execute: (options: any) => Promise<void>;
}

// Command metadata for registration
export interface CommandMetadata {
  readonly name: string;
  readonly description: string;
  readonly alias?: string;
  readonly options?: ReadonlyArray<{
    readonly flags: string;
    readonly description: string;
    readonly defaultValue?: any;
  }>;
  readonly arguments?: ReadonlyArray<{
    readonly name: string;
    readonly description: string;
    readonly required?: boolean;
  }>;
  readonly subcommands?: ReadonlyArray<{
    readonly name: string;
    readonly description: string;
    readonly action: (...args: any[]) => Promise<void>;
  }>;
  readonly action?: (...args: any[]) => Promise<void>;
}

// Map of registered commands
const commandRegistry = new Map<string, CommandMetadata>();

// Register a command
export function registerCommand(metadata: CommandMetadata): void {
  if (commandRegistry.has(metadata.name)) {
    logger.warn(`Command "${metadata.name}" is already registered. Overwriting...`);
  }
  commandRegistry.set(metadata.name, metadata);
  logger.debug(`Registered command: ${metadata.name}`);
}

// Register all commands with the program
export async function registerCommands(program: Command): Promise<void> {
  logger.debug('Loading commands...');
  
  try {
    // Core commands
    await loadCommand('./init.js', 'initCommand');
    await loadCommand('./create.js', 'createCommand');
    await loadCommand('./install.js', 'install');
    await loadCommand('./migrate.js', 'migrate');
    await loadCommand('./check.js', 'check');
    await loadCommand('./cva-check.js', 'cvaCheckCommand');
    
    // Token management commands
    await loadCommand('./tokens.js', 'tokensCommand');
    
    // Theme management commands  
    await loadCommand('./themes.js', 'themesCommand');
    
    // Component management commands
    await loadCommand('./components.js', 'componentsCommand');
    
    // AI-powered commands
    await loadCommand('./ai.js', 'aiCommand');
    
    // Build and deployment commands
    await loadCommand('./build.js', 'buildCommand');
    await loadCommand('./deploy.js', 'deployCommand');
    await loadCommand('./sync.js', 'syncCommand');
    
    // Developer tools
    await loadCommand('./dev.js', 'devCommand');
    await loadCommand('./preview.js', 'previewCommand');
    await loadCommand('./analyze.js', 'analyzeCommand');
    
    // Documentation and help
    await loadCommand('./docs.js', 'docsCommand');
    await loadCommand('./examples.js', 'examplesCommand');
    
    // Configuration
    await loadCommand('./config.js', 'configCommand');
    
    // External tool integrations
    await loadCommand('../integrations/xaheen-bridge.js', 'xaheenIntegrationCommand');
    
  } catch (error) {
    logger.error('Failed to load commands:', error);
  }
  
  // Register loaded commands with Commander
  for (const [name, metadata] of commandRegistry) {
    const command = program.command(name);
    
    if (metadata.alias) {
      command.alias(metadata.alias);
    }
    
    command.description(metadata.description);
    
    // Add arguments
    if (metadata.arguments) {
      for (const arg of metadata.arguments) {
        const argString = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        command.argument(argString, arg.description);
      }
    }
    
    // Add options
    if (metadata.options) {
      for (const option of metadata.options) {
        command.option(option.flags, option.description, option.defaultValue);
      }
    }
    
    // Set action handler
    command.action(async (...args) => {
      try {
        await metadata.action?.(...args);
      } catch (error) {
        logger.error(`Command "${name}" failed:`, error);
        process.exit(1);
      }
    });
  }
  
  logger.debug(`Registered ${commandRegistry.size} commands`);
}

// Helper function to load individual commands
async function loadCommand(modulePath: string, exportName: string): Promise<void> {
  try {
    const module = await import(modulePath);
    const command = module[exportName] || module.default;
    
    if (command) {
      if (typeof command.register === 'function') {
        // For commands with custom registration
        command.register(registerCommand);
      } else if (typeof command === 'object' && command.name) {
        // For standard command metadata
        registerCommand(command);
      }
    }
  } catch (error) {
    logger.debug(`Failed to load command from ${modulePath}:`, error);
  }
}

// Command validation helper
export function validateCommand(name: string): boolean {
  return commandRegistry.has(name);
}

// Get command suggestions for typos
export function getCommandSuggestions(input: string): ReadonlyArray<string> {
  const commands = Array.from(commandRegistry.keys());
  const suggestions: Array<{ readonly command: string; readonly distance: number }> = [];
  
  for (const command of commands) {
    const distance = levenshteinDistance(input.toLowerCase(), command.toLowerCase());
    if (distance <= 2) {
      suggestions.push({ command, distance });
    }
  }
  
  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .map(s => s.command)
    .slice(0, 3);
}

// Levenshtein distance for command suggestions
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }
  
  return matrix[b.length]![a.length]!;
}
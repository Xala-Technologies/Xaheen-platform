#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { createRequire } from 'module';
import { registerCommands } from './commands/index.js';
import { displayBanner } from './utils/banner.js';
import { handleError, getExitCode } from './utils/errors.js';
import { logger } from './utils/logger.js';
import { configureGlobalOptions } from './utils/options.js';

const require = createRequire(import.meta.url);
const { version, description } = require('../package.json');

// Create main program instance
export const program = new Command();

// Configure program metadata
program
  .name('xala-scaffold')
  .description(description)
  .version(version, '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help for command');

// Configure global options
configureGlobalOptions(program);

// Setup error handling
process.on('uncaughtException', (error) => {
  handleError(error, getExitCode(error));
});

process.on('unhandledRejection', (error) => {
  handleError(error, getExitCode(error));
});

// Add custom help text with examples
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.alias(),
});

// Display banner before help text
if (process.stdout.isTTY && !process.argv.includes('--no-banner') && process.argv.includes('--help')) {
  // Banner will be displayed in the main execution
}

program.addHelpText('before', '\n');

program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('# Initialize a new Next.js SaaS project')}
  $ xala-scaffold init --platform nextjs --template saas

  ${chalk.gray('# Migrate a project')}
  $ xala-scaffold migrate --from platform --source ./my-project

  ${chalk.gray('# Generate a new component')}
  $ xala-scaffold generate component UserCard --props "name,email,avatar?"

  ${chalk.gray('# Generate a complete feature module')}
  $ xala-scaffold generate feature user-management

${chalk.bold('Documentation:')}
  ${chalk.cyan('https://github.com/xala-technologies/ui-system/docs/scaffolding')}
`);

// Register all commands
registerCommands(program);

// Add command middleware for logging and analytics
program.hook('preAction', (thisCommand, actionCommand) => {
  const commandPath = [];
  let cmd: Command | null = actionCommand;

  while (cmd) {
    commandPath.unshift(cmd.name());
    cmd = cmd.parent as Command | null;
  }

  logger.debug(`Executing command: ${commandPath.join(' ')}`);

  // Analytics placeholder
  // TODO: Implement telemetry if enabled
});

program.hook('postAction', (thisCommand, actionCommand) => {
  logger.debug('Command completed successfully');
});

// Main execution function
export async function run(): Promise<void> {
  try {
    // Display banner for help command
    if (process.stdout.isTTY && !process.argv.includes('--no-banner') && 
        (process.argv.includes('--help') || process.argv.includes('-h') || process.argv.length === 2)) {
      await displayBanner();
    }
    
    await registerCommands(program);
    await program.parseAsync(process.argv);
    
    // Show help if no command provided
    if (!process.argv.slice(2).length) {
      program.help();
    }
  } catch (error) {
    handleError(error, getExitCode(error));
  }
}

// Parse and execute if running as main module
if (import.meta.url.startsWith('file:')) {
  run();
}
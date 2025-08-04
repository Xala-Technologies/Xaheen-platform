#!/usr/bin/env node

import { UnifiedCommandParser } from './core/command-parser/index.js';
import { UnifiedConfigManager } from './core/config-manager/index.js';
import { UnifiedServiceRegistry } from './core/registry/UnifiedServiceRegistry.js';
import { StackAdapterRegistry } from './core/stack-adapters/index.js';
import { logger, cliLogger } from './utils/logger.js';
import { CLIError } from './types/index.js';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

async function main(): Promise<void> {
  const startTime = performance.now();
  
  try {
    // Display banner
    displayBanner();
    
    // Initialize core systems
    logger.debug('Initializing Unified CLI...');
    
    // Initialize configuration manager
    const configManager = new UnifiedConfigManager();
    
    // Initialize service registry
    const registry = new UnifiedServiceRegistry();
    await registry.initialize();
    
    // Initialize stack adapter registry
    const stackRegistry = StackAdapterRegistry.getInstance();
    const detectedStack = await stackRegistry.detectStack();
    logger.debug(`Detected stack: ${detectedStack}`);
    
    // Initialize command parser
    const commandParser = new UnifiedCommandParser();
    
    // Make core systems available globally for domain handlers
    global.__xaheen_cli = {
      configManager,
      registry,
      commandParser,
      stackRegistry
    };
    
    // Parse and execute command
    await commandParser.parse(process.argv);
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logger.debug(`Command completed in ${duration}ms`);
    
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    if (error instanceof CLIError) {
      cliLogger.error(`${error.message} (${duration}ms)`);
      if (error.code === 'COMMAND_NOT_FOUND') {
        cliLogger.info('Run `xaheen --help` to see available commands');
      }
      process.exit(1);
    } else if (error instanceof Error) {
      cliLogger.error(`Unexpected error: ${error.message} (${duration}ms)`);
      logger.debug('Stack trace:', error.stack);
      process.exit(1);
    } else {
      cliLogger.error(`Unknown error occurred (${duration}ms)`);
      process.exit(1);
    }
  }
}

function displayBanner(): void {
  if (process.env.XAHEEN_NO_BANNER === 'true') return;
  
  const version = '3.0.0-alpha.1';
  const banner = `
${chalk.cyan('╭─────────────────────────────────────────────────────────────╮')}
${chalk.cyan('│')}  ${chalk.bold.white('Xaheen Unified CLI')} ${chalk.gray(`v${version}`)}                            ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.gray('Service-based architecture + AI-powered components')}     ${chalk.cyan('│')}
${chalk.cyan('│')}                                                             ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.green('✓')} Service injection & management                        ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.green('✓')} AI-powered component generation                       ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.green('✓')} Multi-platform support (web, mobile, desktop)        ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.green('✓')} Monorepo-ready with apps & packages                  ${chalk.cyan('│')}
${chalk.cyan('│')}  ${chalk.green('✓')} Norwegian compliance & WCAG AAA accessibility        ${chalk.cyan('│')}
${chalk.cyan('╰─────────────────────────────────────────────────────────────╯')}
`;
  
  console.log(banner);
}

// Global CLI context interface
declare global {
  var __xaheen_cli: {
    configManager: UnifiedConfigManager;
    registry: UnifiedServiceRegistry;
    commandParser: UnifiedCommandParser;
    stackRegistry: StackAdapterRegistry;
  };
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  cliLogger.info('CLI interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  cliLogger.info('CLI terminated');
  process.exit(0);
});

// Start the CLI
main().catch((error) => {
  cliLogger.error('Failed to start CLI:', error);
  process.exit(1);
});
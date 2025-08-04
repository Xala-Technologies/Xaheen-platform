import consola from 'consola';
import chalk from 'chalk';

// Create a custom logger instance
export const logger = consola.create({
  level: process.env.NODE_ENV === 'development' ? 4 : 3, // Debug level in dev, info in prod
  formatOptions: {
    colors: true,
    compact: false,
  },
});

// Enhanced logging methods with CLI-specific formatting
export const cliLogger = {
  success: (message: string, details?: any) => {
    logger.success(chalk.green(`✓ ${message}`), details);
  },
  
  error: (message: string, error?: any) => {
    logger.error(chalk.red(`✗ ${message}`), error);
  },
  
  warn: (message: string, details?: any) => {
    logger.warn(chalk.yellow(`⚠ ${message}`), details);
  },
  
  info: (message: string, details?: any) => {
    logger.info(chalk.blue(`ℹ ${message}`), details);
  },
  
  debug: (message: string, details?: any) => {
    logger.debug(chalk.gray(`🐛 ${message}`), details);
  },
  
  step: (step: number, total: number, message: string) => {
    logger.info(chalk.cyan(`[${step}/${total}] ${message}`));
  },
  
  command: (command: string) => {
    logger.info(chalk.magenta(`$ ${command}`));
  },
  
  legacy: (oldCommand: string, newCommand: string) => {
    logger.warn(
      chalk.yellow(`⚠ Legacy command detected: '${oldCommand}'`)
    );
    logger.info(
      chalk.blue(`ℹ Consider using: '${newCommand}'`)
    );
  },
  
  migration: (from: string, to: string) => {
    logger.info(
      chalk.blue(`🔄 Migrating from ${from} to ${to}`)
    );
  },
  
  ai: (message: string) => {
    logger.info(chalk.magenta(`🤖 AI: ${message}`));
  },
  
  plugin: (plugin: string, message: string) => {
    logger.info(chalk.green(`🔌 ${plugin}: ${message}`));
  }
};

// Set up global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default logger;
import chalk from 'chalk';
import ora from 'ora';
import { CommandMetadata } from './index.js';
import { logger } from '../utils/logger.js';
import { TokenManager } from '../services/token-manager.js';
import { ValidationError } from '../utils/errors.js';

export interface TokenOptions {
  readonly platform?: string;
  readonly output?: string;
  readonly format?: string;
  readonly watch?: boolean;
  readonly validate?: boolean;
}

export const tokensCommand: CommandMetadata = {
  name: 'tokens',
  description: 'Design token management and transformation',
  options: [
    {
      flags: '--platform <platform>',
      description: 'Target platform for token generation',
      defaultValue: 'all'
    },
    {
      flags: '--output <path>',
      description: 'Output directory for generated tokens',
      defaultValue: './src/tokens'
    },
    {
      flags: '--format <format>',
      description: 'Output format (css|scss|js|ts|json|tailwind)',
      defaultValue: 'ts'
    },
    {
      flags: '--watch',
      description: 'Watch for changes and regenerate',
      defaultValue: false
    },
    {
      flags: '--validate',
      description: 'Validate token definitions',
      defaultValue: true
    }
  ],
  action: async (options: TokenOptions = {}) => {
    try {
      const subcommand = process.argv[3];
      
      switch (subcommand) {
        case 'generate':
          return await handleGenerateTokens(options);
        case 'validate':
          return await handleValidateTokens(options);
        case 'sync':
          return await handleSyncTokens(options);
        case 'transform':
          return await handleTransformTokens(options);
        case 'watch':
          return await handleWatchTokens(options);
        default:
          return await showTokensHelp();
      }
    } catch (error) {
      logger.error('Tokens command failed:', error);
      throw error;
    }
  }
};

async function handleGenerateTokens(options: TokenOptions): Promise<void> {
  logger.info('Generating design tokens...');
  
  const tokenManager = new TokenManager();
  const spinner = ora('Generating tokens for all platforms...').start();
  
  try {
    const results = await tokenManager.generate({
      platform: options.platform || 'all',
      outputDir: options.output || './src/tokens',
      format: options.format || 'ts',
      validate: options.validate !== false
    });
    
    spinner.succeed('Tokens generated successfully');
    
    console.log(chalk.bold('\n🎨 Generated Token Files:'));
    results.forEach(result => {
      console.log(`  ${chalk.cyan(result.platform)}: ${result.filePath}`);
      console.log(`    Format: ${chalk.dim(result.format)}`);
      console.log(`    Tokens: ${chalk.dim(result.tokenCount)} tokens`);
      console.log(`    Size: ${chalk.dim(result.fileSize)}`);
      console.log();
    });
    
    console.log(chalk.bold('📝 Usage:'));
    console.log(`  Import tokens: ${chalk.cyan('import { tokens } from "./src/tokens"')}`);
    console.log(`  Use in components: ${chalk.cyan('tokens.colors.primary.500')}`);
    
  } catch (error) {
    spinner.fail('Token generation failed');
    throw error;
  }
}

async function handleValidateTokens(options: TokenOptions): Promise<void> {
  logger.info('Validating design tokens...');
  
  const tokenManager = new TokenManager();
  const spinner = ora('Validating token definitions...').start();
  
  try {
    const validation = await tokenManager.validate({
      sourceDir: './tokens',
      strict: true,
      checkReferences: true,
      checkNaming: true
    });
    
    if (validation.isValid) {
      spinner.succeed('All tokens are valid');
      console.log(chalk.green(`✅ ${validation.tokenCount} tokens validated successfully`));
    } else {
      spinner.fail('Token validation failed');
      
      console.log(chalk.red('\n❌ Validation Errors:'));
      validation.errors.forEach(error => {
        console.log(`  • ${error.message} (${error.file}:${error.line})`);
      });
      
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        validation.warnings.forEach(warning => {
          console.log(`  • ${warning.message} (${warning.file}:${warning.line})`);
        });
      }
    }
    
  } catch (error) {
    spinner.fail('Token validation failed');
    throw error;
  }
}

async function handleSyncTokens(options: TokenOptions): Promise<void> {
  const platform = process.argv[4];
  
  if (!platform) {
    throw new ValidationError('Platform is required. Example: xala tokens sync react');
  }
  
  logger.info(`Syncing tokens for ${platform}...`);
  
  const tokenManager = new TokenManager();
  const spinner = ora('Synchronizing tokens...').start();
  
  try {
    await tokenManager.sync({
      platform,
      sourceDir: './tokens',
      outputDir: options.output || './src/tokens',
      format: options.format || 'ts'
    });
    
    spinner.succeed(`Tokens synchronized for ${platform}`);
    
    console.log(chalk.bold('\n🔄 Sync Results:'));
    console.log(`  Platform: ${chalk.cyan(platform)}`);
    console.log(`  Updated token files in: ${chalk.cyan(options.output || './src/tokens')}`);
    console.log(`  Format: ${chalk.cyan(options.format || 'ts')}`);
    
  } catch (error) {
    spinner.fail('Token synchronization failed');
    throw error;
  }
}

async function handleTransformTokens(options: TokenOptions): Promise<void> {
  const targetFormat = process.argv[4];
  
  if (!targetFormat) {
    throw new ValidationError('Target format is required. Example: xala tokens transform css');
  }
  
  logger.info(`Transforming tokens to ${targetFormat} format...`);
  
  const tokenManager = new TokenManager();
  const spinner = ora('Transforming token formats...').start();
  
  try {
    const results = await tokenManager.transform({
      sourceDir: './tokens',
      outputDir: options.output || './src/tokens',
      targetFormat,
      platform: options.platform || 'all'
    });
    
    spinner.succeed('Token transformation completed');
    
    console.log(chalk.bold('\n🔄 Transformation Results:'));
    results.forEach(result => {
      console.log(`  ${chalk.cyan(result.sourceFormat)} → ${chalk.cyan(result.targetFormat)}`);
      console.log(`    Output: ${chalk.dim(result.outputPath)}`);
      console.log(`    Tokens: ${chalk.dim(result.tokenCount)} transformed`);
      console.log();
    });
    
  } catch (error) {
    spinner.fail('Token transformation failed');
    throw error;
  }
}

async function handleWatchTokens(options: TokenOptions): Promise<void> {
  logger.info('Starting token watch mode...');
  
  const tokenManager = new TokenManager();
  
  try {
    await tokenManager.watch({
      sourceDir: './tokens',
      outputDir: options.output || './src/tokens',
      platform: options.platform || 'all',
      format: options.format || 'ts'
    });
    
    console.log(chalk.bold('\n👀 Token Watch Mode:'));
    console.log(`  Watching: ${chalk.cyan('./tokens')}`);
    console.log(`  Output: ${chalk.cyan(options.output || './src/tokens')}`);
    console.log(`  Platform: ${chalk.cyan(options.platform || 'all')}`);
    console.log(`  Format: ${chalk.cyan(options.format || 'ts')}`);
    console.log(chalk.dim('\nPress Ctrl+C to stop watching'));
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nStopping token watch mode...'));
      process.exit(0);
    });
    
    await new Promise(() => {}); // Keep alive
    
  } catch (error) {
    logger.error('Token watch mode failed:', error);
    throw error;
  }
}

async function showTokensHelp(): Promise<void> {
  console.log(chalk.bold('\n🎨 Token Commands:'));
  console.log(`  ${chalk.cyan('generate')}        Generate tokens for target platforms`);
  console.log(`  ${chalk.cyan('validate')}        Validate token definitions`);
  console.log(`  ${chalk.cyan('sync')} <platform>  Sync tokens for specific platform`);
  console.log(`  ${chalk.cyan('transform')} <format> Transform tokens to different format`);
  console.log(`  ${chalk.cyan('watch')}           Watch and auto-regenerate tokens`);
  
  console.log(chalk.bold('\n📋 Supported Formats:'));
  console.log('  • CSS - CSS custom properties');
  console.log('  • SCSS - Sass variables');
  console.log('  • JavaScript - ES modules');
  console.log('  • TypeScript - Typed definitions');
  console.log('  • JSON - Raw token data');
  console.log('  • Tailwind - Tailwind CSS config');
  
  console.log(chalk.bold('\n🎯 Examples:'));
  console.log(`  xala tokens generate --platform react --format ts`);
  console.log(`  xala tokens validate`);
  console.log(`  xala tokens sync flutter`);
  console.log(`  xala tokens transform css --output ./dist/tokens`);
  console.log(`  xala tokens watch --platform all`);
  
  console.log(chalk.bold('\n🏭 Platform Support:'));
  console.log('  • React/Vue/Angular - TypeScript/JavaScript');
  console.log('  • Flutter - Dart classes');
  console.log('  • iOS - Swift structs');
  console.log('  • Android - Kotlin objects');
  console.log('  • CSS - Custom properties');
  console.log('  • Tailwind - Configuration object');
}
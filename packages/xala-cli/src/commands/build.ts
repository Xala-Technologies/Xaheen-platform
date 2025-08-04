import chalk from 'chalk';
import ora from 'ora';
import { CommandMetadata } from './index.js';
import { logger } from '../utils/logger.js';
import { MultiPlatformBuilder } from '../services/multi-platform-builder.js';
import { ValidationError } from '../utils/errors.js';

export interface BuildOptions {
  readonly platform?: string;
  readonly optimize?: boolean;
  readonly analyze?: boolean;
  readonly output?: string;
  readonly env?: string;
  readonly watch?: boolean;
  readonly sourcemap?: boolean;
  readonly minify?: boolean;
}

export const buildCommand: CommandMetadata = {
  name: 'build',
  description: 'Build for multiple platforms',
  arguments: [
    {
      name: 'platform',
      description: 'Target platform (react|vue|angular|flutter|ios|android|all)',
      required: false
    }
  ],
  options: [
    {
      flags: '--optimize',
      description: 'Enable production optimizations',
      defaultValue: false
    },
    {
      flags: '--analyze',
      description: 'Analyze bundle size and performance',
      defaultValue: false
    },
    {
      flags: '--output <path>',
      description: 'Output directory',
      defaultValue: './dist'
    },
    {
      flags: '--env <environment>',
      description: 'Build environment (development|staging|production)',
      defaultValue: 'production'
    },
    {
      flags: '--watch',
      description: 'Watch for changes and rebuild',
      defaultValue: false
    },
    {
      flags: '--sourcemap',
      description: 'Generate source maps',
      defaultValue: false
    },
    {
      flags: '--minify',
      description: 'Minify output',
      defaultValue: true
    }
  ],
  action: async (platform?: string, options: BuildOptions = {}) => {
    try {
      const targetPlatform = platform || options.platform || 'react';
      
      logger.info(`Building for platform: ${targetPlatform}`);
      
      const builder = new MultiPlatformBuilder();
      const spinner = ora('Building project...').start();
      
      try {
        const buildResults = await builder.build(targetPlatform, {
          optimize: options.optimize || false,
          analyze: options.analyze || false,
          outputDir: options.output || './dist',
          environment: options.env || 'production',
          watch: options.watch || false,
          sourcemap: options.sourcemap || false,
          minify: options.minify !== false
        });
        
        spinner.succeed('Build completed successfully');
        
        console.log(chalk.bold('\n📦 Build Results:'));
        buildResults.forEach(result => {
          console.log(`  ${chalk.cyan(result.platform)}: ${result.status}`);
          console.log(`    Output: ${chalk.dim(result.outputPath)}`);
          console.log(`    Size: ${chalk.dim(result.size)}`);
          console.log(`    Time: ${chalk.dim(result.buildTime)}`);
          console.log();
        });
        
        if (options.analyze) {
          console.log(chalk.bold('📊 Bundle Analysis:'));
          console.log('  View detailed analysis at: ./dist/analysis.html');
        }
        
      } catch (error) {
        spinner.fail('Build failed');
        throw error;
      }
      
    } catch (error) {
      logger.error('Build command failed:', error);
      throw error;
    }
  }
};
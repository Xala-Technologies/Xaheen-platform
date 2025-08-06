#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { join, resolve } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { z } from 'zod';
import { ConfigurationService } from '../services/configuration.service';
import { logger } from '../utils/logger';
import { handleError } from '../utils/error-handler';

// Registry item schema
const RegistryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  type: z.enum([
    'registry:component',
    'registry:block',
    'registry:style',
    'registry:hook',
    'registry:utils',
    'registry:theme'
  ]),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  nsm: z.object({
    classification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).optional(),
    wcagLevel: z.enum(['AA', 'AAA']).optional(),
    norwegianOptimized: z.boolean().optional()
  }).optional(),
  platforms: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(z.object({
    path: z.string(),
    type: z.string(),
    target: z.string().optional(),
    content: z.string().optional(),
    platform: z.string().optional()
  })),
  cssVars: z.any().optional(),
  config: z.any().optional()
});

type RegistryItem = z.infer<typeof RegistryItemSchema>;

export class RegistryCommand {
  private configService: ConfigurationService;
  private registryUrl: string = 'https://xaheen.io/registry';
  private localRegistryPath: string = '';

  constructor() {
    this.configService = new ConfigurationService();
  }

  public getCommand(): Command {
    const command = new Command('registry');
    command
      .alias('reg')
      .description('Manage Xaheen component registry')
      .option('--local <path>', 'Use local registry path')
      .option('--url <url>', 'Use custom registry URL');

    // Add subcommands
    command
      .command('add <components...>')
      .description('Add components from the registry')
      .option('-p, --path <path>', 'Installation path (default: src/components)')
      .option('--npm', 'Use npm for dependency installation')
      .option('--yarn', 'Use yarn for dependency installation')
      .option('--pnpm', 'Use pnpm for dependency installation')
      .option('--no-deps', 'Skip dependency installation')
      .option('--overwrite', 'Overwrite existing files')
      .option('--platform <platform>', 'Target platform (react, nextjs, vue, etc.)')
      .action(async (components: string[], options) => {
        await this.handleAdd(components, options);
      });

    command
      .command('list')
      .alias('ls')
      .description('List available registry items')
      .option('--category <category>', 'Filter by category')
      .option('--platform <platform>', 'Filter by platform')
      .option('--nsm <classification>', 'Filter by NSM classification')
      .action(async (options) => {
        await this.handleList(options);
      });

    command
      .command('info <component>')
      .description('Show information about a registry item')
      .action(async (component: string) => {
        await this.handleInfo(component);
      });

    command
      .command('search <query>')
      .description('Search registry items')
      .action(async (query: string) => {
        await this.handleSearch(query);
      });

    return command;
  }

  private async handleAdd(components: string[], options: any) {
    const spinner = ora('Fetching registry information...').start();

    try {
      // Determine registry source
      if (options.local) {
        this.localRegistryPath = resolve(options.local);
        if (!existsSync(this.localRegistryPath)) {
          throw new Error(`Local registry path not found: ${this.localRegistryPath}`);
        }
      } else if (options.url) {
        this.registryUrl = options.url;
      }

      // Get project configuration
      const config = await this.configService.load();
      const projectType = config.framework || 'react';
      const platform = options.platform || projectType;

      // Installation path
      const basePath = options.path || config.paths?.components || 'src/components';
      const installPath = resolve(process.cwd(), basePath);

      // Ensure installation directory exists
      if (!existsSync(installPath)) {
        mkdirSync(installPath, { recursive: true });
      }

      // Process each component
      const installedComponents: string[] = [];
      const dependencies = new Set<string>();
      const devDependencies = new Set<string>();

      for (const componentName of components) {
        spinner.text = `Installing ${componentName}...`;

        // Fetch registry item
        const item = await this.fetchRegistryItem(componentName);

        // Validate platform support
        if (item.platforms && !item.platforms.includes(platform)) {
          logger.warn(`${componentName} does not support platform: ${platform}`);
          continue;
        }

        // Check NSM classification
        if (item.nsm?.classification) {
          logger.info(chalk.yellow(`NSM Classification: ${item.nsm.classification}`));
        }

        // Install registry dependencies first
        if (item.registryDependencies) {
          for (const dep of item.registryDependencies) {
            if (!installedComponents.includes(dep) && !dep.startsWith('http')) {
              await this.handleAdd([dep], { ...options, platform });
              installedComponents.push(dep);
            }
          }
        }

        // Collect dependencies
        if (item.dependencies) {
          item.dependencies.forEach(dep => dependencies.add(dep));
        }
        if (item.devDependencies) {
          item.devDependencies.forEach(dep => devDependencies.add(dep));
        }

        // Install files
        for (const file of item.files) {
          // Skip platform-specific files
          if (file.platform && file.platform !== platform) {
            continue;
          }

          const targetPath = file.target 
            ? resolve(process.cwd(), file.target.replace('~/', ''))
            : resolve(installPath, componentName, file.path.split('/').pop()!);

          // Check if file exists
          if (existsSync(targetPath) && !options.overwrite) {
            logger.warn(`File already exists: ${targetPath}`);
            continue;
          }

          // Ensure directory exists
          const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
          }

          // Transform import paths
          let content = file.content || '';
          content = this.transformImports(content, config);

          // Write file
          writeFileSync(targetPath, content);
          logger.success(`Created: ${targetPath}`);
        }

        // Apply CSS variables
        if (item.cssVars) {
          await this.applyCssVariables(item.cssVars);
        }

        // Apply configuration
        if (item.config) {
          await this.applyConfiguration(item.config);
        }

        installedComponents.push(componentName);
      }

      spinner.succeed(`Installed ${installedComponents.length} components`);

      // Install dependencies
      if (!options.noDeps && (dependencies.size > 0 || devDependencies.size > 0)) {
        await this.installDependencies(
          Array.from(dependencies),
          Array.from(devDependencies),
          options
        );
      }

      // Success message
      console.log(chalk.green('\n✨ Installation completed successfully!'));
      console.log(chalk.gray('\nInstalled components:'));
      installedComponents.forEach(comp => {
        console.log(chalk.gray(`  - ${comp}`));
      });

    } catch (error) {
      spinner.fail('Installation failed');
      handleError(error);
    }
  }

  private async handleList(options: any) {
    const spinner = ora('Fetching registry index...').start();

    try {
      const index = await this.fetchRegistryIndex();
      spinner.stop();

      // Filter items
      let items = index.items || [];
      
      if (options.category) {
        items = items.filter(item => item.category === options.category);
      }
      
      if (options.platform) {
        items = items.filter(item => 
          item.platforms?.includes(options.platform)
        );
      }

      if (options.nsm) {
        items = items.filter(item => 
          item.nsm?.classification === options.nsm
        );
      }

      // Display items
      console.log(chalk.blue('\n📦 Available Registry Items:\n'));

      const categories = [...new Set(items.map(item => item.category || 'uncategorized'))];
      
      for (const category of categories) {
        const categoryItems = items.filter(item => 
          (item.category || 'uncategorized') === category
        );

        if (categoryItems.length > 0) {
          console.log(chalk.yellow(`${category}:`));
          
          categoryItems.forEach(item => {
            const platforms = item.platforms?.join(', ') || 'all';
            const nsm = item.nsm?.classification 
              ? chalk.red(`[${item.nsm.classification}]`) 
              : '';
            
            console.log(
              `  ${chalk.green(item.name.padEnd(20))} ${chalk.gray(item.title || '')} ${nsm}`
            );
            
            if (item.description) {
              console.log(chalk.gray(`    ${item.description}`));
            }
            
            console.log(chalk.gray(`    Platforms: ${platforms}`));
          });
          
          console.log();
        }
      }

    } catch (error) {
      spinner.fail('Failed to fetch registry');
      handleError(error);
    }
  }

  private async handleInfo(component: string) {
    const spinner = ora(`Fetching info for ${component}...`).start();

    try {
      const item = await this.fetchRegistryItem(component);
      spinner.stop();

      console.log(chalk.blue(`\n📦 ${item.title || item.name}\n`));
      
      if (item.description) {
        console.log(item.description);
        console.log();
      }

      console.log(chalk.yellow('Details:'));
      console.log(`  Type: ${item.type}`);
      console.log(`  Category: ${item.category || 'uncategorized'}`);
      
      if (item.platforms) {
        console.log(`  Platforms: ${item.platforms.join(', ')}`);
      }

      if (item.nsm) {
        console.log(chalk.yellow('\nNorwegian Compliance:'));
        console.log(`  NSM Classification: ${item.nsm.classification || 'N/A'}`);
        console.log(`  WCAG Level: ${item.nsm.wcagLevel || 'N/A'}`);
        console.log(`  Norwegian Optimized: ${item.nsm.norwegianOptimized ? 'Yes' : 'No'}`);
      }

      if (item.dependencies && item.dependencies.length > 0) {
        console.log(chalk.yellow('\nDependencies:'));
        item.dependencies.forEach(dep => {
          console.log(`  - ${dep}`);
        });
      }

      if (item.registryDependencies && item.registryDependencies.length > 0) {
        console.log(chalk.yellow('\nRegistry Dependencies:'));
        item.registryDependencies.forEach(dep => {
          console.log(`  - ${dep}`);
        });
      }

      console.log(chalk.yellow('\nFiles:'));
      item.files.forEach(file => {
        console.log(`  - ${file.path} (${file.type})`);
      });

      console.log(chalk.gray(`\nTo install: xaheen registry add ${component}`));

    } catch (error) {
      spinner.fail('Failed to fetch component info');
      handleError(error);
    }
  }

  private async handleSearch(query: string) {
    const spinner = ora('Searching registry...').start();

    try {
      const index = await this.fetchRegistryIndex();
      spinner.stop();

      const results = index.items.filter(item => 
        item.name.includes(query.toLowerCase()) ||
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );

      if (results.length === 0) {
        console.log(chalk.yellow('\nNo results found.'));
        return;
      }

      console.log(chalk.blue(`\n🔍 Search Results for "${query}":\n`));

      results.forEach(item => {
        console.log(
          `${chalk.green(item.name.padEnd(20))} ${chalk.gray(item.title || '')}`
        );
        
        if (item.description) {
          console.log(chalk.gray(`  ${item.description}`));
        }
      });

    } catch (error) {
      spinner.fail('Search failed');
      handleError(error);
    }
  }

  private async fetchRegistryIndex(): Promise<any> {
    if (this.localRegistryPath) {
      const indexPath = join(this.localRegistryPath, 'index.json');
      return JSON.parse(readFileSync(indexPath, 'utf-8'));
    }

    const response = await fetch(`${this.registryUrl}/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry index: ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchRegistryItem(name: string): Promise<RegistryItem> {
    let data: any;

    if (this.localRegistryPath) {
      const itemPath = join(this.localRegistryPath, `${name}.json`);
      if (!existsSync(itemPath)) {
        throw new Error(`Registry item not found: ${name}`);
      }
      data = JSON.parse(readFileSync(itemPath, 'utf-8'));
    } else {
      const response = await fetch(`${this.registryUrl}/${name}.json`);
      if (!response.ok) {
        throw new Error(`Registry item not found: ${name}`);
      }
      data = await response.json();
    }

    return RegistryItemSchema.parse(data);
  }

  private transformImports(content: string, config: any): string {
    // Transform @/ imports to configured paths
    const aliases = config.paths?.aliases || {
      '@/components': './components',
      '@/utils': './utils',
      '@/hooks': './hooks',
      '@/lib': './lib'
    };

    let transformed = content;
    
    for (const [alias, path] of Object.entries(aliases)) {
      const regex = new RegExp(`from ['"]${alias.replace('/', '\\/')}`, 'g');
      transformed = transformed.replace(regex, `from '${path}`);
    }

    return transformed;
  }

  private async applyCssVariables(cssVars: any) {
    // TODO: Implement CSS variable injection
    logger.info('CSS variables would be applied to your styles');
  }

  private async applyConfiguration(config: any) {
    // TODO: Implement configuration application
    logger.info('Configuration would be applied to your project');
  }

  private async installDependencies(
    deps: string[],
    devDeps: string[],
    options: any
  ) {
    const spinner = ora('Installing dependencies...').start();

    try {
      const { execSync } = await import('child_process');
      
      // Determine package manager
      let packageManager = 'bun';
      if (options.npm) packageManager = 'npm';
      else if (options.yarn) packageManager = 'yarn';
      else if (options.pnpm) packageManager = 'pnpm';

      // Install commands
      const commands: Record<string, { add: string; addDev: string }> = {
        npm: { add: 'npm install', addDev: 'npm install --save-dev' },
        yarn: { add: 'yarn add', addDev: 'yarn add --dev' },
        pnpm: { add: 'pnpm add', addDev: 'pnpm add --save-dev' },
        bun: { add: 'bun add', addDev: 'bun add --dev' }
      };

      const cmd = commands[packageManager];

      // Install production dependencies
      if (deps.length > 0) {
        spinner.text = `Installing dependencies with ${packageManager}...`;
        execSync(`${cmd.add} ${deps.join(' ')}`, { stdio: 'inherit' });
      }

      // Install dev dependencies
      if (devDeps.length > 0) {
        spinner.text = `Installing dev dependencies with ${packageManager}...`;
        execSync(`${cmd.addDev} ${devDeps.join(' ')}`, { stdio: 'inherit' });
      }

      spinner.succeed('Dependencies installed successfully');

    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }
  }
}
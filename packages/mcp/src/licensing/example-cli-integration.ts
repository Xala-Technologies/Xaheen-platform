/**
 * Xaheen Developer Bank - Example CLI Integration
 * Shows how to integrate licensing into the main CLI application
 */

import { Command } from 'commander';
import * as chalk from 'chalk';
import { createLicenseManager, createCLIIntegration, LicenseCommands } from './index.js';
import { CLI_COMMANDS } from './CLILicenseIntegration.js';

/**
 * Example of how to integrate licensing into your main CLI application
 */
export async function createLicensedCLI(): Promise<Command> {
  // Initialize licensing system
  const licenseManager = createLicenseManager();
  const integration = createCLIIntegration(licenseManager);
  const licenseCommands = new LicenseCommands();

  // Create main CLI program
  const program = new Command();
  program
    .name('xaheen')
    .description('Xaheen Developer Bank - Feature-gated CLI for enterprise development')
    .version('3.0.0');

  // Bootstrap licensing on CLI startup
  program.hook('preAction', async (thisCommand) => {
    // Skip license check for license management commands
    if (thisCommand.name() === 'license') {
      return;
    }

    const bootstrap = await integration.bootstrap();
    
    if (!bootstrap.success) {
      console.log(chalk.red('🚫 License validation failed:'));
      bootstrap.errors.forEach(error => console.log(`  ${error}`));
      process.exit(1);
    }

    if (bootstrap.warnings.length > 0) {
      bootstrap.warnings.forEach(warning => {
        console.log(chalk.yellow(`⚠️  ${warning}`));
      });
      console.log(''); // Add spacing
    }
  });

  // Register license management commands
  licenseCommands.registerCommands(program);

  // Add feature-gated generator commands
  await addGeneratorCommands(program, integration);

  // Add scaffold commands
  await addScaffoldCommands(program, integration);

  // Add utility commands
  await addUtilityCommands(program, integration);

  return program;
}

/**
 * Add generator commands with license enforcement
 */
async function addGeneratorCommands(program: Command, integration: any): Promise<void> {
  const generateCmd = program
    .command('generate')
    .alias('g')
    .description('Generate code using licensed templates');

  // Component generator
  generateCmd
    .command('component <name>')
    .description('Generate UI components')
    .option('-p, --platform <platform>', 'Target platform', 'react')
    .option('-t, --type <type>', 'Component type', 'basic')
    .action(async (name: string, options: any) => {
      const command = CLI_COMMANDS.find(cmd => cmd.name === 'generate component');
      if (!command) return;

      const check = await integration.checkCommand(command);
      if (!check.allowed) {
        console.log(check.message);
        return;
      }

      // Track usage
      await integration.trackGeneratorUsage('component', command.requiredFeatures);

      // Execute the actual generator
      console.log(chalk.green(`✨ Generating ${options.type} component: ${name}`));
      console.log(`Platform: ${options.platform}`);
      // ... actual generation logic here
    });

  // API generator
  generateCmd
    .command('api <name>')
    .description('Generate REST API endpoints')
    .option('-m, --methods <methods>', 'HTTP methods', 'GET,POST,PUT,DELETE')
    .action(async (name: string, options: any) => {
      const command = CLI_COMMANDS.find(cmd => cmd.name === 'generate api');
      if (!command) return;

      const check = await integration.checkCommand(command);
      if (!check.allowed) {
        console.log(check.message);
        return;
      }

      await integration.trackGeneratorUsage('api', command.requiredFeatures);

      console.log(chalk.green(`🚀 Generating API: ${name}`));
      console.log(`Methods: ${options.methods}`);
      // ... actual generation logic here
    });

  // BankID generator (enterprise feature)
  generateCmd
    .command('bankid <name>')
    .description('Generate BankID integration')
    .option('-e, --environment <env>', 'BankID environment', 'test')
    .action(async (name: string, options: any) => {
      const command = CLI_COMMANDS.find(cmd => cmd.name === 'generate bankid');
      if (!command) return;

      const check = await integration.checkCommand(command);
      if (!check.allowed) {
        console.log(check.message);
        return;
      }

      await integration.trackGeneratorUsage('bankid', command.requiredFeatures);

      console.log(chalk.green(`🏛️ Generating BankID integration: ${name}`));
      console.log(`Environment: ${options.environment}`);
      // ... actual generation logic here
    });
}

/**
 * Add scaffold commands with license enforcement
 */
async function addScaffoldCommands(program: Command, integration: any): Promise<void> {
  const scaffoldCmd = program
    .command('scaffold')
    .alias('s')
    .description('Scaffold complete applications and features');

  // CRUD scaffold
  scaffoldCmd
    .command('crud <entity>')
    .description('Generate complete CRUD operations')
    .option('-d, --database <db>', 'Database type', 'postgresql')
    .action(async (entity: string, options: any) => {
      const command = CLI_COMMANDS.find(cmd => cmd.name === 'scaffold crud');
      if (!command) return;

      const check = await integration.checkCommand(command);
      if (!check.allowed) {
        console.log(check.message);
        return;
      }

      await integration.trackGeneratorUsage('crud', command.requiredFeatures);

      console.log(chalk.green(`📋 Scaffolding CRUD for: ${entity}`));
      console.log(`Database: ${options.database}`);
      // ... actual scaffolding logic here
    });

  // App scaffold
  scaffoldCmd
    .command('app <name>')
    .description('Generate complete application')
    .option('-t, --template <template>', 'App template', 'fullstack')
    .action(async (name: string, options: any) => {
      const command = CLI_COMMANDS.find(cmd => cmd.name === 'scaffold app');
      if (!command) return;

      const check = await integration.checkCommand(command);
      if (!check.allowed) {
        console.log(check.message);
        return;
      }

      await integration.trackGeneratorUsage('app', command.requiredFeatures);

      console.log(chalk.green(`🏗️ Scaffolding application: ${name}`));
      console.log(`Template: ${options.template}`);
      // ... actual scaffolding logic here
    });
}

/**
 * Add utility commands
 */
async function addUtilityCommands(program: Command, integration: any): Promise<void> {
  // Interactive menu
  program
    .command('menu')
    .description('Show interactive menu with available options')
    .action(async () => {
      const menu = await integration.generateLicenseAwareMenu(CLI_COMMANDS);
      
      console.log(chalk.bold('🎯 Xaheen Developer Bank'));
      console.log('');

      menu.sections.forEach(section => {
        console.log(chalk.bold(section.title));
        section.commands.forEach(({ command, available, upgradeHint }) => {
          const icon = available ? '✅' : '🔒';
          const name = available ? chalk.green(command.name) : chalk.gray(command.name);
          const hint = upgradeHint ? chalk.yellow(` (${upgradeHint})`) : '';
          
          console.log(`  ${icon} ${name}${hint}`);
          console.log(`     ${chalk.gray(command.description)}`);
        });
        console.log('');
      });

      if (menu.footerMessage) {
        console.log(menu.footerMessage);
      }
    });

  // Doctor command for diagnostics
  program
    .command('doctor')
    .description('Diagnose license and system issues')
    .action(async () => {
      console.log(chalk.bold('🩺 Xaheen Doctor'));
      console.log('');

      // Check license status
      const status = await integration.getLicenseStatus();
      console.log(`License Status: ${status.status === 'valid' ? chalk.green('✅ Valid') : chalk.red('❌ Invalid')}`);
      
      if (status.license) {
        console.log(`License Tier: ${chalk.cyan(status.license.tier)}`);
        console.log(`Features: ${chalk.cyan(status.license.features.length)}`);
        
        const expiration = await integration.licenseManager.checkExpiration();
        if (expiration.expiring) {
          console.log(chalk.yellow(`⚠️  Expires in ${expiration.daysUntilExpiration} days`));
        }
      }

      console.log('');
      console.log('System checks:');
      console.log(`  Node.js: ${chalk.green(process.version)}`);
      console.log(`  Platform: ${chalk.green(process.platform)}`);
      console.log(`  Architecture: ${chalk.green(process.arch)}`);
      
      console.log('');
      console.log(chalk.green('✅ All systems operational'));
    });
}

/**
 * Example usage in your main CLI file
 */
export async function main(): Promise<void> {
  try {
    const program = await createLicensedCLI();
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red(`❌ CLI Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

// Example of how to check features programmatically
export async function exampleFeatureCheck(): Promise<void> {
  const licenseManager = createLicenseManager();
  await licenseManager.initialize();

  // Check if user can generate components
  const componentCheck = await licenseManager.checkFeature('generator.components');
  if (componentCheck.allowed) {
    console.log('✅ User can generate components');
  } else {
    console.log(`🚫 Component generation blocked: ${componentCheck.reason}`);
    if (componentCheck.upgradeAction) {
      console.log(`💡 Upgrade to ${componentCheck.upgradeAction.tier}: ${componentCheck.upgradeAction.upgradeUrl}`);
    }
  }

  // Check multiple features at once
  const featureChecks = await licenseManager.checkFeatures([
    'feature.frontend',
    'feature.backend',
    'addon.payments',
    'enterprise.bankid',
  ]);

  Object.entries(featureChecks).forEach(([feature, check]) => {
    const status = check.allowed ? '✅' : '🚫';
    console.log(`${status} ${feature}: ${check.allowed ? 'Available' : check.reason}`);
  });
}

// Example of license tier comparison
export async function exampleTierComparison(): Promise<void> {
  const integration = createCLIIntegration();
  const comparison = await integration.getFeatureComparison();

  console.log(`Current tier: ${comparison.currentTier}`);
  console.log(`Current features: ${comparison.currentFeatures.length}`);
  
  comparison.availableTiers.forEach(tier => {
    const status = tier.isUpgrade ? '⬆️ Upgrade' : tier.tier === comparison.currentTier ? '✅ Current' : '➡️ Alternative';
    console.log(`${status} ${tier.name}: ${tier.features.length} features`);
    if (tier.price) {
      console.log(`  Price: $${tier.price.monthly}/month`);
    }
  });
}

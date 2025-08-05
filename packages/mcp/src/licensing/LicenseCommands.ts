/**
 * Xaheen Developer Bank - License CLI Commands
 * Command-line interface for license management
 */

import { Command } from 'commander';
import chalk from 'chalk';

// Ensure chalk methods are available
const { red, green, blue, yellow, cyan, bold, gray } = chalk;
import { LicenseManager } from './LicenseManager.js';
import { CLILicenseIntegration } from './CLILicenseIntegration.js';
import { FeatureFlag, LicenseTier } from './types.js';

export class LicenseCommands {
  private licenseManager: LicenseManager;
  private integration: CLILicenseIntegration;

  public constructor() {
    this.licenseManager = new LicenseManager();
    this.integration = new CLILicenseIntegration(this.licenseManager);
  }

  /**
   * Register license commands with Commander.js
   */
  public registerCommands(program: Command): void {
    const licenseCmd = program
      .command('license')
      .description('Manage Xaheen license and subscription');

    // License activation
    licenseCmd
      .command('activate <license-key>')
      .description('Activate a Xaheen license')
      .action(async (licenseKey: string) => {
        await this.handleActivate(licenseKey);
      });

    // License status
    licenseCmd
      .command('status')
      .description('Show current license status')
      .option('--json', 'Output in JSON format')
      .action(async (options) => {
        await this.handleStatus(options.json);
      });

    // License features
    licenseCmd
      .command('features')
      .description('List available features')
      .option('--available', 'Show only available features')
      .option('--all', 'Show all possible features')
      .action(async (options) => {
        await this.handleFeatures(options);
      });

    // License validation
    licenseCmd
      .command('validate')
      .description('Validate current license')
      .action(async () => {
        await this.handleValidate();
      });

    // License deactivation
    licenseCmd
      .command('deactivate')
      .description('Deactivate current license')
      .option('--confirm', 'Skip confirmation prompt')
      .action(async (options) => {
        await this.handleDeactivate(options.confirm);
      });

    // License upgrade
    licenseCmd
      .command('upgrade')
      .description('View upgrade options')
      .option('--tier <tier>', 'Show specific tier information')
      .action(async (options) => {
        await this.handleUpgrade(options.tier);
      });

    // License usage metrics
    licenseCmd
      .command('usage')
      .description('Show license usage metrics')
      .option('--json', 'Output in JSON format')
      .action(async (options) => {
        await this.handleUsage(options.json);
      });

    // License renewal
    licenseCmd
      .command('renew')
      .description('Open license renewal page')
      .action(async () => {
        await this.handleRenew();
      });
  }

  // Command handlers

  private async handleActivate(licenseKey: string): Promise<void> {
    try {
      console.log(chalk.blue('🔑 Activating Xaheen license...'));
      
      const result = await this.licenseManager.activateLicense(licenseKey);
      
      if (result.valid && result.license) {
        console.log(chalk.green('✅ License activated successfully!'));
        console.log('');
        console.log(chalk.bold('License Information:'));
        console.log(`  Tier: ${chalk.cyan(result.license.tier)}`);
        console.log(`  Customer: ${chalk.cyan(result.license.metadata.customerName)}`);
        console.log(`  Features: ${chalk.cyan(result.license.features.length)} enabled`);
        console.log(`  Expires: ${chalk.cyan(new Date(result.license.expiresAt).toLocaleDateString())}`);
        
        if (result.warnings.length > 0) {
          console.log('');
          console.log(chalk.yellow('⚠️  Warnings:'));
          result.warnings.forEach(warning => {
            console.log(`  ${warning}`);
          });
        }
        
        console.log('');
        console.log(chalk.green('🚀 You can now use all licensed Xaheen features!'));
        console.log(`Run ${chalk.cyan('xaheen license features')} to see what's available.`);
      } else {
        console.log(chalk.red('❌ License activation failed:'));
        result.errors.forEach(error => {
          console.log(`  ${error}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Activation error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleStatus(jsonOutput: boolean): Promise<void> {
    try {
      const status = await this.integration.getLicenseStatus();
      
      if (jsonOutput) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      console.log(chalk.bold('📋 Xaheen License Status'));
      console.log('');

      if (!status.license) {
        console.log(chalk.red('❌ No active license'));
        console.log(status.message);
        console.log('');
        console.log(chalk.bold('Available Actions:'));
        status.actions.forEach(action => {
          console.log(`  ${chalk.cyan(action.command)}`);
        });
        return;
      }

      // License information
      const license = status.license;
      const statusIcon = this.getStatusIcon(status.status);
      const statusColor = this.getStatusColor(status.status);
      
      console.log(`${statusIcon} Status: ${statusColor(status.status.toUpperCase())}`);
      console.log(`📦 Tier: ${chalk.cyan(license.tier)}`);
      console.log(`👤 Customer: ${chalk.cyan(license.metadata.customerName)}`);
      console.log(`🏢 Organization: ${chalk.cyan(license.metadata.organizationName || 'Personal')}`);
      console.log(`📅 Expires: ${chalk.cyan(new Date(license.expiresAt).toLocaleDateString())}`);
      console.log(`🎯 Features: ${chalk.cyan(license.features.length)} enabled`);
      
      if (license.maxSeats) {
        console.log(`👥 Seats: ${chalk.cyan(`${license.currentSeats || 0}/${license.maxSeats}`)}`);
      }

      console.log('');
      console.log(status.message);

      if (status.actions.length > 0) {
        console.log('');
        console.log(chalk.bold('Available Actions:'));
        status.actions.forEach(action => {
          console.log(`  ${chalk.cyan(action.command)}`);
        });
      }
    } catch (error) {
      console.log(chalk.red(`❌ Status error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleFeatures(options: { available?: boolean; all?: boolean }): Promise<void> {
    try {
      const license = await this.licenseManager.getLicenseInfo();
      const availableFeatures = await this.licenseManager.getAvailableFeatures();
      
      console.log(chalk.bold('🎯 Xaheen Features'));
      console.log('');

      if (options.all) {
        // Show all possible features grouped by category
        const allTiers = this.licenseManager.getAllLicenseTiers();
        const addons = this.licenseManager.getAddonPacks();
        
        console.log(chalk.bold('License Tiers:'));
        Object.entries(allTiers).forEach(([tier, info]) => {
          const isCurrentTier = license?.tier === tier;
          const tierName = isCurrentTier ? chalk.green(`${info.name} (Current)`) : info.name;
          
          console.log(`\n${tierName}:`);
          console.log(`  ${info.description}`);
          if (info.price) {
            console.log(`  Price: $${info.price.monthly}/month or $${info.price.yearly}/year`);
          }
          console.log(`  Features: ${info.features.length}`);
        });

        console.log(chalk.bold('\nAdd-on Packs:'));
        Object.entries(addons).forEach(([packId, pack]) => {
          console.log(`\n${pack.name}:`);
          console.log(`  ${pack.description}`);
          console.log(`  Price: $${pack.price.monthly}/month or $${pack.price.yearly}/year`);
          console.log(`  Compatible with: ${pack.compatibleTiers.join(', ')}`);
        });
        
        return;
      }

      if (!license) {
        console.log(chalk.red('❌ No active license. Activate a license to see available features.'));
        return;
      }

      // Show current license features
      console.log(`Current License: ${chalk.cyan(license.tier)}`);
      console.log(`Total Features: ${chalk.cyan(availableFeatures.length)}`);
      console.log('');

      // Group features by category
      const featureGroups = this.groupFeaturesByCategory(availableFeatures);
      
      Object.entries(featureGroups).forEach(([category, features]) => {
        if (features.length === 0) return;
        
        console.log(chalk.bold(`${this.getCategoryIcon(category)} ${this.getCategoryName(category)}:`));
        features.forEach(feature => {
          console.log(`  ✅ ${feature}`);
        });
        console.log('');
      });

      // Show upgrade suggestions
      const comparison = await this.integration.getFeatureComparison();
      const upgradeOptions = comparison.availableTiers.filter(t => t.isUpgrade);
      
      if (upgradeOptions.length > 0) {
        console.log(chalk.bold('🚀 Upgrade Options:'));
        upgradeOptions.forEach(tier => {
          const additionalFeatures = tier.features.filter(f => !availableFeatures.includes(f));
          if (additionalFeatures.length > 0) {
            console.log(`\n${tier.name}:`);
            if (tier.price) {
              console.log(`  Price: $${tier.price.monthly}/month`);
            }
            console.log(`  Additional features: ${additionalFeatures.length}`);
          }
        });
        
        console.log(`\nRun ${chalk.cyan('xaheen license upgrade')} for detailed comparison.`);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Features error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleValidate(): Promise<void> {
    try {
      console.log(chalk.blue('🔍 Validating license...'));
      
      const result = await this.licenseManager.validateLicense();
      
      if (result.valid && result.license) {
        console.log(chalk.green('✅ License is valid'));
        
        if (result.daysUntilExpiration !== undefined) {
          if (result.daysUntilExpiration > 30) {
            console.log(chalk.green(`📅 Expires in ${result.daysUntilExpiration} days`));
          } else if (result.daysUntilExpiration > 0) {
            console.log(chalk.yellow(`⚠️  Expires in ${result.daysUntilExpiration} days`));
          } else {
            console.log(chalk.red(`❌ Expired ${Math.abs(result.daysUntilExpiration)} days ago`));
          }
        }
        
        if (result.warnings.length > 0) {
          console.log('');
          console.log(chalk.yellow('Warnings:'));
          result.warnings.forEach(warning => {
            console.log(`  ${warning}`);
          });
        }
      } else {
        console.log(chalk.red('❌ License validation failed:'));
        result.errors.forEach(error => {
          console.log(`  ${error}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleDeactivate(confirm: boolean): Promise<void> {
    try {
      if (!confirm) {
        // In a real implementation, you'd use a proper prompt library
        console.log(chalk.yellow('⚠️  This will deactivate your current license.'));
        console.log('You will need to reactivate to continue using Xaheen features.');
        console.log('');
        console.log('Use --confirm to skip this prompt.');
        return;
      }

      await this.licenseManager.deactivateLicense();
      console.log(chalk.green('✅ License deactivated successfully'));
    } catch (error) {
      console.log(chalk.red(`❌ Deactivation error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleUpgrade(specificTier?: string): Promise<void> {
    try {
      const comparison = await this.integration.getFeatureComparison();
      
      console.log(chalk.bold('🚀 Xaheen License Upgrade Options'));
      console.log('');
      
      console.log(`Current: ${chalk.cyan(comparison.currentTier)} (${comparison.currentFeatures.length} features)`);
      console.log('');

      if (specificTier) {
        const tier = comparison.availableTiers.find(t => t.tier === specificTier);
        if (!tier) {
          console.log(chalk.red(`❌ Unknown tier: ${specificTier}`));
          return;
        }

        console.log(chalk.bold(`${tier.name} Details:`));
        if (tier.price) {
          console.log(`Price: $${tier.price.monthly}/month or $${tier.price.yearly}/year`);
        }
        console.log(`Features: ${tier.features.length}`);
        
        const additionalFeatures = tier.features.filter(f => !comparison.currentFeatures.includes(f));
        if (additionalFeatures.length > 0) {
          console.log(`\nAdditional features you'll get:`);
          additionalFeatures.slice(0, 10).forEach(feature => {
            console.log(`  ✨ ${feature}`);
          });
          if (additionalFeatures.length > 10) {
            console.log(`  ... and ${additionalFeatures.length - 10} more`);
          }
        }
        
        console.log(`\nUpgrade at: https://xala.tech/upgrade?tier=${tier.tier}`);
        return;
      }

      // Show all upgrade options
      const upgradeOptions = comparison.availableTiers.filter(t => t.isUpgrade);
      
      if (upgradeOptions.length === 0) {
        console.log(chalk.green('✅ You already have the highest tier!'));
        return;
      }

      upgradeOptions.forEach(tier => {
        const additionalFeatures = tier.features.filter(f => !comparison.currentFeatures.includes(f));
        
        console.log(chalk.bold(tier.name));
        if (tier.price) {
          console.log(`  Price: $${tier.price.monthly}/month or $${tier.price.yearly}/year`);
        }
        console.log(`  Total features: ${tier.features.length}`);
        console.log(`  New features: ${additionalFeatures.length}`);
        console.log('');
      });

      console.log(`Run ${chalk.cyan('xaheen license upgrade --tier <tier>')} for detailed information.`);
      console.log(`Or visit: ${chalk.cyan('https://xala.tech/upgrade')}`);
    } catch (error) {
      console.log(chalk.red(`❌ Upgrade error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleUsage(jsonOutput: boolean): Promise<void> {
    try {
      const metrics = await this.licenseManager.getUsageMetrics();
      
      if (!metrics) {
        console.log(chalk.yellow('📊 No usage metrics available'));
        return;
      }

      if (jsonOutput) {
        console.log(JSON.stringify(metrics, null, 2));
        return;
      }

      console.log(chalk.bold('📊 License Usage Metrics'));
      console.log('');
      
      console.log(`Total CLI invocations: ${chalk.cyan(metrics.totalInvocations)}`);
      console.log(`Last used: ${chalk.cyan(new Date(metrics.lastUsed).toLocaleString())}`);
      console.log('');

      // Feature usage
      const featureUsage = Object.entries(metrics.featureUsage)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10);

      if (featureUsage.length > 0) {
        console.log(chalk.bold('Top Features Used:'));
        featureUsage.forEach(([feature, count]) => {
          console.log(`  ${feature}: ${chalk.cyan(count)} times`);
        });
        console.log('');
      }

      // Generator usage
      const sortedUsage = Object.entries(metrics.generatorUsage)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10);

      if (sortedUsage.length > 0) {
        console.log(chalk.bold('Top Generators Used:'));
        sortedUsage.forEach(([generator, count]) => {
          console.log(`  ${generator}: ${chalk.cyan(count)} times`);
        });
      }
    } catch (error) {
      console.log(chalk.red(`❌ Usage error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  private async handleRenew(): Promise<void> {
    try {
      const license = await this.licenseManager.getLicenseInfo();
      
      if (!license) {
        console.log(chalk.red('❌ No active license to renew'));
        return;
      }

      const renewalUrl = `https://xala.tech/renew?license=${license.id}`;
      console.log(chalk.blue('🔄 Opening license renewal page...'));
      console.log(`URL: ${renewalUrl}`);
      
      // In a real implementation, you'd open the browser
      console.log('');
      console.log('Please complete the renewal process in your browser.');
    } catch (error) {
      console.log(chalk.red(`❌ Renewal error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  // Helper methods

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'valid': return '✅';
      case 'expiring': return '⚠️';
      case 'expired': return '❌';
      case 'invalid': return '🚫';
      default: return '❓';
    }
  }

  private getStatusColor(status: string): (text: string) => string {
    switch (status) {
      case 'valid': return chalk.green;
      case 'expiring': return chalk.yellow;
      case 'expired': return chalk.red;
      case 'invalid': return chalk.red;
      default: return chalk.gray;
    }
  }

  private groupFeaturesByCategory(features: FeatureFlag[]): {
    core: FeatureFlag[];
    platform: FeatureFlag[];
    generator: FeatureFlag[];
    addon: FeatureFlag[];
    enterprise: FeatureFlag[];
    infra: FeatureFlag[];
    testing: FeatureFlag[];
    advanced: FeatureFlag[];
  } {
    const groups = {
      core: [] as FeatureFlag[],
      platform: [] as FeatureFlag[],
      generator: [] as FeatureFlag[],
      addon: [] as FeatureFlag[],
      enterprise: [] as FeatureFlag[],
      infra: [] as FeatureFlag[],
      testing: [] as FeatureFlag[],
      advanced: [] as FeatureFlag[],
    };

    features.forEach(feature => {
      if (feature.startsWith('feature.')) groups.core.push(feature);
      else if (feature.startsWith('platform.')) groups.platform.push(feature);
      else if (feature.startsWith('generator.')) groups.generator.push(feature);
      else if (feature.startsWith('addon.')) groups.addon.push(feature);
      else if (feature.startsWith('enterprise.')) groups.enterprise.push(feature);
      else if (feature.startsWith('infra.')) groups.infra.push(feature);
      else if (feature.startsWith('testing.')) groups.testing.push(feature);
      else if (feature.startsWith('advanced.')) groups.advanced.push(feature);
    });

    return groups;
  }

  private getCategoryIcon(category: string): string {
    switch (category) {
      case 'core': return '🎯';
      case 'platform': return '🚀';
      case 'generator': return '🏗️';
      case 'addon': return '🔌';
      case 'enterprise': return '🏢';
      case 'infra': return '☁️';
      case 'testing': return '🧪';
      case 'advanced': return '⚡';
      default: return '📦';
    }
  }

  private getCategoryName(category: string): string {
    switch (category) {
      case 'core': return 'Core Features';
      case 'platform': return 'Platform Support';
      case 'generator': return 'Generators';
      case 'addon': return 'Add-on Packs';
      case 'enterprise': return 'Enterprise Features';
      case 'infra': return 'Infrastructure';
      case 'testing': return 'Testing & Quality';
      case 'advanced': return 'Advanced Features';
      default: return 'Other';
    }
  }
}

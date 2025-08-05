/**
 * Xaheen CLI License Management Commands
 * CLI commands for license activation, status, and management
 */

import { Command } from 'commander';
import chalk from 'chalk';
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
      .command('activate')
      .description('Activate a license with a license key')
      .argument('<license-key>', 'License key to activate')
      .option('--force', 'Force activation even if a license already exists')
      .action(async (licenseKey: string, options: { force?: boolean }) => {
        await this.handleActivate(licenseKey, options.force || false);
      });

    // License status
    licenseCmd
      .command('status')
      .description('Show current license status and information')
      .option('--json', 'Output in JSON format')
      .action(async (options: { json?: boolean }) => {
        await this.handleStatus(options.json || false);
      });

    // License features
    licenseCmd
      .command('features')
      .description('List available features for current license')
      .option('--all', 'Show all features including unavailable ones')
      .option('--json', 'Output in JSON format')
      .action(async (options: { all?: boolean; json?: boolean }) => {
        await this.handleFeatures(options.all || false, options.json || false);
      });

    // License validation
    licenseCmd
      .command('validate')
      .description('Validate current license')
      .option('--verbose', 'Show detailed validation information')
      .action(async (options: { verbose?: boolean }) => {
        await this.handleValidate(options.verbose || false);
      });

    // License deactivation
    licenseCmd
      .command('deactivate')
      .description('Deactivate current license')
      .option('--confirm', 'Skip confirmation prompt')
      .action(async (options: { confirm?: boolean }) => {
        await this.handleDeactivate(options.confirm || false);
      });

    // License upgrade information
    licenseCmd
      .command('upgrade')
      .description('Show license upgrade options and pricing')
      .argument('[tier]', 'Specific tier to show information for')
      .action(async (tier?: LicenseTier) => {
        await this.handleUpgrade(tier);
      });

    // License usage metrics
    licenseCmd
      .command('usage')
      .description('Show license usage metrics and analytics')
      .option('--json', 'Output in JSON format')
      .action(async (options: { json?: boolean }) => {
        await this.handleUsage(options.json || false);
      });

    // License renewal
    licenseCmd
      .command('renew')
      .description('Renew expired or expiring license')
      .action(async () => {
        await this.handleRenew();
      });

    // Add-on pack information
    licenseCmd
      .command('addons')
      .description('Show available add-on packs and pricing')
      .argument('[pack-id]', 'Specific add-on pack to show pricing for')
      .action(async () => {
        await this.handleAddons();
      });

    // Interactive license menu
    licenseCmd
      .command('menu')
      .description('Interactive license management menu')
      .action(async () => {
        await this.handleInteractiveMenu();
      });

    // License doctor (diagnostics)
    licenseCmd
      .command('doctor')
      .description('Diagnose license and system issues')
      .action(async () => {
        await this.handleDoctor();
      });
  }

  private async handleActivate(licenseKey: string, force: boolean): Promise<void> {
    try {
      console.log(chalk.blue('🔑 Activating license...'));
      
      // Check if license already exists
      const existingLicense = await this.licenseManager.getLicenseInfo();
      if (existingLicense && !force) {
        console.log(chalk.yellow('⚠️  A license is already active.'));
        console.log(`Current license: ${chalk.cyan(existingLicense.tier)} (${existingLicense.metadata.customerName})`);
        console.log('Use --force to override the existing license.');
        return;
      }

      const result = await this.licenseManager.activateLicense(licenseKey);
      
      if (result.valid && result.license) {
        console.log(chalk.green('✅ License activated successfully!'));
        console.log(`License tier: ${chalk.cyan(result.license.tier)}`);
        console.log(`Customer: ${chalk.cyan(result.license.metadata.customerName)}`);
        console.log(`Expires: ${chalk.cyan(new Date(result.license.expiresAt).toLocaleDateString())}`);
        console.log(`Features: ${chalk.cyan(result.license.features.length)} available`);
      } else {
        console.log(chalk.red('❌ License activation failed'));
        if (result.error) {
          console.log(chalk.red(`Error: ${result.error}`));
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ License activation error'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleStatus(json: boolean): Promise<void> {
    try {
      const license = await this.licenseManager.getLicenseInfo();
      
      if (!license) {
        if (json) {
          console.log(JSON.stringify({ status: 'no_license', message: 'No license found' }, null, 2));
        } else {
          console.log(chalk.red('❌ No license found'));
          console.log(chalk.blue('💡 Activate a license: xaheen license activate <key>'));
        }
        return;
      }

      const expiration = await this.licenseManager.checkExpiration();
      const usage = await this.licenseManager.getUsageMetrics();

      if (json) {
        console.log(JSON.stringify({
          status: 'active',
          license: {
            tier: license.tier,
            customer: license.metadata.customerName,
            organization: license.metadata.organizationName,
            email: license.metadata.customerEmail,
            type: license.metadata.licenseType,
            expiresAt: license.expiresAt,
            features: license.features,
            expiration,
            usage,
          },
        }, null, 2));
      } else {
        console.log(chalk.bold('📋 License Status'));
        console.log(`Tier: ${chalk.cyan(license.tier)}`);
        console.log(`Customer: ${chalk.cyan(license.metadata.customerName)}`);
        if (license.metadata.organizationName) {
          console.log(`Organization: ${chalk.cyan(license.metadata.organizationName)}`);
        }
        console.log(`Email: ${chalk.cyan(license.metadata.customerEmail)}`);
        console.log(`Type: ${chalk.cyan(license.metadata.licenseType)}`);
        console.log(`Expires: ${chalk.cyan(new Date(license.expiresAt).toLocaleDateString())}`);
        
        // Expiration status
        if (expiration.expired) {
          if (expiration.inGracePeriod) {
            console.log(chalk.yellow(`Status: Expired ${Math.abs(expiration.daysUntilExpiration)} days ago (Grace period)`));
          } else {
            console.log(chalk.red(`Status: Expired ${Math.abs(expiration.daysUntilExpiration)} days ago`));
          }
        } else if (expiration.expiring) {
          console.log(chalk.yellow(`Status: Expires in ${expiration.daysUntilExpiration} days`));
        } else {
          console.log(chalk.green('Status: Active'));
        }

        console.log(`Features: ${chalk.cyan(license.features.length)} available`);
        
        if (usage) {
          console.log(`Total usage: ${chalk.cyan(usage.totalInvocations)} invocations`);
          console.log(`Last used: ${chalk.cyan(new Date(usage.lastUsed).toLocaleString())}`);
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ Error retrieving license status'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleFeatures(showAll: boolean, json: boolean): Promise<void> {
    try {
      const license = await this.licenseManager.getLicenseInfo();
      const allTiers = this.licenseManager.getAllLicenseTiers();
      
      if (!license) {
        console.log(chalk.red('❌ No license found'));
        return;
      }

      if (json) {
        const data = {
          tier: license.tier,
          availableFeatures: license.features,
          ...(showAll && {
            allTiers: Object.entries(allTiers).map(([tier, info]) => ({
              tier,
              name: info.name,
              features: info.features,
              price: info.price,
            })),
          }),
        };
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log(chalk.bold(`📦 License Features (${license.tier})`));
      
      if (showAll) {
        // Show all tiers and their features
        for (const [tierKey, tierInfo] of Object.entries(allTiers)) {
          const isCurrentTier = tierKey === license.tier;
          const tierName = isCurrentTier ? `${tierInfo.name} (Current)` : tierInfo.name;
          
          console.log(`\n${chalk.bold(tierName)}:`);
          if (tierInfo.price) {
            console.log(`  Price: $${chalk.green(tierInfo.price.monthly)}/month, $${chalk.green(tierInfo.price.yearly)}/year`);
          }
          
          const groups = this.groupFeaturesByCategory(tierInfo.features);
          for (const [category, features] of Object.entries(groups)) {
            if (features.length > 0) {
              console.log(`  ${this.getCategoryIcon(category)} ${category}:`);
              features.forEach(feature => {
                const hasFeature = license.features.includes(feature);
                const icon = hasFeature ? chalk.green('✓') : chalk.red('✗');
                console.log(`    ${icon} ${feature}`);
              });
            }
          }
        }
      } else {
        // Show only current license features
        const groups = this.groupFeaturesByCategory(license.features);
        for (const [category, features] of Object.entries(groups)) {
          if (features.length > 0) {
            console.log(`\n${this.getCategoryIcon(category)} ${chalk.bold(category)}:`);
            features.forEach(feature => {
              console.log(`  ${chalk.green('✓')} ${feature}`);
            });
          }
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ Error retrieving features'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleValidate(verbose: boolean): Promise<void> {
    try {
      console.log(chalk.blue('🔍 Validating license...'));
      
      const result = await this.licenseManager.validateLicense();
      
      if (result.valid) {
        console.log(chalk.green('✅ License is valid'));
        
        if (verbose && result.license) {
          console.log(`License ID: ${chalk.cyan(result.license.id)}`);
          console.log(`Customer ID: ${chalk.cyan(result.license.customerId)}`);
          console.log(`Issued: ${chalk.cyan(new Date(result.license.issuedAt).toLocaleString())}`);
          console.log(`Expires: ${chalk.cyan(new Date(result.license.expiresAt).toLocaleString())}`);
        }
      } else {
        console.log(chalk.red('❌ License validation failed'));
        if (result.error) {
          console.log(chalk.red(`Error: ${result.error}`));
        }
        if (result.issues && verbose) {
          console.log(chalk.red('Issues:'));
          result.issues.forEach(issue => {
            console.log(chalk.red(`  • ${issue}`));
          });
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ License validation error'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleDeactivate(confirm: boolean): Promise<void> {
    try {
      if (!confirm) {
        // In a real implementation, you'd use a proper prompt library
        console.log(chalk.yellow('⚠️  This will deactivate your current license.'));
        console.log('You will need to reactivate to continue using Xaheen features.');
        console.log('Use --confirm to proceed without this prompt.');
        return;
      }

      await this.licenseManager.deactivateLicense();
      console.log(chalk.green('✅ License deactivated successfully'));
    } catch (error) {
      console.log(chalk.red('❌ License deactivation failed'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleUpgrade(tier?: LicenseTier): Promise<void> {
    try {
      const currentLicense = await this.licenseManager.getLicenseInfo();
      const allTiers = this.licenseManager.getAllLicenseTiers();

      console.log(chalk.bold('🚀 License Upgrade Options'));

      if (currentLicense) {
        console.log(`Current tier: ${chalk.cyan(currentLicense.tier)}`);
      }

      if (tier) {
        // Show specific tier information
        const tierInfo = allTiers[tier];
        if (tierInfo) {
          console.log(`\n${chalk.bold(tierInfo.name)} (${tier}):`);
          console.log(`Description: ${tierInfo.description}`);
          if (tierInfo.price) {
            console.log(`Price: $${chalk.green(tierInfo.price.monthly)}/month, $${chalk.green(tierInfo.price.yearly)}/year`);
          }
          console.log(`Features: ${tierInfo.features.length} included`);
          
          const groups = this.groupFeaturesByCategory(tierInfo.features);
          for (const [category, features] of Object.entries(groups)) {
            if (features.length > 0) {
              console.log(`  ${this.getCategoryIcon(category)} ${category}: ${features.length} features`);
            }
          }
        }
      } else {
        // Show all tiers
        const tierOrder: LicenseTier[] = ['frontend', 'backend', 'fullstack', 'enterprise'];
        
        for (const tierKey of tierOrder) {
          const tierInfo = allTiers[tierKey];
          const isCurrent = currentLicense?.tier === tierKey;
          const tierName = isCurrent ? `${tierInfo.name} (Current)` : tierInfo.name;
          
          console.log(`\n${chalk.bold(tierName)}:`);
          console.log(`  ${tierInfo.description}`);
          if (tierInfo.price) {
            console.log(`  Price: $${chalk.cyan(tierInfo.price.monthly)}/month, $${chalk.cyan(tierInfo.price.yearly)}/year`);
          }
          console.log(`  Features: ${chalk.cyan(tierInfo.features.length)} included`);
        }

        console.log(`\n${chalk.bold('Add-on Packs:')}`);
        const addons = this.licenseManager.getAddonPacks();
        for (const [packId, pack] of Object.entries(addons)) {
          console.log(`\n${chalk.bold(pack.name)}:`);
          console.log(`  ${pack.description}`);
          console.log(`  Price: $${chalk.cyan(pack.price.monthly)}/month, $${chalk.cyan(pack.price.yearly)}/year`);
          console.log(`  Compatible with: ${pack.compatibleTiers.join(', ')}`);
        }
      }

      console.log(`\n${chalk.blue('💡 Upgrade at: https://xala.tech/upgrade')}`);
    } catch (error) {
      console.log(chalk.red('❌ Error retrieving upgrade information'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleUsage(json: boolean): Promise<void> {
    try {
      const usage = await this.licenseManager.getUsageMetrics();
      
      if (!usage) {
        console.log(chalk.yellow('⚠️  No usage data available'));
        return;
      }

      if (json) {
        console.log(JSON.stringify(usage, null, 2));
        return;
      }

      console.log(chalk.bold('📊 License Usage Analytics'));
      console.log(`Total invocations: ${chalk.cyan(usage.totalInvocations)}`);
      console.log(`Last used: ${chalk.cyan(new Date(usage.lastUsed).toLocaleString())}`);

      // Feature usage
      const featureUsage = Object.entries(usage.featureUsage)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10);

      if (featureUsage.length > 0) {
        console.log(chalk.bold('\nTop Features Used:'));
        featureUsage.forEach(([feature, count]) => {
          console.log(`  ${feature}: ${chalk.cyan(count)} times`);
        });
      }

      // Generator usage
      const sortedUsage = Object.entries(usage.generatorUsage)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10);

      if (sortedUsage.length > 0) {
        console.log(chalk.bold('\nTop Generators Used:'));
        sortedUsage.forEach(([generator, count]) => {
          console.log(`  ${generator}: ${chalk.cyan(count)} times`);
        });
      }
    } catch (error) {
      console.log(chalk.red('❌ Error retrieving usage data'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleRenew(): Promise<void> {
    try {
      const license = await this.licenseManager.getLicenseInfo();
      
      if (!license) {
        console.log(chalk.red('❌ No license found to renew'));
        return;
      }

      const expiration = await this.licenseManager.checkExpiration();
      
      console.log(chalk.blue('🔄 License Renewal'));
      console.log(`Current license: ${chalk.cyan(license.tier)}`);
      
      if (expiration.expired) {
        console.log(chalk.red(`License expired ${Math.abs(expiration.daysUntilExpiration)} days ago`));
      } else if (expiration.expiring) {
        console.log(chalk.yellow(`License expires in ${expiration.daysUntilExpiration} days`));
      } else {
        console.log(chalk.green('License is not expiring soon'));
      }

      console.log(`\n${chalk.blue('💡 Renew at: https://xala.tech/renew')}`);
    } catch (error) {
      console.log(chalk.red('❌ Error processing renewal'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleAddons(): Promise<void> {
    try {
      const addons = this.licenseManager.getAddonPacks();
      const currentLicense = await this.licenseManager.getLicenseInfo();

      console.log(chalk.bold('🧩 Available Add-on Packs'));

      for (const [packId, pack] of Object.entries(addons)) {
        console.log(`\n${chalk.bold(pack.name)}:`);
        console.log(`  ${pack.description}`);
        console.log(`  Price: $${chalk.cyan(pack.price.monthly)}/month, $${chalk.cyan(pack.price.yearly)}/year`);
        console.log(`  Compatible with: ${pack.compatibleTiers.join(', ')}`);
        console.log(`  Features: ${pack.features.join(', ')}`);
        
        if (currentLicense) {
          const compatible = pack.compatibleTiers.includes(currentLicense.tier);
          const status = compatible ? chalk.green('Compatible') : chalk.yellow('Requires tier upgrade');
          console.log(`  Status: ${status}`);
        }
      }

      console.log(`\n${chalk.blue('💡 Purchase add-ons at: https://xala.tech/addons')}`);
    } catch (error) {
      console.log(chalk.red('❌ Error retrieving add-on information'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleInteractiveMenu(): Promise<void> {
    // This would implement an interactive CLI menu
    // For now, show a simple menu
    console.log(chalk.bold('🎛️  License Management Menu'));
    console.log('1. View license status');
    console.log('2. View available features');
    console.log('3. Validate license');
    console.log('4. View upgrade options');
    console.log('5. View usage analytics');
    console.log('6. Deactivate license');
    console.log('\nUse specific commands: xaheen license <command>');
  }

  private async handleDoctor(): Promise<void> {
    console.log(chalk.bold('🩺 License System Diagnostics'));
    
    try {
      // Check license file existence
      const license = await this.licenseManager.getLicenseInfo();
      console.log(`License file: ${license ? chalk.green('✓ Found') : chalk.red('✗ Not found')}`);
      
      if (license) {
        // Validate license
        const validation = await this.licenseManager.validateLicense();
        console.log(`License validity: ${validation.valid ? chalk.green('✓ Valid') : chalk.red('✗ Invalid')}`);
        
        // Check expiration
        const expiration = await this.licenseManager.checkExpiration();
        const expirationStatus = expiration.expired 
          ? (expiration.inGracePeriod ? chalk.yellow('⚠ Expired (Grace)') : chalk.red('✗ Expired'))
          : (expiration.expiring ? chalk.yellow('⚠ Expiring') : chalk.green('✓ Active'));
        console.log(`License status: ${expirationStatus}`);
        
        // Check features
        console.log(`Available features: ${chalk.cyan(license.features.length)}`);
      }
      
      // Check usage metrics
      const usage = await this.licenseManager.getUsageMetrics();
      console.log(`Usage tracking: ${usage ? chalk.green('✓ Active') : chalk.yellow('⚠ No data')}`);
      
      // System checks
      console.log(`Node.js version: ${chalk.cyan(process.version)}`);
      console.log(`Platform: ${chalk.cyan(process.platform)}`);
      
    } catch (error) {
      console.log(chalk.red('❌ Diagnostic error'));
      console.log(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
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
      case 'platform': return '⚛️';
      case 'generator': return '🏗️';
      case 'addon': return '🧩';
      case 'enterprise': return '🏢';
      case 'infra': return '☁️';
      case 'testing': return '🧪';
      case 'advanced': return '🚀';
      default: return '📦';
    }
  }
}

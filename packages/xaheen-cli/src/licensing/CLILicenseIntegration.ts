/**
 * Xaheen CLI License Integration
 * Enforces feature-gated licensing on CLI commands and generators
 */

import chalk from 'chalk';
import { LicenseManager } from './LicenseManager.js';
import { FeatureFlag, FeatureCheckResult, LicenseInfo } from './types.js';

export interface CLICommand {
  name: string;
  description: string;
  requiredFeatures: FeatureFlag[];
  category?: string;
}

export interface LicenseEnforcementOptions {
  /** Whether to show upgrade prompts when features are blocked */
  showUpgradePrompts: boolean;
  
  /** Whether to track usage for analytics */
  trackUsage: boolean;
  
  /** Grace period for expired licenses */
  allowGracePeriod: boolean;
}

export interface CommandExecutionResult {
  /** Whether the command is allowed to execute */
  allowed: boolean;
  
  /** Features that are blocked */
  blockedFeatures: FeatureFlag[];
  
  /** Upgrade information if blocked */
  upgradeInfo?: {
    tier: string;
    upgradeUrl: string;
    pricing: { monthly: number; yearly: number };
  };
  
  /** User-friendly message */
  message: string;
}

export class CLILicenseIntegration {
  private licenseManager: LicenseManager;
  private options: LicenseEnforcementOptions;

  public constructor(
    licenseManager: LicenseManager,
    options: Partial<LicenseEnforcementOptions> = {}
  ) {
    this.licenseManager = licenseManager;
    this.options = {
      showUpgradePrompts: true,
      trackUsage: true,
      allowGracePeriod: true,
      ...options,
    };
  }

  /**
   * Initialize the license integration
   */
  public async initialize(): Promise<void> {
    await this.licenseManager.initialize();
  }

  /**
   * Check if a command can be executed based on license
   */
  public async checkCommandExecution(command: CLICommand): Promise<CommandExecutionResult> {
    // Check all required features
    const featureChecks = await this.licenseManager.checkFeatures(command.requiredFeatures);
    
    // Find blocked features
    const blockedFeatures = command.requiredFeatures.filter(
      feature => !featureChecks[feature].allowed
    );

    // If all features are allowed, permit execution
    if (blockedFeatures.length === 0) {
      // Track usage if enabled
      if (this.options.trackUsage) {
        for (const feature of command.requiredFeatures) {
          await this.licenseManager.trackFeatureUsage(feature, command.name);
        }
      }
      
      return {
        allowed: true,
        blockedFeatures: [],
        message: `✅ Command '${command.name}' executed successfully`,
      };
    }

    // Find upgrade information
    const firstBlockedFeature = blockedFeatures[0];
    const featureCheck = firstBlockedFeature ? featureChecks[firstBlockedFeature] : null;
    
    let message = `🚫 Command '${command.name}' requires features not included in your license:\n`;
    
    for (const feature of blockedFeatures) {
      const check = featureChecks[feature];
      message += `   • ${feature}${check.reason ? ` (${check.reason})` : ''}\n`;
    }

    if (this.options.showUpgradePrompts && featureCheck?.upgradeAction) {
      message += `\n💡 Upgrade to ${featureCheck.upgradeAction.tier} to unlock this feature:\n`;
      message += `   ${featureCheck.upgradeAction.upgradeUrl}`;
    }

    return {
      allowed: false,
      blockedFeatures,
      upgradeInfo: featureCheck?.upgradeAction,
      message,
    };
  }

  /**
   * Get license-aware command list (filter commands based on license)
   */
  public async getAvailableCommands(allCommands: CLICommand[]): Promise<CLICommand[]> {
    const availableCommands: CLICommand[] = [];
    
    for (const command of allCommands) {
      const result = await this.checkCommandExecution(command);
      if (result.allowed) {
        availableCommands.push(command);
      }
    }
    
    return availableCommands;
  }

  /**
   * Generate license-aware help text
   */
  public async generateLicenseAwareHelp(allCommands: CLICommand[]): Promise<string> {
    const license = await this.licenseManager.getLicenseInfo();
    let help = '';

    if (!license) {
      help += chalk.yellow('⚠️  No license found. Some features may be restricted.\n');
      help += chalk.blue('💡 Activate a license: xaheen license activate <key>\n\n');
    } else {
      help += chalk.green(`✅ Licensed to: ${license.metadata.customerName} (${license.tier})\n\n`);
    }

    // Group commands by availability
    const availableCommands: CLICommand[] = [];
    const restrictedCommands: CLICommand[] = [];

    for (const command of allCommands) {
      const result = await this.checkCommandExecution(command);
      if (result.allowed) {
        availableCommands.push(command);
      } else {
        restrictedCommands.push(command);
      }
    }

    // Show available commands
    if (availableCommands.length > 0) {
      help += chalk.bold('Available Commands:\n');
      for (const command of availableCommands) {
        help += `  ${chalk.green('✓')} ${command.name.padEnd(20)} ${command.description}\n`;
      }
      help += '\n';
    }

    // Show restricted commands with upgrade hints
    if (restrictedCommands.length > 0 && this.options.showUpgradePrompts) {
      help += chalk.bold('Restricted Commands (Upgrade Required):\n');
      for (const command of restrictedCommands) {
        const result = await this.checkCommandExecution(command);
        const tier = result.upgradeInfo?.tier || 'enterprise';
        help += `  ${chalk.red('✗')} ${command.name.padEnd(20)} ${command.description}\n`;
        help += `      ${chalk.gray(`Requires: ${tier} license`)}\n`;
      }
      help += '\n';
      help += chalk.blue('💡 Upgrade your license: xaheen license upgrade\n');
    }

    return help;
  }

  /**
   * Display license status and warnings
   */
  public async displayLicenseStatus(): Promise<void> {
    const license = await this.licenseManager.getLicenseInfo();
    
    if (!license) {
      console.log(chalk.yellow('⚠️  No license found'));
      console.log(chalk.blue('💡 Activate a license: xaheen license activate <key>'));
      return;
    }

    const expiration = await this.licenseManager.checkExpiration();
    
    if (expiration.expired) {
      if (expiration.inGracePeriod) {
        console.log(chalk.yellow(`⚠️  License expired ${Math.abs(expiration.daysUntilExpiration)} days ago (Grace period active)`));
      } else {
        console.log(chalk.red(`❌ License expired ${Math.abs(expiration.daysUntilExpiration)} days ago`));
      }
      console.log(chalk.blue('💡 Renew your license: xaheen license renew'));
    } else if (expiration.expiring) {
      console.log(chalk.yellow(`⚠️  License expires in ${expiration.daysUntilExpiration} days`));
      console.log(chalk.blue('💡 Renew your license: xaheen license renew'));
    }
  }

  /**
   * Get license summary for display
   */
  public async getLicenseSummary(): Promise<string> {
    const license = await this.licenseManager.getLicenseInfo();
    
    if (!license) {
      return chalk.red('No License') + ' - ' + chalk.gray('Limited functionality');
    }

    const expiration = await this.licenseManager.checkExpiration();
    let status = '';
    
    if (expiration.expired) {
      status = expiration.inGracePeriod 
        ? chalk.yellow('Expired (Grace Period)')
        : chalk.red('Expired');
    } else if (expiration.expiring) {
      status = chalk.yellow(`Expires in ${expiration.daysUntilExpiration} days`);
    } else {
      status = chalk.green('Active');
    }

    return `${chalk.blue(license.tier)} License - ${status}`;
  }

  /**
   * Enforce license check before command execution
   */
  public async enforceCommand(command: CLICommand): Promise<boolean> {
    const result = await this.checkCommandExecution(command);
    
    if (!result.allowed) {
      console.log(result.message);
      return false;
    }
    
    return true;
  }

  /**
   * Track generator usage
   */
  public async trackGeneratorUsage(generatorName: string, features: FeatureFlag[]): Promise<void> {
    if (!this.options.trackUsage) return;
    
    for (const feature of features) {
      await this.licenseManager.trackFeatureUsage(feature, generatorName);
    }
  }

  /**
   * Get upgrade suggestions based on current usage
   */
  public async getUpgradeSuggestions(): Promise<string[]> {
    const usage = await this.licenseManager.getUsageMetrics();
    const license = await this.licenseManager.getLicenseInfo();
    
    if (!usage || !license) {
      return [];
    }

    const suggestions: string[] = [];
    
    // Analyze usage patterns and suggest upgrades
    const topFeatures = Object.entries(usage.featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    for (const [feature, count] of topFeatures) {
      if (!license.features.includes(feature as FeatureFlag)) {
        const tier = this.licenseManager['findMinimumTierForFeature'](feature as FeatureFlag);
        suggestions.push(`Consider upgrading to ${tier} for ${feature} (used ${count} times)`);
      }
    }

    return suggestions;
  }
}

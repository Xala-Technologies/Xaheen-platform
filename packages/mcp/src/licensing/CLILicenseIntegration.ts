/**
 * Xaheen Developer Bank - CLI License Integration
 * Enforces feature-gated access throughout the CLI
 */

import { LicenseManager } from './LicenseManager.js';
import { FeatureFlag, FeatureCheckResult, LicenseData } from './types.js';

export interface CLICommand {
  name: string;
  description: string;
  requiredFeatures: FeatureFlag[];
  category: 'generator' | 'scaffold' | 'tool' | 'utility';
}

export interface LicenseEnforcementOptions {
  /** Whether to show upgrade prompts */
  showUpgradePrompts: boolean;
  
  /** Whether to allow grace period usage */
  allowGracePeriod: boolean;
  
  /** Whether to track usage metrics */
  trackUsage: boolean;
  
  /** Custom upgrade URL */
  upgradeUrl?: string;
}

export class CLILicenseIntegration {
  private licenseManager: LicenseManager;
  private options: LicenseEnforcementOptions;

  constructor(licenseManager: LicenseManager, options?: Partial<LicenseEnforcementOptions>) {
    this.licenseManager = licenseManager;
    this.options = {
      showUpgradePrompts: true,
      allowGracePeriod: true,
      trackUsage: true,
      ...options,
    };
  }

  /**
   * Bootstrap licensing for CLI startup
   */
  async bootstrap(): Promise<{
    success: boolean;
    license?: LicenseData;
    warnings: string[];
    errors: string[];
  }> {
    try {
      await this.licenseManager.initialize();
      
      const validation = await this.licenseManager.validateLicense();
      const warnings: string[] = [];
      const errors: string[] = [];

      if (!validation.valid) {
        errors.push(...validation.errors);
        
        if (this.options.showUpgradePrompts) {
          errors.push('');
          errors.push('🚀 Get started with Xaheen:');
          errors.push('   xaheen license activate <your-license-key>');
          errors.push('');
          errors.push('💡 Don\'t have a license? Get one at: https://xala.tech/pricing');
        }
        
        return { success: false, warnings, errors };
      }

      warnings.push(...validation.warnings);

      // Check for expiration warnings
      const expiration = await this.licenseManager.checkExpiration();
      if (expiration.expiring) {
        warnings.push(`⚠️  License expires in ${expiration.daysUntilExpiration} days. Renew at: https://xala.tech/renew`);
      }

      return {
        success: true,
        license: validation.license,
        warnings,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        warnings: [],
        errors: [`License system error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Check if a CLI command is allowed
   */
  async checkCommand(command: CLICommand): Promise<{
    allowed: boolean;
    blockedFeatures: FeatureFlag[];
    upgradeInfo?: {
      tier: string;
      features: FeatureFlag[];
      upgradeUrl: string;
    };
    message?: string;
  }> {
    const featureChecks = await this.licenseManager.checkFeatures(command.requiredFeatures);
    const blockedFeatures = command.requiredFeatures.filter(feature => !featureChecks[feature].allowed);

    if (blockedFeatures.length === 0) {
      return { allowed: true, blockedFeatures: [] };
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
   * Get filtered list of available commands based on license
   */
  async getAvailableCommands(allCommands: CLICommand[]): Promise<{
    available: CLICommand[];
    restricted: CLICommand[];
    upgradePrompts: Array<{
      command: CLICommand;
      requiredTier: string;
      upgradeUrl: string;
    }>;
  }> {
    const available: CLICommand[] = [];
    const restricted: CLICommand[] = [];
    const upgradePrompts: Array<{
      command: CLICommand;
      requiredTier: string;
      upgradeUrl: string;
    }> = [];

    for (const command of allCommands) {
      const check = await this.checkCommand(command);
      
      if (check.allowed) {
        available.push(command);
      } else {
        restricted.push(command);
        
        if (check.upgradeInfo) {
          upgradePrompts.push({
            command,
            requiredTier: check.upgradeInfo.tier,
            upgradeUrl: check.upgradeInfo.upgradeUrl,
          });
        }
      }
    }

    return { available, restricted, upgradePrompts };
  }

  /**
   * Generate interactive menu with license-aware options
   */
  async generateLicenseAwareMenu(commands: CLICommand[]): Promise<{
    sections: Array<{
      title: string;
      commands: Array<{
        command: CLICommand;
        available: boolean;
        upgradeHint?: string;
      }>;
    }>;
    footerMessage?: string;
  }> {
    const { available, restricted, upgradePrompts } = await this.getAvailableCommands(commands);
    
    // Group by category
    const categories = ['generator', 'scaffold', 'tool', 'utility'] as const;
    const sections = [];

    for (const category of categories) {
      const categoryCommands = commands.filter(cmd => cmd.category === category);
      if (categoryCommands.length === 0) continue;

      const section = {
        title: this.getCategoryTitle(category),
        commands: categoryCommands.map(command => {
          const isAvailable = available.includes(command);
          const upgradePrompt = upgradePrompts.find(p => p.command === command);
          
          return {
            command,
            available: isAvailable,
            upgradeHint: upgradePrompt ? `Upgrade to ${upgradePrompt.requiredTier}` : undefined,
          };
        }),
      };

      sections.push(section);
    }

    // Generate footer message
    let footerMessage: string | undefined;
    if (restricted.length > 0 && this.options.showUpgradePrompts) {
      const license = await this.licenseManager.getLicenseInfo();
      footerMessage = `\n💡 ${restricted.length} features require an upgrade from your ${license?.tier || 'current'} license.\n`;
      footerMessage += `   View pricing: https://xala.tech/pricing`;
    }

    return { sections, footerMessage };
  }

  /**
   * Track generator usage for analytics
   */
  async trackGeneratorUsage(generatorName: string, features: FeatureFlag[]): Promise<void> {
    if (!this.options.trackUsage) return;

    try {
      // Track each feature usage
      for (const feature of features) {
        const check = await this.licenseManager.checkFeature(feature);
        if (check.allowed) {
          // Usage is automatically tracked in checkFeature
        }
      }

      // Track generator usage in metrics
      const metrics = await this.licenseManager.getUsageMetrics();
      if (metrics) {
        metrics.generatorUsage[generatorName] = (metrics.generatorUsage[generatorName] || 0) + 1;
      }
    } catch {
      // Ignore tracking errors
    }
  }

  /**
   * Display license status information
   */
  async getLicenseStatus(): Promise<{
    license: LicenseData | null;
    status: 'valid' | 'expired' | 'expiring' | 'invalid';
    message: string;
    actions: Array<{
      label: string;
      command: string;
      url?: string;
    }>;
  }> {
    const license = await this.licenseManager.getLicenseInfo();
    
    if (!license) {
      return {
        license: null,
        status: 'invalid',
        message: 'No license found. Activate a license to access Xaheen features.',
        actions: [
          {
            label: 'Activate License',
            command: 'xaheen license activate <license-key>',
          },
          {
            label: 'Get License',
            command: 'open https://xala.tech/pricing',
            url: 'https://xala.tech/pricing',
          },
        ],
      };
    }

    const expiration = await this.licenseManager.checkExpiration();
    const tierInfo = this.licenseManager.getLicenseTierInfo(license.tier);

    if (expiration.expired) {
      return {
        license,
        status: 'expired',
        message: `License expired ${Math.abs(expiration.daysUntilExpiration)} days ago.`,
        actions: [
          {
            label: 'Renew License',
            command: 'open https://xala.tech/renew',
            url: 'https://xala.tech/renew',
          },
        ],
      };
    }

    if (expiration.expiring) {
      return {
        license,
        status: 'expiring',
        message: `${tierInfo.name} license expires in ${expiration.daysUntilExpiration} days.`,
        actions: [
          {
            label: 'Renew License',
            command: 'open https://xala.tech/renew',
            url: 'https://xala.tech/renew',
          },
          {
            label: 'Upgrade License',
            command: 'open https://xala.tech/upgrade',
            url: 'https://xala.tech/upgrade',
          },
        ],
      };
    }

    return {
      license,
      status: 'valid',
      message: `${tierInfo.name} license active with ${license.features.length} features.`,
      actions: [
        {
          label: 'View Features',
          command: 'xaheen license features',
        },
        {
          label: 'Upgrade License',
          command: 'open https://xala.tech/upgrade',
          url: 'https://xala.tech/upgrade',
        },
      ],
    };
  }

  /**
   * Generate feature comparison table
   */
  async getFeatureComparison(): Promise<{
    currentTier: string;
    currentFeatures: FeatureFlag[];
    availableTiers: Array<{
      tier: string;
      name: string;
      price: { monthly: number; yearly: number } | undefined;
      features: FeatureFlag[];
      isUpgrade: boolean;
    }>;
  }> {
    const license = await this.licenseManager.getLicenseInfo();
    const currentTier = license?.tier || 'none';
    const currentFeatures = license?.features || [];
    
    const allTiers = this.licenseManager.getAllLicenseTiers();
    const availableTiers = Object.entries(allTiers).map(([tier, info]) => ({
      tier,
      name: info.name,
      price: info.price,
      features: info.features,
      isUpgrade: this.isTierUpgrade(currentTier, tier as any),
    }));

    return {
      currentTier,
      currentFeatures,
      availableTiers,
    };
  }

  // Private methods

  private getCategoryTitle(category: CLICommand['category']): string {
    switch (category) {
      case 'generator': return '🏗️  Generators';
      case 'scaffold': return '🚀 Scaffolding';
      case 'tool': return '🔧 Tools';
      case 'utility': return '⚙️  Utilities';
      default: return 'Commands';
    }
  }

  private isTierUpgrade(currentTier: string, targetTier: string): boolean {
    const tierOrder = ['frontend', 'backend', 'fullstack', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const targetIndex = tierOrder.indexOf(targetTier);
    
    return targetIndex > currentIndex;
  }
}

// Pre-defined CLI commands with their feature requirements
export const CLI_COMMANDS: CLICommand[] = [
  // Frontend Generators
  {
    name: 'generate component',
    description: 'Generate UI components',
    requiredFeatures: ['feature.frontend', 'generator.components'],
    category: 'generator',
  },
  {
    name: 'generate layout',
    description: 'Generate page layouts',
    requiredFeatures: ['feature.frontend', 'generator.layouts'],
    category: 'generator',
  },
  {
    name: 'generate form',
    description: 'Generate forms with validation',
    requiredFeatures: ['feature.frontend', 'generator.forms'],
    category: 'generator',
  },
  
  // Backend Generators
  {
    name: 'generate api',
    description: 'Generate REST APIs',
    requiredFeatures: ['feature.backend', 'generator.api'],
    category: 'generator',
  },
  {
    name: 'generate database',
    description: 'Generate database schemas and migrations',
    requiredFeatures: ['feature.backend', 'generator.database'],
    category: 'generator',
  },
  {
    name: 'generate auth',
    description: 'Generate authentication systems',
    requiredFeatures: ['feature.backend', 'generator.auth'],
    category: 'generator',
  },
  
  // Full-Stack Scaffolding
  {
    name: 'scaffold crud',
    description: 'Generate complete CRUD operations',
    requiredFeatures: ['feature.fullstack', 'generator.api', 'generator.components'],
    category: 'scaffold',
  },
  {
    name: 'scaffold app',
    description: 'Generate complete applications',
    requiredFeatures: ['feature.fullstack'],
    category: 'scaffold',
  },
  
  // Enterprise Features
  {
    name: 'generate bankid',
    description: 'Generate BankID integration',
    requiredFeatures: ['enterprise.bankid', 'enterprise.norwegian-compliance'],
    category: 'generator',
  },
  {
    name: 'generate multi-tenant',
    description: 'Generate multi-tenant architecture',
    requiredFeatures: ['addon.multi-tenancy'],
    category: 'generator',
  },
  {
    name: 'generate payments',
    description: 'Generate payment processing',
    requiredFeatures: ['addon.payments'],
    category: 'generator',
  },
  
  // AI Tools
  {
    name: 'ai enhance',
    description: 'AI-powered code enhancement',
    requiredFeatures: ['addon.ai-generators'],
    category: 'tool',
  },
  {
    name: 'mcp generate',
    description: 'MCP server-based generation',
    requiredFeatures: ['addon.mcp-tools'],
    category: 'tool',
  },
  
  // Infrastructure
  {
    name: 'generate docker',
    description: 'Generate Docker configurations',
    requiredFeatures: ['infra.docker'],
    category: 'generator',
  },
  {
    name: 'generate k8s',
    description: 'Generate Kubernetes manifests',
    requiredFeatures: ['infra.kubernetes'],
    category: 'generator',
  },
  {
    name: 'generate terraform',
    description: 'Generate Terraform configurations',
    requiredFeatures: ['infra.terraform'],
    category: 'generator',
  },
  
  // Testing
  {
    name: 'generate tests',
    description: 'Generate test suites',
    requiredFeatures: ['testing.unit'],
    category: 'generator',
  },
  {
    name: 'generate e2e',
    description: 'Generate end-to-end tests',
    requiredFeatures: ['testing.e2e'],
    category: 'generator',
  },
  
  // Utilities
  {
    name: 'license status',
    description: 'View license information',
    requiredFeatures: [],
    category: 'utility',
  },
  {
    name: 'license activate',
    description: 'Activate a license',
    requiredFeatures: [],
    category: 'utility',
  },
  {
    name: 'license upgrade',
    description: 'Upgrade license tier',
    requiredFeatures: [],
    category: 'utility',
  },
];

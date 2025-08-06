/**
 * Xaheen CLI License Manager
 * Handles license validation, feature checking, and usage tracking for CLI commands
 */

import { promises as fs, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import {
  LicenseData,
  SignedLicense,
  LicenseValidationResult,
  FeatureFlag,
  FeatureCheckResult,
  LicenseConfiguration,
  LicenseUsageMetrics,
  LicenseTier,
  LicenseTierDefinition,
  AddonPackDefinition,
  LICENSE_TIERS,
  ADDON_PACKS,
  ExpirationStatus,
  LicenseInfo,
  DEFAULT_LICENSE_CONFIG,
} from './types.js';

export class LicenseManager {
  private config: LicenseConfiguration;
  private cachedLicense?: LicenseData;
  private usageMetrics?: LicenseUsageMetrics;

  public constructor(config?: Partial<LicenseConfiguration>) {
    this.config = {
      ...DEFAULT_LICENSE_CONFIG,
      licensePath: path.join(os.homedir(), '.xaheen', 'license.json'),
      ...config,
    };
  }

  /**
   * Initialize the license manager
   */
  public async initialize(): Promise<void> {
    // Ensure license directory exists
    const licenseDir = path.dirname(this.config.licensePath);
    if (!existsSync(licenseDir)) {
      mkdirSync(licenseDir, { recursive: true });
    }
    
    // Load existing license if available
    await this.loadStoredLicense();
    
    // Initialize usage metrics
    await this.loadUsageMetrics();
  }

  /**
   * Activate a license with the provided license key
   */
  public async activateLicense(licenseKey: string): Promise<LicenseValidationResult> {
    try {
      // Fetch license from server
      const response = await fetch(`${this.config.serverUrl}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `License activation failed: ${response.statusText}`,
        };
      }

      const signedLicense = await response.json() as SignedLicense;
      
      // Validate the signed license
      const validation = await this.validateSignedLicense(signedLicense);
      
      if (validation.valid && validation.license) {
        // Store the license locally
        await fs.writeFile(this.config.licensePath, JSON.stringify(signedLicense, null, 2));
        this.cachedLicense = validation.license;
      }

      return validation;
    } catch (error) {
      return {
        valid: false,
        error: `License activation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate the current license
   */
  public async validateLicense(): Promise<LicenseValidationResult> {
    try {
      const signedLicense = await this.loadStoredLicense();
      if (!signedLicense) {
        return {
          valid: false,
          error: 'No license found. Please activate a license first.',
        };
      }

      return await this.validateSignedLicense(signedLicense);
    } catch (error) {
      return {
        valid: false,
        error: `License validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if a specific feature is allowed
   */
  public async checkFeature(feature: FeatureFlag): Promise<FeatureCheckResult> {
    const validation = await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return {
        allowed: false,
        reason: validation.error || 'Invalid license',
        upgradeAction: {
          tier: this.findMinimumTierForFeature(feature),
          upgradeUrl: `${this.config.serverUrl}/upgrade`,
          pricing: this.getPricingForFeature(feature),
        },
      };
    }

    const license = validation.license;
    
    // Check if license is expired
    const expiration = this.checkLicenseExpiration(license);
    if (expiration.expired && !expiration.inGracePeriod) {
      return {
        allowed: false,
        reason: 'License expired',
        upgradeAction: {
          tier: license.tier,
          upgradeUrl: `${this.config.serverUrl}/renew`,
          pricing: LICENSE_TIERS[license.tier].price || { monthly: 0, yearly: 0 },
        },
      };
    }

    // Check if feature is included
    if (license.features.includes(feature)) {
      // Track usage
      await this.trackFeatureUsage(feature);
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Feature '${feature}' not included in ${license.tier} license`,
      upgradeAction: {
        tier: this.findMinimumTierForFeature(feature),
        upgradeUrl: `${this.config.serverUrl}/upgrade`,
        pricing: this.getPricingForFeature(feature),
      },
    };
  }

  /**
   * Check multiple features at once
   */
  public async checkFeatures(features: FeatureFlag[]): Promise<Record<FeatureFlag, FeatureCheckResult>> {
    const results: Record<FeatureFlag, FeatureCheckResult> = {} as Record<FeatureFlag, FeatureCheckResult>;
    
    for (const feature of features) {
      results[feature] = await this.checkFeature(feature);
    }
    
    return results;
  }

  /**
   * Get current license information
   */
  public async getLicenseInfo(): Promise<LicenseData | null> {
    if (this.cachedLicense) {
      return this.cachedLicense;
    }
    
    const validation = await this.validateLicense();
    return validation.license || null;
  }

  /**
   * Get available features for current license
   */
  public async getAvailableFeatures(): Promise<FeatureFlag[]> {
    const license = await this.getLicenseInfo();
    return license?.features || [];
  }

  /**
   * Get license tier information
   */
  public getLicenseTierInfo(tier: LicenseTier): LicenseTierDefinition {
    return LICENSE_TIERS[tier];
  }

  /**
   * Get all available license tiers
   */
  public getAllLicenseTiers(): Record<LicenseTier, LicenseTierDefinition> {
    return LICENSE_TIERS;
  }

  /**
   * Get available add-on packs
   */
  public getAddonPacks(): Record<string, AddonPackDefinition> {
    return ADDON_PACKS;
  }

  /**
   * Check if license is expiring soon
   */
  public async checkExpiration(): Promise<ExpirationStatus> {
    const license = await this.getLicenseInfo();
    if (!license) {
      return {
        expired: true,
        expiring: false,
        daysUntilExpiration: -999,
        inGracePeriod: false,
      };
    }

    return this.checkLicenseExpiration(license);
  }

  /**
   * Get usage metrics
   */
  public async getUsageMetrics(): Promise<LicenseUsageMetrics | null> {
    return this.usageMetrics || null;
  }

  /**
   * Deactivate the current license
   */
  public async deactivateLicense(): Promise<void> {
    try {
      await fs.rm(this.config.licensePath, { force: true });
      this.cachedLicense = undefined;
    } catch (error) {
      throw new Error(`Failed to deactivate license: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track feature usage for analytics
   */
  public async trackFeatureUsage(feature: FeatureFlag, generator?: string): Promise<void> {
    if (!this.config.telemetryEnabled) {
      return;
    }

    if (!this.usageMetrics) {
      this.usageMetrics = {
        featureUsage: {} as Record<FeatureFlag, number>,
        generatorUsage: {},
        lastUsed: new Date().toISOString(),
        totalInvocations: 0,
      };
    }

    // Update feature usage
    this.usageMetrics.featureUsage[feature] = (this.usageMetrics.featureUsage[feature] || 0) + 1;
    
    // Update generator usage if provided
    if (generator) {
      this.usageMetrics.generatorUsage[generator] = (this.usageMetrics.generatorUsage[generator] || 0) + 1;
    }
    
    // Update totals
    this.usageMetrics.lastUsed = new Date().toISOString();
    this.usageMetrics.totalInvocations += 1;

    // Save metrics
    await this.saveUsageMetrics();
  }

  // Private helper methods

  private async loadStoredLicense(): Promise<SignedLicense | null> {
    try {
      if (existsSync(this.config.licensePath)) {
        const content = await fs.readFile(this.config.licensePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      // Ignore errors, return null
    }
    return null;
  }

  private async validateSignedLicense(signedLicense: SignedLicense): Promise<LicenseValidationResult> {
    try {
      // Decode license data
      const licenseData: LicenseData = JSON.parse(
        Buffer.from(signedLicense.data, 'base64').toString('utf-8')
      );

      // Verify signature (simplified - in production, use proper crypto verification)
      const expectedSignature = crypto
        .createHmac('sha256', this.config.publicKey || 'default-key')
        .update(signedLicense.data)
        .digest('hex');

      if (signedLicense.signature !== expectedSignature && this.config.publicKey) {
        return {
          valid: false,
          error: 'Invalid license signature',
        };
      }

      // Check expiration
      const now = new Date();
      const expiresAt = new Date(licenseData.expiresAt);
      
      if (expiresAt < now) {
        const expiration = this.checkLicenseExpiration(licenseData);
        if (!expiration.inGracePeriod) {
          return {
            valid: false,
            error: 'License expired',
            license: licenseData,
          };
        }
      }

      return {
        valid: true,
        license: licenseData,
      };
    } catch (error) {
      return {
        valid: false,
        error: `License validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private checkLicenseExpiration(license: LicenseData): ExpirationStatus {
    const now = new Date();
    const expiresAt = new Date(license.expiresAt);
    const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const expired = daysUntilExpiration < 0;
    const expiring = daysUntilExpiration <= this.config.warningThresholdDays && daysUntilExpiration > 0;
    const inGracePeriod = expired && Math.abs(daysUntilExpiration) <= this.config.gracePeriodDays;

    return {
      expired,
      expiring,
      daysUntilExpiration,
      inGracePeriod,
    };
  }

  private async loadUsageMetrics(): Promise<void> {
    try {
      const metricsPath = path.join(path.dirname(this.config.licensePath), 'usage.json');
      if (existsSync(metricsPath)) {
        const content = await fs.readFile(metricsPath, 'utf-8');
        this.usageMetrics = JSON.parse(content);
      }
    } catch (error) {
      // Initialize empty metrics if loading fails
      this.usageMetrics = {
        featureUsage: {} as Record<FeatureFlag, number>,
        generatorUsage: {},
        lastUsed: new Date().toISOString(),
        totalInvocations: 0,
      };
    }
  }

  private async saveUsageMetrics(): Promise<void> {
    if (!this.usageMetrics) return;
    
    try {
      const metricsPath = path.join(path.dirname(this.config.licensePath), 'usage.json');
      await fs.writeFile(metricsPath, JSON.stringify(this.usageMetrics, null, 2));
    } catch {
      // Ignore save errors for metrics
    }
  }

  private findMinimumTierForFeature(feature: FeatureFlag): LicenseTier {
    // Check license tiers in order of price
    const tierOrder: LicenseTier[] = ['frontend', 'backend', 'fullstack', 'enterprise'];
    
    for (const tier of tierOrder) {
      if (LICENSE_TIERS[tier].features.includes(feature)) {
        return tier;
      }
    }

    // Check add-on packs
    for (const [packId, pack] of Object.entries(ADDON_PACKS)) {
      if (pack.features.includes(feature)) {
        // Return the minimum compatible tier, fallback to enterprise if none specified
        return pack.compatibleTiers[0] || 'enterprise';
      }
    }

    // Default to enterprise if feature not found
    return 'enterprise';
  }

  private getPricingForFeature(feature: FeatureFlag): { monthly: number; yearly: number } {
    const tier = this.findMinimumTierForFeature(feature);
    return LICENSE_TIERS[tier].price || { monthly: 0, yearly: 0 };
  }
}

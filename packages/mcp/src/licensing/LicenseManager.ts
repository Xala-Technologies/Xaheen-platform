/**
 * Xaheen Developer Bank - License Manager
 * Core licensing system for feature-gated CLI access
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import {
  LicenseData,
  SignedLicense,
  LicenseValidationResult,
  FeatureCheckResult,
  FeatureFlag,
  LicenseConfiguration,
  LicenseUsageMetrics,
  LicenseTier,
  LicenseTierDefinition,
  AddonPackDefinition,
  LICENSE_TIERS,
  ADDON_PACKS,
} from './types.js';

export class LicenseManager {
  private config: LicenseConfiguration;
  private cachedLicense?: LicenseData;
  private usageMetrics?: LicenseUsageMetrics;

  public constructor(config?: Partial<LicenseConfiguration>) {
    this.config = {
      serverUrl: 'https://license.xala.tech',
      publicKey: '', // Will be loaded from config
      licensePath: path.join(os.homedir(), '.xaheen', 'license.json'),
      telemetryEnabled: true,
      gracePeriodDays: 7,
      warningThresholdDays: 30,
      ...config,
    };
  }

  /**
   * Initialize the license manager
   */
  public async initialize(): Promise<void> {
    // Ensure license directory exists
    const licenseDir = path.dirname(this.config.licensePath);
    await fs.ensureDir(licenseDir);

    // Load existing license if available
    await this.loadLicense();

    // Load usage metrics
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
          errors: [`Failed to activate license: ${response.statusText}`],
          warnings: [],
        };
      }

      const signedLicense: SignedLicense = await response.json();

      // Validate and store the license
      const validationResult = await this.validateSignedLicense(signedLicense);
      
      if (validationResult.valid && validationResult.license) {
        await this.storeLicense(signedLicense);
        this.cachedLicense = validationResult.license;
      }

      return validationResult;
    } catch (error) {
      return {
        valid: false,
        errors: [`License activation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
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
          errors: ['No license found. Please activate a license with: xaheen license activate <key>'],
          warnings: [],
        };
      }

      return await this.validateSignedLicense(signedLicense);
    } catch (error) {
      return {
        valid: false,
        errors: [`License validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
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
        reason: 'No valid license found',
        upgradeAction: {
          tier: 'fullstack',
          features: [feature],
          upgradeUrl: `${this.config.serverUrl}/upgrade`,
        },
      };
    }

    const license = validation.license;
    
    // Check if feature is included
    if (license.features.includes(feature)) {
      // Track usage if telemetry is enabled
      if (this.config.telemetryEnabled) {
        await this.trackFeatureUsage(feature);
      }
      
      return { allowed: true };
    }

    // Find the minimum tier that includes this feature
    const suggestedTier = this.findMinimumTierForFeature(feature);
    
    return {
      allowed: false,
      reason: `Feature '${feature}' is not included in your ${license.tier} license`,
      upgradeAction: {
        tier: suggestedTier,
        features: [feature],
        upgradeUrl: `${this.config.serverUrl}/upgrade?feature=${feature}&current=${license.tier}`,
      },
    };
  }

  /**
   * Check multiple features at once
   */
  public async checkFeatures(features: FeatureFlag[]): Promise<Record<FeatureFlag, FeatureCheckResult>> {
    const results: Record<FeatureFlag, FeatureCheckResult> = {} as any;
    
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
  public async checkExpiration(): Promise<{
    expiring: boolean;
    daysUntilExpiration: number;
    expired: boolean;
  }> {
    const license = await this.getLicenseInfo();
    
    if (!license) {
      return { expiring: false, daysUntilExpiration: 0, expired: true };
    }

    const now = new Date();
    const expirationDate = new Date(license.expiresAt);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      expiring: daysUntilExpiration <= this.config.warningThresholdDays && daysUntilExpiration > 0,
      daysUntilExpiration,
      expired: daysUntilExpiration <= 0,
    };
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
      await fs.remove(this.config.licensePath);
      this.cachedLicense = undefined;
    } catch (error) {
      throw new Error(`Failed to deactivate license: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private methods

  private async validateSignedLicense(signedLicense: SignedLicense): Promise<LicenseValidationResult> {
    try {
      // Verify signature
      const isValidSignature = this.verifySignature(signedLicense);
      if (!isValidSignature) {
        return {
          valid: false,
          errors: ['Invalid license signature'],
          warnings: [],
        };
      }

      // Decode license data
      const licenseData: LicenseData = JSON.parse(
        Buffer.from(signedLicense.data, 'base64').toString('utf-8')
      );

      // Validate license data
      const validation = this.validateLicenseData(licenseData);
      if (!validation.valid) {
        return validation;
      }

      // Check expiration
      const now = new Date();
      const expirationDate = new Date(licenseData.expiresAt);
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const warnings: string[] = [];
      
      if (daysUntilExpiration <= 0) {
        // Check grace period
        if (Math.abs(daysUntilExpiration) <= this.config.gracePeriodDays) {
          warnings.push(`License expired ${Math.abs(daysUntilExpiration)} days ago. Grace period ends in ${this.config.gracePeriodDays + daysUntilExpiration} days.`);
        } else {
          return {
            valid: false,
            errors: ['License has expired'],
            warnings: [],
          };
        }
      } else if (daysUntilExpiration <= this.config.warningThresholdDays) {
        warnings.push(`License expires in ${daysUntilExpiration} days. Please renew soon.`);
      }

      return {
        valid: true,
        errors: [],
        warnings,
        license: licenseData,
        daysUntilExpiration,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`License validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }

  private validateLicenseData(license: LicenseData): LicenseValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!license.id) errors.push('License ID is required');
    if (!license.customerId) errors.push('Customer ID is required');
    if (!license.tier) errors.push('License tier is required');
    if (!license.features || !Array.isArray(license.features)) errors.push('License features are required');
    if (!license.expiresAt) errors.push('License expiration date is required');
    if (!license.issuedAt) errors.push('License issue date is required');

    // Validate tier
    if (license.tier && !Object.keys(LICENSE_TIERS).includes(license.tier)) {
      errors.push(`Invalid license tier: ${license.tier}`);
    }

    // Validate dates
    try {
      new Date(license.expiresAt);
      new Date(license.issuedAt);
    } catch {
      errors.push('Invalid date format in license');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  private verifySignature(signedLicense: SignedLicense): boolean {
    try {
      if (!this.config.publicKey) {
        throw new Error('Public key not configured');
      }

      const verifier = crypto.createVerify(signedLicense.algorithm);
      verifier.update(signedLicense.data);
      
      return verifier.verify(this.config.publicKey, signedLicense.signature, 'base64');
    } catch {
      return false;
    }
  }

  private async loadStoredLicense(): Promise<SignedLicense | null> {
    try {
      if (await fs.pathExists(this.config.licensePath)) {
        const content = await fs.readFile(this.config.licensePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch {
      // Ignore errors, return null
    }
    return null;
  }

  private async storeLicense(signedLicense: SignedLicense): Promise<void> {
    await fs.writeFile(this.config.licensePath, JSON.stringify(signedLicense, null, 2));
  }

  private async loadLicense(): Promise<void> {
    const signedLicense = await this.loadStoredLicense();
    if (signedLicense) {
      const validation = await this.validateSignedLicense(signedLicense);
      if (validation.valid && validation.license) {
        this.cachedLicense = validation.license;
      }
    }
  }

  private async loadUsageMetrics(): Promise<void> {
    try {
      const metricsPath = path.join(path.dirname(this.config.licensePath), 'usage-metrics.json');
      if (await fs.pathExists(metricsPath)) {
        const content = await fs.readFile(metricsPath, 'utf-8');
        this.usageMetrics = JSON.parse(content);
      } else {
        this.usageMetrics = {
          featureUsage: {} as Record<FeatureFlag, number>,
          generatorUsage: {},
          lastUsed: new Date().toISOString(),
          totalInvocations: 0,
        };
      }
    } catch {
      // Initialize empty metrics on error
      this.usageMetrics = {
        featureUsage: {} as Record<FeatureFlag, number>,
        generatorUsage: {},
        lastUsed: new Date().toISOString(),
        totalInvocations: 0,
      };
    }
  }

  private async trackFeatureUsage(feature: FeatureFlag): Promise<void> {
    if (!this.usageMetrics) return;

    this.usageMetrics.featureUsage[feature] = (this.usageMetrics.featureUsage[feature] || 0) + 1;
    this.usageMetrics.lastUsed = new Date().toISOString();
    this.usageMetrics.totalInvocations++;

    // Save metrics
    try {
      const metricsPath = path.join(path.dirname(this.config.licensePath), 'usage-metrics.json');
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
        // Return the minimum compatible tier
        return pack.compatibleTiers[0];
      }
    }

    // Default to enterprise if feature not found
    return 'enterprise';
  }
}

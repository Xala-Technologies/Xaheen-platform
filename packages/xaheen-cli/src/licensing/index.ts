/**
 * Xaheen CLI Licensing System
 * Main exports for the feature-gated licensing system
 */

export { LicenseManager } from './LicenseManager.js';
export { CLILicenseIntegration } from './CLILicenseIntegration.js';
export { LicenseCommands } from './LicenseCommands.js';

export type {
  LicenseTier,
  FeatureFlag,
  LicenseData,
  SignedLicense,
  LicenseValidationResult,
  FeatureCheckResult,
  LicenseUsageMetrics,
  LicenseTierDefinition,
  AddonPackDefinition,
  LicenseConfiguration,
  ExpirationStatus,
  LicenseInfo,
} from './types.js';

export {
  LICENSE_TIERS,
  ADDON_PACKS,
  DEFAULT_LICENSE_CONFIG,
} from './types.js';

export type {
  CLICommand,
  LicenseEnforcementOptions,
  CommandExecutionResult,
} from './CLILicenseIntegration.js';

// Utility functions for easy integration
export const createLicenseManager = (config?: Partial<import('./types.js').LicenseConfiguration>): import('./LicenseManager.js').LicenseManager => {
  return new (require('./LicenseManager.js').LicenseManager)(config);
};

export const createLicenseIntegration = (
  licenseManager: import('./LicenseManager.js').LicenseManager,
  options?: Partial<import('./CLILicenseIntegration.js').LicenseEnforcementOptions>
): import('./CLILicenseIntegration.js').CLILicenseIntegration => {
  return new (require('./CLILicenseIntegration.js').CLILicenseIntegration)(licenseManager, options);
};

// Default configuration for CLI usage
export const CLI_LICENSE_CONFIG = {
  serverUrl: 'https://license.xala.tech',
  publicKey: process.env.XAHEEN_LICENSE_PUBLIC_KEY || '',
  licensePath: '', // Will be set to ~/.xaheen/license.json by LicenseManager
  telemetryEnabled: process.env.XAHEEN_TELEMETRY !== 'false',
  gracePeriodDays: 7,
  warningThresholdDays: 30,
} as const;

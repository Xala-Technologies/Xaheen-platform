/**
 * Xaheen Developer Bank - Licensing System
 * Main exports for the feature-gated licensing system
 */

export * from './types.js';
export * from './LicenseManager.js';
export * from './CLILicenseIntegration.js';
export * from './LicenseCommands.js';

// Re-export commonly used types and constants
export {
  LICENSE_TIERS,
  ADDON_PACKS,
} from './types.js';

export {
  CLI_COMMANDS,
} from './CLILicenseIntegration.js';

// Default license configuration
export const DEFAULT_LICENSE_CONFIG = {
  serverUrl: 'https://license.xala.tech',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef...
-----END PUBLIC KEY-----`,
  licensePath: '~/.xaheen/license.json',
  telemetryEnabled: true,
  gracePeriodDays: 7,
  warningThresholdDays: 30,
};

// Utility function to create a configured license manager
export function createLicenseManager(config?: Partial<any>) {
  const { LicenseManager } = require('./LicenseManager.js');
  return new LicenseManager({
    ...DEFAULT_LICENSE_CONFIG,
    ...config,
  });
}

// Utility function to create CLI integration
export function createCLIIntegration(licenseManager?: any, options?: any) {
  const { CLILicenseIntegration } = require('./CLILicenseIntegration.js');
  const manager = licenseManager || createLicenseManager();
  return new CLILicenseIntegration(manager, options);
}

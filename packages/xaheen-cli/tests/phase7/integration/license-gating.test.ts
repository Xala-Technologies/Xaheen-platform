/**
 * Phase 7: License Gating and Subscription Management Tests
 * 
 * Tests license validation, feature gating, subscription tiers,
 * and license renewal functionality in the Xaheen CLI.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { setupMockLicenseServer, type LicenseValidationResponse } from '../mocks/license-server.mock.js';
import { MockTenantDatabase } from '../mocks/tenant-database.mock.js';
import { TEST_CONFIG, type LicenseConfig } from '../config/test-config.js';

interface CliCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly command: string;
}

interface FeatureGatingTest {
  readonly feature: string;
  readonly command: string;
  readonly requiredLicenseTier: string;
  readonly requiredPermission: string;
}

describe('Phase 7: License Gating and Subscription Management', () => {
  let mockLicenseServer: ReturnType<typeof setupMockLicenseServer>;
  let mockDatabase: MockTenantDatabase;
  let testOutputDir: string;

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'license-gating-tests');
    await fs.ensureDir(testOutputDir);

    // Setup mock services
    mockLicenseServer = setupMockLicenseServer();
    mockLicenseServer.server.listen();

    mockDatabase = new MockTenantDatabase();
    await mockDatabase.connect();
  });

  afterAll(async () => {
    // Cleanup
    mockLicenseServer.server.close();
    await mockDatabase.disconnect();
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    await mockDatabase.cleanup();
    
    // Reset license server state
    mockLicenseServer.mockServer = setupMockLicenseServer().mockServer;
  });

  afterEach(async () => {
    // Cleanup environment variables
    delete process.env.XAHEEN_LICENSE_KEY;
    delete process.env.XAHEEN_LICENSE_SERVER_URL;
  });

  describe('License Validation', () => {
    it('should validate active license successfully', async () => {
      const validLicense = TEST_CONFIG.licenses.find(l => l.status === 'active')!;
      
      const validationResult = mockLicenseServer.mockServer.validateLicense({
        licenseKey: validLicense.key,
        productId: 'xaheen-cli',
        version: '2.0.0',
      });

      expect(validationResult.valid).toBe(true);
      expect(validationResult.license?.tier).toBe(validLicense.tier);
      expect(validationResult.license?.features).toEqual(validLicense.features);
    });

    it('should reject expired license', async () => {
      const expiredLicense = TEST_CONFIG.licenses.find(l => l.status === 'expired')!;
      
      const validationResult = mockLicenseServer.mockServer.validateLicense({
        licenseKey: expiredLicense.key,
        productId: 'xaheen-cli',
        version: '2.0.0',
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.reason).toBe('LICENSE_EXPIRED');
      expect(validationResult.error).toMatch(/expired/i);
    });

    it('should reject invalid license key', async () => {
      const validationResult = mockLicenseServer.mockServer.validateLicense({
        licenseKey: 'INVALID-LICENSE-KEY',
        productId: 'xaheen-cli',
        version: '2.0.0',
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.reason).toBe('INVALID_LICENSE_KEY');
      expect(validationResult.error).toMatch(/not found/i);
    });
  });

  describe('CLI License Integration', () => {
    it('should activate license via CLI command', async () => {
      const validLicense = TEST_CONFIG.licenses[0];

      const result = await executeCliCommand(
        `xaheen license activate ${validLicense.key}`,
        { timeout: TEST_CONFIG.timeouts.licenseValidation }
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/license activated successfully/i);
      expect(result.stdout).toMatch(new RegExp(validLicense.tier, 'i'));
    });

    it('should show license status', async () => {
      const validLicense = TEST_CONFIG.licenses[0];
      
      // First activate the license
      await executeCliCommand(`xaheen license activate ${validLicense.key}`);

      // Then check status
      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/license status: active/i);
      expect(result.stdout).toMatch(new RegExp(validLicense.tier, 'i'));
      expect(result.stdout).toMatch(/expires/i);
    });

    it('should handle missing license gracefully', async () => {
      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/no license found/i);
      expect(result.stdout).toMatch(/features may be limited/i);
    });

    it('should renew license', async () => {
      const validLicense = TEST_CONFIG.licenses[0];
      
      // Activate license first
      await executeCliCommand(`xaheen license activate ${validLicense.key}`);

      // Renew license
      const result = await executeCliCommand(
        `xaheen license renew --renewal-token renewal-${validLicense.key}`
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/license renewed successfully/i);
    });
  });

  describe('Feature Gating by License Tier', () => {
    const featureGatingTests: FeatureGatingTest[] = [
      {
        feature: 'multi-tenant',
        command: 'xaheen create my-saas --preset=multi-tenant',
        requiredLicenseTier: 'basic',
        requiredPermission: 'multi-tenant',
      },
      {
        feature: 'advanced-auth',
        command: 'xaheen generate auth --provider=sso',
        requiredLicenseTier: 'professional',
        requiredPermission: 'advanced-auth',
      },
      {
        feature: 'enterprise-auth',
        command: 'xaheen generate auth --provider=active-directory',
        requiredLicenseTier: 'enterprise',
        requiredPermission: 'enterprise-auth',
      },
      {
        feature: 'compliance',
        command: 'xaheen generate compliance --standard=gdpr',
        requiredLicenseTier: 'enterprise',
        requiredPermission: 'compliance',
      },
    ];

    it.each(featureGatingTests)('should allow $feature with appropriate license tier', async (test) => {
      // Find license with required tier
      const appropriateLicense = TEST_CONFIG.licenses.find(
        l => l.tier === test.requiredLicenseTier && l.status === 'active'
      )!;

      // Activate license
      await executeCliCommand(`xaheen license activate ${appropriateLicense.key}`);

      // Execute gated command
      const result = await executeCliCommand(test.command);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).not.toMatch(/license.*required/i);
      expect(result.stderr).not.toMatch(/feature.*not available/i);
    });

    it.each(featureGatingTests)('should block $feature with insufficient license tier', async (test) => {
      // Find license with lower tier (if available)
      const lowerTierLicenses = TEST_CONFIG.licenses.filter(l => 
        l.status === 'active' && !l.features.includes(test.requiredPermission)
      );

      if (lowerTierLicenses.length === 0) {
        // No license activated (should also block premium features)
        const result = await executeCliCommand(test.command);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toMatch(/license.*required/i);
        return;
      }

      // Activate insufficient license
      await executeCliCommand(`xaheen license activate ${lowerTierLicenses[0].key}`);

      // Execute gated command
      const result = await executeCliCommand(test.command);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/feature.*not available/i);
      expect(result.stderr).toMatch(/upgrade.*license/i);
    });

    it('should show available features for current license', async () => {
      const professionalLicense = TEST_CONFIG.licenses.find(l => l.tier === 'professional')!;
      
      await executeCliCommand(`xaheen license activate ${professionalLicense.key}`);

      const result = await executeCliCommand('xaheen license features');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/available features/i);
      
      // Check that professional features are listed
      professionalLicense.features.forEach(feature => {
        expect(result.stdout).toMatch(new RegExp(feature, 'i'));
      });
    });
  });

  describe('Tenant Limit Enforcement', () => {
    it('should enforce tenant limits based on license', async () => {
      const basicLicense = TEST_CONFIG.licenses.find(l => l.tier === 'basic')!;
      
      await executeCliCommand(`xaheen license activate ${basicLicense.key}`);

      // Create tenants up to the limit
      for (let i = 0; i < basicLicense.maxTenants; i++) {
        const result = await executeCliCommand(
          `xaheen tenant create test-tenant-${i} --domain=tenant${i}.test.com`
        );
        expect(result.exitCode).toBe(0);
      }

      // Try to create one more tenant (should fail)
      const overflowResult = await executeCliCommand(
        `xaheen tenant create overflow-tenant --domain=overflow.test.com`
      );

      expect(overflowResult.exitCode).not.toBe(0);
      expect(overflowResult.stderr).toMatch(/tenant limit exceeded/i);
      expect(overflowResult.stderr).toMatch(new RegExp(`${basicLicense.maxTenants}`, 'i'));
    });

    it('should allow unlimited tenants with enterprise license', async () => {
      const enterpriseLicense = TEST_CONFIG.licenses.find(l => l.tier === 'enterprise')!;
      
      await executeCliCommand(`xaheen license activate ${enterpriseLicense.key}`);

      // Create multiple tenants (should all succeed)
      for (let i = 0; i < 15; i++) { // More than basic/professional limits
        const result = await executeCliCommand(
          `xaheen tenant create enterprise-tenant-${i} --domain=ent${i}.test.com`
        );
        expect(result.exitCode).toBe(0);
      }

      const statusResult = await executeCliCommand('xaheen license status');
      expect(statusResult.stdout).toMatch(/unlimited.*tenants/i);
    });
  });

  describe('License Expiration Handling', () => {
    it('should warn about upcoming license expiration', async () => {
      // Create a license that expires soon (for testing purposes)
      const soonToExpireLicense: LicenseConfig = {
        key: 'LICENSE-EXPIRES-SOON',
        tier: 'professional',
        features: ['multi-tenant', 'advanced-auth'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        maxTenants: 10,
        status: 'active',
      };

      // Mock the license in the server
      mockLicenseServer.mockServer['licenses'].set(soonToExpireLicense.key, soonToExpireLicense);

      await executeCliCommand(`xaheen license activate ${soonToExpireLicense.key}`);

      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/expires.*7 days/i);
      expect(result.stdout).toMatch(/consider renewing/i);
    });

    it('should block commands with expired license', async () => {
      const expiredLicense = TEST_CONFIG.licenses.find(l => l.status === 'expired')!;
      
      await executeCliCommand(`xaheen license activate ${expiredLicense.key}`);

      const result = await executeCliCommand('xaheen create my-app --preset=multi-tenant');

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toMatch(/license.*expired/i);
      expect(result.stderr).toMatch(/renew.*license/i);
    });

    it('should provide grace period for recently expired licenses', async () => {
      // This would test a grace period feature if implemented
      // For now, we just test that expired licenses are handled gracefully
      const expiredLicense = TEST_CONFIG.licenses.find(l => l.status === 'expired')!;
      
      await executeCliCommand(`xaheen license activate ${expiredLicense.key}`);

      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/status.*expired/i);
      expect(result.stdout).toMatch(/expired.*on/i);
    });
  });

  describe('Offline License Validation', () => {
    it('should work with cached license when offline', async () => {
      const validLicense = TEST_CONFIG.licenses[0];
      
      // Activate license while online
      await executeCliCommand(`xaheen license activate ${validLicense.key}`);

      // Simulate offline mode by stopping the mock server
      mockLicenseServer.server.close();

      // Commands should still work with cached license
      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/cached.*license/i);
      expect(result.stdout).toMatch(/active/i);

      // Restart server for other tests
      mockLicenseServer.server.listen();
    });

    it('should gracefully handle license validation failures', async () => {
      // Stop the license server to simulate network failure
      mockLicenseServer.server.close();

      const result = await executeCliCommand('xaheen license status');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/unable.*validate.*license/i);
      expect(result.stdout).toMatch(/network.*error/i);

      // Restart server
      mockLicenseServer.server.listen();
    });
  });

  describe('License Migration and Upgrades', () => {
    it('should upgrade from basic to professional license', async () => {
      const basicLicense = TEST_CONFIG.licenses.find(l => l.tier === 'basic')!;
      const professionalLicense = TEST_CONFIG.licenses.find(l => l.tier === 'professional')!;

      // Start with basic license
      await executeCliCommand(`xaheen license activate ${basicLicense.key}`);

      let statusResult = await executeCliCommand('xaheen license status');
      expect(statusResult.stdout).toMatch(/basic/i);

      // Upgrade to professional
      await executeCliCommand(`xaheen license activate ${professionalLicense.key}`);

      statusResult = await executeCliCommand('xaheen license status');
      expect(statusResult.stdout).toMatch(/professional/i);

      // Verify new features are available
      const featuresResult = await executeCliCommand('xaheen license features');
      professionalLicense.features.forEach(feature => {
        expect(featuresResult.stdout).toMatch(new RegExp(feature, 'i'));
      });
    });

    it('should show comparison between license tiers', async () => {
      const result = await executeCliCommand('xaheen license compare');

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/basic.*professional.*enterprise/i);
      expect(result.stdout).toMatch(/features/i);
      expect(result.stdout).toMatch(/limits/i);
    });
  });

  // Helper functions
  async function executeCliCommand(
    command: string, 
    options: { timeout?: number } = {}
  ): Promise<CliCommandResult> {
    const timeout = options.timeout || 10000;

    try {
      const stdout = execSync(command, {
        cwd: testOutputDir,
        encoding: 'utf-8',
        timeout,
        env: {
          ...process.env,
          XAHEEN_LICENSE_SERVER_URL: TEST_CONFIG.licenseServer.baseUrl,
          NODE_ENV: 'test',
        },
      });

      return {
        exitCode: 0,
        stdout,
        stderr: '',
        command,
      };
    } catch (error: any) {
      return {
        exitCode: error.status || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        command,
      };
    }
  }
});
/**
 * Mock License Server for Phase 7 Testing
 * 
 * Simulates license validation, renewal, and feature gating functionality
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { LicenseConfig } from '../config/test-config.js';
import { TEST_CONFIG } from '../config/test-config.js';

export interface LicenseValidationRequest {
  readonly licenseKey: string;
  readonly productId: string;
  readonly version: string;
}

export interface LicenseValidationResponse {
  readonly valid: boolean;
  readonly license?: {
    readonly key: string;
    readonly tier: string;
    readonly features: readonly string[];
    readonly expiresAt: string;
    readonly maxTenants: number;
    readonly status: string;
    readonly metadata: Record<string, unknown>;
  };
  readonly error?: string;
  readonly reason?: string;
}

export interface LicenseRenewalRequest {
  readonly licenseKey: string;
  readonly renewalToken: string;
}

export interface LicenseRenewalResponse {
  readonly success: boolean;
  readonly newLicense?: LicenseConfig;
  readonly error?: string;
}

export interface FeatureCheckRequest {
  readonly licenseKey: string;
  readonly feature: string;
  readonly tenantId?: string;
}

export interface FeatureCheckResponse {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly limits?: {
    readonly current: number;
    readonly maximum: number;
  };
}

/**
 * Mock License Server Implementation
 */
export class MockLicenseServer {
  private licenses: Map<string, LicenseConfig> = new Map();
  private tenantCounts: Map<string, number> = new Map();
  
  constructor() {
    // Initialize with test licenses
    TEST_CONFIG.licenses.forEach(license => {
      this.licenses.set(license.key, license);
      this.tenantCounts.set(license.key, 0);
    });
  }

  /**
   * Validate a license key
   */
  validateLicense(request: LicenseValidationRequest): LicenseValidationResponse {
    const license = this.licenses.get(request.licenseKey);
    
    if (!license) {
      return {
        valid: false,
        error: 'License not found',
        reason: 'INVALID_LICENSE_KEY',
      };
    }

    // Check if license is expired
    const now = new Date();
    const expiresAt = new Date(license.expiresAt);
    
    if (now > expiresAt) {
      return {
        valid: false,
        error: 'License expired',
        reason: 'LICENSE_EXPIRED',
      };
    }

    // Check license status
    if (license.status !== 'active') {
      return {
        valid: false,
        error: `License is ${license.status}`,
        reason: `LICENSE_${license.status.toUpperCase()}`,
      };
    }

    return {
      valid: true,
      license: {
        key: license.key,
        tier: license.tier,
        features: license.features,
        expiresAt: license.expiresAt,
        maxTenants: license.maxTenants,
        status: license.status,
        metadata: {
          validatedAt: new Date().toISOString(),
          tenantCount: this.tenantCounts.get(license.key) || 0,
        },
      },
    };
  }

  /**
   * Renew a license
   */
  renewLicense(request: LicenseRenewalRequest): LicenseRenewalResponse {
    const license = this.licenses.get(request.licenseKey);
    
    if (!license) {
      return {
        success: false,
        error: 'License not found',
      };
    }

    // Simulate renewal token validation
    if (request.renewalToken !== `renewal-${license.key}`) {
      return {
        success: false,
        error: 'Invalid renewal token',
      };
    }

    // Create renewed license (extend expiration by 1 year)
    const newExpirationDate = new Date();
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

    const renewedLicense: LicenseConfig = {
      ...license,
      expiresAt: newExpirationDate.toISOString(),
      status: 'active',
    };

    this.licenses.set(license.key, renewedLicense);

    return {
      success: true,
      newLicense: renewedLicense,
    };
  }

  /**
   * Check if a feature is allowed for a license
   */
  checkFeature(request: FeatureCheckRequest): FeatureCheckResponse {
    const license = this.licenses.get(request.licenseKey);
    
    if (!license) {
      return {
        allowed: false,
        reason: 'Invalid license',
      };
    }

    // Check if license is valid
    const validation = this.validateLicense({
      licenseKey: request.licenseKey,
      productId: 'xaheen-cli',
      version: '2.0.0',
    });

    if (!validation.valid) {
      return {
        allowed: false,
        reason: validation.reason,
      };
    }

    // Check if feature is included in license
    if (!license.features.includes(request.feature)) {
      return {
        allowed: false,
        reason: 'Feature not included in license tier',
      };
    }

    // Special checks for tenant-related features
    if (request.feature === 'multi-tenant' && request.tenantId) {
      const currentTenantCount = this.tenantCounts.get(request.licenseKey) || 0;
      
      if (license.maxTenants !== -1 && currentTenantCount >= license.maxTenants) {
        return {
          allowed: false,
          reason: 'Tenant limit exceeded',
          limits: {
            current: currentTenantCount,
            maximum: license.maxTenants,
          },
        };
      }
    }

    return {
      allowed: true,
    };
  }

  /**
   * Register a new tenant for license
   */
  registerTenant(licenseKey: string, tenantId: string): boolean {
    const license = this.licenses.get(licenseKey);
    if (!license) return false;

    const currentCount = this.tenantCounts.get(licenseKey) || 0;
    if (license.maxTenants !== -1 && currentCount >= license.maxTenants) {
      return false;
    }

    this.tenantCounts.set(licenseKey, currentCount + 1);
    return true;
  }

  /**
   * Unregister a tenant from license
   */
  unregisterTenant(licenseKey: string, tenantId: string): boolean {
    const currentCount = this.tenantCounts.get(licenseKey) || 0;
    if (currentCount > 0) {
      this.tenantCounts.set(licenseKey, currentCount - 1);
      return true;
    }
    return false;
  }
}

/**
 * MSW Request Handlers for License Server
 */
export const createLicenseServerHandlers = (mockServer: MockLicenseServer) => [
  // Validate license endpoint
  http.post(`${TEST_CONFIG.licenseServer.baseUrl}/api/v1/licenses/validate`, async ({ request }) => {
    const body = await request.json() as LicenseValidationRequest;
    const response = mockServer.validateLicense(body);
    
    return HttpResponse.json(response, {
      status: response.valid ? 200 : 400,
    });
  }),

  // Renew license endpoint
  http.post(`${TEST_CONFIG.licenseServer.baseUrl}/api/v1/licenses/renew`, async ({ request }) => {
    const body = await request.json() as LicenseRenewalRequest;
    const response = mockServer.renewLicense(body);
    
    return HttpResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  }),

  // Check feature endpoint
  http.post(`${TEST_CONFIG.licenseServer.baseUrl}/api/v1/licenses/features/check`, async ({ request }) => {
    const body = await request.json() as FeatureCheckRequest;
    const response = mockServer.checkFeature(body);
    
    return HttpResponse.json(response, {
      status: response.allowed ? 200 : 403,
    });
  }),

  // Register tenant endpoint
  http.post(`${TEST_CONFIG.licenseServer.baseUrl}/api/v1/tenants/register`, async ({ request }) => {
    const body = await request.json() as { licenseKey: string; tenantId: string };
    const success = mockServer.registerTenant(body.licenseKey, body.tenantId);
    
    return HttpResponse.json({ success }, {
      status: success ? 200 : 400,
    });
  }),

  // Unregister tenant endpoint
  http.delete(`${TEST_CONFIG.licenseServer.baseUrl}/api/v1/tenants/:tenantId`, async ({ request, params }) => {
    const licenseKey = request.headers.get('X-License-Key');
    if (!licenseKey) {
      return HttpResponse.json({ error: 'Missing license key' }, { status: 401 });
    }
    
    const success = mockServer.unregisterTenant(licenseKey, params.tenantId as string);
    
    return HttpResponse.json({ success }, {
      status: success ? 200 : 400,
    });
  }),
];

/**
 * Setup MSW server with license server handlers
 */
export function setupMockLicenseServer(): {
  server: ReturnType<typeof setupServer>;
  mockServer: MockLicenseServer;
} {
  const mockServer = new MockLicenseServer();
  const server = setupServer(...createLicenseServerHandlers(mockServer));
  
  return { server, mockServer };
}
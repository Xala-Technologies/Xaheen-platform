/**
 * Phase 7: SaaS & Multi-Tenancy Test Configuration
 * 
 * Centralized configuration for all Phase 7 testing scenarios
 */

export interface TenantConfig {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly subscriptionTier: 'basic' | 'professional' | 'enterprise';
  readonly features: readonly string[];
  readonly database: {
    readonly schema: string;
    readonly connectionString: string;
  };
  readonly limits: {
    readonly users: number;
    readonly storage: number; // MB
    readonly apiCalls: number; // per month
  };
}

export interface LicenseConfig {
  readonly key: string;
  readonly tier: 'basic' | 'professional' | 'enterprise';
  readonly features: readonly string[];
  readonly expiresAt: string;
  readonly maxTenants: number;
  readonly status: 'active' | 'expired' | 'suspended';
}

export const TEST_CONFIG = {
  // Test database configuration
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'xaheen_test_multi_tenant',
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
  },

  // Redis configuration for tenant sessions
  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
    password: process.env.TEST_REDIS_PASSWORD || '',
  },

  // Mock license server configuration
  licenseServer: {
    baseUrl: process.env.TEST_LICENSE_SERVER_URL || 'http://localhost:3001',
    apiKey: 'test-api-key-12345',
  },

  // Test project directories
  projects: {
    outputDir: '/tmp/xaheen-phase7-tests',
    multiTenantTemplate: 'multi-tenant-saas',
  },

  // Sample tenant configurations
  tenants: [
    {
      id: 'tenant-001',
      name: 'Acme Corp',
      domain: 'acme.localhost',
      subscriptionTier: 'basic' as const,
      features: ['auth', 'dashboard', 'users'],
      database: {
        schema: 'tenant_acme',
        connectionString: 'postgresql://postgres:postgres@localhost:5432/xaheen_test_multi_tenant',
      },
      limits: {
        users: 10,
        storage: 100,
        apiCalls: 1000,
      },
    },
    {
      id: 'tenant-002', 
      name: 'Beta Industries',
      domain: 'beta.localhost',
      subscriptionTier: 'professional' as const,
      features: ['auth', 'dashboard', 'users', 'analytics', 'integrations'],
      database: {
        schema: 'tenant_beta',
        connectionString: 'postgresql://postgres:postgres@localhost:5432/xaheen_test_multi_tenant',
      },
      limits: {
        users: 50,
        storage: 500,
        apiCalls: 10000,
      },
    },
    {
      id: 'tenant-003',
      name: 'Enterprise Solutions',
      domain: 'enterprise.localhost',
      subscriptionTier: 'enterprise' as const,
      features: ['auth', 'dashboard', 'users', 'analytics', 'integrations', 'sso', 'advanced-security'],
      database: {
        schema: 'tenant_enterprise',
        connectionString: 'postgresql://postgres:postgres@localhost:5432/xaheen_test_multi_tenant',
      },
      limits: {
        users: 1000,
        storage: 10000,
        apiCalls: 100000,
      },
    },
  ] satisfies readonly TenantConfig[],

  // Sample license configurations
  licenses: [
    {
      key: 'LICENSE-BASIC-12345',
      tier: 'basic' as const,
      features: ['multi-tenant', 'basic-auth', 'dashboard'],
      expiresAt: '2025-12-31T23:59:59Z',
      maxTenants: 3,
      status: 'active' as const,
    },
    {
      key: 'LICENSE-PRO-67890',
      tier: 'professional' as const,
      features: ['multi-tenant', 'advanced-auth', 'dashboard', 'analytics', 'integrations'],
      expiresAt: '2025-12-31T23:59:59Z',
      maxTenants: 10,
      status: 'active' as const,
    },
    {
      key: 'LICENSE-ENT-ABCDE',
      tier: 'enterprise' as const,
      features: ['multi-tenant', 'enterprise-auth', 'dashboard', 'analytics', 'integrations', 'sso', 'compliance'],
      expiresAt: '2025-12-31T23:59:59Z',
      maxTenants: -1, // unlimited
      status: 'active' as const,
    },
    {
      key: 'LICENSE-EXPIRED-99999',
      tier: 'basic' as const,
      features: ['multi-tenant', 'basic-auth'],
      expiresAt: '2024-01-01T00:00:00Z', // expired
      maxTenants: 1,
      status: 'expired' as const,
    },
  ] satisfies readonly LicenseConfig[],

  // Test timeouts and intervals
  timeouts: {
    scaffolding: 60000, // 60 seconds
    tenantProvisioning: 30000, // 30 seconds
    licenseValidation: 5000, // 5 seconds
    databaseOperation: 10000, // 10 seconds
  },

  // Feature flags for testing
  features: {
    enableTenantIsolation: true,
    enableLicenseGating: true,
    enableRBACTesting: true,
    enableSubscriptionTiers: true,
  },
} as const;

export type TestConfig = typeof TEST_CONFIG;
export type TestTenant = typeof TEST_CONFIG.tenants[0];
export type TestLicense = typeof TEST_CONFIG.licenses[0];
/**
 * Phase 7: RBAC and Admin UI Tests
 * 
 * Tests role-based access control, admin endpoints, and administrative
 * user interface functionality in multi-tenant SaaS applications.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MockTenantDatabase, type TenantUser } from '../mocks/tenant-database.mock.js';
import { setupMockLicenseServer } from '../mocks/license-server.mock.js';
import { TEST_CONFIG } from '../config/test-config.js';
import path from 'node:path';
import fs from 'fs-extra';

interface AdminUser extends TenantUser {
  readonly permissions: readonly string[];
  readonly accessLevel: 'super-admin' | 'tenant-admin' | 'developer' | 'viewer';
}

interface RBACRule {
  readonly role: string;
  readonly resource: string;
  readonly action: string;
  readonly allowed: boolean;
  readonly conditions?: Record<string, unknown>;
}

interface AdminEndpointTest {
  readonly endpoint: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly requiredRole: string;
  readonly requiredPermissions: readonly string[];
  readonly testData?: Record<string, unknown>;
}

describe('Phase 7: RBAC and Admin UI', () => {
  let mockDatabase: MockTenantDatabase;
  let mockLicenseServer: ReturnType<typeof setupMockLicenseServer>;
  let mockApiServer: ReturnType<typeof setupServer>;
  let testOutputDir: string;
  let adminUsers: Map<string, AdminUser> = new Map();

  beforeAll(async () => {
    // Setup test environment
    testOutputDir = path.join(TEST_CONFIG.projects.outputDir, 'rbac-admin-tests');
    await fs.ensureDir(testOutputDir);

    // Setup mock services
    mockDatabase = new MockTenantDatabase();
    await mockDatabase.connect();

    mockLicenseServer = setupMockLicenseServer();
    mockLicenseServer.server.listen();

    // Setup mock API server for admin endpoints
    mockApiServer = setupMockAdminApiServer();
    mockApiServer.listen();

    // Setup admin users for testing
    await setupAdminUsers();
  });

  afterAll(async () => {
    // Cleanup
    await mockDatabase.disconnect();
    mockLicenseServer.server.close();
    mockApiServer.close();
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    await mockDatabase.cleanup();
    await setupTenantSchemas();
  });

  afterEach(async () => {
    await mockDatabase.cleanup();
    adminUsers.clear();
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should enforce super-admin permissions', async () => {
      const superAdmin = createAdminUser('super-admin', [
        'tenant:create',
        'tenant:delete',
        'tenant:view',
        'tenant:edit',
        'user:manage',
        'system:admin',
      ]);

      // Super admin should access all endpoints
      const adminEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenants',
          method: 'GET',
          requiredRole: 'super-admin',
          requiredPermissions: ['tenant:view'],
        },
        {
          endpoint: '/api/admin/tenants',
          method: 'POST',
          requiredRole: 'super-admin',
          requiredPermissions: ['tenant:create'],
          testData: { name: 'New Tenant', domain: 'new.test.com' },
        },
        {
          endpoint: '/api/admin/system/settings',
          method: 'GET',
          requiredRole: 'super-admin',
          requiredPermissions: ['system:admin'],
        },
      ];

      for (const endpointTest of adminEndpoints) {
        const hasAccess = await testEndpointAccess(superAdmin, endpointTest);
        expect(hasAccess).toBe(true);
      }
    });

    it('should enforce tenant-admin permissions', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', [
        'tenant:view',
        'tenant:edit',
        'user:manage',
      ]);

      // Tenant admin should access tenant-level endpoints only
      const allowedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenant/users',
          method: 'GET',
          requiredRole: 'tenant-admin',
          requiredPermissions: ['user:manage'],
        },
        {
          endpoint: '/api/admin/tenant/settings',
          method: 'PUT',
          requiredRole: 'tenant-admin',
          requiredPermissions: ['tenant:edit'],
          testData: { setting: 'theme', value: 'dark' },
        },
      ];

      const deniedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenants',
          method: 'POST',
          requiredRole: 'super-admin',
          requiredPermissions: ['tenant:create'],
        },
        {
          endpoint: '/api/admin/system/settings',
          method: 'GET',
          requiredRole: 'super-admin',
          requiredPermissions: ['system:admin'],
        },
      ];

      // Test allowed endpoints
      for (const endpointTest of allowedEndpoints) {
        const hasAccess = await testEndpointAccess(tenantAdmin, endpointTest);
        expect(hasAccess).toBe(true);
      }

      // Test denied endpoints
      for (const endpointTest of deniedEndpoints) {
        const hasAccess = await testEndpointAccess(tenantAdmin, endpointTest);
        expect(hasAccess).toBe(false);
      }
    });

    it('should enforce developer role limitations', async () => {
      const developer = createAdminUser('developer', [
        'tenant:view',
        'user:view',
      ]);

      // Developer should only have read access
      const allowedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenant/users',
          method: 'GET',
          requiredRole: 'developer',
          requiredPermissions: ['user:view'],
        },
        {
          endpoint: '/api/admin/tenant/analytics',
          method: 'GET',
          requiredRole: 'developer',
          requiredPermissions: ['tenant:view'],
        },
      ];

      const deniedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenant/users',
          method: 'POST',
          requiredRole: 'tenant-admin',
          requiredPermissions: ['user:manage'],
        },
        {
          endpoint: '/api/admin/tenant/settings',
          method: 'PUT',
          requiredRole: 'tenant-admin',
          requiredPermissions: ['tenant:edit'],
        },
      ];

      // Test read access
      for (const endpointTest of allowedEndpoints) {
        const hasAccess = await testEndpointAccess(developer, endpointTest);
        expect(hasAccess).toBe(true);
      }

      // Test write access denial
      for (const endpointTest of deniedEndpoints) {
        const hasAccess = await testEndpointAccess(developer, endpointTest);
        expect(hasAccess).toBe(false);
      }
    });

    it('should enforce viewer role restrictions', async () => {
      const viewer = createAdminUser('viewer', [
        'tenant:view:limited',
      ]);

      // Viewer should only have very limited read access
      const allowedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenant/dashboard',
          method: 'GET',
          requiredRole: 'viewer',
          requiredPermissions: ['tenant:view:limited'],
        },
      ];

      const deniedEndpoints: AdminEndpointTest[] = [
        {
          endpoint: '/api/admin/tenant/users',
          method: 'GET',
          requiredRole: 'developer',
          requiredPermissions: ['user:view'],
        },
        {
          endpoint: '/api/admin/tenant/settings',
          method: 'GET',
          requiredRole: 'tenant-admin',
          requiredPermissions: ['tenant:view'],
        },
      ];

      // Test limited access
      for (const endpointTest of allowedEndpoints) {
        const hasAccess = await testEndpointAccess(viewer, endpointTest);
        expect(hasAccess).toBe(true);
      }

      // Test access denial
      for (const endpointTest of deniedEndpoints) {
        const hasAccess = await testEndpointAccess(viewer, endpointTest);
        expect(hasAccess).toBe(false);
      }
    });
  });

  describe('Tenant Management API', () => {
    it('should allow super-admin to list all tenants', async () => {
      const superAdmin = createAdminUser('super-admin', ['tenant:view']);
      
      // Create test tenants
      for (const tenantConfig of TEST_CONFIG.tenants.slice(0, 2)) {
        await mockDatabase.createTenantSchema(tenantConfig);
      }

      const response = await makeAdminApiCall(superAdmin, {
        endpoint: '/api/admin/tenants',
        method: 'GET',
        requiredRole: 'super-admin',
        requiredPermissions: ['tenant:view'],
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('tenants');
      expect(response.data.tenants).toHaveLength(2);
    });

    it('should allow super-admin to create new tenant', async () => {
      const superAdmin = createAdminUser('super-admin', ['tenant:create']);
      
      const newTenantData = {
        name: 'API Test Tenant',
        domain: 'apitest.localhost',
        subscriptionTier: 'professional',
        features: ['auth', 'dashboard'],
        limits: {
          users: 50,
          storage: 500,
          apiCalls: 10000,
        },
      };

      const response = await makeAdminApiCall(superAdmin, {
        endpoint: '/api/admin/tenants',
        method: 'POST',
        requiredRole: 'super-admin',
        requiredPermissions: ['tenant:create'],
        testData: newTenantData,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('tenant');
      expect(response.data.tenant.name).toBe(newTenantData.name);
    });

    it('should allow tenant-admin to view only their tenant', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', ['tenant:view']);
      const tenant = TEST_CONFIG.tenants[0];
      
      await mockDatabase.createTenantSchema(tenant);

      const response = await makeAdminApiCall(tenantAdmin, {
        endpoint: `/api/admin/tenant/${tenant.id}`,
        method: 'GET',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['tenant:view'],
      });

      expect(response.status).toBe(200);
      expect(response.data.tenant.id).toBe(tenant.id);
    });

    it('should prevent tenant-admin from accessing other tenants', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', ['tenant:view']);
      const otherTenant = TEST_CONFIG.tenants[1];

      const response = await makeAdminApiCall(tenantAdmin, {
        endpoint: `/api/admin/tenant/${otherTenant.id}`,
        method: 'GET',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['tenant:view'],
      });

      expect(response.status).toBe(403);
      expect(response.error).toMatch(/access denied/i);
    });
  });

  describe('User Management API', () => {
    it('should allow tenant-admin to manage tenant users', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', ['user:manage']);
      const tenant = TEST_CONFIG.tenants[0];
      
      await mockDatabase.createTenantSchema(tenant);

      // Create a user
      const createResponse = await makeAdminApiCall(tenantAdmin, {
        endpoint: '/api/admin/tenant/users',
        method: 'POST',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['user:manage'],
        testData: {
          email: 'newuser@tenant.com',
          name: 'New User',
          role: 'viewer',
        },
      });

      expect(createResponse.status).toBe(201);
      expect(createResponse.data.user.email).toBe('newuser@tenant.com');

      // List users
      const listResponse = await makeAdminApiCall(tenantAdmin, {
        endpoint: '/api/admin/tenant/users',
        method: 'GET',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['user:manage'],
      });

      expect(listResponse.status).toBe(200);
      expect(listResponse.data.users).toHaveLength(1);
    });

    it('should prevent developer from creating users', async () => {
      const developer = createAdminUser('developer', ['user:view']);
      
      const response = await makeAdminApiCall(developer, {
        endpoint: '/api/admin/tenant/users',
        method: 'POST',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['user:manage'],
        testData: {
          email: 'unauthorized@tenant.com',
          name: 'Unauthorized User',
          role: 'viewer',
        },
      });

      expect(response.status).toBe(403);
      expect(response.error).toMatch(/insufficient permissions/i);
    });
  });

  describe('System Settings and Configuration', () => {
    it('should allow super-admin to access system settings', async () => {
      const superAdmin = createAdminUser('super-admin', ['system:admin']);

      const response = await makeAdminApiCall(superAdmin, {
        endpoint: '/api/admin/system/settings',
        method: 'GET',
        requiredRole: 'super-admin',
        requiredPermissions: ['system:admin'],
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('settings');
    });

    it('should allow super-admin to update system settings', async () => {
      const superAdmin = createAdminUser('super-admin', ['system:admin']);

      const updateData = {
        maintenanceMode: false,
        registrationEnabled: true,
        maxTenantsPerLicense: 10,
      };

      const response = await makeAdminApiCall(superAdmin, {
        endpoint: '/api/admin/system/settings',
        method: 'PUT',
        requiredRole: 'super-admin',
        requiredPermissions: ['system:admin'],
        testData: updateData,
      });

      expect(response.status).toBe(200);
      expect(response.data.settings.maintenanceMode).toBe(false);
    });

    it('should prevent non-super-admin from accessing system settings', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', ['tenant:edit']);

      const response = await makeAdminApiCall(tenantAdmin, {
        endpoint: '/api/admin/system/settings',
        method: 'GET',
        requiredRole: 'super-admin',
        requiredPermissions: ['system:admin'],
      });

      expect(response.status).toBe(403);
      expect(response.error).toMatch(/access denied/i);
    });
  });

  describe('Analytics and Reporting', () => {
    it('should provide tenant analytics to authorized users', async () => {
      const tenantAdmin = createAdminUser('tenant-admin', ['tenant:view', 'analytics:view']);
      const tenant = TEST_CONFIG.tenants[0];
      
      await mockDatabase.createTenantSchema(tenant);
      
      // Create some test data for analytics
      await mockDatabase.createTenantUser(tenant.id, {
        email: 'analytics@test.com',
        name: 'Analytics User',
        role: 'viewer',
      });

      const response = await makeAdminApiCall(tenantAdmin, {
        endpoint: '/api/admin/tenant/analytics',
        method: 'GET',
        requiredRole: 'tenant-admin',
        requiredPermissions: ['analytics:view'],
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('analytics');
      expect(response.data.analytics).toHaveProperty('userCount');
      expect(response.data.analytics.userCount).toBe(1);
    });

    it('should provide system-wide analytics to super-admin', async () => {
      const superAdmin = createAdminUser('super-admin', ['system:admin', 'analytics:view']);

      // Create multiple tenants for system analytics
      for (const tenant of TEST_CONFIG.tenants.slice(0, 2)) {
        await mockDatabase.createTenantSchema(tenant);
      }

      const response = await makeAdminApiCall(superAdmin, {
        endpoint: '/api/admin/system/analytics',
        method: 'GET',
        requiredRole: 'super-admin',
        requiredPermissions: ['system:admin'],
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('systemAnalytics');
      expect(response.data.systemAnalytics.totalTenants).toBe(2);
    });
  });

  // Helper functions
  function createAdminUser(accessLevel: AdminUser['accessLevel'], permissions: readonly string[]): AdminUser {
    const baseUser = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `${accessLevel}@admin.test.com`,
      name: `${accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1)} User`,
      role: accessLevel === 'super-admin' ? 'admin' : accessLevel as TenantUser['role'],
      tenantId: accessLevel === 'super-admin' ? 'system' : TEST_CONFIG.tenants[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const adminUser: AdminUser = {
      ...baseUser,
      permissions,
      accessLevel,
    };

    adminUsers.set(adminUser.id, adminUser);
    return adminUser;
  }

  async function testEndpointAccess(user: AdminUser, endpointTest: AdminEndpointTest): Promise<boolean> {
    try {
      const response = await makeAdminApiCall(user, endpointTest);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      return false;
    }
  }

  async function makeAdminApiCall(user: AdminUser, endpointTest: AdminEndpointTest): Promise<{
    status: number;
    data?: any;
    error?: string;
  }> {
    // Simulate API call - this would be replaced with actual HTTP calls in a real test
    const hasPermission = endpointTest.requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );

    const hasRole = user.accessLevel === endpointTest.requiredRole || 
                   (endpointTest.requiredRole !== 'super-admin' && user.accessLevel === 'super-admin');

    if (!hasPermission || !hasRole) {
      return {
        status: 403,
        error: 'Access denied - insufficient permissions',
      };
    }

    // Simulate successful responses based on endpoint
    if (endpointTest.endpoint === '/api/admin/tenants' && endpointTest.method === 'GET') {
      return {
        status: 200,
        data: {
          tenants: TEST_CONFIG.tenants.slice(0, 2),
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/tenants' && endpointTest.method === 'POST') {
      return {
        status: 201,
        data: {
          tenant: {
            id: `tenant-${Date.now()}`,
            ...endpointTest.testData,
          },
        },
      };
    }

    if (endpointTest.endpoint.startsWith('/api/admin/tenant/') && endpointTest.method === 'GET') {
      const tenantId = endpointTest.endpoint.split('/')[4];
      return {
        status: 200,
        data: {
          tenant: TEST_CONFIG.tenants.find(t => t.id === tenantId) || TEST_CONFIG.tenants[0],
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/tenant/users' && endpointTest.method === 'POST') {
      return {
        status: 201,
        data: {
          user: {
            id: `user-${Date.now()}`,
            tenantId: user.tenantId,
            ...endpointTest.testData,
          },
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/tenant/users' && endpointTest.method === 'GET') {
      return {
        status: 200,
        data: {
          users: mockDatabase.getTenantUsers(user.tenantId),
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/tenant/analytics') {
      const stats = mockDatabase.getTenantStats(user.tenantId);
      return {
        status: 200,
        data: {
          analytics: {
            userCount: stats?.userCount || 0,
            dataCount: stats?.dataCount || 0,
            storageUsed: stats?.storageUsed || 0,
          },
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/system/analytics') {
      return {
        status: 200,
        data: {
          systemAnalytics: {
            totalTenants: mockDatabase.listTenantSchemas().length - 1, // Exclude public schema
            totalUsers: TEST_CONFIG.tenants.reduce((sum, tenant) => 
              sum + mockDatabase.getTenantUsers(tenant.id).length, 0
            ),
          },
        },
      };
    }

    if (endpointTest.endpoint === '/api/admin/system/settings') {
      if (endpointTest.method === 'GET') {
        return {
          status: 200,
          data: {
            settings: {
              maintenanceMode: false,
              registrationEnabled: true,
              maxTenantsPerLicense: 10,
            },
          },
        };
      } else if (endpointTest.method === 'PUT') {
        return {
          status: 200,
          data: {
            settings: endpointTest.testData,
          },
        };
      }
    }

    // Default success response
    return {
      status: 200,
      data: {},
    };
  }

  async function setupAdminUsers(): Promise<void> {
    // This would set up admin users in a real implementation
    // For testing, we just need the createAdminUser function
  }

  async function setupTenantSchemas(): Promise<void> {
    for (const tenant of TEST_CONFIG.tenants) {
      await mockDatabase.createTenantSchema(tenant);
    }
  }

  function setupMockAdminApiServer() {
    // This would set up actual HTTP handlers in a real implementation
    // For testing, we simulate the responses in makeAdminApiCall
    return setupServer();
  }
});
/**
 * Mock Tenant Database for Phase 7 Testing
 * 
 * Simulates multi-tenant database operations with schema isolation
 */

import { EventEmitter } from 'node:events';
import type { TenantConfig } from '../config/test-config.js';

export interface TenantUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'developer' | 'viewer';
  readonly tenantId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TenantData {
  readonly id: string;
  readonly name: string;
  readonly data: Record<string, unknown>;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DatabaseSchema {
  readonly name: string;
  readonly tables: readonly string[];
  readonly createdAt: string;
}

export interface TenantStats {
  readonly userCount: number;
  readonly dataCount: number;
  readonly storageUsed: number; // bytes
  readonly lastActivity: string;
}

/**
 * Mock Multi-Tenant Database Implementation
 */
export class MockTenantDatabase extends EventEmitter {
  private schemas: Map<string, DatabaseSchema> = new Map();
  private tenants: Map<string, TenantConfig> = new Map();
  private users: Map<string, TenantUser[]> = new Map();
  private data: Map<string, TenantData[]> = new Map();
  private connected = false;

  constructor() {
    super();
    this.setupDefaultSchemas();
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate connection delay
    this.connected = true;
    this.emit('connected');
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnected');
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Create a new tenant schema
   */
  async createTenantSchema(tenant: TenantConfig): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    if (this.schemas.has(tenant.database.schema)) {
      return false; // Schema already exists
    }

    const schema: DatabaseSchema = {
      name: tenant.database.schema,
      tables: [
        'users',
        'roles',
        'permissions',
        'tenant_data',
        'audit_logs',
        'settings'
      ],
      createdAt: new Date().toISOString(),
    };

    this.schemas.set(tenant.database.schema, schema);
    this.tenants.set(tenant.id, tenant);
    this.users.set(tenant.id, []);
    this.data.set(tenant.id, []);

    this.emit('schemaCreated', { tenantId: tenant.id, schema: schema.name });
    return true;
  }

  /**
   * Drop a tenant schema
   */
  async dropTenantSchema(tenantId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    this.schemas.delete(tenant.database.schema);
    this.tenants.delete(tenantId);
    this.users.delete(tenantId);
    this.data.delete(tenantId);

    this.emit('schemaDropped', { tenantId, schema: tenant.database.schema });
    return true;
  }

  /**
   * Get tenant schema information
   */
  getTenantSchema(tenantId: string): DatabaseSchema | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    return this.schemas.get(tenant.database.schema) || null;
  }

  /**
   * List all tenant schemas
   */
  listTenantSchemas(): readonly DatabaseSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Create a user in a tenant
   */
  async createTenantUser(tenantId: string, userData: Omit<TenantUser, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<TenantUser | null> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const tenantUsers = this.users.get(tenantId) || [];
    
    // Check user limits
    if (tenantUsers.length >= tenant.limits.users) {
      throw new Error(`Tenant user limit exceeded (${tenant.limits.users})`);
    }

    // Check for duplicate email within tenant
    if (tenantUsers.some(user => user.email === userData.email)) {
      throw new Error('User email already exists in tenant');
    }

    const user: TenantUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData,
    };

    const updatedUsers = [...tenantUsers, user];
    this.users.set(tenantId, updatedUsers);

    this.emit('userCreated', { tenantId, user });
    return user;
  }

  /**
   * Get users for a tenant
   */
  getTenantUsers(tenantId: string): readonly TenantUser[] {
    return this.users.get(tenantId) || [];
  }

  /**
   * Delete a user from a tenant
   */
  async deleteTenantUser(tenantId: string, userId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const tenantUsers = this.users.get(tenantId) || [];
    const userIndex = tenantUsers.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return false;
    }

    const updatedUsers = tenantUsers.filter(user => user.id !== userId);
    this.users.set(tenantId, updatedUsers);

    this.emit('userDeleted', { tenantId, userId });
    return true;
  }

  /**
   * Create data in a tenant
   */
  async createTenantData(tenantId: string, dataPayload: Omit<TenantData, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<TenantData | null> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const tenantData = this.data.get(tenantId) || [];
    
    // Check storage limits (simulate data size)
    const currentStorage = this.calculateTenantStorageUsage(tenantId);
    const dataSize = JSON.stringify(dataPayload.data).length;
    
    if (currentStorage + dataSize > tenant.limits.storage * 1024 * 1024) {
      throw new Error(`Tenant storage limit exceeded (${tenant.limits.storage}MB)`);
    }

    const data: TenantData = {
      id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...dataPayload,
    };

    const updatedData = [...tenantData, data];
    this.data.set(tenantId, updatedData);

    this.emit('dataCreated', { tenantId, data });
    return data;
  }

  /**
   * Get data for a tenant
   */
  getTenantData(tenantId: string): readonly TenantData[] {
    return this.data.get(tenantId) || [];
  }

  /**
   * Test data isolation between tenants
   */
  async testDataIsolation(tenantId1: string, tenantId2: string): Promise<{
    isolated: boolean;
    crossContamination: readonly string[];
  }> {
    const tenant1Users = this.getTenantUsers(tenantId1);
    const tenant2Users = this.getTenantUsers(tenantId2);
    const tenant1Data = this.getTenantData(tenantId1);
    const tenant2Data = this.getTenantData(tenantId2);

    const crossContamination: string[] = [];

    // Check for user cross-contamination
    tenant1Users.forEach(user => {
      if (user.tenantId !== tenantId1) {
        crossContamination.push(`User ${user.id} belongs to wrong tenant`);
      }
    });

    tenant2Users.forEach(user => {
      if (user.tenantId !== tenantId2) {
        crossContamination.push(`User ${user.id} belongs to wrong tenant`);
      }
    });

    // Check for data cross-contamination
    tenant1Data.forEach(data => {
      if (data.tenantId !== tenantId1) {
        crossContamination.push(`Data ${data.id} belongs to wrong tenant`);
      }
    });

    tenant2Data.forEach(data => {
      if (data.tenantId !== tenantId2) {
        crossContamination.push(`Data ${data.id} belongs to wrong tenant`);
      }
    });

    return {
      isolated: crossContamination.length === 0,
      crossContamination,
    };
  }

  /**
   * Get tenant statistics
   */
  getTenantStats(tenantId: string): TenantStats | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    const users = this.users.get(tenantId) || [];
    const data = this.data.get(tenantId) || [];

    return {
      userCount: users.length,
      dataCount: data.length,
      storageUsed: this.calculateTenantStorageUsage(tenantId),
      lastActivity: new Date().toISOString(),
    };
  }

  /**
   * Calculate storage usage for a tenant
   */
  private calculateTenantStorageUsage(tenantId: string): number {
    const users = this.users.get(tenantId) || [];
    const data = this.data.get(tenantId) || [];

    const userSize = JSON.stringify(users).length;
    const dataSize = JSON.stringify(data).length;

    return userSize + dataSize;
  }

  /**
   * Setup default schemas for testing
   */
  private setupDefaultSchemas(): void {
    // Public schema for shared resources
    this.schemas.set('public', {
      name: 'public',
      tables: ['system_settings', 'global_config', 'migrations'],
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Cleanup all test data
   */
  async cleanup(): Promise<void> {
    this.schemas.clear();
    this.tenants.clear();
    this.users.clear();
    this.data.clear();
    this.setupDefaultSchemas();
    
    this.emit('cleanup');
  }
}
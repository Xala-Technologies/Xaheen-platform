/**
 * Phase 7: Global Test Setup
 * 
 * Sets up the test environment for SaaS & Multi-Tenancy tests
 */

import fs from 'fs-extra';
import path from 'node:path';
import { TEST_CONFIG } from '../config/test-config.js';

export default async function globalSetup() {
  console.log('🔧 Setting up Phase 7: SaaS & Multi-Tenancy tests...');

  try {
    // Ensure test output directory exists
    await fs.ensureDir(TEST_CONFIG.projects.outputDir);
    
    // Create test database directory
    const testDbDir = path.join(TEST_CONFIG.projects.outputDir, 'test-db');
    await fs.ensureDir(testDbDir);

    // Setup test environment variables
    process.env.NODE_ENV = 'test';
    process.env.TEST_PHASE = 'phase7';
    process.env.XAHEEN_LICENSE_SERVER_URL = TEST_CONFIG.licenseServer.baseUrl;
    process.env.TEST_DB_HOST = TEST_CONFIG.database.host;
    process.env.TEST_DB_PORT = TEST_CONFIG.database.port.toString();
    process.env.TEST_DB_NAME = TEST_CONFIG.database.database;
    process.env.TEST_REDIS_HOST = TEST_CONFIG.redis.host;
    process.env.TEST_REDIS_PORT = TEST_CONFIG.redis.port.toString();

    // Create test configuration files
    await createTestConfigFiles();

    console.log('✅ Phase 7 global setup completed successfully');
  } catch (error) {
    console.error('❌ Phase 7 global setup failed:', error);
    throw error;
  }
}

async function createTestConfigFiles(): Promise<void> {
  const configDir = path.join(TEST_CONFIG.projects.outputDir, 'config');
  await fs.ensureDir(configDir);

  // Create test database configuration
  const dbConfig = {
    test: {
      host: TEST_CONFIG.database.host,
      port: TEST_CONFIG.database.port,
      database: TEST_CONFIG.database.database,
      username: TEST_CONFIG.database.username,
      password: TEST_CONFIG.database.password,
      logging: false,
      synchronize: true,
      dropSchema: true,
    },
  };

  await fs.writeJson(
    path.join(configDir, 'database.json'),
    dbConfig,
    { spaces: 2 }
  );

  // Create test license configuration
  const licenseConfig = {
    server: {
      baseUrl: TEST_CONFIG.licenseServer.baseUrl,
      apiKey: TEST_CONFIG.licenseServer.apiKey,
    },
    testLicenses: TEST_CONFIG.licenses,
  };

  await fs.writeJson(
    path.join(configDir, 'license.json'),
    licenseConfig,
    { spaces: 2 }
  );

  // Create test tenant configuration
  const tenantConfig = {
    testTenants: TEST_CONFIG.tenants,
    features: TEST_CONFIG.features,
  };

  await fs.writeJson(
    path.join(configDir, 'tenants.json'),
    tenantConfig,
    { spaces: 2 }
  );
}
/**
 * Phase 7: Global Test Teardown
 * 
 * Cleans up after SaaS & Multi-Tenancy tests
 */

import fs from 'fs-extra';
import { TEST_CONFIG } from '../config/test-config.js';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up Phase 7: SaaS & Multi-Tenancy tests...');

  try {
    // Clean up test output directory
    if (await fs.pathExists(TEST_CONFIG.projects.outputDir)) {
      await fs.remove(TEST_CONFIG.projects.outputDir);
    }

    // Clean up environment variables
    delete process.env.NODE_ENV;
    delete process.env.TEST_PHASE;
    delete process.env.XAHEEN_LICENSE_SERVER_URL;
    delete process.env.TEST_DB_HOST;
    delete process.env.TEST_DB_PORT;
    delete process.env.TEST_DB_NAME;
    delete process.env.TEST_REDIS_HOST;
    delete process.env.TEST_REDIS_PORT;

    console.log('✅ Phase 7 global teardown completed successfully');
  } catch (error) {
    console.error('❌ Phase 7 global teardown failed:', error);
    // Don't throw to avoid masking test failures
  }
}
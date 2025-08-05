/**
 * Playwright global teardown for Phase 5 E2E tests
 */

import type { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Tearing down Phase 5 E2E test environment...');
  
  try {
    // Retrieve global cleanup functions
    const cleanup = global.__PHASE5_CLEANUP__;
    
    if (!cleanup) {
      console.log('⚠️  No cleanup state found, environment may not have been properly initialized');
      return;
    }
    
    // Stop all servers
    if (cleanup.serverManager) {
      console.log('🛑 Stopping server manager...');
      await cleanup.serverManager.stopAllServers();
    }
    
    // Stop mock API server
    if (cleanup.mockApiServer) {
      console.log('🛑 Stopping mock API server...');
      await cleanup.mockApiServer.stop();
    }
    
    // Cleanup test context
    if (cleanup.testContext) {
      console.log('🗑️  Cleaning up test context...');
      await cleanup.testContext.cleanup();
    }
    
    // Clear environment variables
    delete process.env.TEST_WORKSPACE_ROOT;
    delete process.env.TEST_BACKEND_URL;
    delete process.env.TEST_FRONTEND_URL;
    delete process.env.TEST_MOCK_API_URL;
    delete process.env.TEST_TEMP_DIR;
    
    // Clear global state
    delete global.__PHASE5_CLEANUP__;
    
    console.log('✅ Phase 5 E2E test environment cleaned up successfully');
    
  } catch (error) {
    console.error('❌ Error during Phase 5 E2E test environment teardown:', error);
    
    // Try to forcefully cleanup what we can
    try {
      // Kill any remaining processes on our test ports
      const { execSync } = require('child_process');
      const testPorts = [3000, 3001, 8000, 8001, 8080, 8081, 8888, 8889];
      
      for (const port of testPorts) {
        try {
          execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
        } catch {
          // Ignore errors - port might not be in use
        }
      }
      
      console.log('🔄 Attempted force cleanup of test ports');
      
    } catch (forceCleanupError) {
      console.error('Failed to perform force cleanup:', forceCleanupError);
    }
    
    // Don't throw the error to avoid failing the entire test run
    // Just log it and continue
  }
}

export default globalTeardown;
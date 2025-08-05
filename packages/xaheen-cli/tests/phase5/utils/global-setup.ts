/**
 * Playwright global setup for Phase 5 E2E tests
 */

import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import { getTestConfig } from '../config/test-config';
import { createTestContext } from './test-helpers';
import { createMonorepoWorkspace, installWorkspaceDependencies } from './monorepo-helper';
import { startFullStackEnvironment } from './server-manager';
import { createMockApiServer } from '../mocks/api-server.mock';

async function globalSetup(config: FullConfig) {
  console.log('🌍 Setting up Phase 5 E2E test environment...');
  
  const testConfig = getTestConfig(process.env.CI ? 'ci' : 'default');
  
  try {
    // Create test context
    const testContext = await createTestContext(testConfig);
    
    // Create monorepo workspace
    console.log('📦 Creating monorepo workspace...');
    const workspace = await createMonorepoWorkspace(testContext.tempDir, testConfig);
    
    // Install dependencies
    console.log('📥 Installing workspace dependencies...');
    await installWorkspaceDependencies(workspace);
    
    // Start mock API server
    console.log('🔧 Starting mock API server...');
    const mockApiServer = await createMockApiServer({
      port: testConfig.ports.mockApi,
      enableCors: true,
    });
    
    // Start full-stack environment
    console.log('🚀 Starting full-stack environment...');
    const environment = await startFullStackEnvironment(workspace.root, testConfig);
    
    // Wait for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test that services are responding
    try {
      const backendResponse = await fetch(`${environment.backend.url}/api/health`);
      if (!backendResponse.ok) {
        throw new Error(`Backend health check failed: ${backendResponse.status}`);
      }
      console.log('✅ Backend is ready');
      
      const frontendResponse = await fetch(`http://localhost:${testConfig.ports.frontend}`);
      if (!frontendResponse.ok) {
        throw new Error(`Frontend health check failed: ${frontendResponse.status}`);
      }
      console.log('✅ Frontend is ready');
      
      const mockApiResponse = await fetch(`${mockApiServer.getUrl()}/health`);
      if (!mockApiResponse.ok) {
        throw new Error(`Mock API health check failed: ${mockApiResponse.status}`);
      }
      console.log('✅ Mock API is ready');
      
    } catch (error) {
      console.error('❌ Service health check failed:', error);
      throw error;
    }
    
    // Store global state for tests
    process.env.TEST_WORKSPACE_ROOT = workspace.root;
    process.env.TEST_BACKEND_URL = environment.backend.url;
    process.env.TEST_FRONTEND_URL = `http://localhost:${testConfig.ports.frontend}`;
    process.env.TEST_MOCK_API_URL = mockApiServer.getUrl();
    process.env.TEST_TEMP_DIR = testContext.tempDir;
    
    // Store cleanup functions globally
    global.__PHASE5_CLEANUP__ = {
      testContext,
      workspace,
      serverManager: environment.serverManager,
      backend: environment.backend,
      frontend: environment.frontend,
      mockApiServer,
    };
    
    console.log('🎉 Phase 5 E2E test environment ready!');
    console.log(`   Frontend: ${process.env.TEST_FRONTEND_URL}`);
    console.log(`   Backend: ${process.env.TEST_BACKEND_URL}`);
    console.log(`   Mock API: ${process.env.TEST_MOCK_API_URL}`);
    
  } catch (error) {
    console.error('❌ Failed to setup Phase 5 E2E test environment:', error);
    
    // Attempt cleanup on failure
    if (global.__PHASE5_CLEANUP__) {
      const cleanup = global.__PHASE5_CLEANUP__;
      try {
        await cleanup.serverManager?.stopAllServers();
        await cleanup.mockApiServer?.stop();
        await cleanup.testContext?.cleanup();
      } catch (cleanupError) {
        console.error('Failed to cleanup after setup failure:', cleanupError);
      }
    }
    
    throw error;
  }
}

export default globalSetup;
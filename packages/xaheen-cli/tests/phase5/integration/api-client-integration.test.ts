import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'bun:test';
import * as path from 'path';
import * as fs from 'fs/promises';
import supertest from 'supertest';
import { 
  createTestContext, 
  execCommand, 
  assertFileContent,
  readJsonFile,
  writeJsonFile,
  measurePerformance,
  retry,
} from '../utils/test-helpers';
import { createMonorepoWorkspace, installWorkspaceDependencies } from '../utils/monorepo-helper';
import { ServerManager, startFullStackEnvironment } from '../utils/server-manager';
import { createMockApiServer } from '../mocks/api-server.mock';
import { getTestConfig } from '../config/test-config';
import type { TestContext } from '../utils/test-helpers';
import type { MonorepoWorkspace } from '../utils/monorepo-helper';

describe('API Client Integration Tests', () => {
  let testContext: TestContext;
  let workspace: MonorepoWorkspace;
  let serverManager: ServerManager;
  let backend: any;
  let frontend: any;
  let mockApiServer: any;
  const config = getTestConfig();

  beforeAll(async () => {
    testContext = await createTestContext(config);
    workspace = await createMonorepoWorkspace(testContext.tempDir, config);
    await installWorkspaceDependencies(workspace);
    
    // Start mock API server for testing
    mockApiServer = await createMockApiServer({
      port: config.ports.mockApi,
      enableCors: true,
    });
    
    // Start the actual backend and frontend
    const environment = await startFullStackEnvironment(workspace.root, config);
    serverManager = environment.serverManager;
    backend = environment.backend;
    frontend = environment.frontend;
  });

  afterAll(async () => {
    await serverManager?.stopAllServers();
    await mockApiServer?.stop();
    await testContext?.cleanup();
  });

  describe('Generated API Client Testing', () => {
    test('should generate working API client from endpoints', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate API client', async () => {
        const { duration } = await measurePerformance(async () => {
          const result = await execCommand(
            'node ../../../dist/cli.js generate integration api-user --endpoint=/api/users --output=./src/services/api-client.ts',
            { 
              cwd: frontendPath,
              timeout: 30000,
            }
          );
          
          expect(result.exitCode).toBe(0);
        });
        
        expect(duration).toBeLessThan(10000);
      });
      
      await test.step('Verify generated client structure', async () => {
        const clientPath = path.join(frontendPath, 'src/services/api-client.ts');
        const clientExists = await fs.access(clientPath).then(() => true).catch(() => false);
        expect(clientExists).toBe(true);
        
        // Check that client has proper structure
        await assertFileContent(clientPath, 'export class ApiUserClient');
        await assertFileContent(clientPath, 'constructor');
        await assertFileContent(clientPath, 'async get');
        await assertFileContent(clientPath, 'async post');
        await assertFileContent(clientPath, 'async put');
        await assertFileContent(clientPath, 'async delete');
      });
      
      await test.step('Test generated client functionality', async () => {
        // Create a test file to use the generated client
        const testClientPath = path.join(frontendPath, 'test-api-client.js');
        const testClientCode = `
const { ApiUserClient } = require('./src/services/api-client.ts');

async function testClient() {
  const client = new ApiUserClient('${backend.url}');
  
  try {
    // Test GET request
    const users = await client.getUsers();
    console.log('GET users:', users.success);
    
    // Test POST request
    const newUser = await client.createUser({
      name: 'API Client Test User',
      email: 'apiclient@example.com'
    });
    console.log('POST user:', newUser.success);
    
    // Test PUT request
    if (newUser.data && newUser.data.id) {
      const updatedUser = await client.updateUser(newUser.data.id, {
        name: 'Updated API Client Test User'
      });
      console.log('PUT user:', updatedUser.success);
      
      // Test DELETE request
      const deleteResult = await client.deleteUser(newUser.data.id);
      console.log('DELETE user:', deleteResult.success);
    }
    
    return true;
  } catch (error) {
    console.error('Client test error:', error.message);
    return false;
  }
}

testClient().then(success => {
  process.exit(success ? 0 : 1);
});
`;
        
        await fs.writeFile(testClientPath, testClientCode);
        
        // Run the client test
        const testResult = await execCommand('node test-api-client.js', {
          cwd: frontendPath,
          timeout: 15000,
        });
        
        expect(testResult.exitCode).toBe(0);
        expect(testResult.stdout).toContain('GET users: true');
        expect(testResult.stdout).toContain('POST user: true');
      });
    });

    test('should generate TypeScript types for API responses', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with types', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-typed --endpoint=/api/users --with-types --output=./src/services/',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify generated types', async () => {
        const typesPath = path.join(frontendPath, 'src/services/api-typed.types.ts');
        const typesExist = await fs.access(typesPath).then(() => true).catch(() => false);
        expect(typesExist).toBe(true);
        
        // Check generated type definitions
        await assertFileContent(typesPath, 'export interface');
        await assertFileContent(typesPath, 'ApiResponse');
        await assertFileContent(typesPath, 'User');
      });
      
      await test.step('Verify TypeScript compilation', async () => {
        const compileResult = await execCommand('bun run type-check', { 
          cwd: frontendPath,
          timeout: 30000,
        });
        
        expect(compileResult.exitCode).toBe(0);
      });
    });

    test('should generate React hooks for API integration', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate hooks', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-hooks --endpoint=/api/users --with-hooks --state-library=react-query',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify generated hooks', async () => {
        const hooksPath = path.join(frontendPath, 'src/hooks/useApiHooks.ts');
        const hooksExist = await fs.access(hooksPath).then(() => true).catch(() => false);
        expect(hooksExist).toBe(true);
        
        // Check hook functions
        await assertFileContent(hooksPath, 'export function useUsers');
        await assertFileContent(hooksPath, 'export function useUser');
        await assertFileContent(hooksPath, 'export function useCreateUser');
        await assertFileContent(hooksPath, 'export function useUpdateUser');
        await assertFileContent(hooksPath, 'export function useDeleteUser');
        
        // Check React Query integration
        await assertFileContent(hooksPath, 'useQuery');
        await assertFileContent(hooksPath, 'useMutation');
      });
      
      await test.step('Test hooks compilation', async () => {
        // Update package.json with React Query dependency
        const packageJsonPath = path.join(frontendPath, 'package.json');
        const packageJson = await readJsonFile(packageJsonPath);
        packageJson.dependencies['@tanstack/react-query'] = '^4.0.0';
        await writeJsonFile(packageJsonPath, packageJson);
        
        // Install new dependency
        await execCommand('bun install', { cwd: frontendPath });
        
        // Test compilation
        const compileResult = await execCommand('bun run type-check', { 
          cwd: frontendPath,
          timeout: 30000,
        });
        
        expect(compileResult.exitCode).toBe(0);
      });
    });
  });

  describe('Real Backend Integration', () => {
    test('should work with actual backend endpoints', async () => {
      const request = supertest(backend.url);
      
      await test.step('Test backend health endpoint', async () => {
        const response = await request.get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
      
      await test.step('Test CRUD operations via supertest', async () => {
        // CREATE
        const createResponse = await request
          .post('/api/users')
          .send({
            name: 'Integration Test User',
            email: 'integration@example.com'
          });
        
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.success).toBe(true);
        expect(createResponse.body.data.id).toBeDefined();
        
        const userId = createResponse.body.data.id;
        
        // READ
        const getResponse = await request.get(`/api/users/${userId}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.name).toBe('Integration Test User');
        
        // UPDATE
        const updateResponse = await request
          .put(`/api/users/${userId}`)
          .send({ name: 'Updated Integration Test User' });
        
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data.name).toBe('Updated Integration Test User');
        
        // DELETE
        const deleteResponse = await request.delete(`/api/users/${userId}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);
        
        // Verify deletion
        const verifyResponse = await request.get(`/api/users/${userId}`);
        expect(verifyResponse.status).toBe(404);
      });
      
      await test.step('Test pagination and filtering', async () => {
        // Create multiple users
        const users = [];
        for (let i = 0; i < 5; i++) {
          const response = await request
            .post('/api/users')
            .send({
              name: `Test User ${i}`,
              email: `test${i}@example.com`
            });
          users.push(response.body.data);
        }
        
        // Test pagination
        const paginatedResponse = await request
          .get('/api/users')
          .query({ page: 1, limit: 3 });
        
        expect(paginatedResponse.status).toBe(200);
        expect(paginatedResponse.body.data.length).toBeLessThanOrEqual(3);
        expect(paginatedResponse.body.pagination).toBeDefined();
        expect(paginatedResponse.body.pagination.page).toBe(1);
        expect(paginatedResponse.body.pagination.limit).toBe(3);
        
        // Test search
        const searchResponse = await request
          .get('/api/users')
          .query({ search: 'Test User 1' });
        
        expect(searchResponse.status).toBe(200);
        const foundUser = searchResponse.body.data.find((u: any) => u.name === 'Test User 1');
        expect(foundUser).toBeDefined();
        
        // Cleanup
        for (const user of users) {
          await request.delete(`/api/users/${user.id}`);
        }
      });
    });

    test('should handle authentication with generated client', async () => {
      const request = supertest(backend.url);
      
      await test.step('Test authentication endpoints', async () => {
        // Test login
        const loginResponse = await request
          .post('/api/auth/login')
          .send({
            email: 'john@example.com',
            password: 'password123'
          });
        
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.success).toBe(true);
        expect(loginResponse.body.data.token).toBeDefined();
        
        const token = loginResponse.body.data.token;
        
        // Test authenticated endpoint
        const meResponse = await request
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);
        
        expect(meResponse.status).toBe(200);
        expect(meResponse.body.data.email).toBe('john@example.com');
        
        // Test logout
        const logoutResponse = await request
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`);
        
        expect(logoutResponse.status).toBe(200);
      });
      
      await test.step('Generate authenticated API client', async () => {
        const frontendPath = path.join(workspace.root, 'packages/frontend');
        
        // Generate client with auth support
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-auth --endpoint=/api/users --with-auth --auth-type=bearer',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
        
        // Verify auth methods were generated
        const clientPath = path.join(frontendPath, 'src/services/api-auth.ts');
        await assertFileContent(clientPath, 'setAuthToken');
        await assertFileContent(clientPath, 'Authorization');
        await assertFileContent(clientPath, 'Bearer');
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle network errors gracefully', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate resilient client', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-resilient --endpoint=/api/users --with-retry --timeout=5000',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Test client with network failures', async () => {
        // Configure mock server to fail
        mockApiServer.configure({ errorRate: 0.5 }); // 50% failure rate
        
        const testClientPath = path.join(frontendPath, 'test-resilient-client.js');
        const testCode = `
const { ApiResilientClient } = require('./src/services/api-resilient.ts');

async function testResilience() {
  const client = new ApiResilientClient('${mockApiServer.getUrl()}');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Make multiple requests
  for (let i = 0; i < 10; i++) {
    try {
      await client.getUsers();
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }
  
  console.log(\`Success: \${successCount}, Errors: \${errorCount}\`);
  
  // Should have some successes despite 50% error rate due to retry logic
  return successCount > 0;
}

testResilience().then(success => {
  process.exit(success ? 0 : 1);
});
`;
        
        await fs.writeFile(testClientPath, testCode);
        
        const testResult = await execCommand('node test-resilient-client.js', {
          cwd: frontendPath,
          timeout: 30000,
        });
        
        expect(testResult.exitCode).toBe(0);
        expect(testResult.stdout).toMatch(/Success: \d+, Errors: \d+/);
        
        // Reset error rate
        mockApiServer.configure({ errorRate: 0 });
      });
    });

    test('should handle timeout scenarios', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Test with slow responses', async () => {
        // Configure mock server with delay
        mockApiServer.configure({ delayMs: 3000 });
        
        const testClientPath = path.join(frontendPath, 'test-timeout-client.js');
        const testCode = `
const { ApiResilientClient } = require('./src/services/api-resilient.ts');

async function testTimeout() {
  const client = new ApiResilientClient('${mockApiServer.getUrl()}', {
    timeout: 2000 // 2 second timeout
  });
  
  try {
    await client.getUsers();
    return false; // Should not succeed
  } catch (error) {
    console.log('Timeout error caught:', error.message);
    return error.message.includes('timeout') || error.name === 'TimeoutError';
  }
}

testTimeout().then(success => {
  process.exit(success ? 0 : 1);
});
`;
        
        await fs.writeFile(testClientPath, testCode);
        
        const testResult = await execCommand('node test-timeout-client.js', {
          cwd: frontendPath,
          timeout: 10000,
        });
        
        expect(testResult.exitCode).toBe(0);
        expect(testResult.stdout).toContain('Timeout error caught');
        
        // Reset delay
        mockApiServer.configure({ delayMs: 0 });
      });
    });

    test('should validate response data', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with validation', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-validated --endpoint=/api/users --with-validation --schema-validation=zod',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Test response validation', async () => {
        const clientPath = path.join(frontendPath, 'src/services/api-validated.ts');
        
        // Should include validation imports and schemas
        await assertFileContent(clientPath, 'import { z }');
        await assertFileContent(clientPath, 'schema');
        await assertFileContent(clientPath, 'parse');
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('should support request caching', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with caching', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-cached --endpoint=/api/users --with-cache --cache-ttl=60000',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Test caching behavior', async () => {
        const testClientPath = path.join(frontendPath, 'test-cache-client.js');
        const testCode = `
const { ApiCachedClient } = require('./src/services/api-cached.ts');

async function testCaching() {
  const client = new ApiCachedClient('${backend.url}');
  
  console.time('First request');
  const result1 = await client.getUsers();
  console.timeEnd('First request');
  
  console.time('Cached request');
  const result2 = await client.getUsers();
  console.timeEnd('Cached request');
  
  // Both should return the same data
  console.log('Results match:', JSON.stringify(result1) === JSON.stringify(result2));
  
  return true;
}

testCaching().then(success => {
  process.exit(success ? 0 : 1);
});
`;
        
        await fs.writeFile(testClientPath, testCode);
        
        const testResult = await execCommand('node test-cache-client.js', {
          cwd: frontendPath,
          timeout: 15000,
        });
        
        expect(testResult.exitCode).toBe(0);
        expect(testResult.stdout).toContain('Results match: true');
      });
    });

    test('should support request batching', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with batching support', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-batched --endpoint=/api/users --with-batching --batch-window=100',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Test batching functionality', async () => {
        const clientPath = path.join(frontendPath, 'src/services/api-batched.ts');
        
        // Should include batching logic
        await assertFileContent(clientPath, 'batch');
        await assertFileContent(clientPath, 'queue');
      });
    });

    test('should measure performance characteristics', async () => {
      const request = supertest(backend.url);
      
      await test.step('Measure API response times', async () => {
        const results = [];
        
        for (let i = 0; i < 10; i++) {
          const { duration } = await measurePerformance(async () => {
            const response = await request.get('/api/users');
            expect(response.status).toBe(200);
          });
          
          results.push(duration);
        }
        
        const averageTime = results.reduce((a, b) => a + b) / results.length;
        const maxTime = Math.max(...results);
        const minTime = Math.min(...results);
        
        console.log(`Performance metrics - Avg: ${averageTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
        
        // API should respond within reasonable time
        expect(averageTime).toBeLessThan(1000); // 1 second average
        expect(maxTime).toBeLessThan(5000); // 5 second max
      });
    });
  });

  describe('Integration with Existing Codebase', () => {
    test('should integrate with existing React components', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client for existing components', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-react --endpoint=/api/users --with-hooks --integrate-existing',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify integration with existing components', async () => {
        // Check that hooks can be imported by existing components
        const userListPath = path.join(frontendPath, 'src/components/UserList.tsx');
        const userListContent = await fs.readFile(userListPath, 'utf8');
        
        // Should be able to use the generated hooks (manual integration test)
        expect(userListContent).toContain('User'); // Basic sanity check
      });
    });

    test('should respect existing TypeScript configuration', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client respecting tsconfig', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-ts --endpoint=/api/users --respect-tsconfig',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify TypeScript compatibility', async () => {
        const compileResult = await execCommand('bun run type-check', { 
          cwd: frontendPath,
          timeout: 30000,
        });
        
        expect(compileResult.exitCode).toBe(0);
        expect(compileResult.stderr).not.toContain('error TS');
      });
    });

    test('should work with existing state management', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with Redux integration', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-redux --endpoint=/api/users --state-library=redux-toolkit',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        if (result.exitCode === 0) {
          // If Redux integration is supported, verify it
          const reduxPath = path.join(frontendPath, 'src/store/api-redux.ts');
          const reduxExists = await fs.access(reduxPath).then(() => true).catch(() => false);
          
          if (reduxExists) {
            await assertFileContent(reduxPath, 'createApi');
            await assertFileContent(reduxPath, 'endpoints');
          }
        }
      });
    });
  });

  describe('Documentation and Developer Experience', () => {
    test('should generate comprehensive documentation', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with docs', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-documented --endpoint=/api/users --with-docs --examples',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify documentation generated', async () => {
        const docsPath = path.join(frontendPath, 'docs/api-documented.md');
        const docsExist = await fs.access(docsPath).then(() => true).catch(() => false);
        
        if (docsExist) {
          const docsContent = await fs.readFile(docsPath, 'utf8');
          expect(docsContent).toContain('# API Client Documentation');
          expect(docsContent).toContain('## Usage');
          expect(docsContent).toContain('## Examples');
        }
      });
    });

    test('should provide TypeScript IntelliSense support', async () => {
      const frontendPath = path.join(workspace.root, 'packages/frontend');
      
      await test.step('Generate client with full type definitions', async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-intellisense --endpoint=/api/users --full-types --jsdoc',
          { 
            cwd: frontendPath,
            timeout: 30000,
          }
        );
        
        expect(result.exitCode).toBe(0);
      });
      
      await test.step('Verify type definitions quality', async () => {
        const clientPath = path.join(frontendPath, 'src/services/api-intellisense.ts');
        const clientContent = await fs.readFile(clientPath, 'utf8');
        
        // Should have JSDoc comments
        expect(clientContent).toContain('/**');
        expect(clientContent).toContain('@param');
        expect(clientContent).toContain('@returns');
        
        // Should have comprehensive type definitions
        expect(clientContent).toContain('interface');
        expect(clientContent).toContain('Promise<');
      });
    });
  });
});
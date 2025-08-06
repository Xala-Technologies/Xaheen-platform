import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import * as path from 'path';
import * as fs from 'fs/promises';
import { 
  createTestContext, 
  execCommand, 
  assertFileContent,
  readJsonFile,
  writeJsonFile,
  measurePerformance,
} from '../utils/test-helpers';
import { createMonorepoWorkspace, installWorkspaceDependencies } from '../utils/monorepo-helper';
import { getTestConfig } from '../config/test-config';
import type { TestContext } from '../utils/test-helpers';
import type { MonorepoWorkspace } from '../utils/monorepo-helper';

describe('Service Generation Integration Tests', () => {
  let testContext: TestContext;
  let workspace: MonorepoWorkspace;
  const config = getTestConfig();

  beforeEach(async () => {
    testContext = await createTestContext(config);
    workspace = await createMonorepoWorkspace(testContext.tempDir, config);
    await installWorkspaceDependencies(workspace);
  });

  afterEach(async () => {
    await testContext.cleanup();
  });

  describe('xaheen generate integration Command', () => {
    test('should generate API client for user service', async () => {
      const { duration } = await measurePerformance(async () => {
        // Simulate the xaheen generate integration command
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration api-user --endpoint=/api/users --method=GET,POST,PUT,DELETE',
          { 
            cwd: path.join(workspace.root, 'packages/frontend'),
            timeout: 30000,
          }
        );

        expect(result.exitCode).toBe(0);
      });

      // Performance assertion
      expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds

      // Check that API client was generated
      const apiClientPath = path.join(workspace.root, 'packages/frontend/src/services/api-user.ts');
      const apiClientExists = await fs.access(apiClientPath).then(() => true).catch(() => false);
      expect(apiClientExists).toBe(true);

      // Validate generated API client content
      await assertFileContent(apiClientPath, 'export class ApiUserClient');
      await assertFileContent(apiClientPath, 'async getUsers()');
      await assertFileContent(apiClientPath, 'async createUser(');
      await assertFileContent(apiClientPath, 'async updateUser(');
      await assertFileContent(apiClientPath, 'async deleteUser(');
    });

    test('should generate TypeScript types for API responses', async () => {
      // Generate API client
      await execCommand(
        'node ../../../dist/cli.js generate integration api-post --endpoint=/api/posts --schema-file=./schemas/post.json',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that types were generated
      const typesPath = path.join(workspace.root, 'packages/frontend/src/types/api-post.types.ts');
      const typesExist = await fs.access(typesPath).then(() => true).catch(() => false);
      expect(typesExist).toBe(true);

      // Validate generated types
      await assertFileContent(typesPath, 'export interface Post');
      await assertFileContent(typesPath, 'export interface CreatePostRequest');
      await assertFileContent(typesPath, 'export interface UpdatePostRequest');
      await assertFileContent(typesPath, 'export interface PostApiResponse');
    });

    test('should generate React hooks for API integration', async () => {
      // Generate integration with React hooks
      await execCommand(
        'node ../../../dist/cli.js generate integration api-user --endpoint=/api/users --with-hooks',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that hooks were generated
      const hooksPath = path.join(workspace.root, 'packages/frontend/src/hooks/useApiUser.ts');
      const hooksExist = await fs.access(hooksPath).then(() => true).catch(() => false);
      expect(hooksExist).toBe(true);

      // Validate generated hooks
      await assertFileContent(hooksPath, 'export function useUsers()');
      await assertFileContent(hooksPath, 'export function useUser(');
      await assertFileContent(hooksPath, 'export function useCreateUser()');
      await assertFileContent(hooksPath, 'export function useUpdateUser()');
      await assertFileContent(hooksPath, 'export function useDeleteUser()');

      // Validate hooks use React Query or SWR
      const content = await fs.readFile(hooksPath, 'utf8');
      const hasReactQuery = content.includes('useQuery') || content.includes('useMutation');
      const hasSWR = content.includes('useSWR') || content.includes('mutate');
      expect(hasReactQuery || hasSWR).toBe(true);
    });

    test('should generate backend service endpoints', async () => {
      // Generate backend service
      await execCommand(
        'node ../../../dist/cli.js generate integration backend-service --name=PostService --crud --with-validation',
        { 
          cwd: path.join(workspace.root, 'packages/backend'),
          timeout: 30000,
        }
      );

      // Check that service was generated
      const servicePath = path.join(workspace.root, 'packages/backend/src/services/PostService.ts');
      const serviceExists = await fs.access(servicePath).then(() => true).catch(() => false);
      expect(serviceExists).toBe(true);

      // Validate generated service
      await assertFileContent(servicePath, 'export class PostService');
      await assertFileContent(servicePath, 'async findAll(');
      await assertFileContent(servicePath, 'async findById(');
      await assertFileContent(servicePath, 'async create(');
      await assertFileContent(servicePath, 'async update(');
      await assertFileContent(servicePath, 'async delete(');

      // Check that route was generated
      const routePath = path.join(workspace.root, 'packages/backend/src/routes/posts.ts');
      const routeExists = await fs.access(routePath).then(() => true).catch(() => false);
      expect(routeExists).toBe(true);

      // Validate generated route
      await assertFileContent(routePath, 'import { PostService }');
      await assertFileContent(routePath, 'router.get(\'/\',');
      await assertFileContent(routePath, 'router.post(\'/\',');
      await assertFileContent(routePath, 'router.put(\'/:id\',');
      await assertFileContent(routePath, 'router.delete(\'/:id\',');
    });
  });

  describe('OpenAPI Integration', () => {
    test('should generate client from OpenAPI specification', async () => {
      // Create a sample OpenAPI spec
      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/api/users': {
            get: {
              summary: 'Get users',
              responses: {
                '200': {
                  description: 'Users list',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            post: {
              summary: 'Create user',
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CreateUserRequest' },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'User created',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
            },
            CreateUserRequest: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
              required: ['name', 'email'],
            },
          },
        },
      };

      const specPath = path.join(workspace.root, 'packages/frontend/openapi.json');
      await writeJsonFile(specPath, openApiSpec);

      // Generate client from OpenAPI spec
      await execCommand(
        `node ../../../dist/cli.js generate integration openapi-client --spec=./openapi.json --output=./src/services/generated`,
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that client was generated
      const clientPath = path.join(workspace.root, 'packages/frontend/src/services/generated/api-client.ts');
      const clientExists = await fs.access(clientPath).then(() => true).catch(() => false);
      expect(clientExists).toBe(true);

      // Validate generated client has proper types
      await assertFileContent(clientPath, 'interface User');
      await assertFileContent(clientPath, 'interface CreateUserRequest');
      await assertFileContent(clientPath, 'class ApiClient');
    });

    test('should validate generated client against OpenAPI spec', async () => {
      // Create OpenAPI spec
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/api/health': {
            get: {
              responses: {
                '200': {
                  description: 'Health check',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          timestamp: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const specPath = path.join(workspace.root, 'packages/frontend/health-api.json');
      await writeJsonFile(specPath, openApiSpec);

      // Generate and validate client
      const result = await execCommand(
        `node ../../../dist/cli.js generate integration openapi-client --spec=./health-api.json --validate`,
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ OpenAPI specification is valid');
      expect(result.stdout).toContain('✓ Generated client is valid');
    });
  });

  describe('GraphQL Integration', () => {
    test('should generate GraphQL client with typed queries', async () => {
      // Create GraphQL schema
      const graphqlSchema = `
        type User {
          id: ID!
          name: String!
          email: String!
          createdAt: String!
          updatedAt: String!
        }

        type Query {
          users: [User!]!
          user(id: ID!): User
        }

        type Mutation {
          createUser(input: CreateUserInput!): User!
          updateUser(id: ID!, input: UpdateUserInput!): User!
          deleteUser(id: ID!): Boolean!
        }

        input CreateUserInput {
          name: String!
          email: String!
        }

        input UpdateUserInput {
          name: String
          email: String
        }
      `;

      const schemaPath = path.join(workspace.root, 'packages/frontend/schema.graphql');
      await fs.writeFile(schemaPath, graphqlSchema);

      // Generate GraphQL client
      await execCommand(
        `node ../../../dist/cli.js generate integration graphql-client --schema=./schema.graphql --endpoint=http://localhost:4000/graphql`,
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that GraphQL client was generated
      const clientPath = path.join(workspace.root, 'packages/frontend/src/services/graphql-client.ts');
      const clientExists = await fs.access(clientPath).then(() => true).catch(() => false);
      expect(clientExists).toBe(true);

      // Validate generated GraphQL client
      await assertFileContent(clientPath, 'export const GET_USERS');
      await assertFileContent(clientPath, 'export const GET_USER');
      await assertFileContent(clientPath, 'export const CREATE_USER');
      await assertFileContent(clientPath, 'export const UPDATE_USER');
      await assertFileContent(clientPath, 'export const DELETE_USER');

      // Check that types were generated
      const typesPath = path.join(workspace.root, 'packages/frontend/src/types/graphql.ts');
      const typesExist = await fs.access(typesPath).then(() => true).catch(() => false);
      expect(typesExist).toBe(true);

      await assertFileContent(typesPath, 'export interface User');
      await assertFileContent(typesPath, 'export interface CreateUserInput');
      await assertFileContent(typesPath, 'export interface UpdateUserInput');
    });
  });

  describe('Integration Validation', () => {
    test('should validate generated integration code compiles', async () => {
      // Generate API client
      await execCommand(
        'node ../../../dist/cli.js generate integration api-user --endpoint=/api/users',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Run TypeScript compilation to validate generated code
      const compileResult = await execCommand('bun run type-check', { 
        cwd: path.join(workspace.root, 'packages/frontend'),
        timeout: 30000,
      });

      expect(compileResult.exitCode).toBe(0);
      expect(compileResult.stderr).not.toContain('error TS');
    });

    test('should validate generated code follows ESLint rules', async () => {
      // Generate API client
      await execCommand(
        'node ../../../dist/cli.js generate integration api-user --endpoint=/api/users --with-hooks',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Run ESLint on generated code
      const lintResult = await execCommand('bun run lint src/services src/hooks', { 
        cwd: path.join(workspace.root, 'packages/frontend'),
        timeout: 30000,
      });

      // Should either pass or have only warnings (not errors)
      expect(lintResult.exitCode).toBeLessThanOrEqual(1);
    });

    test('should generate valid package.json dependencies', async () => {
      // Generate integration that requires specific dependencies
      await execCommand(
        'node ../../../dist/cli.js generate integration api-client --with-axios --with-react-query',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that dependencies were added to package.json
      const packageJson = await readJsonFile(path.join(workspace.root, 'packages/frontend/package.json'));
      expect(packageJson.dependencies).toHaveProperty('axios');
      expect(packageJson.dependencies).toHaveProperty('@tanstack/react-query');

      // Test that dependencies can be installed
      const installResult = await execCommand('bun install', { 
        cwd: path.join(workspace.root, 'packages/frontend'),
        timeout: 60000,
      });

      expect(installResult.exitCode).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid endpoint gracefully', async () => {
      const result = await execCommand(
        'node ../../../dist/cli.js generate integration api-invalid --endpoint=invalid-url',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid endpoint URL');
    });

    test('should handle missing schema file gracefully', async () => {
      const result = await execCommand(
        'node ../../../dist/cli.js generate integration openapi-client --spec=./non-existent.json',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Schema file not found');
    });

    test('should handle invalid OpenAPI specification', async () => {
      // Create invalid OpenAPI spec
      const invalidSpec = {
        openapi: '3.0.0',
        // Missing required 'info' field
        paths: {},
      };

      const specPath = path.join(workspace.root, 'packages/frontend/invalid.json');
      await writeJsonFile(specPath, invalidSpec);

      const result = await execCommand(
        'node ../../../dist/cli.js generate integration openapi-client --spec=./invalid.json',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid OpenAPI specification');
    });
  });

  describe('Configuration and Customization', () => {
    test('should support custom templates for code generation', async () => {
      // Create custom template directory
      const templatesDir = path.join(workspace.root, 'packages/frontend/.xaheen/templates');
      await fs.mkdir(templatesDir, { recursive: true });

      // Create custom API client template
      const customTemplate = `
// Custom API Client Template
export class {{className}} {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  {{#each methods}}
  async {{name}}({{#if params}}{{params}}{{/if}}): Promise<{{returnType}}> {
    // Custom implementation
    const response = await fetch(\`\${this.baseUrl}{{endpoint}}\`, {
      method: '{{method}}',
      {{#if hasBody}}
      body: JSON.stringify({{bodyParam}}),
      headers: { 'Content-Type': 'application/json' },
      {{/if}}
    });
    
    return response.json();
  }
  {{/each}}
}
`;

      await fs.writeFile(
        path.join(templatesDir, 'api-client.hbs'),
        customTemplate
      );

      // Generate using custom template
      const result = await execCommand(
        'node ../../../dist/cli.js generate integration api-custom --endpoint=/api/custom --template=api-client',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(0);

      // Validate custom template was used
      const generatedPath = path.join(workspace.root, 'packages/frontend/src/services/api-custom.ts');
      await assertFileContent(generatedPath, '// Custom API Client Template');
      await assertFileContent(generatedPath, 'export class ApiCustomClient');
    });

    test('should support configuration file for defaults', async () => {
      // Create configuration file
      const configPath = path.join(workspace.root, 'packages/frontend/xaheen.config.json');
      const config = {
        integration: {
          defaultEndpoint: 'http://localhost:8000',
          generateHooks: true,
          generateTypes: true,
          clientLibrary: 'axios',
          stateLibrary: 'react-query',
        },
      };

      await writeJsonFile(configPath, config);

      // Generate integration with config file
      const result = await execCommand(
        'node ../../../dist/cli.js generate integration api-configured --endpoint=/api/configured',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      expect(result.exitCode).toBe(0);

      // Validate configuration was used
      const hookPath = path.join(workspace.root, 'packages/frontend/src/hooks/useApiConfigured.ts');
      const hookExists = await fs.access(hookPath).then(() => true).catch(() => false);
      expect(hookExists).toBe(true);

      const clientPath = path.join(workspace.root, 'packages/frontend/src/services/api-configured.ts');
      await assertFileContent(clientPath, 'import axios from \'axios\'');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large OpenAPI specifications efficiently', async () => {
      // Create a large OpenAPI spec with many endpoints
      const paths: any = {};
      for (let i = 0; i < 100; i++) {
        paths[`/api/resource${i}`] = {
          get: {
            responses: {
              200: {
                description: `Get resource ${i}`,
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        };
      }

      const largeSpec = {
        openapi: '3.0.0',
        info: { title: 'Large API', version: '1.0.0' },
        paths,
      };

      const specPath = path.join(workspace.root, 'packages/frontend/large-api.json');
      await writeJsonFile(specPath, largeSpec);

      const { duration } = await measurePerformance(async () => {
        const result = await execCommand(
          'node ../../../dist/cli.js generate integration openapi-client --spec=./large-api.json',
          { 
            cwd: path.join(workspace.root, 'packages/frontend'),
            timeout: 60000,
          }
        );

        expect(result.exitCode).toBe(0);
      });

      // Should handle large specs efficiently (under 30 seconds)
      expect(duration).toBeLessThan(30000);
    });

    test('should generate tree-shakeable client code', async () => {
      await execCommand(
        'node ../../../dist/cli.js generate integration api-modular --endpoint=/api/users --tree-shakeable',
        { 
          cwd: path.join(workspace.root, 'packages/frontend'),
          timeout: 30000,
        }
      );

      // Check that individual method files were generated
      const servicesDir = path.join(workspace.root, 'packages/frontend/src/services/api-modular');
      const serviceFiles = await fs.readdir(servicesDir);
      
      expect(serviceFiles).toContain('get-users.ts');
      expect(serviceFiles).toContain('create-user.ts');
      expect(serviceFiles).toContain('update-user.ts');
      expect(serviceFiles).toContain('delete-user.ts');
      expect(serviceFiles).toContain('index.ts');

      // Validate index file exports individual functions
      const indexPath = path.join(servicesDir, 'index.ts');
      await assertFileContent(indexPath, 'export { getUsers } from \'./get-users\'');
      await assertFileContent(indexPath, 'export { createUser } from \'./create-user\'');
    });
  });
});
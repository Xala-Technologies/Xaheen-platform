/**
 * Phase 5 Test Configuration
 * Frontend-Backend Integration Testing Configuration
 */

export interface Phase5TestConfig {
  /** Test timeout in milliseconds */
  timeout: number;
  /** Temporary directory for test isolation */
  tempDir: string;
  /** Test ports for various services */
  ports: {
    frontend: number;
    backend: number;
    mockApi: number;
    auth: number;
  };
  /** Mock server configurations */
  mocks: {
    apiServer: {
      baseUrl: string;
      endpoints: string[];
    };
    authProvider: {
      baseUrl: string;
      clientId: string;
      clientSecret: string;
    };
  };
  /** Database configurations for testing */
  database: {
    sqlite: {
      path: string;
    };
    postgres: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
  };
  /** Workspace configurations */
  workspace: {
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
    workspaceRoot: string;
    packages: {
      frontend: string;
      backend: string;
      shared: string;
    };
  };
}

export const defaultConfig: Phase5TestConfig = {
  timeout: 30000,
  tempDir: '/tmp/xaheen-phase5-tests',
  ports: {
    frontend: 3000,
    backend: 8000,
    mockApi: 8080,
    auth: 8888,
  },
  mocks: {
    apiServer: {
      baseUrl: 'http://localhost:8080',
      endpoints: ['/api/users', '/api/posts', '/api/auth'],
    },
    authProvider: {
      baseUrl: 'http://localhost:8888',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
  },
  database: {
    sqlite: {
      path: ':memory:',
    },
    postgres: {
      host: 'localhost',
      port: 5432,
      database: 'xaheen_test',
      username: 'test',
      password: 'test',
    },
  },
  workspace: {
    packageManager: 'bun',
    workspaceRoot: 'test-workspace',
    packages: {
      frontend: 'packages/frontend',
      backend: 'packages/backend',
      shared: 'packages/shared',
    },
  },
};

export const ciConfig: Phase5TestConfig = {
  ...defaultConfig,
  timeout: 60000,
  tempDir: process.env.RUNNER_TEMP || '/tmp/xaheen-phase5-tests',
  ports: {
    frontend: 3001,
    backend: 8001,
    mockApi: 8081,
    auth: 8889,
  },
};

export function getTestConfig(environment: 'default' | 'ci' = 'default'): Phase5TestConfig {
  return environment === 'ci' ? ciConfig : defaultConfig;
}

export interface TestScenario {
  name: string;
  description: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  timeout?: number;
}

export const testScenarios: Record<string, TestScenario> = {
  monorepoNpmWorkspaces: {
    name: 'Monorepo with npm workspaces',
    description: 'Test monorepo setup using npm workspaces',
    timeout: 45000,
  },
  monorepoYarnWorkspaces: {
    name: 'Monorepo with Yarn workspaces',
    description: 'Test monorepo setup using Yarn workspaces',
    timeout: 45000,
  },
  linkedProjects: {
    name: 'Linked separate projects',
    description: 'Test npm link between separate frontend and backend projects',
    timeout: 30000,
  },
  apiClientGeneration: {
    name: 'API client generation',
    description: 'Test generation of TypeScript API clients from OpenAPI specs',
    timeout: 20000,
  },
  fullStackCrud: {
    name: 'Full-stack CRUD operations',
    description: 'Test complete CRUD workflow from frontend to backend',
    timeout: 60000,
  },
  authenticationFlow: {
    name: 'Authentication flow',
    description: 'Test OAuth2/JWT authentication across frontend and backend',
    timeout: 45000,
  },
  dataValidation: {
    name: 'Data validation',
    description: 'Test data validation on both frontend and backend',
    timeout: 30000,
  },
  errorHandling: {
    name: 'Error handling',
    description: 'Test error propagation and handling across the stack',
    timeout: 30000,
  },
  performanceMetrics: {
    name: 'Performance metrics',
    description: 'Test performance characteristics of full-stack operations',
    timeout: 60000,
  },
};
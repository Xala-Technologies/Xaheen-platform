import { BaseGenerator } from '../base.generator';
import { IntegrationTestOptions, TestTemplate } from './types';
import { promises as fs } from 'fs';
import * as path from 'path';

export class IntegrationTestingGenerator extends BaseGenerator<IntegrationTestOptions> {
  async generate(options: IntegrationTestOptions): Promise<void> {
    await this.validateOptions(options);
    
    this.logger.info('Generating comprehensive integration test suite...');
    
    try {
      // Generate test configuration
      await this.generateTestConfiguration(options);
      
      // Generate test setup and teardown
      await this.generateTestSetup(options);
      
      // Generate service integration tests
      await this.generateServiceIntegrationTests(options);
      
      // Generate database integration tests
      if (options.databases.length > 0) {
        await this.generateDatabaseTests(options);
      }
      
      // Generate external service integration tests
      if (options.externalServices.length > 0) {
        await this.generateExternalServiceTests(options);
      }
      
      // Generate test utilities and helpers
      await this.generateIntegrationHelpers(options);
      
      this.logger.success('Integration test suite generated successfully!');
      
    } catch (error) {
      this.logger.error('Failed to generate integration test suite', error);
      throw error;
    }
  }

  private async generateTestConfiguration(options: IntegrationTestOptions): Promise<void> {
    const configTemplate = this.getIntegrationTestConfig(options);
    await this.writeTemplate(configTemplate, options.projectPath);
  }

  private async generateTestSetup(options: IntegrationTestOptions): Promise<void> {
    const setupTemplate = this.getSetupTemplate(options);
    const teardownTemplate = this.getTeardownTemplate(options);
    
    await this.writeTemplate(setupTemplate, options.projectPath);
    await this.writeTemplate(teardownTemplate, options.projectPath);
  }

  private async generateServiceIntegrationTests(options: IntegrationTestOptions): Promise<void> {
    for (const service of options.services) {
      const templates = this.getServiceIntegrationTemplates(service, options);
      
      for (const template of templates) {
        const servicePath = path.join(options.projectPath, 'tests', 'integration', 'services');
        await this.ensureDirectoryExists(servicePath);
        await this.writeTemplate(template, servicePath);
      }
    }
  }

  private async generateDatabaseTests(options: IntegrationTestOptions): Promise<void> {
    for (const database of options.databases) {
      const templates = this.getDatabaseIntegrationTemplates(database, options);
      
      for (const template of templates) {
        const dbPath = path.join(options.projectPath, 'tests', 'integration', 'database');
        await this.ensureDirectoryExists(dbPath);
        await this.writeTemplate(template, dbPath);
      }
    }
  }

  private async generateExternalServiceTests(options: IntegrationTestOptions): Promise<void> {
    for (const service of options.externalServices) {
      const templates = this.getExternalServiceTemplates(service, options);
      
      for (const template of templates) {
        const externalPath = path.join(options.projectPath, 'tests', 'integration', 'external');
        await this.ensureDirectoryExists(externalPath);
        await this.writeTemplate(template, externalPath);
      }
    }
  }

  private async generateIntegrationHelpers(options: IntegrationTestOptions): Promise<void> {
    const helperTemplates = this.getIntegrationHelperTemplates(options);
    
    for (const template of helperTemplates) {
      const helpersPath = path.join(options.projectPath, 'tests', 'integration', 'helpers');
      await this.ensureDirectoryExists(helpersPath);
      await this.writeTemplate(template, helpersPath);
    }
  }

  private getIntegrationTestConfig(options: IntegrationTestOptions): TestTemplate {
    if (options.testingFramework === 'jest') {
      return {
        name: 'jest.integration.config.js',
        path: 'jest.integration.config.js',
        content: this.getJestIntegrationConfig(options),
        dependencies: ['jest', '@types/jest', 'ts-jest']
      };
    } else {
      return {
        name: 'vitest.integration.config.ts',
        path: 'vitest.integration.config.ts',
        content: this.getVitestIntegrationConfig(options),
        dependencies: ['vitest', '@vitest/ui', 'c8']
      };
    }
  }

  private getJestIntegrationConfig(options: IntegrationTestOptions): string {
    return `/** @type {import('jest').Config} */
module.exports = {
  displayName: '${options.projectName} - Integration Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{ts,js}',
    '<rootDir>/tests/integration/**/*.integration.{ts,js}'
  ],
  
  // Setup and teardown
  globalSetup: '<rootDir>/tests/integration/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/setup/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/integration-setup.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/*.d.ts'
  ],
  
  // Module mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // Test timeout for integration tests
  testTimeout: 30000,
  
  // Run tests serially for database tests
  maxWorkers: 1,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true
};`;
  }

  private getVitestIntegrationConfig(options: IntegrationTestOptions): string {
    return `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: '${options.projectName} - Integration Tests',
    environment: 'node',
    
    // Test file patterns
    include: [
      'tests/integration/**/*.test.{ts,js}',
      'tests/integration/**/*.integration.{ts,js}'
    ],
    
    // Setup files
    globalSetup: ['tests/integration/setup/global-setup.ts'],
    setupFiles: ['tests/integration/setup/integration-setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage/integration',
      include: ['src/**/*.{ts,js}'],
      exclude: [
        'src/**/*.test.{ts,js}',
        'src/**/*.spec.{ts,js}',
        'src/**/*.d.ts'
      ]
    },
    
    // Test timeout for integration tests
    testTimeout: 30000,
    
    // Run tests serially for database tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Globals
    globals: true
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests')
    }
  }
});`;
  }

  private getSetupTemplate(options: IntegrationTestOptions): TestTemplate {
    return {
      name: 'global-setup.ts',
      path: 'tests/integration/setup/global-setup.ts',
      content: `import { Pool } from 'pg';
import { createClient } from 'redis';

/**
 * Global setup for integration tests
 * This runs once before all integration tests
 */

interface TestEnvironment {
  database?: Pool;
  redis?: any;
  server?: any;
}

export const testEnvironment: TestEnvironment = {};

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Setting up integration test environment...');
  
  try {
    // Setup test database
    await setupTestDatabase();
    
    // Setup test Redis (if using Redis)
    await setupTestRedis();
    
    // Setup test server
    await setupTestServer();
    
    console.log('✅ Integration test environment ready');
  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error);
    throw error;
  }
}

async function setupTestDatabase(): Promise<void> {
  console.log('📦 Setting up test database...');
  
  // Create test database connection
  testEnvironment.database = new Pool({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || '${options.projectName}_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await testEnvironment.database.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }

  // Run migrations
  await runMigrations();
}

async function setupTestRedis(): Promise<void> {
  console.log('📦 Setting up test Redis...');
  
  try {
    testEnvironment.redis = createClient({
      url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1'
    });
    
    await testEnvironment.redis.connect();
    await testEnvironment.redis.ping();
    console.log('✅ Test Redis connected');
  } catch (error) {
    console.warn('⚠️ Redis not available, skipping Redis tests');
  }
}

async function setupTestServer(): Promise<void> {
  console.log('📦 Setting up test server...');
  
  // Import your app/server here
  // const { createApp } = await import('@/app');
  // testEnvironment.server = createApp();
  
  console.log('✅ Test server ready');
}

async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    // Add your migration runner here
    // Example with a simple schema creation:
    await testEnvironment.database?.query(\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    \`);
    
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    throw error;
  }
}`,
      dependencies: ['pg', '@types/pg', 'redis']
    };
  }

  private getTeardownTemplate(options: IntegrationTestOptions): TestTemplate {
    return {
      name: 'global-teardown.ts',
      path: 'tests/integration/setup/global-teardown.ts',
      content: `import { testEnvironment } from './global-setup';

/**
 * Global teardown for integration tests
 * This runs once after all integration tests
 */

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Cleaning up integration test environment...');
  
  try {
    // Cleanup database
    await cleanupDatabase();
    
    // Cleanup Redis
    await cleanupRedis();
    
    // Cleanup server
    await cleanupServer();
    
    console.log('✅ Integration test cleanup completed');
  } catch (error) {
    console.error('❌ Failed to cleanup integration test environment:', error);
  }
}

async function cleanupDatabase(): Promise<void> {
  if (testEnvironment.database) {
    console.log('🗑️ Cleaning up test database...');
    
    try {
      // Drop test tables
      await testEnvironment.database.query(\`
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      \`);
      
      // Close all connections
      await testEnvironment.database.end();
      console.log('✅ Test database cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup test database:', error);
    }
  }
}

async function cleanupRedis(): Promise<void> {
  if (testEnvironment.redis) {
    console.log('🗑️ Cleaning up test Redis...');
    
    try {
      // Flush test database
      await testEnvironment.redis.flushDb();
      
      // Disconnect
      await testEnvironment.redis.disconnect();
      console.log('✅ Test Redis cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup test Redis:', error);
    }
  }
}

async function cleanupServer(): Promise<void> {
  if (testEnvironment.server) {
    console.log('🗑️ Cleaning up test server...');
    
    try {
      // Close server if it has a close method
      if (typeof testEnvironment.server.close === 'function') {
        await new Promise((resolve) => {
          testEnvironment.server.close(resolve);
        });
      }
      
      console.log('✅ Test server cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup test server:', error);
    }
  }
}`,
      dependencies: []
    };
  }

  private getServiceIntegrationTemplates(service: string, options: IntegrationTestOptions): TestTemplate[] {
    return [{
      name: `${service}-integration.test.ts`,
      path: `${service}-integration.test.ts`,
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testEnvironment } from '../setup/global-setup';
import { integrationTestHelpers } from '../helpers/integration-helpers';

/**
 * Integration tests for ${service} service
 * Tests the interaction between ${service} and its dependencies
 */

describe('${service} Integration Tests', () => {
  let service: any;
  let database: any;
  let redis: any;

  beforeAll(async () => {
    // Setup service with real dependencies
    database = testEnvironment.database;
    redis = testEnvironment.redis;
    
    // Initialize service with real dependencies
    // service = new ${service}Service(database, redis);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await integrationTestHelpers.cleanDatabase(database);
    
    // Clean up Redis before each test
    if (redis) {
      await redis.flushDb();
    }
  });

  afterAll(async () => {
    // Final cleanup
    await integrationTestHelpers.cleanDatabase(database);
  });

  describe('${service} with Database Integration', () => {
    it('should create and retrieve ${service.toLowerCase()} from database', async () => {
      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Test ${service}',
        description: 'Integration test ${service.toLowerCase()}',
        createdAt: new Date()
      };

      // Act
      // const created${service} = await service.create(${service.toLowerCase()}Data);
      // const retrieved${service} = await service.findById(created${service}.id);

      // Assert
      // expect(retrieved${service}).toBeDefined();
      // expect(retrieved${service}.name).toBe(${service.toLowerCase()}Data.name);
      // expect(retrieved${service}.description).toBe(${service.toLowerCase()}Data.description);
      
      // Verify database state
      const dbResult = await database.query('SELECT * FROM ${service.toLowerCase()}s WHERE id = $1', [/* created${service}.id */]);
      // expect(dbResult.rows).toHaveLength(1);
    });

    it('should handle database constraints properly', async () => {
      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Unique ${service}',
        email: 'unique@example.com'
      };

      // Act - Create first ${service.toLowerCase()}
      // const first${service} = await service.create(${service.toLowerCase()}Data);

      // Assert - Should succeed
      // expect(first${service}).toBeDefined();

      // Act - Try to create duplicate
      try {
        // await service.create(${service.toLowerCase()}Data);
        // fail('Should have thrown an error for duplicate');
      } catch (error) {
        // Assert - Should fail with constraint violation
        // expect(error.message).toContain('duplicate');
      }
    });

    it('should handle database transactions correctly', async () => {
      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Transaction Test ${service}',
        items: [
          { name: 'Item 1', price: 100 },
          { name: 'Item 2', price: 200 }
        ]
      };

      // Act - Create ${service.toLowerCase()} with related items in transaction
      // const result = await service.createWithItems(${service.toLowerCase()}Data);

      // Assert - Both ${service.toLowerCase()} and items should be created
      // expect(result).toBeDefined();
      
      // Verify database state
      const ${service.toLowerCase()}Result = await database.query('SELECT * FROM ${service.toLowerCase()}s WHERE name = $1', [${service.toLowerCase()}Data.name]);
      const itemsResult = await database.query('SELECT * FROM items WHERE ${service.toLowerCase()}_id = $1', [/* result.id */]);
      
      // expect(${service.toLowerCase()}Result.rows).toHaveLength(1);
      // expect(itemsResult.rows).toHaveLength(2);
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Rollback Test ${service}',
        items: [
          { name: 'Valid Item', price: 100 },
          { name: 'Invalid Item', price: -50 } // This should cause an error
        ]
      };

      // Act & Assert
      try {
        // await service.createWithItems(${service.toLowerCase()}Data);
        // fail('Should have thrown an error');
      } catch (error) {
        // Verify rollback - no ${service.toLowerCase()} should be created
        const ${service.toLowerCase()}Result = await database.query('SELECT * FROM ${service.toLowerCase()}s WHERE name = $1', [${service.toLowerCase()}Data.name]);
        const itemsResult = await database.query('SELECT * FROM items WHERE ${service.toLowerCase()}_id IS NOT NULL');
        
        // expect(${service.toLowerCase()}Result.rows).toHaveLength(0);
        // expect(itemsResult.rows).toHaveLength(0);
      }
    });
  });

  describe('${service} with Cache Integration', () => {
    it('should cache ${service.toLowerCase()} data correctly', async () => {
      if (!redis) {
        console.log('Skipping Redis tests - Redis not available');
        return;
      }

      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Cached ${service}',
        description: 'Cache test ${service.toLowerCase()}'
      };

      // Act - Create ${service.toLowerCase()}
      // const created${service} = await service.create(${service.toLowerCase()}Data);
      
      // First retrieval - should cache the result
      // const first${service} = await service.findById(created${service}.id);
      
      // Second retrieval - should come from cache
      // const cached${service} = await service.findById(created${service}.id);

      // Assert
      // expect(first${service}).toEqual(cached${service});
      
      // Verify cache exists
      const cacheKey = \`${service.toLowerCase()}:\${/* created${service}.id */}\`;
      const cachedData = await redis.get(cacheKey);
      // expect(cachedData).toBeTruthy();
      
      const parsedCachedData = JSON.parse(cachedData || '{}');
      // expect(parsedCachedData.name).toBe(${service.toLowerCase()}Data.name);
    });

    it('should invalidate cache on ${service.toLowerCase()} update', async () => {
      if (!redis) {
        console.log('Skipping Redis tests - Redis not available');
        return;
      }

      // Arrange
      const ${service.toLowerCase()}Data = {
        name: 'Cache Invalidation ${service}',
        description: 'Original description'
      };

      // Act - Create and cache ${service.toLowerCase()}
      // const created${service} = await service.create(${service.toLowerCase()}Data);
      // await service.findById(created${service}.id); // This should cache it
      
      const cacheKey = \`${service.toLowerCase()}:\${/* created${service}.id */}\`;
      let cachedData = await redis.get(cacheKey);
      // expect(cachedData).toBeTruthy();
      
      // Update ${service.toLowerCase()}
      // await service.update(created${service}.id, { description: 'Updated description' });
      
      // Assert - Cache should be invalidated
      cachedData = await redis.get(cacheKey);
      // expect(cachedData).toBeFalsy();
    });
  });

  describe('${service} Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange - Close database connection temporarily
      await database.end();

      // Act & Assert
      try {
        // await service.findAll();
        // fail('Should have thrown a database error');
      } catch (error) {
        // expect(error.message).toContain('database');
      }

      // Restore database connection for other tests
      // Note: In a real scenario, you'd want to properly reconnect
    });

    it('should handle Redis connection errors gracefully', async () => {
      if (!redis) {
        console.log('Skipping Redis error tests - Redis not available');
        return;
      }

      // Arrange - Disconnect Redis temporarily
      await redis.disconnect();

      // Act - Operations should still work without cache
      const ${service.toLowerCase()}Data = {
        name: 'No Cache ${service}',
        description: 'Should work without Redis'
      };

      // const created${service} = await service.create(${service.toLowerCase()}Data);
      // const retrieved${service} = await service.findById(created${service}.id);

      // Assert - Should work but without caching
      // expect(retrieved${service}).toBeDefined();
      // expect(retrieved${service}.name).toBe(${service.toLowerCase()}Data.name);

      // Reconnect Redis for other tests
      await redis.connect();
    });
  });

  describe('${service} Performance Integration', () => {
    it('should handle bulk operations efficiently', async () => {
      // Arrange
      const bulkData = Array.from({ length: 100 }, (_, index) => ({
        name: \`Bulk ${service} \${index + 1}\`,
        description: \`Performance test ${service.toLowerCase()} \${index + 1}\`
      }));

      // Act
      const startTime = Date.now();
      // const results = await service.bulkCreate(bulkData);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      // expect(results).toHaveLength(100);
      // expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify database state
      const count = await database.query('SELECT COUNT(*) FROM ${service.toLowerCase()}s');
      // expect(parseInt(count.rows[0].count)).toBe(100);
    });

    it('should handle concurrent operations safely', async () => {
      // Arrange
      const concurrentOperations = Array.from({ length: 10 }, (_, index) => ({
        name: \`Concurrent ${service} \${index + 1}\`,
        description: \`Concurrency test ${service.toLowerCase()} \${index + 1}\`
      }));

      // Act - Execute operations concurrently
      const promises = concurrentOperations.map(data => 
        // service.create(data)
        Promise.resolve(data) // Placeholder
      );
      
      const results = await Promise.all(promises);

      // Assert
      // expect(results).toHaveLength(10);
      // results.forEach((result, index) => {
      //   expect(result.name).toBe(concurrentOperations[index].name);
      // });
      
      // Verify database consistency
      const count = await database.query('SELECT COUNT(*) FROM ${service.toLowerCase()}s');
      // expect(parseInt(count.rows[0].count)).toBe(10);
    });
  });
});`,
      dependencies: []
    }];
  }

  private getDatabaseIntegrationTemplates(database: string, options: IntegrationTestOptions): TestTemplate[] {
    return [{
      name: `${database}-integration.test.ts`,
      path: `${database}-integration.test.ts`,
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testEnvironment } from '../setup/global-setup';
import { integrationTestHelpers } from '../helpers/integration-helpers';

/**
 * Database integration tests for ${database}
 * Tests database operations, transactions, and data integrity
 */

describe('${database} Database Integration Tests', () => {
  let db: any;

  beforeAll(async () => {
    db = testEnvironment.database;
  });

  beforeEach(async () => {
    // Clean database before each test
    await integrationTestHelpers.cleanDatabase(db);
  });

  describe('Basic CRUD Operations', () => {
    it('should perform basic insert and select operations', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      };

      // Act - Insert
      const insertResult = await db.query(
        'INSERT INTO users (email, name, created_at) VALUES ($1, $2, $3) RETURNING *',
        [userData.email, userData.name, userData.createdAt]
      );

      // Act - Select
      const selectResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );

      // Assert
      expect(insertResult.rows).toHaveLength(1);
      expect(selectResult.rows).toHaveLength(1);
      expect(selectResult.rows[0].email).toBe(userData.email);
      expect(selectResult.rows[0].name).toBe(userData.name);
    });

    it('should perform update operations correctly', async () => {
      // Arrange
      const insertResult = await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        ['update@example.com', 'Original Name']
      );
      const userId = insertResult.rows[0].id;

      // Act
      const updateResult = await db.query(
        'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['Updated Name', userId]
      );

      // Assert
      expect(updateResult.rows).toHaveLength(1);
      expect(updateResult.rows[0].name).toBe('Updated Name');
      expect(updateResult.rows[0].updated_at).toBeTruthy();
    });

    it('should perform delete operations correctly', async () => {
      // Arrange
      const insertResult = await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        ['delete@example.com', 'To Be Deleted']
      );
      const userId = insertResult.rows[0].id;

      // Act
      const deleteResult = await db.query(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );

      const selectResult = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      // Assert
      expect(deleteResult.rowCount).toBe(1);
      expect(selectResult.rows).toHaveLength(0);
    });
  });

  describe('Constraint Handling', () => {
    it('should enforce unique constraints', async () => {
      // Arrange
      const userData = {
        email: 'unique@example.com',
        name: 'Unique User'
      };

      // Act - Insert first user
      await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2)',
        [userData.email, userData.name]
      );

      // Act & Assert - Try to insert duplicate
      await expect(async () => {
        await db.query(
          'INSERT INTO users (email, name) VALUES ($1, $2)',
          [userData.email, 'Another User']
        );
      }).rejects.toThrow();
    });

    it('should enforce foreign key constraints', async () => {
      // Arrange
      const userData = {
        email: 'fk@example.com',
        name: 'FK User'
      };

      const userResult = await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        [userData.email, userData.name]
      );
      const userId = userResult.rows[0].id;

      // Act - Insert order with valid user_id
      const validOrderResult = await db.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, 100.00, 'pending']
      );

      // Assert - Valid foreign key should work
      expect(validOrderResult.rows).toHaveLength(1);
      expect(validOrderResult.rows[0].user_id).toBe(userId);

      // Act & Assert - Invalid foreign key should fail
      await expect(async () => {
        await db.query(
          'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
          [99999, 50.00, 'pending'] // Non-existent user_id
        );
      }).rejects.toThrow();
    });

    it('should handle null constraints properly', async () => {
      // Act & Assert - Required field missing should fail
      await expect(async () => {
        await db.query(
          'INSERT INTO users (name) VALUES ($1)', // Missing required email
          ['No Email User']
        );
      }).rejects.toThrow();
    });
  });

  describe('Transaction Handling', () => {
    it('should commit successful transactions', async () => {
      // Arrange
      const client = await db.connect();

      try {
        // Act
        await client.query('BEGIN');
        
        const userResult = await client.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          ['transaction@example.com', 'Transaction User']
        );
        
        await client.query(
          'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
          [userResult.rows[0].id, 150.00, 'pending']
        );
        
        await client.query('COMMIT');

        // Assert
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', ['transaction@example.com']);
        const orderCheck = await db.query('SELECT * FROM orders WHERE user_id = $1', [userResult.rows[0].id]);
        
        expect(userCheck.rows).toHaveLength(1);
        expect(orderCheck.rows).toHaveLength(1);
      } finally {
        client.release();
      }
    });

    it('should rollback failed transactions', async () => {
      // Arrange
      const client = await db.connect();

      try {
        // Act
        await client.query('BEGIN');
        
        const userResult = await client.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          ['rollback@example.com', 'Rollback User']
        );
        
        // This should fail due to constraint violation or invalid data
        try {
          await client.query(
            'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
            [userResult.rows[0].id, -100.00, 'invalid_status'] // Invalid data
          );
        } catch (error) {
          await client.query('ROLLBACK');
        }

        // Assert - Nothing should be committed
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', ['rollback@example.com']);
        const orderCheck = await db.query('SELECT * FROM orders WHERE user_id = $1', [userResult.rows[0].id]);
        
        expect(userCheck.rows).toHaveLength(0);
        expect(orderCheck.rows).toHaveLength(0);
      } finally {
        client.release();
      }
    });

    it('should handle nested transactions with savepoints', async () => {
      // Arrange
      const client = await db.connect();

      try {
        // Act
        await client.query('BEGIN');
        
        // Outer transaction
        const userResult = await client.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          ['savepoint@example.com', 'Savepoint User']
        );
        
        await client.query('SAVEPOINT sp1');
        
        // Inner transaction that will be rolled back
        try {
          await client.query(
            'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
            [99999, 100.00, 'pending'] // Invalid user_id
          );
        } catch (error) {
          await client.query('ROLLBACK TO SAVEPOINT sp1');
        }
        
        // This should succeed
        await client.query(
          'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
          [userResult.rows[0].id, 100.00, 'pending']
        );
        
        await client.query('COMMIT');

        // Assert
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', ['savepoint@example.com']);
        const orderCheck = await db.query('SELECT * FROM orders WHERE user_id = $1', [userResult.rows[0].id]);
        
        expect(userCheck.rows).toHaveLength(1);
        expect(orderCheck.rows).toHaveLength(1);
      } finally {
        client.release();
      }
    });
  });

  describe('Performance and Connection Handling', () => {
    it('should handle multiple concurrent connections', async () => {
      // Arrange
      const concurrentOperations = Array.from({ length: 10 }, (_, index) => ({
        email: \`concurrent\${index}@example.com\`,
        name: \`Concurrent User \${index + 1}\`
      }));

      // Act
      const promises = concurrentOperations.map(async (userData, index) => {
        const client = await db.connect();
        try {
          return await client.query(
            'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
            [userData.email, userData.name]
          );
        } finally {
          client.release();
        }
      });

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.rows[0].email).toBe(concurrentOperations[index].email);
      });

      // Verify all users were created
      const allUsers = await db.query('SELECT * FROM users WHERE email LIKE $1', ['concurrent%@example.com']);
      expect(allUsers.rows).toHaveLength(10);
    });

    it('should handle bulk operations efficiently', async () => {
      // Arrange
      const bulkData = Array.from({ length: 1000 }, (_, index) => ({
        email: \`bulk\${index}@example.com\`,
        name: \`Bulk User \${index + 1}\`
      }));

      // Act
      const startTime = Date.now();
      
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        
        for (const userData of bulkData) {
          await client.query(
            'INSERT INTO users (email, name) VALUES ($1, $2)',
            [userData.email, userData.name]
          );
        }
        
        await client.query('COMMIT');
      } finally {
        client.release();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      const count = await db.query('SELECT COUNT(*) FROM users WHERE email LIKE $1', ['bulk%@example.com']);
      expect(parseInt(count.rows[0].count)).toBe(1000);
    });

    it('should properly release connections', async () => {
      // Arrange
      const initialConnections = db.totalCount;

      // Act - Create and release multiple connections
      for (let i = 0; i < 5; i++) {
        const client = await db.connect();
        await client.query('SELECT 1');
        client.release();
      }

      // Wait for connections to be properly released
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      const finalConnections = db.totalCount;
      expect(finalConnections).toBeLessThanOrEqual(initialConnections + 1);
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('should maintain referential integrity on cascading deletes', async () => {
      // Arrange
      const userResult = await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        ['cascade@example.com', 'Cascade User']
      );
      const userId = userResult.rows[0].id;

      await db.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
        [userId, 100.00, 'pending']
      );

      // Act - Delete user (should cascade to orders if set up)
      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      // Assert
      const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const orderCheck = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
      
      expect(userCheck.rows).toHaveLength(0);
      // Depending on your schema setup, orders might be cascaded or orphaned
      // expect(orderCheck.rows).toHaveLength(0); // If CASCADE is set up
    });

    it('should handle concurrent updates correctly', async () => {
      // Arrange
      const userResult = await db.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        ['concurrent-update@example.com', 'Original Name']
      );
      const userId = userResult.rows[0].id;

      // Act - Concurrent updates
      const update1 = db.query(
        'UPDATE users SET name = $1 WHERE id = $2',
        ['Update 1', userId]
      );
      
      const update2 = db.query(
        'UPDATE users SET name = $1 WHERE id = $2',
        ['Update 2', userId]
      );

      await Promise.all([update1, update2]);

      // Assert - One of the updates should have succeeded
      const finalResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      expect(finalResult.rows).toHaveLength(1);
      expect(['Update 1', 'Update 2']).toContain(finalResult.rows[0].name);
    });
  });
});`,
      dependencies: []
    }];
  }

  private getExternalServiceTemplates(service: string, options: IntegrationTestOptions): TestTemplate[] {
    return [{
      name: `${service}-external.test.ts`,
      path: `${service}-external.test.ts`,
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import axios from 'axios';
import { integrationTestHelpers } from '../helpers/integration-helpers';

/**
 * External service integration tests for ${service}
 * Tests integration with external APIs and services
 */

// Mock axios for external service calls
${options.testingFramework === 'jest' ? 'jest.mock(\'axios\');' : 'vi.mock(\'axios\');'}
const mockedAxios = axios as ${options.testingFramework === 'jest' ? 'jest.Mocked<typeof axios>' : 'MockedType<typeof axios>'};

describe('${service} External Service Integration Tests', () => {
  let ${service.toLowerCase()}Client: any;

  beforeAll(async () => {
    // Initialize ${service} client
    // ${service.toLowerCase()}Client = new ${service}Client({
    //   apiKey: process.env.TEST_${service.toUpperCase()}_API_KEY,
    //   baseURL: process.env.TEST_${service.toUpperCase()}_BASE_URL || 'https://api.${service.toLowerCase()}.com'
    // });
  });

  beforeEach(() => {
    // Clear all mocks before each test
    ${options.testingFramework === 'jest' ? 'jest.clearAllMocks' : 'vi.clearAllMocks'}();
  });

  describe('${service} API Integration', () => {
    it('should successfully call ${service} API with valid data', async () => {
      // Arrange
      const mockResponse = {
        data: {
          id: '123',
          status: 'success',
          result: 'API call successful'
        },
        status: 200,
        statusText: 'OK'
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const requestData = {
        action: 'test',
        parameters: {
          value: 'test-value'
        }
      };

      // Act
      // const result = await ${service.toLowerCase()}Client.performAction(requestData);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.id).toBe('123');
      // expect(result.status).toBe('success');
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/action'),
        requestData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle ${service} API authentication errors', async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            error: 'unauthorized',
            message: 'Invalid API key'
          },
          status: 401,
          statusText: 'Unauthorized'
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      const requestData = {
        action: 'test'
      };

      // Act & Assert
      await expect(async () => {
        // await ${service.toLowerCase()}Client.performAction(requestData);
      }).rejects.toThrow('Invalid API key');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle ${service} API rate limiting', async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            error: 'rate_limit_exceeded',
            message: 'Too many requests'
          },
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            'retry-after': '60'
          }
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      const requestData = {
        action: 'test'
      };

      // Act & Assert
      await expect(async () => {
        // await ${service.toLowerCase()}Client.performAction(requestData);
      }).rejects.toThrow('Too many requests');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle ${service} API network errors', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      (networkError as any).code = 'ECONNREFUSED';

      mockedAxios.post.mockRejectedValue(networkError);

      const requestData = {
        action: 'test'
      };

      // Act & Assert
      await expect(async () => {
        // await ${service.toLowerCase()}Client.performAction(requestData);
      }).rejects.toThrow('Network Error');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should retry failed requests with exponential backoff', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error'
        }
      };

      const mockSuccess = {
        data: {
          id: '456',
          status: 'success'
        },
        status: 200
      };

      mockedAxios.post
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const requestData = {
        action: 'test'
      };

      // Act
      // const result = await ${service.toLowerCase()}Client.performActionWithRetry(requestData);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.id).toBe('456');
      
      // Should have retried 3 times total (1 initial + 2 retries)
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('${service} Webhook Integration', () => {
    it('should process incoming webhooks correctly', async () => {
      // Arrange
      const webhookPayload = {
        event: 'test.completed',
        data: {
          id: '789',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
        signature: 'test-signature'
      };

      // Act
      // const result = await ${service.toLowerCase()}Client.processWebhook(webhookPayload);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.processed).toBe(true);
    });

    it('should validate webhook signatures', async () => {
      // Arrange
      const webhookPayload = {
        event: 'test.completed',
        data: {
          id: '789'
        },
        signature: 'invalid-signature'
      };

      // Act & Assert
      await expect(async () => {
        // await ${service.toLowerCase()}Client.processWebhook(webhookPayload);
      }).rejects.toThrow('Invalid webhook signature');
    });

    it('should handle unknown webhook events gracefully', async () => {
      // Arrange
      const webhookPayload = {
        event: 'unknown.event',
        data: {
          id: '999'
        },
        signature: 'valid-signature'
      };

      // Act
      // const result = await ${service.toLowerCase()}Client.processWebhook(webhookPayload);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.processed).toBe(false);
      // expect(result.reason).toBe('Unknown event type');
    });
  });

  describe('${service} Data Synchronization', () => {
    it('should synchronize data between systems correctly', async () => {
      // Arrange
      const localData = {
        id: 'local-123',
        name: 'Test Entity',
        lastModified: new Date()
      };

      const externalData = {
        id: 'external-123',
        name: 'Test Entity',
        updated_at: new Date().toISOString()
      };

      mockedAxios.get.mockResolvedValue({
        data: externalData,
        status: 200
      });

      mockedAxios.put.mockResolvedValue({
        data: { ...externalData, name: localData.name },
        status: 200
      });

      // Act
      // const result = await ${service.toLowerCase()}Client.syncData(localData);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.synchronized).toBe(true);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(\`/entities/\${localData.id}\`)
      );
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining(\`/entities/\${localData.id}\`),
        expect.objectContaining({
          name: localData.name
        })
      );
    });

    it('should handle sync conflicts appropriately', async () => {
      // Arrange
      const localData = {
        id: 'conflict-123',
        name: 'Local Name',
        lastModified: new Date('2024-01-01')
      };

      const externalData = {
        id: 'conflict-123',
        name: 'External Name',
        updated_at: '2024-01-02T00:00:00Z' // Newer than local
      };

      mockedAxios.get.mockResolvedValue({
        data: externalData,
        status: 200
      });

      // Act
      // const result = await ${service.toLowerCase()}Client.syncData(localData);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.conflict).toBe(true);
      // expect(result.resolution).toBe('external_wins');
    });

    it('should handle batch synchronization efficiently', async () => {
      // Arrange
      const batchData = Array.from({ length: 100 }, (_, index) => ({
        id: \`batch-\${index}\`,
        name: \`Batch Entity \${index}\`,
        lastModified: new Date()
      }));

      mockedAxios.post.mockResolvedValue({
        data: {
          processed: 100,
          failed: 0,
          results: batchData.map(item => ({ id: item.id, status: 'success' }))
        },
        status: 200
      });

      // Act
      const startTime = Date.now();
      // const result = await ${service.toLowerCase()}Client.batchSync(batchData);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      // expect(result).toBeDefined();
      // expect(result.processed).toBe(100);
      // expect(result.failed).toBe(0);
      // expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/batch-sync'),
        expect.objectContaining({
          entities: batchData
        })
      );
    });
  });

  describe('${service} Error Recovery', () => {
    it('should implement circuit breaker pattern', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 503,
          statusText: 'Service Unavailable'
        }
      };

      // Fail multiple times to trigger circuit breaker
      mockedAxios.post.mockRejectedValue(mockError);

      const requestData = { action: 'test' };

      // Act - Make multiple requests to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          // await ${service.toLowerCase()}Client.performAction(requestData);
        } catch (error) {
          // Expected to fail
        }
      }

      // Circuit breaker should now be open
      try {
        // const result = await ${service.toLowerCase()}Client.performAction(requestData);
        // fail('Should have thrown circuit breaker error');
      } catch (error) {
        // expect(error.message).toContain('Circuit breaker is open');
      }

      // Assert
      // Should have made only the initial requests, not the final one due to circuit breaker
      expect(mockedAxios.post).toHaveBeenCalledTimes(5);
    });

    it('should implement graceful degradation', async () => {
      // Arrange
      const mockError = {
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      mockedAxios.post.mockRejectedValue(mockError);

      const requestData = {
        action: 'test',
        fallbackData: 'cached-result'
      };

      // Act
      // const result = await ${service.toLowerCase()}Client.performActionWithFallback(requestData);

      // Assert
      // expect(result).toBeDefined();
      // expect(result.source).toBe('fallback');
      // expect(result.data).toBe('cached-result');
    });
  });
});

${options.testingFramework === 'vitest' ? `
// Vitest-specific type for mocked axios
type MockedType<T> = T & {
  [K in keyof T]: T[K] extends (...args: any[]) => any 
    ? ReturnType<typeof vi.fn> & T[K]
    : T[K];
};
` : ''}`,
      dependencies: ['axios']
    }];
  }

  private getIntegrationHelperTemplates(options: IntegrationTestOptions): TestTemplate[] {
    return [{
      name: 'integration-helpers.ts',
      path: 'integration-helpers.ts',
      content: `import { Pool } from 'pg';
import { createClient } from 'redis';

/**
 * Integration test helpers and utilities
 */

export const integrationTestHelpers = {
  /**
   * Clean all tables in the test database
   */
  cleanDatabase: async (database: Pool): Promise<void> => {
    await database.query(\`
      TRUNCATE TABLE orders, products, users RESTART IDENTITY CASCADE;
    \`);
  },

  /**
   * Seed database with test data
   */
  seedDatabase: async (database: Pool): Promise<void> => {
    // Insert test users
    await database.query(\`
      INSERT INTO users (email, name, created_at) VALUES 
        ('seed1@example.com', 'Seed User 1', NOW()),
        ('seed2@example.com', 'Seed User 2', NOW()),
        ('seed3@example.com', 'Seed User 3', NOW());
    \`);

    // Insert test products
    await database.query(\`
      INSERT INTO products (name, description, price, created_at) VALUES 
        ('Test Product 1', 'Description 1', 99.99, NOW()),
        ('Test Product 2', 'Description 2', 149.99, NOW()),
        ('Test Product 3', 'Description 3', 199.99, NOW());
    \`);
  },

  /**
   * Wait for database to be ready
   */
  waitForDatabase: async (database: Pool, maxAttempts: number = 30): Promise<void> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await database.query('SELECT 1');
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(\`Database not ready after \${maxAttempts} attempts\`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  /**
   * Wait for Redis to be ready
   */
  waitForRedis: async (redis: any, maxAttempts: number = 30): Promise<void> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await redis.ping();
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(\`Redis not ready after \${maxAttempts} attempts\`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  /**
   * Create test user with optional data
   */
  createTestUser: async (database: Pool, userData: Partial<any> = {}): Promise<any> => {
    const defaultData = {
      email: \`test\${Date.now()}@example.com\`,
      name: \`Test User \${Date.now()}\`,
      created_at: new Date()
    };

    const mergedData = { ...defaultData, ...userData };

    const result = await database.query(
      'INSERT INTO users (email, name, created_at) VALUES ($1, $2, $3) RETURNING *',
      [mergedData.email, mergedData.name, mergedData.created_at]
    );

    return result.rows[0];
  },

  /**
   * Create test product with optional data
   */
  createTestProduct: async (database: Pool, productData: Partial<any> = {}): Promise<any> => {
    const defaultData = {
      name: \`Test Product \${Date.now()}\`,
      description: \`Test product description \${Date.now()}\`,
      price: Math.floor(Math.random() * 1000) / 100,
      created_at: new Date()
    };

    const mergedData = { ...defaultData, ...productData };

    const result = await database.query(
      'INSERT INTO products (name, description, price, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [mergedData.name, mergedData.description, mergedData.price, mergedData.created_at]
    );

    return result.rows[0];
  },

  /**
   * Create test order with optional data
   */
  createTestOrder: async (database: Pool, orderData: Partial<any> = {}): Promise<any> => {
    let userId = orderData.userId;

    // Create a user if not provided
    if (!userId) {
      const user = await integrationTestHelpers.createTestUser(database);
      userId = user.id;
    }

    const defaultData = {
      user_id: userId,
      total: Math.floor(Math.random() * 10000) / 100,
      status: 'pending',
      created_at: new Date()
    };

    const mergedData = { ...defaultData, ...orderData };

    const result = await database.query(
      'INSERT INTO orders (user_id, total, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [mergedData.user_id, mergedData.total, mergedData.status, mergedData.created_at]
    );

    return result.rows[0];
  },

  /**
   * Wait for condition to be true
   */
  waitForCondition: async (
    condition: () => Promise<boolean> | boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(\`Condition not met within \${timeout}ms\`);
  },

  /**
   * Wait for HTTP endpoint to be available
   */
  waitForHttpEndpoint: async (
    url: string,
    timeout: number = 30000
  ): Promise<void> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url, { method: 'GET' });
        if (response.status < 500) {
          return;
        }
      } catch (error) {
        // Endpoint not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(\`HTTP endpoint \${url} not available within \${timeout}ms\`);
  },

  /**
   * Execute SQL scripts from file
   */
  executeSqlScript: async (database: Pool, scriptPath: string): Promise<void> => {
    const fs = await import('fs');
    const path = await import('path');
    
    const fullPath = path.resolve(scriptPath);
    const script = fs.readFileSync(fullPath, 'utf8');
    
    await database.query(script);
  },

  /**
   * Compare database records
   */
  compareRecords: (record1: any, record2: any, ignoreFields: string[] = ['created_at', 'updated_at']): boolean => {
    const keys1 = Object.keys(record1).filter(key => !ignoreFields.includes(key));
    const keys2 = Object.keys(record2).filter(key => !ignoreFields.includes(key));

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (record1[key] !== record2[key]) {
        return false;
      }
    }

    return true;
  },

  /**
   * Generate test data
   */
  generateTestData: {
    user: (overrides: Partial<any> = {}) => ({
      email: \`test\${Math.random().toString(36).substring(7)}@example.com\`,
      name: \`Test User \${Math.random().toString(36).substring(7)}\`,
      isActive: true,
      ...overrides
    }),

    product: (overrides: Partial<any> = {}) => ({
      name: \`Product \${Math.random().toString(36).substring(7)}\`,
      description: \`Test product description \${Math.random().toString(36).substring(7)}\`,
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      categoryId: Math.floor(Math.random() * 10) + 1,
      ...overrides
    }),

    order: (overrides: Partial<any> = {}) => ({
      total: parseFloat((Math.random() * 1000).toFixed(2)),
      status: ['pending', 'confirmed', 'shipped'][Math.floor(Math.random() * 3)],
      ...overrides
    })
  },

  /**
   * Mock external service responses
   */
  mockExternalService: {
    success: (data: any = {}) => ({
      data: {
        success: true,
        result: data,
        timestamp: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK'
    }),

    error: (status: number = 500, message: string = 'Internal Server Error') => ({
      response: {
        data: {
          error: true,
          message,
          timestamp: new Date().toISOString()
        },
        status,
        statusText: message
      }
    }),

    timeout: () => {
      const error = new Error('Request timeout');
      (error as any).code = 'ECONNABORTED';
      return error;
    }
  },

  /**
   * Database transaction helper
   */
  runInTransaction: async <T>(
    database: Pool,
    callback: (client: any) => Promise<T>
  ): Promise<T> => {
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Parallel test execution helper
   */
  runParallel: async <T>(
    tasks: (() => Promise<T>)[],
    concurrency: number = 5
  ): Promise<T[]> => {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  },

  /**
   * Memory usage monitoring
   */
  monitorMemory: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100
    };
  }
};`,
      dependencies: ['pg', '@types/pg', 'redis']
    }];
  }

  private async writeTemplate(template: TestTemplate, basePath: string): Promise<void> {
    const fullPath = path.join(basePath, template.path);
    const dirPath = path.dirname(fullPath);
    
    await this.ensureDirectoryExists(dirPath);
    await fs.writeFile(fullPath, template.content, 'utf8');
    
    this.logger.info(`Generated: ${template.name}`);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
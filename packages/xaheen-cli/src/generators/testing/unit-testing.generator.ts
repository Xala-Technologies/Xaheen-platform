import { BaseGenerator } from '../base.generator';
import { UnitTestOptions, TestTemplate } from './types';
import { promises as fs } from 'fs';
import * as path from 'path';

export class UnitTestingGenerator extends BaseGenerator<UnitTestOptions> {
  async generate(options: UnitTestOptions): Promise<void> {
    await this.validateOptions(options);
    
    this.logger.info('Generating comprehensive unit test suite...');
    
    try {
      // Generate test configuration
      await this.generateTestConfiguration(options);
      
      // Generate test setup files
      await this.generateTestSetup(options);
      
      // Generate layer-specific tests
      for (const layer of options.layers) {
        await this.generateLayerTests(layer, options);
      }
      
      // Generate utility test helpers
      await this.generateTestHelpers(options);
      
      // Generate mock factories if requested
      if (options.includeMocks) {
        await this.generateMockFactories(options);
      }
      
      this.logger.success('Unit test suite generated successfully!');
      
    } catch (error) {
      this.logger.error('Failed to generate unit test suite', error);
      throw error;
    }
  }

  private async generateTestConfiguration(options: UnitTestOptions): Promise<void> {
    const configTemplates = this.getConfigurationTemplates(options);
    
    for (const template of configTemplates) {
      await this.writeTemplate(template, options.projectPath);
    }
  }

  private async generateTestSetup(options: UnitTestOptions): Promise<void> {
    const setupTemplate = this.getSetupTemplate(options);
    await this.writeTemplate(setupTemplate, options.projectPath);
    
    // Generate global test utilities
    const globalUtilsTemplate = this.getGlobalUtilsTemplate(options);
    await this.writeTemplate(globalUtilsTemplate, options.projectPath);
  }

  private async generateLayerTests(layer: string, options: UnitTestOptions): Promise<void> {
    this.logger.info(`Generating ${layer} layer tests...`);
    
    const templates = this.getLayerTestTemplates(layer, options);
    
    for (const template of templates) {
      const layerPath = path.join(options.projectPath, 'tests', 'unit', layer);
      await this.ensureDirectoryExists(layerPath);
      await this.writeTemplate(template, layerPath);
    }
  }

  private async generateTestHelpers(options: UnitTestOptions): Promise<void> {
    const helperTemplates = this.getTestHelperTemplates(options);
    
    for (const template of helperTemplates) {
      const helpersPath = path.join(options.projectPath, 'tests', 'helpers');
      await this.ensureDirectoryExists(helpersPath);
      await this.writeTemplate(template, helpersPath);
    }
  }

  private async generateMockFactories(options: UnitTestOptions): Promise<void> {
    const mockTemplates = this.getMockFactoryTemplates(options);
    
    for (const template of mockTemplates) {
      const mocksPath = path.join(options.projectPath, 'tests', 'mocks');
      await this.ensureDirectoryExists(mocksPath);
      await this.writeTemplate(template, mocksPath);
    }
  }

  private getConfigurationTemplates(options: UnitTestOptions): TestTemplate[] {
    const templates: TestTemplate[] = [];
    
    if (options.testingFramework === 'jest') {
      templates.push({
        name: 'jest.config.js',
        path: 'jest.config.js',
        content: this.getJestConfiguration(options),
        dependencies: ['jest', '@types/jest', 'ts-jest']
      });
    } else if (options.testingFramework === 'vitest') {
      templates.push({
        name: 'vitest.config.ts',
        path: 'vitest.config.ts',
        content: this.getVitestConfiguration(options),
        dependencies: ['vitest', '@vitest/ui', 'c8']
      });
    }
    
    return templates;
  }

  private getJestConfiguration(options: UnitTestOptions): string {
    return `/** @type {import('jest').Config} */
module.exports = {
  displayName: '${options.projectName} - Unit Tests',
  preset: 'ts-jest',
  testEnvironment: '${options.platform === 'browser' ? 'jsdom' : 'node'}',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,js}',
    '<rootDir>/src/**/__tests__/**/*.{ts,js}',
    '<rootDir>/src/**/*.{test,spec}.{ts,js}'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest-setup.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ${JSON.stringify(options.coverage?.reporters || ['text', 'lcov', 'html'])},
  coverageThreshold: {
    global: {
      branches: ${options.coverage?.threshold || 80},
      functions: ${options.coverage?.threshold || 80},
      lines: ${options.coverage?.threshold || 80},
      statements: ${options.coverage?.threshold || 80}
    }
  },
  
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
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Performance
  maxWorkers: '50%',
  
  // Verbose output
  verbose: true
};`;
  }

  private getVitestConfiguration(options: UnitTestOptions): string {
    return `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: '${options.projectName} - Unit Tests',
    environment: '${options.platform === 'browser' ? 'happy-dom' : 'node'}',
    
    // Test file patterns
    include: [
      'tests/unit/**/*.test.{ts,js}',
      'src/**/__tests__/**/*.{ts,js}',
      'src/**/*.{test,spec}.{ts,js}'
    ],
    
    // Setup files
    setupFiles: ['tests/setup/vitest-setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'c8',
      reporter: ${JSON.stringify(options.coverage?.reporters || ['text', 'lcov', 'html'])},
      reportsDirectory: 'coverage/unit',
      thresholds: {
        branches: ${options.coverage?.threshold || 80},
        functions: ${options.coverage?.threshold || 80},
        lines: ${options.coverage?.threshold || 80},
        statements: ${options.coverage?.threshold || 80}
      }
    },
    
    // Globals
    globals: true,
    
    // Mock configuration
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    
    // Performance
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'tests')
    }
  }
});`;
  }

  private getSetupTemplate(options: UnitTestOptions): TestTemplate {
    const setupFileName = options.testingFramework === 'jest' ? 'jest-setup.ts' : 'vitest-setup.ts';
    
    return {
      name: setupFileName,
      path: `tests/setup/${setupFileName}`,
      content: this.getSetupContent(options),
      dependencies: []
    };
  }

  private getSetupContent(options: UnitTestOptions): string {
    const imports = options.testingFramework === 'jest' 
      ? "import 'jest-extended';\nimport { TextEncoder, TextDecoder } from 'util';"
      : "import { vi } from 'vitest';\nimport { TextEncoder, TextDecoder } from 'util';";

    return `${imports}

// Global setup for ${options.testingFramework} tests
${options.platform === 'node' ? `
// Node.js environment setup
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
` : `
// Browser environment setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    removeListener: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    addEventListener: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    removeEventListener: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    dispatchEvent: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
  })),
});

// Mock fetch globally
global.fetch = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}();
`}

// Custom matchers and utilities
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => \`expected \${received} not to be a valid date\`,
        pass: true,
      };
    } else {
      return {
        message: () => \`expected \${received} to be a valid date\`,
        pass: false,
      };
    }
  },
});

// Test timeout configuration
${options.testingFramework === 'jest' ? 'jest.setTimeout(10000);' : ''}

// Console override for cleaner test output
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
};`;
  }

  private getGlobalUtilsTemplate(options: UnitTestOptions): TestTemplate {
    return {
      name: 'test-utils.ts',
      path: 'tests/utils/test-utils.ts',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';

/**
 * Common test utilities and helpers
 */

export const testUtils = {
  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number = 0): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Wait for next tick
   */
  waitForNextTick: (): Promise<void> => {
    return new Promise(resolve => process.nextTick(resolve));
  },

  /**
   * Mock console methods
   */
  mockConsole: () => {
    const consoleMock = {
      log: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      error: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      warn: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      info: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    };

    ${options.testingFramework === 'jest' 
      ? 'jest.spyOn(console, \'log\').mockImplementation(consoleMock.log);'
      : 'vi.spyOn(console, \'log\').mockImplementation(consoleMock.log);'
    }
    ${options.testingFramework === 'jest' 
      ? 'jest.spyOn(console, \'error\').mockImplementation(consoleMock.error);'
      : 'vi.spyOn(console, \'error\').mockImplementation(consoleMock.error);'
    }
    ${options.testingFramework === 'jest' 
      ? 'jest.spyOn(console, \'warn\').mockImplementation(consoleMock.warn);'
      : 'vi.spyOn(console, \'warn\').mockImplementation(consoleMock.warn);'
    }
    ${options.testingFramework === 'jest' 
      ? 'jest.spyOn(console, \'info\').mockImplementation(consoleMock.info);'
      : 'vi.spyOn(console, \'info\').mockImplementation(consoleMock.info);'
    }

    return consoleMock;
  },

  /**
   * Generate test data
   */
  generateTestData: <T extends Record<string, any>>(
    template: T,
    overrides: Partial<T> = {}
  ): T => {
    return { ...template, ...overrides };
  },

  /**
   * Create mock function with type safety
   */
  createMockFunction: <T extends (...args: any[]) => any>(): ${options.testingFramework === 'jest' ? 'jest.MockedFunction<T>' : 'MockedFunction<T>'} => {
    return ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}() as ${options.testingFramework === 'jest' ? 'jest.MockedFunction<T>' : 'MockedFunction<T>'};
  },

  /**
   * Assert that a function throws with a specific message
   */
  expectToThrowWithMessage: async (
    fn: () => Promise<any> | any,
    expectedMessage: string | RegExp
  ): Promise<void> => {
    try {
      await fn();
      throw new Error('Expected function to throw');
    } catch (error) {
      if (error instanceof Error) {
        if (typeof expectedMessage === 'string') {
          expect(error.message).toBe(expectedMessage);
        } else {
          expect(error.message).toMatch(expectedMessage);
        }
      } else {
        throw new Error('Expected error to be an instance of Error');
      }
    }
  },
};

/**
 * Date utilities for testing
 */
export const dateUtils = {
  /**
   * Create a fixed date for consistent testing
   */
  createFixedDate: (dateString: string = '2024-01-01T00:00:00.000Z'): Date => {
    return new Date(dateString);
  },

  /**
   * Mock Date.now()
   */
  mockDateNow: (date: string | Date = '2024-01-01T00:00:00.000Z'): void => {
    const fixedDate = typeof date === 'string' ? new Date(date) : date;
    ${options.testingFramework === 'jest' 
      ? 'jest.spyOn(Date, \'now\').mockReturnValue(fixedDate.getTime());'
      : 'vi.spyOn(Date, \'now\').mockReturnValue(fixedDate.getTime());'
    }
  },
};

/**
 * Async utilities for testing
 */
export const asyncUtils = {
  /**
   * Wait for condition to be true
   */
  waitForCondition: async (
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> => {
    const startTime = Date.now();
    
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error(\`Condition not met within \${timeout}ms\`);
      }
      await testUtils.wait(interval);
    }
  },

  /**
   * Test error boundaries
   */
  testErrorHandling: async <T>(
    fn: () => Promise<T>,
    expectedError: string | RegExp | Error
  ): Promise<void> => {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (typeof expectedError === 'string') {
        expect(error).toEqual(expect.objectContaining({
          message: expectedError
        }));
      } else if (expectedError instanceof RegExp) {
        expect((error as Error).message).toMatch(expectedError);
      } else {
        expect(error).toEqual(expectedError);
      }
    }
  },
};

${options.testingFramework === 'vitest' ? `
// Vitest-specific type extensions
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidDate(): T;
  }
}

type MockedFunction<T extends (...args: any[]) => any> = T & {
  mockImplementation: (fn: T) => MockedFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockRejectedValue: (value: any) => MockedFunction<T>;
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
};
` : ''}`,
      dependencies: []
    };
  }

  private getLayerTestTemplates(layer: string, options: UnitTestOptions): TestTemplate[] {
    switch (layer) {
      case 'controller':
        return this.getControllerTestTemplates(options);
      case 'service':
        return this.getServiceTestTemplates(options);
      case 'repository':
        return this.getRepositoryTestTemplates(options);
      case 'utils':
        return this.getUtilsTestTemplates(options);
      case 'components':
        return this.getComponentTestTemplates(options);
      default:
        return [];
    }
  }

  private getControllerTestTemplates(options: UnitTestOptions): TestTemplate[] {
    return [{
      name: 'example-controller.test.ts',
      path: 'example-controller.test.ts',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testUtils } from '@tests/utils/test-utils';

// Example controller test
describe('ExampleController', () => {
  let controller: any;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      findAll: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      findById: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      create: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      update: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      delete: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    };

    // Initialize controller with mocked dependencies
    // controller = new ExampleController(mockService);
  });

  afterEach(() => {
    ${options.testingFramework === 'jest' ? 'jest.clearAllMocks' : 'vi.clearAllMocks'}();
  });

  describe('GET /examples', () => {
    it('should return all examples', async () => {
      // Arrange
      const mockExamples = [
        { id: 1, name: 'Example 1' },
        { id: 2, name: 'Example 2' }
      ];
      mockService.findAll.mockResolvedValue(mockExamples);

      const mockRequest = {};
      const mockResponse = {
        json: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
        status: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockReturnThis(),
      };

      // Act
      // await controller.getAll(mockRequest, mockResponse);

      // Assert
      // expect(mockService.findAll).toHaveBeenCalledTimes(1);
      // expect(mockResponse.json).toHaveBeenCalledWith(mockExamples);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockService.findAll.mockRejectedValue(new Error(errorMessage));

      const mockRequest = {};
      const mockResponse = {
        json: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
        status: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockReturnThis(),
      };

      // Act & Assert
      await testUtils.expectToThrowWithMessage(
        async () => {
          // await controller.getAll(mockRequest, mockResponse);
        },
        errorMessage
      );
    });
  });

  describe('POST /examples', () => {
    it('should create a new example', async () => {
      // Arrange
      const newExample = { name: 'New Example' };
      const createdExample = { id: 1, ...newExample };
      mockService.create.mockResolvedValue(createdExample);

      const mockRequest = { body: newExample };
      const mockResponse = {
        json: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
        status: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockReturnThis(),
      };

      // Act
      // await controller.create(mockRequest, mockResponse);

      // Assert
      // expect(mockService.create).toHaveBeenCalledWith(newExample);
      // expect(mockResponse.status).toHaveBeenCalledWith(201);
      // expect(mockResponse.json).toHaveBeenCalledWith(createdExample);
    });

    it('should validate input data', async () => {
      // Arrange
      const invalidExample = {}; // Missing required fields
      const mockRequest = { body: invalidExample };
      const mockResponse = {
        json: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
        status: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockReturnThis(),
      };

      // Act
      // await controller.create(mockRequest, mockResponse);

      // Assert
      // expect(mockResponse.status).toHaveBeenCalledWith(400);
      // expect(mockService.create).not.toHaveBeenCalled();
    });
  });
});`,
      dependencies: []
    }];
  }

  private getServiceTestTemplates(options: UnitTestOptions): TestTemplate[] {
    return [{
      name: 'example-service.test.ts',
      path: 'example-service.test.ts',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testUtils, asyncUtils } from '@tests/utils/test-utils';

// Example service test
describe('ExampleService', () => {
  let service: any;
  let mockRepository: any;
  let mockLogger: any;

  beforeEach(() => {
    mockRepository = {
      findAll: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      findById: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      create: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      update: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      delete: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    };

    mockLogger = {
      info: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      error: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      warn: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      debug: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    };

    // Initialize service with mocked dependencies
    // service = new ExampleService(mockRepository, mockLogger);
  });

  afterEach(() => {
    ${options.testingFramework === 'jest' ? 'jest.clearAllMocks' : 'vi.clearAllMocks'}();
  });

  describe('findAll', () => {
    it('should return all examples', async () => {
      // Arrange
      const mockExamples = [
        { id: 1, name: 'Example 1', createdAt: new Date() },
        { id: 2, name: 'Example 2', createdAt: new Date() }
      ];
      mockRepository.findAll.mockResolvedValue(mockExamples);

      // Act
      // const result = await service.findAll();

      // Assert
      // expect(result).toEqual(mockExamples);
      // expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      // expect(mockLogger.info).toHaveBeenCalledWith('Finding all examples');
    });

    it('should handle repository errors', async () => {
      // Arrange
      const errorMessage = 'Repository error';
      mockRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.findAll();
        },
        /Repository error/
      );

      // expect(mockLogger.error).toHaveBeenCalledWith('Error finding examples', expect.any(Error));
    });

    it('should return empty array when no examples exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      // const result = await service.findAll();

      // Assert
      // expect(result).toEqual([]);
      // expect(mockLogger.info).toHaveBeenCalledWith('No examples found');
    });
  });

  describe('findById', () => {
    it('should return example by id', async () => {
      // Arrange
      const exampleId = 1;
      const mockExample = { id: exampleId, name: 'Example 1', createdAt: new Date() };
      mockRepository.findById.mockResolvedValue(mockExample);

      // Act
      // const result = await service.findById(exampleId);

      // Assert
      // expect(result).toEqual(mockExample);
      // expect(mockRepository.findById).toHaveBeenCalledWith(exampleId);
    });

    it('should throw error when example not found', async () => {
      // Arrange
      const exampleId = 999;
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.findById(exampleId);
        },
        \`Example with id \${exampleId} not found\`
      );
    });
  });

  describe('create', () => {
    it('should create new example', async () => {
      // Arrange
      const newExampleData = { name: 'New Example' };
      const createdExample = { id: 1, ...newExampleData, createdAt: new Date() };
      mockRepository.create.mockResolvedValue(createdExample);

      // Act
      // const result = await service.create(newExampleData);

      // Assert
      // expect(result).toEqual(createdExample);
      // expect(mockRepository.create).toHaveBeenCalledWith(newExampleData);
      // expect(mockLogger.info).toHaveBeenCalledWith('Created new example', { id: 1 });
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {}; // Missing required name field

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.create(invalidData);
        },
        /Name is required/
      );

      // expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository creation errors', async () => {
      // Arrange
      const newExampleData = { name: 'New Example' };
      mockRepository.create.mockRejectedValue(new Error('Unique constraint violation'));

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.create(newExampleData);
        },
        /Failed to create example/
      );
    });
  });

  describe('update', () => {
    it('should update existing example', async () => {
      // Arrange
      const exampleId = 1;
      const updateData = { name: 'Updated Example' };
      const existingExample = { id: exampleId, name: 'Original Example', createdAt: new Date() };
      const updatedExample = { ...existingExample, ...updateData, updatedAt: new Date() };

      mockRepository.findById.mockResolvedValue(existingExample);
      mockRepository.update.mockResolvedValue(updatedExample);

      // Act
      // const result = await service.update(exampleId, updateData);

      // Assert
      // expect(result).toEqual(updatedExample);
      // expect(mockRepository.findById).toHaveBeenCalledWith(exampleId);
      // expect(mockRepository.update).toHaveBeenCalledWith(exampleId, updateData);
    });

    it('should throw error when updating non-existent example', async () => {
      // Arrange
      const exampleId = 999;
      const updateData = { name: 'Updated Example' };
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.update(exampleId, updateData);
        },
        \`Example with id \${exampleId} not found\`
      );

      // expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing example', async () => {
      // Arrange
      const exampleId = 1;
      const existingExample = { id: exampleId, name: 'Example to delete', createdAt: new Date() };
      mockRepository.findById.mockResolvedValue(existingExample);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      // const result = await service.delete(exampleId);

      // Assert
      // expect(result).toBe(true);
      // expect(mockRepository.findById).toHaveBeenCalledWith(exampleId);
      // expect(mockRepository.delete).toHaveBeenCalledWith(exampleId);
      // expect(mockLogger.info).toHaveBeenCalledWith('Deleted example', { id: exampleId });
    });

    it('should throw error when deleting non-existent example', async () => {
      // Arrange
      const exampleId = 999;
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await asyncUtils.testErrorHandling(
        async () => {
          // await service.delete(exampleId);
        },
        \`Example with id \${exampleId} not found\`
      );

      // expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});`,
      dependencies: []
    }];
  }

  private getRepositoryTestTemplates(options: UnitTestOptions): TestTemplate[] {
    return [{
      name: 'example-repository.test.ts',
      path: 'example-repository.test.ts',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testUtils, dateUtils } from '@tests/utils/test-utils';

// Example repository test
describe('ExampleRepository', () => {
  let repository: any;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = {
      query: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      transaction: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
      close: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
    };

    // Initialize repository with mocked database
    // repository = new ExampleRepository(mockDatabase);
    
    // Mock fixed dates for consistent testing
    dateUtils.mockDateNow('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    ${options.testingFramework === 'jest' ? 'jest.clearAllMocks' : 'vi.clearAllMocks'}();
    ${options.testingFramework === 'jest' ? 'jest.restoreAllMocks' : 'vi.restoreAllMocks'}();
  });

  describe('findAll', () => {
    it('should return all examples from database', async () => {
      // Arrange
      const mockRows = [
        { id: 1, name: 'Example 1', created_at: '2024-01-01T00:00:00.000Z' },
        { id: 2, name: 'Example 2', created_at: '2024-01-01T00:00:00.000Z' }
      ];
      mockDatabase.query.mockResolvedValue({ rows: mockRows });

      // Act
      // const result = await repository.findAll();

      // Assert
      // expect(result).toEqual([
      //   { id: 1, name: 'Example 1', createdAt: new Date('2024-01-01T00:00:00.000Z') },
      //   { id: 2, name: 'Example 2', createdAt: new Date('2024-01-01T00:00:00.000Z') }
      // ]);
      // expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM examples ORDER BY created_at DESC');
    });

    it('should return empty array when no results', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({ rows: [] });

      // Act
      // const result = await repository.findAll();

      // Assert
      // expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockDatabase.query.mockRejectedValue(new Error('Connection timeout'));

      // Act & Assert
      await expect(async () => {
        // await repository.findAll();
      }).rejects.toThrow('Connection timeout');
    });
  });

  describe('findById', () => {
    it('should return example by id', async () => {
      // Arrange
      const exampleId = 1;
      const mockRow = { id: exampleId, name: 'Example 1', created_at: '2024-01-01T00:00:00.000Z' };
      mockDatabase.query.mockResolvedValue({ rows: [mockRow] });

      // Act
      // const result = await repository.findById(exampleId);

      // Assert
      // expect(result).toEqual({
      //   id: exampleId,
      //   name: 'Example 1',
      //   createdAt: new Date('2024-01-01T00:00:00.000Z')
      // });
      // expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM examples WHERE id = $1', [exampleId]);
    });

    it('should return null when example not found', async () => {
      // Arrange
      const exampleId = 999;
      mockDatabase.query.mockResolvedValue({ rows: [] });

      // Act
      // const result = await repository.findById(exampleId);

      // Assert
      // expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new example', async () => {
      // Arrange
      const newExampleData = { name: 'New Example' };
      const createdRow = {
        id: 1,
        name: 'New Example',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };
      mockDatabase.query.mockResolvedValue({ rows: [createdRow] });

      // Act
      // const result = await repository.create(newExampleData);

      // Assert
      // expect(result).toEqual({
      //   id: 1,
      //   name: 'New Example',
      //   createdAt: new Date('2024-01-01T00:00:00.000Z'),
      //   updatedAt: new Date('2024-01-01T00:00:00.000Z')
      // });
      // expect(mockDatabase.query).toHaveBeenCalledWith(
      //   'INSERT INTO examples (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      //   ['New Example']
      // );
    });

    it('should handle unique constraint violations', async () => {
      // Arrange
      const newExampleData = { name: 'Duplicate Example' };
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505'; // PostgreSQL unique violation code
      mockDatabase.query.mockRejectedValue(error);

      // Act & Assert
      await expect(async () => {
        // await repository.create(newExampleData);
      }).rejects.toThrow('duplicate key value violates unique constraint');
    });
  });

  describe('update', () => {
    it('should update existing example', async () => {
      // Arrange
      const exampleId = 1;
      const updateData = { name: 'Updated Example' };
      const updatedRow = {
        id: exampleId,
        name: 'Updated Example',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T01:00:00.000Z'
      };
      mockDatabase.query.mockResolvedValue({ rows: [updatedRow] });

      // Act
      // const result = await repository.update(exampleId, updateData);

      // Assert
      // expect(result).toEqual({
      //   id: exampleId,
      //   name: 'Updated Example',
      //   createdAt: new Date('2024-01-01T00:00:00.000Z'),
      //   updatedAt: new Date('2024-01-01T01:00:00.000Z')
      // });
      // expect(mockDatabase.query).toHaveBeenCalledWith(
      //   'UPDATE examples SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      //   ['Updated Example', exampleId]
      // );
    });

    it('should return null when updating non-existent example', async () => {
      // Arrange
      const exampleId = 999;
      const updateData = { name: 'Updated Example' };
      mockDatabase.query.mockResolvedValue({ rows: [] });

      // Act
      // const result = await repository.update(exampleId, updateData);

      // Assert
      // expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing example', async () => {
      // Arrange
      const exampleId = 1;
      mockDatabase.query.mockResolvedValue({ rowCount: 1 });

      // Act
      // const result = await repository.delete(exampleId);

      // Assert
      // expect(result).toBe(true);
      // expect(mockDatabase.query).toHaveBeenCalledWith('DELETE FROM examples WHERE id = $1', [exampleId]);
    });

    it('should return false when deleting non-existent example', async () => {
      // Arrange
      const exampleId = 999;
      mockDatabase.query.mockResolvedValue({ rowCount: 0 });

      // Act
      // const result = await repository.delete(exampleId);

      // Assert
      // expect(result).toBe(false);
    });
  });

  describe('transaction handling', () => {
    it('should execute operations within transaction', async () => {
      // Arrange
      const mockTransactionCallback = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue('transaction result');
      mockDatabase.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDatabase);
      });

      // Act
      // const result = await repository.executeInTransaction(mockTransactionCallback);

      // Assert
      // expect(result).toBe('transaction result');
      // expect(mockDatabase.transaction).toHaveBeenCalledWith(mockTransactionCallback);
    });

    it('should handle transaction rollback on error', async () => {
      // Arrange
      const mockTransactionCallback = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockRejectedValue(new Error('Transaction failed'));
      mockDatabase.transaction.mockImplementation(async (callback: any) => {
        throw new Error('Transaction rolled back');
      });

      // Act & Assert
      await expect(async () => {
        // await repository.executeInTransaction(mockTransactionCallback);
      }).rejects.toThrow('Transaction rolled back');
    });
  });
});`,
      dependencies: []
    }];
  }

  private getUtilsTestTemplates(options: UnitTestOptions): TestTemplate[] {
    return [{
      name: 'string-utils.test.ts',
      path: 'string-utils.test.ts',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { testUtils } from '@tests/utils/test-utils';

// Example utility function tests
describe('StringUtils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter of string', () => {
      // Arrange
      const input = 'hello world';
      const expected = 'Hello world';

      // Act
      // const result = StringUtils.capitalize(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle empty string', () => {
      // Arrange
      const input = '';
      const expected = '';

      // Act
      // const result = StringUtils.capitalize(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle single character string', () => {
      // Arrange
      const input = 'a';
      const expected = 'A';

      // Act
      // const result = StringUtils.capitalize(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle already capitalized string', () => {
      // Arrange
      const input = 'Hello World';
      const expected = 'Hello World';

      // Act
      // const result = StringUtils.capitalize(input);

      // Assert
      // expect(result).toBe(expected);
    });
  });

  describe('slugify', () => {
    it('should convert string to slug', () => {
      // Arrange
      const input = 'Hello World! This is a Test.';
      const expected = 'hello-world-this-is-a-test';

      // Act
      // const result = StringUtils.slugify(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle special characters', () => {
      // Arrange
      const input = 'Café & Restaurant: "The Best" Place!';
      const expected = 'cafe-restaurant-the-best-place';

      // Act
      // const result = StringUtils.slugify(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle empty string', () => {
      // Arrange
      const input = '';
      const expected = '';

      // Act
      // const result = StringUtils.slugify(input);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle numbers', () => {
      // Arrange
      const input = 'Product 123 - Version 2.0';
      const expected = 'product-123-version-2-0';

      // Act
      // const result = StringUtils.slugify(input);

      // Assert
      // expect(result).toBe(expected);
    });
  });

  describe('truncate', () => {
    it('should truncate long string', () => {
      // Arrange
      const input = 'This is a very long string that should be truncated';
      const maxLength = 20;
      const expected = 'This is a very lo...';

      // Act
      // const result = StringUtils.truncate(input, maxLength);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should not truncate short string', () => {
      // Arrange
      const input = 'Short string';
      const maxLength = 20;
      const expected = 'Short string';

      // Act
      // const result = StringUtils.truncate(input, maxLength);

      // Assert
      // expect(result).toBe(expected);
    });

    it('should handle custom suffix', () => {
      // Arrange
      const input = 'This is a long string';
      const maxLength = 10;
      const suffix = '>>>';
      const expected = 'This is>>>';

      // Act
      // const result = StringUtils.truncate(input, maxLength, suffix);

      // Assert
      // expect(result).toBe(expected);
    });
  });

  describe('isEmail', () => {
    it('should validate correct email addresses', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+label@gmail.com',
        'firstname.lastname@company.org'
      ];

      // Act & Assert
      validEmails.forEach(email => {
        // expect(StringUtils.isEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      // Arrange
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user name@domain.com'
      ];

      // Act & Assert
      invalidEmails.forEach(email => {
        // expect(StringUtils.isEmail(email)).toBe(false);
      });
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      // Arrange
      const length = 10;

      // Act
      // const result = StringUtils.generateRandomString(length);

      // Assert
      // expect(result).toHaveLength(length);
      // expect(typeof result).toBe('string');
    });

    it('should generate different strings on each call', () => {
      // Arrange
      const length = 10;

      // Act
      // const result1 = StringUtils.generateRandomString(length);
      // const result2 = StringUtils.generateRandomString(length);

      // Assert
      // expect(result1).not.toBe(result2);
    });

    it('should only contain alphanumeric characters by default', () => {
      // Arrange
      const length = 100;
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;

      // Act
      // const result = StringUtils.generateRandomString(length);

      // Assert
      // expect(result).toMatch(alphanumericRegex);
    });
  });
});`,
      dependencies: []
    }];
  }

  private getComponentTestTemplates(options: UnitTestOptions): TestTemplate[] {
    if (options.platform !== 'browser') {
      return [];
    }

    return [{
      name: 'example-component.test.tsx',
      path: 'example-component.test.tsx',
      content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { testUtils } from '@tests/utils/test-utils';

// Example React component test
describe('ExampleComponent', () => {
  const defaultProps = {
    title: 'Test Title',
    onButtonClick: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(),
  };

  beforeEach(() => {
    ${options.testingFramework === 'jest' ? 'jest.clearAllMocks' : 'vi.clearAllMocks'}();
  });

  it('should render component with title', () => {
    // Arrange & Act
    // render(<ExampleComponent {...defaultProps} />);

    // Assert
    // expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should call onButtonClick when button is clicked', async () => {
    // Arrange
    // render(<ExampleComponent {...defaultProps} />);
    // const button = screen.getByRole('button', { name: /click me/i });

    // Act
    // fireEvent.click(button);

    // Assert
    // expect(defaultProps.onButtonClick).toHaveBeenCalledTimes(1);
  });

  it('should display loading state', () => {
    // Arrange
    const loadingProps = { ...defaultProps, isLoading: true };

    // Act
    // render(<ExampleComponent {...loadingProps} />);

    // Assert
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();
    // expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Arrange
    const errorProps = { ...defaultProps, error: 'Something went wrong' };

    // Act
    // render(<ExampleComponent {...errorProps} />);

    // Assert
    // expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    // Arrange & Act
    // render(<ExampleComponent {...defaultProps} />);

    // Assert
    // expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // expect(screen.getByRole('button')).toHaveAccessibleName();
  });

  describe('keyboard interactions', () => {
    it('should handle Enter key press', () => {
      // Arrange
      // render(<ExampleComponent {...defaultProps} />);
      // const button = screen.getByRole('button');

      // Act
      // fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // Assert
      // expect(defaultProps.onButtonClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key press', () => {
      // Arrange
      // render(<ExampleComponent {...defaultProps} />);
      // const button = screen.getByRole('button');

      // Act
      // fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      // Assert
      // expect(defaultProps.onButtonClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('async operations', () => {
    it('should handle async data loading', async () => {
      // Arrange
      const asyncProps = {
        ...defaultProps,
        fetchData: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue({ data: 'loaded data' })
      };

      // Act
      // render(<ExampleComponent {...asyncProps} />);

      // Assert
      // await waitFor(() => {
      //   expect(screen.getByText('loaded data')).toBeInTheDocument();
      // });
      // expect(asyncProps.fetchData).toHaveBeenCalledTimes(1);
    });

    it('should handle async operation failures', async () => {
      // Arrange
      const asyncProps = {
        ...defaultProps,
        fetchData: ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockRejectedValue(new Error('Fetch failed'))
      };

      // Act
      // render(<ExampleComponent {...asyncProps} />);

      // Assert
      // await waitFor(() => {
      //   expect(screen.getByText(/error/i)).toBeInTheDocument();
      // });
    });
  });

  describe('props validation', () => {
    it('should render with minimum required props', () => {
      // Arrange
      const minimalProps = { title: 'Minimal Title' };

      // Act
      // render(<ExampleComponent {...minimalProps} />);

      // Assert
      // expect(screen.getByText('Minimal Title')).toBeInTheDocument();
    });

    it('should handle optional props', () => {
      // Arrange
      const propsWithOptional = {
        ...defaultProps,
        subtitle: 'Optional Subtitle',
        variant: 'secondary'
      };

      // Act
      // render(<ExampleComponent {...propsWithOptional} />);

      // Assert
      // expect(screen.getByText('Optional Subtitle')).toBeInTheDocument();
      // expect(screen.getByRole('button')).toHaveClass('button--secondary');
    });
  });
});`,
      dependencies: ['@testing-library/react', '@testing-library/jest-dom']
    }];
  }

  private getTestHelperTemplates(options: UnitTestOptions): TestTemplate[] {
    return [
      {
        name: 'mock-builders.ts',
        path: 'mock-builders.ts',
        content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';

/**
 * Mock builders for creating test doubles
 */

export class MockBuilder<T> {
  private mockObject: Partial<T> = {};

  static create<T>(): MockBuilder<T> {
    return new MockBuilder<T>();
  }

  with<K extends keyof T>(key: K, value: T[K] | ${options.testingFramework === 'jest' ? 'jest.MockedFunction<any>' : 'MockedFunction<any>'}): this {
    this.mockObject[key] = value;
    return this;
  }

  withMethod<K extends keyof T>(key: K, implementation?: T[K]): this {
    const mockFn = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(implementation);
    this.mockObject[key] = mockFn as T[K];
    return this;
  }

  build(): T {
    return this.mockObject as T;
  }
}

/**
 * Repository mock builder
 */
export class RepositoryMockBuilder<T> {
  private repository: any = {};

  static create<T>(): RepositoryMockBuilder<T> {
    return new RepositoryMockBuilder<T>();
  }

  withFindAll(returnValue: T[] = []): this {
    this.repository.findAll = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(returnValue);
    return this;
  }

  withFindById(returnValue: T | null = null): this {
    this.repository.findById = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(returnValue);
    return this;
  }

  withCreate(returnValue?: T): this {
    this.repository.create = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(returnValue);
    return this;
  }

  withUpdate(returnValue?: T): this {
    this.repository.update = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(returnValue);
    return this;
  }

  withDelete(returnValue: boolean = true): this {
    this.repository.delete = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(returnValue);
    return this;
  }

  withCustomMethod(methodName: string, implementation?: any): this {
    this.repository[methodName] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(implementation);
    return this;
  }

  build(): any {
    return this.repository;
  }
}

/**
 * Service mock builder
 */
export class ServiceMockBuilder<T> {
  private service: any = {};

  static create<T>(): ServiceMockBuilder<T> {
    return new ServiceMockBuilder<T>();
  }

  withMethod(methodName: string, implementation?: any): this {
    this.service[methodName] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}(implementation);
    return this;
  }

  withAsyncMethod(methodName: string, resolvedValue?: any, rejectedValue?: any): this {
    if (rejectedValue) {
      this.service[methodName] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockRejectedValue(rejectedValue);
    } else {
      this.service[methodName] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockResolvedValue(resolvedValue);
    }
    return this;
  }

  build(): any {
    return this.service;
  }
}

/**
 * HTTP client mock builder
 */
export class HttpClientMockBuilder {
  private client: any = {};

  static create(): HttpClientMockBuilder {
    return new HttpClientMockBuilder();
  }

  withGet(url: string | RegExp, response: any, status: number = 200): this {
    if (!this.client.get) {
      this.client.get = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}();
    }
    
    if (typeof url === 'string') {
      this.client.get.mockImplementation((requestUrl: string) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      this.client.get.mockImplementation((requestUrl: string) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    return this;
  }

  withPost(url: string | RegExp, response: any, status: number = 201): this {
    if (!this.client.post) {
      this.client.post = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}();
    }
    
    if (typeof url === 'string') {
      this.client.post.mockImplementation((requestUrl: string) => {
        if (requestUrl === url) {
          return Promise.resolve({ data: response, status });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    } else {
      this.client.post.mockImplementation((requestUrl: string) => {
        if (url.test(requestUrl)) {
          return Promise.resolve({ data: response, status });
        }
        return Promise.reject(new Error(\`Unexpected URL: \${requestUrl}\`));
      });
    }
    
    return this;
  }

  withError(method: 'get' | 'post' | 'put' | 'delete', error: Error): this {
    this.client[method] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockRejectedValue(error);
    return this;
  }

  build(): any {
    return this.client;
  }
}

/**
 * Database mock builder
 */
export class DatabaseMockBuilder {
  private database: any = {};

  static create(): DatabaseMockBuilder {
    return new DatabaseMockBuilder();
  }

  withQuery(sql: string | RegExp, result: any): this {
    if (!this.database.query) {
      this.database.query = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}();
    }

    if (typeof sql === 'string') {
      this.database.query.mockImplementation((query: string, params?: any[]) => {
        if (query === sql) {
          return Promise.resolve(result);
        }
        return Promise.reject(new Error(\`Unexpected query: \${query}\`));
      });
    } else {
      this.database.query.mockImplementation((query: string, params?: any[]) => {
        if (sql.test(query)) {
          return Promise.resolve(result);
        }
        return Promise.reject(new Error(\`Unexpected query: \${query}\`));
      });
    }

    return this;
  }

  withTransaction(callback?: (client: any) => Promise<any>): this {
    this.database.transaction = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockImplementation(async (fn: any) => {
      if (callback) {
        return await callback(this.database);
      }
      return await fn(this.database);
    });
    return this;
  }

  withError(method: string, error: Error): this {
    this.database[method] = ${options.testingFramework === 'jest' ? 'jest.fn' : 'vi.fn'}().mockRejectedValue(error);
    return this;
  }

  build(): any {
    return this.database;
  }
}

${options.testingFramework === 'vitest' ? `
// Vitest-specific type extensions
type MockedFunction<T extends (...args: any[]) => any> = T & {
  mockImplementation: (fn: T) => MockedFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockRejectedValue: (value: any) => MockedFunction<T>;
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
};
` : ''}`,
        dependencies: []
      }
    ];
  }

  private getMockFactoryTemplates(options: UnitTestOptions): TestTemplate[] {
    return [
      {
        name: 'entity-factories.ts',
        path: 'entity-factories.ts',
        content: `import { ${options.testingFramework === 'jest' ? 'jest' : 'vi'} } from '${options.testingFramework}';

/**
 * Entity factories for generating test data
 */

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  products: Product[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base factory class
 */
abstract class BaseFactory<T> {
  protected abstract getDefaults(): Partial<T>;

  create(overrides: Partial<T> = {}): T {
    return { ...this.getDefaults(), ...overrides } as T;
  }

  createMany(count: number, overrides: Partial<T> = {}): T[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ ...overrides, ...(overrides.id ? { id: (overrides.id as number) + index } : { id: index + 1 }) } as Partial<T>)
    );
  }

  createPartial(overrides: Partial<T> = {}): Partial<T> {
    return { ...this.getDefaults(), ...overrides };
  }
}

/**
 * User factory
 */
export class UserFactory extends BaseFactory<User> {
  protected getDefaults(): Partial<User> {
    const now = new Date();
    return {
      id: Math.floor(Math.random() * 10000),
      email: \`user\${Math.floor(Math.random() * 1000)}@example.com\`,
      name: \`Test User \${Math.floor(Math.random() * 1000)}\`,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };
  }

  withEmail(email: string): UserFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), email })
    });
  }

  withName(name: string): UserFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), name })
    });
  }

  inactive(): UserFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), isActive: false })
    });
  }

  static create(overrides: Partial<User> = {}): User {
    return new UserFactory().create(overrides);
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return new UserFactory().createMany(count, overrides);
  }
}

/**
 * Product factory
 */
export class ProductFactory extends BaseFactory<Product> {
  protected getDefaults(): Partial<Product> {
    const now = new Date();
    return {
      id: Math.floor(Math.random() * 10000),
      name: \`Product \${Math.floor(Math.random() * 1000)}\`,
      description: \`Description for product \${Math.floor(Math.random() * 1000)}\`,
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      categoryId: Math.floor(Math.random() * 10) + 1,
      createdAt: now,
      updatedAt: now,
    };
  }

  withName(name: string): ProductFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), name })
    });
  }

  withPrice(price: number): ProductFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), price })
    });
  }

  withCategory(categoryId: number): ProductFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), categoryId })
    });
  }

  static create(overrides: Partial<Product> = {}): Product {
    return new ProductFactory().create(overrides);
  }

  static createMany(count: number, overrides: Partial<Product> = {}): Product[] {
    return new ProductFactory().createMany(count, overrides);
  }
}

/**
 * Order factory
 */
export class OrderFactory extends BaseFactory<Order> {
  protected getDefaults(): Partial<Order> {
    const now = new Date();
    const products = ProductFactory.createMany(Math.floor(Math.random() * 5) + 1);
    const total = products.reduce((sum, product) => sum + product.price, 0);

    return {
      id: Math.floor(Math.random() * 10000),
      userId: Math.floor(Math.random() * 1000) + 1,
      products,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
  }

  withUser(userId: number): OrderFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), userId })
    });
  }

  withProducts(products: Product[]): OrderFactory {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), products, total: parseFloat(total.toFixed(2)) })
    });
  }

  withStatus(status: Order['status']): OrderFactory {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, {
      getDefaults: () => ({ ...this.getDefaults(), status })
    });
  }

  confirmed(): OrderFactory {
    return this.withStatus('confirmed');
  }

  shipped(): OrderFactory {
    return this.withStatus('shipped');
  }

  delivered(): OrderFactory {
    return this.withStatus('delivered');
  }

  cancelled(): OrderFactory {
    return this.withStatus('cancelled');
  }

  static create(overrides: Partial<Order> = {}): Order {
    return new OrderFactory().create(overrides);
  }

  static createMany(count: number, overrides: Partial<Order> = {}): Order[] {
    return new OrderFactory().createMany(count, overrides);
  }
}

/**
 * Factory registry for managing all factories
 */
export class FactoryRegistry {
  private static factories: Map<string, any> = new Map();

  static register<T>(name: string, factory: BaseFactory<T>): void {
    this.factories.set(name, factory);
  }

  static get<T>(name: string): BaseFactory<T> {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(\`Factory '\${name}' not found. Make sure to register it first.\`);
    }
    return factory;
  }

  static create<T>(name: string, overrides: Partial<T> = {}): T {
    return this.get<T>(name).create(overrides);
  }

  static createMany<T>(name: string, count: number, overrides: Partial<T> = {}): T[] {
    return this.get<T>(name).createMany(count, overrides);
  }
}

// Register default factories
FactoryRegistry.register('User', new UserFactory());
FactoryRegistry.register('Product', new ProductFactory());
FactoryRegistry.register('Order', new OrderFactory());

/**
 * Utility functions for test data generation
 */
export const testDataUtils = {
  /**
   * Generate random email
   */
  randomEmail: (): string => {
    return \`test.\${Math.random().toString(36).substring(7)}@example.com\`;
  },

  /**
   * Generate random string
   */
  randomString: (length: number = 10): string => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Generate random number within range
   */
  randomNumber: (min: number = 0, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate random date within range
   */
  randomDate: (start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  /**
   * Generate random boolean
   */
  randomBoolean: (): boolean => {
    return Math.random() < 0.5;
  },

  /**
   * Pick random item from array
   */
  randomChoice: <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
  },

  /**
   * Generate array of random items
   */
  randomArray: <T>(generator: () => T, min: number = 1, max: number = 5): T[] => {
    const length = testDataUtils.randomNumber(min, max);
    return Array.from({ length }, generator);
  },
};`,
        dependencies: []
      }
    ];
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
/**
 * Comprehensive Tests for Continuous Learning Generator
 * Tests all aspects of the continuous learning system generation
 * Generated with Xaheen CLI - EPIC 10 Story 10.1 Implementation
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ContinuousLearningGenerator } from '../generators/ai/continuous-learning.generator';
import type { ContinuousLearningOptions } from '../generators/ai/types';

// Mock file system operations
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ContinuousLearningGenerator', () => {
  let generator: ContinuousLearningGenerator;
  let testOutputDir: string;
  let defaultOptions: ContinuousLearningOptions;

  beforeEach(() => {
    generator = new ContinuousLearningGenerator();
    testOutputDir = join(tmpdir(), 'continuous-learning-test');
    
    defaultOptions = {
      name: 'TestContinuousLearning',
      outputPath: testOutputDir,
      framework: 'express',
      database: 'postgresql',
      features: [
        'feedback-collection',
        'model-versioning',
        'performance-tracking',
        'automated-retraining',
      ],
      feedbackCollection: {
        methods: ['api', 'webhook'],
        authentication: 'jwt',
        validation: true,
        retention: {
          duration: 90,
          archiving: true,
          compression: false,
          partitioning: 'time',
        },
      },
      modelVersioning: {
        strategy: 'semantic',
        storage: 'local',
        rollbackSupport: true,
        healthChecks: true,
      },
      analytics: {
        dashboard: true,
        metrics: ['accuracy', 'acceptance-rate', 'response-time'],
        visualization: 'both',
        realTime: true,
      },
      reporting: {
        frequency: 'weekly',
        format: ['json', 'pdf'],
        trends: true,
        recommendations: true,
      },
    };

    // Reset mocks
    jest.clearAllMocks();
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Generator Initialization', () => {
    it('should create generator instance successfully', () => {
      expect(generator).toBeInstanceOf(ContinuousLearningGenerator);
    });

    it('should have required methods', () => {
      expect(typeof generator.generate).toBe('function');
    });
  });

  describe('Options Validation', () => {
    it('should validate required options successfully', async () => {
      await expect(generator.generate(defaultOptions)).resolves.not.toThrow();
    });

    it('should throw error for missing name', async () => {
      const invalidOptions = { ...defaultOptions, name: '' };
      await expect(generator.generate(invalidOptions)).rejects.toThrow(
        'Continuous learning system name is required'
      );
    });

    it('should throw error for missing output path', async () => {
      const invalidOptions = { ...defaultOptions, outputPath: '' };
      await expect(generator.generate(invalidOptions)).rejects.toThrow(
        'Output path is required'
      );
    });

    it('should throw error for empty features array', async () => {
      const invalidOptions = { ...defaultOptions, features: [] };
      await expect(generator.generate(invalidOptions)).rejects.toThrow(
        'At least one continuous learning feature must be specified'
      );
    });

    it('should validate A/B testing configuration', async () => {
      const invalidOptions = {
        ...defaultOptions,
        features: [...defaultOptions.features, 'a-b-testing'] as const,
        // Missing abTesting config
      };
      await expect(generator.generate(invalidOptions)).rejects.toThrow(
        'A/B testing feature requires abTesting configuration'
      );
    });

    it('should validate drift detection with analytics', async () => {
      const invalidOptions = {
        ...defaultOptions,
        features: [...defaultOptions.features, 'drift-detection'] as const,
        analytics: { ...defaultOptions.analytics, dashboard: false },
      };
      await expect(generator.generate(invalidOptions)).rejects.toThrow(
        'Drift detection requires analytics dashboard'
      );
    });
  });

  describe('Directory Structure Generation', () => {
    it('should create output directory', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(testOutputDir, { recursive: true });
    });

    it('should create feedback directory structure', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testOutputDir, 'src/feedback'),
        { recursive: true }
      );
    });

    it('should create versioning directory structure', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testOutputDir, 'src/versioning'),
        { recursive: true }
      );
    });

    it('should create analytics directory when dashboard enabled', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testOutputDir, 'src/analytics'),
        { recursive: true }
      );
    });

    it('should create database directory structure', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testOutputDir, 'src/database'),
        { recursive: true }
      );
    });

    it('should create reporting directory structure', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testOutputDir, 'src/reporting'),
        { recursive: true }
      );
    });
  });

  describe('File Generation', () => {
    it('should generate feedback API file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/feedback/feedback-api.ts'),
        expect.stringContaining('Feedback Collection API')
      );
    });

    it('should generate feedback controller file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/feedback/feedback.controller.ts'),
        expect.stringContaining('Feedback Controller')
      );
    });

    it('should generate webhook handler when webhook method included', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/feedback/webhook-handler.ts'),
        expect.stringContaining('webhook')
      );
    });

    it('should generate version manager file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/versioning/version-manager.ts'),
        expect.stringContaining('Model Version Manager')
      );
    });

    it('should generate rollback system when rollback support enabled', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/versioning/rollback-system.ts'),
        expect.stringContaining('rollback')
      );
    });

    it('should generate health check when health checks enabled', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/versioning/health-check.ts'),
        expect.stringContaining('health')
      );
    });

    it('should generate analytics dashboard when dashboard enabled', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/analytics/dashboard.ts'),
        expect.stringContaining('Analytics Dashboard')
      );
    });

    it('should generate database schemas', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/database/feedback.schema.ts'),
        expect.stringContaining('Feedback Database Schema')
      );
    });

    it('should generate configuration file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'continuous-learning.config.ts'),
        expect.stringContaining('Continuous Learning Configuration')
      );
    });

    it('should generate package.json', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'package.json'),
        expect.stringContaining('"name"')
      );
    });

    it('should generate environment file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, '.env.example'),
        expect.stringContaining('Environment Configuration')
      );
    });

    it('should generate docker-compose file', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'docker-compose.yml'),
        expect.stringContaining('version:')
      );
    });

    it('should generate documentation', async () => {
      await generator.generate(defaultOptions);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'docs/README.md'),
        expect.stringContaining('# TestContinuousLearning')
      );
    });
  });

  describe('Framework-Specific Generation', () => {
    it('should generate Express.js specific files', async () => {
      const expressOptions = { ...defaultOptions, framework: 'express' as const };
      await generator.generate(expressOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback-api\.ts$/),
        expect.stringContaining('Router')
      );
    });

    it('should generate NestJS specific files', async () => {
      const nestjsOptions = { ...defaultOptions, framework: 'nestjs' as const };
      await generator.generate(nestjsOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback\.controller\.ts$/),
        expect.stringContaining('@Controller')
      );
    });

    it('should generate Fastify specific files', async () => {
      const fastifyOptions = { ...defaultOptions, framework: 'fastify' as const };
      await generator.generate(fastifyOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback-api\.ts$/),
        expect.stringContaining('FastifyPluginAsync')
      );
    });

    it('should generate Next.js specific files', async () => {
      const nextjsOptions = { ...defaultOptions, framework: 'nextjs' as const };
      await generator.generate(nextjsOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/dashboard\.ts$/),
        expect.stringContaining('React')
      );
    });
  });

  describe('Database-Specific Generation', () => {
    it('should generate PostgreSQL schema', async () => {
      const postgresOptions = { ...defaultOptions, database: 'postgresql' as const };
      await generator.generate(postgresOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback\.schema\.ts$/),
        expect.stringContaining('CREATE TABLE')
      );
    });

    it('should generate MySQL schema', async () => {
      const mysqlOptions = { ...defaultOptions, database: 'mysql' as const };
      await generator.generate(mysqlOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback\.schema\.ts$/),
        expect.stringContaining('MySQL')
      );
    });

    it('should generate MongoDB schema', async () => {
      const mongoOptions = { ...defaultOptions, database: 'mongodb' as const };
      await generator.generate(mongoOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback\.schema\.ts$/),
        expect.stringContaining('MongoDB')
      );
    });

    it('should generate SQLite schema', async () => {
      const sqliteOptions = { ...defaultOptions, database: 'sqlite' as const };
      await generator.generate(sqliteOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback\.schema\.ts$/),
        expect.stringContaining('SQLite')
      );
    });
  });

  describe('Feature-Specific Generation', () => {
    it('should generate MLOps integration files when configured', async () => {
      const mlopsOptions = {
        ...defaultOptions,
        mlopsIntegration: {
          platforms: ['mlflow', 'wandb'] as const,
          experimentTracking: true,
          modelRegistry: true,
          artifactStorage: true,
        },
      };
      
      await generator.generate(mlopsOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/mlops/mlflow-integration.ts'),
        expect.stringContaining('MLflow')
      );
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/mlops/wandb-integration.ts'),
        expect.stringContaining('wandb')
      );
    });

    it('should generate A/B testing files when enabled', async () => {
      const abTestingOptions = {
        ...defaultOptions,
        features: [...defaultOptions.features, 'a-b-testing'] as const,
        abTesting: {
          enabled: true,
          splitStrategy: 'random' as const,
          trafficAllocation: 50,
          statisticalSignificance: 0.95,
          minimumSampleSize: 1000,
          duration: 14,
        },
      };
      
      await generator.generate(abTestingOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testOutputDir, 'src/ab-testing/experiment-manager.ts'),
        expect.stringContaining('Experiment Manager')
      );
    });

    it('should generate real-time updates when analytics real-time enabled', async () => {
      await generator.generate(defaultOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/realtime-updates\.ts$/),
        expect.stringContaining('real-time')
      );
    });

    it('should generate alerts system when alerts configured', async () => {
      const alertsOptions = {
        ...defaultOptions,
        analytics: {
          ...defaultOptions.analytics,
          alerts: {
            thresholds: { 'acceptance-rate': 0.6 },
            channels: ['email', 'slack'] as const,
          },
        },
      };
      
      await generator.generate(alertsOptions);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/alerts-system\.ts$/),
        expect.stringContaining('alerts')
      );
    });
  });

  describe('Configuration Generation', () => {
    it('should generate configuration with all options', async () => {
      await generator.generate(defaultOptions);
      
      const configCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('continuous-learning.config.ts')
      );
      
      expect(configCall).toBeDefined();
      expect(configCall?.[1]).toContain('"name": "TestContinuousLearning"');
      expect(configCall?.[1]).toContain('"framework": "express"');
      expect(configCall?.[1]).toContain('"database": "postgresql"');
    });

    it('should include MLOps configuration when specified', async () => {
      const mlopsOptions = {
        ...defaultOptions,
        mlopsIntegration: {
          platforms: ['mlflow'] as const,
          experimentTracking: true,
          modelRegistry: false,
          artifactStorage: true,
        },
      };
      
      await generator.generate(mlopsOptions);
      
      const configCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('continuous-learning.config.ts')
      );
      
      expect(configCall?.[1]).toContain('mlopsIntegration');
      expect(configCall?.[1]).toContain('"platforms": ["mlflow"]');
    });

    it('should include A/B testing configuration when enabled', async () => {
      const abTestingOptions = {
        ...defaultOptions,
        features: [...defaultOptions.features, 'a-b-testing'] as const,
        abTesting: {
          enabled: true,
          splitStrategy: 'user-based' as const,
          trafficAllocation: 25,
          statisticalSignificance: 0.99,
          minimumSampleSize: 2000,
          duration: 30,
        },
      };
      
      await generator.generate(abTestingOptions);
      
      const configCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('continuous-learning.config.ts')
      );
      
      expect(configCall?.[1]).toContain('abTesting');
      expect(configCall?.[1]).toContain('"enabled": true');
      expect(configCall?.[1]).toContain('"splitStrategy": "user-based"');
    });
  });

  describe('Package.json Generation', () => {
    it('should generate package.json with correct dependencies', async () => {
      await generator.generate(defaultOptions);
      
      const packageCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('package.json')
      );
      
      expect(packageCall).toBeDefined();
      const packageContent = JSON.parse(packageCall?.[1] as string);
      
      expect(packageContent.name).toBe('testcontinuouslearning');
      expect(packageContent.dependencies).toHaveProperty('express');
      expect(packageContent.dependencies).toHaveProperty('pg');
      expect(packageContent.scripts).toHaveProperty('build');
    });

    it('should include NestJS dependencies for NestJS framework', async () => {
      const nestjsOptions = { ...defaultOptions, framework: 'nestjs' as const };
      await generator.generate(nestjsOptions);
      
      const packageCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('package.json')
      );
      
      const packageContent = JSON.parse(packageCall?.[1] as string);
      expect(packageContent.dependencies).toHaveProperty('@nestjs/core');
      expect(packageContent.dependencies).toHaveProperty('@nestjs/swagger');
    });

    it('should include MLOps dependencies when configured', async () => {
      const mlopsOptions = {
        ...defaultOptions,
        mlopsIntegration: {
          platforms: ['wandb'] as const,
          experimentTracking: true,
          modelRegistry: false,
          artifactStorage: false,
        },
      };
      
      await generator.generate(mlopsOptions);
      
      const packageCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('package.json')
      );
      
      const packageContent = JSON.parse(packageCall?.[1] as string);
      expect(packageContent.dependencies).toHaveProperty('wandb');
    });
  });

  describe('Environment File Generation', () => {
    it('should generate environment file with database configuration', async () => {
      await generator.generate(defaultOptions);
      
      const envCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('.env.example')
      );
      
      expect(envCall).toBeDefined();
      expect(envCall?.[1]).toContain('DB_HOST=localhost');
      expect(envCall?.[1]).toContain('DB_PORT=5432');
      expect(envCall?.[1]).toContain('DATABASE_URL=postgresql');
    });

    it('should include JWT configuration for JWT authentication', async () => {
      await generator.generate(defaultOptions);
      
      const envCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('.env.example')
      );
      
      expect(envCall?.[1]).toContain('JWT_SECRET=');
      expect(envCall?.[1]).toContain('JWT_EXPIRES_IN=24h');
    });

    it('should include MLOps configuration when specified', async () => {
      const mlopsOptions = {
        ...defaultOptions,
        mlopsIntegration: {
          platforms: ['mlflow', 'wandb'] as const,
          experimentTracking: true,
          modelRegistry: true,
          artifactStorage: true,
        },
      };
      
      await generator.generate(mlopsOptions);
      
      const envCall = mockFs.writeFile.mock.calls.find(call =>
        call[0].toString().includes('.env.example')
      );
      
      expect(envCall?.[1]).toContain('MLFLOW_TRACKING_URI=');
      expect(envCall?.[1]).toContain('WANDB_API_KEY=');
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      await expect(generator.generate(defaultOptions)).rejects.toThrow(
        'Failed to create output directory'
      );
    });

    it('should handle write errors gracefully', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));
      
      await expect(generator.generate(defaultOptions)).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete system with all features', async () => {
      const fullOptions: ContinuousLearningOptions = {
        name: 'FullContinuousLearning',
        outputPath: testOutputDir,
        framework: 'nestjs',
        database: 'postgresql',
        features: [
          'feedback-collection',
          'model-versioning',
          'performance-tracking',
          'a-b-testing',
          'automated-retraining',
          'drift-detection',
          'bias-monitoring',
          'canary-deployment',
        ],
        feedbackCollection: {
          methods: ['api', 'webhook', 'events', 'batch'],
          authentication: 'jwt',
          validation: true,
          anonymization: true,
          rateLimiting: {
            requestsPerMinute: 100,
            strategy: 'sliding-window',
          },
          retention: {
            duration: 365,
            archiving: true,
            compression: true,
            partitioning: 'time',
          },
        },
        modelVersioning: {
          strategy: 'semantic',
          storage: 's3',
          rollbackSupport: true,
          autoPromotion: true,
          canaryDeployment: true,
          healthChecks: true,
        },
        analytics: {
          dashboard: true,
          metrics: ['accuracy', 'precision', 'recall', 'f1-score', 'acceptance-rate', 'response-time'],
          visualization: 'both',
          realTime: true,
          alerts: {
            thresholds: {
              'acceptance-rate': 0.7,
              'response-time': 1000,
            },
            channels: ['email', 'slack', 'webhook'],
            escalation: true,
          },
          export: {
            formats: ['csv', 'json'],
            schedule: 'weekly',
            destination: 's3',
          },
        },
        mlopsIntegration: {
          platforms: ['mlflow', 'wandb', 'neptune'],
          experimentTracking: true,
          modelRegistry: true,
          artifactStorage: true,
          hyperparameterTuning: true,
        },
        abTesting: {
          enabled: true,
          splitStrategy: 'user-based',
          trafficAllocation: 30,
          statisticalSignificance: 0.95,
          minimumSampleSize: 5000,
          duration: 21,
        },
        reporting: {
          frequency: 'daily',
          format: ['json', 'pdf', 'html'],
          recipients: ['admin@example.com'],
          customMetrics: ['business-impact', 'user-engagement'],
          trends: true,
          recommendations: true,
        },
      };

      await expect(generator.generate(fullOptions)).resolves.not.toThrow();
      
      // Verify comprehensive file generation
      expect(mockFs.writeFile).toHaveBeenCalled();
      
      // Should have generated files for all major components
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/feedback-api\.ts$/),
        expect.anything()
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/version-manager\.ts$/),
        expect.anything()
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/dashboard\.ts$/),
        expect.anything()
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/experiment-manager\.ts$/),
        expect.anything()
      );
    });
  });
});

/**
 * CLI Integration Tests
 * Test the continuous learning generator through CLI interface
 */
describe('CLI Integration', () => {
  let mockProcess: any;

  beforeEach(() => {
    mockProcess = {
      argv: ['node', 'xaheen'],
      exit: jest.fn(),
      stdout: { write: jest.fn() },
      stderr: { write: jest.fn() },
    };
    global.process = mockProcess;
  });

  it('should generate continuous learning system via CLI', async () => {
    // This would test the actual CLI command integration
    // xaheen generate continuous-learning MyLearningSystem --framework=nestjs
    
    const cliArgs = [
      'generate',
      'continuous-learning',
      'MyLearningSystem',
      '--framework=nestjs',
      '--database=postgresql',
      '--features=feedback-collection,model-versioning,analytics',
      '--output=./test-output'
    ];

    // Mock CLI execution
    // In a real implementation, this would invoke the CLI with these arguments
    expect(cliArgs).toContain('continuous-learning');
    expect(cliArgs).toContain('MyLearningSystem');
  });

  it('should handle CLI validation errors', async () => {
    const invalidArgs = [
      'generate',
      'continuous-learning',
      '', // Empty name
      '--framework=nestjs'
    ];

    // Should handle validation gracefully
    expect(invalidArgs[2]).toBe('');
  });
});

/**
 * Generator Templates Tests
 * Test the template rendering and content generation
 */
describe('Template Rendering', () => {
  let generator: ContinuousLearningGenerator;

  beforeEach(() => {
    generator = new ContinuousLearningGenerator();
  });

  it('should render feedback API template correctly', async () => {
    const options: ContinuousLearningOptions = {
      name: 'TestSystem',
      outputPath: '/test',
      framework: 'express',
      database: 'postgresql',
      features: ['feedback-collection'],
      feedbackCollection: {
        methods: ['api'],
        authentication: 'jwt',
        validation: true,
        retention: { duration: 90, archiving: false }
      },
      modelVersioning: {
        strategy: 'semantic',
        storage: 'local',
        rollbackSupport: true,
        healthChecks: true
      },
      analytics: {
        dashboard: true,
        metrics: ['accuracy'],
        visualization: 'charts',
        realTime: false
      },
      reporting: {
        frequency: 'weekly',
        format: ['json'],
        trends: true,
        recommendations: true
      }
    };
    
    const template = (generator as any).getFeedbackAPITemplate(options);
    
    expect(template).toContain('Feedback Collection API');
    expect(template).toContain('Router');
    expect(template).toContain(options.feedbackCollection.authentication);
  });

  it('should render version manager template correctly', async () => {
    const options: ContinuousLearningOptions = {
      name: 'TestSystem',
      outputPath: '/test',
      framework: 'express',
      database: 'postgresql',
      features: ['model-versioning'],
      feedbackCollection: {
        methods: ['api'],
        authentication: 'jwt',
        validation: true,
        retention: { duration: 90, archiving: false }
      },
      modelVersioning: {
        strategy: 'semantic',
        storage: 'local',
        rollbackSupport: true,
        healthChecks: true
      },
      analytics: {
        dashboard: true,
        metrics: ['accuracy'],
        visualization: 'charts',
        realTime: false
      },
      reporting: {
        frequency: 'weekly',
        format: ['json'],
        trends: true,
        recommendations: true
      }
    };
    
    const template = (generator as any).getVersionManagerTemplate(options);
    
    expect(template).toContain('Model Version Manager');
    expect(template).toContain(options.modelVersioning.strategy);
    expect(template).toContain(options.modelVersioning.storage);
  });

  it('should conditionally render features', async () => {
    const optionsWithMLOps: ContinuousLearningOptions = {
      name: 'TestSystem',
      outputPath: '/test',
      framework: 'express',
      database: 'postgresql',
      features: ['feedback-collection'],
      feedbackCollection: {
        methods: ['api'],
        authentication: 'jwt',
        validation: true,
        retention: { duration: 90, archiving: false }
      },
      modelVersioning: {
        strategy: 'semantic',
        storage: 'local',
        rollbackSupport: true,
        healthChecks: true
      },
      analytics: {
        dashboard: true,
        metrics: ['accuracy'],
        visualization: 'charts',
        realTime: false
      },
      reporting: {
        frequency: 'weekly',
        format: ['json'],
        trends: true,
        recommendations: true
      },
      mlopsIntegration: {
        platforms: ['mlflow'] as const,
        experimentTracking: true,
        modelRegistry: false,
        artifactStorage: true,
      },
    };

    const template = (generator as any).getConfigurationTemplate(optionsWithMLOps);
    expect(template).toContain('mlopsIntegration');
    expect(template).toContain('mlflow');
  });
});

export { ContinuousLearningGenerator };
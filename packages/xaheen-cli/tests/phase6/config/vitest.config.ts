import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'phase6-services-integrations',
    root: path.resolve(__dirname, '..'),
    
    // Test environment configuration
    environment: 'node',
    globals: true,
    
    // Timeout configuration
    testTimeout: 300000, // 5 minutes for integration tests
    hookTimeout: 60000,  // 1 minute for setup/teardown
    
    // File patterns
    include: [
      'integration/**/*.test.ts',
      'pact/**/*.test.ts',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.d.ts',
    ],
    
    // Setup files
    setupFiles: [
      './utils/test-setup.ts',
    ],
    globalSetup: [
      './utils/global-setup.ts',
    ],
    globalTeardown: [
      './utils/global-teardown.ts',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'integration/**/*.ts',
        'utils/**/*.ts',
        '../../src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mocks/**',
        '**/fixtures/**',
        'coverage/**',
        'dist/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Reporters
    reporters: [
      'default',
      'junit',
      'json',
    ],
    outputFile: {
      junit: './test-results/junit.xml',
      json: './test-results/results.json',
    },
    
    // Pool configuration for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: parseInt(process.env.MAX_TEST_WORKERS || '4'),
        minThreads: 1,
        useAtomics: true,
      },
    },
    
    // Retry configuration
    retry: 2,
    
    // Watch configuration (disabled for CI)
    watch: false,
    
    // Sequence configuration
    sequence: {
      concurrent: true,
      shuffle: false,
      hooks: 'stack',
    },
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
      '@tests': path.resolve(__dirname, '..'),
      '@fixtures': path.resolve(__dirname, '../fixtures'),
      '@mocks': path.resolve(__dirname, '../mocks'),
      '@utils': path.resolve(__dirname, '../utils'),
    },
  },
  
  // Define configuration
  define: {
    __TEST_ENV__: JSON.stringify('phase6'),
    __PHASE__: JSON.stringify('6'),
  },
  
  // Environment variables for tests
  envPrefix: [
    'VITE_',
    'XAHEEN_',
    'NODE_ENV',
    'CI',
    
    // Authentication services
    'GOOGLE_',
    'GITHUB_',
    'APPLE_',
    'FIREBASE_',
    'SUPABASE_',
    'BANKID_',
    'JWT_',
    
    // Payment services
    'STRIPE_',
    'PAYPAL_',
    'SQUARE_',
    'ADYEN_',
    
    // Communication services
    'SLACK_',
    'TWILIO_',
    'DISCORD_',
    'TEAMS_',
    'SENDGRID_',
    'MAILGUN_',
    'POSTMARK_',
    'AWS_',
    
    // Document services
    'DIGIPOST_',
    'DOCUSIGN_',
    'ADOBE_SIGN_',
    'ALTINN_',
    
    // Queue services
    'RABBITMQ_',
    'KAFKA_',
    'REDIS_',
    
    // Database services
    'POSTGRES_',
    'MYSQL_',
    'MONGODB_',
    'ELASTICSEARCH_',
    'SQLITE_',
    
    // Analytics services
    'GA4_',
    'MIXPANEL_',
    'AMPLITUDE_',
    'SEGMENT_',
    'SENTRY_',
    'DATADOG_',
    'NEW_RELIC_',
    'PROMETHEUS_',
    
    // Infrastructure services
    'DOCKER_',
    'K8S_',
    'KUBECONFIG',
    'TERRAFORM_',
    'GITLAB_',
    'AZURE_',
    
    // Test configuration
    'SKIP_CLEANUP',
    'RETAIN_LOGS',
    'PARALLEL_TESTS',
    'MAX_TEST_WORKERS',
    'DEBUG',
  ],
});
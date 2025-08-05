/**
 * Pact Configuration for Phase 6 Services & Integrations Testing
 * 
 * Configures Pact contract testing for HTTP-based service integrations.
 * This ensures API compatibility between our generated code and third-party services.
 */

import { LogLevel } from '@pact-foundation/pact';
import path from 'path';

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'http://localhost:9292';
const PACT_BROKER_TOKEN = process.env.PACT_BROKER_TOKEN;
const PACT_PROVIDER_VERSION = process.env.PACT_PROVIDER_VERSION || '1.0.0';
const PACT_CONSUMER_VERSION = process.env.PACT_CONSUMER_VERSION || '1.0.0';

export const pactConfig = {
  // Global Pact configuration
  logLevel: (process.env.PACT_LOG_LEVEL as LogLevel) || LogLevel.INFO,
  
  // Directory for contract files
  contractsDir: path.resolve(__dirname, '../pact/contracts'),
  
  // Directory for logs
  logDir: path.resolve(__dirname, '../pact/logs'),
  
  // Pact Broker configuration
  broker: {
    url: PACT_BROKER_URL,
    token: PACT_BROKER_TOKEN,
    publishVerificationResult: process.env.CI === 'true',
    enablePending: true,
    includeWipPactsSince: new Date().toISOString().split('T')[0], // Today's date
  },
  
  // Consumer configurations
  consumers: {
    // Authentication service consumers
    'xaheen-auth-oauth2': {
      name: 'xaheen-auth-oauth2',
      version: PACT_CONSUMER_VERSION,
      providers: ['google-oauth2', 'github-oauth2', 'apple-oauth2'],
    },
    
    'xaheen-auth-firebase': {
      name: 'xaheen-auth-firebase',
      version: PACT_CONSUMER_VERSION,
      providers: ['firebase-auth'],
    },
    
    'xaheen-auth-supabase': {
      name: 'xaheen-auth-supabase',
      version: PACT_CONSUMER_VERSION,
      providers: ['supabase-auth'],
    },
    
    // Payment service consumers
    'xaheen-payments-stripe': {
      name: 'xaheen-payments-stripe',
      version: PACT_CONSUMER_VERSION,
      providers: ['stripe-api'],
    },
    
    'xaheen-payments-paypal': {
      name: 'xaheen-payments-paypal',
      version: PACT_CONSUMER_VERSION,
      providers: ['paypal-api'],
    },
    
    'xaheen-payments-square': {
      name: 'xaheen-payments-square',
      version: PACT_CONSUMER_VERSION,
      providers: ['square-api'],
    },
    
    'xaheen-payments-adyen': {
      name: 'xaheen-payments-adyen',
      version: PACT_CONSUMER_VERSION,
      providers: ['adyen-api'],
    },
    
    // Communication service consumers
    'xaheen-communications-slack': {
      name: 'xaheen-communications-slack',
      version: PACT_CONSUMER_VERSION,
      providers: ['slack-api'],
    },
    
    'xaheen-communications-twilio': {
      name: 'xaheen-communications-twilio',
      version: PACT_CONSUMER_VERSION,
      providers: ['twilio-api'],
    },
    
    'xaheen-communications-discord': {
      name: 'xaheen-communications-discord',
      version: PACT_CONSUMER_VERSION,
      providers: ['discord-api'],
    },
    
    'xaheen-communications-email': {
      name: 'xaheen-communications-email',
      version: PACT_CONSUMER_VERSION,
      providers: ['sendgrid-api', 'mailgun-api', 'postmark-api'],
    },
    
    // Document service consumers
    'xaheen-documents-docusign': {
      name: 'xaheen-documents-docusign',
      version: PACT_CONSUMER_VERSION,
      providers: ['docusign-api'],
    },
    
    'xaheen-documents-adobe-sign': {
      name: 'xaheen-documents-adobe-sign',
      version: PACT_CONSUMER_VERSION,
      providers: ['adobe-sign-api'],
    },
    
    'xaheen-documents-altinn': {
      name: 'xaheen-documents-altinn',
      version: PACT_CONSUMER_VERSION,
      providers: ['altinn-api'],
    },
    
    // Analytics service consumers
    'xaheen-analytics-ga4': {
      name: 'xaheen-analytics-ga4',
      version: PACT_CONSUMER_VERSION,
      providers: ['google-analytics-4'],
    },
    
    'xaheen-analytics-mixpanel': {
      name: 'xaheen-analytics-mixpanel',
      version: PACT_CONSUMER_VERSION,
      providers: ['mixpanel-api'],
    },
    
    'xaheen-analytics-amplitude': {
      name: 'xaheen-analytics-amplitude',
      version: PACT_CONSUMER_VERSION,
      providers: ['amplitude-api'],
    },
    
    'xaheen-analytics-segment': {
      name: 'xaheen-analytics-segment',
      version: PACT_CONSUMER_VERSION,
      providers: ['segment-api'],
    },
    
    'xaheen-analytics-sentry': {
      name: 'xaheen-analytics-sentry',
      version: PACT_CONSUMER_VERSION,
      providers: ['sentry-api'],
    },
  },
  
  // Provider configurations
  providers: {
    // Authentication providers
    'google-oauth2': {
      name: 'google-oauth2',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://oauth2.googleapis.com',
      stateHandlers: {
        'user is authenticated': {
          setup: () => Promise.resolve('Mock authenticated user state'),
          teardown: () => Promise.resolve('Cleanup authentication state'),
        },
        'user token is valid': {
          setup: () => Promise.resolve('Mock valid token state'),
          teardown: () => Promise.resolve('Cleanup token state'),
        },
      },
    },
    
    'github-oauth2': {
      name: 'github-oauth2',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://github.com/login/oauth',
      stateHandlers: {
        'user is authenticated': {
          setup: () => Promise.resolve('Mock GitHub authentication'),
          teardown: () => Promise.resolve('Cleanup GitHub state'),
        },
      },
    },
    
    'firebase-auth': {
      name: 'firebase-auth',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://identitytoolkit.googleapis.com',
      stateHandlers: {
        'user exists': {
          setup: () => Promise.resolve('Mock Firebase user'),
          teardown: () => Promise.resolve('Cleanup Firebase user'),
        },
      },
    },
    
    'supabase-auth': {
      name: 'supabase-auth',
      version: PACT_PROVIDER_VERSION,
      baseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
      stateHandlers: {
        'user is registered': {
          setup: () => Promise.resolve('Mock Supabase user'),
          teardown: () => Promise.resolve('Cleanup Supabase user'),
        },
      },
    },
    
    // Payment providers
    'stripe-api': {
      name: 'stripe-api',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://api.stripe.com',
      stateHandlers: {
        'customer exists': {
          setup: () => Promise.resolve('Mock Stripe customer'),
          teardown: () => Promise.resolve('Cleanup Stripe customer'),
        },
        'payment method is valid': {
          setup: () => Promise.resolve('Mock payment method'),
          teardown: () => Promise.resolve('Cleanup payment method'),
        },
      },
    },
    
    'paypal-api': {
      name: 'paypal-api',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://api.sandbox.paypal.com',
      stateHandlers: {
        'merchant account is active': {
          setup: () => Promise.resolve('Mock PayPal merchant'),
          teardown: () => Promise.resolve('Cleanup PayPal merchant'),
        },
      },
    },
    
    // Communication providers
    'slack-api': {
      name: 'slack-api',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://slack.com/api',
      stateHandlers: {
        'bot is installed': {
          setup: () => Promise.resolve('Mock Slack bot installation'),
          teardown: () => Promise.resolve('Cleanup Slack bot'),
        },
        'channel exists': {
          setup: () => Promise.resolve('Mock Slack channel'),
          teardown: () => Promise.resolve('Cleanup Slack channel'),
        },
      },
    },
    
    'twilio-api': {
      name: 'twilio-api',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://api.twilio.com',
      stateHandlers: {
        'account is active': {
          setup: () => Promise.resolve('Mock Twilio account'),
          teardown: () => Promise.resolve('Cleanup Twilio account'),
        },
        'phone number is verified': {
          setup: () => Promise.resolve('Mock verified phone number'),
          teardown: () => Promise.resolve('Cleanup phone number'),
        },
      },
    },
    
    // Email providers
    'sendgrid-api': {
      name: 'sendgrid-api',
      version: PACT_PROVIDER_VERSION,
      baseUrl: 'https://api.sendgrid.com',
      stateHandlers: {
        'sender is verified': {
          setup: () => Promise.resolve('Mock verified sender'),
          teardown: () => Promise.resolve('Cleanup sender'),
        },
      },
    },
  },
  
  // Test configuration
  test: {
    timeout: 30000,
    port: 1234, // Mock provider port
    
    // Request/Response matching rules
    matchingRules: {
      body: {
        '$.id': {
          matchers: [{ match: 'type' }],
        },
        '$.timestamp': {
          matchers: [{ match: 'regex', regex: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}' }],
        },
        '$.email': {
          matchers: [{ match: 'regex', regex: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$' }],
        },
        '$.phone': {
          matchers: [{ match: 'regex', regex: '^\\+[1-9]\\d{1,14}$' }],
        },
        '$.url': {
          matchers: [{ match: 'regex', regex: '^https?://[\\w.-]+(?:/[\\w.-]*)*$' }],
        },
      },
      headers: {
        'Content-Type': {
          matchers: [{ match: 'regex', regex: '^application/(json|x-www-form-urlencoded)' }],
        },
        'Authorization': {
          matchers: [{ match: 'regex', regex: '^(Bearer|Basic)\\s+.+' }],
        },
      },
    },
    
    // Mock data generators
    generators: {
      body: {
        '$.id': { type: 'RandomString', size: 10 },
        '$.timestamp': { type: 'DateTime', format: 'yyyy-MM-dd\'T\'HH:mm:ss' },
        '$.email': { type: 'RandomString', size: 10, suffix: '@example.com' },
        '$.phone': { type: 'RandomString', size: 10, prefix: '+47' },
      },
    },
  },
  
  // Publishing configuration
  publish: {
    consumerVersion: PACT_CONSUMER_VERSION,
    providerVersion: PACT_PROVIDER_VERSION,
    tags: [
      process.env.BRANCH_NAME || 'main',
      process.env.NODE_ENV || 'test',
    ],
    buildUrl: process.env.BUILD_URL,
  },
  
  // Verification configuration
  verification: {
    timeout: 60000,
    publishResults: process.env.CI === 'true',
    providerBaseUrl: 'http://localhost:3000',
    enablePending: true,
    
    // State change handlers
    stateChangeUrl: 'http://localhost:3000/pact/provider-states',
    stateChangeSetupUrl: 'http://localhost:3000/pact/provider-states/setup',
    stateChangeTeardownUrl: 'http://localhost:3000/pact/provider-states/teardown',
    
    // Custom headers for verification
    customProviderHeaders: [
      'X-Pact-Test: true',
      'X-Test-Environment: phase6',
    ],
  },
} as const;

// Consumer-specific configurations
export const consumerConfigs = {
  // OAuth2 consumer configuration
  oauth2Consumer: {
    consumer: 'xaheen-auth-oauth2',
    provider: 'google-oauth2',
    port: 1234,
    log: path.resolve(__dirname, '../pact/logs/oauth2-consumer.log'),
    dir: path.resolve(__dirname, '../pact/contracts'),
    logLevel: LogLevel.INFO,
    spec: 2,
  },
  
  // Payment consumer configurations
  stripeConsumer: {
    consumer: 'xaheen-payments-stripe',
    provider: 'stripe-api',
    port: 1235,
    log: path.resolve(__dirname, '../pact/logs/stripe-consumer.log'),
    dir: path.resolve(__dirname, '../pact/contracts'),
    logLevel: LogLevel.INFO,
    spec: 2,
  },
  
  // Communication consumer configurations
  slackConsumer: {
    consumer: 'xaheen-communications-slack',
    provider: 'slack-api',
    port: 1236,
    log: path.resolve(__dirname, '../pact/logs/slack-consumer.log'),
    dir: path.resolve(__dirname, '../pact/contracts'),
    logLevel: LogLevel.INFO,
    spec: 2,
  },
  
  // Analytics consumer configurations
  analyticsConsumer: {
    consumer: 'xaheen-analytics-mixpanel',
    provider: 'mixpanel-api',
    port: 1237,
    log: path.resolve(__dirname, '../pact/logs/analytics-consumer.log'),
    dir: path.resolve(__dirname, '../pact/contracts'),
    logLevel: LogLevel.INFO,
    spec: 2,
  },
} as const;

// Provider verification configurations
export const providerConfigs = {
  // OAuth2 provider verification
  oauth2Provider: {
    providerBaseUrl: 'https://oauth2.googleapis.com',
    provider: 'google-oauth2',
    consumerVersionSelectors: [
      { tag: 'main', latest: true },
      { tag: 'test', latest: true },
    ],
    enablePending: true,
    timeout: 30000,
  },
  
  // Stripe provider verification
  stripeProvider: {
    providerBaseUrl: 'https://api.stripe.com',
    provider: 'stripe-api',
    consumerVersionSelectors: [
      { tag: 'main', latest: true },
      { tag: 'test', latest: true },
    ],
    enablePending: true,
    timeout: 30000,
  },
} as const;

export default pactConfig;
/**
 * Phase 6: Services & Integrations Testing Configuration
 * 
 * Centralized configuration for all service integration tests including
 * sandbox environments, mock servers, and test credentials management.
 */

export interface ServiceTestConfig {
  readonly name: string;
  readonly enabled: boolean;
  readonly timeout: number;
  readonly retries: number;
  readonly baseUrl?: string;
  readonly credentials?: Record<string, string>;
  readonly mockConfig?: MockConfig;
}

export interface MockConfig {
  readonly enabled: boolean;
  readonly port: number;
  readonly responses: string;
  readonly latency?: number;
}

export interface DatabaseTestConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly ssl?: boolean;
  readonly poolSize?: number;
}

export interface QueueTestConfig {
  readonly brokerUrl: string;
  readonly exchange?: string;
  readonly queue?: string;
  readonly credentials?: {
    readonly username: string;
    readonly password: string;
  };
}

// Authentication Services Configuration
export const authServicesConfig: Record<string, ServiceTestConfig> = {
  bankid: {
    name: 'BankID',
    enabled: process.env.BANKID_TEST_MODE === 'true',
    timeout: 30000,
    retries: 2,
    baseUrl: 'https://oidc-ver2.difi.no/idporten-oidc-provider/',
    credentials: {
      clientId: process.env.BANKID_TEST_CLIENT_ID || 'test_client',
      clientSecret: process.env.BANKID_TEST_CLIENT_SECRET || 'test_secret',
    },
  },
  oauth2Google: {
    name: 'Google OAuth2',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://accounts.google.com',
    credentials: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'test_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test_google_secret',
    },
  },
  oauth2GitHub: {
    name: 'GitHub OAuth2',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://github.com/login/oauth',
    credentials: {
      clientId: process.env.GITHUB_CLIENT_ID || 'test_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'test_github_secret',
    },
  },
  oauth2Apple: {
    name: 'Apple OAuth2',
    enabled: process.env.APPLE_CLIENT_ID !== undefined,
    timeout: 20000,
    retries: 2,
    baseUrl: 'https://appleid.apple.com',
    credentials: {
      clientId: process.env.APPLE_CLIENT_ID || 'test_apple_client_id',
      teamId: process.env.APPLE_TEAM_ID || 'test_team_id',
      keyId: process.env.APPLE_KEY_ID || 'test_key_id',
      privateKey: process.env.APPLE_PRIVATE_KEY || 'test_private_key',
    },
  },
  jwt: {
    name: 'JWT Authentication',
    enabled: true,
    timeout: 5000,
    retries: 1,
    credentials: {
      secret: process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
      issuer: process.env.JWT_ISSUER || 'xaheen-test',
      audience: process.env.JWT_AUDIENCE || 'xaheen-test-users',
    },
  },
  firebaseAuth: {
    name: 'Firebase Auth',
    enabled: process.env.FIREBASE_API_KEY !== undefined,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://identitytoolkit.googleapis.com',
    credentials: {
      apiKey: process.env.FIREBASE_API_KEY || 'test_firebase_api_key',
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project-id',
    },
  },
  supabaseAuth: {
    name: 'Supabase Auth',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
    credentials: {
      anonKey: process.env.SUPABASE_ANON_KEY || 'test_supabase_anon_key',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_service_role_key',
    },
  },
};

// Payment Services Configuration
export const paymentServicesConfig: Record<string, ServiceTestConfig> = {
  stripe: {
    name: 'Stripe',
    enabled: true,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://api.stripe.com',
    credentials: {
      secretKey: process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_fake_key_for_testing',
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_fake_key_for_testing',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret',
    },
  },
  paypal: {
    name: 'PayPal',
    enabled: true,
    timeout: 25000,
    retries: 2,
    baseUrl: 'https://api.sandbox.paypal.com',
    credentials: {
      clientId: process.env.PAYPAL_CLIENT_ID || 'test_paypal_client_id',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'test_paypal_client_secret',
    },
  },
  square: {
    name: 'Square',
    enabled: process.env.SQUARE_SANDBOX_APPLICATION_ID !== undefined,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://connect.squareupsandbox.com',
    credentials: {
      applicationId: process.env.SQUARE_SANDBOX_APPLICATION_ID || 'test_square_app_id',
      accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN || 'test_square_access_token',
    },
  },
  adyen: {
    name: 'Adyen',
    enabled: process.env.ADYEN_API_KEY !== undefined,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://checkout-test.adyen.com',
    credentials: {
      apiKey: process.env.ADYEN_API_KEY || 'test_adyen_api_key',
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT || 'test_merchant_account',
    },
  },
};

// Communication Services Configuration
export const communicationServicesConfig: Record<string, ServiceTestConfig> = {
  slack: {
    name: 'Slack',
    enabled: process.env.SLACK_BOT_TOKEN !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://slack.com/api',
    credentials: {
      botToken: process.env.SLACK_BOT_TOKEN || 'xoxb-test-token',
      signingSecret: process.env.SLACK_SIGNING_SECRET || 'test-signing-secret',
    },
  },
  twilio: {
    name: 'Twilio',
    enabled: true,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://api.twilio.com',
    credentials: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'ACtest_account_sid',
      authToken: process.env.TWILIO_AUTH_TOKEN || 'test_auth_token',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+15005550006', // Twilio test number
    },
  },
  discord: {
    name: 'Discord',
    enabled: process.env.DISCORD_BOT_TOKEN !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://discord.com/api',
    credentials: {
      botToken: process.env.DISCORD_BOT_TOKEN || 'test_discord_bot_token',
      clientId: process.env.DISCORD_CLIENT_ID || 'test_discord_client_id',
    },
  },
  teams: {
    name: 'Microsoft Teams',
    enabled: process.env.TEAMS_APP_ID !== undefined,
    timeout: 20000,
    retries: 2,
    baseUrl: 'https://smba.trafficmanager.net/apis',
    credentials: {
      appId: process.env.TEAMS_APP_ID || 'test_teams_app_id',
      appPassword: process.env.TEAMS_APP_PASSWORD || 'test_teams_app_password',
    },
  },
  sendgrid: {
    name: 'SendGrid',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.sendgrid.com',
    credentials: {
      apiKey: process.env.SENDGRID_API_KEY || 'SG.test_sendgrid_api_key',
    },
  },
  mailgun: {
    name: 'Mailgun',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.mailgun.net',
    credentials: {
      apiKey: process.env.MAILGUN_API_KEY || 'test_mailgun_api_key',
      domain: process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org',
    },
  },
  ses: {
    name: 'Amazon SES',
    enabled: process.env.AWS_ACCESS_KEY_ID !== undefined,
    timeout: 20000,
    retries: 3,
    baseUrl: 'https://email.us-east-1.amazonaws.com',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test_access_key_id',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test_secret_access_key',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },
  postmark: {
    name: 'Postmark',
    enabled: process.env.POSTMARK_API_TOKEN !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.postmarkapp.com',
    credentials: {
      apiToken: process.env.POSTMARK_API_TOKEN || 'test_postmark_api_token',
    },
  },
};

// Document Services Configuration
export const documentServicesConfig: Record<string, ServiceTestConfig> = {
  digipost: {
    name: 'Digipost',
    enabled: process.env.DIGIPOST_CLIENT_ID !== undefined,
    timeout: 30000,
    retries: 2,
    baseUrl: 'https://api.digipost.no',
    credentials: {
      clientId: process.env.DIGIPOST_CLIENT_ID || 'test_digipost_client_id',
      clientSecret: process.env.DIGIPOST_CLIENT_SECRET || 'test_digipost_client_secret',
    },
  },
  docusign: {
    name: 'DocuSign',
    enabled: process.env.DOCUSIGN_INTEGRATION_KEY !== undefined,
    timeout: 25000,
    retries: 3,
    baseUrl: 'https://demo.docusign.net',
    credentials: {
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || 'test_integration_key',
      userId: process.env.DOCUSIGN_USER_ID || 'test_user_id',
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || 'test_private_key',
    },
  },
  adobeSign: {
    name: 'Adobe Sign',
    enabled: process.env.ADOBE_SIGN_CLIENT_ID !== undefined,
    timeout: 25000,
    retries: 3,
    baseUrl: 'https://api.na1.adobesign.com',
    credentials: {
      clientId: process.env.ADOBE_SIGN_CLIENT_ID || 'test_adobe_client_id',
      clientSecret: process.env.ADOBE_SIGN_CLIENT_SECRET || 'test_adobe_client_secret',
    },
  },
  altinn: {
    name: 'Altinn',
    enabled: process.env.ALTINN_API_KEY !== undefined,
    timeout: 30000,
    retries: 2,
    baseUrl: 'https://tt02.altinn.no',
    credentials: {
      apiKey: process.env.ALTINN_API_KEY || 'test_altinn_api_key',
      subscriptionKey: process.env.ALTINN_SUBSCRIPTION_KEY || 'test_subscription_key',
    },
  },
};

// Queue Services Configuration
export const queueServicesConfig: Record<string, QueueTestConfig> = {
  rabbitmq: {
    brokerUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: 'test_exchange',
    queue: 'test_queue',
    credentials: {
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASS || 'guest',
    },
  },
  kafka: {
    brokerUrl: process.env.KAFKA_BROKERS || 'localhost:9092',
  },
  redisPubSub: {
    brokerUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

// Database Services Configuration
export const databaseServicesConfig: Record<string, DatabaseTestConfig> = {
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'xaheen_test',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    ssl: process.env.POSTGRES_SSL === 'true',
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'xaheen_test',
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
  },
  sqlite: {
    host: '',
    port: 0,
    database: process.env.SQLITE_DB || ':memory:',
    username: '',
    password: '',
  },
  mongodb: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: parseInt(process.env.MONGODB_PORT || '27017'),
    database: process.env.MONGODB_DATABASE || 'xaheen_test',
    username: process.env.MONGODB_USER || '',
    password: process.env.MONGODB_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    database: process.env.REDIS_DB || '0',
    username: process.env.REDIS_USER || '',
    password: process.env.REDIS_PASSWORD || '',
  },
  elasticsearch: {
    host: process.env.ELASTICSEARCH_HOST || 'localhost',
    port: parseInt(process.env.ELASTICSEARCH_PORT || '9200'),
    database: 'xaheen_test',
    username: process.env.ELASTICSEARCH_USER || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
};

// Analytics Services Configuration
export const analyticsServicesConfig: Record<string, ServiceTestConfig> = {
  googleAnalytics4: {
    name: 'Google Analytics 4',
    enabled: process.env.GA4_MEASUREMENT_ID !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://www.google-analytics.com',
    credentials: {
      measurementId: process.env.GA4_MEASUREMENT_ID || 'G-TEST123456',
      apiSecret: process.env.GA4_API_SECRET || 'test_api_secret',
    },
  },
  mixpanel: {
    name: 'Mixpanel',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.mixpanel.com',
    credentials: {
      token: process.env.MIXPANEL_TOKEN || 'test_mixpanel_token',
      secret: process.env.MIXPANEL_SECRET || 'test_mixpanel_secret',
    },
  },
  amplitude: {
    name: 'Amplitude',
    enabled: process.env.AMPLITUDE_API_KEY !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api2.amplitude.com',
    credentials: {
      apiKey: process.env.AMPLITUDE_API_KEY || 'test_amplitude_api_key',
      secretKey: process.env.AMPLITUDE_SECRET_KEY || 'test_amplitude_secret_key',
    },
  },
  segment: {
    name: 'Segment',
    enabled: process.env.SEGMENT_WRITE_KEY !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.segment.io',
    credentials: {
      writeKey: process.env.SEGMENT_WRITE_KEY || 'test_segment_write_key',
    },
  },
  sentry: {
    name: 'Sentry',
    enabled: true,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://sentry.io',
    credentials: {
      dsn: process.env.SENTRY_DSN || 'https://test@sentry.io/test',
      authToken: process.env.SENTRY_AUTH_TOKEN || 'test_sentry_auth_token',
    },
  },
  datadog: {
    name: 'DataDog',
    enabled: process.env.DATADOG_API_KEY !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.datadoghq.com',
    credentials: {
      apiKey: process.env.DATADOG_API_KEY || 'test_datadog_api_key',
      appKey: process.env.DATADOG_APP_KEY || 'test_datadog_app_key',
    },
  },
  newRelic: {
    name: 'New Relic',
    enabled: process.env.NEW_RELIC_LICENSE_KEY !== undefined,
    timeout: 15000,
    retries: 3,
    baseUrl: 'https://api.newrelic.com',
    credentials: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY || 'test_newrelic_license_key',
      apiKey: process.env.NEW_RELIC_API_KEY || 'test_newrelic_api_key',
    },
  },
  prometheus: {
    name: 'Prometheus',
    enabled: true,
    timeout: 10000,
    retries: 2,
    baseUrl: process.env.PROMETHEUS_URL || 'http://localhost:9090',
  },
};

// Infrastructure Services Configuration
export const infrastructureServicesConfig: Record<string, ServiceTestConfig> = {
  dockerCompose: {
    name: 'Docker Compose',
    enabled: true,
    timeout: 60000,
    retries: 1,
  },
  kubernetes: {
    name: 'Kubernetes',
    enabled: process.env.KUBECONFIG !== undefined || process.env.K8S_TEST_CLUSTER === 'true',
    timeout: 120000,
    retries: 1,
    baseUrl: process.env.K8S_API_SERVER || 'https://kubernetes.docker.internal:6443',
  },
  terraform: {
    name: 'Terraform',
    enabled: true,
    timeout: 300000, // 5 minutes for infrastructure operations
    retries: 1,
  },
  githubActions: {
    name: 'GitHub Actions',
    enabled: process.env.GITHUB_TOKEN !== undefined,
    timeout: 30000,
    retries: 2,
    baseUrl: 'https://api.github.com',
    credentials: {
      token: process.env.GITHUB_TOKEN || 'test_github_token',
    },
  },
  gitlabCI: {
    name: 'GitLab CI',
    enabled: process.env.GITLAB_TOKEN !== undefined,
    timeout: 30000,
    retries: 2,
    baseUrl: process.env.GITLAB_URL || 'https://gitlab.com',
    credentials: {
      token: process.env.GITLAB_TOKEN || 'test_gitlab_token',
    },
  },
  azureDevOps: {
    name: 'Azure DevOps',
    enabled: process.env.AZURE_DEVOPS_PAT !== undefined,
    timeout: 30000,
    retries: 2,
    baseUrl: 'https://dev.azure.com',
    credentials: {
      personalAccessToken: process.env.AZURE_DEVOPS_PAT || 'test_azure_pat',
      organization: process.env.AZURE_DEVOPS_ORG || 'test_org',
    },
  },
};

// Test Environment Configuration
export const testEnvironmentConfig = {
  // Global test settings
  globalTimeout: 300000, // 5 minutes
  setupTimeout: 60000,   // 1 minute
  teardownTimeout: 60000, // 1 minute
  
  // Mock server configuration
  mockServers: {
    basePort: 3001,
    maxConcurrent: 10,
    responseDelay: 100,
  },
  
  // Docker test services
  dockerServices: {
    rabbitmq: {
      image: 'rabbitmq:3-management',
      ports: ['5672:5672', '15672:15672'],
      environment: {
        RABBITMQ_DEFAULT_USER: 'guest',
        RABBITMQ_DEFAULT_PASS: 'guest',
      },
    },
    kafka: {
      image: 'confluentinc/cp-kafka:latest',
      ports: ['9092:9092'],
      environment: {
        KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181',
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
      },
    },
    redis: {
      image: 'redis:7-alpine',
      ports: ['6379:6379'],
    },
    postgresql: {
      image: 'postgres:15-alpine',
      ports: ['5432:5432'],
      environment: {
        POSTGRES_DB: 'xaheen_test',
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
      },
    },
    mysql: {
      image: 'mysql:8',
      ports: ['3306:3306'],
      environment: {
        MYSQL_ROOT_PASSWORD: 'password',
        MYSQL_DATABASE: 'xaheen_test',
      },
    },
    mongodb: {
      image: 'mongo:6',
      ports: ['27017:27017'],
    },
    elasticsearch: {
      image: 'elasticsearch:8.8.0',
      ports: ['9200:9200'],
      environment: {
        'discovery.type': 'single-node',
        'xpack.security.enabled': 'false',
      },
    },
  },
  
  // Cleanup configuration
  cleanup: {
    enabled: process.env.SKIP_CLEANUP !== 'true',
    retainLogs: process.env.RETAIN_LOGS === 'true',
    retainDockerVolumes: false,
  },
  
  // Parallel execution
  parallel: {
    enabled: process.env.PARALLEL_TESTS !== 'false',
    maxWorkers: parseInt(process.env.MAX_TEST_WORKERS || '4'),
  },
} as const;

export default {
  authServices: authServicesConfig,
  paymentServices: paymentServicesConfig,
  communicationServices: communicationServicesConfig,
  documentServices: documentServicesConfig,
  queueServices: queueServicesConfig,
  databaseServices: databaseServicesConfig,
  analyticsServices: analyticsServicesConfig,
  infrastructureServices: infrastructureServicesConfig,
  testEnvironment: testEnvironmentConfig,
} as const;
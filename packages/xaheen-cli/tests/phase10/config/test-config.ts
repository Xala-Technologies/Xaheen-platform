/**
 * Phase 10: Norwegian/NSM/DIGDIR/GDPR/WCAG Compliance Test Configuration
 * 
 * This configuration file defines all endpoints, credentials, and settings
 * required for Norwegian government standards compliance testing.
 */

export interface Phase10TestConfig {
  // Norwegian Authentication Services
  bankid: {
    testEndpoint: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    testUsers: BankIDTestUser[];
  };
  
  altinn: {
    testEndpoint: string;
    apiKey: string;
    subscriptionKey: string;
    testOrganizations: AltinnTestOrg[];
  };
  
  // Document Services
  digipost: {
    testEndpoint: string;
    apiKey: string;
    testRecipients: DigipostTestRecipient[];
    documentTypes: string[];
  };
  
  // Security and Compliance
  nsm: {
    classifications: NSMClassification[];
    auditEndpoint: string;
    encryptionKeys: Record<string, string>;
  };
  
  digdir: {
    reportingEndpoint: string;
    schemaValidationUrl: string;
    apiKey: string;
    serviceId: string;
  };
  
  // GDPR Configuration
  gdpr: {
    consentDatabaseUrl: string;
    deletionQueueUrl: string;
    processingLogUrl: string;
    testSubjects: GDPRTestSubject[];
  };
  
  // Accessibility Testing
  wcag: {
    axeCoreVersion: string;
    testUrls: string[];
    complianceLevel: 'AA' | 'AAA';
    excludedRules: string[];
  };
  
  // General Test Settings
  general: {
    timeout: number;
    retries: number;
    parallelJobs: number;
    outputDirectory: string;
    cleanupAfterTests: boolean;
  };
}

export interface BankIDTestUser {
  personalNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  securityLevel: 'substantial' | 'high';
}

export interface AltinnTestOrg {
  organizationNumber: string;
  name: string;
  serviceOwner: string;
  roles: string[];
}

export interface DigipostTestRecipient {
  personalNumber: string;
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
}

export type NSMClassification = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

export interface GDPRTestSubject {
  id: string;
  email: string;
  consentDate: string;
  dataCategories: string[];
  lawfulBasis: string;
}

/**
 * Default Phase 10 test configuration
 * 
 * Uses environment variables for sensitive data and official Norwegian test endpoints
 */
export const defaultPhase10Config: Phase10TestConfig = {
  bankid: {
    testEndpoint: process.env.BANKID_TEST_ENDPOINT || 'https://eid-exttest.difi.no/',
    clientId: process.env.BANKID_TEST_CLIENT_ID || '',
    clientSecret: process.env.BANKID_TEST_CLIENT_SECRET || '',
    redirectUri: process.env.BANKID_TEST_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    scopes: ['openid', 'profile', 'address', 'phone'],
    testUsers: [
      {
        personalNumber: '05073500186', // Official test user from Difi
        name: 'Kari Nordmann',
        email: 'kari.nordmann@example.no',
        phoneNumber: '+4798765432',
        securityLevel: 'high'
      },
      {
        personalNumber: '26079833910', // Official test user from Difi
        name: 'Ola Nordmann',
        email: 'ola.nordmann@example.no',
        phoneNumber: '+4787654321',
        securityLevel: 'substantial'
      }
    ]
  },
  
  altinn: {
    testEndpoint: process.env.ALTINN_TEST_ENDPOINT || 'https://tt02.altinn.no/',
    apiKey: process.env.ALTINN_TEST_API_KEY || '',
    subscriptionKey: process.env.ALTINN_TEST_SUBSCRIPTION_KEY || '',
    testOrganizations: [
      {
        organizationNumber: '910825518', // Altinn test organization
        name: 'EVRY AS',
        serviceOwner: 'SKD',
        roles: ['Daglig leder', 'Styreleder']
      }
    ]
  },
  
  digipost: {
    testEndpoint: process.env.DIGIPOST_TEST_ENDPOINT || 'https://api.digipost.no/test/',
    apiKey: process.env.DIGIPOST_TEST_API_KEY || '',
    testRecipients: [
      {
        personalNumber: '05073500186',
        name: 'Kari Nordmann',
        address: {
          street: 'Testveien 1',
          postalCode: '0123',
          city: 'Oslo'
        }
      }
    ],
    documentTypes: ['PDF', 'HTML', 'DOCX']
  },
  
  nsm: {
    classifications: ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
    auditEndpoint: process.env.NSM_AUDIT_ENDPOINT || 'https://audit-test.nsm.no/',
    encryptionKeys: {
      OPEN: '',
      RESTRICTED: process.env.NSM_RESTRICTED_KEY || '',
      CONFIDENTIAL: process.env.NSM_CONFIDENTIAL_KEY || '',
      SECRET: process.env.NSM_SECRET_KEY || ''
    }
  },
  
  digdir: {
    reportingEndpoint: process.env.DIGDIR_REPORTING_ENDPOINT || 'https://api.digdir.no/test/',
    schemaValidationUrl: 'https://schemas.digdir.no/digital-service/v1.0/',
    apiKey: process.env.DIGDIR_API_KEY || '',
    serviceId: process.env.DIGDIR_SERVICE_ID || 'xaheen-cli-test'
  },
  
  gdpr: {
    consentDatabaseUrl: process.env.GDPR_CONSENT_DB_URL || 'postgresql://localhost:5432/gdpr_test',
    deletionQueueUrl: process.env.GDPR_DELETION_QUEUE_URL || 'redis://localhost:6379/gdpr_queue',
    processingLogUrl: process.env.GDPR_PROCESSING_LOG_URL || 'mongodb://localhost:27017/gdpr_logs',
    testSubjects: [
      {
        id: 'test-subject-1',
        email: 'test.subject1@example.no',
        consentDate: '2024-01-01T00:00:00Z',
        dataCategories: ['personal', 'contact', 'preferences'],
        lawfulBasis: 'consent'
      },
      {
        id: 'test-subject-2',
        email: 'test.subject2@example.no',
        consentDate: '2024-01-01T00:00:00Z',
        dataCategories: ['personal', 'financial'],
        lawfulBasis: 'contract'
      }
    ]
  },
  
  wcag: {
    axeCoreVersion: '4.8.0',
    testUrls: [
      'http://localhost:3000/test-components',
      'http://localhost:3000/test-forms',
      'http://localhost:3000/test-navigation'
    ],
    complianceLevel: 'AAA',
    excludedRules: [] // No rules excluded for full compliance
  },
  
  general: {
    timeout: 30000, // 30 seconds per test
    retries: 3,
    parallelJobs: 4,
    outputDirectory: './test-output/phase10',
    cleanupAfterTests: process.env.NODE_ENV !== 'development'
  }
};

/**
 * Validation function to ensure all required configuration is present
 */
export function validatePhase10Config(config: Phase10TestConfig): string[] {
  const errors: string[] = [];
  
  // Validate BankID configuration
  if (!config.bankid.clientId) {
    errors.push('BANKID_TEST_CLIENT_ID is required');
  }
  
  if (!config.bankid.clientSecret) {
    errors.push('BANKID_TEST_CLIENT_SECRET is required');
  }
  
  // Validate Altinn configuration
  if (!config.altinn.apiKey) {
    errors.push('ALTINN_TEST_API_KEY is required');
  }
  
  // Validate Digipost configuration
  if (!config.digipost.apiKey) {
    errors.push('DIGIPOST_TEST_API_KEY is required');
  }
  
  // Validate DIGDIR configuration
  if (!config.digdir.apiKey) {
    errors.push('DIGDIR_API_KEY is required');
  }
  
  return errors;
}

/**
 * Environment-specific configuration overrides
 */
export function getEnvironmentConfig(): Partial<Phase10TestConfig> {
  const env = process.env.NODE_ENV || 'test';
  
  switch (env) {
    case 'production':
      return {
        general: {
          ...defaultPhase10Config.general,
          cleanupAfterTests: true,
          parallelJobs: 1 // Conservative for production
        }
      };
      
    case 'ci':
      return {
        general: {
          ...defaultPhase10Config.general,
          timeout: 60000, // Longer timeout for CI
          retries: 5,
          parallelJobs: 2
        }
      };
      
    default:
      return {};
  }
}

/**
 * Load and merge configuration from all sources
 */
export function loadPhase10Config(): Phase10TestConfig {
  const envOverrides = getEnvironmentConfig();
  return {
    ...defaultPhase10Config,
    ...envOverrides,
    general: {
      ...defaultPhase10Config.general,
      ...envOverrides.general
    }
  };
}
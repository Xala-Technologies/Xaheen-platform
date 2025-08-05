# API Generators

## Purpose

The API generators module provides comprehensive REST API generation capabilities with Norwegian enterprise compliance, security standards, and integration with Norwegian government services. It supports multiple API patterns including REST, GraphQL, and gRPC with automatic OpenAPI documentation generation.

## Architecture

```
api/
├── index.ts                          # Module exports and configuration
├── RestAPIGenerator.ts               # REST API generation
├── GraphQLGenerator.ts               # GraphQL API generation
├── gRPCGenerator.ts                  # gRPC service generation
├── OpenAPIGenerator.ts               # OpenAPI/Swagger documentation
├── AuthenticationGenerator.ts        # API authentication
├── ValidationGenerator.ts            # Request/response validation
├── SecurityGenerator.ts              # API security middleware
├── NorwegianComplianceGenerator.ts   # Norwegian API compliance
├── GovernmentAPIGenerator.ts         # Government service APIs
├── templates/                        # API templates
│   ├── rest/                        # REST API templates
│   ├── graphql/                     # GraphQL templates
│   ├── grpc/                        # gRPC templates
│   └── middleware/                  # Middleware templates
└── types.ts                         # API generator types
```

### Key Features

- **Multiple API Types**: REST, GraphQL, gRPC support
- **Norwegian Compliance**: Government API standards
- **Security**: OAuth2, JWT, BankID integration
- **Documentation**: Automatic OpenAPI generation
- **Validation**: Request/response validation
- **Monitoring**: API metrics and logging

## Dependencies

- `express`: Web framework for REST APIs
- `apollo-server-express`: GraphQL server
- `@grpc/grpc-js`: gRPC implementation
- `swagger-jsdoc`: OpenAPI documentation
- `joi`: Schema validation
- `helmet`: Security middleware

## Usage Examples

### REST API Generation

```typescript
import { RestAPIGenerator } from './RestAPIGenerator';

const restGenerator = new RestAPIGenerator({
  framework: 'express',
  database: 'postgresql',
  authentication: 'jwt',
  cors: true,
  rateLimit: true,
  norwegianCompliance: true,
  nsmClassification: 'RESTRICTED'
});

// Generate complete REST API
const api = await restGenerator.generate({
  name: 'UserManagementAPI',
  version: '1.0.0',
  baseUrl: '/api/v1',
  resources: [
    {
      name: 'users',
      model: 'User',
      endpoints: ['GET', 'POST', 'PUT', 'DELETE'],
      permissions: ['read:users', 'write:users', 'delete:users'],
      validation: {
        create: userCreateSchema,
        update: userUpdateSchema
      },
      norwegianFeatures: {
        personalNumberValidation: true,
        gdprCompliance: true,
        auditLogging: true
      }
    },
    {
      name: 'organizations',
      model: 'Organization',
      endpoints: ['GET', 'POST', 'PUT'],
      permissions: ['read:orgs', 'write:orgs'],
      validation: {
        create: organizationCreateSchema,
        update: organizationUpdateSchema
      },
      norwegianFeatures: {
        organizationNumberValidation: true,
        vatValidation: true
      }
    }
  ],
  middleware: [
    'cors',
    'helmet',
    'rateLimit',
    'authentication',
    'authorization',
    'validation',
    'auditLogging',
    'errorHandling'
  ],
  documentation: {
    openapi: true,
    postman: true,
    examples: true
  }
});

console.log('Generated API files:', api.files);
console.log('Security features:', api.security);
console.log('Norwegian compliance:', api.compliance);
```

### GraphQL API Generation

```typescript
import { GraphQLGenerator } from './GraphQLGenerator';

const graphqlGenerator = new GraphQLGenerator({
  database: 'postgresql',
  authentication: 'jwt',
  subscriptions: true,
  introspection: false, // Disabled for production security
  playground: false,
  norwegianCompliance: true
});

// Generate GraphQL API with Norwegian government schema
const graphqlAPI = await graphqlGenerator.generate({
  name: 'GovernmentPortalAPI',
  schema: {
    types: [
      {
        name: 'Citizen',
        fields: [
          { name: 'id', type: 'ID!', description: 'Unique citizen identifier' },
          { name: 'personalNumber', type: 'String', description: 'Norwegian personal number', validation: 'norwegianPersonalNumber' },
          { name: 'name', type: 'String!', description: 'Full name' },
          { name: 'address', type: 'Address', description: 'Residential address' },
          { name: 'services', type: '[GovernmentService!]!', description: 'Available government services' }
        ],
        permissions: ['read:citizen_data'],
        compliance: {
          gdpr: true,
          nsm: 'RESTRICTED',
          auditLogging: true
        }
      },
      {
        name: 'GovernmentService',
        fields: [
          { name: 'id', type: 'ID!', description: 'Service identifier' },
          { name: 'name', type: 'String!', description: 'Service name' },
          { name: 'description', type: 'String', description: 'Service description' },
          { name: 'provider', type: 'String!', description: 'Government agency' },
          { name: 'eligibility', type: '[EligibilityCriteria!]!', description: 'Eligibility requirements' }
        ],
        permissions: ['read:services']
      }
    ],
    queries: [
      {
        name: 'getCitizen',
        type: 'Citizen',
        args: [{ name: 'personalNumber', type: 'String!' }],
        permissions: ['read:citizen_data'],
        validation: 'norwegianPersonalNumber'
      },
      {
        name: 'getAvailableServices',
        type: '[GovernmentService!]!',
        args: [{ name: 'citizenId', type: 'ID!' }],
        permissions: ['read:services']
      }
    ],
    mutations: [
      {
        name: 'updateCitizenProfile',
        type: 'Citizen',
        args: [
          { name: 'personalNumber', type: 'String!' },
          { name: 'updates', type: 'CitizenUpdateInput!' }
        ],
        permissions: ['write:citizen_data'],
        auditLog: true
      }
    ],
    subscriptions: [
      {
        name: 'serviceStatusUpdates',
        type: 'ServiceStatus',
        args: [{ name: 'serviceId', type: 'ID!' }],
        permissions: ['read:service_status']
      }
    ]
  },
  integrations: [
    'altinn',
    'id-porten',
    'maskinporten',
    'folkeregisteret'
  ]
});
```

### Government API Generation

```typescript
import { GovernmentAPIGenerator } from './GovernmentAPIGenerator';

const govAPIGenerator = new GovernmentAPIGenerator({
  securityLevel: 'CONFIDENTIAL',
  authenticationProvider: 'id-porten',
  complianceStandards: ['nsm', 'gdpr', 'eidas'],
  auditLevel: 'comprehensive',
  dataResidency: 'norway'
});

// Generate API for Norwegian government service
const govAPI = await govAPIGenerator.generateGovernmentAPI({
  serviceName: 'TaxDeclarationService',
  agency: 'Skatteetaten',
  serviceLevel: 'level4', // Highest authentication level
  endpoints: [
    {
      path: '/tax-declarations',
      method: 'GET',
      description: 'Retrieve citizen tax declarations',
      authentication: 'level4_required',
      permissions: ['read:tax_data'],
      parameters: [
        {
          name: 'personalNumber',
          type: 'string',
          required: true,
          validation: 'norwegianPersonalNumber',
          encryption: 'required'
        },
        {
          name: 'year',
          type: 'integer',
          required: true,
          validation: 'taxYear'
        }
      ],
      response: {
        type: 'TaxDeclaration',
        classification: 'CONFIDENTIAL',
        encryption: 'required'
      },
      compliance: {
        gdpr: {
          legalBasis: 'legal_obligation',
          dataMinimization: true,
          retention: '7years'
        },
        nsm: {
          classification: 'CONFIDENTIAL',
          handling: 'restricted_access',
          auditRequired: true
        }
      }
    },
    {
      path: '/tax-declarations',
      method: 'POST',
      description: 'Submit tax declaration',
      authentication: 'level4_required',
      permissions: ['write:tax_data'],
      requestBody: {
        type: 'TaxDeclarationSubmission',
        validation: 'comprehensive',
        encryption: 'required'
      },
      auditLogging: {
        level: 'detailed',
        retention: 'permanent',
        fields: ['submitter', 'timestamp', 'changes', 'validation_results']
      }
    }
  ],
  integrations: {
    'id-porten': {
      purpose: 'citizen_authentication',
      level: 'level4'
    },
    'altinn': {
      purpose: 'service_delegation',
      permissions: ['tax_declaration_submission']
    },
    'maskinporten': {
      purpose: 'system_authentication',
      scopes: ['skatteetaten:taxdata']
    }
  }
});
```

### API Security Generation

```typescript
import { SecurityGenerator } from './SecurityGenerator';

const securityGenerator = new SecurityGenerator({
  authenticationMethods: ['jwt', 'oauth2', 'bankid'],
  encryptionStandards: ['aes-256', 'rsa-2048'],
  norwegianCompliance: true,
  auditLogging: true
});

// Generate comprehensive API security
const security = await securityGenerator.generateAPISecurity({
  authentication: {
    primary: 'bankid',
    fallback: 'oauth2',
    sessionManagement: true,
    multiFactorAuth: true,
    config: {
      bankid: {
        environment: 'production',
        level: 'level4',
        clientId: '${BANKID_CLIENT_ID}',
        redirectUri: '${API_BASE_URL}/auth/bankid/callback'
      },
      oauth2: {
        provider: 'azure-ad',
        tenantId: '${TENANT_ID}',
        clientId: '${OAUTH2_CLIENT_ID}',
        scopes: ['api.read', 'api.write']
      }
    }
  },
  authorization: {
    model: 'rbac',
    roles: [
      {
        name: 'citizen',
        permissions: ['read:own_data', 'write:own_data']
      },
      {
        name: 'caseworker',
        permissions: ['read:citizen_data', 'write:case_notes', 'process:applications']
      },
      {
        name: 'administrator',
        permissions: ['read:all_data', 'write:system_config', 'manage:users']
      }
    ],
    policies: [
      {
        name: 'data_access_policy',
        rules: [
          'Citizens can only access their own data',
          'Caseworkers can access data for assigned cases',
          'All data access must be logged'
        ]
      }
    ]
  },
  encryption: {
    dataInTransit: {
      tls: '1.3',
      certificateValidation: true,
      hsts: true
    },
    dataAtRest: {
      algorithm: 'aes-256-gcm',
      keyRotation: 'monthly',
      keyStorage: 'hsm'
    },
    sensitiveFields: [
      'personalNumber',
      'taxInformation',
      'healthData',
      'bankAccountNumbers'
    ]
  },
  compliance: {
    nsm: {
      classification: 'RESTRICTED',
      handling: 'controlled_access',
      auditTrail: 'comprehensive'
    },
    gdpr: {
      lawfulBasis: 'legal_obligation',
      dataMinimization: true,
      consentManagement: true,
      retentionPolicies: true
    }
  }
});
```

## Norwegian Integration Features

### Altinn Integration

```typescript
class AltinnAPIGenerator {
  async generateAltinnIntegration(config: AltinnConfig): Promise<AltinnIntegration> {
    const integration = {
      authentication: {
        maskinporten: {
          clientId: config.maskinporten.clientId,
          scopes: config.scopes,
          keystore: config.keystore
        }
      },
      services: await this.generateAltinnServices(config.services),
      messageHandling: await this.generateMessageHandling(),
      formHandling: await this.generateFormHandling(),
      dataModel: await this.generateAltinnDataModel()
    };
    
    return integration;
  }
  
  private async generateAltinnServices(services: AltinnService[]): Promise<ServiceImplementation[]> {
    return services.map(service => ({
      serviceCode: service.code,
      serviceEdition: service.edition,
      endpoints: {
        submit: `/altinn/services/${service.code}/submit`,
        status: `/altinn/services/${service.code}/status`,
        receipt: `/altinn/services/${service.code}/receipt`
      },
      validation: this.generateAltinnValidation(service),
      security: {
        authentication: 'maskinporten',
        authorization: service.permissions,
        encryption: 'required'
      }
    }));
  }
}
```

### ID-porten Integration

```typescript
class IDPortenAPIGenerator {
  async generateIDPortenAuth(config: IDPortenConfig): Promise<IDPortenAuth> {
    return {
      oidcConfiguration: {
        issuer: config.environment === 'production' 
          ? 'https://login.idporten.no' 
          : 'https://login.test.idporten.no',
        clientId: config.clientId,
        redirectUri: `${config.baseUrl}/auth/idporten/callback`,
        scopes: ['openid', 'profile', ...config.additionalScopes],
        acrValues: config.authenticationLevel || 'Level4'
      },
      tokenValidation: {
        validateSignature: true,
        validateAudience: true,
        validateIssuer: true,
        clockTolerance: 30
      },
      sessionManagement: {
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        rollingSession: true,
        secureSessionStorage: true
      },
      endpoints: {
        login: '/auth/idporten/login',
        callback: '/auth/idporten/callback',
        logout: '/auth/idporten/logout',
        userinfo: '/auth/idporten/userinfo'
      }
    };
  }
}
```

### Norwegian Data Validation

```typescript
class NorwegianValidationGenerator {
  generateNorwegianValidators(): NorwegianValidators {
    return {
      personalNumber: {
        validate: (value: string) => {
          // Validate Norwegian personal number (11 digits with checksum)
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length !== 11) return false;
          
          return this.validatePersonalNumberChecksum(cleaned);
        },
        schema: Joi.string()
          .pattern(/^\d{11}$/)
          .custom((value, helpers) => {
            if (!this.validatePersonalNumberChecksum(value)) {
              return helpers.error('any.invalid');
            }
            return value;
          })
      },
      organizationNumber: {
        validate: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length !== 9) return false;
          
          return this.validateOrganizationNumberChecksum(cleaned);
        },
        schema: Joi.string()
          .pattern(/^\d{9}$/)
          .custom((value, helpers) => {
            if (!this.validateOrganizationNumberChecksum(value)) {
              return helpers.error('any.invalid');
            }
            return value;
          })
      },
      postalCode: {
        validate: (value: string) => {
          return /^\d{4}$/.test(value) && 
                 parseInt(value) >= 0001 && 
                 parseInt(value) <= 9999;
        },
        schema: Joi.string().pattern(/^\d{4}$/)
      },
      phoneNumber: {
        validate: (value: string) => {
          // Norwegian phone numbers
          const cleaned = value.replace(/\D/g, '');
          return /^(47)?\d{8}$/.test(cleaned);
        },
        schema: Joi.string().pattern(/^(\+47|47)?\d{8}$/)
      }
    };
  }
}
```

## Testing

### Unit Tests

```typescript
describe('RestAPIGenerator', () => {
  let generator: RestAPIGenerator;
  
  beforeEach(() => {
    generator = new RestAPIGenerator({
      framework: 'express',
      norwegianCompliance: true
    });
  });
  
  it('should generate API with Norwegian validation', async () => {
    const api = await generator.generate({
      name: 'TestAPI',
      resources: [{
        name: 'citizens',
        model: 'Citizen',
        endpoints: ['GET', 'POST'],
        norwegianFeatures: {
          personalNumberValidation: true
        }
      }]
    });
    
    expect(api.validation).toHaveProperty('personalNumber');
    expect(api.middleware).toContain('norwegianValidation');
    expect(api.compliance.nsm).toBeDefined();
  });
  
  it('should generate secure government API', async () => {
    const govGenerator = new GovernmentAPIGenerator({
      securityLevel: 'CONFIDENTIAL'
    });
    
    const api = await govGenerator.generateGovernmentAPI({
      serviceName: 'TestService',
      agency: 'TestAgency',
      securityLevel: 'CONFIDENTIAL'
    });
    
    expect(api.security.authentication).toBe('level4_required');
    expect(api.compliance.nsm.classification).toBe('CONFIDENTIAL');
    expect(api.auditLogging.level).toBe('comprehensive');
  });
});
```

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should integrate with BankID authentication', async () => {
    const api = await createTestAPI({
      authentication: 'bankid'
    });
    
    const response = await request(api)
      .get('/protected-endpoint')
      .set('Authorization', `Bearer ${mockBankIDToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

## Performance and Security

### Rate Limiting

```typescript
class APIRateLimiter {
  generateRateLimiting(config: RateLimitConfig): RateLimitMiddleware {
    return {
      general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP'
      }),
      authenticated: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000, // Higher limit for authenticated users
        keyGenerator: (req) => req.user?.id || req.ip
      }),
      sensitive: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Very restrictive for sensitive operations
        keyGenerator: (req) => req.user?.id || req.ip,
        handler: (req, res) => {
          // Log security event
          this.securityLogger.logRateLimitExceeded({
            ip: req.ip,
            user: req.user?.id,
            endpoint: req.path
          });
          
          res.status(429).json({
            error: 'Rate limit exceeded for sensitive operation'
          });
        }
      })
    };
  }
}
```

## Contributing

### Development Guidelines

1. **Security First**: Implement comprehensive security measures
2. **Norwegian Compliance**: Follow Norwegian government API standards
3. **Documentation**: Generate comprehensive API documentation
4. **Testing**: Include unit, integration, and security tests
5. **Performance**: Optimize for high-traffic government services
6. **Monitoring**: Include comprehensive logging and metrics

### API Standards

- Follow RESTful design principles
- Use consistent error handling
- Implement proper HTTP status codes
- Provide comprehensive input validation
- Include rate limiting and security headers
- Support Norwegian language and formats
- Comply with government security requirements
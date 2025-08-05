# Authentication Providers

## Purpose

The authentication providers module manages integration with various authentication services, with special focus on Norwegian enterprise authentication systems including BankID, and European enterprise standards like SAML and OAuth2.

## Architecture

```
auth/
├── BankIDProvider.ts          # Norwegian BankID integration
├── OAuth2Provider.ts          # Standard OAuth2 flows
├── SAMLProvider.ts           # Enterprise SAML SSO
├── AzureADProvider.ts        # Microsoft Active Directory
├── CustomAuthProvider.ts     # Internal authentication systems
├── AuthProviderManager.ts    # Authentication orchestration
├── middleware/               # Authentication middleware
│   ├── JWTMiddleware.ts     # JWT token handling
│   ├── SessionMiddleware.ts  # Session management
│   └── RBACMiddleware.ts    # Role-based access control
├── types.ts                 # Authentication types
└── utils.ts                 # Authentication utilities
```

### Key Features

- **Multi-Provider Support**: BankID, OAuth2, SAML, Azure AD
- **Norwegian Compliance**: BankID integration with eID standards
- **Enterprise Security**: SAML SSO, Azure AD integration
- **Session Management**: Secure session handling and storage
- **Role-Based Access**: Comprehensive RBAC implementation

## Dependencies

- `@bankid/oidc-client`: BankID OpenID Connect
- `oauth2-server`: OAuth2 implementation
- `saml2-js`: SAML authentication
- `@azure/msal-node`: Microsoft Authentication Library
- `jsonwebtoken`: JWT token handling
- `express-session`: Session management

## Usage Examples

### BankID Authentication

```typescript
import { BankIDProvider } from './BankIDProvider';

const bankid = new BankIDProvider({
  clientId: process.env.BANKID_CLIENT_ID,
  clientSecret: process.env.BANKID_CLIENT_SECRET,
  environment: 'production', // or 'test'
  redirectUri: 'https://your-app.no/auth/bankid/callback',
  scope: ['openid', 'profile', 'national_identity_number']
});

// Initiate authentication
const authUrl = await bankid.getAuthorizationUrl({
  state: 'secure-random-state',
  nonce: 'secure-random-nonce'
});

// Handle callback
const tokens = await bankid.handleCallback({
  code: 'authorization-code',
  state: 'secure-random-state'
});

// Get user information
const userInfo = await bankid.getUserInfo(tokens.accessToken);
```

### OAuth2 Integration

```typescript
import { OAuth2Provider } from './OAuth2Provider';

const oauth2 = new OAuth2Provider({
  clientId: process.env.OAUTH2_CLIENT_ID,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET,
  authorizationURL: 'https://provider.com/oauth/authorize',
  tokenURL: 'https://provider.com/oauth/token',
  scope: ['read', 'write']
});

// Authorization code flow
const authUrl = oauth2.getAuthorizationUrl({
  redirectUri: 'https://your-app.com/callback',
  state: 'csrf-protection-token'
});

const tokens = await oauth2.exchangeCodeForTokens({
  code: 'authorization-code',
  redirectUri: 'https://your-app.com/callback'
});
```

### SAML Enterprise SSO

```typescript
import { SAMLProvider } from './SAMLProvider';

const saml = new SAMLProvider({
  issuer: 'your-app-identifier',
  entryPoint: 'https://idp.company.com/saml/sso',
  cert: process.env.SAML_CERT,
  privateCert: process.env.SAML_PRIVATE_CERT,
  signatureAlgorithm: 'sha256'
});

// Generate SAML request
const { loginUrl, requestId } = await saml.getLoginUrl({
  relayState: 'return-url'
});

// Validate SAML response
const userProfile = await saml.validateResponse({
  samlResponse: 'base64-encoded-response',
  requestId: 'original-request-id'
});
```

## Provider Implementations

### BankID Provider

**Features:**
- Norwegian eID compliance
- OpenID Connect protocol
- Strong authentication (Level 4)
- Personal identification number access
- Mobile BankID support

**Configuration:**
```typescript
interface BankIDConfig {
  clientId: string;
  clientSecret: string;
  environment: 'test' | 'production';
  redirectUri: string;
  scope: string[];
  locale?: 'no' | 'en' | 'se' | 'dk';
  ui_locales?: string;
  acr_values?: 'Level3' | 'Level4';
}
```

**User Profile:**
```typescript
interface BankIDUserProfile {
  sub: string; // Subject identifier
  name: string; // Full name
  given_name: string;
  family_name: string;
  birthdate: string; // YYYY-MM-DD
  national_identity_number?: string; // Norwegian personnummer
  address?: {
    street_address: string;
    locality: string;
    postal_code: string;
    country: string;
  };
}
```

### Azure AD Provider

**Features:**
- Microsoft Graph integration
- Conditional access policies
- Multi-tenant support
- B2B/B2C scenarios
- Device-based authentication

**Configuration:**
```typescript
interface AzureADConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scope: string[];
  authority?: string;
  cloudInstance?: 'AzurePublic' | 'AzureChina' | 'AzureGermany';
}
```

### Custom Authentication Provider

**Features:**
- Internal authentication systems
- Legacy system integration
- Custom user stores
- Flexible authentication flows

```typescript
class CustomAuthProvider implements AuthProvider {
  async authenticate(credentials: CustomCredentials): Promise<AuthResult> {
    // Custom authentication logic
    const user = await this.userStore.validateCredentials(credentials);
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate tokens
    const accessToken = this.tokenGenerator.generateAccessToken(user);
    const refreshToken = this.tokenGenerator.generateRefreshToken(user);
    
    return {
      success: true,
      user,
      tokens: { accessToken, refreshToken }
    };
  }
}
```

## Norwegian Enterprise Features

### eID Compliance

```typescript
class eIDComplianceValidator {
  validateAssuranceLevel(tokens: BankIDTokens): AssuranceLevel {
    const acr = tokens.idToken.acr; // Authentication Context Class Reference
    
    switch (acr) {
      case 'Level4':
        return 'substantial'; // eIDAS substantial level
      case 'Level3':
        return 'low'; // eIDAS low level
      default:
        throw new Error('Insufficient assurance level');
    }
  }
  
  async validatePersonalNumber(
    personalNumber: string,
    consentGiven: boolean
  ): Promise<boolean> {
    if (!consentGiven) {
      throw new Error('Consent required for personal number processing');
    }
    
    // Validate Norwegian personal number format
    return this.norwegianIDValidator.validate(personalNumber);
  }
}
```

### GDPR Compliance

```typescript
class GDPRCompliantAuthProvider {
  async processAuthenticationData(
    userProfile: UserProfile,
    consent: ConsentRecord
  ): Promise<ProcessedProfile> {
    // Validate consent before processing
    if (!this.consentValidator.validate(consent)) {
      throw new Error('Valid consent required');
    }
    
    // Log processing activity
    await this.auditLogger.logPersonalDataProcessing({
      userId: userProfile.sub,
      dataType: 'authentication_profile',
      purpose: 'user_authentication',
      legalBasis: 'consent',
      timestamp: new Date()
    });
    
    // Process only consented data
    return this.processConsentedData(userProfile, consent);
  }
  
  async handleDataDeletionRequest(userId: string): Promise<void> {
    // Remove user data from all systems
    await Promise.all([
      this.userStore.deleteUser(userId),
      this.sessionStore.deleteUserSessions(userId),
      this.auditLogger.anonymizeUserLogs(userId)
    ]);
    
    // Log deletion
    await this.auditLogger.logDataDeletion({
      userId,
      timestamp: new Date(),
      requestor: 'user'
    });
  }
}
```

## Security Implementation

### JWT Token Security

```typescript
class SecureJWTHandler {
  private readonly algorithm = 'RS256';
  private readonly issuer = 'xaheen-cli';
  
  generateAccessToken(user: UserProfile): string {
    const payload = {
      sub: user.id,
      iss: this.issuer,
      aud: 'xaheen-api',
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      iat: Math.floor(Date.now() / 1000),
      scope: user.permissions.join(' '),
      roles: user.roles,
      security_level: user.securityClearance
    };
    
    return jwt.sign(payload, this.privateKey, {
      algorithm: this.algorithm,
      keyid: this.keyId
    });
  }
  
  validateToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
        audience: 'xaheen-api'
      }) as TokenPayload;
    } catch (error) {
      throw new TokenValidationError('Invalid token', error);
    }
  }
}
```

### Session Management

```typescript
class SecureSessionManager {
  async createSession(user: UserProfile): Promise<Session> {
    const session: Session = {
      id: this.generateSecureId(),
      userId: user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      securityLevel: user.securityClearance,
      maxAge: this.getMaxAge(user.securityClearance)
    };
    
    // Store session securely
    await this.sessionStore.store(session.id, session);
    
    // Set secure cookie
    this.setSecureCookie(session.id);
    
    return session;
  }
  
  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionStore.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check expiration
    if (this.isExpired(session)) {
      await this.sessionStore.delete(sessionId);
      return null;
    }
    
    // Update last activity
    session.lastActivity = new Date();
    await this.sessionStore.store(sessionId, session);
    
    return session;
  }
}
```

### Role-Based Access Control

```typescript
class RBACManager {
  private roleHierarchy = {
    'super_admin': ['admin', 'user', 'readonly'],
    'admin': ['user', 'readonly'],
    'user': ['readonly'],
    'readonly': []
  };
  
  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await this.userService.getUser(userId);
    const userRoles = user.roles;
    
    // Get all effective roles (including inherited)
    const effectiveRoles = this.getEffectiveRoles(userRoles);
    
    // Check permissions for each role
    for (const role of effectiveRoles) {
      const permissions = await this.getRolePermissions(role);
      
      if (this.hasPermission(permissions, resource, action)) {
        return true;
      }
    }
    
    return false;
  }
  
  private getEffectiveRoles(userRoles: string[]): string[] {
    const effective = new Set(userRoles);
    
    userRoles.forEach(role => {
      const inherited = this.roleHierarchy[role] || [];
      inherited.forEach(inheritedRole => effective.add(inheritedRole));
    });
    
    return Array.from(effective);
  }
}
```

## Testing

### Unit Tests

```typescript
describe('BankIDProvider', () => {
  let provider: BankIDProvider;
  
  beforeEach(() => {
    provider = new BankIDProvider({
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      environment: 'test'
    });
  });
  
  it('should generate valid authorization URL', () => {
    const authUrl = provider.getAuthorizationUrl({
      state: 'test-state',
      nonce: 'test-nonce'
    });
    
    expect(authUrl).toContain('test.bankid.no');
    expect(authUrl).toContain('state=test-state');
    expect(authUrl).toContain('nonce=test-nonce');
  });
  
  it('should validate Norwegian personal number', async () => {
    const isValid = await provider.validatePersonalNumber('12345678901');
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Authentication Flow Integration', () => {
  it('should complete full BankID authentication flow', async () => {
    // Mock BankID responses
    nock('https://test.bankid.no')
      .post('/oauth2/token')
      .reply(200, {
        access_token: 'test-access-token',
        id_token: 'test-id-token'
      });
    
    const provider = new BankIDProvider(testConfig);
    
    const tokens = await provider.handleCallback({
      code: 'test-code',
      state: 'test-state'
    });
    
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.idToken).toBeDefined();
  });
});
```

## Monitoring and Observability

### Authentication Metrics

```typescript
class AuthMetricsCollector {
  async recordAuthentication(
    provider: string,
    success: boolean,
    duration: number
  ): Promise<void> {
    await this.metricsClient.increment('auth.attempts', {
      provider,
      success: success.toString()
    });
    
    await this.metricsClient.histogram('auth.duration', duration, {
      provider
    });
  }
  
  async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.securityLogger.log({
      level: 'warning',
      message: 'Security event detected',
      event,
      timestamp: new Date()
    });
  }
}
```

### Audit Logging

```typescript
class AuthAuditLogger {
  async logAuthenticationAttempt(attempt: AuthAttempt): Promise<void> {
    await this.auditLog.record({
      event: 'authentication_attempt',
      userId: attempt.userId,
      provider: attempt.provider,
      success: attempt.success,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      timestamp: attempt.timestamp,
      failureReason: attempt.failureReason
    });
  }
  
  async logPrivilegeEscalation(escalation: PrivilegeEscalation): Promise<void> {
    await this.securityAuditLog.record({
      event: 'privilege_escalation',
      userId: escalation.userId,
      fromRole: escalation.fromRole,
      toRole: escalation.toRole,
      authorizedBy: escalation.authorizedBy,
      timestamp: escalation.timestamp,
      justification: escalation.justification
    });
  }
}
```

## Contributing

### Adding New Authentication Providers

1. **Implement Provider Interface**:
   ```typescript
   export class NewAuthProvider implements AuthProvider {
     async authenticate(credentials: any): Promise<AuthResult> {
       // Implementation
     }
   }
   ```

2. **Add Configuration Schema**:
   ```typescript
   interface NewAuthConfig extends AuthProviderConfig {
     // Provider-specific configuration
   }
   ```

3. **Register Provider**:
   ```typescript
   authManager.register('new-auth', NewAuthProvider);
   ```

### Security Guidelines

- Always validate and sanitize input data
- Implement proper token validation and expiration
- Use secure session management practices
- Follow OWASP authentication guidelines
- Implement comprehensive audit logging
- Ensure Norwegian data protection compliance
- Regular security testing and vulnerability assessments
# Licensing Module

## Purpose

The licensing module implements a comprehensive software licensing system for the Xaheen CLI, providing secure license validation, usage tracking, and compliance monitoring for Norwegian enterprise environments. It supports various licensing models including perpetual, subscription, and government licensing schemes.

## Architecture

```
licensing/
├── CLILicenseIntegration.ts    # CLI license integration
├── LicenseCommands.ts          # License management commands
├── LicenseManager.ts           # Core license management
├── index.ts                    # Module exports
├── types.ts                    # License type definitions
├── validators/                 # License validation
│   ├── LicenseValidator.ts     # Core validation logic
│   ├── SignatureValidator.ts   # Digital signature validation
│   └── ComplianceValidator.ts  # Norwegian compliance validation
├── storage/                    # License storage
│   ├── SecureLicenseStorage.ts # Encrypted license storage
│   ├── CloudLicenseSync.ts     # Cloud synchronization
│   └── BackupManager.ts        # License backup and recovery
├── tracking/                   # Usage tracking
│   ├── UsageTracker.ts         # Feature usage tracking
│   ├── LicenseMetrics.ts       # License metrics collection
│   └── ComplianceReporter.ts   # Compliance reporting
├── activation/                 # License activation
│   ├── OnlineActivation.ts     # Online activation service
│   ├── OfflineActivation.ts    # Offline activation support
│   └── BulkActivation.ts       # Enterprise bulk activation
├── enforcement/                # License enforcement
│   ├── FeatureGate.ts          # Feature access control
│   ├── UsageEnforcer.ts        # Usage limit enforcement
│   └── ExpirationHandler.ts    # License expiration handling
└── reporting/                  # License reporting
    ├── LicenseReporter.ts      # License status reporting
    ├── AuditReporter.ts        # Audit trail reporting
    └── ComplianceReporter.ts   # Norwegian compliance reports
```

### Key Features

- **Secure Licensing**: Digital signatures and encryption
- **Norwegian Compliance**: Government licensing requirements
- **Multiple Models**: Perpetual, subscription, enterprise, government
- **Usage Tracking**: Comprehensive feature usage monitoring
- **Offline Support**: Offline license validation and activation
- **Audit Trail**: Complete licensing audit logs

## Dependencies

- `node-rsa`: RSA cryptography for license signing
- `crypto`: Node.js cryptographic functions
- `jsonwebtoken`: JWT token handling
- `node-machine-id`: Hardware fingerprinting
- `axios`: HTTP client for online activation
- `sqlite3`: Local license database

## Usage Examples

### Basic License Management

```typescript
import { LicenseManager } from './LicenseManager';

// Initialize license manager
const licenseManager = new LicenseManager({
  productId: 'xaheen-cli',
  version: '2.0.0',
  publicKey: process.env.LICENSE_PUBLIC_KEY,
  licenseServerUrl: 'https://licenses.xaheen.no',
  complianceMode: 'norwegian_government'
});

// Check current license status
const licenseStatus = await licenseManager.getCurrentLicense();
console.log(`License: ${licenseStatus.type} - Valid until: ${licenseStatus.expiresAt}`);

// Validate feature access
const canUseAI = await licenseManager.hasFeatureAccess('ai-generation');
if (!canUseAI) {
  throw new Error('AI generation requires Pro license or higher');
}

// Track feature usage
await licenseManager.trackFeatureUsage('component-generation', {
  componentType: 'react',
  complexity: 'advanced',
  complianceLevel: 'nsm'
});
```

### CLI License Integration

```typescript
// Current implementation from CLILicenseIntegration.ts
import { CLILicenseIntegration } from './CLILicenseIntegration';

class XaheenCLI {
  private licenseIntegration: CLILicenseIntegration;
  
  constructor() {
    this.licenseIntegration = new CLILicenseIntegration({
      productName: 'Xaheen CLI',
      version: process.env.CLI_VERSION,
      configDir: '~/.xaheen',
      telemetryEnabled: true
    });
  }
  
  async executeCommand(command: string, args: any[]): Promise<void> {
    // Validate license before command execution
    const licenseValid = await this.licenseIntegration.validateLicense();
    if (!licenseValid) {
      console.error('Invalid or expired license. Please activate your license.');
      return;
    }
    
    // Check feature-specific permissions
    const hasPermission = await this.licenseIntegration.checkFeaturePermission(command);
    if (!hasPermission) {
      console.error(`Command '${command}' requires a higher license tier.`);
      return;
    }
    
    // Execute command with usage tracking
    await this.licenseIntegration.executeWithTracking(command, async () => {
      return this.executeCommandInternal(command, args);
    });
  }
}
```

### License Activation

```typescript
import { OnlineActivation, OfflineActivation } from './activation';

// Online activation
const onlineActivation = new OnlineActivation({
  serverUrl: 'https://activation.xaheen.no',
  productId: 'xaheen-cli',
  timeout: 30000
});

try {
  const license = await onlineActivation.activate({
    licenseKey: 'XAHEEN-CLI-XXXX-XXXX-XXXX-XXXX',
    email: 'user@company.no',
    organization: 'Norsk Bedrift AS',
    organizationNumber: '123456789'
  });
  
  console.log('License activated successfully!');
  console.log(`Licensed to: ${license.licensedTo}`);
  console.log(`Valid until: ${license.expiresAt}`);
} catch (error) {
  // Fallback to offline activation
  console.log('Online activation failed, trying offline activation...');
  
  const offlineActivation = new OfflineActivation();
  const activationRequest = await offlineActivation.generateRequest({
    licenseKey: 'XAHEEN-CLI-XXXX-XXXX-XXXX-XXXX',
    machineId: await getMachineId()
  });
  
  console.log('Please send this activation request to support@xaheen-ai.no:');
  console.log(activationRequest);
}
```

### Norwegian Government Licensing

```typescript
import { GovernmentLicenseManager } from './validators/ComplianceValidator';

const govLicenseManager = new GovernmentLicenseManager({
  securityLevel: 'SECRET',
  organizationType: 'government_agency',
  complianceRequirements: ['nsm', 'gdpr', 'foia'],
  auditLevel: 'comprehensive'
});

// Validate government license
const govLicense = await govLicenseManager.validateGovernmentLicense({
  organizationNumber: '123456789',
  securityClearance: 'SECRET',
  approvedBy: 'NSM',
  validationLevel: 'enhanced'
});

// Check compliance with Norwegian regulations
const complianceStatus = await govLicenseManager.checkNorwegianCompliance(govLicense);
if (!complianceStatus.compliant) {
  throw new Error(`License not compliant: ${complianceStatus.violations.join(', ')}`);
}
```

### Enterprise Bulk Activation

```typescript
import { BulkActivation } from './activation/BulkActivation';

const bulkActivation = new BulkActivation({
  organizationId: 'norsk-bedrift-as',
  managementApi: 'https://enterprise.xaheen.no/api',
  batchSize: 50
});

// Activate licenses for multiple users
const activationResults = await bulkActivation.activateMultiple([
  { email: 'dev1@company.no', role: 'developer', team: 'frontend' },
  { email: 'dev2@company.no', role: 'architect', team: 'backend' },
  { email: 'admin@company.no', role: 'admin', team: 'operations' }
], {
  licenseType: 'enterprise',
  duration: '1year',
  features: ['ai-generation', 'enterprise-templates', 'compliance-tools']
});

console.log(`Successfully activated ${activationResults.successful.length} licenses`);
if (activationResults.failed.length > 0) {
  console.error(`Failed to activate ${activationResults.failed.length} licenses`);
}
```

## License Types and Models

### License Tiers

```typescript
enum LicenseTier {
  FREE = 'free',
  STARTER = 'starter', 
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  GOVERNMENT = 'government'
}

interface LicenseFeatures {
  // Core features
  componentGeneration: boolean;
  templateAccess: number; // Number of templates
  projectsLimit: number;
  
  // AI features
  aiGeneration: boolean;
  aiOptimization: boolean;
  aiRefactoring: boolean;
  
  // Norwegian features
  norwegianCompliance: boolean;
  nsmClassification: boolean;
  bankidIntegration: boolean;
  
  // Enterprise features
  teamCollaboration: boolean;
  enterpriseTemplates: boolean;
  auditLogging: boolean;
  ssoIntegration: boolean;
  
  // Government features
  governmentTemplates: boolean;
  enhancedSecurity: boolean;
  offlineMode: boolean;
  customCompliance: boolean;
}

const LICENSE_FEATURES: Record<LicenseTier, LicenseFeatures> = {
  [LicenseTier.FREE]: {
    componentGeneration: true,
    templateAccess: 10,
    projectsLimit: 3,
    aiGeneration: false,
    aiOptimization: false,
    aiRefactoring: false,
    norwegianCompliance: true,
    nsmClassification: false,
    bankidIntegration: false,
    teamCollaboration: false,
    enterpriseTemplates: false,
    auditLogging: false,
    ssoIntegration: false,
    governmentTemplates: false,
    enhancedSecurity: false,
    offlineMode: false,
    customCompliance: false
  },
  // ... other tiers
};
```

### Subscription Models

```typescript
interface SubscriptionLicense extends License {
  subscriptionId: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenewal: boolean;
  usageMetrics: {
    componentsGenerated: number;
    aiRequestsUsed: number;
    templatesAccessed: number;
  };
  limits: {
    maxComponentsPerMonth: number;
    maxAIRequestsPerMonth: number;
    maxTeamMembers: number;
  };
}

class SubscriptionManager {
  async checkUsageLimits(license: SubscriptionLicense): Promise<UsageStatus> {
    const currentUsage = await this.getCurrentUsage(license.subscriptionId);
    
    return {
      withinLimits: currentUsage.components <= license.limits.maxComponentsPerMonth,
      usage: currentUsage,
      limits: license.limits,
      resetDate: this.getNextResetDate(license.billingCycle)
    };
  }
  
  async handleUsageExceeded(license: SubscriptionLicense): Promise<void> {
    // Send usage warning
    await this.notificationService.sendUsageWarning(license);
    
    // Apply soft limits
    this.featureGate.applySoftLimits(license);
    
    // Offer upgrade options
    await this.offerUpgrade(license);
  }
}
```

## Norwegian Compliance Features

### NSM Security Classification

```typescript
class NSMComplianceLicense {
  async validateNSMRequirements(license: License): Promise<NSMValidationResult> {
    const requirements = await this.getNSMRequirements(license.securityLevel);
    
    const validations = await Promise.all([
      this.validateOrganizationClearance(license.organizationNumber),
      this.validateUserClearance(license.userId),
      this.validateDataResidency(license.dataLocation),
      this.validateAuditRequirements(license.auditLevel),
      this.validateEncryptionStandards(license.encryptionLevel)
    ]);
    
    return {
      compliant: validations.every(v => v.valid),
      violations: validations.filter(v => !v.valid).map(v => v.violation),
      recommendations: this.generateRecommendations(validations)
    };
  }
  
  async generateComplianceReport(
    license: License,
    period: ReportingPeriod
  ): Promise<NSMComplianceReport> {
    const usage = await this.getUsageForPeriod(license.id, period);
    const securityEvents = await this.getSecurityEvents(license.id, period);
    
    return {
      license: license.id,
      period,
      classification: license.securityLevel,
      usage: {
        totalOperations: usage.operations.length,
        classifiedOperations: usage.operations.filter(op => op.classification !== 'OPEN').length,
        highestClassification: this.getHighestClassification(usage.operations)
      },
      securityEvents: {
        total: securityEvents.length,
        critical: securityEvents.filter(e => e.severity === 'critical').length,
        resolved: securityEvents.filter(e => e.status === 'resolved').length
      },
      complianceScore: await this.calculateComplianceScore(license, usage, securityEvents),
      generatedAt: new Date(),
      validatedBy: 'NSM-Compliance-Engine'
    };
  }
}
```

### GDPR License Compliance

```typescript
class GDPRLicenseCompliance {
  async handlePersonalDataProcessing(
    license: License,
    operation: DataProcessingOperation
  ): Promise<void> {
    // Validate legal basis
    if (!this.hasValidLegalBasis(operation)) {
      throw new Error('No valid legal basis for personal data processing');
    }
    
    // Check consent requirements
    if (operation.requiresConsent && !operation.consent?.valid) {
      throw new Error('Valid consent required for this operation');
    }
    
    // Log processing activity
    await this.processingLogger.log({
      licenseId: license.id,
      operation: operation.type,
      dataTypes: operation.dataTypes,
      legalBasis: operation.legalBasis,
      retention: operation.retentionPeriod,
      timestamp: new Date()
    });
    
    // Apply data minimization
    operation.data = this.applyDataMinimization(operation.data);
    
    // Set retention timer
    this.scheduleDataDeletion(operation);
  }
  
  async generateGDPRReport(license: License): Promise<GDPRReport> {
    const processingActivities = await this.getProcessingActivities(license.id);
    const dataSubjects = await this.getDataSubjects(license.id);
    
    return {
      license: license.id,
      organization: license.organization,
      reportingPeriod: this.getCurrentReportingPeriod(),
      processingActivities: processingActivities.map(activity => ({
        purpose: activity.purpose,
        legalBasis: activity.legalBasis,
        dataTypes: activity.dataTypes,
        recipients: activity.recipients,
        retention: activity.retention
      })),
      dataSubjectRights: {
        accessRequests: await this.getAccessRequests(license.id),
        rectificationRequests: await this.getRectificationRequests(license.id),
        erasureRequests: await this.getErasureRequests(license.id),
        portabilityRequests: await this.getPortabilityRequests(license.id)
      },
      breachNotifications: await this.getBreachNotifications(license.id),
      generatedAt: new Date()
    };
  }
}
```

## Security Implementation

### License Signing and Validation

```typescript
class LicenseSecurityManager {
  private privateKey: string;
  private publicKey: string;
  
  async signLicense(license: UnsignedLicense): Promise<SignedLicense> {
    // Create license payload
    const payload = {
      id: license.id,
      licensedTo: license.licensedTo,
      organization: license.organization,
      tier: license.tier,
      features: license.features,
      expiresAt: license.expiresAt,
      issuedAt: new Date(),
      machineId: license.machineId
    };
    
    // Generate digital signature
    const signature = await this.generateSignature(payload);
    
    // Create secure license
    return {
      ...payload,
      signature,
      publicKeyId: this.getPublicKeyId(),
      version: '2.0'
    };
  }
  
  async validateLicense(license: SignedLicense): Promise<ValidationResult> {
    try {
      // Verify signature
      const isValidSignature = await this.verifySignature(license);
      if (!isValidSignature) {
        return { valid: false, error: 'Invalid license signature' };
      }
      
      // Check expiration
      if (new Date() > new Date(license.expiresAt)) {
        return { valid: false, error: 'License has expired' };
      }
      
      // Validate machine binding
      const currentMachineId = await this.getMachineId();
      if (license.machineId && license.machineId !== currentMachineId) {
        return { valid: false, error: 'License not valid for this machine' };
      }
      
      // Check revocation status
      const isRevoked = await this.checkRevocationStatus(license.id);
      if (isRevoked) {
        return { valid: false, error: 'License has been revoked' };
      }
      
      return { valid: true, license };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  private async generateSignature(payload: any): Promise<string> {
    const rsa = new NodeRSA(this.privateKey);
    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
    return rsa.sign(payloadString, 'base64');
  }
  
  private async verifySignature(license: SignedLicense): Promise<boolean> {
    const rsa = new NodeRSA(this.publicKey);
    const { signature, ...payload } = license;
    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
    
    try {
      return rsa.verify(payloadString, signature, 'utf8', 'base64');
    } catch (error) {
      return false;
    }
  }
}
```

### Secure License Storage

```typescript
class SecureLicenseStorage {
  private encryptionKey: Buffer;
  
  constructor(config: StorageConfig) {
    this.encryptionKey = this.deriveEncryptionKey(config.masterKey);
  }
  
  async storeLicense(license: SignedLicense): Promise<void> {
    // Encrypt license data
    const encryptedLicense = await this.encrypt(JSON.stringify(license));
    
    // Store with integrity hash
    const hash = this.calculateHash(encryptedLicense);
    
    await this.storage.set('license', {
      data: encryptedLicense,
      hash,
      timestamp: new Date()
    });
    
    // Create secure backup
    await this.createSecureBackup(license);
  }
  
  async retrieveLicense(): Promise<SignedLicense | null> {
    const stored = await this.storage.get('license');
    if (!stored) {
      return null;
    }
    
    // Verify integrity
    const calculatedHash = this.calculateHash(stored.data);
    if (calculatedHash !== stored.hash) {
      throw new SecurityError('License data integrity check failed');
    }
    
    // Decrypt license
    const decryptedData = await this.decrypt(stored.data);
    return JSON.parse(decryptedData);
  }
  
  private async encrypt(data: string): Promise<string> {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return encrypted + ':' + authTag.toString('hex');
  }
  
  private async decrypt(encryptedData: string): Promise<string> {
    const parts = encryptedData.split(':');
    const encrypted = parts[0];
    const authTag = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Testing

### Unit Tests

```typescript
describe('LicenseManager', () => {
  let licenseManager: LicenseManager;
  let mockStorage: jest.Mocked<SecureLicenseStorage>;
  
  beforeEach(() => {
    mockStorage = {
      storeLicense: jest.fn(),
      retrieveLicense: jest.fn()
    } as any;
    
    licenseManager = new LicenseManager({
      storage: mockStorage,
      publicKey: testPublicKey,
      productId: 'test-product'
    });
  });
  
  it('should validate Norwegian government license', async () => {
    const govLicense = createTestGovernmentLicense({
      organizationNumber: '123456789',
      securityLevel: 'RESTRICTED',
      features: ['norwegianCompliance', 'nsmClassification']
    });
    
    mockStorage.retrieveLicense.mockResolvedValue(govLicense);
    
    const validation = await licenseManager.validateLicense();
    
    expect(validation.valid).toBe(true);
    expect(validation.license.features.norwegianCompliance).toBe(true);
  });
  
  it('should enforce usage limits for subscription licenses', async () => {
    const subscriptionLicense = createTestSubscriptionLicense({
      tier: 'professional',
      limits: { maxComponentsPerMonth: 100 }
    });
    
    // Mock current usage at limit
    jest.spyOn(licenseManager, 'getCurrentUsage').mockResolvedValue({
      componentsGenerated: 100
    });
    
    const canUse = await licenseManager.hasFeatureAccess('component-generation');
    
    expect(canUse).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('License Integration', () => {
  it('should complete full license activation flow', async () => {
    const activationService = new OnlineActivation({
      serverUrl: 'http://localhost:3000/test-activation'
    });
    
    // Mock activation server response
    nock('http://localhost:3000')
      .post('/test-activation')
      .reply(200, {
        license: createTestSignedLicense(),
        success: true
      });
    
    const result = await activationService.activate({
      licenseKey: 'TEST-XXXX-XXXX-XXXX-XXXX',
      email: 'test@example.no'
    });
    
    expect(result.success).toBe(true);
    expect(result.license).toBeDefined();
  });
});
```

## Monitoring and Reporting

### License Analytics

```typescript
class LicenseAnalytics {
  async generateUsageReport(
    license: License,
    period: ReportingPeriod
  ): Promise<UsageReport> {
    const usage = await this.getUsageMetrics(license.id, period);
    
    return {
      license: license.id,
      period,
      metrics: {
        totalCommands: usage.commands.length,
        uniqueFeatures: new Set(usage.commands.map(c => c.feature)).size,
        peakUsageDays: this.calculatePeakUsage(usage.commands),
        featureBreakdown: this.calculateFeatureBreakdown(usage.commands)
      },
      compliance: {
        gdprCompliant: usage.gdprCompliantOperations / usage.totalOperations,
        nsmClassified: usage.classifiedOperations / usage.totalOperations,
        auditTrailComplete: usage.auditedOperations / usage.totalOperations
      },
      recommendations: await this.generateUsageRecommendations(usage)
    };
  }
}
```

### Audit Reporting

```typescript
class LicenseAuditReporter {
  async generateAuditReport(
    organizationId: string,
    period: ReportingPeriod
  ): Promise<LicenseAuditReport> {
    const licenses = await this.getOrganizationLicenses(organizationId);
    const auditEvents = await this.getAuditEvents(organizationId, period);
    
    return {
      organization: organizationId,
      period,
      licenses: licenses.map(license => ({
        id: license.id,
        type: license.type,
        status: license.status,
        lastUsed: license.lastUsed,
        complianceScore: this.calculateComplianceScore(license)
      })),
      auditEvents: auditEvents.map(event => ({
        timestamp: event.timestamp,
        type: event.type,
        licenseId: event.licenseId,
        userId: event.userId,
        details: event.details,
        complianceImpact: event.complianceImpact
      })),
      summary: {
        totalLicenses: licenses.length,
        activeLicenses: licenses.filter(l => l.status === 'active').length,
        expiringSoon: licenses.filter(l => this.isExpiringSoon(l)).length,
        complianceViolations: auditEvents.filter(e => e.type === 'violation').length
      },
      generatedAt: new Date(),
      validatedBy: await this.getCurrentAuditor()
    };
  }
}
```

## Contributing

### Development Guidelines

1. **Security First**: Always prioritize security in license handling
2. **Norwegian Compliance**: Implement Norwegian-specific requirements
3. **Comprehensive Testing**: Include unit, integration, and security tests
4. **Clear Documentation**: Document all licensing features and flows
5. **Audit Logging**: Log all license-related operations
6. **Error Handling**: Provide clear error messages and recovery options

### Security Considerations

- Never store private keys in code
- Use secure random number generation
- Implement proper key rotation
- Validate all license data thoroughly
- Encrypt sensitive license information
- Implement secure communication channels
- Regular security audits and penetration testing

### Extending the License System

The licensing system is designed for extensibility:

- Add new license types in `types.ts`
- Implement custom validators in `validators/`
- Create new activation methods in `activation/`
- Add compliance modules in `enforcement/`
- Extend reporting capabilities in `reporting/`
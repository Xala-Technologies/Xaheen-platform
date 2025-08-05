# Library Utilities Module

## Purpose

The lib module provides essential utility functions, helpers, and common functionality used throughout the Xaheen CLI. It implements reusable components following Norwegian enterprise standards and provides the foundational building blocks for the entire application.

## Architecture

```
lib/
├── patch-utils.ts              # File system patching utilities
├── validation/                 # Validation utilities
│   ├── norwegian-validators.ts # Norwegian-specific validations
│   ├── schema-validators.ts    # Schema validation helpers
│   └── security-validators.ts  # Security validation functions
├── formatting/                 # Output formatting utilities
│   ├── console-formatter.ts    # Console output styling
│   ├── table-formatter.ts      # Table display utilities
│   └── progress-formatter.ts   # Progress indicators
├── file-system/               # File system utilities
│   ├── safe-file-operations.ts # Secure file operations
│   ├── template-processor.ts   # Template file processing
│   └── directory-manager.ts    # Directory management
├── crypto/                    # Cryptographic utilities
│   ├── encryption.ts          # Data encryption/decryption
│   ├── hashing.ts            # Secure hashing functions
│   └── key-management.ts      # Cryptographic key handling
├── networking/                # Network utilities
│   ├── http-client.ts         # HTTP client with retry logic
│   ├── websocket-client.ts    # WebSocket connections
│   └── proxy-handler.ts       # Proxy configuration
├── cache/                     # Caching utilities
│   ├── memory-cache.ts        # In-memory caching
│   ├── file-cache.ts          # File-based caching
│   └── redis-cache.ts         # Redis caching backend
├── async/                     # Asynchronous utilities
│   ├── promise-utils.ts       # Promise helpers
│   ├── queue-manager.ts       # Async queue processing
│   └── throttle-utils.ts      # Rate limiting utilities
├── date-time/                 # Date and time utilities
│   ├── norwegian-dates.ts     # Norwegian date formats
│   ├── timezone-utils.ts      # Timezone handling
│   └── duration-parser.ts     # Time duration parsing
├── logging/                   # Logging utilities
│   ├── structured-logger.ts   # Structured logging
│   ├── audit-logger.ts        # Security audit logging
│   └── performance-logger.ts  # Performance metrics
└── testing/                   # Testing utilities
    ├── test-helpers.ts         # Test utility functions
    ├── mock-factories.ts       # Mock object factories
    └── fixtures.ts             # Test data fixtures
```

### Key Features

- **Norwegian Compliance**: Built-in support for Norwegian standards
- **Security**: Cryptographic utilities and secure operations
- **Performance**: Caching, throttling, and optimization utilities
- **Validation**: Comprehensive input validation and sanitization
- **File Operations**: Safe and secure file system operations

## Dependencies

### Core Dependencies
```json
{
  "fs-extra": "^11.0.0",
  "lodash": "^4.17.21",
  "chalk": "^5.3.0",
  "ora": "^7.0.1",
  "crypto": "node:crypto",
  "path": "node:path"
}
```

### Security Dependencies
```json
{
  "bcrypt": "^5.1.0",
  "crypto-js": "^4.1.1",
  "jsonwebtoken": "^9.0.2",
  "helmet": "^7.0.0"
}
```

### Validation Dependencies
```json
{
  "joi": "^17.9.2",
  "validator": "^13.9.0",
  "zod": "^3.21.4"
}
```

## Usage Examples

### File System Patch Utilities

```typescript
// Current implementation from patch-utils.ts
import { patchUtils } from './patch-utils';

// Apply security patches to generated files
await patchUtils.applySecurityPatches('./generated-components', {
  addSecurityHeaders: true,
  sanitizeInputs: true,
  norwegianCompliance: true
});

// Patch template files with Norwegian compliance
await patchUtils.patchTemplateFiles('./templates', {
  compliance: 'nsm',
  classification: 'RESTRICTED',
  auditTrail: true
});
```

### Norwegian Validation Utilities

```typescript
import { norwegianValidators } from './validation/norwegian-validators';

// Validate Norwegian personal number (personnummer)
const isValidPersonalNumber = norwegianValidators.validatePersonalNumber('12345678901');
console.log(isValidPersonalNumber); // true/false

// Validate Norwegian organization number
const isValidOrgNumber = norwegianValidators.validateOrganizationNumber('123456789');

// Validate Norwegian postal code
const isValidPostalCode = norwegianValidators.validatePostalCode('0123');

// Validate BankID format
const isValidBankID = norwegianValidators.validateBankIDFormat('+4712345678');

// Format Norwegian currency
const formattedAmount = norwegianValidators.formatNorwegianCurrency(29900); // "299,00 kr"
```

### Secure File Operations

```typescript
import { safeFileOperations } from './file-system/safe-file-operations';

// Securely read file with validation
const fileContent = await safeFileOperations.readFileSecurely('./config.json', {
  maxSize: 1024 * 1024, // 1MB limit
  allowedExtensions: ['.json', '.yaml'],
  validateSchema: configSchema,
  auditAccess: true
});

// Write file with atomic operations
await safeFileOperations.writeFileSecurely('./output.json', data, {
  createBackup: true,
  validateContent: true,
  setPermissions: 0o600, // Read/write for owner only
  logOperation: true
});

// Copy directory with security checks
await safeFileOperations.copyDirectorySecurely('./source', './destination', {
  excludePatterns: ['*.log', 'node_modules/**'],
  validateFiles: true,
  preservePermissions: false,
  auditCopy: true
});
```

### Encryption Utilities

```typescript
import { encryption } from './crypto/encryption';

// Encrypt sensitive data
const encryptedData = await encryption.encrypt('sensitive information', {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  saltLength: 32
});

// Decrypt data
const decryptedData = await encryption.decrypt(encryptedData, {
  validateIntegrity: true,
  auditDecryption: true
});

// Encrypt file
await encryption.encryptFile('./sensitive.json', './sensitive.json.enc', {
  deleteOriginal: true,
  compressionLevel: 9,
  metadata: {
    classification: 'CONFIDENTIAL',
    createdBy: userId
  }
});
```

### Console Formatting Utilities

```typescript
import { consoleFormatter } from './formatting/console-formatter';

// Format success message
consoleFormatter.success('Component generated successfully!');

// Format error with Norwegian text
consoleFormatter.error('Feil: Ugyldig konfigurasjon');

// Format warning
consoleFormatter.warning('Advarsel: Eksisterende fil vil bli overskrevet');

// Format info with icon
consoleFormatter.info('📋 Genererer norsk-kompatibel komponent...');

// Create progress indicator
const spinner = consoleFormatter.createSpinner('Laster ned avhengigheter...');
spinner.start();
// ... async operation
spinner.succeed('Avhengigheter lastet ned!');

// Format table
consoleFormatter.table([
  { Name: 'React Component', Status: '✅ Generert', Compliance: 'NSM RESTRICTED' },
  { Name: 'Vue Component', Status: '⏳ Venter', Compliance: 'GDPR Ready' }
]);
```

### HTTP Client with Norwegian Compliance

```typescript
import { httpClient } from './networking/http-client';

// Configure HTTP client with Norwegian compliance
const client = httpClient.create({
  baseURL: 'https://api.norway-only.no',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  compliance: {
    dataResidency: 'norway',
    logRequests: true,
    validateSSL: true,
    requiresAuth: true
  },
  headers: {
    'User-Agent': 'Xaheen-CLI/2.0.0',
    'Accept-Language': 'no,en;q=0.8'
  }
});

// Make request with automatic retry and logging
const response = await client.get('/api/components', {
  params: { classification: 'RESTRICTED' },
  validateResponse: true,
  auditRequest: true
});

// Upload file with progress tracking
await client.uploadFile('/api/upload', './component.tsx', {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  },
  validateChecksum: true,
  encryptDuringTransfer: true
});
```

### Caching with Norwegian Compliance

```typescript
import { cacheManager } from './cache/memory-cache';

// Configure cache with compliance settings
const cache = cacheManager.create({
  maxSize: 100,
  ttl: 300000, // 5 minutes
  compliance: {
    encryptValues: true,
    auditAccess: true,
    dataResidency: 'norway',
    purgeOnExit: true
  }
});

// Cache with security metadata
await cache.set('user:profile:123', userProfile, {
  tags: ['personal_data', 'gdpr'],
  classification: 'RESTRICTED',
  expires: Date.now() + 3600000 // 1 hour
});

// Get cached data with audit logging
const cachedProfile = await cache.get('user:profile:123', {
  auditAccess: true,
  validateIntegrity: true
});

// Clear cache based on compliance rules
await cache.clearByTag('personal_data', {
  reason: 'gdpr_deletion_request',
  auditClearance: true
});
```

## Norwegian Enterprise Features

### NSM Security Classification

```typescript
import { nsmUtils } from './validation/security-validators';

class NSMSecurityHandler {
  classifyData(data: any): NSMClassification {
    // Automatic classification based on content
    if (this.containsPersonalNumbers(data)) {
      return 'RESTRICTED';
    }
    
    if (this.containsGovernmentInfo(data)) {
      return 'CONFIDENTIAL';
    }
    
    if (this.containsSecurityInfo(data)) {
      return 'SECRET';
    }
    
    return 'OPEN';
  }
  
  validateClassificationAccess(
    classification: NSMClassification,
    userClearance: SecurityClearance
  ): boolean {
    const accessMatrix = {
      'OPEN': ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      'RESTRICTED': ['RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      'CONFIDENTIAL': ['CONFIDENTIAL', 'SECRET'],
      'SECRET': ['SECRET']
    };
    
    return accessMatrix[classification].includes(userClearance);
  }
  
  applySecurityLabels(filePath: string, classification: NSMClassification): void {
    const label = this.generateSecurityLabel(classification);
    this.addFileMetadata(filePath, { securityLabel: label });
  }
}
```

### GDPR Compliance Utilities

```typescript
import { gdprUtils } from './validation/gdpr-validators';

class GDPRComplianceManager {
  async processPersonalData(
    data: PersonalData,
    legalBasis: LegalBasis,
    consent?: ConsentRecord
  ): Promise<ProcessingResult> {
    // Validate legal basis
    if (!this.validateLegalBasis(legalBasis, data.dataType)) {
      throw new Error('Invalid legal basis for personal data processing');
    }
    
    // Check consent if required
    if (legalBasis === 'consent' && !consent?.valid) {
      throw new Error('Valid consent required');
    }
    
    // Apply data minimization
    const minimizedData = this.applyDataMinimization(data);
    
    // Log processing activity
    await this.auditLogger.logPersonalDataProcessing({
      dataSubject: data.subjectId,
      dataTypes: data.dataTypes,
      purpose: data.purpose,
      legalBasis,
      timestamp: new Date(),
      retention: this.calculateRetentionPeriod(data.purpose)
    });
    
    return {
      processedData: minimizedData,
      retentionPeriod: this.calculateRetentionPeriod(data.purpose),
      deletionDate: this.calculateDeletionDate(data.purpose)
    };
  }
  
  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    switch (request.type) {
      case 'access':
        return this.handleAccessRequest(request);
      case 'rectification':
        return this.handleRectificationRequest(request);
      case 'erasure':
        return this.handleErasureRequest(request);
      case 'portability':
        return this.handlePortabilityRequest(request);
    }
  }
}
```

### Norwegian Date and Time Utilities

```typescript
import { norwegianDateTime } from './date-time/norwegian-dates';

// Format dates according to Norwegian standards
const norwegianDate = norwegianDateTime.format(new Date(), {
  format: 'long', // "mandag 15. januar 2024"
  locale: 'nb-NO',
  includeTime: true
});

// Parse Norwegian date strings
const parsedDate = norwegianDateTime.parse('15. januar 2024');

// Business day calculations (Norwegian holidays)
const isBusinessDay = norwegianDateTime.isNorwegianBusinessDay(new Date());
const nextBusinessDay = norwegianDateTime.getNextNorwegianBusinessDay(new Date());

// Holiday detection
const holidays = norwegianDateTime.getNorwegianHolidays(2024);
const isHoliday = norwegianDateTime.isNorwegianHoliday(new Date());

// Working hours validation
const isWorkingHours = norwegianDateTime.isNorwegianWorkingHours(new Date(), {
  startHour: 8,
  endHour: 16,
  excludeWeekends: true,
  excludeHolidays: true
});
```

## Testing Utilities

### Test Helpers

```typescript
import { testHelpers } from './testing/test-helpers';

describe('Component Generation', () => {
  beforeEach(async () => {
    // Create temporary test directory
    await testHelpers.createTempDirectory('component-test');
    
    // Setup Norwegian test environment
    await testHelpers.setupNorwegianTestEnvironment({
      locale: 'nb-NO',
      timezone: 'Europe/Oslo',
      compliance: 'nsm'
    });
  });
  
  afterEach(async () => {
    // Cleanup test directory
    await testHelpers.cleanupTempDirectory();
    
    // Clear sensitive test data
    await testHelpers.secureClearTestData();
  });
  
  it('should generate Norwegian compliant component', async () => {
    const component = await generateComponent('TestButton', {
      compliance: 'nsm',
      locale: 'nb-NO'
    });
    
    // Use test helper validations
    expect(testHelpers.validateNorwegianCompliance(component)).toBe(true);
    expect(testHelpers.validateNSMClassification(component)).toBe('RESTRICTED');
    expect(testHelpers.validateAccessibility(component)).toBe(true);
  });
});
```

### Mock Factories

```typescript
import { mockFactories } from './testing/mock-factories';

// Create mock Norwegian user
const mockUser = mockFactories.createNorwegianUser({
  personalNumber: '12345678901',
  securityClearance: 'RESTRICTED',
  bankIdVerified: true
});

// Create mock government organization
const mockOrg = mockFactories.createGovernmentOrganization({
  organizationNumber: '123456789',
  sector: 'healthcare',
  complianceLevel: 'CONFIDENTIAL'
});

// Create mock payment data
const mockPayment = mockFactories.createVippsPayment({
  amount: 29900,
  currency: 'NOK',
  mobileNumber: '+4712345678'
});
```

## Performance Optimization

### Caching Strategies

```typescript
class PerformanceOptimizer {
  private memoryCache = new Map();
  private diskCache = new Map();
  
  async optimizeFileOperations(operations: FileOperation[]): Promise<void> {
    // Batch operations to reduce I/O
    const batches = this.batchOperations(operations, 10);
    
    for (const batch of batches) {
      await Promise.all(batch.map(op => this.executeOperation(op)));
    }
  }
  
  async optimizeNetworkRequests(requests: NetworkRequest[]): Promise<void> {
    // Deduplicate similar requests
    const uniqueRequests = this.deduplicateRequests(requests);
    
    // Execute with connection pooling
    const results = await this.httpClient.batchRequests(uniqueRequests);
    
    // Cache successful responses
    results.forEach(result => {
      if (result.success) {
        this.cache.set(result.key, result.data, { ttl: 300000 });
      }
    });
  }
}
```

### Memory Management

```typescript
class MemoryManager {
  private largeObjectPool = new Set();
  
  trackLargeObject(obj: any): void {
    this.largeObjectPool.add(new WeakRef(obj));
  }
  
  cleanup(): void {
    // Clean up unreferenced objects
    for (const ref of this.largeObjectPool) {
      if (!ref.deref()) {
        this.largeObjectPool.delete(ref);
      }
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
  
  getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    };
  }
}
```

## Security Considerations

### Input Sanitization

```typescript
class SecuritySanitizer {
  sanitizeInput(input: string, context: 'filename' | 'command' | 'sql' | 'html'): string {
    switch (context) {
      case 'filename':
        return this.sanitizeFilename(input);
      case 'command':
        return this.sanitizeCommand(input);
      case 'sql':
        return this.sanitizeSQL(input);
      case 'html':
        return this.sanitizeHTML(input);
      default:
        return this.sanitizeGeneral(input);
    }
  }
  
  private sanitizeFilename(filename: string): string {
    // Remove dangerous characters
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }
  
  validateNorwegianInput(input: string, type: 'personalNumber' | 'orgNumber'): boolean {
    const patterns = {
      personalNumber: /^\d{11}$/,
      orgNumber: /^\d{9}$/
    };
    
    return patterns[type].test(input);
  }
}
```

## Contributing

### Development Guidelines

1. **Follow Norwegian Standards**: Implement Norwegian-specific functionality where applicable
2. **Security First**: Always consider security implications
3. **Performance**: Optimize for both memory and CPU usage
4. **Testing**: Include comprehensive unit and integration tests
5. **Documentation**: Document all public APIs and Norwegian-specific features
6. **Compliance**: Ensure GDPR and NSM compliance where relevant

### Code Standards

```typescript
// Example of well-structured utility function
export async function processNorwegianData<T>(
  data: T,
  options: ProcessingOptions
): Promise<ProcessingResult<T>> {
  // Validate input
  validateInput(data, options);
  
  // Apply Norwegian compliance
  const compliance = await applyNorwegianCompliance(data, options);
  
  // Process data
  const result = await processData(data, compliance);
  
  // Audit logging
  await auditLog(result, options);
  
  return result;
}
```

### Testing Requirements

- Unit tests for all public functions
- Integration tests for complex workflows
- Security tests for sensitive operations
- Performance tests for optimization utilities
- Norwegian compliance validation tests

### Extension Points

The lib module is designed to be extensible:

- Add new validators in `validation/`
- Create new formatters in `formatting/`
- Implement new caching strategies in `cache/`
- Add Norwegian-specific utilities as needed
- Extend cryptographic functions in `crypto/`
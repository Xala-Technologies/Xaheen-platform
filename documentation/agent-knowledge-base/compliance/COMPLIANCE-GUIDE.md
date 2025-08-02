# Xaheen Compliance Guide - Complete Reference

## Table of Contents

1. [Compliance Overview](#compliance-overview)
2. [GDPR Compliance](#gdpr-compliance)
3. [NSM Security Compliance](#nsm-security-compliance)
4. [WCAG Accessibility Compliance](#wcag-accessibility-compliance)
5. [Combined Norwegian Compliance](#combined-norwegian-compliance)
6. [Compliance Implementation](#compliance-implementation)
7. [Audit and Reporting](#audit-and-reporting)
8. [Compliance Validation](#compliance-validation)
9. [Real-World Scenarios](#real-world-scenarios)
10. [Best Practices](#best-practices)

## Compliance Overview

Xaheen provides comprehensive compliance features for Norwegian and EU regulations, ensuring your applications meet all legal and security requirements.

### Compliance Framework

```typescript
interface ComplianceFramework {
  regulations: {
    gdpr: {
      scope: 'European Union + EEA';
      version: '2016/679';
      enforced: '2018-05-25';
      penalties: 'Up to 4% of global turnover';
    };
    
    nsm: {
      scope: 'Norway';
      authority: 'Nasjonal sikkerhetsmyndighet';
      standards: ['Grunnprinsipper', 'Sikkerhetstiltak'];
      classifications: ['OPEN', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL'];
    };
    
    wcag: {
      scope: 'Global';
      version: '2.2';
      levels: ['A', 'AA', 'AAA'];
      requirement: 'AAA for Norwegian public sector';
    };
  };
  
  implementation: {
    automatic: ['code generation', 'validation', 'monitoring'];
    manual: ['risk assessment', 'documentation', 'training'];
    continuous: ['scanning', 'updates', 'reporting'];
  };
  
  certification: {
    selfAssessment: true;
    thirdPartyAudit: 'recommended';
    continuousCompliance: 'required';
  };
}
```

### Compliance Levels

```typescript
enum ComplianceLevel {
  BASIC = 'basic',        // Minimum legal requirements
  STANDARD = 'standard',  // Recommended practices
  STRICT = 'strict',      // Maximum protection
  CUSTOM = 'custom',      // Organization-specific
}

interface ComplianceProfile {
  level: ComplianceLevel;
  regulations: string[];
  features: {
    dataProtection: boolean;
    encryption: boolean;
    auditLogging: boolean;
    accessControl: boolean;
    consentManagement: boolean;
    dataPortability: boolean;
    rightToErasure: boolean;
  };
}
```

## GDPR Compliance

### Overview

The General Data Protection Regulation (GDPR) governs how personal data is collected, processed, and stored.

### Key Requirements

```typescript
interface GDPRRequirements {
  // Lawful basis for processing
  legalBasis: {
    consent: 'Explicit, informed consent';
    contract: 'Necessary for contract';
    legalObligation: 'Required by law';
    vitalInterests: 'Protect life';
    publicTask: 'Public interest';
    legitimateInterests: 'Balanced against rights';
  };
  
  // Data subject rights
  rights: {
    access: 'Right to access personal data';
    rectification: 'Right to correct data';
    erasure: 'Right to be forgotten';
    portability: 'Right to data transfer';
    restriction: 'Right to limit processing';
    objection: 'Right to object';
    automatedDecision: 'Right to human review';
  };
  
  // Technical measures
  technical: {
    encryption: 'Data must be encrypted';
    pseudonymization: 'Replace identifiers';
    minimization: 'Collect minimum data';
    accuracy: 'Keep data accurate';
    retention: 'Delete when not needed';
    security: 'Appropriate security measures';
  };
}
```

### Implementation

#### 1. Consent Management

```typescript
// lib/compliance/gdpr/consent.ts
export class ConsentManager {
  async requestConsent(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<ConsentRecord> {
    const consent = await db.consent.create({
      data: {
        userId,
        purpose: purpose.type,
        description: purpose.description,
        version: purpose.version,
        timestamp: new Date(),
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
      },
    });
    
    // Audit log
    await auditLog.record({
      action: 'consent_requested',
      userId,
      purpose: purpose.type,
      timestamp: new Date(),
    });
    
    return consent;
  }
  
  async withdrawConsent(
    userId: string,
    consentId: string
  ): Promise<void> {
    await db.consent.update({
      where: { id: consentId },
      data: {
        withdrawn: true,
        withdrawnAt: new Date(),
      },
    });
    
    // Trigger data deletion if required
    await this.handleConsentWithdrawal(userId, consentId);
  }
  
  async getActiveConsents(userId: string): Promise<ConsentRecord[]> {
    return await db.consent.findMany({
      where: {
        userId,
        withdrawn: false,
        expiresAt: { gt: new Date() },
      },
    });
  }
  
  async hasValidConsent(
    userId: string,
    purpose: string
  ): Promise<boolean> {
    const consent = await db.consent.findFirst({
      where: {
        userId,
        purpose,
        withdrawn: false,
        expiresAt: { gt: new Date() },
      },
    });
    
    return !!consent;
  }
}
```

#### 2. Data Protection

```typescript
// lib/compliance/gdpr/data-protection.ts
export class DataProtection {
  // Encryption for personal data
  encryptPersonalData(data: any): EncryptedData {
    const key = this.getDerivedKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);
    
    return {
      data: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      algorithm: 'aes-256-gcm',
    };
  }
  
  // Pseudonymization
  pseudonymize(data: PersonalData): PseudonymizedData {
    const mapping = new Map<string, string>();
    
    // Replace identifiers with pseudonyms
    const pseudonymized = {
      ...data,
      id: this.generatePseudonym(data.id),
      email: this.generatePseudonym(data.email),
      personalNumber: data.personalNumber ? 
        this.generatePseudonym(data.personalNumber) : undefined,
    };
    
    // Store mapping securely
    this.storePseudonymMapping(mapping);
    
    return pseudonymized;
  }
  
  // Data minimization
  minimizeData<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): Partial<T> {
    const minimized: Partial<T> = {};
    
    requiredFields.forEach(field => {
      if (data[field] !== undefined) {
        minimized[field] = data[field];
      }
    });
    
    return minimized;
  }
}
```

#### 3. Right to Erasure

```typescript
// lib/compliance/gdpr/erasure.ts
export class DataErasure {
  async eraseUserData(
    userId: string,
    reason: string
  ): Promise<ErasureReport> {
    const report: ErasureReport = {
      userId,
      reason,
      timestamp: new Date(),
      erasedData: [],
      retainedData: [],
    };
    
    try {
      // Start transaction
      await db.$transaction(async (tx) => {
        // Erase personal data
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            email: `erased-${userId}@example.com`,
            name: 'Erased User',
            personalNumber: null,
            phoneNumber: null,
            address: null,
            deletedAt: new Date(),
          },
        });
        report.erasedData.push('user_profile');
        
        // Erase related data
        await tx.userActivity.deleteMany({
          where: { userId },
        });
        report.erasedData.push('user_activity');
        
        // Anonymize data that must be retained
        await tx.order.updateMany({
          where: { userId },
          data: {
            userId: null,
            customerName: 'Anonymous',
            customerEmail: 'anonymous@example.com',
          },
        });
        report.retainedData.push('orders (anonymized)');
        
        // Create erasure record
        await tx.erasureLog.create({
          data: {
            userId,
            reason,
            report: report,
            performedBy: getCurrentUserId(),
          },
        });
      });
      
      // Notify user
      await this.notifyUserOfErasure(userId, report);
      
      return report;
    } catch (error) {
      report.error = error.message;
      throw error;
    }
  }
  
  async scheduleErasure(
    userId: string,
    date: Date
  ): Promise<void> {
    await db.erasureSchedule.create({
      data: {
        userId,
        scheduledFor: date,
        status: 'pending',
      },
    });
  }
}
```

#### 4. Data Portability

```typescript
// lib/compliance/gdpr/portability.ts
export class DataPortability {
  async exportUserData(
    userId: string,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<ExportedData> {
    // Collect all user data
    const userData = await this.collectUserData(userId);
    
    // Format data
    const formatted = await this.formatData(userData, format);
    
    // Create secure download
    const download = await this.createSecureDownload(formatted, {
      userId,
      format,
      encryption: true,
      expiry: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Audit log
    await auditLog.record({
      action: 'data_export',
      userId,
      format,
      timestamp: new Date(),
    });
    
    return download;
  }
  
  private async collectUserData(userId: string): Promise<UserData> {
    const [user, activities, orders, consents] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.userActivity.findMany({ where: { userId } }),
      db.order.findMany({ where: { userId } }),
      db.consent.findMany({ where: { userId } }),
    ]);
    
    return {
      profile: this.sanitizeUserProfile(user),
      activities: activities.map(a => this.sanitizeActivity(a)),
      orders: orders.map(o => this.sanitizeOrder(o)),
      consents: consents.map(c => this.sanitizeConsent(c)),
      exportMetadata: {
        exportDate: new Date(),
        dataSubject: userId,
        format: 'GDPR Article 20 compliant',
      },
    };
  }
}
```

### GDPR Components

```tsx
// components/compliance/GDPRConsentBanner.tsx
export function GDPRConsentBanner() {
  const [show, setShow] = useState(true);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false,
  });
  
  const handleAcceptAll = async () => {
    await consentManager.grantAllConsents();
    setShow(false);
  };
  
  const handleAcceptSelected = async () => {
    await consentManager.grantSelectedConsents(preferences);
    setShow(false);
  };
  
  const handleRejectAll = async () => {
    await consentManager.rejectOptionalConsents();
    setShow(false);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t p-6 z-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-4">
          Vi respekterer ditt personvern
        </h2>
        
        <p className="text-gray-700 mb-6">
          Vi bruker informasjonskapsler for å gi deg en bedre opplevelse. 
          Du kan velge hvilke typer informasjonskapsler du vil godta.
        </p>
        
        <div className="space-y-4 mb-6">
          <ConsentToggle
            label="Nødvendige"
            description="Kreves for at nettsiden skal fungere"
            checked={true}
            disabled={true}
          />
          
          <ConsentToggle
            label="Analyse"
            description="Hjelper oss å forstå hvordan du bruker nettsiden"
            checked={preferences.analytics}
            onChange={(checked) => 
              setPreferences(prev => ({ ...prev, analytics: checked }))
            }
          />
          
          <ConsentToggle
            label="Markedsføring"
            description="Brukes for målrettet annonsering"
            checked={preferences.marketing}
            onChange={(checked) => 
              setPreferences(prev => ({ ...prev, marketing: checked }))
            }
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleAcceptAll}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Godta alle
          </button>
          
          <button
            onClick={handleAcceptSelected}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg"
          >
            Godta valgte
          </button>
          
          <button
            onClick={handleRejectAll}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            Avvis alle unntatt nødvendige
          </button>
          
          <a
            href="/privacy"
            className="ml-auto px-6 py-3 text-blue-600 hover:underline"
          >
            Les personvernerklæringen
          </a>
        </div>
      </div>
    </div>
  );
}
```

## NSM Security Compliance

### Overview

Nasjonal sikkerhetsmyndighet (NSM) provides security guidelines for Norwegian organizations handling sensitive information.

### Security Classifications

```typescript
enum NSMClassification {
  OPEN = 'OPEN',               // Offentlig informasjon
  INTERNAL = 'INTERNAL',       // Intern informasjon
  RESTRICTED = 'RESTRICTED',   // Begrenset informasjon
  CONFIDENTIAL = 'CONFIDENTIAL' // Konfidensiell informasjon
}

interface NSMSecurityRequirements {
  [NSMClassification.OPEN]: {
    encryption: 'optional';
    accessControl: 'basic';
    auditLog: 'recommended';
    storage: 'any';
  };
  
  [NSMClassification.INTERNAL]: {
    encryption: 'required-in-transit';
    accessControl: 'authentication-required';
    auditLog: 'required';
    storage: 'secure';
  };
  
  [NSMClassification.RESTRICTED]: {
    encryption: 'required-always';
    accessControl: 'role-based';
    auditLog: 'comprehensive';
    storage: 'encrypted';
    network: 'segmented';
  };
  
  [NSMClassification.CONFIDENTIAL]: {
    encryption: 'double-encrypted';
    accessControl: 'multi-factor';
    auditLog: 'real-time-monitoring';
    storage: 'hsm-protected';
    network: 'air-gapped';
    physical: 'secured-facility';
  };
}
```

### Implementation

#### 1. Security Classification

```typescript
// lib/compliance/nsm/classification.ts
export class SecurityClassification {
  classifyData(data: any): NSMClassification {
    // Check for personal identifiers
    if (this.containsPersonalNumber(data) || 
        this.containsSensitiveHealth(data)) {
      return NSMClassification.CONFIDENTIAL;
    }
    
    // Check for financial data
    if (this.containsFinancialData(data) ||
        this.containsBusinessSecrets(data)) {
      return NSMClassification.RESTRICTED;
    }
    
    // Check for internal data
    if (this.containsInternalData(data)) {
      return NSMClassification.INTERNAL;
    }
    
    return NSMClassification.OPEN;
  }
  
  applySecurityControls(
    data: any,
    classification: NSMClassification
  ): SecuredData {
    const requirements = NSMSecurityRequirements[classification];
    
    let secured = data;
    
    // Apply encryption
    if (requirements.encryption !== 'optional') {
      secured = this.encrypt(secured, classification);
    }
    
    // Apply access controls
    secured = this.applyAccessControl(secured, requirements.accessControl);
    
    // Add classification metadata
    secured.__classification = classification;
    secured.__classifiedAt = new Date();
    secured.__classifiedBy = getCurrentUserId();
    
    return secured;
  }
  
  validateAccess(
    user: User,
    classification: NSMClassification
  ): boolean {
    // Check user clearance
    const clearance = this.getUserClearance(user);
    
    // Compare clearance with classification
    const clearanceLevels = [
      NSMClassification.OPEN,
      NSMClassification.INTERNAL,
      NSMClassification.RESTRICTED,
      NSMClassification.CONFIDENTIAL,
    ];
    
    const requiredLevel = clearanceLevels.indexOf(classification);
    const userLevel = clearanceLevels.indexOf(clearance);
    
    return userLevel >= requiredLevel;
  }
}
```

#### 2. Encryption Implementation

```typescript
// lib/compliance/nsm/encryption.ts
export class NSMEncryption {
  private readonly algorithms = {
    [NSMClassification.INTERNAL]: 'aes-128-gcm',
    [NSMClassification.RESTRICTED]: 'aes-256-gcm',
    [NSMClassification.CONFIDENTIAL]: 'aes-256-gcm', // Double encrypted
  };
  
  async encrypt(
    data: any,
    classification: NSMClassification
  ): Promise<EncryptedData> {
    const algorithm = this.algorithms[classification];
    
    if (!algorithm) {
      return data; // OPEN classification
    }
    
    // Generate key from HSM or KMS
    const key = await this.getEncryptionKey(classification);
    
    // Encrypt data
    const encrypted = await this.performEncryption(data, key, algorithm);
    
    // For CONFIDENTIAL, apply second layer
    if (classification === NSMClassification.CONFIDENTIAL) {
      const secondKey = await this.getSecondaryKey();
      return await this.performEncryption(encrypted, secondKey, algorithm);
    }
    
    return encrypted;
  }
  
  async decrypt(
    encryptedData: EncryptedData,
    classification: NSMClassification
  ): Promise<any> {
    // Verify user has clearance
    if (!this.hasDecryptionRights(classification)) {
      throw new Error('Insufficient clearance for decryption');
    }
    
    // Audit decryption attempt
    await this.auditDecryption(encryptedData, classification);
    
    // Perform decryption
    let decrypted = encryptedData;
    
    if (classification === NSMClassification.CONFIDENTIAL) {
      const secondKey = await this.getSecondaryKey();
      decrypted = await this.performDecryption(decrypted, secondKey);
    }
    
    const key = await this.getEncryptionKey(classification);
    return await this.performDecryption(decrypted, key);
  }
}
```

#### 3. Audit Logging

```typescript
// lib/compliance/nsm/audit.ts
export class NSMAuditLogger {
  private readonly logLevels = {
    [NSMClassification.OPEN]: ['access'],
    [NSMClassification.INTERNAL]: ['access', 'modification'],
    [NSMClassification.RESTRICTED]: ['access', 'modification', 'export'],
    [NSMClassification.CONFIDENTIAL]: ['all'],
  };
  
  async log(event: SecurityEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getSessionId(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      classification: event.dataClassification,
    };
    
    // Store in secure audit log
    await this.storeAuditLog(enrichedEvent);
    
    // Real-time monitoring for high classifications
    if (event.dataClassification === NSMClassification.CONFIDENTIAL ||
        event.dataClassification === NSMClassification.RESTRICTED) {
      await this.sendToMonitoring(enrichedEvent);
    }
    
    // Alert on suspicious activity
    if (await this.isSuspicious(enrichedEvent)) {
      await this.alertSecurityTeam(enrichedEvent);
    }
  }
  
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<NSMComplianceReport> {
    const logs = await this.getAuditLogs(startDate, endDate);
    
    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: logs.length,
        byClassification: this.groupByClassification(logs),
        byEventType: this.groupByEventType(logs),
        suspiciousActivities: this.findSuspiciousActivities(logs),
      },
      compliance: {
        encryptionCompliance: await this.checkEncryptionCompliance(logs),
        accessControlCompliance: await this.checkAccessCompliance(logs),
        auditLogCompliance: await this.checkAuditCompliance(logs),
      },
      recommendations: await this.generateRecommendations(logs),
    };
  }
}
```

### NSM Components

```tsx
// components/compliance/NSMClassificationBadge.tsx
export function NSMClassificationBadge({ 
  classification 
}: { 
  classification: NSMClassification 
}) {
  const colors = {
    [NSMClassification.OPEN]: 'bg-green-100 text-green-800 border-green-300',
    [NSMClassification.INTERNAL]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [NSMClassification.RESTRICTED]: 'bg-orange-100 text-orange-800 border-orange-300',
    [NSMClassification.CONFIDENTIAL]: 'bg-red-100 text-red-800 border-red-300',
  };
  
  const labels = {
    [NSMClassification.OPEN]: 'Åpen',
    [NSMClassification.INTERNAL]: 'Intern',
    [NSMClassification.RESTRICTED]: 'Begrenset',
    [NSMClassification.CONFIDENTIAL]: 'Konfidensiell',
  };
  
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[classification]}`}
      role="status"
      aria-label={`Sikkerhetsklassifisering: ${labels[classification]}`}
    >
      <Shield className="w-4 h-4 mr-1" />
      {labels[classification]}
    </span>
  );
}
```

## WCAG Accessibility Compliance

### Overview

Web Content Accessibility Guidelines (WCAG) 2.2 Level AAA compliance ensures maximum accessibility for all users.

### WCAG Principles

```typescript
interface WCAGPrinciples {
  perceivable: {
    'text-alternatives': 'Provide text for non-text content';
    'captions': 'Provide captions and transcripts';
    'contrast': 'Sufficient color contrast';
    'resize-text': 'Text can be resized up to 200%';
  };
  
  operable: {
    'keyboard': 'All functionality via keyboard';
    'no-seizures': 'No content causes seizures';
    'time-limits': 'Users have enough time';
    'navigation': 'Multiple ways to find pages';
  };
  
  understandable: {
    'readable': 'Text is readable and understandable';
    'predictable': 'Web pages appear and operate predictably';
    'input-assistance': 'Help users avoid and correct mistakes';
  };
  
  robust: {
    'compatible': 'Compatible with assistive technologies';
    'valid-code': 'Well-formed, valid code';
  };
}
```

### Implementation

#### 1. Accessibility Validator

```typescript
// lib/compliance/wcag/validator.ts
import axe from 'axe-core';

export class WCAGValidator {
  async validateComponent(
    element: HTMLElement
  ): Promise<ValidationResult> {
    const results = await axe.run(element, {
      rules: {
        'color-contrast': { enabled: true },
        'aria-roles': { enabled: true },
        'label': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
      resultTypes: ['violations', 'incomplete'],
    });
    
    return {
      violations: results.violations,
      incomplete: results.incomplete,
      score: this.calculateScore(results),
      level: this.determineLevel(results),
    };
  }
  
  async validateColorContrast(
    foreground: string,
    background: string,
    fontSize: number,
    fontWeight: number
  ): Promise<ContrastResult> {
    const ratio = this.getContrastRatio(foreground, background);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
    
    const requirements = {
      AA: isLargeText ? 3 : 4.5,
      AAA: isLargeText ? 4.5 : 7,
    };
    
    return {
      ratio,
      passes: {
        AA: ratio >= requirements.AA,
        AAA: ratio >= requirements.AAA,
      },
      recommendation: this.getContrastRecommendation(ratio, requirements),
    };
  }
  
  validateKeyboardNavigation(
    component: HTMLElement
  ): KeyboardNavigationResult {
    const issues: string[] = [];
    
    // Check for keyboard traps
    const focusableElements = component.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );
    
    focusableElements.forEach((element) => {
      // Check tabindex
      const tabindex = element.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push(`Positive tabindex found on ${element.tagName}`);
      }
      
      // Check for click handlers without keyboard handlers
      if (element.hasAttribute('onclick') && 
          !element.hasAttribute('onkeydown') &&
          !element.hasAttribute('onkeyup') &&
          !element.hasAttribute('onkeypress')) {
        issues.push(`Click handler without keyboard handler on ${element.tagName}`);
      }
    });
    
    // Check focus indicators
    const focusVisible = this.checkFocusIndicators(component);
    
    return {
      issues,
      focusVisible,
      tabOrder: this.getTabOrder(focusableElements),
      skipLinks: this.checkSkipLinks(component),
    };
  }
}
```

#### 2. Accessibility Hooks

```typescript
// hooks/useAccessibility.ts
export function useAccessibility(componentName: string) {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [focusTrapActive, setFocusTrapActive] = useState(false);
  
  // Live region announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, { message, priority, timestamp: Date.now() }]);
  }, []);
  
  // Focus management
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    setFocusTrapActive(true);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      setFocusTrapActive(false);
    };
  }, []);
  
  // Reduced motion
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // High contrast
  const prefersHighContrast = usePrefersHighContrast();
  
  // Screen reader detection
  const screenReaderActive = useScreenReaderDetection();
  
  return {
    announce,
    trapFocus,
    prefersReducedMotion,
    prefersHighContrast,
    screenReaderActive,
    focusTrapActive,
    announcements,
  };
}
```

#### 3. Accessible Components

```tsx
// components/accessibility/AccessibleForm.tsx
export function AccessibleForm({ 
  children, 
  onSubmit,
  validationErrors 
}: AccessibleFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { announce } = useAccessibility('Form');
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Announce errors to screen readers
  useEffect(() => {
    const errorMessages = Object.values(errors).filter(Boolean);
    if (errorMessages.length > 0) {
      announce(
        `Det er ${errorMessages.length} feil i skjemaet som må rettes.`,
        'assertive'
      );
    }
  }, [errors, announce]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(formRef.current!);
    const validation = await validateForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Focus first error
      const firstErrorField = formRef.current?.querySelector(
        `[aria-invalid="true"]`
      ) as HTMLElement;
      firstErrorField?.focus();
      
      return;
    }
    
    await onSubmit(formData);
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Hovedskjema"
    >
      <div role="group" aria-describedby="form-instructions">
        <p id="form-instructions" className="sr-only">
          Fyll ut alle obligatoriske felt markert med stjerne.
        </p>
        
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          // Enhance form fields with accessibility
          return React.cloneElement(child, {
            'aria-invalid': !!errors[child.props.name],
            'aria-describedby': errors[child.props.name] 
              ? `${child.props.name}-error` 
              : undefined,
          });
        })}
      </div>
      
      {/* Error summary */}
      {Object.keys(errors).length > 0 && (
        <div 
          role="alert" 
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Feil i skjemaet
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a 
                  href={`#${field}`}
                  className="text-red-700 underline hover:text-red-900"
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        type="submit"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send inn skjema
      </button>
    </form>
  );
}
```

## Combined Norwegian Compliance

### Unified Compliance Framework

```typescript
// lib/compliance/norwegian/unified.ts
export class NorwegianCompliance {
  private gdpr: GDPRCompliance;
  private nsm: NSMCompliance;
  private wcag: WCAGCompliance;
  
  constructor() {
    this.gdpr = new GDPRCompliance();
    this.nsm = new NSMCompliance();
    this.wcag = new WCAGCompliance();
  }
  
  async validateCompliance(
    target: ComplianceTarget
  ): Promise<ComplianceResult> {
    const [gdprResult, nsmResult, wcagResult] = await Promise.all([
      this.gdpr.validate(target),
      this.nsm.validate(target),
      this.wcag.validate(target),
    ]);
    
    return {
      gdpr: gdprResult,
      nsm: nsmResult,
      wcag: wcagResult,
      overall: this.calculateOverallCompliance(gdprResult, nsmResult, wcagResult),
      recommendations: this.generateRecommendations(gdprResult, nsmResult, wcagResult),
      certificationReady: this.isCertificationReady(gdprResult, nsmResult, wcagResult),
    };
  }
  
  async generateComplianceReport(
    projectId: string,
    options: ReportOptions
  ): Promise<ComplianceReport> {
    const project = await this.loadProject(projectId);
    const validation = await this.validateCompliance(project);
    
    const report: ComplianceReport = {
      projectId,
      projectName: project.name,
      generatedAt: new Date(),
      summary: {
        overallScore: validation.overall.score,
        gdprCompliant: validation.gdpr.isCompliant,
        nsmCompliant: validation.nsm.isCompliant,
        wcagCompliant: validation.wcag.isCompliant,
      },
      details: {
        gdpr: this.formatGDPRDetails(validation.gdpr),
        nsm: this.formatNSMDetails(validation.nsm),
        wcag: this.formatWCAGDetails(validation.wcag),
      },
      actionItems: this.prioritizeActionItems(validation.recommendations),
      timeline: this.generateComplianceTimeline(validation),
    };
    
    // Generate PDF if requested
    if (options.format === 'pdf') {
      report.pdf = await this.generatePDFReport(report);
    }
    
    return report;
  }
}
```

### Compliance Dashboard

```tsx
// components/compliance/ComplianceDashboard.tsx
export function ComplianceDashboard({ projectId }: { projectId: string }) {
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadComplianceStatus();
  }, [projectId]);
  
  const loadComplianceStatus = async () => {
    try {
      const status = await norwegianCompliance.getStatus(projectId);
      setCompliance(status);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (!compliance) return <ErrorMessage />;
  
  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Compliance Score</h2>
        <div className="flex items-center justify-center">
          <CircularProgress
            value={compliance.overall.score}
            size={200}
            strokeWidth={20}
            color={getScoreColor(compliance.overall.score)}
          >
            <span className="text-4xl font-bold">
              {compliance.overall.score}%
            </span>
          </CircularProgress>
        </div>
      </div>
      
      {/* Individual Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComplianceCard
          title="GDPR Compliance"
          status={compliance.gdpr}
          icon={<Shield className="w-6 h-6" />}
        />
        
        <ComplianceCard
          title="NSM Security"
          status={compliance.nsm}
          icon={<Lock className="w-6 h-6" />}
        />
        
        <ComplianceCard
          title="WCAG Accessibility"
          status={compliance.wcag}
          icon={<Eye className="w-6 h-6" />}
        />
      </div>
      
      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Action Items</h3>
        <ActionItemsList items={compliance.actionItems} />
      </div>
      
      {/* Compliance Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Compliance Timeline</h3>
        <ComplianceTimeline events={compliance.timeline} />
      </div>
    </div>
  );
}
```

## Compliance Implementation

### 1. Project Setup

```bash
# Initialize project with full compliance
xaheen init my-app \
  --compliance=gdpr,nsm,wcag \
  --security-level=restricted \
  --audit-log=comprehensive
```

### 2. Component Generation

```bash
# Generate compliant component
xaheen component UserProfile \
  name:string \
  email:string \
  personalNumber:string? \
  --compliance=gdpr,nsm \
  --security-level=confidential \
  --audit-log
```

### 3. Page Generation

```bash
# Generate compliant page
xaheen page Dashboard \
  --auth=bankid \
  --compliance=full \
  --accessibility=aaa
```

## Audit and Reporting

### Audit Trail Implementation

```typescript
// lib/compliance/audit/trail.ts
export class AuditTrail {
  async record(event: AuditEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      id: generateUUID(),
      timestamp: new Date(),
      environment: {
        userId: getCurrentUserId(),
        sessionId: getSessionId(),
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
      },
      compliance: {
        gdprRelevant: this.isGDPRRelevant(event),
        nsmClassification: this.getNSMClassification(event),
        wcagImpact: this.getWCAGImpact(event),
      },
    };
    
    // Store in immutable audit log
    await this.storeAuditEvent(enrichedEvent);
    
    // Real-time analysis
    await this.analyzeEvent(enrichedEvent);
  }
  
  async query(criteria: AuditQueryCriteria): Promise<AuditEvent[]> {
    // Validate query permissions
    await this.validateQueryPermissions(criteria);
    
    // Execute query
    const events = await this.executeQuery(criteria);
    
    // Filter based on user clearance
    return this.filterByClearance(events);
  }
  
  async generateReport(
    startDate: Date,
    endDate: Date,
    options: ReportOptions
  ): Promise<AuditReport> {
    const events = await this.query({
      startDate,
      endDate,
      includeAll: true,
    });
    
    return {
      period: { start: startDate, end: endDate },
      summary: this.summarizeEvents(events),
      compliance: this.analyzeCompliance(events),
      security: this.analyzeSecurityEvents(events),
      recommendations: this.generateRecommendations(events),
    };
  }
}
```

## Compliance Validation

### Automated Validation

```typescript
// lib/compliance/validation/automated.ts
export class AutomatedComplianceValidator {
  async validateProject(projectPath: string): Promise<ValidationReport> {
    const validators = [
      new GDPRValidator(),
      new NSMValidator(),
      new WCAGValidator(),
    ];
    
    const results = await Promise.all(
      validators.map(v => v.validateDirectory(projectPath))
    );
    
    return {
      timestamp: new Date(),
      projectPath,
      results: {
        gdpr: results[0],
        nsm: results[1],
        wcag: results[2],
      },
      passed: results.every(r => r.passed),
      score: this.calculateScore(results),
      issues: this.consolidateIssues(results),
      fixes: this.suggestFixes(results),
    };
  }
  
  async validateComponent(
    componentPath: string
  ): Promise<ComponentValidation> {
    const code = await fs.readFile(componentPath, 'utf-8');
    const ast = parseTypeScript(code);
    
    const issues: ComplianceIssue[] = [];
    
    // Check for personal data handling
    if (this.handlesPersonalData(ast)) {
      issues.push(...await this.validateGDPRCompliance(ast));
    }
    
    // Check security classification
    const classification = this.extractSecurityClassification(ast);
    if (classification) {
      issues.push(...await this.validateNSMCompliance(ast, classification));
    }
    
    // Check accessibility
    issues.push(...await this.validateWCAGCompliance(ast));
    
    return {
      component: componentPath,
      issues,
      suggestions: this.generateSuggestions(issues),
      autoFixAvailable: this.canAutoFix(issues),
    };
  }
}
```

## Real-World Scenarios

### 1. E-commerce Platform

```typescript
// Compliance requirements for Norwegian e-commerce
const ecommerceCompliance = {
  gdpr: {
    consentTypes: ['cookies', 'marketing', 'analytics'],
    dataRetention: {
      orders: 5 * 365, // 5 years for accounting
      customerData: 3 * 365, // 3 years
      marketingData: 365, // 1 year
    },
    rightsImplementation: [
      'data-export',
      'data-deletion',
      'consent-withdrawal',
      'data-correction',
    ],
  },
  
  nsm: {
    paymentData: NSMClassification.CONFIDENTIAL,
    customerData: NSMClassification.RESTRICTED,
    productData: NSMClassification.INTERNAL,
    publicContent: NSMClassification.OPEN,
  },
  
  wcag: {
    level: 'AA', // Minimum for commercial
    criticalPaths: [
      'product-search',
      'add-to-cart',
      'checkout',
      'payment',
    ],
  },
};
```

### 2. Government Service Portal

```typescript
// Compliance for government services
const governmentCompliance = {
  gdpr: {
    legalBasis: 'legal_obligation',
    dataMinimization: 'strict',
    encryption: 'required-always',
    auditLog: 'comprehensive',
  },
  
  nsm: {
    defaultClassification: NSMClassification.RESTRICTED,
    authentication: 'bankid-required',
    dataResidency: 'norway-only',
    networkSegmentation: 'required',
  },
  
  wcag: {
    level: 'AAA', // Required for public sector
    languages: ['nb', 'nn', 'en'],
    features: [
      'screen-reader-optimized',
      'keyboard-only-navigation',
      'high-contrast-mode',
      'text-resize-200',
    ],
  },
};
```

### 3. Healthcare Application

```typescript
// Healthcare compliance requirements
const healthcareCompliance = {
  gdpr: {
    specialCategory: 'health-data',
    explicitConsent: 'required',
    purposeLimitation: 'strict',
    encryption: 'end-to-end',
    accessControl: 'role-based-strict',
  },
  
  nsm: {
    classification: NSMClassification.CONFIDENTIAL,
    authentication: 'multi-factor',
    dataIsolation: 'patient-level',
    auditLog: 'real-time-monitoring',
  },
  
  wcag: {
    level: 'AAA',
    elderlyOptimized: true,
    features: [
      'large-touch-targets',
      'simple-navigation',
      'clear-language',
      'error-prevention',
    ],
  },
};
```

## Best Practices

### 1. Compliance-First Development

```typescript
// Start with compliance requirements
const projectCompliance = defineComplianceRequirements({
  dataTypes: ['personal', 'financial', 'health'],
  userBase: ['norwegian', 'eu'],
  industry: 'healthcare',
  integrations: ['bankid', 'helsenorge'],
});

// Generate compliant scaffold
await xaheen.init({
  name: 'healthcare-app',
  compliance: projectCompliance,
  template: 'compliant-healthcare',
});
```

### 2. Continuous Compliance Monitoring

```typescript
// CI/CD pipeline integration
export async function compliancePipeline() {
  // Pre-commit hooks
  await runComplianceChecks({
    gdpr: ['data-classification', 'consent-validation'],
    nsm: ['security-classification', 'encryption-check'],
    wcag: ['contrast-ratio', 'aria-labels'],
  });
  
  // Build-time validation
  await validateCompliance({
    failOnError: true,
    generateReport: true,
    autoFix: true,
  });
  
  // Runtime monitoring
  await setupComplianceMonitoring({
    realTime: true,
    alerts: ['email', 'slack'],
    dashboard: true,
  });
}
```

### 3. Documentation and Training

```typescript
// Auto-generate compliance documentation
await generateComplianceDocs({
  includeGuides: true,
  includeChecklists: true,
  includeTemplates: true,
  languages: ['nb', 'en'],
  format: ['html', 'pdf'],
});

// Training materials
await createTrainingMaterials({
  topics: ['gdpr-basics', 'nsm-security', 'wcag-accessibility'],
  roles: ['developer', 'designer', 'product-owner'],
  format: ['video', 'interactive', 'quiz'],
});
```

### 4. Incident Response

```typescript
// Compliance incident handling
export class ComplianceIncidentHandler {
  async handleDataBreach(breach: DataBreach): Promise<void> {
    // 1. Contain the breach
    await this.containBreach(breach);
    
    // 2. Assess impact
    const impact = await this.assessImpact(breach);
    
    // 3. Notify authorities (within 72 hours)
    if (impact.requiresNotification) {
      await this.notifyDataProtectionAuthority(breach);
      await this.notifyAffectedUsers(breach);
    }
    
    // 4. Document everything
    await this.documentIncident(breach);
    
    // 5. Implement improvements
    await this.implementCorrectiveMeasures(breach);
  }
}
```

---

> **For Agents**: This compliance guide provides comprehensive coverage of GDPR, NSM, and WCAG requirements in the Xaheen platform. Always prioritize compliance when generating code or making architectural decisions. Use the provided implementations and components as templates for compliant development. Remember that compliance is not optional—it's a fundamental requirement for all Norwegian and EU applications.

## Advanced Compliance Patterns

### Multi-Tenant Compliance

```typescript
// lib/compliance/multi-tenant.ts
export class MultiTenantCompliance {
  // Tenant-specific compliance configuration
  async configureTenantCompliance(
    tenantId: string,
    requirements: TenantComplianceRequirements
  ): Promise<void> {
    const config = {
      tenantId,
      gdpr: {
        dataResidency: requirements.dataResidency || 'eu-west',
        retentionPolicies: requirements.customRetention || defaultRetention,
        consentWorkflow: requirements.consentWorkflow || 'standard',
      },
      nsm: {
        defaultClassification: requirements.securityLevel || NSMClassification.INTERNAL,
        encryptionLevel: requirements.encryptionRequirements || 'standard',
        auditRetention: requirements.auditRetention || '3-years',
      },
      wcag: {
        targetLevel: requirements.accessibilityLevel || 'AA',
        customizations: requirements.accessibilityCustomizations || {},
      },
    };
    
    await this.saveTenantConfig(tenantId, config);
    await this.applyTenantPolicies(tenantId, config);
  }
  
  // Tenant data isolation
  async isolateTenantData(tenantId: string): Promise<void> {
    // Create isolated database schema
    await db.$executeRaw`CREATE SCHEMA IF NOT EXISTS tenant_${tenantId}`;
    
    // Apply row-level security
    await db.$executeRaw`
      ALTER TABLE tenant_${tenantId}.users 
      ENABLE ROW LEVEL SECURITY;
    `;
    
    // Create tenant-specific encryption keys
    await this.createTenantEncryptionKeys(tenantId);
  }
}
```

### Cross-Border Compliance

```typescript
// lib/compliance/cross-border.ts
export class CrossBorderCompliance {
  private regulations = {
    norway: ['GDPR', 'NSM', 'Datatilsynet'],
    eu: ['GDPR', 'eIDAS', 'NIS2'],
    uk: ['UK-GDPR', 'DPA-2018'],
    switzerland: ['nFADP', 'DSG'],
  };
  
  async validateCrossBorderTransfer(
    fromCountry: string,
    toCountry: string,
    dataType: string
  ): Promise<TransferValidation> {
    const fromRegs = this.regulations[fromCountry];
    const toRegs = this.regulations[toCountry];
    
    // Check adequacy decisions
    const hasAdequacy = await this.checkAdequacyDecision(fromCountry, toCountry);
    
    if (!hasAdequacy) {
      // Need additional safeguards
      return {
        allowed: false,
        requirements: [
          'Standard Contractual Clauses (SCCs)',
          'Binding Corporate Rules (BCRs)',
          'Explicit consent for transfer',
        ],
        dataLocalisation: this.getLocalisationRequirements(fromCountry, dataType),
      };
    }
    
    return {
      allowed: true,
      requirements: ['Transfer impact assessment'],
      notifications: this.getNotificationRequirements(fromCountry, toCountry),
    };
  }
}
```

### Industry-Specific Compliance

```typescript
// lib/compliance/industry/financial.ts
export class FinancialServicesCompliance {
  // PSD2 compliance for payment services
  async implementPSD2Compliance(): Promise<void> {
    // Strong Customer Authentication (SCA)
    const scaImplementation = {
      authenticationFactors: [
        'knowledge', // Something the user knows
        'possession', // Something the user has
        'inherence', // Something the user is
      ],
      dynamicLinking: true,
      exemptions: ['low-value', 'trusted-beneficiary', 'recurring'],
    };
    
    // Open Banking API compliance
    const openBankingAPIs = {
      accountInformation: '/v2/accounts',
      paymentInitiation: '/v2/payments',
      fundsConfirmation: '/v2/funds-confirmations',
      security: {
        oauth2: true,
        mtls: true,
        signedRequests: true,
      },
    };
  }
  
  // Anti-Money Laundering (AML) compliance
  async implementAMLCompliance(): Promise<void> {
    const amlRequirements = {
      customerDueDiligence: {
        identity: ['name', 'dateOfBirth', 'address'],
        verification: ['bankid', 'passport', 'driverLicense'],
        ongoing: true,
      },
      transactionMonitoring: {
        thresholds: {
          single: 15000, // EUR
          cumulative: 50000, // EUR per month
        },
        patterns: ['structuring', 'rapid-movement', 'dormant-active'],
      },
      reporting: {
        suspicious: 'immediate',
        threshold: 'within-24h',
        authority: 'Økokrim',
      },
    };
  }
}
```

## Compliance Testing Strategies

### Automated Compliance Testing

```typescript
// test/compliance/automated-tests.ts
import { test, expect } from '@playwright/test';
import { ComplianceValidator } from '@/lib/compliance';

describe('Compliance Test Suite', () => {
  // GDPR Tests
  test.describe('GDPR Compliance', () => {
    test('should handle consent properly', async ({ page }) => {
      await page.goto('/');
      
      // Check consent banner appears
      const consentBanner = page.locator('[role="dialog"][aria-label*="consent"]');
      await expect(consentBanner).toBeVisible();
      
      // Reject all optional cookies
      await page.click('button:has-text("Reject optional")');
      
      // Verify no tracking cookies set
      const cookies = await page.context().cookies();
      const trackingCookies = cookies.filter(c => 
        c.name.includes('analytics') || c.name.includes('marketing')
      );
      expect(trackingCookies).toHaveLength(0);
    });
    
    test('should allow data export', async ({ page }) => {
      await page.goto('/account/privacy');
      
      // Request data export
      await page.click('button:has-text("Export my data")');
      
      // Wait for download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("Download JSON")'),
      ]);
      
      // Verify export format
      const content = await download.path();
      const data = JSON.parse(await fs.readFile(content, 'utf-8'));
      
      expect(data).toHaveProperty('format', 'gdpr-export-v1');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('exportDate');
    });
  });
  
  // WCAG Tests
  test.describe('WCAG Accessibility', () => {
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/');
      
      // Run axe accessibility scan
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aaa'])
        .analyze();
      
      const contrastViolations = results.violations.filter(v => 
        v.id.includes('color-contrast')
      );
      
      expect(contrastViolations).toHaveLength(0);
    });
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Tab through all interactive elements
      const elements = [];
      let activeElement = await page.evaluate(() => document.activeElement?.tagName);
      
      for (let i = 0; i < 50; i++) {
        await page.keyboard.press('Tab');
        const newElement = await page.evaluate(() => ({
          tag: document.activeElement?.tagName,
          text: document.activeElement?.textContent,
          href: document.activeElement?.getAttribute('href'),
        }));
        
        if (elements.some(e => e.tag === newElement.tag && e.text === newElement.text)) {
          break; // Completed the cycle
        }
        
        elements.push(newElement);
      }
      
      // Verify logical tab order
      expect(elements.length).toBeGreaterThan(5);
      expect(elements[0].tag).toBe('A'); // Skip link
    });
  });
  
  // NSM Security Tests
  test.describe('NSM Security', () => {
    test('should classify data correctly', async ({ request }) => {
      const testData = {
        publicInfo: 'Company name',
        internalInfo: 'Employee list',
        restrictedInfo: 'Financial records',
        confidentialInfo: '12345678901', // Personal number
      };
      
      const response = await request.post('/api/classify', {
        data: testData,
      });
      
      const classification = await response.json();
      expect(classification.level).toBe('CONFIDENTIAL');
    });
    
    test('should enforce access control', async ({ request }) => {
      // Try to access restricted data without proper clearance
      const response = await request.get('/api/data/restricted/123', {
        headers: {
          'Authorization': 'Bearer low-clearance-token',
        },
      });
      
      expect(response.status()).toBe(403);
      const error = await response.json();
      expect(error.code).toBe('INSUFFICIENT_CLEARANCE');
    });
  });
});
```

### Compliance Monitoring

```typescript
// lib/compliance/monitoring.ts
export class ComplianceMonitor {
  private metrics = {
    gdpr: {
      consentRate: new Gauge('gdpr_consent_rate'),
      dataRequests: new Counter('gdpr_data_requests_total'),
      erasureRequests: new Counter('gdpr_erasure_requests_total'),
      breaches: new Counter('gdpr_breaches_total'),
    },
    nsm: {
      classifiedAccess: new Counter('nsm_classified_access_total'),
      encryptionFailures: new Counter('nsm_encryption_failures_total'),
      auditLogSize: new Gauge('nsm_audit_log_size_bytes'),
    },
    wcag: {
      accessibilityScore: new Gauge('wcag_accessibility_score'),
      failedValidations: new Counter('wcag_failed_validations_total'),
    },
  };
  
  async startMonitoring(): Promise<void> {
    // Real-time compliance monitoring
    setInterval(async () => {
      await this.collectGDPRMetrics();
      await this.collectNSMMetrics();
      await this.collectWCAGMetrics();
    }, 60000); // Every minute
    
    // Daily compliance report
    schedule.scheduleJob('0 0 * * *', async () => {
      await this.generateDailyReport();
    });
    
    // Incident detection
    this.setupIncidentDetection();
  }
  
  private async setupIncidentDetection(): Promise<void> {
    // GDPR breach detection
    this.metrics.gdpr.breaches.on('increment', async (labels) => {
      await this.handleDataBreach(labels);
    });
    
    // NSM security incident detection
    this.metrics.nsm.encryptionFailures.on('increment', async (labels) => {
      if (await this.isSecurityIncident(labels)) {
        await this.handleSecurityIncident(labels);
      }
    });
  }
}
```

## Compliance Integration Examples

### 1. Next.js App with Full Compliance

```typescript
// app/layout.tsx
import { ComplianceProvider } from '@/providers/compliance';
import { ConsentManager } from '@/components/compliance/ConsentManager';
import { AuditLogger } from '@/lib/compliance/audit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <ComplianceProvider
          gdpr={{
            consentRequired: true,
            dataController: 'Company AS',
            privacyOfficer: 'privacy@company.no',
          }}
          nsm={{
            defaultClassification: 'INTERNAL',
            encryptionRequired: true,
          }}
          wcag={{
            level: 'AAA',
            languages: ['nb', 'nn', 'en'],
          }}
        >
          <a href="#main" className="sr-only focus:not-sr-only">
            Hopp til hovedinnhold
          </a>
          
          {children}
          
          <ConsentManager />
          <AuditLogger />
        </ComplianceProvider>
      </body>
    </html>
  );
}
```

### 2. API Route with Compliance

```typescript
// app/api/users/[id]/route.ts
import { withCompliance } from '@/lib/compliance/middleware';
import { classifyData, auditLog } from '@/lib/compliance';

export const GET = withCompliance(
  async (request: Request, { params }: { params: { id: string } }) => {
    const userId = params.id;
    const requestingUser = await getAuthenticatedUser(request);
    
    // Check data access permission
    if (!await canAccessUserData(requestingUser, userId)) {
      await auditLog({
        action: 'USER_DATA_ACCESS_DENIED',
        targetUserId: userId,
        requestingUserId: requestingUser.id,
        reason: 'Insufficient permissions',
      });
      
      return new Response('Forbidden', { status: 403 });
    }
    
    // Fetch user data
    const userData = await getUserData(userId);
    
    // Classify and protect data
    const classification = classifyData(userData);
    const protectedData = await protectData(userData, classification);
    
    // Audit successful access
    await auditLog({
      action: 'USER_DATA_ACCESS_GRANTED',
      targetUserId: userId,
      requestingUserId: requestingUser.id,
      classification,
      purpose: request.headers.get('X-Purpose') || 'Not specified',
    });
    
    return Response.json(protectedData);
  },
  {
    requireAuth: true,
    gdpr: {
      purpose: 'user-profile-view',
      lawfulBasis: 'legitimate-interest',
    },
    nsm: {
      minClearance: 'INTERNAL',
      auditLevel: 'detailed',
    },
    wcag: {
      apiDocumentation: true,
      errorMessagesAccessible: true,
    },
  }
);
```

### 3. Database Model with Compliance

```typescript
// prisma/schema.prisma with compliance extensions
model User {
  id              String    @id @default(cuid())
  email           String    @unique @encrypted @gdpr_personal
  personalNumber  String?   @encrypted @gdpr_sensitive @nsm_confidential
  name            String    @gdpr_personal
  
  // Audit fields
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastActiveAt    DateTime?
  
  // Compliance fields
  consentGiven    DateTime?
  consentVersion  String?
  dataExportedAt  DateTime?
  erasureScheduled DateTime?
  
  @@audit_log
  @@encrypt_at_rest
  @@data_retention(years: 3)
}

// Compliance extensions
generator compliance {
  provider = "prisma-compliance-generator"
  gdpr = true
  nsm = true
  encryption = "field-level"
  audit = "comprehensive"
}
```

## CLI Commands for Compliance

### Compliance Validation Commands

```bash
# Full compliance check
xaheen compliance check --all

# Specific compliance checks
xaheen compliance check gdpr
xaheen compliance check nsm --classification CONFIDENTIAL
xaheen compliance check wcag --level AAA

# Fix compliance issues
xaheen compliance fix --auto

# Generate compliance report
xaheen compliance report --format pdf --lang nb

# Monitor compliance in watch mode
xaheen compliance watch
```

### Compliance Scaffolding

```bash
# Generate compliant components
xaheen generate component UserForm \
  --compliance gdpr,nsm,wcag \
  --with-consent \
  --with-encryption \
  --with-audit

# Generate compliant API
xaheen generate api users \
  --compliance full \
  --auth bankid \
  --rate-limit \
  --audit-log

# Generate compliance documentation
xaheen generate docs compliance \
  --languages nb,en \
  --format html,pdf \
  --include-checklists
```

## Compliance Roadmap

### Phase 1: Foundation (Completed)
- ✅ GDPR implementation
- ✅ NSM security framework  
- ✅ WCAG AAA support
- ✅ Audit logging system

### Phase 2: Advanced Features (In Progress)
- 🔄 AI-powered compliance suggestions
- 🔄 Real-time compliance monitoring
- 🔄 Automated compliance fixes
- 🔄 Multi-tenant compliance

### Phase 3: Future Enhancements
- 📋 Compliance certification automation
- 📋 Cross-border data transfer management
- 📋 Industry-specific compliance templates
- 📋 Compliance training integration

---

> **For Agents**: This compliance guide provides comprehensive coverage of GDPR, NSM, and WCAG requirements in the Xaheen platform. Always prioritize compliance when generating code or making architectural decisions. Use the provided implementations and components as templates for compliant development. Remember that compliance is not optional—it's a fundamental requirement for all Norwegian and EU applications.

### Quick Reference for Agents

1. **Always check compliance requirements** before generating any code
2. **Use the compliance templates** provided in this guide
3. **Validate all generated code** with the compliance validators
4. **Include audit logging** for any data access or modification
5. **Ensure accessibility** meets WCAG AAA standards
6. **Classify data correctly** according to NSM guidelines
7. **Implement privacy by design** following GDPR principles
8. **Test compliance automatically** using the provided test suites
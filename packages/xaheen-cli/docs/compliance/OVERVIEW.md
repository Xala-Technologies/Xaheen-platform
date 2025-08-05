# Norwegian Compliance Overview

Xaheen CLI is built with Norwegian enterprise standards at its core, ensuring compliance with NSM security requirements, GDPR regulations, and WCAG AAA accessibility standards. This comprehensive guide covers all compliance features and implementation details.

## 🇳🇴 Norwegian Standards Compliance

### Overview

Xaheen CLI implements comprehensive Norwegian compliance covering:

1. **NSM (Nasjonal Sikkerhetsmyndighet) Standards**
   - Security classifications (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
   - Audit trail requirements
   - Access control mechanisms
   - Data protection standards

2. **GDPR (General Data Protection Regulation)**
   - Privacy by design
   - Data minimization
   - User consent management
   - Right to erasure

3. **WCAG AAA Accessibility**
   - Universal design principles
   - Screen reader compatibility
   - Keyboard navigation
   - High contrast support

4. **Norwegian Service Integrations**
   - BankID authentication
   - Vipps payment processing
   - Altinn API integration
   - Digipost communication

## 🔒 NSM Security Standards

### Security Classifications

Xaheen automatically applies appropriate security controls based on data classification:

```typescript
enum NSMClassification {
  OPEN = "OPEN",                    // Public information
  RESTRICTED = "INTERNAL",          // Internal use only
  CONFIDENTIAL = "CONFIDENTIAL",    // Confidential data
  SECRET = "SECRET"                 // Secret classification
}
```

### Implementation

```bash
# Set project classification
xaheen config set compliance.classification CONFIDENTIAL

# Generate with classification
xaheen make:model User --classification CONFIDENTIAL

# Validate classification compliance
xaheen validate --nsm
```

### Security Controls by Classification

#### OPEN (Public)
- Basic authentication
- Standard logging
- Public API access
- No encryption required

#### RESTRICTED (Internal)
- Role-based access control
- Audit logging
- Internal network only
- Transport encryption

#### CONFIDENTIAL
- Multi-factor authentication
- Comprehensive audit trails
- Encrypted storage
- Restricted access logging

#### SECRET
- Hardware security modules
- Air-gapped systems
- Full encryption
- Detailed access monitoring

## 📊 GDPR Compliance

### Privacy by Design

Xaheen implements privacy principles in generated code:

```bash
# Generate GDPR-compliant user model
xaheen make:model User --gdpr

# This includes:
# - Consent tracking
# - Data retention policies
# - Anonymization capabilities
# - Export functionality
```

### Generated GDPR Features

```typescript
// Generated User model with GDPR
interface GDPRUser {
  // Personal data
  id: string;
  email: string;
  name?: string;
  
  // GDPR fields
  consentGiven: boolean;
  consentDate: Date;
  dataRetentionDate: Date;
  
  // GDPR methods
  anonymize(): void;
  exportData(): UserData;
  deletePersonalData(): void;
  updateConsent(consent: boolean): void;
}
```

### GDPR Commands

```bash
# Generate GDPR compliance report
xaheen compliance gdpr-report

# Implement data export
xaheen generate gdpr-export User

# Add consent management
xaheen generate consent-form

# Create deletion workflow
xaheen generate gdpr-deletion User
```

### Data Processing Records

```javascript
// xaheen.config.js
export default {
  gdpr: {
    dataController: {
      name: "Company AS",
      contact: "privacy@company.no",
      dpo: "dpo@company.no"
    },
    purposes: [
      {
        id: "user-authentication",
        description: "Authenticate users",
        legalBasis: "consent",
        retention: "2 years"
      }
    ],
    thirdParties: [
      {
        name: "Analytics Provider",
        purpose: "Usage analytics",
        location: "EU"
      }
    ]
  }
}
```

## ♿ WCAG AAA Accessibility

### Accessibility Features

Xaheen generates components with built-in accessibility:

```bash
# Generate accessible component
xaheen make:component Button --a11y AAA

# Features included:
# - ARIA labels
# - Keyboard navigation
# - Focus management
# - Screen reader support
# - High contrast mode
```

### Generated Accessible Code

```typescript
// Generated accessible button
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ariaLabel,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children?.toString()}
      aria-disabled={disabled}
      className={cn(
        // Base styles with focus visible
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        // High contrast mode support
        "contrast-more:border-2 contrast-more:border-current",
        // Keyboard navigation
        "keyboard:ring-4",
        // Screen reader announcements
        "sr-only:absolute sr-only:w-px sr-only:h-px",
        variants[variant]
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Accessibility Validation

```bash
# Run accessibility audit
xaheen validate --a11y

# Check specific WCAG level
xaheen validate --a11y AAA

# Generate accessibility report
xaheen report accessibility

# Fix accessibility issues
xaheen ai fix-a11y
```

## 🏦 Norwegian Service Integrations

### BankID Integration

```bash
# Add BankID authentication
xaheen service add bankid --environment test

# Generate BankID components
xaheen generate bankid-login
xaheen generate bankid-signing
```

#### BankID Configuration

```javascript
// xaheen.config.js
export default {
  services: {
    bankid: {
      environment: 'test', // 'test' or 'production'
      clientId: process.env.BANKID_CLIENT_ID,
      clientSecret: process.env.BANKID_CLIENT_SECRET,
      redirectUri: 'https://app.example.no/auth/bankid/callback',
      merchantName: 'Company AS',
      compliance: {
        logging: true,
        auditTrail: true,
        dataRetention: '10 years'
      }
    }
  }
}
```

### Vipps Integration

```bash
# Add Vipps payment
xaheen service add vipps --merchant-id YOUR_MERCHANT_ID

# Generate Vipps components
xaheen generate vipps-checkout
xaheen generate vipps-agreement
```

#### Vipps Configuration

```javascript
// xaheen.config.js
export default {
  services: {
    vipps: {
      merchantId: process.env.VIPPS_MERCHANT_ID,
      subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
      environment: 'test', // 'test' or 'production'
      callbacks: {
        payment: 'https://app.example.no/vipps/payment',
        shipping: 'https://app.example.no/vipps/shipping',
        consent: 'https://app.example.no/vipps/consent',
        fallback: 'https://app.example.no/vipps/fallback'
      }
    }
  }
}
```

### Altinn Integration

```bash
# Add Altinn services
xaheen service add altinn --org-number 123456789

# Generate Altinn integrations
xaheen generate altinn-auth
xaheen generate altinn-correspondence
xaheen generate altinn-formdata
```

#### Altinn Configuration

```javascript
// xaheen.config.js
export default {
  services: {
    altinn: {
      environment: 'test', // 'test' or 'production'
      organizationNumber: '123456789',
      apiKey: process.env.ALTINN_API_KEY,
      services: [
        {
          code: 'Correspondence',
          edition: '2'
        },
        {
          code: 'FormData',
          edition: '1'
        }
      ],
      compliance: {
        logging: 'comprehensive',
        retention: '7 years'
      }
    }
  }
}
```

## 📋 Compliance Configuration

### Full Compliance Setup

```javascript
// xaheen.config.js
export default {
  compliance: {
    // NSM Classification
    classification: 'CONFIDENTIAL',
    
    // Norwegian Standards
    norwegian: {
      enabled: true,
      bankId: true,
      vipps: true,
      altinn: true,
      language: 'nb-NO' // Norwegian Bokmål
    },
    
    // GDPR Settings
    gdpr: {
      enabled: true,
      privacyByDesign: true,
      dataMinimization: true,
      encryption: 'AES-256',
      retention: {
        default: '2 years',
        logs: '1 year',
        backups: '6 months'
      }
    },
    
    // Accessibility
    accessibility: {
      level: 'AAA',
      testing: true,
      documentation: true,
      languages: ['nb-NO', 'nn-NO', 'en']
    },
    
    // Audit & Monitoring
    audit: {
      enabled: true,
      detailed: true,
      storage: 'secure-bucket',
      retention: '7 years',
      alerts: true
    }
  }
}
```

## 🔍 Compliance Validation

### Running Compliance Checks

```bash
# Full compliance validation
xaheen validate --compliance

# Specific compliance checks
xaheen validate --nsm          # NSM standards
xaheen validate --gdpr         # GDPR compliance
xaheen validate --a11y AAA     # Accessibility
xaheen validate --norwegian    # Norwegian services

# Generate compliance report
xaheen report compliance --format pdf
```

### Compliance Report Example

```
XAHEEN COMPLIANCE REPORT
========================

Project: my-norwegian-app
Date: 2024-12-20
Classification: CONFIDENTIAL

NSM Compliance: ✓ PASSED
- Data Classification: Implemented
- Access Control: RBAC Active
- Audit Logging: Comprehensive
- Encryption: AES-256

GDPR Compliance: ✓ PASSED
- Privacy by Design: Yes
- Consent Management: Implemented
- Data Export: Available
- Right to Erasure: Implemented

Accessibility: ✓ WCAG AAA
- Keyboard Navigation: Full
- Screen Reader: Compatible
- Color Contrast: 7:1 minimum
- Focus Management: Implemented

Norwegian Services: ✓ READY
- BankID: Configured (Test)
- Vipps: Configured (Test)
- Altinn: Configured (Test)
```

## 🛡️ Security Best Practices

### 1. Classification-Based Development

```bash
# Always set classification first
xaheen config set compliance.classification CONFIDENTIAL

# Generate with appropriate security
xaheen make:model SensitiveData --encrypted --audit-trail
```

### 2. Privacy-First Design

```bash
# Use GDPR templates
xaheen generate user-system --gdpr

# Implement consent flows
xaheen generate consent-management
```

### 3. Accessibility Testing

```bash
# Test during development
xaheen test --a11y

# CI/CD integration
xaheen validate --a11y --fail-on-error
```

## 📚 Compliance Resources

### Documentation

- [NSM Security Guide](https://nsm.no/english/)
- [GDPR Implementation](https://www.datatilsynet.no/en/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Norwegian Accessibility](https://www.uutilsynet.no/english)

### Templates

Xaheen includes compliance templates:

```bash
# List compliance templates
xaheen template list --compliance

# Use compliance template
xaheen new my-app --template norwegian-enterprise
```

### Training Commands

```bash
# Interactive compliance training
xaheen learn compliance

# Compliance quiz
xaheen quiz norwegian-standards
```

## 🔧 Troubleshooting Compliance

### Common Issues

1. **BankID Test Environment**
   ```bash
   # Verify BankID test setup
   xaheen doctor --bankid
   
   # Test BankID flow
   xaheen test bankid --interactive
   ```

2. **GDPR Data Mapping**
   ```bash
   # Scan for personal data
   xaheen scan personal-data
   
   # Generate data map
   xaheen generate gdpr-data-map
   ```

3. **Accessibility Failures**
   ```bash
   # Get detailed a11y report
   xaheen validate --a11y --verbose
   
   # Auto-fix issues
   xaheen ai fix-a11y --auto-approve
   ```

---

**Next Steps:**
- Implement [NSM Standards](./NSM.md)
- Configure [GDPR Compliance](./GDPR.md)
- Setup [Norwegian Services](./INTEGRATIONS.md)
# NSM Security Classifications and GDPR Compliance Templates

This directory contains comprehensive templates for implementing Norwegian Security Authority (NSM) security classifications and General Data Protection Regulation (GDPR) compliance in applications.

## 🔐 NSM Security Classifications

The NSM security templates provide complete implementations for all four classification levels defined by the Norwegian Security Authority:

### Classification Levels

- **OPEN** - Information that can be freely shared with the public
- **RESTRICTED** - Information for authorized personnel within the organization  
- **CONFIDENTIAL** - Sensitive information requiring special handling and protection
- **SECRET** - Highly sensitive information critical to national security

### Features

#### Core Security Services
- **NSM Security Configuration** - Classification-specific security policies
- **Classification Service** - Access control and validation
- **Security Headers** - NSM-compliant HTTP headers
- **Session Management** - Classification-aware session handling

#### UI Security Components
- **Classification Banner** - Visual classification indicators
- **Security Watermarks** - Document protection overlays
- **Access Control Guards** - Component-level security
- **Session Timeout Monitor** - Automatic session management
- **Restricted Actions** - Feature-level access controls

#### Audit and Monitoring
- **Comprehensive Audit Logger** - Real-time security event logging
- **Audit Trail** - Immutable security event records
- **Security Monitor** - Anomaly detection and alerting
- **Compliance Reporter** - Automated compliance reporting

#### Access Control
- **Role-based Access Control** - User clearance validation
- **Clearance Validator** - Multi-level security checks
- **Access Control Middleware** - Request-level security

### Usage

```typescript
import { generateNSMSecurity } from '@xaheen-ai/cli/generators/compliance';

await generateNSMSecurity({
  projectName: 'my-secure-app',
  classification: 'CONFIDENTIAL',
  dataTypes: ['personal-data', 'financial-data'],
  userClearance: 'CONFIDENTIAL',
  auditLevel: 'comprehensive',
  enableWatermarks: true,
  sessionTimeout: 120 // 2 hours
});
```

## 🛡️ GDPR Compliance

The GDPR compliance templates provide complete data protection and privacy implementations following privacy-by-design principles.

### Features

#### Core Services
- **GDPR Service** - Central compliance management
- **Data Processing Service** - Lawful basis validation
- **Lawful Basis Service** - Legal ground verification
- **Privacy Notice Service** - Transparency compliance
- **Data Retention Service** - Storage minimization

#### Consent Management
- **Consent Manager** - Granular consent handling
- **Consent Storage** - Secure consent records
- **Consent Validator** - Compliance verification
- **Granular Consent** - Purpose-specific permissions

#### Data Subject Rights
- **Rights Service** - All GDPR rights implementation
- **Right to Access** - Data portability
- **Right to Erasure** - Deletion workflows
- **Right to Rectification** - Data correction
- **Right to Restriction** - Processing limitation

#### Privacy by Design
- **Data Protection APIs** - Secure processing
- **Encryption Service** - Data protection
- **Pseudonymization** - Privacy enhancement
- **Anonymization** - Identity protection
- **Data Minimization** - Purpose limitation

#### UI Components
- **Consent Banner** - GDPR-compliant consent collection
- **Privacy Dashboard** - User privacy controls
- **Data Subject Request Form** - Rights exercise interface
- **Privacy Settings** - Granular preference management

#### Data Deletion Workflows
- **Automated Deletion** - Retention policy enforcement
- **Deletion Scheduler** - Systematic data removal
- **Retention Policy Engine** - Policy-driven retention
- **Verification System** - Deletion confirmation

### Usage

```typescript
import { generateGDPRCompliance } from '@xaheen-ai/cli/generators/compliance';

await generateGDPRCompliance({
  projectName: 'my-compliant-app',
  dataCategories: ['personal-data', 'behavioral-data'],
  lawfulBasis: 'consent',
  consentTypes: ['explicit', 'informed'],
  dataRetentionPeriod: 365,
  enableRightToErasure: true,
  enableDataPortability: true,
  enableConsentManagement: true
});
```

## 🚀 Integration

### CLI Usage

Generate NSM security implementation:
```bash
xaheen generate nsm-security my-secure-app --classification=CONFIDENTIAL
```

Generate GDPR compliance:
```bash
xaheen generate gdpr-compliance my-app --lawful-basis=consent
```

### Configuration Options

#### NSM Security Options
- `classification` - Security level (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
- `dataTypes` - Types of data being processed
- `userClearance` - Required user security clearance
- `auditLevel` - Audit logging level (basic, enhanced, comprehensive, maximum)
- `enableWatermarks` - Enable security watermarks
- `sessionTimeout` - Session timeout in minutes
- `internationalTransfer` - Allow international data transfers

#### GDPR Options
- `dataCategories` - Categories of personal data
- `lawfulBasis` - Legal basis for processing
- `consentTypes` - Types of consent required
- `dataRetentionPeriod` - Data retention period in days
- `enableRightToErasure` - Enable data deletion rights
- `enableDataPortability` - Enable data export rights
- `appointDataProtectionOfficer` - Require DPO appointment
- `performDataProtectionImpactAssessment` - Require DPIA

## 📋 Compliance Standards

### NSM Requirements
- ✅ Four-tier classification system (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
- ✅ User clearance validation
- ✅ Audit logging with retention
- ✅ Access control mechanisms
- ✅ Security monitoring and alerting
- ✅ Document classification and watermarking
- ✅ Session security management

### GDPR Requirements
- ✅ All six lawful bases for processing
- ✅ Special category data handling
- ✅ All eight data subject rights
- ✅ Privacy by design principles
- ✅ Consent management (granular, withdrawable)
- ✅ Data breach notification
- ✅ Data protection impact assessments
- ✅ Records of processing activities

## 🔧 Technical Implementation

### Generated File Structure

```
src/
├── security/nsm/           # NSM security implementation
├── security/audit/         # Audit logging system
├── security/access-control/ # Access control system
├── gdpr/services/          # GDPR core services
├── gdpr/consent/           # Consent management
├── gdpr/data-subject-rights/ # Rights implementation
├── gdpr/workflows/         # Data deletion workflows
├── components/security/    # Security UI components
├── components/privacy/     # Privacy UI components
├── components/consent/     # Consent UI components
├── hooks/security/         # Security React hooks
├── hooks/privacy/          # Privacy React hooks
├── types/security/         # Security TypeScript types
├── types/gdpr/            # GDPR TypeScript types
├── middleware/gdpr/       # GDPR middleware
└── utils/                 # Utility functions
```

### Dependencies

The generated code requires:
- `consola` - Logging and debugging
- `react` - UI components (if using React)
- `typescript` - Type definitions

## 📚 Documentation

Each generator creates comprehensive documentation:

### NSM Security
- NSM Security Implementation Guide
- Classification Procedures
- Audit Procedures  
- Security Architecture

### GDPR Compliance
- GDPR Compliance Guide
- Data Subject Rights Guide
- Consent Management Guide
- Privacy by Design Guide
- Breach Response Procedures

## 🧪 Testing

The generators include test utilities and validation:

### Security Testing
- Access control validation
- Audit log verification
- Security policy compliance
- Classification enforcement

### Privacy Testing
- Consent flow validation
- Data subject rights testing
- Privacy policy compliance
- Data deletion verification

## 🔍 Monitoring and Alerting

### NSM Security Monitoring
- Real-time security event detection
- Anomaly detection algorithms
- SIEM integration capabilities
- Automated incident response

### GDPR Compliance Monitoring
- Consent expiration tracking
- Data retention compliance
- Rights request monitoring
- Breach detection and reporting

## ⚖️ Legal Considerations

These templates provide technical implementations but should be reviewed by legal counsel to ensure full compliance with:

- Norwegian Security Authority (NSM) regulations
- General Data Protection Regulation (GDPR)
- Norwegian Personal Data Act
- Sector-specific regulations (finance, healthcare, etc.)
- International data transfer requirements

## 🤝 Support

For questions about the compliance generators:

1. Review the generated documentation
2. Check implementation examples
3. Validate against compliance requirements
4. Consult with legal and security teams
5. Perform regular compliance audits

---

**Important**: These templates provide a foundation for compliance but do not guarantee legal compliance. Always consult with qualified legal and security professionals for your specific use case.
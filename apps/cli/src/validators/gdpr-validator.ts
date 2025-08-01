import { z } from 'zod';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { GenerationResult } from '../types.js';

/**
 * GDPR Compliance Validation Engine
 * 
 * Validates code and data handling for GDPR compliance,
 * including personal data classification, consent mechanisms,
 * and data protection measures
 */

// Data classification types
export enum DataClassification {
  PERSONAL = 'personal',           // Name, email, phone
  SENSITIVE = 'sensitive',         // Health, religion, political views
  FINANCIAL = 'financial',         // Bank accounts, credit cards
  BIOMETRIC = 'biometric',         // Fingerprints, face recognition
  GENETIC = 'genetic',            // DNA data
  ANONYMOUS = 'anonymous',         // Cannot identify individual
  PSEUDONYMOUS = 'pseudonymous'    // Can identify with additional info
}

// Legal basis for processing
export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

// GDPR rights
export enum GDPRRight {
  ACCESS = 'access',               // Right to access
  RECTIFICATION = 'rectification', // Right to rectification
  ERASURE = 'erasure',            // Right to be forgotten
  RESTRICTION = 'restriction',     // Right to restrict processing
  PORTABILITY = 'portability',     // Right to data portability
  OBJECTION = 'objection',        // Right to object
  AUTOMATED = 'automated'          // Rights related to automated decision making
}

// GDPR validation result schema
const gdprResultSchema = z.object({
  compliant: z.boolean(),
  score: z.number().min(0).max(100),
  dataTypes: z.array(z.object({
    field: z.string(),
    classification: z.nativeEnum(DataClassification),
    location: z.object({
      file: z.string(),
      line: z.number(),
      column: z.number()
    })
  })),
  issues: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    type: z.string(),
    message: z.string(),
    location: z.object({
      file: z.string(),
      line: z.number(),
      column: z.number()
    }).optional(),
    suggestion: z.string().optional()
  })),
  consent: z.object({
    hasConsentMechanism: z.boolean(),
    isGranular: z.boolean(),
    isWithdrawable: z.boolean(),
    isExplicit: z.boolean(),
    isInformed: z.boolean()
  }),
  dataProtection: z.object({
    encryption: z.boolean(),
    pseudonymization: z.boolean(),
    accessControl: z.boolean(),
    dataMinimization: z.boolean(),
    purposeLimitation: z.boolean(),
    storageLimit: z.boolean()
  }),
  rights: z.record(z.nativeEnum(GDPRRight), z.boolean()),
  recommendations: z.array(z.string())
});

export type GDPRResult = z.infer<typeof gdprResultSchema>;

// Personal data patterns
const personalDataPatterns = {
  // Norwegian patterns
  personalNumber: /\b\d{6}\s?\d{5}\b/g,
  dNumber: /\b[4-7]\d{5}\s?\d{5}\b/g,
  
  // General patterns
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+\d{1,3}\s?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}\b/g,
  creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  
  // Common field names
  personalFields: [
    'name', 'firstName', 'lastName', 'fullName', 'displayName',
    'email', 'emailAddress', 'mail',
    'phone', 'phoneNumber', 'mobile', 'tel',
    'address', 'street', 'city', 'postalCode', 'zipCode',
    'birthDate', 'dateOfBirth', 'dob', 'age',
    'gender', 'sex',
    'nationality', 'citizenship',
    'personalNumber', 'ssn', 'socialSecurityNumber', 'nin',
    'passport', 'driverLicense'
  ],
  
  sensitiveFields: [
    'health', 'medical', 'diagnosis', 'treatment',
    'religion', 'belief', 'faith',
    'politics', 'politicalView', 'voting',
    'union', 'tradeUnion',
    'sexuality', 'sexualOrientation',
    'race', 'ethnicity', 'origin',
    'criminal', 'conviction', 'offense'
  ],
  
  financialFields: [
    'bank', 'account', 'iban', 'swift',
    'creditCard', 'cardNumber', 'cvv', 'cvc',
    'salary', 'income', 'wage',
    'tax', 'taxId', 'vatNumber'
  ],
  
  biometricFields: [
    'fingerprint', 'faceId', 'iris', 'retina',
    'voice', 'voiceprint', 'gait',
    'dna', 'genetic'
  ]
};

/**
 * GDPR Validator
 */
export class GDPRValidator {
  /**
   * Validate GDPR compliance
   */
  async validateGDPRCompliance(
    code: string,
    filePath: string = 'unknown'
  ): Promise<GDPRResult> {
    const issues: GDPRResult['issues'] = [];
    const dataTypes: GDPRResult['dataTypes'] = [];
    const recommendations: string[] = [];

    // Parse code
    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
    } catch (error) {
      issues.push({
        severity: 'error',
        type: 'parse_error',
        message: 'Failed to parse code',
        suggestion: 'Ensure code is valid TypeScript/JavaScript'
      });
      
      return this.createResult(false, 0, dataTypes, issues, recommendations);
    }

    // Analyze code
    const analysis = this.analyzeCode(ast, code, filePath);
    dataTypes.push(...analysis.dataTypes);
    issues.push(...analysis.issues);
    
    // Check consent mechanisms
    const consent = this.checkConsentMechanisms(ast, code);
    
    // Check data protection measures
    const dataProtection = this.checkDataProtection(ast, code);
    
    // Check GDPR rights implementation
    const rights = this.checkGDPRRights(ast, code);
    
    // Generate recommendations
    recommendations.push(...this.generateRecommendations(
      dataTypes,
      consent,
      dataProtection,
      rights
    ));
    
    // Calculate compliance score
    const score = this.calculateComplianceScore(
      dataTypes,
      issues,
      consent,
      dataProtection,
      rights
    );
    
    return this.createResult(
      score >= 80 && issues.filter(i => i.severity === 'error').length === 0,
      score,
      dataTypes,
      issues,
      recommendations,
      consent,
      dataProtection,
      rights
    );
  }

  /**
   * Analyze code for personal data
   */
  private analyzeCode(
    ast: any,
    code: string,
    filePath: string
  ): {
    dataTypes: GDPRResult['dataTypes'];
    issues: GDPRResult['issues'];
  } {
    const dataTypes: GDPRResult['dataTypes'] = [];
    const issues: GDPRResult['issues'] = [];
    const processedFields = new Set<string>();

    traverse(ast, {
      // Check object properties
      ObjectProperty(path) {
        const key = path.node.key;
        if (key.type === 'Identifier') {
          const fieldName = key.name.toLowerCase();
          const location = {
            file: filePath,
            line: key.loc?.start.line || 0,
            column: key.loc?.start.column || 0
          };

          // Check for personal data fields
          if (personalDataPatterns.personalFields.some(f => fieldName.includes(f))) {
            if (!processedFields.has(fieldName)) {
              dataTypes.push({
                field: fieldName,
                classification: DataClassification.PERSONAL,
                location
              });
              processedFields.add(fieldName);
            }
          }

          // Check for sensitive data fields
          if (personalDataPatterns.sensitiveFields.some(f => fieldName.includes(f))) {
            if (!processedFields.has(fieldName)) {
              dataTypes.push({
                field: fieldName,
                classification: DataClassification.SENSITIVE,
                location
              });
              processedFields.add(fieldName);
              
              issues.push({
                severity: 'warning',
                type: 'sensitive_data',
                message: `Sensitive personal data field '${fieldName}' detected`,
                location,
                suggestion: 'Ensure explicit consent and enhanced protection measures'
              });
            }
          }

          // Check for financial data fields
          if (personalDataPatterns.financialFields.some(f => fieldName.includes(f))) {
            if (!processedFields.has(fieldName)) {
              dataTypes.push({
                field: fieldName,
                classification: DataClassification.FINANCIAL,
                location
              });
              processedFields.add(fieldName);
            }
          }

          // Check for biometric data fields
          if (personalDataPatterns.biometricFields.some(f => fieldName.includes(f))) {
            if (!processedFields.has(fieldName)) {
              dataTypes.push({
                field: fieldName,
                classification: DataClassification.BIOMETRIC,
                location
              });
              processedFields.add(fieldName);
              
              issues.push({
                severity: 'error',
                type: 'biometric_data',
                message: `Biometric data field '${fieldName}' requires special protection`,
                location,
                suggestion: 'Implement enhanced security measures and explicit consent'
              });
            }
          }
        }
      },

      // Check string literals for personal data patterns
      StringLiteral(path) {
        const value = path.node.value;
        const location = {
          file: filePath,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0
        };

        // Check for Norwegian personal numbers
        if (personalDataPatterns.personalNumber.test(value)) {
          issues.push({
            severity: 'error',
            type: 'hardcoded_personal_data',
            message: 'Hardcoded Norwegian personal number detected',
            location,
            suggestion: 'Never hardcode personal data - use test data or environment variables'
          });
        }

        // Check for email addresses
        if (personalDataPatterns.email.test(value) && !value.includes('@example')) {
          issues.push({
            severity: 'warning',
            type: 'hardcoded_email',
            message: 'Hardcoded email address detected',
            location,
            suggestion: 'Use example.com domains for test data'
          });
        }
      },

      // Check for data storage without encryption
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === 'MemberExpression') {
          const object = callee.object;
          const property = callee.property;
          
          // Check localStorage/sessionStorage
          if (object.type === 'Identifier' && 
              (object.name === 'localStorage' || object.name === 'sessionStorage') &&
              property.type === 'Identifier' && property.name === 'setItem') {
            
            const args = path.node.arguments;
            if (args.length >= 2 && args[0].type === 'StringLiteral') {
              const key = args[0].value.toLowerCase();
              
              if (personalDataPatterns.personalFields.some(f => key.includes(f))) {
                issues.push({
                  severity: 'error',
                  type: 'unencrypted_storage',
                  message: `Personal data stored in ${object.name} without encryption`,
                  location: {
                    file: filePath,
                    line: path.node.loc?.start.line || 0,
                    column: path.node.loc?.start.column || 0
                  },
                  suggestion: 'Encrypt personal data before storing in browser storage'
                });
              }
            }
          }

          // Check for console.log of personal data
          if (object.type === 'Identifier' && object.name === 'console') {
            const firstArg = path.node.arguments[0];
            if (firstArg && firstArg.type === 'Identifier') {
              const varName = firstArg.name.toLowerCase();
              
              if (personalDataPatterns.personalFields.some(f => varName.includes(f))) {
                issues.push({
                  severity: 'warning',
                  type: 'data_logging',
                  message: 'Potential logging of personal data',
                  location: {
                    file: filePath,
                    line: path.node.loc?.start.line || 0,
                    column: path.node.loc?.start.column || 0
                  },
                  suggestion: 'Avoid logging personal data or use structured logging with data masking'
                });
              }
            }
          }
        }
      }
    });

    return { dataTypes, issues };
  }

  /**
   * Check consent mechanisms
   */
  private checkConsentMechanisms(
    ast: any,
    code: string
  ): GDPRResult['consent'] {
    const consent = {
      hasConsentMechanism: false,
      isGranular: false,
      isWithdrawable: false,
      isExplicit: false,
      isInformed: false
    };

    // Check for consent-related code patterns
    const consentPatterns = [
      /consent/i,
      /permission/i,
      /accept.*terms/i,
      /agree.*privacy/i,
      /opt.*in/i
    ];

    const hasConsentCode = consentPatterns.some(pattern => pattern.test(code));
    consent.hasConsentMechanism = hasConsentCode;

    // Check for granular consent (multiple consent options)
    const granularPatterns = [
      /marketing.*consent/i,
      /analytics.*consent/i,
      /cookies.*consent/i,
      /third.*party.*consent/i
    ];
    
    const granularCount = granularPatterns.filter(pattern => pattern.test(code)).length;
    consent.isGranular = granularCount >= 2;

    // Check for withdrawal mechanism
    consent.isWithdrawable = /withdraw.*consent|revoke.*consent|opt.*out/i.test(code);

    // Check for explicit consent (checkboxes, not pre-checked)
    consent.isExplicit = /checkbox.*consent|confirm.*consent|!defaultChecked/i.test(code);

    // Check for informed consent (privacy policy link)
    consent.isInformed = /privacy.*policy|data.*protection.*notice/i.test(code);

    return consent;
  }

  /**
   * Check data protection measures
   */
  private checkDataProtection(
    ast: any,
    code: string
  ): GDPRResult['dataProtection'] {
    const protection = {
      encryption: false,
      pseudonymization: false,
      accessControl: false,
      dataMinimization: false,
      purposeLimitation: false,
      storageLimit: false
    };

    // Check for encryption
    protection.encryption = /encrypt|crypto|bcrypt|argon2|pbkdf2|scrypt/i.test(code);

    // Check for pseudonymization
    protection.pseudonymization = /pseudonym|anonymize|hash.*identifier|uuid/i.test(code);

    // Check for access control
    protection.accessControl = /authorize|permission|role.*based|access.*control|rbac|abac/i.test(code);

    // Check for data minimization
    protection.dataMinimization = /pick|select.*fields|omit|exclude.*fields/i.test(code);

    // Check for purpose limitation
    protection.purposeLimitation = /purpose|processing.*reason|lawful.*basis/i.test(code);

    // Check for storage limits
    protection.storageLimit = /retention|ttl|expires|cleanup|purge/i.test(code);

    return protection;
  }

  /**
   * Check GDPR rights implementation
   */
  private checkGDPRRights(
    ast: any,
    code: string
  ): Record<GDPRRight, boolean> {
    const rights: Record<GDPRRight, boolean> = {
      [GDPRRight.ACCESS]: false,
      [GDPRRight.RECTIFICATION]: false,
      [GDPRRight.ERASURE]: false,
      [GDPRRight.RESTRICTION]: false,
      [GDPRRight.PORTABILITY]: false,
      [GDPRRight.OBJECTION]: false,
      [GDPRRight.AUTOMATED]: false
    };

    // Check for access rights (data export, view profile)
    rights[GDPRRight.ACCESS] = /export.*data|download.*data|view.*profile|get.*user.*data/i.test(code);

    // Check for rectification rights (update profile, edit data)
    rights[GDPRRight.RECTIFICATION] = /update.*profile|edit.*data|modify.*information/i.test(code);

    // Check for erasure rights (delete account, remove data)
    rights[GDPRRight.ERASURE] = /delete.*account|remove.*data|forget.*me|erase.*personal/i.test(code);

    // Check for restriction rights
    rights[GDPRRight.RESTRICTION] = /restrict.*processing|limit.*use|freeze.*data/i.test(code);

    // Check for portability rights
    rights[GDPRRight.PORTABILITY] = /export.*json|export.*csv|data.*portability|machine.*readable/i.test(code);

    // Check for objection rights
    rights[GDPRRight.OBJECTION] = /object.*processing|opt.*out|unsubscribe/i.test(code);

    // Check for automated decision rights
    rights[GDPRRight.AUTOMATED] = /manual.*review|human.*intervention|explain.*decision/i.test(code);

    return rights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    dataTypes: GDPRResult['dataTypes'],
    consent: GDPRResult['consent'],
    dataProtection: GDPRResult['dataProtection'],
    rights: Record<GDPRRight, boolean>
  ): string[] {
    const recommendations: string[] = [];

    // Data type recommendations
    if (dataTypes.some(dt => dt.classification === DataClassification.SENSITIVE)) {
      recommendations.push('Implement enhanced protection for sensitive personal data');
      recommendations.push('Ensure explicit consent for processing sensitive data');
    }

    if (dataTypes.some(dt => dt.classification === DataClassification.BIOMETRIC)) {
      recommendations.push('Biometric data requires special security measures and explicit consent');
      recommendations.push('Consider using alternative authentication methods');
    }

    // Consent recommendations
    if (!consent.hasConsentMechanism) {
      recommendations.push('Implement a clear consent mechanism for data processing');
    }

    if (!consent.isGranular) {
      recommendations.push('Provide granular consent options for different purposes');
    }

    if (!consent.isWithdrawable) {
      recommendations.push('Add functionality to withdraw consent easily');
    }

    // Data protection recommendations
    if (!dataProtection.encryption) {
      recommendations.push('Implement encryption for personal data at rest and in transit');
    }

    if (!dataProtection.pseudonymization) {
      recommendations.push('Consider pseudonymization techniques for data processing');
    }

    if (!dataProtection.accessControl) {
      recommendations.push('Implement robust access control mechanisms');
    }

    if (!dataProtection.dataMinimization) {
      recommendations.push('Apply data minimization principle - collect only necessary data');
    }

    if (!dataProtection.storageLimit) {
      recommendations.push('Define and implement data retention policies');
    }

    // Rights recommendations
    const missingRights = Object.entries(rights)
      .filter(([_, implemented]) => !implemented)
      .map(([right, _]) => right as GDPRRight);

    if (missingRights.length > 0) {
      recommendations.push(`Implement missing GDPR rights: ${missingRights.join(', ')}`);
    }

    // Norwegian specific recommendations
    if (dataTypes.some(dt => dt.field.includes('personalnumber') || dt.field.includes('nin'))) {
      recommendations.push('Norwegian personal numbers require special handling per Datatilsynet guidelines');
      recommendations.push('Consider using BankID for authentication instead of storing personal numbers');
    }

    return recommendations;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    dataTypes: GDPRResult['dataTypes'],
    issues: GDPRResult['issues'],
    consent: GDPRResult['consent'],
    dataProtection: GDPRResult['dataProtection'],
    rights: Record<GDPRRight, boolean>
  ): number {
    let score = 100;

    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 2;
          break;
      }
    });

    // Deduct for missing consent features
    const consentScore = Object.values(consent).filter(v => v).length;
    score -= (5 - consentScore) * 4;

    // Deduct for missing data protection
    const protectionScore = Object.values(dataProtection).filter(v => v).length;
    score -= (6 - protectionScore) * 3;

    // Deduct for missing rights
    const rightsScore = Object.values(rights).filter(v => v).length;
    score -= (7 - rightsScore) * 2;

    // Extra deduction for sensitive data without protection
    if (dataTypes.some(dt => dt.classification === DataClassification.SENSITIVE) && 
        !dataProtection.encryption) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create validation result
   */
  private createResult(
    compliant: boolean,
    score: number,
    dataTypes: GDPRResult['dataTypes'],
    issues: GDPRResult['issues'],
    recommendations: string[],
    consent?: GDPRResult['consent'],
    dataProtection?: GDPRResult['dataProtection'],
    rights?: Record<GDPRRight, boolean>
  ): GDPRResult {
    return {
      compliant,
      score,
      dataTypes,
      issues,
      consent: consent || {
        hasConsentMechanism: false,
        isGranular: false,
        isWithdrawable: false,
        isExplicit: false,
        isInformed: false
      },
      dataProtection: dataProtection || {
        encryption: false,
        pseudonymization: false,
        accessControl: false,
        dataMinimization: false,
        purposeLimitation: false,
        storageLimit: false
      },
      rights: rights || {
        [GDPRRight.ACCESS]: false,
        [GDPRRight.RECTIFICATION]: false,
        [GDPRRight.ERASURE]: false,
        [GDPRRight.RESTRICTION]: false,
        [GDPRRight.PORTABILITY]: false,
        [GDPRRight.OBJECTION]: false,
        [GDPRRight.AUTOMATED]: false
      },
      recommendations
    };
  }
}

/**
 * Generate GDPR compliance component
 */
export async function generateGDPRComponent(
  options: z.infer<typeof gdprComponentOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate GDPR service
  const serviceContent = `
${options.typescript ? `
import type { 
  DataClassification,
  LegalBasis,
  GDPRRight,
  ConsentRecord,
  DataSubjectRequest
} from '../types/gdpr';
` : ''}

/**
 * GDPR Compliance Service for ${options.projectName}
 * Handles consent, data subject rights, and compliance
 */
export class GDPRService {
  private consents = new Map<string, ConsentRecord[]>();
  private dataRegistry = new Map<string, DataClassification>();

  /**
   * Record consent
   */
  async recordConsent(
    userId${options.typescript ? ': string' : ''},
    purpose${options.typescript ? ': string' : ''},
    lawfulBasis${options.typescript ? ': LegalBasis' : ''},
    details${options.typescript ? ': any' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    const consentId = crypto.randomUUID();
    const consent${options.typescript ? ': ConsentRecord' : ''} = {
      id: consentId,
      userId,
      purpose,
      lawfulBasis,
      granted: true,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      details
    };
    
    const userConsents = this.consents.get(userId) || [];
    userConsents.push(consent);
    this.consents.set(userId, userConsents);
    
    return consentId;
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    userId${options.typescript ? ': string' : ''},
    consentId${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const userConsents = this.consents.get(userId) || [];
    const consent = userConsents.find(c => c.id === consentId);
    
    if (consent) {
      consent.granted = false;
      consent.withdrawnAt = new Date();
    }
  }

  /**
   * Handle data subject request
   */
  async handleDataSubjectRequest(
    request${options.typescript ? ': DataSubjectRequest' : ''}
  )${options.typescript ? ': Promise<any>' : ''} {
    switch (request.type) {
      case 'access':
        return this.handleAccessRequest(request.userId);
      
      case 'rectification':
        return this.handleRectificationRequest(request.userId, request.data);
      
      case 'erasure':
        return this.handleErasureRequest(request.userId);
      
      case 'portability':
        return this.handlePortabilityRequest(request.userId);
      
      case 'restriction':
        return this.handleRestrictionRequest(request.userId);
      
      case 'objection':
        return this.handleObjectionRequest(request.userId, request.purpose);
      
      default:
        throw new Error(\`Unknown request type: \${request.type}\`);
    }
  }

  /**
   * Privacy by design validation
   */
  validatePrivacyByDesign(
    feature${options.typescript ? ': any' : ''}
  )${options.typescript ? ': { valid: boolean; issues: string[] }' : ''} {
    const issues${options.typescript ? ': string[]' : ''} = [];
    
    // Check data minimization
    if (feature.dataFields?.length > 10) {
      issues.push('Consider data minimization - too many fields collected');
    }
    
    // Check purpose limitation
    if (!feature.purpose || feature.purpose.length < 10) {
      issues.push('Define clear purpose for data processing');
    }
    
    // Check security measures
    if (!feature.encryption && feature.sensitiveData) {
      issues.push('Sensitive data requires encryption');
    }
    
    // Check retention period
    if (!feature.retentionPeriod) {
      issues.push('Define data retention period');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate privacy notice
   */
  generatePrivacyNotice(
    language${options.typescript ? ': string' : ''} = 'en'
  )${options.typescript ? ': string' : ''} {
    if (language === 'nb') {
      return \`
# Personvernerklæring for ${options.projectName}

## 1. Behandlingsansvarlig
${options.projectName} er behandlingsansvarlig for behandlingen av personopplysninger som beskrevet i denne personvernerklæringen.

## 2. Personopplysninger vi behandler
Vi behandler følgende kategorier av personopplysninger:
- Kontaktinformasjon (navn, e-post, telefon)
- Brukerinformasjon (brukernavn, preferanser)
- Teknisk informasjon (IP-adresse, nettlesertype)

## 3. Rettslig grunnlag
Vi behandler personopplysninger basert på:
- Samtykke (GDPR art. 6 nr. 1 bokstav a)
- Avtale (GDPR art. 6 nr. 1 bokstav b)
- Rettslig forpliktelse (GDPR art. 6 nr. 1 bokstav c)

## 4. Dine rettigheter
Du har følgende rettigheter:
- Rett til innsyn (art. 15)
- Rett til retting (art. 16)
- Rett til sletting (art. 17)
- Rett til begrensning (art. 18)
- Rett til dataportabilitet (art. 20)
- Rett til å protestere (art. 21)

## 5. Kontakt oss
For spørsmål om personvern, kontakt: privacy@${options.projectName}.com
      \`;
    }
    
    return \`
# Privacy Notice for ${options.projectName}

## 1. Data Controller
${options.projectName} is the data controller for the processing of personal data described in this privacy notice.

## 2. Personal Data We Process
We process the following categories of personal data:
- Contact information (name, email, phone)
- User information (username, preferences)
- Technical information (IP address, browser type)

## 3. Legal Basis
We process personal data based on:
- Consent (GDPR Art. 6(1)(a))
- Contract (GDPR Art. 6(1)(b))
- Legal obligation (GDPR Art. 6(1)(c))

## 4. Your Rights
You have the following rights:
- Right of access (Art. 15)
- Right to rectification (Art. 16)
- Right to erasure (Art. 17)
- Right to restriction (Art. 18)
- Right to data portability (Art. 20)
- Right to object (Art. 21)

## 5. Contact Us
For privacy questions, contact: privacy@${options.projectName}.com
    \`;
  }

  // Helper methods for data subject requests
  private async handleAccessRequest(userId${options.typescript ? ': string' : ''}) {
    // TODO: Implement data access
    return { userId, data: {} };
  }

  private async handleRectificationRequest(userId${options.typescript ? ': string' : ''}, data${options.typescript ? ': any' : ''}) {
    // TODO: Implement data rectification
    return { userId, updated: true };
  }

  private async handleErasureRequest(userId${options.typescript ? ': string' : ''}) {
    // TODO: Implement data erasure
    return { userId, erased: true };
  }

  private async handlePortabilityRequest(userId${options.typescript ? ': string' : ''}) {
    // TODO: Implement data export
    return { userId, format: 'json', data: {} };
  }

  private async handleRestrictionRequest(userId${options.typescript ? ': string' : ''}) {
    // TODO: Implement processing restriction
    return { userId, restricted: true };
  }

  private async handleObjectionRequest(userId${options.typescript ? ': string' : ''}, purpose${options.typescript ? ': string' : ''}) {
    // TODO: Implement objection handling
    return { userId, purpose, objected: true };
  }
}

// Export singleton instance
export const gdprService = new GDPRService();`;

  files.set('services/gdpr-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'GDPR compliance service created successfully'
  };
}

// Component options schema
const gdprComponentOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export validator instance
export const gdprValidator = new GDPRValidator();
/**
 * Norwegian Compliance Module
 * 
 * Complete compliance system for Norwegian standards including:
 * - NSM (Nasjonal sikkerhetsmyndighet) security standards
 * - GDPR (General Data Protection Regulation) compliance
 * - WCAG AAA accessibility guidelines
 * - Norwegian government digital service standards
 * 
 * This module provides:
 * - Comprehensive compliance checking and validation
 * - Automated compliance enforcement during code generation
 * - Compliance reporting and audit trails
 * - Helper functions for implementing compliance in generated code
 * - Integration with the scaffolding system's service architecture
 */

// === Core Compliance Types and Enums ===
export {
  NSMClassification,
  GDPRDataCategory,
  GDPRLegalBasis,
  WCAGLevel,
} from './norwegian-compliance.js';

// === Compliance Interfaces ===
export type {
  NSMSecurityRequirements,
  PasswordComplexity,
  GDPRRequirements,
  WCAGRequirements,
  NorwegianServiceRequirements,
  NorwegianComplianceConfig,
  ComplianceCheckResult,
  ComplianceIssue,
  ComplianceWarning,
  ComplianceRecommendation,
  ComplianceFix,
  AuditInfo,
} from './norwegian-compliance.js';

// === Main Compliance Checker ===
export {
  NorwegianComplianceChecker,
  createDefaultNorwegianConfig,
  validateNSMClassification,
  getComplianceLevelDescription,
} from './norwegian-compliance.js';

// === Compliance Service ===
export {
  NorwegianComplianceService,
  createNorwegianComplianceService,
  createDefaultComplianceService,
} from './compliance-service.js';

export type {
  ComplianceServiceOptions,
  ComplianceCheckRequest,
  ComplianceServiceResult,
} from './compliance-service.js';

// === Compliance Helpers ===
export {
  ComplianceHelpers,
  wcagLevel,
  gdprNotice,
  nsmClassification,
  generateCSP,
  generateSecurityHeaders,
  generateGDPRConsent,
  generateGDPRDeletion,
  generateWCAGFormValidation,
  generateSkipNavigation,
  generateNorwegianLocaleSupport,
  generateAuditTrail,
} from './compliance-helpers.js';

// === Compliance Constants ===

/**
 * Norwegian compliance standards version information
 */
export const COMPLIANCE_STANDARDS = {
  NSM_VERSION: '2024.1',
  GDPR_VERSION: '2018',
  WCAG_VERSION: '2.1',
  DIGITAL_SERVICE_VERSION: '2023.1',
} as const;

/**
 * Default compliance requirements by classification level
 */
export const DEFAULT_REQUIREMENTS = {
  [NSMClassification.OPEN]: {
    authentication: false,
    encryption: false,
    auditLogging: false,
    dataLocalization: false,
    retentionMonths: 12,
  },
  [NSMClassification.RESTRICTED]: {
    authentication: true,
    encryption: false,
    auditLogging: true,
    dataLocalization: false,
    retentionMonths: 24,
  },
  [NSMClassification.CONFIDENTIAL]: {
    authentication: true,
    encryption: true,
    auditLogging: true,
    dataLocalization: true,
    retentionMonths: 60,
  },
  [NSMClassification.SECRET]: {
    authentication: true,
    encryption: true,
    auditLogging: true,
    dataLocalization: true,
    retentionMonths: 120,
  },
} as const;

/**
 * WCAG success criteria mappings
 */
export const WCAG_CRITERIA = {
  PERCEIVABLE: [
    'alt-text-images',
    'captions-videos',
    'color-contrast',
    'resize-text',
    'images-of-text',
  ],
  OPERABLE: [
    'keyboard-accessible',
    'no-seizures',
    'enough-time',
    'navigable',
  ],
  UNDERSTANDABLE: [
    'readable',
    'predictable',
    'input-assistance',
  ],
  ROBUST: [
    'compatible',
    'valid-code',
  ],
} as const;

/**
 * Norwegian government service integrations
 */
export const NORWEGIAN_SERVICES = {
  ID_PORTEN: {
    name: 'ID-porten',
    description: 'Norwegian national identity provider',
    url: 'https://www.digdir.no/felleslosninger/id-porten',
    testUrl: 'https://eid-exttest.difi.no',
  },
  ALTINN: {
    name: 'Altinn',
    description: 'Norwegian public sector digital services platform',
    url: 'https://www.altinn.no',
    apiUrl: 'https://platform.altinn.no',
  },
  BANK_ID: {
    name: 'BankID',
    description: 'Norwegian electronic identification system',
    url: 'https://www.bankid.no',
  },
  DIGIPOST: {
    name: 'Digipost',
    description: 'Norwegian digital mailbox service',
    url: 'https://www.digipost.no',
  },
  ENHETSREGISTERET: {
    name: 'Enhetsregisteret',
    description: 'Norwegian business registry',
    url: 'https://data.brreg.no',
    apiUrl: 'https://data.brreg.no/enhetsregisteret/api',
  },
} as const;

/**
 * Common compliance patterns for different component types
 */
export const COMPLIANCE_PATTERNS = {
  FORM_COMPONENT: {
    requirements: ['wcag-labels', 'wcag-validation', 'gdpr-consent'],
    templates: ['form-validation', 'error-handling', 'accessibility-support'],
  },
  DATA_COMPONENT: {
    requirements: ['gdpr-minimization', 'nsm-encryption', 'audit-logging'],
    templates: ['data-protection', 'consent-management', 'audit-trail'],
  },
  NAVIGATION_COMPONENT: {
    requirements: ['wcag-keyboard', 'wcag-skip-links', 'semantic-html'],
    templates: ['keyboard-navigation', 'skip-links', 'aria-labels'],
  },
  AUTHENTICATION_COMPONENT: {
    requirements: ['nsm-security', 'gdpr-consent', 'audit-logging'],
    templates: ['secure-authentication', 'session-management', 'audit-events'],
  },
} as const;

// === Utility Functions ===

/**
 * Get compliance requirements for a specific component type
 */
export function getComponentComplianceRequirements(
  componentType: keyof typeof COMPLIANCE_PATTERNS,
  classification: NSMClassification = NSMClassification.OPEN
): {
  requirements: string[];
  templates: string[];
  additionalChecks: string[];
} {
  const pattern = COMPLIANCE_PATTERNS[componentType];
  const baseRequirements = DEFAULT_REQUIREMENTS[classification];
  
  const additionalChecks: string[] = [];
  
  if (baseRequirements.authentication) {
    additionalChecks.push('authentication-required');
  }
  
  if (baseRequirements.encryption) {
    additionalChecks.push('data-encryption');
  }
  
  if (baseRequirements.auditLogging) {
    additionalChecks.push('audit-logging');
  }
  
  return {
    requirements: pattern.requirements,
    templates: pattern.templates,
    additionalChecks,
  };
}

/**
 * Check if a classification level requires specific compliance measures
 */
export function requiresComplianceMeasure(
  classification: NSMClassification,
  measure: 'authentication' | 'encryption' | 'auditLogging' | 'dataLocalization'
): boolean {
  const requirements = DEFAULT_REQUIREMENTS[classification];
  return requirements[measure];
}

/**
 * Get minimum WCAG level for classification
 */
export function getMinimumWCAGLevel(classification: NSMClassification): WCAGLevel {
  // Norwegian government requires AAA for all digital services
  return WCAGLevel.AAA;
}

/**
 * Get required Norwegian languages for classification
 */
export function getRequiredLanguages(classification: NSMClassification): string[] {
  // All Norwegian government services must support Norwegian Bokmål
  const required = ['nb-NO'];
  
  // Government services should also support Norwegian Nynorsk
  if (classification !== NSMClassification.OPEN) {
    required.push('nn-NO');
  }
  
  return required;
}

/**
 * Generate compliance metadata for templates
 */
export function generateComplianceMetadata(
  classification: NSMClassification,
  componentType?: keyof typeof COMPLIANCE_PATTERNS
): {
  nsm: { classification: NSMClassification };
  gdpr: boolean;
  wcag: WCAGLevel;
  requirements?: string[];
} {
  const metadata = {
    nsm: { classification },
    gdpr: classification !== NSMClassification.OPEN,
    wcag: getMinimumWCAGLevel(classification),
  };
  
  if (componentType) {
    const complianceReqs = getComponentComplianceRequirements(componentType, classification);
    return {
      ...metadata,
      requirements: [...complianceReqs.requirements, ...complianceReqs.additionalChecks],
    };
  }
  
  return metadata;
}

/**
 * Validate compliance configuration completeness
 */
export function validateComplianceConfiguration(config: any): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  
  // Check required project fields
  if (!config.project?.name) missingFields.push('project.name');
  if (!config.project?.dataController) missingFields.push('project.dataController');
  if (!config.project?.privacyOfficer) missingFields.push('project.privacyOfficer');
  
  // Check NSM configuration
  if (!config.nsm?.classification) missingFields.push('nsm.classification');
  
  // Check GDPR configuration
  if (!config.gdpr?.dataCategory) missingFields.push('gdpr.dataCategory');
  if (!config.gdpr?.legalBasis) missingFields.push('gdpr.legalBasis');
  
  // Check WCAG configuration
  if (!config.wcag?.level) missingFields.push('wcag.level');
  
  // Check localization
  if (!config.localization?.defaultLocale) missingFields.push('localization.defaultLocale');
  if (!config.localization?.supportedLocales?.length) missingFields.push('localization.supportedLocales');
  
  // Warnings for best practices
  if (!config.audit?.enabled) {
    warnings.push('Audit logging is disabled - recommended for compliance');
  }
  
  if (!config.localization?.supportedLocales?.includes('nb-NO')) {
    warnings.push('Norwegian Bokmål (nb-NO) should be supported for Norwegian compliance');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

// === Module Information ===

/**
 * Norwegian compliance module information
 */
export const COMPLIANCE_MODULE_INFO = {
  name: 'Norwegian Compliance Module',
  version: '1.0.0',
  description: 'Comprehensive Norwegian compliance system for NSM, GDPR, and WCAG standards',
  author: 'Xala Technologies',
  standards: COMPLIANCE_STANDARDS,
  features: [
    'NSM security classification support',
    'GDPR data protection compliance',
    'WCAG AAA accessibility validation',
    'Norwegian government service integration',
    'Automated compliance checking',
    'Compliance reporting and audit trails',
    'Multi-language support with Norwegian focus',
    'Real-time compliance monitoring',
  ],
  compatibility: {
    nodeJs: '>=18.0.0',
    typescript: '>=5.0.0',
    react: '>=18.0.0',
    nextJs: '>=14.0.0',
  },
} as const;
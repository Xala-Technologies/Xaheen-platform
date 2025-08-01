import type { NorwegianCompliance } from '@xaheen/core';

/**
 * Norwegian Security Authority (NSM) classification levels
 */
export type NSMClassification = 
  | 'OPEN'        // Åpen - Public information
  | 'INTERNAL'    // Intern - Internal use only
  | 'RESTRICTED'  // Begrenset - Restricted access
  | 'CONFIDENTIAL'; // Konfidensiell - Confidential

/**
 * WCAG compliance check result
 */
export interface WCAGComplianceResult {
  level: 'A' | 'AA' | 'AAA';
  passed: boolean;
  violations: WCAGViolation[];
  warnings: WCAGWarning[];
}

/**
 * WCAG violation details
 */
export interface WCAGViolation {
  rule: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  elements: string[];
  helpUrl: string;
}

/**
 * WCAG warning details
 */
export interface WCAGWarning {
  rule: string;
  description: string;
  suggestion: string;
}

/**
 * GDPR compliance check result
 */
export interface GDPRComplianceResult {
  compliant: boolean;
  dataTypes: DataTypeCompliance[];
  consentMechanisms: ConsentCompliance[];
  dataProtection: DataProtectionCompliance;
  violations: string[];
}

/**
 * Data type compliance details
 */
export interface DataTypeCompliance {
  type: 'personal' | 'sensitive' | 'special';
  field: string;
  encrypted: boolean;
  anonymized: boolean;
  retention: string;
  compliant: boolean;
}

/**
 * Consent mechanism compliance
 */
export interface ConsentCompliance {
  type: 'explicit' | 'implicit' | 'legitimate-interest';
  mechanism: string;
  withdrawable: boolean;
  documented: boolean;
  compliant: boolean;
}

/**
 * Data protection compliance
 */
export interface DataProtectionCompliance {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  accessControl: boolean;
  auditLogging: boolean;
  dataMinimization: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
}

/**
 * Norwegian Digital Service compliance result
 */
export interface DigitalServiceComplianceResult {
  compliant: boolean;
  standards: StandardCompliance[];
  accessibility: AccessibilityCompliance;
  security: SecurityCompliance;
  violations: string[];
}

/**
 * Standard compliance details
 */
export interface StandardCompliance {
  standard: string;
  version: string;
  compliant: boolean;
  gaps: string[];
}

/**
 * Accessibility compliance details
 */
export interface AccessibilityCompliance {
  wcagLevel: 'A' | 'AA' | 'AAA';
  keyboardNavigable: boolean;
  screenReaderCompatible: boolean;
  colorContrast: boolean;
  alternativeText: boolean;
  compliant: boolean;
}

/**
 * Security compliance details
 */
export interface SecurityCompliance {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  vulnerabilityScanning: boolean;
  penetrationTesting: boolean;
  incidentResponse: boolean;
  compliant: boolean;
}

/**
 * Complete compliance validation result
 */
export interface ComplianceValidationResult {
  timestamp: Date;
  projectName: string;
  overallCompliant: boolean;
  norwegianCompliance: NorwegianCompliance;
  nsm?: {
    classification: NSMClassification;
    compliant: boolean;
    requirements: string[];
  };
  gdpr?: GDPRComplianceResult;
  wcag?: WCAGComplianceResult;
  digitalServices?: DigitalServiceComplianceResult;
  recommendations: string[];
  criticalIssues: string[];
}
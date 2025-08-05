/**
 * Norwegian Compliance Types for Xala UI System
 * NSM Security Classifications and GDPR Compliance
 * @version 1.0.0
 */

// NSM Security Classification Levels
export type NSMClassification = 
  | 'OPEN'          // Public information
  | 'RESTRICTED'    // Limited distribution
  | 'CONFIDENTIAL' // Confidential information
  | 'SECRET';      // Secret information

// Norwegian Locale Support
export type NorwegianLocale = 
  | 'nb-NO'  // Norwegian Bokmål
  | 'nn-NO'  // Norwegian Nynorsk
  | 'se-NO'  // Northern Sami (Norway)
  | 'en-NO'; // English (Norway)

// GDPR Compliance Levels
export type GDPRComplianceLevel = 
  | 'minimal'    // Basic GDPR compliance
  | 'standard'   // Standard compliance with audit
  | 'enhanced'   // Enhanced compliance with encryption
  | 'maximum';   // Maximum compliance with full audit trail

// Accessibility Standards
export type NorwegianAccessibilityStandard = 
  | 'WCAG_AA'   // WCAG 2.1 AA (minimum legal requirement)
  | 'WCAG_AAA'  // WCAG 2.1 AAA (enhanced accessibility)
  | 'UU'        // Universell utforming (Universal Design Norway)
  | 'EU_AA';    // European Accessibility Act

// Government Design System Compatibility
export type DesignSystemCompatibility = 
  | 'altinn'      // Altinn Design System
  | 'regjeringen' // Government Design System (regjeringen.no)
  | 'kommune'     // Municipal design systems
  | 'udir'        // Norwegian Directorate for Education
  | 'nav'         // Norwegian Labour and Welfare Administration
  | 'skatteetaten'; // Norwegian Tax Administration

export interface NSMSecurityRequirements {
  readonly classification: NSMClassification;
  readonly dataHandling: {
    readonly encryption: boolean;
    readonly auditTrail: boolean;
    readonly accessControl: boolean;
    readonly dataRetention: string;
    readonly dataMinimization: boolean;
  };
  readonly technical: {
    readonly sslRequired: boolean;
    readonly authenticationRequired: boolean;
    readonly sessionTimeout: number; // minutes
    readonly ipWhitelisting: boolean;
    readonly vpnRequired: boolean;
  };
  readonly operational: {
    readonly userTraining: boolean;
    readonly incidentReporting: boolean;
    readonly regularAudits: boolean;
    readonly backgroundChecks: boolean;
  };
}

export interface GDPRComplianceRequirements {
  readonly level: GDPRComplianceLevel;
  readonly personalDataHandling: {
    readonly dataProcessingBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
    readonly consentManagement: boolean;
    readonly dataPortability: boolean;
    readonly rightToErasure: boolean;
    readonly dataAccuracy: boolean;
    readonly storageMinimization: boolean;
  };
  readonly technicalMeasures: {
    readonly encryption: boolean;
    readonly pseudonymization: boolean;
    readonly accessLogging: boolean;
    readonly dataBackup: boolean;
    readonly incidentDetection: boolean;
  };
  readonly organizationalMeasures: {
    readonly privacyByDesign: boolean;
    readonly dataProtectionOfficer: boolean;
    readonly privacyImpactAssessment: boolean;
    readonly staffTraining: boolean;
    readonly vendorAgreements: boolean;
  };
  readonly userRights: {
    readonly dataAccess: boolean;
    readonly dataRectification: boolean;
    readonly dataErasure: boolean;
    readonly dataPortability: boolean;
    readonly processingRestriction: boolean;
    readonly objectionToProcessing: boolean;
  };
}

export interface NorwegianAccessibilityRequirements {
  readonly standard: NorwegianAccessibilityStandard;
  readonly features: {
    readonly keyboardNavigation: boolean;
    readonly screenReaderSupport: boolean;
    readonly highContrast: boolean;
    readonly reducedMotion: boolean;
    readonly textScaling: boolean;
    readonly colorIndependence: boolean;
    readonly focusManagement: boolean;
  };
  readonly testing: {
    readonly automatedTesting: boolean;
    readonly manualTesting: boolean;
    readonly userTesting: boolean;
    readonly assistiveTechnologyTesting: boolean;
  };
  readonly documentation: {
    readonly accessibilityStatement: boolean;
    readonly userGuide: boolean;
    readonly keyboardShortcuts: boolean;
  };
}

export interface AltinnDesignSystemRequirements {
  readonly version: string;
  readonly components: string[];
  readonly designTokens: {
    readonly colors: boolean;
    readonly typography: boolean;
    readonly spacing: boolean;
    readonly breakpoints: boolean;
  };
  readonly patterns: {
    readonly formValidation: boolean;
    readonly navigation: boolean;
    readonly dataDisplay: boolean;
    readonly feedback: boolean;
  };
}

export interface NorwegianLocalizationRequirements {
  readonly primaryLocale: NorwegianLocale;
  readonly supportedLocales: NorwegianLocale[];
  readonly dateFormats: {
    readonly short: string; // dd.MM.yyyy
    readonly medium: string; // dd. MMM yyyy
    readonly long: string; // dd. MMMM yyyy
    readonly iso: string; // yyyy-MM-dd
  };
  readonly numberFormats: {
    readonly decimal: string; // 1 234,56
    readonly currency: string; // 1 234,56 kr
    readonly percentage: string; // 12,34 %
  };
  readonly culturalConsiderations: {
    readonly rtlSupport: boolean; // For Arabic and other RTL languages
    readonly religiousHolidays: boolean;
    readonly workingDays: number[]; // Monday = 1, Sunday = 7
    readonly timeZone: string; // Europe/Oslo
  };
}

export interface ComplianceAuditTrail {
  readonly enabled: boolean;
  readonly retention: {
    readonly duration: string; // ISO 8601 duration
    readonly storage: 'local' | 'database' | 'external';
  };
  readonly events: {
    readonly userActions: boolean;
    readonly dataAccess: boolean;
    readonly systemEvents: boolean;
    readonly securityEvents: boolean;
    readonly complianceEvents: boolean;
  };
  readonly format: {
    readonly structured: boolean; // JSON format
    readonly searchable: boolean;
    readonly exportable: boolean;
    readonly anonymization: boolean;
  };
}

export interface NorwegianComplianceConfig {
  readonly nsm?: NSMSecurityRequirements;
  readonly gdpr?: GDPRComplianceRequirements;
  readonly accessibility?: NorwegianAccessibilityRequirements;
  readonly designSystem?: AltinnDesignSystemRequirements;
  readonly localization?: NorwegianLocalizationRequirements;
  readonly auditTrail?: ComplianceAuditTrail;
  readonly metadata?: {
    readonly version: string;
    readonly lastUpdated: string; // ISO 8601 date
    readonly reviewDate: string; // ISO 8601 date
    readonly approvedBy: string;
    readonly complianceOfficer: string;
  };
}

// Predefined compliance configurations for common use cases
export const COMPLIANCE_PRESETS: Record<string, NorwegianComplianceConfig> = {
  PUBLIC_WEBSITE: {
    nsm: {
      classification: 'OPEN',
      dataHandling: {
        encryption: false,
        auditTrail: false,
        accessControl: false,
        dataRetention: 'Not applicable',
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: false,
        sessionTimeout: 0,
        ipWhitelisting: false,
        vpnRequired: false,
      },
      operational: {
        userTraining: false,
        incidentReporting: false,
        regularAudits: false,
        backgroundChecks: false,
      },
    },
    gdpr: {
      level: 'minimal',
      personalDataHandling: {
        dataProcessingBasis: 'legitimate_interests',
        consentManagement: true,
        dataPortability: false,
        rightToErasure: true,
        dataAccuracy: true,
        storageMinimization: true,
      },
      technicalMeasures: {
        encryption: false,
        pseudonymization: false,
        accessLogging: true,
        dataBackup: false,
        incidentDetection: false,
      },
      organizationalMeasures: {
        privacyByDesign: true,
        dataProtectionOfficer: false,
        privacyImpactAssessment: false,
        staffTraining: false,
        vendorAgreements: false,
      },
      userRights: {
        dataAccess: true,
        dataRectification: true,
        dataErasure: true,
        dataPortability: false,
        processingRestriction: true,
        objectionToProcessing: true,
      },
    },
    accessibility: {
      standard: 'WCAG_AA',
      features: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: true,
        reducedMotion: true,
        textScaling: true,
        colorIndependence: true,
        focusManagement: true,
      },
      testing: {
        automatedTesting: true,
        manualTesting: true,
        userTesting: false,
        assistiveTechnologyTesting: false,
      },
      documentation: {
        accessibilityStatement: true,
        userGuide: false,
        keyboardShortcuts: true,
      },
    },
    localization: {
      primaryLocale: 'nb-NO',
      supportedLocales: ['nb-NO', 'nn-NO', 'en-NO'],
      dateFormats: {
        short: 'dd.MM.yyyy',
        medium: 'dd. MMM yyyy',
        long: 'dd. MMMM yyyy',
        iso: 'yyyy-MM-dd',
      },
      numberFormats: {
        decimal: '1 234,56',
        currency: '1 234,56 kr',
        percentage: '12,34 %',
      },
      culturalConsiderations: {
        rtlSupport: false,
        religiousHolidays: false,
        workingDays: [1, 2, 3, 4, 5],
        timeZone: 'Europe/Oslo',
      },
    },
    auditTrail: {
      enabled: false,
      retention: {
        duration: 'P0D',
        storage: 'local',
      },
      events: {
        userActions: false,
        dataAccess: false,
        systemEvents: false,
        securityEvents: false,
        complianceEvents: false,
      },
      format: {
        structured: false,
        searchable: false,
        exportable: false,
        anonymization: false,
      },
    },
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: 'System Administrator',
      complianceOfficer: 'Data Protection Officer',
    },
  },
  
  GOVERNMENT_SERVICE: {
    nsm: {
      classification: 'RESTRICTED',
      dataHandling: {
        encryption: true,
        auditTrail: true,
        accessControl: true,
        dataRetention: 'P7Y', // 7 years
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: true,
        sessionTimeout: 30,
        ipWhitelisting: true,
        vpnRequired: true,
      },
      operational: {
        userTraining: true,
        incidentReporting: true,
        regularAudits: true,
        backgroundChecks: true,
      },
    },
    gdpr: {
      level: 'enhanced',
      personalDataHandling: {
        dataProcessingBasis: 'public_task',
        consentManagement: true,
        dataPortability: true,
        rightToErasure: true,
        dataAccuracy: true,
        storageMinimization: true,
      },
      technicalMeasures: {
        encryption: true,
        pseudonymization: true,
        accessLogging: true,
        dataBackup: true,
        incidentDetection: true,
      },
      organizationalMeasures: {
        privacyByDesign: true,
        dataProtectionOfficer: true,
        privacyImpactAssessment: true,
        staffTraining: true,
        vendorAgreements: true,
      },
      userRights: {
        dataAccess: true,
        dataRectification: true,
        dataErasure: true,
        dataPortability: true,
        processingRestriction: true,
        objectionToProcessing: true,
      },
    },
    accessibility: {
      standard: 'UU',
      features: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: true,
        reducedMotion: true,
        textScaling: true,
        colorIndependence: true,
        focusManagement: true,
      },
      testing: {
        automatedTesting: true,
        manualTesting: true,
        userTesting: true,
        assistiveTechnologyTesting: true,
      },
      documentation: {
        accessibilityStatement: true,
        userGuide: true,
        keyboardShortcuts: true,
      },
    },
    designSystem: {
      version: '2.0.0',
      components: ['forms', 'navigation', 'data-display', 'feedback'],
      designTokens: {
        colors: true,
        typography: true,
        spacing: true,
        breakpoints: true,
      },
      patterns: {
        formValidation: true,
        navigation: true,
        dataDisplay: true,
        feedback: true,
      },
    },
    localization: {
      primaryLocale: 'nb-NO',
      supportedLocales: ['nb-NO', 'nn-NO', 'en-NO', 'se-NO'],
      dateFormats: {
        short: 'dd.MM.yyyy',
        medium: 'dd. MMM yyyy',
        long: 'dd. MMMM yyyy',
        iso: 'yyyy-MM-dd',
      },
      numberFormats: {
        decimal: '1 234,56',
        currency: '1 234,56 kr',
        percentage: '12,34 %',
      },
      culturalConsiderations: {
        rtlSupport: true,
        religiousHolidays: true,
        workingDays: [1, 2, 3, 4, 5],
        timeZone: 'Europe/Oslo',
      },
    },
    auditTrail: {
      enabled: true,
      retention: {
        duration: 'P7Y',
        storage: 'database',
      },
      events: {
        userActions: true,
        dataAccess: true,
        systemEvents: true,
        securityEvents: true,
        complianceEvents: true,
      },
      format: {
        structured: true,
        searchable: true,
        exportable: true,
        anonymization: true,
      },
    },
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: 'Government IT Security Officer',
      complianceOfficer: 'Data Protection Officer',
    },
  },
  
  HEALTHCARE_SYSTEM: {
    nsm: {
      classification: 'CONFIDENTIAL',
      dataHandling: {
        encryption: true,
        auditTrail: true,
        accessControl: true,
        dataRetention: 'P30Y', // 30 years for medical records
        dataMinimization: true,
      },
      technical: {
        sslRequired: true,
        authenticationRequired: true,
        sessionTimeout: 15,
        ipWhitelisting: true,
        vpnRequired: true,
      },
      operational: {
        userTraining: true,
        incidentReporting: true,
        regularAudits: true,
        backgroundChecks: true,
      },
    },
    gdpr: {
      level: 'maximum',
      personalDataHandling: {
        dataProcessingBasis: 'vital_interests',
        consentManagement: true,
        dataPortability: true,
        rightToErasure: false, // Medical records exception
        dataAccuracy: true,
        storageMinimization: true,
      },
      technicalMeasures: {
        encryption: true,
        pseudonymization: true,
        accessLogging: true,
        dataBackup: true,
        incidentDetection: true,
      },
      organizationalMeasures: {
        privacyByDesign: true,
        dataProtectionOfficer: true,
        privacyImpactAssessment: true,
        staffTraining: true,
        vendorAgreements: true,
      },
      userRights: {
        dataAccess: true,
        dataRectification: true,
        dataErasure: false, // Medical records exception
        dataPortability: true,
        processingRestriction: true,
        objectionToProcessing: false, // Healthcare exception
      },
    },
    accessibility: {
      standard: 'WCAG_AAA',
      features: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: true,
        reducedMotion: true,
        textScaling: true,
        colorIndependence: true,
        focusManagement: true,
      },
      testing: {
        automatedTesting: true,
        manualTesting: true,
        userTesting: true,
        assistiveTechnologyTesting: true,
      },
      documentation: {
        accessibilityStatement: true,
        userGuide: true,
        keyboardShortcuts: true,
      },
    },
    localization: {
      primaryLocale: 'nb-NO',
      supportedLocales: ['nb-NO', 'nn-NO', 'en-NO'],
      dateFormats: {
        short: 'dd.MM.yyyy',
        medium: 'dd. MMM yyyy',
        long: 'dd. MMMM yyyy',
        iso: 'yyyy-MM-dd',
      },
      numberFormats: {
        decimal: '1 234,56',
        currency: '1 234,56 kr',
        percentage: '12,34 %',
      },
      culturalConsiderations: {
        rtlSupport: true,
        religiousHolidays: true,
        workingDays: [1, 2, 3, 4, 5, 6, 7], // Healthcare 24/7
        timeZone: 'Europe/Oslo',
      },
    },
    auditTrail: {
      enabled: true,
      retention: {
        duration: 'P30Y',
        storage: 'external',
      },
      events: {
        userActions: true,
        dataAccess: true,
        systemEvents: true,
        securityEvents: true,
        complianceEvents: true,
      },
      format: {
        structured: true,
        searchable: true,
        exportable: true,
        anonymization: true,
      },
    },
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      approvedBy: 'Chief Medical Information Officer',
      complianceOfficer: 'Healthcare Data Protection Officer',
    },
  },
};

// Utility functions for compliance validation
export function validateNSMClassification(classification: NSMClassification, data: any): boolean {
  // Implementation would check data against NSM requirements
  return true; // Placeholder
}

export function validateGDPRCompliance(config: GDPRComplianceRequirements, data: any): boolean {
  // Implementation would check data against GDPR requirements
  return true; // Placeholder
}

export function validateAccessibilityCompliance(
  standard: NorwegianAccessibilityStandard,
  component: any
): boolean {
  // Implementation would check component against accessibility standards
  return true; // Placeholder
}

export function getCompliancePreset(presetName: keyof typeof COMPLIANCE_PRESETS): NorwegianComplianceConfig {
  const preset = COMPLIANCE_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Compliance preset not found: ${presetName}`);
  }
  return preset;
}

// Missing type definitions for compatibility
export interface NorwegianComplianceTemplateConfig extends NorwegianComplianceConfig {
  readonly templateName: string;
  readonly templateDescription: string;
  readonly templateVersion: string;
  readonly compatiblePlatforms: string[];
  readonly exampleUsage?: string;
}

export interface GDPRRequirements {
  readonly personalDataHandling: {
    readonly dataProcessingBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
    readonly consentManagement: boolean;
    readonly dataPortability: boolean;
    readonly rightToErasure: boolean;
    readonly dataAccuracy: boolean;
    readonly storageMinimization: boolean;
  };
  readonly cookies: {
    readonly essential: boolean;
    readonly analytics: boolean;
    readonly marketing: boolean;
    readonly preferences: boolean;
    readonly consentRequired: boolean;
  };
  readonly userRights: {
    readonly dataAccess: boolean;
    readonly dataRectification: boolean;
    readonly dataErasure: boolean;
    readonly dataPortability: boolean;
    readonly processingRestriction: boolean;
    readonly objectionToProcessing: boolean;
  };
  readonly dataProcessing: {
    readonly lawfulBasis: string;
    readonly purposeLimitation: boolean;
    readonly dataMinimization: boolean;
    readonly accuracyPrinciple: boolean;
    readonly storageLimitation: boolean;
    readonly integrityConfidentiality: boolean;
    readonly accountability: boolean;
  };
  readonly privacyNotice: {
    readonly dataController: string;
    readonly contactDetails: string;
    readonly processingPurposes: string[];
    readonly legalBasis: string;
    readonly dataRetention: string;
    readonly dataRecipients: string[];
    readonly userRights: string[];
  };
}

// Additional type aliases for compatibility
export type NSMClassifiedTemplate = NorwegianComplianceTemplateConfig;
export type NSMAccessControls = {
  readonly authenticationRequired: boolean;
  readonly roleBasedAccess: boolean;
  readonly multiFactorAuth: boolean;
  readonly ipWhitelisting: boolean;
  readonly vpnRequired: boolean;
};
export type NSMAuditRequirements = NSMSecurityRequirements;
export type GDPRConsentConfig = GDPRRequirements['personalDataHandling'];
export type GDPRCookieConsent = GDPRRequirements['cookies'];
export type GDPRDataProcessingRecord = GDPRRequirements['dataProcessing'];
export type GDPRUserRights = GDPRRequirements['userRights'];  
export type GDPRPrivacyNotice = GDPRRequirements['privacyNotice'];

// Accessibility types
export interface AccessibilityViolation {
  readonly type: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly element?: string;
  readonly recommendation: string;
}

export interface AccessibilityValidationResult {
  readonly success: boolean;
  readonly violations: AccessibilityViolation[];
  readonly score: number;
}

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type AccessibilityViolationType = 'color-contrast' | 'missing-label' | 'keyboard-navigation' | 'focus-management';

// Altinn design tokens
export interface AltinnColorTokens {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly neutral: string;
  readonly semantic: Record<string, string>;
}

export interface AltinnTypographyTokens {
  readonly fontFamily: string;
  readonly fontSize: Record<string, string>;
  readonly fontWeight: Record<string, number>;
  readonly lineHeight: Record<string, number>;
}

export interface AltinnSpacingTokens {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

export interface AltinnBreakpointTokens {
  readonly mobile: string;
  readonly tablet: string;
  readonly desktop: string;
  readonly wide: string;
}

// Norwegian localization types
export interface NorwegianDateFormats {
  readonly short: string;
  readonly medium: string;
  readonly long: string;
  readonly full: string;
}

export interface NorwegianNumberFormats {
  readonly decimal: string;
  readonly currency: string;
  readonly percent: string;
}

export interface NorwegianCulturalSettings {
  readonly locale: 'nb-NO' | 'nn-NO';
  readonly dateFormats: NorwegianDateFormats;
  readonly numberFormats: NorwegianNumberFormats;
  readonly firstDayOfWeek: number;
}

export interface NorwegianTranslations {
  readonly [key: string]: string | NorwegianTranslations;
}

// RTL types
export type RTLLanguage = 'ar' | 'he' | 'fa' | 'ur';
export type TextDirection = 'ltr' | 'rtl';

export interface RTLConfiguration {
  readonly enabled: boolean;
  readonly languages: RTLLanguage[];
  readonly defaultDirection: TextDirection;
}

export interface RTLTranslations {
  readonly [key: string]: {
    readonly text: string;
    readonly direction: TextDirection;
  };
}

// Classification template types
export interface ClassificationTemplateConfig {
  readonly classification: NSMClassification;
  readonly styling: ClassificationStyling;
  readonly features: string[];
}

export interface ClassificationStyling {
  readonly colors: Record<string, string>;
  readonly badges: boolean;
  readonly watermarks: boolean;
}

// Audit types
export interface AuditEvent {
  readonly id: string;
  readonly type: AuditEventType;
  readonly timestamp: string;
  readonly userId?: string;
  readonly data: Record<string, unknown>;
}

export type AuditEventType = 'user-action' | 'data-access' | 'security-event' | 'system-event';

export interface AuditConfiguration {
  readonly enabled: boolean;
  readonly events: AuditEventType[];
  readonly retention: number; // days
}

// Validation types
export interface ComplianceValidationRequest {
  readonly config: unknown;
  readonly complianceRequirements: NorwegianComplianceConfig;
}

export interface ComplianceViolation {
  readonly category: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly code: string;
  readonly message: string;
  readonly recommendation: string;
  readonly reference?: string;
  readonly autoFixable: boolean;
}

export interface ComplianceValidationResult {
  readonly success: boolean;
  readonly violations: ComplianceViolation[];
  readonly summary: ComplianceValidationSummary;
}

export interface ComplianceValidationSummary {
  readonly totalViolations: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  readonly complianceScore: number;
}

export function createCustomCompliance(overrides: Partial<NorwegianComplianceConfig>): NorwegianComplianceConfig {
  const base = COMPLIANCE_PRESETS.PUBLIC_WEBSITE;
  if (!base) {
    throw new Error('PUBLIC_WEBSITE preset not found');
  }
  
  // Create a mutable version with proper metadata handling
  const mergedMetadata = base.metadata ? {
    ...base.metadata,
    lastUpdated: new Date().toISOString(),
    ...(overrides.metadata || {}),
  } : overrides.metadata;
  
  const result: NorwegianComplianceConfig = {
    ...base,
    ...overrides,
    metadata: mergedMetadata,
  };
  
  return result;
}
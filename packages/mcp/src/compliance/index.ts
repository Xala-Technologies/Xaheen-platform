/**
 * Norwegian Compliance System - Complete Export Index
 * Comprehensive compliance solution for Norwegian applications
 * @version 1.0.0
 */

// Core Types
export * from '../types/norwegian-compliance.js';

// NSM Classification System
export { 
  NSMClassificationService,
  NSM_CLASSIFICATION_TEMPLATES 
} from './nsm-classification.js';

// GDPR Compliance
export { 
  GDPRComplianceService,
  GDPR_COMPLIANCE_TEMPLATES 
} from './gdpr-compliance.js';

// Accessibility Validation
export { 
  AccessibilityValidationService,
  WCAG_COLOR_CONTRAST,
  WCAG_KEYBOARD_NAVIGATION,
  WCAG_SCREEN_READER 
} from './accessibility-validation.js';

// Altinn Design System
export { 
  AltinnDesignSystemService,
  ALTINN_COLOR_TOKENS,
  ALTINN_TYPOGRAPHY_TOKENS,
  ALTINN_SPACING_TOKENS,
  ALTINN_BREAKPOINT_TOKENS 
} from './altinn-design-system.js';

// Norwegian Localization
export { 
  NorwegianLocalizationService,
  NORWEGIAN_DATE_FORMATS,
  NORWEGIAN_NUMBER_FORMATS,
  NORWEGIAN_CULTURAL_SETTINGS,
  NORWEGIAN_TRANSLATIONS_NB,
  NORWEGIAN_TRANSLATIONS_NN 
} from './norwegian-localization.js';

// RTL Support
export { 
  RTLSupportService,
  ARABIC_TRANSLATIONS,
  RTL_CONFIGURATIONS 
} from './rtl-support.js';

// Classification Templates
export { 
  ClassificationTemplateService 
} from './classification-templates.js';

// Audit Trail Templates
export { 
  AuditTrailTemplateService 
} from './audit-trail-templates.js';

// Comprehensive Compliance Validation
export { 
  ComplianceValidationService 
} from './compliance-validation.js';

// Re-export important types for convenience
export type {
  // Core compliance types
  NSMClassification,
  GDPRComplianceLevel,
  NorwegianAccessibilityStandard,
  NorwegianLocale,
  NorwegianComplianceConfig,
  
  // NSM types
  NSMSecurityRequirements,
  NSMClassifiedTemplate,
  NSMAccessControls,
  NSMAuditRequirements,
  
  // GDPR types
  GDPRComplianceRequirements,
  GDPRConsentConfig,
  GDPRCookieConsent,
  GDPRDataProcessingRecord,
  GDPRUserRights,
  GDPRPrivacyNotice,
  
  // Accessibility types
  AccessibilityViolation,
  AccessibilityValidationResult,
  WCAGLevel,
  AccessibilityViolationType,
  
  // Altinn types
  AltinnColorTokens,
  AltinnTypographyTokens,
  AltinnSpacingTokens,
  AltinnBreakpointTokens,
  AltinnDesignSystemRequirements,
  
  // Localization types
  NorwegianDateFormats,
  NorwegianNumberFormats,
  NorwegianCulturalSettings,
  NorwegianTranslations,
  NorwegianLocalizationRequirements,
  
  // RTL types
  RTLLanguage,
  TextDirection,
  RTLConfiguration,
  RTLTranslations,
  
  // Classification template types
  ClassificationTemplateConfig,
  ClassificationStyling,
  
  // Audit trail types
  AuditEvent,
  AuditEventType,
  AuditConfiguration,
  
  // Validation types
  ComplianceValidationRequest,
  ComplianceViolation,
  ComplianceValidationResult,
  ComplianceValidationSummary,
} from '../types/norwegian-compliance.js';

// Utility functions for common use cases
export const NorwegianCompliance = {
  /**
   * Get complete compliance configuration for a specific use case
   */
  getPresetConfig: (preset: 'PUBLIC_WEBSITE' | 'GOVERNMENT_SERVICE' | 'HEALTHCARE_SYSTEM') => {
    const { COMPLIANCE_PRESETS } = require('./norwegian-localization.js');
    return COMPLIANCE_PRESETS[preset];
  },

  /**
   * Validate a component against all Norwegian standards
   */
  validateComponent: async (component: any, classification: NSMClassification = 'OPEN') => {
    const { ComplianceValidationService } = await import('./compliance-validation.js');
    return ComplianceValidationService.validateTemplate({
      templateName: component.name || 'Unknown',
      templateType: component.type || 'component',
      content: component,
      metadata: component.metadata || {},
      targetClassification: classification,
      gdprLevel: 'standard',
      accessibilityStandard: 'WCAG_AAA',
      requireAltinnCompatibility: false,
      supportedLocales: ['nb-NO', 'nn-NO', 'en-NO'],
      requireRTLSupport: false,
    });
  },

  /**
   * Generate a fully compliant Norwegian component
   */
  generateCompliantComponent: (
    name: string, 
    type: string, 
    classification: NSMClassification = 'OPEN'
  ) => {
    const { ClassificationTemplateService } = require('./classification-templates.js');
    return ClassificationTemplateService.generateClassifiedComponent(name, classification, type);
  },

  /**
   * Get Norwegian locale provider with all translations
   */
  createLocaleProvider: (locale: 'nb-NO' | 'nn-NO' | 'en-NO' = 'nb-NO') => {
    const { NorwegianLocalizationService } = require('./norwegian-localization.js');
    return NorwegianLocalizationService.generateLocaleProviderTemplate();
  },

  /**
   * Create GDPR-compliant cookie consent banner
   */
  createCookieConsent: (locale: string = 'nb-NO') => {
    const { GDPRComplianceService } = require('./gdpr-compliance.js');
    return GDPRComplianceService.generateCookieConsentTemplate(locale);
  },

  /**
   * Create NSM-compliant audit logger
   */
  createAuditLogger: () => {
    const { AuditTrailTemplateService } = require('./audit-trail-templates.js');
    return AuditTrailTemplateService.generateAuditLogger();
  },

  /**
   * Generate Altinn-compatible component
   */
  createAltinnComponent: (componentName: string) => {
    const { AltinnDesignSystemService } = require('./altinn-design-system.js');
    return AltinnDesignSystemService.generateButtonTemplate(); // Example - expand as needed
  },

  /**
   * Create RTL-aware component
   */
  createRTLComponent: (componentName: string, direction: 'rtl' | 'ltr' = 'rtl') => {
    const { RTLSupportService } = require('./rtl-support.js');
    return RTLSupportService.generateRTLAwareComponent(componentName, direction);
  },

  /**
   * Generate accessibility test suite
   */
  createAccessibilityTests: () => {
    const { AccessibilityValidationService } = require('./accessibility-validation.js');
    return AccessibilityValidationService.generateAccessibilityTestTemplate();
  },
};

// Default export for convenience
export default NorwegianCompliance;

/**
 * Usage Examples:
 * 
 * // Basic validation
 * const result = await NorwegianCompliance.validateComponent(myComponent, 'RESTRICTED');
 * 
 * // Generate compliant component
 * const componentCode = NorwegianCompliance.generateCompliantComponent('UserForm', 'form', 'CONFIDENTIAL');
 * 
 * // Create locale provider
 * const localeProvider = NorwegianCompliance.createLocaleProvider('nb-NO');
 * 
 * // Create GDPR cookie consent
 * const cookieConsent = NorwegianCompliance.createCookieConsent('nb-NO');
 * 
 * // Create audit logger
 * const auditLogger = NorwegianCompliance.createAuditLogger();
 * 
 * // Generate accessibility tests
 * const accessibilityTests = NorwegianCompliance.createAccessibilityTests();
 */
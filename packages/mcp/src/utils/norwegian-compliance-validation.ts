/**
 * Norwegian Compliance Validation Utilities
 * Implements NSM, GDPR, and accessibility validation
 */

import { z } from 'zod';
import type {
  NSMClassification,
  GDPRComplianceLevel,
  NorwegianAccessibilityStandard,
  NorwegianComplianceConfig,
  ComponentConfig,
} from '../types/index.js';
import { EnhancedValidator, ValidationResult } from './enhanced-validation.js';

/**
 * NSM Classification validation schemas
 */
const NSMClassificationSchema = z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']);

const NSMDataHandlingSchema = z.object({
  encryption: z.boolean(),
  auditTrail: z.boolean(),
  accessControl: z.boolean(),
  dataRetention: z.string(),
  dataMinimization: z.boolean(),
});

const NSMTechnicalSchema = z.object({
  sslRequired: z.boolean(),
  authenticationRequired: z.boolean(),
  sessionTimeout: z.number().min(0),
  ipWhitelisting: z.boolean(),
  vpnRequired: z.boolean(),
});

/**
 * GDPR compliance validation schemas
 */
const GDPRLevelSchema = z.enum(['minimal', 'standard', 'enhanced', 'maximum']);

const GDPRPersonalDataSchema = z.object({
  dataProcessingBasis: z.enum([
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_task',
    'legitimate_interests',
  ]),
  consentManagement: z.boolean(),
  dataPortability: z.boolean(),
  rightToErasure: z.boolean(),
  dataAccuracy: z.boolean(),
  storageMinimization: z.boolean(),
});

/**
 * Accessibility validation schemas
 */
const AccessibilityStandardSchema = z.enum(['WCAG_AA', 'WCAG_AAA', 'UU', 'EU_AA']);

const AccessibilityFeaturesSchema = z.object({
  keyboardNavigation: z.boolean(),
  screenReaderSupport: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  textScaling: z.boolean(),
  colorIndependence: z.boolean(),
  focusManagement: z.boolean(),
});

/**
 * Enhanced Norwegian Compliance Validator
 */
export class NorwegianComplianceValidator extends EnhancedValidator {
  /**
   * Validate component against Norwegian compliance requirements
   */
  static validateNorwegianCompliance(
    config: ComponentConfig,
    complianceConfig: NorwegianComplianceConfig
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate NSM requirements
    const nsmResult = this.validateNSMRequirements(config, complianceConfig.nsm);
    if (!nsmResult.success && nsmResult.errors) {
      errors.push(...nsmResult.errors);
    }
    if (nsmResult.warnings) {
      warnings.push(...nsmResult.warnings);
    }

    // Validate GDPR requirements
    const gdprResult = this.validateGDPRRequirements(config, complianceConfig.gdpr);
    if (!gdprResult.success && gdprResult.errors) {
      errors.push(...gdprResult.errors);
    }
    if (gdprResult.warnings) {
      warnings.push(...gdprResult.warnings);
    }

    // Validate accessibility requirements
    const a11yResult = this.validateAccessibilityRequirements(
      config,
      complianceConfig.accessibility
    );
    if (!a11yResult.success && a11yResult.errors) {
      errors.push(...a11yResult.errors);
    }
    if (a11yResult.warnings) {
      warnings.push(...a11yResult.warnings);
    }

    // Validate localization requirements
    const l10nResult = this.validateLocalizationRequirements(
      config,
      complianceConfig.localization
    );
    if (!l10nResult.success && l10nResult.errors) {
      errors.push(...l10nResult.errors);
    }
    if (l10nResult.warnings) {
      warnings.push(...l10nResult.warnings);
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? config : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate NSM security requirements
   */
  private static validateNSMRequirements(
    config: ComponentConfig,
    nsmConfig: NorwegianComplianceConfig['nsm']
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate classification-specific requirements
    if (!nsmConfig) {
      errors.push({
        field: 'nsm',
        message: 'NSM configuration is required',
        code: 'NSM_MISSING',
        suggestions: ['Add NSM configuration to compliance settings']
      });
      return { success: false, errors, warnings };
    }

    switch (nsmConfig.classification) {
      case 'SECRET':
        if (!config.features.interactive) {
          errors.push({
            field: 'features.interactive',
            message: 'SECRET classification requires interactive features for authentication',
            code: 'NSM_SECRET_INTERACTIVE',
            suggestions: ['Enable interactive features for MFA and secure channels'],
          });
        }
        if (config.responsive.breakpoints.includes('mobile')) {
          warnings.push({
            field: 'responsive.breakpoints',
            message: 'SECRET data should not be accessible on mobile devices',
            suggestion: 'Consider restricting to desktop-only access',
          });
        }
        break;

      case 'CONFIDENTIAL':
        if (!nsmConfig.dataHandling.encryption) {
          errors.push({
            field: 'compliance.nsm.dataHandling.encryption',
            message: 'CONFIDENTIAL classification requires encryption',
            code: 'NSM_CONFIDENTIAL_ENCRYPTION',
            suggestions: ['Enable encryption for all CONFIDENTIAL data'],
          });
        }
        if (nsmConfig.technical.sessionTimeout > 15) {
          warnings.push({
            field: 'compliance.nsm.technical.sessionTimeout',
            message: 'CONFIDENTIAL data should have shorter session timeouts',
            suggestion: 'Consider reducing session timeout to 15 minutes or less',
          });
        }
        break;

      case 'RESTRICTED':
        if (!nsmConfig.technical.authenticationRequired) {
          errors.push({
            field: 'compliance.nsm.technical.authenticationRequired',
            message: 'RESTRICTED classification requires authentication',
            code: 'NSM_RESTRICTED_AUTH',
            suggestions: ['Enable authentication for RESTRICTED data access'],
          });
        }
        break;

      case 'OPEN':
        // No specific requirements for OPEN classification
        break;
    }

    // General NSM validation
    if (nsmConfig.dataHandling.auditTrail && !config.features.interactive) {
      warnings.push({
        field: 'features.interactive',
        message: 'Audit trail works best with interactive features enabled',
        suggestion: 'Enable interactive features for better audit trail functionality',
      });
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate GDPR requirements
   */
  private static validateGDPRRequirements(
    config: ComponentConfig,
    gdprConfig: NorwegianComplianceConfig['gdpr']
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    if (!gdprConfig) {
      errors.push({
        field: 'gdpr',
        message: 'GDPR configuration is required',
        code: 'GDPR_MISSING',
        suggestions: ['Add GDPR configuration to compliance settings']
      });
      return { success: false, errors, warnings };
    }

    // Validate consent management
    if (gdprConfig.personalDataHandling.consentManagement && !config.features.interactive) {
      errors.push({
        field: 'features.interactive',
        message: 'Consent management requires interactive features',
        code: 'GDPR_CONSENT_INTERACTIVE',
        suggestions: ['Enable interactive features for consent management'],
      });
    }

    // Validate data portability
    if (gdprConfig.personalDataHandling.dataPortability && !config.features.interactive) {
      warnings.push({
        field: 'features.interactive',
        message: 'Data portability features work best with interactive components',
        suggestion: 'Enable interactive features for data export functionality',
      });
    }

    // Validate encryption for enhanced/maximum levels
    if (
      (gdprConfig.level === 'enhanced' || gdprConfig.level === 'maximum') &&
      !gdprConfig.technicalMeasures.encryption
    ) {
      errors.push({
        field: 'compliance.gdpr.technicalMeasures.encryption',
        message: `${gdprConfig.level.toUpperCase()} GDPR level requires encryption`,
        code: 'GDPR_ENCRYPTION_REQUIRED',
        suggestions: ['Enable encryption for enhanced GDPR compliance'],
      });
    }

    // Validate audit logging
    if (gdprConfig.technicalMeasures.accessLogging && !config.features.interactive) {
      warnings.push({
        field: 'features.interactive',
        message: 'Access logging works best with interactive features',
        suggestion: 'Enable interactive features for comprehensive access logging',
      });
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate accessibility requirements
   */
  private static validateAccessibilityRequirements(
    config: ComponentConfig,
    a11yConfig: NorwegianComplianceConfig['accessibility']
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    if (!a11yConfig) {
      errors.push({
        field: 'accessibility',
        message: 'Accessibility configuration is required',
        code: 'A11Y_MISSING',
        suggestions: ['Add accessibility configuration to compliance settings']
      });
      return { success: false, errors, warnings };
    }

    // Validate accessibility level match
    if (a11yConfig.standard === 'WCAG_AAA' && config.accessibility.level !== 'AAA') {
      errors.push({
        field: 'accessibility.level',
        message: 'Component must have AAA accessibility level for WCAG_AAA standard',
        code: 'A11Y_LEVEL_MISMATCH',
        suggestions: ['Set accessibility.level to "AAA"'],
      });
    }

    if (a11yConfig.standard === 'WCAG_AA' && config.accessibility.level !== 'AA' && config.accessibility.level !== 'AAA') {
      errors.push({
        field: 'accessibility.level',
        message: 'Component must have at least AA accessibility level for WCAG_AA standard',
        code: 'A11Y_LEVEL_INSUFFICIENT',
        suggestions: ['Set accessibility.level to "AA" or "AAA"'],
      });
    }

    // Validate required features
    if (a11yConfig.features.keyboardNavigation && !config.accessibility.keyboardNavigation) {
      errors.push({
        field: 'accessibility.keyboardNavigation',
        message: 'Keyboard navigation is required by compliance standards',
        code: 'A11Y_KEYBOARD_NAV',
        suggestions: ['Enable keyboard navigation support'],
      });
    }

    if (a11yConfig.features.screenReaderSupport && !config.accessibility.screenReader) {
      errors.push({
        field: 'accessibility.screenReader',
        message: 'Screen reader support is required by compliance standards',
        code: 'A11Y_SCREEN_READER',
        suggestions: ['Enable screen reader support'],
      });
    }

    // Validate testing requirements
    if (a11yConfig.testing.automatedTesting && !config.accessibility.ariaLabels) {
      warnings.push({
        field: 'accessibility.ariaLabels',
        message: 'ARIA labels improve automated accessibility testing',
        suggestion: 'Enable ARIA labels for better test coverage',
      });
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate localization requirements
   */
  private static validateLocalizationRequirements(
    config: ComponentConfig,
    l10nConfig: NorwegianComplianceConfig['localization']
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    if (!l10nConfig) {
      warnings.push({
        field: 'localization',
        message: 'Localization configuration not provided, using defaults',
        suggestion: 'Add localization configuration for better internationalization'
      });
      return { success: true, errors, warnings };
    }

    // Check if component locale is supported
    if (config.locale && !l10nConfig.supportedLocales.includes(config.locale as any)) {
      warnings.push({
        field: 'locale',
        message: `Locale "${config.locale}" is not in the supported locales list`,
        suggestion: `Use one of: ${l10nConfig.supportedLocales.join(', ')}`,
      });
    }

    // Check RTL support for Arabic
    if (
      l10nConfig.supportedLocales.some(locale => locale.startsWith('ar')) &&
      !l10nConfig.culturalConsiderations.rtlSupport
    ) {
      warnings.push({
        field: 'compliance.localization.culturalConsiderations.rtlSupport',
        message: 'RTL support should be enabled when supporting Arabic locales',
        suggestion: 'Enable RTL support for proper Arabic text rendering',
      });
    }

    // Validate primary locale
    if (!config.locale) {
      warnings.push({
        field: 'locale',
        message: 'No locale specified, will use primary locale',
        suggestion: `Component will default to ${l10nConfig.primaryLocale}`,
      });
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Get compliance recommendations based on component type
   */
  static getComplianceRecommendations(
    category: ComponentConfig['category'],
    classification: NSMClassification
  ): string[] {
    const recommendations: string[] = [];

    // Category-specific recommendations
    switch (category) {
      case 'form':
        recommendations.push('Implement proper form validation');
        recommendations.push('Add clear error messages in Norwegian');
        if (classification !== 'OPEN') {
          recommendations.push('Enable audit trail for form submissions');
          recommendations.push('Implement data encryption for form data');
        }
        break;

      case 'data-display':
        recommendations.push('Ensure data is properly formatted for Norwegian locale');
        if (classification === 'CONFIDENTIAL' || classification === 'SECRET') {
          recommendations.push('Disable bulk data export features');
          recommendations.push('Implement row-level access control');
        }
        break;

      case 'layouts':
        recommendations.push('Include proper navigation landmarks');
        recommendations.push('Ensure responsive design for all screen sizes');
        if (classification !== 'OPEN') {
          recommendations.push('Add session timeout warnings');
          recommendations.push('Include security classification badges');
        }
        break;
    }

    // Classification-specific recommendations
    switch (classification) {
      case 'SECRET':
        recommendations.push('Implement multi-factor authentication');
        recommendations.push('Use end-to-end encryption');
        recommendations.push('Restrict to VPN access only');
        recommendations.push('Enable comprehensive audit logging');
        break;

      case 'CONFIDENTIAL':
        recommendations.push('Implement strong authentication');
        recommendations.push('Enable data encryption at rest');
        recommendations.push('Set short session timeouts (15 min)');
        recommendations.push('Log all data access attempts');
        break;

      case 'RESTRICTED':
        recommendations.push('Require user authentication');
        recommendations.push('Implement basic audit trail');
        recommendations.push('Use HTTPS/TLS encryption');
        break;

      case 'OPEN':
        recommendations.push('Implement cookie consent banner');
        recommendations.push('Ensure WCAG AA compliance minimum');
        recommendations.push('Support multiple Norwegian locales');
        break;
    }

    return recommendations;
  }

  /**
   * Format Norwegian compliance validation result
   */
  static formatNorwegianComplianceError(result: ValidationResult): string {
    if (result.success) {
      return '✅ **Norwegian Compliance Validation Passed**\n\nAll compliance requirements met.';
    }

    let message = '❌ **Norwegian Compliance Validation Failed**\n\n';

    if (result.errors) {
      message += '**Compliance Errors:**\n';
      result.errors.forEach((error, index) => {
        message += `${index + 1}. **${error.field}**: ${error.message}\n`;
        
        // Add compliance-specific context
        if (error.code?.startsWith('NSM_')) {
          message += '   🛡️ NSM Security Requirement\n';
        } else if (error.code?.startsWith('GDPR_')) {
          message += '   🔒 GDPR Compliance Requirement\n';
        } else if (error.code?.startsWith('A11Y_')) {
          message += '   ♿ Accessibility Requirement\n';
        }
        
        if (error.suggestions && error.suggestions.length > 0) {
          message += '   💡 Suggestions:\n';
          error.suggestions.forEach(suggestion => {
            message += `   • ${suggestion}\n`;
          });
        }
        message += '\n';
      });
    }

    if (result.warnings) {
      message += '⚠️ **Compliance Warnings:**\n';
      result.warnings.forEach((warning, index) => {
        message += `${index + 1}. **${warning.field}**: ${warning.message}\n`;
        message += `   💡 Recommendation: ${warning.suggestion}\n\n`;
      });
    }

    message += '\n📋 **Compliance Resources:**\n';
    message += '• [NSM Security Guidelines](https://nsm.no/)\n';
    message += '• [Norwegian GDPR Implementation](https://www.datatilsynet.no/)\n';
    message += '• [WCAG Norwegian Guidelines](https://www.uutilsynet.no/)\n';
    message += '• [Altinn Design System](https://designsystem.altinn.studio/)\n';

    return message;
  }
}
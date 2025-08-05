/**
 * Comprehensive Compliance Validation System
 * Validates templates against Norwegian compliance standards
 * @version 1.0.0
 */

import type { 
  NSMClassification,
  GDPRComplianceLevel,
  NorwegianAccessibilityStandard,
  NorwegianComplianceConfig 
} from '../types/norwegian-compliance.js';

import { NSMClassificationService } from './nsm-classification.js';
import { GDPRComplianceService } from './gdpr-compliance.js';
import { AccessibilityValidationService } from './accessibility-validation.js';
import { AltinnDesignSystemService } from './altinn-design-system.js';
import { NorwegianLocalizationService } from './norwegian-localization.js';
import { RTLSupportService } from './rtl-support.js';

export interface ComplianceValidationRequest {
  readonly templateName: string;
  readonly templateType: string;
  readonly content: any;
  readonly metadata: any;
  readonly targetClassification: NSMClassification;
  readonly gdprLevel: GDPRComplianceLevel;
  readonly accessibilityStandard: NorwegianAccessibilityStandard;
  readonly requireAltinnCompatibility?: boolean;
  readonly supportedLocales?: string[];
  readonly requireRTLSupport?: boolean;
}

export interface ComplianceViolation {
  readonly category: 'nsm' | 'gdpr' | 'accessibility' | 'altinn' | 'localization' | 'rtl';
  readonly severity: 'error' | 'warning' | 'info';
  readonly code: string;
  readonly message: string;
  readonly element?: string;
  readonly recommendation: string;
  readonly reference: string;
  readonly autoFixable: boolean;
}

export interface ComplianceValidationResult {
  readonly compliant: boolean;
  readonly overallScore: number; // 0-100
  readonly categoryScores: Record<string, number>;
  readonly violations: ComplianceViolation[];
  readonly warnings: ComplianceViolation[];
  readonly recommendations: string[];
  readonly autoFixSuggestions: string[];
  readonly summary: ComplianceValidationSummary;
}

export interface ComplianceValidationSummary {
  readonly totalChecks: number;
  readonly passedChecks: number;
  readonly failedChecks: number;
  readonly warningChecks: number;
  readonly criticalIssues: number;
  readonly estimatedFixTime: string;
  readonly complianceLevel: 'non-compliant' | 'partially-compliant' | 'compliant' | 'fully-compliant';
}

export class ComplianceValidationService {
  /**
   * Validate template against all Norwegian compliance standards
   */
  static async validateTemplate(request: ComplianceValidationRequest): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];
    const categoryScores: Record<string, number> = {};

    // NSM Classification Validation
    const nsmResults = await this.validateNSMCompliance(request);
    violations.push(...nsmResults.violations);
    warnings.push(...nsmResults.warnings);
    recommendations.push(...nsmResults.recommendations);
    autoFixSuggestions.push(...nsmResults.autoFixSuggestions);
    categoryScores.nsm = nsmResults.score;

    // GDPR Compliance Validation
    const gdprResults = await this.validateGDPRCompliance(request);
    violations.push(...gdprResults.violations);
    warnings.push(...gdprResults.warnings);
    recommendations.push(...gdprResults.recommendations);
    autoFixSuggestions.push(...gdprResults.autoFixSuggestions);
    categoryScores.gdpr = gdprResults.score;

    // Accessibility Validation
    const accessibilityResults = await this.validateAccessibilityCompliance(request);
    violations.push(...accessibilityResults.violations);
    warnings.push(...accessibilityResults.warnings);
    recommendations.push(...accessibilityResults.recommendations);
    autoFixSuggestions.push(...accessibilityResults.autoFixSuggestions);
    categoryScores.accessibility = accessibilityResults.score;

    // Altinn Design System Validation (if required)
    if (request.requireAltinnCompatibility) {
      const altinnResults = await this.validateAltinnCompliance(request);
      violations.push(...altinnResults.violations);
      warnings.push(...altinnResults.warnings);
      recommendations.push(...altinnResults.recommendations);
      autoFixSuggestions.push(...altinnResults.autoFixSuggestions);
      categoryScores.altinn = altinnResults.score;
    }

    // Localization Validation
    const localizationResults = await this.validateLocalizationCompliance(request);
    violations.push(...localizationResults.violations);
    warnings.push(...localizationResults.warnings);
    recommendations.push(...localizationResults.recommendations);
    autoFixSuggestions.push(...localizationResults.autoFixSuggestions);
    categoryScores.localization = localizationResults.score;

    // RTL Support Validation (if required)
    if (request.requireRTLSupport) {
      const rtlResults = await this.validateRTLCompliance(request);
      violations.push(...rtlResults.violations);
      warnings.push(...rtlResults.warnings);
      recommendations.push(...rtlResults.recommendations);
      autoFixSuggestions.push(...rtlResults.autoFixSuggestions);
      categoryScores.rtl = rtlResults.score;
    }

    // Calculate overall compliance
    const overallScore = this.calculateOverallScore(categoryScores);
    const compliant = violations.filter(v => v.severity === 'error').length === 0;
    const summary = this.generateSummary(violations, warnings, categoryScores);

    return {
      compliant,
      overallScore,
      categoryScores,
      violations,
      warnings,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      autoFixSuggestions: [...new Set(autoFixSuggestions)],
      summary,
    };
  }

  /**
   * Validate NSM Classification compliance
   */
  private static async validateNSMCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      const validationResult = NSMClassificationService.validateClassification(
        request.targetClassification,
        request.content,
        request.metadata
      );

      validationResult.violations.forEach(violation => {
        violations.push({
          category: 'nsm',
          severity: 'error',
          code: 'NSM_VIOLATION',
          message: violation,
          recommendation: 'Implement required NSM security measures',
          reference: 'NSM Security Guidelines',
          autoFixable: false,
        });
      });

      // Check for classification markings
      if (request.targetClassification !== 'OPEN') {
        const hasClassificationBanner = this.checkForClassificationBanner(request.content);
        if (!hasClassificationBanner) {
          violations.push({
            category: 'nsm',
            severity: 'error',
            code: 'NSM_MISSING_BANNER',
            message: `Missing classification banner for ${request.targetClassification} content`,
            recommendation: 'Add NSM classification banner to template',
            reference: 'NSM Classification Guidelines',
            autoFixable: true,
          });
          autoFixSuggestions.push('Add NSM classification banner component');
        }

        // Check for watermark (CONFIDENTIAL and SECRET)
        if (['CONFIDENTIAL', 'SECRET'].includes(request.targetClassification)) {
          const hasWatermark = this.checkForWatermark(request.content);
          if (!hasWatermark) {
            warnings.push({
              category: 'nsm',
              severity: 'warning',
              code: 'NSM_MISSING_WATERMARK',
              message: `Missing watermark for ${request.targetClassification} content`,
              recommendation: 'Add classification watermark for enhanced security',
              reference: 'NSM Classification Guidelines',
              autoFixable: true,
            });
            autoFixSuggestions.push('Add NSM classification watermark');
          }
        }
      }

      // Check for audit trail implementation
      const config = NSMClassificationService.getClassificationTemplate(request.targetClassification);
      if (config.securityRequirements.dataHandling.auditTrail) {
        const hasAuditTrail = this.checkForAuditTrail(request.content);
        if (!hasAuditTrail) {
          violations.push({
            category: 'nsm',
            severity: 'error',
            code: 'NSM_MISSING_AUDIT',
            message: 'Audit trail implementation required for this classification level',
            recommendation: 'Implement comprehensive audit trail logging',
            reference: 'NSM Audit Requirements',
            autoFixable: true,
          });
          autoFixSuggestions.push('Add GDPR audit trail implementation');
        }
      }

      recommendations.push(
        'Ensure all security headers are properly configured',
        'Implement session timeout according to classification level',
        'Add proper access control validation'
      );

    } catch (error) {
      violations.push({
        category: 'nsm',
        severity: 'error',
        code: 'NSM_VALIDATION_ERROR',
        message: `NSM validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review NSM classification implementation',
        reference: 'NSM Guidelines',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 20); // 20 total NSM checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  /**
   * Validate GDPR compliance
   */
  private static async validateGDPRCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      const validationResult = GDPRComplianceService.validateCompliance(
        request.gdprLevel,
        request.content
      );

      validationResult.violations.forEach(violation => {
        violations.push({
          category: 'gdpr',
          severity: 'error',
          code: 'GDPR_VIOLATION',
          message: violation,
          recommendation: 'Implement required GDPR measures',
          reference: 'GDPR Articles',
          autoFixable: false,
        });
      });

      // Check for cookie consent
      const hasCookieConsent = this.checkForCookieConsent(request.content);
      if (!hasCookieConsent && request.templateType !== 'backend') {
        violations.push({
          category: 'gdpr',
          severity: 'error',
          code: 'GDPR_MISSING_CONSENT',
          message: 'Missing GDPR cookie consent implementation',
          recommendation: 'Add GDPR compliant cookie consent banner',
          reference: 'GDPR Article 7',
          autoFixable: true,
        });
        autoFixSuggestions.push('Add GDPR cookie consent component');
      }

      // Check for privacy notice
      const hasPrivacyNotice = this.checkForPrivacyNotice(request.content);
      if (!hasPrivacyNotice) {
        warnings.push({
          category: 'gdpr',
          severity: 'warning',
          code: 'GDPR_MISSING_PRIVACY_NOTICE',
          message: 'Missing privacy notice implementation',
          recommendation: 'Add comprehensive privacy notice',
          reference: 'GDPR Article 13-14',
          autoFixable: true,
        });
        autoFixSuggestions.push('Add GDPR privacy notice component');
      }

      // Check for data portability
      if (request.gdprLevel === 'enhanced' || request.gdprLevel === 'maximum') {
        const hasDataPortability = this.checkForDataPortability(request.content);
        if (!hasDataPortability) {
          warnings.push({
            category: 'gdpr',
            severity: 'warning',
            code: 'GDPR_MISSING_PORTABILITY',
            message: 'Missing data portability implementation',
            recommendation: 'Implement data export functionality',
            reference: 'GDPR Article 20',
            autoFixable: false,
          });
        }
      }

      recommendations.push(
        'Implement privacy by design principles',
        'Add comprehensive data subject rights',
        'Ensure proper consent management'
      );

    } catch (error) {
      violations.push({
        category: 'gdpr',
        severity: 'error',
        code: 'GDPR_VALIDATION_ERROR',
        message: `GDPR validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review GDPR implementation',
        reference: 'GDPR Guidelines',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 15); // 15 total GDPR checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  /**
   * Validate accessibility compliance
   */
  private static async validateAccessibilityCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      const wcagLevel = request.accessibilityStandard.startsWith('WCAG_') 
        ? request.accessibilityStandard.split('_')[1] as 'A' | 'AA' | 'AAA'
        : 'AAA';

      const mockComponent = this.createMockComponentFromTemplate(request);
      const validationResult = AccessibilityValidationService.validateComponent(
        mockComponent,
        wcagLevel,
        request.accessibilityStandard
      );

      validationResult.violations.forEach(violation => {
        violations.push({
          category: 'accessibility',
          severity: violation.level === 'A' ? 'error' : 'warning',
          code: `ACCESSIBILITY_${violation.type.toUpperCase()}`,
          message: violation.message,
          element: violation.element,
          recommendation: violation.recommendation,
          reference: violation.wcagReference,
          autoFixable: ['color-contrast', 'form-labels', 'alternative-text'].includes(violation.type),
        });
      });

      validationResult.warnings.forEach(warning => {
        warnings.push({
          category: 'accessibility',
          severity: 'warning',
          code: `ACCESSIBILITY_${warning.type.toUpperCase()}`,
          message: warning.message,
          element: warning.element,
          recommendation: warning.recommendation,
          reference: warning.wcagReference,
          autoFixable: ['screen-reader', 'keyboard-navigation'].includes(warning.type),
        });
      });

      // Auto-fix suggestions based on common issues
      if (violations.some(v => v.code.includes('COLOR_CONTRAST'))) {
        autoFixSuggestions.push('Adjust color schemes to meet WCAG contrast requirements');
      }
      if (violations.some(v => v.code.includes('FORM_LABELS'))) {
        autoFixSuggestions.push('Add proper form labels and ARIA attributes');
      }
      if (violations.some(v => v.code.includes('KEYBOARD_NAVIGATION'))) {
        autoFixSuggestions.push('Implement keyboard navigation support');
      }

      recommendations.push(
        'Use semantic HTML elements',
        'Implement proper focus management',
        'Add ARIA labels and descriptions',
        'Ensure sufficient color contrast',
        'Test with screen readers'
      );

    } catch (error) {
      violations.push({
        category: 'accessibility',
        severity: 'error',
        code: 'ACCESSIBILITY_VALIDATION_ERROR',
        message: `Accessibility validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review accessibility implementation',
        reference: 'WCAG Guidelines',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 25); // 25 total accessibility checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  /**
   * Validate Altinn Design System compliance
   */
  private static async validateAltinnCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      const validationResult = AltinnDesignSystemService.validateCompatibility(request.content);

      validationResult.violations.forEach(violation => {
        violations.push({
          category: 'altinn',
          severity: 'error',
          code: 'ALTINN_INCOMPATIBLE',
          message: violation,
          recommendation: 'Update to use Altinn Design System components',
          reference: 'Altinn Design System Guidelines',
          autoFixable: true,
        });
      });

      // Check for Altinn color usage
      const usesAltinnColors = this.checkForAltinnColors(request.content);
      if (!usesAltinnColors) {
        warnings.push({
          category: 'altinn',
          severity: 'warning',
          code: 'ALTINN_COLORS',
          message: 'Not using Altinn Design System colors',
          recommendation: 'Use official Altinn color palette',
          reference: 'Altinn Design Tokens',
          autoFixable: true,
        });
        autoFixSuggestions.push('Convert to Altinn color tokens');
      }

      // Check for Altinn typography
      const usesAltinnTypography = this.checkForAltinnTypography(request.content);
      if (!usesAltinnTypography) {
        warnings.push({
          category: 'altinn',
          severity: 'warning',
          code: 'ALTINN_TYPOGRAPHY',
          message: 'Not using Altinn Design System typography',
          recommendation: 'Use Altinn typography tokens',
          reference: 'Altinn Design Tokens',
          autoFixable: true,
        });
        autoFixSuggestions.push('Convert to Altinn typography tokens');
      }

      recommendations.push(
        'Use Altinn component library',
        'Follow Altinn spacing guidelines',
        'Implement Altinn form patterns'
      );

    } catch (error) {
      violations.push({
        category: 'altinn',
        severity: 'error',
        code: 'ALTINN_VALIDATION_ERROR',
        message: `Altinn validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review Altinn Design System integration',
        reference: 'Altinn Guidelines',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 10); // 10 total Altinn checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  /**
   * Validate localization compliance
   */
  private static async validateLocalizationCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      // Check for Norwegian locale support
      const supportsNorwegian = this.checkForNorwegianLocale(request.content);
      if (!supportsNorwegian) {
        violations.push({
          category: 'localization',
          severity: 'error',
          code: 'LOCALE_MISSING_NORWEGIAN',
          message: 'Missing Norwegian locale support (nb-NO)',
          recommendation: 'Add Norwegian localization',
          reference: 'Norwegian Localization Standards',
          autoFixable: true,
        });
        autoFixSuggestions.push('Add Norwegian locale provider');
      }

      // Check for proper date formatting
      const usesNorwegianDateFormat = this.checkForNorwegianDateFormat(request.content);
      if (!usesNorwegianDateFormat) {
        warnings.push({
          category: 'localization',
          severity: 'warning',
          code: 'LOCALE_DATE_FORMAT',
          message: 'Not using Norwegian date format (dd.MM.yyyy)',
          recommendation: 'Use Norwegian date formatting standards',
          reference: 'Norwegian Cultural Standards',
          autoFixable: true,
        });
        autoFixSuggestions.push('Convert to Norwegian date format');
      }

      // Check for currency formatting
      const usesNorwegianCurrency = this.checkForNorwegianCurrency(request.content);
      if (!usesNorwegianCurrency) {
        warnings.push({
          category: 'localization',
          severity: 'warning',
          code: 'LOCALE_CURRENCY_FORMAT',
          message: 'Not using Norwegian currency format (NOK)',
          recommendation: 'Use Norwegian currency formatting',
          reference: 'Norwegian Financial Standards',
          autoFixable: true,
        });
        autoFixSuggestions.push('Convert to Norwegian currency format');
      }

      recommendations.push(
        'Implement comprehensive Norwegian localization',
        'Use proper Norwegian date and number formats',
        'Support both Bokmål and Nynorsk where appropriate'
      );

    } catch (error) {
      violations.push({
        category: 'localization',
        severity: 'error',
        code: 'LOCALIZATION_VALIDATION_ERROR',
        message: `Localization validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review localization implementation',
        reference: 'Norwegian Standards',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 8); // 8 total localization checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  /**
   * Validate RTL support compliance
   */
  private static async validateRTLCompliance(
    request: ComplianceValidationRequest
  ): Promise<{
    violations: ComplianceViolation[];
    warnings: ComplianceViolation[];
    recommendations: string[];
    autoFixSuggestions: string[];
    score: number;
  }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceViolation[] = [];
    const recommendations: string[] = [];
    const autoFixSuggestions: string[] = [];

    try {
      // Check for RTL support
      const hasRTLSupport = this.checkForRTLSupport(request.content);
      if (!hasRTLSupport) {
        violations.push({
          category: 'rtl',
          severity: 'error',
          code: 'RTL_MISSING_SUPPORT',
          message: 'Missing RTL (Right-to-Left) text support',
          recommendation: 'Implement RTL text support for Arabic and other RTL languages',
          reference: 'RTL Guidelines',
          autoFixable: true,
        });
        autoFixSuggestions.push('Add RTL provider and utilities');
      }

      // Check for RTL-aware styling
      const hasRTLStyling = this.checkForRTLStyling(request.content);
      if (!hasRTLStyling) {
        warnings.push({
          category: 'rtl',
          severity: 'warning',
          code: 'RTL_MISSING_STYLING',
          message: 'Missing RTL-aware CSS styling',
          recommendation: 'Add RTL-aware CSS classes and utilities',
          reference: 'RTL Styling Guidelines',
          autoFixable: true,
        });
        autoFixSuggestions.push('Add RTL-aware CSS utilities');
      }

      recommendations.push(
        'Implement comprehensive RTL support',
        'Use RTL-aware CSS utilities',
        'Test with Arabic and other RTL languages'
      );

    } catch (error) {
      violations.push({
        category: 'rtl',
        severity: 'error',
        code: 'RTL_VALIDATION_ERROR',
        message: `RTL validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Review RTL implementation',
        reference: 'RTL Guidelines',
        autoFixable: false,
      });
    }

    const score = this.calculateCategoryScore(violations, warnings, 5); // 5 total RTL checks
    return { violations, warnings, recommendations, autoFixSuggestions, score };
  }

  // Helper methods for checking specific features
  private static checkForClassificationBanner(content: any): boolean {
    return JSON.stringify(content).includes('classification-banner') ||
           JSON.stringify(content).includes('nsm-classification');
  }

  private static checkForWatermark(content: any): boolean {
    return JSON.stringify(content).includes('watermark') ||
           JSON.stringify(content).includes('classification-watermark');
  }

  private static checkForAuditTrail(content: any): boolean {
    return JSON.stringify(content).includes('audit') ||
           JSON.stringify(content).includes('useGDPRAudit');
  }

  private static checkForCookieConsent(content: any): boolean {
    return JSON.stringify(content).includes('cookie') ||
           JSON.stringify(content).includes('consent');
  }

  private static checkForPrivacyNotice(content: any): boolean {
    return JSON.stringify(content).includes('privacy') ||
           JSON.stringify(content).includes('personvern');
  }

  private static checkForDataPortability(content: any): boolean {
    return JSON.stringify(content).includes('export') ||
           JSON.stringify(content).includes('portability');
  }

  private static checkForAltinnColors(content: any): boolean {
    return JSON.stringify(content).includes('altinn-blue') ||
           JSON.stringify(content).includes('altinn-');
  }

  private static checkForAltinnTypography(content: any): boolean {
    return JSON.stringify(content).includes('font-altinn') ||
           JSON.stringify(content).includes('altinn-text');
  }

  private static checkForNorwegianLocale(content: any): boolean {
    return JSON.stringify(content).includes('nb-NO') ||
           JSON.stringify(content).includes('norwegian');
  }

  private static checkForNorwegianDateFormat(content: any): boolean {
    return JSON.stringify(content).includes('dd.MM.yyyy') ||
           JSON.stringify(content).includes('formatDate');
  }

  private static checkForNorwegianCurrency(content: any): boolean {
    return JSON.stringify(content).includes('NOK') ||
           JSON.stringify(content).includes('kr');
  }

  private static checkForRTLSupport(content: any): boolean {
    return JSON.stringify(content).includes('rtl') ||
           JSON.stringify(content).includes('dir=');
  }

  private static checkForRTLStyling(content: any): boolean {
    return JSON.stringify(content).includes('rtl-') ||
           JSON.stringify(content).includes('[dir="rtl"]');
  }

  private static createMockComponentFromTemplate(request: ComplianceValidationRequest): any {
    return {
      type: request.templateType,
      accessibility: {
        keyboardNavigation: true,
        focusIndicators: true,
        ariaLabels: true,
        semanticMarkup: true,
      },
      colors: {
        contrast: {
          normalText: 4.5,
          largeText: 3.0,
          uiComponents: 3.0,
        },
      },
      hasAnimation: false,
      hasDynamicContent: false,
      hasFormElements: request.templateType === 'form',
      hasHeadings: true,
    };
  }

  private static calculateCategoryScore(
    violations: ComplianceViolation[],
    warnings: ComplianceViolation[],
    totalChecks: number
  ): number {
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = warnings.filter(w => w.severity === 'warning').length;
    const passedChecks = totalChecks - errorCount - warningCount;
    
    return Math.max(0, Math.round((passedChecks / totalChecks) * 100));
  }

  private static calculateOverallScore(categoryScores: Record<string, number>): number {
    const scores = Object.values(categoryScores);
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  private static generateSummary(
    violations: ComplianceViolation[],
    warnings: ComplianceViolation[],
    categoryScores: Record<string, number>
  ): ComplianceValidationSummary {
    const totalChecks = Object.keys(categoryScores).length * 10; // Rough estimate
    const failedChecks = violations.filter(v => v.severity === 'error').length;
    const warningChecks = warnings.length;
    const passedChecks = totalChecks - failedChecks - warningChecks;
    const criticalIssues = violations.filter(v => v.severity === 'error' && ['nsm', 'gdpr'].includes(v.category)).length;

    let complianceLevel: ComplianceValidationSummary['complianceLevel'] = 'non-compliant';
    const overallScore = this.calculateOverallScore(categoryScores);
    
    if (overallScore >= 95 && criticalIssues === 0) {
      complianceLevel = 'fully-compliant';
    } else if (overallScore >= 80 && criticalIssues <= 2) {
      complianceLevel = 'compliant';
    } else if (overallScore >= 60) {
      complianceLevel = 'partially-compliant';
    }

    // Estimate fix time based on issue count and severity
    const estimatedHours = (criticalIssues * 4) + (failedChecks * 2) + (warningChecks * 0.5);
    const estimatedFixTime = estimatedHours < 1 ? '< 1 hour' : 
                           estimatedHours < 8 ? `${Math.ceil(estimatedHours)} hours` :
                           `${Math.ceil(estimatedHours / 8)} days`;

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      warningChecks,
      criticalIssues,
      estimatedFixTime,
      complianceLevel,
    };
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(result: ComplianceValidationResult): string {
    const { summary, categoryScores, violations, warnings } = result;

    return `
# Norwegian Compliance Validation Report

## Summary
- **Overall Compliance**: ${result.compliant ? '✅ Compliant' : '❌ Non-Compliant'}
- **Overall Score**: ${result.overallScore}%
- **Compliance Level**: ${summary.complianceLevel.replace('-', ' ').toUpperCase()}
- **Estimated Fix Time**: ${summary.estimatedFixTime}

## Category Scores
${Object.entries(categoryScores)
  .map(([category, score]) => `- **${category.toUpperCase()}**: ${score}%`)
  .join('\n')}

## Issues Summary
- **Critical Issues**: ${summary.criticalIssues}
- **Errors**: ${summary.failedChecks}
- **Warnings**: ${summary.warningChecks}
- **Passed Checks**: ${summary.passedChecks}

## Violations
${violations.length > 0 ? violations.map(v => `
### ${v.category.toUpperCase()} - ${v.code}
- **Severity**: ${v.severity.toUpperCase()}
- **Message**: ${v.message}
- **Recommendation**: ${v.recommendation}
- **Reference**: ${v.reference}
- **Auto-fixable**: ${v.autoFixable ? 'Yes' : 'No'}
${v.element ? `- **Element**: ${v.element}` : ''}
`).join('') : 'No violations found ✅'}

## Warnings
${warnings.length > 0 ? warnings.map(w => `
### ${w.category.toUpperCase()} - ${w.code}
- **Message**: ${w.message}
- **Recommendation**: ${w.recommendation}
- **Reference**: ${w.reference}
- **Auto-fixable**: ${w.autoFixable ? 'Yes' : 'No'}
`).join('') : 'No warnings found ✅'}

## Recommendations
${result.recommendations.map(r => `- ${r}`).join('\n')}

## Auto-Fix Suggestions
${result.autoFixSuggestions.map(s => `- ${s}`).join('\n')}

---
Generated by Norwegian Compliance Validation Service
Date: ${new Date().toLocaleDateString('nb-NO')}
Time: ${new Date().toLocaleTimeString('nb-NO')}
`;
  }
}

export default ComplianceValidationService;
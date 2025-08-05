/**
 * EPIC 7: Integration and Testing - Norwegian Compliance Integration Tests
 * 
 * Comprehensive testing suite for validating Norwegian compliance features,
 * including NSM classification, GDPR patterns, Norwegian locale, Altinn Design System,
 * WCAG AAA accessibility, audit trails, and data privacy patterns.
 * 
 * @author Database Architect with Norwegian Government Compliance Expertise
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';

// Test utilities and helpers
import { createTestProject, cleanupTestProject, validateGeneratedCode } from '../utils/test-helpers';

// Norwegian compliance services
import { NsmClassifier } from '../../services/compliance/nsm-classifier';
import { NorwegianComplianceValidator } from '../../services/templates/norwegian-compliance-validator';
import { AccessibilityValidator } from '../../services/templates/accessibility-validator';

// Compliance validation interfaces
interface ComplianceValidationResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  score: number; // 0-100
}

interface ComplianceViolation {
  type: 'NSM' | 'GDPR' | 'WCAG' | 'ALTINN' | 'LOCALE' | 'AUDIT' | 'PRIVACY';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  location: string;
  fix?: string;
}

interface ComplianceWarning {
  type: string;
  message: string;
  location: string;
  recommendation?: string;
}

class NorwegianComplianceAnalyzer {
  static async analyzeNsmCompliance(filePath: string, classification: string): Promise<ComplianceValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // NSM Classification validation
    if (classification === 'SECRET') {
      if (!content.includes('auditTrail')) {
        violations.push({
          type: 'NSM',
          severity: 'critical',
          message: 'SECRET classification requires audit trail implementation',
          location: filePath,
          fix: 'Add audit trail logging for all user actions'
        });
      }

      if (!content.includes('encryption')) {
        violations.push({
          type: 'NSM',
          severity: 'critical',
          message: 'SECRET classification requires data encryption',
          location: filePath,
          fix: 'Implement end-to-end encryption for sensitive data'
        });
      }

      if (!content.includes('roleBasedAccess')) {
        violations.push({
          type: 'NSM',
          severity: 'major',
          message: 'SECRET classification requires role-based access control',
          location: filePath,
          fix: 'Implement RBAC with fine-grained permissions'
        });
      }
    }

    if (classification === 'CONFIDENTIAL') {
      if (!content.includes('accessControl')) {
        violations.push({
          type: 'NSM',
          severity: 'major',
          message: 'CONFIDENTIAL classification requires access control',
          location: filePath,
          fix: 'Add access control mechanisms'
        });
      }
    }

    // Classification labeling
    if (!content.includes(`classification="${classification}"`)) {
      warnings.push({
        type: 'NSM',
        message: 'Component should include NSM classification metadata',
        location: filePath,
        recommendation: `Add classification="${classification}" to component props`
      });
    }

    const score = Math.max(0, 100 - (violations.length * 20) - (warnings.length * 5));

    return {
      compliant: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score
    };
  }

  static async analyzeGdprCompliance(filePath: string): Promise<ComplianceValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // GDPR requirements
    if (content.includes('personalData') || content.includes('userProfile')) {
      if (!content.includes('consentManagement')) {
        violations.push({
          type: 'GDPR',
          severity: 'critical',
          message: 'Personal data processing requires consent management',
          location: filePath,
          fix: 'Implement consent management for personal data collection'
        });
      }

      if (!content.includes('dataRetention')) {
        violations.push({
          type: 'GDPR',
          severity: 'major',
          message: 'Personal data requires data retention policy',
          location: filePath,
          fix: 'Add data retention and deletion mechanisms'
        });
      }

      if (!content.includes('dataPortability')) {
        warnings.push({
          type: 'GDPR',
          message: 'Consider implementing data portability features',
          location: filePath,
          recommendation: 'Add data export functionality for user rights'
        });
      }
    }

    // Cookie consent
    if (content.includes('cookie') || content.includes('localStorage')) {
      if (!content.includes('cookieConsent')) {
        violations.push({
          type: 'GDPR',
          severity: 'major',
          message: 'Cookie usage requires explicit consent',
          location: filePath,
          fix: 'Implement cookie consent mechanism'
        });
      }
    }

    const score = Math.max(0, 100 - (violations.length * 15) - (warnings.length * 5));

    return {
      compliant: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score
    };
  }

  static async analyzeWcagCompliance(filePath: string): Promise<ComplianceValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // WCAG AAA requirements
    if (!content.includes('aria-label') && !content.includes('aria-labelledby')) {
      if (content.includes('button') || content.includes('Button')) {
        violations.push({
          type: 'WCAG',
          severity: 'major',
          message: 'Interactive elements require accessible labels',
          location: filePath,
          fix: 'Add aria-label or aria-labelledby attributes'
        });
      }
    }

    if (!content.includes('role=') && content.includes('onClick')) {
      warnings.push({
        type: 'WCAG',
        message: 'Interactive elements should have semantic roles',
        location: filePath,
        recommendation: 'Add appropriate ARIA roles'
      });
    }

    // Keyboard navigation
    if (content.includes('onClick') && !content.includes('onKeyDown')) {
      violations.push({
        type: 'WCAG',
        severity: 'major',
        message: 'Interactive elements must support keyboard navigation',
        location: filePath,
        fix: 'Add keyboard event handlers (Enter, Space)'
      });
    }

    // Color contrast (basic check)
    if (content.includes('color:') && !content.includes('contrast')) {
      warnings.push({
        type: 'WCAG',
        message: 'Ensure color choices meet WCAG AAA contrast requirements',
        location: filePath,
        recommendation: 'Verify color contrast ratios meet 7:1 standard'
      });
    }

    // Focus management
    if (content.includes('modal') || content.includes('Modal')) {
      if (!content.includes('trapFocus') && !content.includes('focusTrap')) {
        violations.push({
          type: 'WCAG',
          severity: 'major',
          message: 'Modal components require focus management',
          location: filePath,
          fix: 'Implement focus trapping and restoration'
        });
      }
    }

    const score = Math.max(0, 100 - (violations.length * 12) - (warnings.length * 4));

    return {
      compliant: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score
    };
  }

  static async analyzeAuditTrailImplementation(filePath: string): Promise<ComplianceValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Audit trail requirements
    if (content.includes('sensitiveAction') || content.includes('adminAction')) {
      if (!content.includes('auditLog')) {
        violations.push({
          type: 'AUDIT',
          severity: 'critical',
          message: 'Sensitive actions require audit logging',
          location: filePath,
          fix: 'Add audit logging for all sensitive operations'
        });
      }

      if (!content.includes('timestamp')) {
        violations.push({
          type: 'AUDIT',
          severity: 'major',
          message: 'Audit logs require timestamp information',
          location: filePath,
          fix: 'Include timestamp in audit log entries'
        });
      }

      if (!content.includes('userId') && !content.includes('actor')) {
        violations.push({
          type: 'AUDIT',
          severity: 'major',
          message: 'Audit logs require user identification',
          location: filePath,
          fix: 'Include user ID or actor information in audit logs'
        });
      }

      if (!content.includes('immutable')) {
        warnings.push({
          type: 'AUDIT',
          message: 'Consider making audit logs immutable',
          location: filePath,
          recommendation: 'Implement append-only audit log storage'
        });
      }
    }

    const score = Math.max(0, 100 - (violations.length * 18) - (warnings.length * 6));

    return {
      compliant: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      warnings,
      score
    };
  }
}

describe('EPIC 7: Norwegian Compliance Integration Tests', () => {
  let testProjectPath: string;
  let nsmClassifier: NsmClassifier;
  let complianceValidator: NorwegianComplianceValidator;
  let accessibilityValidator: AccessibilityValidator;

  beforeEach(async () => {
    testProjectPath = await createTestProject('norwegian-compliance-test');
    nsmClassifier = new NsmClassifier();
    complianceValidator = new NorwegianComplianceValidator();
    accessibilityValidator = new AccessibilityValidator();
  });

  afterEach(async () => {
    await cleanupTestProject(testProjectPath);
  });

  describe('Story 5.1.3-1: NSM Classification Enforcement', () => {
    it('should enforce OPEN classification requirements', async () => {
      await execa('xaheen', [
        'generate', 'component', 'PublicInfoCard',
        '--nsm-classification=OPEN',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/PublicInfoCard.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeNsmCompliance(componentPath, 'OPEN');

      expect(compliance.compliant).toBe(true);
      expect(compliance.score).toBeGreaterThan(80);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('classification="OPEN"');
      expect(content).not.toContain('sensitive');
      expect(content).not.toContain('classified');
    });

    it('should enforce RESTRICTED classification requirements', async () => {
      await execa('xaheen', [
        'generate', 'component', 'RestrictedDataView',
        '--nsm-classification=RESTRICTED',
        '--platform=react',
        '--access-control',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/RestrictedDataView.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeNsmCompliance(componentPath, 'RESTRICTED');

      expect(compliance.compliant).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('classification="RESTRICTED"');
      expect(content).toContain('accessControl');
      expect(content).toContain('authorized');
    });

    it('should enforce CONFIDENTIAL classification requirements', async () => {
      await execa('xaheen', [
        'generate', 'component', 'ConfidentialDocumentViewer',
        '--nsm-classification=CONFIDENTIAL',
        '--platform=react',
        '--access-control',
        '--audit-logging',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/ConfidentialDocumentViewer.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeNsmCompliance(componentPath, 'CONFIDENTIAL');

      expect(compliance.compliant).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('classification="CONFIDENTIAL"');
      expect(content).toContain('accessControl');
      expect(content).toContain('auditLog');
      expect(content).toContain('secureAccess');
    });

    it('should enforce SECRET classification requirements', async () => {
      await execa('xaheen', [
        'generate', 'component', 'SecretIntelligencePanel',
        '--nsm-classification=SECRET',
        '--platform=react',
        '--audit-trail',
        '--encryption',
        '--role-based-access',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/SecretIntelligencePanel.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeNsmCompliance(componentPath, 'SECRET');

      expect(compliance.compliant).toBe(true);
      expect(compliance.score).toBeGreaterThan(90);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('classification="SECRET"');
      expect(content).toContain('auditTrail');
      expect(content).toContain('encryption');
      expect(content).toContain('roleBasedAccess');
      expect(content).toContain('securityHeaders');
    });

    it('should reject invalid NSM classifications', async () => {
      const result = await execa('xaheen', [
        'generate', 'component', 'InvalidClassificationComponent',
        '--nsm-classification=INVALID',
        '--platform=react'
      ], { cwd: testProjectPath, reject: false });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Invalid NSM classification');
      expect(result.stderr).toContain('Valid classifications: OPEN, RESTRICTED, CONFIDENTIAL, SECRET');
    });
  });

  describe('Story 5.1.3-2: GDPR Compliance Patterns', () => {
    it('should implement consent management for personal data', async () => {
      await execa('xaheen', [
        'generate', 'form', 'UserRegistrationForm',
        '--gdpr-compliance',
        '--personal-data=name,email,phone',
        '--consent-management',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const formPath = path.join(testProjectPath, 'src/forms/UserRegistrationForm.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeGdprCompliance(formPath);

      expect(compliance.compliant).toBe(true);
      expect(compliance.score).toBeGreaterThan(85);

      const content = await fs.readFile(formPath, 'utf-8');
      expect(content).toContain('consentManagement');
      expect(content).toContain('personalData');
      expect(content).toContain('gdprCompliant');
      expect(content).toContain('dataProcessingConsent');
    });

    it('should implement cookie consent mechanisms', async () => {
      await execa('xaheen', [
        'generate', 'component', 'CookieConsentBanner',
        '--gdpr-compliance',
        '--cookie-consent',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/CookieConsentBanner.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeGdprCompliance(componentPath);

      expect(compliance.compliant).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('cookieConsent');
      expect(content).toContain('acceptCookies');
      expect(content).toContain('rejectCookies');
      expect(content).toContain('cookieCategories');
    });

    it('should implement data retention policies', async () => {
      await execa('xaheen', [
        'generate', 'service', 'DataRetentionService',
        '--gdpr-compliance',
        '--data-retention',
        '--automated-deletion',
        '--typescript'
      ], { cwd: testProjectPath });

      const servicePath = path.join(testProjectPath, 'src/services/DataRetentionService.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      expect(content).toContain('dataRetention');
      expect(content).toContain('retentionPeriod');
      expect(content).toContain('automaticDeletion');
      expect(content).toContain('dataExpiry');
    });

    it('should implement data portability features', async () => {
      await execa('xaheen', [
        'generate', 'component', 'DataExportPanel',
        '--gdpr-compliance',
        '--data-portability',
        '--export-formats=json,csv,xml',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/DataExportPanel.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('dataPortability');
      expect(content).toContain('exportUserData');
      expect(content).toContain('downloadData');
      expect(content).toContain('formatOptions');
    });
  });

  describe('Story 5.1.3-3: Norwegian Locale Integration', () => {
    it('should generate components with Norwegian locale support', async () => {
      await execa('xaheen', [
        'generate', 'component', 'NorwegianWelcomeCard',
        '--locale=nb-NO',
        '--i18n',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/NorwegianWelcomeCard.tsx');
      const localeFile = path.join(testProjectPath, 'src/locales/nb-NO/norwegianwelcomecard.json');

      expect(await fs.pathExists(componentPath)).toBe(true);
      expect(await fs.pathExists(localeFile)).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('useTranslation');
      expect(content).toContain("locale: 'nb-NO'");
      expect(content).toContain('t(');

      const localeContent = await fs.readFile(localeFile, 'utf-8');
      const translations = JSON.parse(localeContent);
      expect(translations).toHaveProperty('welcome');
      expect(translations).toHaveProperty('description');
    });

    it('should handle Norwegian currency and number formatting', async () => {
      await execa('xaheen', [
        'generate', 'component', 'PriceDisplay',
        '--locale=nb-NO',
        '--currency=NOK',
        '--number-formatting',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/PriceDisplay.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('currency: "NOK"');
      expect(content).toContain('locale: "nb-NO"');
      expect(content).toContain('Intl.NumberFormat');
      expect(content).toContain('toLocaleString');
    });

    it('should support Norwegian date and time formatting', async () => {
      await execa('xaheen', [
        'generate', 'component', 'EventCalendar',
        '--locale=nb-NO',
        '--date-formatting',
        '--timezone=Europe/Oslo',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/EventCalendar.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('locale: "nb-NO"');
      expect(content).toContain('timeZone: "Europe/Oslo"');
      expect(content).toContain('Intl.DateTimeFormat');
      expect(content).toContain('dateStyle');
    });

    it('should include RTL support for Arabic compliance', async () => {
      await execa('xaheen', [
        'generate', 'component', 'MultilingualContent',
        '--locales=nb-NO,ar,en',
        '--rtl-support',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/MultilingualContent.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('dir={isRTL ? "rtl" : "ltr"}');
      expect(content).toContain('textAlign: isRTL');
      expect(content).toContain('arabic');
      expect(content).toContain('getRTLDirection');
    });
  });

  describe('Story 5.1.3-4: Altinn Design System Compatibility', () => {
    it('should generate components compatible with Altinn Design System', async () => {
      await execa('xaheen', [
        'generate', 'form', 'AltinnCompliantForm',
        '--altinn-design-system',
        '--norwegian-government',
        '--fields=fornavn,etternavn,fodselsnummer,epost',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const formPath = path.join(testProjectPath, 'src/forms/AltinnCompliantForm.tsx');
      const content = await fs.readFile(formPath, 'utf-8');

      expect(content).toContain('altinnDesignSystem');
      expect(content).toContain('AltinnInput');
      expect(content).toContain('AltinnButton');
      expect(content).toContain('AltinnForm');
      expect(content).toContain('norwegianGovernment');
    });

    it('should use Altinn color scheme and typography', async () => {
      await execa('xaheen', [
        'generate', 'component', 'GovernmentHeader',
        '--altinn-design-system',
        '--altinn-theme',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/GovernmentHeader.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('altinnTheme');
      expect(content).toContain('governmentBlue');
      expect(content).toContain('altinnTypography');
      expect(content).toContain('officialFont');
    });

    it('should implement Altinn accessibility standards', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AccessibleGovernmentForm',
        '--altinn-design-system',
        '--altinn-accessibility',
        '--wcag-aaa',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/AccessibleGovernmentForm.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('altinnAccessibility');
      expect(content).toContain('governmentStandards');
      expect(content).toContain('wcagAAA');
      expect(content).toContain('skipNavigation');
    });
  });

  describe('Story 5.1.3-5: WCAG AAA Accessibility Compliance', () => {
    it('should generate components meeting WCAG AAA standards', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AccessibleDataTable',
        '--wcag-aaa',
        '--accessibility-features=keyboard-nav,screen-reader,high-contrast',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/AccessibleDataTable.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeWcagCompliance(componentPath);

      expect(compliance.compliant).toBe(true);
      expect(compliance.score).toBeGreaterThan(90);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('aria-label');
      expect(content).toContain('role=');
      expect(content).toContain('tabIndex');
      expect(content).toContain('onKeyDown');
      expect(content).toContain('screenReader');
    });

    it('should implement proper focus management', async () => {
      await execa('xaheen', [
        'generate', 'component', 'FocusManagementModal',
        '--wcag-aaa',
        '--focus-management',
        '--keyboard-navigation',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/FocusManagementModal.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('trapFocus');
      expect(content).toContain('restoreFocus');
      expect(content).toContain('initialFocus');
      expect(content).toContain('focusableElements');
      expect(content).toContain('keyboardNavigation');
    });

    it('should ensure color contrast compliance', async () => {
      await execa('xaheen', [
        'generate', 'component', 'HighContrastButton',
        '--wcag-aaa',
        '--high-contrast',
        '--color-contrast-check',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/HighContrastButton.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('contrastRatio');
      expect(content).toContain('highContrast');
      expect(content).toContain('colorCompliance');
      expect(content).toContain('accessibleColors');
    });

    it('should provide alternative text for all media', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AccessibleImageGallery',
        '--wcag-aaa',
        '--alt-text-required',
        '--media-accessibility',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/AccessibleImageGallery.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('alt=');
      expect(content).toContain('aria-describedby');
      expect(content).toContain('longDescription');
      expect(content).toContain('mediaAccessibility');
    });
  });

  describe('Story 5.1.3-6: Audit Trail Implementation', () => {
    it('should implement comprehensive audit trails for sensitive operations', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AdminActionPanel',
        '--audit-trail',
        '--sensitive-actions=delete,modify,access',
        '--nsm-classification=CONFIDENTIAL',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/AdminActionPanel.tsx');
      const compliance = await NorwegianComplianceAnalyzer.analyzeAuditTrailImplementation(componentPath);

      expect(compliance.compliant).toBe(true);
      expect(compliance.score).toBeGreaterThan(85);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('auditLog');
      expect(content).toContain('sensitiveAction');
      expect(content).toContain('timestamp');
      expect(content).toContain('userId');
      expect(content).toContain('actionType');
    });

    it('should log all user interactions with classified data', async () => {
      await execa('xaheen', [
        'generate', 'component', 'ClassifiedDataViewer',
        '--audit-trail',
        '--interaction-logging',
        '--nsm-classification=SECRET',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/ClassifiedDataViewer.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('logInteraction');
      expect(content).toContain('auditTrail');
      expect(content).toContain('classifiedData');
      expect(content).toContain('userAction');
      expect(content).toContain('immutableLog');
    });

    it('should implement tamper-proof audit logging', async () => {
      await execa('xaheen', [
        'generate', 'service', 'TamperProofAuditService',
        '--audit-trail',
        '--tamper-proof',
        '--cryptographic-hashes',
        '--typescript'
      ], { cwd: testProjectPath });

      const servicePath = path.join(testProjectPath, 'src/services/TamperProofAuditService.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      expect(content).toContain('tamperProof');
      expect(content).toContain('cryptographicHash');
      expect(content).toContain('integrity');
      expect(content).toContain('immutable');
      expect(content).toContain('auditChain');
    });
  });

  describe('Story 5.1.3-7: Data Privacy Patterns', () => {
    it('should implement privacy-by-design patterns', async () => {
      await execa('xaheen', [
        'generate', 'component', 'PrivacyFirstForm',
        '--privacy-by-design',
        '--data-minimization',
        '--purpose-binding',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/PrivacyFirstForm.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('privacyByDesign');
      expect(content).toContain('dataMinimization');
      expect(content).toContain('purposeBinding');
      expect(content).toContain('privacyFirst');
      expect(content).toContain('minimumDataCollection');
    });

    it('should implement data anonymization features', async () => {
      await execa('xaheen', [
        'generate', 'service', 'DataAnonymizationService',
        '--data-anonymization',
        '--pseudonymization',
        '--k-anonymity',
        '--typescript'
      ], { cwd: testProjectPath });

      const servicePath = path.join(testProjectPath, 'src/services/DataAnonymizationService.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      expect(content).toContain('anonymization');
      expect(content).toContain('pseudonymization');
      expect(content).toContain('kAnonymity');
      expect(content).toContain('dataObfuscation');
    });

    it('should implement secure data transmission patterns', async () => {
      await execa('xaheen', [
        'generate', 'service', 'SecureDataTransmissionService',
        '--secure-transmission',
        '--end-to-end-encryption',
        '--tls-verification',
        '--typescript'
      ], { cwd: testProjectPath });

      const servicePath = path.join(testProjectPath, 'src/services/SecureDataTransmissionService.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      expect(content).toContain('secureTransmission');
      expect(content).toContain('endToEndEncryption');
      expect(content).toContain('tlsVerification');
      expect(content).toContain('encryptedPayload');
    });

    it('should implement privacy impact assessment templates', async () => {
      await execa('xaheen', [
        'generate', 'component', 'PrivacyImpactAssessment',
        '--privacy-impact-assessment',
        '--risk-analysis',
        '--mitigation-strategies',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/PrivacyImpactAssessment.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('privacyImpactAssessment');
      expect(content).toContain('riskAnalysis');
      expect(content).toContain('mitigationStrategies');
      expect(content).toContain('privacyRisk');
    });
  });

  describe('Integration with Norwegian Services', () => {
    it('should integrate with BankID authentication', async () => {
      await execa('xaheen', [
        'generate', 'component', 'BankIDLogin',
        '--bankid-integration',
        '--norwegian-auth',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/BankIDLogin.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('bankID');
      expect(content).toContain('norwegianAuth');
      expect(content).toContain('personalNumber');
      expect(content).toContain('authenticate');
    });

    it('should integrate with Vipps payment system', async () => {
      await execa('xaheen', [
        'generate', 'component', 'VippsPayment',
        '--vipps-integration',
        '--norwegian-payment',
        '--platform=react',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/VippsPayment.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('vipps');
      expect(content).toContain('norwegianPayment');
      expect(content).toContain('mobilePayment');
      expect(content).toContain('paymentRequest');
    });

    it('should integrate with Altinn services', async () => {
      await execa('xaheen', [
        'generate', 'service', 'AltinnIntegrationService',
        '--altinn-integration',
        '--government-services',
        '--typescript'
      ], { cwd: testProjectPath });

      const servicePath = path.join(testProjectPath, 'src/services/AltinnIntegrationService.ts');
      const content = await fs.readFile(servicePath, 'utf-8');

      expect(content).toContain('altinn');
      expect(content).toContain('governmentServices');
      expect(content).toContain('digitalSubmission');
      expect(content).toContain('serviceAPI');
    });
  });
});
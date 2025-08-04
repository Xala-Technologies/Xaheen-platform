/**
 * Accessibility Validation Service for Templates
 * 
 * Validates template accessibility compliance against WCAG AAA, Norwegian standards,
 * and NSM security requirements.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import type { NSMClassification } from '../compliance/nsm-classifier.js';

export interface AccessibilityValidationResult {
  readonly isValid: boolean;
  readonly score: number; // 0-100
  readonly level: 'A' | 'AA' | 'AAA';
  readonly violations: readonly AccessibilityViolation[];
  readonly warnings: readonly AccessibilityWarning[];
  readonly recommendations: readonly string[];
  readonly norwegianCompliance: boolean;
  readonly nsmCompliance: boolean;
}

export interface AccessibilityViolation {
  readonly id: string;
  readonly wcagCriterion: string;
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly severity: 'critical' | 'serious' | 'moderate' | 'minor';
  readonly description: string;
  readonly element?: string;
  readonly recommendation: string;
  readonly norwegianRequirement?: string;
  readonly nsmRequirement?: string;
}

export interface AccessibilityWarning {
  readonly id: string;
  readonly description: string;
  readonly recommendation: string;
  readonly impact: 'high' | 'medium' | 'low';
}

export interface TemplateAccessibilityContext {
  readonly templateContent: string;
  readonly componentName: string;
  readonly targetLevel: 'A' | 'AA' | 'AAA';
  readonly nsmClassification: NSMClassification;
  readonly norwegianCompliance: boolean;
  readonly platform: string;
}

export class AccessibilityValidator {
  private wcagRules: Map<string, WCAGRule> = new Map();
  private norwegianRules: Map<string, NorwegianAccessibilityRule> = new Map();
  private nsmRules: Map<NSMClassification, NSMAccessibilityRule[]> = new Map();

  constructor() {
    this.initializeWCAGRules();
    this.initializeNorwegianRules();
    this.initializeNSMRules();
  }

  /**
   * Validate template accessibility compliance
   */
  async validateTemplate(context: TemplateAccessibilityContext): Promise<AccessibilityValidationResult> {
    consola.info(`Validating accessibility for ${context.componentName} (${context.targetLevel} level)`);

    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];
    const recommendations: string[] = [];

    // WCAG validation
    const wcagResults = await this.validateWCAG(context);
    violations.push(...wcagResults.violations);
    warnings.push(...wcagResults.warnings);

    // Norwegian compliance validation
    const norwegianResults = await this.validateNorwegianCompliance(context);
    violations.push(...norwegianResults.violations);
    warnings.push(...norwegianResults.warnings);

    // NSM compliance validation
    const nsmResults = await this.validateNSMCompliance(context);
    violations.push(...nsmResults.violations);
    warnings.push(...nsmResults.warnings);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(violations, warnings, context));

    // Calculate score
    const score = this.calculateAccessibilityScore(violations, warnings, context.targetLevel);

    // Determine compliance
    const norwegianCompliance = norwegianResults.violations.length === 0;
    const nsmCompliance = nsmResults.violations.length === 0;

    const result: AccessibilityValidationResult = {
      isValid: violations.filter(v => v.severity === 'critical' || v.severity === 'serious').length === 0,
      score,
      level: context.targetLevel,
      violations,
      warnings,
      recommendations,
      norwegianCompliance,
      nsmCompliance
    };

    consola.success(`Accessibility validation completed: ${score}% compliance`);
    return result;
  }

  /**
   * Validate WCAG compliance
   */
  private async validateWCAG(context: TemplateAccessibilityContext): Promise<{
    violations: AccessibilityViolation[];
    warnings: AccessibilityWarning[];
  }> {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];

    // Check for semantic HTML structure
    if (!this.hasSemanticHTML(context.templateContent)) {
      violations.push({
        id: 'semantic-html',
        wcagCriterion: '1.3.1',
        wcagLevel: 'A',
        severity: 'serious',
        description: 'Template should use semantic HTML elements',
        recommendation: 'Use semantic HTML elements like <main>, <section>, <article>, <header>, <nav>',
        element: 'template structure'
      });
    }

    // Check for ARIA labels and roles
    if (!this.hasProperARIA(context.templateContent)) {
      violations.push({
        id: 'aria-labels',
        wcagCriterion: '4.1.2',
        wcagLevel: 'A',
        severity: 'serious',
        description: 'Interactive elements must have accessible names',
        recommendation: 'Add aria-label, aria-labelledby, or aria-describedby attributes',
        element: 'interactive elements'
      });
    }

    // Check for keyboard navigation support
    if (!this.hasKeyboardSupport(context.templateContent)) {
      violations.push({
        id: 'keyboard-navigation',
        wcagCriterion: '2.1.1',
        wcagLevel: 'A',
        severity: 'critical',
        description: 'All functionality must be keyboard accessible',
        recommendation: 'Ensure all interactive elements are keyboard accessible with proper focus management',
        element: 'interactive elements'
      });
    }

    // Check for color contrast considerations
    if (!this.hasColorContrastConsiderations(context.templateContent)) {
      warnings.push({
        id: 'color-contrast',
        description: 'Template should include color contrast considerations',
        recommendation: 'Add CSS custom properties for colors and ensure minimum contrast ratios',
        impact: 'high'
      });
    }

    // Check for skip links
    if (!this.hasSkipLinks(context.templateContent)) {
      violations.push({
        id: 'skip-links',
        wcagCriterion: '2.4.1',
        wcagLevel: 'A',
        severity: 'moderate',
        description: 'Page should include skip navigation links',
        recommendation: 'Add skip links for keyboard users to bypass repetitive content',
        element: 'navigation'
      });
    }

    // Check for heading hierarchy
    if (!this.hasProperHeadingHierarchy(context.templateContent)) {
      violations.push({
        id: 'heading-hierarchy',
        wcagCriterion: '1.3.1',
        wcagLevel: 'A',
        severity: 'moderate',
        description: 'Headings should follow logical hierarchy',
        recommendation: 'Ensure headings follow proper order (h1, h2, h3, etc.)',
        element: 'headings'
      });
    }

    // Check for form labels
    if (!this.hasFormLabels(context.templateContent)) {
      violations.push({
        id: 'form-labels',
        wcagCriterion: '3.3.2',
        wcagLevel: 'A',
        severity: 'serious',
        description: 'Form controls must have associated labels',
        recommendation: 'Add proper labels or aria-label attributes to form controls',
        element: 'form controls'
      });
    }

    // Check for focus management
    if (!this.hasFocusManagement(context.templateContent)) {
      violations.push({
        id: 'focus-management',
        wcagCriterion: '2.4.3',
        wcagLevel: 'A',
        severity: 'serious',
        description: 'Focus order should be logical and predictable',
        recommendation: 'Implement proper focus management with tabIndex and focus() methods',
        element: 'interactive elements'
      });
    }

    // AAA level checks
    if (context.targetLevel === 'AAA') {
      if (!this.hasContextHelp(context.templateContent)) {
        warnings.push({
          id: 'context-help',
          description: 'AAA level requires context-sensitive help',
          recommendation: 'Add help text or tooltips for complex interactions',
          impact: 'medium'
        });
      }

      if (!this.hasErrorPrevention(context.templateContent)) {
        warnings.push({
          id: 'error-prevention',
          description: 'AAA level requires error prevention mechanisms',
          recommendation: 'Add confirmation dialogs for destructive actions',
          impact: 'medium'
        });
      }
    }

    return { violations, warnings };
  }

  /**
   * Validate Norwegian accessibility compliance
   */
  private async validateNorwegianCompliance(context: TemplateAccessibilityContext): Promise<{
    violations: AccessibilityViolation[];
    warnings: AccessibilityWarning[];
  }> {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];

    if (!context.norwegianCompliance) {
      return { violations, warnings };
    }

    // Check for Norwegian language support
    if (!this.hasNorwegianLanguageSupport(context.templateContent)) {
      violations.push({
        id: 'norwegian-language',
        wcagCriterion: '3.1.1',
        wcagLevel: 'A',
        severity: 'serious',
        description: 'Template must support Norwegian language',
        recommendation: 'Add lang="nb-NO" or lang="nn-NO" attributes and Norwegian translations',
        norwegianRequirement: 'Discrimination and Accessibility Act §9'
      });
    }

    // Check for accessibility statement link
    if (!this.hasAccessibilityStatement(context.templateContent)) {
      violations.push({
        id: 'accessibility-statement',
        wcagCriterion: 'Norwegian requirement',
        wcagLevel: 'A',
        severity: 'moderate',
        description: 'Norwegian websites must link to accessibility statement',
        recommendation: 'Add link to accessibility statement as required by Norwegian law',
        norwegianRequirement: 'Web Accessibility Regulation §4'
      });
    }

    return { violations, warnings };
  }

  /**
   * Validate NSM compliance
   */
  private async validateNSMCompliance(context: TemplateAccessibilityContext): Promise<{
    violations: AccessibilityViolation[];
    warnings: AccessibilityWarning[];
  }> {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];

    const nsmRules = this.nsmRules.get(context.nsmClassification) || [];

    for (const rule of nsmRules) {
      if (!rule.validate(context.templateContent)) {
        violations.push({
          id: rule.id,
          wcagCriterion: 'NSM requirement',
          wcagLevel: 'A',
          severity: rule.severity,
          description: rule.description,
          recommendation: rule.recommendation,
          nsmRequirement: rule.nsmRequirement
        });
      }
    }

    return { violations, warnings };
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(
    violations: AccessibilityViolation[],
    warnings: AccessibilityWarning[],
    context: TemplateAccessibilityContext
  ): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.wcagCriterion.startsWith('1.'))) {
      recommendations.push('Focus on perceivable content: ensure all content is available to assistive technologies');
    }

    if (violations.some(v => v.wcagCriterion.startsWith('2.'))) {
      recommendations.push('Improve operability: ensure all functionality is keyboard accessible');
    }

    if (violations.some(v => v.wcagCriterion.startsWith('3.'))) {
      recommendations.push('Enhance understandability: make content readable and predictable');
    }

    if (violations.some(v => v.wcagCriterion.startsWith('4.'))) {
      recommendations.push('Ensure robustness: maximize compatibility with assistive technologies');
    }

    if (context.norwegianCompliance) {
      recommendations.push('Add Norwegian translations and ensure compliance with Discrimination Act');
    }

    if (context.nsmClassification !== 'OPEN') {
      recommendations.push('Implement security-aware accessibility patterns for classified data');
    }

    if (context.targetLevel === 'AAA') {
      recommendations.push('Consider enhanced accessibility features for AAA compliance');
    }

    return recommendations;
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(
    violations: AccessibilityViolation[],
    warnings: AccessibilityWarning[],
    targetLevel: 'A' | 'AA' | 'AAA'
  ): number {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const seriousCount = violations.filter(v => v.severity === 'serious').length;
    const moderateCount = violations.filter(v => v.severity === 'moderate').length;
    const minorCount = violations.filter(v => v.severity === 'minor').length;
    const warningCount = warnings.length;

    // Weighted scoring
    const totalDeductions = 
      (criticalCount * 25) +
      (seriousCount * 15) +
      (moderateCount * 8) +
      (minorCount * 3) +
      (warningCount * 1);

    const baseScore = targetLevel === 'AAA' ? 100 : targetLevel === 'AA' ? 95 : 90;
    const score = Math.max(0, baseScore - totalDeductions);

    return Math.round(score);
  }

  // Template validation methods
  private hasSemanticHTML(content: string): boolean {
    const semanticElements = ['<main', '<section', '<article', '<header', '<nav', '<aside', '<footer'];
    return semanticElements.some(element => content.includes(element));
  }

  private hasProperARIA(content: string): boolean {
    const ariaAttributes = ['aria-label', 'aria-labelledby', 'aria-describedby', 'role='];
    return ariaAttributes.some(attr => content.includes(attr));
  }

  private hasKeyboardSupport(content: string): boolean {
    const keyboardPatterns = ['onKeyDown', 'onKeyPress', 'tabIndex', 'focus()', 'handleKeyDown'];
    return keyboardPatterns.some(pattern => content.includes(pattern));
  }

  private hasColorContrastConsiderations(content: string): boolean {
    return content.includes('contrast') || content.includes('color-contrast') || content.includes('--color-');
  }

  private hasSkipLinks(content: string): boolean {
    return content.includes('skip') && content.includes('href="#');
  }

  private hasProperHeadingHierarchy(content: string): boolean {
    return content.includes('variant="h') || content.includes('<h1') || content.includes('<h2');
  }

  private hasFormLabels(content: string): boolean {
    return content.includes('label=') || content.includes('<label') || content.includes('aria-label');
  }

  private hasFocusManagement(content: string): boolean {
    return content.includes('focus') && (content.includes('useRef') || content.includes('focusRef'));
  }

  private hasContextHelp(content: string): boolean {
    return content.includes('help') || content.includes('tooltip') || content.includes('helperText');
  }

  private hasErrorPrevention(content: string): boolean {
    return content.includes('confirm') || content.includes('validation') || content.includes('prevent');
  }

  private hasNorwegianLanguageSupport(content: string): boolean {
    return content.includes('nb-NO') || content.includes('nn-NO') || content.includes('{{t ');
  }

  private hasAccessibilityStatement(content: string): boolean {
    return content.includes('accessibility') && content.includes('statement');
  }

  private initializeWCAGRules(): void {
    // Initialize WCAG rules - simplified for demo
    consola.debug('Initialized WCAG accessibility rules');
  }

  private initializeNorwegianRules(): void {
    // Initialize Norwegian accessibility rules - simplified for demo
    consola.debug('Initialized Norwegian accessibility rules');
  }

  private initializeNSMRules(): void {
    // OPEN classification
    this.nsmRules.set('OPEN', []);

    // RESTRICTED classification
    this.nsmRules.set('RESTRICTED', [
      {
        id: 'restricted-watermarks',
        description: 'Restricted content must include security watermarks',
        recommendation: 'Add security watermarks for classified content',
        severity: 'moderate',
        nsmRequirement: 'NSM RESTRICTED classification requirements',
        validate: (content: string) => content.includes('watermark') || content.includes('classification')
      }
    ]);

    // CONFIDENTIAL classification
    this.nsmRules.set('CONFIDENTIAL', [
      {
        id: 'confidential-labels',
        description: 'Confidential content must have clear classification labels',
        recommendation: 'Add visible classification labels and watermarks',
        severity: 'serious',
        nsmRequirement: 'NSM CONFIDENTIAL classification requirements',
        validate: (content: string) => content.includes('CONFIDENTIAL') && content.includes('watermark')
      }
    ]);

    // SECRET classification
    this.nsmRules.set('SECRET', [
      {
        id: 'secret-security',
        description: 'Secret content requires maximum security measures',
        recommendation: 'Implement all security measures including watermarks, labels, and access controls',
        severity: 'critical',
        nsmRequirement: 'NSM SECRET classification requirements',
        validate: (content: string) => 
          content.includes('SECRET') && 
          content.includes('watermark') && 
          content.includes('sessionTimeout')
      }
    ]);

    consola.debug('Initialized NSM security rules');
  }
}

// Types for rules
interface WCAGRule {
  id: string;
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  validate: (content: string) => boolean;
}

interface NorwegianAccessibilityRule {
  id: string;
  requirement: string;
  description: string;
  validate: (content: string) => boolean;
}

interface NSMAccessibilityRule {
  id: string;
  description: string;
  recommendation: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  nsmRequirement: string;
  validate: (content: string) => boolean;
}

// Singleton instance
export const accessibilityValidator = new AccessibilityValidator();
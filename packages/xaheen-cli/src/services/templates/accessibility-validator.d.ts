/**
 * Accessibility Validation Service for Templates
 *
 * Validates template accessibility compliance against WCAG AAA, Norwegian standards,
 * and NSM security requirements.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
import type { NSMClassification } from '../compliance/nsm-classifier.js';
export interface AccessibilityValidationResult {
    readonly isValid: boolean;
    readonly score: number;
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
export declare class AccessibilityValidator {
    private wcagRules;
    private norwegianRules;
    private nsmRules;
    constructor();
    /**
     * Validate template accessibility compliance
     */
    validateTemplate(context: TemplateAccessibilityContext): Promise<AccessibilityValidationResult>;
    /**
     * Validate WCAG compliance
     */
    private validateWCAG;
    /**
     * Validate Norwegian accessibility compliance
     */
    private validateNorwegianCompliance;
    /**
     * Validate NSM compliance
     */
    private validateNSMCompliance;
    /**
     * Generate accessibility recommendations
     */
    private generateRecommendations;
    /**
     * Calculate accessibility score
     */
    private calculateAccessibilityScore;
    private hasSemanticHTML;
    private hasProperARIA;
    private hasKeyboardSupport;
    private hasColorContrastConsiderations;
    private hasSkipLinks;
    private hasProperHeadingHierarchy;
    private hasFormLabels;
    private hasFocusManagement;
    private hasContextHelp;
    private hasErrorPrevention;
    private hasNorwegianLanguageSupport;
    private hasAccessibilityStatement;
    private initializeWCAGRules;
    private initializeNorwegianRules;
    private initializeNSMRules;
}
export declare const accessibilityValidator: AccessibilityValidator;
//# sourceMappingURL=accessibility-validator.d.ts.map
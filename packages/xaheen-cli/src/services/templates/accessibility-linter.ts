/**
 * @fileoverview Enhanced Accessibility Linter - WCAG AAA Enforcement
 * @description Comprehensive accessibility validation for template modernization
 * @version 1.0.0
 * @compliance WCAG 2.2 AAA, Norwegian Government Standards, EN 301 549
 */

import { z } from 'zod';

/**
 * WCAG AAA Rule Definitions
 */
interface WCAGRule {
  readonly id: string;
  readonly level: 'A' | 'AA' | 'AAA';
  readonly principle: 'perceivable' | 'operable' | 'understandable' | 'robust';
  readonly guideline: string;
  readonly criterion: string;
  readonly description: string;
  readonly norwegianRequirement?: boolean;
  readonly testFunction: (element: ParsedElement) => ValidationResult;
}

interface ParsedElement {
  readonly tag: string;
  readonly attributes: Record<string, string>;
  readonly children: ParsedElement[];
  readonly text?: string;
  readonly line: number;
  readonly column: number;
}

interface ValidationResult {
  readonly valid: boolean;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly suggestion?: string;
  readonly automaticFix?: string;
  readonly norwegianContext?: string;
}

interface AccessibilityReport {
  readonly valid: boolean;
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | 'non-compliant';
  readonly norwegianCompliant: boolean;
  readonly violations: AccessibilityViolation[];
  readonly warnings: AccessibilityWarning[];
  readonly suggestions: AccessibilitySuggestion[];
  readonly totalIssues: number;
  readonly fixableIssues: number;
  readonly estimatedFixTime: number; // in minutes
}

interface AccessibilityViolation {
  readonly ruleId: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly element: string;
  readonly line: number;
  readonly column: number;
  readonly wcagCriterion: string;
  readonly suggestion: string;
  readonly automaticFix?: string;
  readonly norwegianRequirement?: boolean;
}

interface AccessibilityWarning extends Omit<AccessibilityViolation, 'severity'> {
  readonly severity: 'warning';
}

interface AccessibilitySuggestion extends Omit<AccessibilityViolation, 'severity'> {
  readonly severity: 'info';
}

/**
 * WCAG AAA Rules Implementation
 */
const WCAG_RULES: WCAGRule[] = [
  // 1.1.1 Non-text Content (Level A)
  {
    id: 'wcag-1.1.1',
    level: 'A',
    principle: 'perceivable',
    guideline: '1.1 Text Alternatives',
    criterion: '1.1.1 Non-text Content',
    description: 'All non-text content must have text alternatives',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (element.tag === 'img' || element.tag === 'Image') {
        const alt = element.attributes.alt;
        if (!alt || alt.trim() === '') {
          return {
            valid: false,
            severity: 'error',
            message: 'Image missing alt text',
            suggestion: 'Add descriptive alt text: alt="{{t "image.description" "Describe the image"}}"',
            automaticFix: 'alt={{t "image.alt" "Image description"}}',
            norwegianContext: 'Norwegian government requires descriptive alt text in both Norwegian and English'
          };
        }
        if (alt.length > 125) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Alt text is too long (>125 characters)',
            suggestion: 'Keep alt text concise and descriptive'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 1.3.1 Info and Relationships (Level A)
  {
    id: 'wcag-1.3.1',
    level: 'A',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    criterion: '1.3.1 Info and Relationships',
    description: 'Information, structure, and relationships must be programmatically determinable',
    norwegianRequirement: true,
    testFunction: (element) => {
      // Check for proper heading hierarchy
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tag)) {
        const level = parseInt(element.tag.substring(1));
        if (!element.attributes.id) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Heading should have an id for navigation',
            suggestion: 'Add id="{{kebabCase title}}" to heading',
            automaticFix: 'id="{{kebabCase (t "heading.id" "section-heading")}}"'
          };
        }
      }

      // Check for proper form labels
      if (['input', 'Input', 'textarea', 'Textarea', 'select', 'Select'].includes(element.tag)) {
        if (!element.attributes['aria-label'] && !element.attributes['aria-labelledby'] && !element.attributes.id) {
          return {
            valid: false,
            severity: 'error',
            message: 'Form input must have accessible label',
            suggestion: 'Add aria-label or associate with label element',
            automaticFix: 'aria-label={{t "form.field.label" "Field label"}}',
            norwegianContext: 'Norwegian government forms require explicit labeling in Norwegian'
          };
        }
      }

      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 1.4.3 Contrast (Minimum) (Level AA)
  {
    id: 'wcag-1.4.3',
    level: 'AA',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    criterion: '1.4.3 Contrast (Minimum)',
    description: 'Text must have sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
    testFunction: (element) => {
      // Check for hardcoded colors that might not meet contrast requirements
      const style = element.attributes.style;
      const className = element.attributes.className || element.attributes.class;
      
      if (style && (style.includes('color:') || style.includes('background-color:'))) {
        return {
          valid: false,
          severity: 'error',
          message: 'Hardcoded colors may not meet contrast requirements',
          suggestion: 'Use design tokens with verified contrast ratios',
          automaticFix: 'Remove inline styles and use semantic color tokens'
        };
      }

      if (className && className.includes('text-') && !className.includes('contrast-')) {
        return {
          valid: false,
          severity: 'warning',
          message: 'Custom text colors should include contrast verification',
          suggestion: 'Use semantic color classes with verified contrast'
        };
      }

      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 1.4.6 Contrast (Enhanced) (Level AAA)
  {
    id: 'wcag-1.4.6',
    level: 'AAA',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    criterion: '1.4.6 Contrast (Enhanced)',
    description: 'Text must have enhanced contrast ratio (7:1 for normal text, 4.5:1 for large text)',
    norwegianRequirement: true,
    testFunction: (element) => {
      // Norwegian government requires AAA contrast
      if (['p', 'span', 'Text', 'Typography'].includes(element.tag)) {
        if (!element.attributes['data-contrast-verified']) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Text contrast not verified for AAA compliance',
            suggestion: 'Add data-contrast-verified="true" after manual verification',
            norwegianContext: 'Norwegian government requires AAA contrast ratios (7:1)'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 2.1.1 Keyboard (Level A)
  {
    id: 'wcag-2.1.1',
    level: 'A',
    principle: 'operable',
    guideline: '2.1 Keyboard Accessible',
    criterion: '2.1.1 Keyboard',
    description: 'All functionality must be available from keyboard',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (['button', 'Button', 'a', 'input', 'Input', 'select', 'Select'].includes(element.tag)) {
        if (!element.attributes.onKeyDown && !element.attributes.onKeyPress) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Interactive element should handle keyboard events',
            suggestion: 'Add onKeyDown handler for Enter and Space keys',
            automaticFix: 'onKeyDown={{handleKeyDown}}'
          };
        }
        
        if (!element.attributes.tabIndex && element.tag === 'div') {
          return {
            valid: false,
            severity: 'error',
            message: 'Interactive div must be keyboard focusable',
            suggestion: 'Add tabIndex={0} or use semantic button/link',
            automaticFix: 'tabIndex={0}'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 2.4.1 Bypass Blocks (Level A)
  {
    id: 'wcag-2.4.1',
    level: 'A',
    principle: 'operable',
    guideline: '2.4 Navigable',
    criterion: '2.4.1 Bypass Blocks',
    description: 'Mechanism to skip repeated content blocks',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (element.tag === 'main' || element.attributes.role === 'main') {
        if (!element.attributes.id) {
          return {
            valid: false,
            severity: 'error',
            message: 'Main content area must have id for skip links',
            suggestion: 'Add id="main-content" to main element',
            automaticFix: 'id="main-content"',
            norwegianContext: 'Norwegian accessibility standards require skip navigation'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 2.4.6 Headings and Labels (Level AA)
  {
    id: 'wcag-2.4.6',
    level: 'AA',
    principle: 'operable',
    guideline: '2.4 Navigable',
    criterion: '2.4.6 Headings and Labels',
    description: 'Headings and labels describe topic or purpose',
    testFunction: (element) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tag)) {
        if (!element.text && !element.children.length) {
          return {
            valid: false,
            severity: 'error',
            message: 'Heading must have descriptive text',
            suggestion: 'Add meaningful heading text using {{t "section.title" "Section Title"}}',
            automaticFix: '{{t "heading.title" "Section Heading"}}'
          };
        }
      }

      if (['label', 'Label'].includes(element.tag)) {
        if (!element.attributes.htmlFor && !element.attributes.for) {
          return {
            valid: false,
            severity: 'error',
            message: 'Label must be associated with form control',
            suggestion: 'Add htmlFor="input-id" to associate with input',
            automaticFix: 'htmlFor="{{inputId}}"'
          };
        }
      }

      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 3.1.1 Language of Page (Level A)
  {
    id: 'wcag-3.1.1',
    level: 'A',
    principle: 'understandable',
    guideline: '3.1 Readable',
    criterion: '3.1.1 Language of Page',
    description: 'Default human language of page can be programmatically determined',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (element.tag === 'html') {
        if (!element.attributes.lang) {
          return {
            valid: false,
            severity: 'error',
            message: 'HTML element must specify language',
            suggestion: 'Add lang="{{locale || "nb"}}" to html element',
            automaticFix: 'lang="{{locale || "nb"}}"',
            norwegianContext: 'Norwegian sites must specify "nb", "nn", or "se" language'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 3.2.2 On Input (Level A)
  {
    id: 'wcag-3.2.2',
    level: 'A',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    criterion: '3.2.2 On Input',
    description: 'Changing form controls does not automatically cause context changes',
    testFunction: (element) => {
      if (['select', 'Select'].includes(element.tag)) {
        if (element.attributes.onChange && !element.attributes['aria-describedby']) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Form control with onChange should describe behavior',
            suggestion: 'Add aria-describedby to explain what happens on change'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 4.1.1 Parsing (Level A)
  {
    id: 'wcag-4.1.1',
    level: 'A',
    principle: 'robust',
    guideline: '4.1 Compatible',
    criterion: '4.1.1 Parsing',
    description: 'Content can be parsed unambiguously',
    testFunction: (element) => {
      // Check for duplicate IDs
      if (element.attributes.id) {
        // This would need to be checked at template level
        return { valid: true, severity: 'info', message: 'OK' };
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  // 4.1.2 Name, Role, Value (Level A)
  {
    id: 'wcag-4.1.2',
    level: 'A',
    principle: 'robust',
    guideline: '4.1 Compatible',
    criterion: '4.1.2 Name, Role, Value',
    description: 'Name and role can be programmatically determined',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (['button', 'Button'].includes(element.tag)) {
        if (!element.attributes['aria-label'] && !element.text && !element.children.length) {
          return {
            valid: false,
            severity: 'error',
            message: 'Button must have accessible name',
            suggestion: 'Add aria-label or button text',
            automaticFix: 'aria-label={{t "button.action" "Perform action"}}',
            norwegianContext: 'Norwegian government requires explicit button labeling'
          };
        }
      }

      if (['input', 'Input'].includes(element.tag)) {
        const type = element.attributes.type;
        if (type === 'checkbox' || type === 'radio') {
          if (!element.attributes['aria-label'] && !element.attributes['aria-labelledby']) {
            return {
              valid: false,
              severity: 'error',
              message: 'Checkbox/radio must have accessible name',
              suggestion: 'Add aria-label or aria-labelledby',
              automaticFix: 'aria-label={{t "form.option.label" "Option label"}}'
            };
          }
        }
      }

      return { valid: true, severity: 'info', message: 'OK' };
    }
  }
];

/**
 * Norwegian Government Specific Rules
 */
const NORWEGIAN_RULES: WCAGRule[] = [
  {
    id: 'norway-lang-support',
    level: 'AAA',
    principle: 'understandable',
    guideline: 'Norwegian Language Support',
    criterion: 'Multi-language Support',
    description: 'Norwegian government sites must support multiple Norwegian languages',
    norwegianRequirement: true,
    testFunction: (element) => {
      // Check if text uses internationalization
      if (element.text && !element.text.includes('{{t ')) {
        return {
          valid: false,
          severity: 'error',
          message: 'Hardcoded text found, use internationalization',
          suggestion: 'Replace text with {{t "key" "default text"}}',
          automaticFix: '{{t "content.text" "' + element.text + '"}}',
          norwegianContext: 'All text must be translatable to Norwegian Bokmål, Nynorsk, and Sami'
        };
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  },

  {
    id: 'norway-classification',
    level: 'AAA',
    principle: 'robust',
    guideline: 'Security Classification',
    criterion: 'NSM Classification',
    description: 'Government content must have security classification',
    norwegianRequirement: true,
    testFunction: (element) => {
      if (['main', 'article', 'section'].includes(element.tag)) {
        if (!element.attributes['data-nsm-classification']) {
          return {
            valid: false,
            severity: 'warning',
            message: 'Government content should have NSM classification',
            suggestion: 'Add data-nsm-classification="{{nsmClassification}}"',
            automaticFix: 'data-nsm-classification="{{nsmClassification || \'OPEN\'}}"',
            norwegianContext: 'NSM requires classification of all government content'
          };
        }
      }
      return { valid: true, severity: 'info', message: 'OK' };
    }
  }
];

/**
 * Enhanced Accessibility Linter
 */
export class AccessibilityLinter {
  private readonly rules: WCAGRule[];
  private readonly targetLevel: 'A' | 'AA' | 'AAA';
  private readonly norwegianCompliance: boolean;

  constructor(options: {
    targetLevel?: 'A' | 'AA' | 'AAA';
    norwegianCompliance?: boolean;
    customRules?: WCAGRule[];
  } = {}) {
    this.targetLevel = options.targetLevel ?? 'AAA';
    this.norwegianCompliance = options.norwegianCompliance ?? true;
    
    let rules = [...WCAG_RULES];
    
    if (this.norwegianCompliance) {
      rules = [...rules, ...NORWEGIAN_RULES];
    }
    
    if (options.customRules) {
      rules = [...rules, ...options.customRules];
    }

    // Filter rules by target level
    const levelOrder = { 'A': 1, 'AA': 2, 'AAA': 3 };
    this.rules = rules.filter(rule => 
      levelOrder[rule.level] <= levelOrder[this.targetLevel]
    );
  }

  /**
   * Lint template content for accessibility violations
   */
  public lintTemplate(templateContent: string): AccessibilityReport {
    const elements = this.parseTemplate(templateContent);
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityWarning[] = [];
    const suggestions: AccessibilitySuggestion[] = [];

    elements.forEach(element => {
      this.rules.forEach(rule => {
        const result = rule.testFunction(element);
        
        if (!result.valid) {
          const violation: AccessibilityViolation = {
            ruleId: rule.id,
            severity: result.severity as 'error' | 'warning',
            message: result.message,
            element: element.tag,
            line: element.line,
            column: element.column,
            wcagCriterion: rule.criterion,
            suggestion: result.suggestion || '',
            automaticFix: result.automaticFix,
            norwegianRequirement: rule.norwegianRequirement
          };

          if (result.severity === 'error') {
            violations.push(violation);
          } else if (result.severity === 'warning') {
            warnings.push(violation as AccessibilityWarning);
          } else {
            suggestions.push(violation as AccessibilitySuggestion);
          }
        }
      });
    });

    const totalIssues = violations.length + warnings.length + suggestions.length;
    const fixableIssues = [...violations, ...warnings, ...suggestions]
      .filter(issue => issue.automaticFix).length;

    const wcagLevel = this.determineWCAGLevel(violations, warnings);
    const norwegianCompliant = this.checkNorwegianCompliance(violations, warnings);

    return {
      valid: violations.length === 0,
      wcagLevel,
      norwegianCompliant,
      violations,
      warnings,
      suggestions,
      totalIssues,
      fixableIssues,
      estimatedFixTime: this.calculateFixTime(violations, warnings, suggestions)
    };
  }

  /**
   * Auto-fix accessibility issues in template
   */
  public autoFix(templateContent: string): {
    fixedTemplate: string;
    appliedFixes: string[];
    remainingIssues: number;
  } {
    const report = this.lintTemplate(templateContent);
    let fixedTemplate = templateContent;
    const appliedFixes: string[] = [];

    // Apply automatic fixes
    [...report.violations, ...report.warnings, ...report.suggestions]
      .filter(issue => issue.automaticFix)
      .forEach(issue => {
        // Simple regex replacement for demonstration
        // In practice, this would need more sophisticated AST manipulation
        const elementRegex = new RegExp(`<${issue.element}([^>]*)>`, 'g');
        fixedTemplate = fixedTemplate.replace(elementRegex, (match, attributes) => {
          if (!attributes.includes(issue.automaticFix!.split('=')[0])) {
            return `<${issue.element}${attributes} ${issue.automaticFix}>`;
          }
          return match;
        });
        
        appliedFixes.push(`${issue.ruleId}: ${issue.automaticFix}`);
      });

    const newReport = this.lintTemplate(fixedTemplate);
    
    return {
      fixedTemplate,
      appliedFixes,
      remainingIssues: newReport.violations.length + newReport.warnings.length
    };
  }

  /**
   * Generate comprehensive accessibility report
   */
  public generateReport(templateContent: string): {
    report: AccessibilityReport;
    summary: string;
    recommendations: string[];
    priorityFixes: string[];
  } {
    const report = this.lintTemplate(templateContent);
    
    const summary = this.generateSummary(report);
    const recommendations = this.generateRecommendations(report);
    const priorityFixes = this.generatePriorityFixes(report);

    return {
      report,
      summary,
      recommendations,
      priorityFixes
    };
  }

  /**
   * Parse template content into elements (simplified parser)
   */
  private parseTemplate(templateContent: string): ParsedElement[] {
    const elements: ParsedElement[] = [];
    const lines = templateContent.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const elementRegex = /<(\w+)([^>]*?)(?:\/>|>(.*?)<\/\1>)/g;
      let match;
      
      while ((match = elementRegex.exec(line)) !== null) {
        const [fullMatch, tag, attributesStr, content] = match;
        const attributes = this.parseAttributes(attributesStr);
        
        elements.push({
          tag,
          attributes,
          children: [], // Simplified - would need recursive parsing
          text: content?.replace(/<[^>]*>/g, '').trim(),
          line: lineIndex + 1,
          column: match.index + 1
        });
      }
    });
    
    return elements;
  }

  /**
   * Parse HTML attributes string
   */
  private parseAttributes(attributesStr: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|({[^}]*})|(\S+)))?/g;
    
    let match;
    while ((match = attrRegex.exec(attributesStr.trim())) !== null) {
      const [, name, doubleQuoted, singleQuoted, braced, unquoted] = match;
      attributes[name] = doubleQuoted || singleQuoted || braced || unquoted || 'true';
    }
    
    return attributes;
  }

  /**
   * Determine WCAG compliance level
   */
  private determineWCAGLevel(violations: AccessibilityViolation[], warnings: AccessibilityWarning[]): 'A' | 'AA' | 'AAA' | 'non-compliant' {
    const errorLevels = violations.map(v => {
      const rule = this.rules.find(r => r.id === v.ruleId);
      return rule?.level || 'AAA';
    });

    if (errorLevels.includes('A')) return 'non-compliant';
    if (errorLevels.includes('AA')) return 'A';
    if (errorLevels.includes('AAA')) return 'AA';
    
    return 'AAA';
  }

  /**
   * Check Norwegian government compliance
   */
  private checkNorwegianCompliance(violations: AccessibilityViolation[], warnings: AccessibilityWarning[]): boolean {
    const norwegianViolations = [...violations, ...warnings]
      .filter(issue => issue.norwegianRequirement);
    
    return norwegianViolations.length === 0;
  }

  /**
   * Calculate estimated fix time
   */
  private calculateFixTime(violations: AccessibilityViolation[], warnings: AccessibilityWarning[], suggestions: AccessibilitySuggestion[]): number {
    const errorTime = violations.length * 10; // 10 minutes per error
    const warningTime = warnings.length * 5; // 5 minutes per warning
    const suggestionTime = suggestions.length * 2; // 2 minutes per suggestion
    
    return errorTime + warningTime + suggestionTime;
  }

  /**
   * Generate summary text
   */
  private generateSummary(report: AccessibilityReport): string {
    const { violations, warnings, suggestions, wcagLevel, norwegianCompliant } = report;
    
    let summary = `Accessibility Analysis Summary:\n`;
    summary += `WCAG Compliance: ${wcagLevel}\n`;
    summary += `Norwegian Compliance: ${norwegianCompliant ? 'Yes' : 'No'}\n`;
    summary += `Total Issues: ${report.totalIssues}\n`;
    summary += `  - Errors: ${violations.length}\n`;
    summary += `  - Warnings: ${warnings.length}\n`;
    summary += `  - Suggestions: ${suggestions.length}\n`;
    summary += `Auto-fixable: ${report.fixableIssues}\n`;
    summary += `Estimated Fix Time: ${report.estimatedFixTime} minutes\n`;
    
    return summary;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: AccessibilityReport): string[] {
    const recommendations: string[] = [];
    
    if (report.violations.length > 0) {
      recommendations.push('Address all WCAG violations immediately to ensure basic accessibility compliance');
    }
    
    if (!report.norwegianCompliant) {
      recommendations.push('Implement Norwegian government accessibility requirements for public sector compliance');
    }
    
    if (report.wcagLevel !== 'AAA') {
      recommendations.push('Upgrade to WCAG AAA compliance for enhanced accessibility');
    }
    
    recommendations.push('Use semantic UI components instead of raw HTML elements');
    recommendations.push('Implement comprehensive internationalization with {{t}} functions');
    recommendations.push('Add NSM security classifications to government content');
    
    return recommendations;
  }

  /**
   * Generate priority fixes
   */
  private generatePriorityFixes(report: AccessibilityReport): string[] {
    const priorityFixes: string[] = [];
    
    // High priority: WCAG A and AA violations
    const highPriorityViolations = report.violations.filter(v => {
      const rule = this.rules.find(r => r.id === v.ruleId);
      return rule?.level === 'A' || rule?.level === 'AA';
    });
    
    highPriorityViolations.forEach(violation => {
      priorityFixes.push(`${violation.wcagCriterion}: ${violation.suggestion}`);
    });
    
    // Norwegian requirements
    const norwegianViolations = report.violations.filter(v => v.norwegianRequirement);
    norwegianViolations.forEach(violation => {
      priorityFixes.push(`Norwegian Requirement - ${violation.wcagCriterion}: ${violation.suggestion}`);
    });
    
    return priorityFixes.slice(0, 10); // Top 10 priority fixes
  }
}

/**
 * Default accessibility linter with Norwegian compliance
 */
export const accessibilityLinter = new AccessibilityLinter({
  targetLevel: 'AAA',
  norwegianCompliance: true
});

export default AccessibilityLinter;
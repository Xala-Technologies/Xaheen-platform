/**
 * WCAG AAA Accessibility Validator
 * 
 * Validates compliance with Web Content Accessibility Guidelines (WCAG) 2.1 AAA:
 * - ARIA labels and attributes
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Color contrast requirements
 * - Focus management
 * - Semantic HTML structure
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { ValidationRule, ValidationIssue, ValidationContext } from './comprehensive-validator';
import { createASTAnalyzer } from './ast-analyzer';

// =============================================================================
// WCAG ACCESSIBILITY CONFIGURATION
// =============================================================================

interface WCAGConfig {
  readonly level: 'A' | 'AA' | 'AAA';
  readonly colorContrast: ColorContrastConfig;
  readonly ariaRequirements: AriaRequirement[];
  readonly keyboardNavigation: KeyboardNavigationConfig;
  readonly semanticElements: SemanticElementConfig[];
  readonly focusManagement: FocusManagementConfig;
}

interface ColorContrastConfig {
  readonly normalText: {
    readonly AA: number;
    readonly AAA: number;
  };
  readonly largeText: {
    readonly AA: number;
    readonly AAA: number;
  };
  readonly nonTextElements: {
    readonly AA: number;
    readonly AAA: number;
  };
}

interface AriaRequirement {
  readonly element: string;
  readonly requiredAttributes: string[];
  readonly optionalAttributes: string[];
  readonly validRoles: string[];
}

interface KeyboardNavigationConfig {
  readonly interactiveElements: string[];
  readonly requiredEventHandlers: string[];
  readonly focusableElements: string[];
}

interface SemanticElementConfig {
  readonly element: string;
  readonly purpose: string;
  readonly alternatives: string[];
  readonly wcagCriterion: string;
}

interface FocusManagementConfig {
  readonly focusableElements: string[];
  readonly focusIndicatorRequired: boolean;
  readonly skipLinkRequired: boolean;
  readonly tabOrderImportant: boolean;
}

const WCAG_CONFIG: WCAGConfig = {
  level: 'AAA',
  colorContrast: {
    normalText: { AA: 4.5, AAA: 7.0 },
    largeText: { AA: 3.0, AAA: 4.5 },
    nonTextElements: { AA: 3.0, AAA: 3.0 }
  },
  ariaRequirements: [
    {
      element: 'button',
      requiredAttributes: ['aria-label'],
      optionalAttributes: ['aria-describedby', 'aria-expanded', 'aria-pressed'],
      validRoles: ['button', 'link', 'menuitem']
    },
    {
      element: 'input',
      requiredAttributes: ['aria-label'],
      optionalAttributes: ['aria-describedby', 'aria-invalid', 'aria-required'],
      validRoles: ['textbox', 'searchbox', 'combobox']
    },
    {
      element: 'img',
      requiredAttributes: ['alt'],
      optionalAttributes: ['aria-describedby'],
      validRoles: ['img', 'presentation']
    },
    {
      element: 'a',
      requiredAttributes: ['aria-label'],
      optionalAttributes: ['aria-describedby'],
      validRoles: ['link', 'button']
    }
  ],
  keyboardNavigation: {
    interactiveElements: ['button', 'input', 'select', 'textarea', 'a'],
    requiredEventHandlers: ['onKeyDown', 'onKeyPress'],
    focusableElements: ['button', 'input', 'select', 'textarea', 'a', '[tabindex]']
  },
  semanticElements: [
    {
      element: 'main',
      purpose: 'Main content area',
      alternatives: ['div[role="main"]'],
      wcagCriterion: '1.3.1 Info and Relationships'
    },
    {
      element: 'nav',
      purpose: 'Navigation section',
      alternatives: ['div[role="navigation"]'],
      wcagCriterion: '1.3.1 Info and Relationships'
    },
    {
      element: 'header',
      purpose: 'Page or section header',
      alternatives: ['div[role="banner"]'],
      wcagCriterion: '1.3.1 Info and Relationships'
    },
    {
      element: 'footer',
      purpose: 'Page or section footer',
      alternatives: ['div[role="contentinfo"]'],
      wcagCriterion: '1.3.1 Info and Relationships'
    }
  ],
  focusManagement: {
    focusableElements: ['button', 'input', 'select', 'textarea', 'a', '[tabindex]'],
    focusIndicatorRequired: true,
    skipLinkRequired: true,
    tabOrderImportant: true
  }
};

// =============================================================================
// WCAG ACCESSIBILITY RULES
// =============================================================================

export const wcagAccessibilityRules: ValidationRule[] = [
  // ARIA labels required for interactive elements
  {
    id: 'wcag-aria-labels-required',
    name: 'ARIA Labels Required (1.3.1, 4.1.2)',
    category: 'accessibility',
    severity: 'error',
    description: 'Interactive elements must have accessible names via aria-label or accessible text',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check buttons without aria-label or text content
      const buttonRegex = /<button(?![^>]*(?:aria-label|aria-labelledby))[^>]*>(?!\s*\w)/g;
      let match;
      
      while ((match = buttonRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-aria-labels-required',
          message: 'Button element missing accessible name - add aria-label or text content',
          severity: 'error',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: 'Add aria-label to button',
            oldText: match[0],
            newText: match[0].replace('<button', '<button aria-label="Button action"')
          }
        });
      }
      
      // Check inputs without labels
      const inputRegex = /<input(?![^>]*(?:aria-label|aria-labelledby))[^>]*(?!.*<label[^>]*for=)/g;
      
      while ((match = inputRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-aria-labels-required',
          message: 'Input element missing accessible name - add aria-label, aria-labelledby, or associated label',
          severity: 'error',
          line: lineNumber,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      // Check images without alt text
      const imgRegex = /<img(?![^>]*alt\s*=)[^>]*>/g;
      
      while ((match = imgRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-aria-labels-required',
          message: 'Image element missing alt attribute - add descriptive alt text',
          severity: 'error',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: 'Add alt attribute to image',
            oldText: match[0],
            newText: match[0].replace('<img', '<img alt="Description of image"')
          }
        });
      }
      
      return issues;
    },
    autofix: (sourceCode: string, issues: ValidationIssue[]): string => {
      let fixed = sourceCode;
      
      for (const issue of issues) {
        if (issue.fix) {
          fixed = fixed.replace(issue.fix.oldText, issue.fix.newText);
        }
      }
      
      return fixed;
    }
  },

  // Keyboard navigation support
  {
    id: 'wcag-keyboard-navigation',
    name: 'Keyboard Navigation Support (2.1.1, 2.1.2)',
    category: 'accessibility',
    severity: 'error',
    description: 'All interactive elements must be keyboard accessible',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for onClick without keyboard handler
      const clickOnlyRegex = /<(?:div|span)[^>]*onClick[^>]*(?!.*onKeyDown)(?!.*onKeyPress)/g;
      let match;
      
      while ((match = clickOnlyRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-keyboard-navigation',
          message: 'Element with onClick handler missing keyboard event handler - add onKeyDown or onKeyPress',
          severity: 'error',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: 'Add keyboard event handler',
            oldText: match[0],
            newText: match[0].replace('onClick=', 'onClick={handleClick} onKeyDown={handleKeyDown} onClick=')
          }
        });
      }
      
      // Check for missing tabIndex on interactive elements
      const interactiveNonButtonRegex = /<(?:div|span)[^>]*(?:onClick|role=["'](?:button|link)["'])[^>]*(?!.*tabIndex)/g;
      
      while ((match = interactiveNonButtonRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-keyboard-navigation',
          message: 'Interactive element missing tabIndex - add tabIndex="0" for keyboard accessibility',
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: 'Add tabIndex to interactive element',
            oldText: match[0],
            newText: match[0].replace('>', ' tabIndex="0">')
          }
        });
      }
      
      return issues;
    }
  },

  // Focus management
  {
    id: 'wcag-focus-management',
    name: 'Focus Management (2.4.3, 2.4.7)',
    category: 'accessibility',
    severity: 'warning',
    description: 'Proper focus management and visible focus indicators required',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for missing focus indicators in CSS
      const hasFocusStyles = /(?:focus:|focus-visible:|focus-within:)/.test(sourceCode);
      const hasInteractiveElements = /<(?:button|input|select|textarea|a)\b/.test(sourceCode);
      
      if (hasInteractiveElements && !hasFocusStyles) {
        issues.push({
          ruleId: 'wcag-focus-management',
          message: 'Interactive elements detected without focus indicators - add focus styles',
          severity: 'warning',
          line: 1,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      // Check for focus outline removal
      const outlineNoneRegex = /outline:\s*(?:none|0)\s*[;}]/g;
      let match;
      
      while ((match = outlineNoneRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-focus-management',
          message: 'Focus outline removed - provide alternative focus indicator',
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      return issues;
    }
  },

  // Color contrast validation
  {
    id: 'wcag-color-contrast',
    name: 'Color Contrast Requirements (1.4.3, 1.4.6)',
    category: 'accessibility',
    severity: 'error',
    description: 'Text and interactive elements must meet WCAG AAA color contrast requirements',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for low contrast Tailwind classes (simplified check)
      const lowContrastClasses = [
        'text-gray-400', 'text-gray-300', 'text-yellow-300', 'text-blue-300',
        'text-green-300', 'text-red-300', 'text-purple-300', 'text-pink-300'
      ];
      
      const lowContrastRegex = new RegExp(`\\b(${lowContrastClasses.join('|')})\\b`, 'g');
      let match;
      
      while ((match = lowContrastRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const className = match[1];
        
        issues.push({
          ruleId: 'wcag-color-contrast',
          message: `Color class '${className}' may not meet WCAG AAA contrast requirements (7:1) - use darker colors`,
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: `Replace ${className} with higher contrast alternative`,
            oldText: className,
            newText: className.replace(/(\d+)$/, (match, num) => {
              const newNum = Math.max(600, parseInt(num));
              return newNum.toString();
            })
          }
        });
      }
      
      // Check for background/text contrast issues
      const contrastIssuePatterns = [
        { pattern: /bg-yellow-\d+.*text-white/, message: 'Yellow background with white text may have contrast issues' },
        { pattern: /bg-red-[12]\d+.*text-white/, message: 'Light red background with white text may have contrast issues' },
        { pattern: /bg-blue-[12]\d+.*text-white/, message: 'Light blue background with white text may have contrast issues' }
      ];
      
      for (const contrastPattern of contrastIssuePatterns) {
        if (contrastPattern.pattern.test(sourceCode)) {
          issues.push({
            ruleId: 'wcag-color-contrast',
            message: contrastPattern.message,
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'accessibility'
          });
        }
      }
      
      return issues;
    }
  },

  // Semantic HTML structure
  {
    id: 'wcag-semantic-html',
    name: 'Semantic HTML Structure (1.3.1)',
    category: 'accessibility',
    severity: 'warning',
    description: 'Use semantic HTML elements to convey structure and meaning',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for missing semantic landmarks
      const hasMain = /<main\b/.test(sourceCode);
      const hasNav = /<nav\b/.test(sourceCode);
      const hasHeader = /<header\b/.test(sourceCode);
      const hasFooter = /<footer\b/.test(sourceCode);
      
      const hasPageStructure = /<(?:div|section)[^>]*(?:class|className)=["'][^"']*(?:page|layout|container)/.test(sourceCode);
      
      if (hasPageStructure) {
        if (!hasMain) {
          issues.push({
            ruleId: 'wcag-semantic-html',
            message: 'Page structure detected without <main> landmark - add main element for primary content',
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'accessibility'
          });
        }
        
        if (!hasNav && /<(?:ul|div)[^>]*(?:nav|menu|links)/.test(sourceCode)) {
          issues.push({
            ruleId: 'wcag-semantic-html',
            message: 'Navigation content detected without <nav> landmark - use nav element',
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'accessibility'
          });
        }
      }
      
      // Check for heading structure
      const headingRegex = /<h([1-6])\b/g;
      const headingLevels: number[] = [];
      let match;
      
      while ((match = headingRegex.exec(sourceCode)) !== null) {
        headingLevels.push(parseInt(match[1]));
      }
      
      if (headingLevels.length > 1) {
        // Check for skipped heading levels
        for (let i = 1; i < headingLevels.length; i++) {
          if (headingLevels[i] > headingLevels[i - 1] + 1) {
            issues.push({
              ruleId: 'wcag-semantic-html',
              message: `Heading level skipped - h${headingLevels[i]} follows h${headingLevels[i - 1]}. Use sequential heading levels.`,
              severity: 'warning',
              line: 1,
              file: filePath,
              category: 'accessibility'
            });
          }
        }
        
        // Check if first heading is not h1
        if (headingLevels[0] !== 1) {
          issues.push({
            ruleId: 'wcag-semantic-html',
            message: `First heading should be h1, found h${headingLevels[0]}`,
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'accessibility'
          });
        }
      }
      
      return issues;
    }
  },

  // Screen reader support
  {
    id: 'wcag-screen-reader-support',
    name: 'Screen Reader Support (4.1.2)',
    category: 'accessibility',
    severity: 'error',
    description: 'Elements must be compatible with screen readers',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for missing form labels
      const formRegex = /<(?:input|select|textarea)(?![^>]*(?:aria-label|aria-labelledby))[^>]*>/g;
      let match;
      
      while ((match = formRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const elementType = match[0].match(/<(\w+)/)?.[1] || 'element';
        
        // Check if there's a label element nearby
        const beforeContext = sourceCode.substring(Math.max(0, match.index - 200), match.index);
        const afterContext = sourceCode.substring(match.index, match.index + 200);
        
        if (!/<label[^>]*(?:for=|>)/.test(beforeContext + afterContext)) {
          issues.push({
            ruleId: 'wcag-screen-reader-support',
            message: `${elementType} element not properly labeled for screen readers - add label element or aria-label`,
            severity: 'error',
            line: lineNumber,
            file: filePath,
            category: 'accessibility'
          });
        }
      }
      
      // Check for decorative images with alt text
      const decorativeImgRegex = /<img[^>]*(?:class|className)=["'][^"']*(?:decorative|decoration|icon)[^"']*["'][^>]*alt=["'][^"']+["']/g;
      
      while ((match = decorativeImgRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-screen-reader-support',
          message: 'Decorative image has alt text - use alt="" or role="presentation" for decorative images',
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'accessibility',
          fix: {
            description: 'Set empty alt for decorative image',
            oldText: match[0],
            newText: match[0].replace(/alt=["'][^"']*["']/, 'alt=""')
          }
        });
      }
      
      // Check for missing live regions for dynamic content
      const dynamicContentRegex = /(?:loading|error|success|status).*(?:useState|setState)/g;
      const hasLiveRegion = /aria-live=["'](?:polite|assertive)["']/.test(sourceCode);
      
      if (dynamicContentRegex.test(sourceCode) && !hasLiveRegion) {
        issues.push({
          ruleId: 'wcag-screen-reader-support',
          message: 'Dynamic status content detected without aria-live region - add aria-live for screen reader announcements',
          severity: 'warning',
          line: 1,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      return issues;
    }
  },

  // Motor disabilities support
  {
    id: 'wcag-motor-disabilities',
    name: 'Motor Disabilities Support (2.5.1, 2.5.2)',
    category: 'accessibility',
    severity: 'warning',
    description: 'Support users with motor disabilities',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for small click targets
      const smallTargetRegex = /<(?:button|a)[^>]*(?:class|className)=["'][^"']*(?:text-xs|text-sm|p-1|p-2|h-6|h-8|w-6|w-8)/g;
      let match;
      
      while ((match = smallTargetRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'wcag-motor-disabilities',
          message: 'Small click target detected - ensure minimum 44x44px touch target size',
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      // Check for timeout handling
      const timeoutRegex = /setTimeout|setInterval/g;
      const hasTimeoutExtension = /(?:extend|pause|cancel).*timeout/i.test(sourceCode);
      
      if (timeoutRegex.test(sourceCode) && !hasTimeoutExtension) {
        issues.push({
          ruleId: 'wcag-motor-disabilities',
          message: 'Timeout detected without extension option - provide way for users to extend time limits',
          severity: 'info',
          line: 1,
          file: filePath,
          category: 'accessibility'
        });
      }
      
      return issues;
    }
  }
];

// =============================================================================
// WCAG ACCESSIBILITY VALIDATOR CLASS
// =============================================================================

export class WCAGAccessibilityValidator {
  private rules: ValidationRule[];
  private config: WCAGConfig;

  constructor() {
    this.rules = wcagAccessibilityRules;
    this.config = WCAG_CONFIG;
  }

  /**
   * Validate WCAG accessibility in file
   */
  public validateFile(context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] {
    const allIssues: ValidationIssue[] = [];

    for (const rule of this.rules) {
      try {
        const issues = rule.validate(context, sourceCode, filePath);
        allIssues.push(...issues);
      } catch (error) {
        allIssues.push({
          ruleId: rule.id,
          message: `WCAG accessibility rule validation failed: ${error.message}`,
          severity: 'error',
          file: filePath,
          category: 'accessibility'
        });
      }
    }

    return allIssues;
  }

  /**
   * Analyze accessibility patterns
   */
  public analyzeAccessibilityPatterns(issues: ValidationIssue[]): {
    ariaScore: number;
    keyboardScore: number;
    colorContrastScore: number;
    semanticScore: number;
    screenReaderScore: number;
    overallScore: number;
    wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
  } {
    const accessibilityIssues = issues.filter(issue => issue.category === 'accessibility');
    
    // Calculate individual scores
    const ariaIssues = accessibilityIssues.filter(i => i.ruleId.includes('aria')).length;
    const keyboardIssues = accessibilityIssues.filter(i => i.ruleId.includes('keyboard')).length;
    const colorIssues = accessibilityIssues.filter(i => i.ruleId.includes('color')).length;
    const semanticIssues = accessibilityIssues.filter(i => i.ruleId.includes('semantic')).length;
    const screenReaderIssues = accessibilityIssues.filter(i => i.ruleId.includes('screen-reader')).length;

    const ariaScore = Math.max(0, 100 - (ariaIssues * 15));
    const keyboardScore = Math.max(0, 100 - (keyboardIssues * 20));
    const colorContrastScore = Math.max(0, 100 - (colorIssues * 12));
    const semanticScore = Math.max(0, 100 - (semanticIssues * 10));
    const screenReaderScore = Math.max(0, 100 - (screenReaderIssues * 18));

    const overallScore = Math.round(
      (ariaScore + keyboardScore + colorContrastScore + semanticScore + screenReaderScore) / 5
    );

    // Determine WCAG level
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
    const errors = accessibilityIssues.filter(i => i.severity === 'error').length;
    
    if (errors > 0) {
      wcagLevel = 'Non-compliant';
    } else if (overallScore >= 95) {
      wcagLevel = 'AAA';
    } else if (overallScore >= 85) {
      wcagLevel = 'AA';
    } else if (overallScore >= 70) {
      wcagLevel = 'A';
    } else {
      wcagLevel = 'Non-compliant';
    }

    return {
      ariaScore,
      keyboardScore,
      colorContrastScore,
      semanticScore,
      screenReaderScore,
      overallScore,
      wcagLevel
    };
  }

  /**
   * Generate accessibility recommendations
   */
  public generateAccessibilityRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    const accessibilityIssues = issues.filter(issue => issue.category === 'accessibility');
    
    const errorCount = accessibilityIssues.filter(i => i.severity === 'error').length;
    const warningCount = accessibilityIssues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`Fix ${errorCount} critical accessibility errors to meet basic compliance`);
    }

    const ruleGroups = {
      aria: accessibilityIssues.filter(i => i.ruleId.includes('aria')),
      keyboard: accessibilityIssues.filter(i => i.ruleId.includes('keyboard')),
      color: accessibilityIssues.filter(i => i.ruleId.includes('color')),
      semantic: accessibilityIssues.filter(i => i.ruleId.includes('semantic')),
      screenReader: accessibilityIssues.filter(i => i.ruleId.includes('screen-reader'))
    };

    if (ruleGroups.aria.length > 0) {
      recommendations.push('Add ARIA labels and attributes to improve screen reader compatibility');
    }

    if (ruleGroups.keyboard.length > 0) {
      recommendations.push('Implement keyboard navigation support for all interactive elements');
    }

    if (ruleGroups.color.length > 0) {
      recommendations.push('Review color contrast to meet WCAG AAA requirements (7:1 ratio)');
    }

    if (ruleGroups.semantic.length > 0) {
      recommendations.push('Use semantic HTML elements to improve content structure and meaning');
    }

    if (ruleGroups.screenReader.length > 0) {
      recommendations.push('Enhance screen reader support with proper labels and live regions');
    }

    if (accessibilityIssues.length === 0) {
      recommendations.push('Excellent accessibility! Your code meets WCAG AAA standards.');
    }

    return recommendations;
  }

  /**
   * Assess WCAG compliance level
   */
  public assessWCAGCompliance(issues: ValidationIssue[]): {
    level: 'AAA' | 'AA' | 'A' | 'Non-compliant';
    score: number;
    criticalIssues: ValidationIssue[];
    recommendations: string[];
    passedCriteria: string[];
    failedCriteria: string[];
  } {
    const accessibilityIssues = issues.filter(issue => issue.category === 'accessibility');
    const errors = accessibilityIssues.filter(issue => issue.severity === 'error');
    const warnings = accessibilityIssues.filter(issue => issue.severity === 'warning');

    // Calculate score
    let score = 100;
    score -= errors.length * 20; // 20 points per error
    score -= warnings.length * 5; // 5 points per warning
    score = Math.max(0, score);

    // Determine level
    let level: 'AAA' | 'AA' | 'A' | 'Non-compliant';
    if (errors.length > 0) {
      level = 'Non-compliant';
    } else if (score >= 95) {
      level = 'AAA';
    } else if (score >= 85) {
      level = 'AA';
    } else if (score >= 70) {
      level = 'A';
    } else {
      level = 'Non-compliant';
    }

    // Get critical issues
    const criticalIssues = errors.filter(issue => 
      ['wcag-aria-labels-required', 'wcag-keyboard-navigation', 'wcag-color-contrast'].includes(issue.ruleId)
    );

    // Generate criteria lists
    const allCriteria = [
      '1.3.1 Info and Relationships',
      '1.4.3 Contrast (Minimum)',
      '1.4.6 Contrast (Enhanced)',
      '2.1.1 Keyboard',
      '2.1.2 No Keyboard Trap',
      '2.4.3 Focus Order',
      '2.4.7 Focus Visible',
      '4.1.2 Name, Role, Value'
    ];

    const failedCriteria = [...new Set(accessibilityIssues.map(issue => {
      // Map rule IDs to WCAG criteria
      const criteriaMap: Record<string, string> = {
        'wcag-aria-labels-required': '4.1.2 Name, Role, Value',
        'wcag-keyboard-navigation': '2.1.1 Keyboard',
        'wcag-focus-management': '2.4.7 Focus Visible',
        'wcag-color-contrast': level === 'AAA' ? '1.4.6 Contrast (Enhanced)' : '1.4.3 Contrast (Minimum)',
        'wcag-semantic-html': '1.3.1 Info and Relationships',
        'wcag-screen-reader-support': '4.1.2 Name, Role, Value'
      };
      return criteriaMap[issue.ruleId];
    }).filter(Boolean))];

    const passedCriteria = allCriteria.filter(criterion => !failedCriteria.includes(criterion));

    const recommendations = this.generateAccessibilityRecommendations(issues);

    return {
      level,
      score,
      criticalIssues,
      recommendations,
      passedCriteria,
      failedCriteria
    };
  }

  /**
   * Get WCAG configuration
   */
  public getConfig(): WCAGConfig {
    return this.config;
  }
}

export function createWCAGAccessibilityValidator(): WCAGAccessibilityValidator {
  return new WCAGAccessibilityValidator();
}
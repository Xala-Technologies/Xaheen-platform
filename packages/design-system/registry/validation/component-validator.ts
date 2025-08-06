/**
 * Component Validator - Main validation engine with comprehensive rules
 * Validates component specifications against design system standards
 */

import { BaseComponentSpec, Platform, ValidationRule } from '../core/component-specs';
import { UniversalTheme } from '../core/theme-system';

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly performance: PerformanceIssue[];
  readonly accessibility: AccessibilityIssue[];
  readonly score: ValidationScore;
}

export interface ValidationError {
  readonly id: string;
  readonly message: string;
  readonly severity: 'critical' | 'major' | 'minor';
  readonly rule: string;
  readonly location?: CodeLocation;
  readonly suggestion?: string;
}

export interface ValidationWarning {
  readonly id: string;
  readonly message: string;
  readonly rule: string;
  readonly location?: CodeLocation;
  readonly suggestion?: string;
}

export interface PerformanceIssue {
  readonly id: string;
  readonly type: 'bundle-size' | 'runtime' | 'memory' | 'accessibility';
  readonly message: string;
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly suggestion: string;
  readonly location?: CodeLocation;
}

export interface AccessibilityIssue {
  readonly id: string;
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly criterion: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly suggestion: string;
  readonly location?: CodeLocation;
}

export interface ValidationScore {
  readonly overall: number; // 0-100
  readonly typeScript: number;
  readonly accessibility: number;
  readonly performance: number;
  readonly consistency: number;
  readonly maintainability: number;
}

export interface CodeLocation {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly length?: number;
}

export interface ValidationContext {
  readonly componentSpec: BaseComponentSpec;
  readonly theme: UniversalTheme;
  readonly platform: Platform;
  readonly sourceCode?: string;
  readonly dependencies?: string[];
  readonly strict?: boolean;
}

export interface ComponentValidationOptions {
  readonly strictTypeScript?: boolean;
  readonly wcagLevel?: 'AA' | 'AAA';
  readonly performanceChecks?: boolean;
  readonly crossPlatformValidation?: boolean;
  readonly themeConsistency?: boolean;
  readonly customRules?: ValidationRule[];
  readonly ignoreWarnings?: boolean;
}

// =============================================================================
// VALIDATION RULES ENGINE
// =============================================================================

export interface ValidatorRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'typescript' | 'accessibility' | 'performance' | 'consistency' | 'design-tokens';
  readonly severity: 'error' | 'warning' | 'info';
  readonly platforms: Platform[];
  readonly validate: (context: ValidationContext) => ValidationIssue[];
}

export interface ValidationIssue {
  readonly type: 'error' | 'warning' | 'performance' | 'accessibility';
  readonly id: string;
  readonly message: string;
  readonly location?: CodeLocation;
  readonly suggestion?: string;
}

// =============================================================================
// COMPONENT VALIDATOR CLASS
// =============================================================================

export class ComponentValidator {
  private readonly rules: Map<string, ValidatorRule> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validate a component against all rules
   */
  public validateComponent(
    context: ValidationContext,
    options: ComponentValidationOptions = {}
  ): ValidationResult {
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const performance: PerformanceIssue[] = [];
      const accessibility: AccessibilityIssue[] = [];

      // Apply validation rules based on options
      const applicableRules = this.getApplicableRules(context.platform, options);

      for (const rule of applicableRules) {
        try {
          const issues = rule.validate(context);
          
          for (const issue of issues) {
            switch (issue.type) {
              case 'error':
                errors.push(this.convertToError(issue, rule));
                break;
              case 'warning':
                if (!options.ignoreWarnings) {
                  warnings.push(this.convertToWarning(issue, rule));
                }
                break;
              case 'performance':
                if (options.performanceChecks !== false) {
                  performance.push(this.convertToPerformance(issue));
                }
                break;
              case 'accessibility':
                accessibility.push(this.convertToAccessibility(issue, options.wcagLevel || 'AAA'));
                break;
            }
          }
        } catch (ruleError) {
          errors.push({
            id: `rule-error-${rule.id}`,
            message: `Rule validation failed: ${ruleError}`,
            severity: 'critical',
            rule: rule.id,
            suggestion: 'Check rule implementation or component specification'
          });
        }
      }

      const score = this.calculateScore(errors, warnings, performance, accessibility);
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        performance,
        accessibility,
        score
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          id: 'validation-critical-error',
          message: `Critical validation error: ${error}`,
          severity: 'critical',
          rule: 'system'
        }],
        warnings: [],
        performance: [],
        accessibility: [],
        score: {
          overall: 0,
          typeScript: 0,
          accessibility: 0,
          performance: 0,
          consistency: 0,
          maintainability: 0
        }
      };
    }
  }

  /**
   * Add custom validation rule
   */
  public addRule(rule: ValidatorRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove validation rule
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all available rules
   */
  public getRules(): ValidatorRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Validate multiple components
   */
  public validateBatch(
    contexts: ValidationContext[],
    options: ComponentValidationOptions = {}
  ): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    for (const context of contexts) {
      const result = this.validateComponent(context, options);
      results.set(context.componentSpec.id, result);
    }
    
    return results;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeDefaultRules(): void {
    // TypeScript Rules
    this.addRule({
      id: 'typescript-strict-props',
      name: 'Strict TypeScript Props',
      description: 'All props must have explicit types with readonly interfaces',
      category: 'typescript',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte'],
      validate: (context) => this.validateTypeScriptProps(context)
    });

    this.addRule({
      id: 'typescript-return-types',
      name: 'Explicit Return Types',
      description: 'Components must have explicit return types (JSX.Element)',
      category: 'typescript',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte'],
      validate: (context) => this.validateReturnTypes(context)
    });

    this.addRule({
      id: 'typescript-no-any',
      name: 'No Any Types',
      description: 'Components must not use any types',
      category: 'typescript',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte'],
      validate: (context) => this.validateNoAnyTypes(context)
    });

    // Accessibility Rules
    this.addRule({
      id: 'wcag-aria-labels',
      name: 'WCAG ARIA Labels',
      description: 'Interactive elements must have proper ARIA labels',
      category: 'accessibility',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte', 'vanilla'],
      validate: (context) => this.validateAriaLabels(context)
    });

    this.addRule({
      id: 'wcag-keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Components must support keyboard navigation',
      category: 'accessibility',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte', 'vanilla'],
      validate: (context) => this.validateKeyboardNavigation(context)
    });

    this.addRule({
      id: 'wcag-color-contrast',
      name: 'Color Contrast',
      description: 'Components must meet WCAG color contrast requirements',
      category: 'accessibility',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte', 'vanilla'],
      validate: (context) => this.validateColorContrast(context)
    });

    // Performance Rules
    this.addRule({
      id: 'performance-memoization',
      name: 'Proper Memoization',
      description: 'Components should use proper memoization techniques',
      category: 'performance',
      severity: 'warning',
      platforms: ['react'],
      validate: (context) => this.validateMemoization(context)
    });

    this.addRule({
      id: 'performance-bundle-size',
      name: 'Bundle Size',
      description: 'Components should minimize bundle size impact',
      category: 'performance',
      severity: 'warning',
      platforms: ['react', 'vue', 'angular', 'svelte'],
      validate: (context) => this.validateBundleSize(context)
    });

    // Design Token Rules
    this.addRule({
      id: 'design-tokens-usage',
      name: 'Design Tokens Usage',
      description: 'Components must use design tokens instead of hardcoded values',
      category: 'design-tokens',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte', 'vanilla'],
      validate: (context) => this.validateDesignTokenUsage(context)
    });

    this.addRule({
      id: 'professional-sizing',
      name: 'Professional Component Sizing',
      description: 'Components must meet minimum professional size requirements',
      category: 'design-tokens',
      severity: 'error',
      platforms: ['react', 'vue', 'angular', 'svelte', 'vanilla'],
      validate: (context) => this.validateProfessionalSizing(context)
    });
  }

  private getApplicableRules(platform: Platform, options: ComponentValidationOptions): ValidatorRule[] {
    return Array.from(this.rules.values()).filter(rule => {
      // Check platform compatibility
      if (!rule.platforms.includes(platform)) {
        return false;
      }

      // Apply option filters
      if (options.strictTypeScript === false && rule.category === 'typescript') {
        return false;
      }

      if (options.performanceChecks === false && rule.category === 'performance') {
        return false;
      }

      return true;
    });
  }

  private convertToError(issue: ValidationIssue, rule: ValidatorRule): ValidationError {
    return {
      id: issue.id,
      message: issue.message,
      severity: rule.severity === 'error' ? 'critical' : 'major',
      rule: rule.id,
      location: issue.location,
      suggestion: issue.suggestion
    };
  }

  private convertToWarning(issue: ValidationIssue, rule: ValidatorRule): ValidationWarning {
    return {
      id: issue.id,
      message: issue.message,
      rule: rule.id,
      location: issue.location,
      suggestion: issue.suggestion
    };
  }

  private convertToPerformance(issue: ValidationIssue): PerformanceIssue {
    return {
      id: issue.id,
      type: 'runtime',
      message: issue.message,
      impact: 'medium',
      suggestion: issue.suggestion || 'Optimize component implementation',
      location: issue.location
    };
  }

  private convertToAccessibility(issue: ValidationIssue, wcagLevel: 'AA' | 'AAA'): AccessibilityIssue {
    return {
      id: issue.id,
      wcagLevel,
      criterion: 'General',
      message: issue.message,
      severity: 'error',
      suggestion: issue.suggestion || 'Improve accessibility implementation',
      location: issue.location
    };
  }

  private calculateScore(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    performance: PerformanceIssue[],
    accessibility: AccessibilityIssue[]
  ): ValidationScore {
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const majorErrors = errors.filter(e => e.severity === 'major').length;
    const minorErrors = errors.filter(e => e.severity === 'minor').length;

    // Calculate base score (100 - penalties)
    let overall = 100;
    overall -= criticalErrors * 20; // Critical errors: -20 points each
    overall -= majorErrors * 10;    // Major errors: -10 points each
    overall -= minorErrors * 5;     // Minor errors: -5 points each
    overall -= warnings.length * 2; // Warnings: -2 points each
    overall -= performance.filter(p => p.impact === 'high').length * 5;
    overall -= accessibility.length * 8; // Accessibility issues: -8 points each

    overall = Math.max(0, overall); // Ensure non-negative

    return {
      overall,
      typeScript: Math.max(0, 100 - (criticalErrors * 25) - (majorErrors * 15)),
      accessibility: Math.max(0, 100 - (accessibility.length * 15)),
      performance: Math.max(0, 100 - (performance.length * 10)),
      consistency: Math.max(0, 100 - (warnings.length * 5)),
      maintainability: Math.max(0, 100 - (minorErrors * 10))
    };
  }

  // =============================================================================
  // VALIDATION RULE IMPLEMENTATIONS
  // =============================================================================

  private validateTypeScriptProps(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if component has props interface
    if (!context.componentSpec.props || context.componentSpec.props.length === 0) {
      return issues; // No props to validate
    }

    for (const prop of context.componentSpec.props) {
      // Check for explicit types
      if (!prop.type || prop.type === 'any') {
        issues.push({
          type: 'error',
          id: `typescript-prop-type-${prop.name}`,
          message: `Property '${prop.name}' must have explicit type (found: '${prop.type || 'undefined'}')`,
          suggestion: 'Define explicit TypeScript type for this property'
        });
      }

      // Check for readonly in interfaces (this would need source code analysis)
      if (context.sourceCode && !context.sourceCode.includes('readonly')) {
        issues.push({
          type: 'warning',
          id: `typescript-readonly-props`,
          message: 'Props interface should use readonly properties',
          suggestion: 'Add readonly modifier to interface properties'
        });
      }
    }

    return issues;
  }

  private validateReturnTypes(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.sourceCode && context.platform === 'react') {
      // Check for JSX.Element return type
      if (!context.sourceCode.includes(': JSX.Element')) {
        issues.push({
          type: 'error',
          id: 'typescript-return-type',
          message: 'React components must have explicit JSX.Element return type',
          suggestion: 'Add ": JSX.Element" to component function signature'
        });
      }
    }

    return issues;
  }

  private validateNoAnyTypes(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.sourceCode) {
      const anyTypePattern = /:\s*any\b|<any>/g;
      const matches = context.sourceCode.match(anyTypePattern);
      
      if (matches && matches.length > 0) {
        issues.push({
          type: 'error',
          id: 'typescript-no-any',
          message: `Found ${matches.length} usage(s) of 'any' type`,
          suggestion: 'Replace any types with explicit TypeScript types'
        });
      }
    }

    return issues;
  }

  private validateAriaLabels(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const spec = context.componentSpec;

    if (!spec.accessibility.ariaAttributes || spec.accessibility.ariaAttributes.length === 0) {
      // Check if component is interactive
      const interactiveProps = spec.props.filter(p => 
        p.name.includes('onClick') || 
        p.name.includes('onPress') || 
        p.name.includes('onSubmit')
      );

      if (interactiveProps.length > 0) {
        issues.push({
          type: 'accessibility',
          id: 'wcag-missing-aria',
          message: 'Interactive component missing ARIA attributes',
          suggestion: 'Add aria-label, aria-describedby, or other relevant ARIA attributes'
        });
      }
    }

    return issues;
  }

  private validateKeyboardNavigation(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const spec = context.componentSpec;

    if (!spec.accessibility.keyboardNavigation) {
      // Check if component should support keyboard navigation
      const needsKeyboard = spec.accessibility.roles.some(role => 
        ['button', 'link', 'textbox', 'combobox', 'menuitem'].includes(role)
      );

      if (needsKeyboard) {
        issues.push({
          type: 'accessibility',
          id: 'wcag-keyboard-nav',
          message: 'Component should support keyboard navigation',
          suggestion: 'Implement onKeyDown handlers for Enter and Space keys'
        });
      }
    }

    return issues;
  }

  private validateColorContrast(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!context.componentSpec.accessibility.colorContrastCompliant) {
      issues.push({
        type: 'accessibility',
        id: 'wcag-color-contrast',
        message: 'Component may not meet WCAG color contrast requirements',
        suggestion: 'Verify color combinations meet minimum contrast ratios (4.5:1 for AA, 7:1 for AAA)'
      });
    }

    return issues;
  }

  private validateMemoization(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.sourceCode && context.platform === 'react') {
      // Check for expensive computations without memoization
      const hasComputation = context.sourceCode.includes('map(') || 
                           context.sourceCode.includes('filter(') ||
                           context.sourceCode.includes('reduce(');
      
      const hasMemoization = context.sourceCode.includes('useMemo') ||
                           context.sourceCode.includes('useCallback') ||
                           context.sourceCode.includes('React.memo');

      if (hasComputation && !hasMemoization) {
        issues.push({
          type: 'performance',
          id: 'performance-memoization',
          message: 'Component with computations should use memoization',
          suggestion: 'Use useMemo for expensive calculations and useCallback for event handlers'
        });
      }
    }

    return issues;
  }

  private validateBundleSize(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for large dependencies
    if (context.dependencies) {
      const largeDeps = context.dependencies.filter(dep => 
        ['moment', 'lodash', 'jquery'].some(large => dep.includes(large))
      );

      if (largeDeps.length > 0) {
        issues.push({
          type: 'performance',
          id: 'performance-bundle-size',
          message: `Component uses large dependencies: ${largeDeps.join(', ')}`,
          suggestion: 'Consider lighter alternatives or tree-shaking'
        });
      }
    }

    return issues;
  }

  private validateDesignTokenUsage(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.sourceCode) {
      // Check for hardcoded colors
      const colorPattern = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(|rgba\(/g;
      const hardcodedColors = context.sourceCode.match(colorPattern);

      if (hardcodedColors && hardcodedColors.length > 0) {
        issues.push({
          type: 'error',
          id: 'design-tokens-colors',
          message: 'Component uses hardcoded colors instead of design tokens',
          suggestion: 'Use theme colors or CSS custom properties for colors'
        });
      }

      // Check for hardcoded spacing
      const spacingPattern = /padding:\s*\d+px|margin:\s*\d+px/g;
      const hardcodedSpacing = context.sourceCode.match(spacingPattern);

      if (hardcodedSpacing && hardcodedSpacing.length > 0) {
        issues.push({
          type: 'error',
          id: 'design-tokens-spacing',
          message: 'Component uses hardcoded spacing values',
          suggestion: 'Use spacing tokens from the design system'
        });
      }
    }

    return issues;
  }

  private validateProfessionalSizing(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.sourceCode) {
      const spec = context.componentSpec;
      
      // Check button minimum height
      if (spec.id === 'button' && context.sourceCode.includes('h-8')) {
        issues.push({
          type: 'error',
          id: 'professional-sizing-button',
          message: 'Buttons must have minimum height of h-12 (48px) for professional appearance',
          suggestion: 'Use h-12 or larger for button components'
        });
      }

      // Check input minimum height
      if (spec.id === 'input' && context.sourceCode.includes('h-10')) {
        issues.push({
          type: 'error',
          id: 'professional-sizing-input',
          message: 'Input fields must have minimum height of h-14 (56px) for professional appearance',
          suggestion: 'Use h-14 or larger for input components'
        });
      }
    }

    return issues;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export const createComponentValidator = (): ComponentValidator => {
  return new ComponentValidator();
};

// =============================================================================
// EXPORTS
// =============================================================================

export default ComponentValidator;
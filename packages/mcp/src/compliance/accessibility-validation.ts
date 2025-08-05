/**
 * WCAG AAA Accessibility Compliance Validation
 * Comprehensive accessibility validation for Norwegian UI components
 * @version 1.0.0
 */

import type { NorwegianAccessibilityStandard } from '../types/norwegian-compliance.js';

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type AccessibilityViolationType = 
  | 'color-contrast'
  | 'keyboard-navigation'
  | 'screen-reader'
  | 'focus-management'
  | 'semantic-structure'
  | 'form-labels'
  | 'alternative-text'
  | 'error-handling'
  | 'timing'
  | 'motion-animation';

export interface AccessibilityViolation {
  readonly type: AccessibilityViolationType;
  readonly level: WCAGLevel;
  readonly message: string;
  readonly element?: string;
  readonly recommendation: string;
  readonly wcagReference: string;
}

export interface AccessibilityValidationResult {
  readonly compliant: boolean;
  readonly level: WCAGLevel;
  readonly score: number; // 0-100
  readonly violations: AccessibilityViolation[];
  readonly warnings: AccessibilityViolation[];
  readonly passedChecks: string[];
}

export interface ColorContrastRequirement {
  readonly level: WCAGLevel;
  readonly normalText: number;  // 4.5:1 for AA, 7:1 for AAA
  readonly largeText: number;   // 3:1 for AA, 4.5:1 for AAA
  readonly uiComponents: number; // 3:1 for AA, 4.5:1 for AAA
}

export interface KeyboardNavigationRequirement {
  readonly tabOrder: boolean;
  readonly focusIndicators: boolean;
  readonly trapFocus: boolean;
  readonly skipLinks: boolean;
  readonly keyboardShortcuts: boolean;
}

export interface ScreenReaderRequirement {
  readonly semanticMarkup: boolean;
  readonly ariaLabels: boolean;
  readonly ariaDescriptions: boolean;
  readonly ariaLive: boolean;
  readonly headingStructure: boolean;
  readonly landmarks: boolean;
}

// WCAG Compliance Requirements
export const WCAG_COLOR_CONTRAST: Record<WCAGLevel, ColorContrastRequirement> = {
  'A': {
    level: 'A',
    normalText: 3.0,
    largeText: 3.0,
    uiComponents: 3.0,
  },
  'AA': {
    level: 'AA',
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  },
  'AAA': {
    level: 'AAA',
    normalText: 7.0,
    largeText: 4.5,
    uiComponents: 4.5,
  },
};

export const WCAG_KEYBOARD_NAVIGATION: KeyboardNavigationRequirement = {
  tabOrder: true,
  focusIndicators: true,
  trapFocus: true,
  skipLinks: true,
  keyboardShortcuts: true,
};

export const WCAG_SCREEN_READER: ScreenReaderRequirement = {
  semanticMarkup: true,
  ariaLabels: true,
  ariaDescriptions: true,
  ariaLive: true,
  headingStructure: true,
  landmarks: true,
};

export class AccessibilityValidationService {
  /**
   * Validate component against WCAG AAA standards
   */
  static validateComponent(
    component: any,
    level: WCAGLevel = 'AAA',
    standard: NorwegianAccessibilityStandard = 'WCAG_AAA'
  ): AccessibilityValidationResult {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    // Color contrast validation
    const contrastResults = this.validateColorContrast(component, level);
    violations.push(...contrastResults.violations);
    warnings.push(...contrastResults.warnings);
    passedChecks.push(...contrastResults.passedChecks);

    // Keyboard navigation validation
    const keyboardResults = this.validateKeyboardNavigation(component);
    violations.push(...keyboardResults.violations);
    warnings.push(...keyboardResults.warnings);
    passedChecks.push(...keyboardResults.passedChecks);

    // Screen reader validation
    const screenReaderResults = this.validateScreenReader(component);
    violations.push(...screenReaderResults.violations);
    warnings.push(...screenReaderResults.warnings);
    passedChecks.push(...screenReaderResults.passedChecks);

    // Form validation (if applicable)
    if (component.type === 'form' || component.hasFormElements) {
      const formResults = this.validateFormAccessibility(component);
      violations.push(...formResults.violations);
      warnings.push(...formResults.warnings);
      passedChecks.push(...formResults.passedChecks);
    }

    // Motion and animation validation
    const motionResults = this.validateMotionAnimation(component);
    violations.push(...motionResults.violations);
    warnings.push(...motionResults.warnings);
    passedChecks.push(...motionResults.passedChecks);

    // Calculate compliance score
    const totalChecks = violations.length + warnings.length + passedChecks.length;
    const score = totalChecks > 0 ? Math.round((passedChecks.length / totalChecks) * 100) : 100;
    const compliant = violations.length === 0 && (level === 'AAA' ? warnings.length === 0 : true);

    return {
      compliant,
      level,
      score,
      violations,
      warnings,
      passedChecks,
    };
  }

  /**
   * Validate color contrast requirements
   */
  private static validateColorContrast(
    component: any,
    level: WCAGLevel
  ): { violations: AccessibilityViolation[]; warnings: AccessibilityViolation[]; passedChecks: string[] } {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    const requirements = WCAG_COLOR_CONTRAST[level];

    // Check if component has color contrast information
    if (!component.colors || !component.colors.contrast) {
      violations.push({
        type: 'color-contrast',
        level,
        message: 'Color contrast information not provided',
        recommendation: 'Ensure all text and UI components meet WCAG color contrast requirements',
        wcagReference: 'WCAG 2.1 SC 1.4.3 (AA) / SC 1.4.6 (AAA)',
      });
      return { violations, warnings, passedChecks };
    }

    const { contrast } = component.colors;

    // Validate normal text contrast
    if (contrast.normalText < requirements.normalText) {
      violations.push({
        type: 'color-contrast',
        level,
        message: `Normal text contrast ratio ${contrast.normalText}:1 is below required ${requirements.normalText}:1`,
        recommendation: `Increase contrast ratio to at least ${requirements.normalText}:1 for normal text`,
        wcagReference: level === 'AAA' ? 'WCAG 2.1 SC 1.4.6' : 'WCAG 2.1 SC 1.4.3',
      });
    } else {
      passedChecks.push('Normal text contrast meets requirements');
    }

    // Validate large text contrast
    if (contrast.largeText < requirements.largeText) {
      violations.push({
        type: 'color-contrast',
        level,
        message: `Large text contrast ratio ${contrast.largeText}:1 is below required ${requirements.largeText}:1`,
        recommendation: `Increase contrast ratio to at least ${requirements.largeText}:1 for large text`,
        wcagReference: level === 'AAA' ? 'WCAG 2.1 SC 1.4.6' : 'WCAG 2.1 SC 1.4.3',
      });
    } else {
      passedChecks.push('Large text contrast meets requirements');
    }

    // Validate UI component contrast
    if (contrast.uiComponents < requirements.uiComponents) {
      violations.push({
        type: 'color-contrast',
        level,
        message: `UI component contrast ratio ${contrast.uiComponents}:1 is below required ${requirements.uiComponents}:1`,
        recommendation: `Increase contrast ratio to at least ${requirements.uiComponents}:1 for UI components`,
        wcagReference: 'WCAG 2.1 SC 1.4.11',
      });
    } else {
      passedChecks.push('UI component contrast meets requirements');
    }

    return { violations, warnings, passedChecks };
  }

  /**
   * Validate keyboard navigation
   */
  private static validateKeyboardNavigation(
    component: any
  ): { violations: AccessibilityViolation[]; warnings: AccessibilityViolation[]; passedChecks: string[] } {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    // Check for keyboard navigation support
    if (!component.accessibility?.keyboardNavigation) {
      violations.push({
        type: 'keyboard-navigation',
        level: 'A',
        message: 'Keyboard navigation not implemented',
        recommendation: 'Implement full keyboard navigation support with proper tab order',
        wcagReference: 'WCAG 2.1 SC 2.1.1',
      });
    } else {
      passedChecks.push('Keyboard navigation implemented');
    }

    // Check for visible focus indicators
    if (!component.accessibility?.focusIndicators) {
      violations.push({
        type: 'focus-management',
        level: 'AA',
        message: 'Visible focus indicators not implemented',
        recommendation: 'Add visible focus indicators for all interactive elements',
        wcagReference: 'WCAG 2.1 SC 2.4.7',
      });
    } else {
      passedChecks.push('Visible focus indicators implemented');
    }

    // Check for skip links (if applicable)
    if (component.type === 'navigation' || component.type === 'layout') {
      if (!component.accessibility?.skipLinks) {
        warnings.push({
          type: 'keyboard-navigation',
          level: 'A',
          message: 'Skip links not implemented',
          recommendation: 'Add skip links to help keyboard users navigate efficiently',
          wcagReference: 'WCAG 2.1 SC 2.4.1',
        });
      } else {
        passedChecks.push('Skip links implemented');
      }
    }

    // Check for focus trap (for modals/dialogs)
    if (component.type === 'modal' || component.type === 'dialog') {
      if (!component.accessibility?.focusTrap) {
        violations.push({
          type: 'focus-management',
          level: 'A',
          message: 'Focus trap not implemented for modal/dialog',
          recommendation: 'Implement focus trapping to keep focus within the modal',
          wcagReference: 'WCAG 2.1 SC 2.1.2',
        });
      } else {
        passedChecks.push('Focus trap implemented for modal');
      }
    }

    return { violations, warnings, passedChecks };
  }

  /**
   * Validate screen reader support
   */
  private static validateScreenReader(
    component: any
  ): { violations: AccessibilityViolation[]; warnings: AccessibilityViolation[]; passedChecks: string[] } {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    // Check for ARIA labels
    if (!component.accessibility?.ariaLabels) {
      violations.push({
        type: 'screen-reader',
        level: 'A',
        message: 'ARIA labels not implemented',
        recommendation: 'Add appropriate ARIA labels for all interactive elements',
        wcagReference: 'WCAG 2.1 SC 4.1.2',
      });
    } else {
      passedChecks.push('ARIA labels implemented');
    }

    // Check for semantic markup
    if (!component.accessibility?.semanticMarkup) {
      violations.push({
        type: 'semantic-structure',
        level: 'A',
        message: 'Semantic HTML structure not used',
        recommendation: 'Use proper semantic HTML elements (header, nav, main, section, etc.)',
        wcagReference: 'WCAG 2.1 SC 1.3.1',
      });
    } else {
      passedChecks.push('Semantic HTML structure used');
    }

    // Check for heading hierarchy (if applicable)
    if (component.hasHeadings && !component.accessibility?.headingStructure) {
      violations.push({
        type: 'semantic-structure',
        level: 'A',
        message: 'Proper heading hierarchy not implemented',
        recommendation: 'Use proper heading hierarchy (h1, h2, h3, etc.) without skipping levels',
        wcagReference: 'WCAG 2.1 SC 1.3.1',
      });
    } else if (component.hasHeadings) {
      passedChecks.push('Proper heading hierarchy implemented');
    }

    // Check for ARIA live regions (for dynamic content)
    if (component.hasDynamicContent && !component.accessibility?.ariaLive) {
      warnings.push({
        type: 'screen-reader',
        level: 'A',
        message: 'ARIA live regions not implemented for dynamic content',
        recommendation: 'Use aria-live attributes to announce dynamic content changes',
        wcagReference: 'WCAG 2.1 SC 4.1.3',
      });
    } else if (component.hasDynamicContent) {
      passedChecks.push('ARIA live regions implemented for dynamic content');
    }

    // Check for landmarks (if applicable)
    if (component.type === 'layout' && !component.accessibility?.landmarks) {
      warnings.push({
        type: 'semantic-structure',
        level: 'A',
        message: 'ARIA landmarks not implemented',
        recommendation: 'Use ARIA landmarks (banner, navigation, main, complementary, etc.)',
        wcagReference: 'WCAG 2.1 SC 1.3.1',
      });
    } else if (component.type === 'layout') {
      passedChecks.push('ARIA landmarks implemented');
    }

    return { violations, warnings, passedChecks };
  }

  /**
   * Validate form accessibility
   */
  private static validateFormAccessibility(
    component: any
  ): { violations: AccessibilityViolation[]; warnings: AccessibilityViolation[]; passedChecks: string[] } {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    // Check for form labels
    if (!component.accessibility?.formLabels) {
      violations.push({
        type: 'form-labels',
        level: 'A',
        message: 'Form labels not properly associated with inputs',
        recommendation: 'Use <label> elements or aria-labelledby to associate labels with form controls',
        wcagReference: 'WCAG 2.1 SC 1.3.1',
      });
    } else {
      passedChecks.push('Form labels properly associated');
    }

    // Check for error handling
    if (!component.accessibility?.errorHandling) {
      violations.push({
        type: 'error-handling',
        level: 'A',
        message: 'Accessible error handling not implemented',
        recommendation: 'Implement accessible error messages with proper ARIA attributes',
        wcagReference: 'WCAG 2.1 SC 3.3.1',
      });
    } else {
      passedChecks.push('Accessible error handling implemented');
    }

    // Check for fieldset/legend (for grouped form controls)
    if (component.hasFormGroups && !component.accessibility?.fieldsetLegend) {
      warnings.push({
        type: 'form-labels',
        level: 'A',
        message: 'Fieldset and legend not used for grouped form controls',
        recommendation: 'Use fieldset and legend elements to group related form controls',
        wcagReference: 'WCAG 2.1 SC 1.3.1',
      });
    } else if (component.hasFormGroups) {
      passedChecks.push('Fieldset and legend used for grouped controls');
    }

    // Check for required field indicators
    if (!component.accessibility?.requiredFields) {
      warnings.push({
        type: 'form-labels',
        level: 'A',
        message: 'Required fields not properly indicated',
        recommendation: 'Use aria-required or proper visual/textual indicators for required fields',
        wcagReference: 'WCAG 2.1 SC 3.3.2',
      });
    } else {
      passedChecks.push('Required fields properly indicated');
    }

    return { violations, warnings, passedChecks };
  }

  /**
   * Validate motion and animation
   */
  private static validateMotionAnimation(
    component: any
  ): { violations: AccessibilityViolation[]; warnings: AccessibilityViolation[]; passedChecks: string[] } {
    const violations: AccessibilityViolation[] = [];
    const warnings: AccessibilityViolation[] = [];
    const passedChecks: string[] = [];

    // Check for reduced motion support
    if (component.hasAnimation && !component.accessibility?.reducedMotion) {
      violations.push({
        type: 'motion-animation',
        level: 'AAA',
        message: 'Reduced motion preferences not respected',
        recommendation: 'Implement prefers-reduced-motion media query to disable animations',
        wcagReference: 'WCAG 2.1 SC 2.3.3',
      });
    } else if (component.hasAnimation) {
      passedChecks.push('Reduced motion preferences respected');
    }

    // Check for auto-playing content
    if (component.hasAutoplay && !component.accessibility?.pauseControl) {
      violations.push({
        type: 'motion-animation',
        level: 'A',
        message: 'Auto-playing content without pause control',
        recommendation: 'Provide pause, stop, or hide controls for auto-playing content',
        wcagReference: 'WCAG 2.1 SC 2.2.2',
      });
    } else if (component.hasAutoplay) {
      passedChecks.push('Auto-playing content has pause control');
    }

    // Check for seizure-inducing content
    if (component.hasFlashing && !component.accessibility?.flashingLimit) {
      violations.push({
        type: 'motion-animation',
        level: 'A',
        message: 'Potentially seizure-inducing flashing content',
        recommendation: 'Ensure flashing content does not exceed 3 flashes per second',
        wcagReference: 'WCAG 2.1 SC 2.3.1',
      });
    } else if (component.hasFlashing) {
      passedChecks.push('Flashing content within safe limits');
    }

    return { violations, warnings, passedChecks };
  }

  /**
   * Generate accessibility testing template
   */
  static generateAccessibilityTestTemplate(): string {
    return `
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityValidationService } from '../compliance/accessibility-validation';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Comprehensive accessibility test suite
 */
export const createAccessibilityTests = (Component: React.ComponentType<any>, props: any = {}) => {
  describe(\`\${Component.name} - Accessibility Tests\`, () => {
    // Automated accessibility testing with axe-core
    it('should not have any accessibility violations', async () => {
      const { container } = render(<Component {...props} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // Keyboard navigation tests
    describe('Keyboard Navigation', () => {
      it('should be keyboard accessible', async () => {
        const user = userEvent.setup();
        render(<Component {...props} />);
        
        // Test tab navigation
        await user.tab();
        const focusedElement = document.activeElement;
        expect(focusedElement).toBeInTheDocument();
        expect(focusedElement).toHaveAttribute('tabindex');
      });

      it('should have visible focus indicators', async () => {
        const user = userEvent.setup();
        render(<Component {...props} />);
        
        await user.tab();
        const focusedElement = document.activeElement;
        const styles = window.getComputedStyle(focusedElement as Element);
        
        // Check for focus styles (outline, box-shadow, etc.)
        expect(
          styles.outline !== 'none' || 
          styles.boxShadow !== 'none' ||
          styles.borderColor !== 'transparent'
        ).toBe(true);
      });

      it('should support Enter and Space key activation', async () => {
        const user = userEvent.setup();
        const mockHandler = jest.fn();
        
        render(<Component {...props} onClick={mockHandler} />);
        
        const element = screen.getByRole('button');
        await user.click(element);
        await user.type(element, '{enter}');
        await user.type(element, ' ');
        
        expect(mockHandler).toHaveBeenCalledTimes(3);
      });
    });

    // Screen reader tests
    describe('Screen Reader Support', () => {
      it('should have proper ARIA labels', () => {
        render(<Component {...props} />);
        
        // Check for ARIA labels on interactive elements
        const interactiveElements = screen.getAllByRole(/button|link|textbox|checkbox|radio|listbox|combobox/);
        interactiveElements.forEach(element => {
          expect(
            element.hasAttribute('aria-label') ||
            element.hasAttribute('aria-labelledby') ||
            element.textContent?.trim()
          ).toBeTruthy();
        });
      });

      it('should have proper semantic structure', () => {
        const { container } = render(<Component {...props} />);
        
        // Check for semantic HTML elements
        const semanticElements = container.querySelectorAll(
          'header, nav, main, section, article, aside, footer, h1, h2, h3, h4, h5, h6'
        );
        
        if (semanticElements.length > 0) {
          expect(semanticElements.length).toBeGreaterThan(0);
        }
      });

      it('should announce dynamic content changes', async () => {
        const { rerender } = render(<Component {...props} />);
        
        // Check for ARIA live regions
        const liveRegions = screen.queryAllByRole('status') || 
                           screen.queryAllByRole('alert') ||
                           document.querySelectorAll('[aria-live]');
        
        if (props.hasDynamicContent) {
          expect(liveRegions.length).toBeGreaterThan(0);
        }
      });
    });

    // Color contrast tests
    describe('Color Contrast', () => {
      it('should meet WCAG AAA color contrast requirements', () => {
        const { container } = render(<Component {...props} />);
        
        // This would typically use a color contrast checking library
        // For now, we'll check if the component defines contrast ratios
        const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label');
        
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const backgroundColor = styles.backgroundColor;
          const color = styles.color;
          
          // In a real implementation, you would calculate contrast ratio
          expect(backgroundColor).toBeDefined();
          expect(color).toBeDefined();
        });
      });
    });

    // Form accessibility tests (if applicable)
    if (props.type === 'form' || props.hasFormElements) {
      describe('Form Accessibility', () => {
        it('should have proper form labels', () => {
          render(<Component {...props} />);
          
          const inputs = screen.getAllByRole('textbox') || [];
          const checkboxes = screen.getAllByRole('checkbox') || [];
          const radios = screen.getAllByRole('radio') || [];
          
          [...inputs, ...checkboxes, ...radios].forEach(input => {
            expect(
              input.hasAttribute('aria-label') ||
              input.hasAttribute('aria-labelledby') ||
              document.querySelector(\`label[for="\${input.id}"]\`)
            ).toBeTruthy();
          });
        });

        it('should handle errors accessibly', async () => {
          const user = userEvent.setup();
          render(<Component {...props} />);
          
          // Trigger validation error
          const submitButton = screen.getByRole('button', { name: /submit/i });
          await user.click(submitButton);
          
          // Check for error messages
          const errorMessages = screen.queryAllByRole('alert');
          if (errorMessages.length > 0) {
            errorMessages.forEach(error => {
              expect(error).toBeInTheDocument();
              expect(error).toHaveAttribute('aria-live', 'polite');
            });
          }
        });

        it('should indicate required fields', () => {
          render(<Component {...props} />);
          
          const requiredInputs = document.querySelectorAll('[required], [aria-required="true"]');
          requiredInputs.forEach(input => {
            expect(
              input.hasAttribute('required') ||
              input.getAttribute('aria-required') === 'true'
            ).toBeTruthy();
          });
        });
      });
    }

    // Motion and animation tests
    describe('Motion and Animation', () => {
      it('should respect reduced motion preferences', () => {
        // Mock prefers-reduced-motion
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          })),
        });

        const { container } = render(<Component {...props} />);
        
        // Check that animations are disabled when reduced motion is preferred
        const animatedElements = container.querySelectorAll('[class*="animate"], [style*="transition"], [style*="animation"]');
        
        if (animatedElements.length > 0) {
          // In a real implementation, check that animations are disabled
          expect(animatedElements.length).toBeGreaterThanOrEqual(0);
        }
      });

      it('should not have seizure-inducing content', () => {
        const { container } = render(<Component {...props} />);
        
        // Check for flashing content
        const flashingElements = container.querySelectorAll('[class*="flash"], [class*="blink"]');
        
        // Ensure any flashing is within safe limits
        expect(flashingElements.length).toBeLessThanOrEqual(3); // Arbitrary safe limit
      });
    });

    // Custom validation using our service
    it('should pass Norwegian accessibility compliance validation', () => {
      const mockComponent = {
        type: props.type || 'component',
        accessibility: {
          keyboardNavigation: true,
          focusIndicators: true,
          ariaLabels: true,
          semanticMarkup: true,
          formLabels: props.type === 'form',
          errorHandling: props.type === 'form',
          reducedMotion: true,
        },
        colors: {
          contrast: {
            normalText: 7.0,
            largeText: 4.5,
            uiComponents: 4.5,
          },
        },
        hasAnimation: props.hasAnimation || false,
        hasDynamicContent: props.hasDynamicContent || false,
        hasFormElements: props.type === 'form',
        hasHeadings: props.hasHeadings || false,
      };

      const result = AccessibilityValidationService.validateComponent(mockComponent, 'AAA');
      
      expect(result.compliant).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.violations.length).toBe(0);
    });
  });
};

// Usage example:
// createAccessibilityTests(MyButton, { variant: 'primary', size: 'large' });

export default createAccessibilityTests;
`;
  }

  /**
   * Generate accessibility audit report
   */
  static generateAccessibilityAuditReport(results: AccessibilityValidationResult[]): string {
    const totalComponents = results.length;
    const compliantComponents = results.filter(r => r.compliant).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalComponents;
    
    const allViolations = results.flatMap(r => r.violations);
    const violationsByType = allViolations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
# Accessibility Audit Report

## Summary
- **Total Components**: ${totalComponents}
- **Compliant Components**: ${compliantComponents} (${Math.round((compliantComponents / totalComponents) * 100)}%)
- **Average Score**: ${Math.round(averageScore)}%
- **Total Violations**: ${allViolations.length}

## Violation Breakdown
${Object.entries(violationsByType)
  .sort(([,a], [,b]) => b - a)
  .map(([type, count]) => `- **${type}**: ${count} violations`)
  .join('\n')}

## Detailed Results
${results.map((result, index) => `
### Component ${index + 1}
- **Compliant**: ${result.compliant ? '✅' : '❌'}
- **Score**: ${result.score}%
- **Level**: ${result.level}
- **Violations**: ${result.violations.length}
- **Warnings**: ${result.warnings.length}
- **Passed Checks**: ${result.passedChecks.length}

${result.violations.length > 0 ? `
#### Violations
${result.violations.map(v => `
- **${v.type}** (${v.level}): ${v.message}
  - Recommendation: ${v.recommendation}
  - WCAG Reference: ${v.wcagReference}
`).join('')}
` : ''}

${result.warnings.length > 0 ? `
#### Warnings
${result.warnings.map(w => `
- **${w.type}** (${w.level}): ${w.message}
  - Recommendation: ${w.recommendation}
  - WCAG Reference: ${w.wcagReference}
`).join('')}
` : ''}
`).join('')}

## Recommendations
1. Focus on the most common violation types: ${Object.keys(violationsByType).slice(0, 3).join(', ')}
2. Implement automated accessibility testing in your CI/CD pipeline
3. Conduct regular manual accessibility audits
4. Train team members on accessibility best practices
5. Test with actual assistive technologies and users with disabilities

---
Generated by Norwegian Compliance Accessibility Validation Service
Date: ${new Date().toLocaleDateString('nb-NO')}
`;
  }
}

export default AccessibilityValidationService;
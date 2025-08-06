/**
 * Component Validation Tests
 * Tests for the component validator engine
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { 
  ComponentValidator, 
  ValidationContext, 
  ComponentValidationOptions,
  ValidationResult 
} from '../validation/component-validator';
import { BaseComponentSpec } from '../core/component-specs';
import { norwegianTheme } from '../core/theme-system';

describe('ComponentValidator', () => {
  let validator: ComponentValidator;
  
  beforeEach(() => {
    validator = new ComponentValidator();
  });

  describe('TypeScript Validation', () => {
    test('should validate strict TypeScript props', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'test-button',
        name: 'Test Button',
        description: 'Test button component',
        category: 'form',
        platforms: ['react'],
        version: '1.0.0',
        props: [
          {
            name: 'variant',
            type: 'any', // Should fail
            required: false,
            description: 'Button variant'
          },
          {
            name: 'onClick',
            type: '() => void',
            required: false,
            description: 'Click handler'
          }
        ],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: true,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['button']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react'
      };

      const result = validator.validateComponent(context);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('must have explicit type');
    });

    test('should validate return types for React components', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'test-component',
        name: 'Test Component',
        description: 'Test component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
export const TestComponent = () => {
  return <div>Test</div>;
}
        `
      };

      const result = validator.validateComponent(context);
      
      expect(result.errors.some(e => e.id === 'typescript-return-type')).toBe(true);
    });

    test('should catch any types in source code', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'test-component',
        name: 'Test Component',
        description: 'Test component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
const data: any = props;
const items: Array<any> = [];
        `
      };

      const result = validator.validateComponent(context);
      
      expect(result.errors.some(e => e.id === 'typescript-no-any')).toBe(true);
    });
  });

  describe('Accessibility Validation', () => {
    test('should validate ARIA labels for interactive components', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'interactive-button',
        name: 'Interactive Button',
        description: 'Interactive button component',
        category: 'form',
        platforms: ['react'],
        version: '1.0.0',
        props: [
          {
            name: 'onClick',
            type: '() => void',
            required: true,
            description: 'Click handler'
          }
        ],
        accessibility: {
          ariaAttributes: [], // Missing ARIA attributes
          keyboardNavigation: true,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['button']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react'
      };

      const result = validator.validateComponent(context);
      
      expect(result.accessibility.some(a => a.id === 'wcag-missing-aria')).toBe(true);
    });

    test('should validate keyboard navigation requirements', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'menu-item',
        name: 'Menu Item',
        description: 'Menu item component',
        category: 'navigation',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNavigation: false, // Should support keyboard
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['menuitem']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react'
      };

      const result = validator.validateComponent(context);
      
      expect(result.accessibility.some(a => a.id === 'wcag-keyboard-nav')).toBe(true);
    });
  });

  describe('Performance Validation', () => {
    test('should validate memoization for React components', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'list-component',
        name: 'List Component',
        description: 'List component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
export const ListComponent = ({ items }: Props): JSX.Element => {
  const sortedItems = items.filter(item => item.active).map(item => item.name);
  
  return (
    <ul>
      {sortedItems.map(name => <li key={name}>{name}</li>)}
    </ul>
  );
};
        `
      };

      const result = validator.validateComponent(context, { performanceChecks: true });
      
      expect(result.performance.some(p => p.id === 'performance-memoization')).toBe(true);
    });

    test('should check for large dependencies', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'date-picker',
        name: 'Date Picker',
        description: 'Date picker component',
        category: 'form',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNavigation: true,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['combobox']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        dependencies: ['react', 'moment', 'lodash']
      };

      const result = validator.validateComponent(context, { performanceChecks: true });
      
      expect(result.performance.some(p => p.id === 'performance-bundle-size')).toBe(true);
    });
  });

  describe('Design Token Validation', () => {
    test('should validate against hardcoded colors', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'styled-card',
        name: 'Styled Card',
        description: 'Styled card component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
export const StyledCard = (): JSX.Element => {
  return (
    <div style={{ backgroundColor: '#ff0000', padding: '16px' }}>
      <h2 style={{ color: 'rgb(0, 0, 0)' }}>Title</h2>
    </div>
  );
};
        `
      };

      const result = validator.validateComponent(context);
      
      expect(result.errors.some(e => e.id === 'design-tokens-colors')).toBe(true);
      expect(result.errors.some(e => e.id === 'design-tokens-spacing')).toBe(true);
    });

    test('should validate professional sizing requirements', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'button',
        name: 'Button',
        description: 'Button component',
        category: 'form',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNavigation: true,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['button']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
export const Button = ({ children }: Props): JSX.Element => {
  return (
    <button className="h-8 px-2 text-xs">
      {children}
    </button>
  );
};
        `
      };

      const result = validator.validateComponent(context);
      
      expect(result.errors.some(e => e.id === 'professional-sizing-button')).toBe(true);
    });
  });

  describe('Validation Options', () => {
    test('should respect ignoreWarnings option', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'test-component',
        name: 'Test Component',
        description: 'Test component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Title'
          }
        ],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
interface Props {
  title: string; // Not readonly
}
        `
      };

      const options: ComponentValidationOptions = {
        ignoreWarnings: true
      };

      const result = validator.validateComponent(context, options);
      
      expect(result.warnings).toHaveLength(0);
    });

    test('should skip performance checks when disabled', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'heavy-component',
        name: 'Heavy Component',
        description: 'Heavy component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        dependencies: ['moment', 'lodash'],
        sourceCode: `
export const HeavyComponent = ({ items }: Props): JSX.Element => {
  const processed = items.map(item => item.value * 2).filter(v => v > 0);
  return <div>{processed}</div>;
};
        `
      };

      const options: ComponentValidationOptions = {
        performanceChecks: false
      };

      const result = validator.validateComponent(context, options);
      
      expect(result.performance).toHaveLength(0);
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple components', () => {
      const specs: BaseComponentSpec[] = [
        {
          id: 'button',
          name: 'Button',
          description: 'Button component',
          category: 'form',
          platforms: ['react'],
          version: '1.0.0',
          props: [
            {
              name: 'variant',
              type: 'any', // Should fail
              required: false,
              description: 'Variant'
            }
          ],
          accessibility: {
            ariaAttributes: [],
            keyboardNavigation: true,
            screenReaderSupport: true,
            colorContrastCompliant: true,
            focusManagement: true,
            roles: ['button']
          },
          examples: []
        },
        {
          id: 'input',
          name: 'Input',
          description: 'Input component',
          category: 'form',
          platforms: ['react'],
          version: '1.0.0',
          props: [
            {
              name: 'value',
              type: 'string',
              required: true,
              description: 'Value'
            }
          ],
          accessibility: {
            ariaAttributes: ['aria-label'],
            keyboardNavigation: true,
            screenReaderSupport: true,
            colorContrastCompliant: true,
            focusManagement: true,
            roles: ['textbox']
          },
          examples: []
        }
      ];

      const contexts: ValidationContext[] = specs.map(spec => ({
        componentSpec: spec,
        theme: norwegianTheme,
        platform: 'react'
      }));

      const results = validator.validateBatch(contexts);
      
      expect(results.size).toBe(2);
      expect(results.get('button')?.valid).toBe(false);
      expect(results.get('input')?.valid).toBe(true);
    });
  });

  describe('Scoring System', () => {
    test('should calculate accurate validation scores', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'poor-component',
        name: 'Poor Component',
        description: 'Poorly implemented component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [
          {
            name: 'data',
            type: 'any', // Critical error
            required: true,
            description: 'Data'
          }
        ],
        accessibility: {
          ariaAttributes: [], // Missing ARIA
          keyboardNavigation: false, // Missing keyboard nav
          screenReaderSupport: false,
          colorContrastCompliant: false, // Color contrast issue
          focusManagement: false,
          roles: ['button'] // Interactive without support
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
const PoorComponent = (props: any) => { // Multiple any types
  const data: any = props.data;
  return <button style={{ color: '#333', backgroundColor: '#eee', height: '20px' }}>Click</button>;
};
        `,
        dependencies: ['moment', 'lodash'] // Heavy dependencies
      };

      const result = validator.validateComponent(context);
      
      expect(result.score.overall).toBeLessThan(50);
      expect(result.score.typeScript).toBeLessThan(50);
      expect(result.score.accessibility).toBeLessThan(50);
      expect(result.valid).toBe(false);
    });

    test('should give high scores to well-implemented components', () => {
      const mockSpec: BaseComponentSpec = {
        id: 'good-component',
        name: 'Good Component',
        description: 'Well-implemented component',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Title'
          }
        ],
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-describedby'],
          keyboardNavigation: true,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: true,
          roles: ['article']
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: norwegianTheme,
        platform: 'react',
        sourceCode: `
interface GoodComponentProps {
  readonly title: string;
}

export const GoodComponent = ({ title }: GoodComponentProps): JSX.Element => {
  return (
    <article 
      aria-label={title}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </article>
  );
};
        `
      };

      const result = validator.validateComponent(context);
      
      expect(result.score.overall).toBeGreaterThan(90);
      expect(result.score.typeScript).toBe(100);
      expect(result.score.accessibility).toBe(100);
      expect(result.valid).toBe(true);
    });
  });

  describe('Custom Rules', () => {
    test('should allow adding custom validation rules', () => {
      validator.addRule({
        id: 'custom-norwegian-compliance',
        name: 'Norwegian Compliance',
        description: 'Check Norwegian-specific requirements',
        category: 'consistency',
        severity: 'error',
        platforms: ['react', 'vue', 'angular', 'svelte'],
        validate: (context) => {
          const issues = [];
          
          if (!context.theme.norwegian?.enabled) {
            issues.push({
              type: 'error' as const,
              id: 'norwegian-theme-disabled',
              message: 'Norwegian theme must be enabled for compliance',
              suggestion: 'Enable Norwegian theme in component configuration'
            });
          }
          
          return issues;
        }
      });

      const mockSpec: BaseComponentSpec = {
        id: 'norwegian-component',
        name: 'Norwegian Component',
        description: 'Component requiring Norwegian compliance',
        category: 'display',
        platforms: ['react'],
        version: '1.0.0',
        props: [],
        accessibility: {
          ariaAttributes: [],
          keyboardNavigation: false,
          screenReaderSupport: true,
          colorContrastCompliant: true,
          focusManagement: false,
          roles: []
        },
        examples: []
      };

      const context: ValidationContext = {
        componentSpec: mockSpec,
        theme: { ...norwegianTheme, norwegian: { enabled: false } },
        platform: 'react'
      };

      const result = validator.validateComponent(context);
      
      expect(result.errors.some(e => e.id === 'norwegian-theme-disabled')).toBe(true);
    });

    test('should allow removing validation rules', () => {
      const rules = validator.getRules();
      const initialCount = rules.length;
      
      // Remove a rule
      const removed = validator.removeRule('typescript-strict-props');
      expect(removed).toBe(true);
      
      const updatedRules = validator.getRules();
      expect(updatedRules.length).toBe(initialCount - 1);
    });
  });
});
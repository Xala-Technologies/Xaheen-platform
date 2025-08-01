import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { logger } from '../utils/logger.js';
import { 
  BaseValidator, 
  ValidationRule, 
  ValidationIssue, 
  ValidationSeverity,
  createValidationRule 
} from './base-validator.js';

// WCAG conformance levels
export type WCAGLevel = 'A' | 'AA' | 'AAA';

// Accessibility validation configuration
export interface AccessibilityConfig {
  wcagLevel: WCAGLevel;
  enforceSemanticHTML: boolean;
  enforceAriaLabels: boolean;
  enforceKeyboardNavigation: boolean;
  enforceColorContrast: boolean;
  enforceFocusManagement: boolean;
  enforceScreenReaderSupport: boolean;
  enforceNorwegianCompliance: boolean;
  checkImageAltText: boolean;
  checkFormLabels: boolean;
  checkHeadingStructure: boolean;
  checkLinkText: boolean;
  checkTableHeaders: boolean;
  checkRoleUsage: boolean;
  minColorContrastRatio: number;
}

// Color analysis for contrast checking
export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  luminance: number;
}

// Accessibility violation types
export type A11yViolationType = 
  | 'missing-alt-text'
  | 'missing-aria-label'
  | 'missing-form-label'
  | 'invalid-heading-structure'
  | 'low-color-contrast'
  | 'missing-keyboard-support'
  | 'invalid-role'
  | 'missing-focus-indicator'
  | 'inadequate-link-text'
  | 'missing-table-headers'
  | 'semantic-html-violation'
  | 'screen-reader-incompatible';

// Accessibility validator implementation
export class AccessibilityValidator extends BaseValidator {
  private config: AccessibilityConfig;
  private semanticElements = new Set([
    'main', 'nav', 'header', 'footer', 'aside', 'section', 'article',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'input', 'select', 'textarea', 'label',
    'form', 'fieldset', 'legend',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'figure', 'figcaption', 'details', 'summary'
  ]);
  
  private interactiveElements = new Set([
    'button', 'input', 'select', 'textarea', 'a', 'details',
    'dialog', 'menu', 'menuitem'
  ]);
  
  private ariaAttributes = new Set([
    'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
    'aria-expanded', 'aria-controls', 'aria-owns', 'aria-activedescendant',
    'aria-atomic', 'aria-busy', 'aria-checked', 'aria-disabled',
    'aria-dropeffect', 'aria-grabbed', 'aria-haspopup', 'aria-invalid',
    'aria-level', 'aria-live', 'aria-multiline', 'aria-multiselectable',
    'aria-orientation', 'aria-pressed', 'aria-readonly', 'aria-relevant',
    'aria-required', 'aria-selected', 'aria-sort', 'aria-valuemax',
    'aria-valuemin', 'aria-valuenow', 'aria-valuetext'
  ]);
  
  constructor(config: Partial<AccessibilityConfig> = {}) {
    super({
      rules: [],
      severity: 'error',
      autofix: false,
      exclude: ['node_modules/**', 'dist/**', 'build/**'],
      include: ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js'],
      failFast: false,
      maxIssues: 1000,
    });
    
    this.config = {
      wcagLevel: 'AAA',
      enforceSemanticHTML: true,
      enforceAriaLabels: true,
      enforceKeyboardNavigation: true,
      enforceColorContrast: true,
      enforceFocusManagement: true,
      enforceScreenReaderSupport: true,
      enforceNorwegianCompliance: true,
      checkImageAltText: true,
      checkFormLabels: true,
      checkHeadingStructure: true,
      checkLinkText: true,
      checkTableHeaders: true,
      checkRoleUsage: true,
      minColorContrastRatio: 7.0, // AAA level
      ...config,
    };
    
    // Adjust contrast ratio based on WCAG level
    if (this.config.wcagLevel === 'AA') {
      this.config.minColorContrastRatio = 4.5;
    } else if (this.config.wcagLevel === 'A') {
      this.config.minColorContrastRatio = 3.0;
    }
  }
  
  initializeRules(): void {
    const rules: ValidationRule[] = [
      // Image accessibility
      createValidationRule(
        'a11y.alt-text',
        'Image Alt Text',
        'Images must have descriptive alt text',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.decorative-images',
        'Decorative Images',
        'Decorative images should have empty alt attributes',
        'accessibility',
        'warning',
        true
      ),
      
      // Form accessibility
      createValidationRule(
        'a11y.form-labels',
        'Form Labels',
        'Form inputs must have associated labels',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.form-validation',
        'Form Validation',
        'Form validation errors must be accessible',
        'accessibility',
        'error',
        true
      ),
      
      // ARIA accessibility
      createValidationRule(
        'a11y.aria-labels',
        'ARIA Labels',
        'Interactive elements must have accessible names',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.aria-roles',
        'ARIA Roles',
        'ARIA roles must be valid and used correctly',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.aria-properties',
        'ARIA Properties',
        'ARIA properties must be valid and have appropriate values',
        'accessibility',
        'error',
        true
      ),
      
      // Keyboard navigation
      createValidationRule(
        'a11y.keyboard-navigation',
        'Keyboard Navigation',
        'Interactive elements must be keyboard accessible',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.focus-management',
        'Focus Management',
        'Focus must be properly managed in dynamic content',
        'accessibility',
        'error',
        true
      ),
      createValidationRule(
        'a11y.focus-indicators',
        'Focus Indicators',
        'Focusable elements must have visible focus indicators',
        'accessibility',
        'warning',
        true
      ),
      
      // Semantic HTML
      createValidationRule(
        'a11y.semantic-html',
        'Semantic HTML',
        'Use semantic HTML elements instead of generic divs/spans',
        'accessibility',
        'warning',
        true
      ),
      createValidationRule(
        'a11y.heading-structure',
        'Heading Structure',
        'Headings must follow proper hierarchical structure',
        'accessibility',
        'error',
        true
      ),
      
      // Content accessibility
      createValidationRule(
        'a11y.link-text',
        'Link Text',
        'Links must have descriptive text',
        'accessibility',
        'warning',
        true
      ),
      createValidationRule(
        'a11y.color-contrast',
        'Color Contrast',
        `Color contrast must meet WCAG ${this.config.wcagLevel} standards`,
        'accessibility',
        'error',
        true
      ),
      
      // Table accessibility
      createValidationRule(
        'a11y.table-headers',
        'Table Headers',
        'Tables must have proper header associations',
        'accessibility',
        'error',
        true
      ),
      
      // Norwegian compliance
      createValidationRule(
        'a11y.norwegian-language',
        'Norwegian Language Support',
        'Content must support Norwegian language requirements',
        'accessibility',
        'info',
        true
      ),
      createValidationRule(
        'a11y.rtl-support',
        'RTL Support',
        'Interface must support right-to-left languages (Arabic)',
        'accessibility',
        'warning',
        true
      ),
    ];
    
    for (const rule of rules) {
      this.rules.set(rule.id, rule);
    }
  }
  
  getDefaultRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }
  
  async validateFile(file: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    try {
      // Skip non-JSX/TSX files
      if (!this.isReactFile(file)) {
        return issues;
      }
      
      // Parse AST
      const ast = this.parseReactCode(content, file);
      if (!ast) {
        return issues;
      }
      
      // Analyze JSX elements for accessibility
      issues.push(...this.validateJSXElements(file, ast));
      
      // Check CSS-in-JS and Tailwind classes for accessibility
      issues.push(...this.validateStyling(file, ast, content));
      
      // Validate component structure
      issues.push(...this.validateComponentStructure(file, ast));
      
      // Norwegian compliance checks
      if (this.config.enforceNorwegianCompliance) {
        issues.push(...this.validateNorwegianCompliance(file, ast, content));
      }
      
    } catch (error) {
      logger.error(`Accessibility validation failed for ${file}:`, error);
      issues.push({
        id: `a11y-validation-error-${file}`,
        severity: 'error',
        category: 'accessibility',
        message: 'Accessibility validation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        file,
        rule: 'a11y.validation-error',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private isReactFile(file: string): boolean {
    return /\.(jsx|tsx)$/.test(file);
  }
  
  private parseReactCode(content: string, file: string): t.File | null {
    try {
      const isTypeScript = file.endsWith('.tsx');
      
      return babel.parse(content, {
        sourceType: 'module',
        plugins: [
          ...(isTypeScript ? ['typescript'] : []),
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
        ],
      });
    } catch (error) {
      logger.debug(`Failed to parse React file ${file}:`, error);
      return null;
    }
  }
  
  private validateJSXElements(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    traverse(ast, {
      JSXElement: (path) => {
        const element = path.node;
        const elementName = this.getJSXElementName(element);
        
        if (!elementName) return;
        
        // Image accessibility
        if (elementName === 'img') {
          issues.push(...this.validateImage(file, element));
        }
        
        // Form accessibility
        if (this.isFormElement(elementName)) {
          issues.push(...this.validateFormElement(file, element, elementName));
        }
        
        // Interactive element accessibility
        if (this.isInteractiveElement(elementName)) {
          issues.push(...this.validateInteractiveElement(file, element, elementName));
        }
        
        // Table accessibility
        if (elementName === 'table') {
          issues.push(...this.validateTable(file, element));
        }
        
        // Heading structure
        if (this.isHeadingElement(elementName)) {
          issues.push(...this.validateHeading(file, element, elementName));
        }
        
        // Link accessibility
        if (elementName === 'a') {
          issues.push(...this.validateLink(file, element));
        }
        
        // Semantic HTML validation
        if (this.config.enforceSemanticHTML) {
          issues.push(...this.validateSemanticHTML(file, element, elementName));
        }
        
        // ARIA validation
        issues.push(...this.validateARIA(file, element, elementName));
      },
    });
    
    return issues;
  }
  
  private validateImage(file: string, element: t.JSXElement): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const attributes = this.getJSXAttributes(element);
    
    const alt = attributes.get('alt');
    const role = attributes.get('role');
    const ariaLabel = attributes.get('aria-label');
    
    // Check for alt text
    if (!alt && !ariaLabel && role !== 'presentation') {
      issues.push({
        id: `a11y-missing-alt-${file}-${element.loc?.start.line}`,
        severity: 'error',
        category: 'accessibility',
        message: 'Image missing alt text',
        description: 'Images must have descriptive alt text for screen readers',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.alt-text',
        fixable: true,
        autofix: {
          description: 'Add alt attribute',
          operation: 'insert',
          target: 'alt=""',
          replacement: 'alt="Describe this image"',
        },
      });
    }
    
    // Check for empty alt on decorative images
    if (alt === '' && !role) {
      issues.push({
        id: `a11y-decorative-image-${file}-${element.loc?.start.line}`,
        severity: 'info',
        category: 'accessibility',
        message: 'Consider adding role="presentation" for decorative images',
        description: 'Decorative images should be explicitly marked',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.decorative-images',
        fixable: true,
        autofix: {
          description: 'Add role="presentation"',
          operation: 'insert',
          target: 'alt=""',
          replacement: 'alt="" role="presentation"',
        },
      });
    }
    
    return issues;
  }
  
  private validateFormElement(file: string, element: t.JSXElement, elementName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const attributes = this.getJSXAttributes(element);
    
    const id = attributes.get('id');
    const ariaLabel = attributes.get('aria-label');
    const ariaLabelledby = attributes.get('aria-labelledby');
    
    // Check for accessible name
    if (!ariaLabel && !ariaLabelledby && elementName !== 'button') {
      if (!id) {
        issues.push({
          id: `a11y-form-no-label-${file}-${element.loc?.start.line}`,
          severity: 'error',
          category: 'accessibility',
          message: `Form ${elementName} missing accessible name`,
          description: 'Form elements must have labels or ARIA attributes',
          file,
          line: element.loc?.start.line,
          rule: 'a11y.form-labels',
          fixable: false,
        });
      }
    }
    
    // Check required field indication
    const required = attributes.get('required');
    const ariaRequired = attributes.get('aria-required');
    
    if (required === true && !ariaRequired) {
      issues.push({
        id: `a11y-required-indication-${file}-${element.loc?.start.line}`,
        severity: 'warning',
        category: 'accessibility',
        message: 'Required field should be indicated accessibly',
        description: 'Use aria-required="true" for required fields',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.form-validation',
        fixable: true,
        autofix: {
          description: 'Add aria-required="true"',
          operation: 'insert',
          target: 'required',
          replacement: 'required aria-required="true"',
        },
      });
    }
    
    return issues;
  }
  
  private validateInteractiveElement(file: string, element: t.JSXElement, elementName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const attributes = this.getJSXAttributes(element);
    
    // Check for accessible name
    const ariaLabel = attributes.get('aria-label');
    const ariaLabelledby = attributes.get('aria-labelledby');
    const title = attributes.get('title');
    
    // Get text content for buttons and links
    const textContent = this.getJSXTextContent(element);
    
    if (!ariaLabel && !ariaLabelledby && !textContent && !title) {
      issues.push({
        id: `a11y-interactive-no-name-${file}-${element.loc?.start.line}`,
        severity: 'error',
        category: 'accessibility',
        message: `Interactive ${elementName} missing accessible name`,
        description: 'Interactive elements must have accessible names',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.aria-labels',
        fixable: false,
      });
    }
    
    // Check for keyboard event handlers
    const onClick = attributes.get('onClick');
    const onKeyDown = attributes.get('onKeyDown');
    const onKeyPress = attributes.get('onKeyPress');
    
    if (onClick && !onKeyDown && !onKeyPress && elementName === 'div') {
      issues.push({
        id: `a11y-keyboard-handler-${file}-${element.loc?.start.line}`,
        severity: 'error',
        category: 'accessibility',
        message: 'Clickable div missing keyboard event handler',
        description: 'Add onKeyDown handler or use button element',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.keyboard-navigation',
        fixable: false,
      });
    }
    
    // Check tabIndex usage
    const tabIndex = attributes.get('tabIndex');
    if (tabIndex && typeof tabIndex === 'number' && tabIndex > 0) {
      issues.push({
        id: `a11y-positive-tabindex-${file}-${element.loc?.start.line}`,
        severity: 'warning',
        category: 'accessibility',
        message: 'Avoid positive tabIndex values',
        description: 'Positive tabIndex can disrupt natural tab order',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.keyboard-navigation',
        fixable: true,
        autofix: {
          description: 'Remove positive tabIndex',
          operation: 'delete',
          target: `tabIndex={${tabIndex}}`,
        },
      });
    }
    
    return issues;
  }
  
  private validateTable(file: string, element: t.JSXElement): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for table headers
    const hasHeaders = this.hasTableHeaders(element);
    if (!hasHeaders) {
      issues.push({
        id: `a11y-table-headers-${file}-${element.loc?.start.line}`,
        severity: 'error',
        category: 'accessibility',
        message: 'Table missing header elements',
        description: 'Tables must have th elements for headers',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.table-headers',
        fixable: false,
      });
    }
    
    // Check for caption
    const hasCaption = this.hasTableCaption(element);
    if (!hasCaption) {
      issues.push({
        id: `a11y-table-caption-${file}-${element.loc?.start.line}`,
        severity: 'warning',
        category: 'accessibility',
        message: 'Table missing caption',
        description: 'Tables should have captions for context',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.table-headers',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private validateHeading(file: string, element: t.JSXElement, elementName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Extract heading level
    const level = parseInt(elementName.charAt(1));
    
    // Check for empty headings
    const textContent = this.getJSXTextContent(element);
    if (!textContent?.trim()) {
      issues.push({
        id: `a11y-empty-heading-${file}-${element.loc?.start.line}`,
        severity: 'error',
        category: 'accessibility',
        message: 'Heading element is empty',
        description: 'Headings must have meaningful text content',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.heading-structure',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private validateLink(file: string, element: t.JSXElement): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const attributes = this.getJSXAttributes(element);
    
    const href = attributes.get('href');
    const textContent = this.getJSXTextContent(element);
    const ariaLabel = attributes.get('aria-label');
    
    // Check for meaningful link text
    if (!ariaLabel && textContent && this.isGenericLinkText(textContent)) {
      issues.push({
        id: `a11y-generic-link-text-${file}-${element.loc?.start.line}`,
        severity: 'warning',
        category: 'accessibility',
        message: 'Link has generic text',
        description: `Link text "${textContent}" is not descriptive`,
        file,
        line: element.loc?.start.line,
        rule: 'a11y.link-text',
        fixable: false,
      });
    }
    
    // Check for links without href
    if (!href) {
      issues.push({
        id: `a11y-link-no-href-${file}-${element.loc?.start.line}`,
        severity: 'warning',
        category: 'accessibility',
        message: 'Link element without href',
        description: 'Links should have href attribute or use button element',
        file,
        line: element.loc?.start.line,
        rule: 'a11y.semantic-html',
        fixable: false,
      });
    }
    
    return issues;
  }
  
  private validateSemanticHTML(file: string, element: t.JSXElement, elementName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for div/span overuse
    if (elementName === 'div' || elementName === 'span') {
      const attributes = this.getJSXAttributes(element);
      const onClick = attributes.get('onClick');
      const role = attributes.get('role');
      
      if (onClick && !role) {
        issues.push({
          id: `a11y-semantic-clickable-${file}-${element.loc?.start.line}`,
          severity: 'warning',
          category: 'accessibility',
          message: `Clickable ${elementName} should use button element`,
          description: 'Use semantic HTML elements for interactive content',
          file,
          line: element.loc?.start.line,
          rule: 'a11y.semantic-html',
          fixable: false,
        });
      }
    }
    
    return issues;
  }
  
  private validateARIA(file: string, element: t.JSXElement, elementName: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const attributes = this.getJSXAttributes(element);
    
    // Validate ARIA attributes
    for (const [attrName, attrValue] of attributes) {
      if (attrName.startsWith('aria-')) {
        if (!this.ariaAttributes.has(attrName)) {
          issues.push({
            id: `a11y-invalid-aria-${file}-${element.loc?.start.line}`,
            severity: 'error',
            category: 'accessibility',
            message: `Invalid ARIA attribute: ${attrName}`,
            description: 'ARIA attribute is not recognized',
            file,
            line: element.loc?.start.line,
            rule: 'a11y.aria-properties',
            fixable: false,
          });
        }
        
        // Validate specific ARIA attribute values
        if (attrName === 'aria-hidden' && attrValue !== 'true' && attrValue !== 'false') {
          issues.push({
            id: `a11y-invalid-aria-hidden-${file}-${element.loc?.start.line}`,
            severity: 'error',
            category: 'accessibility',
            message: 'aria-hidden must be "true" or "false"',
            file,
            line: element.loc?.start.line,
            rule: 'a11y.aria-properties',
            fixable: true,
            autofix: {
              description: 'Fix aria-hidden value',
              operation: 'replace',
              target: `aria-hidden="${attrValue}"`,
              replacement: 'aria-hidden="false"',
            },
          });
        }
      }
    }
    
    return issues;
  }
  
  private validateStyling(file: string, ast: t.File, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for hardcoded colors that might have contrast issues
    const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const colorMatches = line.match(colorRegex);
      if (colorMatches && this.config.enforceColorContrast) {
        colorMatches.forEach(color => {
          issues.push({
            id: `a11y-color-contrast-review-${file}-${index + 1}`,
            severity: 'info',
            category: 'accessibility',
            message: `Review color contrast for: ${color}`,
            description: `Ensure color meets WCAG ${this.config.wcagLevel} contrast requirements`,
            file,
            line: index + 1,
            rule: 'a11y.color-contrast',
            fixable: false,
          });
        });
      }
    });
    
    return issues;
  }
  
  private validateComponentStructure(file: string, ast: t.File): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for proper component structure
    traverse(ast, {
      VariableDeclarator(path) {
        if (this.isReactComponent(path) && this.config.enforceFocusManagement) {
          // Check if component manages focus properly
          // This is a simplified check - in practice, you'd need more sophisticated analysis
          const componentName = this.getComponentName(path);
          if (componentName && this.isModalOrDialogComponent(componentName)) {
            issues.push({
              id: `a11y-focus-management-${file}-${path.node.loc?.start.line}`,
              severity: 'info',
              category: 'accessibility',
              message: `Component ${componentName} should manage focus`,
              description: 'Modal/dialog components should trap and restore focus',
              file,
              line: path.node.loc?.start.line,
              rule: 'a11y.focus-management',
              fixable: false,
            });
          }
        }
      },
    });
    
    return issues;
  }
  
  private validateNorwegianCompliance(file: string, ast: t.File, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for Norwegian language support
    if (!content.includes('nb-NO') && !content.includes('lang=')) {
      issues.push({
        id: `a11y-norwegian-lang-${file}`,
        severity: 'info',
        category: 'accessibility',
        message: 'Consider adding Norwegian language support',
        description: 'Components should support Norwegian language attributes',
        file,
        rule: 'a11y.norwegian-language',
        fixable: false,
      });
    }
    
    // Check for RTL support indicators
    if (content.includes('arabic') || content.includes('ar-SA')) {
      if (!content.includes('dir=') && !content.includes('direction')) {
        issues.push({
          id: `a11y-rtl-support-${file}`,
          severity: 'warning',
          category: 'accessibility',
          message: 'Arabic content detected without RTL support',
          description: 'Ensure proper RTL (right-to-left) text direction support',
          file,
          rule: 'a11y.rtl-support',
          fixable: false,
        });
      }
    }
    
    return issues;
  }
  
  // Helper methods
  private getJSXElementName(element: t.JSXElement): string | null {
    if (t.isJSXIdentifier(element.openingElement.name)) {
      return element.openingElement.name.name;
    }
    return null;
  }
  
  private getJSXAttributes(element: t.JSXElement): Map<string, any> {
    const attributes = new Map();
    
    element.openingElement.attributes?.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const name = attr.name.name;
        let value: any = true; // Default for attributes without values
        
        if (attr.value) {
          if (t.isStringLiteral(attr.value)) {
            value = attr.value.value;
          } else if (t.isJSXExpressionContainer(attr.value)) {
            // Handle JSX expressions - this is simplified
            if (t.isBooleanLiteral(attr.value.expression)) {
              value = attr.value.expression.value;
            } else if (t.isNumericLiteral(attr.value.expression)) {
              value = attr.value.expression.value;
            }
          }
        }
        
        attributes.set(name, value);
      }
    });
    
    return attributes;
  }
  
  private getJSXTextContent(element: t.JSXElement): string | null {
    let textContent = '';
    
    element.children?.forEach(child => {
      if (t.isJSXText(child)) {
        textContent += child.value.trim();
      }
    });
    
    return textContent || null;
  }
  
  private isFormElement(elementName: string): boolean {
    return ['input', 'select', 'textarea', 'button'].includes(elementName);
  }
  
  private isInteractiveElement(elementName: string): boolean {
    return this.interactiveElements.has(elementName);
  }
  
  private isHeadingElement(elementName: string): boolean {
    return /^h[1-6]$/.test(elementName);
  }
  
  private isGenericLinkText(text: string): boolean {
    const genericTexts = [
      'click here', 'read more', 'more', 'link', 'here',
      'continue', 'next', 'previous', 'back'
    ];
    return genericTexts.includes(text.toLowerCase().trim());
  }
  
  private hasTableHeaders(element: t.JSXElement): boolean {
    // Simplified check - would need more sophisticated traversal
    return this.getJSXTextContent(element)?.includes('th') || false;
  }
  
  private hasTableCaption(element: t.JSXElement): boolean {
    // Simplified check - would need more sophisticated traversal
    return this.getJSXTextContent(element)?.includes('caption') || false;
  }
  
  private isReactComponent(path: any): boolean {
    // Check if this is a React component definition
    const node = path.node;
    
    if (t.isArrowFunctionExpression(node.init) || t.isFunctionExpression(node.init)) {
      // Check if function returns JSX
      let returnsJSX = false;
      
      path.get('init').traverse({
        ReturnStatement(returnPath: any) {
          if (t.isJSXElement(returnPath.node.argument) || 
              t.isJSXFragment(returnPath.node.argument)) {
            returnsJSX = true;
          }
        },
      });
      
      return returnsJSX;
    }
    
    return false;
  }
  
  private getComponentName(path: any): string | null {
    const node = path.node;
    
    if (t.isIdentifier(node.id)) {
      return node.id.name;
    }
    
    return null;
  }
  
  private isModalOrDialogComponent(componentName: string): boolean {
    const modalKeywords = ['modal', 'dialog', 'popup', 'overlay', 'drawer'];
    return modalKeywords.some(keyword => 
      componentName.toLowerCase().includes(keyword)
    );
  }
  
  // Color contrast calculation methods
  private parseColor(color: string): ColorInfo | null {
    // Simplified color parsing - would need more robust implementation
    const hexMatch = color.match(/#([0-9a-fA-F]{3,8})/);
    if (hexMatch) {
      const hex = hexMatch[1];
      const rgb = this.hexToRgb(hex);
      if (rgb) {
        return {
          hex: color,
          rgb,
          luminance: this.calculateLuminance(rgb),
        };
      }
    }
    
    return null;
  }
  
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
  
  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  private calculateContrastRatio(color1: ColorInfo, color2: ColorInfo): number {
    const l1 = Math.max(color1.luminance, color2.luminance);
    const l2 = Math.min(color1.luminance, color2.luminance);
    
    return (l1 + 0.05) / (l2 + 0.05);
  }
}

// Export utility functions
export function createAccessibilityValidator(
  config?: Partial<AccessibilityConfig>
): AccessibilityValidator {
  return new AccessibilityValidator(config);
}

export function getDefaultAccessibilityConfig(): AccessibilityConfig {
  return {
    wcagLevel: 'AAA',
    enforceSemanticHTML: true,
    enforceAriaLabels: true,
    enforceKeyboardNavigation: true,
    enforceColorContrast: true,
    enforceFocusManagement: true,
    enforceScreenReaderSupport: true,
    enforceNorwegianCompliance: true,
    checkImageAltText: true,
    checkFormLabels: true,
    checkHeadingStructure: true,
    checkLinkText: true,
    checkTableHeaders: true,
    checkRoleUsage: true,
    minColorContrastRatio: 7.0,
  };
}
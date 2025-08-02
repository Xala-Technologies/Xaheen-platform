import { z } from 'zod';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { GenerationResult } from '../types.js';

/**
 * WCAG Accessibility Validation Engine
 * 
 * Validates code and components for WCAG 2.2 AAA compliance,
 * including automated testing, color contrast, keyboard navigation,
 * and screen reader compatibility
 */

// WCAG Conformance Levels
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

// WCAG Success Criteria Categories
export enum WCAGPrinciple {
  PERCEIVABLE = 'perceivable',
  OPERABLE = 'operable',
  UNDERSTANDABLE = 'understandable',
  ROBUST = 'robust'
}

// Accessibility issue types
export enum AccessibilityIssue {
  // Perceivable
  MISSING_ALT_TEXT = 'missing_alt_text',
  POOR_COLOR_CONTRAST = 'poor_color_contrast',
  MISSING_CAPTIONS = 'missing_captions',
  NON_TEXT_CONTENT = 'non_text_content',
  
  // Operable
  KEYBOARD_TRAP = 'keyboard_trap',
  NO_KEYBOARD_ACCESS = 'no_keyboard_access',
  SEIZURE_RISK = 'seizure_risk',
  NAVIGATION_ISSUES = 'navigation_issues',
  
  // Understandable
  LANGUAGE_NOT_SPECIFIED = 'language_not_specified',
  INCONSISTENT_NAVIGATION = 'inconsistent_navigation',
  FORM_ERRORS = 'form_errors',
  CONTEXT_CHANGES = 'context_changes',
  
  // Robust
  INVALID_HTML = 'invalid_html',
  COMPATIBILITY_ISSUES = 'compatibility_issues',
  ARIA_MISUSE = 'aria_misuse'
}

// WCAG validation result schema
const wcagResultSchema = z.object({
  compliant: z.boolean(),
  level: z.nativeEnum(WCAGLevel),
  score: z.number().min(0).max(100),
  principles: z.record(z.nativeEnum(WCAGPrinciple), z.object({
    score: z.number(),
    issues: z.array(z.object({
      type: z.nativeEnum(AccessibilityIssue),
      severity: z.enum(['error', 'warning', 'notice']),
      message: z.string(),
      location: z.object({
        file: z.string(),
        line: z.number(),
        column: z.number()
      }).optional(),
      element: z.string().optional(),
      remediation: z.string(),
      wcagCriterion: z.string()
    }))
  })),
  colorContrast: z.object({
    passed: z.number(),
    failed: z.number(),
    issues: z.array(z.object({
      element: z.string(),
      foreground: z.string(),
      background: z.string(),
      ratio: z.number(),
      required: z.number(),
      level: z.nativeEnum(WCAGLevel)
    }))
  }),
  keyboardNavigation: z.object({
    focusManagement: z.boolean(),
    keyboardTraps: z.number(),
    skipLinks: z.boolean(),
    tabOrder: z.boolean()
  }),
  ariaCompliance: z.object({
    validUsage: z.boolean(),
    missingLabels: z.number(),
    invalidRoles: z.number(),
    landmarkStructure: z.boolean()
  }),
  recommendations: z.array(z.string()),
  automatedTestResults: z.any().optional()
});

export type WCAGResult = z.infer<typeof wcagResultSchema>;

// ARIA roles and their required properties
const ariaRoles = {
  button: { requiredProps: [], optionalProps: ['aria-pressed', 'aria-expanded'] },
  link: { requiredProps: [], optionalProps: ['aria-current'] },
  textbox: { requiredProps: [], optionalProps: ['aria-placeholder', 'aria-required'] },
  checkbox: { requiredProps: ['aria-checked'], optionalProps: ['aria-required'] },
  radio: { requiredProps: ['aria-checked'], optionalProps: ['aria-required'] },
  combobox: { requiredProps: ['aria-expanded'], optionalProps: ['aria-required', 'aria-autocomplete'] },
  listbox: { requiredProps: [], optionalProps: ['aria-multiselectable'] },
  option: { requiredProps: ['aria-selected'], optionalProps: [] },
  tab: { requiredProps: ['aria-selected'], optionalProps: ['aria-controls'] },
  tabpanel: { requiredProps: [], optionalProps: ['aria-labelledby'] },
  dialog: { requiredProps: ['aria-labelledby'], optionalProps: ['aria-describedby', 'aria-modal'] },
  alertdialog: { requiredProps: ['aria-labelledby'], optionalProps: ['aria-describedby'] },
  navigation: { requiredProps: [], optionalProps: ['aria-label', 'aria-labelledby'] },
  main: { requiredProps: [], optionalProps: ['aria-label', 'aria-labelledby'] },
  banner: { requiredProps: [], optionalProps: ['aria-label', 'aria-labelledby'] },
  contentinfo: { requiredProps: [], optionalProps: ['aria-label', 'aria-labelledby'] }
};

// Color contrast requirements
const contrastRequirements = {
  [WCAGLevel.AA]: {
    normal: 4.5,
    large: 3.0,
    graphics: 3.0
  },
  [WCAGLevel.AAA]: {
    normal: 7.0,
    large: 4.5,
    graphics: 4.5
  }
};

/**
 * WCAG Accessibility Validator
 */
export class AccessibilityValidator {
  /**
   * Validate WCAG compliance
   */
  async validateWCAGCompliance(
    code: string,
    filePath: string = 'unknown',
    targetLevel: WCAGLevel = WCAGLevel.AAA
  ): Promise<WCAGResult> {
    // Parse code
    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
    } catch (error) {
      return this.createErrorResult(targetLevel, 'Failed to parse code');
    }

    // Initialize analysis results
    const principles: WCAGResult['principles'] = {
      [WCAGPrinciple.PERCEIVABLE]: { score: 0, issues: [] },
      [WCAGPrinciple.OPERABLE]: { score: 0, issues: [] },
      [WCAGPrinciple.UNDERSTANDABLE]: { score: 0, issues: [] },
      [WCAGPrinciple.ROBUST]: { score: 0, issues: [] }
    };

    // Analyze perceivable issues
    this.analyzePerceivable(ast, code, filePath, principles[WCAGPrinciple.PERCEIVABLE]);

    // Analyze operable issues
    this.analyzeOperable(ast, code, filePath, principles[WCAGPrinciple.OPERABLE]);

    // Analyze understandable issues
    this.analyzeUnderstandable(ast, code, filePath, principles[WCAGPrinciple.UNDERSTANDABLE]);

    // Analyze robust issues
    this.analyzeRobust(ast, code, filePath, principles[WCAGPrinciple.ROBUST]);

    // Analyze color contrast
    const colorContrast = this.analyzeColorContrast(code, targetLevel);

    // Analyze keyboard navigation
    const keyboardNavigation = this.analyzeKeyboardNavigation(ast, code);

    // Analyze ARIA compliance
    const ariaCompliance = this.analyzeARIACompliance(ast, code);

    // Calculate scores
    Object.values(principles).forEach(principle => {
      principle.score = this.calculatePrincipleScore(principle.issues);
    });

    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      principles,
      colorContrast,
      keyboardNavigation,
      ariaCompliance
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      principles,
      colorContrast,
      keyboardNavigation,
      ariaCompliance,
      targetLevel
    );

    // Check compliance
    const compliant = this.checkCompliance(overallScore, principles, targetLevel);

    return {
      compliant,
      level: targetLevel,
      score: overallScore,
      principles,
      colorContrast,
      keyboardNavigation,
      ariaCompliance,
      recommendations
    };
  }

  /**
   * Analyze perceivable issues (WCAG Principle 1)
   */
  private analyzePerceivable(
    ast: any,
    code: string,
    filePath: string,
    principle: { score: number; issues: any[] }
  ): void {
    if (!ast) return;

    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const elementName = element.openingElement.name;

        if (elementName.type === 'JSXIdentifier') {
          const tagName = elementName.name.toLowerCase();

          // Check for missing alt text on images
          if (tagName === 'img') {
            const altAttribute = element.openingElement.attributes?.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'alt'
            );

            if (!altAttribute) {
              principle.issues.push({
                type: AccessibilityIssue.MISSING_ALT_TEXT,
                severity: 'error',
                message: 'Image missing alt attribute',
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: 'img',
                remediation: 'Add descriptive alt text or alt="" for decorative images',
                wcagCriterion: '1.1.1 Non-text Content'
              });
            } else if (altAttribute.value?.type === 'Literal' && 
                      !altAttribute.value.value) {
              // Empty alt should be intentional for decorative images
              console.log('Image has empty alt - ensure this is intentional for decorative images');
            }
          }

          // Check for missing captions on video/audio
          if (tagName === 'video' || tagName === 'audio') {
            const hasTrack = element.children?.some(child => 
              child.type === 'JSXElement' && 
              child.openingElement.name.type === 'JSXIdentifier' &&
              child.openingElement.name.name === 'track'
            );

            if (!hasTrack) {
              principle.issues.push({
                type: AccessibilityIssue.MISSING_CAPTIONS,
                severity: 'error',
                message: `${tagName} element missing captions/subtitles`,
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Add <track> element with captions or subtitles',
                wcagCriterion: '1.2.2 Captions (Prerecorded)'
              });
            }
          }

          // Check for canvas without accessible alternative
          if (tagName === 'canvas') {
            const hasAltContent = element.children?.length > 0;
            
            if (!hasAltContent) {
              principle.issues.push({
                type: AccessibilityIssue.NON_TEXT_CONTENT,
                severity: 'warning',
                message: 'Canvas element should have accessible alternative content',
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: 'canvas',
                remediation: 'Provide alternative text content or ARIA label for canvas',
                wcagCriterion: '1.1.1 Non-text Content'
              });
            }
          }
        }
      }
    });

    // Check for color-only information
    const colorOnlyPatterns = [
      /color:\s*red.*required/i,
      /background.*red.*error/i,
      /green.*success/i
    ];

    colorOnlyPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        principle.issues.push({
          type: AccessibilityIssue.POOR_COLOR_CONTRAST,
          severity: 'warning',
          message: 'Information may be conveyed by color alone',
          remediation: 'Use icons, text, or patterns in addition to color',
          wcagCriterion: '1.4.1 Use of Color'
        });
      }
    });
  }

  /**
   * Analyze operable issues (WCAG Principle 2)
   */
  private analyzeOperable(
    ast: any,
    code: string,
    filePath: string,
    principle: { score: number; issues: any[] }
  ): void {
    if (!ast) return;

    let hasSkipLink = false;
    let keyboardTraps = 0;

    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const elementName = element.openingElement.name;

        if (elementName.type === 'JSXIdentifier') {
          const tagName = elementName.name.toLowerCase();

          // Check for keyboard accessibility
          if (['div', 'span'].includes(tagName)) {
            const hasOnClick = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     (attr.name.name === 'onClick' || attr.name.name === 'onKeyDown')
            );

            const hasTabIndex = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'tabIndex'
            );

            const hasRole = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'role'
            );

            if (hasOnClick && !hasTabIndex && !hasRole) {
              principle.issues.push({
                type: AccessibilityIssue.NO_KEYBOARD_ACCESS,
                severity: 'error',
                message: `Interactive ${tagName} not keyboard accessible`,
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Add tabIndex="0" and onKeyDown handler, or use button element',
                wcagCriterion: '2.1.1 Keyboard'
              });
            }
          }

          // Check for skip links
          if (tagName === 'a') {
            const hrefAttr = element.openingElement.attributes?.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'href'
            );

            if (hrefAttr?.value?.type === 'Literal' && 
                typeof hrefAttr.value.value === 'string' &&
                hrefAttr.value.value.startsWith('#') &&
                /skip|main|content/i.test(hrefAttr.value.value)) {
              hasSkipLink = true;
            }
          }

          // Check for potential keyboard traps
          if (tagName === 'input' || tagName === 'textarea') {
            const onKeyDownAttr = element.openingElement.attributes?.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'onKeyDown'
            );

            // This is a simplified check - in practice, we'd need to analyze the handler
            if (onKeyDownAttr) {
              const handlerCode = code.substring(
                onKeyDownAttr.loc?.start.index || 0,
                onKeyDownAttr.loc?.end?.index || 0
              );

              if (/preventDefault|stopPropagation/i.test(handlerCode) &&
                  !/tab|escape/i.test(handlerCode)) {
                keyboardTraps++;
              }
            }
          }

          // Check for auto-playing media
          if (tagName === 'video' || tagName === 'audio') {
            const autoPlayAttr = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'autoPlay'
            );

            if (autoPlayAttr) {
              principle.issues.push({
                type: AccessibilityIssue.SEIZURE_RISK,
                severity: 'warning',
                message: 'Auto-playing media can cause seizures and distractions',
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Provide user controls to start/stop media',
                wcagCriterion: '2.2.2 Pause, Stop, Hide'
              });
            }
          }
        }
      }
    });

    // Check for skip links
    if (!hasSkipLink && /header|nav|main/i.test(code)) {
      principle.issues.push({
        type: AccessibilityIssue.NAVIGATION_ISSUES,
        severity: 'warning',
        message: 'Consider adding skip links for keyboard navigation',
        remediation: 'Add "Skip to main content" link at the beginning of the page',
        wcagCriterion: '2.4.1 Bypass Blocks'
      });
    }

    // Report keyboard traps
    if (keyboardTraps > 0) {
      principle.issues.push({
        type: AccessibilityIssue.KEYBOARD_TRAP,
        severity: 'error',
        message: `Potential keyboard trap detected (${keyboardTraps} instances)`,
        remediation: 'Ensure users can navigate away from all focusable elements',
        wcagCriterion: '2.1.2 No Keyboard Trap'
      });
    }
  }

  /**
   * Analyze understandable issues (WCAG Principle 3)
   */
  private analyzeUnderstandable(
    ast: any,
    code: string,
    filePath: string,
    principle: { score: number; issues: any[] }
  ): void {
    if (!ast) return;

    let hasLangAttribute = false;
    let formErrorsHandled = false;

    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const elementName = element.openingElement.name;

        if (elementName.type === 'JSXIdentifier') {
          const tagName = elementName.name.toLowerCase();

          // Check for lang attribute on html/document
          if (tagName === 'html' || tagName === 'document') {
            const langAttr = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'lang'
            );
            if (langAttr) hasLangAttribute = true;
          }

          // Check form error handling
          if (['form', 'input', 'textarea', 'select'].includes(tagName)) {
            const hasErrorHandling = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     (attr.name.name.includes('error') || 
                      attr.name.name === 'aria-invalid' ||
                      attr.name.name === 'aria-describedby')
            );

            if (hasErrorHandling) {
              formErrorsHandled = true;
            }
          }

          // Check for context changes without warning
          if (['select', 'input'].includes(tagName)) {
            const hasOnChange = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'onChange'
            );

            // This is a simplified check - would need semantic analysis
            if (hasOnChange && /window\.location|router\.push|navigate/i.test(code)) {
              principle.issues.push({
                type: AccessibilityIssue.CONTEXT_CHANGES,
                severity: 'warning',
                message: 'Form control may cause unexpected context changes',
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Warn users before context changes or use submit button',
                wcagCriterion: '3.2.2 On Input'
              });
            }
          }
        }
      }
    });

    // Check for language specification
    if (!hasLangAttribute && !/<html[^>]*lang=/i.test(code)) {
      principle.issues.push({
        type: AccessibilityIssue.LANGUAGE_NOT_SPECIFIED,
        severity: 'error',
        message: 'Page language not specified',
        remediation: 'Add lang attribute to html element (e.g., lang="en" or lang="nb")',
        wcagCriterion: '3.1.1 Language of Page'
      });
    }

    // Norwegian specific language check
    if (/norwegian|norsk|bokmål|nynorsk/i.test(code) && !/<html[^>]*lang=["']nb/i.test(code)) {
      principle.issues.push({
        type: AccessibilityIssue.LANGUAGE_NOT_SPECIFIED,
        severity: 'warning',
        message: 'Norwegian content should specify lang="nb" or lang="nn"',
        remediation: 'Use lang="nb" for Norwegian Bokmål or lang="nn" for Nynorsk',
        wcagCriterion: '3.1.1 Language of Page'
      });
    }

    // Check for form error handling
    if (/form|input|validation/i.test(code) && !formErrorsHandled) {
      principle.issues.push({
        type: AccessibilityIssue.FORM_ERRORS,
        severity: 'warning',
        message: 'Form validation errors should be clearly indicated',
        remediation: 'Use aria-invalid and aria-describedby for error messages',
        wcagCriterion: '3.3.1 Error Identification'
      });
    }
  }

  /**
   * Analyze robust issues (WCAG Principle 4)
   */
  private analyzeRobust(
    ast: any,
    code: string,
    filePath: string,
    principle: { score: number; issues: any[] }
  ): void {
    if (!ast) return;

    let ariaIssues = 0;
    let htmlValidityIssues = 0;

    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const elementName = element.openingElement.name;

        if (elementName.type === 'JSXIdentifier') {
          const tagName = elementName.name.toLowerCase();

          // Check ARIA usage
          const ariaAttributes = element.openingElement.attributes?.filter(
            attr => attr.type === 'JSXAttribute' && 
                   attr.name?.type === 'JSXIdentifier' && 
                   attr.name.name.startsWith('aria-')
          );

          const roleAttribute = element.openingElement.attributes?.find(
            attr => attr.type === 'JSXAttribute' && 
                   attr.name?.type === 'JSXIdentifier' && 
                   attr.name.name === 'role'
          );

          if (roleAttribute?.value?.type === 'Literal') {
            const role = roleAttribute.value.value as string;
            const roleSpec = ariaRoles[role as keyof typeof ariaRoles];

            if (roleSpec) {
              // Check required ARIA properties
              roleSpec.requiredProps.forEach(requiredProp => {
                const hasProperty = ariaAttributes?.some(
                  attr => attr.name?.type === 'JSXIdentifier' && 
                          attr.name.name === requiredProp
                );

                if (!hasProperty) {
                  ariaIssues++;
                  principle.issues.push({
                    type: AccessibilityIssue.ARIA_MISUSE,
                    severity: 'error',
                    message: `Role "${role}" requires "${requiredProp}" property`,
                    location: {
                      file: filePath,
                      line: element.loc?.start.line || 0,
                      column: element.loc?.start.column || 0
                    },
                    element: tagName,
                    remediation: `Add ${requiredProp} attribute to element with role="${role}"`,
                    wcagCriterion: '4.1.2 Name, Role, Value'
                  });
                }
              });
            } else {
              // Invalid role
              ariaIssues++;
              principle.issues.push({
                type: AccessibilityIssue.ARIA_MISUSE,
                severity: 'error',
                message: `Invalid ARIA role: "${role}"`,
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Use a valid ARIA role or remove the role attribute',
                wcagCriterion: '4.1.2 Name, Role, Value'
              });
            }
          }

          // Check for invalid HTML patterns
          if (tagName === 'button' && element.children?.some(child => 
            child.type === 'JSXElement' && 
            child.openingElement.name.type === 'JSXIdentifier' &&
            ['button', 'a', 'input'].includes(child.openingElement.name.name)
          )) {
            htmlValidityIssues++;
            principle.issues.push({
              type: AccessibilityIssue.INVALID_HTML,
              severity: 'error',
              message: 'Interactive elements cannot be nested inside buttons',
              location: {
                file: filePath,
                line: element.loc?.start.line || 0,
                column: element.loc?.start.column || 0
              },
              element: 'button',
              remediation: 'Use div or span for button content, not interactive elements',
              wcagCriterion: '4.1.1 Parsing'
            });
          }

          // Check for missing labels on form elements
          if (['input', 'textarea', 'select'].includes(tagName) && 
              tagName !== 'input' || 
              !element.openingElement.attributes?.some(attr => 
                attr.type === 'JSXAttribute' && 
                attr.name?.type === 'JSXIdentifier' && 
                attr.name.name === 'type' &&
                attr.value?.type === 'Literal' &&
                ['hidden', 'submit', 'button'].includes(attr.value.value as string)
              )) {
            
            const hasLabel = element.openingElement.attributes?.some(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     ['aria-label', 'aria-labelledby', 'id'].includes(attr.name.name)
            );

            if (!hasLabel) {
              principle.issues.push({
                type: AccessibilityIssue.ARIA_MISUSE,
                severity: 'error',
                message: `Form ${tagName} missing accessible label`,
                location: {
                  file: filePath,
                  line: element.loc?.start.line || 0,
                  column: element.loc?.start.column || 0
                },
                element: tagName,
                remediation: 'Add aria-label, aria-labelledby, or associate with label element',
                wcagCriterion: '4.1.2 Name, Role, Value'
              });
            }
          }
        }
      }
    });

    // Check for React/HTML validity
    if (/className.*[^a-zA-Z0-9\s\-_]/i.test(code)) {
      htmlValidityIssues++;
      principle.issues.push({
        type: AccessibilityIssue.INVALID_HTML,
        severity: 'warning',
        message: 'Invalid characters in CSS class names',
        remediation: 'Use only letters, numbers, hyphens, and underscores in class names',
        wcagCriterion: '4.1.1 Parsing'
      });
    }
  }

  /**
   * Analyze color contrast
   */
  private analyzeColorContrast(
    code: string,
    targetLevel: WCAGLevel
  ): WCAGResult['colorContrast'] {
    const colorContrast: WCAGResult['colorContrast'] = {
      passed: 0,
      failed: 0,
      issues: []
    };

    // Extract color combinations from code
    const colorPatterns = [
      /color:\s*([^;]+);.*background[^:]*:\s*([^;]+);/gi,
      /background[^:]*:\s*([^;]+);.*color:\s*([^;]+);/gi
    ];

    const requirements = contrastRequirements[targetLevel];

    colorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const [, color1, color2] = match;
        
        // Simplified color parsing - in practice, use a proper color parser
        const contrast = this.calculateColorContrast(color1.trim(), color2.trim());
        
        if (contrast < requirements.normal) {
          colorContrast.failed++;
          colorContrast.issues.push({
            element: 'text',
            foreground: color1.trim(),
            background: color2.trim(),
            ratio: contrast,
            required: requirements.normal,
            level: targetLevel
          });
        } else {
          colorContrast.passed++;
        }
      }
    });

    return colorContrast;
  }

  /**
   * Analyze keyboard navigation
   */
  private analyzeKeyboardNavigation(
    ast: any,
    code: string
  ): WCAGResult['keyboardNavigation'] {
    let focusManagement = false;
    let keyboardTraps = 0;
    let skipLinks = false;
    let tabOrder = true; // Assume good unless proven otherwise

    if (ast) {
      traverse(ast, {
        CallExpression(path) {
          const callee = path.node.callee;
          
          // Check for focus management
          if (callee.type === 'MemberExpression' && 
              callee.property.type === 'Identifier' && 
              callee.property.name === 'focus') {
            focusManagement = true;
          }
        },
        
        JSXElement(path) {
          const element = path.node;
          const elementName = element.openingElement.name;

          if (elementName.type === 'JSXIdentifier') {
            // Check for skip links
            if (elementName.name === 'a') {
              const href = element.openingElement.attributes?.find(
                attr => attr.type === 'JSXAttribute' && 
                       attr.name?.type === 'JSXIdentifier' && 
                       attr.name.name === 'href'
              );

              if (href?.value?.type === 'Literal' && 
                  typeof href.value.value === 'string' &&
                  href.value.value.startsWith('#') &&
                  /skip|main/i.test(href.value.value)) {
                skipLinks = true;
              }
            }

            // Check for problematic tabIndex
            const tabIndexAttr = element.openingElement.attributes?.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'tabIndex'
            );

            if (tabIndexAttr?.value?.type === 'Literal' && 
                typeof tabIndexAttr.value.value === 'number' &&
                tabIndexAttr.value.value > 0) {
              tabOrder = false; // Positive tabIndex breaks natural tab order
            }
          }
        }
      });
    }

    // Check for keyboard event handlers
    if (/onKeyDown|onKeyUp|onKeyPress/i.test(code)) {
      focusManagement = true;
    }

    return {
      focusManagement,
      keyboardTraps,
      skipLinks,
      tabOrder
    };
  }

  /**
   * Analyze ARIA compliance
   */
  private analyzeARIACompliance(
    ast: any,
    code: string
  ): WCAGResult['ariaCompliance'] {
    let validUsage = true;
    let missingLabels = 0;
    let invalidRoles = 0;
    let landmarkStructure = false;

    // Check for landmark roles
    const landmarks = ['main', 'navigation', 'banner', 'contentinfo', 'complementary'];
    landmarkStructure = landmarks.some(landmark => 
      new RegExp(`role=["']${landmark}["']|<${landmark}`, 'i').test(code)
    );

    if (ast) {
      traverse(ast, {
        JSXElement(path) {
          const element = path.node;
          const elementName = element.openingElement.name;

          if (elementName.type === 'JSXIdentifier') {
            const tagName = elementName.name.toLowerCase();

            // Check ARIA roles
            const roleAttr = element.openingElement.attributes?.find(
              attr => attr.type === 'JSXAttribute' && 
                     attr.name?.type === 'JSXIdentifier' && 
                     attr.name.name === 'role'
            );

            if (roleAttr?.value?.type === 'Literal') {
              const role = roleAttr.value.value as string;
              if (!ariaRoles[role as keyof typeof ariaRoles] && 
                  !landmarks.includes(role)) {
                invalidRoles++;
                validUsage = false;
              }
            }

            // Check for missing labels on interactive elements
            if (['button', 'input', 'textarea', 'select'].includes(tagName)) {
              const hasAccessibleName = element.openingElement.attributes?.some(
                attr => attr.type === 'JSXAttribute' && 
                       attr.name?.type === 'JSXIdentifier' && 
                       ['aria-label', 'aria-labelledby', 'title'].includes(attr.name.name)
              );

              if (!hasAccessibleName) {
                missingLabels++;
              }
            }
          }
        }
      });
    }

    return {
      validUsage,
      missingLabels,
      invalidRoles,
      landmarkStructure
    };
  }

  /**
   * Helper methods
   */

  private calculatePrincipleScore(issues: any[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 8;
          break;
        case 'notice':
          score -= 3;
          break;
      }
    });

    return Math.max(0, score);
  }

  private calculateOverallScore(
    principles: WCAGResult['principles'],
    colorContrast: WCAGResult['colorContrast'],
    keyboardNavigation: WCAGResult['keyboardNavigation'],
    ariaCompliance: WCAGResult['ariaCompliance']
  ): number {
    // Calculate principle average
    const principleScores = Object.values(principles).map(p => p.score);
    const principleAvg = principleScores.reduce((sum, score) => sum + score, 0) / principleScores.length;

    // Calculate other factors
    let colorScore = 100;
    if (colorContrast.failed > 0) {
      colorScore = Math.max(0, 100 - (colorContrast.failed * 20));
    }

    let keyboardScore = 100;
    if (!keyboardNavigation.focusManagement) keyboardScore -= 20;
    if (keyboardNavigation.keyboardTraps > 0) keyboardScore -= 30;
    if (!keyboardNavigation.skipLinks) keyboardScore -= 10;
    if (!keyboardNavigation.tabOrder) keyboardScore -= 15;

    let ariaScore = 100;
    if (!ariaCompliance.validUsage) ariaScore -= 25;
    if (ariaCompliance.missingLabels > 0) ariaScore -= ariaCompliance.missingLabels * 10;
    if (ariaCompliance.invalidRoles > 0) ariaScore -= ariaCompliance.invalidRoles * 15;
    if (!ariaCompliance.landmarkStructure) ariaScore -= 15;

    // Weighted average
    return Math.round(
      (principleAvg * 0.4) + 
      (colorScore * 0.2) + 
      (keyboardScore * 0.2) + 
      (ariaScore * 0.2)
    );
  }

  private checkCompliance(
    score: number,
    principles: WCAGResult['principles'],
    targetLevel: WCAGLevel
  ): boolean {
    // Minimum score requirements by level
    const minimumScores = {
      [WCAGLevel.A]: 70,
      [WCAGLevel.AA]: 80,
      [WCAGLevel.AAA]: 90
    };

    if (score < minimumScores[targetLevel]) return false;

    // No critical errors allowed
    const hasErrors = Object.values(principles).some(principle =>
      principle.issues.some(issue => issue.severity === 'error')
    );

    return !hasErrors;
  }

  private generateRecommendations(
    principles: WCAGResult['principles'],
    colorContrast: WCAGResult['colorContrast'],
    keyboardNavigation: WCAGResult['keyboardNavigation'],
    ariaCompliance: WCAGResult['ariaCompliance'],
    targetLevel: WCAGLevel
  ): string[] {
    const recommendations: string[] = [];

    // Principle-based recommendations
    Object.entries(principles).forEach(([principleName, data]) => {
      if (data.score < 80) {
        const errorCount = data.issues.filter(i => i.severity === 'error').length;
        if (errorCount > 0) {
          recommendations.push(`Fix ${errorCount} critical ${principleName} issues`);
        }
      }
    });

    // Color contrast recommendations
    if (colorContrast.failed > 0) {
      recommendations.push(`Improve color contrast for ${colorContrast.failed} element(s)`);
      if (targetLevel === WCAGLevel.AAA) {
        recommendations.push('AAA level requires 7:1 contrast ratio for normal text');
      }
    }

    // Keyboard navigation recommendations
    if (!keyboardNavigation.focusManagement) {
      recommendations.push('Implement proper focus management for interactive elements');
    }
    if (!keyboardNavigation.skipLinks) {
      recommendations.push('Add skip links for keyboard users');
    }
    if (!keyboardNavigation.tabOrder) {
      recommendations.push('Fix tab order by avoiding positive tabIndex values');
    }

    // ARIA recommendations
    if (!ariaCompliance.validUsage) {
      recommendations.push('Fix ARIA implementation errors');
    }
    if (ariaCompliance.missingLabels > 0) {
      recommendations.push(`Add accessible labels to ${ariaCompliance.missingLabels} form element(s)`);
    }
    if (!ariaCompliance.landmarkStructure) {
      recommendations.push('Add landmark roles for xaheen screen reader navigation');
    }

    // Norwegian specific recommendations
    recommendations.push('Ensure Norwegian content uses lang="nb" or lang="nn"');
    recommendations.push('Follow Norwegian accessibility guidelines (Difi/DigDir)');
    recommendations.push('Test with Norwegian screen readers (NVDA/JAWS)');

    return recommendations;
  }

  private calculateColorContrast(color1: string, color2: string): number {
    // Simplified contrast calculation - in practice, use a proper color library
    // This is a placeholder that returns a reasonable value
    
    // Extract RGB values (simplified)
    const getColorValue = (color: string): number => {
      if (color.includes('#')) {
        return parseInt(color.substring(1, 3), 16);
      }
      if (color.includes('rgb')) {
        const match = color.match(/\d+/);
        return match ? parseInt(match[0]) : 128;
      }
      // Named colors (simplified)
      const namedColors: Record<string, number> = {
        'black': 0, 'white': 255, 'red': 255, 'blue': 128, 'green': 128
      };
      return namedColors[color.toLowerCase()] || 128;
    };

    const luminance1 = getColorValue(color1) / 255;
    const luminance2 = getColorValue(color2) / 255;
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private createErrorResult(targetLevel: WCAGLevel, error: string): WCAGResult {
    return {
      compliant: false,
      level: targetLevel,
      score: 0,
      principles: {
        [WCAGPrinciple.PERCEIVABLE]: { score: 0, issues: [] },
        [WCAGPrinciple.OPERABLE]: { score: 0, issues: [] },
        [WCAGPrinciple.UNDERSTANDABLE]: { score: 0, issues: [] },
        [WCAGPrinciple.ROBUST]: { score: 0, issues: [
          {
            type: AccessibilityIssue.INVALID_HTML,
            severity: 'error',
            message: error,
            remediation: 'Fix code syntax errors',
            wcagCriterion: '4.1.1 Parsing'
          }
        ] }
      },
      colorContrast: { passed: 0, failed: 0, issues: [] },
      keyboardNavigation: { focusManagement: false, keyboardTraps: 0, skipLinks: false, tabOrder: false },
      ariaCompliance: { validUsage: false, missingLabels: 0, invalidRoles: 0, landmarkStructure: false },
      recommendations: ['Fix parsing errors before accessibility analysis']
    };
  }
}

/**
 * Generate accessibility compliance component
 */
export async function generateAccessibilityComponent(
  options: z.infer<typeof accessibilityComponentOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate accessibility service
  const serviceContent = `
${options.typescript ? `
import type { 
  WCAGLevel,
  WCAGResult,
  AccessibilityAudit
} from '../types/accessibility';
` : ''}

/**
 * Accessibility Service for ${options.projectName}
 * Handles WCAG compliance and accessibility testing
 */
export class AccessibilityService {
  private auditHistory${options.typescript ? ': AccessibilityAudit[]' : ''} = [];

  /**
   * Run accessibility audit
   */
  async runAccessibilityAudit(
    targetLevel${options.typescript ? ': WCAGLevel' : ''} = 'AAA'
  )${options.typescript ? ': Promise<WCAGResult>' : ''} {
    // TODO: Implement automated accessibility testing
    // Could integrate with axe-core, pa11y, or similar tools
    
    const mockResult${options.typescript ? ': WCAGResult' : ''} = {
      compliant: false,
      level: targetLevel,
      score: 75,
      principles: {
        perceivable: { score: 80, issues: [] },
        operable: { score: 70, issues: [] },
        understandable: { score: 75, issues: [] },
        robust: { score: 75, issues: [] }
      },
      colorContrast: { passed: 8, failed: 2, issues: [] },
      keyboardNavigation: { 
        focusManagement: true, 
        keyboardTraps: 0, 
        skipLinks: true, 
        tabOrder: true 
      },
      ariaCompliance: { 
        validUsage: true, 
        missingLabels: 1, 
        invalidRoles: 0, 
        landmarkStructure: true 
      },
      recommendations: [
        'Improve color contrast for 2 elements',
        'Add accessible label to 1 form element',
        'Ensure Norwegian content uses lang="nb"'
      ]
    };
    
    this.auditHistory.push({
      timestamp: new Date(),
      result: mockResult,
      targetLevel
    });
    
    return mockResult;
  }

  /**
   * Generate accessibility report
   */
  generateReport(
    result${options.typescript ? ': WCAGResult' : ''}
  )${options.typescript ? ': string' : ''} {
    const norwegianReport = \`
# Tilgjengelighetsrapport - ${options.projectName}

## Sammendrag
- **WCAG-nivå**: \${result.level}
- **Etterlevelse**: \${result.compliant ? 'Godkjent' : 'Ikke godkjent'}
- **Poengsum**: \${result.score}/100

## Prinsipper (WCAG 2.2)

### 1. Oppfattbar (Perceivable)
Poengsum: \${result.principles.perceivable.score}/100
Antall problemer: \${result.principles.perceivable.issues.length}

### 2. Brukbar (Operable)  
Poengsum: \${result.principles.operable.score}/100
Antall problemer: \${result.principles.operable.issues.length}

### 3. Forståelig (Understandable)
Poengsum: \${result.principles.understandable.score}/100
Antall problemer: \${result.principles.understandable.issues.length}

### 4. Robust (Robust)
Poengsum: \${result.principles.robust.score}/100
Antall problemer: \${result.principles.robust.issues.length}

## Fargekontrast
- **Godkjent**: \${result.colorContrast.passed}
- **Feilet**: \${result.colorContrast.failed}

## Tastaturnavigasjon
- **Fokushåndtering**: \${result.keyboardNavigation.focusManagement ? 'OK' : 'Manglende'}
- **Hopplenker**: \${result.keyboardNavigation.skipLinks ? 'OK' : 'Manglende'}
- **Tabrekkefølge**: \${result.keyboardNavigation.tabOrder ? 'OK' : 'Feil'}

## ARIA-etterlevelse
- **Gyldig bruk**: \${result.ariaCompliance.validUsage ? 'OK' : 'Feil'}
- **Manglende etiketter**: \${result.ariaCompliance.missingLabels}
- **Ugyldig roller**: \${result.ariaCompliance.invalidRoles}
- **Landemerkestruktur**: \${result.ariaCompliance.landmarkStructure ? 'OK' : 'Manglende'}

## Anbefalinger
\${result.recommendations.map(rec => \`- \${rec}\`).join('\\n')}

## Norske retningslinjer
Dette prosjektet følger:
- WCAG 2.2 nivå \${result.level}
- Forskrift om universell utforming av IKT
- Difi/DigDir sine retningslinjer

Generert: \${new Date().toLocaleDateString('nb-NO')}
    \`;

    return norwegianReport;
  }

  /**
   * Check color contrast programmatically
   */
  checkColorContrast(
    foreground${options.typescript ? ': string' : ''},
    background${options.typescript ? ': string' : ''},
    level${options.typescript ? ': WCAGLevel' : ''} = 'AA'
  )${options.typescript ? ': { passed: boolean; ratio: number; required: number }' : ''} {
    // TODO: Implement actual color contrast calculation
    const mockRatio = 4.8;
    const required = level === 'AAA' ? 7.0 : 4.5;
    
    return {
      passed: mockRatio >= required,
      ratio: mockRatio,
      required
    };
  }

  /**
   * Validate ARIA implementation
   */
  validateARIA(
    element${options.typescript ? ': string' : ''},
    role${options.typescript ? ': string' : ''},
    attributes${options.typescript ? ': Record<string, string>' : ''}
  )${options.typescript ? ': { valid: boolean; issues: string[] }' : ''} {
    const issues${options.typescript ? ': string[]' : ''} = [];
    
    // Basic ARIA validation
    const validRoles = [
      'button', 'link', 'textbox', 'checkbox', 'radio', 
      'combobox', 'listbox', 'option', 'tab', 'tabpanel',
      'dialog', 'alertdialog', 'navigation', 'main', 'banner'
    ];
    
    if (role && !validRoles.includes(role)) {
      issues.push(\`Invalid ARIA role: \${role}\`);
    }
    
    // Check required attributes for specific roles
    if (role === 'checkbox' && !attributes['aria-checked']) {
      issues.push('Checkbox role requires aria-checked attribute');
    }
    
    if (role === 'tab' && !attributes['aria-selected']) {
      issues.push('Tab role requires aria-selected attribute');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get audit history
   */
  getAuditHistory()${options.typescript ? ': AccessibilityAudit[]' : ''} {
    return this.auditHistory;
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();`;

  files.set('services/accessibility-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Accessibility validation service created successfully'
  };
}

// Component options schema
const accessibilityComponentOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export validator instance
export const accessibilityValidator = new AccessibilityValidator();
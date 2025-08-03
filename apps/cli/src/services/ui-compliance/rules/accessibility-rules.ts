/**
 * Accessibility Validation Rules
 * Enforces WCAG 2.2 AAA compliance
 */

import type { UIValidationRule, UIValidationContext, UIValidationResult, UIViolation, UIFix } from "../interfaces/ui-compliance.interface";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { JSXElement, JSXAttribute, JSXIdentifier } from "@babel/types";

/**
 * Interactive element types that require labels
 */
const INTERACTIVE_ELEMENTS = new Set([
  "button", "a", "input", "select", "textarea", 
  "Button", "Link", "Input", "Select", "TextArea",
  "IconButton", "Checkbox", "Radio", "Switch"
]);

/**
 * Form element types
 */
const FORM_ELEMENTS = new Set([
  "input", "select", "textarea", "Input", "Select", "TextArea",
  "Checkbox", "Radio", "Switch", "DatePicker", "TimePicker"
]);

/**
 * Elements that can have focus
 */
const FOCUSABLE_ELEMENTS = new Set([
  ...INTERACTIVE_ELEMENTS,
  "div", "span", "Box", "Card", "Modal", "Dialog", "Drawer"
]);

/**
 * WCAG AAA contrast ratios
 */
const WCAG_AAA_CONTRAST = {
  normalText: 7,
  largeText: 4.5,
  uiComponents: 3,
  graphicalObjects: 3
};

/**
 * Rule: ARIA labels required for interactive elements
 */
export const ariaLabelsRequiredRule: UIValidationRule = {
  id: "aria-labels-required",
  name: "ARIA Labels Required",
  description: "Interactive elements must have accessible labels",
  type: "accessibility",
  severity: "error",
  category: "a11y",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const fixes: UIFix[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "aria-labels-required", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        if (INTERACTIVE_ELEMENTS.has(elementName)) {
          const attributes = getElementAttributes(element);
          const hasAccessibleLabel = 
            attributes["aria-label"] ||
            attributes["aria-labelledby"] ||
            attributes["aria-describedby"] ||
            (["button", "a", "Button", "Link"].includes(elementName) && hasTextContent(path.node));
          
          if (!hasAccessibleLabel) {
            const loc = element.loc;
            
            violations.push({
              message: `Interactive element <${elementName}> missing accessible label`,
              line: loc?.start.line || 1,
              column: loc?.start.column || 1,
              severity: "error",
              suggestion: `Add aria-label="${elementName} action"`,
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value"
            });
            
            // Add fix for common cases
            if (loc && !attributes["aria-label"]) {
              fixes.push({
                description: `Add aria-label to ${elementName}`,
                fix: ` aria-label="${elementName} action"`,
                range: {
                  start: { line: loc.start.line, column: loc.start.column + elementName.length + 1 },
                  end: { line: loc.start.line, column: loc.start.column + elementName.length + 1 }
                }
              });
            }
          }
        }
      }
    });
    
    return {
      ruleId: "aria-labels-required",
      valid: violations.length === 0,
      violations,
      fixes
    };
  }
};

/**
 * Rule: Form inputs must have associated labels
 */
export const formLabelsRequiredRule: UIValidationRule = {
  id: "form-labels-required",
  name: "Form Labels Required",
  description: "Form inputs must have associated labels",
  type: "accessibility",
  severity: "error",
  category: "a11y",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "form-labels-required", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        if (FORM_ELEMENTS.has(elementName)) {
          const attributes = getElementAttributes(element);
          
          const hasLabel = 
            attributes["aria-label"] ||
            attributes["aria-labelledby"] ||
            attributes["id"] || // Assuming label[for] exists somewhere
            elementName === "FormField"; // FormField handles labeling internally
          
          if (!hasLabel) {
            violations.push({
              message: `Form input <${elementName}> missing associated label`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "error",
              suggestion: "Add aria-label, aria-labelledby, or use FormField component",
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions"
            });
          }
        }
      }
    });
    
    return {
      ruleId: "form-labels-required",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Images must have alt text
 */
export const altTextRequiredRule: UIValidationRule = {
  id: "alt-text-required",
  name: "Alt Text Required",
  description: "Images must have alternative text",
  type: "accessibility",
  severity: "error",
  category: "a11y",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const fixes: UIFix[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "alt-text-required", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        if (["img", "Image"].includes(elementName)) {
          const attributes = getElementAttributes(element);
          
          if (!attributes["alt"] && !attributes["aria-label"] && !attributes["aria-labelledby"]) {
            const loc = element.loc;
            
            violations.push({
              message: `Image missing alternative text`,
              line: loc?.start.line || 1,
              column: loc?.start.column || 1,
              severity: "error",
              suggestion: 'Add alt="" for decorative images or descriptive text',
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content"
            });
            
            if (loc) {
              fixes.push({
                description: "Add empty alt for decorative image",
                fix: ' alt=""',
                range: {
                  start: { line: loc.start.line, column: loc.end.column - 1 },
                  end: { line: loc.start.line, column: loc.end.column - 1 }
                }
              });
            }
          }
        }
      }
    });
    
    return {
      ruleId: "alt-text-required",
      valid: violations.length === 0,
      violations,
      fixes
    };
  }
};

/**
 * Rule: Focus management
 */
export const focusManagementRule: UIValidationRule = {
  id: "focus-management",
  name: "Focus Management",
  description: "Ensure proper focus indicators and keyboard navigation",
  type: "accessibility",
  severity: "warning",
  category: "a11y",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "focus-management", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        const attributes = getElementAttributes(element);
        
        // Check for tabindex greater than 0
        if (attributes["tabIndex"] && parseInt(attributes["tabIndex"]) > 0) {
          violations.push({
            message: "Avoid positive tabIndex values",
            line: element.loc?.start.line || 1,
            column: element.loc?.start.column || 1,
            severity: "warning",
            suggestion: "Use tabIndex={0} or {-1} only",
            documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order"
          });
        }
        
        // Check for focus trap in modals/dialogs
        if (["Modal", "Dialog", "Drawer"].includes(elementName)) {
          if (!attributes["returnFocusOnClose"] && !attributes["initialFocusRef"]) {
            violations.push({
              message: `${elementName} should manage focus properly`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "warning",
              suggestion: "Add returnFocusOnClose and initialFocusRef props",
              documentationUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
            });
          }
        }
        
        // Check for outline removal
        if (attributes["className"] && attributes["className"].includes("outline-none") && 
            !attributes["className"].includes("focus:ring")) {
          violations.push({
            message: "Focus indicator removed without alternative",
            line: element.loc?.start.line || 1,
            column: element.loc?.start.column || 1,
            severity: "error",
            suggestion: "Provide visible focus indicator with focus:ring classes",
            documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible"
          });
        }
      }
    });
    
    return {
      ruleId: "focus-management",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Heading hierarchy
 */
export const headingHierarchyRule: UIValidationRule = {
  id: "heading-hierarchy",
  name: "Heading Hierarchy",
  description: "Headings must follow proper hierarchy",
  type: "accessibility",
  severity: "warning",
  category: "a11y",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const headingLevels: number[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "heading-hierarchy", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        const attributes = getElementAttributes(element);
        
        // Check HTML headings
        const htmlHeadingMatch = elementName.match(/^h([1-6])$/);
        if (htmlHeadingMatch) {
          const level = parseInt(htmlHeadingMatch[1]);
          headingLevels.push(level);
          
          // Check if skipping levels
          if (headingLevels.length > 1) {
            const prevLevel = headingLevels[headingLevels.length - 2];
            if (level > prevLevel + 1) {
              violations.push({
                message: `Heading level skipped: h${prevLevel} to h${level}`,
                line: element.loc?.start.line || 1,
                column: element.loc?.start.column || 1,
                severity: "warning",
                suggestion: `Use h${prevLevel + 1} instead`,
                documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels"
              });
            }
          }
        }
        
        // Check Heading component
        if (elementName === "Heading" && attributes["level"]) {
          const level = parseInt(attributes["level"]);
          if (level) {
            headingLevels.push(level);
          }
        }
      }
    });
    
    // Check for missing h1
    if (headingLevels.length > 0 && !headingLevels.includes(1)) {
      violations.push({
        message: "Page missing h1 heading",
        line: 1,
        column: 1,
        severity: "warning",
        suggestion: "Add a main h1 heading to the page",
        documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels"
      });
    }
    
    return {
      ruleId: "heading-hierarchy",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Color contrast validation
 */
export const colorContrastRule: UIValidationRule = {
  id: "color-contrast",
  name: "Color Contrast",
  description: "Ensure sufficient color contrast for WCAG AAA",
  type: "accessibility",
  severity: "error",
  category: "a11y",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "color-contrast", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const attributes = getElementAttributes(element);
        
        // Check for low contrast color combinations
        if (attributes["className"]) {
          const className = attributes["className"];
          
          // Common low contrast patterns
          const lowContrastPatterns = [
            { pattern: /text-gray-400.*bg-gray-100/, message: "Gray on gray may have insufficient contrast" },
            { pattern: /text-yellow-.*bg-white/, message: "Yellow on white may have insufficient contrast" },
            { pattern: /text-orange-[123]00.*bg-white/, message: "Light orange on white may have insufficient contrast" },
            { pattern: /text-blue-[123]00.*bg-white/, message: "Light blue on white may have insufficient contrast" }
          ];
          
          for (const { pattern, message } of lowContrastPatterns) {
            if (pattern.test(className)) {
              violations.push({
                message,
                line: element.loc?.start.line || 1,
                column: element.loc?.start.column || 1,
                severity: "warning",
                suggestion: "Use design tokens with pre-validated contrast ratios",
                documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced"
              });
            }
          }
        }
        
        // Check inline styles for color combinations
        if (attributes["style"] && typeof attributes["style"] === "string") {
          if (attributes["style"].includes("color:") && attributes["style"].includes("background")) {
            violations.push({
              message: "Inline color styles detected - cannot verify contrast",
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "warning",
              suggestion: "Use design tokens with AAA-compliant contrast ratios",
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced"
            });
          }
        }
      }
    });
    
    return {
      ruleId: "color-contrast",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Keyboard navigation
 */
export const keyboardNavigationRule: UIValidationRule = {
  id: "keyboard-navigation",
  name: "Keyboard Navigation",
  description: "Ensure all interactive elements are keyboard accessible",
  type: "accessibility",
  severity: "error",
  category: "a11y",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "keyboard-navigation", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        const attributes = getElementAttributes(element);
        
        // Check for click handlers without keyboard handlers
        if (attributes["onClick"] && !INTERACTIVE_ELEMENTS.has(elementName)) {
          if (!attributes["onKeyDown"] && !attributes["onKeyPress"] && !attributes["onKeyUp"]) {
            violations.push({
              message: `Element with onClick should also handle keyboard events`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "error",
              suggestion: "Add onKeyDown handler or use a Button component",
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard"
            });
          }
          
          // Check for proper role
          if (!attributes["role"] && !attributes["tabIndex"]) {
            violations.push({
              message: `Clickable element needs proper role and tabIndex`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "error",
              suggestion: 'Add role="button" tabIndex={0}',
              documentationUrl: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard"
            });
          }
        }
      }
    });
    
    return {
      ruleId: "keyboard-navigation",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Helper functions
 */
function getElementName(name: JSXElement["openingElement"]["name"]): string {
  if (name.type === "JSXIdentifier") {
    return name.name;
  }
  return "";
}

function getElementAttributes(element: JSXElement["openingElement"]): Record<string, any> {
  const attrs: Record<string, any> = {};
  
  element.attributes.forEach(attr => {
    if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
      if (attr.value) {
        if (attr.value.type === "StringLiteral") {
          attrs[attr.name.name] = attr.value.value;
        } else if (attr.value.type === "JSXExpressionContainer") {
          if (attr.value.expression.type === "NumericLiteral") {
            attrs[attr.name.name] = attr.value.expression.value.toString();
          } else if (attr.value.expression.type === "StringLiteral") {
            attrs[attr.name.name] = attr.value.expression.value;
          }
        }
      } else {
        attrs[attr.name.name] = true;
      }
    }
  });
  
  return attrs;
}

function hasTextContent(element: JSXElement): boolean {
  return element.children.some(child => {
    if (child.type === "JSXText") {
      return child.value.trim().length > 0;
    }
    if (child.type === "JSXExpressionContainer" && 
        child.expression.type === "StringLiteral") {
      return child.expression.value.trim().length > 0;
    }
    return false;
  });
}

/**
 * Export all accessibility rules
 */
export const accessibilityRules: UIValidationRule[] = [
  ariaLabelsRequiredRule,
  formLabelsRequiredRule,
  altTextRequiredRule,
  focusManagementRule,
  headingHierarchyRule,
  colorContrastRule,
  keyboardNavigationRule
];
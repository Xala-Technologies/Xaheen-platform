/**
 * Localization Validation Rules
 * Enforces i18n and RTL support requirements
 */

import type { UIValidationRule, UIValidationContext, UIValidationResult, UIViolation, UIFix } from "../interfaces/ui-compliance.interface";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { JSXElement, JSXText, JSXAttribute, StringLiteral } from "@babel/types";

/**
 * Supported languages for Xaheen platform
 */
export const SUPPORTED_LANGUAGES = ["en", "nb", "fr", "ar"];

/**
 * RTL languages
 */
export const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

/**
 * Attributes that contain user-facing text
 */
const TEXT_ATTRIBUTES = [
  "placeholder", "title", "alt", "aria-label", "aria-placeholder",
  "aria-roledescription", "aria-valuetext", "label", "helperText",
  "errorMessage", "successMessage", "warningMessage"
];

/**
 * Translation function patterns
 */
const TRANSLATION_PATTERNS = [
  /^t\(/,                    // t('key')
  /^i18n\./,                 // i18n.t('key')
  /^translate\(/,            // translate('key')
  /^trans\(/,                // trans('key')
  /^formatMessage\(/,        // formatMessage({id: 'key'})
  /^\$t\(/,                  // $t('key') - Vue
  /^useTranslation\(/,       // useTranslation hook
  /^<Trans/,                 // <Trans> component
  /^<T>/                     // <T> component
];

/**
 * Directional CSS properties that need RTL consideration
 */
const DIRECTIONAL_PROPERTIES = [
  "left", "right", "margin-left", "margin-right", "padding-left", "padding-right",
  "border-left", "border-right", "text-align", "float", "clear",
  "marginLeft", "marginRight", "paddingLeft", "paddingRight",
  "borderLeft", "borderRight", "textAlign"
];

/**
 * Logical property mappings for RTL
 */
const LOGICAL_PROPERTY_MAP: Record<string, string> = {
  "left": "inset-inline-start",
  "right": "inset-inline-end",
  "margin-left": "margin-inline-start",
  "margin-right": "margin-inline-end",
  "padding-left": "padding-inline-start",
  "padding-right": "padding-inline-end",
  "border-left": "border-inline-start",
  "border-right": "border-inline-end",
  "marginLeft": "marginInlineStart",
  "marginRight": "marginInlineEnd",
  "paddingLeft": "paddingInlineStart",
  "paddingRight": "paddingInlineEnd",
  "borderLeft": "borderInlineStart",
  "borderRight": "borderInlineEnd",
  "text-align: left": "text-align: start",
  "text-align: right": "text-align: end",
  "float: left": "float: inline-start",
  "float: right": "float: inline-end"
};

/**
 * Rule: No hardcoded text
 */
export const noHardcodedTextRule: UIValidationRule = {
  id: "no-hardcoded-text",
  name: "No Hardcoded Text",
  description: "User-facing text must use localization functions",
  type: "localization",
  severity: "error",
  category: "i18n",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "no-hardcoded-text", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      // Check JSX text content
      JSXText(path) {
        const text = path.node.value.trim();
        
        if (text && !isAcceptableHardcodedText(text)) {
          violations.push({
            message: `Hardcoded text "${text}" should use translation`,
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: "error",
            suggestion: `Use t('translation.key') or <Trans>`,
            documentationUrl: "https://docs.xala.tech/localization"
          });
        }
      },
      
      // Check JSX attributes
      JSXAttribute(path) {
        const attrName = path.node.name.name as string;
        
        if (TEXT_ATTRIBUTES.includes(attrName) && path.node.value) {
          if (path.node.value.type === "StringLiteral") {
            const value = path.node.value.value;
            
            if (value && !isAcceptableHardcodedText(value)) {
              violations.push({
                message: `Hardcoded text in ${attrName}="${value}"`,
                line: path.node.loc?.start.line || 1,
                column: path.node.loc?.start.column || 1,
                severity: "error",
                suggestion: `Use ${attrName}={t('translation.key')}`,
                documentationUrl: "https://docs.xala.tech/localization"
              });
            }
          }
        }
      },
      
      // Check string literals in expressions
      StringLiteral(path) {
        const value = path.node.value;
        
        // Skip if it's already in a translation function
        const parent = path.parent;
        if (parent.type === "CallExpression") {
          const callee = parent.callee;
          if (callee.type === "Identifier" && isTranslationFunction(callee.name)) {
            return;
          }
        }
        
        // Check if it's user-facing text in a component prop
        if (parent.type === "JSXExpressionContainer" && 
            value && 
            !isAcceptableHardcodedText(value) &&
            containsWords(value)) {
          
          violations.push({
            message: `Hardcoded text "${value}" in expression`,
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: "warning",
            suggestion: "Consider using translation function",
            documentationUrl: "https://docs.xala.tech/localization"
          });
        }
      }
    });
    
    return {
      ruleId: "no-hardcoded-text",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: RTL support required
 */
export const rtlSupportRule: UIValidationRule = {
  id: "rtl-support",
  name: "RTL Support Required",
  description: "Components must support right-to-left languages",
  type: "localization",
  severity: "warning",
  category: "i18n",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const fixes: UIFix[] = [];
    
    if (!["tsx", "jsx", "css", "scss"].includes(context.fileType)) {
      return { ruleId: "rtl-support", valid: true, violations: [] };
    }
    
    // For CSS files
    if (["css", "scss"].includes(context.fileType)) {
      const lines = context.code.split('\n');
      lines.forEach((line, index) => {
        for (const prop of DIRECTIONAL_PROPERTIES) {
          if (line.includes(prop)) {
            const logical = LOGICAL_PROPERTY_MAP[prop];
            if (logical) {
              violations.push({
                message: `Directional property "${prop}" not RTL-safe`,
                line: index + 1,
                column: line.indexOf(prop) + 1,
                severity: "warning",
                suggestion: `Use logical property: ${logical}`,
                documentationUrl: "https://docs.xala.tech/rtl-support"
              });
            }
          }
        }
      });
      
      return {
        ruleId: "rtl-support",
        valid: violations.length === 0,
        violations
      };
    }
    
    // For JSX files
    if (context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          const attr = path.node;
          const attrName = attr.name.name as string;
          
          // Check className for directional classes
          if (attrName === "className" && attr.value?.type === "StringLiteral") {
            const className = attr.value.value;
            
            // Check for directional Tailwind classes
            const directionalClasses = [
              /\b(left|right)-\d+/,
              /\bm[lr]-\d+/,
              /\bp[lr]-\d+/,
              /\btext-(left|right)/,
              /\bfloat-(left|right)/,
              /\bborder-[lr]-/,
              /\brounded-[lr]-/
            ];
            
            for (const pattern of directionalClasses) {
              const match = className.match(pattern);
              if (match) {
                const loc = attr.loc;
                violations.push({
                  message: `Directional class "${match[0]}" not RTL-safe`,
                  line: loc?.start.line || 1,
                  column: loc?.start.column || 1,
                  severity: "warning",
                  suggestion: "Use start/end utilities or RTL-aware classes",
                  documentationUrl: "https://docs.xala.tech/rtl-support"
                });
                
                // Add fix for common cases
                if (loc) {
                  const rtlSafeClass = match[0]
                    .replace(/left/g, "start")
                    .replace(/right/g, "end")
                    .replace(/ml-/g, "ms-")
                    .replace(/mr-/g, "me-")
                    .replace(/pl-/g, "ps-")
                    .replace(/pr-/g, "pe-");
                  
                  fixes.push({
                    description: `Replace ${match[0]} with ${rtlSafeClass}`,
                    fix: className.replace(match[0], rtlSafeClass)
                  });
                }
              }
            }
          }
          
          // Check inline styles
          if (attrName === "style") {
            if (attr.value?.type === "StringLiteral") {
              const style = attr.value.value;
              
              for (const prop of DIRECTIONAL_PROPERTIES) {
                if (style.includes(prop)) {
                  violations.push({
                    message: `Inline style "${prop}" not RTL-safe`,
                    line: attr.loc?.start.line || 1,
                    column: attr.loc?.start.column || 1,
                    severity: "warning",
                    suggestion: `Use logical properties or sx prop with RTL support`,
                    documentationUrl: "https://docs.xala.tech/rtl-support"
                  });
                }
              }
            }
            
            if (attr.value?.type === "JSXExpressionContainer") {
              // Check object styles
              const code = context.code.slice(
                attr.value.loc?.start.index || 0,
                attr.value.loc?.end.index || 0
              );
              
              for (const prop of DIRECTIONAL_PROPERTIES) {
                if (code.includes(prop)) {
                  violations.push({
                    message: `Style property "${prop}" not RTL-safe`,
                    line: attr.loc?.start.line || 1,
                    column: attr.loc?.start.column || 1,
                    severity: "warning",
                    suggestion: "Use logical properties",
                    documentationUrl: "https://docs.xala.tech/rtl-support"
                  });
                }
              }
            }
          }
        }
      });
    }
    
    return {
      ruleId: "rtl-support",
      valid: violations.length === 0,
      violations,
      fixes
    };
  }
};

/**
 * Rule: Translation keys exist
 */
export const translationKeysExistRule: UIValidationRule = {
  id: "translation-keys-exist",
  name: "Translation Keys Exist",
  description: "Ensure translation keys are defined for all supported languages",
  type: "localization",
  severity: "warning",
  category: "i18n",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const translationKeys: Set<string> = new Set();
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "translation-keys-exist", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check for translation function calls
        if (callee.type === "Identifier" && isTranslationFunction(callee.name)) {
          const firstArg = path.node.arguments[0];
          if (firstArg?.type === "StringLiteral") {
            translationKeys.add(firstArg.value);
          }
        }
        
        // Check for t() or i18n.t() patterns
        if (callee.type === "MemberExpression" && 
            callee.property.type === "Identifier" &&
            callee.property.name === "t") {
          const firstArg = path.node.arguments[0];
          if (firstArg?.type === "StringLiteral") {
            translationKeys.add(firstArg.value);
          }
        }
      }
    });
    
    // Note: In a real implementation, we would check if these keys exist
    // in the translation files for each supported language
    translationKeys.forEach(key => {
      violations.push({
        message: `Verify translation key "${key}" exists for all languages`,
        line: 1,
        column: 1,
        severity: "info",
        suggestion: `Ensure key exists in: ${SUPPORTED_LANGUAGES.join(", ")}`,
        documentationUrl: "https://docs.xala.tech/localization#translation-files"
      });
    });
    
    return {
      ruleId: "translation-keys-exist",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Language-specific formatting
 */
export const languageFormattingRule: UIValidationRule = {
  id: "language-formatting",
  name: "Language-Specific Formatting",
  description: "Use locale-aware formatting for dates, numbers, and currency",
  type: "localization",
  severity: "warning",
  category: "i18n",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "language-formatting", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      // Check for date formatting
      NewExpression(path) {
        if (path.node.callee.type === "Identifier" && path.node.callee.name === "Date") {
          // Look for .toString(), .toDateString(), etc. in the parent
          const parent = path.parent;
          if (parent.type === "MemberExpression" && 
              parent.property.type === "Identifier" &&
              ["toString", "toDateString", "toTimeString"].includes(parent.property.name)) {
            violations.push({
              message: "Use locale-aware date formatting",
              line: path.node.loc?.start.line || 1,
              column: path.node.loc?.start.column || 1,
              severity: "warning",
              suggestion: "Use Intl.DateTimeFormat or date-fns with locale",
              documentationUrl: "https://docs.xala.tech/localization#date-formatting"
            });
          }
        }
      },
      
      // Check for number formatting
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check for .toFixed(), .toPrecision(), etc.
        if (callee.type === "MemberExpression" && 
            callee.property.type === "Identifier" &&
            ["toFixed", "toPrecision", "toExponential"].includes(callee.property.name)) {
          violations.push({
            message: "Use locale-aware number formatting",
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: "warning",
            suggestion: "Use Intl.NumberFormat for locale-specific formatting",
            documentationUrl: "https://docs.xala.tech/localization#number-formatting"
          });
        }
      },
      
      // Check for currency symbols
      StringLiteral(path) {
        const value = path.node.value;
        if (value.match(/[$€£¥₹₨]/)) {
          violations.push({
            message: `Hardcoded currency symbol "${value}" detected`,
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: "warning",
            suggestion: "Use Intl.NumberFormat with style: 'currency'",
            documentationUrl: "https://docs.xala.tech/localization#currency"
          });
        }
      }
    });
    
    return {
      ruleId: "language-formatting",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Plural support
 */
export const pluralSupportRule: UIValidationRule = {
  id: "plural-support",
  name: "Plural Support",
  description: "Use proper pluralization for different languages",
  type: "localization",
  severity: "info",
  category: "i18n",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "plural-support", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      // Look for conditional pluralization patterns
      ConditionalExpression(path) {
        const test = path.node.test;
        const consequent = path.node.consequent;
        const alternate = path.node.alternate;
        
        // Check for count === 1 ? "item" : "items" pattern
        if (test.type === "BinaryExpression" && 
            (test.operator === "===" || test.operator === "==") &&
            test.right.type === "NumericLiteral" && 
            test.right.value === 1 &&
            consequent.type === "StringLiteral" &&
            alternate.type === "StringLiteral") {
          
          const singular = consequent.value;
          const plural = alternate.value;
          
          if (singular && plural && containsWords(singular)) {
            violations.push({
              message: `Simple plural pattern "${singular}/${plural}" may not work for all languages`,
              line: path.node.loc?.start.line || 1,
              column: path.node.loc?.start.column || 1,
              severity: "info",
              suggestion: "Use i18n plural support with count parameter",
              documentationUrl: "https://docs.xala.tech/localization#pluralization"
            });
          }
        }
      },
      
      // Check template literals with count
      TemplateLiteral(path) {
        const quasis = path.node.quasis;
        const hasCount = quasis.some(q => q.value.raw.match(/\d+\s+\w+s?\b/));
        
        if (hasCount) {
          violations.push({
            message: "Template literal with count may need plural support",
            line: path.node.loc?.start.line || 1,
            column: path.node.loc?.start.column || 1,
            severity: "info",
            suggestion: "Use i18n plural functions for count-based text",
            documentationUrl: "https://docs.xala.tech/localization#pluralization"
          });
        }
      }
    });
    
    return {
      ruleId: "plural-support",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Helper functions
 */
function isAcceptableHardcodedText(text: string): boolean {
  // Allow:
  // - Numbers only
  // - Single characters
  // - Common symbols
  // - Whitespace only
  // - URLs
  // - Technical terms (could be extended)
  return /^[\d\s\-+*/%=<>.,;:!?@#$&()[\]{}|\\\/]+$/.test(text) ||
         text.length <= 1 ||
         text === "..." ||
         text === "—" ||
         text === "–" ||
         /^https?:\/\//.test(text) ||
         /^[A-Z][A-Z0-9_]*$/.test(text); // Constants like API_KEY
}

function isTranslationFunction(name: string): boolean {
  return TRANSLATION_PATTERNS.some(pattern => pattern.test(name));
}

function containsWords(text: string): boolean {
  // Check if text contains actual words (not just symbols/numbers)
  return /[a-zA-Z]{2,}/.test(text);
}

/**
 * Export all localization rules
 */
export const localizationRules: UIValidationRule[] = [
  noHardcodedTextRule,
  rtlSupportRule,
  translationKeysExistRule,
  languageFormattingRule,
  pluralSupportRule
];
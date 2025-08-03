/**
 * Design Token Validation Rules
 * Enforces Xala v5 design token usage
 */

import type { UIValidationRule, UIValidationContext, UIValidationResult, UIViolation } from "../interfaces/ui-compliance.interface";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { JSXAttribute, JSXIdentifier } from "@babel/types";

/**
 * Enhanced 8pt grid values in pixels
 */
export const ENHANCED_8PT_GRID = [
  0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96, 
  104, 112, 120, 128, 144, 160, 176, 192, 208, 224, 240, 256
];

/**
 * Valid spacing tokens for Xala v5
 */
export const VALID_SPACING_TOKENS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16", 
  "20", "24", "28", "32", "36", "40", "44", "48", "52", "56", "60", "64", "72", "80", "96"
];

/**
 * Design token patterns for validation
 */
export const DESIGN_TOKEN_PATTERNS = {
  spacing: /^spacing\[(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\]$/,
  colors: /^(colors|semantic)\.[a-zA-Z]+(\.[0-9]+)?$/,
  typography: /^typography\.(heading|body|caption|label)\.(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl)$/,
  borderRadius: /^borderRadius\.(none|sm|md|lg|xl|2xl|3xl|full)$/,
  shadows: /^shadows\.(none|sm|md|lg|xl|2xl|inner)$/,
  transitions: /^transitions\.(fast|normal|slow)$/,
  zIndex: /^zIndex\.(auto|0|10|20|30|40|50|60|70|80|90|100)$/
};

/**
 * Check for hardcoded color values
 */
export const noHardcodedColorsRule: UIValidationRule = {
  id: "no-hardcoded-colors",
  name: "No Hardcoded Colors",
  description: "All color values must use design tokens from the Xala v5 system",
  type: "design-token",
  severity: "error",
  category: "styling",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    // Regex patterns for color detection
    const colorPatterns = [
      /#[0-9a-fA-F]{3,8}/g, // Hex colors
      /rgb[a]?\s*\([^)]+\)/g, // RGB/RGBA
      /hsl[a]?\s*\([^)]+\)/g, // HSL/HSLA
      /(?:text|bg|border|fill|stroke)-(?!current|transparent|inherit|none)(\w+)-(\d+)/g // Tailwind colors
    ];
    
    // Check for colors in className attributes
    if (["tsx", "jsx"].includes(context.fileType) && context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          const attr = path.node;
          if (attr.name.name === "className" && attr.value?.type === "StringLiteral") {
            const className = attr.value.value;
            
            // Check for Tailwind color classes
            const tailwindColorMatch = className.match(/(?:text|bg|border|fill|stroke)-(?!current|transparent|inherit|none)(\w+)-(\d+)/g);
            if (tailwindColorMatch) {
              tailwindColorMatch.forEach(match => {
                violations.push({
                  message: `Hardcoded Tailwind color class "${match}" detected`,
                  line: attr.loc?.start.line || 1,
                  column: attr.loc?.start.column || 1,
                  severity: "error",
                  suggestion: `Use design token: colors.${match.split('-')[1]}.${match.split('-')[2]}`,
                  documentationUrl: "https://docs.xala.tech/design-tokens/colors"
                });
              });
            }
          }
          
          // Check style attribute for inline colors
          if (attr.name.name === "style" && attr.value?.type === "StringLiteral") {
            const style = attr.value.value;
            
            colorPatterns.forEach(pattern => {
              const matches = style.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  violations.push({
                    message: `Hardcoded color value "${match}" in inline style`,
                    line: attr.loc?.start.line || 1,
                    column: attr.loc?.start.column || 1,
                    severity: "error",
                    suggestion: "Use design tokens instead of inline styles",
                    documentationUrl: "https://docs.xala.tech/design-tokens/colors"
                  });
                });
              }
            });
          }
        }
      });
    }
    
    // Check for colors in CSS/SCSS files
    if (["css", "scss"].includes(context.fileType)) {
      const lines = context.code.split('\n');
      lines.forEach((line, index) => {
        colorPatterns.forEach(pattern => {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(match => {
              violations.push({
                message: `Hardcoded color value "${match}" detected`,
                line: index + 1,
                column: line.indexOf(match) + 1,
                severity: "error",
                suggestion: "Use CSS variables from design tokens: var(--color-primary-500)",
                documentationUrl: "https://docs.xala.tech/design-tokens/colors"
              });
            });
          }
        });
      });
    }
    
    return {
      ruleId: "no-hardcoded-colors",
      valid: violations.length === 0,
      violations,
      fixes: violations.map(v => ({
        description: `Replace hardcoded color with design token`,
        fix: v.suggestion || ""
      }))
    };
  }
};

/**
 * Check for hardcoded spacing values
 */
export const noHardcodedSpacingRule: UIValidationRule = {
  id: "no-hardcoded-spacing",
  name: "No Hardcoded Spacing",
  description: "All spacing must use the enhanced 8pt grid system tokens",
  type: "design-token",
  severity: "error",
  category: "styling",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    // Patterns for spacing detection
    const spacingPatterns = [
      /(?:padding|margin|gap|space|top|right|bottom|left|inset)[-:]?\s*(\d+(?:px|rem|em))/g,
      /(?:p|m|gap|space)-(\d+)/g, // Tailwind spacing
      /(?:pt|pr|pb|pl|px|py|mt|mr|mb|ml|mx|my)-(\d+)/g // Tailwind directional spacing
    ];
    
    if (["tsx", "jsx"].includes(context.fileType) && context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          const attr = path.node;
          
          if (attr.name.name === "className" && attr.value?.type === "StringLiteral") {
            const className = attr.value.value;
            
            // Check Tailwind spacing classes
            const spacingClasses = className.match(/(?:p|m|gap|space|pt|pr|pb|pl|px|py|mt|mr|mb|ml|mx|my)-(\d+)/g) || [];
            
            spacingClasses.forEach(spacingClass => {
              const value = spacingClass.match(/-(\d+)/)?.[1];
              if (value && !VALID_SPACING_TOKENS.includes(value)) {
                const pixelValue = parseInt(value) * 4; // Tailwind uses 0.25rem = 4px
                const nearestToken = findNearestSpacingToken(pixelValue);
                
                violations.push({
                  message: `Spacing class "${spacingClass}" not on 8pt grid`,
                  line: attr.loc?.start.line || 1,
                  column: attr.loc?.start.column || 1,
                  severity: "error",
                  suggestion: `Use spacing[${nearestToken}] (${ENHANCED_8PT_GRID[parseInt(nearestToken)]}px)`,
                  documentationUrl: "https://docs.xala.tech/design-tokens/spacing"
                });
              }
            });
          }
          
          // Check inline styles
          if (attr.name.name === "style" && attr.value?.type === "StringLiteral") {
            const style = attr.value.value;
            
            spacingPatterns[0].lastIndex = 0; // Reset regex
            let match;
            while ((match = spacingPatterns[0].exec(style)) !== null) {
              const value = match[1];
              const numericValue = parseFloat(value);
              const unit = value.match(/[a-z]+$/)?.[0] || 'px';
              
              let pixelValue = numericValue;
              if (unit === 'rem') pixelValue *= 16;
              if (unit === 'em') pixelValue *= 16; // Assuming 1em = 16px
              
              if (!ENHANCED_8PT_GRID.includes(pixelValue)) {
                const nearestToken = findNearestSpacingToken(pixelValue);
                
                violations.push({
                  message: `Spacing value "${value}" not on 8pt grid`,
                  line: attr.loc?.start.line || 1,
                  column: attr.loc?.start.column || 1,
                  severity: "error",
                  suggestion: `Use spacing[${nearestToken}] (${ENHANCED_8PT_GRID[parseInt(nearestToken)]}px)`,
                  documentationUrl: "https://docs.xala.tech/design-tokens/spacing"
                });
              }
            }
          }
        }
      });
    }
    
    return {
      ruleId: "no-hardcoded-spacing",
      valid: violations.length === 0,
      violations,
      fixes: violations.map(v => ({
        description: v.message,
        fix: v.suggestion || ""
      }))
    };
  }
};

/**
 * Check for arbitrary Tailwind values
 */
export const noArbitraryValuesRule: UIValidationRule = {
  id: "no-arbitrary-values",
  name: "No Arbitrary Values",
  description: "Tailwind arbitrary values like text-[18px] are not allowed",
  type: "styling",
  severity: "error",
  category: "styling",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    // Pattern for arbitrary values in square brackets
    const arbitraryPattern = /\[([\d.]+(?:px|rem|em|%|vh|vw)|#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[^[\]]+)\]/g;
    
    if (["tsx", "jsx"].includes(context.fileType) && context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          const attr = path.node;
          
          if (attr.name.name === "className" && attr.value?.type === "StringLiteral") {
            const className = attr.value.value;
            
            let match;
            arbitraryPattern.lastIndex = 0;
            while ((match = arbitraryPattern.exec(className)) !== null) {
              const arbitraryValue = match[1];
              
              violations.push({
                message: `Arbitrary value "[${arbitraryValue}]" not allowed`,
                line: attr.loc?.start.line || 1,
                column: attr.loc?.start.column || 1,
                severity: "error",
                suggestion: "Use design tokens instead of arbitrary values",
                documentationUrl: "https://docs.xala.tech/design-tokens"
              });
            }
          }
        }
      });
    }
    
    return {
      ruleId: "no-arbitrary-values",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Check for proper typography token usage
 */
export const useTypographyTokensRule: UIValidationRule = {
  id: "use-typography-tokens",
  name: "Use Typography Tokens",
  description: "Typography must use design system tokens",
  type: "design-token",
  severity: "warning",
  category: "styling",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    // Patterns for font-related properties
    const fontPatterns = [
      /font-size:\s*(\d+(?:px|rem|em))/g,
      /line-height:\s*(\d+(?:\.\d+)?)/g,
      /font-weight:\s*(\d+)/g,
      /text-(\d+xl|xs|sm|base|lg)/g // Tailwind text sizes
    ];
    
    if (["tsx", "jsx"].includes(context.fileType) && context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          const attr = path.node;
          
          if (attr.name.name === "className" && attr.value?.type === "StringLiteral") {
            const className = attr.value.value;
            
            // Check for non-token text sizes
            if (className.match(/text-\[([\d.]+(?:px|rem|em))\]/)) {
              violations.push({
                message: "Use typography tokens instead of arbitrary text sizes",
                line: attr.loc?.start.line || 1,
                column: attr.loc?.start.column || 1,
                severity: "warning",
                suggestion: "Use typography.body.md or similar token",
                documentationUrl: "https://docs.xala.tech/design-tokens/typography"
              });
            }
          }
          
          if (attr.name.name === "style" && attr.value?.type === "StringLiteral") {
            const style = attr.value.value;
            
            if (style.includes("font-size") || style.includes("line-height") || style.includes("font-weight")) {
              violations.push({
                message: "Typography properties should use design tokens",
                line: attr.loc?.start.line || 1,
                column: attr.loc?.start.column || 1,
                severity: "warning",
                suggestion: "Use Typography component with variant prop",
                documentationUrl: "https://docs.xala.tech/design-tokens/typography"
              });
            }
          }
        }
      });
    }
    
    return {
      ruleId: "use-typography-tokens",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Helper function to find nearest spacing token
 */
function findNearestSpacingToken(pixels: number): string {
  let nearestIndex = 0;
  let nearestDiff = Math.abs(ENHANCED_8PT_GRID[0] - pixels);
  
  for (let i = 1; i < ENHANCED_8PT_GRID.length; i++) {
    const diff = Math.abs(ENHANCED_8PT_GRID[i] - pixels);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = i;
    }
  }
  
  // Map grid index to valid token
  const tokenMap: Record<number, string> = {
    0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8",
    9: "9", 10: "10", 11: "11", 12: "12", 14: "14", 16: "16", 20: "20",
    24: "24", 28: "28", 32: "32", 36: "36", 40: "40", 44: "44", 48: "48",
    52: "52", 56: "56", 60: "60", 64: "64", 72: "72", 80: "80", 96: "96"
  };
  
  const pixelValue = ENHANCED_8PT_GRID[nearestIndex];
  return tokenMap[pixelValue / 4] || "8"; // Default to spacing[8] (32px)
}

/**
 * Export all design token rules
 */
export const designTokenRules: UIValidationRule[] = [
  noHardcodedColorsRule,
  noHardcodedSpacingRule,
  noArbitraryValuesRule,
  useTypographyTokensRule
];
/**
 * Component Validation Rules
 * Enforces Xala v5 semantic component usage
 */

import type { UIValidationRule, UIValidationContext, UIValidationResult, UIViolation, UIFix } from "../interfaces/ui-compliance.interface";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { JSXElement, JSXIdentifier, JSXMemberExpression } from "@babel/types";

/**
 * Xala UI System approved components
 */
export const XALA_COMPONENTS = new Set([
  // Layout Components
  "Box", "Stack", "Grid", "Container", "Section", "Flex", "Center",
  
  // Typography Components
  "Typography", "Text", "Heading", "Title", "Paragraph", "Caption", "Label",
  
  // Button Components
  "Button", "IconButton", "ButtonGroup", "FloatingActionButton",
  
  // Form Components
  "Input", "TextArea", "Select", "Checkbox", "Radio", "Switch", "Slider",
  "Form", "FormField", "FormLabel", "FormError", "FormHelperText",
  "DatePicker", "TimePicker", "DateTimePicker", "Calendar",
  
  // Data Display Components
  "Card", "List", "ListItem", "Table", "DataTable", "TreeView",
  "Timeline", "TimelineItem", "Stat", "StatGroup",
  
  // Feedback Components
  "Alert", "Toast", "Snackbar", "Progress", "Spinner", "Skeleton",
  "Badge", "Tag", "Chip", "Indicator",
  
  // Overlay Components
  "Modal", "Dialog", "Drawer", "Popover", "Tooltip", "ContextMenu",
  
  // Navigation Components
  "Navigation", "NavBar", "Sidebar", "Breadcrumb", "BreadcrumbItem",
  "Tabs", "Tab", "TabPanel", "Steps", "Step",
  
  // Media Components
  "Avatar", "AvatarGroup", "Image", "Icon", "Logo",
  
  // Layout Helpers
  "Divider", "Separator", "Spacer",
  
  // Utility Components
  "Portal", "Transition", "Collapse", "Fade", "Slide", "Zoom"
]);

/**
 * HTML to Xala component mapping
 */
export const HTML_TO_XALA_MAPPING: Record<string, string> = {
  // Layout
  "div": "Box",
  "span": "Text",
  "section": "Section",
  "article": "Card",
  "aside": "Box",
  "main": "Container",
  "header": "Box",
  "footer": "Box",
  "nav": "Navigation",
  
  // Typography
  "p": "Text",
  "h1": "Heading",
  "h2": "Heading",
  "h3": "Heading",
  "h4": "Heading",
  "h5": "Heading",
  "h6": "Heading",
  "label": "FormLabel",
  "caption": "Caption",
  
  // Form Elements
  "input": "Input",
  "textarea": "TextArea",
  "select": "Select",
  "button": "Button",
  "form": "Form",
  
  // Lists
  "ul": "List",
  "ol": "List",
  "li": "ListItem",
  
  // Tables
  "table": "Table",
  "thead": "Table.Header",
  "tbody": "Table.Body",
  "tr": "Table.Row",
  "th": "Table.HeaderCell",
  "td": "Table.Cell",
  
  // Media
  "img": "Image",
  "svg": "Icon",
  
  // Other
  "a": "Link",
  "hr": "Divider"
};

/**
 * Components that require specific props
 */
export const COMPONENT_PROP_REQUIREMENTS: Record<string, string[]> = {
  "Heading": ["level", "variant"],
  "Button": ["variant"],
  "Input": ["variant"],
  "Card": ["variant"],
  "Modal": ["isOpen", "onClose"],
  "Dialog": ["isOpen", "onClose"],
  "Drawer": ["isOpen", "onClose"],
  "Toast": ["variant"],
  "Alert": ["variant"],
  "Badge": ["variant"],
  "Avatar": ["size"],
  "Icon": ["name", "size"]
};

/**
 * Rule: No raw HTML elements
 */
export const noRawHTMLRule: UIValidationRule = {
  id: "no-raw-html",
  name: "No Raw HTML Elements",
  description: "Use semantic components from @xala-technologies/ui-system instead of raw HTML",
  type: "component-usage",
  severity: "error",
  category: "component",
  enabled: true,
  autoFixable: true,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    const fixes: UIFix[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "no-raw-html", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        if (isRawHTMLElement(elementName)) {
          const suggestion = HTML_TO_XALA_MAPPING[elementName] || "Box";
          const loc = element.loc;
          
          violations.push({
            message: `Raw HTML element <${elementName}> is not allowed`,
            line: loc?.start.line || 1,
            column: loc?.start.column || 1,
            endLine: loc?.end.line,
            endColumn: loc?.end.column,
            severity: "error",
            suggestion: `Use <${suggestion}> from @xala-technologies/ui-system`,
            documentationUrl: `https://docs.xala.tech/components/${suggestion.toLowerCase()}`
          });
          
          // Add fix
          if (loc) {
            fixes.push({
              description: `Replace <${elementName}> with <${suggestion}>`,
              fix: suggestion,
              range: {
                start: { line: loc.start.line, column: loc.start.column + 1 },
                end: { line: loc.start.line, column: loc.start.column + 1 + elementName.length }
              }
            });
          }
        }
      }
    });
    
    return {
      ruleId: "no-raw-html",
      valid: violations.length === 0,
      violations,
      fixes
    };
  }
};

/**
 * Rule: Use approved Xala components
 */
export const useXalaComponentsRule: UIValidationRule = {
  id: "use-xala-components",
  name: "Use Xala Components",
  description: "All components must be from @xala-technologies/ui-system",
  type: "component-usage",
  severity: "warning",
  category: "component",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "use-xala-components", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        // Check if it's a custom component (starts with uppercase)
        if (elementName[0] === elementName[0].toUpperCase() && 
            !XALA_COMPONENTS.has(elementName) &&
            !elementName.includes('.')) { // Allow compound components like Table.Row
          
          violations.push({
            message: `Component "${elementName}" is not from @xala-technologies/ui-system`,
            line: element.loc?.start.line || 1,
            column: element.loc?.start.column || 1,
            severity: "warning",
            suggestion: "Import from @xala-technologies/ui-system or use approved components",
            documentationUrl: "https://docs.xala.tech/components"
          });
        }
      }
    });
    
    return {
      ruleId: "use-xala-components",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: No inline styles
 */
export const noInlineStylesRule: UIValidationRule = {
  id: "no-inline-styles",
  name: "No Inline Styles",
  description: "Styles must use design tokens and className, not inline style attribute",
  type: "styling",
  severity: "error",
  category: "component",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "no-inline-styles", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXAttribute(path) {
        const attr = path.node;
        
        if (attr.name.name === "style") {
          violations.push({
            message: "Inline style attribute is not allowed",
            line: attr.loc?.start.line || 1,
            column: attr.loc?.start.column || 1,
            severity: "error",
            suggestion: "Use design token classes or sx prop with tokens",
            documentationUrl: "https://docs.xala.tech/styling"
          });
        }
      }
    });
    
    return {
      ruleId: "no-inline-styles",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Component prop validation
 */
export const componentPropsRule: UIValidationRule = {
  id: "component-props",
  name: "Component Props Validation",
  description: "Components must have required props",
  type: "component-usage",
  severity: "warning",
  category: "component",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "component-props", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node.openingElement;
        const elementName = getElementName(element.name);
        
        if (COMPONENT_PROP_REQUIREMENTS[elementName]) {
          const requiredProps = COMPONENT_PROP_REQUIREMENTS[elementName];
          const providedProps = element.attributes
            .filter(attr => attr.type === "JSXAttribute")
            .map(attr => (attr as any).name.name);
          
          const missingProps = requiredProps.filter(prop => !providedProps.includes(prop));
          
          if (missingProps.length > 0) {
            violations.push({
              message: `Component <${elementName}> missing required props: ${missingProps.join(", ")}`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "warning",
              suggestion: `Add missing props: ${missingProps.map(p => `${p}="..."`).join(" ")}`,
              documentationUrl: `https://docs.xala.tech/components/${elementName.toLowerCase()}`
            });
          }
        }
      }
    });
    
    return {
      ruleId: "component-props",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Rule: Semantic component usage
 */
export const semanticComponentUsageRule: UIValidationRule = {
  id: "semantic-component-usage",
  name: "Semantic Component Usage",
  description: "Use appropriate semantic components for content",
  type: "semantic",
  severity: "info",
  category: "component",
  enabled: true,
  autoFixable: false,
  validate: async (context: UIValidationContext): Promise<UIValidationResult> => {
    const violations: UIViolation[] = [];
    
    if (!["tsx", "jsx"].includes(context.fileType) || !context.ast) {
      return { ruleId: "semantic-component-usage", valid: true, violations: [] };
    }
    
    traverse(context.ast, {
      JSXElement(path) {
        const element = path.node;
        const elementName = getElementName(element.openingElement.name);
        
        // Check for Box/div used for text content
        if (elementName === "Box" || elementName === "div") {
          const hasOnlyTextChildren = element.children.every(child => 
            child.type === "JSXText" || 
            (child.type === "JSXExpressionContainer" && child.expression.type === "StringLiteral")
          );
          
          if (hasOnlyTextChildren && element.children.length > 0) {
            const textContent = element.children
              .filter(child => child.type === "JSXText")
              .map(child => (child as any).value.trim())
              .join("");
            
            if (textContent.length > 0) {
              violations.push({
                message: `Consider using <Text> instead of <${elementName}> for text content`,
                line: element.loc?.start.line || 1,
                column: element.loc?.start.column || 1,
                severity: "info",
                suggestion: "Use semantic Typography components for text",
                documentationUrl: "https://docs.xala.tech/components/typography"
              });
            }
          }
        }
        
        // Check for nested interactive elements
        if (["Button", "Link", "a", "button"].includes(elementName)) {
          traverse(path.node, {
            JSXElement(innerPath) {
              if (innerPath.node !== element) {
                const innerName = getElementName(innerPath.node.openingElement.name);
                if (["Button", "Link", "a", "button"].includes(innerName)) {
                  violations.push({
                    message: "Interactive elements should not be nested",
                    line: innerPath.node.loc?.start.line || 1,
                    column: innerPath.node.loc?.start.column || 1,
                    severity: "warning",
                    suggestion: "Restructure to avoid nested interactive elements",
                    documentationUrl: "https://docs.xala.tech/accessibility"
                  });
                }
              }
            }
          }, path.scope, path);
        }
      }
    });
    
    return {
      ruleId: "semantic-component-usage",
      valid: violations.length === 0,
      violations
    };
  }
};

/**
 * Helper function to get element name from JSX
 */
function getElementName(name: JSXElement["openingElement"]["name"]): string {
  if (name.type === "JSXIdentifier") {
    return name.name;
  }
  if (name.type === "JSXMemberExpression") {
    return `${getElementName(name.object)}.${name.property.name}`;
  }
  return "";
}

/**
 * Helper function to check if element is raw HTML
 */
function isRawHTMLElement(tagName: string): boolean {
  return tagName[0] === tagName[0].toLowerCase() && 
         !tagName.includes('-') && 
         !tagName.includes('.') &&
         Object.keys(HTML_TO_XALA_MAPPING).includes(tagName);
}

/**
 * Export all component rules
 */
export const componentRules: UIValidationRule[] = [
  noRawHTMLRule,
  useXalaComponentsRule,
  noInlineStylesRule,
  componentPropsRule,
  semanticComponentUsageRule
];
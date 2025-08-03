/**
 * Xala UI System v5 Validator
 * Enforces all Xala v5 design system rules and compliance requirements
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { Node, JSXElement, JSXAttribute, JSXIdentifier } from "@babel/types";
import type {
  XalaV5Validator,
  UIComplianceConfig,
  UIFileReport,
  UIComplianceReport,
  UIFix,
  UIValidationRule,
  XalaV5ValidationResult,
  DesignTokenViolation,
  ComponentViolation,
  AccessibilityViolation,
  LocalizationViolation,
  RTLViolation,
  CodeLocation,
  UIViolation,
  UIValidationContext,
  UIValidationResult,
  UIRuleSeverity
} from "./interfaces/ui-compliance.interface";

/**
 * Default Xala v5 configuration
 */
const DEFAULT_CONFIG: UIComplianceConfig = {
  enforceDesignTokens: true,
  enforceSemanticComponents: true,
  enforceEnhanced8ptGrid: true,
  enforceWCAGCompliance: true,
  wcagLevel: "AAA",
  enforceRTLSupport: true,
  enforceLocalization: true,
  supportedLanguages: ["en", "nb", "fr", "ar"],
  allowRawHTML: false,
  allowInlineStyles: false,
  allowArbitraryValues: false,
  allowHardcodedText: false,
  allowHardcodedColors: false,
  allowHardcodedSpacing: false,
  tokenPrefix: "token",
  enforceCodeSplitting: true,
  maxComponentSize: 200,
  reportingLevel: "standard",
  outputFormat: "json"
};

/**
 * Xala UI System component whitelist
 */
const XALA_COMPONENTS = new Set([
  "Box", "Stack", "Grid", "Container", "Section",
  "Typography", "Text", "Heading",
  "Button", "IconButton", "ButtonGroup",
  "Input", "TextArea", "Select", "Checkbox", "Radio", "Switch",
  "Card", "Modal", "Drawer", "Dialog", "Toast", "Alert",
  "Table", "DataTable", "List",
  "Navigation", "Sidebar", "Header", "Footer",
  "Avatar", "Badge", "Tag", "Chip",
  "Progress", "Spinner", "Skeleton",
  "Tabs", "Accordion", "Menu", "Dropdown",
  "Form", "FormField", "FormLabel", "FormError",
  "DatePicker", "TimePicker", "Calendar",
  "Tooltip", "Popover"
]);

/**
 * Design token patterns
 */
const DESIGN_TOKEN_PATTERNS = {
  spacing: /^spacing\[(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\]$/,
  colors: /^(colors|semantic)\.[a-zA-Z]+(\.[0-9]+)?$/,
  typography: /^typography\.(heading|body|caption|label)\.(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl)$/,
  borderRadius: /^borderRadius\.(none|sm|md|lg|xl|2xl|3xl|full)$/,
  shadows: /^shadows\.(none|sm|md|lg|xl|2xl|inner)$/,
  transitions: /^transitions\.(fast|normal|slow)$/,
  zIndex: /^zIndex\.(auto|0|10|20|30|40|50|60|70|80|90|100)$/
};

/**
 * Enhanced 8pt grid values (in pixels)
 */
const ENHANCED_8PT_GRID = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 176, 192, 208, 224, 240, 256];

/**
 * WCAG AAA color contrast requirements
 */
const WCAG_AAA_CONTRAST = {
  normalText: 7,
  largeText: 4.5,
  uiComponents: 3
};

export class XalaValidator implements XalaV5Validator {
  private rules: Map<string, UIValidationRule> = new Map();
  private config: UIComplianceConfig;

  constructor(config: Partial<UIComplianceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeRules();
  }

  /**
   * Initialize validation rules
   */
  private initializeRules(): void {
    // Design token rules
    this.addRule({
      id: "no-hardcoded-colors",
      name: "No Hardcoded Colors",
      description: "Colors must use design tokens, not hardcoded values",
      type: "design-token",
      severity: "error",
      category: "styling",
      enabled: this.config.enforceDesignTokens,
      autoFixable: true,
      validate: this.validateNoHardcodedColors.bind(this)
    });

    this.addRule({
      id: "no-hardcoded-spacing",
      name: "No Hardcoded Spacing",
      description: "Spacing must use enhanced 8pt grid tokens",
      type: "design-token",
      severity: "error",
      category: "styling",
      enabled: this.config.enforceEnhanced8ptGrid,
      autoFixable: true,
      validate: this.validateNoHardcodedSpacing.bind(this)
    });

    this.addRule({
      id: "no-arbitrary-values",
      name: "No Arbitrary Values",
      description: "No arbitrary Tailwind values like text-[18px]",
      type: "styling",
      severity: "error",
      category: "styling",
      enabled: this.config.enforceDesignTokens,
      autoFixable: false,
      validate: this.validateNoArbitraryValues.bind(this)
    });

    // Component rules
    this.addRule({
      id: "no-raw-html",
      name: "No Raw HTML Elements",
      description: "Use semantic components from @xala-technologies/ui-system",
      type: "component-usage",
      severity: "error",
      category: "component",
      enabled: this.config.enforceSemanticComponents,
      autoFixable: true,
      validate: this.validateNoRawHTML.bind(this)
    });

    this.addRule({
      id: "no-inline-styles",
      name: "No Inline Styles",
      description: "Styles must use design tokens, not inline style attribute",
      type: "styling",
      severity: "error",
      category: "styling",
      enabled: !this.config.allowInlineStyles,
      autoFixable: false,
      validate: this.validateNoInlineStyles.bind(this)
    });

    // Accessibility rules
    this.addRule({
      id: "wcag-aaa-compliance",
      name: "WCAG AAA Compliance",
      description: "Components must meet WCAG 2.2 AAA standards",
      type: "accessibility",
      severity: "error",
      category: "accessibility",
      enabled: this.config.enforceWCAGCompliance,
      autoFixable: false,
      validate: this.validateWCAGCompliance.bind(this)
    });

    this.addRule({
      id: "aria-labels-required",
      name: "ARIA Labels Required",
      description: "Interactive elements must have proper ARIA labels",
      type: "accessibility",
      severity: "error",
      category: "accessibility",
      enabled: this.config.enforceWCAGCompliance,
      autoFixable: true,
      validate: this.validateAriaLabels.bind(this)
    });

    // Localization rules
    this.addRule({
      id: "no-hardcoded-text",
      name: "No Hardcoded Text",
      description: "User-facing text must use localization",
      type: "localization",
      severity: "error",
      category: "i18n",
      enabled: this.config.enforceLocalization,
      autoFixable: false,
      validate: this.validateNoHardcodedText.bind(this)
    });

    this.addRule({
      id: "rtl-support-required",
      name: "RTL Support Required",
      description: "Components must support RTL languages",
      type: "localization",
      severity: "warning",
      category: "i18n",
      enabled: this.config.enforceRTLSupport,
      autoFixable: true,
      validate: this.validateRTLSupport.bind(this)
    });
  }

  /**
   * Add a validation rule
   */
  private addRule(rule: UIValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Validate a single file
   */
  async validateFile(
    filePath: string,
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<UIFileReport> {
    const violations: UIViolation[] = [];
    const fixes: UIFix[] = [];
    
    try {
      // Parse the file based on type
      const fileType = this.getFileType(filePath);
      const context: UIValidationContext = {
        code: content,
        filePath,
        fileType,
        config
      };

      // Only parse JS/TS files
      if (["tsx", "jsx", "ts", "js"].includes(fileType)) {
        const ast = parse(content, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
          sourceFilename: filePath
        });
        context.ast = ast;
      }

      // Run all enabled rules
      for (const rule of this.rules.values()) {
        if (rule.enabled) {
          const result = await rule.validate(context);
          if (!result.valid) {
            violations.push(...result.violations);
            if (result.fixes) {
              fixes.push(...result.fixes);
            }
          }
        }
      }
    } catch (error) {
      violations.push({
        message: `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`,
        severity: "error",
        line: 1,
        column: 1
      });
    }

    const score = this.calculateScore(violations);
    
    return {
      filePath,
      violations,
      fixes,
      score,
      compliant: violations.filter(v => v.severity === "error").length === 0
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(
    files: Array<{ path: string; content: string }>,
    config: UIComplianceConfig = this.config
  ): Promise<UIComplianceReport> {
    const fileReports: UIFileReport[] = [];
    const violationsByType: Record<string, number> = {};
    const violationsBySeverity: Record<UIRuleSeverity, number> = {
      error: 0,
      warning: 0,
      info: 0
    };

    for (const file of files) {
      const report = await this.validateFile(file.path, file.content, config);
      fileReports.push(report);

      // Count violations
      for (const violation of report.violations) {
        violationsBySeverity[violation.severity]++;
      }
    }

    const totalViolations = Object.values(violationsBySeverity).reduce((a, b) => a + b, 0);
    const averageScore = fileReports.reduce((sum, r) => sum + r.score, 0) / fileReports.length;

    return {
      summary: {
        totalFiles: files.length,
        filesScanned: files.length,
        totalViolations,
        violationsByType: violationsByType as any,
        violationsBySeverity,
        score: averageScore,
        compliant: violationsBySeverity.error === 0
      },
      files: fileReports,
      timestamp: new Date(),
      config
    };
  }

  /**
   * Apply fixes to a file
   */
  applyFixes(filePath: string, content: string, fixes: UIFix[]): string {
    // Sort fixes by position (reverse order to apply from end to start)
    const sortedFixes = [...fixes].sort((a, b) => {
      if (!a.range || !b.range) return 0;
      return b.range.start.line - a.range.start.line || 
             b.range.start.column - a.range.start.column;
    });

    let fixedContent = content;
    const lines = content.split('\n');

    for (const fix of sortedFixes) {
      if (fix.range) {
        // Apply range-based fix
        const startLine = fix.range.start.line - 1;
        const endLine = fix.range.end.line - 1;
        
        if (startLine === endLine) {
          // Single line fix
          const line = lines[startLine];
          lines[startLine] = 
            line.substring(0, fix.range.start.column) +
            fix.fix +
            line.substring(fix.range.end.column);
        } else {
          // Multi-line fix
          const startLineContent = lines[startLine].substring(0, fix.range.start.column);
          const endLineContent = lines[endLine].substring(fix.range.end.column);
          
          // Remove lines and insert fix
          lines.splice(startLine, endLine - startLine + 1, startLineContent + fix.fix + endLineContent);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Get all available rules
   */
  getRules(): UIValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): UIValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Validate against Xala v5 standards
   */
  async validateXalaV5Compliance(
    filePath: string,
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<XalaV5ValidationResult> {
    const [
      designTokenViolations,
      componentViolations,
      accessibilityViolations,
      localizationViolations,
      rtlViolations
    ] = await Promise.all([
      this.validateDesignTokens(content, config),
      this.validateComponents(content, config),
      this.validateAccessibility(content, config),
      this.validateLocalization(content, config),
      this.validateRTLSupport(content, config)
    ]);

    const calculateCoverage = (violations: any[], total: number): number => {
      if (total === 0) return 100;
      return Math.max(0, 100 - (violations.length / total * 100));
    };

    return {
      valid: designTokenViolations.length === 0 &&
             componentViolations.filter(v => v.severity === "error").length === 0 &&
             accessibilityViolations.filter(v => v.impact === "critical" || v.impact === "serious").length === 0,
      errors: [],
      warnings: [],
      designTokenCompliance: {
        valid: designTokenViolations.length === 0,
        violations: designTokenViolations,
        coverage: calculateCoverage(designTokenViolations, 100)
      },
      componentCompliance: {
        valid: componentViolations.filter(v => v.severity === "error").length === 0,
        violations: componentViolations,
        coverage: calculateCoverage(componentViolations.filter(v => v.severity === "error"), 100)
      },
      accessibilityCompliance: {
        valid: accessibilityViolations.filter(v => v.impact === "critical" || v.impact === "serious").length === 0,
        wcagLevel: config.wcagLevel,
        violations: accessibilityViolations,
        score: calculateCoverage(accessibilityViolations, 100)
      },
      localizationCompliance: {
        valid: localizationViolations.length === 0,
        violations: localizationViolations,
        coverage: config.supportedLanguages.reduce((acc, lang) => {
          acc[lang] = calculateCoverage(localizationViolations.filter(v => v.language === lang), 100);
          return acc;
        }, {} as Record<string, number>)
      },
      rtlCompliance: {
        valid: rtlViolations.length === 0,
        violations: rtlViolations,
        supported: config.enforceRTLSupport && rtlViolations.length === 0
      }
    };
  }

  /**
   * Check design token usage
   */
  async validateDesignTokens(
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<DesignTokenViolation[]> {
    const violations: DesignTokenViolation[] = [];
    
    if (!config.enforceDesignTokens) return violations;

    try {
      const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });

      traverse(ast, {
        JSXAttribute(path) {
          const node = path.node;
          const name = node.name.name as string;
          
          // Check className for hardcoded values
          if (name === "className" && node.value) {
            const value = this.getAttributeValue(node);
            if (value) {
              const hardcodedValues = this.detectHardcodedValues(value);
              for (const hardcoded of hardcodedValues) {
                violations.push({
                  token: hardcoded.type,
                  value: hardcoded.value,
                  expected: hardcoded.expected,
                  location: this.getNodeLocation(node, content),
                  fix: hardcoded.fix
                });
              }
            }
          }
        }
      });
    } catch (error) {
      // Skip if parse fails
    }

    return violations;
  }

  /**
   * Check component compliance
   */
  async validateComponents(
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<ComponentViolation[]> {
    const violations: ComponentViolation[] = [];
    
    if (!config.enforceSemanticComponents) return violations;

    try {
      const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });

      traverse(ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          const tagName = this.getElementName(element.name);
          
          // Check for raw HTML elements
          if (this.isRawHTMLElement(tagName) && !config.allowRawHTML) {
            violations.push({
              component: tagName,
              issue: `Raw HTML element <${tagName}> used. Use semantic component from @xala-technologies/ui-system`,
              severity: "error",
              location: this.getNodeLocation(element, content),
              suggestion: this.suggestSemanticComponent(tagName)
            });
          }
          
          // Check for non-Xala components
          if (tagName[0].toUpperCase() === tagName[0] && !XALA_COMPONENTS.has(tagName)) {
            violations.push({
              component: tagName,
              issue: `Component ${tagName} is not from @xala-technologies/ui-system`,
              severity: "warning",
              location: this.getNodeLocation(element, content),
              suggestion: "Import from @xala-technologies/ui-system or use approved components"
            });
          }
        }
      });
    } catch (error) {
      // Skip if parse fails
    }

    return violations;
  }

  /**
   * Check accessibility compliance
   */
  async validateAccessibility(
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];
    
    if (!config.enforceWCAGCompliance) return violations;

    try {
      const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });

      traverse(ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          const tagName = this.getElementName(element.name);
          const attributes = this.getElementAttributes(element);
          
          // Check interactive elements for ARIA labels
          if (this.isInteractiveElement(tagName, attributes)) {
            if (!this.hasAccessibleLabel(element)) {
              violations.push({
                rule: "aria-label-required",
                element: tagName,
                issue: "Interactive element missing accessible label",
                wcagCriteria: "4.1.2",
                impact: "serious",
                location: this.getNodeLocation(element, content),
                fix: `Add aria-label, aria-labelledby, or visible text content`
              });
            }
          }
          
          // Check images for alt text
          if (tagName === "img" || attributes.role === "img") {
            if (!attributes.alt && !attributes["aria-label"] && !attributes["aria-labelledby"]) {
              violations.push({
                rule: "alt-text-required",
                element: tagName,
                issue: "Image missing alternative text",
                wcagCriteria: "1.1.1",
                impact: "critical",
                location: this.getNodeLocation(element, content),
                fix: `Add alt attribute with descriptive text`
              });
            }
          }
          
          // Check color contrast (simplified check)
          if (attributes.style && typeof attributes.style === "string") {
            const colorMatch = attributes.style.match(/color:\s*([^;]+)/);
            const bgMatch = attributes.style.match(/background-color:\s*([^;]+)/);
            if (colorMatch && bgMatch) {
              // This would need a proper color contrast calculation
              // For now, just flag inline color styles
              violations.push({
                rule: "color-contrast",
                element: tagName,
                issue: "Inline color styles detected - cannot verify contrast ratio",
                wcagCriteria: "1.4.3",
                impact: "moderate",
                location: this.getNodeLocation(element, content),
                fix: "Use design tokens with pre-validated contrast ratios"
              });
            }
          }
        }
      });
    } catch (error) {
      // Skip if parse fails
    }

    return violations;
  }

  /**
   * Check localization compliance
   */
  async validateLocalization(
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<LocalizationViolation[]> {
    const violations: LocalizationViolation[] = [];
    
    if (!config.enforceLocalization || config.allowHardcodedText) return violations;

    try {
      const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });

      traverse(ast, {
        JSXText(path) {
          const text = path.node.value.trim();
          if (text && !this.isAcceptableHardcodedText(text)) {
            violations.push({
              text,
              language: "en", // Default, should be detected
              issue: "Hardcoded user-facing text detected",
              location: this.getNodeLocation(path.node, content),
              suggestion: "Use t() or i18n translation function"
            });
          }
        },
        JSXAttribute(path) {
          const name = path.node.name.name as string;
          const value = this.getAttributeValue(path.node);
          
          // Check common text attributes
          if (["placeholder", "title", "alt", "aria-label"].includes(name) && value) {
            if (!this.isTranslationFunction(value)) {
              violations.push({
                text: value,
                language: "en",
                issue: `Hardcoded text in ${name} attribute`,
                location: this.getNodeLocation(path.node, content),
                suggestion: `Use t('key') or i18n function for ${name}`
              });
            }
          }
        }
      });
    } catch (error) {
      // Skip if parse fails
    }

    return violations;
  }

  /**
   * Check RTL support
   */
  async validateRTLSupport(
    content: string,
    config: UIComplianceConfig = this.config
  ): Promise<RTLViolation[]> {
    const violations: RTLViolation[] = [];
    
    if (!config.enforceRTLSupport) return violations;

    const rtlProblematicProps = [
      "left", "right", "margin-left", "margin-right", 
      "padding-left", "padding-right", "border-left", "border-right",
      "text-align: left", "text-align: right", "float: left", "float: right"
    ];

    try {
      const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
      });

      traverse(ast, {
        JSXAttribute(path) {
          const name = path.node.name.name as string;
          const value = this.getAttributeValue(path.node);
          
          // Check className for directional classes
          if (name === "className" && value) {
            for (const prop of rtlProblematicProps) {
              if (value.includes(prop.replace(/[:-]/g, ""))) {
                violations.push({
                  property: prop,
                  value: value,
                  issue: `Directional class "${prop}" not RTL-safe`,
                  location: this.getNodeLocation(path.node, content),
                  fix: `Use logical properties: start/end instead of left/right`
                });
              }
            }
          }
          
          // Check inline styles
          if (name === "style" && typeof value === "string") {
            for (const prop of rtlProblematicProps) {
              if (value.includes(prop)) {
                violations.push({
                  property: prop,
                  value: value,
                  issue: `Directional style "${prop}" not RTL-safe`,
                  location: this.getNodeLocation(path.node, content),
                  fix: `Use logical properties or RTL-aware utilities`
                });
              }
            }
          }
        }
      });
    } catch (error) {
      // Skip if parse fails
    }

    return violations;
  }

  // === Validation Rule Methods ===

  private async validateNoHardcodedColors(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/;
    
    const lines = context.code.split('\n');
    lines.forEach((line, index) => {
      if (colorRegex.test(line)) {
        violations.push({
          message: "Hardcoded color value detected. Use design tokens instead.",
          line: index + 1,
          column: line.search(colorRegex) + 1,
          severity: "error",
          suggestion: "Use colors.primary[500] or semantic color tokens"
        });
      }
    });

    return {
      ruleId: "no-hardcoded-colors",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateNoHardcodedSpacing(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    const spacingRegex = /(?:padding|margin|gap|space)[-:]?\s*(\d+(?:px|rem|em))/g;
    
    const lines = context.code.split('\n');
    lines.forEach((line, index) => {
      let match;
      while ((match = spacingRegex.exec(line)) !== null) {
        const value = match[1];
        const numericValue = parseFloat(value);
        
        // Check if it's not an 8pt grid value
        if (!ENHANCED_8PT_GRID.includes(numericValue)) {
          violations.push({
            message: `Spacing value "${value}" not on 8pt grid. Use spacing tokens.`,
            line: index + 1,
            column: match.index + 1,
            severity: "error",
            suggestion: `Use spacing[${this.nearestGridValue(numericValue)}]`
          });
        }
      }
    });

    return {
      ruleId: "no-hardcoded-spacing",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateNoArbitraryValues(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    const arbitraryRegex = /\[([\d.]+(?:px|rem|em|%|vh|vw)|#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))\]/g;
    
    const lines = context.code.split('\n');
    lines.forEach((line, index) => {
      let match;
      while ((match = arbitraryRegex.exec(line)) !== null) {
        violations.push({
          message: `Arbitrary value "[${match[1]}]" detected. Use design tokens.`,
          line: index + 1,
          column: match.index + 1,
          severity: "error",
          suggestion: "Replace with appropriate design token"
        });
      }
    });

    return {
      ruleId: "no-arbitrary-values",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateNoRawHTML(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    
    if (context.ast) {
      traverse(context.ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          const tagName = (element.name as JSXIdentifier).name;
          
          if (tagName && tagName[0].toLowerCase() === tagName[0] && !tagName.includes('-')) {
            violations.push({
              message: `Raw HTML element <${tagName}> detected. Use semantic components.`,
              line: element.loc?.start.line || 1,
              column: element.loc?.start.column || 1,
              severity: "error",
              suggestion: `Use ${XalaValidator.suggestSemanticComponent(tagName)} from @xala-technologies/ui-system`
            });
          }
        }
      });
    }

    return {
      ruleId: "no-raw-html",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateNoInlineStyles(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    
    if (context.ast) {
      traverse(context.ast, {
        JSXAttribute(path) {
          if (path.node.name.name === "style") {
            violations.push({
              message: "Inline style attribute detected. Use design tokens and className.",
              line: path.node.loc?.start.line || 1,
              column: path.node.loc?.start.column || 1,
              severity: "error",
              suggestion: "Convert styles to design token classes"
            });
          }
        }
      });
    }

    return {
      ruleId: "no-inline-styles",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateWCAGCompliance(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    
    // This is a simplified check - full WCAG validation would be more complex
    if (context.ast) {
      traverse(context.ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          const tagName = (element.name as JSXIdentifier).name;
          
          // Check form inputs for labels
          if (["input", "select", "textarea"].includes(tagName)) {
            const hasLabel = element.attributes.some(attr => 
              attr.type === "JSXAttribute" && 
              ["aria-label", "aria-labelledby"].includes(attr.name.name as string)
            );
            
            if (!hasLabel) {
              violations.push({
                message: `Form control <${tagName}> missing accessible label`,
                line: element.loc?.start.line || 1,
                column: element.loc?.start.column || 1,
                severity: "error",
                suggestion: "Add aria-label or aria-labelledby attribute"
              });
            }
          }
        }
      });
    }

    return {
      ruleId: "wcag-aaa-compliance",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateAriaLabels(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    const interactiveElements = ["button", "a", "input", "select", "textarea"];
    
    if (context.ast) {
      traverse(context.ast, {
        JSXElement(path) {
          const element = path.node.openingElement;
          const tagName = (element.name as JSXIdentifier).name;
          
          if (interactiveElements.includes(tagName)) {
            const hasAriaLabel = element.attributes.some(attr =>
              attr.type === "JSXAttribute" &&
              ["aria-label", "aria-labelledby", "aria-describedby"].includes(attr.name.name as string)
            );
            
            // Check if element has text content (for buttons and links)
            const hasTextContent = ["button", "a"].includes(tagName) && 
                                 path.node.children.some(child => child.type === "JSXText" && child.value.trim());
            
            if (!hasAriaLabel && !hasTextContent) {
              violations.push({
                message: `Interactive element <${tagName}> missing ARIA label`,
                line: element.loc?.start.line || 1,
                column: element.loc?.start.column || 1,
                severity: "error",
                suggestion: "Add aria-label or visible text content"
              });
            }
          }
        }
      });
    }

    return {
      ruleId: "aria-labels-required",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateNoHardcodedText(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    
    if (context.ast) {
      traverse(context.ast, {
        JSXText(path) {
          const text = path.node.value.trim();
          // Skip whitespace and common non-translatable text
          if (text && !this.isAcceptableHardcodedText(text)) {
            violations.push({
              message: `Hardcoded text "${text}" detected. Use localization.`,
              line: path.node.loc?.start.line || 1,
              column: path.node.loc?.start.column || 1,
              severity: "error",
              suggestion: "Use t() or translation function"
            });
          }
        }
      });
    }

    return {
      ruleId: "no-hardcoded-text",
      valid: violations.length === 0,
      violations
    };
  }

  private async validateRTLSupport(context: UIValidationContext): Promise<UIValidationResult> {
    const violations: UIViolation[] = [];
    const rtlProblems = ["left", "right", "marginLeft", "marginRight", "paddingLeft", "paddingRight"];
    
    const lines = context.code.split('\n');
    lines.forEach((line, index) => {
      for (const problem of rtlProblems) {
        if (line.includes(problem)) {
          violations.push({
            message: `RTL-unsafe property "${problem}" detected`,
            line: index + 1,
            column: line.indexOf(problem) + 1,
            severity: "warning",
            suggestion: "Use logical properties (start/end) or RTL-aware utilities"
          });
        }
      }
    });

    return {
      ruleId: "rtl-support-required",
      valid: violations.length === 0,
      violations
    };
  }

  // === Helper Methods ===

  private getFileType(filePath: string): "tsx" | "jsx" | "ts" | "js" | "css" | "scss" {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'tsx';
      case 'jsx': return 'jsx';
      case 'ts': return 'ts';
      case 'js': return 'js';
      case 'css': return 'css';
      case 'scss': return 'scss';
      default: return 'tsx';
    }
  }

  private calculateScore(violations: UIViolation[]): number {
    const errorCount = violations.filter(v => v.severity === "error").length;
    const warningCount = violations.filter(v => v.severity === "warning").length;
    const infoCount = violations.filter(v => v.severity === "info").length;
    
    // Weighted scoring
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5) - (infoCount * 2));
    return Math.round(score);
  }

  private getNodeLocation(node: Node, content: string): CodeLocation {
    return {
      file: "",
      line: node.loc?.start.line || 1,
      column: node.loc?.start.column || 1,
      endLine: node.loc?.end.line,
      endColumn: node.loc?.end.column
    };
  }

  private getElementName(name: JSXElement["openingElement"]["name"]): string {
    if (name.type === "JSXIdentifier") {
      return name.name;
    }
    return "";
  }

  private getElementAttributes(element: JSXElement["openingElement"]): Record<string, any> {
    const attrs: Record<string, any> = {};
    
    element.attributes.forEach(attr => {
      if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
        attrs[attr.name.name] = this.getAttributeValue(attr);
      }
    });
    
    return attrs;
  }

  private getAttributeValue(attr: JSXAttribute): string {
    if (!attr.value) return "";
    
    if (attr.value.type === "StringLiteral") {
      return attr.value.value;
    }
    
    if (attr.value.type === "JSXExpressionContainer" && 
        attr.value.expression.type === "StringLiteral") {
      return attr.value.expression.value;
    }
    
    return "";
  }

  private isRawHTMLElement(tagName: string): boolean {
    const htmlElements = [
      "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "a", "button", "input", "select", "textarea", "form",
      "ul", "ol", "li", "table", "tr", "td", "th",
      "header", "footer", "main", "section", "article", "aside",
      "nav", "img", "video", "audio", "canvas", "svg"
    ];
    
    return htmlElements.includes(tagName.toLowerCase());
  }

  private suggestSemanticComponent(htmlTag: string): string {
    const mapping: Record<string, string> = {
      div: "Box",
      span: "Text",
      p: "Text",
      h1: "Heading",
      h2: "Heading",
      h3: "Heading",
      h4: "Heading",
      h5: "Heading",
      h6: "Heading",
      a: "Link",
      button: "Button",
      input: "Input",
      select: "Select",
      textarea: "TextArea",
      form: "Form",
      ul: "List",
      ol: "List",
      li: "ListItem",
      table: "Table",
      header: "Header",
      footer: "Footer",
      main: "Container",
      section: "Section",
      article: "Card",
      aside: "Sidebar",
      nav: "Navigation",
      img: "Image"
    };
    
    return mapping[htmlTag] || "Box";
  }

  private static suggestSemanticComponent(htmlTag: string): string {
    return new XalaValidator().suggestSemanticComponent(htmlTag);
  }

  private detectHardcodedValues(className: string): Array<{
    type: string;
    value: string;
    expected: string;
    fix?: string;
  }> {
    const violations = [];
    
    // Check for hardcoded colors
    const colorClasses = className.match(/(?:text|bg|border)-(?!current|transparent|inherit)(\w+)-(\d+)/g) || [];
    for (const colorClass of colorClasses) {
      violations.push({
        type: "color",
        value: colorClass,
        expected: "design token",
        fix: colorClass.replace(/(\w+)-(\d+)/, "token('colors.$1.$2')")
      });
    }
    
    // Check for hardcoded spacing
    const spacingClasses = className.match(/(?:p|m|gap|space)-(\d+)/g) || [];
    for (const spacingClass of spacingClasses) {
      const value = spacingClass.match(/-(\d+)/)?.[1];
      if (value && !this.isValidSpacingToken(value)) {
        violations.push({
          type: "spacing",
          value: spacingClass,
          expected: "8pt grid token",
          fix: `spacing[${this.nearestGridValue(parseInt(value) * 4)}]`
        });
      }
    }
    
    return violations;
  }

  private isValidSpacingToken(value: string): boolean {
    const validTokens = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44", "48", "52", "56", "60", "64", "72", "80", "96"];
    return validTokens.includes(value);
  }

  private nearestGridValue(pixels: number): number {
    const gridIndex = Math.round(pixels / 4);
    const gridValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
    
    return gridValues.reduce((prev, curr) => 
      Math.abs(curr - gridIndex) < Math.abs(prev - gridIndex) ? curr : prev
    );
  }

  private isInteractiveElement(tagName: string, attributes: Record<string, any>): boolean {
    const interactiveTags = ["button", "a", "input", "select", "textarea"];
    const interactiveRoles = ["button", "link", "textbox", "combobox", "listbox", "menu", "menuitem"];
    
    return interactiveTags.includes(tagName.toLowerCase()) ||
           (attributes.role && interactiveRoles.includes(attributes.role)) ||
           attributes.onClick ||
           attributes.onKeyDown ||
           attributes.onKeyPress;
  }

  private hasAccessibleLabel(element: JSXElement["openingElement"]): boolean {
    const labelAttrs = ["aria-label", "aria-labelledby", "aria-describedby"];
    
    return element.attributes.some(attr => 
      attr.type === "JSXAttribute" && 
      labelAttrs.includes(attr.name.name as string) &&
      attr.value
    );
  }

  private isAcceptableHardcodedText(text: string): boolean {
    // Allow numbers, single characters, common symbols
    return /^[\d\s\-+*/%=<>.,;:!?@#$&()[\]{}|\\\/]+$/.test(text) ||
           text.length <= 1 ||
           text === "..." ||
           text === "—" ||
           text === "–";
  }

  private isTranslationFunction(value: string): boolean {
    // Check if the value looks like a translation function call
    return /^t\(|^i18n\.|^translate\(|^trans\(/.test(value);
  }
}
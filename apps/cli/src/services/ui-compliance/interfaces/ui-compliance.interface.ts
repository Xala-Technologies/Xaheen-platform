/**
 * UI Compliance Interface Definitions
 * Enforces Xala UI System v5 compliance rules
 */

import type { ValidationResult, WCAGLevel } from "../../../interfaces/types";

/**
 * UI validation rule types
 */
export type UIRuleType = 
  | "design-token"
  | "component-usage"
  | "accessibility"
  | "localization"
  | "styling"
  | "responsive"
  | "semantic"
  | "performance";

/**
 * UI rule severity levels
 */
export type UIRuleSeverity = "error" | "warning" | "info";

/**
 * UI validation rule
 */
export interface UIValidationRule {
  id: string;
  name: string;
  description: string;
  type: UIRuleType;
  severity: UIRuleSeverity;
  category: string;
  enabled: boolean;
  autoFixable: boolean;
  validate: (context: UIValidationContext) => UIValidationResult | Promise<UIValidationResult>;
  fix?: (context: UIValidationContext) => string;
}

/**
 * UI validation context
 */
export interface UIValidationContext {
  code: string;
  filePath: string;
  fileType: "tsx" | "jsx" | "ts" | "js" | "css" | "scss";
  ast?: any; // AST representation if available
  config: UIComplianceConfig;
  metadata?: Record<string, any>;
}

/**
 * UI validation result
 */
export interface UIValidationResult {
  ruleId: string;
  valid: boolean;
  violations: UIViolation[];
  fixes?: UIFix[];
  metadata?: Record<string, any>;
}

/**
 * UI violation details
 */
export interface UIViolation {
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  node?: any;
  severity: UIRuleSeverity;
  context?: string;
  suggestion?: string;
  documentationUrl?: string;
}

/**
 * UI fix suggestion
 */
export interface UIFix {
  description: string;
  fix: string;
  range?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * UI compliance configuration
 */
export interface UIComplianceConfig {
  // Xala v5 specific settings
  enforceDesignTokens: boolean;
  enforceSemanticComponents: boolean;
  enforceEnhanced8ptGrid: boolean;
  enforceWCAGCompliance: boolean;
  wcagLevel: WCAGLevel;
  enforceRTLSupport: boolean;
  enforceLocalization: boolean;
  supportedLanguages: string[];
  
  // Component rules
  allowRawHTML: boolean;
  allowInlineStyles: boolean;
  allowArbitraryValues: boolean;
  allowHardcodedText: boolean;
  allowHardcodedColors: boolean;
  allowHardcodedSpacing: boolean;
  
  // Token system
  tokenPrefix: string;
  customTokens?: Record<string, any>;
  
  // Performance
  enforceCodeSplitting: boolean;
  maxComponentSize: number;
  
  // Reporting
  reportingLevel: "minimal" | "standard" | "detailed";
  outputFormat: "json" | "html" | "markdown";
}

/**
 * UI compliance report
 */
export interface UIComplianceReport {
  summary: {
    totalFiles: number;
    filesScanned: number;
    totalViolations: number;
    violationsByType: Record<UIRuleType, number>;
    violationsBySeverity: Record<UIRuleSeverity, number>;
    score: number; // 0-100
    compliant: boolean;
  };
  files: UIFileReport[];
  timestamp: Date;
  config: UIComplianceConfig;
}

/**
 * File-level compliance report
 */
export interface UIFileReport {
  filePath: string;
  violations: UIViolation[];
  fixes: UIFix[];
  score: number;
  compliant: boolean;
}

/**
 * Xala v5 specific validation result
 */
export interface XalaV5ValidationResult extends ValidationResult {
  designTokenCompliance: {
    valid: boolean;
    violations: DesignTokenViolation[];
    coverage: number; // Percentage of compliant tokens
  };
  componentCompliance: {
    valid: boolean;
    violations: ComponentViolation[];
    coverage: number; // Percentage of compliant components
  };
  accessibilityCompliance: {
    valid: boolean;
    wcagLevel: WCAGLevel;
    violations: AccessibilityViolation[];
    score: number;
  };
  localizationCompliance: {
    valid: boolean;
    violations: LocalizationViolation[];
    coverage: Record<string, number>; // Coverage per language
  };
  rtlCompliance: {
    valid: boolean;
    violations: RTLViolation[];
    supported: boolean;
  };
}

/**
 * Design token violation
 */
export interface DesignTokenViolation {
  token: string;
  value: string;
  expected: string;
  location: CodeLocation;
  fix?: string;
}

/**
 * Component violation
 */
export interface ComponentViolation {
  component: string;
  issue: string;
  severity: UIRuleSeverity;
  location: CodeLocation;
  suggestion?: string;
}

/**
 * Accessibility violation
 */
export interface AccessibilityViolation {
  rule: string;
  element: string;
  issue: string;
  wcagCriteria: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  location: CodeLocation;
  fix?: string;
}

/**
 * Localization violation
 */
export interface LocalizationViolation {
  text: string;
  language: string;
  issue: string;
  location: CodeLocation;
  suggestion?: string;
}

/**
 * RTL violation
 */
export interface RTLViolation {
  property: string;
  value: string;
  issue: string;
  location: CodeLocation;
  fix?: string;
}

/**
 * Code location
 */
export interface CodeLocation {
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

/**
 * UI compliance validator interface
 */
export interface UIComplianceValidator {
  /**
   * Validate a single file
   */
  validateFile(
    filePath: string,
    content: string,
    config: UIComplianceConfig
  ): Promise<UIFileReport>;
  
  /**
   * Validate multiple files
   */
  validateFiles(
    files: Array<{ path: string; content: string }>,
    config: UIComplianceConfig
  ): Promise<UIComplianceReport>;
  
  /**
   * Apply fixes to a file
   */
  applyFixes(
    filePath: string,
    content: string,
    fixes: UIFix[]
  ): string;
  
  /**
   * Get all available rules
   */
  getRules(): UIValidationRule[];
  
  /**
   * Get rule by ID
   */
  getRule(ruleId: string): UIValidationRule | undefined;
  
  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void;
}

/**
 * Xala v5 specific validator interface
 */
export interface XalaV5Validator extends UIComplianceValidator {
  /**
   * Validate against Xala v5 standards
   */
  validateXalaV5Compliance(
    filePath: string,
    content: string,
    config: UIComplianceConfig
  ): Promise<XalaV5ValidationResult>;
  
  /**
   * Check design token usage
   */
  validateDesignTokens(
    content: string,
    config: UIComplianceConfig
  ): Promise<DesignTokenViolation[]>;
  
  /**
   * Check component compliance
   */
  validateComponents(
    content: string,
    config: UIComplianceConfig
  ): Promise<ComponentViolation[]>;
  
  /**
   * Check accessibility compliance
   */
  validateAccessibility(
    content: string,
    config: UIComplianceConfig
  ): Promise<AccessibilityViolation[]>;
  
  /**
   * Check localization compliance
   */
  validateLocalization(
    content: string,
    config: UIComplianceConfig
  ): Promise<LocalizationViolation[]>;
  
  /**
   * Check RTL support
   */
  validateRTLSupport(
    content: string,
    config: UIComplianceConfig
  ): Promise<RTLViolation[]>;
}
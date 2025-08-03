/**
 * UI Compliance Service
 * Main entry point for Xala v5 UI System compliance validation
 */

export * from "./interfaces/ui-compliance.interface";
export * from "./rules";
export { XalaValidator } from "./XalaValidator";

import { XalaValidator } from "./XalaValidator";
import type { UIComplianceConfig } from "./interfaces/ui-compliance.interface";

/**
 * Default export for convenience
 */
export default XalaValidator;

/**
 * Create a new validator instance with custom config
 */
export function createValidator(config?: Partial<UIComplianceConfig>): XalaValidator {
  return new XalaValidator(config);
}

/**
 * Pre-configured validators for common use cases
 */
export const validators = {
  /**
   * Strict validator - all rules enabled
   */
  strict: () => new XalaValidator({
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
    allowHardcodedSpacing: false
  }),
  
  /**
   * Development validator - more lenient
   */
  development: () => new XalaValidator({
    enforceDesignTokens: true,
    enforceSemanticComponents: true,
    enforceEnhanced8ptGrid: true,
    enforceWCAGCompliance: true,
    wcagLevel: "AA",
    enforceRTLSupport: false,
    enforceLocalization: false,
    supportedLanguages: ["en"],
    allowRawHTML: false,
    allowInlineStyles: false,
    allowArbitraryValues: false,
    allowHardcodedText: true,
    allowHardcodedColors: false,
    allowHardcodedSpacing: false
  }),
  
  /**
   * Migration validator - for gradual adoption
   */
  migration: () => new XalaValidator({
    enforceDesignTokens: true,
    enforceSemanticComponents: false,
    enforceEnhanced8ptGrid: true,
    enforceWCAGCompliance: true,
    wcagLevel: "AA",
    enforceRTLSupport: false,
    enforceLocalization: false,
    supportedLanguages: ["en"],
    allowRawHTML: true,
    allowInlineStyles: true,
    allowArbitraryValues: true,
    allowHardcodedText: true,
    allowHardcodedColors: false,
    allowHardcodedSpacing: false
  })
};
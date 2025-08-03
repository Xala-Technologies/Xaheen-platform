/**
 * UI Compliance Rules Index
 * Exports all validation rules for the Xala v5 compliance engine
 */

export * from "./design-token-rules";
export * from "./component-rules";
export * from "./accessibility-rules";
export * from "./localization-rules";

import { designTokenRules } from "./design-token-rules";
import { componentRules } from "./component-rules";
import { accessibilityRules } from "./accessibility-rules";
import { localizationRules } from "./localization-rules";
import type { UIValidationRule } from "../interfaces/ui-compliance.interface";

/**
 * All available UI compliance rules
 */
export const allRules: UIValidationRule[] = [
  ...designTokenRules,
  ...componentRules,
  ...accessibilityRules,
  ...localizationRules
];

/**
 * Get rules by category
 */
export function getRulesByCategory(category: string): UIValidationRule[] {
  return allRules.filter(rule => rule.category === category);
}

/**
 * Get rules by type
 */
export function getRulesByType(type: string): UIValidationRule[] {
  return allRules.filter(rule => rule.type === type);
}

/**
 * Get rules by severity
 */
export function getRulesBySeverity(severity: "error" | "warning" | "info"): UIValidationRule[] {
  return allRules.filter(rule => rule.severity === severity);
}

/**
 * Get enabled rules
 */
export function getEnabledRules(): UIValidationRule[] {
  return allRules.filter(rule => rule.enabled);
}

/**
 * Get auto-fixable rules
 */
export function getAutoFixableRules(): UIValidationRule[] {
  return allRules.filter(rule => rule.autoFixable);
}
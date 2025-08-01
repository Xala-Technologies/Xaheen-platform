// Validation interfaces for code and configuration validation

import type { IBaseService } from './core';

// === Validation Interfaces ===

/**
 * Validator interface - validates code and configurations
 */
export interface IValidator extends IBaseService {
  validate(input: IValidationInput): Promise<IValidationResult>;
  autofix(result: IValidationResult): Promise<IAutofixResult>;
  getSupportedRules(): string[];
  setRules(rules: IValidationRule[]): void;
}

/**
 * Validation input interface
 */
export interface IValidationInput {
  files: Map<string, string>;
  rules?: string[];
  context?: Record<string, any>;
  options?: IValidationOptions;
}

/**
 * Validation result interface
 */
export interface IValidationResult {
  isValid: boolean;
  issues: IValidationIssue[];
  metrics: IValidationMetrics;
  suggestions: string[];
}

/**
 * Validation issue interface
 */
export interface IValidationIssue {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
  suggestion?: string;
}

/**
 * Validation metrics interface
 */
export interface IValidationMetrics {
  totalFiles: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  duration: number;
}

/**
 * Validation rule interface
 */
export interface IValidationRule {
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  options?: Record<string, any>;
}

/**
 * Validation options interface
 */
export interface IValidationOptions {
  skipFiles?: string[];
  includeTests?: boolean;
  includeStories?: boolean;
  maxErrors?: number;
  parallel?: boolean;
}

/**
 * Autofix result interface
 */
export interface IAutofixResult {
  success: boolean;
  fixedFiles: Map<string, string>;
  unfixableIssues: IValidationIssue[];
  metrics: IAutofixMetrics;
}

/**
 * Autofix metrics interface
 */
export interface IAutofixMetrics {
  duration: number;
  issuesFixed: number;
  filesModified: number;
}

/**
 * Validator factory interface - creates validator instances
 */
export interface IValidatorFactory {
  createSchemaValidator(): IValidator;
  createCodeStyleValidator(): IValidator;
  createSOLIDValidator(): IValidator;
  createAccessibilityValidator(): IValidator;
  createSecurityValidator(): IValidator;
  createPerformanceValidator(): IValidator;
  createNorwegianComplianceValidator(): IValidator;
}
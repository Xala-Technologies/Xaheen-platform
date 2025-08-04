/**
 * @fileoverview Template Validation System
 * @description Comprehensive validation system for Handlebars templates and React components
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern, TypeScript Strict
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import * as Handlebars from 'handlebars';
import { logger } from '../utils/logger.js';
import * as ValidationRules from './validation-rules.js';

export interface TemplateValidationResult {
  readonly isValid: boolean;
  readonly filePath: string;
  readonly violations: ReadonlyArray<ValidationViolation>;
  readonly warnings: ReadonlyArray<ValidationWarning>;
  readonly score: number; // 0-100
  readonly compliance: {
    readonly semantic: boolean;
    readonly accessibility: boolean;
    readonly designTokens: boolean;
    readonly responsive: boolean;
    readonly typeScript: boolean;
    readonly norwegian: boolean;
  };
}

export interface ValidationViolation {
  readonly rule: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly line: number | undefined;
  readonly column: number | undefined;
  readonly suggestion: string;
}

export interface ValidationWarning {
  readonly rule: string;
  readonly message: string;
  readonly line: number | undefined;
  readonly suggestion: string;
}

export interface ValidationRule {
  readonly name: string;
  readonly description: string;
  readonly severity: 'error' | 'warning';
  readonly category: 'semantic' | 'accessibility' | 'tokens' | 'responsive' | 'typescript' | 'norwegian';
  readonly validate: (content: string, filePath: string) => ValidationResult;
}

export interface ValidationResult {
  readonly passed: boolean;
  readonly violations: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly suggestions: ReadonlyArray<string>;
  readonly matches?: ReadonlyArray<{ line: number; column: number; match: string }>;
}

export class TemplateValidator {
  private readonly rules: ReadonlyArray<ValidationRule>;
  private readonly handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.rules = [
      // Semantic Component Rules
      new ValidationRules.NoRawHTMLRule(),
      new ValidationRules.SemanticComponentUsageRule(),
      new ValidationRules.ComponentStructureRule(),
      
      // Design Token Rules
      new ValidationRules.DesignTokenUsageRule(),
      new ValidationRules.NoHardcodedValuesRule(),
      new ValidationRules.TokenReferenceRule(),
      
      // Accessibility Rules
      new ValidationRules.AriaAttributesRule(),
      new ValidationRules.SemanticHTMLRule(),
      new ValidationRules.KeyboardNavigationRule(),
      new ValidationRules.ColorContrastRule(),
      new ValidationRules.ScreenReaderRule(),
      
      // Responsive Rules
      new ValidationRules.BreakpointUsageRule(),
      new ValidationRules.ResponsiveClassesRule(),
      new ValidationRules.FlexboxGridRule(),
      
      // TypeScript Rules
      new ValidationRules.TypeScriptStrictRule(),
      new ValidationRules.InterfaceDefinitionRule(),
      new ValidationRules.NoAnyTypeRule(),
      new ValidationRules.ExplicitReturnTypesRule(),
      
      // Norwegian NSM Compliance Rules
      new ValidationRules.DataClassificationRule(),
      new ValidationRules.SecurityLabelsRule(),
      new ValidationRules.LocalizationNorwegianRule(),
      new ValidationRules.ComplianceDocumentationRule(),
    ];
  }

  async validateTemplate(filePath: string): Promise<TemplateValidationResult> {
    logger.info(`Validating template: ${filePath}`);

    if (!existsSync(filePath)) {
      return this.createErrorResult(filePath, 'File not found');
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      return await this.validateContent(content, filePath);
    } catch (error) {
      logger.error(`Failed to read template ${filePath}:`, error);
      return this.createErrorResult(filePath, `Failed to read file: ${error}`);
    }
  }

  async validateContent(content: string, filePath: string): Promise<TemplateValidationResult> {
    const violations: ValidationViolation[] = [];
    const warnings: ValidationWarning[] = [];
    const compliance = {
      semantic: true,
      accessibility: true,
      designTokens: true,
      responsive: true,
      typeScript: true,
      norwegian: true,
    };

    // Run all validation rules
    for (const rule of this.rules) {
      try {
        const result = rule.validate(content, filePath);
        
        if (!result.passed) {
          // Map rule violations to structured format
          result.violations.forEach((violation, index) => {
            const match = result.matches?.[index];
            violations.push({
              rule: rule.name,
              severity: rule.severity,
              message: violation,
              line: match?.line,
              column: match?.column, 
              suggestion: result.suggestions[index] || 'No suggestion available',
            });
          });

          result.warnings.forEach((warning, index) => {
            const match = result.matches?.[index + result.violations.length];
            warnings.push({
              rule: rule.name,
              message: warning,
              line: match?.line,
              suggestion: result.suggestions[index + result.violations.length] || 'No suggestion available',
            });
          });

          // Update compliance status based on rule categories
          this.updateComplianceStatus(compliance, rule.category, false);
        }
      } catch (error) {
        logger.warn(`Rule '${rule.name}' failed to execute:`, error);
        warnings.push({
          rule: rule.name,
          message: `Rule validation failed: ${error}`,
          line: undefined,
          suggestion: 'Check rule implementation',
        });
      }
    }

    const score = this.calculateScore(violations, warnings, this.rules.length);
    const isValid = violations.filter(v => v.severity === 'error').length === 0;

    return {
      isValid,
      filePath,
      violations,
      warnings,
      score,
      compliance,
    };
  }

  async validateDirectory(directoryPath: string, pattern: string = '**/*.{hbs,tsx,ts,vue,svelte}'): Promise<ReadonlyArray<TemplateValidationResult>> {
    logger.info(`Validating templates in directory: ${directoryPath}`);
    
    const templateFiles = await glob(pattern, { cwd: directoryPath, absolute: true });
    const results: TemplateValidationResult[] = [];

    for (const filePath of templateFiles) {
      const result = await this.validateTemplate(filePath);
      results.push(result);
    }

    return results;
  }

  generateReport(results: ReadonlyArray<TemplateValidationResult>): string {
    const lines: string[] = [];
    
    lines.push('# Template Validation Report\n');
    lines.push(`**Total Templates**: ${results.length}`);
    
    const validTemplates = results.filter(r => r.isValid).length;
    const invalidTemplates = results.length - validTemplates;
    
    lines.push(`**Valid Templates**: ${validTemplates}`);
    lines.push(`**Invalid Templates**: ${invalidTemplates}`);
    
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    lines.push(`**Average Score**: ${avgScore}%\n`);

    // Compliance overview
    lines.push('## Compliance Overview\n');
    const complianceKeys = ['semantic', 'accessibility', 'designTokens', 'responsive', 'typeScript', 'norwegian'] as const;
    
    complianceKeys.forEach(key => {
      const compliantCount = results.filter(r => r.compliance[key]).length;
      const percentage = Math.round((compliantCount / results.length) * 100);
      const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      lines.push(`- **${this.capitalizeFirst(key)}**: ${status} ${compliantCount}/${results.length} (${percentage}%)`);
    });

    lines.push('\n## Detailed Results\n');

    // Group by validation status
    const invalidResults = results.filter(r => !r.isValid);
    const warningResults = results.filter(r => r.isValid && r.warnings.length > 0);

    if (invalidResults.length > 0) {
      lines.push('### ❌ Templates with Errors\n');
      invalidResults.forEach(result => {
        lines.push(`#### ${result.filePath} (Score: ${result.score}%)`);
        result.violations.filter(v => v.severity === 'error').forEach(violation => {
          const location = violation.line ? ` (Line ${violation.line})` : '';
          lines.push(`- ❌ **${violation.rule}**${location}: ${violation.message}`);
          lines.push(`  - *Suggestion*: ${violation.suggestion}`);
        });
        lines.push('');
      });
    }

    if (warningResults.length > 0) {
      lines.push('### ⚠️ Templates with Warnings\n');
      warningResults.forEach(result => {
        lines.push(`#### ${result.filePath} (Score: ${result.score}%)`);
        result.warnings.forEach(warning => {
          const location = warning.line ? ` (Line ${warning.line})` : '';
          lines.push(`- ⚠️ **${warning.rule}**${location}: ${warning.message}`);
          lines.push(`  - *Suggestion*: ${warning.suggestion}`);
        });
        lines.push('');
      });
    }

    const perfectResults = results.filter(r => r.isValid && r.warnings.length === 0);
    if (perfectResults.length > 0) {
      lines.push('### ✅ Perfect Templates\n');
      perfectResults.forEach(result => {
        lines.push(`- ${result.filePath} (Score: ${result.score}%)`);
      });
    }

    return lines.join('\n');
  }

  private createErrorResult(filePath: string, message: string): TemplateValidationResult {
    return {
      isValid: false,
      filePath,
      violations: [{
        rule: 'file-access',
        severity: 'error',
        message,
        line: undefined,
        column: undefined,
        suggestion: 'Ensure the file exists and is readable',
      }],
      warnings: [],
      score: 0,
      compliance: {
        semantic: false,
        accessibility: false,
        designTokens: false,
        responsive: false,
        typeScript: false,
        norwegian: false,
      },
    };
  }

  private updateComplianceStatus(
    compliance: Record<string, boolean>,
    category: string,
    status: boolean
  ): void {
    if (Object.prototype.hasOwnProperty.call(compliance, category)) {
      compliance[category] = compliance[category] && status;
    }
  }

  private calculateScore(
    violations: ReadonlyArray<ValidationViolation>,
    warnings: ReadonlyArray<ValidationWarning>,
    totalRules: number
  ): number {
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = warnings.length;
    
    // Errors are weighted more heavily than warnings
    const penaltyScore = (errorCount * 10) + (warningCount * 3);
    const maxScore = totalRules * 10;
    
    return Math.max(0, Math.round(((maxScore - penaltyScore) / maxScore) * 100));
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Implementation of validation rules will follow...
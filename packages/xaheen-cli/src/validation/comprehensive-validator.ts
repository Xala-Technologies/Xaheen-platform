/**
 * Comprehensive Validation System
 * 
 * Ensures all generated projects meet design system standards and compliance requirements:
 * - CLAUDE.md compliance (button heights, TypeScript patterns)
 * - Design system usage validation
 * - Norwegian NSM compliance
 * - WCAG AAA accessibility validation
 * 
 * @author DevOps Expert Agent  
 * @since 2025-08-06
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { parse } from '@typescript-eslint/parser';
import { TSESTree } from '@typescript-eslint/types';
import chalk from 'chalk';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ValidationContext {
  readonly projectPath: string;
  readonly sourceFiles: string[];
  readonly packageJson?: any;
  readonly tsConfig?: any;
  readonly claudeConfig?: CLAUDEConfig;
}

export interface CLAUDEConfig {
  readonly buttonMinHeight: number;
  readonly inputMinHeight: number;
  readonly strictTypeScript: boolean;
  readonly wcagLevel: 'AA' | 'AAA';
  readonly norwegianCompliance: boolean;
  readonly designSystemRequired: boolean;
}

export interface ValidationRule {
  readonly id: string;
  readonly name: string;
  readonly category: ValidationCategory;
  readonly severity: 'error' | 'warning' | 'info';
  readonly description: string;
  readonly validate: (context: ValidationContext, sourceCode: string, filePath: string) => ValidationIssue[];
  readonly autofix?: (sourceCode: string, issues: ValidationIssue[]) => string;
}

export interface ValidationIssue {
  readonly ruleId: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly line?: number;
  readonly column?: number;
  readonly file: string;
  readonly fix?: ValidationFix;
  readonly category: ValidationCategory;
}

export interface ValidationFix {
  readonly description: string;
  readonly oldText: string;
  readonly newText: string;
  readonly range?: [number, number];
}

export interface ValidationReport {
  readonly success: boolean;
  readonly totalIssues: number;
  readonly errors: ValidationIssue[];
  readonly warnings: ValidationIssue[];
  readonly infos: ValidationIssue[];
  readonly score: ValidationScore;
  readonly categories: Map<ValidationCategory, ValidationIssue[]>;
  readonly recommendations: string[];
  readonly fixableIssues: number;
}

export interface ValidationScore {
  readonly overall: number; // 0-100
  readonly claude: number;
  readonly designSystem: number;
  readonly nsm: number;
  readonly accessibility: number;
  readonly breakdown: {
    readonly typeScript: number;
    readonly componentSizing: number;
    readonly importUsage: number;
    readonly security: number;
    readonly wcag: number;
  };
}

export type ValidationCategory = 
  | 'claude-compliance'
  | 'design-system'
  | 'nsm-security'
  | 'accessibility'
  | 'typescript'
  | 'imports'
  | 'sizing'
  | 'security';

// =============================================================================
// COMPREHENSIVE VALIDATOR CLASS
// =============================================================================

export class ComprehensiveValidator {
  private readonly rules: Map<string, ValidationRule> = new Map();
  private readonly astCache: Map<string, TSESTree.Program> = new Map();

  constructor() {
    this.initializeRules();
  }

  /**
   * Validate entire project
   */
  public async validateProject(context: ValidationContext): Promise<ValidationReport> {
    try {
      const issues: ValidationIssue[] = [];
      
      // Validate each source file
      for (const filePath of context.sourceFiles) {
        if (this.shouldValidateFile(filePath)) {
          const sourceCode = await fs.readFile(filePath, 'utf-8');
          const fileIssues = this.validateFile(context, sourceCode, filePath);
          issues.push(...fileIssues);
        }
      }

      return this.generateReport(issues);
    } catch (error) {
      return {
        success: false,
        totalIssues: 1,
        errors: [{
          ruleId: 'system-error',
          message: `Validation failed: ${error.message}`,
          severity: 'error',
          file: 'system',
          category: 'typescript'
        }],
        warnings: [],
        infos: [],
        score: { overall: 0, claude: 0, designSystem: 0, nsm: 0, accessibility: 0, breakdown: { typeScript: 0, componentSizing: 0, importUsage: 0, security: 0, wcag: 0 } },
        categories: new Map(),
        recommendations: ['Fix system error and retry validation'],
        fixableIssues: 0
      };
    }
  }

  /**
   * Validate individual file
   */
  public validateFile(context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Get applicable rules for this file
    const applicableRules = this.getApplicableRules(filePath);

    for (const rule of applicableRules) {
      try {
        const ruleIssues = rule.validate(context, sourceCode, filePath);
        issues.push(...ruleIssues);
      } catch (error) {
        issues.push({
          ruleId: rule.id,
          message: `Rule validation failed: ${error.message}`,
          severity: 'error',
          file: filePath,
          category: rule.category
        });
      }
    }

    return issues;
  }

  /**
   * Apply automatic fixes
   */
  public async applyFixes(context: ValidationContext, issues: ValidationIssue[]): Promise<number> {
    let fixedCount = 0;

    // Group issues by file
    const fileIssues = new Map<string, ValidationIssue[]>();
    for (const issue of issues) {
      if (issue.fix) {
        const existing = fileIssues.get(issue.file) || [];
        existing.push(issue);
        fileIssues.set(issue.file, existing);
      }
    }

    // Apply fixes for each file
    for (const [filePath, issues] of fileIssues) {
      try {
        const sourceCode = await fs.readFile(filePath, 'utf-8');
        let fixedCode = sourceCode;

        // Sort issues by position (reverse order to maintain positions)
        const sortedIssues = issues.sort((a, b) => {
          if (!a.line || !b.line) return 0;
          return b.line - a.line;
        });

        for (const issue of sortedIssues) {
          if (issue.fix) {
            const rule = this.rules.get(issue.ruleId);
            if (rule?.autofix) {
              fixedCode = rule.autofix(fixedCode, [issue]);
              fixedCount++;
            }
          }
        }

        if (fixedCode !== sourceCode) {
          await fs.writeFile(filePath, fixedCode, 'utf-8');
        }
      } catch (error) {
        console.warn(`Failed to apply fixes to ${filePath}: ${error.message}`);
      }
    }

    return fixedCount;
  }

  // =============================================================================
  // RULE INITIALIZATION
  // =============================================================================

  private initializeRules(): void {
    // CLAUDE.md Compliance Rules
    this.addCLAUDEComplianceRules();
    
    // Design System Usage Rules
    this.addDesignSystemRules();
    
    // Norwegian NSM Compliance Rules
    this.addNSMComplianceRules();
    
    // WCAG AAA Accessibility Rules
    this.addAccessibilityRules();
  }

  private addCLAUDEComplianceRules(): void {
    // Button minimum height rule
    this.rules.set('claude-button-height', {
      id: 'claude-button-height',
      name: 'Button Minimum Height',
      category: 'claude-compliance',
      severity: 'error',
      description: 'Buttons must have minimum height of h-12 (48px)',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for button elements with insufficient height
        const buttonHeightRegex = /<button[^>]*className=["']([^"']*h-(?:[1-9]|10|11))([^"']*?)["']/g;
        let match;
        
        while ((match = buttonHeightRegex.exec(sourceCode)) !== null) {
          const heightClass = match[1];
          const heightValue = parseInt(heightClass.match(/h-(\d+)/)?.[1] || '0');
          
          if (heightValue < 12) {
            const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
            issues.push({
              ruleId: 'claude-button-height',
              message: `Button height ${heightClass} is below minimum h-12 requirement`,
              severity: 'error',
              line: lineNumber,
              file: filePath,
              category: 'claude-compliance',
              fix: {
                description: 'Change button height to h-12',
                oldText: heightClass,
                newText: heightClass.replace(/h-\d+/, 'h-12')
              }
            });
          }
        }
        
        return issues;
      },
      autofix: (sourceCode, issues) => {
        let fixed = sourceCode;
        for (const issue of issues) {
          if (issue.fix) {
            fixed = fixed.replace(issue.fix.oldText, issue.fix.newText);
          }
        }
        return fixed;
      }
    });

    // Input minimum height rule
    this.rules.set('claude-input-height', {
      id: 'claude-input-height',
      name: 'Input Minimum Height',
      category: 'claude-compliance',
      severity: 'error',
      description: 'Input fields must have minimum height of h-14 (56px)',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        const inputHeightRegex = /<input[^>]*className=["']([^"']*h-(?:[1-9]|1[0-3]))([^"']*?)["']/g;
        let match;
        
        while ((match = inputHeightRegex.exec(sourceCode)) !== null) {
          const heightClass = match[1];
          const heightValue = parseInt(heightClass.match(/h-(\d+)/)?.[1] || '0');
          
          if (heightValue < 14) {
            const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
            issues.push({
              ruleId: 'claude-input-height',
              message: `Input height ${heightClass} is below minimum h-14 requirement`,
              severity: 'error',
              line: lineNumber,
              file: filePath,
              category: 'claude-compliance',
              fix: {
                description: 'Change input height to h-14',
                oldText: heightClass,
                newText: heightClass.replace(/h-\d+/, 'h-14')
              }
            });
          }
        }
        
        return issues;
      }
    });

    // TypeScript readonly interfaces rule
    this.rules.set('claude-readonly-props', {
      id: 'claude-readonly-props',
      name: 'Readonly Props Interfaces',
      category: 'claude-compliance',
      severity: 'error',
      description: 'Props interfaces must use readonly properties',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Match interface declarations with props
        const interfaceRegex = /interface\s+(\w+Props)\s*{([^}]+)}/g;
        let match;
        
        while ((match = interfaceRegex.exec(sourceCode)) !== null) {
          const interfaceName = match[1];
          const interfaceBody = match[2];
          
          // Check if properties are readonly
          const propRegex = /^\s*(?!readonly\s)(\w+)[\?\s]*:/gm;
          let propMatch;
          
          while ((propMatch = propRegex.exec(interfaceBody)) !== null) {
            const propName = propMatch[1];
            const lineNumber = sourceCode.substring(0, match.index + propMatch.index).split('\n').length;
            
            issues.push({
              ruleId: 'claude-readonly-props',
              message: `Property '${propName}' in ${interfaceName} should be readonly`,
              severity: 'error',
              line: lineNumber,
              file: filePath,
              category: 'claude-compliance',
              fix: {
                description: `Add readonly modifier to ${propName}`,
                oldText: propMatch[0],
                newText: propMatch[0].replace(propName, `readonly ${propName}`)
              }
            });
          }
        }
        
        return issues;
      }
    });

    // No any types rule
    this.rules.set('claude-no-any-types', {
      id: 'claude-no-any-types',
      name: 'No Any Types',
      category: 'claude-compliance',
      severity: 'error',
      description: 'Components must not use any types',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        const anyTypeRegex = /:\s*any\b|<any>/g;
        let match;
        
        while ((match = anyTypeRegex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          issues.push({
            ruleId: 'claude-no-any-types',
            message: 'Usage of any type found - use explicit TypeScript types',
            severity: 'error',
            line: lineNumber,
            file: filePath,
            category: 'claude-compliance'
          });
        }
        
        return issues;
      }
    });

    // JSX.Element return type rule
    this.rules.set('claude-jsx-return-type', {
      id: 'claude-jsx-return-type',
      name: 'JSX.Element Return Type',
      category: 'claude-compliance',
      severity: 'error',
      description: 'React components must have explicit JSX.Element return type',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        if (filePath.endsWith('.tsx')) {
          const componentRegex = /(?:export\s+(?:const|function)|const)\s+([A-Z]\w+)\s*[=:][^=]*?(?:\([^)]*\))?\s*(?::\s*JSX\.Element)?\s*=>\s*{/g;
          let match;
          
          while ((match = componentRegex.exec(sourceCode)) !== null) {
            const componentName = match[1];
            
            // Check if return type is specified
            if (!match[0].includes(': JSX.Element')) {
              const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
              issues.push({
                ruleId: 'claude-jsx-return-type',
                message: `Component ${componentName} missing JSX.Element return type`,
                severity: 'error',
                line: lineNumber,
                file: filePath,
                category: 'claude-compliance'
              });
            }
          }
        }
        
        return issues;
      }
    });
  }

  private addDesignSystemRules(): void {
    // Design system import rule
    this.rules.set('design-system-imports', {
      id: 'design-system-imports',
      name: 'Design System Imports',
      category: 'design-system',
      severity: 'error',
      description: 'Components must import from @xaheen-ai/design-system',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for design system component usage without proper import
        const componentUsage = /<(Button|Input|Card|Modal|Form)[\s>]/g;
        const hasDesignSystemImport = /import.*from\s+['"]@xaheen\/design-system['"]/.test(sourceCode);
        
        if (componentUsage.test(sourceCode) && !hasDesignSystemImport) {
          issues.push({
            ruleId: 'design-system-imports',
            message: 'Using design system components without proper import',
            severity: 'error',
            line: 1,
            file: filePath,
            category: 'design-system',
            fix: {
              description: 'Add design system import',
              oldText: '',
              newText: "import { Button, Input, Card, Modal, Form } from '@xaheen-ai/design-system';\n"
            }
          });
        }
        
        return issues;
      }
    });

    // Hardcoded values rule
    this.rules.set('design-system-no-hardcoded-values', {
      id: 'design-system-no-hardcoded-values',
      name: 'No Hardcoded Values',
      category: 'design-system',
      severity: 'warning',
      description: 'Avoid hardcoded colors and spacing values',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for hardcoded colors
        const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(|rgba\(/g;
        let match;
        
        while ((match = colorRegex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          issues.push({
            ruleId: 'design-system-no-hardcoded-values',
            message: 'Hardcoded color value found - use design tokens instead',
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'design-system'
          });
        }
        
        return issues;
      }
    });
  }

  private addNSMComplianceRules(): void {
    // Data classification rule
    this.rules.set('nsm-data-classification', {
      id: 'nsm-data-classification',
      name: 'NSM Data Classification',
      category: 'nsm-security',
      severity: 'error',
      description: 'Components handling sensitive data must have NSM classification',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for data handling without classification
        const sensitiveDataRegex = /(password|ssn|personnummer|email|phone|address)/gi;
        const hasClassification = /\/\*\s*NSM:\s*(OPEN|RESTRICTED|CONFIDENTIAL|SECRET)\s*\*\//.test(sourceCode);
        
        if (sensitiveDataRegex.test(sourceCode) && !hasClassification) {
          issues.push({
            ruleId: 'nsm-data-classification',
            message: 'Component handles sensitive data but lacks NSM classification comment',
            severity: 'error',
            line: 1,
            file: filePath,
            category: 'nsm-security',
            fix: {
              description: 'Add NSM classification comment',
              oldText: '',
              newText: '/* NSM: RESTRICTED - Contains sensitive data */\n'
            }
          });
        }
        
        return issues;
      }
    });

    // Norwegian locale rule  
    this.rules.set('nsm-norwegian-locale', {
      id: 'nsm-norwegian-locale',
      name: 'Norwegian Locale Support',
      category: 'nsm-security',
      severity: 'warning',
      description: 'Components should support Norwegian locale',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        const hasNorwegianStrings = /[æøåÆØÅ]/.test(sourceCode);
        const hasI18nSupport = /useTranslation|t\(|i18n/.test(sourceCode);
        
        if (hasNorwegianStrings && !hasI18nSupport) {
          issues.push({
            ruleId: 'nsm-norwegian-locale',
            message: 'Norwegian text found without i18n support',
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'nsm-security'
          });
        }
        
        return issues;
      }
    });
  }

  private addAccessibilityRules(): void {
    // ARIA labels rule
    this.rules.set('wcag-aria-labels', {
      id: 'wcag-aria-labels',
      name: 'ARIA Labels Required',
      category: 'accessibility',
      severity: 'error',
      description: 'Interactive elements must have ARIA labels',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check buttons without aria-label
        const buttonRegex = /<button(?![^>]*aria-label)[^>]*>/g;
        let match;
        
        while ((match = buttonRegex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          issues.push({
            ruleId: 'wcag-aria-labels',
            message: 'Button missing aria-label attribute',
            severity: 'error',
            line: lineNumber,
            file: filePath,
            category: 'accessibility'
          });
        }
        
        return issues;
      }
    });

    // Color contrast rule
    this.rules.set('wcag-color-contrast', {
      id: 'wcag-color-contrast',
      name: 'Color Contrast',
      category: 'accessibility',
      severity: 'error',
      description: 'Elements must meet WCAG AAA color contrast requirements',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for low contrast color combinations
        const lowContrastRegex = /(?:text-gray-400|text-gray-300|text-yellow-300)/g;
        let match;
        
        while ((match = lowContrastRegex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          issues.push({
            ruleId: 'wcag-color-contrast',
            message: `Color class ${match[0]} may not meet WCAG AAA contrast requirements`,
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'accessibility'
          });
        }
        
        return issues;
      }
    });

    // Keyboard navigation rule
    this.rules.set('wcag-keyboard-navigation', {
      id: 'wcag-keyboard-navigation',
      name: 'Keyboard Navigation',
      category: 'accessibility',
      severity: 'error',
      description: 'Interactive elements must support keyboard navigation',
      validate: (context, sourceCode, filePath) => {
        const issues: ValidationIssue[] = [];
        
        // Check for onClick without onKeyDown
        const onClickRegex = /onClick={[^}]+}(?![^>]*onKeyDown)/g;
        let match;
        
        while ((match = onClickRegex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          issues.push({
            ruleId: 'wcag-keyboard-navigation',
            message: 'Element with onClick should also have onKeyDown for keyboard accessibility',
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'accessibility'
          });
        }
        
        return issues;
      }
    });
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private shouldValidateFile(filePath: string): boolean {
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const invalidPaths = ['node_modules', '.next', 'dist', 'build'];
    
    return validExtensions.some(ext => filePath.endsWith(ext)) &&
           !invalidPaths.some(invalid => filePath.includes(invalid));
  }

  private getApplicableRules(filePath: string): ValidationRule[] {
    const allRules = Array.from(this.rules.values());
    
    // Apply different rules based on file type
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      return allRules; // All rules apply to React components
    }
    
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      return allRules.filter(rule => 
        !['claude-jsx-return-type', 'wcag-aria-labels'].includes(rule.id)
      );
    }
    
    return [];
  }

  private generateReport(issues: ValidationIssue[]): ValidationReport {
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const infos = issues.filter(i => i.severity === 'info');
    
    // Group by category
    const categories = new Map<ValidationCategory, ValidationIssue[]>();
    for (const issue of issues) {
      const existing = categories.get(issue.category) || [];
      existing.push(issue);
      categories.set(issue.category, existing);
    }
    
    // Calculate score
    const score = this.calculateValidationScore(issues);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(categories);
    
    // Count fixable issues
    const fixableIssues = issues.filter(i => i.fix).length;
    
    return {
      success: errors.length === 0,
      totalIssues: issues.length,
      errors,
      warnings,
      infos,
      score,
      categories,
      recommendations,
      fixableIssues
    };
  }

  private calculateValidationScore(issues: ValidationIssue[]): ValidationScore {
    const totalPossiblePoints = 100;
    let penalties = 0;
    
    // Calculate penalties by category
    const categoryPenalties = {
      'claude-compliance': 25,
      'design-system': 20,
      'nsm-security': 20,
      'accessibility': 25,
      'typescript': 15,
      'imports': 10,
      'sizing': 15,
      'security': 20
    };
    
    for (const issue of issues) {
      const penalty = categoryPenalties[issue.category] || 5;
      if (issue.severity === 'error') {
        penalties += penalty;
      } else if (issue.severity === 'warning') {
        penalties += penalty / 2;
      }
    }
    
    const overall = Math.max(0, totalPossiblePoints - penalties);
    
    // Calculate category-specific scores
    const claudeIssues = issues.filter(i => i.category === 'claude-compliance');
    const designSystemIssues = issues.filter(i => i.category === 'design-system');
    const nsmIssues = issues.filter(i => i.category === 'nsm-security');
    const accessibilityIssues = issues.filter(i => i.category === 'accessibility');
    
    return {
      overall,
      claude: Math.max(0, 100 - (claudeIssues.length * 15)),
      designSystem: Math.max(0, 100 - (designSystemIssues.length * 12)),
      nsm: Math.max(0, 100 - (nsmIssues.length * 12)),
      accessibility: Math.max(0, 100 - (accessibilityIssues.length * 15)),
      breakdown: {
        typeScript: Math.max(0, 100 - (issues.filter(i => i.ruleId.includes('typescript')).length * 10)),
        componentSizing: Math.max(0, 100 - (issues.filter(i => i.ruleId.includes('height')).length * 20)),
        importUsage: Math.max(0, 100 - (issues.filter(i => i.ruleId.includes('import')).length * 15)),
        security: Math.max(0, 100 - (nsmIssues.length * 12)),
        wcag: Math.max(0, 100 - (accessibilityIssues.length * 15))
      }
    };
  }

  private generateRecommendations(categories: Map<ValidationCategory, ValidationIssue[]>): string[] {
    const recommendations: string[] = [];
    
    if (categories.get('claude-compliance')?.length > 0) {
      recommendations.push('Review CLAUDE.md compliance: ensure button heights ≥ h-12, input heights ≥ h-14, and use readonly interfaces');
    }
    
    if (categories.get('design-system')?.length > 0) {
      recommendations.push('Improve design system usage: import components from @xaheen-ai/design-system and avoid hardcoded values');
    }
    
    if (categories.get('nsm-security')?.length > 0) {
      recommendations.push('Add NSM compliance: classify sensitive data and ensure Norwegian locale support');
    }
    
    if (categories.get('accessibility')?.length > 0) {
      recommendations.push('Enhance accessibility: add ARIA labels, ensure color contrast, and implement keyboard navigation');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great work! Your project meets all validation requirements.');
    }
    
    return recommendations;
  }

  public displayReport(report: ValidationReport): void {
    console.log('\n' + chalk.bold('🔍 Comprehensive Validation Report'));
    console.log('═'.repeat(60));
    
    // Overall score with color coding
    const scoreColor = report.score.overall >= 90 ? 'green' : 
                      report.score.overall >= 70 ? 'yellow' : 'red';
    
    console.log(`\n${chalk.bold('Overall Score:')} ${chalk[scoreColor](`${report.score.overall}%`)}`);
    
    // Category breakdown
    console.log('\n' + chalk.bold('Category Scores:'));
    console.log(`  • CLAUDE.md Compliance: ${this.colorizeScore(report.score.claude)}%`);
    console.log(`  • Design System Usage: ${this.colorizeScore(report.score.designSystem)}%`);
    console.log(`  • NSM Security: ${this.colorizeScore(report.score.nsm)}%`);
    console.log(`  • WCAG Accessibility: ${this.colorizeScore(report.score.accessibility)}%`);
    
    // Issue summary
    if (report.totalIssues > 0) {
      console.log('\n' + chalk.bold('Issues Found:'));
      console.log(`  ${chalk.red('Errors:')} ${report.errors.length}`);
      console.log(`  ${chalk.yellow('Warnings:')} ${report.warnings.length}`);
      console.log(`  ${chalk.blue('Info:')} ${report.infos.length}`);
      console.log(`  ${chalk.green('Fixable:')} ${report.fixableIssues}`);
      
      // List issues by category
      for (const [category, issues] of report.categories) {
        if (issues.length > 0) {
          console.log(`\n${chalk.bold(this.formatCategoryName(category))}:`);
          for (const issue of issues.slice(0, 3)) { // Show first 3 issues per category
            const icon = issue.severity === 'error' ? chalk.red('✗') : 
                        issue.severity === 'warning' ? chalk.yellow('⚠') : chalk.blue('ℹ');
            console.log(`  ${icon} ${issue.message} ${chalk.gray(`(${path.basename(issue.file)}:${issue.line})`)}`);
          }
          if (issues.length > 3) {
            console.log(`  ${chalk.gray(`... and ${issues.length - 3} more`)}`);
          }
        }
      }
    } else {
      console.log('\n' + chalk.green('✨ No issues found! Your project is fully compliant.'));
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n' + chalk.bold('🔧 Recommendations:'));
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  private colorizeScore(score: number): string {
    if (score >= 90) return chalk.green(score.toString());
    if (score >= 70) return chalk.yellow(score.toString());
    return chalk.red(score.toString());
  }

  private formatCategoryName(category: ValidationCategory): string {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createComprehensiveValidator(): ComprehensiveValidator {
  return new ComprehensiveValidator();
}

export default ComprehensiveValidator;
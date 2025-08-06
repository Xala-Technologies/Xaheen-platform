/**
 * CLAUDE.md Compliance Validation Module
 * 
 * Validates that generated code follows all CLAUDE.md standards:
 * - TypeScript-first with strict typing
 * - React functional components with modern patterns
 * - Tailwind CSS for styling
 * - WCAG AAA accessibility compliance
 * - Professional component sizing
 * - Modern ES6+ syntax and React hooks
 * - Comprehensive error handling
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { consola } from 'consola';
import type { 
  ValidationResult, 
  CLAUDEComplianceRules,
  TypeScriptRule,
  ReactRule,
  TailwindRule,
  AccessibilityRule,
  SizingRule 
} from '../types.js';

export class CLAUDEComplianceValidator {
  private static readonly COMPLIANCE_RULES: CLAUDEComplianceRules = {
    typescript: [
      {
        rule: 'no-any-types',
        pattern: /:\s*any\b/,
        antiPattern: /:\s*any\b/,
        severity: 'error',
        message: 'No any types permitted - use strict TypeScript only'
      },
      {
        rule: 'explicit-return-types',
        pattern: /\):\s*JSX\.Element/,
        severity: 'error',
        message: 'All components must have explicit JSX.Element return type'
      },
      {
        rule: 'readonly-interfaces',
        pattern: /interface\s+\w+Props\s*\{[^}]*readonly/,
        severity: 'error',
        message: 'Props interfaces must be readonly'
      },
      {
        rule: 'strict-prop-types',
        pattern: /interface\s+\w+Props\s*\{/,
        severity: 'warning',
        message: 'Components should have proper prop interfaces'
      }
    ],
    react: [
      {
        rule: 'functional-components-only',
        pattern: /^(?!.*class\s+\w+\s+extends\s+React\.Component)/m,
        antiPattern: /class\s+\w+\s+extends\s+React\.Component/,
        severity: 'error',
        message: 'Only React functional components allowed - no class components'
      },
      {
        rule: 'modern-hooks',
        pattern: /(useState|useEffect|useCallback|useMemo)/,
        severity: 'warning',
        message: 'Should use modern React hooks'
      },
      {
        rule: 'proper-destructuring',
        pattern: /\(\s*\{\s*[\w\s,]+\}\s*:\s*\w+Props\s*\)/,
        severity: 'warning',
        message: 'Should use proper prop destructuring with defaults'
      },
      {
        rule: 'error-handling',
        pattern: /(try\s*\{|catch\s*\()/,
        severity: 'warning',
        message: 'Components should include error handling'
      }
    ],
    tailwind: [
      {
        rule: 'no-inline-styles',
        pattern: /style\s*=\s*\{\{/,
        antiPattern: /style\s*=\s*\{\{/,
        severity: 'error',
        message: 'No inline styles - use Tailwind classes only'
      },
      {
        rule: 'professional-shadows',
        pattern: /(shadow-md|shadow-lg|shadow-xl)/,
        severity: 'warning',
        message: 'Should use professional shadows (shadow-md, shadow-lg, shadow-xl)'
      },
      {
        rule: 'modern-borders',
        pattern: /(rounded-lg|rounded-xl|rounded-2xl)/,
        severity: 'warning',
        message: 'Should use modern border radius (rounded-lg+)'
      },
      {
        rule: 'semantic-colors',
        pattern: /bg-(?![\[\d])/,
        antiPattern: /bg-\[#[a-fA-F0-9]{6}\]/,
        severity: 'error',
        message: 'Use semantic color names, not arbitrary values'
      }
    ],
    accessibility: [
      {
        rule: 'aria-labels',
        pattern: /aria-label=/,
        severity: 'error',
        wcagLevel: 'AAA',
        message: 'Interactive elements must have aria-label attributes'
      },
      {
        rule: 'semantic-html',
        pattern: /<(button|input|label|nav|main|section|article)/,
        severity: 'warning',
        wcagLevel: 'AA',
        message: 'Should use semantic HTML elements'
      },
      {
        rule: 'keyboard-navigation',
        pattern: /(onKeyDown|onKeyPress|tabIndex)/,
        severity: 'warning',
        wcagLevel: 'AA',
        message: 'Interactive elements should support keyboard navigation'
      },
      {
        rule: 'focus-indicators',
        pattern: /focus:(outline|ring)/,
        severity: 'error',
        wcagLevel: 'AAA',
        message: 'Interactive elements must have visible focus indicators'
      }
    ],
    sizing: [
      {
        rule: 'button-min-height',
        pattern: /(h-12|h-14|h-16|min-h-\[48px\]|min-h-\[56px\])/,
        minHeight: '48px',
        severity: 'error',
        message: 'Buttons must have minimum height of h-12 (48px)'
      },
      {
        rule: 'input-min-height',
        pattern: /(h-14|h-16|h-18|min-h-\[56px\]|min-h-\[64px\])/,
        minHeight: '56px',
        severity: 'error',
        message: 'Input fields must have minimum height of h-14 (56px)'
      },
      {
        rule: 'professional-spacing',
        pattern: /(p-6|p-8|gap-4|gap-6|gap-8|space-y-4|space-y-6|space-y-8)/,
        severity: 'warning',
        message: 'Should use professional spacing (6, 8, 4+ units)'
      }
    ]
  };

  /**
   * Validate CLAUDE.md compliance for a project
   */
  async validateClaudeCompliance(projectPath: string): Promise<ValidationResult> {
    consola.debug(`Validating CLAUDE.md compliance: ${projectPath}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Find all relevant files
      const files = await this.findRelevantFiles(projectPath);
      
      if (files.length === 0) {
        warnings.push('No relevant code files found for validation');
        return { success: true, errors, warnings, duration: Date.now() - startTime };
      }

      // Validate each file
      for (const file of files) {
        const fileValidation = await this.validateFile(file);
        errors.push(...fileValidation.errors);
        warnings.push(...fileValidation.warnings);
      }

      const success = errors.length === 0;
      consola.debug(`CLAUDE.md compliance validation completed: ${success ? 'PASSED' : 'FAILED'}`);

      return {
        success,
        errors,
        warnings,
        duration: Date.now() - startTime,
        details: {
          filesValidated: files.length,
          rules: CLAUDEComplianceValidator.COMPLIANCE_RULES
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`CLAUDE.md compliance validation error: ${errorMessage}`);
      
      return {
        success: false,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Find all relevant files for validation
   */
  private async findRelevantFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte'];
    
    const searchDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await searchDir(fullPath);
          } else if (entry.isFile() && this.isRelevantFile(entry.name, extensions)) {
            files.push(fullPath);
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    await searchDir(join(projectPath, 'src'));
    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.nuxt', '.svelte-kit'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file is relevant for validation
   */
  private isRelevantFile(fileName: string, extensions: string[]): boolean {
    return extensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Validate a single file against CLAUDE.md rules
   */
  private async validateFile(filePath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = filePath.split('/').pop() || '';

      // Skip non-component files for some rules
      const isComponentFile = this.isComponentFile(fileName, content);
      
      // Validate TypeScript rules
      for (const rule of CLAUDEComplianceValidator.COMPLIANCE_RULES.typescript) {
        const violation = this.checkRule(content, rule, fileName);
        if (violation) {
          if (rule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

      // Validate React rules (only for component files)
      if (isComponentFile) {
        for (const rule of CLAUDEComplianceValidator.COMPLIANCE_RULES.react) {
          const violation = this.checkRule(content, rule, fileName);
          if (violation) {
            if (rule.severity === 'error') {
              errors.push(violation);
            } else {
              warnings.push(violation);
            }
          }
        }

        // Validate Tailwind rules
        for (const rule of CLAUDEComplianceValidator.COMPLIANCE_RULES.tailwind) {
          const violation = this.checkRule(content, rule, fileName);
          if (violation) {
            if (rule.severity === 'error') {
              errors.push(violation);
            } else {
              warnings.push(violation);
            }
          }
        }

        // Validate accessibility rules
        for (const rule of CLAUDEComplianceValidator.COMPLIANCE_RULES.accessibility) {
          const violation = this.checkAccessibilityRule(content, rule, fileName);
          if (violation) {
            if (rule.severity === 'error') {
              errors.push(violation);
            } else {
              warnings.push(violation);
            }
          }
        }

        // Validate sizing rules
        for (const rule of CLAUDEComplianceValidator.COMPLIANCE_RULES.sizing) {
          const violation = this.checkSizingRule(content, rule, fileName);
          if (violation) {
            if (rule.severity === 'error') {
              errors.push(violation);
            } else {
              warnings.push(violation);
            }
          }
        }
      }

    } catch (error) {
      errors.push(`Failed to validate file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Check if file is a component file
   */
  private isComponentFile(fileName: string, content: string): boolean {
    // Check if file exports a component
    const hasComponentExport = /export\s+(const|function)\s+[A-Z]/m.test(content);
    const hasJSXReturn = /return\s*\(/m.test(content) && /<[A-Z]/m.test(content);
    const isComponentName = /^[A-Z]/.test(fileName);
    
    return hasComponentExport || hasJSXReturn || isComponentName;
  }

  /**
   * Check a general rule against content
   */
  private checkRule(content: string, rule: TypeScriptRule | ReactRule | TailwindRule, fileName: string): string | null {
    // Check anti-pattern first (if exists)
    if (rule.antiPattern) {
      const antiMatch = typeof rule.antiPattern === 'string' 
        ? content.includes(rule.antiPattern)
        : rule.antiPattern.test(content);
      
      if (antiMatch) {
        return `${fileName}: ${rule.message} (Rule: ${rule.rule})`;
      }
    }

    // For positive patterns, absence is a violation
    const match = typeof rule.pattern === 'string'
      ? content.includes(rule.pattern)
      : rule.pattern.test(content);

    // Special handling for certain rules
    if (rule.rule === 'no-any-types') {
      // For this rule, finding the pattern IS the violation
      return match ? `${fileName}: ${rule.message} (Rule: ${rule.rule})` : null;
    }

    if (rule.rule === 'functional-components-only') {
      // Check for class components (anti-pattern)
      const hasClassComponent = /class\s+\w+\s+extends\s+React\.Component/m.test(content);
      return hasClassComponent ? `${fileName}: ${rule.message} (Rule: ${rule.rule})` : null;
    }

    // For most rules, not finding the pattern is a violation (but only warn for optional patterns)
    if (!match && rule.severity === 'error') {
      return `${fileName}: ${rule.message} (Rule: ${rule.rule})`;
    }

    return null;
  }

  /**
   * Check accessibility rule with WCAG level
   */
  private checkAccessibilityRule(content: string, rule: AccessibilityRule, fileName: string): string | null {
    // Special handling for accessibility rules
    const hasInteractiveElements = /<(button|input|select|textarea)/i.test(content);
    
    if (rule.rule === 'aria-labels' && hasInteractiveElements) {
      const hasAriaLabel = /aria-label=/i.test(content);
      if (!hasAriaLabel) {
        return `${fileName}: ${rule.message} (WCAG ${rule.wcagLevel}) (Rule: ${rule.rule})`;
      }
    }

    if (rule.rule === 'focus-indicators' && hasInteractiveElements) {
      const hasFocusStyles = /focus:(outline|ring|border)/i.test(content);
      if (!hasFocusStyles) {
        return `${fileName}: ${rule.message} (WCAG ${rule.wcagLevel}) (Rule: ${rule.rule})`;
      }
    }

    return this.checkRule(content, rule, fileName);
  }

  /**
   * Check sizing rule with specific size requirements
   */
  private checkSizingRule(content: string, rule: SizingRule, fileName: string): string | null {
    const hasButtons = /<button/i.test(content);
    const hasInputs = /<input|<textarea/i.test(content);

    if (rule.rule === 'button-min-height' && hasButtons) {
      const hasProfessionalButtonSize = /(h-12|h-14|h-16|min-h-\[48px\]|min-h-\[56px\])/i.test(content);
      const hasUnprofessionalSize = /(h-8|h-10|text-xs|text-sm)\b/i.test(content);
      
      if (!hasProfessionalButtonSize || hasUnprofessionalSize) {
        return `${fileName}: ${rule.message} (Rule: ${rule.rule})`;
      }
    }

    if (rule.rule === 'input-min-height' && hasInputs) {
      const hasProfessionalInputSize = /(h-14|h-16|h-18|min-h-\[56px\]|min-h-\[64px\])/i.test(content);
      const hasUnprofessionalSize = /(h-8|h-10|h-12)\b/i.test(content);
      
      if (!hasProfessionalInputSize || hasUnprofessionalSize) {
        return `${fileName}: ${rule.message} (Rule: ${rule.rule})`;
      }
    }

    return this.checkRule(content, rule, fileName);
  }
}

export default CLAUDEComplianceValidator;
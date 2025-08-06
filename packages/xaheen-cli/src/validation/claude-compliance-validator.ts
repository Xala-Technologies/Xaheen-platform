/**
 * CLAUDE.md Compliance Validator
 * 
 * Validates generated code against CLAUDE.md requirements:
 * - Button heights minimum h-12
 * - Input heights minimum h-14  
 * - TypeScript readonly interfaces
 * - No any types allowed
 * - JSX.Element return types
 * - Professional component sizing
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { ValidationRule, ValidationIssue, ValidationContext } from './comprehensive-validator';
import { createASTAnalyzer, ASTAnalyzer } from './ast-analyzer';

// =============================================================================
// CLAUDE COMPLIANCE RULES
// =============================================================================

export const claudeComplianceRules: ValidationRule[] = [
  // Button minimum height rule (h-12 minimum)
  {
    id: 'claude-button-min-height',
    name: 'Button Minimum Height (h-12)',
    category: 'claude-compliance',
    severity: 'error',
    description: 'Buttons must have minimum height of h-12 (48px) for professional appearance',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Match button elements with height classes
      const buttonHeightRegex = /<button[^>]*className=["']([^"']*\bh-(\d+)\b[^"']*?)["'][^>]*>/g;
      let match;
      
      while ((match = buttonHeightRegex.exec(sourceCode)) !== null) {
        const fullClassName = match[1];
        const heightValue = parseInt(match[2]);
        
        if (heightValue < 12) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          const columnNumber = match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1;
          
          issues.push({
            ruleId: 'claude-button-min-height',
            message: `Button height h-${heightValue} is below minimum requirement of h-12`,
            severity: 'error',
            line: lineNumber,
            column: columnNumber,
            file: filePath,
            category: 'claude-compliance',
            fix: {
              description: `Change button height from h-${heightValue} to h-12`,
              oldText: `h-${heightValue}`,
              newText: 'h-12'
            }
          });
        }
      }
      
      // Also check for buttons without height classes (should default to h-12)
      const buttonWithoutHeightRegex = /<button(?![^>]*\bh-\d+\b)[^>]*className=["']([^"']*?)["'][^>]*>/g;
      let noHeightMatch;
      
      while ((noHeightMatch = buttonWithoutHeightRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, noHeightMatch.index).split('\n').length;
        const columnNumber = noHeightMatch.index - sourceCode.lastIndexOf('\n', noHeightMatch.index - 1) - 1;
        
        issues.push({
          ruleId: 'claude-button-min-height',
          message: 'Button missing height class - should include h-12 minimum',
          severity: 'warning',
          line: lineNumber,
          column: columnNumber,
          file: filePath,
          category: 'claude-compliance',
          fix: {
            description: 'Add h-12 to button className',
            oldText: noHeightMatch[1],
            newText: `${noHeightMatch[1]} h-12`.trim()
          }
        });
      }
      
      return issues;
    },
    autofix: (sourceCode: string, issues: ValidationIssue[]): string => {
      let fixed = sourceCode;
      
      // Sort issues by position (reverse order to maintain positions)
      const sortedIssues = issues.sort((a, b) => (b.line || 0) - (a.line || 0));
      
      for (const issue of sortedIssues) {
        if (issue.fix) {
          fixed = fixed.replace(issue.fix.oldText, issue.fix.newText);
        }
      }
      
      return fixed;
    }
  },

  // Input minimum height rule (h-14 minimum)
  {
    id: 'claude-input-min-height',
    name: 'Input Minimum Height (h-14)',
    category: 'claude-compliance',
    severity: 'error',
    description: 'Input fields must have minimum height of h-14 (56px) for professional appearance',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      const inputHeightRegex = /<input[^>]*className=["']([^"']*\bh-(\d+)\b[^"']*?)["'][^>]*>/g;
      let match;
      
      while ((match = inputHeightRegex.exec(sourceCode)) !== null) {
        const fullClassName = match[1];
        const heightValue = parseInt(match[2]);
        
        if (heightValue < 14) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          const columnNumber = match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1;
          
          issues.push({
            ruleId: 'claude-input-min-height',
            message: `Input height h-${heightValue} is below minimum requirement of h-14`,
            severity: 'error',
            line: lineNumber,
            column: columnNumber,
            file: filePath,
            category: 'claude-compliance',
            fix: {
              description: `Change input height from h-${heightValue} to h-14`,
              oldText: `h-${heightValue}`,
              newText: 'h-14'
            }
          });
        }
      }
      
      return issues;
    }
  },

  // TypeScript readonly interfaces rule
  {
    id: 'claude-readonly-props-interfaces',
    name: 'Readonly Props Interfaces',
    category: 'claude-compliance',
    severity: 'error',
    description: 'Props interfaces must use readonly properties according to CLAUDE.md',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return issues;
      }
      
      try {
        const analyzer = createASTAnalyzer(sourceCode, filePath);
        const interfaces = analyzer.getInterfaces();
        
        for (const interfaceAnalysis of interfaces) {
          if (interfaceAnalysis.isPropsInterface) {
            for (const property of interfaceAnalysis.properties) {
              if (!property.isReadonly) {
                issues.push({
                  ruleId: 'claude-readonly-props-interfaces',
                  message: `Property '${property.name}' in ${interfaceAnalysis.name} must be readonly`,
                  severity: 'error',
                  line: property.location.line,
                  column: property.location.column,
                  file: filePath,
                  category: 'claude-compliance',
                  fix: {
                    description: `Add readonly modifier to ${property.name}`,
                    oldText: property.name,
                    newText: `readonly ${property.name}`
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        // If AST analysis fails, fall back to regex
        const interfaceRegex = /interface\s+(\w+Props)\s*{([^}]+)}/g;
        let match;
        
        while ((match = interfaceRegex.exec(sourceCode)) !== null) {
          const interfaceName = match[1];
          const interfaceBody = match[2];
          
          const propRegex = /^\s*(?!readonly\s)(\w+)[\?\s]*:/gm;
          let propMatch;
          
          while ((propMatch = propRegex.exec(interfaceBody)) !== null) {
            const propName = propMatch[1];
            const lineNumber = sourceCode.substring(0, match.index + propMatch.index).split('\n').length;
            
            issues.push({
              ruleId: 'claude-readonly-props-interfaces',
              message: `Property '${propName}' in ${interfaceName} must be readonly`,
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
      }
      
      return issues;
    }
  },

  // No any types rule
  {
    id: 'claude-no-any-types',
    name: 'Strict TypeScript - No Any Types',
    category: 'claude-compliance',
    severity: 'error',
    description: 'Components must not use any types - use explicit TypeScript types',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return issues;
      }
      
      // Match any type usage
      const anyTypeRegex = /:\s*any\b|<any>|\bany\[\]/g;
      let match;
      
      while ((match = anyTypeRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const columnNumber = match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1;
        
        // Skip comments and string literals
        const line = sourceCode.split('\n')[lineNumber - 1];
        const beforeMatch = line.substring(0, columnNumber);
        
        if (beforeMatch.includes('//') || beforeMatch.includes('/*')) {
          continue; // Skip commented code
        }
        
        issues.push({
          ruleId: 'claude-no-any-types',
          message: 'Usage of any type found - use explicit TypeScript types instead',
          severity: 'error',
          line: lineNumber,
          column: columnNumber,
          file: filePath,
          category: 'claude-compliance'
        });
      }
      
      return issues;
    }
  },

  // JSX.Element return type rule
  {
    id: 'claude-jsx-element-return-type',
    name: 'JSX.Element Return Type Required',
    category: 'claude-compliance',
    severity: 'error',
    description: 'React components must have explicit JSX.Element return type',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      if (!filePath.endsWith('.tsx')) {
        return issues; // Only apply to TSX files
      }
      
      try {
        const analyzer = createASTAnalyzer(sourceCode, filePath);
        const components = analyzer.getComponents();
        
        for (const component of components) {
          if (!component.hasJSXReturnType) {
            issues.push({
              ruleId: 'claude-jsx-element-return-type',
              message: `Component ${component.name} missing JSX.Element return type`,
              severity: 'error',
              line: component.location.line,
              column: component.location.column,
              file: filePath,
              category: 'claude-compliance',
              fix: {
                description: `Add JSX.Element return type to ${component.name}`,
                oldText: `${component.name} =`,
                newText: `${component.name}: JSX.Element =`
              }
            });
          }
        }
      } catch (error) {
        // Fall back to regex if AST fails
        const componentRegex = /(?:export\s+(?:const|function)|const)\s+([A-Z]\w+)\s*[=:][^=]*?(?:\([^)]*\))?\s*(?::\s*JSX\.Element)?\s*=>/g;
        let match;
        
        while ((match = componentRegex.exec(sourceCode)) !== null) {
          const componentName = match[1];
          
          if (!match[0].includes(': JSX.Element')) {
            const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
            
            issues.push({
              ruleId: 'claude-jsx-element-return-type',
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
  },

  // Professional sizing standards rule
  {
    id: 'claude-professional-sizing',
    name: 'Professional Component Sizing',
    category: 'claude-compliance',
    severity: 'warning',
    description: 'Components should use professional sizing standards (avoid xs, sm sizes)',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for unprofessional small sizing
      const smallSizingRegex = /(text-xs|text-sm|p-1|p-2|m-1|m-2|gap-1|gap-2|space-[xy]-1|space-[xy]-2)/g;
      let match;
      
      while ((match = smallSizingRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const columnNumber = match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1;
        
        issues.push({
          ruleId: 'claude-professional-sizing',
          message: `Small sizing class '${match[1]}' may appear unprofessional - consider using larger values`,
          severity: 'warning',
          line: lineNumber,
          column: columnNumber,
          file: filePath,
          category: 'claude-compliance'
        });
      }
      
      return issues;
    }
  },

  // Modern React hooks rule
  {
    id: 'claude-modern-react-hooks',
    name: 'Modern React Hooks Usage',
    category: 'claude-compliance',
    severity: 'warning',
    description: 'Components should use modern React hooks (useState, useCallback, useMemo)',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
        return issues;
      }
      
      // Check for useState without proper typing
      const useStateRegex = /useState\(\)/g;
      let match;
      
      while ((match = useStateRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'claude-modern-react-hooks',
          message: 'useState should have explicit type annotation for better TypeScript support',
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'claude-compliance'
        });
      }
      
      // Check for functions that could be optimized with useCallback
      const functionInComponentRegex = /const\s+handle\w+\s*=\s*\([^)]*\)\s*=>/g;
      const hasUseCallback = sourceCode.includes('useCallback');
      
      if (functionInComponentRegex.test(sourceCode) && !hasUseCallback) {
        issues.push({
          ruleId: 'claude-modern-react-hooks',
          message: 'Consider using useCallback for event handlers to optimize performance',
          severity: 'info',
          line: 1,
          file: filePath,
          category: 'claude-compliance'
        });
      }
      
      return issues;
    }
  },

  // Error handling rule
  {
    id: 'claude-error-handling',
    name: 'Error Handling Required',
    category: 'claude-compliance',
    severity: 'warning',
    description: 'Components should implement proper error handling',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
        return issues;
      }
      
      // Check for try-catch blocks or error boundaries
      const hasTryCatch = /try\s*{[\s\S]*?}\s*catch/g.test(sourceCode);
      const hasErrorBoundary = /componentDidCatch|ErrorBoundary|error/i.test(sourceCode);
      const isComplexComponent = sourceCode.includes('useEffect') || sourceCode.includes('fetch') || sourceCode.includes('async');
      
      if (isComplexComponent && !hasTryCatch && !hasErrorBoundary) {
        issues.push({
          ruleId: 'claude-error-handling',
          message: 'Complex component should implement error handling with try-catch or error boundaries',
          severity: 'warning',
          line: 1,
          file: filePath,
          category: 'claude-compliance'
        });
      }
      
      return issues;
    }
  }
];

// =============================================================================
// CLAUDE COMPLIANCE VALIDATOR
// =============================================================================

export class CLAUDEComplianceValidator {
  private rules: ValidationRule[];

  constructor() {
    this.rules = claudeComplianceRules;
  }

  /**
   * Validate file against CLAUDE.md compliance rules
   */
  public validateFile(context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] {
    const allIssues: ValidationIssue[] = [];

    for (const rule of this.rules) {
      try {
        const issues = rule.validate(context, sourceCode, filePath);
        allIssues.push(...issues);
      } catch (error) {
        allIssues.push({
          ruleId: rule.id,
          message: `Rule validation failed: ${error.message}`,
          severity: 'error',
          file: filePath,
          category: 'claude-compliance'
        });
      }
    }

    return allIssues;
  }

  /**
   * Get specific rule by ID
   */
  public getRule(ruleId: string): ValidationRule | undefined {
    return this.rules.find(rule => rule.id === ruleId);
  }

  /**
   * Get all CLAUDE compliance rules
   */
  public getRules(): ValidationRule[] {
    return this.rules;
  }

  /**
   * Check if project meets CLAUDE.md standards
   */
  public assessCompliance(issues: ValidationIssue[]): {
    score: number;
    level: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    criticalIssues: ValidationIssue[];
    recommendations: string[];
  } {
    const claudeIssues = issues.filter(issue => issue.category === 'claude-compliance');
    const errors = claudeIssues.filter(issue => issue.severity === 'error');
    const warnings = claudeIssues.filter(issue => issue.severity === 'warning');

    // Calculate score
    let score = 100;
    score -= errors.length * 15; // 15 points per error
    score -= warnings.length * 5; // 5 points per warning
    score = Math.max(0, score);

    // Determine level
    let level: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    if (score >= 95) level = 'excellent';
    else if (score >= 80) level = 'good';
    else if (score >= 60) level = 'needs-improvement';
    else level = 'poor';

    // Get critical issues
    const criticalIssues = errors.filter(issue => 
      ['claude-button-min-height', 'claude-input-min-height', 'claude-no-any-types'].includes(issue.ruleId)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (errors.length > 0) {
      recommendations.push('Fix all error-level CLAUDE.md compliance issues immediately');
    }
    if (warnings.length > 0) {
      recommendations.push('Address warning-level issues to improve code quality');
    }
    if (criticalIssues.length === 0 && score >= 90) {
      recommendations.push('Excellent CLAUDE.md compliance! Keep up the good work.');
    }

    return {
      score,
      level,
      criticalIssues,
      recommendations
    };
  }
}

export function createCLAUDEComplianceValidator(): CLAUDEComplianceValidator {
  return new CLAUDEComplianceValidator();
}
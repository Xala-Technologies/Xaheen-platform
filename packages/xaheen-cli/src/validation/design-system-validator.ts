/**
 * Design System Usage Validator
 * 
 * Validates proper usage of @xaheen-ai/design-system:
 * - Correct imports from design system
 * - Usage of design system components
 * - Consistent component patterns
 * - Design token usage
 * - Theme compliance
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { ValidationRule, ValidationIssue, ValidationContext } from './comprehensive-validator';
import { createASTAnalyzer } from './ast-analyzer';
import * as path from 'path';
import * as fs from 'fs-extra';

// =============================================================================
// DESIGN SYSTEM CONFIGURATION
// =============================================================================

interface DesignSystemConfig {
  readonly packageName: string;
  readonly requiredComponents: string[];
  readonly deprecatedComponents: string[];
  readonly designTokens: DesignTokenConfig;
  readonly importPatterns: ImportPattern[];
}

interface DesignTokenConfig {
  readonly colors: string[];
  readonly spacing: string[];
  readonly typography: string[];
  readonly shadows: string[];
}

interface ImportPattern {
  readonly pattern: RegExp;
  readonly recommendation: string;
}

const DESIGN_SYSTEM_CONFIG: DesignSystemConfig = {
  packageName: '@xaheen-ai/design-system',
  requiredComponents: ['Button', 'Input', 'Card', 'Modal', 'Form', 'Layout'],
  deprecatedComponents: ['OldButton', 'LegacyInput'],
  designTokens: {
    colors: ['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error'],
    spacing: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    typography: ['heading', 'body', 'caption', 'overline'],
    shadows: ['sm', 'md', 'lg', 'xl', '2xl']
  },
  importPatterns: [
    {
      pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"]@xaheen\/design-system['"]/,
      recommendation: 'Use named imports instead of namespace imports for better tree shaking'
    },
    {
      pattern: /import\s+.+\s+from\s+['"]@xaheen\/design-system\/dist\/.+['"]/,
      recommendation: 'Import from package root instead of dist directory'
    }
  ]
};

// =============================================================================
// DESIGN SYSTEM VALIDATION RULES
// =============================================================================

export const designSystemRules: ValidationRule[] = [
  // Design system import validation
  {
    id: 'design-system-imports',
    name: 'Design System Import Validation',
    category: 'design-system',
    severity: 'error',
    description: 'Components must import from @xaheen-ai/design-system when using design system components',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for design system component usage
      const componentUsageRegex = new RegExp(
        `<(${DESIGN_SYSTEM_CONFIG.requiredComponents.join('|')})(?:\\s|>|\\/)`,
        'g'
      );
      
      const hasDesignSystemImport = new RegExp(
        `import.*from\\s+['"]${DESIGN_SYSTEM_CONFIG.packageName}['"]`
      ).test(sourceCode);
      
      let match;
      const usedComponents = new Set<string>();
      
      while ((match = componentUsageRegex.exec(sourceCode)) !== null) {
        usedComponents.add(match[1]);
      }
      
      if (usedComponents.size > 0 && !hasDesignSystemImport) {
        const lineNumber = 1;
        const componentsArray = Array.from(usedComponents);
        
        issues.push({
          ruleId: 'design-system-imports',
          message: `Using design system components (${componentsArray.join(', ')}) without proper import`,
          severity: 'error',
          line: lineNumber,
          file: filePath,
          category: 'design-system',
          fix: {
            description: 'Add design system import',
            oldText: '',
            newText: `import { ${componentsArray.join(', ')} } from '${DESIGN_SYSTEM_CONFIG.packageName}';\n`
          }
        });
      }
      
      // Check for deprecated component usage
      const deprecatedRegex = new RegExp(
        `<(${DESIGN_SYSTEM_CONFIG.deprecatedComponents.join('|')})(?:\\s|>|\\/)`,
        'g'
      );
      
      while ((match = deprecatedRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const componentName = match[1];
        
        issues.push({
          ruleId: 'design-system-imports',
          message: `Component '${componentName}' is deprecated - use updated design system component`,
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'design-system'
        });
      }
      
      return issues;
    },
    autofix: (sourceCode: string, issues: ValidationIssue[]): string => {
      let fixed = sourceCode;
      
      for (const issue of issues) {
        if (issue.fix && issue.severity === 'error') {
          // Add import at the top of the file
          const lines = fixed.split('\n');
          const firstImportIndex = lines.findIndex(line => line.trim().startsWith('import'));
          
          if (firstImportIndex !== -1) {
            lines.splice(firstImportIndex, 0, issue.fix.newText.trim());
          } else {
            lines.unshift(issue.fix.newText.trim());
          }
          
          fixed = lines.join('\n');
        }
      }
      
      return fixed;
    }
  },

  // Hardcoded values validation
  {
    id: 'design-system-no-hardcoded-values',
    name: 'No Hardcoded Design Values',
    category: 'design-system',
    severity: 'warning',
    description: 'Avoid hardcoded colors, spacing, and other design values - use design tokens',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for hardcoded colors
      const colorPatterns = [
        { regex: /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/, type: 'hex color' },
        { regex: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/, type: 'RGB color' },
        { regex: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/, type: 'RGBA color' },
        { regex: /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/, type: 'HSL color' }
      ];
      
      for (const pattern of colorPatterns) {
        let match;
        while ((match = pattern.regex.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          const columnNumber = match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1;
          
          // Skip if it's in a comment
          const line = sourceCode.split('\n')[lineNumber - 1];
          if (line.substring(0, columnNumber).includes('//') || 
              line.substring(0, columnNumber).includes('/*')) {
            continue;
          }
          
          issues.push({
            ruleId: 'design-system-no-hardcoded-values',
            message: `Hardcoded ${pattern.type} found: '${match[0]}' - use design tokens instead`,
            severity: 'warning',
            line: lineNumber,
            column: columnNumber,
            file: filePath,
            category: 'design-system'
          });
        }
      }
      
      // Check for hardcoded spacing in inline styles
      const spacingRegex = /(?:padding|margin|gap|top|right|bottom|left|width|height):\s*\d+px/g;
      let match;
      
      while ((match = spacingRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        issues.push({
          ruleId: 'design-system-no-hardcoded-values',
          message: `Hardcoded spacing value: '${match[0]}' - use design system spacing tokens`,
          severity: 'warning',
          line: lineNumber,
          file: filePath,
          category: 'design-system'
        });
      }
      
      return issues;
    }
  },

  // Theme consistency validation
  {
    id: 'design-system-theme-consistency',
    name: 'Theme Consistency',
    category: 'design-system',
    severity: 'warning',
    description: 'Ensure consistent theme usage across components',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for mixed theme approaches
      const tailwindThemeRegex = /(?:bg-|text-|border-)(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/g;
      const cssVariableRegex = /var\(--[\w-]+\)/g;
      
      const hasTailwindTheme = tailwindThemeRegex.test(sourceCode);
      const hasCSSVariables = cssVariableRegex.test(sourceCode);
      
      if (hasTailwindTheme && hasCSSVariables) {
        issues.push({
          ruleId: 'design-system-theme-consistency',
          message: 'Mixed theme approaches detected - use either Tailwind theme classes OR CSS variables consistently',
          severity: 'warning',
          line: 1,
          file: filePath,
          category: 'design-system'
        });
      }
      
      // Check for inconsistent color usage
      const colorMatches = Array.from(sourceCode.matchAll(tailwindThemeRegex));
      const colorFamilies = new Set<string>();
      
      for (const match of colorMatches) {
        const colorFamily = match[1];
        colorFamilies.add(colorFamily);
      }
      
      if (colorFamilies.size > 3) {
        issues.push({
          ruleId: 'design-system-theme-consistency',
          message: `Using many color families (${Array.from(colorFamilies).join(', ')}) - consider limiting to 2-3 for consistency`,
          severity: 'info',
          line: 1,
          file: filePath,
          category: 'design-system'
        });
      }
      
      return issues;
    }
  },

  // Component composition validation
  {
    id: 'design-system-component-composition',
    name: 'Proper Component Composition',
    category: 'design-system',
    severity: 'warning',
    description: 'Use design system components instead of recreating similar functionality',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for custom button implementations when Button component exists
      const customButtonRegex = /<(?:div|span|a)[^>]*(?:onClick|onPress)[^>]*(?:role=["']button["']|cursor-pointer)/g;
      const hasButtonImport = sourceCode.includes('Button') && 
                             sourceCode.includes(DESIGN_SYSTEM_CONFIG.packageName);
      
      let match;
      while ((match = customButtonRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        if (!hasButtonImport) {
          issues.push({
            ruleId: 'design-system-component-composition',
            message: 'Custom button implementation detected - consider using design system Button component',
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'design-system',
            fix: {
              description: 'Import and use Button component from design system',
              oldText: match[0],
              newText: '<Button'
            }
          });
        }
      }
      
      // Check for custom input implementations
      const customInputRegex = /<(?:div|span)[^>]*(?:contentEditable|tabIndex)[^>]*>/g;
      const hasInputImport = sourceCode.includes('Input') && 
                           sourceCode.includes(DESIGN_SYSTEM_CONFIG.packageName);
      
      while ((match = customInputRegex.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        
        if (!hasInputImport) {
          issues.push({
            ruleId: 'design-system-component-composition',
            message: 'Custom input implementation detected - consider using design system Input component',
            severity: 'info',
            line: lineNumber,
            file: filePath,
            category: 'design-system'
          });
        }
      }
      
      return issues;
    }
  },

  // Import pattern validation
  {
    id: 'design-system-import-patterns',
    name: 'Import Pattern Best Practices',
    category: 'design-system',
    severity: 'warning',
    description: 'Follow best practices for importing design system components',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      for (const pattern of DESIGN_SYSTEM_CONFIG.importPatterns) {
        const match = pattern.pattern.exec(sourceCode);
        if (match) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          
          issues.push({
            ruleId: 'design-system-import-patterns',
            message: pattern.recommendation,
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'design-system'
          });
        }
      }
      
      return issues;
    }
  },

  // Design system version compatibility
  {
    id: 'design-system-version-compatibility',
    name: 'Design System Version Compatibility',
    category: 'design-system',
    severity: 'error',
    description: 'Ensure compatibility with current design system version',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for usage of removed APIs or props
      const removedAPIs = [
        { pattern: /variant=["']legacy["']/, message: 'legacy variant has been removed - use default variant' },
        { pattern: /size=["']xs["']/, message: 'xs size has been removed - use sm as minimum size' },
        { pattern: /colorScheme=/, message: 'colorScheme prop has been renamed to color' },
      ];
      
      for (const api of removedAPIs) {
        let match;
        while ((match = api.pattern.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          
          issues.push({
            ruleId: 'design-system-version-compatibility',
            message: api.message,
            severity: 'error',
            line: lineNumber,
            file: filePath,
            category: 'design-system'
          });
        }
      }
      
      return issues;
    }
  }
];

// =============================================================================
// DESIGN SYSTEM VALIDATOR CLASS
// =============================================================================

export class DesignSystemValidator {
  private rules: ValidationRule[];
  private config: DesignSystemConfig;

  constructor() {
    this.rules = designSystemRules;
    this.config = DESIGN_SYSTEM_CONFIG;
  }

  /**
   * Validate design system usage in file
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
          message: `Design system rule validation failed: ${error.message}`,
          severity: 'error',
          file: filePath,
          category: 'design-system'
        });
      }
    }

    return allIssues;
  }

  /**
   * Check if project has design system dependency
   */
  public async checkDesignSystemInstallation(projectPath: string): Promise<{
    installed: boolean;
    version?: string;
    issues: string[];
  }> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!(await fs.pathExists(packageJsonPath))) {
      return {
        installed: false,
        issues: ['package.json not found']
      };
    }

    try {
      const packageJson = await fs.readJSON(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies[this.config.packageName]) {
        return {
          installed: true,
          version: dependencies[this.config.packageName],
          issues: []
        };
      } else {
        return {
          installed: false,
          issues: [`${this.config.packageName} not found in dependencies`]
        };
      }
    } catch (error) {
      return {
        installed: false,
        issues: [`Failed to read package.json: ${error.message}`]
      };
    }
  }

  /**
   * Analyze design system usage patterns
   */
  public analyzeUsagePatterns(issues: ValidationIssue[]): {
    importScore: number;
    compositionScore: number;
    consistencyScore: number;
    overallScore: number;
    patterns: {
      properImports: number;
      hardcodedValues: number;
      componentComposition: number;
      themeConsistency: number;
    };
  } {
    const designSystemIssues = issues.filter(issue => issue.category === 'design-system');
    
    const patterns = {
      properImports: designSystemIssues.filter(i => i.ruleId === 'design-system-imports').length,
      hardcodedValues: designSystemIssues.filter(i => i.ruleId === 'design-system-no-hardcoded-values').length,
      componentComposition: designSystemIssues.filter(i => i.ruleId === 'design-system-component-composition').length,
      themeConsistency: designSystemIssues.filter(i => i.ruleId === 'design-system-theme-consistency').length
    };

    // Calculate scores
    const importScore = Math.max(0, 100 - (patterns.properImports * 20));
    const compositionScore = Math.max(0, 100 - (patterns.componentComposition * 15));
    const consistencyScore = Math.max(0, 100 - (patterns.themeConsistency * 10 + patterns.hardcodedValues * 5));
    const overallScore = Math.round((importScore + compositionScore + consistencyScore) / 3);

    return {
      importScore,
      compositionScore,
      consistencyScore,
      overallScore,
      patterns
    };
  }

  /**
   * Generate recommendations for design system improvement
   */
  public generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    const designSystemIssues = issues.filter(issue => issue.category === 'design-system');
    
    const errorCount = designSystemIssues.filter(i => i.severity === 'error').length;
    const warningCount = designSystemIssues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`Fix ${errorCount} critical design system errors immediately`);
    }

    if (designSystemIssues.some(i => i.ruleId === 'design-system-imports')) {
      recommendations.push('Add proper imports from @xaheen-ai/design-system for better component usage');
    }

    if (designSystemIssues.some(i => i.ruleId === 'design-system-no-hardcoded-values')) {
      recommendations.push('Replace hardcoded values with design tokens for better maintainability');
    }

    if (designSystemIssues.some(i => i.ruleId === 'design-system-component-composition')) {
      recommendations.push('Use design system components instead of custom implementations');
    }

    if (warningCount > 0 && errorCount === 0) {
      recommendations.push('Address warning-level design system issues for improved consistency');
    }

    if (designSystemIssues.length === 0) {
      recommendations.push('Excellent design system usage! Your code follows best practices.');
    }

    return recommendations;
  }

  /**
   * Get design system configuration
   */
  public getConfig(): DesignSystemConfig {
    return this.config;
  }
}

export function createDesignSystemValidator(): DesignSystemValidator {
  return new DesignSystemValidator();
}
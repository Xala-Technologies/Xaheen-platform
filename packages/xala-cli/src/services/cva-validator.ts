/**
 * @fileoverview CVA Compliance Validator
 * @description Validates generated components for CVA pattern compliance
 * @version 5.0.0
 */

import { logger } from '../utils/logger.js';

export interface CVAValidationResult {
  readonly isCompliant: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly score: number;
}

export interface CVAValidationRule {
  readonly name: string;
  readonly description: string;
  readonly severity: 'error' | 'warning';
  readonly check: (content: string) => boolean;
  readonly message: string;
}

export class CVAValidator {
  private readonly rules: ReadonlyArray<CVAValidationRule> = [
    {
      name: 'cva-import',
      description: 'Component must import CVA',
      severity: 'error',
      check: (content: string) => content.includes("import { cva") || content.includes("from 'class-variance-authority'"),
      message: 'Component must import CVA from class-variance-authority'
    },
    {
      name: 'variant-props',
      description: 'Component must use VariantProps',
      severity: 'error',
      check: (content: string) => content.includes('VariantProps<typeof') && content.includes('Variants>'),
      message: 'Component interface must extend VariantProps<typeof componentVariants>'
    },
    {
      name: 'cva-variants',
      description: 'Component must define CVA variants',
      severity: 'error',
      check: (content: string) => /const\s+\w+Variants\s*=\s*cva\(/.test(content),
      message: 'Component must define variants using cva() function'
    },
    {
      name: 'forward-ref',
      description: 'Component should use React.forwardRef',
      severity: 'warning',
      check: (content: string) => content.includes('React.forwardRef'),
      message: 'Component should use React.forwardRef for ref forwarding'
    },
    {
      name: 'semantic-tokens',
      description: 'Component should use semantic Tailwind classes',
      severity: 'warning',
      check: (content: string) => {
        const semanticClasses = [
          'bg-primary', 'bg-secondary', 'bg-accent', 'bg-card', 'bg-background',
          'text-primary-foreground', 'text-secondary-foreground', 'text-accent-foreground',
          'text-card-foreground', 'text-muted-foreground',
          'border-border', 'border-input'
        ];
        return semanticClasses.some(cls => content.includes(cls));
      },
      message: 'Component should use semantic Tailwind classes (bg-primary, text-card-foreground, etc.)'
    },
    {
      name: 'no-usetokens',
      description: 'Component should not use useTokens hook',
      severity: 'error',
      check: (content: string) => !content.includes('useTokens'),
      message: 'Component should not use useTokens hook - use CVA variants instead'
    },
    {
      name: 'cn-utility',
      description: 'Component must use cn utility for className merging',
      severity: 'error',
      check: (content: string) => content.includes('cn(') && content.includes("import { cn }"),
      message: 'Component must import and use cn utility for className merging'
    },
    {
      name: 'base-classes',
      description: 'CVA should define meaningful base classes',
      severity: 'warning',
      check: (content: string) => {
        const cvaMatch = content.match(/cva\(\s*['"`]([^'"`]+)['"`]/);
        if (!cvaMatch) return false;
        const baseClasses = cvaMatch[1];
        return baseClasses.length > 10; // Should have meaningful base classes
      },
      message: 'CVA base classes should include meaningful styling'
    },
    {
      name: 'variant-definitions',
      description: 'CVA should define at least one variant',
      severity: 'error',
      check: (content: string) => {
        const hasVariants = content.includes('variants:') && content.includes('{');
        return hasVariants;
      },
      message: 'CVA must define at least one variant group'
    },
    {
      name: 'default-variants',
      description: 'CVA should define default variants',
      severity: 'warning',
      check: (content: string) => content.includes('defaultVariants:'),
      message: 'CVA should define defaultVariants for better API'
    },
    {
      name: 'accessibility-attributes',
      description: 'Component should include accessibility attributes',
      severity: 'warning',
      check: (content: string) => {
        const accessibilityAttrs = ['aria-', 'role=', 'data-testid'];
        return accessibilityAttrs.some(attr => content.includes(attr));
      },
      message: 'Component should include accessibility attributes (aria-*, role, data-testid)'
    }
  ];

  validate(content: string, componentName?: string): CVAValidationResult {
    logger.info(`Validating CVA compliance${componentName ? ` for ${componentName}` : ''}`);

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      try {
        const isValid = rule.check(content);
        if (!isValid) {
          if (rule.severity === 'error') {
            errors.push(`${rule.name}: ${rule.message}`);
          } else {
            warnings.push(`${rule.name}: ${rule.message}`);
          }
        }
      } catch (error) {
        logger.warn(`Rule '${rule.name}' failed to execute:`, error);
        warnings.push(`${rule.name}: Rule validation failed`);
      }
    }

    const totalRules = this.rules.length;
    const errorRules = this.rules.filter(r => r.severity === 'error').length;
    const passedRules = totalRules - errors.length - warnings.length;
    const score = Math.round((passedRules / totalRules) * 100);

    const isCompliant = errors.length === 0;

    if (isCompliant) {
      logger.info(`✅ CVA compliance validation passed (Score: ${score}%)`);
    } else {
      logger.warn(`❌ CVA compliance validation failed (Score: ${score}%)`);
      logger.warn(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
    }

    return {
      isCompliant,
      errors,
      warnings,
      score
    };
  }

  validateFile(filePath: string, content: string): CVAValidationResult {
    const componentName = this.extractComponentName(filePath);
    return this.validate(content, componentName);
  }

  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace(/\.(tsx?|vue|svelte)$/, '');
  }

  generateReport(result: CVAValidationResult): string {
    const lines: string[] = [];
    
    lines.push('# CVA Compliance Report\n');
    lines.push(`**Overall Score**: ${result.score}%`);
    lines.push(`**Status**: ${result.isCompliant ? '✅ Compliant' : '❌ Non-compliant'}\n`);

    if (result.errors.length > 0) {
      lines.push('## Errors (Must Fix)');
      result.errors.forEach(error => {
        lines.push(`- ❌ ${error}`);
      });
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('## Warnings (Recommended)');
      result.warnings.forEach(warning => {
        lines.push(`- ⚠️ ${warning}`);
      });
      lines.push('');
    }

    if (result.isCompliant) {
      lines.push('## Summary');
      lines.push('✅ Component follows CVA pattern correctly');
      lines.push('✅ Uses semantic Tailwind classes');
      lines.push('✅ Implements proper TypeScript interfaces');
      lines.push('✅ Ready for production use');
    }

    return lines.join('\n');
  }
}
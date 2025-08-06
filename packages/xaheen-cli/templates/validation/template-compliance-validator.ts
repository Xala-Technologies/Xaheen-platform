/**
 * Template Compliance Validator
 * Ensures all CLI templates follow CLAUDE.md standards and Norwegian NSM compliance
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export interface ComplianceResult {
  readonly isCompliant: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly score: number;
}

export interface ValidationConfig {
  readonly templatePath: string;
  readonly platform: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte';
  readonly strict?: boolean;
}

/**
 * CLAUDE.md Compliance Checker
 * Validates that templates follow all specified rules
 */
export class TemplateComplianceValidator {
  private readonly config: ValidationConfig;
  private readonly errors: string[] = [];
  private readonly warnings: string[] = [];

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Validates a template for full CLAUDE.md compliance
   */
  public async validate(): Promise<ComplianceResult> {
    try {
      // Reset state
      this.errors.length = 0;
      this.warnings.length = 0;

      // Run all validation checks
      await this.validatePackageJson();
      await this.validateTypeScriptConfig();
      await this.validateDesignSystemUsage();
      await this.validateClaudeMdCompliance();
      await this.validateNorwegianCompliance();
      await this.validateAccessibilityStandards();
      await this.validateComponentStructure();

      // Calculate compliance score
      const score = this.calculateComplianceScore();

      return {
        isCompliant: this.errors.length === 0,
        errors: [...this.errors],
        warnings: [...this.warnings],
        score
      };
    } catch (error) {
      this.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isCompliant: false,
        errors: [...this.errors],
        warnings: [...this.warnings],
        score: 0
      };
    }
  }

  /**
   * Validates package.json for correct dependencies and scripts
   */
  private async validatePackageJson(): Promise<void> {
    const packageJsonPath = join(this.config.templatePath, 'package.json.hbs');
    
    if (!existsSync(packageJsonPath)) {
      this.errors.push('package.json.hbs not found');
      return;
    }

    try {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const packageData = JSON.parse(content);

      // Check for @xaheen/design-system dependency
      if (!packageData.dependencies?.['@xaheen/design-system']) {
        this.errors.push('Missing @xaheen/design-system dependency');
      }

      // Check for Norwegian compliance dependencies
      const requiredNorwegianDeps = ['zod'];
      for (const dep of requiredNorwegianDeps) {
        if (!packageData.dependencies?.[dep] && !packageData.devDependencies?.[dep]) {
          this.errors.push(`Missing Norwegian compliance dependency: ${dep}`);
        }
      }

      // Check for accessibility dependencies
      const accessibilityDeps = ['eslint-plugin-jsx-a11y'];
      for (const dep of accessibilityDeps) {
        if (!packageData.devDependencies?.[dep]) {
          this.warnings.push(`Missing accessibility dependency: ${dep}`);
        }
      }

      // Check for test scripts
      if (!packageData.scripts?.test) {
        this.warnings.push('Missing test script');
      }

    } catch (error) {
      this.errors.push(`Invalid package.json: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  /**
   * Validates TypeScript configuration for strict compliance
   */
  private async validateTypeScriptConfig(): Promise<void> {
    const tsConfigPath = join(this.config.templatePath, 'tsconfig.json.hbs');
    
    if (!existsSync(tsConfigPath)) {
      this.errors.push('tsconfig.json.hbs not found');
      return;
    }

    try {
      const content = readFileSync(tsConfigPath, 'utf-8');
      const tsConfig = JSON.parse(content);

      // Check for strict mode
      if (!tsConfig.compilerOptions?.strict) {
        this.errors.push('TypeScript strict mode not enabled');
      }

      // Check for additional strict options
      const strictOptions = [
        'noImplicitAny',
        'noImplicitReturns',
        'noFallthroughCasesInSwitch'
      ];

      for (const option of strictOptions) {
        if (tsConfig.compilerOptions?.[option] === false) {
          this.warnings.push(`TypeScript strict option '${option}' is disabled`);
        }
      }

    } catch (error) {
      this.errors.push(`Invalid tsconfig.json: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  /**
   * Validates proper usage of @xaheen/design-system
   */
  private async validateDesignSystemUsage(): Promise<void> {
    const componentFiles = this.getComponentFiles();
    
    for (const filePath of componentFiles) {
      if (!existsSync(filePath)) continue;

      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for design system imports
        const hasDesignSystemImport = content.includes('@xaheen/design-system');
        
        if (!hasDesignSystemImport && this.hasUIComponents(content)) {
          this.errors.push(`${filePath}: Should use @xaheen/design-system components`);
        }

        // Check for old UI library imports
        const oldUILibraries = ['@xala-technologies/ui-system', 'antd', 'material-ui', '@mui'];
        for (const lib of oldUILibraries) {
          if (content.includes(lib)) {
            this.errors.push(`${filePath}: Should not use deprecated UI library: ${lib}`);
          }
        }

      } catch (error) {
        this.warnings.push(`Could not validate ${filePath}: ${error instanceof Error ? error.message : 'Read error'}`);
      }
    }
  }

  /**
   * Validates CLAUDE.md compliance rules
   */
  private async validateClaudeMdCompliance(): Promise<void> {
    const componentFiles = this.getComponentFiles();
    
    for (const filePath of componentFiles) {
      if (!existsSync(filePath)) continue;

      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for readonly interfaces
        if (content.includes('interface') && !content.includes('readonly')) {
          this.warnings.push(`${filePath}: Interfaces should use readonly properties`);
        }

        // Check for JSX.Element return types
        const functionMatches = content.match(/function\s+\w+\([^)]*\):\s*(\w+)/g);
        if (functionMatches) {
          for (const match of functionMatches) {
            if (!match.includes(': JSX.Element') && !match.includes(': React.ReactElement')) {
              this.warnings.push(`${filePath}: Functions should return JSX.Element`);
            }
          }
        }

        // Check for minimum button heights (h-12 or higher)
        const buttonClasses = content.match(/className="[^"]*h-\d+[^"]*"/g);
        if (buttonClasses) {
          for (const buttonClass of buttonClasses) {
            const heightMatch = buttonClass.match(/h-(\d+)/);
            if (heightMatch && parseInt(heightMatch[1]) < 12) {
              this.errors.push(`${filePath}: Buttons should have minimum height h-12`);
            }
          }
        }

        // Check for minimum input heights (h-14 or higher)
        const inputClasses = content.match(/input[^>]*className="[^"]*h-\d+[^"]*"/g);
        if (inputClasses) {
          for (const inputClass of inputClasses) {
            const heightMatch = inputClass.match(/h-(\d+)/);
            if (heightMatch && parseInt(heightMatch[1]) < 14) {
              this.errors.push(`${filePath}: Inputs should have minimum height h-14`);
            }
          }
        }

        // Check for 'any' type usage
        if (content.includes(': any') || content.includes('<any>')) {
          this.errors.push(`${filePath}: Should not use 'any' types`);
        }

        // Check for proper error handling
        if (content.includes('try') && !content.includes('catch')) {
          this.warnings.push(`${filePath}: Try blocks should have catch handlers`);
        }

      } catch (error) {
        this.warnings.push(`Could not validate ${filePath}: ${error instanceof Error ? error.message : 'Read error'}`);
      }
    }
  }

  /**
   * Validates Norwegian NSM compliance features
   */
  private async validateNorwegianCompliance(): Promise<void> {
    const componentFiles = this.getComponentFiles();
    let hasNorwegianFeatures = false;
    
    for (const filePath of componentFiles) {
      if (!existsSync(filePath)) continue;

      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for Norwegian phone validation
        if (content.includes('norwegianPhone') || content.includes('47') || content.includes('Norge')) {
          hasNorwegianFeatures = true;
        }

        // Check for NSM classification
        if (content.includes('NSM') || content.includes('nsmClassification')) {
          hasNorwegianFeatures = true;
        }

        // Check for Norwegian postal code validation
        if (content.includes('postalCode') && content.includes('\\d{4}')) {
          hasNorwegianFeatures = true;
        }

        // Check for Norwegian language support
        if (content.includes('nb-NO') || content.includes('Fornavn') || content.includes('Etternavn')) {
          hasNorwegianFeatures = true;
        }

      } catch (error) {
        this.warnings.push(`Could not validate ${filePath}: ${error instanceof Error ? error.message : 'Read error'}`);
      }
    }

    if (!hasNorwegianFeatures) {
      this.warnings.push('No Norwegian compliance features detected');
    }
  }

  /**
   * Validates WCAG AAA accessibility standards
   */
  private async validateAccessibilityStandards(): Promise<void> {
    const componentFiles = this.getComponentFiles();
    
    for (const filePath of componentFiles) {
      if (!existsSync(filePath)) continue;

      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for aria-label usage
        if (content.includes('<button') && !content.includes('aria-label')) {
          this.warnings.push(`${filePath}: Buttons should have aria-label attributes`);
        }

        // Check for form label associations
        if (content.includes('<input') && !content.includes('htmlFor') && !content.includes('for=')) {
          this.warnings.push(`${filePath}: Form inputs should have associated labels`);
        }

        // Check for role attributes on alerts
        if (content.includes('error') && !content.includes('role="alert"')) {
          this.warnings.push(`${filePath}: Error messages should have role="alert"`);
        }

        // Check for focus management
        if (content.includes('focus:') || content.includes('focus-')) {
          // Good - has focus styles
        } else if (content.includes('button') || content.includes('input')) {
          this.warnings.push(`${filePath}: Interactive elements should have focus styles`);
        }

        // Check for semantic HTML
        if (content.includes('<div') && content.includes('onClick') && !content.includes('button')) {
          this.warnings.push(`${filePath}: Use semantic button elements instead of div with onClick`);
        }

      } catch (error) {
        this.warnings.push(`Could not validate ${filePath}: ${error instanceof Error ? error.message : 'Read error'}`);
      }
    }
  }

  /**
   * Validates component structure and patterns
   */
  private async validateComponentStructure(): Promise<void> {
    const componentFiles = this.getComponentFiles();
    
    for (const filePath of componentFiles) {
      if (!existsSync(filePath)) continue;

      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for proper component export
        if (!content.includes('export') || (!content.includes('function') && !content.includes('const') && !content.includes('class'))) {
          this.warnings.push(`${filePath}: Should export a component`);
        }

        // Check for TypeScript usage
        if (!filePath.includes('.ts') && !content.includes('lang="ts"') && !content.includes('script setup lang="ts"')) {
          this.errors.push(`${filePath}: Should use TypeScript`);
        }

        // Check for proper prop typing
        if (content.includes('props') && !content.includes('interface') && !content.includes('type')) {
          this.warnings.push(`${filePath}: Props should be properly typed`);
        }

      } catch (error) {
        this.warnings.push(`Could not validate ${filePath}: ${error instanceof Error ? error.message : 'Read error'}`);
      }
    }
  }

  /**
   * Gets list of component files to validate
   */
  private getComponentFiles(): string[] {
    const files: string[] = [];
    const basePath = this.config.templatePath;

    switch (this.config.platform) {
      case 'react':
        files.push(
          join(basePath, 'src/App.tsx.hbs'),
          join(basePath, 'src/components/UserProfileForm.tsx.hbs')
        );
        break;
      case 'nextjs':
        files.push(
          join(basePath, 'src/app/page.tsx.hbs'),
          join(basePath, 'src/components/UserProfileForm.tsx.hbs')
        );
        break;
      case 'vue':
        files.push(
          join(basePath, 'src/App.vue.hbs'),
          join(basePath, 'src/views/HomePage.vue.hbs'),
          join(basePath, 'src/components/UserProfileForm.vue.hbs')
        );
        break;
      case 'angular':
        files.push(
          join(basePath, 'src/app/app.component.ts.hbs'),
          join(basePath, 'src/app/pages/home/home.component.ts.hbs'),
          join(basePath, 'src/app/components/user-profile-form/user-profile-form.component.ts.hbs')
        );
        break;
      case 'svelte':
        files.push(
          join(basePath, 'src/routes/+page.svelte.hbs'),
          join(basePath, 'src/lib/components/UserProfileForm.svelte.hbs')
        );
        break;
    }

    return files;
  }

  /**
   * Checks if content contains UI components
   */
  private hasUIComponents(content: string): boolean {
    const uiPatterns = [
      'Button',
      'Input',
      'Card',
      'Modal',
      'Dialog',
      '<button',
      '<input',
      'className'
    ];

    return uiPatterns.some(pattern => content.includes(pattern));
  }

  /**
   * Calculates compliance score (0-100)
   */
  private calculateComplianceScore(): number {
    const totalChecks = 20; // Approximate number of checks
    const errorWeight = 3;
    const warningWeight = 1;
    
    const deductions = (this.errors.length * errorWeight) + (this.warnings.length * warningWeight);
    const score = Math.max(0, 100 - (deductions * (100 / totalChecks)));
    
    return Math.round(score);
  }
}

/**
 * Utility function to validate all templates
 */
export async function validateAllTemplates(templatesPath: string): Promise<Record<string, ComplianceResult>> {
  const platforms: Array<ValidationConfig['platform']> = ['react', 'nextjs', 'vue', 'angular', 'svelte'];
  const results: Record<string, ComplianceResult> = {};

  for (const platform of platforms) {
    const templatePath = join(templatesPath, 'frontend', platform);
    const validator = new TemplateComplianceValidator({
      templatePath,
      platform,
      strict: true
    });

    results[platform] = await validator.validate();
  }

  return results;
}

/**
 * Validates a single template
 */
export async function validateTemplate(
  templatePath: string,
  platform: ValidationConfig['platform']
): Promise<ComplianceResult> {
  const validator = new TemplateComplianceValidator({
    templatePath,
    platform,
    strict: true
  });

  return await validator.validate();
}

/**
 * Prints validation results in a readable format
 */
export function printValidationResults(results: Record<string, ComplianceResult>): void {
  console.log('\n🔍 Template Compliance Validation Results\n');
  console.log('=' .repeat(50));

  for (const [platform, result] of Object.entries(results)) {
    const status = result.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT';
    const score = `${result.score}/100`;
    
    console.log(`\n${platform.toUpperCase()}: ${status} (Score: ${score})`);
    
    if (result.errors.length > 0) {
      console.log('\n  ❌ Errors:');
      result.errors.forEach(error => console.log(`    • ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n  ⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`    • ${warning}`));
    }
    
    console.log('-'.repeat(40));
  }

  const overallScore = Math.round(
    Object.values(results).reduce((sum, result) => sum + result.score, 0) / Object.values(results).length
  );
  
  const allCompliant = Object.values(results).every(result => result.isCompliant);
  const overallStatus = allCompliant ? '✅ ALL TEMPLATES COMPLIANT' : '❌ SOME TEMPLATES NON-COMPLIANT';
  
  console.log(`\n📊 Overall Status: ${overallStatus}`);
  console.log(`📈 Average Score: ${overallScore}/100`);
  console.log('\n' + '='.repeat(50));
}
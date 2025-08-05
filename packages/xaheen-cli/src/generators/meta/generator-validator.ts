/**
 * Generator Validator - Comprehensive validation system for generators
 * Validates syntax, dependencies, performance, security, and compliance
 */
import { promises as fs } from 'fs';
import path from 'path';
import { 
  GeneratorMetadata, 
  GeneratorRegistryEntry, 
  GeneratorTemplate,
  SecurityVulnerability
} from './types';
import { BaseGenerator } from '../base.generator';
import chalk from 'chalk';

export interface ValidationResult {
  readonly valid: boolean;
  readonly score: number; // 0-100
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly suggestions: readonly ValidationSuggestion[];
  readonly metrics: ValidationMetrics;
}

export interface ValidationError {
  readonly category: ValidationCategory;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly message: string;
  readonly location?: string;
  readonly line?: number;
  readonly column?: number;
  readonly fix?: string;
}

export interface ValidationWarning {
  readonly category: ValidationCategory;
  readonly message: string;
  readonly location?: string;
  readonly suggestion?: string;
}

export interface ValidationSuggestion {
  readonly category: ValidationCategory;
  readonly message: string;
  readonly impact: 'performance' | 'maintainability' | 'security' | 'usability';
  readonly effort: 'low' | 'medium' | 'high';
}

export type ValidationCategory = 
  | 'syntax'
  | 'structure'
  | 'dependencies'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'i18n'
  | 'documentation'
  | 'testing'
  | 'compliance';

export interface ValidationMetrics {
  readonly codeQuality: number;
  readonly testCoverage: number;
  readonly documentationCoverage: number;
  readonly performanceScore: number;
  readonly securityScore: number;
  readonly accessibilityScore: number;
  readonly i18nScore: number;
  readonly complexityScore: number;
}

export interface ValidationRules {
  readonly syntax: SyntaxRules;
  readonly structure: StructureRules;
  readonly dependencies: DependencyRules;
  readonly performance: PerformanceRules;
  readonly security: SecurityRules;
  readonly accessibility: AccessibilityRules;
  readonly i18n: I18nRules;
  readonly documentation: DocumentationRules;
  readonly testing: TestingRules;
  readonly compliance: ComplianceRules;
}

export interface SyntaxRules {
  readonly strictTypeScript: boolean;
  readonly noAnyTypes: boolean;
  readonly explicitReturnTypes: boolean;
  readonly consistentNaming: boolean;
  readonly eslintCompliance: boolean;
}

export interface StructureRules {
  readonly consistentFileNaming: boolean;
  readonly properDirectoryStructure: boolean;
  readonly separationOfConcerns: boolean;
  readonly componentSizeLimit: number; // lines of code
  readonly functionComplexityLimit: number;
}

export interface DependencyRules {
  readonly noPeerDependencyConflicts: boolean;
  readonly secureVersionRanges: boolean;
  readonly noDeprecatedPackages: boolean;
  readonly licenseCompatibility: boolean;
  readonly minimumVersions: Record<string, string>;
}

export interface PerformanceRules {
  readonly bundleSizeLimit: number; // KB
  readonly renderTimeLimit: number; // ms
  readonly memoryUsageLimit: number; // MB
  readonly noMemoryLeaks: boolean;
  readonly efficientReRenders: boolean;
}

export interface SecurityRules {
  readonly noHardcodedSecrets: boolean;
  readonly sanitizedInputs: boolean;
  readonly secureDefaults: boolean;
  readonly noXSSVulnerabilities: boolean;
  readonly dependencyVulnerabilities: boolean;
}

export interface AccessibilityRules {
  readonly wcagAACompliance: boolean;
  readonly semanticHTML: boolean;
  readonly keyboardNavigation: boolean;
  readonly screenReaderSupport: boolean;
  readonly colorContrastRatios: boolean;
}

export interface I18nRules {
  readonly norwegianSupport: boolean;
  readonly properTextExtraction: boolean;
  readonly dateTimeLocalization: boolean;
  readonly numberFormatting: boolean;
  readonly rightToLeftSupport: boolean;
}

export interface DocumentationRules {
  readonly readmePresent: boolean;
  readonly apiDocumentation: boolean;
  readonly usageExamples: boolean;
  readonly changelogMaintained: boolean;
  readonly codeComments: boolean;
}

export interface TestingRules {
  readonly minimumCoverage: number; // percentage
  readonly unitTestsPresent: boolean;
  readonly integrationTestsPresent: boolean;
  readonly e2eTestsPresent: boolean;
  readonly accessibilityTestsPresent: boolean;
}

export interface ComplianceRules {
  readonly gdprCompliance: boolean;
  readonly nsmSecurityStandards: boolean;
  readonly bankingRegulations: boolean;
  readonly dataProtection: boolean;
  readonly auditTrails: boolean;
}

export class GeneratorValidator {
  private defaultRules: ValidationRules;

  constructor(customRules?: Partial<ValidationRules>) {
    this.defaultRules = {
      syntax: {
        strictTypeScript: true,
        noAnyTypes: true,
        explicitReturnTypes: true,
        consistentNaming: true,
        eslintCompliance: true
      },
      structure: {
        consistentFileNaming: true,
        properDirectoryStructure: true,
        separationOfConcerns: true,
        componentSizeLimit: 300,
        functionComplexityLimit: 10
      },
      dependencies: {
        noPeerDependencyConflicts: true,
        secureVersionRanges: true,
        noDeprecatedPackages: true,
        licenseCompatibility: true,
        minimumVersions: {
          'react': '^18.0.0',
          'typescript': '^5.0.0',
          'next': '^14.0.0'
        }
      },
      performance: {
        bundleSizeLimit: 100,
        renderTimeLimit: 16,
        memoryUsageLimit: 50,
        noMemoryLeaks: true,
        efficientReRenders: true
      },
      security: {
        noHardcodedSecrets: true,
        sanitizedInputs: true,
        secureDefaults: true,
        noXSSVulnerabilities: true,
        dependencyVulnerabilities: true
      },
      accessibility: {
        wcagAACompliance: true,
        semanticHTML: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        colorContrastRatios: true
      },
      i18n: {
        norwegianSupport: true,
        properTextExtraction: true,
        dateTimeLocalization: true,
        numberFormatting: true,
        rightToLeftSupport: true
      },
      documentation: {
        readmePresent: true,
        apiDocumentation: true,
        usageExamples: true,
        changelogMaintained: true,
        codeComments: true
      },
      testing: {
        minimumCoverage: 80,
        unitTestsPresent: true,
        integrationTestsPresent: true,
        e2eTestsPresent: false,
        accessibilityTestsPresent: true
      },
      compliance: {
        gdprCompliance: true,
        nsmSecurityStandards: true,
        bankingRegulations: false,
        dataProtection: true,
        auditTrails: false
      },
      ...customRules
    };
  }

  /**
   * Validate a complete generator registry entry
   */
  async validateGenerator(
    entry: GeneratorRegistryEntry,
    rules: Partial<ValidationRules> = {}
  ): Promise<ValidationResult> {
    const validationRules = { ...this.defaultRules, ...rules };
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    console.log(`🔍 Validating generator: ${chalk.cyan(entry.metadata.name)}`);

    // Validate metadata
    const metadataResult = await this.validateMetadata(entry.metadata, validationRules);
    errors.push(...metadataResult.errors);
    warnings.push(...metadataResult.warnings);
    suggestions.push(...metadataResult.suggestions);

    // Validate implementation
    const implementationResult = await this.validateImplementation(entry.implementation, validationRules);
    errors.push(...implementationResult.errors);
    warnings.push(...implementationResult.warnings);
    suggestions.push(...implementationResult.suggestions);

    // Validate templates
    const templatesResult = await this.validateTemplates(entry.templates, validationRules);
    errors.push(...templatesResult.errors);
    warnings.push(...templatesResult.warnings);
    suggestions.push(...templatesResult.suggestions);

    // Validate tests
    const testsResult = await this.validateTests(entry.tests, validationRules);
    errors.push(...testsResult.errors);
    warnings.push(...testsResult.warnings);
    suggestions.push(...testsResult.suggestions);

    // Validate documentation
    const docsResult = await this.validateDocumentation(entry.documentation, validationRules);
    errors.push(...docsResult.errors);
    warnings.push(...docsResult.warnings);
    suggestions.push(...docsResult.suggestions);

    // Validate security
    const securityResult = await this.validateSecurity(entry, validationRules);
    errors.push(...securityResult.errors);
    warnings.push(...securityResult.warnings);
    suggestions.push(...securityResult.suggestions);

    // Calculate metrics
    const metrics = this.calculateMetrics(entry, errors, warnings, suggestions);

    // Calculate overall score
    const score = this.calculateOverallScore(metrics, errors, warnings);

    const result: ValidationResult = {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      score,
      errors,
      warnings,
      suggestions,
      metrics
    };

    this.logValidationResult(result, entry.metadata.name);

    return result;
  }

  /**
   * Validate generator metadata
   */
  private async validateMetadata(
    metadata: GeneratorMetadata,
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Required fields validation
    if (!metadata.id) {
      errors.push({
        category: 'structure',
        severity: 'critical',
        message: 'Generator ID is required',
        fix: 'Add a unique generator ID'
      });
    }

    if (!metadata.name) {
      errors.push({
        category: 'structure',
        severity: 'critical',
        message: 'Generator name is required',
        fix: 'Add a descriptive generator name'
      });
    }

    if (!metadata.version) {
      errors.push({
        category: 'structure',
        severity: 'critical',
        message: 'Generator version is required',
        fix: 'Add semantic version (e.g., 1.0.0)'
      });
    }

    // Semantic versioning validation
    if (metadata.version && !this.isValidSemver(metadata.version)) {
      errors.push({
        category: 'structure',
        severity: 'high',
        message: 'Invalid semantic version format',
        fix: 'Use semantic versioning format (x.y.z)'
      });
    }

    // Description validation
    if (!metadata.description || metadata.description.length < 10) {
      warnings.push({
        category: 'documentation',
        message: 'Generator description should be more descriptive',
        suggestion: 'Add a detailed description explaining the generator purpose'
      });
    }

    // Tags validation
    if (metadata.tags.length === 0) {
      warnings.push({
        category: 'documentation',
        message: 'No tags specified for generator',
        suggestion: 'Add relevant tags for better discoverability'
      });
    }

    // License validation
    if (!metadata.license) {
      warnings.push({
        category: 'compliance',
        message: 'No license specified',
        suggestion: 'Specify a license for the generator'
      });
    }

    // Dependencies validation
    for (const dep of metadata.dependencies) {
      if (!this.isValidSemver(dep.version)) {
        errors.push({
          category: 'dependencies',
          severity: 'medium',
          message: `Invalid dependency version: ${dep.id}@${dep.version}`,
          fix: 'Use valid semantic version or range'
        });
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate generator implementation
   */
  private async validateImplementation(
    implementationPath: string,
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    try {
      // Check if implementation file exists
      await fs.access(implementationPath);

      // Read implementation content
      const content = await fs.readFile(implementationPath, 'utf-8');

      // Validate TypeScript syntax
      if (rules.syntax.strictTypeScript) {
        const syntaxErrors = await this.validateTypeScriptSyntax(content, implementationPath);
        errors.push(...syntaxErrors);
      }

      // Check for 'any' types
      if (rules.syntax.noAnyTypes && content.includes(': any')) {
        errors.push({
          category: 'syntax',
          severity: 'medium',
          message: 'Usage of "any" type detected',
          location: implementationPath,
          fix: 'Replace with specific types'
        });
      }

      // Check for proper exports
      if (!content.includes('export class') && !content.includes('export default')) {
        errors.push({
          category: 'structure',
          severity: 'high',
          message: 'No proper export found in implementation',
          location: implementationPath,
          fix: 'Add proper class export'
        });
      }

      // Check for BaseGenerator extension
      if (!content.includes('extends BaseGenerator')) {
        errors.push({
          category: 'structure',
          severity: 'high',
          message: 'Generator must extend BaseGenerator',
          location: implementationPath,
          fix: 'Extend BaseGenerator class'
        });
      }

      // Check file size
      if (content.length > rules.structure.componentSizeLimit * 100) {
        warnings.push({
          category: 'structure',
          message: 'Implementation file is very large',
          suggestion: 'Consider breaking into smaller modules'
        });
      }

      // Check for hardcoded secrets
      if (rules.security.noHardcodedSecrets) {
        const secretPatterns = [
          /password\s*=\s*["'](.+)["']/i,
          /api[_-]?key\s*=\s*["'](.+)["']/i,
          /secret\s*=\s*["'](.+)["']/i,
          /token\s*=\s*["'](.+)["']/i
        ];

        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            errors.push({
              category: 'security',
              severity: 'critical',
              message: 'Potential hardcoded secret detected',
              location: implementationPath,
              fix: 'Use environment variables or secure configuration'
            });
          }
        }
      }

    } catch (error: any) {
      errors.push({
        category: 'structure',
        severity: 'critical',
        message: `Implementation file not found: ${implementationPath}`,
        fix: 'Create the implementation file'
      });
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate generator templates
   */
  private async validateTemplates(
    templates: readonly GeneratorTemplate[],
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    if (templates.length === 0) {
      warnings.push({
        category: 'structure',
        message: 'No templates found for generator',
        suggestion: 'Add template files for code generation'
      });
    }

    for (const template of templates) {
      // Validate template syntax
      try {
        const Handlebars = (await import('handlebars')).default;
        Handlebars.compile(template.content);
      } catch (error: any) {
        errors.push({
          category: 'syntax',
          severity: 'high',
          message: `Invalid Handlebars syntax in template: ${template.name}`,
          location: template.path,
          fix: 'Fix Handlebars syntax errors'
        });
      }

      // Check for accessibility features in React templates
      if (rules.accessibility.wcagAACompliance && template.content.includes('React')) {
        if (!template.content.includes('aria-') && !template.content.includes('role=')) {
          warnings.push({
            category: 'accessibility',
            message: `Template ${template.name} may lack accessibility attributes`,
            suggestion: 'Add ARIA labels and roles for accessibility'
          });
        }
      }

      // Check for i18n support
      if (rules.i18n.norwegianSupport) {
        if (template.content.includes('"') && !template.content.includes('{{t ') && 
            !template.content.includes('norwegianText')) {
          suggestions.push({
            category: 'i18n',
            message: `Template ${template.name} may have hardcoded text`,
            impact: 'usability',
            effort: 'medium'
          });
        }
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate tests
   */
  private async validateTests(
    tests: readonly any[],
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    if (rules.testing.unitTestsPresent && tests.length === 0) {
      errors.push({
        category: 'testing',
        severity: 'medium',
        message: 'No tests found for generator',
        fix: 'Add unit tests for the generator'
      });
    }

    // Check for specific test types
    const hasUnitTests = tests.some(t => t.type === 'unit');
    const hasIntegrationTests = tests.some(t => t.type === 'integration');
    const hasAccessibilityTests = tests.some(t => t.type === 'accessibility');

    if (rules.testing.unitTestsPresent && !hasUnitTests) {
      warnings.push({
        category: 'testing',
        message: 'No unit tests found',
        suggestion: 'Add unit tests for better reliability'
      });
    }

    if (rules.testing.integrationTestsPresent && !hasIntegrationTests) {
      warnings.push({
        category: 'testing',
        message: 'No integration tests found',
        suggestion: 'Add integration tests for end-to-end validation'
      });
    }

    if (rules.testing.accessibilityTestsPresent && !hasAccessibilityTests) {
      suggestions.push({
        category: 'accessibility',
        message: 'No accessibility tests found',
        impact: 'accessibility',
        effort: 'medium'
      });
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate documentation
   */
  private async validateDocumentation(
    documentation: any,
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    if (rules.documentation.readmePresent && !documentation.readme) {
      warnings.push({
        category: 'documentation',
        message: 'No README documentation found',
        suggestion: 'Add README with usage instructions'
      });
    }

    if (rules.documentation.apiDocumentation && !documentation.apiReference) {
      warnings.push({
        category: 'documentation',
        message: 'No API documentation found',
        suggestion: 'Add API reference documentation'
      });
    }

    if (rules.documentation.usageExamples && !documentation.examples) {
      suggestions.push({
        category: 'documentation',
        message: 'No usage examples found',
        impact: 'usability',
        effort: 'low'
      });
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate security aspects
   */
  private async validateSecurity(
    entry: GeneratorRegistryEntry,
    rules: ValidationRules
  ): Promise<Pick<ValidationResult, 'errors' | 'warnings' | 'suggestions'>> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for known vulnerabilities
    for (const vulnerability of entry.security.vulnerabilities) {
      if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
        errors.push({
          category: 'security',
          severity: vulnerability.severity,
          message: `Security vulnerability: ${vulnerability.description}`,
          fix: vulnerability.fixedIn ? `Update to version ${vulnerability.fixedIn}` : 'Apply security patch'
        });
      } else {
        warnings.push({
          category: 'security',
          message: `Security warning: ${vulnerability.description}`,
          suggestion: vulnerability.fixedIn ? `Consider updating to version ${vulnerability.fixedIn}` : 'Review security implications'
        });
      }
    }

    // Check security rating
    if (entry.security.securityRating === 'D' || entry.security.securityRating === 'F') {
      errors.push({
        category: 'security',
        severity: 'high',
        message: `Poor security rating: ${entry.security.securityRating}`,
        fix: 'Address security issues to improve rating'
      });
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate TypeScript syntax
   */
  private async validateTypeScriptSyntax(
    content: string,
    filePath: string
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // This would use TypeScript compiler API in a real implementation
      // For now, we'll do basic checks
      
      // Check for basic syntax issues
      const brackets = content.match(/[{}]/g) || [];
      const openBrackets = brackets.filter(b => b === '{').length;
      const closeBrackets = brackets.filter(b => b === '}').length;
      
      if (openBrackets !== closeBrackets) {
        errors.push({
          category: 'syntax',
          severity: 'high',
          message: 'Mismatched brackets detected',
          location: filePath,
          fix: 'Balance opening and closing brackets'
        });
      }

      // Check for missing semicolons (basic check)
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && 
            !line.endsWith(';') && 
            !line.endsWith('{') && 
            !line.endsWith('}') &&
            !line.startsWith('//') &&
            !line.startsWith('/*') &&
            !line.includes('import ') &&
            !line.includes('export ')) {
          // This is a very basic check - real implementation would use TS compiler
        }
      }

    } catch (error: any) {
      errors.push({
        category: 'syntax',
        severity: 'critical',
        message: `TypeScript compilation error: ${error.message}`,
        location: filePath,
        fix: 'Fix TypeScript syntax errors'
      });
    }

    return errors;
  }

  /**
   * Calculate validation metrics
   */
  private calculateMetrics(
    entry: GeneratorRegistryEntry,
    errors: readonly ValidationError[],
    warnings: readonly ValidationWarning[],
    suggestions: readonly ValidationSuggestion[]
  ): ValidationMetrics {
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;
    const mediumErrors = errors.filter(e => e.severity === 'medium').length;
    const lowErrors = errors.filter(e => e.severity === 'low').length;

    // Code quality score (0-100)
    const codeQuality = Math.max(0, 100 - (criticalErrors * 25 + highErrors * 10 + mediumErrors * 5 + lowErrors * 2));

    // Test coverage (simplified)
    const testCoverage = entry.tests.length > 0 ? 80 : 0; // Would calculate real coverage

    // Documentation coverage
    const docFields = Object.values(entry.documentation).filter(Boolean).length;
    const documentationCoverage = (docFields / 6) * 100; // 6 doc fields total

    // Performance score (based on benchmarks if available)
    const performanceScore = entry.performance.benchmarks.length > 0 ? 85 : 50;

    // Security score (based on rating)
    const securityRatingMap = { 'A': 100, 'B': 80, 'C': 60, 'D': 40, 'F': 20 };
    const securityScore = securityRatingMap[entry.security.securityRating] || 50;

    // Accessibility score (based on accessibility-related errors/warnings)
    const accessibilityIssues = [...errors, ...warnings].filter(
      item => item.category === 'accessibility'
    ).length;
    const accessibilityScore = Math.max(0, 100 - (accessibilityIssues * 15));

    // i18n score (based on i18n-related issues)
    const i18nIssues = [...errors, ...warnings, ...suggestions].filter(
      item => item.category === 'i18n'
    ).length;
    const i18nScore = Math.max(0, 100 - (i18nIssues * 10));

    // Complexity score (simplified)
    const complexityScore = entry.templates.length > 10 ? 60 : 85;

    return {
      codeQuality,
      testCoverage,
      documentationCoverage,
      performanceScore,
      securityScore,
      accessibilityScore,
      i18nScore,
      complexityScore
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallScore(
    metrics: ValidationMetrics,
    errors: readonly ValidationError[],
    warnings: readonly ValidationWarning[]
  ): number {
    const weights = {
      codeQuality: 0.25,
      testCoverage: 0.15,
      documentationCoverage: 0.1,
      performanceScore: 0.15,
      securityScore: 0.2,
      accessibilityScore: 0.1,
      i18nScore: 0.05
    };

    const weightedScore = 
      metrics.codeQuality * weights.codeQuality +
      metrics.testCoverage * weights.testCoverage +
      metrics.documentationCoverage * weights.documentationCoverage +
      metrics.performanceScore * weights.performanceScore +
      metrics.securityScore * weights.securityScore +
      metrics.accessibilityScore * weights.accessibilityScore +
      metrics.i18nScore * weights.i18nScore;

    // Apply penalties for critical and high severity errors
    const criticalPenalty = errors.filter(e => e.severity === 'critical').length * 15;
    const highPenalty = errors.filter(e => e.severity === 'high').length * 8;
    const warningPenalty = warnings.length * 2;

    return Math.max(0, Math.round(weightedScore - criticalPenalty - highPenalty - warningPenalty));
  }

  /**
   * Check if version is valid semver
   */
  private isValidSemver(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Log validation results
   */
  private logValidationResult(result: ValidationResult, generatorName: string): void {
    console.log(`\n📊 Validation Results for ${chalk.cyan(generatorName)}:`);
    console.log(`   Overall Score: ${this.getScoreColor(result.score)}${result.score}/100${chalk.reset()}`);
    console.log(`   Status: ${result.valid ? chalk.green('✅ Valid') : chalk.red('❌ Invalid')}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors: ${chalk.red(result.errors.length)}`);
      result.errors.slice(0, 3).forEach(error => {
        console.log(`     • ${chalk.red(error.message)} (${error.severity})`);
      });
      if (result.errors.length > 3) {
        console.log(`     ... and ${result.errors.length - 3} more`);
      }
    }
    
    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${chalk.yellow(result.warnings.length)}`);
    }
    
    if (result.suggestions.length > 0) {
      console.log(`   Suggestions: ${chalk.blue(result.suggestions.length)}`);
    }

    console.log(`   Metrics:`);
    console.log(`     Code Quality: ${this.getScoreColor(result.metrics.codeQuality)}${result.metrics.codeQuality}%${chalk.reset()}`);
    console.log(`     Security: ${this.getScoreColor(result.metrics.securityScore)}${result.metrics.securityScore}%${chalk.reset()}`);
    console.log(`     Test Coverage: ${this.getScoreColor(result.metrics.testCoverage)}${result.metrics.testCoverage}%${chalk.reset()}`);
    console.log(`     Documentation: ${this.getScoreColor(result.metrics.documentationCoverage)}${result.metrics.documentationCoverage}%${chalk.reset()}`);
  }

  /**
   * Get color for score display
   */
  private getScoreColor(score: number): string {
    if (score >= 90) return chalk.green;
    if (score >= 70) return chalk.yellow;
    if (score >= 50) return chalk.orange;
    return chalk.red;
  }
}
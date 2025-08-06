/**
 * Comprehensive E2E Test Runner
 * 
 * Main entry point for running all end-to-end tests with comprehensive
 * validation of generated projects, design system integration, and compliance.
 */

import { consola } from 'consola';
import { E2ETestFramework } from './index.js';
import ProjectValidator from './validators/project-validation.js';
import CLAUDEComplianceValidator from './validators/claude-compliance-validation.js';
import DesignSystemValidator from './validators/design-system-validation.js';
import NSMComplianceValidator from './validators/nsm-compliance-validation.js';
import WCAGComplianceValidator from './validators/wcag-compliance-validation.js';
import type { E2ETestConfig, TestReport } from './types.js';

/**
 * Enhanced E2E Test Framework with integrated validators
 */
export class E2ETestRunner extends E2ETestFramework {
  private projectValidator: ProjectValidator;
  private claudeValidator: CLAUDEComplianceValidator;
  private designSystemValidator: DesignSystemValidator;
  private nsmValidator: NSMComplianceValidator;
  private wcagValidator: WCAGComplianceValidator;

  constructor(config: E2ETestConfig) {
    super(config);
    this.projectValidator = new ProjectValidator();
    this.claudeValidator = new CLAUDEComplianceValidator();
    this.designSystemValidator = new DesignSystemValidator();
    this.nsmValidator = new NSMComplianceValidator();
    this.wcagValidator = new WCAGComplianceValidator();
  }

  /**
   * Override validation methods to use actual validators
   */
  protected async validateProjectStructure(projectPath: string, scenario: any): Promise<any> {
    return await this.projectValidator.validateProjectStructure(projectPath, scenario);
  }

  protected async validateDesignSystemIntegration(projectPath: string): Promise<any> {
    return await this.designSystemValidator.validateDesignSystemIntegration(projectPath);
  }

  protected async validateClaudeCompliance(projectPath: string): Promise<any> {
    return await this.claudeValidator.validateClaudeCompliance(projectPath);
  }

  protected async validateNSMCompliance(projectPath: string): Promise<any> {
    return await this.nsmValidator.validateNSMCompliance(projectPath);
  }

  protected async validateWCAGCompliance(projectPath: string): Promise<any> {
    return await this.wcagValidator.validateWCAGCompliance(projectPath);
  }

  protected async validateCodeQuality(projectPath: string): Promise<any> {
    // Comprehensive code quality validation
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Run TypeScript type checking
      const tsValidation = await this.runTypeScriptValidation(projectPath);
      errors.push(...tsValidation.errors);
      warnings.push(...tsValidation.warnings);

      // Run linting
      const lintValidation = await this.runLinting(projectPath);
      errors.push(...lintValidation.errors);
      warnings.push(...lintValidation.warnings);

      // Check for security issues
      const securityValidation = await this.runSecurityCheck(projectPath);
      errors.push(...securityValidation.errors);
      warnings.push(...securityValidation.warnings);

    } catch (error) {
      errors.push(`Code quality validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { success: errors.length === 0, errors, warnings };
  }

  protected async validatePerformance(projectPath: string): Promise<any> {
    // Performance validation
    const errors: string[] = [];
    const warnings: string[] = [];
    let duration = 0;

    try {
      const startTime = Date.now();

      // Test build time
      const buildValidation = await this.testBuildPerformance(projectPath);
      errors.push(...buildValidation.errors);
      warnings.push(...buildValidation.warnings);

      // Test bundle size
      const bundleValidation = await this.testBundleSize(projectPath);
      errors.push(...bundleValidation.errors);
      warnings.push(...bundleValidation.warnings);

      duration = Date.now() - startTime;

    } catch (error) {
      errors.push(`Performance validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { success: errors.length === 0, errors, warnings, duration };
  }

  /**
   * Run TypeScript validation
   */
  private async runTypeScriptValidation(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { execa } = await import('execa');
      
      // Check if TypeScript is available
      const result = await execa('npx', ['tsc', '--noEmit'], { 
        cwd: projectPath,
        reject: false 
      });

      if (result.exitCode !== 0) {
        errors.push(`TypeScript validation failed: ${result.stderr || result.stdout}`);
      }

    } catch (error) {
      warnings.push(`Could not run TypeScript validation: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Run linting validation
   */
  private async runLinting(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { execa } = await import('execa');
      
      // Try ESLint first
      try {
        const eslintResult = await execa('npx', ['eslint', 'src', '--ext', '.ts,.tsx,.js,.jsx'], { 
          cwd: projectPath,
          reject: false 
        });

        if (eslintResult.exitCode !== 0) {
          warnings.push(`ESLint found issues: ${eslintResult.stdout}`);
        }
      } catch {
        // Try Biome as alternative
        try {
          const biomeResult = await execa('npx', ['biome', 'check', 'src'], { 
            cwd: projectPath,
            reject: false 
          });

          if (biomeResult.exitCode !== 0) {
            warnings.push(`Biome found issues: ${biomeResult.stdout}`);
          }
        } catch {
          warnings.push('No linting tool available (ESLint or Biome)');
        }
      }

    } catch (error) {
      warnings.push(`Could not run linting: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Run security check
   */
  private async runSecurityCheck(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { execa } = await import('execa');
      
      // Run npm audit
      const auditResult = await execa('npm', ['audit', '--audit-level', 'high'], { 
        cwd: projectPath,
        reject: false 
      });

      if (auditResult.exitCode !== 0) {
        warnings.push(`Security audit found issues: ${auditResult.stdout}`);
      }

    } catch (error) {
      warnings.push(`Could not run security check: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Test build performance
   */
  private async testBuildPerformance(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { execa } = await import('execa');
      
      const startTime = Date.now();
      
      // Try to build the project
      const buildResult = await execa('npm', ['run', 'build'], { 
        cwd: projectPath,
        reject: false,
        timeout: 300000 // 5 minute timeout
      });

      const buildTime = Date.now() - startTime;

      if (buildResult.exitCode !== 0) {
        errors.push(`Build failed: ${buildResult.stderr || buildResult.stdout}`);
      } else {
        // Check build time thresholds
        if (buildTime > 180000) { // 3 minutes
          warnings.push(`Build time is slow: ${buildTime}ms (should be under 3 minutes)`);
        } else if (buildTime > 60000) { // 1 minute
          warnings.push(`Build time is moderate: ${buildTime}ms (consider optimizing)`);
        }
      }

    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        errors.push('Build timed out after 5 minutes');
      } else {
        warnings.push(`Could not test build performance: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Test bundle size
   */
  private async testBundleSize(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const { glob } = await import('glob');
      
      // Look for build output
      const possibleBuildDirs = ['dist', 'build', '.next', 'out'];
      
      for (const buildDir of possibleBuildDirs) {
        const buildPath = join(projectPath, buildDir);
        
        try {
          await fs.access(buildPath);
          
          // Find JavaScript bundles
          const jsFiles = await glob('**/*.js', { cwd: buildPath });
          
          let totalSize = 0;
          for (const jsFile of jsFiles) {
            const filePath = join(buildPath, jsFile);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
          }

          // Check bundle size thresholds
          const totalSizeMB = totalSize / 1024 / 1024;
          
          if (totalSizeMB > 10) {
            warnings.push(`Large bundle size: ${totalSizeMB.toFixed(2)}MB (consider code splitting)`);
          } else if (totalSizeMB > 5) {
            warnings.push(`Moderate bundle size: ${totalSizeMB.toFixed(2)}MB (monitor for growth)`);
          }

          break; // Found a build directory, no need to check others
          
        } catch {
          // Build directory doesn't exist, try next
          continue;
        }
      }

    } catch (error) {
      warnings.push(`Could not analyze bundle size: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Generate enhanced report with validation details
   */
  async generateEnhancedReport(report: TestReport): Promise<void> {
    await super.generateReport(report);
    
    // Generate additional compliance report
    await this.generateComplianceReport(report);
    
    // Generate recommendations
    await this.generateRecommendations(report);
  }

  /**
   * Generate compliance-specific report
   */
  private async generateComplianceReport(report: TestReport): Promise<void> {
    const { promises: fs } = await import('fs');
    const { join } = await import('path');

    const complianceReport = {
      timestamp: report.timestamp,
      overallCompliance: this.calculateOverallCompliance(report),
      claudeMdCompliance: {
        score: report.compliance.claudeMdCompliance,
        details: this.extractComplianceDetails(report, 'claude')
      },
      designSystemCompliance: {
        score: report.compliance.designSystemUsage,
        details: this.extractComplianceDetails(report, 'design-system')
      },
      recommendations: report.recommendations
    };

    const complianceReportPath = join(this.testOutputDir, 'compliance-report.json');
    await fs.writeFile(complianceReportPath, JSON.stringify(complianceReport, null, 2));
    
    consola.info(`Compliance report generated: ${complianceReportPath}`);
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(report: TestReport): Promise<void> {
    const recommendations: string[] = [];

    // Analyze test results and generate recommendations
    if (report.compliance.claudeMdCompliance < 80) {
      recommendations.push('Improve CLAUDE.md compliance by fixing TypeScript typing and React patterns');
    }

    if (report.compliance.designSystemUsage < 90) {
      recommendations.push('Increase design system usage by replacing custom components with @xaheen/design-system components');
    }

    if (report.failedTests > 0) {
      recommendations.push('Address failed test cases to improve overall quality');
    }

    if (report.warningTests > report.passedTests * 0.1) {
      recommendations.push('Review and address warning issues to prevent future problems');
    }

    report.recommendations.push(...recommendations);
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallCompliance(report: TestReport): number {
    const scores = [
      report.compliance.claudeMdCompliance,
      report.compliance.designSystemUsage,
      report.compliance.nsmCompliance,
      report.compliance.wcagCompliance
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Extract compliance details from test results
   */
  private extractComplianceDetails(report: TestReport, type: string): any {
    // Extract specific compliance details from test results
    const relevantTests = Object.values(report.suites)
      .flatMap(suite => suite.tests)
      .filter(test => test.name.toLowerCase().includes(type));

    return {
      totalTests: relevantTests.length,
      passed: relevantTests.filter(t => t.status === 'passed').length,
      failed: relevantTests.filter(t => t.status === 'failed').length,
      warnings: relevantTests.filter(t => t.status === 'warning').length
    };
  }
}

/**
 * Main CLI entry point for running E2E tests
 */
export async function runE2ETests(config?: Partial<E2ETestConfig>): Promise<TestReport> {
  const defaultConfig: E2ETestConfig = {
    outputDir: './test-output/e2e',
    cliPath: './dist/index.js',
    timeout: 600000, // 10 minutes
    parallel: false,
    skipCleanup: false,
    generateReport: true,
    reportFormat: 'both',
    frameworks: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
    templates: ['default', 'saas', 'enterprise']
  };

  const finalConfig = { ...defaultConfig, ...config };
  const runner = new E2ETestRunner(finalConfig);
  
  try {
    const report = await runner.runAllTests();
    await runner.generateEnhancedReport(report);
    return report;
  } catch (error) {
    consola.error('E2E test execution failed:', error);
    throw error;
  }
}

export default E2ETestRunner;
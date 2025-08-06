/**
 * Validation Runner - Orchestrates comprehensive validation system
 * 
 * Integrates all validation components:
 * - CLAUDE.md compliance
 * - Design system usage
 * - Norwegian NSM compliance  
 * - WCAG AAA accessibility
 * - Generates comprehensive reports
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { createComprehensiveValidator, ValidationContext, ValidationReport } from './comprehensive-validator';
import { createCLAUDEComplianceValidator } from './claude-compliance-validator';
import { createDesignSystemValidator } from './design-system-validator';
import { createNSMComplianceValidator } from './nsm-compliance-validator';
import { createWCAGAccessibilityValidator } from './wcag-accessibility-validator';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

// =============================================================================
// VALIDATION RUNNER TYPES
// =============================================================================

export interface ValidationRunnerOptions {
  readonly claudeCompliance?: boolean;
  readonly designSystemUsage?: boolean;
  readonly nsmCompliance?: boolean;
  readonly wcagAccessibility?: boolean;
  readonly autoFix?: boolean;
  readonly verbose?: boolean;
  readonly outputFormat?: 'console' | 'json' | 'html';
  readonly outputFile?: string;
}

export interface ComprehensiveValidationReport {
  readonly success: boolean;
  readonly overall: ValidationReport;
  readonly claude: {
    score: number;
    level: string;
    criticalIssues: any[];
    recommendations: string[];
  };
  readonly designSystem: {
    overallScore: number;
    importScore: number;
    compositionScore: number;
    consistencyScore: number;
    patterns: any;
  };
  readonly nsm: {
    score: number;
    level: string;
    criticalIssues: any[];
    recommendations: string[];
  };
  readonly accessibility: {
    overallScore: number;
    wcagLevel: string;
    ariaScore: number;
    keyboardScore: number;
    colorContrastScore: number;
    semanticScore: number;
    screenReaderScore: number;
    failedCriteria: string[];
    passedCriteria: string[];
  };
  readonly summary: {
    totalFiles: number;
    validatedFiles: number;
    totalIssues: number;
    criticalIssues: number;
    fixableIssues: number;
    executionTime: number;
  };
}

// =============================================================================
// VALIDATION RUNNER CLASS  
// =============================================================================

export class ValidationRunner {
  private comprehensiveValidator: ReturnType<typeof createComprehensiveValidator>;
  private claudeValidator: ReturnType<typeof createCLAUDEComplianceValidator>;
  private designSystemValidator: ReturnType<typeof createDesignSystemValidator>;
  private nsmValidator: ReturnType<typeof createNSMComplianceValidator>;
  private wcagValidator: ReturnType<typeof createWCAGAccessibilityValidator>;

  constructor() {
    this.comprehensiveValidator = createComprehensiveValidator();
    this.claudeValidator = createCLAUDEComplianceValidator();
    this.designSystemValidator = createDesignSystemValidator();
    this.nsmValidator = createNSMComplianceValidator();
    this.wcagValidator = createWCAGAccessibilityValidator();
  }

  /**
   * Run comprehensive validation on project
   */
  public async validateProject(
    projectPath: string, 
    options: ValidationRunnerOptions = {}
  ): Promise<ComprehensiveValidationReport> {
    const startTime = Date.now();

    try {
      // Discover source files
      const sourceFiles = await this.discoverSourceFiles(projectPath);
      
      if (options.verbose) {
        console.log(`\n${chalk.blue('ℹ')} Found ${sourceFiles.length} source files to validate`);
      }

      // Create validation context
      const context = await this.createValidationContext(projectPath, sourceFiles);
      
      // Run comprehensive validation
      const overallReport = await this.comprehensiveValidator.validateProject(context);
      
      if (options.verbose) {
        this.comprehensiveValidator.displayReport(overallReport);
      }

      // Run specialized validations
      const claudeReport = options.claudeCompliance !== false ? 
        this.claudeValidator.assessCompliance(overallReport.errors.concat(overallReport.warnings)) : 
        null;

      const designSystemReport = options.designSystemUsage !== false ?
        this.designSystemValidator.analyzeUsagePatterns(overallReport.errors.concat(overallReport.warnings)) :
        null;

      const nsmReport = options.nsmCompliance !== false ?
        this.nsmValidator.assessCompliance(overallReport.errors.concat(overallReport.warnings)) :
        null;

      const accessibilityReport = options.wcagAccessibility !== false ?
        this.wcagValidator.analyzeAccessibilityPatterns(overallReport.errors.concat(overallReport.warnings)) :
        null;

      // Apply fixes if requested
      let fixedIssues = 0;
      if (options.autoFix && overallReport.fixableIssues > 0) {
        if (options.verbose) {
          console.log(`\n${chalk.yellow('🔧')} Applying ${overallReport.fixableIssues} automatic fixes...`);
        }
        
        fixedIssues = await this.comprehensiveValidator.applyFixes(
          context, 
          overallReport.errors.concat(overallReport.warnings).filter(issue => issue.fix)
        );

        if (options.verbose) {
          console.log(`${chalk.green('✓')} Applied ${fixedIssues} fixes successfully`);
        }
      }

      const executionTime = Date.now() - startTime;

      // Compile comprehensive report
      const comprehensiveReport: ComprehensiveValidationReport = {
        success: overallReport.success,
        overall: overallReport,
        claude: claudeReport || { score: 100, level: 'excellent', criticalIssues: [], recommendations: [] },
        designSystem: designSystemReport || { overallScore: 100, importScore: 100, compositionScore: 100, consistencyScore: 100, patterns: {} },
        nsm: nsmReport || { score: 100, level: 'compliant', criticalIssues: [], recommendations: [] },
        accessibility: accessibilityReport || { 
          overallScore: 100, 
          wcagLevel: 'AAA', 
          ariaScore: 100, 
          keyboardScore: 100, 
          colorContrastScore: 100, 
          semanticScore: 100, 
          screenReaderScore: 100,
          failedCriteria: [],
          passedCriteria: []
        },
        summary: {
          totalFiles: sourceFiles.length,
          validatedFiles: sourceFiles.filter(f => this.shouldValidateFile(f)).length,
          totalIssues: overallReport.totalIssues,
          criticalIssues: overallReport.errors.length,
          fixableIssues: overallReport.fixableIssues - fixedIssues,
          executionTime
        }
      };

      // Output report in requested format
      if (options.outputFile) {
        await this.saveReport(comprehensiveReport, options);
      }

      return comprehensiveReport;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        overall: {
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
        },
        claude: { score: 0, level: 'poor', criticalIssues: [], recommendations: [] },
        designSystem: { overallScore: 0, importScore: 0, compositionScore: 0, consistencyScore: 0, patterns: {} },
        nsm: { score: 0, level: 'non-compliant', criticalIssues: [], recommendations: [] },
        accessibility: { 
          overallScore: 0, 
          wcagLevel: 'Non-compliant', 
          ariaScore: 0, 
          keyboardScore: 0, 
          colorContrastScore: 0, 
          semanticScore: 0, 
          screenReaderScore: 0,
          failedCriteria: [],
          passedCriteria: []
        },
        summary: {
          totalFiles: 0,
          validatedFiles: 0,
          totalIssues: 1,
          criticalIssues: 1,
          fixableIssues: 0,
          executionTime
        }
      };
    }
  }

  /**
   * Display comprehensive validation report
   */
  public displayComprehensiveReport(report: ComprehensiveValidationReport): void {
    console.log('\n' + chalk.bold('🏆 COMPREHENSIVE VALIDATION REPORT'));
    console.log('═'.repeat(70));

    // Overall Status
    const statusIcon = report.success ? chalk.green('✅') : chalk.red('❌');
    const statusText = report.success ? 'PASSED' : 'FAILED';
    console.log(`\n${statusIcon} Overall Status: ${chalk.bold(statusText)}\n`);

    // Summary Statistics
    console.log(chalk.bold('📊 Summary Statistics'));
    console.log('─'.repeat(30));
    console.log(`Files Validated: ${chalk.cyan(report.summary.validatedFiles)}/${report.summary.totalFiles}`);
    console.log(`Total Issues: ${this.colorizeIssueCount(report.summary.totalIssues)}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues > 0 ? chalk.red(report.summary.criticalIssues) : chalk.green('0')}`);
    console.log(`Fixable Issues: ${report.summary.fixableIssues > 0 ? chalk.blue(report.summary.fixableIssues) : chalk.green('0')}`);
    console.log(`Execution Time: ${chalk.gray(`${report.summary.executionTime}ms`)}\n`);

    // Compliance Scores
    console.log(chalk.bold('🎯 Compliance Scores'));
    console.log('─'.repeat(30));
    console.log(`CLAUDE.md Compliance: ${this.colorizeScore(report.claude.score)}% (${report.claude.level})`);
    console.log(`Design System Usage: ${this.colorizeScore(report.designSystem.overallScore)}%`);
    console.log(`NSM Security: ${this.colorizeScore(report.nsm.score)}% (${report.nsm.level})`);
    console.log(`WCAG Accessibility: ${this.colorizeScore(report.accessibility.overallScore)}% (${report.accessibility.wcagLevel})`);

    // Detailed Breakdown
    console.log('\n' + chalk.bold('📋 Detailed Breakdown'));
    console.log('─'.repeat(30));

    // CLAUDE.md Details
    if (report.claude.criticalIssues.length > 0) {
      console.log(`${chalk.red('CLAUDE.md Issues:')} ${report.claude.criticalIssues.length} critical`);
    }

    // Design System Details
    console.log(`${chalk.blue('Design System:')} Import(${this.colorizeScore(report.designSystem.importScore)}%) Composition(${this.colorizeScore(report.designSystem.compositionScore)}%) Consistency(${this.colorizeScore(report.designSystem.consistencyScore)}%)`);

    // NSM Details
    if (report.nsm.criticalIssues.length > 0) {
      console.log(`${chalk.yellow('NSM Security:')} ${report.nsm.criticalIssues.length} critical issues`);
    }

    // Accessibility Details
    console.log(`${chalk.magenta('Accessibility:')} ARIA(${this.colorizeScore(report.accessibility.ariaScore)}%) Keyboard(${this.colorizeScore(report.accessibility.keyboardScore)}%) Contrast(${this.colorizeScore(report.accessibility.colorContrastScore)}%)`);

    // Top Recommendations
    const allRecommendations = [
      ...report.claude.recommendations,
      ...report.designSystem ? this.designSystemValidator.generateRecommendations(report.overall.errors.concat(report.overall.warnings)) : [],
      ...report.nsm.recommendations,
      ...report.accessibility ? this.wcagValidator.generateAccessibilityRecommendations(report.overall.errors.concat(report.overall.warnings)) : []
    ];

    if (allRecommendations.length > 0) {
      console.log('\n' + chalk.bold('💡 Top Recommendations'));
      console.log('─'.repeat(30));
      allRecommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    // Next Steps
    console.log('\n' + chalk.bold('🚀 Next Steps'));
    console.log('─'.repeat(30));
    if (report.summary.criticalIssues > 0) {
      console.log(`  • Fix ${report.summary.criticalIssues} critical issues immediately`);
    }
    if (report.summary.fixableIssues > 0) {
      console.log(`  • Run with --fix to automatically resolve ${report.summary.fixableIssues} issues`);
    }
    if (report.success) {
      console.log(`  • Great work! Your project meets all validation standards`);
    } else {
      console.log(`  • Review detailed issues and apply recommended fixes`);
    }

    console.log('\n');
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async discoverSourceFiles(projectPath: string): Promise<string[]> {
    try {
      const patterns = [
        '**/*.{ts,tsx,js,jsx}',
        '!node_modules/**',
        '!.next/**',
        '!dist/**', 
        '!build/**',
        '!coverage/**'
      ];

      const files = await glob(patterns, {
        cwd: projectPath,
        absolute: true,
        ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'coverage/**']
      });

      return files;
    } catch (error) {
      console.warn(`Failed to discover source files: ${error.message}`);
      return [];
    }
  }

  private async createValidationContext(
    projectPath: string, 
    sourceFiles: string[]
  ): Promise<ValidationContext> {
    let packageJson: any = {};
    let tsConfig: any = {};

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        packageJson = await fs.readJSON(packageJsonPath);
      }
    } catch (error) {
      // Package.json is optional
    }

    try {
      const tsConfigPath = path.join(projectPath, 'tsconfig.json');
      if (await fs.pathExists(tsConfigPath)) {
        tsConfig = await fs.readJSON(tsConfigPath);
      }
    } catch (error) {
      // tsconfig.json is optional
    }

    return {
      projectPath,
      sourceFiles: sourceFiles.filter(file => this.shouldValidateFile(file)),
      packageJson,
      tsConfig,
      claudeConfig: {
        buttonMinHeight: 12,
        inputMinHeight: 14,
        strictTypeScript: true,
        wcagLevel: 'AAA',
        norwegianCompliance: true,
        designSystemRequired: true
      }
    };
  }

  private shouldValidateFile(filePath: string): boolean {
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const invalidPaths = ['node_modules', '.next', 'dist', 'build', 'coverage', 'test', '__tests__'];
    
    return validExtensions.some(ext => filePath.endsWith(ext)) &&
           !invalidPaths.some(invalid => filePath.includes(invalid));
  }

  private async saveReport(
    report: ComprehensiveValidationReport, 
    options: ValidationRunnerOptions
  ): Promise<void> {
    if (!options.outputFile) return;

    const format = options.outputFormat || 'json';
    
    try {
      switch (format) {
        case 'json':
          await fs.writeJSON(options.outputFile, report, { spaces: 2 });
          break;
        
        case 'html':
          const html = this.generateHTMLReport(report);
          await fs.writeFile(options.outputFile, html);
          break;
          
        default:
          await fs.writeJSON(options.outputFile, report, { spaces: 2 });
      }
      
      console.log(`${chalk.green('✓')} Report saved to ${options.outputFile}`);
    } catch (error) {
      console.warn(`Failed to save report: ${error.message}`);
    }
  }

  private generateHTMLReport(report: ComprehensiveValidationReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .status { font-size: 24px; margin: 20px 0; }
        .success { color: #22c55e; }
        .failure { color: #ef4444; }
        .section { margin: 30px 0; }
        .score { font-weight: bold; }
        .score.excellent { color: #22c55e; }
        .score.good { color: #3b82f6; }
        .score.warning { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .recommendations { background-color: #f9fafb; padding: 15px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Comprehensive Validation Report</h1>
        <div class="status ${report.success ? 'success' : 'failure'}">
            ${report.success ? '✅ PASSED' : '❌ FAILED'}
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Summary Statistics</h2>
        <div class="grid">
            <div class="card">
                <h3>Files</h3>
                <p>Validated: ${report.summary.validatedFiles}/${report.summary.totalFiles}</p>
            </div>
            <div class="card">
                <h3>Issues</h3>
                <p>Total: ${report.summary.totalIssues}</p>
                <p>Critical: ${report.summary.criticalIssues}</p>
                <p>Fixable: ${report.summary.fixableIssues}</p>
            </div>
            <div class="card">
                <h3>Performance</h3>
                <p>Execution Time: ${report.summary.executionTime}ms</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Compliance Scores</h2>
        <div class="grid">
            <div class="card">
                <h3>CLAUDE.md Compliance</h3>
                <div class="score ${this.getScoreClass(report.claude.score)}">${report.claude.score}%</div>
                <p>Level: ${report.claude.level}</p>
            </div>
            <div class="card">
                <h3>Design System Usage</h3>
                <div class="score ${this.getScoreClass(report.designSystem.overallScore)}">${report.designSystem.overallScore}%</div>
            </div>
            <div class="card">
                <h3>NSM Security</h3>
                <div class="score ${this.getScoreClass(report.nsm.score)}">${report.nsm.score}%</div>
                <p>Level: ${report.nsm.level}</p>
            </div>
            <div class="card">
                <h3>WCAG Accessibility</h3>
                <div class="score ${this.getScoreClass(report.accessibility.overallScore)}">${report.accessibility.overallScore}%</div>
                <p>Level: ${report.accessibility.wcagLevel}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            ${[...report.claude.recommendations, ...report.nsm.recommendations]
              .slice(0, 10)
              .map(rec => `<li>${rec}</li>`)
              .join('')}
        </div>
    </div>

    <div class="section">
        <p><small>Generated on ${new Date().toISOString()}</small></p>
    </div>
</body>
</html>`;
  }

  private colorizeScore(score: number): string {
    if (score >= 90) return chalk.green(score.toString());
    if (score >= 75) return chalk.blue(score.toString());
    if (score >= 60) return chalk.yellow(score.toString());
    return chalk.red(score.toString());
  }

  private colorizeIssueCount(count: number): string {
    if (count === 0) return chalk.green('0');
    if (count <= 5) return chalk.yellow(count.toString());
    return chalk.red(count.toString());
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'warning';
    return 'poor';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createValidationRunner(): ValidationRunner {
  return new ValidationRunner();
}

export default ValidationRunner;
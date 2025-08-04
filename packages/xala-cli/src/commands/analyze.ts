import chalk from 'chalk';
import ora from 'ora';
import { CommandMetadata } from './index.js';
import { logger } from '../utils/logger.js';
import { ProjectAnalyzer } from '../services/project-analyzer.js';
import { ValidationError } from '../utils/errors.js';

export interface AnalyzeOptions {
  readonly performance?: boolean;
  readonly accessibility?: boolean;
  readonly compliance?: boolean;
  readonly bundle?: boolean;
  readonly output?: string;
  readonly format?: string;
  readonly detailed?: boolean;
}

export const analyzeCommand: CommandMetadata = {
  name: 'analyze',
  description: 'Analyze performance, accessibility, and compliance',
  options: [
    {
      flags: '--performance',
      description: 'Analyze performance metrics',
      defaultValue: false
    },
    {
      flags: '--accessibility',
      description: 'Analyze accessibility compliance',
      defaultValue: false
    },
    {
      flags: '--compliance',
      description: 'Analyze design system compliance',
      defaultValue: false
    },
    {
      flags: '--bundle',
      description: 'Analyze bundle size and composition',
      defaultValue: false
    },
    {
      flags: '--output <path>',
      description: 'Output directory for reports',
      defaultValue: './reports'
    },
    {
      flags: '--format <format>',
      description: 'Report format (json|html|console)',
      defaultValue: 'console'
    },
    {
      flags: '--detailed',
      description: 'Generate detailed reports',
      defaultValue: false
    }
  ],
  action: async (options: AnalyzeOptions = {}) => {
    try {
      logger.info('Analyzing project...');
      
      // If no specific analysis type is specified, run all
      const runAll = !options.performance && !options.accessibility && !options.compliance && !options.bundle;
      
      const analyzer = new ProjectAnalyzer();
      const spinner = ora('Running analysis...').start();
      
      try {
        const analysisResults = await analyzer.analyze({
          performance: options.performance || runAll,
          accessibility: options.accessibility || runAll,
          compliance: options.compliance || runAll,
          bundle: options.bundle || runAll,
          outputDir: options.output || './reports',
          format: options.format || 'console',
          detailed: options.detailed || false
        });
        
        spinner.succeed('Analysis completed');
        
        console.log(chalk.bold('\n📊 Analysis Results:'));
        
        if (analysisResults.performance) {
          displayPerformanceResults(analysisResults.performance);
        }
        
        if (analysisResults.accessibility) {
          displayAccessibilityResults(analysisResults.accessibility);
        }
        
        if (analysisResults.compliance) {
          displayComplianceResults(analysisResults.compliance);
        }
        
        if (analysisResults.bundle) {
          displayBundleResults(analysisResults.bundle);
        }
        
        if (analysisResults.reportPaths && analysisResults.reportPaths.length > 0) {
          console.log(chalk.bold('\n📁 Reports Generated:'));
          analysisResults.reportPaths.forEach(path => {
            console.log(`  ${chalk.cyan(path)}`);
          });
        }
        
        console.log(chalk.bold('\n💡 Recommendations:'));
        if (analysisResults.recommendations && analysisResults.recommendations.length > 0) {
          analysisResults.recommendations.forEach(rec => {
            console.log(`  ${getRecommendationIcon(rec.priority)} ${rec.message}`);
          });
        } else {
          console.log(chalk.green('  ✅ Great job! No major issues found.'));
        }
        
      } catch (error) {
        spinner.fail('Analysis failed');
        throw error;
      }
      
    } catch (error) {
      logger.error('Analyze command failed:', error);
      throw error;
    }
  }
};

function displayPerformanceResults(performance: any): void {
  console.log(chalk.bold('\n🚀 Performance Analysis:'));
  console.log(`  Bundle Size: ${getScoreColor(performance.bundleScore)}${performance.bundleSize}${chalk.reset()}`);
  console.log(`  Load Time: ${getScoreColor(performance.loadScore)}${performance.loadTime}${chalk.reset()}`);
  console.log(`  First Paint: ${getScoreColor(performance.paintScore)}${performance.firstPaint}${chalk.reset()}`);
  console.log(`  Interactive: ${getScoreColor(performance.interactiveScore)}${performance.timeToInteractive}${chalk.reset()}`);
  console.log(`  Overall Score: ${getScoreColor(performance.overallScore)}${performance.overallScore}/100${chalk.reset()}`);
  
  if (performance.issues && performance.issues.length > 0) {
    console.log(chalk.yellow('\n  ⚠️  Performance Issues:'));
    performance.issues.forEach((issue: any) => {
      console.log(`    • ${issue.message}`);
    });
  }
}

function displayAccessibilityResults(accessibility: any): void {
  console.log(chalk.bold('\n♿ Accessibility Analysis:'));
  console.log(`  WCAG Compliance: ${getComplianceColor(accessibility.wcagLevel)}${accessibility.wcagLevel}${chalk.reset()}`);
  console.log(`  Color Contrast: ${getScoreColor(accessibility.contrastScore)}${accessibility.contrastScore}/100${chalk.reset()}`);
  console.log(`  Keyboard Navigation: ${getScoreColor(accessibility.keyboardScore)}${accessibility.keyboardScore}/100${chalk.reset()}`);
  console.log(`  Screen Reader: ${getScoreColor(accessibility.screenReaderScore)}${accessibility.screenReaderScore}/100${chalk.reset()}`);
  console.log(`  Overall Score: ${getScoreColor(accessibility.overallScore)}${accessibility.overallScore}/100${chalk.reset()}`);
  
  if (accessibility.violations && accessibility.violations.length > 0) {
    console.log(chalk.red('\n  ❌ Accessibility Violations:'));
    accessibility.violations.forEach((violation: any) => {
      console.log(`    • ${violation.message} (${violation.severity})`);
    });
  }
}

function displayComplianceResults(compliance: any): void {
  console.log(chalk.bold('\n📋 Design System Compliance:'));
  console.log(`  Component Usage: ${getScoreColor(compliance.componentScore)}${compliance.componentScore}/100${chalk.reset()}`);
  console.log(`  Design Tokens: ${getScoreColor(compliance.tokenScore)}${compliance.tokenScore}/100${chalk.reset()}`);
  console.log(`  Localization: ${getScoreColor(compliance.i18nScore)}${compliance.i18nScore}/100${chalk.reset()}`);
  console.log(`  TypeScript: ${getScoreColor(compliance.typeScore)}${compliance.typeScore}/100${chalk.reset()}`);
  console.log(`  Code Quality: ${getScoreColor(compliance.qualityScore)}${compliance.qualityScore}/100${chalk.reset()}`);
  console.log(`  Overall Score: ${getScoreColor(compliance.overallScore)}${compliance.overallScore}/100${chalk.reset()}`);
  
  if (compliance.violations && compliance.violations.length > 0) {
    console.log(chalk.red('\n  ❌ Compliance Violations:'));
    compliance.violations.forEach((violation: any) => {
      console.log(`    • ${violation.message} (Line ${violation.line})`);
    });
  }
}

function displayBundleResults(bundle: any): void {
  console.log(chalk.bold('\n📦 Bundle Analysis:'));
  console.log(`  Total Size: ${bundle.totalSize}`);
  console.log(`  Gzipped: ${bundle.gzippedSize}`);
  console.log(`  Modules: ${bundle.moduleCount}`);
  console.log(`  Unused Code: ${bundle.unusedPercentage}%`);
  
  if (bundle.largestModules && bundle.largestModules.length > 0) {
    console.log(chalk.yellow('\n  📊 Largest Modules:'));
    bundle.largestModules.forEach((module: any) => {
      console.log(`    ${module.name}: ${module.size}`);
    });
  }
  
  if (bundle.duplicates && bundle.duplicates.length > 0) {
    console.log(chalk.red('\n  ⚠️  Duplicate Dependencies:'));
    bundle.duplicates.forEach((dup: any) => {
      console.log(`    ${dup.name} (${dup.versions.join(', ')})`);
    });
  }
}

function getScoreColor(score: number): (text: string) => string {
  if (score >= 90) return chalk.green.bold;
  if (score >= 70) return chalk.yellow.bold;
  return chalk.red.bold;
}

function getComplianceColor(level: string): (text: string) => string {
  switch (level) {
    case 'AAA':
      return chalk.green.bold;
    case 'AA':
      return chalk.yellow.bold;
    default:
      return chalk.red.bold;
  }
}

function getRecommendationIcon(priority: string): string {
  switch (priority) {
    case 'high':
      return chalk.red('🔴');
    case 'medium':
      return chalk.yellow('🟡');
    case 'low':
      return chalk.blue('🔵');
    default:
      return '•';
  }
}
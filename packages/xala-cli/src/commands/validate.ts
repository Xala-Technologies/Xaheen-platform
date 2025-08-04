/**
 * @fileoverview Template Validation CLI Command
 * @description CLI command for validating templates against semantic UI system patterns
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern, TypeScript Strict
 */

import { Command } from 'commander';
import { existsSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { TemplateValidator, TemplateValidationResult } from '../services/template-validator.js';

export interface ValidateOptions {
  readonly path?: string;
  readonly pattern?: string;
  readonly output?: string;
  readonly format?: 'console' | 'json' | 'markdown' | 'html';
  readonly severity?: 'error' | 'warning' | 'all';
  readonly fix?: boolean;
  readonly ci?: boolean;
  readonly watch?: boolean;
}

export const validateCommand = new Command('validate')
  .description('Validate templates for semantic UI system compliance')
  .option('-p, --path <path>', 'Path to template file or directory', process.cwd())
  .option('--pattern <pattern>', 'Glob pattern for template files', '**/*.{hbs,tsx,ts,vue,svelte}')
  .option('-o, --output <file>', 'Output file for validation report')
  .option('-f, --format <format>', 'Output format (console|json|markdown|html)', 'console')
  .option('-s, --severity <level>', 'Filter by severity level (error|warning|all)', 'all')
  .option('--fix', 'Attempt to auto-fix violations where possible')
  .option('--ci', 'CI mode - exit with error code if violations found')
  .option('--watch', 'Watch mode - continuously validate on file changes')
  .action(async (options: ValidateOptions) => {
    try {
      await validateTemplates(options);
    } catch (error) {
      logger.error('Template validation failed:', error);
      process.exit(1);
    }
  });

async function validateTemplates(options: ValidateOptions): Promise<void> {
  const validator = new TemplateValidator();
  const targetPath = resolve(options.path || process.cwd());
  
  logger.info(`🔍 Validating templates in: ${targetPath}`);
  
  if (!existsSync(targetPath)) {
    logger.error(`Path not found: ${targetPath}`);
    process.exit(1);
  }

  const spinner = ora('Validating templates...').start();
  
  try {
    let results: ReadonlyArray<TemplateValidationResult>;

    // Determine if path is file or directory
    const stats = await import('fs').then(fs => fs.promises.stat(targetPath));
    
    if (stats.isFile()) {
      const result = await validator.validateTemplate(targetPath);
      results = [result];
      spinner.succeed(`Validated 1 template`);
    } else {
      results = await validator.validateDirectory(targetPath, options.pattern);
      spinner.succeed(`Validated ${results.length} templates`);
    }

    // Filter results by severity
    const filteredResults = filterResultsBySeverity(results, options.severity);
    
    // Generate and display report
    await generateReport(filteredResults, options, validator);
    
    // Handle CI mode and watch mode
    if (options.ci) {
      handleCIMode(filteredResults);
    }
    
    if (options.watch) {
      await setupWatchMode(targetPath, options, validator);
    }
    
  } catch (error) {
    spinner.fail('Validation failed');
    throw error;
  }
}

function filterResultsBySeverity(
  results: ReadonlyArray<TemplateValidationResult>,
  severity?: string
): ReadonlyArray<TemplateValidationResult> {
  if (!severity || severity === 'all') {
    return results;
  }
  
  return results.map(result => ({
    ...result,
    violations: result.violations.filter(v => v.severity === severity),
    warnings: severity === 'warning' ? result.warnings : [],
  }));
}

async function generateReport(
  results: ReadonlyArray<TemplateValidationResult>,
  options: ValidateOptions,
  validator: TemplateValidator
): Promise<void> {
  const format = options.format || 'console';
  
  switch (format) {
    case 'console':
      displayConsoleReport(results);
      break;
      
    case 'json':
      await generateJSONReport(results, options.output);
      break;
      
    case 'markdown':
      await generateMarkdownReport(results, options.output, validator);
      break;
      
    case 'html':
      await generateHTMLReport(results, options.output, validator);
      break;
      
    default:
      logger.warn(`Unknown format: ${format}, using console`);
      displayConsoleReport(results);
  }
}

function displayConsoleReport(results: ReadonlyArray<TemplateValidationResult>): void {
  const totalTemplates = results.length;
  const validTemplates = results.filter(r => r.isValid).length;
  const invalidTemplates = totalTemplates - validTemplates;
  
  console.log('\n' + chalk.bold('📊 Template Validation Summary'));
  console.log('━'.repeat(50));
  
  console.log(`${chalk.blue('Total templates:')} ${totalTemplates}`);
  console.log(`${chalk.green('✅ Valid:')} ${validTemplates}`);
  console.log(`${chalk.red('❌ Invalid:')} ${invalidTemplates}`);
  
  if (results.length > 0) {
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    console.log(`${chalk.blue('📈 Average score:')} ${avgScore}%`);
  }
  
  // Compliance overview
  console.log('\n' + chalk.bold('🛡️ Compliance Overview'));
  console.log('━'.repeat(50));
  
  const complianceKeys = ['semantic', 'accessibility', 'designTokens', 'responsive', 'typeScript', 'norwegian'] as const;
  
  complianceKeys.forEach(key => {
    const compliantCount = results.filter(r => r.compliance[key]).length;
    const percentage = totalTemplates > 0 ? Math.round((compliantCount / totalTemplates) * 100) : 0;
    const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    
    console.log(`${status} ${label}: ${compliantCount}/${totalTemplates} (${percentage}%)`);
  });
  
  // Detailed results for invalid templates
  const invalidResults = results.filter(r => !r.isValid);
  
  if (invalidResults.length > 0) {
    console.log('\n' + chalk.bold.red('❌ Templates with Errors'));
    console.log('━'.repeat(50));
    
    invalidResults.forEach(result => {
      console.log(`\n${chalk.cyan(result.filePath)} ${chalk.dim(`(${result.score}%)`)}`);
      
      result.violations
        .filter(v => v.severity === 'error')
        .slice(0, 5) // Limit to first 5 errors per template
        .forEach(violation => {
          const location = violation.line ? chalk.dim(` (Line ${violation.line})`) : '';
          console.log(`  ${chalk.red('❌')} ${chalk.bold(violation.rule)}${location}: ${violation.message}`);
          console.log(`     ${chalk.dim('💡 ' + violation.suggestion)}`);
        });
      
      if (result.violations.length > 5) {
        console.log(`  ${chalk.dim(`... and ${result.violations.length - 5} more errors`)}`);
      }
    });
  }
  
  // Show warnings for valid templates
  const warningResults = results.filter(r => r.isValid && r.warnings.length > 0);
  
  if (warningResults.length > 0) {
    console.log('\n' + chalk.bold.yellow('⚠️ Templates with Warnings'));
    console.log('━'.repeat(50));
    
    warningResults.slice(0, 3).forEach(result => {
      console.log(`\n${chalk.cyan(result.filePath)} ${chalk.dim(`(${result.score}%)`)}`);
      
      result.warnings.slice(0, 3).forEach(warning => {
        const location = warning.line ? chalk.dim(` (Line ${warning.line})`) : '';
        console.log(`  ${chalk.yellow('⚠️')} ${chalk.bold(warning.rule)}${location}: ${warning.message}`);
        console.log(`     ${chalk.dim('💡 ' + warning.suggestion)}`);
      });
    });
    
    if (warningResults.length > 3) {
      console.log(`\n${chalk.dim(`... and ${warningResults.length - 3} more templates with warnings`)}`);
    }
  }
  
  console.log('\n' + '━'.repeat(50));
}

async function generateJSONReport(
  results: ReadonlyArray<TemplateValidationResult>,
  outputFile?: string
): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTemplates: results.length,
      validTemplates: results.filter(r => r.isValid).length,
      invalidTemplates: results.filter(r => !r.isValid).length,
      averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
    },
    results: results.map(result => ({
      filePath: result.filePath,
      isValid: result.isValid,
      score: result.score,
      compliance: result.compliance,
      violations: result.violations.map(v => ({
        rule: v.rule,
        severity: v.severity,
        message: v.message,
        line: v.line,
        column: v.column,
        suggestion: v.suggestion,
      })),
      warnings: result.warnings.map(w => ({
        rule: w.rule,
        message: w.message,
        line: w.line,
        suggestion: w.suggestion,
      })),
    }))
  };
  
  const jsonReport = JSON.stringify(report, null, 2);
  
  if (outputFile) {
    writeFileSync(outputFile, jsonReport);
    logger.info(`JSON report saved to: ${outputFile}`);
  } else {
    console.log(jsonReport);
  }
}

async function generateMarkdownReport(
  results: ReadonlyArray<TemplateValidationResult>,
  outputFile?: string,
  validator?: TemplateValidator
): Promise<void> {
  const markdownReport = validator ? validator.generateReport(results) : 'Report generation failed';
  
  if (outputFile) {
    writeFileSync(outputFile, markdownReport);
    logger.info(`Markdown report saved to: ${outputFile}`);
  } else {
    console.log(markdownReport);
  }
}

async function generateHTMLReport(
  results: ReadonlyArray<TemplateValidationResult>,
  outputFile?: string,
  validator?: TemplateValidator
): Promise<void> {
  const markdownReport = validator ? validator.generateReport(results) : 'Report generation failed';
  
  // Convert markdown to HTML (simplified)
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .summary { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .violation { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; margin: 1rem 0; }
        .warning { background: #fffbf0; border-left: 4px solid #d69e2e; padding: 1rem; margin: 1rem 0; }
        .success { background: #f0fff4; border-left: 4px solid #38a169; padding: 1rem; margin: 1rem 0; }
        h1, h2, h3 { color: #2d3748; }
        pre { background: #f7fafc; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        .score { font-size: 2rem; font-weight: bold; color: #4299e1; }
    </style>
</head>
<body>
    <div class="summary">
        <h1>Template Validation Report</h1>
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        <p><strong>Total Templates:</strong> ${results.length}</p>
        <p><strong>Valid Templates:</strong> ${results.filter(r => r.isValid).length}</p>
        <p><strong>Invalid Templates:</strong> ${results.filter(r => !r.isValid).length}</p>
    </div>
    <pre>${markdownReport}</pre>
</body>
</html>`;
  
  if (outputFile) {
    writeFileSync(outputFile, htmlReport);
    logger.info(`HTML report saved to: ${outputFile}`);
  } else {
    console.log(htmlReport);
  }
}

function handleCIMode(results: ReadonlyArray<TemplateValidationResult>): void {
  const hasErrors = results.some(r => 
    r.violations.some(v => v.severity === 'error')
  );
  
  if (hasErrors) {
    logger.error('Template validation failed in CI mode');
    process.exit(1);
  } else {
    logger.info('✅ All templates passed validation in CI mode');
  }
}

async function setupWatchMode(
  targetPath: string,
  options: ValidateOptions,
  validator: TemplateValidator
): Promise<void> {
  const chokidar = await import('chokidar');
  
  logger.info('👀 Watching for template changes...');
  
  const watcher = chokidar.watch(targetPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
  });
  
  watcher.on('change', async (filePath) => {
    logger.info(`📝 Template changed: ${filePath}`);
    
    try {
      const result = await validator.validateTemplate(filePath);
      displayConsoleReport([result]);
    } catch (error) {
      logger.error(`Failed to validate ${filePath}:`, error);
    }
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    logger.info('Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });
}
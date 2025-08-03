/**
 * Validate Command - Project Health Check
 * 
 * Validates project configuration, checks service health,
 * verifies dependencies, and provides actionable feedback.
 * 
 * @author DevOps Expert Agent
 * @since 2025-01-03
 */

import { Command } from 'commander';
import { intro, outro, spinner, confirm } from '@clack/prompts';
import chalk from 'chalk';
import { consola } from 'consola';
import path from 'node:path';
import fs from 'fs-extra';

import { ServiceRegistry } from '../services/registry/service-registry.js';
import { ProjectAnalyzer } from '../services/analysis/project-analyzer.js';
import { ProjectValidator } from '../services/validation/project-validator.js';
import type { ValidationResult, ValidationIssue } from '../types/index.js';

export const validateCommand = new Command('validate')
  .description('Validate project configuration and health')
  .option('-f, --fix', 'Attempt to fix issues automatically')
  .option('--services', 'Validate service configurations')
  .option('--deps', 'Validate dependencies')
  .option('--env', 'Validate environment variables')
  .option('--lint', 'Run linting checks')
  .option('--types', 'Run type checking')
  .option('--all', 'Run all validations')
  .action(async (options) => {
    try {
      intro(chalk.cyan('🔍 Validating project'));

      // Initialize services
      const registry = new ServiceRegistry();
      const analyzer = new ProjectAnalyzer();
      const validator = new ProjectValidator(registry);

      await registry.initialize();

      // Analyze project
      const projectPath = process.cwd();
      const s = spinner();
      s.start('Analyzing project...');

      const projectInfo = await analyzer.analyzeProject(projectPath);

      if (!projectInfo.isValid) {
        s.stop('No valid project found');
        consola.error('Could not detect a valid project in the current directory');
        process.exit(1);
      }

      s.stop('Project analyzed');

      // Display project info
      consola.info('\nProject Information:');
      consola.info(`  Name: ${chalk.green(projectInfo.name)}`);
      consola.info(`  Framework: ${chalk.green(projectInfo.framework || 'Unknown')}`);
      consola.info(`  TypeScript: ${projectInfo.typescript ? chalk.green('Yes') : chalk.yellow('No')}`);
      consola.info(`  Package Manager: ${chalk.green(projectInfo.packageManager || 'npm')}`);
      
      if (projectInfo.services.length > 0) {
        consola.info(`  Services: ${projectInfo.services.map(s => chalk.blue(s)).join(', ')}`);
      }

      // Determine what to validate
      const validationOptions = {
        validateServices: options.services || options.all,
        validateDependencies: options.deps || options.all,
        validateEnvironment: options.env || options.all,
        validateLinting: options.lint || options.all,
        validateTypes: options.types || options.all,
        autoFix: options.fix
      };

      // If no specific options, validate everything
      if (!options.services && !options.deps && !options.env && !options.lint && !options.types && !options.all) {
        Object.keys(validationOptions).forEach(key => {
          if (key !== 'autoFix') {
            validationOptions[key as keyof typeof validationOptions] = true;
          }
        });
      }

      // Run validation
      s.start('Running validations...');
      
      const result = await validator.validateProject(
        projectPath,
        projectInfo,
        validationOptions
      );

      s.stop(`Validation complete: ${result.isValid ? chalk.green('✓') : chalk.red('✗')}`);

      // Display results
      displayValidationResults(result);

      // Handle fixes
      if (!result.isValid && options.fix && result.fixableIssues > 0) {
        const shouldFix = await confirm({
          message: `Found ${result.fixableIssues} fixable issues. Apply fixes?`,
          initialValue: true
        });

        if (shouldFix) {
          s.start('Applying fixes...');
          const fixResult = await validator.applyFixes(result);
          s.stop(`Applied ${fixResult.fixedCount} fixes`);

          if (fixResult.errors.length > 0) {
            consola.warn('Some fixes could not be applied:');
            fixResult.errors.forEach(err => consola.error(`  - ${err}`));
          }

          // Re-run validation after fixes
          if (fixResult.fixedCount > 0) {
            consola.info('\nRe-running validation after fixes...');
            const revalidationResult = await validator.validateProject(
              projectPath,
              projectInfo,
              validationOptions
            );
            displayValidationResults(revalidationResult);
          }
        }
      }

      // Exit code based on validation result
      if (result.isValid) {
        outro(chalk.green('✨ All validations passed!'));
        process.exit(0);
      } else {
        outro(chalk.yellow('⚠️  Validation completed with issues'));
        process.exit(1);
      }

    } catch (error) {
      consola.error('Validation failed:', error);
      process.exit(1);
    }
  });

function displayValidationResults(result: ValidationResult): void {
  console.log('\n' + chalk.bold('Validation Results:'));
  console.log('─'.repeat(50));

  // Summary
  const totalIssues = result.errors.length + result.warnings.length;
  
  if (result.isValid) {
    console.log(chalk.green('✓ All checks passed'));
  } else {
    console.log(chalk.red(`✗ Found ${totalIssues} issue${totalIssues !== 1 ? 's' : ''}`));
  }

  // Group issues by category
  const categories = new Map<string, ValidationIssue[]>();
  
  [...result.errors, ...result.warnings].forEach(issue => {
    const existing = categories.get(issue.category) || [];
    existing.push(issue);
    categories.set(issue.category, existing);
  });

  // Display issues by category
  categories.forEach((issues, category) => {
    console.log(`\n${chalk.bold(formatCategoryName(category))}:`);
    
    issues.forEach(issue => {
      const icon = issue.severity === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
      const message = issue.message;
      const location = issue.file ? chalk.gray(` (${issue.file}${issue.line ? `:${issue.line}` : ''})`) : '';
      
      console.log(`  ${icon} ${message}${location}`);
      
      if (issue.suggestion) {
        console.log(`    ${chalk.gray('→')} ${chalk.gray(issue.suggestion)}`);
      }
    });
  });

  // Summary statistics
  console.log('\n' + chalk.bold('Summary:'));
  console.log(`  Errors: ${result.errors.length > 0 ? chalk.red(result.errors.length) : chalk.green('0')}`);
  console.log(`  Warnings: ${result.warnings.length > 0 ? chalk.yellow(result.warnings.length) : chalk.green('0')}`);
  
  if (result.fixableIssues > 0) {
    console.log(`  Fixable: ${chalk.blue(result.fixableIssues)}`);
  }

  // Performance metrics
  if (result.metrics) {
    console.log('\n' + chalk.bold('Metrics:'));
    if (result.metrics.dependencies) {
      console.log(`  Dependencies: ${result.metrics.dependencies.total} (${result.metrics.dependencies.outdated} outdated)`);
    }
    if (result.metrics.bundleSize) {
      console.log(`  Bundle Size: ${formatBytes(result.metrics.bundleSize)}`);
    }
    if (result.metrics.typesCoverage !== undefined) {
      console.log(`  Type Coverage: ${result.metrics.typesCoverage}%`);
    }
  }
}

function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
/**
 * Remove Command - Service Removal
 * 
 * Removes services from existing projects with dependency checking,
 * file cleanup, and configuration updates.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { Command } from 'commander';
import { intro, outro, select, multiselect, confirm, spinner } from '@clack/prompts';
import chalk from 'chalk';
import { consola } from 'consola';
import path from 'node:path';
import fs from 'fs-extra';

import { ServiceRegistry } from '../services/registry/service-registry.js';
import { ProjectAnalyzer } from '../services/analysis/project-analyzer.js';
import { ServiceRemover } from '../services/removal/service-remover.js';
import type { ServiceType } from '../types/index.js';

export const removeCommand = new Command('remove')
  .description('Remove services from existing project')
  .argument('[services...]', 'Service types to remove (auth, payments, database, etc.)')
  .option('-f, --force', 'Force removal even if dependencies exist')
  .option('--cleanup', 'Remove orphaned files and dependencies')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--keep-config', 'Keep configuration files but remove service code')
  .action(async (services: string[], options) => {
    try {
      intro(chalk.red('🗑️  Removing services from project'));

      // Initialize services
      const registry = new ServiceRegistry();
      const analyzer = new ProjectAnalyzer();
      const remover = new ServiceRemover(registry);

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

      // Display current services
      if (projectInfo.services.length === 0) {
        consola.info('No services found in the project');
        outro(chalk.yellow('Nothing to remove'));
        return;
      }

      consola.info('\nCurrent services:');
      projectInfo.services.forEach(service => {
        consola.info(`  • ${chalk.blue(service)}`);
      });

      let servicesToRemove: string[] = [];

      // Determine services to remove
      if (services.length > 0) {
        // Validate provided service types
        const invalidServices = services.filter(s => !projectInfo.services.includes(s));
        if (invalidServices.length > 0) {
          consola.error(`Services not found in project: ${invalidServices.join(', ')}`);
          process.exit(1);
        }
        servicesToRemove = services;
      } else {
        // Interactive selection
        const selected = await multiselect({
          message: 'Select services to remove:',
          options: projectInfo.services.map(service => ({
            value: service,
            label: service,
            hint: `Remove ${service} service`
          })),
          required: true
        });

        if (typeof selected === 'symbol') {
          outro(chalk.gray('Operation cancelled'));
          return;
        }

        servicesToRemove = selected as string[];
      }

      if (servicesToRemove.length === 0) {
        outro(chalk.yellow('No services selected for removal'));
        return;
      }

      // Check for dependencies
      s.start('Checking service dependencies...');
      const dependencyAnalysis = await remover.analyzeDependencies(
        servicesToRemove,
        projectInfo.services,
        projectPath
      );
      s.stop('Dependencies analyzed');

      // Display dependency warnings
      if (dependencyAnalysis.blockers.length > 0) {
        consola.warn('\nDependent services found:');
        dependencyAnalysis.blockers.forEach(blocker => {
          consola.warn(`  • ${chalk.yellow(blocker.dependentService)} depends on ${chalk.red(blocker.requiredService)}`);
        });

        if (!options.force) {
          const shouldContinue = await confirm({
            message: 'Continue with removal anyway? This may break dependent services.',
            initialValue: false
          });

          if (!shouldContinue) {
            outro(chalk.gray('Removal cancelled'));
            return;
          }
        }
      }

      if (dependencyAnalysis.warnings.length > 0) {
        consola.info('\nRemoval warnings:');
        dependencyAnalysis.warnings.forEach(warning => {
          consola.info(`  • ${chalk.yellow(warning)}`);
        });
      }

      // Preview changes
      s.start('Analyzing files to remove...');
      const removalPlan = await remover.createRemovalPlan(
        servicesToRemove,
        projectPath,
        projectInfo,
        {
          cleanup: options.cleanup,
          keepConfig: options.keepConfig,
          force: options.force
        }
      );
      s.stop('Removal plan created');

      // Display removal plan
      consola.info('\nRemoval Plan:');
      
      if (removalPlan.filesToRemove.length > 0) {
        consola.info('\nFiles to remove:');
        removalPlan.filesToRemove.forEach(file => {
          consola.info(`  ${chalk.red('✗')} ${file}`);
        });
      }

      if (removalPlan.filesToModify.length > 0) {
        consola.info('\nFiles to modify:');
        removalPlan.filesToModify.forEach(file => {
          consola.info(`  ${chalk.yellow('~')} ${file.path}`);
        });
      }

      if (removalPlan.dependenciesToRemove.length > 0) {
        consola.info('\nDependencies to remove:');
        removalPlan.dependenciesToRemove.forEach(dep => {
          consola.info(`  ${chalk.red('✗')} ${dep}`);
        });
      }

      if (removalPlan.envVariablesToRemove.length > 0) {
        consola.info('\nEnvironment variables to remove:');
        removalPlan.envVariablesToRemove.forEach(env => {
          consola.info(`  ${chalk.red('✗')} ${env}`);
        });
      }

      const totalChanges = removalPlan.filesToRemove.length + 
                          removalPlan.filesToModify.length + 
                          removalPlan.dependenciesToRemove.length;

      consola.info(`\nTotal changes: ${chalk.red(totalChanges)}`);

      // Dry run mode
      if (options.dryRun) {
        outro(chalk.blue('Dry run complete - no changes applied'));
        return;
      }

      // Confirm removal
      const shouldProceed = await confirm({
        message: `Remove ${servicesToRemove.length} service${servicesToRemove.length !== 1 ? 's' : ''}?`,
        initialValue: false
      });

      if (!shouldProceed) {
        outro(chalk.gray('Removal cancelled'));
        return;
      }

      // Execute removal
      s.start('Removing services...');

      const removalResult = await remover.executeRemoval(
        removalPlan,
        projectPath,
        {
          backup: true,
          cleanup: options.cleanup
        }
      );

      s.stop('Removal complete');

      // Display results
      if (removalResult.success) {
        consola.success(`\nSuccessfully removed ${servicesToRemove.length} service${servicesToRemove.length !== 1 ? 's' : ''}:`);
        servicesToRemove.forEach(service => {
          consola.success(`  ✓ ${chalk.green(service)}`);
        });

        if (removalResult.backupPath) {
          consola.info(`\nBackup created: ${chalk.gray(removalResult.backupPath)}`);
        }

        if (removalResult.warnings.length > 0) {
          consola.warn('\nWarnings:');
          removalResult.warnings.forEach(warning => {
            consola.warn(`  • ${warning}`);
          });
        }

        if (removalResult.postRemovalSteps.length > 0) {
          consola.info('\nPost-removal steps:');
          removalResult.postRemovalSteps.forEach((step, i) => {
            consola.info(`  ${i + 1}. ${step}`);
          });
        }

        outro(chalk.green('✨ Services removed successfully!'));
      } else {
        consola.error('\nRemoval failed:');
        removalResult.errors.forEach(error => {
          consola.error(`  • ${error}`);
        });

        if (removalResult.backupPath) {
          consola.info(`\nBackup available for restoration: ${chalk.gray(removalResult.backupPath)}`);
        }

        outro(chalk.red('❌ Service removal failed'));
        process.exit(1);
      }

    } catch (error) {
      consola.error('Service removal failed:', error);
      process.exit(1);
    }
  });
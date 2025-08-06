/**
 * Comprehensive Validate Command - Complete Project Validation
 *
 * Validates all aspects of generated projects:
 * - CLAUDE.md compliance (button heights, TypeScript patterns)
 * - Design system usage validation
 * - Norwegian NSM compliance
 * - WCAG AAA accessibility validation
 * - Generates comprehensive reports and fix suggestions
 *
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { confirm, intro, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { consola } from "consola";
import * as path from "path";
import { 
  ValidationRunner, 
  createValidationRunner,
  ValidationRunnerOptions 
} from "../validation/validation-runner";

export const validateComprehensiveCommand = new Command("validate-comprehensive")
  .alias("validate-comp")
  .description("Run comprehensive validation against all standards (CLAUDE.md, Design System, NSM, WCAG)")
  .option("-f, --fix", "Attempt to fix issues automatically")
  .option("--claude", "Validate CLAUDE.md compliance only")
  .option("--design-system", "Validate design system usage only")
  .option("--nsm", "Validate Norwegian NSM compliance only")
  .option("--accessibility", "Validate WCAG accessibility only")
  .option("--wcag", "Alias for --accessibility")
  .option("-v, --verbose", "Show detailed validation output")
  .option("--output-format <format>", "Output format: console, json, html", "console")
  .option("--output-file <file>", "Save report to file")
  .option("--fail-on-warnings", "Exit with error code if warnings are found")
  .option("--skip-git-check", "Skip git repository validation")
  .action(async (options) => {
    try {
      intro(chalk.cyan("🔍 Running Comprehensive Validation"));

      const projectPath = process.cwd();
      const s = spinner();

      // Git repository check
      if (!options.skipGitCheck) {
        s.start("Checking git repository...");
        
        try {
          const { execSync } = require('child_process');
          execSync('git rev-parse --git-dir', { cwd: projectPath, stdio: 'ignore' });
          s.stop("Git repository validated");
        } catch (error) {
          s.stop("No git repository found");
          consola.warn("⚠️  No git repository detected - consider initializing git for better tracking");
        }
      }

      // Initialize validation runner
      const runner = createValidationRunner();

      // Determine validation scope
      const validationOptions: ValidationRunnerOptions = {
        claudeCompliance: options.claude || (!options.designSystem && !options.nsm && !options.accessibility && !options.wcag),
        designSystemUsage: options.designSystem || (!options.claude && !options.nsm && !options.accessibility && !options.wcag),
        nsmCompliance: options.nsm || (!options.claude && !options.designSystem && !options.accessibility && !options.wcag),
        wcagAccessibility: options.accessibility || options.wcag || (!options.claude && !options.designSystem && !options.nsm),
        autoFix: options.fix,
        verbose: options.verbose,
        outputFormat: options.outputFormat as any,
        outputFile: options.outputFile
      };

      // If no specific validation is selected, enable all
      if (!options.claude && !options.designSystem && !options.nsm && !options.accessibility && !options.wcag) {
        validationOptions.claudeCompliance = true;
        validationOptions.designSystemUsage = true;
        validationOptions.nsmCompliance = true;
        validationOptions.wcagAccessibility = true;
      }

      // Show validation scope
      const enabledValidations: string[] = [];
      if (validationOptions.claudeCompliance) enabledValidations.push("CLAUDE.md Compliance");
      if (validationOptions.designSystemUsage) enabledValidations.push("Design System Usage");
      if (validationOptions.nsmCompliance) enabledValidations.push("NSM Security");
      if (validationOptions.wcagAccessibility) enabledValidations.push("WCAG Accessibility");

      consola.info(`\n${chalk.blue('Validation Scope:')} ${enabledValidations.join(", ")}`);

      if (validationOptions.autoFix) {
        consola.info(`${chalk.yellow('Auto-fix:')} Enabled - will automatically fix issues where possible`);
      }

      // Run comprehensive validation
      s.start("Running comprehensive validation...");

      const report = await runner.validateProject(projectPath, validationOptions);

      s.stop(`Validation complete: ${report.success ? chalk.green("✓") : chalk.red("✗")}`);

      // Display results
      if (validationOptions.outputFormat === 'console' || !validationOptions.outputFile) {
        runner.displayComprehensiveReport(report);
      }

      // Handle automatic fixes
      if (validationOptions.autoFix && report.summary.fixableIssues > 0) {
        const shouldRevalidate = await confirm({
          message: `Applied fixes to ${report.summary.fixableIssues} issues. Run validation again?`,
          initialValue: true,
        });

        if (shouldRevalidate) {
          s.start("Re-running validation after fixes...");
          
          const revalidationOptions = { ...validationOptions, autoFix: false };
          const revalidationReport = await runner.validateProject(projectPath, revalidationOptions);
          
          s.stop(`Re-validation complete: ${revalidationReport.success ? chalk.green("✓") : chalk.red("✗")}`);
          
          if (validationOptions.outputFormat === 'console' || !validationOptions.outputFile) {
            console.log('\n' + chalk.bold('📋 Post-Fix Validation Results:'));
            runner.displayComprehensiveReport(revalidationReport);
          }

          // Update final result
          Object.assign(report, revalidationReport);
        }
      }

      // Additional information and next steps
      if (report.summary.totalIssues > 0) {
        console.log(chalk.bold('\n🔧 How to fix issues:'));
        
        if (report.summary.fixableIssues > 0) {
          console.log(`  • Run ${chalk.cyan('xaheen validate-comprehensive --fix')} to auto-fix ${report.summary.fixableIssues} issues`);
        }
        
        if (report.claude.criticalIssues.length > 0) {
          console.log(`  • Review CLAUDE.md standards: button heights (h-12+), input heights (h-14+), readonly interfaces`);
        }
        
        if (report.nsm.criticalIssues.length > 0) {
          console.log(`  • Add NSM data classification comments for sensitive data handling`);
        }
        
        if (report.accessibility.failedCriteria.length > 0) {
          console.log(`  • Fix accessibility: Add ARIA labels, ensure keyboard navigation, check color contrast`);
        }
      }

      // Final recommendations
      if (report.summary.totalIssues === 0) {
        console.log(chalk.green('\n🎉 Congratulations! Your project meets all validation standards.'));
        console.log('Consider running validation regularly to maintain quality standards.');
      } else if (report.success) {
        console.log(chalk.yellow('\n⚠️  Some warnings found, but no critical errors.'));
        console.log('Your project meets minimum standards but could be improved.');
      } else {
        console.log(chalk.red('\n❌ Critical issues found that must be addressed.'));
        console.log('Please fix these issues before deploying to production.');
      }

      // Performance insights
      if (report.summary.executionTime > 5000) {
        console.log(`\n${chalk.gray('Performance:')} Validation took ${report.summary.executionTime}ms`);
        console.log(`Consider excluding test files or using file patterns to improve speed.`);
      }

      // CI/CD integration hints
      console.log(`\n${chalk.gray('💡 Tip:')} Add validation to your CI/CD pipeline:`);
      console.log(`   ${chalk.gray('npm run validate-comprehensive || exit 1')}`);

      // Exit with appropriate code
      const shouldFail = !report.success || 
                        (options.failOnWarnings && report.summary.totalIssues > report.summary.criticalIssues);

      if (shouldFail) {
        outro(chalk.red("❌ Validation failed - see issues above"));
        process.exit(1);
      } else {
        outro(chalk.green("✨ Validation completed successfully"));
        process.exit(0);
      }

    } catch (error) {
      consola.error("Comprehensive validation failed:", error);
      
      if (error.code === 'ENOENT') {
        consola.error("Make sure you're running this command in a valid project directory");
      }
      
      outro(chalk.red("❌ Validation system error"));
      process.exit(1);
    }
  });

// Additional helper command for validation setup
export const validateSetupCommand = new Command("validate-setup")
  .description("Set up validation configuration for your project")
  .option("--config-file <file>", "Configuration file path", ".xaheen-validation.json")
  .action(async (options) => {
    try {
      intro(chalk.cyan("🔧 Setting up validation configuration"));

      const configPath = path.join(process.cwd(), options.configFile);
      
      const defaultConfig = {
        claude: {
          buttonMinHeight: 12,
          inputMinHeight: 14,
          strictTypeScript: true,
          professionalSizing: true
        },
        designSystem: {
          packageName: "@xaheen-ai/design-system",
          enforceImports: true,
          allowHardcodedValues: false
        },
        nsm: {
          defaultClassification: "OPEN",
          requireClassification: true,
          norwegianLocale: true
        },
        accessibility: {
          wcagLevel: "AAA",
          enforceAria: true,
          colorContrastRatio: 7.0
        },
        validation: {
          excludePatterns: [
            "**/node_modules/**",
            "**/dist/**", 
            "**/build/**",
            "**/*.test.*",
            "**/*.spec.*"
          ],
          includePatterns: [
            "src/**/*.{ts,tsx,js,jsx}",
            "components/**/*.{ts,tsx,js,jsx}",
            "pages/**/*.{ts,tsx,js,jsx}"
          ]
        }
      };

      const fs = require('fs-extra');
      await fs.writeJSON(configPath, defaultConfig, { spaces: 2 });

      consola.success(`✅ Validation configuration created at ${configPath}`);
      consola.info("You can now customize the configuration to match your project needs");
      consola.info(`Run ${chalk.cyan('xaheen validate-comprehensive')} to start validation`);

      outro(chalk.green("✨ Setup completed"));
    } catch (error) {
      consola.error("Failed to set up validation configuration:", error);
      outro(chalk.red("❌ Setup failed"));
      process.exit(1);
    }
  });

// Export both commands
export { validateComprehensiveCommand as default };
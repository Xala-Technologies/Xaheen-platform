/**
 * @fileoverview AI-powered code generation and modification commands using Codebuff
 * @version 1.0.0
 * @author Xala Technologies
 */

import { Command } from 'commander';
import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  diffPreview, 
  applyPatch, 
  createCodebuffIndex,
  validateGitRepository,
  hasUncommittedChanges,
  getCurrentBranch
} from '../lib/patch-utils.js';
import { AIRefactoringGenerator } from '../generators/ai/refactoring.generator.js';
import type { AIRefactoringOptions } from '../generators/ai/refactoring.generator.js';

export interface AICommandOptions {
  readonly model?: string;
  readonly dryRun?: boolean;
  readonly autoCommit?: boolean;
  readonly interactive?: boolean;
  readonly index?: boolean;
}

/**
 * Runs Codebuff CLI and returns the generated patch
 */
async function runCodebuffCLI(
  cwd: string, 
  prompt: string, 
  options: { model?: string; verbose?: boolean } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [cwd, prompt];
    
    // Add model option if specified
    if (options.model) {
      process.env.OPENAI_MODEL = options.model;
    }
    
    const codebuffProcess = spawn('codebuff', args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    let output = '';
    let errorOutput = '';
    
    codebuffProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    codebuffProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    codebuffProcess.on('close', (code) => {
      if (code === 0) {
        // Extract patch from output - Codebuff typically outputs the patch
        resolve(output);
      } else {
        reject(new Error(`Codebuff failed with code ${code}: ${errorOutput}`));
      }
    });
    
    codebuffProcess.on('error', (error) => {
      reject(new Error(`Failed to start Codebuff: ${error.message}`));
    });
  });
}

/**
 * Main AI command using Codebuff for context-aware code generation
 */
export async function codebuffCommand(prompt: string, options: AICommandOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const {
    model = 'gpt-4',
    dryRun = false,
    autoCommit = true,
    interactive = true,
    index = false
  } = options;

  console.log(chalk.blue('🤖 Xaheen AI - Context-Aware Code Generation\n'));

  // Validate Git repository
  if (!validateGitRepository(cwd)) {
    console.error(chalk.red('❌ Error: Not a Git repository. Please run this command in a Git repository.'));
    process.exit(1);
  }

  // Check for uncommitted changes
  if (hasUncommittedChanges(cwd) && autoCommit) {
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'You have uncommitted changes. Continue anyway?',
        default: false
      }
    ]);
    
    if (!proceed) {
      console.log(chalk.yellow('Operation cancelled.'));
      return;
    }
  }

  // Create or update Codebuff index if requested
  if (index) {
    const indexSuccess = await createCodebuffIndex(cwd);
    if (!indexSuccess) {
      console.error(chalk.red('❌ Failed to create Codebuff index. Continuing without index...'));
    }
  }

  try {
    console.log(chalk.blue(`🔍 Analyzing codebase and generating patch for: "${prompt}"`));
    console.log(chalk.gray(`📍 Branch: ${getCurrentBranch(cwd)}`));
    console.log(chalk.gray(`🤖 Model: ${model}\n`));

    // Generate patch using Codebuff CLI
    const patch = await runCodebuffCLI(cwd, prompt, { model, verbose: true });

    if (!patch || patch.trim().length === 0) {
      console.log(chalk.yellow('⚠️ No changes generated. The request might not require code modifications.'));
      return;
    }

    // Show interactive diff preview
    let accepted = true;
    if (interactive) {
      accepted = await diffPreview(patch, { cwd, dryRun });
    }

    if (!accepted) {
      console.log(chalk.yellow('🚫 Changes cancelled by user.'));
      return;
    }

    if (dryRun) {
      console.log(chalk.blue('🔍 Dry run completed - no changes applied.'));
      return;
    }

    // Apply the patch
    const result = await applyPatch(patch, {
      cwd,
      autoCommit,
      commitMessage: `AI: ${prompt}`
    });

    if (result.success) {
      console.log(chalk.green('\n✅ Codebuff changes applied successfully!'));
      console.log(chalk.blue(`📁 Files changed: ${result.filesChanged.length}`));
      console.log(chalk.green(`➕ Lines added: ${result.linesAdded}`));
      console.log(chalk.red(`➖ Lines removed: ${result.linesRemoved}`));
      
      if (result.filesChanged.length > 0) {
        console.log(chalk.gray('\n📄 Modified files:'));
        result.filesChanged.forEach(file => {
          console.log(chalk.gray(`  • ${file}`));
        });
      }
    } else {
      console.error(chalk.red('\n❌ Failed to apply changes:'));
      console.error(chalk.red(result.error || 'Unknown error'));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error running Codebuff:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * AI command to fix failing tests
 */
export async function fixTestsCommand(options: AICommandOptions = {}): Promise<void> {
  console.log(chalk.blue('🧪 AI Test Fixer\n'));

  // Run tests to identify failures
  try {
    const { execSync } = await import('child_process');
    console.log(chalk.blue('🔍 Running tests to identify failures...'));
    
    execSync('npm test', { 
      cwd: process.cwd(), 
      stdio: 'inherit' 
    });
    
    console.log(chalk.green('✅ All tests are already passing!'));
    return;
    
  } catch (error) {
    console.log(chalk.yellow('⚠️ Tests are failing. Attempting AI-powered fixes...\n'));
    
    await codebuffCommand(
      'Fix the failing tests. Analyze the test output and make the necessary code changes to make all tests pass.',
      {
        ...options,
        autoCommit: true
      }
    );
  }
}

/**
 * AI command for Norwegian compliance enhancements
 */
export async function norwegianComplianceCommand(prompt: string, options: AICommandOptions = {}): Promise<void> {
  const enhancedPrompt = `${prompt}

Please ensure the implementation follows Norwegian compliance requirements:
- GDPR compliance for data handling
- NSM (Norwegian National Security Authority) standards
- BankID integration patterns where applicable
- Norwegian language support (Bokmål)
- Accessibility compliance (WCAG 2.2 AAA)
- PCI DSS compliance for payment processing
- Proper error handling and logging for audit trails`;

  await codebuffCommand(enhancedPrompt, options);
}

/**
 * AI refactoring command to generate refactoring assistants
 */
export async function generateRefactoringAssistantCommand(
  name: string,
  framework: string,
  outputPath: string,
  options: {
    providers?: string[];
    features?: string[];
    includeUI?: boolean;
    includeGit?: boolean;
    includeTests?: boolean;
    includeCLI?: boolean;
  } = {}
): Promise<void> {
  console.log(chalk.blue('🤖 Generating AI Refactoring Assistant\n'));

  try {
    const generator = new AIRefactoringGenerator();
    
    const refactoringOptions: AIRefactoringOptions = {
      name: name,
      framework: framework as any,
      aiProviders: options.providers as any || ['openai', 'anthropic'],
      outputPath: outputPath,
      features: options.features as any || [
        'extract-function',
        'rename-variable',
        'simplify-condition',
        'remove-duplication',
        'optimize-imports',
        'modernize-syntax'
      ],
      includeInteractiveUI: options.includeUI ?? true,
      includeGitIntegration: options.includeGit ?? true,
      includeTests: options.includeTests ?? true,
      includeCLI: options.includeCLI ?? true,
      confidenceThreshold: 0.7,
      maxSuggestionsPerFile: 10
    };

    await generator.generate(refactoringOptions);

    console.log(chalk.green('\n✅ AI Refactoring Assistant generated successfully!'));
    console.log(chalk.blue(`📁 Generated at: ${outputPath}`));
    console.log(chalk.yellow(`🎯 Framework: ${framework}`));
    console.log(chalk.yellow(`🤖 AI Providers: ${refactoringOptions.aiProviders.join(', ')}`));
    console.log(chalk.yellow(`⚡ Features: ${refactoringOptions.features.join(', ')}`));
    
    console.log(chalk.cyan('\n📋 Next steps:'));
    console.log(chalk.gray('  1. Install dependencies: npm install'));
    console.log(chalk.gray('  2. Configure AI provider API keys in environment variables'));
    console.log(chalk.gray('  3. Run the CLI: npx your-refactor-cli analyze <files>'));
    console.log(chalk.gray('  4. Start refactoring with interactive mode'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error generating AI Refactoring Assistant:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Creates the AI command structure for the CLI
 */
export function createAICommand(): Command {
  const aiCommand = new Command('ai')
    .description('AI-powered code generation and modification using Codebuff')
    .option('-m, --model <model>', 'AI model to use', 'gpt-4')
    .option('--dry-run', 'Preview changes without applying them', false)
    .option('--no-auto-commit', 'Skip automatic Git commit', false)
    .option('--no-interactive', 'Skip interactive confirmation', false)
    .option('--index', 'Create/update Codebuff index before generation', false);

  // Main code generation command
  aiCommand
    .command('code <prompt>')
    .description('Generate code changes from natural language prompt')
    .action(async (prompt: string, options) => {
      await codebuffCommand(prompt, {
        model: aiCommand.opts().model,
        dryRun: aiCommand.opts().dryRun,
        autoCommit: aiCommand.opts().autoCommit,
        interactive: aiCommand.opts().interactive,
        index: aiCommand.opts().index
      });
    });

  // Fix failing tests
  aiCommand
    .command('fix-tests')
    .description('Automatically fix failing tests using AI')
    .action(async () => {
      await fixTestsCommand({
        model: aiCommand.opts().model,
        dryRun: aiCommand.opts().dryRun,
        autoCommit: aiCommand.opts().autoCommit,
        interactive: aiCommand.opts().interactive
      });
    });

  // Norwegian compliance enhancements
  aiCommand
    .command('norwegian <prompt>')
    .description('Generate code with Norwegian compliance requirements')
    .action(async (prompt: string) => {
      await norwegianComplianceCommand(prompt, {
        model: aiCommand.opts().model,
        dryRun: aiCommand.opts().dryRun,
        autoCommit: aiCommand.opts().autoCommit,
        interactive: aiCommand.opts().interactive,
        index: aiCommand.opts().index
      });
    });

  // Index management
  aiCommand
    .command('index')
    .description('Create or update Codebuff index for better context awareness')
    .action(async () => {
      await createCodebuffIndex(process.cwd());
    });

  // AI Refactoring Assistant generator
  aiCommand
    .command('refactor-assistant <name> <framework> <outputPath>')
    .description('Generate an AI-powered refactoring assistant for your project')
    .option('-p, --providers <providers>', 'Comma-separated list of AI providers (openai,anthropic,local-llm)', 'openai,anthropic')
    .option('-f, --features <features>', 'Comma-separated list of refactoring features', 'extract-function,rename-variable,simplify-condition,remove-duplication,optimize-imports,modernize-syntax')
    .option('--no-ui', 'Skip generating interactive UI components')
    .option('--no-git', 'Skip generating Git integration')
    .option('--no-tests', 'Skip generating test files')
    .option('--no-cli', 'Skip generating CLI interface')
    .action(async (name: string, framework: string, outputPath: string, options) => {
      await generateRefactoringAssistantCommand(name, framework, outputPath, {
        providers: options.providers.split(','),
        features: options.features.split(','),
        includeUI: options.ui,
        includeGit: options.git,
        includeTests: options.tests,
        includeCLI: options.cli
      });
    });

  return aiCommand;
}

export default createAICommand;

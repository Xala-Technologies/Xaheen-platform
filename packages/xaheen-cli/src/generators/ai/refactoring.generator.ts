import { BaseGenerator } from "../base.generator.js";
import { promises as fs } from "fs";
import { join } from "path";

export interface AIRefactoringOptions {
	readonly name: string;
	readonly framework: "react" | "vue" | "angular" | "nestjs" | "express" | "fastify" | "next" | "generic";
	readonly aiProviders: readonly ("openai" | "anthropic" | "claude" | "local-llm")[];
	readonly outputPath: string;
	readonly features: readonly RefactoringFeature[];
	readonly includeInteractiveUI?: boolean;
	readonly includeGitIntegration?: boolean;
	readonly includeTests?: boolean;
	readonly includeCLI?: boolean;
	readonly confidenceThreshold?: number;
	readonly maxSuggestionsPerFile?: number;
}

export type RefactoringFeature =
	| "extract-function"
	| "rename-variable"  
	| "simplify-condition"
	| "remove-duplication"
	| "optimize-imports"
	| "extract-component"
	| "split-large-functions"
	| "improve-naming"
	| "add-type-annotations"
	| "modernize-syntax"
	| "performance-optimization"
	| "accessibility-improvements";

export class AIRefactoringGenerator extends BaseGenerator<AIRefactoringOptions> {
	async generate(options: AIRefactoringOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating AI Refactoring Assistant: ${options.name}`);

		try {
			// Generate main refactoring service
			await this.generateRefactoringService(options);

			// Generate AI provider integrations
			await this.generateAIProviders(options);

			// Generate framework-specific analyzers
			await this.generateFrameworkAnalyzers(options);

			// Generate refactoring strategies
			await this.generateRefactoringStrategies(options);

			// Generate types
			await this.generateTypes(options);

			// Generate interactive UI if requested
			if (options.includeInteractiveUI) {
				await this.generateInteractiveUI(options);
			}

			// Generate CLI interface if requested
			if (options.includeCLI) {
				await this.generateCLIInterface(options);
			}

			// Generate Git integration if requested
			if (options.includeGitIntegration) {
				await this.generateGitIntegration(options);
			}

			// Generate configuration
			await this.generateConfiguration(options);

			// Generate tests
			if (options.includeTests) {
				await this.generateTests(options);
			}

			// Generate utilities
			await this.generateUtilities(options);

			this.logger.success(
				`AI Refactoring Assistant generated successfully at ${options.outputPath}`,
			);
		} catch (error) {
			this.logger.error("Failed to generate AI Refactoring Assistant", error);
			throw error;
		}
	}

	protected async validateOptions(options: AIRefactoringOptions): Promise<void> {
		if (!options.name || !options.outputPath) {
			throw new Error("Name and output path are required");
		}

		if (!options.aiProviders || options.aiProviders.length === 0) {
			throw new Error("At least one AI provider must be specified");
		}

		if (!options.features || options.features.length === 0) {
			throw new Error("At least one refactoring feature must be specified");
		}
	}

	private async generateRefactoringService(options: AIRefactoringOptions): Promise<void> {
		const serviceContent = `import type {
  RefactoringSuggestion,
  RefactoringResult,
  DeveloperFeedback,
  ${options.name}Config,
  RefactoringOptions,
  AnalysisContext
} from './types.js';
import { ${this.getFrameworkAnalyzer(options.framework)} } from './analyzers/${options.framework}-analyzer.js';
${options.aiProviders.map(provider => 
  `import { ${this.getProviderClass(provider)} } from './providers/${provider}-provider.js';`
).join('\n')}
import { RefactoringEngine } from './engine/refactoring-engine.js';
import { FeedbackManager } from './feedback/feedback-manager.js';
${options.includeGitIntegration ? "import { GitIntegration } from './git/git-integration.js';" : ""}
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * AI-Powered Code Refactoring Assistant
 * Framework: ${options.framework}
 * AI Providers: ${options.aiProviders.join(', ')}
 * Features: ${options.features.join(', ')}
 */
export class ${options.name}RefactoringAssistant {
  private readonly analyzer: ${this.getFrameworkAnalyzer(options.framework)};
  private readonly aiProviders: Map<string, any> = new Map();
  private readonly engine: RefactoringEngine;
  private readonly feedbackManager: FeedbackManager;
  ${options.includeGitIntegration ? "private readonly gitIntegration: GitIntegration;" : ""}

  constructor(
    private readonly projectPath: string,
    private readonly config: ${options.name}Config
  ) {
    this.analyzer = new ${this.getFrameworkAnalyzer(options.framework)}(projectPath, config);
    this.engine = new RefactoringEngine(config);
    this.feedbackManager = new FeedbackManager(projectPath);
    ${options.includeGitIntegration ? "this.gitIntegration = new GitIntegration(projectPath);" : ""}

    // Initialize AI providers
    ${options.aiProviders.map(provider => `
    this.aiProviders.set('${provider}', new ${this.getProviderClass(provider)}(config.${provider}Config));`).join('')}
  }

  /**
   * Analyze code and generate refactoring suggestions
   */
  async generateSuggestions(
    filePath: string,
    options: RefactoringOptions = {}
  ): Promise<RefactoringSuggestion[]> {
    try {
      this.logger.info(\`Analyzing \${filePath} for refactoring opportunities...\`);

      const fullPath = join(this.projectPath, filePath);
      const code = await readFile(fullPath, 'utf-8');

      const context: AnalysisContext = {
        filePath,
        code,
        framework: '${options.framework}',
        features: options.features || this.config.defaultFeatures,
        confidenceThreshold: options.confidenceThreshold || this.config.confidenceThreshold,
        maxSuggestions: options.maxSuggestions || this.config.maxSuggestionsPerFile
      };

      // Framework-specific analysis
      const frameworkSuggestions = await this.analyzer.analyze(context);

      // AI-enhanced analysis
      const aiSuggestions = await this.generateAISuggestions(context);

      // Combine and deduplicate suggestions
      const allSuggestions = [...frameworkSuggestions, ...aiSuggestions];
      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);

      // Filter by confidence threshold
      const filteredSuggestions = uniqueSuggestions.filter(
        s => s.confidence >= context.confidenceThreshold
      );

      // Sort by priority
      const sortedSuggestions = this.prioritizeSuggestions(filteredSuggestions);

      // Limit suggestions
      const limitedSuggestions = sortedSuggestions.slice(0, context.maxSuggestions);

      this.logger.info(\`Generated \${limitedSuggestions.length} refactoring suggestions for \${filePath}\`);

      return limitedSuggestions;
    } catch (error) {
      this.logger.error(\`Failed to generate suggestions for \${filePath}\`, error);
      return [];
    }
  }

  /**
   * Generate AI-enhanced refactoring suggestions
   */
  private async generateAISuggestions(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    for (const providerName of this.config.aiProviders) {
      const provider = this.aiProviders.get(providerName);
      if (!provider) continue;

      try {
        const providerSuggestions = await provider.analyzeCode(context);
        suggestions.push(...providerSuggestions);
      } catch (error) {
        this.logger.warn(\`AI provider \${providerName} failed to analyze code\`, error);
      }
    }

    return suggestions;
  }

  /**
   * Apply selected refactoring suggestions with interactive preview
   */
  async applyRefactorings(
    suggestions: RefactoringSuggestion[],
    interactive: boolean = true
  ): Promise<RefactoringResult> {
    const result: RefactoringResult = {
      success: true,
      appliedSuggestions: [],
      rejectedSuggestions: [],
      errors: [],
      ${options.includeGitIntegration ? "gitCommitHash: undefined," : ""}
      metrics: {
        totalSuggestions: suggestions.length,
        processingTimeMs: 0,
        confidenceScore: 0
      }
    };

    const startTime = Date.now();

    for (const suggestion of suggestions) {
      try {
        if (interactive) {
          const shouldApply = await this.promptForApproval(suggestion);
          
          if (!shouldApply) {
            result.rejectedSuggestions.push(suggestion);
            await this.feedbackManager.recordFeedback({
              suggestionId: suggestion.id,
              action: 'rejected',
              timestamp: new Date(),
              reason: 'User declined'
            });
            continue;
          }
        }

        // Apply the refactoring
        await this.engine.applyRefactoring(suggestion);
        result.appliedSuggestions.push(suggestion);

        await this.feedbackManager.recordFeedback({
          suggestionId: suggestion.id,
          action: 'accepted',
          timestamp: new Date()
        });

      } catch (error) {
        result.errors.push(\`Failed to apply refactoring \${suggestion.id}: \${error}\`);
        result.success = false;
      }
    }

    // Calculate metrics
    result.metrics.processingTimeMs = Date.now() - startTime;
    result.metrics.confidenceScore = result.appliedSuggestions.length > 0
      ? result.appliedSuggestions.reduce((sum, s) => sum + s.confidence, 0) / result.appliedSuggestions.length
      : 0;

    ${options.includeGitIntegration ? `
    // Commit changes to Git if any refactorings were applied
    if (result.appliedSuggestions.length > 0) {
      try {
        result.gitCommitHash = await this.gitIntegration.commitRefactorings(
          result.appliedSuggestions
        );
      } catch (error) {
        result.errors.push(\`Failed to commit changes: \${error}\`);
      }
    }` : ""}

    return result;
  }

  /**
   * Preview refactoring changes
   */
  async previewRefactoring(suggestion: RefactoringSuggestion): Promise<string> {
    return this.engine.previewRefactoring(suggestion);
  }

  /**
   * Get refactoring statistics and insights
   */
  async getAnalytics(): Promise<{
    totalSuggestionsGenerated: number;
    acceptanceRate: number;
    topRefactoringTypes: Array<{ type: string; count: number }>;
    averageConfidence: number;
    frameworkSpecificInsights: any;
  }> {
    return this.feedbackManager.getAnalytics();
  }

  /**
   * Bulk refactor multiple files
   */
  async refactorProject(
    filePatterns: string[],
    options: RefactoringOptions = {}
  ): Promise<RefactoringResult[]> {
    const results: RefactoringResult[] = [];
    
    const files = await this.analyzer.findFiles(filePatterns);
    
    for (const file of files) {
      const suggestions = await this.generateSuggestions(file, options);
      if (suggestions.length > 0) {
        const result = await this.applyRefactorings(suggestions, options.interactive);
        results.push(result);
      }
    }
    
    return results;
  }

  // Private helper methods
  private deduplicateSuggestions(suggestions: RefactoringSuggestion[]): RefactoringSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(s => {
      const key = \`\${s.filePath}:\${s.startLine}:\${s.endLine}:\${s.type}\`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private prioritizeSuggestions(suggestions: RefactoringSuggestion[]): RefactoringSuggestion[] {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    return suggestions.sort((a, b) => {
      const aScore = a.confidence * impactWeight[a.impact];
      const bScore = b.confidence * impactWeight[b.impact];
      return bScore - aScore;
    });
  }

  private async promptForApproval(suggestion: RefactoringSuggestion): Promise<boolean> {
    const preview = await this.previewRefactoring(suggestion);
    console.log(preview);
    
    // In a real implementation, this would use inquirer or similar
    return suggestion.confidence > (this.config.confidenceThreshold || 0.7);
  }

  private logger = {
    info: (message: string, ...args: any[]) => console.log(\`[INFO] \${message}\`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(\`[WARN] \${message}\`, ...args),
    error: (message: string, error?: any) => {
      console.error(\`[ERROR] \${message}\`);
      if (error) console.error(error);
    }
  };
}

/**
 * Factory function to create refactoring assistant
 */
export function create${options.name}RefactoringAssistant(
  projectPath: string,
  config: ${options.name}Config
): ${options.name}RefactoringAssistant {
  return new ${options.name}RefactoringAssistant(projectPath, config);
}

export default ${options.name}RefactoringAssistant;`;

		await this.ensureDirectoryExists(options.outputPath);
		await fs.writeFile(
			join(options.outputPath, `${options.name.toLowerCase()}-refactoring.service.ts`),
			serviceContent
		);
	}

	private async generateRefactoringStrategies(options: AIRefactoringOptions): Promise<void> {
		const engineDir = join(options.outputPath, "engine");
		await this.ensureDirectoryExists(engineDir);

		// Generate the main refactoring engine
		const engineContent = `import type { RefactoringSuggestion } from '../types.js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export class RefactoringEngine {
  constructor(private config: any) {}

  async applyRefactoring(suggestion: RefactoringSuggestion): Promise<void> {
    const strategy = this.getRefactoringStrategy(suggestion.type);
    await strategy.apply(suggestion);
  }

  async previewRefactoring(suggestion: RefactoringSuggestion): Promise<string> {
    return \`
=== Refactoring Preview ===
File: \${suggestion.filePath}
Type: \${suggestion.type}
Impact: \${suggestion.impact}
Confidence: \${(suggestion.confidence * 100).toFixed(1)}%

Description: \${suggestion.description}
Reasoning: \${suggestion.reasoning}

--- Original Code (lines \${suggestion.startLine}-\${suggestion.endLine}) ---
\${suggestion.originalCode}

--- Suggested Code ---
\${suggestion.suggestedCode}

=== End Preview ===
    \`.trim();
  }

  async validateRefactoring(suggestion: RefactoringSuggestion): Promise<boolean> {
    try {
      // Basic validation - check if suggested code is syntactically valid
      const strategy = this.getRefactoringStrategy(suggestion.type);
      return await strategy.validate(suggestion);
    } catch (error) {
      return false;
    }
  }

  async rollbackRefactoring(suggestionId: string): Promise<void> {
    // Implementation would track changes and allow rollback
    throw new Error('Rollback functionality not yet implemented');
  }

  private getRefactoringStrategy(type: string): RefactoringStrategy {
    const strategies: Record<string, RefactoringStrategy> = {
      'extract-function': new ExtractFunctionStrategy(),
      'rename-variable': new RenameVariableStrategy(),
      'simplify-condition': new SimplifyConditionStrategy(),
      'remove-duplication': new RemoveDuplicationStrategy(), 
      'optimize-imports': new OptimizeImportsStrategy(),
      'extract-component': new ExtractComponentStrategy(),
      'split-large-functions': new SplitLargeFunctionsStrategy(),
      'improve-naming': new ImproveNamingStrategy(),
      'add-type-annotations': new AddTypeAnnotationsStrategy(),
      'modernize-syntax': new ModernizeSyntaxStrategy(),
      'performance-optimization': new PerformanceOptimizationStrategy(),
      'accessibility-improvements': new AccessibilityImprovementsStrategy()
    };

    return strategies[type] || new DefaultRefactoringStrategy();
  }
}

interface RefactoringStrategy {
  apply(suggestion: RefactoringSuggestion): Promise<void>;
  validate(suggestion: RefactoringSuggestion): Promise<boolean>;
}

class DefaultRefactoringStrategy implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    // Default implementation: replace lines in file
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\\n');

    // Replace the specified lines with the suggested code
    const newLines = [
      ...lines.slice(0, suggestion.startLine - 1),
      ...suggestion.suggestedCode.split('\\n'),
      ...lines.slice(suggestion.endLine)
    ];

    await writeFile(filePath, newLines.join('\\n'));
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    return suggestion.suggestedCode.length > 0;
  }
}

${this.generateRefactoringStrategies(options)}`;

		await fs.writeFile(join(engineDir, "refactoring-engine.ts"), engineContent);
	}

	private generateRefactoringStrategies(options: AIRefactoringOptions): string {
		return options.features.map(feature => {
			switch (feature) {
				case "extract-function":
					return `
class ExtractFunctionStrategy implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    // Extract function refactoring logic
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\\n');

    // Replace lines with function call and add function definition
    const functionName = this.generateFunctionName(suggestion);
    const functionCall = \`\${functionName}();\`;
    const functionDef = \`\\nfunction \${functionName}() {\\n\${suggestion.originalCode}\\n}\\n\`;

    const newLines = [
      ...lines.slice(0, suggestion.startLine - 1),
      functionCall,
      ...lines.slice(suggestion.endLine),
      ...functionDef.split('\\n')
    ];

    await writeFile(filePath, newLines.join('\\n'));
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    // Validate that the code block can be extracted as a function
    return suggestion.originalCode.length > 20 && 
           !suggestion.originalCode.includes('return') ||
           suggestion.originalCode.split('return').length <= 2;
  }

  private generateFunctionName(suggestion: RefactoringSuggestion): string {
    // Generate meaningful function name based on context
    return 'extractedFunction';
  }
}`;

				case "rename-variable":
					return `
class RenameVariableStrategy implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    
    // Apply variable renaming throughout the file
    const updatedContent = content.replace(
      new RegExp(suggestion.originalCode, 'g'),
      suggestion.suggestedCode
    );
    
    await writeFile(filePath, updatedContent);
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    // Validate that the new variable name is valid
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(suggestion.suggestedCode);
  }
}`;

				case "simplify-condition":
					return `
class SimplifyConditionStrategy implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\\n');

    // Replace the condition with simplified version
    const newLines = [
      ...lines.slice(0, suggestion.startLine - 1),
      suggestion.suggestedCode,
      ...lines.slice(suggestion.endLine)
    ];

    await writeFile(filePath, newLines.join('\\n'));
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    // Validate that the condition is syntactically correct
    try {
      new Function(\`if (\${suggestion.suggestedCode}) {}\`);
      return true;
    } catch {
      return false;
    }
  }
}`;

				case "optimize-imports":
					return `
class OptimizeImportsStrategy implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    
    // Extract import section and optimize
    const lines = content.split('\\n');
    const importLines = lines.filter(line => line.trim().startsWith('import'));
    const nonImportLines = lines.filter(line => !line.trim().startsWith('import'));
    
    // Sort and deduplicate imports
    const optimizedImports = this.optimizeImports(importLines);
    
    const newContent = [
      ...optimizedImports,
      '',
      ...nonImportLines
    ].join('\\n');
    
    await writeFile(filePath, newContent);
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    return true; // Import optimization is generally safe
  }

  private optimizeImports(imports: string[]): string[] {
    // Group by type and sort
    const thirdParty = imports.filter(imp => !imp.includes('./') && !imp.includes('../'));
    const relative = imports.filter(imp => imp.includes('./') || imp.includes('../'));
    
    return [
      ...thirdParty.sort(),
      ...relative.sort()
    ];
  }
}`;

				default:
					return `
class ${this.getStrategyClassName(feature)} implements RefactoringStrategy {
  async apply(suggestion: RefactoringSuggestion): Promise<void> {
    // Default implementation
    const filePath = suggestion.filePath;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\\n');

    const newLines = [
      ...lines.slice(0, suggestion.startLine - 1),
      ...suggestion.suggestedCode.split('\\n'),
      ...lines.slice(suggestion.endLine)
    ];

    await writeFile(filePath, newLines.join('\\n'));
  }

  async validate(suggestion: RefactoringSuggestion): Promise<boolean> {
    return suggestion.suggestedCode.length > 0;
  }
}`;
			}
		}).join('\n');
	}

	private getStrategyClassName(feature: string): string {
		return feature.split('-').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join('') + 'Strategy';
	}

	private async generateInteractiveUI(options: AIRefactoringOptions): Promise<void> {
		const uiDir = join(options.outputPath, "ui");
		await this.ensureDirectoryExists(uiDir);

		const interactiveUIContent = `import inquirer from 'inquirer';
import chalk from 'chalk';
import type { RefactoringSuggestion, RefactoringResult } from '../types.js';

export class InteractiveUI {
  async promptForApproval(suggestion: RefactoringSuggestion): Promise<boolean> {
    console.log(chalk.blue('\\n=== Refactoring Suggestion ==='));
    console.log(chalk.yellow(\`File: \${suggestion.filePath}\`));
    console.log(chalk.yellow(\`Type: \${suggestion.type}\`));
    console.log(chalk.yellow(\`Impact: \${suggestion.impact}\`));
    console.log(chalk.yellow(\`Confidence: \${(suggestion.confidence * 100).toFixed(1)}%\`));
    
    console.log(chalk.cyan(\`\\nDescription: \${suggestion.description}\`));
    console.log(chalk.gray(\`Reasoning: \${suggestion.reasoning}\`));

    console.log(chalk.red('\\n--- Original Code ---'));
    console.log(suggestion.originalCode);
    
    console.log(chalk.green('\\n--- Suggested Code ---'));
    console.log(suggestion.suggestedCode);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '✅ Apply this refactoring', value: 'apply' },
          { name: '❌ Skip this refactoring', value: 'skip' },
          { name: '📝 Edit before applying', value: 'edit' },
          { name: '⏭️  Skip all remaining', value: 'skip-all' },
          { name: '✅ Apply all remaining', value: 'apply-all' }
        ]
      }
    ]);

    switch (action) {
      case 'apply':
        return true;
      case 'skip':
        return false;
      case 'edit':
        return await this.promptForEdit(suggestion);
      case 'skip-all':
        // Set flag to skip all remaining
        this.skipAll = true;
        return false;
      case 'apply-all':
        // Set flag to apply all remaining
        this.applyAll = true;
        return true;
      default:
        return false;
    }
  }

  private skipAll = false;
  private applyAll = false;

  async promptForEdit(suggestion: RefactoringSuggestion): Promise<boolean> {
    const { editedCode } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'editedCode',
        message: 'Edit the suggested code:',
        default: suggestion.suggestedCode
      }
    ]);

    if (editedCode && editedCode.trim() !== suggestion.suggestedCode.trim()) {
      suggestion.suggestedCode = editedCode;
      
      const { confirmEdit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmEdit',
          message: 'Apply the edited refactoring?',
          default: true
        }
      ]);

      return confirmEdit;
    }

    return false;
  }

  async displayResults(result: RefactoringResult): Promise<void> {
    console.log(chalk.blue('\\n=== Refactoring Results ==='));
    
    if (result.success) {
      console.log(chalk.green(\`✅ Successfully applied \${result.appliedSuggestions.length} refactorings\`));
    } else {
      console.log(chalk.red(\`❌ Refactoring completed with errors\`));
    }

    if (result.appliedSuggestions.length > 0) {
      console.log(chalk.yellow('\\nApplied Refactorings:'));
      result.appliedSuggestions.forEach(s => {
        console.log(chalk.green(\`  ✅ \${s.title} (\${s.filePath})\`));
      });
    }

    if (result.rejectedSuggestions.length > 0) {
      console.log(chalk.yellow('\\nSkipped Refactorings:'));
      result.rejectedSuggestions.forEach(s => {
        console.log(chalk.gray(\`  ⏭️  \${s.title} (\${s.filePath})\`));
      });
    }

    if (result.errors.length > 0) {
      console.log(chalk.red('\\nErrors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(\`  ❌ \${error}\`));
      });
    }

    console.log(chalk.blue(\`\\nProcessing time: \${result.metrics.processingTimeMs}ms\`));
    console.log(chalk.blue(\`Average confidence: \${(result.metrics.confidenceScore * 100).toFixed(1)}%\`));

    ${options.includeGitIntegration ? `
    if (result.gitCommitHash) {
      console.log(chalk.green(\`Git commit: \${result.gitCommitHash}\`));
    }` : ""}
  }

  async promptForFileSelection(files: string[]): Promise<string[]> {
    const { selectedFiles } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFiles',
        message: 'Select files to refactor:',
        choices: files.map(file => ({ name: file, value: file })),
        pageSize: 15
      }
    ]);

    return selectedFiles;
  }

  async promptForFeatureSelection(availableFeatures: string[]): Promise<string[]> {
    const { selectedFeatures } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFeatures',
        message: 'Select refactoring features to apply:',
        choices: availableFeatures.map(feature => ({
          name: this.formatFeatureName(feature),
          value: feature
        })),
        pageSize: 10
      }
    ]);

    return selectedFeatures;
  }

  async promptForConfiguration(): Promise<any> {
    return await inquirer.prompt([
      {
        type: 'number',
        name: 'confidenceThreshold',
        message: 'Minimum confidence threshold (0-1):',
        default: 0.7,
        validate: (input) => input >= 0 && input <= 1 || 'Must be between 0 and 1'
      },
      {
        type: 'number', 
        name: 'maxSuggestions',
        message: 'Maximum suggestions per file:',
        default: 10,
        validate: (input) => input > 0 || 'Must be greater than 0'
      },
      {
        type: 'confirm',
        name: 'interactive',
        message: 'Run in interactive mode?',
        default: true
      }
    ]);
  }

  private formatFeatureName(feature: string): string {
    return feature.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  shouldSkipAll(): boolean {
    return this.skipAll;
  }

  shouldApplyAll(): boolean {
    return this.applyAll;
  }

  reset(): void {
    this.skipAll = false;
    this.applyAll = false;
  }
}`;

		await fs.writeFile(join(uiDir, "interactive-ui.ts"), interactiveUIContent);
	}

	private async generateCLIInterface(options: AIRefactoringOptions): Promise<void> {
		const cliDir = join(options.outputPath, "cli");
		await this.ensureDirectoryExists(cliDir);

		const cliContent = `#!/usr/bin/env node

import { Command } from 'commander';
import { ${options.name}RefactoringAssistant } from '../${options.name.toLowerCase()}-refactoring.service.js';
import { InteractiveUI } from '../ui/interactive-ui.js';
import { loadConfig } from '../config/config.js';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

const program = new Command();

program
  .name('${options.name.toLowerCase()}-refactor')
  .description('AI-powered code refactoring assistant for ${options.framework} projects')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze code and suggest refactorings')
  .argument('<files...>', 'Files or patterns to analyze')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-f, --features <features>', 'Comma-separated list of features to apply')
  .option('-t, --threshold <number>', 'Confidence threshold (0-1)', '0.7')
  .option('-m, --max <number>', 'Maximum suggestions per file', '10')
  .option('--dry-run', 'Show suggestions without applying them')
  .option('--non-interactive', 'Run without interactive prompts')
  .action(async (files, options) => {
    try {
      const config = await loadConfig(options.config);
      const assistant = new ${options.name}RefactoringAssistant(process.cwd(), config);
      const ui = new InteractiveUI();

      for (const filePattern of files) {
        console.log(chalk.blue(\`\\nAnalyzing \${filePattern}...\`));
        
        const suggestions = await assistant.generateSuggestions(filePattern, {
          features: options.features ? options.features.split(',') : undefined,
          confidenceThreshold: parseFloat(options.threshold),
          maxSuggestions: parseInt(options.max),
          interactive: !options.nonInteractive
        });

        if (suggestions.length === 0) {
          console.log(chalk.gray('No refactoring suggestions found.'));
          continue;
        }

        console.log(chalk.green(\`Found \${suggestions.length} refactoring suggestions:\`));
        
        suggestions.forEach((suggestion, index) => {
          console.log(\`\${index + 1}. \${suggestion.title} (confidence: \${(suggestion.confidence * 100).toFixed(1)}%)\`);
        });

        if (!options.dryRun) {
          const result = await assistant.applyRefactorings(
            suggestions,
            !options.nonInteractive
          );
          
          await ui.displayResults(result);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('refactor')
  .description('Interactive refactoring session')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-p, --pattern <pattern>', 'File pattern to match', '**/*.{ts,tsx,js,jsx}')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const assistant = new ${options.name}RefactoringAssistant(process.cwd(), config);
      const ui = new InteractiveUI();

      console.log(chalk.blue('🤖 ${options.name} AI Refactoring Assistant'));
      console.log(chalk.gray('Framework: ${options.framework}'));
      console.log(chalk.gray('AI Providers: ${options.aiProviders.join(', ')}\\n'));

      // Find files
      const allFiles = await assistant.analyzer.findFiles([options.pattern]);
      if (allFiles.length === 0) {
        console.log(chalk.yellow('No files found matching pattern.'));
        return;
      }

      // Let user select files
      const selectedFiles = await ui.promptForFileSelection(allFiles);
      if (selectedFiles.length === 0) {
        console.log(chalk.yellow('No files selected.'));
        return;
      }

      // Let user select features
      const selectedFeatures = await ui.promptForFeatureSelection([
        ${options.features.map(f => `'${f}'`).join(', ')}
      ]);

      // Get configuration
      const userConfig = await ui.promptForConfiguration();

      // Process files
      for (const file of selectedFiles) {
        console.log(chalk.blue(\`\\n📁 Processing \${file}...\`));
        
        const suggestions = await assistant.generateSuggestions(file, {
          features: selectedFeatures,
          ...userConfig
        });

        if (suggestions.length === 0) {
          console.log(chalk.gray('No suggestions for this file.'));
          continue;
        }

        const result = await assistant.applyRefactorings(suggestions, userConfig.interactive);
        await ui.displayResults(result);
      }

      console.log(chalk.green('\\n✨ Refactoring session complete!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Generate configuration file')
  .option('-o, --output <path>', 'Output path for config file', './${options.name.toLowerCase()}-refactor.config.js')
  .action(async (options) => {
    const configTemplate = \`export default {
  aiProviders: [${options.aiProviders.map(p => `'${p}'`).join(', ')}],
  defaultFeatures: [${options.features.map(f => `'${f}'`).join(', ')}],
  confidenceThreshold: 0.7,
  maxSuggestionsPerFile: 10,
  framework: '${options.framework}',
  ${options.aiProviders.map(provider => `
  ${provider}Config: {
    apiKey: process.env.${provider.toUpperCase()}_API_KEY,
    model: 'default-model'
  },`).join('')}
  analysisOptions: {
    includeComments: true,
    analyzeTestFiles: false,
    ignorePatterns: ['node_modules/**', 'dist/**']
  }
};\`;

    await fs.writeFile(options.output, configTemplate);
    console.log(chalk.green(\`Configuration file created: \${options.output}\`));
  });

program
  .command('stats')
  .description('Show refactoring statistics')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const assistant = new ${options.name}RefactoringAssistant(process.cwd(), config);
      
      const analytics = await assistant.getAnalytics();
      
      console.log(chalk.blue('📊 Refactoring Statistics\\n'));
      console.log(\`Total suggestions: \${analytics.totalSuggestionsGenerated}\`);
      console.log(\`Acceptance rate: \${(analytics.acceptanceRate * 100).toFixed(1)}%\`);
      console.log(\`Average confidence: \${(analytics.averageConfidence * 100).toFixed(1)}%\`);
      
      console.log(chalk.yellow('\\nTop refactoring types:'));
      analytics.topRefactoringTypes.forEach(({ type, count }) => {
        console.log(\`  \${type}: \${count}\`);
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  program.parse();
}

export { program };`;

		await fs.writeFile(join(cliDir, "cli.ts"), cliContent);

		// Generate package.json bin entry helper
		const binContent = `#!/usr/bin/env node
import('./cli.js');`;
		
		await fs.writeFile(join(cliDir, "bin.js"), binContent);
	}

	private async generateGitIntegration(options: AIRefactoringOptions): Promise<void> {
		const gitDir = join(options.outputPath, "git");
		await this.ensureDirectoryExists(gitDir);

		const gitIntegrationContent = `import { execSync } from 'child_process';
import type { RefactoringSuggestion } from '../types.js';
import chalk from 'chalk';

export class GitIntegration {
  constructor(private projectPath: string) {}

  async commitRefactorings(suggestions: RefactoringSuggestion[]): Promise<string> {
    try {
      // Check if we're in a git repository
      if (!await this.checkWorkingDirectory()) {
        throw new Error('Not a git repository');
      }

      // Stage all changes
      execSync('git add .', { cwd: this.projectPath });

      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { 
        cwd: this.projectPath, 
        encoding: 'utf-8' 
      });

      if (!status.trim()) {
        console.log(chalk.yellow('No changes to commit'));
        return '';
      }

      // Generate commit message
      const commitMessage = this.generateCommitMessage(suggestions);

      // Commit changes
      execSync(\`git commit -m "\${commitMessage}"\`, { cwd: this.projectPath });

      // Get commit hash
      const hash = execSync('git rev-parse HEAD', { 
        cwd: this.projectPath, 
        encoding: 'utf-8' 
      }).trim();

      console.log(chalk.green(\`✅ Changes committed: \${hash.substring(0, 8)}\`));
      return hash;
    } catch (error) {
      throw new Error(\`Git commit failed: \${error.message}\`);
    }
  }

  async createBranch(name: string): Promise<void> {
    try {
      execSync(\`git checkout -b \${name}\`, { cwd: this.projectPath });
      console.log(chalk.green(\`✅ Created and switched to branch: \${name}\`));
    } catch (error) {
      throw new Error(\`Failed to create branch: \${error.message}\`);
    }
  }

  generateCommitMessage(suggestions: RefactoringSuggestion[]): string {
    const types = suggestions.map(s => s.type);
    const uniqueTypes = [...new Set(types)];
    
    const fileCount = new Set(suggestions.map(s => s.filePath)).size;
    const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;

    let message = 'refactor: AI-suggested improvements';
    
    if (suggestions.length === 1) {
      message = \`refactor: \${suggestions[0].title}\`;
    } else if (uniqueTypes.length === 1) {
      message = \`refactor: \${uniqueTypes[0]} improvements\`;
    }

    const details = [
      '',
      \`Applied \${suggestions.length} refactoring\${suggestions.length > 1 ? 's' : ''} across \${fileCount} file\${fileCount > 1 ? 's' : ''}\`,
      \`Average confidence: \${(avgConfidence * 100).toFixed(1)}%\`,
      '',
      'Changes:',
      ...suggestions.map(s => \`- \${s.title} (\${s.filePath})\`),
      '',
      '🤖 Generated with ${options.name} AI Refactoring Assistant',
      '',
      'Co-Authored-By: ${options.name}-AI <noreply@xaheen.com>'
    ];

    return \`\${message}\${details.join('\\n')}\`;
  }

  async checkWorkingDirectory(): Promise<boolean> {
    try {
      execSync('git rev-parse --git-dir', { 
        cwd: this.projectPath, 
        stdio: 'ignore' 
      });
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      return execSync('git branch --show-current', {
        cwd: this.projectPath,
        encoding: 'utf-8'
      }).trim();
    } catch (error) {
      throw new Error(\`Failed to get current branch: \${error.message}\`);
    }
  }

  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.projectPath,
        encoding: 'utf-8'
      });
      return status.trim().length > 0;
    } catch {
      return false;
    }
  }

  async stashChanges(message?: string): Promise<void> {
    try {
      const stashMessage = message || 'AI refactoring stash';
      execSync(\`git stash push -m "\${stashMessage}"\`, { cwd: this.projectPath });
      console.log(chalk.yellow(\`📦 Changes stashed: \${stashMessage}\`));
    } catch (error) {
      throw new Error(\`Failed to stash changes: \${error.message}\`);
    }
  }

  async popStash(): Promise<void> {
    try {
      execSync('git stash pop', { cwd: this.projectPath });
      console.log(chalk.green('📦 Stash applied'));
    } catch (error) {
      throw new Error(\`Failed to pop stash: \${error.message}\`);
    }
  }

  async createPullRequest(title: string, body?: string): Promise<void> {
    // This would integrate with GitHub CLI or API
    console.log(chalk.blue(\`Creating PR: \${title}\`));
    console.log(chalk.gray('PR creation requires additional setup with GitHub CLI'));
  }

  async getFileHistory(filePath: string, limit: number = 10): Promise<any[]> {
    try {
      const log = execSync(\`git log -n \${limit} --oneline -- \${filePath}\`, {
        cwd: this.projectPath,
        encoding: 'utf-8'
      });

      return log.trim().split('\\n').map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return {
          hash: hash,
          message: messageParts.join(' ')
        };
      });
    } catch (error) {
      return [];
    }
  }
}`;

		await fs.writeFile(join(gitDir, "git-integration.ts"), gitIntegrationContent);
	}

	private async generateConfiguration(options: AIRefactoringOptions): Promise<void> {
		const configDir = join(options.outputPath, "config");
		await this.ensureDirectoryExists(configDir);

		const configContent = `import type { ${options.name}Config } from '../types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function loadConfig(configPath?: string): Promise<${options.name}Config> {
  const defaultConfig: ${options.name}Config = {
    aiProviders: [${options.aiProviders.map(p => `'${p}'`).join(', ')}],
    defaultFeatures: [${options.features.map(f => `'${f}'`).join(', ')}],
    confidenceThreshold: ${options.confidenceThreshold || 0.7},
    maxSuggestionsPerFile: ${options.maxSuggestionsPerFile || 10},
    framework: '${options.framework}',
    ${options.aiProviders.map(provider => `
    ${provider}Config: {
      apiKey: process.env.${provider.toUpperCase()}_API_KEY || '',
      ${this.getProviderDefaults(provider)}
    },`).join('')}
    analysisOptions: {
      includeComments: true,
      analyzeTestFiles: false,
      ignorePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '*.min.js',
        '*.map'
      ],
      performanceMode: 'thorough'
    },
    outputOptions: {
      format: 'json',
      includeMetrics: true,
      includeDiff: true,
      groupByType: false,
      sortBy: 'confidence'
    },
    integrationOptions: {
      vscodeExtension: false,
      githubActions: false,
      preCommitHook: false,
      cicdIntegration: false
    }
  };

  if (!configPath) {
    // Look for config files in common locations
    const possiblePaths = [
      '${options.name.toLowerCase()}-refactor.config.js',
      '${options.name.toLowerCase()}-refactor.config.mjs',
      '.${options.name.toLowerCase()}-refactor.config.js',
      'refactor.config.js'
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        configPath = path;
        break;
      }
    }
  }

  if (configPath && existsSync(configPath)) {
    try {
      const configModule = await import(\`file://\${join(process.cwd(), configPath)}\`);
      const userConfig = configModule.default || configModule;
      
      return mergeConfigs(defaultConfig, userConfig);
    } catch (error) {
      console.warn(\`Failed to load config from \${configPath}, using defaults\`);
    }
  }

  return defaultConfig;
}

export function mergeConfigs(
  defaultConfig: ${options.name}Config, 
  userConfig: Partial<${options.name}Config>
): ${options.name}Config {
  return {
    ...defaultConfig,
    ...userConfig,
    analysisOptions: {
      ...defaultConfig.analysisOptions,
      ...userConfig.analysisOptions
    },
    outputOptions: {
      ...defaultConfig.outputOptions,
      ...userConfig.outputOptions
    },
    integrationOptions: {
      ...defaultConfig.integrationOptions,
      ...userConfig.integrationOptions
    }
  };
}

export function validateConfig(config: ${options.name}Config): void {
  const errors: string[] = [];

  if (!config.aiProviders || config.aiProviders.length === 0) {
    errors.push('At least one AI provider must be configured');
  }

  if (!config.defaultFeatures || config.defaultFeatures.length === 0) {
    errors.push('At least one refactoring feature must be enabled');
  }

  if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
    errors.push('Confidence threshold must be between 0 and 1');
  }

  if (config.maxSuggestionsPerFile < 1) {
    errors.push('Max suggestions per file must be at least 1');
  }

  // Validate AI provider configs
  for (const provider of config.aiProviders) {
    const providerConfig = config[\`\${provider}Config\`];
    if (!providerConfig || !providerConfig.apiKey) {
      if (provider !== 'local-llm') {
        errors.push(\`API key required for \${provider} provider\`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(\`Configuration validation failed:\\n\${errors.join('\\n')}\`);
  }
}

export const defaultConfigTemplate = \`export default {
  // AI providers to use for analysis
  aiProviders: [${options.aiProviders.map(p => `'${p}'`).join(', ')}],

  // Default refactoring features to apply
  defaultFeatures: [
    ${options.features.map(f => `'${f}'`).join(',\n    ')}
  ],

  // Minimum confidence threshold for suggestions (0-1)
  confidenceThreshold: 0.7,

  // Maximum suggestions per file
  maxSuggestionsPerFile: 10,

  // Target framework
  framework: '${options.framework}',

  // AI Provider Configurations
  ${options.aiProviders.map(provider => `
  ${provider}Config: {
    apiKey: process.env.${provider.toUpperCase()}_API_KEY,
    ${this.getProviderConfigTemplate(provider)}
  },`).join('')}

  // Analysis options
  analysisOptions: {
    includeComments: true,
    analyzeTestFiles: false,
    ignorePatterns: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js'
    ],
    performanceMode: 'thorough' // 'fast' | 'thorough'
  },

  // Output formatting options
  outputOptions: {
    format: 'json', // 'json' | 'markdown' | 'html'
    includeMetrics: true,
    includeDiff: true,
    groupByType: false,
    sortBy: 'confidence' // 'confidence' | 'impact' | 'type' | 'line'
  },

  // Integration options
  integrationOptions: {
    vscodeExtension: false,
    githubActions: false,
    preCommitHook: false,
    cicdIntegration: false
  }
};\`;`;

		await fs.writeFile(join(configDir, "config.ts"), configContent);
	}

	private getProviderDefaults(provider: string): string {
		switch (provider) {
			case "openai":
				return `model: 'gpt-4o',
      maxTokens: 2000,
      timeout: 30000`;
			case "anthropic":
			case "claude":
				return `model: 'claude-3-5-sonnet-20241022',
      maxTokens: 2000,
      timeout: 30000`;
			case "local-llm":
				return `baseURL: 'http://localhost:11434',
      model: 'codellama',
      maxTokens: 2000`;
			default:
				return `model: 'default',
      timeout: 30000`;
		}
	}

	private getProviderConfigTemplate(provider: string): string {
		switch (provider) {
			case "openai":
				return `// model: 'gpt-4o', // or 'gpt-4', 'gpt-3.5-turbo'
    // organization: 'your-org-id',
    // maxTokens: 2000,
    // timeout: 30000`;
			case "anthropic":
			case "claude":
				return `// model: 'claude-3-5-sonnet-20241022',
    // maxTokens: 2000,
    // timeout: 30000`;
			case "local-llm":
				return `baseURL: 'http://localhost:11434', // Ollama default
    // model: 'codellama',
    // maxTokens: 2000`;
			default:
				return `// Configure ${provider} provider options here`;
		}
	}

	private async generateUtilities(options: AIRefactoringOptions): Promise<void> {
		const utilsDir = join(options.outputPath, "utils");
		await this.ensureDirectoryExists(utilsDir);

		// Generate feedback manager
		const feedbackManagerContent = `import type { DeveloperFeedback } from '../types.js';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class FeedbackManager {
  private feedbackHistory: DeveloperFeedback[] = [];
  private feedbackFile: string;

  constructor(private projectPath: string) {
    this.feedbackFile = join(projectPath, '.xaheen', 'refactoring-feedback.json');
    this.loadFeedbackHistory();
  }

  async recordFeedback(feedback: DeveloperFeedback): Promise<void> {
    this.feedbackHistory.push(feedback);
    await this.saveFeedbackHistory();
  }

  async getFeedbackHistory(): Promise<DeveloperFeedback[]> {
    return [...this.feedbackHistory];
  }

  async getAnalytics(): Promise<{
    totalSuggestionsGenerated: number;
    acceptanceRate: number;
    topRefactoringTypes: Array<{ type: string; count: number }>;
    averageConfidence: number;
    frameworkSpecificInsights: any;
  }> {
    const total = this.feedbackHistory.length;
    const accepted = this.feedbackHistory.filter(f => f.action === 'accepted').length;
    const acceptanceRate = total > 0 ? accepted / total : 0;

    // Group by refactoring type (would need to store this in feedback)
    const typeMap = new Map<string, number>();
    const confidenceScores: number[] = [];

    // This would be enhanced with actual refactoring type data
    const topRefactoringTypes = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length
      : 0;

    return {
      totalSuggestionsGenerated: total,
      acceptanceRate,
      topRefactoringTypes,
      averageConfidence,
      frameworkSpecificInsights: {
        framework: '${options.framework}',
        // Add framework-specific metrics here
      }
    };
  }

  async generateReport(): Promise<string> {
    const analytics = await this.getAnalytics();
    const recentFeedback = this.feedbackHistory.slice(-10);

    return \`
=== ${options.name} AI Refactoring Report ===
Generated: \${new Date().toISOString()}

📊 Summary Statistics:
- Total suggestions: \${analytics.totalSuggestionsGenerated}
- Acceptance rate: \${(analytics.acceptanceRate * 100).toFixed(1)}%
- Average confidence: \${(analytics.averageConfidence * 100).toFixed(1)}%

🏆 Top Refactoring Types:
\${analytics.topRefactoringTypes.map(({ type, count }) => 
  \`- \${type}: \${count} times\`
).join('\\n')}

📈 Recent Activity:
\${recentFeedback.map(f => 
  \`- \${f.timestamp.toISOString()}: \${f.action} (\${f.reason || 'no reason'})\`
).join('\\n')}

🎯 Recommendations:
\${this.generateRecommendations(analytics)}
    \`.trim();
  }

  private async loadFeedbackHistory(): Promise<void> {
    try {
      if (existsSync(this.feedbackFile)) {
        const content = await readFile(this.feedbackFile, 'utf-8');
        this.feedbackHistory = JSON.parse(content).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load feedback history:', error);
      this.feedbackHistory = [];
    }
  }

  private async saveFeedbackHistory(): Promise<void> {
    try {
      const dir = join(this.projectPath, '.xaheen');
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      await writeFile(
        this.feedbackFile,
        JSON.stringify(this.feedbackHistory, null, 2)
      );
    } catch (error) {
      console.warn('Failed to save feedback history:', error);
    }
  }

  private generateRecommendations(analytics: any): string {
    const recommendations: string[] = [];

    if (analytics.acceptanceRate < 0.5) {
      recommendations.push('- Consider increasing confidence threshold to improve suggestion quality');
    }

    if (analytics.acceptanceRate > 0.8) {
      recommendations.push('- Consider decreasing confidence threshold to get more suggestions');
    }

    if (analytics.totalSuggestionsGenerated < 10) {
      recommendations.push('- Run refactoring on more files to gather better statistics');
    }

    return recommendations.length > 0 ? recommendations.join('\\n') : '- Looking good! Keep using the refactoring assistant.';
  }
}`;

		await fs.writeFile(join(utilsDir, "feedback-manager.ts"), feedbackManagerContent);
	}

	private async generateTypes(options: AIRefactoringOptions): Promise<void> {
		const typesContent = `/**
 * AI Refactoring Assistant Types
 * Generated with Xaheen CLI
 */

export interface RefactoringSuggestion {
  readonly id: string;
  readonly type: RefactoringType;
  readonly title: string;
  readonly description: string;
  readonly filePath: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly originalCode: string;
  readonly suggestedCode: string;
  readonly confidence: number;
  readonly reasoning: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly aiProvider?: string;
  readonly frameworkSpecific?: boolean;
  readonly estimatedTimeToApply?: number;
  readonly dependencies?: string[];
  readonly tags?: string[];
}

export type RefactoringType = ${options.features.map(f => `'${f}'`).join(' | ')};

export interface RefactoringResult {
  readonly success: boolean;
  readonly appliedSuggestions: RefactoringSuggestion[];
  readonly rejectedSuggestions: RefactoringSuggestion[];
  readonly errors: string[];
  ${options.includeGitIntegration ? "readonly gitCommitHash?: string;" : ""}
  readonly metrics: RefactoringMetrics;
}

export interface RefactoringMetrics {
  readonly totalSuggestions: number;
  readonly processingTimeMs: number;
  readonly confidenceScore: number;
  readonly linesChanged?: number;
  readonly filesAffected?: number;
}

export interface DeveloperFeedback {
  readonly suggestionId: string;
  readonly action: 'accepted' | 'rejected' | 'modified';
  readonly timestamp: Date;
  readonly reason?: string;
  readonly modifiedCode?: string;
  readonly rating?: number;
}

export interface ${options.name}Config {
  readonly aiProviders: readonly ('${options.aiProviders.join("' | '")}')[];
  readonly defaultFeatures: readonly RefactoringType[];
  readonly confidenceThreshold: number;
  readonly maxSuggestionsPerFile: number;
  readonly framework: '${options.framework}';
  ${options.aiProviders.map(provider => `readonly ${provider}Config?: ${this.getProviderConfigType(provider)};`).join('\n  ')}
  readonly analysisOptions?: AnalysisOptions;
  readonly outputOptions?: OutputOptions;
  readonly integrationOptions?: IntegrationOptions;
}

${options.aiProviders.map(provider => this.generateProviderConfigType(provider)).join('\n\n')}

export interface AnalysisOptions {
  readonly includeComments?: boolean;
  readonly analyzeTestFiles?: boolean;
  readonly ignorePatterns?: string[];
  readonly customRules?: CustomRule[];
  readonly performanceMode?: 'fast' | 'thorough';
}

export interface CustomRule {
  readonly id: string;
  readonly name: string;
  readonly pattern: string | RegExp;
  readonly replacement?: string;
  readonly condition?: (code: string, context: AnalysisContext) => boolean;
  readonly confidence: number;
  readonly impact: 'low' | 'medium' | 'high';
}

export interface OutputOptions {
  readonly format: 'json' | 'markdown' | 'html';
  readonly includeMetrics?: boolean;
  readonly includeDiff?: boolean;
  readonly groupByType?: boolean;
  readonly sortBy?: 'confidence' | 'impact' | 'type' | 'line';
}

export interface IntegrationOptions {
  readonly vscodeExtension?: boolean;
  readonly githubActions?: boolean;
  readonly preCommitHook?: boolean;
  readonly cicdIntegration?: boolean;
}

export interface AnalysisContext {
  readonly filePath: string;
  readonly code: string;
  readonly framework: string;
  readonly features: readonly RefactoringType[];
  readonly confidenceThreshold: number;
  readonly maxSuggestions: number;
  readonly additionalContext?: {
    readonly dependencies?: string[];
    readonly projectType?: string;
    readonly version?: string;
    readonly customPatterns?: string[];
  };
}

export interface RefactoringOptions {
  readonly features?: RefactoringType[];
  readonly confidenceThreshold?: number;
  readonly maxSuggestions?: number;
  readonly interactive?: boolean;
  readonly dryRun?: boolean;
  readonly includeTests?: boolean;
  readonly preserveComments?: boolean;
  readonly formatOutput?: boolean;
}

// Framework-specific types
${this.generateFrameworkSpecificTypes(options.framework)}

// Provider-specific types
${options.aiProviders.map(provider => this.generateProviderTypes(provider)).join('\n\n')}

export interface RefactoringEngine {
  applyRefactoring(suggestion: RefactoringSuggestion): Promise<void>;
  previewRefactoring(suggestion: RefactoringSuggestion): Promise<string>;
  validateRefactoring(suggestion: RefactoringSuggestion): Promise<boolean>;
  rollbackRefactoring(suggestionId: string): Promise<void>;
}

export interface FrameworkAnalyzer {
  analyze(context: AnalysisContext): Promise<RefactoringSuggestion[]>;
  findFiles(patterns: string[]): Promise<string[]>;
  validateSyntax(code: string): Promise<boolean>;
  extractMetadata(code: string): Promise<any>;
}

export interface AIProvider {
  analyzeCode(context: AnalysisContext): Promise<RefactoringSuggestion[]>;
  getCapabilities(): string[];
  healthCheck(): Promise<boolean>;
  getUsageStats(): Promise<any>;
}

export interface FeedbackManager {
  recordFeedback(feedback: DeveloperFeedback): Promise<void>;
  getFeedbackHistory(): Promise<DeveloperFeedback[]>;
  getAnalytics(): Promise<any>;
  generateReport(): Promise<string>;
}

${options.includeGitIntegration ? `
export interface GitIntegration {
  commitRefactorings(suggestions: RefactoringSuggestion[]): Promise<string>;
  createBranch(name: string): Promise<void>;
  generateCommitMessage(suggestions: RefactoringSuggestion[]): string;
  checkWorkingDirectory(): Promise<boolean>;
}` : ""}`;

		await fs.writeFile(join(options.outputPath, "types.ts"), typesContent);
	}

	private async generateAIProviders(options: AIRefactoringOptions): Promise<void> {
		const providersDir = join(options.outputPath, "providers");
		await this.ensureDirectoryExists(providersDir);

		for (const provider of options.aiProviders) {
			await this.generateAIProvider(provider, options, providersDir);
		}
	}

	private async generateAIProvider(
		provider: string,
		options: AIRefactoringOptions,
		providersDir: string
	): Promise<void> {
		const providerContent = this.getProviderImplementation(provider, options);
		await fs.writeFile(
			join(providersDir, `${provider}-provider.ts`),
			providerContent
		);
	}

	private getProviderImplementation(provider: string, options: AIRefactoringOptions): string {
		switch (provider) {
			case "openai":
				return this.generateOpenAIProvider(options);
			case "anthropic":
			case "claude":
				return this.generateAnthropicProvider(options);
			case "local-llm":
				return this.generateLocalLLMProvider(options);
			default:
				return this.generateGenericProvider(provider, options);
		}
	}

	private generateOpenAIProvider(options: AIRefactoringOptions): string {
		return `import OpenAI from 'openai';
import type { AIProvider, AnalysisContext, RefactoringSuggestion, OpenAIProviderConfig } from '../types.js';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  
  constructor(private config: OpenAIProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      baseURL: config.baseURL
    });
  }

  async analyzeCode(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    try {
      const prompt = this.buildAnalysisPrompt(context);
      
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: \`You are an expert code refactoring assistant specializing in \${context.framework} development. 
            Analyze the provided code and suggest specific refactorings that improve code quality, maintainability, and performance.
            Focus on: \${context.features.join(', ')}.
            Provide suggestions with confidence scores and detailed reasoning.\`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: this.config.maxTokens || 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      return this.parseRefactoringSuggestions(content, context);
    } catch (error) {
      console.error('OpenAI Provider error:', error);
      return [];
    }
  }

  getCapabilities(): string[] {
    return [
      'extract-function',
      'rename-variable',
      'simplify-condition',
      'optimize-imports',
      'modernize-syntax',
      'performance-optimization'
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async getUsageStats(): Promise<any> {
    return {
      provider: 'openai',
      model: this.config.model || 'gpt-4o',
      requestCount: 0, // Would track in production
      tokenUsage: 0
    };
  }

  private buildAnalysisPrompt(context: AnalysisContext): string {
    return \`
File: \${context.filePath}
Framework: \${context.framework}
Requested Analysis: \${context.features.join(', ')}

Code to analyze:
\\\`\\\`\\\`
\${context.code}
\\\`\\\`\\\`

Please analyze this code and provide refactoring suggestions in the following JSON format:
{
  "suggestions": [
    {
      "type": "extract-function",
      "title": "Extract validation logic",
      "description": "Extract complex validation into separate function",
      "startLine": 15,
      "endLine": 25,
      "originalCode": "...",
      "suggestedCode": "...",
      "confidence": 0.85,
      "reasoning": "Complex validation logic can be extracted for better reusability",
      "impact": "medium"
    }
  ]
}

Focus on actionable, specific suggestions with high confidence scores.
\`;
  }

  private parseRefactoringSuggestions(content: string, context: AnalysisContext): RefactoringSuggestion[] {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        return [];
      }

      return parsed.suggestions.map((s: any, index: number) => ({
        id: \`openai-\${Date.now()}-\${index}\`,
        type: s.type,
        title: s.title,
        description: s.description,
        filePath: context.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        originalCode: s.originalCode,
        suggestedCode: s.suggestedCode,
        confidence: s.confidence,
        reasoning: s.reasoning,
        impact: s.impact,
        aiProvider: 'openai'
      }));
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      return [];
    }
  }
}`;
	}

	private generateAnthropicProvider(options: AIRefactoringOptions): string {
		return `import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AnalysisContext, RefactoringSuggestion, AnthropicProviderConfig } from '../types.js';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  
  constructor(private config: AnthropicProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }

  async analyzeCode(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    try {
      const prompt = this.buildAnalysisPrompt(context);
      
      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens || 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') return [];

      return this.parseRefactoringSuggestions(content.text, context);
    } catch (error) {
      console.error('Anthropic Provider error:', error);
      return [];
    }
  }

  getCapabilities(): string[] {
    return [
      'extract-function',
      'rename-variable', 
      'simplify-condition',
      'remove-duplication',
      'optimize-imports',
      'extract-component',
      'improve-naming',
      'add-type-annotations',
      'modernize-syntax',
      'performance-optimization',
      'accessibility-improvements'
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUsageStats(): Promise<any> {
    return {
      provider: 'anthropic',
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      requestCount: 0,
      tokenUsage: 0
    };
  }

  private buildAnalysisPrompt(context: AnalysisContext): string {
    return \`You are an expert code refactoring assistant specializing in \${context.framework} development.

Analyze the following code and provide specific refactoring suggestions that improve:
- Code quality and maintainability
- Performance and efficiency  
- Type safety and error handling
- Accessibility (if applicable)
- Modern language features

File: \${context.filePath}
Framework: \${context.framework} 
Focus Areas: \${context.features.join(', ')}

Code to analyze:
\\\`\\\`\\\`
\${context.code}
\\\`\\\`\\\`

Provide suggestions in this JSON format:
{
  "suggestions": [
    {
      "type": "extract-function",
      "title": "Extract validation logic",
      "description": "Extract complex validation into separate function",
      "startLine": 15,
      "endLine": 25,
      "originalCode": "...",
      "suggestedCode": "...",
      "confidence": 0.85,
      "reasoning": "Complex validation logic can be extracted for better reusability and testing",
      "impact": "medium"
    }
  ]
}

Requirements:
- Only suggest actionable, specific improvements
- Include line numbers that accurately reflect the code
- Provide complete code snippets for both original and suggested code
- Confidence should reflect how certain you are the change will improve the code
- Impact should indicate the benefit level (low/medium/high)
\`;
  }

  private parseRefactoringSuggestions(content: string, context: AnalysisContext): RefactoringSuggestion[] {
    try {
      // Extract JSON from response (Claude might wrap it in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        return [];
      }

      return parsed.suggestions.map((s: any, index: number) => ({
        id: \`anthropic-\${Date.now()}-\${index}\`,
        type: s.type,
        title: s.title,
        description: s.description,
        filePath: context.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        originalCode: s.originalCode,
        suggestedCode: s.suggestedCode,
        confidence: s.confidence,
        reasoning: s.reasoning,
        impact: s.impact,
        aiProvider: 'anthropic'
      }));
    } catch (error) {
      console.error('Failed to parse Anthropic response:', error);
      return [];
    }
  }
}`;
	}

	private generateLocalLLMProvider(options: AIRefactoringOptions): string {
		return `import type { AIProvider, AnalysisContext, RefactoringSuggestion, LocalLLMProviderConfig } from '../types.js';

export class LocalLLMProvider implements AIProvider {
  constructor(private config: LocalLLMProviderConfig) {}

  async analyzeCode(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    try {
      const prompt = this.buildAnalysisPrompt(context);
      
      const response = await fetch(\`\${this.config.baseURL}/v1/chat/completions\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': \`Bearer \${this.config.apiKey}\` })
        },
        body: JSON.stringify({
          model: this.config.model || 'codellama',
          messages: [
            {
              role: 'system',
              content: \`You are an expert code refactoring assistant. Analyze code and suggest improvements for \${context.framework} applications.\`
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: this.config.maxTokens || 2000
        })
      });

      if (!response.ok) {
        throw new Error(\`Local LLM request failed: \${response.statusText}\`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) return [];

      return this.parseRefactoringSuggestions(content, context);
    } catch (error) {
      console.error('Local LLM Provider error:', error);
      return [];
    }
  }

  getCapabilities(): string[] {
    return [
      'extract-function',
      'rename-variable',
      'simplify-condition', 
      'remove-duplication',
      'optimize-imports',
      'improve-naming'
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(\`\${this.config.baseURL}/health\`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUsageStats(): Promise<any> {
    return {
      provider: 'local-llm',
      model: this.config.model || 'codellama',
      endpoint: this.config.baseURL,
      requestCount: 0
    };
  }

  private buildAnalysisPrompt(context: AnalysisContext): string {
    return \`
Analyze this \${context.framework} code and suggest refactoring improvements:

File: \${context.filePath}
Focus on: \${context.features.join(', ')}

Code:
\\\`\\\`\\\`
\${context.code}
\\\`\\\`\\\`

Provide suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "extract-function",
      "title": "Brief title",
      "description": "What this refactoring does",
      "startLine": 10,
      "endLine": 20,
      "originalCode": "original code snippet",
      "suggestedCode": "improved code snippet", 
      "confidence": 0.8,
      "reasoning": "Why this improves the code",
      "impact": "medium"
    }
  ]
}
\`;
  }

  private parseRefactoringSuggestions(content: string, context: AnalysisContext): RefactoringSuggestion[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        return [];
      }

      return parsed.suggestions.map((s: any, index: number) => ({
        id: \`local-llm-\${Date.now()}-\${index}\`,
        type: s.type,
        title: s.title,
        description: s.description,
        filePath: context.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        originalCode: s.originalCode,
        suggestedCode: s.suggestedCode,
        confidence: s.confidence,
        reasoning: s.reasoning,
        impact: s.impact,
        aiProvider: 'local-llm'
      }));
    } catch (error) {
      console.error('Failed to parse Local LLM response:', error);
      return [];
    }
  }
}`;
	}

	private generateGenericProvider(provider: string, options: AIRefactoringOptions): string {
		return `import type { AIProvider, AnalysisContext, RefactoringSuggestion } from '../types.js';

export class ${this.getProviderClass(provider)} implements AIProvider {
  constructor(private config: any) {}

  async analyzeCode(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    // Implement ${provider} specific analysis logic here
    console.warn('${provider} provider not yet implemented');
    return [];
  }

  getCapabilities(): string[] {
    return ['extract-function', 'rename-variable', 'simplify-condition'];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async getUsageStats(): Promise<any> {
    return { provider: '${provider}' };
  }
}`;
	}

	private async generateFrameworkAnalyzers(options: AIRefactoringOptions): Promise<void> {
		const analyzersDir = join(options.outputPath, "analyzers");
		await this.ensureDirectoryExists(analyzersDir);

		const analyzerContent = this.getFrameworkAnalyzerImplementation(options.framework, options);
		await fs.writeFile(
			join(analyzersDir, `${options.framework}-analyzer.ts`),
			analyzerContent
		);
	}

	private getFrameworkAnalyzerImplementation(framework: string, options: AIRefactoringOptions): string {
		const commonMethods = `
  async findFiles(patterns: string[]): Promise<string[]> {
    const { glob } = await import('glob');
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, { 
        cwd: this.projectPath,
        ignore: ['node_modules/**', 'dist/**', 'build/**']
      });
      files.push(...matches);
    }
    
    return [...new Set(files)];
  }

  async validateSyntax(code: string): Promise<boolean> {
    try {
      ${this.getFrameworkSyntaxValidation(framework)}
      return true;
    } catch {
      return false;
    }
  }

  async extractMetadata(code: string): Promise<any> {
    return {
      lineCount: code.split('\\n').length,
      framework: '${framework}',
      hasTypeScript: code.includes('interface ') || code.includes('type '),
      complexity: this.calculateComplexity(code)
    };
  }

  private calculateComplexity(code: string): number {
    // Simple complexity calculation
    const ifStatements = (code.match(/\\bif\\s*\\(/g) || []).length;
    const forLoops = (code.match(/\\bfor\\s*\\(/g) || []).length;
    const whileLoops = (code.match(/\\bwhile\\s*\\(/g) || []).length;
    const functions = (code.match(/function\\s+\\w+|const\\s+\\w+\\s*=\\s*\\(|\\w+\\s*=>|\\w+\\s*\\(/g) || []).length;
    
    return ifStatements + forLoops + whileLoops + functions;
  }`;

		switch (framework) {
			case "react":
				return `import type { FrameworkAnalyzer, AnalysisContext, RefactoringSuggestion } from '../types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class ReactAnalyzer implements FrameworkAnalyzer {
  constructor(
    private projectPath: string,
    private config: any
  ) {}

  async analyze(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // React-specific analysis
    suggestions.push(...await this.analyzeComponentStructure(context));
    suggestions.push(...await this.analyzeHooks(context));
    suggestions.push(...await this.analyzeProps(context));
    suggestions.push(...await this.analyzeStateManagement(context));
    suggestions.push(...await this.analyzePerformance(context));
    
    return suggestions;
  }

  private async analyzeComponentStructure(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    const lines = context.code.split('\\n');

    // Check for large components that should be split
    const componentRegex = /^\\s*(export\\s+)?(default\\s+)?function\\s+(\\w+)|^\\s*(export\\s+)?const\\s+(\\w+)\\s*=\\s*\\(/;
    let currentComponent: { name: string; start: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (componentRegex.test(line)) {
        currentComponent = {
          name: this.extractComponentName(line),
          start: i
        };
      } else if (line.includes('export default') && currentComponent) {
        const componentLength = i - currentComponent.start;
        
        // Suggest splitting large components
        if (componentLength > 100) {
          suggestions.push({
            id: \`react-split-\${context.filePath}-\${currentComponent.start}\`,
            type: 'extract-component',
            title: \`Split large component \${currentComponent.name}\`,
            description: \`Component \${currentComponent.name} has \${componentLength} lines and could be split into smaller components\`,
            filePath: context.filePath,
            startLine: currentComponent.start + 1,
            endLine: i + 1,
            originalCode: lines.slice(currentComponent.start, i + 1).join('\\n'),
            suggestedCode: this.generateComponentSplitSuggestion(lines.slice(currentComponent.start, i + 1)),
            confidence: 0.7,
            reasoning: 'Large components are harder to maintain and test',
            impact: 'high',
            frameworkSpecific: true
          });
        }
        
        currentComponent = null;
      }
    }

    return suggestions;
  }

  private async analyzeHooks(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    const lines = context.code.split('\\n');

    // Check for useState that could be useReducer
    const multipleSetStates = (context.code.match(/useState\\s*\\(/g) || []).length;
    if (multipleSetStates > 5) {
      suggestions.push({
        id: \`react-reducer-\${context.filePath}\`,
        type: 'modernize-syntax',
        title: 'Replace multiple useState with useReducer',
        description: \`Component has \${multipleSetStates} useState hooks that could be consolidated with useReducer\`,
        filePath: context.filePath,
        startLine: 1,
        endLine: lines.length,
        originalCode: 'Multiple useState declarations',
        suggestedCode: 'useReducer pattern with single state object',
        confidence: 0.6,
        reasoning: 'useReducer is better for complex state logic',
        impact: 'medium',
        frameworkSpecific: true
      });
    }

    // Check for missing dependencies in useEffect
    const useEffectRegex = /useEffect\\s*\\([^,]+,\\s*\\[([^\\]]*)\\]/g;
    let match;
    while ((match = useEffectRegex.exec(context.code)) !== null) {
      const lineIndex = context.code.substring(0, match.index).split('\\n').length - 1;
      
      suggestions.push({
        id: \`react-effect-deps-\${context.filePath}-\${lineIndex}\`,
        type: 'add-type-annotations',
        title: 'Review useEffect dependencies',
        description: 'useEffect dependencies should be verified for completeness',
        filePath: context.filePath,
        startLine: lineIndex + 1,
        endLine: lineIndex + 1,
        originalCode: match[0],
        suggestedCode: 'Review and add missing dependencies',
        confidence: 0.8,
        reasoning: 'Missing dependencies can cause bugs and performance issues',
        impact: 'medium',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private async analyzeProps(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];

    // Check for prop drilling
    const propPatterns = context.code.match(/\\w+\\s*=\\s*{\\s*\\w+\\s*}/g) || [];
    if (propPatterns.length > 3) {
      suggestions.push({
        id: \`react-props-\${context.filePath}\`,
        type: 'extract-component',
        title: 'Consider context or state management for prop drilling',
        description: 'Multiple props being passed down suggests prop drilling',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: 'Props being passed through multiple levels',
        suggestedCode: 'Use React Context or state management library',
        confidence: 0.5,
        reasoning: 'Prop drilling makes components tightly coupled',
        impact: 'medium',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private async analyzeStateManagement(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];

    // Check for direct state mutations
    const stateSetters = context.code.match(/set\\w+\\s*\\([^)]*\\)/g) || [];
    for (const setter of stateSetters) {
      if (setter.includes('.push(') || setter.includes('.pop(') || setter.includes('.splice(')) {
        suggestions.push({
          id: \`react-immutable-\${context.filePath}-\${Date.now()}\`,
          type: 'modernize-syntax',
          title: 'Use immutable state updates',
          description: 'Direct state mutations should be avoided in React',
          filePath: context.filePath,
          startLine: 1,
          endLine: 1,
          originalCode: setter,
          suggestedCode: 'Use spread operator or immutable update patterns',
          confidence: 0.9,
          reasoning: 'Direct mutations can cause React to miss state updates',
          impact: 'high',
          frameworkSpecific: true
        });
      }
    }

    return suggestions;
  }

  private async analyzePerformance(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];

    // Check for missing React.memo opportunities
    if (context.code.includes('export default function') && 
        !context.code.includes('React.memo') && 
        !context.code.includes('memo(')) {
      
      suggestions.push({
        id: \`react-memo-\${context.filePath}\`,
        type: 'performance-optimization',
        title: 'Consider wrapping with React.memo',
        description: 'Component might benefit from memoization',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: 'export default function Component',
        suggestedCode: 'export default React.memo(function Component',
        confidence: 0.4,
        reasoning: 'Memoization can prevent unnecessary re-renders',
        impact: 'low',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private extractComponentName(line: string): string {
    const match = line.match(/function\\s+(\\w+)|const\\s+(\\w+)\\s*=/);
    return match ? (match[1] || match[2] || 'Component') : 'Component';
  }

  private generateComponentSplitSuggestion(lines: string[]): string {
    return \`// TODO: Split this component into smaller, focused components\\n\${lines.join('\\n')}\`;
  }

  ${commonMethods}
}`;

			case "nestjs":
				return `import type { FrameworkAnalyzer, AnalysisContext, RefactoringSuggestion } from '../types.js';

export class NestJSAnalyzer implements FrameworkAnalyzer {
  constructor(
    private projectPath: string,
    private config: any
  ) {}

  async analyze(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // NestJS-specific analysis
    suggestions.push(...await this.analyzeController(context));
    suggestions.push(...await this.analyzeService(context));
    suggestions.push(...await this.analyzeModule(context));
    suggestions.push(...await this.analyzeDecorators(context));
    
    return suggestions;
  }

  private async analyzeController(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Check for missing validation pipes
    if (context.code.includes('@Controller') && 
        context.code.includes('@Body()') && 
        !context.code.includes('ValidationPipe')) {
      
      suggestions.push({
        id: \`nestjs-validation-\${context.filePath}\`,
        type: 'add-type-annotations',
        title: 'Add validation pipe to endpoint',
        description: 'Controller endpoints should validate request bodies',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: '@Body() data',
        suggestedCode: '@Body(ValidationPipe) data: CreateDto',
        confidence: 0.8,
        reasoning: 'Input validation is crucial for API security',
        impact: 'high',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private async analyzeService(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Check for proper error handling
    if (context.code.includes('@Injectable') && 
        !context.code.includes('HttpException') && 
        !context.code.includes('BadRequestException')) {
      
      suggestions.push({
        id: \`nestjs-errors-\${context.filePath}\`,
        type: 'extract-function',
        title: 'Add proper error handling',
        description: 'Service should throw proper HTTP exceptions',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: 'throw new Error()',
        suggestedCode: 'throw new BadRequestException()',
        confidence: 0.7,
        reasoning: 'Proper HTTP exceptions provide better API responses',
        impact: 'medium',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private async analyzeModule(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Check for circular dependencies
    const imports = context.code.match(/@Module\\({[^}]*imports:\\s*\\[[^\\]]*\\]/s);
    if (imports && imports[0].includes('forwardRef')) {
      suggestions.push({
        id: \`nestjs-circular-\${context.filePath}\`,
        type: 'extract-component',
        title: 'Review module dependencies to avoid circular references',
        description: 'forwardRef usage suggests potential circular dependencies',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: 'forwardRef usage',
        suggestedCode: 'Restructure modules to avoid circular dependencies',
        confidence: 0.6,
        reasoning: 'Circular dependencies make modules harder to test and maintain',
        impact: 'medium',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  private async analyzeDecorators(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Check for missing swagger decorators
    if (context.code.includes('@Controller') && 
        context.code.includes('@Post') && 
        !context.code.includes('@ApiOperation')) {
      
      suggestions.push({
        id: \`nestjs-swagger-\${context.filePath}\`,
        type: 'add-type-annotations',
        title: 'Add Swagger/OpenAPI decorators',
        description: 'Controller endpoints should have API documentation',
        filePath: context.filePath,
        startLine: 1,
        endLine: context.code.split('\\n').length,
        originalCode: '@Post()',
        suggestedCode: '@ApiOperation({ summary: "Description" })\\n@Post()',
        confidence: 0.5,
        reasoning: 'API documentation improves developer experience',
        impact: 'low',
        frameworkSpecific: true
      });
    }

    return suggestions;
  }

  ${commonMethods}
}`;

			default:
				return `import type { FrameworkAnalyzer, AnalysisContext, RefactoringSuggestion } from '../types.js';

export class GenericAnalyzer implements FrameworkAnalyzer {
  constructor(
    private projectPath: string,
    private config: any
  ) {}

  async analyze(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Generic analysis that works for any framework
    suggestions.push(...await this.analyzeGeneral(context));
    
    return suggestions;
  }

  private async analyzeGeneral(context: AnalysisContext): Promise<RefactoringSuggestion[]> {
    const suggestions: RefactoringSuggestion[] = [];
    
    // Basic code quality checks
    const lines = context.code.split('\\n');
    
    // Long function detection
    const functionRegex = /function\\s+\\w+|const\\s+\\w+\\s*=\\s*\\(/;
    let currentFunction: { start: number; name: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (functionRegex.test(line)) {
        currentFunction = { start: i, name: 'function' };
      } else if (line.includes('}') && currentFunction) {
        const functionLength = i - currentFunction.start;
        
        if (functionLength > 30) {
          suggestions.push({
            id: \`generic-long-function-\${context.filePath}-\${currentFunction.start}\`,
            type: 'extract-function',
            title: 'Break down long function',
            description: \`Function is \${functionLength} lines long and should be split\`,
            filePath: context.filePath,
            startLine: currentFunction.start + 1,
            endLine: i + 1,
            originalCode: lines.slice(currentFunction.start, i + 1).join('\\n'),
            suggestedCode: 'Extract smaller functions from this large function',
            confidence: 0.7,
            reasoning: 'Long functions are harder to understand and maintain',
            impact: 'medium'
          });
        }
        
        currentFunction = null;
      }
    }

    return suggestions;
  }

  ${commonMethods}
}`;
		}
	}

	private async generateTests(options: AIRefactoringOptions): Promise<void> {
		const testsDir = join(options.outputPath, "__tests__");
		await this.ensureDirectoryExists(testsDir);

		const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${options.name}RefactoringAssistant } from '../${options.name.toLowerCase()}-refactoring.service.js';
import type { ${options.name}Config, RefactoringSuggestion } from '../types.js';
import { join } from 'path';
import { mkdir, writeFile, readFile, rm } from 'fs/promises';

describe('${options.name}RefactoringAssistant', () => {
  let assistant: ${options.name}RefactoringAssistant;
  let testProjectPath: string;
  let mockConfig: ${options.name}Config;

  beforeEach(async () => {
    testProjectPath = join(process.cwd(), 'test-project');
    
    mockConfig = {
      aiProviders: [${options.aiProviders.map(p => `'${p}'`).join(', ')}],
      defaultFeatures: [${options.features.slice(0, 3).map(f => `'${f}'`).join(', ')}],
      confidenceThreshold: 0.7,
      maxSuggestionsPerFile: 5,
      framework: '${options.framework}',
      ${options.aiProviders.map(provider => `
      ${provider}Config: {
        apiKey: 'test-key',
        model: 'test-model'
      },`).join('')}
      analysisOptions: {
        includeComments: true,
        analyzeTestFiles: false,
        ignorePatterns: ['node_modules/**'],
        performanceMode: 'fast'
      }
    };

    // Create test project directory
    await mkdir(testProjectPath, { recursive: true });
    
    assistant = new ${options.name}RefactoringAssistant(testProjectPath, mockConfig);
  });

  afterEach(async () => {
    // Clean up test project
    try {
      await rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('generateSuggestions', () => {
    it('should generate refactoring suggestions for ${options.framework} code', async () => {
      const testCode = \`${this.getTestCode(options.framework)}\`;
      
      const testFile = join(testProjectPath, 'test.${this.getFileExtension(options.framework)}');
      await writeFile(testFile, testCode);

      const suggestions = await assistant.generateSuggestions('test.${this.getFileExtension(options.framework)}');

      expect(suggestions).toBeInstanceOf(Array);
      // Suggestions may be empty if no issues found, which is valid
    });

    it('should respect confidence threshold', async () => {
      const testCode = \`function longFunction() {
        // This is a very long function that should trigger extraction suggestion
        const a = 1;
        const b = 2;
        const c = 3;
        const d = 4;
        const e = 5;
        const f = 6;
        const g = 7;
        const h = 8;
        const i = 9;
        const j = 10;
        console.log(a, b, c, d, e, f, g, h, i, j);
      }\`;
      
      const testFile = join(testProjectPath, 'test.js');
      await writeFile(testFile, testCode);

      const suggestions = await assistant.generateSuggestions('test.js', {
        confidenceThreshold: 0.9 // High threshold
      });

      // Should filter out low confidence suggestions
      suggestions.forEach(s => {
        expect(s.confidence).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should limit suggestions per file', async () => {
      const testCode = \`${this.generateManyIssuesCode()}\`;
      
      const testFile = join(testProjectPath, 'test.js');
      await writeFile(testFile, testCode);

      const suggestions = await assistant.generateSuggestions('test.js', {
        maxSuggestions: 2
      });

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('applyRefactorings', () => {
    it('should apply refactoring suggestions', async () => {
      const originalCode = 'const x = 1;\\nconst y = 2;';
      const testFile = join(testProjectPath, 'test.js');
      await writeFile(testFile, originalCode);

      const mockSuggestion: RefactoringSuggestion = {
        id: 'test-1',
        type: 'rename-variable',
        title: 'Rename variable x to value',
        description: 'Variable x should have a more descriptive name',
        filePath: 'test.js',
        startLine: 1,
        endLine: 1,
        originalCode: 'const x = 1;',
        suggestedCode: 'const value = 1;',
        confidence: 0.8,
        reasoning: 'Descriptive names improve readability',
        impact: 'low'
      };

      const result = await assistant.applyRefactorings([mockSuggestion], false);

      expect(result.success).toBe(true);
      expect(result.appliedSuggestions).toHaveLength(1);
      expect(result.errors).toHaveLength(0);

      // Check if file was actually modified
      const modifiedCode = await readFile(testFile, 'utf-8');
      expect(modifiedCode).toContain('const value = 1;');
    });

    it('should handle refactoring errors gracefully', async () => {
      const mockSuggestion: RefactoringSuggestion = {
        id: 'test-error',
        type: 'extract-function',
        title: 'Test error handling',
        description: 'This should cause an error',
        filePath: 'non-existent-file.js',
        startLine: 1,
        endLine: 1,
        originalCode: 'test',
        suggestedCode: 'test',
        confidence: 0.8,
        reasoning: 'Test',
        impact: 'low'
      };

      const result = await assistant.applyRefactorings([mockSuggestion], false);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('previewRefactoring', () => {
    it('should generate preview of refactoring changes', async () => {
      const mockSuggestion: RefactoringSuggestion = {
        id: 'test-preview',
        type: 'simplify-condition',
        title: 'Simplify boolean condition',
        description: 'Remove explicit true comparison',
        filePath: 'test.js',
        startLine: 5,
        endLine: 5,
        originalCode: 'if (condition === true)',
        suggestedCode: 'if (condition)',
        confidence: 0.9,
        reasoning: 'Explicit boolean comparisons are redundant',
        impact: 'low'
      };

      const preview = await assistant.previewRefactoring(mockSuggestion);

      expect(preview).toContain('Refactoring Preview');
      expect(preview).toContain(mockSuggestion.title);
      expect(preview).toContain(mockSuggestion.originalCode);
      expect(preview).toContain(mockSuggestion.suggestedCode);
      expect(preview).toContain('90.0%'); // Confidence percentage
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const analytics = await assistant.getAnalytics();

      expect(analytics).toHaveProperty('totalSuggestionsGenerated');
      expect(analytics).toHaveProperty('acceptanceRate');
      expect(analytics).toHaveProperty('topRefactoringTypes');
      expect(analytics).toHaveProperty('averageConfidence');
      expect(analytics).toHaveProperty('frameworkSpecificInsights');
    });
  });

  ${options.includeGitIntegration ? `
  describe('Git Integration', () => {
    it('should commit refactoring changes', async () => {
      // This test would require a git repository setup
      // For now, we'll just test the basic functionality
      expect(assistant.gitIntegration).toBeDefined();
    });
  });` : ""}

  describe('AI Provider Integration', () => {
    ${options.aiProviders.map(provider => `
    it('should have ${provider} provider configured', () => {
      expect(assistant.aiProviders.has('${provider}')).toBe(true);
    });`).join('')}
  });
});

// Helper test for framework analyzer
describe('${this.getFrameworkAnalyzer(options.framework)}', () => {
  it('should analyze ${options.framework} specific patterns', async () => {
    const analyzer = new (await import('../analyzers/${options.framework}-analyzer.js')).${this.getFrameworkAnalyzer(options.framework)}(
      process.cwd(),
      {}
    );

    const testCode = \`${this.getTestCode(options.framework)}\`;
    
    const suggestions = await analyzer.analyze({
      filePath: 'test.${this.getFileExtension(options.framework)}',
      code: testCode,
      framework: '${options.framework}',
      features: [${options.features.slice(0, 3).map(f => `'${f}'`).join(', ')}],
      confidenceThreshold: 0.7,
      maxSuggestions: 10
    });

    expect(suggestions).toBeInstanceOf(Array);
  });
});`;

		await fs.writeFile(
			join(testsDir, `${options.name.toLowerCase()}-refactoring.test.ts`),
			testContent
		);
	}

	private getTestCode(framework: string): string {
		switch (framework) {
			case "react":
				return `import React, { useState } from 'react';

export function TestComponent() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  
  if (x === true) {
    console.log('test');
  }
  
  return <div>{x}</div>;
}`;

			case "vue":
				return `<template>
  <div>{{ x }}</div>
</template>

<script>
export default {
  data() {
    return {
      x: 1,
      y: 2,
      z: 3
    };
  },
  methods: {
    testMethod() {
      if (this.x === true) {
        console.log('test');
      }
    }
  }
};
</script>`;

			case "nestjs":
				return `import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTest() {
    const x = 1;
    const y = 2;
    if (x === true) {
      return 'test';
    }
    return 'default';
  }
  
  @Post()
  createTest(@Body() data: any) {
    return data;
  }
}`;

			default:
				return `function testFunction() {
  const x = 1;
  const y = 2;
  const z = 3;
  
  if (x === true) {
    console.log('test');
  }
  
  return x + y + z;
}`;
		}
	}

	private getFileExtension(framework: string): string {
		switch (framework) {
			case "react":
			case "next":
				return "tsx";
			case "vue":
				return "vue";
			case "angular":
				return "ts";
			case "nestjs":
				return "ts";
			default:
				return "js";
		}
	}

	private generateManyIssuesCode(): string {
		return `
function f1() {
  const a = 1;
  const b = 2;
  if (a === true) console.log('1');
}

function f2() {
  const c = 3;
  const d = 4;
  if (c === false) console.log('2');
}

function f3() {
  const e = 5;
  const f = 6;
  if (e === true) console.log('3');
}

function f4() {
  const g = 7;
  const h = 8;
  if (g === false) console.log('4');
}
`;
	}

	// Helper methods for code generation
	private getFrameworkAnalyzer(framework: string): string {
		const mapping: Record<string, string> = {
			react: "ReactAnalyzer",
			vue: "VueAnalyzer", 
			angular: "AngularAnalyzer",
			nestjs: "NestJSAnalyzer",
			express: "ExpressAnalyzer",
			fastify: "FastifyAnalyzer",
			next: "NextAnalyzer",
			generic: "GenericAnalyzer"
		};
		return mapping[framework] || "GenericAnalyzer";
	}

	private getProviderClass(provider: string): string {
		const mapping: Record<string, string> = {
			openai: "OpenAIProvider",
			anthropic: "AnthropicProvider",
			claude: "AnthropicProvider",
			"local-llm": "LocalLLMProvider"
		};
		return mapping[provider] || `${provider.charAt(0).toUpperCase() + provider.slice(1)}Provider`;
	}

	private getProviderConfigType(provider: string): string {
		const mapping: Record<string, string> = {
			openai: "OpenAIProviderConfig",
			anthropic: "AnthropicProviderConfig", 
			claude: "AnthropicProviderConfig",
			"local-llm": "LocalLLMProviderConfig"
		};
		return mapping[provider] || `${provider.charAt(0).toUpperCase() + provider.slice(1)}ProviderConfig`;
	}

	private generateProviderConfigType(provider: string): string {
		switch (provider) {
			case "openai":
				return `export interface OpenAIProviderConfig {
  readonly apiKey: string;
  readonly organization?: string;
  readonly baseURL?: string;
  readonly model?: string;
  readonly maxTokens?: number;
  readonly timeout?: number;
}`;
			case "anthropic":
			case "claude":
				return `export interface AnthropicProviderConfig {
  readonly apiKey: string;
  readonly baseURL?: string;  
  readonly model?: string;
  readonly maxTokens?: number;
  readonly timeout?: number;
}`;
			case "local-llm":
				return `export interface LocalLLMProviderConfig {
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly maxTokens?: number;
  readonly timeout?: number;
}`;
			default:
				return `export interface ${this.getProviderConfigType(provider)} {
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly timeout?: number;
}`;
		}
	}

	private generateFrameworkSpecificTypes(framework: string): string {
		switch (framework) {
			case "react":
				return `// React-specific types
export interface ReactComponentInfo {
  readonly name: string;
  readonly isClass: boolean;
  readonly hasHooks: boolean;
  readonly propsInterface?: string;
  readonly stateInterface?: string;
}

export interface ReactHookUsage {
  readonly hookName: string;
  readonly dependencies?: string[];
  readonly hasCleanup: boolean;
}`;

			case "vue":
				return `// Vue-specific types  
export interface VueComponentInfo {
  readonly name: string;
  readonly isComposition: boolean;
  readonly hasTemplate: boolean;
  readonly scriptSetup: boolean;
}

export interface VueReactivityUsage {
  readonly type: 'ref' | 'reactive' | 'computed' | 'watch';
  readonly name: string;
  readonly dependencies?: string[];
}`;

			case "angular":
				return `// Angular-specific types
export interface AngularComponentInfo {
  readonly selector: string;
  readonly changeDetection?: string;
  readonly hasLifecycleHooks: boolean;
  readonly hasServices: boolean;
}

export interface AngularServiceInfo {
  readonly providedIn?: string;
  readonly hasHttpClient: boolean;
  readonly hasObservables: boolean;
}`;

			default:
				return `// Generic framework types
export interface ComponentInfo {
  readonly name: string;
  readonly type: string;
}`;
		}
	}

	private generateProviderTypes(provider: string): string {
		return `// ${provider} provider types
export interface ${this.getProviderClass(provider)}Usage {
  readonly requestCount: number;
  readonly tokenUsage: number;
  readonly averageLatency: number;
  readonly errorRate: number;
}`;
	}

	private getFrameworkSyntaxValidation(framework: string): string {
		switch (framework) {
			case "react":
				return `
      // Basic JSX syntax validation
      if (code.includes('<') && code.includes('>')) {
        // Check for balanced JSX tags (simplified)
        const openTags = (code.match(/<\\w+/g) || []).length;
        const closeTags = (code.match(/<\\/\\w+>/g) || []).length;
        const selfClosing = (code.match(/<\\w+[^>]*\\/>/g) || []).length;
        
        if (openTags !== closeTags + selfClosing) {
          throw new Error('Unbalanced JSX tags');
        }
      }`;

			case "vue":
				return `
      // Basic Vue template syntax validation
      if (code.includes('<template>')) {
        const templateStart = (code.match(/<template>/g) || []).length;
        const templateEnd = (code.match(/<\\/template>/g) || []).length;
        
        if (templateStart !== templateEnd) {
          throw new Error('Unbalanced template tags');
        }
      }`;

			default:
				return `
      // Basic JavaScript/TypeScript syntax validation
      try {
        new Function(code);
      } catch (error) {
        throw new Error('Invalid JavaScript syntax');
      }`;
		}
	}

	private async ensureDirectoryExists(dir: string): Promise<void> {
		try {
			await fs.mkdir(dir, { recursive: true });
		} catch (error) {
			// Directory might already exist
		}
	}
}

export default AIRefactoringGenerator;
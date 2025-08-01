/**
 * AI Command Implementation
 * 
 * Provides AI-powered code generation and assistance using the integrated RAG system.
 * Supports natural language code generation with Norwegian compliance.
 * 
 * Features:
 * - Natural language to code generation
 * - Pattern-based code suggestions
 * - Norwegian compliance validation
 * - Interactive AI assistance
 * - Knowledge base management
 * - Code analysis and improvement
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { inject, injectable } from 'inversify';
import ora from 'ora';
import { PromptTemplateEngine } from '../ai/prompts/PromptTemplateEngine.js';
import { AIServiceFactory } from '../ai/services/AIServiceFactory.js';
import { 
  IConfigurationService, 
  IFileSystemService, 
  ILocalizationService,
  ILoggingService 
} from '../architecture/interfaces.js';
import { AIEnhancedComponentGenerator } from '../generators/ai-enhanced-component-generator.js';
import { KnowledgeBaseSeeder } from '../rag/knowledge-base/KnowledgeBaseSeeder.js';
import { PatternMatcher } from '../rag/pattern-matching/PatternMatcher.js';
import { ChromaDBStore } from '../rag/vector-store/ChromaDBStore.js';
import { EmbeddingGenerator } from '../rag/vector-store/EmbeddingGenerator.js';
import { LocaleCode, NorwegianCompliance } from '../types/compliance.js';

/**
 * AI generation options
 */
interface IAIGenerationOptions {
  type: 'component' | 'service' | 'page' | 'api' | 'test' | 'pattern';
  description: string;
  language?: string;
  framework?: string;
  output?: string;
  compliance?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  locale?: LocaleCode;
  interactive?: boolean;
  analyze?: boolean;
  validate?: boolean;
}

/**
 * Knowledge base options
 */
interface IKnowledgeBaseOptions {
  seed?: boolean;
  rebuild?: boolean;
  export?: string;
  import?: string;
  stats?: boolean;
  validate?: boolean;
  fromDirectory?: string;
}

@injectable()
export class AICommand {
  private aiServiceFactory?: AIServiceFactory;
  private knowledgeBaseSeeder?: KnowledgeBaseSeeder;
  private aiComponentGenerator?: AIEnhancedComponentGenerator;
  private promptEngine?: PromptTemplateEngine;

  constructor(
    @inject('ILoggingService') private logger: ILoggingService,
    @inject('IConfigurationService') private config: IConfigurationService,
    @inject('ILocalizationService') private localization: ILocalizationService,
    @inject('IFileSystemService') private fileSystem: IFileSystemService
  ) {}

  /**
   * Configure the AI command
   */
  configureCommand(program: Command): void {
    const aiCommand = program
      .command('ai')
      .description(this.localization.t('commands.ai.description', 'AI-powered code generation and assistance'))
      .alias('assistant');

    // Generate subcommand
    aiCommand
      .command('generate')
      .alias('gen')
      .description(this.localization.t('commands.ai.generate.description', 'Generate code using AI'))
      .argument('<description>', this.localization.t('commands.ai.generate.args.description', 'Natural language description of what to generate'))
      .option('-t, --type <type>', this.localization.t('commands.ai.generate.options.type', 'Type of code to generate'), 'component')
      .option('-l, --language <language>', this.localization.t('commands.ai.generate.options.language', 'Programming language'), 'typescript')
      .option('-f, --framework <framework>', this.localization.t('commands.ai.generate.options.framework', 'Framework to use'), 'react')
      .option('-o, --output <path>', this.localization.t('commands.ai.generate.options.output', 'Output file path'))
      .option('-c, --compliance <level>', this.localization.t('commands.ai.generate.options.compliance', 'NSM compliance level'), 'OPEN')
      .option('--locale <locale>', this.localization.t('commands.ai.generate.options.locale', 'Locale for generation'), 'nb-NO')
      .option('-i, --interactive', this.localization.t('commands.ai.generate.options.interactive', 'Interactive mode'))
      .option('-a, --analyze', this.localization.t('commands.ai.generate.options.analyze', 'Analyze existing code'))
      .option('-v, --validate', this.localization.t('commands.ai.generate.options.validate', 'Validate generated code'))
      .option('--name <name>', this.localization.t('commands.ai.generate.options.name', 'Component name (auto-generated if not provided)'))
      .option('--tests', this.localization.t('commands.ai.generate.options.tests', 'Generate tests'), true)
      .option('--stories', this.localization.t('commands.ai.generate.options.stories', 'Generate Storybook stories'), true)
      .action(async (description: string, options: IAIGenerationOptions) => {
        await this.handleGenerate(description, options);
      });

    // Prompt subcommand
    aiCommand
      .command('prompt')
      .description(this.localization.t('commands.ai.prompt.description', 'Manage AI prompt templates'))
      .option('--list', this.localization.t('commands.ai.prompt.options.list', 'List available templates'))
      .option('--test <id>', this.localization.t('commands.ai.prompt.options.test', 'Test a prompt template'))
      .option('--render <id>', this.localization.t('commands.ai.prompt.options.render', 'Render a prompt template'))
      .option('--locale <locale>', this.localization.t('commands.ai.prompt.options.locale', 'Template locale'), 'nb-NO')
      .action(async (options: any) => {
        await this.handlePrompt(options);
      });

    // Knowledge base subcommand
    aiCommand
      .command('knowledge')
      .alias('kb')
      .description(this.localization.t('commands.ai.knowledge.description', 'Manage AI knowledge base'))
      .option('--seed', this.localization.t('commands.ai.knowledge.options.seed', 'Seed knowledge base with built-in patterns'))
      .option('--rebuild', this.localization.t('commands.ai.knowledge.options.rebuild', 'Rebuild entire knowledge base'))
      .option('--export <path>', this.localization.t('commands.ai.knowledge.options.export', 'Export knowledge base to file'))
      .option('--import <path>', this.localization.t('commands.ai.knowledge.options.import', 'Import knowledge base from file'))
      .option('--stats', this.localization.t('commands.ai.knowledge.options.stats', 'Show knowledge base statistics'))
      .option('--validate', this.localization.t('commands.ai.knowledge.options.validate', 'Validate knowledge base'))
      .option('--from-directory <path>', this.localization.t('commands.ai.knowledge.options.fromDirectory', 'Seed from directory'))
      .action(async (options: IKnowledgeBaseOptions) => {
        await this.handleKnowledgeBase(options);
      });

    // Analyze subcommand
    aiCommand
      .command('analyze')
      .description(this.localization.t('commands.ai.analyze.description', 'Analyze code for patterns and compliance'))
      .argument('<path>', this.localization.t('commands.ai.analyze.args.path', 'Path to analyze'))
      .option('--compliance', this.localization.t('commands.ai.analyze.options.compliance', 'Check Norwegian compliance'))
      .option('--patterns', this.localization.t('commands.ai.analyze.options.patterns', 'Find code patterns'))
      .option('--quality', this.localization.t('commands.ai.analyze.options.quality', 'Analyze code quality'))
      .option('--suggestions', this.localization.t('commands.ai.analyze.options.suggestions', 'Get improvement suggestions'))
      .action(async (path: string, options: any) => {
        await this.handleAnalyze(path, options);
      });

    // Chat subcommand
    aiCommand
      .command('chat')
      .description(this.localization.t('commands.ai.chat.description', 'Interactive AI assistant'))
      .option('--context <path>', this.localization.t('commands.ai.chat.options.context', 'Load project context'))
      .option('--locale <locale>', this.localization.t('commands.ai.chat.options.locale', 'Chat locale'), 'nb-NO')
      .action(async (options: any) => {
        await this.handleChat(options);
      });
  }

  // === Command Handlers ===

  /**
   * Handle AI code generation
   */
  private async handleGenerate(description: string, options: IAIGenerationOptions): Promise<void> {
    const spinner = ora(this.localization.t('commands.ai.generate.initializing', 'Initializing AI services...')).start();

    try {
      // Initialize AI services
      await this.initializeAIServices();
      await this.initializeAIComponentGenerator();
      
      spinner.text = this.localization.t('commands.ai.generate.generating', 'Generating code...');

      // Use AI-enhanced component generator for components
      if (options.type === 'component') {
        const generationInput = {
          description,
          name: (options as any).name,
          type: undefined, // Will be auto-detected
          aiOptions: {
            useAI: true,
            analysisLevel: 'detailed' as const,
            includePatterns: true,
            includeExamples: true,
            generateTests: (options as any).tests !== false,
            generateStories: (options as any).stories !== false,
            optimizeAccessibility: true,
            interactive: options.interactive || false
          },
          preferences: {
            language: (options.language || 'typescript') as 'typescript',
            framework: (options.framework || 'react') as 'react',
            styling: 'tailwind' as const,
            stateManagement: 'useState' as const,
            formHandling: 'react-hook-form' as const
          },
          compliance: {
            nsmClassification: (options.compliance || 'OPEN') as any,
            gdprCompliant: true,
            wcagLevel: 'AAA' as const,
            supportedLanguages: [options.locale || 'nb-NO', 'en-US'],
            auditTrail: options.compliance !== 'OPEN'
          },
          output: {
            path: options.output || './src/components',
            locale: options.locale || 'nb-NO',
            overwrite: false
          },
          context: {
            projectType: 'react-app',
            existingComponents: [],
            designSystem: 'tailwind'
          }
        };

        const result = await this.aiComponentGenerator!.generateAIComponent(generationInput);

        if (result.success) {
          spinner.succeed(this.localization.t('commands.ai.generate.success', 'Code generated successfully'));

          // Display analysis
          console.log(chalk.cyan('\n=== Analysis ===\n'));
          console.log(`Component Type: ${result.analysis.detectedType}`);
          console.log(`Suggested Name: ${result.analysis.suggestedName}`);
          console.log(`Complexity: ${result.analysis.complexity}`);
          console.log(`Quality Score: ${(result.analysis.qualityScore * 100).toFixed(1)}%`);

          // Display generated files
          console.log(chalk.green('\n=== Generated Files ===\n'));
          result.files.forEach(file => {
            console.log(`📄 ${file.path}`);
            if (options.output) {
              // Save files
              this.fileSystem.writeFile(file.path, file.content);
            }
          });

          // Display main component code
          const mainFile = result.files.find(f => f.path.includes('.tsx') && !f.path.includes('.test.') && !f.path.includes('.stories.'));
          if (mainFile) {
            console.log(chalk.cyan('\n=== Main Component ===\n'));
            console.log(mainFile.content);
          }

          // Display recommendations
          if (result.recommendations.length > 0) {
            console.log(chalk.blue('\n=== Recommendations ===\n'));
            result.recommendations.forEach(rec => console.log(`• ${rec}`));
          }

          // Display patterns found
          if (result.analysis.patterns.length > 0) {
            console.log(chalk.magenta('\n=== Related Patterns ===\n'));
            result.analysis.patterns.slice(0, 3).forEach(pattern => {
              console.log(`• ${pattern.pattern.name} (${(pattern.match_score * 100).toFixed(1)}%)`);
            });
          }

          // Display warnings and errors
          if (result.warnings.length > 0) {
            console.log(chalk.yellow('\n=== Warnings ===\n'));
            result.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
          }

          if (result.errors.length > 0) {
            console.log(chalk.red('\n=== Errors ===\n'));
            result.errors.forEach(error => console.log(`❌ ${error}`));
          }

          console.log(chalk.gray(`\nProcessing time: ${result.processingTime}ms`));

        } else {
          spinner.fail(this.localization.t('commands.ai.generate.error', 'Failed to generate code'));
          
          if (result.errors.length > 0) {
            console.log(chalk.red('\n=== Errors ===\n'));
            result.errors.forEach(error => console.log(`❌ ${error}`));
          }
        }

      } else {
        // Fallback to original AI service for non-component generation
        const aiCodeGenerator = this.aiServiceFactory!.createAICodeGeneratorService();
        
        const compliance: NorwegianCompliance = {
          nsmClassification: options.compliance || 'OPEN',
          gdprCompliant: true,
          wcagLevel: 'AAA',
          supportedLanguages: [options.locale || 'nb-NO'],
          auditTrail: true
        };

        const generationRequest = {
          description,
          type: options.type,
          language: options.language || 'typescript',
          framework: options.framework || 'react',
          compliance,
          locale: options.locale as LocaleCode || 'nb-NO',
          features: []
        };

        const result = await aiCodeGenerator.generateCode(generationRequest);

        spinner.succeed(this.localization.t('commands.ai.generate.success', 'Code generated successfully'));

        console.log(chalk.cyan('\n=== Generated Code ===\n'));
        console.log(result.code);

        if (result.explanation) {
          console.log(chalk.yellow('\n=== Explanation ===\n'));
          console.log(result.explanation);
        }

        if (result.suggestions.length > 0) {
          console.log(chalk.blue('\n=== Suggestions ===\n'));
          result.suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
        }

        if (options.output) {
          await this.fileSystem.writeFile(options.output, result.code);
          console.log(chalk.green(`\nCode saved to: ${options.output}`));
        }
      }

    } catch (error) {
      spinner.fail(this.localization.t('commands.ai.generate.error', 'Failed to generate code'));
      this.logger.error('AI generation failed', error as Error);
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  /**
   * Handle knowledge base management
   */
  private async handleKnowledgeBase(options: IKnowledgeBaseOptions): Promise<void> {
    const spinner = ora(this.localization.t('commands.ai.knowledge.initializing', 'Initializing knowledge base...')).start();

    try {
      await this.initializeKnowledgeBaseSeeder();

      if (options.stats) {
        spinner.text = this.localization.t('commands.ai.knowledge.gettingStats', 'Getting knowledge base statistics...');
        
        const aiServices = this.aiServiceFactory!;
        const ragService = aiServices.createRAGService();
        const stats = await ragService.getIndexStats();
        
        spinner.succeed(this.localization.t('commands.ai.knowledge.statsRetrieved', 'Knowledge base statistics retrieved'));
        
        console.log(chalk.cyan('\n=== Knowledge Base Statistics ===\n'));
        console.log(`Total Documents: ${stats.totalDocuments}`);
        console.log(`Total Patterns: ${stats.totalPatterns}`);
        console.log(`Total Examples: ${stats.totalExamples}`);
        console.log(`Embedding Dimensions: ${stats.embeddingDimensions}`);
        console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Health Score: ${stats.healthScore}%`);
        console.log(`Last Updated: ${stats.lastUpdated.toLocaleString()}`);
      }

      if (options.seed) {
        spinner.text = this.localization.t('commands.ai.knowledge.seeding', 'Seeding knowledge base...');
        
        const seedingOptions = {
          includeBuiltInPatterns: true,
          includeComplianceRules: true,
          includeExamples: true,
          seedFromDirectory: options.fromDirectory,
          validatePatterns: true,
          generateEmbeddings: true,
          locale: 'nb-NO' as LocaleCode,
          override: false
        };

        const result = await this.knowledgeBaseSeeder!.seedKnowledgeBase(seedingOptions);
        
        spinner.succeed(this.localization.t('commands.ai.knowledge.seedingComplete', 'Knowledge base seeding completed'));
        
        console.log(chalk.green('\n=== Seeding Results ===\n'));
        console.log(`Patterns Seeded: ${result.patternsSeeded}`);
        console.log(`Examples Seeded: ${result.examplesSeeded}`);
        console.log(`Compliance Rules Seeded: ${result.complianceRulesSeeded}`);
        console.log(`Processing Time: ${result.processingTime}ms`);
        
        if (result.errors.length > 0) {
          console.log(chalk.red('\n=== Errors ===\n'));
          result.errors.forEach(error => console.log(`• ${error}`));
        }

        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\n=== Warnings ===\n'));
          result.warnings.forEach(warning => console.log(`• ${warning}`));
        }
      }

      if (options.rebuild) {
        spinner.text = this.localization.t('commands.ai.knowledge.rebuilding', 'Rebuilding knowledge base...');
        
        const ragService = this.aiServiceFactory!.createRAGService();
        await ragService.rebuildIndex();
        
        spinner.succeed(this.localization.t('commands.ai.knowledge.rebuildComplete', 'Knowledge base rebuilt successfully'));
      }

    } catch (error) {
      spinner.fail(this.localization.t('commands.ai.knowledge.error', 'Knowledge base operation failed'));
      this.logger.error('Knowledge base operation failed', error as Error);
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  /**
   * Handle code analysis
   */
  private async handleAnalyze(path: string, options: any): Promise<void> {
    const spinner = ora(this.localization.t('commands.ai.analyze.initializing', 'Initializing code analysis...')).start();

    try {
      await this.initializeAIServices();

      // Check if path exists
      const exists = await this.fileSystem.exists(path);
      if (!exists) {
        spinner.fail(this.localization.t('commands.ai.analyze.pathNotFound', 'Path not found'));
        console.error(chalk.red(`Path not found: ${path}`));
        process.exit(1);
      }

      // Read file content
      const content = await this.fileSystem.readFile(path);
      
      spinner.text = this.localization.t('commands.ai.analyze.analyzing', 'Analyzing code...');

      const patternMatcher = new PatternMatcher(this.logger);
      await patternMatcher.initialize();

      // Analyze patterns
      if (options.patterns !== false) {
        const patterns = await patternMatcher.analyzeCode(content, {
          include_ast_analysis: true,
          include_semantic_analysis: true,
          include_compliance_check: true,
          min_match_score: 0.3,
          max_results: 10
        });

        console.log(chalk.cyan('\n=== Code Patterns ===\n'));
        if (patterns.length === 0) {
          console.log('No significant patterns found.');
        } else {
          patterns.forEach((pattern, index) => {
            console.log(`${index + 1}. ${pattern.pattern.name} (${(pattern.match_score * 100).toFixed(1)}%)`);
            console.log(`   ${pattern.pattern.description}`);
            console.log(`   ${pattern.explanation}\n`);
          });
        }
      }

      // Check compliance
      if (options.compliance !== false) {
        const complianceIssues = await patternMatcher.detectComplianceIssues(content);

        console.log(chalk.green('\n=== Norwegian Compliance ===\n'));
        if (complianceIssues.length === 0) {
          console.log('No compliance issues found.');
        } else {
          complianceIssues.forEach((issue, index) => {
            const severityColor = issue.severity === 'critical' ? chalk.red :
                                  issue.severity === 'error' ? chalk.red :
                                  issue.severity === 'warning' ? chalk.yellow : chalk.blue;
            
            console.log(`${index + 1}. ${severityColor(issue.severity.toUpperCase())}: ${issue.description}`);
            console.log(`   Location: Line ${issue.location.line}, Column ${issue.location.column}`);
            console.log(`   Rule: ${issue.rule}`);
            console.log(`   Solution: ${issue.solution}\n`);
          });
        }
      }

      spinner.succeed(this.localization.t('commands.ai.analyze.complete', 'Code analysis completed'));

    } catch (error) {
      spinner.fail(this.localization.t('commands.ai.analyze.error', 'Code analysis failed'));
      this.logger.error('Code analysis failed', error as Error);
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  /**
   * Handle interactive chat
   */
  private async handleChat(options: any): Promise<void> {
    console.log(chalk.cyan('🤖 Xala AI Assistant\n'));
    console.log('Norwegian compliance-aware code generation and assistance.');
    console.log('Type "exit" to quit, "help" for commands.\n');

    try {
      await this.initializeAIServices();

      const aiCodeGenerator = this.aiServiceFactory!.createAICodeGeneratorService();
      
      // Simple chat loop (in production, use a proper CLI library like inquirer)
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const askQuestion = (question: string): Promise<string> => {
        return new Promise((resolve) => {
          rl.question(question, (answer: string) => {
            resolve(answer);
          });
        });
      };

      while (true) {
        const input = await askQuestion(chalk.green('You: '));
        
        if (input.toLowerCase() === 'exit') {
          break;
        }
        
        if (input.toLowerCase() === 'help') {
          console.log(chalk.yellow('\nAvailable commands:'));
          console.log('- help: Show this help');
          console.log('- exit: Exit the chat');
          console.log('- Generate code by describing what you want');
          console.log('- Ask questions about Norwegian compliance');
          console.log('- Request code analysis or improvements\n');
          continue;
        }

        try {
          const spinner = ora('Thinking...').start();
          
          // Simple AI response (in production, use the actual AI service)
          const response = await aiCodeGenerator.analyzeCode(input, {
            nsmClassification: 'OPEN',
            gdprCompliant: true,
            wcagLevel: 'AAA',
            supportedLanguages: ['nb-NO'],
            auditTrail: true
          });

          spinner.stop();
          
          console.log(chalk.blue('Assistant: ') + response.summary);
          
          if (response.suggestions.length > 0) {
            console.log(chalk.yellow('\nSuggestions:'));
            response.suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
          }
          
          console.log();
          
        } catch (error) {
          console.log(chalk.red('Sorry, I encountered an error processing your request.'));
          this.logger.error('Chat error', error as Error);
        }
      }

      rl.close();

    } catch (error) {
      console.error(chalk.red(`Failed to start chat: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  // === Private Helper Methods ===

  /**
   * Handle prompt template management
   */
  private async handlePrompt(options: any): Promise<void> {
    try {
      await this.initializePromptEngine();

      if (options.list) {
        const templates = this.promptEngine!.getTemplates();
        
        console.log(chalk.cyan('\n=== Available Prompt Templates ===\n'));
        
        const groupedByCategory = templates.reduce((acc, template) => {
          if (!acc[template.category]) acc[template.category] = [];
          acc[template.category].push(template);
          return acc;
        }, {} as Record<string, typeof templates>);

        Object.entries(groupedByCategory).forEach(([category, categoryTemplates]) => {
          console.log(chalk.yellow(`${category.toUpperCase()}:`));
          categoryTemplates.forEach(template => {
            console.log(`  • ${template.id} (${template.locale}) - ${template.name}`);
            console.log(`    ${template.description}`);
            console.log(`    Tags: ${template.metadata.tags.join(', ')}`);
            console.log();
          });
        });
      }

      if (options.test) {
        const templateId = options.test;
        const locale = (options.locale || 'nb-NO') as LocaleCode;
        
        const template = this.promptEngine!.getTemplate(templateId, locale);
        if (!template) {
          console.error(chalk.red(`Template not found: ${templateId} for locale ${locale}`));
          return;
        }

        console.log(chalk.cyan(`\n=== Testing Template: ${template.name} ===\n`));
        console.log(`Description: ${template.description}`);
        console.log(`Category: ${template.category}`);
        console.log(`Locale: ${template.locale}`);
        console.log(`Estimated Tokens: ${template.metadata.estimatedTokens}`);
        console.log(`\nRequired Variables:`);
        template.variables.filter(v => v.required).forEach(variable => {
          console.log(`  • ${variable.name} (${variable.type}): ${variable.description}`);
        });
        
        if (template.examples && template.examples.length > 0) {
          console.log(`\nExamples:`);
          template.examples.forEach(example => {
            console.log(`  • ${example.title}: ${example.description}`);
          });
        }
      }

      if (options.render) {
        const templateId = options.render;
        const locale = (options.locale || 'nb-NO') as LocaleCode;
        
        // For demo purposes, use example variables if available
        const template = this.promptEngine!.getTemplate(templateId, locale);
        if (!template) {
          console.error(chalk.red(`Template not found: ${templateId} for locale ${locale}`));
          return;
        }

        const exampleVariables = template.examples?.[0]?.variables || {};
        const defaultVariables = template.variables.reduce((acc, variable) => {
          if (variable.defaultValue !== undefined) {
            acc[variable.name] = variable.defaultValue;
          }
          return acc;
        }, {} as Record<string, any>);

        const context = {
          variables: { ...defaultVariables, ...exampleVariables },
          locale,
          compliance: {
            nsmClassification: 'OPEN' as const,
            gdprCompliant: true,
            wcagLevel: 'AAA' as const,
            supportedLanguages: ['nb-NO', 'en-US'],
            auditTrail: false
          }
        };

        const result = await this.promptEngine!.renderPrompt(templateId, context);
        
        if (result.errors.length > 0) {
          console.error(chalk.red('\n=== Rendering Errors ===\n'));
          result.errors.forEach(error => console.log(`❌ ${error}`));
          return;
        }

        console.log(chalk.cyan(`\n=== Rendered Prompt: ${template.name} ===\n`));
        console.log(result.content);
        
        console.log(chalk.gray(`\nEstimated Tokens: ${result.metadata.estimatedTokens}`));
        console.log(chalk.gray(`Render Time: ${result.metadata.renderTime}ms`));
        
        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\n=== Warnings ===\n'));
          result.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
        }
      }

    } catch (error) {
      console.error(chalk.red(`Failed to handle prompt command: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  }

  // === Private Helper Methods ===

  /**
   * Initialize AI services
   */
  private async initializeAIServices(): Promise<void> {
    if (!this.aiServiceFactory) {
      this.aiServiceFactory = new AIServiceFactory(
        this.logger,
        this.config,
        this.fileSystem
      );

      await this.aiServiceFactory.initializeServices();
    }
  }

  /**
   * Initialize AI component generator
   */
  private async initializeAIComponentGenerator(): Promise<void> {
    if (!this.aiComponentGenerator) {
      this.aiComponentGenerator = new AIEnhancedComponentGenerator(
        this.logger,
        this.config,
        this.localization,
        this.fileSystem
      );
    }
  }

  /**
   * Initialize prompt template engine
   */
  private async initializePromptEngine(): Promise<void> {
    if (!this.promptEngine) {
      this.promptEngine = new PromptTemplateEngine(
        this.logger,
        this.config
      );

      await this.promptEngine.initialize();
    }
  }

  /**
   * Initialize knowledge base seeder
   */
  private async initializeKnowledgeBaseSeeder(): Promise<void> {
    if (!this.knowledgeBaseSeeder) {
      await this.initializeAIServices();

      const vectorStore = new ChromaDBStore(this.logger, this.config);
      const embeddingGenerator = new EmbeddingGenerator(this.logger, this.config);
      const patternMatcher = new PatternMatcher(this.logger);

      this.knowledgeBaseSeeder = new KnowledgeBaseSeeder(
        this.logger,
        this.config,
        this.fileSystem,
        vectorStore,
        embeddingGenerator,
        patternMatcher
      );

      await this.knowledgeBaseSeeder.initialize();
    }
  }
}
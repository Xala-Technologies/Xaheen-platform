/**
 * Interactive AI Assistant
 * 
 * Provides an interactive, conversational AI assistant for code development
 * with Norwegian compliance focus and context-aware assistance.
 * 
 * Features:
 * - Conversational interface with context retention
 * - Multi-turn dialogue management
 * - Code understanding and generation
 * - Norwegian compliance guidance
 * - Learning from user preferences
 * - Task automation and workflow assistance
 */

import { EventEmitter } from 'events';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { 
  ILoggingService, 
  IConfigurationService,
  ILocalizationService,
  IFileSystemService 
} from '../../architecture/interfaces.js';
import { AIServiceFactory } from '../services/AIServiceFactory.js';
import { PromptTemplateEngine } from '../prompts/PromptTemplateEngine.js';
import { PatternMatcher } from '../../rag/pattern-matching/PatternMatcher.js';
import { LocaleCode, NorwegianCompliance } from '../../types/compliance.js';

/**
 * Conversation message
 */
export interface IConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Record<string, any>;
    confidence?: number;
    compliance?: NorwegianCompliance;
    locale?: LocaleCode;
  };
}

/**
 * Conversation context
 */
export interface IConversationContext {
  id: string;
  messages: IConversationMessage[];
  currentProject?: {
    path: string;
    type: string;
    framework: string;
    language: string;
  };
  userPreferences: IUserPreferences;
  compliance: NorwegianCompliance;
  locale: LocaleCode;
  sessionData: Record<string, any>;
}

/**
 * User preferences
 */
export interface IUserPreferences {
  codeStyle: 'verbose' | 'concise' | 'balanced';
  explanationLevel: 'beginner' | 'intermediate' | 'expert';
  preferredLanguage: LocaleCode;
  autoSuggestions: boolean;
  showCompliance: boolean;
  enableLearning: boolean;
}

/**
 * Assistant capabilities
 */
export interface IAssistantCapabilities {
  codeGeneration: boolean;
  codeAnalysis: boolean;
  codeRefactoring: boolean;
  testing: boolean;
  documentation: boolean;
  compliance: boolean;
  learning: boolean;
  automation: boolean;
}

/**
 * Intent recognition result
 */
interface IIntentRecognition {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  suggestedAction?: string;
}

/**
 * Interactive AI Assistant Service
 */
export class InteractiveAIAssistant extends EventEmitter {
  private context: IConversationContext;
  private aiServiceFactory?: AIServiceFactory;
  private promptEngine?: PromptTemplateEngine;
  private patternMatcher?: PatternMatcher;
  private rl?: readline.Interface;
  private isActive = false;
  private learningEnabled = true;

  // Built-in intents
  private readonly INTENTS = {
    CODE_GENERATION: ['create', 'generate', 'make', 'build', 'lag', 'lage'],
    CODE_ANALYSIS: ['analyze', 'check', 'review', 'inspect', 'analysere', 'sjekk'],
    CODE_REFACTORING: ['refactor', 'improve', 'optimize', 'enhance', 'forbedre'],
    TESTING: ['test', 'testing', 'tests', 'teste'],
    DOCUMENTATION: ['document', 'docs', 'explain', 'describe', 'dokumentere'],
    COMPLIANCE: ['compliance', 'nsm', 'gdpr', 'wcag', 'norwegian', 'norsk'],
    HELP: ['help', 'hjelp', 'how', 'what', 'hvordan', 'hva'],
    SETTINGS: ['settings', 'preferences', 'config', 'innstillinger']
  };

  // Capabilities
  private readonly capabilities: IAssistantCapabilities = {
    codeGeneration: true,
    codeAnalysis: true,
    codeRefactoring: true,
    testing: true,
    documentation: true,
    compliance: true,
    learning: true,
    automation: true
  };

  constructor(
    private readonly logger: ILoggingService,
    private readonly config: IConfigurationService,
    private readonly localization: ILocalizationService,
    private readonly fileSystem: IFileSystemService
  ) {
    super();

    // Initialize conversation context
    this.context = this.createNewContext();
  }

  /**
   * Start interactive session
   */
  async startSession(options: {
    projectPath?: string;
    locale?: LocaleCode;
    compliance?: NorwegianCompliance;
    preferences?: Partial<IUserPreferences>;
  } = {}): Promise<void> {
    try {
      this.logger.info('Starting Interactive AI Assistant session');

      // Initialize services
      await this.initializeServices();

      // Update context with options
      if (options.projectPath) {
        this.context.currentProject = await this.detectProjectInfo(options.projectPath);
      }
      if (options.locale) {
        this.context.locale = options.locale;
      }
      if (options.compliance) {
        this.context.compliance = options.compliance;
      }
      if (options.preferences) {
        this.context.userPreferences = { ...this.context.userPreferences, ...options.preferences };
      }

      // Create readline interface
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: this.getPrompt()
      });

      this.isActive = true;

      // Display welcome message
      this.displayWelcome();

      // Start conversation loop
      await this.conversationLoop();

    } catch (error) {
      this.logger.error('Failed to start assistant session', error as Error);
      throw error;
    }
  }

  /**
   * End interactive session
   */
  async endSession(): Promise<void> {
    try {
      this.logger.info('Ending Interactive AI Assistant session');

      // Save learning data if enabled
      if (this.learningEnabled && this.context.userPreferences.enableLearning) {
        await this.saveLearningData();
      }

      // Close readline interface
      if (this.rl) {
        this.rl.close();
      }

      this.isActive = false;
      this.emit('sessionEnded', { context: this.context });

      // Display farewell message
      this.displayFarewell();

    } catch (error) {
      this.logger.error('Failed to end assistant session', error as Error);
    }
  }

  /**
   * Process a single message
   */
  async processMessage(message: string): Promise<string> {
    try {
      this.logger.debug('Processing message', { message: message.substring(0, 50) });

      // Add user message to context
      const userMessage = this.createMessage('user', message);
      this.context.messages.push(userMessage);

      // Recognize intent
      const intent = await this.recognizeIntent(message);
      this.logger.debug('Intent recognized', intent);

      // Process based on intent
      let response: string;
      switch (intent.intent) {
        case 'CODE_GENERATION':
          response = await this.handleCodeGeneration(message, intent.entities);
          break;
        case 'CODE_ANALYSIS':
          response = await this.handleCodeAnalysis(message, intent.entities);
          break;
        case 'CODE_REFACTORING':
          response = await this.handleCodeRefactoring(message, intent.entities);
          break;
        case 'TESTING':
          response = await this.handleTesting(message, intent.entities);
          break;
        case 'DOCUMENTATION':
          response = await this.handleDocumentation(message, intent.entities);
          break;
        case 'COMPLIANCE':
          response = await this.handleCompliance(message, intent.entities);
          break;
        case 'HELP':
          response = await this.handleHelp(message, intent.entities);
          break;
        case 'SETTINGS':
          response = await this.handleSettings(message, intent.entities);
          break;
        default:
          response = await this.handleGeneralQuery(message);
      }

      // Add assistant message to context
      const assistantMessage = this.createMessage('assistant', response, {
        intent: intent.intent,
        confidence: intent.confidence
      });
      this.context.messages.push(assistantMessage);

      // Learn from interaction if enabled
      if (this.learningEnabled && this.context.userPreferences.enableLearning) {
        await this.learnFromInteraction(userMessage, assistantMessage, intent);
      }

      this.emit('messageProcessed', { userMessage, assistantMessage, intent });

      return response;

    } catch (error) {
      this.logger.error('Failed to process message', error as Error);
      return this.getErrorResponse(error);
    }
  }

  /**
   * Get assistant capabilities
   */
  getCapabilities(): IAssistantCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get current context
   */
  getContext(): IConversationContext {
    return {
      ...this.context,
      messages: [...this.context.messages]
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.context.messages = [];
    this.context.sessionData = {};
    this.logger.debug('Conversation history cleared');
  }

  // === Private Helper Methods ===

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    if (!this.aiServiceFactory) {
      this.aiServiceFactory = new AIServiceFactory(
        this.logger,
        this.config,
        this.fileSystem
      );
      await this.aiServiceFactory.initializeServices();
    }

    if (!this.promptEngine) {
      this.promptEngine = new PromptTemplateEngine(this.logger, this.config);
      await this.promptEngine.initialize();
    }

    if (!this.patternMatcher) {
      this.patternMatcher = new PatternMatcher(this.logger);
      await this.patternMatcher.initialize();
    }
  }

  /**
   * Create new conversation context
   */
  private createNewContext(): IConversationContext {
    return {
      id: this.generateId(),
      messages: [],
      userPreferences: {
        codeStyle: 'balanced',
        explanationLevel: 'intermediate',
        preferredLanguage: 'nb-NO',
        autoSuggestions: true,
        showCompliance: true,
        enableLearning: true
      },
      compliance: {
        nsmClassification: 'OPEN',
        gdprCompliant: true,
        wcagLevel: 'AAA',
        supportedLanguages: ['nb-NO', 'en-US'],
        auditTrail: false
      },
      locale: 'nb-NO',
      sessionData: {}
    };
  }

  /**
   * Detect project information
   */
  private async detectProjectInfo(projectPath: string): Promise<any> {
    try {
      // Check for package.json
      const packageJsonPath = `${projectPath}/package.json`;
      if (await this.fileSystem.exists(packageJsonPath)) {
        const packageJson = JSON.parse(await this.fileSystem.readFile(packageJsonPath));
        
        return {
          path: projectPath,
          type: 'node',
          framework: this.detectFramework(packageJson),
          language: 'typescript' // Assume TypeScript for now
        };
      }

      return {
        path: projectPath,
        type: 'unknown',
        framework: 'unknown',
        language: 'unknown'
      };

    } catch (error) {
      this.logger.warn('Failed to detect project info', error as Error);
      return {
        path: projectPath,
        type: 'unknown',
        framework: 'unknown',
        language: 'unknown'
      };
    }
  }

  /**
   * Detect framework from package.json
   */
  private detectFramework(packageJson: any): string {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps.angular) return 'angular';
    if (deps.next) return 'nextjs';
    if (deps.express) return 'express';
    if (deps.fastify) return 'fastify';
    
    return 'unknown';
  }

  /**
   * Display welcome message
   */
  private displayWelcome(): void {
    console.clear();
    console.log(chalk.cyan('╔════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║       🤖 Xala AI Assistant v1.0.0          ║'));
    console.log(chalk.cyan('║   Norwegian Compliance-Aware Development   ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════╝'));
    console.log();

    if (this.context.locale === 'nb-NO') {
      console.log(chalk.green('Velkommen! Jeg er din AI-assistent for norsk-kompatibel utvikling.'));
      console.log('Jeg kan hjelpe deg med:');
      console.log('  • Generere kode med norsk compliance (NSM, GDPR, WCAG)');
      console.log('  • Analysere og forbedre eksisterende kode');
      console.log('  • Lage tester og dokumentasjon');
      console.log('  • Veilede om beste praksis og arkitektur');
      console.log();
      console.log(chalk.gray('Skriv "hjelp" for å se alle kommandoer, eller "exit" for å avslutte.'));
    } else {
      console.log(chalk.green('Welcome! I am your AI assistant for Norwegian-compliant development.'));
      console.log('I can help you with:');
      console.log('  • Generate code with Norwegian compliance (NSM, GDPR, WCAG)');
      console.log('  • Analyze and improve existing code');
      console.log('  • Create tests and documentation');
      console.log('  • Guide on best practices and architecture');
      console.log();
      console.log(chalk.gray('Type "help" to see all commands, or "exit" to quit.'));
    }

    console.log();
  }

  /**
   * Display farewell message
   */
  private displayFarewell(): void {
    console.log();
    if (this.context.locale === 'nb-NO') {
      console.log(chalk.cyan('Takk for at du brukte Xala AI Assistant!'));
      console.log(chalk.gray('Ha en fin dag og lykke til med utviklingen! 👋'));
    } else {
      console.log(chalk.cyan('Thank you for using Xala AI Assistant!'));
      console.log(chalk.gray('Have a great day and happy coding! 👋'));
    }
  }

  /**
   * Get prompt string
   */
  private getPrompt(): string {
    const icon = this.context.compliance.nsmClassification !== 'OPEN' ? '🔒' : '💬';
    return chalk.green(`${icon} You: `);
  }

  /**
   * Conversation loop
   */
  private async conversationLoop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.rl) return resolve();

      this.rl.prompt();

      this.rl.on('line', async (input) => {
        const trimmedInput = input.trim();

        // Check for exit commands
        if (['exit', 'quit', 'bye', 'avslutt'].includes(trimmedInput.toLowerCase())) {
          resolve();
          return;
        }

        // Check for clear command
        if (['clear', 'cls', 'tøm'].includes(trimmedInput.toLowerCase())) {
          console.clear();
          this.displayWelcome();
          this.rl!.prompt();
          return;
        }

        // Process the message
        const spinner = ora('Thinking...').start();
        try {
          const response = await this.processMessage(trimmedInput);
          spinner.stop();
          
          console.log(chalk.blue('🤖 Assistant: ') + response);
          console.log();
        } catch (error) {
          spinner.fail('An error occurred');
          console.error(chalk.red('Error: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }

        this.rl!.prompt();
      });

      this.rl.on('close', () => {
        resolve();
      });
    });
  }

  /**
   * Recognize intent from message
   */
  private async recognizeIntent(message: string): Promise<IIntentRecognition> {
    const lowerMessage = message.toLowerCase();
    
    // Check for exact intent matches
    for (const [intentName, keywords] of Object.entries(this.INTENTS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return {
            intent: intentName,
            confidence: 0.8,
            entities: this.extractEntities(message, intentName)
          };
        }
      }
    }

    // Use AI for complex intent recognition
    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      const analysis = await aiService.analyzeCode(message, this.context.compliance);
      
      // Map AI analysis to intent
      if (analysis.summary.includes('generate') || analysis.summary.includes('create')) {
        return { intent: 'CODE_GENERATION', confidence: 0.6, entities: {} };
      }
      if (analysis.summary.includes('analyze') || analysis.summary.includes('check')) {
        return { intent: 'CODE_ANALYSIS', confidence: 0.6, entities: {} };
      }
    } catch (error) {
      this.logger.warn('AI intent recognition failed, using fallback', error as Error);
    }

    // Default to general query
    return {
      intent: 'GENERAL',
      confidence: 0.3,
      entities: {}
    };
  }

  /**
   * Extract entities from message
   */
  private extractEntities(message: string, intent: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract file paths
    const pathMatch = message.match(/(?:\.\/|\/)?[\w\-\/]+\.\w+/g);
    if (pathMatch) {
      entities.filePath = pathMatch[0];
    }

    // Extract component names (PascalCase)
    const componentMatch = message.match(/\b[A-Z][a-zA-Z]*(?:[A-Z][a-zA-Z]*)*\b/g);
    if (componentMatch) {
      entities.componentName = componentMatch[0];
    }

    // Extract compliance levels
    const complianceMatch = message.match(/\b(OPEN|RESTRICTED|CONFIDENTIAL|SECRET)\b/i);
    if (complianceMatch) {
      entities.compliance = complianceMatch[1].toUpperCase();
    }

    // Extract language preferences
    const langMatch = message.match(/\b(typescript|javascript|react|vue|angular)\b/i);
    if (langMatch) {
      entities.language = langMatch[1].toLowerCase();
    }

    return entities;
  }

  /**
   * Handle code generation intent
   */
  private async handleCodeGeneration(message: string, entities: Record<string, any>): Promise<string> {
    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      
      const result = await aiService.generateCode({
        description: message,
        type: 'component',
        language: entities.language || 'typescript',
        framework: this.context.currentProject?.framework || 'react',
        compliance: entities.compliance ? 
          { ...this.context.compliance, nsmClassification: entities.compliance } : 
          this.context.compliance,
        locale: this.context.locale,
        features: []
      });

      // Format response based on user preferences
      if (this.context.userPreferences.codeStyle === 'verbose') {
        return `${result.explanation}\n\n\`\`\`typescript\n${result.code}\n\`\`\`\n\n${result.suggestions.join('\n')}`;
      } else if (this.context.userPreferences.codeStyle === 'concise') {
        return `\`\`\`typescript\n${result.code}\n\`\`\``;
      } else {
        return `Here's the generated code:\n\n\`\`\`typescript\n${result.code}\n\`\`\`\n\nSuggestions: ${result.suggestions.join(', ')}`;
      }

    } catch (error) {
      return this.getErrorResponse(error);
    }
  }

  /**
   * Handle code analysis intent
   */
  private async handleCodeAnalysis(message: string, entities: Record<string, any>): Promise<string> {
    try {
      if (!entities.filePath) {
        return this.context.locale === 'nb-NO' 
          ? 'Vennligst oppgi filstien du ønsker å analysere.'
          : 'Please provide the file path you want to analyze.';
      }

      const code = await this.fileSystem.readFile(entities.filePath);
      const patterns = await this.patternMatcher!.analyzeCode(code, {
        include_compliance_check: true,
        locale: this.context.locale
      });

      const complianceIssues = await this.patternMatcher!.detectComplianceIssues(code, this.context.locale);

      let response = this.context.locale === 'nb-NO' 
        ? `Analyse av ${entities.filePath}:\n\n`
        : `Analysis of ${entities.filePath}:\n\n`;

      if (patterns.length > 0) {
        response += this.context.locale === 'nb-NO' ? '**Mønstre funnet:**\n' : '**Patterns found:**\n';
        patterns.slice(0, 3).forEach(p => {
          response += `• ${p.pattern.name} (${(p.match_score * 100).toFixed(0)}%)\n`;
        });
        response += '\n';
      }

      if (complianceIssues.length > 0) {
        response += this.context.locale === 'nb-NO' ? '**Compliance-problemer:**\n' : '**Compliance issues:**\n';
        complianceIssues.slice(0, 5).forEach(issue => {
          response += `• ${issue.severity.toUpperCase()}: ${issue.description}\n`;
        });
      } else {
        response += this.context.locale === 'nb-NO' 
          ? '✅ Ingen compliance-problemer funnet!\n'
          : '✅ No compliance issues found!\n';
      }

      return response;

    } catch (error) {
      return this.getErrorResponse(error);
    }
  }

  /**
   * Handle code refactoring intent
   */
  private async handleCodeRefactoring(message: string, entities: Record<string, any>): Promise<string> {
    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      
      if (!entities.filePath) {
        return this.context.locale === 'nb-NO'
          ? 'Vennligst oppgi filstien du ønsker å refaktorere.'
          : 'Please provide the file path you want to refactor.';
      }

      const code = await this.fileSystem.readFile(entities.filePath);
      const improvements = await aiService.improveCode(code, this.context.compliance);

      let response = this.context.locale === 'nb-NO'
        ? `Refaktoreringer for ${entities.filePath}:\n\n`
        : `Refactorings for ${entities.filePath}:\n\n`;

      improvements.improvements.forEach((improvement, index) => {
        response += `${index + 1}. ${improvement.description}\n`;
        if (improvement.example) {
          response += `   \`\`\`typescript\n   ${improvement.example}\n   \`\`\`\n`;
        }
      });

      response += `\n${this.context.locale === 'nb-NO' ? 'Kvalitetsscore' : 'Quality score'}: ${(improvements.qualityScore * 100).toFixed(0)}%`;

      return response;

    } catch (error) {
      return this.getErrorResponse(error);
    }
  }

  /**
   * Handle testing intent
   */
  private async handleTesting(message: string, entities: Record<string, any>): Promise<string> {
    try {
      // Use prompt template for test generation
      const templateId = 'test-generation-prompt';
      const template = this.promptEngine!.getTemplate(templateId, this.context.locale);
      
      if (!template) {
        return this.context.locale === 'nb-NO'
          ? 'Beklager, jeg kan ikke generere tester akkurat nå.'
          : 'Sorry, I cannot generate tests right now.';
      }

      return this.context.locale === 'nb-NO'
        ? 'Jeg kan hjelpe deg med å lage tester. Hva ønsker du å teste?'
        : 'I can help you create tests. What would you like to test?';

    } catch (error) {
      return this.getErrorResponse(error);
    }
  }

  /**
   * Handle documentation intent
   */
  private async handleDocumentation(message: string, entities: Record<string, any>): Promise<string> {
    return this.context.locale === 'nb-NO'
      ? 'Jeg kan hjelpe deg med dokumentasjon. Hva ønsker du å dokumentere?'
      : 'I can help you with documentation. What would you like to document?';
  }

  /**
   * Handle compliance intent
   */
  private async handleCompliance(message: string, entities: Record<string, any>): Promise<string> {
    const compliance = this.context.compliance;
    
    let response = this.context.locale === 'nb-NO'
      ? '**Nåværende compliance-innstillinger:**\n\n'
      : '**Current compliance settings:**\n\n';

    response += `• NSM Classification: ${compliance.nsmClassification}\n`;
    response += `• GDPR Compliant: ${compliance.gdprCompliant ? '✅' : '❌'}\n`;
    response += `• WCAG Level: ${compliance.wcagLevel}\n`;
    response += `• Supported Languages: ${compliance.supportedLanguages.join(', ')}\n`;
    response += `• Audit Trail: ${compliance.auditTrail ? '✅' : '❌'}\n`;

    response += this.context.locale === 'nb-NO'
      ? '\n\nTrenger du hjelp med spesifikke compliance-krav?'
      : '\n\nDo you need help with specific compliance requirements?';

    return response;
  }

  /**
   * Handle help intent
   */
  private async handleHelp(message: string, entities: Record<string, any>): Promise<string> {
    let response = this.context.locale === 'nb-NO'
      ? '**Tilgjengelige kommandoer:**\n\n'
      : '**Available commands:**\n\n';

    const commands = this.context.locale === 'nb-NO' ? {
      'lag/generer [beskrivelse]': 'Generer kode basert på beskrivelse',
      'analyser [filsti]': 'Analyser eksisterende kode',
      'forbedre [filsti]': 'Foreslå forbedringer for kode',
      'test [beskrivelse]': 'Generer tester',
      'dokumenter [filsti]': 'Generer dokumentasjon',
      'compliance': 'Vis compliance-innstillinger',
      'innstillinger': 'Endre preferanser',
      'tøm': 'Tøm skjermen',
      'exit/avslutt': 'Avslutt assistenten'
    } : {
      'create/generate [description]': 'Generate code based on description',
      'analyze [filepath]': 'Analyze existing code',
      'improve [filepath]': 'Suggest improvements for code',
      'test [description]': 'Generate tests',
      'document [filepath]': 'Generate documentation',
      'compliance': 'Show compliance settings',
      'settings': 'Change preferences',
      'clear': 'Clear screen',
      'exit/quit': 'Exit assistant'
    };

    for (const [command, description] of Object.entries(commands)) {
      response += `• ${chalk.cyan(command)}: ${description}\n`;
    }

    response += this.context.locale === 'nb-NO'
      ? '\n\nDu kan også stille generelle spørsmål om utvikling og beste praksis!'
      : '\n\nYou can also ask general questions about development and best practices!';

    return response;
  }

  /**
   * Handle settings intent
   */
  private async handleSettings(message: string, entities: Record<string, any>): Promise<string> {
    return this.context.locale === 'nb-NO'
      ? 'Innstillinger kan endres. Hva ønsker du å justere?'
      : 'Settings can be changed. What would you like to adjust?';
  }

  /**
   * Handle general query
   */
  private async handleGeneralQuery(message: string): Promise<string> {
    try {
      const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
      const response = await aiService.chat({
        message,
        context: this.getConversationContext(),
        compliance: this.context.compliance,
        locale: this.context.locale
      });

      return response.response;

    } catch (error) {
      return this.context.locale === 'nb-NO'
        ? 'Beklager, jeg forstod ikke helt. Kan du omformulere spørsmålet?'
        : 'Sorry, I didn\'t quite understand. Could you rephrase your question?';
    }
  }

  /**
   * Get error response
   */
  private getErrorResponse(error: any): string {
    this.logger.error('Assistant error', error);
    
    return this.context.locale === 'nb-NO'
      ? `Beklager, det oppstod en feil: ${error instanceof Error ? error.message : 'Ukjent feil'}`
      : `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  /**
   * Create conversation message
   */
  private createMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): IConversationMessage {
    return {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        compliance: this.context.compliance,
        locale: this.context.locale
      }
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get conversation context for AI
   */
  private getConversationContext(): string {
    const recentMessages = this.context.messages.slice(-10);
    return recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }

  /**
   * Learn from interaction
   */
  private async learnFromInteraction(
    userMessage: IConversationMessage,
    assistantMessage: IConversationMessage,
    intent: IIntentRecognition
  ): Promise<void> {
    try {
      const contextManager = this.aiServiceFactory!.createContextManagerService();
      
      await contextManager.updateLearning({
        interaction: {
          userMessage: userMessage.content,
          assistantResponse: assistantMessage.content,
          intent: intent.intent,
          confidence: intent.confidence,
          timestamp: new Date().toISOString()
        },
        feedback: {
          // Would be collected from user feedback
          helpful: true,
          accurate: true,
          relevant: true
        },
        context: {
          projectType: this.context.currentProject?.type,
          framework: this.context.currentProject?.framework,
          compliance: this.context.compliance,
          locale: this.context.locale
        }
      });

      this.logger.debug('Learning data updated from interaction');

    } catch (error) {
      this.logger.warn('Failed to update learning data', error as Error);
    }
  }

  /**
   * Save learning data
   */
  private async saveLearningData(): Promise<void> {
    try {
      const contextManager = this.aiServiceFactory!.createContextManagerService();
      
      // Save conversation summary
      await contextManager.updateContext('conversation_summary', {
        conversationId: this.context.id,
        messageCount: this.context.messages.length,
        topics: this.extractTopics(),
        preferences: this.context.userPreferences,
        timestamp: new Date().toISOString()
      });

      this.logger.info('Learning data saved successfully');

    } catch (error) {
      this.logger.error('Failed to save learning data', error as Error);
    }
  }

  /**
   * Extract topics from conversation
   */
  private extractTopics(): string[] {
    const topics = new Set<string>();
    
    this.context.messages.forEach(message => {
      if (message.metadata?.intent) {
        topics.add(message.metadata.intent);
      }
    });

    return Array.from(topics);
  }
}
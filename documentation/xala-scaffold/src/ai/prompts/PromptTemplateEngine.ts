/**
 * Prompt Template Engine
 * 
 * Manages AI prompt templates for consistent code generation with Norwegian compliance.
 * Supports dynamic template rendering, localization, and context-aware prompts.
 * 
 * Features:
 * - Template-based prompt generation
 * - Norwegian compliance prompts
 * - Context-aware template selection
 * - Multi-language prompt support
 * - Validation and safety checks
 * - Template composition and inheritance
 */

import { EventEmitter } from 'events';
import { ILoggingService, IConfigurationService } from '../../architecture/interfaces.js';
import { LocaleCode, NorwegianCompliance } from '../../types/compliance.js';

/**
 * Prompt template definition
 */
export interface IPromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'component' | 'service' | 'api' | 'test' | 'analysis' | 'general';
  locale: LocaleCode;
  template: string;
  variables: IPromptVariable[];
  examples?: IPromptExample[];
  metadata: IPromptMetadata;
}

/**
 * Prompt template variable
 */
export interface IPromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: string; // Regex pattern for validation
}

/**
 * Prompt example
 */
export interface IPromptExample {
  title: string;
  description: string;
  variables: Record<string, any>;
  expectedOutput?: string;
}

/**
 * Prompt metadata
 */
export interface IPromptMetadata {
  version: string;
  author: string;
  created: string;
  updated: string;
  tags: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
}

/**
 * Prompt rendering context
 */
export interface IPromptContext {
  variables: Record<string, any>;
  locale: LocaleCode;
  compliance: NorwegianCompliance;
  projectContext?: {
    framework: string;
    language: string;
    designSystem?: string;
    conventions?: string[];
  };
  userPreferences?: {
    codeStyle: string;
    verbosity: 'minimal' | 'normal' | 'detailed';
    includeComments: boolean;
    explainDecisions: boolean;
  };
}

/**
 * Rendered prompt result
 */
export interface IRenderedPrompt {
  content: string;
  metadata: {
    templateId: string;
    locale: LocaleCode;
    variables: Record<string, any>;
    estimatedTokens: number;
    renderTime: number;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Prompt Template Engine
 */
export class PromptTemplateEngine extends EventEmitter {
  private templates = new Map<string, IPromptTemplate>();
  private initialized = false;

  // Built-in Norwegian compliance prompts
  private readonly BUILT_IN_TEMPLATES: IPromptTemplate[] = [
    {
      id: 'norwegian-react-component',
      name: 'Norwegian React Component',
      description: 'Generate React component with Norwegian compliance',
      category: 'component',
      locale: 'nb-NO',
      template: `Du er en ekspert utvikler som lager React-komponenter med norsk compliance.

OPPGAVE: Lag en React-komponent basert på følgende beskrivelse:
"{{description}}"

KRAV:
- TypeScript med strikt typing
- Norsk compliance (NSM: {{nsmClassification}}, GDPR: {{gdprCompliant}}, WCAG: {{wcagLevel}})
- Støtte for språk: {{supportedLanguages}}
- {{#if accessibility}}Tilgjengelig for skjermlesere og tastaturnavigasjon{{/if}}
- {{#if localization}}Flerspråklig støtte med nb-NO som primærspråk{{/if}}
- Tailwind CSS for styling
- JSX.Element return type
- Readonly interface for props

STRUKTUR:
1. Interface for props (readonly)
2. Hovedkomponent med JSX.Element return
3. Export statements

SIKKERHET OG COMPLIANCE:
- NSM klassifisering: {{nsmClassification}}
- GDPR compliance: {{gdprCompliant}}
- WCAG nivå: {{wcagLevel}}
- {{#if auditTrail}}Inkluder audit logging for interaksjoner{{/if}}

STIL:
- Bruk norske kommentarer og variabelnavn der det er naturlig
- Inkluder data-testid for testing
- Legg til aria-labels for tilgjengelighet
- Bruk semantic HTML elementer

Generer kun koden, ingen forklaring.`,
      variables: [
        {
          name: 'description',
          type: 'string',
          required: true,
          description: 'Beskrivelse av komponenten som skal lages'
        },
        {
          name: 'nsmClassification',
          type: 'string',
          required: true,
          description: 'NSM sikkerhetskklassifisering',
          defaultValue: 'OPEN'
        },
        {
          name: 'gdprCompliant',
          type: 'boolean',
          required: true,
          description: 'GDPR compliance påkrevd',
          defaultValue: true
        },
        {
          name: 'wcagLevel',
          type: 'string',
          required: true,
          description: 'WCAG tilgjengelighetsnivå',
          defaultValue: 'AAA'
        },
        {
          name: 'supportedLanguages',
          type: 'array',
          required: true,
          description: 'Støttede språk',
          defaultValue: ['nb-NO', 'en-US']
        },
        {
          name: 'accessibility',
          type: 'boolean',
          required: false,
          description: 'Inkluder tilgjengelighetsfunksjoner',
          defaultValue: true
        },
        {
          name: 'localization',
          type: 'boolean',
          required: false,
          description: 'Inkluder flerspråklig støtte',
          defaultValue: true
        },
        {
          name: 'auditTrail',
          type: 'boolean',
          required: false,
          description: 'Inkluder audit logging',
          defaultValue: false
        }
      ],
      examples: [
        {
          title: 'Login Button',
          description: 'Lag en login-knapp med norsk compliance',
          variables: {
            description: 'En login-knapp med sikker autentisering og audit logging',
            nsmClassification: 'RESTRICTED',
            gdprCompliant: true,
            wcagLevel: 'AAA',
            supportedLanguages: ['nb-NO', 'en-US'],
            accessibility: true,
            localization: true,
            auditTrail: true
          }
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'Xala Enterprise',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['react', 'typescript', 'norwegian', 'compliance', 'component'],
        complexity: 'medium',
        estimatedTokens: 800
      }
    },
    {
      id: 'english-react-component',
      name: 'English React Component',
      description: 'Generate React component with Norwegian compliance (English prompts)',
      category: 'component',
      locale: 'en-US',
      template: `You are an expert developer creating React components with Norwegian compliance.

TASK: Create a React component based on this description:
"{{description}}"

REQUIREMENTS:
- TypeScript with strict typing
- Norwegian compliance (NSM: {{nsmClassification}}, GDPR: {{gdprCompliant}}, WCAG: {{wcagLevel}})
- Language support: {{supportedLanguages}}
- {{#if accessibility}}Accessible for screen readers and keyboard navigation{{/if}}
- {{#if localization}}Multi-language support with nb-NO as primary language{{/if}}
- Tailwind CSS for styling
- JSX.Element return type
- Readonly interface for props

STRUCTURE:
1. Props interface (readonly)
2. Main component with JSX.Element return
3. Export statements

SECURITY AND COMPLIANCE:
- NSM classification: {{nsmClassification}}
- GDPR compliance: {{gdprCompliant}}
- WCAG level: {{wcagLevel}}
- {{#if auditTrail}}Include audit logging for interactions{{/if}}

STYLE:
- Use Norwegian language strings where appropriate
- Include data-testid for testing
- Add aria-labels for accessibility
- Use semantic HTML elements

Generate only the code, no explanation.`,
      variables: [
        {
          name: 'description',
          type: 'string',
          required: true,
          description: 'Description of the component to create'
        },
        {
          name: 'nsmClassification',
          type: 'string',
          required: true,
          description: 'NSM security classification',
          defaultValue: 'OPEN'
        },
        {
          name: 'gdprCompliant',
          type: 'boolean',
          required: true,
          description: 'GDPR compliance required',
          defaultValue: true
        },
        {
          name: 'wcagLevel',
          type: 'string',
          required: true,
          description: 'WCAG accessibility level',
          defaultValue: 'AAA'
        },
        {
          name: 'supportedLanguages',
          type: 'array',
          required: true,
          description: 'Supported languages',
          defaultValue: ['nb-NO', 'en-US']
        },
        {
          name: 'accessibility',
          type: 'boolean',
          required: false,
          description: 'Include accessibility features',
          defaultValue: true
        },
        {
          name: 'localization',
          type: 'boolean',
          required: false,
          description: 'Include multi-language support',
          defaultValue: true
        },
        {
          name: 'auditTrail',
          type: 'boolean',
          required: false,
          description: 'Include audit logging',
          defaultValue: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'Xala Enterprise',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['react', 'typescript', 'norwegian', 'compliance', 'component'],
        complexity: 'medium',
        estimatedTokens: 800
      }
    },
    {
      id: 'code-analysis-prompt',
      name: 'Code Analysis Prompt',
      description: 'Analyze code for patterns, quality, and compliance',
      category: 'analysis',
      locale: 'nb-NO',
      template: `Du er en ekspert kodeanalysator med fokus på norsk compliance og kodekvalitet.

OPPGAVE: Analyser følgende kode:

\`\`\`{{language}}
{{code}}
\`\`\`

ANALYSÉR:
1. **Kodekvalitet**
   - SOLID prinsipper
   - TypeScript strict mode
   - Lesbarhet og vedlikehold
   - Performance implikasjoner

2. **Norsk Compliance**
   - NSM sikkerhetskrav
   - GDPR personvernkrav  
   - WCAG tilgjengelighetskrav
   - Audit logging

3. **Arkitektur**
   - Designmønstre
   - Avhengighetsstruktur
   - Testbarhet
   - Skalerbarhet

4. **Sikkerhet**
   - Sårbarheter
   - Input validering
   - Data eksponering
   - Feilhåndtering

GI TILBAKEMELDING PÅ:
- Styrker i koden
- Områder for forbedring
- Konkrete forslag til endringer
- Compliance problemer som må løses
- Sikkerhetshensyn

LEVER RESULTAT SOM:
- Sammendrag (kort)
- Detaljerte funn
- Prioriterte anbefalinger
- Kodeeksempler for forbedringer

{{#if includeMetrics}}Inkluder også kvantitative mål som syklomatisk kompleksitet og vedlikeholdsbarhetsindeks.{{/if}}`,
      variables: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'Koden som skal analyseres'
        },
        {
          name: 'language',
          type: 'string',
          required: true,
          description: 'Programmeringsspråk',
          defaultValue: 'typescript'
        },
        {
          name: 'includeMetrics',
          type: 'boolean',
          required: false,
          description: 'Inkluder kvantitative mål',
          defaultValue: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'Xala Enterprise',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['analysis', 'quality', 'compliance', 'norwegian'],
        complexity: 'high',
        estimatedTokens: 1200
      }
    },
    {
      id: 'test-generation-prompt',
      name: 'Test Generation Prompt',
      description: 'Generate comprehensive tests with Norwegian compliance testing',
      category: 'test',
      locale: 'nb-NO',
      template: `Du er en ekspert på testing som lager omfattende tester med norsk compliance fokus.

OPPGAVE: Lag tester for følgende komponent/kode:

\`\`\`{{language}}
{{code}}
\`\`\`

TESTKRAV:
- {{testFramework}} som testramme
- TypeScript med strikt typing
- 95%+ kode dekning
- Norsk compliance testing
- Tilgjengelighetstester (WCAG {{wcagLevel}})
- {{#if gdprTesting}}GDPR compliance tester{{/if}}
- {{#if performanceTesting}}Performance tester{{/if}}

TESTTYPER:
1. **Enhetstester**
   - Alle offentlige metoder
   - Edge cases og feilscenarioer
   - Input validering
   - Output verifikasjon

2. **Integrasjonstester**
   - Komponent samspill
   - API integrasjoner
   - Database operasjoner

3. **Compliance Tester**
   - NSM klassifisering håndtering
   - GDPR data behandling
   - WCAG tilgjengelighet
   - Audit logging

4. **Tilgjengelighetstester**
   - Skjermleser kompatibilitet
   - Tastaturnavigasjon
   - Fokushåndtering
   - ARIA attributter

STRUKTUR:
- Describe blokker med norske beskrivelser
- Setup og teardown
- Mock data og tjenester
- Assertion meldinger på norsk
- Test utilities for Norwegian compliance

GENERER:
- Komplette testfiler
- Mock implementasjoner
- Test data fixtures
- Custom matchers for compliance

{{#if includeE2E}}Inkluder også ende-til-ende tester med Playwright.{{/if}}`,
      variables: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'Koden som skal testes'
        },
        {
          name: 'language',
          type: 'string',
          required: true,
          description: 'Programmeringsspråk',
          defaultValue: 'typescript'
        },
        {
          name: 'testFramework',
          type: 'string',
          required: true,
          description: 'Testramme som skal brukes',
          defaultValue: 'Jest'
        },
        {
          name: 'wcagLevel',
          type: 'string',
          required: true,
          description: 'WCAG nivå for tilgjengelighetstester',
          defaultValue: 'AAA'
        },
        {
          name: 'gdprTesting',
          type: 'boolean',
          required: false,
          description: 'Inkluder GDPR testing',
          defaultValue: true
        },
        {
          name: 'performanceTesting',
          type: 'boolean',
          required: false,
          description: 'Inkluder performance testing',
          defaultValue: false
        },
        {
          name: 'includeE2E',
          type: 'boolean',
          required: false,
          description: 'Inkluder ende-til-ende tester',
          defaultValue: false
        }
      ],
      metadata: {
        version: '1.0.0',
        author: 'Xala Enterprise',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: ['testing', 'compliance', 'accessibility', 'norwegian'],
        complexity: 'high',
        estimatedTokens: 1500
      }
    }
  ];

  constructor(
    private readonly logger: ILoggingService,
    private readonly config: IConfigurationService
  ) {
    super();
  }

  /**
   * Initialize the prompt template engine
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Prompt Template Engine');

      // Load built-in templates
      this.loadBuiltInTemplates();

      // Load custom templates from configuration
      await this.loadCustomTemplates();

      this.initialized = true;
      this.emit('initialized');

      this.logger.info('Prompt Template Engine initialized successfully', {
        templatesCount: this.templates.size
      });
    } catch (error) {
      this.logger.error('Failed to initialize Prompt Template Engine', error as Error);
      throw error;
    }
  }

  /**
   * Render a prompt template
   */
  async renderPrompt(templateId: string, context: IPromptContext): Promise<IRenderedPrompt> {
    const startTime = Date.now();

    try {
      this.logger.debug('Rendering prompt template', {
        templateId,
        locale: context.locale
      });

      const template = this.getTemplate(templateId, context.locale);
      if (!template) {
        throw new Error(`Template not found: ${templateId} for locale ${context.locale}`);
      }

      // Validate required variables
      const validation = this.validateContext(template, context);
      if (validation.errors.length > 0) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Merge variables with defaults
      const variables = this.mergeVariables(template, context.variables);

      // Render template content
      const content = this.renderTemplate(template.template, {
        ...variables,
        compliance: context.compliance,
        projectContext: context.projectContext,
        userPreferences: context.userPreferences
      });

      const result: IRenderedPrompt = {
        content,
        metadata: {
          templateId,
          locale: context.locale,
          variables,
          estimatedTokens: this.estimateTokens(content),
          renderTime: Date.now() - startTime
        },
        warnings: validation.warnings,
        errors: []
      };

      this.logger.debug('Prompt template rendered successfully', {
        templateId,
        estimatedTokens: result.metadata.estimatedTokens,
        renderTime: result.metadata.renderTime
      });

      this.emit('promptRendered', result);
      return result;

    } catch (error) {
      this.logger.error('Failed to render prompt template', error as Error, {
        templateId,
        locale: context.locale
      });

      return {
        content: '',
        metadata: {
          templateId,
          locale: context.locale,
          variables: {},
          estimatedTokens: 0,
          renderTime: Date.now() - startTime
        },
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available templates
   */
  getTemplates(): IPromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID and locale
   */
  getTemplate(id: string, locale: LocaleCode): IPromptTemplate | undefined {
    // Try exact match first
    const exactKey = `${id}-${locale}`;
    if (this.templates.has(exactKey)) {
      return this.templates.get(exactKey);
    }

    // Try fallback to English
    const fallbackKey = `${id}-en-US`;
    if (this.templates.has(fallbackKey)) {
      return this.templates.get(fallbackKey);
    }

    // Try template ID without locale
    return this.templates.get(id);
  }

  /**
   * Add custom template
   */
  addTemplate(template: IPromptTemplate): void {
    const key = `${template.id}-${template.locale}`;
    this.templates.set(key, template);
    
    this.logger.debug('Template added', {
      id: template.id,
      locale: template.locale,
      category: template.category
    });

    this.emit('templateAdded', template);
  }

  /**
   * Remove template
   */
  removeTemplate(id: string, locale: LocaleCode): boolean {
    const key = `${id}-${locale}`;
    const removed = this.templates.delete(key);
    
    if (removed) {
      this.logger.debug('Template removed', { id, locale });
      this.emit('templateRemoved', { id, locale });
    }
    
    return removed;
  }

  // === Private Helper Methods ===

  /**
   * Load built-in templates
   */
  private loadBuiltInTemplates(): void {
    for (const template of this.BUILT_IN_TEMPLATES) {
      const key = `${template.id}-${template.locale}`;
      this.templates.set(key, template);
    }

    this.logger.debug('Built-in templates loaded', {
      count: this.BUILT_IN_TEMPLATES.length
    });
  }

  /**
   * Load custom templates from configuration
   */
  private async loadCustomTemplates(): Promise<void> {
    try {
      const customTemplatesPath = this.config.get<string>('ai.prompts.customTemplatesPath');
      if (!customTemplatesPath) {
        return;
      }

      // In a real implementation, this would load templates from files
      this.logger.debug('Custom templates path configured', { path: customTemplatesPath });

    } catch (error) {
      this.logger.warn('Failed to load custom templates', error as Error);
    }
  }

  /**
   * Validate context against template requirements
   */
  private validateContext(
    template: IPromptTemplate, 
    context: IPromptContext
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in context.variables)) {
        errors.push(`Required variable missing: ${variable.name}`);
      }

      // Validate variable types and patterns
      if (variable.name in context.variables) {
        const value = context.variables[variable.name];
        
        if (variable.validation) {
          const regex = new RegExp(variable.validation);
          if (typeof value === 'string' && !regex.test(value)) {
            warnings.push(`Variable ${variable.name} does not match expected pattern`);
          }
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Merge variables with template defaults
   */
  private mergeVariables(template: IPromptTemplate, variables: Record<string, any>): Record<string, any> {
    const merged = { ...variables };

    // Add default values for missing variables
    for (const variable of template.variables) {
      if (!(variable.name in merged) && variable.defaultValue !== undefined) {
        merged[variable.name] = variable.defaultValue;
      }
    }

    return merged;
  }

  /**
   * Render template with Handlebars-like syntax
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Replace simple variables {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] !== undefined ? String(variables[varName]) : match;
    });

    // Replace array variables {{#each array}}{{this}}{{/each}}
    rendered = rendered.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, itemTemplate) => {
      const array = variables[arrayName];
      if (Array.isArray(array)) {
        return array.map(item => itemTemplate.replace(/\{\{this\}\}/g, String(item))).join('');
      }
      return '';
    });

    // Replace conditional blocks {{#if condition}}content{{/if}}
    rendered = rendered.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, conditionName, content) => {
      const condition = variables[conditionName];
      return condition ? content : '';
    });

    // Replace nested object properties {{object.property}}
    rendered = rendered.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, objName, propName) => {
      const obj = variables[objName];
      if (obj && typeof obj === 'object' && propName in obj) {
        return String(obj[propName]);
      }
      return match;
    });

    return rendered;
  }

  /**
   * Estimate token count for content
   */
  private estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }
}
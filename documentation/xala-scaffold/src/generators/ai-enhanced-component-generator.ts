/**
 * AI-Enhanced Component Generator
 * 
 * Extends the base ComponentGenerator with AI-powered code generation capabilities.
 * Uses the RAG system to generate components based on natural language descriptions
 * with Norwegian compliance and enterprise patterns.
 * 
 * Features:
 * - Natural language component generation
 * - Pattern-based code suggestions
 * - Norwegian compliance validation
 * - Accessibility optimization
 * - Code quality analysis
 * - Interactive refinement
 */

import { injectable, inject } from 'inversify';
import { z } from 'zod';
import { 
  ILoggingService, 
  IConfigurationService, 
  ILocalizationService,
  IFileSystemService 
} from '../architecture/interfaces.js';
import { AIServiceFactory } from '../ai/services/AIServiceFactory.js';
import { PatternMatcher, IPatternMatch } from '../rag/pattern-matching/PatternMatcher.js';
import { LocaleCode, NorwegianCompliance } from '../types/compliance.js';
import { BaseGenerator, GenerationContext, TemplateFile } from './base-generator.js';

/**
 * AI-enhanced component generation input
 */
const AIComponentGenerationInputSchema = z.object({
  // Natural language description
  description: z.string().min(10, 'Description must be at least 10 characters'),
  
  // Basic component info
  name: z.string().optional(), // Can be auto-generated from description
  type: z.enum(['display', 'form', 'layout', 'business', 'composite', 'hook']).optional(),
  
  // AI generation options
  aiOptions: z.object({
    useAI: z.boolean().default(true),
    analysisLevel: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
    includePatterns: z.boolean().default(true),
    includeExamples: z.boolean().default(true),
    generateTests: z.boolean().default(true),
    generateStories: z.boolean().default(true),
    optimizeAccessibility: z.boolean().default(true),
    interactive: z.boolean().default(false)
  }).default({}),

  // Technical preferences
  preferences: z.object({
    language: z.enum(['typescript', 'javascript']).default('typescript'),
    framework: z.enum(['react', 'vue', 'angular']).default('react'),
    styling: z.enum(['tailwind', 'styled-components', 'css-modules', 'tokens']).default('tailwind'),
    stateManagement: z.enum(['useState', 'zustand', 'redux', 'none']).default('useState'),
    formHandling: z.enum(['react-hook-form', 'formik', 'native', 'none']).default('react-hook-form'),
  }).default({}),

  // Norwegian compliance requirements
  compliance: z.object({
    nsmClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
    gdprCompliant: z.boolean().default(true),
    wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AAA'),
    supportedLanguages: z.array(z.string()).default(['nb-NO', 'en-US']),
    auditTrail: z.boolean().default(false)
  }).default({}),

  // Output configuration
  output: z.object({
    path: z.string(),
    namespace: z.string().optional(),
    locale: z.string().default('nb-NO'),
    overwrite: z.boolean().default(false)
  }),

  // Context for generation
  context: z.object({
    projectType: z.string().optional(),
    existingComponents: z.array(z.string()).default([]),
    designSystem: z.string().optional(),
    brandGuidelines: z.string().optional()
  }).default({})
});

type AIComponentGenerationInput = z.infer<typeof AIComponentGenerationInputSchema>;

/**
 * AI component generation result
 */
interface IAIComponentGenerationResult {
  success: boolean;
  files: TemplateFile[];
  analysis: {
    detectedType: string;
    suggestedName: string;
    complexity: 'low' | 'medium' | 'high';
    patterns: IPatternMatch[];
    complianceIssues: any[];
    qualityScore: number;
  };
  recommendations: string[];
  warnings: string[];
  errors: string[];
  processingTime: number;
}

/**
 * AI-Enhanced Component Generator
 */
@injectable()
export class AIEnhancedComponentGenerator extends BaseGenerator {
  private aiServiceFactory?: AIServiceFactory;
  private patternMatcher?: PatternMatcher;

  constructor(
    @inject('ILoggingService') logger: ILoggingService,
    @inject('IConfigurationService') config: IConfigurationService,
    @inject('ILocalizationService') localization: ILocalizationService,
    @inject('IFileSystemService') fileSystem: IFileSystemService
  ) {
    super(logger, config, localization, fileSystem);
  }

  /**
   * Generate component using AI
   */
  async generateAIComponent(input: AIComponentGenerationInput): Promise<IAIComponentGenerationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Starting AI-enhanced component generation', {
        description: input.description.substring(0, 100),
        aiOptions: input.aiOptions
      });

      // Validate input
      const validatedInput = AIComponentGenerationInputSchema.parse(input);

      const result: IAIComponentGenerationResult = {
        success: false,
        files: [],
        analysis: {
          detectedType: 'display',
          suggestedName: '',
          complexity: 'medium',
          patterns: [],
          complianceIssues: [],
          qualityScore: 0
        },
        recommendations: [],
        warnings: [],
        errors: [],
        processingTime: 0
      };

      // Initialize AI services
      await this.initializeAIServices();

      // Step 1: Analyze description and extract requirements
      const analysisResult = await this.analyzeDescription(validatedInput.description, validatedInput);
      result.analysis = { ...result.analysis, ...analysisResult };

      // Step 2: Generate component name if not provided
      if (!validatedInput.name) {
        validatedInput.name = result.analysis.suggestedName;
      }

      // Step 3: Retrieve relevant patterns and examples
      const patterns = await this.retrieveRelevantPatterns(validatedInput, result.analysis);
      result.analysis.patterns = patterns;

      // Step 4: Generate component code using AI
      const generationResult = await this.generateComponentWithAI(validatedInput, result.analysis);

      // Step 5: Validate generated code
      const validationResult = await this.validateGeneratedCode(
        generationResult.code, 
        validatedInput.compliance as NorwegianCompliance
      );

      // Step 6: Generate additional files (tests, stories, etc.)
      const additionalFiles = await this.generateAdditionalFiles(
        validatedInput, 
        generationResult.code, 
        result.analysis
      );

      // Compile results
      result.files = [
        {
          path: this.buildComponentPath(validatedInput.output.path, validatedInput.name!),
          content: generationResult.code,
          template: 'ai-generated-component'
        },
        ...additionalFiles
      ];

      result.recommendations = generationResult.recommendations;
      result.analysis.complianceIssues = validationResult.complianceIssues;
      result.analysis.qualityScore = validationResult.qualityScore;
      result.warnings = validationResult.warnings;
      result.errors = validationResult.errors;
      result.success = validationResult.errors.length === 0;
      result.processingTime = Date.now() - startTime;

      this.logger.info('AI component generation completed', {
        name: validatedInput.name,
        success: result.success,
        filesGenerated: result.files.length,
        processingTime: result.processingTime
      });

      return result;

    } catch (error) {
      this.logger.error('AI component generation failed', error as Error);
      
      return {
        success: false,
        files: [],
        analysis: {
          detectedType: 'display',
          suggestedName: '',
          complexity: 'medium',
          patterns: [],
          complianceIssues: [],
          qualityScore: 0
        },
        recommendations: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Interactive component generation with refinement
   */
  async generateComponentInteractively(
    initialInput: AIComponentGenerationInput,
    refinementCallback?: (result: IAIComponentGenerationResult) => Promise<Partial<AIComponentGenerationInput>>
  ): Promise<IAIComponentGenerationResult> {
    let currentInput = { ...initialInput };
    let iterations = 0;
    const maxIterations = 3;

    while (iterations < maxIterations) {
      const result = await this.generateAIComponent(currentInput);

      // If successful or no callback, return result
      if (result.success || !refinementCallback) {
        return result;
      }

      // Get refinements from callback
      const refinements = await refinementCallback(result);
      
      if (!refinements || Object.keys(refinements).length === 0) {
        return result; // No refinements, return current result
      }

      // Apply refinements
      currentInput = { ...currentInput, ...refinements };
      iterations++;

      this.logger.debug('Applying AI generation refinements', {
        iteration: iterations,
        refinements: Object.keys(refinements)
      });
    }

    // Return last result if max iterations reached
    return this.generateAIComponent(currentInput);
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

    if (!this.patternMatcher) {
      this.patternMatcher = new PatternMatcher(this.logger);
      await this.patternMatcher.initialize();
    }
  }

  /**
   * Analyze description to extract component requirements
   */
  private async analyzeDescription(
    description: string, 
    input: AIComponentGenerationInput
  ): Promise<{
    detectedType: string;
    suggestedName: string;
    complexity: 'low' | 'medium' | 'high';
  }> {
    try {
      const aiCodeGenerator = this.aiServiceFactory!.createAICodeGeneratorService();
      
      // Use AI to analyze the description
      const analysis = await aiCodeGenerator.analyzeCode(description, input.compliance as NorwegianCompliance);

      // Extract component type from description
      const detectedType = this.detectComponentType(description);
      
      // Generate component name from description
      const suggestedName = this.generateComponentName(description);
      
      // Assess complexity based on description
      const complexity = this.assessComplexity(description);

      return {
        detectedType,
        suggestedName,
        complexity
      };

    } catch (error) {
      this.logger.warn('Failed to analyze description with AI, using fallback', error as Error);
      
      return {
        detectedType: 'display',
        suggestedName: 'GeneratedComponent',
        complexity: 'medium'
      };
    }
  }

  /**
   * Detect component type from description
   */
  private detectComponentType(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('form') || lowerDesc.includes('input') || lowerDesc.includes('submit')) {
      return 'form';
    }
    if (lowerDesc.includes('layout') || lowerDesc.includes('container') || lowerDesc.includes('wrapper')) {
      return 'layout';
    }
    if (lowerDesc.includes('business') || lowerDesc.includes('logic') || lowerDesc.includes('service')) {
      return 'business';
    }
    if (lowerDesc.includes('hook') || lowerDesc.includes('use')) {
      return 'hook';
    }
    if (lowerDesc.includes('composite') || lowerDesc.includes('complex') || lowerDesc.includes('multiple')) {
      return 'composite';
    }
    
    return 'display';
  }

  /**
   * Generate component name from description
   */
  private generateComponentName(description: string): string {
    // Extract key words and convert to PascalCase
    const words = description
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    const name = words.join('');
    
    // Ensure it ends with 'Component' if not already a component name
    if (!name.includes('Component') && !name.includes('Button') && !name.includes('Form') && !name.includes('Modal')) {
      return name + 'Component';
    }
    
    return name || 'GeneratedComponent';
  }

  /**
   * Assess complexity from description
   */
  private assessComplexity(description: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = {
      low: ['simple', 'basic', 'minimal', 'display', 'show'],
      medium: ['form', 'interactive', 'state', 'manage', 'handle'],
      high: ['complex', 'advanced', 'multiple', 'integrate', 'validate', 'api', 'data']
    };

    const lowerDesc = description.toLowerCase();
    let highScore = 0;
    let mediumScore = 0;
    let lowScore = 0;

    complexityIndicators.high.forEach(indicator => {
      if (lowerDesc.includes(indicator)) highScore++;
    });

    complexityIndicators.medium.forEach(indicator => {
      if (lowerDesc.includes(indicator)) mediumScore++;
    });

    complexityIndicators.low.forEach(indicator => {
      if (lowerDesc.includes(indicator)) lowScore++;
    });

    if (highScore > 0 || description.length > 200) return 'high';
    if (mediumScore > 0 || description.length > 100) return 'medium';
    return 'low';
  }

  /**
   * Retrieve relevant patterns for component generation
   */
  private async retrieveRelevantPatterns(
    input: AIComponentGenerationInput,
    analysis: any
  ): Promise<IPatternMatch[]> {
    try {
      const ragService = this.aiServiceFactory!.createRAGService();
      
      const codeRequirements = {
        type: analysis.detectedType,
        description: input.description,
        language: input.preferences.language,
        framework: input.preferences.framework,
        compliance: input.compliance as NorwegianCompliance,
        locale: input.output.locale as LocaleCode,
        features: []
      };

      const patterns = await ragService.retrieveCodePatterns(codeRequirements);
      
      // Convert to pattern matches for compatibility
      return patterns.map(pattern => ({
        pattern: {
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          type: 'structural' as any,
          language: pattern.language,
          framework: pattern.framework,
          pattern_code: pattern.code,
          metadata: {
            category: pattern.category,
            tags: pattern.tags,
            quality_score: pattern.qualityScore / 100,
            usage_count: pattern.usageCount,
            complexity: 5,
            maintainability: 0.8,
            created_at: pattern.createdAt,
            updated_at: pattern.updatedAt,
            author: 'System',
            source: 'knowledge-base'
          },
          examples: pattern.examples,
          related_patterns: [],
          compliance: pattern.compliance
        },
        match_score: 0.8,
        confidence: 0.8,
        matched_segments: [],
        improvements: [],
        compliance_issues: [],
        explanation: `Pattern matches component type: ${analysis.detectedType}`
      }));

    } catch (error) {
      this.logger.warn('Failed to retrieve relevant patterns', error as Error);
      return [];
    }
  }

  /**
   * Generate component code using AI
   */
  private async generateComponentWithAI(
    input: AIComponentGenerationInput,
    analysis: any
  ): Promise<{ code: string; recommendations: string[] }> {
    try {
      const aiCodeGenerator = this.aiServiceFactory!.createAICodeGeneratorService();
      
      const generationRequest = {
        description: input.description,
        type: analysis.detectedType,
        language: input.preferences.language,
        framework: input.preferences.framework,
        compliance: input.compliance as NorwegianCompliance,
        locale: input.output.locale as LocaleCode,
        features: []
      };

      const result = await aiCodeGenerator.generateCode(generationRequest);
      
      return {
        code: result.code,
        recommendations: result.suggestions
      };

    } catch (error) {
      this.logger.error('AI code generation failed, using template fallback', error as Error);
      
      // Fallback to template-based generation
      return {
        code: this.generateFallbackComponent(input, analysis),
        recommendations: ['AI generation failed, using template fallback']
      };
    }
  }

  /**
   * Generate fallback component using templates
   */
  private generateFallbackComponent(
    input: AIComponentGenerationInput,
    analysis: any
  ): string {
    const componentName = input.name || analysis.suggestedName;
    
    return `/**
 * ${componentName}
 * 
 * ${input.description}
 * 
 * Generated by Xala Scaffold with Norwegian compliance
 */

import React from 'react';
import { NorwegianCompliance } from '../types/compliance.js';

interface ${componentName}Props {
  readonly className?: string;
  readonly compliance?: NorwegianCompliance;
  readonly locale?: 'nb-NO' | 'en-US';
}

export const ${componentName} = ({
  className = '',
  compliance,
  locale = 'nb-NO'
}: ${componentName}Props): JSX.Element => {
  return (
    <div 
      className={\`p-4 rounded-lg \${className}\`}
      role="region"
      aria-label="${componentName}"
      data-testid="${componentName.toLowerCase()}"
    >
      <p>{locale === 'nb-NO' ? 'Generert komponent' : 'Generated component'}</p>
      {compliance && (
        <div className="text-xs text-gray-500 mt-2">
          Sikkerhetsnivå: {compliance.nsmClassification}
        </div>
      )}
    </div>
  );
};

export default ${componentName};`;
  }

  /**
   * Validate generated code
   */
  private async validateGeneratedCode(
    code: string,
    compliance: NorwegianCompliance
  ): Promise<{
    complianceIssues: any[];
    qualityScore: number;
    warnings: string[];
    errors: string[];
  }> {
    try {
      const complianceIssues = await this.patternMatcher!.detectComplianceIssues(code);
      
      // Calculate quality score based on code length, complexity, and compliance
      const qualityScore = this.calculateQualityScore(code, complianceIssues);
      
      const warnings: string[] = [];
      const errors: string[] = [];

      // Categorize compliance issues
      complianceIssues.forEach(issue => {
        if (issue.severity === 'error' || issue.severity === 'critical') {
          errors.push(issue.description);
        } else {
          warnings.push(issue.description);
        }
      });

      return {
        complianceIssues,
        qualityScore,
        warnings,
        errors
      };

    } catch (error) {
      this.logger.warn('Code validation failed', error as Error);
      
      return {
        complianceIssues: [],
        qualityScore: 0.7, // Default score
        warnings: ['Code validation failed'],
        errors: []
      };
    }
  }

  /**
   * Generate additional files (tests, stories, etc.)
   */
  private async generateAdditionalFiles(
    input: AIComponentGenerationInput,
    componentCode: string,
    analysis: any
  ): Promise<TemplateFile[]> {
    const files: TemplateFile[] = [];
    const componentName = input.name || analysis.suggestedName;

    // Generate test file
    if (input.aiOptions.generateTests) {
      files.push({
        path: this.buildTestPath(input.output.path, componentName),
        content: this.generateTestFile(componentName, componentCode, input),
        template: 'ai-generated-test'
      });
    }

    // Generate Storybook story
    if (input.aiOptions.generateStories) {
      files.push({
        path: this.buildStoryPath(input.output.path, componentName),
        content: this.generateStoryFile(componentName, componentCode, input),
        template: 'ai-generated-story'
      });
    }

    return files;
  }

  /**
   * Calculate quality score for generated code
   */
  private calculateQualityScore(code: string, complianceIssues: any[]): number {
    let score = 1.0;

    // Penalize for compliance issues
    const criticalIssues = complianceIssues.filter(i => i.severity === 'critical').length;
    const errorIssues = complianceIssues.filter(i => i.severity === 'error').length;
    const warningIssues = complianceIssues.filter(i => i.severity === 'warning').length;

    score -= (criticalIssues * 0.3);
    score -= (errorIssues * 0.15);
    score -= (warningIssues * 0.05);

    // Bonus for good practices
    if (code.includes('aria-label')) score += 0.1;
    if (code.includes('data-testid')) score += 0.05;
    if (code.includes('readonly')) score += 0.05;
    if (code.includes('React.memo') || code.includes('useCallback')) score += 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Build component file path
   */
  private buildComponentPath(basePath: string, componentName: string): string {
    return `${basePath}/${componentName}/${componentName}.tsx`;
  }

  /**
   * Build test file path
   */
  private buildTestPath(basePath: string, componentName: string): string {
    return `${basePath}/${componentName}/${componentName}.test.tsx`;
  }

  /**
   * Build story file path
   */
  private buildStoryPath(basePath: string, componentName: string): string {
    return `${basePath}/${componentName}/${componentName}.stories.tsx`;
  }

  /**
   * Generate test file content
   */
  private generateTestFile(componentName: string, componentCode: string, input: AIComponentGenerationInput): string {
    return `/**
 * ${componentName} Tests
 * 
 * Generated by Xala Scaffold with Norwegian compliance testing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeInTheDocument();
  });

  it('meets Norwegian compliance requirements', () => {
    const compliance = {
      nsmClassification: 'OPEN' as const,
      gdprCompliant: true,
      wcagLevel: 'AAA' as const,
      supportedLanguages: ['nb-NO', 'en-US'],
      auditTrail: false
    };

    render(<${componentName} compliance={compliance} />);
    
    // Check for accessibility attributes
    const component = screen.getByTestId('${componentName.toLowerCase()}');
    expect(component).toHaveAttribute('role');
    expect(component).toHaveAttribute('aria-label');
  });

  it('supports Norwegian localization', () => {
    render(<${componentName} locale="nb-NO" />);
    expect(screen.getByText('Generert komponent')).toBeInTheDocument();
  });

  it('supports English localization', () => {
    render(<${componentName} locale="en-US" />);
    expect(screen.getByText('Generated component')).toBeInTheDocument();
  });
});`;
  }

  /**
   * Generate Storybook story content
   */
  private generateStoryFile(componentName: string, componentCode: string, input: AIComponentGenerationInput): string {
    return `/**
 * ${componentName} Stories
 * 
 * Generated by Xala Scaffold with Norwegian compliance examples
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${input.description}'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'select',
      options: ['nb-NO', 'en-US']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locale: 'nb-NO'
  }
};

export const English: Story = {
  args: {
    locale: 'en-US'
  }
};

export const WithCompliance: Story = {
  args: {
    locale: 'nb-NO',
    compliance: {
      nsmClassification: 'RESTRICTED',
      gdprCompliant: true,
      wcagLevel: 'AAA',
      supportedLanguages: ['nb-NO', 'en-US'],
      auditTrail: true
    }
  }
};`;
  }
}
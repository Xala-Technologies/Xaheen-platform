/**
 * Dynamic Template Composition System
 * 
 * Enables dynamic composition of templates based on user requirements,
 * business logic, and AI-driven pattern matching.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import { templateInheritance, type BaseTemplate, type TemplateComposition } from './template-inheritance.js';
import { patternMapper, type PatternMatch } from './pattern-mapper.js';
import { templateSelector, type TemplateSelectionContext } from './template-selector.js';
import { mcpClient } from '../mcp/mcp-client.js';
import type { NSMClassification } from '../compliance/nsm-classifier.js';

export interface CompositionRequest {
  readonly description: string;
  readonly requirements: CompositionRequirements;
  readonly context: BusinessContext;
  readonly preferences: UserPreferences;
}

export interface CompositionRequirements {
  readonly functionality: readonly string[];
  readonly complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  readonly platform: string;
  readonly designSystem: 'ui-system' | 'altinn' | 'custom';
  readonly accessibility: 'A' | 'AA' | 'AAA';
  readonly nsmClassification: NSMClassification;
  readonly norwegianCompliance: boolean;
  readonly internationalSupport: boolean;
  readonly responsiveDesign: boolean;
  readonly darkModeSupport: boolean;
  readonly performanceOptimized: boolean;
}

export interface BusinessContext {
  readonly industry: string;
  readonly userType: 'citizen' | 'business' | 'government' | 'internal';
  readonly dataTypes: readonly string[];
  readonly complianceRequirements: readonly string[];
  readonly integrationsNeeded: readonly string[];
  readonly expectedVolume: 'low' | 'medium' | 'high' | 'enterprise';
}

export interface UserPreferences {
  readonly stylePreference: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
  readonly codeStyle: 'functional' | 'class-based' | 'hooks-only';
  readonly testingFramework: 'jest' | 'vitest' | 'cypress' | 'playwright';
  readonly bundler: 'webpack' | 'vite' | 'rollup' | 'esbuild';
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  readonly deployment: 'vercel' | 'netlify' | 'aws' | 'azure' | 'self-hosted';
}

export interface CompositionResult {
  readonly success: boolean;
  readonly composition: TemplateComposition;
  readonly metadata: CompositionMetadata;
  readonly recommendations: readonly string[];
  readonly alternativeOptions: readonly AlternativeOption[];
  readonly estimatedComplexity: number; // 1-10 scale
  readonly estimatedTokens: number;
  readonly complianceScore: number; // 0-100
}

export interface CompositionMetadata {
  readonly selectedPatterns: readonly PatternMatch[];
  readonly appliedTemplates: readonly string[];
  readonly mixinsUsed: readonly string[];
  readonly aiRecommendations: readonly string[];
  readonly complianceValidation: ComplianceValidation;
  readonly performanceMetrics: PerformanceMetrics;
}

export interface AlternativeOption {
  readonly description: string;
  readonly baseTemplate: string;
  readonly mixins: readonly string[];
  readonly advantages: readonly string[];
  readonly tradeoffs: readonly string[];
  readonly complexity: number;
}

export interface ComplianceValidation {
  readonly wcagCompliant: boolean;
  readonly gdprCompliant: boolean;
  readonly nsmCompliant: boolean;
  readonly norwegianCompliant: boolean;
  readonly violations: readonly string[];
  readonly recommendations: readonly string[];
}

export interface PerformanceMetrics {
  readonly bundleSize: 'small' | 'medium' | 'large';
  readonly renderComplexity: 'low' | 'medium' | 'high';
  readonly memoryUsage: 'minimal' | 'moderate' | 'intensive';
  readonly loadTime: 'fast' | 'medium' | 'slow';
}

export class DynamicComposer {
  private compositionCache: Map<string, CompositionResult> = new Map();

  /**
   * Compose template dynamically based on requirements
   */
  async composeTemplate(request: CompositionRequest): Promise<CompositionResult> {
    consola.info(`Starting dynamic template composition for: ${request.description}`);

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(request);
      
      // Check cache
      const cached = this.compositionCache.get(cacheKey);
      if (cached) {
        consola.debug('Returning cached composition result');
        return cached;
      }

      // Step 1: Analyze requirements and patterns
      const patterns = await this.analyzeRequirements(request);
      
      // Step 2: Select optimal base template
      const baseTemplate = await this.selectBaseTemplate(request, patterns);
      
      // Step 3: Determine required mixins
      const mixins = await this.selectMixins(request, baseTemplate, patterns);
      
      // Step 4: Get AI recommendations
      const aiRecommendations = await this.getAIRecommendations(request, baseTemplate, mixins);
      
      // Step 5: Build composition
      const composition = await this.buildComposition(request, baseTemplate, mixins, patterns);
      
      // Step 6: Validate compliance
      const complianceValidation = await this.validateCompliance(composition, request);
      
      // Step 7: Generate alternatives
      const alternatives = await this.generateAlternatives(request, baseTemplate, patterns);
      
      // Step 8: Calculate metrics
      const performanceMetrics = this.calculatePerformanceMetrics(composition, request);
      const complexity = this.estimateComplexity(composition, request);
      const tokens = this.estimateTokens(composition, request);
      const complianceScore = this.calculateComplianceScore(complianceValidation);

      const result: CompositionResult = {
        success: true,
        composition,
        metadata: {
          selectedPatterns: patterns,
          appliedTemplates: [baseTemplate.id],
          mixinsUsed: mixins,
          aiRecommendations,
          complianceValidation,
          performanceMetrics
        },
        recommendations: this.generateRecommendations(request, composition, complianceValidation),
        alternativeOptions: alternatives,
        estimatedComplexity: complexity,
        estimatedTokens: tokens,
        complianceScore
      };

      // Cache result
      this.compositionCache.set(cacheKey, result);
      
      consola.success(`Dynamic composition completed with ${complianceScore}% compliance score`);
      return result;

    } catch (error) {
      consola.error('Dynamic composition failed:', error);
      return {
        success: false,
        composition: this.createFallbackComposition(request),
        metadata: this.createEmptyMetadata(),
        recommendations: ['Consider simplifying requirements or contact support'],
        alternativeOptions: [],
        estimatedComplexity: 1,
        estimatedTokens: 500,
        complianceScore: 0
      };
    }
  }

  /**
   * Analyze requirements and identify patterns
   */
  private async analyzeRequirements(request: CompositionRequest): Promise<PatternMatch[]> {
    const analysisInput = `
      ${request.description}
      Functionality: ${request.requirements.functionality.join(', ')}
      Industry: ${request.context.industry}
      User Type: ${request.context.userType}
      Data Types: ${request.context.dataTypes.join(', ')}
      Complexity: ${request.requirements.complexity}
    `;

    const patterns = patternMapper.mapKeywordsToPatterns(
      analysisInput,
      request.context.industry
    );

    // Enhance with AI analysis
    try {
      const aiHints = await mcpClient.getAIHints(request.description, request.requirements.platform);
      // Process AI hints to add more patterns
      for (const hint of aiHints) {
        const additionalPatterns = patternMapper.mapKeywordsToPatterns(hint);
        patterns.push(...additionalPatterns);
      }
    } catch (error) {
      consola.debug('AI hint analysis failed, continuing with pattern matching:', error);
    }

    return patterns.slice(0, 10); // Limit to top 10 patterns
  }

  /**
   * Select optimal base template
   */
  private async selectBaseTemplate(
    request: CompositionRequest,
    patterns: PatternMatch[]
  ): Promise<BaseTemplate> {
    const selectionContext: TemplateSelectionContext = {
      input: request.description,
      requirements: request.requirements.functionality,
      platform: request.requirements.platform,
      complexity: request.requirements.complexity,
      businessContext: request.context.industry,
      userType: request.context.userType,
      dataTypes: request.context.dataTypes,
      complianceRequirements: request.context.complianceRequirements,
      preferences: request.preferences
    };

    const recommendation = await templateSelector.selectTemplate(selectionContext);
    
    // Get the base template
    const baseTemplate = templateInheritance.getBaseTemplate(recommendation.templateId);
    if (!baseTemplate) {
      // Fallback to base component
      const fallback = templateInheritance.getBaseTemplate('base-component');
      if (!fallback) {
        throw new Error('No base templates available');
      }
      return fallback;
    }

    return baseTemplate;
  }

  /**
   * Select appropriate mixins
   */
  private async selectMixins(
    request: CompositionRequest,
    baseTemplate: BaseTemplate,
    patterns: PatternMatch[]
  ): Promise<string[]> {
    const mixins: string[] = [];

    // Norwegian compliance mixin
    if (request.requirements.norwegianCompliance) {
      mixins.push('norwegian-compliance-mixin');
    }

    // Accessibility mixin based on level
    if (request.requirements.accessibility === 'AAA') {
      mixins.push('accessibility-aaa-mixin');
    }

    // Performance mixin
    if (request.requirements.performanceOptimized) {
      mixins.push('performance-optimization-mixin');
    }

    // Dark mode mixin
    if (request.requirements.darkModeSupport) {
      mixins.push('dark-mode-mixin');
    }

    // International support mixin
    if (request.requirements.internationalSupport) {
      mixins.push('i18n-mixin');
    }

    // Pattern-based mixins
    for (const pattern of patterns.slice(0, 3)) { // Top 3 patterns
      const patternMixin = `${pattern.pattern.toLowerCase()}-mixin`;
      if (!mixins.includes(patternMixin)) {
        mixins.push(patternMixin);
      }
    }

    return mixins;
  }

  /**
   * Get AI recommendations
   */
  private async getAIRecommendations(
    request: CompositionRequest,
    baseTemplate: BaseTemplate,
    mixins: string[]
  ): Promise<string[]> {
    try {
      const context = `
        Component: ${request.description}
        Base Template: ${baseTemplate.name}
        Mixins: ${mixins.join(', ')}
        Requirements: ${JSON.stringify(request.requirements)}
        Business Context: ${JSON.stringify(request.context)}
      `;

      return await mcpClient.getAIHints(context, request.requirements.platform);
    } catch (error) {
      consola.debug('AI recommendations failed:', error);
      return [
        'Consider adding error boundaries for production use',
        'Implement proper loading states for better UX',
        'Add comprehensive TypeScript types for better maintainability'
      ];
    }
  }

  /**
   * Build final composition
   */
  private async buildComposition(
    request: CompositionRequest,
    baseTemplate: BaseTemplate,
    mixins: string[],
    patterns: PatternMatch[]
  ): Promise<TemplateComposition> {
    // Build context from request
    const context = {
      // Basic props
      componentName: this.generateComponentName(request.description),
      nsmClassification: request.requirements.nsmClassification,
      wcagLevel: request.requirements.accessibility,
      norwegianCompliance: request.requirements.norwegianCompliance,
      
      // Business context
      industry: request.context.industry,
      userType: request.context.userType,
      dataTypes: request.context.dataTypes,
      
      // Technical preferences
      platform: request.requirements.platform,
      designSystem: request.requirements.designSystem,
      codeStyle: request.preferences.codeStyle,
      
      // Pattern context
      patterns: patterns.map(p => p.pattern),
      complexity: request.requirements.complexity,
      
      // Feature flags
      darkModeSupport: request.requirements.darkModeSupport,
      responsiveDesign: request.requirements.responsiveDesign,
      internationalSupport: request.requirements.internationalSupport,
      performanceOptimized: request.requirements.performanceOptimized,
      
      // AI enhancements
      mcpHints: patterns.map(p => p.description),
      mcpPatterns: patterns.map(p => p.pattern).join(', '),
      mcpComplexity: request.requirements.complexity,
      mcpTokens: this.estimateTokens({} as TemplateComposition, request),
      mcpNSMLevel: request.requirements.nsmClassification
    };

    // Build slots from patterns
    const slots: Record<string, string> = {};
    
    // Main content slot based on patterns
    if (patterns.some(p => p.pattern === 'Form')) {
      slots.content = this.generateFormContent(request);
    } else if (patterns.some(p => p.pattern === 'Dashboard')) {
      slots.content = this.generateDashboardContent(request);
    } else if (patterns.some(p => p.pattern === 'Card')) {
      slots.content = this.generateCardContent(request);
    } else {
      slots.content = this.generateGenericContent(request);
    }

    // Interface props slot
    slots['interface-props'] = this.generateInterfaceProps(request, patterns);

    // Imports slot
    slots.imports = this.generateImports(request, patterns);

    // Hooks slot
    slots.hooks = this.generateHooks(request, patterns);

    return {
      baseTemplate: baseTemplate.id,
      mixins,
      overrides: {},
      slots,
      context
    };
  }

  /**
   * Validate compliance
   */
  private async validateCompliance(
    composition: TemplateComposition,
    request: CompositionRequest
  ): Promise<ComplianceValidation> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // WCAG compliance check
    const wcagCompliant = request.requirements.accessibility === 'AAA';
    if (!wcagCompliant) {
      violations.push('WCAG AAA compliance not met');
      recommendations.push('Upgrade accessibility level to AAA for full compliance');
    }

    // GDPR compliance check
    const gdprCompliant = request.requirements.norwegianCompliance && 
                         request.context.dataTypes.length > 0;
    if (!gdprCompliant && request.context.dataTypes.length > 0) {
      violations.push('GDPR compliance requirements not addressed');
      recommendations.push('Enable Norwegian compliance for GDPR support');
    }

    // NSM compliance check
    const nsmCompliant = composition.context.nsmClassification !== undefined;
    if (!nsmCompliant) {
      violations.push('NSM classification not specified');
      recommendations.push('Specify appropriate NSM classification level');
    }

    // Norwegian compliance check
    const norwegianCompliant = request.requirements.norwegianCompliance;
    if (!norwegianCompliant && request.context.userType === 'government') {
      violations.push('Norwegian compliance required for government services');
      recommendations.push('Enable Norwegian compliance for government applications');
    }

    return {
      wcagCompliant,
      gdprCompliant,
      nsmCompliant,
      norwegianCompliant,
      violations,
      recommendations
    };
  }

  /**
   * Generate alternative options
   */
  private async generateAlternatives(
    request: CompositionRequest,
    selectedBase: BaseTemplate,
    patterns: PatternMatch[]
  ): Promise<AlternativeOption[]> {
    const alternatives: AlternativeOption[] = [];

    // Get all compatible base templates
    const compatibleTemplates = templateInheritance.listBaseTemplates(
      undefined, // any category
      request.requirements.platform
    );

    for (const template of compatibleTemplates.slice(0, 3)) {
      if (template.id === selectedBase.id) continue;

      const mixins = await this.selectMixins(request, template, patterns);
      
      alternatives.push({
        description: `Alternative using ${template.name}`,
        baseTemplate: template.id,
        mixins,
        advantages: this.getTemplateAdvantages(template, request),
        tradeoffs: this.getTemplateTradeoffs(template, request),
        complexity: this.estimateTemplateComplexity(template)
      });
    }

    return alternatives;
  }

  // Helper methods for generating content
  private generateComponentName(description: string): string {
    return description
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private generateFormContent(request: CompositionRequest): string {
    return `
      <Stack direction="vertical" gap="lg">
        ${request.requirements.functionality.map(func => 
          `<Input label="${func}" required />`
        ).join('\n        ')}
        
        <Button type="submit" variant="primary">
          {{t "${this.generateComponentName(request.description).toLowerCase()}.submit" "Submit"}}
        </Button>
      </Stack>
    `;
  }

  private generateDashboardContent(request: CompositionRequest): string {
    return `
      <Grid cols={3} gap="lg">
        ${request.requirements.functionality.map(func => 
          `<Card>
            <CardContent>
              <Text variant="h3">${func}</Text>
              <Text>Dashboard widget for ${func}</Text>
            </CardContent>
          </Card>`
        ).join('\n        ')}
      </Grid>
    `;
  }

  private generateCardContent(request: CompositionRequest): string {
    return `
      <Card>
        <CardHeader>
          <CardTitle>{{title}}</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack direction="vertical" gap="md">
            ${request.requirements.functionality.map(func => 
              `<Text>${func} functionality</Text>`
            ).join('\n            ')}
          </Stack>
        </CardContent>
      </Card>
    `;
  }

  private generateGenericContent(request: CompositionRequest): string {
    return `
      <Stack direction="vertical" gap="md">
        <Text variant="h2">{{title}}</Text>
        <Text>{{description}}</Text>
        
        ${request.requirements.functionality.map(func => 
          `<div>{/* ${func} implementation */}</div>`
        ).join('\n        ')}
      </Stack>
    `;
  }

  private generateInterfaceProps(request: CompositionRequest, patterns: PatternMatch[]): string {
    const props: string[] = [];
    
    // Add common props based on patterns
    if (patterns.some(p => p.pattern === 'Form')) {
      props.push('readonly onSubmit?: (data: any) => Promise<void>;');
      props.push('readonly validation?: ValidationConfig;');
    }
    
    if (patterns.some(p => p.pattern === 'Dashboard')) {
      props.push('readonly title?: string;');
      props.push('readonly subtitle?: string;');
      props.push('readonly data?: any[];');
    }
    
    // Add functionality-based props
    for (const func of request.requirements.functionality) {
      const propName = func.toLowerCase().replace(/\s+/g, '');
      props.push(`readonly ${propName}Enabled?: boolean;`);
    }
    
    return props.join('\n  ');
  }

  private generateImports(request: CompositionRequest, patterns: PatternMatch[]): string {
    const imports: string[] = [];
    
    // Add pattern-based imports
    if (patterns.some(p => p.pattern === 'Form')) {
      imports.push("import { useState, useCallback } from 'react';");
    }
    
    if (patterns.some(p => p.pattern === 'Dashboard')) {
      imports.push("import { Grid } from '@xala-technologies/ui-system';");
    }
    
    return imports.join('\n');
  }

  private generateHooks(request: CompositionRequest, patterns: PatternMatch[]): string {
    const hooks: string[] = [];
    
    // Add pattern-based hooks
    if (patterns.some(p => p.pattern === 'Form')) {
      hooks.push('const [formData, setFormData] = useState({});');
      hooks.push('const [errors, setErrors] = useState({});');
    }
    
    if (patterns.some(p => p.pattern === 'Dashboard')) {
      hooks.push('const [loading, setLoading] = useState(false);');
      hooks.push('const [data, setData] = useState([]);');
    }
    
    return hooks.join('\n    ');
  }

  // Utility methods
  private generateCacheKey(request: CompositionRequest): string {
    return Buffer.from(JSON.stringify(request)).toString('base64').slice(0, 32);
  }

  private estimateComplexity(composition: TemplateComposition, request: CompositionRequest): number {
    let complexity = 1;
    
    complexity += request.requirements.functionality.length * 0.5;
    complexity += composition.mixins.length * 0.3;
    complexity += request.context.complianceRequirements.length * 0.2;
    
    if (request.requirements.complexity === 'complex') complexity += 2;
    if (request.requirements.complexity === 'advanced') complexity += 3;
    
    return Math.min(10, Math.max(1, Math.round(complexity)));
  }

  private estimateTokens(composition: TemplateComposition, request: CompositionRequest): number {
    let tokens = 500; // Base tokens
    
    tokens += request.requirements.functionality.length * 100;
    tokens += composition.mixins.length * 150;
    tokens += Object.keys(composition.slots).length * 50;
    
    if (request.requirements.complexity === 'complex') tokens += 300;
    if (request.requirements.complexity === 'advanced') tokens += 500;
    
    return tokens;
  }

  private calculatePerformanceMetrics(composition: TemplateComposition, request: CompositionRequest): PerformanceMetrics {
    const mixinCount = composition.mixins.length;
    const functionalityCount = request.requirements.functionality.length;
    
    return {
      bundleSize: mixinCount > 5 ? 'large' : mixinCount > 2 ? 'medium' : 'small',
      renderComplexity: functionalityCount > 5 ? 'high' : functionalityCount > 2 ? 'medium' : 'low',
      memoryUsage: request.requirements.complexity === 'advanced' ? 'intensive' : 'moderate',
      loadTime: request.requirements.performanceOptimized ? 'fast' : 'medium'
    };
  }

  private calculateComplianceScore(validation: ComplianceValidation): number {
    let score = 0;
    let total = 0;
    
    if (validation.wcagCompliant) score += 25;
    total += 25;
    
    if (validation.gdprCompliant) score += 25;
    total += 25;
    
    if (validation.nsmCompliant) score += 25;
    total += 25;
    
    if (validation.norwegianCompliant) score += 25;
    total += 25;
    
    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  private generateRecommendations(
    request: CompositionRequest,
    composition: TemplateComposition,
    validation: ComplianceValidation
  ): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(...validation.recommendations);
    
    if (request.requirements.performanceOptimized) {
      recommendations.push('Consider code splitting for better performance');
    }
    
    if (composition.mixins.length > 3) {
      recommendations.push('Review mixin usage to avoid over-complexity');
    }
    
    if (request.requirements.accessibility === 'AAA') {
      recommendations.push('Implement comprehensive keyboard navigation');
      recommendations.push('Add screen reader announcements for dynamic content');
    }
    
    return recommendations;
  }

  private getTemplateAdvantages(template: BaseTemplate, request: CompositionRequest): string[] {
    const advantages: string[] = [];
    
    if (template.category === 'form') {
      advantages.push('Built-in validation support');
      advantages.push('Optimized for form interactions');
    }
    
    if (template.category === 'layout') {
      advantages.push('Responsive design patterns');
      advantages.push('Navigation structure included');
    }
    
    return advantages;
  }

  private getTemplateTradeoffs(template: BaseTemplate, request: CompositionRequest): string[] {
    const tradeoffs: string[] = [];
    
    if (template.metadata.complexity === 'advanced') {
      tradeoffs.push('Higher complexity may require more maintenance');
    }
    
    if (template.metadata.estimatedTokens > 1000) {
      tradeoffs.push('Larger bundle size');
    }
    
    return tradeoffs;
  }

  private estimateTemplateComplexity(template: BaseTemplate): number {
    const complexityMap = { simple: 2, moderate: 4, complex: 6, advanced: 8 };
    return complexityMap[template.metadata.complexity];
  }

  private createFallbackComposition(request: CompositionRequest): TemplateComposition {
    return {
      baseTemplate: 'base-component',
      mixins: request.requirements.norwegianCompliance ? ['norwegian-compliance-mixin'] : [],
      overrides: {},
      slots: {
        content: '<Text>Fallback content</Text>'
      },
      context: {
        componentName: this.generateComponentName(request.description),
        nsmClassification: request.requirements.nsmClassification
      }
    };
  }

  private createEmptyMetadata(): CompositionMetadata {
    return {
      selectedPatterns: [],
      appliedTemplates: [],
      mixinsUsed: [],
      aiRecommendations: [],
      complianceValidation: {
        wcagCompliant: false,
        gdprCompliant: false,
        nsmCompliant: false,
        norwegianCompliant: false,
        violations: [],
        recommendations: []
      },
      performanceMetrics: {
        bundleSize: 'small',
        renderComplexity: 'low',
        memoryUsage: 'minimal',
        loadTime: 'fast'
      }
    };
  }
}

// Singleton instance
export const dynamicComposer = new DynamicComposer();
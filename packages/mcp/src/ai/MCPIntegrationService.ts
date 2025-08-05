/**
 * MCP Integration Service for AI-Native Template System
 * Connects AI-enhanced templates with existing MCP specification tools
 * 
 * Features:
 * - Integration with MCP component specification API
 * - Layout pattern recommendations from MCP generators
 * - MCP-powered component selection logic
 * - Accessibility validation through MCP compliance tools
 * - Norwegian compliance checking via MCP validators
 * - Performance optimization recommendations
 * - Design token transformation integration
 */

import type {
  AITemplateContext,
  AIEnhancedTemplateConfig,
  SupportedPlatform,
  ComponentCategory,
  IndustryTheme,
  AIMCPIntegration
} from '../types/index.js';

interface MCPSpecificationResponse {
  readonly specification: {
    readonly name: string;
    readonly category: string;
    readonly props: Record<string, any>;
    readonly variants: string[];
    readonly compliance: {
      readonly nsm: string;
      readonly wcag: string;
      readonly gdpr: boolean;
    };
  };
  readonly metadata: {
    readonly complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
    readonly dependencies: string[];
    readonly platforms: SupportedPlatform[];
  };
}

interface MCPLayoutPatternResponse {
  readonly patterns: Array<{
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly suitability: number; // 0-100 score
    readonly components: string[];
    readonly responsive: boolean;
    readonly accessibility: string;
  }>;
  readonly recommendations: string[];
}

interface MCPComponentSelectionResponse {
  readonly components: Array<{
    readonly name: string;
    readonly category: ComponentCategory;
    readonly description: string;
    readonly suitability: number;
    readonly complexity: string;
    readonly dependencies: string[];
  }>;
  readonly filters: {
    readonly applied: Record<string, any>;
    readonly available: Record<string, string[]>;
  };
}

interface MCPAccessibilityValidationResponse {
  readonly checks: Array<{
    readonly rule: string;
    readonly status: 'pass' | 'fail' | 'warning';
    readonly message: string;
    readonly impact: 'critical' | 'serious' | 'moderate' | 'minor';
  }>;
  readonly compliance: {
    readonly wcag: 'AA' | 'AAA' | 'partial';
    readonly score: number;
    readonly recommendations: string[];
  };
}

interface MCPNorwegianComplianceResponse {
  readonly classification: {
    readonly nsm: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'UNKNOWN';
    readonly confidence: number;
    readonly reasons: string[];
  };
  readonly gdpr: {
    readonly compliant: boolean;
    readonly requirements: string[];
    readonly violations: string[];
  };
  readonly altinn: {
    readonly compatible: boolean;
    readonly tokens: string[];
    readonly patterns: string[];
  };
}

interface MCPPerformanceResponse {
  readonly metrics: {
    readonly bundleSize: number;
    readonly renderTime: number;
    readonly memoryUsage: number;
    readonly score: number; // 0-100
  };
  readonly optimizations: Array<{
    readonly type: string;
    readonly description: string;
    readonly impact: 'high' | 'medium' | 'low';
    readonly implementation: string;
  }>;
  readonly recommendations: string[];
}

interface MCPDesignTokenResponse {
  readonly tokens: Record<string, {
    readonly value: string;
    readonly type: string;
    readonly description: string;
    readonly platforms: SupportedPlatform[];
  }>;
  readonly transformations: Array<{
    readonly from: string;
    readonly to: string;
    readonly platform: SupportedPlatform;
  }>;
  readonly validation: {
    readonly consistent: boolean;
    readonly errors: string[];
    readonly warnings: string[];
  };
}

export class MCPIntegrationService {
  private readonly integration: AIMCPIntegration;
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.integration = {
      specificationAPI: {
        endpoint: '/mcp/specifications',
        methods: ['get_specification', 'list_specifications', 'validate_against_spec']
      },
      layoutPatterns: {
        recommendations: ['generate_layout_from_spec', 'get_layout_recommendations'],
        generators: ['generate_layout', 'generate_page_template']
      },
      componentSelection: {
        library: ['browse_component_library', 'get_component_source'],
        filters: { platform: true, category: true, complexity: true }
      },
      accessibilityValidation: {
        tools: ['check_spec_compliance', 'validate_accessibility'],
        checkers: ['wcag_validator', 'aria_validator']
      },
      norwegianCompliance: {
        validators: ['nsm_classifier', 'gdpr_validator'],
        classifiers: ['altinn_compliance', 'norwegian_localization']
      },
      performanceOptimization: {
        analyzers: ['performance_analyzer', 'bundle_analyzer'],
        optimizers: ['code_splitter', 'lazy_loader']
      },
      designTokens: {
        transformers: ['token_transformer', 'theme_generator'],
        validators: ['design_system_validator', 'token_consistency_checker']
      }
    };
  }

  /**
   * Get component specification from MCP API
   */
  public async getComponentSpecification(
    componentName: string,
    platform?: SupportedPlatform
  ): Promise<MCPSpecificationResponse> {
    const cacheKey = `spec-${componentName}-${platform || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Call MCP specification API
      const response = await this.callMCPTool('get_specification', {
        componentName,
        platform
      });

      const result: MCPSpecificationResponse = {
        specification: {
          name: response.name || componentName,
          category: response.category || 'components',
          props: response.props || {},
          variants: response.variants || ['default'],
          compliance: {
            nsm: response.compliance?.nsm || 'OPEN',
            wcag: response.compliance?.wcag || 'AA',
            gdpr: response.compliance?.gdpr || false
          }
        },
        metadata: {
          complexity: response.metadata?.complexity || 'moderate',
          dependencies: response.metadata?.dependencies || [],
          platforms: response.metadata?.platforms || ['react']
        }
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP specification API error:', error);
      // Return fallback response
      return this.createFallbackSpecification(componentName, platform);
    }
  }

  /**
   * Get layout pattern recommendations from MCP
   */
  public async getLayoutPatternRecommendations(
    context: AITemplateContext
  ): Promise<MCPLayoutPatternResponse> {
    const cacheKey = `layout-${context.projectContext.platform}-${context.businessContext.domain}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('generate_layout_from_spec', {
        platform: context.projectContext.platform,
        businessDomain: context.businessContext.domain,
        requirements: context.businessContext.requirements,
        accessibility: context.complianceContext.accessibility,
        norwegianCompliance: context.complianceContext.norwegian
      });

      const result: MCPLayoutPatternResponse = {
        patterns: response.patterns?.map((pattern: any) => ({
          id: pattern.id || 'unknown',
          name: pattern.name || 'Unknown Pattern',
          description: pattern.description || '',
          suitability: pattern.suitability || 50,
          components: pattern.components || [],
          responsive: pattern.responsive || true,
          accessibility: pattern.accessibility || 'AA'
        })) || [],
        recommendations: response.recommendations || []
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP layout pattern API error:', error);
      return this.createFallbackLayoutPatterns(context);
    }
  }

  /**
   * Get component selection recommendations from MCP
   */
  public async getComponentSelectionRecommendations(
    context: AITemplateContext,
    filters?: {
      category?: ComponentCategory;
      complexity?: string;
      features?: string[];
    }
  ): Promise<MCPComponentSelectionResponse> {
    const cacheKey = `components-${context.projectContext.platform}-${filters?.category || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('browse_component_library', {
        platform: context.projectContext.platform,
        category: filters?.category,
        search: context.userIntent.description,
        limit: 20
      });

      const result: MCPComponentSelectionResponse = {
        components: response.components?.map((comp: any) => ({
          name: comp.name || 'Unknown Component',
          category: comp.category || 'components',
          description: comp.description || '',
          suitability: this.calculateComponentSuitability(comp, context),
          complexity: comp.complexity || 'moderate',
          dependencies: comp.dependencies || []
        })) || [],
        filters: {
          applied: filters || {},
          available: response.filters || {}
        }
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP component selection API error:', error);
      return this.createFallbackComponentSelection(context);
    }
  }

  /**
   * Validate accessibility compliance through MCP
   */
  public async validateAccessibilityCompliance(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): Promise<MCPAccessibilityValidationResponse> {
    const cacheKey = `accessibility-${template.name}-${context.complianceContext.accessibility.level}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('check_spec_compliance', {
        componentName: template.name,
        complianceType: 'wcag',
        level: context.complianceContext.accessibility.level
      });

      const result: MCPAccessibilityValidationResponse = {
        checks: response.checks?.map((check: any) => ({
          rule: check.rule || 'unknown',
          status: check.status || 'warning',
          message: check.message || '',
          impact: check.impact || 'moderate'
        })) || [],
        compliance: {
          wcag: response.compliance?.wcag || 'AA',
          score: response.compliance?.score || 80,
          recommendations: response.compliance?.recommendations || []
        }
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP accessibility validation API error:', error);
      return this.createFallbackAccessibilityValidation(template, context);
    }
  }

  /**
   * Check Norwegian compliance through MCP
   */
  public async checkNorwegianCompliance(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): Promise<MCPNorwegianComplianceResponse> {
    if (!context.complianceContext.norwegian) {
      return {
        classification: { nsm: 'OPEN', confidence: 100, reasons: ['Not Norwegian context'] },
        gdpr: { compliant: false, requirements: [], violations: [] },
        altinn: { compatible: false, tokens: [], patterns: [] }
      };
    }

    const cacheKey = `norwegian-${template.name}-${context.businessContext.domain}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('check_spec_compliance', {
        componentName: template.name,
        complianceType: 'norwegian',
        context: {
          businessDomain: context.businessContext.domain,
          requirements: context.businessContext.requirements
        }
      });

      const result: MCPNorwegianComplianceResponse = {
        classification: {
          nsm: response.classification?.nsm || 'OPEN',
          confidence: response.classification?.confidence || 80,
          reasons: response.classification?.reasons || []
        },
        gdpr: {
          compliant: response.gdpr?.compliant || false,
          requirements: response.gdpr?.requirements || [],
          violations: response.gdpr?.violations || []
        },
        altinn: {
          compatible: response.altinn?.compatible || false,
          tokens: response.altinn?.tokens || [],
          patterns: response.altinn?.patterns || []
        }
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP Norwegian compliance API error:', error);
      return this.createFallbackNorwegianCompliance(template, context);
    }
  }

  /**
   * Get performance optimization recommendations from MCP
   */
  public async getPerformanceOptimizations(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): Promise<MCPPerformanceResponse> {
    const cacheKey = `performance-${template.name}-${template.aiMetrics.featureComplexity}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('analyze_performance', {
        componentName: template.name,
        complexity: template.aiMetrics.featureComplexity,
        platform: context.projectContext.platform,
        requirements: context.performanceContext.requirements
      });

      const result: MCPPerformanceResponse = {
        metrics: {
          bundleSize: response.metrics?.bundleSize || template.aiMetrics.estimatedLinesOfCode * 50,
          renderTime: response.metrics?.renderTime || template.aiMetrics.buildTime * 0.1,
          memoryUsage: response.metrics?.memoryUsage || template.aiMetrics.dependencies * 1024,
          score: response.metrics?.score || 75
        },
        optimizations: response.optimizations?.map((opt: any) => ({
          type: opt.type || 'general',
          description: opt.description || '',
          impact: opt.impact || 'medium',
          implementation: opt.implementation || ''
        })) || [],
        recommendations: response.recommendations || template.aiOptimization.performanceOptimizations
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP performance optimization API error:', error);
      return this.createFallbackPerformanceResponse(template, context);
    }
  }

  /**
   * Get design token transformations from MCP
   */
  public async getDesignTokenTransformations(
    platform: SupportedPlatform,
    theme: IndustryTheme
  ): Promise<MCPDesignTokenResponse> {
    const cacheKey = `tokens-${platform}-${theme}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callMCPTool('transform_design_tokens', {
        platform,
        theme,
        target: 'component-library'
      });

      const result: MCPDesignTokenResponse = {
        tokens: response.tokens || {},
        transformations: response.transformations || [],
        validation: {
          consistent: response.validation?.consistent || true,
          errors: response.validation?.errors || [],
          warnings: response.validation?.warnings || []
        }
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('MCP design token API error:', error);
      return this.createFallbackDesignTokens(platform, theme);
    }
  }

  /**
   * Generate comprehensive MCP-enhanced recommendations
   */
  public async generateEnhancedRecommendations(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): Promise<{
    specification: MCPSpecificationResponse;
    layoutPatterns: MCPLayoutPatternResponse;
    componentSelection: MCPComponentSelectionResponse;
    accessibility: MCPAccessibilityValidationResponse;
    norwegianCompliance: MCPNorwegianComplianceResponse;
    performance: MCPPerformanceResponse;
    designTokens: MCPDesignTokenResponse;
    overallScore: number;
    recommendations: string[];
  }> {
    try {
      // Run all MCP integrations in parallel for performance
      const [
        specification,
        layoutPatterns,
        componentSelection,
        accessibility,
        norwegianCompliance,
        performance,
        designTokens
      ] = await Promise.all([
        this.getComponentSpecification(template.name, context.projectContext.platform),
        this.getLayoutPatternRecommendations(context),
        this.getComponentSelectionRecommendations(context),
        this.validateAccessibilityCompliance(template, context),
        this.checkNorwegianCompliance(template, context),
        this.getPerformanceOptimizations(template, context),
        this.getDesignTokenTransformations(context.projectContext.platform, context.businessContext.domain)
      ]);

      // Calculate overall recommendation score
      const overallScore = this.calculateOverallScore({
        specification,
        layoutPatterns,
        componentSelection,
        accessibility,
        norwegianCompliance,
        performance,
        designTokens
      });

      // Generate consolidated recommendations
      const recommendations = this.generateConsolidatedRecommendations({
        specification,
        layoutPatterns,
        componentSelection,
        accessibility,
        norwegianCompliance,
        performance,
        designTokens,
        template,
        context
      });

      return {
        specification,
        layoutPatterns,
        componentSelection,
        accessibility,
        norwegianCompliance,
        performance,
        designTokens,
        overallScore,
        recommendations
      };
    } catch (error) {
      console.error('MCP enhanced recommendations error:', error);
      throw new Error(`Failed to generate MCP-enhanced recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async callMCPTool(toolName: string, args: any): Promise<any> {
    // In a real implementation, this would make HTTP calls to the MCP server
    // For now, we'll simulate the response based on the tool name and args
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    switch (toolName) {
      case 'get_specification':
        return this.simulateSpecificationResponse(args);
      case 'generate_layout_from_spec':
        return this.simulateLayoutPatternResponse(args);
      case 'browse_component_library':
        return this.simulateComponentSelectionResponse(args);
      case 'check_spec_compliance':
        return this.simulateComplianceResponse(args);
      case 'analyze_performance':
        return this.simulatePerformanceResponse(args);
      case 'transform_design_tokens':
        return this.simulateDesignTokenResponse(args);
      default:
        throw new Error(`Unknown MCP tool: ${toolName}`);
    }
  }

  private simulateSpecificationResponse(args: any): any {
    return {
      name: args.componentName,
      category: 'components',
      props: {
        className: { type: 'string', required: false },
        children: { type: 'ReactNode', required: false },
        variant: { type: 'string', required: false, default: 'default' }
      },
      variants: ['default', 'primary', 'secondary'],
      compliance: {
        nsm: 'OPEN',
        wcag: 'AAA',
        gdpr: true
      },
      metadata: {
        complexity: 'moderate',
        dependencies: ['react', 'class-variance-authority'],
        platforms: ['react', 'nextjs']
      }
    };
  }

  private simulateLayoutPatternResponse(args: any): any {
    return {
      patterns: [
        {
          id: 'admin-dashboard',
          name: 'Admin Dashboard Layout',
          description: 'Comprehensive admin interface with sidebar navigation',
          suitability: 95,
          components: ['Sidebar', 'Header', 'MainContent', 'Footer'],
          responsive: true,
          accessibility: 'AAA'
        },
        {
          id: 'saas-web',
          name: 'SaaS Web Layout',
          description: 'Marketing-focused layout for SaaS applications',
          suitability: 80,
          components: ['Navbar', 'Hero', 'Features', 'Footer'],
          responsive: true,
          accessibility: 'AA'
        }
      ],
      recommendations: [
        'Use admin dashboard for complex management interfaces',
        'Consider mobile-first responsive design',
        'Implement proper accessibility landmarks'
      ]
    };
  }

  private simulateComponentSelectionResponse(args: any): any {
    return {
      components: [
        {
          name: 'Button',
          category: 'components',
          description: 'Interactive button with multiple variants',
          complexity: 'simple',
          dependencies: ['react']
        },
        {
          name: 'DataTable',
          category: 'data-components',
          description: 'Advanced data table with sorting and filtering',
          complexity: 'complex',
          dependencies: ['react', 'react-table']
        }
      ],
      filters: {
        platform: ['react', 'nextjs', 'vue'],
        category: ['components', 'data-components', 'layouts']
      }
    };
  }

  private simulateComplianceResponse(args: any): any {
    if (args.complianceType === 'wcag') {
      return {
        checks: [
          {
            rule: 'color-contrast',
            status: 'pass',
            message: 'Color contrast meets WCAG AAA standards',
            impact: 'serious'
          },
          {
            rule: 'keyboard-navigation',
            status: 'pass',
            message: 'Component supports keyboard navigation',
            impact: 'critical'
          }
        ],
        compliance: {
          wcag: 'AAA',
          score: 95,
          recommendations: ['Consider adding skip links', 'Test with screen readers']
        }
      };
    } else if (args.complianceType === 'norwegian') {
      return {
        classification: {
          nsm: 'RESTRICTED',
          confidence: 85,
          reasons: ['Contains business-sensitive information']
        },
        gdpr: {
          compliant: true,
          requirements: ['data consent', 'privacy policy'],
          violations: []
        },
        altinn: {
          compatible: true,
          tokens: ['altinn-blue', 'altinn-spacing'],
          patterns: ['government-form', 'official-header']
        }
      };
    }
    
    return {};
  }

  private simulatePerformanceResponse(args: any): any {
    return {
      metrics: {
        bundleSize: 25600,
        renderTime: 16,
        memoryUsage: 2048,
        score: 88
      },
      optimizations: [
        {
          type: 'lazy-loading',
          description: 'Implement lazy loading for non-critical components',
          impact: 'high',
          implementation: 'Use React.lazy() and Suspense'
        },
        {
          type: 'memoization',
          description: 'Memoize expensive calculations',
          impact: 'medium',
          implementation: 'Use React.memo and useMemo'
        }
      ],
      recommendations: [
        'Consider code splitting for large components',
        'Optimize images with next/image',
        'Implement service worker caching'
      ]
    };
  }

  private simulateDesignTokenResponse(args: any): any {
    return {
      tokens: {
        'color-primary': {
          value: '#3b82f6',
          type: 'color',
          description: 'Primary brand color',
          platforms: ['react', 'nextjs', 'vue']
        },
        'spacing-lg': {
          value: '2rem',
          type: 'dimension',
          description: 'Large spacing unit',
          platforms: ['react', 'nextjs', 'vue']
        }
      },
      transformations: [
        {
          from: 'css-custom-properties',
          to: 'tailwind-config',
          platform: 'react'
        }
      ],
      validation: {
        consistent: true,
        errors: [],
        warnings: ['Consider using semantic color names']
      }
    };
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private calculateComponentSuitability(component: any, context: AITemplateContext): number {
    let score = 50; // Base score
    
    // Platform compatibility
    if (component.platforms?.includes(context.projectContext.platform)) {
      score += 20;
    }
    
    // Business domain match
    if (component.businessDomains?.includes(context.businessContext.domain)) {
      score += 15;
    }
    
    // Keyword matching
    const keywords = context.userIntent.description.toLowerCase();
    if (keywords.includes(component.name.toLowerCase())) {
      score += 20;
    }
    
    // Complexity alignment
    const contextComplexity = this.inferComplexityFromContext(context);
    if (component.complexity === contextComplexity) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  private inferComplexityFromContext(context: AITemplateContext): string {
    const requirementCount = context.businessContext.requirements.length;
    const hasCompliance = context.complianceContext.norwegian || context.complianceContext.gdpr;
    
    if (hasCompliance && requirementCount > 5) return 'enterprise';
    if (requirementCount > 3) return 'complex';
    if (requirementCount > 1) return 'moderate';
    return 'simple';
  }

  private calculateOverallScore(responses: {
    specification: MCPSpecificationResponse;
    layoutPatterns: MCPLayoutPatternResponse;
    componentSelection: MCPComponentSelectionResponse;
    accessibility: MCPAccessibilityValidationResponse;
    norwegianCompliance: MCPNorwegianComplianceResponse;
    performance: MCPPerformanceResponse;
    designTokens: MCPDesignTokenResponse;
  }): number {
    const scores = [
      responses.accessibility.compliance.score || 80,
      responses.performance.metrics.score || 80,
      responses.layoutPatterns.patterns.reduce((sum, p) => sum + p.suitability, 0) / responses.layoutPatterns.patterns.length || 80,
      responses.componentSelection.components.reduce((sum, c) => sum + c.suitability, 0) / responses.componentSelection.components.length || 80
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private generateConsolidatedRecommendations(data: {
    specification: MCPSpecificationResponse;
    layoutPatterns: MCPLayoutPatternResponse;
    componentSelection: MCPComponentSelectionResponse;
    accessibility: MCPAccessibilityValidationResponse;
    norwegianCompliance: MCPNorwegianComplianceResponse;
    performance: MCPPerformanceResponse;
    designTokens: MCPDesignTokenResponse;
    template: AIEnhancedTemplateConfig;
    context: AITemplateContext;
  }): string[] {
    const recommendations: string[] = [];
    
    // Accessibility recommendations
    if (data.accessibility.compliance.score < 90) {
      recommendations.push('Improve accessibility compliance with enhanced ARIA attributes');
    }
    recommendations.push(...data.accessibility.compliance.recommendations);
    
    // Performance recommendations
    if (data.performance.metrics.score < 85) {
      recommendations.push('Implement performance optimizations for better user experience');
    }
    recommendations.push(...data.performance.recommendations);
    
    // Layout pattern recommendations
    recommendations.push(...data.layoutPatterns.recommendations);
    
    // Norwegian compliance recommendations
    if (data.context.complianceContext.norwegian) {
      if (!data.norwegianCompliance.gdpr.compliant) {
        recommendations.push('Implement GDPR-compliant data handling patterns');
      }
      if (!data.norwegianCompliance.altinn.compatible) {
        recommendations.push('Consider Altinn design system integration for government compatibility');
      }
    }
    
    // Design token recommendations
    if (!data.designTokens.validation.consistent) {
      recommendations.push('Ensure consistent design token usage across components');
    }
    
    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  // Fallback methods for error handling

  private createFallbackSpecification(componentName: string, platform?: SupportedPlatform): MCPSpecificationResponse {
    return {
      specification: {
        name: componentName,
        category: 'components',
        props: {},
        variants: ['default'],
        compliance: {
          nsm: 'OPEN',
          wcag: 'AA',
          gdpr: false
        }
      },
      metadata: {
        complexity: 'moderate',
        dependencies: [],
        platforms: [platform || 'react']
      }
    };
  }

  private createFallbackLayoutPatterns(context: AITemplateContext): MCPLayoutPatternResponse {
    return {
      patterns: [
        {
          id: 'basic-layout',
          name: 'Basic Layout',
          description: 'Simple layout pattern',
          suitability: 70,
          components: ['Header', 'Main', 'Footer'],
          responsive: true,
          accessibility: 'AA'
        }
      ],
      recommendations: ['Use responsive design patterns', 'Implement proper semantic HTML']
    };
  }

  private createFallbackComponentSelection(context: AITemplateContext): MCPComponentSelectionResponse {
    return {
      components: [
        {
          name: 'BasicComponent',
          category: 'components',
          description: 'Basic component implementation',
          suitability: 60,
          complexity: 'simple',
          dependencies: ['react']
        }
      ],
      filters: {
        applied: {},
        available: {}
      }
    };
  }

  private createFallbackAccessibilityValidation(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): MCPAccessibilityValidationResponse {
    return {
      checks: [
        {
          rule: 'basic-accessibility',
          status: 'warning',
          message: 'Basic accessibility check required',
          impact: 'moderate'
        }
      ],
      compliance: {
        wcag: 'AA',
        score: 75,
        recommendations: ['Implement proper ARIA attributes', 'Test keyboard navigation']
      }
    };
  }

  private createFallbackNorwegianCompliance(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): MCPNorwegianComplianceResponse {
    return {
      classification: {
        nsm: 'OPEN',
        confidence: 50,
        reasons: ['Default classification']
      },
      gdpr: {
        compliant: false,
        requirements: ['Implement data consent'],
        violations: []
      },
      altinn: {
        compatible: false,
        tokens: [],
        patterns: []
      }
    };
  }

  private createFallbackPerformanceResponse(
    template: AIEnhancedTemplateConfig,
    context: AITemplateContext
  ): MCPPerformanceResponse {
    return {
      metrics: {
        bundleSize: template.aiMetrics.estimatedLinesOfCode * 50,
        renderTime: template.aiMetrics.buildTime * 0.1,
        memoryUsage: template.aiMetrics.dependencies * 1024,
        score: 75
      },
      optimizations: [
        {
          type: 'general',
          description: 'General performance optimization',
          impact: 'medium',
          implementation: 'Follow React best practices'
        }
      ],
      recommendations: ['Implement lazy loading', 'Use memoization where appropriate']
    };
  }

  private createFallbackDesignTokens(platform: SupportedPlatform, theme: IndustryTheme): MCPDesignTokenResponse {
    return {
      tokens: {
        'color-primary': {
          value: '#3b82f6',
          type: 'color',
          description: 'Primary color',
          platforms: [platform]
        }
      },
      transformations: [],
      validation: {
        consistent: true,
        errors: [],
        warnings: []
      }
    };
  }
}
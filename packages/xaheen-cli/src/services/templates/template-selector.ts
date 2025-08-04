/**
 * Smart Template Selection Service
 * 
 * AI-powered template selection based on business context, complexity, and MCP intelligence.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { mcpClient } from '../mcp/mcp-client.js';
import { patternMapper } from './pattern-mapper.js';
import { consola } from 'consola';

export interface TemplateSelectionContext {
  componentName?: string;
  platform: string;
  businessContext?: 'ecommerce' | 'saas' | 'portfolio' | 'blog' | 'corporate' | 'startup' | 'government';
  complexity?: 'simple' | 'medium' | 'complex';
  features?: string[];
  userInput?: string; // Added for pattern matching
  targetAudience?: string;
  performanceRequirements?: 'low' | 'medium' | 'high';
  accessibilityLevel?: 'A' | 'AA' | 'AAA';
  nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface TemplateRecommendation {
  templatePath: string;
  confidence: number;
  reasoning: string[];
  aiHints: string[];
  patterns: string[];
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  estimatedTokens: number;
}

export class TemplateSelector {
  
  /**
   * Select the best template based on context and AI intelligence
   */
  async selectTemplate(context: TemplateSelectionContext): Promise<TemplateRecommendation> {
    const recommendations = await this.getTemplateRecommendations(context);
    
    // Return the highest confidence recommendation
    return recommendations[0] || this.getFallbackRecommendation(context);
  }

  /**
   * Get multiple template recommendations ranked by confidence
   */
  async getTemplateRecommendations(context: TemplateSelectionContext): Promise<TemplateRecommendation[]> {
    const recommendations: TemplateRecommendation[] = [];
    
    // Get MCP intelligence if component name is provided
    let mcpData = null;
    if (context.componentName) {
      mcpData = await mcpClient.loadSpecification(context.componentName);
    }

    // Pattern-based recommendations (NEW - highest priority)
    if (context.userInput) {
      const patternRecommendations = this.getPatternRecommendations(context);
      recommendations.push(...patternRecommendations);
    }

    // Business context-based selection
    const businessContextRecommendations = this.getBusinessContextRecommendations(context);
    recommendations.push(...businessContextRecommendations);

    // Platform-specific recommendations
    const platformRecommendations = this.getPlatformRecommendations(context);
    recommendations.push(...platformRecommendations);

    // Complexity-based recommendations
    const complexityRecommendations = await this.getComplexityRecommendations(context, mcpData);
    recommendations.push(...complexityRecommendations);

    // Feature-based recommendations
    const featureRecommendations = this.getFeatureRecommendations(context);
    recommendations.push(...featureRecommendations);

    // Norwegian compliance recommendations
    const complianceRecommendations = this.getComplianceRecommendations(context);
    recommendations.push(...complianceRecommendations);

    // Sort by confidence and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Get pattern-based recommendations using AI pattern mapping
   */
  private getPatternRecommendations(context: TemplateSelectionContext): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    if (!context.userInput) return recommendations;

    // Use pattern mapper to find matching patterns
    const patternMatches = patternMapper.mapKeywordsToPatterns(
      context.userInput, 
      context.businessContext
    );

    patternMatches.forEach(match => {
      const { pattern, confidence, matchedKeywords, reasoning } = match;
      
      // Convert pattern to template recommendation
      const templatePath = this.patternToTemplatePath(pattern.name, context.platform);
      
      recommendations.push({
        templatePath,
        confidence: confidence * 1.2, // Boost confidence for pattern matches
        reasoning: [
          `Pattern: ${pattern.name}`,
          `Matched: ${matchedKeywords.join(', ')}`,
          ...reasoning
        ],
        aiHints: pattern.aiHints,
        patterns: [`${pattern.layout} layout`, ...pattern.components],
        estimatedComplexity: pattern.complexity,
        estimatedTokens: pattern.estimatedTokens
      });
    });

    return recommendations;
  }

  /**
   * Convert pattern name to template path
   */
  private patternToTemplatePath(patternName: string, platform: string): string {
    const patternToTemplate: Record<string, string> = {
      'dashboard-grid': 'layout/dashboard-grid.hbs',
      'dashboard-sidebar': 'layout/dashboard-sidebar.hbs',
      'product-grid': 'ecommerce/product-grid.hbs',
      'product-detail': 'ecommerce/product-detail.hbs',
      'contact-form': 'form/contact-form.hbs',
      'registration-form': 'form/registration-form.hbs',
      'data-table': 'data-display/data-table.hbs',
      'card-list': 'layout/card-list.hbs',
      'header-navigation': 'navigation/header-nav.hbs',
      'breadcrumb-navigation': 'navigation/breadcrumb.hbs',
      'hero-section': 'content/hero-section.hbs',
      'feature-grid': 'content/feature-grid.hbs',
      'login-form': 'auth/login-form.hbs',
      'compliance-form': 'compliance/secure-form.hbs'
    };

    const templateFile = patternToTemplate[patternName] || 'basic/component.hbs';
    return `frontend/${platform}/components/${templateFile}`;
  }

  /**
   * Get business context-based template recommendations
   */
  private getBusinessContextRecommendations(context: TemplateSelectionContext): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    const businessPatterns = {
      ecommerce: {
        templates: [
          'frontend/react/pages/product-list.hbs',
          'frontend/react/components/product-card.hbs',
          'frontend/react/components/shopping-cart.hbs'
        ],
        patterns: [
          'Grid layout for product display',
          'Add to cart functionality',
          'Product filtering and search',
          'Responsive product grids'
        ],
        aiHints: [
          'Implement virtual scrolling for large product lists',
          'Add proper product image optimization',
          'Include add-to-cart animations',
          'Implement proper loading states'
        ],
        confidence: 0.9
      },
      saas: {
        templates: [
          'frontend/react/pages/dashboard.hbs',
          'frontend/react/components/data-table.hbs',
          'frontend/react/components/analytics-card.hbs'
        ],
        patterns: [
          'Dashboard layout with metrics',
          'Data visualization components',
          'User management interfaces',
          'Subscription management'
        ],
        aiHints: [
          'Use charts and graphs for data visualization',
          'Implement proper data fetching patterns',
          'Add real-time updates with WebSockets',
          'Include proper error handling for API calls'
        ],
        confidence: 0.85
      },
      government: {
        templates: [
          'frontend/react/pages/form-page.hbs',
          'frontend/react/components/document-viewer.hbs',
          'frontend/react/components/compliance-form.hbs'
        ],
        patterns: [
          'WCAG AAA compliance patterns',
          'Form validation and error handling',
          'Document management interfaces',
          'Multi-language support'
        ],
        aiHints: [
          'Implement strict accessibility compliance',
          'Add comprehensive form validation',
          'Include audit trail functionality',
          'Support multiple Norwegian locales'
        ],
        confidence: 0.95
      }
    };

    if (context.businessContext && businessPatterns[context.businessContext]) {
      const pattern = businessPatterns[context.businessContext];
      
      pattern.templates.forEach((templatePath: string) => {
        recommendations.push({
          templatePath,
          confidence: pattern.confidence,
          reasoning: [`Optimized for ${context.businessContext} business context`],
          aiHints: pattern.aiHints,
          patterns: pattern.patterns,
          estimatedComplexity: 'medium',
          estimatedTokens: 1200
        });
      });
    }

    return recommendations;
  }

  /**
   * Get platform-specific recommendations
   */
  private getPlatformRecommendations(context: TemplateSelectionContext): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    const platformPatterns = {
      react: {
        templates: ['frontend/react/components/', 'frontend/react/pages/'],
        patterns: ['React hooks patterns', 'Component composition', 'State management'],
        confidence: 0.9
      },
      vue: {
        templates: ['frontend/vue/components/', 'frontend/vue/pages/'],
        patterns: ['Composition API', 'Reactive patterns', 'Vue 3 features'],
        confidence: 0.9
      },
      angular: {
        templates: ['frontend/angular/components/', 'frontend/angular/pages/'],
        patterns: ['Standalone components', 'Dependency injection', 'RxJS patterns'],
        confidence: 0.85
      },
      electron: {
        templates: ['platforms/electron/main/', 'platforms/electron/renderer/'],
        patterns: ['IPC communication', 'Window management', 'Security patterns'],
        confidence: 0.8
      },
      'react-native': {
        templates: ['platforms/react-native/components/', 'platforms/react-native/screens/'],
        patterns: ['Native components', 'Platform-specific code', 'Navigation patterns'],
        confidence: 0.8
      }
    };

    const pattern = platformPatterns[context.platform];
    if (pattern) {
      pattern.templates.forEach((templatePath: string) => {
        recommendations.push({
          templatePath: `${templatePath}component.hbs`,
          confidence: pattern.confidence,
          reasoning: [`Optimized for ${context.platform} platform`],
          aiHints: [`Use ${context.platform}-specific best practices`],
          patterns: pattern.patterns,
          estimatedComplexity: 'medium',
          estimatedTokens: 1000
        });
      });
    }

    return recommendations;
  }

  /**
   * Get complexity-based recommendations using MCP data
   */
  private async getComplexityRecommendations(
    context: TemplateSelectionContext, 
    mcpData: any
  ): Promise<TemplateRecommendation[]> {
    const recommendations: TemplateRecommendation[] = [];
    
    let complexity = context.complexity;
    let estimatedTokens = 1200;

    // Use MCP data if available
    if (mcpData?.ai?.generation) {
      complexity = mcpData.ai.generation.complexity;
      estimatedTokens = mcpData.ai.generation.estimatedTokens;
    }

    const complexityPatterns = {
      simple: {
        templates: ['basic/button.hbs', 'basic/input.hbs', 'basic/text.hbs'],
        confidence: 0.95,
        tokens: 800
      },
      medium: {
        templates: ['composite/card.hbs', 'form/form-field.hbs', 'layout/container.hbs'],
        confidence: 0.85,
        tokens: 1200
      },
      complex: {
        templates: ['data-display/table.hbs', 'specialized/editor.hbs', 'composite/modal.hbs'],
        confidence: 0.75,
        tokens: 2400
      }
    };

    if (complexity && complexityPatterns[complexity]) {
      const pattern = complexityPatterns[complexity];
      
      pattern.templates.forEach(templatePath => {
        recommendations.push({
          templatePath: `frontend/${context.platform}/components/${templatePath}`,
          confidence: pattern.confidence,
          reasoning: [`Matches ${complexity} complexity level`],
          aiHints: [`Optimized for ${complexity} components`],
          patterns: [`${complexity} component patterns`],
          estimatedComplexity: complexity,
          estimatedTokens: pattern.tokens
        });
      });
    }

    return recommendations;
  }

  /**
   * Get feature-based recommendations
   */
  private getFeatureRecommendations(context: TemplateSelectionContext): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    if (!context.features) return recommendations;

    const featureTemplates = {
      'form-validation': {
        templates: ['form/validated-form.hbs', 'form/form-field.hbs'],
        confidence: 0.9
      },
      'data-table': {
        templates: ['data-display/table.hbs', 'data-display/data-grid.hbs'],
        confidence: 0.95
      },
      'authentication': {
        templates: ['form/login-form.hbs', 'form/signup-form.hbs'],
        confidence: 0.9
      },
      'dashboard': {
        templates: ['layout/dashboard.hbs', 'data-display/metric-card.hbs'],
        confidence: 0.85
      },
      'navigation': {
        templates: ['navigation/navbar.hbs', 'navigation/sidebar.hbs'],
        confidence: 0.9
      }
    };

    context.features.forEach(feature => {
      if (featureTemplates[feature]) {
        const featureTemplate = featureTemplates[feature];
        
        featureTemplate.templates.forEach((templatePath: string) => {
          recommendations.push({
            templatePath: `frontend/${context.platform}/components/${templatePath}`,
            confidence: featureTemplate.confidence,
            reasoning: [`Includes ${feature} functionality`],
            aiHints: [`Implement ${feature} best practices`],
            patterns: [`${feature} patterns`],
            estimatedComplexity: 'medium',
            estimatedTokens: 1200
          });
        });
      }
    });

    return recommendations;
  }

  /**
   * Get Norwegian compliance recommendations
   */
  private getComplianceRecommendations(context: TemplateSelectionContext): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    if (context.nsmClassification && context.nsmClassification !== 'OPEN') {
      recommendations.push({
        templatePath: `frontend/${context.platform}/components/compliance/secure-component.hbs`,
        confidence: 0.95,
        reasoning: [`Includes ${context.nsmClassification} security patterns`],
        aiHints: [
          'Implement proper security patterns',
          'Add audit trail functionality',
          'Include data classification handling'
        ],
        patterns: [
          'NSM security compliance',
          'GDPR data handling',
          'Audit trail patterns'
        ],
        estimatedComplexity: 'complex',
        estimatedTokens: 2000
      });
    }

    if (context.accessibilityLevel === 'AAA') {
      recommendations.push({
        templatePath: `frontend/${context.platform}/components/accessibility/wcag-aaa-component.hbs`,
        confidence: 0.9,
        reasoning: ['Includes WCAG AAA compliance patterns'],
        aiHints: [
          'Implement comprehensive accessibility features',
          'Add screen reader optimizations',
          'Include keyboard navigation patterns'
        ],
        patterns: [
          'WCAG AAA compliance',
          'Screen reader optimization',
          'Keyboard navigation'
        ],
        estimatedComplexity: 'medium',
        estimatedTokens: 1500
      });
    }

    return recommendations;
  }

  /**
   * Get fallback recommendation when no specific matches are found
   */
  private getFallbackRecommendation(context: TemplateSelectionContext): TemplateRecommendation {
    return {
      templatePath: `frontend/${context.platform}/components/basic/component.hbs`,
      confidence: 0.5,
      reasoning: ['Default fallback template'],
      aiHints: [
        'Use semantic UI System components',
        'Implement proper TypeScript interfaces',
        'Add comprehensive error handling'
      ],
      patterns: [
        'Basic component structure',
        'TypeScript best practices',
        'Accessibility basics'
      ],
      estimatedComplexity: 'medium',
      estimatedTokens: 1000
    };
  }

  /**
   * Analyze user input to determine business context automatically
   */
  analyzeBusinessContext(input: string): string | null {
    const patterns = {
      ecommerce: ['shop', 'product', 'cart', 'checkout', 'payment', 'store', 'inventory'],
      saas: ['dashboard', 'analytics', 'subscription', 'billing', 'metrics', 'user management'],
      government: ['compliance', 'regulation', 'audit', 'secure', 'classification', 'gdpr'],
      portfolio: ['showcase', 'gallery', 'projects', 'work', 'portfolio'],
      blog: ['article', 'post', 'content', 'publishing', 'cms'],
      corporate: ['enterprise', 'business', 'professional', 'company']
    };

    const inputLower = input.toLowerCase();
    
    for (const [context, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return context;
      }
    }

    return null;
  }

  /**
   * Estimate complexity from component name or description
   */
  estimateComplexity(input: string): 'simple' | 'medium' | 'complex' {
    const inputLower = input.toLowerCase();
    
    const simplePatterns = ['button', 'input', 'text', 'icon', 'badge', 'link'];
    const complexPatterns = ['table', 'grid', 'editor', 'calendar', 'chart', 'carousel'];
    
    if (simplePatterns.some(pattern => inputLower.includes(pattern))) {
      return 'simple';
    }
    
    if (complexPatterns.some(pattern => inputLower.includes(pattern))) {
      return 'complex';
    }
    
    return 'medium';
  }
}

// Singleton instance
export const templateSelector = new TemplateSelector();
/**
 * AI Pattern Mapper - Keyword to Component Pattern Mapping
 * 
 * Maps user input keywords to semantic UI component patterns for intelligent template selection.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';

export interface ComponentPattern {
  name: string;
  description: string;
  components: string[];
  layout: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTokens: number;
  aiHints: string[];
  examples: string[];
  businessContexts: string[];
}

export interface PatternMatch {
  pattern: ComponentPattern;
  confidence: number;
  matchedKeywords: string[];
  reasoning: string[];
}

export class PatternMapper {
  private patterns: Map<string, ComponentPattern> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * Map keywords to component patterns
   */
  mapKeywordsToPatterns(input: string, businessContext?: string): PatternMatch[] {
    const keywords = this.extractKeywords(input.toLowerCase());
    const matches: PatternMatch[] = [];

    for (const [patternName, pattern] of this.patterns) {
      const matchedKeywords = [];
      let confidence = 0;

      // Check for direct keyword matches
      for (const keyword of keywords) {
        if (patternName.includes(keyword) || pattern.description.toLowerCase().includes(keyword)) {
          matchedKeywords.push(keyword);
          confidence += 0.3;
        }

        // Check component matches
        for (const component of pattern.components) {
          if (component.toLowerCase().includes(keyword)) {
            matchedKeywords.push(keyword);
            confidence += 0.2;
          }
        }
      }

      // Business context boost
      if (businessContext && pattern.businessContexts.includes(businessContext)) {
        confidence += 0.2;
      }

      // Add pattern if there's a match
      if (matchedKeywords.length > 0) {
        matches.push({
          pattern,
          confidence: Math.min(confidence, 1.0),
          matchedKeywords,
          reasoning: this.generateReasoning(pattern, matchedKeywords, businessContext)
        });
      }
    }

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get pattern by name
   */
  getPattern(name: string): ComponentPattern | null {
    return this.patterns.get(name) || null;
  }

  /**
   * Get all available patterns
   */
  getAllPatterns(): ComponentPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get patterns by business context
   */
  getPatternsByBusinessContext(businessContext: string): ComponentPattern[] {
    return Array.from(this.patterns.values()).filter(pattern =>
      pattern.businessContexts.includes(businessContext)
    );
  }

  /**
   * Initialize component patterns
   */
  private initializePatterns(): void {
    const patterns: ComponentPattern[] = [
      // Dashboard Patterns
      {
        name: 'dashboard-grid',
        description: 'Grid layout with metric cards and data visualization',
        components: ['Container', 'Grid', 'Card', 'Text', 'Chart'],
        layout: 'Grid',
        complexity: 'complex',
        estimatedTokens: 2000,
        aiHints: [
          'Use Grid component with responsive breakpoints',
          'Implement Card components for metrics display',
          'Add loading states for data fetching',
          'Include proper error handling for API calls'
        ],
        examples: [
          'Analytics dashboard with KPI cards',
          'Admin panel with statistics',
          'Business metrics overview'
        ],
        businessContexts: ['saas', 'corporate', 'analytics']
      },
      {
        name: 'dashboard-sidebar',
        description: 'Dashboard layout with sidebar navigation and main content area',
        components: ['Container', 'Stack', 'Navigation', 'Main', 'Sidebar'],
        layout: 'Stack',
        complexity: 'complex',
        estimatedTokens: 1800,
        aiHints: [
          'Use Stack for horizontal layout',
          'Implement collapsible sidebar',
          'Add proper navigation patterns',
          'Include responsive mobile navigation'
        ],
        examples: [
          'Admin dashboard with sidebar',
          'User portal with navigation',
          'Management interface'
        ],
        businessContexts: ['saas', 'corporate', 'government']
      },

      // E-commerce Patterns
      {
        name: 'product-grid',
        description: 'Grid layout for displaying products with cards',
        components: ['Container', 'Grid', 'Card', 'Image', 'Text', 'Button'],
        layout: 'Grid',
        complexity: 'medium',
        estimatedTokens: 1500,
        aiHints: [
          'Use responsive Grid with auto-fit columns',
          'Implement lazy loading for product images',
          'Add hover effects for better UX',
          'Include proper product information hierarchy'
        ],
        examples: [
          'Product catalog page',
          'E-commerce listing',
          'Marketplace grid'
        ],
        businessContexts: ['ecommerce', 'marketplace']
      },
      {
        name: 'product-detail',
        description: 'Detailed product view with image gallery and information',
        components: ['Container', 'Stack', 'Gallery', 'Card', 'Button', 'Text'],
        layout: 'Stack',
        complexity: 'complex',
        estimatedTokens: 2200,
        aiHints: [
          'Use Stack for layout organization',
          'Implement image gallery with thumbnails',
          'Add add-to-cart functionality',
          'Include product variant selection'
        ],
        examples: [
          'Product detail page',
          'Item showcase',
          'Product information display'
        ],
        businessContexts: ['ecommerce', 'marketplace']
      },

      // Form Patterns
      {
        name: 'contact-form',
        description: 'Contact form with validation and submission',
        components: ['Container', 'Card', 'Form', 'Input', 'Textarea', 'Button'],
        layout: 'Container',
        complexity: 'medium',
        estimatedTokens: 1200,
        aiHints: [
          'Use Form component with validation',
          'Implement proper error handling',
          'Add loading states for submission',
          'Include success/error feedback'
        ],
        examples: [
          'Contact us form',
          'Feedback form',
          'Inquiry form'
        ],
        businessContexts: ['corporate', 'portfolio', 'government']
      },
      {
        name: 'registration-form',
        description: 'Multi-step registration form with validation',
        components: ['Container', 'Card', 'Stepper', 'Form', 'Input', 'Button'],
        layout: 'Container',
        complexity: 'complex',
        estimatedTokens: 2500,
        aiHints: [
          'Use Stepper for multi-step flow',
          'Implement comprehensive validation',
          'Add progress indication',
          'Include form persistence'
        ],
        examples: [
          'User registration',
          'Account setup',
          'Onboarding flow'
        ],
        businessContexts: ['saas', 'ecommerce', 'government']
      },

      // Data Display Patterns
      {
        name: 'data-table',
        description: 'Data table with sorting, filtering, and pagination',
        components: ['Container', 'Table', 'Button', 'Input', 'Pagination'],
        layout: 'Container',
        complexity: 'complex',
        estimatedTokens: 2800,
        aiHints: [
          'Use Table component with advanced features',
          'Implement virtual scrolling for large datasets',
          'Add proper sorting and filtering',
          'Include export functionality'
        ],
        examples: [
          'User management table',
          'Data grid view',
          'Administrative listing'
        ],
        businessContexts: ['saas', 'corporate', 'government']
      },
      {
        name: 'card-list',
        description: 'List of cards with information display',
        components: ['Container', 'Stack', 'Card', 'Text', 'Button'],
        layout: 'Stack',
        complexity: 'medium',
        estimatedTokens: 1000,
        aiHints: [
          'Use Stack for vertical card layout',
          'Implement proper spacing between cards',
          'Add hover effects',
          'Include action buttons'
        ],
        examples: [
          'Article list',
          'News feed',
          'Content cards'
        ],
        businessContexts: ['blog', 'portfolio', 'corporate']
      },

      // Navigation Patterns
      {
        name: 'header-navigation',
        description: 'Header with navigation menu and branding',
        components: ['Container', 'Stack', 'Navigation', 'Logo', 'Button'],
        layout: 'Stack',
        complexity: 'medium',
        estimatedTokens: 1200,
        aiHints: [
          'Use Stack for horizontal layout',
          'Implement responsive navigation',
          'Add mobile menu functionality',
          'Include proper branding placement'
        ],
        examples: [
          'Website header',
          'App navigation bar',
          'Main navigation'
        ],
        businessContexts: ['corporate', 'portfolio', 'ecommerce']
      },
      {
        name: 'breadcrumb-navigation',
        description: 'Breadcrumb navigation for page hierarchy',
        components: ['Container', 'Breadcrumb', 'Link', 'Text'],
        layout: 'Container',
        complexity: 'simple',
        estimatedTokens: 600,
        aiHints: [
          'Use Breadcrumb component',
          'Implement proper link hierarchy',
          'Add current page indication',
          'Include proper ARIA labels'
        ],
        examples: [
          'Page breadcrumbs',
          'Navigation trail',
          'Hierarchy display'
        ],
        businessContexts: ['corporate', 'ecommerce', 'government']
      },

      // Content Patterns
      {
        name: 'hero-section',
        description: 'Hero section with headline, description, and call-to-action',
        components: ['Container', 'Stack', 'Text', 'Button', 'Image'],
        layout: 'Stack',
        complexity: 'medium',
        estimatedTokens: 1000,
        aiHints: [
          'Use Stack for vertical content layout',
          'Implement proper typography hierarchy',
          'Add compelling call-to-action',
          'Include background image support'
        ],
        examples: [
          'Landing page hero',
          'Homepage banner',
          'Feature highlight'
        ],
        businessContexts: ['corporate', 'startup', 'portfolio']
      },
      {
        name: 'feature-grid',
        description: 'Grid layout showcasing features or services',
        components: ['Container', 'Grid', 'Card', 'Icon', 'Text'],
        layout: 'Grid',
        complexity: 'medium',
        estimatedTokens: 1300,
        aiHints: [
          'Use Grid with equal-height cards',
          'Implement consistent card structure',
          'Add icons for visual appeal',
          'Include proper feature descriptions'
        ],
        examples: [
          'Features showcase',
          'Services grid',
          'Benefits display'
        ],
        businessContexts: ['corporate', 'startup', 'saas']
      },

      // Authentication Patterns
      {
        name: 'login-form',
        description: 'Login form with authentication features',
        components: ['Container', 'Card', 'Form', 'Input', 'Button', 'Link'],
        layout: 'Container',
        complexity: 'medium',
        estimatedTokens: 1100,
        aiHints: [
          'Use Form with proper validation',
          'Implement password visibility toggle',
          'Add remember me functionality',
          'Include social login options'
        ],
        examples: [
          'User login page',
          'Authentication form',
          'Sign in interface'
        ],
        businessContexts: ['saas', 'ecommerce', 'government']
      },

      // Norwegian Government Patterns
      {
        name: 'compliance-form',
        description: 'Government compliance form with NSM security features',
        components: ['Container', 'Card', 'Form', 'Input', 'Select', 'Button', 'Alert'],
        layout: 'Container',
        complexity: 'complex',
        estimatedTokens: 2000,
        aiHints: [
          'Implement WCAG AAA compliance',
          'Add NSM security classifications',
          'Include comprehensive validation',
          'Add audit trail functionality'
        ],
        examples: [
          'Government application form',
          'Compliance reporting',
          'Official document submission'
        ],
        businessContexts: ['government', 'compliance']
      }
    ];

    // Add patterns to map
    patterns.forEach(pattern => {
      this.patterns.set(pattern.name, pattern);
    });

    consola.debug(`Initialized ${patterns.length} component patterns`);
  }

  /**
   * Extract keywords from input text
   */
  private extractKeywords(input: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  /**
   * Generate reasoning for pattern match
   */
  private generateReasoning(
    pattern: ComponentPattern, 
    matchedKeywords: string[], 
    businessContext?: string
  ): string[] {
    const reasoning = [];

    if (matchedKeywords.length > 0) {
      reasoning.push(`Matched keywords: ${matchedKeywords.join(', ')}`);
    }

    if (businessContext && pattern.businessContexts.includes(businessContext)) {
      reasoning.push(`Optimized for ${businessContext} business context`);
    }

    reasoning.push(`Uses ${pattern.components.join(', ')} components`);
    reasoning.push(`${pattern.complexity} complexity with ${pattern.estimatedTokens} estimated tokens`);

    return reasoning;
  }
}

// Singleton instance
export const patternMapper = new PatternMapper();
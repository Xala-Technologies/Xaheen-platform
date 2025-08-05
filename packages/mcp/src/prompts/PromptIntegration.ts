/**
 * Prompt Integration for MCP Tools
 * Demonstrates how to use enhanced prompts with our practical MCP tools
 */

import { practicalToolPrompts } from './PracticalToolPrompts.js';
import { CoreToolHandlers } from '../handlers/CoreToolHandlers.js';

export interface PromptIntegrationConfig {
  enableEnhancedPrompts: boolean;
  defaultDesignStyle: string;
  defaultAccessibilityLevel: string;
  defaultPlatform: string;
}

export class PromptIntegration {
  private config: PromptIntegrationConfig;
  private handlers: CoreToolHandlers;

  constructor(handlers: CoreToolHandlers, config: Partial<PromptIntegrationConfig> = {}) {
    this.handlers = handlers;
    this.config = {
      enableEnhancedPrompts: true,
      defaultDesignStyle: 'modern',
      defaultAccessibilityLevel: 'WCAG 2.1 AA',
      defaultPlatform: 'react',
      ...config
    };
  }

  /**
   * Get enhanced prompt for a specific tool
   */
  getEnhancedPrompt(toolName: string, args: any): any {
    if (!this.config.enableEnhancedPrompts) {
      return null;
    }

    const promptTemplate = practicalToolPrompts[toolName];
    if (!promptTemplate) {
      console.warn(`No enhanced prompt found for tool: ${toolName}`);
      return null;
    }

    try {
      return promptTemplate.handler(args);
    } catch (error) {
      console.error(`Error generating enhanced prompt for ${toolName}:`, error);
      return null;
    }
  }

  /**
   * Apply prompt enhancements to tool arguments
   */
  enhanceToolArgs(toolName: string, args: any): any {
    const enhancedArgs = { ...args };

    // Apply default values based on configuration
    if (!enhancedArgs.platform) {
      enhancedArgs.platform = this.config.defaultPlatform;
    }

    if (!enhancedArgs.designStyle) {
      enhancedArgs.designStyle = this.config.defaultDesignStyle;
    }

    if (!enhancedArgs.accessibility) {
      enhancedArgs.accessibility = this.config.defaultAccessibilityLevel;
    }

    // Tool-specific enhancements
    switch (toolName) {
      case 'get-components-enhanced':
        enhancedArgs.useCase = enhancedArgs.useCase || 'general';
        break;
      
      case 'generate-component-enhanced':
        enhancedArgs.features = enhancedArgs.features || ['typescript', 'accessibility', 'responsive'];
        break;
      
      case 'generate-page-enhanced':
        enhancedArgs.layout = enhancedArgs.layout || 'sidebar';
        enhancedArgs.dataRequirements = enhancedArgs.dataRequirements || 'mock data with TypeScript interfaces';
        break;
      
      case 'compliance-validation-enhanced':
        enhancedArgs.strictMode = enhancedArgs.strictMode !== undefined ? enhancedArgs.strictMode : false;
        break;
      
      case 'code-analysis-enhanced':
        enhancedArgs.detailLevel = enhancedArgs.detailLevel || 'comprehensive';
        break;
    }

    return enhancedArgs;
  }

  /**
   * Generate contextual recommendations based on tool and results
   */
  generateContextualRecommendations(toolName: string, results: any, args: any): string[] {
    const recommendations: string[] = [];

    switch (toolName) {
      case 'get-components-enhanced':
        recommendations.push(
          `Consider using ${args.platform} best practices for component integration`,
          `Ensure proper TypeScript types for better development experience`,
          `Review accessibility features for ${this.config.defaultAccessibilityLevel} compliance`
        );
        break;
      
      case 'generate-component-enhanced':
        recommendations.push(
          `Test the generated ${args.name} component across different screen sizes`,
          `Implement proper error boundaries and loading states`,
          `Add comprehensive documentation and usage examples`
        );
        break;
      
      case 'generate-page-enhanced':
        recommendations.push(
          `Optimize page performance with code splitting and lazy loading`,
          `Implement proper SEO meta tags and structured data`,
          `Add comprehensive error handling and user feedback`
        );
        break;
      
      case 'compliance-validation-enhanced':
        recommendations.push(
          `Address all compliance violations before production deployment`,
          `Implement regular compliance monitoring and auditing`,
          `Document compliance measures for audit purposes`
        );
        break;
      
      case 'code-analysis-enhanced':
        recommendations.push(
          `Prioritize fixing high-severity issues first`,
          `Implement automated testing for identified problem areas`,
          `Set up continuous monitoring for code quality metrics`
        );
        break;
    }

    return recommendations;
  }

  /**
   * Get prompt usage examples for documentation
   */
  getPromptUsageExamples(): Record<string, any> {
    return {
      'get-components-enhanced': {
        description: 'Retrieve UI components with enhanced analysis',
        example: {
          componentName: 'Button',
          platform: 'react',
          category: 'form',
          useCase: 'form submission',
          designStyle: 'modern'
        }
      },
      'generate-component-enhanced': {
        description: 'Generate sophisticated custom components',
        example: {
          componentName: 'DataTable',
          platform: 'react',
          description: 'Advanced data table with sorting and filtering',
          baseComponents: 'Table,Button,Input',
          features: 'sorting,filtering,pagination',
          designStyle: 'enterprise',
          accessibility: 'WCAG 2.1 AA'
        }
      },
      'generate-page-enhanced': {
        description: 'Create complete pages with best practices',
        example: {
          pageName: 'UserDashboard',
          pageType: 'dashboard',
          platform: 'nextjs',
          layout: 'sidebar',
          features: 'charts,tables,notifications',
          dataRequirements: 'user analytics data'
        }
      },
      'compliance-validation-enhanced': {
        description: 'Comprehensive compliance validation',
        example: {
          code: 'const UserForm = () => { /* component code */ }',
          complianceType: 'norwegian',
          platform: 'react',
          strictMode: true,
          context: 'user data collection'
        }
      },
      'code-analysis-enhanced': {
        description: 'Deep code analysis with insights',
        example: {
          code: 'const Component = () => { /* code to analyze */ }',
          platform: 'react',
          analysisType: 'performance',
          context: 'production application'
        }
      }
    };
  }
}

export default PromptIntegration;

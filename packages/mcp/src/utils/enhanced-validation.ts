/**
 * Enhanced Validation System with better error messages
 * Provides detailed validation feedback similar to shadcn-ui approach
 */

import { z } from 'zod';

// Enhanced error messages for better UX
const errorMessages = {
  INVALID_COMPONENT_NAME: 'Component name must be a valid PascalCase identifier (e.g., "UserProfile", "DataTable")',
  INVALID_PLATFORM: 'Platform must be one of: react, nextjs, vue, angular, svelte, electron, react-native',
  INVALID_CATEGORY: 'Category must be one of: components, data-components, theme-components, layouts, providers, patterns, tools',
  MISSING_REQUIRED_FIELD: (field: string) => `Required field "${field}" is missing`,
  INVALID_PRESET_TYPE: 'Preset type must be one of: basic-form, data-table, navigation-menu, dashboard-layout, modal-dialog',
  INVALID_THEME: 'Theme must be one of: enterprise, finance, healthcare, education, ecommerce, productivity',
  COMPONENT_NAME_TOO_SHORT: 'Component name must be at least 2 characters long',
  COMPONENT_NAME_TOO_LONG: 'Component name must be less than 50 characters long',
  INVALID_ACCESSIBILITY_LEVEL: 'Accessibility level must be either "AA" or "AAA"',
  INVALID_VARIANT: 'Variant must be one of: default, outline, ghost, destructive, secondary'
};

// Custom Zod schemas with enhanced error messages
export const enhancedComponentNameSchema = z
  .string()
  .min(2, errorMessages.COMPONENT_NAME_TOO_SHORT)
  .max(50, errorMessages.COMPONENT_NAME_TOO_LONG)
  .regex(/^[A-Z][a-zA-Z0-9]*$/, errorMessages.INVALID_COMPONENT_NAME);

export const enhancedPlatformSchema = z
  .enum(['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'])
  .refine(val => val !== undefined, { message: errorMessages.INVALID_PLATFORM });

export const enhancedCategorySchema = z
  .enum([
    'components',
    'data-components', 
    'theme-components',
    'layouts',
    'providers',
    'patterns',
    'tools',
    // Legacy categories for backwards compatibility
    'navigation',
    'form',
    'data-display',
    'feedback',
    'interactive',
    'specialized',
    'page-template'
  ])
  .refine(val => val !== undefined, { message: errorMessages.INVALID_CATEGORY });

export const enhancedPresetTypeSchema = z
  .enum(['basic-form', 'data-table', 'navigation-menu', 'dashboard-layout', 'modal-dialog'])
  .refine(val => val !== undefined, { message: errorMessages.INVALID_PRESET_TYPE });

// Validation result interface
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
    suggestions?: string[];
  }>;
  warnings?: Array<{
    field: string;
    message: string;
    suggestion: string;
  }>;
}

// Enhanced validation class
export class EnhancedValidator {
  /**
   * Validate component configuration with detailed error reporting
   */
  static validateComponentConfig(config: any): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    try {
      // Validate component name
      if (!config.name) {
        errors.push({
          field: 'name',
          message: errorMessages.MISSING_REQUIRED_FIELD('name'),
          code: 'MISSING_NAME',
          suggestions: ['Provide a component name like "UserProfile" or "DataTable"']
        });
      } else {
        try {
          enhancedComponentNameSchema.parse(config.name);
        } catch (e) {
          if (e instanceof z.ZodError) {
            errors.push({
              field: 'name',
              message: e.errors[0]?.message || errorMessages.INVALID_COMPONENT_NAME,
              code: 'INVALID_NAME',
              suggestions: [
                'Use PascalCase (e.g., "UserProfile", not "userProfile")',
                'Start with a capital letter',
                'Use only letters and numbers',
                'Keep it between 2-50 characters'
              ]
            });
          }
        }
      }

      // Validate platform
      if (!config.platform) {
        errors.push({
          field: 'platform',
          message: errorMessages.MISSING_REQUIRED_FIELD('platform'),
          code: 'MISSING_PLATFORM',
          suggestions: ['Choose from: react, nextjs, vue, angular, svelte, electron, react-native']
        });
      } else {
        try {
          enhancedPlatformSchema.parse(config.platform);
        } catch (e) {
          errors.push({
            field: 'platform',
            message: errorMessages.INVALID_PLATFORM,
            code: 'INVALID_PLATFORM',
            suggestions: ['Available platforms: react, nextjs, vue, angular, svelte, electron, react-native']
          });
        }
      }

      // Validate category
      if (!config.category) {
        errors.push({
          field: 'category',
          message: errorMessages.MISSING_REQUIRED_FIELD('category'),
          code: 'MISSING_CATEGORY',
          suggestions: ['Choose from: components, data-components, layouts, navigation, form, etc.']
        });
      } else {
        try {
          enhancedCategorySchema.parse(config.category);
        } catch (e) {
          errors.push({
            field: 'category',
            message: errorMessages.INVALID_CATEGORY,
            code: 'INVALID_CATEGORY',
            suggestions: ['Available categories: components, data-components, theme-components, layouts, providers, patterns, tools']
          });
        }
      }

      // Validate theme (if provided)
      if (config.theme) {
        const validThemes = ['enterprise', 'finance', 'healthcare', 'education', 'ecommerce', 'productivity'];
        if (!validThemes.includes(config.theme)) {
          errors.push({
            field: 'theme',
            message: errorMessages.INVALID_THEME,
            code: 'INVALID_THEME',
            suggestions: validThemes.map(theme => `"${theme}"`)
          });
        }
      }

      // Add warnings for potentially problematic configurations
      if (config.platform === 'react-native' && config.category === 'layouts') {
        warnings.push({
          field: 'category',
          message: 'Layout components may have limited functionality on React Native',
          suggestion: 'Consider using "components" category for better React Native support'
        });
      }

      if (config.accessibility?.level === 'AA' && config.theme === 'finance') {
        warnings.push({
          field: 'accessibility.level',
          message: 'Financial applications typically require WCAG AAA compliance',
          suggestion: 'Consider setting accessibility.level to "AAA" for financial themes'
        });
      }

      // Check for platform-specific feature conflicts
      if (config.platformConfig?.features) {
        this.validatePlatformFeatures(config.platform, config.platformConfig.features, warnings);
      }

      return {
        success: errors.length === 0,
        data: errors.length === 0 ? config : undefined,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'general',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          suggestions: ['Check your configuration format and try again']
        }]
      };
    }
  }

  /**
   * Validate quick generate parameters
   */
  static validateQuickGenerate(args: any): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate required fields
    if (!args.name) {
      errors.push({
        field: 'name',
        message: errorMessages.MISSING_REQUIRED_FIELD('name'),
        code: 'MISSING_NAME',
        suggestions: ['Provide a component name']
      });
    }

    if (!args.type) {
      errors.push({
        field: 'type',
        message: errorMessages.MISSING_REQUIRED_FIELD('type'),
        code: 'MISSING_TYPE',
        suggestions: ['Choose from: basic-form, data-table, navigation-menu, dashboard-layout, modal-dialog']
      });
    } else {
      try {
        enhancedPresetTypeSchema.parse(args.type);
      } catch (e) {
        errors.push({
          field: 'type',
          message: errorMessages.INVALID_PRESET_TYPE,
          code: 'INVALID_TYPE',
          suggestions: ['Available types: basic-form, data-table, navigation-menu, dashboard-layout, modal-dialog']
        });
      }
    }

    if (!args.platform) {
      errors.push({
        field: 'platform',
        message: errorMessages.MISSING_REQUIRED_FIELD('platform'),
        code: 'MISSING_PLATFORM',
        suggestions: ['Choose from: react, nextjs, vue, angular, svelte, electron, react-native']
      });
    }

    // Add specific warnings for type/platform combinations
    if (args.type === 'dashboard-layout' && args.platform === 'react-native') {
      warnings.push({
        field: 'type',
        message: 'Dashboard layouts may not be optimal for mobile platforms',
        suggestion: 'Consider using navigation-menu or basic-form for React Native'
      });
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? args : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Format validation error for user-friendly display
   */
  static formatValidationError(result: ValidationResult): string {
    if (result.success) {
      return '';
    }

    let message = '❌ **Validation Failed**\n\n';

    if (result.errors) {
      message += '**Errors:**\n';
      result.errors.forEach((error, index) => {
        message += `${index + 1}. **${error.field}**: ${error.message}\n`;
        if (error.suggestions && error.suggestions.length > 0) {
          message += `   💡 Suggestions:\n`;
          error.suggestions.forEach(suggestion => {
            message += `   • ${suggestion}\n`;
          });
        }
        message += '\n';
      });
    }

    if (result.warnings) {
      message += '⚠️ **Warnings:**\n';
      result.warnings.forEach((warning, index) => {
        message += `${index + 1}. **${warning.field}**: ${warning.message}\n`;
        message += `   💡 Suggestion: ${warning.suggestion}\n\n`;
      });
    }

    return message;
  }

  /**
   * Validate platform-specific features
   */
  private static validatePlatformFeatures(platform: string, features: any, warnings: ValidationResult['warnings'] = []) {
    const platformFeatureMap: Record<string, string[]> = {
      react: ['serverComponents'],
      nextjs: ['appRouter', 'pagesRouter', 'serverComponents'],
      vue: ['compositionApi', 'scriptSetup', 'pinia'],
      angular: ['standaloneComponents', 'signals', 'ngTranslate'],
      svelte: ['svelteKit', 'stores'],
      electron: ['mainProcess', 'rendererProcess', 'nativeApis'],
      'react-native': ['expo', 'navigation']
    };

    const validFeatures = platformFeatureMap[platform] || [];
    
    Object.keys(features).forEach(feature => {
      if (!validFeatures.includes(feature)) {
        warnings.push({
          field: `platformConfig.features.${feature}`,
          message: `Feature "${feature}" is not supported on ${platform}`,
          suggestion: `Available features for ${platform}: ${validFeatures.join(', ')}`
        });
      }
    });

    // Platform-specific validation
    if (platform === 'nextjs') {
      if (features.appRouter && features.pagesRouter) {
        warnings.push({
          field: 'platformConfig.features',
          message: 'Both App Router and Pages Router are enabled',
          suggestion: 'Choose either App Router (recommended) or Pages Router, not both'
        });
      }
    }
  }

  /**
   * Get validation suggestions based on common patterns
   */
  static getValidationSuggestions(config: any): string[] {
    const suggestions: string[] = [];

    // Component name suggestions
    if (config.name && typeof config.name === 'string') {
      if (config.name.includes('-') || config.name.includes('_')) {
        suggestions.push('Convert component name to PascalCase (e.g., "user-profile" → "UserProfile")');
      }
      if (config.name[0] === config.name[0].toLowerCase()) {
        suggestions.push('Component names should start with a capital letter');
      }
    }

    // Platform-specific suggestions
    if (config.platform === 'nextjs' && !config.platformConfig?.features?.appRouter) {
      suggestions.push('Consider enabling App Router for Next.js 13+ projects');
    }

    if (config.platform === 'vue' && !config.platformConfig?.features?.compositionApi) {
      suggestions.push('Vue 3 projects benefit from Composition API');
    }

    return suggestions;
  }
}

// Export enhanced schemas for use in main validation
export const EnhancedComponentConfigSchema = z.object({
  name: enhancedComponentNameSchema,
  platform: enhancedPlatformSchema.optional(),
  category: enhancedCategorySchema,
  // ... other fields remain the same but could be enhanced similarly
});
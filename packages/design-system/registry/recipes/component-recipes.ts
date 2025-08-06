/**
 * Universal Component Recipes
 * High-level component patterns that work across all platforms
 */

import { BaseComponentSpec, Platform } from '../core/component-specs';
import { UniversalTokens } from '../core/universal-tokens';
import { ComponentGenerator } from '../templates/component-generator';

// =============================================================================
// RECIPE TYPES
// =============================================================================

export interface ComponentRecipe {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'pattern' | 'template' | 'composition';
  readonly platforms: Platform[];
  readonly components: ComponentSpec[];
  readonly styling?: Record<string, any>;
  readonly metadata: RecipeMetadata;
}

export interface ComponentSpec {
  readonly componentId: string;
  readonly props?: Record<string, any>;
  readonly slots?: string[];
  readonly children?: ComponentSpec[];
}

export interface RecipeMetadata {
  readonly useCase: string;
  readonly complexity: 'simple' | 'medium' | 'complex';
  readonly accessibility: string[];
  readonly responsive: boolean;
  readonly darkMode: boolean;
}

// =============================================================================
// BUTTON RECIPES
// =============================================================================

export const ButtonRecipes: ComponentRecipe[] = [
  {
    id: 'primary-cta',
    name: 'Primary CTA Button',
    description: 'Primary call-to-action button with consistent styling across platforms',
    category: 'pattern',
    platforms: ['react', 'vue', 'angular', 'svelte', 'react-native', 'radix', 'headless-ui'],
    components: [
      {
        componentId: 'button',
        props: {
          variant: 'primary',
          size: 'lg',
          fullWidth: false
        }
      }
    ],
    styling: {
      minHeight: '48px',
      fontWeight: '600',
      borderRadius: '8px'
    },
    metadata: {
      useCase: 'Primary actions like submit, save, purchase',
      complexity: 'simple',
      accessibility: ['WCAG AA compliant', 'Keyboard accessible', 'Screen reader friendly'],
      responsive: true,
      darkMode: true
    }
  },

  {
    id: 'icon-button-group',
    name: 'Icon Button Group',
    description: 'Group of icon buttons for toolbars and action bars',
    category: 'composition',
    platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
    components: [
      {
        componentId: 'button',
        props: {
          variant: 'ghost',
          size: 'md'
        },
        slots: ['icon']
      }
    ],
    metadata: {
      useCase: 'Toolbars, action bars, compact interfaces',
      complexity: 'medium',
      accessibility: ['ARIA labels required', 'Tooltip recommended'],
      responsive: true,
      darkMode: true
    }
  },

  {
    id: 'loading-button',
    name: 'Loading State Button',
    description: 'Button with integrated loading spinner and state management',
    category: 'pattern',
    platforms: ['react', 'vue', 'angular', 'svelte', 'react-native', 'radix', 'headless-ui'],
    components: [
      {
        componentId: 'button',
        props: {
          loading: true,
          disabled: true
        }
      }
    ],
    metadata: {
      useCase: 'Form submissions, async operations',
      complexity: 'medium',
      accessibility: ['Loading state announced', 'Disabled during loading'],
      responsive: true,
      darkMode: true
    }
  }
];

// =============================================================================
// FORM RECIPES
// =============================================================================

export const FormRecipes: ComponentRecipe[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Standard contact form with validation',
    category: 'template',
    platforms: ['react', 'vue', 'angular', 'svelte', 'react-native'],
    components: [
      {
        componentId: 'input',
        props: {
          type: 'text',
          label: 'Name',
          required: true
        }
      },
      {
        componentId: 'input',
        props: {
          type: 'email',
          label: 'Email',
          required: true
        }
      },
      {
        componentId: 'textarea',
        props: {
          label: 'Message',
          required: true,
          rows: 4
        }
      },
      {
        componentId: 'button',
        props: {
          type: 'submit',
          variant: 'primary'
        }
      }
    ],
    metadata: {
      useCase: 'Contact forms, feedback forms',
      complexity: 'medium',
      accessibility: ['Form validation', 'Error announcements', 'Proper labeling'],
      responsive: true,
      darkMode: true
    }
  },

  {
    id: 'search-input',
    name: 'Search Input',
    description: 'Search input with icon and autocomplete',
    category: 'pattern',
    platforms: ['react', 'vue', 'angular', 'svelte', 'react-native'],
    components: [
      {
        componentId: 'input',
        props: {
          type: 'search',
          placeholder: 'Search...'
        },
        slots: ['prefix-icon']
      }
    ],
    metadata: {
      useCase: 'Search functionality, filtering',
      complexity: 'medium',
      accessibility: ['Search suggestions', 'Clear button', 'Keyboard navigation'],
      responsive: true,
      darkMode: true
    }
  }
];

// =============================================================================
// NAVIGATION RECIPES
// =============================================================================

export const NavigationRecipes: ComponentRecipe[] = [
  {
    id: 'app-header',
    name: 'Application Header',
    description: 'Main navigation header with logo, menu, and user actions',
    category: 'template',
    platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
    components: [
      {
        componentId: 'container',
        children: [
          {
            componentId: 'logo',
            props: {}
          },
          {
            componentId: 'navigation-menu',
            props: {
              orientation: 'horizontal'
            }
          },
          {
            componentId: 'button',
            props: {
              variant: 'ghost',
              size: 'sm'
            }
          }
        ]
      }
    ],
    metadata: {
      useCase: 'Application headers, main navigation',
      complexity: 'complex',
      accessibility: ['Skip links', 'Landmark navigation', 'Mobile responsive'],
      responsive: true,
      darkMode: true
    }
  },

  {
    id: 'sidebar-nav',
    name: 'Sidebar Navigation',
    description: 'Collapsible sidebar with hierarchical navigation',
    category: 'template',
    platforms: ['react', 'vue', 'angular', 'svelte', 'radix', 'headless-ui'],
    components: [
      {
        componentId: 'nav-sidebar',
        props: {
          collapsible: true
        }
      }
    ],
    metadata: {
      useCase: 'Dashboard layouts, admin panels',
      complexity: 'complex',
      accessibility: ['Focus management', 'Screen reader navigation', 'Keyboard shortcuts'],
      responsive: true,
      darkMode: true
    }
  }
];

// =============================================================================
// RECIPE REGISTRY
// =============================================================================

export const RECIPE_REGISTRY: Record<string, ComponentRecipe[]> = {
  buttons: ButtonRecipes,
  forms: FormRecipes,
  navigation: NavigationRecipes
};

// =============================================================================
// RECIPE GENERATOR
// =============================================================================

export class RecipeGenerator {
  /**
   * Generate components from a recipe for specific platform
   */
  static generateFromRecipe(
    recipe: ComponentRecipe,
    platform: Platform,
    options: {
      includeTests?: boolean;
      includeStories?: boolean;
      customization?: Record<string, any>;
    } = {}
  ) {
    const files: Array<{ path: string; content: string; type: string }> = [];
    
    // Generate each component in the recipe
    for (const componentSpec of recipe.components) {
      try {
        // This would use the actual component specs from COMPONENT_REGISTRY
        // For now, we'll create a simplified version
        const generatedFiles = this.generateComponentFromSpec(
          componentSpec,
          platform,
          options
        );
        files.push(...generatedFiles);
      } catch (error) {
        console.warn(`Failed to generate component ${componentSpec.componentId}:`, error);
      }
    }

    // Generate recipe composition file
    files.push(this.generateRecipeComposition(recipe, platform));

    return files;
  }

  /**
   * Generate all recipes for a platform
   */
  static generateAllRecipes(
    platform: Platform,
    options: {
      categories?: string[];
      includeTests?: boolean;
      includeStories?: boolean;
    } = {}
  ) {
    const { categories = Object.keys(RECIPE_REGISTRY) } = options;
    const allFiles: Array<{ path: string; content: string; type: string }> = [];

    for (const category of categories) {
      const recipes = RECIPE_REGISTRY[category] || [];
      
      for (const recipe of recipes) {
        if (recipe.platforms.includes(platform)) {
          const files = this.generateFromRecipe(recipe, platform, options);
          allFiles.push(...files);
        }
      }
    }

    return allFiles;
  }

  /**
   * Get available recipes for platform
   */
  static getAvailableRecipes(platform: Platform): ComponentRecipe[] {
    const allRecipes: ComponentRecipe[] = [];
    
    for (const recipes of Object.values(RECIPE_REGISTRY)) {
      allRecipes.push(
        ...recipes.filter(recipe => recipe.platforms.includes(platform))
      );
    }

    return allRecipes;
  }

  /**
   * Generate component from spec (simplified)
   */
  private static generateComponentFromSpec(
    componentSpec: ComponentSpec,
    platform: Platform,
    options: any
  ) {
    // This would integrate with the actual ComponentGenerator
    // For now, return a placeholder
    return [
      {
        path: `${componentSpec.componentId}.${platform === 'vue' ? 'vue' : 'tsx'}`,
        content: `// Generated ${componentSpec.componentId} for ${platform}`,
        type: 'component'
      }
    ];
  }

  /**
   * Generate recipe composition file
   */
  private static generateRecipeComposition(
    recipe: ComponentRecipe,
    platform: Platform
  ) {
    const content = `/**
 * ${recipe.name} - ${platform} Implementation
 * ${recipe.description}
 * 
 * Use Case: ${recipe.metadata.useCase}
 * Complexity: ${recipe.metadata.complexity}
 * Responsive: ${recipe.metadata.responsive}
 * Dark Mode: ${recipe.metadata.darkMode}
 */

// This would contain the composed component implementation
export const ${recipe.name.replace(/\s+/g, '')} = {
  // Recipe implementation
};`;

    return {
      path: `recipes/${recipe.id}.${platform === 'vue' ? 'vue' : 'tsx'}`,
      content,
      type: 'recipe'
    };
  }
}

// =============================================================================
// RECIPE UTILITIES
// =============================================================================

export const RecipeUtils = {
  /**
   * Find recipes by use case
   */
  findByUseCase: (useCase: string): ComponentRecipe[] => {
    const allRecipes = Object.values(RECIPE_REGISTRY).flat();
    return allRecipes.filter(recipe => 
      recipe.metadata.useCase.toLowerCase().includes(useCase.toLowerCase())
    );
  },

  /**
   * Find recipes by complexity
   */
  findByComplexity: (complexity: 'simple' | 'medium' | 'complex'): ComponentRecipe[] => {
    const allRecipes = Object.values(RECIPE_REGISTRY).flat();
    return allRecipes.filter(recipe => recipe.metadata.complexity === complexity);
  },

  /**
   * Get recipe by ID
   */
  getRecipe: (id: string): ComponentRecipe | undefined => {
    const allRecipes = Object.values(RECIPE_REGISTRY).flat();
    return allRecipes.find(recipe => recipe.id === id);
  },

  /**
   * Validate recipe compatibility with platform
   */
  isCompatible: (recipe: ComponentRecipe, platform: Platform): boolean => {
    return recipe.platforms.includes(platform);
  }
};

export default {
  RECIPE_REGISTRY,
  RecipeGenerator,
  RecipeUtils
};
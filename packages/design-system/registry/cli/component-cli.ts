/**
 * CLI Integration for Universal Component Generation
 * Integrates with the main Xaheen CLI system
 */

import { ComponentGenerator, PlatformTemplates } from '../templates/component-generator';
import { COMPONENT_REGISTRY, Platform } from '../core/component-specs';
import { RecipeGenerator, RECIPE_REGISTRY } from '../recipes/component-recipes';
import { UniversalComponentFactory } from '../universal-index';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CLI COMMAND TYPES
// =============================================================================

export interface GenerateComponentOptions {
  component: string;
  platform?: Platform | 'all';
  output?: string;
  includeTests?: boolean;
  includeStories?: boolean;
  includeDocs?: boolean;
  format?: 'files' | 'zip' | 'stdout';
  overwrite?: boolean;
}

export interface GenerateRecipeOptions {
  recipe: string;
  platform?: Platform | 'all';
  output?: string;
  customization?: Record<string, any>;
  format?: 'files' | 'zip' | 'stdout';
}

export interface ListOptions {
  type?: 'components' | 'platforms' | 'recipes';
  platform?: Platform;
  format?: 'table' | 'json' | 'list';
}

// =============================================================================
// CLI COMMAND HANDLERS
// =============================================================================

export class ComponentCLI {
  /**
   * Generate component(s) from specifications
   */
  static async generateComponent(options: GenerateComponentOptions): Promise<void> {
    const { component, platform = 'react', output = './components', format = 'files' } = options;

    // Validate component exists
    if (!(component in COMPONENT_REGISTRY)) {
      throw new Error(`Component '${component}' not found. Available: ${Object.keys(COMPONENT_REGISTRY).join(', ')}`);
    }

    const spec = COMPONENT_REGISTRY[component as keyof typeof COMPONENT_REGISTRY];
    
    // Generate for all platforms or specific platform
    if (platform === 'all') {
      console.log(`📦 Generating '${component}' component for ALL platforms...`);
      
      const allFiles = ComponentGenerator.generateForAllPlatforms(spec, {
        includeTests: options.includeTests,
        includeStories: options.includeStories,
        includeDocs: options.includeDocs
      });

      await this.outputFiles(allFiles, output, format, options.overwrite);
      
      console.log(`✅ Generated '${component}' for ${Object.keys(allFiles).length} platforms`);
    } else {
      // Validate platform
      if (!spec.platforms.includes(platform)) {
        throw new Error(`Platform '${platform}' not supported for '${component}'. Supported: ${spec.platforms.join(', ')}`);
      }

      console.log(`📦 Generating '${component}' component for ${platform}...`);
      
      const files = ComponentGenerator.generateComponent(spec, platform, {
        includeTests: options.includeTests,
        includeStories: options.includeStories,
        includeDocs: options.includeDocs
      });

      await this.outputFiles({ [platform]: files }, output, format, options.overwrite);
      
      console.log(`✅ Generated ${files.length} files for '${component}' (${platform})`);
    }
  }

  /**
   * Generate recipe/pattern
   */
  static async generateRecipe(options: GenerateRecipeOptions): Promise<void> {
    const { recipe, platform = 'react', output = './components' } = options;

    // Find recipe
    const allRecipes = Object.values(RECIPE_REGISTRY).flat();
    const recipeSpec = allRecipes.find(r => r.id === recipe);
    
    if (!recipeSpec) {
      throw new Error(`Recipe '${recipe}' not found. Available: ${allRecipes.map(r => r.id).join(', ')}`);
    }

    if (platform === 'all') {
      console.log(`🧩 Generating '${recipe}' recipe for ALL compatible platforms...`);
      
      const results: Record<string, any> = {};
      for (const p of recipeSpec.platforms) {
        try {
          const files = RecipeGenerator.generateFromRecipe(recipeSpec, p, options.customization);
          results[p] = files;
        } catch (error) {
          console.warn(`⚠️  Failed to generate for ${p}:`, error);
          results[p] = [];
        }
      }

      await this.outputFiles(results, output, options.format, true);
      console.log(`✅ Generated '${recipe}' recipe for ${recipeSpec.platforms.length} platforms`);
    } else {
      if (!recipeSpec.platforms.includes(platform)) {
        throw new Error(`Platform '${platform}' not supported for recipe '${recipe}'. Supported: ${recipeSpec.platforms.join(', ')}`);
      }

      console.log(`🧩 Generating '${recipe}' recipe for ${platform}...`);
      
      const files = RecipeGenerator.generateFromRecipe(recipeSpec, platform, options.customization);
      await this.outputFiles({ [platform]: files }, output, options.format, true);
      
      console.log(`✅ Generated ${files.length} files for '${recipe}' recipe`);
    }
  }

  /**
   * List available components, platforms, or recipes
   */
  static async list(options: ListOptions = {}): Promise<void> {
    const { type = 'components', platform, format = 'table' } = options;

    switch (type) {
      case 'components':
        await this.listComponents(platform, format);
        break;
      case 'platforms':
        await this.listPlatforms(format);
        break;
      case 'recipes':
        await this.listRecipes(platform, format);
        break;
    }
  }

  /**
   * Get component information
   */
  static async info(componentId: string): Promise<void> {
    if (!(componentId in COMPONENT_REGISTRY)) {
      throw new Error(`Component '${componentId}' not found`);
    }

    const spec = COMPONENT_REGISTRY[componentId as keyof typeof COMPONENT_REGISTRY];
    
    console.log(`\n🔍 ${spec.name} Component Information`);
    console.log('='.repeat(50));
    console.log(`Description: ${spec.description}`);
    console.log(`Category: ${spec.category}`);
    console.log(`Platforms: ${spec.platforms.join(', ')}`);
    console.log(`WCAG Level: ${spec.accessibility.wcagLevel}`);
    console.log(`Props: ${spec.props.length}`);
    console.log(`Variants: ${spec.variants?.length || 0}`);
    console.log(`NSM Classification: ${spec.nsmClassification}`);
    
    if (spec.props.length > 0) {
      console.log('\n📝 Props:');
      spec.props.forEach(prop => {
        console.log(`  • ${prop.name}: ${prop.type}${prop.required ? ' (required)' : ''}`);
        if (prop.description) console.log(`    ${prop.description}`);
      });
    }

    if (spec.variants && spec.variants.length > 0) {
      console.log('\n🎨 Variants:');
      spec.variants.forEach(variant => {
        console.log(`  • ${variant.name}: ${variant.description}`);
      });
    }
  }

  /**
   * Test platform compatibility
   */
  static async testPlatform(platform: Platform): Promise<void> {
    console.log(`🧪 Testing ${platform} platform compatibility...`);
    
    const factory = new UniversalComponentFactory(platform);
    const availableComponents = Object.keys(COMPONENT_REGISTRY).filter(id => 
      factory.isComponentAvailable(id as any)
    );

    console.log(`\n✅ Platform: ${platform}`);
    console.log(`📦 Compatible components: ${availableComponents.length}/${Object.keys(COMPONENT_REGISTRY).length}`);
    console.log(`🔧 Template available: ${platform in PlatformTemplates ? 'Yes' : 'No'}`);
    
    if (availableComponents.length > 0) {
      console.log('\n📋 Compatible components:');
      availableComponents.forEach(id => console.log(`  • ${id}`));
    }

    // Test actual generation
    try {
      const buttonSpec = COMPONENT_REGISTRY.button;
      const files = ComponentGenerator.generateComponent(buttonSpec, platform);
      console.log(`\n✅ Generation test: PASSED (${files.length} files)`);
    } catch (error) {
      console.log(`\n❌ Generation test: FAILED`);
      console.log(`Error: ${error}`);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private static async listComponents(platform?: Platform, format: string = 'table') {
    const components = Object.entries(COMPONENT_REGISTRY).map(([id, spec]) => ({
      id,
      name: spec.name,
      category: spec.category,
      platforms: platform ? (spec.platforms.includes(platform) ? '✅' : '❌') : spec.platforms.length,
      description: spec.description.substring(0, 50) + (spec.description.length > 50 ? '...' : '')
    }));

    if (format === 'json') {
      console.log(JSON.stringify(components, null, 2));
      return;
    }

    console.log('\n📦 Available Components:');
    console.log('='.repeat(80));
    console.table(components);
  }

  private static async listPlatforms(format: string = 'table') {
    const platforms = Object.keys(PlatformTemplates).map(platform => {
      const compatibleComponents = Object.values(COMPONENT_REGISTRY).filter(spec => 
        spec.platforms.includes(platform as Platform)
      ).length;

      return {
        platform,
        components: compatibleComponents,
        template: PlatformTemplates[platform as Platform] ? 'Available' : 'Missing',
        type: this.getPlatformType(platform as Platform)
      };
    });

    if (format === 'json') {
      console.log(JSON.stringify(platforms, null, 2));
      return;
    }

    console.log('\n🚀 Supported Platforms:');
    console.log('='.repeat(60));
    console.table(platforms);
  }

  private static async listRecipes(platform?: Platform, format: string = 'table') {
    const recipes = Object.values(RECIPE_REGISTRY).flat().map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      platforms: platform ? (recipe.platforms.includes(platform) ? '✅' : '❌') : recipe.platforms.length,
      complexity: recipe.metadata.complexity,
      useCase: recipe.metadata.useCase.substring(0, 40) + (recipe.metadata.useCase.length > 40 ? '...' : '')
    }));

    if (format === 'json') {
      console.log(JSON.stringify(recipes, null, 2));
      return;
    }

    console.log('\n🧩 Available Recipes:');
    console.log('='.repeat(80));
    console.table(recipes);
  }

  private static getPlatformType(platform: Platform): string {
    if (['react', 'vue', 'angular', 'svelte'].includes(platform)) return 'Frontend Framework';
    if (['react-native', 'expo'].includes(platform)) return 'Mobile';
    if (['electron', 'nextjs', 'nuxt', 'sveltekit'].includes(platform)) return 'Meta Framework';
    if (['radix', 'headless-ui'].includes(platform)) return 'UI Library';
    if (platform === 'vanilla') return 'Web Components';
    return 'Other';
  }

  private static async outputFiles(
    filesByPlatform: Record<string, Array<{ path: string; content: string; type: string }>>,
    output: string,
    format: string,
    overwrite: boolean = false
  ) {
    switch (format) {
      case 'stdout':
        // Output to console
        Object.entries(filesByPlatform).forEach(([platform, files]) => {
          console.log(`\n=== ${platform.toUpperCase()} ===`);
          files.forEach(file => {
            console.log(`\n--- ${file.path} ---`);
            console.log(file.content);
          });
        });
        break;
        
      case 'files':
        // Write to filesystem
        for (const [platform, files] of Object.entries(filesByPlatform)) {
          const platformDir = path.join(output, platform);
          
          // Create platform directory
          await fs.promises.mkdir(platformDir, { recursive: true });
          
          for (const file of files) {
            const filePath = path.join(platformDir, file.path);
            const fileDir = path.dirname(filePath);
            
            // Create file directory if needed
            await fs.promises.mkdir(fileDir, { recursive: true });
            
            // Check if file exists
            if (!overwrite && fs.existsSync(filePath)) {
              console.log(`⚠️  Skipping existing file: ${filePath}`);
              continue;
            }
            
            // Write file
            await fs.promises.writeFile(filePath, file.content, 'utf8');
            console.log(`📁 Created: ${filePath}`);
          }
        }
        break;
        
      case 'zip':
        // TODO: Implement ZIP output
        console.log('ZIP output not yet implemented');
        break;
    }
  }
}

// =============================================================================
// CLI COMMAND EXPORTS
// =============================================================================

export const cliCommands = {
  generate: ComponentCLI.generateComponent,
  recipe: ComponentCLI.generateRecipe,
  list: ComponentCLI.list,
  info: ComponentCLI.info,
  test: ComponentCLI.testPlatform
};

export default ComponentCLI;
/**
 * Template Mapper for CLI and MCP Server Alignment
 * Maps CLI templates to MCP server generation
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import type { ComponentConfig, SupportedPlatform } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface TemplateMapping {
  readonly cliPath: string;
  readonly category: string;
  readonly platforms: SupportedPlatform[];
  readonly variants?: string[];
}

export class TemplateMapper {
  private readonly cliTemplatesPath: string;
  private readonly templateMappings: Map<string, TemplateMapping>;

  constructor() {
    // Path to CLI templates
    this.cliTemplatesPath = join(__dirname, '../../../../cli/templates');
    this.templateMappings = new Map();
    this.initializeMappings();
  }

  private initializeMappings(): void {
    // Components (UI Components)
    const componentTemplates = [
      'navbar', 'modal', 'sidebar', 'header', 'form', 'card', 'dashboard'
    ];
    
    componentTemplates.forEach(name => {
      this.templateMappings.set(name, {
        cliPath: `components/${name}.hbs`,
        category: 'components',
        platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native']
      });
    });

    // Data Components
    const dataTemplates = [
      'data-table', 'virtual-list', 'command-palette', 'global-search'
    ];
    
    dataTemplates.forEach(name => {
      this.templateMappings.set(name, {
        cliPath: `components/${name}.hbs`,
        category: 'data-components',
        platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron']
      });
    });

    // Theme Components
    this.templateMappings.set('theme-switcher', {
      cliPath: 'components/theme-switcher.hbs',
      category: 'theme-components',
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron']
    });

    this.templateMappings.set('theme-selector', {
      cliPath: 'components/theme-selector.hbs',
      category: 'theme-components',
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron']
    });

    // Layout Components
    this.templateMappings.set('app-shell', {
      cliPath: 'layouts/app-shell.hbs',
      category: 'layouts',
      platforms: ['react', 'nextjs']
    });

    this.templateMappings.set('layout', {
      cliPath: 'components/layout.hbs',
      category: 'layouts',
      platforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron']
    });

    // Provider Components
    const providerTemplates = [
      'auth-provider', 'theme-provider', 'error-boundary', 'notification-provider',
      'token-provider', 'feature-flags'
    ];
    
    providerTemplates.forEach(name => {
      this.templateMappings.set(name, {
        cliPath: `providers/${name}.hbs`,
        category: 'providers',
        platforms: ['react', 'nextjs']
      });
    });

    // Pattern Components (React/Next.js only)
    this.templateMappings.set('render-props', {
      cliPath: 'patterns/render-props.hbs',
      category: 'patterns',
      platforms: ['react', 'nextjs']
    });

    this.templateMappings.set('hoc-collection', {
      cliPath: 'patterns/hoc-collection.hbs',
      category: 'patterns',
      platforms: ['react', 'nextjs']
    });

    this.templateMappings.set('component-factory', {
      cliPath: 'universal/component-factory.hbs',
      category: 'patterns',
      platforms: ['react', 'nextjs']
    });

    // Tool Components
    this.templateMappings.set('performance-monitor', {
      cliPath: 'tools/performance-monitor.hbs',
      category: 'tools',
      platforms: ['react', 'nextjs']
    });

    this.templateMappings.set('code-generator', {
      cliPath: 'tools/code-generator.hbs',
      category: 'tools',
      platforms: ['react', 'nextjs']
    });

    // Platform-specific templates
    this.initializePlatformSpecificMappings();
  }

  private initializePlatformSpecificMappings(): void {
    // Next.js specific
    this.templateMappings.set('app-router-layout', {
      cliPath: 'nextjs/app-router/layout.tsx.hbs',
      category: 'layouts',
      platforms: ['nextjs']
    });

    this.templateMappings.set('app-router-page', {
      cliPath: 'nextjs/app-router/page.tsx.hbs',
      category: 'layouts',
      platforms: ['nextjs']
    });

    // Vue specific
    this.templateMappings.set('vue-composable-theme', {
      cliPath: 'vue/composables/useTheme.ts.hbs',
      category: 'providers',
      platforms: ['vue']
    });

    // Angular specific
    this.templateMappings.set('angular-theme-service', {
      cliPath: 'angular/services/theme.service.ts.hbs',
      category: 'providers',
      platforms: ['angular']
    });

    // Svelte specific
    this.templateMappings.set('svelte-theme-store', {
      cliPath: 'svelte/stores/theme.ts.hbs',
      category: 'providers',
      platforms: ['svelte']
    });

    // Electron specific
    this.templateMappings.set('electron-main', {
      cliPath: 'electron/main/main.ts.hbs',
      category: 'tools',
      platforms: ['electron']
    });

    this.templateMappings.set('electron-preload', {
      cliPath: 'electron/preload/preload.ts.hbs',
      category: 'tools',
      platforms: ['electron']
    });

    // React Native specific
    this.templateMappings.set('rn-navigator', {
      cliPath: 'react-native/navigation/AppNavigator.tsx.hbs',
      category: 'layouts',
      platforms: ['react-native']
    });

    this.templateMappings.set('rn-home-screen', {
      cliPath: 'react-native/screens/HomeScreen.tsx.hbs',
      category: 'layouts',
      platforms: ['react-native']
    });
  }

  /**
   * Get CLI template for a component
   */
  getCliTemplate(componentName: string, platform: SupportedPlatform): string | null {
    const mapping = this.templateMappings.get(componentName);
    if (!mapping || !mapping.platforms.includes(platform)) {
      return null;
    }

    try {
      const templatePath = join(this.cliTemplatesPath, platform, mapping.cliPath);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      // Fallback to generic template if platform-specific not found
      try {
        const genericPath = join(this.cliTemplatesPath, 'react', mapping.cliPath);
        return readFileSync(genericPath, 'utf-8');
      } catch {
        return null;
      }
    }
  }

  /**
   * Generate component using CLI template
   */
  generateFromCliTemplate(config: ComponentConfig): string {
    const platform = config.platform || 'react';
    const componentName = config.name.toLowerCase().replace(/\s+/g, '-');
    
    // Get template content
    const templateContent = this.getCliTemplate(componentName, platform);
    if (!templateContent) {
      throw new Error(`No template found for ${componentName} on ${platform}`);
    }

    // Compile and render template
    const template = Handlebars.compile(templateContent);
    
    // Prepare template data
    const templateData = {
      name: config.name,
      componentName: this.toPascalCase(config.name),
      className: config.name.toLowerCase().replace(/\s+/g, '-'),
      variant: config.variant || 'default',
      size: config.size || 'md',
      theme: config.theme || 'enterprise',
      locale: config.locale || 'en',
      features: config.features,
      accessibility: config.accessibility,
      responsive: config.responsive,
      platform,
      // V5.0 architecture flags
      useSemanticUI: true,
      useTokens: true,
      useLocalization: true,
      zeroHTML: true,
      // Platform-specific flags
      isReact: platform === 'react' || platform === 'nextjs' || platform === 'electron',
      isNextJS: platform === 'nextjs',
      isVue: platform === 'vue',
      isAngular: platform === 'angular',
      isSvelte: platform === 'svelte',
      isElectron: platform === 'electron',
      isReactNative: platform === 'react-native'
    };

    return template(templateData);
  }

  /**
   * Get all available templates for a platform
   */
  getAvailableTemplates(platform: SupportedPlatform): string[] {
    const templates: string[] = [];
    
    this.templateMappings.forEach((mapping, name) => {
      if (mapping.platforms.includes(platform)) {
        templates.push(name);
      }
    });
    
    return templates;
  }

  /**
   * Get template count by platform
   */
  getTemplateCountByPlatform(): Record<SupportedPlatform, number> {
    const counts: Record<string, number> = {
      'react': 0,
      'nextjs': 0,
      'vue': 0,
      'angular': 0,
      'svelte': 0,
      'electron': 0,
      'react-native': 0
    };

    this.templateMappings.forEach((mapping) => {
      mapping.platforms.forEach(platform => {
        if (counts[platform] !== undefined) {
          counts[platform]++;
        }
      });
    });

    return counts as Record<SupportedPlatform, number>;
  }

  /**
   * Get total template count (131+ templates)
   */
  getTotalTemplateCount(): number {
    let total = 0;
    const counts = this.getTemplateCountByPlatform();
    
    Object.values(counts).forEach(count => {
      total += count;
    });
    
    return total;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Validate if template exists for component and platform
   */
  isTemplateAvailable(componentName: string, platform: SupportedPlatform): boolean {
    const mapping = this.templateMappings.get(componentName);
    return mapping ? mapping.platforms.includes(platform) : false;
  }

  /**
   * Get template category
   */
  getTemplateCategory(componentName: string): string | null {
    const mapping = this.templateMappings.get(componentName);
    return mapping ? mapping.category : null;
  }
}
/**
 * Component Retrieval Tools for Xaheen MCP Server
 * Inspired by shadcn-ui MCP server's focused approach to component access
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { templateCache, cacheUtils } from '../utils/template-cache.js';

// Component metadata interface
interface ComponentMetadata {
  name: string;
  platform: string;
  category: string;
  path: string;
  dependencies: string[];
  features: string[];
  description: string;
  examples?: string[];
  lastModified: Date;
}

// Component library browser interface
interface ComponentLibraryEntry {
  name: string;
  platforms: string[];
  category: string;
  description: string;
  templateCount: number;
  lastUpdated: Date;
}

export class ComponentRetrievalTools {
  private templateBasePath: string;
  private specificationPath: string;
  private componentCache: Map<string, ComponentMetadata> = new Map();
  
  constructor() {
    // These paths should match your actual template structure
    this.templateBasePath = path.resolve(process.cwd(), '../xaheen-cli/templates');
    this.specificationPath = path.resolve(__dirname, '../specifications/components');
  }

  /**
   * Get component source code from template library
   */
  async getComponentSource(args: {
    name: string;
    platform: string;
    variant?: string;
  }): Promise<{
    source: string;
    metadata: ComponentMetadata;
    relatedFiles: Array<{ path: string; content: string; type: string }>;
  }> {
    const { name, platform, variant = 'default' } = args;
    
    try {
      // Build template path based on platform and component name
      const templatePath = this.buildTemplatePath(name, platform, variant);
      
      // Check if template exists
      const exists = await this.fileExists(templatePath);
      if (!exists) {
        throw new Error(`Component template not found: ${name} for ${platform}`);
      }
      
      // Read main component source with caching
      const source = await cacheUtils.cacheTemplate(
        templatePath,
        () => fs.readFile(templatePath, 'utf-8')
      );
      
      // Get component metadata with caching
      const metadata = await cacheUtils.cacheMetadata(
        name,
        platform,
        () => this.getComponentMetadata(name, platform)
      );
      
      // Get related files (types, styles, tests, etc.)
      const relatedFiles = await this.getRelatedFiles(name, platform);
      
      return {
        source,
        metadata,
        relatedFiles
      };
    } catch (error) {
      throw new Error(`Failed to retrieve component source: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get component demo/example code
   */
  async getComponentDemo(args: {
    name: string;
    platform: string;
    demoType?: 'basic' | 'advanced' | 'interactive';
  }): Promise<{
    demo: string;
    description: string;
    props: Record<string, any>;
    imports: string[];
  }> {
    const { name, platform, demoType = 'basic' } = args;
    
    try {
      // Look for demo/example files
      const demoPath = this.buildDemoPath(name, platform, demoType);
      
      let demo = '';
      let description = '';
      let props = {};
      let imports: string[] = [];
      
      if (await this.fileExists(demoPath)) {
        demo = await fs.readFile(demoPath, 'utf-8');
      } else {
        // Generate basic demo from component template
        demo = await this.generateBasicDemo(name, platform);
      }
      
      // Extract metadata from specification if available
      const specPath = path.join(this.specificationPath, `${name.toLowerCase()}.spec.json`);
      if (await this.fileExists(specPath)) {
        const spec = JSON.parse(await fs.readFile(specPath, 'utf-8'));
        description = spec.description || `${name} component example`;
        props = spec.props || {};
        imports = spec.imports || [];
      }
      
      return {
        demo,
        description,
        props,
        imports
      };
    } catch (error) {
      throw new Error(`Failed to retrieve component demo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Browse component library with filtering and categorization
   */
  async browseComponentLibrary(args: {
    platform?: string;
    category?: string;
    search?: string;
    limit?: number;
  } = {}): Promise<{
    components: ComponentLibraryEntry[];
    total: number;
    categories: string[];
    platforms: string[];
  }> {
    const { platform, category, search, limit = 50 } = args;
    
    try {
      // Get all available components across all platforms
      const allComponents = await this.scanComponentLibrary();
      
      // Apply filters
      let filteredComponents = allComponents;
      
      if (platform) {
        filteredComponents = filteredComponents.filter(comp => 
          comp.platforms.includes(platform)
        );
      }
      
      if (category) {
        filteredComponents = filteredComponents.filter(comp => 
          comp.category === category
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredComponents = filteredComponents.filter(comp =>
          comp.name.toLowerCase().includes(searchLower) ||
          comp.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply limit
      const paginatedComponents = filteredComponents.slice(0, limit);
      
      // Get unique categories and platforms for filter options
      const categories = [...new Set(allComponents.map(comp => comp.category))];
      const platforms = [...new Set(allComponents.flatMap(comp => comp.platforms))];
      
      return {
        components: paginatedComponents,
        total: filteredComponents.length,
        categories: categories.sort(),
        platforms: platforms.sort()
      };
    } catch (error) {
      throw new Error(`Failed to browse component library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed component metadata including dependencies and features
   */
  async getComponentMetadata(name: string, platform: string): Promise<ComponentMetadata> {
    const cacheKey = `${name}-${platform}`;
    
    // Check cache first
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey)!;
    }
    
    try {
      const templatePath = this.buildTemplatePath(name, platform);
      const specPath = path.join(this.specificationPath, `${name.toLowerCase()}.spec.json`);
      
      let metadata: ComponentMetadata = {
        name,
        platform,
        category: 'components',
        path: templatePath,
        dependencies: [],
        features: [],
        description: `${name} component for ${platform}`,
        lastModified: new Date()
      };
      
      // Read specification if available
      if (await this.fileExists(specPath)) {
        const spec = JSON.parse(await fs.readFile(specPath, 'utf-8'));
        metadata = {
          ...metadata,
          category: spec.category || metadata.category,
          dependencies: spec.dependencies || [],
          features: spec.features || [],
          description: spec.description || metadata.description,
          examples: spec.examples || []
        };
      }
      
      // Get file stats for last modified date
      if (await this.fileExists(templatePath)) {
        const stats = await fs.stat(templatePath);
        metadata.lastModified = stats.mtime;
      }
      
      // Analyze template for additional metadata
      const additionalMetadata = await this.analyzeTemplate(templatePath);
      metadata.dependencies = [...new Set([...metadata.dependencies, ...additionalMetadata.dependencies])];
      metadata.features = [...new Set([...metadata.features, ...additionalMetadata.features])];
      
      // Cache the result
      this.componentCache.set(cacheKey, metadata);
      
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get component metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private buildTemplatePath(name: string, platform: string, variant: string = 'default'): string {
    // Map component names to actual template files
    const componentMap: Record<string, string> = {
      'navbar': 'navbar',
      'modal': 'modal', 
      'sidebar': 'sidebar',
      'header': 'header',
      'form': 'form',
      'card': 'card',
      'dashboard': 'dashboard',
      'data-table': 'data-table',
      'virtual-list': 'virtual-list',
      'command-palette': 'command-palette',
      'global-search': 'global-search',
      'theme-switcher': 'theme-switcher',
      'theme-selector': 'theme-selector',
      'app-shell': 'app-shell',
      'layout': 'layout'
    };
    
    const templateName = componentMap[name.toLowerCase()] || name.toLowerCase();
    const extension = this.getPlatformExtension(platform);
    
    return path.join(
      this.templateBasePath,
      platform,
      'components',
      `${templateName}.${extension}.hbs`
    );
  }

  private buildDemoPath(name: string, platform: string, demoType: string): string {
    const extension = this.getPlatformExtension(platform);
    return path.join(
      this.templateBasePath,
      platform,
      'examples',
      `${name.toLowerCase()}-${demoType}.${extension}`
    );
  }

  private getPlatformExtension(platform: string): string {
    const extensions: Record<string, string> = {
      react: 'tsx',
      nextjs: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      electron: 'tsx',
      'react-native': 'tsx'
    };
    return extensions[platform] || 'tsx';
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getRelatedFiles(name: string, platform: string): Promise<Array<{ path: string; content: string; type: string }>> {
    const relatedFiles: Array<{ path: string; content: string; type: string }> = [];
    
    // Look for related files (types, tests, styles, stories)
    const basePath = path.dirname(this.buildTemplatePath(name, platform));
    const patterns = [
      `${name.toLowerCase()}.types.ts.hbs`,
      `${name.toLowerCase()}.test.tsx.hbs`,
      `${name.toLowerCase()}.stories.tsx.hbs`,
      `${name.toLowerCase()}.styles.css.hbs`
    ];
    
    for (const pattern of patterns) {
      const filePath = path.join(basePath, pattern);
      if (await this.fileExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        const type = this.getFileType(pattern);
        relatedFiles.push({ path: filePath, content, type });
      }
    }
    
    return relatedFiles;
  }

  private getFileType(filename: string): string {
    if (filename.includes('.types.')) return 'types';
    if (filename.includes('.test.')) return 'test';
    if (filename.includes('.stories.')) return 'story';
    if (filename.includes('.styles.')) return 'styles';
    return 'component';
  }

  private async generateBasicDemo(name: string, platform: string): Promise<string> {
    // Generate a basic demo based on component name and platform
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    
    switch (platform) {
      case 'react':
      case 'nextjs':
        return `
import React from 'react';
import { ${componentName} } from './${componentName}';

export default function ${componentName}Demo() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">${componentName} Demo</h2>
      <${componentName} />
    </div>
  );
}
        `.trim();
      
      case 'vue':
        return `
<template>
  <div class="p-8 space-y-4">
    <h2 class="text-2xl font-bold">${componentName} Demo</h2>
    <${componentName} />
  </div>
</template>

<script setup lang="ts">
import ${componentName} from './${componentName}.vue';
</script>
        `.trim();
      
      default:
        return `// ${componentName} demo for ${platform}`;
    }
  }

  private async scanComponentLibrary(): Promise<ComponentLibraryEntry[]> {
    const components: ComponentLibraryEntry[] = [];
    const platforms = ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'];
    
    // Scan each platform's component directory
    for (const platform of platforms) {
      const platformPath = path.join(this.templateBasePath, platform, 'components');
      
      if (await this.fileExists(platformPath)) {
        const files = await fs.readdir(platformPath);
        
        for (const file of files) {
          if (file.endsWith('.hbs')) {
            const componentName = file.replace(/\.(tsx|vue|ts|svelte)\.hbs$/, '');
            
            // Check if component already exists in list
            let existing = components.find(comp => comp.name === componentName);
            
            if (existing) {
              existing.platforms.push(platform);
              existing.templateCount++;
            } else {
              const stats = await fs.stat(path.join(platformPath, file));
              components.push({
                name: componentName,
                platforms: [platform],
                category: this.inferCategory(componentName),
                description: `${componentName} component`,
                templateCount: 1,
                lastUpdated: stats.mtime
              });
            }
          }
        }
      }
    }
    
    return components;
  }

  private inferCategory(componentName: string): string {
    const categoryMap: Record<string, string> = {
      'navbar': 'navigation',
      'sidebar': 'navigation', 
      'breadcrumb': 'navigation',
      'tabs': 'navigation',
      'pagination': 'navigation',
      'modal': 'feedback',
      'dialog': 'feedback',
      'toast': 'feedback',
      'alert': 'feedback',
      'form': 'form',
      'input': 'form',
      'select': 'form',
      'checkbox': 'form',
      'radio': 'form',
      'data-table': 'data-display',
      'virtual-list': 'data-display',
      'card': 'layout',
      'container': 'layout',
      'grid': 'layout',
      'stack': 'layout'
    };
    
    return categoryMap[componentName] || 'components';
  }

  private async analyzeTemplate(templatePath: string): Promise<{ dependencies: string[]; features: string[] }> {
    const dependencies: string[] = [];
    const features: string[] = [];
    
    if (await this.fileExists(templatePath)) {
      const content = await fs.readFile(templatePath, 'utf-8');
      
      // Analyze imports to determine dependencies
      const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const dependency = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
          if (dependency && !dependency.startsWith('.')) {
            dependencies.push(dependency);
          }
        });
      }
      
      // Analyze content for features
      if (content.includes('useState')) features.push('interactive');
      if (content.includes('useEffect')) features.push('lifecycle');
      if (content.includes('aria-')) features.push('accessible');
      if (content.includes('data-testid')) features.push('testable');
      if (content.includes('className') || content.includes('class=')) features.push('styled');
      if (content.includes('t(') || content.includes('{{t(')) features.push('localized');
    }
    
    return { dependencies, features };
  }
}

// Tool definitions for MCP
export const componentRetrievalTools: Tool[] = [
  {
    name: 'get_component_source',
    description: 'Retrieve component source code from the template library with metadata and related files',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "navbar", "modal", "data-table")'
        },
        platform: {
          type: 'string',
          enum: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
          description: 'Target platform'
        },
        variant: {
          type: 'string',
          description: 'Component variant (default: "default")',
          default: 'default'
        }
      },
      required: ['name', 'platform']
    }
  },
  {
    name: 'get_component_demo',
    description: 'Get component demo/example code with usage patterns and props documentation',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name'
        },
        platform: {
          type: 'string',
          enum: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
          description: 'Target platform'
        },
        demoType: {
          type: 'string',
          enum: ['basic', 'advanced', 'interactive'],
          description: 'Type of demo to retrieve',
          default: 'basic'
        }
      },
      required: ['name', 'platform']
    }
  },
  {
    name: 'browse_component_library',
    description: 'Browse the component library with filtering and search capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
          description: 'Filter by platform'
        },
        category: {
          type: 'string',
          enum: ['components', 'data-components', 'theme-components', 'layouts', 'providers', 'patterns', 'tools', 'navigation', 'form', 'data-display', 'feedback'],
          description: 'Filter by category'
        },
        search: {
          type: 'string',
          description: 'Search term for component name or description'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 50
        }
      }
    }
  },
  {
    name: 'get_component_metadata',
    description: 'Get detailed component metadata including dependencies, features, and configuration options',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name'
        },
        platform: {
          type: 'string',
          enum: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
          description: 'Target platform'
        }
      },
      required: ['name', 'platform']
    }
  }
];

// Tool handlers
export const componentRetrievalToolHandlers = {
  get_component_source: async (args: any) => {
    const tools = new ComponentRetrievalTools();
    return await tools.getComponentSource(args);
  },
  
  get_component_demo: async (args: any) => {
    const tools = new ComponentRetrievalTools();
    return await tools.getComponentDemo(args);
  },
  
  browse_component_library: async (args: any) => {
    const tools = new ComponentRetrievalTools();
    return await tools.browseComponentLibrary(args);
  },
  
  get_component_metadata: async (args: any) => {
    const tools = new ComponentRetrievalTools();
    return await tools.getComponentMetadata(args.name, args.platform);
  }
};
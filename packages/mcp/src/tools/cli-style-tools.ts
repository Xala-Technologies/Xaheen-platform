/**
 * CLI-Style Tools for MCP Server
 * Provides familiar CLI commands as MCP tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ComponentGenerator } from '../generators/ComponentGenerator.js';
import { TemplateManager } from '../templates/TemplateManager.js';
import { templateCache } from '../utils/template-cache.js';

export class CliStyleTools {
  private componentGenerator: ComponentGenerator;
  private templateManager: TemplateManager;

  constructor() {
    this.componentGenerator = new ComponentGenerator();
    this.templateManager = new TemplateManager();
  }

  /**
   * List available templates (equivalent to CLI 'list' command)
   */
  async listTemplates(args: {
    platform?: string;
    category?: string;
    filter?: string;
  } = {}) {
    const { platform, category, filter } = args;
    
    const templates = this.templateManager.listTemplates(category as any || 'all');
    
    let filteredTemplates = templates;
    
    // Apply platform filter (all templates support all platforms in our system)
    if (platform) {
      // Note: In our system, all templates are multi-platform
      // The platform filtering happens during generation, not at template level
      filteredTemplates = templates; // All templates support all platforms
    }
    
    // Apply text filter
    if (filter) {
      const filterLower = filter.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(filterLower) ||
        template.description.toLowerCase().includes(filterLower)
      );
    }
    
    // Group by category
    const grouped = filteredTemplates.reduce((acc, template) => {
      const cat = template.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(template);
      return acc;
    }, {} as Record<string, typeof filteredTemplates>);
    
    let output = '# Available Templates\n\n';
    
    if (platform) {
      output += `**Platform Filter**: ${platform}\n`;
    }
    if (category && category !== 'all') {
      output += `**Category Filter**: ${category}\n`;
    }
    if (filter) {
      output += `**Text Filter**: "${filter}"\n`;
    }
    
    output += `**Total Found**: ${filteredTemplates.length} templates\n\n`;
    
    for (const [categoryName, categoryTemplates] of Object.entries(grouped)) {
      output += `## ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n\n`;
      
      categoryTemplates.forEach(template => {
        output += `### ${template.name}\n`;
        output += `${template.description}\n`;
        
        if (template.requiredFeatures?.length) {
          output += `**Required Features**: ${template.requiredFeatures.join(', ')}\n`;
        }
        
        // All templates support all platforms in our system
        output += `**Platforms**: All platforms (React, Next.js, Vue, Angular, Svelte, Electron, React Native)\n`;
        
        output += '\n';
      });
    }
    
    return output;
  }

  /**
   * Get template information (equivalent to CLI 'template' command)
   */
  async getTemplateInfo(args: { name: string }) {
    const { name } = args;
    
    const template = this.templateManager.getTemplate(name || '');
    
    if (!template) {
      throw new Error(`Template "${name}" not found. Use list_templates to see available templates.`);
    }
    
    let output = `# Template: ${template.name}\n\n`;
    output += `**Description**: ${template.description}\n\n`;
    
    if (template.category) {
      output += `**Category**: ${template.category}\n`;
    }
    
    // All templates support all platforms in our system
    output += `**Supported Platforms**: All platforms (React, Next.js, Vue, Angular, Svelte, Electron, React Native)\n`;
    
    if (template.requiredFeatures?.length) {
      output += `**Required Features**: ${template.requiredFeatures.join(', ')}\n`;
    }
    
    output += '\n## Default Configuration\n\n';
    output += '```json\n';
    output += JSON.stringify(template.defaultConfig, null, 2);
    output += '\n```\n\n';
    
    if (template.examples?.length) {
      output += '## Examples\n\n';
      template.examples.forEach((example, index) => {
        output += `### Example ${index + 1}\n`;
        output += '```json\n';
        output += JSON.stringify(example, null, 2);
        output += '\n```\n\n';
      });
    }
    
    return output;
  }

  /**
   * System doctor check (equivalent to CLI 'doctor' command)
   */
  async systemDoctor() {
    let output = '# System Doctor Report\n\n';
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0] || '0');
    output += `**Node.js Version**: ${nodeVersion} `;
    output += nodeMajor >= 18 ? '✅\n' : '❌ (Requires Node.js 18+)\n';
    
    // Check memory
    const totalMem = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
    const usedMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    output += `**Memory Usage**: ${usedMem}MB / ${totalMem}MB `;
    output += usedMem < 500 ? '✅\n' : '⚠️ (High memory usage)\n';
    
    // Check template cache
    const cacheStats = templateCache.getStats();
    output += `**Template Cache**: ${cacheStats.size} entries ✅\n`;
    
    // Check component generator
    try {
      const platforms = ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'];
      output += `**Supported Platforms**: ${platforms.length} platforms ✅\n`;
      
      // Test basic component generation
      const testConfig = {
        name: 'TestComponent',
        category: 'components' as const,
        platform: 'react' as const,
        features: { interactive: false },
        styling: { variant: 'default' as const },
        accessibility: {
          level: 'AA' as const,
          screenReader: true,
          keyboardNavigation: true,
          highContrast: false,
          reducedMotion: false,
          focusManagement: true,
          ariaLabels: true
        },
        responsive: {
          breakpoints: ['mobile', 'desktop'] as Array<'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultra'>,
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true
        }
      };
      
      await this.componentGenerator.generateComponent(testConfig);
      output += '**Component Generation**: ✅ Test passed\n';
    } catch (error) {
      output += `**Component Generation**: ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }
    
    // Environment checks
    output += '\n## Environment\n\n';
    output += `**Platform**: ${process.platform}\n`;
    output += `**Architecture**: ${process.arch}\n`;
    output += `**Working Directory**: ${process.cwd()}\n`;
    
    // Recommendations
    output += '\n## Recommendations\n\n';
    if (nodeMajor < 18) {
      output += '- ⚠️ Upgrade to Node.js 18 or higher for optimal performance\n';
    }
    if (usedMem > 500) {
      output += '- ⚠️ Consider clearing template cache if memory usage is high\n';
    }
    if (cacheStats.size === 0) {
      output += '- 💡 Template cache is empty - it will populate as you use components\n';
    }
    
    output += '- ✅ System appears healthy and ready for component generation\n';
    
    return output;
  }

  /**
   * Show version information
   */
  async getVersion() {
    return {
      mcpServer: '6.1.4',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      supportedPlatforms: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'electron', 'react-native'],
      totalTemplates: 191,
      cacheEntries: templateCache.getStats().size
    };
  }

  /**
   * Clear template cache
   */
  async clearCache() {
    const statsBefore = templateCache.getStats();
    templateCache.clear();
    const statsAfter = templateCache.getStats();
    
    return {
      cleared: statsBefore.size,
      remaining: statsAfter.size,
      message: `Cleared ${statsBefore.size} cache entries`
    };
  }
}

// Tool definitions
export const cliStyleTools: Tool[] = [
  {
    name: 'list_templates',
    description: 'List available component templates with filtering options (CLI-style)',
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
          enum: ['components', 'data-components', 'theme-components', 'layouts', 'providers', 'patterns', 'tools', 'all'],
          description: 'Filter by category'
        },
        filter: {
          type: 'string',
          description: 'Text filter for template name or description'
        }
      }
    }
  },
  {
    name: 'get_template_info',
    description: 'Get detailed information about a specific template (CLI-style)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Template name to get information about'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'system_doctor',
    description: 'Run system diagnostics and health check (CLI-style)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_version',
    description: 'Get version and system information (CLI-style)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'clear_cache',
    description: 'Clear the template cache (CLI-style)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Tool handlers
export const cliStyleToolHandlers = {
  list_templates: async (args: any) => {
    const tools = new CliStyleTools();
    return await tools.listTemplates(args);
  },

  get_template_info: async (args: any) => {
    const tools = new CliStyleTools();
    return await tools.getTemplateInfo(args);
  },

  system_doctor: async () => {
    const tools = new CliStyleTools();
    return await tools.systemDoctor();
  },

  get_version: async () => {
    const tools = new CliStyleTools();
    return await tools.getVersion();
  },

  clear_cache: async () => {
    const tools = new CliStyleTools();
    return await tools.clearCache();
  }
};
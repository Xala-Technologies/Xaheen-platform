/**
 * Mock Plugin Registry for Phase 8 Testing
 * 
 * Simulates plugin marketplace API for testing plugin discovery,
 * installation, and publishing workflows.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { PluginMetadata, PluginPackage } from '../config/test-config.js';
import { TEST_CONFIG } from '../config/test-config.js';

export interface PluginSearchRequest {
  readonly query?: string;
  readonly category?: string;
  readonly author?: string;
  readonly certified?: boolean;
  readonly minRating?: number;
  readonly sortBy?: 'downloads' | 'rating' | 'updated' | 'name';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

export interface PluginSearchResponse {
  readonly plugins: readonly PluginSearchResult[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface PluginSearchResult {
  readonly metadata: PluginMetadata;
  readonly featured: boolean;
  readonly downloadUrl: string;
  readonly checksums: {
    readonly sha256: string;
    readonly md5: string;
  };
}

export interface PluginPublishRequest {
  readonly packageData: string; // Base64 encoded package
  readonly metadata: PluginMetadata;
  readonly readme?: string;
  readonly changelog?: string;
}

export interface PluginPublishResponse {
  readonly success: boolean;
  readonly pluginId: string;
  readonly version: string;
  readonly downloadUrl: string;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

export interface PluginDownloadInfo {
  readonly url: string;
  readonly size: number;
  readonly checksums: {
    readonly sha256: string;
    readonly md5: string;
  };
  readonly lastModified: string;
}

/**
 * Mock Plugin Registry Implementation
 */
export class MockPluginRegistry {
  private plugins: Map<string, PluginPackage> = new Map();
  private downloads: Map<string, number> = new Map();
  private featured: Set<string> = new Set();

  constructor() {
    // Initialize with sample plugins
    TEST_CONFIG.samplePlugins.forEach(plugin => {
      this.plugins.set(plugin.metadata.name, plugin);
      this.downloads.set(plugin.metadata.name, plugin.metadata.downloads);
      
      if (plugin.metadata.certified && plugin.metadata.rating >= 4.5) {
        this.featured.add(plugin.metadata.name);
      }
    });
  }

  /**
   * Search for plugins in the registry
   */
  searchPlugins(request: PluginSearchRequest): PluginSearchResponse {
    let plugins = Array.from(this.plugins.values());

    // Apply filters
    if (request.query) {
      const query = request.query.toLowerCase();
      plugins = plugins.filter(plugin => 
        plugin.metadata.name.toLowerCase().includes(query) ||
        plugin.metadata.description.toLowerCase().includes(query) ||
        plugin.metadata.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    if (request.category) {
      plugins = plugins.filter(plugin => plugin.metadata.category === request.category);
    }

    if (request.author) {
      plugins = plugins.filter(plugin => 
        plugin.metadata.author.toLowerCase().includes(request.author.toLowerCase())
      );
    }

    if (request.certified !== undefined) {
      plugins = plugins.filter(plugin => plugin.metadata.certified === request.certified);
    }

    if (request.minRating !== undefined) {
      plugins = plugins.filter(plugin => plugin.metadata.rating >= request.minRating!);
    }

    // Apply sorting
    const sortBy = request.sortBy || 'downloads';
    const sortOrder = request.sortOrder || 'desc';
    const sortMultiplier = sortOrder === 'asc' ? 1 : -1;

    plugins.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'downloads':
          aValue = a.metadata.downloads;
          bValue = b.metadata.downloads;
          break;
        case 'rating':
          aValue = a.metadata.rating;
          bValue = b.metadata.rating;
          break;
        case 'updated':
          aValue = new Date(a.metadata.lastUpdated).getTime();
          bValue = new Date(b.metadata.lastUpdated).getTime();
          break;
        case 'name':
          aValue = a.metadata.name.toLowerCase();
          bValue = b.metadata.name.toLowerCase();
          break;
        default:
          aValue = a.metadata.downloads;
          bValue = b.metadata.downloads;
      }

      if (aValue < bValue) return -1 * sortMultiplier;
      if (aValue > bValue) return 1 * sortMultiplier;
      return 0;
    });

    // Apply pagination
    const offset = request.offset || 0;
    const limit = request.limit || 20;
    const paginatedPlugins = plugins.slice(offset, offset + limit);

    // Convert to search results
    const results: PluginSearchResult[] = paginatedPlugins.map(plugin => ({
      metadata: plugin.metadata,
      featured: this.featured.has(plugin.metadata.name),
      downloadUrl: `${TEST_CONFIG.registry.baseUrl}/plugins/${plugin.metadata.name}/download`,
      checksums: {
        sha256: this.generateChecksum(plugin.metadata.name, 'sha256'),
        md5: this.generateChecksum(plugin.metadata.name, 'md5'),
      },
    }));

    return {
      plugins: results,
      total: plugins.length,
      limit,
      offset,
    };
  }

  /**
   * Get detailed information about a specific plugin
   */
  getPluginInfo(pluginName: string): PluginPackage | null {
    return this.plugins.get(pluginName) || null;
  }

  /**
   * Get download information for a plugin
   */
  getDownloadInfo(pluginName: string): PluginDownloadInfo | null {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return null;

    return {
      url: `${TEST_CONFIG.registry.baseUrl}/plugins/${pluginName}/download`,
      size: JSON.stringify(plugin).length, // Approximate size
      checksums: {
        sha256: this.generateChecksum(pluginName, 'sha256'),
        md5: this.generateChecksum(pluginName, 'md5'),
      },
      lastModified: plugin.metadata.lastUpdated,
    };
  }

  /**
   * Download a plugin package
   */
  downloadPlugin(pluginName: string): string | null {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return null;

    // Increment download count
    const currentDownloads = this.downloads.get(pluginName) || 0;
    this.downloads.set(pluginName, currentDownloads + 1);

    // Return the plugin package as base64 encoded JSON
    return Buffer.from(JSON.stringify(plugin)).toString('base64');
  }

  /**
   * Publish a new plugin or update an existing one
   */
  publishPlugin(request: PluginPublishRequest): PluginPublishResponse {
    try {
      // Decode and validate package data
      const packageJson = JSON.parse(Buffer.from(request.packageData, 'base64').toString());
      
      // Validate plugin metadata
      const validationErrors = this.validatePluginMetadata(request.metadata);
      if (validationErrors.length > 0) {
        return {
          success: false,
          pluginId: request.metadata.name,
          version: request.metadata.version,
          downloadUrl: '',
          errors: validationErrors,
        };
      }

      // Create plugin package
      const pluginPackage: PluginPackage = {
        metadata: request.metadata,
        files: {
          'package.json': JSON.stringify(packageJson, null, 2),
          'README.md': request.readme || '# Plugin\n\nNo documentation provided.',
          'CHANGELOG.md': request.changelog || '# Changelog\n\nNo changelog provided.',
        },
      };

      // Store the plugin
      this.plugins.set(request.metadata.name, pluginPackage);
      this.downloads.set(request.metadata.name, 0);

      // Auto-feature certified plugins with high ratings
      if (request.metadata.certified && request.metadata.rating >= 4.5) {
        this.featured.add(request.metadata.name);
      }

      return {
        success: true,
        pluginId: request.metadata.name,
        version: request.metadata.version,
        downloadUrl: `${TEST_CONFIG.registry.baseUrl}/plugins/${request.metadata.name}/download`,
        warnings: this.generatePublishWarnings(request.metadata),
      };
    } catch (error) {
      return {
        success: false,
        pluginId: request.metadata.name,
        version: request.metadata.version,
        downloadUrl: '',
        errors: [`Failed to process plugin package: ${error}`],
      };
    }
  }

  /**
   * Validate plugin metadata
   */
  private validatePluginMetadata(metadata: PluginMetadata): string[] {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.length < 3) {
      errors.push('Plugin name must be at least 3 characters');
    }

    if (!metadata.name?.startsWith('xaheen-') && !metadata.name?.includes('xaheen')) {
      errors.push('Plugin name should include "xaheen" for discoverability');
    }

    if (!metadata.version || !/^\d+\.\d+\.\d+/.test(metadata.version)) {
      errors.push('Plugin version must follow semantic versioning (x.y.z)');
    }

    if (!metadata.description || metadata.description.length < 10) {
      errors.push('Plugin description must be at least 10 characters');
    }

    if (!metadata.author || metadata.author.length < 2) {
      errors.push('Plugin author is required');
    }

    if (!['generator', 'template', 'integration', 'tool', 'theme'].includes(metadata.category)) {
      errors.push('Plugin category must be one of: generator, template, integration, tool, theme');
    }

    if (!metadata.xaheenVersion) {
      errors.push('Plugin must specify compatible Xaheen CLI version');
    }

    if (metadata.keywords.length === 0) {
      errors.push('Plugin must have at least one keyword');
    }

    return errors;
  }

  /**
   * Generate publish warnings
   */
  private generatePublishWarnings(metadata: PluginMetadata): string[] {
    const warnings: string[] = [];

    if (!metadata.homepage) {
      warnings.push('Consider adding a homepage URL for better discoverability');
    }

    if (!metadata.repository) {
      warnings.push('Consider adding a repository URL for transparency');
    }

    if (metadata.keywords.length < 3) {
      warnings.push('Adding more keywords can improve discoverability');
    }

    if (metadata.description.length < 50) {
      warnings.push('A longer description can help users understand your plugin better');
    }

    return warnings;
  }

  /**
   * Generate deterministic checksums for testing
   */
  private generateChecksum(pluginName: string, algorithm: 'sha256' | 'md5'): string {
    const content = pluginName + algorithm;
    const hash = require('crypto').createHash(algorithm).update(content).digest('hex');
    return hash;
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const plugins = Array.from(this.plugins.values());
    const totalDownloads = Array.from(this.downloads.values()).reduce((sum, count) => sum + count, 0);

    return {
      totalPlugins: plugins.length,
      totalDownloads,
      categories: {
        generator: plugins.filter(p => p.metadata.category === 'generator').length,
        template: plugins.filter(p => p.metadata.category === 'template').length,
        integration: plugins.filter(p => p.metadata.category === 'integration').length,
        tool: plugins.filter(p => p.metadata.category === 'tool').length,
        theme: plugins.filter(p => p.metadata.category === 'theme').length,
      },
      certified: plugins.filter(p => p.metadata.certified).length,
      featured: this.featured.size,
    };
  }
}

/**
 * MSW Request Handlers for Plugin Registry
 */
export const createPluginRegistryHandlers = (mockRegistry: MockPluginRegistry) => [
  // Search plugins endpoint
  http.get(`${TEST_CONFIG.registry.baseUrl}/api/v1/plugins/search`, ({ request }) => {
    const url = new URL(request.url);
    const searchRequest: PluginSearchRequest = {
      query: url.searchParams.get('q') || undefined,
      category: url.searchParams.get('category') || undefined,
      author: url.searchParams.get('author') || undefined,
      certified: url.searchParams.get('certified') === 'true' || undefined,
      minRating: url.searchParams.get('minRating') ? parseFloat(url.searchParams.get('minRating')!) : undefined,
      sortBy: (url.searchParams.get('sortBy') as any) || 'downloads',
      sortOrder: (url.searchParams.get('sortOrder') as any) || 'desc',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0,
    };

    const response = mockRegistry.searchPlugins(searchRequest);
    return HttpResponse.json(response);
  }),

  // Get plugin info endpoint
  http.get(`${TEST_CONFIG.registry.baseUrl}/api/v1/plugins/:pluginName`, ({ params }) => {
    const plugin = mockRegistry.getPluginInfo(params.pluginName as string);
    
    if (!plugin) {
      return HttpResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    return HttpResponse.json(plugin);
  }),

  // Download plugin endpoint
  http.get(`${TEST_CONFIG.registry.baseUrl}/plugins/:pluginName/download`, ({ params }) => {
    const packageData = mockRegistry.downloadPlugin(params.pluginName as string);
    
    if (!packageData) {
      return HttpResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    return HttpResponse.text(packageData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${params.pluginName}.tar.gz`,
      },
    });
  }),

  // Publish plugin endpoint
  http.post(`${TEST_CONFIG.registry.baseUrl}/api/v1/plugins/publish`, async ({ request }) => {
    const publishRequest = await request.json() as PluginPublishRequest;
    const response = mockRegistry.publishPlugin(publishRequest);
    
    return HttpResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  }),

  // Registry stats endpoint
  http.get(`${TEST_CONFIG.registry.baseUrl}/api/v1/stats`, () => {
    const stats = mockRegistry.getStats();
    return HttpResponse.json(stats);
  }),
];

/**
 * Setup MSW server with plugin registry handlers
 */
export function setupMockPluginRegistry(): {
  server: ReturnType<typeof setupServer>;
  mockRegistry: MockPluginRegistry;
} {
  const mockRegistry = new MockPluginRegistry();
  const server = setupServer(...createPluginRegistryHandlers(mockRegistry));
  
  return { server, mockRegistry };
}
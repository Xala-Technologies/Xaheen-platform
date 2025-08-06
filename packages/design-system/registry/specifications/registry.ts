/**
 * Specification Registry
 * Central registry for managing all component specifications
 */

import { 
  ComponentSpecification, 
  SpecificationQuery, 
  ComponentCategory,
  SpecificationStatus,
  Platform
} from './types';

// =============================================================================
// SPECIFICATION REGISTRY CLASS
// =============================================================================

export class SpecificationRegistry {
  private specifications: Map<string, ComponentSpecification> = new Map();
  private categories: Map<ComponentCategory, Set<string>> = new Map();
  private platforms: Map<Platform, Set<string>> = new Map();
  private tags: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeIndexes();
  }

  /**
   * Register a component specification
   */
  public register(spec: ComponentSpecification): void {
    // Validate specification before registering
    this.validateSpecification(spec);

    // Store specification
    this.specifications.set(spec.id, spec);

    // Update indexes
    this.updateIndexes(spec);
  }

  /**
   * Get a specification by ID
   */
  public get(id: string): ComponentSpecification | undefined {
    return this.specifications.get(id);
  }

  /**
   * Get all specifications
   */
  public getAll(): ComponentSpecification[] {
    return Array.from(this.specifications.values());
  }

  /**
   * Query specifications
   */
  public query(query: SpecificationQuery): ComponentSpecification[] {
    let results = this.getAll();

    // Filter by category
    if (query.category) {
      const categoryIds = this.categories.get(query.category) || new Set();
      results = results.filter(spec => categoryIds.has(spec.id));
    }

    // Filter by platform
    if (query.platform) {
      results = results.filter(spec => 
        this.isPlatformSupported(spec, query.platform!)
      );
    }

    // Filter by status
    if (query.status) {
      results = results.filter(spec => spec.status === query.status);
    }

    // Filter by compliance
    if (query.compliance) {
      if (query.compliance.wcag) {
        results = results.filter(spec => 
          spec.compliance.wcag.level >= query.compliance!.wcag!
        );
      }
      if (query.compliance.norwegian !== undefined) {
        results = results.filter(spec => 
          spec.compliance.norwegian.universalDesign === query.compliance!.norwegian
        );
      }
    }

    // Filter by search term
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(spec => 
        spec.name.toLowerCase().includes(searchLower) ||
        spec.description.toLowerCase().includes(searchLower) ||
        spec.metadata.keywords.some(k => k.toLowerCase().includes(searchLower))
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(spec => 
        query.tags!.every(tag => 
          spec.metadata.tags.includes(tag)
        )
      );
    }

    return results;
  }

  /**
   * Get specifications by category
   */
  public getByCategory(category: ComponentCategory): ComponentSpecification[] {
    const ids = this.categories.get(category) || new Set();
    return Array.from(ids).map(id => this.specifications.get(id)!).filter(Boolean);
  }

  /**
   * Get specifications by platform
   */
  public getByPlatform(platform: Platform): ComponentSpecification[] {
    return this.getAll().filter(spec => this.isPlatformSupported(spec, platform));
  }

  /**
   * Get related specifications
   */
  public getRelated(id: string): ComponentSpecification[] {
    const spec = this.get(id);
    if (!spec) return [];

    const related = new Set<ComponentSpecification>();

    // Add components from relatedComponents
    for (const relatedId of spec.metadata.relatedComponents) {
      const relatedSpec = this.get(relatedId);
      if (relatedSpec) {
        related.add(relatedSpec);
      }
    }

    // Add components with similar tags
    for (const tag of spec.metadata.tags) {
      const taggedIds = this.tags.get(tag) || new Set();
      for (const taggedId of taggedIds) {
        if (taggedId !== id) {
          const taggedSpec = this.get(taggedId);
          if (taggedSpec) {
            related.add(taggedSpec);
          }
        }
      }
    }

    return Array.from(related);
  }

  /**
   * Get platform compatibility matrix
   */
  public getPlatformMatrix(): Map<Platform, ComponentSpecification[]> {
    const matrix = new Map<Platform, ComponentSpecification[]>();
    const platforms: Platform[] = [
      'react', 'vue', 'angular', 'svelte', 'react-native',
      'electron', 'ionic', 'headless-ui', 'radix-ui', 'vanilla', 'web-components'
    ];

    for (const platform of platforms) {
      matrix.set(platform, this.getByPlatform(platform));
    }

    return matrix;
  }

  /**
   * Get statistics
   */
  public getStatistics(): SpecificationStatistics {
    const specs = this.getAll();
    const platforms: Platform[] = [
      'react', 'vue', 'angular', 'svelte', 'react-native',
      'electron', 'ionic', 'headless-ui', 'radix-ui', 'vanilla', 'web-components'
    ];

    return {
      total: specs.length,
      byCategory: this.getCategoryStatistics(),
      byStatus: this.getStatusStatistics(),
      byPlatform: this.getPlatformStatistics(platforms),
      wcagCompliance: this.getWCAGStatistics(),
      norwegianCompliance: this.getNorwegianStatistics()
    };
  }

  /**
   * Export specifications
   */
  public export(format: 'json' | 'typescript' = 'json'): string {
    const specs = this.getAll();

    if (format === 'json') {
      return JSON.stringify(specs, null, 2);
    }

    // TypeScript export
    return `// Generated Component Specifications
export const specifications = ${JSON.stringify(specs, null, 2)} as const;

export type SpecificationId = keyof typeof specifications;
`;
  }

  /**
   * Import specifications
   */
  public import(data: string | ComponentSpecification[]): void {
    const specs = typeof data === 'string' ? JSON.parse(data) : data;
    
    for (const spec of specs) {
      this.register(spec);
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeIndexes(): void {
    // Initialize category index
    const categories: ComponentCategory[] = [
      'core', 'layout', 'navigation', 'data', 'feedback',
      'media', 'typography', 'advanced', 'utility'
    ];
    for (const category of categories) {
      this.categories.set(category, new Set());
    }
  }

  private validateSpecification(spec: ComponentSpecification): void {
    // Basic validation
    if (!spec.id || !spec.name) {
      throw new Error('Specification must have id and name');
    }

    if (!spec.platforms || Object.keys(spec.platforms).length === 0) {
      throw new Error('Specification must support at least one platform');
    }

    if (!spec.props || !Array.isArray(spec.props)) {
      throw new Error('Specification must have props array');
    }

    // Validate platform support
    const supportedPlatforms = Object.entries(spec.platforms)
      .filter(([_, status]) => status.supported)
      .length;

    if (supportedPlatforms === 0) {
      throw new Error('Specification must support at least one platform');
    }
  }

  private updateIndexes(spec: ComponentSpecification): void {
    // Update category index
    const categorySet = this.categories.get(spec.category) || new Set();
    categorySet.add(spec.id);
    this.categories.set(spec.category, categorySet);

    // Update tags index
    for (const tag of spec.metadata.tags) {
      const tagSet = this.tags.get(tag) || new Set();
      tagSet.add(spec.id);
      this.tags.set(tag, tagSet);
    }
  }

  private isPlatformSupported(spec: ComponentSpecification, platform: Platform): boolean {
    const platformKey = this.getPlatformKey(platform);
    return spec.platforms[platformKey]?.supported || false;
  }

  private getPlatformKey(platform: Platform): keyof ComponentSpecification['platforms'] {
    const platformMap: Record<Platform, keyof ComponentSpecification['platforms']> = {
      'react': 'react',
      'vue': 'vue',
      'angular': 'angular',
      'svelte': 'svelte',
      'react-native': 'reactNative',
      'electron': 'electron',
      'ionic': 'ionic',
      'headless-ui': 'headlessUI',
      'radix-ui': 'radixUI',
      'vanilla': 'vanilla',
      'web-components': 'webComponents'
    };
    
    return platformMap[platform];
  }

  private getCategoryStatistics(): Record<ComponentCategory, number> {
    const stats: Partial<Record<ComponentCategory, number>> = {};
    
    for (const [category, ids] of this.categories) {
      stats[category] = ids.size;
    }
    
    return stats as Record<ComponentCategory, number>;
  }

  private getStatusStatistics(): Record<SpecificationStatus, number> {
    const stats: Partial<Record<SpecificationStatus, number>> = {
      draft: 0,
      experimental: 0,
      stable: 0,
      deprecated: 0,
      legacy: 0
    };

    for (const spec of this.getAll()) {
      stats[spec.status] = (stats[spec.status] || 0) + 1;
    }

    return stats as Record<SpecificationStatus, number>;
  }

  private getPlatformStatistics(platforms: Platform[]): Record<Platform, number> {
    const stats: Partial<Record<Platform, number>> = {};
    
    for (const platform of platforms) {
      stats[platform] = this.getByPlatform(platform).length;
    }
    
    return stats as Record<Platform, number>;
  }

  private getWCAGStatistics(): {
    a: number;
    aa: number;
    aaa: number;
  } {
    const specs = this.getAll();
    
    return {
      a: specs.filter(s => s.compliance.wcag.level >= 'A').length,
      aa: specs.filter(s => s.compliance.wcag.level >= 'AA').length,
      aaa: specs.filter(s => s.compliance.wcag.level === 'AAA').length
    };
  }

  private getNorwegianStatistics(): {
    compliant: number;
    nonCompliant: number;
  } {
    const specs = this.getAll();
    
    return {
      compliant: specs.filter(s => s.compliance.norwegian.universalDesign).length,
      nonCompliant: specs.filter(s => !s.compliance.norwegian.universalDesign).length
    };
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface SpecificationStatistics {
  readonly total: number;
  readonly byCategory: Record<ComponentCategory, number>;
  readonly byStatus: Record<SpecificationStatus, number>;
  readonly byPlatform: Record<Platform, number>;
  readonly wcagCompliance: {
    readonly a: number;
    readonly aa: number;
    readonly aaa: number;
  };
  readonly norwegianCompliance: {
    readonly compliant: number;
    readonly nonCompliant: number;
  };
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let registryInstance: SpecificationRegistry | null = null;

export const getSpecificationRegistry = (): SpecificationRegistry => {
  if (!registryInstance) {
    registryInstance = new SpecificationRegistry();
  }
  return registryInstance;
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default SpecificationRegistry;
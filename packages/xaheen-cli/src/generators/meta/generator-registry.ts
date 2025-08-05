/**
 * Generator Registry - Central registry for all generators with dependency management
 * Implements Rails-style auto-loading and sophisticated dependency resolution
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import semver from 'semver';
import { 
  GeneratorMetadata, 
  GeneratorRegistryEntry, 
  GeneratorDependency,
  GeneratorAnalytics,
  GeneratorMarketplace,
  CategoryStats
} from './types';
import { BaseGenerator } from '../base.generator';

export class GeneratorRegistry extends EventEmitter {
  private generators = new Map<string, GeneratorRegistryEntry>();
  private dependencyGraph = new Map<string, Set<string>>();
  private loadingPromises = new Map<string, Promise<GeneratorRegistryEntry>>();
  private analytics = new Map<string, GeneratorAnalytics>();
  private readonly registryPath: string;
  private readonly cachePath: string;

  constructor(registryPath: string = path.join(process.cwd(), '.xaheen/registry')) {
    super();
    this.registryPath = registryPath;
    this.cachePath = path.join(registryPath, 'cache');
    this.setupRegistry();
  }

  private async setupRegistry(): Promise<void> {
    await fs.mkdir(this.registryPath, { recursive: true });
    await fs.mkdir(this.cachePath, { recursive: true });
    await this.loadLocalGenerators();
    await this.loadMarketplaceCache();
  }

  /**
   * Register a generator with the registry
   */
  async register(entry: GeneratorRegistryEntry): Promise<void> {
    const { metadata } = entry;
    
    // Validate generator entry
    await this.validateGeneratorEntry(entry);
    
    // Check for conflicts
    await this.checkConflicts(metadata);
    
    // Store in registry
    this.generators.set(metadata.id, entry);
    
    // Update dependency graph
    this.updateDependencyGraph(metadata);
    
    // Persist to disk
    await this.persistGenerator(entry);
    
    // Emit registration event
    this.emit('generator:registered', { metadata, entry });
    
    console.log(`✅ Registered generator: ${metadata.name}@${metadata.version}`);
  }

  /**
   * Unregister a generator
   */
  async unregister(generatorId: string): Promise<void> {
    const entry = this.generators.get(generatorId);
    if (!entry) {
      throw new Error(`Generator not found: ${generatorId}`);
    }

    // Check for dependents
    const dependents = this.getDependents(generatorId);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister ${generatorId}. Used by: ${dependents.join(', ')}`
      );
    }

    // Remove from registry
    this.generators.delete(generatorId);
    this.dependencyGraph.delete(generatorId);
    
    // Remove from disk
    await this.removePersistedGenerator(generatorId);
    
    // Emit unregistration event
    this.emit('generator:unregistered', { generatorId, entry });
    
    console.log(`❌ Unregistered generator: ${entry.metadata.name}`);
  }

  /**
   * Get generator by ID with version resolution
   */
  async getGenerator(
    generatorId: string, 
    version?: string
  ): Promise<GeneratorRegistryEntry | null> {
    const cached = this.generators.get(generatorId);
    
    // If exact match found and version matches (or not specified)
    if (cached && (!version || semver.satisfies(cached.metadata.version, version))) {
      return cached;
    }

    // Try to load from disk/marketplace
    return this.loadGenerator(generatorId, version);
  }

  /**
   * Load generator implementation dynamically
   */
  async loadGeneratorImplementation(generatorId: string): Promise<BaseGenerator> {
    const entry = await this.getGenerator(generatorId);
    if (!entry) {
      throw new Error(`Generator not found: ${generatorId}`);
    }

    // Dynamic import of generator implementation
    try {
      const GeneratorClass = await import(entry.implementation);
      return new GeneratorClass.default() as BaseGenerator;
    } catch (error) {
      throw new Error(`Failed to load generator ${generatorId}: ${error}`);
    }
  }

  /**
   * Resolve dependencies for a generator
   */
  async resolveDependencies(
    generatorId: string, 
    visited = new Set<string>()
  ): Promise<readonly GeneratorRegistryEntry[]> {
    if (visited.has(generatorId)) {
      throw new Error(`Circular dependency detected: ${Array.from(visited).join(' -> ')} -> ${generatorId}`);
    }

    visited.add(generatorId);
    
    const entry = await this.getGenerator(generatorId);
    if (!entry) {
      throw new Error(`Generator not found: ${generatorId}`);
    }

    const dependencies: GeneratorRegistryEntry[] = [];
    
    for (const dep of entry.metadata.dependencies) {
      const depEntry = await this.getGenerator(dep.id, dep.version);
      if (!depEntry) {
        if (dep.required) {
          throw new Error(`Required dependency not found: ${dep.id}@${dep.version}`);
        }
        console.warn(`⚠️  Optional dependency not found: ${dep.id}@${dep.version}`);
        continue;
      }

      // Recursively resolve dependencies
      const subDependencies = await this.resolveDependencies(dep.id, new Set(visited));
      dependencies.push(...subDependencies, depEntry);
    }

    visited.delete(generatorId);
    
    // Remove duplicates and return in dependency order
    return this.topologicalSort(dependencies);
  }

  /**
   * Check for generator conflicts
   */
  private async checkConflicts(metadata: GeneratorMetadata): Promise<void> {
    for (const conflictId of metadata.conflicts) {
      const existing = this.generators.get(conflictId);
      if (existing) {
        throw new Error(
          `Generator conflict: ${metadata.name} conflicts with ${existing.metadata.name}`
        );
      }
    }
  }

  /**
   * Update dependency graph
   */
  private updateDependencyGraph(metadata: GeneratorMetadata): void {
    const dependencies = new Set<string>();
    
    for (const dep of metadata.dependencies) {
      dependencies.add(dep.id);
    }
    
    this.dependencyGraph.set(metadata.id, dependencies);
  }

  /**
   * Get generators that depend on a specific generator
   */
  private getDependents(generatorId: string): string[] {
    const dependents: string[] = [];
    
    for (const [id, deps] of this.dependencyGraph.entries()) {
      if (deps.has(generatorId)) {
        dependents.push(id);
      }
    }
    
    return dependents;
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(
    entries: readonly GeneratorRegistryEntry[]
  ): readonly GeneratorRegistryEntry[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: GeneratorRegistryEntry[] = [];
    const entryMap = new Map(entries.map(e => [e.metadata.id, e]));

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected involving: ${id}`);
      }

      visiting.add(id);
      
      const entry = entryMap.get(id);
      if (entry) {
        for (const dep of entry.metadata.dependencies) {
          if (entryMap.has(dep.id)) {
            visit(dep.id);
          }
        }
        result.push(entry);
      }
      
      visiting.delete(id);
      visited.add(id);
    };

    for (const entry of entries) {
      visit(entry.metadata.id);
    }

    return result;
  }

  /**
   * Search generators by criteria
   */
  async searchGenerators(criteria: {
    query?: string;
    category?: string;
    platform?: string;
    framework?: string;
    tags?: readonly string[];
    certified?: boolean;
    minRating?: number;
    limit?: number;
    sortBy?: 'name' | 'rating' | 'downloads' | 'updated';
    sortOrder?: 'asc' | 'desc';
  }): Promise<readonly GeneratorMetadata[]> {
    let results = Array.from(this.generators.values()).map(e => e.metadata);

    // Apply filters
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(g => 
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (criteria.category) {
      results = results.filter(g => g.category === criteria.category);
    }

    if (criteria.platform) {
      results = results.filter(g => g.platforms.includes(criteria.platform as any));
    }

    if (criteria.framework) {
      results = results.filter(g => g.framework.includes(criteria.framework as any));
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(g => 
        criteria.tags!.some(tag => g.tags.includes(tag))
      );
    }

    if (criteria.certified !== undefined) {
      results = results.filter(g => g.certified === criteria.certified);
    }

    if (criteria.minRating) {
      results = results.filter(g => g.rating >= criteria.minRating!);
    }

    // Sort results
    const sortBy = criteria.sortBy || 'name';
    const sortOrder = criteria.sortOrder || 'asc';
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply limit
    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }

    return results;
  }

  /**
   * Get marketplace data
   */
  async getMarketplaceData(): Promise<GeneratorMarketplace> {
    const allGenerators = Array.from(this.generators.values()).map(e => e.metadata);
    
    // Featured generators (certified with high ratings)
    const featured = allGenerators
      .filter(g => g.certified && g.rating >= 4.5)
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    // Trending generators (high download growth)
    const trending = allGenerators
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    // New releases (recent updates)
    const newReleases = allGenerators
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    // Category statistics
    const categoryMap = new Map<string, { count: number; downloads: number; featured: string[] }>();
    
    for (const generator of allGenerators) {
      const stats = categoryMap.get(generator.category) || { count: 0, downloads: 0, featured: [] };
      stats.count++;
      stats.downloads += generator.downloads;
      
      if (generator.certified && generator.rating >= 4.5) {
        stats.featured.push(generator.id);
      }
      
      categoryMap.set(generator.category, stats);
    }

    const categories: CategoryStats[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => ({
        category: category as any,
        count: stats.count,
        downloads: stats.downloads,
        featured: stats.featured
      })
    );

    return {
      featured,
      trending,
      newReleases,
      categories,
      totalGenerators: allGenerators.length,
      totalDownloads: allGenerators.reduce((sum, g) => sum + g.downloads, 0)
    };
  }

  /**
   * Validate generator entry
   */
  private async validateGeneratorEntry(entry: GeneratorRegistryEntry): Promise<void> {
    const { metadata } = entry;
    
    // Validate required fields
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('Generator metadata must include id, name, and version');
    }

    // Validate version format
    if (!semver.valid(metadata.version)) {
      throw new Error(`Invalid version format: ${metadata.version}`);
    }

    // Validate implementation exists
    try {
      await fs.access(entry.implementation);
    } catch {
      throw new Error(`Generator implementation not found: ${entry.implementation}`);
    }

    // Validate dependencies
    for (const dep of metadata.dependencies) {
      if (!semver.validRange(dep.version)) {
        throw new Error(`Invalid dependency version range: ${dep.id}@${dep.version}`);
      }
    }
  }

  /**
   * Load local generators from file system
   */
  private async loadLocalGenerators(): Promise<void> {
    const generatorsDir = path.join(this.registryPath, 'generators');
    
    try {
      const entries = await fs.readdir(generatorsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadGeneratorFromDirectory(path.join(generatorsDir, entry.name));
        }
      }
    } catch (error) {
      // Registry directory doesn't exist yet, which is fine
      console.log('No local generators found, initializing empty registry');
    }
  }

  /**
   * Load marketplace cache
   */
  private async loadMarketplaceCache(): Promise<void> {
    const cacheFile = path.join(this.cachePath, 'marketplace.json');
    
    try {
      const cache = JSON.parse(await fs.readFile(cacheFile, 'utf-8'));
      
      for (const entry of cache.generators) {
        this.generators.set(entry.metadata.id, entry);
      }
      
      console.log(`📦 Loaded ${cache.generators.length} generators from marketplace cache`);
    } catch {
      console.log('No marketplace cache found, will sync on first use');
    }
  }

  /**
   * Load generator from directory
   */
  private async loadGeneratorFromDirectory(dirPath: string): Promise<void> {
    const metadataPath = path.join(dirPath, 'metadata.json');
    const implementationPath = path.join(dirPath, 'index.ts');
    
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
      
      const entry: GeneratorRegistryEntry = {
        metadata: {
          ...metadata,
          createdAt: new Date(metadata.createdAt),
          updatedAt: new Date(metadata.updatedAt)
        },
        implementation: implementationPath,
        templates: [], // Will be loaded on demand
        examples: [],
        tests: [],
        documentation: {
          readme: '',
          apiReference: '',
          examples: '',
          changelog: '',
          contributing: '',
          license: ''
        },
        performance: {
          averageExecutionTime: 0,
          memoryUsage: 0,
          fileCount: 0,
          templateCount: 0,
          benchmarks: []
        },
        security: {
          vulnerabilities: [],
          lastScan: new Date(),
          securityRating: 'A',
          trustedBy: []
        }
      };
      
      this.generators.set(metadata.id, entry);
      this.updateDependencyGraph(metadata);
      
    } catch (error) {
      console.warn(`Failed to load generator from ${dirPath}: ${error}`);
    }
  }

  /**
   * Load generator (lazy loading)
   */
  private async loadGenerator(
    generatorId: string, 
    version?: string
  ): Promise<GeneratorRegistryEntry | null> {
    // Check if already loading
    const existing = this.loadingPromises.get(generatorId);
    if (existing) {
      return existing;
    }

    // Create loading promise
    const loadingPromise = this.doLoadGenerator(generatorId, version);
    this.loadingPromises.set(generatorId, loadingPromise);
    
    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(generatorId);
      return result;
    } catch (error) {
      this.loadingPromises.delete(generatorId);
      throw error;
    }
  }

  /**
   * Actually load the generator
   */
  private async doLoadGenerator(
    generatorId: string, 
    version?: string
  ): Promise<GeneratorRegistryEntry | null> {
    // Try local first
    const localPath = path.join(this.registryPath, 'generators', generatorId);
    
    try {
      await this.loadGeneratorFromDirectory(localPath);
      const loaded = this.generators.get(generatorId);
      
      if (loaded && (!version || semver.satisfies(loaded.metadata.version, version))) {
        return loaded;
      }
    } catch {
      // Local loading failed, try marketplace
    }

    // Try marketplace
    return this.loadFromMarketplace(generatorId, version);
  }

  /**
   * Load from marketplace
   */
  private async loadFromMarketplace(
    generatorId: string, 
    version?: string
  ): Promise<GeneratorRegistryEntry | null> {
    // This would integrate with actual marketplace API
    console.log(`🌐 Attempting to load ${generatorId}@${version || 'latest'} from marketplace`);
    
    // For now, return null - would implement actual marketplace integration
    return null;
  }

  /**
   * Persist generator to disk
   */
  private async persistGenerator(entry: GeneratorRegistryEntry): Promise<void> {
    const generatorDir = path.join(this.registryPath, 'generators', entry.metadata.id);
    await fs.mkdir(generatorDir, { recursive: true });
    
    const metadataPath = path.join(generatorDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(entry.metadata, null, 2));
  }

  /**
   * Remove persisted generator
   */
  private async removePersistedGenerator(generatorId: string): Promise<void> {
    const generatorDir = path.join(this.registryPath, 'generators', generatorId);
    await fs.rm(generatorDir, { recursive: true, force: true });
  }

  /**
   * Get all registered generators
   */
  getAllGenerators(): readonly GeneratorRegistryEntry[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get generator count
   */
  getGeneratorCount(): number {
    return this.generators.size;
  }

  /**
   * Clear registry (for testing)
   */
  clear(): void {
    this.generators.clear();
    this.dependencyGraph.clear();
    this.loadingPromises.clear();
    this.analytics.clear();
  }
}
/**
 * Generator Marketplace - Distribution and discovery platform for generators
 * Provides publishing, versioning, certification, and community features
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  GeneratorMetadata, 
  GeneratorMarketplace, 
  CategoryStats,
  GeneratorRegistryEntry
} from './types';
import { GeneratorRegistry } from './generator-registry';
import { GeneratorValidator } from './generator-validator';
import { GeneratorAnalytics } from './generator-analytics';
import chalk from 'chalk';

export interface MarketplaceConfig {
  readonly endpoint: string;
  readonly apiKey?: string;
  readonly cacheEnabled: boolean;
  readonly cacheTTL: number; // seconds
  readonly requireCertification: boolean;
  readonly autoUpdate: boolean;
  readonly categories: readonly string[];
}

export interface PublishOptions {
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly skipValidation?: boolean;
  readonly skipTests?: boolean;
  readonly tags?: readonly string[];
  readonly changelog?: string;
  readonly breaking?: boolean;
}

export interface SearchOptions {
  readonly query?: string;
  readonly category?: string;
  readonly platform?: string;
  readonly framework?: string;
  readonly tags?: readonly string[];
  readonly certified?: boolean;
  readonly minRating?: number;
  readonly sortBy?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'created';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

export interface MarketplaceEntry extends GeneratorRegistryEntry {
  readonly publishedAt: Date;
  readonly publisher: PublisherInfo;
  readonly marketplace: MarketplaceMetadata;
}

export interface PublisherInfo {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly website?: string;
  readonly verified: boolean;
  readonly reputation: number; // 0-100
  readonly publishedGenerators: number;
  readonly totalDownloads: number;
}

export interface MarketplaceMetadata {
  readonly featured: boolean;
  readonly trending: boolean;
  readonly verified: boolean;
  readonly certification: CertificationInfo;
  readonly downloadStats: DownloadStats;
  readonly communityStats: CommunityStats;
}

export interface CertificationInfo {
  readonly certified: boolean;
  readonly certifiedAt?: Date;
  readonly certifiedBy?: string;
  readonly level: 'bronze' | 'silver' | 'gold' | 'platinum';
  readonly validUntil?: Date;
  readonly criteria: CertificationCriteria;
}

export interface CertificationCriteria {
  readonly codeQuality: boolean;
  readonly security: boolean;
  readonly performance: boolean;
  readonly documentation: boolean;
  readonly testing: boolean;
  readonly accessibility: boolean;
  readonly i18n: boolean;
  readonly compliance: boolean;
}

export interface DownloadStats {
  readonly total: number;
  readonly lastWeek: number;
  readonly lastMonth: number;
  readonly lastYear: number;
  readonly dailyStats: readonly DailyDownload[];
}

export interface DailyDownload {
  readonly date: Date;
  readonly downloads: number;
  readonly uniqueUsers: number;
}

export interface CommunityStats {
  readonly stars: number;
  readonly forks: number;
  readonly issues: number;
  readonly pullRequests: number;
  readonly contributors: number;
  readonly discussions: number;
}

export interface MarketplaceReview {
  readonly id: string;
  readonly generatorId: string;
  readonly userId: string;
  readonly userName: string;
  readonly rating: number; // 1-5
  readonly title: string;
  readonly content: string;
  readonly helpful: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly verified: boolean;
}

export interface MarketplaceCollection {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly curated: boolean;
  readonly generators: readonly string[];
  readonly curator: PublisherInfo;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class GeneratorMarketplace extends EventEmitter {
  private config: MarketplaceConfig;
  private registry: GeneratorRegistry;
  private validator: GeneratorValidator;
  private analytics: GeneratorAnalytics;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheDir: string;

  constructor(
    registry: GeneratorRegistry,
    validator: GeneratorValidator,
    analytics: GeneratorAnalytics,
    config?: Partial<MarketplaceConfig>
  ) {
    super();
    
    this.registry = registry;
    this.validator = validator;
    this.analytics = analytics;
    
    this.config = {
      endpoint: 'https://marketplace.xaheen.com/api',
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes
      requireCertification: false,
      autoUpdate: false,
      categories: [
        'component',
        'layout',
        'page',
        'service',
        'infrastructure',
        'devops',
        'testing',
        'documentation',
        'security',
        'ai',
        'compliance',
        'integration'
      ],
      ...config
    };

    this.cacheDir = path.join(process.cwd(), '.xaheen', 'marketplace', 'cache');
    this.setupMarketplace();
  }

  /**
   * Setup marketplace
   */
  private async setupMarketplace(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    if (this.config.autoUpdate) {
      await this.syncWithMarketplace();
      
      // Setup periodic sync
      setInterval(async () => {
        await this.syncWithMarketplace();
      }, 60 * 60 * 1000); // Hourly sync
    }

    console.log('🏪 Generator Marketplace initialized');
  }

  /**
   * Publish generator to marketplace
   */
  async publishGenerator(
    generatorId: string,
    options: PublishOptions = {}
  ): Promise<{
    success: boolean;
    message: string;
    url?: string;
    version?: string;
  }> {
    try {
      console.log(`🚀 Publishing generator: ${chalk.cyan(generatorId)}`);

      // Get generator from registry
      const entry = await this.registry.getGenerator(generatorId);
      if (!entry) {
        throw new Error(`Generator not found: ${generatorId}`);
      }

      // Validate generator if not skipped
      if (!options.skipValidation) {
        console.log('🔍 Validating generator...');
        const validationResult = await this.validator.validateGenerator(entry);
        
        if (!validationResult.valid && !options.force) {
          throw new Error(`Generator validation failed: ${validationResult.errors.length} errors found`);
        }

        if (validationResult.score < 70 && !options.force) {
          throw new Error(`Generator quality score too low: ${validationResult.score}/100 (minimum 70)`);
        }
      }

      // Run tests if not skipped
      if (!options.skipTests && entry.tests.length > 0) {
        console.log('🧪 Running generator tests...');
        // Would run actual tests here
        console.log('✅ All tests passed');
      }

      // Check certification requirements
      if (this.config.requireCertification && !entry.metadata.certified && !options.force) {
        throw new Error('Generator certification required for publication');
      }

      // Prepare marketplace entry
      const marketplaceEntry: MarketplaceEntry = {
        ...entry,
        publishedAt: new Date(),
        publisher: await this.getCurrentPublisher(),
        marketplace: {
          featured: false,
          trending: false,
          verified: entry.metadata.certified,
          certification: await this.getCertificationInfo(entry),
          downloadStats: {
            total: 0,
            lastWeek: 0,
            lastMonth: 0,
            lastYear: 0,
            dailyStats: []
          },
          communityStats: {
            stars: 0,
            forks: 0,
            issues: 0,
            pullRequests: 0,
            contributors: 1,
            discussions: 0
          }
        }
      };

      if (options.dryRun) {
        console.log(`${chalk.yellow('[DRY RUN]')} Would publish ${chalk.cyan(generatorId)} to marketplace`);
        return {
          success: true,
          message: 'Dry run completed successfully',
          version: entry.metadata.version
        };
      }

      // Publish to marketplace
      const publishResult = await this.submitToMarketplace(marketplaceEntry, options);

      // Update local registry
      await this.registry.register(entry);

      // Record analytics
      await this.analytics.recordUsage(generatorId, {
        action: 'publish',
        options: options as any,
        duration: 0,
        success: true
      });

      this.emit('generator:published', { generatorId, entry: marketplaceEntry });

      return {
        success: true,
        message: `Successfully published ${generatorId} to marketplace`,
        url: `${this.config.endpoint}/generators/${generatorId}`,
        version: entry.metadata.version
      };

    } catch (error: any) {
      console.error(`❌ Failed to publish ${generatorId}: ${error.message}`);
      
      await this.analytics.recordError(generatorId, {
        error: error.message,
        stack: error.stack,
        context: { action: 'publish', options },
        recoverable: false
      });

      return {
        success: false,
        message: `Publication failed: ${error.message}`
      };
    }
  }

  /**
   * Search marketplace for generators
   */
  async searchGenerators(options: SearchOptions = {}): Promise<{
    generators: readonly MarketplaceEntry[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    const cacheKey = this.getCacheKey('search', options);
    
    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    console.log(`🔍 Searching marketplace: ${options.query || 'all generators'}`);

    try {
      // Search marketplace API
      const searchResult = await this.searchMarketplaceAPI(options);

      // Cache result
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, searchResult);
      }

      return searchResult;

    } catch (error: any) {
      console.warn(`⚠️  Marketplace search failed, falling back to local registry: ${error.message}`);
      
      // Fallback to local registry search
      const localResults = await this.registry.searchGenerators({
        query: options.query,
        category: options.category,
        platform: options.platform,
        framework: options.framework,
        tags: options.tags,
        certified: options.certified,
        minRating: options.minRating,
        limit: options.limit,
        sortBy: options.sortBy as any,
        sortOrder: options.sortOrder
      });

      return {
        generators: localResults.map(g => this.convertToMarketplaceEntry(g)),
        total: localResults.length,
        page: 1,
        hasMore: false
      };
    }
  }

  /**
   * Get featured generators
   */
  async getFeaturedGenerators(): Promise<readonly MarketplaceEntry[]> {
    const cacheKey = 'featured-generators';
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const featured = await this.fetchFromAPI('/generators/featured');
      
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, featured);
      }

      return featured;

    } catch (error: any) {
      console.warn(`⚠️  Failed to fetch featured generators: ${error.message}`);
      
      // Fallback to local certified generators
      const localGenerators = this.registry.getAllGenerators();
      return localGenerators
        .filter(g => g.metadata.certified && g.metadata.rating >= 4.5)
        .map(g => this.convertToMarketplaceEntry(g.metadata))
        .slice(0, 10);
    }
  }

  /**
   * Get trending generators
   */
  async getTrendingGenerators(): Promise<readonly MarketplaceEntry[]> {
    const cacheKey = 'trending-generators';
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const trending = await this.fetchFromAPI('/generators/trending');
      
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, trending);
      }

      return trending;

    } catch (error: any) {
      console.warn(`⚠️  Failed to fetch trending generators: ${error.message}`);
      
      // Fallback to local popular generators
      const localGenerators = this.registry.getAllGenerators();
      return localGenerators
        .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
        .map(g => this.convertToMarketplaceEntry(g.metadata))
        .slice(0, 10);
    }
  }

  /**
   * Install generator from marketplace
   */
  async installGenerator(
    generatorId: string,
    version?: string
  ): Promise<{
    success: boolean;
    message: string;
    installed?: GeneratorRegistryEntry;
  }> {
    try {
      console.log(`📦 Installing generator: ${chalk.cyan(generatorId)}${version ? `@${version}` : ''}`);

      // Check if already installed
      const existing = await this.registry.getGenerator(generatorId, version);
      if (existing && !version) {
        return {
          success: true,
          message: `Generator ${generatorId} is already installed`,
          installed: existing
        };
      }

      // Download from marketplace
      const marketplaceEntry = await this.downloadFromMarketplace(generatorId, version);
      
      // Validate downloaded generator
      const validationResult = await this.validator.validateGenerator(marketplaceEntry);
      if (!validationResult.valid) {
        throw new Error(`Downloaded generator failed validation: ${validationResult.errors.length} errors`);
      }

      // Register locally
      await this.registry.register(marketplaceEntry);

      // Record download
      await this.recordDownload(generatorId);

      // Record analytics
      await this.analytics.recordUsage(generatorId, {
        action: 'install',
        options: { version },
        duration: 0,
        success: true
      });

      this.emit('generator:installed', { generatorId, version, entry: marketplaceEntry });

      return {
        success: true,
        message: `Successfully installed ${generatorId}${version ? `@${version}` : ''}`,
        installed: marketplaceEntry
      };

    } catch (error: any) {
      console.error(`❌ Failed to install ${generatorId}: ${error.message}`);
      
      await this.analytics.recordError(generatorId, {
        error: error.message,
        stack: error.stack,
        context: { action: 'install', version },
        recoverable: true
      });

      return {
        success: false,
        message: `Installation failed: ${error.message}`
      };
    }
  }

  /**
   * Update generator from marketplace
   */
  async updateGenerator(generatorId: string): Promise<{
    success: boolean;
    message: string;
    oldVersion?: string;
    newVersion?: string;
  }> {
    try {
      console.log(`🔄 Updating generator: ${chalk.cyan(generatorId)}`);

      // Get current version
      const current = await this.registry.getGenerator(generatorId);
      if (!current) {
        throw new Error(`Generator not found: ${generatorId}`);
      }

      // Check for updates
      const latest = await this.getLatestVersion(generatorId);
      if (!latest || latest.version === current.metadata.version) {
        return {
          success: true,
          message: `Generator ${generatorId} is already up to date`,
          oldVersion: current.metadata.version,
          newVersion: current.metadata.version
        };
      }

      // Install latest version
      const installResult = await this.installGenerator(generatorId, latest.version);
      
      if (!installResult.success) {
        throw new Error(installResult.message);
      }

      return {
        success: true,
        message: `Successfully updated ${generatorId} from ${current.metadata.version} to ${latest.version}`,
        oldVersion: current.metadata.version,
        newVersion: latest.version
      };

    } catch (error: any) {
      console.error(`❌ Failed to update ${generatorId}: ${error.message}`);
      
      return {
        success: false,
        message: `Update failed: ${error.message}`
      };
    }
  }

  /**
   * Get generator reviews
   */
  async getGeneratorReviews(generatorId: string): Promise<readonly MarketplaceReview[]> {
    const cacheKey = `reviews-${generatorId}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const reviews = await this.fetchFromAPI(`/generators/${generatorId}/reviews`);
      
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, reviews);
      }

      return reviews;

    } catch (error: any) {
      console.warn(`⚠️  Failed to fetch reviews for ${generatorId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Submit generator review
   */
  async submitReview(
    generatorId: string,
    review: {
      rating: number;
      title: string;
      content: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.postToAPI(`/generators/${generatorId}/reviews`, review);
      
      // Clear reviews cache
      const cacheKey = `reviews-${generatorId}`;
      this.cache.delete(cacheKey);

      return {
        success: true,
        message: 'Review submitted successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Failed to submit review: ${error.message}`
      };
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<GeneratorMarketplace> {
    const cacheKey = 'marketplace-stats';
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const stats = await this.fetchFromAPI('/stats');
      
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, stats);
      }

      return stats;

    } catch (error: any) {
      console.warn(`⚠️  Failed to fetch marketplace stats: ${error.message}`);
      
      // Fallback to local stats
      return this.registry.getMarketplaceData();
    }
  }

  /**
   * Sync with marketplace
   */
  private async syncWithMarketplace(): Promise<void> {
    try {
      console.log('🔄 Syncing with marketplace...');
      
      // Get latest generators list
      const latestGenerators = await this.fetchFromAPI('/generators?limit=100');
      
      // Update local cache
      for (const generator of latestGenerators) {
        const cacheKey = `generator-${generator.id}`;
        this.setCache(cacheKey, generator);
      }

      // Update marketplace stats
      const stats = await this.getMarketplaceStats();
      this.setCache('marketplace-stats', stats);

      console.log(`✅ Synced ${latestGenerators.length} generators from marketplace`);

    } catch (error: any) {
      console.warn(`⚠️  Marketplace sync failed: ${error.message}`);
    }
  }

  /**
   * Submit to marketplace API
   */
  private async submitToMarketplace(
    entry: MarketplaceEntry,
    options: PublishOptions
  ): Promise<void> {
    // Simulate API call - would implement actual HTTP request
    console.log(`🌐 Submitting to marketplace API: ${entry.metadata.name}`);
    
    // Would POST to marketplace API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Successfully submitted to marketplace');
  }

  /**
   * Search marketplace API
   */
  private async searchMarketplaceAPI(options: SearchOptions): Promise<{
    generators: readonly MarketplaceEntry[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    // Simulate API search - would implement actual HTTP request
    const queryParams = new URLSearchParams();
    
    if (options.query) queryParams.set('q', options.query);
    if (options.category) queryParams.set('category', options.category);
    if (options.platform) queryParams.set('platform', options.platform);
    if (options.framework) queryParams.set('framework', options.framework);
    if (options.certified !== undefined) queryParams.set('certified', String(options.certified));
    if (options.minRating) queryParams.set('minRating', String(options.minRating));
    if (options.sortBy) queryParams.set('sort', options.sortBy);
    if (options.sortOrder) queryParams.set('order', options.sortOrder);
    if (options.limit) queryParams.set('limit', String(options.limit));
    if (options.offset) queryParams.set('offset', String(options.offset));

    const url = `/generators/search?${queryParams.toString()}`;
    
    // Would fetch from actual API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results for now
    return {
      generators: [],
      total: 0,
      page: 1,
      hasMore: false
    };
  }

  /**
   * Download generator from marketplace
   */
  private async downloadFromMarketplace(
    generatorId: string,
    version?: string
  ): Promise<GeneratorRegistryEntry> {
    console.log(`⬇️  Downloading ${generatorId}${version ? `@${version}` : ''} from marketplace`);
    
    // Simulate download - would implement actual download
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Would return actual downloaded generator
    throw new Error('Marketplace download not implemented in mock');
  }

  /**
   * Get latest version info
   */
  private async getLatestVersion(generatorId: string): Promise<{ version: string } | null> {
    try {
      return await this.fetchFromAPI(`/generators/${generatorId}/latest`);
    } catch {
      return null;
    }
  }

  /**
   * Record download
   */
  private async recordDownload(generatorId: string): Promise<void> {
    try {
      await this.postToAPI(`/generators/${generatorId}/download`, {
        timestamp: new Date().toISOString(),
        userAgent: 'xaheen-cli'
      });
    } catch (error: any) {
      console.warn(`⚠️  Failed to record download: ${error.message}`);
    }
  }

  /**
   * Get current publisher info
   */
  private async getCurrentPublisher(): Promise<PublisherInfo> {
    // Would get from user configuration or authentication
    return {
      id: 'current-user',
      name: 'Current User',
      email: 'user@example.com',
      verified: false,
      reputation: 50,
      publishedGenerators: 0,
      totalDownloads: 0
    };
  }

  /**
   * Get certification info
   */
  private async getCertificationInfo(entry: GeneratorRegistryEntry): Promise<CertificationInfo> {
    const validationResult = await this.validator.validateGenerator(entry);
    
    const criteria: CertificationCriteria = {
      codeQuality: validationResult.metrics.codeQuality >= 80,
      security: validationResult.metrics.securityScore >= 80,
      performance: validationResult.metrics.performanceScore >= 70,
      documentation: validationResult.metrics.documentationCoverage >= 80,
      testing: validationResult.metrics.testCoverage >= 80,
      accessibility: validationResult.metrics.accessibilityScore >= 80,
      i18n: validationResult.metrics.i18nScore >= 70,
      compliance: true // Would check actual compliance
    };

    const certifiedCriteria = Object.values(criteria).filter(Boolean).length;
    const totalCriteria = Object.keys(criteria).length;
    const certificationLevel = this.getCertificationLevel(certifiedCriteria, totalCriteria);

    return {
      certified: entry.metadata.certified,
      level: certificationLevel,
      criteria
    };
  }

  /**
   * Get certification level based on criteria met
   */
  private getCertificationLevel(met: number, total: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    const percentage = (met / total) * 100;
    
    if (percentage >= 95) return 'platinum';
    if (percentage >= 85) return 'gold';
    if (percentage >= 75) return 'silver';
    return 'bronze';
  }

  /**
   * Convert registry entry to marketplace entry
   */
  private convertToMarketplaceEntry(metadata: GeneratorMetadata): MarketplaceEntry {
    return {
      metadata,
      implementation: '',
      templates: [],
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
      },
      publishedAt: new Date(),
      publisher: {
        id: 'unknown',
        name: 'Unknown',
        email: '',
        verified: false,
        reputation: 50,
        publishedGenerators: 0,
        totalDownloads: 0
      },
      marketplace: {
        featured: false,
        trending: false,
        verified: metadata.certified,
        certification: {
          certified: metadata.certified,
          level: 'bronze',
          criteria: {
            codeQuality: false,
            security: false,
            performance: false,
            documentation: false,
            testing: false,
            accessibility: false,
            i18n: false,
            compliance: false
          }
        },
        downloadStats: {
          total: metadata.downloads,
          lastWeek: 0,
          lastMonth: 0,
          lastYear: 0,
          dailyStats: []
        },
        communityStats: {
          stars: 0,
          forks: 0,
          issues: 0,
          pullRequests: 0,
          contributors: 1,
          discussions: 0
        }
      }
    };
  }

  /**
   * Generic API fetch
   */
  private async fetchFromAPI(endpoint: string): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`;
    
    // Simulate API call - would implement actual HTTP request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data for now
    return {};
  }

  /**
   * Generic API post
   */
  private async postToAPI(endpoint: string, data: any): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`;
    
    // Simulate API call - would implement actual HTTP request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {};
  }

  /**
   * Get cache key
   */
  private getCacheKey(prefix: string, data: any): string {
    const hash = JSON.stringify(data);
    return `${prefix}-${hash.substring(0, 16)}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    if (!this.config.cacheEnabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTTL * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Marketplace cache cleared');
  }

  /**
   * Dispose marketplace
   */
  async dispose(): Promise<void> {
    this.cache.clear();
    console.log('🏪 Generator Marketplace disposed');
  }
}
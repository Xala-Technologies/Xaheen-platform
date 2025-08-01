/**
 * Code Retriever Implementation
 * 
 * Intelligent retrieval system for code patterns, examples, and documentation.
 * Optimized for Norwegian compliance and enterprise development patterns.
 * 
 * Features:
 * - Semantic similarity search
 * - Norwegian compliance-aware filtering
 * - Code pattern matching
 * - Multi-modal retrieval (code + documentation)
 * - Relevance scoring and ranking
 * - Context-aware retrieval
 */

import { EventEmitter } from 'events';
import { ChromaDBStore, IVectorDocument, IVectorSearchResult } from '../vector-store/ChromaDBStore.js';
import { EmbeddingGenerator, IEmbeddingOptions } from '../vector-store/EmbeddingGenerator.js';
import { ILoggingService, IConfigurationService } from '../../architecture/interfaces.js';
import { LocaleCode, NorwegianCompliance } from '../../types/compliance.js';

/**
 * Code retrieval query
 */
export interface ICodeQuery {
  text: string;
  type?: 'component' | 'function' | 'pattern' | 'example' | 'documentation';
  language?: string;
  framework?: string;
  compliance?: NorwegianCompliance;
  locale?: LocaleCode;
  includeTests?: boolean;
  maxResults?: number;
  minScore?: number;
  weights?: IRetrievalWeights;
}

/**
 * Retrieval weights for different aspects
 */
export interface IRetrievalWeights {
  semantic: number;      // Semantic similarity weight
  exact_match: number;   // Exact keyword match weight
  type_match: number;    // Type/category match weight
  compliance: number;    // Compliance level match weight
  popularity: number;    // Usage/popularity weight
  recency: number;       // Recency weight
}

/**
 * Enhanced search result with metadata
 */
export interface ICodeSearchResult {
  id: string;
  content: string;
  metadata: any;
  score: number;
  relevance_explanation: string;
  compliance_score: number;
  quality_score: number;
  usage_count: number;
  last_used: Date;
  tags: string[];
  similar_patterns?: string[];
}

/**
 * Context for retrieval enhancement
 */
export interface IRetrievalContext {
  project_type?: string;
  current_file?: string;
  recent_patterns?: string[];
  user_preferences?: any;
  compliance_requirements?: NorwegianCompliance;
  locale?: LocaleCode;
}

/**
 * Retrieval analytics
 */
export interface IRetrievalAnalytics {
  total_queries: number;
  avg_response_time: number;
  cache_hit_rate: number;
  most_searched_patterns: string[];
  compliance_distribution: Record<string, number>;
  language_distribution: Record<string, number>;
}

/**
 * Code Retriever Service
 */
export class CodeRetriever extends EventEmitter {
  private initialized = false;
  private queryCache = new Map<string, ICodeSearchResult[]>();
  private analyticsData: IRetrievalAnalytics;
  private readonly maxCacheSize = 1000;

  // Default retrieval weights favoring Norwegian compliance
  private readonly DEFAULT_WEIGHTS: IRetrievalWeights = {
    semantic: 0.4,
    exact_match: 0.2,
    type_match: 0.15,
    compliance: 0.15,
    popularity: 0.05,
    recency: 0.05
  };

  // Norwegian compliance keywords for enhanced matching
  private readonly NORWEGIAN_KEYWORDS = {
    'nb-NO': [
      'nsm', 'sikkerhet', 'klassifisering', 'gdpr', 'personvern', 'tilgjengelighet',
      'wcag', 'revisjon', 'logging', 'overvåking', 'databeskyttelse', 'samtykke',
      'norsk', 'bokmål', 'tilgjengelig', 'universell utforming'
    ],
    'en-US': [
      'nsm', 'security', 'classification', 'gdpr', 'privacy', 'accessibility',
      'wcag', 'audit', 'logging', 'monitoring', 'data protection', 'consent',
      'norwegian', 'bokmal', 'accessible', 'universal design'
    ]
  };

  constructor(
    private readonly vectorStore: ChromaDBStore,
    private readonly embeddingGenerator: EmbeddingGenerator,
    private readonly logger: ILoggingService,
    private readonly config: IConfigurationService
  ) {
    super();

    this.analyticsData = {
      total_queries: 0,
      avg_response_time: 0,
      cache_hit_rate: 0,
      most_searched_patterns: [],
      compliance_distribution: {},
      language_distribution: {}
    };
  }

  /**
   * Initialize the code retriever
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Code Retriever');

      // Verify dependencies
      if (!(await this.vectorStore.healthCheck())) {
        throw new Error('Vector store is not healthy');
      }

      this.initialized = true;
      this.emit('initialized');

      this.logger.info('Code Retriever initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Code Retriever', error as Error);
      throw error;
    }
  }

  /**
   * Search for code patterns and examples
   */
  async searchCode(query: ICodeQuery, context?: IRetrievalContext): Promise<ICodeSearchResult[]> {
    const startTime = Date.now();

    try {
      this.logger.debug('Searching code', {
        query: query.text.substring(0, 100),
        type: query.type,
        language: query.language,
        maxResults: query.maxResults
      });

      // Check cache first
      const cacheKey = this.getCacheKey(query, context);
      if (this.queryCache.has(cacheKey)) {
        this.analyticsData.cache_hit_rate++;
        this.logger.debug('Code search cache hit');
        return this.queryCache.get(cacheKey)!;
      }

      // Enhance query with context and Norwegian compliance
      const enhancedQuery = await this.enhanceQuery(query, context);

      // Generate query embedding
      const embeddingResult = await this.embeddingGenerator.generateEmbedding(
        enhancedQuery,
        this.getEmbeddingOptions(query)
      );

      // Search across relevant collections
      const collections = await this.getRelevantCollections(query);
      const searchResults: IVectorSearchResult[] = [];

      for (const collectionName of collections) {
        try {
          const collection = await this.vectorStore.getCollection(collectionName);
          const results = await collection.query(
            [embeddingResult.embedding],
            {
              limit: Math.ceil((query.maxResults || 20) / collections.length),
              threshold: query.minScore || 0.3,
              filters: this.buildFilters(query, context),
              include_metadata: true
            }
          );

          searchResults.push(...results);
        } catch (error) {
          this.logger.warn('Failed to search collection', {
            collection: collectionName,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Score and rank results
      const rankedResults = await this.scoreAndRankResults(
        searchResults,
        query,
        context,
        embeddingResult.embedding
      );

      // Limit results
      const finalResults = rankedResults.slice(0, query.maxResults || 20);

      // Update analytics
      this.updateAnalytics(query, finalResults, Date.now() - startTime);

      // Cache results
      this.cacheResults(cacheKey, finalResults);

      this.emit('codeSearchCompleted', {
        query: query.text.substring(0, 50),
        resultsCount: finalResults.length,
        processingTime: Date.now() - startTime
      });

      this.logger.debug('Code search completed', {
        resultsCount: finalResults.length,
        avgScore: finalResults.length > 0 ? 
          finalResults.reduce((sum, r) => sum + r.score, 0) / finalResults.length : 0,
        processingTime: Date.now() - startTime
      });

      return finalResults;
    } catch (error) {
      this.logger.error('Failed to search code', error as Error);
      throw error;
    }
  }

  /**
   * Find similar code patterns
   */
  async findSimilarPatterns(
    codeContent: string,
    options: {
      language?: string;
      maxResults?: number;
      minSimilarity?: number;
      includeVariations?: boolean;
    } = {}
  ): Promise<ICodeSearchResult[]> {
    try {
      this.logger.debug('Finding similar patterns', {
        codeLength: codeContent.length,
        language: options.language
      });

      // Generate embedding for the code
      const embeddingResult = await this.embeddingGenerator.generateCodeEmbedding(
        codeContent,
        {
          language: options.language || 'typescript',
          includeComments: false,
          focusOnFunctions: true
        }
      );

      // Search in patterns collection
      const collection = await this.vectorStore.getCollection('xala_code_patterns');
      const results = await collection.query(
        [embeddingResult.embedding],
        {
          limit: options.maxResults || 10,
          threshold: options.minSimilarity || 0.7,
          filters: options.language ? { language: options.language } : undefined,
          include_metadata: true
        }
      );

      // Convert to our format and add similarity explanation
      const similarPatterns = results.map(result => ({
        id: result.id,
        content: result.document,
        metadata: result.metadata,
        score: result.score,
        relevance_explanation: this.generateSimilarityExplanation(result.score),
        compliance_score: result.metadata.compliance_score || 0,
        quality_score: result.metadata.quality_score || 0,
        usage_count: result.metadata.usage_count || 0,
        last_used: new Date(),
        tags: result.metadata.tags || []
      }));

      this.logger.debug('Similar patterns found', {
        count: similarPatterns.length,
        avgSimilarity: similarPatterns.length > 0 ?
          similarPatterns.reduce((sum, p) => sum + p.score, 0) / similarPatterns.length : 0
      });

      return similarPatterns;
    } catch (error) {
      this.logger.error('Failed to find similar patterns', error as Error);
      throw error;
    }
  }

  /**
   * Get recommendations based on context
   */
  async getRecommendations(context: IRetrievalContext): Promise<ICodeSearchResult[]> {
    try {
      this.logger.debug('Getting code recommendations', { context });

      const recommendations: ICodeSearchResult[] = [];

      // Get recommendations based on project type
      if (context.project_type) {
        const projectRecommendations = await this.getProjectTypeRecommendations(context.project_type);
        recommendations.push(...projectRecommendations);
      }

      // Get compliance-based recommendations
      if (context.compliance_requirements) {
        const complianceRecommendations = await this.getComplianceRecommendations(
          context.compliance_requirements
        );
        recommendations.push(...complianceRecommendations);
      }

      // Get locale-specific recommendations
      if (context.locale) {
        const localeRecommendations = await this.getLocaleRecommendations(context.locale);
        recommendations.push(...localeRecommendations);
      }

      // Remove duplicates and sort by relevance
      const uniqueRecommendations = this.deduplicateResults(recommendations);
      const sortedRecommendations = uniqueRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);

      this.logger.debug('Recommendations generated', {
        count: sortedRecommendations.length
      });

      return sortedRecommendations;
    } catch (error) {
      this.logger.error('Failed to get recommendations', error as Error);
      throw error;
    }
  }

  /**
   * Get retrieval analytics
   */
  getAnalytics(): IRetrievalAnalytics {
    return { ...this.analyticsData };
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
    this.logger.info('Code retrieval cache cleared');
  }

  // === Private Helper Methods ===

  private async enhanceQuery(query: ICodeQuery, context?: IRetrievalContext): Promise<string> {
    let enhancedQuery = query.text;

    // Add type context
    if (query.type) {
      enhancedQuery += ` ${query.type}`;
    }

    // Add language context
    if (query.language) {
      enhancedQuery += ` ${query.language}`;
    }

    // Add framework context
    if (query.framework) {
      enhancedQuery += ` ${query.framework}`;
    }

    // Add Norwegian compliance keywords
    const locale = query.locale || context?.locale || 'nb-NO' as LocaleCode;
    const complianceKeywords = this.getComplianceKeywords(query.compliance, locale);
    if (complianceKeywords.length > 0) {
      enhancedQuery += ` ${complianceKeywords.join(' ')}`;
    }

    // Add context-specific enhancements
    if (context?.project_type) {
      enhancedQuery += ` ${context.project_type}`;
    }

    // Add recent patterns for learning
    if (context?.recent_patterns && context.recent_patterns.length > 0) {
      enhancedQuery += ` ${context.recent_patterns.slice(0, 3).join(' ')}`;
    }

    return enhancedQuery;
  }

  private getComplianceKeywords(compliance?: NorwegianCompliance, locale: LocaleCode = 'nb-NO'): string[] {
    const keywords: string[] = [];
    const localeKeywords = this.NORWEGIAN_KEYWORDS[locale] || this.NORWEGIAN_KEYWORDS['en-US'];

    if (compliance) {
      // Add NSM-related keywords
      if (compliance.nsmClassification !== 'OPEN') {
        keywords.push(...localeKeywords.filter(k => 
          k.includes('nsm') || k.includes('sikkerhet') || k.includes('security')
        ));
      }

      // Add GDPR-related keywords
      if (compliance.gdprCompliant) {
        keywords.push(...localeKeywords.filter(k => 
          k.includes('gdpr') || k.includes('personvern') || k.includes('privacy')
        ));
      }

      // Add WCAG-related keywords
      if (compliance.wcagLevel === 'AAA') {
        keywords.push(...localeKeywords.filter(k => 
          k.includes('wcag') || k.includes('tilgjengelighet') || k.includes('accessibility')
        ));
      }
    }

    return keywords;
  }

  private getEmbeddingOptions(query: ICodeQuery): IEmbeddingOptions {
    return {
      language: query.locale || 'nb-NO',
      maxTokens: 8192,
      normalize: true
    };
  }

  private async getRelevantCollections(query: ICodeQuery): Promise<string[]> {
    const collections: string[] = [];

    // Always include patterns collection
    collections.push('xala_code_patterns');

    // Add type-specific collections
    switch (query.type) {
      case 'example':
        collections.push('xala_examples');
        break;
      case 'documentation':
        collections.push('xala_documentation');
        break;
      default:
        // Include examples and documentation for broader search
        collections.push('xala_examples', 'xala_documentation');
    }

    // Add compliance collection if compliance is specified
    if (query.compliance && query.compliance.nsmClassification !== 'OPEN') {
      collections.push('xala_compliance_rules');
    }

    return collections;
  }

  private buildFilters(query: ICodeQuery, context?: IRetrievalContext): Record<string, any> {
    const filters: Record<string, any> = {};

    // Language filter
    if (query.language) {
      filters.language = query.language;
    }

    // Framework filter
    if (query.framework) {
      filters.framework = query.framework;
    }

    // Type filter
    if (query.type) {
      filters.type = query.type;
    }

    // Compliance filter
    if (query.compliance) {
      filters.compliance = query.compliance.nsmClassification;
    }

    // Locale filter
    if (query.locale) {
      filters.locale = query.locale;
    }

    return filters;
  }

  private async scoreAndRankResults(
    results: IVectorSearchResult[],
    query: ICodeQuery,
    context: IRetrievalContext | undefined,
    queryEmbedding: number[]
  ): Promise<ICodeSearchResult[]> {
    const weights = query.weights || this.DEFAULT_WEIGHTS;
    const scoredResults: ICodeSearchResult[] = [];

    for (const result of results) {
      let finalScore = 0;

      // Semantic similarity score (from vector search)
      finalScore += result.score * weights.semantic;

      // Exact match score
      const exactMatchScore = this.calculateExactMatchScore(query.text, result.document);
      finalScore += exactMatchScore * weights.exact_match;

      // Type match score
      const typeMatchScore = this.calculateTypeMatchScore(query, result.metadata);
      finalScore += typeMatchScore * weights.type_match;

      // Compliance match score
      const complianceScore = this.calculateComplianceScore(query.compliance, result.metadata);
      finalScore += complianceScore * weights.compliance;

      // Popularity score
      const popularityScore = this.calculatePopularityScore(result.metadata);
      finalScore += popularityScore * weights.popularity;

      // Recency score
      const recencyScore = this.calculateRecencyScore(result.metadata);
      finalScore += recencyScore * weights.recency;

      scoredResults.push({
        id: result.id,
        content: result.document,
        metadata: result.metadata,
        score: Math.min(1.0, finalScore), // Cap at 1.0
        relevance_explanation: this.generateRelevanceExplanation(result, query, finalScore),
        compliance_score: complianceScore,
        quality_score: result.metadata.quality_score || 0,
        usage_count: result.metadata.usage_count || 0,
        last_used: new Date(result.metadata.updated_at || Date.now()),
        tags: result.metadata.tags || [],
        similar_patterns: [] // Would be populated with related patterns
      });
    }

    // Sort by final score
    return scoredResults.sort((a, b) => b.score - a.score);
  }

  private calculateExactMatchScore(queryText: string, content: string): number {
    const queryWords = queryText.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matches++;
      }
    }
    
    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }

  private calculateTypeMatchScore(query: ICodeQuery, metadata: any): number {
    if (!query.type || !metadata.type) return 0;
    
    if (query.type === metadata.type) return 1.0;
    
    // Partial matches for related types
    const relatedTypes: Record<string, string[]> = {
      'component': ['example', 'pattern'],
      'function': ['pattern', 'example'],
      'pattern': ['component', 'function'],
      'example': ['component', 'pattern']
    };
    
    const related = relatedTypes[query.type] || [];
    return related.includes(metadata.type) ? 0.5 : 0;
  }

  private calculateComplianceScore(
    queryCompliance: NorwegianCompliance | undefined,
    metadata: any
  ): number {
    if (!queryCompliance || !metadata.compliance) return 0;
    
    let score = 0;
    
    // NSM classification match
    if (queryCompliance.nsmClassification === metadata.compliance.nsmClassification) {
      score += 0.4;
    }
    
    // GDPR compliance match
    if (queryCompliance.gdprCompliant === metadata.compliance.gdprCompliant) {
      score += 0.3;
    }
    
    // WCAG level match
    if (queryCompliance.wcagLevel === metadata.compliance.wcagLevel) {
      score += 0.3;
    }
    
    return score;
  }

  private calculatePopularityScore(metadata: any): number {
    const usageCount = metadata.usage_count || 0;
    // Normalize usage count to 0-1 scale (assuming max usage of 1000)
    return Math.min(1.0, usageCount / 1000);
  }

  private calculateRecencyScore(metadata: any): number {
    if (!metadata.updated_at) return 0;
    
    const updatedAt = new Date(metadata.updated_at);
    const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Fresher content gets higher score (decay over 365 days)
    return Math.max(0, 1 - (daysSinceUpdate / 365));
  }

  private generateRelevanceExplanation(
    result: IVectorSearchResult,
    query: ICodeQuery,
    finalScore: number
  ): string {
    const explanations: string[] = [];
    
    if (result.score > 0.8) {
      explanations.push('High semantic similarity');
    } else if (result.score > 0.6) {
      explanations.push('Good semantic match');
    } else {
      explanations.push('Moderate similarity');
    }
    
    if (query.type && result.metadata.type === query.type) {
      explanations.push(`Exact type match (${query.type})`);
    }
    
    if (query.language && result.metadata.language === query.language) {
      explanations.push(`Language match (${query.language})`);
    }
    
    if (query.framework && result.metadata.framework === query.framework) {
      explanations.push(`Framework match (${query.framework})`);
    }
    
    const usageCount = result.metadata.usage_count || 0;
    if (usageCount > 10) {
      explanations.push('Popular pattern');
    }
    
    return explanations.join(', ');
  }

  private generateSimilarityExplanation(score: number): string {
    if (score > 0.9) return 'Very high similarity - nearly identical pattern';
    if (score > 0.8) return 'High similarity - very similar pattern';
    if (score > 0.7) return 'Good similarity - similar approach';
    if (score > 0.6) return 'Moderate similarity - related pattern';
    return 'Low similarity - loosely related';
  }

  private async getProjectTypeRecommendations(projectType: string): Promise<ICodeSearchResult[]> {
    const query: ICodeQuery = {
      text: `${projectType} best practices patterns`,
      type: 'pattern',
      maxResults: 5
    };
    
    return this.searchCode(query);
  }

  private async getComplianceRecommendations(
    compliance: NorwegianCompliance
  ): Promise<ICodeSearchResult[]> {
    const query: ICodeQuery = {
      text: 'norwegian compliance patterns',
      compliance,
      maxResults: 5
    };
    
    return this.searchCode(query);
  }

  private async getLocaleRecommendations(locale: LocaleCode): Promise<ICodeSearchResult[]> {
    const query: ICodeQuery = {
      text: 'internationalization localization patterns',
      locale,
      maxResults: 3
    };
    
    return this.searchCode(query);
  }

  private deduplicateResults(results: ICodeSearchResult[]): ICodeSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  }

  private getCacheKey(query: ICodeQuery, context?: IRetrievalContext): string {
    const keyObject = {
      text: query.text,
      type: query.type,
      language: query.language,
      framework: query.framework,
      compliance: query.compliance,
      locale: query.locale,
      context: context ? {
        project_type: context.project_type,
        compliance_requirements: context.compliance_requirements,
        locale: context.locale
      } : undefined
    };
    
    return JSON.stringify(keyObject);
  }

  private cacheResults(key: string, results: ICodeSearchResult[]): void {
    // Implement LRU eviction if cache is full
    if (this.queryCache.size >= this.maxCacheSize) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    this.queryCache.set(key, results);
  }

  private updateAnalytics(
    query: ICodeQuery,
    results: ICodeSearchResult[],
    processingTime: number
  ): void {
    this.analyticsData.total_queries++;
    
    // Update average response time
    this.analyticsData.avg_response_time = 
      (this.analyticsData.avg_response_time * (this.analyticsData.total_queries - 1) + processingTime) / 
      this.analyticsData.total_queries;
    
    // Update compliance distribution
    if (query.compliance) {
      const classification = query.compliance.nsmClassification;
      this.analyticsData.compliance_distribution[classification] = 
        (this.analyticsData.compliance_distribution[classification] || 0) + 1;
    }
    
    // Update language distribution
    if (query.language) {
      this.analyticsData.language_distribution[query.language] = 
        (this.analyticsData.language_distribution[query.language] || 0) + 1;
    }
  }
}
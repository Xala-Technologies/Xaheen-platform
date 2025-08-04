import { BaseGenerator } from '../base.generator.js';
import type { SemanticSearchOptions } from './types.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class SemanticSearchGenerator extends BaseGenerator<SemanticSearchOptions> {
  async generate(options: SemanticSearchOptions): Promise<void> {
    await this.validateOptions(options);
    
    this.logger.info(`Generating semantic search service: ${options.name}`);
    
    try {
      // Generate main semantic search service
      await this.generateSemanticSearchService(options);
      
      // Generate types
      await this.generateTypes(options);
      
      // Generate document processor
      await this.generateDocumentProcessor(options);
      
      // Generate embedding service
      await this.generateEmbeddingService(options);
      
      // Generate search features
      await this.generateSearchFeatures(options);
      
      // Generate reranking if enabled
      if (options.includeReranking) {
        await this.generateReranking(options);
      }
      
      // Generate filtering if enabled
      if (options.includeFiltering) {
        await this.generateAdvancedFiltering(options);
      }
      
      // Generate utilities
      await this.generateUtilities(options);
      
      // Generate tests
      await this.generateTests(options);
      
      // Generate configuration
      await this.generateConfig(options);
      
      this.logger.success(`Semantic search service generated successfully at ${options.outputPath}`);
    } catch (error) {
      this.logger.error('Failed to generate semantic search service', error);
      throw error;
    }
  }

  protected async validateOptions(options: SemanticSearchOptions): Promise<void> {
    if (!options.name || !options.outputPath) {
      throw new Error('Name and output path are required');
    }
    
    if (!options.vectorProvider || !options.embeddingProvider) {
      throw new Error('Vector and embedding providers are required');
    }
    
    if (!options.features || options.features.length === 0) {
      throw new Error('At least one semantic search feature must be specified');
    }
  }

  private async generateSemanticSearchService(options: SemanticSearchOptions): Promise<void> {
    const serviceContent = `import type { 
  SearchQuery,
  SearchResult,
  SearchOptions,
  DocumentChunk,
  SemanticSearchConfig,
  SearchAnalytics
} from './types.js';
import { DocumentProcessor } from './document-processor.js';
import { EmbeddingService } from './embedding.service.js';
import { VectorSearchService } from './vector-search.service.js';
${options.includeReranking ? "import { RerankerService } from './reranker.service.js';" : ''}
${options.includeFiltering ? "import { FilterService } from './filter.service.js';" : ''}
import { SearchAnalyzer } from './utils/search-analyzer.js';
import { QueryOptimizer } from './utils/query-optimizer.js';

export class ${options.name}Service {
  private readonly documentProcessor: DocumentProcessor;
  private readonly embeddingService: EmbeddingService;
  private readonly vectorSearch: VectorSearchService;
  ${options.includeReranking ? 'private readonly reranker: RerankerService;' : ''}
  ${options.includeFiltering ? 'private readonly filterService: FilterService;' : ''}
  private readonly searchAnalyzer: SearchAnalyzer;
  private readonly queryOptimizer: QueryOptimizer;

  constructor(private readonly config: SemanticSearchConfig) {
    this.documentProcessor = new DocumentProcessor(config.documentProcessing);
    this.embeddingService = new EmbeddingService(config.embedding);
    this.vectorSearch = new VectorSearchService(config.vectorDatabase);
    ${options.includeReranking ? 'this.reranker = new RerankerService(config.reranking);' : ''}
    ${options.includeFiltering ? 'this.filterService = new FilterService(config.filtering);' : ''}
    this.searchAnalyzer = new SearchAnalyzer(config.analytics);
    this.queryOptimizer = new QueryOptimizer(config.queryOptimization);
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.embeddingService.initialize(),
      this.vectorSearch.initialize(),
      ${options.includeReranking ? 'this.reranker.initialize(),' : ''}
    ]);
    
    this.logger.info('Semantic search service initialized');
  }

  ${options.features.includes('document-chunking') ? this.generateDocumentIndexingMethod() : ''}

  ${options.features.includes('vector-search') ? this.generateVectorSearchMethod() : ''}

  ${options.features.includes('hybrid-search') ? this.generateHybridSearchMethod() : ''}

  ${options.features.includes('semantic-similarity') ? this.generateSemanticSimilarityMethod() : ''}

  ${options.features.includes('auto-complete') ? this.generateAutoCompleteMethod() : ''}

  ${options.features.includes('faceted-search') ? this.generateFacetedSearchMethod() : ''}

  async search(
    query: SearchQuery,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    
    try {
      // Optimize the query
      const optimizedQuery = await this.queryOptimizer.optimize(query, options);
      
      // Generate embeddings for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        optimizedQuery.text
      );
      
      // Perform vector search
      let results = await this.vectorSearch.search(queryEmbedding, {
        topK: (options.topK || 10) * (options.diversityFactor ? 2 : 1),
        filter: options.filter,
        includeMetadata: true
      });
      
      ${options.features.includes('hybrid-search') ? `
      // Perform hybrid search if text search is available
      if (optimizedQuery.expandedTerms && optimizedQuery.expandedTerms.length > 0) {
        const textResults = await this.vectorSearch.textSearch(
          optimizedQuery.expandedTerms.join(' '),
          { topK: options.topK || 10 }
        );
        
        results = this.fuseResults(results, textResults, options);
      }` : ''}
      
      ${options.includeFiltering ? `
      // Apply advanced filtering
      if (options.advancedFilter) {
        results = await this.filterService.applyFilters(results, options.advancedFilter);
      }` : ''}
      
      ${options.includeReranking ? `
      // Apply reranking
      if (options.enableReranking && results.length > 1) {
        results = await this.reranker.rerank(optimizedQuery.text, results);
      }` : ''}
      
      // Apply post-processing
      results = this.postProcessResults(results, options);
      
      // Record analytics
      await this.recordSearchAnalytics(query, results, Date.now() - startTime);
      
      return results.slice(0, options.topK || 10);
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }

  async indexDocument(
    documentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Process the document into chunks
      const chunks = await this.documentProcessor.processDocument(content, {
        documentId,
        ...metadata
      });
      
      // Generate embeddings for each chunk
      const embeddedChunks = await Promise.all(
        chunks.map(async (chunk) => ({
          ...chunk,
          embedding: await this.embeddingService.generateEmbedding(chunk.content)
        }))
      );
      
      // Index the chunks in the vector database
      await this.vectorSearch.indexChunks(embeddedChunks);
      
      this.logger.info(\`Document \${documentId} indexed with \${chunks.length} chunks\`);
    } catch (error) {
      this.logger.error(\`Failed to index document \${documentId}:\`, error);
      throw error;
    }
  }

  async indexDocuments(
    documents: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    const batchSize = this.config.indexing?.batchSize || 10;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(doc => 
          this.indexDocument(doc.id, doc.content, doc.metadata)
        )
      );
      
      this.logger.info(\`Processed batch \${Math.floor(i / batchSize) + 1}/\${Math.ceil(documents.length / batchSize)}\`);
      
      // Add delay between batches
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.vectorSearch.deleteDocument(documentId);
    this.logger.info(\`Document \${documentId} deleted\`);
  }

  async updateDocument(
    documentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.deleteDocument(documentId);
    await this.indexDocument(documentId, content, metadata);
    this.logger.info(\`Document \${documentId} updated\`);
  }

  async getSearchAnalytics(
    timeRange: { start: Date; end: Date }
  ): Promise<SearchAnalytics> {
    return this.searchAnalyzer.getAnalytics(timeRange);
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    latency: number;
  }> {
    const start = Date.now();
    const services: Record<string, boolean> = {};
    
    try {
      services.embedding = await this.embeddingService.healthCheck();
      services.vectorSearch = await this.vectorSearch.healthCheck();
      ${options.includeReranking ? 'services.reranker = await this.reranker.healthCheck();' : ''}
      
      const allHealthy = Object.values(services).every(status => status);
      const someHealthy = Object.values(services).some(status => status);
      
      return {
        status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
        services,
        latency: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services,
        latency: Date.now() - start
      };
    }
  }

  private postProcessResults(
    results: SearchResult[],
    options: SearchOptions
  ): SearchResult[] {
    let processed = results;
    
    // Apply score threshold
    if (options.scoreThreshold) {
      processed = processed.filter(r => r.score >= options.scoreThreshold!);
    }
    
    // Apply diversity filtering
    if (options.diversityFactor && options.diversityFactor > 0) {
      processed = this.applyDiversityFilter(processed, options.diversityFactor);
    }
    
    // Apply result grouping
    if (options.groupBy) {
      processed = this.groupResults(processed, options.groupBy);
    }
    
    return processed;
  }

  private applyDiversityFilter(
    results: SearchResult[],
    diversityFactor: number
  ): SearchResult[] {
    // Implement Maximum Marginal Relevance (MMR)
    const diverseResults: SearchResult[] = [];
    const remaining = [...results];
    
    if (remaining.length > 0) {
      diverseResults.push(remaining.shift()!);
    }
    
    while (remaining.length > 0 && diverseResults.length < results.length) {
      let bestIndex = 0;
      let bestScore = -Infinity;
      
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const relevanceScore = candidate.score;
        
        // Calculate max similarity to already selected results
        const maxSimilarity = Math.max(
          ...diverseResults.map(selected => 
            this.calculateSimilarity(candidate, selected)
          )
        );
        
        const mmrScore = 
          diversityFactor * relevanceScore - 
          (1 - diversityFactor) * maxSimilarity;
        
        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIndex = i;
        }
      }
      
      diverseResults.push(remaining.splice(bestIndex, 1)[0]);
    }
    
    return diverseResults;
  }

  private groupResults(
    results: SearchResult[],
    groupBy: string
  ): SearchResult[] {
    const groups = new Map<string, SearchResult[]>();
    
    results.forEach(result => {
      const groupKey = result.metadata[groupBy] as string || 'unknown';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(result);
    });
    
    const grouped: SearchResult[] = [];
    groups.forEach(groupResults => {
      grouped.push(...groupResults.slice(0, 3)); // Max 3 per group
    });
    
    return grouped.sort((a, b) => b.score - a.score);
  }

  private calculateSimilarity(a: SearchResult, b: SearchResult): number {
    // Simple similarity based on shared metadata tags
    const tagsA = (a.metadata.tags as string[]) || [];
    const tagsB = (b.metadata.tags as string[]) || [];
    
    const intersection = tagsA.filter(tag => tagsB.includes(tag));
    const union = [...new Set([...tagsA, ...tagsB])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private fuseResults(
    vectorResults: SearchResult[],
    textResults: SearchResult[],
    options: SearchOptions
  ): SearchResult[] {
    // Implement Reciprocal Rank Fusion (RRF)
    const k = 60;
    const scoreMap = new Map<string, number>();
    const resultMap = new Map<string, SearchResult>();
    
    vectorResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);
      resultMap.set(result.id, result);
    });
    
    textResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);
      if (!resultMap.has(result.id)) {
        resultMap.set(result.id, result);
      }
    });
    
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({
        ...resultMap.get(id)!,
        score
      }));
  }

  private async recordSearchAnalytics(
    query: SearchQuery,
    results: SearchResult[],
    latency: number
  ): Promise<void> {
    await this.searchAnalyzer.recordSearch({
      query: query.text,
      resultCount: results.length,
      latency,
      timestamp: new Date(),
      filters: query.filters,
      topScore: results[0]?.score || 0
    });
  }
}`;

    await this.ensureDirectoryExists(options.outputPath);
    await fs.writeFile(
      join(options.outputPath, `${options.name.toLowerCase()}.service.ts`),
      serviceContent
    );
  }

  private generateDocumentIndexingMethod(): string {
    return `
  async indexDocument(
    documentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const chunks = await this.documentProcessor.processDocument(content, {
      documentId,
      ...metadata
    });
    
    const embeddedChunks = await Promise.all(
      chunks.map(async (chunk) => ({
        ...chunk,
        embedding: await this.embeddingService.generateEmbedding(chunk.content)
      }))
    );
    
    await this.vectorSearch.indexChunks(embeddedChunks);
  }`;
  }

  private generateVectorSearchMethod(): string {
    return `
  async vectorSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    return this.vectorSearch.search(queryEmbedding, {
      topK: options.topK || 10,
      filter: options.filter,
      includeMetadata: true
    });
  }`;
  }

  private generateHybridSearchMethod(): string {
    return `
  async hybridSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const [vectorResults, textResults] = await Promise.all([
      this.vectorSearch(query, { ...options, topK: (options.topK || 10) * 2 }),
      this.vectorSearch.textSearch(query, { topK: options.topK || 10 })
    ]);
    
    return this.fuseResults(vectorResults, textResults, options);
  }`;
  }

  private generateSemanticSimilarityMethod(): string {
    return `
  async findSimilarDocuments(
    documentId: string,
    options: { topK?: number; excludeOriginal?: boolean } = {}
  ): Promise<SearchResult[]> {
    const document = await this.vectorSearch.getDocument(documentId);
    if (!document || !document.embedding) {
      throw new Error(\`Document \${documentId} not found or has no embedding\`);
    }
    
    const results = await this.vectorSearch.search(document.embedding, {
      topK: (options.topK || 10) + (options.excludeOriginal ? 1 : 0),
      filter: options.excludeOriginal ? { id: { $ne: documentId } } : undefined
    });
    
    return options.excludeOriginal ? results.slice(1) : results;
  }`;
  }

  private generateAutoCompleteMethod(): string {
    return `
  async getAutocompleteSuggestions(
    partialQuery: string,
    options: { maxSuggestions?: number } = {}
  ): Promise<string[]> {
    if (partialQuery.length < 2) {
      return [];
    }
    
    // Get embeddings for partial query
    const queryEmbedding = await this.embeddingService.generateEmbedding(partialQuery);
    
    // Search for similar content
    const results = await this.vectorSearch.search(queryEmbedding, {
      topK: 50,
      includeMetadata: true
    });
    
    // Extract potential completions from metadata
    const suggestions = new Set<string>();
    
    results.forEach(result => {
      const content = result.metadata.content as string || '';
      const words = content.toLowerCase().split(/\\s+/);
      
      words.forEach((word, index) => {
        if (word.startsWith(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
          suggestions.add(word);
        }
        
        // Look for phrases starting with the partial query
        if (index < words.length - 1) {
          const phrase = \`\${word} \${words[index + 1]}\`;
          if (phrase.startsWith(partialQuery.toLowerCase())) {
            suggestions.add(phrase);
          }
        }
      });
    });
    
    return Array.from(suggestions)
      .slice(0, options.maxSuggestions || 10)
      .sort((a, b) => a.length - b.length);
  }`;
  }

  private generateFacetedSearchMethod(): string {
    return `
  async facetedSearch(
    query: string,
    facets: string[],
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    facetCounts: Record<string, Record<string, number>>;
  }> {
    const results = await this.search({ text: query }, options);
    
    const facetCounts: Record<string, Record<string, number>> = {};
    
    facets.forEach(facet => {
      facetCounts[facet] = {};
      
      results.forEach(result => {
        const facetValue = result.metadata[facet] as string;
        if (facetValue) {
          facetCounts[facet][facetValue] = (facetCounts[facet][facetValue] || 0) + 1;
        }
      });
      
      // Sort facet values by count
      const sortedEntries = Object.entries(facetCounts[facet])
        .sort(([, a], [, b]) => b - a);
      
      facetCounts[facet] = Object.fromEntries(sortedEntries);
    });
    
    return { results, facetCounts };
  }`;
  }

  private async generateTypes(options: SemanticSearchOptions): Promise<void> {
    const typesContent = `export interface SemanticSearchConfig {
  readonly vectorDatabase: VectorDatabaseConfig;
  readonly embedding: EmbeddingConfig;
  readonly documentProcessing?: DocumentProcessingConfig;
  readonly reranking?: RerankingConfig;
  readonly filtering?: FilteringConfig;
  readonly analytics?: AnalyticsConfig;
  readonly queryOptimization?: QueryOptimizationConfig;
  readonly indexing?: IndexingConfig;
}

export interface VectorDatabaseConfig {
  readonly provider: '${options.vectorProvider}';
  readonly apiKey: string;
  readonly environment?: string;
  readonly dimension: number;
  readonly metric?: 'cosine' | 'euclidean' | 'dotproduct';
}

export interface EmbeddingConfig {
  readonly provider: '${options.embeddingProvider}';
  readonly apiKey: string;
  readonly model?: string;
  readonly batchSize?: number;
  readonly timeout?: number;
}

export interface DocumentProcessingConfig {
  readonly chunkSize: number;
  readonly chunkOverlap: number;
  readonly separators: string[];
  readonly preserveStructure: boolean;
  readonly extractMetadata: boolean;
}

export interface RerankingConfig {
  readonly provider: 'cohere' | 'cross-encoder' | 'custom';
  readonly model?: string;
  readonly topK?: number;
  readonly threshold?: number;
}

export interface FilteringConfig {
  readonly enableMetadataFiltering: boolean;
  readonly enableSemanticFiltering: boolean;
  readonly customFilters?: Record<string, any>;
}

export interface AnalyticsConfig {
  readonly enabled: boolean;
  readonly storage: 'memory' | 'database' | 'file';
  readonly retentionDays: number;
}

export interface QueryOptimizationConfig {
  readonly enableExpansion: boolean;
  readonly enableSynonyms: boolean;
  readonly enableSpellCheck: boolean;
  readonly maxExpansionTerms: number;
}

export interface IndexingConfig {
  readonly batchSize: number;
  readonly retryAttempts: number;
  readonly parallelProcessing: boolean;
}

export interface SearchQuery {
  readonly text: string;
  readonly filters?: Record<string, any>;
  readonly expandedTerms?: string[];
  readonly synonyms?: string[];
  readonly originalText?: string;
}

export interface SearchOptions {
  readonly topK?: number;
  readonly scoreThreshold?: number;
  readonly filter?: Record<string, any>;
  readonly advancedFilter?: AdvancedFilter;
  readonly enableReranking?: boolean;
  readonly diversityFactor?: number;
  readonly groupBy?: string;
  readonly includeMetadata?: boolean;
  readonly includeContent?: boolean;
}

export interface SearchResult {
  readonly id: string;
  readonly score: number;
  readonly content?: string;
  readonly metadata: Record<string, any>;
  readonly highlights?: string[];
  readonly chunkIndex?: number;
  readonly documentId?: string;
}

export interface DocumentChunk {
  readonly id: string;
  readonly documentId: string;
  readonly content: string;
  readonly metadata: Record<string, any>;
  readonly chunkIndex: number;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly embedding?: number[];
}

export interface AdvancedFilter {
  readonly must?: FilterCondition[];
  readonly should?: FilterCondition[];
  readonly mustNot?: FilterCondition[];
  readonly range?: Record<string, { gte?: number; lte?: number; gt?: number; lt?: number }>;
  readonly exists?: string[];
  readonly missing?: string[];
}

export interface FilterCondition {
  readonly field: string;
  readonly operator: 'eq' | 'ne' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  readonly value: any;
}

export interface SearchAnalytics {
  readonly totalSearches: number;
  readonly avgLatency: number;
  readonly topQueries: Array<{
    query: string;
    count: number;
    avgScore: number;
    avgLatency: number;
  }>;
  readonly clickThroughRate: number;
  readonly zeroResultQueries: string[];
  readonly performanceMetrics: {
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
  };
}

export interface SearchEvent {
  readonly query: string;
  readonly resultCount: number;
  readonly latency: number;
  readonly timestamp: Date;
  readonly filters?: Record<string, any>;
  readonly topScore: number;
  readonly userId?: string;
  readonly sessionId?: string;
}

export interface FacetResult {
  readonly results: SearchResult[];
  readonly facetCounts: Record<string, Record<string, number>>;
}

export interface SimilarityResult {
  readonly documentId: string;
  readonly similarity: number;
  readonly sharedConcepts: string[];
  readonly metadata: Record<string, any>;
}

export interface AutocompleteOptions {
  readonly maxSuggestions?: number;
  readonly minQueryLength?: number;
  readonly includePopular?: boolean;
  readonly contextFilters?: Record<string, any>;
}`;

    await fs.writeFile(join(options.outputPath, 'types.ts'), typesContent);
  }

  private async generateDocumentProcessor(options: SemanticSearchOptions): Promise<void> {
    const processorContent = `import type { DocumentChunk, DocumentProcessingConfig } from './types.js';

export class DocumentProcessor {
  private readonly config: DocumentProcessingConfig;

  constructor(config?: DocumentProcessingConfig) {
    this.config = {
      chunkSize: 500,
      chunkOverlap: 50,
      separators: ['\\n\\n', '\\n', '. ', '! ', '? ', ' '],
      preserveStructure: true,
      extractMetadata: true,
      ...config
    };
  }

  async processDocument(
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<DocumentChunk[]> {
    try {
      // Clean and normalize content
      const cleanContent = this.cleanContent(content);
      
      // Extract document metadata if enabled
      const documentMetadata = this.config.extractMetadata 
        ? await this.extractMetadata(cleanContent, metadata)
        : metadata;
      
      // Split content into chunks
      const chunks = this.config.preserveStructure
        ? this.structuredChunking(cleanContent)
        : this.simpleChunking(cleanContent);
      
      // Create document chunks with metadata
      return chunks.map((chunk, index) => ({
        id: \`\${metadata.documentId || 'doc'}_chunk_\${index}\`,
        documentId: metadata.documentId || 'unknown',
        content: chunk.text,
        metadata: {
          ...documentMetadata,
          chunkType: chunk.type,
          wordCount: chunk.text.split(/\\s+/).length,
          characterCount: chunk.text.length
        },
        chunkIndex: index,
        startOffset: chunk.startOffset,
        endOffset: chunk.endOffset
      }));
    } catch (error) {
      throw new Error(\`Document processing failed: \${error}\`);
    }
  }

  private cleanContent(content: string): string {
    return content
      // Remove excessive whitespace
      .replace(/\\s+/g, ' ')
      // Remove special characters that might interfere with processing
      .replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F-\\x9F]/g, '')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Trim
      .trim();
  }

  private async extractMetadata(
    content: string,
    existingMetadata: Record<string, any>
  ): Promise<Record<string, any>> {
    const metadata = { ...existingMetadata };
    
    // Extract basic statistics
    metadata.wordCount = content.split(/\\s+/).length;
    metadata.characterCount = content.length;
    metadata.paragraphCount = content.split(/\\n\\s*\\n/).length;
    
    // Extract language (simple heuristic)
    metadata.language = this.detectLanguage(content);
    
    // Extract key phrases (simple implementation)
    metadata.keyPhrases = this.extractKeyPhrases(content);
    
    // Extract entities (placeholder - would use NER in production)
    metadata.entities = this.extractEntities(content);
    
    return metadata;
  }

  private structuredChunking(content: string): Array<{
    text: string;
    type: string;
    startOffset: number;
    endOffset: number;
  }> {
    const chunks: Array<{
      text: string;
      type: string;
      startOffset: number;
      endOffset: number;
    }> = [];
    
    // Split by paragraphs first
    const paragraphs = content.split(/\\n\\s*\\n/);
    let currentOffset = 0;
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) {
        currentOffset += paragraph.length + 2; // Account for newlines
        continue;
      }
      
      const paragraphType = this.classifyParagraph(paragraph);
      
      if (paragraph.length <= this.config.chunkSize) {
        // Small paragraph, use as-is
        chunks.push({
          text: paragraph.trim(),
          type: paragraphType,
          startOffset: currentOffset,
          endOffset: currentOffset + paragraph.length
        });
      } else {
        // Large paragraph, split further
        const subChunks = this.splitLargeParagraph(paragraph, currentOffset);
        chunks.push(...subChunks.map(chunk => ({ ...chunk, type: paragraphType })));
      }
      
      currentOffset += paragraph.length + 2;
    }
    
    return chunks;
  }

  private simpleChunking(content: string): Array<{
    text: string;
    type: string;
    startOffset: number;
    endOffset: number;
  }> {
    const chunks: Array<{
      text: string;
      type: string;
      startOffset: number;
      endOffset: number;
    }> = [];
    
    const words = content.split(/\\s+/);
    let currentChunk = '';
    let chunkStartOffset = 0;
    let currentOffset = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testChunk = currentChunk ? \`\${currentChunk} \${word}\` : word;
      
      if (testChunk.length > this.config.chunkSize && currentChunk) {
        // Current chunk is full, start a new one
        chunks.push({
          text: currentChunk.trim(),
          type: 'text',
          startOffset: chunkStartOffset,
          endOffset: currentOffset
        });
        
        // Start new chunk with overlap
        const overlapWords = currentChunk.split(/\\s+/).slice(-this.config.chunkOverlap);
        currentChunk = [...overlapWords, word].join(' ');
        chunkStartOffset = currentOffset - overlapWords.join(' ').length;
      } else {
        currentChunk = testChunk;
        if (i === 0) {
          chunkStartOffset = currentOffset;
        }
      }
      
      currentOffset += word.length + 1; // +1 for space
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        type: 'text',
        startOffset: chunkStartOffset,
        endOffset: currentOffset
      });
    }
    
    return chunks;
  }

  private splitLargeParagraph(
    paragraph: string,
    startOffset: number
  ): Array<{
    text: string;
    startOffset: number;
    endOffset: number;
  }> {
    const chunks: Array<{
      text: string;
      startOffset: number;
      endOffset: number;
    }> = [];
    
    // Try to split by sentences first
    const sentences = this.splitSentences(paragraph);
    let currentChunk = '';
    let chunkStartOffset = startOffset;
    let currentOffset = startOffset;
    
    for (const sentence of sentences) {
      const testChunk = currentChunk ? \`\${currentChunk} \${sentence}\` : sentence;
      
      if (testChunk.length > this.config.chunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          startOffset: chunkStartOffset,
          endOffset: currentOffset
        });
        
        currentChunk = sentence;
        chunkStartOffset = currentOffset;
      } else {
        currentChunk = testChunk;
        if (!chunks.length && !currentChunk.includes(sentence)) {
          chunkStartOffset = currentOffset;
        }
      }
      
      currentOffset += sentence.length + 1;
    }
    
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        startOffset: chunkStartOffset,
        endOffset: currentOffset
      });
    }
    
    return chunks;
  }

  private splitSentences(text: string): string[] {
    // Simple sentence splitting - in production, use a proper NLP library
    return text
      .split(/(?<=[.!?])\\s+/)
      .filter(sentence => sentence.trim().length > 0);
  }

  private classifyParagraph(paragraph: string): string {
    const text = paragraph.toLowerCase().trim();
    
    // Simple heuristics for paragraph classification
    if (text.match(/^(chapter|section|\\d+\\.|#)/)) {
      return 'header';
    } else if (text.length < 50) {
      return 'short';
    } else if (text.includes('```') || text.includes('function') || text.includes('class')) {
      return 'code';
    } else if (text.match(/^\\s*[-*]\\s/)) {
      return 'list';
    } else {
      return 'paragraph';
    }
  }

  private detectLanguage(content: string): string {
    // Very simple language detection - in production, use a proper library
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const words = content.toLowerCase().split(/\\s+/).slice(0, 100);
    
    const englishMatches = words.filter(word => englishWords.includes(word)).length;
    
    return englishMatches > words.length * 0.1 ? 'en' : 'unknown';
  }

  private extractKeyPhrases(content: string): string[] {
    // Simple key phrase extraction - in production, use TF-IDF or more advanced methods
    const words = content.toLowerCase()
      .split(/\\s+/)
      .filter(word => word.length > 3 && !/^(the|and|is|in|to|of|a|that|it|with|for|as|was|are|been|have|has|had|will|would|could|should)$/.test(word));
    
    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractEntities(content: string): Array<{ text: string; type: string }> {
    // Placeholder for entity extraction - in production, use NER
    const entities: Array<{ text: string; type: string }> = [];
    
    // Simple regex patterns for common entities
    const patterns = {
      email: /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g,
      url: /https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/g,
      phone: /\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b/g,
      date: /\\b\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}\\b/g
    };
    
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        entities.push({ text: match, type });
      });
    });
    
    return entities;
  }
}`;

    await fs.writeFile(join(options.outputPath, 'document-processor.ts'), processorContent);
  }

  private async generateEmbeddingService(options: SemanticSearchOptions): Promise<void> {
    const embeddingContent = `import type { EmbeddingConfig } from './types.js';

export class EmbeddingService {
  private client: any;
  private readonly config: EmbeddingConfig;

  constructor(config: EmbeddingConfig) {
    this.config = {
      batchSize: 100,
      timeout: 30000,
      ...config
    };
    
    this.initializeClient();
  }

  async initialize(): Promise<void> {
    // Test the embedding service
    try {
      await this.generateEmbedding('test');
    } catch (error) {
      throw new Error(\`Failed to initialize embedding service: \${error}\`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text?.trim()) {
      throw new Error('Text cannot be empty');
    }

    try {
      switch (this.config.provider) {
        case 'openai':
          return this.generateOpenAIEmbedding(text);
        case 'cohere':
          return this.generateCohereEmbedding(text);
        case 'sentence-transformers':
          return this.generateSentenceTransformerEmbedding(text);
        default:
          throw new Error(\`Unsupported embedding provider: \${this.config.provider}\`);
      }
    } catch (error) {
      throw new Error(\`Embedding generation failed: \${error}\`);
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const validTexts = texts.filter(text => text?.trim());
    if (validTexts.length === 0) {
      throw new Error('No valid texts provided');
    }

    try {
      // Process in batches
      const batches = this.createBatches(validTexts, this.config.batchSize);
      const results: number[][] = [];

      for (const batch of batches) {
        const batchEmbeddings = await this.processBatch(batch);
        results.push(...batchEmbeddings);
      }

      return results;
    } catch (error) {
      throw new Error(\`Batch embedding generation failed: \${error}\`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.generateEmbedding('health check');
      return true;
    } catch {
      return false;
    }
  }

  private initializeClient(): void {
    switch (this.config.provider) {
      case 'openai':
        // Dynamic import in actual implementation
        this.client = {
          apiKey: this.config.apiKey,
          model: this.config.model || 'text-embedding-3-small'
        };
        break;
      case 'cohere':
        this.client = {
          apiKey: this.config.apiKey,
          model: this.config.model || 'embed-english-v2.0'
        };
        break;
      case 'sentence-transformers':
        this.client = {
          model: this.config.model || 'all-MiniLM-L6-v2'
        };
        break;
      default:
        throw new Error(\`Unsupported embedding provider: \${this.config.provider}\`);
    }
  }

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    // Placeholder - implement actual OpenAI API call
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.client.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.client.model,
        input: text,
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(\`OpenAI API error: \${response.statusText}\`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async generateCohereEmbedding(text: string): Promise<number[]> {
    // Placeholder - implement actual Cohere API call
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.client.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.client.model,
        texts: [text]
      })
    });

    if (!response.ok) {
      throw new Error(\`Cohere API error: \${response.statusText}\`);
    }

    const data = await response.json();
    return data.embeddings[0];
  }

  private async generateSentenceTransformerEmbedding(text: string): Promise<number[]> {
    // Placeholder - in production, this would call a local or hosted sentence-transformers service
    throw new Error('Sentence transformers embedding not implemented');
  }

  private async processBatch(texts: string[]): Promise<number[][]> {
    switch (this.config.provider) {
      case 'openai':
        return this.processOpenAIBatch(texts);
      case 'cohere':
        return this.processCohereEmbedding(texts);
      default:
        // Fallback to individual processing
        const embeddings: number[][] = [];
        for (const text of texts) {
          const embedding = await this.generateEmbedding(text);
          embeddings.push(embedding);
        }
        return embeddings;
    }
  }

  private async processOpenAIBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.client.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.client.model,
        input: texts,
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(\`OpenAI API error: \${response.statusText}\`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  private async processCohereEmbedding(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.client.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.client.model,
        texts
      })
    });

    if (!response.ok) {
      throw new Error(\`Cohere API error: \${response.statusText}\`);
    }

    const data = await response.json();
    return data.embeddings;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}`;

    await fs.writeFile(join(options.outputPath, 'embedding.service.ts'), embeddingContent);
  }

  private async generateUtilities(options: SemanticSearchOptions): Promise<void> {
    await this.generateSearchAnalyzer(options);
    await this.generateQueryOptimizer(options);
  }

  private async generateSearchAnalyzer(options: SemanticSearchOptions): Promise<void> {
    const analyzerContent = `import type { SearchEvent, SearchAnalytics, AnalyticsConfig } from '../types.js';

export class SearchAnalyzer {
  private events: SearchEvent[] = [];
  private readonly config: AnalyticsConfig;

  constructor(config?: AnalyticsConfig) {
    this.config = {
      enabled: true,
      storage: 'memory',
      retentionDays: 30,
      ...config
    };
  }

  async recordSearch(event: SearchEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    this.events.push(event);
    
    // Clean old events
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);
  }

  async getAnalytics(timeRange: { start: Date; end: Date }): Promise<SearchAnalytics> {
    const filteredEvents = this.events.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    if (filteredEvents.length === 0) {
      return this.getEmptyAnalytics();
    }

    return {
      totalSearches: filteredEvents.length,
      avgLatency: this.calculateAvgLatency(filteredEvents),
      topQueries: this.getTopQueries(filteredEvents),
      clickThroughRate: this.calculateClickThroughRate(filteredEvents),
      zeroResultQueries: this.getZeroResultQueries(filteredEvents),
      performanceMetrics: this.getPerformanceMetrics(filteredEvents)
    };
  }

  private calculateAvgLatency(events: SearchEvent[]): number {
    const totalLatency = events.reduce((sum, event) => sum + event.latency, 0);
    return totalLatency / events.length;
  }

  private getTopQueries(events: SearchEvent[]): Array<{
    query: string;
    count: number;
    avgScore: number;
    avgLatency: number;
  }> {
    const queryStats = new Map<string, {
      count: number;
      totalScore: number;
      totalLatency: number;
    }>();

    events.forEach(event => {
      const existing = queryStats.get(event.query) || { count: 0, totalScore: 0, totalLatency: 0 };
      queryStats.set(event.query, {
        count: existing.count + 1,
        totalScore: existing.totalScore + event.topScore,
        totalLatency: existing.totalLatency + event.latency
      });
    });

    return Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgScore: stats.totalScore / stats.count,
        avgLatency: stats.totalLatency / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateClickThroughRate(events: SearchEvent[]): number {
    // Placeholder - would need click tracking data
    return 0.65; // Default CTR
  }

  private getZeroResultQueries(events: SearchEvent[]): string[] {
    return events
      .filter(event => event.resultCount === 0)
      .map(event => event.query)
      .slice(0, 20);
  }

  private getPerformanceMetrics(events: SearchEvent[]): {
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
  } {
    const latencies = events.map(e => e.latency).sort((a, b) => a - b);
    
    return {
      p50Latency: latencies[Math.floor(latencies.length * 0.5)],
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      errorRate: 0 // Would calculate from error events
    };
  }

  private getEmptyAnalytics(): SearchAnalytics {
    return {
      totalSearches: 0,
      avgLatency: 0,
      topQueries: [],
      clickThroughRate: 0,
      zeroResultQueries: [],
      performanceMetrics: {
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0
      }
    };
  }
}`;

    const utilsDir = join(options.outputPath, 'utils');
    await this.ensureDirectoryExists(utilsDir);
    await fs.writeFile(join(utilsDir, 'search-analyzer.ts'), analyzerContent);
  }

  private async generateQueryOptimizer(options: SemanticSearchOptions): Promise<void> {
    const optimizerContent = `import type { SearchQuery, SearchOptions, QueryOptimizationConfig } from '../types.js';

export class QueryOptimizer {
  private readonly config: QueryOptimizationConfig;
  private synonyms: Map<string, string[]> = new Map();

  constructor(config?: QueryOptimizationConfig) {
    this.config = {
      enableExpansion: true,
      enableSynonyms: true,
      enableSpellCheck: false,
      maxExpansionTerms: 5,
      ...config
    };

    this.initializeSynonyms();
  }

  async optimize(query: SearchQuery, options: SearchOptions): Promise<SearchQuery> {
    let optimizedText = query.text.trim();
    let expandedTerms: string[] = [];
    let synonyms: string[] = [];

    // Apply spell checking if enabled
    if (this.config.enableSpellCheck) {
      optimizedText = await this.correctSpelling(optimizedText);
    }

    // Extract and expand key terms
    if (this.config.enableExpansion) {
      expandedTerms = await this.expandQuery(optimizedText);
    }

    // Add synonyms if enabled
    if (this.config.enableSynonyms) {
      synonyms = this.findSynonyms(optimizedText);
    }

    return {
      ...query,
      text: optimizedText,
      expandedTerms,
      synonyms,
      originalText: query.text !== optimizedText ? query.text : undefined
    };
  }

  private async expandQuery(query: string): Promise<string[]> {
    // Simple query expansion - in production, use word embeddings or knowledge graphs
    const terms = query.toLowerCase().split(/\\s+/);
    const expansions: string[] = [];

    for (const term of terms) {
      // Add related terms based on simple rules
      const related = this.getRelatedTerms(term);
      expansions.push(...related);
    }

    return expansions.slice(0, this.config.maxExpansionTerms);
  }

  private findSynonyms(query: string): string[] {
    const words = query.toLowerCase().split(/\\s+/);
    const synonymList: string[] = [];

    for (const word of words) {
      const wordSynonyms = this.synonyms.get(word) || [];
      synonymList.push(...wordSynonyms);
    }

    return [...new Set(synonymList)];
  }

  private async correctSpelling(text: string): Promise<string> {
    // Placeholder for spell checking - would use a library like hunspell or API
    return text;
  }

  private getRelatedTerms(term: string): string[] {
    // Simple related terms mapping - in production, use embeddings or knowledge graphs
    const relatedTermsMap: Record<string, string[]> = {
      'car': ['vehicle', 'automobile', 'auto'],
      'house': ['home', 'residence', 'dwelling'],
      'computer': ['pc', 'laptop', 'desktop', 'machine'],
      'phone': ['mobile', 'smartphone', 'cell'],
      'book': ['novel', 'text', 'publication', 'literature'],
      'food': ['meal', 'cuisine', 'dish', 'nutrition'],
      'music': ['song', 'audio', 'sound', 'melody'],
      'movie': ['film', 'cinema', 'video', 'picture'],
      'travel': ['trip', 'journey', 'vacation', 'tourism'],
      'health': ['medical', 'wellness', 'fitness', 'healthcare']
    };

    return relatedTermsMap[term] || [];
  }

  private initializeSynonyms(): void {
    // Initialize basic synonym mapping
    const synonymData: Array<[string, string[]]> = [
      ['big', ['large', 'huge', 'massive', 'enormous']],
      ['small', ['tiny', 'little', 'mini', 'compact']],
      ['fast', ['quick', 'rapid', 'swift', 'speedy']],
      ['slow', ['sluggish', 'gradual', 'leisurely']],
      ['good', ['excellent', 'great', 'wonderful', 'amazing']],
      ['bad', ['poor', 'terrible', 'awful', 'horrible']],
      ['happy', ['joyful', 'cheerful', 'delighted', 'pleased']],
      ['sad', ['unhappy', 'depressed', 'melancholy', 'sorrowful']],
      ['smart', ['intelligent', 'clever', 'brilliant', 'wise']],
      ['stupid', ['dumb', 'foolish', 'ignorant', 'silly']]
    ];

    synonymData.forEach(([word, synonyms]) => {
      this.synonyms.set(word, synonyms);
      // Add reverse mappings
      synonyms.forEach(synonym => {
        const existing = this.synonyms.get(synonym) || [];
        this.synonyms.set(synonym, [...existing, word]);
      });
    });
  }

  async suggestQueryImprovements(
    query: string,
    searchResults: any[]
  ): Promise<{
    suggestions: string[];
    reasoning: string[];
  }> {
    const suggestions: string[] = [];
    const reasoning: string[] = [];

    // Analyze query and results to suggest improvements
    if (searchResults.length === 0) {
      suggestions.push(\`Try searching for "\${query}" with different terms\`);
      reasoning.push('No results found for the current query');
      
      const synonyms = this.findSynonyms(query);
      if (synonyms.length > 0) {
        suggestions.push(\`Try synonyms: \${synonyms.slice(0, 3).join(', ')}\`);
        reasoning.push('Suggested alternative terms');
      }
    } else if (searchResults.length < 5) {
      const expandedTerms = await this.expandQuery(query);
      if (expandedTerms.length > 0) {
        suggestions.push(\`Add related terms: \${expandedTerms.slice(0, 2).join(', ')}\`);
        reasoning.push('Few results found, try expanding the query');
      }
    }

    return { suggestions, reasoning };
  }
}`;

    const utilsDir = join(options.outputPath, 'utils');
    await fs.writeFile(join(utilsDir, 'query-optimizer.ts'), optimizerContent);
  }

  private async generateTests(options: SemanticSearchOptions): Promise<void> {
    const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${options.name}Service } from '../${options.name.toLowerCase()}.service.js';
import type { SemanticSearchConfig, SearchQuery, SearchOptions } from '../types.js';

describe('${options.name}Service', () => {
  let service: ${options.name}Service;
  let mockConfig: SemanticSearchConfig;

  beforeEach(() => {
    mockConfig = {
      vectorDatabase: {
        provider: '${options.vectorProvider}',
        apiKey: 'test-key',
        dimension: 1536,
        metric: 'cosine'
      },
      embedding: {
        provider: '${options.embeddingProvider}',
        apiKey: 'test-key',
        model: 'text-embedding-3-small'
      },
      documentProcessing: {
        chunkSize: 500,
        chunkOverlap: 50,
        separators: ['\\n\\n', '\\n'],
        preserveStructure: true,
        extractMetadata: true
      }
    };

    service = new ${options.name}Service(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize all services', async () => {
      const embeddingInitSpy = vi.spyOn(service['embeddingService'], 'initialize')
        .mockResolvedValue();
      const vectorSearchInitSpy = vi.spyOn(service['vectorSearch'], 'initialize')
        .mockResolvedValue();

      await service.initialize();

      expect(embeddingInitSpy).toHaveBeenCalled();
      expect(vectorSearchInitSpy).toHaveBeenCalled();
    });
  });

  describe('document indexing', () => {
    it('should index a document successfully', async () => {
      const mockChunks = [
        {
          id: 'doc1_chunk_0',
          documentId: 'doc1',
          content: 'This is a test document chunk.',
          metadata: { type: 'text' },
          chunkIndex: 0,
          startOffset: 0,
          endOffset: 30
        }
      ];

      vi.spyOn(service['documentProcessor'], 'processDocument')
        .mockResolvedValue(mockChunks);
      
      vi.spyOn(service['embeddingService'], 'generateEmbedding')
        .mockResolvedValue([0.1, 0.2, 0.3]);
      
      vi.spyOn(service['vectorSearch'], 'indexChunks')
        .mockResolvedValue();

      await service.indexDocument('doc1', 'This is a test document.');

      expect(service['documentProcessor'].processDocument).toHaveBeenCalled();
      expect(service['embeddingService'].generateEmbedding).toHaveBeenCalled();
      expect(service['vectorSearch'].indexChunks).toHaveBeenCalled();
    });

    it('should handle document indexing errors', async () => {
      vi.spyOn(service['documentProcessor'], 'processDocument')
        .mockRejectedValue(new Error('Processing failed'));

      await expect(
        service.indexDocument('doc1', 'Test content')
      ).rejects.toThrow('Processing failed');
    });
  });

  describe('search', () => {
    it('should perform basic search successfully', async () => {
      const query: SearchQuery = { text: 'test query' };
      const options: SearchOptions = { topK: 10 };

      const mockResults = [
        {
          id: 'result1',
          score: 0.95,
          content: 'Test result content',
          metadata: { type: 'text' }
        }
      ];

      vi.spyOn(service['queryOptimizer'], 'optimize')
        .mockResolvedValue({ ...query, expandedTerms: ['test'] });
      
      vi.spyOn(service['embeddingService'], 'generateEmbedding')
        .mockResolvedValue([0.1, 0.2, 0.3]);
      
      vi.spyOn(service['vectorSearch'], 'search')
        .mockResolvedValue(mockResults);
      
      vi.spyOn(service as any, 'recordSearchAnalytics')
        .mockResolvedValue();

      const results = await service.search(query, options);

      expect(results).toEqual(mockResults);
      expect(service['queryOptimizer'].optimize).toHaveBeenCalledWith(query, options);
      expect(service['embeddingService'].generateEmbedding).toHaveBeenCalled();
      expect(service['vectorSearch'].search).toHaveBeenCalled();
    });

    it('should apply score threshold filtering', async () => {
      const query: SearchQuery = { text: 'test query' };
      const options: SearchOptions = { topK: 10, scoreThreshold: 0.8 };

      const mockResults = [
        { id: 'result1', score: 0.95, content: 'High score', metadata: {} },
        { id: 'result2', score: 0.85, content: 'Medium score', metadata: {} },
        { id: 'result3', score: 0.75, content: 'Low score', metadata: {} }
      ];

      vi.spyOn(service['queryOptimizer'], 'optimize')
        .mockResolvedValue(query);
      vi.spyOn(service['embeddingService'], 'generateEmbedding')
        .mockResolvedValue([0.1, 0.2, 0.3]);
      vi.spyOn(service['vectorSearch'], 'search')
        .mockResolvedValue(mockResults);
      vi.spyOn(service as any, 'recordSearchAnalytics')
        .mockResolvedValue();

      const results = await service.search(query, options);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.score >= 0.8)).toBe(true);
    });

    ${options.features.includes('hybrid-search') ? `
    it('should perform hybrid search when expanded terms are available', async () => {
      const query: SearchQuery = { text: 'test query' };
      const optimizedQuery = { ...query, expandedTerms: ['test', 'sample'] };

      const vectorResults = [
        { id: 'vec1', score: 0.9, content: 'Vector result', metadata: {} }
      ];
      const textResults = [
        { id: 'text1', score: 0.8, content: 'Text result', metadata: {} }
      ];

      vi.spyOn(service['queryOptimizer'], 'optimize')
        .mockResolvedValue(optimizedQuery);
      vi.spyOn(service['embeddingService'], 'generateEmbedding')
        .mockResolvedValue([0.1, 0.2, 0.3]);
      vi.spyOn(service['vectorSearch'], 'search')
        .mockResolvedValue(vectorResults);
      vi.spyOn(service['vectorSearch'], 'textSearch')
        .mockResolvedValue(textResults);
      vi.spyOn(service as any, 'fuseResults')
        .mockReturnValue([...vectorResults, ...textResults]);
      vi.spyOn(service as any, 'recordSearchAnalytics')
        .mockResolvedValue();

      await service.search(query);

      expect(service['vectorSearch'].textSearch).toHaveBeenCalledWith(
        'test sample',
        expect.any(Object)
      );
      expect(service['fuseResults']).toHaveBeenCalled();
    });` : ''}
  });

  describe('document management', () => {
    it('should delete a document', async () => {
      vi.spyOn(service['vectorSearch'], 'deleteDocument')
        .mockResolvedValue();

      await service.deleteDocument('doc1');

      expect(service['vectorSearch'].deleteDocument).toHaveBeenCalledWith('doc1');
    });

    it('should update a document', async () => {
      const deleteDocSpy = vi.spyOn(service, 'deleteDocument')
        .mockResolvedValue();
      const indexDocSpy = vi.spyOn(service, 'indexDocument')
        .mockResolvedValue();

      await service.updateDocument('doc1', 'Updated content', { type: 'updated' });

      expect(deleteDocSpy).toHaveBeenCalledWith('doc1');
      expect(indexDocSpy).toHaveBeenCalledWith('doc1', 'Updated content', { type: 'updated' });
    });
  });

  describe('health check', () => {
    it('should return healthy status when all services are healthy', async () => {
      vi.spyOn(service['embeddingService'], 'healthCheck').mockResolvedValue(true);
      vi.spyOn(service['vectorSearch'], 'healthCheck').mockResolvedValue(true);

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.services.embedding).toBe(true);
      expect(health.services.vectorSearch).toBe(true);
    });

    it('should return degraded status when some services are unhealthy', async () => {
      vi.spyOn(service['embeddingService'], 'healthCheck').mockResolvedValue(true);
      vi.spyOn(service['vectorSearch'], 'healthCheck').mockResolvedValue(false);

      const health = await service.healthCheck();

      expect(health.status).toBe('degraded');
      expect(health.services.embedding).toBe(true);
      expect(health.services.vectorSearch).toBe(false);
    });
  });

  ${options.features.includes('auto-complete') ? `
  describe('autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      const mockResults = [
        { id: '1', score: 0.9, content: 'testing framework', metadata: { content: 'testing framework' } },
        { id: '2', score: 0.8, content: 'test automation', metadata: { content: 'test automation' } }
      ];

      vi.spyOn(service['embeddingService'], 'generateEmbedding')
        .mockResolvedValue([0.1, 0.2, 0.3]);
      vi.spyOn(service['vectorSearch'], 'search')
        .mockResolvedValue(mockResults);

      const suggestions = await service.getAutocompleteSuggestions('test');

      expect(suggestions).toContain('testing');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });` : ''}
});`;

    const testsDir = join(options.outputPath, '__tests__');
    await this.ensureDirectoryExists(testsDir);
    await fs.writeFile(
      join(testsDir, `${options.name.toLowerCase()}.service.test.ts`),
      testContent
    );
  }

  private async generateConfig(options: SemanticSearchOptions): Promise<void> {
    const configContent = `import type { SemanticSearchConfig } from './types.js';

export const default${options.name}Config: Partial<SemanticSearchConfig> = {
  documentProcessing: {
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\\n\\n', '\\n', '. ', '! ', '? ', ' '],
    preserveStructure: true,
    extractMetadata: true
  },
  analytics: {
    enabled: true,
    storage: 'memory',
    retentionDays: 30
  },
  queryOptimization: {
    enableExpansion: true,
    enableSynonyms: true,
    enableSpellCheck: false,
    maxExpansionTerms: 5
  },
  indexing: {
    batchSize: 10,
    retryAttempts: 3,
    parallelProcessing: true
  }
};

export function create${options.name}Config(
  vectorConfig: { provider: string; apiKey: string; dimension?: number },
  embeddingConfig: { provider: string; apiKey: string; model?: string },
  overrides: Partial<SemanticSearchConfig> = {}
): SemanticSearchConfig {
  return {
    vectorDatabase: {
      provider: vectorConfig.provider as any,
      apiKey: vectorConfig.apiKey,
      dimension: vectorConfig.dimension || 1536,
      metric: 'cosine'
    },
    embedding: {
      provider: embeddingConfig.provider as any,
      apiKey: embeddingConfig.apiKey,
      model: embeddingConfig.model,
      batchSize: 100,
      timeout: 30000
    },
    ...default${options.name}Config,
    ...overrides
  };
}

export const SEMANTIC_SEARCH_DEFAULTS = {
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  TOP_K: 10,
  SCORE_THRESHOLD: 0.7,
  BATCH_SIZE: 100,
  MAX_EXPANSION_TERMS: 5
};`;

    await fs.writeFile(join(options.outputPath, 'config.ts'), configContent);
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}
import { promises as fs } from 'fs';
import { join } from 'path';
import { BaseGenerator } from "../base.generator";
import type { VectorDatabaseOptions } from "./types";

export class VectorDatabaseGenerator extends BaseGenerator<VectorDatabaseOptions> {
  async generate(options: VectorDatabaseOptions): Promise<void> {
    await this.validateOptions(options);
    
    this.logger.info(`Generating ${options.provider} vector database integration: ${options.name}`);
    
    try {
      // Generate main service
      await this.generateVectorService(options);
      
      // Generate types
      await this.generateTypes(options);
      
      // Generate provider-specific implementations
      switch (options.provider) {
        case 'pinecone':
          await this.generatePineconeImplementation(options);
          break;
        case 'weaviate':
          await this.generateWeaviateImplementation(options);
          break;
        case 'qdrant':
          await this.generateQdrantImplementation(options);
          break;
        case 'milvus':
          await this.generateMilvusImplementation(options);
          break;
      }
      
      // Generate utilities
      await this.generateUtilities(options);
      
      // Generate search features
      if (options.includeSearch) {
        await this.generateSearchFeatures(options);
      }
      
      // Generate recommendation features
      if (options.includeRecommendations) {
        await this.generateRecommendationFeatures(options);
      }
      
      // Generate analytics features
      if (options.includeAnalytics) {
        await this.generateAnalyticsFeatures(options);
      }
      
      // Generate tests
      await this.generateTests(options);
      
      // Generate configuration
      await this.generateConfig(options);
      
      this.logger.success(`${options.provider} vector database integration generated successfully at ${options.outputPath}`);
    } catch (error) {
      this.logger.error('Failed to generate vector database integration', error);
      throw error;
    }
  }

  protected async validateOptions(options: VectorDatabaseOptions): Promise<void> {
    if (!options.name || !options.outputPath || !options.provider) {
      throw new Error('Name, output path, and provider are required');
    }
    
    if (options.dimension <= 0) {
      throw new Error('Dimension must be a positive number');
    }
  }

  private async generateVectorService(options: VectorDatabaseOptions): Promise<void> {
    const serviceContent = `import type { 
  VectorRecord, 
  QueryOptions, 
  SearchResult, 
  BatchOperationResult,
  IndexStats,
  ${options.name}Config 
} from './types.js';
import { ${this.getProviderClass(options.provider)} } from "./providers/${options.provider}.provider";
import { VectorUtils } from "./utils/vector-utils";
import { SearchOptimizer } from "./utils/search-optimizer";

export class ${options.name}VectorService {
  private readonly provider: ${this.getProviderClass(options.provider)};
  private readonly vectorUtils: VectorUtils;
  private readonly searchOptimizer: SearchOptimizer;

  constructor(private readonly config: ${options.name}Config) {
    this.provider = new ${this.getProviderClass(options.provider)}(config);
    this.vectorUtils = new VectorUtils();
    this.searchOptimizer = new SearchOptimizer();
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
    this.logger.info('Vector database service initialized');
  }

  async createIndex(
    name: string,
    options: {
      dimension?: number;
      metric?: 'cosine' | 'euclidean' | 'dotproduct';
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const indexOptions = {
      dimension: options.dimension || ${options.dimension},
      metric: options.metric || '${options.metric || 'cosine'}',
      metadata: options.metadata || {}
    };

    await this.provider.createIndex(name, indexOptions);
    this.logger.info(\`Index '\${name}' created successfully\`);
  }

  async upsertVectors(
    indexName: string,
    vectors: VectorRecord[]
  ): Promise<BatchOperationResult> {
    const validatedVectors = this.validateVectors(vectors);
    const normalizedVectors = this.vectorUtils.normalizeVectors(validatedVectors);
    
    const result = await this.provider.upsertVectors(indexName, normalizedVectors);
    
    this.logger.info(\`Upserted \${vectors.length} vectors to index '\${indexName}'\`);
    return result;
  }

  async upsertVectorsBatch(
    indexName: string,
    vectors: VectorRecord[],
    batchSize: number = 100
  ): Promise<BatchOperationResult[]> {
    const batches = this.vectorUtils.createBatches(vectors, batchSize);
    const results: BatchOperationResult[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.info(\`Processing batch \${i + 1}/\${batches.length}\`);
      
      try {
        const result = await this.upsertVectors(indexName, batch);
        results.push(result);
        
        // Add delay between batches to avoid rate limits
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        this.logger.error(\`Batch \${i + 1} failed:`, error);
        results.push({
          success: false,
          processedCount: 0,
          failedCount: batch.length,
          errors: [String(error)]
        });
      }
    }

    return results;
  }

  async queryVectors(
    indexName: string,
    queryVector: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const normalizedQuery = this.vectorUtils.normalizeVector(queryVector);
    const optimizedOptions = this.searchOptimizer.optimizeQuery(options);
    
    const results = await this.provider.queryVectors(
      indexName, 
      normalizedQuery, 
      optimizedOptions
    );

    return this.processSearchResults(results, options);
  }

  async semanticSearch(
    indexName: string,
    query: string,
    embeddings: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const enhancedOptions = {
      ...options,
      includeMetadata: true,
      semanticQuery: query
    };

    return this.queryVectors(indexName, embeddings, enhancedOptions);
  }

  async hybridSearch(
    indexName: string,
    vectorQuery: number[],
    textQuery?: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const vectorResults = await this.queryVectors(indexName, vectorQuery, {
      ...options,
      topK: (options.topK || 10) * 2 // Get more results for fusion
    });

    if (!textQuery) {
      return vectorResults.slice(0, options.topK || 10);
    }

    // Implement reciprocal rank fusion
    const textResults = await this.textSearch(indexName, textQuery, options);
    return this.searchOptimizer.fuseResults(vectorResults, textResults, options.topK || 10);
  }

  async textSearch(
    indexName: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    return this.provider.textSearch(indexName, query, options);
  }

  async deleteVectors(
    indexName: string,
    ids: string[]
  ): Promise<BatchOperationResult> {
    const result = await this.provider.deleteVectors(indexName, ids);
    this.logger.info(\`Deleted \${ids.length} vectors from index '\${indexName}'\`);
    return result;
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    return this.provider.getIndexStats(indexName);
  }

  async listIndexes(): Promise<string[]> {
    return this.provider.listIndexes();
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.provider.deleteIndex(indexName);
    this.logger.info(\`Index '\${indexName}' deleted successfully\`);
  }

  ${options.includeRecommendations ? this.generateRecommendationMethods() : ''}

  ${options.includeAnalytics ? this.generateAnalyticsMethods() : ''}

  private validateVectors(vectors: VectorRecord[]): VectorRecord[] {
    return vectors.filter(vector => {
      if (!vector.id || !vector.values || !Array.isArray(vector.values)) {
        this.logger.warn(\`Invalid vector record: \${JSON.stringify(vector)}\`);
        return false;
      }
      
      if (vector.values.length !== ${options.dimension}) {
        this.logger.warn(\`Vector dimension mismatch. Expected ${options.dimension}, got \${vector.values.length}\`);
        return false;
      }
      
      return true;
    });
  }

  private processSearchResults(
    results: SearchResult[],
    options: QueryOptions
  ): SearchResult[] {
    let processedResults = results;

    // Apply post-processing filters
    if (options.scoreThreshold) {
      processedResults = processedResults.filter(
        result => result.score >= options.scoreThreshold!
      );
    }

    // Apply diversity filtering if requested
    if (options.diversityFactor && options.diversityFactor > 0) {
      processedResults = this.searchOptimizer.applyDiversityFilter(
        processedResults,
        options.diversityFactor
      );
    }

    return processedResults.slice(0, options.topK || 10);
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    provider: string;
    indexCount: number;
  }> {
    const start = Date.now();
    
    try {
      const indexes = await this.listIndexes();
      return {
        status: 'healthy',
        latency: Date.now() - start,
        provider: '${options.provider}',
        indexCount: indexes.length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        provider: '${options.provider}',
        indexCount: 0
      };
    }
  }
}`;

    await this.ensureDirectoryExists(options.outputPath);
    await fs.writeFile(
      join(options.outputPath, `${options.name.toLowerCase()}-vector.service.ts`),
      serviceContent
    );
  }

  private generateRecommendationMethods(): string {
    return `
  async getRecommendations(
    indexName: string,
    userId: string,
    options: {
      topK?: number;
      excludeIds?: string[];
      diversityFactor?: number;
      recencyWeight?: number;
    } = {}
  ): Promise<SearchResult[]> {
    // Get user's interaction history
    const userVector = await this.getUserVector(indexName, userId);
    if (!userVector) {
      return this.getColdStartRecommendations(indexName, options);
    }

    const recommendations = await this.queryVectors(indexName, userVector, {
      topK: (options.topK || 10) * 3, // Get more for filtering
      filter: options.excludeIds ? { id: { $nin: options.excludeIds } } : undefined
    });

    return this.optimizeRecommendations(recommendations, options);
  }

  async getSimilarItems(
    indexName: string,
    itemId: string,
    options: {
      topK?: number;
      excludeOriginal?: boolean;
    } = {}
  ): Promise<SearchResult[]> {
    const itemVector = await this.getVectorById(indexName, itemId);
    if (!itemVector) {
      throw new Error(\`Item \${itemId} not found\`);
    }

    const results = await this.queryVectors(indexName, itemVector.values, {
      topK: (options.topK || 10) + (options.excludeOriginal ? 1 : 0),
      filter: options.excludeOriginal ? { id: { $ne: itemId } } : undefined
    });

    return options.excludeOriginal ? results.slice(1) : results;
  }

  private async getUserVector(indexName: string, userId: string): Promise<number[] | null> {
    // Implementation would depend on how user vectors are stored
    // This is a placeholder for user profile vector retrieval
    return null;
  }

  private async getVectorById(indexName: string, id: string): Promise<VectorRecord | null> {
    const results = await this.provider.queryVectors(indexName, [], {
      filter: { id: { $eq: id } },
      topK: 1,
      includeValues: true
    });

    return results.length > 0 ? {
      id: results[0].id,
      values: results[0].values || [],
      metadata: results[0].metadata
    } : null;
  }

  private async getColdStartRecommendations(
    indexName: string,
    options: any
  ): Promise<SearchResult[]> {
    // Return popular or trending items for new users
    return this.provider.queryVectors(indexName, [], {
      topK: options.topK || 10,
      filter: { popularity: { $gte: 0.7 } } // Example popularity filter
    });
  }

  private optimizeRecommendations(
    recommendations: SearchResult[],
    options: any
  ): SearchResult[] {
    let optimized = recommendations;

    // Apply diversity filter
    if (options.diversityFactor) {
      optimized = this.searchOptimizer.applyDiversityFilter(
        optimized,
        options.diversityFactor
      );
    }

    // Apply recency weighting
    if (options.recencyWeight) {
      optimized = this.applyRecencyWeight(optimized, options.recencyWeight);
    }

    return optimized.slice(0, options.topK || 10);
  }

  private applyRecencyWeight(
    results: SearchResult[],
    recencyWeight: number
  ): SearchResult[] {
    const now = Date.now();
    
    return results.map(result => {
      const createdAt = result.metadata?.createdAt as number || now;
      const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.exp(-ageInDays * recencyWeight);
      
      return {
        ...result,
        score: result.score * (1 + recencyBoost)
      };
    }).sort((a, b) => b.score - a.score);
  }`;
  }

  private generateAnalyticsMethods(): string {
    return `
  async getSearchAnalytics(
    indexName: string,
    timeRange: {
      start: Date;
      end: Date;
    }
  ): Promise<{
    totalQueries: number;
    avgLatency: number;
    topQueries: Array<{ query: string; count: number }>;
    clickThroughRate: number;
  }> {
    // This would integrate with your analytics system
    // Placeholder implementation
    return {
      totalQueries: 0,
      avgLatency: 0,
      topQueries: [],
      clickThroughRate: 0
    };
  }

  async getVectorDistribution(
    indexName: string
  ): Promise<{
    clusters: Array<{
      centroid: number[];
      size: number;
      variance: number;
    }>;
    dimensionStats: Array<{
      dimension: number;
      mean: number;
      std: number;
      min: number;
      max: number;
    }>;
  }> {
    const stats = await this.getIndexStats(indexName);
    
    // Simplified implementation - in practice, you'd analyze the actual vectors
    return {
      clusters: [],
      dimensionStats: Array.from({ length: ${this.options?.dimension || 1536} }, (_, i) => ({
        dimension: i,
        mean: 0,
        std: 1,
        min: -1,
        max: 1
      }))
    };
  }

  async analyzeQueryPerformance(
    queries: Array<{
      vector: number[];
      latency: number;
      resultCount: number;
    }>
  ): Promise<{
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
    slowQueries: Array<{ vector: number[]; latency: number }>;
  }> {
    const latencies = queries.map(q => q.latency).sort((a, b) => a - b);
    
    return {
      avgLatency: latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      slowQueries: queries
        .filter(q => q.latency > latencies[Math.floor(latencies.length * 0.95)])
        .map(q => ({ vector: q.vector, latency: q.latency }))
    };
  }`;
  }

  private async generatePineconeImplementation(options: VectorDatabaseOptions): Promise<void> {
    const providerContent = `import { Pinecone } from '@pinecone-database/pinecone';
import type { 
  VectorRecord, 
  QueryOptions, 
  SearchResult, 
  BatchOperationResult,
  IndexStats 
} from '../types.js';

export class PineconeProvider {
  private pinecone: Pinecone;

  constructor(private readonly config: any) {
    this.pinecone = new Pinecone({
      apiKey: config.apiKey,
      environment: config.environment,
    });
  }

  async initialize(): Promise<void> {
    // Verify connection
    await this.pinecone.listIndexes();
  }

  async createIndex(
    name: string,
    options: {
      dimension: number;
      metric: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.pinecone.createIndex({
      name,
      dimension: options.dimension,
      metric: options.metric as any,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      },
      ...options.metadata
    });

    // Wait for index to be ready
    while (!(await this.isIndexReady(name))) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async upsertVectors(
    indexName: string,
    vectors: VectorRecord[]
  ): Promise<BatchOperationResult> {
    const index = this.pinecone.index(indexName);
    
    try {
      const pineconeVectors = vectors.map(v => ({
        id: v.id,
        values: v.values,
        metadata: v.metadata || {}
      }));

      // Batch upsert in chunks of 100
      const chunkSize = 100;
      let processedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < pineconeVectors.length; i += chunkSize) {
        const chunk = pineconeVectors.slice(i, i + chunkSize);
        
        try {
          await index.upsert(chunk);
          processedCount += chunk.length;
        } catch (error) {
          errors.push(\`Chunk \${i/chunkSize + 1}: \${String(error)}\`);
        }
      }

      return {
        success: errors.length === 0,
        processedCount,
        failedCount: vectors.length - processedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: vectors.length,
        errors: [String(error)]
      };
    }
  }

  async queryVectors(
    indexName: string,
    queryVector: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const index = this.pinecone.index(indexName);
    
    const response = await index.query({
      vector: queryVector,
      topK: options.topK || 10,
      filter: options.filter,
      includeMetadata: options.includeMetadata ?? true,
      includeValues: options.includeValues ?? false
    });

    return (response.matches || []).map(match => ({
      id: match.id,
      score: match.score || 0,
      values: match.values,
      metadata: match.metadata || {}
    }));
  }

  async textSearch(
    indexName: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    // Pinecone doesn't have native text search
    // This would require embedding the query first
    throw new Error('Text search requires embedding the query first');
  }

  async deleteVectors(
    indexName: string,
    ids: string[]
  ): Promise<BatchOperationResult> {
    const index = this.pinecone.index(indexName);
    
    try {
      await index.deleteMany(ids);
      return {
        success: true,
        processedCount: ids.length,
        failedCount: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: ids.length,
        errors: [String(error)]
      };
    }
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const index = this.pinecone.index(indexName);
    const stats = await index.describeIndexStats();
    
    return {
      totalVectorCount: stats.totalVectorCount || 0,
      indexSize: stats.dimension || 0,
      namespaces: Object.keys(stats.namespaces || {}),
      dimension: stats.dimension || 0
    };
  }

  async listIndexes(): Promise<string[]> {
    const indexes = await this.pinecone.listIndexes();
    return indexes.indexes?.map(idx => idx.name) || [];
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.pinecone.deleteIndex(indexName);
  }

  private async isIndexReady(name: string): Promise<boolean> {
    try {
      const stats = await this.pinecone.index(name).describeIndexStats();
      return stats.totalVectorCount !== undefined;
    } catch {
      return false;
    }
  }
}`;

    const providersDir = join(options.outputPath, 'providers');
    await this.ensureDirectoryExists(providersDir);
    await fs.writeFile(join(providersDir, 'pinecone.provider.ts'), providerContent);
  }

  private async generateWeaviateImplementation(options: VectorDatabaseOptions): Promise<void> {
    const providerContent = `import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import type { 
  VectorRecord, 
  QueryOptions, 
  SearchResult, 
  BatchOperationResult,
  IndexStats 
} from '../types.js';

export class WeaviateProvider {
  private client: WeaviateClient;

  constructor(private readonly config: any) {
    this.client = weaviate.client({
      scheme: config.scheme || 'https',
      host: config.host,
      apiKey: config.apiKey ? new ApiKey(config.apiKey) : undefined,
      headers: config.headers || {}
    });
  }

  async initialize(): Promise<void> {
    const ready = await this.client.misc.readyChecker().do();
    if (!ready) {
      throw new Error('Weaviate client is not ready');
    }
  }

  async createIndex(
    name: string,
    options: {
      dimension: number;
      metric: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const schema = {
      class: name,
      description: \`Vector index for \${name}\`,
      vectorizer: 'none',
      vectorIndexConfig: {
        distance: options.metric === 'cosine' ? 'cosine' : 'l2-squared'
      },
      properties: [
        {
          name: 'content',
          dataType: ['text'],
          description: 'The content of the vector'
        },
        {
          name: 'metadata',
          dataType: ['object'],
          description: 'Additional metadata'
        }
      ]
    };

    await this.client.schema.classCreator().withClass(schema).do();
  }

  async upsertVectors(
    indexName: string,
    vectors: VectorRecord[]
  ): Promise<BatchOperationResult> {
    try {
      let batcher = this.client.batch.objectsBatcher();
      let processedCount = 0;
      const errors: string[] = [];

      for (const vector of vectors) {
        try {
          batcher = batcher.withObject({
            class: indexName,
            id: vector.id,
            vector: vector.values,
            properties: {
              metadata: vector.metadata || {}
            }
          });
          processedCount++;
        } catch (error) {
          errors.push(\`Vector \${vector.id}: \${String(error)}\`);
        }
      }

      const result = await batcher.do();
      
      return {
        success: errors.length === 0,
        processedCount,
        failedCount: vectors.length - processedCount,
        errors: result.map(r => r.result?.errors?.error?.[0]?.message || '').filter(Boolean)
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: vectors.length,
        errors: [String(error)]
      };
    }
  }

  async queryVectors(
    indexName: string,
    queryVector: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    let query = this.client.graphql
      .get()
      .withClassName(indexName)
      .withNearVector({
        vector: queryVector,
        certainty: options.scoreThreshold || 0.7
      })
      .withLimit(options.topK || 10);

    if (options.includeValues) {
      query = query.withFields('_additional { vector }');
    }

    const result = await query.do();
    const objects = result.data?.Get?.[indexName] || [];

    return objects.map((obj: any, index: number) => ({
      id: obj.id || \`\${index}\`,
      score: obj._additional?.certainty || 0,
      values: obj._additional?.vector,
      metadata: obj.metadata || {}
    }));
  }

  async textSearch(
    indexName: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const result = await this.client.graphql
      .get()
      .withClassName(indexName)
      .withNearText({
        concepts: [query],
        certainty: options.scoreThreshold || 0.7
      })
      .withLimit(options.topK || 10)
      .do();

    const objects = result.data?.Get?.[indexName] || [];

    return objects.map((obj: any, index: number) => ({
      id: obj.id || \`\${index}\`,
      score: obj._additional?.certainty || 0,
      values: obj._additional?.vector,
      metadata: obj.metadata || {}
    }));
  }

  async deleteVectors(
    indexName: string,
    ids: string[]
  ): Promise<BatchOperationResult> {
    try {
      let batcher = this.client.batch.objectsBatcher();
      
      for (const id of ids) {
        batcher = batcher.withDelete(indexName, id);
      }

      await batcher.do();
      
      return {
        success: true,
        processedCount: ids.length,
        failedCount: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: ids.length,
        errors: [String(error)]
      };
    }
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const result = await this.client.graphql
      .aggregate()
      .withClassName(indexName)
      .withFields('meta { count }')
      .do();

    const count = result.data?.Aggregate?.[indexName]?.[0]?.meta?.count || 0;

    return {
      totalVectorCount: count,
      indexSize: count * ${options.dimension}, // Approximate
      namespaces: [indexName],
      dimension: ${options.dimension}
    };
  }

  async listIndexes(): Promise<string[]> {
    const schema = await this.client.schema.getter().do();
    return schema.classes?.map((cls: any) => cls.class) || [];
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.client.schema.classDeleter().withClassName(indexName).do();
  }
}`;

    const providersDir = join(options.outputPath, 'providers');
    await this.ensureDirectoryExists(providersDir);
    await fs.writeFile(join(providersDir, 'weaviate.provider.ts'), providerContent);
  }

  private async generateQdrantImplementation(options: VectorDatabaseOptions): Promise<void> {
    const providerContent = `import { QdrantClient } from '@qdrant/js-client-rest';
import type { 
  VectorRecord, 
  QueryOptions, 
  SearchResult, 
  BatchOperationResult,
  IndexStats 
} from '../types.js';

export class QdrantProvider {
  private client: QdrantClient;

  constructor(private readonly config: any) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
      port: config.port
    });
  }

  async initialize(): Promise<void> {
    // Test connection
    await this.client.getCollections();
  }

  async createIndex(
    name: string,
    options: {
      dimension: number;
      metric: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.client.createCollection(name, {
      vectors: {
        size: options.dimension,
        distance: options.metric === 'cosine' ? 'Cosine' : 'Euclid'
      }
    });
  }

  async upsertVectors(
    indexName: string,
    vectors: VectorRecord[]
  ): Promise<BatchOperationResult> {
    try {
      const points = vectors.map(vector => ({
        id: vector.id,
        vector: vector.values,
        payload: vector.metadata || {}
      }));

      const result = await this.client.upsert(indexName, {
        wait: true,
        points
      });

      return {
        success: result.status === 'completed',
        processedCount: vectors.length,
        failedCount: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: vectors.length,
        errors: [String(error)]
      };
    }
  }

  async queryVectors(
    indexName: string,
    queryVector: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const searchResult = await this.client.search(indexName, {
      vector: queryVector,
      limit: options.topK || 10,
      score_threshold: options.scoreThreshold,
      filter: options.filter,
      with_payload: options.includeMetadata ?? true,
      with_vector: options.includeValues ?? false
    });

    return searchResult.map(point => ({
      id: String(point.id),
      score: point.score,
      values: point.vector,
      metadata: point.payload || {}
    }));
  }

  async textSearch(
    indexName: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    // Qdrant doesn't have native text search
    // This would require embedding the query first or using a text index
    throw new Error('Text search requires embedding the query first');
  }

  async deleteVectors(
    indexName: string,
    ids: string[]
  ): Promise<BatchOperationResult> {
    try {
      await this.client.delete(indexName, {
        wait: true,
        points: ids
      });

      return {
        success: true,
        processedCount: ids.length,
        failedCount: 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: ids.length,
        errors: [String(error)]
      };
    }
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const info = await this.client.getCollection(indexName);
    
    return {
      totalVectorCount: info.points_count || 0,
      indexSize: (info.points_count || 0) * ${options.dimension},
      namespaces: [indexName],
      dimension: info.config?.params?.vectors?.size || ${options.dimension}
    };
  }

  async listIndexes(): Promise<string[]> {
    const collections = await this.client.getCollections();
    return collections.collections.map(collection => collection.name);
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.client.deleteCollection(indexName);
  }
}`;

    const providersDir = join(options.outputPath, 'providers');
    await this.ensureDirectoryExists(providersDir);
    await fs.writeFile(join(providersDir, 'qdrant.provider.ts'), providerContent);
  }

  private async generateMilvusImplementation(options: VectorDatabaseOptions): Promise<void> {
    const providerContent = `import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
import type { 
  VectorRecord, 
  QueryOptions, 
  SearchResult, 
  BatchOperationResult,
  IndexStats 
} from '../types.js';

export class MilvusProvider {
  private client: MilvusClient;

  constructor(private readonly config: any) {
    this.client = new MilvusClient({
      address: config.address,
      username: config.username,
      password: config.password,
      ssl: config.ssl || false
    });
  }

  async initialize(): Promise<void> {
    const result = await this.client.checkHealth();
    if (!result.isHealthy) {
      throw new Error('Milvus client is not healthy');
    }
  }

  async createIndex(
    name: string,
    options: {
      dimension: number;
      metric: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    // Create collection
    await this.client.createCollection({
      collection_name: name,
      fields: [
        {
          name: 'id',
          data_type: DataType.VarChar,
          max_length: 100,
          is_primary_key: true
        },
        {
          name: 'vector',
          data_type: DataType.FloatVector,
          dim: options.dimension
        },
        {
          name: 'metadata',
          data_type: DataType.JSON
        }
      ]
    });

    // Create index
    await this.client.createIndex({
      collection_name: name,
      field_name: 'vector',
      index_type: 'IVF_FLAT',
      metric_type: options.metric.toUpperCase(),
      params: { nlist: 1024 }
    });

    // Load collection
    await this.client.loadCollection({ collection_name: name });
  }

  async upsertVectors(
    indexName: string,
    vectors: VectorRecord[]
  ): Promise<BatchOperationResult> {
    try {
      const data = vectors.map(vector => ({
        id: vector.id,
        vector: vector.values,
        metadata: vector.metadata || {}
      }));

      const result = await this.client.insert({
        collection_name: indexName,
        data
      });

      return {
        success: result.status.error_code === 'Success',
        processedCount: vectors.length,
        failedCount: 0,
        errors: result.status.error_code !== 'Success' ? [result.status.reason] : []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: vectors.length,
        errors: [String(error)]
      };
    }
  }

  async queryVectors(
    indexName: string,
    queryVector: number[],
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    const result = await this.client.search({
      collection_name: indexName,
      vectors: [queryVector],
      search_params: {
        anns_field: 'vector',
        topk: options.topK || 10,
        metric_type: '${options.metric?.toUpperCase() || 'COSINE'}',
        params: JSON.stringify({ nprobe: 10 })
      },
      output_fields: ['id', 'metadata']
    });

    return result.results.map(point => ({
      id: point.id,
      score: point.score,
      values: options.includeValues ? point.vector : undefined,
      metadata: point.metadata || {}
    }));
  }

  async textSearch(
    indexName: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<SearchResult[]> {
    // Milvus doesn't have native text search
    throw new Error('Text search requires embedding the query first');
  }

  async deleteVectors(
    indexName: string,
    ids: string[]
  ): Promise<BatchOperationResult> {
    try {
      const result = await this.client.delete({
        collection_name: indexName,
        ids
      });

      return {
        success: result.status.error_code === 'Success',
        processedCount: ids.length,
        failedCount: 0,
        errors: result.status.error_code !== 'Success' ? [result.status.reason] : []
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: ids.length,
        errors: [String(error)]
      };
    }
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const stats = await this.client.getCollectionStatistics({
      collection_name: indexName
    });

    const rowCount = parseInt(stats.stats.find(s => s.key === 'row_count')?.value || '0');

    return {
      totalVectorCount: rowCount,
      indexSize: rowCount * ${options.dimension},
      namespaces: [indexName],
      dimension: ${options.dimension}
    };
  }

  async listIndexes(): Promise<string[]> {
    const result = await this.client.listCollections();
    return result.collection_names || [];
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.client.dropCollection({ collection_name: indexName });
  }
}`;

    const providersDir = join(options.outputPath, 'providers');
    await this.ensureDirectoryExists(providersDir);
    await fs.writeFile(join(providersDir, 'milvus.provider.ts'), providerContent);
  }

  private async generateTypes(options: VectorDatabaseOptions): Promise<void> {
    const typesContent = `export interface ${options.name}Config {
  readonly apiKey?: string;
  readonly environment?: string;
  readonly url?: string;
  readonly host?: string;
  readonly port?: number;
  readonly scheme?: string;
  readonly headers?: Record<string, string>;
  readonly address?: string;
  readonly username?: string;
  readonly password?: string;
  readonly ssl?: boolean;
}

export interface VectorRecord {
  readonly id: string;
  readonly values: number[];
  readonly metadata?: Record<string, any>;
}

export interface QueryOptions {
  readonly topK?: number;
  readonly filter?: Record<string, any>;
  readonly includeMetadata?: boolean;
  readonly includeValues?: boolean;
  readonly scoreThreshold?: number;
  readonly diversityFactor?: number;
  readonly semanticQuery?: string;
}

export interface SearchResult {
  readonly id: string;
  readonly score: number;
  readonly values?: number[];
  readonly metadata: Record<string, any>;
}

export interface BatchOperationResult {
  readonly success: boolean;
  readonly processedCount: number;
  readonly failedCount: number;
  readonly errors: string[];
}

export interface IndexStats {
  readonly totalVectorCount: number;
  readonly indexSize: number;
  readonly namespaces: string[];
  readonly dimension: number;
}

export interface ClusterInfo {
  readonly centroid: number[];
  readonly size: number;
  readonly variance: number;
}

export interface DimensionStats {
  readonly dimension: number;
  readonly mean: number;
  readonly std: number;
  readonly min: number;
  readonly max: number;
}

export interface SearchAnalytics {
  readonly totalQueries: number;
  readonly avgLatency: number;
  readonly topQueries: Array<{ query: string; count: number }>;
  readonly clickThroughRate: number;
}

export interface VectorDistribution {
  readonly clusters: ClusterInfo[];
  readonly dimensionStats: DimensionStats[];
}

export interface QueryPerformance {
  readonly avgLatency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly slowQueries: Array<{ vector: number[]; latency: number }>;
}`;

    await fs.writeFile(join(options.outputPath, 'types.ts'), typesContent);
  }

  private async generateUtilities(options: VectorDatabaseOptions): Promise<void> {
    await this.generateVectorUtils(options);
    await this.generateSearchOptimizer(options);
  }

  private async generateVectorUtils(options: VectorDatabaseOptions): Promise<void> {
    const vectorUtilsContent = `import type { VectorRecord } from "../types";

export class VectorUtils {
  /**
   * Normalize a vector to unit length
   */
  normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }

  /**
   * Normalize multiple vectors
   */
  normalizeVectors(vectors: VectorRecord[]): VectorRecord[] {
    return vectors.map(vector => ({
      ...vector,
      values: this.normalizeVector(vector.values)
    }));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  /**
   * Calculate dot product between two vectors
   */
  dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  /**
   * Create batches from an array of vectors
   */
  createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Validate vector dimensions
   */
  validateDimensions(vectors: VectorRecord[], expectedDimension: number): VectorRecord[] {
    return vectors.filter(vector => {
      if (vector.values.length !== expectedDimension) {
        console.warn(\`Vector \${vector.id} has dimension \${vector.values.length}, expected \${expectedDimension}\`);
        return false;
      }
      return true;
    });
  }

  /**
   * Generate random vector for testing
   */
  generateRandomVector(dimension: number, min: number = -1, max: number = 1): number[] {
    return Array.from({ length: dimension }, () => 
      Math.random() * (max - min) + min
    );
  }

  /**
   * Convert sparse vector to dense vector
   */
  sparseToDense(sparseVector: Record<number, number>, dimension: number): number[] {
    const dense = new Array(dimension).fill(0);
    for (const [index, value] of Object.entries(sparseVector)) {
      const idx = parseInt(index);
      if (idx >= 0 && idx < dimension) {
        dense[idx] = value;
      }
    }
    return dense;
  }

  /**
   * Convert dense vector to sparse vector
   */
  denseToSparse(denseVector: number[], threshold: number = 0.001): Record<number, number> {
    const sparse: Record<number, number> = {};
    denseVector.forEach((value, index) => {
      if (Math.abs(value) > threshold) {
        sparse[index] = value;
      }
    });
    return sparse;
  }

  /**
   * Calculate vector statistics
   */
  calculateStats(vectors: number[][]): {
    mean: number[];
    std: number[];
    min: number[];
    max: number[];
  } {
    if (vectors.length === 0) {
      throw new Error('Cannot calculate stats for empty vector array');
    }

    const dimension = vectors[0].length;
    const mean = new Array(dimension).fill(0);
    const min = new Array(dimension).fill(Infinity);
    const max = new Array(dimension).fill(-Infinity);

    // Calculate mean, min, max
    vectors.forEach(vector => {
      vector.forEach((value, dim) => {
        mean[dim] += value;
        min[dim] = Math.min(min[dim], value);
        max[dim] = Math.max(max[dim], value);
      });
    });

    mean.forEach((sum, dim) => {
      mean[dim] = sum / vectors.length;
    });

    // Calculate standard deviation
    const std = new Array(dimension).fill(0);
    vectors.forEach(vector => {
      vector.forEach((value, dim) => {
        std[dim] += Math.pow(value - mean[dim], 2);
      });
    });

    std.forEach((sum, dim) => {
      std[dim] = Math.sqrt(sum / vectors.length);
    });

    return { mean, std, min, max };
  }
}`;

    const utilsDir = join(options.outputPath, 'utils');
    await this.ensureDirectoryExists(utilsDir);
    await fs.writeFile(join(utilsDir, 'vector-utils.ts'), vectorUtilsContent);
  }

  private async generateSearchOptimizer(options: VectorDatabaseOptions): Promise<void> {
    const searchOptimizerContent = `import type { SearchResult, QueryOptions } from "../types";

export class SearchOptimizer {
  /**
   * Optimize query parameters based on historical performance
   */
  optimizeQuery(options: QueryOptions): QueryOptions {
    const optimized = { ...options };

    // Auto-adjust topK based on diversity requirements
    if (options.diversityFactor && options.diversityFactor > 0) {
      optimized.topK = Math.min((options.topK || 10) * 2, 100);
    }

    // Set reasonable defaults
    optimized.topK = optimized.topK || 10;
    optimized.includeMetadata = optimized.includeMetadata ?? true;
    optimized.includeValues = optimized.includeValues ?? false;

    return optimized;
  }

  /**
   * Apply diversity filtering to search results
   */
  applyDiversityFilter(
    results: SearchResult[],
    diversityFactor: number
  ): SearchResult[] {
    if (diversityFactor <= 0 || results.length <= 1) {
      return results;
    }

    const diverseResults: SearchResult[] = [];
    const candidateResults = [...results];

    // Add the top result first
    if (candidateResults.length > 0) {
      diverseResults.push(candidateResults.shift()!);
    }

    // Select diverse results using Maximum Marginal Relevance (MMR)
    while (candidateResults.length > 0 && diverseResults.length < results.length) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < candidateResults.length; i++) {
        const candidate = candidateResults[i];
        
        // Calculate MMR score
        const relevanceScore = candidate.score;
        const maxSimilarity = this.calculateMaxSimilarity(
          candidate,
          diverseResults
        );
        
        const mmrScore = 
          diversityFactor * relevanceScore - 
          (1 - diversityFactor) * maxSimilarity;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIndex = i;
        }
      }

      diverseResults.push(candidateResults.splice(bestIndex, 1)[0]);
    }

    return diverseResults;
  }

  /**
   * Fuse results from different search methods using Reciprocal Rank Fusion
   */
  fuseResults(
    vectorResults: SearchResult[],
    textResults: SearchResult[],
    topK: number
  ): SearchResult[] {
    const k = 60; // RRF parameter
    const scoreMap = new Map<string, number>();
    const resultMap = new Map<string, SearchResult>();

    // Process vector results
    vectorResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);
      resultMap.set(result.id, result);
    });

    // Process text results
    textResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);
      if (!resultMap.has(result.id)) {
        resultMap.set(result.id, result);
      }
    });

    // Sort by fused scores
    const fusedResults = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id, score]) => ({
        ...resultMap.get(id)!,
        score
      }));

    return fusedResults;
  }

  /**
   * Re-rank search results using a custom scoring function
   */
  rerank(
    results: SearchResult[],
    scoringFunction: (result: SearchResult) => number
  ): SearchResult[] {
    return results
      .map(result => ({
        ...result,
        score: scoringFunction(result)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Apply temporal boost to search results
   */
  applyTemporalBoost(
    results: SearchResult[],
    decayFactor: number = 0.1
  ): SearchResult[] {
    const now = Date.now();
    
    return results.map(result => {
      const createdAt = result.metadata.createdAt as number || now;
      const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      const temporalBoost = Math.exp(-decayFactor * ageInDays);
      
      return {
        ...result,
        score: result.score * temporalBoost
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate query expansion terms based on initial results
   */
  generateQueryExpansion(
    results: SearchResult[],
    maxTerms: number = 5
  ): string[] {
    const termFrequency = new Map<string, number>();
    
    // Extract terms from metadata
    results.forEach(result => {
      const text = JSON.stringify(result.metadata).toLowerCase();
      const terms = text.match(/\\b\\w+\\b/g) || [];
      
      terms.forEach(term => {
        if (term.length > 3) { // Filter short terms
          termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
        }
      });
    });

    // Return top terms by frequency
    return Array.from(termFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTerms)
      .map(([term]) => term);
  }

  private calculateMaxSimilarity(
    candidate: SearchResult,
    selectedResults: SearchResult[]
  ): number {
    if (selectedResults.length === 0 || !candidate.values) {
      return 0;
    }

    let maxSimilarity = 0;
    
    for (const selected of selectedResults) {
      if (selected.values) {
        const similarity = this.cosineSimilarity(candidate.values, selected.values);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    return maxSimilarity;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
  }
}`;

    const utilsDir = join(options.outputPath, 'utils');
    await fs.writeFile(join(utilsDir, 'search-optimizer.ts'), searchOptimizerContent);
  }

  private async generateTests(options: VectorDatabaseOptions): Promise<void> {
    const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${options.name}VectorService } from "../${options.name.toLowerCase()}-vector.service";
import type { ${options.name}Config, VectorRecord } from "../types";

describe('${options.name}VectorService', () => {
  let service: ${options.name}VectorService;
  let mockConfig: ${options.name}Config;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      environment: 'test'
    };

    service = new ${options.name}VectorService(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      vi.spyOn(service['provider'], 'initialize').mockResolvedValue();
      
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('createIndex', () => {
    it('should create index with default options', async () => {
      const createIndexSpy = vi.spyOn(service['provider'], 'createIndex')
        .mockResolvedValue();

      await service.createIndex('test-index');

      expect(createIndexSpy).toHaveBeenCalledWith('test-index', {
        dimension: ${options.dimension},
        metric: '${options.metric || 'cosine'}',
        metadata: {}
      });
    });

    it('should create index with custom options', async () => {
      const createIndexSpy = vi.spyOn(service['provider'], 'createIndex')
        .mockResolvedValue();

      await service.createIndex('test-index', {
        dimension: 512,
        metric: 'euclidean',
        metadata: { description: 'Test index' }
      });

      expect(createIndexSpy).toHaveBeenCalledWith('test-index', {
        dimension: 512,
        metric: 'euclidean',
        metadata: { description: 'Test index' }
      });
    });
  });

  describe('upsertVectors', () => {
    it('should upsert vectors successfully', async () => {
      const vectors: VectorRecord[] = [
        {
          id: 'vec1',
          values: new Array(${options.dimension}).fill(0.1),
          metadata: { type: 'test' }
        }
      ];

      const mockResult = {
        success: true,
        processedCount: 1,
        failedCount: 0,
        errors: []
      };

      vi.spyOn(service['provider'], 'upsertVectors').mockResolvedValue(mockResult);

      const result = await service.upsertVectors('test-index', vectors);

      expect(result).toEqual(mockResult);
    });

    it('should filter invalid vectors', async () => {
      const vectors: VectorRecord[] = [
        {
          id: 'vec1',
          values: new Array(${options.dimension}).fill(0.1),
          metadata: {}
        },
        {
          id: 'vec2',
          values: new Array(10).fill(0.1), // Wrong dimension
          metadata: {}
        }
      ];

      const mockResult = {
        success: true,
        processedCount: 1,
        failedCount: 0,
        errors: []
      };

      vi.spyOn(service['provider'], 'upsertVectors').mockResolvedValue(mockResult);

      await service.upsertVectors('test-index', vectors);

      // Should only process the valid vector
      expect(service['provider'].upsertVectors).toHaveBeenCalledWith(
        'test-index',
        expect.arrayContaining([
          expect.objectContaining({ id: 'vec1' })
        ])
      );
    });
  });

  describe('queryVectors', () => {
    it('should query vectors successfully', async () => {
      const queryVector = new Array(${options.dimension}).fill(0.1);
      const mockResults = [
        {
          id: 'vec1',
          score: 0.95,
          values: queryVector,
          metadata: { type: 'test' }
        }
      ];

      vi.spyOn(service['provider'], 'queryVectors').mockResolvedValue(mockResults);

      const results = await service.queryVectors('test-index', queryVector);

      expect(results).toEqual(mockResults);
    });

    it('should apply score threshold filtering', async () => {
      const queryVector = new Array(${options.dimension}).fill(0.1);
      const mockResults = [
        { id: 'vec1', score: 0.95, values: [], metadata: {} },
        { id: 'vec2', score: 0.85, values: [], metadata: {} },
        { id: 'vec3', score: 0.65, values: [], metadata: {} }
      ];

      vi.spyOn(service['provider'], 'queryVectors').mockResolvedValue(mockResults);

      const results = await service.queryVectors('test-index', queryVector, {
        scoreThreshold: 0.8
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.score >= 0.8)).toBe(true);
    });
  });

  describe('semanticSearch', () => {
    it('should perform semantic search', async () => {
      const embeddings = new Array(${options.dimension}).fill(0.1);
      const mockResults = [
        { id: 'doc1', score: 0.9, values: [], metadata: { content: 'test' } }
      ];

      vi.spyOn(service, 'queryVectors').mockResolvedValue(mockResults);

      const results = await service.semanticSearch(
        'test-index',
        'test query',
        embeddings
      );

      expect(results).toEqual(mockResults);
      expect(service.queryVectors).toHaveBeenCalledWith(
        'test-index',
        embeddings,
        expect.objectContaining({
          includeMetadata: true,
          semanticQuery: 'test query'
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      vi.spyOn(service, 'listIndexes').mockResolvedValue(['index1', 'index2']);

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.provider).toBe('${options.provider}');
      expect(health.indexCount).toBe(2);
      expect(typeof health.latency).toBe('number');
    });

    it('should return unhealthy status on error', async () => {
      vi.spyOn(service, 'listIndexes').mockRejectedValue(new Error('Connection failed'));

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.indexCount).toBe(0);
    });
  });
});`;

    const testsDir = join(options.outputPath, '__tests__');
    await this.ensureDirectoryExists(testsDir);
    await fs.writeFile(
      join(testsDir, `${options.name.toLowerCase()}-vector.service.test.ts`),
      testContent
    );
  }

  private async generateConfig(options: VectorDatabaseOptions): Promise<void> {
    const configContent = `import type { ${options.name}Config } from "./types";

export const default${options.name}Config: Partial<${options.name}Config> = {
  // Default configuration will vary by provider
};

export function create${options.name}Config(
  overrides: Partial<${options.name}Config> = {}
): ${options.name}Config {
  const defaultConfig = getProviderDefaults('${options.provider}');
  
  return {
    ...defaultConfig,
    ...overrides
  };
}

function getProviderDefaults(provider: string): Partial<${options.name}Config> {
  switch (provider) {
    case 'pinecone':
      return {
        environment: 'us-east1-gcp'
      };
    case 'weaviate':
      return {
        scheme: 'https',
        headers: {}
      };
    case 'qdrant':
      return {
        port: 6333
      };
    case 'milvus':
      return {
        ssl: false
      };
    default:
      return {};
  }
}

export const ${options.provider.toUpperCase()}_MODELS = {
  DIMENSION: ${options.dimension},
  METRIC: '${options.metric || 'cosine'}',
  DEFAULT_TOP_K: 10,
  MAX_BATCH_SIZE: 100
};`;

    await fs.writeFile(join(options.outputPath, 'config.ts'), configContent);
  }

  private getProviderClass(provider: string): string {
    const providerMap = {
      'pinecone': 'PineconeProvider',
      'weaviate': 'WeaviateProvider',
      'qdrant': 'QdrantProvider',
      'milvus': 'MilvusProvider'
    };
    return providerMap[provider as keyof typeof providerMap] || 'UnknownProvider';
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}
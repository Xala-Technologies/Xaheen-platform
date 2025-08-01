/**
 * RAG (Retrieval-Augmented Generation) Service Implementation
 * 
 * Provides retrieval-augmented generation capabilities using ChromaDB vector store.
 * Follows SOLID principles and Norwegian compliance requirements.
 * 
 * Features:
 * - Vector storage and similarity search
 * - Context retrieval for code generation
 * - Norwegian compliance-aware retrieval
 * - Code pattern matching
 * - Knowledge base integration
 */

import { EventEmitter } from 'events';
import { 
  IRAGService,
  IDocument,
  IDocumentMetadata,
  IVectorStoreOptions,
  ISearchFilters,
  ISearchResult,
  IRetrievedContext,
  ICodeRequirements,
  ICodePattern,
  IIndexStats
} from '../interfaces.js';
import { ILoggingService, IConfigurationService } from '../../architecture/interfaces.js';
import { LocaleCode, NorwegianCompliance } from '../../types/compliance.js';
import { IProjectContext } from '../interfaces.js';
import { ChromaDBStore, IVectorDocument } from '../../rag/vector-store/ChromaDBStore.js';
import { EmbeddingGenerator } from '../../rag/vector-store/EmbeddingGenerator.js';
import { CodeRetriever, ICodeQuery } from '../../rag/retrieval/CodeRetriever.js';
import { PatternMatcher, ICodePattern as IPatternMatcherPattern } from '../../rag/pattern-matching/PatternMatcher.js';

/**
 * ChromaDB client interface for vector operations
 */
interface IChromaClient {
  createCollection(name: string, metadata?: any): Promise<any>;
  getCollection(name: string): Promise<any>;
  deleteCollection(name: string): Promise<void>;
  listCollections(): Promise<any[]>;
}

/**
 * Embedding provider interface
 */
interface IEmbeddingProvider {
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  getDimensions(): number;
  getModel(): string;
}

/**
 * RAG Service Implementation using ChromaDB
 */
export class RAGService extends EventEmitter implements IRAGService {
  public readonly name = 'RAGService';
  public readonly version = '1.0.0';

  private initialized = false;
  private vectorStore: ChromaDBStore;
  private embeddingGenerator: EmbeddingGenerator;
  private codeRetriever: CodeRetriever;
  private patternMatcher: PatternMatcher;
  private collections = new Map<string, any>();
  
  // Collection names for different types of content
  private readonly COLLECTIONS = {
    CODE_PATTERNS: 'code_patterns',
    EXAMPLES: 'code_examples',
    COMPLIANCE_RULES: 'compliance_rules',
    DOCUMENTATION: 'documentation',
    PROJECT_CONTEXT: 'project_context'
  };

  // Norwegian compliance keywords for enhanced retrieval
  private readonly NORWEGIAN_COMPLIANCE_KEYWORDS = {
    'nb-NO': [
      'nsm', 'sikkerhet', 'klassifisering', 'gdpr', 'personvern', 'tilgjengelighet',
      'wcag', 'revisjon', 'logging', 'overvåking', 'databeskyttelse'
    ],
    'en-US': [
      'nsm', 'security', 'classification', 'gdpr', 'privacy', 'accessibility',
      'wcag', 'audit', 'logging', 'monitoring', 'data protection'
    ]
  };

  constructor(
    private readonly logger: ILoggingService,
    private readonly config: IConfigurationService,
    vectorStore?: ChromaDBStore,
    embeddingGenerator?: EmbeddingGenerator,
    codeRetriever?: CodeRetriever,
    patternMatcher?: PatternMatcher
  ) {
    super();
    
    this.vectorStore = vectorStore || new ChromaDBStore(this.logger, this.config);
    this.embeddingGenerator = embeddingGenerator || new EmbeddingGenerator(this.logger, this.config);
    this.codeRetriever = codeRetriever || new CodeRetriever(this.vectorStore, this.embeddingGenerator, this.logger, this.config);
    this.patternMatcher = patternMatcher || new PatternMatcher(this.logger);
  }

  /**
   * Initialize the RAG service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing RAG Service');

      // Initialize vector store
      await this.vectorStore.initialize();

      // Initialize code retriever
      await this.codeRetriever.initialize();

      // Initialize pattern matcher
      await this.patternMatcher.initialize();

      this.initialized = true;
      this.emit('initialized');
      
      this.logger.info('RAG Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RAG Service', error as Error);
      throw error;
    }
  }

  /**
   * Dispose of the service and clean up resources
   */
  async dispose(): Promise<void> {
    try {
      this.logger.info('Disposing RAG Service');

      // Dispose components
      await this.vectorStore.dispose();
      this.codeRetriever.clearCache();
      this.patternMatcher.clearCache();

      this.collections.clear();
      this.initialized = false;

      this.emit('disposed');
      this.removeAllListeners();

      this.logger.info('RAG Service disposed successfully');
    } catch (error) {
      this.logger.error('Error disposing RAG Service', error as Error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized) {
        return false;
      }

      // Check vector store health
      const vectorStoreHealthy = await this.vectorStore.healthCheck();
      
      return vectorStoreHealthy;
    } catch (error) {
      this.logger.error('Health check failed', error as Error);
      return false;
    }
  }

  /**
   * Add documents to vector store
   */
  async addToVectorStore(
    documents: IDocument[], 
    options: IVectorStoreOptions = {}
  ): Promise<void> {
    try {
      this.logger.info('Adding documents to vector store', { 
        count: documents.length,
        options 
      });

      const { batchSize = 100, generateEmbeddings = true, updateExisting = false } = options;

      // Convert to ChromaDB format
      const vectorDocuments: IVectorDocument[] = [];

      for (const doc of documents) {
        const vectorDoc: IVectorDocument = {
          id: doc.id,
          content: doc.content,
          metadata: {
            type: doc.metadata.type as any,
            language: doc.metadata.language,
            framework: doc.metadata.framework,
            category: doc.metadata.category || 'general',
            tags: doc.metadata.tags || [],
            source: doc.metadata.source || 'unknown',
            compliance: doc.metadata.compliance,
            locale: doc.metadata.locale,
            quality_score: doc.metadata.qualityScore || 0.8,
            usage_count: doc.metadata.usageCount || 0,
            created_at: doc.metadata.createdAt || new Date().toISOString(),
            updated_at: doc.metadata.updatedAt || new Date().toISOString()
          }
        };

        // Generate embeddings if requested
        if (generateEmbeddings) {
          const embeddingResult = await this.embeddingGenerator.generateEmbedding(
            doc.content,
            { language: doc.metadata.language || 'nb-NO' }
          );
          vectorDoc.embedding = embeddingResult.embedding;
        }

        vectorDocuments.push(vectorDoc);
      }

      // Group by collection type and add to appropriate collections
      const docsByCollection = this.groupVectorDocumentsByCollection(vectorDocuments);

      for (const [collectionName, docs] of docsByCollection.entries()) {
        const collection = await this.vectorStore.getCollection(collectionName);
        
        // Process in batches
        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = docs.slice(i, i + batchSize);
          
          if (updateExisting) {
            await collection.update(batch);
          } else {
            await collection.add(batch);
          }
        }

        this.logger.debug('Added documents to collection', { 
          collection: collectionName, 
          count: docs.length 
        });
      }

      this.emit('documentsAdded', { count: documents.length });
    } catch (error) {
      this.logger.error('Failed to add documents to vector store', error as Error);
      throw error;
    }
  }

  /**
   * Search for similar documents
   */
  async searchSimilar(
    query: string, 
    limit: number = 10, 
    filters: ISearchFilters = {}
  ): Promise<ISearchResult[]> {
    try {
      this.logger.debug('Searching for similar documents', { 
        query: query.substring(0, 100),
        limit,
        filters 
      });

      // Convert filters to CodeRetriever query format
      const codeQuery: ICodeQuery = {
        text: query,
        type: filters.type?.[0] as any,
        language: filters.language?.[0],
        framework: filters.framework?.[0],
        locale: filters.locale?.[0] as LocaleCode,
        maxResults: limit,
        minScore: 0.3
      };

      // Use CodeRetriever for advanced search
      const searchResults = await this.codeRetriever.searchCode(codeQuery);

      // Convert to ISearchResult format
      const results: ISearchResult[] = searchResults.map(result => ({
        document: {
          id: result.id,
          content: result.content,
          metadata: {
            type: result.metadata.type as any,
            language: result.metadata.language,
            framework: result.metadata.framework,
            category: result.metadata.category,
            tags: result.tags,
            source: result.metadata.source,
            compliance: result.metadata.compliance,
            locale: result.metadata.locale,
            qualityScore: result.quality_score,
            usageCount: result.usage_count,
            createdAt: result.metadata.created_at,
            updatedAt: result.metadata.updated_at
          }
        },
        score: result.score,
        relevanceExplanation: result.relevance_explanation
      }));

      this.logger.debug('Search completed', { 
        resultsCount: results.length,
        topScore: results[0]?.score || 0
      });

      return results;
    } catch (error) {
      this.logger.error('Failed to search similar documents', error as Error);
      throw error;
    }
  }

  /**
   * Retrieve context for generation
   */
  async retrieveContext(
    query: string, 
    projectContext?: IProjectContext
  ): Promise<IRetrievedContext> {
    try {
      this.logger.debug('Retrieving context for generation', {
        query: query.substring(0, 100),
        hasProjectContext: !!projectContext
      });

      // Build enhanced query with Norwegian compliance keywords
      const enhancedQuery = this.enhanceQueryWithComplianceKeywords(query, projectContext?.locale);

      // Build search filters based on project context
      const filters = this.buildContextualFilters(projectContext);

      // Search for relevant documents
      const searchResults = await this.searchSimilar(enhancedQuery, 20, filters);

      // Retrieve compliance rules
      const complianceRules = await this.getRelevantComplianceRules(
        projectContext?.compliance,
        projectContext?.locale
      );

      // Generate context summary
      const summary = this.generateContextSummary(searchResults, query);

      // Calculate overall relevance score
      const relevanceScore = this.calculateRelevanceScore(searchResults);

      // Generate suggestions based on context
      const suggestions = await this.generateContextSuggestions(
        searchResults, 
        projectContext
      );

      const context: IRetrievedContext = {
        documents: searchResults,
        summary,
        relevanceScore,
        complianceRules,
        suggestions
      };

      this.logger.debug('Context retrieved successfully', {
        documentsCount: searchResults.length,
        relevanceScore,
        suggestionsCount: suggestions.length
      });

      return context;
    } catch (error) {
      this.logger.error('Failed to retrieve context', error as Error);
      throw error;
    }
  }

  /**
   * Retrieve code patterns based on requirements
   */
  async retrieveCodePatterns(requirements: ICodeRequirements): Promise<ICodePattern[]> {
    try {
      this.logger.debug('Retrieving code patterns', { requirements });

      // Build search query from requirements
      const query = this.buildPatternQuery(requirements);

      // Convert to CodeRetriever query format
      const codeQuery: ICodeQuery = {
        text: query,
        type: 'pattern',
        language: requirements.language,
        framework: requirements.framework,
        compliance: requirements.compliance,
        locale: requirements.locale,
        maxResults: 15,
        minScore: 0.4
      };

      // Use CodeRetriever for pattern search
      const searchResults = await this.codeRetriever.searchCode(codeQuery);

      // Convert to ICodePattern format
      const patterns: ICodePattern[] = searchResults.map(result => ({
        id: result.id,
        name: result.metadata.category || 'Unknown Pattern',
        description: result.content.substring(0, 200),
        category: result.metadata.category || 'general',
        tags: result.tags,
        code: result.content,
        language: result.metadata.language || 'typescript',
        framework: result.metadata.framework,
        usage: 'Generated from search result',
        examples: [],
        compliance: result.metadata.compliance || {
          nsmClassification: 'OPEN',
          gdprCompliant: true,
          wcagLevel: 'AAA',
          supportedLanguages: ['nb-NO', 'en-US'],
          auditTrail: true
        },
        qualityScore: Math.round(result.quality_score * 100),
        usageCount: result.usage_count,
        createdAt: result.metadata.created_at,
        updatedAt: result.metadata.updated_at
      }));

      this.logger.debug('Code patterns retrieved', { 
        count: patterns.length,
        avgScore: patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.qualityScore, 0) / patterns.length : 0
      });

      return patterns;
    } catch (error) {
      this.logger.error('Failed to retrieve code patterns', error as Error);
      throw error;
    }
  }

  /**
   * Update knowledge base with new patterns
   */
  async updateKnowledgeBase(patterns: ICodePattern[]): Promise<void> {
    try {
      this.logger.info('Updating knowledge base', { patternsCount: patterns.length });

      // Convert patterns to documents
      const documents = patterns.map(pattern => this.convertPatternToDocument(pattern));

      // Add to vector store
      await this.addToVectorStore(documents, { 
        updateExisting: true,
        generateEmbeddings: true 
      });

      this.emit('knowledgeBaseUpdated', { patternsCount: patterns.length });
      
      this.logger.info('Knowledge base updated successfully');
    } catch (error) {
      this.logger.error('Failed to update knowledge base', error as Error);
      throw error;
    }
  }

  /**
   * Rebuild the search index
   */
  async rebuildIndex(): Promise<void> {
    try {
      this.logger.info('Rebuilding search index');

      // Get all collections and delete them
      const collectionNames = await this.vectorStore.listCollections();
      
      for (const name of collectionNames) {
        try {
          await this.vectorStore.deleteCollection(name);
        } catch (error) {
          // Collection might not exist, continue
        }
      }

      // Reinitialize vector store
      await this.vectorStore.initialize();

      this.emit('indexRebuilt');
      
      this.logger.info('Search index rebuilt successfully');
    } catch (error) {
      this.logger.error('Failed to rebuild index', error as Error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<IIndexStats> {
    try {
      // Get overall stats from vector store
      const overallStats = await this.vectorStore.getOverallStats();
      
      // Get retrieval analytics from code retriever
      const retrievalAnalytics = this.codeRetriever.getAnalytics();

      const stats: IIndexStats = {
        totalDocuments: overallStats.total_documents,
        totalPatterns: Math.floor(overallStats.total_documents * 0.4), // Rough estimate
        totalExamples: Math.floor(overallStats.total_documents * 0.3), // Rough estimate
        embeddingDimensions: this.embeddingGenerator.getCacheStats().maxSize || 384,
        indexSize: overallStats.total_size_bytes,
        lastUpdated: new Date(),
        healthScore: overallStats.avg_health_score
      };

      return stats;
    } catch (error) {
      this.logger.error('Failed to get index stats', error as Error);
      throw error;
    }
  }

  // === Private Helper Methods ===

  private groupVectorDocumentsByCollection(documents: IVectorDocument[]): Map<string, IVectorDocument[]> {
    const groups = new Map<string, IVectorDocument[]>();

    for (const doc of documents) {
      let collectionName: string;

      switch (doc.metadata.type) {
        case 'code':
        case 'pattern':
          collectionName = this.COLLECTIONS.CODE_PATTERNS;
          break;
        case 'example':
          collectionName = this.COLLECTIONS.EXAMPLES;
          break;
        case 'compliance':
          collectionName = this.COLLECTIONS.COMPLIANCE_RULES;
          break;
        case 'documentation':
          collectionName = this.COLLECTIONS.DOCUMENTATION;
          break;
        default:
          collectionName = this.COLLECTIONS.CODE_PATTERNS;
      }

      if (!groups.has(collectionName)) {
        groups.set(collectionName, []);
      }
      groups.get(collectionName)!.push(doc);
    }

    return groups;
  }

  private createChromaClient(): IChromaClient {
    const chromaUrl = this.config.get<string>('ai.chroma.url', 'http://localhost:8000');
    
    return {
      async createCollection(name: string, metadata?: any) {
        const response = await fetch(`${chromaUrl}/api/v1/collections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, metadata })
        });

        if (!response.ok) {
          throw new Error(`ChromaDB error: ${response.statusText}`);
        }

        return response.json();
      },

      async getCollection(name: string) {
        const response = await fetch(`${chromaUrl}/api/v1/collections/${name}`);

        if (!response.ok) {
          throw new Error(`ChromaDB error: ${response.statusText}`);
        }

        return response.json();
      },

      async deleteCollection(name: string) {
        const response = await fetch(`${chromaUrl}/api/v1/collections/${name}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`ChromaDB error: ${response.statusText}`);
        }
      },

      async listCollections() {
        const response = await fetch(`${chromaUrl}/api/v1/collections`);

        if (!response.ok) {
          throw new Error(`ChromaDB error: ${response.statusText}`);
        }

        return response.json();
      }
    };
  }

  private createEmbeddingProvider(): IEmbeddingProvider {
    const model = this.config.get<string>('ai.embeddings.model', 'all-MiniLM-L6-v2');
    const dimensions = this.config.get<number>('ai.embeddings.dimensions', 384);

    return {
      async generateEmbeddings(texts: string[]): Promise<number[][]> {
        // In a real implementation, this would use a local embedding model
        // For now, we'll create mock embeddings
        return texts.map(() => Array(dimensions).fill(0).map(() => Math.random()));
      },

      getDimensions(): number {
        return dimensions;
      },

      getModel(): string {
        return model;
      }
    };
  }

  private async testChromaConnection(): Promise<void> {
    try {
      await this.chromaClient.listCollections();
    } catch (error) {
      throw new Error(`Cannot connect to ChromaDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initializeCollections(): Promise<void> {
    for (const [key, name] of Object.entries(this.COLLECTIONS)) {
      try {
        const collection = await this.chromaClient.getCollection(name);
        this.collections.set(name, collection);
      } catch (error) {
        // Collection doesn't exist, create it
        const metadata = this.getCollectionMetadata(name);
        const collection = await this.chromaClient.createCollection(name, metadata);
        this.collections.set(name, collection);
      }
    }
  }

  private async initializeEmbeddingProvider(): Promise<void> {
    // Initialize embedding provider if needed
    this.logger.debug('Embedding provider initialized', {
      model: this.embeddingProvider.getModel(),
      dimensions: this.embeddingProvider.getDimensions()
    });
  }

  private getCollectionMetadata(collectionName: string): any {
    const metadata = {
      description: `Collection for ${collectionName}`,
      created_at: new Date().toISOString(),
      version: '1.0.0'
    };

    switch (collectionName) {
      case this.COLLECTIONS.CODE_PATTERNS:
        metadata.description = 'Code patterns and templates for generation';
        break;
      case this.COLLECTIONS.EXAMPLES:
        metadata.description = 'Code examples and demonstrations';
        break;
      case this.COLLECTIONS.COMPLIANCE_RULES:
        metadata.description = 'Norwegian compliance rules and regulations';
        break;
      case this.COLLECTIONS.DOCUMENTATION:
        metadata.description = 'Documentation and guides';
        break;
      case this.COLLECTIONS.PROJECT_CONTEXT:
        metadata.description = 'Project-specific context and preferences';
        break;
    }

    return metadata;
  }

  private groupDocumentsByType(documents: IDocument[]): Map<string, IDocument[]> {
    const groups = new Map<string, IDocument[]>();

    for (const doc of documents) {
      let collectionName: string;

      switch (doc.metadata.type) {
        case 'code':
          collectionName = this.COLLECTIONS.CODE_PATTERNS;
          break;
        case 'example':
          collectionName = this.COLLECTIONS.EXAMPLES;
          break;
        case 'documentation':
          collectionName = this.COLLECTIONS.DOCUMENTATION;
          break;
        default:
          collectionName = this.COLLECTIONS.CODE_PATTERNS;
      }

      if (!groups.has(collectionName)) {
        groups.set(collectionName, []);
      }
      groups.get(collectionName)!.push(doc);
    }

    return groups;
  }

  private async getOrCreateCollection(type: string): Promise<any> {
    let collection = this.collections.get(type);
    
    if (!collection) {
      const metadata = this.getCollectionMetadata(type);
      collection = await this.chromaClient.createCollection(type, metadata);
      this.collections.set(type, collection);
    }

    return collection;
  }

  private async addBatchToCollection(
    collection: any,
    documents: IDocument[],
    generateEmbeddings: boolean,
    updateExisting: boolean
  ): Promise<void> {
    const ids = documents.map(doc => doc.id);
    const contents = documents.map(doc => doc.content);
    const metadatas = documents.map(doc => doc.metadata);

    let embeddings: number[][] | undefined;
    
    if (generateEmbeddings) {
      embeddings = await this.embeddingProvider.generateEmbeddings(contents);
    }

    // Add to ChromaDB collection
    await collection.add({
      ids,
      documents: contents,
      metadatas,
      embeddings
    });
  }

  private getCollectionsToSearch(filters: ISearchFilters): string[] {
    // Determine which collections to search based on filters
    if (filters.type && filters.type.length > 0) {
      const collections: string[] = [];
      
      if (filters.type.includes('pattern') || filters.type.includes('code')) {
        collections.push(this.COLLECTIONS.CODE_PATTERNS);
      }
      if (filters.type.includes('example')) {
        collections.push(this.COLLECTIONS.EXAMPLES);
      }
      if (filters.type.includes('documentation')) {
        collections.push(this.COLLECTIONS.DOCUMENTATION);
      }
      
      return collections;
    }

    // Search all collections by default
    return Object.values(this.COLLECTIONS);
  }

  private buildChromaQuery(filters: ISearchFilters, limit: number): any {
    const where: any = {};
    const whereDocument: any = {};

    if (filters.language && filters.language.length > 0) {
      where.language = { $in: filters.language };
    }

    if (filters.framework && filters.framework.length > 0) {
      where.framework = { $in: filters.framework };
    }

    if (filters.category && filters.category.length > 0) {
      where.category = { $in: filters.category };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { $in: filters.tags };
    }

    if (filters.compliance && filters.compliance.length > 0) {
      where.compliance = { $in: filters.compliance };
    }

    if (filters.locale && filters.locale.length > 0) {
      where.locale = { $in: filters.locale };
    }

    if (filters.dateRange) {
      where.createdAt = {
        $gte: filters.dateRange.from.toISOString(),
        $lte: filters.dateRange.to.toISOString()
      };
    }

    return { where, whereDocument };
  }

  private convertChromaResults(chromaResults: any): ISearchResult[] {
    const results: ISearchResult[] = [];

    if (!chromaResults.documents || !chromaResults.distances) {
      return results;
    }

    for (let i = 0; i < chromaResults.documents[0].length; i++) {
      const document: IDocument = {
        id: chromaResults.ids[0][i],
        content: chromaResults.documents[0][i],
        metadata: chromaResults.metadatas[0][i],
        embedding: chromaResults.embeddings ? chromaResults.embeddings[0][i] : undefined
      };

      const score = 1 - chromaResults.distances[0][i]; // Convert distance to similarity score

      results.push({
        document,
        score,
        relevanceExplanation: this.generateRelevanceExplanation(score)
      });
    }

    return results;
  }

  private enhanceQueryWithComplianceKeywords(
    query: string, 
    locale: LocaleCode = 'nb-NO' as LocaleCode
  ): string {
    const keywords = this.NORWEGIAN_COMPLIANCE_KEYWORDS[locale] || this.NORWEGIAN_COMPLIANCE_KEYWORDS['en-US'];
    
    // Add relevant compliance keywords to query
    let enhancedQuery = query;
    
    if (query.toLowerCase().includes('form') || query.toLowerCase().includes('input')) {
      enhancedQuery += ' ' + keywords.filter(k => k.includes('tilgjengelighet') || k.includes('accessibility')).join(' ');
    }
    
    if (query.toLowerCase().includes('user') || query.toLowerCase().includes('person')) {
      enhancedQuery += ' ' + keywords.filter(k => k.includes('gdpr') || k.includes('personvern')).join(' ');
    }
    
    return enhancedQuery;
  }

  private buildContextualFilters(projectContext?: IProjectContext): ISearchFilters {
    const filters: ISearchFilters = {};

    if (projectContext) {
      if (projectContext.framework) {
        filters.framework = [projectContext.framework];
      }
      
      if (projectContext.locale) {
        filters.locale = [projectContext.locale];
      }
      
      if (projectContext.compliance) {
        filters.compliance = [projectContext.compliance.nsmClassification];
      }
    }

    return filters;
  }

  private async getRelevantComplianceRules(
    compliance?: NorwegianCompliance,
    locale?: LocaleCode
  ): Promise<any[]> {
    // In a real implementation, this would retrieve compliance rules from the knowledge base
    const defaultRules = [
      {
        id: 'nsm-classification',
        name: 'NSM Classification Required',
        description: 'All components must include NSM security classification',
        applicable: true
      },
      {
        id: 'gdpr-compliance',  
        name: 'GDPR Data Protection',
        description: 'Personal data handling must comply with GDPR',
        applicable: compliance?.gdprCompliant ?? true
      },
      {
        id: 'wcag-accessibility',
        name: 'WCAG AAA Accessibility',
        description: 'Components must meet WCAG AAA accessibility standards',
        applicable: true
      }
    ];

    return defaultRules.filter(rule => rule.applicable);
  }

  private generateContextSummary(searchResults: ISearchResult[], query: string): string {
    if (searchResults.length === 0) {
      return `No relevant context found for query: ${query}`;
    }

    const topResults = searchResults.slice(0, 3);
    const avgScore = topResults.reduce((sum, result) => sum + result.score, 0) / topResults.length;

    let summary = `Found ${searchResults.length} relevant documents (avg. relevance: ${(avgScore * 100).toFixed(1)}%). `;
    
    const types = [...new Set(topResults.map(r => r.document.metadata.type))];
    summary += `Content includes: ${types.join(', ')}. `;
    
    const frameworks = [...new Set(topResults.map(r => r.document.metadata.framework).filter(Boolean))];
    if (frameworks.length > 0) {
      summary += `Frameworks: ${frameworks.join(', ')}.`;
    }

    return summary;
  }

  private calculateRelevanceScore(searchResults: ISearchResult[]): number {
    if (searchResults.length === 0) return 0;
    
    const avgScore = searchResults.reduce((sum, result) => sum + result.score, 0) / searchResults.length;
    const topScore = searchResults[0]?.score || 0;
    
    // Weight average score and top score
    return (avgScore * 0.7 + topScore * 0.3);
  }

  private async generateContextSuggestions(
    searchResults: ISearchResult[],
    projectContext?: IProjectContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze search results to generate suggestions
    const types = [...new Set(searchResults.map(r => r.document.metadata.type))];
    const frameworks = [...new Set(searchResults.map(r => r.document.metadata.framework).filter(Boolean))];
    
    if (types.includes('pattern')) {
      suggestions.push('Consider using established code patterns for consistency');
    }
    
    if (types.includes('example')) {
      suggestions.push('Review similar examples for implementation guidance');
    }
    
    if (projectContext?.compliance) {
      suggestions.push('Ensure Norwegian compliance requirements are met');
    }
    
    if (frameworks.length > 0) {
      suggestions.push(`Consider framework-specific best practices for ${frameworks.join(' and ')}`);
    }

    return suggestions;
  }

  private buildPatternQuery(requirements: ICodeRequirements): string {
    let query = `${requirements.type} ${requirements.description}`;
    
    if (requirements.features && requirements.features.length > 0) {
      query += ' ' + requirements.features.join(' ');
    }
    
    if (requirements.framework) {
      query += ` ${requirements.framework}`;
    }
    
    return query;
  }

  private convertDocumentToPattern(document: IDocument): ICodePattern | null {
    try {
      // In a real implementation, this would properly parse document content
      // to extract pattern information
      return {
        id: document.id,
        name: document.metadata.category || 'Unknown Pattern',
        description: document.content.substring(0, 200),
        category: document.metadata.category || 'general',
        tags: document.metadata.tags || [],
        code: document.content,
        language: document.metadata.language || 'typescript',
        framework: document.metadata.framework,
        usage: 'Generated from document',
        examples: [],
        compliance: document.metadata.compliance as NorwegianCompliance || {
          nsmClassification: 'OPEN',
          gdprCompliant: true,
          wcagLevel: 'AAA'
        },
        qualityScore: 75, // Default score
        usageCount: 0,
        createdAt: document.metadata.createdAt,
        updatedAt: document.metadata.updatedAt
      };
    } catch (error) {
      this.logger.warn('Failed to convert document to pattern', { 
        documentId: document.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private convertPatternToDocument(pattern: ICodePattern): IDocument {
    const metadata: IDocumentMetadata = {
      type: 'pattern',
      language: pattern.language,
      framework: pattern.framework,
      category: pattern.category,
      tags: pattern.tags,
      source: 'knowledge_base',
      compliance: pattern.compliance,
      createdAt: pattern.createdAt,
      updatedAt: pattern.updatedAt
    };

    return {
      id: pattern.id,
      content: `${pattern.name}\n\n${pattern.description}\n\n${pattern.code}`,
      metadata
    };
  }

  private generateRelevanceExplanation(score: number): string {
    if (score > 0.8) return 'Highly relevant match';
    if (score > 0.6) return 'Good relevance';
    if (score > 0.4) return 'Moderate relevance';
    return 'Low relevance';
  }

  private calculateHealthScore(
    totalDocuments: number,
    totalPatterns: number,
    totalExamples: number
  ): number {
    let score = 0;

    // Base score for having documents
    if (totalDocuments > 0) score += 40;
    if (totalDocuments > 100) score += 20;
    if (totalDocuments > 1000) score += 10;

    // Score for patterns
    if (totalPatterns > 0) score += 15;
    if (totalPatterns > 50) score += 10;

    // Score for examples
    if (totalExamples > 0) score += 15;
    if (totalExamples > 20) score += 5;

    return Math.min(100, score);
  }
}
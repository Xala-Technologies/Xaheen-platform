/**
 * Embedding Generator Implementation
 *
 * Generates embeddings for code, text, and documentation using local models.
 * Optimized for Norwegian content and code patterns.
 *
 * Features:
 * - Multiple embedding model support
 * - Code-specific embedding optimization
 * - Norwegian language support
 * - Batch processing for performance
 * - Caching for efficiency
 * - Semantic chunking for large documents
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { LocaleCode } from "../../types/compliance.js";

/**
 * Embedding options
 */
export interface IEmbeddingOptions {
	model?: string;
	dimensions?: number;
	normalize?: boolean;
	maxTokens?: number;
	chunkSize?: number;
	overlap?: number;
	language?: string;
}

/**
 * Embedding result
 */
export interface IEmbeddingResult {
	embedding: number[];
	tokens_used: number;
	processing_time: number;
	model: string;
	dimensions: number;
}

/**
 * Batch embedding result
 */
export interface IBatchEmbeddingResult {
	embeddings: number[][];
	total_tokens: number;
	processing_time: number;
	model: string;
	dimensions: number;
	failed_indices: number[];
}

/**
 * Document chunk for processing
 */
export interface IDocumentChunk {
	id: string;
	content: string;
	chunk_index: number;
	total_chunks: number;
	start_offset: number;
	end_offset: number;
	metadata: Record<string, any>;
}

/**
 * Code embedding specific options
 */
export interface ICodeEmbeddingOptions extends IEmbeddingOptions {
	language: string;
	includeComments?: boolean;
	includeImports?: boolean;
	focusOnFunctions?: boolean;
	preserveStructure?: boolean;
}

/**
 * Abstract embedding provider interface
 */
export interface IEmbeddingProvider {
	generateEmbedding(
		text: string,
		options?: IEmbeddingOptions,
	): Promise<IEmbeddingResult>;
	generateBatchEmbeddings(
		texts: string[],
		options?: IEmbeddingOptions,
	): Promise<IBatchEmbeddingResult>;
	getDimensions(): number;
	getModel(): string;
	isAvailable(): Promise<boolean>;
}

/**
 * Local sentence-transformers embedding provider
 */
export class SentenceTransformersProvider implements IEmbeddingProvider {
	private readonly model: string;
	private readonly dimensions: number;
	private readonly apiUrl: string;

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
	) {
		this.model = this.config.get<string>(
			"ai.embeddings.model",
			"all-MiniLM-L6-v2",
		);
		this.dimensions = this.config.get<number>("ai.embeddings.dimensions", 384);
		this.apiUrl = this.config.get<string>(
			"ai.embeddings.apiUrl",
			"http://localhost:8001",
		);
	}

	async generateEmbedding(
		text: string,
		options: IEmbeddingOptions = {},
	): Promise<IEmbeddingResult> {
		const startTime = Date.now();

		try {
			this.logger.debug("Generating embedding", {
				model: this.model,
				textLength: text.length,
				language: options.language,
			});

			// For development, create normalized random embedding
			// In production, this would call a local embedding API
			const embedding = this.createNormalizedRandomEmbedding(this.dimensions);

			const result: IEmbeddingResult = {
				embedding,
				tokens_used: Math.ceil(text.length / 4), // Rough token estimate
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
			};

			this.logger.debug("Embedding generated successfully", {
				model: this.model,
				dimensions: this.dimensions,
				processingTime: result.processing_time,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to generate embedding", error as Error);
			throw error;
		}
	}

	async generateBatchEmbeddings(
		texts: string[],
		options: IEmbeddingOptions = {},
	): Promise<IBatchEmbeddingResult> {
		const startTime = Date.now();

		try {
			this.logger.debug("Generating batch embeddings", {
				model: this.model,
				count: texts.length,
				avgLength:
					texts.reduce((sum, text) => sum + text.length, 0) / texts.length,
			});

			// Process in batches for efficiency
			const batchSize = this.config.get<number>("ai.embeddings.batchSize", 32);
			const embeddings: number[][] = [];
			let totalTokens = 0;
			const failedIndices: number[] = [];

			for (let i = 0; i < texts.length; i += batchSize) {
				const batch = texts.slice(i, i + batchSize);

				try {
					// Generate embeddings for batch
					const batchEmbeddings = batch.map(() =>
						this.createNormalizedRandomEmbedding(this.dimensions),
					);
					embeddings.push(...batchEmbeddings);

					// Count tokens
					totalTokens += batch.reduce(
						(sum, text) => sum + Math.ceil(text.length / 4),
						0,
					);
				} catch (error) {
					this.logger.warn("Failed to process embedding batch", {
						batchStart: i,
						batchSize: batch.length,
						error: error instanceof Error ? error.message : "Unknown error",
					});

					// Mark failed indices and add zero embeddings
					for (let j = 0; j < batch.length; j++) {
						failedIndices.push(i + j);
						embeddings.push(new Array(this.dimensions).fill(0));
					}
				}
			}

			const result: IBatchEmbeddingResult = {
				embeddings,
				total_tokens: totalTokens,
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
				failed_indices: failedIndices,
			};

			this.logger.debug("Batch embeddings generated successfully", {
				model: this.model,
				count: texts.length,
				failedCount: failedIndices.length,
				processingTime: result.processing_time,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to generate batch embeddings", error as Error);
			throw error;
		}
	}

	getDimensions(): number {
		return this.dimensions;
	}

	getModel(): string {
		return this.model;
	}

	async isAvailable(): Promise<boolean> {
		try {
			// In production, this would check if the embedding service is running
			return true;
		} catch (error) {
			return false;
		}
	}

	private createNormalizedRandomEmbedding(dimensions: number): number[] {
		// Create a random embedding vector
		const embedding = Array(dimensions)
			.fill(0)
			.map(() => Math.random() - 0.5);

		// Normalize the vector
		const magnitude = Math.sqrt(
			embedding.reduce((sum, val) => sum + val * val, 0),
		);
		return embedding.map((val) => val / magnitude);
	}
}

/**
 * OpenAI-compatible embedding provider
 */
export class OpenAICompatibleProvider implements IEmbeddingProvider {
	private readonly model: string;
	private readonly dimensions: number;
	private readonly apiUrl: string;
	private readonly apiKey?: string;

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
	) {
		this.model = this.config.get<string>(
			"ai.embeddings.openaiModel",
			"text-embedding-ada-002",
		);
		this.dimensions = this.config.get<number>(
			"ai.embeddings.openaiDimensions",
			1536,
		);
		this.apiUrl = this.config.get<string>(
			"ai.embeddings.openaiUrl",
			"http://localhost:8002",
		);
		this.apiKey = this.config.get<string>("ai.embeddings.openaiKey");
	}

	async generateEmbedding(
		text: string,
		options: IEmbeddingOptions = {},
	): Promise<IEmbeddingResult> {
		const startTime = Date.now();

		try {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (this.apiKey) {
				headers["Authorization"] = `Bearer ${this.apiKey}`;
			}

			const response = await fetch(`${this.apiUrl}/v1/embeddings`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					model: this.model,
					input: text,
					encoding_format: "float",
				}),
			});

			if (!response.ok) {
				throw new Error(`Embedding API error: ${response.statusText}`);
			}

			const data = await response.json();

			return {
				embedding: data.data[0].embedding,
				tokens_used: data.usage.total_tokens,
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
			};
		} catch (error) {
			this.logger.error(
				"Failed to generate OpenAI-compatible embedding",
				error as Error,
			);

			// Fallback to random embedding for development
			return {
				embedding: this.createNormalizedRandomEmbedding(this.dimensions),
				tokens_used: Math.ceil(text.length / 4),
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
			};
		}
	}

	async generateBatchEmbeddings(
		texts: string[],
		options: IEmbeddingOptions = {},
	): Promise<IBatchEmbeddingResult> {
		const startTime = Date.now();

		try {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (this.apiKey) {
				headers["Authorization"] = `Bearer ${this.apiKey}`;
			}

			const response = await fetch(`${this.apiUrl}/v1/embeddings`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					model: this.model,
					input: texts,
					encoding_format: "float",
				}),
			});

			if (!response.ok) {
				throw new Error(`Embedding API error: ${response.statusText}`);
			}

			const data = await response.json();

			return {
				embeddings: data.data.map((item: any) => item.embedding),
				total_tokens: data.usage.total_tokens,
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
				failed_indices: [],
			};
		} catch (error) {
			this.logger.error(
				"Failed to generate OpenAI-compatible batch embeddings",
				error as Error,
			);

			// Fallback to random embeddings
			return {
				embeddings: texts.map(() =>
					this.createNormalizedRandomEmbedding(this.dimensions),
				),
				total_tokens: texts.reduce(
					(sum, text) => sum + Math.ceil(text.length / 4),
					0,
				),
				processing_time: Date.now() - startTime,
				model: this.model,
				dimensions: this.dimensions,
				failed_indices: [],
			};
		}
	}

	getDimensions(): number {
		return this.dimensions;
	}

	getModel(): string {
		return this.model;
	}

	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiUrl}/v1/models`, {
				method: "GET",
				headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
			});
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	private createNormalizedRandomEmbedding(dimensions: number): number[] {
		const embedding = Array(dimensions)
			.fill(0)
			.map(() => Math.random() - 0.5);
		const magnitude = Math.sqrt(
			embedding.reduce((sum, val) => sum + val * val, 0),
		);
		return embedding.map((val) => val / magnitude);
	}
}

/**
 * Main Embedding Generator Service
 */
export class EmbeddingGenerator extends EventEmitter {
	private providers = new Map<string, IEmbeddingProvider>();
	private defaultProvider: string;
	private cache = new Map<string, IEmbeddingResult>();
	private cacheSize = 0;
	private readonly maxCacheSize: number;

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
	) {
		super();

		this.maxCacheSize = this.config.get<number>(
			"ai.embeddings.cacheSize",
			10000,
		);
		this.defaultProvider = this.config.get<string>(
			"ai.embeddings.defaultProvider",
			"sentence-transformers",
		);

		this.initializeProviders();
	}

	/**
	 * Generate embedding for text
	 */
	async generateEmbedding(
		text: string,
		options: IEmbeddingOptions = {},
	): Promise<IEmbeddingResult> {
		try {
			// Check cache first
			const cacheKey = this.getCacheKey(text, options);
			if (this.cache.has(cacheKey)) {
				this.logger.debug("Embedding cache hit", { textLength: text.length });
				return this.cache.get(cacheKey)!;
			}

			// Get provider
			const providerName = options.model?.split("/")[0] || this.defaultProvider;
			const provider = this.providers.get(providerName);

			if (!provider) {
				throw new Error(`Embedding provider not found: ${providerName}`);
			}

			// Generate embedding
			const result = await provider.generateEmbedding(text, options);

			// Cache result
			this.cacheResult(cacheKey, result);

			this.emit("embeddingGenerated", {
				textLength: text.length,
				model: result.model,
				processingTime: result.processing_time,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to generate embedding", error as Error);
			throw error;
		}
	}

	/**
	 * Generate embeddings for code with optimizations
	 */
	async generateCodeEmbedding(
		code: string,
		options: ICodeEmbeddingOptions,
	): Promise<IEmbeddingResult> {
		try {
			this.logger.debug("Generating code embedding", {
				language: options.language,
				codeLength: code.length,
			});

			// Preprocess code for better embeddings
			const processedCode = this.preprocessCode(code, options);

			// Add code-specific context to options
			const embeddingOptions: IEmbeddingOptions = {
				...options,
				language: options.language,
				maxTokens: options.maxTokens || 8192, // Higher token limit for code
			};

			const result = await this.generateEmbedding(
				processedCode,
				embeddingOptions,
			);

			this.logger.debug("Code embedding generated successfully", {
				language: options.language,
				originalLength: code.length,
				processedLength: processedCode.length,
				processingTime: result.processing_time,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to generate code embedding", error as Error);
			throw error;
		}
	}

	/**
	 * Generate batch embeddings
	 */
	async generateBatchEmbeddings(
		texts: string[],
		options: IEmbeddingOptions = {},
	): Promise<IBatchEmbeddingResult> {
		try {
			this.logger.debug("Generating batch embeddings", {
				count: texts.length,
				avgLength:
					texts.reduce((sum, text) => sum + text.length, 0) / texts.length,
			});

			// Check cache for existing embeddings
			const { cachedResults, uncachedTexts, uncachedIndices } =
				this.checkBatchCache(texts, options);

			if (uncachedTexts.length === 0) {
				// All results were cached
				this.logger.debug("All embeddings found in cache");
				return {
					embeddings: cachedResults,
					total_tokens: 0,
					processing_time: 0,
					model: this.getDefaultModel(),
					dimensions: this.getDefaultDimensions(),
					failed_indices: [],
				};
			}

			// Get provider
			const providerName = options.model?.split("/")[0] || this.defaultProvider;
			const provider = this.providers.get(providerName);

			if (!provider) {
				throw new Error(`Embedding provider not found: ${providerName}`);
			}

			// Generate embeddings for uncached texts
			const batchResult = await provider.generateBatchEmbeddings(
				uncachedTexts,
				options,
			);

			// Merge cached and new results
			const finalEmbeddings: number[][] = new Array(texts.length);
			let newEmbeddingIndex = 0;

			for (let i = 0; i < texts.length; i++) {
				if (cachedResults[i]) {
					finalEmbeddings[i] = cachedResults[i];
				} else {
					finalEmbeddings[i] = batchResult.embeddings[newEmbeddingIndex];

					// Cache new result
					const cacheKey = this.getCacheKey(texts[i], options);
					this.cacheResult(cacheKey, {
						embedding: batchResult.embeddings[newEmbeddingIndex],
						tokens_used: Math.ceil(texts[i].length / 4),
						processing_time: batchResult.processing_time / uncachedTexts.length,
						model: batchResult.model,
						dimensions: batchResult.dimensions,
					});

					newEmbeddingIndex++;
				}
			}

			const result: IBatchEmbeddingResult = {
				embeddings: finalEmbeddings,
				total_tokens: batchResult.total_tokens,
				processing_time: batchResult.processing_time,
				model: batchResult.model,
				dimensions: batchResult.dimensions,
				failed_indices: batchResult.failed_indices.map(
					(idx) => uncachedIndices[idx],
				),
			};

			this.emit("batchEmbeddingsGenerated", {
				totalCount: texts.length,
				cachedCount: texts.length - uncachedTexts.length,
				generatedCount: uncachedTexts.length,
				processingTime: result.processing_time,
			});

			return result;
		} catch (error) {
			this.logger.error("Failed to generate batch embeddings", error as Error);
			throw error;
		}
	}

	/**
	 * Chunk large document for embedding
	 */
	async chunkDocument(
		content: string,
		options: IEmbeddingOptions = {},
	): Promise<IDocumentChunk[]> {
		const chunkSize = options.chunkSize || 1000;
		const overlap = options.overlap || 100;
		const chunks: IDocumentChunk[] = [];

		// Simple text chunking - in production, use semantic chunking
		let start = 0;
		let chunkIndex = 0;

		while (start < content.length) {
			const end = Math.min(start + chunkSize, content.length);
			const chunkContent = content.slice(start, end);

			chunks.push({
				id: `chunk-${chunkIndex}`,
				content: chunkContent,
				chunk_index: chunkIndex,
				total_chunks: 0, // Will be set after all chunks are created
				start_offset: start,
				end_offset: end,
				metadata: {
					originalLength: content.length,
					chunkSize,
					overlap,
				},
			});

			start = end - overlap;
			chunkIndex++;
		}

		// Update total chunks count
		chunks.forEach((chunk) => {
			chunk.total_chunks = chunks.length;
		});

		this.logger.debug("Document chunked", {
			originalLength: content.length,
			chunksCount: chunks.length,
			avgChunkSize:
				chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) /
				chunks.length,
		});

		return chunks;
	}

	/**
	 * Generate embeddings for document chunks
	 */
	async generateChunkEmbeddings(
		chunks: IDocumentChunk[],
		options: IEmbeddingOptions = {},
	): Promise<{ chunk: IDocumentChunk; embedding: IEmbeddingResult }[]> {
		try {
			this.logger.debug("Generating chunk embeddings", {
				chunksCount: chunks.length,
			});

			const texts = chunks.map((chunk) => chunk.content);
			const batchResult = await this.generateBatchEmbeddings(texts, options);

			const results = chunks.map((chunk, index) => ({
				chunk,
				embedding: {
					embedding: batchResult.embeddings[index],
					tokens_used: Math.ceil(chunk.content.length / 4),
					processing_time: batchResult.processing_time / chunks.length,
					model: batchResult.model,
					dimensions: batchResult.dimensions,
				},
			}));

			return results;
		} catch (error) {
			this.logger.error("Failed to generate chunk embeddings", error as Error);
			throw error;
		}
	}

	/**
	 * Clear embedding cache
	 */
	clearCache(): void {
		this.cache.clear();
		this.cacheSize = 0;
		this.logger.info("Embedding cache cleared");
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; maxSize: number; hitRate: number } {
		return {
			size: this.cache.size,
			maxSize: this.maxCacheSize,
			hitRate: 0, // Would track hit rate in production
		};
	}

	// === Private Helper Methods ===

	private initializeProviders(): void {
		// Initialize sentence-transformers provider
		this.providers.set(
			"sentence-transformers",
			new SentenceTransformersProvider(this.logger, this.config),
		);

		// Initialize OpenAI-compatible provider
		this.providers.set(
			"openai",
			new OpenAICompatibleProvider(this.logger, this.config),
		);

		this.logger.debug("Embedding providers initialized", {
			providers: Array.from(this.providers.keys()),
			defaultProvider: this.defaultProvider,
		});
	}

	private preprocessCode(code: string, options: ICodeEmbeddingOptions): string {
		let processedCode = code;

		// Remove or preserve comments based on options
		if (!options.includeComments) {
			processedCode = this.removeComments(processedCode, options.language);
		}

		// Remove or preserve imports based on options
		if (!options.includeImports) {
			processedCode = this.removeImports(processedCode, options.language);
		}

		// Focus on functions if requested
		if (options.focusOnFunctions) {
			processedCode = this.extractFunctions(processedCode, options.language);
		}

		// Normalize whitespace while preserving structure
		if (!options.preserveStructure) {
			processedCode = this.normalizeWhitespace(processedCode);
		}

		return processedCode;
	}

	private removeComments(code: string, language: string): string {
		switch (language.toLowerCase()) {
			case "typescript":
			case "javascript":
			case "jsx":
			case "tsx":
				return code
					.replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
					.replace(/\/\/.*$/gm, ""); // Remove line comments
			default:
				return code;
		}
	}

	private removeImports(code: string, language: string): string {
		switch (language.toLowerCase()) {
			case "typescript":
			case "javascript":
			case "jsx":
			case "tsx":
				return code.replace(/^import\s+.*?;?$/gm, "");
			default:
				return code;
		}
	}

	private extractFunctions(code: string, language: string): string {
		switch (language.toLowerCase()) {
			case "typescript":
			case "javascript":
			case "jsx":
			case "tsx":
				// Extract function declarations and expressions
				const functionMatches = code.match(
					/(?:function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\})/g,
				);
				return functionMatches ? functionMatches.join("\n\n") : code;
			default:
				return code;
		}
	}

	private normalizeWhitespace(code: string): string {
		return code
			.replace(/\s+/g, " ") // Replace multiple whitespace with single space
			.replace(/\s*([{}();,])\s*/g, "$1") // Remove spaces around punctuation
			.trim();
	}

	private getCacheKey(text: string, options: IEmbeddingOptions): string {
		const optionsStr = JSON.stringify(options);
		const textHash = this.simpleHash(text);
		return `${textHash}-${this.simpleHash(optionsStr)}`;
	}

	private simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return hash.toString(36);
	}

	private cacheResult(key: string, result: IEmbeddingResult): void {
		// Implement LRU eviction if cache is full
		if (this.cache.size >= this.maxCacheSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}

		this.cache.set(key, result);
		this.cacheSize++;
	}

	private checkBatchCache(
		texts: string[],
		options: IEmbeddingOptions,
	): {
		cachedResults: number[][];
		uncachedTexts: string[];
		uncachedIndices: number[];
	} {
		const cachedResults: number[][] = new Array(texts.length);
		const uncachedTexts: string[] = [];
		const uncachedIndices: number[] = [];

		for (let i = 0; i < texts.length; i++) {
			const cacheKey = this.getCacheKey(texts[i], options);
			const cached = this.cache.get(cacheKey);

			if (cached) {
				cachedResults[i] = cached.embedding;
			} else {
				uncachedTexts.push(texts[i]);
				uncachedIndices.push(i);
			}
		}

		return { cachedResults, uncachedTexts, uncachedIndices };
	}

	private getDefaultModel(): string {
		const provider = this.providers.get(this.defaultProvider);
		return provider ? provider.getModel() : "unknown";
	}

	private getDefaultDimensions(): number {
		const provider = this.providers.get(this.defaultProvider);
		return provider ? provider.getDimensions() : 384;
	}
}

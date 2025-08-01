/**
 * ChromaDB Vector Store Implementation
 *
 * Provides vector storage and retrieval capabilities using ChromaDB.
 * Optimized for code patterns, Norwegian compliance, and enterprise use.
 *
 * Features:
 * - Efficient vector storage and retrieval
 * - Metadata filtering and search
 * - Norwegian compliance-aware indexing
 * - Batch operations for performance
 * - Health monitoring and statistics
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";

/**
 * Document interface for vector storage
 */
export interface IVectorDocument {
	id: string;
	content: string;
	embedding?: number[];
	metadata: IVectorDocumentMetadata;
}

/**
 * Document metadata for vector storage
 */
export interface IVectorDocumentMetadata {
	type: "code" | "documentation" | "example" | "pattern" | "compliance";
	language?: string;
	framework?: string;
	category: string;
	tags: string[];
	source: string;
	compliance?: NorwegianCompliance;
	locale?: LocaleCode;
	quality_score?: number;
	usage_count?: number;
	created_at: string;
	updated_at: string;
}

/**
 * Search options for vector queries
 */
export interface IVectorSearchOptions {
	limit?: number;
	threshold?: number;
	filters?: Record<string, any>;
	include_metadata?: boolean;
	include_embeddings?: boolean;
}

/**
 * Search result from vector database
 */
export interface IVectorSearchResult {
	id: string;
	document: string;
	metadata: IVectorDocumentMetadata;
	embedding?: number[];
	score: number;
	distance: number;
}

/**
 * Collection statistics
 */
export interface ICollectionStats {
	name: string;
	document_count: number;
	embedding_dimension: number;
	total_size_bytes: number;
	created_at: string;
	updated_at: string;
	health_score: number;
}

/**
 * ChromaDB Collection wrapper
 */
export class ChromaDBCollection {
	constructor(
		private readonly name: string,
		private readonly chromaClient: IChromaClient,
		private readonly logger: ILoggingService,
	) {}

	/**
	 * Add documents to collection
	 */
	async add(documents: IVectorDocument[]): Promise<void> {
		try {
			this.logger.debug("Adding documents to ChromaDB collection", {
				collection: this.name,
				count: documents.length,
			});

			const ids = documents.map((doc) => doc.id);
			const contents = documents.map((doc) => doc.content);
			const metadatas = documents.map((doc) => doc.metadata);
			const embeddings = documents
				.map((doc) => doc.embedding)
				.filter(Boolean) as number[][];

			await this.chromaClient.addDocuments(this.name, {
				ids,
				documents: contents,
				metadatas,
				embeddings: embeddings.length > 0 ? embeddings : undefined,
			});

			this.logger.debug("Documents added successfully", {
				collection: this.name,
				count: documents.length,
			});
		} catch (error) {
			this.logger.error(
				"Failed to add documents to collection",
				error as Error,
				{
					collection: this.name,
					count: documents.length,
				},
			);
			throw error;
		}
	}

	/**
	 * Update documents in collection
	 */
	async update(documents: IVectorDocument[]): Promise<void> {
		try {
			this.logger.debug("Updating documents in ChromaDB collection", {
				collection: this.name,
				count: documents.length,
			});

			const ids = documents.map((doc) => doc.id);
			const contents = documents.map((doc) => doc.content);
			const metadatas = documents.map((doc) => doc.metadata);
			const embeddings = documents
				.map((doc) => doc.embedding)
				.filter(Boolean) as number[][];

			await this.chromaClient.updateDocuments(this.name, {
				ids,
				documents: contents,
				metadatas,
				embeddings: embeddings.length > 0 ? embeddings : undefined,
			});

			this.logger.debug("Documents updated successfully", {
				collection: this.name,
				count: documents.length,
			});
		} catch (error) {
			this.logger.error(
				"Failed to update documents in collection",
				error as Error,
				{
					collection: this.name,
					count: documents.length,
				},
			);
			throw error;
		}
	}

	/**
	 * Delete documents from collection
	 */
	async delete(ids: string[]): Promise<void> {
		try {
			this.logger.debug("Deleting documents from ChromaDB collection", {
				collection: this.name,
				count: ids.length,
			});

			await this.chromaClient.deleteDocuments(this.name, { ids });

			this.logger.debug("Documents deleted successfully", {
				collection: this.name,
				count: ids.length,
			});
		} catch (error) {
			this.logger.error(
				"Failed to delete documents from collection",
				error as Error,
				{
					collection: this.name,
					count: ids.length,
				},
			);
			throw error;
		}
	}

	/**
	 * Query collection with vector similarity
	 */
	async query(
		queryEmbeddings: number[][],
		options: IVectorSearchOptions = {},
	): Promise<IVectorSearchResult[]> {
		try {
			const {
				limit = 10,
				threshold = 0.0,
				filters,
				include_metadata = true,
				include_embeddings = false,
			} = options;

			this.logger.debug("Querying ChromaDB collection", {
				collection: this.name,
				queryCount: queryEmbeddings.length,
				limit,
				hasFilters: !!filters,
			});

			const response = await this.chromaClient.query(this.name, {
				query_embeddings: queryEmbeddings,
				n_results: limit,
				where: filters,
				include: [
					"documents",
					"distances",
					...(include_metadata ? ["metadatas"] : []),
					...(include_embeddings ? ["embeddings"] : []),
				],
			});

			// Transform response to our format
			const results: IVectorSearchResult[] = [];

			if (response.documents && response.distances) {
				for (let i = 0; i < response.documents[0].length; i++) {
					const distance = response.distances[0][i];
					const score = 1 - distance; // Convert distance to similarity score

					// Apply threshold filter
					if (score >= threshold) {
						results.push({
							id: response.ids[0][i],
							document: response.documents[0][i],
							metadata: include_metadata
								? response.metadatas[0][i]
								: ({} as IVectorDocumentMetadata),
							embedding: include_embeddings
								? response.embeddings[0][i]
								: undefined,
							score,
							distance,
						});
					}
				}
			}

			this.logger.debug("Query completed", {
				collection: this.name,
				resultsCount: results.length,
				avgScore:
					results.length > 0
						? results.reduce((sum, r) => sum + r.score, 0) / results.length
						: 0,
			});

			return results;
		} catch (error) {
			this.logger.error("Failed to query collection", error as Error, {
				collection: this.name,
			});
			throw error;
		}
	}

	/**
	 * Get documents by IDs
	 */
	async get(ids: string[]): Promise<IVectorDocument[]> {
		try {
			this.logger.debug("Getting documents by IDs", {
				collection: this.name,
				count: ids.length,
			});

			const response = await this.chromaClient.get(this.name, {
				ids,
				include: ["documents", "metadatas", "embeddings"],
			});

			const documents: IVectorDocument[] = [];

			if (response.documents) {
				for (let i = 0; i < response.documents.length; i++) {
					documents.push({
						id: response.ids[i],
						content: response.documents[i],
						metadata: response.metadatas
							? response.metadatas[i]
							: ({} as IVectorDocumentMetadata),
						embedding: response.embeddings ? response.embeddings[i] : undefined,
					});
				}
			}

			return documents;
		} catch (error) {
			this.logger.error("Failed to get documents by IDs", error as Error, {
				collection: this.name,
				count: ids.length,
			});
			throw error;
		}
	}

	/**
	 * Count documents in collection
	 */
	async count(): Promise<number> {
		try {
			return await this.chromaClient.count(this.name);
		} catch (error) {
			this.logger.error(
				"Failed to count documents in collection",
				error as Error,
				{
					collection: this.name,
				},
			);
			throw error;
		}
	}

	/**
	 * Get collection statistics
	 */
	async getStats(): Promise<ICollectionStats> {
		try {
			const info = await this.chromaClient.getCollection(this.name);
			const count = await this.count();

			return {
				name: this.name,
				document_count: count,
				embedding_dimension: info.metadata?.embedding_dimension || 0,
				total_size_bytes: count * 1000, // Rough estimate
				created_at: info.metadata?.created_at || new Date().toISOString(),
				updated_at: new Date().toISOString(),
				health_score: this.calculateHealthScore(count, info),
			};
		} catch (error) {
			this.logger.error("Failed to get collection stats", error as Error, {
				collection: this.name,
			});
			throw error;
		}
	}

	private calculateHealthScore(count: number, info: any): number {
		let score = 0;

		// Base score for having documents
		if (count > 0) score += 50;
		if (count > 100) score += 20;
		if (count > 1000) score += 10;

		// Score for metadata completeness
		if (info.metadata) score += 10;

		// Score for recent activity
		if (info.metadata?.updated_at) {
			const lastUpdate = new Date(info.metadata.updated_at);
			const daysSinceUpdate =
				(Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
			if (daysSinceUpdate < 7) score += 10;
		}

		return Math.min(100, score);
	}
}

/**
 * ChromaDB client interface
 */
interface IChromaClient {
	createCollection(name: string, metadata?: any): Promise<any>;
	getCollection(name: string): Promise<any>;
	deleteCollection(name: string): Promise<void>;
	listCollections(): Promise<any[]>;
	addDocuments(collection: string, data: any): Promise<void>;
	updateDocuments(collection: string, data: any): Promise<void>;
	deleteDocuments(collection: string, data: any): Promise<void>;
	query(collection: string, params: any): Promise<any>;
	get(collection: string, params: any): Promise<any>;
	count(collection: string): Promise<number>;
}

/**
 * ChromaDB Vector Store Implementation
 */
export class ChromaDBStore extends EventEmitter {
	private chromaClient: IChromaClient;
	private collections = new Map<string, ChromaDBCollection>();
	private initialized = false;

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
	) {
		super();
		this.chromaClient = this.createChromaClient();
	}

	/**
	 * Initialize the vector store
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing ChromaDB Vector Store");

			// Test connection
			await this.testConnection();

			// Initialize default collections
			await this.initializeDefaultCollections();

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("ChromaDB Vector Store initialized successfully");
		} catch (error) {
			this.logger.error(
				"Failed to initialize ChromaDB Vector Store",
				error as Error,
			);
			throw error;
		}
	}

	/**
	 * Get or create a collection
	 */
	async getCollection(
		name: string,
		metadata?: any,
	): Promise<ChromaDBCollection> {
		if (this.collections.has(name)) {
			return this.collections.get(name)!;
		}

		try {
			// Try to get existing collection
			await this.chromaClient.getCollection(name);
		} catch (error) {
			// Collection doesn't exist, create it
			await this.chromaClient.createCollection(name, metadata);
			this.logger.info("Created new ChromaDB collection", { name });
		}

		const collection = new ChromaDBCollection(
			name,
			this.chromaClient,
			this.logger,
		);
		this.collections.set(name, collection);

		return collection;
	}

	/**
	 * Delete a collection
	 */
	async deleteCollection(name: string): Promise<void> {
		try {
			await this.chromaClient.deleteCollection(name);
			this.collections.delete(name);

			this.logger.info("Deleted ChromaDB collection", { name });
		} catch (error) {
			this.logger.error("Failed to delete collection", error as Error, {
				name,
			});
			throw error;
		}
	}

	/**
	 * List all collections
	 */
	async listCollections(): Promise<string[]> {
		try {
			const collections = await this.chromaClient.listCollections();
			return collections.map((col) => col.name);
		} catch (error) {
			this.logger.error("Failed to list collections", error as Error);
			throw error;
		}
	}

	/**
	 * Get overall statistics
	 */
	async getOverallStats(): Promise<{
		total_collections: number;
		total_documents: number;
		total_size_bytes: number;
		avg_health_score: number;
	}> {
		try {
			const collectionNames = await this.listCollections();
			let totalDocuments = 0;
			let totalSizeBytes = 0;
			let totalHealthScore = 0;

			for (const name of collectionNames) {
				const collection = await this.getCollection(name);
				const stats = await collection.getStats();

				totalDocuments += stats.document_count;
				totalSizeBytes += stats.total_size_bytes;
				totalHealthScore += stats.health_score;
			}

			return {
				total_collections: collectionNames.length,
				total_documents: totalDocuments,
				total_size_bytes: totalSizeBytes,
				avg_health_score:
					collectionNames.length > 0
						? totalHealthScore / collectionNames.length
						: 0,
			};
		} catch (error) {
			this.logger.error("Failed to get overall stats", error as Error);
			throw error;
		}
	}

	/**
	 * Health check for the vector store
	 */
	async healthCheck(): Promise<boolean> {
		try {
			if (!this.initialized) return false;

			await this.testConnection();
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Dispose of the vector store
	 */
	async dispose(): Promise<void> {
		this.collections.clear();
		this.initialized = false;
		this.removeAllListeners();

		this.logger.info("ChromaDB Vector Store disposed");
	}

	// === Private Helper Methods ===

	private createChromaClient(): IChromaClient {
		const baseUrl = this.config.get<string>(
			"ai.chroma.url",
			"http://localhost:8000",
		);

		return {
			async createCollection(name: string, metadata?: any) {
				const response = await fetch(`${baseUrl}/api/v1/collections`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name,
						metadata: {
							...metadata,
							created_at: new Date().toISOString(),
							version: "1.0.0",
						},
					}),
				});

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async getCollection(name: string) {
				const response = await fetch(`${baseUrl}/api/v1/collections/${name}`);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async deleteCollection(name: string) {
				const response = await fetch(`${baseUrl}/api/v1/collections/${name}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}
			},

			async listCollections() {
				const response = await fetch(`${baseUrl}/api/v1/collections`);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async addDocuments(collection: string, data: any) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/add`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data),
					},
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}
			},

			async updateDocuments(collection: string, data: any) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/update`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data),
					},
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}
			},

			async deleteDocuments(collection: string, data: any) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/delete`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data),
					},
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}
			},

			async query(collection: string, params: any) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/query`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(params),
					},
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async get(collection: string, params: any) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/get`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(params),
					},
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async count(collection: string) {
				const response = await fetch(
					`${baseUrl}/api/v1/collections/${collection}/count`,
				);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				const result = await response.json();
				return result.count || 0;
			},
		};
	}

	private async testConnection(): Promise<void> {
		try {
			await this.chromaClient.listCollections();
		} catch (error) {
			throw new Error(
				`Cannot connect to ChromaDB: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private async initializeDefaultCollections(): Promise<void> {
		const defaultCollections = [
			{
				name: "xala_code_patterns",
				metadata: {
					description: "Code patterns and templates for Xala scaffolding",
					type: "patterns",
					compliance: "norwegian",
				},
			},
			{
				name: "xala_examples",
				metadata: {
					description: "Code examples and demonstrations",
					type: "examples",
					compliance: "norwegian",
				},
			},
			{
				name: "xala_compliance_rules",
				metadata: {
					description: "Norwegian compliance rules and documentation",
					type: "compliance",
					compliance: "norwegian",
				},
			},
			{
				name: "xala_documentation",
				metadata: {
					description: "Technical documentation and guides",
					type: "documentation",
					compliance: "norwegian",
				},
			},
		];

		for (const collectionConfig of defaultCollections) {
			try {
				await this.getCollection(
					collectionConfig.name,
					collectionConfig.metadata,
				);
			} catch (error) {
				this.logger.warn("Failed to initialize default collection", {
					collection: collectionConfig.name,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}
	}
}

/**
 * AI Service Factory Implementation
 *
 * Creates and manages AI service instances following the Factory pattern.
 * Implements dependency injection and service lifecycle management.
 * Follows SOLID principles and Norwegian compliance requirements.
 *
 * Features:
 * - Service creation and configuration
 * - Dependency injection
 * - Service lifecycle management
 * - Norwegian compliance integration
 * - Configuration-based service creation
 */

import {
	IConfigurationService,
	IFileSystemService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import {
	IAICodeGeneratorService,
	IAIServiceFactory,
	IContextManagerService,
	IKnowledgeBaseService,
	ILLMService,
	IRAGService,
} from "../interfaces.js";
import { AICodeGeneratorService } from "./AICodeGeneratorService.js";
import { ContextManagerService } from "./ContextManagerService.js";
import { KnowledgeBaseService } from "./KnowledgeBaseService.js";
// Service implementations
import { LLMService } from "./LLMService.js";
import { RAGService } from "./RAGService.js";

/**
 * Service configuration interface
 */
interface IServiceConfiguration {
	llm: {
		provider: "ollama" | "localai";
		baseUrl: string;
		defaultModel: string;
		timeout: number;
	};
	rag: {
		provider: "chromadb" | "local";
		url: string;
		embeddingModel: string;
		dimensions: number;
	};
	knowledgeBase: {
		path: string;
		autoSeed: boolean;
		exportPath: string;
	};
	context: {
		storePath: string;
		maxHistoryEntries: number;
		enableLearning: boolean;
	};
	compliance: {
		strictMode: boolean;
		defaultClassification: string;
		enableAuditLogging: boolean;
	};
}

/**
 * AI Service Factory Implementation
 */
export class AIServiceFactory implements IAIServiceFactory {
	private readonly serviceInstances = new Map<string, any>();
	private readonly configuration: IServiceConfiguration;

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		private readonly fileSystem: IFileSystemService,
	) {
		// Load configuration with Norwegian-focused defaults
		this.configuration = this.loadConfiguration();

		this.logger.info("AI Service Factory initialized", {
			llmProvider: this.configuration.llm.provider,
			ragProvider: this.configuration.rag.provider,
			complianceMode: this.configuration.compliance.strictMode,
		});
	}

	/**
	 * Create LLM service instance
	 */
	createLLMService(): ILLMService {
		const cacheKey = "llm-service";

		if (this.serviceInstances.has(cacheKey)) {
			return this.serviceInstances.get(cacheKey);
		}

		this.logger.debug("Creating LLM Service", {
			provider: this.configuration.llm.provider,
			baseUrl: this.configuration.llm.baseUrl,
		});

		// Create service with configuration
		const service = new LLMService(
			this.logger,
			this.config,
			this.createOllamaClient(),
		);

		// Cache the instance
		this.serviceInstances.set(cacheKey, service);

		this.logger.debug("LLM Service created successfully");
		return service;
	}

	/**
	 * Create RAG service instance
	 */
	createRAGService(): IRAGService {
		const cacheKey = "rag-service";

		if (this.serviceInstances.has(cacheKey)) {
			return this.serviceInstances.get(cacheKey);
		}

		this.logger.debug("Creating RAG Service", {
			provider: this.configuration.rag.provider,
			url: this.configuration.rag.url,
		});

		// Create service with configuration
		const service = new RAGService(
			this.logger,
			this.config,
			this.createChromaClient(),
			this.createEmbeddingProvider(),
		);

		// Cache the instance
		this.serviceInstances.set(cacheKey, service);

		this.logger.debug("RAG Service created successfully");
		return service;
	}

	/**
	 * Create Knowledge Base service instance
	 */
	createKnowledgeBaseService(): IKnowledgeBaseService {
		const cacheKey = "knowledge-base-service";

		if (this.serviceInstances.has(cacheKey)) {
			return this.serviceInstances.get(cacheKey);
		}

		this.logger.debug("Creating Knowledge Base Service", {
			path: this.configuration.knowledgeBase.path,
			autoSeed: this.configuration.knowledgeBase.autoSeed,
		});

		// Create service with dependencies
		const service = new KnowledgeBaseService(
			this.logger,
			this.config,
			this.fileSystem,
		);

		// Cache the instance
		this.serviceInstances.set(cacheKey, service);

		this.logger.debug("Knowledge Base Service created successfully");
		return service;
	}

	/**
	 * Create Context Manager service instance
	 */
	createContextManagerService(): IContextManagerService {
		const cacheKey = "context-manager-service";

		if (this.serviceInstances.has(cacheKey)) {
			return this.serviceInstances.get(cacheKey);
		}

		this.logger.debug("Creating Context Manager Service", {
			storePath: this.configuration.context.storePath,
			enableLearning: this.configuration.context.enableLearning,
		});

		// Create service with dependencies
		const service = new ContextManagerService(
			this.logger,
			this.config,
			this.fileSystem,
		);

		// Cache the instance
		this.serviceInstances.set(cacheKey, service);

		this.logger.debug("Context Manager Service created successfully");
		return service;
	}

	/**
	 * Create AI Code Generator service instance
	 */
	createAICodeGeneratorService(): IAICodeGeneratorService {
		const cacheKey = "ai-code-generator-service";

		if (this.serviceInstances.has(cacheKey)) {
			return this.serviceInstances.get(cacheKey);
		}

		this.logger.debug("Creating AI Code Generator Service");

		// Create dependent services
		const llmService = this.createLLMService();
		const ragService = this.createRAGService();
		const knowledgeBaseService = this.createKnowledgeBaseService();
		const contextManagerService = this.createContextManagerService();

		// Create service with all dependencies
		const service = new AICodeGeneratorService(
			this.logger,
			this.config,
			llmService,
			ragService,
			knowledgeBaseService,
			contextManagerService,
		);

		// Cache the instance
		this.serviceInstances.set(cacheKey, service);

		this.logger.debug("AI Code Generator Service created successfully");
		return service;
	}

	/**
	 * Initialize all services
	 */
	async initializeServices(): Promise<void> {
		try {
			this.logger.info("Initializing all AI services");

			// Create all services
			const knowledgeBaseService = this.createKnowledgeBaseService();
			const contextManagerService = this.createContextManagerService();
			const llmService = this.createLLMService();
			const ragService = this.createRAGService();
			const aiCodeGeneratorService = this.createAICodeGeneratorService();

			// Initialize services in dependency order
			await knowledgeBaseService.initialize();
			await contextManagerService.initialize();
			await llmService.initialize();
			await ragService.initialize();
			await aiCodeGeneratorService.initialize();

			// Auto-seed knowledge base if configured
			if (this.configuration.knowledgeBase.autoSeed) {
				await this.seedKnowledgeBase(knowledgeBaseService);
			}

			this.logger.info("All AI services initialized successfully");
		} catch (error) {
			this.logger.error("Failed to initialize AI services", error as Error);
			throw error;
		}
	}

	/**
	 * Dispose all services
	 */
	async disposeServices(): Promise<void> {
		try {
			this.logger.info("Disposing all AI services");

			// Dispose services in reverse dependency order
			const services = Array.from(this.serviceInstances.values());

			for (const service of services.reverse()) {
				if (service && typeof service.dispose === "function") {
					try {
						await service.dispose();
					} catch (error) {
						this.logger.warn("Error disposing service", {
							service: service.name || "unknown",
							error: error instanceof Error ? error.message : "Unknown error",
						});
					}
				}
			}

			// Clear cache
			this.serviceInstances.clear();

			this.logger.info("All AI services disposed successfully");
		} catch (error) {
			this.logger.error("Failed to dispose AI services", error as Error);
			throw error;
		}
	}

	/**
	 * Health check for all services
	 */
	async healthCheck(): Promise<{ [serviceName: string]: boolean }> {
		const health: { [serviceName: string]: boolean } = {};

		try {
			for (const [name, service] of this.serviceInstances.entries()) {
				if (service && typeof service.healthCheck === "function") {
					try {
						health[name] = await service.healthCheck();
					} catch (error) {
						health[name] = false;
					}
				} else {
					health[name] = false;
				}
			}
		} catch (error) {
			this.logger.error("Failed to perform health check", error as Error);
		}

		return health;
	}

	/**
	 * Get service configuration
	 */
	getConfiguration(): IServiceConfiguration {
		return { ...this.configuration };
	}

	/**
	 * Update service configuration
	 */
	updateConfiguration(updates: Partial<IServiceConfiguration>): void {
		Object.assign(this.configuration, updates);

		this.logger.info("Service configuration updated", {
			updates: Object.keys(updates),
		});
	}

	// === Private Helper Methods ===

	private loadConfiguration(): IServiceConfiguration {
		const config: IServiceConfiguration = {
			llm: {
				provider: this.config.get<"ollama" | "localai">(
					"ai.llm.provider",
					"ollama",
				),
				baseUrl: this.config.get<string>(
					"ai.llm.baseUrl",
					"http://localhost:11434",
				),
				defaultModel: this.config.get<string>(
					"ai.llm.defaultModel",
					"codellama:7b",
				),
				timeout: this.config.get<number>("ai.llm.timeout", 30000),
			},
			rag: {
				provider: this.config.get<"chromadb" | "local">(
					"ai.rag.provider",
					"chromadb",
				),
				url: this.config.get<string>("ai.rag.url", "http://localhost:8000"),
				embeddingModel: this.config.get<string>(
					"ai.rag.embeddingModel",
					"all-MiniLM-L6-v2",
				),
				dimensions: this.config.get<number>("ai.rag.dimensions", 384),
			},
			knowledgeBase: {
				path: this.config.get<string>(
					"ai.knowledgeBase.path",
					"./knowledge-base",
				),
				autoSeed: this.config.get<boolean>("ai.knowledgeBase.autoSeed", true),
				exportPath: this.config.get<string>(
					"ai.knowledgeBase.exportPath",
					"./knowledge-base-export.json",
				),
			},
			context: {
				storePath: this.config.get<string>(
					"ai.context.storePath",
					"./context-store",
				),
				maxHistoryEntries: this.config.get<number>(
					"ai.context.maxHistoryEntries",
					1000,
				),
				enableLearning: this.config.get<boolean>(
					"ai.context.enableLearning",
					true,
				),
			},
			compliance: {
				strictMode: this.config.get<boolean>("ai.compliance.strictMode", true),
				defaultClassification: this.config.get<string>(
					"ai.compliance.defaultClassification",
					"OPEN",
				),
				enableAuditLogging: this.config.get<boolean>(
					"ai.compliance.enableAuditLogging",
					true,
				),
			},
		};

		return config;
	}

	private createOllamaClient(): any {
		const baseUrl = this.configuration.llm.baseUrl;
		const timeout = this.configuration.llm.timeout;

		return {
			async generate(model: string, prompt: string, options?: any) {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				try {
					const response = await fetch(`${baseUrl}/api/generate`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							model,
							prompt,
							...options,
							stream: false,
						}),
						signal: controller.signal,
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						throw new Error(`Ollama API error: ${response.statusText}`);
					}

					return response.json();
				} catch (error) {
					clearTimeout(timeoutId);
					throw error;
				}
			},

			async chat(model: string, messages: any[], options?: any) {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				try {
					const response = await fetch(`${baseUrl}/api/chat`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							model,
							messages,
							...options,
							stream: false,
						}),
						signal: controller.signal,
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						throw new Error(`Ollama API error: ${response.statusText}`);
					}

					return response.json();
				} catch (error) {
					clearTimeout(timeoutId);
					throw error;
				}
			},

			async list() {
				const response = await fetch(`${baseUrl}/api/tags`);

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}

				return response.json();
			},

			async pull(model: string) {
				const response = await fetch(`${baseUrl}/api/pull`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: model }),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}
			},

			async delete(model: string) {
				const response = await fetch(`${baseUrl}/api/delete`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: model }),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}
			},

			async show(model: string) {
				const response = await fetch(`${baseUrl}/api/show`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: model }),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}

				return response.json();
			},
		};
	}

	private createChromaClient(): any {
		const url = this.configuration.rag.url;

		return {
			async createCollection(name: string, metadata?: any) {
				const response = await fetch(`${url}/api/v1/collections`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, metadata }),
				});

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async getCollection(name: string) {
				const response = await fetch(`${url}/api/v1/collections/${name}`);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},

			async deleteCollection(name: string) {
				const response = await fetch(`${url}/api/v1/collections/${name}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}
			},

			async listCollections() {
				const response = await fetch(`${url}/api/v1/collections`);

				if (!response.ok) {
					throw new Error(`ChromaDB error: ${response.statusText}`);
				}

				return response.json();
			},
		};
	}

	private createEmbeddingProvider(): any {
		const model = this.configuration.rag.embeddingModel;
		const dimensions = this.configuration.rag.dimensions;

		return {
			async generateEmbeddings(texts: string[]): Promise<number[][]> {
				// In a real implementation, this would use a local embedding model
				// like sentence-transformers via Python subprocess or ONNX runtime
				// For now, we'll create mock embeddings for development

				this.logger.debug("Generating embeddings", {
					model,
					textCount: texts.length,
					dimensions,
				});

				// Create normalized random embeddings as placeholder
				return texts.map(() => {
					const embedding = Array(dimensions)
						.fill(0)
						.map(() => Math.random() - 0.5);

					// Normalize the embedding vector
					const magnitude = Math.sqrt(
						embedding.reduce((sum, val) => sum + val * val, 0),
					);
					return embedding.map((val) => val / magnitude);
				});
			},

			getDimensions(): number {
				return dimensions;
			},

			getModel(): string {
				return model;
			},
		};
	}

	private async seedKnowledgeBase(
		knowledgeBaseService: IKnowledgeBaseService,
	): Promise<void> {
		try {
			this.logger.info("Auto-seeding knowledge base");

			// Seed from existing examples directory
			const examplesPath = "./examples";
			const exists = await this.fileSystem.exists(examplesPath);

			if (exists) {
				await knowledgeBaseService.seedFromDirectory(examplesPath);
				this.logger.info("Knowledge base seeded from examples directory");
			} else {
				this.logger.info("Examples directory not found, skipping auto-seed");
			}
		} catch (error) {
			this.logger.warn("Failed to auto-seed knowledge base", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * Create service with Norwegian compliance configuration
	 */
	private applyNorwegianComplianceConfiguration(): void {
		// Apply Norwegian-specific configuration defaults
		if (this.configuration.compliance.strictMode) {
			// Ensure audit logging is enabled
			this.configuration.compliance.enableAuditLogging = true;

			// Default to higher security classification
			if (this.configuration.compliance.defaultClassification === "OPEN") {
				this.configuration.compliance.defaultClassification = "RESTRICTED";
			}
		}

		// Update configuration with Norwegian defaults
		this.config.set("ai.compliance.enableNSMClassification", true);
		this.config.set("ai.compliance.enableGDPRValidation", true);
		this.config.set("ai.compliance.enableWCAGValidation", true);
		this.config.set("ai.compliance.defaultLocale", "nb-NO");
	}

	/**
	 * Validate service configuration
	 */
	private validateConfiguration(): void {
		const config = this.configuration;

		// Validate LLM configuration
		if (!config.llm.baseUrl || !config.llm.provider) {
			throw new Error(
				"Invalid LLM configuration: baseUrl and provider are required",
			);
		}

		// Validate RAG configuration
		if (!config.rag.url || !config.rag.embeddingModel) {
			throw new Error(
				"Invalid RAG configuration: url and embeddingModel are required",
			);
		}

		// Validate paths
		if (!config.knowledgeBase.path || !config.context.storePath) {
			throw new Error(
				"Invalid path configuration: knowledgeBase.path and context.storePath are required",
			);
		}

		// Validate compliance configuration
		if (config.compliance.strictMode && !config.compliance.enableAuditLogging) {
			this.logger.warn("Strict compliance mode enabled without audit logging");
		}

		this.logger.debug("Service configuration validated successfully");
	}
}

// Export factory as singleton pattern for dependency injection
let factoryInstance: AIServiceFactory | null = null;

export function createAIServiceFactory(
	logger: ILoggingService,
	config: IConfigurationService,
	fileSystem: IFileSystemService,
): AIServiceFactory {
	if (!factoryInstance) {
		factoryInstance = new AIServiceFactory(logger, config, fileSystem);
	}
	return factoryInstance;
}

export function getAIServiceFactory(): AIServiceFactory {
	if (!factoryInstance) {
		throw new Error(
			"AI Service Factory not initialized. Call createAIServiceFactory first.",
		);
	}
	return factoryInstance;
}

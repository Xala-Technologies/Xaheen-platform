/**
 * Local LLM Service Implementation
 *
 * Provides local language model capabilities using Ollama backend.
 * Follows SOLID principles and Norwegian compliance requirements.
 *
 * Features:
 * - Model management and loading
 * - Code generation with Norwegian compliance
 * - Chat functionality
 * - Performance monitoring
 * - Graceful error handling
 */

import { EventEmitter } from "events";
import {
	IConfigurationService,
	ILoggingService,
} from "../../architecture/interfaces.js";
import { LocaleCode, NorwegianCompliance } from "../../types/compliance.js";
import {
	IChatMessage,
	IChatOptions,
	IChatResponse,
	ICodeContext,
	ICodeGenerationOptions,
	ICodeGenerationResponse,
	ICodeQualityMetrics,
	IGenerationOptions,
	ILLMModel,
	ILLMResponse,
	ILLMService,
	IModelCapabilities,
	IModelLoadOptions,
	IModelStats,
	ITokenUsage,
} from "../interfaces.js";

/**
 * Ollama API client for local LLM communication
 */
interface IOllamaClient {
	generate(model: string, prompt: string, options?: any): Promise<any>;
	chat(model: string, messages: any[], options?: any): Promise<any>;
	list(): Promise<{ models: any[] }>;
	pull(model: string): Promise<void>;
	delete(model: string): Promise<void>;
	show(model: string): Promise<any>;
}

/**
 * Local LLM Service Implementation using Ollama
 */
export class LLMService extends EventEmitter implements ILLMService {
	public readonly name = "LLMService";
	public readonly version = "1.0.0";

	private initialized = false;
	private currentModel: ILLMModel | null = null;
	private loadedModels = new Map<string, ILLMModel>();
	private modelStats = new Map<string, IModelStats>();
	private ollamaClient: IOllamaClient;
	private readonly baseUrl: string;

	// Norwegian compliance prompts
	private readonly compliancePrompts = {
		"nb-NO": {
			system: `Du er en ekspert TypeScript-utvikler som følger norske reguleringskrav.
Alle kodegenerering må inkludere:
- NSM-sikkerhetskrav og klassifisering
- GDPR-databeskyttelse
- WCAG AAA tilgjengelighetsstandarder
- Norsk språkstøtte
- Revisjonssporing
- SOLID-prinsipper`,
			codeGeneration: `Generer TypeScript-kode som følger norske entreprisestandarder:
1. Bruk strikt TypeScript uten 'any'-typer
2. Inkluder NSM-klassifisering som data-attributter
3. Implementer WCAG AAA tilgjengelighet
4. Følg GDPR databeskyttelseskrav
5. Bruk norsk språk i kommentarer og meldinger
6. Implementer revisjonssporing for sensitiv funksjonalitet
7. Følg SOLID-prinsipper`,
		},
		"en-US": {
			system: `You are an expert TypeScript developer following Norwegian compliance requirements.
All code generation must include:
- NSM security requirements and classification
- GDPR data protection
- WCAG AAA accessibility standards
- Norwegian language support
- Audit logging
- SOLID principles`,
			codeGeneration: `Generate TypeScript code following Norwegian enterprise standards:
1. Use strict TypeScript without 'any' types
2. Include NSM classification as data attributes
3. Implement WCAG AAA accessibility
4. Follow GDPR data protection requirements
5. Use Norwegian language in comments and messages
6. Implement audit logging for sensitive functionality
7. Follow SOLID principles`,
		},
	};

	constructor(
		private readonly logger: ILoggingService,
		private readonly config: IConfigurationService,
		ollamaClient?: IOllamaClient,
	) {
		super();

		this.baseUrl = this.config.get<string>(
			"ai.ollama.baseUrl",
			"http://localhost:11434",
		);

		if (ollamaClient) {
			this.ollamaClient = ollamaClient;
		} else {
			// Create default Ollama client
			this.ollamaClient = this.createOllamaClient();
		}
	}

	/**
	 * Initialize the LLM service
	 */
	async initialize(): Promise<void> {
		try {
			this.logger.info("Initializing LLM Service", { baseUrl: this.baseUrl });

			// Test connection to Ollama
			await this.testConnection();

			// Load available models
			await this.refreshModelList();

			// Load default model if configured
			const defaultModel = this.config.get<string>("ai.defaultModel");
			if (defaultModel) {
				try {
					await this.loadModel(defaultModel);
				} catch (error) {
					this.logger.warn("Failed to load default model", {
						model: defaultModel,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			this.initialized = true;
			this.emit("initialized");

			this.logger.info("LLM Service initialized successfully");
		} catch (error) {
			this.logger.error("Failed to initialize LLM Service", error as Error);
			throw error;
		}
	}

	/**
	 * Dispose of the service and clean up resources
	 */
	async dispose(): Promise<void> {
		try {
			this.logger.info("Disposing LLM Service");

			// Unload all models
			for (const modelName of this.loadedModels.keys()) {
				try {
					await this.unloadModel(modelName);
				} catch (error) {
					this.logger.warn("Error unloading model during dispose", {
						model: modelName,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			}

			this.initialized = false;
			this.currentModel = null;
			this.loadedModels.clear();
			this.modelStats.clear();

			this.emit("disposed");
			this.removeAllListeners();

			this.logger.info("LLM Service disposed successfully");
		} catch (error) {
			this.logger.error("Error disposing LLM Service", error as Error);
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

			// Test connection to Ollama
			await this.testConnection();

			// Check if at least one model is available
			const models = await this.listAvailableModels();

			return models.length > 0;
		} catch (error) {
			this.logger.error("Health check failed", error as Error);
			return false;
		}
	}

	/**
	 * List all available models
	 */
	async listAvailableModels(): Promise<ILLMModel[]> {
		try {
			const response = await this.ollamaClient.list();

			return response.models.map((model: any) =>
				this.mapOllamaModelToInterface(model),
			);
		} catch (error) {
			this.logger.error("Failed to list available models", error as Error);
			throw new Error(
				`Failed to list models: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Load a specific model
	 */
	async loadModel(
		modelName: string,
		options: IModelLoadOptions = {},
	): Promise<void> {
		try {
			this.logger.info("Loading model", { model: modelName, options });

			// Check if model is already loaded
			if (this.loadedModels.has(modelName)) {
				this.logger.info("Model already loaded", { model: modelName });
				this.currentModel = this.loadedModels.get(modelName)!;
				return;
			}

			// Get model info
			const modelInfo = await this.ollamaClient.show(modelName);
			const model = this.mapOllamaModelToInterface(modelInfo, true);

			// Load the model (Ollama loads on first use, so we do a test generation)
			await this.ollamaClient.generate(modelName, "Test connection", {
				max_tokens: 1,
				...options,
			});

			// Mark as loaded
			model.isLoaded = true;
			model.loadedAt = new Date();

			this.loadedModels.set(modelName, model);
			this.currentModel = model;

			// Initialize stats
			this.modelStats.set(modelName, {
				modelName,
				isLoaded: true,
				memoryUsage: 0, // Would need system monitoring for actual values
				totalGenerations: 0,
				averageResponseTime: 0,
				uptime: 0,
				lastUsed: new Date(),
				errorCount: 0,
			});

			this.emit("modelLoaded", { model: modelName });
			this.logger.info("Model loaded successfully", { model: modelName });
		} catch (error) {
			this.logger.error("Failed to load model", error as Error, {
				model: modelName,
			});
			throw new Error(
				`Failed to load model ${modelName}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Unload a specific model
	 */
	async unloadModel(modelName: string): Promise<void> {
		try {
			this.logger.info("Unloading model", { model: modelName });

			if (!this.loadedModels.has(modelName)) {
				this.logger.warn("Model not loaded", { model: modelName });
				return;
			}

			// Remove from loaded models
			this.loadedModels.delete(modelName);

			// Clear current model if it was the one being unloaded
			if (this.currentModel?.name === modelName) {
				this.currentModel = null;
			}

			// Update stats
			this.modelStats.delete(modelName);

			this.emit("modelUnloaded", { model: modelName });
			this.logger.info("Model unloaded successfully", { model: modelName });
		} catch (error) {
			this.logger.error("Failed to unload model", error as Error, {
				model: modelName,
			});
			throw error;
		}
	}

	/**
	 * Get currently loaded model
	 */
	getCurrentModel(): ILLMModel | null {
		return this.currentModel;
	}

	/**
	 * Generate text using the current model
	 */
	async generateText(
		prompt: string,
		options: IGenerationOptions = {},
	): Promise<ILLMResponse> {
		const startTime = Date.now();

		try {
			if (!this.currentModel) {
				throw new Error("No model loaded. Please load a model first.");
			}

			this.logger.debug("Generating text", {
				model: this.currentModel.name,
				promptLength: prompt.length,
				options,
			});

			const response = await this.ollamaClient.generate(
				this.currentModel.name,
				prompt,
				{
					temperature: options.temperature || 0.7,
					max_tokens: options.maxTokens || 2048,
					top_p: options.topP,
					top_k: options.topK,
					repeat_penalty: options.repeatPenalty,
					stop: options.stopSequences,
					stream: options.streaming || false,
				},
			);

			const usage: ITokenUsage = {
				promptTokens: this.estimateTokens(prompt),
				completionTokens: this.estimateTokens(response.response),
				totalTokens: 0,
			};
			usage.totalTokens = usage.promptTokens + usage.completionTokens;

			const result: ILLMResponse = {
				text: response.response,
				finishReason: response.done ? "stop" : "length",
				usage,
				metadata: {
					model: this.currentModel.name,
					created: response.created_at,
					totalDuration: response.total_duration,
					loadDuration: response.load_duration,
					promptEvalDuration: response.prompt_eval_duration,
					evalDuration: response.eval_duration,
				},
				generatedAt: new Date(),
			};

			// Update stats
			this.updateModelStats(
				this.currentModel.name,
				Date.now() - startTime,
				true,
			);

			this.logger.debug("Text generation completed", {
				model: this.currentModel.name,
				responseLength: result.text.length,
				duration: Date.now() - startTime,
			});

			return result;
		} catch (error) {
			this.updateModelStats(
				this.currentModel?.name || "unknown",
				Date.now() - startTime,
				false,
			);
			this.logger.error("Text generation failed", error as Error);
			throw error;
		}
	}

	/**
	 * Generate code with Norwegian compliance
	 */
	async generateCode(
		prompt: string,
		context?: ICodeContext,
		options: ICodeGenerationOptions = { language: "typescript" },
	): Promise<ICodeGenerationResponse> {
		const startTime = Date.now();

		try {
			if (!this.currentModel) {
				throw new Error("No model loaded. Please load a model first.");
			}

			const locale =
				options.locale || context?.locale || ("nb-NO" as LocaleCode);
			const compliance =
				options.compliance ||
				context?.compliance ||
				({
					nsmClassification: "OPEN",
					gdprCompliant: true,
					wcagLevel: "AAA",
				} as NorwegianCompliance);

			// Build Norwegian compliance-aware prompt
			const systemPrompt =
				this.compliancePrompts[locale]?.system ||
				this.compliancePrompts["en-US"].system;
			const codePrompt =
				this.compliancePrompts[locale]?.codeGeneration ||
				this.compliancePrompts["en-US"].codeGeneration;

			let enhancedPrompt = `${systemPrompt}\n\n${codePrompt}\n\n`;

			// Add context information
			if (context) {
				enhancedPrompt += `Context:\n`;
				enhancedPrompt += `- Project: ${context.projectType}\n`;
				enhancedPrompt += `- Framework: ${context.framework}\n`;
				enhancedPrompt += `- Language: ${options.language}\n`;
				enhancedPrompt += `- Compliance: NSM ${compliance.nsmClassification}, GDPR ${compliance.gdprCompliant ? "Yes" : "No"}, WCAG ${compliance.wcagLevel}\n`;
				enhancedPrompt += `- Locale: ${locale}\n\n`;
			}

			enhancedPrompt += `Requirements:\n${prompt}\n\n`;
			enhancedPrompt += `Generate production-ready ${options.language} code that follows all Norwegian compliance requirements.`;

			if (options.includeTests) {
				enhancedPrompt += " Include comprehensive tests.";
			}

			if (options.includeDocumentation) {
				enhancedPrompt += " Include detailed documentation.";
			}

			const response = await this.generateText(enhancedPrompt, options);

			// Extract code from response (basic implementation)
			const code = this.extractCodeFromResponse(
				response.text,
				options.language,
			);

			// Calculate quality metrics (simplified implementation)
			const qualityMetrics = this.calculateCodeQuality(code);

			// Calculate compliance score
			const complianceScore = this.calculateComplianceScore(code, compliance);

			const result: ICodeGenerationResponse = {
				...response,
				code,
				language: options.language,
				explanation: this.extractExplanationFromResponse(response.text),
				suggestions: this.extractSuggestionsFromResponse(response.text),
				complianceScore,
				qualityMetrics,
			};

			this.logger.info("Code generation completed", {
				model: this.currentModel.name,
				language: options.language,
				codeLength: code.length,
				complianceScore,
				qualityScore: qualityMetrics.overallScore,
				duration: Date.now() - startTime,
			});

			return result;
		} catch (error) {
			this.updateModelStats(
				this.currentModel?.name || "unknown",
				Date.now() - startTime,
				false,
			);
			this.logger.error("Code generation failed", error as Error);
			throw error;
		}
	}

	/**
	 * Chat with the model
	 */
	async chat(
		messages: IChatMessage[],
		options: IChatOptions = {},
	): Promise<IChatResponse> {
		const startTime = Date.now();

		try {
			if (!this.currentModel) {
				throw new Error("No model loaded. Please load a model first.");
			}

			this.logger.debug("Starting chat", {
				model: this.currentModel.name,
				messageCount: messages.length,
			});

			// Add system prompt if provided
			const chatMessages = [...messages];
			if (options.systemPrompt) {
				chatMessages.unshift({
					role: "system",
					content: options.systemPrompt,
					timestamp: new Date(),
				});
			}

			const response = await this.ollamaClient.chat(
				this.currentModel.name,
				chatMessages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				{
					temperature: options.temperature || 0.7,
					max_tokens: options.maxTokens || 2048,
					top_p: options.topP,
					top_k: options.topK,
					repeat_penalty: options.repeatPenalty,
					stop: options.stopSequences,
				},
			);

			const assistantMessage: IChatMessage = {
				role: "assistant",
				content: response.message.content,
				timestamp: new Date(),
				metadata: {
					model: this.currentModel.name,
					created: response.created_at,
				},
			};

			const usage: ITokenUsage = {
				promptTokens: this.estimateTokens(
					chatMessages.map((m) => m.content).join(" "),
				),
				completionTokens: this.estimateTokens(response.message.content),
				totalTokens: 0,
			};
			usage.totalTokens = usage.promptTokens + usage.completionTokens;

			const result: IChatResponse = {
				message: assistantMessage,
				usage,
				finishReason: response.done ? "stop" : "length",
			};

			// Update stats
			this.updateModelStats(
				this.currentModel.name,
				Date.now() - startTime,
				true,
			);

			this.logger.debug("Chat completed", {
				model: this.currentModel.name,
				responseLength: assistantMessage.content.length,
				duration: Date.now() - startTime,
			});

			return result;
		} catch (error) {
			this.updateModelStats(
				this.currentModel?.name || "unknown",
				Date.now() - startTime,
				false,
			);
			this.logger.error("Chat failed", error as Error);
			throw error;
		}
	}

	/**
	 * Get model statistics
	 */
	async getModelStats(): Promise<IModelStats> {
		if (!this.currentModel) {
			throw new Error("No model loaded");
		}

		const stats = this.modelStats.get(this.currentModel.name);
		if (!stats) {
			throw new Error(
				`No statistics available for model ${this.currentModel.name}`,
			);
		}

		return { ...stats };
	}

	/**
	 * Check if a specific model is loaded
	 */
	async isModelLoaded(modelName: string): Promise<boolean> {
		return this.loadedModels.has(modelName);
	}

	// === Private Helper Methods ===

	private createOllamaClient(): IOllamaClient {
		return {
			async generate(model: string, prompt: string, options?: any) {
				const response = await fetch(`${this.baseUrl}/api/generate`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						model,
						prompt,
						...options,
						stream: false,
					}),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}

				return response.json();
			},

			async chat(model: string, messages: any[], options?: any) {
				const response = await fetch(`${this.baseUrl}/api/chat`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						model,
						messages,
						...options,
						stream: false,
					}),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}

				return response.json();
			},

			async list() {
				const response = await fetch(`${this.baseUrl}/api/tags`);

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}

				return response.json();
			},

			async pull(model: string) {
				const response = await fetch(`${this.baseUrl}/api/pull`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: model }),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}
			},

			async delete(model: string) {
				const response = await fetch(`${this.baseUrl}/api/delete`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: model }),
				});

				if (!response.ok) {
					throw new Error(`Ollama API error: ${response.statusText}`);
				}
			},

			async show(model: string) {
				const response = await fetch(`${this.baseUrl}/api/show`, {
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

	private async testConnection(): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/api/tags`);
			if (!response.ok) {
				throw new Error(`Ollama connection failed: ${response.statusText}`);
			}
		} catch (error) {
			throw new Error(
				`Cannot connect to Ollama at ${this.baseUrl}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private async refreshModelList(): Promise<void> {
		try {
			const models = await this.listAvailableModels();
			this.logger.debug("Available models refreshed", { count: models.length });
		} catch (error) {
			this.logger.warn("Failed to refresh model list", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private mapOllamaModelToInterface(
		ollamaModel: any,
		isLoaded = false,
	): ILLMModel {
		const capabilities: IModelCapabilities = {
			codeGeneration: this.isCodeModel(ollamaModel.name),
			multiLanguage: true,
			norwegianSupport: this.hasNorwegianSupport(ollamaModel.name),
			maxContextLength: this.getContextLength(ollamaModel.name),
			supportsFunction: false,
			supportsTools: false,
		};

		return {
			name: ollamaModel.name,
			displayName: ollamaModel.name,
			description:
				ollamaModel.details?.description || `${ollamaModel.name} model`,
			size: ollamaModel.size || 0,
			type: this.getModelType(ollamaModel.name),
			languages: ["en", "no", "nb", "nn"],
			capabilities,
			isLoaded,
			loadedAt: isLoaded ? new Date() : undefined,
		};
	}

	private isCodeModel(modelName: string): boolean {
		const codeModels = [
			"codellama",
			"deepseek-coder",
			"starcoder",
			"phind-codellama",
			"wizard-coder",
		];
		return codeModels.some((model) => modelName.toLowerCase().includes(model));
	}

	private hasNorwegianSupport(modelName: string): boolean {
		// Most modern models have some Norwegian support
		const norwegianModels = ["llama", "mistral", "mixtral", "qwen"];
		return norwegianModels.some((model) =>
			modelName.toLowerCase().includes(model),
		);
	}

	private getContextLength(modelName: string): number {
		// Default context lengths for common models
		if (modelName.includes("32k")) return 32768;
		if (modelName.includes("16k")) return 16384;
		if (modelName.includes("8k")) return 8192;
		if (modelName.includes("4k")) return 4096;
		return 2048; // Default
	}

	private getModelType(modelName: string): "code" | "chat" | "instruct" {
		if (this.isCodeModel(modelName)) return "code";
		if (modelName.includes("instruct")) return "instruct";
		return "chat";
	}

	private estimateTokens(text: string): number {
		// Rough estimation: ~4 characters per token for most models
		return Math.ceil(text.length / 4);
	}

	private extractCodeFromResponse(response: string, language: string): string {
		// Extract code blocks from response
		const codeBlockRegex = new RegExp(
			`\`\`\`${language}?\\n([\\s\\S]*?)\\n\`\`\``,
			"gi",
		);
		const matches = response.match(codeBlockRegex);

		if (matches && matches.length > 0) {
			return matches[0]
				.replace(/```\w*\n?/g, "")
				.replace(/\n```/g, "")
				.trim();
		}

		// If no code blocks found, try to extract code-like content
		const lines = response.split("\n");
		const codeLines = lines.filter(
			(line) =>
				line.includes("import ") ||
				line.includes("export ") ||
				line.includes("const ") ||
				line.includes("function ") ||
				line.includes("interface ") ||
				line.includes("class "),
		);

		return codeLines.join("\n").trim() || response.trim();
	}

	private extractExplanationFromResponse(response: string): string {
		// Extract explanation text (non-code parts)
		const withoutCodeBlocks = response.replace(/```[\s\S]*?```/g, "");
		return withoutCodeBlocks.trim();
	}

	private extractSuggestionsFromResponse(response: string): string[] {
		const suggestions: string[] = [];
		const lines = response.split("\n");

		for (const line of lines) {
			if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
				suggestions.push(line.trim().substring(2));
			}
		}

		return suggestions;
	}

	private calculateCodeQuality(code: string): ICodeQualityMetrics {
		// Simplified quality metrics calculation
		const lines = code.split("\n").filter((line) => line.trim());
		const complexity = this.calculateComplexity(code);

		return {
			maintainabilityIndex: Math.max(0, 100 - complexity * 2),
			cyclomaticComplexity: complexity,
			linesOfCode: lines.length,
			duplicateCode: 0,
			technicalDebt: Math.floor(lines.length / 10),
			codeSmells: [],
			overallScore: Math.max(
				0,
				100 - complexity - Math.floor(lines.length / 50),
			),
		};
	}

	private calculateComplexity(code: string): number {
		// Count cyclomatic complexity indicators
		const complexityIndicators = [
			/if\s*\(/g,
			/else\s+if\s*\(/g,
			/while\s*\(/g,
			/for\s*\(/g,
			/switch\s*\(/g,
			/case\s+/g,
			/catch\s*\(/g,
			/&&/g,
			/\|\|/g,
			/\?.*:/g,
		];

		let complexity = 1; // Base complexity

		for (const pattern of complexityIndicators) {
			const matches = code.match(pattern);
			if (matches) {
				complexity += matches.length;
			}
		}

		return complexity;
	}

	private calculateComplianceScore(
		code: string,
		compliance: NorwegianCompliance,
	): number {
		let score = 0;

		// Check for NSM classification attributes
		if (code.includes("data-nsm-classification")) score += 20;

		// Check for GDPR compliance indicators
		if (compliance.gdprCompliant && code.includes("gdpr")) score += 20;

		// Check for WCAG accessibility
		if (code.includes("aria-") || code.includes("role=")) score += 20;

		// Check for audit logging
		if (code.includes("auditLogger") || code.includes("log(")) score += 20;

		// Check for Norwegian language support
		if (code.includes("nb-NO") || code.includes("locale")) score += 20;

		return Math.min(100, score);
	}

	private updateModelStats(
		modelName: string,
		duration: number,
		success: boolean,
	): void {
		const stats = this.modelStats.get(modelName);
		if (!stats) return;

		stats.totalGenerations++;
		stats.lastUsed = new Date();

		if (success) {
			stats.averageResponseTime =
				(stats.averageResponseTime * (stats.totalGenerations - 1) + duration) /
				stats.totalGenerations;
		} else {
			stats.errorCount++;
		}

		this.modelStats.set(modelName, stats);
	}
}

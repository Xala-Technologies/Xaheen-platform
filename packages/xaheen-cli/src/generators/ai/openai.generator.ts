import { promises as fs } from "fs";
import { join } from "path";
import { BaseGenerator } from "../base.generator";
import type { OpenAIOptions } from "./types";

export class OpenAIGenerator extends BaseGenerator<OpenAIOptions> {
	async generate(options: OpenAIOptions): Promise<void> {
		await this.validateOptions(options);

		this.logger.info(`Generating OpenAI service: ${options.name}`);

		try {
			// Generate main OpenAI service
			await this.generateOpenAIService(options);

			// Generate types
			if (options.includeTypes !== false) {
				await this.generateTypes(options);
			}

			// Generate specific feature implementations
			if (options.enableFunctionCalling) {
				await this.generateFunctionCalling(options);
			}

			if (options.enableEmbeddings) {
				await this.generateEmbeddings(options);
			}

			if (options.enableStreaming) {
				await this.generateStreaming(options);
			}

			if (options.enableVision) {
				await this.generateVision(options);
			}

			if (options.enableAudio) {
				await this.generateAudio(options);
			}

			// Generate utilities
			await this.generateUtilities(options);

			// Generate tests
			if (options.includeTests) {
				await this.generateTests(options);
			}

			// Generate configuration
			await this.generateConfig(options);

			this.logger.success(
				`OpenAI service generated successfully at ${options.outputPath}`,
			);
		} catch (error) {
			this.logger.error("Failed to generate OpenAI service", error);
			throw error;
		}
	}

	protected async validateOptions(options: OpenAIOptions): Promise<void> {
		if (!options.name || !options.outputPath) {
			throw new Error("Name and output path are required");
		}

		if (!options.models || options.models.length === 0) {
			throw new Error("At least one OpenAI model must be specified");
		}
	}

	private async generateOpenAIService(options: OpenAIOptions): Promise<void> {
		const serviceContent = `import OpenAI from 'openai';
import type { 
  ChatCompletionMessageParam,
  ChatCompletionCreateParams,
  EmbeddingCreateParams,
  ImageGenerateParams,
  AudioSpeechCreateParams,
  AudioTranscriptionCreateParams
} from 'openai/resources/index.js';
import { RateLimiter } from "./utils/rate-limiter";
import { CacheManager } from "./utils/cache-manager";
import { ErrorHandler } from "./utils/error-handler";
import type { 
  ${options.name}Config, 
  ChatOptions, 
  EmbeddingOptions,
  FunctionCallOptions,
  StreamOptions 
} from './types.js';

export class ${options.name}Service {
  private readonly client: OpenAI;
  private readonly rateLimiter: RateLimiter;
  private readonly cache: CacheManager;
  private readonly errorHandler: ErrorHandler;

  constructor(private readonly config: ${options.name}Config) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      project: config.project,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });

    this.rateLimiter = new RateLimiter(config.rateLimiting);
    this.cache = new CacheManager(config.caching);
    this.errorHandler = new ErrorHandler(config.errorHandling);
  }

  ${options.features.includes("chat-completion") ? this.generateChatCompletionMethod() : ""}
  
  ${options.enableStreaming ? this.generateStreamingMethod() : ""}
  
  ${options.enableEmbeddings ? this.generateEmbeddingsMethod() : ""}
  
  ${options.enableFunctionCalling ? this.generateFunctionCallingMethod() : ""}
  
  ${options.enableVision ? this.generateVisionMethod() : ""}
  
  ${options.enableAudio ? this.generateAudioMethods() : ""}

  private async executeWithRateLimit<T>(
    operation: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    // Check cache first
    if (cacheKey && this.cache.enabled) {
      const cached = await this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Apply rate limiting
    await this.rateLimiter.acquire();

    try {
      const result = await this.errorHandler.execute(operation);
      
      // Cache the result
      if (cacheKey && this.cache.enabled) {
        await this.cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    
    try {
      await this.client.models.list();
      return {
        status: 'healthy',
        latency: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start
      };
    }
  }

  async getUsageStats(): Promise<{
    requests: number;
    tokens: number;
    cost: number;
    errors: number;
  }> {
    return {
      requests: this.rateLimiter.getRequestCount(),
      tokens: this.rateLimiter.getTokenCount(),
      cost: this.rateLimiter.getEstimatedCost(),
      errors: this.errorHandler.getErrorCount()
    };
  }
}`;

		await this.ensureDirectoryExists(options.outputPath);
		await fs.writeFile(
			join(options.outputPath, `${options.name.toLowerCase()}.service.ts`),
			serviceContent,
		);
	}

	private generateChatCompletionMethod(): string {
		return `
  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatOptions = {}
  ): Promise<string> {
    const cacheKey = options.enableCaching 
      ? this.generateCacheKey('chat', messages, options)
      : undefined;

    return this.executeWithRateLimit(async () => {
      const params: ChatCompletionCreateParams = {
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop,
        seed: options.seed,
        tools: options.tools,
        tool_choice: options.toolChoice,
      };

      const completion = await this.client.chat.completions.create(params);
      return completion.choices[0]?.message?.content || '';
    }, cacheKey);
  }`;
	}

	private generateStreamingMethod(): string {
		return `
  async *streamChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: StreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    await this.rateLimiter.acquire();

    try {
      const params: ChatCompletionCreateParams = {
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true,
        ...options
      };

      const stream = await this.client.chat.completions.create(params);
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error);
      throw error;
    }
  }`;
	}

	private generateEmbeddingsMethod(): string {
		return `
  async createEmbedding(
    input: string | string[],
    options: EmbeddingOptions = {}
  ): Promise<number[][]> {
    const cacheKey = options.enableCaching 
      ? this.generateCacheKey('embedding', input, options)
      : undefined;

    return this.executeWithRateLimit(async () => {
      const params: EmbeddingCreateParams = {
        model: options.model || 'text-embedding-3-small',
        input,
        encoding_format: options.encodingFormat || 'float',
        dimensions: options.dimensions,
        user: options.user,
      };

      const response = await this.client.embeddings.create(params);
      return response.data.map(item => item.embedding);
    }, cacheKey);
  }

  async createEmbeddingBatch(
    inputs: string[],
    options: EmbeddingOptions = {}
  ): Promise<number[][]> {
    const batchSize = options.batchSize || 100;
    const results: number[][] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchEmbeddings = await this.createEmbedding(batch, options);
      results.push(...batchEmbeddings);
    }

    return results;
  }`;
	}

	private generateFunctionCallingMethod(): string {
		return `
  async callFunction(
    messages: ChatCompletionMessageParam[],
    functions: any[],
    options: FunctionCallOptions = {}
  ): Promise<{
    response: string;
    functionCalls: Array<{
      name: string;
      arguments: any;
      result?: any;
    }>;
  }> {
    return this.executeWithRateLimit(async () => {
      const tools = functions.map(func => ({
        type: 'function' as const,
        function: func
      }));

      const params: ChatCompletionCreateParams = {
        model: options.model || 'gpt-4o',
        messages,
        tools,
        tool_choice: options.toolChoice || 'auto',
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      };

      const completion = await this.client.chat.completions.create(params);
      const message = completion.choices[0]?.message;
      
      const functionCalls: Array<{
        name: string;
        arguments: any;
        result?: any;
      }> = [];

      if (message?.tool_calls) {
        for (const toolCall of message.tool_calls) {
          if (toolCall.type === 'function') {
            const funcCall = {
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
              result: undefined as any
            };

            // Execute function if handler provided
            if (options.functionHandlers?.[funcCall.name]) {
              try {
                funcCall.result = await options.functionHandlers[funcCall.name](
                  funcCall.arguments
                );
              } catch (error) {
                funcCall.result = { error: String(error) };
              }
            }

            functionCalls.push(funcCall);
          }
        }
      }

      return {
        response: message?.content || '',
        functionCalls
      };
    });
  }`;
	}

	private generateVisionMethod(): string {
		return `
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options: ChatOptions = {}
  ): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ];

    return this.chatCompletion(messages, {
      ...options,
      model: options.model || 'gpt-4o'
    });
  }

  async analyzeImages(
    images: Array<{ url: string; description?: string }>,
    prompt: string,
    options: ChatOptions = {}
  ): Promise<string> {
    const content: any[] = [{ type: 'text', text: prompt }];
    
    for (const image of images) {
      content.push({
        type: 'image_url',
        image_url: { url: image.url }
      });
      
      if (image.description) {
        content.push({
          type: 'text',
          text: \`Description: \${image.description}\`
        });
      }
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'user', content }
    ];

    return this.chatCompletion(messages, {
      ...options,
      model: options.model || 'gpt-4o'
    });
  }`;
	}

	private generateAudioMethods(): string {
		return `
  async textToSpeech(
    text: string,
    options: {
      model?: 'tts-1' | 'tts-1-hd';
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
      speed?: number;
    } = {}
  ): Promise<Buffer> {
    return this.executeWithRateLimit(async () => {
      const params: AudioSpeechCreateParams = {
        model: options.model || 'tts-1',
        input: text,
        voice: options.voice || 'alloy',
        response_format: options.responseFormat || 'mp3',
        speed: options.speed || 1.0,
      };

      const response = await this.client.audio.speech.create(params);
      return Buffer.from(await response.arrayBuffer());
    });
  }

  async speechToText(
    audioBuffer: Buffer,
    options: {
      model?: 'whisper-1';
      language?: string;
      prompt?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      temperature?: number;
    } = {}
  ): Promise<string> {
    return this.executeWithRateLimit(async () => {
      const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });
      
      const params: AudioTranscriptionCreateParams = {
        file,
        model: options.model || 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        response_format: options.responseFormat || 'text',
        temperature: options.temperature,
      };

      const response = await this.client.audio.transcriptions.create(params);
      return typeof response === 'string' ? response : response.text;
    });
  }`;
	}

	private async generateTypes(options: OpenAIOptions): Promise<void> {
		const typesContent = `import type { 
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption 
} from 'openai/resources/index.js';
import type { RateLimitConfig, CacheConfig, ErrorHandlingConfig } from "../utils/types";

export interface ${options.name}Config {
  readonly apiKey: string;
  readonly organization?: string;
  readonly project?: string;
  readonly baseURL?: string;
  readonly timeout?: number;
  readonly rateLimiting: RateLimitConfig;
  readonly caching?: CacheConfig;
  readonly errorHandling?: ErrorHandlingConfig;
}

export interface ChatOptions {
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly frequencyPenalty?: number;
  readonly presencePenalty?: number;
  readonly stop?: string | string[];
  readonly seed?: number;
  readonly tools?: ChatCompletionTool[];
  readonly toolChoice?: ChatCompletionToolChoiceOption;
  readonly enableCaching?: boolean;
}

export interface StreamOptions extends ChatOptions {
  readonly onChunk?: (chunk: string) => void;
  readonly onComplete?: (fullResponse: string) => void;
  readonly onError?: (error: Error) => void;
}

export interface EmbeddingOptions {
  readonly model?: string;
  readonly encodingFormat?: 'float' | 'base64';
  readonly dimensions?: number;
  readonly user?: string;
  readonly batchSize?: number;
  readonly enableCaching?: boolean;
}

export interface FunctionCallOptions extends ChatOptions {
  readonly functionHandlers?: Record<string, (args: any) => Promise<any>>;
  readonly parallel?: boolean;
  readonly timeout?: number;
}

export interface VisionOptions extends ChatOptions {
  readonly detail?: 'low' | 'high' | 'auto';
  readonly maxImages?: number;
}

export interface AudioOptions {
  readonly model?: string;
  readonly voice?: string;
  readonly responseFormat?: string;
  readonly speed?: number;
  readonly language?: string;
  readonly prompt?: string;
  readonly temperature?: number;
}

export interface UsageStats {
  readonly requests: number;
  readonly tokens: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  readonly cost: {
    readonly input: number;
    readonly output: number;
    readonly total: number;
  };
  readonly errors: number;
  readonly latency: {
    readonly avg: number;
    readonly p95: number;
    readonly p99: number;
  };
}

export interface HealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly latency: number;
  readonly rateLimit: {
    readonly remaining: number;
    readonly resetTime: number;
  };
  readonly errors: number;
  readonly uptime: number;
}`;

		await fs.writeFile(join(options.outputPath, "types.ts"), typesContent);
	}

	private async generateUtilities(options: OpenAIOptions): Promise<void> {
		await this.generateRateLimiter(options);
		await this.generateCacheManager(options);
		await this.generateErrorHandler(options);
	}

	private async generateRateLimiter(options: OpenAIOptions): Promise<void> {
		const rateLimiterContent = `import type { RateLimitConfig } from "../types";

export class RateLimiter {
  private requests: number = 0;
  private tokens: number = 0;
  private windowStart: number = Date.now();
  private queue: Array<() => void> = [];
  private processing = false;

  constructor(private readonly config: RateLimitConfig) {}

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const windowElapsed = now - this.windowStart;

      // Reset window if needed
      if (windowElapsed >= 60000) {
        this.requests = 0;
        this.tokens = 0;
        this.windowStart = now;
      }

      // Check if we can proceed
      if (this.requests < this.config.requestsPerMinute) {
        const resolve = this.queue.shift()!;
        this.requests++;
        resolve();
      } else {
        // Wait until window resets
        const waitTime = 60000 - windowElapsed;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.processing = false;
  }

  getRequestCount(): number {
    return this.requests;
  }

  getTokenCount(): number {
    return this.tokens;
  }

  addTokens(count: number): void {
    this.tokens += count;
  }

  getEstimatedCost(): number {
    // Simplified cost calculation
    return this.tokens * 0.00002; // $0.02 per 1K tokens (rough estimate)
  }

  getRemainingRequests(): number {
    return Math.max(0, this.config.requestsPerMinute - this.requests);
  }

  getWindowReset(): number {
    return this.windowStart + 60000;
  }
}`;

		const utilsDir = join(options.outputPath, "utils");
		await this.ensureDirectoryExists(utilsDir);
		await fs.writeFile(join(utilsDir, "rate-limiter.ts"), rateLimiterContent);
	}

	private async generateCacheManager(options: OpenAIOptions): Promise<void> {
		const cacheManagerContent = `import type { CacheConfig } from "../types";
import { createHash } from 'crypto';

export class CacheManager {
  private cache = new Map<string, { value: any; expires: number }>();
  private enabled: boolean;

  constructor(private readonly config?: CacheConfig) {
    this.enabled = !!config;
  }

  get enabled(): boolean {
    return this.enabled;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.enabled || !this.config) return;

    const expires = Date.now() + (this.config.ttl * 1000);
    
    // Check cache size limit
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);
      
      const toRemove = Math.floor(this.config.maxSize * 0.1); // Remove 10%
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(key, { value, expires });
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  generateCacheKey(prefix: string, ...args: any[]): string {
    const data = JSON.stringify(args);
    const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);
    return \`\${prefix}:\${hash}\`;
  }

  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    // Simplified stats - in production you'd track hits/misses
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0,
      hitRate: 0
    };
  }
}`;

		const utilsDir = join(options.outputPath, "utils");
		await fs.writeFile(join(utilsDir, "cache-manager.ts"), cacheManagerContent);
	}

	private async generateErrorHandler(options: OpenAIOptions): Promise<void> {
		const errorHandlerContent = `import type { ErrorHandlingConfig } from "../types";

export class ErrorHandler {
  private errorCount = 0;
  private circuitBreakerOpen = false;
  private lastFailureTime = 0;

  constructor(private readonly config?: ErrorHandlingConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.circuitBreakerOpen) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < 30000) { // 30 second circuit breaker
        throw new Error('Circuit breaker is open');
      } else {
        this.circuitBreakerOpen = false;
      }
    }

    let lastError: Error;
    const maxRetries = this.config?.retryAttempts || 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise()
        ]);
        
        // Success - reset error tracking
        if (this.circuitBreakerOpen) {
          this.circuitBreakerOpen = false;
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        this.errorCount++;
        
        // Check if we should open circuit breaker
        if (this.config?.circuitBreaker && this.errorCount >= 5) {
          this.circuitBreakerOpen = true;
          this.lastFailureTime = Date.now();
        }

        if (attempt < maxRetries && this.isRetryableError(error as Error)) {
          const delay = this.calculateBackoff(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break;
      }
    }

    throw lastError!;
  }

  handleError(error: Error): void {
    console.error('OpenAI API Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  private createTimeoutPromise<T>(): Promise<T> {
    const timeout = this.config?.timeoutMs || 30000;
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeout);
    });
  }

  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'rate limit',
      'timeout',
      'network',
      'ECONNRESET',
      'ETIMEDOUT',
      '429',
      '502',
      '503',
      '504'
    ];

    const errorString = error.message.toLowerCase();
    return retryablePatterns.some(pattern => errorString.includes(pattern));
  }

  private calculateBackoff(attempt: number): number {
    if (!this.config) return 1000;

    switch (this.config.backoffStrategy) {
      case 'exponential':
        return Math.min(1000 * Math.pow(2, attempt), 30000);
      case 'linear':
        return 1000 * (attempt + 1);
      case 'fixed':
      default:
        return 1000;
    }
  }
}`;

		const utilsDir = join(options.outputPath, "utils");
		await fs.writeFile(join(utilsDir, "error-handler.ts"), errorHandlerContent);
	}

	private async generateConfig(options: OpenAIOptions): Promise<void> {
		const configContent = `import type { ${options.name}Config } from "./types";

export const default${options.name}Config: Partial<${options.name}Config> = {
  timeout: 30000,
  rateLimiting: {
    requestsPerMinute: 3000,
    tokensPerMinute: 150000,
    burstLimit: 10,
    strategy: 'sliding-window'
  },
  caching: {
    provider: 'memory',
    ttl: 300, // 5 minutes
    maxSize: 1000,
    compression: false
  },
  errorHandling: {
    retryAttempts: 3,
    backoffStrategy: 'exponential',
    circuitBreaker: true,
    timeoutMs: 30000
  }
};

export function create${options.name}Config(
  apiKey: string,
  overrides: Partial<${options.name}Config> = {}
): ${options.name}Config {
  return {
    apiKey,
    ...default${options.name}Config,
    ...overrides
  };
}`;

		await fs.writeFile(join(options.outputPath, "config.ts"), configContent);
	}

	private async generateTests(options: OpenAIOptions): Promise<void> {
		const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${options.name}Service } from "../${options.name.toLowerCase()}.service";
import type { ${options.name}Config } from "../types";

describe('${options.name}Service', () => {
  let service: ${options.name}Service;
  let mockConfig: ${options.name}Config;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      rateLimiting: {
        requestsPerMinute: 60,
        strategy: 'sliding-window'
      },
      errorHandling: {
        retryAttempts: 2,
        backoffStrategy: 'fixed',
        timeoutMs: 5000
      }
    };

    service = new ${options.name}Service(mockConfig);
  });

  describe('chatCompletion', () => {
    it('should generate chat completion successfully', async () => {
      // Mock OpenAI client
      const mockCompletion = {
        choices: [{
          message: {
            content: 'Test response'
          }
        }]
      };

      vi.spyOn(service['client'].chat.completions, 'create')
        .mockResolvedValue(mockCompletion as any);

      const result = await service.chatCompletion([
        { role: 'user', content: 'Hello' }
      ]);

      expect(result).toBe('Test response');
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(service['client'].chat.completions, 'create')
        .mockRejectedValue(new Error('API Error'));

      await expect(service.chatCompletion([
        { role: 'user', content: 'Hello' }
      ])).rejects.toThrow('API Error');
    });
  });

  ${
		options.enableEmbeddings
			? `
  describe('createEmbedding', () => {
    it('should create embeddings successfully', async () => {
      const mockEmbedding = {
        data: [{
          embedding: [0.1, 0.2, 0.3]
        }]
      };

      vi.spyOn(service['client'].embeddings, 'create')
        .mockResolvedValue(mockEmbedding as any);

      const result = await service.createEmbedding('Test text');

      expect(result).toEqual([[0.1, 0.2, 0.3]]);
    });
  });`
			: ""
	}

  describe('healthCheck', () => {
    it('should return healthy status when API is accessible', async () => {
      vi.spyOn(service['client'].models, 'list')
        .mockResolvedValue({ data: [] } as any);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(typeof result.latency).toBe('number');
    });

    it('should return unhealthy status when API is not accessible', async () => {
      vi.spyOn(service['client'].models, 'list')
        .mockRejectedValue(new Error('Network error'));

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const stats = await service.getUsageStats();

      expect(stats).toHaveProperty('requests');
      expect(stats).toHaveProperty('tokens');
      expect(stats).toHaveProperty('cost');
      expect(stats).toHaveProperty('errors');
    });
  });
});`;

		const testsDir = join(options.outputPath, "__tests__");
		await this.ensureDirectoryExists(testsDir);
		await fs.writeFile(
			join(testsDir, `${options.name.toLowerCase()}.service.test.ts`),
			testContent,
		);
	}

	private async ensureDirectoryExists(dir: string): Promise<void> {
		try {
			await fs.mkdir(dir, { recursive: true });
		} catch (error) {
			// Directory might already exist
		}
	}
}

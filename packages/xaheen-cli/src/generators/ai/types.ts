export interface AIServiceOptions {
	readonly name: string;
	readonly provider: "openai" | "anthropic" | "azure-openai" | "cohere";
	readonly features: readonly AIFeature[];
	readonly outputPath: string;
	readonly includeTypes?: boolean;
	readonly includeTests?: boolean;
	readonly withRateLimiting?: boolean;
	readonly withCaching?: boolean;
}

export interface OpenAIOptions extends AIServiceOptions {
	readonly provider: "openai";
	readonly models: readonly OpenAIModel[];
	readonly enableFunctionCalling?: boolean;
	readonly enableStreaming?: boolean;
	readonly enableVision?: boolean;
	readonly enableEmbeddings?: boolean;
	readonly enableAudio?: boolean;
}

export interface VectorDatabaseOptions {
	readonly name: string;
	readonly provider: "pinecone" | "weaviate" | "qdrant" | "milvus";
	readonly outputPath: string;
	readonly dimension: number;
	readonly metric?: "cosine" | "euclidean" | "dotproduct";
	readonly includeSearch?: boolean;
	readonly includeRecommendations?: boolean;
	readonly includeAnalytics?: boolean;
}

export interface SemanticSearchOptions {
	readonly name: string;
	readonly vectorProvider: "pinecone" | "weaviate" | "qdrant";
	readonly embeddingProvider: "openai" | "cohere" | "sentence-transformers";
	readonly outputPath: string;
	readonly features: readonly SemanticSearchFeature[];
	readonly includeReranking?: boolean;
	readonly includeFiltering?: boolean;
}

export interface AIContentModerationOptions {
	readonly name: string;
	readonly providers: readonly ("openai" | "perspective" | "aws-comprehend")[];
	readonly outputPath: string;
	readonly features: readonly ModerationFeature[];
	readonly severity: "low" | "medium" | "high";
	readonly customRules?: boolean;
}

export interface AIRecommendationOptions {
	readonly name: string;
	readonly type: "collaborative" | "content-based" | "hybrid";
	readonly vectorProvider?: "pinecone" | "weaviate" | "qdrant";
	readonly outputPath: string;
	readonly features: readonly RecommendationFeature[];
	readonly realTime?: boolean;
}

export interface AIAnalyticsOptions {
	readonly name: string;
	readonly providers: readonly ("openai" | "aws-comprehend" | "google-ai")[];
	readonly outputPath: string;
	readonly features: readonly AnalyticsFeature[];
	readonly includeVisualization?: boolean;
	readonly realTime?: boolean;
}

export interface AIContentGenerationOptions {
	readonly name: string;
	readonly providers: readonly ("openai" | "anthropic" | "cohere")[];
	readonly outputPath: string;
	readonly contentTypes: readonly ContentType[];
	readonly includeTemplates?: boolean;
	readonly includeWorkflows?: boolean;
}

export type AIFeature =
	| "chat-completion"
	| "text-generation"
	| "embeddings"
	| "function-calling"
	| "vision"
	| "audio"
	| "streaming"
	| "fine-tuning"
	| "content-moderation";

export type OpenAIModel =
	| "gpt-4o"
	| "gpt-4o-mini"
	| "gpt-4-turbo"
	| "gpt-4"
	| "gpt-3.5-turbo"
	| "text-embedding-3-large"
	| "text-embedding-3-small"
	| "text-embedding-ada-002"
	| "whisper-1"
	| "tts-1"
	| "dall-e-3"
	| "dall-e-2";

export type SemanticSearchFeature =
	| "vector-search"
	| "hybrid-search"
	| "semantic-similarity"
	| "document-chunking"
	| "metadata-filtering"
	| "reranking"
	| "faceted-search"
	| "auto-complete";

export type ModerationFeature =
	| "text-moderation"
	| "image-moderation"
	| "toxicity-detection"
	| "hate-speech-detection"
	| "spam-detection"
	| "profanity-filter"
	| "custom-classifiers"
	| "real-time-moderation";

export type RecommendationFeature =
	| "user-based"
	| "item-based"
	| "content-similarity"
	| "behavioral-tracking"
	| "cold-start-handling"
	| "a-b-testing"
	| "explanation-generation"
	| "diversity-optimization";

export type AnalyticsFeature =
	| "sentiment-analysis"
	| "topic-modeling"
	| "entity-extraction"
	| "keyword-extraction"
	| "document-classification"
	| "trend-analysis"
	| "predictive-analytics"
	| "anomaly-detection";

export type ContentType =
	| "text"
	| "blog-posts"
	| "social-media"
	| "product-descriptions"
	| "emails"
	| "code"
	| "images"
	| "audio"
	| "video-scripts"
	| "documentation";

export interface RateLimitConfig {
	readonly requestsPerMinute: number;
	readonly tokensPerMinute?: number;
	readonly burstLimit?: number;
	readonly strategy: "sliding-window" | "token-bucket" | "fixed-window";
}

export interface CacheConfig {
	readonly provider: "redis" | "memory" | "file";
	readonly ttl: number;
	readonly maxSize?: number;
	readonly compression?: boolean;
}

export interface ErrorHandlingConfig {
	readonly retryAttempts: number;
	readonly backoffStrategy: "exponential" | "linear" | "fixed";
	readonly circuitBreaker?: boolean;
	readonly timeoutMs: number;
}

export interface SecurityConfig {
	readonly apiKeyRotation?: boolean;
	readonly requestSigning?: boolean;
	readonly rateLimiting: RateLimitConfig;
	readonly inputValidation?: boolean;
	readonly outputSanitization?: boolean;
}

/**
 * SSE Generator Interfaces
 * Following Interface Segregation Principle
 */

// Base configuration interface
export interface SSEBaseConfig {
  readonly projectName: string;
  readonly framework: "nestjs" | "express" | "fastify" | "hono";
  readonly environment: "development" | "staging" | "production";
  readonly port?: number;
}

// Feature configuration interfaces following ISP
export interface SSEConnectionConfig {
  readonly heartbeat: SSEHeartbeatConfig;
  readonly reconnection: SSEReconnectionConfig;
  readonly compression: boolean;
  readonly keepAlive: boolean;
  readonly maxConnections?: number;
}

export interface SSESecurityConfig {
  readonly authentication: SSEAuthConfig;
  readonly cors: SSECorsConfig;
  readonly rateLimit: SSERateLimitConfig;
  readonly encryption: boolean;
  readonly headers: Record<string, string>;
}

export interface SSEMonitoringConfig {
  readonly enabled: boolean;
  readonly metrics: SSEMetricsConfig;
  readonly logging: SSELoggingConfig;
  readonly healthCheck: boolean;
  readonly analytics: boolean;
}

export interface SSEClusterConfig {
  readonly enabled: boolean;
  readonly redis: SSERedisConfig;
  readonly scaling: SSEScalingConfig;
  readonly loadBalancing: boolean;
}

export interface SSEFeaturesConfig {
  readonly features: readonly SSEFeature[];
  readonly customFeatures?: readonly SSECustomFeature[];
}

// Detailed service configurations
export interface SSEHeartbeatConfig {
  readonly enabled: boolean;
  readonly interval: number; // milliseconds
  readonly timeout: number;
  readonly retries: number;
}

export interface SSEReconnectionConfig {
  readonly enabled: boolean;
  readonly maxRetries: number;
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly backoffMultiplier: number;
  readonly jitter: boolean;
}

export interface SSEAuthConfig {
  readonly type: "none" | "jwt" | "api-key" | "session" | "oauth";
  readonly jwtSecret?: string;
  readonly apiKeyHeader?: string;
  readonly sessionSecret?: string;
  readonly oauthProvider?: "google" | "github" | "auth0";
  readonly tokenExpiry?: number;
}

export interface SSECorsConfig {
  readonly enabled: boolean;
  readonly origins: readonly string[];
  readonly methods: readonly string[];
  readonly headers: readonly string[];
  readonly credentials: boolean;
}

export interface SSERateLimitConfig {
  readonly enabled: boolean;
  readonly requests: number;
  readonly window: string; // e.g., "1m", "1h"
  readonly skipSuccessfulRequests: boolean;
  readonly skipFailedRequests: boolean;
  readonly keyGenerator?: string;
}

export interface SSEMetricsConfig {
  readonly enabled: boolean;
  readonly provider: "prometheus" | "datadog" | "custom";
  readonly endpoint: string;
  readonly interval: number;
  readonly customMetrics: readonly string[];
}

export interface SSELoggingConfig {
  readonly enabled: boolean;
  readonly level: "debug" | "info" | "warn" | "error";
  readonly format: "json" | "text";
  readonly destination: "console" | "file" | "external";
  readonly filePath?: string;
  readonly rotateSize?: string;
}

export interface SSERedisConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly database: number;
  readonly cluster: boolean;
  readonly sentinel?: SSERedisSentinelConfig;
}

export interface SSERedisSentinelConfig {
  readonly enabled: boolean;
  readonly sentinels: readonly SSESentinelNode[];
  readonly masterName: string;
}

export interface SSESentinelNode {
  readonly host: string;
  readonly port: number;
}

export interface SSEScalingConfig {
  readonly minInstances: number;
  readonly maxInstances: number;
  readonly cpuThreshold: number;
  readonly memoryThreshold: number;
  readonly connectionThreshold: number;
}

// Feature types
export type SSEFeature =
  | "live-dashboard"
  | "progress-tracking"
  | "notifications"
  | "metrics-stream"
  | "log-stream"
  | "stock-ticker"
  | "game-updates"
  | "system-status"
  | "chat-messages"
  | "file-uploads"
  | "queue-status";

export interface SSECustomFeature {
  readonly name: string;
  readonly description: string;
  readonly channels: readonly string[];
  readonly eventTypes: readonly string[];
  readonly authentication: boolean;
  readonly rateLimited: boolean;
}

// Event and message types
export interface SSEEvent {
  readonly id?: string;
  readonly event?: string;
  readonly data: unknown;
  readonly retry?: number;
  readonly timestamp?: number;
}

export interface SSEMessage {
  readonly channel: string;
  readonly event: SSEEvent;
  readonly userId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface SSEConnection {
  readonly id: string;
  readonly userId?: string;
  readonly channels: Set<string>;
  readonly response: unknown; // Framework-specific response object
  readonly metadata: Record<string, unknown>;
  readonly connectedAt: Date;
  readonly lastActivity: Date;
}

// Feature-specific interfaces
export interface LiveDashboardMetrics {
  readonly cpu: number;
  readonly memory: number;
  readonly connections: number;
  readonly requests: number;
  readonly errors: number;
  readonly uptime: number;
  readonly customMetrics?: Record<string, number>;
}

export interface ProgressUpdate {
  readonly id: string;
  readonly name: string;
  readonly progress: number;
  readonly status: "pending" | "running" | "completed" | "failed";
  readonly message?: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface NotificationEvent {
  readonly id: string;
  readonly type: "info" | "warning" | "error" | "success";
  readonly title: string;
  readonly message: string;
  readonly userId?: string;
  readonly channels?: readonly string[];
  readonly priority: "low" | "medium" | "high" | "urgent";
  readonly persistent: boolean;
  readonly expiresAt?: Date;
  readonly actions?: readonly NotificationAction[];
}

export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly action: "dismiss" | "redirect" | "callback";
  readonly url?: string;
  readonly callback?: string;
}

export interface StockTicker {
  readonly symbol: string;
  readonly price: number;
  readonly change: number;
  readonly changePercent: number;
  readonly volume: number;
  readonly timestamp: Date;
  readonly marketStatus: "open" | "closed" | "pre-market" | "after-hours";
}

export interface GameUpdate {
  readonly gameId: string;
  readonly type: "player-joined" | "player-left" | "game-state" | "score-update" | "game-over";
  readonly data: unknown;
  readonly timestamp: Date;
  readonly playerId?: string;
}

export interface SystemStatus {
  readonly service: string;
  readonly status: "healthy" | "degraded" | "down";
  readonly message?: string;
  readonly metrics?: Record<string, number>;
  readonly lastCheck: Date;
  readonly dependencies?: readonly SystemStatus[];
}

export interface LogEntry {
  readonly level: "debug" | "info" | "warn" | "error" | "fatal";
  readonly message: string;
  readonly timestamp: Date;
  readonly service: string;
  readonly requestId?: string;
  readonly userId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly stack?: string;
}

export interface QueueStatus {
  readonly name: string;
  readonly pending: number;
  readonly processing: number;
  readonly completed: number;
  readonly failed: number;
  readonly paused: boolean;
  readonly workers: number;
  readonly throughput: number;
}

export interface FileUploadProgress {
  readonly uploadId: string;
  readonly filename: string;
  readonly size: number;
  readonly uploaded: number;
  readonly progress: number;
  readonly speed: number;
  readonly timeRemaining: number;
  readonly status: "uploading" | "completed" | "failed" | "paused";
  readonly error?: string;
}

// Client configuration
export interface SSEClientConfig {
  readonly url: string;
  readonly reconnect: boolean;
  readonly reconnectInterval: number;
  readonly maxReconnectAttempts: number;
  readonly headers?: Record<string, string>;
  readonly withCredentials: boolean;
}

// Error types
export interface SSEError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly connectionId?: string;
  readonly userId?: string;
}
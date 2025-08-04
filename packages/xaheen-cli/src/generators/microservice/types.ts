/**
 * Microservice Generator Type Definitions
 * Comprehensive types for microservice generation
 */

export interface MicroserviceOptions {
	readonly name: string;
	readonly framework: "nestjs" | "express" | "fastify" | "hono";
	readonly database?: "postgresql" | "mongodb" | "mysql" | "redis" | "none";
	readonly messaging?: "rabbitmq" | "kafka" | "redis-pubsub" | "none";
	readonly authentication?: "jwt" | "oauth" | "bankid" | "none";
	readonly features: readonly MicroserviceFeature[];
	readonly deployment: "docker" | "kubernetes" | "both";
	readonly monitoring: boolean;
	readonly tracing: boolean;
	readonly testing: boolean;
}

export type MicroserviceFeature =
	| "health-checks"
	| "metrics"
	| "service-discovery"
	| "api-gateway"
	| "grpc"
	| "graphql"
	| "websockets"
	| "event-sourcing"
	| "cqrs"
	| "saga-pattern"
	| "circuit-breaker"
	| "rate-limiting"
	| "caching"
	| "logging";

export interface ServiceHealthCheck {
	readonly type: "liveness" | "readiness" | "startup";
	readonly path: string;
	readonly interval: number;
	readonly timeout: number;
	readonly retries: number;
	readonly dependencies?: readonly HealthCheckDependency[];
}

export interface HealthCheckDependency {
	readonly name: string;
	readonly type: "database" | "cache" | "queue" | "external-api";
	readonly url: string;
	readonly critical: boolean;
}

export interface ServiceMetrics {
	readonly provider: "prometheus" | "datadog" | "newrelic";
	readonly port: number;
	readonly path: string;
	readonly customMetrics: readonly CustomMetric[];
}

export interface CustomMetric {
	readonly name: string;
	readonly type: "counter" | "gauge" | "histogram" | "summary";
	readonly description: string;
	readonly labels?: readonly string[];
}

export interface TracingConfig {
	readonly provider: "jaeger" | "zipkin" | "datadog";
	readonly serviceName: string;
	readonly samplingRate: number;
	readonly endpoint: string;
}

export interface ServiceDiscoveryConfig {
	readonly type: "consul" | "eureka" | "kubernetes-dns" | "etcd";
	readonly registrationInterval: number;
	readonly healthCheckInterval: number;
}

export interface MessageQueueConfig {
	readonly type: "rabbitmq" | "kafka" | "redis-pubsub";
	readonly connectionString: string;
	readonly queues: readonly QueueDefinition[];
	readonly deadLetterQueue: boolean;
	readonly retryPolicy: RetryPolicy;
}

export interface QueueDefinition {
	readonly name: string;
	readonly type: "publish" | "subscribe" | "both";
	readonly durable: boolean;
	readonly exclusive?: boolean;
	readonly autoDelete?: boolean;
}

export interface RetryPolicy {
	readonly maxRetries: number;
	readonly backoffMultiplier: number;
	readonly initialDelay: number;
	readonly maxDelay: number;
}

export interface GrpcServiceConfig {
	readonly serviceName: string;
	readonly protoPath: string;
	readonly port: number;
	readonly methods: readonly GrpcMethod[];
	readonly tls: boolean;
	readonly mtls?: boolean;
}

export interface GrpcMethod {
	readonly name: string;
	readonly type:
		| "unary"
		| "server-streaming"
		| "client-streaming"
		| "bidirectional";
	readonly request: string;
	readonly response: string;
}

export interface MicroserviceGeneratorResult {
	readonly success: boolean;
	readonly serviceName: string;
	readonly files: readonly GeneratedFile[];
	readonly commands: readonly string[];
	readonly ports: readonly ServicePort[];
	readonly nextSteps: readonly string[];
	readonly message: string;
}

export interface GeneratedFile {
	readonly path: string;
	readonly content: string;
	readonly type: FileType;
}

export type FileType =
	| "source"
	| "test"
	| "config"
	| "docker"
	| "kubernetes"
	| "terraform"
	| "ci"
	| "documentation";

export interface ServicePort {
	readonly name: string;
	readonly port: number;
	readonly protocol: "http" | "https" | "grpc" | "tcp";
	readonly purpose: string;
}

export interface EventSourcingConfig {
	readonly eventStore: "eventstore" | "kafka" | "custom";
	readonly snapshotInterval: number;
	readonly projections: readonly string[];
}

export interface SagaConfig {
	readonly coordinatorType: "orchestration" | "choreography";
	readonly compensationStrategy: "automatic" | "manual";
	readonly timeout: number;
	readonly steps: readonly SagaStep[];
}

export interface SagaStep {
	readonly name: string;
	readonly service: string;
	readonly action: string;
	readonly compensationAction: string;
	readonly timeout: number;
}

export interface ApiGatewayConfig {
	readonly type: "kong" | "nginx" | "envoy" | "custom";
	readonly routes: readonly GatewayRoute[];
	readonly rateLimiting: boolean;
	readonly authentication: boolean;
	readonly cors: boolean;
}

export interface GatewayRoute {
	readonly path: string;
	readonly service: string;
	readonly methods: readonly string[];
	readonly stripPath?: boolean;
	readonly rewrite?: string;
}

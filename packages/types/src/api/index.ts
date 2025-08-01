import type { ApiResponse, PaginatedResponse, PaginationParams } from "../common";

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

/**
 * HTTP status codes
 */
export enum HttpStatus {
	// Success
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NO_CONTENT = 204,

	// Redirection
	MOVED_PERMANENTLY = 301,
	FOUND = 302,
	NOT_MODIFIED = 304,

	// Client errors
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	CONFLICT = 409,
	UNPROCESSABLE_ENTITY = 422,
	TOO_MANY_REQUESTS = 429,

	// Server errors
	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504,
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
	path: string;
	method: HttpMethod;
	description?: string;
	deprecated?: boolean;
	version?: string;
	auth?: AuthRequirement;
	rateLimit?: RateLimitConfig;
	cache?: CacheConfig;
}

/**
 * Authentication requirement
 */
export interface AuthRequirement {
	required: boolean;
	roles?: string[];
	permissions?: string[];
	scopes?: string[];
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
	keyGenerator?: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
	ttl: number;
	key?: string;
	invalidateOn?: string[];
}

/**
 * Request context
 */
export interface RequestContext {
	requestId: string;
	userId?: string;
	tenantId?: string;
	correlationId?: string;
	ip?: string;
	userAgent?: string;
	locale?: string;
}

/**
 * API request types
 */
export interface ApiRequest<T = unknown> {
	path: string;
	method: HttpMethod;
	headers?: Record<string, string>;
	query?: Record<string, string | string[]>;
	params?: Record<string, string>;
	body?: T;
	context?: RequestContext;
}

/**
 * File upload types
 */
export interface FileUpload {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	size: number;
	buffer?: Buffer;
	path?: string;
}

/**
 * Validation error
 */
export interface ValidationError {
	field: string;
	code: string;
	message: string;
	value?: any;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
	error: {
		code: string;
		message: string;
		details?: any;
		validationErrors?: ValidationError[];
	};
	statusCode: HttpStatus;
	timestamp: string;
	path: string;
	requestId: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
	status: "healthy" | "unhealthy" | "degraded";
	version: string;
	uptime: number;
	timestamp: string;
	services?: Record<string, ServiceHealth>;
}

export interface ServiceHealth {
	status: "up" | "down" | "degraded";
	latency?: number;
	error?: string;
	lastCheck?: string;
}

/**
 * Webhook types
 */
export interface WebhookConfig {
	url: string;
	events: string[];
	secret?: string;
	active: boolean;
	headers?: Record<string, string>;
	retryConfig?: RetryConfig;
}

export interface RetryConfig {
	maxAttempts: number;
	initialDelayMs: number;
	maxDelayMs: number;
	backoffMultiplier: number;
}

export interface WebhookPayload<T = unknown> {
	id: string;
	event: string;
	timestamp: string;
	data: T;
	signature?: string;
}

/**
 * API versioning
 */
export interface ApiVersion {
	version: string;
	deprecated?: boolean;
	deprecationDate?: string;
	sunsetDate?: string;
	migrationGuide?: string;
}

/**
 * OpenAPI types
 */
export interface OpenApiSpec {
	openapi: string;
	info: OpenApiInfo;
	servers?: OpenApiServer[];
	paths: Record<string, Record<string, OpenApiOperation>>;
	components?: OpenApiComponents;
}

export interface OpenApiInfo {
	title: string;
	version: string;
	description?: string;
	termsOfService?: string;
	contact?: OpenApiContact;
	license?: OpenApiLicense;
}

export interface OpenApiServer {
	url: string;
	description?: string;
	variables?: Record<string, OpenApiServerVariable>;
}

export interface OpenApiServerVariable {
	default: string;
	description?: string;
	enum?: string[];
}

export interface OpenApiOperation {
	summary?: string;
	description?: string;
	operationId?: string;
	tags?: string[];
	parameters?: OpenApiParameter[];
	requestBody?: OpenApiRequestBody;
	responses: Record<string, OpenApiResponse>;
	security?: OpenApiSecurityRequirement[];
	deprecated?: boolean;
}

export interface OpenApiParameter {
	name: string;
	in: "query" | "header" | "path" | "cookie";
	description?: string;
	required?: boolean;
	schema: any;
}

export interface OpenApiRequestBody {
	description?: string;
	required?: boolean;
	content: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponse {
	description: string;
	content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
	schema: any;
	example?: any;
	examples?: Record<string, any>;
}

export interface OpenApiComponents {
	schemas?: Record<string, any>;
	responses?: Record<string, OpenApiResponse>;
	parameters?: Record<string, OpenApiParameter>;
	securitySchemes?: Record<string, OpenApiSecurityScheme>;
}

export interface OpenApiSecurityScheme {
	type: "apiKey" | "http" | "oauth2" | "openIdConnect";
	description?: string;
	name?: string;
	in?: "query" | "header" | "cookie";
	scheme?: string;
	bearerFormat?: string;
	flows?: any;
	openIdConnectUrl?: string;
}

export interface OpenApiSecurityRequirement {
	[key: string]: string[];
}

export interface OpenApiContact {
	name?: string;
	url?: string;
	email?: string;
}

export interface OpenApiLicense {
	name: string;
	url?: string;
}

/**
 * Re-export common types
 */
export type { ApiResponse, PaginatedResponse, PaginationParams };
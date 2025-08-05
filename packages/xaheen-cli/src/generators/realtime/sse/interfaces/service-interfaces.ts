/**
 * SSE Service Interfaces
 * Following Interface Segregation Principle
 */

import { GeneratedFile } from "../../../types/generator.types.js";
import { 
  SSEConnection, 
  SSEEvent, 
  SSEMessage, 
  SSEError,
  NotificationEvent,
  ProgressUpdate,
  LiveDashboardMetrics
} from "./index.js";

// Base service interface following Single Responsibility Principle
export interface ISSEService {
  readonly name: string;
  isEnabled(): boolean;
  validate(): Promise<SSEValidationResult>;
  generateFiles(outputDir: string): Promise<GeneratedFile[]>;
}

// Core SSE service interfaces
export interface ISSEConnectionService extends ISSEService {
  addConnection(connection: SSEConnection): Promise<void>;
  removeConnection(connectionId: string): Promise<void>;
  getConnection(connectionId: string): Promise<SSEConnection | null>;
  getConnections(userId?: string): Promise<SSEConnection[]>;
  getConnectionCount(): Promise<number>;
  validateConnectionConfig(): Promise<SSEValidationResult>;
}

export interface ISSEEventService extends ISSEService {
  sendEvent(connectionId: string, event: SSEEvent): Promise<void>;
  broadcastEvent(event: SSEEvent, channel?: string): Promise<void>;
  sendToUser(userId: string, event: SSEEvent): Promise<void>;
  sendToChannel(channel: string, event: SSEEvent): Promise<void>;
  formatEvent(event: SSEEvent): string;
  validateEventConfig(): Promise<SSEValidationResult>;
}

export interface ISSESecurityService extends ISSEService {
  authenticateConnection(request: unknown): Promise<SSEAuthResult>;
  authorizeChannel(userId: string, channel: string): Promise<boolean>;
  validateRateLimit(connectionId: string): Promise<boolean>;
  encryptMessage(message: string): Promise<string>;
  decryptMessage(encryptedMessage: string): Promise<string>;
  validateSecurityConfig(): Promise<SSEValidationResult>;
}

export interface ISSEMonitoringService extends ISSEService {
  recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
  recordEvent(event: string, data?: Record<string, unknown>): Promise<void>;
  getMetrics(): Promise<Record<string, number>>;
  logConnection(connection: SSEConnection, action: "connect" | "disconnect"): Promise<void>;
  logError(error: SSEError): Promise<void>;
  validateMonitoringConfig(): Promise<SSEValidationResult>;
}

export interface ISSEClusterService extends ISSEService {
  broadcastToCluster(message: SSEMessage): Promise<void>;
  subscribeToCluster(channels: readonly string[]): Promise<void>;
  unsubscribeFromCluster(channels: readonly string[]): Promise<void>;
  getClusterNodes(): Promise<string[]>;
  validateClusterConfig(): Promise<SSEValidationResult>;
}

// Feature-specific service interfaces
export interface ISSEFeatureService extends ISSEService {
  readonly featureName: string;
  generateFeatureFiles(outputDir: string): Promise<GeneratedFile[]>;
  generateFeatureTypes(): string;
  generateFeatureController(): string;
  generateFeatureService(): string;
  generateFeatureClient(): string;
}

export interface ILiveDashboardService extends ISSEFeatureService {
  startMetricsCollection(): Promise<void>;
  stopMetricsCollection(): Promise<void>;
  collectMetrics(): Promise<LiveDashboardMetrics>;
  broadcastMetrics(): Promise<void>;
  subscribeToMetrics(connectionId: string): Promise<void>;
}

export interface IProgressTrackingService extends ISSEFeatureService {
  startOperation(id: string, name: string, userId?: string): Promise<void>;
  updateProgress(id: string, progress: number, message?: string): Promise<void>;
  completeOperation(id: string, message?: string): Promise<void>;
  failOperation(id: string, error: string): Promise<void>;
  getOperations(userId?: string): Promise<ProgressUpdate[]>;
  subscribeToProgress(connectionId: string, operationId?: string): Promise<void>;
}

export interface INotificationService extends ISSEFeatureService {
  sendNotification(notification: NotificationEvent): Promise<void>;
  sendToUser(userId: string, notification: NotificationEvent): Promise<void>;
  sendToChannel(channel: string, notification: NotificationEvent): Promise<void>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  getNotifications(userId: string, unreadOnly?: boolean): Promise<NotificationEvent[]>;
  subscribeToNotifications(connectionId: string, userId: string): Promise<void>;
}

// Template generation interfaces following Template Method Pattern
export interface ISSETemplateGenerator {
  generateControllerTemplate(framework: string, config: unknown): string;
  generateServiceTemplate(framework: string, config: unknown): string;
  generateModuleTemplate(framework: string, config: unknown): string;
  generateMiddlewareTemplate(framework: string, config: unknown): string;
  generateClientTemplate(config: unknown): string;
}

export interface ISSECodeGenerator {
  generateFrameworkController(framework: string): string;
  generateFrameworkService(framework: string): string;
  generateFrameworkModule(framework: string): string;
  generateFrameworkMiddleware(framework: string): string;
  generateTypeDefinitions(): string;
}

// Factory interfaces following Dependency Inversion Principle
export interface ISSEServiceFactory {
  createConnectionService(config: unknown): ISSEConnectionService;
  createEventService(config: unknown): ISSEEventService;
  createSecurityService(config: unknown): ISSESecurityService;
  createMonitoringService(config: unknown): ISSEMonitoringService;
  createClusterService(config: unknown): ISSEClusterService;
}

export interface ISSEFeatureFactory {
  createLiveDashboardService(config: unknown): ILiveDashboardService;
  createProgressTrackingService(config: unknown): IProgressTrackingService;
  createNotificationService(config: unknown): INotificationService;
  createCustomFeatureService(featureName: string, config: unknown): ISSEFeatureService;
}

export interface ISSETemplateFactory {
  createTemplateGenerator(framework: string): ISSETemplateGenerator;
  createCodeGenerator(framework: string): ISSECodeGenerator;
}

// Configuration and validation interfaces
export interface ISSEConfigurationManager {
  loadConfiguration(configPath: string): Promise<unknown>;
  validateConfiguration(config: unknown): Promise<SSEValidationResult>;
  mergeConfigurations(configs: unknown[]): unknown;
  getFrameworkConfig(framework: string): unknown;
  generateEnvironmentVariables(config: unknown): Record<string, string>;
}

export interface ISSEHealthChecker {
  checkHealth(): Promise<SSEHealthStatus>;
  checkConnectionHealth(): Promise<boolean>;
  checkClusterHealth(): Promise<boolean>;
  checkDependenciesHealth(): Promise<Record<string, boolean>>;
}

export interface ISSEMetricsCollector {
  collectConnectionMetrics(): Promise<SSEConnectionMetrics>;
  collectPerformanceMetrics(): Promise<SSEPerformanceMetrics>;
  collectErrorMetrics(): Promise<SSEErrorMetrics>;
  exportMetrics(format: "prometheus" | "json"): Promise<string>;
}

// Framework-specific interfaces
export interface INestJSSSEService extends ISSEService {
  generateNestJSController(): string;
  generateNestJSService(): string;
  generateNestJSModule(): string;
  generateNestJSGuard(): string;
  generateNestJSDecorator(): string;
}

export interface IExpressSSEService extends ISSEService {
  generateExpressRouter(): string;
  generateExpressMiddleware(): string;
  generateExpressController(): string;
}

export interface IFastifySSEService extends ISSEService {
  generateFastifyPlugin(): string;
  generateFastifyHandler(): string;
  generateFastifyHooks(): string;
}

export interface IHonoSSEService extends ISSEService {
  generateHonoHandler(): string;
  generateHonoMiddleware(): string;
  generateHonoContext(): string;
}

// Testing interfaces
export interface ISSETestGenerator {
  generateUnitTests(service: string): Promise<GeneratedFile[]>;
  generateIntegrationTests(): Promise<GeneratedFile[]>;
  generateE2ETests(): Promise<GeneratedFile[]>;
  generateLoadTests(): Promise<GeneratedFile[]>;
}

export interface ISSEMockGenerator {
  generateMockService(serviceName: string): string;
  generateMockClient(): string;
  generateTestData(): string;
}

// Result and validation types
export interface SSEValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly SSEValidationError[];
  readonly warnings: readonly SSEValidationWarning[];
}

export interface SSEValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: "error" | "warning" | "info";
  readonly code?: string;
}

export interface SSEValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly recommendation: string;
}

export interface SSEAuthResult {
  readonly success: boolean;
  readonly userId?: string;
  readonly permissions?: readonly string[];
  readonly metadata?: Record<string, unknown>;
  readonly error?: string;
}

export interface SSEHealthStatus {
  readonly status: "healthy" | "degraded" | "down";
  readonly uptime: number;
  readonly connections: number;
  readonly memory: number;
  readonly cpu: number;
  readonly dependencies: Record<string, boolean>;
  readonly lastCheck: Date;
}

export interface SSEConnectionMetrics {
  readonly total: number;
  readonly active: number;
  readonly failed: number;
  readonly averageLifetime: number;
  readonly peakConnections: number;
  readonly connectionsPerSecond: number;
}

export interface SSEPerformanceMetrics {
  readonly messagesPerSecond: number;
  readonly averageLatency: number;
  readonly peakLatency: number;
  readonly throughput: number;
  readonly errorRate: number;
  readonly cpuUsage: number;
  readonly memoryUsage: number;
}

export interface SSEErrorMetrics {
  readonly totalErrors: number;
  readonly errorRate: number;
  readonly errorsByType: Record<string, number>;
  readonly recentErrors: readonly SSEError[];
}

// Client interfaces
export interface ISSEClient {
  connect(): Promise<void>;
  disconnect(): void;
  send(event: SSEEvent): Promise<void>;
  subscribe(channel: string): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  addEventListener(event: string, listener: EventListener): void;
  removeEventListener(event: string, listener: EventListener): void;
  readonly readyState: number;
}

export interface ISSEClientBuilder {
  withUrl(url: string): ISSEClientBuilder;
  withHeaders(headers: Record<string, string>): ISSEClientBuilder;
  withReconnection(config: unknown): ISSEClientBuilder;
  withAuthentication(token: string): ISSEClientBuilder;
  build(): ISSEClient;
}

// Utility interfaces
export interface ISSEEventFormatter {
  formatEvent(event: SSEEvent): string;
  parseEvent(data: string): SSEEvent;
  validateEventFormat(data: string): boolean;
}

export interface ISSEChannelManager {
  createChannel(name: string): Promise<void>;
  deleteChannel(name: string): Promise<void>;
  subscribeToChannel(connectionId: string, channel: string): Promise<void>;
  unsubscribeFromChannel(connectionId: string, channel: string): Promise<void>;
  getChannelSubscribers(channel: string): Promise<string[]>;
  getConnectionChannels(connectionId: string): Promise<string[]>;
}
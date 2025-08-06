/**
 * SSE Connection Service Implementation
 * Handles connection management following Single Responsibility Principle
 */

import { GeneratedFile } from "../../../types/generator.types";
import { 
  ISSEConnectionService, 
  SSEValidationResult,
  SSEValidationError,
  ISSETemplateGenerator,
  ISSEConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  SSEBaseConfig, 
  SSEConnectionConfig,
  SSEConnection,
  SSEHeartbeatConfig,
  SSEReconnectionConfig
} from "../interfaces/index.js";
import { BaseSSEService } from "./base-sse-service";

export class SSEConnectionService extends BaseSSEService implements ISSEConnectionService {
  private readonly connectionConfig: SSEConnectionConfig;

  constructor(
    baseConfig: SSEBaseConfig,
    connectionConfig: SSEConnectionConfig,
    templateGenerator: ISSETemplateGenerator,
    configManager: ISSEConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.connectionConfig = connectionConfig;
  }

  get name(): string {
    return "sse-connection";
  }

  isEnabled(): boolean {
    return true; // Connection service is always enabled
  }

  async generateFiles(outputDir: string): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate connection manager
    files.push(this.createFile(
      `${outputDir}/src/realtime/sse/connection/connection.manager.ts`,
      this.generateConnectionManager(),
      "service"
    ));

    // Generate connection pool
    files.push(this.createFile(
      `${outputDir}/src/realtime/sse/connection/connection.pool.ts`,
      this.generateConnectionPool(),
      "service"
    ));

    // Generate heartbeat service
    if (this.connectionConfig.heartbeat.enabled) {
      files.push(this.createFile(
        `${outputDir}/src/realtime/sse/connection/heartbeat.service.ts`,
        this.generateHeartbeatService(),
        "service"
      ));
    }

    // Generate client reconnection logic
    files.push(this.createFile(
      `${outputDir}/src/realtime/sse/client/reconnection.client.ts`,
      this.generateReconnectionClient(),
      "client"
    ));

    // Generate connection types
    files.push(this.createFile(
      `${outputDir}/src/realtime/sse/connection/connection.types.ts`,
      this.generateConnectionTypes(),
      "types"
    ));

    // Generate connection configuration
    files.push(this.createFile(
      `${outputDir}/src/realtime/sse/connection/connection.config.ts`,
      this.generateConnectionConfig(),
      "config"
    ));

    return files;
  }

  async addConnection(connection: SSEConnection): Promise<void> {
    // Implementation would be in the actual service
    // This is just the generator
  }

  async removeConnection(connectionId: string): Promise<void> {
    // Implementation would be in the actual service
  }

  async getConnection(connectionId: string): Promise<SSEConnection | null> {
    // Implementation would be in the actual service
    return null;
  }

  async getConnections(userId?: string): Promise<SSEConnection[]> {
    // Implementation would be in the actual service
    return [];
  }

  async getConnectionCount(): Promise<number> {
    // Implementation would be in the actual service
    return 0;
  }

  async validateConnectionConfig(): Promise<SSEValidationResult> {
    const errors: SSEValidationError[] = [];
    const warnings = [];

    // Validate heartbeat configuration
    if (this.connectionConfig.heartbeat.enabled) {
      const heartbeatValidation = this.validateHeartbeatConfig(this.connectionConfig.heartbeat);
      errors.push(...heartbeatValidation);
    }

    // Validate reconnection configuration
    const reconnectionValidation = this.validateReconnectionConfig(this.connectionConfig.reconnection);
    errors.push(...reconnectionValidation);

    // Validate max connections
    if (this.connectionConfig.maxConnections && this.connectionConfig.maxConnections < 1) {
      errors.push({
        field: "maxConnections",
        message: "Max connections must be greater than 0",
        severity: "error",
        code: "INVALID_MAX_CONNECTIONS"
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async validateServiceConfig(): Promise<SSEValidationResult> {
    return this.validateConnectionConfig();
  }

  private validateHeartbeatConfig(config: SSEHeartbeatConfig): SSEValidationError[] {
    const errors: SSEValidationError[] = [];

    const intervalValidation = this.validateRange(
      config.interval,
      1000,
      300000,
      "heartbeat.interval"
    );
    if (intervalValidation) errors.push(intervalValidation);

    const timeoutValidation = this.validateRange(
      config.timeout,
      1000,
      60000,
      "heartbeat.timeout"
    );
    if (timeoutValidation) errors.push(timeoutValidation);

    const retriesValidation = this.validateRange(
      config.retries,
      1,
      10,
      "heartbeat.retries"
    );
    if (retriesValidation) errors.push(retriesValidation);

    return errors;
  }

  private validateReconnectionConfig(config: SSEReconnectionConfig): SSEValidationError[] {
    const errors: SSEValidationError[] = [];

    if (config.enabled) {
      const maxRetriesValidation = this.validateRange(
        config.maxRetries,
        1,
        100,
        "reconnection.maxRetries"
      );
      if (maxRetriesValidation) errors.push(maxRetriesValidation);

      const initialDelayValidation = this.validateRange(
        config.initialDelay,
        100,
        60000,
        "reconnection.initialDelay"
      );
      if (initialDelayValidation) errors.push(initialDelayValidation);

      const maxDelayValidation = this.validateRange(
        config.maxDelay,
        1000,
        300000,
        "reconnection.maxDelay"
      );
      if (maxDelayValidation) errors.push(maxDelayValidation);

      if (config.initialDelay >= config.maxDelay) {
        errors.push({
          field: "reconnection.delay",
          message: "Initial delay must be less than max delay",
          severity: "error",
          code: "INVALID_DELAY_RANGE"
        });
      }
    }

    return errors;
  }

  private generateConnectionManager(): string {
    const className = this.getClassName("ConnectionManager");
    
    return `${this.generateImportStatement({
      "events": ["EventEmitter"],
      "./connection.types": ["SSEConnection", "ConnectionEvent"],
      "../monitoring/metrics.service": ["MetricsService"]
    })}

${this.generateTypeDefinition("ConnectionManagerOptions", {
  "maxConnections": "number",
  "heartbeatInterval": "number",
  "compressionEnabled": "boolean"
})}

export class ${className} extends EventEmitter {
  private readonly connections = new Map<string, SSEConnection>();
  private readonly userConnections = new Map<string, Set<string>>();
  private readonly channelSubscriptions = new Map<string, Set<string>>();
  private readonly metricsService: MetricsService;
  private readonly options: ConnectionManagerOptions;

  constructor(options: ConnectionManagerOptions, metricsService: MetricsService) {
    super();
    this.options = options;
    this.metricsService = metricsService;
  }

  ${this.generateMethod(
    "addConnection",
    { "connection": "SSEConnection" },
    "Promise<void>",
    `// Validate max connections
    if (this.connections.size >= this.options.maxConnections) {
      throw new Error('Maximum connections exceeded');
    }

    // Add connection to maps
    this.connections.set(connection.id, connection);
    
    if (connection.userId) {
      if (!this.userConnections.has(connection.userId)) {
        this.userConnections.set(connection.userId, new Set());
      }
      this.userConnections.get(connection.userId)!.add(connection.id);
    }

    // Record metrics
    await this.metricsService.recordMetric('connections.active', this.connections.size);
    await this.metricsService.recordEvent('connection.added', { 
      connectionId: connection.id, 
      userId: connection.userId 
    });

    // Emit event
    this.emit('connection:added', connection);

    console.log(\`Connection added: \${connection.id}\`, {
      userId: connection.userId,
      totalConnections: this.connections.size
    });`,
    true,
    "public"
  )}

  ${this.generateMethod(
    "removeConnection",
    { "connectionId": "string" },
    "Promise<void>",
    `const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Remove from all maps
    this.connections.delete(connectionId);
    
    if (connection.userId) {
      const userConns = this.userConnections.get(connection.userId);
      if (userConns) {
        userConns.delete(connectionId);
        if (userConns.size === 0) {
          this.userConnections.delete(connection.userId);
        }
      }
    }

    // Remove from channel subscriptions
    for (const channel of connection.channels) {
      const channelSubs = this.channelSubscriptions.get(channel);
      if (channelSubs) {
        channelSubs.delete(connectionId);
        if (channelSubs.size === 0) {
          this.channelSubscriptions.delete(channel);
        }
      }
    }

    // Record metrics
    await this.metricsService.recordMetric('connections.active', this.connections.size);
    await this.metricsService.recordEvent('connection.removed', { 
      connectionId, 
      userId: connection.userId 
    });

    // Emit event
    this.emit('connection:removed', connection);

    console.log(\`Connection removed: \${connectionId}\`, {
      userId: connection.userId,
      totalConnections: this.connections.size
    });`,
    true,
    "public"
  )}

  ${this.generateMethod(
    "getConnection",
    { "connectionId": "string" },
    "SSEConnection | undefined",
    `return this.connections.get(connectionId);`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "getUserConnections",
    { "userId": "string" },
    "SSEConnection[]",
    `const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) {
      return [];
    }

    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is SSEConnection => conn !== undefined);`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "subscribeToChannel",
    { "connectionId": "string", "channel": "string" },
    "boolean",
    `const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.channels.add(channel);
    
    if (!this.channelSubscriptions.has(channel)) {
      this.channelSubscriptions.set(channel, new Set());
    }
    this.channelSubscriptions.get(channel)!.add(connectionId);

    this.emit('channel:subscribed', { connectionId, channel });
    
    return true;`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "getChannelSubscribers",
    { "channel": "string" },
    "SSEConnection[]",
    `const connectionIds = this.channelSubscriptions.get(channel);
    if (!connectionIds) {
      return [];
    }

    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is SSEConnection => conn !== undefined);`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "getMetrics",
    {},
    "ConnectionMetrics",
    `return {
      totalConnections: this.connections.size,
      uniqueUsers: this.userConnections.size,
      totalChannels: this.channelSubscriptions.size,
      connectionsPerUser: this.userConnections.size > 0 
        ? this.connections.size / this.userConnections.size 
        : 0
    };`,
    false,
    "public"
  )}
}`;
  }

  private generateConnectionPool(): string {
    return `${this.generateImportStatement({
      "./connection.types": ["SSEConnection", "ConnectionPoolOptions"],
      "../monitoring/metrics.service": ["MetricsService"]
    })}

export class ConnectionPool {
  private readonly pools = new Map<string, Set<SSEConnection>>();
  private readonly metricsService: MetricsService;
  private readonly options: ConnectionPoolOptions;

  constructor(options: ConnectionPoolOptions, metricsService: MetricsService) {
    this.options = options;
    this.metricsService = metricsService;
  }

  ${this.generateMethod(
    "addToPool",
    { "poolName": "string", "connection": "SSEConnection" },
    "void",
    `if (!this.pools.has(poolName)) {
      this.pools.set(poolName, new Set());
    }
    
    const pool = this.pools.get(poolName)!;
    
    // Check pool size limit
    if (pool.size >= this.options.maxPoolSize) {
      throw new Error(\`Pool \${poolName} has reached maximum size\`);
    }
    
    pool.add(connection);`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "removeFromPool",
    { "poolName": "string", "connection": "SSEConnection" },
    "boolean",
    `const pool = this.pools.get(poolName);
    if (!pool) {
      return false;
    }
    
    return pool.delete(connection);`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "getPoolConnections",
    { "poolName": "string" },
    "SSEConnection[]",
    `const pool = this.pools.get(poolName);
    return pool ? Array.from(pool) : [];`,
    false,
    "public"
  )}
}`;
  }

  private generateHeartbeatService(): string {
    const className = this.getClassName("HeartbeatService");
    
    return `${this.generateImportStatement({
      "./connection.manager": [this.getClassName("ConnectionManager")],
      "./connection.types": ["SSEConnection"],
      "../monitoring/metrics.service": ["MetricsService"]
    })}

export class ${className} {
  private readonly connectionManager: ${this.getClassName("ConnectionManager")};
  private readonly metricsService: MetricsService;
  private readonly interval: number;
  private readonly timeout: number;
  private heartbeatTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    connectionManager: ${this.getClassName("ConnectionManager")},
    metricsService: MetricsService,
    options: {
      interval: number;
      timeout: number;
    }
  ) {
    this.connectionManager = connectionManager;
    this.metricsService = metricsService;
    this.interval = options.interval;
    this.timeout = options.timeout;
  }

  ${this.generateMethod(
    "start",
    {},
    "void",
    `if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleHeartbeat();
    console.log('Heartbeat service started');`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "stop",
    {},
    "void",
    `this.isRunning = false;
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    console.log('Heartbeat service stopped');`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "scheduleHeartbeat",
    {},
    "void",
    `if (!this.isRunning) {
      return;
    }

    this.heartbeatTimer = setTimeout(() => {
      this.sendHeartbeat();
      this.scheduleHeartbeat();
    }, this.interval);`,
    false,
    "private"
  )}

  ${this.generateMethod(
    "sendHeartbeat",
    {},
    "Promise<void>",
    `const connections = Array.from(this.connectionManager['connections'].values());
    let successCount = 0;
    let failureCount = 0;

    for (const connection of connections) {
      try {
        // Send heartbeat message
        const heartbeatEvent = {
          event: 'heartbeat',
          data: { timestamp: Date.now() }
        };
        
        // Framework-specific implementation would go here
        // For now, just log
        console.log(\`Sending heartbeat to connection \${connection.id}\`);
        successCount++;
      } catch (error) {
        console.error(\`Failed to send heartbeat to \${connection.id}:\`, error);
        failureCount++;
        
        // Remove failed connection
        await this.connectionManager.removeConnection(connection.id);
      }
    }

    // Record metrics
    await this.metricsService.recordMetric('heartbeat.success', successCount);
    await this.metricsService.recordMetric('heartbeat.failure', failureCount);`,
    true,
    "private"
  )}
}`;
  }

  private generateReconnectionClient(): string {
    return `${this.generateImportStatement({
      "../connection/connection.types": ["SSEConnection", "ReconnectionOptions"]
    })}

export class ReconnectionClient {
  private eventSource?: EventSource;
  private readonly url: string;
  private readonly options: ReconnectionOptions;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private isConnecting = false;

  constructor(url: string, options: ReconnectionOptions) {
    this.url = url;
    this.options = options;
  }

  ${this.generateMethod(
    "connect",
    {},
    "Promise<void>",
    `return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        
        if (this.options.enabled && this.reconnectAttempts < this.options.maxRetries) {
          this.scheduleReconnect();
        } else {
          reject(error);
        }
      };

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event);
      };
    });`,
    true,
    "public"
  )}

  ${this.generateMethod(
    "disconnect",
    {},
    "void",
    `if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;`,
    false,
    "public"
  )}

  ${this.generateMethod(
    "scheduleReconnect",
    {},
    "void",
    `const delay = this.calculateReconnectDelay();
    
    console.log(\`Scheduling reconnection attempt \${this.reconnectAttempts + 1} in \${delay}ms\`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);`,
    false,
    "private"
  )}

  ${this.generateMethod(
    "calculateReconnectDelay",
    {},
    "number",
    `let delay = this.options.initialDelay * Math.pow(this.options.backoffMultiplier, this.reconnectAttempts);
    delay = Math.min(delay, this.options.maxDelay);
    
    if (this.options.jitter) {
      delay += Math.random() * 1000;
    }
    
    return Math.floor(delay);`,
    false,
    "private"
  )}

  ${this.generateMethod(
    "handleMessage",
    { "event": "MessageEvent" },
    "void",
    `try {
      const data = JSON.parse(event.data);
      console.log('Received SSE message:', data);
      
      // Emit custom event or handle message based on type
      if (data.event === 'heartbeat') {
        // Handle heartbeat response
        return;
      }
      
      // Handle other message types
      this.dispatchEvent(new CustomEvent(data.event || 'message', { detail: data }));
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }`,
    false,
    "private"
  )}
}`;
  }

  private generateConnectionTypes(): string {
    return `export interface SSEConnection {
  readonly id: string;
  readonly userId?: string;
  readonly channels: Set<string>;
  readonly response: any; // Framework-specific response object
  readonly metadata: Record<string, unknown>;
  readonly connectedAt: Date;
  lastActivity: Date;
}

export interface ConnectionEvent {
  readonly type: string;
  readonly connectionId: string;
  readonly userId?: string;
  readonly data?: unknown;
  readonly timestamp: Date;
}

export interface ConnectionMetrics {
  readonly totalConnections: number;
  readonly uniqueUsers: number;
  readonly totalChannels: number;
  readonly connectionsPerUser: number;
}

export interface ConnectionPoolOptions {
  readonly maxPoolSize: number;
  readonly cleanupInterval: number;
}

export interface ReconnectionOptions {
  readonly enabled: boolean;
  readonly maxRetries: number;
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly backoffMultiplier: number;
  readonly jitter: boolean;
}`;
  }

  private generateConnectionConfig(): string {
    return `export const connectionConfig = {
  heartbeat: {
    enabled: ${this.connectionConfig.heartbeat.enabled},
    interval: ${this.connectionConfig.heartbeat.interval},
    timeout: ${this.connectionConfig.heartbeat.timeout},
    retries: ${this.connectionConfig.heartbeat.retries}
  },
  reconnection: {
    enabled: ${this.connectionConfig.reconnection.enabled},
    maxRetries: ${this.connectionConfig.reconnection.maxRetries},
    initialDelay: ${this.connectionConfig.reconnection.initialDelay},
    maxDelay: ${this.connectionConfig.reconnection.maxDelay},
    backoffMultiplier: ${this.connectionConfig.reconnection.backoffMultiplier},
    jitter: ${this.connectionConfig.reconnection.jitter}
  },
  compression: ${this.connectionConfig.compression},
  keepAlive: ${this.connectionConfig.keepAlive},
  maxConnections: ${this.connectionConfig.maxConnections || 1000}
};

export default connectionConfig;`;
  }
}
/**
 * Enterprise Telemetry Service for Xaheen CLI
 * Implements comprehensive OpenTelemetry integration with Norwegian compliance
 * Part of EPIC 15 Story 15.4 - Enterprise Monitoring & Observability
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { 
  trace, 
  context, 
  SpanStatusCode, 
  SpanKind, 
  Span, 
  Tracer 
} from '@opentelemetry/api';
import { 
  BatchSpanProcessor, 
  SimpleSpanProcessor,
  SpanProcessor 
} from '@opentelemetry/sdk-trace-node';
import { 
  PeriodicExportingMetricReader,
  MeterProvider 
} from '@opentelemetry/sdk-metrics';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';

/**
 * Enterprise telemetry configuration schema
 */
const TelemetryConfigSchema = z.object({
  serviceName: z.string().default('xaheen-cli'),
  serviceVersion: z.string().default('1.0.0'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Tracing configuration
  tracing: z.object({
    enabled: z.boolean().default(true),
    sampleRate: z.number().min(0).max(1).default(0.1),
    batchSize: z.number().default(1024),
    maxQueueSize: z.number().default(2048),
    exportTimeout: z.number().default(10000),
    spanProcessorType: z.enum(['batch', 'simple']).default('batch'),
  }),
  
  // Metrics configuration
  metrics: z.object({
    enabled: z.boolean().default(true),
    port: z.number().default(9464),
    endpoint: z.string().default('/metrics'),
    exportInterval: z.number().default(15000),
  }),
  
  // Exporters configuration
  exporters: z.object({
    console: z.boolean().default(false),
    otlp: z.object({
      enabled: z.boolean().default(false),
      endpoint: z.string().default('http://localhost:4318'),
      headers: z.record(z.string()).default({}),
      compression: z.enum(['gzip', 'none']).default('gzip'),
    }),
    prometheus: z.object({
      enabled: z.boolean().default(true),
      port: z.number().default(9464),
    }),
  }),
  
  // Norwegian compliance
  compliance: z.object({
    gdprCompliant: z.boolean().default(true),
    norwegianCompliant: z.boolean().default(true),
    dataRetention: z.string().default('30d'),
    personalDataFiltering: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
  }),
  
  // Resource attributes
  resources: z.record(z.string()).default({}),
});

export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;

/**
 * CLI Operation context for tracing
 */
export interface CliOperationContext {
  readonly operationId: string;
  readonly command: string;
  readonly subcommand?: string;
  readonly args: Record<string, any>;
  readonly options: Record<string, any>;
  readonly userId?: string;
  readonly sessionId: string;
  readonly startTime: number;
  readonly parentSpanId?: string;
  readonly traceId?: string;
}

/**
 * Custom span attributes for CLI operations
 */
export interface CliSpanAttributes {
  readonly 'cli.command': string;
  readonly 'cli.subcommand'?: string;
  readonly 'cli.operation_id': string;
  readonly 'cli.session_id': string;
  readonly 'cli.args_count': number;
  readonly 'cli.options_count': number;
  readonly 'cli.duration_ms'?: number;
  readonly 'cli.memory_usage_mb'?: number;
  readonly 'cli.cpu_usage_percent'?: number;
  readonly 'cli.success': boolean;
  readonly 'cli.error_type'?: string;
  readonly 'cli.error_message'?: string;
  readonly 'user.id'?: string;
  readonly 'compliance.gdpr': boolean;
  readonly 'compliance.norwegian': boolean;
}

/**
 * Business KPI metrics
 */
export interface BusinessKPIs {
  readonly commandExecutions: number;
  readonly successRate: number;
  readonly averageExecutionTime: number;
  readonly memoryEfficiency: number;
  readonly errorsByType: Record<string, number>;
  readonly userEngagement: {
    readonly activeUsers: number;
    readonly commandsPerUser: number;
    readonly sessionDuration: number;
  };
  readonly generatorMetrics: {
    readonly componentsGenerated: number;
    readonly linesOfCodeGenerated: number;
    readonly averageGenerationTime: number;
  };
}

/**
 * Enterprise Telemetry Service
 */
export class EnterpriseTelemetryService extends EventEmitter {
  private sdk?: NodeSDK;
  private tracer?: Tracer;
  private meterProvider?: MeterProvider;
  private prometheusExporter?: PrometheusExporter;
  private config: TelemetryConfig;
  private activeOperations: Map<string, CliOperationContext> = new Map();
  private kpiMetrics: BusinessKPIs;
  private initialized: boolean = false;

  constructor(config: Partial<TelemetryConfig> = {}) {
    super();
    this.config = TelemetryConfigSchema.parse(config);
    this.kpiMetrics = this.initializeKPIs();
  }

  /**
   * Initialize the telemetry service
   */
  public async initialize(): Promise<void> {
    try {
      await this.setupResource();
      await this.setupTracing();
      await this.setupMetrics();
      await this.initializeSDK();
      
      this.initialized = true;
      this.emit('initialized', this.config);
      
      logger.info('✅ Enterprise telemetry service initialized successfully', {
        service: this.config.serviceName,
        version: this.config.serviceVersion,
        environment: this.config.environment,
        tracing: this.config.tracing.enabled,
        metrics: this.config.metrics.enabled,
        compliance: {
          gdpr: this.config.compliance.gdprCompliant,
          norwegian: this.config.compliance.norwegianCompliant,
        },
      });
    } catch (error) {
      logger.error('❌ Failed to initialize telemetry service:', error);
      throw error;
    }
  }

  /**
   * Start tracing a CLI operation
   */
  public startOperation(
    command: string,
    args: Record<string, any> = {},
    options: Record<string, any> = {},
    parentContext?: any
  ): CliOperationContext {
    if (!this.initialized || !this.tracer) {
      throw new Error('Telemetry service not initialized');
    }

    const operationId = this.generateOperationId();
    const sessionId = this.generateSessionId();
    const startTime = performance.now();

    const operationContext: CliOperationContext = {
      operationId,
      command,
      subcommand: args.subcommand || options.subcommand,
      args,
      options,
      sessionId,
      startTime,
    };

    // Create span with appropriate context
    const spanContext = parentContext || context.active();
    const span = this.tracer.startSpan(
      `cli.${command}`,
      {
        kind: SpanKind.CLIENT,
        attributes: this.buildSpanAttributes(operationContext),
      },
      spanContext
    );

    // Store operation context with span
    this.activeOperations.set(operationId, {
      ...operationContext,
      traceId: span.spanContext().traceId,
      parentSpanId: span.spanContext().spanId,
    });

    // Update KPIs
    this.updateKPIs('operationStarted', operationContext);

    this.emit('operationStarted', operationContext);
    
    logger.debug(`🚀 Started tracing CLI operation: ${command}`, {
      operationId,
      traceId: span.spanContext().traceId,
      sessionId,
    });

    return operationContext;
  }

  /**
   * End tracing a CLI operation
   */
  public async endOperation(
    operationId: string,
    result: {
      success: boolean;
      error?: Error;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const operationContext = this.activeOperations.get(operationId);
    if (!operationContext || !this.tracer) {
      logger.warn(`Operation context not found: ${operationId}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - operationContext.startTime;
    const memoryUsage = process.memoryUsage();

    // Get the active span
    const span = trace.getActiveSpan();
    if (span) {
      // Add completion attributes
      span.setAttributes({
        'cli.duration_ms': duration,
        'cli.memory_usage_mb': memoryUsage.heapUsed / 1024 / 1024,
        'cli.success': result.success,
        ...(result.error && {
          'cli.error_type': result.error.constructor.name,
          'cli.error_message': this.sanitizeErrorMessage(result.error.message),
        }),
        ...(result.metadata && this.sanitizeAttributes(result.metadata)),
      });

      // Set span status
      if (result.success) {
        span.setStatus({ code: SpanStatusCode.OK });
      } else {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: result.error?.message || 'Operation failed',
        });
        
        if (result.error) {
          span.recordException(result.error);
        }
      }

      span.end();
    }

    // Update KPIs
    this.updateKPIs('operationCompleted', {
      ...operationContext,
      duration,
      success: result.success,
      error: result.error,
    });

    // Clean up
    this.activeOperations.delete(operationId);

    this.emit('operationCompleted', {
      operationContext,
      duration,
      success: result.success,
      error: result.error,
    });

    logger.debug(`✅ Completed CLI operation: ${operationContext.command}`, {
      operationId,
      duration: `${duration.toFixed(2)}ms`,
      success: result.success,
    });
  }

  /**
   * Create a child span for generator operations
   */
  public createGeneratorSpan(
    generatorName: string,
    operation: string,
    parentContext?: any
  ): Span {
    if (!this.tracer) {
      throw new Error('Telemetry service not initialized');
    }

    const spanContext = parentContext || context.active();
    const span = this.tracer.startSpan(
      `generator.${generatorName}.${operation}`,
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          'generator.name': generatorName,
          'generator.operation': operation,
          'generator.type': 'code_generation',
        },
      },
      spanContext
    );

    return span;
  }

  /**
   * Track custom business metrics
   */
  public trackBusinessMetric(
    metricName: string,
    value: number,
    attributes?: Record<string, string>
  ): void {
    if (!this.meterProvider) {
      return;
    }

    const meter = this.meterProvider.getMeter('xaheen-cli-business');
    const counter = meter.createCounter(metricName, {
      description: `Business metric: ${metricName}`,
    });

    counter.add(value, attributes);
    
    this.emit('businessMetricTracked', { metricName, value, attributes });
  }

  /**
   * Get current business KPIs
   */
  public getBusinessKPIs(): BusinessKPIs {
    return { ...this.kpiMetrics };
  }

  /**
   * Export telemetry data
   */
  public async exportTelemetryData(): Promise<{
    traces: any[];
    metrics: any[];
    kpis: BusinessKPIs;
  }> {
    // This would integrate with the actual exporters
    return {
      traces: [], // Would get from trace exporter
      metrics: [], // Would get from metrics exporter
      kpis: this.getBusinessKPIs(),
    };
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.shutdown();
      }
      
      if (this.prometheusExporter) {
        await this.prometheusExporter.shutdown();
      }

      this.initialized = false;
      this.emit('shutdown');
      
      logger.info('✅ Telemetry service shut down successfully');
    } catch (error) {
      logger.error('❌ Error shutting down telemetry service:', error);
      throw error;
    }
  }

  // Private methods

  private async setupResource(): Promise<Resource> {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'xaheen',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
      [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'local',
      
      // Norwegian compliance attributes
      'compliance.region': 'norway',
      'compliance.gdpr': this.config.compliance.gdprCompliant.toString(),
      'compliance.norwegian': this.config.compliance.norwegianCompliant.toString(),
      'compliance.data_retention': this.config.compliance.dataRetention,
      'compliance.audit_enabled': this.config.compliance.auditLogging.toString(),
      
      // Custom resource attributes
      ...this.config.resources,
    });

    return resource;
  }

  private async setupTracing(): Promise<void> {
    if (!this.config.tracing.enabled) {
      return;
    }

    const spanProcessors: SpanProcessor[] = [];

    // Console exporter for development
    if (this.config.exporters.console) {
      const consoleExporter = new ConsoleSpanExporter();
      const processor = this.config.tracing.spanProcessorType === 'batch'
        ? new BatchSpanProcessor(consoleExporter, {
            maxQueueSize: this.config.tracing.maxQueueSize,
            maxExportBatchSize: this.config.tracing.batchSize,
            exportTimeoutMillis: this.config.tracing.exportTimeout,
          })
        : new SimpleSpanProcessor(consoleExporter);
      
      spanProcessors.push(processor);
    }

    // OTLP exporter
    if (this.config.exporters.otlp.enabled) {
      const otlpExporter = new OTLPTraceExporter({
        url: `${this.config.exporters.otlp.endpoint}/v1/traces`,
        headers: this.config.exporters.otlp.headers,
        compression: this.config.exporters.otlp.compression,
      });

      const processor = this.config.tracing.spanProcessorType === 'batch'
        ? new BatchSpanProcessor(otlpExporter, {
            maxQueueSize: this.config.tracing.maxQueueSize,
            maxExportBatchSize: this.config.tracing.batchSize,
            exportTimeoutMillis: this.config.tracing.exportTimeout,
          })
        : new SimpleSpanProcessor(otlpExporter);

      spanProcessors.push(processor);
    }

    // Create tracer
    this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);
  }

  private async setupMetrics(): Promise<void> {
    if (!this.config.metrics.enabled) {
      return;
    }

    // Prometheus exporter
    if (this.config.exporters.prometheus.enabled) {
      this.prometheusExporter = new PrometheusExporter({
        port: this.config.exporters.prometheus.port,
        endpoint: this.config.metrics.endpoint,
      });
    }

    // OTLP metrics exporter
    if (this.config.exporters.otlp.enabled) {
      const otlpMetricExporter = new OTLPMetricExporter({
        url: `${this.config.exporters.otlp.endpoint}/v1/metrics`,
        headers: this.config.exporters.otlp.headers,
      });

      const metricReader = new PeriodicExportingMetricReader({
        exporter: otlpMetricExporter,
        exportIntervalMillis: this.config.metrics.exportInterval,
      });
    }
  }

  private async initializeSDK(): Promise<void> {
    const resource = await this.setupResource();

    this.sdk = new NodeSDK({
      resource,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable file system instrumentation for CLI
          },
          '@opentelemetry/instrumentation-http': {
            enabled: false, // We'll handle HTTP manually if needed
          },
        }),
      ],
    });

    await this.sdk.start();
  }

  private buildSpanAttributes(context: CliOperationContext): CliSpanAttributes {
    return {
      'cli.command': context.command,
      'cli.subcommand': context.subcommand,
      'cli.operation_id': context.operationId,
      'cli.session_id': context.sessionId,
      'cli.args_count': Object.keys(context.args).length,
      'cli.options_count': Object.keys(context.options).length,
      'cli.success': true, // Will be updated on completion
      'user.id': context.userId,
      'compliance.gdpr': this.config.compliance.gdprCompliant,
      'compliance.norwegian': this.config.compliance.norwegianCompliant,
    };
  }

  private sanitizeErrorMessage(message: string): string {
    if (!this.config.compliance.personalDataFiltering) {
      return message;
    }

    // Remove potential personal data from error messages
    const personalDataPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\+?[\d\s\-\(\)]{10,}\b/g, // Phone numbers
    ];

    let sanitized = message;
    personalDataPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
    if (!this.config.compliance.personalDataFiltering) {
      return attributes;
    }

    const sensitiveKeys = ['email', 'phone', 'ssn', 'credit_card', 'password', 'token'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private initializeKPIs(): BusinessKPIs {
    return {
      commandExecutions: 0,
      successRate: 100,
      averageExecutionTime: 0,
      memoryEfficiency: 100,
      errorsByType: {},
      userEngagement: {
        activeUsers: 0,
        commandsPerUser: 0,
        sessionDuration: 0,
      },
      generatorMetrics: {
        componentsGenerated: 0,
        linesOfCodeGenerated: 0,
        averageGenerationTime: 0,
      },
    };
  }

  private updateKPIs(event: string, data: any): void {
    switch (event) {
      case 'operationStarted':
        this.kpiMetrics.commandExecutions++;
        break;
      
      case 'operationCompleted':
        if (data.success) {
          // Update success rate
          const totalOperations = this.kpiMetrics.commandExecutions;
          const currentSuccessRate = this.kpiMetrics.successRate;
          this.kpiMetrics.successRate = 
            (currentSuccessRate * (totalOperations - 1) + 100) / totalOperations;
        } else {
          // Track error
          const errorType = data.error?.constructor.name || 'UnknownError';
          this.kpiMetrics.errorsByType[errorType] = 
            (this.kpiMetrics.errorsByType[errorType] || 0) + 1;
          
          // Update success rate
          const totalOperations = this.kpiMetrics.commandExecutions;
          const currentSuccessRate = this.kpiMetrics.successRate;
          this.kpiMetrics.successRate = 
            (currentSuccessRate * (totalOperations - 1) + 0) / totalOperations;
        }
        
        // Update average execution time
        if (data.duration) {
          const currentAvg = this.kpiMetrics.averageExecutionTime;
          const count = this.kpiMetrics.commandExecutions;
          this.kpiMetrics.averageExecutionTime = 
            (currentAvg * (count - 1) + data.duration) / count;
        }
        break;
    }
  }
}

/**
 * Global telemetry service instance
 */
export const telemetryService = new EnterpriseTelemetryService();

/**
 * Telemetry decorators for CLI commands
 */
export function traced(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operation = telemetryService.startOperation(
        operationName || `${target.constructor.name}.${propertyKey}`,
        { args },
        {}
      );

      try {
        const result = await originalMethod.apply(this, args);
        await telemetryService.endOperation(operation.operationId, { success: true });
        return result;
      } catch (error) {
        await telemetryService.endOperation(operation.operationId, { 
          success: false, 
          error: error as Error 
        });
        throw error;
      }
    };

    return descriptor;
  };
}

export default EnterpriseTelemetryService;
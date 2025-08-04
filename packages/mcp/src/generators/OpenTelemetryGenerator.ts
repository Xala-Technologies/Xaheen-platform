/**
 * OpenTelemetry Integration Generator for All Framework Generators
 * Automatically integrates OpenTelemetry across generated code
 * Part of EPIC 8 Story 8.6: Enhanced Observability & Monitoring
 */

export interface OpenTelemetryConfig {
	readonly projectName: string;
	readonly framework: "nestjs" | "express" | "fastify" | "hono" | "nextjs" | "react";
	readonly serviceName: string;
	readonly serviceVersion: string;
	readonly environment: "development" | "staging" | "production";
	readonly tracing: TracingConfig;
	readonly metrics: MetricsConfig;
	readonly logging: LoggingConfig;
	readonly exporters: readonly ExporterConfig[];
	readonly instrumentation: InstrumentationConfig;
	readonly sampling: SamplingConfig;
	readonly resources: ResourceConfig;
	readonly propagation: PropagationConfig;
	readonly contextManager?: string;
	readonly diagnostics: DiagnosticsConfig;
	readonly compliance: ComplianceConfig;
}

export interface TracingConfig {
	readonly enabled: boolean;
	readonly spanProcessors: readonly SpanProcessorConfig[];
	readonly spanExporters: readonly string[];
	readonly customInstrumentation: readonly CustomInstrumentationConfig[];
	readonly traceIdRatio: number;
	readonly maxSpansPerTrace: number;
	readonly linkCount: number;
	readonly attributeCount: number;
	readonly eventCount: number;
}

export interface SpanProcessorConfig {
	readonly type: "batch" | "simple";
	readonly options?: Record<string, any>;
}

export interface MetricsConfig {
	readonly enabled: boolean;
	readonly readers: readonly MetricReaderConfig[];
	readonly views: readonly MetricViewConfig[];
	readonly instruments: readonly CustomMetricConfig[];
	readonly aggregation: AggregationConfig;
}

export interface MetricReaderConfig {
	readonly name: string;
	readonly type: "periodic" | "delta" | "cumulative";
	readonly options: Record<string, any>;
}

export interface MetricViewConfig {
	readonly name: string;
	readonly instrument: string;
	readonly aggregation: string;
	readonly attributeKeys?: readonly string[];
}

export interface CustomMetricConfig {
	readonly name: string;
	readonly type: "counter" | "histogram" | "gauge" | "updowncounter";
	readonly description: string;
	readonly unit?: string;
	readonly attributes?: Record<string, string>;
}

export interface LoggingConfig {
	readonly enabled: boolean;
	readonly level: "error" | "warn" | "info" | "debug" | "trace";
	readonly processors: readonly LogProcessorConfig[];
	readonly exporters: readonly string[];
	readonly correlation: boolean;
	readonly structuredLogging: boolean;
}

export interface LogProcessorConfig {
	readonly type: "batch" | "simple";
	readonly options?: Record<string, any>;
}

export interface ExporterConfig {
	readonly name: string;
	readonly type: "otlp" | "jaeger" | "zipkin" | "prometheus" | "console" | "datadog";
	readonly endpoint?: string;
	readonly headers?: Record<string, string>;
	readonly compression?: "gzip" | "none";
	readonly protocol?: "grpc" | "http/protobuf" | "http/json";
	readonly timeout?: number;
	readonly batchSize?: number;
	readonly options?: Record<string, any>;
}

export interface InstrumentationConfig {
	readonly autoInstrumentation: readonly AutoInstrumentationConfig[];
	readonly manualInstrumentation: readonly ManualInstrumentationConfig[];
	readonly httpInstrumentation: HttpInstrumentationConfig;
	readonly databaseInstrumentation: DatabaseInstrumentationConfig;
}

export interface AutoInstrumentationConfig {
	readonly name: string;
	readonly enabled: boolean;
	readonly options?: Record<string, any>;
}

export interface ManualInstrumentationConfig {
	readonly name: string;
	readonly tracerName: string;
	readonly version: string;
	readonly spanNames: readonly string[];
}

export interface HttpInstrumentationConfig {
	readonly enabled: boolean;
	readonly ignoreIncomingRequestHook?: string;
	readonly ignoreOutgoingRequestHook?: string;
	readonly requestHook?: string;
	readonly responseHook?: string;
	readonly startIncomingSpanHook?: string;
	readonly startOutgoingSpanHook?: string;
}

export interface DatabaseInstrumentationConfig {
	readonly enabled: boolean;
	readonly captureStatements: boolean;
	readonly sanitizeStatements: boolean;
	readonly maxStatementLength: number;
}

export interface SamplingConfig {
	readonly type: "always_on" | "always_off" | "trace_id_ratio" | "parent_based";
	readonly ratio?: number;
	readonly rules?: readonly SamplingRuleConfig[];
}

export interface SamplingRuleConfig {
	readonly service?: string;
	readonly operation?: string;
	readonly attributes?: Record<string, string>;
	readonly samplingRate: number;
}

export interface ResourceConfig {
	readonly attributes: Record<string, string>;
	readonly detectors: readonly string[];
}

export interface PropagationConfig {
	readonly propagators: readonly string[];
	readonly customHeaders?: Record<string, string>;
}

export interface DiagnosticsConfig {
	readonly enabled: boolean;
	readonly level: "error" | "warn" | "info" | "debug" | "verbose";
	readonly logToConsole: boolean;
	readonly logToFile?: string;
}

export interface ComplianceConfig {
	readonly gdprCompliant: boolean;
	readonly norwegianCompliant: boolean;
	readonly dataRetention: string;
	readonly personalDataFiltering: boolean;
	readonly auditLogging: boolean;
}

export class OpenTelemetryGenerator {
	/**
	 * Generate OpenTelemetry configuration for any framework
	 */
	public async generateOpenTelemetrySetup(
		config: OpenTelemetryConfig
	): Promise<{
		instrumentationSetup: string;
		configFile: string;
		dockerSetup: string;
		kubernetesManifests: string;
		packageDependencies: Record<string, string>;
	}> {
		return {
			instrumentationSetup: this.generateInstrumentationSetup(config),
			configFile: this.generateConfigFile(config),
			dockerSetup: this.generateDockerSetup(config),
			kubernetesManifests: this.generateKubernetesManifests(config),
			packageDependencies: this.generatePackageDependencies(config),
		};
	}

	private generateInstrumentationSetup(config: OpenTelemetryConfig): string {
		const frameworkSpecificSetup = this.getFrameworkSpecificSetup(config);

		return `/**
 * OpenTelemetry Instrumentation Setup
 * Framework: ${config.framework}
 * Service: ${config.serviceName} v${config.serviceVersion}
 * Environment: ${config.environment}
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

// Exporters
${this.generateExporterImports(config)}

// Resource configuration
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: '${config.serviceName}',
  [SemanticResourceAttributes.SERVICE_VERSION]: '${config.serviceVersion}',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: '${config.projectName}',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: '${config.environment}',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || process.env.POD_NAME || 'local',
  ${Object.entries(config.resources.attributes)
		.map(([key, value]) => `'${key}': '${value}'`)
		.join(",\n  ")},
  
  // Norwegian compliance attributes
  ${config.compliance.norwegianCompliant ? `
  'compliance.region': 'norway',
  'compliance.gdpr': '${config.compliance.gdprCompliant}',
  'compliance.data_retention': '${config.compliance.dataRetention}',
  'compliance.audit_enabled': '${config.compliance.auditLogging}',` : ''}
});

// Tracing configuration
${config.tracing.enabled ? this.generateTracingSetup(config) : ''}

// Metrics configuration
${config.metrics.enabled ? this.generateMetricsSetup(config) : ''}

// Logging configuration
${config.logging.enabled ? this.generateLoggingSetup(config) : ''}

// SDK initialization
const sdk = new NodeSDK({
  resource,
  
  ${config.tracing.enabled ? `
  spanProcessors: [
    ${config.tracing.spanProcessors.map(proc => this.generateSpanProcessor(proc)).join(',\n    ')}
  ],` : ''}
  
  ${config.metrics.enabled ? `
  metricReader: new PeriodicExportingMetricReader({
    exporter: prometheusExporter,
    exportIntervalMillis: 15000, // 15 seconds
    exportTimeoutMillis: 5000,   // 5 seconds
  }),` : ''}
  
  instrumentations: [
    getNodeAutoInstrumentations({
      ${this.generateAutoInstrumentationConfig(config)}
    }),
    ${config.instrumentation.manualInstrumentation.map(inst => 
      `// Manual instrumentation for ${inst.name} will be added separately`
    ).join('\n    ')}
  ],
  
  // Sampling configuration
  ${this.generateSamplingConfig(config)}
  
  // Context manager
  ${config.contextManager ? `contextManager: new ${config.contextManager}(),` : ''}
});

// Initialize the SDK
sdk.start()
  .then(() => {
    console.log('✅ OpenTelemetry initialized successfully');
    console.log(\`📊 Service: \${resource.attributes['service.name']}\`);
    console.log(\`🌍 Environment: \${resource.attributes['deployment.environment']}\`);
    ${config.compliance.norwegianCompliant ? `console.log('🇳🇴 Norwegian compliance enabled');` : ''}
  })
  .catch((error) => {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.log('✅ OpenTelemetry shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error shutting down OpenTelemetry:', error);
    process.exit(1);
  }
});

${frameworkSpecificSetup}

export { sdk };
export default sdk;`;
	}

	private generateExporterImports(config: OpenTelemetryConfig): string {
		const imports: string[] = [];
		
		config.exporters.forEach(exporter => {
			switch (exporter.type) {
				case 'otlp':
					imports.push(`import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';`);
					imports.push(`import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';`);
					imports.push(`import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';`);
					break;
				case 'jaeger':
					imports.push(`import { JaegerExporter } from '@opentelemetry/exporter-jaeger';`);
					break;
				case 'zipkin':
					imports.push(`import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';`);
					break;
				case 'prometheus':
					imports.push(`import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';`);
					break;
				case 'console':
					imports.push(`import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';`);
					imports.push(`import { ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';`);
					break;
				case 'datadog':
					imports.push(`import { DatadogExporter } from '@opentelemetry/exporter-datadog';`);
					break;
			}
		});

		return imports.join('\n');
	}

	private generateTracingSetup(config: OpenTelemetryConfig): string {
		return `
// Trace exporters
${config.exporters.filter(e => ['otlp', 'jaeger', 'zipkin', 'console'].includes(e.type))
  .map(exporter => this.generateTraceExporter(exporter)).join('\n')}`;
	}

	private generateTraceExporter(exporter: ExporterConfig): string {
		switch (exporter.type) {
			case 'otlp':
				return `const otlpTraceExporter = new OTLPTraceExporter({
  url: '${exporter.endpoint || 'http://localhost:4318/v1/traces'}',
  headers: ${JSON.stringify(exporter.headers || {})},
  compression: '${exporter.compression || 'gzip'}',
  timeoutMillis: ${exporter.timeout || 10000},
});`;

			case 'jaeger':
				return `const jaegerExporter = new JaegerExporter({
  endpoint: '${exporter.endpoint || 'http://localhost:14268/api/traces'}',
});`;

			case 'zipkin':
				return `const zipkinExporter = new ZipkinExporter({
  url: '${exporter.endpoint || 'http://localhost:9411/api/v2/spans'}',
});`;

			case 'console':
				return `const consoleTraceExporter = new ConsoleSpanExporter();`;

			default:
				return `// ${exporter.type} trace exporter configuration`;
		}
	}

	private generateMetricsSetup(config: OpenTelemetryConfig): string {
		return `
// Metrics exporters
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
}, () => {
  console.log('📊 Prometheus metrics server started on port 9464');
});

// Custom metrics
${config.metrics.instruments.map(metric => this.generateCustomMetric(metric)).join('\n')}`;
	}

	private generateCustomMetric(metric: CustomMetricConfig): string {
		return `
// ${metric.name} - ${metric.description}
const ${metric.name} = opentelemetry.metrics
  .getMeter('${metric.name}')
  .create${metric.type.charAt(0).toUpperCase() + metric.type.slice(1)}('${metric.name}', {
    description: '${metric.description}',
    ${metric.unit ? `unit: '${metric.unit}',` : ''}
  });`;
	}

	private generateLoggingSetup(config: OpenTelemetryConfig): string {
		return `
// Log processors and exporters
${config.logging.processors.map(proc => this.generateLogProcessor(proc)).join('\n')}

// Structured logging setup
${config.logging.structuredLogging ? `
import { createLogger, format, transports } from 'winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

const logger = createLogger({
  level: '${config.logging.level}',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
    ${config.compliance.personalDataFiltering ? `
    format.printf((info) => {
      // Filter personal data for GDPR compliance
      const filtered = { ...info };
      const personalDataFields = ['email', 'phone', 'ssn', 'name', 'address'];
      personalDataFields.forEach(field => {
        if (filtered[field]) {
          filtered[field] = '[REDACTED]';
        }
      });
      return JSON.stringify(filtered);
    })` : ''}
  ),
  transports: [
    new transports.Console(),
    new OpenTelemetryTransportV3({
      logRecordProcessor: batchLogProcessor,
    }),
  ],
});

export { logger };` : ''}`;
	}

	private generateSpanProcessor(processor: SpanProcessorConfig): string {
		const processorType = processor.type === 'batch' ? 'BatchSpanProcessor' : 'SimpleSpanProcessor';
		const options = processor.options ? `, ${JSON.stringify(processor.options)}` : '';
		
		return `new ${processorType}(otlpTraceExporter${options})`;
	}

	private generateLogProcessor(processor: LogProcessorConfig): string {
		const processorType = processor.type === 'batch' ? 'BatchLogRecordProcessor' : 'SimpleLogRecordProcessor';
		return `const ${processor.type}LogProcessor = new ${processorType}(otlpLogExporter);`;
	}

	private generateAutoInstrumentationConfig(config: OpenTelemetryConfig): string {
		const instrumentations: string[] = [];
		
		config.instrumentation.autoInstrumentation.forEach(inst => {
			if (inst.enabled) {
				const options = inst.options ? JSON.stringify(inst.options) : '{}';
				instrumentations.push(`'@opentelemetry/instrumentation-${inst.name}': ${options}`);
			} else {
				instrumentations.push(`'@opentelemetry/instrumentation-${inst.name}': false`);
			}
		});

		// Add HTTP instrumentation
		if (config.instrumentation.httpInstrumentation.enabled) {
			instrumentations.push(`'@opentelemetry/instrumentation-http': {
        ${config.instrumentation.httpInstrumentation.ignoreIncomingRequestHook ? 
          `ignoreIncomingRequestHook: ${config.instrumentation.httpInstrumentation.ignoreIncomingRequestHook},` : ''}
        ${config.instrumentation.httpInstrumentation.ignoreOutgoingRequestHook ?
          `ignoreOutgoingRequestHook: ${config.instrumentation.httpInstrumentation.ignoreOutgoingRequestHook},` : ''}
        ${config.instrumentation.httpInstrumentation.requestHook ?
          `requestHook: ${config.instrumentation.httpInstrumentation.requestHook},` : ''}
        ${config.instrumentation.httpInstrumentation.responseHook ?
          `responseHook: ${config.instrumentation.httpInstrumentation.responseHook},` : ''}
      }`);
		}

		return instrumentations.join(',\n      ');
	}

	private generateSamplingConfig(config: OpenTelemetryConfig): string {
		switch (config.sampling.type) {
			case 'always_on':
				return `sampler: new AlwaysOnSampler(),`;
			case 'always_off':
				return `sampler: new AlwaysOffSampler(),`;
			case 'trace_id_ratio':
				return `sampler: new TraceIdRatioBasedSampler(${config.sampling.ratio || 0.1}),`;
			case 'parent_based':
				return `sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(${config.sampling.ratio || 0.1}),
      }),`;
			default:
				return `sampler: new TraceIdRatioBasedSampler(0.1),`;
		}
	}

	private getFrameworkSpecificSetup(config: OpenTelemetryConfig): string {
		switch (config.framework) {
			case 'nestjs':
				return this.generateNestJSSetup(config);
			case 'express':
				return this.generateExpressSetup(config);
			case 'fastify':
				return this.generateFastifySetup(config);
			case 'hono':
				return this.generateHonoSetup(config);
			case 'nextjs':
				return this.generateNextJSSetup(config);
			case 'react':
				return this.generateReactSetup(config);
			default:
				return '';
		}
	}

	private generateNestJSSetup(config: OpenTelemetryConfig): string {
		return `
// NestJS specific setup
import { OpenTelemetryModule } from '@opentelemetry/instrumentation-nestjs-core';

export const openTelemetryConfig = OpenTelemetryModule.forRoot({
  serviceName: '${config.serviceName}',
  serviceVersion: '${config.serviceVersion}',
  traceAutoInjectors: [
    OpenTelemetryModule.forFeature({
      name: 'HTTP_REQUESTS',
    }),
    OpenTelemetryModule.forFeature({
      name: 'DATABASE_QUERIES',
    }),
  ],
});

// Custom NestJS interceptor for tracing
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tracer = trace.getTracer('nestjs-interceptor');
    const span = tracer.startSpan(\`\${context.getClass().name}.\${context.getHandler().name}\`);
    
    return next.handle().pipe(
      tap(() => {
        span.setStatus({ code: trace.SpanStatusCode.OK });
        span.end();
      }, (error) => {
        span.recordException(error);
        span.setStatus({ 
          code: trace.SpanStatusCode.ERROR, 
          message: error.message 
        });
        span.end();
      })
    );
  }
}`;
	}

	private generateExpressSetup(config: OpenTelemetryConfig): string {
		return `
// Express specific setup
import express from 'express';
import { trace, context } from '@opentelemetry/api';

// Custom Express middleware for tracing
export function tracingMiddleware() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const tracer = trace.getTracer('express-middleware');
    const span = tracer.startSpan(\`\${req.method} \${req.route?.path || req.path}\`);
    
    // Add request attributes
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.route': req.route?.path || req.path,
      'http.user_agent': req.get('User-Agent') || '',
      'user.id': req.user?.id || 'anonymous',
    });
    
    // Wrap response
    const originalSend = res.send;
    res.send = function(body) {
      span.setAttributes({
        'http.status_code': res.statusCode,
        'http.response.size': Buffer.byteLength(body),
      });
      
      if (res.statusCode >= 400) {
        span.setStatus({ 
          code: trace.SpanStatusCode.ERROR,
          message: \`HTTP \${res.statusCode}\`
        });
      }
      
      span.end();
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// Error tracking middleware
export function errorTrackingMiddleware() {
  return (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: trace.SpanStatusCode.ERROR,
        message: error.message
      });
    }
    next(error);
  };
}`;
	}

	private generateFastifySetup(config: OpenTelemetryConfig): string {
		return `
// Fastify specific setup
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { trace } from '@opentelemetry/api';

const tracingPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const tracer = trace.getTracer('fastify-hooks');
    const span = tracer.startSpan(\`\${request.method} \${request.routeOptions.url || request.url}\`);
    
    request.span = span;
    
    span.setAttributes({
      'http.method': request.method,
      'http.url': request.url,
      'http.route': request.routeOptions.url || request.url,
      'http.user_agent': request.headers['user-agent'] || '',
    });
  });
  
  fastify.addHook('onResponse', async (request, reply) => {
    const span = request.span;
    if (span) {
      span.setAttributes({
        'http.status_code': reply.statusCode,
      });
      
      if (reply.statusCode >= 400) {
        span.setStatus({
          code: trace.SpanStatusCode.ERROR,
          message: \`HTTP \${reply.statusCode}\`
        });
      }
      
      span.end();
    }
  });
  
  fastify.addHook('onError', async (request, reply, error) => {
    const span = request.span;
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: trace.SpanStatusCode.ERROR,
        message: error.message
      });
    }
  });
};

export { tracingPlugin };`;
	}

	private generateHonoSetup(config: OpenTelemetryConfig): string {
		return `
// Hono specific setup
import { Hono } from 'hono';
import { trace } from '@opentelemetry/api';

export function tracingMiddleware() {
  return async (c: any, next: any) => {
    const tracer = trace.getTracer('hono-middleware');
    const span = tracer.startSpan(\`\${c.req.method} \${c.req.path}\`);
    
    span.setAttributes({
      'http.method': c.req.method,
      'http.url': c.req.url,
      'http.route': c.req.path,
      'http.user_agent': c.req.header('User-Agent') || '',
    });
    
    c.set('span', span);
    
    try {
      await next();
      
      span.setAttributes({
        'http.status_code': c.res.status,
      });
      
      if (c.res.status >= 400) {
        span.setStatus({
          code: trace.SpanStatusCode.ERROR,
          message: \`HTTP \${c.res.status}\`
        });
      }
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: trace.SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  };
}`;
	}

	private generateNextJSSetup(config: OpenTelemetryConfig): string {
		return `
// Next.js specific setup
// Create instrumentation.ts in your project root

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./telemetry');
  }
}

// Next.js API route wrapper
import { NextApiRequest, NextApiResponse } from 'next';
import { trace } from '@opentelemetry/api';

export function withTracing<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    const tracer = trace.getTracer('nextjs-api');
    const span = tracer.startSpan(\`\${req.method} \${req.url}\`);
    
    span.setAttributes({
      'http.method': req.method || 'GET',
      'http.url': req.url || '',
      'http.user_agent': req.headers['user-agent'] || '',
    });
    
    try {
      await handler(req, res);
      
      span.setAttributes({
        'http.status_code': res.statusCode,
      });
      
      if (res.statusCode >= 400) {
        span.setStatus({
          code: trace.SpanStatusCode.ERROR,
          message: \`HTTP \${res.statusCode}\`
        });
      }
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: trace.SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  };
}

// App Router middleware (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const tracer = trace.getTracer('nextjs-middleware');
  const span = tracer.startSpan(\`\${request.method} \${request.nextUrl.pathname}\`);
  
  span.setAttributes({
    'http.method': request.method,
    'http.url': request.url,
    'http.route': request.nextUrl.pathname,
    'http.user_agent': request.headers.get('user-agent') || '',
  });
  
  const response = NextResponse.next();
  
  response.headers.set('x-trace-id', span.spanContext().traceId);
  
  span.end();
  
  return response;
}`;
	}

	private generateReactSetup(config: OpenTelemetryConfig): string {
		return `
// React specific setup (browser-side)
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';

// Browser tracer provider
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: '${config.serviceName}-frontend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '${config.serviceVersion}',
  }),
});

// Register instrumentations for browser
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation({
      eventNames: ['click', 'submit', 'keydown'],
    }),
    new DocumentLoadInstrumentation(),
  ],
});

provider.register();

// React component wrapper for tracing
import React, { useEffect } from 'react';
import { trace } from '@opentelemetry/api';

export function withTracing<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function TracedComponent(props: P) {
    const tracer = trace.getTracer('react-components');
    
    useEffect(() => {
      const span = tracer.startSpan(\`\${componentName || WrappedComponent.name} mount\`);
      
      return () => {
        span.end();
      };
    }, [tracer]);
    
    return <WrappedComponent {...props} />;
  };
}

// Custom hook for manual tracing
export function useTracing(operationName: string) {
  const tracer = trace.getTracer('react-hooks');
  
  return {
    startSpan: (name: string, attributes?: Record<string, string>) => {
      const span = tracer.startSpan(\`\${operationName}.\${name}\`);
      if (attributes) {
        span.setAttributes(attributes);
      }
      return span;
    },
    trace: tracer,
  };
}`;
	}

	private generateConfigFile(config: OpenTelemetryConfig): string {
		return `/**
 * OpenTelemetry Configuration File
 * This file contains all OpenTelemetry settings and can be loaded from environment variables
 */

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  tracing: {
    enabled: boolean;
    endpoint: string;
    sampleRate: number;
  };
  metrics: {
    enabled: boolean;
    endpoint: string;
    port: number;
  };
  logging: {
    enabled: boolean;
    level: string;
    structured: boolean;
  };
  exporters: {
    otlp: {
      endpoint: string;
      headers: Record<string, string>;
    };
    prometheus: {
      port: number;
      path: string;
    };
  };
  compliance: {
    gdpr: boolean;
    norwegian: boolean;
    dataRetention: string;
  };
}

export const telemetryConfig: TelemetryConfig = {
  serviceName: process.env.OTEL_SERVICE_NAME || '${config.serviceName}',
  serviceVersion: process.env.OTEL_SERVICE_VERSION || '${config.serviceVersion}',
  environment: process.env.NODE_ENV || '${config.environment}',
  
  tracing: {
    enabled: process.env.OTEL_TRACING_ENABLED !== 'false',
    endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
    sampleRate: parseFloat(process.env.OTEL_TRACE_SAMPLE_RATE || '${config.tracing.traceIdRatio}'),
  },
  
  metrics: {
    enabled: process.env.OTEL_METRICS_ENABLED !== 'false',
    endpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
    port: parseInt(process.env.OTEL_METRICS_PORT || '9464', 10),
  },
  
  logging: {
    enabled: process.env.OTEL_LOGGING_ENABLED !== 'false',
    level: process.env.OTEL_LOG_LEVEL || '${config.logging.level}',
    structured: process.env.OTEL_STRUCTURED_LOGGING !== 'false',
  },
  
  exporters: {
    otlp: {
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS 
        ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
        : {},
    },
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_PORT || '9464', 10),
      path: process.env.PROMETHEUS_METRICS_PATH || '/metrics',
    },
  },
  
  compliance: {
    gdpr: process.env.GDPR_COMPLIANCE === 'true',
    norwegian: process.env.NORWEGIAN_COMPLIANCE === 'true',
    dataRetention: process.env.DATA_RETENTION_PERIOD || '${config.compliance.dataRetention}',
  },
};

export default telemetryConfig;`;
	}

	private generateDockerSetup(config: OpenTelemetryConfig): string {
		return `# Docker Compose setup for OpenTelemetry stack
version: '3.8'

services:
  # Your application
  ${config.serviceName}:
    build: .
    environment:
      - OTEL_SERVICE_NAME=${config.serviceName}
      - OTEL_SERVICE_VERSION=${config.serviceVersion}
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
      - OTEL_RESOURCE_ATTRIBUTES=service.name=${config.serviceName},service.version=${config.serviceVersion}
    ports:
      - "3000:3000"
      - "9464:9464" # Prometheus metrics
    depends_on:
      - otel-collector
    networks:
      - telemetry

  # OpenTelemetry Collector
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.89.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC receiver
      - "4318:4318"   # OTLP HTTP receiver
      - "8888:8888"   # Prometheus metrics
      - "8889:8889"   # Prometheus exporter
    depends_on:
      - jaeger
      - prometheus
    networks:
      - telemetry

  # Jaeger for distributed tracing
  jaeger:
    image: jaegertracing/all-in-one:1.50
    ports:
      - "16686:16686" # Jaeger UI
      - "14250:14250" # gRPC
      - "14268:14268" # HTTP
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - telemetry

  # Prometheus for metrics
  prometheus:
    image: prom/prometheus:v2.47.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=${config.compliance.dataRetention}'
      - '--web.enable-lifecycle'
    networks:
      - telemetry

  # Grafana for observability dashboard
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      ${config.compliance.gdprCompliant ? `
      - GF_ANALYTICS_REPORTING_ENABLED=false
      - GF_ANALYTICS_CHECK_FOR_UPDATES=false` : ''}
    volumes:
      - ./grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
      - ./grafana-dashboards.yml:/etc/grafana/provisioning/dashboards/dashboards.yml
      - ./dashboards:/var/lib/grafana/dashboards
    networks:
      - telemetry

networks:
  telemetry:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:`;
	}

	private generateKubernetesManifests(config: OpenTelemetryConfig): string {
		return `# Kubernetes manifests for OpenTelemetry deployment
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: ${config.projectName}
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
      prometheus:
        config:
          scrape_configs:
            - job_name: '${config.serviceName}'
              scrape_interval: 15s
              static_configs:
                - targets: ['${config.serviceName}:9464']

    processors:
      batch:
        timeout: 1s
        send_batch_size: 1024
      memory_limiter:
        limit_mib: 512
      resource:
        attributes:
          - key: environment
            value: ${config.environment}
            action: upsert
          - key: cluster
            value: ${config.projectName}
            action: upsert
      ${config.compliance.personalDataFiltering ? `
      redaction:
        allow_all_keys: false
        blocked_values:
          - "email"
          - "phone"
          - "ssn"
          - "credit_card"` : ''}

    exporters:
      otlp:
        endpoint: jaeger:4317
        tls:
          insecure: true
      prometheus:
        endpoint: "0.0.0.0:8889"
      logging:
        loglevel: info

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, resource, batch]
          exporters: [otlp, logging]
        metrics:
          receivers: [otlp, prometheus]
          processors: [memory_limiter, resource, batch]
          exporters: [prometheus, logging]
        logs:
          receivers: [otlp]
          processors: [memory_limiter, resource, batch]
          exporters: [logging]

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
  namespace: ${config.projectName}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector-contrib:0.89.0
        args: ["--config=/etc/config/config.yaml"]
        ports:
        - containerPort: 4317
          name: otlp-grpc
        - containerPort: 4318
          name: otlp-http
        - containerPort: 8889
          name: prometheus
        volumeMounts:
        - name: config
          mountPath: /etc/config
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 13133
        readinessProbe:
          httpGet:
            path: /
            port: 13133
      volumes:
      - name: config
        configMap:
          name: otel-collector-config

---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector
  namespace: ${config.projectName}
spec:
  selector:
    app: otel-collector
  ports:
  - name: otlp-grpc
    port: 4317
    targetPort: 4317
  - name: otlp-http
    port: 4318
    targetPort: 4318
  - name: prometheus
    port: 8889
    targetPort: 8889

---
# ServiceMonitor for Prometheus Operator
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${config.serviceName}-metrics
  namespace: ${config.projectName}
spec:
  selector:
    matchLabels:
      app: ${config.serviceName}
  endpoints:
  - port: metrics
    path: /metrics
    interval: 15s
    scrapeTimeout: 10s`;
	}

	private generatePackageDependencies(config: OpenTelemetryConfig): Record<string, string> {
		const baseDependencies = {
			"@opentelemetry/api": "^1.7.0",
			"@opentelemetry/sdk-node": "^0.45.0",
			"@opentelemetry/resources": "^1.18.0",
			"@opentelemetry/semantic-conventions": "^1.18.0",
			"@opentelemetry/auto-instrumentations-node": "^0.40.0",
		};

		// Add exporter dependencies
		config.exporters.forEach(exporter => {
			switch (exporter.type) {
				case 'otlp':
					baseDependencies["@opentelemetry/exporter-trace-otlp-http"] = "^0.45.0";
					baseDependencies["@opentelemetry/exporter-metrics-otlp-http"] = "^0.45.0";
					baseDependencies["@opentelemetry/exporter-logs-otlp-http"] = "^0.45.0";
					break;
				case 'jaeger':
					baseDependencies["@opentelemetry/exporter-jaeger"] = "^1.18.0";
					break;
				case 'zipkin':
					baseDependencies["@opentelemetry/exporter-zipkin"] = "^1.18.0";
					break;
				case 'prometheus':
					baseDependencies["@opentelemetry/exporter-prometheus"] = "^0.45.0";
					break;
				case 'datadog':
					baseDependencies["opentelemetry-exporter-datadog"] = "^0.45.0";
					break;
			}
		});

		// Add framework-specific dependencies
		switch (config.framework) {
			case 'nestjs':
				baseDependencies["@opentelemetry/instrumentation-nestjs-core"] = "^0.34.0";
				break;
			case 'express':
				baseDependencies["@opentelemetry/instrumentation-express"] = "^0.34.0";
				break;
			case 'fastify':
				baseDependencies["@opentelemetry/instrumentation-fastify"] = "^0.33.0";
				break;
			case 'nextjs':
				baseDependencies["@opentelemetry/sdk-trace-web"] = "^1.18.0";
				baseDependencies["@opentelemetry/instrumentation-user-interaction"] = "^0.34.0";
				baseDependencies["@opentelemetry/instrumentation-document-load"] = "^0.34.0";
				break;
			case 'react':
				baseDependencies["@opentelemetry/sdk-trace-web"] = "^1.18.0";
				baseDependencies["@opentelemetry/instrumentation-user-interaction"] = "^0.34.0";
				break;
		}

		// Add logging dependencies if structured logging is enabled
		if (config.logging.structuredLogging) {
			baseDependencies["winston"] = "^3.11.0";
			baseDependencies["@opentelemetry/winston-transport"] = "^0.34.0";
		}

		return baseDependencies;
	}
}
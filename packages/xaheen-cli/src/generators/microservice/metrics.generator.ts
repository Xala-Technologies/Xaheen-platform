/**
 * Metrics Generator
 * Generates Prometheus metrics and monitoring endpoints
 */

import type { GeneratedFile, MicroserviceOptions } from "./types";

export class MetricsGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		switch (options.framework) {
			case "nestjs":
				files.push(...this.generateNestJSMetrics(options));
				break;
			case "express":
				files.push(...this.generateExpressMetrics(options));
				break;
			case "fastify":
				files.push(...this.generateFastifyMetrics(options));
				break;
			case "hono":
				files.push(...this.generateHonoMetrics(options));
				break;
		}

		return files;
	}

	private generateNestJSMetrics(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/metrics/metrics.module.ts`,
			content: `import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
      defaultLabels: {
        app: '${options.name}',
        version: process.env.npm_package_version || '1.0.0',
      },
    }),
  ],
  providers: [MetricsService],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}`,
			type: "source",
		});

		files.push({
			path: `${options.name}/src/metrics/metrics.service.ts`,
			content: `import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    public httpRequestDuration: Histogram<string>,
    @InjectMetric('active_connections')
    public activeConnections: Gauge<string>,
    @InjectMetric('business_events_total')
    public businessEvents: Counter<string>,
  ) {
    // Initialize custom metrics
    this.setupMetrics();
  }

  private setupMetrics() {
    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type'],
    });

    // Business metrics
    this.businessEvents = new Counter({
      name: 'business_events_total',
      help: 'Total number of business events',
      labelNames: ['event_type', 'status'],
    });
  }

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration);
  }

  recordBusinessEvent(eventType: string, status: 'success' | 'failure') {
    this.businessEvents.inc({ event_type: eventType, status });
  }

  setActiveConnections(type: string, count: number) {
    this.activeConnections.set({ type }, count);
  }
}`,
			type: "source",
		});

		files.push({
			path: `${options.name}/src/metrics/metrics.controller.ts`,
			content: `import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { register } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}`,
			type: "source",
		});

		files.push({
			path: `${options.name}/src/metrics/metrics.interceptor.ts`,
			content: `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.recordHttpRequest(
          request.method,
          request.route?.path || request.url,
          response.statusCode,
          duration
        );
      }),
    );
  }
}`,
			type: "source",
		});

		return files;
	}

	private generateExpressMetrics(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/routes/metrics.ts`,
			content: `import { Router } from 'express';
import client from 'prom-client';

// Create a Registry and register default metrics
const register = new client.Registry();
register.setDefaultLabels({
  app: '${options.name}',
  version: process.env.npm_package_version || '1.0.0',
});

// Enable default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
  registers: [register],
});

const businessEvents = new client.Counter({
  name: 'business_events_total',
  help: 'Total number of business events',
  labelNames: ['event_type', 'status'],
  registers: [register],
});

export const metricsRouter = Router();

// Metrics endpoint
metricsRouter.get('/', async (req, res) => {
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.url;
    
    httpRequestDuration.observe(
      { method: req.method, route, status: res.statusCode.toString() },
      duration
    );
    
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode.toString(),
    });
  });
  
  next();
};

// Export metrics utilities
export const metrics = {
  recordBusinessEvent: (eventType: string, status: 'success' | 'failure') => {
    businessEvents.inc({ event_type: eventType, status });
  },
  setActiveConnections: (type: string, count: number) => {
    activeConnections.set({ type }, count);
  },
};`,
			type: "source",
		});

		return files;
	}

	private generateFastifyMetrics(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/plugins/metrics.ts`,
			content: `import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import client from 'prom-client';

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
  // Create a Registry
  const register = new client.Registry();
  register.setDefaultLabels({
    app: '${options.name}',
    version: process.env.npm_package_version || '1.0.0',
  });

  // Enable default metrics
  client.collectDefaultMetrics({ register });

  // Custom metrics
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
    registers: [register],
  });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
  });

  const businessEvents = new client.Counter({
    name: 'business_events_total',
    help: 'Total number of business events',
    labelNames: ['event_type', 'status'],
    registers: [register],
  });

  // Add metrics route
  fastify.get('/metrics', async (request, reply) => {
    reply.type(register.contentType);
    return register.metrics();
  });

  // Add request hook for metrics
  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - (request as any).startTime) / 1000;
    const route = request.routerPath || request.url;
    
    httpRequestDuration.observe(
      { method: request.method, route, status: reply.statusCode.toString() },
      duration
    );
    
    httpRequestsTotal.inc({
      method: request.method,
      route,
      status: reply.statusCode.toString(),
    });
  });

  // Decorate fastify instance with metrics utilities
  fastify.decorate('metrics', {
    recordBusinessEvent: (eventType: string, status: 'success' | 'failure') => {
      businessEvents.inc({ event_type: eventType, status });
    },
  });
};

export default fp(metricsPlugin, {
  name: 'metrics',
  fastify: '4.x',
});`,
			type: "source",
		});

		return files;
	}

	private generateHonoMetrics(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/middleware/metrics.ts`,
			content: `import { Context, Next } from 'hono';
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();
register.setDefaultLabels({
  app: '${options.name}',
  version: process.env.npm_package_version || '1.0.0',
});

// Enable default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const businessEvents = new client.Counter({
  name: 'business_events_total',
  help: 'Total number of business events',
  labelNames: ['event_type', 'status'],
  registers: [register],
});

export const metricsMiddleware = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    
    await next();
    
    const duration = (Date.now() - startTime) / 1000;
    const route = c.req.routePath || c.req.path;
    const status = c.res.status;
    
    httpRequestDuration.observe(
      { method: c.req.method, route, status: status.toString() },
      duration
    );
    
    httpRequestsTotal.inc({
      method: c.req.method,
      route,
      status: status.toString(),
    });
  };
};

export const getMetrics = async () => {
  return register.metrics();
};

export const metrics = {
  recordBusinessEvent: (eventType: string, status: 'success' | 'failure') => {
    businessEvents.inc({ event_type: eventType, status });
  },
};

// Metrics route handler
export const metricsHandler = async (c: Context) => {
  const metricsData = await getMetrics();
  return c.text(metricsData, 200, {
    'Content-Type': register.contentType,
  });
};`,
			type: "source",
		});

		return files;
	}
}

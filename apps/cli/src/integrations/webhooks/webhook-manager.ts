import { z } from 'zod';
import type { GenerationResult } from '../../types.js';
import crypto from 'crypto';

/**
 * Webhook Management System
 * 
 * Provides a unified webhook handling system for all integrations
 * with signature verification, retry logic, and monitoring
 */

// Webhook configuration schema
const webhookOptionsSchema = z.object({
  service: z.enum(['stripe', 'vipps', 'slack', 'teams', 'github', 'custom']),
  events: z.array(z.string()),
  endpoint: z.string().default('/api/webhooks'),
  secret: z.string().optional(),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),
  timeout: z.number().default(30000),
  includeLogging: z.boolean().default(true),
  includeMonitoring: z.boolean().default(true),
  includeRateLimiting: z.boolean().default(true),
  includeSignatureVerification: z.boolean().default(true),
  includeEventStorage: z.boolean().default(true),
  storageType: z.enum(['database', 'redis', 'memory']).default('database'),
  typescript: z.boolean().default(true),
  framework: z.enum(['express', 'nextjs', 'fastify', 'hono']).default('nextjs'),
  projectName: z.string(),
  outputPath: z.string()
});

export type WebhookOptions = z.infer<typeof webhookOptionsSchema>;

/**
 * Webhook Service Configuration
 */
export class WebhookConfig {
  /**
   * Get service-specific webhook configuration
   */
  getServiceConfig(service: string): any {
    const configs: Record<string, any> = {
      stripe: {
        signatureHeader: 'stripe-signature',
        signatureAlgorithm: 'sha256',
        events: [
          'payment_intent.succeeded',
          'payment_intent.failed',
          'charge.succeeded',
          'charge.failed',
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'checkout.session.completed'
        ]
      },
      vipps: {
        signatureHeader: 'x-vipps-signature',
        signatureAlgorithm: 'sha256',
        events: [
          'PAYMENT.AUTHORIZED',
          'PAYMENT.CAPTURED',
          'PAYMENT.CANCELLED',
          'PAYMENT.REFUNDED',
          'AGREEMENT.CREATED',
          'AGREEMENT.UPDATED',
          'AGREEMENT.STOPPED'
        ]
      },
      slack: {
        signatureHeader: 'x-slack-signature',
        signatureAlgorithm: 'sha256',
        timestampHeader: 'x-slack-request-timestamp',
        events: [
          'app_mention',
          'message.channels',
          'message.im',
          'slash_commands',
          'interactive_message',
          'event_callback'
        ]
      },
      teams: {
        signatureHeader: 'authorization',
        signatureAlgorithm: 'hmac-sha256',
        events: [
          'message',
          'conversationUpdate',
          'invoke',
          'messageReaction'
        ]
      },
      github: {
        signatureHeader: 'x-hub-signature-256',
        signatureAlgorithm: 'sha256',
        events: [
          'push',
          'pull_request',
          'issues',
          'release',
          'deployment',
          'workflow_run'
        ]
      }
    };

    return configs[service] || {
      signatureHeader: 'x-webhook-signature',
      signatureAlgorithm: 'sha256',
      events: []
    };
  }

  /**
   * Generate webhook configuration code
   */
  generateConfig(options: WebhookOptions): string {
    const serviceConfig = this.getServiceConfig(options.service);

    return `
// Webhook Configuration for ${options.service}
export const webhookConfig = {
  service: '${options.service}',
  endpoint: '${options.endpoint}',
  secret: process.env.${options.service.toUpperCase()}_WEBHOOK_SECRET || '${options.secret}',
  signatureHeader: '${serviceConfig.signatureHeader}',
  signatureAlgorithm: '${serviceConfig.signatureAlgorithm}',
  ${serviceConfig.timestampHeader ? `timestampHeader: '${serviceConfig.timestampHeader}',` : ''}
  retryAttempts: ${options.retryAttempts},
  retryDelay: ${options.retryDelay},
  timeout: ${options.timeout},
  events: ${JSON.stringify(options.events.length > 0 ? options.events : serviceConfig.events, null, 2)},
  features: {
    logging: ${options.includeLogging},
    monitoring: ${options.includeMonitoring},
    rateLimiting: ${options.includeRateLimiting},
    signatureVerification: ${options.includeSignatureVerification},
    eventStorage: ${options.includeEventStorage}
  },
  storage: {
    type: '${options.storageType}',
    ${options.storageType === 'redis' ? `redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }` : ''}
    ${options.storageType === 'database' ? `database: {
      connectionString: process.env.DATABASE_URL
    }` : ''}
  }
};`;
  }
}

/**
 * Generate webhook handler for a service
 */
export async function generateWebhookHandler(
  service: string,
  events: string[],
  options: WebhookOptions
): Promise<GenerationResult> {
  const config = new WebhookConfig();
  const files = new Map<string, string>();

  // Generate webhook configuration
  files.set(`config/webhooks/${service}.config.ts`, config.generateConfig({ ...options, service, events }));

  // Generate main webhook handler
  const handlerContent = `
${options.typescript ? `
import type { Request, Response, NextFunction } from 'express';
import type { NextApiRequest, NextApiResponse } from 'next';
` : ''}
import crypto from 'crypto';
import { webhookConfig } from '../config/webhooks/${service}.config';
${options.includeEventStorage ? `import { WebhookEventStore } from '../stores/webhook-store';` : ''}
${options.includeMonitoring ? `import { WebhookMonitor } from '../monitoring/webhook-monitor';` : ''}
${options.includeRateLimiting ? `import { RateLimiter } from '../utils/rate-limiter';` : ''}

/**
 * ${service.charAt(0).toUpperCase() + service.slice(1)} Webhook Handler
 * Processes incoming webhooks with signature verification and retry logic
 */
export class ${service.charAt(0).toUpperCase() + service.slice(1)}WebhookHandler {
  ${options.includeEventStorage ? `private eventStore = new WebhookEventStore(webhookConfig.storage);` : ''}
  ${options.includeMonitoring ? `private monitor = new WebhookMonitor('${service}');` : ''}
  ${options.includeRateLimiting ? `private rateLimiter = new RateLimiter();` : ''}

  /**
   * Main webhook handler
   */
  async handle${options.framework === 'nextjs' ? 'NextJS' : 'Express'}(
    ${options.framework === 'nextjs' ? 
      `req${options.typescript ? ': NextApiRequest' : ''}, res${options.typescript ? ': NextApiResponse' : ''}` :
      `req${options.typescript ? ': Request' : ''}, res${options.typescript ? ': Response' : ''}, next${options.typescript ? ': NextFunction' : ''}`
    }
  ) {
    const startTime = Date.now();
    
    try {
      ${options.includeLogging ? `console.log(\`Webhook received: \${req.method} \${req.url}\`);` : ''}
      
      // Verify HTTP method
      if (req.method !== 'POST') {
        ${options.includeMonitoring ? `this.monitor.recordError('invalid_method');` : ''}
        return res.status(405).json({ error: 'Method not allowed' });
      }

      ${options.includeRateLimiting ? `
      // Check rate limit
      const clientIp = this.getClientIp(req);
      if (!await this.rateLimiter.checkLimit(clientIp)) {
        ${options.includeMonitoring ? `this.monitor.recordError('rate_limit_exceeded');` : ''}
        return res.status(429).json({ error: 'Too many requests' });
      }
      ` : ''}

      // Get raw body for signature verification
      const rawBody = await this.getRawBody(req);
      
      ${options.includeSignatureVerification ? `
      // Verify webhook signature
      if (!this.verifySignature(rawBody, req.headers)) {
        ${options.includeMonitoring ? `this.monitor.recordError('invalid_signature');` : ''}
        return res.status(401).json({ error: 'Invalid signature' });
      }
      ` : ''}

      // Parse event
      const event = JSON.parse(rawBody.toString());
      
      ${options.includeLogging ? `console.log('Processing webhook event:', event.type || event.event);` : ''}
      
      ${options.includeEventStorage ? `
      // Store event
      await this.eventStore.store({
        service: '${service}',
        event: event,
        timestamp: new Date(),
        headers: req.headers,
        processed: false
      });
      ` : ''}

      // Process event with retry logic
      const result = await this.processEventWithRetry(event);
      
      ${options.includeMonitoring ? `
      // Record metrics
      this.monitor.recordEvent({
        type: event.type || event.event,
        duration: Date.now() - startTime,
        success: result.success
      });
      ` : ''}

      res.status(200).json({ received: true, result });
    } catch (error) {
      ${options.includeLogging ? `console.error('Webhook handler error:', error);` : ''}
      ${options.includeMonitoring ? `this.monitor.recordError('handler_error', error);` : ''}
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error${options.typescript ? ' instanceof Error ? error.message : String(error)' : '.message'}
      });
    }
  }

  /**
   * Process event with retry logic
   */
  private async processEventWithRetry(event${options.typescript ? ': any' : ''})${options.typescript ? ': Promise<{ success: boolean; data?: any; error?: any }>' : ''} {
    let lastError;
    
    for (let attempt = 1; attempt <= webhookConfig.retryAttempts; attempt++) {
      try {
        const result = await this.processEvent(event);
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        ${options.includeLogging ? `console.warn(\`Event processing attempt \${attempt} failed:\`, error);` : ''}
        
        if (attempt < webhookConfig.retryAttempts) {
          await this.delay(webhookConfig.retryDelay * attempt);
        }
      }
    }
    
    return { success: false, error: lastError };
  }

  /**
   * Process the webhook event
   */
  private async processEvent(event${options.typescript ? ': any' : ''})${options.typescript ? ': Promise<any>' : ''} {
    const eventType = event.type || event.event || event.action;
    
    // Route to specific event handlers
    switch (eventType) {
      ${events.map(e => `
      case '${e}':
        return await this.handle${e.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}(event);
      `).join('')}
      
      default:
        ${options.includeLogging ? `console.log('Unhandled webhook event:', eventType);` : ''}
        return { handled: false, eventType };
    }
  }

  ${events.map(e => `
  /**
   * Handle ${e} event
   */
  private async handle${e.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}(event${options.typescript ? ': any' : ''}) {
    // TODO: Implement ${e} event handling
    console.log('Handling ${e} event:', event);
    
    // Example implementation
    // - Update database
    // - Send notifications
    // - Trigger workflows
    // - Update external systems
    
    return { processed: true, event: '${e}' };
  }
  `).join('')}

  /**
   * Verify webhook signature
   */
  private verifySignature(
    payload${options.typescript ? ': Buffer | string' : ''}, 
    headers${options.typescript ? ': any' : ''}
  )${options.typescript ? ': boolean' : ''} {
    const signature = headers[webhookConfig.signatureHeader];
    if (!signature) return false;

    try {
      ${service === 'stripe' ? `
      // Stripe signature verification
      const elements = signature.split(',');
      let timestamp = '';
      let signatures${options.typescript ? ': string[]' : ''} = [];
      
      for (const element of elements) {
        const [key, value] = element.split('=');
        if (key === 't') timestamp = value;
        if (key === 'v1') signatures.push(value);
      }
      
      const signedPayload = \`\${timestamp}.\${payload}\`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookConfig.secret)
        .update(signedPayload)
        .digest('hex');
      
      return signatures.includes(expectedSignature);
      ` : service === 'slack' ? `
      // Slack signature verification
      const timestamp = headers[webhookConfig.timestampHeader];
      const baseString = \`v0:\${timestamp}:\${payload}\`;
      const expectedSignature = 'v0=' + crypto
        .createHmac('sha256', webhookConfig.secret)
        .update(baseString)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      ` : service === 'github' ? `
      // GitHub signature verification
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', webhookConfig.secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      ` : `
      // Generic HMAC signature verification
      const expectedSignature = crypto
        .createHmac(webhookConfig.signatureAlgorithm, webhookConfig.secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      `}
    } catch (error) {
      ${options.includeLogging ? `console.error('Signature verification error:', error);` : ''}
      return false;
    }
  }

  /**
   * Get raw body from request
   */
  private async getRawBody(req${options.typescript ? ': any' : ''})${options.typescript ? ': Promise<Buffer>' : ''} {
    ${options.framework === 'nextjs' ? `
    // For Next.js API routes
    const chunks${options.typescript ? ': Uint8Array[]' : ''} = [];
    
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
    ` : `
    // For Express
    return req.rawBody || req.body;
    `}
  }

  ${options.includeRateLimiting ? `
  /**
   * Get client IP address
   */
  private getClientIp(req${options.typescript ? ': any' : ''})${options.typescript ? ': string' : ''} {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           'unknown';
  }
  ` : ''}

  /**
   * Delay helper for retry logic
   */
  private delay(ms${options.typescript ? ': number' : ''})${options.typescript ? ': Promise<void>' : ''} {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export handler instance
export const ${service}WebhookHandler = new ${service.charAt(0).toUpperCase() + service.slice(1)}WebhookHandler();

// Export handler functions for different frameworks
${options.framework === 'nextjs' ? `
export default async function handler(
  req${options.typescript ? ': NextApiRequest' : ''}, 
  res${options.typescript ? ': NextApiResponse' : ''}
) {
  return ${service}WebhookHandler.handleNextJS(req, res);
}
` : `
export function ${service}WebhookMiddleware(
  req${options.typescript ? ': Request' : ''}, 
  res${options.typescript ? ': Response' : ''}, 
  next${options.typescript ? ': NextFunction' : ''}
) {
  return ${service}WebhookHandler.handleExpress(req, res, next);
}
`}`;

  files.set(`webhooks/${service}-webhook-handler.ts`, handlerContent);

  // Generate webhook event store if enabled
  if (options.includeEventStorage) {
    const storeContent = `
${options.typescript ? `
export interface WebhookEvent {
  id?: string;
  service: string;
  event: any;
  timestamp: Date;
  headers: any;
  processed: boolean;
  attempts?: number;
  lastError?: string;
}

export interface WebhookEventStore {
  store(event: WebhookEvent): Promise<string>;
  get(id: string): Promise<WebhookEvent | null>;
  list(filters: any): Promise<WebhookEvent[]>;
  update(id: string, updates: Partial<WebhookEvent>): Promise<void>;
  delete(id: string): Promise<void>;
}
` : ''}

/**
 * Webhook Event Store
 * Stores webhook events for processing and auditing
 */
export class WebhookEventStore {
  constructor(private config${options.typescript ? ': any' : ''}) {}

  async store(event${options.typescript ? ': WebhookEvent' : ''})${options.typescript ? ': Promise<string>' : ''} {
    const id = this.generateId();
    
    ${options.storageType === 'database' ? `
    // Database storage implementation
    // TODO: Implement database storage
    console.log('Storing webhook event in database:', id);
    ` : options.storageType === 'redis' ? `
    // Redis storage implementation
    // TODO: Implement Redis storage
    console.log('Storing webhook event in Redis:', id);
    ` : `
    // Memory storage implementation (for development only)
    if (!global.webhookEvents) global.webhookEvents = new Map();
    global.webhookEvents.set(id, { ...event, id });
    `}
    
    return id;
  }

  async get(id${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<WebhookEvent | null>' : ''} {
    ${options.storageType === 'memory' ? `
    return global.webhookEvents?.get(id) || null;
    ` : `
    // TODO: Implement retrieval
    return null;
    `}
  }

  async list(filters${options.typescript ? ': any' : ''} = {})${options.typescript ? ': Promise<WebhookEvent[]>' : ''} {
    ${options.storageType === 'memory' ? `
    if (!global.webhookEvents) return [];
    
    let events = Array.from(global.webhookEvents.values());
    
    // Apply filters
    if (filters.service) {
      events = events.filter(e => e.service === filters.service);
    }
    if (filters.processed !== undefined) {
      events = events.filter(e => e.processed === filters.processed);
    }
    if (filters.from) {
      events = events.filter(e => e.timestamp >= filters.from);
    }
    if (filters.to) {
      events = events.filter(e => e.timestamp <= filters.to);
    }
    
    return events;
    ` : `
    // TODO: Implement listing
    return [];
    `}
  }

  async update(id${options.typescript ? ': string' : ''}, updates${options.typescript ? ': Partial<WebhookEvent>' : ''})${options.typescript ? ': Promise<void>' : ''} {
    ${options.storageType === 'memory' ? `
    const event = global.webhookEvents?.get(id);
    if (event) {
      global.webhookEvents.set(id, { ...event, ...updates });
    }
    ` : `
    // TODO: Implement update
    `}
  }

  async delete(id${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<void>' : ''} {
    ${options.storageType === 'memory' ? `
    global.webhookEvents?.delete(id);
    ` : `
    // TODO: Implement deletion
    `}
  }

  private generateId()${options.typescript ? ': string' : ''} {
    return \`webhook_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}`;

    files.set('stores/webhook-store.ts', storeContent);
  }

  // Generate webhook monitor if enabled
  if (options.includeMonitoring) {
    const monitorContent = `
${options.typescript ? `
export interface WebhookMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  avgProcessingTime: number;
  eventTypes: Record<string, number>;
  errors: Record<string, number>;
  lastEventTime?: Date;
}
` : ''}

/**
 * Webhook Monitor
 * Monitors webhook processing and provides metrics
 */
export class WebhookMonitor {
  private metrics${options.typescript ? ': WebhookMetrics' : ''} = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    avgProcessingTime: 0,
    eventTypes: {},
    errors: {}
  };

  constructor(private service${options.typescript ? ': string' : ''}) {}

  recordEvent(event${options.typescript ? ': { type: string; duration: number; success: boolean }' : ''}) {
    this.metrics.totalEvents++;
    
    if (event.success) {
      this.metrics.successfulEvents++;
    } else {
      this.metrics.failedEvents++;
    }
    
    // Update average processing time
    this.metrics.avgProcessingTime = 
      (this.metrics.avgProcessingTime * (this.metrics.totalEvents - 1) + event.duration) / 
      this.metrics.totalEvents;
    
    // Track event types
    this.metrics.eventTypes[event.type] = (this.metrics.eventTypes[event.type] || 0) + 1;
    
    this.metrics.lastEventTime = new Date();
    
    ${options.includeLogging ? `
    console.log(\`[\${this.service}] Event processed: \${event.type} in \${event.duration}ms\`);
    ` : ''}
  }

  recordError(errorType${options.typescript ? ': string' : ''}, error${options.typescript ? '?: any' : ''}) {
    this.metrics.errors[errorType] = (this.metrics.errors[errorType] || 0) + 1;
    
    ${options.includeLogging ? `
    console.error(\`[\${this.service}] Error: \${errorType}\`, error);
    ` : ''}
  }

  getMetrics()${options.typescript ? ': WebhookMetrics' : ''} {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      avgProcessingTime: 0,
      eventTypes: {},
      errors: {}
    };
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics()${options.typescript ? ': string' : ''} {
    const lines${options.typescript ? ': string[]' : ''} = [
      \`# HELP webhook_\${this.service}_total Total number of webhook events\`,
      \`# TYPE webhook_\${this.service}_total counter\`,
      \`webhook_\${this.service}_total \${this.metrics.totalEvents}\`,
      '',
      \`# HELP webhook_\${this.service}_success_total Total number of successful webhook events\`,
      \`# TYPE webhook_\${this.service}_success_total counter\`,
      \`webhook_\${this.service}_success_total \${this.metrics.successfulEvents}\`,
      '',
      \`# HELP webhook_\${this.service}_failed_total Total number of failed webhook events\`,
      \`# TYPE webhook_\${this.service}_failed_total counter\`,
      \`webhook_\${this.service}_failed_total \${this.metrics.failedEvents}\`,
      '',
      \`# HELP webhook_\${this.service}_processing_duration_ms Average processing duration in milliseconds\`,
      \`# TYPE webhook_\${this.service}_processing_duration_ms gauge\`,
      \`webhook_\${this.service}_processing_duration_ms \${this.metrics.avgProcessingTime}\`,
    ];

    // Add event type metrics
    for (const [eventType, count] of Object.entries(this.metrics.eventTypes)) {
      lines.push('');
      lines.push(\`# HELP webhook_\${this.service}_event_type_total Total events by type\`);
      lines.push(\`# TYPE webhook_\${this.service}_event_type_total counter\`);
      lines.push(\`webhook_\${this.service}_event_type_total{type="\${eventType}"} \${count}\`);
    }

    // Add error metrics
    for (const [errorType, count] of Object.entries(this.metrics.errors)) {
      lines.push('');
      lines.push(\`# HELP webhook_\${this.service}_error_total Total errors by type\`);
      lines.push(\`# TYPE webhook_\${this.service}_error_total counter\`);
      lines.push(\`webhook_\${this.service}_error_total{type="\${errorType}"} \${count}\`);
    }

    return lines.join('\\n');
  }
}`;

    files.set('monitoring/webhook-monitor.ts', monitorContent);
  }

  // Generate rate limiter if enabled
  if (options.includeRateLimiting) {
    const rateLimiterContent = `
${options.typescript ? `
export interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: any) => string;
}
` : ''}

/**
 * Rate Limiter
 * Implements token bucket algorithm for rate limiting
 */
export class RateLimiter {
  private buckets${options.typescript ? ': Map<string, { tokens: number; lastRefill: number }>' : ''} = new Map();
  private windowMs = 60000; // 1 minute
  private maxRequests = 100;

  constructor(config${options.typescript ? '?: RateLimitConfig' : ''} = {}) {
    this.windowMs = config.windowMs || this.windowMs;
    this.maxRequests = config.maxRequests || this.maxRequests;
  }

  async checkLimit(key${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<boolean>' : ''} {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.maxRequests, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / this.windowMs) * this.maxRequests);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.maxRequests, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Check if request can be processed
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  getRemainingTokens(key${options.typescript ? ': string' : ''})${options.typescript ? ': number' : ''} {
    const bucket = this.buckets.get(key);
    return bucket ? bucket.tokens : this.maxRequests;
  }

  reset(key${options.typescript ? ': string' : ''}) {
    this.buckets.delete(key);
  }

  resetAll() {
    this.buckets.clear();
  }

  // Clean up old buckets periodically
  cleanup() {
    const now = Date.now();
    const expireTime = this.windowMs * 2;

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > expireTime) {
        this.buckets.delete(key);
      }
    }
  }
}`;

    files.set('utils/rate-limiter.ts', rateLimiterContent);
  }

  return {
    success: true,
    files,
    message: `Webhook handler for ${service} generated successfully`
  };
}
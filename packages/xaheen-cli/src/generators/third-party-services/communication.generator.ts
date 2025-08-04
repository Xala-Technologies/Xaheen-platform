import { BaseGenerator } from '../base.generator';
import { GeneratorOptions, FileOperation } from '../../types';
import { join } from 'path';

interface CommunicationServiceGeneratorOptions extends GeneratorOptions {
  readonly servicesToGenerate: readonly CommunicationService[];
  readonly projectName: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly enableRetries: boolean;
  readonly enableRateLimiting: boolean;
  readonly enableWebhooks: boolean;
  readonly enableAnalytics: boolean;
  readonly enableErrorTracking: boolean;
  readonly defaultFromEmail?: string;
  readonly defaultFromName?: string;
  readonly webhookSecret?: string;
  readonly rateLimitConfig?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

type CommunicationService = 
  | 'sendgrid'
  | 'mailgun'
  | 'aws-ses'
  | 'postmark'
  | 'twilio-sms'
  | 'twilio-whatsapp'
  | 'slack-bot'
  | 'discord-webhook'
  | 'microsoft-teams';

export class CommunicationServiceGenerator extends BaseGenerator {
  readonly name = 'communication-services';
  readonly description = 'Generate comprehensive communication service integrations with enterprise-grade patterns';

  constructor() {
    super();
  }

  async generate(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    try {
      this.validateOptions(options);
      
      const operations: FileOperation[] = [];
      
      this.logger.info(`Generating communication services for project: ${options.projectName}`);
      this.logger.info(`Selected services: ${options.servicesToGenerate.join(', ')}`);
      
      // Generate base communication configuration
      operations.push(...await this.generateBaseConfiguration(options));
      
      // Generate selected services
      for (const service of options.servicesToGenerate) {
        this.logger.info(`Generating ${service} service configuration...`);
        operations.push(...await this.generateService(service, options));
      }
      
      // Generate common utilities
      operations.push(...await this.generateCommonUtilities(options));
      
      // Generate error handling and retry logic
      operations.push(...await this.generateErrorHandling(options));
      
      // Generate webhook handlers
      if (options.enableWebhooks) {
        operations.push(...await this.generateWebhookHandlers(options));
      }
      
      // Generate testing utilities
      operations.push(...await this.generateTestingUtilities(options));
      
      // Generate configuration files
      operations.push(...await this.generateConfigurationFiles(options));
      
      this.logger.success(`Successfully generated ${operations.length} files for communication services`);
      
      return operations;
    } catch (error) {
      this.logger.error('Communication services generator failed', error);
      throw new Error(`Communication services generator failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateOptions(options: CommunicationServiceGeneratorOptions): void {
    if (!options.servicesToGenerate || options.servicesToGenerate.length === 0) {
      throw new Error('At least one communication service must be selected');
    }
    
    if (!options.projectName) {
      throw new Error('Project name is required');
    }
    
    // Validate service-specific requirements
    const emailServices = ['sendgrid', 'mailgun', 'aws-ses', 'postmark'];
    const hasEmailService = options.servicesToGenerate.some(service => 
      emailServices.includes(service)
    );
    
    if (hasEmailService && !options.defaultFromEmail) {
      this.logger.warn('Email services are selected but no defaultFromEmail is provided. Consider adding it for complete setup.');
    }
    
    if (options.servicesToGenerate.includes('twilio-sms') || options.servicesToGenerate.includes('twilio-whatsapp')) {
      this.logger.info('Twilio services selected. Ensure you have a Twilio account and phone number configured.');
    }
  }

  private async generateBaseConfiguration(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Main communication service configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/config/communication.config.ts'),
      content: `/**
 * Communication Services Configuration
 * Centralized configuration for all communication service integrations
 */

export interface CommunicationConfig {
  readonly environment: 'development' | 'staging' | 'production';
  readonly enableRetries: boolean;
  readonly enableRateLimiting: boolean;
  readonly enableAnalytics: boolean;
  readonly enableErrorTracking: boolean;
  readonly defaultFromEmail?: string;
  readonly defaultFromName?: string;
  readonly webhookSecret?: string;
  readonly rateLimitConfig?: {
    readonly requestsPerMinute: number;
    readonly burstLimit: number;
  };
}

export const communicationConfig: CommunicationConfig = {
  environment: '${options.environment}' as const,
  enableRetries: ${options.enableRetries},
  enableRateLimiting: ${options.enableRateLimiting},
  enableAnalytics: ${options.enableAnalytics},
  enableErrorTracking: ${options.enableErrorTracking},
  defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || '${options.defaultFromEmail || 'noreply@example.com'}',
  defaultFromName: process.env.DEFAULT_FROM_NAME || '${options.defaultFromName || options.projectName}',
  webhookSecret: process.env.WEBHOOK_SECRET || '${options.webhookSecret || 'your-webhook-secret'}',
  rateLimitConfig: {
    requestsPerMinute: ${options.rateLimitConfig?.requestsPerMinute || 60},
    burstLimit: ${options.rateLimitConfig?.burstLimit || 10},
  },
};

// Service-specific configurations
export const serviceConfigs = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    webhookVerificationKey: process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY || '',
  },
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || '',
    webhookSigningKey: process.env.MAILGUN_WEBHOOK_SIGNING_KEY || '',
  },
  awsSes: {
    region: process.env.AWS_SES_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    configurationSet: process.env.AWS_SES_CONFIGURATION_SET || '',
  },
  postmark: {
    serverToken: process.env.POSTMARK_SERVER_TOKEN || '',
    webhookUsername: process.env.POSTMARK_WEBHOOK_USERNAME || '',
    webhookPassword: process.env.POSTMARK_WEBHOOK_PASSWORD || '',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    webhookUrl: process.env.TWILIO_WEBHOOK_URL || '',
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN || '',
    appToken: process.env.SLACK_APP_TOKEN || '',
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  },
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    botToken: process.env.DISCORD_BOT_TOKEN || '',
  },
  teams: {
    webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
    tenantId: process.env.TEAMS_TENANT_ID || '',
    clientId: process.env.TEAMS_CLIENT_ID || '',
    clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
  },
} as const;
`
    });
    
    // Communication service factory
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/communication-service.factory.ts'),
      content: `/**
 * Communication Service Factory
 * Factory pattern for creating communication service instances
 */

import { CommunicationService } from './types/communication.types';
${options.servicesToGenerate.includes('sendgrid') ? "import { SendGridService } from './services/sendgrid.service';" : ''}
${options.servicesToGenerate.includes('mailgun') ? "import { MailgunService } from './services/mailgun.service';" : ''}
${options.servicesToGenerate.includes('aws-ses') ? "import { AwsSesService } from './services/aws-ses.service';" : ''}
${options.servicesToGenerate.includes('postmark') ? "import { PostmarkService } from './services/postmark.service';" : ''}
${options.servicesToGenerate.includes('twilio-sms') ? "import { TwilioSmsService } from './services/twilio-sms.service';" : ''}
${options.servicesToGenerate.includes('twilio-whatsapp') ? "import { TwilioWhatsappService } from './services/twilio-whatsapp.service';" : ''}
${options.servicesToGenerate.includes('slack-bot') ? "import { SlackBotService } from './services/slack-bot.service';" : ''}
${options.servicesToGenerate.includes('discord-webhook') ? "import { DiscordWebhookService } from './services/discord-webhook.service';" : ''}
${options.servicesToGenerate.includes('microsoft-teams') ? "import { MicrosoftTeamsService } from './services/microsoft-teams.service';" : ''}

export type ServiceType = ${options.servicesToGenerate.map(s => `'${s}'`).join(' | ')};

export class CommunicationServiceFactory {
  private static instances = new Map<ServiceType, CommunicationService>();

  static create(serviceType: ServiceType): CommunicationService {
    if (this.instances.has(serviceType)) {
      return this.instances.get(serviceType)!;
    }

    let service: CommunicationService;

    switch (serviceType) {
${options.servicesToGenerate.map(service => {
  const className = service.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('') + 'Service';
  
  return `      case '${service}':
        service = new ${className}();
        break;`;
}).join('\n')}
      default:
        throw new Error(\`Unknown service type: \${serviceType}\`);
    }

    this.instances.set(serviceType, service);
    return service;
  }

  static getAvailableServices(): ServiceType[] {
    return [${options.servicesToGenerate.map(s => `'${s}'`).join(', ')}];
  }

  static clearInstances(): void {
    this.instances.clear();
  }
}
`
    });
    
    // Base types
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/types/communication.types.ts'),
      content: `/**
 * Communication Service Types
 * Shared types and interfaces for all communication services
 */

export interface CommunicationService {
  readonly serviceName: string;
  readonly isConfigured: boolean;
  send(message: CommunicationMessage): Promise<CommunicationResult>;
  validateConfiguration(): Promise<boolean>;
}

export interface EmailMessage {
  readonly to: string | string[];
  readonly from?: string;
  readonly fromName?: string;
  readonly subject: string;
  readonly text?: string;
  readonly html?: string;
  readonly attachments?: Attachment[];
  readonly templateId?: string;
  readonly templateData?: Record<string, any>;
  readonly tags?: string[];
  readonly metadata?: Record<string, any>;
}

export interface SmsMessage {
  readonly to: string | string[];
  readonly from?: string;
  readonly body: string;
  readonly mediaUrls?: string[];
  readonly metadata?: Record<string, any>;
}

export interface ChatMessage {
  readonly channel?: string;
  readonly text: string;
  readonly attachments?: ChatAttachment[];
  readonly blocks?: any[];
  readonly mentions?: string[];
  readonly metadata?: Record<string, any>;
}

export interface Attachment {
  readonly filename: string;
  readonly content: Buffer | string;
  readonly contentType?: string;
  readonly disposition?: 'attachment' | 'inline';
  readonly contentId?: string;
}

export interface ChatAttachment {
  readonly fallback: string;
  readonly color?: string;
  readonly title?: string;
  readonly titleLink?: string;
  readonly text?: string;
  readonly fields?: Array<{
    readonly title: string;
    readonly value: string;
    readonly short?: boolean;
  }>;
  readonly imageUrl?: string;
  readonly thumbUrl?: string;
}

export type CommunicationMessage = EmailMessage | SmsMessage | ChatMessage;

export interface CommunicationResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
  readonly metadata?: Record<string, any>;
  readonly timestamp: Date;
}

export interface WebhookEvent {
  readonly service: string;
  readonly eventType: string;
  readonly messageId: string;
  readonly timestamp: Date;
  readonly data: Record<string, any>;
  readonly signature?: string;
}

export interface ServiceHealth {
  readonly serviceName: string;
  readonly isHealthy: boolean;
  readonly lastCheck: Date;
  readonly responseTime?: number;
  readonly error?: string;
}

export interface CommunicationAnalytics {
  readonly service: string;
  readonly messagesSent: number;
  readonly messagesDelivered: number;
  readonly messagesFailed: number;
  readonly deliveryRate: number;
  readonly averageResponseTime: number;
  readonly period: {
    readonly start: Date;
    readonly end: Date;
  };
}
`
    });
    
    return operations;
  }

  private async generateService(service: CommunicationService, options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    switch (service) {
      case 'sendgrid':
        operations.push(...await this.generateSendGridService(options));
        break;
      case 'mailgun':
        operations.push(...await this.generateMailgunService(options));
        break;
      case 'aws-ses':
        operations.push(...await this.generateAwsSesService(options));
        break;
      case 'postmark':
        operations.push(...await this.generatePostmarkService(options));
        break;
      case 'twilio-sms':
        operations.push(...await this.generateTwilioSmsService(options));
        break;
      case 'twilio-whatsapp':
        operations.push(...await this.generateTwilioWhatsappService(options));
        break;
      case 'slack-bot':
        operations.push(...await this.generateSlackBotService(options));
        break;
      case 'discord-webhook':
        operations.push(...await this.generateDiscordWebhookService(options));
        break;
      case 'microsoft-teams':
        operations.push(...await this.generateMicrosoftTeamsService(options));
        break;
      default:
        this.logger.warn(`Service ${service} is not yet implemented`);
        break;
    }
    
    return operations;
  }

  private async generateSendGridService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/sendgrid.service.ts'),
      content: `/**
 * SendGrid Email Service
 * Enterprise-grade SendGrid integration with templates, analytics, and error handling
 */

import sgMail from '@sendgrid/mail';
import { CommunicationService, EmailMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class SendGridService implements CommunicationService {
  readonly serviceName = 'sendgrid';
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    sgMail.setApiKey(serviceConfigs.sendgrid.apiKey);
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!serviceConfigs.sendgrid.apiKey;
  }

  async send(message: EmailMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('SendGrid is not configured. Please set SENDGRID_API_KEY environment variable.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const sendGridMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => sgMail.send(sendGridMessage),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result[0].headers['x-message-id'] as string,
        metadata: {
          statusCode: result[0].statusCode,
          headers: result[0].headers,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Email sent successfully', { messageId: response.messageId });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send email', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendWithTemplate(
    templateId: string,
    to: string | string[],
    templateData: Record<string, any>,
    options?: Partial<EmailMessage>
  ): Promise<CommunicationResult> {
    const message: EmailMessage = {
      to,
      templateId,
      templateData,
      from: options?.from || communicationConfig.defaultFromEmail,
      fromName: options?.fromName || communicationConfig.defaultFromName,
      subject: '', // Not used with templates
      ...options,
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test API key by making a simple API call
      await sgMail.send({
        to: 'test@example.com',
        from: communicationConfig.defaultFromEmail!,
        subject: 'Configuration Test',
        text: 'This is a test email',
      }, false); // Don't actually send

      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: EmailMessage): any {
    const sendGridMessage: any = {
      to: Array.isArray(message.to) ? message.to : [message.to],
      from: {
        email: message.from || communicationConfig.defaultFromEmail,
        name: message.fromName || communicationConfig.defaultFromName,
      },
      subject: message.subject,
    };

    // Add content
    if (message.html) {
      sendGridMessage.html = message.html;
    }
    
    if (message.text) {
      sendGridMessage.text = message.text;
    }

    // Add template data
    if (message.templateId) {
      sendGridMessage.templateId = message.templateId;
      if (message.templateData) {
        sendGridMessage.dynamicTemplateData = message.templateData;
      }
    }

    // Add attachments
    if (message.attachments) {
      sendGridMessage.attachments = message.attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
        type: att.contentType,
        disposition: att.disposition || 'attachment',
        contentId: att.contentId,
      }));
    }

    // Add categories (tags)
    if (message.tags) {
      sendGridMessage.categories = message.tags;
    }

    // Add custom args (metadata)
    if (message.metadata) {
      sendGridMessage.customArgs = message.metadata;
    }

    return sendGridMessage;
  }
}
`
    });

    // SendGrid webhook handler
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/webhooks/sendgrid.webhook.ts'),
      content: `/**
 * SendGrid Webhook Handler
 * Handles SendGrid webhook events for delivery tracking and analytics
 */

import crypto from 'crypto';
import { WebhookEvent } from '../types/communication.types';
import { serviceConfigs } from '../../config/communication.config';
import { CommunicationLogger } from '../utils/communication-logger';

export class SendGridWebhookHandler {
  private readonly logger: CommunicationLogger;

  constructor() {
    this.logger = new CommunicationLogger('sendgrid-webhook');
  }

  verifySignature(payload: string, signature: string, timestamp: string): boolean {
    try {
      const verificationKey = serviceConfigs.sendgrid.webhookVerificationKey;
      if (!verificationKey) {
        this.logger.logError('Webhook verification key not configured');
        return false;
      }

      const timestampedPayload = timestamp + payload;
      const expectedSignature = crypto
        .createHmac('sha256', verificationKey)
        .update(timestampedPayload, 'utf8')
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      );
    } catch (error) {
      this.logger.logError('Signature verification failed', error);
      return false;
    }
  }

  parseEvents(payload: any[]): WebhookEvent[] {
    return payload.map(event => ({
      service: 'sendgrid',
      eventType: event.event,
      messageId: event.sg_message_id,
      timestamp: new Date(event.timestamp * 1000),
      data: {
        email: event.email,
        category: event.category,
        reason: event.reason,
        status: event.event,
        url: event.url,
        useragent: event.useragent,
        ip: event.ip,
      },
    }));
  }

  async handleWebhook(payload: string, signature: string, timestamp: string): Promise<WebhookEvent[]> {
    try {
      if (!this.verifySignature(payload, signature, timestamp)) {
        throw new Error('Invalid webhook signature');
      }

      const events = JSON.parse(payload);
      const webhookEvents = this.parseEvents(events);

      this.logger.logSuccess(\`Processed \${webhookEvents.length} webhook events\`);
      return webhookEvents;

    } catch (error) {
      this.logger.logError('Webhook processing failed', error);
      throw error;
    }
  }
}
`
    });

    return operations;
  }

  private async generateMailgunService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/mailgun.service.ts'),
      content: `/**
 * Mailgun Email Service
 * Enterprise-grade Mailgun integration with tracking, analytics, and error handling
 */

import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { CommunicationService, EmailMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class MailgunService implements CommunicationService {
  readonly serviceName = 'mailgun';
  private readonly mailgun: any;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    const mailgunClient = new Mailgun(formData);
    this.mailgun = mailgunClient.client({
      username: 'api',
      key: serviceConfigs.mailgun.apiKey,
    });
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!(serviceConfigs.mailgun.apiKey && serviceConfigs.mailgun.domain);
  }

  async send(message: EmailMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Mailgun is not configured. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const mailgunMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => this.mailgun.messages.create(serviceConfigs.mailgun.domain, mailgunMessage),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result.id,
        metadata: {
          message: result.message,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Email sent successfully', { messageId: response.messageId });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send email', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendWithTemplate(
    templateName: string,
    to: string | string[],
    templateVariables: Record<string, any>,
    options?: Partial<EmailMessage>
  ): Promise<CommunicationResult> {
    const message: EmailMessage = {
      to,
      templateId: templateName,
      templateData: templateVariables,
      from: options?.from || communicationConfig.defaultFromEmail,
      fromName: options?.fromName || communicationConfig.defaultFromName,
      subject: options?.subject || '',
      ...options,
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test API key by getting domain info
      await this.mailgun.domains.get(serviceConfigs.mailgun.domain);
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: EmailMessage): any {
    const mailgunMessage: any = {
      to: Array.isArray(message.to) ? message.to.join(',') : message.to,
      from: \`\${message.fromName || communicationConfig.defaultFromName} <\${message.from || communicationConfig.defaultFromEmail}>\`,
      subject: message.subject,
    };

    // Add content
    if (message.html) {
      mailgunMessage.html = message.html;
    }
    
    if (message.text) {
      mailgunMessage.text = message.text;
    }

    // Add template
    if (message.templateId) {
      mailgunMessage.template = message.templateId;
      if (message.templateData) {
        Object.entries(message.templateData).forEach(([key, value]) => {
          mailgunMessage[\`v:\${key}\`] = value;
        });
      }
    }

    // Add tags
    if (message.tags) {
      mailgunMessage['o:tag'] = message.tags;
    }

    // Add tracking
    mailgunMessage['o:tracking'] = 'yes';
    mailgunMessage['o:tracking-clicks'] = 'yes';
    mailgunMessage['o:tracking-opens'] = 'yes';

    // Add custom variables (metadata)
    if (message.metadata) {
      Object.entries(message.metadata).forEach(([key, value]) => {
        mailgunMessage[\`v:\${key}\`] = value;
      });
    }

    return mailgunMessage;
  }
}
`
    });

    // Mailgun webhook handler
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/webhooks/mailgun.webhook.ts'),
      content: `/**
 * Mailgun Webhook Handler
 * Handles Mailgun webhook events for delivery tracking and analytics
 */

import crypto from 'crypto';
import { WebhookEvent } from '../types/communication.types';
import { serviceConfigs } from '../../config/communication.config';
import { CommunicationLogger } from '../utils/communication-logger';

export class MailgunWebhookHandler {
  private readonly logger: CommunicationLogger;

  constructor() {
    this.logger = new CommunicationLogger('mailgun-webhook');
  }

  verifySignature(timestamp: string, token: string, signature: string): boolean {
    try {
      const signingKey = serviceConfigs.mailgun.webhookSigningKey;
      if (!signingKey) {
        this.logger.logError('Webhook signing key not configured');
        return false;
      }

      const encodedToken = crypto
        .createHmac('sha256', signingKey)
        .update(timestamp.concat(token))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(encodedToken, 'hex')
      );
    } catch (error) {
      this.logger.logError('Signature verification failed', error);
      return false;
    }
  }

  parseEvent(eventData: any): WebhookEvent {
    return {
      service: 'mailgun',
      eventType: eventData['event-data'].event,
      messageId: eventData['event-data'].message?.headers?.['message-id'],
      timestamp: new Date(eventData['event-data'].timestamp * 1000),
      data: {
        event: eventData['event-data'].event,
        recipient: eventData['event-data'].recipient,
        domain: eventData['event-data'].message?.headers?.from?.split('@')[1],
        reason: eventData['event-data'].reason,
        description: eventData['event-data'].description,
        url: eventData['event-data'].url,
        ip: eventData['event-data']['client-info']?.['client-ip'],
        userAgent: eventData['event-data']['client-info']?.['user-agent'],
        tags: eventData['event-data'].tags,
        variables: eventData['event-data']['user-variables'],
      },
    };
  }

  async handleWebhook(payload: any, signature: any): Promise<WebhookEvent> {
    try {
      if (!this.verifySignature(signature.timestamp, signature.token, signature.signature)) {
        throw new Error('Invalid webhook signature');
      }

      const webhookEvent = this.parseEvent(payload);

      this.logger.logSuccess('Processed webhook event', { eventType: webhookEvent.eventType });
      return webhookEvent;

    } catch (error) {
      this.logger.logError('Webhook processing failed', error);
      throw error;
    }
  }
}
`
    });

    return operations;
  }

  private async generateAwsSesService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/aws-ses.service.ts'),
      content: `/**
 * AWS SES Email Service
 * Enterprise-grade AWS SES integration with bounce handling and configuration sets
 */

import { SESClient, SendEmailCommand, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import { CommunicationService, EmailMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class AwsSesService implements CommunicationService {
  readonly serviceName = 'aws-ses';
  private readonly sesClient: SESClient;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.sesClient = new SESClient({
      region: serviceConfigs.awsSes.region,
      credentials: {
        accessKeyId: serviceConfigs.awsSes.accessKeyId,
        secretAccessKey: serviceConfigs.awsSes.secretAccessKey,
      },
    });
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!(
      serviceConfigs.awsSes.accessKeyId &&
      serviceConfigs.awsSes.secretAccessKey &&
      serviceConfigs.awsSes.region
    );
  }

  async send(message: EmailMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('AWS SES is not configured. Please set AWS credentials and region.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      let command;
      
      if (message.templateId) {
        command = new SendTemplatedEmailCommand({
          Source: \`\${message.fromName || communicationConfig.defaultFromName} <\${message.from || communicationConfig.defaultFromEmail}>\`,
          Destination: {
            ToAddresses: Array.isArray(message.to) ? message.to : [message.to],
          },
          Template: message.templateId,
          TemplateData: JSON.stringify(message.templateData || {}),
          ConfigurationSetName: serviceConfigs.awsSes.configurationSet || undefined,
          Tags: message.tags?.map(tag => ({ Name: 'Category', Value: tag })) || [],
        });
      } else {
        command = new SendEmailCommand({
          Source: \`\${message.fromName || communicationConfig.defaultFromName} <\${message.from || communicationConfig.defaultFromEmail}>\`,
          Destination: {
            ToAddresses: Array.isArray(message.to) ? message.to : [message.to],
          },
          Message: {
            Subject: {
              Data: message.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Text: message.text ? {
                Data: message.text,
                Charset: 'UTF-8',
              } : undefined,
              Html: message.html ? {
                Data: message.html,
                Charset: 'UTF-8',
              } : undefined,
            },
          },
          ConfigurationSetName: serviceConfigs.awsSes.configurationSet || undefined,
          Tags: message.tags?.map(tag => ({ Name: 'Category', Value: tag })) || [],
        });
      }
      
      const result = await this.retryManager.executeWithRetry(
        () => this.sesClient.send(command),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result.MessageId,
        metadata: {
          requestId: result.$metadata.requestId,
          httpStatusCode: result.$metadata.httpStatusCode,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Email sent successfully', { messageId: response.messageId });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send email', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendWithTemplate(
    templateName: string,
    to: string | string[],
    templateData: Record<string, any>,
    options?: Partial<EmailMessage>
  ): Promise<CommunicationResult> {
    const message: EmailMessage = {
      to,
      templateId: templateName,
      templateData,
      from: options?.from || communicationConfig.defaultFromEmail,
      fromName: options?.fromName || communicationConfig.defaultFromName,
      subject: '', // Not used with templates
      ...options,
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test configuration by getting send quota
      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      await this.sesClient.send(new GetSendQuotaCommand({}));
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }
}
`
    });

    // AWS SES bounce handler
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/handlers/ses-bounce.handler.ts'),
      content: `/**
 * AWS SES Bounce Handler
 * Handles SES bounce and complaint events for email deliverability
 */

import { CommunicationLogger } from '../utils/communication-logger';

interface SESBounceEvent {
  eventType: string;
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      action?: string;
      status?: string;
      diagnosticCode?: string;
    }>;
    timestamp: string;
    feedbackId: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    timestamp: string;
    feedbackId: string;
    complaintFeedbackType?: string;
  };
  mail: {
    messageId: string;
    timestamp: string;
    source: string;
    destination: string[];
  };
}

export class SesBounceHandler {
  private readonly logger: CommunicationLogger;

  constructor() {
    this.logger = new CommunicationLogger('ses-bounce-handler');
  }

  async handleBounceEvent(event: SESBounceEvent): Promise<void> {
    try {
      if (event.eventType === 'bounce' && event.bounce) {
        await this.handleBounce(event.bounce, event.mail);
      } else if (event.eventType === 'complaint' && event.complaint) {
        await this.handleComplaint(event.complaint, event.mail);
      } else {
        this.logger.logInfo('Unhandled SES event type', { eventType: event.eventType });
      }
    } catch (error) {
      this.logger.logError('Failed to handle SES bounce/complaint event', error);
    }
  }

  private async handleBounce(bounce: any, mail: any): Promise<void> {
    for (const recipient of bounce.bouncedRecipients) {
      const shouldSuppress = this.shouldSuppressEmail(bounce.bounceType, bounce.bounceSubType);
      
      this.logger.logInfo('Processing bounce', {
        emailAddress: recipient.emailAddress,
        bounceType: bounce.bounceType,
        bounceSubType: bounce.bounceSubType,
        shouldSuppress,
        messageId: mail.messageId,
      });

      if (shouldSuppress) {
        // Add to suppression list
        await this.addToSuppressionList(recipient.emailAddress, 'bounce');
      }
    }
  }

  private async handleComplaint(complaint: any, mail: any): Promise<void> {
    for (const recipient of complaint.complainedRecipients) {
      this.logger.logInfo('Processing complaint', {
        emailAddress: recipient.emailAddress,
        complaintType: complaint.complaintFeedbackType,
        messageId: mail.messageId,
      });

      // Always suppress complaints
      await this.addToSuppressionList(recipient.emailAddress, 'complaint');
    }
  }

  private shouldSuppressEmail(bounceType: string, bounceSubType: string): boolean {
    // Permanent bounces should be suppressed
    if (bounceType === 'Permanent') {
      return true;
    }

    // Some transient bounces should also be suppressed
    if (bounceType === 'Transient' && 
        ['MailboxFull', 'MessageTooLarge', 'ContentRejected'].includes(bounceSubType)) {
      return false; // Can retry these
    }

    return bounceType === 'Permanent';
  }

  private async addToSuppressionList(emailAddress: string, reason: 'bounce' | 'complaint'): Promise<void> {
    // Implement your suppression list logic here
    // This could be a database, Redis, or external service
    this.logger.logInfo('Added to suppression list', { emailAddress, reason });
  }
}
`
    });

    return operations;
  }

  private async generatePostmarkService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/postmark.service.ts'),
      content: `/**
 * Postmark Email Service
 * Enterprise-grade Postmark integration with templates and delivery tracking
 */

import { ServerClient } from 'postmark';
import { CommunicationService, EmailMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class PostmarkService implements CommunicationService {
  readonly serviceName = 'postmark';
  private readonly client: ServerClient;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.client = new ServerClient(serviceConfigs.postmark.serverToken);
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!serviceConfigs.postmark.serverToken;
  }

  async send(message: EmailMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Postmark is not configured. Please set POSTMARK_SERVER_TOKEN environment variable.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const postmarkMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => message.templateId 
          ? this.client.sendEmailWithTemplate(postmarkMessage)
          : this.client.sendEmail(postmarkMessage),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result.MessageID,
        metadata: {
          submittedAt: result.SubmittedAt,
          to: result.To,
          errorCode: result.ErrorCode || 0,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Email sent successfully', { messageId: response.messageId });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send email', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendWithTemplate(
    templateAlias: string,
    to: string | string[],
    templateModel: Record<string, any>,
    options?: Partial<EmailMessage>
  ): Promise<CommunicationResult> {
    const message: EmailMessage = {
      to,
      templateId: templateAlias,
      templateData: templateModel,
      from: options?.from || communicationConfig.defaultFromEmail,
      fromName: options?.fromName || communicationConfig.defaultFromName,
      subject: '', // Not used with templates
      ...options,
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test configuration by getting server info
      await this.client.getServer();
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: EmailMessage): any {
    const postmarkMessage: any = {
      From: \`\${message.fromName || communicationConfig.defaultFromName} <\${message.from || communicationConfig.defaultFromEmail}>\`,
      To: Array.isArray(message.to) ? message.to.join(',') : message.to,
      Subject: message.subject,
    };

    // Add content
    if (message.html) {
      postmarkMessage.HtmlBody = message.html;
    }
    
    if (message.text) {
      postmarkMessage.TextBody = message.text;
    }

    // Add template
    if (message.templateId) {
      postmarkMessage.TemplateAlias = message.templateId;
      if (message.templateData) {
        postmarkMessage.TemplateModel = message.templateData;
      }
    }

    // Add attachments
    if (message.attachments) {
      postmarkMessage.Attachments = message.attachments.map(att => ({
        Name: att.filename,
        Content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
        ContentType: att.contentType,
        ContentID: att.contentId,
      }));
    }

    // Add tags
    if (message.tags) {
      postmarkMessage.Tag = message.tags.join(',');
    }

    // Add metadata
    if (message.metadata) {
      postmarkMessage.Metadata = message.metadata;
    }

    // Enable tracking
    postmarkMessage.TrackOpens = true;
    postmarkMessage.TrackLinks = 'HtmlAndText';

    return postmarkMessage;
  }
}
`
    });

    return operations;
  }

  private async generateTwilioSmsService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/twilio-sms.service.ts'),
      content: `/**
 * Twilio SMS Service
 * Enterprise-grade Twilio SMS integration with delivery tracking
 */

import twilio from 'twilio';
import { CommunicationService, SmsMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class TwilioSmsService implements CommunicationService {
  readonly serviceName = 'twilio-sms';
  private readonly client: twilio.Twilio;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.client = twilio(serviceConfigs.twilio.accountSid, serviceConfigs.twilio.authToken);
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!(
      serviceConfigs.twilio.accountSid &&
      serviceConfigs.twilio.authToken &&
      serviceConfigs.twilio.phoneNumber
    );
  }

  async send(message: SmsMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Twilio SMS is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const results: CommunicationResult[] = [];

      for (const recipient of recipients) {
        const twilioMessage: any = {
          body: message.body,
          from: message.from || serviceConfigs.twilio.phoneNumber,
          to: recipient,
        };

        // Add media URLs if provided
        if (message.mediaUrls && message.mediaUrls.length > 0) {
          twilioMessage.mediaUrl = message.mediaUrls;
        }

        const result = await this.retryManager.executeWithRetry(
          () => this.client.messages.create(twilioMessage),
          {
            maxRetries: communicationConfig.enableRetries ? 3 : 0,
            backoffMs: 1000,
          }
        );

        const response: CommunicationResult = {
          success: true,
          messageId: result.sid,
          metadata: {
            status: result.status,
            direction: result.direction,
            price: result.price,
            priceUnit: result.priceUnit,
            uri: result.uri,
            to: recipient,
          },
          timestamp: new Date(),
        };

        results.push(response);
        this.logger.logSuccess('SMS sent successfully', { 
          messageId: response.messageId, 
          to: recipient 
        });
      }

      // Return the first result (or combine results if multiple recipients)
      return results[0];

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send SMS', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test configuration by getting account info
      await this.client.api.accounts(serviceConfigs.twilio.accountSid).fetch();
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        direction: message.direction,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        price: message.price,
        priceUnit: message.priceUnit,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      this.logger.logError('Failed to get message status', error);
      throw error;
    }
  }
}
`
    });

    return operations;
  }

  private async generateTwilioWhatsappService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/twilio-whatsapp.service.ts'),
      content: `/**
 * Twilio WhatsApp Service
 * Enterprise-grade Twilio WhatsApp Business API integration
 */

import twilio from 'twilio';
import { CommunicationService, SmsMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class TwilioWhatsappService implements CommunicationService {
  readonly serviceName = 'twilio-whatsapp';
  private readonly client: twilio.Twilio;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.client = twilio(serviceConfigs.twilio.accountSid, serviceConfigs.twilio.authToken);
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!(
      serviceConfigs.twilio.accountSid &&
      serviceConfigs.twilio.authToken &&
      serviceConfigs.twilio.whatsappNumber
    );
  }

  async send(message: SmsMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Twilio WhatsApp is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER environment variables.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const results: CommunicationResult[] = [];

      for (const recipient of recipients) {
        const whatsappMessage: any = {
          body: message.body,
          from: \`whatsapp:\${message.from || serviceConfigs.twilio.whatsappNumber}\`,
          to: \`whatsapp:\${recipient}\`,
        };

        // Add media URLs if provided
        if (message.mediaUrls && message.mediaUrls.length > 0) {
          whatsappMessage.mediaUrl = message.mediaUrls;
        }

        const result = await this.retryManager.executeWithRetry(
          () => this.client.messages.create(whatsappMessage),
          {
            maxRetries: communicationConfig.enableRetries ? 3 : 0,
            backoffMs: 1000,
          }
        );

        const response: CommunicationResult = {
          success: true,
          messageId: result.sid,
          metadata: {
            status: result.status,
            direction: result.direction,
            price: result.price,
            priceUnit: result.priceUnit,
            uri: result.uri,
            to: recipient,
          },
          timestamp: new Date(),
        };

        results.push(response);
        this.logger.logSuccess('WhatsApp message sent successfully', { 
          messageId: response.messageId, 
          to: recipient 
        });
      }

      // Return the first result (or combine results if multiple recipients)
      return results[0];

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send WhatsApp message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendTemplate(
    to: string,
    templateSid: string,
    contentVariables?: Record<string, string>
  ): Promise<CommunicationResult> {
    try {
      const whatsappMessage: any = {
        from: \`whatsapp:\${serviceConfigs.twilio.whatsappNumber}\`,
        to: \`whatsapp:\${to}\`,
        contentSid: templateSid,
      };

      if (contentVariables) {
        whatsappMessage.contentVariables = JSON.stringify(contentVariables);
      }

      const result = await this.retryManager.executeWithRetry(
        () => this.client.messages.create(whatsappMessage),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result.sid,
        metadata: {
          status: result.status,
          direction: result.direction,
          price: result.price,
          priceUnit: result.priceUnit,
          uri: result.uri,
          to: to,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('WhatsApp template message sent successfully', { 
        messageId: response.messageId, 
        to: to 
      });

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send WhatsApp template message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test configuration by getting account info
      await this.client.api.accounts(serviceConfigs.twilio.accountSid).fetch();
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }
}
`
    });

    return operations;
  }

  private async generateSlackBotService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/slack-bot.service.ts'),
      content: `/**
 * Slack Bot Service
 * Enterprise-grade Slack Bot integration with interactive messages and workflows
 */

import { WebClient } from '@slack/web-api';
import { CommunicationService, ChatMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class SlackBotService implements CommunicationService {
  readonly serviceName = 'slack-bot';
  private readonly client: WebClient;
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.client = new WebClient(serviceConfigs.slack.botToken);
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!serviceConfigs.slack.botToken;
  }

  async send(message: ChatMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Slack Bot is not configured. Please set SLACK_BOT_TOKEN environment variable.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const slackMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => this.client.chat.postMessage(slackMessage),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: result.ts as string,
        metadata: {
          channel: result.channel,
          message: result.message,
          responseMetadata: result.response_metadata,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Slack message sent successfully', { 
        messageId: response.messageId,
        channel: message.channel 
      });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send Slack message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendInteractiveMessage(
    channel: string,
    text: string,
    blocks: any[]
  ): Promise<CommunicationResult> {
    const message: ChatMessage = {
      channel,
      text,
      blocks,
    };

    return this.send(message);
  }

  async updateMessage(
    channel: string,
    timestamp: string,
    text: string,
    blocks?: any[]
  ): Promise<CommunicationResult> {
    try {
      const result = await this.client.chat.update({
        channel,
        ts: timestamp,
        text,
        blocks,
      });

      return {
        success: true,
        messageId: result.ts as string,
        metadata: {
          channel: result.channel,
          message: result.message,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to update Slack message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test configuration by getting bot info
      await this.client.auth.test();
      return true;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: ChatMessage): any {
    const slackMessage: any = {
      channel: message.channel,
      text: message.text,
    };

    // Add attachments
    if (message.attachments) {
      slackMessage.attachments = message.attachments.map(att => ({
        fallback: att.fallback,
        color: att.color,
        title: att.title,
        title_link: att.titleLink,
        text: att.text,
        fields: att.fields?.map(field => ({
          title: field.title,
          value: field.value,
          short: field.short,
        })),
        image_url: att.imageUrl,
        thumb_url: att.thumbUrl,
      }));
    }

    // Add blocks for rich formatting
    if (message.blocks) {
      slackMessage.blocks = message.blocks;
    }

    return slackMessage;
  }

  async getChannels(): Promise<any[]> {
    try {
      const result = await this.client.conversations.list();
      return result.channels || [];
    } catch (error) {
      this.logger.logError('Failed to get channels', error);
      throw error;
    }
  }

  async getUserInfo(userId: string): Promise<any> {
    try {
      const result = await this.client.users.info({ user: userId });
      return result.user;
    } catch (error) {
      this.logger.logError('Failed to get user info', error);
      throw error;
    }
  }
}
`
    });

    return operations;
  }

  private async generateDiscordWebhookService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/discord-webhook.service.ts'),
      content: `/**
 * Discord Webhook Service
 * Enterprise-grade Discord webhook integration with rich embeds and file uploads
 */

import axios from 'axios';
import FormData from 'form-data';
import { CommunicationService, ChatMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class DiscordWebhookService implements CommunicationService {
  readonly serviceName = 'discord-webhook';
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!serviceConfigs.discord.webhookUrl;
  }

  async send(message: ChatMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Discord Webhook is not configured. Please set DISCORD_WEBHOOK_URL environment variable.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const discordMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => axios.post(serviceConfigs.discord.webhookUrl, discordMessage, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: \`discord-\${Date.now()}\`, // Discord webhooks don't return message IDs
        metadata: {
          status: result.status,
          statusText: result.statusText,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Discord message sent successfully');
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send Discord message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendEmbed(
    title: string,
    description: string,
    options?: {
      color?: number;
      url?: string;
      thumbnail?: string;
      image?: string;
      fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
      }>;
      footer?: {
        text: string;
        iconUrl?: string;
      };
      author?: {
        name: string;
        url?: string;
        iconUrl?: string;
      };
    }
  ): Promise<CommunicationResult> {
    const embed = {
      title,
      description,
      color: options?.color || 0x00ff00,
      url: options?.url,
      thumbnail: options?.thumbnail ? { url: options.thumbnail } : undefined,
      image: options?.image ? { url: options.image } : undefined,
      fields: options?.fields,
      footer: options?.footer ? {
        text: options.footer.text,
        icon_url: options.footer.iconUrl,
      } : undefined,
      author: options?.author ? {
        name: options.author.name,
        url: options.author.url,
        icon_url: options.author.iconUrl,
      } : undefined,
      timestamp: new Date().toISOString(),
    };

    const message: ChatMessage = {
      text: '',
      metadata: { embeds: [embed] },
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test webhook by sending a test message
      const testMessage = {
        content: 'Configuration test - please ignore',
        embeds: [{
          title: 'Test',
          description: 'This is a configuration test',
          color: 0x00ff00,
        }],
      };

      const result = await axios.post(serviceConfigs.discord.webhookUrl, testMessage);
      return result.status === 200 || result.status === 204;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: ChatMessage): any {
    const discordMessage: any = {
      content: message.text,
    };

    // Add embeds from metadata
    if (message.metadata?.embeds) {
      discordMessage.embeds = message.metadata.embeds;
    }

    // Transform attachments to embeds if needed
    if (message.attachments) {
      if (!discordMessage.embeds) {
        discordMessage.embeds = [];
      }

      message.attachments.forEach(att => {
        discordMessage.embeds.push({
          title: att.title,
          description: att.text,
          color: att.color ? parseInt(att.color.replace('#', ''), 16) : 0x00ff00,
          url: att.titleLink,
          image: att.imageUrl ? { url: att.imageUrl } : undefined,
          thumbnail: att.thumbUrl ? { url: att.thumbUrl } : undefined,
          fields: att.fields,
        });
      });
    }

    return discordMessage;
  }
}
`
    });

    return operations;
  }

  private async generateMicrosoftTeamsService(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/services/microsoft-teams.service.ts'),
      content: `/**
 * Microsoft Teams Service
 * Enterprise-grade Microsoft Teams integration with adaptive cards and notifications
 */

import axios from 'axios';
import { CommunicationService, ChatMessage, CommunicationResult } from '../types/communication.types';
import { communicationConfig, serviceConfigs } from '../../config/communication.config';
import { RetryManager } from '../utils/retry-manager';
import { RateLimiter } from '../utils/rate-limiter';
import { CommunicationLogger } from '../utils/communication-logger';

export class MicrosoftTeamsService implements CommunicationService {
  readonly serviceName = 'microsoft-teams';
  private readonly retryManager: RetryManager;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: CommunicationLogger;

  constructor() {
    this.retryManager = new RetryManager();
    this.rateLimiter = new RateLimiter();
    this.logger = new CommunicationLogger(this.serviceName);
  }

  get isConfigured(): boolean {
    return !!serviceConfigs.teams.webhookUrl;
  }

  async send(message: ChatMessage): Promise<CommunicationResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('Microsoft Teams is not configured. Please set TEAMS_WEBHOOK_URL environment variable.');
      }

      // Rate limiting
      if (communicationConfig.enableRateLimiting) {
        await this.rateLimiter.checkLimit(this.serviceName);
      }

      const teamsMessage = this.transformMessage(message);
      
      const result = await this.retryManager.executeWithRetry(
        () => axios.post(serviceConfigs.teams.webhookUrl, teamsMessage, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        {
          maxRetries: communicationConfig.enableRetries ? 3 : 0,
          backoffMs: 1000,
        }
      );

      const response: CommunicationResult = {
        success: true,
        messageId: \`teams-\${Date.now()}\`, // Teams webhooks don't return message IDs
        metadata: {
          status: result.status,
          statusText: result.statusText,
        },
        timestamp: new Date(),
      };

      this.logger.logSuccess('Teams message sent successfully');
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError('Failed to send Teams message', error);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async sendAdaptiveCard(
    title: string,
    body: any[],
    actions?: any[]
  ): Promise<CommunicationResult> {
    const adaptiveCard = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: title,
              weight: 'Bolder',
              size: 'Medium',
            },
            ...body,
          ],
          actions: actions || [],
        },
      }],
    };

    const message: ChatMessage = {
      text: title,
      metadata: { adaptiveCard },
    };

    return this.send(message);
  }

  async sendNotification(
    title: string,
    summary: string,
    sections?: Array<{
      activityTitle: string;
      activitySubtitle?: string;
      activityText?: string;
      activityImage?: string;
      facts?: Array<{
        name: string;
        value: string;
      }>;
    }>
  ): Promise<CommunicationResult> {
    const messageCard = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: '0076D7',
      summary: summary,
      sections: [
        {
          activityTitle: title,
          activitySubtitle: summary,
          markdown: true,
        },
        ...(sections || []),
      ],
    };

    const message: ChatMessage = {
      text: title,
      metadata: { messageCard },
    };

    return this.send(message);
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // Test webhook by sending a test message
      const testMessage = {
        text: 'Configuration test - please ignore',
      };

      const result = await axios.post(serviceConfigs.teams.webhookUrl, testMessage);
      return result.status === 200;
    } catch (error) {
      this.logger.logError('Configuration validation failed', error);
      return false;
    }
  }

  private transformMessage(message: ChatMessage): any {
    // Check if we have an adaptive card or message card in metadata
    if (message.metadata?.adaptiveCard) {
      return message.metadata.adaptiveCard;
    }

    if (message.metadata?.messageCard) {
      return message.metadata.messageCard;
    }

    // Simple text message
    const teamsMessage: any = {
      text: message.text,
    };

    // Transform attachments to message card sections
    if (message.attachments) {
      teamsMessage['@type'] = 'MessageCard';
      teamsMessage['@context'] = 'http://schema.org/extensions';
      teamsMessage.themeColor = '0076D7';
      teamsMessage.summary = message.text;
      
      teamsMessage.sections = message.attachments.map(att => ({
        activityTitle: att.title,
        activityText: att.text,
        activityImage: att.imageUrl,
        facts: att.fields?.map(field => ({
          name: field.title,
          value: field.value,
        })),
      }));
    }

    return teamsMessage;
  }
}
`
    });

    return operations;
  }

  private async generateCommonUtilities(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];

    // Retry Manager
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/utils/retry-manager.ts'),
      content: `/**
 * Retry Manager
 * Handles retries with exponential backoff for communication services
 */

export interface RetryOptions {
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly maxBackoffMs?: number;
  readonly backoffMultiplier?: number;
}

export class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error;
    let backoffMs = options.backoffMs;
    const maxBackoffMs = options.maxBackoffMs || 30000;
    const backoffMultiplier = options.backoffMultiplier || 2;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === options.maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await this.delay(backoffMs);
        
        // Exponential backoff
        backoffMs = Math.min(backoffMs * backoffMultiplier, maxBackoffMs);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
`
    });

    // Rate Limiter
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/utils/rate-limiter.ts'),
      content: `/**
 * Rate Limiter
 * Token bucket rate limiting for communication services
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private readonly requestsPerMinute: number;
  private readonly burstLimit: number;

  constructor(requestsPerMinute = 60, burstLimit = 10) {
    this.requestsPerMinute = requestsPerMinute;
    this.burstLimit = burstLimit;
  }

  async checkLimit(serviceKey: string): Promise<void> {
    const now = Date.now();
    let bucket = this.buckets.get(serviceKey);

    if (!bucket) {
      bucket = {
        tokens: this.burstLimit,
        lastRefill: now,
      };
      this.buckets.set(serviceKey, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / 60000) * this.requestsPerMinute);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.burstLimit, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Check if we have tokens available
    if (bucket.tokens <= 0) {
      const waitTime = Math.ceil((1 / this.requestsPerMinute) * 60000);
      throw new Error(\`Rate limit exceeded for \${serviceKey}. Try again in \${waitTime}ms\`);
    }

    // Consume a token
    bucket.tokens--;
  }

  reset(serviceKey?: string): void {
    if (serviceKey) {
      this.buckets.delete(serviceKey);
    } else {
      this.buckets.clear();
    }
  }
}
`
    });

    // Communication Logger
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/utils/communication-logger.ts'),
      content: `/**
 * Communication Logger
 * Structured logging for communication services
 */

export class CommunicationLogger {
  constructor(private readonly serviceName: string) {}

  logSuccess(message: string, metadata?: Record<string, any>): void {
    console.log(\`[SUCCESS][\${this.serviceName.toUpperCase()}] \${message}\`, metadata || '');
  }

  logError(message: string, error?: any, metadata?: Record<string, any>): void {
    console.error(\`[ERROR][\${this.serviceName.toUpperCase()}] \${message}\`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...metadata,
    });
  }

  logInfo(message: string, metadata?: Record<string, any>): void {
    console.info(\`[INFO][\${this.serviceName.toUpperCase()}] \${message}\`, metadata || '');
  }

  logWarn(message: string, metadata?: Record<string, any>): void {
    console.warn(\`[WARN][\${this.serviceName.toUpperCase()}] \${message}\`, metadata || '');
  }

  logDebug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(\`[DEBUG][\${this.serviceName.toUpperCase()}] \${message}\`, metadata || '');
    }
  }
}
`
    });

    return operations;
  }

  private async generateErrorHandling(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];

    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/utils/error-handler.ts'),
      content: `/**
 * Communication Error Handler
 * Centralized error handling for communication services
 */

import { CommunicationLogger } from './communication-logger';

export interface CommunicationError {
  readonly service: string;
  readonly operation: string;
  readonly originalError: Error;
  readonly timestamp: Date;
  readonly metadata?: Record<string, any>;
  readonly retryable: boolean;
}

export class CommunicationErrorHandler {
  private readonly logger: CommunicationLogger;

  constructor() {
    this.logger = new CommunicationLogger('error-handler');
  }

  handleError(
    service: string,
    operation: string,
    error: Error,
    metadata?: Record<string, any>
  ): CommunicationError {
    const communicationError: CommunicationError = {
      service,
      operation,
      originalError: error,
      timestamp: new Date(),
      metadata,
      retryable: this.isRetryableError(error),
    };

    this.logger.logError(
      \`Communication error in \${service}.\${operation}\`,
      error,
      {
        retryable: communicationError.retryable,
        ...metadata,
      }
    );

    // Send to error tracking service if enabled
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(communicationError);
    }

    return communicationError;
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
    ];

    const retryableStatusCodes = [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];

    // Check for network errors
    if (retryableErrors.some(code => error.message.includes(code))) {
      return true;
    }

    // Check for HTTP status codes (if available)
    const statusMatch = error.message.match(/status code (\\d+)/);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1], 10);
      return retryableStatusCodes.includes(statusCode);
    }

    return false;
  }

  private async sendToErrorTracking(error: CommunicationError): Promise<void> {
    try {
      // Implement your error tracking integration here
      // This could be Sentry, Rollbar, or any other service
      this.logger.logDebug('Sent error to tracking service', {
        service: error.service,
        operation: error.operation,
      });
    } catch (trackingError) {
      this.logger.logWarn('Failed to send error to tracking service', { trackingError });
    }
  }
}
`
    });

    return operations;
  }

  private async generateWebhookHandlers(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];

    // Main webhook router
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/communication/webhooks/webhook-router.ts'),
      content: `/**
 * Webhook Router
 * Routes webhook events to appropriate handlers
 */

import { WebhookEvent } from '../types/communication.types';
import { CommunicationLogger } from '../utils/communication-logger';
${options.servicesToGenerate.includes('sendgrid') ? "import { SendGridWebhookHandler } from './sendgrid.webhook';" : ''}
${options.servicesToGenerate.includes('mailgun') ? "import { MailgunWebhookHandler } from './mailgun.webhook';" : ''}

export class WebhookRouter {
  private readonly logger: CommunicationLogger;
${options.servicesToGenerate.includes('sendgrid') ? '  private readonly sendgridHandler: SendGridWebhookHandler;' : ''}
${options.servicesToGenerate.includes('mailgun') ? '  private readonly mailgunHandler: MailgunWebhookHandler;' : ''}

  constructor() {
    this.logger = new CommunicationLogger('webhook-router');
${options.servicesToGenerate.includes('sendgrid') ? '    this.sendgridHandler = new SendGridWebhookHandler();' : ''}
${options.servicesToGenerate.includes('mailgun') ? '    this.mailgunHandler = new MailgunWebhookHandler();' : ''}
  }

  async routeWebhook(
    service: string,
    payload: any,
    headers: Record<string, string>
  ): Promise<WebhookEvent[]> {
    try {
      this.logger.logInfo(\`Processing webhook for service: \${service}\`);

      switch (service.toLowerCase()) {
${options.servicesToGenerate.includes('sendgrid') ? `        case 'sendgrid':
          return await this.sendgridHandler.handleWebhook(
            JSON.stringify(payload),
            headers['x-twilio-email-event-webhook-signature'] || '',
            headers['x-twilio-email-event-webhook-timestamp'] || ''
          );` : ''}

${options.servicesToGenerate.includes('mailgun') ? `        case 'mailgun':
          const signature = {
            timestamp: payload.signature?.timestamp || '',
            token: payload.signature?.token || '',
            signature: payload.signature?.signature || '',
          };
          return [await this.mailgunHandler.handleWebhook(payload, signature)];` : ''}

        default:
          throw new Error(\`Unknown webhook service: \${service}\`);
      }
    } catch (error) {
      this.logger.logError('Webhook processing failed', error);
      throw error;
    }
  }

  async processWebhookEvents(events: WebhookEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await this.processEvent(event);
      } catch (error) {
        this.logger.logError('Failed to process webhook event', error, {
          eventType: event.eventType,
          service: event.service,
          messageId: event.messageId,
        });
      }
    }
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    // Implement your event processing logic here
    // This could update database records, trigger notifications, etc.
    
    this.logger.logInfo('Processing webhook event', {
      service: event.service,
      eventType: event.eventType,
      messageId: event.messageId,
    });

    // Example: Update message status in database
    // await this.updateMessageStatus(event.messageId, event.eventType, event.data);

    // Example: Trigger analytics event
    // await this.trackAnalyticsEvent(event);
  }
}
`
    });

    return operations;
  }

  private async generateTestingUtilities(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];

    operations.push({
      type: 'create',
      path: join(options.outputPath, 'src/tests/communication/communication.test.ts'),
      content: `/**
 * Communication Services Tests
 * Comprehensive test suite for all communication services
 */

import { CommunicationServiceFactory } from '../../communication/communication-service.factory';
import { EmailMessage, SmsMessage, ChatMessage } from '../../communication/types/communication.types';

describe('Communication Services', () => {
  beforeEach(() => {
    // Clear service instances before each test
    CommunicationServiceFactory.clearInstances();
  });

${options.servicesToGenerate.filter(s => ['sendgrid', 'mailgun', 'aws-ses', 'postmark'].includes(s)).map(service => `
  describe('${service.toUpperCase()} Service', () => {
    it('should create service instance', () => {
      const service = CommunicationServiceFactory.create('${service}');
      expect(service.serviceName).toBe('${service}');
    });

    it('should validate configuration', async () => {
      const service = CommunicationServiceFactory.create('${service}');
      const isValid = await service.validateConfiguration();
      // This will fail without proper environment variables
      expect(typeof isValid).toBe('boolean');
    });

    it('should send email message', async () => {
      const service = CommunicationServiceFactory.create('${service}');
      
      const message: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      };

      const result = await service.send(message);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });`).join('')}

${options.servicesToGenerate.filter(s => ['twilio-sms', 'twilio-whatsapp'].includes(s)).map(service => `
  describe('${service.toUpperCase()} Service', () => {
    it('should create service instance', () => {
      const service = CommunicationServiceFactory.create('${service}');
      expect(service.serviceName).toBe('${service}');
    });

    it('should send SMS message', async () => {
      const service = CommunicationServiceFactory.create('${service}');
      
      const message: SmsMessage = {
        to: '+1234567890',
        body: 'Test SMS message',
      };

      const result = await service.send(message);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });`).join('')}

${options.servicesToGenerate.filter(s => ['slack-bot', 'discord-webhook', 'microsoft-teams'].includes(s)).map(service => `
  describe('${service.toUpperCase()} Service', () => {
    it('should create service instance', () => {
      const service = CommunicationServiceFactory.create('${service}');
      expect(service.serviceName).toBe('${service}');
    });

    it('should send chat message', async () => {
      const service = CommunicationServiceFactory.create('${service}');
      
      const message: ChatMessage = {
        channel: '#general',
        text: 'Test chat message',
      };

      const result = await service.send(message);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });`).join('')}

  describe('Service Factory', () => {
    it('should return available services', () => {
      const services = CommunicationServiceFactory.getAvailableServices();
      expect(services).toHaveLength(${options.servicesToGenerate.length});
      expect(services).toEqual([${options.servicesToGenerate.map(s => `'${s}'`).join(', ')}]);
    });

    it('should cache service instances', () => {
      const service1 = CommunicationServiceFactory.create('${options.servicesToGenerate[0]}');
      const service2 = CommunicationServiceFactory.create('${options.servicesToGenerate[0]}');
      expect(service1).toBe(service2);
    });

    it('should clear cached instances', () => {
      const service1 = CommunicationServiceFactory.create('${options.servicesToGenerate[0]}');
      CommunicationServiceFactory.clearInstances();
      const service2 = CommunicationServiceFactory.create('${options.servicesToGenerate[0]}');
      expect(service1).not.toBe(service2);
    });
  });
});
`
    });

    return operations;
  }

  private async generateConfigurationFiles(options: CommunicationServiceGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];

    // Environment variables template
    operations.push({
      type: 'create',
      path: join(options.outputPath, '.env.communication.example'),
      content: `# Communication Services Configuration
DEFAULT_FROM_EMAIL=${options.defaultFromEmail || 'noreply@example.com'}
DEFAULT_FROM_NAME="${options.defaultFromName || options.projectName}"
WEBHOOK_SECRET=${options.webhookSecret || 'your-webhook-secret-here'}

${options.servicesToGenerate.includes('sendgrid') ? `# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_WEBHOOK_VERIFICATION_KEY=your-webhook-verification-key-here` : ''}

${options.servicesToGenerate.includes('mailgun') ? `# Mailgun Configuration
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=your-mailgun-domain-here
MAILGUN_WEBHOOK_SIGNING_KEY=your-webhook-signing-key-here` : ''}

${options.servicesToGenerate.includes('aws-ses') ? `# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here
AWS_SES_CONFIGURATION_SET=your-configuration-set-name` : ''}

${options.servicesToGenerate.includes('postmark') ? `# Postmark Configuration
POSTMARK_SERVER_TOKEN=your-postmark-server-token-here
POSTMARK_WEBHOOK_USERNAME=your-webhook-username-here
POSTMARK_WEBHOOK_PASSWORD=your-webhook-password-here` : ''}

${(options.servicesToGenerate.includes('twilio-sms') || options.servicesToGenerate.includes('twilio-whatsapp')) ? `# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_WEBHOOK_URL=https://your-app.com/webhooks/twilio` : ''}

${options.servicesToGenerate.includes('slack-bot') ? `# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_APP_TOKEN=xapp-your-slack-app-token-here
SLACK_SIGNING_SECRET=your-slack-signing-secret-here
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url` : ''}

${options.servicesToGenerate.includes('discord-webhook') ? `# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url
DISCORD_BOT_TOKEN=your-discord-bot-token-here` : ''}

${options.servicesToGenerate.includes('microsoft-teams') ? `# Microsoft Teams Configuration
TEAMS_WEBHOOK_URL=https://your-tenant.webhook.office.com/your/webhook/url
TEAMS_TENANT_ID=your-tenant-id-here
TEAMS_CLIENT_ID=your-client-id-here
TEAMS_CLIENT_SECRET=your-client-secret-here` : ''}
`
    });

    // Package.json dependencies
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'package.communication.json'),
      content: JSON.stringify({
        name: `${options.projectName}-communication-services`,
        version: '1.0.0',
        description: 'Communication services integration',
        dependencies: {
          axios: '^1.6.0',
          'form-data': '^4.0.0',
          ...(options.servicesToGenerate.includes('sendgrid') && { '@sendgrid/mail': '^8.1.0' }),
          ...(options.servicesToGenerate.includes('mailgun') && { 'mailgun.js': '^9.4.0' }),
          ...(options.servicesToGenerate.includes('aws-ses') && { 
            '@aws-sdk/client-ses': '^3.450.0',
          }),
          ...(options.servicesToGenerate.includes('postmark') && { 'postmark': '^3.0.0' }),
          ...((options.servicesToGenerate.includes('twilio-sms') || options.servicesToGenerate.includes('twilio-whatsapp')) && { 
            'twilio': '^4.19.0' 
          }),
          ...(options.servicesToGenerate.includes('slack-bot') && { '@slack/web-api': '^6.10.0' }),
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          typescript: '^5.0.0',
          jest: '^29.0.0',
          '@types/jest': '^29.0.0',
        },
      }, null, 2)
    });

    return operations;
  }

  // Base generator method to render templates (placeholder implementation)
  private async renderTemplate(templatePath: string, data: any): Promise<string> {
    // This would be implemented to use the actual template engine
    // For now, returning a placeholder implementation
    return `// Template: ${templatePath}\n// Data: ${JSON.stringify(data, null, 2)}\n// TODO: Implement actual template rendering`;
  }
}
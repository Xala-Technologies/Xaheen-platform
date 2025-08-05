import { GeneratedFile } from "../../types/generator.types";
import { BaseGenerator } from "../base.generator";

export interface MessageQueueOptions {
	projectName: string;
	framework: "nestjs" | "express" | "fastify" | "hono";
	provider:
		| "redis"
		| "rabbitmq"
		| "kafka"
		| "aws-sqs"
		| "gcp-pubsub"
		| "azure-servicebus";
	features: MessageQueueFeature[];
	clustering: boolean;
	persistence: boolean;
	dlq: boolean; // Dead Letter Queue
	monitoring: boolean;
	security: {
		authentication: boolean;
		encryption: boolean;
		ssl: boolean;
	};
	performance: {
		batchProcessing: boolean;
		priorityQueues: boolean;
		rateLimiting: boolean;
	};
}

export type MessageQueueFeature =
	| "job-processing"
	| "event-streaming"
	| "pub-sub"
	| "task-scheduling"
	| "file-processing"
	| "email-queue"
	| "notification-queue"
	| "analytics-events"
	| "audit-logging";

export class MessageQueueGenerator extends BaseGenerator {
	async generate(options: MessageQueueOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Core message queue infrastructure
		files.push(...this.generateProviderImplementation(options));
		files.push(this.generateMessageQueueModule(options));
		files.push(this.generateMessageQueueService(options));

		// Feature-specific implementations
		for (const feature of options.features) {
			files.push(...this.generateFeatureImplementation(feature, options));
		}

		// Dead Letter Queue implementation
		if (options.dlq) {
			files.push(...this.generateDLQImplementation(options));
		}

		// Monitoring and metrics
		if (options.monitoring) {
			files.push(...this.generateMonitoringImplementation(options));
		}

		// Configuration and types
		files.push(this.generateTypes(options));
		files.push(this.generateConfiguration(options));

		// Testing utilities
		files.push(...this.generateTestFiles(options));

		// Client utilities and patterns
		files.push(...this.generateClientUtils(options));

		return files;
	}

	private generateProviderImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		switch (options.provider) {
			case "redis":
				files.push(...this.generateRedisImplementation(options));
				break;
			case "rabbitmq":
				files.push(...this.generateRabbitMQImplementation(options));
				break;
			case "kafka":
				files.push(...this.generateKafkaImplementation(options));
				break;
			case "aws-sqs":
				files.push(...this.generateAWSSQSImplementation(options));
				break;
			case "gcp-pubsub":
				files.push(...this.generateGCPPubSubImplementation(options));
				break;
			case "azure-servicebus":
				files.push(...this.generateAzureServiceBusImplementation(options));
				break;
		}

		return files;
	}

	private generateRedisImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Redis Queue Service
		files.push({
			path: `src/messaging/redis/${options.projectName}-redis-queue.service.ts`,
			content: this.getRedisQueueServiceTemplate(options),
			type: "service",
		});

		// Redis Pub/Sub Service
		files.push({
			path: `src/messaging/redis/${options.projectName}-redis-pubsub.service.ts`,
			content: this.getRedisPubSubServiceTemplate(options),
			type: "service",
		});

		// Redis Queue Processor
		files.push({
			path: `src/messaging/redis/${options.projectName}-redis-processor.service.ts`,
			content: this.getRedisProcessorServiceTemplate(options),
			type: "service",
		});

		// Redis Configuration
		files.push({
			path: `src/messaging/redis/redis.config.ts`,
			content: this.getRedisConfigTemplate(options),
			type: "config",
		});

		return files;
	}

	private generateRabbitMQImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// RabbitMQ Service
		files.push({
			path: `src/messaging/rabbitmq/${options.projectName}-rabbitmq.service.ts`,
			content: this.getRabbitMQServiceTemplate(options),
			type: "service",
		});

		// RabbitMQ Producer
		files.push({
			path: `src/messaging/rabbitmq/${options.projectName}-rabbitmq-producer.service.ts`,
			content: this.getRabbitMQProducerTemplate(options),
			type: "service",
		});

		// RabbitMQ Consumer
		files.push({
			path: `src/messaging/rabbitmq/${options.projectName}-rabbitmq-consumer.service.ts`,
			content: this.getRabbitMQConsumerTemplate(options),
			type: "service",
		});

		// Exchange and Queue Setup
		files.push({
			path: `src/messaging/rabbitmq/rabbitmq-setup.service.ts`,
			content: this.getRabbitMQSetupTemplate(options),
			type: "service",
		});

		return files;
	}

	private generateKafkaImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Kafka Service
		files.push({
			path: `src/messaging/kafka/${options.projectName}-kafka.service.ts`,
			content: this.getKafkaServiceTemplate(options),
			type: "service",
		});

		// Kafka Producer
		files.push({
			path: `src/messaging/kafka/${options.projectName}-kafka-producer.service.ts`,
			content: this.getKafkaProducerTemplate(options),
			type: "service",
		});

		// Kafka Consumer
		files.push({
			path: `src/messaging/kafka/${options.projectName}-kafka-consumer.service.ts`,
			content: this.getKafkaConsumerTemplate(options),
			type: "service",
		});

		// Kafka Admin
		files.push({
			path: `src/messaging/kafka/kafka-admin.service.ts`,
			content: this.getKafkaAdminTemplate(options),
			type: "service",
		});

		return files;
	}

	private generateAWSSQSImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// AWS SQS Service
		files.push({
			path: `src/messaging/aws-sqs/${options.projectName}-sqs.service.ts`,
			content: this.getAWSSQSServiceTemplate(options),
			type: "service",
		});

		// SQS Queue Manager
		files.push({
			path: `src/messaging/aws-sqs/sqs-queue-manager.service.ts`,
			content: this.getSQSQueueManagerTemplate(options),
			type: "service",
		});

		return files;
	}

	private generateGCPPubSubImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// GCP Pub/Sub Service
		files.push({
			path: `src/messaging/gcp-pubsub/${options.projectName}-pubsub.service.ts`,
			content: this.getGCPPubSubServiceTemplate(options),
			type: "service",
		});

		return files;
	}

	private generateAzureServiceBusImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Azure Service Bus Service
		files.push({
			path: `src/messaging/azure-servicebus/${options.projectName}-servicebus.service.ts`,
			content: this.getAzureServiceBusServiceTemplate(options),
			type: "service",
		});

		return files;
	}

	private generateMessageQueueModule(
		options: MessageQueueOptions,
	): GeneratedFile {
		const content = `/**
 * Message Queue Module
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService } from './${options.projectName}-message-queue.service';

// Provider-specific imports
${this.getProviderImports(options)}

// Feature services
${options.features
	.map((feature) => {
		const serviceName = this.getFeatureServiceName(feature);
		return `import { ${serviceName} } from './features/${feature.replace(/-/g, "-")}.service';`;
	})
	.join("\n")}

@Module({
  imports: [
    ${this.getProviderModuleImports(options)}
  ],
  providers: [
    ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService,
    ${this.getProviderServices(options)},
    ${options.features.map((feature) => this.getFeatureServiceName(feature)).join(",\n    ")}
  ],
  exports: [
    ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService,
    ${this.getProviderServices(options)},
    ${options.features.map((feature) => this.getFeatureServiceName(feature)).join(",\n    ")}
  ]
})
export class ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueModule {}`;

		return {
			path: `src/messaging/${options.projectName}-message-queue.module.ts`,
			content,
			type: "module",
		};
	}

	private generateMessageQueueService(
		options: MessageQueueOptions,
	): GeneratedFile {
		const content = `/**
 * Message Queue Service
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import { 
  QueueMessage, 
  QueueOptions, 
  QueueStats, 
  MessageProcessingResult,
  DeadLetterMessage 
} from './types/message-queue.types';

@Injectable()
export class ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService {
  private readonly logger = new Logger(${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService.name);
  private queues = new Map<string, any>();
  private processors = new Map<string, Function>();
  private stats = new Map<string, QueueStats>();

  constructor(
    ${this.getProviderConstructorInjections(options)}
  ) {
    this.initializeQueues();
  }

  private async initializeQueues(): Promise<void> {
    try {
      // Initialize provider-specific queues
      await this.setupProviderQueues();
      
      // Setup monitoring if enabled
      ${options.monitoring ? "await this.setupMonitoring();" : ""}
      
      this.logger.log('Message queues initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize message queues', error);
      throw error;
    }
  }

  public async sendMessage<T = any>(
    queueName: string, 
    message: T, 
    options?: QueueOptions
  ): Promise<string> {
    try {
      const messageId = this.generateMessageId();
      const queueMessage: QueueMessage<T> = {
        id: messageId,
        payload: message,
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: options?.maxAttempts || 3,
        delay: options?.delay || 0,
        priority: options?.priority || 0,
        metadata: options?.metadata || {}
      };

      await this.publishToQueue(queueName, queueMessage);
      
      this.updateStats(queueName, 'sent');
      this.logger.debug(\`Message sent to queue \${queueName}: \${messageId}\`);
      
      return messageId;
    } catch (error) {
      this.logger.error(\`Failed to send message to queue \${queueName}\`, error);
      throw error;
    }
  }

  public async processMessages<T = any>(
    queueName: string,
    processor: (message: QueueMessage<T>) => Promise<MessageProcessingResult>
  ): Promise<void> {
    try {
      this.processors.set(queueName, processor);
      await this.startQueueProcessor(queueName, processor);
      
      this.logger.log(\`Started processing messages for queue: \${queueName}\`);
    } catch (error) {
      this.logger.error(\`Failed to start processing queue \${queueName}\`, error);
      throw error;
    }
  }

  public async scheduleMessage<T = any>(
    queueName: string,
    message: T,
    scheduleTime: Date,
    options?: QueueOptions
  ): Promise<string> {
    const delay = scheduleTime.getTime() - Date.now();
    
    if (delay <= 0) {
      return this.sendMessage(queueName, message, options);
    }

    return this.sendMessage(queueName, message, {
      ...options,
      delay
    });
  }

  public async getQueueStats(queueName: string): Promise<QueueStats> {
    return this.stats.get(queueName) || {
      name: queueName,
      messagesSent: 0,
      messagesProcessed: 0,
      messagesRetried: 0,
      messagesFailed: 0,
      averageProcessingTime: 0,
      queueLength: 0
    };
  }

  public async purgeQueue(queueName: string): Promise<number> {
    try {
      const purgedCount = await this.purgeProviderQueue(queueName);
      this.logger.warn(\`Purged \${purgedCount} messages from queue: \${queueName}\`);
      return purgedCount;
    } catch (error) {
      this.logger.error(\`Failed to purge queue \${queueName}\`, error);
      throw error;
    }
  }

  public async pauseQueue(queueName: string): Promise<void> {
    try {
      await this.pauseProviderQueue(queueName);
      this.logger.log(\`Paused queue: \${queueName}\`);
    } catch (error) {
      this.logger.error(\`Failed to pause queue \${queueName}\`, error);
      throw error;
    }
  }

  public async resumeQueue(queueName: string): Promise<void> {
    try {
      await this.resumeProviderQueue(queueName);
      this.logger.log(\`Resumed queue: \${queueName}\`);
    } catch (error) {
      this.logger.error(\`Failed to resume queue \${queueName}\`, error);
      throw error;
    }
  }

  ${options.dlq ? this.getDLQMethods() : ""}

  // Provider-specific implementations
  private async setupProviderQueues(): Promise<void> {
    ${this.getProviderSetupCode(options)}
  }

  private async publishToQueue<T>(queueName: string, message: QueueMessage<T>): Promise<void> {
    ${this.getProviderPublishCode(options)}
  }

  private async startQueueProcessor<T>(
    queueName: string,
    processor: (message: QueueMessage<T>) => Promise<MessageProcessingResult>
  ): Promise<void> {
    ${this.getProviderProcessorCode(options)}
  }

  private async purgeProviderQueue(queueName: string): Promise<number> {
    ${this.getProviderPurgeCode(options)}
  }

  private async pauseProviderQueue(queueName: string): Promise<void> {
    ${this.getProviderPauseCode(options)}
  }

  private async resumeProviderQueue(queueName: string): Promise<void> {
    ${this.getProviderResumeCode(options)}
  }

  private async handleMessageFailure<T>(
    queueName: string,
    message: QueueMessage<T>,
    error: Error
  ): Promise<void> {
    message.attempts++;
    message.lastError = error.message;
    message.failedAt = Date.now();

    if (message.attempts >= message.maxAttempts) {
      ${options.dlq ? "await this.sendToDeadLetterQueue(queueName, message, error);" : ""}
      this.updateStats(queueName, 'failed');
      this.logger.error(\`Message \${message.id} failed permanently after \${message.attempts} attempts\`);
    } else {
      // Retry with exponential backoff
      const retryDelay = Math.pow(2, message.attempts) * 1000;
      await this.scheduleRetry(queueName, message, retryDelay);
      this.updateStats(queueName, 'retried');
      this.logger.warn(\`Message \${message.id} failed, retrying in \${retryDelay}ms (attempt \${message.attempts}/\${message.maxAttempts})\`);
    }
  }

  private async scheduleRetry<T>(
    queueName: string,
    message: QueueMessage<T>,
    delay: number
  ): Promise<void> {
    message.delay = delay;
    await this.publishToQueue(queueName, message);
  }

  private updateStats(queueName: string, operation: 'sent' | 'processed' | 'retried' | 'failed'): void {
    if (!this.stats.has(queueName)) {
      this.stats.set(queueName, {
        name: queueName,
        messagesSent: 0,
        messagesProcessed: 0,
        messagesRetried: 0,
        messagesFailed: 0,
        averageProcessingTime: 0,
        queueLength: 0
      });
    }

    const stats = this.stats.get(queueName)!;
    
    switch (operation) {
      case 'sent':
        stats.messagesSent++;
        break;
      case 'processed':
        stats.messagesProcessed++;
        break;
      case 'retried':
        stats.messagesRetried++;
        break;
      case 'failed':
        stats.messagesFailed++;
        break;
    }
  }

  private generateMessageId(): string {
    return \`msg_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  ${options.monitoring ? this.getMonitoringMethods() : ""}
}`;

		return {
			path: `src/messaging/${options.projectName}-message-queue.service.ts`,
			content,
			type: "service",
		};
	}

	private generateFeatureImplementation(
		feature: MessageQueueFeature,
		options: MessageQueueOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		switch (feature) {
			case "job-processing":
				files.push(this.generateJobProcessingFeature(options));
				break;
			case "event-streaming":
				files.push(this.generateEventStreamingFeature(options));
				break;
			case "pub-sub":
				files.push(this.generatePubSubFeature(options));
				break;
			case "task-scheduling":
				files.push(this.generateTaskSchedulingFeature(options));
				break;
			case "file-processing":
				files.push(this.generateFileProcessingFeature(options));
				break;
			case "email-queue":
				files.push(this.generateEmailQueueFeature(options));
				break;
			case "notification-queue":
				files.push(this.generateNotificationQueueFeature(options));
				break;
			case "analytics-events":
				files.push(this.generateAnalyticsEventsFeature(options));
				break;
			case "audit-logging":
				files.push(this.generateAuditLoggingFeature(options));
				break;
		}

		return files;
	}

	private generateJobProcessingFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		const content = `/**
 * Job Processing Feature
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService } from '../${options.projectName}-message-queue.service';
import { QueueMessage, MessageProcessingResult } from '../types/message-queue.types';

export interface JobDefinition {
  id: string;
  type: string;
  payload: any;
  priority?: number;
  maxAttempts?: number;
  timeout?: number;
  cron?: string;
  metadata?: Record<string, any>;
}

export interface JobResult {
  jobId: string;
  status: 'completed' | 'failed' | 'retrying';
  result?: any;
  error?: string;
  processingTime: number;
  completedAt: number;
}

@Injectable()
export class JobProcessingService {
  private readonly logger = new Logger(JobProcessingService.name);
  private jobHandlers = new Map<string, (job: JobDefinition) => Promise<any>>();
  private activeJobs = new Map<string, Date>();

  constructor(
    private readonly messageQueue: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService
  ) {
    this.initializeJobProcessing();
  }

  private async initializeJobProcessing(): Promise<void> {
    // Start processing jobs
    await this.messageQueue.processMessages('jobs', this.processJob.bind(this));
    
    // Start processing scheduled jobs
    await this.messageQueue.processMessages('scheduled-jobs', this.processScheduledJob.bind(this));
    
    this.logger.log('Job processing service initialized');
  }

  public registerJobHandler(
    jobType: string, 
    handler: (job: JobDefinition) => Promise<any>
  ): void {
    this.jobHandlers.set(jobType, handler);
    this.logger.log(\`Registered job handler for type: \${jobType}\`);
  }

  public async submitJob(job: JobDefinition): Promise<string> {
    const jobId = job.id || this.generateJobId();
    const jobWithId: JobDefinition = { ...job, id: jobId };
    
    const messageId = await this.messageQueue.sendMessage('jobs', jobWithId, {
      priority: job.priority || 0,
      maxAttempts: job.maxAttempts || 3,
      metadata: {
        jobType: job.type,
        submittedAt: Date.now(),
        ...job.metadata
      }
    });

    this.logger.debug(\`Job submitted: \${jobId} (message: \${messageId})\`);
    return jobId;
  }

  public async scheduleJob(job: JobDefinition, scheduleTime: Date): Promise<string> {
    const jobId = job.id || this.generateJobId();
    const jobWithId: JobDefinition = { ...job, id: jobId };
    
    const messageId = await this.messageQueue.scheduleMessage(
      'scheduled-jobs', 
      jobWithId, 
      scheduleTime,
      {
        priority: job.priority || 0,
        maxAttempts: job.maxAttempts || 3,
        metadata: {
          jobType: job.type,
          scheduledFor: scheduleTime.toISOString(),
          submittedAt: Date.now(),
          ...job.metadata
        }
      }
    );

    this.logger.debug(\`Job scheduled: \${jobId} for \${scheduleTime.toISOString()}\`);
    return jobId;
  }

  public async submitBulkJobs(jobs: JobDefinition[]): Promise<string[]> {
    const jobIds: string[] = [];
    
    for (const job of jobs) {
      const jobId = await this.submitJob(job);
      jobIds.push(jobId);
    }
    
    this.logger.debug(\`Bulk jobs submitted: \${jobIds.length} jobs\`);
    return jobIds;
  }

  private async processJob(message: QueueMessage<JobDefinition>): Promise<MessageProcessingResult> {
    const job = message.payload;
    const startTime = Date.now();
    
    try {
      this.activeJobs.set(job.id, new Date());
      
      const handler = this.jobHandlers.get(job.type);
      if (!handler) {
        throw new Error(\`No handler registered for job type: \${job.type}\`);
      }

      // Apply timeout if specified
      const result = job.timeout 
        ? await this.withTimeout(handler(job), job.timeout)
        : await handler(job);

      const processingTime = Date.now() - startTime;
      this.activeJobs.delete(job.id);

      const jobResult: JobResult = {
        jobId: job.id,
        status: 'completed',
        result,
        processingTime,
        completedAt: Date.now()
      };

      // Optionally store result
      await this.storeJobResult(jobResult);

      this.logger.debug(\`Job completed: \${job.id} in \${processingTime}ms\`);
      
      return { success: true, result: jobResult };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.activeJobs.delete(job.id);

      const jobResult: JobResult = {
        jobId: job.id,
        status: message.attempts < message.maxAttempts ? 'retrying' : 'failed',
        error: error.message,
        processingTime,
        completedAt: Date.now()
      };

      await this.storeJobResult(jobResult);

      this.logger.error(\`Job failed: \${job.id} - \${error.message}\`);
      
      return { success: false, error: error.message };
    }
  }

  private async processScheduledJob(message: QueueMessage<JobDefinition>): Promise<MessageProcessingResult> {
    // Move scheduled job to regular job queue for processing
    const job = message.payload;
    await this.submitJob(job);
    
    return { success: true };
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(\`Job timeout after \${timeoutMs}ms\`)), timeoutMs)
      )
    ]);
  }

  private async storeJobResult(result: JobResult): Promise<void> {
    // Store job result for later retrieval
    // This could be in a database, cache, or another queue
    // For now, we'll just log it
    this.logger.debug(\`Job result stored: \${JSON.stringify(result)}\`);
  }

  public getActiveJobs(): Array<{ jobId: string; startedAt: Date }> {
    return Array.from(this.activeJobs.entries()).map(([jobId, startedAt]) => ({
      jobId,
      startedAt
    }));
  }

  public async getJobStats(): Promise<{
    activeJobs: number;
    totalJobsProcessed: number;
    averageProcessingTime: number;
  }> {
    const queueStats = await this.messageQueue.getQueueStats('jobs');
    
    return {
      activeJobs: this.activeJobs.size,
      totalJobsProcessed: queueStats.messagesProcessed,
      averageProcessingTime: queueStats.averageProcessingTime
    };
  }

  private generateJobId(): string {
    return \`job_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

// Decorators for easy job registration
export function JobHandler(jobType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // This would be implemented with reflection metadata
    // to automatically register job handlers
  };
}

// Job scheduling utilities
export class JobScheduler {
  constructor(private jobProcessingService: JobProcessingService) {}

  public async scheduleRecurringJob(
    job: Omit<JobDefinition, 'id'>,
    cronExpression: string
  ): Promise<string> {
    // Implementation would use a cron parser and schedule multiple jobs
    // or integrate with a job scheduler like node-cron
    const jobWithCron: JobDefinition = {
      ...job,
      id: this.generateJobId(),
      cron: cronExpression
    };

    // Schedule the first occurrence
    const nextRun = this.getNextCronDate(cronExpression);
    return this.jobProcessingService.scheduleJob(jobWithCron, nextRun);
  }

  private getNextCronDate(cronExpression: string): Date {
    // This would use a cron parser library like node-cron or cron-parser
    // For now, return a simple future date
    return new Date(Date.now() + 60000); // 1 minute from now
  }

  private generateJobId(): string {
    return \`job_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}
`;

		return {
			path: `src/messaging/features/job-processing.service.ts`,
			content,
			type: "service",
		};
	}

	private generateEventStreamingFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		const content = `/**
 * Event Streaming Feature
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService } from '../${options.projectName}-message-queue.service';
import { QueueMessage, MessageProcessingResult } from '../types/message-queue.types';

export interface StreamEvent {
  id: string;
  type: string;
  source: string;
  specversion: string;
  time: string;
  subject?: string;
  data: any;
  datacontenttype?: string;
  metadata?: Record<string, any>;
}

export interface EventFilter {
  types?: string[];
  sources?: string[];
  subjects?: string[];
}

export interface EventSubscription {
  id: string;
  filter: EventFilter;
  callback: (event: StreamEvent) => Promise<void>;
  isActive: boolean;
  subscribedAt: Date;
}

@Injectable()
export class EventStreamingService {
  private readonly logger = new Logger(EventStreamingService.name);
  private subscriptions = new Map<string, EventSubscription>();
  private eventHistory = new Map<string, StreamEvent[]>();

  constructor(
    private readonly messageQueue: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}MessageQueueService
  ) {
    this.initializeEventStreaming();
  }

  private async initializeEventStreaming(): Promise<void> {
    // Start processing events
    await this.messageQueue.processMessages('events', this.processEvent.bind(this));
    
    this.logger.log('Event streaming service initialized');
  }

  public async publishEvent(event: Omit<StreamEvent, 'id' | 'time'>): Promise<string> {
    const eventId = this.generateEventId();
    const fullEvent: StreamEvent = {
      ...event,
      id: eventId,
      time: new Date().toISOString(),
      specversion: '1.0'
    };

    const messageId = await this.messageQueue.sendMessage('events', fullEvent, {
      metadata: {
        eventType: event.type,
        eventSource: event.source,
        publishedAt: Date.now()
      }
    });

    // Store in history for replay functionality
    this.storeEventInHistory(fullEvent);

    this.logger.debug(\`Event published: \${eventId} (message: \${messageId})\`);
    return eventId;
  }

  public async publishBatch(events: Array<Omit<StreamEvent, 'id' | 'time'>>): Promise<string[]> {
    const eventIds: string[] = [];
    
    for (const event of events) {
      const eventId = await this.publishEvent(event);
      eventIds.push(eventId);
    }
    
    this.logger.debug(\`Batch events published: \${eventIds.length} events\`);
    return eventIds;
  }

  public async subscribe(
    filter: EventFilter,
    callback: (event: StreamEvent) => Promise<void>
  ): Promise<string> {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      filter,
      callback,
      isActive: true,
      subscribedAt: new Date()
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    this.logger.debug(\`New event subscription: \${subscriptionId}\`);
    return subscriptionId;
  }

  public async unsubscribe(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.isActive = false;
    this.subscriptions.delete(subscriptionId);
    
    this.logger.debug(\`Event subscription removed: \${subscriptionId}\`);
    return true;
  }

  private async processEvent(message: QueueMessage<StreamEvent>): Promise<MessageProcessingResult> {
    const event = message.payload;
    
    try {
      // Find matching subscriptions
      const matchingSubscriptions = this.findMatchingSubscriptions(event);
      
      // Process each matching subscription
      const results = await Promise.allSettled(
        matchingSubscriptions.map(subscription => 
          this.executeSubscriptionCallback(subscription, event)
        )
      );

      // Log any callback failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const subscription = matchingSubscriptions[index];
          this.logger.error(
            \`Subscription callback failed: \${subscription.id} - \${result.reason}\`
          );
        }
      });

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      this.logger.debug(
        \`Event processed: \${event.id} - \${successCount}/\${matchingSubscriptions.length} callbacks succeeded\`
      );
      
      return { success: true, result: { processedSubscriptions: successCount } };
    } catch (error) {
      this.logger.error(\`Failed to process event: \${event.id} - \${error.message}\`);
      return { success: false, error: error.message };
    }
  }

  private findMatchingSubscriptions(event: StreamEvent): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(subscription => {
      if (!subscription.isActive) return false;
      
      const filter = subscription.filter;
      
      // Check event type filter
      if (filter.types && filter.types.length > 0 && !filter.types.includes(event.type)) {
        return false;
      }
      
      // Check event source filter
      if (filter.sources && filter.sources.length > 0 && !filter.sources.includes(event.source)) {
        return false;
      }
      
      // Check event subject filter
      if (filter.subjects && filter.subjects.length > 0) {
        if (!event.subject || !filter.subjects.includes(event.subject)) {
          return false;
        }
      }
      
      return true;
    });
  }

  private async executeSubscriptionCallback(
    subscription: EventSubscription,
    event: StreamEvent
  ): Promise<void> {
    try {
      await subscription.callback(event);
    } catch (error) {
      this.logger.error(
        \`Subscription callback error: \${subscription.id} - \${error.message}\`
      );
      throw error;
    }
  }

  private storeEventInHistory(event: StreamEvent): void {
    const key = \`\${event.source}:\${event.type}\`;
    
    if (!this.eventHistory.has(key)) {
      this.eventHistory.set(key, []);
    }
    
    const history = this.eventHistory.get(key)!;
    history.push(event);
    
    // Keep only last 1000 events per type/source combination
    if (history.length > 1000) {
      history.shift();
    }
  }

  public async replayEvents(
    filter: EventFilter,
    fromTime?: Date,
    toTime?: Date
  ): Promise<StreamEvent[]> {
    const events: StreamEvent[] = [];
    
    for (const [key, history] of this.eventHistory.entries()) {
      const [source, type] = key.split(':');
      
      // Check if this source/type matches the filter
      if (filter.sources && !filter.sources.includes(source)) continue;
      if (filter.types && !filter.types.includes(type)) continue;
      
      // Filter by time range
      const filteredEvents = history.filter(event => {
        const eventTime = new Date(event.time);
        
        if (fromTime && eventTime < fromTime) return false;
        if (toTime && eventTime > toTime) return false;
        
        return true;
      });
      
      events.push(...filteredEvents);
    }
    
    // Sort by time
    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    this.logger.debug(\`Replayed \${events.length} events matching filter\`);
    return events;
  }

  public getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public async getEventStats(): Promise<{
    totalEventsPublished: number;
    activeSubscriptions: number;
    eventTypesCount: number;
  }> {
    const queueStats = await this.messageQueue.getQueueStats('events');
    
    const eventTypes = new Set<string>();
    for (const history of this.eventHistory.values()) {
      for (const event of history) {
        eventTypes.add(event.type);
      }
    }
    
    return {
      totalEventsPublished: queueStats.messagesSent,
      activeSubscriptions: this.subscriptions.size,
      eventTypesCount: eventTypes.size
    };
  }

  private generateEventId(): string {
    return \`event_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private generateSubscriptionId(): string {
    return \`sub_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

// Event builder utility
export class EventBuilder {
  private event: Partial<StreamEvent> = {};

  static create(): EventBuilder {
    return new EventBuilder();
  }

  type(type: string): EventBuilder {
    this.event.type = type;
    return this;
  }

  source(source: string): EventBuilder {
    this.event.source = source;
    return this;
  }

  subject(subject: string): EventBuilder {
    this.event.subject = subject;
    return this;
  }

  data(data: any): EventBuilder {
    this.event.data = data;
    return this;
  }

  contentType(contentType: string): EventBuilder {
    this.event.datacontenttype = contentType;
    return this;
  }

  metadata(metadata: Record<string, any>): EventBuilder {
    this.event.metadata = metadata;
    return this;
  }

  build(): Omit<StreamEvent, 'id' | 'time'> {
    if (!this.event.type || !this.event.source || this.event.data === undefined) {
      throw new Error('Event must have type, source, and data');
    }

    return {
      type: this.event.type,
      source: this.event.source,
      specversion: '1.0',
      subject: this.event.subject,
      data: this.event.data,
      datacontenttype: this.event.datacontenttype || 'application/json',
      metadata: this.event.metadata
    };
  }
}
`;

		return {
			path: `src/messaging/features/event-streaming.service.ts`,
			content,
			type: "service",
		};
	}

	// Template methods for provider-specific implementations
	private getRedisQueueServiceTemplate(options: MessageQueueOptions): string {
		return `/**
 * Redis Queue Service
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { QueueMessage, MessageProcessingResult } from '../types/message-queue.types';

@Injectable()
export class ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisQueueService {
  private readonly logger = new Logger(${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisQueueService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis
  ) {}

  async addToQueue<T>(queueName: string, message: QueueMessage<T>): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.redis.rpush(\`queue:\${queueName}\`, serialized);
  }

  async processQueue<T>(
    queueName: string,
    processor: (message: QueueMessage<T>) => Promise<MessageProcessingResult>
  ): Promise<void> {
    const queueKey = \`queue:\${queueName}\`;
    const processingKey = \`processing:\${queueName}\`;

    while (true) {
      try {
        // Atomically move message from queue to processing
        const result = await this.redis.brpoplpush(queueKey, processingKey, 0);
        
        if (result) {
          const message: QueueMessage<T> = JSON.parse(result);
          
          try {
            const processingResult = await processor(message);
            
            if (processingResult.success) {
              // Remove from processing queue
              await this.redis.lrem(processingKey, 1, result);
            } else {
              // Handle retry logic
              await this.handleRetry(queueName, message, processingResult.error);
            }
          } catch (error) {
            await this.handleRetry(queueName, message, error.message);
          }
        }
      } catch (error) {
        this.logger.error(\`Error processing queue \${queueName}:\`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async handleRetry<T>(
    queueName: string,
    message: QueueMessage<T>,
    error: string
  ): Promise<void> {
    message.attempts++;
    message.lastError = error;

    if (message.attempts < message.maxAttempts) {
      // Add back to queue with delay
      const delay = Math.pow(2, message.attempts) * 1000;
      setTimeout(async () => {
        await this.addToQueue(queueName, message);
      }, delay);
    } else {
      // Send to DLQ
      ${options.dlq ? "await this.addToQueue(`dlq:${queueName}`, message);" : ""}
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    return await this.redis.llen(\`queue:\${queueName}\`);
  }

  async purgeQueue(queueName: string): Promise<number> {
    const queueKey = \`queue:\${queueName}\`;
    const length = await this.redis.llen(queueKey);
    await this.redis.del(queueKey);
    return length;
  }
}`;
	}

	private getRedisPubSubServiceTemplate(options: MessageQueueOptions): string {
		return `/**
 * Redis Pub/Sub Service
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisPubSubService {
  private readonly logger = new Logger(${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisPubSubService.name);
  private subscriber: Redis;
  private subscriptions = new Map<string, Function[]>();

  constructor(
    @InjectRedis() private readonly redis: Redis
  ) {
    this.subscriber = this.redis.duplicate();
  }

  async publish(channel: string, message: any): Promise<number> {
    const serialized = JSON.stringify(message);
    return await this.redis.publish(channel, serialized);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
      await this.subscriber.subscribe(channel);
    }

    this.subscriptions.get(channel)!.push(callback);

    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          this.logger.error(\`Error parsing message for channel \${channel}:\`, error);
        }
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
    this.subscriptions.delete(channel);
  }

  async psubscribe(pattern: string, callback: (channel: string, message: any) => void): Promise<void> {
    await this.subscriber.psubscribe(pattern);

    this.subscriber.on('pmessage', (receivedPattern, channel, message) => {
      if (receivedPattern === pattern) {
        try {
          const parsed = JSON.parse(message);
          callback(channel, parsed);
        } catch (error) {
          this.logger.error(\`Error parsing pattern message for \${pattern}:\`, error);
        }
      }
    });
  }
}`;
	}

	// Additional template methods would go here for RabbitMQ, Kafka, etc.
	private getRabbitMQServiceTemplate(options: MessageQueueOptions): string {
		return `/**
 * RabbitMQ Service Implementation
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RabbitMQService {
  private readonly logger = new Logger(${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<boolean> {
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, buffer, { persistent: true });
  }

  async consume(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error) {
          this.logger.error('Error processing message', error);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }

  async createQueue(queueName: string, options?: any): Promise<void> {
    await this.channel.assertQueue(queueName, { durable: true, ...options });
  }

  async createExchange(exchangeName: string, type: string): Promise<void> {
    await this.channel.assertExchange(exchangeName, type, { durable: true });
  }
}`;
	}

	// Helper methods for generating provider-specific code
	private getProviderImports(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `import { RedisModule } from '@nestjs-modules/ioredis';
import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisQueueService } from './redis/${options.projectName}-redis-queue.service';
import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisPubSubService } from './redis/${options.projectName}-redis-pubsub.service';`;
			case "rabbitmq":
				return `import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RabbitMQService } from './rabbitmq/${options.projectName}-rabbitmq.service';`;
			case "kafka":
				return `import { ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}KafkaService } from './kafka/${options.projectName}-kafka.service';`;
			default:
				return "";
		}
	}

	private getProviderModuleImports(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      }),
    })`;
			default:
				return "// Provider-specific module imports";
		}
	}

	private getProviderServices(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisQueueService,
    ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisPubSubService`;
			case "rabbitmq":
				return `${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RabbitMQService`;
			case "kafka":
				return `${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}KafkaService`;
			default:
				return "// Provider-specific services";
		}
	}

	private getProviderConstructorInjections(
		options: MessageQueueOptions,
	): string {
		switch (options.provider) {
			case "redis":
				return `private readonly redisQueue: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisQueueService,
    private readonly redisPubSub: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RedisPubSubService`;
			case "rabbitmq":
				return `private readonly rabbitMQ: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}RabbitMQService`;
			case "kafka":
				return `private readonly kafka: ${options.projectName.charAt(0).toUpperCase() + options.projectName.slice(1)}KafkaService`;
			default:
				return "// Provider-specific constructor injections";
		}
	}

	private getFeatureServiceName(feature: MessageQueueFeature): string {
		return (
			feature
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join("") + "Service"
		);
	}

	private getDLQMethods(): string {
		return `
  public async sendToDeadLetterQueue<T>(
    originalQueue: string,
    message: QueueMessage<T>,
    error: Error
  ): Promise<void> {
    const dlqMessage = {
      ...message,
      originalQueue,
      sentToDLQAt: Date.now(),
      reason: error.message
    };

    await this.publishToQueue(\`dlq:\${originalQueue}\`, dlqMessage);
    this.logger.warn(\`Message sent to DLQ: \${message.id} from \${originalQueue}\`);
  }

  public async reprocessFromDLQ(dlqName: string, limit = 10): Promise<number> {
    // Implementation to reprocess messages from DLQ
    return 0;
  }`;
	}

	private getMonitoringMethods(): string {
		return `
  private async setupMonitoring(): Promise<void> {
    // Setup metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  private async collectMetrics(): Promise<void> {
    // Collect and report metrics
    for (const [queueName, stats] of this.stats) {
      this.logger.debug(\`Queue \${queueName} metrics:\`, stats);
    }
  }`;
	}

	private getProviderSetupCode(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `
    // Redis-specific setup
    this.logger.log('Setting up Redis queues');`;
			case "rabbitmq":
				return `
    // RabbitMQ-specific setup
    await this.rabbitMQ.connect();
    this.logger.log('Setting up RabbitMQ queues');`;
			case "kafka":
				return `
    // Kafka-specific setup
    this.logger.log('Setting up Kafka topics');`;
			default:
				return "// Provider-specific setup code";
		}
	}

	private getProviderPublishCode(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `await this.redisQueue.addToQueue(queueName, message);`;
			case "rabbitmq":
				return `await this.rabbitMQ.publish('direct', queueName, message);`;
			case "kafka":
				return `await this.kafka.produce(queueName, message);`;
			default:
				return "// Provider-specific publish code";
		}
	}

	private getProviderProcessorCode(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `await this.redisQueue.processQueue(queueName, processor);`;
			case "rabbitmq":
				return `await this.rabbitMQ.consume(queueName, async (msg) => {
        const result = await processor(msg);
        return result;
      });`;
			case "kafka":
				return `await this.kafka.subscribe(queueName, processor);`;
			default:
				return "// Provider-specific processor code";
		}
	}

	private getProviderPurgeCode(options: MessageQueueOptions): string {
		switch (options.provider) {
			case "redis":
				return `return await this.redisQueue.purgeQueue(queueName);`;
			case "rabbitmq":
				return `return await this.rabbitMQ.purgeQueue(queueName);`;
			default:
				return "return 0; // Provider-specific purge code";
		}
	}

	private getProviderPauseCode(options: MessageQueueOptions): string {
		return "// Provider-specific pause implementation";
	}

	private getProviderResumeCode(options: MessageQueueOptions): string {
		return "// Provider-specific resume implementation";
	}

	// Continue with other feature implementations...
	private generatePubSubFeature(options: MessageQueueOptions): GeneratedFile {
		// Implementation for pub/sub feature
		return {
			path: `src/messaging/features/pub-sub.service.ts`,
			content: "// Pub/Sub feature implementation",
			type: "service",
		};
	}

	private generateTaskSchedulingFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for task scheduling feature
		return {
			path: `src/messaging/features/task-scheduling.service.ts`,
			content: "// Task scheduling feature implementation",
			type: "service",
		};
	}

	private generateFileProcessingFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for file processing feature
		return {
			path: `src/messaging/features/file-processing.service.ts`,
			content: "// File processing feature implementation",
			type: "service",
		};
	}

	private generateEmailQueueFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for email queue feature
		return {
			path: `src/messaging/features/email-queue.service.ts`,
			content: "// Email queue feature implementation",
			type: "service",
		};
	}

	private generateNotificationQueueFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for notification queue feature
		return {
			path: `src/messaging/features/notification-queue.service.ts`,
			content: "// Notification queue feature implementation",
			type: "service",
		};
	}

	private generateAnalyticsEventsFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for analytics events feature
		return {
			path: `src/messaging/features/analytics-events.service.ts`,
			content: "// Analytics events feature implementation",
			type: "service",
		};
	}

	private generateAuditLoggingFeature(
		options: MessageQueueOptions,
	): GeneratedFile {
		// Implementation for audit logging feature
		return {
			path: `src/messaging/features/audit-logging.service.ts`,
			content: "// Audit logging feature implementation",
			type: "service",
		};
	}

	private generateDLQImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		// Dead Letter Queue implementation
		return [
			{
				path: `src/messaging/dlq/dead-letter-queue.service.ts`,
				content: "// Dead Letter Queue implementation",
				type: "service",
			},
		];
	}

	private generateMonitoringImplementation(
		options: MessageQueueOptions,
	): GeneratedFile[] {
		// Monitoring implementation
		return [
			{
				path: `src/messaging/monitoring/queue-monitoring.service.ts`,
				content: "// Queue monitoring implementation",
				type: "service",
			},
		];
	}

	private generateTypes(options: MessageQueueOptions): GeneratedFile {
		const content = `/**
 * Message Queue Types
 * Generated by Xaheen CLI for ${options.projectName}
 */

export interface QueueMessage<T = any> {
  id: string;
  payload: T;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  delay: number;
  priority: number;
  metadata: Record<string, any>;
  lastError?: string;
  failedAt?: number;
}

export interface QueueOptions {
  priority?: number;
  delay?: number;
  maxAttempts?: number;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface MessageProcessingResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface QueueStats {
  name: string;
  messagesSent: number;
  messagesProcessed: number;
  messagesRetried: number;
  messagesFailed: number;
  averageProcessingTime: number;
  queueLength: number;
}

export interface DeadLetterMessage<T = any> extends QueueMessage<T> {
  originalQueue: string;
  sentToDLQAt: number;
  reason: string;
}

export type MessageQueueFeature = ${options.features.map((f) => `'${f}'`).join(" | ")};

export interface MessageQueueConfiguration {
  provider: '${options.provider}';
  clustering: boolean;
  persistence: boolean;
  dlq: boolean;
  monitoring: boolean;
  security: {
    authentication: boolean;
    encryption: boolean;
    ssl: boolean;
  };
  performance: {
    batchProcessing: boolean;
    priorityQueues: boolean;
    rateLimiting: boolean;
  };
}`;

		return {
			path: `src/messaging/types/message-queue.types.ts`,
			content,
			type: "types",
		};
	}

	private generateConfiguration(options: MessageQueueOptions): GeneratedFile {
		const content = `/**
 * Message Queue Configuration
 * Generated by Xaheen CLI for ${options.projectName}
 */

import { MessageQueueConfiguration } from './types/message-queue.types';

export const messageQueueConfig: MessageQueueConfiguration = {
  provider: '${options.provider}',
  clustering: ${options.clustering},
  persistence: ${options.persistence},
  dlq: ${options.dlq},
  monitoring: ${options.monitoring},
  security: {
    authentication: ${options.security.authentication},
    encryption: ${options.security.encryption},
    ssl: ${options.security.ssl}
  },
  performance: {
    batchProcessing: ${options.performance.batchProcessing},
    priorityQueues: ${options.performance.priorityQueues},
    rateLimiting: ${options.performance.rateLimiting}
  }
};

export const queueNames = {
  ${options.features
		.map((feature) => {
			const queueName = feature.replace(/-/g, "_").toUpperCase();
			return `${queueName}: '${feature}'`;
		})
		.join(",\n  ")}
};

export const providerConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'default'
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || '${options.projectName}'
  }
};`;

		return {
			path: `src/messaging/config/message-queue.config.ts`,
			content,
			type: "config",
		};
	}

	private generateTestFiles(options: MessageQueueOptions): GeneratedFile[] {
		return [
			{
				path: `src/messaging/__tests__/${options.projectName}-message-queue.service.spec.ts`,
				content: "// Message queue service tests",
				type: "test",
			},
		];
	}

	private generateClientUtils(options: MessageQueueOptions): GeneratedFile[] {
		return [
			{
				path: `src/messaging/utils/message-queue-client.ts`,
				content: "// Message queue client utilities",
				type: "utility",
			},
		];
	}

	// Additional template methods for other providers would go here...
	private getKafkaServiceTemplate(options: MessageQueueOptions): string {
		return "// Kafka service implementation";
	}

	private getKafkaProducerTemplate(options: MessageQueueOptions): string {
		return "// Kafka producer implementation";
	}

	private getKafkaConsumerTemplate(options: MessageQueueOptions): string {
		return "// Kafka consumer implementation";
	}

	private getKafkaAdminTemplate(options: MessageQueueOptions): string {
		return "// Kafka admin implementation";
	}

	private getAWSSQSServiceTemplate(options: MessageQueueOptions): string {
		return "// AWS SQS service implementation";
	}

	private getSQSQueueManagerTemplate(options: MessageQueueOptions): string {
		return "// SQS queue manager implementation";
	}

	private getGCPPubSubServiceTemplate(options: MessageQueueOptions): string {
		return "// GCP Pub/Sub service implementation";
	}

	private getAzureServiceBusServiceTemplate(
		options: MessageQueueOptions,
	): string {
		return "// Azure Service Bus service implementation";
	}

	private getRedisProcessorServiceTemplate(
		options: MessageQueueOptions,
	): string {
		return "// Redis processor service implementation";
	}

	private getRedisConfigTemplate(options: MessageQueueOptions): string {
		return "// Redis configuration";
	}

	private getRabbitMQProducerTemplate(options: MessageQueueOptions): string {
		return "// RabbitMQ producer implementation";
	}

	private getRabbitMQConsumerTemplate(options: MessageQueueOptions): string {
		return "// RabbitMQ consumer implementation";
	}

	private getRabbitMQSetupTemplate(options: MessageQueueOptions): string {
		return "// RabbitMQ setup implementation";
	}
}

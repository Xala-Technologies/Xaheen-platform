/**
 * Messaging Generator
 * Generates message queue integration and event-driven patterns
 */

import type { GeneratedFile, MicroserviceOptions } from "./types.js";

export class MessagingGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		if (!options.messaging || options.messaging === "none") {
			return files;
		}

		switch (options.messaging) {
			case "rabbitmq":
				files.push(...this.generateRabbitMQ(options));
				break;
			case "kafka":
				files.push(...this.generateKafka(options));
				break;
			case "redis-pubsub":
				files.push(...this.generateRedisPubSub(options));
				break;
		}

		// Add event-driven patterns if enabled
		if (options.features.includes("event-sourcing")) {
			files.push(...this.generateEventSourcing(options));
		}

		if (options.features.includes("saga-pattern")) {
			files.push(...this.generateSagaPattern(options));
		}

		return files;
	}

	private generateRabbitMQ(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// RabbitMQ service
		files.push({
			path: `${options.name}/src/messaging/rabbitmq.service.ts`,
			content: `import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

export interface RabbitMQConfig {
  uri: string;
  exchange: string;
  queue: string;
  routingKey: string;
  prefetch?: number;
  durable?: boolean;
  autoAck?: boolean;
}

export class RabbitMQService extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private config: RabbitMQConfig;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isReconnecting = false;

  constructor(config: RabbitMQConfig) {
    super();
    this.config = {
      prefetch: 1,
      durable: true,
      autoAck: false,
      ...config
    };
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.uri);
      this.channel = await this.connection.createChannel();
      
      await this.channel.prefetch(this.config.prefetch!);
      
      // Setup exchange and queue
      await this.channel.assertExchange(this.config.exchange, 'topic', { durable: this.config.durable });
      await this.channel.assertQueue(this.config.queue, { durable: this.config.durable });
      await this.channel.bindQueue(this.config.queue, this.config.exchange, this.config.routingKey);
      
      // Handle connection events
      this.connection.on('error', this.handleError.bind(this));
      this.connection.on('close', this.handleClose.bind(this));
      
      console.log('✅ Connected to RabbitMQ');
      this.emit('connected');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.scheduleReconnect();
      throw error;
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const buffer = Buffer.from(JSON.stringify(message));
    const published = this.channel.publish(
      this.config.exchange,
      routingKey,
      buffer,
      { persistent: true, timestamp: Date.now() }
    );

    if (!published) {
      throw new Error('Failed to publish message');
    }
  }

  async consume(handler: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.consume(
      this.config.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          
          if (!this.config.autoAck) {
            this.channel!.ack(msg);
          }
        } catch (error) {
          console.error('Message processing error:', error);
          
          if (!this.config.autoAck) {
            // Requeue the message with a delay
            setTimeout(() => {
              this.channel!.nack(msg, false, true);
            }, 5000);
          }
        }
      },
      { noAck: this.config.autoAck }
    );
  }

  async createRPC(method: string, params: any, timeout = 5000): Promise<any> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    const correlationId = this.generateId();
    const replyQueue = await this.channel.assertQueue('', { exclusive: true });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('RPC timeout'));
      }, timeout);

      this.channel!.consume(
        replyQueue.queue,
        (msg) => {
          if (msg && msg.properties.correlationId === correlationId) {
            clearTimeout(timer);
            resolve(JSON.parse(msg.content.toString()));
          }
        },
        { noAck: true }
      );

      this.channel!.sendToQueue(
        \`rpc_\${method}\`,
        Buffer.from(JSON.stringify(params)),
        {
          correlationId,
          replyTo: replyQueue.queue
        }
      );
    });
  }

  private handleError(error: Error): void {
    console.error('RabbitMQ connection error:', error);
    this.emit('error', error);
  }

  private handleClose(): void {
    console.log('RabbitMQ connection closed');
    this.emit('disconnected');
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect to RabbitMQ...');
      this.connect()
        .then(() => {
          this.isReconnecting = false;
        })
        .catch(() => {
          this.isReconnecting = false;
          this.scheduleReconnect();
        });
    }, 5000);
  }

  async close(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.channel) {
      await this.channel.close();
    }
    
    if (this.connection) {
      await this.connection.close();
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}`,
			type: "source",
		});

		// Dead letter queue handler
		files.push({
			path: `${options.name}/src/messaging/dead-letter.service.ts`,
			content: `import { RabbitMQService } from './rabbitmq.service';

export class DeadLetterService {
  private dlqService: RabbitMQService;
  private maxRetries = 3;

  constructor(uri: string) {
    this.dlqService = new RabbitMQService({
      uri,
      exchange: 'dlx',
      queue: 'dead-letter-queue',
      routingKey: 'dlq.*',
      durable: true
    });
  }

  async initialize(): Promise<void> {
    await this.dlqService.connect();
    await this.dlqService.consume(this.handleDeadLetter.bind(this));
  }

  private async handleDeadLetter(message: any): Promise<void> {
    console.error('Dead letter received:', message);
    
    const retryCount = message.retryCount || 0;
    
    if (retryCount < this.maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      
      setTimeout(async () => {
        try {
          // Attempt to reprocess
          await this.reprocessMessage({
            ...message,
            retryCount: retryCount + 1
          });
        } catch (error) {
          console.error('Failed to reprocess dead letter:', error);
          await this.storeFailedMessage(message);
        }
      }, delay);
    } else {
      // Max retries exceeded, store for manual intervention
      await this.storeFailedMessage(message);
    }
  }

  private async reprocessMessage(message: any): Promise<void> {
    // Implement reprocessing logic
    console.log('Reprocessing message:', message);
  }

  private async storeFailedMessage(message: any): Promise<void> {
    // Store in database or file for manual review
    console.error('Storing failed message for manual review:', message);
  }
}`,
			type: "source",
		});

		return files;
	}

	private generateKafka(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/messaging/kafka.service.ts`,
			content: `import { Kafka, Producer, Consumer, EachMessagePayload, KafkaConfig } from 'kafkajs';
import { EventEmitter } from 'events';

export interface KafkaServiceConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
  topics?: string[];
}

export class KafkaService extends EventEmitter {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private config: KafkaServiceConfig;

  constructor(config: KafkaServiceConfig) {
    super();
    this.config = config;
    
    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId,
      brokers: config.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      },
      connectionTimeout: 3000,
      requestTimeout: 25000
    };
    
    this.kafka = new Kafka(kafkaConfig);
  }

  async connectProducer(): Promise<void> {
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000
    });
    
    await this.producer.connect();
    console.log('✅ Kafka producer connected');
    this.emit('producer-connected');
  }

  async connectConsumer(groupId: string, topics: string[]): Promise<void> {
    this.consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    
    await this.consumer.connect();
    await this.consumer.subscribe({ topics, fromBeginning: false });
    
    console.log(\`✅ Kafka consumer connected to topics: \${topics.join(', ')}\`);
    this.emit('consumer-connected');
  }

  async produce(topic: string, messages: any[]): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const kafkaMessages = messages.map(msg => ({
      key: msg.key || null,
      value: JSON.stringify(msg.value),
      headers: msg.headers || {},
      timestamp: Date.now().toString()
    }));

    await this.producer.send({
      topic,
      messages: kafkaMessages,
      acks: -1, // Wait for all replicas
      timeout: 30000,
      compression: 1 // GZIP compression
    });
  }

  async produceBatch(records: { topic: string; messages: any[] }[]): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const batch = records.map(record => ({
      topic: record.topic,
      messages: record.messages.map(msg => ({
        key: msg.key || null,
        value: JSON.stringify(msg.value),
        headers: msg.headers || {}
      }))
    }));

    await this.producer.sendBatch({ topicMessages: batch });
  }

  async consume(handler: (message: EachMessagePayload) => Promise<void>): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not connected');
    }

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (payload) => {
        try {
          await handler(payload);
          
          // Manually commit offset after successful processing
          await this.consumer!.commitOffsets([
            {
              topic: payload.topic,
              partition: payload.partition,
              offset: (Number(payload.message.offset) + 1).toString()
            }
          ]);
        } catch (error) {
          console.error('Message processing error:', error);
          // Implement retry logic or dead letter queue
          await this.handleFailedMessage(payload, error as Error);
        }
      }
    });
  }

  private async handleFailedMessage(payload: EachMessagePayload, error: Error): Promise<void> {
    // Send to dead letter topic
    const dlqTopic = \`\${payload.topic}.dlq\`;
    
    if (this.producer) {
      await this.producer.send({
        topic: dlqTopic,
        messages: [{
          key: payload.message.key,
          value: payload.message.value,
          headers: {
            ...payload.message.headers,
            'original-topic': payload.topic,
            'error-message': error.message,
            'error-timestamp': Date.now().toString()
          }
        }]
      });
    }
  }

  async createTransaction(): Promise<any> {
    if (!this.producer) {
      throw new Error('Producer not connected');
    }

    const transaction = await this.producer.transaction();
    
    return {
      send: async (topic: string, messages: any[]) => {
        await transaction.send({ topic, messages });
      },
      commit: async () => {
        await transaction.commit();
      },
      abort: async () => {
        await transaction.abort();
      }
    };
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}`,
			type: "source",
		});

		return files;
	}

	private generateRedisPubSub(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/messaging/redis-pubsub.service.ts`,
			content: `import Redis from 'ioredis';
import { EventEmitter } from 'events';

export interface RedisPubSubConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export class RedisPubSubService extends EventEmitter {
  private publisher: Redis;
  private subscriber: Redis;
  private config: RedisPubSubConfig;
  private subscriptions: Map<string, Set<(message: any) => void>> = new Map();

  constructor(config: RedisPubSubConfig) {
    super();
    this.config = config;
    
    // Create separate connections for pub and sub
    this.publisher = new Redis(config);
    this.subscriber = new Redis(config);
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.publisher.on('connect', () => {
      console.log('✅ Redis publisher connected');
      this.emit('publisher-connected');
    });

    this.subscriber.on('connect', () => {
      console.log('✅ Redis subscriber connected');
      this.emit('subscriber-connected');
    });

    this.publisher.on('error', (error) => {
      console.error('Redis publisher error:', error);
      this.emit('error', error);
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
      this.emit('error', error);
    });

    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });

    this.subscriber.on('pmessage', (pattern, channel, message) => {
      this.handlePatternMessage(pattern, channel, message);
    });
  }

  async publish(channel: string, message: any): Promise<number> {
    const serialized = JSON.stringify(message);
    return await this.publisher.publish(channel, serialized);
  }

  async subscribe(channel: string, handler: (message: any) => void): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }
    
    this.subscriptions.get(channel)!.add(handler);
  }

  async psubscribe(pattern: string, handler: (channel: string, message: any) => void): Promise<void> {
    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, new Set());
      await this.subscriber.psubscribe(pattern);
    }
    
    this.subscriptions.get(pattern)!.add(handler);
  }

  async unsubscribe(channel: string): Promise<void> {
    if (this.subscriptions.has(channel)) {
      this.subscriptions.delete(channel);
      await this.subscriber.unsubscribe(channel);
    }
  }

  private handleMessage(channel: string, message: string): void {
    try {
      const parsed = JSON.parse(message);
      const handlers = this.subscriptions.get(channel);
      
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(parsed);
          } catch (error) {
            console.error(\`Handler error for channel \${channel}:\`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private handlePatternMessage(pattern: string, channel: string, message: string): void {
    try {
      const parsed = JSON.parse(message);
      const handlers = this.subscriptions.get(pattern);
      
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(channel, parsed);
          } catch (error) {
            console.error(\`Pattern handler error for \${pattern}:\`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse pattern message:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}`,
			type: "source",
		});

		return files;
	}

	private generateEventSourcing(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/patterns/event-sourcing.ts`,
			content: `export interface Event {
  id: string;
  aggregateId: string;
  type: string;
  version: number;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

export interface Snapshot {
  aggregateId: string;
  version: number;
  state: any;
  timestamp: number;
}

export abstract class AggregateRoot {
  protected id: string;
  protected version = 0;
  private uncommittedEvents: Event[] = [];

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  getUncommittedEvents(): Event[] {
    return this.uncommittedEvents;
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  protected applyEvent(event: Event): void {
    this.version = event.version;
    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  protected abstract apply(event: Event): void;

  loadFromHistory(events: Event[]): void {
    events.forEach(event => {
      this.version = event.version;
      this.apply(event);
    });
  }

  createSnapshot(): Snapshot {
    return {
      aggregateId: this.id,
      version: this.version,
      state: this.getState(),
      timestamp: Date.now()
    };
  }

  loadFromSnapshot(snapshot: Snapshot, events: Event[]): void {
    this.version = snapshot.version;
    this.restoreFromSnapshot(snapshot.state);
    
    // Apply events after snapshot
    events
      .filter(e => e.version > snapshot.version)
      .forEach(event => {
        this.version = event.version;
        this.apply(event);
      });
  }

  protected abstract getState(): any;
  protected abstract restoreFromSnapshot(state: any): void;
}

export class EventStore {
  private events: Map<string, Event[]> = new Map();
  private snapshots: Map<string, Snapshot> = new Map();
  private snapshotFrequency = 10;

  async saveEvents(aggregateId: string, events: Event[]): Promise<void> {
    const existingEvents = this.events.get(aggregateId) || [];
    this.events.set(aggregateId, [...existingEvents, ...events]);
    
    // Create snapshot if needed
    const totalEvents = existingEvents.length + events.length;
    if (totalEvents % this.snapshotFrequency === 0) {
      const latestEvent = events[events.length - 1];
      await this.saveSnapshot({
        aggregateId,
        version: latestEvent.version,
        state: {}, // Aggregate should provide this
        timestamp: Date.now()
      });
    }
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<Event[]> {
    const events = this.events.get(aggregateId) || [];
    return events.filter(e => e.version > fromVersion);
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }

  async getSnapshot(aggregateId: string): Promise<Snapshot | null> {
    return this.snapshots.get(aggregateId) || null;
  }

  async getAggregateEvents(aggregateId: string): Promise<{ snapshot: Snapshot | null; events: Event[] }> {
    const snapshot = await this.getSnapshot(aggregateId);
    const fromVersion = snapshot ? snapshot.version : 0;
    const events = await this.getEvents(aggregateId, fromVersion);
    
    return { snapshot, events };
  }
}`,
			type: "source",
		});

		return files;
	}

	private generateSagaPattern(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/patterns/saga.ts`,
			content: `export interface SagaStep {
  name: string;
  service: string;
  action: string;
  compensate: string;
  timeout?: number;
}

export interface SagaContext {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensating';
  currentStep: number;
  steps: SagaStep[];
  data: any;
  errors: Error[];
  startedAt: number;
  completedAt?: number;
}

export abstract class Saga {
  protected context: SagaContext;
  
  constructor(id: string, steps: SagaStep[]) {
    this.context = {
      id,
      status: 'pending',
      currentStep: 0,
      steps,
      data: {},
      errors: [],
      startedAt: Date.now()
    };
  }

  async execute(initialData: any): Promise<SagaContext> {
    this.context.data = initialData;
    this.context.status = 'running';
    
    try {
      for (let i = 0; i < this.context.steps.length; i++) {
        this.context.currentStep = i;
        const step = this.context.steps[i];
        
        try {
          console.log(\`Executing step: \${step.name}\`);
          const result = await this.executeStep(step, this.context.data);
          this.context.data = { ...this.context.data, ...result };
        } catch (error) {
          console.error(\`Step \${step.name} failed:\`, error);
          this.context.errors.push(error as Error);
          await this.compensate();
          this.context.status = 'failed';
          throw error;
        }
      }
      
      this.context.status = 'completed';
      this.context.completedAt = Date.now();
    } catch (error) {
      // Already handled in step execution
    }
    
    return this.context;
  }

  private async compensate(): Promise<void> {
    this.context.status = 'compensating';
    
    // Compensate in reverse order
    for (let i = this.context.currentStep; i >= 0; i--) {
      const step = this.context.steps[i];
      
      try {
        console.log(\`Compensating step: \${step.name}\`);
        await this.compensateStep(step, this.context.data);
      } catch (error) {
        console.error(\`Compensation failed for \${step.name}:\`, error);
        this.context.errors.push(error as Error);
      }
    }
  }

  protected abstract executeStep(step: SagaStep, data: any): Promise<any>;
  protected abstract compensateStep(step: SagaStep, data: any): Promise<void>;
}

export class SagaOrchestrator extends Saga {
  private serviceClients: Map<string, any> = new Map();

  constructor(id: string, steps: SagaStep[]) {
    super(id, steps);
  }

  setServiceClient(serviceName: string, client: any): void {
    this.serviceClients.set(serviceName, client);
  }

  protected async executeStep(step: SagaStep, data: any): Promise<any> {
    const client = this.serviceClients.get(step.service);
    if (!client) {
      throw new Error(\`No client configured for service: \${step.service}\`);
    }

    const timeout = step.timeout || 30000;
    return await this.callWithTimeout(
      () => client[step.action](data),
      timeout
    );
  }

  protected async compensateStep(step: SagaStep, data: any): Promise<void> {
    const client = this.serviceClients.get(step.service);
    if (!client) {
      throw new Error(\`No client configured for service: \${step.service}\`);
    }

    const timeout = step.timeout || 30000;
    await this.callWithTimeout(
      () => client[step.compensate](data),
      timeout
    );
  }

  private async callWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  }
}

// Example usage
export class OrderSaga extends SagaOrchestrator {
  constructor() {
    super('order-saga', [
      {
        name: 'reserve-inventory',
        service: 'inventory',
        action: 'reserve',
        compensate: 'release'
      },
      {
        name: 'process-payment',
        service: 'payment',
        action: 'charge',
        compensate: 'refund'
      },
      {
        name: 'create-shipment',
        service: 'shipping',
        action: 'create',
        compensate: 'cancel'
      }
    ]);
  }
}`,
			type: "source",
		});

		return files;
	}
}

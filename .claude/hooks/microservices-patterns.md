# Microservices Patterns Hook

This hook ensures all generated microservices follow enterprise-grade architectural patterns and best practices for scalable, maintainable systems.

## Microservice Architecture Standards

### Service Structure

All generated microservices must follow this standardized structure:

```
service-name/
├── src/
│   ├── application/           # Application layer (Use cases, DTOs)
│   │   ├── commands/          # Command handlers
│   │   ├── queries/           # Query handlers  
│   │   ├── dto/               # Data transfer objects
│   │   └── interfaces/        # Application interfaces
│   ├── domain/                # Domain layer (Entities, Value Objects)
│   │   ├── entities/          # Domain entities
│   │   ├── value-objects/     # Value objects
│   │   ├── repositories/      # Repository interfaces
│   │   └── services/          # Domain services
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── database/          # Database implementations
│   │   ├── external/          # External service clients
│   │   ├── messaging/         # Message queue implementations
│   │   └── config/            # Configuration
│   ├── presentation/          # Presentation layer
│   │   ├── controllers/       # HTTP controllers
│   │   ├── graphql/           # GraphQL resolvers
│   │   ├── grpc/              # gRPC services
│   │   └── middleware/        # HTTP middleware
│   ├── shared/                # Shared utilities
│   │   ├── exceptions/        # Custom exceptions
│   │   ├── guards/            # Security guards
│   │   ├── decorators/        # Custom decorators
│   │   └── utils/             # Utility functions
│   └── main.ts                # Application entry point
├── test/                      # Test files
├── docker/                    # Docker configurations
├── k8s/                       # Kubernetes manifests
├── docs/                      # Service documentation
└── package.json               # Dependencies
```

### Domain-Driven Design Patterns

All services must implement DDD patterns:

```typescript
// Domain Entity
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  private readonly _id: string;

  @Column({ unique: true })
  private _email: Email;

  @Column()
  private _name: Name;

  @Column({ type: 'enum', enum: UserStatus })
  private _status: UserStatus;

  @CreateDateColumn()
  private readonly _createdAt: Date;

  @UpdateDateColumn()
  private _updatedAt: Date;

  private _domainEvents: DomainEvent[] = [];

  constructor(email: Email, name: Name) {
    this._email = email;
    this._name = name;
    this._status = UserStatus.ACTIVE;
    this.addDomainEvent(new UserCreatedEvent(this._id, email.value, name.value));
  }

  // Getters
  get id(): string { return this._id; }
  get email(): Email { return this._email; }
  get name(): Name { return this._name; }
  get status(): UserStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Business methods
  changeEmail(newEmail: Email): void {
    if (this._status !== UserStatus.ACTIVE) {
      throw new DomainException('Cannot change email for inactive user');
    }

    const oldEmail = this._email;
    this._email = newEmail;
    this.addDomainEvent(new UserEmailChangedEvent(this._id, oldEmail.value, newEmail.value));
  }

  deactivate(): void {
    if (this._status === UserStatus.INACTIVE) {
      throw new DomainException('User is already inactive');
    }

    this._status = UserStatus.INACTIVE;
    this.addDomainEvent(new UserDeactivatedEvent(this._id));
  }

  // Domain events
  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}

// Value Object
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailException(`Invalid email: ${value}`);
    }
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}

// Domain Service
@Injectable()
export class UserDomainService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {}

  async registerUser(email: Email, name: Name): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException('User with this email already exists');
    }

    // Create new user
    const user = new User(email, name);
    
    // Save user and publish events
    const savedUser = await this.userRepository.save(user);
    await this.publishDomainEvents(savedUser);

    return savedUser;
  }

  private async publishDomainEvents(user: User): Promise<void> {
    const events = user.getDomainEvents();
    user.clearDomainEvents();

    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }
}
```

### CQRS Pattern Implementation

Services must separate commands and queries:

```typescript
// Command Handler
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
    private readonly logger: Logger
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    try {
      const email = new Email(command.email);
      const name = new Name(command.name);

      const user = await this.userDomainService.registerUser(email, name);

      this.logger.info('User created successfully', {
        userId: user.id,
        email: email.value,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        userId: user.id,
        message: 'User created successfully'
      };
    } catch (error) {
      this.logger.error('Failed to create user', {
        email: command.email,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Query Handler
@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    private readonly userReadRepository: UserReadRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: GetUserQuery): Promise<UserReadModel> {
    try {
      const user = await this.userReadRepository.findById(query.userId);
      
      if (!user) {
        throw new UserNotFoundException(`User not found: ${query.userId}`);
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to get user', {
        userId: query.userId,
        error: error.message
      });
      throw error;
    }
  }
}

// Read Model
export interface UserReadModel {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

### Event-Driven Architecture

Services must implement event-driven communication:

```typescript
// Domain Event
export abstract class DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  constructor(aggregateId: string, eventType: string, eventVersion: number = 1) {
    this.eventId = uuidv4();
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredOn = new Date();
    this.eventVersion = eventVersion;
  }
}

// Specific Domain Event
export class UserCreatedEvent extends DomainEvent {
  constructor(
    userId: string,
    public readonly email: string,
    public readonly name: string
  ) {
    super(userId, 'UserCreated');
  }
}

// Event Handler
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly logger: Logger
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    try {
      // Send welcome email
      await this.notificationService.sendWelcomeEmail(
        event.email,
        event.name
      );

      // Log for audit
      await this.auditService.log({
        eventType: 'USER_CREATED',
        userId: event.aggregateId,
        data: {
          email: event.email,
          name: event.name
        },
        timestamp: event.occurredOn
      });

      this.logger.info('User created event processed', {
        userId: event.aggregateId,
        email: event.email
      });
    } catch (error) {
      this.logger.error('Failed to process user created event', {
        userId: event.aggregateId,
        error: error.message
      });
      throw error;
    }
  }
}

// Integration Event for cross-service communication
export class UserRegisteredIntegrationEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly registeredAt: Date
  ) {}
}

// Integration Event Publisher
@Injectable()
export class IntegrationEventPublisher {
  constructor(
    private readonly messageBus: MessageBus,
    private readonly logger: Logger
  ) {}

  async publishUserRegistered(event: UserCreatedEvent): Promise<void> {
    const integrationEvent = new UserRegisteredIntegrationEvent(
      event.aggregateId,
      event.email,
      event.name,
      event.occurredOn
    );

    await this.messageBus.publish('user.registered', integrationEvent);
    
    this.logger.info('Integration event published', {
      eventType: 'user.registered',
      userId: event.aggregateId
    });
  }
}
```

### Service Communication Patterns

#### gRPC Communication

```typescript
// Protocol Buffer Definition (user.proto)
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
  string status = 4;
  int64 created_at = 5;
  int64 updated_at = 6;
}

// gRPC Service Implementation
@GrpcService()
export class UserGrpcService implements UserServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: Logger
  ) {}

  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    try {
      const query = new GetUserQuery(request.userId);
      const user = await this.queryBus.execute(query);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          createdAt: user.createdAt.getTime(),
          updatedAt: user.updatedAt.getTime()
        }
      };
    } catch (error) {
      this.logger.error('gRPC GetUser failed', {
        userId: request.userId,
        error: error.message
      });
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found'
      });
    }
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const command = new CreateUserCommand(request.email, request.name);
      const result = await this.commandBus.execute(command);

      if (!result.success) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: result.error
        });
      }

      return {
        userId: result.userId,
        success: true,
        message: result.message
      };
    } catch (error) {
      this.logger.error('gRPC CreateUser failed', {
        email: request.email,
        error: error.message
      });
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error'
      });
    }
  }
}
```

#### Message Queue Integration

```typescript
// Message Bus Implementation
@Injectable()
export class RabbitMQMessageBus implements MessageBus {
  private connection: Connection;
  private channel: Channel;

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.url);
    this.channel = await this.connection.createChannel();

    // Declare exchanges and queues
    await this.setupExchangesAndQueues();
  }

  async publish(routingKey: string, message: any): Promise<void> {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    await this.channel.publish(
      this.config.exchange,
      routingKey,
      messageBuffer,
      {
        persistent: true,
        messageId: uuidv4(),
        timestamp: Date.now(),
        contentType: 'application/json'
      }
    );
  }

  async subscribe(routingKey: string, handler: MessageHandler): Promise<void> {
    const queue = await this.channel.assertQueue(`${routingKey}.queue`, {
      durable: true
    });

    await this.channel.bindQueue(queue.queue, this.config.exchange, routingKey);

    await this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Message processing failed:', error);
          this.channel.nack(msg, false, false); // Dead letter queue
        }
      }
    });
  }

  private async setupExchangesAndQueues(): Promise<void> {
    // Declare main exchange
    await this.channel.assertExchange(this.config.exchange, 'topic', {
      durable: true
    });

    // Declare dead letter exchange
    await this.channel.assertExchange(
      `${this.config.exchange}.dlx`,
      'topic',
      { durable: true }
    );
  }
}
```

### Health Checks and Observability

All services must include comprehensive health checks:

```typescript
// Health Check Controller
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseHealthCheck: DatabaseHealthCheck,
    private readonly messageQueueHealthCheck: MessageQueueHealthCheck,
    private readonly externalServicesHealthCheck: ExternalServicesHealthCheck
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.databaseHealthCheck.check(),
      this.messageQueueHealthCheck.check(),
      this.externalServicesHealthCheck.check()
    ]);

    const results = checks.map((check, index) => ({
      name: ['database', 'messageQueue', 'externalServices'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason
    }));

    const overallStatus = results.every(r => r.status === 'healthy') 
      ? 'healthy' 
      : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      version: process.env.SERVICE_VERSION || '1.0.0'
    };
  }

  @Get('ready')
  async ready(): Promise<ReadinessCheckResult> {
    // Check if service is ready to handle requests
    const checks = await Promise.all([
      this.checkDatabaseConnection(),
      this.checkRequiredServices(),
      this.checkConfiguration()
    ]);

    const isReady = checks.every(check => check.ready);

    return {
      ready: isReady,
      timestamp: new Date().toISOString(),
      checks
    };
  }

  @Get('live')
  async live(): Promise<LivenessCheckResult> {
    // Simple liveness check
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

// Metrics Controller
@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}

// Custom Metrics
@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  });

  private readonly businessMetricsCounter = new Counter({
    name: 'business_operations_total',
    help: 'Total number of business operations',
    labelNames: ['operation', 'status']
  });

  recordHttpRequest(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  recordHttpDuration(method: string, route: string, duration: number): void {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  recordBusinessOperation(operation: string, status: 'success' | 'error'): void {
    this.businessMetricsCounter.inc({ operation, status });
  }
}
```

### Docker and Kubernetes Configuration

All services must include production-ready deployment configurations:

```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Security updates
RUN apk upgrade --no-cache

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

CMD ["node", "dist/main.js"]
```

```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: database-url
        - name: RABBITMQ_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: rabbitmq-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
```

## Validation Rules

Before generating any microservice:

1. **Clean Architecture**: Must follow layered architecture with clear separation
2. **Domain-Driven Design**: Must implement DDD patterns appropriately
3. **CQRS**: Must separate commands and queries
4. **Event-Driven**: Must implement event-driven communication
5. **Health Checks**: Must include comprehensive health checks
6. **Observability**: Must include metrics, logging, and tracing
7. **Security**: Must implement proper authentication and authorization
8. **Container Ready**: Must include Docker and Kubernetes configurations
9. **Testing**: Must include unit, integration, and contract tests
10. **Documentation**: Must include comprehensive API documentation
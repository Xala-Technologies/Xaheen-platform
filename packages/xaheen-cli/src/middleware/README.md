# Middleware Module

## Purpose

The middleware module implements the **Chain of Responsibility** pattern for processing CLI commands through a series of interceptors and processors. It provides cross-cutting concerns like authentication, logging, validation, and Norwegian compliance checks that are applied consistently across all CLI operations.

## Architecture

```
middleware/
├── alias-resolver.middleware.ts   # Command alias resolution
├── AuthenticationMiddleware.ts    # User authentication checks
├── AuthorizationMiddleware.ts     # Permission validation
├── LoggingMiddleware.ts          # Request/response logging
├── ValidationMiddleware.ts       # Input validation
├── ComplianceMiddleware.ts       # Norwegian compliance checks
├── RateLimitingMiddleware.ts     # Rate limiting and throttling
├── AuditMiddleware.ts            # Security audit logging
├── CachingMiddleware.ts          # Response caching
├── ErrorHandlingMiddleware.ts    # Error processing
├── MetricsMiddleware.ts          # Performance metrics
├── MiddlewareChain.ts            # Chain orchestration
├── types.ts                      # Middleware types
└── utils.ts                      # Middleware utilities
```

### Key Features

- **Request Processing**: Pre and post-processing of CLI commands
- **Security**: Authentication, authorization, and audit logging
- **Norwegian Compliance**: NSM classification and GDPR checks
- **Performance**: Caching, rate limiting, and metrics collection
- **Error Handling**: Centralized error processing and recovery

## Dependencies

- `express`: HTTP middleware patterns (adapted for CLI)
- `joi`: Schema validation
- `winston`: Structured logging
- `redis`: Caching backend
- `rate-limiter-flexible`: Advanced rate limiting

## Usage Examples

### Middleware Chain Setup

```typescript
import { MiddlewareChain } from './MiddlewareChain';
import { 
  AuthenticationMiddleware,
  ValidationMiddleware,
  ComplianceMiddleware,
  LoggingMiddleware,
  AuditMiddleware 
} from './';

const middlewareChain = new MiddlewareChain([
  new LoggingMiddleware(),
  new AuthenticationMiddleware({
    providers: ['bankid', 'oauth2'],
    requiredLevel: 'authenticated'
  }),
  new ValidationMiddleware({
    strict: true,
    norwegianCompliance: true
  }),
  new ComplianceMiddleware({
    nsmClassification: true,
    gdprChecks: true,
    auditLevel: 'comprehensive'
  }),
  new AuditMiddleware({
    logLevel: 'detailed',
    retentionPeriod: '7years' // Norwegian requirement
  })
]);

// Apply middleware to command
const result = await middlewareChain.execute(commandContext);
```

### Command Processing Flow

```typescript
interface CommandContext {
  command: string;
  args: any[];
  options: CommandOptions;
  user: User;
  session: Session;
  metadata: ContextMetadata;
}

class CommandProcessor {
  constructor(private middlewareChain: MiddlewareChain) {}
  
  async processCommand(context: CommandContext): Promise<CommandResult> {
    try {
      // Execute middleware chain
      const processedContext = await this.middlewareChain.execute(context);
      
      // Execute actual command
      const result = await this.executeCommand(processedContext);
      
      // Post-process through middleware
      return await this.middlewareChain.postProcess(result, processedContext);
    } catch (error) {
      // Error handling through middleware
      return await this.middlewareChain.handleError(error, context);
    }
  }
}
```

### Alias Resolution Middleware

```typescript
// Current implementation from alias-resolver.middleware.ts
class AliasResolverMiddleware implements Middleware {
  private aliases = new Map<string, string>([
    ['g', 'generate'],
    ['c', 'create'],
    ['d', 'deploy'],
    ['t', 'test'],
    ['b', 'build']
  ]);
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    // Resolve command aliases
    if (this.aliases.has(context.command)) {
      context.command = this.aliases.get(context.command)!;
      
      // Log alias resolution
      context.metadata.aliasResolved = true;
      context.metadata.originalCommand = context.command;
    }
    
    return next(context);
  }
}
```

## Middleware Implementations

### Authentication Middleware

```typescript
class AuthenticationMiddleware implements Middleware {
  constructor(private config: AuthConfig) {}
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    // Skip authentication for public commands
    if (this.isPublicCommand(context.command)) {
      return next(context);
    }
    
    // Validate session
    const session = await this.validateSession(context.session);
    if (!session.valid) {
      throw new AuthenticationError('Invalid or expired session');
    }
    
    // Validate user permissions
    const user = await this.userService.getUser(session.userId);
    if (!user.active) {
      throw new AuthenticationError('User account is disabled');
    }
    
    // Norwegian eID validation if required
    if (this.requiresStrongAuth(context.command)) {
      await this.validateStrongAuthentication(user, session);
    }
    
    context.user = user;
    context.session = session;
    
    return next(context);
  }
  
  private async validateStrongAuthentication(
    user: User, 
    session: Session
  ): Promise<void> {
    // Check if user authenticated with BankID (Level 4)
    if (session.authenticationLevel !== 'Level4') {
      throw new AuthenticationError(
        'This operation requires strong authentication (BankID Level 4)'
      );
    }
    
    // Verify authentication is recent (within 15 minutes)
    const authAge = Date.now() - session.strongAuthTimestamp;
    if (authAge > 15 * 60 * 1000) {
      throw new AuthenticationError(
        'Strong authentication has expired. Please re-authenticate.'
      );
    }
  }
}
```

### Authorization Middleware

```typescript
class AuthorizationMiddleware implements Middleware {
  constructor(private rbacManager: RBACManager) {}
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    const { command, user } = context;
    
    // Check basic permission
    const hasPermission = await this.rbacManager.checkPermission(
      user.id,
      this.getResourceFromCommand(command),
      this.getActionFromCommand(command)
    );
    
    if (!hasPermission) {
      throw new AuthorizationError(
        `Insufficient permissions for command: ${command}`
      );
    }
    
    // Check security clearance for classified operations
    if (this.isClassifiedCommand(command)) {
      await this.validateSecurityClearance(user, command);
    }
    
    // Add permission context
    context.permissions = await this.rbacManager.getUserPermissions(user.id);
    
    return next(context);
  }
  
  private async validateSecurityClearance(
    user: User, 
    command: string
  ): Promise<void> {
    const requiredClearance = this.getRequiredClearance(command);
    
    if (!this.hasValidClearance(user.securityClearance, requiredClearance)) {
      throw new AuthorizationError(
        `Command requires ${requiredClearance} security clearance`
      );
    }
    
    // Verify clearance is current
    if (this.isClearanceExpired(user.clearanceExpiry)) {
      throw new AuthorizationError(
        'Security clearance has expired. Please renew.'
      );
    }
  }
}
```

### Norwegian Compliance Middleware

```typescript
class ComplianceMiddleware implements Middleware {
  constructor(
    private nsmClassifier: NSMClassifier,
    private gdprValidator: GDPRValidator
  ) {}
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    // Classify command and data
    const classification = await this.nsmClassifier.classify(context);
    context.metadata.nsmClassification = classification;
    
    // Apply data residency rules
    await this.validateDataResidency(context, classification);
    
    // GDPR compliance checks
    if (this.involvesPersonalData(context)) {
      await this.validateGDPRCompliance(context);
    }
    
    // Apply Norwegian specific validations
    await this.applyNorwegianValidations(context);
    
    return next(context);
  }
  
  private async validateDataResidency(
    context: CommandContext,
    classification: NSMClassification
  ): Promise<void> {
    const allowedLocations = this.getAllowedLocations(classification);
    const operationLocation = this.getOperationLocation(context);
    
    if (!allowedLocations.includes(operationLocation)) {
      throw new ComplianceError(
        `Operation with ${classification} data cannot be performed in ${operationLocation}`
      );
    }
  }
  
  private async validateGDPRCompliance(context: CommandContext): Promise<void> {
    // Check for valid consent
    const personalDataOperations = this.extractPersonalDataOperations(context);
    
    for (const operation of personalDataOperations) {
      const consent = await this.gdprValidator.getConsent(
        operation.userId,
        operation.purpose
      );
      
      if (!consent || !consent.valid) {
        throw new ComplianceError(
          `Valid GDPR consent required for ${operation.purpose}`
        );
      }
    }
    
    // Log personal data processing
    await this.auditLogger.logPersonalDataProcessing({
      userId: context.user.id,
      operation: context.command,
      legalBasis: 'consent',
      timestamp: new Date()
    });
  }
}
```

### Validation Middleware

```typescript
class ValidationMiddleware implements Middleware {
  private schemas = new Map<string, Joi.Schema>();
  
  constructor() {
    this.initializeSchemas();
  }
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    const schema = this.schemas.get(context.command);
    
    if (schema) {
      // Validate command arguments
      const { error, value } = schema.validate({
        args: context.args,
        options: context.options
      });
      
      if (error) {
        throw new ValidationError(
          `Invalid command arguments: ${error.details[0].message}`
        );
      }
      
      // Update context with validated values
      context.args = value.args;
      context.options = value.options;
    }
    
    // Norwegian specific validations
    await this.applyNorwegianValidations(context);
    
    return next(context);
  }
  
  private initializeSchemas(): void {
    // Generate command schema
    this.schemas.set('generate', Joi.object({
      args: Joi.array().items(Joi.string()).min(1).required(),
      options: Joi.object({
        platform: Joi.string().valid('react', 'vue', 'angular', 'svelte'),
        compliance: Joi.string().valid('nsm', 'gdpr', 'wcag'),
        output: Joi.string(),
        overwrite: Joi.boolean().default(false)
      })
    }));
    
    // Create command schema
    this.schemas.set('create', Joi.object({
      args: Joi.array().items(Joi.string()).length(1).required(),
      options: Joi.object({
        template: Joi.string(),
        features: Joi.array().items(Joi.string()),
        skipInstall: Joi.boolean().default(false)
      })
    }));
  }
  
  private async applyNorwegianValidations(context: CommandContext): Promise<void> {
    // Validate Norwegian personal numbers if present
    const personalNumbers = this.extractPersonalNumbers(context.args);
    for (const number of personalNumbers) {
      if (!this.isValidNorwegianPersonalNumber(number)) {
        throw new ValidationError(`Invalid Norwegian personal number: ${number}`);
      }
    }
    
    // Validate organization numbers
    const orgNumbers = this.extractOrganizationNumbers(context.args);
    for (const number of orgNumbers) {
      if (!this.isValidNorwegianOrganizationNumber(number)) {
        throw new ValidationError(`Invalid Norwegian organization number: ${number}`);
      }
    }
  }
}
```

### Logging Middleware

```typescript
class LoggingMiddleware implements Middleware {
  constructor(private logger: Logger) {}
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Add request ID to context
    context.metadata.requestId = requestId;
    
    // Log request start
    this.logger.info('Command execution started', {
      requestId,
      command: context.command,
      userId: context.user?.id,
      sessionId: context.session?.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      const result = await next(context);
      
      // Log successful completion
      this.logger.info('Command execution completed', {
        requestId,
        command: context.command,
        duration: Date.now() - startTime,
        success: true
      });
      
      return result;
    } catch (error) {
      // Log error
      this.logger.error('Command execution failed', {
        requestId,
        command: context.command,
        duration: Date.now() - startTime,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Rate Limiting Middleware

```typescript
class RateLimitingMiddleware implements Middleware {
  private rateLimiter: RateLimiterFlexible;
  
  constructor(config: RateLimitConfig) {
    this.rateLimiter = new RateLimiterFlexible({
      keyGen: (context: CommandContext) => `${context.user.id}:${context.command}`,
      points: config.maxRequests,
      duration: config.windowMs,
      blockDuration: config.blockDurationMs
    });
  }
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    try {
      // Check rate limit
      await this.rateLimiter.consume(context);
      
      return next(context);
    } catch (rejRes) {
      // Rate limit exceeded
      const msBeforeNext = rejRes.msBeforeNext || 1000;
      
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.round(msBeforeNext / 1000)} seconds.`
      );
    }
  }
}
```

### Caching Middleware

```typescript
class CachingMiddleware implements Middleware {
  constructor(
    private cacheProvider: CacheProvider,
    private config: CacheConfig
  ) {}
  
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    // Check if command is cacheable
    if (!this.isCacheable(context.command)) {
      return next(context);
    }
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(context);
    
    // Try to get from cache
    const cached = await this.cacheProvider.get(cacheKey);
    if (cached) {
      context.metadata.cacheHit = true;
      context.result = cached;
      return context;
    }
    
    // Execute command
    const result = await next(context);
    
    // Cache the result
    if (result.success && this.shouldCache(result)) {
      await this.cacheProvider.set(
        cacheKey,
        result,
        this.getTTL(context.command)
      );
    }
    
    return result;
  }
  
  private generateCacheKey(context: CommandContext): string {
    const keyParts = [
      context.command,
      JSON.stringify(context.args),
      JSON.stringify(context.options),
      context.user.id
    ];
    
    return `cache:${this.hashString(keyParts.join(':'))}`;
  }
}
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each middleware has a single, focused responsibility
- Authentication middleware only handles authentication
- Validation middleware only handles input validation
- Clear separation of concerns

### Open/Closed Principle (OCP)
- New middleware can be added without modifying existing ones
- Middleware chain is extensible through configuration
- Plugin architecture for custom middleware

### Liskov Substitution Principle (LSP)
- All middleware implement the same interface
- Middleware can be substituted without breaking the chain
- Consistent error handling and response formats

### Interface Segregation Principle (ISP)
- Middleware interface is minimal and focused
- Optional features through separate interfaces
- No dependency on unused methods

### Dependency Inversion Principle (DIP)
- Middleware depends on abstractions (interfaces)
- Concrete implementations injected through configuration
- Easy testing through dependency injection

## Testing

### Unit Tests

```typescript
describe('AuthenticationMiddleware', () => {
  let middleware: AuthenticationMiddleware;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    mockUserService = {
      getUser: jest.fn(),
      validateSession: jest.fn()
    } as any;
    
    middleware = new AuthenticationMiddleware({
      userService: mockUserService,
      requiredLevel: 'authenticated'
    });
  });
  
  it('should authenticate valid user session', async () => {
    const context = createTestContext();
    const next = jest.fn().mockResolvedValue(context);
    
    mockUserService.validateSession.mockResolvedValue({ valid: true, userId: 'user-123' });
    mockUserService.getUser.mockResolvedValue({ id: 'user-123', active: true });
    
    const result = await middleware.execute(context, next);
    
    expect(result.user).toBeDefined();
    expect(next).toHaveBeenCalledWith(context);
  });
  
  it('should reject invalid session', async () => {
    const context = createTestContext();
    const next = jest.fn();
    
    mockUserService.validateSession.mockResolvedValue({ valid: false });
    
    await expect(middleware.execute(context, next)).rejects.toThrow(AuthenticationError);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Middleware Chain Integration', () => {
  it('should execute full middleware chain successfully', async () => {
    const chain = new MiddlewareChain([
      new LoggingMiddleware(),
      new AuthenticationMiddleware(),
      new ValidationMiddleware(),
      new ComplianceMiddleware()
    ]);
    
    const context = createValidTestContext();
    const result = await chain.execute(context);
    
    expect(result.success).toBe(true);
    expect(result.metadata.requestId).toBeDefined();
    expect(result.metadata.nsmClassification).toBeDefined();
  });
});
```

## Performance Considerations

### Middleware Ordering
- Fast-failing middleware first (authentication, rate limiting)
- Expensive operations last (compliance checks, validation)
- Caching middleware early to short-circuit processing

### Async Processing
- Parallel execution where possible
- Non-blocking I/O operations
- Proper error handling to prevent blocking

### Memory Management
- Clean up context after processing
- Efficient caching strategies
- Proper resource disposal

## Extension Points

### Custom Middleware Development

```typescript
class CustomMiddleware implements Middleware {
  async execute(context: CommandContext, next: NextFunction): Promise<CommandContext> {
    // Pre-processing logic
    await this.preProcess(context);
    
    try {
      // Execute next middleware
      const result = await next(context);
      
      // Post-processing logic
      await this.postProcess(result, context);
      
      return result;
    } catch (error) {
      // Error handling logic
      await this.handleError(error, context);
      throw error;
    }
  }
  
  private async preProcess(context: CommandContext): Promise<void> {
    // Custom pre-processing logic
  }
  
  private async postProcess(result: any, context: CommandContext): Promise<void> {
    // Custom post-processing logic
  }
  
  private async handleError(error: Error, context: CommandContext): Promise<void> {
    // Custom error handling logic
  }
}
```

### Middleware Configuration

```typescript
interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  order: number;
  options: any;
}

class MiddlewareManager {
  private middleware = new Map<string, Middleware>();
  
  register(name: string, middleware: Middleware): void {
    this.middleware.set(name, middleware);
  }
  
  buildChain(configs: MiddlewareConfig[]): MiddlewareChain {
    const orderedConfigs = configs
      .filter(c => c.enabled)
      .sort((a, b) => a.order - b.order);
    
    const middlewares = orderedConfigs.map(config => {
      const middleware = this.middleware.get(config.name);
      if (!middleware) {
        throw new Error(`Unknown middleware: ${config.name}`);
      }
      return middleware;
    });
    
    return new MiddlewareChain(middlewares);
  }
}
```

## Contributing

### Development Guidelines
1. Follow single responsibility principle
2. Implement proper error handling
3. Add comprehensive logging
4. Include Norwegian compliance considerations
5. Write unit and integration tests
6. Document middleware purpose and usage
7. Consider performance implications

### Middleware Development Checklist
- [ ] Implements Middleware interface
- [ ] Has single, clear responsibility
- [ ] Includes error handling
- [ ] Adds appropriate logging
- [ ] Considers Norwegian compliance
- [ ] Has comprehensive tests
- [ ] Documents configuration options
- [ ] Handles async operations properly
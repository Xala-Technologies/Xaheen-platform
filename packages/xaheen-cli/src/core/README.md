# Core Module

## Overview

The Core module is the foundational infrastructure of the Xaheen CLI. It provides essential services, abstractions, and patterns that all other modules depend on. Built with SOLID principles, the core module implements dependency injection, service registration, command parsing, configuration management, and plugin architecture.

## Architecture

The core module follows layered architecture with clear separation of concerns:

- **Bootstrap Layer**: Application initialization and setup
- **Command Layer**: Command parsing and execution
- **Service Layer**: Core service implementations
- **Registry Layer**: Service discovery and registration
- **Configuration Layer**: Configuration management
- **Plugin Layer**: Plugin system and extensibility
- **Container Layer**: Dependency injection container

## Core Components

### 1. Bootstrap (`bootstrap/`)

Application initialization and service configuration:

#### Service Configurator
Configures and initializes all core services:

```typescript
export class ServiceConfigurator {
  private container = new Container();
  private config: ServiceConfig;

  async configure(): Promise<void> {
    // Load configuration
    this.config = await this.loadConfiguration();
    
    // Register core services
    await this.registerCoreServices();
    
    // Configure services
    await this.configureServices();
    
    // Initialize plugins
    await this.initializePlugins();
  }

  private async registerCoreServices(): Promise<void> {
    this.container.register('FileSystemService', FileSystemService);
    this.container.register('LoggerService', LoggerService);
    this.container.register('TemplateEngineService', TemplateEngineService);
    this.container.register('ProjectAnalyzerService', ProjectAnalyzerService);
  }
}
```

### 2. Command Parser (`command-parser/`)

Advanced command parsing with factory pattern and type safety:

#### Command Parser Architecture
```typescript
export interface CommandParser {
  parse(input: string[]): ParsedCommand;
  validate(command: ParsedCommand): ValidationResult;
  execute(command: ParsedCommand): Promise<CommandResult>;
}

export class AdvancedCommandParser implements CommandParser {
  private commandFactory: CommandHandlerFactory;
  private validators: Map<string, CommandValidator>;

  constructor(
    factory: CommandHandlerFactory,
    validators: CommandValidator[]
  ) {
    this.commandFactory = factory;
    this.validators = new Map(
      validators.map(v => [v.commandType, v])
    );
  }

  parse(input: string[]): ParsedCommand {
    const [command, ...args] = input;
    const options = this.parseOptions(args);
    
    return {
      name: command,
      arguments: this.parseArguments(args),
      options,
      flags: this.parseFlags(args)
    };
  }
}
```

#### Command Handler Factory
Creates appropriate command handlers based on command type:

```typescript
export class CommandHandlerFactory {
  private handlers = new Map<string, CommandHandlerConstructor>();

  register(commandType: string, handler: CommandHandlerConstructor): void {
    this.handlers.set(commandType, handler);
  }

  create(commandType: string): BaseCommandHandler | null {
    const HandlerClass = this.handlers.get(commandType);
    return HandlerClass ? new HandlerClass() : null;
  }
}

export abstract class BaseCommandHandler {
  abstract execute(args: CommandArgs): Promise<CommandResult>;
  
  protected validate(args: CommandArgs): ValidationResult {
    // Common validation logic
  }
  
  protected formatOutput(result: any): string {
    // Common output formatting
  }
}
```

### 3. Configuration Manager (`config-manager/`)

Centralized configuration management with environment support:

```typescript
export interface ConfigurationManager {
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  load(source: ConfigSource): Promise<void>;
  validate(): ValidationResult;
}

export class AdvancedConfigurationManager implements ConfigurationManager {
  private config = new Map<string, any>();
  private schema: ConfigSchema;
  private sources: ConfigSource[] = [];

  async load(source: ConfigSource): Promise<void> {
    const data = await source.load();
    this.mergeConfig(data);
    this.sources.push(source);
  }

  get<T>(key: string): T {
    const value = this.getNestedValue(this.config, key);
    return this.resolveEnvironmentVariables(value);
  }

  private resolveEnvironmentVariables(value: any): any {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const envVar = value.slice(2, -1);
      return process.env[envVar] || value;
    }
    return value;
  }
}
```

### 4. Container (`container/`)

Dependency injection container with lifecycle management:

```typescript
export interface Container {
  register<T>(token: string, implementation: Constructor<T>): void;
  registerInstance<T>(token: string, instance: T): void;
  resolve<T>(token: string): T;
  createScope(): Container;
}

export class DependencyInjector implements Container {
  private services = new Map<string, ServiceDescriptor>();
  private instances = new Map<string, any>();
  private scopes = new Map<string, Container>();

  register<T>(token: string, implementation: Constructor<T>, lifecycle: ServiceLifecycle = 'transient'): void {
    this.services.set(token, {
      token,
      implementation,
      lifecycle,
      dependencies: this.getDependencies(implementation)
    });
  }

  resolve<T>(token: string): T {
    const descriptor = this.services.get(token);
    if (!descriptor) {
      throw new Error(`Service '${token}' not registered`);
    }

    if (descriptor.lifecycle === 'singleton' && this.instances.has(token)) {
      return this.instances.get(token);
    }

    const instance = this.createInstance(descriptor);
    
    if (descriptor.lifecycle === 'singleton') {
      this.instances.set(token, instance);
    }

    return instance;
  }

  private createInstance<T>(descriptor: ServiceDescriptor): T {
    const dependencies = descriptor.dependencies.map(dep => this.resolve(dep));
    return new descriptor.implementation(...dependencies);
  }
}
```

### 5. Services (`services/`)

Core service implementations:

#### File System Service
Abstracted file system operations:

```typescript
export interface FileSystemService {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  copyFile(source: string, destination: string): Promise<void>;
}

export class NodeFileSystemService implements FileSystemService {
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }
}
```

#### Logger Service
Structured logging with multiple levels and outputs:

```typescript
export interface LoggerService {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
}

export class StructuredLogger implements LoggerService {
  private transports: LogTransport[] = [];

  constructor(transports: LogTransport[]) {
    this.transports = transports;
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      service: 'xaheen-cli'
    };

    this.transports.forEach(transport => transport.log(logEntry));
  }
}
```

#### Template Engine Service
Template processing with caching and custom helpers:

```typescript
export interface TemplateEngineService {
  compile(template: string): CompiledTemplate;
  render(template: CompiledTemplate, data: any): string;
  registerHelper(name: string, helper: HelperFunction): void;
}

export class HandlebarsTemplateEngine implements TemplateEngineService {
  private handlebars: typeof Handlebars;
  private templateCache = new Map<string, CompiledTemplate>();

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerDefaultHelpers();
  }

  compile(template: string): CompiledTemplate {
    const hash = this.hashTemplate(template);
    
    if (this.templateCache.has(hash)) {
      return this.templateCache.get(hash)!;
    }

    const compiled = this.handlebars.compile(template);
    this.templateCache.set(hash, compiled);
    return compiled;
  }

  private registerDefaultHelpers(): void {
    this.registerHelper('camelCase', (str: string) => camelCase(str));
    this.registerHelper('pascalCase', (str: string) => pascalCase(str));
    this.registerHelper('kebabCase', (str: string) => kebabCase(str));
    this.registerHelper('snakeCase', (str: string) => snakeCase(str));
  }
}
```

#### Project Analyzer Service
Advanced project analysis and insights:

```typescript
export interface ProjectAnalyzerService {
  analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  detectFrameworks(projectPath: string): Promise<DetectedFramework[]>;
  analyzeComplexity(projectPath: string): Promise<ComplexityAnalysis>;
  generateInsights(analysis: ProjectAnalysis): Promise<ProjectInsights>;
}

export class AdvancedProjectAnalyzer implements ProjectAnalyzerService {
  async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    const packageJson = await this.readPackageJson(projectPath);
    const frameworks = await this.detectFrameworks(projectPath);
    const complexity = await this.analyzeComplexity(projectPath);
    const structure = await this.analyzeStructure(projectPath);

    return {
      projectPath,
      packageJson,
      frameworks,
      complexity,
      structure,
      recommendations: await this.generateRecommendations({
        frameworks,
        complexity,
        structure
      })
    };
  }
}
```

### 6. Registry (`registry/`)

Unified service registry for service discovery:

```typescript
export interface ServiceRegistry {
  register<T>(name: string, service: T, metadata?: ServiceMetadata): void;
  resolve<T>(name: string): T | undefined;
  list(category?: string): ServiceInfo[];
  health(): Promise<HealthStatus>;
}

export class UnifiedServiceRegistry implements ServiceRegistry {
  private services = new Map<string, RegisteredService>();
  private metadata = new Map<string, ServiceMetadata>();
  private healthCheckers = new Map<string, HealthChecker>();

  register<T>(name: string, service: T, metadata?: ServiceMetadata): void {
    this.services.set(name, { name, service, registeredAt: Date.now() });
    
    if (metadata) {
      this.metadata.set(name, metadata);
    }

    if (this.hasHealthCheck(service)) {
      this.healthCheckers.set(name, service as any);
    }
  }

  resolve<T>(name: string): T | undefined {
    const registered = this.services.get(name);
    return registered?.service as T;
  }

  async health(): Promise<HealthStatus> {
    const checks = await Promise.allSettled(
      Array.from(this.healthCheckers.entries()).map(
        async ([name, checker]) => ({
          service: name,
          status: await checker.health()
        })
      )
    );

    return {
      overall: this.calculateOverallHealth(checks),
      services: checks.map(check => 
        check.status === 'fulfilled' ? check.value : {
          service: 'unknown',
          status: { healthy: false, error: 'Health check failed' }
        }
      )
    };
  }
}
```

### 7. Modern CLI (`modern-cli/`)

Advanced CLI features with fuzzy matching and orchestration:

#### Command Orchestrator
Orchestrates complex command workflows:

```typescript
export class CommandOrchestrator {
  private commandRegistry: Map<string, CommandHandler> = new Map();
  private middlewares: Middleware[] = [];
  private fuzzyMatcher: FuzzyCommandMatcher;

  constructor() {
    this.fuzzyMatcher = new FuzzyCommandMatcher();
  }

  async executeCommand(input: string[]): Promise<CommandResult> {
    const parsedCommand = this.parseCommand(input);
    
    // Try exact match first
    let handler = this.commandRegistry.get(parsedCommand.name);
    
    // If no exact match, try fuzzy matching
    if (!handler) {
      const suggestion = this.fuzzyMatcher.findBestMatch(
        parsedCommand.name,
        Array.from(this.commandRegistry.keys())
      );
      
      if (suggestion) {
        handler = this.commandRegistry.get(suggestion.match);
        console.log(`Did you mean '${suggestion.match}'?`);
      }
    }

    if (!handler) {
      throw new Error(`Unknown command: ${parsedCommand.name}`);
    }

    // Execute middleware chain
    const context = { command: parsedCommand, handler };
    await this.executeMiddleware(context);

    return handler.execute(parsedCommand);
  }
}
```

#### Fuzzy Command Matcher
Intelligent command suggestion system:

```typescript
export class FuzzyCommandMatcher {
  findBestMatch(input: string, commands: string[]): MatchResult | null {
    const scores = commands.map(command => ({
      command,
      distance: this.levenshteinDistance(input.toLowerCase(), command.toLowerCase()),
      similarity: this.calculateSimilarity(input, command)
    }));

    const bestMatch = scores
      .filter(score => score.similarity > 0.6) // Minimum similarity threshold
      .sort((a, b) => b.similarity - a.similarity)[0];

    return bestMatch ? {
      match: bestMatch.command,
      similarity: bestMatch.similarity,
      suggestions: this.generateSuggestions(input, commands)
    } : null;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }
}
```

### 8. Interfaces (`interfaces/`)

Core interface definitions and contracts:

```typescript
export interface GeneratorConfig {
  readonly name: string;
  readonly type: string;
  readonly platform?: Platform;
  readonly options: GeneratorOptions;
  readonly outputPath: string;
  readonly templateOverrides?: TemplateOverrides;
}

export interface ServiceMetadata {
  readonly version: string;
  readonly description: string;
  readonly dependencies: string[];
  readonly category: ServiceCategory;
  readonly healthCheck?: boolean;
}

export interface CommandResult {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: any;
  readonly error?: Error;
  readonly nextSteps?: string[];
}
```

## Plugin System

The core module provides a robust plugin architecture:

### Plugin Interface
```typescript
export interface Plugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
  
  registerCommands?(): CommandRegistration[];
  registerServices?(): ServiceRegistration[];
  registerGenerators?(): GeneratorRegistration[];
}

export interface PluginContext {
  readonly container: Container;
  readonly logger: LoggerService;
  readonly config: ConfigurationManager;
  readonly registry: ServiceRegistry;
}
```

### Plugin Manager
```typescript
export class PluginManager {
  private plugins = new Map<string, LoadedPlugin>();
  private pluginPaths: string[] = [];

  async loadPlugin(pluginPath: string): Promise<void> {
    const pluginModule = await import(pluginPath);
    const plugin = pluginModule.default as Plugin;

    const context: PluginContext = {
      container: this.container,
      logger: this.logger,
      config: this.config,
      registry: this.registry
    };

    await plugin.initialize(context);

    // Register plugin capabilities
    this.registerPluginCommands(plugin);
    this.registerPluginServices(plugin);
    this.registerPluginGenerators(plugin);

    this.plugins.set(plugin.name, {
      plugin,
      path: pluginPath,
      loadedAt: Date.now()
    });
  }
}
```

## Error Handling

The core module implements comprehensive error handling:

```typescript
export class CoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CoreError';
  }
}

export class ErrorHandler {
  static handle(error: Error): never {
    if (error instanceof CoreError) {
      console.error(`[${error.code}] ${error.message}`);
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    process.exit(1);
  }
}
```

## Performance Optimization

### Lazy Loading
Services are loaded on-demand to improve startup time:

```typescript
export class LazyServiceLoader {
  private loadedServices = new Set<string>();
  private serviceFactories = new Map<string, () => Promise<any>>();

  registerFactory(name: string, factory: () => Promise<any>): void {
    this.serviceFactories.set(name, factory);
  }

  async loadService(name: string): Promise<any> {
    if (this.loadedServices.has(name)) {
      return this.container.resolve(name);
    }

    const factory = this.serviceFactories.get(name);
    if (!factory) {
      throw new Error(`No factory registered for service: ${name}`);
    }

    const service = await factory();
    this.container.registerInstance(name, service);
    this.loadedServices.add(name);
    
    return service;
  }
}
```

### Caching
Intelligent caching for frequently accessed resources:

```typescript
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.ttl
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
}
```

## Testing Strategy

### Core Module Testing
```typescript
describe('Core Module', () => {
  describe('DependencyInjector', () => {
    it('should resolve dependencies correctly', () => {
      const container = new DependencyInjector();
      container.register('TestService', TestService);
      
      const service = container.resolve<TestService>('TestService');
      expect(service).toBeInstanceOf(TestService);
    });

    it('should handle singleton lifecycle', () => {
      const container = new DependencyInjector();
      container.register('SingletonService', SingletonService, 'singleton');
      
      const instance1 = container.resolve('SingletonService');
      const instance2 = container.resolve('SingletonService');
      
      expect(instance1).toBe(instance2);
    });
  });
});
```

## Best Practices

1. **Separation of Concerns**: Each core component has a single responsibility
2. **Dependency Injection**: Use DI for loose coupling and testability
3. **Interface-based Design**: Program to interfaces, not implementations
4. **Error Handling**: Implement comprehensive error handling throughout
5. **Performance**: Optimize for startup time and runtime performance
6. **Extensibility**: Design for extensibility through plugins and interfaces
7. **Testing**: Maintain high test coverage for all core components

## Future Enhancements

- **Microkernel Architecture**: More modular plugin-based architecture
- **Hot Reloading**: Runtime service and plugin reloading
- **Distributed Services**: Support for distributed service architectures
- **Advanced Caching**: Redis-based distributed caching
- **Metrics Collection**: Built-in metrics and observability
- **Configuration Hot-Reload**: Runtime configuration updates
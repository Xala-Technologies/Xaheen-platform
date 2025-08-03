# CLI v2 Architecture Documentation

Comprehensive technical architecture documentation for Xaheen CLI v2's service-based system.

## System Overview

Xaheen CLI v2 implements a sophisticated service-based architecture built on SOLID principles, providing a scalable and maintainable foundation for enterprise-grade project generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Xaheen CLI v2                            │
├─────────────────────────────────────────────────────────────────┤
│  Command Layer (Commander.js + Clack Prompts)                  │
├─────────────────────────────────────────────────────────────────┤
│  Service Registry     │  Bundle Resolver   │  Project Analyzer  │
│  ┌─────────────────┐  │  ┌───────────────┐ │  ┌──────────────┐  │
│  │ Template Factory│  │  │ Dependency    │ │  │ Config       │  │
│  │ Template Repo   │  │  │ Management    │ │  │ Detection    │  │
│  │ Service Config  │  │  │ Bundle Config │ │  │ Health Check │  │
│  └─────────────────┘  │  └───────────────┘ │  └──────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Service Injector     │  Project Validator │  Template Loader  │
│  ┌─────────────────┐  │  ┌───────────────┐ │  ┌──────────────┐  │
│  │ File Generation │  │  │ Auto-fix      │ │  │ Handlebars   │  │
│  │ Parallel Proc   │  │  │ Compliance    │ │  │ Processing   │  │
│  │ Dep Installation│  │  │ Performance   │ │  │ File System  │  │
│  └─────────────────┘  │  └───────────────┘ │  └──────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Core Infrastructure                                           │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ File System     │  │ Package Mgmt  │  │ Process Manager  │  │
│  │ Template Cache  │  │ Registry API  │  │ Error Handling   │  │
│  │ Config Storage  │  │ Version Mgmt  │  │ Analytics        │  │
│  └─────────────────┘  └───────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each component has a single, well-defined responsibility:

```typescript
// Service Registry - Manages service templates
class ServiceRegistry implements IServiceRegistry {
  private repository: ITemplateRepository;
  
  async getTemplate(serviceType: ServiceType, provider: string): Promise<ServiceTemplate | null>
  async listTemplates(serviceType: ServiceType): Promise<ServiceTemplate[]>
  async registerTemplate(template: ServiceTemplate): Promise<void>
}

// Bundle Resolver - Resolves service combinations  
class BundleResolver implements IBundleResolver {
  private serviceRegistry: IServiceRegistry;
  
  async resolveBundle(bundle: ServiceBundle, options: any): Promise<BundleResolutionResult>
  async loadBundleByName(name: string): Promise<ServiceBundle | null>
  async createCustomBundle(services: string[]): Promise<ServiceBundle>
}

// Service Injector - Injects services into projects
class ServiceInjector implements IServiceInjector {
  async injectServices(services: ServiceConfiguration[], projectPath: string): Promise<InjectionResult>
  async removeService(serviceId: string, projectPath: string): Promise<RemovalResult>
}
```

### Open/Closed Principle (OCP)

The system is open for extension but closed for modification:

```typescript
// New service providers can be added without modifying existing code
interface IServiceProvider {
  readonly type: ServiceType;
  readonly provider: string;
  readonly version: string;
  
  generateTemplate(config: ServiceConfig): Promise<ServiceTemplate>;
  validateConfiguration(config: ServiceConfig): Promise<ValidationResult>;
  getDefaultConfiguration(): ServiceConfig;
}

// Example: Adding a new authentication provider
class Auth0Provider implements IServiceProvider {
  readonly type = 'auth' as const;
  readonly provider = 'auth0';
  readonly version = '2.0.0';
  
  async generateTemplate(config: ServiceConfig): Promise<ServiceTemplate> {
    // Auth0-specific template generation
  }
}

// Register new provider without modifying core system
serviceRegistry.registerProvider(new Auth0Provider());
```

### Liskov Substitution Principle (LSP)

Service providers are completely interchangeable:

```typescript
// All auth providers implement the same interface
interface IAuthProvider extends IServiceProvider {
  type: 'auth';
  generateAuthConfig(): AuthConfiguration;
  generateAuthComponents(): ComponentTemplate[];
  generateAuthMiddleware(): MiddlewareTemplate[];
}

// Any auth provider can be substituted
class ClerkProvider implements IAuthProvider { /* ... */ }
class BetterAuthProvider implements IAuthProvider { /* ... */ }
class BankIDProvider implements IAuthProvider { /* ... */ }

// Usage - any provider works the same way
function setupAuthentication(provider: IAuthProvider) {
  const config = provider.generateAuthConfig();
  const components = provider.generateAuthComponents();
  const middleware = provider.generateAuthMiddleware();
  // Implementation works regardless of specific provider
}
```

### Interface Segregation Principle (ISP)

Interfaces are focused and don't force unnecessary dependencies:

```typescript
// Focused interfaces for different concerns
interface ITemplateRepository {
  getTemplate(type: ServiceType, provider: string): Promise<ServiceTemplate | null>;
  getAllTemplates(): ServiceTemplate[];
  validateTemplate(template: ServiceTemplate): boolean;
}

interface ITemplateFactory {
  createTemplate(type: ServiceType, provider: string, config: ServiceConfig): ServiceTemplate;
  createBundleTemplate(bundle: ServiceBundle): BundleTemplate;
}

interface IProjectAnalyzer {
  analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  detectServices(projectPath: string): Promise<DetectedService[]>;
  generateHealthReport(analysis: ProjectAnalysis): HealthReport;
}

// Services only depend on interfaces they actually use
class ProjectValidator {
  constructor(
    private analyzer: IProjectAnalyzer,  // Only needs analysis functionality
    private registry: IServiceRegistry  // Only needs registry functionality
  ) {}
}
```

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not concretions:

```typescript
// High-level orchestrator depends on abstractions
class ProjectScaffolder {
  constructor(
    private registry: IServiceRegistry,    // Abstraction
    private resolver: IBundleResolver,     // Abstraction
    private injector: IServiceInjector     // Abstraction
  ) {}
  
  async createProject(config: ProjectConfig): Promise<ScaffoldingResult> {
    // Use abstractions, not concrete implementations
    const bundle = await this.resolver.loadBundleByName(config.preset);
    const resolution = await this.resolver.resolveBundle(bundle);
    const result = await this.injector.injectServices(resolution.resolvedServices, config.projectPath);
    return result;
  }
}

// Concrete implementations are injected
const registry = new ServiceRegistry();
const resolver = new BundleResolver(registry);
const injector = new ServiceInjector();
const scaffolder = new ProjectScaffolder(registry, resolver, injector);
```

## Core Components

### Service Registry

The Service Registry manages all available service templates and providers.

```typescript
interface IServiceRegistry {
  // Template management
  getTemplate(serviceType: ServiceType, provider: string): Promise<ServiceTemplate | null>;
  listTemplates(serviceType?: ServiceType): Promise<ServiceTemplate[]>;
  registerTemplate(template: ServiceTemplate): Promise<void>;
  
  // Service management
  getService(serviceType: ServiceType, provider: string): Promise<ServiceConfiguration | null>;
  listServices(serviceType?: ServiceType): Promise<ServiceConfiguration[]>;
  
  // Validation and search
  validateTemplate(template: ServiceTemplate): Promise<boolean>;
  searchTemplates(query: string): Promise<ServiceTemplate[]>;
  getCompatibleTemplates(serviceType: ServiceType, framework: string): Promise<ServiceTemplate[]>;
}

class ServiceRegistry implements IServiceRegistry {
  private repository: ITemplateRepository;
  private services: Map<string, ServiceConfiguration> = new Map();
  
  async initialize(): Promise<void> {
    // Load and validate all templates
    const templates = this.repository.getAllTemplates();
    for (const template of templates) {
      if (this.repository.validateTemplate(template)) {
        const config = this.createServiceConfiguration(template);
        this.services.set(`${template.type}:${template.provider}`, config);
      }
    }
  }
}
```

### Template Factory

Creates service templates dynamically based on configuration.

```typescript
class TemplateFactory implements ITemplateFactory {
  createTemplate(type: ServiceType, provider: string, config: ServiceConfig): ServiceTemplate {
    return {
      id: `${type}-${provider}-${Date.now()}`,
      name: `${type}-${provider}`,
      type,
      provider,
      version: config.version || 'latest',
      description: config.description || `${provider} ${type} service`,
      
      // File templates
      files: this.generateFileTemplates(type, provider, config),
      
      // Dependencies
      dependencies: this.resolveDependencies(type, provider, config),
      
      // Environment variables
      envVariables: this.generateEnvVariables(type, provider, config),
      
      // Post-injection steps
      postInjectionSteps: this.generatePostSteps(type, provider, config),
      
      // Validation rules
      validationRules: this.generateValidationRules(type, provider, config),
      
      // Framework compatibility
      frameworks: this.getCompatibleFrameworks(type, provider),
      
      // Tags and metadata
      tags: this.generateTags(type, provider, config),
      category: this.categorizeService(type),
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private generateFileTemplates(type: ServiceType, provider: string, config: ServiceConfig): FileTemplate[] {
    const basePath = path.join(__dirname, '../templates', type, provider);
    return this.loadTemplateFiles(basePath, config);
  }
}
```

### Bundle Resolver

Resolves service bundles and manages dependencies.

```typescript
interface IBundleResolver {
  resolveBundle(bundle: ServiceBundle, options?: any): Promise<BundleResolutionResult>;
  loadBundleByName(name: string): Promise<ServiceBundle | null>;
  createCustomBundle(services: string[]): Promise<ServiceBundle>;
}

class BundleResolver implements IBundleResolver {
  private bundles: Map<string, ServiceBundle> = new Map();
  
  async resolveBundle(bundle: ServiceBundle, options: any = {}): Promise<BundleResolutionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const resolvedServices: ServiceConfiguration[] = [];
    
    // Resolve each service in the bundle
    for (const serviceRef of bundle.services) {
      try {
        const template = await this.serviceRegistry.getTemplate(serviceRef.serviceType, serviceRef.provider);
        
        if (!template) {
          if (serviceRef.required) {
            errors.push(`Required service not found: ${serviceRef.serviceType}:${serviceRef.provider}`);
          } else {
            warnings.push(`Optional service not found: ${serviceRef.serviceType}:${serviceRef.provider}`);
          }
          continue;
        }
        
        // Validate framework compatibility
        if (options.targetFramework && !this.isCompatible(template, options.targetFramework)) {
          warnings.push(`Service ${serviceRef.serviceType} may not be compatible with ${options.targetFramework}`);
        }
        
        const serviceConfig = this.createServiceConfiguration(template, serviceRef);
        resolvedServices.push(serviceConfig);
        
      } catch (error) {
        errors.push(`Failed to resolve ${serviceRef.serviceType}: ${error.message}`);
      }
    }
    
    // Sort services by priority and dependencies
    const sortedServices = this.sortServicesByDependencies(resolvedServices);
    
    return {
      bundleId: bundle.id,
      bundleName: bundle.name,
      bundleVersion: bundle.version,
      status: errors.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'success',
      resolvedServices: sortedServices,
      dependencies: this.collectDependencies(sortedServices),
      configuration: this.mergeConfigurations(sortedServices),
      deploymentInstructions: this.generateDeploymentInstructions(bundle, sortedServices),
      postInstallSteps: this.collectPostInstallSteps(sortedServices),
      verificationSteps: this.generateVerificationSteps(sortedServices),
      errors,
      warnings,
      resolutionTime: Date.now() - startTime,
      resolvedAt: new Date()
    };
  }
}
```

### Service Injector

Injects services into projects with parallel processing.

```typescript
interface IServiceInjector {
  injectServices(services: ServiceConfiguration[], projectPath: string): Promise<InjectionResult>;
  removeService(serviceId: string, projectPath: string): Promise<RemovalResult>;
  validateInjection(services: ServiceConfiguration[], projectPath: string): Promise<ValidationResult>;
}

class ServiceInjector implements IServiceInjector {
  private concurrencyLimit = 5; // Parallel processing limit
  
  async injectServices(services: ServiceConfiguration[], projectPath: string): Promise<InjectionResult> {
    const startTime = Date.now();
    const results: ServiceInjectionResult[] = [];
    const errors: string[] = [];
    
    // Process services in parallel with concurrency limit
    const limit = pLimit(this.concurrencyLimit);
    const injectionPromises = services.map(service => 
      limit(() => this.injectSingleService(service, projectPath))
    );
    
    const injectionResults = await Promise.allSettled(injectionPromises);
    
    for (const [index, result] of injectionResults.entries()) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(`Failed to inject ${services[index].serviceType}: ${result.reason.message}`);
      }
    }
    
    // Post-processing steps
    await this.runPostInjectionSteps(services, projectPath);
    await this.updateProjectConfiguration(services, projectPath);
    await this.installDependencies(services, projectPath);
    
    return {
      success: errors.length === 0,
      injectedServices: results,
      errors,
      injectionTime: Date.now() - startTime,
      projectPath
    };
  }
  
  private async injectSingleService(service: ServiceConfiguration, projectPath: string): Promise<ServiceInjectionResult> {
    const template = service.configuration as ServiceTemplate;
    const injectedFiles: string[] = [];
    const modifiedFiles: string[] = [];
    
    // Generate files from templates
    for (const fileTemplate of template.files) {
      const outputPath = this.resolveOutputPath(fileTemplate.path, projectPath, service);
      
      if (fileTemplate.action === 'create') {
        const content = await this.processTemplate(fileTemplate, service);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, content);
        injectedFiles.push(outputPath);
        
      } else if (fileTemplate.action === 'modify') {
        const existingContent = await fs.readFile(outputPath, 'utf-8');
        const modifiedContent = await this.modifyFile(existingContent, fileTemplate, service);
        await fs.writeFile(outputPath, modifiedContent);
        modifiedFiles.push(outputPath);
        
      } else if (fileTemplate.action === 'merge') {
        const existingConfig = await this.loadConfig(outputPath);
        const mergedConfig = this.mergeConfigurations(existingConfig, fileTemplate.content, service);
        await this.saveConfig(outputPath, mergedConfig);
        modifiedFiles.push(outputPath);
      }
    }
    
    return {
      serviceId: service.serviceId,
      serviceType: service.serviceType,
      provider: service.provider,
      success: true,
      injectedFiles,
      modifiedFiles,
      injectionTime: process.hrtime()[1] / 1000000 // nanoseconds to milliseconds
    };
  }
}
```

### Project Analyzer

Analyzes projects for configuration detection and health checking.

```typescript
interface IProjectAnalyzer {
  analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  detectServices(projectPath: string): Promise<DetectedService[]>;
  generateHealthReport(analysis: ProjectAnalysis): HealthReport;
  detectFramework(projectPath: string): Promise<string | null>;
  detectPackageManager(projectPath: string): Promise<string>;
}

class ProjectAnalyzer implements IProjectAnalyzer {
  async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    const [
      packageJson,
      detectedServices,
      framework,
      packageManager,
      environmentVariables,
      configFiles
    ] = await Promise.all([
      this.analyzePackageJson(projectPath),
      this.detectServices(projectPath),
      this.detectFramework(projectPath),
      this.detectPackageManager(projectPath),
      this.analyzeEnvironmentVariables(projectPath),
      this.analyzeConfigFiles(projectPath)
    ]);
    
    return {
      projectPath,
      packageJson,
      detectedServices,
      framework,
      packageManager,
      environmentVariables,
      configFiles,
      healthScore: this.calculateHealthScore(detectedServices, environmentVariables, configFiles),
      recommendations: this.generateRecommendations(detectedServices, framework),
      analyzedAt: new Date()
    };
  }
  
  async detectServices(projectPath: string): Promise<DetectedService[]> {
    const services: DetectedService[] = [];
    
    // Detect from package.json dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const [dep, version] of Object.entries(dependencies)) {
        const service = this.mapDependencyToService(dep as string, version as string);
        if (service) {
          services.push(service);
        }
      }
    }
    
    // Detect from file patterns
    const filePatterns = this.getServiceFilePatterns();
    for (const [pattern, serviceInfo] of filePatterns) {
      const matches = await glob(pattern, { cwd: projectPath });
      if (matches.length > 0) {
        services.push({
          type: serviceInfo.type,
          provider: serviceInfo.provider,
          confidence: 0.8,
          detectionMethod: 'file-pattern',
          files: matches
        });
      }
    }
    
    // Detect from configuration files
    const configServices = await this.detectFromConfigFiles(projectPath);
    services.push(...configServices);
    
    return this.deduplicateServices(services);
  }
}
```

## Template System

### Template Processing

The template system uses Handlebars for dynamic content generation with custom helpers.

```typescript
class TemplateProcessor {
  private handlebars: typeof Handlebars;
  
  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }
  
  async processTemplate(template: FileTemplate, context: ServiceConfiguration): Promise<string> {
    const templateContent = await fs.readFile(template.templatePath, 'utf-8');
    const compiledTemplate = this.handlebars.compile(templateContent);
    
    const processedContext = await this.buildTemplateContext(context);
    return compiledTemplate(processedContext);
  }
  
  private registerHelpers(): void {
    // Conditional helpers
    this.handlebars.registerHelper('if_eq', (a, b, options) => {
      return a === b ? options.fn(this) : options.inverse(this);
    });
    
    this.handlebars.registerHelper('if_contains', (array, value, options) => {
      return Array.isArray(array) && array.includes(value) ? options.fn(this) : options.inverse(this);
    });
    
    // String helpers
    this.handlebars.registerHelper('camelCase', (str) => lodash.camelCase(str));
    this.handlebars.registerHelper('pascalCase', (str) => lodash.upperFirst(lodash.camelCase(str)));
    this.handlebars.registerHelper('kebabCase', (str) => lodash.kebabCase(str));
    this.handlebars.registerHelper('snakeCase', (str) => lodash.snakeCase(str));
    
    // Code generation helpers
    this.handlebars.registerHelper('importStatement', (moduleName, namedImports, defaultImport) => {
      let statement = 'import ';
      if (defaultImport) statement += defaultImport;
      if (namedImports && namedImports.length > 0) {
        if (defaultImport) statement += ', ';
        statement += `{ ${namedImports.join(', ')} }`;
      }
      statement += ` from '${moduleName}';`;
      return new this.handlebars.SafeString(statement);
    });
    
    // Norwegian specific helpers
    this.handlebars.registerHelper('norwegianDate', (date) => {
      return new Intl.DateTimeFormat('nb-NO').format(date);
    });
    
    this.handlebars.registerHelper('norwegianCurrency', (amount) => {
      return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(amount);
    });
  }
  
  private async buildTemplateContext(service: ServiceConfiguration): Promise<any> {
    return {
      // Service configuration
      service: {
        type: service.serviceType,
        provider: service.provider,
        version: service.version,
        config: service.configuration
      },
      
      // Environment variables
      env: service.environmentVariables.reduce((acc, env) => {
        acc[env.name] = env.value;
        return acc;
      }, {} as Record<string, string>),
      
      // Dependencies
      dependencies: service.dependencies,
      
      // Project metadata
      project: {
        name: process.cwd().split('/').pop(),
        timestamp: new Date().toISOString(),
        generator: 'Xaheen CLI v2'
      },
      
      // Helper functions
      utils: {
        generateId: () => randomUUID(),
        timestamp: () => Date.now(),
        version: () => '2.0.2'
      }
    };
  }
}
```

### File Operations

```typescript
interface FileTemplate {
  path: string;
  templatePath: string;
  action: 'create' | 'modify' | 'merge';
  priority: number;
  conditions?: string[];
  permissions?: string;
}

class FileOperations {
  async createFile(filePath: string, content: string, permissions?: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    
    if (permissions) {
      await fs.chmod(filePath, permissions);
    }
  }
  
  async modifyFile(filePath: string, modifications: FileModification[]): Promise<void> {
    let content = await fs.readFile(filePath, 'utf-8');
    
    for (const mod of modifications) {
      switch (mod.type) {
        case 'insert':
          content = this.insertContent(content, mod.position, mod.content);
          break;
        case 'replace':
          content = content.replace(mod.pattern, mod.replacement);
          break;
        case 'append':
          content += mod.content;
          break;
        case 'prepend':
          content = mod.content + content;
          break;
      }
    }
    
    await fs.writeFile(filePath, content);
  }
  
  async mergeJsonFile(filePath: string, newData: any): Promise<void> {
    let existingData = {};
    
    if (await fs.pathExists(filePath)) {
      existingData = await fs.readJson(filePath);
    }
    
    const mergedData = lodash.merge(existingData, newData);
    await fs.writeJson(filePath, mergedData, { spaces: 2 });
  }
}
```

## Performance Optimizations

### Parallel Processing

```typescript
class ParallelProcessor {
  private concurrencyLimit: number;
  
  constructor(concurrencyLimit = 5) {
    this.concurrencyLimit = concurrencyLimit;
  }
  
  async processInParallel<T, R>(
    items: T[], 
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const limit = pLimit(this.concurrencyLimit);
    const promises = items.map(item => limit(() => processor(item)));
    return Promise.all(promises);
  }
}
```

### Caching System

```typescript
class TemplateCache {
  private cache: Map<string, { template: ServiceTemplate; timestamp: number }> = new Map();
  private cacheTimeout: number = 3600000; // 1 hour
  
  async getTemplate(key: string): Promise<ServiceTemplate | null> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.template;
    }
    
    return null;
  }
  
  setTemplate(key: string, template: ServiceTemplate): void {
    this.cache.set(key, {
      template,
      timestamp: Date.now()
    });
  }
  
  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Memory Management

```typescript
class MemoryManager {
  private maxMemoryUsage = 500 * 1024 * 1024; // 500MB
  
  checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > this.maxMemoryUsage) {
      consola.warn('High memory usage detected, running garbage collection');
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  async processWithMemoryLimit<T>(
    processor: () => Promise<T>
  ): Promise<T> {
    this.checkMemoryUsage();
    const result = await processor();
    this.checkMemoryUsage();
    return result;
  }
}
```

## Error Handling

### Error Types

```typescript
abstract class XaheenError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'user' | 'system' | 'network' | 'template';
  
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ServiceNotFoundError extends XaheenError {
  readonly code = 'E002';
  readonly category = 'user';
}

class TemplateProcessingError extends XaheenError {
  readonly code = 'E004';
  readonly category = 'template';
}

class DependencyConflictError extends XaheenError {
  readonly code = 'E005';
  readonly category = 'system';
}
```

### Error Recovery

```typescript
class ErrorRecovery {
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        consola.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
    
    throw new Error('Max retries exceeded');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Security Considerations

### Input Validation

```typescript
class InputValidator {
  private projectNamePattern = /^[a-zA-Z0-9-_]+$/;
  private serviceTypePattern = /^[a-z]+$/;
  private providerPattern = /^[a-z0-9-]+$/;
  
  validateProjectName(name: string): ValidationResult {
    if (!name || name.length === 0) {
      return { valid: false, error: 'Project name is required' };
    }
    
    if (name.length > 50) {
      return { valid: false, error: 'Project name too long (max 50 characters)' };
    }
    
    if (!this.projectNamePattern.test(name)) {
      return { valid: false, error: 'Project name contains invalid characters' };
    }
    
    return { valid: true };
  }
  
  sanitizePath(inputPath: string): string {
    // Remove dangerous path components
    return path.normalize(inputPath).replace(/\.\./g, '');
  }
}
```

### Template Security

```typescript
class TemplateSecurity {
  private dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /process\./,
    /global\./,
    /__dirname/,
    /__filename/
  ];
  
  validateTemplate(template: string): SecurityValidationResult {
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(template)) {
        return {
          safe: false,
          issue: `Potentially dangerous pattern detected: ${pattern.source}`
        };
      }
    }
    
    return { safe: true };
  }
}
```

## Monitoring and Observability

### Performance Metrics

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(operation: string): () => number {
    const start = process.hrtime.bigint();
    
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      this.recordMetric(operation, duration);
      return duration;
    };
  }
  
  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getMetrics(operation: string): MetricsSummary {
    const values = this.metrics.get(operation) || [];
    
    if (values.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { count: values.length, avg, min, max };
  }
}
```

### Logging System

```typescript
class Logger {
  private consola = require('consola');
  
  debug(message: string, meta?: any): void {
    if (process.env.XAHEEN_DEBUG === 'true') {
      this.consola.debug(message, meta);
    }
  }
  
  info(message: string, meta?: any): void {
    this.consola.info(message, meta);
  }
  
  warn(message: string, meta?: any): void {
    this.consola.warn(message, meta);
  }
  
  error(message: string, error?: Error, meta?: any): void {
    this.consola.error(message, { error: error?.message, stack: error?.stack, ...meta });
  }
  
  success(message: string, meta?: any): void {
    this.consola.success(message, meta);
  }
}
```

## Future Architecture Improvements

### Planned Enhancements

1. **Plugin System** - Allow third-party plugins to extend functionality
2. **Distributed Caching** - Redis-based caching for team environments  
3. **AI Integration** - Machine learning for service recommendations
4. **Real-time Collaboration** - WebSocket-based team project editing
5. **Advanced Analytics** - Detailed usage and performance analytics

### Scalability Considerations

1. **Microservice Architecture** - Split CLI into focused microservices
2. **Event-Driven Architecture** - Pub/sub system for loose coupling
3. **Container Support** - Full Docker and Kubernetes integration
4. **Cloud-Native Features** - Enhanced cloud deployment capabilities
5. **Multi-tenant SaaS** - Support for enterprise multi-tenant deployments

---

**Last Updated:** January 2025  
**Architecture Version:** 2.0.2  
**Author:** Xala Technologies
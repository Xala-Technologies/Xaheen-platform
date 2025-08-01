import { 
  IBaseService, 
  IServiceFactory,
  IEventEmitter,
  IProgressReporter
} from './interfaces.js';
import { BaseService, BaseServiceFactory } from './base-service.js';
import { logger } from '../utils/logger.js';

/**
 * Service registration interface
 * Defines how services are registered in the container
 */
interface ServiceRegistration<T = any> {
  factory: () => T;
  instance?: T;
  lifecycle: 'singleton' | 'transient' | 'scoped';
  dependencies?: string[];
  metadata?: ServiceMetadata;
}

/**
 * Service metadata interface
 * Additional information about registered services
 */
interface ServiceMetadata {
  description?: string;
  version?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

/**
 * Service container scope interface
 * Manages scoped service instances
 */
interface ServiceScope {
  id: string;
  services: Map<string, any>;
  disposed: boolean;
}

/**
 * Service container implementation
 * Implements Dependency Injection Container pattern
 * Following Inversion of Control principle
 * 
 * Features:
 * - Service registration with lifecycle management
 * - Dependency resolution and injection
 * - Circular dependency detection
 * - Service scoping (singleton, transient, scoped)
 * - Norwegian compliance integration
 * - Performance monitoring
 * - Health checking
 */
export class ServiceContainer {
  private registrations = new Map<string, ServiceRegistration>();
  private singletonInstances = new Map<string, any>();
  private scopes = new Map<string, ServiceScope>();
  private resolutionStack: string[] = [];
  private eventEmitter?: IEventEmitter;
  private progressReporter?: IProgressReporter;
  private isDisposed = false;
  
  /**
   * Register a service with the container
   * Follows Interface Segregation: separate registration concerns
   */
  register<T>(
    id: string,
    factory: () => T,
    options: {
      lifecycle?: 'singleton' | 'transient' | 'scoped';
      dependencies?: string[];
      metadata?: ServiceMetadata;
    } = {}
  ): this {
    if (this.isDisposed) {
      throw new Error('Cannot register services in disposed container');
    }
    
    if (this.registrations.has(id)) {
      logger.warn(`Service ${id} is already registered, replacing existing registration`);
    }
    
    const registration: ServiceRegistration<T> = {
      factory,
      lifecycle: options.lifecycle || 'singleton',
      dependencies: options.dependencies || [],
      metadata: options.metadata,
    };
    
    this.registrations.set(id, registration);
    
    logger.debug(`Service registered: ${id} (${registration.lifecycle})`);
    this.emit('serviceRegistered', { 
      id, 
      lifecycle: registration.lifecycle,
      metadata: registration.metadata 
    });
    
    return this;
  }
  
  /**
   * Register a singleton service instance
   * Convenience method for singleton registration
   */
  registerSingleton<T>(
    id: string,
    factory: () => T,
    dependencies?: string[],
    metadata?: ServiceMetadata
  ): this {
    return this.register(id, factory, { 
      lifecycle: 'singleton', 
      dependencies,
      metadata 
    });
  }
  
  /**
   * Register a transient service
   * New instance created on each resolution
   */
  registerTransient<T>(
    id: string,
    factory: () => T,
    dependencies?: string[],
    metadata?: ServiceMetadata
  ): this {
    return this.register(id, factory, { 
      lifecycle: 'transient', 
      dependencies,
      metadata 
    });
  }
  
  /**
   * Register a scoped service
   * One instance per scope
   */
  registerScoped<T>(
    id: string,
    factory: () => T,
    dependencies?: string[],
    metadata?: ServiceMetadata
  ): this {
    return this.register(id, factory, { 
      lifecycle: 'scoped', 
      dependencies,
      metadata 
    });
  }
  
  /**
   * Register a concrete instance
   * Direct instance registration (singleton lifecycle)
   */
  registerInstance<T>(id: string, instance: T, metadata?: ServiceMetadata): this {
    if (this.isDisposed) {
      throw new Error('Cannot register services in disposed container');
    }
    
    const registration: ServiceRegistration<T> = {
      factory: () => instance,
      instance,
      lifecycle: 'singleton',
      dependencies: [],
      metadata,
    };
    
    this.registrations.set(id, registration);
    this.singletonInstances.set(id, instance);
    
    logger.debug(`Instance registered: ${id}`);
    this.emit('instanceRegistered', { id, metadata });
    
    return this;
  }
  
  /**
   * Resolve a service by ID
   * Main resolution method with dependency injection
   */
  resolve<T>(id: string, scopeId?: string): T {
    if (this.isDisposed) {
      throw new Error('Cannot resolve services from disposed container');
    }
    
    // Check for circular dependencies
    if (this.resolutionStack.includes(id)) {
      const cycle = [...this.resolutionStack, id].join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }
    
    const registration = this.registrations.get(id);
    if (!registration) {
      throw new Error(`Service not registered: ${id}`);
    }
    
    try {
      this.resolutionStack.push(id);
      
      return this.createInstance<T>(id, registration, scopeId);
      
    } finally {
      this.resolutionStack.pop();
    }
  }
  
  /**
   * Try to resolve a service, return undefined if not found
   * Safe resolution method
   */
  tryResolve<T>(id: string, scopeId?: string): T | undefined {
    try {
      return this.resolve<T>(id, scopeId);
    } catch (error) {
      logger.debug(`Failed to resolve optional service ${id}:`, error);
      return undefined;
    }
  }
  
  /**
   * Check if a service is registered
   */
  isRegistered(id: string): boolean {
    return this.registrations.has(id);
  }
  
  /**
   * Get service registration information
   */
  getRegistration(id: string): ServiceRegistration | undefined {
    return this.registrations.get(id);
  }
  
  /**
   * Get all registered service IDs
   */
  getRegisteredServices(): string[] {
    return Array.from(this.registrations.keys());
  }
  
  /**
   * Get services by category
   */
  getServicesByCategory(category: string): string[] {
    const services: string[] = [];
    
    for (const [id, registration] of this.registrations) {
      if (registration.metadata?.category === category) {
        services.push(id);
      }
    }
    
    return services;
  }
  
  /**
   * Get services by tag
   */
  getServicesByTag(tag: string): string[] {
    const services: string[] = [];
    
    for (const [id, registration] of this.registrations) {
      if (registration.metadata?.tags?.includes(tag)) {
        services.push(id);
      }
    }
    
    return services;
  }
  
  /**
   * Create a new scope for scoped services
   */
  createScope(scopeId?: string): string {
    if (this.isDisposed) {
      throw new Error('Cannot create scope in disposed container');
    }
    
    const id = scopeId || `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.scopes.has(id)) {
      throw new Error(`Scope already exists: ${id}`);
    }
    
    const scope: ServiceScope = {
      id,
      services: new Map(),
      disposed: false,
    };
    
    this.scopes.set(id, scope);
    
    logger.debug(`Scope created: ${id}`);
    this.emit('scopeCreated', { scopeId: id });
    
    return id;
  }
  
  /**
   * Dispose a scope and all its scoped services
   */
  async disposeScope(scopeId: string): Promise<void> {
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      logger.warn(`Scope not found: ${scopeId}`);
      return;
    }
    
    if (scope.disposed) {
      logger.warn(`Scope already disposed: ${scopeId}`);
      return;
    }
    
    // Dispose all scoped services
    for (const [serviceId, instance] of scope.services) {
      if (instance && typeof instance.dispose === 'function') {
        try {
          await instance.dispose();
          logger.debug(`Disposed scoped service: ${serviceId} in scope ${scopeId}`);
        } catch (error) {
          logger.error(`Failed to dispose scoped service ${serviceId}:`, error);
        }
      }
    }
    
    scope.services.clear();
    scope.disposed = true;
    this.scopes.delete(scopeId);
    
    logger.debug(`Scope disposed: ${scopeId}`);
    this.emit('scopeDisposed', { scopeId });
  }
  
  /**
   * Initialize all singleton services
   * Useful for pre-warming the container
   */
  async initializeAll(): Promise<void> {
    if (this.isDisposed) {
      throw new Error('Cannot initialize services in disposed container');
    }
    
    const singletonServices: string[] = [];
    
    for (const [id, registration] of this.registrations) {
      if (registration.lifecycle === 'singleton') {
        singletonServices.push(id);
      }
    }
    
    logger.info(`Initializing ${singletonServices.length} singleton services`);
    this.reportProgress(0, singletonServices.length, 'Initializing services');
    
    for (let i = 0; i < singletonServices.length; i++) {
      const serviceId = singletonServices[i];
      
      try {
        const service = this.resolve(serviceId);
        
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
          logger.debug(`Initialized service: ${serviceId}`);
        }
        
        this.reportProgress(i + 1, singletonServices.length, `Initialized ${serviceId}`);
        
      } catch (error) {
        logger.error(`Failed to initialize service ${serviceId}:`, error);
        this.reportError(error as Error);
        throw error;
      }
    }
    
    logger.info('All singleton services initialized successfully');
    this.emit('allServicesInitialized', { count: singletonServices.length });
  }
  
  /**
   * Health check for all services
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const serviceId of this.getRegisteredServices()) {
      try {
        const service = this.tryResolve(serviceId);
        
        if (service && typeof service.healthCheck === 'function') {
          results.set(serviceId, await service.healthCheck());
        } else {
          results.set(serviceId, service !== undefined);
        }
        
      } catch (error) {
        logger.error(`Health check failed for service ${serviceId}:`, error);
        results.set(serviceId, false);
      }
    }
    
    return results;
  }
  
  /**
   * Get container statistics
   */
  getStatistics(): {
    totalRegistrations: number;
    singletonInstances: number;
    activeScopes: number;
    lifecycleCounts: Record<string, number>;
    categoryCounts: Record<string, number>;
  } {
    const lifecycleCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    for (const registration of this.registrations.values()) {
      // Count by lifecycle
      lifecycleCounts[registration.lifecycle] = 
        (lifecycleCounts[registration.lifecycle] || 0) + 1;
      
      // Count by category
      const category = registration.metadata?.category || 'uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    return {
      totalRegistrations: this.registrations.size,
      singletonInstances: this.singletonInstances.size,
      activeScopes: this.scopes.size,
      lifecycleCounts,
      categoryCounts,
    };
  }
  
  /**
   * Dispose the container and all services
   */
  async dispose(): Promise<void> {
    if (this.isDisposed) {
      logger.warn('Container is already disposed');
      return;
    }
    
    logger.info('Disposing service container');
    
    try {
      // Dispose all scopes
      const scopes = Array.from(this.scopes.keys());
      for (const scopeId of scopes) {
        await this.disposeScope(scopeId);
      }
      
      // Dispose all singleton instances
      const singletons = Array.from(this.singletonInstances.entries());
      for (const [serviceId, instance] of singletons.reverse()) {
        if (instance && typeof instance.dispose === 'function') {
          try {
            await instance.dispose();
            logger.debug(`Disposed singleton service: ${serviceId}`);
          } catch (error) {
            logger.error(`Failed to dispose singleton service ${serviceId}:`, error);
          }
        }
      }
      
      // Clear all collections
      this.registrations.clear();
      this.singletonInstances.clear();
      this.scopes.clear();
      this.resolutionStack = [];
      
      this.isDisposed = true;
      
      logger.info('Service container disposed successfully');
      this.emit('containerDisposed');
      
    } catch (error) {
      logger.error('Failed to dispose service container:', error);
      throw error;
    }
  }
  
  /**
   * Set event emitter for container events
   */
  setEventEmitter(eventEmitter: IEventEmitter): void {
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * Set progress reporter for container operations
   */
  setProgressReporter(progressReporter: IProgressReporter): void {
    this.progressReporter = progressReporter;
  }
  
  // Private methods
  
  /**
   * Create an instance based on registration
   */
  private createInstance<T>(
    id: string,
    registration: ServiceRegistration<T>,
    scopeId?: string
  ): T {
    switch (registration.lifecycle) {
      case 'singleton':
        return this.getSingletonInstance(id, registration);
      
      case 'transient':
        return this.createTransientInstance(id, registration);
      
      case 'scoped':
        return this.getScopedInstance(id, registration, scopeId);
      
      default:
        throw new Error(`Unknown lifecycle: ${registration.lifecycle}`);
    }
  }
  
  /**
   * Get or create singleton instance
   */
  private getSingletonInstance<T>(id: string, registration: ServiceRegistration<T>): T {
    if (this.singletonInstances.has(id)) {
      return this.singletonInstances.get(id);
    }
    
    const instance = this.createTransientInstance(id, registration);
    this.singletonInstances.set(id, instance);
    
    logger.debug(`Created singleton instance: ${id}`);
    this.emit('singletonCreated', { id });
    
    return instance;
  }
  
  /**
   * Create transient instance
   */
  private createTransientInstance<T>(id: string, registration: ServiceRegistration<T>): T {
    // Resolve dependencies first
    const dependencies = this.resolveDependencies(registration.dependencies || []);
    
    // Create instance using factory
    const instance = registration.factory();
    
    // Inject dependencies if the instance supports it
    this.injectDependencies(instance, dependencies, registration.dependencies || []);
    
    // Configure instance with shared services
    this.configureInstance(instance);
    
    logger.debug(`Created transient instance: ${id}`);
    this.emit('transientCreated', { id });
    
    return instance;
  }
  
  /**
   * Get or create scoped instance
   */
  private getScopedInstance<T>(
    id: string,
    registration: ServiceRegistration<T>,
    scopeId?: string
  ): T {
    if (!scopeId) {
      throw new Error(`Scope ID required for scoped service: ${id}`);
    }
    
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      throw new Error(`Scope not found: ${scopeId}`);
    }
    
    if (scope.disposed) {
      throw new Error(`Scope is disposed: ${scopeId}`);
    }
    
    if (scope.services.has(id)) {
      return scope.services.get(id);
    }
    
    const instance = this.createTransientInstance(id, registration);
    scope.services.set(id, instance);
    
    logger.debug(`Created scoped instance: ${id} in scope ${scopeId}`);
    this.emit('scopedCreated', { id, scopeId });
    
    return instance;
  }
  
  /**
   * Resolve service dependencies
   */
  private resolveDependencies(dependencyIds: string[]): any[] {
    return dependencyIds.map(depId => this.resolve(depId));
  }
  
  /**
   * Inject dependencies into instance
   */
  private injectDependencies(instance: any, dependencies: any[], dependencyIds: string[]): void {
    // If instance has a setDependencies method, use it
    if (typeof instance.setDependencies === 'function') {
      const dependencyMap = new Map<string, any>();
      dependencyIds.forEach((id, index) => {
        dependencyMap.set(id, dependencies[index]);
      });
      instance.setDependencies(dependencyMap);
    }
    
    // If instance has dependency properties, set them
    dependencyIds.forEach((id, index) => {
      const propertyName = `_${id.replace(/[^a-zA-Z0-9]/g, '')}`;
      if (propertyName in instance) {
        instance[propertyName] = dependencies[index];
      }
    });
  }
  
  /**
   * Configure instance with shared services
   */
  private configureInstance(instance: any): void {
    // Set event emitter if instance supports it
    if (this.eventEmitter && typeof instance.setEventEmitter === 'function') {
      instance.setEventEmitter(this.eventEmitter);
    }
    
    // Set progress reporter if instance supports it
    if (this.progressReporter && typeof instance.setProgressReporter === 'function') {
      instance.setProgressReporter(this.progressReporter);
    }
  }
  
  /**
   * Emit an event
   */
  private emit(event: string, data?: any): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(event, {
        container: 'ServiceContainer',
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
  }
  
  /**
   * Report progress
   */
  private reportProgress(current: number, total?: number, message?: string): void {
    if (this.progressReporter) {
      if (total !== undefined && current === 0) {
        this.progressReporter.start(total, message);
      } else if (total !== undefined && current >= total) {
        this.progressReporter.complete(message);
      } else {
        this.progressReporter.update(current, message);
      }
    }
  }
  
  /**
   * Report an error
   */
  private reportError(error: Error): void {
    if (this.progressReporter) {
      this.progressReporter.error(error);
    }
    this.emit('error', { error: error.message, stack: error.stack });
  }
}

/**
 * Default service container instance
 * Singleton pattern for global access
 */
export const defaultContainer = new ServiceContainer();

/**
 * Service locator pattern implementation
 * Provides static access to services
 */
export class ServiceLocator {
  private static container: ServiceContainer = defaultContainer;
  
  /**
   * Set the container instance
   */
  static setContainer(container: ServiceContainer): void {
    ServiceLocator.container = container;
  }
  
  /**
   * Get the current container
   */
  static getContainer(): ServiceContainer {
    return ServiceLocator.container;
  }
  
  /**
   * Resolve a service from the current container
   */
  static resolve<T>(serviceId: string, scopeId?: string): T {
    return ServiceLocator.container.resolve<T>(serviceId, scopeId);
  }
  
  /**
   * Try to resolve a service from the current container
   */
  static tryResolve<T>(serviceId: string, scopeId?: string): T | undefined {
    return ServiceLocator.container.tryResolve<T>(serviceId, scopeId);
  }
  
  /**
   * Check if a service is registered
   */
  static isRegistered(serviceId: string): boolean {
    return ServiceLocator.container.isRegistered(serviceId);
  }
}
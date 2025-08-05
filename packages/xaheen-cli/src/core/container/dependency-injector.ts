/**
 * Dependency Injection Container
 * Implements Dependency Inversion Principle with constructor injection
 */

import type { IDependencyInjector } from '../interfaces/index.js';

export interface ServiceDescriptor {
  readonly token: string | symbol;
  readonly implementation?: new (...args: any[]) => any;
  readonly instance?: any;
  readonly factory?: (...args: any[]) => any;
  readonly singleton?: boolean;
  readonly dependencies?: readonly (string | symbol)[];
}

export class DependencyInjector implements IDependencyInjector {
  private readonly services = new Map<string | symbol, ServiceDescriptor>();
  private readonly instances = new Map<string | symbol, any>();
  private readonly resolutionStack = new Set<string | symbol>();

  public register<T>(
    token: string | symbol,
    implementation: new (...args: any[]) => T,
    dependencies: readonly (string | symbol)[] = []
  ): void {
    this.services.set(token, {
      token,
      implementation,
      dependencies,
      singleton: false,
    });
  }

  public registerSingleton<T>(
    token: string | symbol,
    implementation: new (...args: any[]) => T,
    dependencies: readonly (string | symbol)[] = []
  ): void {
    this.services.set(token, {
      token,
      implementation,
      dependencies,
      singleton: true,
    });
  }

  public registerInstance<T>(token: string | symbol, instance: T): void {
    this.services.set(token, {
      token,
      instance,
      singleton: true,
    });
    this.instances.set(token, instance);
  }

  public registerFactory<T>(
    token: string | symbol,
    factory: (...args: any[]) => T,
    dependencies: readonly (string | symbol)[] = [],
    singleton: boolean = false
  ): void {
    this.services.set(token, {
      token,
      factory,
      dependencies,
      singleton,
    });
  }

  public resolve<T>(token: string | symbol): T {
    // Check for circular dependencies
    if (this.resolutionStack.has(token)) {
      const stack = Array.from(this.resolutionStack).join(' -> ');
      throw new Error(`Circular dependency detected: ${stack} -> ${String(token)}`);
    }

    // Return cached singleton instance if available
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    this.resolutionStack.add(token);

    try {
      let instance: T;

      if (service.instance) {
        instance = service.instance;
      } else if (service.factory) {
        const dependencies = this.resolveDependencies(service.dependencies || []);
        instance = service.factory(...dependencies);
      } else if (service.implementation) {
        const dependencies = this.resolveDependencies(service.dependencies || []);
        instance = new service.implementation(...dependencies);
      } else {
        throw new Error(`Invalid service descriptor for: ${String(token)}`);
      }

      // Cache singleton instances
      if (service.singleton && !this.instances.has(token)) {
        this.instances.set(token, instance);
      }

      return instance;
    } finally {
      this.resolutionStack.delete(token);
    }
  }

  public create<T>(constructor: new (...args: any[]) => T): T {
    // Use reflection to get constructor parameters (if available)
    // For now, create with no dependencies
    return new constructor();
  }

  public has(token: string | symbol): boolean {
    return this.services.has(token);
  }

  public clear(): void {
    this.services.clear();
    this.instances.clear();
    this.resolutionStack.clear();
  }

  private resolveDependencies(dependencies: readonly (string | symbol)[]): any[] {
    return dependencies.map(dep => this.resolve(dep));
  }
}

// Decorator for automatic dependency injection
export function Injectable(dependencies: readonly (string | symbol)[] = []) {
  return function <T extends new(...args: any[]) => any>(constructor: T) {
    // Store metadata about dependencies
    Reflect.defineMetadata('dependencies', dependencies, constructor);
    return constructor;
  };
}

// Decorator for dependency injection
export function Inject(token: string | symbol) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getMetadata('inject-tokens', target) || [];
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata('inject-tokens', existingTokens, target);
  };
}

// Global container instance
export const container = new DependencyInjector();
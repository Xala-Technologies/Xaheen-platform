/**
 * Command Handler Factory
 * Creates and manages command handlers with dependency injection
 * Follows Dependency Inversion Principle (DIP) and Factory Pattern
 */

import type { CLIDomain } from '../../../types/index.js';
import type { ICommandHandler, IInitializableCommandHandler } from '../interfaces/ICommandHandler.js';
import type { ICommandHandlerFactory } from '../interfaces/CommandTypes.js';
import { logger } from '../../../utils/logger.js';

export class CommandHandlerFactory implements ICommandHandlerFactory {
  private handlerClasses: Map<CLIDomain, new (...args: any[]) => ICommandHandler> = new Map();
  private handlerInstances: Map<CLIDomain, ICommandHandler> = new Map();
  private globalDependencies: Record<string, any> = {};

  /**
   * Set global dependencies available to all handlers
   */
  public setGlobalDependencies(dependencies: Record<string, any>): void {
    this.globalDependencies = { ...this.globalDependencies, ...dependencies };
    logger.debug('Global dependencies updated:', Object.keys(dependencies));
  }

  /**
   * Register a handler class for a domain
   */
  public registerHandler(domain: CLIDomain, handlerClass: new (...args: any[]) => ICommandHandler): void {
    this.handlerClasses.set(domain, handlerClass);
    
    // Clear cached instance if it exists
    if (this.handlerInstances.has(domain)) {
      this.handlerInstances.delete(domain);
    }

    logger.debug(`Registered handler for domain: ${domain}`);
  }

  /**
   * Create a command handler for the specified domain
   */
  public createHandler(domain: CLIDomain, dependencies?: Record<string, any>): ICommandHandler {
    // Check if we have a cached instance
    if (this.handlerInstances.has(domain)) {
      return this.handlerInstances.get(domain)!;
    }

    const HandlerClass = this.handlerClasses.get(domain);
    if (!HandlerClass) {
      throw new Error(`No handler registered for domain: ${domain}`);
    }

    try {
      // Merge global and specific dependencies
      const allDependencies = {
        ...this.globalDependencies,
        ...dependencies,
      };

      // Create handler instance
      const handler = new HandlerClass(allDependencies);

      // Initialize if it's an initializable handler
      if (this.isInitializableHandler(handler)) {
        // Note: Initialization is async, so we'll handle it in the main parser
        logger.debug(`Handler for ${domain} requires initialization`);
      }

      // Cache the instance
      this.handlerInstances.set(domain, handler);

      logger.debug(`Created handler for domain: ${domain}`);
      return handler;

    } catch (error) {
      logger.error(`Failed to create handler for domain ${domain}:`, error);
      throw new Error(`Failed to create handler for domain ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a handler is registered for a domain
   */
  public hasHandler(domain: CLIDomain): boolean {
    return this.handlerClasses.has(domain);
  }

  /**
   * Get all registered domains
   */
  public getRegisteredDomains(): CLIDomain[] {
    return Array.from(this.handlerClasses.keys());
  }

  /**
   * Initialize all handlers that require initialization
   */
  public async initializeHandlers(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (const [domain, handler] of this.handlerInstances) {
      if (this.isInitializableHandler(handler)) {
        logger.debug(`Initializing handler for domain: ${domain}`);
        initPromises.push(
          handler.initialize(this.globalDependencies).catch(error => {
            logger.error(`Failed to initialize handler for ${domain}:`, error);
            throw error;
          })
        );
      }
    }

    if (initPromises.length > 0) {
      await Promise.all(initPromises);
      logger.debug(`Initialized ${initPromises.length} handlers`);
    }
  }

  /**
   * Get handler instance without creating if not exists
   */
  public getHandler(domain: CLIDomain): ICommandHandler | undefined {
    return this.handlerInstances.get(domain);
  }

  /**
   * Clear all cached handlers (useful for testing)
   */
  public clearCache(): void {
    this.handlerInstances.clear();
    logger.debug('Handler cache cleared');
  }

  /**
   * Get factory statistics
   */
  public getStatistics(): HandlerFactoryStatistics {
    return {
      registeredDomains: this.handlerClasses.size,
      cachedInstances: this.handlerInstances.size,
      domains: Array.from(this.handlerClasses.keys()),
      globalDependencies: Object.keys(this.globalDependencies),
    };
  }

  /**
   * Validate all registered handlers
   */
  public validateHandlers(): HandlerValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [domain, HandlerClass] of this.handlerClasses) {
      try {
        // Try to create a test instance
        const testHandler = new HandlerClass({});
        
        // Validate handler interface
        if (typeof testHandler.execute !== 'function') {
          errors.push(`Handler for ${domain} missing execute method`);
        }
        if (typeof testHandler.getSupportedActions !== 'function') {
          errors.push(`Handler for ${domain} missing getSupportedActions method`);
        }
        if (typeof testHandler.canHandle !== 'function') {
          errors.push(`Handler for ${domain} missing canHandle method`);
        }
        if (testHandler.domain !== domain) {
          warnings.push(`Handler for ${domain} reports different domain: ${testHandler.domain}`);
        }

      } catch (error) {
        errors.push(`Failed to validate handler for ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if handler implements IInitializableCommandHandler
   */
  private isInitializableHandler(handler: ICommandHandler): handler is IInitializableCommandHandler {
    return 'initialize' in handler && typeof (handler as any).initialize === 'function';
  }
}

/**
 * Handler factory statistics
 */
export interface HandlerFactoryStatistics {
  registeredDomains: number;
  cachedInstances: number;
  domains: CLIDomain[];
  globalDependencies: string[];
}

/**
 * Handler validation result
 */
export interface HandlerValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

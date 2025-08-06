/**
 * Service Configuration and Bootstrap
 * Configures dependency injection container and registers all services
 */

import type { IDependencyInjector } from "../interfaces/index";
import { SERVICE_TOKENS } from "../interfaces/index";
import { DependencyInjector } from "../container/dependency-injector";

// Service implementations
import { LoggerService } from "../services/logger.service";
import { FileSystemService } from "../services/file-system.service";
import { NamingService } from "../services/naming.service";
import { ProjectAnalyzer } from "../services/project-analyzer.service";
import { TemplateEngine } from "../services/template-engine.service";

// Generators
import { ComponentGenerator } from "../../generators/component/component.generator.refactored";

// Command handlers
import { GenerateCommandHandler } from "../../commands/handlers/generate.handler.refactored";

export class ServiceConfigurator {
  private readonly container = new DependencyInjector();

  public configure(): IDependencyInjector {
    this.registerCoreServices();
    this.registerGenerators();
    this.registerCommandHandlers();
    
    return this.container;
  }

  private registerCoreServices(): void {
    // Register logger as singleton
    this.container.registerSingleton(
      SERVICE_TOKENS.LOGGER,
      LoggerService,
      []
    );

    // Register file system service
    this.container.registerSingleton(
      SERVICE_TOKENS.FILE_SYSTEM,
      FileSystemService,
      [SERVICE_TOKENS.LOGGER]
    );

    // Register naming service
    this.container.registerSingleton(
      SERVICE_TOKENS.NAMING_SERVICE,
      NamingService,
      []
    );

    // Register project analyzer
    this.container.registerSingleton(
      SERVICE_TOKENS.PROJECT_ANALYZER,
      ProjectAnalyzer,
      [SERVICE_TOKENS.FILE_SYSTEM, SERVICE_TOKENS.LOGGER]
    );

    // Register template engine
    this.container.registerSingleton(
      SERVICE_TOKENS.TEMPLATE_ENGINE,
      TemplateEngine,
      [SERVICE_TOKENS.FILE_SYSTEM, SERVICE_TOKENS.LOGGER]
    );
  }

  private registerGenerators(): void {
    const COMPONENT_GENERATOR = Symbol('ComponentGenerator');
    
    this.container.registerSingleton(
      COMPONENT_GENERATOR,
      ComponentGenerator,
      [
        SERVICE_TOKENS.LOGGER,
        SERVICE_TOKENS.FILE_SYSTEM,
        SERVICE_TOKENS.NAMING_SERVICE,
        SERVICE_TOKENS.PROJECT_ANALYZER,
        SERVICE_TOKENS.TEMPLATE_ENGINE,
      ]
    );
  }

  private registerCommandHandlers(): void {
    const GENERATE_HANDLER = Symbol('GenerateCommandHandler');
    
    this.container.registerSingleton(
      GENERATE_HANDLER,
      GenerateCommandHandler,
      [
        SERVICE_TOKENS.LOGGER,
        SERVICE_TOKENS.DEPENDENCY_INJECTOR,
      ]
    );

    // Register self-reference for dependency injection
    this.container.registerInstance(
      SERVICE_TOKENS.DEPENDENCY_INJECTOR,
      this.container
    );
  }

  public getContainer(): IDependencyInjector {
    return this.container;
  }
}

/**
 * Application Bootstrap
 * Initializes the entire application with proper dependency injection
 */
export class ApplicationBootstrap {
  private container?: IDependencyInjector;

  public initialize(): IDependencyInjector {
    if (this.container) {
      return this.container;
    }

    const configurator = new ServiceConfigurator();
    this.container = configurator.configure();

    return this.container;
  }

  public getService<T>(token: string | symbol): T {
    if (!this.container) {
      throw new Error('Application not initialized. Call initialize() first.');
    }

    return this.container.resolve<T>(token);
  }

  public reset(): void {
    this.container = undefined;
  }
}

// Global application instance
export const app = new ApplicationBootstrap();
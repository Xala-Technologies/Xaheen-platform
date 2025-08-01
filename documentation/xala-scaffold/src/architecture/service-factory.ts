import { CodeGenerator } from "../generators/code-generator.js";
import { LocalizationService } from "../localization/localization-service.js";
import { MigrationService } from "../migration/migration-service.js";

// Import concrete implementations
import { ConfigurationService } from "../services/configuration-service.js";
import { FileSystemService } from "../services/file-system-service.js";
import { LoggingService } from "../services/logging-service.js";
import { TemplateEngine } from "../templates/template-engine.js";
import { TemplateRegistry } from "../templates/template-registry.js";
import { EventEmitter } from "../utils/event-emitter.js";
import { ConsoleProgressReporter } from "../utils/progress-reporter.js";
import { ValidatorComposite } from "../validation/validator-composite.js";
import { BaseService, BaseServiceFactory } from "./base-service.js";
import {
	ICodeGenerator,
	IConfigurationService,
	IEventEmitter,
	IFileSystemService,
	ILocalizationService,
	ILoggingService,
	IMigrationService,
	IProgressReporter,
	IServiceFactory,
	ITemplateEngine,
	ITemplateRegistry,
	IValidator,
} from "./interfaces.js";
import { ServiceContainer } from "./service-container.js";

/**
 * Concrete service factory implementation
 * Implements Abstract Factory Pattern
 * Following SOLID principles:
 * - Single Responsibility: Creates and configures services
 * - Open/Closed: Extensible through inheritance
 * - Liskov Substitution: Implementations are substitutable
 * - Interface Segregation: Focused factory interface
 * - Dependency Inversion: Depends on abstractions
 */
export class ServiceFactory
	extends BaseServiceFactory
	implements IServiceFactory
{
	private container: ServiceContainer;

	constructor(container?: ServiceContainer) {
		super();
		this.container = container || new ServiceContainer();
		this.setupDefaultServices();
	}

	/**
	 * Setup default service registrations
	 * Pre-configures the container with standard services
	 */
	private setupDefaultServices(): void {
		// Register core services
		this.container.registerSingleton(
			"eventEmitter",
			() => new EventEmitter(),
			[],
			{
				description: "Event emitter for inter-service communication",
				category: "core",
				tags: ["events", "communication"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"progressReporter",
			() => new ConsoleProgressReporter(),
			[],
			{
				description: "Console-based progress reporter",
				category: "core",
				tags: ["progress", "ui"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"configurationService",
			() => new ConfigurationService(),
			[],
			{
				description: "Application configuration management service",
				category: "core",
				tags: ["config", "settings"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"loggingService",
			() => new LoggingService(),
			["configurationService"],
			{
				description: "Structured logging service with multiple transports",
				category: "core",
				tags: ["logging", "monitoring"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"fileSystemService",
			() => new FileSystemService(),
			["loggingService"],
			{
				description: "Safe file system operations service",
				category: "core",
				tags: ["filesystem", "io"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"templateEngine",
			() => new TemplateEngine(),
			["fileSystemService", "loggingService"],
			{
				description: "Template processing engine with Norwegian compliance",
				category: "templating",
				tags: ["templates", "generation", "compliance"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"templateRegistry",
			() =>
				new TemplateRegistry(
					this.container.resolve<ITemplateEngine>("templateEngine"),
				),
			["templateEngine", "fileSystemService"],
			{
				description: "Template registry and management service",
				category: "templating",
				tags: ["templates", "registry", "management"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"validatorComposite",
			() => new ValidatorComposite(),
			["loggingService"],
			{
				description: "Composite validator with multiple validation strategies",
				category: "validation",
				tags: ["validation", "quality", "compliance"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"codeGenerator",
			() => new CodeGenerator(),
			[
				"templateEngine",
				"templateRegistry",
				"validatorComposite",
				"fileSystemService",
			],
			{
				description: "Code generation service with template support",
				category: "generation",
				tags: ["codegen", "scaffolding", "templates"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"migrationService",
			() => new MigrationService(),
			["fileSystemService", "codeGenerator", "validatorComposite"],
			{
				description: "Platform migration service with compatibility analysis",
				category: "migration",
				tags: ["migration", "compatibility", "platform"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);

		this.container.registerSingleton(
			"localizationService",
			() => new LocalizationService(),
			["configurationService", "fileSystemService"],
			{
				description: "Norwegian localization service with RTL support",
				category: "localization",
				tags: ["i18n", "norwegian", "rtl", "compliance"],
				version: "1.0.0",
				author: "Xala Technologies",
			},
		);
	}

	/**
	 * Get the service container
	 */
	getContainer(): ServiceContainer {
		return this.container;
	}

	/**
	 * Initialize the factory and configure services
	 */
	async initialize(): Promise<void> {
		// Get shared services
		const eventEmitter = this.container.resolve<IEventEmitter>("eventEmitter");
		const progressReporter =
			this.container.resolve<IProgressReporter>("progressReporter");

		// Configure container with shared services
		this.container.setEventEmitter(eventEmitter);
		this.container.setProgressReporter(progressReporter);

		// Configure base factory
		this.setEventEmitter(eventEmitter);
		this.setProgressReporter(progressReporter);

		// Initialize all singleton services
		await this.container.initializeAll();
	}

	/**
	 * Dispose the factory and all services
	 */
	async dispose(): Promise<void> {
		await this.container.dispose();
		await this.disposeAll();
	}

	// IServiceFactory implementation

	createConfigurationService(): IConfigurationService {
		return this.container.resolve<IConfigurationService>(
			"configurationService",
		);
	}

	createLoggingService(): ILoggingService {
		return this.container.resolve<ILoggingService>("loggingService");
	}

	createFileSystemService(): IFileSystemService {
		return this.container.resolve<IFileSystemService>("fileSystemService");
	}

	createCodeGenerator(): ICodeGenerator {
		return this.container.resolve<ICodeGenerator>("codeGenerator");
	}

	createValidator(): IValidator {
		return this.container.resolve<IValidator>("validatorComposite");
	}

	createTemplateEngine(): ITemplateEngine {
		return this.container.resolve<ITemplateEngine>("templateEngine");
	}

	createTemplateRegistry(): ITemplateRegistry {
		return this.container.resolve<ITemplateRegistry>("templateRegistry");
	}

	createMigrationService(): IMigrationService {
		return this.container.resolve<IMigrationService>("migrationService");
	}

	createLocalizationService(): ILocalizationService {
		return this.container.resolve<ILocalizationService>("localizationService");
	}

	/**
	 * Create a specialized code generator
	 * Factory method for specific generator types
	 */
	createComponentGenerator(): ICodeGenerator {
		return this.getOrCreateService("componentGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for component generation
			return generator;
		});
	}

	createPageGenerator(): ICodeGenerator {
		return this.getOrCreateService("pageGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for page generation
			return generator;
		});
	}

	createLayoutGenerator(): ICodeGenerator {
		return this.getOrCreateService("layoutGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for layout generation
			return generator;
		});
	}

	createApiGenerator(): ICodeGenerator {
		return this.getOrCreateService("apiGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for API generation
			return generator;
		});
	}

	createTestGenerator(): ICodeGenerator {
		return this.getOrCreateService("testGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for test generation
			return generator;
		});
	}

	createStoryGenerator(): ICodeGenerator {
		return this.getOrCreateService("storyGenerator", () => {
			const generator = new CodeGenerator();
			// Configure for story generation
			return generator;
		});
	}

	/**
	 * Create event emitter instance
	 */
	createEventEmitter(): IEventEmitter {
		return this.container.resolve<IEventEmitter>("eventEmitter");
	}

	/**
	 * Create progress reporter instance
	 */
	createProgressReporter(): IProgressReporter {
		return this.container.resolve<IProgressReporter>("progressReporter");
	}

	/**
	 * Register a custom service
	 * Allows extending the factory with additional services
	 */
	registerService<T>(
		id: string,
		factory: () => T,
		options?: {
			lifecycle?: "singleton" | "transient" | "scoped";
			dependencies?: string[];
			metadata?: {
				description?: string;
				version?: string;
				category?: string;
				tags?: string[];
				author?: string;
			};
		},
	): void {
		this.container.register(id, factory, options);
	}

	/**
	 * Register a custom service instance
	 */
	registerInstance<T>(
		id: string,
		instance: T,
		metadata?: {
			description?: string;
			version?: string;
			category?: string;
			tags?: string[];
			author?: string;
		},
	): void {
		this.container.registerInstance(id, instance, metadata);
	}

	/**
	 * Resolve a custom service
	 */
	resolveService<T>(id: string, scopeId?: string): T {
		return this.container.resolve<T>(id, scopeId);
	}

	/**
	 * Try to resolve a custom service
	 */
	tryResolveService<T>(id: string, scopeId?: string): T | undefined {
		return this.container.tryResolve<T>(id, scopeId);
	}

	/**
	 * Check if a service is registered
	 */
	hasService(id: string): boolean {
		return this.container.isRegistered(id);
	}

	/**
	 * Get all registered service IDs
	 */
	getServiceIds(): string[] {
		return this.container.getRegisteredServices();
	}

	/**
	 * Get services by category
	 */
	getServicesByCategory(category: string): string[] {
		return this.container.getServicesByCategory(category);
	}

	/**
	 * Get services by tag
	 */
	getServicesByTag(tag: string): string[] {
		return this.container.getServicesByTag(tag);
	}

	/**
	 * Health check for all services
	 */
	async healthCheck(): Promise<Map<string, boolean>> {
		return this.container.healthCheckAll();
	}

	/**
	 * Get factory statistics
	 */
	getStatistics(): {
		containerStats: ReturnType<ServiceContainer["getStatistics"]>;
		factoryServices: number;
		totalServices: number;
	} {
		const containerStats = this.container.getStatistics();
		const factoryServices = this.services.size;

		return {
			containerStats,
			factoryServices,
			totalServices: containerStats.totalRegistrations + factoryServices,
		};
	}

	/**
	 * Create a service scope
	 */
	createScope(scopeId?: string): string {
		return this.container.createScope(scopeId);
	}

	/**
	 * Dispose a service scope
	 */
	async disposeScope(scopeId: string): Promise<void> {
		await this.container.disposeScope(scopeId);
	}

	/**
	 * Export service configuration
	 * Useful for debugging and documentation
	 */
	exportConfiguration(): {
		services: Array<{
			id: string;
			lifecycle: string;
			dependencies: string[];
			metadata?: any;
		}>;
		statistics: ReturnType<ServiceContainer["getStatistics"]>;
	} {
		const services: Array<{
			id: string;
			lifecycle: string;
			dependencies: string[];
			metadata?: any;
		}> = [];

		for (const serviceId of this.container.getRegisteredServices()) {
			const registration = this.container.getRegistration(serviceId);
			if (registration) {
				services.push({
					id: serviceId,
					lifecycle: registration.lifecycle,
					dependencies: registration.dependencies || [],
					metadata: registration.metadata,
				});
			}
		}

		return {
			services: services.sort((a, b) => a.id.localeCompare(b.id)),
			statistics: this.container.getStatistics(),
		};
	}
}

/**
 * Default service factory instance
 * Singleton pattern for global access
 */
let defaultFactory: ServiceFactory | undefined;

/**
 * Get the default service factory
 * Lazy initialization with singleton pattern
 */
export function getDefaultServiceFactory(): ServiceFactory {
	if (!defaultFactory) {
		defaultFactory = new ServiceFactory();
	}
	return defaultFactory;
}

/**
 * Set the default service factory
 * Useful for testing or custom configurations
 */
export function setDefaultServiceFactory(factory: ServiceFactory): void {
	defaultFactory = factory;
}

/**
 * Initialize the default service factory
 * Convenience method for application startup
 */
export async function initializeDefaultFactory(): Promise<ServiceFactory> {
	const factory = getDefaultServiceFactory();
	await factory.initialize();
	return factory;
}

/**
 * Dispose the default service factory
 * Convenience method for application shutdown
 */
export async function disposeDefaultFactory(): Promise<void> {
	if (defaultFactory) {
		await defaultFactory.dispose();
		defaultFactory = undefined;
	}
}

/**
 * Service factory builder
 * Fluent API for configuring the service factory
 */
export class ServiceFactoryBuilder {
	private container = new ServiceContainer();
	private customServices: Array<{
		id: string;
		factory: () => any;
		options?: any;
	}> = [];

	/**
	 * Add a custom service to the factory
	 */
	addService<T>(
		id: string,
		factory: () => T,
		options?: {
			lifecycle?: "singleton" | "transient" | "scoped";
			dependencies?: string[];
			metadata?: any;
		},
	): this {
		this.customServices.push({ id, factory, options });
		return this;
	}

	/**
	 * Add a service instance to the factory
	 */
	addInstance<T>(id: string, instance: T, metadata?: any): this {
		this.container.registerInstance(id, instance, metadata);
		return this;
	}

	/**
	 * Configure the container
	 */
	configureContainer(
		configurator: (container: ServiceContainer) => void,
	): this {
		configurator(this.container);
		return this;
	}

	/**
	 * Build the service factory
	 */
	build(): ServiceFactory {
		const factory = new ServiceFactory(this.container);

		// Register custom services
		for (const service of this.customServices) {
			factory.registerService(service.id, service.factory, service.options);
		}

		return factory;
	}

	/**
	 * Build and initialize the service factory
	 */
	async buildAndInitialize(): Promise<ServiceFactory> {
		const factory = this.build();
		await factory.initialize();
		return factory;
	}
}

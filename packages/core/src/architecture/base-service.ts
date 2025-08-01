import type { IBaseService, IProgressReporter } from "../interfaces";
import type { IEventEmitter } from "../events/interfaces";
import { logger } from "../utils/logger";

/**
 * Abstract base service class - implements common service functionality
 * Following Single Responsibility Principle: focuses only on base service concerns
 *
 * All concrete services extend this base class to ensure consistent behavior
 * and shared functionality across the scaffolding system.
 */
export abstract class BaseService implements IBaseService {
	protected readonly _name: string;
	protected readonly _version: string;
	protected _isInitialized: boolean = false;
	protected _isDisposed: boolean = false;
	protected _eventEmitter?: IEventEmitter;
	protected _progressReporter?: IProgressReporter;

	constructor(name: string, version: string = "1.0.0") {
		this._name = name;
		this._version = version;
	}

	// Public getters - Open/Closed Principle: expose interface without modification
	get name(): string {
		return this._name;
	}

	get version(): string {
		return this._version;
	}

	get isInitialized(): boolean {
		return this._isInitialized;
	}

	get isDisposed(): boolean {
		return this._isDisposed;
	}

	/**
	 * Initialize the service - Template Method Pattern
	 * Defines the skeleton of initialization process
	 */
	async initialize(): Promise<void> {
		if (this._isInitialized) {
			logger.warn(`Service ${this.name} is already initialized`);
			return;
		}

		if (this._isDisposed) {
			throw new Error(`Cannot initialize disposed service: ${this.name}`);
		}

		try {
			logger.info(`Initializing service: ${this.name} v${this.version}`);

			// Pre-initialization hook
			await this.beforeInitialize();

			// Core initialization - subclasses implement this
			await this.doInitialize();

			// Post-initialization hook
			await this.afterInitialize();

			this._isInitialized = true;
			this.emit("initialized", { service: this.name });

			logger.info(`Service initialized successfully: ${this.name}`);
		} catch (error) {
			logger.error(`Failed to initialize service ${this.name}:`, error);
			throw error;
		}
	}

	/**
	 * Dispose the service - Template Method Pattern
	 * Ensures proper cleanup of resources
	 */
	async dispose(): Promise<void> {
		if (this._isDisposed) {
			logger.warn(`Service ${this.name} is already disposed`);
			return;
		}

		try {
			logger.info(`Disposing service: ${this.name}`);

			// Pre-disposal hook
			await this.beforeDispose();

			// Core disposal - subclasses implement this
			await this.doDispose();

			// Post-disposal hook
			await this.afterDispose();

			this._isInitialized = false;
			this._isDisposed = true;
			this.emit("disposed", { service: this.name });

			logger.info(`Service disposed successfully: ${this.name}`);
		} catch (error) {
			logger.error(`Failed to dispose service ${this.name}:`, error);
			throw error;
		}
	}

	/**
	 * Health check for the service
	 * Subclasses can override for specific health checks
	 */
	async healthCheck(): Promise<boolean> {
		if (!this._isInitialized || this._isDisposed) {
			return false;
		}

		try {
			return await this.doHealthCheck();
		} catch (error) {
			logger.error(`Health check failed for service ${this.name}:`, error);
			return false;
		}
	}

	/**
	 * Set event emitter for publishing events
	 * Dependency Inversion: depends on abstraction, not concrete implementation
	 */
	setEventEmitter(eventEmitter: IEventEmitter): void {
		this._eventEmitter = eventEmitter;
	}

	/**
	 * Set progress reporter for long-running operations
	 * Dependency Inversion: depends on abstraction, not concrete implementation
	 */
	setProgressReporter(progressReporter: IProgressReporter): void {
		this._progressReporter = progressReporter;
	}

	// Protected methods for subclasses - Template Method Pattern

	/**
	 * Hook called before initialization
	 * Subclasses can override for pre-initialization logic
	 */
	protected async beforeInitialize(): Promise<void> {
		// Default implementation - no-op
	}

	/**
	 * Core initialization logic - Abstract method
	 * Subclasses MUST implement this method
	 */
	protected abstract doInitialize(): Promise<void>;

	/**
	 * Hook called after initialization
	 * Subclasses can override for post-initialization logic
	 */
	protected async afterInitialize(): Promise<void> {
		// Default implementation - no-op
	}

	/**
	 * Hook called before disposal
	 * Subclasses can override for pre-disposal logic
	 */
	protected async beforeDispose(): Promise<void> {
		// Default implementation - no-op
	}

	/**
	 * Core disposal logic - Abstract method
	 * Subclasses MUST implement this method
	 */
	protected abstract doDispose(): Promise<void>;

	/**
	 * Hook called after disposal
	 * Subclasses can override for post-disposal logic
	 */
	protected async afterDispose(): Promise<void> {
		// Default implementation - no-op
	}

	/**
	 * Core health check logic
	 * Subclasses can override for specific health checks
	 */
	protected async doHealthCheck(): Promise<boolean> {
		// Default implementation - service is healthy if initialized and not disposed
		return this._isInitialized && !this._isDisposed;
	}

	/**
	 * Emit an event using the event emitter
	 * Provides consistent event publishing across all services
	 */
	protected emit(event: string, data?: any): void {
		if (this._eventEmitter) {
			this._eventEmitter.emit(event, {
				service: this.name,
				timestamp: new Date().toISOString(),
				...data,
			});
		}
	}

	/**
	 * Report progress for long-running operations
	 * Provides consistent progress reporting across all services
	 */
	protected reportProgress(
		current: number,
		total?: number,
		message?: string,
	): void {
		if (this._progressReporter) {
			if (total !== undefined && current === 0) {
				this._progressReporter.start(total, message);
			} else if (total !== undefined && current >= total) {
				this._progressReporter.complete(message);
			} else {
				this._progressReporter.update(current, message);
			}
		}
	}

	/**
	 * Report an error during operations
	 * Provides consistent error reporting across all services
	 */
	protected reportError(error: Error): void {
		if (this._progressReporter) {
			this._progressReporter.error(error);
		}
		this.emit("error", { error: error.message, stack: error.stack });
	}

	/**
	 * Validate that the service is initialized and not disposed
	 * Common validation used by many service methods
	 */
	protected validateServiceState(): void {
		if (this._isDisposed) {
			throw new Error(`Service ${this.name} has been disposed`);
		}

		if (!this._isInitialized) {
			throw new Error(`Service ${this.name} is not initialized`);
		}
	}

	/**
	 * Safe async operation wrapper
	 * Provides consistent error handling and state validation
	 */
	protected async safeExecute<T>(
		operation: () => Promise<T>,
		operationName: string,
		validateState: boolean = true,
	): Promise<T> {
		if (validateState) {
			this.validateServiceState();
		}

		try {
			logger.debug(
				`Starting operation: ${operationName} on service ${this.name}`,
			);
			const result = await operation();
			logger.debug(
				`Completed operation: ${operationName} on service ${this.name}`,
			);
			return result;
		} catch (error) {
			logger.error(
				`Operation failed: ${operationName} on service ${this.name}:`,
				error,
			);
			this.reportError(error as Error);
			throw error;
		}
	}

	/**
	 * Measure operation performance
	 * Provides consistent performance monitoring across all services
	 */
	protected async measurePerformance<T>(
		operation: () => Promise<T>,
		operationName: string,
	): Promise<{ result: T; duration: number }> {
		const startTime = performance.now();

		try {
			const result = await operation();
			const endTime = performance.now();
			const duration = endTime - startTime;

			logger.debug(
				`Performance: ${operationName} took ${duration.toFixed(2)}ms`,
			);
			this.emit("performance", {
				operation: operationName,
				duration,
				success: true,
			});

			return { result, duration };
		} catch (error) {
			const endTime = performance.now();
			const duration = endTime - startTime;

			logger.error(
				`Performance: ${operationName} failed after ${duration.toFixed(2)}ms:`,
				error,
			);
			this.emit("performance", {
				operation: operationName,
				duration,
				success: false,
				error: (error as Error).message,
			});

			throw error;
		}
	}

	/**
	 * Create a scoped logger for this service
	 * Provides consistent logging with service context
	 */
	protected createLogger() {
		return {
			debug: (message: string, meta?: Record<string, any>) => {
				logger.debug(`[${this.name}] ${message}`, meta);
			},
			info: (message: string, meta?: Record<string, any>) => {
				logger.info(`[${this.name}] ${message}`, meta);
			},
			warn: (message: string, meta?: Record<string, any>) => {
				logger.warn(`[${this.name}] ${message}`, meta);
			},
			error: (message: string, error?: Error, meta?: Record<string, any>) => {
				logger.error(`[${this.name}] ${message}`, error, meta);
			},
		};
	}
}

/**
 * Abstract factory for creating services
 * Implements Abstract Factory Pattern
 * Following Dependency Inversion Principle: depends on abstractions
 */
export abstract class BaseServiceFactory {
	protected services = new Map<string, IBaseService>();
	protected eventEmitter?: IEventEmitter;
	protected progressReporter?: IProgressReporter;

	/**
	 * Set event emitter for all created services
	 */
	setEventEmitter(eventEmitter: IEventEmitter): void {
		this.eventEmitter = eventEmitter;

		// Apply to existing services
		for (const service of this.services.values()) {
			if (service instanceof BaseService) {
				service.setEventEmitter(eventEmitter);
			}
		}
	}

	/**
	 * Set progress reporter for all created services
	 */
	setProgressReporter(progressReporter: IProgressReporter): void {
		this.progressReporter = progressReporter;

		// Apply to existing services
		for (const service of this.services.values()) {
			if (service instanceof BaseService) {
				service.setProgressReporter(progressReporter);
			}
		}
	}

	/**
	 * Get or create a service instance - Singleton pattern per service type
	 */
	protected getOrCreateService<T extends IBaseService>(
		key: string,
		factory: () => T,
	): T {
		if (!this.services.has(key)) {
			const service = factory();

			// Configure service with shared dependencies
			if (service instanceof BaseService) {
				if (this.eventEmitter) {
					service.setEventEmitter(this.eventEmitter);
				}
				if (this.progressReporter) {
					service.setProgressReporter(this.progressReporter);
				}
			}

			this.services.set(key, service);
		}

		return this.services.get(key) as T;
	}

	/**
	 * Initialize all created services
	 */
	async initializeAll(): Promise<void> {
		const services = Array.from(this.services.values());

		for (const service of services) {
			await service.initialize();
		}
	}

	/**
	 * Dispose all created services
	 */
	async disposeAll(): Promise<void> {
		const services = Array.from(this.services.values());

		// Dispose in reverse order of creation
		for (const service of services.reverse()) {
			await service.dispose();
		}

		this.services.clear();
	}

	/**
	 * Health check for all services
	 */
	async healthCheckAll(): Promise<Map<string, boolean>> {
		const results = new Map<string, boolean>();

		for (const [key, service] of this.services) {
			try {
				results.set(key, await service.healthCheck());
			} catch (error) {
				logger.error(`Health check failed for service ${key}:`, error);
				results.set(key, false);
			}
		}

		return results;
	}
}

import type { IBaseService } from "../../interfaces";

/**
 * Service metadata for registration
 */
export interface IServiceMetadata {
	readonly name: string;
	readonly version: string;
	readonly description?: string;
	readonly tags?: string[];
	readonly dependencies?: string[];
	readonly endpoints?: IServiceEndpoint[];
	readonly healthEndpoint?: string;
	readonly priority?: number;
}

/**
 * Service endpoint definition
 */
export interface IServiceEndpoint {
	readonly name: string;
	readonly path: string;
	readonly method?: string;
	readonly description?: string;
}

/**
 * Service registration entry
 */
export interface IServiceRegistration {
	readonly id: string;
	readonly metadata: IServiceMetadata;
	readonly instance: IBaseService;
	readonly registeredAt: Date;
	readonly lastHealthCheck?: Date;
	readonly status: ServiceStatus;
}

/**
 * Service status enum
 */
export enum ServiceStatus {
	REGISTERED = "registered",
	INITIALIZING = "initializing",
	ACTIVE = "active",
	UNHEALTHY = "unhealthy",
	STOPPING = "stopping",
	STOPPED = "stopped",
	ERROR = "error"
}

/**
 * Service discovery interface
 */
export interface IServiceDiscovery {
	/**
	 * Register a service
	 */
	register(service: IBaseService, metadata: IServiceMetadata): Promise<string>;

	/**
	 * Unregister a service
	 */
	unregister(serviceId: string): Promise<void>;

	/**
	 * Get a service by ID
	 */
	getService(serviceId: string): IServiceRegistration | undefined;

	/**
	 * Get a service by name
	 */
	getServiceByName(name: string): IServiceRegistration | undefined;

	/**
	 * Get all services
	 */
	getAllServices(): IServiceRegistration[];

	/**
	 * Get services by tag
	 */
	getServicesByTag(tag: string): IServiceRegistration[];

	/**
	 * Get services by status
	 */
	getServicesByStatus(status: ServiceStatus): IServiceRegistration[];

	/**
	 * Update service status
	 */
	updateServiceStatus(serviceId: string, status: ServiceStatus): Promise<void>;

	/**
	 * Health check all services
	 */
	healthCheckAll(): Promise<Map<string, boolean>>;

	/**
	 * Initialize all registered services
	 */
	initializeAll(): Promise<void>;

	/**
	 * Stop all registered services
	 */
	stopAll(): Promise<void>;
}

/**
 * Service discovery events
 */
export interface IServiceDiscoveryEvents {
	"service:registered": { serviceId: string; metadata: IServiceMetadata };
	"service:unregistered": { serviceId: string };
	"service:status:changed": {
		serviceId: string;
		oldStatus: ServiceStatus;
		newStatus: ServiceStatus;
	};
	"service:health:check": { serviceId: string; healthy: boolean };
	"discovery:error": { error: Error; context?: string };
}

/**
 * Service resolver interface for dependency injection
 */
export interface IServiceResolver {
	/**
	 * Resolve a service by type/name
	 */
	resolve<T extends IBaseService>(serviceType: string): T;

	/**
	 * Resolve multiple services by type/name
	 */
	resolveAll<T extends IBaseService>(serviceType: string): T[];

	/**
	 * Check if a service is available
	 */
	has(serviceType: string): boolean;

	/**
	 * Wait for a service to become available
	 */
	waitFor(serviceType: string, timeoutMs?: number): Promise<IBaseService>;
}

/**
 * Service dependency graph
 */
export interface IServiceDependencyGraph {
	/**
	 * Add a dependency relationship
	 */
	addDependency(service: string, dependsOn: string): void;

	/**
	 * Get dependencies for a service
	 */
	getDependencies(service: string): string[];

	/**
	 * Get dependents of a service
	 */
	getDependents(service: string): string[];

	/**
	 * Get initialization order based on dependencies
	 */
	getInitializationOrder(): string[];

	/**
	 * Check for circular dependencies
	 */
	hasCircularDependency(): boolean;

	/**
	 * Get circular dependency path if exists
	 */
	getCircularDependencyPath(): string[] | null;
}
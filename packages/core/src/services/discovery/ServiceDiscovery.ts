import { BaseService } from "../../architecture/base-service";
import { IBaseService, IEventEmitter } from "../../interfaces";
import { logger } from "../../utils/logger";
import {
	IServiceDiscovery,
	IServiceMetadata,
	IServiceRegistration,
	ServiceStatus,
	IServiceDiscoveryEvents,
} from "./interfaces";

/**
 * Service Discovery implementation
 * Manages service registration, discovery, and lifecycle
 */
export class ServiceDiscovery extends BaseService implements IServiceDiscovery {
	private services = new Map<string, IServiceRegistration>();
	private servicesByName = new Map<string, Set<string>>();
	private servicesByTag = new Map<string, Set<string>>();
	private healthCheckInterval?: NodeJS.Timeout;
	private healthCheckIntervalMs = 30000; // 30 seconds

	constructor() {
		super("ServiceDiscovery", "1.0.0");
	}

	protected async doInitialize(): Promise<void> {
		logger.info("Initializing Service Discovery");

		// Start health check interval
		this.startHealthCheckInterval();
	}

	protected async doDispose(): Promise<void> {
		// Stop health check interval
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = undefined;
		}

		// Stop all services
		await this.stopAll();

		// Clear all registrations
		this.services.clear();
		this.servicesByName.clear();
		this.servicesByTag.clear();
	}

	/**
	 * Register a service
	 */
	async register(
		service: IBaseService,
		metadata: IServiceMetadata,
	): Promise<string> {
		this.validateServiceState();

		// Generate unique service ID
		const serviceId = this.generateServiceId(metadata.name, metadata.version);

		// Check if already registered
		if (this.services.has(serviceId)) {
			throw new Error(
				`Service already registered: ${metadata.name}@${metadata.version}`,
			);
		}

		// Create registration entry
		const registration: IServiceRegistration = {
			id: serviceId,
			metadata,
			instance: service,
			registeredAt: new Date(),
			status: ServiceStatus.REGISTERED,
		};

		// Store registration
		this.services.set(serviceId, registration);

		// Index by name
		if (!this.servicesByName.has(metadata.name)) {
			this.servicesByName.set(metadata.name, new Set());
		}
		this.servicesByName.get(metadata.name)!.add(serviceId);

		// Index by tags
		if (metadata.tags) {
			for (const tag of metadata.tags) {
				if (!this.servicesByTag.has(tag)) {
					this.servicesByTag.set(tag, new Set());
				}
				this.servicesByTag.get(tag)!.add(serviceId);
			}
		}

		// Emit registration event
		this.emitDiscoveryEvent("service:registered", {
			serviceId,
			metadata,
		});

		logger.info(
			`Service registered: ${metadata.name}@${metadata.version} (${serviceId})`,
		);

		return serviceId;
	}

	/**
	 * Unregister a service
	 */
	async unregister(serviceId: string): Promise<void> {
		this.validateServiceState();

		const registration = this.services.get(serviceId);
		if (!registration) {
			throw new Error(`Service not found: ${serviceId}`);
		}

		// Update status
		await this.updateServiceStatus(serviceId, ServiceStatus.STOPPING);

		// Stop the service if it's active
		if (
			registration.instance.isInitialized &&
			!registration.instance.isDisposed
		) {
			await registration.instance.dispose();
		}

		// Remove from indexes
		const { metadata } = registration;

		// Remove from name index
		const nameSet = this.servicesByName.get(metadata.name);
		if (nameSet) {
			nameSet.delete(serviceId);
			if (nameSet.size === 0) {
				this.servicesByName.delete(metadata.name);
			}
		}

		// Remove from tag indexes
		if (metadata.tags) {
			for (const tag of metadata.tags) {
				const tagSet = this.servicesByTag.get(tag);
				if (tagSet) {
					tagSet.delete(serviceId);
					if (tagSet.size === 0) {
						this.servicesByTag.delete(tag);
					}
				}
			}
		}

		// Remove registration
		this.services.delete(serviceId);

		// Emit unregistration event
		this.emitDiscoveryEvent("service:unregistered", { serviceId });

		logger.info(`Service unregistered: ${serviceId}`);
	}

	/**
	 * Get a service by ID
	 */
	getService(serviceId: string): IServiceRegistration | undefined {
		return this.services.get(serviceId);
	}

	/**
	 * Get a service by name (returns the first match)
	 */
	getServiceByName(name: string): IServiceRegistration | undefined {
		const serviceIds = this.servicesByName.get(name);
		if (!serviceIds || serviceIds.size === 0) {
			return undefined;
		}

		// Return the first active service, or the first registered
		for (const serviceId of serviceIds) {
			const registration = this.services.get(serviceId);
			if (registration && registration.status === ServiceStatus.ACTIVE) {
				return registration;
			}
		}

		// Return first available
		const firstId = serviceIds.values().next().value;
		return this.services.get(firstId);
	}

	/**
	 * Get all services
	 */
	getAllServices(): IServiceRegistration[] {
		return Array.from(this.services.values());
	}

	/**
	 * Get services by tag
	 */
	getServicesByTag(tag: string): IServiceRegistration[] {
		const serviceIds = this.servicesByTag.get(tag);
		if (!serviceIds) {
			return [];
		}

		return Array.from(serviceIds)
			.map((id) => this.services.get(id))
			.filter((reg): reg is IServiceRegistration => reg !== undefined);
	}

	/**
	 * Get services by status
	 */
	getServicesByStatus(status: ServiceStatus): IServiceRegistration[] {
		return Array.from(this.services.values()).filter(
			(reg) => reg.status === status,
		);
	}

	/**
	 * Update service status
	 */
	async updateServiceStatus(
		serviceId: string,
		status: ServiceStatus,
	): Promise<void> {
		const registration = this.services.get(serviceId);
		if (!registration) {
			throw new Error(`Service not found: ${serviceId}`);
		}

		const oldStatus = registration.status;
		if (oldStatus === status) {
			return; // No change
		}

		// Update status
		(registration as any).status = status;

		// Emit status change event
		this.emitDiscoveryEvent("service:status:changed", {
			serviceId,
			oldStatus,
			newStatus: status,
		});

		logger.debug(
			`Service status updated: ${serviceId} (${oldStatus} -> ${status})`,
		);
	}

	/**
	 * Health check all services
	 */
	async healthCheckAll(): Promise<Map<string, boolean>> {
		const results = new Map<string, boolean>();

		for (const [serviceId, registration] of this.services) {
			try {
				const healthy = await registration.instance.healthCheck();
				results.set(serviceId, healthy);

				// Update last health check time
				(registration as any).lastHealthCheck = new Date();

				// Update status based on health
				if (healthy && registration.status === ServiceStatus.UNHEALTHY) {
					await this.updateServiceStatus(serviceId, ServiceStatus.ACTIVE);
				} else if (!healthy && registration.status === ServiceStatus.ACTIVE) {
					await this.updateServiceStatus(serviceId, ServiceStatus.UNHEALTHY);
				}

				// Emit health check event
				this.emitDiscoveryEvent("service:health:check", {
					serviceId,
					healthy,
				});
			} catch (error) {
				logger.error(`Health check failed for service ${serviceId}:`, error);
				results.set(serviceId, false);

				// Update status to error if health check throws
				if (registration.status === ServiceStatus.ACTIVE) {
					await this.updateServiceStatus(serviceId, ServiceStatus.ERROR);
				}
			}
		}

		return results;
	}

	/**
	 * Initialize all registered services
	 */
	async initializeAll(): Promise<void> {
		const registrations = Array.from(this.services.values());

		// Sort by priority (lower priority initializes first)
		registrations.sort(
			(a, b) => (a.metadata.priority ?? 100) - (b.metadata.priority ?? 100),
		);

		for (const registration of registrations) {
			if (
				registration.status === ServiceStatus.REGISTERED ||
				registration.status === ServiceStatus.STOPPED
			) {
				try {
					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.INITIALIZING,
					);

					await registration.instance.initialize();

					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.ACTIVE,
					);
				} catch (error) {
					logger.error(
						`Failed to initialize service ${registration.id}:`,
						error,
					);

					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.ERROR,
					);

					// Continue with other services
				}
			}
		}
	}

	/**
	 * Stop all registered services
	 */
	async stopAll(): Promise<void> {
		const registrations = Array.from(this.services.values());

		// Sort by priority in reverse (higher priority stops first)
		registrations.sort(
			(a, b) => (b.metadata.priority ?? 100) - (a.metadata.priority ?? 100),
		);

		for (const registration of registrations) {
			if (
				registration.status === ServiceStatus.ACTIVE ||
				registration.status === ServiceStatus.UNHEALTHY
			) {
				try {
					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.STOPPING,
					);

					if (!registration.instance.isDisposed) {
						await registration.instance.dispose();
					}

					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.STOPPED,
					);
				} catch (error) {
					logger.error(`Failed to stop service ${registration.id}:`, error);

					await this.updateServiceStatus(
						registration.id,
						ServiceStatus.ERROR,
					);
				}
			}
		}
	}

	/**
	 * Start health check interval
	 */
	private startHealthCheckInterval(): void {
		if (this.healthCheckInterval) {
			return; // Already started
		}

		this.healthCheckInterval = setInterval(async () => {
			try {
				await this.healthCheckAll();
			} catch (error) {
				logger.error("Health check interval error:", error);
			}
		}, this.healthCheckIntervalMs);
	}

	/**
	 * Generate a unique service ID
	 */
	private generateServiceId(name: string, version: string): string {
		return `${name}@${version}-${Date.now()}`;
	}

	/**
	 * Emit a discovery event
	 */
	private emitDiscoveryEvent<K extends keyof IServiceDiscoveryEvents>(
		event: K,
		data: IServiceDiscoveryEvents[K],
	): void {
		this.emit(`discovery:${event}`, data);
	}
}

/**
 * Service Resolver implementation
 * Provides dependency injection capabilities
 */
export class ServiceResolver {
	constructor(private readonly discovery: IServiceDiscovery) {}

	/**
	 * Resolve a service by type/name
	 */
	resolve<T extends IBaseService>(serviceType: string): T {
		const registration = this.discovery.getServiceByName(serviceType);
		if (!registration) {
			throw new Error(`Service not found: ${serviceType}`);
		}

		if (registration.status !== ServiceStatus.ACTIVE) {
			throw new Error(
				`Service not active: ${serviceType} (status: ${registration.status})`,
			);
		}

		return registration.instance as T;
	}

	/**
	 * Resolve multiple services by type/name
	 */
	resolveAll<T extends IBaseService>(serviceType: string): T[] {
		const registrations = this.discovery
			.getAllServices()
			.filter(
				(reg) =>
					reg.metadata.name === serviceType &&
					reg.status === ServiceStatus.ACTIVE,
			);

		return registrations.map((reg) => reg.instance as T);
	}

	/**
	 * Check if a service is available
	 */
	has(serviceType: string): boolean {
		const registration = this.discovery.getServiceByName(serviceType);
		return registration !== undefined && registration.status === ServiceStatus.ACTIVE;
	}

	/**
	 * Wait for a service to become available
	 */
	async waitFor(
		serviceType: string,
		timeoutMs: number = 30000,
	): Promise<IBaseService> {
		const startTime = Date.now();

		while (Date.now() - startTime < timeoutMs) {
			const registration = this.discovery.getServiceByName(serviceType);
			if (registration && registration.status === ServiceStatus.ACTIVE) {
				return registration.instance;
			}

			// Wait 100ms before checking again
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		throw new Error(
			`Timeout waiting for service: ${serviceType} (${timeoutMs}ms)`,
		);
	}
}
import { ServiceDiscovery } from "./ServiceDiscovery";
import { ServiceDependencyGraph } from "./DependencyGraph";
import type { IBaseService } from "../../interfaces";
import { type IServiceMetadata, ServiceStatus } from "./interfaces";
import { logger } from "../../utils/logger";

/**
 * Service Discovery Manager with dependency management
 * Extends basic discovery with dependency graph and ordered initialization
 */
export class ServiceDiscoveryManager extends ServiceDiscovery {
	private dependencyGraph = new ServiceDependencyGraph();

	constructor() {
		super();
	}

	/**
	 * Register a service with dependency management
	 */
	async register(
		service: IBaseService,
		metadata: IServiceMetadata,
	): Promise<string> {
		// Register the service
		const serviceId = await super.register(service, metadata);

		// Add to dependency graph
		this.dependencyGraph.addDependency(metadata.name, metadata.name); // Self-reference to ensure it's in the graph

		// Add dependencies if specified
		if (metadata.dependencies && metadata.dependencies.length > 0) {
			for (const dependency of metadata.dependencies) {
				this.dependencyGraph.addDependency(metadata.name, dependency);
			}

			// Check for circular dependencies
			if (this.dependencyGraph.hasCircularDependency()) {
				// Unregister the service to maintain consistency
				await super.unregister(serviceId);

				// Remove from dependency graph
				this.dependencyGraph.removeService(metadata.name);

				const cyclePath = this.dependencyGraph.getCircularDependencyPath();
				throw new Error(
					`Circular dependency detected: ${cyclePath?.join(" -> ")}`,
				);
			}
		}

		return serviceId;
	}

	/**
	 * Unregister a service with dependency checking
	 */
	async unregister(serviceId: string): Promise<void> {
		const registration = this.getService(serviceId);
		if (!registration) {
			throw new Error(`Service not found: ${serviceId}`);
		}

		// Check if other services depend on this one
		const dependents = this.dependencyGraph.getDependents(
			registration.metadata.name,
		);
		const activeDependents = dependents.filter((dep) => {
			const depReg = this.getServiceByName(dep);
			return (
				depReg &&
				depReg.status !== ServiceStatus.STOPPED &&
				depReg.status !== ServiceStatus.STOPPING
			);
		});

		if (activeDependents.length > 0) {
			logger.warn(
				`Service ${registration.metadata.name} has active dependents: ${activeDependents.join(", ")}`,
			);
		}

		// Remove from dependency graph
		this.dependencyGraph.removeService(registration.metadata.name);

		// Unregister the service
		await super.unregister(serviceId);
	}

	/**
	 * Initialize all services in dependency order
	 */
	async initializeAll(): Promise<void> {
		try {
			// Get initialization order
			const initOrder = this.dependencyGraph.getInitializationOrder();

			logger.info(
				`Initializing services in dependency order: ${initOrder.join(" -> ")}`,
			);

			// Initialize services in order
			for (const serviceName of initOrder) {
				const registration = this.getServiceByName(serviceName);
				if (!registration) {
					logger.warn(
						`Service ${serviceName} in dependency graph but not registered`,
					);
					continue;
				}

				if (
					registration.status === ServiceStatus.REGISTERED ||
					registration.status === ServiceStatus.STOPPED
				) {
					// Check if all dependencies are active
					const deps = this.dependencyGraph.getDependencies(serviceName);
					const missingDeps = deps.filter((dep) => {
						if (dep === serviceName) return false; // Skip self-reference
						const depReg = this.getServiceByName(dep);
						return !depReg || depReg.status !== ServiceStatus.ACTIVE;
					});

					if (missingDeps.length > 0) {
						logger.error(
							`Cannot initialize ${serviceName}: missing dependencies: ${missingDeps.join(", ")}`,
						);
						await this.updateServiceStatus(
							registration.id,
							ServiceStatus.ERROR,
						);
						continue;
					}

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

						logger.info(`Service initialized: ${serviceName}`);
					} catch (error) {
						logger.error(`Failed to initialize service ${serviceName}:`, error);

						await this.updateServiceStatus(
							registration.id,
							ServiceStatus.ERROR,
						);

						// Don't continue if a dependency fails
						const dependents = this.dependencyGraph.getDependents(serviceName);
						if (dependents.length > 0) {
							throw new Error(
								`Service ${serviceName} initialization failed, blocking dependents: ${dependents.join(", ")}`,
							);
						}
					}
				}
			}
		} catch (error) {
			logger.error("Service initialization failed:", error);
			throw error;
		}
	}

	/**
	 * Stop all services in reverse dependency order
	 */
	async stopAll(): Promise<void> {
		try {
			// Get initialization order and reverse it
			const stopOrder = this.dependencyGraph
				.getInitializationOrder()
				.reverse();

			logger.info(
				`Stopping services in reverse dependency order: ${stopOrder.join(" -> ")}`,
			);

			// Stop services in order
			for (const serviceName of stopOrder) {
				const registration = this.getServiceByName(serviceName);
				if (!registration) {
					continue;
				}

				if (
					registration.status === ServiceStatus.ACTIVE ||
					registration.status === ServiceStatus.UNHEALTHY
				) {
					try {
						await this.updateServiceStatus(
							registration.id,
							ServiceStatus.STOPPING,
						);

						await registration.instance.dispose();

						await this.updateServiceStatus(
							registration.id,
							ServiceStatus.STOPPED,
						);

						logger.info(`Service stopped: ${serviceName}`);
					} catch (error) {
						logger.error(`Failed to stop service ${serviceName}:`, error);

						await this.updateServiceStatus(
							registration.id,
							ServiceStatus.ERROR,
						);
					}
				}
			}
		} catch (error) {
			logger.error("Service shutdown failed:", error);
			throw error;
		}
	}

	/**
	 * Get service dependency information
	 */
	getServiceDependencyInfo(serviceName: string): {
		dependencies: string[];
		dependents: string[];
		canStop: boolean;
		canStart: boolean;
	} {
		const registration = this.getServiceByName(serviceName);
		const dependencies = this.dependencyGraph.getDependencies(serviceName);
		const dependents = this.dependencyGraph.getDependents(serviceName);

		// Can stop if no active dependents
		const activeDependents = dependents.filter((dep) => {
			const depReg = this.getServiceByName(dep);
			return (
				depReg &&
				depReg.status !== ServiceStatus.STOPPED &&
				depReg.status !== ServiceStatus.STOPPING
			);
		});

		// Can start if all dependencies are active
		const inactiveDependencies = dependencies.filter((dep) => {
			if (dep === serviceName) return false; // Skip self-reference
			const depReg = this.getServiceByName(dep);
			return !depReg || depReg.status !== ServiceStatus.ACTIVE;
		});

		return {
			dependencies: dependencies.filter((d) => d !== serviceName),
			dependents: dependents.filter((d) => d !== serviceName),
			canStop: activeDependents.length === 0,
			canStart:
				inactiveDependencies.length === 0 &&
				registration !== undefined &&
				(registration.status === ServiceStatus.REGISTERED ||
					registration.status === ServiceStatus.STOPPED),
		};
	}

	/**
	 * Visualize the dependency graph
	 */
	getDependencyGraphVisualization(): string {
		return this.dependencyGraph.toGraphviz();
	}

	/**
	 * Get a report of all services and their dependencies
	 */
	getServicesReport(): {
		services: Array<{
			id: string;
			name: string;
			version: string;
			status: ServiceStatus;
			dependencies: string[];
			dependents: string[];
			tags: string[];
			healthCheck: { lastCheck?: Date; healthy?: boolean };
		}>;
		summary: {
			total: number;
			active: number;
			unhealthy: number;
			stopped: number;
			error: number;
		};
	} {
		const services = this.getAllServices().map((reg) => ({
			id: reg.id,
			name: reg.metadata.name,
			version: reg.metadata.version,
			status: reg.status,
			dependencies: this.dependencyGraph
				.getDependencies(reg.metadata.name)
				.filter((d) => d !== reg.metadata.name),
			dependents: this.dependencyGraph
				.getDependents(reg.metadata.name)
				.filter((d) => d !== reg.metadata.name),
			tags: reg.metadata.tags || [],
			healthCheck: {
				lastCheck: reg.lastHealthCheck,
				healthy:
					reg.status === ServiceStatus.ACTIVE ||
					reg.status === ServiceStatus.REGISTERED,
			},
		}));

		const summary = {
			total: services.length,
			active: services.filter((s) => s.status === ServiceStatus.ACTIVE).length,
			unhealthy: services.filter((s) => s.status === ServiceStatus.UNHEALTHY)
				.length,
			stopped: services.filter((s) => s.status === ServiceStatus.STOPPED)
				.length,
			error: services.filter((s) => s.status === ServiceStatus.ERROR).length,
		};

		return { services, summary };
	}
}
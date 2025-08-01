import type { IServiceDependencyGraph } from "./interfaces";

/**
 * Service Dependency Graph implementation
 * Manages service dependencies and determines initialization order
 */
export class ServiceDependencyGraph implements IServiceDependencyGraph {
	private dependencies = new Map<string, Set<string>>();
	private dependents = new Map<string, Set<string>>();

	/**
	 * Add a dependency relationship
	 */
	addDependency(service: string, dependsOn: string): void {
		// Add to dependencies map
		if (!this.dependencies.has(service)) {
			this.dependencies.set(service, new Set());
		}
		this.dependencies.get(service)!.add(dependsOn);

		// Add to dependents map (reverse mapping)
		if (!this.dependents.has(dependsOn)) {
			this.dependents.set(dependsOn, new Set());
		}
		this.dependents.get(dependsOn)!.add(service);

		// Ensure both services exist in maps
		if (!this.dependencies.has(dependsOn)) {
			this.dependencies.set(dependsOn, new Set());
		}
		if (!this.dependents.has(service)) {
			this.dependents.set(service, new Set());
		}
	}

	/**
	 * Get dependencies for a service
	 */
	getDependencies(service: string): string[] {
		const deps = this.dependencies.get(service);
		return deps ? Array.from(deps) : [];
	}

	/**
	 * Get dependents of a service
	 */
	getDependents(service: string): string[] {
		const deps = this.dependents.get(service);
		return deps ? Array.from(deps) : [];
	}

	/**
	 * Get initialization order based on dependencies
	 * Uses topological sort
	 */
	getInitializationOrder(): string[] {
		const visited = new Set<string>();
		const visiting = new Set<string>();
		const order: string[] = [];

		// DFS visit function
		const visit = (service: string): void => {
			if (visited.has(service)) {
				return;
			}

			if (visiting.has(service)) {
				throw new Error(
					`Circular dependency detected involving service: ${service}`,
				);
			}

			visiting.add(service);

			// Visit dependencies first
			const deps = this.dependencies.get(service) || new Set();
			for (const dep of deps) {
				visit(dep);
			}

			visiting.delete(service);
			visited.add(service);
			order.push(service);
		};

		// Visit all services
		for (const service of this.dependencies.keys()) {
			if (!visited.has(service)) {
				visit(service);
			}
		}

		return order;
	}

	/**
	 * Check for circular dependencies
	 */
	hasCircularDependency(): boolean {
		try {
			this.getInitializationOrder();
			return false;
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("Circular dependency")
			) {
				return true;
			}
			throw error;
		}
	}

	/**
	 * Get circular dependency path if exists
	 */
	getCircularDependencyPath(): string[] | null {
		const visited = new Set<string>();
		const path: string[] = [];

		// DFS to find cycle
		const findCycle = (service: string): string[] | null => {
			if (path.includes(service)) {
				// Found a cycle
				const cycleStart = path.indexOf(service);
				return path.slice(cycleStart).concat(service);
			}

			if (visited.has(service)) {
				return null;
			}

			path.push(service);

			const deps = this.dependencies.get(service) || new Set();
			for (const dep of deps) {
				const cycle = findCycle(dep);
				if (cycle) {
					return cycle;
				}
			}

			path.pop();
			visited.add(service);
			return null;
		};

		// Check all services
		for (const service of this.dependencies.keys()) {
			const cycle = findCycle(service);
			if (cycle) {
				return cycle;
			}
		}

		return null;
	}

	/**
	 * Get all services in the graph
	 */
	getAllServices(): string[] {
		const services = new Set<string>();
		for (const service of this.dependencies.keys()) {
			services.add(service);
		}
		for (const service of this.dependents.keys()) {
			services.add(service);
		}
		return Array.from(services);
	}

	/**
	 * Remove a service from the graph
	 */
	removeService(service: string): void {
		// Remove from dependencies
		this.dependencies.delete(service);

		// Remove from other services' dependencies
		for (const deps of this.dependencies.values()) {
			deps.delete(service);
		}

		// Remove from dependents
		this.dependents.delete(service);

		// Remove from other services' dependents
		for (const deps of this.dependents.values()) {
			deps.delete(service);
		}
	}

	/**
	 * Clear all dependencies
	 */
	clear(): void {
		this.dependencies.clear();
		this.dependents.clear();
	}

	/**
	 * Get a visualization-friendly representation
	 */
	toGraphviz(): string {
		const lines: string[] = ["digraph ServiceDependencies {"];

		for (const [service, deps] of this.dependencies) {
			for (const dep of deps) {
				lines.push(`  "${service}" -> "${dep}";`);
			}
		}

		lines.push("}");
		return lines.join("\n");
	}
}
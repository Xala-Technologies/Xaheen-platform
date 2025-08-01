import type { IEventMetadata, IEventRegistry } from "./interfaces";
import { logger } from "../utils/logger";

/**
 * Event registry implementation
 * Manages event definitions and metadata
 */
export class EventRegistry implements IEventRegistry {
	private events = new Map<string, IEventMetadata>();

	/**
	 * Register an event
	 */
	register(metadata: IEventMetadata): void {
		if (this.events.has(metadata.name)) {
			logger.warn(`Event already registered: ${metadata.name}`);
		}

		this.events.set(metadata.name, metadata);
		logger.debug(`Event registered: ${metadata.name}`);

		// Log deprecation warning
		if (metadata.deprecated) {
			logger.warn(
				`Event ${metadata.name} is deprecated: ${metadata.deprecationMessage || "No reason provided"}`,
			);
		}
	}

	/**
	 * Get event metadata
	 */
	getMetadata(event: string): IEventMetadata | undefined {
		const metadata = this.events.get(event);

		// Log deprecation warning when accessed
		if (metadata?.deprecated) {
			logger.warn(
				`Using deprecated event ${event}: ${metadata.deprecationMessage || "No reason provided"}`,
			);
		}

		return metadata;
	}

	/**
	 * Get all registered events
	 */
	getAllEvents(): IEventMetadata[] {
		return Array.from(this.events.values());
	}

	/**
	 * Check if event is registered
	 */
	isRegistered(event: string): boolean {
		return this.events.has(event);
	}

	/**
	 * Validate event data against schema
	 */
	validate(event: string, data: any): { valid: boolean; errors?: string[] } {
		const metadata = this.events.get(event);
		if (!metadata) {
			return { valid: false, errors: [`Event not registered: ${event}`] };
		}

		if (!metadata.schema) {
			// No schema defined, consider valid
			return { valid: true };
		}

		// Basic schema validation (in a real implementation, use a proper JSON Schema validator)
		try {
			const errors = this.validateSchema(data, metadata.schema);
			return {
				valid: errors.length === 0,
				errors: errors.length > 0 ? errors : undefined,
			};
		} catch (error) {
			return {
				valid: false,
				errors: [`Schema validation error: ${(error as Error).message}`],
			};
		}
	}

	/**
	 * Get events by tag
	 */
	getEventsByTag(tag: string): IEventMetadata[] {
		return Array.from(this.events.values()).filter(
			(metadata) => metadata.tags?.includes(tag),
		);
	}

	/**
	 * Get deprecated events
	 */
	getDeprecatedEvents(): IEventMetadata[] {
		return Array.from(this.events.values()).filter(
			(metadata) => metadata.deprecated,
		);
	}

	/**
	 * Unregister an event
	 */
	unregister(event: string): void {
		if (this.events.delete(event)) {
			logger.debug(`Event unregistered: ${event}`);
		}
	}

	/**
	 * Clear all events
	 */
	clear(): void {
		this.events.clear();
	}

	/**
	 * Basic schema validation
	 */
	private validateSchema(data: any, schema: any): string[] {
		const errors: string[] = [];

		// Basic type validation
		if (schema.type) {
			const actualType = Array.isArray(data) ? "array" : typeof data;
			if (actualType !== schema.type) {
				errors.push(`Expected type ${schema.type}, got ${actualType}`);
			}
		}

		// Required properties
		if (schema.required && Array.isArray(schema.required)) {
			for (const prop of schema.required) {
				if (!(prop in data)) {
					errors.push(`Missing required property: ${prop}`);
				}
			}
		}

		// Properties validation
		if (schema.properties && typeof data === "object" && !Array.isArray(data)) {
			for (const [prop, propSchema] of Object.entries(schema.properties)) {
				if (prop in data) {
					const propErrors = this.validateSchema(
						data[prop],
						propSchema as any,
					);
					errors.push(
						...propErrors.map((err) => `Property ${prop}: ${err}`),
					);
				}
			}
		}

		return errors;
	}
}

/**
 * Global event registry singleton
 */
let globalRegistry: EventRegistry | null = null;

/**
 * Get the global event registry instance
 */
export function getGlobalEventRegistry(): EventRegistry {
	if (!globalRegistry) {
		globalRegistry = new EventRegistry();
	}
	return globalRegistry;
}
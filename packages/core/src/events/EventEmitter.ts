import { v4 as uuidv4 } from "uuid";
import type {
	EventListener,
	IEventEmitter,
	IEventSubscription,
} from "./interfaces";

/**
 * Event subscription implementation
 */
class EventSubscription implements IEventSubscription {
	constructor(
		public readonly id: string,
		public readonly event: string,
		public readonly listener: EventListener,
		public readonly once: boolean,
		public readonly priority: number,
		private readonly emitter: EventEmitter,
	) {}

	unsubscribe(): void {
		this.emitter.off(this.event, this.listener);
	}
}

/**
 * Basic event emitter implementation
 */
export class EventEmitter implements IEventEmitter {
	private listeners = new Map<string, Set<{
		listener: EventListener;
		once: boolean;
		priority: number;
		id: string;
	}>>();

	/**
	 * Subscribe to an event
	 */
	on<T = any>(event: string, listener: EventListener<T>): IEventSubscription {
		return this.addListener(event, listener, false, 100);
	}

	/**
	 * Subscribe to an event once
	 */
	once<T = any>(event: string, listener: EventListener<T>): IEventSubscription {
		return this.addListener(event, listener, true, 100);
	}

	/**
	 * Emit an event
	 */
	async emit<T = any>(event: string, data: T): Promise<void> {
		const eventListeners = this.listeners.get(event);
		if (!eventListeners || eventListeners.size === 0) {
			return;
		}

		// Sort listeners by priority
		const sortedListeners = Array.from(eventListeners).sort(
			(a, b) => a.priority - b.priority,
		);

		// Execute listeners
		const promises: Promise<void>[] = [];

		for (const { listener, once, id } of sortedListeners) {
			// Remove once listeners before execution
			if (once) {
				eventListeners.delete(
					Array.from(eventListeners).find((l) => l.id === id)!,
				);
			}

			// Execute listener
			try {
				const result = listener(data);
				if (result instanceof Promise) {
					promises.push(result);
				}
			} catch (error) {
				// Log error but don't stop other listeners
				console.error(`Error in event listener for ${event}:`, error);
			}
		}

		// Wait for all async listeners
		await Promise.all(promises);

		// Clean up empty listener sets
		if (eventListeners.size === 0) {
			this.listeners.delete(event);
		}
	}

	/**
	 * Remove a listener
	 */
	off(event: string, listener: EventListener): void {
		const eventListeners = this.listeners.get(event);
		if (!eventListeners) {
			return;
		}

		// Find and remove the listener
		for (const entry of eventListeners) {
			if (entry.listener === listener) {
				eventListeners.delete(entry);
				break;
			}
		}

		// Clean up empty listener sets
		if (eventListeners.size === 0) {
			this.listeners.delete(event);
		}
	}

	/**
	 * Remove all listeners for an event
	 */
	removeAllListeners(event?: string): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get listener count for an event
	 */
	listenerCount(event: string): number {
		const eventListeners = this.listeners.get(event);
		return eventListeners ? eventListeners.size : 0;
	}

	/**
	 * Get all event names
	 */
	eventNames(): string[] {
		return Array.from(this.listeners.keys());
	}

	/**
	 * Add a listener with options
	 */
	protected addListener(
		event: string,
		listener: EventListener,
		once: boolean,
		priority: number,
	): IEventSubscription {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}

		const id = uuidv4();
		const entry = { listener, once, priority, id };
		this.listeners.get(event)!.add(entry);

		return new EventSubscription(id, event, listener, once, priority, this);
	}
}
import { EventEmitter } from "./EventEmitter";
import type {
	EventListener,
	IEventBus,
	IEventHistoryEntry,
	IEventInterceptor,
	IEventSubscription,
} from "./interfaces";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Unified Event Bus implementation
 * Provides centralized event management with history, interceptors, and patterns
 */
export class EventBus extends EventEmitter implements IEventBus {
	private enabled = true;
	private historyEnabled = false;
	private history: IEventHistoryEntry[] = [];
	private maxHistorySize = 1000;
	private interceptors: IEventInterceptor[] = [];
	private anyListeners = new Set<EventListener>();
	private waiters = new Map<string, Array<{
		resolve: (data: any) => void;
		reject: (error: Error) => void;
		filter?: (data: any) => boolean;
		timeoutId?: NodeJS.Timeout;
	}>>();

	constructor(
		private readonly name: string = "EventBus",
	) {
		super();
		logger.info(`Event bus created: ${name}`);
	}

	/**
	 * Subscribe with priority
	 */
	onWithPriority<T = any>(
		event: string,
		listener: EventListener<T>,
		priority: number,
	): IEventSubscription {
		return this.addListener(event, listener, false, priority);
	}

	/**
	 * Subscribe to all events
	 */
	onAny(listener: EventListener): IEventSubscription {
		const id = uuidv4();
		this.anyListeners.add(listener);

		// Return subscription that can unsubscribe
		return {
			id,
			event: "*",
			listener,
			once: false,
			priority: 100,
			unsubscribe: () => {
				this.anyListeners.delete(listener);
			},
		};
	}

	/**
	 * Wait for an event to occur
	 */
	async waitFor<T = any>(
		event: string,
		timeoutMs: number = 30000,
		filter?: (data: T) => boolean,
	): Promise<T> {
		return new Promise((resolve, reject) => {
			// Create waiter entry
			const waiter = {
				resolve,
				reject,
				filter,
				timeoutId: undefined as NodeJS.Timeout | undefined,
			};

			// Set timeout
			if (timeoutMs > 0) {
				waiter.timeoutId = setTimeout(() => {
					// Remove from waiters
					const waiters = this.waiters.get(event);
					if (waiters) {
						const index = waiters.indexOf(waiter);
						if (index !== -1) {
							waiters.splice(index, 1);
						}
					}

					reject(new Error(`Timeout waiting for event: ${event} (${timeoutMs}ms)`));
				}, timeoutMs);
			}

			// Add to waiters
			if (!this.waiters.has(event)) {
				this.waiters.set(event, []);
			}
			this.waiters.get(event)!.push(waiter);
		});
	}

	/**
	 * Emit an event with interceptor support
	 */
	async emit<T = any>(event: string, data: T): Promise<void> {
		if (!this.enabled) {
			return;
		}

		const startTime = performance.now();
		let transformedData = data;

		try {
			// Run beforeEmit interceptors
			for (const interceptor of this.interceptors) {
				if (interceptor.beforeEmit) {
					const shouldContinue = await interceptor.beforeEmit(event, transformedData);
					if (!shouldContinue) {
						logger.debug(`Event ${event} cancelled by interceptor`);
						return;
					}
				}
			}

			// Transform data
			for (const interceptor of this.interceptors) {
				if (interceptor.transformData) {
					transformedData = await interceptor.transformData(event, transformedData);
				}
			}

			// Emit to specific event listeners
			const listenerCount = this.listenerCount(event);
			await super.emit(event, transformedData);

			// Emit to "any" listeners
			for (const listener of this.anyListeners) {
				try {
					await listener({ event, data: transformedData });
				} catch (error) {
					logger.error(`Error in 'any' listener:`, error);
				}
			}

			// Notify waiters
			const waiters = this.waiters.get(event);
			if (waiters && waiters.length > 0) {
				const resolvedWaiters: typeof waiters = [];

				for (const waiter of waiters) {
					// Check filter
					if (!waiter.filter || waiter.filter(transformedData)) {
						// Clear timeout
						if (waiter.timeoutId) {
							clearTimeout(waiter.timeoutId);
						}

						// Resolve promise
						waiter.resolve(transformedData);
						resolvedWaiters.push(waiter);
					}
				}

				// Remove resolved waiters
				for (const resolved of resolvedWaiters) {
					const index = waiters.indexOf(resolved);
					if (index !== -1) {
						waiters.splice(index, 1);
					}
				}

				// Clean up empty waiter lists
				if (waiters.length === 0) {
					this.waiters.delete(event);
				}
			}

			const duration = performance.now() - startTime;

			// Record in history
			if (this.historyEnabled) {
				this.addToHistory({
					id: uuidv4(),
					event,
					data: transformedData,
					timestamp: new Date(),
					listenerCount: listenerCount + this.anyListeners.size,
					duration,
				});
			}

			// Run afterEmit interceptors
			for (const interceptor of this.interceptors) {
				if (interceptor.afterEmit) {
					await interceptor.afterEmit(
						event,
						transformedData,
						listenerCount + this.anyListeners.size,
						duration,
					);
				}
			}

			logger.debug(
				`Event emitted: ${event} (${listenerCount} listeners, ${duration.toFixed(2)}ms)`,
			);
		} catch (error) {
			// Handle errors
			for (const interceptor of this.interceptors) {
				if (interceptor.onError) {
					await interceptor.onError(event, error as Error);
				}
			}

			logger.error(`Error emitting event ${event}:`, error);
			throw error;
		}
	}

	/**
	 * Enable/disable event bus
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		logger.info(`Event bus ${this.name} ${enabled ? "enabled" : "disabled"}`);
	}

	/**
	 * Check if event bus is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Get event history
	 */
	getHistory(limit?: number): IEventHistoryEntry[] {
		if (limit) {
			return this.history.slice(-limit);
		}
		return [...this.history];
	}

	/**
	 * Clear event history
	 */
	clearHistory(): void {
		this.history = [];
	}

	/**
	 * Enable/disable history recording
	 */
	setHistoryEnabled(enabled: boolean): void {
		this.historyEnabled = enabled;
		if (!enabled) {
			this.clearHistory();
		}
	}

	/**
	 * Add an interceptor
	 */
	addInterceptor(interceptor: IEventInterceptor): void {
		this.interceptors.push(interceptor);
	}

	/**
	 * Remove an interceptor
	 */
	removeInterceptor(interceptor: IEventInterceptor): void {
		const index = this.interceptors.indexOf(interceptor);
		if (index !== -1) {
			this.interceptors.splice(index, 1);
		}
	}

	/**
	 * Get interceptor count
	 */
	getInterceptorCount(): number {
		return this.interceptors.length;
	}

	/**
	 * Set maximum history size
	 */
	setMaxHistorySize(size: number): void {
		this.maxHistorySize = size;
		this.trimHistory();
	}

	/**
	 * Get statistics about the event bus
	 */
	getStatistics(): {
		eventCount: number;
		listenerCount: number;
		anyListenerCount: number;
		waiterCount: number;
		historySize: number;
		interceptorCount: number;
		enabled: boolean;
		historyEnabled: boolean;
	} {
		let totalListeners = 0;
		let totalWaiters = 0;

		for (const event of this.eventNames()) {
			totalListeners += this.listenerCount(event);
		}

		for (const waiters of this.waiters.values()) {
			totalWaiters += waiters.length;
		}

		return {
			eventCount: this.eventNames().length,
			listenerCount: totalListeners,
			anyListenerCount: this.anyListeners.size,
			waiterCount: totalWaiters,
			historySize: this.history.length,
			interceptorCount: this.interceptors.length,
			enabled: this.enabled,
			historyEnabled: this.historyEnabled,
		};
	}

	/**
	 * Create a scoped event bus that prefixes all events
	 */
	createScoped(scope: string): IEventBus {
		const scopedBus = new ScopedEventBus(this, scope);
		return scopedBus;
	}

	/**
	 * Add event to history
	 */
	private addToHistory(entry: IEventHistoryEntry): void {
		this.history.push(entry);
		this.trimHistory();
	}

	/**
	 * Trim history to max size
	 */
	private trimHistory(): void {
		if (this.history.length > this.maxHistorySize) {
			this.history = this.history.slice(-this.maxHistorySize);
		}
	}
}

/**
 * Scoped event bus that prefixes all events
 */
class ScopedEventBus extends EventBus {
	constructor(
		private readonly parent: IEventBus,
		private readonly scope: string,
	) {
		super(`${scope}:ScopedEventBus`);
	}

	async emit<T = any>(event: string, data: T): Promise<void> {
		// Emit on parent with scoped event name
		const scopedEvent = `${this.scope}:${event}`;
		await this.parent.emit(scopedEvent, data);

		// Also emit locally
		await super.emit(event, data);
	}

	on<T = any>(event: string, listener: EventListener<T>): IEventSubscription {
		// Subscribe to parent with scoped event name
		const scopedEvent = `${this.scope}:${event}`;
		const parentSub = this.parent.on(scopedEvent, listener);

		// Also subscribe locally
		const localSub = super.on(event, listener);

		// Return subscription that unsubscribes from both
		return {
			id: localSub.id,
			event,
			listener,
			once: false,
			priority: 100,
			unsubscribe: () => {
				parentSub.unsubscribe();
				localSub.unsubscribe();
			},
		};
	}
}

/**
 * Global event bus singleton
 */
let globalEventBus: EventBus | null = null;

/**
 * Get the global event bus instance
 */
export function getGlobalEventBus(): EventBus {
	if (!globalEventBus) {
		globalEventBus = new EventBus("GlobalEventBus");
		globalEventBus.setHistoryEnabled(true);
		globalEventBus.setMaxHistorySize(500);
	}
	return globalEventBus;
}
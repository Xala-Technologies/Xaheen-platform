/**
 * Event listener function type
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>;

/**
 * Event subscription interface
 */
export interface IEventSubscription {
	readonly id: string;
	readonly event: string;
	readonly listener: EventListener;
	readonly once: boolean;
	readonly priority: number;
	unsubscribe(): void;
}

/**
 * Event emitter interface
 */
export interface IEventEmitter {
	/**
	 * Subscribe to an event
	 */
	on<T = any>(event: string, listener: EventListener<T>): IEventSubscription;

	/**
	 * Subscribe to an event once
	 */
	once<T = any>(event: string, listener: EventListener<T>): IEventSubscription;

	/**
	 * Emit an event
	 */
	emit<T = any>(event: string, data: T): Promise<void>;

	/**
	 * Remove a listener
	 */
	off(event: string, listener: EventListener): void;

	/**
	 * Remove all listeners for an event
	 */
	removeAllListeners(event?: string): void;

	/**
	 * Get listener count for an event
	 */
	listenerCount(event: string): number;

	/**
	 * Get all event names
	 */
	eventNames(): string[];
}

/**
 * Event bus interface - extends event emitter with additional features
 */
export interface IEventBus extends IEventEmitter {
	/**
	 * Subscribe with priority (lower priority executes first)
	 */
	onWithPriority<T = any>(
		event: string,
		listener: EventListener<T>,
		priority: number,
	): IEventSubscription;

	/**
	 * Subscribe to all events
	 */
	onAny(listener: EventListener): IEventSubscription;

	/**
	 * Wait for an event to occur
	 */
	waitFor<T = any>(
		event: string,
		timeoutMs?: number,
		filter?: (data: T) => boolean,
	): Promise<T>;

	/**
	 * Enable/disable event bus
	 */
	setEnabled(enabled: boolean): void;

	/**
	 * Check if event bus is enabled
	 */
	isEnabled(): boolean;

	/**
	 * Get event history
	 */
	getHistory(limit?: number): IEventHistoryEntry[];

	/**
	 * Clear event history
	 */
	clearHistory(): void;

	/**
	 * Enable/disable history recording
	 */
	setHistoryEnabled(enabled: boolean): void;
}

/**
 * Event history entry
 */
export interface IEventHistoryEntry {
	readonly id: string;
	readonly event: string;
	readonly data: any;
	readonly timestamp: Date;
	readonly listenerCount: number;
	readonly duration?: number;
}

/**
 * Event interceptor for middleware functionality
 */
export interface IEventInterceptor {
	/**
	 * Called before event is emitted
	 * Return false to cancel event emission
	 */
	beforeEmit?(event: string, data: any): boolean | Promise<boolean>;

	/**
	 * Called after event is emitted
	 */
	afterEmit?(
		event: string,
		data: any,
		listenerCount: number,
		duration: number,
	): void | Promise<void>;

	/**
	 * Transform event data before emission
	 */
	transformData?(event: string, data: any): any | Promise<any>;

	/**
	 * Handle errors during event emission
	 */
	onError?(
		event: string,
		error: Error,
		listener?: EventListener,
	): void | Promise<void>;
}

/**
 * Event pattern for wildcard matching
 */
export interface IEventPattern {
	/**
	 * Pattern string (e.g., "user.*", "*.created")
	 */
	pattern: string;

	/**
	 * Test if an event matches this pattern
	 */
	matches(event: string): boolean;
}

/**
 * Event metadata
 */
export interface IEventMetadata {
	readonly name: string;
	readonly description?: string;
	readonly schema?: any; // JSON Schema for validation
	readonly deprecated?: boolean;
	readonly deprecationMessage?: string;
	readonly tags?: string[];
}

/**
 * Event registry for managing event definitions
 */
export interface IEventRegistry {
	/**
	 * Register an event
	 */
	register(metadata: IEventMetadata): void;

	/**
	 * Get event metadata
	 */
	getMetadata(event: string): IEventMetadata | undefined;

	/**
	 * Get all registered events
	 */
	getAllEvents(): IEventMetadata[];

	/**
	 * Check if event is registered
	 */
	isRegistered(event: string): boolean;

	/**
	 * Validate event data against schema
	 */
	validate(event: string, data: any): { valid: boolean; errors?: string[] };
}
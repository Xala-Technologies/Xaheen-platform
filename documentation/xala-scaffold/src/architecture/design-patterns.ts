/**
 * Design Patterns Implementation for SOLID Architecture
 *
 * This file contains implementations of common design patterns
 * that support the SOLID principles throughout the scaffolding system.
 *
 * Features:
 * - Observer Pattern for event-driven architecture
 * - Strategy Pattern for pluggable algorithms
 * - Command Pattern for operation encapsulation
 * - Decorator Pattern for feature composition
 * - Builder Pattern for complex object construction
 * - Template Method Pattern for algorithmic frameworks
 * - Chain of Responsibility for request processing
 */

import { logger } from "../utils/logger.js";
import {
	IEventEmitter,
	IEventListener,
	IProgressReporter,
} from "./interfaces.js";

// === Observer Pattern ===

/**
 * Event emitter implementation
 * Supports the Observer pattern for loose coupling between components
 */
export class EventEmitter implements IEventEmitter {
	private listeners = new Map<string, Set<(data?: any) => void>>();
	private wildcardListeners = new Set<(event: string, data?: any) => void>();
	private maxListeners = 100;

	/**
	 * Emit an event to all registered listeners
	 */
	emit(event: string, data?: any): void {
		// Emit to specific event listeners
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			for (const listener of eventListeners) {
				try {
					listener(data);
				} catch (error) {
					logger.error(`Error in event listener for ${event}:`, error);
				}
			}
		}

		// Emit to wildcard listeners
		for (const listener of this.wildcardListeners) {
			try {
				listener(event, data);
			} catch (error) {
				logger.error(`Error in wildcard event listener for ${event}:`, error);
			}
		}
	}

	/**
	 * Register an event listener
	 */
	on(event: string, handler: (data?: any) => void): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}

		const eventListeners = this.listeners.get(event)!;

		if (eventListeners.size >= this.maxListeners) {
			logger.warn(
				`Maximum listeners (${this.maxListeners}) exceeded for event: ${event}`,
			);
		}

		eventListeners.add(handler);

		// Return unsubscribe function
		return () => {
			eventListeners.delete(handler);
			if (eventListeners.size === 0) {
				this.listeners.delete(event);
			}
		};
	}

	/**
	 * Remove an event listener
	 */
	off(event: string, handler: (data?: any) => void): void {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.delete(handler);
			if (eventListeners.size === 0) {
				this.listeners.delete(event);
			}
		}
	}

	/**
	 * Register a one-time event listener
	 */
	once(event: string, handler: (data?: any) => void): () => void {
		const onceHandler = (data?: any) => {
			handler(data);
			this.off(event, onceHandler);
		};

		return this.on(event, onceHandler);
	}

	/**
	 * Register a wildcard listener that receives all events
	 */
	onWildcard(handler: (event: string, data?: any) => void): () => void {
		this.wildcardListeners.add(handler);

		return () => {
			this.wildcardListeners.delete(handler);
		};
	}

	/**
	 * Remove all listeners for an event or all events
	 */
	removeAllListeners(event?: string): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
			this.wildcardListeners.clear();
		}
	}

	/**
	 * Get the number of listeners for an event
	 */
	listenerCount(event: string): number {
		const eventListeners = this.listeners.get(event);
		return eventListeners ? eventListeners.size : 0;
	}

	/**
	 * Set the maximum number of listeners per event
	 */
	setMaxListeners(max: number): void {
		this.maxListeners = max;
	}

	/**
	 * Get all event names with listeners
	 */
	eventNames(): string[] {
		return Array.from(this.listeners.keys());
	}
}

// === Strategy Pattern ===

/**
 * Abstract strategy interface
 * Defines the contract for interchangeable algorithms
 */
export interface IStrategy<TInput, TOutput> {
	readonly name: string;
	execute(input: TInput, context?: any): Promise<TOutput>;
	canHandle(input: TInput, context?: any): boolean;
}

/**
 * Strategy context
 * Manages strategy selection and execution
 */
export class StrategyContext<TInput, TOutput> {
	private strategies = new Map<string, IStrategy<TInput, TOutput>>();
	private defaultStrategy?: IStrategy<TInput, TOutput>;

	/**
	 * Register a strategy
	 */
	registerStrategy(strategy: IStrategy<TInput, TOutput>): void {
		this.strategies.set(strategy.name, strategy);
	}

	/**
	 * Unregister a strategy
	 */
	unregisterStrategy(name: string): boolean {
		return this.strategies.delete(name);
	}

	/**
	 * Set the default strategy
	 */
	setDefaultStrategy(strategy: IStrategy<TInput, TOutput>): void {
		this.defaultStrategy = strategy;
		this.registerStrategy(strategy);
	}

	/**
	 * Execute using the best matching strategy
	 */
	async execute(input: TInput, context?: any): Promise<TOutput> {
		// Find the first strategy that can handle the input
		for (const strategy of this.strategies.values()) {
			if (strategy.canHandle(input, context)) {
				logger.debug(`Executing strategy: ${strategy.name}`);
				return strategy.execute(input, context);
			}
		}

		// Use default strategy if available
		if (this.defaultStrategy) {
			logger.debug(`Using default strategy: ${this.defaultStrategy.name}`);
			return this.defaultStrategy.execute(input, context);
		}

		throw new Error("No suitable strategy found for input");
	}

	/**
	 * Execute using a specific strategy
	 */
	async executeStrategy(
		name: string,
		input: TInput,
		context?: any,
	): Promise<TOutput> {
		const strategy = this.strategies.get(name);
		if (!strategy) {
			throw new Error(`Strategy not found: ${name}`);
		}

		return strategy.execute(input, context);
	}

	/**
	 * Get all registered strategy names
	 */
	getStrategyNames(): string[] {
		return Array.from(this.strategies.keys());
	}

	/**
	 * Check if a strategy is registered
	 */
	hasStrategy(name: string): boolean {
		return this.strategies.has(name);
	}
}

// === Command Pattern ===

/**
 * Command interface
 * Encapsulates a request as an object
 */
export interface ICommand<TResult = void> {
	readonly name: string;
	readonly description?: string;
	execute(): Promise<TResult>;
	undo?(): Promise<void>;
	canUndo?(): boolean;
}

/**
 * Command invoker
 * Manages command execution and history
 */
export class CommandInvoker {
	private history: ICommand[] = [];
	private currentIndex = -1;
	private maxHistorySize = 100;

	/**
	 * Execute a command
	 */
	async execute<T>(command: ICommand<T>): Promise<T> {
		try {
			logger.debug(`Executing command: ${command.name}`);
			const result = await command.execute();

			// Add to history if command supports undo
			if (command.undo && command.canUndo?.() !== false) {
				this.addToHistory(command);
			}

			return result;
		} catch (error) {
			logger.error(`Command execution failed: ${command.name}:`, error);
			throw error;
		}
	}

	/**
	 * Undo the last command
	 */
	async undo(): Promise<void> {
		if (!this.canUndo()) {
			throw new Error("No command to undo");
		}

		const command = this.history[this.currentIndex];

		try {
			logger.debug(`Undoing command: ${command.name}`);
			await command.undo!();
			this.currentIndex--;
		} catch (error) {
			logger.error(`Command undo failed: ${command.name}:`, error);
			throw error;
		}
	}

	/**
	 * Redo the next command
	 */
	async redo(): Promise<void> {
		if (!this.canRedo()) {
			throw new Error("No command to redo");
		}

		this.currentIndex++;
		const command = this.history[this.currentIndex];

		try {
			logger.debug(`Redoing command: ${command.name}`);
			await command.execute();
		} catch (error) {
			logger.error(`Command redo failed: ${command.name}:`, error);
			this.currentIndex--;
			throw error;
		}
	}

	/**
	 * Check if undo is possible
	 */
	canUndo(): boolean {
		return this.currentIndex >= 0;
	}

	/**
	 * Check if redo is possible
	 */
	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	/**
	 * Clear command history
	 */
	clearHistory(): void {
		this.history = [];
		this.currentIndex = -1;
	}

	/**
	 * Get command history
	 */
	getHistory(): ReadonlyArray<ICommand> {
		return this.history.slice(0, this.currentIndex + 1);
	}

	/**
	 * Set maximum history size
	 */
	setMaxHistorySize(size: number): void {
		this.maxHistorySize = size;
		this.trimHistory();
	}

	private addToHistory(command: ICommand): void {
		// Remove any commands after current index (for new branches)
		this.history = this.history.slice(0, this.currentIndex + 1);

		// Add new command
		this.history.push(command);
		this.currentIndex++;

		// Trim history if needed
		this.trimHistory();
	}

	private trimHistory(): void {
		if (this.history.length > this.maxHistorySize) {
			const excess = this.history.length - this.maxHistorySize;
			this.history = this.history.slice(excess);
			this.currentIndex -= excess;
		}
	}
}

// === Decorator Pattern ===

/**
 * Component interface for decoration
 */
export interface IComponent<T> {
	execute(input: T): Promise<T>;
}

/**
 * Base decorator class
 * Implements the Decorator pattern for feature composition
 */
export abstract class BaseDecorator<T> implements IComponent<T> {
	protected component: IComponent<T>;

	constructor(component: IComponent<T>) {
		this.component = component;
	}

	async execute(input: T): Promise<T> {
		return this.component.execute(input);
	}
}

/**
 * Logging decorator
 * Adds logging to any component
 */
export class LoggingDecorator<T> extends BaseDecorator<T> {
	private operationName: string;

	constructor(component: IComponent<T>, operationName: string) {
		super(component);
		this.operationName = operationName;
	}

	async execute(input: T): Promise<T> {
		const startTime = performance.now();
		logger.debug(`Starting ${this.operationName}`);

		try {
			const result = await super.execute(input);
			const duration = performance.now() - startTime;
			logger.debug(
				`Completed ${this.operationName} in ${duration.toFixed(2)}ms`,
			);
			return result;
		} catch (error) {
			const duration = performance.now() - startTime;
			logger.error(
				`Failed ${this.operationName} after ${duration.toFixed(2)}ms:`,
				error,
			);
			throw error;
		}
	}
}

/**
 * Validation decorator
 * Adds validation to any component
 */
export class ValidationDecorator<T> extends BaseDecorator<T> {
	private validator: (input: T) => Promise<boolean>;
	private errorMessage: string;

	constructor(
		component: IComponent<T>,
		validator: (input: T) => Promise<boolean>,
		errorMessage: string = "Validation failed",
	) {
		super(component);
		this.validator = validator;
		this.errorMessage = errorMessage;
	}

	async execute(input: T): Promise<T> {
		const isValid = await this.validator(input);
		if (!isValid) {
			throw new Error(this.errorMessage);
		}

		return super.execute(input);
	}
}

/**
 * Caching decorator
 * Adds caching to any component
 */
export class CachingDecorator<T> extends BaseDecorator<T> {
	private cache = new Map<string, { result: T; timestamp: number }>();
	private ttl: number;
	private keyGenerator: (input: T) => string;

	constructor(
		component: IComponent<T>,
		ttl: number = 300000, // 5 minutes
		keyGenerator: (input: T) => string = (input) => JSON.stringify(input),
	) {
		super(component);
		this.ttl = ttl;
		this.keyGenerator = keyGenerator;
	}

	async execute(input: T): Promise<T> {
		const key = this.keyGenerator(input);
		const cached = this.cache.get(key);

		if (cached && Date.now() - cached.timestamp < this.ttl) {
			logger.debug(`Cache hit for key: ${key}`);
			return cached.result;
		}

		logger.debug(`Cache miss for key: ${key}`);
		const result = await super.execute(input);

		this.cache.set(key, { result, timestamp: Date.now() });
		return result;
	}

	clearCache(): void {
		this.cache.clear();
	}

	getCacheSize(): number {
		return this.cache.size;
	}
}

// === Builder Pattern ===

/**
 * Abstract builder interface
 * Defines the contract for building complex objects
 */
export interface IBuilder<T> {
	build(): T;
	reset(): this;
}

/**
 * Director class for managing build process
 * Implements the Builder pattern for complex object construction
 */
export class Director<T> {
	private builder: IBuilder<T>;

	constructor(builder: IBuilder<T>) {
		this.builder = builder;
	}

	setBuilder(builder: IBuilder<T>): void {
		this.builder = builder;
	}

	construct(): T {
		return this.builder.build();
	}
}

// === Template Method Pattern ===

/**
 * Abstract template class
 * Defines the skeleton of an algorithm
 */
export abstract class AbstractTemplate<TInput, TOutput> {
	/**
	 * Template method - defines the algorithm structure
	 * Following Template Method pattern
	 */
	async execute(input: TInput): Promise<TOutput> {
		await this.beforeExecution(input);

		try {
			const validated = await this.validateInput(input);
			const processed = await this.processInput(validated);
			const result = await this.generateOutput(processed);

			await this.afterExecution(result);
			return result;
		} catch (error) {
			await this.handleError(error as Error, input);
			throw error;
		}
	}

	// Abstract methods - subclasses must implement
	protected abstract validateInput(input: TInput): Promise<TInput>;
	protected abstract processInput(input: TInput): Promise<any>;
	protected abstract generateOutput(processed: any): Promise<TOutput>;

	// Hook methods - subclasses can override
	protected async beforeExecution(input: TInput): Promise<void> {
		// Default implementation - no-op
	}

	protected async afterExecution(result: TOutput): Promise<void> {
		// Default implementation - no-op
	}

	protected async handleError(error: Error, input: TInput): Promise<void> {
		logger.error("Template execution error:", error);
	}
}

// === Chain of Responsibility Pattern ===

/**
 * Handler interface for chain of responsibility
 */
export interface IHandler<TRequest, TResponse> {
	setNext(
		handler: IHandler<TRequest, TResponse>,
	): IHandler<TRequest, TResponse>;
	handle(request: TRequest): Promise<TResponse | null>;
}

/**
 * Abstract handler base class
 * Implements the Chain of Responsibility pattern
 */
export abstract class AbstractHandler<TRequest, TResponse>
	implements IHandler<TRequest, TResponse>
{
	private nextHandler?: IHandler<TRequest, TResponse>;

	setNext(
		handler: IHandler<TRequest, TResponse>,
	): IHandler<TRequest, TResponse> {
		this.nextHandler = handler;
		return handler;
	}

	async handle(request: TRequest): Promise<TResponse | null> {
		const result = await this.doHandle(request);

		if (result !== null) {
			return result;
		}

		if (this.nextHandler) {
			return this.nextHandler.handle(request);
		}

		return null;
	}

	protected abstract doHandle(request: TRequest): Promise<TResponse | null>;
}

// === Factory Method Pattern ===

/**
 * Abstract factory interface
 * Defines the contract for creating objects
 */
export interface IFactory<T> {
	create(type: string, ...args: any[]): T;
	getSupportedTypes(): string[];
}

/**
 * Registry-based factory
 * Implements the Factory Method pattern with registration
 */
export class RegistryFactory<T> implements IFactory<T> {
	private creators = new Map<string, (...args: any[]) => T>();

	/**
	 * Register a creator function for a type
	 */
	register(type: string, creator: (...args: any[]) => T): void {
		this.creators.set(type, creator);
	}

	/**
	 * Unregister a type
	 */
	unregister(type: string): boolean {
		return this.creators.delete(type);
	}

	/**
	 * Create an instance of the specified type
	 */
	create(type: string, ...args: any[]): T {
		const creator = this.creators.get(type);
		if (!creator) {
			throw new Error(`Unknown type: ${type}`);
		}

		return creator(...args);
	}

	/**
	 * Get all supported types
	 */
	getSupportedTypes(): string[] {
		return Array.from(this.creators.keys());
	}

	/**
	 * Check if a type is supported
	 */
	supportsType(type: string): boolean {
		return this.creators.has(type);
	}
}

// === Singleton Pattern ===

/**
 * Thread-safe singleton base class
 * Implements the Singleton pattern with lazy initialization
 */
export abstract class Singleton<T> {
	private static instances = new Map<Function, any>();
	private static readonly lock = {};

	protected constructor() {
		const constructor = this.constructor as Function;
		if (Singleton.instances.has(constructor)) {
			throw new Error(
				`Singleton instance already exists for ${constructor.name}`,
			);
		}
	}

	static getInstance<T extends Singleton<any>>(this: new () => T): T {
		const constructor = this as new () => T;

		if (!Singleton.instances.has(constructor)) {
			// Double-checked locking pattern
			synchronized(Singleton.lock, () => {
				if (!Singleton.instances.has(constructor)) {
					const instance = new constructor();
					Singleton.instances.set(constructor, instance);
				}
			});
		}

		return Singleton.instances.get(constructor);
	}

	static resetInstance<T extends Singleton<any>>(this: new () => T): void {
		const constructor = this as new () => T;
		Singleton.instances.delete(constructor);
	}

	static resetAllInstances(): void {
		Singleton.instances.clear();
	}
}

// === Utility Functions ===

/**
 * Simple synchronization primitive
 * For implementing thread-safe operations
 */
function synchronized(lock: any, fn: () => void): void {
	// In JavaScript, this is a no-op since we have single-threaded execution
	// But this provides the interface for potential future use with Web Workers
	fn();
}

/**
 * Mixin function for adding capabilities to classes
 * Implements the Mixin pattern
 */
export function applyMixins(derivedCtor: any, constructors: any[]): void {
	constructors.forEach((baseCtor) => {
		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
			Object.defineProperty(
				derivedCtor.prototype,
				name,
				Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
					Object.create(null),
			);
		});
	});
}

/**
 * Disposable interface for resource management
 */
export interface IDisposable {
	dispose(): Promise<void>;
}

/**
 * Using function for automatic resource disposal
 * Implements the RAII (Resource Acquisition Is Initialization) pattern
 */
export async function using<T extends IDisposable, TResult>(
	resource: T,
	action: (resource: T) => Promise<TResult>,
): Promise<TResult> {
	try {
		return await action(resource);
	} finally {
		await resource.dispose();
	}
}

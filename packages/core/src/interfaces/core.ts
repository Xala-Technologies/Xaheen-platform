// Core interfaces for SOLID architecture implementation
// Single Responsibility: Each interface has a single, well-defined purpose
// Interface Segregation: Specific interfaces instead of large monolithic ones
// Dependency Inversion: Abstract contracts for implementation details

import type { LocaleCode, NorwegianCompliance } from "./types";

// === Core Service Interfaces ===

/**
 * Base service interface - Single Responsibility Principle
 * All services implement this basic contract
 */
export interface IBaseService {
	readonly name: string;
	readonly version: string;
	readonly isInitialized: boolean;
	readonly isDisposed: boolean;
	initialize(): Promise<void>;
	dispose(): Promise<void>;
	healthCheck(): Promise<boolean>;
}

/**
 * Configuration service interface - manages application configuration
 */
export interface IConfigurationService extends IBaseService {
	get<T>(key: string, defaultValue?: T): T;
	set<T>(key: string, value: T): void;
	has(key: string): boolean;
	getAll(): Record<string, any>;
	load(source: string): Promise<void>;
	save(destination: string): Promise<void>;
	watch(key: string, callback: (value: any) => void): () => void;
}

/**
 * Logging service interface - handles application logging
 */
export interface ILoggingService extends IBaseService {
	debug(message: string, meta?: Record<string, any>): void;
	info(message: string, meta?: Record<string, any>): void;
	warn(message: string, meta?: Record<string, any>): void;
	error(message: string, error?: Error, meta?: Record<string, any>): void;
	setLevel(level: "debug" | "info" | "warn" | "error"): void;
	addTransport(transport: ILogTransport): void;
}

/**
 * Log transport interface - Interface Segregation Principle
 */
export interface ILogTransport {
	readonly name: string;
	log(
		level: string,
		message: string,
		meta?: Record<string, any>,
	): Promise<void>;
}

/**
 * File system service interface - abstracts file operations
 */
export interface IFileSystemService extends IBaseService {
	exists(path: string): Promise<boolean>;
	read(path: string): Promise<string>;
	write(path: string, content: string): Promise<void>;
	delete(path: string): Promise<void>;
	createDirectory(path: string): Promise<void>;
	list(path: string): Promise<string[]>;
	copy(source: string, destination: string): Promise<void>;
	move(source: string, destination: string): Promise<void>;
	getStats(path: string): Promise<IFileStats>;
}

/**
 * File statistics interface
 */
export interface IFileStats {
	size: number;
	isFile: boolean;
	isDirectory: boolean;
	createdAt: Date;
	modifiedAt: Date;
}

// === Observer Pattern Interfaces ===

/**
 * Event listener interface - subscribes to events
 */
export interface IEventListener {
	handleEvent(event: string, data?: any): void;
	getSupportedEvents(): string[];
}

/**
 * Progress reporter interface - reports operation progress
 */
export interface IProgressReporter {
	start(total: number, message?: string): void;
	update(current: number, message?: string): void;
	complete(message?: string): void;
	error(error: Error): void;
}

// === Factory Interfaces - Abstract Factory Pattern ===

/**
 * Service factory interface - creates service instances
 */
export interface IServiceFactory {
	createConfigurationService(): IConfigurationService;
	createLoggingService(): ILoggingService;
	createFileSystemService(): IFileSystemService;
}

export type {
	// Re-export types for convenience
	LocaleCode,
	NorwegianCompliance,
};

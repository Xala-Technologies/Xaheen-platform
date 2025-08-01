/**
 * SOLID Architecture Module
 *
 * This module exports all architectural components that implement SOLID principles
 * and design patterns for the Xala UI System scaffolding system.
 *
 * Features:
 * - Complete interface definitions following Interface Segregation Principle
 * - Base service classes implementing Single Responsibility Principle
 * - Service container with Dependency Inversion Principle
 * - Factory implementations following Open/Closed Principle
 * - Design patterns supporting Liskov Substitution Principle
 * - Norwegian compliance integration throughout
 *
 * Architecture Principles:
 * 1. Single Responsibility Principle (SRP)
 *    - Each class has one reason to change
 *    - Services focus on specific concerns
 *
 * 2. Open/Closed Principle (OCP)
 *    - Open for extension through inheritance and composition
 *    - Closed for modification through abstractions
 *
 * 3. Liskov Substitution Principle (LSP)
 *    - All implementations are substitutable for their interfaces
 *    - Derived classes honor base class contracts
 *
 * 4. Interface Segregation Principle (ISP)
 *    - Many specific interfaces rather than monolithic ones
 *    - Clients depend only on interfaces they use
 *
 * 5. Dependency Inversion Principle (DIP)
 *    - High-level modules don't depend on low-level modules
 *    - Both depend on abstractions
 */

// === Base Classes ===
export { BaseService, BaseServiceFactory } from "./base-service.js";
// === Design Patterns ===
export {
	AbstractHandler,
	// Template Method Pattern
	AbstractTemplate,
	applyMixins,
	BaseDecorator,
	CachingDecorator,
	CommandInvoker,
	Director,
	// Observer Pattern
	EventEmitter,
	// Builder Pattern
	type IBuilder,
	// Command Pattern
	type ICommand,
	// Decorator Pattern
	type IComponent,
	// Utility Types and Functions
	type IDisposable,
	// Factory Method Pattern
	type IFactory,
	// Chain of Responsibility Pattern
	type IHandler,
	// Strategy Pattern
	type IStrategy,
	LoggingDecorator,
	RegistryFactory,
	// Singleton Pattern
	Singleton,
	StrategyContext,
	using,
	ValidationDecorator,
} from "./design-patterns.js";
// === Core Interfaces ===
export * from "./interfaces.js";
// === Service Container ===
export {
	defaultContainer,
	ServiceContainer,
	ServiceLocator,
} from "./service-container.js";
// === Service Factory ===
export {
	disposeDefaultFactory,
	getDefaultServiceFactory,
	initializeDefaultFactory,
	ServiceFactory,
	ServiceFactoryBuilder,
	setDefaultServiceFactory,
} from "./service-factory.js";

// === Architectural Constants ===

/**
 * Service categories for organization
 */
export const SERVICE_CATEGORIES = {
	CORE: "core",
	GENERATION: "generation",
	VALIDATION: "validation",
	TEMPLATING: "templating",
	MIGRATION: "migration",
	LOCALIZATION: "localization",
	FILESYSTEM: "filesystem",
	CONFIGURATION: "configuration",
	LOGGING: "logging",
	EVENTS: "events",
	PROGRESS: "progress",
} as const;

/**
 * Service tags for flexible grouping
 */
export const SERVICE_TAGS = {
	// Functional tags
	CODEGEN: "codegen",
	SCAFFOLDING: "scaffolding",
	TEMPLATES: "templates",
	VALIDATION: "validation",
	MIGRATION: "migration",
	LOCALIZATION: "localization",

	// Quality tags
	COMPLIANCE: "compliance",
	NORWEGIAN: "norwegian",
	ACCESSIBILITY: "accessibility",
	SECURITY: "security",
	PERFORMANCE: "performance",

	// Technical tags
	FILESYSTEM: "filesystem",
	CONFIG: "config",
	LOGGING: "logging",
	EVENTS: "events",
	PROGRESS: "progress",

	// Platform tags
	NEXTJS: "nextjs",
	REACT: "react",
	TYPESCRIPT: "typescript",
	NODEJS: "nodejs",
} as const;

/**
 * Architecture metadata
 */
export const ARCHITECTURE_INFO = {
	version: "1.0.0",
	author: "Xala Technologies",
	description: "SOLID architecture implementation for UI system scaffolding",
	compliance: {
		nsm: "OPEN",
		gdpr: true,
		wcag: "AAA",
	},
	principles: [
		"Single Responsibility Principle",
		"Open/Closed Principle",
		"Liskov Substitution Principle",
		"Interface Segregation Principle",
		"Dependency Inversion Principle",
	],
	patterns: [
		"Observer Pattern",
		"Strategy Pattern",
		"Command Pattern",
		"Decorator Pattern",
		"Builder Pattern",
		"Template Method Pattern",
		"Chain of Responsibility Pattern",
		"Factory Method Pattern",
		"Singleton Pattern",
		"Service Locator Pattern",
		"Dependency Injection Pattern",
	],
} as const;

// === Type Definitions ===

/**
 * Service category type
 */
export type ServiceCategory =
	(typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];

/**
 * Service tag type
 */
export type ServiceTag = (typeof SERVICE_TAGS)[keyof typeof SERVICE_TAGS];

/**
 * Architecture configuration
 */
export interface ArchitectureConfig {
	enableLogging?: boolean;
	enableEvents?: boolean;
	enableProgress?: boolean;
	maxServices?: number;
	defaultScope?: string;
	compliance?: {
		norwegian?: boolean;
		gdpr?: boolean;
		accessibility?: boolean;
	};
}

// === Utility Functions ===

/**
 * Create a standard service metadata object
 */
export function createServiceMetadata(
	description: string,
	category: ServiceCategory,
	tags: ServiceTag[] = [],
	version: string = "1.0.0",
	author: string = "Xala Technologies",
): {
	description: string;
	category: ServiceCategory;
	tags: ServiceTag[];
	version: string;
	author: string;
} {
	return {
		description,
		category,
		tags,
		version,
		author,
	};
}

/**
 * Validate service metadata
 */
export function validateServiceMetadata(metadata: any): boolean {
	if (!metadata || typeof metadata !== "object") {
		return false;
	}

	// Check required fields
	if (!metadata.description || typeof metadata.description !== "string") {
		return false;
	}

	if (
		!metadata.category ||
		!Object.values(SERVICE_CATEGORIES).includes(metadata.category)
	) {
		return false;
	}

	// Check optional fields
	if (metadata.tags && !Array.isArray(metadata.tags)) {
		return false;
	}

	if (metadata.version && typeof metadata.version !== "string") {
		return false;
	}

	if (metadata.author && typeof metadata.author !== "string") {
		return false;
	}

	return true;
}

/**
 * Check if service follows SOLID principles
 * Basic validation for service design
 */
export function validateSOLIDCompliance(service: any): {
	isCompliant: boolean;
	violations: string[];
	suggestions: string[];
} {
	const violations: string[] = [];
	const suggestions: string[] = [];

	// Single Responsibility Principle
	if (typeof service.name !== "string" || !service.name) {
		violations.push(
			"SRP: Service must have a clear name indicating its responsibility",
		);
	}

	// Open/Closed Principle
	if (typeof service.constructor !== "function") {
		violations.push("OCP: Service should be a class that can be extended");
	}

	// Liskov Substitution Principle
	if (service.constructor && service.constructor.prototype) {
		const proto = service.constructor.prototype;
		if (!proto.initialize || typeof proto.initialize !== "function") {
			suggestions.push(
				"LSP: Consider implementing initialize() method for consistent behavior",
			);
		}
	}

	// Interface Segregation Principle
	const methodCount = Object.getOwnPropertyNames(service).filter(
		(prop) => typeof service[prop] === "function",
	).length;

	if (methodCount > 20) {
		violations.push(
			"ISP: Service has too many methods, consider splitting into smaller interfaces",
		);
	}

	// Dependency Inversion Principle
	if (!service.setDependencies && !service.constructor.dependencies) {
		suggestions.push("DIP: Consider implementing dependency injection support");
	}

	return {
		isCompliant: violations.length === 0,
		violations,
		suggestions,
	};
}

/**
 * Create an architecture-compliant service ID
 */
export function createServiceId(
	name: string,
	category: ServiceCategory,
	version?: string,
): string {
	const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
	const sanitizedCategory = category.toLowerCase();

	if (version) {
		return `${sanitizedCategory}.${sanitizedName}.v${version}`;
	}

	return `${sanitizedCategory}.${sanitizedName}`;
}

/**
 * Parse a service ID into components
 */
export function parseServiceId(serviceId: string): {
	category?: string;
	name?: string;
	version?: string;
} | null {
	const parts = serviceId.split(".");

	if (parts.length < 2) {
		return null;
	}

	const [category, name, versionPart] = parts;
	let version: string | undefined;

	if (versionPart && versionPart.startsWith("v")) {
		version = versionPart.substring(1);
	}

	return {
		category,
		name,
		version,
	};
}

/**
 * Check if a service ID is valid
 */
export function isValidServiceId(serviceId: string): boolean {
	const parsed = parseServiceId(serviceId);

	if (!parsed || !parsed.category || !parsed.name) {
		return false;
	}

	// Check if category is valid
	const validCategories = Object.values(SERVICE_CATEGORIES);
	if (!validCategories.includes(parsed.category as ServiceCategory)) {
		return false;
	}

	return true;
}

// === Architecture Validation ===

/**
 * Validate the entire architecture setup
 */
export async function validateArchitecture(factory: ServiceFactory): Promise<{
	isValid: boolean;
	issues: string[];
	warnings: string[];
	suggestions: string[];
	statistics: any;
}> {
	const issues: string[] = [];
	const warnings: string[] = [];
	const suggestions: string[] = [];

	try {
		// Check if factory is initialized
		const healthResults = await factory.healthCheck();
		let healthyServices = 0;
		let totalServices = 0;

		for (const [serviceId, isHealthy] of healthResults) {
			totalServices++;
			if (isHealthy) {
				healthyServices++;
			} else {
				issues.push(`Service is not healthy: ${serviceId}`);
			}

			// Validate service ID format
			if (!isValidServiceId(serviceId)) {
				warnings.push(
					`Service ID does not follow naming convention: ${serviceId}`,
				);
			}
		}

		// Check service coverage
		const requiredCategories = [
			SERVICE_CATEGORIES.CORE,
			SERVICE_CATEGORIES.GENERATION,
			SERVICE_CATEGORIES.VALIDATION,
			SERVICE_CATEGORIES.TEMPLATING,
		];

		const servicesByCategory =
			factory.getStatistics().containerStats.categoryCounts;

		for (const category of requiredCategories) {
			if (!servicesByCategory[category] || servicesByCategory[category] === 0) {
				issues.push(`Missing services in required category: ${category}`);
			}
		}

		// Performance suggestions
		if (totalServices > 50) {
			suggestions.push(
				"Consider organizing services into modules for better performance",
			);
		}

		const statistics = {
			totalServices,
			healthyServices,
			healthPercentage:
				totalServices > 0 ? (healthyServices / totalServices) * 100 : 0,
			servicesByCategory,
			factoryStats: factory.getStatistics(),
		};

		return {
			isValid: issues.length === 0,
			issues,
			warnings,
			suggestions,
			statistics,
		};
	} catch (error) {
		issues.push(`Architecture validation failed: ${(error as Error).message}`);

		return {
			isValid: false,
			issues,
			warnings,
			suggestions,
			statistics: null,
		};
	}
}

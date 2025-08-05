/**
 * @fileoverview Modular Generator System
 * @description Clean, modular generator orchestration using domain-specific executors
 * @author Xala Technologies
 * @version 3.0.0
 */

import type {
	GeneratorOptions,
	GeneratorResult,
	GeneratorType,
} from "../types/index.js";

// Import modular executor system
import type {
	IGeneratorExecutor,
	GeneratorContext,
	ProjectInfo,
} from "./executors/index.js";

import {
	BackendExecutor,
	FrontendExecutor,
	DevOpsExecutor,
	ComplianceExecutor,
} from "./executors/index.js";

/**
 * Generator categories for organization and help
 */
export const GENERATOR_CATEGORIES = {
	frontend: ["page", "layout", "component", "hook", "context", "provider"],
	backend: ["api", "model", "controller", "service", "middleware", "database", "backend", "resolver"],
	devops: ["docker", "kubernetes", "github-actions", "azure-devops", "gitlab-ci", "devops", "infrastructure"],
	compliance: ["nsm-security", "gdpr-compliance", "privacy-policy", "cookie-consent", "accessibility", "data-retention"],
	fullstack: ["scaffold", "crud", "auth", "feature"],
	integration: ["webhook", "queue", "cron", "worker", "integration"],
	testing: ["test", "e2e", "mock"],
	config: ["config", "env"]
} as const;

/**
 * Executor registry - all available executors
 */
const executors: IGeneratorExecutor[] = [
	new BackendExecutor(),
	new FrontendExecutor(),
	new DevOpsExecutor(),
	new ComplianceExecutor()
];

/**
 * Get generator category for a given type
 * @param type - The generator type
 * @returns The category name or null if not found
 */
export function getGeneratorCategory(
	type: GeneratorType,
): keyof typeof GENERATOR_CATEGORIES | null {
	for (const [category, types] of Object.entries(GENERATOR_CATEGORIES)) {
		if ((types as readonly string[]).includes(type)) {
			return category as keyof typeof GENERATOR_CATEGORIES;
		}
	}
	return null;
}

/**
 * Find the appropriate executor for a generator type
 * @param type - The generator type
 * @returns The executor that can handle this type, or null if none found
 */
function findExecutor(type: GeneratorType): IGeneratorExecutor | null {
	return executors.find(executor => executor.canHandle(type)) || null;
}

/**
 * Main generator execution function - delegates to appropriate executor
 * @param context - Generator execution context
 * @returns Promise resolving to generator result
 */
export async function executeGenerator(
	context: GeneratorContext,
): Promise<GeneratorResult> {
	const { type, name } = context;

	try {
		// Find the appropriate executor
		const executor = findExecutor(type);
		if (!executor) {
			return {
				success: false,
				message: `No executor found for generator type '${type}'`,
				error: `Generator type '${type}' is not supported by any available executor`
			};
		}

		// Execute using the found executor
		return await executor.execute(context);
	} catch (error) {
		return {
			success: false,
			message: `Failed to execute generator '${type}' for '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Get available generators by category
 * @returns Object mapping categories to generator types
 */
export function getAvailableGenerators(): Record<string, readonly GeneratorType[]> {
	return GENERATOR_CATEGORIES;
}

/**
 * Check if generator type is supported
 * @param type - The generator type to check
 * @returns True if the generator type is supported
 */
export function isGeneratorSupported(type: string): type is GeneratorType {
	return executors.some(executor => executor.canHandle(type as GeneratorType));
}

/**
 * Get generator help text
 * @param type - The generator type
 * @returns Help text for the generator
 */
export function getGeneratorHelp(type: GeneratorType): string {
	const executor = findExecutor(type);
	if (executor) {
		return executor.getHelp(type);
	}
	return `No help available for generator type '${type}'`;
}

/**
 * Get all available generator types
 * @returns Array of all supported generator types
 */
export function getAllGeneratorTypes(): GeneratorType[] {
	return Object.values(GENERATOR_CATEGORIES).flat() as GeneratorType[];
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use executeGenerator instead
 */
export const executeFullStackGenerator = executeGenerator;

// Re-export types and interfaces for external use
export type { GeneratorContext, ProjectInfo, IGeneratorExecutor } from "./executors/index.js";
export type { GeneratorOptions, GeneratorResult, GeneratorType } from "../types/index.js";

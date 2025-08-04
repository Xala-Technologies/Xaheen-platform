import {
	getCategoryOptions,
	PROJECT_TYPES,
	TECH_COMPATIBILITY,
	TECH_OPTIONS,
} from "@/lib/data";
import type {
	ProjectType,
	ProjectTypeId,
	StackState,
	TechCategory,
} from "@/lib/types/base";

/**
 * Base compatibility interface
 */
interface BaseCompatibility {
	incompatibleWith: string[];
}

/**
 * Backend compatibility interface
 */
interface BackendCompatibility extends BaseCompatibility {
	supportedOrms?: string[];
	supportedDatabases?: string[];
	supportedAuth?: string[];
	supportedRuntimes?: string[];
}

/**
 * Frontend compatibility interface
 */
interface FrontendCompatibility extends BaseCompatibility {
	supportedBackends?: string[];
	supportedAuth?: string[];
}

/**
 * Database compatibility interface
 */
interface DatabaseCompatibility extends BaseCompatibility {
	supportedOrms?: string[];
	supportedBackends?: string[];
}

/**
 * ORM compatibility interface
 */
interface OrmCompatibility extends BaseCompatibility {
	supportedDatabases?: string[];
	supportedBackends?: string[];
}

/**
 * Auth compatibility interface
 */
interface AuthCompatibility extends BaseCompatibility {
	supportedBackends?: string[];
	supportedFrontends?: string[];
}

/**
 * Runtime compatibility interface
 */
interface RuntimeCompatibility extends BaseCompatibility {
	supportedBackends?: string[];
	supportedPackageManagers?: string[];
}

/**
 * Technology compatibility matrix defining which technologies work together
 */
export interface TechCompatibility {
	backend: Record<string, BackendCompatibility>;
	frontend: Record<string, FrontendCompatibility>;
	database: Record<string, DatabaseCompatibility>;
	orm: Record<string, OrmCompatibility>;
	auth: Record<string, AuthCompatibility>;
	runtime: Record<string, RuntimeCompatibility>;
}

// TECH_COMPATIBILITY is now imported from the centralized data library

/**
 * Type guards for compatibility interfaces
 */
const isBackendCompatibility = (
	option: any,
): option is BackendCompatibility => {
	return option && typeof option === "object";
};

const isFrontendCompatibility = (
	option: any,
): option is FrontendCompatibility => {
	return option && typeof option === "object";
};

const isDatabaseCompatibility = (
	option: any,
): option is DatabaseCompatibility => {
	return option && typeof option === "object";
};

const isOrmCompatibility = (option: any): option is OrmCompatibility => {
	return option && typeof option === "object";
};

const isAuthCompatibility = (option: any): option is AuthCompatibility => {
	return option && typeof option === "object";
};

const isRuntimeCompatibility = (
	option: any,
): option is RuntimeCompatibility => {
	return option && typeof option === "object";
};

/**
 * Check if a technology option is compatible with the current stack
 */
export const isOptionCompatible = (
	category: TechCategory,
	optionId: string,
	currentStack: StackState,
): boolean => {
	// Always allow "none" options
	if (optionId === "none") return true;

	const compatibility = TECH_COMPATIBILITY[category as keyof TechCompatibility];
	if (!compatibility || !compatibility[optionId as keyof typeof compatibility])
		return true;

	const option = compatibility[optionId as keyof typeof compatibility];

	// Check incompatibilities based on current selections
	switch (category) {
		case "backend":
			if (isBackendCompatibility(option)) {
				// Check runtime compatibility
				if (
					option.supportedRuntimes &&
					!option.supportedRuntimes.includes(currentStack.runtime)
				) {
					return false;
				}
				// Check if incompatible with current selections
				if (
					option.incompatibleWith.includes(currentStack.orm) ||
					option.incompatibleWith.includes(currentStack.database) ||
					option.incompatibleWith.includes(currentStack.auth)
				) {
					return false;
				}
			}
			break;

		case "database":
			if (isDatabaseCompatibility(option)) {
				// Check backend compatibility
				if (
					option.supportedBackends &&
					!option.supportedBackends.includes(currentStack.backend)
				) {
					return false;
				}
				// Check ORM compatibility
				if (
					currentStack.orm !== "none" &&
					option.supportedOrms &&
					!option.supportedOrms.includes(currentStack.orm)
				) {
					return false;
				}
			}
			break;

		case "orm":
			if (isOrmCompatibility(option)) {
				// Check database compatibility
				if (
					currentStack.database !== "none" &&
					option.supportedDatabases &&
					!option.supportedDatabases.includes(currentStack.database)
				) {
					return false;
				}
				// Check backend compatibility
				if (
					option.supportedBackends &&
					!option.supportedBackends.includes(currentStack.backend)
				) {
					return false;
				}
			}
			break;

		case "auth":
			if (isAuthCompatibility(option)) {
				// Check backend compatibility
				if (
					option.supportedBackends &&
					!option.supportedBackends.includes(currentStack.backend)
				) {
					return false;
				}
				// Check frontend compatibility
				const frontendOptions = currentStack.webFrontend;
				if (option.supportedFrontends && frontendOptions.length > 0) {
					const hasCompatibleFrontend = frontendOptions.some((fe: string) =>
						option.supportedFrontends!.includes(fe),
					);
					if (!hasCompatibleFrontend) return false;
				}
			}
			break;

		case "runtime":
			if (isRuntimeCompatibility(option)) {
				// Check backend compatibility
				if (
					option.supportedBackends &&
					!option.supportedBackends.includes(currentStack.backend)
				) {
					return false;
				}
			}
			break;

		case "packageManager":
			// Check runtime compatibility
			const runtimeCompat =
				TECH_COMPATIBILITY.runtime[
					currentStack.runtime as keyof typeof TECH_COMPATIBILITY.runtime
				];
			if (
				isRuntimeCompatibility(runtimeCompat) &&
				runtimeCompat.supportedPackageManagers &&
				!runtimeCompat.supportedPackageManagers.includes(optionId)
			) {
				return false;
			}
			break;
	}

	return true;
};

/**
 * Get disabled options for a specific category based on current stack
 */
export const getDisabledOptions = (
	category: TechCategory,
	currentStack: StackState,
): string[] => {
	const categoryOptions = TECH_OPTIONS[
		category as keyof typeof TECH_OPTIONS
	] as any[];
	if (!categoryOptions) return [];

	return categoryOptions
		.filter((option) => !isOptionCompatible(category, option.id, currentStack))
		.map((option) => option.id);
};

/**
 * Get filtered categories based on project type
 */
export const getFilteredCategories = (
	projectType: ProjectTypeId,
): TechCategory[] => {
	const projectConfig = PROJECT_TYPES.find(
		(p: ProjectType) => p.id === projectType,
	);
	return (projectConfig?.relevantCategories as TechCategory[]) || [];
};

/**
 * Get default stack for a project type
 */
export const getProjectTypeDefaults = (
	projectType: ProjectTypeId,
): Partial<StackState> => {
	const projectConfig = PROJECT_TYPES.find(
		(p: ProjectType) => p.id === projectType,
	);
	return (projectConfig?.defaultSelections as Partial<StackState>) || {};
};

/**
 * Validate entire stack for compatibility issues
 */
export const validateStackCompatibility = (
	stack: StackState,
): {
	isValid: boolean;
	issues: string[];
	suggestions: string[];
} => {
	const issues: string[] = [];
	const suggestions: string[] = [];

	// Check backend-runtime compatibility
	if (!isOptionCompatible("runtime", stack.runtime, stack)) {
		issues.push(
			`Runtime "${stack.runtime}" is not compatible with backend "${stack.backend}"`,
		);
		const runtimeOptions = TECH_OPTIONS.runtime?.filter((r) =>
			isOptionCompatible("runtime", r.id, stack),
		);
		if (runtimeOptions?.length) {
			suggestions.push(
				`Consider using: ${runtimeOptions.map((r) => r.name).join(", ")}`,
			);
		}
	}

	// Check database-backend compatibility
	if (!isOptionCompatible("database", stack.database, stack)) {
		issues.push(
			`Database "${stack.database}" is not compatible with backend "${stack.backend}"`,
		);
		const dbOptions = TECH_OPTIONS.database?.filter((db) =>
			isOptionCompatible("database", db.id, stack),
		);
		if (dbOptions?.length) {
			suggestions.push(
				`Consider using: ${dbOptions.map((db) => db.name).join(", ")}`,
			);
		}
	}

	// Check ORM compatibility
	if (stack.orm !== "none" && !isOptionCompatible("orm", stack.orm, stack)) {
		issues.push(
			`ORM "${stack.orm}" is not compatible with current database/backend selection`,
		);
		const ormOptions = TECH_OPTIONS.orm?.filter((orm) =>
			isOptionCompatible("orm", orm.id, stack),
		);
		if (ormOptions?.length) {
			suggestions.push(
				`Consider using: ${ormOptions.map((orm) => orm.name).join(", ")}`,
			);
		}
	}

	// Check auth compatibility
	if (stack.auth !== "none" && !isOptionCompatible("auth", stack.auth, stack)) {
		issues.push(
			`Authentication "${stack.auth}" is not compatible with current backend/frontend selection`,
		);
		const authOptions = TECH_OPTIONS.auth?.filter((auth) =>
			isOptionCompatible("auth", auth.id, stack),
		);
		if (authOptions?.length) {
			suggestions.push(
				`Consider using: ${authOptions.map((auth) => auth.name).join(", ")}`,
			);
		}
	}

	return {
		isValid: issues.length === 0,
		issues,
		suggestions,
	};
};

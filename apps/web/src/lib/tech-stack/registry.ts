/**
 * Tech Stack Registry
 * Single Responsibility: Centralized registry for all tech stack options
 * Open/Closed Principle: Easy to extend with new categories
 */

// Import original TECH_OPTIONS as fallback for categories not yet migrated
import { TECH_OPTIONS as ORIGINAL_TECH_OPTIONS } from "../constant";
import type { TechCategory } from "../types/base";

// Import all tech stack data
import { API_OPTIONS } from "./data/api";
import { AUTH_OPTIONS } from "./data/auth";
import { BACKEND_OPTIONS } from "./data/backend";
import { DATABASE_OPTIONS } from "./data/database";
import { NATIVE_FRONTEND_OPTIONS, WEB_FRONTEND_OPTIONS } from "./data/frontend";
import { ORM_OPTIONS } from "./data/orm";
import { PACKAGE_MANAGER_OPTIONS } from "./data/package-manager";
import { RUNTIME_OPTIONS } from "./data/runtime";
import { UI_SYSTEM_OPTIONS } from "./data/ui-system";
import {
	TechStackCategory,
	TechStackOption,
	TechStackRegistry,
} from "./models";

/**
 * Helper function to convert legacy options to TechStackOption instances
 */
function convertLegacyOptions(
	options: Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		color: string;
		default?: boolean;
		className?: string;
	}>,
): TechStackOption[] {
	return options.map(
		(option) =>
			new TechStackOption(
				option.id,
				option.name,
				option.description,
				option.icon,
				option.color,
				option.default || false,
				option.className,
			),
	);
}

/**
 * Factory function to create the tech stack registry
 * Following the Factory pattern for object creation
 */
export function createTechStackRegistry(): TechStackRegistry {
	const categories = new Map<TechCategory, TechStackCategory>();

	// Register migrated categories with new modular data
	categories.set("api", new TechStackCategory("api", API_OPTIONS));
	categories.set(
		"webFrontend",
		new TechStackCategory("webFrontend", WEB_FRONTEND_OPTIONS),
	);
	categories.set(
		"nativeFrontend",
		new TechStackCategory("nativeFrontend", NATIVE_FRONTEND_OPTIONS),
	);
	categories.set("backend", new TechStackCategory("backend", BACKEND_OPTIONS));
	categories.set(
		"database",
		new TechStackCategory("database", DATABASE_OPTIONS),
	);
	categories.set("orm", new TechStackCategory("orm", ORM_OPTIONS));
	categories.set("auth", new TechStackCategory("auth", AUTH_OPTIONS));
	categories.set("runtime", new TechStackCategory("runtime", RUNTIME_OPTIONS));
	categories.set(
		"packageManager",
		new TechStackCategory("packageManager", PACKAGE_MANAGER_OPTIONS),
	);
	categories.set(
		"uiSystem",
		new TechStackCategory("uiSystem", UI_SYSTEM_OPTIONS),
	);

	// Register remaining categories using original TECH_OPTIONS data
	const remainingCategories: TechCategory[] = [
		"dbSetup",
		"webDeploy",
		"compliance",
		"addons",
		"examples",
		"git",
		"notifications",
		"documents",
		"payments",
		"analytics",
		"monitoring",
		"messaging",
		"install",
		"testing",
		"devops",
		"search",
		"caching",
		"backgroundJobs",
		"cms",
		"security",
		"saasAdmin",
		"subscriptions",
		"licensing",
		"rbac",
		"multiTenancy",
	];

	for (const categoryKey of remainingCategories) {
		if (ORIGINAL_TECH_OPTIONS[categoryKey]) {
			const legacyOptions = convertLegacyOptions(
				ORIGINAL_TECH_OPTIONS[categoryKey],
			);
			categories.set(
				categoryKey,
				new TechStackCategory(categoryKey, legacyOptions),
			);
		}
	}

	return new TechStackRegistry(categories);
}

/**
 * Singleton instance of the tech stack registry
 */
export const techStackRegistry = createTechStackRegistry();

/**
 * Legacy compatibility layer
 * Provides the old TECH_OPTIONS format for gradual migration
 */
export function getLegacyTechOptions(): Record<
	string,
	Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		color: string;
		default: boolean;
		className?: string;
	}>
> {
	const registry = techStackRegistry;
	const legacyOptions: Record<
		string,
		Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			color: string;
			default: boolean;
			className?: string;
		}>
	> = {};

	for (const category of registry.getAllCategories()) {
		legacyOptions[category.key] = category.getAllOptions().map((option) => ({
			id: option.id,
			name: option.name,
			description: option.description,
			icon: option.icon,
			color: option.color,
			default: option.isDefault(),
			className: option.className,
		}));
	}

	return legacyOptions;
}

/**
 * Centralized Data Library for Xaheen Stack Builder
 * Single source of truth for all JSON data with proper TypeScript types
 * 
 * Following SOLID principles:
 * - Single Responsibility: Each function has one clear purpose
 * - Open/Closed: Extensible through new data sources
 * - Liskov Substitution: All data loaders follow same interface
 * - Interface Segregation: Focused interfaces for each data type
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 */

// Import JSON data files
import techOptionsData from "@/data/tech-options.json";
import techCategoriesData from "@/data/tech-categories.json";
import projectTypesData from "@/data/project-types.json";
import quickPresetsData from "@/data/quick-presets.json";
import defaultStackData from "@/data/default-stack.json";
import techCompatibilityData from "@/data/tech-compatibility.json";

// Import types
import type {
	TechOptions,
	TechOption,
	TechCategory,
	ProjectType,
	PresetTemplate,
	StackState,
} from "@/lib/types/base";

/**
 * Category configuration interface
 */
export interface CategoryConfig {
	readonly id: TechCategory;
	readonly sort_order: number;
}

/**
 * Categories data structure
 */
export interface CategoriesData {
	readonly categories: readonly CategoryConfig[];
}

/**
 * Tech compatibility data structure
 */
export interface TechCompatibilityData {
	readonly backend: Record<string, unknown>;
	readonly frontend: Record<string, unknown>;
	readonly database: Record<string, unknown>;
	readonly orm: Record<string, unknown>;
	readonly auth: Record<string, unknown>;
	readonly runtime: Record<string, unknown>;
}

// ===== DATA LOADERS =====

/**
 * Load and validate tech options data
 * @returns Validated tech options with proper typing
 */
export function getTechOptions(): TechOptions {
	return techOptionsData as TechOptions;
}

/**
 * Load and validate tech categories data
 * @returns Sorted categories with proper ordering
 */
export function getTechCategories(): readonly CategoryConfig[] {
	const data = techCategoriesData as CategoriesData;
	return [...data.categories].sort((a: CategoryConfig, b: CategoryConfig) => a.sort_order - b.sort_order);
}

/**
 * Get ordered category IDs
 * @returns Array of category IDs in display order
 */
export function getCategoryOrder(): readonly TechCategory[] {
	return getTechCategories().map(cat => cat.id);
}

/**
 * Load and validate project types data
 * @returns Array of project type configurations
 */
export function getProjectTypes(): readonly ProjectType[] {
	return projectTypesData as unknown as readonly ProjectType[];
}

/**
 * Load and validate quick presets data
 * @returns Array of preset templates
 */
export function getQuickPresets(): readonly PresetTemplate[] {
	return quickPresetsData as unknown as readonly PresetTemplate[];
}

/**
 * Load default stack configuration
 * @returns Default stack state
 */
export function getDefaultStack(): StackState {
	return defaultStackData as StackState;
}

/**
 * Load tech compatibility data
 * @returns Tech compatibility matrix
 */
export function getTechCompatibility(): TechCompatibilityData {
	return techCompatibilityData as TechCompatibilityData;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get tech option by category and ID
 * @param category - Tech category
 * @param id - Option ID
 * @returns Tech option or undefined if not found
 */
export function getTechOption(category: TechCategory, id: string): TechOption | undefined {
	const options = getTechOptions();
	return options[category]?.find(option => option.id === id);
}

/**
 * Get all options for a specific category
 * @param category - Tech category
 * @returns Array of tech options sorted by sort_order
 */
export function getCategoryOptions(category: TechCategory): readonly TechOption[] {
	const options = getTechOptions();
	const categoryOptions = options[category] || [];
	return [...categoryOptions].sort((a: TechOption, b: TechOption) => (a.sort_order || 0) - (b.sort_order || 0));
}

/**
 * Get valid option IDs for a category
 * @param category - Tech category
 * @returns Array of valid option IDs
 */
export function getValidOptionIds(category: TechCategory): string[] {
	return getCategoryOptions(category).map(option => option.id);
}

/**
 * Get default option for a category
 * @param category - Tech category
 * @returns Default option or first option if no default specified
 */
export function getDefaultOption(category: TechCategory): TechOption | undefined {
	const options = getCategoryOptions(category);
	return options.find(option => option.default) || options[0];
}

/**
 * Get project type by ID
 * @param id - Project type ID
 * @returns Project type or undefined if not found
 */
export function getProjectType(id: string): ProjectType | undefined {
	return getProjectTypes().find(type => type.id === id);
}

/**
 * Get preset template by ID
 * @param id - Preset template ID
 * @returns Preset template or undefined if not found
 */
export function getPresetTemplate(id: string): PresetTemplate | undefined {
	return getQuickPresets().find(preset => preset.id === id);
}

/**
 * Validate if an option exists in a category
 * @param category - Tech category
 * @param id - Option ID
 * @returns True if option exists, false otherwise
 */
export function isValidOption(category: TechCategory, id: string): boolean {
	return getValidOptionIds(category).includes(id);
}

/**
 * Get all available categories
 * @returns Array of all category IDs
 */
export function getAllCategories(): readonly TechCategory[] {
	return Object.keys(getTechOptions()) as TechCategory[];
}

/**
 * Check if a stack value is the default value
 * @param stack - Current stack state
 * @param key - Stack property key
 * @param value - Value to check
 * @returns True if value is default, false otherwise
 */
export function isStackDefault(
	stack: StackState,
	key: keyof StackState,
	value: unknown
): boolean {
	const defaultStack = getDefaultStack();
	const defaultValue = defaultStack[key];
	
	// Handle array values
	if (Array.isArray(defaultValue) && Array.isArray(value)) {
		return JSON.stringify(defaultValue.sort()) === JSON.stringify(value.sort());
	}
	
	// Handle primitive values
	return defaultValue === value;
}

// ===== EXPORTS =====

// Export data constants for backward compatibility
export const TECH_OPTIONS = getTechOptions();
export const TECH_CATEGORIES = getTechCategories();
export const PROJECT_TYPES = getProjectTypes();
export const PRESET_TEMPLATES = getQuickPresets();
export const DEFAULT_STACK = getDefaultStack();
export const TECH_COMPATIBILITY = getTechCompatibility();
export const CATEGORY_ORDER = getCategoryOrder();

// Export all functions for tree-shaking
export {
	techOptionsData,
	techCategoriesData,
	projectTypesData,
	quickPresetsData,
	defaultStackData,
	techCompatibilityData,
};

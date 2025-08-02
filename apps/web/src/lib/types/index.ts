/**
 * Types Module Index
 * Centralized export for all type definitions
 */

export type {
	TechOption,
	TechOptions,
	ProjectTypeConfig,
	PresetTemplate,
	StackState,
	TechCategory,
	ProjectType,
	ProjectTypeId,
	CompatibilityResult,
	ReadonlyStackState
} from './base';

// Legacy compatibility exports
export type {
	TechOption as TechStackOption,
	ProjectTypeConfig as ProjectTypeDefinition,
	PresetTemplate as PresetDefinition
} from './base';

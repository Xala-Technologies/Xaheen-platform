/**
 * Project Types Registry
 * Single Responsibility: Centralized registry for project types
 */

import type { ProjectType } from '../types/base';
import { ProjectTypeRegistry } from './models';
import { PROJECT_TYPE_DEFINITIONS } from './data';

/**
 * Factory function to create the project types registry
 */
export function createProjectTypeRegistry(): ProjectTypeRegistry {
	const projectTypes = new Map<ProjectType, any>();

	for (const definition of PROJECT_TYPE_DEFINITIONS) {
		projectTypes.set(definition.getProjectType(), definition);
	}

	return new ProjectTypeRegistry(projectTypes);
}

/**
 * Singleton instance of the project types registry
 */
export const projectTypeRegistry = createProjectTypeRegistry();

/**
 * Legacy compatibility layer
 */
export function getLegacyProjectTypes(): readonly any[] {
	return PROJECT_TYPE_DEFINITIONS.map(def => ({
		id: def.id,
		name: def.name,
		description: def.description,
		icon: def.icon,
		color: def.color,
		relevantCategories: def.relevantCategories,
		defaultSelections: def.defaultSelections,
	}));
}

/**
 * Presets Registry
 * Single Responsibility: Centralized registry for preset templates
 */

import { PRESET_DEFINITIONS } from "./data";
import { PresetRegistry } from "./models";

/**
 * Factory function to create the presets registry
 */
export function createPresetRegistry(): PresetRegistry {
	return new PresetRegistry(PRESET_DEFINITIONS);
}

/**
 * Singleton instance of the presets registry
 */
export const presetRegistry = createPresetRegistry();

/**
 * Legacy compatibility layer
 */
export function getLegacyPresetTemplates(): readonly any[] {
	return PRESET_DEFINITIONS.map((def) => ({
		id: def.id,
		name: def.name,
		description: def.description,
		projectType: def.projectType,
		stack: def.stack,
		examples: def.examples,
	}));
}

/**
 * Main Library Index
 * Centralized export for the entire library with backward compatibility
 * 
 * This file provides both the new modular API and legacy compatibility
 * to ensure smooth migration from the old monolithic constant.ts file
 */

// New Modular API Exports
export * from './types/base';
export { techStackRegistry, getLegacyTechOptions } from './tech-stack';
export * from './project-types';
export * from './presets';
export * from './services';

// Legacy Compatibility Layer
// These exports maintain backward compatibility with existing code
import { getLegacyTechOptions } from './tech-stack';
import { getLegacyProjectTypes } from './project-types';
import { getLegacyPresetTemplates } from './presets';
import { stackConfigurationService } from './services';

/**
 * Legacy TECH_OPTIONS export for backward compatibility
 * @deprecated Use techStackRegistry instead
 */
export const TECH_OPTIONS = getLegacyTechOptions();

/**
 * Legacy PROJECT_TYPES export for backward compatibility
 * @deprecated Use projectTypeRegistry instead
 */
export const PROJECT_TYPES = getLegacyProjectTypes();

/**
 * Legacy PRESET_TEMPLATES export for backward compatibility
 * @deprecated Use presetRegistry instead
 */
export const PRESET_TEMPLATES = getLegacyPresetTemplates();

/**
 * Legacy DEFAULT_STACK export for backward compatibility
 * @deprecated Use stackConfigurationService.createDefaultStack() instead
 */
export const DEFAULT_STACK = stackConfigurationService.createDefaultStack();

/**
 * Legacy isStackDefault function for backward compatibility
 * @deprecated Use stackConfigurationService.isStackDefault() instead
 */
export const isStackDefault = stackConfigurationService.isStackDefault.bind(stackConfigurationService);

// Re-export commonly used utilities
export { cn } from './utils';

// Re-export URL state management
export * from './stack-url-state';

// Re-export tech compatibility functions
export * from './tech-compatibility';

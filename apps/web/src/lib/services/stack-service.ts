/**
 * Stack Configuration Service
 * Single Responsibility: Manage stack configuration operations
 * Dependency Inversion: Depends on abstractions, not concretions
 */

import type { StackState, ProjectType } from '../types/base';
import { projectTypeRegistry } from '../project-types/registry';
import { presetRegistry } from '../presets/registry';

export class StackConfigurationService {
	/**
	 * Create default stack configuration
	 */
	public createDefaultStack(): StackState {
		return {
			projectName: 'my-xaheen-app',
			webFrontend: ['tanstack-router'],
			nativeFrontend: ['none'],
			runtime: 'bun',
			backend: 'hono',
			database: 'sqlite',
			orm: 'drizzle',
			dbSetup: 'none',
			auth: 'better-auth',
			packageManager: 'bun',
			uiSystem: 'xala',
			compliance: ['none'],
			addons: ['none'],
			notifications: 'none',
			documents: 'none',
			payments: 'none',
			analytics: 'none',
			monitoring: 'none',
			messaging: 'none',
			testing: 'none',
			devops: 'none',
			search: 'none',
			caching: 'none',
			backgroundJobs: 'none',
			i18n: 'none',
			cms: 'none',
			security: 'none',
			saasAdmin: 'none',
			subscriptions: 'none',
			licensing: 'none',
			rbac: 'none',
			multiTenancy: 'none',
			examples: ['none'],
			git: 'true',
			install: 'true',
			api: 'trpc',
			webDeploy: 'none',
		} as const;
	}

	/**
	 * Apply project type defaults to a stack
	 */
	public applyProjectTypeDefaults(
		stack: StackState,
		projectType: ProjectType
	): StackState {
		const projectTypeDef = projectTypeRegistry.getProjectType(projectType);
		if (!projectTypeDef) {
			return stack;
		}

		const defaults = projectTypeDef.defaultSelections;
		const updatedStack = { ...stack };

		// Apply defaults while preserving existing non-default values
		for (const [category, defaultValue] of Object.entries(defaults)) {
			if (category in updatedStack) {
				(updatedStack as any)[category] = defaultValue;
			}
		}

		return updatedStack;
	}

	/**
	 * Apply a preset to create a new stack configuration
	 */
	public applyPreset(presetId: string): StackState | null {
		const preset = presetRegistry.getPresetById(presetId);
		if (!preset) {
			return null;
		}

		const defaultStack = this.createDefaultStack();
		const presetStack = preset.getStackConfiguration();

		// Merge preset configuration with default stack
		return {
			...defaultStack,
			...presetStack,
		} as StackState;
	}

	/**
	 * Check if a stack configuration matches the default
	 */
	public isStackDefault<K extends keyof StackState>(
		stack: StackState,
		key: K,
		value: StackState[K]
	): boolean {
		const defaultStack = this.createDefaultStack();
		const defaultValue = defaultStack[key];

		if (Array.isArray(defaultValue) && Array.isArray(value)) {
			return JSON.stringify(defaultValue.sort()) === JSON.stringify(value.sort());
		}

		return defaultValue === value;
	}

	/**
	 * Get available presets for a project type
	 */
	public getPresetsForProjectType(projectType: ProjectType): readonly any[] {
		return presetRegistry.getPresetsForProjectType(projectType);
	}

	/**
	 * Validate stack configuration
	 */
	public validateStack(stack: StackState): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		// Basic validation rules
		if (!stack.projectName || stack.projectName.trim().length === 0) {
			errors.push('Project name is required');
		}

		if (stack.projectName.length > 255) {
			errors.push('Project name must be less than 255 characters');
		}

		// Validate project name characters
		const invalidChars = ['<', '>', ':', '"', '|', '?', '*'];
		const hasInvalidChars = invalidChars.some(char => stack.projectName.includes(char));
		if (hasInvalidChars) {
			errors.push('Project name contains invalid characters');
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}

/**
 * Singleton instance of the stack configuration service
 */
export const stackConfigurationService = new StackConfigurationService();

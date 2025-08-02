/**
 * Compatibility Service
 * Single Responsibility: Handle tech stack compatibility validation
 * Open/Closed Principle: Easy to extend with new compatibility rules
 */

import type { StackState, CompatibilityResult, TechCategory } from '../types/base';
import { techStackRegistry } from '../tech-stack/registry';

export interface CompatibilityRule {
	readonly name: string;
	readonly description: string;
	validate(stack: StackState): CompatibilityValidationResult;
}

export interface CompatibilityValidationResult {
	readonly isValid: boolean;
	readonly issues: readonly string[];
	readonly suggestions: readonly string[];
	readonly adjustments?: Partial<StackState>;
}

export class CompatibilityService {
	private readonly rules: readonly CompatibilityRule[] = [];

	constructor(rules: readonly CompatibilityRule[] = []) {
		this.rules = rules;
	}

	/**
	 * Validate stack compatibility and return analysis
	 */
	public analyzeStackCompatibility(stack: StackState): CompatibilityResult {
		const notes: Record<string, { notes: string[]; hasIssue: boolean }> = {};
		const changes: Array<{ category: string; message: string }> = [];
		let adjustedStack: StackState | null = { ...stack };

		// Run all compatibility rules
		for (const rule of this.rules) {
			const result = rule.validate(stack);
			
			if (!result.isValid) {
				notes[rule.name] = {
					notes: [...result.issues, ...result.suggestions],
					hasIssue: true,
				};

				// Apply adjustments if provided
				if (result.adjustments) {
					adjustedStack = { ...adjustedStack, ...result.adjustments };
					
					for (const [category, value] of Object.entries(result.adjustments)) {
						changes.push({
							category,
							message: `Adjusted ${category} for compatibility`,
						});
					}
				}
			}
		}

		return {
			adjustedStack,
			notes,
			changes,
		};
	}

	/**
	 * Get disabled options for a category based on current stack
	 */
	public getDisabledOptions(
		stack: StackState,
		category: TechCategory
	): readonly string[] {
		const disabled: string[] = [];
		const categoryData = techStackRegistry.getCategory(category);
		
		if (!categoryData) {
			return disabled;
		}

		// Apply compatibility rules to determine disabled options
		for (const option of categoryData.getAllOptions()) {
			const testStack = { ...stack, [category]: option.id };
			const result = this.analyzeStackCompatibility(testStack);
			
			if (Object.values(result.notes).some(note => note.hasIssue)) {
				disabled.push(option.id);
			}
		}

		return disabled;
	}

	/**
	 * Check if an option is compatible with current stack
	 */
	public isOptionCompatible(
		stack: StackState,
		category: TechCategory,
		optionId: string
	): boolean {
		const testStack = { ...stack, [category]: optionId };
		const result = this.analyzeStackCompatibility(testStack);
		return !Object.values(result.notes).some(note => note.hasIssue);
	}

	/**
	 * Get filtered categories based on project type relevance
	 */
	public getFilteredCategories(
		relevantCategories?: readonly string[]
	): readonly TechCategory[] {
		const allCategories = techStackRegistry.getCategoryKeys();
		
		if (!relevantCategories || relevantCategories.length === 0) {
			return allCategories;
		}

		return allCategories.filter(category => 
			relevantCategories.includes(category)
		);
	}

	/**
	 * Validate stack compatibility
	 */
	public validateStackCompatibility(stack: StackState): {
		isValid: boolean;
		errors: readonly string[];
		warnings: readonly string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		const analysis = this.analyzeStackCompatibility(stack);
		
		for (const [ruleName, note] of Object.entries(analysis.notes)) {
			if (note.hasIssue) {
				errors.push(`${ruleName}: ${note.notes.join(', ')}`);
			} else {
				warnings.push(`${ruleName}: ${note.notes.join(', ')}`);
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}
}

/**
 * Basic compatibility rules
 */
export class PWACompatibilityRule implements CompatibilityRule {
	readonly name = 'PWA Compatibility';
	readonly description = 'Validates PWA compatibility with frontend frameworks';

	validate(stack: StackState): CompatibilityValidationResult {
		const hasPWA = stack.addons.includes('pwa');
		const pwaCompatibleFrontends = ['next', 'vite', 'nuxt', 'sveltekit'];
		const isCompatible = stack.webFrontend.some(frontend => 
			pwaCompatibleFrontends.includes(frontend)
		);

		if (hasPWA && !isCompatible) {
			return {
				isValid: false,
				issues: ['PWA addon requires a compatible frontend framework'],
				suggestions: ['Consider using Next.js, Vite, Nuxt.js, or SvelteKit'],
				adjustments: {
					addons: stack.addons.filter(addon => addon !== 'pwa'),
				},
			};
		}

		return {
			isValid: true,
			issues: [],
			suggestions: [],
		};
	}
}

export class TauriCompatibilityRule implements CompatibilityRule {
	readonly name = 'Tauri Compatibility';
	readonly description = 'Validates Tauri compatibility with frontend frameworks';

	validate(stack: StackState): CompatibilityValidationResult {
		const hasTauri = stack.nativeFrontend.includes('tauri');
		const tauriCompatibleFrontends = ['vite', 'next', 'sveltekit', 'solid-start'];
		const isCompatible = stack.webFrontend.some(frontend => 
			tauriCompatibleFrontends.includes(frontend)
		);

		if (hasTauri && !isCompatible) {
			return {
				isValid: false,
				issues: ['Tauri requires a compatible frontend framework'],
				suggestions: ['Consider using Vite, Next.js, SvelteKit, or SolidStart'],
				adjustments: {
					nativeFrontend: stack.nativeFrontend.filter(frontend => frontend !== 'tauri'),
				},
			};
		}

		return {
			isValid: true,
			issues: [],
			suggestions: [],
		};
	}
}

/**
 * Factory function to create compatibility service with default rules
 */
export function createCompatibilityService(): CompatibilityService {
	const rules: CompatibilityRule[] = [
		new PWACompatibilityRule(),
		new TauriCompatibilityRule(),
		// Add more rules as needed
	];

	return new CompatibilityService(rules);
}

/**
 * Singleton instance of the compatibility service
 */
export const compatibilityService = createCompatibilityService();

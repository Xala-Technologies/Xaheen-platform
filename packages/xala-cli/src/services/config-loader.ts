/**
 * @fileoverview Configuration Loader for Interactive Tech Builder
 * @description Loads and validates JSON configuration files for the project builder
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
	ConfigurationData,
	ProjectType,
	QuickPreset,
	TechCategory,
	TechOption,
	TechCompatibility,
	StackConfiguration,
	BuilderError,
	isProjectType,
	isQuickPreset,
	isValidStackConfiguration
} from './builder-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigurationLoader {
	private readonly configBasePath: string;
	private cachedConfig: ConfigurationData | null = null;

	constructor(configBasePath?: string) {
		// Default to the web app's data directory
		this.configBasePath = configBasePath || join(__dirname, '../../../web/src/data');
	}

	/**
	 * Load all configuration data
	 */
	async loadConfiguration(): Promise<ConfigurationData> {
		if (this.cachedConfig) {
			return this.cachedConfig;
		}

		try {
			const [
				projectTypes,
				quickPresets,
				techCategories,
				techOptions,
				techCompatibility,
				defaultStack
			] = await Promise.all([
				this.loadProjectTypes(),
				this.loadQuickPresets(),
				this.loadTechCategories(),
				this.loadTechOptions(),
				this.loadTechCompatibility(),
				this.loadDefaultStack()
			]);

			this.cachedConfig = {
				projectTypes,
				quickPresets,
				techCategories,
				techOptions,
				techCompatibility,
				defaultStack
			};

			return this.cachedConfig;
		} catch (error) {
			throw new BuilderError(
				`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
				'CONFIG_LOAD_ERROR'
			);
		}
	}

	/**
	 * Load project types configuration
	 */
	private async loadProjectTypes(): Promise<readonly ProjectType[]> {
		const filePath = join(this.configBasePath, 'project-types.json');
		const content = await this.readJsonFile<ProjectType[]>(filePath);
		
		// Validate each project type
		const validProjectTypes = content.filter((item, index) => {
			if (!isProjectType(item)) {
				console.warn(`Invalid project type at index ${index}, skipping...`);
				return false;
			}
			return true;
		});

		// Sort by sort_order
		return validProjectTypes.sort((a, b) => a.sort_order - b.sort_order);
	}

	/**
	 * Load quick presets configuration
	 */
	private async loadQuickPresets(): Promise<readonly QuickPreset[]> {
		const filePath = join(this.configBasePath, 'quick-presets.json');
		const content = await this.readJsonFile<QuickPreset[]>(filePath);
		
		// Validate each preset
		const validPresets = content.filter((item, index) => {
			if (!isQuickPreset(item)) {
				console.warn(`Invalid quick preset at index ${index}, skipping...`);
				return false;
			}
			if (!isValidStackConfiguration(item.stack)) {
				console.warn(`Invalid stack configuration for preset ${item.id}, skipping...`);
				return false;
			}
			return true;
		});

		// Sort by sort_order
		return validPresets.sort((a, b) => a.sort_order - b.sort_order);
	}

	/**
	 * Load tech categories configuration
	 */
	private async loadTechCategories(): Promise<readonly TechCategory[]> {
		const filePath = join(this.configBasePath, 'tech-categories.json');
		const data = await this.readJsonFile<{ categories: TechCategory[] }>(filePath);
		
		// Validate structure
		if (!data.categories || !Array.isArray(data.categories)) {
			throw new BuilderError('Invalid tech-categories.json structure', 'INVALID_CONFIG');
		}

		// Sort by sort_order
		return data.categories.sort((a, b) => a.sort_order - b.sort_order);
	}

	/**
	 * Load tech options configuration
	 */
	private async loadTechOptions(): Promise<Record<string, readonly TechOption[]>> {
		const filePath = join(this.configBasePath, 'tech-options.json');
		const content = await this.readJsonFile<Record<string, TechOption[]>>(filePath);
		
		// Validate and sort each category's options
		const processedOptions: Record<string, readonly TechOption[]> = {};
		
		for (const [category, options] of Object.entries(content)) {
			if (!Array.isArray(options)) {
				console.warn(`Invalid options for category ${category}, skipping...`);
				continue;
			}

			// Validate each option
			const validOptions = options.filter((option, index) => {
				if (
					typeof option.id !== 'string' ||
					typeof option.name !== 'string' ||
					typeof option.description !== 'string' ||
					typeof option.sort_order !== 'number'
				) {
					console.warn(`Invalid option at index ${index} in category ${category}, skipping...`);
					return false;
				}
				return true;
			});

			// Sort by sort_order
			processedOptions[category] = validOptions.sort((a, b) => a.sort_order - b.sort_order);
		}

		return processedOptions;
	}

	/**
	 * Load tech compatibility configuration
	 */
	private async loadTechCompatibility(): Promise<Record<string, Record<string, TechCompatibility>>> {
		const filePath = join(this.configBasePath, 'tech-compatibility.json');
		return await this.readJsonFile<Record<string, Record<string, TechCompatibility>>>(filePath);
	}

	/**
	 * Load default stack configuration
	 */
	private async loadDefaultStack(): Promise<StackConfiguration> {
		const filePath = join(this.configBasePath, 'default-stack.json');
		const content = await this.readJsonFile<StackConfiguration>(filePath);
		
		if (!isValidStackConfiguration(content)) {
			throw new BuilderError('Invalid default-stack.json configuration', 'INVALID_DEFAULT_STACK');
		}

		return content;
	}

	/**
	 * Get project type by ID
	 */
	async getProjectType(id: string): Promise<ProjectType | null> {
		const config = await this.loadConfiguration();
		return config.projectTypes.find(pt => pt.id === id) || null;
	}

	/**
	 * Get quick preset by ID
	 */
	async getQuickPreset(id: string): Promise<QuickPreset | null> {
		const config = await this.loadConfiguration();
		return config.quickPresets.find(qp => qp.id === id) || null;
	}

	/**
	 * Get tech options for a category
	 */
	async getTechOptions(category: string): Promise<readonly TechOption[]> {
		const config = await this.loadConfiguration();
		return config.techOptions[category] || [];
	}

	/**
	 * Get compatibility info for a tech option
	 */
	async getCompatibilityInfo(category: string, optionId: string): Promise<TechCompatibility | null> {
		const config = await this.loadConfiguration();
		return config.techCompatibility[category]?.[optionId] || null;
	}

	/**
	 * Get relevant categories for a project type
	 */
	async getRelevantCategories(projectTypeId: string): Promise<readonly string[]> {
		const projectType = await this.getProjectType(projectTypeId);
		return projectType?.relevantCategories || [];
	}

	/**
	 * Get default selections for a project type
	 */
	async getDefaultSelections(projectTypeId: string): Promise<Record<string, string | readonly string[]>> {
		const projectType = await this.getProjectType(projectTypeId);
		return projectType?.defaultSelections || {};
	}

	/**
	 * Get presets for a specific project type
	 */
	async getPresetsForProjectType(projectTypeId: string): Promise<readonly QuickPreset[]> {
		const config = await this.loadConfiguration();
		return config.quickPresets.filter(preset => preset.projectType === projectTypeId);
	}

	/**
	 * Search presets by name or description
	 */
	async searchPresets(query: string): Promise<readonly QuickPreset[]> {
		const config = await this.loadConfiguration();
		const lowercaseQuery = query.toLowerCase();
		
		return config.quickPresets.filter(preset =>
			preset.name.toLowerCase().includes(lowercaseQuery) ||
			preset.description.toLowerCase().includes(lowercaseQuery)
		);
	}

	/**
	 * Get tech option display information
	 */
	async getTechOptionDetails(category: string, optionId: string): Promise<TechOption | null> {
		const options = await this.getTechOptions(category);
		return options.find(option => option.id === optionId) || null;
	}

	/**
	 * Clear cached configuration (useful for testing or dynamic reloading)
	 */
	clearCache(): void {
		this.cachedConfig = null;
	}

	/**
	 * Validate configuration integrity
	 */
	async validateConfiguration(): Promise<readonly string[]> {
		const errors: string[] = [];
		
		try {
			const config = await this.loadConfiguration();

			// Check that referenced project types in presets exist
			for (const preset of config.quickPresets) {
				const projectTypeExists = config.projectTypes.some(pt => pt.id === preset.projectType);
				if (!projectTypeExists) {
					errors.push(`Preset "${preset.id}" references non-existent project type "${preset.projectType}"`);
				}
			}

			// Check that relevant categories in project types exist
			const validCategories = new Set(config.techCategories.map(tc => tc.id));
			for (const projectType of config.projectTypes) {
				for (const category of projectType.relevantCategories) {
					if (!validCategories.has(category)) {
						errors.push(`Project type "${projectType.id}" references non-existent category "${category}"`);
					}
				}
			}

			// Check that default selections reference valid options
			for (const projectType of config.projectTypes) {
				for (const [category, selection] of Object.entries(projectType.defaultSelections)) {
					const availableOptions = config.techOptions[category] || [];
					const optionIds = availableOptions.map(opt => opt.id);
					
					const selectionsToCheck = Array.isArray(selection) ? selection : [selection];
					for (const sel of selectionsToCheck) {
						if (!optionIds.includes(sel)) {
							errors.push(`Project type "${projectType.id}" has invalid default selection "${sel}" for category "${category}"`);
						}
					}
				}
			}

		} catch (error) {
			errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);
		}

		return errors;
	}

	/**
	 * Helper method to read and parse JSON files
	 */
	private async readJsonFile<T>(filePath: string): Promise<T> {
		try {
			const content = await readFile(filePath, 'utf-8');
			return JSON.parse(content) as T;
		} catch (error) {
			throw new BuilderError(
				`Failed to read JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
				'JSON_READ_ERROR'
			);
		}
	}
}

// Singleton instance
export const configLoader = new ConfigurationLoader();
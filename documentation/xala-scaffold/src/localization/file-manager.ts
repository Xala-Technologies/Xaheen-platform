import { promises as fs } from "fs";
import path from "path";
import { ensureDir, fileExists, readFile, writeFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import {
	getLocaleFilePath,
	LocaleCode,
	LocalizationConfig,
	loadLocaleFile,
	saveLocaleFile,
	TranslationFile,
} from "./core.js";

// Translation entry
export interface TranslationEntry {
	key: string;
	value: string;
	locale: LocaleCode;
	namespace?: string;
	metadata?: {
		lastModified?: string;
		translator?: string;
		reviewed?: boolean;
		context?: string;
	};
}

// File manager options
export interface FileManagerOptions {
	sortKeys?: boolean;
	indentSize?: number;
	preserveComments?: boolean;
	backupBeforeWrite?: boolean;
	validateOnSave?: boolean;
}

// Translation file manager
export class TranslationFileManager {
	private options: FileManagerOptions;
	private cache: Map<string, TranslationFile> = new Map();

	constructor(options: FileManagerOptions = {}) {
		this.options = {
			sortKeys: true,
			indentSize: 2,
			preserveComments: true,
			backupBeforeWrite: true,
			validateOnSave: true,
			...options,
		};
	}

	// Load all translations for a project
	async loadProjectTranslations(
		projectPath: string,
		config: LocalizationConfig,
	): Promise<Map<LocaleCode, TranslationFile>> {
		const translations = new Map<LocaleCode, TranslationFile>();

		for (const locale of config.supportedLocales) {
			const filePath = getLocaleFilePath(
				projectPath,
				locale,
				undefined,
				config,
			);
			const data = await loadLocaleFile(filePath);

			if (data) {
				translations.set(locale, data);
				this.cache.set(filePath, data);
			}
		}

		return translations;
	}

	// Add or update translation
	async addTranslation(
		projectPath: string,
		entry: TranslationEntry,
		config: LocalizationConfig,
	): Promise<void> {
		const filePath = getLocaleFilePath(
			projectPath,
			entry.locale,
			entry.namespace,
			config,
		);

		// Load existing file or create new
		let data = await loadLocaleFile(filePath);
		if (!data) {
			data = {
				locale: entry.locale,
				metadata: {
					version: "1.0.0",
					lastUpdated: new Date().toISOString(),
				},
				translations: {},
			};
		}

		// Set translation value
		this.setNestedValue(data.translations, entry.key, entry.value);

		// Update metadata
		if (entry.metadata) {
			const keyMetadata = `_metadata.${entry.key}`;
			this.setNestedValue(data.translations, keyMetadata, entry.metadata);
		}

		// Save file
		await this.saveTranslationFile(filePath, data);
	}

	// Add multiple translations
	async addTranslations(
		projectPath: string,
		entries: TranslationEntry[],
		config: LocalizationConfig,
	): Promise<void> {
		// Group by locale and namespace
		const grouped = new Map<string, TranslationEntry[]>();

		for (const entry of entries) {
			const key = `${entry.locale}:${entry.namespace || "default"}`;
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(entry);
		}

		// Process each group
		for (const [key, groupEntries] of grouped) {
			const [locale, namespace] = key.split(":");
			const filePath = getLocaleFilePath(
				projectPath,
				locale as LocaleCode,
				namespace === "default" ? undefined : namespace,
				config,
			);

			// Load existing file
			let data = await loadLocaleFile(filePath);
			if (!data) {
				data = {
					locale: locale as LocaleCode,
					metadata: {
						version: "1.0.0",
						lastUpdated: new Date().toISOString(),
					},
					translations: {},
				};
			}

			// Add all translations
			for (const entry of groupEntries) {
				this.setNestedValue(data.translations, entry.key, entry.value);

				if (entry.metadata) {
					const keyMetadata = `_metadata.${entry.key}`;
					this.setNestedValue(data.translations, keyMetadata, entry.metadata);
				}
			}

			// Save file
			await this.saveTranslationFile(filePath, data);
		}
	}

	// Find missing translations
	async findMissingTranslations(
		projectPath: string,
		config: LocalizationConfig,
	): Promise<Map<LocaleCode, string[]>> {
		const translations = await this.loadProjectTranslations(
			projectPath,
			config,
		);
		const missing = new Map<LocaleCode, string[]>();

		// Get all keys from default locale
		const defaultTranslations = translations.get(config.defaultLocale);
		if (!defaultTranslations) {
			logger.warn("Default locale translations not found");
			return missing;
		}

		const allKeys = this.extractAllKeys(defaultTranslations.translations);

		// Check each locale
		for (const [locale, data] of translations) {
			if (locale === config.defaultLocale) continue;

			const localeKeys = this.extractAllKeys(data.translations);
			const missingKeys = allKeys.filter((key) => !localeKeys.includes(key));

			if (missingKeys.length > 0) {
				missing.set(locale, missingKeys);
			}
		}

		return missing;
	}

	// Find unused translations
	async findUnusedTranslations(
		projectPath: string,
		usedKeys: Set<string>,
		config: LocalizationConfig,
	): Promise<Map<LocaleCode, string[]>> {
		const translations = await this.loadProjectTranslations(
			projectPath,
			config,
		);
		const unused = new Map<LocaleCode, string[]>();

		for (const [locale, data] of translations) {
			const allKeys = this.extractAllKeys(data.translations);
			const unusedKeys = allKeys.filter(
				(key) => !usedKeys.has(key) && !key.startsWith("_metadata."),
			);

			if (unusedKeys.length > 0) {
				unused.set(locale, unusedKeys);
			}
		}

		return unused;
	}

	// Clean unused translations
	async cleanUnusedTranslations(
		projectPath: string,
		usedKeys: Set<string>,
		config: LocalizationConfig,
	): Promise<void> {
		const unused = await this.findUnusedTranslations(
			projectPath,
			usedKeys,
			config,
		);

		for (const [locale, keys] of unused) {
			const filePath = getLocaleFilePath(
				projectPath,
				locale,
				undefined,
				config,
			);
			const data = await loadLocaleFile(filePath);

			if (!data) continue;

			// Remove unused keys
			for (const key of keys) {
				this.deleteNestedValue(data.translations, key);
				this.deleteNestedValue(data.translations, `_metadata.${key}`);
			}

			// Save cleaned file
			await this.saveTranslationFile(filePath, data);
		}

		logger.info(
			`Removed ${Array.from(unused.values()).flat().length} unused translations`,
		);
	}

	// Merge translation files
	async mergeTranslations(
		sourceFile: string,
		targetFile: string,
		strategy:
			| "overwrite"
			| "keep-existing"
			| "merge-metadata" = "keep-existing",
	): Promise<void> {
		const source = await loadLocaleFile(sourceFile);
		const target = await loadLocaleFile(targetFile);

		if (!source) {
			throw new Error(`Source file not found: ${sourceFile}`);
		}

		if (!target) {
			// Simply copy source to target
			await saveLocaleFile(targetFile, source);
			return;
		}

		// Merge translations
		const merged = this.mergeTranslationData(source, target, strategy);

		// Save merged file
		await this.saveTranslationFile(targetFile, merged);
	}

	// Sort translation keys
	sortTranslations(data: TranslationFile): TranslationFile {
		return {
			...data,
			translations: this.sortObject(data.translations),
		};
	}

	// Validate translation file
	validateTranslationFile(data: TranslationFile): string[] {
		const errors: string[] = [];

		// Check required fields
		if (!data.locale) {
			errors.push("Missing locale field");
		}

		if (!data.translations || typeof data.translations !== "object") {
			errors.push("Missing or invalid translations object");
		}

		// Check for empty values
		const emptyKeys = this.findEmptyValues(data.translations);
		if (emptyKeys.length > 0) {
			errors.push(`Empty translation values: ${emptyKeys.join(", ")}`);
		}

		// Check for invalid keys
		const invalidKeys = this.findInvalidKeys(data.translations);
		if (invalidKeys.length > 0) {
			errors.push(`Invalid translation keys: ${invalidKeys.join(", ")}`);
		}

		return errors;
	}

	// Save translation file with options
	private async saveTranslationFile(
		filePath: string,
		data: TranslationFile,
	): Promise<void> {
		// Backup if requested
		if (this.options.backupBeforeWrite && (await fileExists(filePath))) {
			const backupPath = `${filePath}.backup`;
			const content = await readFile(filePath);
			await writeFile(backupPath, content);
		}

		// Sort if requested
		if (this.options.sortKeys) {
			data = this.sortTranslations(data);
		}

		// Validate if requested
		if (this.options.validateOnSave) {
			const errors = this.validateTranslationFile(data);
			if (errors.length > 0) {
				logger.warn(`Validation errors in ${filePath}:`, errors);
			}
		}

		// Save file
		await saveLocaleFile(filePath, data);

		// Update cache
		this.cache.set(filePath, data);
	}

	// Set nested value in object
	private setNestedValue(obj: any, path: string, value: any): void {
		const keys = path.split(".");
		let current = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!(key in current) || typeof current[key] !== "object") {
				current[key] = {};
			}
			current = current[key];
		}

		current[keys[keys.length - 1]] = value;
	}

	// Delete nested value from object
	private deleteNestedValue(obj: any, path: string): void {
		const keys = path.split(".");
		let current = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!(key in current)) return;
			current = current[key];
		}

		delete current[keys[keys.length - 1]];
	}

	// Extract all keys from nested object
	private extractAllKeys(obj: any, prefix = ""): string[] {
		const keys: string[] = [];

		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;

			if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				keys.push(...this.extractAllKeys(value, fullKey));
			} else {
				keys.push(fullKey);
			}
		}

		return keys;
	}

	// Sort object keys
	private sortObject(obj: any): any {
		if (typeof obj !== "object" || obj === null) {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj;
		}

		const sorted: any = {};
		const keys = Object.keys(obj).sort();

		for (const key of keys) {
			sorted[key] = this.sortObject(obj[key]);
		}

		return sorted;
	}

	// Merge translation data
	private mergeTranslationData(
		source: TranslationFile,
		target: TranslationFile,
		strategy: "overwrite" | "keep-existing" | "merge-metadata",
	): TranslationFile {
		const merged: TranslationFile = {
			locale: target.locale,
			metadata: {
				...target.metadata,
				lastUpdated: new Date().toISOString(),
			},
			translations: {},
		};

		// Deep merge translations
		merged.translations = this.deepMerge(
			target.translations,
			source.translations,
			strategy,
		);

		return merged;
	}

	// Deep merge objects
	private deepMerge(target: any, source: any, strategy: string): any {
		const result = { ...target };

		for (const [key, value] of Object.entries(source)) {
			if (key in result) {
				if (strategy === "overwrite") {
					result[key] = value;
				} else if (strategy === "merge-metadata" && key === "_metadata") {
					result[key] = this.deepMerge(result[key], value, strategy);
				} else if (
					typeof value === "object" &&
					value !== null &&
					!Array.isArray(value)
				) {
					result[key] = this.deepMerge(result[key], value, strategy);
				}
				// Otherwise keep existing (keep-existing strategy)
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	// Find empty values
	private findEmptyValues(obj: any, prefix = ""): string[] {
		const empty: string[] = [];

		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;

			if (typeof value === "string" && value.trim() === "") {
				empty.push(fullKey);
			} else if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				empty.push(...this.findEmptyValues(value, fullKey));
			}
		}

		return empty;
	}

	// Find invalid keys
	private findInvalidKeys(obj: any, prefix = ""): string[] {
		const invalid: string[] = [];
		const validKeyPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

		for (const [key, value] of Object.entries(obj)) {
			if (!validKeyPattern.test(key) && key !== "_metadata") {
				invalid.push(prefix ? `${prefix}.${key}` : key);
			}

			if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				const fullKey = prefix ? `${prefix}.${key}` : key;
				invalid.push(...this.findInvalidKeys(value, fullKey));
			}
		}

		return invalid;
	}
}

// Create default file manager
export const fileManager = new TranslationFileManager();

// Export convenience functions
export async function addTranslation(
	projectPath: string,
	entry: TranslationEntry,
	config: LocalizationConfig,
): Promise<void> {
	return fileManager.addTranslation(projectPath, entry, config);
}

export async function findMissingTranslations(
	projectPath: string,
	config: LocalizationConfig,
): Promise<Map<LocaleCode, string[]>> {
	return fileManager.findMissingTranslations(projectPath, config);
}

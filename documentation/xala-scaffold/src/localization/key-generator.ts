import path from "path";
import { logger } from "../utils/logger.js";
import { ExtractedText } from "./text-extractor.js";

// Key generation options
export interface KeyGenerationOptions {
	strategy: "hierarchical" | "flat" | "component-based";
	maxKeyLength?: number;
	separator?: string;
	caseStyle?: "camelCase" | "snake_case" | "kebab-case";
	includeComponent?: boolean;
	includeContext?: boolean;
	customKeyGenerator?: (text: ExtractedText) => string;
}

// Default options
const DEFAULT_OPTIONS: KeyGenerationOptions = {
	strategy: "hierarchical",
	maxKeyLength: 50,
	separator: ".",
	caseStyle: "camelCase",
	includeComponent: true,
	includeContext: false,
};

// Key collision tracker
interface KeyCollision {
	key: string;
	texts: Array<{
		text: string;
		file: string;
		line: number;
	}>;
}

// Translation key generator
export class TranslationKeyGenerator {
	private options: Required<KeyGenerationOptions>;
	private keyMap: Map<string, ExtractedText[]> = new Map();
	private collisions: KeyCollision[] = [];

	constructor(options: Partial<KeyGenerationOptions> = {}) {
		this.options = {
			...DEFAULT_OPTIONS,
			...options,
		} as Required<KeyGenerationOptions>;
	}

	// Generate keys for extracted texts
	generateKeys(texts: ExtractedText[]): Map<string, string> {
		const result = new Map<string, string>();
		this.keyMap.clear();
		this.collisions = [];

		// First pass: generate initial keys
		for (const text of texts) {
			const key = this.generateKey(text);

			if (!this.keyMap.has(key)) {
				this.keyMap.set(key, []);
			}
			this.keyMap.get(key)!.push(text);
		}

		// Second pass: resolve collisions
		for (const [key, texts] of this.keyMap) {
			if (texts.length > 1) {
				// Check if all texts are identical
				const uniqueTexts = new Set(texts.map((t) => t.text));

				if (uniqueTexts.size === 1) {
					// Same text in multiple places - use same key
					for (const text of texts) {
						result.set(this.getTextId(text), key);
					}
				} else {
					// Different texts with same key - collision
					this.collisions.push({
						key,
						texts: texts.map((t) => ({
							text: t.text,
							file: path.relative(process.cwd(), t.file),
							line: t.line,
						})),
					});

					// Resolve collision by adding context
					texts.forEach((text, index) => {
						const resolvedKey = this.resolveCollision(key, text, index);
						result.set(this.getTextId(text), resolvedKey);
					});
				}
			} else {
				result.set(this.getTextId(texts[0]), key);
			}
		}

		return result;
	}

	// Generate key for a single text
	private generateKey(text: ExtractedText): string {
		// Use custom generator if provided
		if (this.options.customKeyGenerator) {
			return this.options.customKeyGenerator(text);
		}

		switch (this.options.strategy) {
			case "hierarchical":
				return this.generateHierarchicalKey(text);
			case "flat":
				return this.generateFlatKey(text);
			case "component-based":
				return this.generateComponentBasedKey(text);
			default:
				return this.generateHierarchicalKey(text);
		}
	}

	// Generate hierarchical key
	private generateHierarchicalKey(text: ExtractedText): string {
		const parts: string[] = [];

		// Add namespace based on file path
		const namespace = this.getNamespace(text.file);
		if (namespace) {
			parts.push(namespace);
		}

		// Add component name if available
		if (this.options.includeComponent && text.component) {
			parts.push(this.formatKeyPart(text.component));
		}

		// Add context if available
		if (this.options.includeContext && text.context) {
			parts.push(this.formatKeyPart(text.context));
		}

		// Add text-based key
		parts.push(this.generateTextKey(text.text));

		return parts.join(this.options.separator);
	}

	// Generate flat key
	private generateFlatKey(text: ExtractedText): string {
		return this.generateTextKey(text.text);
	}

	// Generate component-based key
	private generateComponentBasedKey(text: ExtractedText): string {
		const parts: string[] = [];

		if (text.component) {
			parts.push(this.formatKeyPart(text.component));
		} else {
			parts.push("common");
		}

		parts.push(this.generateTextKey(text.text));

		return parts.join(this.options.separator);
	}

	// Get namespace from file path
	private getNamespace(filePath: string): string {
		const relative = path.relative(process.cwd(), filePath);
		const parts = relative.split(path.sep);

		// Remove src/ prefix
		if (parts[0] === "src") {
			parts.shift();
		}

		// Remove file name
		parts.pop();

		// Common namespace mappings
		const namespaceMap: Record<string, string> = {
			components: "components",
			pages: "pages",
			views: "pages",
			layouts: "layouts",
			features: "features",
			modules: "modules",
			utils: "common",
			helpers: "common",
			lib: "common",
		};

		// Map first part to namespace
		if (parts.length > 0 && namespaceMap[parts[0]]) {
			parts[0] = namespaceMap[parts[0]];
		}

		// Limit depth
		return parts
			.slice(0, 2)
			.map((p) => this.formatKeyPart(p))
			.join(this.options.separator);
	}

	// Generate key from text content
	private generateTextKey(text: string): string {
		// Remove common prefixes/suffixes
		let key = text
			.toLowerCase()
			.trim()
			.replace(/^(the|a|an)\s+/i, "") // Remove articles
			.replace(/[!?.,;:]+$/, "") // Remove trailing punctuation
			.replace(/\s+/g, " "); // Normalize whitespace

		// Convert to key format
		key = key
			.replace(/[^a-z0-9\s-]/g, "") // Remove special characters
			.trim()
			.split(/\s+/)
			.slice(0, 5) // Limit to 5 words
			.join("-");

		// Apply case style
		key = this.applyCaseStyle(key);

		// Shorten if too long
		if (key.length > this.options.maxKeyLength) {
			key = this.shortenKey(key);
		}

		return key || "text";
	}

	// Format key part
	private formatKeyPart(part: string): string {
		return part
			.replace(/[^a-zA-Z0-9-]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "")
			.toLowerCase();
	}

	// Apply case style
	private applyCaseStyle(key: string): string {
		const words = key.split("-");

		switch (this.options.caseStyle) {
			case "camelCase":
				return words
					.map((word, index) =>
						index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
					)
					.join("");

			case "snake_case":
				return words.join("_");

			case "kebab-case":
			default:
				return words.join("-");
		}
	}

	// Shorten key
	private shortenKey(key: string): string {
		// Try abbreviation first
		const abbreviated = key
			.split(/[-_]/)
			.map((word) => word.charAt(0))
			.join("");

		if (abbreviated.length >= 3) {
			return abbreviated;
		}

		// Otherwise truncate
		return key.substring(0, this.options.maxKeyLength);
	}

	// Resolve key collision
	private resolveCollision(
		baseKey: string,
		text: ExtractedText,
		index: number,
	): string {
		const parts = baseKey.split(this.options.separator);

		// Try adding file name
		const fileName = path.basename(text.file, path.extname(text.file));
		const fileKey = this.formatKeyPart(fileName);

		if (!parts.includes(fileKey)) {
			parts.splice(-1, 0, fileKey);
			return parts.join(this.options.separator);
		}

		// Try adding line number
		parts.push(`line${text.line}`);
		return parts.join(this.options.separator);
	}

	// Get unique ID for text
	private getTextId(text: ExtractedText): string {
		return `${text.file}:${text.line}:${text.column}`;
	}

	// Get collision report
	getCollisionReport(): string {
		if (this.collisions.length === 0) {
			return "No key collisions detected.";
		}

		const report: string[] = [];
		report.push(`Found ${this.collisions.length} key collisions:\n`);

		for (const collision of this.collisions) {
			report.push(`Key: ${collision.key}`);
			for (const text of collision.texts) {
				report.push(`  - "${text.text}" (${text.file}:${text.line})`);
			}
			report.push("");
		}

		return report.join("\n");
	}

	// Validate generated keys
	validateKeys(keys: Map<string, string>): string[] {
		const errors: string[] = [];
		const seenKeys = new Set<string>();

		for (const [textId, key] of keys) {
			// Check for empty keys
			if (!key || key.trim() === "") {
				errors.push(`Empty key generated for text at ${textId}`);
			}

			// Check for invalid characters
			const validPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
			if (!validPattern.test(key)) {
				errors.push(`Invalid key format: ${key}`);
			}

			// Check for duplicates (should be resolved by generator)
			if (seenKeys.has(key)) {
				errors.push(`Duplicate key: ${key}`);
			}
			seenKeys.add(key);
		}

		return errors;
	}
}

// Create default generator
export const keyGenerator = new TranslationKeyGenerator();

// Generate keys with custom options
export function generateTranslationKeys(
	texts: ExtractedText[],
	options?: Partial<KeyGenerationOptions>,
): Map<string, string> {
	const generator = new TranslationKeyGenerator(options);
	return generator.generateKeys(texts);
}

// Key naming conventions
export const KEY_NAMING_CONVENTIONS = {
	// Page keys
	pageTitle: (page: string) => `pages.${page}.title`,
	pageDescription: (page: string) => `pages.${page}.description`,

	// Component keys
	componentLabel: (component: string, label: string) =>
		`components.${component}.${label}`,

	// Form keys
	formField: (form: string, field: string) =>
		`forms.${form}.fields.${field}.label`,
	formError: (form: string, field: string, error: string) =>
		`forms.${form}.fields.${field}.errors.${error}`,
	formSubmit: (form: string) => `forms.${form}.submit`,

	// Common keys
	common: (key: string) => `common.${key}`,
	error: (code: string) => `errors.${code}`,
	success: (action: string) => `success.${action}`,

	// Navigation
	navItem: (item: string) => `navigation.${item}`,
	breadcrumb: (page: string) => `breadcrumbs.${page}`,
};

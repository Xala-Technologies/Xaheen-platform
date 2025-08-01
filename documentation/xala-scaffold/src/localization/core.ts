import path from "path";
import { z } from "zod";
import { ensureDir, fileExists, readFile, writeFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

// Supported locales with metadata
export const SUPPORTED_LOCALES = [
	{
		code: "nb-NO",
		name: "Norwegian Bokmål",
		englishName: "Norwegian Bokmål",
		direction: "ltr" as const,
		default: true,
	},
	{
		code: "nn-NO",
		name: "Norwegian Nynorsk",
		englishName: "Norwegian Nynorsk",
		direction: "ltr" as const,
	},
	{
		code: "en-US",
		name: "English",
		englishName: "English (United States)",
		direction: "ltr" as const,
	},
	{
		code: "ar-SA",
		name: "العربية",
		englishName: "Arabic (Saudi Arabia)",
		direction: "rtl" as const,
	},
	{
		code: "fr-FR",
		name: "Français",
		englishName: "French (France)",
		direction: "ltr" as const,
	},
] as const;

// Locale type
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];
export type TextDirection = "ltr" | "rtl";

// Locale metadata interface
export interface LocaleMetadata {
	code: LocaleCode;
	name: string;
	englishName: string;
	direction: TextDirection;
	default?: boolean;
}

// Translation file structure
export interface TranslationFile {
	locale: LocaleCode;
	metadata?: {
		lastUpdated?: string;
		translator?: string;
		version?: string;
	};
	translations: Record<string, any>;
}

// Localization configuration
export interface LocalizationConfig {
	defaultLocale: LocaleCode;
	fallbackLocale: LocaleCode;
	supportedLocales: LocaleCode[];
	localesDir: string;
	namespaceStrategy: "nested" | "flat";
	keyNamingPattern: "camelCase" | "snake_case" | "kebab-case";
	missingKeyStrategy: "error" | "warn" | "fallback";
	rtlLocales: LocaleCode[];
}

// Default configuration
export const DEFAULT_LOCALIZATION_CONFIG: LocalizationConfig = {
	defaultLocale: "nb-NO",
	fallbackLocale: "en-US",
	supportedLocales: ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"],
	localesDir: "src/locales",
	namespaceStrategy: "nested",
	keyNamingPattern: "camelCase",
	missingKeyStrategy: "warn",
	rtlLocales: ["ar-SA"],
};

// Configuration schema
export const LocalizationConfigSchema = z.object({
	defaultLocale: z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
	fallbackLocale: z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
	supportedLocales: z.array(
		z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"]),
	),
	localesDir: z.string(),
	namespaceStrategy: z.enum(["nested", "flat"]),
	keyNamingPattern: z.enum(["camelCase", "snake_case", "kebab-case"]),
	missingKeyStrategy: z.enum(["error", "warn", "fallback"]),
	rtlLocales: z.array(z.enum(["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"])),
});

// Locale validation
export function isValidLocale(locale: string): locale is LocaleCode {
	return SUPPORTED_LOCALES.some((l) => l.code === locale);
}

// Get locale metadata
export function getLocaleMetadata(
	locale: LocaleCode,
): LocaleMetadata | undefined {
	return SUPPORTED_LOCALES.find((l) => l.code === locale);
}

// Check if locale is RTL
export function isRTLLocale(locale: LocaleCode): boolean {
	const metadata = getLocaleMetadata(locale);
	return metadata?.direction === "rtl";
}

// Get locale fallback chain
export function getLocaleFallbackChain(
	locale: LocaleCode,
	config: LocalizationConfig,
): LocaleCode[] {
	const chain: LocaleCode[] = [locale];

	// Add language fallback (e.g., nb-NO -> nb)
	const languageCode = locale.split("-")[0];
	const languageFallback = SUPPORTED_LOCALES.find(
		(l) => l.code !== locale && l.code.startsWith(languageCode),
	);

	if (languageFallback) {
		chain.push(languageFallback.code);
	}

	// Add configured fallback locale
	if (config.fallbackLocale !== locale) {
		chain.push(config.fallbackLocale);
	}

	// Add default locale as final fallback
	if (
		config.defaultLocale !== locale &&
		config.defaultLocale !== config.fallbackLocale
	) {
		chain.push(config.defaultLocale);
	}

	return [...new Set(chain)];
}

// Get locale file path
export function getLocaleFilePath(
	projectPath: string,
	locale: LocaleCode,
	namespace?: string,
	config: LocalizationConfig = DEFAULT_LOCALIZATION_CONFIG,
): string {
	const localesDir = path.join(projectPath, config.localesDir);

	if (namespace && config.namespaceStrategy === "nested") {
		return path.join(localesDir, locale, `${namespace}.json`);
	}

	return path.join(localesDir, `${locale}.json`);
}

// Load locale file
export async function loadLocaleFile(
	filePath: string,
): Promise<TranslationFile | null> {
	try {
		if (!(await fileExists(filePath))) {
			return null;
		}

		const content = await readFile(filePath);
		const data = JSON.parse(content);

		// Validate structure
		if (!data.locale || !data.translations) {
			logger.warn(`Invalid locale file structure: ${filePath}`);
			return null;
		}

		return data as TranslationFile;
	} catch (error) {
		logger.error(`Failed to load locale file: ${filePath}`, error);
		return null;
	}
}

// Save locale file
export async function saveLocaleFile(
	filePath: string,
	data: TranslationFile,
): Promise<void> {
	try {
		// Ensure directory exists
		await ensureDir(path.dirname(filePath));

		// Add metadata
		const fileData: TranslationFile = {
			...data,
			metadata: {
				...data.metadata,
				lastUpdated: new Date().toISOString(),
			},
		};

		// Save with pretty formatting
		await writeFile(filePath, JSON.stringify(fileData, null, 2));

		logger.debug(`Saved locale file: ${filePath}`);
	} catch (error) {
		logger.error(`Failed to save locale file: ${filePath}`, error);
		throw error;
	}
}

// Initialize locale directory structure
export async function initializeLocales(
	projectPath: string,
	locales: LocaleCode[],
	config: LocalizationConfig = DEFAULT_LOCALIZATION_CONFIG,
): Promise<void> {
	const localesDir = path.join(projectPath, config.localesDir);

	for (const locale of locales) {
		const metadata = getLocaleMetadata(locale);
		if (!metadata) continue;

		// Create locale directory for nested strategy
		if (config.namespaceStrategy === "nested") {
			await ensureDir(path.join(localesDir, locale));

			// Create default namespace file
			const defaultFile = path.join(localesDir, locale, "common.json");
			if (!(await fileExists(defaultFile))) {
				await saveLocaleFile(defaultFile, {
					locale,
					metadata: {
						version: "1.0.0",
					},
					translations: {
						common: {
							welcome:
								locale === "nb-NO"
									? "Velkommen"
									: locale === "nn-NO"
										? "Velkomen"
										: locale === "en-US"
											? "Welcome"
											: locale === "ar-SA"
												? "مرحبا"
												: locale === "fr-FR"
													? "Bienvenue"
													: "Welcome",
						},
					},
				});
			}
		} else {
			// Create single file for flat strategy
			const localeFile = path.join(localesDir, `${locale}.json`);
			if (!(await fileExists(localeFile))) {
				await saveLocaleFile(localeFile, {
					locale,
					metadata: {
						version: "1.0.0",
					},
					translations: {},
				});
			}
		}
	}

	logger.info(`Initialized locales: ${locales.join(", ")}`);
}

// Validate locale code format (IETF BCP 47)
export function validateLocaleCode(code: string): boolean {
	// Basic IETF language tag validation
	const pattern = /^[a-z]{2,3}(-[A-Z]{2})?(-[a-zA-Z]{4})?(-[A-Z]{2})?$/;
	return pattern.test(code);
}

// Get browser locale
export function getBrowserLocale(): LocaleCode {
	if (typeof window === "undefined") {
		return DEFAULT_LOCALIZATION_CONFIG.defaultLocale;
	}

	const browserLocale = window.navigator.language;

	// Try exact match
	if (isValidLocale(browserLocale)) {
		return browserLocale;
	}

	// Try language code match
	const languageCode = browserLocale.split("-")[0];
	const match = SUPPORTED_LOCALES.find((l) => l.code.startsWith(languageCode));

	return match?.code || DEFAULT_LOCALIZATION_CONFIG.defaultLocale;
}

// Get server locale from Accept-Language header
export function getServerLocale(acceptLanguage?: string): LocaleCode {
	if (!acceptLanguage) {
		return DEFAULT_LOCALIZATION_CONFIG.defaultLocale;
	}

	// Parse Accept-Language header
	const locales = acceptLanguage
		.split(",")
		.map((lang) => {
			const [locale, q = "1"] = lang.trim().split(";q=");
			return { locale: locale.trim(), quality: parseFloat(q) };
		})
		.sort((a, b) => b.quality - a.quality);

	// Find first matching locale
	for (const { locale } of locales) {
		if (isValidLocale(locale)) {
			return locale;
		}

		// Try language code match
		const languageCode = locale.split("-")[0];
		const match = SUPPORTED_LOCALES.find((l) =>
			l.code.startsWith(languageCode),
		);
		if (match) {
			return match.code;
		}
	}

	return DEFAULT_LOCALIZATION_CONFIG.defaultLocale;
}

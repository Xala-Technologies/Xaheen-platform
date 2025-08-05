/**
 * Internationalization Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI
 *
 * MANDATORY COMPLIANCE RULES:
 * ✅ Multi-language support: English, Norwegian Bokmål, French, Arabic
 * ✅ RTL support for Arabic
 * ✅ SSR-safe i18n initialization
 * ✅ Proper fallback handling
 * ✅ TypeScript strict mode compliance
 */

import { createInstance, Resource } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export const supportedLocales = ["en", "no", "fr", "ar"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

export const localeNames: Record<SupportedLocale, string> = {
	en: "English",
	no: "Norsk",
	fr: "Français",
	ar: "العربية",
};

export const rtlLocales: SupportedLocale[] = ["ar"];

/**
 * Check if a locale uses right-to-left text direction
 */
export function isRtlLocale(locale: string): boolean {
	return rtlLocales.includes(locale as SupportedLocale);
}

/**
 * Get i18n instance with proper SSR support
 */
export async function getI18nInstance(locale: SupportedLocale = defaultLocale) {
	const i18nInstance = createInstance();

	await i18nInstance
		.use(initReactI18next)
		.use(
			resourcesToBackend((language: string, namespace: string) => {
				// Map 'no' to 'nb' for Norwegian Bokmål
				const mappedLanguage = language === "no" ? "nb" : language;
				return import(`../localization/${mappedLanguage}.json`);
			}),
		)
		.init({
			lng: locale,
			fallbackLng: defaultLocale,
			supportedLngs: supportedLocales,
			defaultNS: "common",
			fallbackNS: "common",
			ns: ["common"],
			interpolation: {
				escapeValue: false,
			},
			react: {
				useSuspense: false,
			},
			// SSR-safe configuration
			initImmediate: false,
			load: "languageOnly",
		});

	return i18nInstance;
}

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
	return supportedLocales.includes(locale as SupportedLocale);
}

/**
 * Get the best matching locale from a request
 */
export function getBestMatchingLocale(
	acceptLanguage?: string,
): SupportedLocale {
	if (!acceptLanguage) return defaultLocale;

	// Simple language matching - can be enhanced with more sophisticated logic
	const languages = acceptLanguage
		.split(",")
		.map((lang) => lang.split(";")[0].trim());

	for (const lang of languages) {
		const normalizedLang = lang.toLowerCase();

		// Direct match
		if (isValidLocale(normalizedLang)) {
			return normalizedLang;
		}

		// Language code match (e.g., 'nb-NO' -> 'no')
		const langCode = normalizedLang.split("-")[0];
		if (langCode === "nb" || langCode === "nn") {
			return "no";
		}
		if (isValidLocale(langCode)) {
			return langCode;
		}
	}

	return defaultLocale;
}

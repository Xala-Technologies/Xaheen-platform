import { useCallback } from "react";
import arTranslations from "@/localization/ar.json";
import enTranslations from "@/localization/en.json";
import frTranslations from "@/localization/fr.json";
import nbTranslations from "@/localization/nb.json";

type TranslationKey = string;
type Translations = typeof enTranslations;

const translations: Record<string, Translations> = {
	en: enTranslations,
	nb: nbTranslations,
	fr: frTranslations,
	ar: arTranslations,
};

export function useLocalization(locale: string = "en"): {
	t: (key: TranslationKey) => string;
	locale: string;
} {
	const t = useCallback(
		(key: TranslationKey): string => {
			const keys = key.split(".");
			let value: any = translations[locale] || translations.en;

			for (const k of keys) {
				value = value?.[k];
				if (value === undefined) {
					// Fallback to English if key not found
					value = translations.en;
					for (const fallbackKey of keys) {
						value = value?.[fallbackKey];
						if (value === undefined) {
							return key; // Return key if not found in fallback
						}
					}
					break;
				}
			}

			return typeof value === "string" ? value : key;
		},
		[locale],
	);

	return { t, locale };
}

/**
 * Localization Provider - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 *
 * MANDATORY COMPLIANCE RULES:
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ RTL support for Arabic
 * ✅ SSR-safe i18n initialization
 * ✅ Explicit TypeScript return types
 * ✅ SOLID principles and component composition
 */

"use client";

import { i18n } from "i18next";
import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { getI18nInstance, SupportedLocale } from "@/lib/i18n";

interface LocalizationProviderProps {
	children: ReactNode;
	locale: SupportedLocale;
}

/**
 * Localization Provider with SSR-safe i18n initialization
 * Supports English, Norwegian Bokmål, French, and Arabic with RTL support
 */
export function LocalizationProvider({
	children,
	locale,
}: LocalizationProviderProps): React.JSX.Element {
	const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;

		const initializeI18n = async (): Promise<void> => {
			try {
				const instance = await getI18nInstance(locale);

				if (mounted) {
					setI18nInstance(instance);
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Failed to initialize i18n:", error);

				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		initializeI18n();

		return (): void => {
			mounted = false;
		};
	}, [locale]);

	// Show loading state or fallback during SSR
	if (isLoading || !i18nInstance) {
		return <>{children}</>;
	}

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}

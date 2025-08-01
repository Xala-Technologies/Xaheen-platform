/**
 * Example: Multi-Language Support Component
 *
 * This example demonstrates comprehensive multi-language support with
 * Norwegian as the primary language, including RTL support for Arabic
 * and proper localization patterns.
 *
 * Features demonstrated:
 * - Norwegian Bokmål and Nynorsk support
 * - RTL support for Arabic
 * - Dynamic language switching
 * - Locale-aware formatting (dates, numbers, currency)
 * - Accessibility for language selection
 * - Keyboard navigation
 * - Screen reader announcements
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import { useTranslation } from "@/hooks/useTranslation";
import { NSMClassification } from "@/types/compliance";
import { LocaleCode } from "@/types/localization";

// Supported languages with metadata
const SUPPORTED_LANGUAGES = [
	{
		code: "nb-NO" as LocaleCode,
		name: "Norsk (Bokmål)",
		nativeName: "Norsk (Bokmål)",
		flag: "🇳🇴",
		rtl: false,
		primary: true,
	},
	{
		code: "nn-NO" as LocaleCode,
		name: "Norsk (Nynorsk)",
		nativeName: "Norsk (Nynorsk)",
		flag: "🇳🇴",
		rtl: false,
		primary: false,
	},
	{
		code: "en-US" as LocaleCode,
		name: "English",
		nativeName: "English",
		flag: "🇺🇸",
		rtl: false,
		primary: false,
	},
	{
		code: "ar-SA" as LocaleCode,
		name: "Arabic",
		nativeName: "العربية",
		flag: "🇸🇦",
		rtl: true,
		primary: false,
	},
	{
		code: "fr-FR" as LocaleCode,
		name: "French",
		nativeName: "Français",
		flag: "🇫🇷",
		rtl: false,
		primary: false,
	},
] as const;

interface LanguageSwitcherProps {
	readonly variant?: "dropdown" | "inline" | "modal";
	readonly showFlags?: boolean;
	readonly showNativeNames?: boolean;
	readonly position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	readonly onLanguageChange?: (locale: LocaleCode) => void;
	readonly classification?: NSMClassification;
	readonly "data-testid"?: string;
}

/**
 * Language Switcher Component with Norwegian Focus
 *
 * Provides accessible language switching with proper RTL support,
 * Norwegian compliance logging, and comprehensive internationalization.
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
	variant = "dropdown",
	showFlags = true,
	showNativeNames = true,
	position = "top-right",
	onLanguageChange,
	classification = NSMClassification.OPEN,
	"data-testid": testId = "language-switcher",
}) => {
	const { t, locale, setLocale, isRTL, formatDate, formatNumber } =
		useTranslation();
	const auditLogger = useAuditLogger();
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	// Get current language info
	const currentLanguage = SUPPORTED_LANGUAGES.find(
		(lang) => lang.code === locale,
	);

	// Close dropdown on outside click
	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleOutsideClick);
			return () =>
				document.removeEventListener("mousedown", handleOutsideClick);
		}
	}, [isOpen]);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!isOpen) {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					setIsOpen(true);
					setFocusedIndex(0);
				}
				return;
			}

			switch (event.key) {
				case "Escape":
					event.preventDefault();
					setIsOpen(false);
					setFocusedIndex(-1);
					triggerRef.current?.focus();
					break;

				case "ArrowDown":
					event.preventDefault();
					setFocusedIndex((prev) =>
						prev < SUPPORTED_LANGUAGES.length - 1 ? prev + 1 : 0,
					);
					break;

				case "ArrowUp":
					event.preventDefault();
					setFocusedIndex((prev) =>
						prev > 0 ? prev - 1 : SUPPORTED_LANGUAGES.length - 1,
					);
					break;

				case "Enter":
				case " ":
					event.preventDefault();
					if (focusedIndex >= 0) {
						handleLanguageSelect(SUPPORTED_LANGUAGES[focusedIndex].code);
					}
					break;

				case "Home":
					event.preventDefault();
					setFocusedIndex(0);
					break;

				case "End":
					event.preventDefault();
					setFocusedIndex(SUPPORTED_LANGUAGES.length - 1);
					break;

				default:
					// Type-ahead functionality
					const typedChar = event.key.toLowerCase();
					const matchIndex = SUPPORTED_LANGUAGES.findIndex(
						(lang, index) =>
							index > focusedIndex &&
							lang.name.toLowerCase().startsWith(typedChar),
					);

					if (matchIndex >= 0) {
						setFocusedIndex(matchIndex);
					} else {
						// Wrap around to beginning
						const wrapIndex = SUPPORTED_LANGUAGES.findIndex((lang) =>
							lang.name.toLowerCase().startsWith(typedChar),
						);
						if (wrapIndex >= 0) {
							setFocusedIndex(wrapIndex);
						}
					}
					break;
			}
		},
		[isOpen, focusedIndex],
	);

	// Handle language selection
	const handleLanguageSelect = useCallback(
		async (newLocale: LocaleCode) => {
			if (newLocale === locale) {
				setIsOpen(false);
				return;
			}

			const previousLocale = locale;
			const selectedLanguage = SUPPORTED_LANGUAGES.find(
				(lang) => lang.code === newLocale,
			);

			try {
				// Log language change for audit purposes
				auditLogger.log({
					action: "language_changed",
					resource: "LanguageSwitcher",
					classification,
					metadata: {
						previousLocale,
						newLocale,
						languageName: selectedLanguage?.name,
						isRTLChange: selectedLanguage?.rtl !== currentLanguage?.rtl,
						timestamp: new Date().toISOString(),
					},
				});

				// Update locale
				await setLocale(newLocale);

				// Update document attributes for accessibility and RTL
				document.documentElement.lang = newLocale;
				document.documentElement.dir = selectedLanguage?.rtl ? "rtl" : "ltr";

				// Announce language change to screen readers
				const announcement = t("languageSwitcher.announcements.changed", {
					language: selectedLanguage?.name || newLocale,
				});
				announceToScreenReader(announcement);

				// Call external handler
				onLanguageChange?.(newLocale);

				setIsOpen(false);
				setFocusedIndex(-1);
			} catch (error) {
				console.error("Failed to change language:", error);

				// Log error
				auditLogger.log({
					action: "language_change_failed",
					resource: "LanguageSwitcher",
					classification,
					metadata: {
						error: error instanceof Error ? error.message : "Unknown error",
						attemptedLocale: newLocale,
						timestamp: new Date().toISOString(),
					},
				});

				// Announce error to screen readers
				const errorMessage = t("languageSwitcher.announcements.error");
				announceToScreenReader(errorMessage);
			}
		},
		[
			locale,
			setLocale,
			onLanguageChange,
			auditLogger,
			classification,
			currentLanguage,
			t,
		],
	);

	// Announce to screen readers
	const announceToScreenReader = useCallback((message: string) => {
		const announcement = document.createElement("div");
		announcement.setAttribute("aria-live", "polite");
		announcement.setAttribute("aria-atomic", "true");
		announcement.className = "sr-only";
		announcement.textContent = message;

		document.body.appendChild(announcement);

		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}, []);

	// Generate position classes
	const getPositionClasses = () => {
		const positionClasses = {
			"top-right": "top-full right-0 mt-2",
			"top-left": "top-full left-0 mt-2",
			"bottom-right": "bottom-full right-0 mb-2",
			"bottom-left": "bottom-full left-0 mb-2",
		};
		return positionClasses[position];
	};

	// Format example content for demonstration
	const formatExampleContent = () => {
		const now = new Date();
		const sampleNumber = 1234.56;

		return {
			date: formatDate(now, {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			time: formatDate(now, {
				hour: "2-digit",
				minute: "2-digit",
			}),
			number: formatNumber(sampleNumber, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			currency: formatNumber(sampleNumber, {
				style: "currency",
				currency:
					locale.startsWith("nb-") || locale.startsWith("nn-")
						? "NOK"
						: locale === "ar-SA"
							? "SAR"
							: locale === "fr-FR"
								? "EUR"
								: "USD",
			}),
		};
	};

	const exampleContent = formatExampleContent();

	// Render dropdown variant
	if (variant === "dropdown") {
		return (
			<div
				className={`language-switcher relative ${isRTL ? "rtl" : "ltr"}`}
				data-testid={testId}
				data-nsm-classification={classification}
				ref={dropdownRef}
			>
				{/* Trigger Button */}
				<button
					ref={triggerRef}
					type="button"
					className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					aria-label={t("languageSwitcher.trigger.ariaLabel", {
						currentLanguage: currentLanguage?.name || locale,
					})}
					onClick={() => setIsOpen(!isOpen)}
					onKeyDown={handleKeyDown}
				>
					{showFlags && currentLanguage && (
						<span className="text-lg" role="img" aria-hidden="true">
							{currentLanguage.flag}
						</span>
					)}

					<span>
						{showNativeNames
							? currentLanguage?.nativeName
							: currentLanguage?.name}
					</span>

					<svg
						className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{/* Dropdown Menu */}
				{isOpen && (
					<div
						className={`absolute z-50 w-64 bg-white border border-gray-200 rounded-md shadow-lg ${getPositionClasses()}`}
						role="listbox"
						aria-label={t("languageSwitcher.menu.ariaLabel")}
					>
						{/* Language Options */}
						<div className="py-1" role="group">
							{SUPPORTED_LANGUAGES.map((language, index) => (
								<button
									key={language.code}
									type="button"
									className={`w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
										language.code === locale
											? "bg-blue-50 text-blue-700"
											: "text-gray-900"
									} ${focusedIndex === index ? "bg-gray-100" : ""}`}
									role="option"
									aria-selected={language.code === locale}
									aria-current={language.code === locale ? "true" : undefined}
									onClick={() => handleLanguageSelect(language.code)}
									onKeyDown={handleKeyDown}
									tabIndex={-1}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											{showFlags && (
												<span className="text-lg" role="img" aria-hidden="true">
													{language.flag}
												</span>
											)}

											<div>
												<div className="font-medium">
													{showNativeNames
														? language.nativeName
														: language.name}
												</div>
												{showNativeNames &&
													language.name !== language.nativeName && (
														<div className="text-xs text-gray-500">
															{language.name}
														</div>
													)}
											</div>
										</div>

										{language.code === locale && (
											<svg
												className="w-4 h-4 text-blue-600"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</div>

									{language.primary && (
										<div className="mt-1 text-xs text-blue-600 font-medium">
											{t("languageSwitcher.primary")}
										</div>
									)}
								</button>
							))}
						</div>

						{/* Formatting Examples */}
						<div className="border-t border-gray-200 p-4 bg-gray-50">
							<h4 className="text-xs font-medium text-gray-900 mb-2">
								{t("languageSwitcher.examples.title")}
							</h4>
							<div className="space-y-1 text-xs text-gray-600">
								<div>
									<strong>{t("languageSwitcher.examples.date")}:</strong>{" "}
									{exampleContent.date}
								</div>
								<div>
									<strong>{t("languageSwitcher.examples.time")}:</strong>{" "}
									{exampleContent.time}
								</div>
								<div>
									<strong>{t("languageSwitcher.examples.number")}:</strong>{" "}
									{exampleContent.number}
								</div>
								<div>
									<strong>{t("languageSwitcher.examples.currency")}:</strong>{" "}
									{exampleContent.currency}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Render inline variant
	if (variant === "inline") {
		return (
			<div
				className={`language-switcher-inline flex flex-wrap gap-2 ${isRTL ? "rtl" : "ltr"}`}
				data-testid={testId}
				data-nsm-classification={classification}
				role="group"
				aria-label={t("languageSwitcher.inline.ariaLabel")}
			>
				{SUPPORTED_LANGUAGES.map((language) => (
					<button
						key={language.code}
						type="button"
						className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
							language.code === locale
								? "bg-blue-100 text-blue-800 border-blue-300"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
						}`}
						aria-pressed={language.code === locale}
						aria-label={t("languageSwitcher.inline.buttonLabel", {
							language: language.name,
							current: language.code === locale,
						})}
						onClick={() => handleLanguageSelect(language.code)}
					>
						{showFlags && (
							<span className="text-base" role="img" aria-hidden="true">
								{language.flag}
							</span>
						)}

						<span>{showNativeNames ? language.nativeName : language.name}</span>

						{language.primary && (
							<span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">
								{t("languageSwitcher.primaryShort")}
							</span>
						)}
					</button>
				))}
			</div>
		);
	}

	// Modal variant would be implemented here
	return null;
};

export default LanguageSwitcher;
export type { LanguageSwitcherProps };

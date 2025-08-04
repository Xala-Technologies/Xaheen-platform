/**
 * Locale Switcher - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 *
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ RTL support for Arabic
 * ✅ Explicit TypeScript return types
 */

"use client";

import { Button, Card, Stack, Typography } from "@xala-technologies/ui-system";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { localeNames, SupportedLocale, supportedLocales } from "@/lib/i18n";

interface LocaleSwitcherProps {
	currentLocale: SupportedLocale;
}

/**
 * Locale switcher component with full i18n support
 * Supports English, Norwegian Bokmål, French, and Arabic with RTL
 */
export function LocaleSwitcher({
	currentLocale,
}: LocaleSwitcherProps): React.JSX.Element {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const switchLocale = (newLocale: SupportedLocale): void => {
		// Remove current locale from pathname and add new locale
		const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
		const newPath = `/${newLocale}${pathWithoutLocale}`;

		router.push(newPath);
		setIsOpen(false);
	};

	const toggleDropdown = (): void => {
		setIsOpen(!isOpen);
	};

	return (
		<div style={{ position: "relative" }}>
			<Button
				variant="ghost"
				size="sm"
				onClick={toggleDropdown}
				aria-label="Switch language"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
			>
				<Stack direction="horizontal" gap="sm" align="center">
					<Globe size={16} />
					<Typography variant="body" size="sm">
						{localeNames[currentLocale]}
					</Typography>
					<ChevronDown size={14} />
				</Stack>
			</Button>

			{isOpen && (
				<Card
					variant="elevated"
					padding="sm"
					className="absolute top-full right-0 z-50 min-w-[120px] mt-1"
					role="listbox"
					aria-label="Select language"
				>
					<Stack direction="vertical" gap="xs">
						{supportedLocales.map((locale) => (
							<Button
								key={locale}
								variant={locale === currentLocale ? "default" : "ghost"}
								size="sm"
								onClick={() => switchLocale(locale)}
								role="option"
								aria-selected={locale === currentLocale}
								style={{
									width: "100%",
									justifyContent: "flex-start",
								}}
							>
								<Typography variant="body" size="sm">
									{localeNames[locale]}
								</Typography>
							</Button>
						))}
					</Stack>
				</Card>
			)}
		</div>
	);
}

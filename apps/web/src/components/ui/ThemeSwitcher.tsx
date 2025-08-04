/**
 * Theme Switcher - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 *
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ Use UI System's native theme hooks
 * ✅ No external theme libraries
 * ✅ Explicit TypeScript return types
 */

"use client";

import { Button } from "@xala-technologies/ui-system";
import { useTheme } from "@xala-technologies/ui-system/hooks";
import { Moon, Sun } from "lucide-react";

/**
 * Theme switcher component using Xala UI System v5.0.0 native theme management
 * Provides accessible theme switching with proper icons and labels
 */
export function ThemeSwitcher(): React.JSX.Element {
	const { theme, setTheme } = useTheme();

	const toggleTheme = (): void => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	const isDark = theme === "dark";

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleTheme}
			aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
		>
			{isDark ? <Sun size={16} /> : <Moon size={16} />}
		</Button>
	);
}

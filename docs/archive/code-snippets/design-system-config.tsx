// packages/design-system/src/tokens/colors.ts
export const colors = {
	// Brand Colors
	brand: {
		primary: {
			50: "#e6f1ff",
			100: "#b3d4ff",
			200: "#80b8ff",
			300: "#4d9bff",
			400: "#1a7eff",
			500: "#0066ff", // Main brand color
			600: "#0052cc",
			700: "#003d99",
			800: "#002966",
			900: "#001433",
		},
		secondary: {
			50: "#f0f4f8",
			100: "#d9e2ec",
			200: "#bcccdc",
			300: "#9fb3c8",
			400: "#829ab1",
			500: "#627d98",
			600: "#486581",
			700: "#334e68",
			800: "#243b53",
			900: "#102a43",
		},
	},

	// Semantic Colors
	semantic: {
		success: {
			light: "#d4f4dd",
			main: "#22c55e",
			dark: "#15803d",
			contrastText: "#ffffff",
		},
		warning: {
			light: "#fef3c7",
			main: "#f59e0b",
			dark: "#d97706",
			contrastText: "#ffffff",
		},
		error: {
			light: "#fee2e2",
			main: "#ef4444",
			dark: "#dc2626",
			contrastText: "#ffffff",
		},
		info: {
			light: "#dbeafe",
			main: "#3b82f6",
			dark: "#2563eb",
			contrastText: "#ffffff",
		},
	},

	// Neutral Colors
	neutral: {
		0: "#ffffff",
		50: "#f9fafb",
		100: "#f3f4f6",
		200: "#e5e7eb",
		300: "#d1d5db",
		400: "#9ca3af",
		500: "#6b7280",
		600: "#4b5563",
		700: "#374151",
		800: "#1f2937",
		900: "#111827",
		950: "#030712",
	},

	// Functional Colors
	functional: {
		background: {
			primary: "#ffffff",
			secondary: "#f9fafb",
			tertiary: "#f3f4f6",
			inverse: "#111827",
		},
		text: {
			primary: "#111827",
			secondary: "#4b5563",
			tertiary: "#9ca3af",
			disabled: "#d1d5db",
			inverse: "#ffffff",
		},
		border: {
			light: "#e5e7eb",
			main: "#d1d5db",
			dark: "#9ca3af",
		},
		overlay: {
			light: "rgba(0, 0, 0, 0.1)",
			main: "rgba(0, 0, 0, 0.5)",
			dark: "rgba(0, 0, 0, 0.8)",
		},
	},
} as const;

// packages/design-system/src/tokens/typography.ts
export const typography = {
	fontFamily: {
		sans: [
			"Inter",
			"system-ui",
			"-apple-system",
			"BlinkMacSystemFont",
			"Segoe UI",
			"sans-serif",
		],
		serif: ["Merriweather", "Georgia", "serif"],
		mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
	},

	fontSize: {
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		base: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
		"4xl": "2.25rem", // 36px
		"5xl": "3rem", // 48px
		"6xl": "3.75rem", // 60px
		"7xl": "4.5rem", // 72px
		"8xl": "6rem", // 96px
		"9xl": "8rem", // 128px
	},

	fontWeight: {
		thin: "100",
		extralight: "200",
		light: "300",
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
		extrabold: "800",
		black: "900",
	},

	lineHeight: {
		none: "1",
		tight: "1.25",
		snug: "1.375",
		normal: "1.5",
		relaxed: "1.625",
		loose: "2",
	},

	letterSpacing: {
		tighter: "-0.05em",
		tight: "-0.025em",
		normal: "0em",
		wide: "0.025em",
		wider: "0.05em",
		widest: "0.1em",
	},

	// Predefined text styles
	textStyles: {
		h1: {
			fontSize: "3rem",
			fontWeight: "700",
			lineHeight: "1.25",
			letterSpacing: "-0.025em",
		},
		h2: {
			fontSize: "2.25rem",
			fontWeight: "700",
			lineHeight: "1.25",
			letterSpacing: "-0.025em",
		},
		h3: {
			fontSize: "1.875rem",
			fontWeight: "600",
			lineHeight: "1.375",
			letterSpacing: "-0.025em",
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: "600",
			lineHeight: "1.375",
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: "600",
			lineHeight: "1.5",
		},
		h6: {
			fontSize: "1.125rem",
			fontWeight: "600",
			lineHeight: "1.5",
		},
		body1: {
			fontSize: "1rem",
			fontWeight: "400",
			lineHeight: "1.5",
		},
		body2: {
			fontSize: "0.875rem",
			fontWeight: "400",
			lineHeight: "1.5",
		},
		caption: {
			fontSize: "0.75rem",
			fontWeight: "400",
			lineHeight: "1.5",
		},
		overline: {
			fontSize: "0.75rem",
			fontWeight: "600",
			lineHeight: "1.5",
			letterSpacing: "0.1em",
			textTransform: "uppercase",
		},
	},
} as const;

// packages/design-system/src/tokens/spacing.ts
export const spacing = {
	0: "0",
	px: "1px",
	0.5: "0.125rem", // 2px
	1: "0.25rem", // 4px
	1.5: "0.375rem", // 6px
	2: "0.5rem", // 8px
	2.5: "0.625rem", // 10px
	3: "0.75rem", // 12px
	3.5: "0.875rem", // 14px
	4: "1rem", // 16px
	5: "1.25rem", // 20px
	6: "1.5rem", // 24px
	7: "1.75rem", // 28px
	8: "2rem", // 32px
	9: "2.25rem", // 36px
	10: "2.5rem", // 40px
	11: "2.75rem", // 44px
	12: "3rem", // 48px
	14: "3.5rem", // 56px
	16: "4rem", // 64px
	20: "5rem", // 80px
	24: "6rem", // 96px
	28: "7rem", // 112px
	32: "8rem", // 128px
	36: "9rem", // 144px
	40: "10rem", // 160px
	44: "11rem", // 176px
	48: "12rem", // 192px
	52: "13rem", // 208px
	56: "14rem", // 224px
	60: "15rem", // 240px
	64: "16rem", // 256px
	72: "18rem", // 288px
	80: "20rem", // 320px
	96: "24rem", // 384px
} as const;

// packages/design-system/src/tokens/effects.ts
export const effects = {
	borderRadius: {
		none: "0",
		sm: "0.125rem", // 2px
		base: "0.25rem", // 4px
		md: "0.375rem", // 6px
		lg: "0.5rem", // 8px
		xl: "0.75rem", // 12px
		"2xl": "1rem", // 16px
		"3xl": "1.5rem", // 24px
		full: "9999px",
	},

	boxShadow: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
		inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
		none: "none",
	},

	blur: {
		none: "0",
		sm: "4px",
		base: "8px",
		md: "12px",
		lg: "16px",
		xl: "24px",
		"2xl": "40px",
		"3xl": "64px",
	},

	transition: {
		duration: {
			fast: "150ms",
			base: "200ms",
			slow: "300ms",
			slower: "500ms",
		},
		timing: {
			ease: "cubic-bezier(0.4, 0, 0.2, 1)",
			easeIn: "cubic-bezier(0.4, 0, 1, 1)",
			easeOut: "cubic-bezier(0, 0, 0.2, 1)",
			easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
			linear: "linear",
		},
	},
} as const;

// packages/design-system/src/tokens/index.ts
export { colors } from "./colors";
export { effects } from "./effects";
export { spacing } from "./spacing";
export { typography } from "./typography";

export const tokens = {
	colors,
	typography,
	spacing,
	effects,
} as const;

// packages/design-system/src/theme/theme.ts
import { tokens } from "../tokens";

export const lightTheme = {
	colors: {
		primary: tokens.colors.brand.primary[500],
		primaryHover: tokens.colors.brand.primary[600],
		primaryActive: tokens.colors.brand.primary[700],

		secondary: tokens.colors.brand.secondary[500],
		secondaryHover: tokens.colors.brand.secondary[600],
		secondaryActive: tokens.colors.brand.secondary[700],

		background: tokens.colors.functional.background.primary,
		backgroundSecondary: tokens.colors.functional.background.secondary,
		backgroundTertiary: tokens.colors.functional.background.tertiary,

		text: tokens.colors.functional.text.primary,
		textSecondary: tokens.colors.functional.text.secondary,
		textTertiary: tokens.colors.functional.text.tertiary,
		textDisabled: tokens.colors.functional.text.disabled,

		border: tokens.colors.functional.border.main,
		borderLight: tokens.colors.functional.border.light,
		borderDark: tokens.colors.functional.border.dark,

		...tokens.colors.semantic,
	},
	...tokens.typography,
	spacing: tokens.spacing,
	effects: tokens.effects,
} as const;

export const darkTheme = {
	colors: {
		primary: tokens.colors.brand.primary[400],
		primaryHover: tokens.colors.brand.primary[300],
		primaryActive: tokens.colors.brand.primary[200],

		secondary: tokens.colors.brand.secondary[400],
		secondaryHover: tokens.colors.brand.secondary[300],
		secondaryActive: tokens.colors.brand.secondary[200],

		background: tokens.colors.neutral[900],
		backgroundSecondary: tokens.colors.neutral[800],
		backgroundTertiary: tokens.colors.neutral[700],

		text: tokens.colors.neutral[50],
		textSecondary: tokens.colors.neutral[300],
		textTertiary: tokens.colors.neutral[400],
		textDisabled: tokens.colors.neutral[600],

		border: tokens.colors.neutral[700],
		borderLight: tokens.colors.neutral[800],
		borderDark: tokens.colors.neutral[600],

		...tokens.colors.semantic,
	},
	...tokens.typography,
	spacing: tokens.spacing,
	effects: tokens.effects,
} as const;

export type Theme = typeof lightTheme;

// packages/design-system/src/utils/css-variables.ts
import { Theme } from "../theme/theme";

export function generateCSSVariables(theme: Theme): string {
	const cssVars: string[] = [];

	// Colors
	Object.entries(theme.colors).forEach(([key, value]) => {
		if (typeof value === "string") {
			cssVars.push(`--color-${kebabCase(key)}: ${value};`);
		} else if (typeof value === "object") {
			Object.entries(value).forEach(([subKey, subValue]) => {
				cssVars.push(
					`--color-${kebabCase(key)}-${kebabCase(subKey)}: ${subValue};`,
				);
			});
		}
	});

	// Typography
	Object.entries(theme.fontFamily).forEach(([key, value]) => {
		cssVars.push(
			`--font-${kebabCase(key)}: ${Array.isArray(value) ? value.join(", ") : value};`,
		);
	});

	Object.entries(theme.fontSize).forEach(([key, value]) => {
		cssVars.push(`--text-${key}: ${value};`);
	});

	Object.entries(theme.fontWeight).forEach(([key, value]) => {
		cssVars.push(`--font-${kebabCase(key)}: ${value};`);
	});

	// Spacing
	Object.entries(theme.spacing).forEach(([key, value]) => {
		cssVars.push(`--spacing-${key}: ${value};`);
	});

	// Effects
	Object.entries(theme.effects.borderRadius).forEach(([key, value]) => {
		cssVars.push(`--radius-${key}: ${value};`);
	});

	Object.entries(theme.effects.boxShadow).forEach(([key, value]) => {
		cssVars.push(`--shadow-${key}: ${value};`);
	});

	return `:root {\n  ${cssVars.join("\n  ")}\n}`;
}

function kebabCase(str: string): string {
	return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

// packages/design-system/src/components/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { darkTheme, lightTheme, Theme } from "../theme/theme";
import { generateCSSVariables } from "../utils/css-variables";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Theme;
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
	toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
	children,
	defaultMode = "system",
}: {
	children: React.ReactNode;
	defaultMode?: ThemeMode;
}) {
	const [mode, setMode] = useState<ThemeMode>(defaultMode);
	const [theme, setTheme] = useState<Theme>(lightTheme);

	useEffect(() => {
		const root = document.documentElement;
		let currentTheme: Theme;

		if (mode === "system") {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			currentTheme = prefersDark ? darkTheme : lightTheme;
			root.classList.toggle("dark", prefersDark);
		} else {
			currentTheme = mode === "dark" ? darkTheme : lightTheme;
			root.classList.toggle("dark", mode === "dark");
		}

		setTheme(currentTheme);

		// Inject CSS variables
		const style = document.createElement("style");
		style.textContent = generateCSSVariables(currentTheme);
		style.id = "theme-variables";

		const existingStyle = document.getElementById("theme-variables");
		if (existingStyle) {
			existingStyle.replaceWith(style);
		} else {
			document.head.appendChild(style);
		}

		// Listen for system theme changes
		if (mode === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleChange = (e: MediaQueryListEvent) => {
				const newTheme = e.matches ? darkTheme : lightTheme;
				setTheme(newTheme);
				root.classList.toggle("dark", e.matches);

				const style = document.getElementById("theme-variables");
				if (style) {
					style.textContent = generateCSSVariables(newTheme);
				}
			};

			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
	}, [mode]);

	const toggleMode = () => {
		setMode((current) => {
			if (current === "light") return "dark";
			if (current === "dark") return "light";
			return "light";
		});
	};

	return (
		<ThemeContext.Provider value={{ theme, mode, setMode, toggleMode }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

// packages/design-system/src/utils/styled.ts
import { Theme } from "../theme/theme";

type ThemeFunction<T> = (theme: Theme) => T;

export function styled<T extends keyof JSX.IntrinsicElements>(element: T) {
	return (
		styles: TemplateStringsArray | ThemeFunction<string>,
		...interpolations: (string | ThemeFunction<string>)[]
	) => {
		return React.forwardRef<
			JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<infer P, any>
				? P
				: never,
			JSX.IntrinsicElements[T]
		>((props, ref) => {
			const { theme } = useTheme();

			let css = "";
			if (typeof styles === "function") {
				css = styles(theme);
			} else {
				css = styles.reduce((acc, str, i) => {
					const interpolation = interpolations[i];
					const value =
						typeof interpolation === "function"
							? interpolation(theme)
							: interpolation || "";
					return acc + str + value;
				}, "");
			}

			return React.createElement(element, {
				...props,
				ref,
				style: { ...parseCSS(css), ...props.style },
			});
		});
	};
}

function parseCSS(css: string): React.CSSProperties {
	// Simple CSS to object parser for demo
	// In production, use a proper CSS parser
	const style: Record<string, string> = {};
	const rules = css.split(";").filter(Boolean);

	rules.forEach((rule) => {
		const [property, value] = rule.split(":").map((s) => s.trim());
		if (property && value) {
			const camelCase = property.replace(/-([a-z])/g, (_, letter) =>
				letter.toUpperCase(),
			);
			style[camelCase] = value;
		}
	});

	return style as React.CSSProperties;
}

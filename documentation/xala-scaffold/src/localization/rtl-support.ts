import { logger } from "../utils/logger.js";
import { getLocaleMetadata, isRTLLocale, LocaleCode } from "./core.js";

// RTL CSS properties that need flipping
const RTL_PROPERTIES = {
	// Margin properties
	marginLeft: "marginRight",
	marginRight: "marginLeft",
	paddingLeft: "paddingRight",
	paddingRight: "paddingLeft",

	// Position properties
	left: "right",
	right: "left",

	// Border properties
	borderLeft: "borderRight",
	borderRight: "borderLeft",
	borderLeftWidth: "borderRightWidth",
	borderRightWidth: "borderLeftWidth",
	borderLeftColor: "borderRightColor",
	borderRightColor: "borderLeftColor",
	borderLeftStyle: "borderRightStyle",
	borderRightStyle: "borderLeftStyle",
	borderTopLeftRadius: "borderTopRightRadius",
	borderTopRightRadius: "borderTopLeftRadius",
	borderBottomLeftRadius: "borderBottomRightRadius",
	borderBottomRightRadius: "borderBottomLeftRadius",

	// Text properties
	textAlign: (value: string) => {
		if (value === "left") return "right";
		if (value === "right") return "left";
		return value;
	},

	// Float properties
	float: (value: string) => {
		if (value === "left") return "right";
		if (value === "right") return "left";
		return value;
	},

	// Clear properties
	clear: (value: string) => {
		if (value === "left") return "right";
		if (value === "right") return "left";
		return value;
	},
};

// Icon mappings for RTL
const RTL_ICON_MAPPINGS: Record<string, string> = {
	// Arrow icons
	"arrow-left": "arrow-right",
	"arrow-right": "arrow-left",
	"chevron-left": "chevron-right",
	"chevron-right": "chevron-left",
	"double-chevron-left": "double-chevron-right",
	"double-chevron-right": "double-chevron-left",

	// Navigation icons
	back: "forward",
	forward: "back",
	previous: "next",
	next: "previous",
	first: "last",
	last: "first",

	// Alignment icons
	"align-left": "align-right",
	"align-right": "align-left",
	indent: "outdent",
	outdent: "indent",

	// Media icons
	play: "play-rtl",
	"fast-forward": "fast-backward",
	"fast-backward": "fast-forward",
	"skip-forward": "skip-backward",
	"skip-backward": "skip-forward",
};

// RTL support configuration
export interface RTLConfig {
	enableMirroring: boolean;
	enableIconFlipping: boolean;
	customMappings?: Record<string, string>;
	excludeProperties?: string[];
}

// Default RTL configuration
const DEFAULT_RTL_CONFIG: RTLConfig = {
	enableMirroring: true,
	enableIconFlipping: true,
	customMappings: {},
	excludeProperties: [],
};

// RTL support manager
export class RTLSupport {
	private config: RTLConfig;

	constructor(config: Partial<RTLConfig> = {}) {
		this.config = { ...DEFAULT_RTL_CONFIG, ...config };
	}

	// Check if locale requires RTL
	isRTLRequired(locale: LocaleCode): boolean {
		return isRTLLocale(locale);
	}

	// Flip CSS property for RTL
	flipProperty(property: string, value: any): { property: string; value: any } {
		if (!this.config.enableMirroring) {
			return { property, value };
		}

		if (this.config.excludeProperties?.includes(property)) {
			return { property, value };
		}

		// Check custom mappings first
		if (this.config.customMappings?.[property]) {
			return {
				property: this.config.customMappings[property],
				value,
			};
		}

		// Check built-in mappings
		const mapping = RTL_PROPERTIES[property as keyof typeof RTL_PROPERTIES];

		if (typeof mapping === "string") {
			return { property: mapping, value };
		}

		if (typeof mapping === "function") {
			return { property, value: mapping(value) };
		}

		return { property, value };
	}

	// Flip multiple CSS properties
	flipStyles(styles: Record<string, any>): Record<string, any> {
		const flipped: Record<string, any> = {};

		for (const [property, value] of Object.entries(styles)) {
			const { property: flippedProp, value: flippedValue } = this.flipProperty(
				property,
				value,
			);
			flipped[flippedProp] = flippedValue;
		}

		return flipped;
	}

	// Flip icon name for RTL
	flipIcon(iconName: string): string {
		if (!this.config.enableIconFlipping) {
			return iconName;
		}

		// Check custom mappings
		if (this.config.customMappings?.[iconName]) {
			return this.config.customMappings[iconName];
		}

		// Check built-in mappings
		return RTL_ICON_MAPPINGS[iconName] || iconName;
	}

	// Generate RTL-aware className
	generateClassName(baseClass: string, locale: LocaleCode): string {
		if (!this.isRTLRequired(locale)) {
			return baseClass;
		}

		return `${baseClass} ${baseClass}-rtl`;
	}

	// Convert Tailwind classes for RTL
	convertTailwindClasses(classes: string, locale: LocaleCode): string {
		if (!this.isRTLRequired(locale)) {
			return classes;
		}

		const classArray = classes.split(" ");
		const converted = classArray.map((cls) => {
			// Margin classes
			if (cls.startsWith("ml-")) return cls.replace("ml-", "mr-");
			if (cls.startsWith("mr-")) return cls.replace("mr-", "ml-");
			if (cls.startsWith("pl-")) return cls.replace("pl-", "pr-");
			if (cls.startsWith("pr-")) return cls.replace("pr-", "pl-");

			// Position classes
			if (cls.startsWith("left-")) return cls.replace("left-", "right-");
			if (cls.startsWith("right-")) return cls.replace("right-", "left-");

			// Border classes
			if (cls.startsWith("border-l-"))
				return cls.replace("border-l-", "border-r-");
			if (cls.startsWith("border-r-"))
				return cls.replace("border-r-", "border-l-");
			if (cls.startsWith("rounded-l-"))
				return cls.replace("rounded-l-", "rounded-r-");
			if (cls.startsWith("rounded-r-"))
				return cls.replace("rounded-r-", "rounded-l-");
			if (cls.startsWith("rounded-tl-"))
				return cls.replace("rounded-tl-", "rounded-tr-");
			if (cls.startsWith("rounded-tr-"))
				return cls.replace("rounded-tr-", "rounded-tl-");
			if (cls.startsWith("rounded-bl-"))
				return cls.replace("rounded-bl-", "rounded-br-");
			if (cls.startsWith("rounded-br-"))
				return cls.replace("rounded-br-", "rounded-bl-");

			// Text alignment
			if (cls === "text-left") return "text-right";
			if (cls === "text-right") return "text-left";

			// Flexbox
			if (cls === "flex-row") return "flex-row-reverse";
			if (cls === "flex-row-reverse") return "flex-row";

			return cls;
		});

		return converted.join(" ");
	}

	// Generate RTL-aware component wrapper
	wrapComponent(componentCode: string, locale: LocaleCode): string {
		if (!this.isRTLRequired(locale)) {
			return componentCode;
		}

		const metadata = getLocaleMetadata(locale);
		const direction = metadata?.direction || "ltr";

		return `
<div dir="${direction}" className="rtl-wrapper">
  ${componentCode}
</div>`;
	}

	// Generate RTL styles for component
	generateRTLStyles(componentName: string): string {
		return `
/* RTL styles for ${componentName} */
.${componentName}-rtl {
  direction: rtl;
  text-align: right;
}

/* Flip horizontal margins and paddings */
.${componentName}-rtl > * {
  margin-inline-start: 0;
  margin-inline-end: 0;
}

/* Flip flexbox direction */
.${componentName}-rtl .flex-row {
  flex-direction: row-reverse;
}

/* Flip absolute positioning */
.${componentName}-rtl .absolute {
  left: auto;
  right: 0;
}

/* Flip transforms */
.${componentName}-rtl .transform {
  transform: scaleX(-1);
}
`;
	}

	// Check if property needs RTL flipping
	needsFlipping(property: string): boolean {
		return (
			property in RTL_PROPERTIES ||
			property in (this.config.customMappings || {})
		);
	}

	// Get all RTL properties
	getRTLProperties(): string[] {
		return [
			...Object.keys(RTL_PROPERTIES),
			...Object.keys(this.config.customMappings || {}),
		];
	}

	// Generate RTL configuration for framework
	generateFrameworkConfig(
		framework: "next" | "react" | "vue",
	): Record<string, any> {
		switch (framework) {
			case "next":
				return {
					i18n: {
						locales: ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"],
						defaultLocale: "nb-NO",
						localeDetection: true,
					},
					experimental: {
						optimizeCss: true,
					},
				};

			case "react":
				return {
					rtlPlugin: "@xala-technologies/rtl-plugin",
					rtlOptions: {
						autoFlip: true,
						excludeProperties: this.config.excludeProperties,
					},
				};

			case "vue":
				return {
					rtl: {
						locales: ["ar-SA"],
						autoDetect: true,
						cssFlip: true,
					},
				};

			default:
				return {};
		}
	}

	// Validate RTL implementation
	validateRTLImplementation(
		componentCode: string,
		locale: LocaleCode,
	): { valid: boolean; issues: string[] } {
		const issues: string[] = [];

		if (!this.isRTLRequired(locale)) {
			return { valid: true, issues: [] };
		}

		// Check for hardcoded left/right values
		if (componentCode.includes("left:") || componentCode.includes("right:")) {
			issues.push(
				"Found hardcoded left/right positioning - use logical properties",
			);
		}

		// Check for margin/padding without logical properties
		if (
			componentCode.includes("marginLeft") ||
			componentCode.includes("marginRight") ||
			componentCode.includes("paddingLeft") ||
			componentCode.includes("paddingRight")
		) {
			issues.push("Found physical margin/padding - use logical properties");
		}

		// Check for missing dir attribute
		if (!componentCode.includes("dir=")) {
			issues.push("Missing dir attribute for RTL support");
		}

		// Check for text alignment
		if (
			componentCode.includes("text-align: left") ||
			componentCode.includes("text-align: right")
		) {
			issues.push("Found hardcoded text alignment - use start/end values");
		}

		return {
			valid: issues.length === 0,
			issues,
		};
	}
}

// Create default RTL support instance
export const rtlSupport = new RTLSupport();

// Export convenience functions
export function flipStyles(
	styles: Record<string, any>,
	locale: LocaleCode,
): Record<string, any> {
	if (!isRTLLocale(locale)) {
		return styles;
	}
	return rtlSupport.flipStyles(styles);
}

export function flipIcon(iconName: string, locale: LocaleCode): string {
	if (!isRTLLocale(locale)) {
		return iconName;
	}
	return rtlSupport.flipIcon(iconName);
}

export function convertTailwindForRTL(
	classes: string,
	locale: LocaleCode,
): string {
	return rtlSupport.convertTailwindClasses(classes, locale);
}

// CSS-in-JS helper for RTL
export function rtlStyle(
	ltrStyles: Record<string, any>,
	locale: LocaleCode,
): Record<string, any> {
	return flipStyles(ltrStyles, locale);
}

// Logical property helpers
export const logicalProperties = {
	marginStart: (value: string | number) => ({
		marginInlineStart: value,
	}),
	marginEnd: (value: string | number) => ({
		marginInlineEnd: value,
	}),
	paddingStart: (value: string | number) => ({
		paddingInlineStart: value,
	}),
	paddingEnd: (value: string | number) => ({
		paddingInlineEnd: value,
	}),
	start: (value: string | number) => ({
		insetInlineStart: value,
	}),
	end: (value: string | number) => ({
		insetInlineEnd: value,
	}),
};

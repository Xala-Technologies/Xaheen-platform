/**
 * Button Component Type Definitions
 * Generated from component specification v1.0.0
 *
 * @description A versatile button component with Norwegian compliance and multi-platform support. Supports various sizes, variants, and accessibility features.
 * @category basic
 * @stability stable
 * @nsmClassification OPEN
 * @generatedAt 2024-08-04T14:30:00.000Z
 *
 * ⚠️  DO NOT EDIT - This file is auto-generated
 * To modify types, update the component specification JSON file
 */

import type { TemplateRef } from "@angular/core";
import type {
	ComponentProps,
	KeyboardEvent,
	MouseEvent,
	ReactNode,
	RefObject,
} from "react";
import type { VNode } from "vue";
import type { NSMClassification } from "../src/types/specification-types.js";

// ===== MAIN PROPS INTERFACE =====

/**
 * Props for the Button component
 *
 * @interface ButtonProps
 * @description A versatile button component with Norwegian compliance and multi-platform support. Supports various sizes, variants, and accessibility features.
 */
export interface ButtonProps {
	/**
	 * Button content - can be text or React nodes
	 * @example "Click me"
	 */
	readonly children?: string | ReactNode;

	/**
	 * Visual style variant of the button
	 * @default "primary"
	 * @example "primary"
	 */
	readonly variant?:
		| "primary"
		| "secondary"
		| "destructive"
		| "ghost"
		| "outline";

	/**
	 * Size variant controlling height and padding
	 * @default "md"
	 */
	readonly size?: "xs" | "sm" | "md" | "lg" | "xl";

	/**
	 * Whether the button is disabled and non-interactive
	 * @default false
	 * @aria aria-disabled
	 */
	readonly disabled?: boolean;

	/**
	 * Whether the button is in a loading state
	 * @default false
	 * @aria aria-busy
	 */
	readonly loading?: boolean;

	/**
	 * Click event handler function
	 */
	readonly onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

	/**
	 * Keyboard event handler for accessibility
	 */
	readonly onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;

	/**
	 * Additional CSS classes to apply
	 */
	readonly className?: string;

	/**
	 * Test identifier for automated testing
	 */
	readonly testId?: string;

	/**
	 * Accessible label for screen readers
	 * @aria aria-label
	 */
	readonly ariaLabel?: string;
}

// ===== VARIANT TYPES =====

/**
 * Button variant values
 */
export type ButtonVariant =
	| "primary"
	| "secondary"
	| "destructive"
	| "ghost"
	| "outline";

/**
 * Button size values
 */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Button variant props for compound variants
 */
export type ButtonVariantProps = {
	readonly variant?: string;
	readonly size?: string;
};

// ===== EVENT HANDLER TYPES =====

/**
 * Event handler types for Button
 */
export interface ButtonEventHandlers {
	readonly onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
	readonly onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

// ===== PLATFORM-SPECIFIC TYPES =====

/**
 * React-specific props for Button
 */
export interface ButtonReactProps extends ButtonProps {
	readonly ref?: RefObject<HTMLElement>;
	readonly key?: string | number;
}

/**
 * Vue-specific props for Button
 */
export interface ButtonVueProps extends ButtonProps {
	readonly ref?: string;
	readonly slots?: Record<string, VNode>;
}

/**
 * Angular-specific props for Button
 */
export interface ButtonAngularProps extends ButtonProps {
	readonly templateRef?: TemplateRef<any>;
}

// ===== UTILITY TYPES =====

/**
 * Required props for Button
 */
export type ButtonRequiredProps = never;

/**
 * Optional props for Button
 */
export type ButtonOptionalProps =
	| "children"
	| "variant"
	| "size"
	| "disabled"
	| "loading"
	| "onClick"
	| "onKeyDown"
	| "className"
	| "testId"
	| "ariaLabel";

/**
 * All prop keys for Button
 */
export type ButtonPropKeys =
	| "children"
	| "variant"
	| "size"
	| "disabled"
	| "loading"
	| "onClick"
	| "onKeyDown"
	| "className"
	| "testId"
	| "ariaLabel";

/**
 * Partial props type for default values
 */
export type PartialButtonProps = Partial<ButtonProps>;

// ===== TYPE GUARDS =====

/**
 * Type guards for Button
 */
export const isButtonProps = (props: unknown): props is ButtonProps => {
	if (typeof props !== "object" || props === null) return false;
	return true;
};

// ===== DOCUMENTATION TYPES =====

/**
 * Documentation metadata for Button
 */
export interface ButtonDocumentation {
	readonly componentName: "Button";
	readonly category: "basic";
	readonly description: string;
	readonly version: "1.0.0";
	readonly stability: "stable";
	readonly examples: readonly ComponentExample[];
	readonly accessibility: AccessibilityDocumentation;
}

// ===== VARIANT CONFIGURATION =====

/**
 * Button variant class mappings
 */
export const ButtonVariantClasses = {
	variant: {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary:
			"bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
		destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
		ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
		outline:
			"border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
	},
	size: {
		xs: "h-6 px-2 text-xs",
		sm: "h-8 px-3 text-sm",
		md: "h-10 px-4 text-base",
		lg: "h-12 px-6 text-lg",
		xl: "h-14 px-8 text-xl",
	},
} as const;

/**
 * Button compound variant configurations
 */
export const ButtonCompoundVariants = [
	{
		conditions: { variant: "primary", size: "lg" },
		className: "font-semibold shadow-lg",
	},
	{
		conditions: { variant: "destructive", size: "xs" },
		className: "font-medium",
	},
] as const;

// ===== ACCESSIBILITY TYPES =====

/**
 * Button accessibility configuration
 */
export interface ButtonAccessibilityConfig {
	readonly role: "button" | "link";
	readonly keyboardPatterns: readonly {
		readonly key: "Enter" | "Space" | "Tab" | "Shift+Tab";
		readonly action: "activate" | "navigate";
		readonly context: string;
	}[];
	readonly screenReaderAnnouncements: readonly {
		readonly trigger: "press" | "loading" | "disabled";
		readonly message: string;
		readonly priority: "polite" | "assertive";
	}[];
}

/**
 * Default accessibility configuration
 */
export const ButtonAccessibilityDefaults: ButtonAccessibilityConfig = {
	role: "button",
	keyboardPatterns: [
		{ key: "Enter", action: "activate", context: "Activate button" },
		{ key: "Space", action: "activate", context: "Activate button" },
		{ key: "Tab", action: "navigate", context: "Move focus to next element" },
		{
			key: "Shift+Tab",
			action: "navigate",
			context: "Move focus to previous element",
		},
	],
	screenReaderAnnouncements: [
		{ trigger: "press", message: "Button activated", priority: "polite" },
		{
			trigger: "loading",
			message: "Loading, please wait",
			priority: "assertive",
		},
		{ trigger: "disabled", message: "Button unavailable", priority: "polite" },
	],
} as const;

// ===== VALIDATION TYPES =====

/**
 * Button prop validation schema
 */
export interface ButtonValidationSchema {
	readonly variant?: (value: unknown) => value is ButtonVariant;
	readonly size?: (value: unknown) => value is ButtonSize;
	readonly disabled?: (value: unknown) => value is boolean;
	readonly loading?: (value: unknown) => value is boolean;
	readonly className?: (value: unknown) => value is string;
	readonly testId?: (value: unknown) => value is string;
	readonly ariaLabel?: (value: unknown) => value is string;
}

/**
 * Button validation functions
 */
export const ButtonValidators: ButtonValidationSchema = {
	variant: (value): value is ButtonVariant => {
		return (
			typeof value === "string" &&
			["primary", "secondary", "destructive", "ghost", "outline"].includes(
				value,
			)
		);
	},
	size: (value): value is ButtonSize => {
		return (
			typeof value === "string" &&
			["xs", "sm", "md", "lg", "xl"].includes(value)
		);
	},
	disabled: (value): value is boolean => typeof value === "boolean",
	loading: (value): value is boolean => typeof value === "boolean",
	className: (value): value is string => {
		return typeof value === "string" && /^[a-zA-Z0-9\s\-_]*$/.test(value);
	},
	testId: (value): value is string => {
		return typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(value);
	},
	ariaLabel: (value): value is string => typeof value === "string",
};

// ===== NORWEGIAN COMPLIANCE =====

/**
 * Norwegian compliance metadata for Button
 * NSM Classification: OPEN
 */
export interface ButtonComplianceMetadata {
	readonly nsmClassification: "OPEN";
	readonly gdprCompliant: true;
	readonly auditTrail: false;
	readonly lastAudit?: string;
	readonly approvedBy?: string;
}

/**
 * Button with Norwegian compliance
 */
export type SecureButtonProps = ButtonProps & {
	readonly _compliance?: ButtonComplianceMetadata;
};

// ===== DEFAULT VALUES =====

/**
 * Default prop values for Button
 */
export const ButtonDefaults: Partial<ButtonProps> = {
	variant: "primary",
	size: "md",
	disabled: false,
	loading: false,
} as const;

// ===== PERFORMANCE METRICS =====

/**
 * Button performance metrics
 */
export interface ButtonPerformanceMetrics {
	readonly bundleSize: {
		readonly max: "2KB";
		readonly gzipped: "800B";
	};
	readonly renderTime: {
		readonly initial: "<16ms";
		readonly update: "<8ms";
	};
}

// ===== TESTING TYPES =====

/**
 * Button testing configuration
 */
export interface ButtonTestingConfig {
	readonly unit: {
		readonly required: readonly [
			"renders correctly",
			"handles click events",
			"applies variants correctly",
			"forwards refs properly",
			"handles loading state",
			"handles disabled state",
		];
		readonly coverage: { readonly minimum: 95 };
	};
	readonly integration: {
		readonly scenarios: readonly [
			"form submission workflow",
			"async action handling",
			"keyboard navigation flow",
			"screen reader interaction",
		];
	};
	readonly visual: {
		readonly regression: true;
		readonly responsive: true;
	};
}

// ===== EXPORT ALL TYPES =====

export type {
	// Main interfaces
	ButtonProps,
	ButtonEventHandlers,
	ButtonDocumentation,
	ButtonComplianceMetadata,
	// Platform-specific
	ButtonReactProps,
	ButtonVueProps,
	ButtonAngularProps,
	// Variants and utilities
	ButtonVariant,
	ButtonSize,
	ButtonVariantProps,
	ButtonRequiredProps,
	ButtonOptionalProps,
	ButtonPropKeys,
	PartialButtonProps,
	// Configuration and validation
	ButtonAccessibilityConfig,
	ButtonValidationSchema,
	ButtonPerformanceMetrics,
	ButtonTestingConfig,
	// Compliance
	SecureButtonProps,
};

// Export constants
export {
	ButtonVariantClasses,
	ButtonCompoundVariants,
	ButtonAccessibilityDefaults,
	ButtonValidators,
	ButtonDefaults,
	isButtonProps,
};

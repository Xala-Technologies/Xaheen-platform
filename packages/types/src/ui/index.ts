import type { CSSProperties } from "react";

/**
 * Component size variants
 */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Component color variants
 */
export type ComponentVariant =
	| "primary"
	| "secondary"
	| "destructive"
	| "ghost"
	| "link"
	| "outline"
	| "subtle";

/**
 * Component status
 */
export type ComponentStatus = "info" | "success" | "warning" | "error";

/**
 * Spacing scale (8pt grid)
 */
export type SpacingScale =
	| "0"
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "10"
	| "11"
	| "12"
	| "14"
	| "16"
	| "20"
	| "24"
	| "28"
	| "32"
	| "36"
	| "40"
	| "44"
	| "48"
	| "52"
	| "56"
	| "60"
	| "64"
	| "72"
	| "80"
	| "96";

/**
 * Border radius scale
 */
export type BorderRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

/**
 * Shadow scale
 */
export type Shadow = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner";

/**
 * Font weight scale
 */
export type FontWeight =
	| "thin"
	| "extralight"
	| "light"
	| "normal"
	| "medium"
	| "semibold"
	| "bold"
	| "extrabold"
	| "black";

/**
 * Font size scale
 */
export type FontSize =
	| "xs"
	| "sm"
	| "base"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl"
	| "5xl"
	| "6xl"
	| "7xl"
	| "8xl"
	| "9xl";

/**
 * Base component props
 */
export interface BaseComponentProps {
	className?: string;
	style?: CSSProperties;
	id?: string;
	testId?: string;
}

/**
 * Interactive component props
 */
export interface InteractiveComponentProps extends BaseComponentProps {
	disabled?: boolean;
	loading?: boolean;
	ariaLabel?: string;
	ariaDescribedBy?: string;
	role?: string;
}

/**
 * Form field props
 */
export interface FormFieldProps extends InteractiveComponentProps {
	name: string;
	label?: string;
	error?: string;
	hint?: string;
	required?: boolean;
	readOnly?: boolean;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
	colors: ThemeColors;
	spacing: Record<SpacingScale, string>;
	borderRadius: Record<BorderRadius, string>;
	shadows: Record<Shadow, string>;
	fonts: ThemeFonts;
	fontSizes: Record<FontSize, string>;
	fontWeights: Record<FontWeight, number>;
	breakpoints: ThemeBreakpoints;
}

export interface ThemeColors {
	primary: ColorScale;
	secondary: ColorScale;
	destructive: ColorScale;
	success: ColorScale;
	warning: ColorScale;
	info: ColorScale;
	neutral: ColorScale;
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	popover: string;
	popoverForeground: string;
	muted: string;
	mutedForeground: string;
	accent: string;
	accentForeground: string;
	border: string;
	input: string;
	ring: string;
}

export interface ColorScale {
	50: string;
	100: string;
	200: string;
	300: string;
	400: string;
	500: string;
	600: string;
	700: string;
	800: string;
	900: string;
	950: string;
}

export interface ThemeFonts {
	sans: string;
	serif: string;
	mono: string;
}

export interface ThemeBreakpoints {
	sm: string;
	md: string;
	lg: string;
	xl: string;
	"2xl": string;
}

/**
 * Icon types
 */
export interface IconProps extends BaseComponentProps {
	size?: number | ComponentSize;
	color?: string;
	strokeWidth?: number;
}

/**
 * Layout types
 */
export interface LayoutProps extends BaseComponentProps {
	as?: keyof React.JSX.IntrinsicElements;
	children?: React.ReactNode;
}

export interface GridProps extends LayoutProps {
	cols?: number | Responsive<number>;
	gap?: SpacingScale | Responsive<SpacingScale>;
	rows?: number | Responsive<number>;
}

export interface FlexProps extends LayoutProps {
	direction?: "row" | "column" | Responsive<"row" | "column">;
	align?: FlexAlign | Responsive<FlexAlign>;
	justify?: FlexJustify | Responsive<FlexJustify>;
	wrap?: boolean | Responsive<boolean>;
	gap?: SpacingScale | Responsive<SpacingScale>;
}

export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

/**
 * Responsive utilities
 */
export type Responsive<T> = T | { sm?: T; md?: T; lg?: T; xl?: T; "2xl"?: T };

/**
 * Animation types
 */
export interface AnimationProps {
	animation?: AnimationType;
	duration?: number;
	delay?: number;
	easing?: AnimationEasing;
}

export type AnimationType =
	| "fadeIn"
	| "fadeOut"
	| "slideIn"
	| "slideOut"
	| "scaleIn"
	| "scaleOut"
	| "rotate"
	| "bounce"
	| "pulse";

export type AnimationEasing =
	| "linear"
	| "easeIn"
	| "easeOut"
	| "easeInOut"
	| "spring";

/**
 * Accessibility types
 */
export interface A11yProps {
	ariaLabel?: string;
	ariaLabelledBy?: string;
	ariaDescribedBy?: string;
	ariaHidden?: boolean;
	ariaLive?: "polite" | "assertive" | "off";
	ariaRole?: string;
	tabIndex?: number;
}

/**
 * Toast/Notification types
 */
export interface ToastConfig {
	id?: string;
	title: string;
	description?: string;
	status?: ComponentStatus;
	duration?: number;
	closable?: boolean;
	action?: {
		label: string;
		onClick: () => void;
	};
}

/**
 * Modal/Dialog types
 */
export interface ModalProps extends BaseComponentProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	size?: ComponentSize;
	closeOnOverlayClick?: boolean;
	closeOnEsc?: boolean;
}
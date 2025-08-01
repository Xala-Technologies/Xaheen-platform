/**
 * Shared TypeScript types for CLI
 * Extracted from packages/types
 */

// === Utility Types ===

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = T extends object
	? {
			[P in keyof T]-?: DeepRequired<T[P]>;
		}
	: T;

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = T extends object
	? {
			readonly [P in keyof T]: DeepReadonly<T[P]>;
		}
	: T;

/**
 * Extract keys of type T that have values of type U
 */
export type KeysOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit properties with undefined values
 */
export type NonNullableKeys<T> = {
	[K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Merge two types, with properties from B overriding A
 */
export type Merge<A, B> = Omit<A, keyof B> & B;

// === UI Component Types ===

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

// === CLI-Specific Types ===

/**
 * UI System options
 */
export type UISystem = "default" | "xala";

/**
 * Compliance levels
 */
export type ComplianceLevel = "none" | "gdpr" | "norwegian";

/**
 * Norwegian Security Authority (NSM) classification levels
 */
export type NSMClassification =
	| "OPEN" // Åpen - Public information
	| "INTERNAL" // Intern - Internal use only
	| "RESTRICTED" // Begrenset - Restricted access
	| "CONFIDENTIAL"; // Konfidensiell - Confidential

/**
 * WCAG compliance levels
 */
export type WCAGLevel = "A" | "AA" | "AAA";

/**
 * Template types
 */
export type TemplateType = 
	| "component" 
	| "page" 
	| "layout" 
	| "api" 
	| "test" 
	| "config" 
	| "style";

/**
 * Project configuration
 */
export interface ProjectConfig {
	name: string;
	description?: string;
	version: string;
	uiSystem: UISystem;
	compliance: ComplianceLevel;
	typescript: boolean;
	localization: boolean;
	auth: boolean;
	database?: string;
	orm?: string;
	packageManager: "npm" | "yarn" | "pnpm" | "bun";
}

/**
 * File generation metadata
 */
export interface FileMetadata {
	path: string;
	type: TemplateType;
	size: number;
	checksum?: string;
	dependencies?: string[];
	exports?: string[];
}

/**
 * Validation result
 */
export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
	metadata?: Record<string, unknown>;
}

/**
 * Validation error
 */
export interface ValidationError {
	code: string;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	severity: "error" | "warning" | "info";
}

/**
 * Validation warning
 */
export interface ValidationWarning {
	code: string;
	message: string;
	suggestion?: string;
	file?: string;
	line?: number;
}

/**
 * CLI command options
 */
export interface CLIOptions {
	projectName?: string;
	uiSystem?: UISystem;
	compliance?: ComplianceLevel;
	typescript?: boolean;
	auth?: boolean;
	database?: string;
	orm?: string;
	packageManager?: "npm" | "yarn" | "pnpm" | "bun";
	install?: boolean;
	git?: boolean;
	overwrite?: boolean;
	dryRun?: boolean;
	verbose?: boolean;
}

/**
 * Progress tracking
 */
export interface ProgressStep {
	id: string;
	name: string;
	status: "pending" | "running" | "completed" | "failed";
	progress: number; // 0-100
	message?: string;
	startTime?: Date;
	endTime?: Date;
	duration?: number;
}

/**
 * CLI result
 */
export interface CLIResult {
	success: boolean;
	projectPath?: string;
	files: FileMetadata[];
	errors: ValidationError[];
	warnings: ValidationWarning[];
	duration: number;
	steps: ProgressStep[];
}

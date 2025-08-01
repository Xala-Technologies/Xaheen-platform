/**
 * Shared TypeScript types for CLI
 * Enhanced type system supporting multi-language, compliance, and enterprise features
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

// === Enhanced Core Types ===

/**
 * UI System options
 */
export type UISystem = "default" | "xala";

/**
 * Compliance levels
 */
export type ComplianceLevel = "none" | "gdpr" | "norwegian";

/**
 * Supported languages for internationalization
 */
export type SupportedLanguage = "en" | "nb" | "fr" | "ar";

/**
 * Supported authentication providers
 */
export type AuthProvider = "vipps" | "bankid" | "oauth" | "email" | "passwordless";

/**
 * Supported external integrations
 */
export type Integration = "slack" | "teams" | "altinn" | "vipps" | "stripe";

/**
 * Supported document services
 */
export type DocumentService = "pdf-export" | "csv-import" | "invoices" | "reports";

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

// === Configuration Types ===

/**
 * Language configuration with regional variants
 */
export interface LanguageConfig {
	readonly code: SupportedLanguage;
	readonly name: string;
	readonly nativeName: string;
	readonly direction: "ltr" | "rtl";
	readonly region?: string;
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
	readonly primary: SupportedLanguage;
	readonly supported: readonly SupportedLanguage[];
	readonly fallback: SupportedLanguage;
	readonly rtlSupport: boolean;
	readonly dateFormat?: string;
	readonly numberFormat?: string;
}

/**
 * OAuth provider configuration
 */
export interface OAuthConfig {
	readonly provider: string;
	readonly clientId: string;
	readonly scope?: readonly string[];
	readonly redirectUri?: string;
}

/**
 * Multi-factor authentication configuration
 */
export interface MFAConfig {
	readonly enabled: boolean;
	readonly methods: readonly ("sms" | "email" | "totp" | "hardware")[];
	readonly required: boolean;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
	readonly providers: readonly AuthProvider[];
	readonly mfa: MFAConfig;
	readonly session: {
		readonly duration: number;
		readonly renewal: boolean;
		readonly secure: boolean;
	};
	readonly oauth?: readonly OAuthConfig[];
}

/**
 * Integration service configuration
 */
export interface IntegrationService {
	readonly name: Integration;
	readonly enabled: boolean;
	readonly apiKey?: string;
	readonly webhook?: string;
	readonly config?: Record<string, unknown>;
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
	readonly enabled: readonly Integration[];
	readonly services: readonly IntegrationService[];
	readonly webhooks: {
		readonly baseUrl: string;
		readonly secret: string;
	};
}

/**
 * Document template configuration
 */
export interface DocumentTemplate {
	readonly name: string;
	readonly type: DocumentService;
	readonly template: string;
	readonly variables?: Record<string, string>;
	readonly compliance?: ComplianceLevel;
}

/**
 * Document configuration
 */
export interface DocumentConfig {
	readonly services: readonly DocumentService[];
	readonly templates: readonly DocumentTemplate[];
	readonly compliance: {
		readonly gdpr: boolean;
		readonly nsm: boolean;
		readonly retention: number;
	};
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
	readonly enabled: boolean;
	readonly algorithm: "AES-256-GCM" | "ChaCha20-Poly1305";
	readonly keyRotation: boolean;
	readonly atRest: boolean;
	readonly inTransit: boolean;
}

/**
 * Audit logging configuration
 */
export interface AuditConfig {
	readonly enabled: boolean;
	readonly events: readonly string[];
	readonly retention: number; // days
	readonly export: boolean;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
	readonly encryption: EncryptionConfig;
	readonly audit: AuditConfig;
	readonly classification: NSMClassification;
	readonly accessControl: {
		readonly rbac: boolean;
		readonly mfa: boolean;
		readonly sessionTimeout: number;
	};
}

/**
 * Complete project configuration combining all options
 */
export interface CompleteProjectConfig {
	readonly projectName: string;
	readonly projectDir: string;
	readonly relativePath: string;
	
	// Core configuration
	readonly database: string;
	readonly orm: string;
	readonly backend: string;
	readonly runtime: string;
	readonly frontend: readonly string[];
	readonly addons: readonly string[];
	readonly examples: readonly string[];
	readonly auth: boolean;
	readonly git: boolean;
	readonly packageManager: string;
	readonly install: boolean;
	readonly dbSetup: string;
	readonly api: string;
	readonly webDeploy: string;
	
	// Enhanced features
	readonly ui: UISystem;
	readonly compliance: ComplianceLevel;
	readonly localization: LocalizationConfig;
	readonly authentication: AuthConfig;
	readonly integrations: IntegrationConfig;
	readonly documents: DocumentConfig;
	readonly security: SecurityConfig;
}

/**
 * CLI command options
 */
export interface CLIOptions {
	readonly projectName?: string;
	readonly ui?: UISystem;
	readonly compliance?: ComplianceLevel;
	readonly locales?: readonly SupportedLanguage[];
	readonly primaryLocale?: SupportedLanguage;
	readonly auth?: readonly AuthProvider[];
	readonly integrations?: readonly Integration[];
	readonly documents?: readonly DocumentService[];
	readonly mfa?: boolean;
	readonly encryption?: boolean;
	readonly audit?: boolean;
	readonly typescript?: boolean;
	readonly database?: string;
	readonly orm?: string;
	readonly packageManager?: "npm" | "yarn" | "pnpm" | "bun";
	readonly install?: boolean;
	readonly git?: boolean;
	readonly overwrite?: boolean;
	readonly dryRun?: boolean;
	readonly verbose?: boolean;
}

/**
 * Progress tracking for CLI operations
 */
export interface ProgressStep {
	readonly id: string;
	readonly name: string;
	readonly status: "pending" | "running" | "completed" | "failed";
	readonly progress: number; // 0-100
	readonly message?: string;
	readonly startTime?: Date;
	readonly endTime?: Date;
	readonly duration?: number;
}

/**
 * CLI execution result
 */
export interface CLIResult {
	readonly success: boolean;
	readonly projectPath?: string;
	readonly files: readonly FileMetadata[];
	readonly errors: readonly ValidationError[];
	readonly warnings: readonly ValidationWarning[];
	readonly duration: number;
	readonly steps: readonly ProgressStep[];
}

// === Legacy Types (maintained for compatibility) ===

/**
 * Project configuration (legacy)
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
	readonly path: string;
	readonly type?: TemplateType;
	readonly size: number;
	readonly checksum?: string;
	readonly dependencies?: readonly string[];
	readonly exports?: readonly string[];
	readonly created?: Date;
	readonly modified?: Date;
}

/**
 * Validation result
 */
export interface ValidationResult {
	readonly valid: boolean;
	readonly errors: readonly ValidationError[];
	readonly warnings: readonly ValidationWarning[];
	readonly metadata?: Record<string, unknown>;
}

/**
 * Validation error
 */
export interface ValidationError {
	readonly code: string;
	readonly message: string;
	readonly file?: string;
	readonly line?: number;
	readonly column?: number;
	readonly severity: "error" | "warning" | "info";
}

/**
 * Validation warning
 */
export interface ValidationWarning {
	readonly code: string;
	readonly message: string;
	readonly suggestion?: string;
	readonly file?: string;
	readonly line?: number;
}
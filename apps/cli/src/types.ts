import z from "zod";

// ============================================================================
// EXISTING SCHEMAS (Enhanced)
// ============================================================================

export const DatabaseSchema = z
	.enum(["none", "sqlite", "postgres", "mysql", "mongodb"])
	.describe("Database type");
export type Database = z.infer<typeof DatabaseSchema>;

export const ORMSchema = z
	.enum(["drizzle", "prisma", "mongoose", "none"])
	.describe("ORM type");
export type ORM = z.infer<typeof ORMSchema>;

export const BackendSchema = z
	.enum(["hono", "express", "fastify", "next", "elysia", "convex", "none"])
	.describe("Backend framework");
export type Backend = z.infer<typeof BackendSchema>;

export const RuntimeSchema = z
	.enum(["bun", "node", "workers", "none"])
	.describe(
		"Runtime environment (workers only available with hono backend and drizzle orm)",
	);
export type Runtime = z.infer<typeof RuntimeSchema>;

export const FrontendSchema = z
	.enum([
		"tanstack-router",
		"react-router",
		"tanstack-start",
		"next",
		"nuxt",
		"native-nativewind",
		"native-unistyles",
		"svelte",
		"solid",
		"none",
	])
	.describe("Frontend framework");
export type Frontend = z.infer<typeof FrontendSchema>;

export const AddonsSchema = z
	.enum([
		"pwa",
		"tauri",
		"starlight",
		"biome",
		"husky",
		"turborepo",
		"fumadocs",
		"ultracite",
		"oxlint",
		"none",
	])
	.describe("Additional addons");
export type Addons = z.infer<typeof AddonsSchema>;

export const ExamplesSchema = z
	.enum(["todo", "ai", "none"])
	.describe("Example templates to include");
export type Examples = z.infer<typeof ExamplesSchema>;

export const PackageManagerSchema = z
	.enum(["npm", "pnpm", "bun"])
	.describe("Package manager");
export type PackageManager = z.infer<typeof PackageManagerSchema>;

export const DatabaseSetupSchema = z
	.enum([
		"turso",
		"neon",
		"prisma-postgres",
		"mongodb-atlas",
		"supabase",
		"d1",
		"docker",
		"none",
	])
	.describe("Database hosting setup");
export type DatabaseSetup = z.infer<typeof DatabaseSetupSchema>;

export const APISchema = z.enum(["trpc", "orpc", "none"]).describe("API type");
export type API = z.infer<typeof APISchema>;

export const WebDeploySchema = z
	.enum(["workers", "none"])
	.describe("Web deployment");
export type WebDeploy = z.infer<typeof WebDeploySchema>;

export const ProjectNameSchema = z
	.string()
	.min(1, "Project name cannot be empty")
	.max(255, "Project name must be less than 255 characters")
	.refine(
		(name) => name === "." || !name.startsWith("."),
		"Project name cannot start with a dot (except for '.')",
	)
	.refine(
		(name) => name === "." || !name.startsWith("-"),
		"Project name cannot start with a dash",
	)
	.refine((name) => {
		const invalidChars = ["<", ">", ":", '"', "|", "?", "*"];
		return !invalidChars.some((char) => name.includes(char));
	}, "Project name contains invalid characters")
	.refine(
		(name) => name.toLowerCase() !== "node_modules",
		"Project name is reserved",
	)
	.describe("Project name or path");
export type ProjectName = z.infer<typeof ProjectNameSchema>;

// ============================================================================
// NEW ENHANCED SCHEMAS - Story 3.1
// ============================================================================

/**
 * UI System schema for design system selection
 */
export const UISystemSchema = z
	.enum(["default", "xala"])
	.describe("UI design system - default uses standard components, xala uses enhanced design system");
export type UISystem = z.infer<typeof UISystemSchema>;

/**
 * Compliance level schema for regulatory requirements
 */
export const ComplianceSchema = z
	.enum(["none", "gdpr", "norwegian"])
	.describe("Compliance level - none for basic, gdpr for EU compliance, norwegian for NSM + GDPR + WCAG");
export type Compliance = z.infer<typeof ComplianceSchema>;

/**
 * Supported language schema for internationalization
 */
export const LanguageSchema = z
	.enum(["en", "nb", "fr", "ar"])
	.describe("Supported languages - en (English), nb (Norwegian Bokmål), fr (French), ar (Arabic)");
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Authentication provider schema for identity management
 */
export const AuthProviderSchema = z
	.enum(["vipps", "bankid", "oauth", "email", "passwordless"])
	.describe("Authentication providers - vipps/bankid for Norwegian, oauth for social, email/passwordless for general");
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

/**
 * Integration service schema for external APIs
 */
export const IntegrationSchema = z
	.enum(["slack", "teams", "altinn", "vipps", "stripe"])
	.describe("Integration services - slack/teams for communication, altinn for Norwegian gov, vipps/stripe for payments");
export type Integration = z.infer<typeof IntegrationSchema>;

/**
 * Document service schema for document processing
 */
export const DocumentServiceSchema = z
	.enum(["pdf-export", "csv-import", "invoices", "reports"])
	.describe("Document services - pdf-export for reports, csv-import for data, invoices for billing, reports for analytics");
export type DocumentService = z.infer<typeof DocumentServiceSchema>;

/**
 * NSM (Norwegian Security Authority) classification schema
 */
export const NSMClassificationSchema = z
	.enum(["OPEN", "INTERNAL", "RESTRICTED", "CONFIDENTIAL"])
	.describe("NSM security classification - OPEN (public), INTERNAL (internal use), RESTRICTED (limited access), CONFIDENTIAL (classified)");
export type NSMClassification = z.infer<typeof NSMClassificationSchema>;

/**
 * WCAG accessibility level schema
 */
export const WCAGLevelSchema = z
	.enum(["A", "AA", "AAA"])
	.describe("WCAG accessibility compliance level - A (basic), AA (standard), AAA (enhanced)");
export type WCAGLevel = z.infer<typeof WCAGLevelSchema>;

// ============================================================================
// ENHANCED INPUT TYPES
// ============================================================================

export type CreateInput = {
	projectName?: string;
	yes?: boolean;
	database?: Database;
	orm?: ORM;
	auth?: boolean;
	frontend?: Frontend[];
	addons?: Addons[];
	examples?: Examples[];
	git?: boolean;
	packageManager?: PackageManager;
	install?: boolean;
	dbSetup?: DatabaseSetup;
	backend?: Backend;
	runtime?: Runtime;
	api?: API;
	webDeploy?: WebDeploy;
	
	// New enhanced options
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	primaryLocale?: Language;
	authProviders?: AuthProvider[];
	integrations?: Integration[];
	documents?: DocumentService[];
	mfa?: boolean;
	encryption?: boolean;
	audit?: boolean;
};

export type AddInput = {
	addons?: Addons[];
	webDeploy?: WebDeploy;
	projectDir?: string;
	install?: boolean;
	packageManager?: PackageManager;
	
	// New enhanced options for adding to existing projects
	ui?: UISystem;
	compliance?: Compliance;
	locales?: Language[];
	authProviders?: AuthProvider[];
	integrations?: Integration[];
	documents?: DocumentService[];
};

export type CLIInput = CreateInput & {
	projectDirectory?: string;
};

// ============================================================================
// ENHANCED PROJECT CONFIGURATION
// ============================================================================

export interface ProjectConfig {
	projectName: string;
	projectDir: string;
	relativePath: string;
	database: Database;
	orm: ORM;
	backend: Backend;
	runtime: Runtime;
	frontend: Frontend[];
	addons: Addons[];
	examples: Examples[];
	auth: boolean;
	git: boolean;
	packageManager: PackageManager;
	install: boolean;
	dbSetup: DatabaseSetup;
	api: API;
	webDeploy: WebDeploy;
	
	// Enhanced configuration
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	authProviders: AuthProvider[];
	integrations: Integration[];
	documents: DocumentService[];
	mfa: boolean;
	encryption: boolean;
	audit: boolean;
}

export interface BetterTStackConfig {
	version: string;
	createdAt: string;
	database: Database;
	orm: ORM;
	backend: Backend;
	runtime: Runtime;
	frontend: Frontend[];
	addons: Addons[];
	examples: Examples[];
	auth: boolean;
	packageManager: PackageManager;
	dbSetup: DatabaseSetup;
	api: API;
	webDeploy: WebDeploy;
	
	// Enhanced configuration
	ui: UISystem;
	compliance: Compliance;
	locales: Language[];
	primaryLocale: Language;
	authProviders: AuthProvider[];
	integrations: Integration[];
	documents: DocumentService[];
	mfa: boolean;
	encryption: boolean;
	audit: boolean;
}

export type AvailablePackageManagers = "npm" | "pnpm" | "bun";
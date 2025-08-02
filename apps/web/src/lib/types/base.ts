/**
 * Base types and interfaces for the Xaheen Stack Builder
 * Following SOLID principles with clear separation of concerns
 */

export interface TechOption {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly color: string;
	readonly default?: boolean;
	readonly className?: string;
}

export interface ProjectTypeConfig {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly color: string;
	readonly relevantCategories: readonly string[];
	readonly defaultSelections: Record<string, string | string[]>;
}

export interface PresetTemplate {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly projectType: string;
	readonly stack: Partial<StackState>;
	readonly examples?: readonly string[];
}

export interface StackState {
	projectName: string;
	webFrontend: string[];
	nativeFrontend: string[];
	runtime: string;
	backend: string;
	database: string;
	orm: string;
	dbSetup: string;
	auth: string;
	packageManager: string;
	uiSystem: string;
	compliance: string[];
	addons: string[];
	notifications: string;
	documents: string;
	payments: string;
	analytics: string;
	monitoring: string;
	messaging: string;
	testing: string;
	devops: string;
	search: string;
	caching: string;
	backgroundJobs: string;
	i18n: string;
	cms: string;
	security: string;
	saasAdmin: string;
	subscriptions: string;
	licensing: string;
	rbac: string;
	multiTenancy: string;
	examples: string[];
	git: string;
	install: string;
	api: string;
	webDeploy: string;
}

// Readonly version for immutable operations
export type ReadonlyStackState = Readonly<StackState> & {
	readonly webFrontend: readonly string[];
	readonly nativeFrontend: readonly string[];
	readonly compliance: readonly string[];
	readonly addons: readonly string[];
	readonly examples: readonly string[];
}

export type TechCategory = keyof Pick<StackState, 
	| 'webFrontend'
	| 'nativeFrontend' 
	| 'runtime'
	| 'backend'
	| 'database'
	| 'orm'
	| 'dbSetup'
	| 'auth'
	| 'packageManager'
	| 'uiSystem'
	| 'compliance'
	| 'addons'
	| 'notifications'
	| 'documents'
	| 'payments'
	| 'analytics'
	| 'monitoring'
	| 'messaging'
	| 'testing'
	| 'devops'
	| 'search'
	| 'caching'
	| 'backgroundJobs'
	| 'i18n'
	| 'cms'
	| 'security'
	| 'saasAdmin'
	| 'subscriptions'
	| 'licensing'
	| 'rbac'
	| 'multiTenancy'
	| 'examples'
	| 'git'
	| 'install'
	| 'api'
	| 'webDeploy'
>;

export type ProjectType = 
	| "landing-page"
	| "ecommerce"
	| "blog"
	| "portfolio"
	| "dashboard"
	| "api-backend"
	| "saas-multi-tenant"
	| "saas-single-tenant"
	| "saas-enterprise"
	| "b2b-platform"
	| "b2c-app"
	| "marketplace";

export interface CompatibilityResult {
	adjustedStack: StackState | null;
	notes: Record<string, {
		notes: string[];
		hasIssue: boolean;
	}>;
	changes: Array<{
		category: string;
		message: string;
	}>;
}

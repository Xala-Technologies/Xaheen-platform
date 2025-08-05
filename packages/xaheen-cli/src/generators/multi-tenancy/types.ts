export interface MultiTenantOptions {
	name: string;
	isolationLevel: "database" | "schema" | "row-level" | "hybrid";
	database: "postgresql" | "mysql" | "mongodb";
	backend: "nestjs" | "express" | "fastify";
	authentication: "jwt" | "oauth" | "bankid" | "firebase";
	features: MultiTenantFeature[];
	tenantDiscovery: "subdomain" | "path" | "header" | "custom";
	caching: "redis" | "memcached" | "memory" | "none";
	monitoring: boolean;
	compliance: ComplianceFeature[];
}

export interface SingleTenantOptions {
	name: string;
	tenantId: string;
	database: "postgresql" | "mysql" | "mongodb";
	backend: "nestjs" | "express" | "fastify";
	infrastructure: "kubernetes" | "docker" | "serverless";
	features: SingleTenantFeature[];
	customization: TenantCustomization;
	backup: BackupStrategy;
	monitoring: boolean;
}

export interface TenantIsolationOptions {
	isolationLevel: "database" | "schema" | "row-level" | "hybrid";
	encryptionAtRest: boolean;
	encryptionInTransit: boolean;
	auditLogging: boolean;
	dataResidency: string[];
	complianceStandards: string[];
}

export interface TenantAuthenticationOptions {
	name: string;
	provider: "jwt" | "oauth" | "saml" | "oidc" | "bankid";
	multiFactorAuth: boolean;
	sessionManagement: "stateless" | "stateful" | "hybrid";
	tokenExpiration: number;
	refreshTokens: boolean;
	singleSignOn: boolean;
	federatedIdentity: boolean;
}

export type MultiTenantFeature =
	| "tenant-isolation"
	| "cross-tenant-analytics"
	| "shared-resources"
	| "tenant-specific-config"
	| "bulk-operations"
	| "tenant-migration"
	| "resource-quotas"
	| "multi-region";

export type SingleTenantFeature =
	| "dedicated-infrastructure"
	| "custom-domain"
	| "private-cloud"
	| "enhanced-security"
	| "compliance-reporting"
	| "data-sovereignty"
	| "custom-integrations"
	| "priority-support";

export type ComplianceFeature =
	| "gdpr"
	| "hipaa"
	| "sox"
	| "pci-dss"
	| "iso27001"
	| "nsm"
	| "fedramp"
	| "fisma";

export interface TenantCustomization {
	branding: boolean;
	themes: boolean;
	features: boolean;
	integrations: boolean;
	workflows: boolean;
}

export interface BackupStrategy {
	frequency: "hourly" | "daily" | "weekly";
	retention: number;
	encryption: boolean;
	crossRegion: boolean;
	pointInTime: boolean;
}

export interface GenerationResult {
	files: string[];
	commands: string[];
	nextSteps: string[];
	warnings?: string[];
}

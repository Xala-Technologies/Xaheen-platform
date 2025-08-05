/**
 * @fileoverview Enterprise Authentication Types - EPIC 15 Story 15.2
 * @description Comprehensive type definitions for enterprise SSO & authentication
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, Enterprise Security
 */

import { z } from "zod";

// Norwegian NSM Security Classifications
export enum NSMClassification {
	OPEN = "OPEN",
	RESTRICTED = "RESTRICTED", 
	CONFIDENTIAL = "CONFIDENTIAL",
	SECRET = "SECRET"
}

// Authentication Methods
export enum AuthenticationMethod {
	SAML2 = "SAML2",
	OAUTH2 = "OAUTH2",
	OIDC = "OIDC",
	LDAP = "LDAP",
	AD = "ACTIVE_DIRECTORY",
	MFA = "MULTI_FACTOR",
	FIDO2 = "FIDO2"
}

// MFA Types
export enum MFAType {
	TOTP = "TOTP",
	SMS = "SMS", 
	EMAIL = "EMAIL",
	BACKUP_CODES = "BACKUP_CODES",
	FIDO2 = "FIDO2",
	WEBAUTHN = "WEBAUTHN",
	HARDWARE_TOKEN = "HARDWARE_TOKEN"
}

// Permission Types for RBAC
export enum Permission {
	// CLI Operations
	CLI_GENERATE = "cli:generate",
	CLI_CREATE = "cli:create",
	CLI_DEPLOY = "cli:deploy",
	CLI_ADMIN = "cli:admin",
	
	// Project Management
	PROJECT_READ = "project:read",
	PROJECT_WRITE = "project:write",
	PROJECT_DELETE = "project:delete",
	PROJECT_ADMIN = "project:admin",
	
	// Template Management
	TEMPLATE_READ = "template:read",
	TEMPLATE_WRITE = "template:write",
	TEMPLATE_PUBLISH = "template:publish",
	TEMPLATE_ADMIN = "template:admin",
	
	// Security Operations
	SECURITY_SCAN = "security:scan",
	SECURITY_AUDIT = "security:audit",
	SECURITY_ADMIN = "security:admin",
	
	// Compliance
	COMPLIANCE_VIEW = "compliance:view",
	COMPLIANCE_MANAGE = "compliance:manage",
	COMPLIANCE_ADMIN = "compliance:admin",
	
	// System Administration
	SYSTEM_MONITOR = "system:monitor",
	SYSTEM_CONFIG = "system:config",
	SYSTEM_ADMIN = "system:admin"
}

// SAML 2.0 Configuration Schema
export const SAML2ConfigSchema = z.object({
	enabled: z.boolean().default(false),
	entityId: z.string().min(1, "Entity ID is required"),
	ssoUrl: z.string().url("Invalid SSO URL"),
	sloUrl: z.string().url("Invalid SLO URL").optional(),
	x509Certificate: z.string().min(1, "X.509 certificate is required"),
	privateKey: z.string().optional(),
	signRequests: z.boolean().default(true), 
	encryptAssertions: z.boolean().default(true),
	signatureAlgorithm: z.enum([
		"http://www.w3.org/2000/09/xmldsig#rsa-sha1",
		"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
		"http://www.w3.org/2001/04/xmldsig-more#rsa-sha512"
	]).default("http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"),
	digestAlgorithm: z.enum([
		"http://www.w3.org/2000/09/xmldsig#sha1",
		"http://www.w3.org/2001/04/xmlenc#sha256",
		"http://www.w3.org/2001/04/xmlenc#sha512"
	]).default("http://www.w3.org/2001/04/xmlenc#sha256"),
	nameIdFormat: z.enum([
		"urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
		"urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
		"urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
	]).default("urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"),
	attributeMapping: z.record(z.string()).default({
		email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
		firstName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
		lastName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
		roles: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
	}),
	identityProviders: z.array(z.object({
		name: z.string().min(1),
		entityId: z.string().min(1),
		ssoUrl: z.string().url(),
		x509Certificate: z.string().min(1),
		enabled: z.boolean().default(true)
	})).default([])
});

// OAuth2/OIDC Configuration Schema
export const OAuth2ConfigSchema = z.object({
	enabled: z.boolean().default(false),
	clientId: z.string().min(1, "Client ID is required"),
	clientSecret: z.string().min(1, "Client secret is required"),
	authorizationUrl: z.string().url("Invalid authorization URL"),
	tokenUrl: z.string().url("Invalid token URL"),
	userInfoUrl: z.string().url("Invalid user info URL"),
	jwksUrl: z.string().url("Invalid JWKS URL").optional(),
	issuer: z.string().url("Invalid issuer URL").optional(),
	scope: z.array(z.string()).default(["openid", "profile", "email"]),
	responseType: z.enum(["code", "token", "id_token"]).default("code"),
	grantType: z.enum([
		"authorization_code",
		"implicit", 
		"client_credentials",
		"refresh_token"
	]).default("authorization_code"),
	pkceEnabled: z.boolean().default(true),
	pkceMethod: z.enum(["S256", "plain"]).default("S256"),
	refreshTokenEnabled: z.boolean().default(true),
	refreshTokenLifetime: z.number().int().min(3600).default(2592000), // 30 days
	accessTokenLifetime: z.number().int().min(300).default(3600), // 1 hour
	idTokenLifetime: z.number().int().min(300).default(3600), // 1 hour
	clockSkew: z.number().int().min(0).default(300) // 5 minutes
});

// MFA Configuration Schema
export const MFAConfigSchema = z.object({
	enabled: z.boolean().default(false),
	required: z.boolean().default(false),
	methods: z.array(z.nativeEnum(MFAType)).default([MFAType.TOTP]),
	totpConfig: z.object({
		issuer: z.string().default("Xaheen CLI"),
		algorithm: z.enum(["SHA1", "SHA256", "SHA512"]).default("SHA1"),
		digits: z.enum([6, 8]).default(6),
		period: z.number().int().min(15).max(300).default(30),
		window: z.number().int().min(0).max(10).default(1)
	}).default({}),
	smsConfig: z.object({
		provider: z.enum(["twilio", "aws_sns", "custom"]).default("twilio"),
		from: z.string().optional(),
		apiKey: z.string().optional(),
		apiSecret: z.string().optional()
	}).default({}),
	emailConfig: z.object({
		provider: z.enum(["sendgrid", "aws_ses", "smtp", "custom"]).default("smtp"),
		from: z.string().email().optional(),
		smtpHost: z.string().optional(),
		smtpPort: z.number().int().min(1).max(65535).optional(),
		smtpSecure: z.boolean().default(true)
	}).default({}),
	backupCodesConfig: z.object({
		count: z.number().int().min(5).max(20).default(10),
		length: z.number().int().min(6).max(12).default(8),
		algorithm: z.enum(["random", "sequential"]).default("random")
	}).default({}),
	fido2Config: z.object({
		rpId: z.string().min(1).default("localhost"),
		rpName: z.string().min(1).default("Xaheen CLI"),
		timeout: z.number().int().min(30000).max(300000).default(60000),
		attestation: z.enum(["none", "indirect", "direct"]).default("none"),
		userVerification: z.enum(["required", "preferred", "discouraged"]).default("preferred"),
		authenticatorSelection: z.object({
			authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
			requireResidentKey: z.boolean().default(false),
			userVerification: z.enum(["required", "preferred", "discouraged"]).default("preferred")
		}).default({})
	}).default({})
});

// Role Configuration Schema
export const RoleConfigSchema = z.object({
	name: z.string().min(1, "Role name is required"),
	description: z.string().optional(),
	permissions: z.array(z.nativeEnum(Permission)).default([]),
	inheritsFrom: z.array(z.string()).default([]),
	nsmClassification: z.nativeEnum(NSMClassification).default(NSMClassification.OPEN),
	isSystemRole: z.boolean().default(false),
	isActive: z.boolean().default(true),
	metadata: z.record(z.any()).default({})
});

// User Schema  
export const UserSchema = z.object({
	id: z.string().min(1),
	email: z.string().email(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	roles: z.array(z.string()).default([]),
	permissions: z.array(z.nativeEnum(Permission)).default([]),
	nsmClearance: z.nativeEnum(NSMClassification).default(NSMClassification.OPEN),
	mfaEnabled: z.boolean().default(false),
	mfaMethods: z.array(z.nativeEnum(MFAType)).default([]),
	lastLogin: z.date().optional(),
	isActive: z.boolean().default(true),
	metadata: z.record(z.any()).default({})
});

// Session Configuration Schema
export const SessionConfigSchema = z.object({
	enabled: z.boolean().default(true),
	tokenStorage: z.enum(["memory", "file", "database", "redis"]).default("file"),
	encryptionKey: z.string().min(32, "Encryption key must be at least 32 characters"),
	tokenLifetime: z.number().int().min(300).default(28800), // 8 hours
	refreshTokenLifetime: z.number().int().min(3600).default(2592000), // 30 days
	idleTimeout: z.number().int().min(300).default(3600), // 1 hour
	maxConcurrentSessions: z.number().int().min(1).default(5),
	enableSecureStorage: z.boolean().default(true),
	enableTokenRotation: z.boolean().default(true),
	tokenRotationInterval: z.number().int().min(300).default(1800), // 30 minutes
	enableSessionFingerprinting: z.boolean().default(true),
	requireSecureCookies: z.boolean().default(true),
	sameSitePolicy: z.enum(["strict", "lax", "none"]).default("strict")
});

// Audit Configuration Schema
export const AuditConfigSchema = z.object({
	enabled: z.boolean().default(true),
	logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
	logPath: z.string().optional(),
	maxLogSize: z.number().int().min(1048576).default(104857600), // 100MB
	maxLogFiles: z.number().int().min(1).default(10),
	logFormat: z.enum(["json", "text"]).default("json"),
	includeStackTrace: z.boolean().default(false),
	sensitiveFields: z.array(z.string()).default([
		"password", "secret", "token", "key", "credential"
	]),
	retentionPeriod: z.number().int().min(30).default(365), // days
	enableRealTimeAlerts: z.boolean().default(true),
	alertThreshold: z.number().int().min(1).default(5), // failed attempts
	alertWindow: z.number().int().min(60).default(300) // 5 minutes
});

// Main Enterprise Authentication Configuration Schema
export const EnterpriseAuthConfigSchema = z.object({
	version: z.string().default("1.0.0"),
	enabled: z.boolean().default(true),
	defaultMethod: z.nativeEnum(AuthenticationMethod).default(AuthenticationMethod.OAUTH2),
	saml2: SAML2ConfigSchema.default({}),
	oauth2: OAuth2ConfigSchema.default({}),
	mfa: MFAConfigSchema.default({}),
	roles: z.array(RoleConfigSchema).default([]),
	session: SessionConfigSchema,
	audit: AuditConfigSchema.default({}),
	norwegianCompliance: z.object({
		enableGDPRCompliance: z.boolean().default(true),
		enableNSMCompliance: z.boolean().default(true),
		dataProcessingBasis: z.enum([
			"consent", "contract", "legal_obligation", 
			"vital_interests", "public_task", "legitimate_interests"
		]).default("legitimate_interests"),
		dataRetentionPeriod: z.number().int().min(30).default(365),
		enableDataMinimization: z.boolean().default(true),
		enableRightToErasure: z.boolean().default(true),
		enablePortability: z.boolean().default(true),
		dataProtectionOfficer: z.string().email().optional(),
		privacyNoticeUrl: z.string().url().optional()
	}).default({}),
	metadata: z.object({
		createdAt: z.date().default(() => new Date()),
		updatedAt: z.date().default(() => new Date()),
		createdBy: z.string().default("xaheen-cli"),
		version: z.string().default("1.0.0")
	}).default({})
});

// Type definitions
export type SAML2Config = z.infer<typeof SAML2ConfigSchema>;
export type OAuth2Config = z.infer<typeof OAuth2ConfigSchema>;
export type MFAConfig = z.infer<typeof MFAConfigSchema>;
export type RoleConfig = z.infer<typeof RoleConfigSchema>;
export type User = z.infer<typeof UserSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type AuditConfig = z.infer<typeof AuditConfigSchema>;
export type EnterpriseAuthConfig = z.infer<typeof EnterpriseAuthConfigSchema>;

// Authentication Events
export interface AuthenticationEvent {
	readonly eventId: string;
	readonly timestamp: Date;
	readonly eventType: AuthEventType;
	readonly userId?: string;
	readonly sessionId?: string;
	readonly ipAddress: string;
	readonly userAgent: string;
	readonly method: AuthenticationMethod;
	readonly success: boolean;
	readonly failureReason?: string;
	readonly metadata: Record<string, any>;
	readonly nsmClassification: NSMClassification;
}

export enum AuthEventType {
	LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
	LOGIN_SUCCESS = "LOGIN_SUCCESS", 
	LOGIN_FAILURE = "LOGIN_FAILURE",
	LOGOUT = "LOGOUT",
	SESSION_CREATED = "SESSION_CREATED",
	SESSION_EXPIRED = "SESSION_EXPIRED",
	SESSION_INVALIDATED = "SESSION_INVALIDATED",
	MFA_CHALLENGE = "MFA_CHALLENGE",
	MFA_SUCCESS = "MFA_SUCCESS",
	MFA_FAILURE = "MFA_FAILURE",
	PERMISSION_DENIED = "PERMISSION_DENIED",
	PASSWORD_RESET = "PASSWORD_RESET",
	ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
	SECURITY_ALERT = "SECURITY_ALERT"
}

// Token Types
export interface JWTToken {
	readonly accessToken: string;
	readonly refreshToken?: string;
	readonly idToken?: string;
	readonly tokenType: string;
	readonly expiresIn: number;
	readonly scope?: string[];
	readonly issuedAt: number;
	readonly issuer: string;
	readonly audience: string;
	readonly subject: string;
}

export interface SessionToken {
	readonly sessionId: string;
	readonly userId: string;
	readonly deviceId: string;
	readonly ipAddress: string;
	readonly userAgent: string;
	readonly createdAt: Date;
	readonly expiresAt: Date;
	readonly lastActivity: Date;
	readonly isActive: boolean;
	readonly permissions: Permission[];
	readonly nsmClearance: NSMClassification;
	readonly metadata: Record<string, any>;
}

// Error Types
export class AuthenticationError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 401,
		public readonly details?: Record<string, any>
	) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export class AuthorizationError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 403,
		public readonly requiredPermission?: Permission,
		public readonly userPermissions?: Permission[]
	) {
		super(message);
		this.name = "AuthorizationError";
	}
}

export class MFAError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly mfaMethod: MFAType,
		public readonly statusCode: number = 401
	) {
		super(message);
		this.name = "MFAError";
	}
}

// Service Interfaces
export interface IAuthenticationProvider {
	authenticate(credentials: any): Promise<User>;
	validateToken(token: string): Promise<boolean>;
	refreshToken(refreshToken: string): Promise<JWTToken>;
	logout(sessionId: string): Promise<void>;
}

export interface IMFAProvider {
	generateSecret(user: User): Promise<string>;
	validateCode(user: User, code: string, method: MFAType): Promise<boolean>;
	sendChallenge(user: User, method: MFAType): Promise<void>;
	generateBackupCodes(user: User): Promise<string[]>;
}

export interface IRBACProvider {
	checkPermission(user: User, permission: Permission): Promise<boolean>;
	getUserRoles(userId: string): Promise<RoleConfig[]>;
	getUserPermissions(userId: string): Promise<Permission[]>;
	assignRole(userId: string, roleName: string): Promise<void>;
	revokeRole(userId: string, roleName: string): Promise<void>;
}

export interface ISessionManager {
	createSession(user: User, deviceInfo: any): Promise<SessionToken>;
	validateSession(sessionId: string): Promise<SessionToken | null>;
	refreshSession(sessionId: string): Promise<SessionToken>;
	invalidateSession(sessionId: string): Promise<void>;
	invalidateAllSessions(userId: string): Promise<void>;
	getUserSessions(userId: string): Promise<SessionToken[]>;
}

export interface IAuditLogger {
	logEvent(event: AuthenticationEvent): Promise<void>;
	getEvents(filters: any): Promise<AuthenticationEvent[]>;
	generateReport(filters: any): Promise<any>;
}
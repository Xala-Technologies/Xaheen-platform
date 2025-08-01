import type { BaseEntity, Email, UUID } from "../common";

/**
 * User roles
 */
export enum UserRole {
	SUPER_ADMIN = "super_admin",
	ADMIN = "admin",
	USER = "user",
	GUEST = "guest",
}

/**
 * Authentication providers
 */
export enum AuthProvider {
	EMAIL = "email",
	GOOGLE = "google",
	GITHUB = "github",
	MICROSOFT = "microsoft",
	BANKID = "bankid",
	IDPORTEN = "idporten",
}

/**
 * User entity
 */
export interface User extends BaseEntity {
	email: Email;
	emailVerified?: Date | null;
	name?: string | null;
	image?: string | null;
	role: UserRole;
	active: boolean;
	lastLoginAt?: Date | null;
	metadata?: Record<string, any>;
}

/**
 * Account entity (for OAuth providers)
 */
export interface Account extends BaseEntity {
	userId: UUID;
	type: "oauth" | "oidc" | "email";
	provider: string;
	providerAccountId: string;
	refreshToken?: string | null;
	accessToken?: string | null;
	expiresAt?: number | null;
	tokenType?: string | null;
	scope?: string | null;
	idToken?: string | null;
	sessionState?: string | null;
}

/**
 * Session entity
 */
export interface Session extends BaseEntity {
	sessionToken: string;
	userId: UUID;
	expires: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
}

/**
 * Verification token
 */
export interface VerificationToken {
	identifier: string;
	token: string;
	expires: Date;
}

/**
 * JWT token payload
 */
export interface JWTPayload {
	sub: UUID; // Subject (user ID)
	email: Email;
	role: UserRole;
	iat: number; // Issued at
	exp: number; // Expiration
	jti?: string; // JWT ID
	iss?: string; // Issuer
	aud?: string | string[]; // Audience
}

/**
 * Authentication credentials
 */
export interface Credentials {
	email: Email;
	password: string;
}

/**
 * OAuth state
 */
export interface OAuthState {
	provider: AuthProvider;
	returnUrl?: string;
	state: string;
	codeVerifier?: string;
	nonce?: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
	user: User;
	accessToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: "Bearer";
}

/**
 * Permission system
 */
export interface Permission {
	id: UUID;
	name: string;
	resource: string;
	action: string;
	description?: string;
}

export interface RolePermission {
	roleId: UUID;
	permissionId: UUID;
	grantedAt: Date;
	grantedBy: UUID;
}

/**
 * Multi-factor authentication
 */
export interface MFAMethod {
	id: UUID;
	userId: UUID;
	type: "totp" | "sms" | "email" | "backup_codes";
	verified: boolean;
	secret?: string;
	phoneNumber?: string;
	email?: Email;
	lastUsedAt?: Date;
}

export interface MFAChallenge {
	challengeId: string;
	userId: UUID;
	method: MFAMethod;
	expiresAt: Date;
	attempts: number;
}

/**
 * Password reset
 */
export interface PasswordResetToken {
	id: UUID;
	userId: UUID;
	token: string;
	expiresAt: Date;
	usedAt?: Date | null;
}

/**
 * API keys
 */
export interface ApiKey {
	id: UUID;
	userId: UUID;
	name: string;
	key: string;
	hashedKey: string;
	permissions: string[];
	expiresAt?: Date | null;
	lastUsedAt?: Date | null;
	createdAt: Date;
}

/**
 * Norwegian specific auth types
 */
export interface BankIDAuthResult {
	personalNumber: string;
	name: string;
	givenName: string;
	surname: string;
	serialNumber: string;
	certifiedName: string;
	uniqueId: string;
}

export interface IDPortenAuthResult {
	sub: string;
	pid: string; // Personal identification number
	amr: string[]; // Authentication methods
	acr: string; // Authentication context
	locale: string;
}

/**
 * Security events
 */
export interface SecurityEvent {
	id: UUID;
	userId: UUID;
	type: SecurityEventType;
	ipAddress?: string;
	userAgent?: string;
	location?: string;
	metadata?: Record<string, any>;
	timestamp: Date;
}

export enum SecurityEventType {
	LOGIN_SUCCESS = "login_success",
	LOGIN_FAILED = "login_failed",
	LOGOUT = "logout",
	PASSWORD_CHANGED = "password_changed",
	PASSWORD_RESET = "password_reset",
	MFA_ENABLED = "mfa_enabled",
	MFA_DISABLED = "mfa_disabled",
	ACCOUNT_LOCKED = "account_locked",
	ACCOUNT_UNLOCKED = "account_unlocked",
	SUSPICIOUS_ACTIVITY = "suspicious_activity",
}

/**
 * Rate limiting
 */
export interface RateLimitInfo {
	key: string;
	points: number;
	maxPoints: number;
	windowMs: number;
	resetAt: Date;
}
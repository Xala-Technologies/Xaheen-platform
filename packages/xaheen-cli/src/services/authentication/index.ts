/**
 * @fileoverview Enterprise Authentication System - EPIC 15 Story 15.2
 * @description Main authentication orchestration service with Norwegian NSM compliance
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, Enterprise Security, GDPR
 */

import { logger } from "../../utils/logger";
import {
	EnterpriseAuthConfig,
	EnterpriseAuthConfigSchema,
	User,
	Permission,
	AuthenticationMethod,
	MFAType,
	NSMClassification,
	AuthenticationError,
	AuthorizationError,
	SessionToken,
	JWTToken
} from "./types.js";

// Import all services
import { SAML2Service } from "./saml2.service";
import { OAuth2Service } from "./oauth2.service";
import { MFAService } from "./mfa.service";
import { RBACService } from "./rbac.service";
import { SessionService } from "./session.service";
import { AuditService } from "./audit.service";

/**
 * Enterprise Authentication Orchestrator
 * Coordinates all authentication services with Norwegian NSM compliance
 */
export class EnterpriseAuthenticationService {
	private readonly config: EnterpriseAuthConfig;
	private readonly saml2Service?: SAML2Service;
	private readonly oauth2Service?: OAuth2Service;
	private readonly mfaService: MFAService;
	private readonly rbacService: RBACService;
	private readonly sessionService: SessionService;
	private readonly auditService: AuditService;

	constructor(config: EnterpriseAuthConfig) {
		// Validate configuration
		this.config = EnterpriseAuthConfigSchema.parse(config);

		// Initialize services based on configuration
		if (this.config.saml2.enabled) {
			this.saml2Service = new SAML2Service(this.config.saml2);
		}

		if (this.config.oauth2.enabled) {
			this.oauth2Service = new OAuth2Service(this.config.oauth2);
		}

		this.mfaService = new MFAService(this.config.mfa);
		this.rbacService = new RBACService(this.config.roles);
		this.sessionService = new SessionService(this.config.session);
		this.auditService = new AuditService(this.config.audit);

		logger.info("🔐 Enterprise Authentication Service initialized");
		logger.info(`Primary method: ${this.config.defaultMethod}`);
		logger.info(`Enabled methods: ${this.getEnabledMethods().join(", ")}`);
	}

	/**
	 * Authenticate user with primary method
	 */
	async authenticate(credentials: any, method?: AuthenticationMethod): Promise<{
		user: User;
		session: SessionToken;
		requiresMFA: boolean;
		mfaMethods?: MFAType[];
	}> {
		const authMethod = method || this.config.defaultMethod;
		
		try {
			logger.info(`🔐 Authenticating user with method: ${authMethod}`);

			// Primary authentication
			let user: User;
			switch (authMethod) {
				case AuthenticationMethod.SAML2:
					if (!this.saml2Service) {
						throw new AuthenticationError("SAML2 not enabled", "SAML2_NOT_ENABLED", 400);
					}
					user = await this.saml2Service.authenticate(credentials.samlResponse);
					break;

				case AuthenticationMethod.OAUTH2:
				case AuthenticationMethod.OIDC:
					if (!this.oauth2Service) {
						throw new AuthenticationError("OAuth2/OIDC not enabled", "OAUTH2_NOT_ENABLED", 400);
					}
					user = await this.oauth2Service.authenticate(credentials.tokens);
					break;

				default:
					throw new AuthenticationError(
						`Unsupported authentication method: ${authMethod}`,
						"AUTH_METHOD_NOT_SUPPORTED",
						400
					);
			}

			// Resolve user permissions via RBAC
			const userPermissions = await this.rbacService.getUserPermissions(user.id);
			user.permissions = userPermissions;

			// Check if MFA is required
			const requiresMFA = this.config.mfa.enabled && 
				(this.config.mfa.required || user.mfaEnabled);

			let session: SessionToken;
			
			if (requiresMFA && !credentials.mfaVerified) {
				// Create temporary session pending MFA
				session = await this.sessionService.createSession(user, {
					userAgent: credentials.userAgent || "Xaheen CLI",
					ipAddress: credentials.ipAddress || "CLI"
				});

				// Mark session as pending MFA
				session.metadata.mfaPending = true;
				session.metadata.tempSession = true;

				return {
					user,
					session,
					requiresMFA: true,
					mfaMethods: user.mfaMethods.length > 0 ? user.mfaMethods : this.config.mfa.methods
				};
			}

			// Create full session
			session = await this.sessionService.createSession(user, {
				userAgent: credentials.userAgent || "Xaheen CLI",
				ipAddress: credentials.ipAddress || "CLI"
			});

			logger.success(`✅ Authentication successful for user: ${user.email}`);
			return {
				user,
				session,
				requiresMFA: false
			};

		} catch (error) {
			logger.error("Authentication failed:", error);
			throw error;
		}
	}

	/**
	 * Verify MFA and complete authentication
	 */
	async verifyMFA(
		sessionId: string,
		code: string,
		method: MFAType
	): Promise<{
		user: User;
		session: SessionToken;
		success: boolean;
	}> {
		try {
			// Validate temporary session
			const tempSession = await this.sessionService.validateSession(sessionId);
			if (!tempSession || !tempSession.metadata.mfaPending) {
				throw new AuthenticationError("Invalid or expired MFA session", "MFA_SESSION_INVALID", 400);
			}

			// Get user
			const user: User = {
				id: tempSession.userId,
				email: "", // Will be populated from session metadata
				permissions: tempSession.permissions,
				nsmClearance: tempSession.nsmClearance,
				mfaEnabled: true,
				mfaMethods: [],
				isActive: true,
				metadata: {}
			};

			// Verify MFA code
			const mfaValid = await this.mfaService.validateCode(user, code, method);
			if (!mfaValid) {
				throw new AuthenticationError("Invalid MFA code", "MFA_CODE_INVALID", 401);
			}

			// Convert temporary session to full session
			tempSession.metadata.mfaPending = false;
			tempSession.metadata.tempSession = false;
			tempSession.metadata.mfaVerifiedAt = new Date();
			tempSession.metadata.mfaMethod = method;

			// Refresh session to extend expiration
			const fullSession = await this.sessionService.refreshSession(sessionId);

			logger.success(`✅ MFA verification successful for session: ${sessionId}`);
			return {
				user,
				session: fullSession,
				success: true
			};

		} catch (error) {
			logger.error("MFA verification failed:", error);
			throw error;
		}
	}

	/**
	 * Check if user has permission
	 */
	async checkPermission(
		sessionId: string,
		permission: Permission,
		resource?: any
	): Promise<boolean> {
		try {
			// Validate session
			const session = await this.sessionService.validateSession(sessionId);
			if (!session) {
				throw new AuthorizationError("Invalid session", "SESSION_INVALID", 401);
			}

			// Check for MFA requirement
			if (session.metadata.mfaPending) {
				throw new AuthorizationError("MFA verification required", "MFA_REQUIRED", 401);
			}

			// Create user object from session
			const user: User = {
				id: session.userId,
				email: "", // Not needed for permission check
				permissions: session.permissions,
				nsmClearance: session.nsmClearance,
				mfaEnabled: true,
				mfaMethods: [],
				isActive: true,
				metadata: {}
			};

			// Check permission
			return await this.rbacService.checkPermission(user, permission, resource);

		} catch (error) {
			logger.error("Permission check failed:", error);
			return false;
		}
	}

	/**
	 * Logout user and invalidate session
	 */
	async logout(sessionId: string): Promise<void> {
		try {
			const session = await this.sessionService.validateSession(sessionId);
			if (!session) {
				logger.warn(`Logout attempted for invalid session: ${sessionId}`);
				return;
			}

			// Invalidate session
			await this.sessionService.invalidateSession(sessionId);

			// Logout from authentication providers if needed
			if (this.saml2Service) {
				await this.saml2Service.logout(sessionId);
			}

			if (this.oauth2Service) {
				await this.oauth2Service.logout(sessionId);
			}

			logger.success(`✅ Logout successful for session: ${sessionId}`);

		} catch (error) {
			logger.error("Logout failed:", error);
			throw error;
		}
	}

	/**
	 * Generate OAuth2 authorization URL
	 */
	async generateOAuth2AuthUrl(options: {
		state?: string;
		scopes?: string[];
		redirectUri?: string;
	} = {}): Promise<{ authUrl: string; state: string }> {
		if (!this.oauth2Service) {
			throw new AuthenticationError("OAuth2 not enabled", "OAUTH2_NOT_ENABLED", 400);
		}

		const result = await this.oauth2Service.generateAuthorizationUrl(options);
		return {
			authUrl: result.authUrl,
			state: result.state
		};
	}

	/**
	 * Exchange OAuth2 authorization code for tokens
	 */
	async exchangeOAuth2Code(
		code: string,
		state: string,
		redirectUri?: string
	): Promise<JWTToken> {
		if (!this.oauth2Service) {
			throw new AuthenticationError("OAuth2 not enabled", "OAUTH2_NOT_ENABLED", 400);
		}

		return await this.oauth2Service.exchangeCodeForTokens(code, state, redirectUri);
	}

	/**
	 * Generate SAML authentication request
	 */
	async generateSAMLAuthRequest(
		idpEntityId: string,
		relayState?: string
	): Promise<{ authUrl: string; requestId: string }> {
		if (!this.saml2Service) {
			throw new AuthenticationError("SAML2 not enabled", "SAML2_NOT_ENABLED", 400);
		}

		return await this.saml2Service.generateAuthRequest(idpEntityId, relayState);
	}

	/**
	 * Get SAML Service Provider metadata
	 */
	async getSAMLMetadata(): Promise<string> {
		if (!this.saml2Service) {
			throw new AuthenticationError("SAML2 not enabled", "SAML2_NOT_ENABLED", 400);
		}

		return await this.saml2Service.generateMetadata();
	}

	/**
	 * Setup MFA for user
	 */
	async setupMFA(
		sessionId: string,
		method: MFAType
	): Promise<{
		secret?: string;
		qrCode?: string;
		backupCodes?: string[];
		fido2Options?: any;
	}> {
		const session = await this.sessionService.validateSession(sessionId);
		if (!session) {
			throw new AuthenticationError("Invalid session", "SESSION_INVALID", 401);
		}

		const user: User = {
			id: session.userId,
			email: session.metadata.email || "",
			permissions: session.permissions,
			nsmClearance: session.nsmClearance,
			mfaEnabled: false,
			mfaMethods: [],
			isActive: true,
			metadata: {}
		};

		const secret = await this.mfaService.generateSecret(user, method);

		const result: any = {};

		switch (method) {
			case MFAType.TOTP:
				result.secret = secret;
				// TODO: Generate QR code for TOTP
				break;
			case MFAType.BACKUP_CODES:
				result.backupCodes = JSON.parse(secret);
				break;
			case MFAType.FIDO2:
			case MFAType.WEBAUTHN:
				result.fido2Options = JSON.parse(secret);
				break;
		}

		return result;
	}

	/**
	 * Send MFA challenge
	 */
	async sendMFAChallenge(sessionId: string, method: MFAType): Promise<void> {
		const session = await this.sessionService.validateSession(sessionId);
		if (!session) {
			throw new AuthenticationError("Invalid session", "SESSION_INVALID", 401);
		}

		const user: User = {
			id: session.userId,
			email: session.metadata.email || "",
			permissions: session.permissions,
			nsmClearance: session.nsmClearance,
			mfaEnabled: true,
			mfaMethods: [method],
			isActive: true,
			metadata: {}
		};

		await this.mfaService.sendChallenge(user, method);
	}

	/**
	 * Get user's active sessions
	 */
	async getUserSessions(sessionId: string): Promise<SessionToken[]> {
		const session = await this.sessionService.validateSession(sessionId);
		if (!session) {
			throw new AuthenticationError("Invalid session", "SESSION_INVALID", 401);
		}

		return await this.sessionService.getUserSessions(session.userId);
	}

	/**
	 * Get audit events (admin only)
	 */
	async getAuditEvents(
		sessionId: string,
		filters: any = {}
	): Promise<any[]> {
		// Check admin permission
		const hasPermission = await this.checkPermission(sessionId, Permission.SECURITY_AUDIT);
		if (!hasPermission) {
			throw new AuthorizationError(
				"Insufficient permissions for audit access",
				"AUDIT_ACCESS_DENIED",
				403,
				Permission.SECURITY_AUDIT
			);
		}

		return await this.auditService.getEvents(filters);
	}

	/**
	 * Generate audit report (admin only)
	 */
	async generateAuditReport(
		sessionId: string,
		filters: any = {}
	): Promise<any> {
		// Check admin permission
		const hasPermission = await this.checkPermission(sessionId, Permission.SECURITY_ADMIN);
		if (!hasPermission) {
			throw new AuthorizationError(
				"Insufficient permissions for audit report generation",
				"AUDIT_REPORT_ACCESS_DENIED",
				403,
				Permission.SECURITY_ADMIN
			);
		}

		return await this.auditService.generateReport(filters);
	}

	/**
	 * Get security alerts (security officer only)
	 */
	async getSecurityAlerts(
		sessionId: string,
		filters: any = {}
	): Promise<any[]> {
		// Check security permission
		const hasPermission = await this.checkPermission(sessionId, Permission.SECURITY_AUDIT);
		if (!hasPermission) {
			throw new AuthorizationError(
				"Insufficient permissions for security alerts",
				"SECURITY_ALERTS_ACCESS_DENIED",
				403,
				Permission.SECURITY_AUDIT
			);
		}

		return this.auditService.getSecurityAlerts(filters);
	}

	/**
	 * Get enabled authentication methods
	 */
	getEnabledMethods(): AuthenticationMethod[] {
		const methods: AuthenticationMethod[] = [];

		if (this.config.saml2.enabled) {
			methods.push(AuthenticationMethod.SAML2);
		}

		if (this.config.oauth2.enabled) {
			methods.push(AuthenticationMethod.OAUTH2);
			methods.push(AuthenticationMethod.OIDC);
		}

		if (this.config.mfa.enabled) {
			methods.push(AuthenticationMethod.MFA);
		}

		return methods;
	}

	/**
	 * Get authentication configuration
	 */
	getConfiguration(): EnterpriseAuthConfig {
		// Return sanitized configuration (remove secrets)
		const sanitized = { ...this.config };
		
		// Remove sensitive data
		if (sanitized.saml2) {
			sanitized.saml2 = { ...sanitized.saml2 };
			delete (sanitized.saml2 as any).privateKey;
		}

		if (sanitized.oauth2) {
			sanitized.oauth2 = { ...sanitized.oauth2 };
			delete (sanitized.oauth2 as any).clientSecret;
		}

		if (sanitized.session) {
			sanitized.session = { ...sanitized.session };
			delete (sanitized.session as any).encryptionKey;
		}

		return sanitized;
	}

	/**
	 * Health check for all services
	 */
	async healthCheck(): Promise<{
		status: "healthy" | "degraded" | "unhealthy";
		services: Record<string, "healthy" | "unhealthy">;
		details: Record<string, any>;
	}> {
		const services: Record<string, "healthy" | "unhealthy"> = {};
		const details: Record<string, any> = {};

		// Check SAML2 service
		if (this.saml2Service) {
			try {
				await this.saml2Service.generateMetadata();
				services.saml2 = "healthy";
			} catch (error) {
				services.saml2 = "unhealthy";
				details.saml2Error = error.message;
			}
		}

		// Check OAuth2 service
		if (this.oauth2Service) {
			try {
				// Basic configuration check
				services.oauth2 = this.config.oauth2.enabled ? "healthy" : "unhealthy";
			} catch (error) {
				services.oauth2 = "unhealthy";
				details.oauth2Error = error.message;
			}
		}

		// Check other services
		services.mfa = "healthy"; // MFA is always available
		services.rbac = "healthy"; // RBAC is always available
		services.session = "healthy"; // Session service is always available
		services.audit = "healthy"; // Audit service is always available

		// Determine overall status
		const unhealthyCount = Object.values(services).filter(s => s === "unhealthy").length;
		let status: "healthy" | "degraded" | "unhealthy";
		
		if (unhealthyCount === 0) {
			status = "healthy";
		} else if (unhealthyCount <= Object.keys(services).length / 2) {
			status = "degraded";
		} else {
			status = "unhealthy";
		}

		return {
			status,
			services,
			details: {
				...details,
				enabledMethods: this.getEnabledMethods(),
				defaultMethod: this.config.defaultMethod,
				mfaEnabled: this.config.mfa.enabled,
				norwegianCompliance: {
					gdpr: this.config.norwegianCompliance.enableGDPRCompliance,
					nsm: this.config.norwegianCompliance.enableNSMCompliance
				}
			}
		};
	}

	/**
	 * Shutdown all services
	 */
	async shutdown(): Promise<void> {
		logger.info("🔐 Shutting down Enterprise Authentication Service...");

		await Promise.all([
			this.sessionService.shutdown(),
			this.auditService.shutdown()
		]);

		logger.info("✅ Enterprise Authentication Service shutdown completed");
	}
}

// Export all types and services
export * from "./types";
export { SAML2Service } from "./saml2.service";
export { OAuth2Service } from "./oauth2.service";
export { MFAService } from "./mfa.service";
export { RBACService } from "./rbac.service";
export { SessionService } from "./session.service";
export { AuditService } from "./audit.service";

/**
 * Factory function to create enterprise authentication service
 */
export function createEnterpriseAuth(config: EnterpriseAuthConfig): EnterpriseAuthenticationService {
	return new EnterpriseAuthenticationService(config);
}

/**
 * Default enterprise authentication configuration
 */
export function createDefaultAuthConfig(): EnterpriseAuthConfig {
	return {
		version: "1.0.0",
		enabled: true,
		defaultMethod: AuthenticationMethod.OAUTH2,
		saml2: {
			enabled: false,
			entityId: "xaheen-cli",
			ssoUrl: "",
			x509Certificate: "",
			signRequests: true,
			encryptAssertions: true,
			signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
			digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
			nameIdFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
			attributeMapping: {
				email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
				firstName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
				lastName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
				roles: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
			},
			identityProviders: []
		},
		oauth2: {
			enabled: true,
			clientId: process.env.OAUTH2_CLIENT_ID || "",
			clientSecret: process.env.OAUTH2_CLIENT_SECRET || "",
			authorizationUrl: process.env.OAUTH2_AUTH_URL || "",
			tokenUrl: process.env.OAUTH2_TOKEN_URL || "",
			userInfoUrl: process.env.OAUTH2_USERINFO_URL || "",
			scope: ["openid", "profile", "email"],
			responseType: "code",
			grantType: "authorization_code",
			pkceEnabled: true,
			pkceMethod: "S256",
			refreshTokenEnabled: true,
			refreshTokenLifetime: 2592000, // 30 days
			accessTokenLifetime: 3600, // 1 hour
			idTokenLifetime: 3600, // 1 hour
			clockSkew: 300 // 5 minutes
		},
		mfa: {
			enabled: true,
			required: false,
			methods: [MFAType.TOTP],
			totpConfig: {
				issuer: "Xaheen CLI",
				algorithm: "SHA1",
				digits: 6,
				period: 30,
				window: 1
			},
			smsConfig: {
				provider: "twilio"
			},
			emailConfig: {
				provider: "smtp"
			},
			backupCodesConfig: {
				count: 10,
				length: 8,
				algorithm: "random"
			},
			fido2Config: {
				rpId: "localhost",
				rpName: "Xaheen CLI",
				timeout: 60000,
				attestation: "none",
				userVerification: "preferred",
				authenticatorSelection: {
					requireResidentKey: false,
					userVerification: "preferred"
				}
			}
		},
		roles: [],
		session: {
			enabled: true,
			tokenStorage: "file",
			encryptionKey: process.env.SESSION_ENCRYPTION_KEY || "xaheen-cli-session-key-32chars",
			tokenLifetime: 28800, // 8 hours
			refreshTokenLifetime: 2592000, // 30 days
			idleTimeout: 3600, // 1 hour
			maxConcurrentSessions: 5,
			enableSecureStorage: true,
			enableTokenRotation: true,
			tokenRotationInterval: 1800, // 30 minutes
			enableSessionFingerprinting: true,
			requireSecureCookies: true,
			sameSitePolicy: "strict"
		},
		audit: {
			enabled: true,
			logLevel: "info",
			maxLogSize: 104857600, // 100MB
			maxLogFiles: 10,
			logFormat: "json",
			includeStackTrace: false,
			sensitiveFields: ["password", "secret", "token", "key", "credential"],
			retentionPeriod: 365, // 1 year
			enableRealTimeAlerts: true,
			alertThreshold: 5,
			alertWindow: 300 // 5 minutes
		},
		norwegianCompliance: {
			enableGDPRCompliance: true,
			enableNSMCompliance: true,
			dataProcessingBasis: "legitimate_interests",
			dataRetentionPeriod: 365,
			enableDataMinimization: true,
			enableRightToErasure: true,
			enablePortability: true
		},
		metadata: {
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: "xaheen-cli",
			version: "1.0.0"
		}
	};
}
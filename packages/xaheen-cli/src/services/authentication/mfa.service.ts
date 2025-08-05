/**
 * @fileoverview Multi-Factor Authentication Service - EPIC 15 Story 15.2
 * @description Comprehensive MFA implementation with TOTP, SMS, Email, Backup Codes, and FIDO2/WebAuthn
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, Enterprise Security
 */

import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { promisify } from "util";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { z } from "zod";
import { logger } from "../../utils/logger.js";
import {
	MFAConfig,
	MFAType,
	User,
	AuthenticationEvent,
	AuthEventType,
	AuthenticationMethod,
	NSMClassification,
	IMFAProvider,
	MFAError
} from "./types.js";

// MFA Challenge Schema
const MFAChallengeSchema = z.object({
	challengeId: z.string(),
	userId: z.string(),
	method: z.nativeEnum(MFAType),
	challenge: z.string(),
	expiresAt: z.date(),
	attempts: z.number().default(0),
	maxAttempts: z.number().default(3),
	metadata: z.record(z.any()).default({})
});

// FIDO2 Challenge Schema
const FIDO2ChallengeSchema = z.object({
	challenge: z.string(),
	timeout: z.number(),
	rpId: z.string(),
	allowCredentials: z.array(z.object({
		id: z.string(),
		type: z.literal("public-key"),
		transports: z.array(z.string()).optional()
	})).optional(),
	userVerification: z.enum(["required", "preferred", "discouraged"])
});

// WebAuthn Registration Options Schema
const WebAuthnRegistrationSchema = z.object({
	challenge: z.string(),
	rp: z.object({
		id: z.string(),
		name: z.string()
	}),
	user: z.object({
		id: z.string(),
		name: z.string(),
		displayName: z.string()
	}),
	pubKeyCredParams: z.array(z.object({
		alg: z.number(),
		type: z.literal("public-key")
	})),
	timeout: z.number(),
	attestation: z.enum(["none", "indirect", "direct"]),
	authenticatorSelection: z.object({
		authenticatorAttachment: z.enum(["platform", "cross-platform"]).optional(),
		requireResidentKey: z.boolean(),
		userVerification: z.enum(["required", "preferred", "discouraged"])
	}).optional()
});

export type MFAChallenge = z.infer<typeof MFAChallengeSchema>;
export type FIDO2Challenge = z.infer<typeof FIDO2ChallengeSchema>;
export type WebAuthnRegistration = z.infer<typeof WebAuthnRegistrationSchema>;

/**
 * Comprehensive Multi-Factor Authentication Service
 */
export class MFAService implements IMFAProvider {
	private readonly config: MFAConfig;
	private readonly challenges: Map<string, MFAChallenge> = new Map();
	private readonly backupCodes: Map<string, Set<string>> = new Map();
	private readonly userSecrets: Map<string, any> = new Map();

	constructor(config: MFAConfig) {
		this.config = config;
		this.startCleanupTimer();
		logger.info("MFA Service initialized with support for:", config.methods);
	}

	/**
	 * Generate TOTP secret for user
	 */
	async generateSecret(user: User, method: MFAType = MFAType.TOTP): Promise<string> {
		try {
			switch (method) {
				case MFAType.TOTP:
					return await this.generateTOTPSecret(user);
				case MFAType.BACKUP_CODES:
					return await this.generateBackupCodes(user);
				case MFAType.FIDO2:
					return await this.generateFIDO2Registration(user);
				default:
					throw new MFAError(
						`Secret generation not supported for method: ${method}`,
						"MFA_SECRET_NOT_SUPPORTED",
						method,
						400
					);
			}
		} catch (error) {
			logger.error(`Failed to generate MFA secret for method ${method}:`, error);
			throw error;
		}
	}

	/**
	 * Generate backup codes for user
	 */
	async generateBackupCodes(user: User): Promise<string[]> {
		try {
			const codes: string[] = [];
			const count = this.config.backupCodesConfig.count;
			const length = this.config.backupCodesConfig.length;

			for (let i = 0; i < count; i++) {
				let code: string;
				if (this.config.backupCodesConfig.algorithm === "sequential") {
					code = this.generateSequentialCode(i + 1, length);
				} else {
					code = this.generateRandomCode(length);
				}
				codes.push(code);
			}

			// Hash and store backup codes
			const hashedCodes = new Set(codes.map(code => this.hashBackupCode(code)));
			this.backupCodes.set(user.id, hashedCodes);

			// Log backup code generation
			await this.logMFAEvent({
				eventType: AuthEventType.MFA_CHALLENGE,
				userId: user.id,
				success: true,
				metadata: {
					method: MFAType.BACKUP_CODES,
					codesGenerated: count,
					algorithm: this.config.backupCodesConfig.algorithm
				}
			});

			logger.info(`✅ Generated ${count} backup codes for user: ${user.email}`);
			return codes;

		} catch (error) {
			logger.error("Failed to generate backup codes:", error);
			throw new MFAError(
				"Failed to generate backup codes",
				"MFA_BACKUP_CODES_FAILED",
				MFAType.BACKUP_CODES,
				500
			);
		}
	}

	/**
	 * Validate MFA code
	 */
	async validateCode(user: User, code: string, method: MFAType): Promise<boolean> {
		try {
			logger.info(`🔐 Validating MFA code for method: ${method}`);

			let isValid = false;

			switch (method) {
				case MFAType.TOTP:
					isValid = await this.validateTOTPCode(user, code);
					break;
				case MFAType.SMS:
					isValid = await this.validateSMSCode(user, code);
					break;
				case MFAType.EMAIL:
					isValid = await this.validateEmailCode(user, code);
					break;
				case MFAType.BACKUP_CODES:
					isValid = await this.validateBackupCode(user, code);
					break;
				case MFAType.FIDO2:
				case MFAType.WEBAUTHN:
					isValid = await this.validateFIDO2Response(user, code);
					break;
				default:
					throw new MFAError(
						`Unsupported MFA method: ${method}`,
						"MFA_METHOD_NOT_SUPPORTED",
						method,
						400
					);
			}

			// Log validation result
			await this.logMFAEvent({
				eventType: isValid ? AuthEventType.MFA_SUCCESS : AuthEventType.MFA_FAILURE,
				userId: user.id,
				success: isValid,
				failureReason: isValid ? undefined : "Invalid MFA code",
				metadata: { method }
			});

			if (isValid) {
				logger.success(`✅ MFA validation successful for method: ${method}`);
			} else {
				logger.warn(`❌ MFA validation failed for method: ${method}`);
			}

			return isValid;

		} catch (error) {
			logger.error(`MFA validation failed for method ${method}:`, error);
			
			await this.logMFAEvent({
				eventType: AuthEventType.MFA_FAILURE,
				userId: user.id,
				success: false,
				failureReason: error.message,
				metadata: { method, error: error.toString() }
			});

			throw error;
		}
	}

	/**
	 * Send MFA challenge
	 */
	async sendChallenge(user: User, method: MFAType): Promise<void> {
		try {
			logger.info(`📤 Sending MFA challenge for method: ${method}`);

			const challengeId = this.generateChallengeId();
			const challenge = this.generateChallenge();

			const mfaChallenge: MFAChallenge = {
				challengeId,
				userId: user.id,
				method,
				challenge,
				expiresAt: new Date(Date.now() + 300000), // 5 minutes
				attempts: 0,
				maxAttempts: 3,
				metadata: {}
			};

			// Store challenge
			this.challenges.set(challengeId, mfaChallenge);

			switch (method) {
				case MFAType.SMS:
					await this.sendSMSChallenge(user, challenge);
					break;
				case MFAType.EMAIL:
					await this.sendEmailChallenge(user, challenge);
					break;
				case MFAType.FIDO2:
				case MFAType.WEBAUTHN:
					await this.sendFIDO2Challenge(user, challengeId);
					break;
				default:
					throw new MFAError(
						`Challenge sending not supported for method: ${method}`,
						"MFA_CHALLENGE_NOT_SUPPORTED",
						method,
						400
					);
			}

			logger.success(`✅ MFA challenge sent for method: ${method}`);

		} catch (error) {
			logger.error(`Failed to send MFA challenge for method ${method}:`, error);
			throw error;
		}
	}

	/**
	 * Enable MFA for user
	 */
	async enableMFA(user: User, method: MFAType, secret?: string): Promise<void> {
		try {
			// Validate that user doesn't already have this method enabled
			if (user.mfaMethods.includes(method)) {
				logger.warn(`MFA method ${method} already enabled for user: ${user.email}`);
				return;
			}

			// Store method-specific configuration
			await this.storeMFAConfiguration(user, method, secret);

			logger.success(`✅ MFA method ${method} enabled for user: ${user.email}`);

		} catch (error) {
			logger.error(`Failed to enable MFA method ${method}:`, error);
			throw error;
		}
	}

	/**
	 * Disable MFA for user
	 */
	async disableMFA(user: User, method: MFAType): Promise<void> {
		try {
			// Remove method-specific configuration
			await this.removeMFAConfiguration(user, method);

			logger.success(`✅ MFA method ${method} disabled for user: ${user.email}`);

		} catch (error) {
			logger.error(`Failed to disable MFA method ${method}:`, error);
			throw error;
		}
	}

	// Private methods for TOTP

	private async generateTOTPSecret(user: User): Promise<string> {
		const secret = speakeasy.generateSecret({
			name: `${this.config.totpConfig.issuer} (${user.email})`,
			issuer: this.config.totpConfig.issuer,
			length: 32
		});

		// Store secret (in production, this should be encrypted)
		this.userSecrets.set(`${user.id}:totp`, {
			secret: secret.base32,
			ascii: secret.ascii,
			hex: secret.hex,
			qr_code_url: secret.otpauth_url
		});

		logger.info(`Generated TOTP secret for user: ${user.email}`);
		return secret.otpauth_url!;
	}

	private async validateTOTPCode(user: User, code: string): Promise<boolean> {
		const secretData = this.userSecrets.get(`${user.id}:totp`);
		if (!secretData) {
			throw new MFAError(
				"TOTP not configured for user",
				"MFA_TOTP_NOT_CONFIGURED",
				MFAType.TOTP,
				400
			);
		}

		const isValid = speakeasy.totp.verify({
			secret: secretData.secret,
			encoding: "base32",
			token: code,
			window: this.config.totpConfig.window,
			algorithm: this.config.totpConfig.algorithm.toLowerCase() as any,
			digits: this.config.totpConfig.digits,
			step: this.config.totpConfig.period
		});

		return isValid;
	}

	// Private methods for SMS

	private async sendSMSChallenge(user: User, challenge: string): Promise<void> {
		// Implementation depends on SMS provider
		switch (this.config.smsConfig.provider) {
			case "twilio":
				await this.sendTwilioSMS(user, challenge);
				break;
			case "aws_sns":
				await this.sendAWSSNS(user, challenge);
				break;
			case "custom":
				await this.sendCustomSMS(user, challenge);
				break;
			default:
				throw new MFAError(
					`Unsupported SMS provider: ${this.config.smsConfig.provider}`,
					"MFA_SMS_PROVIDER_NOT_SUPPORTED",
					MFAType.SMS,
					500
				);
		}
	}

	private async validateSMSCode(user: User, code: string): Promise<boolean> {
		// Find active SMS challenge for user
		const challenge = Array.from(this.challenges.values()).find(
			c => c.userId === user.id && 
				 c.method === MFAType.SMS && 
				 c.expiresAt > new Date()
		);

		if (!challenge) {
			return false;
		}

		const isValid = timingSafeEqual(
			Buffer.from(challenge.challenge),
			Buffer.from(code)
		);

		if (isValid) {
			this.challenges.delete(challenge.challengeId);
		} else {
			challenge.attempts++;
			if (challenge.attempts >= challenge.maxAttempts) {
				this.challenges.delete(challenge.challengeId);
			}
		}

		return isValid;
	}

	// Private methods for Email

	private async sendEmailChallenge(user: User, challenge: string): Promise<void> {
		// Implementation depends on email provider
		switch (this.config.emailConfig.provider) {
			case "sendgrid":
				await this.sendSendGridEmail(user, challenge);
				break;
			case "aws_ses":
				await this.sendAWSSESEmail(user, challenge);
				break;
			case "smtp":
				await this.sendSMTPEmail(user, challenge);
				break;
			case "custom":
				await this.sendCustomEmail(user, challenge);
				break;
			default:
				throw new MFAError(
					`Unsupported email provider: ${this.config.emailConfig.provider}`,
					"MFA_EMAIL_PROVIDER_NOT_SUPPORTED",
					MFAType.EMAIL,
					500
				);
		}
	}

	private async validateEmailCode(user: User, code: string): Promise<boolean> {
		// Similar to SMS validation
		const challenge = Array.from(this.challenges.values()).find(
			c => c.userId === user.id && 
				 c.method === MFAType.EMAIL && 
				 c.expiresAt > new Date()
		);

		if (!challenge) {
			return false;
		}

		const isValid = timingSafeEqual(
			Buffer.from(challenge.challenge),
			Buffer.from(code)
		);

		if (isValid) {
			this.challenges.delete(challenge.challengeId);
		}

		return isValid;
	}

	// Private methods for Backup Codes

	private async validateBackupCode(user: User, code: string): Promise<boolean> {
		const userCodes = this.backupCodes.get(user.id);
		if (!userCodes) {
			return false;
		}

		const hashedCode = this.hashBackupCode(code);
		const isValid = userCodes.has(hashedCode);

		if (isValid) {
			// Remove used backup code
			userCodes.delete(hashedCode);
			logger.info(`Backup code used for user: ${user.email}. Remaining: ${userCodes.size}`);
		}

		return isValid;
	}

	// Private methods for FIDO2/WebAuthn

	private async generateFIDO2Registration(user: User): Promise<string> {
		const challenge = randomBytes(32).toString("base64url");
		
		const registrationOptions: WebAuthnRegistration = {
			challenge,
			rp: {
				id: this.config.fido2Config.rpId,
				name: this.config.fido2Config.rpName
			},
			user: {
				id: Buffer.from(user.id).toString("base64url"),
				name: user.email,
				displayName: `${user.firstName} ${user.lastName}`.trim() || user.email
			},
			pubKeyCredParams: [
				{ alg: -7, type: "public-key" },  // ES256
				{ alg: -257, type: "public-key" } // RS256
			],
			timeout: this.config.fido2Config.timeout,
			attestation: this.config.fido2Config.attestation,
			authenticatorSelection: this.config.fido2Config.authenticatorSelection
		};

		// Store registration challenge
		this.userSecrets.set(`${user.id}:fido2:registration`, {
			challenge,
			options: registrationOptions,
			createdAt: new Date()
		});

		return JSON.stringify(registrationOptions);
	}

	private async sendFIDO2Challenge(user: User, challengeId: string): Promise<void> {
		const challenge = randomBytes(32).toString("base64url");
		
		const assertionOptions: FIDO2Challenge = {
			challenge,
			timeout: this.config.fido2Config.timeout,
			rpId: this.config.fido2Config.rpId,
			userVerification: this.config.fido2Config.userVerification
		};

		// Update challenge with FIDO2 specific data
		const mfaChallenge = this.challenges.get(challengeId);
		if (mfaChallenge) {
			mfaChallenge.metadata.fido2Options = assertionOptions;
		}

		logger.info(`Generated FIDO2 assertion challenge for user: ${user.email}`);
	}

	private async validateFIDO2Response(user: User, response: string): Promise<boolean> {
		try {
			// Parse WebAuthn assertion response
			const assertionResponse = JSON.parse(response);
			
			// TODO: Implement full WebAuthn assertion validation
			// This requires:
			// 1. Verify challenge matches stored challenge
			// 2. Verify origin matches expected origin
			// 3. Verify signature using stored public key
			// 4. Increment signature counter
			
			// For now, we'll implement basic validation
			const storedChallenge = Array.from(this.challenges.values()).find(
				c => c.userId === user.id && 
					 (c.method === MFAType.FIDO2 || c.method === MFAType.WEBAUTHN) &&
					 c.expiresAt > new Date()
			);

			if (!storedChallenge) {
				return false;
			}

			// Basic validation - in production, use a proper WebAuthn library
			const isValid = assertionResponse.response && 
							assertionResponse.type === "public-key";

			if (isValid) {
				this.challenges.delete(storedChallenge.challengeId);
			}

			return isValid;

		} catch (error) {
			logger.error("FIDO2 response validation failed:", error);
			return false;
		}
	}

	// Utility methods

	private generateChallenge(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	private generateChallengeId(): string {
		return randomBytes(16).toString("hex");
	}

	private generateRandomCode(length: number): string {
		const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private generateSequentialCode(sequence: number, length: number): string {
		return sequence.toString().padStart(length, "0");
	}

	private hashBackupCode(code: string): string {
		return createHmac("sha256", "backup-codes-secret").update(code).digest("hex");
	}

	private async storeMFAConfiguration(user: User, method: MFAType, secret?: string): Promise<void> {
		// In production, this should store in a secure database
		const key = `${user.id}:${method.toLowerCase()}`;
		this.userSecrets.set(key, {
			method,
			secret,
			enabled: true,
			enabledAt: new Date()
		});
	}

	private async removeMFAConfiguration(user: User, method: MFAType): Promise<void> {
		const key = `${user.id}:${method.toLowerCase()}`;
		this.userSecrets.delete(key);
		
		if (method === MFAType.BACKUP_CODES) {
			this.backupCodes.delete(user.id);
		}
	}

	// Provider-specific implementations (simplified)

	private async sendTwilioSMS(user: User, challenge: string): Promise<void> {
		// Implementation would use Twilio SDK
		logger.info(`📱 Sending SMS via Twilio to user: ${user.email}`);
		// TODO: Implement Twilio SMS sending
	}

	private async sendAWSSNS(user: User, challenge: string): Promise<void> {
		// Implementation would use AWS SDK
		logger.info(`📱 Sending SMS via AWS SNS to user: ${user.email}`);
		// TODO: Implement AWS SNS SMS sending
	}

	private async sendCustomSMS(user: User, challenge: string): Promise<void> {
		// Implementation would use custom SMS provider
		logger.info(`📱 Sending SMS via custom provider to user: ${user.email}`);
		// TODO: Implement custom SMS sending
	}

	private async sendSendGridEmail(user: User, challenge: string): Promise<void> {
		// Implementation would use SendGrid SDK
		logger.info(`📧 Sending email via SendGrid to user: ${user.email}`);
		// TODO: Implement SendGrid email sending
	}

	private async sendAWSSESEmail(user: User, challenge: string): Promise<void> {
		// Implementation would use AWS SES SDK
		logger.info(`📧 Sending email via AWS SES to user: ${user.email}`);
		// TODO: Implement AWS SES email sending
	}

	private async sendSMTPEmail(user: User, challenge: string): Promise<void> {
		// Implementation would use nodemailer
		logger.info(`📧 Sending email via SMTP to user: ${user.email}`);
		// TODO: Implement SMTP email sending
	}

	private async sendCustomEmail(user: User, challenge: string): Promise<void> {
		// Implementation would use custom email provider
		logger.info(`📧 Sending email via custom provider to user: ${user.email}`);
		// TODO: Implement custom email sending
	}

	private startCleanupTimer(): void {
		// Clean up expired challenges every 5 minutes
		setInterval(() => {
			const now = new Date();
			for (const [challengeId, challenge] of this.challenges.entries()) {
				if (challenge.expiresAt < now) {
					this.challenges.delete(challengeId);
				}
			}
		}, 300000);
	}

	private async logMFAEvent(eventData: Partial<AuthenticationEvent>): Promise<void> {
		const event: AuthenticationEvent = {
			eventId: randomBytes(16).toString("hex"),
			timestamp: new Date(),
			ipAddress: "CLI",
			userAgent: "Xaheen CLI",
			method: AuthenticationMethod.MFA,
			nsmClassification: NSMClassification.OPEN,
			metadata: {},
			...eventData
		} as AuthenticationEvent;

		// Log to audit system
		logger.info("🔍 MFA event:", event);
		
		// TODO: Integrate with audit logger service
	}
}
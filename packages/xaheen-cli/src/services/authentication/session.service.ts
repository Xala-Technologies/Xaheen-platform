/**
 * @fileoverview Session Management Service - EPIC 15 Story 15.2
 * @description Comprehensive session management with secure token storage, timeout/renewal, and Norwegian NSM compliance
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, Enterprise Security
 */

import { randomBytes, createCipher, createDecipher, createHash, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { z } from "zod";
import { logger } from "../../utils/logger.js";
import {
	SessionConfig,
	SessionToken,
	User,
	Permission,
	NSMClassification,
	AuthenticationEvent,
	AuthEventType,
	AuthenticationMethod,
	ISessionManager,
	AuthenticationError
} from "./types.js";

// Session Storage Schema
const SessionStorageSchema = z.object({
	sessions: z.record(z.object({
		sessionId: z.string(),
		userId: z.string(),
		deviceId: z.string(),
		ipAddress: z.string(),
		userAgent: z.string(),
		createdAt: z.string(),
		expiresAt: z.string(),
		lastActivity: z.string(),
		isActive: z.boolean(),
		permissions: z.array(z.string()),
		nsmClearance: z.nativeEnum(NSMClassification),
		metadata: z.record(z.any()),
		fingerprint: z.string().optional(),
		encrypted: z.boolean().default(false)
	})),
	metadata: z.object({
		version: z.string(),
		lastCleanup: z.string(),
		totalSessions: z.number()
	})
});

// Device Info Schema
const DeviceInfoSchema = z.object({
	userAgent: z.string(),
	ipAddress: z.string(),
	platform: z.string().optional(),
	browser: z.string().optional(),
	os: z.string().optional(),
	fingerprint: z.string().optional()
});

export type SessionStorage = z.infer<typeof SessionStorageSchema>;
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

/**
 * Enterprise Session Management Service with Norwegian NSM compliance
 */
export class SessionService implements ISessionManager {
	private readonly config: SessionConfig;
	private readonly sessions: Map<string, SessionToken> = new Map();
	private readonly userSessions: Map<string, Set<string>> = new Map();
	private readonly sessionStorage: string;
	private cleanupTimer?: NodeJS.Timeout;

	constructor(config: SessionConfig) {
		this.config = config;
		this.sessionStorage = this.getStoragePath();
		this.initializeStorage();
		this.startCleanupTimer();
		logger.info("Session Management Service initialized with secure storage");
	}

	/**
	 * Create new session for user
	 */
	async createSession(user: User, deviceInfo: DeviceInfo): Promise<SessionToken> {
		try {
			logger.info(`🔐 Creating session for user: ${user.email}`);

			// Check concurrent session limits
			await this.enforceConcurrentSessionLimits(user.id);

			// Generate session token
			const sessionId = this.generateSessionId();
			const deviceId = this.generateDeviceId(deviceInfo);
			const fingerprint = this.generateSessionFingerprint(user, deviceInfo);

			const session: SessionToken = {
				sessionId,
				userId: user.id,
				deviceId,
				ipAddress: deviceInfo.ipAddress,
				userAgent: deviceInfo.userAgent,
				createdAt: new Date(),
				expiresAt: new Date(Date.now() + this.config.tokenLifetime * 1000),
				lastActivity: new Date(),
				isActive: true,
				permissions: user.permissions,
				nsmClearance: user.nsmClearance,
				metadata: {
					fingerprint: this.config.enableSessionFingerprinting ? fingerprint : undefined,
					deviceInfo,
					authMethod: user.metadata?.authMethod || AuthenticationMethod.OAUTH2,
					createdBy: "session-service",
					nsmCompliant: true
				}
			};

			// Store session
			this.sessions.set(sessionId, session);

			// Track user sessions
			if (!this.userSessions.has(user.id)) {
				this.userSessions.set(user.id, new Set());
			}
			this.userSessions.get(user.id)!.add(sessionId);

			// Persist session
			await this.persistSession(session);

			// Log session creation
			await this.logSessionEvent({
				eventType: AuthEventType.SESSION_CREATED,
				userId: user.id,
				sessionId,
				success: true,
				metadata: {
					deviceId,
					ipAddress: deviceInfo.ipAddress,
					userAgent: deviceInfo.userAgent,
					expiresAt: session.expiresAt,
					nsmClearance: user.nsmClearance
				}
			});

			logger.success(`✅ Session created for user: ${user.email}`);
			return session;

		} catch (error) {
			logger.error(`Failed to create session for user ${user.id}:`, error);
			
			await this.logSessionEvent({
				eventType: AuthEventType.SESSION_CREATED,
				userId: user.id,
				success: false,
				failureReason: error.message,
				metadata: { error: error.toString() }
			});

			throw new AuthenticationError(
				"Failed to create session",
				"SESSION_CREATION_FAILED",
				500,
				{ originalError: error.message }
			);
		}
	}

	/**
	 * Validate and retrieve session
	 */
	async validateSession(sessionId: string): Promise<SessionToken | null> {
		try {
			const session = this.sessions.get(sessionId);
			if (!session) {
				// Try loading from persistent storage
				const persistedSession = await this.loadPersistedSession(sessionId);
				if (persistedSession) {
					this.sessions.set(sessionId, persistedSession);
					return await this.validateSession(sessionId);
				}
				return null;
			}

			// Check if session is active
			if (!session.isActive) {
				return null;
			}

			// Check expiration
			if (session.expiresAt < new Date()) {
				await this.expireSession(sessionId, "Session expired");
				return null;
			}

			// Check idle timeout
			const idleTime = Date.now() - session.lastActivity.getTime();
			if (idleTime > this.config.idleTimeout * 1000) {
				await this.expireSession(sessionId, "Session idle timeout");
				return null;
			}

			// Update last activity
			session.lastActivity = new Date();
			await this.persistSession(session);

			return session;

		} catch (error) {
			logger.error(`Session validation failed for ${sessionId}:`, error);
			return null;
		}
	}

	/**
	 * Refresh session (extend expiration)
	 */
	async refreshSession(sessionId: string): Promise<SessionToken> {
		try {
			const session = await this.validateSession(sessionId);
			if (!session) {
				throw new AuthenticationError(
					"Session not found or invalid",
					"SESSION_NOT_FOUND",
					404
				);
			}

			// Extend session expiration
			const newExpiresAt = new Date(Date.now() + this.config.tokenLifetime * 1000);
			session.expiresAt = newExpiresAt;
			session.lastActivity = new Date();

			// Token rotation if enabled
			if (this.config.enableTokenRotation) {
				const now = Date.now();
				const lastRotation = session.metadata.lastRotationAt as number || session.createdAt.getTime();
				
				if (now - lastRotation > this.config.tokenRotationInterval * 1000) {
					const newSessionId = this.generateSessionId();
					
					// Create new session with new ID
					const newSession = { ...session, sessionId: newSessionId };
					newSession.metadata.lastRotationAt = now;
					newSession.metadata.previousSessionId = sessionId;

					// Replace old session
					this.sessions.delete(sessionId);
					this.sessions.set(newSessionId, newSession);

					// Update user session tracking
					const userSessions = this.userSessions.get(session.userId);
					if (userSessions) {
						userSessions.delete(sessionId);
						userSessions.add(newSessionId);
					}

					await this.persistSession(newSession);
					await this.removePersistedSession(sessionId);

					logger.info(`🔄 Session rotated: ${sessionId} -> ${newSessionId}`);
					return newSession;
				}
			}

			// Persist updated session
			await this.persistSession(session);

			// Log session refresh
			await this.logSessionEvent({
				eventType: AuthEventType.SESSION_CREATED, // Using as session refresh
				userId: session.userId,
				sessionId,
				success: true,
				metadata: {
					action: "session_refreshed",
					newExpiresAt,
					tokenRotated: false
				}
			});

			logger.info(`🔄 Session refreshed: ${sessionId}`);
			return session;

		} catch (error) {
			logger.error(`Failed to refresh session ${sessionId}:`, error);
			throw error;
		}
	}

	/**
	 * Invalidate session
	 */
	async invalidateSession(sessionId: string): Promise<void> {
		try {
			const session = this.sessions.get(sessionId);
			if (session) {
				session.isActive = false;
				session.metadata.invalidatedAt = new Date();
				
				// Remove from active sessions
				this.sessions.delete(sessionId);

				// Remove from user session tracking
				const userSessions = this.userSessions.get(session.userId);
				if (userSessions) {
					userSessions.delete(sessionId);
				}

				// Log session invalidation
				await this.logSessionEvent({
					eventType: AuthEventType.SESSION_INVALIDATED,
					userId: session.userId,
					sessionId,
					success: true,
					metadata: {
						reason: "Manual invalidation",
						invalidatedAt: new Date()
					}
				});
			}

			// Remove from persistent storage
			await this.removePersistedSession(sessionId);

			logger.info(`🚪 Session invalidated: ${sessionId}`);

		} catch (error) {
			logger.error(`Failed to invalidate session ${sessionId}:`, error);
			throw error;
		}
	}

	/**
	 * Invalidate all sessions for user
	 */
	async invalidateAllSessions(userId: string): Promise<void> {
		try {
			const userSessions = this.userSessions.get(userId);
			if (!userSessions) {
				logger.info(`No active sessions found for user: ${userId}`);
				return;
			}

			const sessionIds = Array.from(userSessions);
			
			// Invalidate each session
			for (const sessionId of sessionIds) {
				await this.invalidateSession(sessionId);
			}

			// Clear user session tracking
			this.userSessions.delete(userId);

			// Log mass invalidation
			await this.logSessionEvent({
				eventType: AuthEventType.SESSION_INVALIDATED,
				userId,
				success: true,
				metadata: {
					action: "all_sessions_invalidated",
					sessionCount: sessionIds.length,
					invalidatedAt: new Date()
				}
			});

			logger.success(`✅ All sessions invalidated for user: ${userId}`);

		} catch (error) {
			logger.error(`Failed to invalidate all sessions for user ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Get user's active sessions
	 */
	async getUserSessions(userId: string): Promise<SessionToken[]> {
		try {
			const userSessionIds = this.userSessions.get(userId);
			if (!userSessionIds) {
				return [];
			}

			const sessions: SessionToken[] = [];
			for (const sessionId of userSessionIds) {
				const session = await this.validateSession(sessionId);
				if (session) {
					sessions.push(session);
				}
			}

			return sessions;

		} catch (error) {
			logger.error(`Failed to get sessions for user ${userId}:`, error);
			return [];
		}
	}

	/**
	 * Clean up expired sessions
	 */
	async cleanupExpiredSessions(): Promise<void> {
		try {
			const now = new Date();
			const expiredSessions: string[] = [];

			// Find expired sessions
			for (const [sessionId, session] of this.sessions) {
				if (session.expiresAt < now || !session.isActive) {
					expiredSessions.push(sessionId);
				}
			}

			// Remove expired sessions
			for (const sessionId of expiredSessions) {
				await this.expireSession(sessionId, "Cleanup expired session");
			}

			logger.info(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);

		} catch (error) {
			logger.error("Session cleanup failed:", error);
		}
	}

	// Private methods

	private async enforceConcurrentSessionLimits(userId: string): Promise<void> {
		const userSessions = this.userSessions.get(userId);
		if (!userSessions) {
			return;
		}

		// Count active sessions
		const activeSessions = Array.from(userSessions).filter(sessionId => {
			const session = this.sessions.get(sessionId);
			return session && session.isActive && session.expiresAt > new Date();
		});

		// Remove oldest sessions if limit exceeded
		if (activeSessions.length >= this.config.maxConcurrentSessions) {
			const sessionsToRemove = activeSessions.length - this.config.maxConcurrentSessions + 1;
			
			// Sort by creation time (oldest first)
			const sortedSessions = activeSessions
				.map(id => this.sessions.get(id)!)
				.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
				.slice(0, sessionsToRemove);

			for (const session of sortedSessions) {
				await this.expireSession(session.sessionId, "Concurrent session limit exceeded");
			}

			logger.info(`⚠️ Removed ${sessionsToRemove} sessions due to concurrent limit for user: ${userId}`);
		}
	}

	private async expireSession(sessionId: string, reason: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.isActive = false;
			session.metadata.expiredAt = new Date();
			session.metadata.expiredReason = reason;

			// Remove from active sessions
			this.sessions.delete(sessionId);

			// Remove from user session tracking
			const userSessions = this.userSessions.get(session.userId);
			if (userSessions) {
				userSessions.delete(sessionId);
			}

			// Log session expiration
			await this.logSessionEvent({
				eventType: AuthEventType.SESSION_EXPIRED,
				userId: session.userId,
				sessionId,
				success: true,
				metadata: { reason, expiredAt: new Date() }
			});
		}

		// Remove from persistent storage
		await this.removePersistedSession(sessionId);
	}

	private generateSessionId(): string {
		return randomBytes(32).toString("base64url");
	}

	private generateDeviceId(deviceInfo: DeviceInfo): string {
		const data = `${deviceInfo.userAgent}:${deviceInfo.ipAddress}:${Date.now()}`;
		return createHash("sha256").update(data).digest("hex").substring(0, 32);
	}

	private generateSessionFingerprint(user: User, deviceInfo: DeviceInfo): string {
		const data = `${user.id}:${deviceInfo.userAgent}:${deviceInfo.ipAddress}:${user.nsmClearance}`;
		return createHash("sha256").update(data).digest("hex").substring(0, 16);
	}

	private getStoragePath(): string {
		switch (this.config.tokenStorage) {
			case "file":
				return join(homedir(), ".xaheen", "sessions.json");
			case "memory":
				return "";
			case "database":
			case "redis":
				// TODO: Implement database/Redis storage
				return join(homedir(), ".xaheen", "sessions.json");
			default:
				return join(homedir(), ".xaheen", "sessions.json");
		}
	}

	private async initializeStorage(): Promise<void> {
		if (this.config.tokenStorage === "memory") {
			return;
		}

		try {
			if (this.sessionStorage) {
				// Ensure directory exists
				await fs.mkdir(dirname(this.sessionStorage), { recursive: true });

				// Load existing sessions
				await this.loadPersistedSessions();
			}
		} catch (error) {
			logger.warn("Failed to initialize session storage:", error);
		}
	}

	private async persistSession(session: SessionToken): Promise<void> {
		if (this.config.tokenStorage === "memory") {
			return;
		}

		try {
			const sessionData = this.serializeSession(session);
			
			// Load existing storage
			let storage: SessionStorage;
			try {
				const content = await fs.readFile(this.sessionStorage, "utf-8");
				storage = SessionStorageSchema.parse(JSON.parse(content));
			} catch {
				storage = {
					sessions: {},
					metadata: {
						version: "1.0.0",
						lastCleanup: new Date().toISOString(),
						totalSessions: 0
					}
				};
			}

			// Add/update session
			storage.sessions[session.sessionId] = sessionData;
			storage.metadata.totalSessions = Object.keys(storage.sessions).length;

			// Encrypt if enabled
			let content = JSON.stringify(storage, null, 2);
			if (this.config.enableSecureStorage) {
				content = this.encryptContent(content);
			}

			await fs.writeFile(this.sessionStorage, content, "utf-8");

		} catch (error) {
			logger.error("Failed to persist session:", error);
		}
	}

	private async loadPersistedSession(sessionId: string): Promise<SessionToken | null> {
		if (this.config.tokenStorage === "memory") {
			return null;
		}

		try {
			const content = await fs.readFile(this.sessionStorage, "utf-8");
			let decryptedContent = content;
			
			if (this.config.enableSecureStorage) {
				decryptedContent = this.decryptContent(content);
			}

			const storage = SessionStorageSchema.parse(JSON.parse(decryptedContent));
			const sessionData = storage.sessions[sessionId];
			
			if (sessionData) {
				return this.deserializeSession(sessionData);
			}

			return null;

		} catch (error) {
			logger.debug(`Failed to load persisted session ${sessionId}:`, error);
			return null;
		}
	}

	private async loadPersistedSessions(): Promise<void> {
		if (this.config.tokenStorage === "memory") {
			return;
		}

		try {
			const content = await fs.readFile(this.sessionStorage, "utf-8");
			let decryptedContent = content;
			
			if (this.config.enableSecureStorage) {
				decryptedContent = this.decryptContent(content);
			}

			const storage = SessionStorageSchema.parse(JSON.parse(decryptedContent));
			
			// Load active sessions
			for (const [sessionId, sessionData] of Object.entries(storage.sessions)) {
				const session = this.deserializeSession(sessionData);
				if (session.isActive && session.expiresAt > new Date()) {
					this.sessions.set(sessionId, session);

					// Track user sessions
					if (!this.userSessions.has(session.userId)) {
						this.userSessions.set(session.userId, new Set());
					}
					this.userSessions.get(session.userId)!.add(sessionId);
				}
			}

			logger.info(`📥 Loaded ${this.sessions.size} active sessions from storage`);

		} catch (error) {
			logger.debug("No existing sessions to load:", error);
		}
	}

	private async removePersistedSession(sessionId: string): Promise<void> {
		if (this.config.tokenStorage === "memory") {
			return;
		}

		try {
			const content = await fs.readFile(this.sessionStorage, "utf-8");
			let decryptedContent = content;
			
			if (this.config.enableSecureStorage) {
				decryptedContent = this.decryptContent(content);
			}

			const storage = SessionStorageSchema.parse(JSON.parse(decryptedContent));
			delete storage.sessions[sessionId];
			storage.metadata.totalSessions = Object.keys(storage.sessions).length;

			// Encrypt if enabled
			let newContent = JSON.stringify(storage, null, 2);
			if (this.config.enableSecureStorage) {
				newContent = this.encryptContent(newContent);
			}

			await fs.writeFile(this.sessionStorage, newContent, "utf-8");

		} catch (error) {
			logger.debug(`Failed to remove persisted session ${sessionId}:`, error);
		}
	}

	private serializeSession(session: SessionToken): any {
		return {
			sessionId: session.sessionId,
			userId: session.userId,
			deviceId: session.deviceId,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			createdAt: session.createdAt.toISOString(),
			expiresAt: session.expiresAt.toISOString(),
			lastActivity: session.lastActivity.toISOString(),
			isActive: session.isActive,
			permissions: session.permissions,
			nsmClearance: session.nsmClearance,
			metadata: session.metadata,
			fingerprint: session.metadata.fingerprint,
			encrypted: this.config.enableSecureStorage
		};
	}

	private deserializeSession(data: any): SessionToken {
		return {
			sessionId: data.sessionId,
			userId: data.userId,
			deviceId: data.deviceId,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			createdAt: new Date(data.createdAt),
			expiresAt: new Date(data.expiresAt),
			lastActivity: new Date(data.lastActivity),
			isActive: data.isActive,
			permissions: data.permissions,
			nsmClearance: data.nsmClearance,
			metadata: data.metadata
		};
	}

	private encryptContent(content: string): string {
		// Simple encryption for demonstration
		// In production, use proper encryption with key derivation
		const cipher = createCipher("aes-256-cbc", this.config.encryptionKey);
		let encrypted = cipher.update(content, "utf8", "hex");
		encrypted += cipher.final("hex");
		return encrypted;
	}

	private decryptContent(encryptedContent: string): string {
		// Simple decryption for demonstration
		const decipher = createDecipher("aes-256-cbc", this.config.encryptionKey);
		let decrypted = decipher.update(encryptedContent, "hex", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	}

	private startCleanupTimer(): void {
		// Run cleanup every 30 minutes
		this.cleanupTimer = setInterval(async () => {
			await this.cleanupExpiredSessions();
		}, 1800000);

		logger.info("⏰ Session cleanup timer started");
	}

	private async logSessionEvent(eventData: Partial<AuthenticationEvent>): Promise<void> {
		const event: AuthenticationEvent = {
			eventId: randomBytes(16).toString("hex"),
			timestamp: new Date(),
			ipAddress: "CLI",
			userAgent: "Xaheen CLI",
			method: AuthenticationMethod.OAUTH2, // Default method
			nsmClassification: NSMClassification.OPEN,
			metadata: {},
			success: true,
			...eventData
		} as AuthenticationEvent;

		// Log to system
		logger.info("🔍 Session event:", event);
		
		// TODO: Integrate with audit logger service
	}

	/**
	 * Shutdown session service
	 */
	async shutdown(): Promise<void> {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
		}

		// Final cleanup
		await this.cleanupExpiredSessions();

		logger.info("Session service shutdown completed");
	}
}
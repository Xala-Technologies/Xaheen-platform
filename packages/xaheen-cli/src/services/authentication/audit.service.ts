/**
 * @fileoverview Authentication Audit Service - EPIC 15 Story 15.2
 * @description Comprehensive audit trail service with Norwegian NSM compliance and GDPR support
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security
 */

import { randomBytes, createHash } from "crypto";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { z } from "zod";
import { logger } from "../../utils/logger";
import {
	AuditConfig,
	AuthenticationEvent,
	AuthEventType,
	NSMClassification,
	IAuditLogger
} from "./types.js";

// Audit Report Schema
const AuditReportSchema = z.object({
	reportId: z.string(),
	title: z.string(),
	description: z.string(),
	generatedAt: z.date(),
	generatedBy: z.string(),
	period: z.object({
		startDate: z.date(),
		endDate: z.date()
	}),
	filters: z.record(z.any()),
	summary: z.object({
		totalEvents: z.number(),
		successfulEvents: z.number(),
		failedEvents: z.number(),
		uniqueUsers: z.number(),
		eventsByType: z.record(z.number()),
		securityAlerts: z.number(),
		complianceIssues: z.number()
	}),
	events: z.array(z.any()),
	recommendations: z.array(z.string()),
	compliance: z.object({
		gdprCompliant: z.boolean(),
		nsmCompliant: z.boolean(),
		dataRetentionCompliant: z.boolean(),
		issues: z.array(z.string())
	}),
	metadata: z.record(z.any())
});

// Security Alert Schema
const SecurityAlertSchema = z.object({
	alertId: z.string(),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
	type: z.enum([
		"FAILED_LOGIN_ATTEMPTS",
		"SUSPICIOUS_ACTIVITY",
		"PERMISSION_VIOLATION",
		"MFA_BYPASS_ATTEMPT",
		"SESSION_ANOMALY",
		"DATA_BREACH_RISK",
		"COMPLIANCE_VIOLATION"
	]),
	title: z.string(),
	description: z.string(),
	userId: z.string().optional(),
	ipAddress: z.string().optional(),
	timestamp: z.date(),
	relatedEvents: z.array(z.string()),
	resolved: z.boolean().default(false),
	resolvedAt: z.date().optional(),
	resolvedBy: z.string().optional(),
	metadata: z.record(z.any())
});

export type AuditReport = z.infer<typeof AuditReportSchema>;
export type SecurityAlert = z.infer<typeof SecurityAlertSchema>;

/**
 * Norwegian NSM and GDPR Compliant Audit Service
 */
export class AuditService implements IAuditLogger {
	private readonly config: AuditConfig;
	private readonly events: AuthenticationEvent[] = [];
	private readonly alerts: SecurityAlert[] = [];
	private readonly logPath: string;
	private readonly alertThresholds: Map<string, { count: number; timestamp: number }> = new Map();
	private logFileHandle?: fs.FileHandle;

	constructor(config: AuditConfig) {
		this.config = config;
		this.logPath = this.getLogPath();
		this.initializeLogFile();
		this.startRetentionCleanup();
		logger.info("🔍 Audit Service initialized with Norwegian NSM compliance");
	}

	/**
	 * Log authentication event with Norwegian NSM classification
	 */
	async logEvent(event: AuthenticationEvent): Promise<void> {
		try {
			// Validate event data
			const validatedEvent = this.validateEvent(event);

			// Apply data minimization (GDPR compliance)
			const sanitizedEvent = this.applySensitiveDataFiltering(validatedEvent);

			// Store event
			this.events.push(sanitizedEvent);

			// Write to log file
			await this.writeToLogFile(sanitizedEvent);

			// Check for security alerts
			await this.checkForSecurityAlerts(sanitizedEvent);

			// Real-time compliance monitoring
			await this.monitorCompliance(sanitizedEvent);

			logger.debug(`📝 Audit event logged: ${event.eventType}`);

		} catch (error) {
			logger.error("Failed to log audit event:", error);
			// Don't throw - audit failures shouldn't break authentication
		}
	}

	/**
	 * Get events with filtering and Norwegian classification compliance
	 */
	async getEvents(filters: {
		userId?: string;
		startDate?: Date;
		endDate?: Date;
		eventType?: AuthEventType;
		nsmClassification?: NSMClassification;
		ipAddress?: string;
		success?: boolean;
		limit?: number;
		offset?: number;
	} = {}): Promise<AuthenticationEvent[]> {
		try {
			let filteredEvents = [...this.events];

			// Apply filters
			if (filters.userId) {
				filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
			}

			if (filters.startDate) {
				filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!);
			}

			if (filters.endDate) {
				filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!);
			}

			if (filters.eventType) {
				filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType);
			}

			if (filters.nsmClassification) {
				filteredEvents = filteredEvents.filter(e => e.nsmClassification === filters.nsmClassification);
			}

			if (filters.ipAddress) {
				filteredEvents = filteredEvents.filter(e => e.ipAddress === filters.ipAddress);
			}

			if (filters.success !== undefined) {
				filteredEvents = filteredEvents.filter(e => e.success === filters.success);
			}

			// Sort by timestamp (newest first)
			filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

			// Apply pagination
			const offset = filters.offset || 0;
			const limit = filters.limit || 1000;
			filteredEvents = filteredEvents.slice(offset, offset + limit);

			return filteredEvents;

		} catch (error) {
			logger.error("Failed to get audit events:", error);
			return [];
		}
	}

	/**
	 * Generate comprehensive audit report with Norwegian compliance
	 */
	async generateReport(filters: {
		startDate?: Date;
		endDate?: Date;
		userId?: string;
		reportType?: "SECURITY" | "COMPLIANCE" | "ACTIVITY" | "COMPREHENSIVE";
		includeRecommendations?: boolean;
	} = {}): Promise<AuditReport> {
		try {
			const reportId = this.generateReportId();
			const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
			const endDate = filters.endDate || new Date();
			const reportType = filters.reportType || "COMPREHENSIVE";

			// Get events for the period
			const events = await this.getEvents({
				...filters,
				startDate,
				endDate
			});

			// Generate summary statistics
			const summary = this.generateSummary(events);

			// Compliance analysis
			const compliance = await this.analyzeCompliance(events);

			// Generate recommendations
			const recommendations = filters.includeRecommendations !== false 
				? await this.generateRecommendations(events, summary)
				: [];

			const report: AuditReport = {
				reportId,
				title: `${reportType} Audit Report`,
				description: `Comprehensive audit report for period ${startDate.toISOString()} to ${endDate.toISOString()}`,
				generatedAt: new Date(),
				generatedBy: "audit-service",
				period: { startDate, endDate },
				filters,
				summary,
				events: events.map(e => this.sanitizeEventForReport(e)),
				recommendations,
				compliance,
				metadata: {
					reportVersion: "1.0.0",
					nsmClassification: this.determineReportClassification(events),
					gdprCompliant: true,
					generationTime: Date.now()
				}
			};

			logger.info(`📊 Audit report generated: ${reportId}`);
			return report;

		} catch (error) {
			logger.error("Failed to generate audit report:", error);
			throw error;
		}
	}

	/**
	 * Generate security alerts based on patterns
	 */
	async generateSecurityAlert(
		type: SecurityAlert["type"],
		severity: SecurityAlert["severity"],
		title: string,
		description: string,
		relatedEvents: string[],
		metadata: Record<string, any> = {}
	): Promise<SecurityAlert> {
		const alert: SecurityAlert = {
			alertId: this.generateAlertId(),
			severity,
			type,
			title,
			description,
			userId: metadata.userId,
			ipAddress: metadata.ipAddress,
			timestamp: new Date(),
			relatedEvents,
			resolved: false,
			metadata: {
				...metadata,
				nsmClassification: NSMClassification.RESTRICTED,
				alertSource: "audit-service"
			}
		};

		this.alerts.push(alert);

		// Log critical alerts immediately
		if (severity === "CRITICAL" || severity === "HIGH") {
			logger.error(`🚨 SECURITY ALERT [${severity}]: ${title}`);
			logger.error(`Description: ${description}`);
			
			// TODO: Integrate with external alerting system (email, Slack, etc.)
			await this.sendRealTimeAlert(alert);
		}

		await this.writeAlertToLog(alert);
		return alert;
	}

	/**
	 * Get security alerts
	 */
	getSecurityAlerts(filters: {
		severity?: SecurityAlert["severity"];
		type?: SecurityAlert["type"];
		resolved?: boolean;
		startDate?: Date;
		endDate?: Date;
	} = {}): SecurityAlert[] {
		let filteredAlerts = [...this.alerts];

		if (filters.severity) {
			filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
		}

		if (filters.type) {
			filteredAlerts = filteredAlerts.filter(a => a.type === filters.type);
		}

		if (filters.resolved !== undefined) {
			filteredAlerts = filteredAlerts.filter(a => a.resolved === filters.resolved);
		}

		if (filters.startDate) {
			filteredAlerts = filteredAlerts.filter(a => a.timestamp >= filters.startDate!);
		}

		if (filters.endDate) {
			filteredAlerts = filteredAlerts.filter(a => a.timestamp <= filters.endDate!);
		}

		return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	}

	/**
	 * GDPR compliance: Delete user data
	 */
	async deleteUserData(userId: string, reason: string = "GDPR data erasure request"): Promise<void> {
		try {
			// Remove events for user
			const eventsToRemove = this.events.filter(e => e.userId === userId);
			
			// Log data deletion for audit trail
			await this.logEvent({
				eventId: randomBytes(16).toString("hex"),
				timestamp: new Date(),
				eventType: AuthEventType.SECURITY_ALERT,
				userId,
				sessionId: undefined,
				ipAddress: "SYSTEM",
				userAgent: "Audit Service",
				method: "GDPR" as any,
				success: true,
				nsmClassification: NSMClassification.CONFIDENTIAL,
				metadata: {
					action: "user_data_deletion",
					reason,
					eventsRemoved: eventsToRemove.length,
					gdprCompliant: true
				}
			});

			// Remove user events
			for (let i = this.events.length - 1; i >= 0; i--) {
				if (this.events[i].userId === userId) {
					this.events.splice(i, 1);
				}
			}

			// Remove user alerts
			for (let i = this.alerts.length - 1; i >= 0; i--) {
				if (this.alerts[i].userId === userId) {
					this.alerts.splice(i, 1);
				}
			}

			logger.info(`🗑️ GDPR deletion completed for user: ${userId}`);

		} catch (error) {
			logger.error(`Failed to delete user data for ${userId}:`, error);
			throw error;
		}
	}

	// Private methods

	private validateEvent(event: AuthenticationEvent): AuthenticationEvent {
		// Ensure required fields are present
		if (!event.eventId) {
			event.eventId = randomBytes(16).toString("hex");
		}

		if (!event.timestamp) {
			event.timestamp = new Date();
		}

		if (!event.nsmClassification) {
			event.nsmClassification = NSMClassification.OPEN;
		}

		// Validate NSM classification
		if (!Object.values(NSMClassification).includes(event.nsmClassification)) {
			event.nsmClassification = NSMClassification.OPEN;
		}

		return event;
	}

	private applySensitiveDataFiltering(event: AuthenticationEvent): AuthenticationEvent {
		const filteredEvent = { ...event };

		// Remove or hash sensitive data based on configuration
		for (const sensitiveField of this.config.sensitiveFields) {
			if (filteredEvent.metadata && filteredEvent.metadata[sensitiveField]) {
				// Hash sensitive data instead of removing it completely
				filteredEvent.metadata[sensitiveField] = this.hashSensitiveData(
					filteredEvent.metadata[sensitiveField]
				);
			}
		}

		// Ensure IP addresses are anonymized for GDPR compliance if required
		if (this.config.enableGDPRCompliance) {
			filteredEvent.ipAddress = this.anonymizeIPAddress(filteredEvent.ipAddress);
		}

		return filteredEvent;
	}

	private async checkForSecurityAlerts(event: AuthenticationEvent): Promise<void> {
		// Check for failed login attempts
		if (event.eventType === AuthEventType.LOGIN_FAILURE && event.userId) {
			await this.checkFailedLoginAttempts(event);
		}

		// Check for permission violations
		if (event.eventType === AuthEventType.PERMISSION_DENIED) {
			await this.checkPermissionViolations(event);
		}

		// Check for suspicious activity patterns
		await this.checkSuspiciousActivity(event);
	}

	private async checkFailedLoginAttempts(event: AuthenticationEvent): Promise<void> {
		const key = `failed_login:${event.ipAddress}`;
		const now = Date.now();
		const window = this.config.alertWindow * 1000; // Convert to milliseconds

		// Get or create threshold tracker
		let tracker = this.alertThresholds.get(key);
		if (!tracker || (now - tracker.timestamp) > window) {
			tracker = { count: 0, timestamp: now };
		}

		tracker.count++;
		this.alertThresholds.set(key, tracker);

		// Generate alert if threshold exceeded
		if (tracker.count >= this.config.alertThreshold) {
			await this.generateSecurityAlert(
				"FAILED_LOGIN_ATTEMPTS",
				"HIGH",
				`Multiple failed login attempts from ${event.ipAddress}`,
				`${tracker.count} failed login attempts detected within ${this.config.alertWindow} minutes`,
				[event.eventId],
				{
					ipAddress: event.ipAddress,
					attemptCount: tracker.count,
					windowMinutes: this.config.alertWindow
				}
			);

			// Reset counter after alert
			this.alertThresholds.delete(key);
		}
	}

	private async checkPermissionViolations(event: AuthenticationEvent): Promise<void> {
		if (event.userId) {
			await this.generateSecurityAlert(
				"PERMISSION_VIOLATION",
				"MEDIUM",
				`Permission denied for user ${event.userId}`,
				`User attempted to access resource without sufficient permissions`,
				[event.eventId],
				{
					userId: event.userId,
					requiredPermission: event.metadata?.permission,
					resource: event.metadata?.resource
				}
			);
		}
	}

	private async checkSuspiciousActivity(event: AuthenticationEvent): Promise<void> {
		// Check for unusual IP addresses for user
		if (event.userId && event.ipAddress !== "CLI") {
			const recentEvents = this.events
				.filter(e => 
					e.userId === event.userId && 
					e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) && // Last 24 hours
					e.ipAddress !== event.ipAddress
				);

			if (recentEvents.length === 0 && this.events.filter(e => e.userId === event.userId).length > 5) {
				await this.generateSecurityAlert(
					"SUSPICIOUS_ACTIVITY",
					"MEDIUM",
					`New IP address for user ${event.userId}`,
					`User is accessing from a new IP address: ${event.ipAddress}`,
					[event.eventId],
					{
						userId: event.userId,
						newIpAddress: event.ipAddress,
						previousIpAddresses: recentEvents.map(e => e.ipAddress)
					}
				);
			}
		}
	}

	private async monitorCompliance(event: AuthenticationEvent): Promise<void> {
		// Monitor NSM classification compliance
		if (event.nsmClassification === NSMClassification.SECRET && !event.metadata?.nsmCompliant) {
			logger.warn(`⚠️ Potential NSM compliance issue: SECRET classification without compliance flag`);
		}

		// Monitor GDPR compliance
		if (event.userId && !this.config.enableGDPRCompliance) {
			logger.warn(`⚠️ GDPR compliance disabled but user data is being processed`);
		}
	}

	private generateSummary(events: AuthenticationEvent[]): AuditReport["summary"] {
		const summary = {
			totalEvents: events.length,
			successfulEvents: events.filter(e => e.success).length,
			failedEvents: events.filter(e => !e.success).length,
			uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
			eventsByType: {} as Record<string, number>,
			securityAlerts: this.alerts.length,
			complianceIssues: 0
		};

		// Count events by type
		for (const event of events) {
			summary.eventsByType[event.eventType] = (summary.eventsByType[event.eventType] || 0) + 1;
		}

		return summary;
	}

	private async analyzeCompliance(events: AuthenticationEvent[]): Promise<AuditReport["compliance"]> {
		const issues: string[] = [];

		// Check GDPR compliance
		const gdprCompliant = this.config.enableGDPRCompliance;
		if (!gdprCompliant) {
			issues.push("GDPR compliance is disabled");
		}

		// Check NSM compliance
		const nsmCompliant = events.every(e => 
			Object.values(NSMClassification).includes(e.nsmClassification)
		);
		if (!nsmCompliant) {
			issues.push("Invalid NSM classifications found");
		}

		// Check data retention compliance
		const oldestEvent = events.reduce((oldest, event) => 
			event.timestamp < oldest.timestamp ? event : oldest, 
			events[0]
		);

		const dataRetentionCompliant = !oldestEvent || 
			(Date.now() - oldestEvent.timestamp.getTime()) <= (this.config.retentionPeriod * 24 * 60 * 60 * 1000);

		if (!dataRetentionCompliant) {
			issues.push("Events older than retention period found");
		}

		return {
			gdprCompliant,
			nsmCompliant,
			dataRetentionCompliant,
			issues
		};
	}

	private async generateRecommendations(
		events: AuthenticationEvent[], 
		summary: AuditReport["summary"]
	): Promise<string[]> {
		const recommendations: string[] = [];

		// Security recommendations
		if (summary.failedEvents > summary.successfulEvents * 0.1) {
			recommendations.push("High failure rate detected. Consider implementing additional security measures.");
		}

		if (this.alerts.filter(a => !a.resolved).length > 0) {
			recommendations.push("Unresolved security alerts detected. Review and address immediately.");
		}

		// Compliance recommendations
		if (!this.config.enableGDPRCompliance) {
			recommendations.push("Enable GDPR compliance features for EU data protection compliance.");
		}

		if (!this.config.enableNSMCompliance) {
			recommendations.push("Enable NSM compliance features for Norwegian government security standards.");
		}

		// Operational recommendations
		if (events.length > 10000) {
			recommendations.push("Large number of events detected. Consider implementing log rotation and archiving.");
		}

		return recommendations;
	}

	private sanitizeEventForReport(event: AuthenticationEvent): any {
		// Remove sensitive data from report events
		const sanitized = { ...event };
		
		// Remove direct sensitive fields
		for (const field of this.config.sensitiveFields) {
			if (sanitized.metadata && sanitized.metadata[field]) {
				sanitized.metadata[field] = "[REDACTED]";
			}
		}

		return sanitized;
	}

	private determineReportClassification(events: AuthenticationEvent[]): NSMClassification {
		// Determine the highest classification level in the events
		const classifications = events.map(e => e.nsmClassification);
		
		if (classifications.includes(NSMClassification.SECRET)) return NSMClassification.SECRET;
		if (classifications.includes(NSMClassification.CONFIDENTIAL)) return NSMClassification.CONFIDENTIAL;
		if (classifications.includes(NSMClassification.RESTRICTED)) return NSMClassification.RESTRICTED;
		return NSMClassification.OPEN;
	}

	private getLogPath(): string {
		if (this.config.logPath) {
			return this.config.logPath;
		}
		return join(homedir(), ".xaheen", "audit.log");
	}

	private async initializeLogFile(): Promise<void> {
		try {
			// Ensure directory exists
			await fs.mkdir(dirname(this.logPath), { recursive: true });

			// Open log file for appending
			this.logFileHandle = await fs.open(this.logPath, "a");

		} catch (error) {
			logger.error("Failed to initialize audit log file:", error);
		}
	}

	private async writeToLogFile(event: AuthenticationEvent): Promise<void> {
		if (!this.logFileHandle) {
			return;
		}

		try {
			const logEntry = this.formatLogEntry(event);
			await this.logFileHandle.appendFile(logEntry + "\n");

		} catch (error) {
			logger.error("Failed to write to audit log file:", error);
		}
	}

	private async writeAlertToLog(alert: SecurityAlert): Promise<void> {
		if (!this.logFileHandle) {
			return;
		}

		try {
			const logEntry = this.formatAlertLogEntry(alert);
			await this.logFileHandle.appendFile(logEntry + "\n");

		} catch (error) {
			logger.error("Failed to write alert to log file:", error);
		}
	}

	private formatLogEntry(event: AuthenticationEvent): string {
		if (this.config.logFormat === "json") {
			return JSON.stringify({
				timestamp: event.timestamp.toISOString(),
				level: event.success ? "INFO" : "WARN",
				type: "AUDIT_EVENT",
				eventId: event.eventId,
				eventType: event.eventType,
				userId: event.userId,
				sessionId: event.sessionId,
				ipAddress: event.ipAddress,
				success: event.success,
				nsmClassification: event.nsmClassification,
				metadata: event.metadata
			});
		} else {
			return `${event.timestamp.toISOString()} [${event.success ? "INFO" : "WARN"}] AUDIT_EVENT ${event.eventType} user=${event.userId} ip=${event.ipAddress} success=${event.success} nsm=${event.nsmClassification}`;
		}
	}

	private formatAlertLogEntry(alert: SecurityAlert): string {
		if (this.config.logFormat === "json") {
			return JSON.stringify({
				timestamp: alert.timestamp.toISOString(),
				level: "ERROR",
				type: "SECURITY_ALERT",
				alertId: alert.alertId,
				severity: alert.severity,
				alertType: alert.type,
				title: alert.title,
				userId: alert.userId,
				ipAddress: alert.ipAddress,
				resolved: alert.resolved,
				metadata: alert.metadata
			});
		} else {
			return `${alert.timestamp.toISOString()} [ERROR] SECURITY_ALERT ${alert.type} severity=${alert.severity} title="${alert.title}" user=${alert.userId} ip=${alert.ipAddress}`;
		}
	}

	private hashSensitiveData(data: any): string {
		return createHash("sha256").update(String(data)).digest("hex").substring(0, 16);
	}

	private anonymizeIPAddress(ipAddress: string): string {
		// Simple IP anonymization for GDPR compliance
		const parts = ipAddress.split(".");
		if (parts.length === 4) {
			return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
		}
		return "xxx.xxx.xxx.xxx";
	}

	private async sendRealTimeAlert(alert: SecurityAlert): Promise<void> {
		// TODO: Implement real-time alerting (email, Slack, webhooks, etc.)
		logger.error(`🚨 REAL-TIME ALERT: ${alert.title}`);
	}

	private startRetentionCleanup(): void {
		// Clean up old events daily
		setInterval(async () => {
			await this.cleanupOldEvents();
		}, 24 * 60 * 60 * 1000); // 24 hours
	}

	private async cleanupOldEvents(): Promise<void> {
		const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
		
		// Remove old events
		const initialCount = this.events.length;
		for (let i = this.events.length - 1; i >= 0; i--) {
			if (this.events[i].timestamp < cutoffDate) {
				this.events.splice(i, 1);
			}
		}

		// Remove old alerts
		for (let i = this.alerts.length - 1; i >= 0; i--) {
			if (this.alerts[i].timestamp < cutoffDate && this.alerts[i].resolved) {
				this.alerts.splice(i, 1);
			}
		}

		const removedCount = initialCount - this.events.length;
		if (removedCount > 0) {
			logger.info(`🧹 Cleaned up ${removedCount} old audit events (retention: ${this.config.retentionPeriod} days)`);
		}
	}

	private generateReportId(): string {
		return `audit_${Date.now()}_${randomBytes(8).toString("hex")}`;
	}

	private generateAlertId(): string {
		return `alert_${Date.now()}_${randomBytes(8).toString("hex")}`;
	}

	/**
	 * Shutdown audit service
	 */
	async shutdown(): Promise<void> {
		if (this.logFileHandle) {
			await this.logFileHandle.close();
		}

		logger.info("Audit service shutdown completed");
	}
}
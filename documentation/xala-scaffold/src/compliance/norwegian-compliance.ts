/**
 * Norwegian Compliance System
 *
 * Comprehensive compliance framework ensuring adherence to:
 * - NSM (Nasjonal sikkerhetsmyndighet) security standards
 * - GDPR (General Data Protection Regulation) requirements
 * - WCAG AAA accessibility guidelines
 * - Norwegian government digital service standards
 * - Data localization and sovereignty requirements
 *
 * Features:
 * - Automated compliance checking
 * - Code generation with compliance enforcement
 * - Audit trail generation
 * - Multi-language support (Norwegian Bokmål, Nynorsk, English, Arabic, French)
 * - Security classification handling
 * - Privacy impact assessments
 */

import { LocaleCode } from "../localization/types.js";
import { logger } from "../utils/logger.js";

// === NSM Security Classification ===

/**
 * NSM security classification levels
 * Based on Norwegian National Security Authority standards
 */
export enum NSMClassification {
	OPEN = "OPEN",
	RESTRICTED = "RESTRICTED",
	CONFIDENTIAL = "CONFIDENTIAL",
	SECRET = "SECRET",
}

/**
 * NSM security requirements per classification level
 */
export interface NSMSecurityRequirements {
	classification: NSMClassification;
	requiresAuthentication: boolean;
	requiresAuthorization: boolean;
	requiresEncryption: boolean;
	requiresAuditLogging: boolean;
	requiresDataLocalization: boolean;
	retentionPeriodMonths: number;
	allowedLocations: string[];
	requiredSecurityHeaders: string[];
	minimumPasswordComplexity?: PasswordComplexity;
}

/**
 * Password complexity requirements
 */
export interface PasswordComplexity {
	minLength: number;
	requireUppercase: boolean;
	requireLowercase: boolean;
	requireNumbers: boolean;
	requireSpecialChars: boolean;
	maxAge: number; // days
	preventReuse: number; // number of previous passwords
}

// === GDPR Compliance ===

/**
 * GDPR data categories
 */
export enum GDPRDataCategory {
	PERSONAL = "personal",
	SENSITIVE = "sensitive",
	PUBLIC = "public",
	ANONYMOUS = "anonymous",
}

/**
 * GDPR legal basis for processing
 */
export enum GDPRLegalBasis {
	CONSENT = "consent",
	CONTRACT = "contract",
	LEGAL_OBLIGATION = "legal_obligation",
	VITAL_INTERESTS = "vital_interests",
	PUBLIC_TASK = "public_task",
	LEGITIMATE_INTERESTS = "legitimate_interests",
}

/**
 * GDPR compliance requirements
 */
export interface GDPRRequirements {
	dataCategory: GDPRDataCategory;
	legalBasis: GDPRLegalBasis;
	requiresConsent: boolean;
	requiresDataMinimization: boolean;
	requiresPurposeLimitation: boolean;
	retentionPeriodMonths: number;
	requiresRightToErasure: boolean;
	requiresDataPortability: boolean;
	requiresPrivacyByDesign: boolean;
	allowedCountries: string[];
	requiresDPIA: boolean; // Data Protection Impact Assessment
}

// === WCAG Accessibility ===

/**
 * WCAG conformance levels
 */
export enum WCAGLevel {
	A = "A",
	AA = "AA",
	AAA = "AAA",
}

/**
 * WCAG accessibility requirements
 */
export interface WCAGRequirements {
	level: WCAGLevel;
	requiresAltText: boolean;
	requiresKeyboardNavigation: boolean;
	requiresScreenReaderSupport: boolean;
	requiresColorContrastCompliance: boolean;
	requiresFocusIndicators: boolean;
	requiresSemanticHTML: boolean;
	requiresARIALabels: boolean;
	requiresLanguageDeclaration: boolean;
	requiresResizeSupport: boolean;
	requiresMotionReducedSupport: boolean;
	minimumContrastRatio: number;
}

// === Norwegian Digital Service Standards ===

/**
 * Norwegian government service requirements
 */
export interface NorwegianServiceRequirements {
	requiresIDPorten: boolean;
	requiresAltinn: boolean;
	requiresBankID: boolean;
	requiresDigitalMailbox: boolean;
	requiresEnhetsregisteret: boolean;
	supportedLanguages: LocaleCode[];
	requiresUniversalDesign: boolean;
	requiresDigitalByDefault: boolean;
	requiresOnceOnly: boolean; // Tell us once principle
}

// === Comprehensive Compliance Configuration ===

/**
 * Complete Norwegian compliance configuration
 */
export interface NorwegianComplianceConfig {
	project: {
		name: string;
		description: string;
		owner: string;
		dataController: string;
		privacyOfficer: string;
		securityOfficer: string;
	};
	nsm: NSMSecurityRequirements;
	gdpr: GDPRRequirements;
	wcag: WCAGRequirements;
	digitalService: NorwegianServiceRequirements;
	localization: {
		defaultLocale: LocaleCode;
		supportedLocales: LocaleCode[];
		requiresRTL: boolean;
		requiresPluralization: boolean;
	};
	audit: {
		enabled: boolean;
		logLevel: "basic" | "detailed" | "comprehensive";
		retentionDays: number;
		encryptLogs: boolean;
	};
}

// === Compliance Checker ===

/**
 * Compliance check result
 */
export interface ComplianceCheckResult {
	isCompliant: boolean;
	classification: NSMClassification;
	issues: ComplianceIssue[];
	warnings: ComplianceWarning[];
	recommendations: ComplianceRecommendation[];
	auditInfo: AuditInfo;
}

/**
 * Compliance issue (must fix)
 */
export interface ComplianceIssue {
	category: "nsm" | "gdpr" | "wcag" | "service";
	severity: "critical" | "high" | "medium";
	code: string;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	fix?: ComplianceFix;
}

/**
 * Compliance warning (should fix)
 */
export interface ComplianceWarning {
	category: "nsm" | "gdpr" | "wcag" | "service";
	code: string;
	message: string;
	file?: string;
	line?: number;
	column?: number;
	suggestion?: string;
}

/**
 * Compliance recommendation (good practice)
 */
export interface ComplianceRecommendation {
	category: "nsm" | "gdpr" | "wcag" | "service";
	message: string;
	benefit: string;
	effort: "low" | "medium" | "high";
	priority: "low" | "medium" | "high";
}

/**
 * Compliance fix suggestion
 */
export interface ComplianceFix {
	description: string;
	code?: string;
	automatic: boolean;
	confidence: number; // 0-1
}

/**
 * Audit information
 */
export interface AuditInfo {
	timestamp: string;
	checkId: string;
	version: string;
	duration: number;
	filesChecked: number;
	rulesApplied: string[];
}

// === Norwegian Compliance Checker ===

/**
 * Main Norwegian compliance checker
 * Validates code and configurations against all Norwegian standards
 */
export class NorwegianComplianceChecker {
	private config: NorwegianComplianceConfig;
	private rules: Map<string, ComplianceRule> = new Map();

	constructor(config: NorwegianComplianceConfig) {
		this.config = config;
		this.initializeRules();
	}

	/**
	 * Check compliance for code files
	 */
	async checkCompliance(
		files: Map<string, string>,
		options?: {
			skipNSM?: boolean;
			skipGDPR?: boolean;
			skipWCAG?: boolean;
			skipService?: boolean;
		},
	): Promise<ComplianceCheckResult> {
		const startTime = performance.now();
		const checkId = `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		logger.info(`Starting Norwegian compliance check: ${checkId}`);

		const issues: ComplianceIssue[] = [];
		const warnings: ComplianceWarning[] = [];
		const recommendations: ComplianceRecommendation[] = [];
		const appliedRules: string[] = [];

		try {
			// NSM Security checks
			if (!options?.skipNSM) {
				const nsmResults = await this.checkNSMCompliance(files);
				issues.push(...nsmResults.issues);
				warnings.push(...nsmResults.warnings);
				recommendations.push(...nsmResults.recommendations);
				appliedRules.push(...nsmResults.rulesApplied);
			}

			// GDPR checks
			if (!options?.skipGDPR) {
				const gdprResults = await this.checkGDPRCompliance(files);
				issues.push(...gdprResults.issues);
				warnings.push(...gdprResults.warnings);
				recommendations.push(...gdprResults.recommendations);
				appliedRules.push(...gdprResults.rulesApplied);
			}

			// WCAG Accessibility checks
			if (!options?.skipWCAG) {
				const wcagResults = await this.checkWCAGCompliance(files);
				issues.push(...wcagResults.issues);
				warnings.push(...wcagResults.warnings);
				recommendations.push(...wcagResults.recommendations);
				appliedRules.push(...wcagResults.rulesApplied);
			}

			// Norwegian Digital Service checks
			if (!options?.skipService) {
				const serviceResults = await this.checkServiceCompliance(files);
				issues.push(...serviceResults.issues);
				warnings.push(...serviceResults.warnings);
				recommendations.push(...serviceResults.recommendations);
				appliedRules.push(...serviceResults.rulesApplied);
			}

			const duration = performance.now() - startTime;
			const isCompliant =
				issues.filter((i) => i.severity === "critical").length === 0;

			const result: ComplianceCheckResult = {
				isCompliant,
				classification: this.config.nsm.classification,
				issues,
				warnings,
				recommendations,
				auditInfo: {
					timestamp: new Date().toISOString(),
					checkId,
					version: "1.0.0",
					duration,
					filesChecked: files.size,
					rulesApplied: appliedRules,
				},
			};

			// Log audit information
			await this.logAuditInfo(result);

			logger.info(
				`Compliance check completed: ${checkId} (${duration.toFixed(2)}ms)`,
			);

			return result;
		} catch (error) {
			logger.error(`Compliance check failed: ${checkId}:`, error);
			throw error;
		}
	}

	/**
	 * Generate compliance report
	 */
	async generateComplianceReport(
		result: ComplianceCheckResult,
		format: "json" | "html" | "pdf" = "json",
	): Promise<string> {
		switch (format) {
			case "json":
				return this.generateJSONReport(result);
			case "html":
				return this.generateHTMLReport(result);
			case "pdf":
				return this.generatePDFReport(result);
			default:
				throw new Error(`Unsupported report format: ${format}`);
		}
	}

	/**
	 * Get compliance requirements for a given classification
	 */
	getComplianceRequirements(classification: NSMClassification): {
		nsm: NSMSecurityRequirements;
		gdpr: GDPRRequirements;
		wcag: WCAGRequirements;
	} {
		return {
			nsm: this.getNSMRequirements(classification),
			gdpr: this.getGDPRRequirements(classification),
			wcag: this.getWCAGRequirements(classification),
		};
	}

	/**
	 * Validate compliance configuration
	 */
	validateConfiguration(): {
		isValid: boolean;
		errors: string[];
		warnings: string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Validate NSM configuration
		if (
			!Object.values(NSMClassification).includes(this.config.nsm.classification)
		) {
			errors.push("Invalid NSM classification");
		}

		// Validate GDPR configuration
		if (
			!Object.values(GDPRDataCategory).includes(this.config.gdpr.dataCategory)
		) {
			errors.push("Invalid GDPR data category");
		}

		if (!Object.values(GDPRLegalBasis).includes(this.config.gdpr.legalBasis)) {
			errors.push("Invalid GDPR legal basis");
		}

		// Validate WCAG configuration
		if (!Object.values(WCAGLevel).includes(this.config.wcag.level)) {
			errors.push("Invalid WCAG level");
		}

		// Validate localization
		if (
			!this.config.localization.supportedLocales.includes(
				this.config.localization.defaultLocale,
			)
		) {
			errors.push("Default locale not in supported locales");
		}

		// Check for Norwegian language support
		const hasNorwegian = this.config.localization.supportedLocales.some(
			(locale) => locale.startsWith("nb-") || locale.startsWith("nn-"),
		);

		if (!hasNorwegian) {
			warnings.push("No Norwegian language support configured");
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}

	// Private methods

	private initializeRules(): void {
		// Initialize compliance rules
		this.addNSMRules();
		this.addGDPRRules();
		this.addWCAGRules();
		this.addServiceRules();

		logger.debug(`Initialized ${this.rules.size} compliance rules`);
	}

	private addNSMRules(): void {
		// NSM Security Rules
		this.rules.set("nsm-001", {
			id: "nsm-001",
			category: "nsm",
			name: "Security Headers Required",
			description: "Required security headers must be present",
			severity: "high",
			check: this.checkSecurityHeaders.bind(this),
		});

		this.rules.set("nsm-002", {
			id: "nsm-002",
			category: "nsm",
			name: "Authentication Required",
			description: "Authentication must be enforced for restricted content",
			severity: "critical",
			check: this.checkAuthentication.bind(this),
		});

		this.rules.set("nsm-003", {
			id: "nsm-003",
			category: "nsm",
			name: "Audit Logging Required",
			description: "Security events must be logged for audit purposes",
			severity: "high",
			check: this.checkAuditLogging.bind(this),
		});

		this.rules.set("nsm-004", {
			id: "nsm-004",
			category: "nsm",
			name: "Data Encryption Required",
			description: "Sensitive data must be encrypted in transit and at rest",
			severity: "critical",
			check: this.checkDataEncryption.bind(this),
		});
	}

	private addGDPRRules(): void {
		// GDPR Rules
		this.rules.set("gdpr-001", {
			id: "gdpr-001",
			category: "gdpr",
			name: "Consent Management Required",
			description: "User consent must be obtained for personal data processing",
			severity: "critical",
			check: this.checkConsentManagement.bind(this),
		});

		this.rules.set("gdpr-002", {
			id: "gdpr-002",
			category: "gdpr",
			name: "Data Minimization Required",
			description: "Only necessary personal data should be collected",
			severity: "high",
			check: this.checkDataMinimization.bind(this),
		});

		this.rules.set("gdpr-003", {
			id: "gdpr-003",
			category: "gdpr",
			name: "Right to Erasure Support",
			description: "Users must be able to delete their personal data",
			severity: "high",
			check: this.checkRightToErasure.bind(this),
		});

		this.rules.set("gdpr-004", {
			id: "gdpr-004",
			category: "gdpr",
			name: "Privacy by Design",
			description: "Privacy must be built into the system architecture",
			severity: "medium",
			check: this.checkPrivacyByDesign.bind(this),
		});
	}

	private addWCAGRules(): void {
		// WCAG Accessibility Rules
		this.rules.set("wcag-001", {
			id: "wcag-001",
			category: "wcag",
			name: "Alt Text Required",
			description: "All images must have alternative text",
			severity: "high",
			check: this.checkAltText.bind(this),
		});

		this.rules.set("wcag-002", {
			id: "wcag-002",
			category: "wcag",
			name: "Keyboard Navigation Required",
			description: "All interactive elements must be keyboard accessible",
			severity: "high",
			check: this.checkKeyboardNavigation.bind(this),
		});

		this.rules.set("wcag-003", {
			id: "wcag-003",
			category: "wcag",
			name: "Color Contrast Compliance",
			description: "Text must meet minimum contrast ratio requirements",
			severity: "high",
			check: this.checkColorContrast.bind(this),
		});

		this.rules.set("wcag-004", {
			id: "wcag-004",
			category: "wcag",
			name: "ARIA Labels Required",
			description: "Interactive elements must have proper ARIA labeling",
			severity: "medium",
			check: this.checkARIALabels.bind(this),
		});
	}

	private addServiceRules(): void {
		// Norwegian Digital Service Rules
		this.rules.set("service-001", {
			id: "service-001",
			category: "service",
			name: "Norwegian Language Support",
			description: "Services must support Norwegian Bokmål",
			severity: "high",
			check: this.checkNorwegianLanguage.bind(this),
		});

		this.rules.set("service-002", {
			id: "service-002",
			category: "service",
			name: "Universal Design Compliance",
			description: "Interface must follow universal design principles",
			severity: "medium",
			check: this.checkUniversalDesign.bind(this),
		});
	}

	// Compliance check implementations

	private async checkNSMCompliance(files: Map<string, string>): Promise<{
		issues: ComplianceIssue[];
		warnings: ComplianceWarning[];
		recommendations: ComplianceRecommendation[];
		rulesApplied: string[];
	}> {
		const issues: ComplianceIssue[] = [];
		const warnings: ComplianceWarning[] = [];
		const recommendations: ComplianceRecommendation[] = [];
		const rulesApplied: string[] = [];

		// Apply NSM rules
		for (const [ruleId, rule] of this.rules) {
			if (rule.category === "nsm") {
				const result = await rule.check(files);
				if (result) {
					if (result.issues) issues.push(...result.issues);
					if (result.warnings) warnings.push(...result.warnings);
					if (result.recommendations)
						recommendations.push(...result.recommendations);
					rulesApplied.push(ruleId);
				}
			}
		}

		return { issues, warnings, recommendations, rulesApplied };
	}

	private async checkGDPRCompliance(files: Map<string, string>): Promise<{
		issues: ComplianceIssue[];
		warnings: ComplianceWarning[];
		recommendations: ComplianceRecommendation[];
		rulesApplied: string[];
	}> {
		const issues: ComplianceIssue[] = [];
		const warnings: ComplianceWarning[] = [];
		const recommendations: ComplianceRecommendation[] = [];
		const rulesApplied: string[] = [];

		// Apply GDPR rules
		for (const [ruleId, rule] of this.rules) {
			if (rule.category === "gdpr") {
				const result = await rule.check(files);
				if (result) {
					if (result.issues) issues.push(...result.issues);
					if (result.warnings) warnings.push(...result.warnings);
					if (result.recommendations)
						recommendations.push(...result.recommendations);
					rulesApplied.push(ruleId);
				}
			}
		}

		return { issues, warnings, recommendations, rulesApplied };
	}

	private async checkWCAGCompliance(files: Map<string, string>): Promise<{
		issues: ComplianceIssue[];
		warnings: ComplianceWarning[];
		recommendations: ComplianceRecommendation[];
		rulesApplied: string[];
	}> {
		const issues: ComplianceIssue[] = [];
		const warnings: ComplianceWarning[] = [];
		const recommendations: ComplianceRecommendation[] = [];
		const rulesApplied: string[] = [];

		// Apply WCAG rules
		for (const [ruleId, rule] of this.rules) {
			if (rule.category === "wcag") {
				const result = await rule.check(files);
				if (result) {
					if (result.issues) issues.push(...result.issues);
					if (result.warnings) warnings.push(...result.warnings);
					if (result.recommendations)
						recommendations.push(...result.recommendations);
					rulesApplied.push(ruleId);
				}
			}
		}

		return { issues, warnings, recommendations, rulesApplied };
	}

	private async checkServiceCompliance(files: Map<string, string>): Promise<{
		issues: ComplianceIssue[];
		warnings: ComplianceWarning[];
		recommendations: ComplianceRecommendation[];
		rulesApplied: string[];
	}> {
		const issues: ComplianceIssue[] = [];
		const warnings: ComplianceWarning[] = [];
		const recommendations: ComplianceRecommendation[] = [];
		const rulesApplied: string[] = [];

		// Apply service rules
		for (const [ruleId, rule] of this.rules) {
			if (rule.category === "service") {
				const result = await rule.check(files);
				if (result) {
					if (result.issues) issues.push(...result.issues);
					if (result.warnings) warnings.push(...result.warnings);
					if (result.recommendations)
						recommendations.push(...result.recommendations);
					rulesApplied.push(ruleId);
				}
			}
		}

		return { issues, warnings, recommendations, rulesApplied };
	}

	// Rule implementation methods (simplified for brevity)

	private async checkSecurityHeaders(files: Map<string, string>): Promise<any> {
		// Implementation would check for security headers in configuration files
		return null;
	}

	private async checkAuthentication(files: Map<string, string>): Promise<any> {
		// Implementation would check for authentication mechanisms
		return null;
	}

	private async checkAuditLogging(files: Map<string, string>): Promise<any> {
		// Implementation would check for audit logging setup
		return null;
	}

	private async checkDataEncryption(files: Map<string, string>): Promise<any> {
		// Implementation would check for encryption usage
		return null;
	}

	private async checkConsentManagement(
		files: Map<string, string>,
	): Promise<any> {
		// Implementation would check for consent management
		return null;
	}

	private async checkDataMinimization(
		files: Map<string, string>,
	): Promise<any> {
		// Implementation would check for data minimization practices
		return null;
	}

	private async checkRightToErasure(files: Map<string, string>): Promise<any> {
		// Implementation would check for data deletion capabilities
		return null;
	}

	private async checkPrivacyByDesign(files: Map<string, string>): Promise<any> {
		// Implementation would check for privacy-by-design patterns
		return null;
	}

	private async checkAltText(files: Map<string, string>): Promise<any> {
		// Implementation would check for alt text on images
		return null;
	}

	private async checkKeyboardNavigation(
		files: Map<string, string>,
	): Promise<any> {
		// Implementation would check for keyboard accessibility
		return null;
	}

	private async checkColorContrast(files: Map<string, string>): Promise<any> {
		// Implementation would check color contrast ratios
		return null;
	}

	private async checkARIALabels(files: Map<string, string>): Promise<any> {
		// Implementation would check for ARIA labels
		return null;
	}

	private async checkNorwegianLanguage(
		files: Map<string, string>,
	): Promise<any> {
		// Implementation would check for Norwegian language support
		return null;
	}

	private async checkUniversalDesign(files: Map<string, string>): Promise<any> {
		// Implementation would check for universal design principles
		return null;
	}

	// Helper methods

	private getNSMRequirements(
		classification: NSMClassification,
	): NSMSecurityRequirements {
		const baseRequirements: NSMSecurityRequirements = {
			classification,
			requiresAuthentication: false,
			requiresAuthorization: false,
			requiresEncryption: false,
			requiresAuditLogging: false,
			requiresDataLocalization: false,
			retentionPeriodMonths: 12,
			allowedLocations: ["NO", "EU"],
			requiredSecurityHeaders: ["X-Frame-Options", "X-Content-Type-Options"],
		};

		switch (classification) {
			case NSMClassification.RESTRICTED:
				return {
					...baseRequirements,
					requiresAuthentication: true,
					requiresAuthorization: true,
					requiresAuditLogging: true,
					retentionPeriodMonths: 24,
					requiredSecurityHeaders: [
						...baseRequirements.requiredSecurityHeaders,
						"Strict-Transport-Security",
						"Content-Security-Policy",
					],
				};

			case NSMClassification.CONFIDENTIAL:
				return {
					...baseRequirements,
					requiresAuthentication: true,
					requiresAuthorization: true,
					requiresEncryption: true,
					requiresAuditLogging: true,
					requiresDataLocalization: true,
					retentionPeriodMonths: 60,
					allowedLocations: ["NO"],
					requiredSecurityHeaders: [
						...baseRequirements.requiredSecurityHeaders,
						"Strict-Transport-Security",
						"Content-Security-Policy",
						"Referrer-Policy",
					],
					minimumPasswordComplexity: {
						minLength: 12,
						requireUppercase: true,
						requireLowercase: true,
						requireNumbers: true,
						requireSpecialChars: true,
						maxAge: 90,
						preventReuse: 12,
					},
				};

			case NSMClassification.SECRET:
				return {
					...baseRequirements,
					requiresAuthentication: true,
					requiresAuthorization: true,
					requiresEncryption: true,
					requiresAuditLogging: true,
					requiresDataLocalization: true,
					retentionPeriodMonths: 120,
					allowedLocations: ["NO"],
					requiredSecurityHeaders: [
						...baseRequirements.requiredSecurityHeaders,
						"Strict-Transport-Security",
						"Content-Security-Policy",
						"Referrer-Policy",
						"Permissions-Policy",
					],
					minimumPasswordComplexity: {
						minLength: 16,
						requireUppercase: true,
						requireLowercase: true,
						requireNumbers: true,
						requireSpecialChars: true,
						maxAge: 30,
						preventReuse: 24,
					},
				};

			default:
				return baseRequirements;
		}
	}

	private getGDPRRequirements(
		classification: NSMClassification,
	): GDPRRequirements {
		return {
			dataCategory:
				classification === NSMClassification.OPEN
					? GDPRDataCategory.PUBLIC
					: GDPRDataCategory.PERSONAL,
			legalBasis: GDPRLegalBasis.CONSENT,
			requiresConsent: classification !== NSMClassification.OPEN,
			requiresDataMinimization: true,
			requiresPurposeLimitation: true,
			retentionPeriodMonths:
				classification === NSMClassification.OPEN ? 12 : 24,
			requiresRightToErasure: classification !== NSMClassification.OPEN,
			requiresDataPortability: classification !== NSMClassification.OPEN,
			requiresPrivacyByDesign: true,
			allowedCountries: ["NO", "EU"],
			requiresDPIA:
				classification === NSMClassification.CONFIDENTIAL ||
				classification === NSMClassification.SECRET,
		};
	}

	private getWCAGRequirements(
		classification: NSMClassification,
	): WCAGRequirements {
		return {
			level: WCAGLevel.AAA,
			requiresAltText: true,
			requiresKeyboardNavigation: true,
			requiresScreenReaderSupport: true,
			requiresColorContrastCompliance: true,
			requiresFocusIndicators: true,
			requiresSemanticHTML: true,
			requiresARIALabels: true,
			requiresLanguageDeclaration: true,
			requiresResizeSupport: true,
			requiresMotionReducedSupport: true,
			minimumContrastRatio: 7.0, // AAA level
		};
	}

	private async logAuditInfo(result: ComplianceCheckResult): Promise<void> {
		if (!this.config.audit.enabled) {
			return;
		}

		const auditEntry = {
			timestamp: result.auditInfo.timestamp,
			checkId: result.auditInfo.checkId,
			project: this.config.project.name,
			classification: result.classification,
			isCompliant: result.isCompliant,
			criticalIssues: result.issues.filter((i) => i.severity === "critical")
				.length,
			highIssues: result.issues.filter((i) => i.severity === "high").length,
			warnings: result.warnings.length,
			filesChecked: result.auditInfo.filesChecked,
			duration: result.auditInfo.duration,
			version: result.auditInfo.version,
		};

		logger.info("Norwegian compliance audit:", auditEntry);
	}

	private generateJSONReport(result: ComplianceCheckResult): string {
		return JSON.stringify(result, null, 2);
	}

	private generateHTMLReport(result: ComplianceCheckResult): string {
		// HTML report generation would be implemented here
		return `<html><body><h1>Norwegian Compliance Report</h1><pre>${this.generateJSONReport(result)}</pre></body></html>`;
	}

	private generatePDFReport(result: ComplianceCheckResult): string {
		// PDF report generation would be implemented here
		throw new Error("PDF report generation not yet implemented");
	}
}

// === Compliance Rule Interface ===

interface ComplianceRule {
	id: string;
	category: "nsm" | "gdpr" | "wcag" | "service";
	name: string;
	description: string;
	severity: "critical" | "high" | "medium" | "low";
	check: (files: Map<string, string>) => Promise<{
		issues?: ComplianceIssue[];
		warnings?: ComplianceWarning[];
		recommendations?: ComplianceRecommendation[];
	} | null>;
}

// === Compliance Helper Functions ===

/**
 * Create default Norwegian compliance configuration
 */
export function createDefaultNorwegianConfig(
	projectName: string,
	classification: NSMClassification = NSMClassification.OPEN,
): NorwegianComplianceConfig {
	return {
		project: {
			name: projectName,
			description: `Norwegian compliant ${projectName} application`,
			owner: "Organization Name",
			dataController: "Data Controller Name",
			privacyOfficer: "Privacy Officer Name",
			securityOfficer: "Security Officer Name",
		},
		nsm: {
			classification,
			requiresAuthentication: classification !== NSMClassification.OPEN,
			requiresAuthorization: classification !== NSMClassification.OPEN,
			requiresEncryption:
				classification === NSMClassification.CONFIDENTIAL ||
				classification === NSMClassification.SECRET,
			requiresAuditLogging: classification !== NSMClassification.OPEN,
			requiresDataLocalization:
				classification === NSMClassification.CONFIDENTIAL ||
				classification === NSMClassification.SECRET,
			retentionPeriodMonths: 24,
			allowedLocations: ["NO", "EU"],
			requiredSecurityHeaders: [
				"X-Frame-Options",
				"X-Content-Type-Options",
				"Strict-Transport-Security",
			],
		},
		gdpr: {
			dataCategory:
				classification === NSMClassification.OPEN
					? GDPRDataCategory.PUBLIC
					: GDPRDataCategory.PERSONAL,
			legalBasis: GDPRLegalBasis.CONSENT,
			requiresConsent: classification !== NSMClassification.OPEN,
			requiresDataMinimization: true,
			requiresPurposeLimitation: true,
			retentionPeriodMonths: 24,
			requiresRightToErasure: classification !== NSMClassification.OPEN,
			requiresDataPortability: classification !== NSMClassification.OPEN,
			requiresPrivacyByDesign: true,
			allowedCountries: ["NO", "EU"],
			requiresDPIA:
				classification === NSMClassification.CONFIDENTIAL ||
				classification === NSMClassification.SECRET,
		},
		wcag: {
			level: WCAGLevel.AAA,
			requiresAltText: true,
			requiresKeyboardNavigation: true,
			requiresScreenReaderSupport: true,
			requiresColorContrastCompliance: true,
			requiresFocusIndicators: true,
			requiresSemanticHTML: true,
			requiresARIALabels: true,
			requiresLanguageDeclaration: true,
			requiresResizeSupport: true,
			requiresMotionReducedSupport: true,
			minimumContrastRatio: 7.0,
		},
		digitalService: {
			requiresIDPorten: classification !== NSMClassification.OPEN,
			requiresAltinn: false,
			requiresBankID: false,
			requiresDigitalMailbox: false,
			requiresEnhetsregisteret: false,
			supportedLanguages: ["nb-NO", "nn-NO", "en-US"],
			requiresUniversalDesign: true,
			requiresDigitalByDefault: true,
			requiresOnceOnly: true,
		},
		localization: {
			defaultLocale: "nb-NO" as LocaleCode,
			supportedLocales: [
				"nb-NO",
				"nn-NO",
				"en-US",
				"ar-SA",
				"fr-FR",
			] as LocaleCode[],
			requiresRTL: true,
			requiresPluralization: true,
		},
		audit: {
			enabled: true,
			logLevel: "detailed",
			retentionDays: 365,
			encryptLogs: classification !== NSMClassification.OPEN,
		},
	};
}

/**
 * Validate NSM classification
 */
export function validateNSMClassification(
	classification: string,
): classification is NSMClassification {
	return Object.values(NSMClassification).includes(
		classification as NSMClassification,
	);
}

/**
 * Get compliance level description
 */
export function getComplianceLevelDescription(
	classification: NSMClassification,
): string {
	switch (classification) {
		case NSMClassification.OPEN:
			return "Public information that can be shared openly";
		case NSMClassification.RESTRICTED:
			return "Information that requires access control and basic security measures";
		case NSMClassification.CONFIDENTIAL:
			return "Sensitive information requiring strong security controls and data localization";
		case NSMClassification.SECRET:
			return "Highly sensitive information requiring the highest level of security controls";
		default:
			return "Unknown classification level";
	}
}

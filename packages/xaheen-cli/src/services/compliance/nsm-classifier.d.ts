/**
 * NSM Classification System for Templates
 *
 * Norwegian Security Authority (NSM) classification system for template security levels.
 * Implements OPEN, RESTRICTED, CONFIDENTIAL, and SECRET classifications.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */
export type NSMClassification =
	| "OPEN"
	| "RESTRICTED"
	| "CONFIDENTIAL"
	| "SECRET";
export interface NSMClassificationMetadata {
	level: NSMClassification;
	description: string;
	requirements: string[];
	restrictions: string[];
	auditLevel: "basic" | "enhanced" | "comprehensive" | "maximum";
	dataHandling: {
		encryption: boolean;
		auditTrail: boolean;
		accessControl: boolean;
		dataRetention: number;
		anonymization: boolean;
	};
	uiRequirements: {
		watermarks: boolean;
		classificationLabels: boolean;
		restrictedActions: string[];
		sessionTimeout: number;
	};
	developmentRequirements: {
		codeReview: boolean;
		securityTesting: boolean;
		penetrationTesting: boolean;
		complianceValidation: boolean;
	};
}
export interface ComplianceContext {
	classification: NSMClassification;
	userClearance: NSMClassification;
	dataTypes: string[];
	processingPurpose: string;
	retentionPeriod: number;
	internationalTransfer: boolean;
}
export declare class NSMClassifier {
	private classifications;
	constructor();
	/**
	 * Get classification metadata
	 */
	getClassification(level: NSMClassification): NSMClassificationMetadata | null;
	/**
	 * Determine required classification based on data context
	 */
	determineClassification(
		context: Partial<ComplianceContext>,
	): NSMClassification;
	/**
	 * Validate if user can access classification level
	 */
	validateAccess(
		userClearance: NSMClassification,
		requiredLevel: NSMClassification,
	): boolean;
	/**
	 * Get security requirements for template
	 */
	getSecurityRequirements(classification: NSMClassification): {
		templateSecurity: string[];
		runtimeSecurity: string[];
		dataHandling: string[];
		auditRequirements: string[];
	};
	/**
	 * Generate NSM-compliant template context
	 */
	generateComplianceContext(
		classification: NSMClassification,
	): Record<string, any>;
	/**
	 * Generate NSM classification headers
	 */
	private generateNSMHeaders;
	/**
	 * Get GDPR lawful basis based on classification
	 */
	private getGDPRLawfulBasis;
	/**
	 * Check for SECRET level indicators
	 */
	private hasSecretIndicators;
	/**
	 * Check for CONFIDENTIAL level indicators
	 */
	private hasConfidentialIndicators;
	/**
	 * Check for RESTRICTED level indicators
	 */
	private hasRestrictedIndicators;
	/**
	 * Initialize NSM classifications
	 */
	private initializeClassifications;
}
export declare const nsmClassifier: NSMClassifier;
//# sourceMappingURL=nsm-classifier.d.ts.map

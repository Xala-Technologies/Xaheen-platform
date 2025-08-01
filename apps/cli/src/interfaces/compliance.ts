/**
 * Compliance interfaces for Norwegian, GDPR, and accessibility validation
 * Extracted and simplified from packages/compliance
 */

import type { NSMClassification, WCAGLevel, ValidationResult } from "./types";

// === WCAG Accessibility Compliance ===

/**
 * WCAG compliance check result
 */
export interface WCAGComplianceResult extends ValidationResult {
	level: WCAGLevel;
	violations: WCAGViolation[];
	warnings: WCAGWarning[];
	score: number; // 0-100
}

/**
 * WCAG violation details
 */
export interface WCAGViolation {
	rule: string;
	description: string;
	impact: "minor" | "moderate" | "serious" | "critical";
	elements: string[];
	helpUrl: string;
	fix?: string;
}

/**
 * WCAG warning details
 */
export interface WCAGWarning {
	rule: string;
	description: string;
	suggestion: string;
	elements?: string[];
}

/**
 * Accessibility options for components
 */
export interface AccessibilityOptions {
	wcagLevel: WCAGLevel;
	ariaLabels: boolean;
	keyboardNavigation: boolean;
	screenReader: boolean;
	colorContrast: boolean;
	focusManagement: boolean;
	semanticHtml: boolean;
}

// === GDPR Compliance ===

/**
 * GDPR compliance check result
 */
export interface GDPRComplianceResult extends ValidationResult {
	dataTypes: DataTypeCompliance[];
	consentMechanisms: ConsentCompliance[];
	dataProtection: DataProtectionCompliance;
	score: number; // 0-100
}

/**
 * Data type compliance
 */
export interface DataTypeCompliance {
	type: "personal" | "sensitive" | "anonymous" | "pseudonymous";
	description: string;
	lawfulBasis: string[];
	retention: string;
	compliant: boolean;
	issues?: string[];
}

/**
 * Consent mechanism compliance
 */
export interface ConsentCompliance {
	mechanism: "explicit" | "implicit" | "legitimate_interest" | "vital_interest";
	description: string;
	withdrawable: boolean;
	granular: boolean;
	compliant: boolean;
	issues?: string[];
}

/**
 * Data protection compliance
 */
export interface DataProtectionCompliance {
	encryption: boolean;
	anonymization: boolean;
	pseudonymization: boolean;
	accessControl: boolean;
	auditLog: boolean;
	dataMinimization: boolean;
	compliant: boolean;
	issues?: string[];
}

// === Norwegian NSM Security ===

/**
 * NSM security compliance result
 */
export interface NSMComplianceResult extends ValidationResult {
	classification: NSMClassification;
	securityMeasures: SecurityMeasure[];
	riskAssessment: RiskAssessment;
	score: number; // 0-100
}

/**
 * Security measure
 */
export interface SecurityMeasure {
	id: string;
	name: string;
	description: string;
	classification: NSMClassification;
	implemented: boolean;
	required: boolean;
	evidence?: string;
}

/**
 * Risk assessment
 */
export interface RiskAssessment {
	threats: ThreatAssessment[];
	vulnerabilities: VulnerabilityAssessment[];
	overallRisk: "low" | "medium" | "high" | "critical";
	mitigations: string[];
}

/**
 * Threat assessment
 */
export interface ThreatAssessment {
	id: string;
	name: string;
	description: string;
	likelihood: "low" | "medium" | "high";
	impact: "low" | "medium" | "high";
	risk: "low" | "medium" | "high" | "critical";
}

/**
 * Vulnerability assessment
 */
export interface VulnerabilityAssessment {
	id: string;
	name: string;
	description: string;
	severity: "low" | "medium" | "high" | "critical";
	exploitability: "low" | "medium" | "high";
	fix?: string;
}

// === Combined Compliance ===

/**
 * Norwegian compliance (GDPR + NSM + WCAG)
 */
export interface NorwegianComplianceResult extends ValidationResult {
	gdpr: GDPRComplianceResult;
	nsm: NSMComplianceResult;
	wcag: WCAGComplianceResult;
	overallScore: number; // 0-100
	certification: "none" | "basic" | "enhanced" | "full";
}

/**
 * Compliance configuration
 */
export interface ComplianceConfig {
	gdpr: {
		enabled: boolean;
		dataTypes: string[];
		consentRequired: boolean;
		anonymization: boolean;
	};
	nsm: {
		enabled: boolean;
		classification: NSMClassification;
		securityMeasures: string[];
		riskAssessment: boolean;
	};
	wcag: {
		enabled: boolean;
		level: WCAGLevel;
		automaticTesting: boolean;
		manualTesting: boolean;
	};
}

/**
 * Compliance validator interface
 */
export interface ComplianceValidator {
	validateGDPR(code: string, config: ComplianceConfig): Promise<GDPRComplianceResult>;
	validateNSM(code: string, config: ComplianceConfig): Promise<NSMComplianceResult>;
	validateWCAG(code: string, config: ComplianceConfig): Promise<WCAGComplianceResult>;
	validateNorwegian(code: string, config: ComplianceConfig): Promise<NorwegianComplianceResult>;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
	projectName: string;
	timestamp: Date;
	version: string;
	results: NorwegianComplianceResult;
	recommendations: string[];
	actionItems: ActionItem[];
	nextReview: Date;
}

/**
 * Action item for compliance
 */
export interface ActionItem {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high" | "critical";
	category: "gdpr" | "nsm" | "wcag";
	assignee?: string;
	dueDate?: Date;
	status: "open" | "in_progress" | "completed" | "deferred";
}

/**
 * Compliance Generators Index
 *
 * Export all compliance generators for NSM Security and GDPR compliance
 * Provides comprehensive security classification and data protection capabilities
 *
 * @compliance NSM-compliant, GDPR-compliant
 * @privacy-by-design true
 */

// NSM Security Generator
export {
	NSMSecurityGenerator,
	createNSMSecurityGenerator,
	generateNSMSecurity,
	type NSMSecurityOptions,
	type NSMSecurityContext,
} from "./nsm-security.generator";

// GDPR Compliance Generator
export {
	GDPRComplianceGenerator,
	createGDPRComplianceGenerator,
	generateGDPRCompliance,
	type GDPRComplianceOptions,
	type GDPRContext,
	type GDPRLawfulBasis,
	type DataCategory,
	type ConsentType,
} from "./gdpr.generator";

// Re-export NSM Classifier from services
export {
	nsmClassifier,
	NSMClassifier,
	type NSMClassification,
	type NSMClassificationMetadata,
	type ComplianceContext,
} from "../services/compliance/nsm-classifier";

/**
 * Compliance generator registry
 */
export const COMPLIANCE_GENERATORS = {
	"nsm-security": {
		name: "NSM Security Classifications",
		description:
			"Generate Norwegian Security Authority (NSM) compliant security implementations",
		generator: "nsm-security.generator",
		classifications: ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"],
		features: [
			"Security classification templates",
			"Access control systems",
			"Audit logging",
			"Security monitoring",
			"Watermarks and labels",
			"Session management",
			"Compliance reporting",
		],
	},
	"gdpr-compliance": {
		name: "GDPR Compliance",
		description:
			"Generate GDPR-compliant data protection and privacy implementations",
		generator: "gdpr.generator",
		lawfulBases: [
			"consent",
			"contract",
			"legal-obligation",
			"vital-interests",
			"public-task",
			"legitimate-interests",
		],
		features: [
			"Consent management",
			"Data subject rights",
			"Privacy by design",
			"Data deletion workflows",
			"Audit trails",
			"Breach notification",
			"Impact assessments",
		],
	},
} as const;

/**
 * Generate compliance implementation based on requirements
 */
export async function generateCompliance(
	type: "nsm-security" | "gdpr-compliance",
	options: any,
): Promise<void> {
	switch (type) {
		case "nsm-security":
			const { generateNSMSecurity } = await import("./nsm-security.generator");
			return generateNSMSecurity(options);

		case "gdpr-compliance":
			const { generateGDPRCompliance } = await import("./gdpr.generator");
			return generateGDPRCompliance(options);

		default:
			throw new Error(`Unknown compliance type: ${type}`);
	}
}

/**
 * Get compliance generator configuration
 */
export function getComplianceGeneratorConfig(
	type: keyof typeof COMPLIANCE_GENERATORS,
) {
	return COMPLIANCE_GENERATORS[type];
}

/**
 * List all available compliance generators
 */
export function listComplianceGenerators() {
	return Object.entries(COMPLIANCE_GENERATORS).map(([key, config]) => ({
		type: key,
		...config,
	}));
}

/**
 * Default export for convenience
 */
export default {
	generateCompliance,
	getComplianceGeneratorConfig,
	listComplianceGenerators,
	COMPLIANCE_GENERATORS,
};

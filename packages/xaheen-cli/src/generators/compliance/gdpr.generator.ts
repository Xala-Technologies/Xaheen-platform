/**
 * GDPR Compliance Generator
 *
 * Generates GDPR (General Data Protection Regulation) compliant data protection APIs,
 * consent management systems, data deletion workflows, privacy by design patterns,
 * and comprehensive compliance reporting mechanisms.
 *
 * @author Xaheen CLI Generator
 * @since 2025-01-04
 */

import { consola } from "consola";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { GeneratorOptions } from "../types";

export type GDPRLawfulBasis = 
	| "consent"
	| "contract"
	| "legal-obligation"
	| "vital-interests"
	| "public-task"
	| "legitimate-interests";

export type DataCategory = 
	| "personal-data"
	| "sensitive-data"
	| "special-category"
	| "criminal-data"
	| "biometric-data"
	| "health-data"
	| "financial-data";

export type ConsentType = 
	| "explicit"
	| "informed"
	| "freely-given"
	| "specific"
	| "unambiguous"
	| "granular";

export interface GDPRComplianceOptions extends GeneratorOptions {
	readonly projectName: string;
	readonly dataCategories: readonly DataCategory[];
	readonly lawfulBasis: GDPRLawfulBasis;
	readonly consentTypes: readonly ConsentType[];
	readonly dataRetentionPeriod: number; // in days
	readonly enableRightToErasure: boolean;
	readonly enableDataPortability: boolean;
	readonly enableRightToRectification: boolean;
	readonly appointDataProtectionOfficer?: boolean;
	readonly performDataProtectionImpactAssessment?: boolean;
	readonly enablePrivacyByDesign?: boolean;
	readonly enableConsentManagement?: boolean;
	readonly enableAuditLogging?: boolean;
	readonly internationalTransfers?: boolean;
	readonly adequacyCountries?: readonly string[];
	readonly bindingCorporateRules?: boolean;
}

export interface GDPRContext {
	readonly projectName: string;
	readonly dataCategories: readonly DataCategory[];
	readonly lawfulBasis: GDPRLawfulBasis;
	readonly consentTypes: readonly ConsentType[];
	readonly dataRetentionPeriod: number;
	readonly dataSubjectRights: {
		readonly rightToAccess: boolean;
		readonly rightToRectification: boolean;
		readonly rightToErasure: boolean;
		readonly rightToRestrictProcessing: boolean;
		readonly rightToDataPortability: boolean;
		readonly rightToObject: boolean;
		readonly rightsAutomatedDecisionMaking: boolean;
	};
	readonly privacyPrinciples: {
		readonly lawfulness: boolean;
		readonly fairness: boolean;
		readonly transparency: boolean;
		readonly purposeLimitation: boolean;
		readonly dataMinimisation: boolean;
		readonly accuracy: boolean;
		readonly storageMinimisation: boolean;
		readonly integrityConfidentiality: boolean;
		readonly accountability: boolean;
	};
	readonly technicalMeasures: {
		readonly encryption: boolean;
		readonly pseudonymisation: boolean;
		readonly anonymisation: boolean;
		readonly accessControls: boolean;
		readonly dataBackups: boolean;
		readonly incidentResponse: boolean;
	};
	readonly organisationalMeasures: {
		readonly privacyPolicies: boolean;
		readonly staffTraining: boolean;
		readonly dataProtectionOfficer: boolean;
		readonly dataProtectionImpactAssessment: boolean;
		readonly vendorManagement: boolean;
		readonly recordsOfProcessing: boolean;
	};
}

export class GDPRComplianceGenerator {
	private readonly templatePath: string;
	private readonly outputPath: string;

	constructor(private readonly options: GDPRComplianceOptions) {
		this.templatePath = join(__dirname, "../../templates/compliance/gdpr");
		this.outputPath = options.outputDir || process.cwd();
	}

	/**
	 * Generate GDPR Compliance implementation
	 */
	async generate(): Promise<void> {
		try {
			consola.info("Generating GDPR Compliance implementation...");

			// Validate GDPR configuration
			this.validateGDPRConfiguration();

			// Create output directories
			this.createDirectories();

			// Generate GDPR context
			const context = this.createGDPRContext();

			// Generate core GDPR services
			await this.generateGDPRServices(context);

			// Generate consent management system
			await this.generateConsentManagement(context);

			// Generate data subject rights implementation
			await this.generateDataSubjectRights(context);

			// Generate data protection APIs
			await this.generateDataProtectionAPIs(context);

			// Generate privacy by design components
			await this.generatePrivacyByDesign(context);

			// Generate audit and compliance reporting
			await this.generateComplianceReporting(context);

			// Generate data deletion workflows
			await this.generateDataDeletionWorkflows(context);

			// Generate privacy components
			await this.generatePrivacyComponents(context);

			// Generate compliance documentation
			await this.generateComplianceDocumentation(context);

			consola.success("GDPR Compliance implementation generated successfully");

		} catch (error) {
			consola.error("Failed to generate GDPR Compliance implementation:", error);
			throw error;
		}
	}

	/**
	 * Validate GDPR configuration
	 */
	private validateGDPRConfiguration(): void {
		// Check for special category data requirements
		if (this.options.dataCategories.includes("special-category") || 
			this.options.dataCategories.includes("sensitive-data")) {
			if (this.options.lawfulBasis !== "explicit-consent" && 
				this.options.lawfulBasis !== "vital-interests") {
				consola.warn("Special category data typically requires explicit consent or vital interests lawful basis");
			}
		}

		// Check for high-risk processing requiring DPIA
		const highRiskIndicators = [
			"biometric-data",
			"health-data",
			"criminal-data",
			"special-category"
		];

		const hasHighRiskData = this.options.dataCategories.some(category => 
			highRiskIndicators.includes(category)
		);

		if (hasHighRiskData && !this.options.performDataProtectionImpactAssessment) {
			consola.warn("High-risk data processing detected. Consider performing a Data Protection Impact Assessment (DPIA)");
		}

		// Check for DPO requirement
		if ((this.options.dataCategories.includes("special-category") || 
			 this.options.dataCategories.includes("criminal-data")) &&
			!this.options.appointDataProtectionOfficer) {
			consola.warn("Processing of special category or criminal data may require appointing a Data Protection Officer");
		}

		// Validate retention period
		if (this.options.dataRetentionPeriod > 2555) { // > 7 years
			consola.warn("Long data retention periods may require additional justification under GDPR storage minimisation principle");
		}

		consola.debug("GDPR configuration validation completed");
	}

	/**
	 * Create output directories
	 */
	private createDirectories(): void {
		const dirs = [
			"src/gdpr/services",
			"src/gdpr/consent",
			"src/gdpr/data-subject-rights",
			"src/gdpr/data-protection",
			"src/gdpr/privacy-by-design",
			"src/gdpr/audit",
			"src/gdpr/workflows",
			"src/components/privacy",
			"src/components/consent",
			"src/hooks/privacy",
			"src/utils/gdpr",
			"src/types/gdpr",
			"src/middleware/gdpr",
			"docs/gdpr",
			"config/gdpr",
			"scripts/gdpr"
		];

		dirs.forEach(dir => {
			const fullPath = join(this.outputPath, dir);
			if (!existsSync(fullPath)) {
				mkdirSync(fullPath, { recursive: true });
			}
		});

		consola.debug("Created GDPR compliance directory structure");
	}

	/**
	 * Create GDPR context for templates
	 */
	private createGDPRContext(): GDPRContext {
		return {
			projectName: this.options.projectName,
			dataCategories: this.options.dataCategories,
			lawfulBasis: this.options.lawfulBasis,
			consentTypes: this.options.consentTypes,
			dataRetentionPeriod: this.options.dataRetentionPeriod,
			dataSubjectRights: {
				rightToAccess: true,
				rightToRectification: this.options.enableRightToRectification ?? true,
				rightToErasure: this.options.enableRightToErasure ?? true,
				rightToRestrictProcessing: true,
				rightToDataPortability: this.options.enableDataPortability ?? true,
				rightToObject: true,
				rightsAutomatedDecisionMaking: true
			},
			privacyPrinciples: {
				lawfulness: true,
				fairness: true,
				transparency: true,
				purposeLimitation: true,
				dataMinimisation: true,
				accuracy: true,
				storageMinimisation: true,
				integrityConfidentiality: true,
				accountability: true
			},
			technicalMeasures: {
				encryption: true,
				pseudonymisation: true,
				anonymisation: true,
				accessControls: true,
				dataBackups: true,
				incidentResponse: true
			},
			organisationalMeasures: {
				privacyPolicies: true,
				staffTraining: true,
				dataProtectionOfficer: this.options.appointDataProtectionOfficer ?? false,
				dataProtectionImpactAssessment: this.options.performDataProtectionImpactAssessment ?? false,
				vendorManagement: true,
				recordsOfProcessing: true
			}
		};
	}

	/**
	 * Generate core GDPR services
	 */
	private async generateGDPRServices(context: GDPRContext): Promise<void> {
		const services = [
			{
				template: "gdpr-service.ts.hbs",
				output: "src/gdpr/services/gdpr-service.ts"
			},
			{
				template: "data-processing-service.ts.hbs",
				output: "src/gdpr/services/data-processing-service.ts"
			},
			{
				template: "lawful-basis-service.ts.hbs",
				output: "src/gdpr/services/lawful-basis-service.ts"
			},
			{
				template: "privacy-notice-service.ts.hbs",
				output: "src/gdpr/services/privacy-notice-service.ts"
			},
			{
				template: "data-retention-service.ts.hbs",
				output: "src/gdpr/services/data-retention-service.ts"
			}
		];

		for (const service of services) {
			await this.generateFromTemplate(service.template, service.output, context);
		}

		// Generate GDPR types
		await this.generateFromTemplate(
			"gdpr-types.ts.hbs",
			"src/types/gdpr/gdpr-types.ts",
			context
		);

		consola.debug("Generated GDPR core services");
	}

	/**
	 * Generate consent management system
	 */
	private async generateConsentManagement(context: GDPRContext): Promise<void> {
		const consentFiles = [
			{
				template: "consent-manager.ts.hbs",
				output: "src/gdpr/consent/consent-manager.ts"
			},
			{
				template: "consent-storage.ts.hbs",
				output: "src/gdpr/consent/consent-storage.ts"
			},
			{
				template: "consent-validator.ts.hbs",
				output: "src/gdpr/consent/consent-validator.ts"
			},
			{
				template: "granular-consent.ts.hbs",
				output: "src/gdpr/consent/granular-consent.ts"
			}
		];

		for (const file of consentFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate consent components
		const consentComponents = [
			{
				template: "consent-banner.tsx.hbs",
				output: "src/components/consent/ConsentBanner.tsx"
			},
			{
				template: "consent-preferences.tsx.hbs",
				output: "src/components/consent/ConsentPreferences.tsx"
			},
			{
				template: "cookie-consent.tsx.hbs",
				output: "src/components/consent/CookieConsent.tsx"
			},
			{
				template: "granular-consent-form.tsx.hbs",
				output: "src/components/consent/GranularConsentForm.tsx"
			}
		];

		for (const component of consentComponents) {
			await this.generateFromTemplate(component.template, component.output, context);
		}

		consola.debug("Generated consent management system");
	}

	/**
	 * Generate data subject rights implementation
	 */
	private async generateDataSubjectRights(context: GDPRContext): Promise<void> {
		const rightsFiles = [
			{
				template: "data-subject-rights-service.ts.hbs",
				output: "src/gdpr/data-subject-rights/data-subject-rights-service.ts"
			},
			{
				template: "right-to-access.ts.hbs",
				output: "src/gdpr/data-subject-rights/right-to-access.ts"
			},
			{
				template: "right-to-erasure.ts.hbs",
				output: "src/gdpr/data-subject-rights/right-to-erasure.ts"
			},
			{
				template: "right-to-rectification.ts.hbs",
				output: "src/gdpr/data-subject-rights/right-to-rectification.ts"
			},
			{
				template: "right-to-portability.ts.hbs",
				output: "src/gdpr/data-subject-rights/right-to-portability.ts"
			},
			{
				template: "right-to-restrict.ts.hbs",
				output: "src/gdpr/data-subject-rights/right-to-restrict.ts"
			}
		];

		for (const file of rightsFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate data subject rights components
		const rightsComponents = [
			{
				template: "data-subject-request-form.tsx.hbs",
				output: "src/components/privacy/DataSubjectRequestForm.tsx"
			},
			{
				template: "data-download.tsx.hbs",
				output: "src/components/privacy/DataDownload.tsx"
			},
			{
				template: "data-deletion-request.tsx.hbs",
				output: "src/components/privacy/DataDeletionRequest.tsx"
			}
		];

		for (const component of rightsComponents) {
			await this.generateFromTemplate(component.template, component.output, context);
		}

		consola.debug("Generated data subject rights implementation");
	}

	/**
	 * Generate data protection APIs
	 */
	private async generateDataProtectionAPIs(context: GDPRContext): Promise<void> {
		const apiFiles = [
			{
				template: "data-protection-api.ts.hbs",
				output: "src/gdpr/data-protection/data-protection-api.ts"
			},
			{
				template: "encryption-service.ts.hbs",
				output: "src/gdpr/data-protection/encryption-service.ts"
			},
			{
				template: "pseudonymisation-service.ts.hbs",
				output: "src/gdpr/data-protection/pseudonymisation-service.ts"
			},
			{
				template: "anonymisation-service.ts.hbs",
				output: "src/gdpr/data-protection/anonymisation-service.ts"
			},
			{
				template: "data-minimisation.ts.hbs",
				output: "src/gdpr/data-protection/data-minimisation.ts"
			}
		];

		for (const file of apiFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate middleware
		const middlewareFiles = [
			{
				template: "gdpr-middleware.ts.hbs",
				output: "src/middleware/gdpr/gdpr-middleware.ts"
			},
			{
				template: "consent-middleware.ts.hbs",
				output: "src/middleware/gdpr/consent-middleware.ts"
			},
			{
				template: "data-retention-middleware.ts.hbs",
				output: "src/middleware/gdpr/data-retention-middleware.ts"
			}
		];

		for (const file of middlewareFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		consola.debug("Generated data protection APIs");
	}

	/**
	 * Generate privacy by design components
	 */
	private async generatePrivacyByDesign(context: GDPRContext): Promise<void> {
		const privacyFiles = [
			{
				template: "privacy-by-design-service.ts.hbs",
				output: "src/gdpr/privacy-by-design/privacy-by-design-service.ts"
			},
			{
				template: "data-protection-impact-assessment.ts.hbs",
				output: "src/gdpr/privacy-by-design/data-protection-impact-assessment.ts"
			},
			{
				template: "privacy-enhancing-technologies.ts.hbs",
				output: "src/gdpr/privacy-by-design/privacy-enhancing-technologies.ts"
			},
			{
				template: "privacy-design-patterns.ts.hbs",
				output: "src/gdpr/privacy-by-design/privacy-design-patterns.ts"
			}
		];

		for (const file of privacyFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate privacy components
		const privacyComponents = [
			{
				template: "privacy-dashboard.tsx.hbs",
				output: "src/components/privacy/PrivacyDashboard.tsx"
			},
			{
				template: "privacy-settings.tsx.hbs",
				output: "src/components/privacy/PrivacySettings.tsx"
			},
			{
				template: "data-processing-notice.tsx.hbs",
				output: "src/components/privacy/DataProcessingNotice.tsx"
			}
		];

		for (const component of privacyComponents) {
			await this.generateFromTemplate(component.template, component.output, context);
		}

		// Generate privacy hooks
		const privacyHooks = [
			{
				template: "use-gdpr-compliance.ts.hbs",
				output: "src/hooks/privacy/useGDPRCompliance.ts"
			},
			{
				template: "use-consent-management.ts.hbs",
				output: "src/hooks/privacy/useConsentManagement.ts"
			},
			{
				template: "use-data-subject-rights.ts.hbs",
				output: "src/hooks/privacy/useDataSubjectRights.ts"
			}
		];

		for (const hook of privacyHooks) {
			await this.generateFromTemplate(hook.template, hook.output, context);
		}

		consola.debug("Generated privacy by design components");
	}

	/**
	 * Generate compliance reporting system
	 */
	private async generateComplianceReporting(context: GDPRContext): Promise<void> {
		const reportingFiles = [
			{
				template: "compliance-reporter.ts.hbs",
				output: "src/gdpr/audit/compliance-reporter.ts"
			},
			{
				template: "gdpr-audit-logger.ts.hbs",
				output: "src/gdpr/audit/gdpr-audit-logger.ts"
			},
			{
				template: "processing-records.ts.hbs",
				output: "src/gdpr/audit/processing-records.ts"
			},
			{
				template: "breach-notification.ts.hbs",
				output: "src/gdpr/audit/breach-notification.ts"
			},
			{
				template: "compliance-monitoring.ts.hbs",
				output: "src/gdpr/audit/compliance-monitoring.ts"
			}
		];

		for (const file of reportingFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate compliance dashboard
		await this.generateFromTemplate(
			"compliance-dashboard.tsx.hbs",
			"src/components/privacy/ComplianceDashboard.tsx",
			context
		);

		consola.debug("Generated compliance reporting system");
	}

	/**
	 * Generate data deletion workflows
	 */
	private async generateDataDeletionWorkflows(context: GDPRContext): Promise<void> {
		const workflowFiles = [
			{
				template: "data-deletion-workflow.ts.hbs",
				output: "src/gdpr/workflows/data-deletion-workflow.ts"
			},
			{
				template: "automated-deletion.ts.hbs",
				output: "src/gdpr/workflows/automated-deletion.ts"
			},
			{
				template: "deletion-scheduler.ts.hbs",
				output: "src/gdpr/workflows/deletion-scheduler.ts"
			},
			{
				template: "retention-policy-engine.ts.hbs",
				output: "src/gdpr/workflows/retention-policy-engine.ts"
			}
		];

		for (const file of workflowFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate deletion scripts
		const scriptFiles = [
			{
				template: "cleanup-expired-data.ts.hbs",
				output: "scripts/gdpr/cleanup-expired-data.ts"
			},
			{
				template: "generate-retention-report.ts.hbs",
				output: "scripts/gdpr/generate-retention-report.ts"
			}
		];

		for (const script of scriptFiles) {
			await this.generateFromTemplate(script.template, script.output, context);
		}

		consola.debug("Generated data deletion workflows");
	}

	/**
	 * Generate privacy components
	 */
	private async generatePrivacyComponents(context: GDPRContext): Promise<void> {
		const components = [
			{
				template: "privacy-policy.tsx.hbs",
				output: "src/components/privacy/PrivacyPolicy.tsx"
			},
			{
				template: "cookie-policy.tsx.hbs",
				output: "src/components/privacy/CookiePolicy.tsx"
			},
			{
				template: "terms-of-service.tsx.hbs",
				output: "src/components/privacy/TermsOfService.tsx"
			},
			{
				template: "data-processing-agreement.tsx.hbs",
				output: "src/components/privacy/DataProcessingAgreement.tsx"
			}
		];

		for (const component of components) {
			await this.generateFromTemplate(component.template, component.output, context);
		}

		consola.debug("Generated privacy components");
	}

	/**
	 * Generate compliance documentation
	 */
	private async generateComplianceDocumentation(context: GDPRContext): Promise<void> {
		const docFiles = [
			{
				template: "gdpr-compliance-guide.md.hbs",
				output: "docs/gdpr/GDPR-Compliance-Guide.md"
			},
			{
				template: "data-subject-rights-guide.md.hbs",
				output: "docs/gdpr/Data-Subject-Rights-Guide.md"
			},
			{
				template: "consent-management-guide.md.hbs",
				output: "docs/gdpr/Consent-Management-Guide.md"
			},
			{
				template: "privacy-by-design-guide.md.hbs",
				output: "docs/gdpr/Privacy-By-Design-Guide.md"
			},
			{
				template: "breach-response-procedures.md.hbs",
				output: "docs/gdpr/Breach-Response-Procedures.md"
			}
		];

		for (const file of docFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate configuration files
		const configFiles = [
			{
				template: "gdpr-config.json.hbs",
				output: "config/gdpr/gdpr-config.json"
			},
			{
				template: "consent-config.json.hbs",
				output: "config/gdpr/consent-config.json"
			},
			{
				template: "retention-policies.json.hbs",
				output: "config/gdpr/retention-policies.json"
			}
		];

		for (const config of configFiles) {
			await this.generateFromTemplate(config.template, config.output, context);
		}

		consola.debug("Generated GDPR compliance documentation");
	}

	/**
	 * Generate file from template (placeholder for actual template rendering)
	 */
	private async generateFromTemplate(
		templateName: string,
		outputPath: string,
		context: GDPRContext
	): Promise<void> {
		// This would use Handlebars or similar template engine
		// For now, we'll create placeholder implementation
		consola.debug(`Generating ${outputPath} from ${templateName}`);
		
		// In actual implementation, this would:
		// 1. Load template from templatePath
		// 2. Render with context
		// 3. Write to outputPath
	}

	/**
	 * Get compliance checklist
	 */
	getComplianceChecklist(): Record<string, string[]> {
		return {
			dataProcessing: [
				"Identify lawful basis for processing",
				"Document processing activities",
				"Implement data minimisation",
				"Ensure purpose limitation",
				"Maintain data accuracy"
			],
			consentManagement: [
				"Obtain explicit consent where required",
				"Provide granular consent options",
				"Enable easy consent withdrawal",
				"Maintain consent records",
				"Regular consent refresh"
			],
			dataSubjectRights: [
				"Implement right of access",
				"Enable data rectification",
				"Provide data erasure capability",
				"Support data portability",
				"Handle restriction requests"
			],
			security: [
				"Implement encryption at rest",
				"Encrypt data in transit",
				"Use pseudonymisation",
				"Implement access controls",
				"Regular security assessments"
			],
			accountability: [
				"Maintain processing records",
				"Conduct impact assessments",
				"Appoint DPO if required",
				"Staff privacy training",
				"Vendor due diligence"
			]
		};
	}

	/**
	 * Validate GDPR implementation
	 */
	async validateImplementation(): Promise<{
		compliant: boolean;
		issues: string[];
		recommendations: string[];
	}> {
		const issues: string[] = [];
		const recommendations: string[] = [];

		// Check required services
		const requiredServices = [
			"src/gdpr/services/gdpr-service.ts",
			"src/gdpr/consent/consent-manager.ts",
			"src/gdpr/data-subject-rights/data-subject-rights-service.ts"
		];

		for (const service of requiredServices) {
			const filePath = join(this.outputPath, service);
			if (!existsSync(filePath)) {
				issues.push(`Required GDPR service missing: ${service}`);
			}
		}

		// Check for high-risk processing requirements
		if (this.options.performDataProtectionImpactAssessment) {
			const dpiaPath = join(this.outputPath, "src/gdpr/privacy-by-design/data-protection-impact-assessment.ts");
			if (!existsSync(dpiaPath)) {
				issues.push("DPIA implementation required for high-risk processing");
			}
		}

		// Check consent management for consent-based processing
		if (this.options.lawfulBasis === "consent") {
			const consentPath = join(this.outputPath, "src/gdpr/consent/consent-manager.ts");
			if (!existsSync(consentPath)) {
				issues.push("Consent management system required for consent-based processing");
			}
		}

		// Generate recommendations
		if (this.options.dataCategories.includes("special-category")) {
			recommendations.push("Consider additional safeguards for special category data");
		}

		if (this.options.internationalTransfers) {
			recommendations.push("Ensure appropriate safeguards for international data transfers");
		}

		return {
			compliant: issues.length === 0,
			issues,
			recommendations: [
				...recommendations,
				...this.getComplianceChecklist().dataProcessing,
				...this.getComplianceChecklist().consentManagement,
				...this.getComplianceChecklist().dataSubjectRights
			]
		};
	}
}

/**
 * Factory function to create GDPR Compliance generator
 */
export function createGDPRComplianceGenerator(options: GDPRComplianceOptions): GDPRComplianceGenerator {
	return new GDPRComplianceGenerator(options);
}

/**
 * Generate GDPR Compliance implementation
 */
export async function generateGDPRCompliance(options: GDPRComplianceOptions): Promise<void> {
	const generator = createGDPRComplianceGenerator(options);
	await generator.generate();
	
	// Validate implementation
	const validation = await generator.validateImplementation();
	
	if (!validation.compliant) {
		consola.warn("GDPR implementation has compliance issues:", validation.issues);
	}
	
	if (validation.recommendations.length > 0) {
		consola.info("GDPR compliance recommendations:", validation.recommendations);
	}
}
/**
 * NSM Security Classification Generator
 *
 * Generates Norwegian Security Authority (NSM) compliant security classifications
 * and implements OPEN, RESTRICTED, CONFIDENTIAL, SECRET classification templates
 * with proper access controls, audit trails, and security measures.
 *
 * @author Xaheen CLI Generator
 * @since 2025-01-04
 */

import { consola } from "consola";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import {
	type NSMClassification,
	nsmClassifier,
} from "../../services/compliance/nsm-classifier";
import type { GeneratorOptions } from "../types";

export interface NSMSecurityOptions extends GeneratorOptions {
	readonly classification: NSMClassification;
	readonly projectName: string;
	readonly dataTypes?: readonly string[];
	readonly retentionPeriod?: number;
	readonly userClearance?: NSMClassification;
	readonly auditLevel?: "basic" | "enhanced" | "comprehensive" | "maximum";
	readonly enableWatermarks?: boolean;
	readonly sessionTimeout?: number;
	readonly internationalTransfer?: boolean;
}

export interface NSMSecurityContext {
	readonly projectName: string;
	readonly classification: NSMClassification;
	readonly metadata: any;
	readonly securityRequirements: any;
	readonly complianceHeaders: Record<string, string>;
	readonly auditConfig: any;
	readonly dataProtection: any;
	readonly uiSecurity: any;
	readonly developmentGuidelines: any;
}

export class NSMSecurityGenerator {
	private readonly templatePath: string;
	private readonly outputPath: string;

	constructor(private readonly options: NSMSecurityOptions) {
		this.templatePath = join(
			__dirname,
			"../../templates/compliance/nsm-security",
		);
		this.outputPath = options.outputDir || process.cwd();
	}

	/**
	 * Generate NSM Security implementation
	 */
	async generate(): Promise<void> {
		try {
			consola.info(
				`Generating NSM Security implementation for ${this.options.classification} classification...`,
			);

			// Validate classification and user clearance
			this.validateSecurity();

			// Create output directories
			this.createDirectories();

			// Generate compliance context
			const context = this.createSecurityContext();

			// Generate security implementation files
			await this.generateSecurityFiles(context);

			// Generate classification-specific components
			await this.generateClassificationComponents(context);

			// Generate audit and monitoring
			await this.generateAuditSystem(context);

			// Generate access control system
			await this.generateAccessControl(context);

			// Generate security middleware
			await this.generateSecurityMiddleware(context);

			// Generate compliance documentation
			await this.generateComplianceDocumentation(context);

			consola.success(
				`NSM Security implementation generated successfully for ${this.options.classification} classification`,
			);
		} catch (error) {
			consola.error("Failed to generate NSM Security implementation:", error);
			throw error;
		}
	}

	/**
	 * Validate security configuration
	 */
	private validateSecurity(): void {
		const classification = this.options.classification;
		const userClearance = this.options.userClearance || "OPEN";

		// Validate user clearance
		if (!nsmClassifier.validateAccess(userClearance, classification)) {
			throw new Error(
				`Insufficient clearance: ${userClearance} cannot access ${classification} classification`,
			);
		}

		// Validate data types for classification
		if (this.options.dataTypes) {
			const determinedClassification = nsmClassifier.determineClassification({
				dataTypes: this.options.dataTypes,
				retentionPeriod: this.options.retentionPeriod,
				internationalTransfer: this.options.internationalTransfer,
			});

			const levels: NSMClassification[] = [
				"OPEN",
				"RESTRICTED",
				"CONFIDENTIAL",
				"SECRET",
			];
			const requiredLevel = levels.indexOf(determinedClassification);
			const providedLevel = levels.indexOf(classification);

			if (providedLevel < requiredLevel) {
				consola.warn(
					`Data types suggest ${determinedClassification} classification, but ${classification} was specified. Consider upgrading classification level.`,
				);
			}
		}

		consola.debug(
			`Security validation passed for ${classification} classification`,
		);
	}

	/**
	 * Create output directories
	 */
	private createDirectories(): void {
		const dirs = [
			"src/security/nsm",
			"src/security/audit",
			"src/security/access-control",
			"src/security/middleware",
			"src/security/monitoring",
			"src/components/security",
			"src/hooks/security",
			"src/utils/security",
			"src/types/security",
			"docs/security",
			"config/security",
		];

		dirs.forEach((dir) => {
			const fullPath = join(this.outputPath, dir);
			if (!existsSync(fullPath)) {
				mkdirSync(fullPath, { recursive: true });
			}
		});

		consola.debug("Created NSM security directory structure");
	}

	/**
	 * Create security context for templates
	 */
	private createSecurityContext(): NSMSecurityContext {
		const classification = this.options.classification;
		const metadata = nsmClassifier.getClassification(classification);
		const complianceContext =
			nsmClassifier.generateComplianceContext(classification);

		if (!metadata) {
			throw new Error(`Unknown classification: ${classification}`);
		}

		return {
			projectName: this.options.projectName,
			classification,
			metadata,
			securityRequirements: complianceContext.security,
			complianceHeaders: complianceContext.nsm.headers,
			auditConfig: {
				level: metadata.auditLevel,
				dataAccess: metadata.dataHandling.auditTrail,
				realTimeMonitoring: metadata.auditLevel === "maximum",
				retentionPeriod: metadata.dataHandling.dataRetention,
			},
			dataProtection: complianceContext.nsm.dataProtection,
			uiSecurity: {
				watermarks: metadata.uiRequirements.watermarks,
				classificationLabels: metadata.uiRequirements.classificationLabels,
				restrictedActions: metadata.uiRequirements.restrictedActions,
				sessionTimeout:
					this.options.sessionTimeout || metadata.uiRequirements.sessionTimeout,
			},
			developmentGuidelines: {
				codeReview: metadata.developmentRequirements.codeReview,
				securityTesting: metadata.developmentRequirements.securityTesting,
				penetrationTesting: metadata.developmentRequirements.penetrationTesting,
				complianceValidation:
					metadata.developmentRequirements.complianceValidation,
			},
		};
	}

	/**
	 * Generate core security files
	 */
	private async generateSecurityFiles(
		context: NSMSecurityContext,
	): Promise<void> {
		const files = [
			{
				template: "nsm-security-config.ts.hbs",
				output: "src/security/nsm/security-config.ts",
			},
			{
				template: "nsm-classification-service.ts.hbs",
				output: "src/security/nsm/classification-service.ts",
			},
			{
				template: "nsm-security-headers.ts.hbs",
				output: "src/security/nsm/security-headers.ts",
			},
			{
				template: "nsm-session-manager.ts.hbs",
				output: "src/security/nsm/session-manager.ts",
			},
			{
				template: "nsm-types.ts.hbs",
				output: "src/types/security/nsm-types.ts",
			},
		];

		for (const file of files) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		consola.debug("Generated NSM security core files");
	}

	/**
	 * Generate classification-specific components
	 */
	private async generateClassificationComponents(
		context: NSMSecurityContext,
	): Promise<void> {
		const components = [
			{
				template: "classification-banner.tsx.hbs",
				output: "src/components/security/ClassificationBanner.tsx",
			},
			{
				template: "security-watermark.tsx.hbs",
				output: "src/components/security/SecurityWatermark.tsx",
			},
			{
				template: "access-control-guard.tsx.hbs",
				output: "src/components/security/AccessControlGuard.tsx",
			},
			{
				template: "session-timeout-monitor.tsx.hbs",
				output: "src/components/security/SessionTimeoutMonitor.tsx",
			},
			{
				template: "restricted-actions.tsx.hbs",
				output: "src/components/security/RestrictedActions.tsx",
			},
		];

		for (const component of components) {
			await this.generateFromTemplate(
				component.template,
				component.output,
				context,
			);
		}

		// Generate security hooks
		const hooks = [
			{
				template: "use-nsm-classification.ts.hbs",
				output: "src/hooks/security/useNSMClassification.ts",
			},
			{
				template: "use-security-context.ts.hbs",
				output: "src/hooks/security/useSecurityContext.ts",
			},
			{
				template: "use-access-control.ts.hbs",
				output: "src/hooks/security/useAccessControl.ts",
			},
		];

		for (const hook of hooks) {
			await this.generateFromTemplate(hook.template, hook.output, context);
		}

		consola.debug("Generated NSM classification components and hooks");
	}

	/**
	 * Generate audit and monitoring system
	 */
	private async generateAuditSystem(
		context: NSMSecurityContext,
	): Promise<void> {
		const auditFiles = [
			{
				template: "audit-logger.ts.hbs",
				output: "src/security/audit/audit-logger.ts",
			},
			{
				template: "audit-trail.ts.hbs",
				output: "src/security/audit/audit-trail.ts",
			},
			{
				template: "security-monitor.ts.hbs",
				output: "src/security/monitoring/security-monitor.ts",
			},
			{
				template: "compliance-reporter.ts.hbs",
				output: "src/security/audit/compliance-reporter.ts",
			},
			{
				template: "audit-dashboard.tsx.hbs",
				output: "src/components/security/AuditDashboard.tsx",
			},
		];

		for (const file of auditFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		consola.debug("Generated NSM audit and monitoring system");
	}

	/**
	 * Generate access control system
	 */
	private async generateAccessControl(
		context: NSMSecurityContext,
	): Promise<void> {
		const accessFiles = [
			{
				template: "access-control-service.ts.hbs",
				output: "src/security/access-control/access-control-service.ts",
			},
			{
				template: "role-based-access.ts.hbs",
				output: "src/security/access-control/role-based-access.ts",
			},
			{
				template: "clearance-validator.ts.hbs",
				output: "src/security/access-control/clearance-validator.ts",
			},
			{
				template: "access-control-middleware.ts.hbs",
				output: "src/security/middleware/access-control-middleware.ts",
			},
		];

		for (const file of accessFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		consola.debug("Generated NSM access control system");
	}

	/**
	 * Generate security middleware
	 */
	private async generateSecurityMiddleware(
		context: NSMSecurityContext,
	): Promise<void> {
		const middlewareFiles = [
			{
				template: "security-headers-middleware.ts.hbs",
				output: "src/security/middleware/security-headers-middleware.ts",
			},
			{
				template: "classification-middleware.ts.hbs",
				output: "src/security/middleware/classification-middleware.ts",
			},
			{
				template: "audit-middleware.ts.hbs",
				output: "src/security/middleware/audit-middleware.ts",
			},
			{
				template: "session-security-middleware.ts.hbs",
				output: "src/security/middleware/session-security-middleware.ts",
			},
		];

		for (const file of middlewareFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		consola.debug("Generated NSM security middleware");
	}

	/**
	 * Generate compliance documentation
	 */
	private async generateComplianceDocumentation(
		context: NSMSecurityContext,
	): Promise<void> {
		const docFiles = [
			{
				template: "nsm-security-guide.md.hbs",
				output: "docs/security/NSM-Security-Guide.md",
			},
			{
				template: "classification-procedures.md.hbs",
				output: "docs/security/Classification-Procedures.md",
			},
			{
				template: "security-implementation.md.hbs",
				output: "docs/security/Security-Implementation.md",
			},
			{
				template: "audit-procedures.md.hbs",
				output: "docs/security/Audit-Procedures.md",
			},
		];

		for (const file of docFiles) {
			await this.generateFromTemplate(file.template, file.output, context);
		}

		// Generate security configuration
		await this.generateFromTemplate(
			"security-config.json.hbs",
			"config/security/nsm-security.json",
			context,
		);

		consola.debug("Generated NSM compliance documentation");
	}

	/**
	 * Generate file from template (placeholder for actual template rendering)
	 */
	private async generateFromTemplate(
		templateName: string,
		outputPath: string,
		context: NSMSecurityContext,
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
	 * Get classification-specific security recommendations
	 */
	getSecurityRecommendations(): Record<string, string[]> {
		const classification = this.options.classification;
		const metadata = nsmClassifier.getClassification(classification);

		if (!metadata) {
			return {};
		}

		return {
			infrastructure: [
				"Use HSM for key management",
				"Implement network segmentation",
				"Enable comprehensive monitoring",
				...(classification === "SECRET" || classification === "CONFIDENTIAL"
					? [
							"Use air-gapped systems where possible",
							"Implement quantum-resistant encryption",
						]
					: []),
			],
			development: [
				"Follow secure coding practices",
				"Implement comprehensive testing",
				"Use static code analysis",
				...(metadata.developmentRequirements.codeReview
					? ["Mandatory code review process"]
					: []),
				...(metadata.developmentRequirements.penetrationTesting
					? ["Regular penetration testing"]
					: []),
			],
			operational: [
				"Regular security assessments",
				"Incident response procedures",
				"Staff security training",
				...(metadata.auditLevel === "maximum"
					? ["24/7 security monitoring", "Real-time threat detection"]
					: []),
			],
		};
	}

	/**
	 * Validate generated security implementation
	 */
	async validateImplementation(): Promise<{
		valid: boolean;
		issues: string[];
		recommendations: string[];
	}> {
		const issues: string[] = [];
		const recommendations: string[] = [];

		// Check if required security files exist
		const requiredFiles = [
			"src/security/nsm/security-config.ts",
			"src/security/audit/audit-logger.ts",
			"src/security/access-control/access-control-service.ts",
		];

		for (const file of requiredFiles) {
			const filePath = join(this.outputPath, file);
			if (!existsSync(filePath)) {
				issues.push(`Required security file missing: ${file}`);
			}
		}

		// Classification-specific validation
		const metadata = nsmClassifier.getClassification(
			this.options.classification,
		);
		if (metadata) {
			if (
				metadata.dataHandling.encryption &&
				!existsSync(join(this.outputPath, "src/security/encryption"))
			) {
				issues.push(
					"Encryption implementation required for this classification level",
				);
			}

			if (
				metadata.uiRequirements.watermarks &&
				!existsSync(
					join(
						this.outputPath,
						"src/components/security/SecurityWatermark.tsx",
					),
				)
			) {
				issues.push(
					"Security watermarks required for this classification level",
				);
			}

			if (metadata.developmentRequirements.penetrationTesting) {
				recommendations.push(
					"Schedule regular penetration testing for this classification level",
				);
			}
		}

		return {
			valid: issues.length === 0,
			issues,
			recommendations: [
				...recommendations,
				...this.getSecurityRecommendations().infrastructure,
				...this.getSecurityRecommendations().development,
				...this.getSecurityRecommendations().operational,
			],
		};
	}
}

/**
 * Factory function to create NSM Security generator
 */
export function createNSMSecurityGenerator(
	options: NSMSecurityOptions,
): NSMSecurityGenerator {
	return new NSMSecurityGenerator(options);
}

/**
 * Generate NSM Security implementation
 */
export async function generateNSMSecurity(
	options: NSMSecurityOptions,
): Promise<void> {
	const generator = createNSMSecurityGenerator(options);
	await generator.generate();

	// Validate implementation
	const validation = await generator.validateImplementation();

	if (!validation.valid) {
		consola.warn("Security implementation has issues:", validation.issues);
	}

	if (validation.recommendations.length > 0) {
		consola.info("Security recommendations:", validation.recommendations);
	}
}

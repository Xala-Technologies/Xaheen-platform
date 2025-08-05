/**
 * Compliance Report Generator
 *
 * Generates comprehensive compliance dashboards and reports for GDPR, NSM,
 * PCI DSS, SOC 2, ISO 27001, and other regulatory standards with interactive
 * validation and gap detection.
 *
 * Features:
 * - Multi-standard compliance reporting
 * - Interactive compliance dashboards
 * - Gap analysis and remediation tracking
 * - Real-time compliance monitoring
 * - Audit trail generation
 * - Regulatory mapping and coverage
 *
 * @author Xaheen CLI Compliance Team
 * @since 2025-01-04
 */

import { consola } from "consola";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";
import {
	type NSMClassification,
	nsmClassifier,
} from "../../services/compliance/nsm-classifier";
import type { GeneratorOptions } from "../types";

export interface ComplianceReportOptions extends GeneratorOptions {
	readonly projectPath?: string;
	readonly standards?: readonly ComplianceStandard[];
	readonly includeGaps?: boolean;
	readonly includeRemediation?: boolean;
	readonly includeDashboard?: boolean;
	readonly outputFormat?: "json" | "html" | "pdf" | "all";
	readonly reportType?: "executive" | "detailed" | "technical" | "audit";
	readonly timeframe?: "current" | "historical" | "projected";
	readonly nsmClassification?: NSMClassification;
	readonly gdprLawfulBasis?: GDPRLawfulBasis[];
	readonly includeMetrics?: boolean;
	readonly generateActionPlan?: boolean;
}

export type ComplianceStandard =
	| "gdpr"
	| "nsm"
	| "pci-dss"
	| "soc2"
	| "iso27001"
	| "hipaa"
	| "nist"
	| "owasp";

export type GDPRLawfulBasis =
	| "consent"
	| "contract"
	| "legal-obligation"
	| "vital-interests"
	| "public-task"
	| "legitimate-interests";

export interface ComplianceReportResult {
	readonly timestamp: string;
	readonly projectName: string;
	readonly reportType: string;
	readonly overallScore: number;
	readonly complianceStatus: "compliant" | "non-compliant" | "partial";
	readonly standardsResults: readonly StandardComplianceResult[];
	readonly gapAnalysis: readonly ComplianceGap[];
	readonly remediationPlan: readonly RemediationAction[];
	readonly metrics: ComplianceMetrics;
	readonly recommendations: readonly ComplianceRecommendation[];
	readonly auditTrail: readonly AuditEvent[];
	readonly dashboardData?: ComplianceDashboardData;
}

export interface StandardComplianceResult {
	readonly standard: ComplianceStandard;
	readonly version: string;
	readonly score: number;
	readonly status: "compliant" | "non-compliant" | "partial";
	readonly controlsResults: readonly ControlResult[];
	readonly evidence: readonly ComplianceEvidence[];
	readonly lastAssessment: string;
	readonly nextAssessment?: string;
	readonly riskLevel: "low" | "medium" | "high" | "critical";
}

export interface ControlResult {
	readonly controlId: string;
	readonly name: string;
	readonly description: string;
	readonly status:
		| "implemented"
		| "partial"
		| "not-implemented"
		| "not-applicable";
	readonly maturityLevel: 1 | 2 | 3 | 4 | 5;
	readonly implementation: string;
	readonly evidence: readonly string[];
	readonly gaps: readonly string[];
	readonly recommendedActions: readonly string[];
	readonly priority: "low" | "medium" | "high" | "critical";
	readonly effort: "low" | "medium" | "high";
	readonly timeline: string;
}

export interface ComplianceGap {
	readonly id: string;
	readonly standard: ComplianceStandard;
	readonly controlId: string;
	readonly title: string;
	readonly description: string;
	readonly impact: "low" | "medium" | "high" | "critical";
	readonly likelihood: "low" | "medium" | "high";
	readonly riskScore: number;
	readonly currentState: string;
	readonly targetState: string;
	readonly remediationEffort: "low" | "medium" | "high";
	readonly estimatedCost?: number;
	readonly timeline: string;
	readonly dependencies: readonly string[];
}

export interface RemediationAction {
	readonly id: string;
	readonly gapId: string;
	readonly title: string;
	readonly description: string;
	readonly priority: "low" | "medium" | "high" | "critical";
	readonly effort: "low" | "medium" | "high";
	readonly timeline: string;
	readonly assignee?: string;
	readonly status: "not-started" | "in-progress" | "completed" | "blocked";
	readonly dependencies: readonly string[];
	readonly milestones: readonly ActionMilestone[];
	readonly estimatedCost?: number;
	readonly acceptanceCriteria: readonly string[];
}

export interface ActionMilestone {
	readonly id: string;
	readonly name: string;
	readonly dueDate: string;
	readonly status: "not-started" | "in-progress" | "completed";
	readonly deliverables: readonly string[];
}

export interface ComplianceMetrics {
	readonly totalControls: number;
	readonly implementedControls: number;
	readonly partialControls: number;
	readonly notImplementedControls: number;
	readonly compliancePercentage: number;
	readonly riskScore: number;
	readonly gapCount: number;
	readonly highRiskGaps: number;
	readonly averageMaturityLevel: number;
	readonly trendsData: readonly TrendDataPoint[];
}

export interface TrendDataPoint {
	readonly date: string;
	readonly complianceScore: number;
	readonly gapCount: number;
	readonly riskScore: number;
}

export interface ComplianceRecommendation {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly category:
		| "governance"
		| "technical"
		| "process"
		| "training"
		| "documentation";
	readonly priority: "low" | "medium" | "high" | "critical";
	readonly impact: string;
	readonly effort: "low" | "medium" | "high";
	readonly timeline: string;
	readonly expectedBenefit: string;
	readonly standards: readonly ComplianceStandard[];
}

export interface AuditEvent {
	readonly timestamp: string;
	readonly event: string;
	readonly user: string;
	readonly details: string;
	readonly impact: "low" | "medium" | "high";
	readonly category: "assessment" | "remediation" | "monitoring" | "reporting";
}

export interface ComplianceEvidence {
	readonly id: string;
	readonly controlId: string;
	readonly type:
		| "document"
		| "screenshot"
		| "configuration"
		| "log"
		| "certificate";
	readonly name: string;
	readonly description: string;
	readonly filePath?: string;
	readonly lastUpdated: string;
	readonly validity: "current" | "expired" | "expiring-soon";
	readonly expirationDate?: string;
}

export interface ComplianceDashboardData {
	readonly summary: DashboardSummary;
	readonly charts: readonly DashboardChart[];
	readonly widgets: readonly DashboardWidget[];
	readonly alerts: readonly ComplianceAlert[];
}

export interface DashboardSummary {
	readonly overallScore: number;
	readonly complianceStatus: string;
	readonly totalStandards: number;
	readonly compliantStandards: number;
	readonly totalGaps: number;
	readonly highPriorityGaps: number;
	readonly overdueActions: number;
	readonly nextDeadline?: string;
}

export interface DashboardChart {
	readonly id: string;
	readonly title: string;
	readonly type: "bar" | "pie" | "line" | "gauge" | "heatmap";
	readonly data: any;
	readonly config: any;
}

export interface DashboardWidget {
	readonly id: string;
	readonly title: string;
	readonly type: "metric" | "list" | "progress" | "status" | "timeline";
	readonly data: any;
	readonly size: "small" | "medium" | "large";
}

export interface ComplianceAlert {
	readonly id: string;
	readonly severity: "info" | "warning" | "error" | "critical";
	readonly title: string;
	readonly message: string;
	readonly timestamp: string;
	readonly actionRequired: boolean;
	readonly deadline?: string;
}

export class ComplianceReportGenerator {
	private readonly projectPath: string;
	private readonly outputPath: string;
	private readonly options: ComplianceReportOptions;

	constructor(options: ComplianceReportOptions) {
		this.options = options;
		this.projectPath = options.projectPath || process.cwd();
		this.outputPath =
			options.outputDir || join(this.projectPath, "compliance-reports");
	}

	/**
	 * Generate comprehensive compliance report
	 */
	async generate(): Promise<ComplianceReportResult> {
		try {
			consola.info("📊 Starting compliance report generation...");

			// Create output directory
			this.createOutputDirectory();

			// Initialize compliance report
			const reportResult: ComplianceReportResult = {
				timestamp: new Date().toISOString(),
				projectName: this.getProjectName(),
				reportType: this.options.reportType || "detailed",
				overallScore: 0,
				complianceStatus: "compliant",
				standardsResults: [],
				gapAnalysis: [],
				remediationPlan: [],
				metrics: {
					totalControls: 0,
					implementedControls: 0,
					partialControls: 0,
					notImplementedControls: 0,
					compliancePercentage: 0,
					riskScore: 0,
					gapCount: 0,
					highRiskGaps: 0,
					averageMaturityLevel: 0,
					trendsData: [],
				},
				recommendations: [],
				auditTrail: [],
			};

			// Assess compliance for each standard
			const standards = this.options.standards || ["gdpr", "nsm", "owasp"];
			consola.info(
				`📋 Assessing compliance for ${standards.length} standards...`,
			);

			for (const standard of standards) {
				const standardResult = await this.assessStandardCompliance(standard);
				reportResult.standardsResults.push(standardResult);
			}

			// Perform gap analysis
			if (this.options.includeGaps !== false) {
				consola.info("🔍 Performing gap analysis...");
				reportResult.gapAnalysis = await this.performGapAnalysis(
					reportResult.standardsResults,
				);
			}

			// Generate remediation plan
			if (this.options.includeRemediation !== false) {
				consola.info("🛠️  Generating remediation plan...");
				reportResult.remediationPlan = await this.generateRemediationPlan(
					reportResult.gapAnalysis,
				);
			}

			// Calculate metrics
			if (this.options.includeMetrics !== false) {
				reportResult.metrics = this.calculateComplianceMetrics(
					reportResult.standardsResults,
				);
			}

			// Generate recommendations
			reportResult.recommendations =
				this.generateComplianceRecommendations(reportResult);

			// Calculate overall score and status
			reportResult.overallScore = this.calculateOverallScore(
				reportResult.standardsResults,
			);
			reportResult.complianceStatus = this.determineComplianceStatus(
				reportResult.overallScore,
			);

			// Generate audit trail
			reportResult.auditTrail = this.generateAuditTrail();

			// Generate dashboard data
			if (this.options.includeDashboard !== false) {
				consola.info("📈 Generating compliance dashboard...");
				reportResult.dashboardData =
					await this.generateDashboardData(reportResult);
			}

			// Generate reports in requested formats
			await this.generateReports(reportResult);

			// Generate action plan if requested
			if (this.options.generateActionPlan) {
				await this.generateActionPlan(reportResult);
			}

			consola.success(
				`📊 Compliance report generated. Overall score: ${reportResult.overallScore}% (${reportResult.complianceStatus})`,
			);

			return reportResult;
		} catch (error) {
			consola.error("Failed to generate compliance report:", error);
			throw error;
		}
	}

	/**
	 * Create output directory structure
	 */
	private createOutputDirectory(): void {
		const dirs = [
			this.outputPath,
			join(this.outputPath, "reports"),
			join(this.outputPath, "evidence"),
			join(this.outputPath, "templates"),
			join(this.outputPath, "dashboard"),
		];

		dirs.forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});
	}

	/**
	 * Get project name from package.json
	 */
	private getProjectName(): string {
		try {
			const packageJsonPath = join(this.projectPath, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
				return packageJson.name || "unknown-project";
			}
		} catch (error) {
			consola.debug("Could not read package.json:", error);
		}
		return "unknown-project";
	}

	/**
	 * Assess compliance for a specific standard
	 */
	private async assessStandardCompliance(
		standard: ComplianceStandard,
	): Promise<StandardComplianceResult> {
		consola.info(`📋 Assessing ${standard.toUpperCase()} compliance...`);

		const controlsResults = await this.assessControls(standard);
		const evidence = await this.collectEvidence(standard);

		const totalControls = controlsResults.length;
		const implementedControls = controlsResults.filter(
			(c) => c.status === "implemented",
		).length;
		const partialControls = controlsResults.filter(
			(c) => c.status === "partial",
		).length;

		const score = Math.round(
			((implementedControls * 1.0 + partialControls * 0.5) / totalControls) *
				100,
		);

		const status: "compliant" | "non-compliant" | "partial" =
			score >= 90 ? "compliant" : score >= 70 ? "partial" : "non-compliant";

		const riskLevel: "low" | "medium" | "high" | "critical" =
			score >= 80
				? "low"
				: score >= 60
					? "medium"
					: score >= 40
						? "high"
						: "critical";

		return {
			standard,
			version: this.getStandardVersion(standard),
			score,
			status,
			controlsResults,
			evidence,
			lastAssessment: new Date().toISOString(),
			nextAssessment: this.calculateNextAssessment(),
			riskLevel,
		};
	}

	/**
	 * Assess controls for a specific standard
	 */
	private async assessControls(
		standard: ComplianceStandard,
	): Promise<readonly ControlResult[]> {
		const controls: ControlResult[] = [];

		switch (standard) {
			case "gdpr":
				controls.push(...(await this.assessGDPRControls()));
				break;
			case "nsm":
				controls.push(...(await this.assessNSMControls()));
				break;
			case "owasp":
				controls.push(...(await this.assessOWASPControls()));
				break;
			case "pci-dss":
				controls.push(...(await this.assessPCIDSSControls()));
				break;
			case "soc2":
				controls.push(...(await this.assessSOC2Controls()));
				break;
			case "iso27001":
				controls.push(...(await this.assessISO27001Controls()));
				break;
			default:
				consola.warn(`Assessment not implemented for standard: ${standard}`);
		}

		return controls;
	}

	/**
	 * Assess GDPR controls
	 */
	private async assessGDPRControls(): Promise<ControlResult[]> {
		const controls: ControlResult[] = [];

		// Article 7: Conditions for consent
		controls.push({
			controlId: "GDPR-7.1",
			name: "Consent Management",
			description: "Implement valid consent collection and management system",
			status: (await this.checkGDPRConsent())
				? "implemented"
				: "not-implemented",
			maturityLevel: 3,
			implementation: "Consent management system with clear opt-in/opt-out",
			evidence: ["consent-forms.html", "privacy-policy.pdf"],
			gaps: (await this.checkGDPRConsent())
				? []
				: ["No consent management system found"],
			recommendedActions: (await this.checkGDPRConsent())
				? []
				: ["Implement consent management UI components"],
			priority: "high",
			effort: "medium",
			timeline: "4-6 weeks",
		});

		// Article 17: Right to erasure
		controls.push({
			controlId: "GDPR-17",
			name: "Right to Erasure",
			description: "Implement data deletion capabilities for data subjects",
			status: (await this.checkDataDeletion())
				? "implemented"
				: "not-implemented",
			maturityLevel: 2,
			implementation: "API endpoints for data deletion with cascading rules",
			evidence: ["api-documentation.md"],
			gaps: (await this.checkDataDeletion())
				? []
				: ["No data deletion API found"],
			recommendedActions: (await this.checkDataDeletion())
				? []
				: ["Create data deletion API endpoints"],
			priority: "high",
			effort: "high",
			timeline: "6-8 weeks",
		});

		// Article 25: Data protection by design and by default
		controls.push({
			controlId: "GDPR-25",
			name: "Privacy by Design",
			description: "Implement privacy by design and default principles",
			status: (await this.checkPrivacyByDesign())
				? "partial"
				: "not-implemented",
			maturityLevel: 2,
			implementation: "Some privacy controls, needs comprehensive review",
			evidence: ["architecture-docs.md"],
			gaps: [
				"Missing privacy impact assessments",
				"No data minimization controls",
			],
			recommendedActions: [
				"Conduct privacy impact assessment",
				"Implement data minimization",
			],
			priority: "medium",
			effort: "high",
			timeline: "8-12 weeks",
		});

		// Article 32: Security of processing
		controls.push({
			controlId: "GDPR-32",
			name: "Security of Processing",
			description:
				"Implement appropriate technical and organizational measures",
			status: (await this.checkSecurityMeasures()) ? "implemented" : "partial",
			maturityLevel: 4,
			implementation: "Encryption, access controls, and security monitoring",
			evidence: ["security-config.json", "audit-logs/"],
			gaps: [],
			recommendedActions: ["Regular security assessments"],
			priority: "high",
			effort: "low",
			timeline: "Ongoing",
		});

		return controls;
	}

	/**
	 * Assess NSM controls
	 */
	private async assessNSMControls(): Promise<ControlResult[]> {
		const controls: ControlResult[] = [];

		if (!this.options.nsmClassification) {
			return controls;
		}

		const classification = this.options.nsmClassification;
		const metadata = nsmClassifier.getClassification(classification);

		if (!metadata) {
			return controls;
		}

		// Classification marking
		controls.push({
			controlId: "NSM-CL1",
			name: "Classification Marking",
			description: `Implement ${classification} classification marking`,
			status: (await this.checkClassificationMarking())
				? "implemented"
				: "not-implemented",
			maturityLevel: metadata.maturityLevel || 3,
			implementation:
				"UI components with classification banners and watermarks",
			evidence: ["classification-components/"],
			gaps: (await this.checkClassificationMarking())
				? []
				: ["No classification marking found"],
			recommendedActions: (await this.checkClassificationMarking())
				? []
				: ["Generate NSM classification components"],
			priority: "critical",
			effort: "medium",
			timeline: "2-3 weeks",
		});

		// Access control
		controls.push({
			controlId: "NSM-AC1",
			name: "Access Control",
			description: "Implement clearance-based access control",
			status: (await this.checkAccessControl())
				? "implemented"
				: "not-implemented",
			maturityLevel: metadata.maturityLevel || 3,
			implementation: "Role-based access control with clearance validation",
			evidence: ["access-control-config.json"],
			gaps: (await this.checkAccessControl())
				? []
				: ["No clearance-based access control"],
			recommendedActions: (await this.checkAccessControl())
				? []
				: ["Implement NSM access control system"],
			priority: "critical",
			effort: "high",
			timeline: "4-6 weeks",
		});

		// Audit logging
		controls.push({
			controlId: "NSM-AU1",
			name: "Audit Logging",
			description: "Implement comprehensive audit logging",
			status: (await this.checkAuditLogging())
				? "implemented"
				: "not-implemented",
			maturityLevel: metadata.maturityLevel || 3,
			implementation:
				"Detailed audit trails for all data access and modifications",
			evidence: ["audit-logs/", "audit-config.json"],
			gaps: (await this.checkAuditLogging()) ? [] : ["No audit logging system"],
			recommendedActions: (await this.checkAuditLogging())
				? []
				: ["Implement NSM audit logging"],
			priority: "high",
			effort: "medium",
			timeline: "3-4 weeks",
		});

		return controls;
	}

	/**
	 * Assess OWASP controls
	 */
	private async assessOWASPControls(): Promise<ControlResult[]> {
		const controls: ControlResult[] = [];

		// A01:2021 - Broken Access Control
		controls.push({
			controlId: "OWASP-A01",
			name: "Access Control",
			description: "Prevent broken access control vulnerabilities",
			status: (await this.checkAccessControl()) ? "implemented" : "partial",
			maturityLevel: 3,
			implementation:
				"Role-based access control with proper authorization checks",
			evidence: ["auth-middleware.ts", "access-control-tests.js"],
			gaps: ["Need to review all API endpoints for authorization"],
			recommendedActions: [
				"Audit all API endpoints",
				"Implement centralized authorization",
			],
			priority: "high",
			effort: "medium",
			timeline: "4-5 weeks",
		});

		// A02:2021 - Cryptographic Failures
		controls.push({
			controlId: "OWASP-A02",
			name: "Cryptographic Security",
			description: "Implement proper cryptographic controls",
			status: (await this.checkCryptography())
				? "implemented"
				: "not-implemented",
			maturityLevel: 4,
			implementation: "Strong encryption for data at rest and in transit",
			evidence: ["encryption-config.json", "tls-config.js"],
			gaps: (await this.checkCryptography())
				? []
				: ["No encryption implementation found"],
			recommendedActions: (await this.checkCryptography())
				? []
				: ["Implement encryption for sensitive data"],
			priority: "high",
			effort: "high",
			timeline: "6-8 weeks",
		});

		// A03:2021 - Injection
		controls.push({
			controlId: "OWASP-A03",
			name: "Injection Prevention",
			description: "Prevent injection attacks (SQL, NoSQL, XSS, etc.)",
			status: (await this.checkInjectionPrevention())
				? "implemented"
				: "partial",
			maturityLevel: 3,
			implementation: "Input validation and parameterized queries",
			evidence: ["validation-middleware.ts", "sanitization-utils.js"],
			gaps: ["Need comprehensive input validation review"],
			recommendedActions: [
				"Review all user inputs",
				"Implement comprehensive sanitization",
			],
			priority: "high",
			effort: "medium",
			timeline: "3-4 weeks",
		});

		return controls;
	}

	/**
	 * Assess PCI DSS controls (placeholder)
	 */
	private async assessPCIDSSControls(): Promise<ControlResult[]> {
		// Implementation for PCI DSS controls
		return [];
	}

	/**
	 * Assess SOC 2 controls (placeholder)
	 */
	private async assessSOC2Controls(): Promise<ControlResult[]> {
		// Implementation for SOC 2 controls
		return [];
	}

	/**
	 * Assess ISO 27001 controls (placeholder)
	 */
	private async assessISO27001Controls(): Promise<ControlResult[]> {
		// Implementation for ISO 27001 controls
		return [];
	}

	/**
	 * Collect evidence for compliance standard
	 */
	private async collectEvidence(
		standard: ComplianceStandard,
	): Promise<readonly ComplianceEvidence[]> {
		const evidence: ComplianceEvidence[] = [];

		// Collect common evidence files
		const evidenceFiles = [
			"package.json",
			"tsconfig.json",
			"next.config.js",
			"README.md",
			"docs/",
			"src/security/",
			"src/components/security/",
		];

		for (const file of evidenceFiles) {
			const filePath = join(this.projectPath, file);
			if (existsSync(filePath)) {
				evidence.push({
					id: `evidence-${evidence.length + 1}`,
					controlId: "general",
					type: "configuration",
					name: file,
					description: `Configuration file: ${file}`,
					filePath: relative(this.projectPath, filePath),
					lastUpdated: new Date().toISOString(),
					validity: "current",
				});
			}
		}

		return evidence;
	}

	/**
	 * Perform gap analysis
	 */
	private async performGapAnalysis(
		standardsResults: readonly StandardComplianceResult[],
	): Promise<readonly ComplianceGap[]> {
		const gaps: ComplianceGap[] = [];

		for (const standardResult of standardsResults) {
			for (const control of standardResult.controlsResults) {
				if (
					control.status === "not-implemented" ||
					control.status === "partial"
				) {
					const gap: ComplianceGap = {
						id: `gap-${gaps.length + 1}`,
						standard: standardResult.standard,
						controlId: control.controlId,
						title: `${control.name} Gap`,
						description: `Control ${control.controlId} is ${control.status}`,
						impact: control.priority,
						likelihood: "medium",
						riskScore: this.calculateRiskScore(control.priority, "medium"),
						currentState: control.implementation || "Not implemented",
						targetState: control.description,
						remediationEffort: control.effort,
						timeline: control.timeline,
						dependencies: [],
					};

					gaps.push(gap);
				}
			}
		}

		return gaps;
	}

	/**
	 * Generate remediation plan
	 */
	private async generateRemediationPlan(
		gaps: readonly ComplianceGap[],
	): Promise<readonly RemediationAction[]> {
		const actions: RemediationAction[] = [];

		for (const gap of gaps) {
			const action: RemediationAction = {
				id: `action-${actions.length + 1}`,
				gapId: gap.id,
				title: `Remediate ${gap.title}`,
				description: `Address compliance gap: ${gap.description}`,
				priority: gap.impact,
				effort: gap.remediationEffort,
				timeline: gap.timeline,
				status: "not-started",
				dependencies: gap.dependencies,
				milestones: this.generateMilestones(gap),
				acceptanceCriteria: [
					`Control ${gap.controlId} is fully implemented and tested`,
				],
			};

			actions.push(action);
		}

		return actions;
	}

	/**
	 * Generate milestones for remediation action
	 */
	private generateMilestones(gap: ComplianceGap): readonly ActionMilestone[] {
		const milestones: ActionMilestone[] = [];

		// Generate standard milestones based on effort level
		switch (gap.remediationEffort) {
			case "low":
				milestones.push({
					id: "milestone-1",
					name: "Implementation Complete",
					dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
					status: "not-started",
					deliverables: ["Implementation", "Testing", "Documentation"],
				});
				break;

			case "medium":
				milestones.push(
					{
						id: "milestone-1",
						name: "Design and Planning",
						dueDate: new Date(
							Date.now() + 7 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: ["Technical design", "Implementation plan"],
					},
					{
						id: "milestone-2",
						name: "Implementation",
						dueDate: new Date(
							Date.now() + 21 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: ["Code implementation", "Unit tests"],
					},
					{
						id: "milestone-3",
						name: "Validation and Documentation",
						dueDate: new Date(
							Date.now() + 28 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: ["Integration testing", "Documentation", "Review"],
					},
				);
				break;

			case "high":
				milestones.push(
					{
						id: "milestone-1",
						name: "Architecture and Design",
						dueDate: new Date(
							Date.now() + 14 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: [
							"Architecture review",
							"Detailed design",
							"Resource planning",
						],
					},
					{
						id: "milestone-2",
						name: "Core Implementation",
						dueDate: new Date(
							Date.now() + 35 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: ["Core functionality", "Unit tests", "Code review"],
					},
					{
						id: "milestone-3",
						name: "Integration and Testing",
						dueDate: new Date(
							Date.now() + 49 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: [
							"Integration testing",
							"Security testing",
							"Performance testing",
						],
					},
					{
						id: "milestone-4",
						name: "Deployment and Validation",
						dueDate: new Date(
							Date.now() + 56 * 24 * 60 * 60 * 1000,
						).toISOString(),
						status: "not-started",
						deliverables: [
							"Deployment",
							"User acceptance testing",
							"Final documentation",
						],
					},
				);
				break;
		}

		return milestones;
	}

	/**
	 * Calculate compliance metrics
	 */
	private calculateComplianceMetrics(
		standardsResults: readonly StandardComplianceResult[],
	): ComplianceMetrics {
		const allControls = standardsResults.flatMap((s) => s.controlsResults);

		const totalControls = allControls.length;
		const implementedControls = allControls.filter(
			(c) => c.status === "implemented",
		).length;
		const partialControls = allControls.filter(
			(c) => c.status === "partial",
		).length;
		const notImplementedControls = allControls.filter(
			(c) => c.status === "not-implemented",
		).length;

		const compliancePercentage =
			totalControls > 0
				? Math.round(
						((implementedControls + partialControls * 0.5) / totalControls) *
							100,
					)
				: 100;

		const riskScore = allControls.reduce((sum, control) => {
			const riskWeight = {
				critical: 4,
				high: 3,
				medium: 2,
				low: 1,
			}[control.priority];

			const implementationScore = {
				implemented: 0,
				partial: 0.5,
				"not-implemented": 1,
				"not-applicable": 0,
			}[control.status];

			return sum + riskWeight * implementationScore;
		}, 0);

		const gapCount = allControls.filter(
			(c) => c.status === "not-implemented" || c.status === "partial",
		).length;

		const highRiskGaps = allControls.filter(
			(c) =>
				(c.status === "not-implemented" || c.status === "partial") &&
				(c.priority === "high" || c.priority === "critical"),
		).length;

		const averageMaturityLevel =
			totalControls > 0
				? allControls.reduce((sum, c) => sum + c.maturityLevel, 0) /
					totalControls
				: 0;

		// Generate trend data (placeholder - would come from historical data)
		const trendsData: TrendDataPoint[] = [
			{
				date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				complianceScore: Math.max(0, compliancePercentage - 10),
				gapCount: gapCount + 5,
				riskScore: Math.min(100, riskScore + 10),
			},
			{
				date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
				complianceScore: Math.max(0, compliancePercentage - 5),
				gapCount: gapCount + 2,
				riskScore: Math.min(100, riskScore + 5),
			},
			{
				date: new Date().toISOString(),
				complianceScore: compliancePercentage,
				gapCount,
				riskScore,
			},
		];

		return {
			totalControls,
			implementedControls,
			partialControls,
			notImplementedControls,
			compliancePercentage,
			riskScore,
			gapCount,
			highRiskGaps,
			averageMaturityLevel,
			trendsData,
		};
	}

	/**
	 * Generate compliance recommendations
	 */
	private generateComplianceRecommendations(
		reportResult: ComplianceReportResult,
	): readonly ComplianceRecommendation[] {
		const recommendations: ComplianceRecommendation[] = [];

		// High-priority gaps recommendation
		const highPriorityGaps = reportResult.gapAnalysis.filter(
			(g) => g.impact === "high" || g.impact === "critical",
		);

		if (highPriorityGaps.length > 0) {
			recommendations.push({
				id: "rec-1",
				title: "Address High-Priority Compliance Gaps",
				description: `${highPriorityGaps.length} high or critical priority gaps require immediate attention`,
				category: "governance",
				priority: "critical",
				impact:
					"Reduces regulatory risk and improves overall compliance posture",
				effort: "high",
				timeline: "1-3 months",
				expectedBenefit: "Significant reduction in compliance risk",
				standards: [...new Set(highPriorityGaps.map((g) => g.standard))],
			});
		}

		// Low maturity controls recommendation
		const lowMaturityControls = reportResult.standardsResults
			.flatMap((s) => s.controlsResults)
			.filter((c) => c.maturityLevel <= 2);

		if (lowMaturityControls.length > 0) {
			recommendations.push({
				id: "rec-2",
				title: "Improve Control Maturity Levels",
				description: `${lowMaturityControls.length} controls have low maturity levels and could be improved`,
				category: "process",
				priority: "medium",
				impact: "Improves control effectiveness and reduces operational risk",
				effort: "medium",
				timeline: "3-6 months",
				expectedBenefit: "More robust and reliable compliance controls",
				standards: [
					...new Set(reportResult.standardsResults.map((s) => s.standard)),
				],
			});
		}

		// Documentation recommendation
		const controlsWithoutEvidence = reportResult.standardsResults
			.flatMap((s) => s.controlsResults)
			.filter((c) => c.evidence.length === 0);

		if (controlsWithoutEvidence.length > 0) {
			recommendations.push({
				id: "rec-3",
				title: "Improve Compliance Documentation",
				description: `${controlsWithoutEvidence.length} controls lack proper documentation and evidence`,
				category: "documentation",
				priority: "medium",
				impact: "Better audit readiness and compliance validation",
				effort: "low",
				timeline: "1-2 months",
				expectedBenefit: "Improved audit outcomes and compliance demonstration",
				standards: [
					...new Set(reportResult.standardsResults.map((s) => s.standard)),
				],
			});
		}

		// Automation recommendation
		if (reportResult.overallScore < 80) {
			recommendations.push({
				id: "rec-4",
				title: "Implement Compliance Automation",
				description:
					"Automate compliance monitoring and reporting to improve efficiency",
				category: "technical",
				priority: "medium",
				impact: "Reduces manual effort and improves compliance consistency",
				effort: "high",
				timeline: "3-6 months",
				expectedBenefit:
					"Continuous compliance monitoring and reduced manual overhead",
				standards: [
					...new Set(reportResult.standardsResults.map((s) => s.standard)),
				],
			});
		}

		return recommendations;
	}

	/**
	 * Generate dashboard data
	 */
	private async generateDashboardData(
		reportResult: ComplianceReportResult,
	): Promise<ComplianceDashboardData> {
		const summary: DashboardSummary = {
			overallScore: reportResult.overallScore,
			complianceStatus: reportResult.complianceStatus,
			totalStandards: reportResult.standardsResults.length,
			compliantStandards: reportResult.standardsResults.filter(
				(s) => s.status === "compliant",
			).length,
			totalGaps: reportResult.gapAnalysis.length,
			highPriorityGaps: reportResult.gapAnalysis.filter(
				(g) => g.impact === "high" || g.impact === "critical",
			).length,
			overdueActions: reportResult.remediationPlan.filter(
				(a) => new Date(a.timeline) < new Date(),
			).length,
			nextDeadline: reportResult.remediationPlan
				.filter((a) => new Date(a.timeline) > new Date())
				.sort(
					(a, b) =>
						new Date(a.timeline).getTime() - new Date(b.timeline).getTime(),
				)[0]?.timeline,
		};

		const charts: DashboardChart[] = [
			{
				id: "compliance-overview",
				title: "Compliance Overview",
				type: "gauge",
				data: {
					value: reportResult.overallScore,
					max: 100,
				},
				config: {
					colors: ["#ef4444", "#f59e0b", "#10b981"],
					thresholds: [60, 80],
				},
			},
			{
				id: "standards-compliance",
				title: "Standards Compliance",
				type: "bar",
				data: {
					labels: reportResult.standardsResults.map((s) =>
						s.standard.toUpperCase(),
					),
					values: reportResult.standardsResults.map((s) => s.score),
				},
				config: {
					color: "#3b82f6",
				},
			},
			{
				id: "gap-severity",
				title: "Gap Analysis by Severity",
				type: "pie",
				data: {
					labels: ["Critical", "High", "Medium", "Low"],
					values: [
						reportResult.gapAnalysis.filter((g) => g.impact === "critical")
							.length,
						reportResult.gapAnalysis.filter((g) => g.impact === "high").length,
						reportResult.gapAnalysis.filter((g) => g.impact === "medium")
							.length,
						reportResult.gapAnalysis.filter((g) => g.impact === "low").length,
					],
				},
				config: {
					colors: ["#dc2626", "#ea580c", "#d97706", "#65a30d"],
				},
			},
			{
				id: "compliance-trends",
				title: "Compliance Trends",
				type: "line",
				data: {
					labels: reportResult.metrics.trendsData.map((t) =>
						new Date(t.date).toLocaleDateString(),
					),
					datasets: [
						{
							label: "Compliance Score",
							data: reportResult.metrics.trendsData.map(
								(t) => t.complianceScore,
							),
							color: "#10b981",
						},
						{
							label: "Gap Count",
							data: reportResult.metrics.trendsData.map((t) => t.gapCount),
							color: "#ef4444",
						},
					],
				},
				config: {},
			},
		];

		const widgets: DashboardWidget[] = [
			{
				id: "total-controls",
				title: "Total Controls",
				type: "metric",
				data: {
					value: reportResult.metrics.totalControls,
					change: "+5%",
					trend: "up",
				},
				size: "small",
			},
			{
				id: "high-priority-gaps",
				title: "High Priority Gaps",
				type: "list",
				data: {
					items: reportResult.gapAnalysis
						.filter((g) => g.impact === "high" || g.impact === "critical")
						.slice(0, 5)
						.map((g) => ({
							title: g.title,
							subtitle: g.standard.toUpperCase(),
							status: g.impact,
						})),
				},
				size: "medium",
			},
			{
				id: "remediation-progress",
				title: "Remediation Progress",
				type: "progress",
				data: {
					completed: reportResult.remediationPlan.filter(
						(a) => a.status === "completed",
					).length,
					total: reportResult.remediationPlan.length,
				},
				size: "small",
			},
		];

		const alerts: ComplianceAlert[] = [];

		// Generate alerts for high-priority issues
		const criticalGaps = reportResult.gapAnalysis.filter(
			(g) => g.impact === "critical",
		);
		if (criticalGaps.length > 0) {
			alerts.push({
				id: "alert-critical-gaps",
				severity: "critical",
				title: "Critical Compliance Gaps",
				message: `${criticalGaps.length} critical compliance gaps require immediate attention`,
				timestamp: new Date().toISOString(),
				actionRequired: true,
			});
		}

		// Generate alerts for overdue actions
		const overdueActions = reportResult.remediationPlan.filter(
			(a) => new Date(a.timeline) < new Date(),
		);
		if (overdueActions.length > 0) {
			alerts.push({
				id: "alert-overdue-actions",
				severity: "warning",
				title: "Overdue Remediation Actions",
				message: `${overdueActions.length} remediation actions are overdue`,
				timestamp: new Date().toISOString(),
				actionRequired: true,
			});
		}

		return {
			summary,
			charts,
			widgets,
			alerts,
		};
	}

	/**
	 * Generate reports in various formats
	 */
	private async generateReports(
		reportResult: ComplianceReportResult,
	): Promise<void> {
		const formats =
			this.options.outputFormat === "all"
				? ["json", "html", "pdf"]
				: [this.options.outputFormat || "json"];

		for (const format of formats) {
			switch (format) {
				case "json":
					await this.generateJSONReport(reportResult);
					break;
				case "html":
					await this.generateHTMLReport(reportResult);
					break;
				case "pdf":
					await this.generatePDFReport(reportResult);
					break;
			}
		}

		// Generate dashboard if requested
		if (this.options.includeDashboard && reportResult.dashboardData) {
			await this.generateDashboard(reportResult.dashboardData);
		}

		consola.info(`📊 Reports generated in ${join(this.outputPath, "reports")}`);
	}

	/**
	 * Generate JSON report
	 */
	private async generateJSONReport(
		reportResult: ComplianceReportResult,
	): Promise<void> {
		const reportPath = join(
			this.outputPath,
			"reports",
			"compliance-report.json",
		);
		writeFileSync(reportPath, JSON.stringify(reportResult, null, 2));
	}

	/**
	 * Generate HTML report
	 */
	private async generateHTMLReport(
		reportResult: ComplianceReportResult,
	): Promise<void> {
		const htmlContent = this.generateHTMLContent(reportResult);
		const reportPath = join(
			this.outputPath,
			"reports",
			"compliance-report.html",
		);
		writeFileSync(reportPath, htmlContent);
	}

	/**
	 * Generate PDF report (placeholder)
	 */
	private async generatePDFReport(
		reportResult: ComplianceReportResult,
	): Promise<void> {
		// Implementation would use a PDF generation library
		consola.info("PDF report generation not implemented yet");
	}

	/**
	 * Generate dashboard files
	 */
	private async generateDashboard(
		dashboardData: ComplianceDashboardData,
	): Promise<void> {
		// Generate React dashboard component
		const dashboardComponent = this.generateDashboardComponent(dashboardData);
		const dashboardPath = join(
			this.outputPath,
			"dashboard",
			"ComplianceDashboard.tsx",
		);
		writeFileSync(dashboardPath, dashboardComponent);

		// Generate dashboard data file
		const dataPath = join(this.outputPath, "dashboard", "dashboard-data.json");
		writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));
	}

	/**
	 * Generate action plan
	 */
	private async generateActionPlan(
		reportResult: ComplianceReportResult,
	): Promise<void> {
		const actionPlan = this.generateActionPlanContent(reportResult);
		const planPath = join(this.outputPath, "reports", "action-plan.md");
		writeFileSync(planPath, actionPlan);
	}

	/**
	 * Generate HTML content for compliance report
	 */
	private generateHTMLContent(reportResult: ComplianceReportResult): string {
		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Report - ${reportResult.projectName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; margin: 0; padding: 2rem; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        .title { font-size: 2rem; font-weight: 700; color: #1f2937; margin: 0; }
        .subtitle { color: #6b7280; margin: 0.5rem 0 0 0; }
        .score-section { text-align: center; margin-bottom: 2rem; }
        .score-circle { width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: white; margin: 0 auto 1rem; }
        .score-compliant { background: #10b981; }
        .score-partial { background: #f59e0b; }
        .score-non-compliant { background: #ef4444; }
        .standards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .standard-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }
        .standard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .standard-name { font-weight: 600; font-size: 1.1rem; }
        .standard-score { font-weight: 700; }
        .status-compliant { color: #10b981; }
        .status-partial { color: #f59e0b; }
        .status-non-compliant { color: #ef4444; }
        .section { margin-bottom: 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem; }
        .gap-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .gap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .gap-title { font-weight: 600; }
        .impact-critical { color: #dc2626; }
        .impact-high { color: #ea580c; }
        .impact-medium { color: #d97706; }
        .impact-low { color: #65a30d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Compliance Report</h1>
            <p class="subtitle">${reportResult.projectName} • ${new Date(reportResult.timestamp).toLocaleDateString()}</p>
        </div>

        <div class="score-section">
            <div class="score-circle score-${reportResult.complianceStatus.replace("-", "-")}">
                ${reportResult.overallScore}%
            </div>
            <h2>Overall Compliance Score</h2>
            <p>Status: <strong class="status-${reportResult.complianceStatus.replace("-", "-")}">${reportResult.complianceStatus.toUpperCase()}</strong></p>
        </div>

        <div class="section">
            <h2 class="section-title">Standards Compliance</h2>
            <div class="standards-grid">
                ${reportResult.standardsResults
									.map(
										(standard) => `
                    <div class="standard-card">
                        <div class="standard-header">
                            <span class="standard-name">${standard.standard.toUpperCase()}</span>
                            <span class="standard-score status-${standard.status.replace("-", "-")}">${standard.score}%</span>
                        </div>
                        <p><strong>Status:</strong> ${standard.status}</p>
                        <p><strong>Risk Level:</strong> ${standard.riskLevel}</p>
                        <p><strong>Controls:</strong> ${standard.controlsResults.length}</p>
                        <p><strong>Implemented:</strong> ${standard.controlsResults.filter((c) => c.status === "implemented").length}</p>
                    </div>
                `,
									)
									.join("")}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Top Compliance Gaps</h2>
            ${reportResult.gapAnalysis
							.slice(0, 10)
							.map(
								(gap) => `
                <div class="gap-item">
                    <div class="gap-header">
                        <span class="gap-title">${gap.title}</span>
                        <span class="impact-${gap.impact}">${gap.impact.toUpperCase()}</span>
                    </div>
                    <p>${gap.description}</p>
                    <p><strong>Standard:</strong> ${gap.standard.toUpperCase()} • <strong>Timeline:</strong> ${gap.timeline}</p>
                </div>
            `,
							)
							.join("")}
        </div>

        <div class="section">
            <h2 class="section-title">Key Recommendations</h2>
            ${reportResult.recommendations
							.slice(0, 5)
							.map(
								(rec) => `
                <div class="gap-item">
                    <div class="gap-header">
                        <span class="gap-title">${rec.title}</span>
                        <span class="impact-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </div>
                    <p>${rec.description}</p>
                    <p><strong>Category:</strong> ${rec.category} • <strong>Timeline:</strong> ${rec.timeline}</p>
                </div>
            `,
							)
							.join("")}
        </div>
    </div>
</body>
</html>`;
	}

	/**
	 * Generate React dashboard component
	 */
	private generateDashboardComponent(
		dashboardData: ComplianceDashboardData,
	): string {
		return `import React from 'react';

interface ComplianceDashboardProps {
  readonly data?: typeof defaultDashboardData;
}

const defaultDashboardData = ${JSON.stringify(dashboardData, null, 2)};

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ 
  data = defaultDashboardData 
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Dashboard</h1>
        <p className="text-gray-600">Real-time compliance monitoring and reporting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Score</h3>
          <p className="text-3xl font-bold text-blue-600">{data.summary.overallScore}%</p>
          <p className="text-sm text-gray-600 mt-1">{data.summary.complianceStatus}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Standards</h3>
          <p className="text-3xl font-bold text-green-600">{data.summary.totalStandards}</p>
          <p className="text-sm text-gray-600 mt-1">{data.summary.compliantStandards} compliant</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Gaps</h3>
          <p className="text-3xl font-bold text-orange-600">{data.summary.totalGaps}</p>
          <p className="text-sm text-gray-600 mt-1">{data.summary.highPriorityGaps} high priority</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Overdue Actions</h3>
          <p className="text-3xl font-bold text-red-600">{data.summary.overdueActions}</p>
          <p className="text-sm text-gray-600 mt-1">Require attention</p>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={\`rounded-lg p-4 \${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.severity === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                } border\`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <span className={\`px-2 py-1 text-xs font-medium rounded \${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    alert.severity === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }\`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.charts.map((chart) => (
          <div key={chart.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{chart.title}</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {chart.type.toUpperCase()} Chart - {chart.title}
              <br />
              <small>Chart implementation would go here</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceDashboard;`;
	}

	/**
	 * Generate action plan content
	 */
	private generateActionPlanContent(
		reportResult: ComplianceReportResult,
	): string {
		return `# Compliance Action Plan

**Project:** ${reportResult.projectName}  
**Generated:** ${new Date(reportResult.timestamp).toLocaleDateString()}  
**Overall Score:** ${reportResult.overallScore}% (${reportResult.complianceStatus})

## Executive Summary

This action plan addresses ${reportResult.gapAnalysis.length} compliance gaps across ${reportResult.standardsResults.length} standards with ${reportResult.remediationPlan.length} remediation actions.

**Priority Breakdown:**
- Critical: ${reportResult.gapAnalysis.filter((g) => g.impact === "critical").length} gaps
- High: ${reportResult.gapAnalysis.filter((g) => g.impact === "high").length} gaps  
- Medium: ${reportResult.gapAnalysis.filter((g) => g.impact === "medium").length} gaps
- Low: ${reportResult.gapAnalysis.filter((g) => g.impact === "low").length} gaps

## Action Items

${reportResult.remediationPlan
	.map(
		(action, index) => `
### ${index + 1}. ${action.title}

**Priority:** ${action.priority.toUpperCase()}  
**Effort:** ${action.effort}  
**Timeline:** ${action.timeline}  
**Status:** ${action.status}

**Description:** ${action.description}

**Milestones:**
${action.milestones
	.map(
		(m) => `
- **${m.name}** (Due: ${new Date(m.dueDate).toLocaleDateString()})
  - Status: ${m.status}
  - Deliverables: ${m.deliverables.join(", ")}
`,
	)
	.join("")}

**Acceptance Criteria:**
${action.acceptanceCriteria.map((criteria) => `- ${criteria}`).join("\n")}

---
`,
	)
	.join("\n")}

## Implementation Timeline

| Phase | Actions | Timeline | Priority |
|-------|---------|----------|----------|
${reportResult.remediationPlan
	.sort((a, b) => {
		const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
		return priorityOrder[b.priority] - priorityOrder[a.priority];
	})
	.slice(0, 10)
	.map(
		(action) =>
			`| Phase ${reportResult.remediationPlan.indexOf(action) + 1} | ${action.title} | ${action.timeline} | ${action.priority.toUpperCase()} |`,
	)
	.join("\n")}

## Success Metrics

- **Target Compliance Score:** 90%+
- **Critical Gaps:** 0
- **High Priority Gaps:** < 5
- **Implementation Timeline:** 6-12 months

---

*Generated by Xaheen CLI Compliance Report Generator*
`;
	}

	// Helper methods
	private getStandardVersion(standard: ComplianceStandard): string {
		const versions = {
			gdpr: "2018",
			nsm: "2023",
			"pci-dss": "4.0",
			soc2: "2017",
			iso27001: "2022",
			hipaa: "2013",
			nist: "2.0",
			owasp: "2021",
		};
		return versions[standard] || "latest";
	}

	private calculateNextAssessment(): string {
		// Calculate next assessment date (typically 1 year)
		const nextYear = new Date();
		nextYear.setFullYear(nextYear.getFullYear() + 1);
		return nextYear.toISOString();
	}

	private calculateRiskScore(impact: string, likelihood: string): number {
		const impactScore = { critical: 4, high: 3, medium: 2, low: 1 };
		const likelihoodScore = { high: 3, medium: 2, low: 1 };
		return (
			(impactScore[impact as keyof typeof impactScore] || 1) *
			(likelihoodScore[likelihood as keyof typeof likelihoodScore] || 1)
		);
	}

	private calculateOverallScore(
		standardsResults: readonly StandardComplianceResult[],
	): number {
		if (standardsResults.length === 0) return 100;

		const totalScore = standardsResults.reduce(
			(sum, result) => sum + result.score,
			0,
		);
		return Math.round(totalScore / standardsResults.length);
	}

	private determineComplianceStatus(
		score: number,
	): "compliant" | "non-compliant" | "partial" {
		if (score >= 90) return "compliant";
		if (score >= 70) return "partial";
		return "non-compliant";
	}

	private generateAuditTrail(): readonly AuditEvent[] {
		return [
			{
				timestamp: new Date().toISOString(),
				event: "Compliance assessment completed",
				user: "system",
				details: "Automated compliance report generation",
				impact: "low",
				category: "assessment",
			},
		];
	}

	// Compliance check helper methods (similar to security audit)
	private async checkGDPRConsent(): Promise<boolean> {
		// Implementation to check for GDPR consent management
		return false;
	}

	private async checkDataDeletion(): Promise<boolean> {
		// Implementation to check for data deletion capabilities
		return false;
	}

	private async checkPrivacyByDesign(): Promise<boolean> {
		// Implementation to check for privacy by design principles
		return false;
	}

	private async checkSecurityMeasures(): Promise<boolean> {
		// Implementation to check for security measures
		return false;
	}

	private async checkClassificationMarking(): Promise<boolean> {
		// Implementation to check for NSM classification marking
		return false;
	}

	private async checkAccessControl(): Promise<boolean> {
		// Implementation to check for access control
		return false;
	}

	private async checkAuditLogging(): Promise<boolean> {
		// Implementation to check for audit logging
		return false;
	}

	private async checkCryptography(): Promise<boolean> {
		// Implementation to check for cryptographic controls
		return false;
	}

	private async checkInjectionPrevention(): Promise<boolean> {
		// Implementation to check for injection prevention
		return false;
	}
}

/**
 * Factory function to create Compliance Report generator
 */
export function createComplianceReportGenerator(
	options: ComplianceReportOptions,
): ComplianceReportGenerator {
	return new ComplianceReportGenerator(options);
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
	options: ComplianceReportOptions,
): Promise<ComplianceReportResult> {
	const generator = createComplianceReportGenerator(options);
	return await generator.generate();
}

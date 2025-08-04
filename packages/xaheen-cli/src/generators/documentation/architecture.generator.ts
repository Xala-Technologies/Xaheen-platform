import { BaseGenerator } from "../base.generator";
import { TemplateLoader } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import type {
	DocumentationGeneratorOptions,
	DocumentationResult,
} from "./index";

export interface ArchitectureGeneratorOptions
	extends DocumentationGeneratorOptions {
	readonly architectureType:
		| "monolith"
		| "microservices"
		| "serverless"
		| "hybrid";
	readonly patterns: readonly string[];
	readonly components: readonly ArchitectureComponent[];
	readonly services: readonly ServiceDefinition[];
	readonly databases: readonly DatabaseDefinition[];
	readonly integrations: readonly IntegrationDefinition[];
	readonly securityModel: SecurityModel;
	readonly scalabilityRequirements: ScalabilityRequirements;
	readonly performanceRequirements: PerformanceRequirements;
	readonly complianceRequirements: readonly string[];
}

export interface ArchitectureComponent {
	readonly name: string;
	readonly type:
		| "frontend"
		| "backend"
		| "database"
		| "cache"
		| "queue"
		| "gateway"
		| "service";
	readonly description: string;
	readonly responsibilities: readonly string[];
	readonly dependencies: readonly string[];
	readonly interfaces: readonly ComponentInterface[];
	readonly deploymentUnit?: string;
	readonly scalingStrategy?: "horizontal" | "vertical" | "auto";
}

export interface ServiceDefinition {
	readonly name: string;
	readonly description: string;
	readonly boundedContext?: string;
	readonly endpoints: readonly string[];
	readonly database?: string;
	readonly messageQueues: readonly string[];
	readonly externalServices: readonly string[];
	readonly sla: ServiceLevelAgreement;
}

export interface DatabaseDefinition {
	readonly name: string;
	readonly type:
		| "relational"
		| "document"
		| "key-value"
		| "graph"
		| "time-series";
	readonly engine: string;
	readonly description: string;
	readonly schemas: readonly string[];
	readonly replicationStrategy?: string;
	readonly backupStrategy?: string;
}

export interface IntegrationDefinition {
	readonly name: string;
	readonly type:
		| "rest-api"
		| "graphql"
		| "grpc"
		| "webhook"
		| "message-queue"
		| "event-stream";
	readonly provider: string;
	readonly description: string;
	readonly authentication: string;
	readonly rateLimit?: RateLimit;
	readonly errorHandling: string;
}

export interface ComponentInterface {
	readonly name: string;
	readonly type: "api" | "event" | "command" | "query";
	readonly protocol: string;
	readonly specification?: string;
}

export interface SecurityModel {
	readonly authentication: readonly string[];
	readonly authorization: string;
	readonly dataEncryption: DataEncryption;
	readonly networkSecurity: NetworkSecurity;
	readonly compliance: readonly string[];
}

export interface DataEncryption {
	readonly atRest: boolean;
	readonly inTransit: boolean;
	readonly keyManagement: string;
	readonly algorithms: readonly string[];
}

export interface NetworkSecurity {
	readonly firewall: boolean;
	readonly vpn: boolean;
	readonly ddosProtection: boolean;
	readonly waf: boolean;
}

export interface ScalabilityRequirements {
	readonly expectedUsers: number;
	readonly peakTraffic: string;
	readonly dataGrowth: string;
	readonly geographicDistribution: readonly string[];
	readonly elasticity: ElasticityConfig;
}

export interface ElasticityConfig {
	readonly autoScaling: boolean;
	readonly scaleUpThreshold: number;
	readonly scaleDownThreshold: number;
	readonly minInstances: number;
	readonly maxInstances: number;
}

export interface PerformanceRequirements {
	readonly responseTime: ResponseTimeRequirements;
	readonly throughput: ThroughputRequirements;
	readonly availability: AvailabilityRequirements;
}

export interface ResponseTimeRequirements {
	readonly p50: string;
	readonly p95: string;
	readonly p99: string;
}

export interface ThroughputRequirements {
	readonly requestsPerSecond: number;
	readonly transactionsPerSecond: number;
	readonly dataProcessingRate: string;
}

export interface AvailabilityRequirements {
	readonly uptime: string;
	readonly rto: string; // Recovery Time Objective
	readonly rpo: string; // Recovery Point Objective
}

export interface ServiceLevelAgreement {
	readonly availability: string;
	readonly responseTime: string;
	readonly throughput: string;
	readonly errorRate: string;
}

export interface RateLimit {
	readonly requestsPerMinute: number;
	readonly burstCapacity: number;
}

export class ArchitectureDocsGenerator extends BaseGenerator<ArchitectureGeneratorOptions> {
	private readonly templateLoader: TemplateLoader;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateLoader = new TemplateLoader();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(
		options: ArchitectureGeneratorOptions,
	): Promise<DocumentationResult> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate main architecture document
			await this.generateArchitectureOverview(options, projectContext);

			// Generate system context diagram
			await this.generateSystemContextDiagram(options);

			// Generate container diagram
			await this.generateContainerDiagram(options);

			// Generate component diagrams
			await this.generateComponentDiagrams(options);

			// Generate deployment diagrams
			await this.generateDeploymentDiagrams(options);

			// Generate sequence diagrams
			await this.generateSequenceDiagrams(options);

			// Generate data flow diagrams
			await this.generateDataFlowDiagrams(options);

			// Generate security architecture
			await this.generateSecurityArchitecture(options);

			// Generate scalability documentation
			await this.generateScalabilityDocumentation(options);

			// Generate decision records
			await this.generateArchitecturalDecisionRecords(options);

			// Generate technology stack documentation
			await this.generateTechnologyStack(options, projectContext);

			// Generate integration patterns
			await this.generateIntegrationPatterns(options);

			this.logger.success("Architecture documentation generated successfully");

			const files = [
				`${options.outputDir}/docs/architecture/overview.md`,
				`${options.outputDir}/docs/architecture/system-context.md`,
				`${options.outputDir}/docs/architecture/containers.md`,
				`${options.outputDir}/docs/architecture/components.md`,
				`${options.outputDir}/docs/architecture/deployment.md`,
				`${options.outputDir}/docs/architecture/security.md`,
				`${options.outputDir}/docs/architecture/scalability.md`,
				`${options.outputDir}/docs/architecture/decisions/`,
				`${options.outputDir}/docs/architecture/diagrams/system-context.mmd`,
				`${options.outputDir}/docs/architecture/diagrams/container-diagram.mmd`,
				`${options.outputDir}/docs/architecture/diagrams/deployment.mmd`,
				`${options.outputDir}/docs/architecture/diagrams/data-flow.mmd`,
				`${options.outputDir}/docs/architecture/diagrams/sequence-diagrams.mmd`,
				`${options.outputDir}/docs/architecture/technology-stack.md`,
				`${options.outputDir}/docs/architecture/integration-patterns.md`,
				`${options.outputDir}/docs/architecture/quality-attributes.md`,
			];

			const commands = [
				"npm install --save-dev @mermaid-js/mermaid-cli",
				"npm install --save-dev plantuml",
				"npm install --save-dev structurizr-cli",
			];

			const nextSteps = [
				"Review and validate the architecture documentation",
				"Update diagrams with actual component relationships",
				"Add specific technology versions and configurations",
				"Create architectural decision records for key decisions",
				"Set up automatic diagram generation in CI/CD",
				"Schedule regular architecture review sessions",
				"Integrate architecture docs with code documentation",
			];

			return {
				success: true,
				message: `Architecture documentation for '${options.projectName}' generated successfully`,
				files,
				commands,
				nextSteps,
			};
		} catch (error) {
			this.logger.error("Failed to generate architecture documentation", error);
			return {
				success: false,
				message: "Failed to generate architecture documentation",
				files: [],
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async validateOptions(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.architectureType) {
			throw new Error("Architecture type is required");
		}

		if (!options.components || options.components.length === 0) {
			throw new Error("At least one component must be defined");
		}
	}

	private async generateArchitectureOverview(
		options: ArchitectureGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const overviewData = {
			projectName: options.projectName,
			projectType: options.projectType,
			architectureType: options.architectureType,
			description: options.description,
			version: options.version,
			lastUpdated: new Date().toISOString().split("T")[0],
			patterns: options.patterns,
			components: options.components,
			services: options.services,
			qualityAttributes: this.generateQualityAttributes(options),
			constraints: this.generateConstraints(options),
			assumptions: this.generateAssumptions(options),
			stakeholders: this.generateStakeholders(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/overview.md.hbs",
			`${options.outputDir}/docs/architecture/overview.md`,
			overviewData,
		);
	}

	private async generateSystemContextDiagram(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const contextData = {
			projectName: options.projectName,
			system: {
				name: options.projectName,
				description: options.description,
				users: this.extractUsers(options),
				externalSystems: this.extractExternalSystems(options),
			},
			mermaidDiagram: this.generateMermaidSystemContext(options),
			plantUMLDiagram: this.generatePlantUMLSystemContext(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/system-context.md.hbs",
			`${options.outputDir}/docs/architecture/system-context.md`,
			contextData,
		);

		// Generate Mermaid diagram file
		await this.templateManager.renderTemplate(
			"documentation/architecture/diagrams/system-context.mmd.hbs",
			`${options.outputDir}/docs/architecture/diagrams/system-context.mmd`,
			{ diagram: contextData.mermaidDiagram },
		);
	}

	private async generateContainerDiagram(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const containerData = {
			projectName: options.projectName,
			containers: this.mapComponentsToContainers(options.components),
			relationships: this.generateContainerRelationships(options.components),
			mermaidDiagram: this.generateMermaidContainerDiagram(options),
			c4Diagram: this.generateC4ContainerDiagram(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/containers.md.hbs",
			`${options.outputDir}/docs/architecture/containers.md`,
			containerData,
		);

		// Generate Mermaid diagram file
		await this.templateManager.renderTemplate(
			"documentation/architecture/diagrams/container-diagram.mmd.hbs",
			`${options.outputDir}/docs/architecture/diagrams/container-diagram.mmd`,
			{ diagram: containerData.mermaidDiagram },
		);
	}

	private async generateComponentDiagrams(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const componentData = {
			projectName: options.projectName,
			components: options.components.map((component) => ({
				...component,
				diagram: this.generateComponentDiagram(component, options),
				interactions: this.generateComponentInteractions(
					component,
					options.components,
				),
			})),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/components.md.hbs",
			`${options.outputDir}/docs/architecture/components.md`,
			componentData,
		);
	}

	private async generateDeploymentDiagrams(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const deploymentData = {
			projectName: options.projectName,
			architectureType: options.architectureType,
			environments: ["development", "staging", "production"],
			deploymentUnits: this.generateDeploymentUnits(options),
			infrastructure: this.generateInfrastructureComponents(options),
			networkTopology: this.generateNetworkTopology(options),
			mermaidDiagram: this.generateMermaidDeploymentDiagram(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/deployment.md.hbs",
			`${options.outputDir}/docs/architecture/deployment.md`,
			deploymentData,
		);

		// Generate Mermaid diagram file
		await this.templateManager.renderTemplate(
			"documentation/architecture/diagrams/deployment.mmd.hbs",
			`${options.outputDir}/docs/architecture/diagrams/deployment.mmd`,
			{ diagram: deploymentData.mermaidDiagram },
		);
	}

	private async generateSequenceDiagrams(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const sequences = this.generateKeySequences(options);

		for (const sequence of sequences) {
			await this.templateManager.renderTemplate(
				"documentation/architecture/diagrams/sequence.mmd.hbs",
				`${options.outputDir}/docs/architecture/diagrams/sequence-${sequence.name}.mmd`,
				{ sequence },
			);
		}

		// Generate sequence diagram index
		await this.templateManager.renderTemplate(
			"documentation/architecture/sequence-diagrams.md.hbs",
			`${options.outputDir}/docs/architecture/sequence-diagrams.md`,
			{ sequences, projectName: options.projectName },
		);
	}

	private async generateDataFlowDiagrams(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const dataFlowData = {
			projectName: options.projectName,
			dataStores: options.databases,
			dataFlows: this.generateDataFlows(options),
			mermaidDiagram: this.generateMermaidDataFlow(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/data-flow.md.hbs",
			`${options.outputDir}/docs/architecture/data-flow.md`,
			dataFlowData,
		);

		// Generate Mermaid diagram file
		await this.templateManager.renderTemplate(
			"documentation/architecture/diagrams/data-flow.mmd.hbs",
			`${options.outputDir}/docs/architecture/diagrams/data-flow.mmd`,
			{ diagram: dataFlowData.mermaidDiagram },
		);
	}

	private async generateSecurityArchitecture(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const securityData = {
			projectName: options.projectName,
			securityModel: options.securityModel,
			threatModel: this.generateThreatModel(options),
			securityControls: this.generateSecurityControls(options),
			complianceMapping: this.generateComplianceMapping(options),
			securityDiagram: this.generateSecurityDiagram(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/security.md.hbs",
			`${options.outputDir}/docs/architecture/security.md`,
			securityData,
		);
	}

	private async generateScalabilityDocumentation(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const scalabilityData = {
			projectName: options.projectName,
			requirements: options.scalabilityRequirements,
			performanceRequirements: options.performanceRequirements,
			scalingStrategies: this.generateScalingStrategies(options),
			bottlenecks: this.identifyPotentialBottlenecks(options),
			monitoring: this.generateMonitoringStrategy(options),
			loadTesting: this.generateLoadTestingStrategy(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/scalability.md.hbs",
			`${options.outputDir}/docs/architecture/scalability.md`,
			scalabilityData,
		);
	}

	private async generateArchitecturalDecisionRecords(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const decisions = this.generateADRs(options);

		for (const decision of decisions) {
			await this.templateManager.renderTemplate(
				"documentation/architecture/adr/adr-template.md.hbs",
				`${options.outputDir}/docs/architecture/decisions/ADR-${decision.number.toString().padStart(4, "0")}-${decision.slug}.md`,
				decision,
			);
		}

		// Generate ADR index
		await this.templateManager.renderTemplate(
			"documentation/architecture/adr/index.md.hbs",
			`${options.outputDir}/docs/architecture/decisions/README.md`,
			{ decisions, projectName: options.projectName },
		);
	}

	private async generateTechnologyStack(
		options: ArchitectureGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const techStack = {
			projectName: options.projectName,
			runtime: options.runtime,
			framework: options.framework,
			frontend: this.extractFrontendTechnologies(projectContext),
			backend: this.extractBackendTechnologies(projectContext),
			databases: options.databases,
			infrastructure: this.extractInfrastructureTechnologies(options),
			monitoring: this.extractMonitoringTechnologies(options),
			security: this.extractSecurityTechnologies(options),
			devops: this.extractDevOpsTechnologies(options),
			thirdParty: options.integrations,
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/technology-stack.md.hbs",
			`${options.outputDir}/docs/architecture/technology-stack.md`,
			techStack,
		);
	}

	private async generateIntegrationPatterns(
		options: ArchitectureGeneratorOptions,
	): Promise<void> {
		const integrationData = {
			projectName: options.projectName,
			patterns: this.analyzeIntegrationPatterns(options),
			integrations: options.integrations,
			messagingPatterns: this.generateMessagingPatterns(options),
			apiPatterns: this.generateAPIPatterns(options),
			eventPatterns: this.generateEventPatterns(options),
		};

		await this.templateManager.renderTemplate(
			"documentation/architecture/integration-patterns.md.hbs",
			`${options.outputDir}/docs/architecture/integration-patterns.md`,
			integrationData,
		);
	}

	// Helper methods for generating various components and diagrams

	private generateQualityAttributes(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{
				name: "Performance",
				requirement: options.performanceRequirements.responseTime.p95,
				priority: "High",
			},
			{
				name: "Scalability",
				requirement: `${options.scalabilityRequirements.expectedUsers} concurrent users`,
				priority: "High",
			},
			{
				name: "Availability",
				requirement: options.performanceRequirements.availability.uptime,
				priority: "High",
			},
			{
				name: "Security",
				requirement: "Enterprise-grade security",
				priority: "Critical",
			},
			{
				name: "Maintainability",
				requirement: "Modular, testable architecture",
				priority: "Medium",
			},
			{
				name: "Reliability",
				requirement: `RTO: ${options.performanceRequirements.availability.rto}`,
				priority: "High",
			},
		];
	}

	private generateConstraints(options: ArchitectureGeneratorOptions): string[] {
		const constraints = [
			`Must use ${options.runtime} runtime`,
			`Architecture type: ${options.architectureType}`,
			`Must comply with: ${options.complianceRequirements.join(", ")}`,
		];

		if (options.framework) {
			constraints.push(`Framework: ${options.framework}`);
		}

		return constraints;
	}

	private generateAssumptions(options: ArchitectureGeneratorOptions): string[] {
		return [
			"Cloud-native deployment assumed",
			"Internet connectivity available for external integrations",
			"Standard HTTP/HTTPS protocols supported",
			"Database backup and recovery procedures in place",
			"DevOps team available for deployment and maintenance",
		];
	}

	private generateStakeholders(options: ArchitectureGeneratorOptions): any[] {
		return [
			{
				role: "Development Team",
				responsibility: "Implementation and maintenance",
				level: "Technical",
			},
			{
				role: "DevOps Team",
				responsibility: "Deployment and operations",
				level: "Technical",
			},
			{
				role: "Product Owner",
				responsibility: "Requirements and priorities",
				level: "Business",
			},
			{
				role: "Security Team",
				responsibility: "Security compliance and auditing",
				level: "Technical",
			},
			{
				role: "End Users",
				responsibility: "System usage and feedback",
				level: "Business",
			},
		];
	}

	private extractUsers(options: ArchitectureGeneratorOptions): any[] {
		return [
			{
				name: "End Users",
				type: "person",
				description: "Primary system users",
			},
			{
				name: "Administrators",
				type: "person",
				description: "System administrators",
			},
			{
				name: "API Consumers",
				type: "person",
				description: "External API users",
			},
		];
	}

	private extractExternalSystems(options: ArchitectureGeneratorOptions): any[] {
		return options.integrations.map((integration) => ({
			name: integration.name,
			type: "system",
			description: integration.description,
			provider: integration.provider,
		}));
	}

	private generateMermaidSystemContext(
		options: ArchitectureGeneratorOptions,
	): string {
		return `
graph TB
    User[Users] --> System["${options.projectName}"]
    Admin[Administrators] --> System
    System --> ExtAPI[External APIs]
    System --> DB[(Database)]
    `;
	}

	private generatePlantUMLSystemContext(
		options: ArchitectureGeneratorOptions,
	): string {
		return `
@startuml
!define RECTANGLE_STYLE fill:#lightblue
person "Users" as Users
person "Administrators" as Admin
system "${options.projectName}" as System
system "External APIs" as ExtAPI
database "Database" as DB

Users --> System : Uses
Admin --> System : Manages
System --> ExtAPI : Integrates
System --> DB : Stores data
@enduml
    `;
	}

	private mapComponentsToContainers(
		components: readonly ArchitectureComponent[],
	): any[] {
		return components.map((component) => ({
			name: component.name,
			type: component.type,
			description: component.description,
			technology: this.inferTechnology(component),
			responsibilities: component.responsibilities,
			interfaces: component.interfaces,
		}));
	}

	private generateContainerRelationships(
		components: readonly ArchitectureComponent[],
	): any[] {
		const relationships: any[] = [];

		components.forEach((component) => {
			component.dependencies.forEach((dependency) => {
				relationships.push({
					from: component.name,
					to: dependency,
					type: "depends on",
					protocol: "HTTPS/JSON",
				});
			});
		});

		return relationships;
	}

	private generateMermaidContainerDiagram(
		options: ArchitectureGeneratorOptions,
	): string {
		let diagram = "graph TB\n";

		options.components.forEach((component) => {
			diagram += `    ${component.name}["${component.name}<br/>${component.type}"]\n`;
		});

		options.components.forEach((component) => {
			component.dependencies.forEach((dependency) => {
				diagram += `    ${component.name} --> ${dependency}\n`;
			});
		});

		return diagram;
	}

	private generateC4ContainerDiagram(
		options: ArchitectureGeneratorOptions,
	): string {
		return `
Container_Boundary(c1, "${options.projectName}") {
    ${options.components
			.map(
				(component) =>
					`Container(${component.name}, "${component.name}", "${this.inferTechnology(component)}", "${component.description}")`,
			)
			.join("\n    ")}
}
    `;
	}

	private generateComponentDiagram(
		component: ArchitectureComponent,
		options: ArchitectureGeneratorOptions,
	): string {
		return `
graph TB
    subgraph "${component.name}"
        ${component.interfaces
					.map(
						(interface_) =>
							`${interface_.name}["${interface_.name}<br/>${interface_.type}"]`,
					)
					.join("\n        ")}
    end
    `;
	}

	private generateComponentInteractions(
		component: ArchitectureComponent,
		allComponents: readonly ArchitectureComponent[],
	): any[] {
		return component.dependencies.map((dependency) => {
			const targetComponent = allComponents.find((c) => c.name === dependency);
			return {
				target: dependency,
				type: "synchronous",
				protocol: "HTTPS",
				description: `${component.name} calls ${dependency}`,
			};
		});
	}

	private generateDeploymentUnits(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return options.components.map((component) => ({
			name: component.deploymentUnit || component.name,
			components: [component.name],
			environment: "containerized",
			scalingStrategy: component.scalingStrategy || "horizontal",
		}));
	}

	private generateInfrastructureComponents(
		options: ArchitectureGeneratorOptions,
	): any[] {
		const components = [
			{
				name: "Load Balancer",
				type: "infrastructure",
				purpose: "Traffic distribution",
			},
			{
				name: "Application Gateway",
				type: "infrastructure",
				purpose: "API management",
			},
			{
				name: "Container Registry",
				type: "infrastructure",
				purpose: "Image storage",
			},
			{
				name: "Monitoring System",
				type: "infrastructure",
				purpose: "System observability",
			},
		];

		options.databases.forEach((db) => {
			components.push({
				name: db.name,
				type: "database",
				purpose: `${db.type} database`,
			});
		});

		return components;
	}

	private generateNetworkTopology(options: ArchitectureGeneratorOptions): any {
		return {
			subnets: [
				{ name: "Public Subnet", purpose: "Load balancers and gateways" },
				{ name: "Private Subnet", purpose: "Application services" },
				{ name: "Database Subnet", purpose: "Database instances" },
			],
			securityGroups: [
				{ name: "Web Tier", ports: ["80", "443"] },
				{ name: "App Tier", ports: ["8080", "9090"] },
				{ name: "Database Tier", ports: ["5432", "3306"] },
			],
		};
	}

	private generateMermaidDeploymentDiagram(
		options: ArchitectureGeneratorOptions,
	): string {
		return `
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        subgraph "Application Tier"
            ${options.components
							.filter((c) => c.type === "frontend" || c.type === "backend")
							.map((c) => `${c.name}["${c.name}"]`)
							.join("\n            ")}
        end
        subgraph "Database Tier"
            ${options.databases.map((db) => `${db.name}[(${db.name})]`).join("\n            ")}
        end
    end
    `;
	}

	private generateKeySequences(options: ArchitectureGeneratorOptions): any[] {
		return [
			{
				name: "user-authentication",
				title: "User Authentication Flow",
				participants: ["User", "Frontend", "Auth Service", "Database"],
				steps: [
					"User->Frontend: Enter credentials",
					"Frontend->Auth Service: Authenticate user",
					"Auth Service->Database: Verify credentials",
					"Database->Auth Service: User data",
					"Auth Service->Frontend: JWT token",
					"Frontend->User: Login success",
				],
			},
			{
				name: "api-request",
				title: "API Request Flow",
				participants: ["Client", "API Gateway", "Service", "Database"],
				steps: [
					"Client->API Gateway: HTTP request",
					"API Gateway->Service: Forward request",
					"Service->Database: Query data",
					"Database->Service: Result set",
					"Service->API Gateway: Response",
					"API Gateway->Client: HTTP response",
				],
			},
		];
	}

	private generateDataFlows(options: ArchitectureGeneratorOptions): any[] {
		const flows: any[] = [];

		options.services.forEach((service) => {
			if (service.database) {
				flows.push({
					from: service.name,
					to: service.database,
					type: "read/write",
					data: "Business data",
				});
			}

			service.messageQueues.forEach((queue) => {
				flows.push({
					from: service.name,
					to: queue,
					type: "publish",
					data: "Events and messages",
				});
			});
		});

		return flows;
	}

	private generateMermaidDataFlow(
		options: ArchitectureGeneratorOptions,
	): string {
		let diagram = "graph LR\n";

		const flows = this.generateDataFlows(options);
		flows.forEach((flow) => {
			diagram += `    ${flow.from} -->|${flow.data}| ${flow.to}\n`;
		});

		return diagram;
	}

	private generateThreatModel(options: ArchitectureGeneratorOptions): any {
		return {
			assets: [
				"User data",
				"Authentication tokens",
				"Business logic",
				"Database contents",
			],
			threats: [
				{ name: "SQL Injection", impact: "High", likelihood: "Medium" },
				{ name: "Cross-Site Scripting", impact: "Medium", likelihood: "High" },
				{ name: "Data Breach", impact: "Critical", likelihood: "Low" },
				{ name: "DDoS Attack", impact: "High", likelihood: "Medium" },
			],
			mitigations: [
				"Input validation and sanitization",
				"SQL injection prevention (parameterized queries)",
				"Authentication and authorization controls",
				"Encryption at rest and in transit",
				"Network security controls",
				"Regular security testing",
			],
		};
	}

	private generateSecurityControls(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{
				control: "Authentication",
				implementation: options.securityModel.authentication.join(", "),
			},
			{
				control: "Authorization",
				implementation: options.securityModel.authorization,
			},
			{
				control: "Data Encryption",
				implementation: `At rest: ${options.securityModel.dataEncryption.atRest}, In transit: ${options.securityModel.dataEncryption.inTransit}`,
			},
			{ control: "Network Security", implementation: "Firewall, VPN, WAF" },
			{
				control: "Monitoring",
				implementation: "Security event logging and monitoring",
			},
		];
	}

	private generateComplianceMapping(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return options.complianceRequirements.map((requirement) => ({
			standard: requirement,
			controls: this.getComplianceControls(requirement),
			implementation: "To be documented",
		}));
	}

	private generateSecurityDiagram(
		options: ArchitectureGeneratorOptions,
	): string {
		return `
graph TB
    subgraph "Security Layers"
        WAF[Web Application Firewall]
        LB[Load Balancer with SSL]
        AUTH[Authentication Service]
        APP[Application Services]
        ENC[Encrypted Database]
    end
    
    User --> WAF
    WAF --> LB
    LB --> AUTH
    AUTH --> APP
    APP --> ENC
    `;
	}

	private generateScalingStrategies(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{
				component: "Web Services",
				strategy: "Horizontal scaling with load balancing",
				trigger: `CPU > ${options.scalabilityRequirements.elasticity.scaleUpThreshold}%`,
				implementation: "Auto-scaling groups",
			},
			{
				component: "Database",
				strategy: "Read replicas and connection pooling",
				trigger: "Query response time > 100ms",
				implementation: "Master-slave replication",
			},
			{
				component: "Cache",
				strategy: "Distributed caching with Redis Cluster",
				trigger: "Cache hit ratio < 80%",
				implementation: "Redis cluster with automatic failover",
			},
		];
	}

	private identifyPotentialBottlenecks(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{
				component: "Database",
				bottleneck: "Single point of failure",
				impact: "High",
				mitigation: "Implement read replicas and failover",
			},
			{
				component: "API Gateway",
				bottleneck: "Request rate limiting",
				impact: "Medium",
				mitigation: "Implement multiple gateway instances",
			},
			{
				component: "External APIs",
				bottleneck: "Third-party rate limits",
				impact: "Medium",
				mitigation: "Implement caching and retry logic",
			},
		];
	}

	private generateMonitoringStrategy(
		options: ArchitectureGeneratorOptions,
	): any {
		return {
			metrics: [
				"Response time percentiles (P50, P95, P99)",
				"Throughput (requests per second)",
				"Error rate and error types",
				"Resource utilization (CPU, Memory, Disk)",
				"Database performance metrics",
			],
			alerts: [
				"Response time > 1s for 5 minutes",
				"Error rate > 5% for 2 minutes",
				"CPU utilization > 80% for 10 minutes",
				"Database connection pool exhaustion",
			],
			dashboards: [
				"Application performance overview",
				"Infrastructure health",
				"Business metrics",
				"Security events",
			],
		};
	}

	private generateLoadTestingStrategy(
		options: ArchitectureGeneratorOptions,
	): any {
		return {
			scenarios: [
				{
					name: "Normal Load",
					users: Math.floor(
						options.scalabilityRequirements.expectedUsers * 0.7,
					),
					duration: "10 minutes",
					rampUp: "2 minutes",
				},
				{
					name: "Peak Load",
					users: options.scalabilityRequirements.expectedUsers,
					duration: "15 minutes",
					rampUp: "5 minutes",
				},
				{
					name: "Stress Test",
					users: Math.floor(
						options.scalabilityRequirements.expectedUsers * 1.5,
					),
					duration: "20 minutes",
					rampUp: "10 minutes",
				},
			],
			tools: ["JMeter", "k6", "Artillery"],
			metrics: [
				"Response time under load",
				"Throughput degradation",
				"Error rate increase",
				"Resource utilization patterns",
			],
		};
	}

	private generateADRs(options: ArchitectureGeneratorOptions): any[] {
		const decisions = [
			{
				number: 1,
				title: "Choose Architecture Pattern",
				slug: "architecture-pattern",
				status: "Accepted",
				date: new Date().toISOString().split("T")[0],
				context: `We need to choose an architecture pattern for ${options.projectName}`,
				decision: `We will use ${options.architectureType} architecture`,
				consequences: this.getArchitectureConsequences(
					options.architectureType,
				),
			},
			{
				number: 2,
				title: "Technology Stack Selection",
				slug: "technology-stack",
				status: "Accepted",
				date: new Date().toISOString().split("T")[0],
				context: "We need to select the primary technology stack",
				decision: `We will use ${options.runtime} as the primary runtime`,
				consequences: this.getTechnologyConsequences(options.runtime),
			},
		];

		// Add pattern-specific decisions
		options.patterns.forEach((pattern, index) => {
			decisions.push({
				number: index + 3,
				title: `Implement ${pattern} Pattern`,
				slug: pattern.toLowerCase().replace(/\s+/g, "-"),
				status: "Accepted",
				date: new Date().toISOString().split("T")[0],
				context: `We need to implement ${pattern} pattern for better architecture`,
				decision: `We will implement ${pattern} pattern`,
				consequences: this.getPatternConsequences(pattern),
			});
		});

		return decisions;
	}

	private inferTechnology(component: ArchitectureComponent): string {
		const techMap: Record<string, string> = {
			frontend: "React/TypeScript",
			backend: "Node.js/Express",
			database: "PostgreSQL",
			cache: "Redis",
			queue: "RabbitMQ",
			gateway: "API Gateway",
			service: "Microservice",
		};

		return techMap[component.type] || "TBD";
	}

	private extractFrontendTechnologies(projectContext: any): any[] {
		return [
			{ name: "React", version: "18.x", purpose: "UI Framework" },
			{ name: "TypeScript", version: "5.x", purpose: "Type Safety" },
			{ name: "Tailwind CSS", version: "3.x", purpose: "Styling" },
		];
	}

	private extractBackendTechnologies(projectContext: any): any[] {
		return [
			{ name: "Node.js", version: "20.x", purpose: "Runtime" },
			{ name: "Express", version: "4.x", purpose: "Web Framework" },
			{ name: "Prisma", version: "5.x", purpose: "ORM" },
		];
	}

	private extractInfrastructureTechnologies(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{ name: "Docker", version: "latest", purpose: "Containerization" },
			{ name: "Kubernetes", version: "1.28+", purpose: "Orchestration" },
			{ name: "Terraform", version: "1.5+", purpose: "Infrastructure as Code" },
		];
	}

	private extractMonitoringTechnologies(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{ name: "Prometheus", version: "latest", purpose: "Metrics Collection" },
			{ name: "Grafana", version: "latest", purpose: "Visualization" },
			{ name: "Jaeger", version: "latest", purpose: "Distributed Tracing" },
		];
	}

	private extractSecurityTechnologies(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{ name: "OAuth 2.0", version: "2.1", purpose: "Authentication" },
			{ name: "JWT", version: "latest", purpose: "Token Management" },
			{ name: "Let's Encrypt", version: "latest", purpose: "SSL Certificates" },
		];
	}

	private extractDevOpsTechnologies(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{ name: "GitHub Actions", version: "latest", purpose: "CI/CD" },
			{ name: "SonarQube", version: "latest", purpose: "Code Quality" },
			{ name: "Snyk", version: "latest", purpose: "Security Scanning" },
		];
	}

	private analyzeIntegrationPatterns(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{
				name: "API Gateway Pattern",
				usage: "Central API management and routing",
			},
			{
				name: "Circuit Breaker Pattern",
				usage: "Fault tolerance for external services",
			},
			{ name: "Retry Pattern", usage: "Handling transient failures" },
			{ name: "Bulkhead Pattern", usage: "Resource isolation" },
		];
	}

	private generateMessagingPatterns(
		options: ArchitectureGeneratorOptions,
	): any[] {
		return [
			{ name: "Publish-Subscribe", usage: "Event broadcasting" },
			{ name: "Request-Reply", usage: "Synchronous communication" },
			{ name: "Message Queue", usage: "Asynchronous processing" },
		];
	}

	private generateAPIPatterns(options: ArchitectureGeneratorOptions): any[] {
		return [
			{ name: "RESTful APIs", usage: "Standard HTTP operations" },
			{ name: "GraphQL", usage: "Flexible data fetching" },
			{ name: "gRPC", usage: "High-performance RPC" },
		];
	}

	private generateEventPatterns(options: ArchitectureGeneratorOptions): any[] {
		return [
			{ name: "Event Sourcing", usage: "Audit trail and state reconstruction" },
			{ name: "CQRS", usage: "Command and query separation" },
			{ name: "Saga Pattern", usage: "Distributed transaction management" },
		];
	}

	private getComplianceControls(requirement: string): string[] {
		const controlMap: Record<string, string[]> = {
			GDPR: [
				"Data encryption",
				"Access controls",
				"Audit logging",
				"Data retention policies",
			],
			SOC2: [
				"Security monitoring",
				"Access management",
				"Change management",
				"Incident response",
			],
			HIPAA: [
				"Data encryption",
				"Access controls",
				"Audit trails",
				"Risk assessments",
			],
			"PCI-DSS": [
				"Network security",
				"Encryption",
				"Access controls",
				"Monitoring",
			],
		};

		return controlMap[requirement] || ["To be defined"];
	}

	private getArchitectureConsequences(architectureType: string): string[] {
		const consequenceMap: Record<string, string[]> = {
			monolith: [
				"Simpler deployment",
				"Easier development",
				"Potential scaling issues",
			],
			microservices: [
				"Better scalability",
				"Technology diversity",
				"Increased complexity",
			],
			serverless: ["Auto-scaling", "Pay-per-use", "Vendor lock-in"],
			hybrid: ["Flexibility", "Complexity", "Mixed deployment models"],
		};

		return consequenceMap[architectureType] || ["To be evaluated"];
	}

	private getTechnologyConsequences(runtime: string): string[] {
		const consequenceMap: Record<string, string[]> = {
			node: [
				"JavaScript ecosystem",
				"Fast development",
				"Single-threaded limitations",
			],
			python: ["Rich libraries", "Readable code", "Performance considerations"],
			go: ["High performance", "Simple deployment", "Learning curve"],
			java: ["Enterprise features", "JVM ecosystem", "Memory overhead"],
			dotnet: ["Microsoft ecosystem", "Strong typing", "Platform dependencies"],
			rust: ["Memory safety", "High performance", "Steep learning curve"],
		};

		return consequenceMap[runtime] || ["To be evaluated"];
	}

	private getPatternConsequences(pattern: string): string[] {
		const consequenceMap: Record<string, string[]> = {
			DDD: [
				"Better domain modeling",
				"Clear boundaries",
				"Increased complexity",
			],
			CQRS: [
				"Read/write optimization",
				"Clear separation",
				"Data consistency challenges",
			],
			"Event Sourcing": [
				"Complete audit trail",
				"Flexibility",
				"Storage overhead",
			],
			"Clean Architecture": ["Testability", "Independence", "Initial overhead"],
		};

		return consequenceMap[pattern] || ["To be evaluated"];
	}
}

import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";

export interface AzureDevOpsGeneratorOptions {
	readonly projectName: string;
	readonly projectType:
		| "web"
		| "api"
		| "microservice"
		| "fullstack"
		| "mobile"
		| "desktop"
		| "cli";
	readonly runtime:
		| "node"
		| "python"
		| "go"
		| "java"
		| "dotnet"
		| "php"
		| "rust"
		| "cpp";
	readonly packageManager:
		| "npm"
		| "yarn"
		| "pnpm"
		| "bun"
		| "maven"
		| "gradle"
		| "dotnet"
		| "pip"
		| "poetry"
		| "cargo";
	readonly enableCI: boolean;
	readonly enableCD: boolean;
	readonly enableTesting: boolean;
	readonly enableSecurity: boolean;
	readonly enableCodeCoverage: boolean;
	readonly enableArtifacts: boolean;
	readonly enableApprovals: boolean;
	readonly enableGates: boolean;
	readonly enableMultiStage: boolean;
	readonly enableDocker: boolean;
	readonly enableKubernetes: boolean;
	readonly enableTerraform: boolean;
	readonly enableSonarQube: boolean;
	readonly enableWhiteSource: boolean;
	readonly enablePerformanceTesting: boolean;
	readonly enableLoadTesting: boolean;
	readonly enableComplianceScanning: boolean;
	readonly poolName: string;
	readonly vmImage: string;
	readonly environments: readonly AzureEnvironment[];
	readonly serviceConnections: readonly ServiceConnection[];
	readonly variableGroups: readonly string[];
	readonly buildConfiguration: string;
	readonly artifactName: string;
	readonly testFrameworks: readonly string[];
	readonly securityTools: readonly string[];
	readonly deploymentSlots: readonly string[];
	readonly azureSubscription: string;
	readonly resourceGroup: string;
	readonly appServiceName: string;
	readonly containerRegistry: string;
	readonly kubernetesCluster: string;
	readonly keyVault: string;
	readonly storageAccount: string;
	readonly applicationInsights: string;
	readonly triggers: {
		readonly ci: {
			readonly branches: readonly string[];
			readonly paths: readonly string[];
			readonly excludePaths: readonly string[];
		};
		readonly pr: {
			readonly branches: readonly string[];
			readonly paths: readonly string[];
			readonly drafts: boolean;
		};
		readonly scheduled: readonly ScheduledTrigger[];
	};
	readonly stages: readonly PipelineStage[];
}

export interface AzureEnvironment {
	readonly name: string;
	readonly displayName: string;
	readonly approvers: readonly string[];
	readonly conditions: readonly string[];
	readonly variables: Record<string, string>;
	readonly deploymentStrategy: "runOnce" | "rolling" | "canary" | "blueGreen";
}

export interface ServiceConnection {
	readonly name: string;
	readonly type: "azurerm" | "kubernetes" | "docker" | "npm" | "github";
	readonly endpoint: string;
}

export interface ScheduledTrigger {
	readonly cron: string;
	readonly branches: readonly string[];
	readonly always: boolean;
}

export interface PipelineStage {
	readonly name: string;
	readonly displayName: string;
	readonly dependsOn: readonly string[];
	readonly condition: string;
	readonly jobs: readonly PipelineJob[];
}

export interface PipelineJob {
	readonly name: string;
	readonly displayName: string;
	readonly pool: string;
	readonly dependsOn: readonly string[];
	readonly condition: string;
	readonly strategy: any;
	readonly steps: readonly PipelineStep[];
}

export interface PipelineStep {
	readonly task?: string;
	readonly script?: string;
	readonly displayName: string;
	readonly inputs?: Record<string, any>;
	readonly env?: Record<string, string>;
	readonly condition?: string;
	readonly continueOnError?: boolean;
	readonly timeoutInMinutes?: number;
}

export class AzureDevOpsGenerator extends BaseGenerator<AzureDevOpsGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: AzureDevOpsGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate main pipeline
			await this.generateMainPipeline(options, projectContext);

			// Generate CI pipeline if separate
			if (options.enableCI && options.enableCD && options.enableMultiStage) {
				await this.generateCIPipeline(options, projectContext);
			}

			// Generate CD pipeline if separate
			if (options.enableCD && options.enableMultiStage) {
				await this.generateCDPipeline(options);
			}

			// Generate security pipeline
			if (options.enableSecurity) {
				await this.generateSecurityPipeline(options);
			}

			// Generate variable templates
			await this.generateVariableTemplates(options);

			// Generate job templates
			await this.generateJobTemplates(options);

			// Generate stage templates
			await this.generateStageTemplates(options);

			// Generate deployment templates
			await this.generateDeploymentTemplates(options);

			// Generate Azure Resource Manager templates
			await this.generateARMTemplates(options);

			this.logger.success("Azure DevOps pipelines generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate Azure DevOps pipelines", error);
			throw error;
		}
	}

	private async validateOptions(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.runtime) {
			throw new Error("Runtime is required");
		}

		if (!options.poolName && !options.vmImage) {
			throw new Error("Either pool name or VM image is required");
		}

		if (options.enableCD && options.environments.length === 0) {
			throw new Error("At least one environment is required for CD");
		}
	}

	private async generateMainPipeline(
		options: AzureDevOpsGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const pipeline = {
			name: `${options.projectName}.$(Date:yyyyMMdd)$(Rev:.r)`,
			trigger: this.generateTriggers(options),
			pr: this.generatePRTriggers(options),
			schedules: options.triggers.scheduled,
			variables: this.generateGlobalVariables(options),
			pool: this.generatePool(options),
			stages: await this.generatePipelineStages(options, projectContext),
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/azure-pipelines.yml.hbs",
			"azure-pipelines.yml",
			pipeline,
		);
	}

	private async generateCIPipeline(
		options: AzureDevOpsGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const pipeline = {
			name: `${options.projectName}-CI.$(Date:yyyyMMdd)$(Rev:.r)`,
			trigger: {
				branches: {
					include: options.triggers.ci.branches,
				},
				paths: {
					include: options.triggers.ci.paths,
					exclude: options.triggers.ci.excludePaths,
				},
			},
			pool: this.generatePool(options),
			variables: this.generateCIVariables(options),
			stages: [
				{
					stage: "CI",
					displayName: "Continuous Integration",
					jobs: await this.generateCIJobs(options, projectContext),
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/ci-pipeline.yml.hbs",
			"pipelines/ci-pipeline.yml",
			pipeline,
		);
	}

	private async generateCDPipeline(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		const pipeline = {
			name: `${options.projectName}-CD.$(Date:yyyyMMdd)$(Rev:.r)`,
			trigger: "none",
			resources: {
				pipelines: [
					{
						pipeline: "CI",
						source: `${options.projectName}-CI`,
						trigger: {
							branches: {
								include: ["main"],
							},
						},
					},
				],
			},
			pool: this.generatePool(options),
			variables: this.generateCDVariables(options),
			stages: await this.generateDeploymentStages(options),
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/cd-pipeline.yml.hbs",
			"pipelines/cd-pipeline.yml",
			pipeline,
		);
	}

	private async generateSecurityPipeline(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		const pipeline = {
			name: `${options.projectName}-Security.$(Date:yyyyMMdd)$(Rev:.r)`,
			trigger: {
				branches: {
					include: ["main", "develop"],
				},
			},
			schedules: [
				{
					cron: "0 2 * * 1",
					displayName: "Weekly security scan",
					branches: {
						include: ["main"],
					},
					always: true,
				},
			],
			pool: this.generatePool(options),
			variables: this.generateSecurityVariables(options),
			stages: [
				{
					stage: "Security",
					displayName: "Security Scanning",
					jobs: [
						{
							job: "SecurityScan",
							displayName: "Security Scan",
							steps: this.generateSecuritySteps(options),
						},
					],
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/security-pipeline.yml.hbs",
			"pipelines/security-pipeline.yml",
			pipeline,
		);
	}

	private async generateVariableTemplates(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		// Global variables template
		const globalVariables = {
			variables: {
				buildConfiguration: options.buildConfiguration,
				artifactName: options.artifactName,
				vmImageName: options.vmImage,
				azureSubscription: options.azureSubscription,
				resourceGroupName: options.resourceGroup,
				webAppName: options.appServiceName,
			},
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/variables-global.yml.hbs",
			"pipelines/templates/variables-global.yml",
			globalVariables,
		);

		// Environment-specific variables
		for (const env of options.environments) {
			const envVariables = {
				variables: {
					environmentName: env.name,
					...env.variables,
				},
			};

			await this.templateManager.renderTemplate(
				"devops/azure-devops/templates/variables-env.yml.hbs",
				`pipelines/templates/variables-${env.name}.yml`,
				envVariables,
			);
		}
	}

	private async generateJobTemplates(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		// Build job template
		const buildJob = {
			parameters: {
				vmImage: {
					type: "string",
					default: options.vmImage,
				},
				buildConfiguration: {
					type: "string",
					default: options.buildConfiguration,
				},
			},
			jobs: [
				{
					job: "Build",
					displayName: "Build Application",
					pool: {
						vmImage: "${{ parameters.vmImage }}",
					},
					steps: this.generateBuildSteps(options),
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/job-build.yml.hbs",
			"pipelines/templates/job-build.yml",
			buildJob,
		);

		// Test job template
		const testJob = {
			parameters: {
				vmImage: {
					type: "string",
					default: options.vmImage,
				},
			},
			jobs: [
				{
					job: "Test",
					displayName: "Run Tests",
					pool: {
						vmImage: "${{ parameters.vmImage }}",
					},
					steps: this.generateTestSteps(options),
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/job-test.yml.hbs",
			"pipelines/templates/job-test.yml",
			testJob,
		);
	}

	private async generateStageTemplates(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		// CI stage template
		const ciStage = {
			parameters: {
				vmImage: {
					type: "string",
					default: options.vmImage,
				},
				buildConfiguration: {
					type: "string",
					default: options.buildConfiguration,
				},
			},
			stages: [
				{
					stage: "CI",
					displayName: "Continuous Integration",
					jobs: [
						{
							template: "job-build.yml",
							parameters: {
								vmImage: "${{ parameters.vmImage }}",
								buildConfiguration: "${{ parameters.buildConfiguration }}",
							},
						},
						{
							template: "job-test.yml",
							parameters: {
								vmImage: "${{ parameters.vmImage }}",
							},
						},
					],
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/stage-ci.yml.hbs",
			"pipelines/templates/stage-ci.yml",
			ciStage,
		);

		// CD stage template
		const cdStage = {
			parameters: {
				environment: {
					type: "string",
				},
				serviceConnection: {
					type: "string",
				},
				webAppName: {
					type: "string",
				},
			},
			stages: [
				{
					stage: "Deploy_${{ parameters.environment }}",
					displayName: "Deploy to ${{ parameters.environment }}",
					dependsOn: "CI",
					condition: "succeeded()",
					jobs: [
						{
							deployment: "Deploy",
							displayName: "Deploy Application",
							pool: {
								vmImage: options.vmImage,
							},
							environment: "${{ parameters.environment }}",
							strategy: {
								runOnce: {
									deploy: {
										steps: this.generateDeploymentSteps(options),
									},
								},
							},
						},
					],
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/stage-cd.yml.hbs",
			"pipelines/templates/stage-cd.yml",
			cdStage,
		);
	}

	private async generateDeploymentTemplates(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		// Web App deployment template
		const webAppDeployment = {
			parameters: {
				azureSubscription: {
					type: "string",
				},
				webAppName: {
					type: "string",
				},
				artifactName: {
					type: "string",
					default: options.artifactName,
				},
				deploymentSlot: {
					type: "string",
					default: "production",
				},
			},
			steps: [
				{
					task: "AzureWebApp@1",
					displayName: "Deploy to Azure Web App",
					inputs: {
						azureSubscription: "${{ parameters.azureSubscription }}",
						appType: "webAppLinux",
						appName: "${{ parameters.webAppName }}",
						deployToSlotOrASE:
							"${{ ne(parameters.deploymentSlot, 'production') }}",
						slotName: "${{ parameters.deploymentSlot }}",
						package:
							"$(Pipeline.Workspace)/${{ parameters.artifactName }}/*.zip",
						runtimeStack: this.getRuntimeStack(options.runtime),
						startUpCommand: this.getStartupCommand(options),
					},
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/deploy-webapp.yml.hbs",
			"pipelines/templates/deploy-webapp.yml",
			webAppDeployment,
		);

		// Container deployment template
		const containerDeployment = {
			parameters: {
				azureSubscription: {
					type: "string",
				},
				containerRegistry: {
					type: "string",
				},
				imageName: {
					type: "string",
				},
				imageTag: {
					type: "string",
				},
			},
			steps: [
				{
					task: "Docker@2",
					displayName: "Build and push container image",
					inputs: {
						containerRegistry: "${{ parameters.containerRegistry }}",
						repository: "${{ parameters.imageName }}",
						command: "buildAndPush",
						Dockerfile: "Dockerfile",
						tags: "${{ parameters.imageTag }}",
					},
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/templates/deploy-container.yml.hbs",
			"pipelines/templates/deploy-container.yml",
			containerDeployment,
		);
	}

	private async generateARMTemplates(
		options: AzureDevOpsGeneratorOptions,
	): Promise<void> {
		// App Service ARM template
		const appServiceTemplate = {
			$schema:
				"https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
			contentVersion: "1.0.0.0",
			parameters: {
				webAppName: {
					type: "string",
					metadata: {
						description: "Name of the web app",
					},
				},
				location: {
					type: "string",
					defaultValue: "[resourceGroup().location]",
					metadata: {
						description: "Location for all resources",
					},
				},
				sku: {
					type: "string",
					defaultValue: "F1",
					allowedValues: [
						"F1",
						"B1",
						"B2",
						"B3",
						"S1",
						"S2",
						"S3",
						"P1",
						"P2",
						"P3",
					],
					metadata: {
						description: "The SKU of App Service Plan",
					},
				},
			},
			variables: {
				appServicePlanName: "[concat(parameters('webAppName'), '-plan')]",
			},
			resources: [
				{
					type: "Microsoft.Web/serverfarms",
					apiVersion: "2020-06-01",
					name: "[variables('appServicePlanName')]",
					location: "[parameters('location')]",
					sku: {
						name: "[parameters('sku')]",
					},
					kind: "linux",
					properties: {
						reserved: true,
					},
				},
				{
					type: "Microsoft.Web/sites",
					apiVersion: "2020-06-01",
					name: "[parameters('webAppName')]",
					location: "[parameters('location')]",
					dependsOn: [
						"[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]",
					],
					properties: {
						serverFarmId:
							"[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]",
						siteConfig: {
							linuxFxVersion: this.getRuntimeStack(options.runtime),
							appSettings: [
								{
									name: "WEBSITE_NODE_DEFAULT_VERSION",
									value: "~20",
								},
							],
						},
					},
				},
			],
			outputs: {
				webAppName: {
					type: "string",
					value: "[parameters('webAppName')]",
				},
				webAppUrl: {
					type: "string",
					value:
						"[concat('https://', parameters('webAppName'), '.azurewebsites.net')]",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/arm/app-service.json.hbs",
			"arm/app-service.json",
			appServiceTemplate,
		);

		// Application Insights ARM template
		const appInsightsTemplate = {
			$schema:
				"https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
			contentVersion: "1.0.0.0",
			parameters: {
				appInsightsName: {
					type: "string",
				},
				location: {
					type: "string",
					defaultValue: "[resourceGroup().location]",
				},
			},
			resources: [
				{
					type: "Microsoft.Insights/components",
					apiVersion: "2020-02-02",
					name: "[parameters('appInsightsName')]",
					location: "[parameters('location')]",
					kind: "web",
					properties: {
						Application_Type: "web",
					},
				},
			],
			outputs: {
				instrumentationKey: {
					type: "string",
					value:
						"[reference(parameters('appInsightsName')).InstrumentationKey]",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/azure-devops/arm/app-insights.json.hbs",
			"arm/app-insights.json",
			appInsightsTemplate,
		);
	}

	private generateTriggers(options: AzureDevOpsGeneratorOptions): any {
		return {
			branches: {
				include: options.triggers.ci.branches,
			},
			paths: {
				include: options.triggers.ci.paths,
				exclude: options.triggers.ci.excludePaths,
			},
		};
	}

	private generatePRTriggers(options: AzureDevOpsGeneratorOptions): any {
		return {
			branches: {
				include: options.triggers.pr.branches,
			},
			paths: {
				include: options.triggers.pr.paths,
			},
			drafts: options.triggers.pr.drafts,
		};
	}

	private generatePool(options: AzureDevOpsGeneratorOptions): any {
		if (options.poolName) {
			return { name: options.poolName };
		}
		return { vmImage: options.vmImage };
	}

	private generateGlobalVariables(options: AzureDevOpsGeneratorOptions): any[] {
		const variables = [
			{ name: "buildConfiguration", value: options.buildConfiguration },
			{ name: "artifactName", value: options.artifactName },
		];

		options.variableGroups.forEach((group) => {
			variables.push({ group });
		});

		return variables;
	}

	private generateCIVariables(options: AzureDevOpsGeneratorOptions): any[] {
		return [
			{ template: "templates/variables-global.yml" },
			{
				name: "isMain",
				value: "$[eq(variables['Build.SourceBranch'], 'refs/heads/main')]",
			},
		];
	}

	private generateCDVariables(options: AzureDevOpsGeneratorOptions): any[] {
		return [
			{ template: "templates/variables-global.yml" },
			...options.environments.map((env) => ({
				template: `templates/variables-${env.name}.yml`,
			})),
		];
	}

	private generateSecurityVariables(
		options: AzureDevOpsGeneratorOptions,
	): any[] {
		return [
			{
				name: "securityScanResults",
				value: "$(Agent.TempDirectory)/security-results",
			},
		];
	}

	private async generatePipelineStages(
		options: AzureDevOpsGeneratorOptions,
		projectContext: any,
	): Promise<any[]> {
		const stages = [];

		if (options.enableCI) {
			stages.push({
				stage: "CI",
				displayName: "Continuous Integration",
				jobs: await this.generateCIJobs(options, projectContext),
			});
		}

		if (options.enableCD) {
			for (const env of options.environments) {
				stages.push({
					stage: `Deploy_${env.name}`,
					displayName: `Deploy to ${env.displayName}`,
					dependsOn: "CI",
					condition:
						env.conditions.length > 0
							? env.conditions.join(" and ")
							: "succeeded()",
					jobs: [
						{
							deployment: "Deploy",
							displayName: `Deploy to ${env.displayName}`,
							pool: this.generatePool(options),
							environment: env.name,
							strategy: this.generateDeploymentStrategy(env),
						},
					],
				});
			}
		}

		return stages;
	}

	private async generateCIJobs(
		options: AzureDevOpsGeneratorOptions,
		projectContext: any,
	): Promise<any[]> {
		const jobs = [];

		// Build job
		jobs.push({
			job: "Build",
			displayName: "Build Application",
			steps: this.generateBuildSteps(options),
		});

		// Test job
		if (options.enableTesting) {
			jobs.push({
				job: "Test",
				displayName: "Run Tests",
				dependsOn: "Build",
				steps: this.generateTestSteps(options),
			});
		}

		// Security job
		if (options.enableSecurity) {
			jobs.push({
				job: "Security",
				displayName: "Security Scan",
				dependsOn: "Build",
				steps: this.generateSecuritySteps(options),
			});
		}

		return jobs;
	}

	private async generateDeploymentStages(
		options: AzureDevOpsGeneratorOptions,
	): Promise<any[]> {
		return options.environments.map((env) => ({
			stage: `Deploy_${env.name}`,
			displayName: `Deploy to ${env.displayName}`,
			jobs: [
				{
					deployment: "Deploy",
					displayName: `Deploy to ${env.displayName}`,
					pool: this.generatePool(options),
					environment: env.name,
					strategy: this.generateDeploymentStrategy(env),
				},
			],
		}));
	}

	private generateBuildSteps(
		options: AzureDevOpsGeneratorOptions,
	): PipelineStep[] {
		const steps: PipelineStep[] = [];

		// Setup runtime
		switch (options.runtime) {
			case "node":
				steps.push({
					task: "NodeTool@0",
					displayName: "Use Node.js",
					inputs: {
						versionSpec: "20.x",
					},
				});
				break;
			case "python":
				steps.push({
					task: "UsePythonVersion@0",
					displayName: "Use Python",
					inputs: {
						versionSpec: "3.11",
					},
				});
				break;
			case "dotnet":
				steps.push({
					task: "UseDotNet@2",
					displayName: "Use .NET",
					inputs: {
						packageType: "sdk",
						version: "8.0.x",
					},
				});
				break;
			case "java":
				steps.push({
					task: "JavaToolInstaller@0",
					displayName: "Use Java",
					inputs: {
						versionSpec: "17",
						jdkArchitectureOption: "x64",
						jdkSourceOption: "PreInstalled",
					},
				});
				break;
		}

		// Install dependencies
		steps.push({
			script: this.getInstallCommand(options),
			displayName: "Install dependencies",
		});

		// Build
		steps.push({
			script: this.getBuildCommand(options),
			displayName: "Build application",
			env: {
				NODE_ENV: "production",
			},
		});

		// Publish artifacts
		if (options.enableArtifacts) {
			steps.push({
				task: "PublishBuildArtifacts@1",
				displayName: "Publish build artifacts",
				inputs: {
					pathToPublish: this.getBuildOutputPath(options),
					artifactName: options.artifactName,
				},
			});
		}

		return steps;
	}

	private generateTestSteps(
		options: AzureDevOpsGeneratorOptions,
	): PipelineStep[] {
		const steps: PipelineStep[] = [];

		// Run tests
		options.testFrameworks.forEach((framework) => {
			steps.push({
				script: this.getTestCommand(options, framework),
				displayName: `Run ${framework} tests`,
				continueOnError: false,
			});
		});

		// Publish test results
		if (options.enableTesting) {
			steps.push({
				task: "PublishTestResults@2",
				displayName: "Publish test results",
				inputs: {
					testResultsFormat: "JUnit",
					testResultsFiles: "**/test-results.xml",
					mergeTestResults: true,
				},
				condition: "succeededOrFailed()",
			});
		}

		// Publish code coverage
		if (options.enableCodeCoverage) {
			steps.push({
				task: "PublishCodeCoverageResults@1",
				displayName: "Publish code coverage",
				inputs: {
					codeCoverageTool: "Cobertura",
					summaryFileLocation: "**/coverage/cobertura-coverage.xml",
				},
			});
		}

		return steps;
	}

	private generateSecuritySteps(
		options: AzureDevOpsGeneratorOptions,
	): PipelineStep[] {
		const steps: PipelineStep[] = [];

		options.securityTools.forEach((tool) => {
			switch (tool) {
				case "whitesource":
					steps.push({
						task: "WhiteSource@21",
						displayName: "WhiteSource Bolt",
						inputs: {
							cwd: "$(System.DefaultWorkingDirectory)",
						},
					});
					break;
				case "sonarqube":
					steps.push({
						task: "SonarQubePrepare@5",
						displayName: "Prepare SonarQube analysis",
					});
					steps.push({
						task: "SonarQubeAnalyze@5",
						displayName: "Run SonarQube analysis",
					});
					steps.push({
						task: "SonarQubePublish@5",
						displayName: "Publish SonarQube results",
					});
					break;
				case "checkmarx":
					steps.push({
						task: "CxSAST@2",
						displayName: "Checkmarx SAST scan",
						inputs: {
							CheckmarxService: "Checkmarx",
							projectName: options.projectName,
							preset: "Checkmarx Default",
							folderExclusion: "node_modules, dist, coverage",
						},
					});
					break;
			}
		});

		return steps;
	}

	private generateDeploymentSteps(
		options: AzureDevOpsGeneratorOptions,
	): PipelineStep[] {
		return [
			{
				task: "DownloadBuildArtifacts@1",
				displayName: "Download build artifacts",
				inputs: {
					buildType: "current",
					downloadType: "single",
					artifactName: options.artifactName,
					downloadPath: "$(System.ArtifactsDirectory)",
				},
			},
			{
				task: "AzureWebApp@1",
				displayName: "Deploy to Azure Web App",
				inputs: {
					azureSubscription: options.azureSubscription,
					appType: "webAppLinux",
					appName: options.appServiceName,
					package: "$(System.ArtifactsDirectory)/**/*.zip",
					runtimeStack: this.getRuntimeStack(options.runtime),
					startUpCommand: this.getStartupCommand(options),
				},
			},
		];
	}

	private generateDeploymentStrategy(env: AzureEnvironment): any {
		const strategies = {
			runOnce: {
				deploy: {
					steps: [
						{ script: 'echo "Deploying to $(environmentName)"' },
						{ template: "templates/deploy-webapp.yml" },
					],
				},
			},
			rolling: {
				maxParallel: "25%",
				deploy: {
					steps: [
						{ script: 'echo "Rolling deployment to $(environmentName)"' },
						{ template: "templates/deploy-webapp.yml" },
					],
				},
			},
			canary: {
				increments: [10, 25, 50],
				preDeploy: {
					steps: [{ script: 'echo "Pre-deploy validation"' }],
				},
				deploy: {
					steps: [{ template: "templates/deploy-webapp.yml" }],
				},
				postRouteTraffic: {
					steps: [{ script: 'echo "Post-route traffic validation"' }],
				},
			},
		};

		return strategies[env.deploymentStrategy] || strategies.runOnce;
	}

	// Helper methods
	private getInstallCommand(options: AzureDevOpsGeneratorOptions): string {
		const commands = {
			npm: "npm ci",
			yarn: "yarn install --frozen-lockfile",
			pnpm: "pnpm install --frozen-lockfile",
			bun: "bun install --frozen-lockfile",
			maven: "mvn clean install -DskipTests",
			gradle: "./gradlew build -x test",
			dotnet: "dotnet restore",
			pip: "pip install -r requirements.txt",
			cargo: "cargo build --release",
		};
		return commands[options.packageManager] || "npm ci";
	}

	private getBuildCommand(options: AzureDevOpsGeneratorOptions): string {
		const commands = {
			npm: "npm run build",
			yarn: "yarn build",
			pnpm: "pnpm build",
			bun: "bun run build",
			maven: "mvn clean package",
			gradle: "./gradlew build",
			dotnet: "dotnet build --configuration Release",
			pip: "python setup.py build",
			cargo: "cargo build --release",
		};
		return commands[options.packageManager] || "npm run build";
	}

	private getTestCommand(
		options: AzureDevOpsGeneratorOptions,
		framework: string,
	): string {
		const commands = {
			npm: `npm run test:${framework}`,
			yarn: `yarn test:${framework}`,
			pnpm: `pnpm test:${framework}`,
			bun: `bun run test:${framework}`,
			maven: "mvn test",
			gradle: "./gradlew test",
			dotnet: "dotnet test",
			pip: "python -m pytest",
			cargo: "cargo test",
		};
		return commands[options.packageManager] || `npm run test:${framework}`;
	}

	private getBuildOutputPath(options: AzureDevOpsGeneratorOptions): string {
		const paths = {
			web: "dist/",
			api: "dist/",
			microservice: "dist/",
			fullstack: "dist/",
			mobile: "build/",
			desktop: "dist/",
		};
		return paths[options.projectType] || "dist/";
	}

	private getRuntimeStack(runtime: string): string {
		const stacks = {
			node: "NODE|20-lts",
			python: "PYTHON|3.11",
			dotnet: "DOTNETCORE|8.0",
			java: "JAVA|17-java17",
			php: "PHP|8.2",
			go: "GO|1.21",
		};
		return stacks[runtime] || "NODE|20-lts";
	}

	private getStartupCommand(options: AzureDevOpsGeneratorOptions): string {
		const commands = {
			node: "npm start",
			python: "python app.py",
			dotnet: "",
			java: "java -jar app.jar",
			php: "",
			go: "./main",
		};
		return commands[options.runtime] || "npm start";
	}
}

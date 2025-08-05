import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, TenantManagementOptions } from "./types";

/**
 * Tenant Management Generator
 * Generates comprehensive tenant management system with provisioning,
 * onboarding, customization, and lifecycle management features.
 */
export class TenantManagementGenerator extends BaseGenerator<TenantManagementOptions> {
	async generate(options: TenantManagementOptions): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(`Generating Tenant Management System: ${options.name}`);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create tenant management structure
			await this.createTenantManagementStructure(options, result);

			// Generate tenant provisioning system
			await this.generateTenantProvisioning(options, result);

			// Generate tenant onboarding system
			await this.generateTenantOnboarding(options, result);

			// Generate tenant customization features
			await this.generateTenantCustomization(options, result);

			// Generate tenant lifecycle management
			await this.generateTenantLifecycle(options, result);

			// Generate tenant monitoring and analytics
			await this.generateTenantMonitoring(options, result);

			// Generate API endpoints
			await this.generateAPIEndpoints(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`Tenant Management System generated successfully: ${options.name}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate Tenant Management System: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createTenantManagementStructure(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Create directory structure
		const directories = [
			"src/tenant/services",
			"src/tenant/controllers",
			"src/tenant/models",
			"src/tenant/dto",
			"src/provisioning/services",
			"src/provisioning/workflows",
			"src/onboarding/services",
			"src/onboarding/wizards",
			"src/customization/services",
			"src/customization/themes",
			"src/customization/branding",
			"src/lifecycle/services",
			"src/lifecycle/workflows",
			"src/monitoring/services",
			"src/analytics/services",
			"config/tenant",
			"migrations/tenant",
			"tests/tenant",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}

		// Generate main tenant management module
		const moduleTemplate = await this.loadTemplate(
			"tenant-management/tenant-management.module.ts.hbs",
		);
		const moduleContent = moduleTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const modulePath = path.join(
			baseDir,
			"src/tenant/TenantManagementModule.ts",
		);
		await fs.writeFile(modulePath, moduleContent);
		result.files.push(modulePath);
	}

	private async generateTenantProvisioning(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate tenant provisioning service
		const provisioningServiceTemplate = await this.loadTemplate(
			"tenant-management/provisioning/tenant-provisioning.service.ts.hbs",
		);
		const provisioningServiceContent = provisioningServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const provisioningServicePath = path.join(
			baseDir,
			"src/provisioning/services/TenantProvisioningService.ts",
		);
		await fs.writeFile(provisioningServicePath, provisioningServiceContent);
		result.files.push(provisioningServicePath);

		// Generate provisioning workflows based on type
		if (options.provisioning === "automatic") {
			await this.generateAutomaticProvisioning(options, baseDir, result);
		} else if (options.provisioning === "approval") {
			await this.generateApprovalProvisioning(options, baseDir, result);
		} else {
			await this.generateManualProvisioning(options, baseDir, result);
		}

		// Generate tenant factory
		const factoryTemplate = await this.loadTemplate(
			"tenant-management/provisioning/tenant.factory.ts.hbs",
		);
		const factoryContent = factoryTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const factoryPath = path.join(
			baseDir,
			"src/provisioning/services/TenantFactory.ts",
		);
		await fs.writeFile(factoryPath, factoryContent);
		result.files.push(factoryPath);
	}

	private async generateAutomaticProvisioning(
		options: TenantManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const automaticTemplate = await this.loadTemplate(
			"tenant-management/provisioning/workflows/automatic-provisioning.workflow.ts.hbs",
		);
		const automaticContent = automaticTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const automaticPath = path.join(
			baseDir,
			"src/provisioning/workflows/AutomaticProvisioningWorkflow.ts",
		);
		await fs.writeFile(automaticPath, automaticContent);
		result.files.push(automaticPath);
	}

	private async generateApprovalProvisioning(
		options: TenantManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const approvalTemplate = await this.loadTemplate(
			"tenant-management/provisioning/workflows/approval-provisioning.workflow.ts.hbs",
		);
		const approvalContent = approvalTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const approvalPath = path.join(
			baseDir,
			"src/provisioning/workflows/ApprovalProvisioningWorkflow.ts",
		);
		await fs.writeFile(approvalPath, approvalContent);
		result.files.push(approvalPath);
	}

	private async generateManualProvisioning(
		options: TenantManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const manualTemplate = await this.loadTemplate(
			"tenant-management/provisioning/workflows/manual-provisioning.workflow.ts.hbs",
		);
		const manualContent = manualTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const manualPath = path.join(
			baseDir,
			"src/provisioning/workflows/ManualProvisioningWorkflow.ts",
		);
		await fs.writeFile(manualPath, manualContent);
		result.files.push(manualPath);
	}

	private async generateTenantOnboarding(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate onboarding service
		const onboardingServiceTemplate = await this.loadTemplate(
			"tenant-management/onboarding/tenant-onboarding.service.ts.hbs",
		);
		const onboardingServiceContent = onboardingServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const onboardingServicePath = path.join(
			baseDir,
			"src/onboarding/services/TenantOnboardingService.ts",
		);
		await fs.writeFile(onboardingServicePath, onboardingServiceContent);
		result.files.push(onboardingServicePath);

		// Generate onboarding wizards for each feature
		for (const feature of options.onboarding) {
			const wizardTemplate = await this.loadTemplate(
				`tenant-management/onboarding/wizards/${feature}-wizard.service.ts.hbs`,
			);
			const wizardContent = wizardTemplate({
				...options,
				feature,
				timestamp: new Date().toISOString(),
			});

			const wizardPath = path.join(
				baseDir,
				`src/onboarding/wizards/${feature.charAt(0).toUpperCase() + feature.slice(1).replace("-", "")}Wizard.ts`,
			);
			await fs.writeFile(wizardPath, wizardContent);
			result.files.push(wizardPath);
		}

		// Generate onboarding progress tracker
		const progressTemplate = await this.loadTemplate(
			"tenant-management/onboarding/onboarding-progress.service.ts.hbs",
		);
		const progressContent = progressTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const progressPath = path.join(
			baseDir,
			"src/onboarding/services/OnboardingProgressService.ts",
		);
		await fs.writeFile(progressPath, progressContent);
		result.files.push(progressPath);
	}

	private async generateTenantCustomization(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate customization service
		const customizationServiceTemplate = await this.loadTemplate(
			"tenant-management/customization/tenant-customization.service.ts.hbs",
		);
		const customizationServiceContent = customizationServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const customizationServicePath = path.join(
			baseDir,
			"src/customization/services/TenantCustomizationService.ts",
		);
		await fs.writeFile(customizationServicePath, customizationServiceContent);
		result.files.push(customizationServicePath);

		if (options.customization.branding) {
			// Generate branding service
			const brandingTemplate = await this.loadTemplate(
				"tenant-management/customization/branding/tenant-branding.service.ts.hbs",
			);
			const brandingContent = brandingTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const brandingPath = path.join(
				baseDir,
				"src/customization/branding/TenantBrandingService.ts",
			);
			await fs.writeFile(brandingPath, brandingContent);
			result.files.push(brandingPath);
		}

		if (options.customization.domains) {
			// Generate domain service
			const domainTemplate = await this.loadTemplate(
				"tenant-management/customization/domain/tenant-domain.service.ts.hbs",
			);
			const domainContent = domainTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const domainPath = path.join(
				baseDir,
				"src/customization/domain/TenantDomainService.ts",
			);
			await fs.writeFile(domainPath, domainContent);
			result.files.push(domainPath);
		}

		if (options.customization.configuration) {
			// Generate configuration service
			const configTemplate = await this.loadTemplate(
				"tenant-management/customization/config/tenant-config.service.ts.hbs",
			);
			const configContent = configTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const configPath = path.join(
				baseDir,
				"src/customization/config/TenantConfigService.ts",
			);
			await fs.writeFile(configPath, configContent);
			result.files.push(configPath);
		}
	}

	private async generateTenantLifecycle(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate lifecycle service
		const lifecycleServiceTemplate = await this.loadTemplate(
			"tenant-management/lifecycle/tenant-lifecycle.service.ts.hbs",
		);
		const lifecycleServiceContent = lifecycleServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const lifecycleServicePath = path.join(
			baseDir,
			"src/lifecycle/services/TenantLifecycleService.ts",
		);
		await fs.writeFile(lifecycleServicePath, lifecycleServiceContent);
		result.files.push(lifecycleServicePath);

		// Generate lifecycle workflows
		const lifecycleStates = ["active", "suspended", "archived", "deleted"];
		for (const state of lifecycleStates) {
			const workflowTemplate = await this.loadTemplate(
				"tenant-management/lifecycle/workflows/tenant-lifecycle.workflow.ts.hbs",
			);
			const workflowContent = workflowTemplate({
				...options,
				state,
				timestamp: new Date().toISOString(),
			});

			const workflowPath = path.join(
				baseDir,
				`src/lifecycle/workflows/${state.charAt(0).toUpperCase() + state.slice(1)}TenantWorkflow.ts`,
			);
			await fs.writeFile(workflowPath, workflowContent);
			result.files.push(workflowPath);
		}
	}

	private async generateTenantMonitoring(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate monitoring service
		const monitoringTemplate = await this.loadTemplate(
			"tenant-management/monitoring/tenant-monitoring.service.ts.hbs",
		);
		const monitoringContent = monitoringTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const monitoringPath = path.join(
			baseDir,
			"src/monitoring/services/TenantMonitoringService.ts",
		);
		await fs.writeFile(monitoringPath, monitoringContent);
		result.files.push(monitoringPath);

		// Generate analytics service
		const analyticsTemplate = await this.loadTemplate(
			"tenant-management/analytics/tenant-analytics.service.ts.hbs",
		);
		const analyticsContent = analyticsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsPath = path.join(
			baseDir,
			"src/analytics/services/TenantAnalyticsService.ts",
		);
		await fs.writeFile(analyticsPath, analyticsContent);
		result.files.push(analyticsPath);
	}

	private async generateAPIEndpoints(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate tenant controller
		const controllerTemplate = await this.loadTemplate(
			"tenant-management/controllers/tenant.controller.ts.hbs",
		);
		const controllerContent = controllerTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const controllerPath = path.join(
			baseDir,
			"src/tenant/controllers/TenantController.ts",
		);
		await fs.writeFile(controllerPath, controllerContent);
		result.files.push(controllerPath);

		// Generate DTOs
		const dtoTemplate = await this.loadTemplate(
			"tenant-management/dto/tenant.dto.ts.hbs",
		);
		const dtoContent = dtoTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const dtoPath = path.join(baseDir, "src/tenant/dto/TenantDto.ts");
		await fs.writeFile(dtoPath, dtoContent);
		result.files.push(dtoPath);

		result.commands.push(
			"npm install @nestjs/swagger class-validator class-transformer",
		);
	}

	private async generateConfigurations(
		options: TenantManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-management");

		// Generate tenant management configuration
		const configTemplate = await this.loadTemplate(
			"tenant-management/config/tenant-management.config.ts.hbs",
		);
		const configContent = configTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const configPath = path.join(
			baseDir,
			"config/tenant/tenant-management.config.ts",
		);
		await fs.writeFile(configPath, configContent);
		result.files.push(configPath);

		// Generate environment variables
		const envTemplate = await this.loadTemplate(
			"tenant-management/config/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push(
			"Configure tenant provisioning settings in .env file",
		);
		result.nextSteps.push("Set up onboarding workflow steps");
		result.nextSteps.push("Configure tenant customization options");
		result.nextSteps.push("Set up tenant monitoring and analytics");
		result.nextSteps.push("Test tenant lifecycle workflows");
		result.nextSteps.push("Configure tenant isolation and security");
	}

	private async loadTemplate(
		templatePath: string,
	): Promise<HandlebarsTemplateDelegate> {
		const fullPath = path.join(__dirname, "../../templates", templatePath);

		if (!(await fs.pathExists(fullPath))) {
			const basicTemplate = this.createBasicTemplate(templatePath);
			await fs.ensureDir(path.dirname(fullPath));
			await fs.writeFile(fullPath, basicTemplate);
		}

		const templateContent = await fs.readFile(fullPath, "utf-8");
		return Handlebars.compile(templateContent);
	}

	private createBasicTemplate(templatePath: string): string {
		if (templatePath.includes("tenant-management.module.ts.hbs")) {
			return `import { Module } from '@nestjs/common';
import { TenantProvisioningService } from '../provisioning/services/TenantProvisioningService';
import { TenantOnboardingService } from '../onboarding/services/TenantOnboardingService';
import { TenantCustomizationService } from '../customization/services/TenantCustomizationService';

@Module({
  providers: [
    TenantProvisioningService,
    TenantOnboardingService,
    TenantCustomizationService,
  ],
  exports: [
    TenantProvisioningService,
    TenantOnboardingService,
  ],
})
export class TenantManagementModule {}`;
		}

		return `// Generated template for ${templatePath}
// Tenant Management: {{name}}
// Tenant model: {{tenantModel}}
// Isolation level: {{isolationLevel}}
// Provisioning: {{provisioning}}
// Generated at: {{timestamp}}

export class TenantManagementService {
  // TODO: Implement tenant management logic for ${templatePath}
}`;
	}

	protected async validateOptions(
		options: TenantManagementOptions,
	): Promise<void> {
		if (!options.name) {
			throw new Error("Tenant management system name is required");
		}

		if (!options.tenantModel) {
			throw new Error("Tenant model is required");
		}

		const validTenantModels = ["multi-tenant", "single-tenant", "hybrid"];
		if (!validTenantModels.includes(options.tenantModel)) {
			throw new Error(
				`Invalid tenant model. Must be one of: ${validTenantModels.join(", ")}`,
			);
		}

		if (!options.isolationLevel) {
			throw new Error("Tenant isolation level is required");
		}

		const validIsolationLevels = ["database", "schema", "row-level"];
		if (!validIsolationLevels.includes(options.isolationLevel)) {
			throw new Error(
				`Invalid isolation level. Must be one of: ${validIsolationLevels.join(", ")}`,
			);
		}

		if (!options.provisioning) {
			throw new Error("Tenant provisioning type is required");
		}

		const validProvisioningTypes = ["automatic", "manual", "approval"];
		if (!validProvisioningTypes.includes(options.provisioning)) {
			throw new Error(
				`Invalid provisioning type. Must be one of: ${validProvisioningTypes.join(", ")}`,
			);
		}
	}
}

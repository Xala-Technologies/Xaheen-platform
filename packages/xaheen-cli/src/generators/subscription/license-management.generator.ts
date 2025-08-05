import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, LicenseManagementOptions } from "./types";

/**
 * License Management Generator
 * Generates comprehensive license management system with key generation,
 * validation, enforcement, audit trails, and compliance reporting.
 */
export class LicenseManagementGenerator extends BaseGenerator<LicenseManagementOptions> {
	async generate(options: LicenseManagementOptions): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(`Generating License Management System: ${options.name}`);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create license management structure
			await this.createLicenseStructure(options, result);

			// Generate license key management
			await this.generateLicenseKeyManagement(options, result);

			// Generate license validation system
			await this.generateLicenseValidation(options, result);

			// Generate license enforcement
			await this.generateLicenseEnforcement(options, result);

			// Generate usage tracking
			await this.generateUsageTracking(options, result);

			// Generate audit and reporting
			await this.generateAuditReporting(options, result);

			// Generate license analytics
			await this.generateLicenseAnalytics(options, result);

			// Generate compliance features
			await this.generateComplianceFeatures(options, result);

			// Generate API endpoints
			await this.generateAPIEndpoints(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`License Management System generated successfully: ${options.name}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate License Management System: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createLicenseStructure(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Create directory structure
		const directories = [
			"src/license/services",
			"src/license/controllers",
			"src/license/models",
			"src/license/dto",
			"src/license/interfaces",
			"src/license/guards",
			"src/license/decorators",
			"src/validation/services",
			"src/validation/strategies",
			"src/enforcement/services",
			"src/enforcement/guards",
			"src/keys/generation",
			"src/keys/validation",
			"src/keys/storage",
			"src/usage/tracking",
			"src/usage/analytics",
			"src/audit/services",
			"src/audit/models",
			"src/reporting/services",
			"src/reporting/generators",
			"src/compliance/services",
			"src/utils/crypto",
			"src/utils/restrictions",
			"config/license",
			"migrations/license",
			"tests/license",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}

		// Generate main license module
		const moduleTemplate = await this.loadTemplate(
			"license/license.module.ts.hbs",
		);
		const moduleContent = moduleTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const modulePath = path.join(baseDir, "src/license/LicenseModule.ts");
		await fs.writeFile(modulePath, moduleContent);
		result.files.push(modulePath);
	}

	private async generateLicenseKeyManagement(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate license key service
		const keyServiceTemplate = await this.loadTemplate(
			"license/services/license-key.service.ts.hbs",
		);
		const keyServiceContent = keyServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const keyServicePath = path.join(
			baseDir,
			"src/license/services/LicenseKeyService.ts",
		);
		await fs.writeFile(keyServicePath, keyServiceContent);
		result.files.push(keyServicePath);

		// Generate key generation service
		const generationTemplate = await this.loadTemplate(
			"license/keys/key-generation.service.ts.hbs",
		);
		const generationContent = generationTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const generationPath = path.join(
			baseDir,
			"src/keys/generation/KeyGenerationService.ts",
		);
		await fs.writeFile(generationPath, generationContent);
		result.files.push(generationPath);

		// Generate cryptographic utilities
		const cryptoTemplate = await this.loadTemplate(
			"license/utils/crypto.service.ts.hbs",
		);
		const cryptoContent = cryptoTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const cryptoPath = path.join(baseDir, "src/utils/crypto/CryptoService.ts");
		await fs.writeFile(cryptoPath, cryptoContent);
		result.files.push(cryptoPath);

		result.commands.push("npm install crypto-js node-rsa jsonwebtoken");
	}

	private async generateLicenseValidation(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate validation service
		const validationTemplate = await this.loadTemplate(
			"license/validation/license-validation.service.ts.hbs",
		);
		const validationContent = validationTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const validationPath = path.join(
			baseDir,
			"src/validation/services/LicenseValidationService.ts",
		);
		await fs.writeFile(validationPath, validationContent);
		result.files.push(validationPath);

		// Generate validation strategies
		const strategies = ["online", "offline", "hybrid"];
		for (const strategy of strategies) {
			const strategyTemplate = await this.loadTemplate(
				`license/validation/strategies/${strategy}-validation.strategy.ts.hbs`,
			);
			const strategyContent = strategyTemplate({
				...options,
				strategy,
				timestamp: new Date().toISOString(),
			});

			const strategyPath = path.join(
				baseDir,
				`src/validation/strategies/${strategy.charAt(0).toUpperCase() + strategy.slice(1)}ValidationStrategy.ts`,
			);
			await fs.writeFile(strategyPath, strategyContent);
			result.files.push(strategyPath);
		}

		// Generate validation guard
		const guardTemplate = await this.loadTemplate(
			"license/guards/license-validation.guard.ts.hbs",
		);
		const guardContent = guardTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const guardPath = path.join(
			baseDir,
			"src/license/guards/LicenseValidationGuard.ts",
		);
		await fs.writeFile(guardPath, guardContent);
		result.files.push(guardPath);
	}

	private async generateLicenseEnforcement(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate enforcement service
		const enforcementTemplate = await this.loadTemplate(
			"license/enforcement/license-enforcement.service.ts.hbs",
		);
		const enforcementContent = enforcementTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const enforcementPath = path.join(
			baseDir,
			"src/enforcement/services/LicenseEnforcementService.ts",
		);
		await fs.writeFile(enforcementPath, enforcementContent);
		result.files.push(enforcementPath);

		// Generate restriction handlers
		for (const restriction of options.restrictions) {
			const restrictionTemplate = await this.loadTemplate(
				"license/utils/restrictions/restriction-handler.service.ts.hbs",
			);
			const restrictionContent = restrictionTemplate({
				...options,
				restriction,
				timestamp: new Date().toISOString(),
			});

			const restrictionPath = path.join(
				baseDir,
				`src/utils/restrictions/${restriction.type.replace("-", "_").charAt(0).toUpperCase() + restriction.type.replace("-", "_").slice(1)}RestrictionHandler.ts`,
			);
			await fs.writeFile(restrictionPath, restrictionContent);
			result.files.push(restrictionPath);
		}

		// Generate license decorator
		const decoratorTemplate = await this.loadTemplate(
			"license/decorators/require-license.decorator.ts.hbs",
		);
		const decoratorContent = decoratorTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const decoratorPath = path.join(
			baseDir,
			"src/license/decorators/RequireLicense.ts",
		);
		await fs.writeFile(decoratorPath, decoratorContent);
		result.files.push(decoratorPath);
	}

	private async generateUsageTracking(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate usage tracking service
		const usageTemplate = await this.loadTemplate(
			"license/usage/usage-tracking.service.ts.hbs",
		);
		const usageContent = usageTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const usagePath = path.join(
			baseDir,
			"src/usage/tracking/UsageTrackingService.ts",
		);
		await fs.writeFile(usagePath, usageContent);
		result.files.push(usagePath);

		// Generate usage analytics
		const analyticsTemplate = await this.loadTemplate(
			"license/usage/usage-analytics.service.ts.hbs",
		);
		const analyticsContent = analyticsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsPath = path.join(
			baseDir,
			"src/usage/analytics/UsageAnalyticsService.ts",
		);
		await fs.writeFile(analyticsPath, analyticsContent);
		result.files.push(analyticsPath);
	}

	private async generateAuditReporting(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.features.includes("audit-trail") && !options.reporting) return;

		const baseDir = path.join(process.cwd(), "license-system");

		// Generate audit service
		const auditTemplate = await this.loadTemplate(
			"license/audit/license-audit.service.ts.hbs",
		);
		const auditContent = auditTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const auditPath = path.join(
			baseDir,
			"src/audit/services/LicenseAuditService.ts",
		);
		await fs.writeFile(auditPath, auditContent);
		result.files.push(auditPath);

		if (options.reporting) {
			// Generate reporting service
			const reportingTemplate = await this.loadTemplate(
				"license/reporting/license-reporting.service.ts.hbs",
			);
			const reportingContent = reportingTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const reportingPath = path.join(
				baseDir,
				"src/reporting/services/LicenseReportingService.ts",
			);
			await fs.writeFile(reportingPath, reportingContent);
			result.files.push(reportingPath);
		}
	}

	private async generateLicenseAnalytics(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.analytics) return;

		const baseDir = path.join(process.cwd(), "license-system");

		// Generate analytics service
		const analyticsTemplate = await this.loadTemplate(
			"license/analytics/license-analytics.service.ts.hbs",
		);
		const analyticsContent = analyticsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsPath = path.join(
			baseDir,
			"src/analytics/LicenseAnalyticsService.ts",
		);
		await fs.writeFile(analyticsPath, analyticsContent);
		result.files.push(analyticsPath);
	}

	private async generateComplianceFeatures(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.compliance || options.compliance.length === 0) return;

		const baseDir = path.join(process.cwd(), "license-system");

		// Generate compliance service
		const complianceTemplate = await this.loadTemplate(
			"license/compliance/license-compliance.service.ts.hbs",
		);
		const complianceContent = complianceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const compliancePath = path.join(
			baseDir,
			"src/compliance/services/LicenseComplianceService.ts",
		);
		await fs.writeFile(compliancePath, complianceContent);
		result.files.push(compliancePath);
	}

	private async generateAPIEndpoints(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate license controller
		const controllerTemplate = await this.loadTemplate(
			"license/controllers/license.controller.ts.hbs",
		);
		const controllerContent = controllerTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const controllerPath = path.join(
			baseDir,
			"src/license/controllers/LicenseController.ts",
		);
		await fs.writeFile(controllerPath, controllerContent);
		result.files.push(controllerPath);

		result.commands.push(
			"npm install @nestjs/swagger class-validator class-transformer",
		);
	}

	private async generateConfigurations(
		options: LicenseManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "license-system");

		// Generate license configuration
		const configTemplate = await this.loadTemplate(
			"license/config/license.config.ts.hbs",
		);
		const configContent = configTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const configPath = path.join(baseDir, "config/license/license.config.ts");
		await fs.writeFile(configPath, configContent);
		result.files.push(configPath);

		// Generate environment variables
		const envTemplate = await this.loadTemplate(
			"license/config/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push("Configure license encryption keys in .env file");
		result.nextSteps.push("Set up license validation endpoints");
		result.nextSteps.push("Configure license restrictions and limits");
		result.nextSteps.push("Set up audit logging and monitoring");
		result.nextSteps.push("Test license generation and validation flows");
		result.nextSteps.push("Configure compliance reporting if needed");
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
		if (templatePath.includes("license.module.ts.hbs")) {
			return `import { Module } from '@nestjs/common';
import { LicenseKeyService } from './services/LicenseKeyService';
import { LicenseValidationService } from '../validation/services/LicenseValidationService';
import { LicenseEnforcementService } from '../enforcement/services/LicenseEnforcementService';

@Module({
  providers: [
    LicenseKeyService,
    LicenseValidationService,
    LicenseEnforcementService,
  ],
  exports: [
    LicenseKeyService,
    LicenseValidationService,
  ],
})
export class LicenseModule {}`;
		}

		return `// Generated template for ${templatePath}
// License system: {{name}}
// Model: {{licenseModel}}
// Enforcement: {{enforcement}}
// Generated at: {{timestamp}}

export class LicenseService {
  // TODO: Implement license logic for ${templatePath}
}`;
	}

	protected async validateOptions(
		options: LicenseManagementOptions,
	): Promise<void> {
		if (!options.name) {
			throw new Error("License system name is required");
		}

		if (!options.licenseModel) {
			throw new Error("License model is required");
		}

		if (!options.enforcement) {
			throw new Error("License enforcement type is required");
		}

		if (!options.validation || !options.validation.frequency) {
			throw new Error("License validation configuration is required");
		}

		if (!options.features || options.features.length === 0) {
			throw new Error("At least one license feature must be selected");
		}
	}
}

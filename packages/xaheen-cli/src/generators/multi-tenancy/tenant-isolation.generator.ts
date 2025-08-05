import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, TenantIsolationOptions } from "./types";

/**
 * Tenant Isolation Generator
 * Generates comprehensive tenant isolation strategies including database,
 * schema, and row-level security with encryption and compliance features.
 */
export class TenantIsolationGenerator extends BaseGenerator<TenantIsolationOptions> {
	async generate(options: TenantIsolationOptions): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(
				`Generating Tenant Isolation Strategy: ${options.isolationLevel}`,
			);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create tenant isolation structure
			await this.createIsolationStructure(options, result);

			// Generate isolation strategies
			await this.generateIsolationStrategies(options, result);

			// Generate encryption services
			await this.generateEncryptionServices(options, result);

			// Generate audit logging
			await this.generateAuditLogging(options, result);

			// Generate data residency controls
			await this.generateDataResidencyControls(options, result);

			// Generate compliance features
			await this.generateComplianceFeatures(options, result);

			// Generate monitoring and alerting
			await this.generateMonitoringAlerting(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`Tenant Isolation Strategy generated successfully: ${options.isolationLevel}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate Tenant Isolation Strategy: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createIsolationStructure(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Create directory structure
		const directories = [
			"src/isolation/strategies",
			"src/isolation/services",
			"src/isolation/guards",
			"src/isolation/middleware",
			"src/encryption/services",
			"src/encryption/keys",
			"src/audit/services",
			"src/audit/models",
			"src/residency/services",
			"src/compliance/services",
			"src/monitoring/services",
			"config/isolation",
			"migrations/isolation",
			"tests/isolation",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}
	}

	private async generateIsolationStrategies(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate base isolation interface
		const interfaceTemplate = await this.loadTemplate(
			"tenant-isolation/interfaces/isolation-strategy.interface.ts.hbs",
		);
		const interfaceContent = interfaceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const interfacePath = path.join(
			baseDir,
			"src/isolation/interfaces/IsolationStrategy.ts",
		);
		await fs.writeFile(interfacePath, interfaceContent);
		result.files.push(interfacePath);

		// Generate specific isolation strategies based on level
		switch (options.isolationLevel) {
			case "database":
				await this.generateDatabaseIsolation(options, baseDir, result);
				break;
			case "schema":
				await this.generateSchemaIsolation(options, baseDir, result);
				break;
			case "row-level":
				await this.generateRowLevelIsolation(options, baseDir, result);
				break;
			case "hybrid":
				await this.generateHybridIsolation(options, baseDir, result);
				break;
		}

		// Generate isolation service factory
		const factoryTemplate = await this.loadTemplate(
			"tenant-isolation/services/isolation-factory.service.ts.hbs",
		);
		const factoryContent = factoryTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const factoryPath = path.join(
			baseDir,
			"src/isolation/services/IsolationFactory.ts",
		);
		await fs.writeFile(factoryPath, factoryContent);
		result.files.push(factoryPath);
	}

	private async generateDatabaseIsolation(
		options: TenantIsolationOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const dbIsolationTemplate = await this.loadTemplate(
			"tenant-isolation/strategies/database-isolation.strategy.ts.hbs",
		);
		const dbIsolationContent = dbIsolationTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const dbIsolationPath = path.join(
			baseDir,
			"src/isolation/strategies/DatabaseIsolationStrategy.ts",
		);
		await fs.writeFile(dbIsolationPath, dbIsolationContent);
		result.files.push(dbIsolationPath);
	}

	private async generateSchemaIsolation(
		options: TenantIsolationOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const schemaIsolationTemplate = await this.loadTemplate(
			"tenant-isolation/strategies/schema-isolation.strategy.ts.hbs",
		);
		const schemaIsolationContent = schemaIsolationTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const schemaIsolationPath = path.join(
			baseDir,
			"src/isolation/strategies/SchemaIsolationStrategy.ts",
		);
		await fs.writeFile(schemaIsolationPath, schemaIsolationContent);
		result.files.push(schemaIsolationPath);
	}

	private async generateRowLevelIsolation(
		options: TenantIsolationOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const rlsTemplate = await this.loadTemplate(
			"tenant-isolation/strategies/row-level-isolation.strategy.ts.hbs",
		);
		const rlsContent = rlsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const rlsPath = path.join(
			baseDir,
			"src/isolation/strategies/RowLevelIsolationStrategy.ts",
		);
		await fs.writeFile(rlsPath, rlsContent);
		result.files.push(rlsPath);
	}

	private async generateHybridIsolation(
		options: TenantIsolationOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const hybridTemplate = await this.loadTemplate(
			"tenant-isolation/strategies/hybrid-isolation.strategy.ts.hbs",
		);
		const hybridContent = hybridTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const hybridPath = path.join(
			baseDir,
			"src/isolation/strategies/HybridIsolationStrategy.ts",
		);
		await fs.writeFile(hybridPath, hybridContent);
		result.files.push(hybridPath);
	}

	private async generateEncryptionServices(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.encryptionAtRest && !options.encryptionInTransit) return;

		const baseDir = path.join(process.cwd(), "tenant-isolation");

		if (options.encryptionAtRest) {
			// Generate encryption at rest service
			const encryptionTemplate = await this.loadTemplate(
				"tenant-isolation/encryption/encryption-at-rest.service.ts.hbs",
			);
			const encryptionContent = encryptionTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const encryptionPath = path.join(
				baseDir,
				"src/encryption/services/EncryptionAtRestService.ts",
			);
			await fs.writeFile(encryptionPath, encryptionContent);
			result.files.push(encryptionPath);
		}

		if (options.encryptionInTransit) {
			// Generate encryption in transit service
			const transitTemplate = await this.loadTemplate(
				"tenant-isolation/encryption/encryption-in-transit.service.ts.hbs",
			);
			const transitContent = transitTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const transitPath = path.join(
				baseDir,
				"src/encryption/services/EncryptionInTransitService.ts",
			);
			await fs.writeFile(transitPath, transitContent);
			result.files.push(transitPath);
		}

		// Generate key management service
		const keyManagementTemplate = await this.loadTemplate(
			"tenant-isolation/encryption/key-management.service.ts.hbs",
		);
		const keyManagementContent = keyManagementTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const keyManagementPath = path.join(
			baseDir,
			"src/encryption/keys/KeyManagementService.ts",
		);
		await fs.writeFile(keyManagementPath, keyManagementContent);
		result.files.push(keyManagementPath);

		result.commands.push("npm install crypto-js node-forge");
	}

	private async generateAuditLogging(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.auditLogging) return;

		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate audit service
		const auditTemplate = await this.loadTemplate(
			"tenant-isolation/audit/tenant-audit.service.ts.hbs",
		);
		const auditContent = auditTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const auditPath = path.join(
			baseDir,
			"src/audit/services/TenantAuditService.ts",
		);
		await fs.writeFile(auditPath, auditContent);
		result.files.push(auditPath);

		// Generate audit model
		const auditModelTemplate = await this.loadTemplate(
			"tenant-isolation/audit/audit-log.model.ts.hbs",
		);
		const auditModelContent = auditModelTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const auditModelPath = path.join(baseDir, "src/audit/models/AuditLog.ts");
		await fs.writeFile(auditModelPath, auditModelContent);
		result.files.push(auditModelPath);
	}

	private async generateDataResidencyControls(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.dataResidency || options.dataResidency.length === 0) return;

		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate data residency service
		const residencyTemplate = await this.loadTemplate(
			"tenant-isolation/residency/data-residency.service.ts.hbs",
		);
		const residencyContent = residencyTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const residencyPath = path.join(
			baseDir,
			"src/residency/services/DataResidencyService.ts",
		);
		await fs.writeFile(residencyPath, residencyContent);
		result.files.push(residencyPath);
	}

	private async generateComplianceFeatures(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		if (
			!options.complianceStandards ||
			options.complianceStandards.length === 0
		)
			return;

		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate compliance service
		const complianceTemplate = await this.loadTemplate(
			"tenant-isolation/compliance/isolation-compliance.service.ts.hbs",
		);
		const complianceContent = complianceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const compliancePath = path.join(
			baseDir,
			"src/compliance/services/IsolationComplianceService.ts",
		);
		await fs.writeFile(compliancePath, complianceContent);
		result.files.push(compliancePath);
	}

	private async generateMonitoringAlerting(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate monitoring service
		const monitoringTemplate = await this.loadTemplate(
			"tenant-isolation/monitoring/isolation-monitoring.service.ts.hbs",
		);
		const monitoringContent = monitoringTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const monitoringPath = path.join(
			baseDir,
			"src/monitoring/services/IsolationMonitoringService.ts",
		);
		await fs.writeFile(monitoringPath, monitoringContent);
		result.files.push(monitoringPath);
	}

	private async generateConfigurations(
		options: TenantIsolationOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "tenant-isolation");

		// Generate isolation configuration
		const configTemplate = await this.loadTemplate(
			"tenant-isolation/config/isolation.config.ts.hbs",
		);
		const configContent = configTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const configPath = path.join(
			baseDir,
			"config/isolation/isolation.config.ts",
		);
		await fs.writeFile(configPath, configContent);
		result.files.push(configPath);

		// Generate environment variables
		const envTemplate = await this.loadTemplate(
			"tenant-isolation/config/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push("Configure isolation strategy settings in .env file");
		result.nextSteps.push("Set up encryption keys and certificates");
		result.nextSteps.push("Configure audit logging storage");
		result.nextSteps.push("Set up data residency compliance rules");
		result.nextSteps.push("Test isolation boundaries and security");
		result.nextSteps.push("Configure monitoring and alerting thresholds");
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
		return `// Generated template for ${templatePath}
// Tenant Isolation: {{isolationLevel}}
// Encryption at rest: {{encryptionAtRest}}
// Encryption in transit: {{encryptionInTransit}}
// Audit logging: {{auditLogging}}
// Generated at: {{timestamp}}

export class TenantIsolationService {
  // TODO: Implement tenant isolation logic for ${templatePath}
}`;
	}

	protected async validateOptions(
		options: TenantIsolationOptions,
	): Promise<void> {
		if (!options.isolationLevel) {
			throw new Error("Tenant isolation level is required");
		}

		const validIsolationLevels = ["database", "schema", "row-level", "hybrid"];
		if (!validIsolationLevels.includes(options.isolationLevel)) {
			throw new Error(
				`Invalid isolation level. Must be one of: ${validIsolationLevels.join(", ")}`,
			);
		}
	}
}

import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, MultiTenantOptions } from "./types";

/**
 * Multi-Tenant Application Generator
 * Generates complete multi-tenant architecture with database isolation,
 * tenant-aware authentication, and scalable infrastructure.
 */
export class MultiTenantGenerator extends BaseGenerator<MultiTenantOptions> {
	async generate(options: MultiTenantOptions): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(`Generating Multi-Tenant Application: ${options.name}`);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create multi-tenant structure
			await this.createMultiTenantStructure(options, result);

			// Generate database isolation layer
			await this.generateDatabaseIsolation(options, result);

			// Generate tenant-aware middleware
			await this.generateTenantMiddleware(options, result);

			// Generate tenant authentication system
			await this.generateTenantAuthentication(options, result);

			// Generate tenant management services
			await this.generateTenantServices(options, result);

			// Generate tenant discovery mechanism
			await this.generateTenantDiscovery(options, result);

			// Generate caching layer
			await this.generateCachingLayer(options, result);

			// Generate monitoring and observability
			await this.generateMonitoring(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`Multi-Tenant Application generated successfully: ${options.name}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate Multi-Tenant Application: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createMultiTenantStructure(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		// Create directory structure
		const directories = [
			"src/tenant/middleware",
			"src/tenant/services",
			"src/tenant/guards",
			"src/tenant/decorators",
			"src/tenant/interceptors",
			"src/tenant/filters",
			"src/database/tenant",
			"src/cache/tenant",
			"src/monitoring/tenant",
			"src/types/tenant",
			"config/tenant",
			"migrations/tenant",
			"tests/tenant",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}

		// Generate main tenant module
		const moduleTemplate = await this.loadTemplate(
			"multi-tenancy/tenant.module.ts.hbs",
		);
		const moduleContent = moduleTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const modulePath = path.join(baseDir, "src/tenant/TenantModule.ts");
		await fs.writeFile(modulePath, moduleContent);
		result.files.push(modulePath);
	}

	private async generateDatabaseIsolation(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		if (options.isolationLevel === "database") {
			await this.generateDatabasePerTenant(options, baseDir, result);
		} else if (options.isolationLevel === "schema") {
			await this.generateSchemaPerTenant(options, baseDir, result);
		} else if (options.isolationLevel === "row-level") {
			await this.generateRowLevelSecurity(options, baseDir, result);
		} else if (options.isolationLevel === "hybrid") {
			await this.generateHybridIsolation(options, baseDir, result);
		}
	}

	private async generateDatabasePerTenant(
		options: MultiTenantOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		// Generate database connection manager
		const dbManagerTemplate = await this.loadTemplate(
			"multi-tenancy/database/database-per-tenant.service.ts.hbs",
		);
		const dbManagerContent = dbManagerTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const dbManagerPath = path.join(
			baseDir,
			"src/database/tenant/DatabasePerTenantService.ts",
		);
		await fs.writeFile(dbManagerPath, dbManagerContent);
		result.files.push(dbManagerPath);

		// Generate tenant database factory
		const dbFactoryTemplate = await this.loadTemplate(
			"multi-tenancy/database/tenant-database.factory.ts.hbs",
		);
		const dbFactoryContent = dbFactoryTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const dbFactoryPath = path.join(
			baseDir,
			"src/database/tenant/TenantDatabaseFactory.ts",
		);
		await fs.writeFile(dbFactoryPath, dbFactoryContent);
		result.files.push(dbFactoryPath);
	}

	private async generateSchemaPerTenant(
		options: MultiTenantOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		// Generate schema isolation service
		const schemaServiceTemplate = await this.loadTemplate(
			"multi-tenancy/database/schema-per-tenant.service.ts.hbs",
		);
		const schemaServiceContent = schemaServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const schemaServicePath = path.join(
			baseDir,
			"src/database/tenant/SchemaPerTenantService.ts",
		);
		await fs.writeFile(schemaServicePath, schemaServiceContent);
		result.files.push(schemaServicePath);
	}

	private async generateRowLevelSecurity(
		options: MultiTenantOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		// Generate RLS service
		const rlsServiceTemplate = await this.loadTemplate(
			"multi-tenancy/database/row-level-security.service.ts.hbs",
		);
		const rlsServiceContent = rlsServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const rlsServicePath = path.join(
			baseDir,
			"src/database/tenant/RowLevelSecurityService.ts",
		);
		await fs.writeFile(rlsServicePath, rlsServiceContent);
		result.files.push(rlsServicePath);
	}

	private async generateHybridIsolation(
		options: MultiTenantOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		// Generate hybrid isolation strategy
		const hybridServiceTemplate = await this.loadTemplate(
			"multi-tenancy/database/hybrid-isolation.service.ts.hbs",
		);
		const hybridServiceContent = hybridServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const hybridServicePath = path.join(
			baseDir,
			"src/database/tenant/HybridIsolationService.ts",
		);
		await fs.writeFile(hybridServicePath, hybridServiceContent);
		result.files.push(hybridServicePath);
	}

	private async generateTenantMiddleware(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		// Generate tenant context middleware
		const middlewareTemplate = await this.loadTemplate(
			"multi-tenancy/middleware/tenant-context.middleware.ts.hbs",
		);
		const middlewareContent = middlewareTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const middlewarePath = path.join(
			baseDir,
			"src/tenant/middleware/TenantContextMiddleware.ts",
		);
		await fs.writeFile(middlewarePath, middlewareContent);
		result.files.push(middlewarePath);

		// Generate tenant validation guard
		const guardTemplate = await this.loadTemplate(
			"multi-tenancy/guards/tenant-validation.guard.ts.hbs",
		);
		const guardContent = guardTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const guardPath = path.join(
			baseDir,
			"src/tenant/guards/TenantValidationGuard.ts",
		);
		await fs.writeFile(guardPath, guardContent);
		result.files.push(guardPath);
	}

	private async generateTenantAuthentication(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		// Generate tenant-aware auth service
		const authServiceTemplate = await this.loadTemplate(
			"multi-tenancy/services/tenant-auth.service.ts.hbs",
		);
		const authServiceContent = authServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const authServicePath = path.join(
			baseDir,
			"src/tenant/services/TenantAuthService.ts",
		);
		await fs.writeFile(authServicePath, authServiceContent);
		result.files.push(authServicePath);
	}

	private async generateTenantServices(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		// Generate tenant management service
		const tenantServiceTemplate = await this.loadTemplate(
			"multi-tenancy/services/tenant-management.service.ts.hbs",
		);
		const tenantServiceContent = tenantServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const tenantServicePath = path.join(
			baseDir,
			"src/tenant/services/TenantManagementService.ts",
		);
		await fs.writeFile(tenantServicePath, tenantServiceContent);
		result.files.push(tenantServicePath);
	}

	private async generateTenantDiscovery(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		const discoveryServiceTemplate = await this.loadTemplate(
			"multi-tenancy/services/tenant-discovery.service.ts.hbs",
		);
		const discoveryServiceContent = discoveryServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const discoveryServicePath = path.join(
			baseDir,
			"src/tenant/services/TenantDiscoveryService.ts",
		);
		await fs.writeFile(discoveryServicePath, discoveryServiceContent);
		result.files.push(discoveryServicePath);
	}

	private async generateCachingLayer(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		if (options.caching === "none") return;

		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		const cacheServiceTemplate = await this.loadTemplate(
			"multi-tenancy/cache/tenant-cache.service.ts.hbs",
		);
		const cacheServiceContent = cacheServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const cacheServicePath = path.join(
			baseDir,
			"src/cache/tenant/TenantCacheService.ts",
		);
		await fs.writeFile(cacheServicePath, cacheServiceContent);
		result.files.push(cacheServicePath);

		result.commands.push(
			`npm install ${options.caching === "redis" ? "redis" : "memcached"}`,
		);
	}

	private async generateMonitoring(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.monitoring) return;

		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		const monitoringServiceTemplate = await this.loadTemplate(
			"multi-tenancy/monitoring/tenant-monitoring.service.ts.hbs",
		);
		const monitoringServiceContent = monitoringServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const monitoringServicePath = path.join(
			baseDir,
			"src/monitoring/tenant/TenantMonitoringService.ts",
		);
		await fs.writeFile(monitoringServicePath, monitoringServiceContent);
		result.files.push(monitoringServicePath);
	}

	private async generateConfigurations(
		options: MultiTenantOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "multi-tenant-app");

		// Generate tenant configuration
		const configTemplate = await this.loadTemplate(
			"multi-tenancy/config/tenant.config.ts.hbs",
		);
		const configContent = configTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const configPath = path.join(baseDir, "config/tenant/tenant.config.ts");
		await fs.writeFile(configPath, configContent);
		result.files.push(configPath);

		// Generate environment variables
		const envTemplate = await this.loadTemplate(
			"multi-tenancy/config/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push("Configure tenant database connections in .env file");
		result.nextSteps.push("Set up tenant discovery mechanism");
		result.nextSteps.push("Configure caching layer if enabled");
		result.nextSteps.push("Run database migrations for each tenant");
		result.nextSteps.push("Test tenant isolation and security");
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
		if (templatePath.includes("tenant.module.ts.hbs")) {
			return `import { Module } from '@nestjs/common';
import { TenantContextMiddleware } from './middleware/TenantContextMiddleware';
import { TenantValidationGuard } from './guards/TenantValidationGuard';
import { TenantManagementService } from './services/TenantManagementService';

@Module({
  providers: [
    TenantContextMiddleware,
    TenantValidationGuard,
    TenantManagementService,
  ],
  exports: [
    TenantManagementService,
  ],
})
export class TenantModule {}`;
		}

		return `// Generated template for ${templatePath}
// Multi-tenant {{name}} - {{isolationLevel}} isolation
// Generated at: {{timestamp}}

export class MultiTenantService {
  // TODO: Implement multi-tenant logic for ${templatePath}
}`;
	}

	protected async validateOptions(options: MultiTenantOptions): Promise<void> {
		if (!options.name) {
			throw new Error("Multi-tenant application name is required");
		}

		if (!options.isolationLevel) {
			throw new Error("Tenant isolation level is required");
		}

		if (!options.database) {
			throw new Error("Database type is required");
		}

		if (!options.backend) {
			throw new Error("Backend framework is required");
		}

		if (!options.tenantDiscovery) {
			throw new Error("Tenant discovery mechanism is required");
		}
	}
}

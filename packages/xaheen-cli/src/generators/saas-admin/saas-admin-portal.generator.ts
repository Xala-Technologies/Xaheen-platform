import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, SaaSAdminPortalOptions } from "./types";

/**
 * SaaS Administration Portal Generator
 * Generates comprehensive admin portals for SaaS applications with tenant management,
 * user administration, analytics, and enterprise-grade features.
 */
export class SaaSAdminPortalGenerator extends BaseGenerator<SaaSAdminPortalOptions> {
	async generate(options: SaaSAdminPortalOptions): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(`Generating SaaS Admin Portal: ${options.name}`);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create admin portal structure
			await this.createAdminPortalStructure(options, result);

			// Generate tenant management components
			await this.generateTenantManagement(options, result);

			// Generate user management system
			await this.generateUserManagement(options, result);

			// Generate analytics dashboard
			await this.generateAnalyticsDashboard(options, result);

			// Generate RBAC system
			await this.generateRBACSystem(options, result);

			// Generate API endpoints
			await this.generateAPIEndpoints(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`SaaS Admin Portal generated successfully: ${options.name}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate SaaS Admin Portal: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createAdminPortalStructure(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "admin-portal");

		// Create directory structure
		const directories = [
			"src/components/tenant",
			"src/components/user",
			"src/components/analytics",
			"src/components/rbac",
			"src/pages/admin",
			"src/services/admin",
			"src/hooks/admin",
			"src/utils/admin",
			"src/types/admin",
			"api/admin/tenant",
			"api/admin/user",
			"api/admin/analytics",
			"api/admin/rbac",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}

		// Generate main admin layout
		const layoutTemplate = await this.loadTemplate(
			"saas-admin/components/admin-layout.tsx.hbs",
		);
		const layoutContent = layoutTemplate({
			...options,
			features: options.features,
			timestamp: new Date().toISOString(),
		});

		const layoutPath = path.join(baseDir, "src/components/AdminLayout.tsx");
		await fs.writeFile(layoutPath, layoutContent);
		result.files.push(layoutPath);

		// Generate admin dashboard
		const dashboardTemplate = await this.loadTemplate(
			"saas-admin/pages/admin-dashboard.tsx.hbs",
		);
		const dashboardContent = dashboardTemplate({
			...options,
			features: options.features,
			timestamp: new Date().toISOString(),
		});

		const dashboardPath = path.join(baseDir, "src/pages/admin/Dashboard.tsx");
		await fs.writeFile(dashboardPath, dashboardContent);
		result.files.push(dashboardPath);
	}

	private async generateTenantManagement(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.features.includes("tenant-dashboard")) return;

		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate tenant list component
		const tenantListTemplate = await this.loadTemplate(
			"saas-admin/components/tenant-list.tsx.hbs",
		);
		const tenantListContent = tenantListTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const tenantListPath = path.join(
			baseDir,
			"src/components/tenant/TenantList.tsx",
		);
		await fs.writeFile(tenantListPath, tenantListContent);
		result.files.push(tenantListPath);

		// Generate tenant detail component
		const tenantDetailTemplate = await this.loadTemplate(
			"saas-admin/components/tenant-detail.tsx.hbs",
		);
		const tenantDetailContent = tenantDetailTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const tenantDetailPath = path.join(
			baseDir,
			"src/components/tenant/TenantDetail.tsx",
		);
		await fs.writeFile(tenantDetailPath, tenantDetailContent);
		result.files.push(tenantDetailPath);

		// Generate tenant service
		const tenantServiceTemplate = await this.loadTemplate(
			"saas-admin/services/tenant.service.ts.hbs",
		);
		const tenantServiceContent = tenantServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const tenantServicePath = path.join(
			baseDir,
			"src/services/admin/TenantService.ts",
		);
		await fs.writeFile(tenantServicePath, tenantServiceContent);
		result.files.push(tenantServicePath);
	}

	private async generateUserManagement(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.features.includes("user-management")) return;

		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate user management component
		const userManagementTemplate = await this.loadTemplate(
			"saas-admin/components/user-management.tsx.hbs",
		);
		const userManagementContent = userManagementTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const userManagementPath = path.join(
			baseDir,
			"src/components/user/UserManagement.tsx",
		);
		await fs.writeFile(userManagementPath, userManagementContent);
		result.files.push(userManagementPath);

		// Generate user service
		const userServiceTemplate = await this.loadTemplate(
			"saas-admin/services/user.service.ts.hbs",
		);
		const userServiceContent = userServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const userServicePath = path.join(
			baseDir,
			"src/services/admin/UserService.ts",
		);
		await fs.writeFile(userServicePath, userServiceContent);
		result.files.push(userServicePath);
	}

	private async generateAnalyticsDashboard(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.features.includes("analytics")) return;

		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate analytics dashboard
		const analyticsTemplate = await this.loadTemplate(
			"saas-admin/components/analytics-dashboard.tsx.hbs",
		);
		const analyticsContent = analyticsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsPath = path.join(
			baseDir,
			"src/components/analytics/AnalyticsDashboard.tsx",
		);
		await fs.writeFile(analyticsPath, analyticsContent);
		result.files.push(analyticsPath);

		// Generate analytics service
		const analyticsServiceTemplate = await this.loadTemplate(
			"saas-admin/services/analytics.service.ts.hbs",
		);
		const analyticsServiceContent = analyticsServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsServicePath = path.join(
			baseDir,
			"src/services/admin/AnalyticsService.ts",
		);
		await fs.writeFile(analyticsServicePath, analyticsServiceContent);
		result.files.push(analyticsServicePath);
	}

	private async generateRBACSystem(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.features.includes("role-management")) return;

		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate RBAC management component
		const rbacTemplate = await this.loadTemplate(
			"saas-admin/components/rbac-management.tsx.hbs",
		);
		const rbacContent = rbacTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const rbacPath = path.join(
			baseDir,
			"src/components/rbac/RBACManagement.tsx",
		);
		await fs.writeFile(rbacPath, rbacContent);
		result.files.push(rbacPath);

		// Generate RBAC service
		const rbacServiceTemplate = await this.loadTemplate(
			"saas-admin/services/rbac.service.ts.hbs",
		);
		const rbacServiceContent = rbacServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const rbacServicePath = path.join(
			baseDir,
			"src/services/admin/RBACService.ts",
		);
		await fs.writeFile(rbacServicePath, rbacServiceContent);
		result.files.push(rbacServicePath);
	}

	private async generateAPIEndpoints(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate admin API controller
		const apiTemplate = await this.loadTemplate(
			"saas-admin/api/admin.controller.ts.hbs",
		);
		const apiContent = apiTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const apiPath = path.join(baseDir, "api/admin/AdminController.ts");
		await fs.writeFile(apiPath, apiContent);
		result.files.push(apiPath);

		result.commands.push(
			"npm install @nestjs/swagger @nestjs/passport @nestjs/jwt",
		);
	}

	private async generateConfigurations(
		options: SaaSAdminPortalOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "admin-portal");

		// Generate package.json
		const packageTemplate = await this.loadTemplate(
			"saas-admin/configs/package.json.hbs",
		);
		const packageContent = packageTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const packagePath = path.join(baseDir, "package.json");
		await fs.writeFile(packagePath, packageContent);
		result.files.push(packagePath);

		// Generate environment configuration
		const envTemplate = await this.loadTemplate(
			"saas-admin/configs/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push(
			"Copy .env.example to .env and configure your environment variables",
		);
		result.nextSteps.push("Run npm install to install dependencies");
		result.nextSteps.push("Configure your database connection");
		result.nextSteps.push("Set up authentication provider credentials");
		result.nextSteps.push("Run the application in development mode");
	}

	private async loadTemplate(
		templatePath: string,
	): Promise<HandlebarsTemplateDelegate> {
		const fullPath = path.join(__dirname, "../../templates", templatePath);

		if (!(await fs.pathExists(fullPath))) {
			// Create a basic template if it doesn't exist
			const basicTemplate = this.createBasicTemplate(templatePath);
			await fs.ensureDir(path.dirname(fullPath));
			await fs.writeFile(fullPath, basicTemplate);
		}

		const templateContent = await fs.readFile(fullPath, "utf-8");
		return Handlebars.compile(templateContent);
	}

	private createBasicTemplate(templatePath: string): string {
		if (templatePath.includes("admin-layout.tsx.hbs")) {
			return `import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};`;
		}

		if (templatePath.includes("admin-dashboard.tsx.hbs")) {
			return `import React from 'react';
import { TenantOverview } from '../components/tenant/TenantOverview';
import { UserStats } from '../components/user/UserStats';
import { AnalyticsChart } from '../components/analytics/AnalyticsChart';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{{name}} Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TenantOverview />
        <UserStats />
        <AnalyticsChart />
      </div>
    </div>
  );
};`;
		}

		return `// Generated template for ${templatePath}
// TODO: Implement template content
export default function Template() {
  return <div>Template: ${templatePath}</div>;
}`;
	}

	protected async validateOptions(
		options: SaaSAdminPortalOptions,
	): Promise<void> {
		if (!options.name) {
			throw new Error("SaaS admin portal name is required");
		}

		if (!options.framework) {
			throw new Error("Frontend framework is required");
		}

		if (!options.backend) {
			throw new Error("Backend framework is required");
		}

		if (!options.features || options.features.length === 0) {
			throw new Error("At least one feature must be selected");
		}
	}
}

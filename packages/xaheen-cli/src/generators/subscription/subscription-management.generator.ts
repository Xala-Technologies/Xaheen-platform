import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import { BaseGenerator } from "../base.generator";
import { GenerationResult, SubscriptionManagementOptions } from "./types";

/**
 * Subscription Management Generator
 * Generates comprehensive subscription billing system with multiple providers,
 * usage-based billing, proration, dunning management, and compliance features.
 */
export class SubscriptionManagementGenerator extends BaseGenerator<SubscriptionManagementOptions> {
	async generate(
		options: SubscriptionManagementOptions,
	): Promise<GenerationResult> {
		try {
			await this.validateOptions(options);
			this.logger.info(
				`Generating Subscription Management System: ${options.name}`,
			);

			const result: GenerationResult = {
				files: [],
				commands: [],
				nextSteps: [],
			};

			// Create subscription management structure
			await this.createSubscriptionStructure(options, result);

			// Generate billing provider integration
			await this.generateBillingProviderIntegration(options, result);

			// Generate subscription plans and pricing
			await this.generateSubscriptionPlans(options, result);

			// Generate billing cycle management
			await this.generateBillingCycleManagement(options, result);

			// Generate usage tracking and metering
			await this.generateUsageTracking(options, result);

			// Generate dunning management
			await this.generateDunningManagement(options, result);

			// Generate tax handling
			await this.generateTaxHandling(options, result);

			// Generate webhook handlers
			await this.generateWebhookHandlers(options, result);

			// Generate analytics and reporting
			await this.generateAnalyticsReporting(options, result);

			// Generate customer portal
			await this.generateCustomerPortal(options, result);

			// Generate configuration files
			await this.generateConfigurations(options, result);

			this.logger.success(
				`Subscription Management System generated successfully: ${options.name}`,
			);
			return result;
		} catch (error: any) {
			this.logger.error(
				`Failed to generate Subscription Management System: ${error.message}`,
				error,
			);
			throw error;
		}
	}

	private async createSubscriptionStructure(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Create directory structure
		const directories = [
			"src/subscription/services",
			"src/subscription/controllers",
			"src/subscription/models",
			"src/subscription/dto",
			"src/subscription/interfaces",
			"src/billing/providers",
			"src/billing/services",
			"src/billing/webhooks",
			"src/usage/tracking",
			"src/usage/metering",
			"src/reporting/services",
			"src/reporting/generators",
			"src/customer/portal",
			"src/admin/dashboard",
			"src/utils/pricing",
			"src/utils/tax",
			"config/subscription",
			"migrations/subscription",
			"tests/subscription",
		];

		for (const dir of directories) {
			await fs.ensureDir(path.join(baseDir, dir));
		}

		// Generate main subscription module
		const moduleTemplate = await this.loadTemplate(
			"subscription/subscription.module.ts.hbs",
		);
		const moduleContent = moduleTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const modulePath = path.join(
			baseDir,
			"src/subscription/SubscriptionModule.ts",
		);
		await fs.writeFile(modulePath, moduleContent);
		result.files.push(modulePath);
	}

	private async generateBillingProviderIntegration(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate billing provider factory
		const providerFactoryTemplate = await this.loadTemplate(
			"subscription/billing/billing-provider.factory.ts.hbs",
		);
		const providerFactoryContent = providerFactoryTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const providerFactoryPath = path.join(
			baseDir,
			"src/billing/providers/BillingProviderFactory.ts",
		);
		await fs.writeFile(providerFactoryPath, providerFactoryContent);
		result.files.push(providerFactoryPath);

		// Generate provider-specific implementations
		if (options.billingProvider === "stripe") {
			await this.generateStripeIntegration(options, baseDir, result);
		} else if (options.billingProvider === "vipps") {
			await this.generateVippsIntegration(options, baseDir, result);
		} else if (options.billingProvider === "paypal") {
			await this.generatePayPalIntegration(options, baseDir, result);
		}

		// Generate billing service
		const billingServiceTemplate = await this.loadTemplate(
			"subscription/billing/billing.service.ts.hbs",
		);
		const billingServiceContent = billingServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const billingServicePath = path.join(
			baseDir,
			"src/billing/services/BillingService.ts",
		);
		await fs.writeFile(billingServicePath, billingServiceContent);
		result.files.push(billingServicePath);
	}

	private async generateStripeIntegration(
		options: SubscriptionManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const stripeServiceTemplate = await this.loadTemplate(
			"subscription/billing/providers/stripe.service.ts.hbs",
		);
		const stripeServiceContent = stripeServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const stripeServicePath = path.join(
			baseDir,
			"src/billing/providers/StripeService.ts",
		);
		await fs.writeFile(stripeServicePath, stripeServiceContent);
		result.files.push(stripeServicePath);

		result.commands.push("npm install stripe @stripe/stripe-js");
	}

	private async generateVippsIntegration(
		options: SubscriptionManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const vippsServiceTemplate = await this.loadTemplate(
			"subscription/billing/providers/vipps.service.ts.hbs",
		);
		const vippsServiceContent = vippsServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const vippsServicePath = path.join(
			baseDir,
			"src/billing/providers/VippsService.ts",
		);
		await fs.writeFile(vippsServicePath, vippsServiceContent);
		result.files.push(vippsServicePath);

		result.commands.push("npm install @nestjs/axios");
	}

	private async generatePayPalIntegration(
		options: SubscriptionManagementOptions,
		baseDir: string,
		result: GenerationResult,
	): Promise<void> {
		const paypalServiceTemplate = await this.loadTemplate(
			"subscription/billing/providers/paypal.service.ts.hbs",
		);
		const paypalServiceContent = paypalServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const paypalServicePath = path.join(
			baseDir,
			"src/billing/providers/PayPalService.ts",
		);
		await fs.writeFile(paypalServicePath, paypalServiceContent);
		result.files.push(paypalServicePath);

		result.commands.push("npm install @paypal/checkout-server-sdk");
	}

	private async generateSubscriptionPlans(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate subscription plan service
		const planServiceTemplate = await this.loadTemplate(
			"subscription/services/subscription-plan.service.ts.hbs",
		);
		const planServiceContent = planServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const planServicePath = path.join(
			baseDir,
			"src/subscription/services/SubscriptionPlanService.ts",
		);
		await fs.writeFile(planServicePath, planServiceContent);
		result.files.push(planServicePath);

		// Generate pricing calculator
		const pricingTemplate = await this.loadTemplate(
			"subscription/utils/pricing-calculator.service.ts.hbs",
		);
		const pricingContent = pricingTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const pricingPath = path.join(
			baseDir,
			"src/utils/pricing/PricingCalculator.ts",
		);
		await fs.writeFile(pricingPath, pricingContent);
		result.files.push(pricingPath);
	}

	private async generateBillingCycleManagement(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate billing cycle service
		const cycleServiceTemplate = await this.loadTemplate(
			"subscription/services/billing-cycle.service.ts.hbs",
		);
		const cycleServiceContent = cycleServiceTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const cycleServicePath = path.join(
			baseDir,
			"src/subscription/services/BillingCycleService.ts",
		);
		await fs.writeFile(cycleServicePath, cycleServiceContent);
		result.files.push(cycleServicePath);

		if (options.prorationHandling) {
			// Generate proration service
			const prorationTemplate = await this.loadTemplate(
				"subscription/services/proration.service.ts.hbs",
			);
			const prorationContent = prorationTemplate({
				...options,
				timestamp: new Date().toISOString(),
			});

			const prorationPath = path.join(
				baseDir,
				"src/subscription/services/ProrationService.ts",
			);
			await fs.writeFile(prorationPath, prorationContent);
			result.files.push(prorationPath);
		}
	}

	private async generateUsageTracking(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (
			!options.features.includes("usage-tracking") &&
			!options.features.includes("metering")
		)
			return;

		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate usage tracking service
		const usageTrackingTemplate = await this.loadTemplate(
			"subscription/usage/usage-tracking.service.ts.hbs",
		);
		const usageTrackingContent = usageTrackingTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const usageTrackingPath = path.join(
			baseDir,
			"src/usage/tracking/UsageTrackingService.ts",
		);
		await fs.writeFile(usageTrackingPath, usageTrackingContent);
		result.files.push(usageTrackingPath);

		// Generate metering service
		const meteringTemplate = await this.loadTemplate(
			"subscription/usage/metering.service.ts.hbs",
		);
		const meteringContent = meteringTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const meteringPath = path.join(
			baseDir,
			"src/usage/metering/MeteringService.ts",
		);
		await fs.writeFile(meteringPath, meteringContent);
		result.files.push(meteringPath);
	}

	private async generateDunningManagement(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.dunningManagement) return;

		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate dunning service
		const dunningTemplate = await this.loadTemplate(
			"subscription/services/dunning.service.ts.hbs",
		);
		const dunningContent = dunningTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const dunningPath = path.join(
			baseDir,
			"src/subscription/services/DunningService.ts",
		);
		await fs.writeFile(dunningPath, dunningContent);
		result.files.push(dunningPath);
	}

	private async generateTaxHandling(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.taxHandling.enabled) return;

		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate tax service
		const taxTemplate = await this.loadTemplate(
			"subscription/utils/tax-calculator.service.ts.hbs",
		);
		const taxContent = taxTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const taxPath = path.join(baseDir, "src/utils/tax/TaxCalculator.ts");
		await fs.writeFile(taxPath, taxContent);
		result.files.push(taxPath);

		if (options.taxHandling.provider) {
			result.commands.push(`npm install ${options.taxHandling.provider}-sdk`);
		}
	}

	private async generateWebhookHandlers(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		if (!options.webhookHandling) return;

		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate webhook controller
		const webhookTemplate = await this.loadTemplate(
			"subscription/webhooks/billing-webhook.controller.ts.hbs",
		);
		const webhookContent = webhookTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const webhookPath = path.join(
			baseDir,
			"src/billing/webhooks/BillingWebhookController.ts",
		);
		await fs.writeFile(webhookPath, webhookContent);
		result.files.push(webhookPath);
	}

	private async generateAnalyticsReporting(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate analytics service
		const analyticsTemplate = await this.loadTemplate(
			"subscription/reporting/subscription-analytics.service.ts.hbs",
		);
		const analyticsContent = analyticsTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const analyticsPath = path.join(
			baseDir,
			"src/reporting/services/SubscriptionAnalyticsService.ts",
		);
		await fs.writeFile(analyticsPath, analyticsContent);
		result.files.push(analyticsPath);

		// Generate report generator
		const reportTemplate = await this.loadTemplate(
			"subscription/reporting/report-generator.service.ts.hbs",
		);
		const reportContent = reportTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const reportPath = path.join(
			baseDir,
			"src/reporting/generators/ReportGenerator.ts",
		);
		await fs.writeFile(reportPath, reportContent);
		result.files.push(reportPath);
	}

	private async generateCustomerPortal(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate customer portal controller
		const portalTemplate = await this.loadTemplate(
			"subscription/customer/customer-portal.controller.ts.hbs",
		);
		const portalContent = portalTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const portalPath = path.join(
			baseDir,
			"src/customer/portal/CustomerPortalController.ts",
		);
		await fs.writeFile(portalPath, portalContent);
		result.files.push(portalPath);
	}

	private async generateConfigurations(
		options: SubscriptionManagementOptions,
		result: GenerationResult,
	): Promise<void> {
		const baseDir = path.join(process.cwd(), "subscription-system");

		// Generate subscription configuration
		const configTemplate = await this.loadTemplate(
			"subscription/config/subscription.config.ts.hbs",
		);
		const configContent = configTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const configPath = path.join(
			baseDir,
			"config/subscription/subscription.config.ts",
		);
		await fs.writeFile(configPath, configContent);
		result.files.push(configPath);

		// Generate environment variables
		const envTemplate = await this.loadTemplate(
			"subscription/config/env.example.hbs",
		);
		const envContent = envTemplate({
			...options,
			timestamp: new Date().toISOString(),
		});

		const envPath = path.join(baseDir, ".env.example");
		await fs.writeFile(envPath, envContent);
		result.files.push(envPath);

		result.nextSteps.push(
			"Configure billing provider credentials in .env file",
		);
		result.nextSteps.push(
			"Set up webhook endpoints in your billing provider dashboard",
		);
		result.nextSteps.push("Configure tax calculation if enabled");
		result.nextSteps.push("Set up subscription plans in your billing provider");
		result.nextSteps.push("Test billing flows in sandbox environment");
		result.nextSteps.push("Configure dunning management rules");
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
		if (templatePath.includes("subscription.module.ts.hbs")) {
			return `import { Module } from '@nestjs/common';
import { BillingService } from '../billing/services/BillingService';
import { SubscriptionPlanService } from './services/SubscriptionPlanService';
import { BillingCycleService } from './services/BillingCycleService';

@Module({
  providers: [
    BillingService,
    SubscriptionPlanService,
    BillingCycleService,
  ],
  exports: [
    BillingService,
    SubscriptionPlanService,
  ],
})
export class SubscriptionModule {}`;
		}

		return `// Generated template for ${templatePath}
// Subscription system: {{name}}
// Billing provider: {{billingProvider}}
// Model: {{subscriptionModel}}
// Generated at: {{timestamp}}

export class SubscriptionService {
  // TODO: Implement subscription logic for ${templatePath}
}`;
	}

	protected async validateOptions(
		options: SubscriptionManagementOptions,
	): Promise<void> {
		if (!options.name) {
			throw new Error("Subscription system name is required");
		}

		if (!options.billingProvider) {
			throw new Error("Billing provider is required");
		}

		if (!options.subscriptionModel) {
			throw new Error("Subscription model is required");
		}

		if (!options.billingCycle) {
			throw new Error("Billing cycle is required");
		}

		if (!options.currencies || options.currencies.length === 0) {
			throw new Error("At least one currency must be specified");
		}

		if (!options.features || options.features.length === 0) {
			throw new Error("At least one subscription feature must be selected");
		}
	}
}

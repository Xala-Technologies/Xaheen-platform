/**
 * Bundle Resolver Implementation
 *
 * Resolves service bundles and handles dependency management.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { consola } from "consola";
import { randomUUID } from "crypto";
import type {
	BundleResolutionResult,
	IBundleResolver,
	IServiceRegistry,
	ServiceBundle,
	ServiceConfiguration,
} from "../../types/index.js";

export class BundleResolver implements IBundleResolver {
	private serviceRegistry: IServiceRegistry;
	private bundles: Map<string, ServiceBundle> = new Map();

	constructor(serviceRegistry: IServiceRegistry) {
		this.serviceRegistry = serviceRegistry;
		this.initializeBundles();
	}

	resolveBundle(
		bundle: ServiceBundle,
		options: any = {},
	): BundleResolutionResult {
		const startTime = Date.now();
		consola.debug(`Resolving bundle: ${bundle.name}`);

		const errors: string[] = [];
		const warnings: string[] = [];
		const resolvedServices: ServiceConfiguration[] = [];

		try {
			// Resolve required services from service IDs
			for (const serviceId of bundle.services) {
				// Find service by ID in the registry
				const serviceConfig = this.serviceRegistry.get(serviceId) || 
								     this.serviceRegistry.getAllServices().find(s => 
									     s.serviceId === serviceId || 
									     `${s.serviceType}-${s.provider}` === serviceId
								     );

				if (!serviceConfig) {
					errors.push(`Service not found: ${serviceId}`);
					continue;
				}

				resolvedServices.push(serviceConfig);
			}

			// Sort services by priority and dependencies
			const sortedServices = this.sortServicesByDependencies(resolvedServices);

			return {
				success: errors.length === 0,
				services: sortedServices,
				errors: errors.length > 0 ? errors : undefined,
				warnings: warnings.length > 0 ? warnings : undefined,
			};
		} catch (error) {
			return {
				success: false,
				errors: [`Bundle resolution failed: ${error instanceof Error ? error.message : String(error)}`],
			};
		}
	}

	loadBundleByName(name: string): ServiceBundle | null {
		return this.bundles.get(name) || null;
	}

	createCustomBundle(services: string[]): ServiceBundle {
		const bundle: ServiceBundle = {
			id: randomUUID(),
			name: "custom-bundle",
			displayName: "Custom Bundle",
			description: "Custom service bundle",
			version: "1.0.0",
			type: "custom",
			services: services.map((serviceType) => ({
				serviceType: serviceType as any,
				provider: this.getDefaultProvider(serviceType),
				required: true,
				priority: 50,
				config: {},
			})),
			optionalServices: [],
			deploymentTargets: ["cloud-native"],
			compliance: [],
			tags: ["custom"],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		return bundle;
	}

	private initializeBundles(): void {
		// SaaS Starter Bundle
		this.bundles.set("saas-starter", {
			id: randomUUID(),
			name: "saas-starter",
			displayName: "SaaS Starter",
			description: "Essential SaaS features for getting started",
			version: "1.0.0",
			type: "saas-starter",
			services: [
				{
					serviceType: "auth",
					provider: "better-auth",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "stripe",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "email",
					provider: "resend",
					required: true,
					priority: 70,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "posthog",
					required: true,
					priority: 60,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["vercel", "netlify", "cloudflare"],
			pricing: {
				tier: "starter",
				monthlyPrice: "$0",
				features: [
					"Authentication",
					"Database",
					"Payments",
					"Email",
					"Analytics",
				],
			},
			compliance: [],
			tags: ["saas", "starter"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// SaaS Professional Bundle
		this.bundles.set("saas-professional", {
			id: randomUUID(),
			name: "saas-professional",
			displayName: "SaaS Professional",
			description: "Full-featured SaaS platform with advanced capabilities",
			version: "1.0.0",
			type: "saas-professional",
			services: [
				{
					serviceType: "auth",
					provider: "clerk",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "cache",
					provider: "redis",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "stripe",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "email",
					provider: "resend",
					required: true,
					priority: 70,
					config: {},
				},
				{
					serviceType: "sms",
					provider: "twilio",
					required: false,
					priority: 65,
					config: {},
				},
				{
					serviceType: "storage",
					provider: "uploadthing",
					required: true,
					priority: 60,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "posthog",
					required: true,
					priority: 55,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "sentry",
					required: true,
					priority: 50,
					config: {},
				},
				{
					serviceType: "search",
					provider: "algolia",
					required: false,
					priority: 45,
					config: {},
				},
				{
					serviceType: "queue",
					provider: "bullmq",
					required: true,
					priority: 40,
					config: {},
				},
			],
			optionalServices: [
				{ serviceType: "ai", provider: "openai", condition: "feature:ai" },
				{
					serviceType: "realtime",
					provider: "pusher",
					condition: "feature:realtime",
				},
			],
			deploymentTargets: ["vercel", "aws", "gcp"],
			compliance: ["gdpr", "ccpa"],
			pricing: {
				tier: "professional",
				monthlyPrice: "$99",
				features: [
					"Everything in Starter",
					"Advanced Auth",
					"Caching",
					"File Storage",
					"Job Queue",
					"Search",
					"Monitoring",
				],
			},
			tags: ["saas", "professional", "enterprise-ready"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Marketing Site Bundle
		this.bundles.set("marketing-site", {
			id: randomUUID(),
			name: "marketing-site",
			displayName: "🌐 Marketing Site",
			description: "Modern landing page with Next.js and Xala UI",
			version: "1.0.0",
			type: "landing-page",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "vercel",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "cms",
					provider: "contentful",
					required: true,
					priority: 80,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["vercel"],
			compliance: [],
			tags: ["landing-page", "marketing", "cms"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Portfolio Site Bundle
		this.bundles.set("portfolio-site", {
			id: randomUUID(),
			name: "portfolio-site",
			displayName: "🎨 Portfolio Site",
			description: "Creative portfolio with animations and CMS",
			version: "1.0.0",
			type: "landing-page",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "google",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "cms",
					provider: "sanity",
					required: true,
					priority: 80,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["netlify"],
			compliance: [],
			tags: ["landing-page", "portfolio", "creative"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Dashboard App Bundle
		this.bundles.set("dashboard-app", {
			id: randomUUID(),
			name: "dashboard-app",
			displayName: "📊 Dashboard App",
			description: "Admin dashboard with authentication and database",
			version: "1.0.0",
			type: "web-app",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "prisma",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "better-auth",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "posthog",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "sentry",
					required: true,
					priority: 75,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["vercel"],
			compliance: [],
			tags: ["web-app", "dashboard", "admin"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Full-Stack App Bundle
		this.bundles.set("fullstack-app", {
			id: randomUUID(),
			name: "fullstack-app",
			displayName: "🚀 Full-Stack App",
			description: "Complete web application with payments and notifications",
			version: "1.0.0",
			type: "web-app",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "drizzle",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "clerk",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "stripe",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "email",
					provider: "resend",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "storage",
					provider: "uploadthing",
					required: true,
					priority: 70,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "mixpanel",
					required: true,
					priority: 65,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "datadog",
					required: true,
					priority: 60,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["vercel"],
			compliance: [],
			tags: ["web-app", "fullstack", "saas"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Mobile App Bundle
		this.bundles.set("mobile-app", {
			id: randomUUID(),
			name: "mobile-app",
			displayName: "📱 Mobile App",
			description: "React Native app with backend API",
			version: "1.0.0",
			type: "mobile-app",
			services: [
				{
					serviceType: "backend",
					provider: "hono",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "sqlite",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "drizzle",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "better-auth",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "realtime",
					provider: "pusher",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "amplitude",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "sentry",
					required: true,
					priority: 70,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["expo"],
			compliance: [],
			tags: ["mobile-app", "react-native", "api"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// REST API Bundle
		this.bundles.set("rest-api", {
			id: randomUUID(),
			name: "rest-api",
			displayName: "🔌 REST API",
			description: "Backend API with authentication and documentation",
			version: "1.0.0",
			type: "api",
			services: [
				{
					serviceType: "backend",
					provider: "hono",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "drizzle",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "better-auth",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "prometheus",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "queue",
					provider: "rabbitmq",
					required: true,
					priority: 75,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["docker"],
			compliance: [],
			tags: ["api", "rest", "backend"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Enterprise App Bundle
		this.bundles.set("enterprise-app", {
			id: randomUUID(),
			name: "enterprise-app",
			displayName: "🏢 Enterprise App",
			description: "Enterprise web application with Microsoft stack",
			version: "1.0.0",
			type: "enterprise",
			services: [
				{
					serviceType: "frontend",
					provider: "blazor",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "backend",
					provider: "dotnet",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "database",
					provider: "sqlserver",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "entity-framework",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "identity-server",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "azure-app-insights",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "queue",
					provider: "azure-service-bus",
					required: true,
					priority: 70,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["azure"],
			compliance: [],
			tags: ["enterprise", "microsoft", "dotnet"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// SaaS Starter (Complete) Bundle
		this.bundles.set("saas-complete", {
			id: randomUUID(),
			name: "saas-complete",
			displayName: "💼 SaaS Starter",
			description: "Complete SaaS application with multi-tenancy and billing",
			version: "1.0.0",
			type: "saas",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "prisma",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "clerk",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "stripe",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "email",
					provider: "resend",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "analytics",
					provider: "posthog",
					required: true,
					priority: 70,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "datadog",
					required: true,
					priority: 65,
					config: {},
				},
				{
					serviceType: "rbac",
					provider: "casbin",
					required: true,
					priority: 60,
					config: {},
				},
				{
					serviceType: "multitenancy",
					provider: "schema-separation",
					required: true,
					priority: 55,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["vercel"],
			compliance: [],
			tags: ["saas", "multi-tenant", "billing"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Norwegian Government Bundle
		this.bundles.set("norwegian-gov", {
			id: randomUUID(),
			name: "norwegian-gov",
			displayName: "🇳🇴 Norwegian Gov",
			description: "Norwegian government compliant application",
			version: "1.0.0",
			type: "government",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "prisma",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "bankid",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "vipps",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "grafana",
					required: true,
					priority: 75,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["azure"],
			compliance: ["gdpr", "norwegian-privacy"],
			tags: ["government", "norwegian", "compliant"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// More specialized bundles...

		// Municipality Portal Bundle
		this.bundles.set("municipality-portal", {
			id: randomUUID(),
			name: "municipality-portal",
			displayName: "🏛️ Municipality Portal",
			description: "Norwegian municipality citizen services portal",
			version: "1.0.0",
			type: "government",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "prisma",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "bankid",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "payments",
					provider: "vipps",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "i18n",
					provider: "next-intl",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "grafana",
					required: true,
					priority: 70,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["azure"],
			compliance: ["gdpr", "wcag-aaa", "norwegian-privacy"],
			tags: ["government", "municipality", "citizen-services"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Healthcare Management Bundle
		this.bundles.set("healthcare-management", {
			id: randomUUID(),
			name: "healthcare-management",
			displayName: "🏥 Healthcare Management",
			description:
				"Norwegian healthcare management system with GDPR compliance",
			version: "1.0.0",
			type: "healthcare",
			services: [
				{
					serviceType: "frontend",
					provider: "nextjs",
					required: true,
					priority: 100,
					config: {},
				},
				{
					serviceType: "database",
					provider: "postgresql",
					required: true,
					priority: 95,
					config: {},
				},
				{
					serviceType: "orm",
					provider: "prisma",
					required: true,
					priority: 90,
					config: {},
				},
				{
					serviceType: "auth",
					provider: "bankid",
					required: true,
					priority: 85,
					config: {},
				},
				{
					serviceType: "rbac",
					provider: "casbin",
					required: true,
					priority: 80,
					config: {},
				},
				{
					serviceType: "i18n",
					provider: "next-intl",
					required: true,
					priority: 75,
					config: {},
				},
				{
					serviceType: "monitoring",
					provider: "grafana",
					required: true,
					priority: 70,
					config: {},
				},
			],
			optionalServices: [],
			deploymentTargets: ["azure"],
			compliance: ["gdpr", "hipaa", "norwegian-health-privacy"],
			tags: ["healthcare", "medical", "patient-management"],
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	private getDefaultProvider(serviceType: string): string {
		const defaults: Record<string, string> = {
			// Core services
			auth: "better-auth",
			payments: "stripe",
			database: "postgresql",
			cache: "redis",
			email: "resend",
			sms: "twilio",
			storage: "uploadthing",
			analytics: "posthog",
			monitoring: "sentry",
			search: "algolia",
			queue: "bullmq",
			realtime: "pusher",
			ai: "openai",

			// Frameworks
			frontend: "nextjs",
			backend: "hono",
			orm: "prisma",

			// CMS
			cms: "contentful",

			// Testing
			testing: "vitest",

			// DevOps
			devops: "docker",

			// Enterprise
			rbac: "casbin",
			multitenancy: "schema-separation",
			i18n: "next-intl",
		};

		return defaults[serviceType] || "default";
	}

	private sortServicesByDependencies(
		services: ServiceConfiguration[],
	): ServiceConfiguration[] {
		// Simple priority-based sort for now
		return [...services].sort((a, b) => (b.priority || 0) - (a.priority || 0));
	}

	private generateDeploymentInstructions(
		bundle: ServiceBundle,
		services: ServiceConfiguration[],
	): string[] {
		return [
			`# Deployment Instructions for ${bundle.displayName}`,
			"",
			"## Services to Deploy",
			...services.map((s) => `- ${s.serviceType}: ${s.provider} v${s.version}`),
			"",
			"## Environment Variables",
			...services.flatMap((s) =>
				s.environmentVariables.map(
					(env) => `- ${env.name}: ${env.required ? "Required" : "Optional"}`,
				),
			),
			"",
			"## Deployment Order",
			...services.map((s, i) => `${i + 1}. ${s.serviceType}`),
		];
	}

	private collectPostInstallSteps(services: ServiceConfiguration[]): string[] {
		const steps: string[] = [];

		for (const service of services) {
			steps.push(...service.postInstallSteps);
		}

		return [...new Set(steps)]; // Remove duplicates
	}
}

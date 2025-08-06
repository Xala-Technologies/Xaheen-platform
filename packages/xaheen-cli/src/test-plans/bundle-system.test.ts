/**
 * Bundle System Testing Suite
 *
 * Comprehensive tests for the prebuilt bundle system including:
 * - Bundle resolver functionality
 * - Prebuilt bundle validation
 * - Norwegian compliance bundles
 * - Enterprise and SaaS bundles
 * - Bundle dependency resolution
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BundleResolver } from "../services/bundles/bundle-resolver";
import { ServiceRegistry } from "../services/registry/service-registry";
import type { ServiceBundle } from "../types/index";

describe("Bundle System Testing Suite", () => {
	let bundleResolver: BundleResolver;
	let serviceRegistry: ServiceRegistry;
	let testProjectPath: string;

	beforeEach(async () => {
		serviceRegistry = new ServiceRegistry();
		bundleResolver = new BundleResolver(serviceRegistry);
		testProjectPath = path.join(
			process.cwd(),
			"test-output",
			`bundle-test-${Date.now()}`,
		);
		await fs.ensureDir(testProjectPath);
	});

	afterEach(async () => {
		await fs.remove(testProjectPath);
	});

	describe("Bundle Resolver Core Functionality", () => {
		it("should initialize with prebuilt bundles", () => {
			expect(bundleResolver).toBeDefined();
			expect(bundleResolver.loadBundleByName).toBeDefined();
			expect(bundleResolver.resolveBundle).toBeDefined();
			expect(bundleResolver.createCustomBundle).toBeDefined();
		});

		it("should load prebuilt bundles by name", async () => {
			const saasBundle = await bundleResolver.loadBundleByName("saas-starter");
			expect(saasBundle).toBeDefined();
			expect(saasBundle!.name).toBe("saas-starter");
			expect(saasBundle!.displayName).toBe("SaaS Starter");
			expect(saasBundle!.services).toBeDefined();
			expect(saasBundle!.services.length).toBeGreaterThan(0);

			const norwegianBundle =
				await bundleResolver.loadBundleByName("norwegian-gov");
			expect(norwegianBundle).toBeDefined();
			expect(norwegianBundle!.name).toBe("norwegian-gov");
			expect(norwegianBundle!.displayName).toBe("🇳🇴 Norwegian Gov");
		});

		it("should return null for non-existent bundles", async () => {
			const nonExistentBundle = await bundleResolver.loadBundleByName(
				"non-existent-bundle",
			);
			expect(nonExistentBundle).toBeNull();
		});

		it("should create custom bundles", async () => {
			const customServices = ["auth", "database", "payments"];
			const customBundle =
				await bundleResolver.createCustomBundle(customServices);

			expect(customBundle).toBeDefined();
			expect(customBundle.name).toBe("custom-bundle");
			expect(customBundle.type).toBe("custom");
			expect(customBundle.services).toHaveLength(3);
			expect(customBundle.services.map((s) => s.serviceType)).toEqual(
				customServices,
			);
		});
	});

	describe("Prebuilt Bundle Validation", () => {
		describe("SaaS Bundles", () => {
			it("should validate SaaS Starter bundle structure", async () => {
				const bundle = await bundleResolver.loadBundleByName("saas-starter");
				expect(bundle).toBeDefined();

				// Essential SaaS services
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("auth");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("payments");
				expect(serviceTypes).toContain("email");
				expect(serviceTypes).toContain("analytics");

				// Check service priorities
				const authService = bundle!.services.find(
					(s) => s.serviceType === "auth",
				);
				expect(authService?.priority).toBe(100); // Highest priority

				// Check deployment targets
				expect(bundle!.deploymentTargets).toContain("vercel");
				expect(bundle!.deploymentTargets).toContain("netlify");
				expect(bundle!.deploymentTargets).toContain("cloudflare");

				// Check pricing information
				expect(bundle!.pricing).toBeDefined();
				expect(bundle!.pricing!.tier).toBe("starter");
				expect(bundle!.pricing!.monthlyPrice).toBe("$0");
			});

			it("should validate SaaS Professional bundle structure", async () => {
				const bundle =
					await bundleResolver.loadBundleByName("saas-professional");
				expect(bundle).toBeDefined();

				// Professional features
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("auth");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("cache"); // Redis caching
				expect(serviceTypes).toContain("payments");
				expect(serviceTypes).toContain("storage"); // File storage
				expect(serviceTypes).toContain("monitoring"); // Sentry
				expect(serviceTypes).toContain("search"); // Algolia
				expect(serviceTypes).toContain("queue"); // Job queue

				// Check optional services
				expect(bundle!.optionalServices).toBeDefined();
				expect(bundle!.optionalServices!.length).toBeGreaterThan(0);

				const optionalServiceTypes = bundle!.optionalServices!.map(
					(s) => s.serviceType,
				);
				expect(optionalServiceTypes).toContain("ai");
				expect(optionalServiceTypes).toContain("realtime");

				// Check compliance
				expect(bundle!.compliance).toContain("gdpr");
				expect(bundle!.compliance).toContain("ccpa");

				// Check pricing
				expect(bundle!.pricing!.tier).toBe("professional");
				expect(bundle!.pricing!.monthlyPrice).toBe("$99");
			});

			it("should validate SaaS Complete bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("saas-complete");
				expect(bundle).toBeDefined();

				// Advanced SaaS features
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("rbac"); // Role-based access control
				expect(serviceTypes).toContain("multitenancy"); // Multi-tenant support
				expect(serviceTypes).toContain("monitoring"); // Datadog

				expect(bundle!.tags).toContain("multi-tenant");
				expect(bundle!.tags).toContain("billing");
			});
		});

		describe("Norwegian Bundles", () => {
			it("should validate Norwegian Government bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("norwegian-gov");
				expect(bundle).toBeDefined();

				// Norwegian-specific services
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("bankid"); // BankID authentication
				expect(serviceProviders).toContain("vipps"); // Vipps payments

				// Compliance requirements
				expect(bundle!.compliance).toContain("gdpr");
				expect(bundle!.compliance).toContain("norwegian-privacy");

				// Deployment targets
				expect(bundle!.deploymentTargets).toContain("azure");

				// Tags
				expect(bundle!.tags).toContain("government");
				expect(bundle!.tags).toContain("norwegian");
				expect(bundle!.tags).toContain("compliant");
			});

			it("should validate Municipality Portal bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName(
					"municipality-portal",
				);
				expect(bundle).toBeDefined();

				// Municipality-specific features
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("auth"); // BankID
				expect(serviceTypes).toContain("payments"); // Vipps
				expect(serviceTypes).toContain("i18n"); // Internationalization

				// Extended compliance
				expect(bundle!.compliance).toContain("gdpr");
				expect(bundle!.compliance).toContain("wcag-aaa");
				expect(bundle!.compliance).toContain("norwegian-privacy");

				// Citizen services tags
				expect(bundle!.tags).toContain("municipality");
				expect(bundle!.tags).toContain("citizen-services");
			});

			it("should validate Healthcare Management bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName(
					"healthcare-management",
				);
				expect(bundle).toBeDefined();

				// Healthcare-specific features
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("rbac"); // Role-based access for medical staff
				expect(serviceTypes).toContain("i18n"); // Multi-language support

				// Healthcare compliance
				expect(bundle!.compliance).toContain("gdpr");
				expect(bundle!.compliance).toContain("hipaa");
				expect(bundle!.compliance).toContain("norwegian-health-privacy");

				// Healthcare tags
				expect(bundle!.tags).toContain("healthcare");
				expect(bundle!.tags).toContain("medical");
				expect(bundle!.tags).toContain("patient-management");
			});
		});

		describe("Application Type Bundles", () => {
			it("should validate Marketing Site bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("marketing-site");
				expect(bundle).toBeDefined();

				// Marketing site essentials
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("frontend");
				expect(serviceTypes).toContain("analytics");
				expect(serviceTypes).toContain("cms");

				// Check providers
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("nextjs");
				expect(serviceProviders).toContain("vercel"); // Analytics
				expect(serviceProviders).toContain("contentful"); // CMS

				expect(bundle!.type).toBe("landing-page");
				expect(bundle!.tags).toContain("marketing");
				expect(bundle!.deploymentTargets).toContain("vercel");
			});

			it("should validate Portfolio Site bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("portfolio-site");
				expect(bundle).toBeDefined();

				// Portfolio-specific setup
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("nextjs");
				expect(serviceProviders).toContain("google"); // Google Analytics
				expect(serviceProviders).toContain("sanity"); // Sanity CMS

				expect(bundle!.tags).toContain("portfolio");
				expect(bundle!.tags).toContain("creative");
				expect(bundle!.deploymentTargets).toContain("netlify");
			});

			it("should validate Dashboard App bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("dashboard-app");
				expect(bundle).toBeDefined();

				// Dashboard essentials
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("frontend");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("orm");
				expect(serviceTypes).toContain("auth");
				expect(serviceTypes).toContain("analytics");
				expect(serviceTypes).toContain("monitoring");

				expect(bundle!.type).toBe("web-app");
				expect(bundle!.tags).toContain("dashboard");
				expect(bundle!.tags).toContain("admin");
			});

			it("should validate Full-Stack App bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("fullstack-app");
				expect(bundle).toBeDefined();

				// Full-stack features
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("frontend");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("orm");
				expect(serviceTypes).toContain("auth");
				expect(serviceTypes).toContain("payments");
				expect(serviceTypes).toContain("email");
				expect(serviceTypes).toContain("storage");
				expect(serviceTypes).toContain("analytics");
				expect(serviceTypes).toContain("monitoring");

				// Advanced providers
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("clerk"); // Advanced auth
				expect(serviceProviders).toContain("drizzle"); // Modern ORM
				expect(serviceProviders).toContain("mixpanel"); // Advanced analytics
				expect(serviceProviders).toContain("datadog"); // Enterprise monitoring

				expect(bundle!.tags).toContain("fullstack");
				expect(bundle!.tags).toContain("saas");
			});

			it("should validate Mobile App bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("mobile-app");
				expect(bundle).toBeDefined();

				// Mobile-specific setup
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("backend");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("realtime"); // Real-time features
				expect(serviceTypes).toContain("analytics");

				// Mobile-optimized providers
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("hono"); // Lightweight backend
				expect(serviceProviders).toContain("sqlite"); // Mobile database
				expect(serviceProviders).toContain("pusher"); // Real-time
				expect(serviceProviders).toContain("amplitude"); // Mobile analytics

				expect(bundle!.type).toBe("mobile-app");
				expect(bundle!.tags).toContain("react-native");
				expect(bundle!.deploymentTargets).toContain("expo");
			});

			it("should validate REST API bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("rest-api");
				expect(bundle).toBeDefined();

				// API essentials
				const serviceTypes = bundle!.services.map((s) => s.serviceType);
				expect(serviceTypes).toContain("backend");
				expect(serviceTypes).toContain("database");
				expect(serviceTypes).toContain("orm");
				expect(serviceTypes).toContain("auth");
				expect(serviceTypes).toContain("monitoring");
				expect(serviceTypes).toContain("queue");

				// API-specific providers
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("hono"); // Fast backend
				expect(serviceProviders).toContain("prometheus"); // API monitoring
				expect(serviceProviders).toContain("rabbitmq"); // Message queue

				expect(bundle!.type).toBe("api");
				expect(bundle!.tags).toContain("rest");
				expect(bundle!.deploymentTargets).toContain("docker");
			});

			it("should validate Enterprise App bundle", async () => {
				const bundle = await bundleResolver.loadBundleByName("enterprise-app");
				expect(bundle).toBeDefined();

				// Enterprise Microsoft stack
				const serviceProviders = bundle!.services.map((s) => s.provider);
				expect(serviceProviders).toContain("blazor"); // Enterprise frontend
				expect(serviceProviders).toContain("dotnet"); // .NET backend
				expect(serviceProviders).toContain("sqlserver"); // SQL Server
				expect(serviceProviders).toContain("entity-framework"); // Entity Framework
				expect(serviceProviders).toContain("identity-server"); // Enterprise auth
				expect(serviceProviders).toContain("azure-app-insights"); // Azure monitoring
				expect(serviceProviders).toContain("azure-service-bus"); // Azure queue

				expect(bundle!.type).toBe("enterprise");
				expect(bundle!.tags).toContain("microsoft");
				expect(bundle!.tags).toContain("dotnet");
				expect(bundle!.deploymentTargets).toContain("azure");
			});
		});
	});

	describe("Bundle Resolution Tests", () => {
		// Mock the service registry for controlled testing
		beforeEach(() => {
			vi.spyOn(serviceRegistry, "getTemplate").mockImplementation(
				async (serviceType, provider) => {
					return {
						serviceType,
						provider,
						version: "1.0.0",
						frameworks: ["nextjs", "react"],
						dependencies: [],
						envVariables: [
							{
								name: `${serviceType.toUpperCase()}_API_KEY`,
								description: `API key for ${serviceType}`,
								required: true,
								type: "string",
								defaultValue: "test-key",
							},
						],
						postInjectionSteps: [
							{
								type: "command",
								command: `npm install ${provider}`,
								description: `Install ${provider} package`,
							},
						],
						injectionPoints: [],
					};
				},
			);
		});

		it("should resolve SaaS Starter bundle successfully", async () => {
			const bundle = await bundleResolver.loadBundleByName("saas-starter");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.status).toBe("success");
			expect(resolution.bundleId).toBe(bundle!.id);
			expect(resolution.bundleName).toBe(bundle!.name);
			expect(resolution.resolvedServices).toBeDefined();
			expect(resolution.resolvedServices.length).toBe(bundle!.services.length);
			expect(resolution.errors).toHaveLength(0);
			expect(resolution.resolutionTime).toBeGreaterThan(0);
			expect(resolution.resolvedAt).toBeInstanceOf(Date);
		});

		it("should resolve Norwegian Government bundle with compliance", async () => {
			const bundle = await bundleResolver.loadBundleByName("norwegian-gov");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!, {
				targetFramework: "nextjs",
			});

			expect(resolution.status).toBe("success");
			expect(resolution.resolvedServices).toBeDefined();

			// Check Norwegian-specific services were resolved
			const serviceTypes = resolution.resolvedServices.map(
				(s) => s.serviceType,
			);
			expect(serviceTypes).toContain("auth"); // BankID
			expect(serviceTypes).toContain("payments"); // Vipps

			// Check environment variables were included
			const envVars = resolution.resolvedServices.flatMap(
				(s) => s.environmentVariables,
			);
			expect(envVars.length).toBeGreaterThan(0);
			expect(envVars.some((env) => env.name.includes("AUTH"))).toBe(true);
			expect(envVars.some((env) => env.name.includes("PAYMENTS"))).toBe(true);
		});

		it("should resolve Healthcare Management bundle with extended compliance", async () => {
			const bundle = await bundleResolver.loadBundleByName(
				"healthcare-management",
			);
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.status).toBe("success");

			// Check healthcare-specific services
			const serviceTypes = resolution.resolvedServices.map(
				(s) => s.serviceType,
			);
			expect(serviceTypes).toContain("rbac"); // Role-based access control
			expect(serviceTypes).toContain("i18n"); // Internationalization

			// Check post-install steps were collected
			expect(resolution.postInstallSteps).toBeDefined();
			expect(resolution.postInstallSteps.length).toBeGreaterThan(0);
		});

		it("should handle bundle resolution with warnings", async () => {
			// Mock a service that doesn't exist to trigger warnings
			vi.spyOn(serviceRegistry, "getTemplate").mockImplementation(
				async (serviceType, provider) => {
					if (serviceType === "nonexistent-service") {
						return null; // Service not found
					}
					return {
						serviceType,
						provider,
						version: "1.0.0",
						frameworks: ["vue"], // Incompatible framework
						dependencies: [],
						envVariables: [],
						postInjectionSteps: [],
						injectionPoints: [],
					};
				},
			);

			const testBundle: ServiceBundle = {
				id: "test-bundle",
				name: "test-bundle",
				displayName: "Test Bundle",
				description: "Test bundle with issues",
				version: "1.0.0",
				type: "test",
				services: [
					{
						serviceType: "frontend",
						provider: "nextjs",
						required: true,
						priority: 100,
						config: {},
					},
					{
						serviceType: "nonexistent-service",
						provider: "test",
						required: false,
						priority: 90,
						config: {},
					},
				],
				optionalServices: [],
				deploymentTargets: ["vercel"],
				tags: ["test"],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const resolution = await bundleResolver.resolveBundle(testBundle, {
				targetFramework: "nextjs",
			});

			expect(resolution.status).toBe("warning");
			expect(resolution.warnings.length).toBeGreaterThan(0);
			expect(
				resolution.warnings.some((w) =>
					w.includes("Optional service not found"),
				),
			).toBe(true);
			expect(
				resolution.warnings.some((w) => w.includes("may not be compatible")),
			).toBe(true);
		});

		it("should handle bundle resolution failures", async () => {
			// Mock service registry to return null for required services
			vi.spyOn(serviceRegistry, "getTemplate").mockResolvedValue(null);

			const bundle = await bundleResolver.loadBundleByName("saas-starter");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.status).toBe("failed");
			expect(resolution.errors.length).toBeGreaterThan(0);
			expect(
				resolution.errors.some((e) => e.includes("Required service not found")),
			).toBe(true);
		});

		it("should handle bundle resolution errors gracefully", async () => {
			// Mock service registry to throw errors
			vi.spyOn(serviceRegistry, "getTemplate").mockRejectedValue(
				new Error("Service registry error"),
			);

			const bundle = await bundleResolver.loadBundleByName("saas-starter");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.status).toBe("failed");
			expect(resolution.errors).toContain("Service registry error");
		});
	});

	describe("Bundle Dependency Management", () => {
		it("should sort services by priority correctly", async () => {
			const bundle = await bundleResolver.loadBundleByName("saas-professional");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.status).toBe("success");
			expect(resolution.resolvedServices.length).toBeGreaterThan(1);

			// Check that services are sorted by priority (highest first)
			for (let i = 0; i < resolution.resolvedServices.length - 1; i++) {
				const currentPriority = resolution.resolvedServices[i].priority || 0;
				const nextPriority = resolution.resolvedServices[i + 1].priority || 0;
				expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
			}
		});

		it("should generate deployment instructions", async () => {
			const bundle = await bundleResolver.loadBundleByName("dashboard-app");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.deploymentInstructions).toBeDefined();
			expect(resolution.deploymentInstructions.length).toBeGreaterThan(0);

			// Check instruction format
			expect(resolution.deploymentInstructions[0]).toContain(
				"Deployment Instructions",
			);
			expect(
				resolution.deploymentInstructions.some((line) =>
					line.includes("Services to Deploy"),
				),
			).toBe(true);
			expect(
				resolution.deploymentInstructions.some((line) =>
					line.includes("Environment Variables"),
				),
			).toBe(true);
		});

		it("should collect unique post-install steps", async () => {
			const bundle = await bundleResolver.loadBundleByName("fullstack-app");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);

			expect(resolution.postInstallSteps).toBeDefined();
			expect(resolution.postInstallSteps.length).toBeGreaterThan(0);

			// Check that duplicates are removed
			const uniqueSteps = new Set(resolution.postInstallSteps);
			expect(uniqueSteps.size).toBe(resolution.postInstallSteps.length);
		});
	});

	describe("Custom Bundle Creation", () => {
		it("should create basic custom bundles", async () => {
			const services = ["auth", "database", "payments"];
			const customBundle = await bundleResolver.createCustomBundle(services);

			expect(customBundle.name).toBe("custom-bundle");
			expect(customBundle.type).toBe("custom");
			expect(customBundle.services).toHaveLength(3);

			// Check default providers
			const authService = customBundle.services.find(
				(s) => s.serviceType === "auth",
			);
			expect(authService?.provider).toBe("better-auth");

			const dbService = customBundle.services.find(
				(s) => s.serviceType === "database",
			);
			expect(dbService?.provider).toBe("postgresql");

			const paymentService = customBundle.services.find(
				(s) => s.serviceType === "payments",
			);
			expect(paymentService?.provider).toBe("stripe");
		});

		it("should set appropriate priorities for custom bundles", async () => {
			const services = ["frontend", "backend", "database"];
			const customBundle = await bundleResolver.createCustomBundle(services);

			// All services should have the same default priority
			customBundle.services.forEach((service) => {
				expect(service.priority).toBe(50);
				expect(service.required).toBe(true);
			});
		});

		it("should use default providers for unknown service types", async () => {
			const services = ["unknown-service-type"];
			const customBundle = await bundleResolver.createCustomBundle(services);

			const unknownService = customBundle.services[0];
			expect(unknownService.provider).toBe("default");
		});
	});

	describe("Bundle System Performance", () => {
		it("should resolve bundles within performance limits", async () => {
			const bundle = await bundleResolver.loadBundleByName("saas-professional");
			expect(bundle).toBeDefined();

			const startTime = performance.now();
			const resolution = await bundleResolver.resolveBundle(bundle!);
			const endTime = performance.now();

			expect(resolution.status).toBe("success");
			expect(endTime - startTime).toBeLessThan(1000); // Should resolve in < 1 second
			expect(resolution.resolutionTime).toBeLessThan(1000);
		});

		it("should handle multiple concurrent bundle resolutions", async () => {
			const bundleNames = [
				"saas-starter",
				"norwegian-gov",
				"dashboard-app",
				"marketing-site",
			];
			const resolutionPromises = bundleNames.map(async (name) => {
				const bundle = await bundleResolver.loadBundleByName(name);
				return bundleResolver.resolveBundle(bundle!);
			});

			const startTime = performance.now();
			const resolutions = await Promise.all(resolutionPromises);
			const endTime = performance.now();

			expect(resolutions).toHaveLength(4);
			resolutions.forEach((resolution) => {
				expect(resolution.status).toBe("success");
			});
			expect(endTime - startTime).toBeLessThan(3000); // Should complete in < 3 seconds
		});
	});

	describe("Bundle System Integration", () => {
		it("should integrate bundle resolution with project scaffolding workflow", async () => {
			// This test would ideally integrate with the ProjectScaffolder
			// For now, we'll test the bundle structure that would be passed to scaffolding

			const bundle = await bundleResolver.loadBundleByName("norwegian-gov");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);
			expect(resolution.status).toBe("success");

			// Verify the resolution provides everything needed for scaffolding
			expect(resolution.resolvedServices).toBeDefined();
			expect(resolution.deploymentInstructions).toBeDefined();
			expect(resolution.postInstallSteps).toBeDefined();

			// Check that Norwegian-specific configuration is preserved
			const authService = resolution.resolvedServices.find(
				(s) => s.serviceType === "auth",
			);
			expect(authService).toBeDefined();
			expect(authService?.provider).toBe("bankid");

			const paymentService = resolution.resolvedServices.find(
				(s) => s.serviceType === "payments",
			);
			expect(paymentService).toBeDefined();
			expect(paymentService?.provider).toBe("vipps");
		});

		it("should provide environment variables for all bundle services", async () => {
			const bundle = await bundleResolver.loadBundleByName("saas-complete");
			expect(bundle).toBeDefined();

			const resolution = await bundleResolver.resolveBundle(bundle!);
			expect(resolution.status).toBe("success");

			// Each service should provide environment variables
			resolution.resolvedServices.forEach((service) => {
				expect(service.environmentVariables).toBeDefined();
				expect(service.environmentVariables.length).toBeGreaterThan(0);
			});

			// Check for common environment variables
			const allEnvVars = resolution.resolvedServices.flatMap(
				(s) => s.environmentVariables,
			);
			const envVarNames = allEnvVars.map((env) => env.name);

			expect(envVarNames.some((name) => name.includes("DATABASE"))).toBe(true);
			expect(envVarNames.some((name) => name.includes("AUTH"))).toBe(true);
			expect(envVarNames.some((name) => name.includes("PAYMENTS"))).toBe(true);
		});
	});

	describe("Bundle Validation and Quality Assurance", () => {
		it("should validate all prebuilt bundles have required metadata", async () => {
			const bundleNames = [
				"saas-starter",
				"saas-professional",
				"saas-complete",
				"marketing-site",
				"portfolio-site",
				"dashboard-app",
				"fullstack-app",
				"mobile-app",
				"rest-api",
				"enterprise-app",
				"norwegian-gov",
				"municipality-portal",
				"healthcare-management",
			];

			for (const name of bundleNames) {
				const bundle = await bundleResolver.loadBundleByName(name);
				expect(bundle).toBeDefined();

				// Required metadata
				expect(bundle!.id).toBeDefined();
				expect(bundle!.name).toBe(name);
				expect(bundle!.displayName).toBeDefined();
				expect(bundle!.description).toBeDefined();
				expect(bundle!.version).toBeDefined();
				expect(bundle!.type).toBeDefined();
				expect(bundle!.services).toBeDefined();
				expect(bundle!.services.length).toBeGreaterThan(0);
				expect(bundle!.deploymentTargets).toBeDefined();
				expect(bundle!.tags).toBeDefined();
				expect(bundle!.createdAt).toBeInstanceOf(Date);
				expect(bundle!.updatedAt).toBeInstanceOf(Date);
			}
		});

		it("should validate Norwegian bundles have compliance metadata", async () => {
			const norwegianBundles = [
				"norwegian-gov",
				"municipality-portal",
				"healthcare-management",
			];

			for (const name of norwegianBundles) {
				const bundle = await bundleResolver.loadBundleByName(name);
				expect(bundle).toBeDefined();

				// Compliance requirements
				expect(bundle!.compliance).toBeDefined();
				expect(bundle!.compliance!.length).toBeGreaterThan(0);
				expect(bundle!.compliance).toContain("gdpr");

				// Norwegian-specific tags
				expect(
					bundle!.tags.some(
						(tag) =>
							tag.includes("norwegian") ||
							tag.includes("government") ||
							tag.includes("healthcare"),
					),
				).toBe(true);
			}
		});

		it("should validate SaaS bundles have pricing information", async () => {
			const saasBundles = ["saas-starter", "saas-professional"];

			for (const name of saasBundles) {
				const bundle = await bundleResolver.loadBundleByName(name);
				expect(bundle).toBeDefined();

				// Pricing metadata
				expect(bundle!.pricing).toBeDefined();
				expect(bundle!.pricing!.tier).toBeDefined();
				expect(bundle!.pricing!.monthlyPrice).toBeDefined();
				expect(bundle!.pricing!.features).toBeDefined();
				expect(bundle!.pricing!.features.length).toBeGreaterThan(0);
			}
		});

		it("should validate bundle service priorities are consistent", async () => {
			const bundle = await bundleResolver.loadBundleByName("saas-professional");
			expect(bundle).toBeDefined();

			// Check priority consistency
			let previousPriority = 999;
			for (const service of bundle!.services) {
				expect(service.priority).toBeDefined();
				expect(service.priority!).toBeLessThanOrEqual(previousPriority);
				previousPriority = service.priority!;
			}
		});
	});
});

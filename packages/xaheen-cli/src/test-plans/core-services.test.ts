/**
 * Core Services Testing Suite
 *
 * Comprehensive tests for all prebuilt packages and core CLI services including:
 * - Service Registry
 * - Project Scaffolder
 * - Project Analyzer
 * - Project Validator
 * - Service Bundler
 * - Service Remover
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectAnalyzer } from "../services/analysis/project-analyzer";
import { BundleResolver } from "../services/bundles/bundle-resolver";
import { ServiceRegistry } from "../services/registry/service-registry";
import { ServiceRemover } from "../services/removal/service-remover";
import { ProjectScaffolder } from "../services/scaffolding/project-scaffolder";
import { ProjectValidator } from "../services/validation/project-validator";
import type {
	ProjectContext,
	ServiceBundle,
	ServiceConfiguration,
} from "../types/index.js";

describe("Core Services Testing Suite", () => {
	let testProjectPath: string;

	beforeEach(async () => {
		testProjectPath = path.join(
			process.cwd(),
			"test-output",
			`core-services-${Date.now()}`,
		);
		await fs.ensureDir(testProjectPath);
	});

	afterEach(async () => {
		await fs.remove(testProjectPath);
	});

	describe("Service Registry", () => {
		let serviceRegistry: ServiceRegistry;

		beforeEach(() => {
			serviceRegistry = new ServiceRegistry();
		});

		it("should initialize with default services", () => {
			const services = serviceRegistry.getAllServices();
			expect(services).toBeDefined();
			expect(Array.isArray(services)).toBe(true);
			expect(services.length).toBeGreaterThan(0);
		});

		it("should get frontend services correctly", () => {
			const frontendServices =
				serviceRegistry.getServicesByCategory("frontend");
			expect(frontendServices).toBeDefined();
			expect(Array.isArray(frontendServices)).toBe(true);

			// Should include Next.js, React, Svelte, etc.
			const serviceTypes = frontendServices.map((s) => s.provider);
			expect(serviceTypes).toContain("next");
			expect(serviceTypes).toContain("react");
		});

		it("should get backend services correctly", () => {
			const backendServices = serviceRegistry.getServicesByCategory("backend");
			expect(backendServices).toBeDefined();
			expect(Array.isArray(backendServices)).toBe(true);

			// Should include Express, Fastify, Django, etc.
			const serviceTypes = backendServices.map((s) => s.provider);
			expect(serviceTypes).toContain("express");
			expect(serviceTypes).toContain("fastify");
		});

		it("should get database services correctly", () => {
			const databaseServices =
				serviceRegistry.getServicesByCategory("database");
			expect(databaseServices).toBeDefined();
			expect(Array.isArray(databaseServices)).toBe(true);

			// Should include Prisma, Drizzle, etc.
			const serviceTypes = databaseServices.map((s) => s.provider);
			expect(serviceTypes).toContain("prisma");
			expect(serviceTypes).toContain("drizzle");
		});

		it("should get Norwegian integration services", () => {
			const integrationServices =
				serviceRegistry.getServicesByCategory("integrations");
			expect(integrationServices).toBeDefined();

			// Should include Norwegian-specific services
			const norwegianServices = integrationServices.filter(
				(s) =>
					s.serviceId.includes("altinn") ||
					s.serviceId.includes("bankid") ||
					s.serviceId.includes("vipps"),
			);
			expect(norwegianServices.length).toBeGreaterThan(0);
		});

		it("should register new service correctly", () => {
			const newService: ServiceConfiguration = {
				serviceId: "test-service",
				serviceType: "test",
				provider: "test-provider",
				required: false,
				configuration: {
					testOption: true,
				},
			};

			serviceRegistry.registerService(newService);

			const service = serviceRegistry.getService("test-service");
			expect(service).toBeDefined();
			expect(service?.serviceId).toBe("test-service");
			expect(service?.provider).toBe("test-provider");
		});

		it("should validate service compatibility", () => {
			// Test that certain services are compatible
			const nextJs = serviceRegistry.getService("frontend-next");
			const prisma = serviceRegistry.getService("database-prisma");
			const trpc = serviceRegistry.getService("api-trpc");

			expect(nextJs).toBeDefined();
			expect(prisma).toBeDefined();
			expect(trpc).toBeDefined();

			// These should be compatible (common full-stack combination)
			const compatibility = serviceRegistry.checkCompatibility([
				nextJs!,
				prisma!,
				trpc!,
			]);
			expect(compatibility.compatible).toBe(true);
		});

		it("should detect service conflicts", () => {
			// Test services that should conflict
			const express = serviceRegistry.getService("backend-express");
			const fastify = serviceRegistry.getService("backend-fastify");

			if (express && fastify) {
				const compatibility = serviceRegistry.checkCompatibility([
					express,
					fastify,
				]);
				expect(compatibility.compatible).toBe(false);
				expect(compatibility.conflicts).toBeDefined();
				expect(compatibility.conflicts!.length).toBeGreaterThan(0);
			}
		});
	});

	describe("Project Scaffolder", () => {
		let projectScaffolder: ProjectScaffolder;

		beforeEach(() => {
			projectScaffolder = new ProjectScaffolder();
		});

		it("should create basic Next.js project structure", async () => {
			const projectContext: ProjectContext = {
				projectName: "TestNextApp",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript", "tailwind"],
			};

			const result = await projectScaffolder.scaffoldProject(projectContext);

			expect(result.success).toBe(true);
			expect(result.createdFiles).toBeDefined();
			expect(result.createdFiles!.length).toBeGreaterThan(0);

			// Check that essential files were created
			expect(
				await fs.pathExists(path.join(testProjectPath, "package.json")),
			).toBe(true);
			expect(
				await fs.pathExists(path.join(testProjectPath, "next.config.js")),
			).toBe(true);
			expect(
				await fs.pathExists(path.join(testProjectPath, "tsconfig.json")),
			).toBe(true);
			expect(
				await fs.pathExists(path.join(testProjectPath, "tailwind.config.js")),
			).toBe(true);
		});

		it("should create Norwegian compliance project", async () => {
			const projectContext: ProjectContext = {
				projectName: "NorwegianApp",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript", "norwegian-compliance"],
				norwegian: {
					altinn: true,
					bankid: true,
					vipps: true,
					language: "nb",
				},
				compliance: {
					gdpr: true,
					wcag: "AAA",
				},
			};

			const result = await projectScaffolder.scaffoldProject(projectContext);

			expect(result.success).toBe(true);

			// Check Norwegian-specific files were created
			expect(result.createdFiles).toContain("src/lib/integrations/altinn.ts");
			expect(result.createdFiles).toContain("src/lib/integrations/bankid.ts");
			expect(result.createdFiles).toContain("src/lib/integrations/vipps.ts");

			// Check compliance components
			expect(result.createdFiles).toContain(
				"src/components/xala/XalaGdprBanner.tsx",
			);
			expect(result.createdFiles).toContain(
				"src/components/xala/XalaAccessibilityProvider.tsx",
			);
		});

		it("should create full-stack application with database", async () => {
			const projectContext: ProjectContext = {
				projectName: "FullStackApp",
				projectPath: testProjectPath,
				framework: "next",
				backend: "express",
				database: "prisma",
				api: "trpc",
				packageManager: "bun",
				features: ["typescript", "full-stack"],
			};

			const result = await projectScaffolder.scaffoldProject(projectContext);

			expect(result.success).toBe(true);

			// Check full-stack structure
			expect(result.createdFiles).toContain("package.json");
			expect(result.createdFiles).toContain("server/index.ts");
			expect(result.createdFiles).toContain("prisma/schema.prisma");
			expect(result.createdFiles).toContain("src/lib/trpc/client.ts");
			expect(result.createdFiles).toContain("src/lib/trpc/server.ts");
		});

		it("should handle scaffolding errors gracefully", async () => {
			const invalidContext: ProjectContext = {
				projectName: "",
				projectPath: "/invalid/path/that/does/not/exist",
				framework: "invalid-framework" as any,
				packageManager: "invalid-pm" as any,
				features: [],
			};

			const result = await projectScaffolder.scaffoldProject(invalidContext);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors!.length).toBeGreaterThan(0);
		});
	});

	describe("Project Analyzer", () => {
		let projectAnalyzer: ProjectAnalyzer;

		beforeEach(() => {
			projectAnalyzer = new ProjectAnalyzer();
		});

		it("should analyze Next.js project correctly", async () => {
			// Create a basic Next.js project structure
			await fs.ensureDir(path.join(testProjectPath, "src/app"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "test-app",
					dependencies: {
						next: "^14.0.0",
						react: "^18.0.0",
						typescript: "^5.0.0",
					},
				}),
			);
			await fs.writeFile(
				path.join(testProjectPath, "next.config.js"),
				"module.exports = {}",
			);
			await fs.writeFile(
				path.join(testProjectPath, "tsconfig.json"),
				JSON.stringify({
					compilerOptions: { target: "es5" },
				}),
			);

			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			expect(analysis.framework).toBe("next");
			expect(analysis.hasTypeScript).toBe(true);
			expect(analysis.packageManager).toBeDefined();
			expect(analysis.dependencies).toContain("next");
			expect(analysis.dependencies).toContain("react");
			expect(analysis.projectStructure).toBeDefined();
		});

		it("should detect Norwegian compliance features", async () => {
			// Create project with Norwegian integrations
			await fs.ensureDir(path.join(testProjectPath, "src/lib/integrations"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "norwegian-app",
					dependencies: {
						next: "^14.0.0",
						"altinn-js": "^1.0.0",
						"bankid-sdk": "^2.0.0",
						"vipps-api": "^3.0.0",
					},
				}),
			);

			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/altinn.ts"),
				"export const altinnConfig = {};",
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/bankid.ts"),
				"export const bankidConfig = {};",
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/vipps.ts"),
				"export const vippsConfig = {};",
			);

			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			expect(analysis.framework).toBe("next");
			expect(analysis.norwegianIntegrations).toBeDefined();
			expect(analysis.norwegianIntegrations!.altinn).toBe(true);
			expect(analysis.norwegianIntegrations!.bankid).toBe(true);
			expect(analysis.norwegianIntegrations!.vipps).toBe(true);
		});

		it("should detect database and API configurations", async () => {
			// Create project with Prisma and tRPC
			await fs.ensureDir(path.join(testProjectPath, "prisma"));
			await fs.ensureDir(path.join(testProjectPath, "src/lib/trpc"));

			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "api-app",
					dependencies: {
						next: "^14.0.0",
						prisma: "^5.0.0",
						"@prisma/client": "^5.0.0",
						"@trpc/server": "^10.0.0",
						"@trpc/client": "^10.0.0",
					},
				}),
			);

			await fs.writeFile(
				path.join(testProjectPath, "prisma/schema.prisma"),
				'generator client { provider = "prisma-client-js" }',
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/trpc/client.ts"),
				"export const trpc = {};",
			);

			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			expect(analysis.database).toBe("prisma");
			expect(analysis.api).toBe("trpc");
			expect(analysis.hasDatabase).toBe(true);
		});

		it("should detect accessibility and compliance features", async () => {
			// Create project with accessibility components
			await fs.ensureDir(path.join(testProjectPath, "src/components/xala"));

			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "accessible-app",
					dependencies: {
						next: "^14.0.0",
						"@axe-core/react": "^4.0.0",
						"react-aria": "^3.0.0",
					},
				}),
			);

			await fs.writeFile(
				path.join(
					testProjectPath,
					"src/components/xala/XalaAccessibilityProvider.tsx",
				),
				"export const XalaAccessibilityProvider = () => {};",
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/components/xala/XalaGdprBanner.tsx"),
				"export const XalaGdprBanner = () => {};",
			);

			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			expect(analysis.accessibility).toBeDefined();
			expect(analysis.accessibility!.wcag).toBeDefined();
			expect(analysis.compliance).toBeDefined();
			expect(analysis.compliance!.gdpr).toBe(true);
		});
	});

	describe("Project Validator", () => {
		let projectValidator: ProjectValidator;

		beforeEach(() => {
			projectValidator = new ProjectValidator();
		});

		it("should validate correct Next.js project", async () => {
			// Create valid Next.js project
			await fs.ensureDir(path.join(testProjectPath, "src/app"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "valid-app",
					dependencies: {
						next: "^14.0.0",
						react: "^18.0.0",
						"react-dom": "^18.0.0",
					},
				}),
			);
			await fs.writeFile(
				path.join(testProjectPath, "next.config.js"),
				"module.exports = {}",
			);

			const validation =
				await projectValidator.validateProject(testProjectPath);

			expect(validation.valid).toBe(true);
			expect(validation.errors).toHaveLength(0);
			expect(validation.warnings).toBeDefined();
		});

		it("should detect missing dependencies", async () => {
			// Create project with missing dependencies
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "incomplete-app",
					dependencies: {
						next: "^14.0.0",
						// Missing react and react-dom
					},
				}),
			);
			await fs.writeFile(
				path.join(testProjectPath, "next.config.js"),
				"module.exports = {}",
			);

			const validation =
				await projectValidator.validateProject(testProjectPath);

			expect(validation.valid).toBe(false);
			expect(validation.errors.length).toBeGreaterThan(0);
			expect(validation.errors.some((e) => e.includes("react"))).toBe(true);
		});

		it("should validate Norwegian compliance setup", async () => {
			// Create project with Norwegian integrations
			await fs.ensureDir(path.join(testProjectPath, "src/lib/integrations"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "norwegian-app",
					dependencies: {
						next: "^14.0.0",
						react: "^18.0.0",
						"react-dom": "^18.0.0",
					},
				}),
			);

			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/altinn.ts"),
				'export const altinnConfig = { apiKey: "test" };',
			);

			const validation = await projectValidator.validateProject(
				testProjectPath,
				{
					checkNorwegianCompliance: true,
				},
			);

			expect(validation.valid).toBe(true);
			expect(validation.norwegianCompliance).toBeDefined();
			expect(validation.norwegianCompliance!.altinn).toBe(true);
		});

		it("should validate accessibility compliance", async () => {
			// Create project with accessibility setup
			await fs.ensureDir(path.join(testProjectPath, "src/components"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "accessible-app",
					dependencies: {
						next: "^14.0.0",
						react: "^18.0.0",
						"react-dom": "^18.0.0",
						"@axe-core/react": "^4.0.0",
					},
				}),
			);

			const validation = await projectValidator.validateProject(
				testProjectPath,
				{
					checkAccessibility: true,
				},
			);

			expect(validation.valid).toBe(true);
			expect(validation.accessibility).toBeDefined();
			expect(validation.accessibility!.toolsInstalled).toBe(true);
		});

		it("should detect security vulnerabilities", async () => {
			// Create project with potentially vulnerable dependencies
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "vulnerable-app",
					dependencies: {
						next: "^13.0.0", // Older version
						react: "^17.0.0", // Older version
						lodash: "^4.17.15", // Known vulnerable version
					},
				}),
			);

			const validation = await projectValidator.validateProject(
				testProjectPath,
				{
					checkSecurity: true,
				},
			);

			expect(validation.security).toBeDefined();
			if (validation.security!.vulnerabilities.length > 0) {
				expect(
					validation.security!.vulnerabilities.some(
						(v) => v.package === "lodash" || v.severity === "high",
					),
				).toBe(true);
			}
		});
	});

	describe("Bundle Resolver", () => {
		let bundleResolver: BundleResolver;

		beforeEach(() => {
			bundleResolver = new BundleResolver();
		});

		it("should resolve Norwegian e-commerce bundle", () => {
			const bundle: ServiceBundle = {
				id: "norwegian-ecommerce",
				name: "Norwegian E-commerce Platform",
				description: "Complete e-commerce solution with Norwegian integrations",
				services: [
					"frontend-next",
					"backend-express",
					"database-prisma",
					"api-trpc",
					"integration-vipps",
					"integration-bankid",
					"integration-altinn",
					"compliance-gdpr",
				],
			};

			const resolved = bundleResolver.resolveBundle(bundle);

			expect(resolved.success).toBe(true);
			expect(resolved.services).toBeDefined();
			expect(resolved.services!.length).toBe(bundle.services.length);

			// Check that all services were resolved
			const serviceIds = resolved.services!.map((s) => s.serviceId);
			expect(serviceIds).toContain("frontend-next");
			expect(serviceIds).toContain("integration-vipps");
			expect(serviceIds).toContain("integration-bankid");
		});

		it("should resolve enterprise SaaS bundle", () => {
			const bundle: ServiceBundle = {
				id: "enterprise-saas",
				name: "Enterprise SaaS Platform",
				description: "Multi-tenant SaaS with enterprise features",
				services: [
					"frontend-next",
					"backend-fastify",
					"database-drizzle",
					"api-trpc",
					"auth-clerk",
					"monitoring-sentry",
					"analytics-posthog",
					"compliance-iso27001",
				],
			};

			const resolved = bundleResolver.resolveBundle(bundle);

			expect(resolved.success).toBe(true);
			expect(resolved.services).toBeDefined();
			expect(resolved.services!.length).toBe(bundle.services.length);

			// Check enterprise-specific services
			const serviceIds = resolved.services!.map((s) => s.serviceId);
			expect(serviceIds).toContain("auth-clerk");
			expect(serviceIds).toContain("monitoring-sentry");
			expect(serviceIds).toContain("compliance-iso27001");
		});

		it("should detect bundle conflicts", () => {
			const conflictingBundle: ServiceBundle = {
				id: "conflicting-bundle",
				name: "Conflicting Services Bundle",
				description: "Bundle with conflicting services",
				services: [
					"backend-express",
					"backend-fastify", // Conflict: multiple backend frameworks
					"database-prisma",
					"database-drizzle", // Conflict: multiple databases
				],
			};

			const resolved = bundleResolver.resolveBundle(conflictingBundle);

			expect(resolved.success).toBe(false);
			expect(resolved.conflicts).toBeDefined();
			expect(resolved.conflicts!.length).toBeGreaterThan(0);

			// Should detect backend and database conflicts
			const conflictTypes = resolved.conflicts!.map((c) => c.type);
			expect(conflictTypes).toContain("backend");
			expect(conflictTypes).toContain("database");
		});

		it("should resolve bundle dependencies automatically", () => {
			const bundle: ServiceBundle = {
				id: "minimal-bundle",
				name: "Minimal Bundle",
				description: "Minimal bundle that requires additional dependencies",
				services: [
					"api-trpc", // This should auto-resolve frontend and backend dependencies
				],
			};

			const resolved = bundleResolver.resolveBundle(bundle, {
				resolveDependencies: true,
			});

			expect(resolved.success).toBe(true);
			expect(resolved.services).toBeDefined();
			expect(resolved.services!.length).toBeGreaterThan(1);

			// Should have auto-resolved dependencies
			const serviceTypes = resolved.services!.map((s) => s.serviceType);
			expect(serviceTypes).toContain("frontend"); // tRPC needs frontend
			expect(serviceTypes).toContain("backend"); // tRPC needs backend
		});
	});

	describe("Service Remover", () => {
		let serviceRemover: ServiceRemover;

		beforeEach(() => {
			serviceRemover = new ServiceRemover();
		});

		it("should remove service files correctly", async () => {
			// Create a project with service files
			await fs.ensureDir(path.join(testProjectPath, "src/lib"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "test-app",
					dependencies: {
						next: "^14.0.0",
						"@trpc/server": "^10.0.0",
						"@trpc/client": "^10.0.0",
					},
				}),
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/trpc-client.ts"),
				"export const trpc = {};",
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/trpc-server.ts"),
				"export const server = {};",
			);

			const serviceToRemove: ServiceConfiguration = {
				serviceId: "api-trpc",
				serviceType: "api",
				provider: "trpc",
				required: false,
				configuration: {},
			};

			const removal = await serviceRemover.removeService(
				serviceToRemove,
				testProjectPath,
			);

			expect(removal.success).toBe(true);
			expect(removal.removedFiles).toBeDefined();
			expect(removal.removedFiles!.length).toBeGreaterThan(0);

			// Check files were removed
			expect(
				await fs.pathExists(
					path.join(testProjectPath, "src/lib/trpc-client.ts"),
				),
			).toBe(false);
			expect(
				await fs.pathExists(
					path.join(testProjectPath, "src/lib/trpc-server.ts"),
				),
			).toBe(false);

			// Check dependencies were removed from package.json
			const packageJson = await fs.readJson(
				path.join(testProjectPath, "package.json"),
			);
			expect(packageJson.dependencies).not.toHaveProperty("@trpc/server");
			expect(packageJson.dependencies).not.toHaveProperty("@trpc/client");
		});

		it("should handle Norwegian service removal", async () => {
			// Create project with Norwegian integrations
			await fs.ensureDir(path.join(testProjectPath, "src/lib/integrations"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "norwegian-app",
					dependencies: {
						next: "^14.0.0",
						"vipps-api": "^3.0.0",
						"bankid-sdk": "^2.0.0",
					},
				}),
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/vipps.ts"),
				"export const vippsConfig = {};",
			);
			await fs.writeFile(
				path.join(testProjectPath, "src/lib/integrations/bankid.ts"),
				"export const bankidConfig = {};",
			);

			const vippsService: ServiceConfiguration = {
				serviceId: "integration-vipps",
				serviceType: "integration",
				provider: "vipps",
				required: false,
				configuration: {},
			};

			const removal = await serviceRemover.removeService(
				vippsService,
				testProjectPath,
			);

			expect(removal.success).toBe(true);

			// Vipps should be removed, BankID should remain
			expect(
				await fs.pathExists(
					path.join(testProjectPath, "src/lib/integrations/vipps.ts"),
				),
			).toBe(false);
			expect(
				await fs.pathExists(
					path.join(testProjectPath, "src/lib/integrations/bankid.ts"),
				),
			).toBe(true);

			const packageJson = await fs.readJson(
				path.join(testProjectPath, "package.json"),
			);
			expect(packageJson.dependencies).not.toHaveProperty("vipps-api");
			expect(packageJson.dependencies).toHaveProperty("bankid-sdk"); // Should remain
		});

		it("should prevent removal of required services", async () => {
			const requiredService: ServiceConfiguration = {
				serviceId: "frontend-next",
				serviceType: "frontend",
				provider: "next",
				required: true, // Required service
				configuration: {},
			};

			const removal = await serviceRemover.removeService(
				requiredService,
				testProjectPath,
			);

			expect(removal.success).toBe(false);
			expect(removal.errors).toBeDefined();
			expect(removal.errors!.some((e) => e.includes("required"))).toBe(true);
		});

		it("should handle dependency cascades correctly", async () => {
			// Create project where removing one service affects others
			await fs.ensureDir(path.join(testProjectPath, "src/lib"));
			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "dependent-app",
					dependencies: {
						next: "^14.0.0",
						prisma: "^5.0.0",
						"@trpc/server": "^10.0.0",
					},
				}),
			);

			const databaseService: ServiceConfiguration = {
				serviceId: "database-prisma",
				serviceType: "database",
				provider: "prisma",
				required: false,
				configuration: {},
			};

			const removal = await serviceRemover.removeService(
				databaseService,
				testProjectPath,
				{ checkDependencies: true },
			);

			expect(removal.success).toBe(true);

			// Should warn about dependent services
			expect(removal.warnings).toBeDefined();
			expect(
				removal.warnings!.some(
					(w) => w.includes("dependent") || w.includes("cascade"),
				),
			).toBe(true);
		});
	});

	describe("Integration Tests - Core Services Working Together", () => {
		it("should create, analyze, validate, and modify project", async () => {
			// 1. Create project with scaffolder
			const projectScaffolder = new ProjectScaffolder();
			const projectContext: ProjectContext = {
				projectName: "IntegrationTest",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript", "tailwind"],
				norwegian: {
					vipps: true,
					language: "nb",
				},
			};

			const scaffoldResult =
				await projectScaffolder.scaffoldProject(projectContext);
			expect(scaffoldResult.success).toBe(true);

			// 2. Analyze the created project
			const projectAnalyzer = new ProjectAnalyzer();
			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			expect(analysis.framework).toBe("next");
			expect(analysis.hasTypeScript).toBe(true);
			expect(analysis.norwegianIntegrations?.vipps).toBe(true);

			// 3. Validate the project
			const projectValidator = new ProjectValidator();
			const validation =
				await projectValidator.validateProject(testProjectPath);

			expect(validation.valid).toBe(true);

			// 4. Add additional service
			const serviceRegistry = new ServiceRegistry();
			const trpcService = serviceRegistry.getService("api-trpc");
			expect(trpcService).toBeDefined();

			// 5. Remove a service
			const serviceRemover = new ServiceRemover();
			const vippsService = serviceRegistry.getService("integration-vipps");
			if (vippsService) {
				const removal = await serviceRemover.removeService(
					vippsService,
					testProjectPath,
				);
				expect(removal.success).toBe(true);
			}

			// 6. Re-analyze after changes
			const newAnalysis = await projectAnalyzer.analyzeProject(testProjectPath);
			expect(newAnalysis.norwegianIntegrations?.vipps).toBe(false);
		});

		it("should handle Norwegian e-commerce bundle end-to-end", async () => {
			// Test complete Norwegian e-commerce bundle workflow
			const bundleResolver = new BundleResolver();
			const norwegianBundle: ServiceBundle = {
				id: "norwegian-ecommerce-test",
				name: "Norwegian E-commerce Test",
				description: "Test bundle for Norwegian e-commerce",
				services: [
					"frontend-next",
					"backend-express",
					"database-prisma",
					"integration-vipps",
					"integration-bankid",
					"compliance-gdpr",
				],
			};

			// 1. Resolve bundle
			const resolved = bundleResolver.resolveBundle(norwegianBundle);
			expect(resolved.success).toBe(true);
			expect(resolved.services!.length).toBe(6);

			// 2. Create project with bundle services
			const projectScaffolder = new ProjectScaffolder();
			const bundleContext: ProjectContext = {
				projectName: "NorwegianEcommerce",
				projectPath: testProjectPath,
				framework: "next",
				backend: "express",
				database: "prisma",
				packageManager: "bun",
				norwegian: {
					vipps: true,
					bankid: true,
					language: "nb",
				},
				compliance: {
					gdpr: true,
				},
			};

			const scaffoldResult =
				await projectScaffolder.scaffoldProject(bundleContext);
			expect(scaffoldResult.success).toBe(true);

			// 3. Validate Norwegian compliance
			const projectValidator = new ProjectValidator();
			const validation = await projectValidator.validateProject(
				testProjectPath,
				{
					checkNorwegianCompliance: true,
				},
			);

			expect(validation.valid).toBe(true);
			expect(validation.norwegianCompliance?.vipps).toBe(true);
			expect(validation.norwegianCompliance?.bankid).toBe(true);
			expect(validation.compliance?.gdpr).toBe(true);
		});
	});

	describe("Performance Tests - Core Services", () => {
		it("should handle large project analysis efficiently", async () => {
			// Create a large project structure
			const largeDirs = [
				"src/components",
				"src/pages",
				"src/lib",
				"src/utils",
				"src/hooks",
			];
			for (const dir of largeDirs) {
				await fs.ensureDir(path.join(testProjectPath, dir));

				// Create multiple files in each directory
				for (let i = 0; i < 20; i++) {
					await fs.writeFile(
						path.join(testProjectPath, dir, `file${i}.ts`),
						`export const item${i} = {};`,
					);
				}
			}

			await fs.writeFile(
				path.join(testProjectPath, "package.json"),
				JSON.stringify({
					name: "large-project",
					dependencies: {
						next: "^14.0.0",
						react: "^18.0.0",
						// ... many dependencies
					},
				}),
			);

			const projectAnalyzer = new ProjectAnalyzer();
			const startTime = performance.now();

			const analysis = await projectAnalyzer.analyzeProject(testProjectPath);

			const endTime = performance.now();
			const analysisTime = endTime - startTime;

			expect(analysis.framework).toBe("next");
			expect(analysisTime).toBeLessThan(5000); // Should complete in < 5 seconds
		});

		it("should handle concurrent service operations", async () => {
			const serviceRegistry = new ServiceRegistry();
			const operations = [];

			// Perform multiple registry operations concurrently
			for (let i = 0; i < 100; i++) {
				operations.push(
					serviceRegistry.getServicesByCategory("frontend"),
					serviceRegistry.getServicesByCategory("backend"),
					serviceRegistry.getServicesByCategory("database"),
				);
			}

			const startTime = performance.now();
			const results = await Promise.all(operations);
			const endTime = performance.now();

			expect(results).toHaveLength(300);
			expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
		});
	});
});

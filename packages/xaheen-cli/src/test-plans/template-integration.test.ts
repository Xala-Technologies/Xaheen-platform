/**
 * Template Integration Testing Suite
 *
 * Tests the complete template rendering pipeline including service injection,
 * template combinations, and real-world application scenarios.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import * as ts from "typescript";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ServiceInjector } from "../services/injection/service-injector";
import { TemplateLoader } from "../services/templates/template-loader";
import { getServiceTemplates } from "../services/templates/template-registry";
import type {
	ProjectContext,
	ServiceConfiguration,
	ServiceTemplate,
} from "../types/index.js";

describe("Template Integration Tests", () => {
	let templateLoader: TemplateLoader;
	let serviceInjector: ServiceInjector;
	let testProjectPath: string;

	beforeEach(async () => {
		templateLoader = new TemplateLoader();
		serviceInjector = new ServiceInjector();
		testProjectPath = path.join(
			process.cwd(),
			"test-output",
			`integration-${Date.now()}`,
		);
		await fs.ensureDir(testProjectPath);
	});

	afterEach(async () => {
		// Clean up test files
		await fs.remove(testProjectPath);
	});

	describe("Next.js + Xala Component Integration", () => {
		const nextJsXalaContext: ProjectContext = {
			projectName: "NextXalaApp",
			projectPath: testProjectPath,
			framework: "next",
			packageManager: "bun",
			features: ["typescript", "tailwind", "eslint"],
			norwegian: {
				altinn: true,
				bankid: true,
				vipps: true,
				language: "nb",
			},
			compliance: {
				gdpr: true,
				wcag: "AAA",
				iso27001: true,
			},
			localization: {
				enabled: true,
				languages: ["nb", "en", "ar"],
				fallback: "en",
				rtl: true,
			},
		};

		it("should render complete Next.js project with Xala components", async () => {
			// Test rendering a complete Next.js setup with Xala components
			const templates = [
				"frontend/next/configs/package.json.hbs",
				"frontend/next/configs/next.config.ts.hbs",
				"frontend/next/configs/tailwind.config.ts.hbs",
				"frontend/next/components/layout.tsx.hbs",
				"frontend/next/components/page.tsx.hbs",
				"frontend/next/components/providers.tsx.hbs",
				"components/files/xala-advanced.hbs",
				"components/files/xala-display-norwegian.hbs",
				"components/files/xala-display-gdpr.hbs",
			];

			const results = new Map<string, string>();

			// Render all templates
			for (const templatePath of templates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsXalaContext,
				);
				results.set(templatePath, result);

				// Each template should render successfully
				expect(result).toBeTruthy();
				expect(result.length).toBeGreaterThan(0);
			}

			// Validate specific integrations
			const packageJson = JSON.parse(
				results.get("frontend/next/configs/package.json.hbs")!,
			);
			expect(packageJson.name).toBe("next-xala-app");
			expect(packageJson.dependencies).toHaveProperty("next");
			expect(packageJson.dependencies).toHaveProperty("react");

			// Check Next.js config includes i18n for Norwegian support
			const nextConfig = results.get(
				"frontend/next/configs/next.config.ts.hbs",
			)!;
			expect(nextConfig).toContain("i18n");
			expect(nextConfig).toContain("nb");
			expect(nextConfig).toContain("locales");

			// Check layout includes Xala components
			const layout = results.get("frontend/next/components/layout.tsx.hbs")!;
			expect(layout).toContain("Providers");
			expect(layout).toContain("children");
			expect(layout).toContain('lang="en"');

			// Check Xala components integrate properly
			const xalaAdvanced = results.get("components/files/xala-advanced.hbs")!;
			expect(xalaAdvanced).toContain("export");
			expect(xalaAdvanced).toMatch(/aria-\w+/);

			const xalaNorwegian = results.get(
				"components/files/xala-display-norwegian.hbs",
			)!;
			expect(xalaNorwegian).toContain("norwegian");
			expect(xalaNorwegian).toContain("nb");

			const xalaGdpr = results.get("components/files/xala-display-gdpr.hbs")!;
			expect(xalaGdpr).toContain("GDPR");
			expect(xalaGdpr).toContain("consent");
		});

		it("should generate TypeScript-compliant code across templates", async () => {
			const tsTemplates = [
				"frontend/next/components/layout.tsx.hbs",
				"frontend/next/components/providers.tsx.hbs",
				"frontend/next/files/middleware.ts.hbs",
				"components/files/xala-advanced.hbs",
				"components/files/xala-form-norwegian.hbs",
			];

			for (const templatePath of tsTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsXalaContext,
				);

				// Validate TypeScript syntax
				expect(() => {
					ts.createSourceFile(
						path.basename(templatePath, ".hbs"),
						result,
						ts.ScriptTarget.Latest,
						true,
					);
				}).not.toThrow();

				// Check for proper TypeScript patterns
				expect(result).toMatch(/interface \w+Props|type \w+Props/);
				expect(result).toMatch(/\): JSX\.Element/);
				expect(result).toContain("React.ReactNode");
			}
		});

		it("should render localization files correctly", async () => {
			const localizationTemplates = [
				"frontend/next/configs/nb.json.hbs",
				"frontend/next/configs/en.json.hbs",
				"frontend/next/configs/ar.json.hbs",
				"frontend/next/files/i18n.ts.hbs",
			];

			for (const templatePath of localizationTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					nextJsXalaContext,
				);

				if (templatePath.endsWith(".json.hbs")) {
					// Validate JSON syntax
					expect(() => JSON.parse(result)).not.toThrow();

					const translations = JSON.parse(result);
					expect(translations).toHaveProperty("common");
				} else {
					// Validate TypeScript syntax for i18n.ts
					expect(result).toContain("locales");
					expect(result).toContain("defaultLocale");
					expect(result).toContain("nb");
					expect(result).toContain("en");
					expect(result).toContain("ar");
				}
			}
		});
	});

	describe("Full-Stack Application Scenarios", () => {
		it("should handle Norwegian E-commerce Platform scenario", async () => {
			const ecommerceContext: ProjectContext = {
				projectName: "NorwayEcommerce",
				projectPath: testProjectPath,
				framework: "next",
				backend: "express",
				database: "prisma",
				auth: "nextauth",
				api: "trpc",
				packageManager: "bun",
				features: ["typescript", "tailwind"],
				norwegian: {
					altinn: true,
					bankid: true,
					vipps: true,
					language: "nb",
					region: "NO",
				},
				integrations: {
					payments: ["vipps", "stripe"],
					authentication: ["bankid"],
					government: ["altinn"],
				},
				compliance: {
					gdpr: true,
					wcag: "AAA",
				},
			};

			const fullStackTemplates = [
				// Frontend
				"frontend/next/configs/package.json.hbs",
				"frontend/next/components/layout.tsx.hbs",

				// Backend
				"backend/express/files/index.ts.hbs",

				// Database
				"database/prisma/files/schema.prisma.hbs",

				// API
				"api/trpc/files/trpc.ts.hbs",
				"api/trpc/files/context.ts.hbs",

				// Norwegian Components
				"components/files/xala-display-norwegian.hbs",
				"components/files/xala-form-norwegian.hbs",

				// Integrations
				"integrations/files/vipps-service.ts.hbs",
				"integrations/files/bankid-service.ts.hbs",
				"integrations/files/altinn-service.ts.hbs",
			];

			for (const templatePath of fullStackTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					ecommerceContext,
				);

				expect(result).toBeTruthy();
				expect(result.length).toBeGreaterThan(0);

				// Check for context-specific content
				if (templatePath.includes("express")) {
					expect(result).toContain("express");
					expect(result).toContain("app.listen");
					// Check for fixed template string syntax
					expect(result).toContain("🚀 Server running on port ${port}");
					expect(result).not.toContain("template string");
				}

				if (templatePath.includes("vipps")) {
					expect(result).toContain("vipps");
					expect(result).toContain("payment");
				}

				if (templatePath.includes("bankid")) {
					expect(result).toContain("bankid");
					expect(result).toContain("authentication");
				}

				if (templatePath.includes("norwegian")) {
					expect(result).toContain("nb");
					expect(result).toContain("norwegian");
				}
			}
		});

		it("should handle Enterprise SaaS Application scenario", async () => {
			const enterpriseContext: ProjectContext = {
				projectName: "EnterpriseSaaS",
				projectPath: testProjectPath,
				framework: "next",
				backend: "fastify",
				database: "drizzle",
				auth: "clerk",
				api: "trpc",
				packageManager: "bun",
				features: ["typescript", "tailwind", "monitoring"],
				enterprise: {
					sso: true,
					audit: true,
					monitoring: true,
					multiTenant: true,
				},
				compliance: {
					iso27001: true,
					gdpr: true,
				},
			};

			const enterpriseTemplates = [
				"frontend/next/configs/package.json.hbs",
				"backend/fastify/files/index.ts.hbs",
				"database/drizzle/configs/drizzle.config.ts.hbs",
				"api/trpc/files/trpc.ts.hbs",
				"components/files/xala-display-iso27001.hbs",
				"components/files/xala-display-gdpr.hbs",
			];

			for (const templatePath of enterpriseTemplates) {
				const result = await templateLoader.renderTemplate(
					templatePath,
					enterpriseContext,
				);

				expect(result).toBeTruthy();

				// Check enterprise-specific patterns
				if (templatePath.includes("fastify")) {
					expect(result).toContain("fastify");
				}

				if (templatePath.includes("drizzle")) {
					expect(result).toContain("drizzle");
					expect(result).toContain("database");
				}

				if (templatePath.includes("iso27001")) {
					expect(result).toContain("ISO27001");
					expect(result).toContain("security");
				}
			}
		});
	});

	describe("Service Integration Tests", () => {
		it("should integrate with service injection system", async () => {
			const service: ServiceConfiguration = {
				serviceId: "test-frontend",
				serviceType: "frontend",
				provider: "next",
				required: true,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "package.json",
						template: "frontend/next/configs/package.json.hbs",
						priority: 100,
					},
					{
						type: "file-create",
						target: "src/app/layout.tsx",
						template: "frontend/next/components/layout.tsx.hbs",
						priority: 90,
					},
				],
				envVariables: [
					{
						name: "NEXT_PUBLIC_APP_NAME",
						description: "Application name",
						required: true,
						type: "string",
						defaultValue: "{{projectName}}",
					},
				],
				postInjectionSteps: [
					{
						type: "command",
						command: "bun install",
						description: "Install dependencies",
					},
				],
			};

			const projectContext: ProjectContext = {
				projectName: "TestIntegration",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript"],
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");
			expect(result.createdFiles).toContain("package.json");
			expect(result.createdFiles).toContain("src/app/layout.tsx");
			expect(result.environmentVariables).toHaveLength(1);
			expect(result.postInstallSteps).toHaveLength(1);

			// Verify files were created correctly
			const packageJsonPath = path.join(testProjectPath, "package.json");
			const layoutPath = path.join(testProjectPath, "src/app/layout.tsx");

			expect(await fs.pathExists(packageJsonPath)).toBe(true);
			expect(await fs.pathExists(layoutPath)).toBe(true);

			// Verify content is correct
			const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
			const packageJson = JSON.parse(packageJsonContent);
			expect(packageJson.name).toBe("test-integration");

			const layoutContent = await fs.readFile(layoutPath, "utf-8");
			expect(layoutContent).toContain("TestIntegration");
			expect(layoutContent).toContain("export default function RootLayout");
		});

		it("should handle template registry integration", async () => {
			// Test that templates from the registry can be used
			const nextTemplates = getServiceTemplates("frontend", "next");
			expect(nextTemplates).toBeTruthy();
			expect(nextTemplates).toHaveProperty("package-json");
			expect(nextTemplates).toHaveProperty("layout");
			expect(nextTemplates).toHaveProperty("page");

			// Test rendering templates from registry
			const packageJsonTemplate = nextTemplates!["package-json"];
			const result = await templateLoader.renderTemplate(packageJsonTemplate, {
				projectName: "RegistryTest",
				framework: "next",
				packageManager: "bun",
				features: ["typescript"],
			} as ProjectContext);

			expect(result).toBeTruthy();
			expect(() => JSON.parse(result)).not.toThrow();
		});
	});

	describe("Template Combination Tests", () => {
		it("should render compatible template combinations", async () => {
			const context: ProjectContext = {
				projectName: "CombinationTest",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript", "tailwind"],
				api: "trpc",
				database: "prisma",
				auth: "nextauth",
			};

			// Test related template combinations
			const combinations = [
				// Next.js + tRPC
				[
					"frontend/next/configs/package.json.hbs",
					"api/trpc/files/trpc.ts.hbs",
				],

				// Next.js + Prisma
				[
					"frontend/next/configs/package.json.hbs",
					"database/prisma/files/schema.prisma.hbs",
				],

				// Next.js + Auth
				[
					"frontend/next/components/layout.tsx.hbs",
					"auth/components/sign-in.tsx.hbs",
				],

				// Norwegian components
				[
					"components/files/xala-display-norwegian.hbs",
					"components/files/xala-form-norwegian.hbs",
				],
			];

			for (const [template1, template2] of combinations) {
				const result1 = await templateLoader.renderTemplate(template1, context);
				const result2 = await templateLoader.renderTemplate(template2, context);

				expect(result1).toBeTruthy();
				expect(result2).toBeTruthy();

				// Check for compatibility markers
				if (template1.includes("package.json") && template2.includes("trpc")) {
					expect(result1).toContain("@trpc/");
				}

				if (
					template1.includes("package.json") &&
					template2.includes("prisma")
				) {
					expect(result1).toContain("prisma");
				}
			}
		});

		it("should handle conditional template rendering", async () => {
			const baseContext: ProjectContext = {
				projectName: "ConditionalTest",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: [],
			};

			const templatePath = "frontend/next/configs/package.json.hbs";

			// Test with TypeScript enabled
			const withTS = await templateLoader.renderTemplate(templatePath, {
				...baseContext,
				features: ["typescript"],
			});
			expect(withTS).toContain("@types/react");
			expect(withTS).toContain("typescript");

			// Test without TypeScript
			const withoutTS = await templateLoader.renderTemplate(templatePath, {
				...baseContext,
				features: [],
			});
			expect(withoutTS).not.toContain("@types/react");
			expect(withoutTS).not.toContain("typescript");

			// Test with different APIs
			const withTRPC = await templateLoader.renderTemplate(templatePath, {
				...baseContext,
				api: "trpc",
			});
			expect(withTRPC).toContain("@trpc/");

			const withGraphQL = await templateLoader.renderTemplate(templatePath, {
				...baseContext,
				api: "graphql",
			});
			expect(withGraphQL).toContain("graphql");
		});
	});

	describe("Performance Integration Tests", () => {
		it("should handle concurrent template rendering", async () => {
			const context: ProjectContext = {
				projectName: "ConcurrentTest",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript"],
			};

			const templates = [
				"frontend/next/configs/package.json.hbs",
				"frontend/next/configs/next.config.ts.hbs",
				"frontend/next/configs/tailwind.config.ts.hbs",
				"frontend/next/configs/tsconfig.json.hbs",
				"frontend/next/components/layout.tsx.hbs",
				"frontend/next/components/page.tsx.hbs",
				"frontend/next/components/providers.tsx.hbs",
				"components/files/xala-advanced.hbs",
				"components/files/xala-display-gdpr.hbs",
				"components/files/xala-display-wcag-aaa.hbs",
			];

			const startTime = performance.now();

			// Render all templates concurrently
			const results = await Promise.all(
				templates.map((template) =>
					templateLoader.renderTemplate(template, context),
				),
			);

			const endTime = performance.now();
			const totalTime = endTime - startTime;

			// All templates should render successfully
			expect(results).toHaveLength(templates.length);
			results.forEach((result) => {
				expect(result).toBeTruthy();
				expect(result.length).toBeGreaterThan(0);
			});

			// Should complete in reasonable time (< 5 seconds for 10 templates)
			expect(totalTime).toBeLessThan(5000);
		});

		it("should maintain template cache efficiency", async () => {
			const context: ProjectContext = {
				projectName: "CacheTest",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "bun",
				features: ["typescript"],
			};

			const templatePath = "frontend/next/configs/package.json.hbs";
			const iterations = 100;

			// First rendering (cold cache)
			const firstStart = performance.now();
			await templateLoader.renderTemplate(templatePath, context);
			const firstEnd = performance.now();
			const coldTime = firstEnd - firstStart;

			// Subsequent renderings (warm cache)
			const warmStart = performance.now();
			for (let i = 0; i < iterations; i++) {
				await templateLoader.renderTemplate(templatePath, context);
			}
			const warmEnd = performance.now();
			const avgWarmTime = (warmEnd - warmStart) / iterations;

			// Warm cache should be significantly faster
			expect(avgWarmTime).toBeLessThan(coldTime * 0.5);
			expect(avgWarmTime).toBeLessThan(10); // < 10ms per render
		});
	});
});

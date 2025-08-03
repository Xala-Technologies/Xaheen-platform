/**
 * Service Registry Tests
 *
 * Comprehensive tests for the ServiceRegistry implementation.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockProject } from "../../test/utils/test-helpers.js";
import type { ServiceTemplate } from "../../types/index.js";
import { ServiceRegistry } from "./service-registry.js";

describe("ServiceRegistry", () => {
	let serviceRegistry: ServiceRegistry;
	let mockProject: Awaited<ReturnType<typeof createMockProject>>;

	beforeEach(async () => {
		serviceRegistry = new ServiceRegistry();
		mockProject = await createMockProject();
	});

	afterEach(async () => {
		await mockProject.cleanup();
	});

	describe("initialization", () => {
		it("should initialize successfully", async () => {
			await expect(serviceRegistry.initialize()).resolves.not.toThrow();
		});

		it("should load built-in templates", async () => {
			await serviceRegistry.initialize();

			const authTemplates = await serviceRegistry.listTemplates("auth");
			expect(authTemplates).toHaveLength(1);
			expect(authTemplates[0].provider).toBe("better-auth");

			const dbTemplates = await serviceRegistry.listTemplates("database");
			expect(dbTemplates).toHaveLength(1);
			expect(dbTemplates[0].provider).toBe("postgresql");

			const paymentsTemplates = await serviceRegistry.listTemplates("payments");
			expect(paymentsTemplates).toHaveLength(1);
			expect(paymentsTemplates[0].provider).toBe("stripe");
		});

		it("should not initialize twice", async () => {
			await serviceRegistry.initialize();
			const spy = vi.spyOn(serviceRegistry as any, "loadServiceTemplates");

			await serviceRegistry.initialize();
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("getTemplate", () => {
		beforeEach(async () => {
			await serviceRegistry.initialize();
		});

		it("should return template by type and provider", async () => {
			const template = await serviceRegistry.getTemplate("auth", "better-auth");
			expect(template).toBeDefined();
			expect(template?.name).toBe("better-auth");
			expect(template?.type).toBe("auth");
			expect(template?.provider).toBe("better-auth");
		});

		it("should return null for non-existent template", async () => {
			const template = await serviceRegistry.getTemplate(
				"auth",
				"non-existent",
			);
			expect(template).toBeNull();
		});

		it("should return null for non-existent service type", async () => {
			const template = await serviceRegistry.getTemplate(
				"non-existent" as any,
				"provider",
			);
			expect(template).toBeNull();
		});
	});

	describe("listTemplates", () => {
		beforeEach(async () => {
			await serviceRegistry.initialize();
		});

		it("should list all templates when no type specified", async () => {
			const templates = await serviceRegistry.listTemplates();
			expect(templates.length).toBeGreaterThan(0);

			// Should include built-in templates
			const authTemplate = templates.find((t) => t.type === "auth");
			expect(authTemplate).toBeDefined();
		});

		it("should filter templates by type", async () => {
			const authTemplates = await serviceRegistry.listTemplates("auth");
			expect(authTemplates).toHaveLength(1);
			expect(authTemplates[0].type).toBe("auth");

			const dbTemplates = await serviceRegistry.listTemplates("database");
			expect(dbTemplates).toHaveLength(1);
			expect(dbTemplates[0].type).toBe("database");
		});

		it("should return empty array for unknown service type", async () => {
			const templates = await serviceRegistry.listTemplates("unknown" as any);
			expect(templates).toHaveLength(0);
		});
	});

	describe("registerTemplate", () => {
		beforeEach(async () => {
			await serviceRegistry.initialize();
		});

		it("should register valid template", async () => {
			const template: ServiceTemplate = {
				name: "test-service",
				type: "cache",
				provider: "test-provider",
				version: "1.0.0",
				description: "Test service for testing",
				injectionPoints: [],
				envVariables: [],
				dependencies: [],
				postInjectionSteps: [],
				frameworks: ["next"],
				databases: [],
				platforms: ["web"],
				tags: ["test"],
			};

			await expect(
				serviceRegistry.registerTemplate(template),
			).resolves.not.toThrow();

			const retrieved = await serviceRegistry.getTemplate(
				"cache",
				"test-provider",
			);
			expect(retrieved).toEqual(template);
		});

		it("should reject invalid template", async () => {
			const invalidTemplate = {
				name: "invalid",
				// Missing required fields
			} as ServiceTemplate;

			await expect(
				serviceRegistry.registerTemplate(invalidTemplate),
			).rejects.toThrow("Invalid template");
		});

		it("should overwrite existing template with same type and provider", async () => {
			const template1: ServiceTemplate = {
				name: "test-service-v1",
				type: "cache",
				provider: "test-provider",
				version: "1.0.0",
				description: "Version 1",
				injectionPoints: [],
				envVariables: [],
				dependencies: [],
				postInjectionSteps: [],
				frameworks: [],
				databases: [],
				platforms: ["web"],
				tags: [],
			};

			const template2: ServiceTemplate = {
				...template1,
				name: "test-service-v2",
				description: "Version 2",
			};

			await serviceRegistry.registerTemplate(template1);
			await serviceRegistry.registerTemplate(template2);

			const retrieved = await serviceRegistry.getTemplate(
				"cache",
				"test-provider",
			);
			expect(retrieved?.description).toBe("Version 2");
		});
	});

	describe("built-in templates validation", () => {
		beforeEach(async () => {
			await serviceRegistry.initialize();
		});

		it("should have valid auth template structure", async () => {
			const template = await serviceRegistry.getTemplate("auth", "better-auth");
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(2);
			expect(template?.envVariables).toHaveLength(2);
			expect(template?.dependencies).toHaveLength(1);
			expect(template?.frameworks).toContain("next");
			expect(template?.databases).toContain("postgresql");
		});

		it("should have valid database template structure", async () => {
			const template = await serviceRegistry.getTemplate(
				"database",
				"postgresql",
			);
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(3);
			expect(template?.envVariables).toHaveLength(1);
			expect(template?.postInjectionSteps).toHaveLength(3);
		});

		it("should have valid payments template structure", async () => {
			const template = await serviceRegistry.getTemplate("payments", "stripe");
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(2);
			expect(template?.envVariables).toHaveLength(3);
			expect(template?.frameworks).toContain("next");
		});

		it("should have valid email template structure", async () => {
			const template = await serviceRegistry.getTemplate("email", "resend");
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(2);
			expect(template?.envVariables).toHaveLength(2);
			expect(template?.frameworks).toContain("next");
		});

		it("should have valid analytics template structure", async () => {
			const template = await serviceRegistry.getTemplate(
				"analytics",
				"posthog",
			);
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(2);
			expect(template?.envVariables).toHaveLength(2);
			expect(template?.frameworks).toContain("next");
		});

		it("should have valid monitoring template structure", async () => {
			const template = await serviceRegistry.getTemplate(
				"monitoring",
				"sentry",
			);
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(4); // monitoring.ts + 2 config files + package.json
			expect(template?.envVariables).toHaveLength(4);
			expect(template?.frameworks).toContain("next");
		});

		it("should have valid cache template structure", async () => {
			const template = await serviceRegistry.getTemplate("cache", "redis");
			expect(template).toBeDefined();
			expect(template?.injectionPoints).toHaveLength(2);
			expect(template?.envVariables).toHaveLength(1);
			expect(template?.frameworks).toContain("next");
		});
	});

	describe("template injection points", () => {
		beforeEach(async () => {
			await serviceRegistry.initialize();
		});

		it("should have correct injection point types", async () => {
			const authTemplate = await serviceRegistry.getTemplate(
				"auth",
				"better-auth",
			);
			const injectionTypes = authTemplate?.injectionPoints.map((ip) => ip.type);

			expect(injectionTypes).toContain("file-create");
			expect(injectionTypes).toContain("json-merge");
		});

		it("should have valid target paths", async () => {
			const dbTemplate = await serviceRegistry.getTemplate(
				"database",
				"postgresql",
			);
			const targets = dbTemplate?.injectionPoints.map((ip) => ip.target);

			expect(targets).toContain("prisma/schema.prisma");
			expect(targets).toContain("src/lib/prisma.ts");
			expect(targets).toContain("package.json");
		});

		it("should have priorities set", async () => {
			const templates = await serviceRegistry.listTemplates();

			for (const template of templates) {
				for (const injectionPoint of template.injectionPoints) {
					expect(injectionPoint.priority).toBeTypeOf("number");
					expect(injectionPoint.priority || 50).toBeGreaterThan(0);
				}
			}
		});
	});
});

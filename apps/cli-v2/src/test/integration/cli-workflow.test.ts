/**
 * CLI Workflow Integration Tests
 *
 * End-to-end tests for complete CLI workflows.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer.js";
import { ServiceRegistry } from "../../services/registry/service-registry.js";
import { ServiceRemover } from "../../services/removal/service-remover.js";
import { ProjectValidator } from "../../services/validation/project-validator.js";
import { createMockProject } from "../utils/test-helpers.js";

describe("CLI Workflow Integration", () => {
	let registry: ServiceRegistry;
	let analyzer: ProjectAnalyzer;
	let validator: ProjectValidator;
	let remover: ServiceRemover;
	let mockProject: Awaited<ReturnType<typeof createMockProject>>;

	beforeEach(async () => {
		registry = new ServiceRegistry();
		analyzer = new ProjectAnalyzer();
		validator = new ProjectValidator(registry);
		remover = new ServiceRemover(registry);

		await registry.initialize();
	});

	afterEach(async () => {
		if (mockProject) {
			await mockProject.cleanup();
		}
	});

	describe("Project Creation and Analysis Workflow", () => {
		it("should analyze a newly created Next.js project", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "test-nextjs-app",
						version: "1.0.0",
						dependencies: {
							next: "^14.0.0",
							react: "^18.0.0",
							"react-dom": "^18.0.0",
						},
						devDependencies: {
							"@types/node": "^20.0.0",
							typescript: "^5.0.0",
						},
						scripts: {
							dev: "next dev",
							build: "next build",
							start: "next start",
						},
					},
					null,
					2,
				),
			});

			// Analyze the project
			const projectInfo = await analyzer.analyzeProject(mockProject.path);

			expect(projectInfo.isValid).toBe(true);
			expect(projectInfo.name).toBe("test-nextjs-app");
			expect(projectInfo.framework).toBe("next");
			expect(projectInfo.typescript).toBe(true);
			expect(projectInfo.packageManager).toBe("npm");
			expect(projectInfo.services).toHaveLength(0); // No services initially
		});

		it("should detect services after they are added", async () => {
			mockProject = await createMockProject({
				"src/lib/auth.ts": `
          import { betterAuth } from 'better-auth';
          export const auth = betterAuth({});
        `,
				"src/lib/prisma.ts": `
          import { PrismaClient } from '@prisma/client';
          export const prisma = new PrismaClient();
        `,
				"src/lib/stripe.ts": `
          import Stripe from 'stripe';
          export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        `,
				"prisma/schema.prisma": `
          datasource db {
            provider = "postgresql"
            url      = env("DATABASE_URL")
          }
        `,
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);

			expect(projectInfo.services).toContain("auth");
			expect(projectInfo.services).toContain("database");
			expect(projectInfo.services).toContain("payments");
			expect(projectInfo.database).toBe("postgresql");
		});
	});

	describe("Service Addition and Validation Workflow", () => {
		it("should validate a project with correctly installed services", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "test-app",
						dependencies: {
							next: "^14.0.0",
							react: "^18.0.0",
							"better-auth": "^1.0.0",
							"@prisma/client": "^5.0.0",
						},
					},
					null,
					2,
				),
				"src/lib/auth.ts": "// Auth implementation",
				"src/lib/prisma.ts": "// Prisma client",
				".env.example": "DATABASE_URL=\nBETTER_AUTH_SECRET=\nBETTER_AUTH_URL=",
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);

			const validationResult = await validator.validateProject(
				mockProject.path,
				projectInfo,
				{
					validateServices: true,
					validateDependencies: true,
					validateEnvironment: true,
					validateLinting: false,
					validateTypes: false,
					autoFix: false,
				},
			);

			expect(validationResult.isValid).toBe(true);
			expect(validationResult.errors).toHaveLength(0);
		});

		it("should detect missing service files and suggest fixes", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "incomplete-project",
						dependencies: {
							next: "^14.0.0",
							"better-auth": "^1.0.0", // Dependency exists but no implementation
						},
					},
					null,
					2,
				),
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);
			projectInfo.services = ["auth"]; // Simulate detected service

			const validationResult = await validator.validateProject(
				mockProject.path,
				projectInfo,
				{
					validateServices: true,
					validateDependencies: false,
					validateEnvironment: false,
					validateLinting: false,
					validateTypes: false,
					autoFix: false,
				},
			);

			expect(validationResult.isValid).toBe(false);
			expect(
				validationResult.errors.some((e) =>
					e.message.includes("Missing service file"),
				),
			).toBe(true);
		});
	});

	describe("Service Removal Workflow", () => {
		it("should safely remove a service without dependencies", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "test-app",
						dependencies: {
							next: "^14.0.0",
							"posthog-js": "^1.0.0",
							stripe: "^16.0.0",
						},
					},
					null,
					2,
				),
				"src/lib/analytics.ts": "// PostHog analytics",
				"src/lib/stripe.ts": "// Stripe payments",
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);

			// Analyze dependencies before removal
			const dependencyAnalysis = await remover.analyzeDependencies(
				["analytics"], // Remove analytics
				projectInfo.services,
				mockProject.path,
			);

			expect(dependencyAnalysis.blockers).toHaveLength(0); // Analytics has no dependents

			// Create removal plan
			const removalPlan = await remover.createRemovalPlan(
				["analytics"],
				mockProject.path,
				projectInfo,
				{ cleanup: true, keepConfig: false, force: false },
			);

			expect(removalPlan.filesToRemove).toContain("src/lib/analytics.ts");
			expect(removalPlan.dependenciesToRemove).toContain("posthog-js");

			// Execute removal
			const removalResult = await remover.executeRemoval(
				removalPlan,
				mockProject.path,
				{ backup: true, cleanup: true },
			);

			expect(removalResult.success).toBe(true);
			expect(removalResult.removedFiles).toContain("src/lib/analytics.ts");
			expect(removalResult.backupPath).toBeDefined();
		});

		it("should block removal of services with dependencies", async () => {
			mockProject = await createMockProject();

			const projectInfo = await analyzer.analyzeProject(mockProject.path);
			projectInfo.services = ["auth", "database"]; // Auth depends on database

			// Mock auth service dependency on database
			vi.spyOn(registry, "listTemplates").mockImplementation((serviceType) => {
				if (serviceType === "auth") {
					return Promise.resolve([
						{
							name: "better-auth",
							dependencies: [{ serviceType: "database", required: true }],
						} as any,
					]);
				}
				return Promise.resolve([]);
			});

			const dependencyAnalysis = await remover.analyzeDependencies(
				["database"], // Try to remove database
				projectInfo.services,
				mockProject.path,
			);

			expect(dependencyAnalysis.blockers).toHaveLength(1);
			expect(dependencyAnalysis.blockers[0].dependentService).toBe("auth");
			expect(dependencyAnalysis.blockers[0].requiredService).toBe("database");
		});
	});

	describe("Complete Project Lifecycle", () => {
		it("should handle full project lifecycle: create -> add -> validate -> remove", async () => {
			// 1. Start with basic Next.js project
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "lifecycle-test",
						dependencies: { next: "^14.0.0", react: "^18.0.0" },
					},
					null,
					2,
				),
			});

			let projectInfo = await analyzer.analyzeProject(mockProject.path);
			expect(projectInfo.services).toHaveLength(0);

			// 2. Simulate adding auth service
			await fs.writeFile(
				path.join(mockProject.path, "src/lib/auth.ts"),
				"// Better Auth implementation",
			);

			const packageJson = await fs.readJson(
				path.join(mockProject.path, "package.json"),
			);
			packageJson.dependencies["better-auth"] = "^1.0.0";
			await fs.writeJson(
				path.join(mockProject.path, "package.json"),
				packageJson,
				{ spaces: 2 },
			);

			projectInfo = await analyzer.analyzeProject(mockProject.path);
			expect(projectInfo.services).toContain("auth");

			// 3. Validate the project
			const validationResult = await validator.validateProject(
				mockProject.path,
				projectInfo,
				{
					validateServices: true,
					validateDependencies: true,
					validateEnvironment: false,
					validateLinting: false,
					validateTypes: false,
					autoFix: false,
				},
			);

			expect(validationResult.isValid).toBe(true);

			// 4. Remove the auth service
			const removalPlan = await remover.createRemovalPlan(
				["auth"],
				mockProject.path,
				projectInfo,
				{ cleanup: true, keepConfig: false, force: false },
			);

			const removalResult = await remover.executeRemoval(
				removalPlan,
				mockProject.path,
				{ backup: true, cleanup: true },
			);

			expect(removalResult.success).toBe(true);

			// 5. Verify service is removed
			projectInfo = await analyzer.analyzeProject(mockProject.path);
			expect(projectInfo.services).not.toContain("auth");

			const authFileExists = await fs.pathExists(
				path.join(mockProject.path, "src/lib/auth.ts"),
			);
			expect(authFileExists).toBe(false);
		});
	});

	describe("Error Handling and Recovery", () => {
		it("should handle corrupted project gracefully", async () => {
			mockProject = await createMockProject({
				"package.json": "invalid json content",
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);
			expect(projectInfo.isValid).toBe(false);

			// Validation should handle invalid projects
			const validationResult = await validator.validateProject(
				mockProject.path,
				projectInfo,
				{
					validateServices: true,
					validateDependencies: true,
					validateEnvironment: true,
					validateLinting: false,
					validateTypes: false,
					autoFix: false,
				},
			);

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.length).toBeGreaterThan(0);
		});

		it("should create backups before risky operations", async () => {
			mockProject = await createMockProject({
				"src/lib/important.ts": "// Critical business logic",
				"package.json": JSON.stringify(
					{
						name: "important-project",
						dependencies: { "critical-package": "^1.0.0" },
					},
					null,
					2,
				),
			});

			const projectInfo = await analyzer.analyzeProject(mockProject.path);

			const removalPlan = {
				servicesToRemove: ["test"],
				filesToRemove: ["src/lib/important.ts"],
				filesToModify: [],
				dependenciesToRemove: ["critical-package"],
				envVariablesToRemove: [],
				configUpdates: [],
			};

			const removalResult = await remover.executeRemoval(
				removalPlan,
				mockProject.path,
				{ backup: true, cleanup: false },
			);

			expect(removalResult.backupPath).toBeDefined();

			if (removalResult.backupPath) {
				const backupExists = await fs.pathExists(removalResult.backupPath);
				expect(backupExists).toBe(true);

				// Backup should contain the important file
				const backupFileExists = await fs.pathExists(
					path.join(removalResult.backupPath, "src/lib/important.ts"),
				);
				expect(backupFileExists).toBe(true);
			}
		});
	});
});

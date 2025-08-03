/**
 * Project Analyzer Tests
 *
 * Comprehensive tests for the ProjectAnalyzer implementation.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMockProject } from "../../test/utils/test-helpers.js";
import { ProjectAnalyzer } from "./project-analyzer.js";

describe("ProjectAnalyzer", () => {
	let analyzer: ProjectAnalyzer;
	let mockProject: Awaited<ReturnType<typeof createMockProject>>;

	beforeEach(async () => {
		analyzer = new ProjectAnalyzer();
	});

	afterEach(async () => {
		if (mockProject) {
			await mockProject.cleanup();
		}
	});

	describe("analyzeProject", () => {
		it("should detect Next.js project correctly", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "nextjs-project",
						dependencies: {
							next: "^14.0.0",
							react: "^18.0.0",
							"react-dom": "^18.0.0",
						},
					},
					null,
					2,
				),
				"next.config.js": "module.exports = {}",
			});

			const result = await analyzer.analyzeProject(mockProject.path);

			expect(result.isValid).toBe(true);
			expect(result.name).toBe("nextjs-project");
			expect(result.framework).toBe("next");
			expect(result.packageManager).toBe("npm");
			expect(result.typescript).toBe(true);
		});

		it("should detect package manager from lock files", async () => {
			// Test pnpm
			mockProject = await createMockProject({
				"pnpm-lock.yaml": "# pnpm lock file",
			});

			let result = await analyzer.analyzeProject(mockProject.path);
			expect(result.packageManager).toBe("pnpm");

			await mockProject.cleanup();

			// Test yarn
			mockProject = await createMockProject({
				"yarn.lock": "# yarn lock file",
			});

			result = await analyzer.analyzeProject(mockProject.path);
			expect(result.packageManager).toBe("yarn");

			await mockProject.cleanup();

			// Test bun
			mockProject = await createMockProject({
				"bun.lockb": "bun lock file",
			});

			result = await analyzer.analyzeProject(mockProject.path);
			expect(result.packageManager).toBe("bun");
		});

		it("should detect database from dependencies", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "db-project",
						dependencies: {
							"@prisma/client": "^5.0.0",
							prisma: "^5.0.0",
						},
					},
					null,
					2,
				),
				"prisma/schema.prisma": `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`,
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.database).toBe("postgresql");
		});

		it("should detect services from file structure", async () => {
			mockProject = await createMockProject({
				"src/lib/auth.ts": "export const auth = {}",
				"src/lib/stripe.ts": "export const stripe = {}",
				"src/lib/email.ts": "export const email = {}",
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.services).toContain("auth");
			expect(result.services).toContain("payments");
			expect(result.services).toContain("email");
		});

		it("should detect git repository", async () => {
			mockProject = await createMockProject({
				".git/config": "[core]\nrepositoryformatversion = 0",
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.git).toBe(true);
		});

		it("should handle invalid project gracefully", async () => {
			mockProject = await createMockProject({
				"invalid.txt": "not a project file",
			});

			// Remove package.json to make it invalid
			await fs.remove(path.join(mockProject.path, "package.json"));

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.isValid).toBe(false);
		});

		it("should detect React project without Next.js", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "react-project",
						dependencies: {
							react: "^18.0.0",
							"react-dom": "^18.0.0",
							"react-scripts": "^5.0.0",
						},
					},
					null,
					2,
				),
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.framework).toBe("react");
		});

		it("should detect Nuxt project", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "nuxt-project",
						dependencies: {
							nuxt: "^3.0.0",
							vue: "^3.0.0",
						},
					},
					null,
					2,
				),
				"nuxt.config.ts": "export default defineNuxtConfig({})",
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.framework).toBe("nuxt");
		});

		it("should detect SvelteKit project", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "sveltekit-project",
						dependencies: {
							"@sveltejs/kit": "^2.0.0",
							svelte: "^4.0.0",
						},
					},
					null,
					2,
				),
				"svelte.config.js": "export default {}",
			});

			const result = await analyzer.analyzeProject(mockProject.path);
			expect(result.framework).toBe("sveltekit");
		});

		it("should detect TypeScript correctly", async () => {
			// TypeScript project
			mockProject = await createMockProject({
				"tsconfig.json": JSON.stringify(
					{
						compilerOptions: {
							target: "es5",
						},
					},
					null,
					2,
				),
			});

			let result = await analyzer.analyzeProject(mockProject.path);
			expect(result.typescript).toBe(true);

			await mockProject.cleanup();

			// JavaScript project
			mockProject = await createMockProject({});
			await fs.remove(path.join(mockProject.path, "tsconfig.json"));

			result = await analyzer.analyzeProject(mockProject.path);
			expect(result.typescript).toBe(false);
		});

		it("should extract project metadata", async () => {
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "test-project",
						version: "2.0.0",
						description: "A test project",
						scripts: {
							dev: "next dev",
							build: "next build",
							test: "jest",
						},
						dependencies: {
							next: "^14.0.0",
							react: "^18.0.0",
						},
						devDependencies: {
							"@types/node": "^20.0.0",
							typescript: "^5.0.0",
						},
					},
					null,
					2,
				),
			});

			const result = await analyzer.analyzeProject(mockProject.path);

			expect(result.name).toBe("test-project");
			expect(result.dependencies).toHaveProperty("next");
			expect(result.dependencies).toHaveProperty("react");
			expect(result.devDependencies).toHaveProperty("@types/node");
			expect(result.devDependencies).toHaveProperty("typescript");
			expect(result.scripts).toHaveProperty("dev");
			expect(result.scripts).toHaveProperty("build");
		});

		it("should detect backend framework from dependencies", async () => {
			// Express project
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "express-project",
						dependencies: {
							express: "^4.0.0",
						},
					},
					null,
					2,
				),
			});

			let result = await analyzer.analyzeProject(mockProject.path);
			expect(result.backend).toBe("express");

			await mockProject.cleanup();

			// Hono project
			mockProject = await createMockProject({
				"package.json": JSON.stringify(
					{
						name: "hono-project",
						dependencies: {
							hono: "^4.0.0",
						},
					},
					null,
					2,
				),
			});

			result = await analyzer.analyzeProject(mockProject.path);
			expect(result.backend).toBe("hono");
		});

		it("should handle projects with complex service detection", async () => {
			mockProject = await createMockProject({
				"src/lib/auth.ts": "// Authentication logic",
				"src/lib/database.ts": "// Database connection",
				"src/lib/prisma.ts": "// Prisma client",
				"src/lib/stripe.ts": "// Stripe integration",
				"src/lib/email.ts": "// Email service",
				"src/lib/analytics.ts": "// Analytics tracking",
				"src/lib/monitoring.ts": "// Error monitoring",
				"src/lib/cache.ts": "// Cache implementation",
			});

			const result = await analyzer.analyzeProject(mockProject.path);

			expect(result.services).toContain("auth");
			expect(result.services).toContain("database");
			expect(result.services).toContain("payments");
			expect(result.services).toContain("email");
			expect(result.services).toContain("analytics");
			expect(result.services).toContain("monitoring");
			expect(result.services).toContain("cache");
		});
	});
});

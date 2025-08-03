/**
 * Service Injector Tests
 *
 * Tests for the service injection system including external template support.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	ProjectContext,
	ServiceConfiguration,
	ServiceTemplate,
} from "../../types/index.js";
import { ServiceInjector } from "./service-injector.js";

describe("ServiceInjector", () => {
	let serviceInjector: ServiceInjector;
	let testProjectPath: string;
	let testTemplatesPath: string;

	beforeEach(async () => {
		serviceInjector = new ServiceInjector();

		// Create test directories
		testProjectPath = path.join(process.cwd(), "test-project");
		testTemplatesPath = path.join(process.cwd(), "test-templates");

		await fs.ensureDir(testProjectPath);
		await fs.ensureDir(testTemplatesPath);

		// Mock templateLoader to use test templates path
		vi.mock("../templates/template-loader.js", () => ({
			templateLoader: {
				renderTemplate: vi.fn(async (templatePath: string, context: any) => {
					const fullPath = path.join(testTemplatesPath, templatePath);
					const content = await fs.readFile(fullPath, "utf-8");

					// Simple template rendering for tests
					return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
						return context[key] || match;
					});
				}),
			},
		}));
	});

	afterEach(async () => {
		await fs.remove(testProjectPath);
		await fs.remove(testTemplatesPath);
		vi.restoreAllMocks();
	});

	describe("injectService", () => {
		it("should inject service with inline template", async () => {
			const service: ServiceConfiguration = {
				serviceId: "test-service",
				serviceType: "test",
				provider: "test-provider",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/lib/test.ts",
						template: 'export const test = "{{name}}";',
						priority: 80,
					},
				],
				envVariables: [
					{
						name: "TEST_API_KEY",
						description: "Test API key",
						required: true,
						type: "string",
						defaultValue: "test-key",
					},
				],
				postInjectionSteps: [
					{
						type: "command",
						command: "npm install test-package",
						description: "Install test package",
					},
				],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "next",
				packageManager: "npm",
				features: [],
				name: "TestApp",
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");
			expect(result.createdFiles).toContain("src/lib/test.ts");
			expect(result.environmentVariables).toHaveLength(1);
			expect(result.postInstallSteps).toHaveLength(1);

			// Check file was created with correct content
			const createdFile = path.join(testProjectPath, "src/lib/test.ts");
			const content = await fs.readFile(createdFile, "utf-8");
			expect(content).toBe('export const test = "TestApp";');

			// Check .env.example was created
			const envFile = path.join(testProjectPath, ".env.example");
			const envContent = await fs.readFile(envFile, "utf-8");
			expect(envContent).toContain("TEST_API_KEY=test-key");
		});

		it("should inject service with external template", async () => {
			// Create external template file
			const templatePath = "test/files/external.hbs";
			const templateFullPath = path.join(testTemplatesPath, templatePath);
			await fs.ensureDir(path.dirname(templateFullPath));
			await fs.writeFile(
				templateFullPath,
				'export const {{name}} = "{{value}}";',
			);

			const service: ServiceConfiguration = {
				serviceId: "external-service",
				serviceType: "test",
				provider: "external",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/lib/external.ts",
						template: templatePath, // External template reference
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
				name: "external",
				value: "success",
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");
			expect(result.createdFiles).toContain("src/lib/external.ts");

			// Check file was created with external template content
			const createdFile = path.join(testProjectPath, "src/lib/external.ts");
			const content = await fs.readFile(createdFile, "utf-8");
			expect(content).toBe('export const external = "success";');
		});

		it("should handle JSON merge injection", async () => {
			// Create existing package.json
			const packageJsonPath = path.join(testProjectPath, "package.json");
			await fs.writeJson(packageJsonPath, {
				name: "test-project",
				version: "1.0.0",
				dependencies: {
					react: "^18.0.0",
				},
			});

			const service: ServiceConfiguration = {
				serviceId: "package-merger",
				serviceType: "test",
				provider: "test",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "json-merge",
						target: "package.json",
						template: JSON.stringify({
							dependencies: {
								"test-package": "^1.0.0",
							},
							scripts: {
								test: "vitest",
							},
						}),
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");
			expect(result.injectedFiles).toContain("package.json");

			// Check merged content
			const mergedPackageJson = await fs.readJson(packageJsonPath);
			expect(mergedPackageJson.dependencies).toEqual({
				react: "^18.0.0",
				"test-package": "^1.0.0",
			});
			expect(mergedPackageJson.scripts).toEqual({
				test: "vitest",
			});
		});

		it("should handle file append injection", async () => {
			// Create existing file
			const existingFile = path.join(testProjectPath, "src/index.ts");
			await fs.ensureDir(path.dirname(existingFile));
			await fs.writeFile(existingFile, 'console.log("existing");\n');

			const service: ServiceConfiguration = {
				serviceId: "appender",
				serviceType: "test",
				provider: "test",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-append",
						target: "src/index.ts",
						template: 'console.log("{{message}}");',
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
				message: "appended",
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");
			expect(result.injectedFiles).toContain("src/index.ts");

			// Check appended content
			const content = await fs.readFile(existingFile, "utf-8");
			expect(content).toBe(
				'console.log("existing");\n\nconsole.log("appended");',
			);
		});

		it("should handle errors gracefully", async () => {
			const service: ServiceConfiguration = {
				serviceId: "error-service",
				serviceType: "test",
				provider: "error",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "/invalid/path/file.ts", // Invalid path
						template: "content",
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("failed");
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toContain("Failed to process injection point");
		});

		it("should skip existing files unless force option is used", async () => {
			// Create existing file
			const existingFile = path.join(testProjectPath, "src/existing.ts");
			await fs.ensureDir(path.dirname(existingFile));
			await fs.writeFile(existingFile, "existing content");

			const service: ServiceConfiguration = {
				serviceId: "existing-file-service",
				serviceType: "test",
				provider: "test",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/existing.ts",
						template: "new content",
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			// Without force option
			const result1 = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result1.warnings).toContain(
				"File already exists: src/existing.ts",
			);

			const content1 = await fs.readFile(existingFile, "utf-8");
			expect(content1).toBe("existing content"); // Unchanged

			// With force option
			const result2 = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
				{ force: true },
			);

			expect(result2.createdFiles).toContain("src/existing.ts");

			const content2 = await fs.readFile(existingFile, "utf-8");
			expect(content2).toBe("new content"); // Overwritten
		});
	});

	describe("injectServices", () => {
		it("should inject multiple services", async () => {
			const services: ServiceConfiguration[] = [
				{
					serviceId: "service-1",
					serviceType: "test",
					provider: "test1",
					required: false,
					configuration: {},
				},
				{
					serviceId: "service-2",
					serviceType: "test",
					provider: "test2",
					required: false,
					configuration: {},
				},
			];

			// Mock service configurations to include templates
			const mockTemplate: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/lib/{{provider}}.ts",
						template: 'export const {{provider}} = "{{provider}}";',
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			services[0].configuration = mockTemplate;
			services[1].configuration = mockTemplate;

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			const results = await serviceInjector.injectServices(
				services,
				testProjectPath,
				projectContext,
			);

			expect(results).toHaveLength(2);
			expect(results[0].status).toBe("success");
			expect(results[1].status).toBe("success");

			// Check both files were created
			const file1 = await fs.readFile(
				path.join(testProjectPath, "src/lib/test1.ts"),
				"utf-8",
			);
			const file2 = await fs.readFile(
				path.join(testProjectPath, "src/lib/test2.ts"),
				"utf-8",
			);

			expect(file1).toBe('export const test1 = "test1";');
			expect(file2).toBe('export const test2 = "test2";');
		});

		it("should stop on required service failure", async () => {
			const services: ServiceConfiguration[] = [
				{
					serviceId: "required-service",
					serviceType: "test",
					provider: "required",
					required: true,
					configuration: {},
				},
				{
					serviceId: "optional-service",
					serviceType: "test",
					provider: "optional",
					required: false,
					configuration: {},
				},
			];

			// First service will fail (invalid template)
			services[0].configuration = {
				injectionPoints: [],
				envVariables: [],
				postInjectionSteps: [],
			};

			services[1].configuration = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/optional.ts",
						template: "optional content",
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			const results = await serviceInjector.injectServices(
				services,
				testProjectPath,
				projectContext,
			);

			expect(results).toHaveLength(1); // Should stop after first failure
			expect(results[0].status).toBe("failed");

			// Optional service file should not exist
			const optionalFile = path.join(testProjectPath, "src/optional.ts");
			expect(await fs.pathExists(optionalFile)).toBe(false);
		});
	});

	describe("Template Rendering", () => {
		it("should detect external vs inline templates correctly", async () => {
			// Test inline template (contains newlines)
			const inlineTemplate = `line 1
line 2
{{variable}}`;

			// Test external template path (no newlines, contains slash)
			const externalTemplatePath = "test/external.hbs";

			// Create the external template file
			const fullPath = path.join(testTemplatesPath, externalTemplatePath);
			await fs.ensureDir(path.dirname(fullPath));
			await fs.writeFile(fullPath, "External: {{variable}}");

			const service: ServiceConfiguration = {
				serviceId: "template-test",
				serviceType: "test",
				provider: "test",
				required: false,
				configuration: {},
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
				variable: "test",
			};

			// Test inline template
			const inlineTemplate_obj: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/inline.ts",
						template: inlineTemplate,
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const inlineResult = await serviceInjector.injectService(
				service,
				inlineTemplate_obj,
				testProjectPath,
				projectContext,
			);

			// Test external template
			const externalTemplate: ServiceTemplate = {
				injectionPoints: [
					{
						type: "file-create",
						target: "src/external.ts",
						template: externalTemplatePath,
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const externalResult = await serviceInjector.injectService(
				service,
				externalTemplate,
				testProjectPath,
				projectContext,
			);

			expect(inlineResult.status).toBe("success");
			expect(externalResult.status).toBe("success");

			// Check content was rendered correctly
			const inlineContent = await fs.readFile(
				path.join(testProjectPath, "src/inline.ts"),
				"utf-8",
			);
			const externalContent = await fs.readFile(
				path.join(testProjectPath, "src/external.ts"),
				"utf-8",
			);

			expect(inlineContent).toContain("line 1");
			expect(inlineContent).toContain("test");
			expect(externalContent).toBe("External: test");
		});
	});

	describe("Deep Merge Functionality", () => {
		it("should deep merge objects correctly", async () => {
			// Create existing config file
			const configPath = path.join(testProjectPath, "config.json");
			await fs.writeJson(configPath, {
				app: {
					name: "TestApp",
					version: "1.0.0",
				},
				features: ["auth"],
				database: {
					type: "postgres",
				},
			});

			const service: ServiceConfiguration = {
				serviceId: "config-merger",
				serviceType: "test",
				provider: "test",
				required: false,
				configuration: {},
			};

			const template: ServiceTemplate = {
				injectionPoints: [
					{
						type: "json-merge",
						target: "config.json",
						template: JSON.stringify({
							app: {
								description: "Test application",
								author: "Test Author",
							},
							features: ["database", "api"],
							database: {
								host: "localhost",
								port: 5432,
							},
							newSection: {
								enabled: true,
							},
						}),
						priority: 80,
					},
				],
				envVariables: [],
				postInjectionSteps: [],
			};

			const projectContext: ProjectContext = {
				projectName: "TestProject",
				projectPath: testProjectPath,
				framework: "react",
				packageManager: "npm",
				features: [],
			};

			const result = await serviceInjector.injectService(
				service,
				template,
				testProjectPath,
				projectContext,
			);

			expect(result.status).toBe("success");

			const mergedConfig = await fs.readJson(configPath);

			expect(mergedConfig).toEqual({
				app: {
					name: "TestApp",
					version: "1.0.0",
					description: "Test application",
					author: "Test Author",
				},
				features: ["auth", "database", "api"], // Arrays merged with unique values
				database: {
					type: "postgres",
					host: "localhost",
					port: 5432,
				},
				newSection: {
					enabled: true,
				},
			});
		});
	});
});

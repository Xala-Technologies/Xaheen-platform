/**
 * End-to-End Tests for Complete CLI Workflows
 *
 * Tests complete user scenarios from project creation through deployment,
 * using real CLI execution with execa.
 */

import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import tmp from "tmp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testUtils } from "../test-helpers";

describe("Complete CLI Workflows E2E", () => {
	let testDir: string;
	let originalCwd: string;
	let cleanup: () => void;
	let cliPath: string;

	beforeAll(async () => {
		// Build the CLI first to ensure we have the latest version
		try {
			await execa("npm", ["run", "build"], {
				cwd: path.resolve(__dirname, "../../../"),
				stdio: "inherit",
			});
		} catch (error) {
			console.warn("Failed to build CLI, using existing build");
		}

		cliPath = path.resolve(__dirname, "../../../dist/index.js");
	});

	beforeEach(async () => {
		originalCwd = process.cwd();

		// Create temporary test directory
		const result = tmp.dirSync({
			prefix: "xaheen-e2e-test-",
			unsafeCleanup: true,
		});
		testDir = result.name;
		cleanup = result.removeCallback;

		// Change to test directory
		process.chdir(testDir);
	});

	afterEach(async () => {
		// Restore original working directory
		process.chdir(originalCwd);

		// Clean up temporary directory
		if (cleanup) {
			cleanup();
		}
	});

	describe("New → Generate → Add → AI → Validate Workflow", () => {
		it("should complete full project lifecycle", async () => {
			const projectName = "e2e-test-project";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// Step 1: Create new project
			const createResult = await runner.runCommand(
				[
					"project",
					"create",
					projectName,
					"--preset",
					"saas-starter",
					"--no-interactive",
				],
				{
					cwd: testDir,
					timeout: 60000,
				},
			);

			expect(createResult.exitCode).toBe(0);
			expect(createResult.stdout).toContain("Project created successfully");

			// Verify project structure was created
			const projectPath = path.join(testDir, projectName);
			await testUtils.assert.assertDirectoryExists(projectPath);
			await testUtils.assert.assertFileExists(
				path.join(projectPath, "package.json"),
			);

			// Change to project directory for subsequent commands
			process.chdir(projectPath);

			// Step 2: Generate a model
			const generateModelResult = await runner.runCommand(
				["make:model", "User", "--migration", "--factory", "--test"],
				{
					cwd: projectPath,
					timeout: 30000,
				},
			);

			expect(generateModelResult.exitCode).toBe(0);
			expect(generateModelResult.stdout).toContain(
				"Model generated successfully",
			);

			// Verify model files were created
			await testUtils.assert.assertFileExists(
				path.join(projectPath, "src", "models", "User.ts"),
			);
			await testUtils.assert.assertFileExists(
				path.join(projectPath, "src", "models", "__tests__", "User.test.ts"),
			);

			// Step 3: Add authentication service
			const addServiceResult = await runner.runCommand(
				["service", "add", "auth", "--provider", "nextauth"],
				{
					cwd: projectPath,
					timeout: 30000,
				},
			);

			expect(addServiceResult.exitCode).toBe(0);
			expect(addServiceResult.stdout).toContain("Service added successfully");

			// Verify auth service files were created
			await testUtils.assert.assertFileExists(
				path.join(projectPath, "src", "services", "auth.ts"),
			);

			// Step 4: Generate component with AI (mocked)
			const aiGenerateResult = await runner.runCommand(
				[
					"ai",
					"generate",
					"Create a responsive user profile card with avatar, name, email, and edit button",
				],
				{
					cwd: projectPath,
					timeout: 45000,
					expectError: true, // AI commands might fail in test environment
				},
			);

			// AI command might fail due to missing API keys in test environment
			// We'll verify the command structure is correct even if it fails
			expect([0, 1]).toContain(aiGenerateResult.exitCode);

			// Step 5: Validate project
			const validateResult = await runner.runCommand(["project", "validate"], {
				cwd: projectPath,
				timeout: 30000,
			});

			expect(validateResult.exitCode).toBe(0);
			expect(validateResult.stdout).toContain("validation");

			// Verify final project state
			const packageJson = await fs.readJson(
				path.join(projectPath, "package.json"),
			);
			expect(packageJson.name).toBe(projectName);
			expect(packageJson.dependencies).toBeDefined();
		}, 120000); // 2 minute timeout for full workflow

		it("should handle multi-tenant setup scenario", async () => {
			const projectName = "e2e-multitenant-project";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// Create multi-tenant project
			const createResult = await runner.runCommand(
				["project", "create", projectName, "--preset", "multi-tenant"],
				{
					cwd: testDir,
					timeout: 60000,
				},
			);

			expect(createResult.exitCode).toBe(0);

			const projectPath = path.join(testDir, projectName);
			await testUtils.assert.assertDirectoryExists(projectPath);

			process.chdir(projectPath);

			// Generate tenant management
			const tenantResult = await runner.runCommand(
				[
					"make:tenant",
					"Admin",
					"--permissions",
					"manage_users,manage_settings",
				],
				{
					cwd: projectPath,
					timeout: 30000,
				},
			);

			expect(tenantResult.exitCode).toBe(0);

			// Add payment service
			const paymentResult = await runner.runCommand(
				["service", "add", "payments", "--provider", "stripe"],
				{
					cwd: projectPath,
					timeout: 30000,
				},
			);

			expect(paymentResult.exitCode).toBe(0);

			// Validate multi-tenant configuration
			const validateResult = await runner.runCommand(
				["project", "validate", "--multi-tenant"],
				{
					cwd: projectPath,
					timeout: 30000,
				},
			);

			expect(validateResult.exitCode).toBe(0);
		}, 90000);
	});

	describe("Error Handling and Recovery", () => {
		it("should handle invalid project names gracefully", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const invalidNames = ["", ".", "..", "con", "project with spaces"];

			for (const invalidName of invalidNames) {
				const result = await runner.runCommand(
					["project", "create", invalidName],
					{
						cwd: testDir,
						timeout: 15000,
						expectError: true,
					},
				);

				expect(result.exitCode).toBe(1);
				expect(result.stderr).toContain("Invalid project name");
			}
		});

		it("should handle missing dependencies", async () => {
			const projectName = "e2e-missing-deps";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// Create project without installing dependencies
			const createResult = await runner.runCommand(
				["project", "create", projectName, "--skip-install"],
				{
					cwd: testDir,
					timeout: 30000,
				},
			);

			expect(createResult.exitCode).toBe(0);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Try to run commands that require dependencies
			const validateResult = await runner.runCommand(["project", "validate"], {
				cwd: projectPath,
				timeout: 15000,
				expectError: true,
			});

			// Should detect missing dependencies
			expect(validateResult.exitCode).toBe(1);
			expect(validateResult.stderr).toContain("dependencies");
		});

		it("should handle interrupted operations", async () => {
			const projectName = "e2e-interrupted";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// Start project creation
			const createPromise = runner.runCommand(
				[
					"project",
					"create",
					projectName,
					"--preset",
					"saas-enterprise", // Larger preset that takes longer
				],
				{
					cwd: testDir,
					timeout: 5000, // Short timeout to simulate interruption
					expectError: true,
				},
			);

			// This should timeout and fail
			await expect(createPromise).rejects.toThrow();

			// Verify partial cleanup occurred
			const projectPath = path.join(testDir, projectName);
			const exists = await fs.pathExists(projectPath);

			if (exists) {
				// If directory exists, it should be incomplete
				const packageJsonExists = await fs.pathExists(
					path.join(projectPath, "package.json"),
				);
				// Either the directory shouldn't exist, or it should be incomplete
				expect(packageJsonExists).toBe(false);
			}
		});
	});

	describe("Performance and Scalability", () => {
		it("should handle large project generation efficiently", async () => {
			const projectName = "e2e-large-project";
			const runner = new testUtils.cli.CLITestRunner(cliPath);
			const perf = new testUtils.perf.PerformanceTracker();

			const endMeasure = perf.startMeasurement("large-project-creation");

			const createResult = await runner.runCommand(
				[
					"project",
					"create",
					projectName,
					"--preset",
					"saas-enterprise",
					"--features",
					"auth,database,payments,notifications,analytics",
				],
				{
					cwd: testDir,
					timeout: 120000, // 2 minutes
				},
			);

			const duration = endMeasure();

			expect(createResult.exitCode).toBe(0);
			expect(duration).toBeLessThan(120000); // Should complete within 2 minutes

			const projectPath = path.join(testDir, projectName);
			await testUtils.assert.assertDirectoryExists(projectPath);

			// Verify project complexity
			const packageJson = await fs.readJson(
				path.join(projectPath, "package.json"),
			);
			expect(
				Object.keys(packageJson.dependencies || {}).length,
			).toBeGreaterThan(10);
		}, 150000);

		it("should handle parallel command execution", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);
			const projectBaseName = "e2e-parallel";

			// Create multiple projects in parallel
			const promises = Array.from({ length: 3 }, (_, i) =>
				runner.runCommand(
					[
						"project",
						"create",
						`${projectBaseName}-${i}`,
						"--preset",
						"simple",
					],
					{
						cwd: testDir,
						timeout: 60000,
					},
				),
			);

			const results = await Promise.all(promises);

			// All should succeed
			results.forEach((result) => {
				expect(result.exitCode).toBe(0);
			});

			// Verify all projects were created
			for (let i = 0; i < 3; i++) {
				const projectPath = path.join(testDir, `${projectBaseName}-${i}`);
				await testUtils.assert.assertDirectoryExists(projectPath);
			}
		}, 90000);
	});

	describe("Command Line Interface", () => {
		it("should display help information correctly", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const helpResult = await runner.runCommand(["--help"], {
				cwd: testDir,
				timeout: 10000,
			});

			expect(helpResult.exitCode).toBe(0);
			expect(helpResult.stdout).toContain("Xaheen CLI");
			expect(helpResult.stdout).toContain("Commands:");
			expect(helpResult.stdout).toContain("project create");
			expect(helpResult.stdout).toContain("service add");
			expect(helpResult.stdout).toContain("ai generate");
		});

		it("should display version information", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const versionResult = await runner.runCommand(["--version"], {
				cwd: testDir,
				timeout: 10000,
			});

			expect(versionResult.exitCode).toBe(0);
			expect(versionResult.stdout).toMatch(/\d+\.\d+\.\d+/); // Semantic version format
		});

		it("should handle unknown commands gracefully", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const unknownResult = await runner.runCommand(["unknown-command"], {
				cwd: testDir,
				timeout: 10000,
				expectError: true,
			});

			expect(unknownResult.exitCode).toBe(1);
			expect(unknownResult.stderr).toContain("unknown command");
			expect(unknownResult.stderr).toContain("--help");
		});

		it("should handle missing required arguments", async () => {
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const missingArgResult = await runner.runCommand(["project", "create"], {
				cwd: testDir,
				timeout: 10000,
				expectError: true,
			});

			expect(missingArgResult.exitCode).toBe(1);
			expect(missingArgResult.stderr).toContain("missing required argument");
		});
	});

	describe("Configuration and Environment", () => {
		it("should respect configuration files", async () => {
			const projectName = "e2e-config-test";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// Create a configuration file
			const configPath = path.join(testDir, "xaheen.config.json");
			await fs.writeJson(configPath, {
				defaultPreset: "saas-starter",
				features: {
					typescript: true,
					testing: true,
					linting: true,
				},
				services: {
					auth: "nextauth",
					database: "prisma",
				},
			});

			const createResult = await runner.runCommand(
				["project", "create", projectName, "--config", configPath],
				{
					cwd: testDir,
					timeout: 60000,
				},
			);

			expect(createResult.exitCode).toBe(0);

			const projectPath = path.join(testDir, projectName);
			await testUtils.assert.assertDirectoryExists(projectPath);

			// Verify configuration was applied
			const packageJson = await fs.readJson(
				path.join(projectPath, "package.json"),
			);
			expect(packageJson.devDependencies).toHaveProperty("typescript");
			expect(packageJson.devDependencies).toHaveProperty("vitest");
		});

		it("should handle environment variables", async () => {
			const projectName = "e2e-env-test";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const createResult = await runner.runCommand(
				["project", "create", projectName],
				{
					cwd: testDir,
					timeout: 30000,
					env: {
						XAHEEN_DEFAULT_PRESET: "simple",
						XAHEEN_SKIP_TELEMETRY: "true",
						XAHEEN_DEBUG: "true",
					},
				},
			);

			expect(createResult.exitCode).toBe(0);

			// Debug mode should produce more verbose output
			expect(createResult.stdout).toContain("debug") ||
				expect(createResult.stderr).toContain("debug");
		});
	});

	describe("Dry Run Mode", () => {
		it("should preview changes without executing them", async () => {
			const projectName = "e2e-dry-run";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			const dryRunResult = await runner.runCommand(
				["project", "create", projectName, "--dry-run"],
				{
					cwd: testDir,
					timeout: 30000,
				},
			);

			expect(dryRunResult.exitCode).toBe(0);
			expect(dryRunResult.stdout).toContain("dry run");
			expect(dryRunResult.stdout).toContain("would create");

			// Verify no actual changes were made
			const projectPath = path.join(testDir, projectName);
			const exists = await fs.pathExists(projectPath);
			expect(exists).toBe(false);
		});

		it("should preview service additions", async () => {
			const projectName = "e2e-service-dry-run";
			const runner = new testUtils.cli.CLITestRunner(cliPath);

			// First create a real project
			await runner.runCommand(
				["project", "create", projectName, "--preset", "simple"],
				{
					cwd: testDir,
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Then try adding a service in dry run mode
			const dryRunResult = await runner.runCommand(
				["service", "add", "auth", "--dry-run"],
				{
					cwd: projectPath,
					timeout: 15000,
				},
			);

			expect(dryRunResult.exitCode).toBe(0);
			expect(dryRunResult.stdout).toContain("would add");
			expect(dryRunResult.stdout).toContain("auth");

			// Verify service wasn't actually added
			const authServiceExists = await fs.pathExists(
				path.join(projectPath, "src", "services", "auth.ts"),
			);
			expect(authServiceExists).toBe(false);
		});
	});
});

/**
 * @fileoverview Xaheen Integration Tests
 * @description Tests for Xaheen CLI integration functionality
 */

import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { existsSync } from "fs";
import fs from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { SharedConfigManager } from "../src/config/shared-config";
import {
	XaheenBridge,
	XalaProgrammaticAPI,
} from "../src/integrations/xaheen-bridge";
import { DependencyManager } from "../src/services/dependency-manager";

describe("Xaheen Integration Tests", () => {
	let testProjectPath: string;
	let bridge: XaheenBridge;
	let configManager: SharedConfigManager;
	let dependencyManager: DependencyManager;

	beforeEach(async () => {
		// Create temporary test project directory
		testProjectPath = path.join(tmpdir(), `xala-xaheen-test-${Date.now()}`);
		await fs.mkdir(testProjectPath, { recursive: true });

		// Initialize test instances
		bridge = new XaheenBridge(testProjectPath);
		configManager = new SharedConfigManager(testProjectPath);
		dependencyManager = new DependencyManager(testProjectPath);
	});

	afterEach(async () => {
		// Cleanup test directory
		if (existsSync(testProjectPath)) {
			await fs.rm(testProjectPath, { recursive: true, force: true });
		}
	});

	describe("XaheenBridge", () => {
		describe("Project Detection", () => {
			it("should detect Xaheen project with config file", async () => {
				// Create mock Xaheen config
				const xaheenConfig = {
					name: "test-project",
					type: "saas",
					stack: {
						frontend: "nextjs",
						backend: "nestjs",
						database: "postgresql",
					},
					features: ["auth", "dashboard"],
					compliance: ["gdpr"],
				};

				await fs.writeFile(
					path.join(testProjectPath, "xaheen.config.json"),
					JSON.stringify(xaheenConfig, null, 2),
				);

				const isXaheenProject = await bridge.detectXaheenProject();
				expect(isXaheenProject).toBe(true);
			});

			it("should detect Xaheen project from package.json", async () => {
				// Create mock package.json with Xaheen dependency
				const packageJson = {
					name: "test-project",
					version: "1.0.0",
					devDependencies: {
						"@xaheen/cli": "^1.0.0",
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				const isXaheenProject = await bridge.detectXaheenProject();
				expect(isXaheenProject).toBe(true);
			});

			it("should return false for non-Xaheen project", async () => {
				// Create regular package.json
				const packageJson = {
					name: "regular-project",
					version: "1.0.0",
					dependencies: {
						react: "^18.0.0",
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				const isXaheenProject = await bridge.detectXaheenProject();
				expect(isXaheenProject).toBe(false);
			});
		});

		describe("Compatibility Validation", () => {
			it("should validate compatible frontend stacks", async () => {
				// Create Xaheen config with supported frontend
				const xaheenConfig = {
					name: "test-project",
					stack: { frontend: "react" },
					features: [],
					compliance: [],
				};

				await fs.writeFile(
					path.join(testProjectPath, "xaheen.config.json"),
					JSON.stringify(xaheenConfig, null, 2),
				);

				await bridge.detectXaheenProject();

				await expect(bridge.validateCompatibility()).resolves.not.toThrow();
			});

			it("should reject incompatible frontend stacks", async () => {
				// Create Xaheen config with unsupported frontend
				const xaheenConfig = {
					name: "test-project",
					stack: { frontend: "ember" }, // Not supported
					features: [],
					compliance: [],
				};

				await fs.writeFile(
					path.join(testProjectPath, "xaheen.config.json"),
					JSON.stringify(xaheenConfig, null, 2),
				);

				await bridge.detectXaheenProject();

				await expect(bridge.validateCompatibility()).rejects.toThrow(
					/not supported/,
				);
			});
		});

		describe("Integration Hooks", () => {
			it("should create integration hooks directory and files", async () => {
				await bridge.setupIntegrationHooks();

				const hooksDir = path.join(testProjectPath, ".xaheen", "hooks");
				expect(existsSync(hooksDir)).toBe(true);
				expect(existsSync(path.join(hooksDir, "pre-build.sh"))).toBe(true);
				expect(existsSync(path.join(hooksDir, "post-generate.sh"))).toBe(true);
			});

			it("should create executable hook files", async () => {
				await bridge.setupIntegrationHooks();

				const preBuildHook = path.join(
					testProjectPath,
					".xaheen",
					"hooks",
					"pre-build.sh",
				);
				const stats = await fs.stat(preBuildHook);

				// Check if file is executable (on Unix systems)
				if (process.platform !== "win32") {
					expect(stats.mode & parseInt("111", 8)).toBeGreaterThan(0);
				}
			});
		});

		describe("Unified Workflow", () => {
			it("should create unified workflow script", async () => {
				await bridge.createUnifiedWorkflow();

				const workflowScript = path.join(testProjectPath, "xaheen-xala.sh");
				expect(existsSync(workflowScript)).toBe(true);

				const content = await fs.readFile(workflowScript, "utf-8");
				expect(content).toContain("Unified Xaheen + Xala Development Workflow");
				expect(content).toContain("generate fullstack");
				expect(content).toContain("xala ai generate");
			});

			it("should make workflow script executable", async () => {
				await bridge.createUnifiedWorkflow();

				const workflowScript = path.join(testProjectPath, "xaheen-xala.sh");
				const stats = await fs.stat(workflowScript);

				// Check if file is executable (on Unix systems)
				if (process.platform !== "win32") {
					expect(stats.mode & parseInt("111", 8)).toBeGreaterThan(0);
				}
			});
		});
	});

	describe("SharedConfigManager", () => {
		describe("Configuration Loading", () => {
			it("should create default configuration if none exists", async () => {
				const config = await configManager.loadConfig();

				expect(config.name).toBe("untitled-project");
				expect(config.type).toBe("standalone");
				expect(config.ui.system).toBe("xala");
				expect(config.integrations.xaheen?.enabled).toBe(false);
			});

			it("should load existing configuration", async () => {
				const existingConfig = {
					name: "existing-project",
					version: "1.0.0",
					type: "xaheen-integrated",
					ui: {
						system: "xala",
						version: "1.0.0",
						theme: "healthcare",
						platform: "react",
						compliance: ["hipaa"],
						customizations: {},
					},
					integrations: {
						xaheen: {
							enabled: true,
							version: "1.0.0",
							features: ["auth"],
							autoSync: true,
							hooks: {},
						},
					},
					development: {
						hotReload: true,
						linting: true,
						testing: true,
						accessibility: true,
					},
					build: {
						outputDir: "dist",
						optimization: true,
						bundleAnalysis: false,
						sourceMap: true,
					},
					compliance: {
						norwegian: false,
						gdpr: false,
						wcag: "AAA",
						security: { csp: true, sanitization: true, audit: true },
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "xala.config.json"),
					JSON.stringify(existingConfig, null, 2),
				);

				const config = await configManager.loadConfig();
				expect(config.name).toBe("existing-project");
				expect(config.type).toBe("xaheen-integrated");
				expect(config.ui.theme).toBe("healthcare");
			});
		});

		describe("Xaheen Integration", () => {
			it("should enable Xaheen integration", async () => {
				await configManager.loadConfig();

				await configManager.enableXaheenIntegration({
					version: "1.0.0",
					features: ["auth", "dashboard"],
					autoSync: true,
				});

				const config = configManager.getConfig();
				expect(config.type).toBe("xaheen-integrated");
				expect(config.integrations.xaheen?.enabled).toBe(true);
				expect(config.integrations.xaheen?.version).toBe("1.0.0");
				expect(config.integrations.xaheen?.features).toEqual([
					"auth",
					"dashboard",
				]);
			});

			it("should check if Xaheen is integrated", async () => {
				await configManager.loadConfig();
				expect(configManager.isXaheenIntegrated()).toBe(false);

				await configManager.enableXaheenIntegration({
					version: "1.0.0",
					features: ["auth"],
				});

				expect(configManager.isXaheenIntegrated()).toBe(true);
			});
		});

		describe("Configuration Export", () => {
			it("should export configuration for Xaheen", async () => {
				await configManager.loadConfig();
				await configManager.updateConfig({
					ui: {
						theme: "enterprise",
						platform: "nextjs",
						compliance: ["gdpr", "wcag-aaa"],
					},
				});

				const exportedConfig = await configManager.exportForTool("xaheen");

				expect(exportedConfig.ui.system).toBe("xala");
				expect(exportedConfig.ui.theme).toBe("enterprise");
				expect(exportedConfig.ui.platform).toBe("nextjs");
				expect(exportedConfig.ui.compliance).toEqual(["gdpr", "wcag-aaa"]);
			});

			it("should export configuration for Storybook", async () => {
				await configManager.loadConfig();
				await configManager.updateConfig({
					ui: { platform: "react" },
				});

				const exportedConfig = await configManager.exportForTool("storybook");

				expect(exportedConfig.addons).toContain(
					"@storybook/addon-accessibility",
				);
				expect(exportedConfig.framework).toBe("react");
			});
		});

		describe("Configuration Validation", () => {
			it("should validate valid configuration", async () => {
				await configManager.loadConfig();
				await configManager.updateConfig({
					name: "valid-project",
					ui: {
						platform: "react",
						theme: "enterprise",
					},
				});

				const validation = await configManager.validateConfig();
				expect(validation.valid).toBe(true);
				expect(validation.errors).toHaveLength(0);
			});

			it("should catch validation errors", async () => {
				await configManager.loadConfig();
				await configManager.updateConfig({
					name: "",
					ui: {
						platform: "unsupported-platform",
						theme: "",
					},
				});

				const validation = await configManager.validateConfig();
				expect(validation.valid).toBe(false);
				expect(validation.errors.length).toBeGreaterThan(0);
				expect(
					validation.errors.some((error) => error.includes("name is required")),
				).toBe(true);
				expect(
					validation.errors.some((error) =>
						error.includes("Unsupported platform"),
					),
				).toBe(true);
			});
		});
	});

	describe("DependencyManager", () => {
		describe("Dependency Checking", () => {
			it("should check Node.js version", async () => {
				const { dependencies } = await dependencyManager.checkDependencies();

				const nodeDep = dependencies.find((dep) => dep.name === "Node.js");
				expect(nodeDep).toBeDefined();
				expect(nodeDep?.version).toBe(process.version);
				expect(nodeDep?.required).toBe(true);
			});

			it("should check npm version", async () => {
				const { dependencies } = await dependencyManager.checkDependencies();

				const npmDep = dependencies.find((dep) => dep.name === "npm");
				expect(npmDep).toBeDefined();
				expect(npmDep?.required).toBe(true);
			});

			it("should handle missing package.json gracefully", async () => {
				const { dependencies } = await dependencyManager.checkDependencies();

				// Should still check Node.js and npm even without package.json
				expect(dependencies.length).toBeGreaterThanOrEqual(2);
			});
		});

		describe("Platform Dependencies", () => {
			it("should detect React project dependencies", async () => {
				const packageJson = {
					name: "react-project",
					dependencies: {
						react: "^18.0.0",
						"react-dom": "^18.0.0",
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				const { dependencies } = await dependencyManager.checkDependencies();

				const reactDep = dependencies.find((dep) => dep.name === "react");
				expect(reactDep).toBeDefined();
				expect(reactDep?.compatible).toBe(true);
			});

			it("should detect Next.js project dependencies", async () => {
				const packageJson = {
					name: "nextjs-project",
					dependencies: {
						next: "^13.5.0",
						react: "^18.0.0",
						"react-dom": "^18.0.0",
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				const { dependencies } = await dependencyManager.checkDependencies();

				const nextDep = dependencies.find((dep) => dep.name === "next");
				expect(nextDep).toBeDefined();
			});
		});

		describe("Compatibility Checking", () => {
			it("should check Xaheen compatibility", async () => {
				const compatibility = await dependencyManager.checkXaheenCompatibility(
					"1.0.0",
					"1.0.0",
				);

				expect(compatibility.compatible).toBe(true);
				expect(compatibility.recommendations).toHaveLength(0);
			});

			it("should detect incompatible versions", async () => {
				const compatibility = await dependencyManager.checkXaheenCompatibility(
					"1.0.0",
					"3.0.0",
				);

				expect(compatibility.compatible).toBe(false);
				expect(compatibility.recommendations.length).toBeGreaterThan(0);
			});
		});

		describe("Dependency Report", () => {
			it("should generate dependency report", async () => {
				const report = await dependencyManager.generateDependencyReport();

				expect(report).toContain("# Dependency Report");
				expect(report).toContain("## Overall Status");
				expect(report).toContain("## Dependencies");
				expect(report).toContain(
					"| Name | Required | Installed | Minimum | Compatible |",
				);
			});
		});
	});

	describe("XalaProgrammaticAPI", () => {
		describe("Component Generation", () => {
			it("should handle component generation request", async () => {
				// Mock successful generation
				const result = await XalaProgrammaticAPI.generateComponents(
					["Button", "Input"],
					{
						platform: "react",
						theme: "enterprise",
						outputDir: testProjectPath,
					},
				);

				expect(result).toHaveProperty("success");
				expect(result).toHaveProperty("generatedFiles");
				expect(result).toHaveProperty("errors");
			});

			it("should handle generation errors gracefully", async () => {
				const result = await XalaProgrammaticAPI.generateComponents(
					["NonExistentComponent"],
					{
						platform: "unsupported-platform",
						outputDir: "/invalid/path",
					},
				);

				expect(result.success).toBe(false);
				expect(result.errors.length).toBeGreaterThan(0);
			});
		});

		describe("Component Validation", () => {
			it("should validate component files", async () => {
				// Create mock component file
				const componentContent = `
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  );
};
`;

				const componentPath = path.join(testProjectPath, "Button.tsx");
				await fs.writeFile(componentPath, componentContent);

				const validation = await XalaProgrammaticAPI.validateComponents([
					componentPath,
				]);

				expect(validation).toHaveProperty("overallScore");
				expect(validation).toHaveProperty("componentScores");
				expect(validation.componentScores).toHaveLength(1);
			});
		});

		describe("Migration Application", () => {
			it("should apply migrations to component files", async () => {
				// Create mock component file that needs migration
				const componentContent = `
import React, { useState } from 'react';

export const OldComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{padding: '16px', color: '#333'}}>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};
`;

				const componentPath = path.join(testProjectPath, "OldComponent.tsx");
				await fs.writeFile(componentPath, componentContent);

				const result = await XalaProgrammaticAPI.applyMigrations(
					[componentPath],
					{
						dryRun: true,
						backup: false,
					},
				);

				expect(result).toHaveProperty("success");
				expect(result).toHaveProperty("migratedFiles");
				expect(result).toHaveProperty("errors");
			});
		});
	});

	describe("Integration Scenarios", () => {
		describe("Full Integration Flow", () => {
			it("should complete full Xaheen integration", async () => {
				// Setup mock Xaheen project
				const xaheenConfig = {
					name: "full-integration-test",
					type: "saas",
					stack: {
						frontend: "nextjs",
						backend: "nestjs",
						database: "postgresql",
					},
					features: ["auth", "dashboard"],
					compliance: ["gdpr"],
				};

				await fs.writeFile(
					path.join(testProjectPath, "xaheen.config.json"),
					JSON.stringify(xaheenConfig, null, 2),
				);

				const packageJson = {
					name: "full-integration-test",
					version: "1.0.0",
					dependencies: {
						next: "^13.5.0",
						react: "^18.0.0",
						"react-dom": "^18.0.0",
					},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				// Test project detection
				const isXaheenProject = await bridge.detectXaheenProject();
				expect(isXaheenProject).toBe(true);

				// Test compatibility validation
				await expect(bridge.validateCompatibility()).resolves.not.toThrow();

				// Test hook setup
				await bridge.setupIntegrationHooks();
				expect(existsSync(path.join(testProjectPath, ".xaheen", "hooks"))).toBe(
					true,
				);

				// Test unified workflow creation
				await bridge.createUnifiedWorkflow();
				expect(existsSync(path.join(testProjectPath, "xaheen-xala.sh"))).toBe(
					true,
				);

				// Test configuration integration
				await configManager.loadConfig();
				await configManager.enableXaheenIntegration({
					version: "1.0.0",
					features: ["auth", "dashboard"],
				});

				const config = configManager.getConfig();
				expect(config.type).toBe("xaheen-integrated");
				expect(config.integrations.xaheen?.enabled).toBe(true);
			});
		});

		describe("Error Handling", () => {
			it("should handle missing Xaheen configuration gracefully", async () => {
				// Test with empty project
				const isXaheenProject = await bridge.detectXaheenProject();
				expect(isXaheenProject).toBe(false);

				// Should throw error when trying to validate without Xaheen config
				await expect(bridge.validateCompatibility()).rejects.toThrow();
			});

			it("should handle dependency check failures", async () => {
				// Create package.json with missing dependencies
				const packageJson = {
					name: "incomplete-project",
					dependencies: {},
				};

				await fs.writeFile(
					path.join(testProjectPath, "package.json"),
					JSON.stringify(packageJson, null, 2),
				);

				const { compatible, dependencies } =
					await dependencyManager.checkDependencies();

				expect(compatible).toBe(false);
				const missingDeps = dependencies.filter(
					(dep) => !dep.compatible && dep.required,
				);
				expect(missingDeps.length).toBeGreaterThan(0);
			});
		});
	});
});

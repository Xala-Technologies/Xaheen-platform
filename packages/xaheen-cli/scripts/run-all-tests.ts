#!/usr/bin/env tsx

/**
 * Comprehensive Test Runner Script
 *
 * Runs all test suites in the correct order with proper reporting
 * and performance tracking.
 */

import chalk from "chalk";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { performance } from "perf_hooks";

interface TestSuite {
	name: string;
	command: string;
	args: string[];
	timeout: number;
	critical: boolean;
	description: string;
}

interface TestResult {
	name: string;
	success: boolean;
	duration: number;
	exitCode: number;
	output: string;
	error?: string;
}

class TestRunner {
	private results: TestResult[] = [];
	private startTime: number = 0;
	private outputDir: string;

	constructor() {
		this.outputDir = path.resolve(__dirname, "../test-output");
	}

	async run(): Promise<void> {
		console.log(chalk.blue.bold("🧪 Xaheen CLI Comprehensive Test Suite"));
		console.log(chalk.gray("=".repeat(60)));
		console.log();

		this.startTime = performance.now();

		// Ensure output directory exists
		await fs.ensureDir(this.outputDir);

		// Define test suites in execution order
		const testSuites: TestSuite[] = [
			{
				name: "Build",
				command: "npm",
				args: ["run", "build"],
				timeout: 60000,
				critical: true,
				description: "Build the CLI for testing",
			},
			{
				name: "Type Check",
				command: "npm",
				args: ["run", "type-check"],
				timeout: 30000,
				critical: true,
				description: "TypeScript type checking",
			},
			{
				name: "Lint",
				command: "npm",
				args: ["run", "lint"],
				timeout: 30000,
				critical: false,
				description: "Code linting and formatting",
			},
			{
				name: "Unit Tests",
				command: "npm",
				args: ["run", "test:unit"],
				timeout: 120000,
				critical: true,
				description: "Fast unit tests with mocking",
			},
			{
				name: "Integration Tests",
				command: "npm",
				args: ["run", "test:integration"],
				timeout: 300000,
				critical: true,
				description: "File system and service integration tests",
			},
			{
				name: "E2E Tests",
				command: "npm",
				args: ["run", "test:e2e"],
				timeout: 600000,
				critical: true,
				description: "Complete CLI workflow tests",
			},
			{
				name: "Performance Tests",
				command: "npm",
				args: ["run", "test:performance"],
				timeout: 900000,
				critical: false,
				description: "Performance benchmarking and regression detection",
			},
			{
				name: "Security Tests",
				command: "npm",
				args: ["run", "test:security"],
				timeout: 300000,
				critical: true,
				description: "Security vulnerability and compliance testing",
			},
		];

		// Run test suites
		for (const suite of testSuites) {
			await this.runTestSuite(suite);
		}

		// Generate final report
		await this.generateReport();

		// Exit with appropriate code
		const hasFailures = this.results.some((r) => !r.success);
		const hasCriticalFailures = this.results.some(
			(r) => !r.success && testSuites.find((s) => s.name === r.name)?.critical,
		);

		if (hasCriticalFailures) {
			console.log(chalk.red.bold("\n❌ Critical tests failed"));
			process.exit(1);
		} else if (hasFailures) {
			console.log(chalk.yellow.bold("\n⚠️ Some non-critical tests failed"));
			process.exit(0);
		} else {
			console.log(chalk.green.bold("\n✅ All tests passed"));
			process.exit(0);
		}
	}

	private async runTestSuite(suite: TestSuite): Promise<void> {
		console.log(chalk.cyan(`\n🔄 Running ${suite.name}...`));
		console.log(chalk.gray(`   ${suite.description}`));

		const startTime = performance.now();
		let result: TestResult;

		try {
			const process = execa(suite.command, suite.args, {
				cwd: path.resolve(__dirname, ".."),
				timeout: suite.timeout,
				all: true,
			});

			// Show live output for long-running tests
			if (suite.timeout > 60000) {
				process.all?.on("data", (data) => {
					const output = data.toString();
					if (
						output.includes("PASS") ||
						output.includes("FAIL") ||
						output.includes("✓") ||
						output.includes("✗")
					) {
						process.stdout.write(chalk.gray(`   ${output}`));
					}
				});
			}

			const execResult = await process;
			const duration = performance.now() - startTime;

			result = {
				name: suite.name,
				success: true,
				duration,
				exitCode: execResult.exitCode || 0,
				output: execResult.all || "",
			};

			console.log(
				chalk.green(`   ✅ ${suite.name} passed (${Math.round(duration)}ms)`),
			);
		} catch (error: any) {
			const duration = performance.now() - startTime;

			result = {
				name: suite.name,
				success: false,
				duration,
				exitCode: error.exitCode || 1,
				output: error.all || "",
				error: error.message,
			};

			const status = suite.critical ? "❌" : "⚠️";
			const color = suite.critical ? chalk.red : chalk.yellow;
			console.log(
				color(`   ${status} ${suite.name} failed (${Math.round(duration)}ms)`),
			);

			if (error.all) {
				const lines = error.all.split("\n").slice(-10); // Last 10 lines
				console.log(chalk.gray("   Last few lines of output:"));
				lines.forEach((line: string) => {
					if (line.trim()) {
						console.log(chalk.gray(`   ${line}`));
					}
				});
			}
		}

		this.results.push(result);

		// Save individual test result
		const resultPath = path.join(
			this.outputDir,
			`${result.name.toLowerCase().replace(/\s+/g, "-")}-result.json`,
		);
		await fs.writeJson(resultPath, result, { spaces: 2 });
	}

	private async generateReport(): Promise<void> {
		const totalDuration = performance.now() - this.startTime;

		console.log(chalk.blue.bold("\n📊 Test Summary"));
		console.log(chalk.gray("=".repeat(60)));

		// Summary table
		console.log(chalk.bold("\nResults:"));
		this.results.forEach((result) => {
			const status = result.success ? "✅ PASS" : "❌ FAIL";
			const duration = `${Math.round(result.duration)}ms`;
			const statusColor = result.success ? chalk.green : chalk.red;

			console.log(
				`  ${statusColor(status.padEnd(8))} ${result.name.padEnd(20)} ${duration.padStart(8)}`,
			);
		});

		// Statistics
		const passed = this.results.filter((r) => r.success).length;
		const failed = this.results.filter((r) => !r.success).length;
		const total = this.results.length;

		console.log(chalk.bold("\nStatistics:"));
		console.log(`  Total: ${total}`);
		console.log(`  Passed: ${chalk.green(passed)}`);
		console.log(`  Failed: ${chalk.red(failed)}`);
		console.log(
			`  Success Rate: ${chalk.cyan(Math.round((passed / total) * 100))}%`,
		);
		console.log(`  Total Duration: ${chalk.cyan(Math.round(totalDuration))}ms`);

		// Performance summary
		const performanceResult = this.results.find(
			(r) => r.name === "Performance Tests",
		);
		if (performanceResult?.success) {
			console.log(chalk.bold("\nPerformance Summary:"));
			console.log("  See detailed performance report in test-output/");
		}

		// Security summary
		const securityResult = this.results.find(
			(r) => r.name === "Security Tests",
		);
		if (securityResult) {
			console.log(chalk.bold("\nSecurity Summary:"));
			if (securityResult.success) {
				console.log("  ✅ No critical security issues detected");
			} else {
				console.log("  ❌ Security vulnerabilities found - check logs");
			}
		}

		// Generate JSON report
		const report = {
			timestamp: new Date().toISOString(),
			totalDuration: Math.round(totalDuration),
			results: this.results,
			summary: {
				total,
				passed,
				failed,
				successRate: Math.round((passed / total) * 100),
			},
		};

		await fs.writeJson(
			path.join(this.outputDir, "comprehensive-test-report.json"),
			report,
			{ spaces: 2 },
		);

		// Generate HTML report
		await this.generateHtmlReport(report);

		console.log(
			chalk.gray(`\n📁 Detailed reports saved to: ${this.outputDir}`),
		);
	}

	private async generateHtmlReport(report: any): Promise<void> {
		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xaheen CLI Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #2563eb; margin-bottom: 10px; }
    .subtitle { color: #6b7280; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
    .stat-label { color: #6b7280; font-size: 0.9em; }
    .results-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .results-table th { background: #f8fafc; font-weight: 600; }
    .status-pass { color: #059669; font-weight: 600; }
    .status-fail { color: #dc2626; font-weight: 600; }
    .duration { font-family: monospace; color: #6b7280; }
    .footer { text-align: center; color: #6b7280; font-size: 0.9em; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Xaheen CLI Test Report</h1>
    <div class="subtitle">Generated on ${new Date(report.timestamp).toLocaleString()}</div>
    
    <div class="summary">
      <div class="stat-card">
        <div class="stat-value">${report.summary.total}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #059669;">${report.summary.passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #dc2626;">${report.summary.failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.summary.successRate}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(report.totalDuration / 1000)}s</div>
        <div class="stat-label">Total Duration</div>
      </div>
    </div>

    <table class="results-table">
      <thead>
        <tr>
          <th>Test Suite</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Exit Code</th>
        </tr>
      </thead>
      <tbody>
        ${report.results
					.map(
						(result: TestResult) => `
          <tr>
            <td>${result.name}</td>
            <td class="${result.success ? "status-pass" : "status-fail"}">
              ${result.success ? "✅ PASS" : "❌ FAIL"}
            </td>
            <td class="duration">${Math.round(result.duration)}ms</td>
            <td>${result.exitCode}</td>
          </tr>
        `,
					)
					.join("")}
      </tbody>
    </table>

    <div class="footer">
      <p>Xaheen CLI v${process.env.npm_package_version || "3.0.0"} • Node.js ${process.version}</p>
    </div>
  </div>
</body>
</html>`;

		await fs.writeFile(path.join(this.outputDir, "test-report.html"), html);
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: npm run test:all [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Show verbose output
  
Environment Variables:
  CI=true        Run in CI mode (less interactive output)
  
Examples:
  npm run test:all
  npm run test:all --verbose
  CI=true npm run test:all
`);
		process.exit(0);
	}

	const runner = new TestRunner();
	await runner.run();
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log(chalk.yellow("\n⏹️ Test run interrupted"));
	process.exit(130);
});

process.on("SIGTERM", () => {
	console.log(chalk.yellow("\n⏹️ Test run terminated"));
	process.exit(143);
});

// Run if called directly
if (require.main === module) {
	main().catch((error) => {
		console.error(chalk.red("Test runner failed:"), error);
		process.exit(1);
	});
}

export { TestRunner };

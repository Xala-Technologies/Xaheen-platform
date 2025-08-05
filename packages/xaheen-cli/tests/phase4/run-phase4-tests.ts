/**
 * Phase 4 Backend MVP Test Runner
 * Orchestrates all Phase 4 tests with proper reporting and error handling
 */

import { spawn } from "node:child_process";
import { join } from "node:path";
import { promises as fs } from "node:fs";

interface TestSuite {
	readonly name: string;
	readonly pattern: string;
	readonly timeout: number;
	readonly parallel?: boolean;
}

interface TestResult {
	readonly suite: string;
	readonly success: boolean;
	readonly duration: number;
	readonly output: string;
	readonly error?: string;
}

class Phase4TestRunner {
	private readonly testSuites: TestSuite[] = [
		{
			name: "Unit Tests - Model Generation",
			pattern: "tests/phase4/unit/model.test.ts",
			timeout: 30000,
			parallel: true,
		},
		{
			name: "Unit Tests - Endpoint Generation",
			pattern: "tests/phase4/unit/endpoint.test.ts",
			timeout: 30000,
			parallel: true,
		},
		{
			name: "Unit Tests - Service Generation",
			pattern: "tests/phase4/unit/service.test.ts",
			timeout: 30000,
			parallel: true,
		},
		{
			name: "Integration Tests - Express",
			pattern: "tests/phase4/integration/express.test.ts",
			timeout: 120000,
			parallel: false,
		},
		{
			name: "Integration Tests - NestJS",
			pattern: "tests/phase4/integration/nestjs.test.ts",
			timeout: 180000,
			parallel: false,
		},
		{
			name: "Integration Tests - Fastify",
			pattern: "tests/phase4/integration/fastify.test.ts",
			timeout: 120000,
			parallel: false,
		},
		{
			name: "Integration Tests - Hono",
			pattern: "tests/phase4/integration/hono.test.ts",
			timeout: 120000,
			parallel: false,
		},
		{
			name: "E2E Tests - CRUD Operations",
			pattern: "tests/phase4/e2e/crud.test.ts",
			timeout: 300000, // 5 minutes
			parallel: false,
		},
		{
			name: "Performance Tests - Cold Start",
			pattern: "tests/phase4/performance/cold-start.test.ts",
			timeout: 600000, // 10 minutes
			parallel: false,
		},
		{
			name: "Performance Tests - Latency Benchmarks",
			pattern: "tests/phase4/performance/latency.test.ts",
			timeout: 600000, // 10 minutes
			parallel: false,
		},
	];

	private readonly results: TestResult[] = [];

	async runAllTests(options: {
		parallel?: boolean;
		suites?: string[];
		skipPerformance?: boolean;
		generateReport?: boolean;
	} = {}): Promise<void> {
		console.log("🚀 Starting Phase 4 Backend MVP Tests\n");

		const suitesToRun = this.filterSuites(options);
		
		if (options.parallel && suitesToRun.every(suite => suite.parallel)) {
			await this.runParallel(suitesToRun);
		} else {
			await this.runSequential(suitesToRun);
		}

		await this.generateSummary();

		if (options.generateReport) {
			await this.generateDetailedReport();
		}

		const failures = this.results.filter(r => !r.success);
		if (failures.length > 0) {
			console.error(`❌ ${failures.length} test suite(s) failed`);
			process.exit(1);
		} else {
			console.log("✅ All Phase 4 tests passed!");
		}
	}

	private filterSuites(options: {
		suites?: string[];
		skipPerformance?: boolean;
	}): TestSuite[] {
		let suites = [...this.testSuites];

		if (options.skipPerformance) {
			suites = suites.filter(suite => !suite.name.includes("Performance"));
		}

		if (options.suites && options.suites.length > 0) {
			suites = suites.filter(suite =>
				options.suites!.some(filter =>
					suite.name.toLowerCase().includes(filter.toLowerCase())
				)
			);
		}

		return suites;
	}

	private async runParallel(suites: TestSuite[]): Promise<void> {
		console.log(`🔄 Running ${suites.length} test suites in parallel...\n`);

		const promises = suites.map(suite => this.runSuite(suite));
		await Promise.allSettled(promises);
	}

	private async runSequential(suites: TestSuite[]): Promise<void> {
		console.log(`🔄 Running ${suites.length} test suites sequentially...\n`);

		for (const suite of suites) {
			await this.runSuite(suite);
		}
	}

	private async runSuite(suite: TestSuite): Promise<void> {
		console.log(`📋 Running: ${suite.name}`);
		const startTime = Date.now();

		try {
			const { success, output, error } = await this.executeVitest(suite);
			const duration = Date.now() - startTime;

			this.results.push({
				suite: suite.name,
				success,
				duration,
				output,
				error,
			});

			if (success) {
				console.log(`✅ ${suite.name} (${duration}ms)`);
			} else {
				console.error(`❌ ${suite.name} (${duration}ms)`);
				if (error) {
					console.error(`   Error: ${error}`);
				}
			}
		} catch (error) {
			const duration = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);

			this.results.push({
				suite: suite.name,
				success: false,
				duration,
				output: "",
				error: errorMessage,
			});

			console.error(`❌ ${suite.name} failed: ${errorMessage}`);
		}

		console.log(); // Empty line for readability
	}

	private executeVitest(suite: TestSuite): Promise<{
		success: boolean;
		output: string;
		error?: string;
	}> {
		return new Promise((resolve) => {
			const child = spawn("npx", ["vitest", "run", suite.pattern, "--reporter=verbose"], {
				stdio: ["ignore", "pipe", "pipe"],
				timeout: suite.timeout,
			});

			let stdout = "";
			let stderr = "";

			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (code) => {
				resolve({
					success: code === 0,
					output: stdout,
					error: stderr || undefined,
				});
			});

			child.on("error", (error) => {
				resolve({
					success: false,
					output: stdout,
					error: error.message,
				});
			});

			// Timeout handling
			setTimeout(() => {
				child.kill("SIGTERM");
				resolve({
					success: false,
					output: stdout,
					error: `Test suite timed out after ${suite.timeout}ms`,
				});
			}, suite.timeout);
		});
	}

	private async generateSummary(): Promise<void> {
		console.log("📊 Phase 4 Test Summary");
		console.log("═".repeat(50));

		const totalSuites = this.results.length;
		const passedSuites = this.results.filter(r => r.success).length;
		const failedSuites = totalSuites - passedSuites;
		const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

		console.log(`Total Suites: ${totalSuites}`);
		console.log(`Passed: ${passedSuites}`);
		console.log(`Failed: ${failedSuites}`);
		console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
		console.log();

		// Suite breakdown
		console.log("📋 Suite Results:");
		console.log("-".repeat(70));
		console.log("Suite Name".padEnd(40) + "Status".padEnd(10) + "Duration");
		console.log("-".repeat(70));

		for (const result of this.results) {
			const status = result.success ? "✅ PASS" : "❌ FAIL";
			const duration = `${(result.duration / 1000).toFixed(2)}s`;
			const name = result.suite.length > 37 
				? result.suite.substring(0, 37) + "..." 
				: result.suite;
			
			console.log(name.padEnd(40) + status.padEnd(10) + duration);
		}

		console.log("-".repeat(70));
		console.log();

		// Performance summary (if performance tests were run)
		const perfResults = this.results.filter(r => r.suite.includes("Performance"));
		if (perfResults.length > 0) {
			console.log("⚡ Performance Test Summary:");
			for (const result of perfResults) {
				if (result.success) {
					console.log(`✅ ${result.suite}: Baselines established`);
				} else {
					console.log(`❌ ${result.suite}: Failed to establish baselines`);
				}
			}
			console.log();
		}

		// Failure details
		const failures = this.results.filter(r => !r.success);
		if (failures.length > 0) {
			console.log("❌ Failure Details:");
			console.log("-".repeat(50));
			
			for (const failure of failures) {
				console.log(`Suite: ${failure.suite}`);
				if (failure.error) {
					console.log(`Error: ${failure.error}`);
				}
				console.log();
			}
		}
	}

	private async generateDetailedReport(): Promise<void> {
		const reportDir = join(process.cwd(), "test-results", "phase4");
		await fs.mkdir(reportDir, { recursive: true });

		const report = {
			timestamp: new Date().toISOString(),
			summary: {
				totalSuites: this.results.length,
				passedSuites: this.results.filter(r => r.success).length,
				failedSuites: this.results.filter(r => !r.success).length,
				totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
			},
			results: this.results,
		};

		const reportPath = join(reportDir, `phase4-test-report-${Date.now()}.json`);
		await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

		console.log(`📄 Detailed report saved to: ${reportPath}`);
	}
}

// CLI interface
async function main() {
	const args = process.argv.slice(2);
	const options: {
		parallel?: boolean;
		suites?: string[];
		skipPerformance?: boolean;
		generateReport?: boolean;
	} = {};

	// Parse CLI arguments
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		
		switch (arg) {
			case "--parallel":
				options.parallel = true;
				break;
			case "--skip-performance":
				options.skipPerformance = true;
				break;
			case "--generate-report":
				options.generateReport = true;
				break;
			case "--suites":
				if (i + 1 < args.length) {
					options.suites = args[i + 1].split(",");
					i++; // Skip next argument
				}
				break;
			case "--help":
				console.log(`
Phase 4 Backend MVP Test Runner

Usage: tsx tests/phase4/run-phase4-tests.ts [options]

Options:
  --parallel              Run unit tests in parallel (when possible)
  --skip-performance      Skip performance benchmark tests
  --generate-report       Generate detailed JSON report
  --suites <list>         Run specific test suites (comma-separated)
  --help                  Show this help message

Examples:
  # Run all tests
  tsx tests/phase4/run-phase4-tests.ts

  # Run only unit tests
  tsx tests/phase4/run-phase4-tests.ts --suites unit

  # Run integration tests for Express and Fastify
  tsx tests/phase4/run-phase4-tests.ts --suites express,fastify

  # Skip performance tests and generate report
  tsx tests/phase4/run-phase4-tests.ts --skip-performance --generate-report
				`);
				process.exit(0);
		}
	}

	const runner = new Phase4TestRunner();
	await runner.runAllTests(options);
}

// Run if this script is executed directly
if (require.main === module) {
	main().catch((error) => {
		console.error("❌ Test runner failed:", error);
		process.exit(1);
	});
}

export { Phase4TestRunner };
/**
 * Performance Benchmarking Service
 * Measures and tracks CLI performance metrics for production readiness
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { performance } from "perf_hooks";
import { execSync } from "child_process";
import { existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { logger } from "../../utils/logger";

export interface PerformanceMetrics {
	readonly commandName: string;
	readonly startTime: number;
	readonly endTime: number;
	readonly duration: number;
	readonly memoryUsage: NodeJS.MemoryUsage;
	readonly cpuUsage: NodeJS.CpuUsage;
	readonly timestamp: string;
	readonly success: boolean;
	readonly errorMessage?: string;
}

export interface BenchmarkThresholds {
	readonly coldStart: number; // ms
	readonly warmStart: number; // ms
	readonly memoryLimit: number; // MB
	readonly cpuThreshold: number; // percentage
}

export interface BenchmarkReport {
	readonly summary: {
		readonly totalCommands: number;
		readonly averageDuration: number;
		readonly medianDuration: number;
		readonly successRate: number;
		readonly memoryPeak: number;
	};
	readonly thresholdViolations: Array<{
		readonly command: string;
		readonly metric: string;
		readonly actual: number;
		readonly threshold: number;
	}>;
	readonly trends: {
		readonly performanceImprovement: number; // percentage
		readonly memoryOptimization: number; // percentage
	};
	readonly recommendations: string[];
}

export class BenchmarkService {
	private readonly metricsFile: string;
	private readonly thresholds: BenchmarkThresholds;
	private currentMetric?: {
		commandName: string;
		startTime: number;
		memoryStart: NodeJS.MemoryUsage;
		cpuStart: NodeJS.CpuUsage;
	};

	constructor(
		metricsFile: string = join(process.cwd(), "performance-metrics.json"),
		thresholds: Partial<BenchmarkThresholds> = {}
	) {
		this.metricsFile = metricsFile;
		this.thresholds = {
			coldStart: thresholds.coldStart ?? 500, // 500ms target
			warmStart: thresholds.warmStart ?? 200, // 200ms target
			memoryLimit: thresholds.memoryLimit ?? 512, // 512MB limit
			cpuThreshold: thresholds.cpuThreshold ?? 80, // 80% CPU threshold
		};
	}

	/**
	 * Start measuring performance for a command
	 */
	startMeasurement(commandName: string): void {
		this.currentMetric = {
			commandName,
			startTime: performance.now(),
			memoryStart: process.memoryUsage(),
			cpuStart: process.cpuUsage(),
		};
	}

	/**
	 * End measurement and record metrics
	 */
	endMeasurement(success: boolean = true, errorMessage?: string): PerformanceMetrics | undefined {
		if (!this.currentMetric) {
			logger.warn("No active measurement to end");
			return;
		}

		const endTime = performance.now();
		const memoryEnd = process.memoryUsage();
		const cpuEnd = process.cpuUsage(this.currentMetric.cpuStart);

		const metrics: PerformanceMetrics = {
			commandName: this.currentMetric.commandName,
			startTime: this.currentMetric.startTime,
			endTime,
			duration: endTime - this.currentMetric.startTime,
			memoryUsage: {
				rss: memoryEnd.rss - this.currentMetric.memoryStart.rss,
				heapTotal: memoryEnd.heapTotal - this.currentMetric.memoryStart.heapTotal,
				heapUsed: memoryEnd.heapUsed - this.currentMetric.memoryStart.heapUsed,
				external: memoryEnd.external - this.currentMetric.memoryStart.external,
				arrayBuffers: memoryEnd.arrayBuffers - this.currentMetric.memoryStart.arrayBuffers,
			},
			cpuUsage: cpuEnd,
			timestamp: new Date().toISOString(),
			success,
			errorMessage,
		};

		this.recordMetrics(metrics);
		this.currentMetric = undefined;

		return metrics;
	}

	/**
	 * Record metrics to persistent storage
	 */
	private recordMetrics(metrics: PerformanceMetrics): void {
		try {
			let existingMetrics: PerformanceMetrics[] = [];

			if (existsSync(this.metricsFile)) {
				const fileContent = readFileSync(this.metricsFile, "utf-8");
				existingMetrics = JSON.parse(fileContent);
			}

			existingMetrics.push(metrics);

			// Keep only last 1000 metrics to prevent file bloat
			if (existingMetrics.length > 1000) {
				existingMetrics = existingMetrics.slice(-1000);
			}

			writeFileSync(this.metricsFile, JSON.stringify(existingMetrics, null, 2));
		} catch (error) {
			logger.error("Failed to record performance metrics:", error);
		}
	}

	/**
	 * Measure a function's performance
	 */
	async measureAsync<T>(
		commandName: string,
		fn: () => Promise<T>
	): Promise<{ result: T; metrics: PerformanceMetrics }> {
		this.startMeasurement(commandName);

		try {
			const result = await fn();
			const metrics = this.endMeasurement(true);
			return { result, metrics: metrics! };
		} catch (error) {
			const metrics = this.endMeasurement(false, error instanceof Error ? error.message : String(error));
			throw error;
		}
	}

	/**
	 * Measure a synchronous function's performance
	 */
	measureSync<T>(
		commandName: string,
		fn: () => T
	): { result: T; metrics: PerformanceMetrics } {
		this.startMeasurement(commandName);

		try {
			const result = fn();
			const metrics = this.endMeasurement(true);
			return { result, metrics: metrics! };
		} catch (error) {
			const metrics = this.endMeasurement(false, error instanceof Error ? error.message : String(error));
			throw error;
		}
	}

	/**
	 * Generate comprehensive benchmark report
	 */
	generateReport(): BenchmarkReport {
		const metrics = this.loadMetrics();

		if (metrics.length === 0) {
			return {
				summary: {
					totalCommands: 0,
					averageDuration: 0,
					medianDuration: 0,
					successRate: 0,
					memoryPeak: 0,
				},
				thresholdViolations: [],
				trends: {
					performanceImprovement: 0,
					memoryOptimization: 0,
				},
				recommendations: ["No performance data available. Start using the CLI to gather metrics."],
			};
		}

		const successfulMetrics = metrics.filter(m => m.success);
		const durations = successfulMetrics.map(m => m.duration).sort((a, b) => a - b);
		const memoryUsages = metrics.map(m => m.memoryUsage.heapUsed / 1024 / 1024); // Convert to MB
		
		const summary = {
			totalCommands: metrics.length,
			averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
			medianDuration: durations[Math.floor(durations.length / 2)] || 0,
			successRate: (successfulMetrics.length / metrics.length) * 100,
			memoryPeak: Math.max(...memoryUsages),
		};

		const thresholdViolations = this.findThresholdViolations(metrics);
		const trends = this.calculateTrends(metrics);
		const recommendations = this.generateRecommendations(summary, thresholdViolations);

		return {
			summary,
			thresholdViolations,
			trends,
			recommendations,
		};
	}

	/**
	 * Find threshold violations
	 */
	private findThresholdViolations(metrics: PerformanceMetrics[]): Array<{
		readonly command: string;
		readonly metric: string;
		readonly actual: number;
		readonly threshold: number;
	}> {
		const violations: Array<{
			readonly command: string;
			readonly metric: string;
			readonly actual: number;
			readonly threshold: number;
		}> = [];

		for (const metric of metrics) {
			// Check duration thresholds
			if (metric.duration > this.thresholds.coldStart) {
				violations.push({
					command: metric.commandName,
					metric: "duration",
					actual: metric.duration,
					threshold: this.thresholds.coldStart,
				});
			}

			// Check memory threshold
			const memoryMB = metric.memoryUsage.heapUsed / 1024 / 1024;
			if (memoryMB > this.thresholds.memoryLimit) {
				violations.push({
					command: metric.commandName,
					metric: "memory",
					actual: memoryMB,
					threshold: this.thresholds.memoryLimit,
				});
			}
		}

		return violations;
	}

	/**
	 * Calculate performance trends
	 */
	private calculateTrends(metrics: PerformanceMetrics[]): {
		readonly performanceImprovement: number;
		readonly memoryOptimization: number;
	} {
		if (metrics.length < 10) {
			return { performanceImprovement: 0, memoryOptimization: 0 };
		}

		// Split metrics into old and new halves
		const midpoint = Math.floor(metrics.length / 2);
		const oldMetrics = metrics.slice(0, midpoint);
		const newMetrics = metrics.slice(midpoint);

		// Calculate average duration improvement
		const oldAvgDuration = oldMetrics.reduce((sum, m) => sum + m.duration, 0) / oldMetrics.length;
		const newAvgDuration = newMetrics.reduce((sum, m) => sum + m.duration, 0) / newMetrics.length;
		const performanceImprovement = ((oldAvgDuration - newAvgDuration) / oldAvgDuration) * 100;

		// Calculate memory optimization
		const oldAvgMemory = oldMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / oldMetrics.length;
		const newAvgMemory = newMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / newMetrics.length;
		const memoryOptimization = ((oldAvgMemory - newAvgMemory) / oldAvgMemory) * 100;

		return { performanceImprovement, memoryOptimization };
	}

	/**
	 * Generate performance recommendations
	 */
	private generateRecommendations(
		summary: BenchmarkReport["summary"],
		violations: BenchmarkReport["thresholdViolations"]
	): string[] {
		const recommendations: string[] = [];

		// Duration recommendations
		if (summary.averageDuration > this.thresholds.coldStart) {
			recommendations.push(
				`Average duration (${Math.round(summary.averageDuration)}ms) exceeds cold start threshold (${this.thresholds.coldStart}ms). Consider optimizing slow operations.`
			);
		}

		// Memory recommendations
		if (summary.memoryPeak > this.thresholds.memoryLimit) {
			recommendations.push(
				`Peak memory usage (${Math.round(summary.memoryPeak)}MB) exceeds limit (${this.thresholds.memoryLimit}MB). Consider memory optimization techniques.`
			);
		}

		// Success rate recommendations
		if (summary.successRate < 95) {
			recommendations.push(
				`Success rate (${summary.successRate.toFixed(1)}%) is below 95%. Focus on error handling and stability improvements.`
			);
		}

		// Command-specific recommendations
		const commandViolations = new Map<string, number>();
		for (const violation of violations) {
			commandViolations.set(violation.command, (commandViolations.get(violation.command) || 0) + 1);
		}

		for (const [command, count] of commandViolations) {
			if (count > 5) {
				recommendations.push(
					`Command "${command}" has ${count} performance violations. Prioritize optimization for this command.`
				);
			}
		}

		// General recommendations
		if (recommendations.length === 0) {
			recommendations.push("Performance metrics are within acceptable thresholds. Continue monitoring.");
		}

		return recommendations;
	}

	/**
	 * Load metrics from storage
	 */
	private loadMetrics(): PerformanceMetrics[] {
		try {
			if (!existsSync(this.metricsFile)) {
				return [];
			}

			const fileContent = readFileSync(this.metricsFile, "utf-8");
			return JSON.parse(fileContent);
		} catch (error) {
			logger.error("Failed to load performance metrics:", error);
			return [];
		}
	}

	/**
	 * Display performance report in the console
	 */
	displayReport(): void {
		const report = this.generateReport();

		console.log(chalk.blue.bold("\n📊 Performance Benchmark Report\n"));

		// Summary
		console.log(chalk.cyan("Summary:"));
		console.log(`  Total Commands: ${report.summary.totalCommands}`);
		console.log(`  Average Duration: ${Math.round(report.summary.averageDuration)}ms`);
		console.log(`  Median Duration: ${Math.round(report.summary.medianDuration)}ms`);
		console.log(`  Success Rate: ${report.summary.successRate.toFixed(1)}%`);
		console.log(`  Peak Memory: ${Math.round(report.summary.memoryPeak)}MB`);

		// Trends
		if (report.trends.performanceImprovement !== 0 || report.trends.memoryOptimization !== 0) {
			console.log(chalk.cyan("\nTrends:"));
			if (report.trends.performanceImprovement > 0) {
				console.log(chalk.green(`  Performance Improvement: +${report.trends.performanceImprovement.toFixed(1)}%`));
			} else if (report.trends.performanceImprovement < 0) {
				console.log(chalk.red(`  Performance Regression: ${report.trends.performanceImprovement.toFixed(1)}%`));
			}

			if (report.trends.memoryOptimization > 0) {
				console.log(chalk.green(`  Memory Optimization: +${report.trends.memoryOptimization.toFixed(1)}%`));
			} else if (report.trends.memoryOptimization < 0) {
				console.log(chalk.red(`  Memory Increase: ${report.trends.memoryOptimization.toFixed(1)}%`));
			}
		}

		// Threshold violations
		if (report.thresholdViolations.length > 0) {
			console.log(chalk.yellow("\n⚠️  Threshold Violations:"));
			for (const violation of report.thresholdViolations.slice(0, 10)) { // Show first 10
				console.log(
					`  ${violation.command}: ${violation.metric} = ${Math.round(violation.actual)}${violation.metric === "memory" ? "MB" : "ms"} (threshold: ${violation.threshold}${violation.metric === "memory" ? "MB" : "ms"})`
				);
			}
			if (report.thresholdViolations.length > 10) {
				console.log(`  ... and ${report.thresholdViolations.length - 10} more violations`);
			}
		}

		// Recommendations
		console.log(chalk.cyan("\n📋 Recommendations:"));
		for (const recommendation of report.recommendations) {
			console.log(`  • ${recommendation}`);
		}

		console.log();
	}

	/**
	 * Benchmark CLI cold start time
	 */
	async benchmarkColdStart(): Promise<number> {
		const iterations = 5;
		const times: number[] = [];

		for (let i = 0; i < iterations; i++) {
			const start = performance.now();
			
			try {
				// Execute CLI help command as a cold start test
				execSync("node dist/index.js --help", { 
					stdio: "pipe",
					timeout: 10000,
					cwd: process.cwd(),
				});
				
				const end = performance.now();
				times.push(end - start);
			} catch (error) {
				logger.warn(`Cold start iteration ${i + 1} failed:`, error);
			}
		}

		const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
		return averageTime;
	}

	/**
	 * Clear all metrics
	 */
	clearMetrics(): void {
		try {
			if (existsSync(this.metricsFile)) {
				writeFileSync(this.metricsFile, "[]");
			}
			logger.info("Performance metrics cleared");
		} catch (error) {
			logger.error("Failed to clear metrics:", error);
		}
	}
}

// Export singleton instance
export const benchmarkService = new BenchmarkService();
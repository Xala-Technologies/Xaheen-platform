/**
 * CLI Performance Monitoring System
 * Tracks command execution time, resource usage, and provides optimization suggestions
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import { execSync } from "child_process";
import { writeFile, readFile, existsSync } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Performance metric schema
 */
const PerformanceMetricSchema = z.object({
	id: z.string(),
	command: z.string(),
	subcommand: z.string().optional(),
	startTime: z.number(),
	endTime: z.number(),
	duration: z.number(),
	memoryUsage: z.object({
		heapUsed: z.number(),
		heapTotal: z.number(),
		external: z.number(),
		rss: z.number(),
	}),
	cpuUsage: z.object({
		user: z.number(),
		system: z.number(),
	}).optional(),
	exitCode: z.number(),
	success: z.boolean(),
	args: z.record(z.any()),
	options: z.record(z.any()),
	metadata: z.record(z.any()).optional(),
	timestamp: z.string(),
});

export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
	readonly warningDuration: number; // milliseconds
	readonly errorDuration: number; // milliseconds
	readonly memoryWarning: number; // bytes
	readonly memoryError: number; // bytes
	readonly cpuWarning: number; // percentage
	readonly cpuError: number; // percentage
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
	readonly totalCommands: number;
	readonly averageDuration: number;
	readonly medianDuration: number;
	readonly slowestCommand: {
		readonly command: string;
		readonly duration: number;
		readonly timestamp: string;
	} | null;
	readonly fastestCommand: {
		readonly command: string;
		readonly duration: number;
		readonly timestamp: string;
	} | null;
	readonly memoryStats: {
		readonly average: number;
		readonly peak: number;
		readonly current: number;
	};
	readonly errorRate: number;
	readonly commandFrequency: Record<string, number>;
	readonly timeDistribution: {
		readonly under100ms: number;
		readonly under500ms: number;
		readonly under1s: number;
		readonly under5s: number;
		readonly over5s: number;
	};
}

/**
 * Performance recommendation
 */
export interface PerformanceRecommendation {
	readonly type: 'optimization' | 'warning' | 'error';
	readonly category: 'memory' | 'cpu' | 'duration' | 'frequency';
	readonly title: string;
	readonly description: string;
	readonly suggestion: string;
	readonly impact: 'low' | 'medium' | 'high';
	readonly effort: 'low' | 'medium' | 'high';
}

/**
 * Active performance measurement session
 */
export interface PerformanceSession {
	readonly id: string;
	readonly command: string;
	readonly startTime: number;
	readonly startMemory: NodeJS.MemoryUsage;
	readonly startCpuUsage?: NodeJS.CpuUsage;
	readonly args: Record<string, any>;
	readonly options: Record<string, any>;
}

/**
 * CLI Performance Monitoring System
 */
export class PerformanceMonitor extends EventEmitter {
	private readonly metricsPath: string;
	private readonly maxMetrics: number;
	private metrics: Map<string, PerformanceMetric> = new Map();
	private activeSessions: Map<string, PerformanceSession> = new Map();
	private thresholds: PerformanceThresholds;
	private monitoringEnabled: boolean = true;
	private backgroundIntervalId?: NodeJS.Timeout;

	constructor(projectPath: string, options: {
		readonly maxMetrics?: number;
		readonly thresholds?: Partial<PerformanceThresholds>;
		readonly enableBackgroundMonitoring?: boolean;
	} = {}) {
		super();
		this.metricsPath = join(projectPath, ".xaheen", "performance.json");
		this.maxMetrics = options.maxMetrics ?? 1000;
		this.thresholds = {
			warningDuration: 2000, // 2 seconds
			errorDuration: 10000, // 10 seconds
			memoryWarning: 100 * 1024 * 1024, // 100MB
			memoryError: 500 * 1024 * 1024, // 500MB
			cpuWarning: 80, // 80%
			cpuError: 95, // 95%
			...options.thresholds,
		};

		if (options.enableBackgroundMonitoring !== false) {
			this.startBackgroundMonitoring();
		}
	}

	/**
	 * Initialize performance monitoring
	 */
	public async initialize(): Promise<void> {
		try {
			await this.loadMetrics();
			logger.info(`Performance monitoring initialized with ${this.metrics.size} historical metrics`);
		} catch (error) {
			logger.error("Failed to initialize performance monitoring:", error);
			throw error;
		}
	}

	/**
	 * Start measuring command performance
	 */
	public startMeasurement(
		command: string,
		args: Record<string, any> = {},
		options: Record<string, any> = {}
	): string {
		const sessionId = this.generateSessionId();
		const startTime = performance.now();
		const startMemory = process.memoryUsage();
		const startCpuUsage = process.cpuUsage();

		const session: PerformanceSession = {
			id: sessionId,
			command,
			startTime,
			startMemory,
			startCpuUsage,
			args,
			options,
		};

		this.activeSessions.set(sessionId, session);
		this.emit('measurementStarted', sessionId, command);

		logger.debug(`Started performance measurement for ${command} (${sessionId})`);
		return sessionId;
	}

	/**
	 * End measurement and record metric
	 */
	public async endMeasurement(
		sessionId: string,
		exitCode: number = 0,
		metadata?: Record<string, any>
	): Promise<PerformanceMetric | null> {
		const session = this.activeSessions.get(sessionId);
		if (!session) {
			logger.warn(`Performance session ${sessionId} not found`);
			return null;
		}

		const endTime = performance.now();
		const endMemory = process.memoryUsage();
		const endCpuUsage = process.cpuUsage(session.startCpuUsage);
		const duration = endTime - session.startTime;

		const metric: PerformanceMetric = {
			id: sessionId,
			command: session.command,
			startTime: session.startTime,
			endTime,
			duration,
			memoryUsage: {
				heapUsed: endMemory.heapUsed - session.startMemory.heapUsed,
				heapTotal: endMemory.heapTotal - session.startMemory.heapTotal,
				external: endMemory.external - session.startMemory.external,
				rss: endMemory.rss - session.startMemory.rss,
			},
			cpuUsage: {
				user: endCpuUsage.user / 1000, // Convert to milliseconds
				system: endCpuUsage.system / 1000,
			},
			exitCode,
			success: exitCode === 0,
			args: session.args,
			options: session.options,
			metadata,
			timestamp: new Date().toISOString(),
		};

		// Store metric
		this.metrics.set(sessionId, metric);
		this.activeSessions.delete(sessionId);

		// Check thresholds and emit warnings
		this.checkThresholds(metric);

		// Clean up old metrics
		await this.cleanupMetrics();

		// Save metrics periodically
		if (this.metrics.size % 10 === 0) {
			await this.saveMetrics();
		}

		this.emit('measurementCompleted', metric);
		logger.debug(`Completed performance measurement for ${session.command}: ${duration.toFixed(2)}ms`);

		return metric;
	}

	/**
	 * Get performance statistics
	 */
	public getStatistics(): PerformanceStats {
		const metricsArray = Array.from(this.metrics.values());
		
		if (metricsArray.length === 0) {
			return {
				totalCommands: 0,
				averageDuration: 0,
				medianDuration: 0,
				slowestCommand: null,
				fastestCommand: null,
				memoryStats: {
					average: 0,
					peak: 0,
					current: process.memoryUsage().heapUsed,
				},
				errorRate: 0,
				commandFrequency: {},
				timeDistribution: {
					under100ms: 0,
					under500ms: 0,
					under1s: 0,
					under5s: 0,
					over5s: 0,
				},
			};
		}

		// Calculate durations
		const durations = metricsArray.map(m => m.duration).sort((a, b) => a - b);
		const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
		const medianDuration = durations[Math.floor(durations.length / 2)];

		// Find extremes
		const sortedByDuration = [...metricsArray].sort((a, b) => a.duration - b.duration);
		const slowestCommand = sortedByDuration[sortedByDuration.length - 1];
		const fastestCommand = sortedByDuration[0];

		// Memory statistics
		const memoryUsages = metricsArray.map(m => m.memoryUsage.heapUsed);
		const averageMemory = memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length;
		const peakMemory = Math.max(...memoryUsages);

		// Error rate
		const failedCommands = metricsArray.filter(m => !m.success).length;
		const errorRate = (failedCommands / metricsArray.length) * 100;

		// Command frequency
		const commandFrequency: Record<string, number> = {};
		metricsArray.forEach(m => {
			commandFrequency[m.command] = (commandFrequency[m.command] || 0) + 1;
		});

		// Time distribution
		const timeDistribution = {
			under100ms: durations.filter(d => d < 100).length,
			under500ms: durations.filter(d => d >= 100 && d < 500).length,
			under1s: durations.filter(d => d >= 500 && d < 1000).length,
			under5s: durations.filter(d => d >= 1000 && d < 5000).length,
			over5s: durations.filter(d => d >= 5000).length,
		};

		return {
			totalCommands: metricsArray.length,
			averageDuration,
			medianDuration,
			slowestCommand: slowestCommand ? {
				command: slowestCommand.command,
				duration: slowestCommand.duration,
				timestamp: slowestCommand.timestamp,
			} : null,
			fastestCommand: fastestCommand ? {
				command: fastestCommand.command,
				duration: fastestCommand.duration,
				timestamp: fastestCommand.timestamp,
			} : null,
			memoryStats: {
				average: averageMemory,
				peak: peakMemory,
				current: process.memoryUsage().heapUsed,
			},
			errorRate,
			commandFrequency,
			timeDistribution,
		};
	}

	/**
	 * Get performance recommendations
	 */
	public getRecommendations(): PerformanceRecommendation[] {
		const stats = this.getStatistics();
		const recommendations: PerformanceRecommendation[] = [];

		// Duration recommendations
		if (stats.averageDuration > this.thresholds.warningDuration) {
			recommendations.push({
				type: stats.averageDuration > this.thresholds.errorDuration ? 'error' : 'warning',
				category: 'duration',
				title: 'Slow Command Execution',
				description: `Average command execution time is ${stats.averageDuration.toFixed(0)}ms`,
				suggestion: 'Consider optimizing frequently used commands or enable caching',
				impact: 'high',
				effort: 'medium',
			});
		}

		// Memory recommendations
		if (stats.memoryStats.average > this.thresholds.memoryWarning) {
			recommendations.push({
				type: stats.memoryStats.average > this.thresholds.memoryError ? 'error' : 'warning',
				category: 'memory',
				title: 'High Memory Usage',
				description: `Average memory usage is ${(stats.memoryStats.average / 1024 / 1024).toFixed(1)}MB`,
				suggestion: 'Review memory-intensive operations and consider implementing streaming or pagination',
				impact: 'medium',
				effort: 'high',
			});
		}

		// Error rate recommendations
		if (stats.errorRate > 10) {
			recommendations.push({
				type: stats.errorRate > 25 ? 'error' : 'warning',
				category: 'frequency',
				title: 'High Error Rate',
				description: `${stats.errorRate.toFixed(1)}% of commands are failing`,
				suggestion: 'Review error logs and improve error handling and validation',
				impact: 'high',
				effort: 'medium',
			});
		}

		// Frequency recommendations
		const mostUsedCommand = Object.entries(stats.commandFrequency)
			.sort(([,a], [,b]) => b - a)[0];
		
		if (mostUsedCommand && mostUsedCommand[1] > stats.totalCommands * 0.3) {
			recommendations.push({
				type: 'optimization',
				category: 'frequency',
				title: 'Command Usage Pattern',
				description: `${mostUsedCommand[0]} accounts for ${((mostUsedCommand[1] / stats.totalCommands) * 100).toFixed(1)}% of usage`,
				suggestion: 'Consider creating aliases or shortcuts for frequently used commands',
				impact: 'medium',
				effort: 'low',
			});
		}

		return recommendations;
	}

	/**
	 * Generate performance report
	 */
	public generateReport(options: {
		readonly includeRecommendations?: boolean;
		readonly includeHistory?: boolean;
		readonly format?: 'text' | 'json' | 'markdown';
		readonly timeRange?: 'day' | 'week' | 'month' | 'all';
	} = {}): string {
		const stats = this.getStatistics();
		const format = options.format || 'text';

		if (format === 'json') {
			const report = {
				timestamp: new Date().toISOString(),
				statistics: stats,
				recommendations: options.includeRecommendations ? this.getRecommendations() : undefined,
				metrics: options.includeHistory ? Array.from(this.metrics.values()) : undefined,
			};
			return JSON.stringify(report, null, 2);
		}

		const lines: string[] = [];
		
		if (format === 'markdown') {
			lines.push('# Xaheen CLI Performance Report\\n');
			lines.push(`Generated: ${new Date().toLocaleString()}\\n`);
		} else {
			lines.push(chalk.cyan.bold('🚀 Xaheen CLI Performance Report'));
			lines.push(chalk.gray(`Generated: ${new Date().toLocaleString()}`));
			lines.push('');
		}

		// Statistics section
		if (format === 'markdown') {
			lines.push('## Performance Statistics\\n');
			lines.push(`- **Total Commands**: ${stats.totalCommands}`);
			lines.push(`- **Average Duration**: ${stats.averageDuration.toFixed(2)}ms`);
			lines.push(`- **Median Duration**: ${stats.medianDuration.toFixed(2)}ms`);
			lines.push(`- **Error Rate**: ${stats.errorRate.toFixed(1)}%`);
			lines.push(`- **Memory Usage**: ${(stats.memoryStats.average / 1024 / 1024).toFixed(1)}MB (avg)\\n`);
		} else {
			lines.push(chalk.yellow.bold('📊 Statistics:'));
			lines.push(`  Total Commands: ${chalk.green(stats.totalCommands.toString())}`);
			lines.push(`  Average Duration: ${chalk.blue(stats.averageDuration.toFixed(2) + 'ms')}`);
			lines.push(`  Median Duration: ${chalk.blue(stats.medianDuration.toFixed(2) + 'ms')}`);
			lines.push(`  Error Rate: ${stats.errorRate > 10 ? chalk.red : chalk.green}(${stats.errorRate.toFixed(1)}%)`);
			lines.push(`  Memory Usage: ${chalk.blue((stats.memoryStats.average / 1024 / 1024).toFixed(1) + 'MB')} (avg)`);
			lines.push('');
		}

		// Time distribution
		if (format === 'markdown') {
			lines.push('## Time Distribution\\n');
			lines.push(`- Under 100ms: ${stats.timeDistribution.under100ms}`);
			lines.push(`- 100ms - 500ms: ${stats.timeDistribution.under500ms}`);
			lines.push(`- 500ms - 1s: ${stats.timeDistribution.under1s}`);
			lines.push(`- 1s - 5s: ${stats.timeDistribution.under5s}`);
			lines.push(`- Over 5s: ${stats.timeDistribution.over5s}\\n`);
		} else {
			lines.push(chalk.yellow.bold('⏱️  Time Distribution:'));
			lines.push(`  Under 100ms: ${chalk.green(stats.timeDistribution.under100ms.toString())}`);
			lines.push(`  100ms - 500ms: ${chalk.blue(stats.timeDistribution.under500ms.toString())}`);
			lines.push(`  500ms - 1s: ${chalk.yellow(stats.timeDistribution.under1s.toString())}`);
			lines.push(`  1s - 5s: ${chalk.orange(stats.timeDistribution.under5s.toString())}`);
			lines.push(`  Over 5s: ${chalk.red(stats.timeDistribution.over5s.toString())}`);
			lines.push('');
		}

		// Top commands
		const topCommands = Object.entries(stats.commandFrequency)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5);

		if (topCommands.length > 0) {
			if (format === 'markdown') {
				lines.push('## Most Used Commands\\n');
				topCommands.forEach(([cmd, count]) => {
					lines.push(`- ${cmd}: ${count} times`);
				});
				lines.push('');
			} else {
				lines.push(chalk.yellow.bold('🔥 Most Used Commands:'));
				topCommands.forEach(([cmd, count]) => {
					lines.push(`  ${chalk.cyan(cmd)}: ${chalk.green(count.toString())} times`);
				});
				lines.push('');
			}
		}

		// Recommendations
		if (options.includeRecommendations) {
			const recommendations = this.getRecommendations();
			if (recommendations.length > 0) {
				if (format === 'markdown') {
					lines.push('## Recommendations\\n');
					recommendations.forEach(rec => {
						lines.push(`### ${rec.title}`);
						lines.push(`**Type**: ${rec.type.toUpperCase()}`);
						lines.push(`**Category**: ${rec.category}`);
						lines.push(`**Description**: ${rec.description}`);
						lines.push(`**Suggestion**: ${rec.suggestion}`);
						lines.push(`**Impact**: ${rec.impact} | **Effort**: ${rec.effort}\\n`);
					});
				} else {
					lines.push(chalk.yellow.bold('💡 Recommendations:'));
					recommendations.forEach(rec => {
						const typeColor = rec.type === 'error' ? chalk.red : 
										 rec.type === 'warning' ? chalk.yellow : chalk.blue;
						lines.push(`  ${typeColor(rec.type.toUpperCase())}: ${chalk.bold(rec.title)}`);
						lines.push(`    ${rec.description}`);
						lines.push(`    💡 ${rec.suggestion}`);
						lines.push(`    Impact: ${rec.impact} | Effort: ${rec.effort}`);
						lines.push('');
					});
				}
			}
		}

		return lines.join('\\n');
	}

	/**
	 * Clear performance metrics
	 */
	public async clearMetrics(): Promise<number> {
		const count = this.metrics.size;
		this.metrics.clear();
		await this.saveMetrics();
		
		logger.info(`Cleared ${count} performance metrics`);
		return count;
	}

	/**
	 * Disable performance monitoring
	 */
	public disable(): void {
		this.monitoringEnabled = false;
		if (this.backgroundIntervalId) {
			clearInterval(this.backgroundIntervalId);
			this.backgroundIntervalId = undefined;
		}
		logger.info('Performance monitoring disabled');
	}

	/**
	 * Enable performance monitoring
	 */
	public enable(): void {
		this.monitoringEnabled = true;
		this.startBackgroundMonitoring();
		logger.info('Performance monitoring enabled');
	}

	// Private methods

	private generateSessionId(): string {
		return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
	}

	private checkThresholds(metric: PerformanceMetric): void {
		const warnings: string[] = [];

		// Duration thresholds
		if (metric.duration > this.thresholds.errorDuration) {
			warnings.push(`Command took ${metric.duration.toFixed(0)}ms (exceeds error threshold)`);
		} else if (metric.duration > this.thresholds.warningDuration) {
			warnings.push(`Command took ${metric.duration.toFixed(0)}ms (exceeds warning threshold)`);
		}

		// Memory thresholds
		if (metric.memoryUsage.heapUsed > this.thresholds.memoryError) {
			warnings.push(`High memory usage: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
		} else if (metric.memoryUsage.heapUsed > this.thresholds.memoryWarning) {
			warnings.push(`Elevated memory usage: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
		}

		if (warnings.length > 0) {
			this.emit('thresholdExceeded', metric, warnings);
			logger.warn(`Performance thresholds exceeded for ${metric.command}:`, warnings);
		}
	}

	private async cleanupMetrics(): Promise<void> {
		if (this.metrics.size <= this.maxMetrics) {
			return;
		}

		// Remove oldest metrics
		const sortedMetrics = Array.from(this.metrics.entries())
			.sort(([,a], [,b]) => a.startTime - b.startTime);

		const toRemove = sortedMetrics.slice(0, sortedMetrics.length - this.maxMetrics);
		toRemove.forEach(([id]) => this.metrics.delete(id));

		logger.debug(`Cleaned up ${toRemove.length} old performance metrics`);
	}

	private async loadMetrics(): Promise<void> {
		try {
			if (existsSync(this.metricsPath)) {
				const content = await readFile(this.metricsPath, 'utf8');
				const data = JSON.parse(content);
				
				if (data.metrics && Array.isArray(data.metrics)) {
					for (const metric of data.metrics) {
						try {
							const validMetric = PerformanceMetricSchema.parse(metric);
							this.metrics.set(validMetric.id, validMetric);
						} catch (error) {
							logger.warn('Invalid metric found, skipping:', error);
						}
					}
				}
			}
		} catch (error) {
			logger.warn('Failed to load performance metrics:', error);
		}
	}

	private async saveMetrics(): Promise<void> {
		try {
			const data = {
				version: '1.0.0',
				lastUpdated: new Date().toISOString(),
				metrics: Array.from(this.metrics.values()),
			};
			
			await writeFile(this.metricsPath, JSON.stringify(data, null, 2));
		} catch (error) {
			logger.warn('Failed to save performance metrics:', error);
		}
	}

	private startBackgroundMonitoring(): void {
		if (this.backgroundIntervalId) {
			clearInterval(this.backgroundIntervalId);
		}

		// Monitor every 30 seconds
		this.backgroundIntervalId = setInterval(() => {
			if (!this.monitoringEnabled) return;

			const currentMemory = process.memoryUsage();
			
			// Emit memory warnings if needed
			if (currentMemory.heapUsed > this.thresholds.memoryWarning) {
				this.emit('memoryWarning', currentMemory);
			}

			// Clean up completed sessions that were never ended
			const now = performance.now();
			for (const [sessionId, session] of this.activeSessions) {
				if (now - session.startTime > 300000) { // 5 minutes
					logger.warn(`Cleaning up stale performance session: ${sessionId}`);
					this.activeSessions.delete(sessionId);
				}
			}
		}, 30000);
	}
}

/**
 * Default export
 */
export default PerformanceMonitor;
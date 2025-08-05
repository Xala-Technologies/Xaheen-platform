#!/usr/bin/env tsx
/**
 * @fileoverview Parallel Test Execution Script - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Advanced test execution script with parallel orchestration and detailed reporting
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ParallelTestOrchestrator, type TestExecutionStrategy } from '../src/test/config/parallel-test-config';
import { testReportGenerator } from '../src/test/reports/test-report-generator';

interface TestExecutionOptions {
  strategy: TestExecutionStrategy;
  category?: string;
  watch?: boolean;
  coverage?: boolean;
  reporter?: 'default' | 'verbose' | 'json' | 'junit' | 'html';
  bail?: boolean;
  retry?: number;
  timeout?: number;
  maxWorkers?: number;
  generateReport?: boolean;
  outputDir?: string;
}

class ParallelTestRunner {
  private orchestrator: ParallelTestOrchestrator;
  private startTime: Date;
  private results: Array<{
    category: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    tests: number;
    failures: number;
    coverage?: number;
  }> = [];

  constructor(options: TestExecutionOptions) {
    this.orchestrator = new ParallelTestOrchestrator(options.strategy, {
      maxWorkers: options.maxWorkers,
      testTimeout: options.timeout,
      retry: options.retry,
      bail: options.bail ? 1 : 0,
    });
    this.startTime = new Date();
  }

  /**
   * Execute tests with parallel orchestration
   */
  async run(options: TestExecutionOptions): Promise<void> {
    console.log('🚀 Starting parallel test execution...');
    console.log(`📊 Strategy: ${options.strategy}`);
    console.log(`⚡ Max Workers: ${this.orchestrator['config'].maxWorkers}`);
    
    try {
      // Get execution plan
      const executionPlan = this.orchestrator.getExecutionPlan();
      console.log(`📋 Execution Plan: ${executionPlan.phases.length} phases`);
      console.log(`⏱️  Estimated Duration: ${Math.round(executionPlan.totalEstimatedDuration / 1000)}s`);

      // Start resource monitoring
      this.startResourceMonitoring();

      // Execute tests by category if specified, otherwise run all phases
      if (options.category) {
        await this.runCategory(options.category, options);
      } else {
        await this.runAllPhases(executionPlan, options);
      }

      // Generate comprehensive report
      if (options.generateReport !== false) {
        await this.generateReport(options);
      }

      // Summary
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run a specific test category
   */
  private async runCategory(category: string, options: TestExecutionOptions): Promise<void> {
    const commands = this.orchestrator.generateExecutionCommands();
    const command = commands[category];
    
    if (!command) {
      console.error(`❌ Unknown test category: ${category}`);
      console.log(`📋 Available categories: ${Object.keys(commands).join(', ')}`);
      process.exit(1);
    }

    console.log(`🎯 Running category: ${category}`);
    await this.executeCommand(category, command, options);
  }

  /**
   * Run all test phases in sequence
   */
  private async runAllPhases(executionPlan: any, options: TestExecutionOptions): Promise<void> {
    for (const phase of executionPlan.phases) {
      console.log(`\n📋 Phase: ${phase.name}`);
      console.log(`🔧 Categories: ${phase.categories.map(c => c.name).join(', ')}`);
      console.log(`⚡ Parallelism: ${phase.parallelism}`);
      console.log(`⏱️  Estimated: ${Math.round(phase.estimatedDuration / 1000)}s`);

      // Run categories in this phase
      const commands = this.orchestrator.generateExecutionCommands();
      const phasePromises = phase.categories.map(async (category: any) => {
        const command = commands[category.name];
        if (command) {
          return this.executeCommand(category.name, command, options);
        }
      });

      // Wait for all categories in this phase to complete
      await Promise.all(phasePromises.filter(Boolean));
    }
  }

  /**
   * Execute a test command
   */
  private async executeCommand(
    category: string, 
    command: string, 
    options: TestExecutionOptions
  ): Promise<void> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      // Build full command with options
      let fullCommand = command;
      
      if (options.coverage) {
        fullCommand += ' --coverage';
      }
      
      if (options.watch) {
        fullCommand += ' --watch';
      }
      
      if (options.reporter && options.reporter !== 'default') {
        fullCommand += ` --reporter=${options.reporter}`;
      }

      console.log(`🏃 Executing: ${category}`);
      console.log(`📝 Command: ${fullCommand}`);

      const child = spawn('npx', fullCommand.split(' '), {
        stdio: 'pipe',
        shell: true,
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        // Stream output in real-time for verbose mode
        if (options.reporter === 'verbose') {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (options.reporter === 'verbose') {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = {
          category,
          status: code === 0 ? 'passed' as const : 'failed' as const,
          duration,
          tests: this.extractTestCount(stdout),
          failures: this.extractFailureCount(stdout),
          coverage: this.extractCoverage(stdout),
        };

        this.results.push(result);

        if (code === 0) {
          console.log(`✅ ${category} completed in ${Math.round(duration / 1000)}s`);
          resolve();
        } else {
          console.error(`❌ ${category} failed after ${Math.round(duration / 1000)}s`);
          if (stderr) {
            console.error('Error output:', stderr);
          }
          
          if (options.bail) {
            reject(new Error(`Test category ${category} failed`));
          } else {
            resolve(); // Continue with other tests
          }
        }
      });

      child.on('error', (error) => {
        console.error(`❌ Failed to start ${category}:`, error);
        this.results.push({
          category,
          status: 'failed',
          duration: Date.now() - startTime,
          tests: 0,
          failures: 1,
        });
        
        if (options.bail) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Start resource monitoring
   */
  private startResourceMonitoring(): void {
    this.orchestrator.monitorResourceUsage((usage) => {
      // Log resource usage periodically (every 30 seconds)
      const memoryMB = Math.round(usage.memory.used / 1024 / 1024);
      const cpuPercent = Math.round((usage.cpu.user + usage.cpu.system) / 10000);
      
      if (Date.now() % 30000 < 1000) { // Approximately every 30 seconds
        console.log(`📊 Resources: ${memoryMB}MB memory, ${cpuPercent}% CPU`);
      }
    });
  }

  /**
   * Generate comprehensive test report
   */
  private async generateReport(options: TestExecutionOptions): Promise<void> {
    console.log('\n📊 Generating test reports...');
    
    const outputDir = options.outputDir || join(process.cwd(), 'test-reports');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate reports
    const reportOptions = {
      projectName: 'Xaheen CLI Test Suite',
      outputDir,
      includeSourceMaps: true,
      includePerformanceMetrics: true,
      includeComplianceInfo: true,
      locale: 'en',
    };

    try {
      // HTML Report
      await testReportGenerator.generateHTMLReport(
        this.results,
        join(outputDir, 'test-report.html'),
        reportOptions
      );
      console.log(`✅ HTML report: ${join(outputDir, 'test-report.html')}`);

      // JSON Report
      await testReportGenerator.generateJSONReport(
        this.results,
        join(outputDir, 'test-report.json'),
        reportOptions
      );
      console.log(`✅ JSON report: ${join(outputDir, 'test-report.json')}`);

      // JUnit XML Report
      await testReportGenerator.generateJUnitXMLReport(
        this.results,
        join(outputDir, 'junit.xml'),
        reportOptions
      );
      console.log(`✅ JUnit XML report: ${join(outputDir, 'junit.xml')}`);

      // Performance Report
      await testReportGenerator.generatePerformanceReport(
        this.results,
        join(outputDir, 'performance-report.html'),
        reportOptions
      );
      console.log(`✅ Performance report: ${join(outputDir, 'performance-report.html')}`);

      // Compliance Report
      await testReportGenerator.generateComplianceReport(
        this.results,
        join(outputDir, 'compliance-report.html'),
        reportOptions
      );
      console.log(`✅ Compliance report: ${join(outputDir, 'compliance-report.html')}`);

    } catch (error) {
      console.warn('⚠️  Failed to generate some reports:', error);
    }
  }

  /**
   * Print execution summary
   */
  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime.getTime();
    const totalTests = this.results.reduce((sum, r) => sum + r.tests, 0);
    const totalFailures = this.results.reduce((sum, r) => sum + r.failures, 0);
    const passedCategories = this.results.filter(r => r.status === 'passed').length;
    const failedCategories = this.results.filter(r => r.status === 'failed').length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`📋 Categories: ${passedCategories} passed, ${failedCategories} failed`);
    console.log(`🧪 Tests: ${totalTests} total, ${totalFailures} failures`);
    console.log(`✅ Success Rate: ${Math.round(((totalTests - totalFailures) / totalTests) * 100)}%`);

    // Category breakdown
    console.log('\n📋 Category Results:');
    for (const result of this.results) {
      const status = result.status === 'passed' ? '✅' : '❌';
      const duration = Math.round(result.duration / 1000);
      console.log(`${status} ${result.category}: ${result.tests} tests, ${result.failures} failures (${duration}s)`);
    }

    console.log('='.repeat(60));
    
    if (failedCategories > 0) {
      console.log('❌ Some test categories failed. Check the detailed reports for more information.');
      process.exit(1);
    } else {
      console.log('🎉 All test categories passed successfully!');
    }
  }

  // Utility methods for parsing test output
  private extractTestCount(output: string): number {
    const match = output.match(/(\d+) passed/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractFailureCount(output: string): number {
    const match = output.match(/(\d+) failed/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractCoverage(output: string): number | undefined {
    const match = output.match(/All files\s+\|\s+([\d.]+)/);
    return match ? parseFloat(match[1]) : undefined;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options: TestExecutionOptions = {
    strategy: 'adaptive',
    generateReport: true,
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--strategy':
        options.strategy = args[++i] as TestExecutionStrategy;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--reporter':
        options.reporter = args[++i] as any;
        break;
      case '--bail':
        options.bail = true;
        break;
      case '--retry':
        options.retry = parseInt(args[++i]);
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--max-workers':
        options.maxWorkers = parseInt(args[++i]);
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }

  const runner = new ParallelTestRunner(options);
  await runner.run(options);
}

function printHelp() {
  console.log(`
🧪 Parallel Test Runner - Xaheen CLI

USAGE:
  npm run test:parallel [OPTIONS]

OPTIONS:
  --strategy <strategy>     Test execution strategy (aggressive-parallel, conservative-parallel, sequential, adaptive)
  --category <category>     Run specific test category only
  --watch                   Run in watch mode
  --coverage                Generate coverage report
  --reporter <reporter>     Reporter type (default, verbose, json, junit, html)
  --bail                    Stop on first failure
  --retry <count>           Number of retries for failed tests
  --timeout <ms>            Test timeout in milliseconds
  --max-workers <count>     Maximum number of parallel workers
  --no-report               Skip report generation
  --output-dir <dir>        Output directory for reports
  --help                    Show this help message

EXAMPLES:
  npm run test:parallel                                    # Run all tests with adaptive strategy
  npm run test:parallel -- --strategy aggressive-parallel # Run with aggressive parallelism
  npm run test:parallel -- --category unit-tests          # Run only unit tests
  npm run test:parallel -- --coverage --reporter verbose  # Run with coverage and verbose output
  npm run test:parallel -- --watch --category mcp-unit-tests # Watch MCP unit tests

TEST CATEGORIES:
  unit-tests                 Basic unit tests
  mcp-unit-tests            MCP client unit tests
  frontend-unit-tests       Frontend generator unit tests
  integration-tests         Integration tests
  mcp-integration-tests     MCP workflow integration tests
  frontend-integration-tests Frontend browser integration tests
  e2e-tests                 End-to-end tests
  performance-tests         Performance and benchmark tests
  error-scenario-tests      Error scenario tests
  `);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { ParallelTestRunner, type TestExecutionOptions };
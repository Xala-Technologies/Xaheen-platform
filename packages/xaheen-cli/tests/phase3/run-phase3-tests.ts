#!/usr/bin/env node

/**
 * Phase 3 Test Runner
 * Orchestrates multi-package-manager testing suite
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { 
  detectPackageManagers, 
  isPackageManagerAvailable 
} from './utils/package-manager-utils';
import { TEST_ENV, PACKAGE_MANAGERS } from './config/test-config';

interface TestResult {
  readonly suite: string;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly duration: number;
  readonly success: boolean;
}

interface TestRunnerOptions {
  readonly verbose?: boolean;
  readonly filter?: string;
  readonly packageManager?: string;
  readonly timeout?: number;
  readonly parallel?: boolean;
  readonly reporter?: 'default' | 'verbose' | 'json' | 'minimal';
  readonly outputDir?: string;
}

class Phase3TestRunner {
  private options: TestRunnerOptions;
  private results: TestResult[] = [];
  private startTime = 0;
  
  constructor(options: TestRunnerOptions = {}) {
    this.options = {
      verbose: false,
      timeout: TEST_ENV.testTimeout,
      parallel: true,
      reporter: 'default',
      outputDir: join(TEST_ENV.tmpDir, 'test-results'),
      ...options,
    };
  }
  
  async run(): Promise<void> {
    this.startTime = Date.now();
    
    console.log('🚀 Starting Phase 3: Multi-Package-Manager Support Tests');
    console.log('=' .repeat(60));
    
    try {
      // Setup
      await this.setup();
      
      // Run test suites
      await this.runTestSuites();
      
      // Generate reports
      await this.generateReports();
      
      // Summary
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Test run failed:', error);
      process.exit(1);
    }
  }
  
  private async setup(): Promise<void> {
    console.log('🔧 Setting up test environment...');
    
    // Create output directory
    if (!existsSync(this.options.outputDir!)) {
      await mkdir(this.options.outputDir!, { recursive: true });
    }
    
    // Detect available package managers
    const detection = await detectPackageManagers();
    console.log(`📦 Detected ${detection.available.length} package managers:`);
    
    for (const manager of detection.available) {
      const version = detection.versions[manager];
      console.log(`   ✅ ${manager}: ${version}`);
    }
    
    if (detection.available.length === 0) {
      throw new Error('No package managers detected');
    }
    
    // Check for missing managers (for completeness)
    const allManagers = PACKAGE_MANAGERS.map(pm => pm.name);
    const missing = allManagers.filter(manager => !detection.available.includes(manager));
    
    if (missing.length > 0) {
      console.log('⚠️  Missing package managers (tests will be skipped):');
      for (const manager of missing) {
        console.log(`   ❌ ${manager}`);
      }
    }
    
    console.log('✅ Setup complete\n');
  }
  
  private async runTestSuites(): Promise<void> {
    const suites = this.getTestSuites();
    
    console.log(`🧪 Running ${suites.length} test suites...`);
    
    if (this.options.parallel) {
      await this.runSuitesInParallel(suites);
    } else {
      await this.runSuitesSequentially(suites);
    }
  }
  
  private getTestSuites(): Array<{ name: string; path: string; description: string }> {
    const suites = [
      {
        name: 'environment-detection',
        path: 'environment-detection/**/*.test.ts',
        description: 'Package manager detection and version compatibility',
      },
      {
        name: 'integration',
        path: 'integration/**/*.test.ts',
        description: 'Full workflow integration tests for each package manager',
      },
      {
        name: 'edge-cases',
        path: 'edge-cases/**/*.test.ts',
        description: 'Lockfile scenarios, monorepos, and mixed environments',
      },
      {
        name: 'environment-variables',
        path: 'environment-variables/**/*.test.ts',
        description: 'XAHEEN_PKG_MANAGER override and precedence rules',
      },
    ];
    
    // Filter suites if specified
    if (this.options.filter) {
      return suites.filter(suite => 
        suite.name.includes(this.options.filter!) ||
        suite.description.toLowerCase().includes(this.options.filter!.toLowerCase())
      );
    }
    
    return suites;
  }
  
  private async runSuitesInParallel(suites: Array<{ name: string; path: string; description: string }>): Promise<void> {
    console.log('⚡ Running suites in parallel...\n');
    
    const promises = suites.map(suite => this.runSuite(suite));
    const results = await Promise.allSettled(promises);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.push(result.value);
      } else {
        console.error(`❌ Suite ${suites[index].name} failed:`, result.reason);
        this.results.push({
          suite: suites[index].name,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: 0,
          success: false,
        });
      }
    });
  }
  
  private async runSuitesSequentially(suites: Array<{ name: string; path: string; description: string }>): Promise<void> {
    console.log('🔄 Running suites sequentially...\n');
    
    for (const suite of suites) {
      try {
        const result = await this.runSuite(suite);
        this.results.push(result);
      } catch (error) {
        console.error(`❌ Suite ${suite.name} failed:`, error);
        this.results.push({
          suite: suite.name,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: 0,
          success: false,
        });
      }
    }
  }
  
  private async runSuite(suite: { name: string; path: string; description: string }): Promise<TestResult> {
    const startTime = Date.now();
    
    console.log(`🧪 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);
    
    const result = await this.executeVitest(suite.path);
    const duration = Date.now() - startTime;
    
    const testResult: TestResult = {
      ...result,
      suite: suite.name,
      duration,
    };
    
    this.logSuiteResult(testResult);
    
    return testResult;
  }
  
  private async executeVitest(testPath: string): Promise<Omit<TestResult, 'suite' | 'duration'>> {
    return new Promise((resolve, reject) => {
      const vitestArgs = [
        'vitest',
        'run',
        testPath,
        '--config', './config/vitest.config.ts',
        '--reporter', this.options.reporter === 'verbose' ? 'verbose' : 'basic',
      ];
      
      if (this.options.timeout) {
        vitestArgs.push('--testTimeout', this.options.timeout.toString());
      }
      
      const child = spawn('npx', vitestArgs, {
        cwd: __dirname,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });
      
      let stdout = '';
      let stderr = '';
      
      if (!this.options.verbose) {
        child.stdout?.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
        
        child.stderr?.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      }
      
      child.on('close', (code) => {
        if (code === 0) {
          // Parse test results from output
          const result = this.parseTestOutput(stdout);
          resolve(result);
        } else {
          reject(new Error(`Vitest exited with code ${code}\n${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }
  
  private parseTestOutput(output: string): Omit<TestResult, 'suite' | 'duration'> {
    // Parse vitest output to extract test counts
    // This is a simplified parser - in practice you'd want more robust parsing
    
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const skippedMatch = output.match(/(\d+) skipped/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
    
    return {
      passed,
      failed,
      skipped,
      success: failed === 0,
    };
  }
  
  private logSuiteResult(result: TestResult): void {
    const status = result.success ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    
    console.log(`${status} ${result.suite} (${duration}s)`);
    console.log(`   Passed: ${result.passed}, Failed: ${result.failed}, Skipped: ${result.skipped}`);
    
    if (!result.success && this.options.verbose) {
      console.log(`   ⚠️  Suite failed - check detailed logs above`);
    }
    
    console.log('');
  }
  
  private async generateReports(): Promise<void> {
    console.log('📊 Generating reports...');
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      options: this.options,
      results: this.results,
      summary: {
        totalSuites: this.results.length,
        successfulSuites: this.results.filter(r => r.success).length,
        failedSuites: this.results.filter(r => !r.success).length,
        totalTests: this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalSkipped: this.results.reduce((sum, r) => sum + r.skipped, 0),
      },
    };
    
    // Save JSON report
    const jsonReportPath = join(this.options.outputDir!, 'phase3-test-report.json');
    await writeFile(jsonReportPath, JSON.stringify(report, null, 2));
    
    // Save summary report
    const summaryPath = join(this.options.outputDir!, 'phase3-summary.txt');
    const summaryContent = this.generateSummaryReport(report);
    await writeFile(summaryPath, summaryContent);
    
    console.log(`   📄 JSON report: ${jsonReportPath}`);
    console.log(`   📄 Summary: ${summaryPath}`);
    console.log('');
  }
  
  private generateSummaryReport(report: any): string {
    const lines = [
      'Phase 3: Multi-Package-Manager Support - Test Report',
      '=' .repeat(55),
      '',
      `Timestamp: ${report.timestamp}`,
      `Duration: ${(report.duration / 1000).toFixed(2)}s`,
      `Node.js: ${report.environment.nodeVersion}`,
      `Platform: ${report.environment.platform} ${report.environment.arch}`,
      '',
      'Summary:',
      `  Total Suites: ${report.summary.totalSuites}`,
      `  Successful: ${report.summary.successfulSuites}`,
      `  Failed: ${report.summary.failedSuites}`,
      `  Total Tests: ${report.summary.totalTests}`,
      `  Passed: ${report.summary.totalPassed}`,
      `  Failed: ${report.summary.totalFailed}`,
      `  Skipped: ${report.summary.totalSkipped}`,
      '',
      'Suite Results:',
    ];
    
    for (const result of report.results) {
      const status = result.success ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      lines.push(`  ${status} ${result.suite} (${duration}s)`);
      lines.push(`     Passed: ${result.passed}, Failed: ${result.failed}, Skipped: ${result.skipped}`);
    }
    
    return lines.join('\n');
  }
  
  private printSummary(): void {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    const successfulSuites = this.results.filter(r => r.success).length;
    const totalSuites = this.results.length;
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    
    console.log('🏁 Phase 3 Test Run Complete');
    console.log('=' .repeat(40));
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`📊 Suites: ${successfulSuites}/${totalSuites} successful`);
    console.log(`🧪 Tests: ${totalPassed}/${totalTests} passed`);
    
    if (totalFailed > 0) {
      console.log(`❌ ${totalFailed} tests failed`);
    }
    
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0';
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (successfulSuites === totalSuites && totalFailed === 0) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed');
      process.exit(1);
    }
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: TestRunnerOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--filter':
      case '-f':
        options.filter = args[++i];
        break;
        
      case '--package-manager':
      case '-p':
        options.packageManager = args[++i];
        break;
        
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]);
        break;
        
      case '--sequential':
        options.parallel = false;
        break;
        
      case '--reporter':
      case '-r':
        options.reporter = args[++i] as any;
        break;
        
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
        
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }
  
  const runner = new Phase3TestRunner(options);
  await runner.run();
}

function printHelp(): void {
  console.log(`
Phase 3 Test Runner - Multi-Package-Manager Support

Usage: node run-phase3-tests.ts [options]

Options:
  -v, --verbose          Enable verbose output
  -f, --filter <pattern> Filter test suites by name or description
  -p, --package-manager  Filter tests for specific package manager
  -t, --timeout <ms>     Set test timeout in milliseconds
  --sequential           Run test suites sequentially (default: parallel)
  -r, --reporter <type>  Reporter type (default|verbose|json|minimal)
  -o, --output <dir>     Output directory for reports
  -h, --help             Show this help message

Examples:
  node run-phase3-tests.ts --verbose
  node run-phase3-tests.ts --filter integration
  node run-phase3-tests.ts --package-manager pnpm
  node run-phase3-tests.ts --sequential --timeout 60000
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { Phase3TestRunner, TestRunnerOptions, TestResult };
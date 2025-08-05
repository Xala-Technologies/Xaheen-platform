#!/usr/bin/env bun

/**
 * Phase 5 Test Runner - Frontend-Backend Integration Testing
 * 
 * This script orchestrates the execution of all Phase 5 integration tests,
 * including monorepo setup, service generation, and E2E full-stack testing.
 */

import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

interface TestSuite {
  name: string;
  description: string;
  command: string;
  timeout: number;
  parallel: boolean;
  dependencies?: string[];
}

interface TestResults {
  suite: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'monorepo-setup',
    description: 'Monorepo workspace setup and integration tests',
    command: 'bun test integration/monorepo-setup.test.ts',
    timeout: 300000, // 5 minutes
    parallel: false,
  },
  {
    name: 'service-generation',
    description: 'API client and service generation tests',
    command: 'bun test integration/service-generation.test.ts',
    timeout: 180000, // 3 minutes
    parallel: false,
    dependencies: ['monorepo-setup'],
  },
  {
    name: 'api-client-integration',
    description: 'Generated API client integration and validation tests',
    command: 'bun test integration/api-client-integration.test.ts',
    timeout: 240000, // 4 minutes
    parallel: false,
    dependencies: ['service-generation'],
  },
  {
    name: 'fullstack-crud-e2e',
    description: 'Full-stack CRUD operations E2E tests with Playwright',
    command: 'bun exec playwright test e2e/fullstack-crud.test.ts',
    timeout: 600000, // 10 minutes
    parallel: false,
    dependencies: ['api-client-integration'],
  },
  {
    name: 'auth-flow-e2e',
    description: 'Authentication flow E2E tests',
    command: 'bun exec playwright test e2e/auth-flow.test.ts',
    timeout: 480000, // 8 minutes
    parallel: false,
    dependencies: ['fullstack-crud-e2e'],
  },
];

class Phase5TestRunner {
  private results: TestResults[] = [];
  private startTime: number = 0;
  private verbose: boolean = false;
  private parallel: boolean = false;
  private suiteFilter?: string;

  constructor(options: {
    verbose?: boolean;
    parallel?: boolean;
    suite?: string;
  } = {}) {
    this.verbose = options.verbose || false;
    this.parallel = options.parallel || false;
    this.suiteFilter = options.suite;
  }

  async run(): Promise<{ success: boolean; results: TestResults[] }> {
    this.startTime = Date.now();
    
    this.log('🚀 Starting Phase 5: Frontend-Backend Integration Tests');
    this.log('=' .repeat(60));
    
    try {
      // Pre-flight checks
      await this.preflightChecks();
      
      // Filter test suites if needed
      const suitesToRun = this.suiteFilter 
        ? TEST_SUITES.filter(suite => suite.name === this.suiteFilter)
        : TEST_SUITES;
      
      if (suitesToRun.length === 0) {
        throw new Error(`No test suites found matching filter: ${this.suiteFilter}`);
      }
      
      this.log(`📋 Running ${suitesToRun.length} test suites:`);
      suitesToRun.forEach(suite => {
        this.log(`   • ${suite.name}: ${suite.description}`);
      });
      this.log('');
      
      // Run test suites
      if (this.parallel && suitesToRun.every(suite => suite.parallel !== false)) {
        await this.runSuitesInParallel(suitesToRun);
      } else {
        await this.runSuitesSequentially(suitesToRun);
      }
      
      // Generate report
      const success = this.generateReport();
      
      return { success, results: this.results };
      
    } catch (error) {
      this.log(`❌ Phase 5 tests failed: ${error.message}`);
      this.log('');
      throw error;
    }
  }

  private async preflightChecks(): Promise<void> {
    this.log('🔍 Performing pre-flight checks...');
    
    // Check required tools
    const requiredTools = [
      { name: 'bun', command: 'bun --version' },
      { name: 'node', command: 'node --version' },
      { name: 'git', command: 'git --version' },
    ];
    
    for (const tool of requiredTools) {
      try {
        execSync(tool.command, { stdio: 'pipe' });
        this.log(`   ✅ ${tool.name} is available`);
      } catch (error) {
        throw new Error(`${tool.name} is not available or not working`);
      }
    }
    
    // Check if Playwright is installed
    try {
      execSync('bun exec playwright --version', { stdio: 'pipe' });
      this.log('   ✅ Playwright is available');
    } catch (error) {
      this.log('   ⚠️  Playwright not found, installing...');
      try {
        execSync('bun add -d @playwright/test', { stdio: 'inherit' });
        execSync('bun exec playwright install', { stdio: 'inherit' });
        this.log('   ✅ Playwright installed successfully');
      } catch (installError) {
        throw new Error('Failed to install Playwright');
      }
    }
    
    // Check port availability
    const requiredPorts = [3000, 3001, 8000, 8001, 8080, 8081];
    for (const port of requiredPorts) {
      try {
        execSync(`lsof -i :${port}`, { stdio: 'pipe' });
        this.log(`   ⚠️  Port ${port} is in use - tests may use alternative ports`);
      } catch {
        // Port is available, which is good
      }
    }
    
    // Check disk space (need at least 1GB for test workspace)
    const stats = await fs.statfs(os.tmpdir());
    const freeSpaceGB = (stats.bavail * stats.bsize) / (1024 * 1024 * 1024);
    if (freeSpaceGB < 1) {
      throw new Error(`Insufficient disk space: ${freeSpaceGB.toFixed(1)}GB available, need at least 1GB`);
    }
    
    this.log(`   ✅ Disk space: ${freeSpaceGB.toFixed(1)}GB available`);
    this.log('');
  }

  private async runSuitesSequentially(suites: TestSuite[]): Promise<void> {
    this.log('🔄 Running test suites sequentially...');
    this.log('');
    
    for (const suite of suites) {
      await this.runSuite(suite);
    }
  }

  private async runSuitesInParallel(suites: TestSuite[]): Promise<void> {
    this.log('⚡ Running test suites in parallel...');
    this.log('');
    
    const promises = suites.map(suite => this.runSuite(suite));
    await Promise.all(promises);
  }

  private async runSuite(suite: TestSuite): Promise<void> {
    const startTime = Date.now();
    
    this.log(`🧪 Running: ${suite.name}`);
    this.log(`   ${suite.description}`);
    
    try {
      const result = await this.executeCommand(suite.command, suite.timeout);
      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: true,
        duration,
        output: result.stdout,
      });
      
      this.log(`   ✅ Passed in ${this.formatDuration(duration)}`);
      
      if (this.verbose && result.stdout) {
        this.log('   📄 Output:');
        this.log(this.indentOutput(result.stdout));
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: false,
        duration,
        output: error.stdout || '',
        error: error.stderr || error.message,
      });
      
      this.log(`   ❌ Failed in ${this.formatDuration(duration)}`);
      this.log(`   💥 Error: ${error.message}`);
      
      if (error.stderr) {
        this.log('   📄 Error Output:');
        this.log(this.indentOutput(error.stderr));
      }
      
      if (this.verbose && error.stdout) {
        this.log('   📄 Standard Output:');
        this.log(this.indentOutput(error.stdout));
      }
    }
    
    this.log('');
  }

  private async executeCommand(command: string, timeout: number): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      const child = spawn(cmd, args, {
        cwd: path.dirname(__filename),
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          CI: process.env.CI || 'false',
          FORCE_COLOR: '1',
        },
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
      
      child.on('close', (code) => {
        clearTimeout(timeoutId);
        
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          const error = new Error(`Command failed with exit code ${code}`);
          (error as any).stdout = stdout;
          (error as any).stderr = stderr;
          reject(error);
        }
      });
      
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      });
    });
  }

  private generateReport(): boolean {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    this.log('📊 Test Results Summary');
    this.log('=' .repeat(60));
    this.log(`Total Duration: ${this.formatDuration(totalDuration)}`);
    this.log(`Total Suites: ${total}`);
    this.log(`Passed: ${passed}`);
    this.log(`Failed: ${failed}`);
    this.log('');
    
    // Detailed results
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = this.formatDuration(result.duration);
      this.log(`${status} ${result.suite} (${duration})`);
      
      if (!result.passed && result.error) {
        this.log(`   Error: ${result.error}`);
      }
    });
    
    this.log('');
    
    if (failed === 0) {
      this.log('🎉 All Phase 5 integration tests passed!');
      this.log('✨ Frontend-Backend integration is working correctly');
    } else {
      this.log(`❌ ${failed} test suite(s) failed`);
      this.log('🔧 Please check the errors above and fix the issues');
    }
    
    return failed === 0;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private indentOutput(output: string): string {
    return output
      .split('\n')
      .map(line => `      ${line}`)
      .join('\n');
  }

  private log(message: string): void {
    console.log(message);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options: any = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--parallel':
      case '-p':
        options.parallel = true;
        break;
      case '--suite':
      case '-s':
        options.suite = args[++i];
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
  
  const runner = new Phase5TestRunner(options);
  
  try {
    const { success } = await runner.run();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test runner failed:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Phase 5 Test Runner - Frontend-Backend Integration Testing

Usage: bun run-phase5-tests.ts [options]

Options:
  --verbose, -v     Enable verbose output
  --parallel, -p    Run tests in parallel (when possible)
  --suite, -s       Run specific test suite only
  --help, -h        Show this help message

Available Test Suites:
  monorepo-setup           Monorepo workspace setup tests
  service-generation       API client generation tests  
  api-client-integration   Generated client integration tests
  fullstack-crud-e2e       Full-stack CRUD E2E tests
  auth-flow-e2e           Authentication flow E2E tests

Examples:
  bun run-phase5-tests.ts
  bun run-phase5-tests.ts --verbose
  bun run-phase5-tests.ts --suite monorepo-setup
  bun run-phase5-tests.ts --parallel --verbose
`);
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { Phase5TestRunner, TEST_SUITES };
#!/usr/bin/env bun

/**
 * Quick Bun Test Runner - Runs Only Available Tests
 * 
 * This script discovers and runs only the test files that actually exist,
 * with proper mocking and error handling.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob';

interface TestFile {
  readonly path: string;
  readonly phase: string;
  readonly category: string;
}

interface TestResult {
  readonly file: string;
  readonly passed: boolean;
  readonly tests: number;
  readonly failures: number;
  readonly duration: number;
  readonly error?: string;
}

// Mock setup for dependencies
const MOCK_SETUP = `
// Mock problematic imports
import { mock } from 'bun:test';

// Mock @xala-technologies/xala-mcp
mock.module('@xala-technologies/xala-mcp', () => ({
  MCPServer: class MockMCPServer {
    constructor() {}
    start() { return Promise.resolve(); }
    stop() { return Promise.resolve(); }
  },
  MCPClient: class MockMCPClient {
    constructor() {}
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
  },
  generateComponent: () => Promise.resolve({ success: true }),
  generateLayout: () => Promise.resolve({ success: true }),
  generatePage: () => Promise.resolve({ success: true }),
}));

// Mock other potentially problematic modules
mock.module('playwright', () => ({
  chromium: { launch: () => Promise.resolve({ close: () => {} }) },
  firefox: { launch: () => Promise.resolve({ close: () => {} }) },
  webkit: { launch: () => Promise.resolve({ close: () => {} }) },
}));

mock.module('@opentelemetry/api', () => ({
  trace: { getTracer: () => ({}) },
  metrics: { getMeter: () => ({}) },
}));
`;

async function discoverTestFiles(): Promise<TestFile[]> {
  const testFiles: TestFile[] = [];
  const baseDir = __dirname;

  // Find all test files
  const patterns = [
    'phase*/unit/**/*.test.ts',
    'phase*/integration/**/*.test.ts',
    'phase*/e2e/**/*.test.ts',
    'phase*/performance/**/*.test.ts',
    'phase*/**/*.test.ts',
  ];

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: baseDir,
      absolute: false,
      ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    });

    for (const file of files) {
      const match = file.match(/phase(\d+)\/([\w-]+)\//);
      if (match) {
        testFiles.push({
          path: file,
          phase: `phase${match[1]}`,
          category: match[2],
        });
      } else {
        // Handle files directly in phase directories
        const phaseMatch = file.match(/phase(\d+)\//);
        if (phaseMatch) {
          testFiles.push({
            path: file,
            phase: `phase${phaseMatch[1]}`,
            category: 'root',
          });
        }
      }
    }
  }

  // Remove duplicates
  const uniqueFiles = Array.from(
    new Map(testFiles.map(f => [f.path, f])).values()
  );

  return uniqueFiles.sort((a, b) => {
    // Sort by phase number, then by path
    const phaseA = parseInt(a.phase.replace('phase', ''));
    const phaseB = parseInt(b.phase.replace('phase', ''));
    if (phaseA !== phaseB) return phaseA - phaseB;
    return a.path.localeCompare(b.path);
  });
}

async function runTestFile(testFile: TestFile, mockSetupFile: string): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const testPath = path.join(__dirname, testFile.path);

    const child = spawn('bun', ['test', testPath, '--preload', mockSetupFile], {
      cwd: path.dirname(testPath),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000, // 1 minute timeout per file
      env: {
        ...process.env,
        NODE_ENV: 'test',
        BUN_ENV: 'test',
      },
    });

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      // Parse bun test output
      let tests = 0;
      let failures = 0;
      
      const passMatch = stdout.match(/(\d+) pass/);
      const failMatch = stdout.match(/(\d+) fail/);
      
      if (passMatch) tests += parseInt(passMatch[1]);
      if (failMatch) {
        failures = parseInt(failMatch[1]);
        tests += failures;
      }

      resolve({
        file: testFile.path,
        passed: code === 0 && failures === 0,
        tests,
        failures,
        duration,
        error: code !== 0 ? (stderr || 'Test failed') : undefined,
      });
    });

    child.on('error', (error) => {
      resolve({
        file: testFile.path,
        passed: false,
        tests: 0,
        failures: 1,
        duration: Date.now() - startTime,
        error: error.message,
      });
    });
  });
}

async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Xaheen CLI - Available Tests Runner'));
  console.log(chalk.gray('Discovering and running all available test files...\n'));

  const startTime = Date.now();

  // Discover test files
  console.log(chalk.blue('🔍 Discovering test files...'));
  const testFiles = await discoverTestFiles();
  console.log(chalk.green(`✅ Found ${testFiles.length} test files\n`));

  if (testFiles.length === 0) {
    console.log(chalk.yellow('⚠️  No test files found!'));
    process.exit(0);
  }

  // Group by phase
  const phases = new Map<string, TestFile[]>();
  for (const file of testFiles) {
    if (!phases.has(file.phase)) {
      phases.set(file.phase, []);
    }
    phases.get(file.phase)!.push(file);
  }

  // Create mock setup file
  const mockSetupFile = path.join(__dirname, '.bun-test-setup-quick.ts');
  await fs.writeFile(mockSetupFile, MOCK_SETUP);

  // Run tests phase by phase
  const results: TestResult[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [phase, files] of phases) {
    console.log(chalk.blue(`\n📋 Running ${phase} (${files.length} files)`));
    console.log(chalk.gray('─'.repeat(50)));

    for (const file of files) {
      process.stdout.write(`  ${file.path}... `);
      
      const result = await runTestFile(file, mockSetupFile);
      results.push(result);

      totalTests += result.tests;
      if (result.passed) {
        totalPassed += result.tests - result.failures;
        totalFailed += result.failures;
        console.log(chalk.green(`✓ ${result.tests} tests (${result.duration}ms)`));
      } else {
        totalFailed += result.tests || 1;
        console.log(chalk.red(`✗ ${result.failures}/${result.tests} failed (${result.duration}ms)`));
        if (result.error) {
          console.log(chalk.red(`    Error: ${result.error.split('\n')[0]}`));
        }
      }
    }
  }

  // Clean up
  await fs.remove(mockSetupFile);

  // Generate report
  const duration = Date.now() - startTime;
  const resultsDir = path.join(__dirname, 'results');
  await fs.ensureDir(resultsDir);

  const report = {
    timestamp: new Date().toISOString(),
    duration,
    filesRun: testFiles.length,
    totalTests,
    totalPassed,
    totalFailed,
    successRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
    results: results.map(r => ({
      ...r,
      phase: testFiles.find(f => f.path === r.file)?.phase,
      category: testFiles.find(f => f.path === r.file)?.category,
    })),
  };

  await fs.writeJson(
    path.join(resultsDir, 'quick-test-results.json'),
    report,
    { spaces: 2 }
  );

  // Print summary
  console.log(chalk.cyan.bold('\n📊 Test Summary'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(`${chalk.bold('Files Run:')} ${testFiles.length}`);
  console.log(`${chalk.bold('Total Tests:')} ${totalTests}`);
  console.log(`${chalk.bold('Passed:')} ${chalk.green(totalPassed)}`);
  console.log(`${chalk.bold('Failed:')} ${chalk.red(totalFailed)}`);
  console.log(`${chalk.bold('Success Rate:')} ${
    report.successRate >= 80 ? chalk.green(`${report.successRate}%`) :
    report.successRate >= 60 ? chalk.yellow(`${report.successRate}%`) :
    chalk.red(`${report.successRate}%`)
  }`);
  console.log(`${chalk.bold('Duration:')} ${Math.round(duration / 1000)}s`);

  // Print failed tests
  const failedResults = results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    console.log(chalk.red.bold('\n❌ Failed Tests:'));
    for (const result of failedResults) {
      console.log(chalk.red(`  - ${result.file}`));
      if (result.error) {
        console.log(chalk.red(`    ${result.error.split('\n')[0]}`));
      }
    }
  }

  console.log(chalk.gray(`\n📄 Results saved to: ${path.join(resultsDir, 'quick-test-results.json')}`));

  // Exit code
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error(chalk.red.bold('\n💥 Test runner failed:'), error);
    process.exit(1);
  });
}

export { main as runAvailableTests };
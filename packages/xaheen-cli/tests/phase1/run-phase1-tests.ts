#!/usr/bin/env node

/**
 * Phase 1 Test Runner
 * Orchestrates all Phase 1 tests (unit, integration, e2e, performance)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

interface TestSuite {
  name: string;
  pattern: string;
  timeout?: number;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Unit Tests',
    pattern: 'tests/phase1/unit/**/*.test.ts',
    timeout: 60000,
  },
  {
    name: 'Integration Tests',
    pattern: 'tests/phase1/integration/**/*.test.ts',
    timeout: 120000,
  },
  {
    name: 'E2E Tests (Playwright)',
    pattern: 'tests/phase1/e2e/**/*.test.ts',
    timeout: 180000,
  },
  {
    name: 'Performance Benchmarks',
    pattern: 'tests/phase1/performance/**/*.test.ts',
    timeout: 240000,
  },
];

async function runTestSuite(suite: TestSuite): Promise<{ success: boolean; duration: number; output: string }> {
  const startTime = performance.now();
  
  try {
    console.log(chalk.blue(`\n📋 Running ${suite.name}...`));
    
    const { stdout, stderr } = await execAsync(
      `bun run vitest run ${suite.pattern} --reporter=verbose`,
      {
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          FORCE_COLOR: '1',
        },
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    const duration = performance.now() - startTime;
    const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');

    console.log(chalk.green(`✅ ${suite.name} completed in ${(duration / 1000).toFixed(2)}s`));
    
    return { success: true, duration, output };
  } catch (error: any) {
    const duration = performance.now() - startTime;
    const output = error.stdout + (error.stderr ? `\nSTDERR:\n${error.stderr}` : '');
    
    console.log(chalk.red(`❌ ${suite.name} failed after ${(duration / 1000).toFixed(2)}s`));
    console.error(chalk.red(error.message));
    
    return { success: false, duration, output };
  }
}

async function generateReport(results: Array<{ suite: TestSuite; result: { success: boolean; duration: number; output: string } }>) {
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration: results.reduce((sum, r) => sum + r.result.duration, 0),
    suites: results.map(({ suite, result }) => ({
      name: suite.name,
      success: result.success,
      duration: result.duration,
      durationFormatted: `${(result.duration / 1000).toFixed(2)}s`,
    })),
    summary: {
      total: results.length,
      passed: results.filter(r => r.result.success).length,
      failed: results.filter(r => !r.result.success).length,
    },
  };

  const reportPath = path.resolve(__dirname, '../../test-output/phase1-test-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  return report;
}

async function main() {
  console.log(chalk.cyan.bold('\n🚀 Xaheen CLI - Phase 1 Test Suite'));
  console.log(chalk.gray('Testing Frontend MVP (Next.js) functionality\n'));

  const startTime = performance.now();
  const results: Array<{ suite: TestSuite; result: { success: boolean; duration: number; output: string } }> = [];

  // Check if specific test type is requested
  const testType = process.argv[2];
  const suitesToRun = testType
    ? TEST_SUITES.filter(s => s.name.toLowerCase().includes(testType.toLowerCase()))
    : TEST_SUITES;

  if (suitesToRun.length === 0) {
    console.error(chalk.red(`No test suites found matching: ${testType}`));
    process.exit(1);
  }

  // Run test suites
  for (const suite of suitesToRun) {
    const result = await runTestSuite(suite);
    results.push({ suite, result });

    // Stop on first failure if CI environment
    if (!result.success && process.env.CI) {
      console.error(chalk.red('\n❌ Stopping test run due to failure in CI environment'));
      break;
    }
  }

  // Generate report
  const report = await generateReport(results);
  const totalDuration = performance.now() - startTime;

  // Print summary
  console.log(chalk.cyan.bold('\n📊 Test Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  
  results.forEach(({ suite, result }) => {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? chalk.green : chalk.red;
    console.log(`${icon} ${color(suite.name.padEnd(25))} ${(result.duration / 1000).toFixed(2)}s`);
  });

  console.log(chalk.gray('─'.repeat(50)));
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Passed: ${chalk.green(report.summary.passed.toString())}`);
  console.log(`Failed: ${chalk.red(report.summary.failed.toString())}`);

  if (report.summary.failed > 0) {
    console.log(chalk.red('\n❌ Phase 1 tests failed!'));
    
    // Print failed test details
    results
      .filter(r => !r.result.success)
      .forEach(({ suite, result }) => {
        console.log(chalk.red(`\n${suite.name} Output:`));
        console.log(result.output);
      });
    
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All Phase 1 tests passed!'));
    console.log(chalk.gray(`Report saved to: test-output/phase1-test-report.json`));
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n❌ Unhandled error:'), error);
  process.exit(1);
});

// Run main
main().catch((error) => {
  console.error(chalk.red('\n❌ Test runner error:'), error);
  process.exit(1);
});
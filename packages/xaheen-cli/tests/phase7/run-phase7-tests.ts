#!/usr/bin/env node

/**
 * Phase 7: SaaS & Multi-Tenancy Test Runner
 * 
 * Orchestrates the execution of all Phase 7 tests with proper setup and reporting
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface TestSuite {
  readonly name: string;
  readonly description: string;
  readonly testFile: string;
  readonly timeout: number;
  readonly critical: boolean;
}

interface TestResult {
  readonly suite: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly tests: number;
  readonly failures: number;
  readonly errors: readonly string[];
}

const TEST_SUITES: readonly TestSuite[] = [
  {
    name: 'Multi-Tenant Scaffolding',
    description: 'Tests SaaS multi-tenant project scaffolding functionality',
    testFile: './integration/multi-tenant-scaffolding.test.ts',
    timeout: 120000, // 2 minutes
    critical: true,
  },
  {
    name: 'Tenant Provisioning',
    description: 'Tests tenant creation and data isolation',
    testFile: './integration/tenant-provisioning.test.ts',
    timeout: 60000, // 1 minute
    critical: true,
  },
  {
    name: 'RBAC and Admin UI',
    description: 'Tests role-based access control and admin functionality',
    testFile: './integration/rbac-admin.test.ts',
    timeout: 90000, // 1.5 minutes
    critical: true,
  },
  {
    name: 'License Gating',
    description: 'Tests subscription and license validation',
    testFile: './integration/license-gating.test.ts',
    timeout: 60000, // 1 minute
    critical: true,
  },
] as const;

async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Phase 7: SaaS & Multi-Tenancy Tests'));
  console.log(chalk.gray('Testing multi-tenant SaaS functionality, RBAC, and license gating\n'));

  const startTime = Date.now();
  const results: TestResult[] = [];
  let totalTests = 0;
  let totalFailures = 0;

  // Ensure test results directory exists
  const resultsDir = path.join(__dirname, '..', 'test-results');
  await fs.ensureDir(resultsDir);

  // Run each test suite
  for (const suite of TEST_SUITES) {
    console.log(chalk.blue(`\n📋 Running: ${suite.name}`));
    console.log(chalk.gray(`   ${suite.description}`));
    
    const result = await runTestSuite(suite);
    results.push(result);
    
    totalTests += result.tests;
    totalFailures += result.failures;

    if (result.passed) {
      console.log(chalk.green(`✅ ${suite.name} - ${result.tests} tests passed (${result.duration}ms)`));
    } else {
      console.log(chalk.red(`❌ ${suite.name} - ${result.failures}/${result.tests} tests failed`));
      
      if (result.errors.length > 0) {
        console.log(chalk.red('   Errors:'));
        result.errors.forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
      }

      // If this is a critical test suite and it failed, consider stopping
      if (suite.critical) {
        console.log(chalk.yellow(`⚠️  Critical test suite failed: ${suite.name}`));
      }
    }
  }

  // Generate summary report
  const duration = Date.now() - startTime;
  await generateTestReport(results, duration);

  // Print summary
  console.log(chalk.cyan.bold('\n📊 Phase 7 Test Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  
  const passedSuites = results.filter(r => r.passed).length;
  const failedSuites = results.filter(r => !r.passed).length;

  console.log(`Total Test Suites: ${TEST_SUITES.length}`);
  console.log(`Passed: ${chalk.green(passedSuites)}`);
  console.log(`Failed: ${chalk.red(failedSuites)}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Total Failures: ${totalFailures}`);
  console.log(`Duration: ${duration}ms`);

  // Overall result
  if (failedSuites === 0) {
    console.log(chalk.green.bold('\n🎉 All Phase 7 tests passed!'));
    process.exit(0);
  } else {
    const criticalFailures = results.filter(r => !r.passed && TEST_SUITES.find(s => s.name === r.suite)?.critical).length;
    
    if (criticalFailures > 0) {
      console.log(chalk.red.bold(`\n💥 ${criticalFailures} critical test suite(s) failed!`));
      process.exit(1);
    } else {
      console.log(chalk.yellow.bold(`\n⚠️  ${failedSuites} non-critical test suite(s) failed`));
      process.exit(0);
    }
  }
}

async function runTestSuite(suite: TestSuite): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const child = spawn('npx', ['vitest', 'run', suite.testFile, '--reporter=json'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: suite.timeout,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_SUITE: suite.name,
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
      
      try {
        // Parse vitest JSON output
        const lines = stdout.split('\n').filter(line => line.trim());
        const jsonLine = lines.find(line => line.startsWith('{'));
        
        if (jsonLine) {
          const testResults = JSON.parse(jsonLine);
          
          resolve({
            suite: suite.name,
            passed: code === 0,
            duration,
            tests: testResults.numTotalTests || 0,
            failures: testResults.numFailedTests || 0,
            errors: stderr ? [stderr] : [],
          });
        } else {
          resolve({
            suite: suite.name,
            passed: code === 0,
            duration,
            tests: 0,
            failures: code === 0 ? 0 : 1,
            errors: stderr ? [stderr] : ['No test results found'],
          });
        }
      } catch (error) {
        resolve({
          suite: suite.name,
          passed: false,
          duration,
          tests: 0,
          failures: 1,
          errors: [`Failed to parse test results: ${error}`],
        });
      }
    });

    child.on('error', (error) => {
      resolve({
        suite: suite.name,
        passed: false,
        duration: Date.now() - startTime,
        tests: 0,
        failures: 1,
        errors: [`Process error: ${error.message}`],
      });
    });
  });
}

async function generateTestReport(results: readonly TestResult[], totalDuration: number): Promise<void> {
  const resultsDir = path.join(__dirname, '..', 'test-results');
  
  const report = {
    phase: 'Phase 7: SaaS & Multi-Tenancy',
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    summary: {
      totalSuites: TEST_SUITES.length,
      passedSuites: results.filter(r => r.passed).length,
      failedSuites: results.filter(r => !r.passed).length,
      totalTests: results.reduce((sum, r) => sum + r.tests, 0),
      totalFailures: results.reduce((sum, r) => sum + r.failures, 0),
    },
    suites: TEST_SUITES.map(suite => {
      const result = results.find(r => r.suite === suite.name);
      return {
        name: suite.name,
        description: suite.description,
        critical: suite.critical,
        passed: result?.passed || false,
        duration: result?.duration || 0,
        tests: result?.tests || 0,
        failures: result?.failures || 0,
        errors: result?.errors || [],
      };
    }),
    results,
  };

  // Save JSON report
  await fs.writeJson(
    path.join(resultsDir, 'phase7-results.json'),
    report,
    { spaces: 2 }
  );

  // Save HTML report
  const htmlReport = generateHtmlReport(report);
  await fs.writeFile(
    path.join(resultsDir, 'phase7-report.html'),
    htmlReport
  );

  console.log(chalk.gray(`\n📄 Test reports saved to: ${resultsDir}`));
}

function generateHtmlReport(report: any): string {
  const passed = report.summary.passedSuites;
  const failed = report.summary.failedSuites;
  const successRate = Math.round((passed / (passed + failed)) * 100);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Phase 7: SaaS & Multi-Tenancy Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; text-align: center; }
        .passed { border-left: 4px solid #4caf50; }
        .failed { border-left: 4px solid #f44336; }
        .critical { background: #fff3cd; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .status-passed { color: #4caf50; font-weight: bold; }
        .status-failed { color: #f44336; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Phase 7: SaaS & Multi-Tenancy Test Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Duration: ${Math.round(report.duration / 1000)}s</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Success Rate</h3>
            <div style="font-size: 24px; color: ${successRate >= 80 ? '#4caf50' : '#f44336'}">${successRate}%</div>
        </div>
        <div class="metric">
            <h3>Test Suites</h3>
            <div>${passed} passed, ${failed} failed</div>
        </div>
        <div class="metric">
            <h3>Total Tests</h3>
            <div>${report.summary.totalTests} tests</div>
        </div>
        <div class="metric">
            <h3>Failures</h3>
            <div>${report.summary.totalFailures} failures</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Test Suite</th>
                <th>Status</th>
                <th>Tests</th>
                <th>Failures</th>
                <th>Duration</th>
                <th>Critical</th>
            </tr>
        </thead>
        <tbody>
            ${report.suites.map((suite: any) => `
                <tr class="${suite.critical ? 'critical' : ''}">
                    <td>
                        <strong>${suite.name}</strong><br>
                        <small>${suite.description}</small>
                    </td>
                    <td class="${suite.passed ? 'status-passed' : 'status-failed'}">
                        ${suite.passed ? 'PASSED' : 'FAILED'}
                    </td>
                    <td>${suite.tests}</td>
                    <td>${suite.failures}</td>
                    <td>${Math.round(suite.duration / 1000)}s</td>
                    <td>${suite.critical ? '⚠️ Critical' : ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${report.suites.filter((s: any) => !s.passed).length > 0 ? `
        <h2>Failed Test Suites</h2>
        ${report.suites.filter((s: any) => !s.passed).map((suite: any) => `
            <div style="border: 1px solid #f44336; padding: 15px; margin: 10px 0; border-radius: 4px;">
                <h3 style="color: #f44336;">${suite.name}</h3>
                ${suite.errors.length > 0 ? `
                    <h4>Errors:</h4>
                    <ul>
                        ${suite.errors.map((error: string) => `<li><code>${error}</code></li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    ` : ''}
</body>
</html>
  `;
}

// Run the test suite if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('\n💥 Test runner failed:'), error);
    process.exit(1);
  });
}

export { main as runPhase7Tests };
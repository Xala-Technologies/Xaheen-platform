#!/usr/bin/env node

/**
 * Master Test Runner for Phase 7 & Phase 8
 * 
 * Orchestrates the execution of both SaaS & Multi-Tenancy (Phase 7) and 
 * Plugins & Marketplace (Phase 8) test suites with comprehensive reporting.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface PhaseResult {
  readonly phase: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly totalTests: number;
  readonly totalFailures: number;
  readonly criticalFailures: number;
  readonly errors: readonly string[];
}

interface TestPhase {
  readonly name: string;
  readonly description: string;
  readonly runner: string;
  readonly critical: boolean;
}

const TEST_PHASES: readonly TestPhase[] = [
  {
    name: 'Phase 7: SaaS & Multi-Tenancy',
    description: 'Tests multi-tenant project scaffolding, RBAC, admin UI, and license gating',
    runner: './phase7/run-phase7-tests.ts',
    critical: true,
  },
  {
    name: 'Phase 8: Plugins & Marketplace',
    description: 'Tests plugin installation, publishing, registry integration, and version compatibility',
    runner: './phase8/run-phase8-tests.ts',
    critical: true,
  },
] as const;

async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Xaheen CLI - Phase 7 & 8 Testing Suite'));
  console.log(chalk.gray('Comprehensive testing for SaaS/Multi-Tenancy and Plugin System\n'));

  const startTime = Date.now();
  const results: PhaseResult[] = [];

  // Ensure test results directory exists
  const resultsDir = path.join(__dirname, 'results');
  await fs.ensureDir(resultsDir);

  // Run each phase
  for (const phase of TEST_PHASES) {
    console.log(chalk.blue(`\n🎯 Executing: ${phase.name}`));
    console.log(chalk.gray(`   ${phase.description}`));
    console.log(chalk.gray('   ─'.repeat(80)));
    
    const result = await runPhase(phase);
    results.push(result);

    if (result.passed) {
      console.log(chalk.green(`\n✅ ${phase.name} completed successfully`));
      console.log(chalk.green(`   Tests: ${result.totalTests}, Duration: ${result.duration}ms`));
    } else {
      console.log(chalk.red(`\n❌ ${phase.name} failed`));
      console.log(chalk.red(`   Tests: ${result.totalTests}, Failures: ${result.totalFailures}`));
      console.log(chalk.red(`   Critical Failures: ${result.criticalFailures}`));
      
      if (result.errors.length > 0) {
        console.log(chalk.red('   Errors:'));
        result.errors.forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
      }

      // If this is a critical phase and it failed, we might want to stop
      if (phase.critical) {
        console.log(chalk.yellow(`\n⚠️  Critical phase failed: ${phase.name}`));
        console.log(chalk.yellow('   Continuing with remaining phases...'));
      }
    }
  }

  // Generate comprehensive report
  const totalDuration = Date.now() - startTime;
  await generateComprehensiveReport(results, totalDuration);

  // Print overall summary
  printOverallSummary(results, totalDuration);

  // Determine exit code
  const failedPhases = results.filter(r => !r.passed);
  const criticalFailures = results.filter(r => !r.passed && TEST_PHASES.find(p => p.name === r.phase)?.critical);

  if (failedPhases.length === 0) {
    console.log(chalk.green.bold('\n🎉 All phases completed successfully!'));
    console.log(chalk.green('   The Xaheen CLI is ready for Phase 7 & 8 deployment.'));
    process.exit(0);
  } else if (criticalFailures.length > 0) {
    console.log(chalk.red.bold(`\n💥 ${criticalFailures.length} critical phase(s) failed!`));
    console.log(chalk.red('   Deployment should be blocked until these issues are resolved.'));
    process.exit(1);
  } else {
    console.log(chalk.yellow.bold(`\n⚠️  ${failedPhases.length} non-critical phase(s) failed`));
    console.log(chalk.yellow('   Deployment can proceed with caution.'));
    process.exit(0);
  }
}

async function runPhase(phase: TestPhase): Promise<PhaseResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const runnerPath = path.resolve(__dirname, phase.runner);
    
    const child = spawn('node', [runnerPath], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 600000, // 10 minutes max per phase
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_PHASE: phase.name,
      },
    });

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // Stream output in real-time
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output); // Stream errors in real-time
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      // Parse test results from output
      const testResults = parseTestResults(stdout, stderr);
      
      resolve({
        phase: phase.name,
        passed: code === 0,
        duration,
        totalTests: testResults.totalTests,
        totalFailures: testResults.totalFailures,
        criticalFailures: testResults.criticalFailures,
        errors: testResults.errors,
      });
    });

    child.on('error', (error) => {
      resolve({
        phase: phase.name,
        passed: false,
        duration: Date.now() - startTime,
        totalTests: 0,
        totalFailures: 1,
        criticalFailures: 1,
        errors: [`Process error: ${error.message}`],
      });
    });
  });
}

function parseTestResults(stdout: string, stderr: string) {
  let totalTests = 0;
  let totalFailures = 0;
  let criticalFailures = 0;
  const errors: string[] = [];

  // Parse test counts from output
  const testMatch = stdout.match(/Total Tests:\s*(\d+)/);
  if (testMatch) {
    totalTests = parseInt(testMatch[1]);
  }

  const failureMatch = stdout.match(/Total Failures:\s*(\d+)/);
  if (failureMatch) {
    totalFailures = parseInt(failureMatch[1]);
  }

  const criticalMatch = stdout.match(/(\d+)\s+critical.*failed/);
  if (criticalMatch) {
    criticalFailures = parseInt(criticalMatch[1]);
  }

  // Parse errors from stderr
  if (stderr.trim()) {
    errors.push(stderr.trim());
  }

  return {
    totalTests,
    totalFailures,
    criticalFailures,
    errors,
  };
}

async function generateComprehensiveReport(results: readonly PhaseResult[], totalDuration: number): Promise<void> {
  const resultsDir = path.join(__dirname, 'results');
  await fs.ensureDir(resultsDir);
  
  const report = {
    title: 'Xaheen CLI - Phase 7 & 8 Test Results',
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    summary: {
      totalPhases: TEST_PHASES.length,
      passedPhases: results.filter(r => r.passed).length,
      failedPhases: results.filter(r => !r.passed).length,
      totalTests: results.reduce((sum, r) => sum + r.totalTests, 0),
      totalFailures: results.reduce((sum, r) => sum + r.totalFailures, 0),
      criticalFailures: results.reduce((sum, r) => sum + r.criticalFailures, 0),
    },
    phases: TEST_PHASES.map(phase => {
      const result = results.find(r => r.phase === phase.name);
      return {
        name: phase.name,
        description: phase.description,
        critical: phase.critical,
        passed: result?.passed || false,
        duration: result?.duration || 0,
        totalTests: result?.totalTests || 0,
        totalFailures: result?.totalFailures || 0,
        criticalFailures: result?.criticalFailures || 0,
        errors: result?.errors || [],
      };
    }),
    results,
  };

  // Save JSON report
  await fs.writeJson(
    path.join(resultsDir, 'phases-7-8-results.json'),
    report,
    { spaces: 2 }
  );

  // Save HTML report
  const htmlReport = generateHtmlReport(report);
  await fs.writeFile(
    path.join(resultsDir, 'phases-7-8-report.html'),
    htmlReport
  );

  // Save CSV report
  const csvReport = generateCsvReport(report);
  await fs.writeFile(
    path.join(resultsDir, 'phases-7-8-results.csv'),
    csvReport
  );

  console.log(chalk.gray(`\n📄 Comprehensive reports saved to: ${resultsDir}`));
}

function generateHtmlReport(report: any): string {
  const passed = report.summary.passedPhases;
  const failed = report.summary.failedPhases;
  const successRate = Math.round((passed / (passed + failed)) * 100);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Xaheen CLI - Phase 7 & 8 Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric-value { font-size: 28px; font-weight: bold; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
        .error { color: #f44336; }
        .phase-card { background: white; border: 1px solid #ddd; border-radius: 8px; margin: 15px 0; overflow: hidden; }
        .phase-header { padding: 20px; background: #f8f9fa; border-bottom: 1px solid #ddd; }
        .phase-content { padding: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-passed { background: #4caf50; }
        .status-failed { background: #f44336; }
        .critical { border-left: 4px solid #f44336; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
        .stat-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .errors { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Xaheen CLI - Phase 7 & 8 Test Report</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Total Duration: ${Math.round(report.duration / 1000)}s</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="metric-value ${successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'error'}">${successRate}%</div>
            </div>
            <div class="metric">
                <h3>Test Phases</h3>
                <div class="metric-value">${passed}<span class="success">✓</span> ${failed}<span class="error">✗</span></div>
            </div>
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="metric-value">${report.summary.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Failures</h3>
                <div class="metric-value ${report.summary.totalFailures > 0 ? 'error' : 'success'}">${report.summary.totalFailures}</div>
            </div>
            <div class="metric">
                <h3>Critical Issues</h3>
                <div class="metric-value ${report.summary.criticalFailures > 0 ? 'error' : 'success'}">${report.summary.criticalFailures}</div>
            </div>
        </div>

        <h2>📋 Phase Results</h2>
        ${report.phases.map((phase: any) => `
            <div class="phase-card ${phase.critical && !phase.passed ? 'critical' : ''}">
                <div class="phase-header">
                    <h3>
                        ${phase.name}
                        <span class="status-badge ${phase.passed ? 'status-passed' : 'status-failed'}">
                            ${phase.passed ? 'PASSED' : 'FAILED'}
                        </span>
                        ${phase.critical ? '<span style="color: #f44336; margin-left: 10px;">⚠️ Critical</span>' : ''}
                    </h3>
                    <p style="margin: 10px 0 0 0; color: #666;">${phase.description}</p>
                </div>
                <div class="phase-content">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div style="font-size: 18px; font-weight: bold;">${phase.totalTests}</div>
                            <div style="font-size: 12px; color: #666;">Total Tests</div>
                        </div>
                        <div class="stat-item">
                            <div style="font-size: 18px; font-weight: bold; color: ${phase.totalFailures > 0 ? '#f44336' : '#4caf50'};">${phase.totalFailures}</div>
                            <div style="font-size: 12px; color: #666;">Failures</div>
                        </div>
                        <div class="stat-item">
                            <div style="font-size: 18px; font-weight: bold;">${Math.round(phase.duration / 1000)}s</div>
                            <div style="font-size: 12px; color: #666;">Duration</div>
                        </div>
                        <div class="stat-item">
                            <div style="font-size: 18px; font-weight: bold; color: ${phase.criticalFailures > 0 ? '#f44336' : '#4caf50'};">${phase.criticalFailures}</div>
                            <div style="font-size: 12px; color: #666;">Critical</div>
                        </div>
                    </div>
                    ${phase.errors.length > 0 ? `
                        <div class="errors">
                            <h4 style="margin: 0 0 10px 0; color: #856404;">🚫 Errors:</h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${phase.errors.map((error: string) => `<li style="margin: 5px 0;"><code>${error}</code></li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}

        ${report.summary.failedPhases > 0 ? `
            <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>🚨 Action Required</h3>
                <p><strong>${report.summary.failedPhases}</strong> phase(s) failed with <strong>${report.summary.totalFailures}</strong> test failures.</p>
                ${report.summary.criticalFailures > 0 ? `
                    <p><strong>⚠️ Critical:</strong> ${report.summary.criticalFailures} critical failure(s) detected. Deployment should be blocked.</p>
                ` : `
                    <p>✅ No critical failures detected. Deployment can proceed with caution.</p>
                `}
            </div>
        ` : `
            <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>🎉 All Tests Passed!</h3>
                <p>All ${report.summary.totalTests} tests across ${report.summary.totalPhases} phases completed successfully.</p>
                <p>✅ The Xaheen CLI is ready for Phase 7 & 8 deployment.</p>
            </div>
        `}

        <div class="footer">
            <p>Generated by Xaheen CLI Test Suite • ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateCsvReport(report: any): string {
  const headers = [
    'Phase',
    'Status',
    'Critical',
    'Total Tests',
    'Failures',
    'Critical Failures',
    'Duration (ms)',
    'Success Rate'
  ];

  const rows = report.phases.map((phase: any) => [
    phase.name,
    phase.passed ? 'PASSED' : 'FAILED',
    phase.critical ? 'Yes' : 'No',
    phase.totalTests,
    phase.totalFailures,
    phase.criticalFailures,
    phase.duration,
    phase.totalTests > 0 ? Math.round(((phase.totalTests - phase.totalFailures) / phase.totalTests) * 100) + '%' : '0%'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

function printOverallSummary(results: readonly PhaseResult[], totalDuration: number): void {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
  const totalFailures = results.reduce((sum, r) => sum + r.totalFailures, 0);
  const criticalFailures = results.reduce((sum, r) => sum + r.criticalFailures, 0);

  console.log(chalk.cyan.bold('\n📊 Overall Test Summary'));
  console.log(chalk.cyan('═'.repeat(60)));
  
  console.log(`${chalk.bold('Test Phases:')} ${TEST_PHASES.length} total`);
  console.log(`${chalk.bold('Passed:')} ${chalk.green(passed)} phases`);
  console.log(`${chalk.bold('Failed:')} ${chalk.red(failed)} phases`);
  console.log(`${chalk.bold('Total Tests:')} ${totalTests}`);
  console.log(`${chalk.bold('Total Failures:')} ${totalFailures}`);
  console.log(`${chalk.bold('Critical Failures:')} ${criticalFailures}`);
  console.log(`${chalk.bold('Total Duration:')} ${Math.round(totalDuration / 1000)}s`);
  
  const successRate = totalTests > 0 ? Math.round(((totalTests - totalFailures) / totalTests) * 100) : 0;
  console.log(`${chalk.bold('Success Rate:')} ${successRate >= 80 ? chalk.green(`${successRate}%`) : successRate >= 60 ? chalk.yellow(`${successRate}%`) : chalk.red(`${successRate}%`)}`);
}

// Run the test suite if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('\n💥 Master test runner failed:'), error);
    process.exit(1);
  });
}

export { main as runPhases78Tests };
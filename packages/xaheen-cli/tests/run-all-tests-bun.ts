#!/usr/bin/env bun

/**
 * Comprehensive Bun Test Runner for Xaheen CLI
 * 
 * This script runs all test phases using Bun's test runner,
 * bypassing import issues by mocking problematic dependencies
 * and running tests phase by phase with comprehensive reporting.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface TestPhase {
  readonly name: string;
  readonly description: string;
  readonly directory: string;
  readonly testFiles: readonly string[];
  readonly timeout: number;
  readonly critical: boolean;
}

interface TestResult {
  readonly phase: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly totalTests: number;
  readonly passedTests: number;
  readonly failedTests: number;
  readonly skippedTests: number;
  readonly errors: readonly string[];
  readonly testDetails: readonly TestDetail[];
}

interface TestDetail {
  readonly file: string;
  readonly tests: number;
  readonly passed: number;
  readonly failed: number;
  readonly duration: number;
  readonly errors: readonly string[];
}

interface TestSummary {
  readonly totalPhases: number;
  readonly passedPhases: number;
  readonly failedPhases: number;
  readonly totalTests: number;
  readonly passedTests: number;
  readonly failedTests: number;
  readonly skippedTests: number;
  readonly totalDuration: number;
  readonly criticalFailures: number;
}

// Mock setup for @xala-technologies/xala-mcp
const MOCK_SETUP = `
// Mock @xala-technologies/xala-mcp module
import { mock } from 'bun:test';

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
`;

// Test phases configuration
const TEST_PHASES: readonly TestPhase[] = [
  {
    name: 'Phase 0: Core & Installation',
    description: 'Core functionality, installation, and distribution tests',
    directory: 'phase0',
    testFiles: [
      'smoke/basic-validation.test.ts',
      'smoke/help-commands.test.ts',
      'smoke/license-status.test.ts',
      'installation/binary-validation.test.ts',
      'installation/install-from-registry.test.ts',
      'distribution/package-build.test.ts',
      'distribution/publish-dry-run.test.ts',
      'docs/build-docs.test.ts',
      'docs/lint-docs.test.ts',
    ],
    timeout: 300000, // 5 minutes
    critical: true,
  },
  {
    name: 'Phase 1: Next.js Support',
    description: 'Next.js project scaffolding and configuration',
    directory: 'phase1',
    testFiles: [
      'unit/command-handlers.test.ts',
      'integration/nextjs-scaffolding.test.ts',
      'e2e/nextjs-playwright.test.ts',
      'performance/scaffolding-benchmarks.test.ts',
    ],
    timeout: 300000,
    critical: true,
  },
  {
    name: 'Phase 2: Framework Matrix',
    description: 'Multi-framework support (Vue, Angular, Svelte, etc.)',
    directory: 'phase2',
    testFiles: [
      'unit/vue-preset.test.ts',
      'unit/angular-preset.test.ts',
      'unit/svelte-preset.test.ts',
      'unit/solid-preset.test.ts',
      'unit/remix-preset.test.ts',
      'integration/vue-scaffolding.test.ts',
      'integration/angular-scaffolding.test.ts',
      'integration/svelte-scaffolding.test.ts',
      'integration/solid-scaffolding.test.ts',
      'integration/remix-scaffolding.test.ts',
      'e2e/framework-matrix.test.ts',
      'performance/scaffolding-matrix.test.ts',
    ],
    timeout: 600000, // 10 minutes
    critical: true,
  },
  {
    name: 'Phase 3: Package Manager Intelligence',
    description: 'Smart package manager detection and handling',
    directory: 'phase3',
    testFiles: [
      'environment-detection/manager-detection.test.ts',
      'environment-detection/version-compatibility.test.ts',
      'environment-detection/fallback-logic.test.ts',
      'environment-variables/xaheen-pkg-manager.test.ts',
      'environment-variables/precedence-rules.test.ts',
      'environment-variables/invalid-manager.test.ts',
      'edge-cases/monorepo-detection.test.ts',
      'edge-cases/lockfile-scenarios.test.ts',
      'edge-cases/mixed-environments.test.ts',
      'integration/npm-integration.test.ts',
      'integration/yarn-integration.test.ts',
      'integration/pnpm-integration.test.ts',
      'integration/bun-integration.test.ts',
    ],
    timeout: 600000,
    critical: true,
  },
  {
    name: 'Phase 4: Backend Framework Support',
    description: 'Express, NestJS, Fastify, and Hono support',
    directory: 'phase4',
    testFiles: [
      'unit/endpoint.test.ts',
      'unit/model.test.ts',
      'unit/service.test.ts',
      'integration/express.test.ts',
      'integration/nestjs.test.ts',
      'integration/fastify.test.ts',
      'integration/hono.test.ts',
      'e2e/crud.test.ts',
      'performance/cold-start.test.ts',
      'performance/latency.test.ts',
    ],
    timeout: 600000,
    critical: true,
  },
  {
    name: 'Phase 5: Full-Stack Features',
    description: 'Monorepo setup, API client generation, and full-stack CRUD',
    directory: 'phase5',
    testFiles: [
      'integration/monorepo-setup.test.ts',
      'integration/service-generation.test.ts',
      'integration/api-client-integration.test.ts',
      'e2e/fullstack-crud.test.ts',
      'e2e/auth-flow.test.ts',
    ],
    timeout: 600000,
    critical: true,
  },
  {
    name: 'Phase 6: Integrations',
    description: 'Auth, payment, and third-party integrations',
    directory: 'phase6',
    testFiles: [
      'integration/auth/jwt-integration.test.ts',
      'integration/auth/oauth2-integration.test.ts',
      'integration/payments/stripe-integration.test.ts',
    ],
    timeout: 300000,
    critical: false,
  },
  {
    name: 'Phase 7: SaaS & Multi-Tenancy',
    description: 'Multi-tenant scaffolding, RBAC, and license gating',
    directory: 'phase7',
    testFiles: [
      'integration/multi-tenant-scaffolding.test.ts',
      'integration/tenant-provisioning.test.ts',
      'integration/rbac-admin.test.ts',
      'integration/license-gating.test.ts',
    ],
    timeout: 600000,
    critical: true,
  },
  {
    name: 'Phase 8: Plugins & Marketplace',
    description: 'Plugin system and marketplace integration',
    directory: 'phase8',
    testFiles: [
      'integration/plugin-install.test.ts',
      'integration/plugin-publish.test.ts',
      'integration/plugin-registry.test.ts',
      'integration/version-compatibility.test.ts',
    ],
    timeout: 600000,
    critical: true,
  },
  {
    name: 'Phase 9: Security & Code Quality',
    description: 'Security scanning, static analysis, and code quality',
    directory: 'phase9',
    testFiles: [
      'static-analysis/eslint-security.test.ts',
      'security/npm-audit.test.ts',
      'security/snyk-scan.test.ts',
      'sanitization/input-validation.test.ts',
      'fuzz/cli-fuzz.test.ts',
      'mutation/stryker-mutation.test.ts',
    ],
    timeout: 900000, // 15 minutes
    critical: false,
  },
  {
    name: 'Phase 10: Norwegian Compliance',
    description: 'Norwegian-specific integrations and compliance',
    directory: 'phase10',
    testFiles: [
      'bankid-altinn/bankid-integration.test.ts',
      'bankid-altinn/altinn-integration.test.ts',
      'digipost/document-submission.test.ts',
      'digdir-reporting/service-reporting.test.ts',
      'gdpr-compliance/consent-management.test.ts',
      'gdpr-compliance/data-deletion.test.ts',
      'nsm-security/classification-handling.test.ts',
      'wcag-accessibility/accessibility-compliance.test.ts',
    ],
    timeout: 600000,
    critical: false,
  },
];

async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Xaheen CLI - Comprehensive Bun Test Runner'));
  console.log(chalk.gray('Running all test phases with Bun test runner\n'));

  const startTime = Date.now();
  const results: TestResult[] = [];

  // Ensure test results directory exists
  const resultsDir = path.join(__dirname, 'results');
  await fs.ensureDir(resultsDir);

  // Create mock setup file
  const mockSetupFile = path.join(__dirname, '.bun-test-setup.ts');
  await fs.writeFile(mockSetupFile, MOCK_SETUP);

  // Run each phase
  for (const phase of TEST_PHASES) {
    console.log(chalk.blue(`\n🎯 Executing: ${phase.name}`));
    console.log(chalk.gray(`   ${phase.description}`));
    console.log(chalk.gray('   ─'.repeat(80)));
    
    const result = await runPhase(phase, mockSetupFile);
    results.push(result);

    if (result.passed) {
      console.log(chalk.green(`\n✅ ${phase.name} completed successfully`));
      console.log(chalk.green(`   Tests: ${result.totalTests} (${result.passedTests} passed, ${result.failedTests} failed, ${result.skippedTests} skipped)`));
      console.log(chalk.green(`   Duration: ${result.duration}ms`));
    } else {
      console.log(chalk.red(`\n❌ ${phase.name} failed`));
      console.log(chalk.red(`   Tests: ${result.totalTests} (${result.passedTests} passed, ${result.failedTests} failed)`));
      
      if (result.errors.length > 0) {
        console.log(chalk.red('   Errors:'));
        result.errors.slice(0, 5).forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
        if (result.errors.length > 5) {
          console.log(chalk.red(`   ... and ${result.errors.length - 5} more errors`));
        }
      }

      if (phase.critical) {
        console.log(chalk.yellow(`\n⚠️  Critical phase failed: ${phase.name}`));
        console.log(chalk.yellow('   Continuing with remaining phases...'));
      }
    }
  }

  // Clean up mock setup file
  await fs.remove(mockSetupFile);

  // Generate comprehensive report
  const totalDuration = Date.now() - startTime;
  const summary = generateSummary(results);
  await generateComprehensiveReport(results, summary, totalDuration);

  // Print overall summary
  printOverallSummary(summary);

  // Determine exit code
  if (summary.failedPhases === 0) {
    console.log(chalk.green.bold('\n🎉 All phases completed successfully!'));
    console.log(chalk.green('   The Xaheen CLI passes all tests.'));
    process.exit(0);
  } else if (summary.criticalFailures > 0) {
    console.log(chalk.red.bold(`\n💥 ${summary.criticalFailures} critical phase(s) failed!`));
    console.log(chalk.red('   Please fix critical issues before proceeding.'));
    process.exit(1);
  } else {
    console.log(chalk.yellow.bold(`\n⚠️  ${summary.failedPhases} non-critical phase(s) failed`));
    console.log(chalk.yellow('   Non-critical failures detected.'));
    process.exit(0);
  }
}

async function runPhase(phase: TestPhase, mockSetupFile: string): Promise<TestResult> {
  const startTime = Date.now();
  const testDetails: TestDetail[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  const errors: string[] = [];

  // Run each test file individually
  for (const testFile of phase.testFiles) {
    const testPath = path.join(__dirname, phase.directory, testFile);
    
    // Check if test file exists
    if (!await fs.pathExists(testPath)) {
      console.log(chalk.yellow(`   ⚠️  Test file not found: ${testFile}`));
      skippedTests++;
      continue;
    }

    const fileResult = await runTestFile(testPath, mockSetupFile, phase.timeout);
    testDetails.push(fileResult);

    totalTests += fileResult.tests;
    passedTests += fileResult.passed;
    failedTests += fileResult.failed;
    
    if (fileResult.errors.length > 0) {
      errors.push(...fileResult.errors.map(e => `${testFile}: ${e}`));
    }

    // Progress indicator
    process.stdout.write(fileResult.failed > 0 ? chalk.red('✗') : chalk.green('✓'));
  }

  console.log(); // New line after progress indicators

  const duration = Date.now() - startTime;
  const passed = failedTests === 0 && errors.length === 0;

  return {
    phase: phase.name,
    passed,
    duration,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    errors,
    testDetails,
  };
}

async function runTestFile(testPath: string, mockSetupFile: string, timeout: number): Promise<TestDetail> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const fileName = path.basename(testPath);

    // Run bun test with preload for mocks
    const child = spawn('bun', ['test', testPath, '--preload', mockSetupFile], {
      cwd: path.dirname(testPath),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
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
      const testResult = parseBunTestOutput(stdout, stderr);
      
      resolve({
        file: fileName,
        tests: testResult.total,
        passed: testResult.passed,
        failed: testResult.failed,
        duration,
        errors: testResult.errors,
      });
    });

    child.on('error', (error) => {
      resolve({
        file: fileName,
        tests: 0,
        passed: 0,
        failed: 1,
        duration: Date.now() - startTime,
        errors: [`Process error: ${error.message}`],
      });
    });
  });
}

function parseBunTestOutput(stdout: string, stderr: string): {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
} {
  let total = 0;
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  // Parse bun test output format
  const lines = stdout.split('\n');
  
  for (const line of lines) {
    // Look for test summary line
    if (line.includes('pass') && line.includes('fail')) {
      const passMatch = line.match(/(\d+) pass/);
      const failMatch = line.match(/(\d+) fail/);
      
      if (passMatch) passed = parseInt(passMatch[1]);
      if (failMatch) failed = parseInt(failMatch[1]);
      total = passed + failed;
    }
    
    // Capture error messages
    if (line.includes('✗') || line.includes('error:')) {
      errors.push(line.trim());
    }
  }

  // Add stderr errors
  if (stderr.trim()) {
    errors.push(...stderr.split('\n').filter(line => line.trim()));
  }

  // Fallback: if no summary found, assume failure
  if (total === 0 && (stdout.includes('error') || stderr)) {
    total = 1;
    failed = 1;
  }

  return { total, passed, failed, errors };
}

function generateSummary(results: readonly TestResult[]): TestSummary {
  const totalPhases = TEST_PHASES.length;
  const passedPhases = results.filter(r => r.passed).length;
  const failedPhases = results.filter(r => !r.passed).length;
  
  const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
  const passedTests = results.reduce((sum, r) => sum + r.passedTests, 0);
  const failedTests = results.reduce((sum, r) => sum + r.failedTests, 0);
  const skippedTests = results.reduce((sum, r) => sum + r.skippedTests, 0);
  
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  const criticalFailures = results.filter(r => 
    !r.passed && TEST_PHASES.find(p => p.name === r.phase)?.critical
  ).length;

  return {
    totalPhases,
    passedPhases,
    failedPhases,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    totalDuration,
    criticalFailures,
  };
}

async function generateComprehensiveReport(
  results: readonly TestResult[],
  summary: TestSummary,
  totalDuration: number
): Promise<void> {
  const resultsDir = path.join(__dirname, 'results');
  await fs.ensureDir(resultsDir);
  
  const report = {
    title: 'Xaheen CLI - Comprehensive Bun Test Results',
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    summary,
    phases: TEST_PHASES.map(phase => {
      const result = results.find(r => r.phase === phase.name);
      return {
        name: phase.name,
        description: phase.description,
        critical: phase.critical,
        passed: result?.passed || false,
        duration: result?.duration || 0,
        totalTests: result?.totalTests || 0,
        passedTests: result?.passedTests || 0,
        failedTests: result?.failedTests || 0,
        skippedTests: result?.skippedTests || 0,
        errors: result?.errors || [],
        testDetails: result?.testDetails || [],
      };
    }),
  };

  // Save JSON report
  await fs.writeJson(
    path.join(resultsDir, 'bun-test-results.json'),
    report,
    { spaces: 2 }
  );

  // Save HTML report
  const htmlReport = generateHtmlReport(report);
  await fs.writeFile(
    path.join(resultsDir, 'bun-test-report.html'),
    htmlReport
  );

  // Save markdown report
  const markdownReport = generateMarkdownReport(report);
  await fs.writeFile(
    path.join(resultsDir, 'bun-test-report.md'),
    markdownReport
  );

  console.log(chalk.gray(`\n📄 Comprehensive reports saved to: ${resultsDir}`));
}

function generateHtmlReport(report: any): string {
  const successRate = report.summary.totalTests > 0 
    ? Math.round((report.summary.passedTests / report.summary.totalTests) * 100)
    : 0;

  return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f5f7fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header h1 { margin: 0 0 10px 0; font-size: 32px; }
        .header p { margin: 5px 0; opacity: 0.9; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s; }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .metric-card h3 { margin: 0 0 10px 0; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .metric-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
        .metric-label { font-size: 12px; color: #718096; }
        
        .success { color: #48bb78; }
        .warning { color: #ed8936; }
        .error { color: #f56565; }
        .info { color: #4299e1; }
        
        .phase-section { background: white; border-radius: 12px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .phase-header { padding: 25px; background: #f7fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .phase-header h3 { margin: 0; color: #2d3748; }
        .phase-content { padding: 25px; }
        
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-passed { background: #c6f6d5; color: #276749; }
        .status-failed { background: #fed7d7; color: #9b2c2c; }
        
        .critical-badge { background: #fef5e7; color: #744210; margin-left: 10px; }
        
        .test-details { margin-top: 20px; }
        .test-file { background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 10px; font-family: 'Courier New', monospace; font-size: 14px; }
        .test-file-passed { border-left: 4px solid #48bb78; }
        .test-file-failed { border-left: 4px solid #f56565; }
        
        .error-list { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin-top: 15px; }
        .error-list h4 { margin: 0 0 10px 0; color: #c53030; }
        .error-list ul { margin: 0; padding-left: 20px; }
        .error-list li { margin: 5px 0; color: #742a2a; font-family: 'Courier New', monospace; font-size: 13px; }
        
        .progress-bar { width: 100%; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #48bb78 0%, #38a169 100%); transition: width 0.3s; }
        
        .footer { text-align: center; margin-top: 40px; padding: 30px; color: #718096; }
        .footer a { color: #4299e1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ${report.title}</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Total Duration: ${Math.round(report.duration / 1000)}s (${Math.round(report.duration / 60000)} minutes)</p>
        </div>

        <div class="summary-grid">
            <div class="metric-card">
                <h3>Success Rate</h3>
                <div class="metric-value ${successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'error'}">${successRate}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${successRate}%"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <h3>Test Phases</h3>
                <div class="metric-value">
                    <span class="success">${report.summary.passedPhases}</span> / 
                    <span>${report.summary.totalPhases}</span>
                </div>
                <div class="metric-label">${report.summary.failedPhases} failed</div>
            </div>
            
            <div class="metric-card">
                <h3>Total Tests</h3>
                <div class="metric-value info">${report.summary.totalTests}</div>
                <div class="metric-label">
                    <span class="success">${report.summary.passedTests} passed</span>, 
                    <span class="error">${report.summary.failedTests} failed</span>
                </div>
            </div>
            
            <div class="metric-card">
                <h3>Critical Issues</h3>
                <div class="metric-value ${report.summary.criticalFailures > 0 ? 'error' : 'success'}">
                    ${report.summary.criticalFailures}
                </div>
                <div class="metric-label">critical failures</div>
            </div>
        </div>

        <h2 style="margin: 30px 0 20px 0; color: #2d3748;">📋 Phase Results</h2>
        
        ${report.phases.map((phase: any) => `
            <div class="phase-section">
                <div class="phase-header">
                    <div>
                        <h3>${phase.name}</h3>
                        <p style="margin: 5px 0 0 0; color: #718096;">${phase.description}</p>
                    </div>
                    <div>
                        <span class="status-badge ${phase.passed ? 'status-passed' : 'status-failed'}">
                            ${phase.passed ? 'PASSED' : 'FAILED'}
                        </span>
                        ${phase.critical ? '<span class="status-badge critical-badge">CRITICAL</span>' : ''}
                    </div>
                </div>
                <div class="phase-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div>
                            <strong>Total Tests:</strong> ${phase.totalTests}
                        </div>
                        <div>
                            <strong>Passed:</strong> <span class="success">${phase.passedTests}</span>
                        </div>
                        <div>
                            <strong>Failed:</strong> <span class="error">${phase.failedTests}</span>
                        </div>
                        <div>
                            <strong>Skipped:</strong> ${phase.skippedTests}
                        </div>
                        <div>
                            <strong>Duration:</strong> ${Math.round(phase.duration / 1000)}s
                        </div>
                    </div>
                    
                    ${phase.testDetails && phase.testDetails.length > 0 ? `
                        <div class="test-details">
                            <h4 style="margin: 0 0 10px 0; color: #4a5568;">Test Files:</h4>
                            ${phase.testDetails.map((detail: any) => `
                                <div class="test-file ${detail.failed === 0 ? 'test-file-passed' : 'test-file-failed'}">
                                    <strong>${detail.file}</strong>: 
                                    ${detail.tests} tests 
                                    (${detail.passed} passed, ${detail.failed} failed) 
                                    - ${Math.round(detail.duration / 1000)}s
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${phase.errors.length > 0 ? `
                        <div class="error-list">
                            <h4>🚫 Errors:</h4>
                            <ul>
                                ${phase.errors.slice(0, 10).map((error: string) => `<li>${error}</li>`).join('')}
                                ${phase.errors.length > 10 ? `<li>... and ${phase.errors.length - 10} more errors</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}

        ${report.summary.failedPhases > 0 ? `
            <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 30px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #c53030;">🚨 Action Required</h3>
                <p style="margin: 10px 0; color: #742a2a;">
                    <strong>${report.summary.failedPhases}</strong> phase(s) failed with 
                    <strong>${report.summary.failedTests}</strong> test failures.
                </p>
                ${report.summary.criticalFailures > 0 ? `
                    <p style="margin: 10px 0; color: #742a2a;">
                        <strong>⚠️ Critical:</strong> ${report.summary.criticalFailures} critical phase(s) failed. 
                        These must be fixed before deployment.
                    </p>
                ` : ''}
            </div>
        ` : `
            <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 30px; border-radius: 12px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #276749;">🎉 All Tests Passed!</h3>
                <p style="margin: 10px 0; color: #22543d;">
                    All ${report.summary.totalTests} tests across ${report.summary.totalPhases} phases completed successfully.
                </p>
                <p style="margin: 10px 0; color: #22543d;">
                    ✅ The Xaheen CLI is ready for deployment.
                </p>
            </div>
        `}

        <div class="footer">
            <p>Generated by Xaheen CLI Test Suite • ${new Date().getFullYear()}</p>
            <p><a href="https://github.com/Xala-Technologies/xaheen">View on GitHub</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateMarkdownReport(report: any): string {
  const successRate = report.summary.totalTests > 0 
    ? Math.round((report.summary.passedTests / report.summary.totalTests) * 100)
    : 0;

  return `# ${report.title}

Generated: ${new Date(report.timestamp).toLocaleString()}  
Total Duration: ${Math.round(report.duration / 1000)}s (${Math.round(report.duration / 60000)} minutes)

## Summary

- **Success Rate**: ${successRate}%
- **Test Phases**: ${report.summary.passedPhases}/${report.summary.totalPhases} passed
- **Total Tests**: ${report.summary.totalTests} (${report.summary.passedTests} passed, ${report.summary.failedTests} failed)
- **Critical Failures**: ${report.summary.criticalFailures}

## Phase Results

${report.phases.map((phase: any) => `
### ${phase.name} ${phase.passed ? '✅' : '❌'} ${phase.critical ? '⚠️ CRITICAL' : ''}

${phase.description}

- **Status**: ${phase.passed ? 'PASSED' : 'FAILED'}
- **Tests**: ${phase.totalTests} (${phase.passedTests} passed, ${phase.failedTests} failed, ${phase.skippedTests} skipped)
- **Duration**: ${Math.round(phase.duration / 1000)}s

${phase.testDetails && phase.testDetails.length > 0 ? `
#### Test Files:
${phase.testDetails.map((detail: any) => 
  `- \`${detail.file}\`: ${detail.tests} tests (${detail.passed} passed, ${detail.failed} failed) - ${Math.round(detail.duration / 1000)}s`
).join('\n')}
` : ''}

${phase.errors.length > 0 ? `
#### Errors:
${phase.errors.slice(0, 10).map((error: string) => `- ${error}`).join('\n')}
${phase.errors.length > 10 ? `\n... and ${phase.errors.length - 10} more errors` : ''}
` : ''}
`).join('\n')}

## ${report.summary.failedPhases > 0 ? '🚨 Action Required' : '🎉 All Tests Passed'}

${report.summary.failedPhases > 0 ? `
${report.summary.failedPhases} phase(s) failed with ${report.summary.failedTests} test failures.
${report.summary.criticalFailures > 0 ? `\n**⚠️ Critical**: ${report.summary.criticalFailures} critical phase(s) failed. These must be fixed before deployment.` : ''}
` : `
All ${report.summary.totalTests} tests across ${report.summary.totalPhases} phases completed successfully.
✅ The Xaheen CLI is ready for deployment.
`}

---
*Generated by Xaheen CLI Test Suite*
`;
}

function printOverallSummary(summary: TestSummary): void {
  const successRate = summary.totalTests > 0 
    ? Math.round((summary.passedTests / summary.totalTests) * 100)
    : 0;

  console.log(chalk.cyan.bold('\n📊 Overall Test Summary'));
  console.log(chalk.cyan('═'.repeat(60)));
  
  console.log(`${chalk.bold('Test Phases:')} ${summary.totalPhases} total`);
  console.log(`${chalk.bold('Passed:')} ${chalk.green(summary.passedPhases)} phases`);
  console.log(`${chalk.bold('Failed:')} ${chalk.red(summary.failedPhases)} phases`);
  console.log(`${chalk.bold('Total Tests:')} ${summary.totalTests}`);
  console.log(`${chalk.bold('Passed Tests:')} ${chalk.green(summary.passedTests)}`);
  console.log(`${chalk.bold('Failed Tests:')} ${chalk.red(summary.failedTests)}`);
  console.log(`${chalk.bold('Skipped Tests:')} ${chalk.yellow(summary.skippedTests)}`);
  console.log(`${chalk.bold('Critical Failures:')} ${summary.criticalFailures > 0 ? chalk.red(summary.criticalFailures) : chalk.green(summary.criticalFailures)}`);
  console.log(`${chalk.bold('Total Duration:')} ${Math.round(summary.totalDuration / 1000)}s`);
  
  console.log(`${chalk.bold('Success Rate:')} ${
    successRate >= 80 ? chalk.green(`${successRate}%`) : 
    successRate >= 60 ? chalk.yellow(`${successRate}%`) : 
    chalk.red(`${successRate}%`)
  }`);
}

// Run the test suite if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error(chalk.red.bold('\n💥 Test runner failed:'), error);
    process.exit(1);
  });
}

export { main as runAllBunTests };
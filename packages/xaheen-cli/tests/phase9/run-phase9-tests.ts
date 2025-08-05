#!/usr/bin/env tsx

/**
 * Phase 9: Cross-Cutting Quality & Security Test Runner
 * 
 * Orchestrates all Phase 9 security and quality tests including:
 * - Static analysis (ESLint security rules)
 * - Security scanning (npm audit, Snyk)
 * - Mutation testing (Stryker)
 * - Fuzz testing (CLI input validation)
 * - Input sanitization validation
 */

import { execSync, spawn } from 'child_process';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import { join, resolve } from 'path';
import { performance } from 'perf_hooks';

interface TestSuiteResult {
  name: string;
  category: string;
  passed: boolean;
  duration: number;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

interface Phase9Report {
  timestamp: string;
  duration: number;
  summary: {
    totalSuites: number;
    passed: number;
    failed: number;
    skipped: number;
    securityScore: number;
    qualityScore: number;
    overallScore: number;
  };
  suites: TestSuiteResult[];
  security: {
    staticAnalysis: boolean;
    vulnerabilityScanning: boolean;
    mutationTesting: boolean;
    fuzzTesting: boolean;
    inputValidation: boolean;
  };
  recommendations: string[];
  artifacts: string[];
}

class Phase9TestRunner {
  private testOutputDir: string;
  private startTime: number;
  private results: TestSuiteResult[] = [];
  private verbose: boolean;
  private ciMode: boolean;
  private skipSlowTests: boolean;
  private onlyCategory?: string;

  constructor(options: {
    verbose?: boolean;
    ci?: boolean;
    skipSlow?: boolean;
    category?: string;
  } = {}) {
    this.testOutputDir = resolve(process.cwd(), 'test-output/phase9');
    this.startTime = performance.now();
    this.verbose = options.verbose || false;
    this.ciMode = options.ci || process.env.CI === 'true';
    this.skipSlowTests = options.skipSlow || false;
    this.onlyCategory = options.category;
  }

  async run(): Promise<void> {
    console.log('🔒 Starting Phase 9: Cross-Cutting Quality & Security Tests');
    console.log('=' .repeat(60));

    // Ensure output directory exists
    await mkdir(this.testOutputDir, { recursive: true });

    // Define test suites
    const testSuites = [
      {
        name: 'Static Analysis',
        category: 'static-analysis',
        command: 'npx vitest run tests/phase9/static-analysis --reporter=verbose',
        timeout: 120000, // 2 minutes
        critical: true,
      },
      {
        name: 'npm Audit Security Scan',
        category: 'security-scanning',
        command: 'npx vitest run tests/phase9/security/npm-audit.test.ts --reporter=verbose',
        timeout: 180000, // 3 minutes
        critical: true,
      },
      {
        name: 'Snyk Security Scan',
        category: 'security-scanning',
        command: 'npx vitest run tests/phase9/security/snyk-scan.test.ts --reporter=verbose',
        timeout: 300000, // 5 minutes
        critical: false, // May not be available in all environments
      },
      {
        name: 'Mutation Testing',
        category: 'mutation-testing',
        command: 'npx vitest run tests/phase9/mutation/stryker-mutation.test.ts --reporter=verbose',
        timeout: 900000, // 15 minutes
        critical: false,
        slow: true,
      },
      {
        name: 'CLI Fuzz Testing',
        category: 'fuzz-testing',
        command: 'npx vitest run tests/phase9/fuzz/cli-fuzz.test.ts --reporter=verbose',
        timeout: 600000, // 10 minutes
        critical: true,
        slow: true,
      },
      {
        name: 'Input Sanitization',
        category: 'input-sanitization',
        command: 'npx vitest run tests/phase9/sanitization/input-validation.test.ts --reporter=verbose',
        timeout: 120000, // 2 minutes
        critical: true,
      },
    ];

    // Filter test suites based on options
    const suitesToRun = testSuites.filter(suite => {
      if (this.onlyCategory && suite.category !== this.onlyCategory) {
        return false;
      }
      if (this.skipSlowTests && suite.slow) {
        return false;
      }
      return true;
    });

    console.log(`Running ${suitesToRun.length} test suites...\n`);

    // Run test suites
    for (const suite of suitesToRun) {
      await this.runTestSuite(suite);
    }

    // Generate comprehensive report
    await this.generateReport();

    // Print summary
    this.printSummary();

    // Exit with appropriate code
    const failed = this.results.filter(r => !r.passed && !r.skipped).length;
    if (failed > 0) {
      process.exit(1);
    }
  }

  private async runTestSuite(suite: {
    name: string;
    category: string;
    command: string;
    timeout: number;
    critical: boolean;
    slow?: boolean;
  }): Promise<void> {
    console.log(`📋 Running ${suite.name}...`);
    
    const startTime = performance.now();
    let result: TestSuiteResult;

    try {
      // Check if test file exists
      const testPath = this.getTestPath(suite.command);
      if (testPath) {
        const exists = await access(testPath).then(() => true).catch(() => false);
        if (!exists) {
          result = {
            name: suite.name,
            category: suite.category,
            passed: false,
            duration: 0,
            exitCode: -1,
            stdout: '',
            stderr: `Test file not found: ${testPath}`,
            skipped: true,
            skipReason: 'Test file not found',
          };
          this.results.push(result);
          console.log(`⚠️  Skipped ${suite.name}: Test file not found`);
          return;
        }
      }

      const { exitCode, stdout, stderr } = await this.executeCommand(
        suite.command,
        suite.timeout
      );

      const duration = performance.now() - startTime;

      result = {
        name: suite.name,
        category: suite.category,
        passed: exitCode === 0,
        duration,
        exitCode,
        stdout,
        stderr,
      };

      if (this.verbose || exitCode !== 0) {
        console.log(`📊 ${suite.name} Output:`);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
      }

      const status = exitCode === 0 ? '✅' : '❌';
      const durationText = `(${Math.round(duration)}ms)`;
      console.log(`${status} ${suite.name} ${durationText}\n`);

    } catch (error) {
      const duration = performance.now() - startTime;
      result = {
        name: suite.name,
        category: suite.category,
        passed: false,
        duration,
        exitCode: -1,
        stdout: '',
        stderr: '',
        error: (error as Error).message,
      };

      console.log(`❌ ${suite.name} failed: ${(error as Error).message}\n`);
    }

    this.results.push(result);

    // Write individual test result
    const resultPath = join(
      this.testOutputDir,
      `${suite.category}-${suite.name.replace(/\s+/g, '-').toLowerCase()}.json`
    );
    await writeFile(resultPath, JSON.stringify(result, null, 2));

    // In CI mode, fail fast on critical test failures
    if (this.ciMode && suite.critical && !result.passed && !result.skipped) {
      console.error(`💥 Critical test failed in CI mode: ${suite.name}`);
      console.error('Stopping execution due to critical failure.');
      process.exit(1);
    }
  }

  private getTestPath(command: string): string | null {
    const match = command.match(/tests\/phase9\/[^\s]+\.test\.ts/);
    return match ? resolve(process.cwd(), match[0]) : null;
  }

  private async executeCommand(
    command: string,
    timeout: number
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, { 
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ exitCode: code || 0, stdout, stderr });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGTERM');
          setTimeout(() => {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
          }, 5000);
        }
      }, timeout);
    });
  }

  private async generateReport(): Promise<void> {
    const totalDuration = performance.now() - this.startTime;
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && !r.skipped).length;
    const skipped = this.results.filter(r => r.skipped).length;

    // Calculate security and quality scores
    const securityTests = this.results.filter(r => 
      r.category.includes('security') || 
      r.category.includes('fuzz') || 
      r.category.includes('sanitization')
    );
    const securityScore = this.calculateScore(securityTests);

    const qualityTests = this.results.filter(r => 
      r.category.includes('static') || 
      r.category.includes('mutation')
    );
    const qualityScore = this.calculateScore(qualityTests);

    const overallScore = Math.round((securityScore + qualityScore) / 2);

    const report: Phase9Report = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        totalSuites: this.results.length,
        passed,
        failed,
        skipped,
        securityScore,
        qualityScore,
        overallScore,
      },
      suites: this.results,
      security: {
        staticAnalysis: this.results.some(r => r.category === 'static-analysis' && r.passed),
        vulnerabilityScanning: this.results.some(r => r.category === 'security-scanning' && r.passed),
        mutationTesting: this.results.some(r => r.category === 'mutation-testing' && r.passed),
        fuzzTesting: this.results.some(r => r.category === 'fuzz-testing' && r.passed),
        inputValidation: this.results.some(r => r.category === 'input-sanitization' && r.passed),
      },
      recommendations: this.generateRecommendations(),
      artifacts: await this.collectArtifacts(),
    };

    const reportPath = join(this.testOutputDir, 'phase9-comprehensive-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report if in CI mode
    if (this.ciMode) {
      await this.generateHtmlReport(report);
    }

    console.log(`📊 Report saved to: ${reportPath}`);
  }

  private calculateScore(tests: TestSuiteResult[]): number {
    if (tests.length === 0) return 0;
    
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.passed).length;
    const skippedTests = tests.filter(t => t.skipped).length;
    
    // Don't penalize for skipped tests, but don't count them as passed
    const effectiveTotal = totalTests - skippedTests;
    if (effectiveTotal === 0) return 50; // Neutral score if all skipped
    
    return Math.round((passedTests / effectiveTotal) * 100);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedTests = this.results.filter(r => !r.passed && !r.skipped);

    if (failedTests.some(r => r.category === 'static-analysis')) {
      recommendations.push('Fix static analysis issues to improve code security and quality');
    }

    if (failedTests.some(r => r.category === 'security-scanning')) {
      recommendations.push('Address security vulnerabilities found in dependency scanning');
    }

    if (failedTests.some(r => r.category === 'fuzz-testing')) {
      recommendations.push('Critical: Fix input validation issues found in fuzz testing');
    }

    if (failedTests.some(r => r.category === 'input-sanitization')) {
      recommendations.push('Critical: Implement proper input sanitization and validation');
    }

    if (failedTests.some(r => r.category === 'mutation-testing')) {
      recommendations.push('Improve test coverage and assertion quality based on mutation testing');
    }

    // General recommendations
    if (failedTests.length === 0) {
      recommendations.push('Excellent security posture! Continue regular security testing');
      recommendations.push('Consider adding Phase 9 tests to pre-commit hooks');
    }

    recommendations.push('Implement continuous security monitoring and scanning');
    recommendations.push('Regular security training for development team');

    return recommendations;
  }

  private async collectArtifacts(): Promise<string[]> {
    const artifacts: string[] = [];
    
    try {
      const files = await require('fs').promises.readdir(this.testOutputDir);
      
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.xml')) {
          artifacts.push(join(this.testOutputDir, file));
        }
      }
    } catch (error) {
      console.warn('Could not collect artifacts:', error);
    }

    return artifacts;
  }

  private async generateHtmlReport(report: Phase9Report): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase 9: Security & Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 2em; font-weight: bold; margin: 10px; }
        .score.excellent { color: #28a745; }
        .score.good { color: #ffc107; }
        .score.poor { color: #dc3545; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #007bff; }
        .test-results { margin-top: 30px; }
        .test-suite { margin-bottom: 20px; padding: 15px; border-radius: 5px; }
        .test-suite.passed { background-color: #d4edda; border-left: 4px solid #28a745; }
        .test-suite.failed { background-color: #f8d7da; border-left: 4px solid #dc3545; }
        .test-suite.skipped { background-color: #fff3cd; border-left: 4px solid #ffc107; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-top: 30px; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Phase 9: Security & Quality Report</h1>
            <div class="timestamp">Generated: ${report.timestamp}</div>
            <div class="score ${this.getScoreClass(report.summary.overallScore)}">
                Overall Score: ${report.summary.overallScore}/100
            </div>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.totalSuites}</div>
                <div>Total Suites</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.skipped}</div>
                <div>Skipped</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.securityScore}/100</div>
                <div>Security Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.qualityScore}/100</div>
                <div>Quality Score</div>
            </div>
        </div>

        <div class="test-results">
            <h2>Test Results</h2>
            ${report.suites.map(suite => `
                <div class="test-suite ${suite.skipped ? 'skipped' : suite.passed ? 'passed' : 'failed'}">
                    <h3>${suite.name} (${suite.category})</h3>
                    <p><strong>Status:</strong> ${suite.skipped ? 'Skipped' : suite.passed ? 'Passed' : 'Failed'}</p>
                    <p><strong>Duration:</strong> ${Math.round(suite.duration)}ms</p>
                    ${suite.skipReason ? `<p><strong>Skip Reason:</strong> ${suite.skipReason}</p>` : ''}
                    ${suite.error ? `<p><strong>Error:</strong> ${suite.error}</p>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

    const htmlPath = join(this.testOutputDir, 'phase9-report.html');
    await writeFile(htmlPath, html);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    return 'poor';
  }

  private printSummary(): void {
    const totalDuration = performance.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && !r.skipped).length;
    const skipped = this.results.filter(r => r.skipped).length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Phase 9 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`Total Suites: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed && !r.skipped)
        .forEach(r => console.log(`  - ${r.name} (${r.category})`));
    }

    if (skipped > 0) {
      console.log('\n⚠️  Skipped Tests:');
      this.results
        .filter(r => r.skipped)
        .forEach(r => console.log(`  - ${r.name}: ${r.skipReason}`));
    }

    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('🎉 All Phase 9 tests passed! Excellent security posture.');
    } else {
      console.log('🚨 Some Phase 9 tests failed. Review security issues immediately.');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options: any = {};

  for (const arg of args) {
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--skip-slow') {
      options.skipSlow = true;
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    }
  }

  const runner = new Phase9TestRunner(options);
  await runner.run();
}

// Run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Phase 9 test runner failed:', error);
    process.exit(1);
  });
}

export { Phase9TestRunner, type Phase9Report, type TestSuiteResult };
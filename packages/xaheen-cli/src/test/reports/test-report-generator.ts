/**
 * @fileoverview Test Report Generator - EPIC 14 Story 14.5 & EPIC 13 Story 13.7
 * @description Generate detailed test reports with coverage, performance metrics, and CI/CD integration
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { join } from 'path';
import fs from 'fs-extra';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Test result interfaces
 */
export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  file: string;
  suite: string;
  errors?: TestError[];
  warnings?: string[];
  assertions: number;
  retries: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface TestError {
  message: string;
  stack?: string;
  type: string;
  expected?: any;
  actual?: any;
  diff?: string;
}

export interface TestSuite {
  name: string;
  file: string;
  duration: number;
  tests: TestResult[];
  hooks: {
    beforeAll: number;
    afterAll: number;
    beforeEach: number;
    afterEach: number;
  };
  coverage?: CoverageData;
  performance?: PerformanceMetrics;
}

export interface CoverageData {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
  files: CoverageFile[];
}

export interface CoverageFile {
  path: string;
  lines: number[];
  functions: number[];
  branches: number[];
  statements: number[];
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export interface PerformanceMetrics {
  totalDuration: number;
  averageTestDuration: number;
  slowestTests: Array<{
    name: string;
    duration: number;
    file: string;
  }>;
  memoryUsage: {
    peak: number;
    average: number;
    final: number;
  };
  resourceUtilization: {
    cpu: number;
    memory: number;
    io: number;
  };
}

export interface TestSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  environment: {
    node: string;
    platform: string;
    os: string;
    arch: string;
    memory: number;
    cpus: number;
  };
  configuration: {
    parallel: boolean;
    workers: number;
    timeout: number;
    retries: number;
    coverage: boolean;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    pending: number;
    flaky: number;
  };
  suites: TestSuite[];
  coverage: CoverageData;
  performance: PerformanceMetrics;
  compliance: ComplianceReport;
  artifacts: TestArtifact[];
}

export interface ComplianceReport {
  nsm: {
    classification: string;
    requirements: Array<{
      id: string;
      description: string;
      status: 'compliant' | 'non-compliant' | 'not-applicable';
      evidence?: string[];
    }>;
  };
  accessibility: {
    wcag: {
      level: 'A' | 'AA' | 'AAA';
      violations: Array<{
        rule: string;
        impact: 'minor' | 'moderate' | 'serious' | 'critical';
        description: string;
        elements: string[];
      }>;
    };
  };
  security: {
    vulnerabilities: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      description: string;
      file: string;
      line?: number;
    }>;
  };
  performance: {
    thresholds: Array<{
      metric: string;
      threshold: number;
      actual: number;
      status: 'pass' | 'warn' | 'fail';
    }>;
  };
}

export interface TestArtifact {
  type: 'screenshot' | 'video' | 'log' | 'trace' | 'report';
  name: string;
  path: string;
  size: number;
  metadata?: Record<string, any>;
}

/**
 * Test Report Generator
 */
export class TestReportGenerator {
  private outputDir: string;
  private templateDir: string;
  private session: TestSession;

  constructor(outputDir: string = './test-reports', templateDir?: string) {
    this.outputDir = outputDir;
    this.templateDir = templateDir || join(__dirname, 'templates');
    this.session = this.initializeSession();
  }

  /**
   * Initialize test session
   */
  private initializeSession(): TestSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      environment: {
        node: process.version,
        platform: process.platform,
        os: require('os').type(),
        arch: process.arch,
        memory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024), // GB
        cpus: require('os').cpus().length,
      },
      configuration: {
        parallel: false,
        workers: 1,
        timeout: 30000,
        retries: 0,
        coverage: false,
      },
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
        flaky: 0,
      },
      suites: [],
      coverage: {
        lines: { total: 0, covered: 0, percentage: 0 },
        functions: { total: 0, covered: 0, percentage: 0 },
        branches: { total: 0, covered: 0, percentage: 0 },
        statements: { total: 0, covered: 0, percentage: 0 },
        files: [],
      },
      performance: {
        totalDuration: 0,
        averageTestDuration: 0,
        slowestTests: [],
        memoryUsage: {
          peak: 0,
          average: 0,
          final: 0,
        },
        resourceUtilization: {
          cpu: 0,
          memory: 0,
          io: 0,
        },
      },
      compliance: {
        nsm: {
          classification: 'OPEN',
          requirements: [],
        },
        accessibility: {
          wcag: {
            level: 'AA',
            violations: [],
          },
        },
        security: {
          vulnerabilities: [],
        },
        performance: {
          thresholds: [],
        },
      },
      artifacts: [],
    };
  }

  /**
   * Start test session
   */
  startSession(configuration: Partial<TestSession['configuration']> = {}): void {
    this.session.startTime = new Date();
    this.session.configuration = { ...this.session.configuration, ...configuration };
  }

  /**
   * End test session
   */
  endSession(): void {
    this.session.endTime = new Date();
    this.session.duration = this.session.endTime.getTime() - this.session.startTime.getTime();
    this.calculateSummary();
    this.calculatePerformanceMetrics();
  }

  /**
   * Add test suite results
   */
  addSuite(suite: TestSuite): void {
    this.session.suites.push(suite);
    this.updateCoverage(suite.coverage);
  }

  /**
   * Add test result
   */
  addTestResult(result: TestResult, suiteName: string): void {
    let suite = this.session.suites.find(s => s.name === suiteName);
    
    if (!suite) {
      suite = {
        name: suiteName,
        file: result.file,
        duration: 0,
        tests: [],
        hooks: {
          beforeAll: 0,
          afterAll: 0,
          beforeEach: 0,
          afterEach: 0,
        },
      };
      this.session.suites.push(suite);
    }

    suite.tests.push(result);
    suite.duration += result.duration;
  }

  /**
   * Add artifact
   */
  addArtifact(artifact: TestArtifact): void {
    this.session.artifacts.push(artifact);
  }

  /**
   * Generate comprehensive HTML report
   */
  async generateHTMLReport(): Promise<string> {
    await fs.ensureDir(this.outputDir);
    
    const reportPath = join(this.outputDir, 'index.html');
    const html = await this.renderHTMLReport();
    
    await fs.writeFile(reportPath, html);
    
    // Generate static assets
    await this.generateStaticAssets();
    
    return reportPath;
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(): Promise<string> {
    await fs.ensureDir(this.outputDir);
    
    const reportPath = join(this.outputDir, 'report.json');
    const jsonReport = {
      session: this.session,
      generatedAt: new Date().toISOString(),
      generator: {
        name: 'xaheen-cli-test-reporter',
        version: '1.0.0',
      },
    };
    
    await fs.writeFile(reportPath, JSON.stringify(jsonReport, null, 2));
    return reportPath;
  }

  /**
   * Generate JUnit XML report
   */
  async generateJUnitReport(): Promise<string> {
    await fs.ensureDir(this.outputDir);
    
    const reportPath = join(this.outputDir, 'junit.xml');
    const xml = this.renderJUnitXML();
    
    await fs.writeFile(reportPath, xml);
    return reportPath;
  }

  /**
   * Generate coverage report
   */
  async generateCoverageReport(): Promise<string> {
    await fs.ensureDir(join(this.outputDir, 'coverage'));
    
    const reportPath = join(this.outputDir, 'coverage', 'index.html');
    const html = await this.renderCoverageReport();
    
    await fs.writeFile(reportPath, html);
    return reportPath;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<string> {
    await fs.ensureDir(this.outputDir);
    
    const reportPath = join(this.outputDir, 'performance.html');
    const html = await this.renderPerformanceReport();
    
    await fs.writeFile(reportPath, html);
    return reportPath;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(): Promise<string> {
    await fs.ensureDir(this.outputDir);
    
    const reportPath = join(this.outputDir, 'compliance.html');
    const html = await this.renderComplianceReport();
    
    await fs.writeFile(reportPath, html);
    return reportPath;
  }

  /**
   * Generate all reports
   */
  async generateAllReports(): Promise<{
    html: string;
    json: string;
    junit: string;
    coverage: string;
    performance: string;
    compliance: string;
  }> {
    this.endSession();
    
    const [html, json, junit, coverage, performance, compliance] = await Promise.all([
      this.generateHTMLReport(),
      this.generateJSONReport(),
      this.generateJUnitReport(),
      this.generateCoverageReport(),
      this.generatePerformanceReport(),
      this.generateComplianceReport(),
    ]);

    // Generate summary dashboard
    await this.generateDashboard();

    return { html, json, junit, coverage, performance, compliance };
  }

  /**
   * Render HTML report
   */
  private async renderHTMLReport(): Promise<string> {
    const template = await this.loadTemplate('report.html');
    
    return template
      .replace('{{SESSION_DATA}}', JSON.stringify(this.session))
      .replace('{{TITLE}}', `Test Report - ${format(this.session.startTime, 'PPP', { locale: nb })}`)
      .replace('{{SUMMARY}}', this.renderSummarySection())
      .replace('{{SUITES}}', this.renderSuitesSection())
      .replace('{{COVERAGE}}', this.renderCoverageSection())
      .replace('{{PERFORMANCE}}', this.renderPerformanceSection())
      .replace('{{COMPLIANCE}}', this.renderComplianceSection())
      .replace('{{ARTIFACTS}}', this.renderArtifactsSection());
  }

  /**
   * Render JUnit XML
   */
  private renderJUnitXML(): string {
    const { summary, suites, duration } = this.session;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testsuites name="Xaheen CLI Tests" tests="${summary.total}" failures="${summary.failed}" errors="0" skipped="${summary.skipped}" time="${duration / 1000}">\n`;
    
    for (const suite of suites) {
      xml += `  <testsuite name="${this.escapeXml(suite.name)}" tests="${suite.tests.length}" failures="${suite.tests.filter(t => t.status === 'failed').length}" errors="0" skipped="${suite.tests.filter(t => t.status === 'skipped').length}" time="${suite.duration / 1000}" file="${this.escapeXml(suite.file)}">\n`;
      
      for (const test of suite.tests) {
        xml += `    <testcase name="${this.escapeXml(test.name)}" classname="${this.escapeXml(suite.name)}" time="${test.duration / 1000}"`;
        
        if (test.status === 'failed') {
          xml += `>\n`;
          if (test.errors && test.errors.length > 0) {
            for (const error of test.errors) {
              xml += `      <failure message="${this.escapeXml(error.message)}" type="${this.escapeXml(error.type)}">\n`;
              if (error.stack) {
                xml += `        <![CDATA[${error.stack}]]>\n`;
              }
              xml += `      </failure>\n`;
            }
          }
          xml += `    </testcase>\n`;
        } else if (test.status === 'skipped') {
          xml += `>\n      <skipped/>\n    </testcase>\n`;
        } else {
          xml += `/>\n`;
        }
      }
      
      xml += `  </testsuite>\n`;
    }
    
    xml += `</testsuites>\n`;
    return xml;
  }

  /**
   * Render coverage report
   */
  private async renderCoverageReport(): Promise<string> {
    const template = await this.loadTemplate('coverage.html');
    
    return template
      .replace('{{COVERAGE_DATA}}', JSON.stringify(this.session.coverage))
      .replace('{{TOTAL_COVERAGE}}', this.session.coverage.statements.percentage.toFixed(2))
      .replace('{{FILES_TABLE}}', this.renderCoverageFilesTable());
  }

  /**
   * Render performance report
   */
  private async renderPerformanceReport(): Promise<string> {
    const template = await this.loadTemplate('performance.html');
    
    return template
      .replace('{{PERFORMANCE_DATA}}', JSON.stringify(this.session.performance))
      .replace('{{TOTAL_DURATION}}', this.formatDuration(this.session.performance.totalDuration))
      .replace('{{AVERAGE_DURATION}}', this.formatDuration(this.session.performance.averageTestDuration))
      .replace('{{SLOWEST_TESTS}}', this.renderSlowestTestsTable());
  }

  /**
   * Render compliance report
   */
  private async renderComplianceReport(): Promise<string> {
    const template = await this.loadTemplate('compliance.html');
    
    return template
      .replace('{{COMPLIANCE_DATA}}', JSON.stringify(this.session.compliance))
      .replace('{{NSM_STATUS}}', this.renderNSMComplianceStatus())
      .replace('{{ACCESSIBILITY_STATUS}}', this.renderAccessibilityStatus())
      .replace('{{SECURITY_STATUS}}', this.renderSecurityStatus())
      .replace('{{PERFORMANCE_THRESHOLDS}}', this.renderPerformanceThresholds());
  }

  /**
   * Generate dashboard
   */
  private async generateDashboard(): Promise<void> {
    const template = await this.loadTemplate('dashboard.html');
    
    const dashboardHtml = template
      .replace('{{SESSION_ID}}', this.session.id)
      .replace('{{TIMESTAMP}}', format(this.session.startTime, 'PPpp', { locale: nb }))
      .replace('{{TOTAL_TESTS}}', this.session.summary.total.toString())
      .replace('{{PASSED_TESTS}}', this.session.summary.passed.toString())
      .replace('{{FAILED_TESTS}}', this.session.summary.failed.toString())
      .replace('{{SUCCESS_RATE}}', this.calculateSuccessRate().toFixed(2))
      .replace('{{TOTAL_DURATION}}', this.formatDuration(this.session.duration))
      .replace('{{COVERAGE_PERCENTAGE}}', this.session.coverage.statements.percentage.toFixed(2));
    
    await fs.writeFile(join(this.outputDir, 'dashboard.html'), dashboardHtml);
  }

  /**
   * Generate static assets
   */
  private async generateStaticAssets(): Promise<void> {
    const assetsDir = join(this.outputDir, 'assets');
    await fs.ensureDir(assetsDir);
    
    // Generate CSS
    const css = await this.generateCSS();
    await fs.writeFile(join(assetsDir, 'styles.css'), css);
    
    // Generate JavaScript
    const js = await this.generateJavaScript();
    await fs.writeFile(join(assetsDir, 'scripts.js'), js);
    
    // Copy charts library
    const chartsJS = await this.loadTemplate('chart.min.js');
    await fs.writeFile(join(assetsDir, 'chart.min.js'), chartsJS);
  }

  // Helper methods for rendering sections
  private renderSummarySection(): string {
    const { summary, duration } = this.session;
    const successRate = this.calculateSuccessRate();
    
    return `
      <div class="summary-grid">
        <div class="summary-card ${summary.failed > 0 ? 'failed' : 'passed'}">
          <h3>Total Tests</h3>
          <div class="number">${summary.total}</div>
        </div>
        <div class="summary-card passed">
          <h3>Passed</h3>
          <div class="number">${summary.passed}</div>
        </div>
        <div class="summary-card failed">
          <h3>Failed</h3>
          <div class="number">${summary.failed}</div>
        </div>
        <div class="summary-card skipped">
          <h3>Skipped</h3>
          <div class="number">${summary.skipped}</div>
        </div>
        <div class="summary-card duration">
          <h3>Duration</h3>
          <div class="number">${this.formatDuration(duration)}</div>
        </div>
        <div class="summary-card success-rate">
          <h3>Success Rate</h3>
          <div class="number">${successRate.toFixed(2)}%</div>
        </div>
      </div>
    `;
  }

  private renderSuitesSection(): string {
    return this.session.suites.map(suite => `
      <div class="suite">
        <h3>${suite.name}</h3>
        <div class="suite-info">
          <span>File: ${suite.file}</span>
          <span>Duration: ${this.formatDuration(suite.duration)}</span>
          <span>Tests: ${suite.tests.length}</span>
        </div>
        <div class="tests">
          ${suite.tests.map(test => `
            <div class="test ${test.status}">
              <span class="test-name">${test.name}</span>
              <span class="test-duration">${this.formatDuration(test.duration)}</span>
              <span class="test-status">${test.status}</span>
              ${test.errors?.length ? `
                <div class="test-errors">
                  ${test.errors.map(error => `
                    <div class="error">
                      <strong>${error.type}:</strong> ${error.message}
                      ${error.stack ? `<pre>${error.stack}</pre>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  private renderCoverageSection(): string {
    const { coverage } = this.session;
    
    return `
      <div class="coverage-overview">
        <div class="coverage-metric">
          <h4>Statements</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${coverage.statements.percentage}%"></div>
          </div>
          <span>${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage.toFixed(2)}%)</span>
        </div>
        <div class="coverage-metric">
          <h4>Branches</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${coverage.branches.percentage}%"></div>
          </div>
          <span>${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage.toFixed(2)}%)</span>
        </div>
        <div class="coverage-metric">
          <h4>Functions</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${coverage.functions.percentage}%"></div>
          </div>
          <span>${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage.toFixed(2)}%)</span>
        </div>
        <div class="coverage-metric">
          <h4>Lines</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${coverage.lines.percentage}%"></div>
          </div>
          <span>${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage.toFixed(2)}%)</span>
        </div>
      </div>
    `;
  }

  private renderPerformanceSection(): string {
    const { performance } = this.session;
    
    return `
      <div class="performance-overview">
        <div class="perf-metric">
          <h4>Total Duration</h4>
          <span>${this.formatDuration(performance.totalDuration)}</span>
        </div>
        <div class="perf-metric">
          <h4>Average Test Duration</h4>
          <span>${this.formatDuration(performance.averageTestDuration)}</span>
        </div>
        <div class="perf-metric">
          <h4>Peak Memory</h4>
          <span>${this.formatBytes(performance.memoryUsage.peak)}</span>
        </div>
        <div class="slowest-tests">
          <h4>Slowest Tests</h4>
          ${performance.slowestTests.slice(0, 5).map(test => `
            <div class="slow-test">
              <span>${test.name}</span>
              <span>${this.formatDuration(test.duration)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private renderComplianceSection(): string {
    const { compliance } = this.session;
    
    return `
      <div class="compliance-overview">
        <div class="compliance-section">
          <h4>NSM Classification: ${compliance.nsm.classification}</h4>
          <div class="requirements">
            ${compliance.nsm.requirements.map(req => `
              <div class="requirement ${req.status}">
                <span>${req.id}: ${req.description}</span>
                <span class="status">${req.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="compliance-section">
          <h4>WCAG ${compliance.accessibility.wcag.level} Compliance</h4>
          <div class="violations">
            ${compliance.accessibility.wcag.violations.map(violation => `
              <div class="violation ${violation.impact}">
                <strong>${violation.rule}</strong>: ${violation.description}
                <div class="elements">${violation.elements.join(', ')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderArtifactsSection(): string {
    return this.session.artifacts.map(artifact => `
      <div class="artifact">
        <span class="artifact-type">${artifact.type}</span>
        <a href="${artifact.path}" class="artifact-name">${artifact.name}</a>
        <span class="artifact-size">${this.formatBytes(artifact.size)}</span>
      </div>
    `).join('');
  }

  // Utility methods
  private calculateSummary(): void {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
      flaky: 0,
    };

    for (const suite of this.session.suites) {
      for (const test of suite.tests) {
        summary.total++;
        summary[test.status]++;
        
        // Check for flaky tests (tests that passed after retries)
        if (test.retries > 0 && test.status === 'passed') {
          summary.flaky++;
        }
      }
    }

    this.session.summary = summary;
  }

  private calculatePerformanceMetrics(): void {
    const allTests = this.session.suites.flatMap(suite => suite.tests);
    const totalDuration = allTests.reduce((sum, test) => sum + test.duration, 0);
    const averageTestDuration = allTests.length > 0 ? totalDuration / allTests.length : 0;
    
    const slowestTests = allTests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(test => ({
        name: test.name,
        duration: test.duration,
        file: test.file,
      }));

    this.session.performance = {
      ...this.session.performance,
      totalDuration,
      averageTestDuration,
      slowestTests,
    };
  }

  private updateCoverage(coverage?: CoverageData): void {
    if (!coverage) return;
    
    const sessionCoverage = this.session.coverage;
    
    // Merge coverage data
    sessionCoverage.lines.total += coverage.lines.total;
    sessionCoverage.lines.covered += coverage.lines.covered;
    sessionCoverage.functions.total += coverage.functions.total;
    sessionCoverage.functions.covered += coverage.functions.covered;
    sessionCoverage.branches.total += coverage.branches.total;
    sessionCoverage.branches.covered += coverage.branches.covered;
    sessionCoverage.statements.total += coverage.statements.total;
    sessionCoverage.statements.covered += coverage.statements.covered;
    
    // Recalculate percentages
    sessionCoverage.lines.percentage = sessionCoverage.lines.total > 0 
      ? (sessionCoverage.lines.covered / sessionCoverage.lines.total) * 100 
      : 0;
    sessionCoverage.functions.percentage = sessionCoverage.functions.total > 0 
      ? (sessionCoverage.functions.covered / sessionCoverage.functions.total) * 100 
      : 0;
    sessionCoverage.branches.percentage = sessionCoverage.branches.total > 0 
      ? (sessionCoverage.branches.covered / sessionCoverage.branches.total) * 100 
      : 0;
    sessionCoverage.statements.percentage = sessionCoverage.statements.total > 0 
      ? (sessionCoverage.statements.covered / sessionCoverage.statements.total) * 100 
      : 0;
    
    // Add files
    sessionCoverage.files.push(...coverage.files);
  }

  private calculateSuccessRate(): number {
    const { total, passed } = this.session.summary;
    return total > 0 ? (passed / total) * 100 : 0;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async loadTemplate(name: string): Promise<string> {
    try {
      return await fs.readFile(join(this.templateDir, name), 'utf-8');
    } catch {
      // Return basic template if file not found
      return this.getDefaultTemplate(name);
    }
  }

  private getDefaultTemplate(name: string): string {
    const templates: Record<string, string> = {
      'report.html': `<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header>
    <h1>Xaheen CLI Test Report</h1>
    <div class="timestamp">Generated: {{TIMESTAMP}}</div>
  </header>
  <main>
    <section class="summary">
      <h2>Summary</h2>
      {{SUMMARY}}
    </section>
    <section class="suites">
      <h2>Test Suites</h2>
      {{SUITES}}
    </section>
    <section class="coverage">
      <h2>Coverage</h2>
      {{COVERAGE}}
    </section>
    <section class="performance">
      <h2>Performance</h2>
      {{PERFORMANCE}}
    </section>
    <section class="compliance">
      <h2>Compliance</h2>
      {{COMPLIANCE}}
    </section>
    <section class="artifacts">
      <h2>Artifacts</h2>
      {{ARTIFACTS}}
    </section>
  </main>
  <script src="assets/chart.min.js"></script>
  <script src="assets/scripts.js"></script>
  <script>
    window.testSession = {{SESSION_DATA}};
  </script>
</body>
</html>`,
      'dashboard.html': `<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="UTF-8">
  <title>Test Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .metric .value { font-size: 32px; font-weight: bold; color: #333; }
    .success { color: #28a745; }
    .error { color: #dc3545; }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>Test Dashboard</h1>
    <div class="metrics">
      <div class="metric">
        <h3>Total Tests</h3>
        <div class="value">{{TOTAL_TESTS}}</div>
      </div>
      <div class="metric">
        <h3>Passed</h3>
        <div class="value success">{{PASSED_TESTS}}</div>
      </div>
      <div class="metric">
        <h3>Failed</h3>
        <div class="value error">{{FAILED_TESTS}}</div>
      </div>
      <div class="metric">
        <h3>Success Rate</h3>
        <div class="value">{{SUCCESS_RATE}}%</div>
      </div>
      <div class="metric">
        <h3>Duration</h3>
        <div class="value">{{TOTAL_DURATION}}</div>
      </div>
      <div class="metric">
        <h3>Coverage</h3>
        <div class="value">{{COVERAGE_PERCENTAGE}}%</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    };
    
    return templates[name] || `<html><body><h1>Template not found: ${name}</h1></body></html>`;
  }

  private async generateCSS(): Promise<string> {
    return `
      /* Xaheen CLI Test Report Styles */
      :root {
        --color-primary: #2563eb;
        --color-success: #16a34a;
        --color-error: #dc2626;
        --color-warning: #ea580c;
        --color-info: #0891b2;
        --color-gray-50: #f9fafb;
        --color-gray-100: #f3f4f6;
        --color-gray-900: #111827;
        --border-radius: 0.5rem;
        --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      * { box-sizing: border-box; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: var(--color-gray-900);
        background: var(--color-gray-50);
        margin: 0;
        padding: 0;
      }

      header {
        background: white;
        padding: 2rem;
        box-shadow: var(--shadow);
        margin-bottom: 2rem;
      }

      header h1 {
        margin: 0;
        color: var(--color-primary);
      }

      .timestamp {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.5rem;
      }

      main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      section {
        background: white;
        padding: 2rem;
        margin-bottom: 2rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .summary-card {
        padding: 1.5rem;
        border-radius: var(--border-radius);
        text-align: center;
      }

      .summary-card.passed { background: #f0fdf4; border-left: 4px solid var(--color-success); }
      .summary-card.failed { background: #fef2f2; border-left: 4px solid var(--color-error); }
      .summary-card.skipped { background: #fffbeb; border-left: 4px solid var(--color-warning); }
      .summary-card.duration { background: #f0f9ff; border-left: 4px solid var(--color-info); }

      .summary-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: #666;
      }

      .summary-card .number {
        font-size: 2rem;
        font-weight: bold;
        color: #333;
      }

      .suite {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid var(--color-gray-100);
        border-radius: var(--border-radius);
      }

      .suite h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary);
      }

      .suite-info {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #666;
      }

      .test {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        margin: 0.25rem 0;
        border-radius: 0.25rem;
      }

      .test.passed { background: #f0fdf4; }
      .test.failed { background: #fef2f2; }
      .test.skipped { background: #fffbeb; }

      .test-name { flex: 1; }
      .test-duration { margin: 0 1rem; font-size: 0.9rem; color: #666; }
      .test-status { 
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
      }

      .test-status.passed { background: var(--color-success); color: white; }
      .test-status.failed { background: var(--color-error); color: white; }
      .test-status.skipped { background: var(--color-warning); color: white; }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--color-gray-100);
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem 0;
      }

      .progress {
        height: 100%;
        background: var(--color-success);
        transition: width 0.3s ease;
      }

      .error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: var(--border-radius);
        padding: 1rem;
        margin: 0.5rem 0;
      }

      .error pre {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.25rem;
        overflow-x: auto;
        font-size: 0.8rem;
        margin: 0.5rem 0 0 0;
      }

      @media (max-width: 768px) {
        .summary-grid {
          grid-template-columns: 1fr;
        }
        
        .suite-info {
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .test {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
      }
    `;
  }

  private async generateJavaScript(): Promise<string> {
    return `
      // Xaheen CLI Test Report JavaScript
      document.addEventListener('DOMContentLoaded', function() {
        initializeCharts();
        initializeInteractivity();
      });

      function initializeCharts() {
        if (typeof Chart === 'undefined') return;
        
        // Coverage chart
        const coverageCtx = document.getElementById('coverageChart');
        if (coverageCtx && window.testSession) {
          new Chart(coverageCtx, {
            type: 'doughnut',
            data: {
              labels: ['Statements', 'Branches', 'Functions', 'Lines'],
              datasets: [{
                data: [
                  window.testSession.coverage.statements.percentage,
                  window.testSession.coverage.branches.percentage,
                  window.testSession.coverage.functions.percentage,
                  window.testSession.coverage.lines.percentage
                ],
                backgroundColor: ['#16a34a', '#0891b2', '#ea580c', '#2563eb']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        }

        // Test results chart
        const resultsCtx = document.getElementById('resultsChart');
        if (resultsCtx && window.testSession) {
          new Chart(resultsCtx, {
            type: 'bar',
            data: {
              labels: ['Passed', 'Failed', 'Skipped'],
              datasets: [{
                data: [
                  window.testSession.summary.passed,
                  window.testSession.summary.failed,
                  window.testSession.summary.skipped
                ],
                backgroundColor: ['#16a34a', '#dc2626', '#ea580c']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }

      function initializeInteractivity() {
        // Toggle suite details
        document.querySelectorAll('.suite h3').forEach(header => {
          header.style.cursor = 'pointer';
          header.addEventListener('click', function() {
            const tests = this.parentElement.querySelector('.tests');
            if (tests) {
              tests.style.display = tests.style.display === 'none' ? 'block' : 'none';
            }
          });
        });

        // Filter tests
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterTests(filter);
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
          });
        });
      }

      function filterTests(status) {
        const tests = document.querySelectorAll('.test');
        tests.forEach(test => {
          if (status === 'all' || test.classList.contains(status)) {
            test.style.display = 'flex';
          } else {
            test.style.display = 'none';
          }
        });
      }

      // Export functionality
      function exportReport(format) {
        const data = window.testSession;
        let content, filename;

        switch (format) {
          case 'json':
            content = JSON.stringify(data, null, 2);
            filename = 'test-report.json';
            break;
          case 'csv':
            content = generateCSV(data);
            filename = 'test-report.csv';
            break;
          default:
            return;
        }

        downloadFile(content, filename);
      }

      function generateCSV(data) {
        const headers = ['Suite', 'Test', 'Status', 'Duration', 'File'];
        const rows = [headers.join(',')];

        data.suites.forEach(suite => {
          suite.tests.forEach(test => {
            const row = [
              escapeCSV(suite.name),
              escapeCSV(test.name),
              test.status,
              test.duration,
              escapeCSV(test.file)
            ];
            rows.push(row.join(','));
          });
        });

        return rows.join('\\n');
      }

      function escapeCSV(value) {
        if (typeof value !== 'string') return value;
        if (value.includes(',') || value.includes('"') || value.includes('\\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }

      function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Make functions globally available
      window.exportReport = exportReport;
    `;
  }

  // Additional helper methods for rendering specific sections
  private renderCoverageFilesTable(): string {
    return this.session.coverage.files.map(file => `
      <tr>
        <td>${file.path}</td>
        <td>${file.coverage.statements.toFixed(2)}%</td>
        <td>${file.coverage.branches.toFixed(2)}%</td>
        <td>${file.coverage.functions.toFixed(2)}%</td>
        <td>${file.coverage.lines.toFixed(2)}%</td>
      </tr>
    `).join('');
  }

  private renderSlowestTestsTable(): string {
    return this.session.performance.slowestTests.map(test => `
      <tr>
        <td>${test.name}</td>
        <td>${this.formatDuration(test.duration)}</td>
        <td>${test.file}</td>
      </tr>
    `).join('');
  }

  private renderNSMComplianceStatus(): string {
    const { nsm } = this.session.compliance;
    const compliantCount = nsm.requirements.filter(req => req.status === 'compliant').length;
    const totalCount = nsm.requirements.length;
    
    return `
      <div class="compliance-status">
        <h4>NSM Classification: ${nsm.classification}</h4>
        <div class="compliance-progress">
          <span>${compliantCount}/${totalCount} requirements compliant</span>
          <div class="progress-bar">
            <div class="progress" style="width: ${totalCount > 0 ? (compliantCount / totalCount) * 100 : 0}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  private renderAccessibilityStatus(): string {
    const { wcag } = this.session.compliance.accessibility;
    const criticalViolations = wcag.violations.filter(v => v.impact === 'critical').length;
    const totalViolations = wcag.violations.length;
    
    return `
      <div class="accessibility-status">
        <h4>WCAG ${wcag.level} Compliance</h4>
        <div class="violations-summary">
          <span>${totalViolations} violations found</span>
          ${criticalViolations > 0 ? `<span class="critical">${criticalViolations} critical</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderSecurityStatus(): string {
    const { vulnerabilities } = this.session.compliance.security;
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
    
    return `
      <div class="security-status">
        <h4>Security Scan Results</h4>
        <div class="vulnerabilities-summary">
          <span>${vulnerabilities.length} vulnerabilities found</span>
          ${criticalVulns > 0 ? `<span class="critical">${criticalVulns} critical</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderPerformanceThresholds(): string {
    return this.session.compliance.performance.thresholds.map(threshold => `
      <div class="threshold ${threshold.status}">
        <span>${threshold.metric}</span>
        <span>Threshold: ${threshold.threshold}</span>
        <span>Actual: ${threshold.actual}</span>
        <span class="status">${threshold.status}</span>
      </div>
    `).join('');
  }
}

// Export singleton instance for global use
export const testReporter = new TestReportGenerator();
#!/usr/bin/env tsx
/**
 * End-to-End Compliance Test Runner Script
 * 
 * Comprehensive test runner for validating generated projects against
 * all compliance standards including CLAUDE.md, design system usage,
 * NSM requirements, and WCAG AAA accessibility.
 * 
 * Usage:
 *   npm run test:e2e:compliance
 *   tsx scripts/run-e2e-compliance-tests.ts
 *   tsx scripts/run-e2e-compliance-tests.ts --frameworks react,nextjs
 *   tsx scripts/run-e2e-compliance-tests.ts --skip-cleanup --verbose
 */

import { program } from 'commander';
import { consola } from 'consola';
import { join } from 'path';
import { runE2ETests } from '../src/test/e2e-framework/runner.js';
import type { E2ETestConfig, TestReport } from '../src/test/e2e-framework/types.js';

interface CLIOptions {
  frameworks?: string;
  templates?: string;
  outputDir?: string;
  cliPath?: string;
  timeout?: number;
  skipCleanup?: boolean;
  parallel?: boolean;
  verbose?: boolean;
  reportOnly?: boolean;
  format?: 'json' | 'html' | 'both';
}

/**
 * Main execution function
 */
async function main() {
  // Configure CLI
  program
    .name('run-e2e-compliance-tests')
    .description('Comprehensive end-to-end compliance testing for generated projects')
    .version('1.0.0')
    .option('-f, --frameworks <frameworks>', 'Comma-separated list of frameworks to test', 'react,nextjs,vue,angular,svelte')
    .option('-t, --templates <templates>', 'Comma-separated list of templates to test', 'default,saas,enterprise')
    .option('-o, --output-dir <path>', 'Output directory for test results', './test-output/e2e')
    .option('-c, --cli-path <path>', 'Path to CLI executable', './dist/index.js')
    .option('--timeout <ms>', 'Test timeout in milliseconds', '600000')
    .option('--skip-cleanup', 'Skip cleanup of test projects', false)
    .option('--parallel', 'Run tests in parallel', false)
    .option('--verbose', 'Enable verbose logging', false)
    .option('--report-only', 'Only generate reports from existing test data', false)
    .option('--format <format>', 'Report format (json|html|both)', 'both')
    .parse();

  const options = program.opts<CLIOptions>();

  // Configure logging
  if (options.verbose) {
    consola.level = 4; // Debug level
  }

  // Parse frameworks and templates
  const frameworks = options.frameworks?.split(',').map(f => f.trim()) || ['react', 'nextjs', 'vue'];
  const templates = options.templates?.split(',').map(t => t.trim()) || ['default', 'saas'];

  // Build test configuration
  const config: E2ETestConfig = {
    outputDir: options.outputDir || './test-output/e2e',
    cliPath: options.cliPath || './dist/index.js',
    timeout: options.timeout ? parseInt(options.timeout) : 600000,
    parallel: options.parallel || false,
    skipCleanup: options.skipCleanup || false,
    generateReport: true,
    reportFormat: (options.format as any) || 'both',
    frameworks: frameworks as any[],
    templates
  };

  consola.start('Starting comprehensive E2E compliance test suite...');
  consola.info('Configuration:', {
    frameworks,
    templates,
    outputDir: config.outputDir,
    timeout: config.timeout,
    parallel: config.parallel
  });

  try {
    let report: TestReport;

    if (options.reportOnly) {
      // Only generate reports from existing data
      report = await generateReportsOnly(config);
    } else {
      // Run full test suite
      report = await runE2ETests(config);
    }

    // Display summary
    displayTestSummary(report);
    
    // Exit with appropriate code
    const exitCode = report.failedTests > 0 ? 1 : 0;
    
    if (exitCode === 0) {
      consola.success('All E2E compliance tests passed! 🎉');
    } else {
      consola.error(`${report.failedTests} test(s) failed. See reports for details.`);
    }

    process.exit(exitCode);

  } catch (error) {
    consola.error('E2E compliance test suite failed:', error);
    process.exit(1);
  }
}

/**
 * Generate reports only from existing test data
 */
async function generateReportsOnly(config: E2ETestConfig): Promise<TestReport> {
  consola.info('Generating reports from existing test data...');
  
  // This would load existing test results and regenerate reports
  // For now, return a placeholder report
  const placeholderReport: TestReport = {
    timestamp: new Date().toISOString(),
    environment: { node: process.version, platform: process.platform, arch: process.arch, cwd: process.cwd() },
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    warningTests: 0,
    duration: 0,
    suites: {
      projectCreation: { tests: [], passed: 0, failed: 0, warnings: 0 },
      designSystemIntegration: { tests: [], passed: 0, failed: 0, warnings: 0 },
      complianceValidation: { tests: [], passed: 0, failed: 0, warnings: 0 },
      codeQuality: { tests: [], passed: 0, failed: 0, warnings: 0 },
      performance: { tests: [], passed: 0, failed: 0, warnings: 0 }
    },
    compliance: {
      claudeMdCompliance: 0,
      nsmCompliance: 0,
      wcagCompliance: 0,
      designSystemUsage: 0
    },
    recommendations: ['Run full test suite for complete analysis']
  };

  return placeholderReport;
}

/**
 * Display test summary in console
 */
function displayTestSummary(report: TestReport): void {
  consola.box('E2E Compliance Test Summary');
  
  console.log(`🕒 Duration: ${formatDuration(report.duration)}`);
  console.log(`📊 Total Tests: ${report.totalTests}`);
  console.log(`✅ Passed: ${report.passedTests}`);
  console.log(`❌ Failed: ${report.failedTests}`);
  console.log(`⚠️  Warnings: ${report.warningTests}`);
  console.log('');

  // Suite breakdown
  console.log('📋 Test Suite Results:');
  Object.entries(report.suites).forEach(([suiteName, suite]) => {
    const status = suite.failed > 0 ? '❌' : suite.warnings > 0 ? '⚠️' : '✅';
    console.log(`  ${status} ${formatSuiteName(suiteName)}: ${suite.passed}/${suite.tests.length} passed`);
  });
  console.log('');

  // Compliance scores
  console.log('🎯 Compliance Scores:');
  console.log(`  📝 CLAUDE.md Compliance: ${Math.round(report.compliance.claudeMdCompliance)}%`);
  console.log(`  🎨 Design System Usage: ${Math.round(report.compliance.designSystemUsage)}%`);
  console.log(`  🛡️  NSM Compliance: ${Math.round(report.compliance.nsmCompliance)}%`);
  console.log(`  ♿ WCAG Compliance: ${Math.round(report.compliance.wcagCompliance)}%`);
  console.log('');

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    console.log('');
  }

  // Report locations
  const outputDir = './test-output/e2e';
  console.log('📄 Generated Reports:');
  console.log(`  📊 HTML Report: ${join(outputDir, 'e2e-test-report.html')}`);
  console.log(`  📋 JSON Report: ${join(outputDir, 'e2e-test-report.json')}`);
  console.log(`  🎯 Compliance Report: ${join(outputDir, 'compliance-report.json')}`);
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format suite name for display
 */
function formatSuiteName(suiteName: string): string {
  return suiteName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Handle process signals gracefully
 */
process.on('SIGINT', () => {
  consola.info('Received SIGINT, cleaning up...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  consola.info('Received SIGTERM, cleaning up...');
  process.exit(143);
});

// Run main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    consola.error('Unhandled error:', error);
    process.exit(1);
  });
}
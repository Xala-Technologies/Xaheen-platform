#!/usr/bin/env tsx
/**
 * EPIC 7: Integration and Testing - Test Runner Script
 * 
 * Command-line script to execute the comprehensive EPIC 7 testing suite
 * with various configuration options and report generation.
 * 
 * @author Database Architect with CLI Testing Integration Expertise
 * @since 2025-01-03
 */

import { program } from 'commander';
import path from 'node:path';
import fs from 'fs-extra';
import { performance } from 'perf_hooks';

// Import the test runner
import Epic7TestRunner from '../src/test/epic7-integration-test-runner';

interface CliOptions {
  categories?: string[];
  parallel?: boolean;
  generateReport?: boolean;
  outputDir?: string;
  timeout?: number;
  verbose?: boolean;
  keepArtifacts?: boolean;
  skipSetup?: boolean;
  dry?: boolean;
}

async function main() {
  program
    .name('run-epic7-tests')
    .description('Run EPIC 7: Integration and Testing comprehensive test suite')
    .version('1.0.0');

  program
    .option('-c, --categories <categories>', 'Test categories to run (comma-separated): integration,platform,compliance,ai,performance', (value) => value.split(','))
    .option('-p, --parallel', 'Run test suites in parallel', false)
    .option('-r, --generate-report', 'Generate detailed test report', false)
    .option('-o, --output-dir <dir>', 'Output directory for reports', './test-reports')
    .option('-t, --timeout <ms>', 'Test timeout in milliseconds', (value) => parseInt(value), 60000)
    .option('-v, --verbose', 'Verbose output', false)
    .option('-k, --keep-artifacts', 'Keep test artifacts after completion', false)
    .option('-s, --skip-setup', 'Skip environment setup checks', false)
    .option('-d, --dry', 'Dry run - show what would be tested without executing', false);

  program.parse();

  const options: CliOptions = program.opts();

  console.log('🎯 EPIC 7: Integration and Testing Suite');
  console.log('==========================================');
  
  if (options.dry) {
    await performDryRun(options);
    return;
  }

  if (!options.skipSetup) {
    await performEnvironmentChecks();
  }

  const startTime = performance.now();
  
  try {
    const testRunner = new Epic7TestRunner();
    
    // Configure test runner based on options
    const testOptions = {
      categories: options.categories as any,
      parallel: options.parallel,
      generateReport: options.generateReport,
      outputDir: options.outputDir
    };

    console.log('\n📋 Test Configuration:');
    console.log(`   Categories: ${testOptions.categories?.join(', ') || 'all'}`);
    console.log(`   Parallel: ${testOptions.parallel ? 'enabled' : 'disabled'}`);
    console.log(`   Generate Report: ${testOptions.generateReport ? 'yes' : 'no'}`);
    console.log(`   Output Directory: ${testOptions.outputDir}`);
    console.log(`   Timeout: ${options.timeout}ms`);

    // Run the tests
    const report = await testRunner.runAllTests(testOptions);
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    console.log(`\n⏱️  Total execution time: ${(totalDuration / 1000).toFixed(1)}s`);
    
    // Exit with appropriate code
    const exitCode = report.summary.failed > 0 ? 1 : 0;
    
    if (exitCode === 0) {
      console.log('\n🎉 All EPIC 7 tests completed successfully!');
    } else {
      console.log(`\n❌ ${report.summary.failed} test(s) failed. See report for details.`);
    }

    if (!options.keepArtifacts) {
      await cleanupArtifacts();
    }

    process.exit(exitCode);

  } catch (error) {
    console.error('\n💥 Test execution failed:');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Perform dry run to show what would be tested
 */
async function performDryRun(options: CliOptions): Promise<void> {
  console.log('\n🔍 Dry Run - Test Plan');
  console.log('=====================');
  
  const testRunner = new Epic7TestRunner();
  const allCategories = ['integration', 'platform', 'compliance', 'ai', 'performance'];
  const categoriesToRun = options.categories || allCategories;

  console.log('\n📊 Test Suites to Execute:');
  
  categoriesToRun.forEach(category => {
    console.log(`\n   ${getCategoryIcon(category)} ${category.toUpperCase()} Tests:`);
    
    switch (category) {
      case 'integration':
        console.log('     • Template Generation Integration');
        console.log('       - Component generation commands');
        console.log('       - Code compilation validation');
        console.log('       - Template inheritance testing');
        break;
      case 'platform':
        console.log('     • Platform Integration');
        console.log('       - React template generation');
        console.log('       - Vue composition API testing');
        console.log('       - Angular standalone components');
        console.log('       - Cross-platform consistency');
        break;
      case 'compliance':
        console.log('     • Norwegian Compliance');
        console.log('       - NSM classification enforcement');
        console.log('       - GDPR compliance patterns');
        console.log('       - WCAG AAA accessibility');
        console.log('       - Altinn Design System compatibility');
        break;
      case 'ai':
        console.log('     • AI Integration');
        console.log('       - MCP server communication');
        console.log('       - Component specification loading');
        console.log('       - Pattern recommendations');
        console.log('       - AI error handling');
        break;
      case 'performance':
        console.log('     • Performance and Scalability');
        console.log('       - Template generation speed');
        console.log('       - Memory usage patterns');
        console.log('       - Cache effectiveness');
        console.log('       - Concurrent operations');
        break;
    }
  });

  console.log('\n⏱️  Estimated Duration:');
  const estimatedDuration = categoriesToRun.length * 2.5; // Rough estimate
  console.log(`   Total: ~${estimatedDuration} minutes`);
  
  if (options.parallel) {
    console.log(`   With parallel execution: ~${(estimatedDuration * 0.6).toFixed(1)} minutes`);
  }

  console.log('\n📁 Artifacts that would be generated:');
  if (options.generateReport) {
    console.log(`   • Test report: ${options.outputDir}/epic7-test-report-{timestamp}.json`);
  }
  console.log('   • Performance profiles');
  console.log('   • Memory analysis reports');
  console.log('   • Cache effectiveness metrics');
  console.log('   • Generated test components');

  console.log('\n✅ Dry run completed. Use --dry=false to execute tests.');
}

/**
 * Perform environment checks before running tests
 */
async function performEnvironmentChecks(): Promise<void> {
  console.log('\n🔧 Environment Checks');
  console.log('====================');

  const checks = [
    {
      name: 'Node.js version',
      check: () => {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        return { passed: major >= 18, details: version };
      }
    },
    {
      name: 'TypeScript availability',
      check: async () => {
        try {
          const { execa } = await import('execa');
          await execa('npx', ['tsc', '--version'], { stdio: 'pipe' });
          return { passed: true, details: 'Available' };
        } catch {
          return { passed: false, details: 'Not found' };
        }
      }
    },
    {
      name: 'Test output directory',
      check: async () => {
        try {
          await fs.ensureDir('./test-output');
          return { passed: true, details: 'Created/exists' };
        } catch {
          return { passed: false, details: 'Cannot create' };
        }
      }
    },
    {
      name: 'Available memory',
      check: () => {
        const free = process.memoryUsage().heapTotal;
        const freeGB = (free / 1024 / 1024 / 1024).toFixed(1);
        return { 
          passed: free > 512 * 1024 * 1024, // 512MB minimum
          details: `${freeGB}GB available`
        };
      }
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    const result = await check.check();
    const status = result.passed ?  '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${result.details}`);
    
    if (!result.passed) {
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.log('\n⚠️  Some environment checks failed. Tests may not run correctly.');
    console.log('   Use --skip-setup to bypass these checks.');
    process.exit(1);
  }

  console.log('\n✅ Environment checks passed');
}

/**
 * Clean up test artifacts
 */
async function cleanupArtifacts(): Promise<void> {
  console.log('\n🧹 Cleaning up test artifacts...');
  
  const artifactDirs = [
    './test-output',
    './tmp'
  ];

  for (const dir of artifactDirs) {
    try {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
        console.log(`   Removed: ${dir}`);
      }
    } catch (error) {
      console.warn(`   Failed to remove ${dir}:`, error);
    }
  }
}

/**
 * Get icon for test category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    integration: '🔗',
    platform: '⚡',
    compliance: '🛡️',
    ai: '🤖',
    performance: '📊'
  };
  return icons[category] || '🧪';
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}
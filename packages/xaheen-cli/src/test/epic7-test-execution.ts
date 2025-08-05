#!/usr/bin/env node

/**
 * EPIC 7: Integration and Testing - Test Execution Script
 * 
 * Command-line interface for running comprehensive EPIC 7 tests.
 * Provides options for selective testing, parallel execution, and detailed reporting.
 * 
 * Usage:
 *   npm run test:epic7 -- --all
 *   npm run test:epic7 -- --categories integration,performance
 *   npm run test:epic7 -- --parallel --report
 * 
 * @author Database Architect with Testing Infrastructure Excellence
 * @since 2025-01-03
 */

import { program } from 'commander';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import path from 'node:path';
import fs from 'fs-extra';

import Epic7TestRunner, { TestSuite } from './epic7-integration-test-runner.js';

interface ExecutionOptions {
  categories?: string[];
  parallel?: boolean;
  generateReport?: boolean;
  outputDir?: string;
  verbose?: boolean;
  dryRun?: boolean;
  failFast?: boolean;
  timeout?: number;
}

class Epic7TestExecutor {
  private runner: Epic7TestRunner;
  private startTime: number = 0;

  constructor() {
    this.runner = new Epic7TestRunner();
  }

  /**
   * Execute EPIC 7 test suite with given options
   */
  async execute(options: ExecutionOptions): Promise<number> {
    this.startTime = performance.now();
    
    try {
      console.log(chalk.cyan.bold('🚀 EPIC 7: Integration and Testing Framework'));
      console.log(chalk.gray('═'.repeat(80)));
      
      if (options.dryRun) {
        return await this.performDryRun(options);
      }

      // Validate environment
      await this.validateTestEnvironment();
      
      // Display test plan
      await this.displayTestPlan(options);
      
      // Execute tests
      const report = await this.runner.runAllTests({
        categories: options.categories as Array<TestSuite['category']>,
        parallel: options.parallel,
        generateReport: options.generateReport,
        outputDir: options.outputDir
      });

      // Determine exit code based on results
      const exitCode = report.summary.successRate >= 95 ? 0 : 1;
      
      console.log(chalk.green(`\n✅ Test execution completed in ${((performance.now() - this.startTime) / 1000).toFixed(1)}s`));
      
      return exitCode;

    } catch (error) {
      console.error(chalk.red('💥 Test execution failed:'), error);
      return 1;
    }
  }

  /**
   * Perform dry run to show what tests would be executed
   */
  private async performDryRun(options: ExecutionOptions): Promise<number> {
    console.log(chalk.yellow('🔍 DRY RUN - No tests will be executed'));
    console.log(chalk.gray('─'.repeat(50)));

    const categories = options.categories || ['integration', 'platform', 'compliance', 'ai', 'performance'];
    
    console.log(chalk.blue('\n📋 Test Categories to Run:'));
    categories.forEach(category => {
      console.log(chalk.blue(`  • ${category}`));
    });

    console.log(chalk.blue('\n⚙️  Execution Options:'));
    console.log(chalk.blue(`  • Parallel execution: ${options.parallel ? 'Yes' : 'No'}`));
    console.log(chalk.blue(`  • Generate report: ${options.generateReport ? 'Yes' : 'No'}`));
    console.log(chalk.blue(`  • Verbose output: ${options.verbose ? 'Yes' : 'No'}`));
    
    if (options.outputDir) {
      console.log(chalk.blue(`  • Output directory: ${options.outputDir}`));
    }

    console.log(chalk.yellow('\n📊 Estimated Test Duration:'));
    console.log(chalk.yellow('  • Template Generation: ~2 minutes'));
    console.log(chalk.yellow('  • Platform Integration: ~3 minutes'));
    console.log(chalk.yellow('  • Norwegian Compliance: ~2.5 minutes'));
    console.log(chalk.yellow('  • AI Integration: ~2 minutes'));
    console.log(chalk.yellow('  • Performance Testing: ~5 minutes'));
    console.log(chalk.yellow('  • Total Estimated: ~14.5 minutes'));

    return 0;
  }

  /**
   * Validate test environment requirements
   */
  private async validateTestEnvironment(): Promise<void> {
    console.log(chalk.blue('🔍 Validating test environment...'));

    const checks = [
      {
        name: 'Node.js version',
        check: () => process.version >= 'v18.0.0',
        fix: 'Update to Node.js 18+ for optimal compatibility'
      },
      {
        name: 'TypeScript compiler',
        check: async () => {
          try {
            const { execa } = await import('execa');
            const result = await execa('npx', ['tsc', '--version'], { reject: false });
            return result.exitCode === 0;
          } catch {
            return false;
          }
        },
        fix: 'Install TypeScript: npm install -g typescript'
      },
      {
        name: 'Test directory writable',
        check: async () => {
          const testDir = path.join(process.cwd(), 'test-output');
          try {
            await fs.ensureDir(testDir);
            await fs.access(testDir, fs.constants.W_OK);
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Ensure test output directory is writable'
      },
      {
        name: 'Memory available',
        check: () => {
          const freeMemory = process.memoryUsage().heapTotal;
          return freeMemory > 100 * 1024 * 1024; // 100MB minimum
        },
        fix: 'Free up system memory before running tests'
      }
    ];

    let allPassed = true;

    for (const check of checks) {
      const passed = typeof check.check === 'function' ? await check.check() : check.check;
      
      if (passed) {
        console.log(chalk.green(`  ✅ ${check.name}`));
      } else {
        console.log(chalk.red(`  ❌ ${check.name}`));
        console.log(chalk.yellow(`     💡 ${check.fix}`));
        allPassed = false;
      }
    }

    if (!allPassed) {
      throw new Error('Environment validation failed. Please fix the issues above.');
    }

    console.log(chalk.green('✅ Environment validation passed'));
  }

  /**
   * Display comprehensive test plan
   */
  private async displayTestPlan(options: ExecutionOptions): Promise<void> {
    console.log(chalk.blue('\n📋 Test Execution Plan'));
    console.log(chalk.gray('─'.repeat(50)));

    const testSuites = [
      {
        name: 'Template Generation Integration',
        category: 'integration',
        tests: [
          'Component generation commands work correctly',
          'Generated code compiles without errors',
          'Template inheritance and composition work',
          'Parameter combinations validate properly',
          'Error handling for invalid templates'
        ],
        estimatedTime: '2 minutes'
      },
      {
        name: 'Platform Integration',
        category: 'platform', 
        tests: [
          'React template generation with all variants',
          'Vue template generation with Composition API',
          'Angular template generation with standalone components',
          'Cross-platform template consistency',
          'Platform-specific optimizations work',
          'Platform-specific error handling'
        ],
        estimatedTime: '3 minutes'
      },
      {
        name: 'Norwegian Compliance',
        category: 'compliance',
        tests: [
          'NSM classification enforcement (OPEN/RESTRICTED/CONFIDENTIAL/SECRET)',
          'GDPR compliance patterns in generated code',
          'Norwegian locale integration works',
          'Altinn Design System compatibility',
          'WCAG AAA accessibility compliance',
          'Audit trail implementation for sensitive operations',
          'Data privacy patterns implementation'
        ],
        estimatedTime: '2.5 minutes'
      },
      {
        name: 'AI Integration',
        category: 'ai',
        tests: [
          'MCP server connection and communication',
          'Component specification loading from MCP',
          'Pattern recommendation system works',
          'Accessibility validation via MCP',
          'Norwegian compliance checking via MCP',
          'Performance optimization recommendations',
          'Error handling and fallback systems'
        ],
        estimatedTime: '2 minutes'
      },
      {
        name: 'Performance and Scalability',
        category: 'performance',
        tests: [
          'Template generation speed benchmarks',
          'Large template performance handling',
          'MCP integration performance impact',
          'Template compilation performance',
          'Template validation performance',
          'Cache effectiveness measurement',
          'Memory usage during generation',
          'Concurrent generation handling'
        ],
        estimatedTime: '5 minutes'
      }
    ];

    const categoriesToRun = options.categories || ['integration', 'platform', 'compliance', 'ai', 'performance'];
    const suitesToRun = testSuites.filter(suite => categoriesToRun.includes(suite.category));

    console.log(chalk.blue(`\n🎯 Test Suites (${suitesToRun.length}/${testSuites.length}):`));
    
    suitesToRun.forEach((suite, index) => {
      console.log(chalk.blue(`\n${index + 1}. ${suite.name} (${suite.estimatedTime})`));
      suite.tests.forEach(test => {
        console.log(chalk.gray(`   • ${test}`));
      });
    });

    const totalTests = suitesToRun.reduce((sum, suite) => sum + suite.tests.length, 0);
    console.log(chalk.blue(`\n📊 Total Tests: ${totalTests}`));
    
    if (options.parallel) {
      console.log(chalk.yellow('⚡ Parallel execution enabled (faster but more resource intensive)'));
    } else {
      console.log(chalk.gray('🔄 Sequential execution (slower but more stable)'));
    }

    if (options.generateReport) {
      const reportDir = options.outputDir || path.join(process.cwd(), 'test-reports');
      console.log(chalk.blue(`📄 Report will be generated in: ${reportDir}`));
    }

    console.log(chalk.gray('─'.repeat(50)));
  }
}

// CLI Program Setup
program
  .name('epic7-test-execution')
  .description('EPIC 7: Integration and Testing - Comprehensive Test Suite')
  .version('1.0.0');

program
  .option('-a, --all', 'Run all test categories')
  .option('-c, --categories <categories>', 'Comma-separated list of test categories (integration,platform,compliance,ai,performance)')
  .option('-p, --parallel', 'Run tests in parallel for faster execution')
  .option('-r, --report', 'Generate detailed test report')
  .option('-o, --output-dir <dir>', 'Output directory for test reports')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--dry-run', 'Show what tests would run without executing them')
  .option('--fail-fast', 'Stop on first test failure')
  .option('--timeout <ms>', 'Global timeout for test execution (in milliseconds)', '900000') // 15 minutes
  .action(async (options) => {
    const executor = new Epic7TestExecutor();
    
    const executionOptions: ExecutionOptions = {
      categories: options.all 
        ? undefined 
        : options.categories?.split(',').map((c: string) => c.trim()),
      parallel: options.parallel,
      generateReport: options.report,
      outputDir: options.outputDir,
      verbose: options.verbose,
      dryRun: options.dryRun,
      failFast: options.failFast,
      timeout: parseInt(options.timeout)
    };

    try {
      const exitCode = await executor.execute(executionOptions);
      process.exit(exitCode);
    } catch (error) {
      console.error(chalk.red('Fatal error during test execution:'), error);
      process.exit(1);
    }
  });

// Add specific command for quick smoke tests
program
  .command('smoke')
  .description('Run quick smoke tests for basic functionality')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (options) => {
    console.log(chalk.cyan('💨 Running EPIC 7 Smoke Tests...'));
    
    const executor = new Epic7TestExecutor();
    const exitCode = await executor.execute({
      categories: ['integration'], // Only integration tests for smoke
      parallel: false,
      generateReport: false,
      verbose: options.verbose
    });
    
    process.exit(exitCode);
  });

// Add command for performance-only tests
program
  .command('perf')
  .description('Run performance and scalability tests only')
  .option('-p, --parallel', 'Run tests in parallel')
  .option('-r, --report', 'Generate performance report')
  .action(async (options) => {
    console.log(chalk.cyan('⚡ Running EPIC 7 Performance Tests...'));
    
    const executor = new Epic7TestExecutor();
    const exitCode = await executor.execute({
      categories: ['performance'],
      parallel: options.parallel,
      generateReport: options.report
    });
    
    process.exit(exitCode);
  });

// Add command for compliance-only tests
program
  .command('compliance')
  .description('Run Norwegian compliance tests only')
  .option('-r, --report', 'Generate compliance report')
  .action(async (options) => {
    console.log(chalk.cyan('🛡️ Running EPIC 7 Compliance Tests...'));
    
    const executor = new Epic7TestExecutor();
    const exitCode = await executor.execute({
      categories: ['compliance'],
      parallel: false, // Sequential for compliance accuracy
      generateReport: options.report
    });
    
    process.exit(exitCode);
  });

// Handle help display
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ npm run test:epic7 -- --all --report');
  console.log('  $ npm run test:epic7 -- --categories integration,performance --parallel');
  console.log('  $ npm run test:epic7 smoke');
  console.log('  $ npm run test:epic7 perf --parallel');
  console.log('  $ npm run test:epic7 compliance --report');
  console.log('  $ npm run test:epic7 -- --dry-run');
  console.log('');
  console.log('Test Categories:');
  console.log('  integration  - Template generation and CLI integration tests');
  console.log('  platform     - Cross-platform compatibility tests (React, Vue, Angular)');
  console.log('  compliance   - Norwegian compliance (NSM, GDPR, WCAG, Altinn)');
  console.log('  ai           - AI integration and MCP server tests');
  console.log('  performance  - Performance benchmarks and scalability tests');
  console.log('');
});

// Parse command line arguments
program.parse();

export default Epic7TestExecutor;
#!/usr/bin/env bun

/**
 * Phase 2 Test Runner
 * Executes all Phase 2 tests for frontend frameworks
 */

import { execaCommand } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../../..');

interface TestSuite {
  readonly name: string;
  readonly pattern: string;
  readonly timeout: number;
  readonly parallel?: boolean;
}

const TEST_SUITES: readonly TestSuite[] = [
  {
    name: 'Unit Tests',
    pattern: 'tests/phase2/unit/**/*.test.ts',
    timeout: 30000,
    parallel: true,
  },
  {
    name: 'Integration Tests',
    pattern: 'tests/phase2/integration/**/*.test.ts',
    timeout: 120000,
    parallel: false,
  },
  {
    name: 'E2E Matrix Tests',
    pattern: 'tests/phase2/e2e/**/*.test.ts',
    timeout: 180000,
    parallel: false,
  },
  {
    name: 'Performance Tests',
    pattern: 'tests/phase2/performance/**/*.test.ts',
    timeout: 240000,
    parallel: false,
  },
];

async function runTestSuite(suite: TestSuite): Promise<boolean> {
  console.log(`\n🧪 Running ${suite.name}...`);
  console.log(`Pattern: ${suite.pattern}`);
  console.log(`Timeout: ${suite.timeout}ms`);
  
  try {
    const args = [
      'vitest',
      'run',
      suite.pattern,
      '--reporter=verbose',
      `--testTimeout=${suite.timeout}`,
    ];

    if (suite.parallel) {
      args.push('--threads');
    } else {
      args.push('--no-threads');
    }

    const result = await execaCommand(`bun ${args.join(' ')}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        VITEST_POOL_OPTIONS: JSON.stringify({
          threads: {
            singleThread: !suite.parallel,
          },
        }),
      },
    });

    if (result.exitCode === 0) {
      console.log(`✅ ${suite.name} passed`);
      return true;
    } else {
      console.error(`❌ ${suite.name} failed with exit code ${result.exitCode}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${suite.name} failed with error:`, error);
    return false;
  }
}

async function checkPrerequisites(): Promise<boolean> {
  console.log('🔍 Checking prerequisites...');

  // Check if CLI is built
  const cliPath = path.join(ROOT_DIR, 'packages/xaheen-cli/dist/index.js');
  const cliExists = await fs.access(cliPath).then(() => true).catch(() => false);
  
  if (!cliExists) {
    console.error('❌ CLI not built. Run "bun run build" first.');
    return false;
  }

  // Check if test config exists
  const configPath = path.join(__dirname, 'config/frameworks.config.ts');
  const configExists = await fs.access(configPath).then(() => true).catch(() => false);
  
  if (!configExists) {
    console.error('❌ Framework config not found.');
    return false;
  }

  console.log('✅ Prerequisites met');
  return true;
}

async function generateSummary(results: readonly boolean[]): Promise<void> {
  const passed = results.filter(r => r).length;
  const total = results.length;
  const failed = total - passed;

  console.log('\n📊 Phase 2 Test Summary');
  console.log('========================');
  console.log(`Total Suites: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('🎉 All Phase 2 tests passed!');
  } else {
    console.log(`⚠️  ${failed} test suite(s) failed`);
  }

  // Generate test report
  const reportPath = path.join(__dirname, 'test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 2: Frontend Frameworks',
    totalSuites: total,
    passedSuites: passed,
    failedSuites: failed,
    suites: TEST_SUITES.map((suite, index) => ({
      name: suite.name,
      pattern: suite.pattern,
      passed: results[index],
    })),
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 Test report saved to: ${reportPath}`);
}

async function main(): Promise<void> {
  console.log('🚀 Starting Phase 2 Tests: Frontend Frameworks');
  console.log('===============================================');

  const startTime = Date.now();

  // Check prerequisites
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    process.exit(1);
  }

  // Run test suites
  const results: boolean[] = [];
  
  for (const suite of TEST_SUITES) {
    const result = await runTestSuite(suite);
    results.push(result);
    
    // Stop on first failure if in CI
    if (!result && process.env.CI) {
      console.log('🛑 Stopping on first failure in CI environment');
      break;
    }
  }

  // Generate summary
  await generateSummary(results);

  const duration = Date.now() - startTime;
  console.log(`\n⏱️  Total time: ${(duration / 1000).toFixed(2)}s`);

  // Exit with appropriate code
  const allPassed = results.every(r => r);
  process.exit(allPassed ? 0 : 1);
}

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Phase 2 Test Runner - Frontend Frameworks

Usage: bun run-phase2-tests.ts [options]

Options:
  --help, -h        Show this help message
  --unit           Run only unit tests
  --integration    Run only integration tests
  --e2e            Run only E2E tests
  --performance    Run only performance tests
  --fast           Skip slower integration and E2E tests

Examples:
  bun run-phase2-tests.ts
  bun run-phase2-tests.ts --unit
  bun run-phase2-tests.ts --fast
`);
  process.exit(0);
}

// Filter test suites based on CLI arguments
let filteredSuites = [...TEST_SUITES];

if (args.includes('--unit')) {
  filteredSuites = TEST_SUITES.filter(s => s.name.includes('Unit'));
} else if (args.includes('--integration')) {
  filteredSuites = TEST_SUITES.filter(s => s.name.includes('Integration'));
} else if (args.includes('--e2e')) {
  filteredSuites = TEST_SUITES.filter(s => s.name.includes('E2E'));
} else if (args.includes('--performance')) {
  filteredSuites = TEST_SUITES.filter(s => s.name.includes('Performance'));
} else if (args.includes('--fast')) {
  filteredSuites = TEST_SUITES.filter(s => s.name.includes('Unit'));
}

// Override TEST_SUITES with filtered version
Object.defineProperty(global, 'TEST_SUITES', {
  value: filteredSuites,
  writable: false,
});

// Run main function
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
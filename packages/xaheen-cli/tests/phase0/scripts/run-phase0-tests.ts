#!/usr/bin/env node
/**
 * Phase 0 Test Runner
 * 
 * Main script to run all Phase 0 tests with proper configuration,
 * reporting, and error handling.
 */

import { execaCommand } from 'execa';
import { join } from 'path';
import { promises as fs } from 'fs';

interface TestOptions {
  category?: string;
  verbose?: boolean;
  coverage?: boolean;
  reporter?: string;
  timeout?: number;
  retry?: number;
  bail?: boolean;
  watch?: boolean;
  ci?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  console.log('🧪 Running Phase 0: Documentation & Distribution Validation Tests');
  console.log('=' .repeat(80));
  
  try {
    // Validate environment
    await validateEnvironment();
    
    // Run tests based on category or all
    const exitCode = await runTests(options);
    
    // Generate reports
    await generateReports(options);
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Phase 0 tests failed:', error);
    process.exit(1);
  }
}

function parseArgs(args: string[]): TestOptions {
  const options: TestOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--category':
      case '-c':
        options.category = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--reporter':
      case '-r':
        options.reporter = args[++i];
        break;
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]);
        break;
      case '--retry':
        options.retry = parseInt(args[++i]);
        break;
      case '--bail':
      case '-b':
        options.bail = true;
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--ci':
        options.ci = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.warn(`Unknown option: ${arg}`);
        }
        break;
    }
  }
  
  return options;
}

async function validateEnvironment() {
  // Check if we're in the right directory
  const packageJsonPath = join(process.cwd(), 'package.json');
  try {
    await fs.access(packageJsonPath);
  } catch {
    throw new Error('package.json not found - ensure running from package root');
  }
  
  // Check if phase0 tests directory exists
  const phase0TestsPath = join(process.cwd(), 'tests/phase0');
  try {
    await fs.access(phase0TestsPath);
  } catch {
    throw new Error('Phase 0 tests directory not found - ensure tests are properly set up');
  }
  
  console.log('✅ Environment validation passed');
}

async function runTests(options: TestOptions): Promise<number> {
  const configPath = join(process.cwd(), 'tests/phase0/config/vitest.config.ts');
  
  let command = `vitest run --config="${configPath}"`;
  
  // Add category-specific patterns
  if (options.category) {
    const categoryPatterns = {
      docs: 'tests/phase0/docs/**/*.test.ts',
      distribution: 'tests/phase0/distribution/**/*.test.ts',
      smoke: 'tests/phase0/smoke/**/*.test.ts',
      all: 'tests/phase0/**/*.test.ts',
    };
    
    const pattern = categoryPatterns[options.category as keyof typeof categoryPatterns];
    if (pattern) {
      command += ` "${pattern}"`;
    } else {
      console.warn(`Unknown category: ${options.category}. Available: ${Object.keys(categoryPatterns).join(', ')}`);
    }
  } else {
    command += ' "tests/phase0/**/*.test.ts"';
  }
  
  // Add options
  if (options.verbose) {
    command += ' --reporter=verbose';
  } else if (options.reporter) {
    command += ` --reporter=${options.reporter}`;
  }
  
  if (options.coverage) {
    command += ' --coverage';
  }
  
  if (options.timeout) {
    command += ` --testTimeout=${options.timeout}`;
  }
  
  if (options.retry) {
    command += ` --retry=${options.retry}`;
  }
  
  if (options.bail) {
    command += ' --bail=1';
  }
  
  if (options.watch) {
    command += ' --watch';
  }
  
  // CI-specific options
  if (options.ci || process.env.CI) {
    command += ' --reporter=verbose --reporter=junit --reporter=json';
    command += ' --outputFile.junit=./test-output/phase0-junit.xml';
    command += ' --outputFile.json=./test-output/phase0-results.json';
  }
  
  console.log(`🚀 Running command: ${command}`);
  console.log('-'.repeat(80));
  
  try {
    const result = await execaCommand(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_PHASE: '0',
      },
    });
    
    return result.exitCode;
    
  } catch (error: any) {
    console.error('Test execution failed:', error.message);
    return error.exitCode || 1;
  }
}

async function generateReports(options: TestOptions) {
  console.log('-'.repeat(80));
  console.log('📊 Generating Phase 0 test reports...');
  
  const outputDir = join(process.cwd(), 'test-output');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate summary report
    const summaryPath = join(outputDir, 'phase0-summary.md');
    const summary = generateSummaryReport(options);
    await fs.writeFile(summaryPath, summary);
    
    console.log(`✅ Summary report generated: ${summaryPath}`);
    
    // Check for other report files
    const reportFiles = [
      'phase0-junit.xml',
      'phase0-results.json',
    ];
    
    for (const reportFile of reportFiles) {
      const reportPath = join(outputDir, reportFile);
      try {
        await fs.access(reportPath);
        console.log(`✅ Report available: ${reportPath}`);
      } catch {
        // Report file doesn't exist
      }
    }
    
  } catch (error) {
    console.warn(`⚠️  Could not generate reports: ${error}`);
  }
}

function generateSummaryReport(options: TestOptions): string {
  const timestamp = new Date().toISOString();
  
  return `# Phase 0 Test Results Summary

**Generated:** ${timestamp}
**Phase:** Documentation & Distribution Validation
**Configuration:** ${JSON.stringify(options, null, 2)}

## Test Categories

### 📚 Documentation Tests
- Build and lint documentation
- Validate markdown structure
- Check for broken links
- Verify code block syntax highlighting

### 📦 Distribution Tests  
- Package build validation
- Publish dry-run to GitHub Packages
- Version validation
- Package structure verification

### 💨 Smoke Tests
- CLI help commands
- License status checks
- Basic validation in empty directories
- Error handling verification

## Environment

- **Node.js:** ${process.version}
- **Platform:** ${process.platform}
- **Architecture:** ${process.arch}
- **Working Directory:** ${process.cwd()}

## Notes

Phase 0 tests validate the foundation before proceeding to functional testing:

1. ✅ Documentation builds without errors
2. ✅ Package can be distributed via GitHub Packages
3. ✅ CLI responds to basic commands
4. ✅ Error handling is graceful

These tests ensure the CLI is ready for Phase 1 (Frontend MVP) testing.
`;
}

function showHelp() {
  console.log(`
Phase 0 Test Runner

Usage: bun run test:phase0 [options]

Options:
  -c, --category <name>     Run specific test category (docs|distribution|smoke|all)
  -v, --verbose            Use verbose output
  --coverage               Generate test coverage
  -r, --reporter <name>    Specify test reporter
  -t, --timeout <ms>       Set test timeout
  --retry <count>          Retry failed tests
  -b, --bail               Stop on first failure
  -w, --watch              Watch mode
  --ci                     CI mode (multiple reporters, no watch)

Categories:
  docs                     Documentation build and lint tests
  distribution             Package build and publish tests
  smoke                    Basic CLI smoke tests
  all                      All Phase 0 tests (default)

Examples:
  bun run test:phase0                          # Run all Phase 0 tests
  bun run test:phase0 --category docs          # Run only documentation tests
  bun run test:phase0 --verbose --coverage     # Verbose output with coverage
  bun run test:phase0 --ci                     # CI mode
`);
}

// Handle help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Phase 0 test runner failed:', error);
    process.exit(1);
  });
}

export { main as runPhase0Tests };
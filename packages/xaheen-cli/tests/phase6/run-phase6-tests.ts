#!/usr/bin/env node

/**
 * Phase 6 Test Runner
 * 
 * Orchestrates the execution of all Services & Integrations tests
 * including environment setup, service health checks, and cleanup.
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { setTimeout } from 'timers/promises';

interface TestSuiteConfig {
  readonly name: string;
  readonly category: string;
  readonly files: string[];
  readonly dependencies: string[];
  readonly timeout: number;
  readonly parallel: boolean;
}

interface TestResults {
  readonly suite: string;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly duration: number;
  readonly coverage?: {
    readonly lines: number;
    readonly functions: number;
    readonly branches: number;
    readonly statements: number;
  };
}

class Phase6TestRunner {
  private readonly testSuites: TestSuiteConfig[] = [
    {
      name: 'Authentication Services',
      category: 'auth',
      files: [
        'integration/auth/oauth2-integration.test.ts',
        'integration/auth/jwt-integration.test.ts',
        'integration/auth/firebase-integration.test.ts',
        'integration/auth/supabase-integration.test.ts',
        'integration/auth/bankid-integration.test.ts',
      ],
      dependencies: ['mock-server'],
      timeout: 300000, // 5 minutes
      parallel: true,
    },
    {
      name: 'Payment Services',
      category: 'payments',
      files: [
        'integration/payments/stripe-integration.test.ts',
        'integration/payments/paypal-integration.test.ts',
        'integration/payments/square-integration.test.ts',
        'integration/payments/adyen-integration.test.ts',
      ],
      dependencies: ['mock-server'],
      timeout: 300000,
      parallel: true,
    },
    {
      name: 'Communication Services',
      category: 'communications',
      files: [
        'integration/communications/slack-integration.test.ts',
        'integration/communications/twilio-integration.test.ts',
        'integration/communications/discord-integration.test.ts',
        'integration/communications/email-integration.test.ts',
      ],
      dependencies: ['mock-server', 'mailhog'],
      timeout: 240000, // 4 minutes
      parallel: true,
    },
    {
      name: 'Document Services',
      category: 'documents',
      files: [
        'integration/documents/docusign-integration.test.ts',
        'integration/documents/adobe-sign-integration.test.ts',
        'integration/documents/altinn-integration.test.ts',
      ],
      dependencies: ['mock-server'],
      timeout: 180000, // 3 minutes
      parallel: false, // Document services may have rate limits
    },
    {
      name: 'Queue Services',
      category: 'queues',
      files: [
        'integration/queues/rabbitmq-integration.test.ts',
        'integration/queues/kafka-integration.test.ts',
        'integration/queues/redis-pubsub-integration.test.ts',
        'integration/queues/cron-jobs-integration.test.ts',
      ],
      dependencies: ['rabbitmq', 'kafka', 'redis'],
      timeout: 240000,
      parallel: false, // Queue services need sequential testing
    },
    {
      name: 'Database Services',
      category: 'databases',
      files: [
        'integration/databases/postgresql-integration.test.ts',
        'integration/databases/mysql-integration.test.ts',
        'integration/databases/mongodb-integration.test.ts',
        'integration/databases/redis-integration.test.ts',
        'integration/databases/elasticsearch-integration.test.ts',
        'integration/databases/orm-integration.test.ts',
      ],
      dependencies: ['postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch'],
      timeout: 360000, // 6 minutes
      parallel: true,
    },
    {
      name: 'Analytics Services',
      category: 'analytics',
      files: [
        'integration/analytics/google-analytics-integration.test.ts',
        'integration/analytics/mixpanel-integration.test.ts',
        'integration/analytics/sentry-integration.test.ts',
        'integration/analytics/prometheus-integration.test.ts',
      ],
      dependencies: ['mock-server', 'prometheus'],
      timeout: 180000,
      parallel: true,
    },
    {
      name: 'Infrastructure Services',
      category: 'infrastructure',
      files: [
        'integration/infrastructure/docker-compose-integration.test.ts',
        'integration/infrastructure/kubernetes-integration.test.ts',
        'integration/infrastructure/terraform-integration.test.ts',
        'integration/infrastructure/ci-cd-integration.test.ts',
      ],
      dependencies: [],
      timeout: 600000, // 10 minutes for infrastructure tests
      parallel: false,
    },
  ];

  private dockerProcess: ChildProcess | null = null;
  private readonly results: TestResults[] = [];
  private readonly startTime = Date.now();

  async run(): Promise<void> {
    console.log('🚀 Starting Phase 6: Services & Integrations Tests');
    console.log('=====================================================\n');

    try {
      // Parse command line arguments
      const args = this.parseArguments();
      
      if (args.help) {
        this.printHelp();
        return;
      }

      // Setup test environment
      await this.setupEnvironment(args);

      // Wait for services to be ready
      await this.waitForServices();

      // Run test suites
      await this.runTestSuites(args);

      // Generate reports
      await this.generateReports(args);

      console.log('\n✅ Phase 6 tests completed successfully!');
      this.printSummary();

    } catch (error) {
      console.error('\n❌ Phase 6 tests failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  private parseArguments() {
    const args = process.argv.slice(2);
    
    return {
      help: args.includes('--help') || args.includes('-h'),
      category: this.getArgValue(args, '--category') || 'all',
      parallel: !args.includes('--sequential'),
      coverage: args.includes('--coverage'),
      watch: args.includes('--watch'),
      verbose: args.includes('--verbose') || args.includes('-v'),
      docker: !args.includes('--no-docker'),
      cleanup: !args.includes('--no-cleanup'),
      timeout: parseInt(this.getArgValue(args, '--timeout') || '1800') * 1000, // Default 30 minutes
    };
  }

  private getArgValue(args: string[], flag: string): string | undefined {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
  }

  private printHelp(): void {
    console.log(`
Usage: npm run test:phase6 [options]

Options:
  --help, -h           Show this help message
  --category <name>    Run tests for specific category (auth, payments, communications, etc.)
  --sequential         Run tests sequentially instead of in parallel
  --coverage           Generate test coverage reports
  --watch              Watch for file changes and re-run tests
  --verbose, -v        Enable verbose logging
  --no-docker          Skip Docker services setup
  --no-cleanup         Skip cleanup after tests
  --timeout <seconds>  Set global timeout in seconds (default: 1800)

Categories:
  auth                 Authentication services (OAuth2, JWT, Firebase, etc.)
  payments             Payment services (Stripe, PayPal, Square, etc.)
  communications       Communication services (Slack, Twilio, Email, etc.)
  documents            Document services (DocuSign, Adobe Sign, etc.)
  queues               Queue services (RabbitMQ, Kafka, Redis Pub/Sub)
  databases            Database services (PostgreSQL, MySQL, MongoDB, etc.)
  analytics            Analytics services (GA4, Mixpanel, Sentry, etc.)
  infrastructure       Infrastructure services (Docker, Kubernetes, etc.)
  all                  Run all test categories (default)

Examples:
  npm run test:phase6                           # Run all tests
  npm run test:phase6 -- --category auth       # Run only authentication tests
  npm run test:phase6 -- --coverage --verbose  # Run with coverage and verbose output
  npm run test:phase6 -- --no-docker           # Run without Docker services
    `);
  }

  private async setupEnvironment(args: any): Promise<void> {
    console.log('🔧 Setting up test environment...');

    // Create necessary directories
    const dirs = ['temp', 'test-results', 'coverage', 'logs'];
    for (const dir of dirs) {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
    }

    // Setup environment variables
    process.env.NODE_ENV = 'test';
    process.env.CI = 'true';
    process.env.PHASE = '6';
    
    if (args.verbose) {
      process.env.DEBUG = 'xaheen:phase6*';
    }

    // Start Docker services if needed
    if (args.docker) {
      await this.startDockerServices();
    }

    console.log('✅ Environment setup complete\n');
  }

  private async startDockerServices(): Promise<void> {
    console.log('🐳 Starting Docker services...');

    const dockerComposePath = path.join(__dirname, 'docker-compose.test.yml');
    
    // Check if Docker Compose file exists
    try {
      await fs.access(dockerComposePath);
    } catch {
      console.log('⚠️  Docker Compose file not found, skipping Docker services');
      return;
    }

    return new Promise((resolve, reject) => {
      this.dockerProcess = spawn('docker-compose', [
        '-f', dockerComposePath,
        'up', '-d', '--build'
      ], {
        stdio: 'inherit',
        cwd: __dirname,
      });

      this.dockerProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Docker services started');
          resolve();
        } else {
          reject(new Error(`Docker Compose failed with exit code ${code}`));
        }
      });

      this.dockerProcess.on('error', (error) => {
        reject(new Error(`Failed to start Docker services: ${error.message}`));
      });
    });
  }

  private async waitForServices(): Promise<void> {
    console.log('⏳ Waiting for services to be ready...');

    const healthChecks = [
      { name: 'PostgreSQL', url: 'postgresql://postgres:postgres@localhost:5432/xaheen_test' },
      { name: 'MySQL', check: () => this.checkTcpPort('localhost', 3306) },
      { name: 'MongoDB', check: () => this.checkTcpPort('localhost', 27017) },
      { name: 'Redis', check: () => this.checkTcpPort('localhost', 6379) },
      { name: 'Elasticsearch', url: 'http://localhost:9200/_health' },
      { name: 'RabbitMQ', check: () => this.checkTcpPort('localhost', 5672) },
      { name: 'Kafka', check: () => this.checkTcpPort('localhost', 9092) },
      { name: 'Mock Server', url: 'http://localhost:3100/health' },
    ];

    for (const { name, url, check } of healthChecks) {
      console.log(`  Checking ${name}...`);
      
      try {
        if (url) {
          await this.waitForUrl(url);
        } else if (check) {
          await this.waitForCondition(check);
        }
        
        console.log(`  ✅ ${name} is ready`);
      } catch (error) {
        console.log(`  ⚠️  ${name} is not available (will be skipped)`);
      }
    }

    console.log('✅ Service health checks complete\n');
  }

  private async waitForUrl(url: string, timeout = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch {
        // Service not ready yet
      }
      
      await setTimeout(2000);
    }
    
    throw new Error(`Service at ${url} not ready within ${timeout}ms`);
  }

  private async checkTcpPort(host: string, port: number): Promise<boolean> {
    const net = await import('net');
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  }

  private async waitForCondition(check: () => Promise<boolean>): Promise<void> {
    const timeout = 60000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await check()) return;
      await setTimeout(2000);
    }
    
    throw new Error('Condition not met within timeout');
  }

  private async runTestSuites(args: any): Promise<void> {
    const suitesToRun = args.category === 'all' 
      ? this.testSuites 
      : this.testSuites.filter(suite => suite.category === args.category);

    if (suitesToRun.length === 0) {
      throw new Error(`No test suites found for category: ${args.category}`);
    }

    console.log(`🧪 Running ${suitesToRun.length} test suite(s)...\n`);

    if (args.parallel) {
      await this.runSuitesInParallel(suitesToRun, args);
    } else {
      await this.runSuitesSequentially(suitesToRun, args);
    }
  }

  private async runSuitesInParallel(suites: TestSuiteConfig[], args: any): Promise<void> {
    const promises = suites.map(suite => this.runTestSuite(suite, args));
    await Promise.allSettled(promises);
  }

  private async runSuitesSequentially(suites: TestSuiteConfig[], args: any): Promise<void> {
    for (const suite of suites) {
      await this.runTestSuite(suite, args);
    }
  }

  private async runTestSuite(suite: TestSuiteConfig, args: any): Promise<void> {
    const startTime = Date.now();
    console.log(`📝 Running ${suite.name}...`);

    try {
      const vitestArgs = [
        'run',
        ...suite.files,
        '--config', 'config/vitest.config.ts',
        '--reporter=json',
        `--outputFile=test-results/${suite.category}-results.json`,
      ];

      if (args.coverage) {
        vitestArgs.push('--coverage');
      }

      if (args.verbose) {
        vitestArgs.push('--reporter=verbose');
      }

      const result = await this.runCommand('npx', ['vitest', ...vitestArgs], {
        timeout: suite.timeout,
        cwd: __dirname,
      });

      const duration = Date.now() - startTime;
      
      // Parse test results
      const resultsFile = path.join(__dirname, 'test-results', `${suite.category}-results.json`);
      const testResults = await this.parseTestResults(resultsFile, suite.name, duration);
      
      this.results.push(testResults);
      
      console.log(`  ✅ ${suite.name}: ${testResults.passed} passed, ${testResults.failed} failed (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`  ❌ ${suite.name}: Failed after ${duration}ms`);
      console.error(`     Error: ${error.message}`);
      
      this.results.push({
        suite: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
      });
    }
  }

  private async runCommand(command: string, args: string[], options: { timeout?: number; cwd?: string } = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        cwd: options.cwd || process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = options.timeout ? setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${options.timeout}ms`));
      }, options.timeout) : undefined;

      child.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  private async parseTestResults(filePath: string, suiteName: string, duration: number): Promise<TestResults> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      return {
        suite: suiteName,
        passed: data.numPassedTests || 0,
        failed: data.numFailedTests || 0,
        skipped: data.numPendingTests || 0,
        duration,
        coverage: data.coverageMap ? {
          lines: data.coverageMap.getCoverageSummary?.().lines.pct || 0,
          functions: data.coverageMap.getCoverageSummary?.().functions.pct || 0,
          branches: data.coverageMap.getCoverageSummary?.().branches.pct || 0,
          statements: data.coverageMap.getCoverageSummary?.().statements.pct || 0,
        } : undefined,
      };
    } catch {
      return {
        suite: suiteName,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
      };
    }
  }

  private async generateReports(args: any): Promise<void> {
    console.log('\n📊 Generating test reports...');

    // Generate summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      totalSuites: this.results.length,
      totalTests: this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0),
      passed: this.results.reduce((sum, r) => sum + r.passed, 0),
      failed: this.results.reduce((sum, r) => sum + r.failed, 0),
      skipped: this.results.reduce((sum, r) => sum + r.skipped, 0),
      results: this.results,
    };

    const reportPath = path.join(__dirname, 'test-results', 'phase6-summary.json');
    await fs.writeFile(reportPath, JSON.stringify(summaryReport, null, 2));

    // Generate HTML report
    if (args.coverage) {
      await this.generateHtmlReport(summaryReport);
    }

    console.log(`✅ Reports generated in test-results/`);
  }

  private async generateHtmlReport(summary: any): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Phase 6 Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Phase 6: Services & Integrations Test Results</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Suites:</strong> ${summary.totalSuites}</p>
        <p><strong>Total Tests:</strong> ${summary.totalTests}</p>
        <p><strong>Passed:</strong> <span class="passed">${summary.passed}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${summary.failed}</span></p>
        <p><strong>Skipped:</strong> <span class="skipped">${summary.skipped}</span></p>
        <p><strong>Duration:</strong> ${Math.round(summary.duration / 1000)}s</p>
        <p><strong>Generated:</strong> ${summary.timestamp}</p>
    </div>

    <h2>Test Suite Results</h2>
    <table>
        <thead>
            <tr>
                <th>Suite</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Duration</th>
                <th>Coverage</th>
            </tr>
        </thead>
        <tbody>
            ${summary.results.map((result: TestResults) => `
                <tr>
                    <td>${result.suite}</td>
                    <td class="passed">${result.passed}</td>
                    <td class="failed">${result.failed}</td>
                    <td class="skipped">${result.skipped}</td>
                    <td>${Math.round(result.duration / 1000)}s</td>
                    <td>${result.coverage ? `${result.coverage.lines}%` : 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, 'test-results', 'phase6-report.html');
    await fs.writeFile(htmlPath, htmlContent);
  }

  private printSummary(): void {
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalDuration = Date.now() - this.startTime;

    console.log('\n📈 Test Summary');
    console.log('===============');
    console.log(`Suites:   ${this.results.length}`);
    console.log(`Tests:    ${totalTests}`);
    console.log(`Passed:   ${totalPassed}`);
    console.log(`Failed:   ${totalFailed}`);
    console.log(`Skipped:  ${totalSkipped}`);
    console.log(`Duration: ${Math.round(totalDuration / 1000)}s`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed`);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');

    // Stop Docker services
    if (this.dockerProcess) {
      try {
        await this.runCommand('docker-compose', [
          '-f', path.join(__dirname, 'docker-compose.test.yml'),
          'down', '-v'
        ]);
        console.log('✅ Docker services stopped');
      } catch (error) {
        console.log('⚠️  Failed to stop Docker services:', error.message);
      }
    }

    // Clean up temporary files
    try {
      const tempDir = path.join(__dirname, 'temp');
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log('✅ Temporary files cleaned');
    } catch (error) {
      console.log('⚠️  Failed to clean temporary files:', error.message);
    }

    console.log('✅ Cleanup complete');
  }
}

// Run the test runner if this file is executed directly
if (require.main === module) {
  const runner = new Phase6TestRunner();
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default Phase6TestRunner;
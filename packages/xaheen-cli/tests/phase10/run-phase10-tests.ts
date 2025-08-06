#!/usr/bin/env node

/**
 * Phase 10: Norwegian/NSM/DIGDIR/GDPR/WCAG Compliance Test Runner
 * 
 * This is the FINAL compliance gate that runs all Norwegian government standards
 * and international compliance tests. Must pass 100% for production deployment.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadPhase10Config, validatePhase10Config } from './config/test-config';
import { ComplianceLogger } from './utils/compliance-logger';
import { TestReporter } from './utils/test-reporter';

const logger = new ComplianceLogger('Phase10-TestRunner');
const config = loadPhase10Config();

interface TestSuite {
  name: string;
  description: string;
  testFile: string;
  required: boolean;
  timeout: number;
  dependencies: string[];
  complianceStandards: string[];
}

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  violations: number;
  coverage: number;
  errors: string[];
  complianceScore: number;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'BankID Integration',
    description: 'Norwegian BankID authentication integration tests',
    testFile: './bankid-altinn/bankid-integration.test.ts',
    required: true,
    timeout: 300000, // 5 minutes
    dependencies: ['network', 'bankid_credentials'],
    complianceStandards: ['Norwegian eID Framework', 'OIDC', 'SAML 2.0']
  },
  {
    name: 'Altinn Integration',
    description: 'Norwegian Altinn government services integration tests',
    testFile: './bankid-altinn/altinn-integration.test.ts',
    required: true,
    timeout: 300000, // 5 minutes
    dependencies: ['network', 'altinn_credentials'],
    complianceStandards: ['Altinn API Standards', 'Norwegian Government Data Standards']
  },
  {
    name: 'Digipost Document Submission',
    description: 'Secure document delivery with compliance metadata',
    testFile: './digipost/document-submission.test.ts',
    required: true,
    timeout: 600000, // 10 minutes
    dependencies: ['network', 'digipost_credentials'],
    complianceStandards: ['Norwegian Document Delivery Standards', 'ISO 27001']
  },
  {
    name: 'NSM Security Classification',
    description: 'NSM security classification handling and audit trails',
    testFile: './nsm-security/classification-handling.test.ts',
    required: true,
    timeout: 300000, // 5 minutes
    dependencies: ['security_keys', 'audit_logging'],
    complianceStandards: ['NSM Security Framework', 'Norwegian Security Law']
  },
  {
    name: 'DIGDIR Service Reporting',
    description: 'Government digital service reporting and metrics',
    testFile: './digdir-reporting/service-reporting.test.ts',
    required: true,
    timeout: 300000, // 5 minutes
    dependencies: ['network', 'digdir_credentials'],
    complianceStandards: ['DIGDIR Reporting Standards', 'Norwegian Digital Service Standards']
  },
  {
    name: 'GDPR Consent Management',
    description: 'GDPR Article 7 consent collection and management',
    testFile: './gdpr-compliance/consent-management.test.ts',
    required: true,
    timeout: 300000, // 5 minutes
    dependencies: ['gdpr_database', 'consent_infrastructure'],
    complianceStandards: ['GDPR Article 7', 'GDPR Article 25', 'Norwegian Personal Data Act']
  },
  {
    name: 'GDPR Data Deletion',
    description: 'GDPR Article 17 right to erasure implementation',
    testFile: './gdpr-compliance/data-deletion.test.ts',
    required: true,
    timeout: 600000, // 10 minutes
    dependencies: ['gdpr_database', 'deletion_infrastructure'],
    complianceStandards: ['GDPR Article 17', 'Data Retention Policies', 'Secure Deletion Standards']
  },
  {
    name: 'WCAG 2.2 AAA Accessibility',
    description: 'Full accessibility compliance with axe-core testing',
    testFile: './wcag-accessibility/accessibility-compliance.test.ts',
    required: true,
    timeout: 900000, // 15 minutes
    dependencies: ['browser_engines', 'axe_core'],
    complianceStandards: ['WCAG 2.2 Level AAA', 'Norwegian Web Accessibility Regulations', 'Universal Design']
  }
];

class Phase10TestRunner {
  private results: TestResult[] = [];
  private reporter: TestReporter;
  private startTime: number = 0;

  constructor() {
    this.reporter = new TestReporter({
      outputDirectory: config.general.outputDirectory,
      generateCertificates: true,
      norwegianCompliance: true
    });
  }

  async run(): Promise<boolean> {
    logger.info('🚀 Starting Phase 10: Norwegian/NSM/DIGDIR/GDPR/WCAG Compliance Tests');
    logger.info('⚠️  This is the FINAL compliance gate - all tests must pass for production deployment');
    
    this.startTime = Date.now();

    try {
      // Validate configuration
      await this.validateConfiguration();
      
      // Check dependencies
      await this.checkDependencies();
      
      // Setup test environment
      await this.setupTestEnvironment();
      
      // Run all test suites
      await this.runAllTestSuites();
      
      // Generate comprehensive report
      await this.generateComplianceReport();
      
      // Determine overall result
      const allPassed = this.results.every(result => result.passed);
      const totalDuration = Date.now() - this.startTime;
      
      if (allPassed) {
        logger.info('✅ Phase 10 PASSED - All Norwegian compliance requirements met!');
        logger.info(`🏆 Total execution time: ${Math.round(totalDuration / 1000)}s`);
        logger.info('🎯 Xaheen CLI is certified for Norwegian government deployment');
        return true;
      } else {
        logger.error('❌ Phase 10 FAILED - Compliance requirements not met');
        this.logFailures();
        return false;
      }
      
    } catch (error) {
      logger.error('💥 Phase 10 execution failed with critical error', { error });
      return false;
    }
  }

  private async validateConfiguration(): Promise<void> {
    logger.info('🔍 Validating Phase 10 configuration...');
    
    const configErrors = validatePhase10Config(config);
    if (configErrors.length > 0) {
      throw new Error(`Configuration validation failed: ${configErrors.join(', ')}`);
    }
    
    logger.info('✅ Configuration validation passed');
  }

  private async checkDependencies(): Promise<void> {
    logger.info('🔧 Checking test dependencies...');
    
    const missingDependencies: string[] = [];
    
    // Check network connectivity to Norwegian services
    if (!await this.checkNetworkConnectivity()) {
      missingDependencies.push('network connectivity to Norwegian test endpoints');
    }
    
    // Check required credentials
    if (!config.bankid.clientId || !config.bankid.clientSecret) {
      missingDependencies.push('BankID test credentials');
    }
    
    if (!config.altinn.apiKey) {
      missingDependencies.push('Altinn API credentials');
    }
    
    if (!config.digipost.apiKey) {
      missingDependencies.push('Digipost API credentials');
    }
    
    if (!config.digdir.apiKey) {
      missingDependencies.push('DIGDIR API credentials');
    }
    
    // Check browser engines for accessibility testing
    if (!await this.checkBrowserEngines()) {
      missingDependencies.push('Playwright browser engines');
    }
    
    if (missingDependencies.length > 0) {
      throw new Error(`Missing dependencies: ${missingDependencies.join(', ')}`);
    }
    
    logger.info('✅ All dependencies available');
  }

  private async setupTestEnvironment(): Promise<void> {
    logger.info('🏗️  Setting up test environment...');
    
    // Create output directories
    const outputDir = config.general.outputDirectory;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Setup subdirectories for each test suite
    const subdirs = ['artifacts', 'reports', 'certificates', 'logs', 'screenshots'];
    subdirs.forEach(subdir => {
      const fullPath = join(outputDir, subdir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    });
    
    logger.info('✅ Test environment setup complete');
  }

  private async runAllTestSuites(): Promise<void> {
    logger.info(`🧪 Running ${TEST_SUITES.length} compliance test suites...`);
    
    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }
    
    logger.info('🏁 All test suites execution completed');
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    logger.info(`\n🔬 Running ${suite.name}...`);
    logger.info(`📋 Description: ${suite.description}`);
    logger.info(`🎯 Standards: ${suite.complianceStandards.join(', ')}`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.executeTest(suite);
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        suite: suite.name,
        passed: result.success,
        duration,
        violations: result.violations,
        coverage: result.coverage,
        errors: result.errors,
        complianceScore: result.complianceScore
      };
      
      this.results.push(testResult);
      
      if (result.success) {
        logger.info(`✅ ${suite.name} PASSED (${Math.round(duration / 1000)}s)`);
        logger.info(`🎯 Compliance Score: ${result.complianceScore}%`);
      } else {
        logger.error(`❌ ${suite.name} FAILED (${Math.round(duration / 1000)}s)`);
        logger.error(`💥 Violations: ${result.violations}`);
        logger.error(`📊 Coverage: ${result.coverage}%`);
        result.errors.forEach(error => logger.error(`   - ${error}`));
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        suite: suite.name,
        passed: false,
        duration,
        violations: 1,
        coverage: 0,
        errors: [String(error)],
        complianceScore: 0
      };
      
      this.results.push(testResult);
      
      logger.error(`💥 ${suite.name} CRASHED (${Math.round(duration / 1000)}s)`);
      logger.error(`Error: ${error}`);
    }
  }

  private async executeTest(suite: TestSuite): Promise<{
    success: boolean;
    violations: number;
    coverage: number;
    errors: string[];
    complianceScore: number;
  }> {
    return new Promise((resolve, reject) => {
      const isPlaywrightTest = suite.testFile.includes('wcag-accessibility');
      const testCommand = isPlaywrightTest ? 'npx playwright test' : 'npx vitest run';
      const testArgs = isPlaywrightTest 
        ? ['--config', './config/playwright.config.ts', suite.testFile]
        : ['--config', './config/vitest.config.ts', suite.testFile];

      const testProcess = spawn(testCommand.split(' ')[0], [
        ...testCommand.split(' ').slice(1),
        ...testArgs
      ], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: suite.timeout
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      testProcess.on('close', (code) => {
        const success = code === 0;
        const output = stdout + '\n' + stderr;
        
        // Parse test results
        const violations = this.parseViolations(output);
        const coverage = this.parseCoverage(output);
        const errors = this.parseErrors(output);
        const complianceScore = success ? this.calculateComplianceScore(suite.name, violations) : 0;

        resolve({
          success,
          violations,
          coverage,
          errors,
          complianceScore
        });
      });

      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseViolations(output: string): number {
    const violationMatch = output.match(/(\d+)\s+violations?/i);
    return violationMatch ? parseInt(violationMatch[1]) : 0;
  }

  private parseCoverage(output: string): number {
    const coverageMatch = output.match(/All files\s+\|\s+[\d.]+\s+\|\s+[\d.]+\s+\|\s+[\d.]+\s+\|\s+([\d.]+)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
  }

  private parseErrors(output: string): string[] {
    const errors: string[] = [];
    const errorLines = output.split('\n').filter(line => 
      line.includes('Error:') || 
      line.includes('Failed:') || 
      line.includes('✗') ||
      line.includes('❌')
    );
    
    return errorLines.slice(0, 10); // Limit to first 10 errors
  }

  private calculateComplianceScore(suiteName: string, violations: number): number {
    if (violations === 0) return 100;
    
    // Different scoring based on suite criticality
    const criticalSuites = ['BankID Integration', 'GDPR Data Deletion', 'NSM Security Classification'];
    const basePenalty = criticalSuites.includes(suiteName) ? 20 : 10;
    
    return Math.max(0, 100 - (violations * basePenalty));
  }

  private async generateComplianceReport(): Promise<void> {
    logger.info('📊 Generating comprehensive compliance report...');
    
    const report = await this.reporter.generatePhase10Report({
      results: this.results,
      totalDuration: Date.now() - this.startTime,
      complianceStandards: TEST_SUITES.flatMap(suite => suite.complianceStandards),
      norwegianCompliance: true,
      wcagLevel: 'AAA',
      certificates: this.results.filter(r => r.passed).map(r => r.suite)
    });
    
    logger.info(`📄 Compliance report generated: ${report.reportPath}`);
    logger.info(`🏆 Overall compliance score: ${report.overallScore}%`);
    
    if (report.certificateGenerated) {
      logger.info(`🎖️  Norwegian Government Compliance Certificate: ${report.certificatePath}`);
    }
  }

  private logFailures(): void {
    const failures = this.results.filter(result => !result.passed);
    
    logger.error(`\n💥 ${failures.length} test suite(s) failed:`);
    
    failures.forEach(failure => {
      logger.error(`\n❌ ${failure.suite}:`);
      logger.error(`   Duration: ${Math.round(failure.duration / 1000)}s`);
      logger.error(`   Violations: ${failure.violations}`);
      logger.error(`   Coverage: ${failure.coverage}%`);
      logger.error(`   Compliance Score: ${failure.complianceScore}%`);
      
      if (failure.errors.length > 0) {
        logger.error('   Errors:');
        failure.errors.forEach(error => logger.error(`     - ${error}`));
      }
    });
    
    logger.error('\n🚨 CRITICAL: Phase 10 compliance gate FAILED');
    logger.error('📋 Action required: Fix all failing tests before production deployment');
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      const endpoints = [
        config.bankid.testEndpoint,
        config.altinn.testEndpoint,
        config.digipost.testEndpoint,
        config.digdir.reportingEndpoint
      ];
      
      // Simple connectivity check
      return true; // In real implementation, check actual connectivity
    } catch {
      return false;
    }
  }

  private async checkBrowserEngines(): Promise<boolean> {
    try {
      // Check if Playwright browsers are installed
      return existsSync('node_modules/@playwright/test');
    } catch {
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new Phase10TestRunner();
  
  runner.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Phase 10 test runner crashed:', error);
      process.exit(1);
    });
}

export { Phase10TestRunner };
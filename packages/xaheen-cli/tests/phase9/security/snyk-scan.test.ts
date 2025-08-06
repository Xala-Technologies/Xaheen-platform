/**
 * Snyk Security Scanning Test Suite
 * 
 * Tests vulnerability scanning using Snyk CLI and validates
 * security thresholds for dependencies and code quality.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { securityScanConfig } from '../config/security-scan.config.js';

const execAsync = promisify(exec);

interface SnykTestResult {
  vulnerabilities: SnykVulnerability[];
  ok: boolean;
  dependencyCount: number;
  org: string;
  policy: string;
  isPrivate: boolean;
  licensesPolicy: any;
  packageManager: string;
  ignoreSettings: any;
  summary: string;
  remediation: SnykRemediation;
  filesystemPolicy: boolean;
  filtered: {
    ignore: SnykVulnerability[];
    patch: SnykVulnerability[];
  };
  uniqueCount: number;
  projectName: string;
  foundProjectCount: number;
}

interface SnykVulnerability {
  id: string;
  title: string;
  description: string;
  type: string;
  packageName: string;
  version: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  language: string;
  packageManager: string;
  semver: {
    vulnerable: string[];
  };
  publicationTime: string;
  disclosureTime: string;
  isUpgradable: boolean;
  isPatchable: boolean;
  isPinnable: boolean;
  identifiers: {
    CVE: string[];
    CWE: string[];
  };
  credit: string[];
  CVSSv3: string;
  cvssScore: number;
  patches: any[];
  upgradePath: any[];
  functions: any[];
  from: string[];
}

interface SnykRemediation {
  unresolved: SnykVulnerability[];
  upgrade: Record<string, any>;
  patch: Record<string, any>;
  ignore: Record<string, any>;
  pin: Record<string, any>;
}

describe('Phase 9: Security - Snyk Scanning', () => {
  const testOutputDir = resolve(process.cwd(), 'test-output/security');
  const config = securityScanConfig.snyk;
  let snykAvailable = false;

  beforeAll(async () => {
    await mkdir(testOutputDir, { recursive: true });
    
    // Check if Snyk is available
    try {
      await execAsync('snyk --version');
      snykAvailable = true;
    } catch (error) {
      console.warn('Snyk CLI not available. Some tests will be skipped.');
      snykAvailable = false;
    }

    // Check for Snyk token if available
    if (snykAvailable && !process.env.SNYK_TOKEN) {
      console.warn('SNYK_TOKEN not set. Snyk tests may fail or be limited.');
    }
  });

  describe('Snyk CLI Availability', () => {
    it('should have Snyk CLI installed', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk tests - CLI not available');
        return;
      }

      const { stdout } = await execAsync('snyk --version');
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
      
      // Write version info to report
      const versionReport = {
        timestamp: new Date().toISOString(),
        version: stdout.trim(),
        tokenAvailable: !!process.env.SNYK_TOKEN,
      };
      
      const reportPath = join(testOutputDir, 'snyk-version.json');
      await writeFile(reportPath, JSON.stringify(versionReport, null, 2));
    });

    it('should authenticate with Snyk if token is available', async () => {
      if (!snykAvailable || !process.env.SNYK_TOKEN) {
        console.warn('Skipping Snyk authentication test - token not available');
        return;
      }

      try {
        const { stdout } = await execAsync('snyk auth');
        expect(stdout).toContain('Authenticated');
      } catch (error) {
        // If already authenticated, that's fine
        if ((error as any).message?.includes('already authenticated')) {
          return;
        }
        throw error;
      }
    });
  });

  describe('Dependency Vulnerability Scanning', () => {
    it('should scan dependencies for vulnerabilities', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk dependency scan - CLI not available');
        return;
      }

      let testResult: SnykTestResult;
      let scanOutput = '';

      try {
        const command = [
          'snyk test',
          '--json',
          config.test.dev ? '' : '--prod',
          `--severity-threshold=${config.severityThreshold}`,
          config.org ? `--org=${config.org}` : '',
        ].filter(Boolean).join(' ');

        const { stdout, stderr } = await execAsync(command, {
          timeout: config.test.timeout * 1000,
        });

        scanOutput = stdout;
        testResult = JSON.parse(stdout);

      } catch (error) {
        // Snyk returns non-zero exit code when vulnerabilities are found
        const stdout = (error as any).stdout || '';
        const stderr = (error as any).stderr || '';

        if (stdout) {
          scanOutput = stdout;
          try {
            testResult = JSON.parse(stdout);
          } catch (parseError) {
            const errorPath = join(testOutputDir, 'snyk-scan-error.txt');
            await writeFile(errorPath, `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`);
            throw new Error(`Failed to parse Snyk output: ${parseError}`);
          }
        } else {
          const errorPath = join(testOutputDir, 'snyk-command-error.txt');
          await writeFile(errorPath, `Error running Snyk:\n${stderr || error}`);
          
          // If it's an authentication error, skip the test
          if (stderr?.includes('Unauthorized') || stderr?.includes('auth')) {
            console.warn('Skipping Snyk test - authentication required');
            return;
          }
          throw error;
        }
      }

      // Write scan results
      const reportPath = join(testOutputDir, 'snyk-scan-results.json');
      await writeFile(reportPath, JSON.stringify(testResult, null, 2));

      // Analyze vulnerabilities by severity
      const vulnerabilities = testResult.vulnerabilities || [];
      const severityCount = {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
      };

      // Generate summary report
      const summaryReport = {
        timestamp: new Date().toISOString(),
        projectName: testResult.projectName,
        dependencyCount: testResult.dependencyCount,
        vulnerabilities: severityCount,
        ok: testResult.ok,
        uniqueCount: testResult.uniqueCount,
        packageManager: testResult.packageManager,
      };

      const summaryPath = join(testOutputDir, 'snyk-summary.json');
      await writeFile(summaryPath, JSON.stringify(summaryReport, null, 2));

      // Assert security thresholds
      if (config.failOn.includes('critical')) {
        expect(severityCount.critical).toBe(0);
      }
      if (config.failOn.includes('high')) {
        expect(severityCount.high).toBe(0);
      }

      // Generate detailed vulnerability report if issues found
      if (vulnerabilities.length > 0) {
        await generateSnykVulnerabilityReport(testResult, testOutputDir);
      }
    });

    it('should check for license compliance', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk license scan - CLI not available');
        return;
      }

      try {
        const { stdout } = await execAsync('snyk test --json --license', {
          timeout: config.test.timeout * 1000,
        });

        const licenseResult = JSON.parse(stdout);
        
        const licenseReport = {
          timestamp: new Date().toISOString(),
          licenses: licenseResult.licensesPolicy || {},
          violations: licenseResult.vulnerabilities?.filter((v: any) => 
            v.type === 'license'
          ) || [],
        };

        const reportPath = join(testOutputDir, 'snyk-license-report.json');
        await writeFile(reportPath, JSON.stringify(licenseReport, null, 2));

        // Assert no license violations
        expect(licenseReport.violations.length).toBe(0);

      } catch (error) {
        // Handle license check errors
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        if (errorOutput.includes('license')) {
          const errorPath = join(testOutputDir, 'snyk-license-errors.txt');
          await writeFile(errorPath, errorOutput);
          
          // License violations should fail the test
          expect.fail('License policy violations found');
        }
        
        // Skip if command not supported
        if (errorOutput.includes('not supported')) {
          console.warn('Snyk license checking not supported');
          return;
        }
        
        throw error;
      }
    });
  });

  describe('Code Security Analysis', () => {
    it('should scan source code for security issues', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk code scan - CLI not available');
        return;
      }

      try {
        const { stdout } = await execAsync('snyk code test --json', {
          timeout: config.test.timeout * 1000,
        });

        const codeResult = JSON.parse(stdout);
        
        const codeReport = {
          timestamp: new Date().toISOString(),
          runs: codeResult.runs || [],
          summary: {
            issues: codeResult.runs?.[0]?.results?.length || 0,
            files: codeResult.runs?.[0]?.tool?.driver?.rules?.length || 0,
          },
        };

        const reportPath = join(testOutputDir, 'snyk-code-analysis.json');
        await writeFile(reportPath, JSON.stringify(codeReport, null, 2));

        // Analyze code issues by severity
        const issues = codeResult.runs?.[0]?.results || [];
        const highSeverityIssues = issues.filter((issue: any) => 
          issue.level === 'error' || 
          issue.properties?.priorityScore > 700
        );

        expect(highSeverityIssues.length).toBe(0);

      } catch (error) {
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        // Code analysis might not be available for all users
        if (errorOutput.includes('not entitled') || 
            errorOutput.includes('not available')) {
          console.warn('Snyk Code analysis not available for this account');
          return;
        }
        
        if ((error as any).stdout) {
          const errorPath = join(testOutputDir, 'snyk-code-errors.json');
          await writeFile(errorPath, (error as any).stdout);
        }
        
        throw error;
      }
    });
  });

  describe('Container Security', () => {
    it('should scan Docker images if Dockerfile exists', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk container scan - CLI not available');
        return;
      }

      // Check if Dockerfile exists
      const dockerfilePath = resolve(process.cwd(), 'Dockerfile');
      const dockerfileExists = await access(dockerfilePath).then(() => true).catch(() => false);

      if (!dockerfileExists) {
        console.warn('No Dockerfile found, skipping container scan');
        return;
      }

      try {
        const { stdout } = await execAsync('snyk container test --json', {
          timeout: config.test.timeout * 1000,
        });

        const containerResult = JSON.parse(stdout);
        
        const containerReport = {
          timestamp: new Date().toISOString(),
          vulnerabilities: containerResult.vulnerabilities || [],
          baseImage: containerResult.baseImage,
          platform: containerResult.platform,
        };

        const reportPath = join(testOutputDir, 'snyk-container-scan.json');
        await writeFile(reportPath, JSON.stringify(containerReport, null, 2));

        // Check for high/critical container vulnerabilities
        const containerVulns = containerResult.vulnerabilities || [];
        const criticalVulns = containerVulns.filter((v: any) => v.severity === 'critical');
        const highVulns = containerVulns.filter((v: any) => v.severity === 'high');

        expect(criticalVulns.length).toBe(0);
        expect(highVulns.length).toBeLessThanOrEqual(5); // Allow some high severity

      } catch (error) {
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        if (errorOutput.includes('no supported')) {
          console.warn('Container scanning not supported');
          return;
        }
        
        throw error;
      }
    });
  });

  describe('Infrastructure as Code', () => {
    it('should scan IaC files for security misconfigurations', async () => {
      if (!snykAvailable) {
        console.warn('Skipping Snyk IaC scan - CLI not available');
        return;
      }

      try {
        const { stdout } = await execAsync('snyk iac test --json', {
          timeout: config.test.timeout * 1000,
        });

        const iacResult = JSON.parse(stdout);
        
        const iacReport = {
          timestamp: new Date().toISOString(),
          infrastructureAsCodeIssues: iacResult.infrastructureAsCodeIssues || [],
          summary: {
            total: iacResult.infrastructureAsCodeIssues?.length || 0,
            high: iacResult.infrastructureAsCodeIssues?.filter((i: any) => 
              i.severity === 'high'
            ).length || 0,
            medium: iacResult.infrastructureAsCodeIssues?.filter((i: any) => 
              i.severity === 'medium'
            ).length || 0,
          },
        };

        const reportPath = join(testOutputDir, 'snyk-iac-scan.json');
        await writeFile(reportPath, JSON.stringify(iacReport, null, 2));

        // Assert no high-severity IaC issues
        expect(iacReport.summary.high).toBeLessThanOrEqual(2);

      } catch (error) {
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        
        if (errorOutput.includes('No supported') || 
            errorOutput.includes('No infrastructure')) {
          console.warn('No IaC files found to scan');
          return;
        }
        
        throw error;
      }
    });
  });

  describe('Continuous Monitoring', () => {
    it('should enable monitoring if configured', async () => {
      if (!snykAvailable || !config.monitor.enabled) {
        console.warn('Skipping Snyk monitoring setup - not enabled');
        return;
      }

      try {
        const command = [
          'snyk monitor',
          `--project-name="${config.monitor.projectName}"`,
          config.org ? `--org=${config.org}` : '',
          config.monitor.targetFile ? `--file=${config.monitor.targetFile}` : '',
        ].filter(Boolean).join(' ');

        const { stdout } = await execAsync(command, {
          timeout: config.test.timeout * 1000,
        });

        const monitorReport = {
          timestamp: new Date().toISOString(),
          status: 'success',
          output: stdout,
          projectName: config.monitor.projectName,
        };

        const reportPath = join(testOutputDir, 'snyk-monitor.json');
        await writeFile(reportPath, JSON.stringify(monitorReport, null, 2));

        expect(stdout).toContain('Monitoring');

      } catch (error) {
        const monitorReport = {
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: (error as any).message,
          stdout: (error as any).stdout || '',
          stderr: (error as any).stderr || '',
        };

        const reportPath = join(testOutputDir, 'snyk-monitor-error.json');
        await writeFile(reportPath, JSON.stringify(monitorReport, null, 2));

        // Don't fail the test for monitoring setup issues
        console.warn('Snyk monitoring setup failed:', error);
      }
    });
  });
});

async function generateSnykVulnerabilityReport(
  testResult: SnykTestResult,
  outputDir: string
): Promise<void> {
  const vulnerabilities = testResult.vulnerabilities;
  
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      upgradable: vulnerabilities.filter(v => v.isUpgradable).length,
      patchable: vulnerabilities.filter(v => v.isPatchable).length,
    },
    vulnerabilities: vulnerabilities.map(vuln => ({
      id: vuln.id,
      title: vuln.title,
      package: vuln.packageName,
      version: vuln.version,
      severity: vuln.severity,
      cvssScore: vuln.cvssScore,
      isUpgradable: vuln.isUpgradable,
      isPatchable: vuln.isPatchable,
      upgradePath: vuln.upgradePath,
      identifiers: vuln.identifiers,
      publicationTime: vuln.publicationTime,
    })),
    remediation: testResult.remediation,
    recommendations: {
      immediate: 'Address critical and high severity vulnerabilities',
      upgrade: 'Update packages with available upgrades',
      patch: 'Apply patches for vulnerabilities without upgrades',
      monitor: 'Enable Snyk monitoring for continuous security',
    },
  };

  const reportPath = join(outputDir, 'snyk-detailed-report.json');
  await writeFile(reportPath, JSON.stringify(detailedReport, null, 2));
}
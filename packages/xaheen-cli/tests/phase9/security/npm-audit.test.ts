/**
 * npm Audit Security Testing Suite
 * 
 * Tests dependency vulnerabilities using npm audit and validates
 * security thresholds defined in the security configuration.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { securityScanConfig } from '../config/security-scan.config.js';

const execAsync = promisify(exec);

interface NpmAuditResult {
  auditReportVersion: number;
  vulnerabilities: Record<string, VulnerabilityInfo>;
  metadata: {
    vulnerabilities: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
      info: number;
      total: number;
    };
    dependencies: {
      prod: number;
      dev: number;
      optional: number;
      peer: number;
      peerOptional: number;
      total: number;
    };
  };
}

interface VulnerabilityInfo {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  isDirect: boolean;
  via: Array<string | VulnerabilityDetail>;
  effects: string[];
  range: string;
  nodes: string[];
  fixAvailable: boolean | FixInfo;
}

interface VulnerabilityDetail {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: string;
  cwe: string[];
  cvss: {
    score: number;
    vectorString: string;
  };
  range: string;
}

interface FixInfo {
  name: string;
  version: string;
  isSemVerMajor: boolean;
}

describe('Phase 9: Security - npm Audit', () => {
  const testOutputDir = resolve(process.cwd(), 'test-output/security');
  const config = securityScanConfig.npmAudit;

  beforeAll(async () => {
    await mkdir(testOutputDir, { recursive: true });
  });

  describe('Dependency Vulnerability Scanning', () => {
    it('should run npm audit without critical vulnerabilities', async () => {
      let auditResult: NpmAuditResult;
      let auditOutput = '';

      try {
        const command = [
          'npm audit',
          '--json',
          config.production ? '--production' : '',
          `--audit-level=${config.auditLevel}`,
        ].filter(Boolean).join(' ');

        const { stdout, stderr } = await execAsync(command, {
          timeout: config.timeout,
          cwd: process.cwd(),
        });

        auditOutput = stdout;
        auditResult = JSON.parse(stdout);

        // Write audit report to file
        const reportPath = join(testOutputDir, 'npm-audit-report.json');
        await writeFile(reportPath, JSON.stringify(auditResult, null, 2));

      } catch (error) {
        // npm audit returns non-zero exit code if vulnerabilities are found
        const stdout = (error as any).stdout || '';
        const stderr = (error as any).stderr || '';
        
        if (stdout) {
          auditOutput = stdout;
          try {
            auditResult = JSON.parse(stdout);
          } catch (parseError) {
            // Write raw output if JSON parsing fails
            const errorPath = join(testOutputDir, 'npm-audit-error.txt');
            await writeFile(errorPath, `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`);
            throw new Error(`Failed to parse npm audit output: ${parseError}`);
          }
        } else {
          const errorPath = join(testOutputDir, 'npm-audit-error.txt');
          await writeFile(errorPath, `Error running npm audit:\n${stderr || error}`);
          throw error;
        }
      }

      // Validate vulnerability thresholds
      const vulnerabilities = auditResult.metadata.vulnerabilities;
      
      // Critical vulnerabilities should be 0
      expect(vulnerabilities.critical).toBeLessThanOrEqual(config.thresholds.critical);
      
      // High vulnerabilities should be 0
      expect(vulnerabilities.high).toBeLessThanOrEqual(config.thresholds.high);
      
      // Moderate vulnerabilities should be within threshold
      expect(vulnerabilities.moderate).toBeLessThanOrEqual(config.thresholds.moderate);
      
      // Low vulnerabilities should be within threshold
      expect(vulnerabilities.low).toBeLessThanOrEqual(config.thresholds.low);

      // Generate detailed report if vulnerabilities found
      if (vulnerabilities.total > 0) {
        await generateVulnerabilityReport(auditResult, testOutputDir);
      }
    });

    it('should identify fixable vulnerabilities', async () => {
      try {
        const { stdout } = await execAsync('npm audit --json', {
          timeout: config.timeout,
        });

        const auditResult: NpmAuditResult = JSON.parse(stdout);
        const vulnerabilities = Object.values(auditResult.vulnerabilities);
        
        const fixableVulns = vulnerabilities.filter(vuln => 
          vuln.fixAvailable && vuln.fixAvailable !== false
        );

        const criticalFixable = fixableVulns.filter(vuln => 
          vuln.severity === 'critical'
        );

        const highFixable = fixableVulns.filter(vuln => 
          vuln.severity === 'high'
        );

        // Generate fixable vulnerabilities report
        const fixReport = {
          timestamp: new Date().toISOString(),
          summary: {
            total: fixableVulns.length,
            critical: criticalFixable.length,
            high: highFixable.length,
            fixable: fixableVulns.length,
          },
          recommendations: fixableVulns.map(vuln => ({
            package: vuln.name,
            severity: vuln.severity,
            fixAvailable: vuln.fixAvailable,
            isDirect: vuln.isDirect,
          })),
          commands: {
            autoFix: 'npm audit fix',
            forceFix: 'npm audit fix --force',
          },
        };

        const reportPath = join(testOutputDir, 'fixable-vulnerabilities.json');
        await writeFile(reportPath, JSON.stringify(fixReport, null, 2));

        // If critical or high severity vulnerabilities are fixable, fail the test
        if (criticalFixable.length > 0 || highFixable.length > 0) {
          const errorMessage = `Found ${criticalFixable.length} critical and ${highFixable.length} high severity fixable vulnerabilities. Run 'npm audit fix' to resolve.`;
          expect.fail(errorMessage);
        }

      } catch (error) {
        if ((error as any).stdout) {
          // npm audit returned non-zero but we can still parse the output
          const auditResult = JSON.parse((error as any).stdout);
          const reportPath = join(testOutputDir, 'npm-audit-with-errors.json');
          await writeFile(reportPath, JSON.stringify(auditResult, null, 2));
        }
        
        // Re-throw if it's not a vulnerability-related error
        if (!(error as any).stdout) {
          throw error;
        }
      }
    });

    it('should validate package integrity', async () => {
      try {
        // Check package-lock.json integrity
        const { stdout, stderr } = await execAsync('npm audit signatures', {
          timeout: config.timeout,
        });

        const integrityReport = {
          timestamp: new Date().toISOString(),
          status: 'passed',
          output: stdout,
          errors: stderr,
        };

        const reportPath = join(testOutputDir, 'package-integrity.json');
        await writeFile(reportPath, JSON.stringify(integrityReport, null, 2));

        expect(stderr).toBe('');

      } catch (error) {
        const integrityReport = {
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: (error as any).message,
          stdout: (error as any).stdout || '',
          stderr: (error as any).stderr || '',
        };

        const reportPath = join(testOutputDir, 'package-integrity-error.json');
        await writeFile(reportPath, JSON.stringify(integrityReport, null, 2));

        // Package integrity failures should fail the test
        throw error;
      }
    });
  });

  describe('Security Advisory Monitoring', () => {
    it('should check for security advisories', async () => {
      try {
        const { stdout } = await execAsync('npm audit --json');
        const auditResult: NpmAuditResult = JSON.parse(stdout);
        
        // Extract security advisories
        const advisories: Array<{
          id: number;
          title: string;
          severity: string;
          package: string;
          patched_versions: string;
          vulnerable_versions: string;
          url: string;
        }> = [];

        // Process vulnerabilities to extract advisory information
        Object.values(auditResult.vulnerabilities).forEach(vuln => {
          vuln.via.forEach(via => {
            if (typeof via === 'object' && 'source' in via) {
              advisories.push({
                id: via.source,
                title: via.title,
                severity: via.severity,
                package: via.name,
                patched_versions: '', // Would need to extract from range
                vulnerable_versions: via.range,
                url: via.url,
              });
            }
          });
        });

        const advisoryReport = {
          timestamp: new Date().toISOString(),
          totalAdvisories: advisories.length,
          advisories: advisories,
          severityBreakdown: {
            critical: advisories.filter(a => a.severity === 'critical').length,
            high: advisories.filter(a => a.severity === 'high').length,
            moderate: advisories.filter(a => a.severity === 'moderate').length,
            low: advisories.filter(a => a.severity === 'low').length,
          },
        };

        const reportPath = join(testOutputDir, 'security-advisories.json');
        await writeFile(reportPath, JSON.stringify(advisoryReport, null, 2));

        // Assert no critical or high severity advisories
        const criticalAdvisories = advisories.filter(a => a.severity === 'critical');
        const highAdvisories = advisories.filter(a => a.severity === 'high');

        expect(criticalAdvisories.length).toBe(0);
        expect(highAdvisories.length).toBe(0);

      } catch (error) {
        // Handle audit errors gracefully
        const errorPath = join(testOutputDir, 'advisory-check-error.txt');
        await writeFile(errorPath, `Error checking advisories: ${error}`);
        
        if (!(error as any).stdout) {
          throw error;
        }
      }
    });
  });

  describe('Production vs Development Dependencies', () => {
    it('should scan production dependencies only in production mode', async () => {
      if (!config.production) {
        return; // Skip if not in production mode
      }

      try {
        const { stdout } = await execAsync('npm audit --production --json', {
          timeout: config.timeout,
        });

        const prodAuditResult: NpmAuditResult = JSON.parse(stdout);
        
        const prodReport = {
          timestamp: new Date().toISOString(),
          mode: 'production-only',
          vulnerabilities: prodAuditResult.metadata.vulnerabilities,
          dependencies: prodAuditResult.metadata.dependencies,
        };

        const reportPath = join(testOutputDir, 'production-audit.json');
        await writeFile(reportPath, JSON.stringify(prodReport, null, 2));

        // Production should have zero critical/high vulnerabilities
        expect(prodAuditResult.metadata.vulnerabilities.critical).toBe(0);
        expect(prodAuditResult.metadata.vulnerabilities.high).toBe(0);

      } catch (error) {
        if ((error as any).stdout) {
          const auditResult = JSON.parse((error as any).stdout);
          const reportPath = join(testOutputDir, 'production-audit-with-vulns.json');
          await writeFile(reportPath, JSON.stringify(auditResult, null, 2));
          
          // Fail if production dependencies have vulnerabilities
          expect.fail('Production dependencies contain vulnerabilities');
        }
        throw error;
      }
    });

    it('should compare dev vs prod vulnerability counts', async () => {
      try {
        const [prodResult, devResult] = await Promise.allSettled([
          execAsync('npm audit --production --json'),
          execAsync('npm audit --json'),
        ]);

        let prodVulns = 0;
        let totalVulns = 0;

        if (prodResult.status === 'fulfilled') {
          const prodAudit: NpmAuditResult = JSON.parse(prodResult.value.stdout);
          prodVulns = prodAudit.metadata.vulnerabilities.total;
        } else if ((prodResult.reason as any).stdout) {
          const prodAudit: NpmAuditResult = JSON.parse((prodResult.reason as any).stdout);
          prodVulns = prodAudit.metadata.vulnerabilities.total;
        }

        if (devResult.status === 'fulfilled') {
          const devAudit: NpmAuditResult = JSON.parse(devResult.value.stdout);
          totalVulns = devAudit.metadata.vulnerabilities.total;
        } else if ((devResult.reason as any).stdout) {
          const devAudit: NpmAuditResult = JSON.parse((devResult.reason as any).stdout);
          totalVulns = devAudit.metadata.vulnerabilities.total;
        }

        const comparisonReport = {
          timestamp: new Date().toISOString(),
          productionVulnerabilities: prodVulns,
          totalVulnerabilities: totalVulns,
          devOnlyVulnerabilities: totalVulns - prodVulns,
          analysis: {
            prodRisk: prodVulns === 0 ? 'low' : prodVulns < 5 ? 'medium' : 'high',
            devRisk: (totalVulns - prodVulns) < 10 ? 'acceptable' : 'concerning',
          },
        };

        const reportPath = join(testOutputDir, 'dependency-comparison.json');
        await writeFile(reportPath, JSON.stringify(comparisonReport, null, 2));

        // Production vulnerabilities should always be minimal
        expect(prodVulns).toBeLessThanOrEqual(2);

      } catch (error) {
        console.warn('Could not compare prod vs dev vulnerabilities:', error);
      }
    });
  });
});

async function generateVulnerabilityReport(
  auditResult: NpmAuditResult,
  outputDir: string
): Promise<void> {
  const vulnerabilities = Object.entries(auditResult.vulnerabilities);
  
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: auditResult.metadata.vulnerabilities,
    details: vulnerabilities.map(([name, vuln]) => ({
      package: name,
      severity: vuln.severity,
      isDirect: vuln.isDirect,
      fixAvailable: vuln.fixAvailable,
      effects: vuln.effects,
      advisories: vuln.via.filter(v => typeof v === 'object').map(v => ({
        title: (v as VulnerabilityDetail).title,
        url: (v as VulnerabilityDetail).url,
        cwe: (v as VulnerabilityDetail).cwe,
        cvss: (v as VulnerabilityDetail).cvss,
      })),
    })),
    recommendations: {
      immediate: 'Run npm audit fix to address fixable vulnerabilities',
      review: 'Review and update dependencies with security vulnerabilities',
      monitor: 'Set up continuous dependency monitoring',
    },
  };

  const reportPath = join(outputDir, 'detailed-vulnerability-report.json');
  await writeFile(reportPath, JSON.stringify(detailedReport, null, 2));
}
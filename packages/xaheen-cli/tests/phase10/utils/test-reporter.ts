/**
 * Test Reporter for Phase 10 Compliance Testing
 * 
 * Generates comprehensive compliance reports, certificates, and documentation
 * for Norwegian government standards compliance verification.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Phase10ReportOptions {
  results: TestResult[];
  totalDuration: number;
  complianceStandards: string[];
  norwegianCompliance: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  certificates: string[];
}

export interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  violations: number;
  coverage: number;
  errors: string[];
  complianceScore: number;
}

export interface ComplianceReport {
  reportId: string;
  reportPath: string;
  overallScore: number;
  certificateGenerated: boolean;
  certificatePath?: string;
  norwegianCompliant: boolean;
  wcagCompliant: boolean;
  gdprCompliant: boolean;
  nsmCompliant: boolean;
}

export class TestReporter {
  private outputDirectory: string;
  private generateCertificates: boolean;
  private norwegianCompliance: boolean;

  constructor(options: {
    outputDirectory: string;
    generateCertificates?: boolean;
    norwegianCompliance?: boolean;
  }) {
    this.outputDirectory = options.outputDirectory;
    this.generateCertificates = options.generateCertificates ?? true;
    this.norwegianCompliance = options.norwegianCompliance ?? true;
    
    // Ensure output directory exists
    if (!existsSync(this.outputDirectory)) {
      mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  async generatePhase10Report(options: Phase10ReportOptions): Promise<ComplianceReport> {
    const reportId = `phase10-report-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Calculate overall compliance metrics
    const overallScore = this.calculateOverallScore(options.results);
    const passedSuites = options.results.filter(r => r.passed);
    const failedSuites = options.results.filter(r => !r.passed);
    
    // Determine compliance status for each area
    const norwegianCompliant = this.isNorwegianCompliant(options.results);
    const wcagCompliant = this.isWCAGCompliant(options.results, options.wcagLevel);
    const gdprCompliant = this.isGDPRCompliant(options.results);
    const nsmCompliant = this.isNSMCompliant(options.results);
    
    // Generate main report
    const report = {
      reportMetadata: {
        reportId,
        generatedAt: timestamp,
        version: '1.0.0',
        reportType: 'Norwegian Government Compliance Assessment',
        testingFramework: 'Xaheen CLI Phase 10',
        complianceLevel: options.wcagLevel,
        standards: options.complianceStandards
      },
      executionSummary: {
        totalDuration: Math.round(options.totalDuration / 1000),
        totalSuites: options.results.length,
        passedSuites: passedSuites.length,
        failedSuites: failedSuites.length,
        overallScore,
        passRate: Math.round((passedSuites.length / options.results.length) * 100)
      },
      complianceAssessment: {
        norwegianGovernmentCompliance: {
          compliant: norwegianCompliant,
          standards: ['BankID Integration', 'Altinn Integration', 'DIGDIR Reporting'],
          score: this.calculateAreaScore(options.results, ['BankID Integration', 'Altinn Integration', 'DIGDIR Service Reporting'])
        },
        dataProtectionCompliance: {
          compliant: gdprCompliant,
          standards: ['GDPR Article 7', 'GDPR Article 17', 'GDPR Article 25', 'Norwegian Personal Data Act'],
          score: this.calculateAreaScore(options.results, ['GDPR Consent Management', 'GDPR Data Deletion'])
        },
        securityCompliance: {
          compliant: nsmCompliant,
          standards: ['NSM Security Framework', 'Norwegian Security Law', 'Information Security'],
          score: this.calculateAreaScore(options.results, ['NSM Security Classification'])
        },
        accessibilityCompliance: {
          compliant: wcagCompliant,
          standards: [`WCAG 2.2 Level ${options.wcagLevel}`, 'Norwegian Web Accessibility Regulations', 'Universal Design'],
          score: this.calculateAreaScore(options.results, ['WCAG 2.2 AAA Accessibility'])
        },
        documentDeliveryCompliance: {
          compliant: this.isDigipostCompliant(options.results),
          standards: ['Norwegian Document Delivery Standards', 'Digipost Integration'],
          score: this.calculateAreaScore(options.results, ['Digipost Document Submission'])
        }
      },
      detailedResults: options.results.map(result => ({
        testSuite: result.suite,
        status: result.passed ? 'PASSED' : 'FAILED',
        duration: Math.round(result.duration / 1000),
        complianceScore: result.complianceScore,
        violations: result.violations,
        coverage: result.coverage,
        criticalIssues: result.errors.filter(error => 
          error.toLowerCase().includes('critical') || 
          error.toLowerCase().includes('security') ||
          error.toLowerCase().includes('accessibility')
        ),
        recommendations: this.generateRecommendations(result)
      })),
      certificationStatus: {
        eligible: overallScore >= 95 && norwegianCompliant && wcagCompliant && gdprCompliant && nsmCompliant,
        certificates: this.generateCertificates ? options.certificates : [],
        validUntil: this.calculateCertificateExpiry(),
        renewalRequired: true,
        complianceAreas: {
          bankid: passedSuites.some(s => s.suite === 'BankID Integration'),
          altinn: passedSuites.some(s => s.suite === 'Altinn Integration'),
          digipost: passedSuites.some(s => s.suite === 'Digipost Document Submission'),
          nsm: passedSuites.some(s => s.suite === 'NSM Security Classification'),
          digdir: passedSuites.some(s => s.suite === 'DIGDIR Service Reporting'),
          gdpr: passedSuites.some(s => s.suite.includes('GDPR')),
          wcag: passedSuites.some(s => s.suite.includes('WCAG'))
        }
      },
      auditTrail: {
        testExecutionId: reportId,
        executedBy: 'Xaheen CLI Test Suite',
        environment: 'Norwegian Government Test Infrastructure',
        testData: 'Synthetic data compliant with Norwegian data protection laws',
        witnessedBy: 'Automated Test Framework',
        integrityChecksum: this.generateIntegrityChecksum(options.results)
      },
      actionItems: this.generateActionItems(failedSuites),
      nextSteps: this.generateNextSteps(overallScore, norwegianCompliant, wcagCompliant, gdprCompliant, nsmCompliant)
    };

    // Write main report
    const reportPath = join(this.outputDirectory, 'reports', `${reportId}.json`);
    this.ensureDirectoryExists(join(this.outputDirectory, 'reports'));
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReportPath = join(this.outputDirectory, 'reports', `${reportId}.html`);
    this.generateHTMLReport(report, htmlReportPath);

    // Generate certificate if eligible
    let certificatePath: string | undefined;
    let certificateGenerated = false;

    if (this.generateCertificates && report.certificationStatus.eligible) {
      certificatePath = await this.generateComplianceCertificate(report, reportId);
      certificateGenerated = true;
    }

    return {
      reportId,
      reportPath,
      overallScore,
      certificateGenerated,
      certificatePath,
      norwegianCompliant,
      wcagCompliant,
      gdprCompliant,
      nsmCompliant
    };
  }

  private calculateOverallScore(results: TestResult[]): number {
    if (results.length === 0) return 0;
    
    const totalScore = results.reduce((sum, result) => sum + result.complianceScore, 0);
    return Math.round(totalScore / results.length);
  }

  private calculateAreaScore(results: TestResult[], suiteNames: string[]): number {
    const relevantResults = results.filter(r => suiteNames.includes(r.suite));
    if (relevantResults.length === 0) return 0;
    
    const totalScore = relevantResults.reduce((sum, result) => sum + result.complianceScore, 0);
    return Math.round(totalScore / relevantResults.length);
  }

  private isNorwegianCompliant(results: TestResult[]): boolean {
    const norwegianSuites = ['BankID Integration', 'Altinn Integration', 'DIGDIR Service Reporting'];
    return norwegianSuites.every(suite => 
      results.find(r => r.suite === suite)?.passed === true
    );
  }

  private isWCAGCompliant(results: TestResult[], level: 'A' | 'AA' | 'AAA'): boolean {
    const wcagResult = results.find(r => r.suite.includes('WCAG'));
    return wcagResult?.passed === true && wcagResult?.violations === 0;
  }

  private isGDPRCompliant(results: TestResult[]): boolean {
    const gdprSuites = results.filter(r => r.suite.includes('GDPR'));
    return gdprSuites.length > 0 && gdprSuites.every(r => r.passed);
  }

  private isNSMCompliant(results: TestResult[]): boolean {
    const nsmResult = results.find(r => r.suite.includes('NSM'));
    return nsmResult?.passed === true;
  }

  private isDigipostCompliant(results: TestResult[]): boolean {
    const digipostResult = results.find(r => r.suite.includes('Digipost'));
    return digipostResult?.passed === true;
  }

  private generateRecommendations(result: TestResult): string[] {
    const recommendations: string[] = [];
    
    if (!result.passed) {
      recommendations.push('Complete test execution and resolve all failures');
    }
    
    if (result.violations > 0) {
      recommendations.push(`Address ${result.violations} compliance violations`);
    }
    
    if (result.coverage < 90) {
      recommendations.push(`Improve test coverage from ${result.coverage}% to at least 90%`);
    }
    
    if (result.complianceScore < 95) {
      recommendations.push(`Improve compliance score from ${result.complianceScore}% to at least 95%`);
    }
    
    // Suite-specific recommendations
    if (result.suite.includes('WCAG')) {
      recommendations.push('Review accessibility guidelines and ensure all UI components meet WCAG 2.2 AAA standards');
    }
    
    if (result.suite.includes('GDPR')) {
      recommendations.push('Verify data processing lawfulness and implement privacy by design principles');
    }
    
    if (result.suite.includes('NSM')) {
      recommendations.push('Enhance security classification handling and audit logging');
    }
    
    return recommendations;
  }

  private generateActionItems(failedSuites: TestResult[]): string[] {
    const actionItems: string[] = [];
    
    if (failedSuites.length === 0) {
      actionItems.push('No action items - all compliance tests passed');
      return actionItems;
    }
    
    actionItems.push('CRITICAL: Resolve all failing compliance tests before production deployment');
    
    failedSuites.forEach(suite => {
      actionItems.push(`Fix ${suite.suite}: ${suite.violations} violations, ${suite.errors.length} errors`);
    });
    
    if (failedSuites.some(s => s.suite.includes('BankID') || s.suite.includes('Altinn'))) {
      actionItems.push('Verify Norwegian government service credentials and network connectivity');
    }
    
    if (failedSuites.some(s => s.suite.includes('GDPR'))) {
      actionItems.push('Consult with Data Protection Officer (DPO) for GDPR compliance review');
    }
    
    if (failedSuites.some(s => s.suite.includes('WCAG'))) {
      actionItems.push('Conduct accessibility audit with assistive technology testing');
    }
    
    if (failedSuites.some(s => s.suite.includes('NSM'))) {
      actionItems.push('Review security classification procedures with NSM compliance officer');
    }
    
    return actionItems;
  }

  private generateNextSteps(overallScore: number, norwegianCompliant: boolean, 
                          wcagCompliant: boolean, gdprCompliant: boolean, nsmCompliant: boolean): string[] {
    const nextSteps: string[] = [];
    
    if (overallScore >= 95 && norwegianCompliant && wcagCompliant && gdprCompliant && nsmCompliant) {
      nextSteps.push('✅ All compliance requirements met - Ready for production deployment');
      nextSteps.push('🎖️ Apply for Norwegian Government Digital Service Certificate');
      nextSteps.push('📋 Schedule quarterly compliance review');
      nextSteps.push('🔄 Set up continuous compliance monitoring');
    } else {
      nextSteps.push('❌ Compliance requirements not fully met - Production deployment blocked');
      
      if (!norwegianCompliant) {
        nextSteps.push('🇳🇴 Complete Norwegian government service integration testing');
      }
      
      if (!wcagCompliant) {
        nextSteps.push('♿ Achieve WCAG 2.2 AAA accessibility compliance');
      }
      
      if (!gdprCompliant) {
        nextSteps.push('🔒 Implement complete GDPR compliance workflows');
      }
      
      if (!nsmCompliant) {
        nextSteps.push('🛡️ Complete NSM security classification implementation');
      }
      
      nextSteps.push('🔄 Re-run Phase 10 tests after addressing all issues');
    }
    
    return nextSteps;
  }

  private calculateCertificateExpiry(): string {
    // Certificates valid for 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    return expiryDate.toISOString();
  }

  private generateIntegrityChecksum(results: TestResult[]): string {
    const data = JSON.stringify(results, Object.keys(results).sort());
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private generateHTMLReport(report: any, outputPath: string): void {
    const html = `
<!DOCTYPE html>
<html lang="nb-NO">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase 10: Norwegian Government Compliance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #005fcc; font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 1.2em; }
        .score { font-size: 3em; font-weight: bold; margin: 20px 0; }
        .score.pass { color: #22c55e; }
        .score.fail { color: #ef4444; }
        .section { margin: 30px 0; }
        .section h2 { color: #005fcc; border-bottom: 2px solid #005fcc; padding-bottom: 10px; }
        .compliance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .compliance-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .compliance-card.pass { border-left: 5px solid #22c55e; }
        .compliance-card.fail { border-left: 5px solid #ef4444; }
        .test-results { margin: 20px 0; }
        .test-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .test-row.pass { background: #f0fdf4; }
        .test-row.fail { background: #fef2f2; }
        .certificate { background: linear-gradient(135deg, #005fcc, #0073e6); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🇳🇴 Xaheen CLI</div>
            <div class="subtitle">Phase 10: Norwegian Government Compliance Report</div>
            <div class="score ${report.executionSummary.overallScore >= 95 ? 'pass' : 'fail'}">
                ${report.executionSummary.overallScore}%
            </div>
            <div>Generated: ${new Date(report.reportMetadata.generatedAt).toLocaleString('nb-NO')}</div>
        </div>

        <div class="section">
            <h2>📊 Executive Summary</h2>
            <p><strong>Total Duration:</strong> ${report.executionSummary.totalDuration} seconds</p>
            <p><strong>Test Suites:</strong> ${report.executionSummary.passedSuites}/${report.executionSummary.totalSuites} passed</p>
            <p><strong>Pass Rate:</strong> ${report.executionSummary.passRate}%</p>
            <p><strong>Overall Score:</strong> ${report.executionSummary.overallScore}%</p>
        </div>

        <div class="section">
            <h2>🏛️ Compliance Assessment</h2>
            <div class="compliance-grid">
                <div class="compliance-card ${report.complianceAssessment.norwegianGovernmentCompliance.compliant ? 'pass' : 'fail'}">
                    <h3>🇳🇴 Norwegian Government</h3>
                    <p><strong>Status:</strong> ${report.complianceAssessment.norwegianGovernmentCompliance.compliant ? 'Compliant' : 'Non-Compliant'}</p>
                    <p><strong>Score:</strong> ${report.complianceAssessment.norwegianGovernmentCompliance.score}%</p>
                </div>
                <div class="compliance-card ${report.complianceAssessment.dataProtectionCompliance.compliant ? 'pass' : 'fail'}">
                    <h3>🔒 Data Protection (GDPR)</h3>
                    <p><strong>Status:</strong> ${report.complianceAssessment.dataProtectionCompliance.compliant ? 'Compliant' : 'Non-Compliant'}</p>
                    <p><strong>Score:</strong> ${report.complianceAssessment.dataProtectionCompliance.score}%</p>
                </div>
                <div class="compliance-card ${report.complianceAssessment.securityCompliance.compliant ? 'pass' : 'fail'}">
                    <h3>🛡️ Security (NSM)</h3>
                    <p><strong>Status:</strong> ${report.complianceAssessment.securityCompliance.compliant ? 'Compliant' : 'Non-Compliant'}</p>
                    <p><strong>Score:</strong> ${report.complianceAssessment.securityCompliance.score}%</p>
                </div>
                <div class="compliance-card ${report.complianceAssessment.accessibilityCompliance.compliant ? 'pass' : 'fail'}">
                    <h3>♿ Accessibility (WCAG 2.2 AAA)</h3>
                    <p><strong>Status:</strong> ${report.complianceAssessment.accessibilityCompliance.compliant ? 'Compliant' : 'Non-Compliant'}</p>
                    <p><strong>Score:</strong> ${report.complianceAssessment.accessibilityCompliance.score}%</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test Results</h2>
            <div class="test-results">
                ${report.detailedResults.map((result: any) => `
                    <div class="test-row ${result.status === 'PASSED' ? 'pass' : 'fail'}">
                        <div>
                            <strong>${result.testSuite}</strong>
                            <div style="font-size: 0.9em; color: #666;">
                                Duration: ${result.duration}s | Coverage: ${result.coverage}%
                            </div>
                        </div>
                        <div>
                            <span style="font-weight: bold; color: ${result.status === 'PASSED' ? '#22c55e' : '#ef4444'};">
                                ${result.status}
                            </span>
                            <div style="font-size: 0.9em;">Score: ${result.complianceScore}%</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${report.certificationStatus.eligible ? `
        <div class="certificate">
            <h2>🎖️ Norwegian Government Compliance Certificate</h2>
            <p><strong>Certificate ID:</strong> ${report.reportMetadata.reportId}</p>
            <p><strong>Valid Until:</strong> ${new Date(report.certificationStatus.validUntil).toLocaleDateString('nb-NO')}</p>
            <p><strong>Compliance Areas:</strong> BankID, Altinn, Digipost, NSM, DIGDIR, GDPR, WCAG 2.2 AAA</p>
            <p><em>This certificate validates compliance with Norwegian government digital service standards.</em></p>
        </div>
        ` : ''}

        <div class="section">
            <h2>📋 Next Steps</h2>
            <ul>
                ${report.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
            </ul>
        </div>

        <div class="footer">
            <p>Report generated by Xaheen CLI Phase 10 Compliance Testing Suite</p>
            <p>Norwegian Government Standards Compliance Verification</p>
        </div>
    </div>
</body>
</html>`;

    writeFileSync(outputPath, html);
  }

  private async generateComplianceCertificate(report: any, reportId: string): Promise<string> {
    const certificatePath = join(this.outputDirectory, 'certificates', `${reportId}-certificate.json`);
    this.ensureDirectoryExists(join(this.outputDirectory, 'certificates'));

    const certificate = {
      certificateId: `XAHEEN-NGS-${Date.now()}`,
      certificateType: 'Norwegian Government Standards Compliance',
      issuedTo: 'Xaheen CLI',
      issuedBy: 'Xaheen Enterprise Compliance Testing Suite',
      issuedDate: new Date().toISOString(),
      validUntil: report.certificationStatus.validUntil,
      complianceLevel: 'Full Compliance',
      standards: {
        norwegianGovernment: ['BankID Integration', 'Altinn Integration', 'DIGDIR Reporting'],
        dataProtection: ['GDPR Article 7', 'GDPR Article 17', 'GDPR Article 25'],
        security: ['NSM Security Framework'],
        accessibility: ['WCAG 2.2 Level AAA'],
        documentDelivery: ['Digipost Integration']
      },
      testResults: {
        overallScore: report.executionSummary.overallScore,
        passRate: report.executionSummary.passRate,
        testExecutionId: reportId
      },
      verification: {
        method: 'Automated Testing Suite',
        witnessed: 'Digital Audit Trail',
        integrityHash: report.auditTrail.integrityChecksum
      },
      renewalRequired: true,
      renewalDate: report.certificationStatus.validUntil
    };

    writeFileSync(certificatePath, JSON.stringify(certificate, null, 2));
    return certificatePath;
  }

  private ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }
}
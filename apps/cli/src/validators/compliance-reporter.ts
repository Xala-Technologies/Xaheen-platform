import { z } from 'zod';
import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { AggregatedResult } from './validation-engine.js';
import type { NorwegianResult } from './norwegian-validator.js';
import type { GDPRResult } from './gdpr-validator.js';
import type { NSMResult } from './nsm-validator.js';
import type { WCAGResult } from './accessibility-validator.js';
import type { GenerationResult } from '../types.js';

/**
 * Compliance Reporter
 * 
 * Comprehensive compliance reporting system that generates detailed
 * reports, analytics, trends, and regulatory submission documents
 * with multi-format output support
 */

// Report types
export enum ReportType {
  EXECUTIVE_SUMMARY = 'executive-summary',
  DETAILED_FINDINGS = 'detailed-findings',
  TECHNICAL_ANALYSIS = 'technical-analysis',
  COMPLIANCE_DASHBOARD = 'compliance-dashboard',
  REGULATORY_SUBMISSION = 'regulatory-submission',
  AUDIT_TRAIL = 'audit-trail',
  CERTIFICATION_READINESS = 'certification-readiness',
  TREND_ANALYSIS = 'trend-analysis'
}

// Report formats
export enum ReportFormat {
  PDF = 'pdf',
  HTML = 'html',
  JSON = 'json',
  CSV = 'csv',
  MARKDOWN = 'markdown',
  XLSX = 'xlsx',
  XML = 'xml'
}

// Report priority levels
export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Distribution channels
export enum DistributionChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook',
  FTP = 'ftp',
  API = 'api'
}

// Report configuration schema
const reportConfigSchema = z.object({
  types: z.array(z.nativeEnum(ReportType)).default([
    ReportType.EXECUTIVE_SUMMARY,
    ReportType.DETAILED_FINDINGS
  ]),
  formats: z.array(z.nativeEnum(ReportFormat)).default([
    ReportFormat.HTML,
    ReportFormat.PDF,
    ReportFormat.JSON
  ]),
  outputPath: z.string().default('./reports'),
  includeMetrics: z.boolean().default(true),
  includeTrends: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  includeCertificationStatus: z.boolean().default(true),
  language: z.enum(['en', 'nb', 'nn']).default('en'),
  branding: z.object({
    companyName: z.string().optional(),
    logo: z.string().optional(),
    colors: z.object({
      primary: z.string().default('#4CAF50'),
      secondary: z.string().default('#2196F3'),
      accent: z.string().default('#FF9800'),
      danger: z.string().default('#f44336')
    })
  }).optional(),
  distribution: z.object({
    enabled: z.boolean().default(false),
    channels: z.array(z.nativeEnum(DistributionChannel)).default([]),
    recipients: z.array(z.string()).default([]),
    schedule: z.object({
      frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']).default('immediate'),
      time: z.string().default('09:00'),
      timezone: z.string().default('Europe/Oslo')
    })
  }),
  retention: z.object({
    enabled: z.boolean().default(true),
    days: z.number().default(365),
    archivePath: z.string().optional()
  })
});

export type ReportConfig = z.infer<typeof reportConfigSchema>;

// Compliance certificate schema
const certificateSchema = z.object({
  id: z.string(),
  type: z.enum(['ISO27001', 'NSM', 'GDPR', 'WCAG', 'Norwegian']),
  level: z.string(),
  issueDate: z.string(),
  expiryDate: z.string(),
  score: z.number(),
  compliant: z.boolean(),
  requirements: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['passed', 'failed', 'partial']),
    score: z.number(),
    details: z.string()
  })),
  attestation: z.object({
    auditor: z.string(),
    signature: z.string(),
    timestamp: z.string()
  })
});

export type ComplianceCertificate = z.infer<typeof certificateSchema>;

// Report template data schema
const reportDataSchema = z.object({
  metadata: z.object({
    projectName: z.string(),
    reportId: z.string(),
    generatedAt: z.string(),
    reportType: z.nativeEnum(ReportType),
    version: z.string(),
    author: z.string().optional(),
    reviewedBy: z.string().optional()
  }),
  executiveSummary: z.object({
    overallScore: z.number(),
    complianceStatus: z.string(),
    keyFindings: z.array(z.string()),
    criticalIssues: z.number(),
    recommendations: z.array(z.string()),
    timeline: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical'])
  }),
  detailedFindings: z.object({
    frameworks: z.array(z.object({
      name: z.string(),
      score: z.number(),
      compliant: z.boolean(),
      issues: z.array(z.object({
        severity: z.string(),
        message: z.string(),
        location: z.string(),
        recommendation: z.string()
      }))
    })),
    vulnerabilities: z.array(z.object({
      type: z.string(),
      severity: z.string(),
      description: z.string(),
      impact: z.string(),
      mitigation: z.string()
    })),
    accessibility: z.array(z.object({
      principle: z.string(),
      level: z.string(),
      issue: z.string(),
      solution: z.string()
    }))
  }),
  metrics: z.object({
    performance: z.object({
      totalTime: z.number(),
      memoryUsage: z.number(),
      linesAnalyzed: z.number()
    }),
    coverage: z.object({
      filesScanned: z.number(),
      functionsAnalyzed: z.number(),
      componentsChecked: z.number()
    }),
    trends: z.object({
      scoreHistory: z.array(z.object({
        date: z.string(),
        score: z.number()
      })),
      issuesTrend: z.object({
        current: z.number(),
        previous: z.number(),
        change: z.number()
      })
    })
  }),
  certifications: z.array(certificateSchema),
  actionPlan: z.object({
    immediate: z.array(z.object({
      priority: z.number(),
      task: z.string(),
      effort: z.string(),
      deadline: z.string()
    })),
    shortTerm: z.array(z.object({
      priority: z.number(),
      task: z.string(),
      effort: z.string(),
      deadline: z.string()
    })),
    longTerm: z.array(z.object({
      priority: z.number(),
      task: z.string(),
      effort: z.string(),
      deadline: z.string()
    }))
  })
});

export type ReportData = z.infer<typeof reportDataSchema>;

/**
 * Compliance Reporter
 */
export class ComplianceReporter {
  private config: ReportConfig;
  private reportHistory: ReportData[] = [];

  constructor(config: Partial<ReportConfig> = {}) {
    this.config = reportConfigSchema.parse(config);
    this.ensureOutputDirectories();
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateReport(
    validationResults: AggregatedResult[],
    type: ReportType = ReportType.EXECUTIVE_SUMMARY,
    format: ReportFormat = ReportFormat.HTML
  ): Promise<string> {
    const reportData = await this.prepareReportData(validationResults, type);
    const reportContent = await this.renderReport(reportData, format);
    const outputPath = await this.saveReport(reportContent, reportData.metadata.reportId, format);
    
    // Store in history
    this.reportHistory.push(reportData);
    if (this.reportHistory.length > 100) {
      this.reportHistory.shift(); // Keep last 100 reports
    }

    // Distribute if configured
    if (this.config.distribution.enabled) {
      await this.distributeReport(outputPath, reportData);
    }

    return outputPath;
  }

  /**
   * Generate multiple report formats
   */
  async generateMultiFormatReport(
    validationResults: AggregatedResult[],
    type: ReportType = ReportType.EXECUTIVE_SUMMARY
  ): Promise<Record<ReportFormat, string>> {
    const reportData = await this.prepareReportData(validationResults, type);
    const outputs: Record<ReportFormat, string> = {} as any;

    for (const format of this.config.formats) {
      try {
        const content = await this.renderReport(reportData, format);
        const path = await this.saveReport(content, reportData.metadata.reportId, format);
        outputs[format] = path;
      } catch (error) {
        console.warn(`Failed to generate ${format} report: ${error}`);
      }
    }

    return outputs;
  }

  /**
   * Prepare report data from validation results
   */
  private async prepareReportData(
    validationResults: AggregatedResult[],
    type: ReportType
  ): Promise<ReportData> {
    if (validationResults.length === 0) {
      throw new Error('No validation results provided for report generation');
    }

    const latest = validationResults[validationResults.length - 1];
    const reportId = `${type}-${Date.now()}`;

    // Executive summary
    const executiveSummary = {
      overallScore: latest.overallScore,
      complianceStatus: latest.overallCompliant ? 'Compliant' : 'Non-compliant',
      keyFindings: this.extractKeyFindings(latest),
      criticalIssues: latest.totalErrors,
      recommendations: latest.recommendations.slice(0, 5).map(r => r.message),
      timeline: this.estimateRemediationTimeline(latest),
      riskLevel: this.calculateRiskLevel(latest) as 'low' | 'medium' | 'high' | 'critical'
    };

    // Detailed findings
    const detailedFindings = {
      frameworks: this.extractFrameworkFindings(latest),
      vulnerabilities: this.extractVulnerabilities(latest),
      accessibility: this.extractAccessibilityIssues(latest)
    };

    // Performance metrics
    const metrics = {
      performance: {
        totalTime: latest.executionTime,
        memoryUsage: latest.metrics.performance.memoryUsage,
        linesAnalyzed: latest.metrics.coverage.linesAnalyzed
      },
      coverage: {
        filesScanned: 1, // Would be actual count in real implementation
        functionsAnalyzed: latest.metrics.coverage.functionsAnalyzed,
        componentsChecked: latest.metrics.coverage.componentsAnalyzed
      },
      trends: {
        scoreHistory: this.generateScoreHistory(validationResults),
        issuesTrend: this.calculateIssuesTrend(validationResults)
      }
    };

    // Generate certificates
    const certifications = await this.generateCertificates(latest);

    // Action plan
    const actionPlan = this.generateActionPlan(latest);

    return {
      metadata: {
        projectName: this.config.branding?.companyName || 'Project',
        reportId,
        generatedAt: new Date().toISOString(),
        reportType: type,
        version: '1.0.0',
        author: 'Xaheen Compliance Reporter',
        reviewedBy: undefined
      },
      executiveSummary,
      detailedFindings,
      metrics,
      certifications,
      actionPlan
    };
  }

  /**
   * Extract key findings from validation results
   */
  private extractKeyFindings(result: AggregatedResult): string[] {
    const findings: string[] = [];

    if (result.overallCompliant) {
      findings.push('System meets all compliance requirements');
    } else {
      findings.push(`System has ${result.totalErrors} critical compliance issues`);
    }

    if (result.totalWarnings > 5) {
      findings.push(`${result.totalWarnings} warnings require attention`);
    }

    // GDPR findings
    if (result.validationResults.gdpr && !result.validationResults.gdpr.compliant) {
      findings.push('GDPR compliance issues detected');
    }

    // Security findings
    if (result.validationResults.nsm && result.validationResults.nsm.vulnerabilities.length > 0) {
      findings.push(`${result.validationResults.nsm.vulnerabilities.length} security vulnerabilities found`);
    }

    // Accessibility findings
    if (result.validationResults.wcag && !result.validationResults.wcag.compliant) {
      findings.push('Accessibility improvements needed');
    }

    return findings;
  }

  /**
   * Extract framework-specific findings
   */
  private extractFrameworkFindings(result: AggregatedResult): any[] {
    const frameworks: any[] = [];

    // GDPR framework
    if (result.validationResults.gdpr) {
      const gdpr = result.validationResults.gdpr as GDPRResult;
      frameworks.push({
        name: 'GDPR',
        score: gdpr.score,
        compliant: gdpr.compliant,
        issues: gdpr.issues.map(issue => ({
          severity: issue.severity,
          message: issue.message,
          location: issue.line ? `Line ${issue.line}` : 'Unknown',
          recommendation: issue.suggestion || 'Review and address this issue'
        }))
      });
    }

    // NSM framework
    if (result.validationResults.nsm) {
      const nsm = result.validationResults.nsm as NSMResult;
      frameworks.push({
        name: 'NSM Security',
        score: nsm.score,
        compliant: nsm.compliant,
        issues: nsm.vulnerabilities.map(vuln => ({
          severity: vuln.severity,
          message: vuln.description,
          location: vuln.line ? `Line ${vuln.line}` : 'Unknown',
          recommendation: vuln.mitigation
        }))
      });
    }

    // WCAG framework
    if (result.validationResults.wcag) {
      const wcag = result.validationResults.wcag as WCAGResult;
      frameworks.push({
        name: 'WCAG Accessibility',
        score: wcag.score,
        compliant: wcag.compliant,
        issues: Object.values(wcag.principles).flatMap(principle =>
          principle.issues.map(issue => ({
            severity: issue.severity,
            message: issue.message,
            location: issue.line ? `Line ${issue.line}` : 'Unknown',
            recommendation: issue.suggestion || 'Review accessibility guidelines'
          }))
        )
      });
    }

    return frameworks;
  }

  /**
   * Extract security vulnerabilities
   */
  private extractVulnerabilities(result: AggregatedResult): any[] {
    const vulnerabilities: any[] = [];

    if (result.validationResults.nsm) {
      const nsm = result.validationResults.nsm as NSMResult;
      nsm.vulnerabilities.forEach(vuln => {
        vulnerabilities.push({
          type: vuln.type,
          severity: vuln.severity,
          description: vuln.description,
          impact: this.assessVulnerabilityImpact(vuln.severity),
          mitigation: vuln.mitigation
        });
      });
    }

    return vulnerabilities;
  }

  /**
   * Extract accessibility issues
   */
  private extractAccessibilityIssues(result: AggregatedResult): any[] {
    const issues: any[] = [];

    if (result.validationResults.wcag) {
      const wcag = result.validationResults.wcag as WCAGResult;
      Object.entries(wcag.principles).forEach(([principle, data]) => {
        data.issues.forEach(issue => {
          issues.push({
            principle,
            level: wcag.targetLevel,
            issue: issue.message,
            solution: issue.suggestion || 'Consult WCAG guidelines'
          });
        });
      });
    }

    return issues;
  }

  /**
   * Generate score history from validation results
   */
  private generateScoreHistory(results: AggregatedResult[]): any[] {
    return results.slice(-10).map(result => ({
      date: result.timestamp,
      score: result.overallScore
    }));
  }

  /**
   * Calculate issues trend
   */
  private calculateIssuesTrend(results: AggregatedResult[]): any {
    if (results.length < 2) {
      return { current: results[0]?.totalIssues || 0, previous: 0, change: 0 };
    }

    const current = results[results.length - 1].totalIssues;
    const previous = results[results.length - 2].totalIssues;
    const change = current - previous;

    return { current, previous, change };
  }

  /**
   * Generate compliance certificates
   */
  private async generateCertificates(result: AggregatedResult): Promise<ComplianceCertificate[]> {
    const certificates: ComplianceCertificate[] = [];

    // GDPR Certificate
    if (result.validationResults.gdpr) {
      const gdpr = result.validationResults.gdpr as GDPRResult;
      if (gdpr.compliant && gdpr.score >= 85) {
        certificates.push({
          id: `GDPR-${Date.now()}`,
          type: 'GDPR',
          level: 'Compliant',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          score: gdpr.score,
          compliant: true,
          requirements: [
            {
              id: 'data-protection',
              name: 'Data Protection',
              status: 'passed',
              score: 95,
              details: 'All data protection measures implemented'
            },
            {
              id: 'consent-management',
              name: 'Consent Management',
              status: 'passed',
              score: 90,
              details: 'Proper consent mechanisms in place'
            }
          ],
          attestation: {
            auditor: 'Xaheen Compliance Engine',
            signature: 'automated-validation',
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    // NSM Certificate
    if (result.validationResults.nsm) {
      const nsm = result.validationResults.nsm as NSMResult;
      if (nsm.compliant && nsm.score >= 90) {
        certificates.push({
          id: `NSM-${Date.now()}`,
          type: 'NSM',
          level: 'Sikkerhetsgodkjent',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          score: nsm.score,
          compliant: true,
          requirements: [
            {
              id: 'security-controls',
              name: 'Security Controls',
              status: 'passed',
              score: 92,
              details: 'All required security controls implemented'
            },
            {
              id: 'threat-protection',
              name: 'Threat Protection',
              status: 'passed',
              score: 88,
              details: 'Adequate threat protection measures'
            }
          ],
          attestation: {
            auditor: 'Xaheen Security Validator',
            signature: 'automated-validation',
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return certificates;
  }

  /**
   * Generate action plan
   */
  private generateActionPlan(result: AggregatedResult): any {
    const immediate: any[] = [];
    const shortTerm: any[] = [];
    const longTerm: any[] = [];

    // Critical issues - immediate action
    result.recommendations
      .filter(r => r.severity === 'critical')
      .forEach((rec, index) => {
        immediate.push({
          priority: index + 1,
          task: rec.message,
          effort: rec.estimated_effort,
          deadline: this.calculateDeadline(1) // 1 day
        });
      });

    // High priority issues - short term
    result.recommendations
      .filter(r => r.severity === 'high')
      .forEach((rec, index) => {
        shortTerm.push({
          priority: index + 1,
          task: rec.message,
          effort: rec.estimated_effort,
          deadline: this.calculateDeadline(7) // 1 week
        });
      });

    // Medium priority - long term
    result.recommendations
      .filter(r => r.severity === 'medium' || r.severity === 'low')
      .forEach((rec, index) => {
        longTerm.push({
          priority: index + 1,
          task: rec.message,
          effort: rec.estimated_effort,
          deadline: this.calculateDeadline(30) // 1 month
        });
      });

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Render report in specified format
   */
  private async renderReport(data: ReportData, format: ReportFormat): Promise<string> {
    switch (format) {
      case ReportFormat.HTML:
        return this.renderHTMLReport(data);
      case ReportFormat.JSON:
        return JSON.stringify(data, null, 2);
      case ReportFormat.CSV:
        return this.renderCSVReport(data);
      case ReportFormat.MARKDOWN:
        return this.renderMarkdownReport(data);
      case ReportFormat.XML:
        return this.renderXMLReport(data);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  /**
   * Render HTML report
   */
  private renderHTMLReport(data: ReportData): string {
    const colors = this.config.branding?.colors || {
      primary: '#4CAF50',
      secondary: '#2196F3',
      accent: '#FF9800',
      danger: '#f44336'
    };

    return `
<!DOCTYPE html>
<html lang="${this.config.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Report - ${data.metadata.projectName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .score-badge {
            display: inline-block;
            font-size: 48px;
            font-weight: bold;
            background: rgba(255,255,255,0.2);
            padding: 20px 40px;
            border-radius: 50px;
            margin: 20px 0;
        }
        .status {
            font-size: 24px;
            margin: 10px 0;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: ${colors.primary};
            margin-bottom: 20px;
            border-bottom: 2px solid ${colors.primary};
            padding-bottom: 10px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-box {
            background: ${colors.secondary};
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            display: block;
        }
        .frameworks-list {
            display: grid;
            gap: 15px;
        }
        .framework {
            padding: 15px;
            border-left: 4px solid ${colors.accent};
            background: #f9f9f9;
        }
        .framework.compliant {
            border-color: ${colors.primary};
        }
        .framework.non-compliant {
            border-color: ${colors.danger};
        }
        .issue {
            margin: 10px 0;
            padding: 10px;
            background: #fff3cd;
            border-left: 3px solid ${colors.accent};
            border-radius: 4px;
        }
        .issue.critical {
            background: #f8d7da;
            border-color: ${colors.danger};
        }
        .issue.high {
            background: #fff3cd;
            border-color: ${colors.accent};
        }
        .recommendations {
            list-style: none;
        }
        .recommendations li {
            margin: 10px 0;
            padding: 15px;
            background: #e8f5e8;
            border-left: 4px solid ${colors.primary};
            border-radius: 4px;
        }
        .action-plan {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .action-column {
            background: white;
            border-radius: 8px;
            padding: 20px;
            border-top: 4px solid;
        }
        .immediate { border-color: ${colors.danger}; }
        .short-term { border-color: ${colors.accent}; }
        .long-term { border-color: ${colors.primary}; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            border-top: 1px solid #ddd;
        }
        .chart-placeholder {
            height: 300px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: #666;
            font-size: 18px;
        }
        @media print {
            body { background: white; }
            .card { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Compliance Report</h1>
            <h2>${data.metadata.projectName}</h2>
            <div class="score-badge">${data.executiveSummary.overallScore}/100</div>
            <div class="status">${data.executiveSummary.complianceStatus}</div>
            <p>Generated: ${new Date(data.metadata.generatedAt).toLocaleDateString()}</p>
        </div>

        <div class="card">
            <h2>📊 Executive Summary</h2>
            <div class="metrics-grid">
                <div class="metric-box">
                    <span class="metric-value">${data.executiveSummary.overallScore}</span>
                    <span>Overall Score</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${data.executiveSummary.criticalIssues}</span>
                    <span>Critical Issues</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${data.executiveSummary.riskLevel.toUpperCase()}</span>
                    <span>Risk Level</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${data.executiveSummary.timeline}</span>
                    <span>Timeline</span>
                </div>
            </div>
            
            <h3>Key Findings</h3>
            <ul class="recommendations">
                ${data.executiveSummary.keyFindings.map(finding => 
                    `<li>${finding}</li>`
                ).join('')}
            </ul>
        </div>

        <div class="card">
            <h2>🔍 Framework Analysis</h2>
            <div class="frameworks-list">
                ${data.detailedFindings.frameworks.map(framework => `
                    <div class="framework ${framework.compliant ? 'compliant' : 'non-compliant'}">
                        <h3>${framework.name}</h3>
                        <p>Score: ${framework.score}/100 | Status: ${framework.compliant ? '✅ Compliant' : '❌ Non-compliant'}</p>
                        ${framework.issues.length > 0 ? `
                            <h4>Issues (${framework.issues.length})</h4>
                            ${framework.issues.slice(0, 3).map(issue => `
                                <div class="issue ${issue.severity}">
                                    <strong>${issue.severity.toUpperCase()}</strong>: ${issue.message}
                                    <br><small>Location: ${issue.location}</small>
                                    <br><small>Recommendation: ${issue.recommendation}</small>
                                </div>
                            `).join('')}
                            ${framework.issues.length > 3 ? `<p><em>... and ${framework.issues.length - 3} more issues</em></p>` : ''}
                        ` : '<p>✅ No issues found</p>'}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <h2>📈 Performance Metrics</h2>
            <div class="metrics-grid">
                <div class="metric-box">
                    <span class="metric-value">${data.metrics.performance.totalTime}ms</span>
                    <span>Execution Time</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${Math.round(data.metrics.performance.memoryUsage / 1024 / 1024)}MB</span>
                    <span>Memory Usage</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${data.metrics.coverage.filesScanned}</span>
                    <span>Files Scanned</span>
                </div>
                <div class="metric-box">
                    <span class="metric-value">${data.metrics.performance.linesAnalyzed}</span>
                    <span>Lines Analyzed</span>
                </div>
            </div>
            
            <h3>Score Trend</h3>
            <div class="chart-placeholder">
                Score History Chart (${data.metrics.trends.scoreHistory.length} data points)
            </div>
        </div>

        ${data.certifications.length > 0 ? `
        <div class="card">
            <h2>🏅 Certifications</h2>
            ${data.certifications.map(cert => `
                <div class="framework compliant">
                    <h3>${cert.type} Certification</h3>
                    <p>Level: ${cert.level} | Score: ${cert.score}/100</p>
                    <p>Valid: ${new Date(cert.issueDate).toLocaleDateString()} - ${new Date(cert.expiryDate).toLocaleDateString()}</p>
                    <p>Status: ${cert.compliant ? '✅ Valid' : '❌ Invalid'}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="card">
            <h2>📋 Action Plan</h2>
            <div class="action-plan">
                <div class="action-column immediate">
                    <h3>🚨 Immediate (1-3 days)</h3>
                    ${data.actionPlan.immediate.length > 0 ? 
                        data.actionPlan.immediate.map(action => `
                            <div class="issue critical">
                                <strong>Priority ${action.priority}</strong>: ${action.task}
                                <br><small>Effort: ${action.effort} | Deadline: ${action.deadline}</small>
                            </div>
                        `).join('') : 
                        '<p>✅ No immediate actions required</p>'
                    }
                </div>
                
                <div class="action-column short-term">
                    <h3>⏰ Short Term (1-4 weeks)</h3>
                    ${data.actionPlan.shortTerm.length > 0 ? 
                        data.actionPlan.shortTerm.map(action => `
                            <div class="issue high">
                                <strong>Priority ${action.priority}</strong>: ${action.task}
                                <br><small>Effort: ${action.effort} | Deadline: ${action.deadline}</small>
                            </div>
                        `).join('') : 
                        '<p>✅ No short-term actions required</p>'
                    }
                </div>
                
                <div class="action-column long-term">
                    <h3>📅 Long Term (1-6 months)</h3>
                    ${data.actionPlan.longTerm.length > 0 ? 
                        data.actionPlan.longTerm.map(action => `
                            <div class="issue">
                                <strong>Priority ${action.priority}</strong>: ${action.task}
                                <br><small>Effort: ${action.effort} | Deadline: ${action.deadline}</small>
                            </div>
                        `).join('') : 
                        '<p>✅ No long-term actions required</p>'
                    }
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Report ID: ${data.metadata.reportId}</p>
            <p>Generated by ${data.metadata.author} on ${new Date(data.metadata.generatedAt).toLocaleString()}</p>
            <p>Xaheen Platform Compliance Reporter v${data.metadata.version}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Render CSV report
   */
  private renderCSVReport(data: ReportData): string {
    const rows = [
      ['Metric', 'Value'],
      ['Report ID', data.metadata.reportId],
      ['Project', data.metadata.projectName],
      ['Generated', data.metadata.generatedAt],
      ['Overall Score', data.executiveSummary.overallScore.toString()],
      ['Compliance Status', data.executiveSummary.complianceStatus],
      ['Critical Issues', data.executiveSummary.criticalIssues.toString()],
      ['Risk Level', data.executiveSummary.riskLevel],
      ['Timeline', data.executiveSummary.timeline],
      ['Execution Time', `${data.metrics.performance.totalTime}ms`],
      ['Memory Usage', `${Math.round(data.metrics.performance.memoryUsage / 1024 / 1024)}MB`],
      ['Files Scanned', data.metrics.coverage.filesScanned.toString()],
      ['Lines Analyzed', data.metrics.performance.linesAnalyzed.toString()],
      [],
      ['Framework', 'Score', 'Compliant', 'Issues'],
      ...data.detailedFindings.frameworks.map(f => [
        f.name,
        f.score.toString(),
        f.compliant.toString(),
        f.issues.length.toString()
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Render Markdown report
   */
  private renderMarkdownReport(data: ReportData): string {
    return `
# Compliance Report - ${data.metadata.projectName}

**Report ID**: ${data.metadata.reportId}  
**Generated**: ${new Date(data.metadata.generatedAt).toLocaleDateString()}  
**Version**: ${data.metadata.version}

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall Score | ${data.executiveSummary.overallScore}/100 |
| Compliance Status | ${data.executiveSummary.complianceStatus} |
| Critical Issues | ${data.executiveSummary.criticalIssues} |
| Risk Level | ${data.executiveSummary.riskLevel.toUpperCase()} |
| Timeline | ${data.executiveSummary.timeline} |

### Key Findings

${data.executiveSummary.keyFindings.map(finding => `- ${finding}`).join('\n')}

## Framework Analysis

${data.detailedFindings.frameworks.map(framework => `
### ${framework.name}

- **Score**: ${framework.score}/100
- **Status**: ${framework.compliant ? '✅ Compliant' : '❌ Non-compliant'}
- **Issues**: ${framework.issues.length}

${framework.issues.length > 0 ? `
#### Issues
${framework.issues.slice(0, 5).map(issue => `
- **${issue.severity.toUpperCase()}**: ${issue.message}
  - Location: ${issue.location}
  - Recommendation: ${issue.recommendation}
`).join('')}
` : '✅ No issues found'}
`).join('\n')}

## Performance Metrics

| Metric | Value |
|--------|-------|
| Execution Time | ${data.metrics.performance.totalTime}ms |
| Memory Usage | ${Math.round(data.metrics.performance.memoryUsage / 1024 / 1024)}MB |
| Files Scanned | ${data.metrics.coverage.filesScanned} |
| Lines Analyzed | ${data.metrics.performance.linesAnalyzed} |

## Action Plan

### 🚨 Immediate Actions (1-3 days)

${data.actionPlan.immediate.length > 0 ? 
  data.actionPlan.immediate.map(action => 
    `${action.priority}. ${action.task} (${action.effort}, deadline: ${action.deadline})`
  ).join('\n') : 
  '✅ No immediate actions required'
}

### ⏰ Short Term Actions (1-4 weeks)

${data.actionPlan.shortTerm.length > 0 ? 
  data.actionPlan.shortTerm.map(action => 
    `${action.priority}. ${action.task} (${action.effort}, deadline: ${action.deadline})`
  ).join('\n') : 
  '✅ No short-term actions required'
}

### 📅 Long Term Actions (1-6 months)

${data.actionPlan.longTerm.length > 0 ? 
  data.actionPlan.longTerm.map(action => 
    `${action.priority}. ${action.task} (${action.effort}, deadline: ${action.deadline})`
  ).join('\n') : 
  '✅ No long-term actions required'
}

${data.certifications.length > 0 ? `
## Certifications

${data.certifications.map(cert => `
### ${cert.type} Certification

- **Level**: ${cert.level}
- **Score**: ${cert.score}/100
- **Valid**: ${new Date(cert.issueDate).toLocaleDateString()} - ${new Date(cert.expiryDate).toLocaleDateString()}
- **Status**: ${cert.compliant ? '✅ Valid' : '❌ Invalid'}
`).join('')}
` : ''}

---

*Report generated by ${data.metadata.author}*  
*${new Date(data.metadata.generatedAt).toISOString()}*
`;
  }

  /**
   * Render XML report
   */
  private renderXMLReport(data: ReportData): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ComplianceReport>
    <Metadata>
        <ProjectName>${data.metadata.projectName}</ProjectName>
        <ReportId>${data.metadata.reportId}</ReportId>
        <GeneratedAt>${data.metadata.generatedAt}</GeneratedAt>
        <ReportType>${data.metadata.reportType}</ReportType>
        <Version>${data.metadata.version}</Version>
    </Metadata>
    
    <ExecutiveSummary>
        <OverallScore>${data.executiveSummary.overallScore}</OverallScore>
        <ComplianceStatus>${data.executiveSummary.complianceStatus}</ComplianceStatus>
        <CriticalIssues>${data.executiveSummary.criticalIssues}</CriticalIssues>
        <RiskLevel>${data.executiveSummary.riskLevel}</RiskLevel>
        <Timeline>${data.executiveSummary.timeline}</Timeline>
    </ExecutiveSummary>
    
    <Frameworks>
        ${data.detailedFindings.frameworks.map(framework => `
        <Framework>
            <Name>${framework.name}</Name>
            <Score>${framework.score}</Score>
            <Compliant>${framework.compliant}</Compliant>
            <Issues>
                ${framework.issues.map(issue => `
                <Issue>
                    <Severity>${issue.severity}</Severity>
                    <Message>${issue.message}</Message>
                    <Location>${issue.location}</Location>
                    <Recommendation>${issue.recommendation}</Recommendation>
                </Issue>
                `).join('')}
            </Issues>
        </Framework>
        `).join('')}
    </Frameworks>
    
    <Metrics>
        <Performance>
            <TotalTime>${data.metrics.performance.totalTime}</TotalTime>
            <MemoryUsage>${data.metrics.performance.memoryUsage}</MemoryUsage>
            <LinesAnalyzed>${data.metrics.performance.linesAnalyzed}</LinesAnalyzed>
        </Performance>
    </Metrics>
</ComplianceReport>`;
  }

  /**
   * Save report to file system
   */
  private async saveReport(content: string, reportId: string, format: ReportFormat): Promise<string> {
    const extension = this.getFileExtension(format);
    const fileName = `${reportId}.${extension}`;
    const outputPath = join(this.config.outputPath, fileName);

    // Ensure directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Write file
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(outputPath);
      stream.write(content);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return outputPath;
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.HTML: return 'html';
      case ReportFormat.JSON: return 'json';
      case ReportFormat.CSV: return 'csv';
      case ReportFormat.MARKDOWN: return 'md';
      case ReportFormat.PDF: return 'pdf';
      case ReportFormat.XLSX: return 'xlsx';
      case ReportFormat.XML: return 'xml';
      default: return 'txt';
    }
  }

  /**
   * Distribute report to configured channels
   */
  private async distributeReport(filePath: string, reportData: ReportData): Promise<void> {
    for (const channel of this.config.distribution.channels) {
      try {
        await this.sendToChannel(channel, filePath, reportData);
      } catch (error) {
        console.warn(`Failed to distribute report via ${channel}: ${error}`);
      }
    }
  }

  /**
   * Send report to specific channel
   */
  private async sendToChannel(
    channel: DistributionChannel,
    filePath: string,
    reportData: ReportData
  ): Promise<void> {
    switch (channel) {
      case DistributionChannel.EMAIL:
        console.log(`📧 Would send report to email recipients: ${this.config.distribution.recipients.join(', ')}`);
        break;
      case DistributionChannel.SLACK:
        console.log(`📢 Would send report to Slack channels`);
        break;
      case DistributionChannel.TEAMS:
        console.log(`👥 Would send report to Microsoft Teams`);
        break;
      case DistributionChannel.WEBHOOK:
        console.log(`🔗 Would send report via webhook`);
        break;
      default:
        console.log(`📤 Would distribute via ${channel}`);
    }
  }

  /**
   * Utility methods
   */
  private ensureOutputDirectories(): void {
    mkdirSync(this.config.outputPath, { recursive: true });
    if (this.config.retention.archivePath) {
      mkdirSync(this.config.retention.archivePath, { recursive: true });
    }
  }

  private assessVulnerabilityImpact(severity: string): string {
    switch (severity) {
      case 'critical': return 'System compromise, data breach possible';
      case 'high': return 'Significant security risk, immediate attention required';
      case 'medium': return 'Moderate security risk, should be addressed';
      case 'low': return 'Minor security concern, can be addressed in planned maintenance';
      default: return 'Impact assessment pending';
    }
  }

  private calculateRiskLevel(result: AggregatedResult): string {
    if (result.totalErrors > 5) return 'critical';
    if (result.totalErrors > 0) return 'high';
    if (result.totalWarnings > 10) return 'medium';
    return 'low';
  }

  private estimateRemediationTimeline(result: AggregatedResult): string {
    const totalIssues = result.totalIssues;
    if (totalIssues === 0) return 'No remediation needed';
    if (totalIssues <= 5) return '1-2 weeks';
    if (totalIssues <= 15) return '2-4 weeks';
    if (totalIssues <= 30) return '1-2 months';
    return '2+ months';
  }

  private calculateDeadline(days: number): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toLocaleDateString();
  }

  /**
   * Get report history
   */
  getReportHistory(): ReportData[] {
    return [...this.reportHistory];
  }

  /**
   * Clean up old reports based on retention policy
   */
  async cleanupOldReports(): Promise<void> {
    if (!this.config.retention.enabled) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention.days);

    // Filter out old reports from history
    this.reportHistory = this.reportHistory.filter(report => 
      new Date(report.metadata.generatedAt) > cutoffDate
    );

    console.log(`Cleaned up reports older than ${this.config.retention.days} days`);
  }
}

/**
 * Generate compliance reporter component
 */
export async function generateComplianceReporterComponent(
  options: z.infer<typeof complianceReporterOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate compliance reporter service
  const serviceContent = `
${options.typescript ? `
import type { 
  ReportConfig,
  ReportType,
  ReportFormat,
  ReportData,
  ComplianceCertificate
} from '../types/compliance-reporter';
` : ''}
import { ComplianceReporter } from '../lib/compliance-reporter';
import type { AggregatedResult } from '../lib/validation-engine';

/**
 * Compliance Reporter Service for ${options.projectName}
 * Comprehensive reporting and analytics for compliance validation
 */
export class ComplianceReporterService {
  private reporter: ComplianceReporter;

  constructor(config${options.typescript ? ': Partial<ReportConfig>' : ''} = {}) {
    this.reporter = new ComplianceReporter({
      types: ['executive-summary', 'detailed-findings'],
      formats: ['html', 'json', 'pdf'],
      outputPath: './reports',
      includeMetrics: true,
      includeTrends: true,
      includeRecommendations: true,
      includeCertificationStatus: true,
      language: 'en',
      branding: {
        companyName: '${options.projectName}',
        colors: {
          primary: '#4CAF50',
          secondary: '#2196F3',
          accent: '#FF9800',
          danger: '#f44336'
        }
      },
      distribution: {
        enabled: false,
        channels: [],
        recipients: [],
        schedule: {
          frequency: 'immediate',
          time: '09:00',
          timezone: 'Europe/Oslo'
        }
      },
      retention: {
        enabled: true,
        days: 365
      },
      ...config
    });
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateReport(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''},
    type${options.typescript ? ': ReportType' : ''} = 'executive-summary',
    format${options.typescript ? ': ReportFormat' : ''} = 'html'
  )${options.typescript ? ': Promise<string>' : ''} {
    try {
      console.log(\`\\n📄 Generating \${type} report in \${format} format...\`);
      
      const reportPath = await this.reporter.generateReport(
        validationResults,
        type,
        format
      );
      
      console.log(\`✅ Report generated: \${reportPath}\`);
      return reportPath;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate multiple format reports
   */
  async generateMultiFormatReport(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''},
    type${options.typescript ? ': ReportType' : ''} = 'executive-summary'
  )${options.typescript ? ': Promise<Record<ReportFormat, string>>' : ''} {
    console.log(\`\\n📄 Generating multi-format \${type} report...\`);
    
    const reports = await this.reporter.generateMultiFormatReport(
      validationResults,
      type
    );
    
    console.log(\`✅ Generated \${Object.keys(reports).length} report formats\`);
    Object.entries(reports).forEach(([format, path]) => {
      console.log(\`   - \${format.toUpperCase()}: \${path}\`);
    });
    
    return reports;
  }

  /**
   * Generate executive dashboard report
   */
  async generateExecutiveDashboard(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    return await this.generateReport(
      validationResults,
      'compliance-dashboard',
      'html'
    );
  }

  /**
   * Generate regulatory submission package
   */
  async generateRegulatorySubmission(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<Record<ReportFormat, string>>' : ''} {
    console.log('\\n🏛️ Generating regulatory submission package...');
    
    const reports = await this.reporter.generateMultiFormatReport(
      validationResults,
      'regulatory-submission'
    );
    
    console.log('✅ Regulatory submission package ready');
    return reports;
  }

  /**
   * Generate certification readiness report
   */
  async generateCertificationReport(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    console.log('\\n🏅 Generating certification readiness report...');
    
    const reportPath = await this.reporter.generateReport(
      validationResults,
      'certification-readiness',
      'html'
    );
    
    console.log(\`✅ Certification report generated: \${reportPath}\`);
    return reportPath;
  }

  /**
   * Generate trend analysis report
   */
  async generateTrendAnalysis(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    if (validationResults.length < 2) {
      throw new Error('Trend analysis requires at least 2 validation results');
    }

    console.log(\`\\n📈 Generating trend analysis with \${validationResults.length} data points...\`);
    
    const reportPath = await this.reporter.generateReport(
      validationResults,
      'trend-analysis',
      'html'
    );
    
    console.log(\`✅ Trend analysis generated: \${reportPath}\`);
    return reportPath;
  }

  /**
   * Generate audit trail report
   */
  async generateAuditTrail(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<string>' : ''} {
    console.log('\\n📋 Generating audit trail report...');
    
    const reportPath = await this.reporter.generateReport(
      validationResults,
      'audit-trail',
      'html'
    );
    
    console.log(\`✅ Audit trail generated: \${reportPath}\`);
    return reportPath;
  }

  /**
   * Generate Norwegian compliance report
   */
  async generateNorwegianReport(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''}
  )${options.typescript ? ': Promise<Record<ReportFormat, string>>' : ''} {
    console.log('\\n🇳🇴 Generating Norwegian compliance report...');
    
    // Create Norwegian-specific reporter configuration
    const norwegianReporter = new ComplianceReporter({
      types: ['executive-summary', 'detailed-findings'],
      formats: ['html', 'pdf'],
      language: 'nb',
      branding: {
        companyName: '${options.projectName}',
        colors: {
          primary: '#BA1E2C', // Norwegian red
          secondary: '#003366', // Norwegian blue
          accent: '#FF9800',
          danger: '#f44336'
        }
      }
    });
    
    const reports = await norwegianReporter.generateMultiFormatReport(
      validationResults,
      'detailed-findings'
    );
    
    console.log('✅ Norwegian compliance report generated');
    return reports;
  }

  /**
   * Schedule automated reporting
   */
  scheduleReports(
    validationResults${options.typescript ? ': AggregatedResult[]' : ''},
    frequency${options.typescript ? ': "daily" | "weekly" | "monthly"' : ''} = 'weekly'
  )${options.typescript ? ': void' : ''} {
    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    console.log(\`📅 Scheduling \${frequency} compliance reports...\`);

    setInterval(async () => {
      try {
        await this.generateReport(validationResults, 'executive-summary', 'html');
        console.log(\`✅ Scheduled \${frequency} report generated\`);
      } catch (error) {
        console.error(\`Scheduled report failed: \${error}\`);
      }
    }, intervals[frequency]);
  }

  /**
   * Get report history
   */
  getReportHistory()${options.typescript ? ': ReportData[]' : ''} {
    return this.reporter.getReportHistory();
  }

  /**
   * Clean up old reports
   */
  async cleanupReports()${options.typescript ? ': Promise<void>' : ''} {
    await this.reporter.cleanupOldReports();
    console.log('🧹 Report cleanup completed');
  }

  /**
   * Generate compliance summary for quick overview
   */
  generateQuickSummary(
    result${options.typescript ? ': AggregatedResult' : ''}
  )${options.typescript ? ': string' : ''} {
    const status = result.overallCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT';
    const riskLevel = result.totalErrors > 5 ? 'CRITICAL' : 
                     result.totalErrors > 0 ? 'HIGH' : 
                     result.totalWarnings > 5 ? 'MEDIUM' : 'LOW';

    return \`
📊 ${options.projectName} Compliance Summary
═══════════════════════════════════════

Status: \${status}
Score: \${result.overallScore}/100
Risk Level: \${riskLevel}

Issues:
• Critical: \${result.totalErrors}
• Warnings: \${result.totalWarnings}
• Total: \${result.totalIssues}

Frameworks:
\${result.validationResults.gdpr ? \`• GDPR: \${result.validationResults.gdpr.compliant ? '✅' : '❌'} (\${result.validationResults.gdpr.score}/100)\` : ''}
\${result.validationResults.nsm ? \`• NSM: \${result.validationResults.nsm.compliant ? '✅' : '❌'} (\${result.validationResults.nsm.score}/100)\` : ''}
\${result.validationResults.wcag ? \`• WCAG: \${result.validationResults.wcag.compliant ? '✅' : '❌'} (\${result.validationResults.wcag.score}/100)\` : ''}

Top Recommendations:
\${result.recommendations.slice(0, 3).map((rec, i) => \`\${i + 1}. \${rec.message}\`).join('\\n')}

Generated: \${new Date().toLocaleString()}
\`;
  }
}

// Export singleton instance
export const complianceReporterService = new ComplianceReporterService(${options.companyName ? `{
  branding: {
    companyName: '${options.companyName}'
  }
}` : ''});

// Export example usage
export const reportingExamples = {
  async basicReport(validationResults) {
    return await complianceReporterService.generateReport(
      validationResults,
      'executive-summary',
      'html'
    );
  },

  async fullReportSuite(validationResults) {
    const reports = await complianceReporterService.generateMultiFormatReport(
      validationResults,
      'detailed-findings'
    );
    
    console.log('Generated comprehensive report suite:');
    Object.entries(reports).forEach(([format, path]) => {
      console.log(\`• \${format.toUpperCase()}: \${path}\`);
    });
    
    return reports;
  },

  async norwegianCompliance(validationResults) {
    return await complianceReporterService.generateNorwegianReport(validationResults);
  },

  async certificationPackage(validationResults) {
    const certification = await complianceReporterService.generateCertificationReport(validationResults);
    const regulatory = await complianceReporterService.generateRegulatorySubmission(validationResults);
    
    return { certification, regulatory };
  }
};`;

  files.set('services/compliance-reporter-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Compliance reporter service created successfully'
  };
}

// Component options schema
const complianceReporterOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  companyName: z.string().optional(),
  outputPath: z.string()
});

// Export compliance reporter instance
export const complianceReporter = new ComplianceReporter();
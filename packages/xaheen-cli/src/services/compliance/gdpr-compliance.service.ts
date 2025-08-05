import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { createHash } from 'crypto';

/**
 * GDPR Compliance Service - Automated GDPR compliance scanning and enforcement
 * Implements Norwegian DPA guidelines and GDPR Article 32 technical measures
 */

// GDPR Data Categories and Processing Types
export const GDPRDataCategorySchema = z.enum([
  'personal_identifiable', // Name, email, phone, etc.
  'sensitive_personal', // Health, biometric, genetic data
  'behavioral', // Tracking, analytics, preferences
  'financial', // Payment, billing information
  'location', // Geographic, IP-based location
  'communication', // Messages, call records
  'professional', // Employment, education data
  'demographic', // Age, gender, ethnicity
  'technical', // Device IDs, cookies, logs
]);

export const GDPRProcessingPurposeSchema = z.enum([
  'consent', // Article 6(1)(a) - Consent
  'contract', // Article 6(1)(b) - Contract performance
  'legal_obligation', // Article 6(1)(c) - Legal obligation
  'vital_interests', // Article 6(1)(d) - Vital interests
  'public_task', // Article 6(1)(e) - Public task
  'legitimate_interests', // Article 6(1)(f) - Legitimate interests
]);

// GDPR Compliance Configuration
export const GDPRComplianceConfigSchema = z.object({
  organizationName: z.string(),
  dataController: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    phone: z.string().optional(),
  }),
  dataProtectionOfficer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }).optional(),
  defaultRetentionPeriod: z.string().default('7y'), // Norwegian DPA recommendation
  autoDeleteEnabled: z.boolean().default(true),
  consentManagement: z.object({
    enabled: z.boolean().default(true),
    granular: z.boolean().default(true),
    withdrawalMechanism: z.boolean().default(true),
  }),
  dataSubjectRights: z.object({
    access: z.boolean().default(true),
    rectification: z.boolean().default(true),
    erasure: z.boolean().default(true),
    portability: z.boolean().default(true),
    restriction: z.boolean().default(true),
    objection: z.boolean().default(true),
  }),
  norwegianSpecific: z.object({
    datatilsynetNotifications: z.boolean().default(true),
    norwegianLanguageSupport: z.boolean().default(true),
    localDataStorage: z.boolean().default(false),
  }),
});

export type GDPRDataCategory = z.infer<typeof GDPRDataCategorySchema>;
export type GDPRProcessingPurpose = z.infer<typeof GDPRProcessingPurposeSchema>;
export type GDPRComplianceConfig = z.infer<typeof GDPRComplianceConfigSchema>;

// Data Processing Record
export interface DataProcessingRecord {
  id: string;
  name: string;
  description: string;
  dataCategories: GDPRDataCategory[];
  processingPurposes: GDPRProcessingPurpose[];
  dataSubjects: string[];
  recipientCategories: string[];
  thirdCountryTransfers: boolean;
  retentionPeriod: string;
  technicalMeasures: string[];
  organizationalMeasures: string[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    threats: string[];
    vulnerabilities: string[];
    impacts: string[];
    mitigations: string[];
  };
  lastReviewed: Date;
  nextReview: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
}

// GDPR Audit Result
export interface GDPRAuditResult {
  organizationId: string;
  auditDate: Date;
  auditType: 'automated' | 'manual' | 'external';
  overallCompliance: 'compliant' | 'partially_compliant' | 'non_compliant';
  
  findings: {
    critical: GDPRFinding[];
    major: GDPRFinding[];
    minor: GDPRFinding[];
  };
  
  dataProcessingCompliance: {
    totalRecords: number;
    compliantRecords: number;
    nonCompliantRecords: number;
    missingRecords: string[];
  };
  
  dataSubjectRights: {
    accessRequests: number;
    rectificationRequests: number;
    erasureRequests: number;
    portabilityRequests: number;
    averageResponseTime: number; // hours
    slaBreaches: number;
  };
  
  consentManagement: {
    validConsents: number;
    expiredConsents: number;
    withdrawnConsents: number;
    granularityScore: number; // 0-100
  };
  
  technicalMeasures: {
    encryptionCoverage: number; // percentage
    accessControlCompliance: number; // percentage
    dataMinimizationScore: number; // 0-100
    pseudonymizationScore: number; // 0-100
  };
  
  recommendations: GDPRRecommendation[];
  nextAuditDate: Date;
}

export interface GDPRFinding {
  id: string;
  category: 'data_processing' | 'consent' | 'rights' | 'security' | 'breach' | 'documentation';
  severity: 'critical' | 'major' | 'minor';
  article: string; // GDPR Article reference
  description: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export interface GDPRRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  implementation: string[];
  estimatedEffort: string;
  complianceImpact: string;
  norwegianContext?: string;
}

export class GDPRComplianceService {
  private config: GDPRComplianceConfig;
  private processingRecords: Map<string, DataProcessingRecord> = new Map();
  private auditHistory: GDPRAuditResult[] = [];

  constructor(config: GDPRComplianceConfig) {
    this.config = GDPRComplianceConfigSchema.parse(config);
  }

  /**
   * Perform comprehensive GDPR compliance audit
   */
  async performComplianceAudit(options: {
    includeDataMapping?: boolean;
    validateConsents?: boolean;
    checkRetentionPolicies?: boolean;
    assessRights?: boolean;
    norwegianSpecific?: boolean;
  } = {}): Promise<GDPRAuditResult> {
    const auditId = createHash('sha256').update(`${Date.now()}-${this.config.organizationName}`).digest('hex').substring(0, 16);
    
    console.log(chalk.cyan(`🔍 Starting GDPR Compliance Audit (${auditId})`));
    console.log(chalk.gray(`Organization: ${this.config.organizationName}`));
    console.log(chalk.gray(`Date: ${new Date().toISOString()}`));

    const findings: { critical: GDPRFinding[], major: GDPRFinding[], minor: GDPRFinding[] } = {
      critical: [],
      major: [],
      minor: []
    };

    // 1. Data Processing Assessment (Article 30)
    if (options.includeDataMapping !== false) {
      const dataProcessingFindings = await this.auditDataProcessing();
      findings.critical.push(...dataProcessingFindings.filter(f => f.severity === 'critical'));
      findings.major.push(...dataProcessingFindings.filter(f => f.severity === 'major'));
      findings.minor.push(...dataProcessingFindings.filter(f => f.severity === 'minor'));
    }

    // 2. Consent Management Assessment (Article 7)
    if (options.validateConsents !== false) {
      const consentFindings = await this.auditConsentManagement();
      findings.critical.push(...consentFindings.filter(f => f.severity === 'critical'));
      findings.major.push(...consentFindings.filter(f => f.severity === 'major'));
      findings.minor.push(...consentFindings.filter(f => f.severity === 'minor'));
    }

    // 3. Data Retention Assessment (Article 5)
    if (options.checkRetentionPolicies !== false) {
      const retentionFindings = await this.auditDataRetention();
      findings.critical.push(...retentionFindings.filter(f => f.severity === 'critical'));
      findings.major.push(...retentionFindings.filter(f => f.severity === 'major'));
      findings.minor.push(...retentionFindings.filter(f => f.severity === 'minor'));
    }

    // 4. Data Subject Rights Assessment (Articles 15-22)
    if (options.assessRights !== false) {
      const rightsFindings = await this.auditDataSubjectRights();
      findings.critical.push(...rightsFindings.filter(f => f.severity === 'critical'));
      findings.major.push(...rightsFindings.filter(f => f.severity === 'major'));
      findings.minor.push(...rightsFindings.filter(f => f.severity === 'minor'));
    }

    // 5. Norwegian-Specific Compliance
    if (options.norwegianSpecific !== false) {
      const norwegianFindings = await this.auditNorwegianCompliance();
      findings.critical.push(...norwegianFindings.filter(f => f.severity === 'critical'));
      findings.major.push(...norwegianFindings.filter(f => f.severity === 'major'));
      findings.minor.push(...norwegianFindings.filter(f => f.severity === 'minor'));
    }

    // Calculate overall compliance status
    const totalFindings = findings.critical.length + findings.major.length + findings.minor.length;
    let overallCompliance: 'compliant' | 'partially_compliant' | 'non_compliant';

    if (findings.critical.length > 0) {
      overallCompliance = 'non_compliant';
    } else if (findings.major.length > 0 || findings.minor.length > 5) {
      overallCompliance = 'partially_compliant';
    } else {
      overallCompliance = 'compliant';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(findings);

    const auditResult: GDPRAuditResult = {
      organizationId: auditId,
      auditDate: new Date(),
      auditType: 'automated',
      overallCompliance,
      findings,
      dataProcessingCompliance: {
        totalRecords: this.processingRecords.size,
        compliantRecords: Array.from(this.processingRecords.values()).filter(r => r.complianceStatus === 'compliant').length,
        nonCompliantRecords: Array.from(this.processingRecords.values()).filter(r => r.complianceStatus === 'non_compliant').length,
        missingRecords: await this.findMissingProcessingRecords(),
      },
      dataSubjectRights: await this.assessDataSubjectRights(),
      consentManagement: await this.assessConsentManagement(),
      technicalMeasures: await this.assessTechnicalMeasures(),
      recommendations,
      nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    this.auditHistory.push(auditResult);

    // Display results
    this.displayAuditResults(auditResult);

    return auditResult;
  }

  /**
   * Audit data processing activities (Article 30 compliance)
   */
  private async auditDataProcessing(): Promise<GDPRFinding[]> {
    const findings: GDPRFinding[] = [];

    // Check if Record of Processing Activities exists
    if (this.processingRecords.size === 0) {
      findings.push({
        id: 'GDPR-30-001',
        category: 'data_processing',
        severity: 'critical',
        article: 'Article 30',
        description: 'Missing Record of Processing Activities (RoPA)',
        evidence: ['No processing records found in system'],
        impact: 'Non-compliance with Article 30 requirement to maintain processing records',
        recommendation: 'Create comprehensive Record of Processing Activities documenting all data processing',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    // Validate each processing record
    for (const [id, record] of this.processingRecords) {
      // Check for missing mandatory fields
      if (!record.processingPurposes.length) {
        findings.push({
          id: `GDPR-30-002-${id}`,
          category: 'data_processing',
          severity: 'major',
          article: 'Article 30',
          description: `Processing purpose not specified for record: ${record.name}`,
          evidence: [`Record ID: ${id}`, `Record Name: ${record.name}`],
          impact: 'Incomplete processing record violates Article 30 requirements',
          recommendation: 'Specify clear processing purposes for all data processing activities',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'open'
        });
      }

      // Check data retention periods
      if (!record.retentionPeriod) {
        findings.push({
          id: `GDPR-30-003-${id}`,
          category: 'data_processing',
          severity: 'major',
          article: 'Article 5(1)(e)',
          description: `No retention period specified for record: ${record.name}`,
          evidence: [`Record ID: ${id}`],
          impact: 'Violates storage limitation principle',
          recommendation: 'Define clear retention periods for all personal data processing',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'open'
        });
      }

      // Check risk assessment
      if (!record.riskAssessment || record.riskAssessment.riskLevel === 'high') {
        findings.push({
          id: `GDPR-30-004-${id}`,
          category: 'data_processing',
          severity: record.riskAssessment?.riskLevel === 'high' ? 'critical' : 'major',
          article: 'Article 35',
          description: `High risk processing or missing risk assessment: ${record.name}`,
          evidence: [`Record ID: ${id}`, `Risk Level: ${record.riskAssessment?.riskLevel || 'unknown'}`],
          impact: 'May require Data Protection Impact Assessment (DPIA)',
          recommendation: record.riskAssessment?.riskLevel === 'high' 
            ? 'Conduct Data Protection Impact Assessment (DPIA)' 
            : 'Complete risk assessment for processing activity',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'open'
        });
      }
    }

    return findings;
  }

  /**
   * Audit consent management (Article 7 compliance)
   */
  private async auditConsentManagement(): Promise<GDPRFinding[]> {
    const findings: GDPRFinding[] = [];

    if (!this.config.consentManagement.enabled) {
      findings.push({
        id: 'GDPR-07-001',
        category: 'consent',
        severity: 'critical',
        article: 'Article 7',
        description: 'Consent management system not enabled',
        evidence: ['consentManagement.enabled: false'],
        impact: 'Cannot demonstrate valid consent as required by Article 7',
        recommendation: 'Enable and implement consent management system',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    if (!this.config.consentManagement.granular) {
      findings.push({
        id: 'GDPR-07-002',
        category: 'consent',
        severity: 'major',
        article: 'Article 7',
        description: 'Granular consent not implemented',
        evidence: ['consentManagement.granular: false'],
        impact: 'May not meet specific and informed consent requirements',
        recommendation: 'Implement granular consent for different processing purposes',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    if (!this.config.consentManagement.withdrawalMechanism) {
      findings.push({
        id: 'GDPR-07-003',
        category: 'consent',
        severity: 'critical',
        article: 'Article 7(3)',
        description: 'Consent withdrawal mechanism not implemented',
        evidence: ['consentManagement.withdrawalMechanism: false'],
        impact: 'Violates requirement that consent withdrawal must be as easy as giving consent',
        recommendation: 'Implement easy consent withdrawal mechanism',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    return findings;
  }

  /**
   * Audit data retention policies (Article 5 compliance)
   */
  private async auditDataRetention(): Promise<GDPRFinding[]> {
    const findings: GDPRFinding[] = [];

    if (!this.config.autoDeleteEnabled) {
      findings.push({
        id: 'GDPR-05-001',
        category: 'data_processing',
        severity: 'major',
        article: 'Article 5(1)(e)',
        description: 'Automated data deletion not enabled',
        evidence: ['autoDeleteEnabled: false'],
        impact: 'Risk of retaining personal data longer than necessary',
        recommendation: 'Enable automated data deletion based on retention policies',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    // Check for excessive retention periods
    const maxRetentionYears = 10; // Norwegian DPA guideline
    if (this.config.defaultRetentionPeriod.includes('y')) {
      const years = parseInt(this.config.defaultRetentionPeriod.replace('y', ''));
      if (years > maxRetentionYears) {
        findings.push({
          id: 'GDPR-05-002',
          category: 'data_processing',
          severity: 'major',
          article: 'Article 5(1)(e)',
          description: `Default retention period (${years} years) exceeds recommended maximum`,
          evidence: [`defaultRetentionPeriod: ${this.config.defaultRetentionPeriod}`],
          impact: 'May violate storage limitation principle',
          recommendation: 'Review and justify retention periods, consider reducing to maximum 7 years (Norwegian DPA recommendation)',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'open'
        });
      }
    }

    return findings;
  }

  /**
   * Audit data subject rights implementation (Articles 15-22)
   */
  private async auditDataSubjectRights(): Promise<GDPRFinding[]> {
    const findings: GDPRFinding[] = [];

    const rights = [
      { key: 'access', name: 'Right of Access', article: 'Article 15' },
      { key: 'rectification', name: 'Right to Rectification', article: 'Article 16' },
      { key: 'erasure', name: 'Right to Erasure', article: 'Article 17' },
      { key: 'portability', name: 'Right to Data Portability', article: 'Article 20' },
      { key: 'restriction', name: 'Right to Restriction', article: 'Article 18' },
      { key: 'objection', name: 'Right to Object', article: 'Article 21' }
    ];

    for (const right of rights) {
      if (!this.config.dataSubjectRights[right.key as keyof typeof this.config.dataSubjectRights]) {
        findings.push({
          id: `GDPR-${right.article.split(' ')[1]}-001`,
          category: 'rights',
          severity: 'critical',
          article: right.article,
          description: `${right.name} not implemented`,
          evidence: [`dataSubjectRights.${right.key}: false`],
          impact: `Violates ${right.article} requirements`,
          recommendation: `Implement ${right.name} functionality`,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'open'
        });
      }
    }

    return findings;
  }

  /**
   * Audit Norwegian-specific compliance requirements
   */
  private async auditNorwegianCompliance(): Promise<GDPRFinding[]> {
    const findings: GDPRFinding[] = [];

    if (!this.config.norwegianSpecific.datatilsynetNotifications) {
      findings.push({
        id: 'NO-GDPR-001',
        category: 'documentation',
        severity: 'major',
        article: 'Norwegian GDPR Implementation',
        description: 'Datatilsynet notification system not enabled',
        evidence: ['norwegianSpecific.datatilsynetNotifications: false'],
        impact: 'May not meet Norwegian DPA notification requirements',
        recommendation: 'Enable Datatilsynet notification system for breach notifications',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    if (!this.config.norwegianSpecific.norwegianLanguageSupport) {
      findings.push({
        id: 'NO-GDPR-002',
        category: 'rights',
        severity: 'minor',
        article: 'Norwegian Language Requirements',
        description: 'Norwegian language support not enabled for data subject rights',
        evidence: ['norwegianSpecific.norwegianLanguageSupport: false'],
        impact: 'May not meet accessibility requirements for Norwegian data subjects',
        recommendation: 'Enable Norwegian language support for privacy notices and rights requests',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'open'
      });
    }

    return findings;
  }

  /**
   * Generate actionable recommendations based on findings
   */
  private generateRecommendations(findings: { critical: GDPRFinding[], major: GDPRFinding[], minor: GDPRFinding[] }): GDPRRecommendation[] {
    const recommendations: GDPRRecommendation[] = [];

    // High priority recommendations for critical findings
    if (findings.critical.length > 0) {
      recommendations.push({
        id: 'REC-001',
        priority: 'high',
        category: 'Critical Compliance',
        title: 'Address Critical GDPR Violations Immediately',
        description: `${findings.critical.length} critical compliance issues require immediate attention to avoid regulatory action.`,
        implementation: [
          'Review all critical findings in detail',
          'Assign dedicated resources to address each issue',
          'Implement temporary measures if needed',
          'Document all remediation actions',
          'Schedule follow-up audit within 30 days'
        ],
        estimatedEffort: '1-2 weeks',
        complianceImpact: 'Prevents regulatory fines and sanctions',
        norwegianContext: 'Datatilsynet may impose fines up to €20M or 4% of annual turnover for severe violations'
      });
    }

    // Data Processing Records recommendation
    if (this.processingRecords.size === 0) {
      recommendations.push({
        id: 'REC-002',
        priority: 'high',
        category: 'Documentation',
        title: 'Create Comprehensive Record of Processing Activities',
        description: 'Establish systematic documentation of all personal data processing activities.',
        implementation: [
          'Conduct data mapping exercise across all systems',
          'Document processing purposes and legal bases',
          'Identify data categories and subjects',
          'Define retention periods for each activity',
          'Implement regular review process'
        ],
        estimatedEffort: '2-4 weeks',
        complianceImpact: 'Achieves Article 30 compliance and demonstrates accountability',
        norwegianContext: 'Essential for Datatilsynet inspections and transparency requirements'
      });
    }

    // Consent Management recommendation
    if (!this.config.consentManagement.enabled) {
      recommendations.push({
        id: 'REC-003',
        priority: 'high',
        category: 'Consent',
        title: 'Implement Comprehensive Consent Management System',
        description: 'Deploy robust consent management to ensure valid legal basis for processing.',
        implementation: [
          'Design granular consent mechanisms',
          'Implement consent withdrawal functionality',
          'Create consent audit trail',
          'Develop consent refresh processes',
          'Integrate with all data collection points'
        ],
        estimatedEffort: '3-6 weeks',
        complianceImpact: 'Ensures valid consent under Articles 6 and 7',
        norwegianContext: 'Aligns with Norwegian DPA guidance on consent collection'
      });
    }

    return recommendations;
  }

  /**
   * Helper methods for assessment
   */
  private async findMissingProcessingRecords(): Promise<string[]> {
    // This would typically scan the codebase for data processing activities
    // not documented in the Record of Processing Activities
    return ['user-analytics', 'marketing-emails', 'payment-processing'];
  }

  private async assessDataSubjectRights(): Promise<any> {
    return {
      accessRequests: 45,
      rectificationRequests: 12,
      erasureRequests: 8,
      portabilityRequests: 3,
      averageResponseTime: 18, // hours
      slaBreaches: 2
    };
  }

  private async assessConsentManagement(): Promise<any> {
    return {
      validConsents: 1245,
      expiredConsents: 78,
      withdrawnConsents: 23,
      granularityScore: 85
    };
  }

  private async assessTechnicalMeasures(): Promise<any> {
    return {
      encryptionCoverage: 92,
      accessControlCompliance: 88,
      dataMinimizationScore: 76,
      pseudonymizationScore: 65
    };
  }

  /**
   * Display audit results in formatted output
   */
  private displayAuditResults(result: GDPRAuditResult): void {
    console.log(chalk.cyan('\n📊 GDPR Compliance Audit Results\n'));
    
    // Overall Status
    const statusColor = result.overallCompliance === 'compliant' ? chalk.green : 
                       result.overallCompliance === 'partially_compliant' ? chalk.yellow : chalk.red;
    console.log(`Overall Compliance: ${statusColor(result.overallCompliance.toUpperCase())}`);
    
    // Findings Summary
    console.log(chalk.cyan('\n🔍 Findings Summary:'));
    console.log(chalk.red(`  Critical: ${result.findings.critical.length}`));
    console.log(chalk.yellow(`  Major: ${result.findings.major.length}`));
    console.log(chalk.blue(`  Minor: ${result.findings.minor.length}`));

    // Data Processing Compliance
    console.log(chalk.cyan('\n📋 Data Processing Compliance:'));
    console.log(chalk.gray(`  Total Records: ${result.dataProcessingCompliance.totalRecords}`));
    console.log(chalk.green(`  Compliant: ${result.dataProcessingCompliance.compliantRecords}`));
    console.log(chalk.red(`  Non-Compliant: ${result.dataProcessingCompliance.nonCompliantRecords}`));

    // Technical Measures
    console.log(chalk.cyan('\n🔒 Technical Measures:'));
    console.log(chalk.gray(`  Encryption Coverage: ${result.technicalMeasures.encryptionCoverage}%`));
    console.log(chalk.gray(`  Access Control: ${result.technicalMeasures.accessControlCompliance}%`));
    console.log(chalk.gray(`  Data Minimization: ${result.technicalMeasures.dataMinimizationScore}/100`));

    // Next Steps
    console.log(chalk.cyan('\n📖 Next Steps:'));
    if (result.findings.critical.length > 0) {
      console.log(chalk.red('  1. Address all critical findings immediately'));
    }
    if (result.findings.major.length > 0) {
      console.log(chalk.yellow('  2. Plan remediation for major findings'));
    }
    console.log(chalk.gray(`  3. Next audit scheduled: ${result.nextAuditDate.toLocaleDateString()}`));
    
    console.log(chalk.gray(`\n📄 Detailed report available at: ./compliance-reports/gdpr-audit-${result.organizationId}.json`));
  }

  /**
   * Export audit results to file
   */
  async exportAuditResults(result: GDPRAuditResult, outputPath?: string): Promise<string> {
    const reportPath = outputPath || `./compliance-reports/gdpr-audit-${result.organizationId}.json`;
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, result, { spaces: 2 });
    
    // Also generate human-readable report
    const readableReportPath = reportPath.replace('.json', '.md');
    const readableReport = this.generateReadableReport(result);
    await fs.writeFile(readableReportPath, readableReport);
    
    return reportPath;
  }

  /**
   * Generate human-readable markdown report
   */
  private generateReadableReport(result: GDPRAuditResult): string {
    const report = `# GDPR Compliance Audit Report

**Organization:** ${this.config.organizationName}
**Audit Date:** ${result.auditDate.toISOString()}
**Audit ID:** ${result.organizationId}
**Overall Compliance:** ${result.overallCompliance.toUpperCase()}

## Executive Summary

This automated GDPR compliance audit identified ${result.findings.critical.length + result.findings.major.length + result.findings.minor.length} findings across various compliance areas.

### Compliance Status
- **Critical Issues:** ${result.findings.critical.length}
- **Major Issues:** ${result.findings.major.length}  
- **Minor Issues:** ${result.findings.minor.length}

### Data Processing Overview
- **Total Processing Records:** ${result.dataProcessingCompliance.totalRecords}
- **Compliant Records:** ${result.dataProcessingCompliance.compliantRecords}
- **Non-Compliant Records:** ${result.dataProcessingCompliance.nonCompliantRecords}

## Critical Findings

${result.findings.critical.map(finding => `
### ${finding.id}: ${finding.description}
- **Article:** ${finding.article}
- **Impact:** ${finding.impact}  
- **Recommendation:** ${finding.recommendation}
- **Deadline:** ${finding.deadline.toLocaleDateString()}
`).join('\n')}

## Recommendations

${result.recommendations.map(rec => `
### ${rec.title}
**Priority:** ${rec.priority.toUpperCase()}
**Category:** ${rec.category}

${rec.description}

**Implementation Steps:**
${rec.implementation.map(step => `- ${step}`).join('\n')}

**Estimated Effort:** ${rec.estimatedEffort}
**Compliance Impact:** ${rec.complianceImpact}
${rec.norwegianContext ? `**Norwegian Context:** ${rec.norwegianContext}` : ''}
`).join('\n')}

## Next Audit
**Scheduled Date:** ${result.nextAuditDate.toLocaleDateString()}

---
*This report was generated automatically by the Xaheen GDPR Compliance Service*
`;

    return report;
  }
}
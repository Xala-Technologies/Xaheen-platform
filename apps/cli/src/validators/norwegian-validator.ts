import { z } from 'zod';
import { GDPRValidator, type GDPRResult } from './gdpr-validator.js';
import { NSMValidator, NSMClassification, type NSMResult } from './nsm-validator.js';
import { AccessibilityValidator, WCAGLevel, type WCAGResult } from './accessibility-validator.js';
import type { GenerationResult } from '../types.js';

/**
 * Norwegian Compliance Validator
 * 
 * Comprehensive compliance validation combining GDPR, NSM security,
 * and WCAG accessibility standards for Norwegian government and
 * enterprise applications
 */

// Norwegian compliance frameworks
export enum ComplianceFramework {
  GDPR = 'gdpr',                    // General Data Protection Regulation
  NSM = 'nsm',                      // Nasjonal sikkerhetsmyndighet
  WCAG = 'wcag',                    // Web Content Accessibility Guidelines
  DIFI = 'difi',                    // Agency for Public Management and eGovernment
  PERSONVERN = 'personvern',        // Norwegian Privacy Act
  SIKKERHETSLOVEN = 'sikkerhetsloven', // Norwegian Security Act
  FORVALTNINGSLOVEN = 'forvaltningsloven' // Norwegian Public Administration Act
}

// Compliance levels for Norwegian standards
export enum NorwegianComplianceLevel {
  BASIC = 'basic',           // Minimum legal requirements
  ENHANCED = 'enhanced',     // Recommended best practices
  GOVERNMENT = 'government', // Government sector requirements
  CRITICAL = 'critical'     // Critical infrastructure requirements
}

// Norwegian compliance result schema
const norwegianResultSchema = z.object({
  overallCompliant: z.boolean(),
  complianceLevel: z.nativeEnum(NorwegianComplianceLevel),
  overallScore: z.number().min(0).max(100),
  frameworks: z.record(z.nativeEnum(ComplianceFramework), z.object({
    compliant: z.boolean(),
    score: z.number(),
    criticalIssues: z.number(),
    warnings: z.number(),
    recommendations: z.array(z.string())
  })),
  gdprResult: z.any(), // GDPRResult
  nsmResult: z.any(),  // NSMResult
  wcagResult: z.any(), // WCAGResult
  norwegianSpecific: z.object({
    personalDataHandling: z.object({
      compliant: z.boolean(),
      issues: z.array(z.string())
    }),
    governmentIntegration: z.object({
      bankidCompliance: z.boolean(),
      altinnIntegration: z.boolean(),
      digipostIntegration: z.boolean(),
      idPortenCompliance: z.boolean()
    }),
    dataLocalization: z.object({
      compliant: z.boolean(),
      dataInNorway: z.boolean(),
      eudataCompliance: z.boolean(),
      issues: z.array(z.string())
    }),
    languageCompliance: z.object({
      norwegianSupport: z.boolean(),
      bokmaalSupport: z.boolean(),
      nynorskSupport: z.boolean(),
      multilingualCompliance: z.boolean()
    })
  }),
  certificationReadiness: z.object({
    iso27001: z.boolean(),
    nsmSikkerhetsgodkjent: z.boolean(),
    wcagCertification: z.boolean(),
    gdprCompliance: z.boolean()
  }),
  remediation: z.object({
    priority: z.array(z.string()),
    immediate: z.array(z.string()),
    recommended: z.array(z.string()),
    longTerm: z.array(z.string())
  }),
  timeline: z.object({
    estimatedDays: z.number(),
    phases: z.array(z.object({
      name: z.string(),
      duration: z.number(),
      dependencies: z.array(z.string())
    }))
  })
});

export type NorwegianResult = z.infer<typeof norwegianResultSchema>;

/**
 * Norwegian Compliance Validator
 */
export class NorwegianValidator {
  private gdprValidator = new GDPRValidator();
  private nsmValidator = new NSMValidator();
  private accessibilityValidator = new AccessibilityValidator();

  /**
   * Validate comprehensive Norwegian compliance
   */
  async validateNorwegianCompliance(
    code: string,
    filePath: string = 'unknown',
    targetLevel: NorwegianComplianceLevel = NorwegianComplianceLevel.ENHANCED
  ): Promise<NorwegianResult> {
    // Run individual validations
    const gdprResult = await this.gdprValidator.validateGDPRCompliance(code, filePath);
    const nsmResult = await this.nsmValidator.validateNSMCompliance(
      code,
      filePath,
      this.mapToNSMClassification(targetLevel)
    );
    const wcagResult = await this.accessibilityValidator.validateWCAGCompliance(
      code,
      filePath,
      this.mapToWCAGLevel(targetLevel)
    );

    // Analyze Norwegian-specific requirements
    const norwegianSpecific = this.analyzeNorwegianSpecific(code, targetLevel);

    // Calculate framework scores
    const frameworks = this.calculateFrameworkScores(gdprResult, nsmResult, wcagResult, norwegianSpecific);

    // Calculate overall score and compliance
    const overallScore = this.calculateOverallScore(frameworks);
    const overallCompliant = this.determineOverallCompliance(frameworks, targetLevel);

    // Check certification readiness
    const certificationReadiness = this.checkCertificationReadiness(
      gdprResult,
      nsmResult,
      wcagResult,
      norwegianSpecific,
      targetLevel
    );

    // Generate remediation plan
    const remediation = this.generateRemediationPlan(
      gdprResult,
      nsmResult,
      wcagResult,
      norwegianSpecific,
      targetLevel
    );

    // Estimate timeline
    const timeline = this.estimateComplianceTimeline(remediation);

    return {
      overallCompliant,
      complianceLevel: targetLevel,
      overallScore,
      frameworks,
      gdprResult,
      nsmResult,
      wcagResult,
      norwegianSpecific,
      certificationReadiness,
      remediation,
      timeline
    };
  }

  /**
   * Analyze Norwegian-specific compliance requirements
   */
  private analyzeNorwegianSpecific(
    code: string,
    targetLevel: NorwegianComplianceLevel
  ): NorwegianResult['norwegianSpecific'] {
    // Personal data handling analysis
    const personalDataHandling = this.analyzePersonalDataHandling(code);

    // Government integration analysis
    const governmentIntegration = this.analyzeGovernmentIntegration(code);

    // Data localization analysis
    const dataLocalization = this.analyzeDataLocalization(code, targetLevel);

    // Language compliance analysis
    const languageCompliance = this.analyzeLanguageCompliance(code);

    return {
      personalDataHandling,
      governmentIntegration,
      dataLocalization,
      languageCompliance
    };
  }

  /**
   * Analyze personal data handling for Norwegian requirements
   */
  private analyzePersonalDataHandling(code: string): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for Norwegian personal number handling
    if (/\b\d{6}\s?\d{5}\b/.test(code)) {
      if (!/encrypt|hash|pseudonym/i.test(code)) {
        issues.push('Norwegian personal numbers must be encrypted or pseudonymized');
      }
      if (!/BankID|ID-porten/i.test(code)) {
        issues.push('Consider using BankID instead of storing personal numbers');
      }
    }

    // Check for D-number handling
    if (/\b[4-7]\d{5}\s?\d{5}\b/.test(code)) {
      issues.push('D-numbers require special handling according to Skatteetaten guidelines');
    }

    // Check for organization number validation
    if (/\b\d{9}\b/.test(code) && !/modulus.*11|mod.*11/i.test(code)) {
      issues.push('Norwegian organization numbers should use modulus-11 validation');
    }

    // Check for GDPR-compliant consent
    if (/consent|samtykke/i.test(code)) {
      if (!/withdraw|tilbaketrekk/i.test(code)) {
        issues.push('Consent mechanisms must allow easy withdrawal');
      }
      if (!/granular|spesifikk/i.test(code)) {
        issues.push('Consent should be granular for different processing purposes');
      }
    }

    // Check for data subject rights implementation
    const requiredRights = ['access', 'rectification', 'erasure', 'portability'];
    const missingRights = requiredRights.filter(right => 
      !new RegExp(right, 'i').test(code)
    );
    
    if (missingRights.length > 0) {
      issues.push(`Missing GDPR rights implementation: ${missingRights.join(', ')}`);
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  /**
   * Analyze government integration compliance
   */
  private analyzeGovernmentIntegration(code: string): {
    bankidCompliance: boolean;
    altinnIntegration: boolean;
    digipostIntegration: boolean;
    idPortenCompliance: boolean;
  } {
    return {
      bankidCompliance: /BankID|bankid/i.test(code) && /OIDC|OAuth/i.test(code),
      altinnIntegration: /Altinn|altinn/i.test(code) && /maskinporten|idporten/i.test(code),
      digipostIntegration: /Digipost|digipost/i.test(code),
      idPortenCompliance: /ID-porten|idporten/i.test(code) && /SAML|OIDC/i.test(code)
    };
  }

  /**
   * Analyze data localization requirements
   */
  private analyzeDataLocalization(
    code: string,
    targetLevel: NorwegianComplianceLevel
  ): {
    compliant: boolean;
    dataInNorway: boolean;
    eudataCompliance: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for cloud provider compliance
    const foreignCloudProviders = [
      { name: 'AWS', pattern: /amazonaws\.com|aws\.|s3\.|ec2\.|lambda\./ },
      { name: 'Azure', pattern: /azure\.com|microsoft\.com|azurewebsites/ },
      { name: 'GCP', pattern: /googleapis\.com|gcp\.|googlecloud/ }
    ];

    let dataInNorway = true;
    let eudataCompliance = true;

    foreignCloudProviders.forEach(provider => {
      if (provider.pattern.test(code)) {
        if (!/(norway|norge|oslo|europe|eu-)/i.test(code)) {
          dataInNorway = false;
          if (targetLevel >= NorwegianComplianceLevel.GOVERNMENT) {
            issues.push(`${provider.name} usage requires Norwegian/EU data centers for government data`);
          }
        }
        
        if (!/(europe|eu-|gdpr)/i.test(code)) {
          eudataCompliance = false;
          issues.push(`${provider.name} usage must comply with EU data residency requirements`);
        }
      }
    });

    // Check for data transfer mechanisms
    if (/transfer.*data|data.*export|international.*transfer/i.test(code)) {
      if (!/adequacy.*decision|scc|standard.*contractual.*clauses/i.test(code)) {
        issues.push('International data transfers require adequate protection mechanisms');
      }
    }

    // Government level requirements
    if (targetLevel >= NorwegianComplianceLevel.GOVERNMENT) {
      if (!dataInNorway) {
        issues.push('Government systems should prefer Norwegian data centers');
      }
      if (!/nsm.*approved|sikkerhetsgodkjent/i.test(code)) {
        issues.push('Government systems should use NSM-approved solutions');
      }
    }

    return {
      compliant: issues.length === 0,
      dataInNorway,
      eudataCompliance,
      issues
    };
  }

  /**
   * Analyze language compliance
   */
  private analyzeLanguageCompliance(code: string): {
    norwegianSupport: boolean;
    bokmaalSupport: boolean;
    nynorskSupport: boolean;
    multilingualCompliance: boolean;
  } {
    const norwegianSupport = /norwegian|norsk|nb|nn/i.test(code);
    const bokmaalSupport = /bokmål|bokmaal|nb/i.test(code);
    const nynorskSupport = /nynorsk|nn/i.test(code);
    
    // Check for proper internationalization
    const multilingualCompliance = norwegianSupport && 
      (/i18n|internationalization|locale|translation/i.test(code) ||
       /lang.*=.*["']nb|lang.*=.*["']nn/i.test(code));

    return {
      norwegianSupport,
      bokmaalSupport,
      nynorskSupport,
      multilingualCompliance
    };
  }

  /**
   * Calculate framework-specific scores
   */
  private calculateFrameworkScores(
    gdprResult: GDPRResult,
    nsmResult: NSMResult,
    wcagResult: WCAGResult,
    norwegianSpecific: NorwegianResult['norwegianSpecific']
  ): NorwegianResult['frameworks'] {
    return {
      [ComplianceFramework.GDPR]: {
        compliant: gdprResult.compliant,
        score: gdprResult.score,
        criticalIssues: gdprResult.issues.filter(i => i.severity === 'error').length,
        warnings: gdprResult.issues.filter(i => i.severity === 'warning').length,
        recommendations: gdprResult.recommendations
      },
      [ComplianceFramework.NSM]: {
        compliant: nsmResult.compliant,
        score: nsmResult.score,
        criticalIssues: nsmResult.vulnerabilities.filter(v => v.severity === 'critical').length,
        warnings: nsmResult.vulnerabilities.filter(v => v.severity === 'medium').length,
        recommendations: nsmResult.recommendations
      },
      [ComplianceFramework.WCAG]: {
        compliant: wcagResult.compliant,
        score: wcagResult.score,
        criticalIssues: Object.values(wcagResult.principles)
          .reduce((sum, p) => sum + p.issues.filter(i => i.severity === 'error').length, 0),
        warnings: Object.values(wcagResult.principles)
          .reduce((sum, p) => sum + p.issues.filter(i => i.severity === 'warning').length, 0),
        recommendations: wcagResult.recommendations
      },
      [ComplianceFramework.PERSONVERN]: {
        compliant: norwegianSpecific.personalDataHandling.compliant,
        score: norwegianSpecific.personalDataHandling.compliant ? 100 : 60,
        criticalIssues: norwegianSpecific.personalDataHandling.issues.length,
        warnings: 0,
        recommendations: norwegianSpecific.personalDataHandling.issues
      },
      [ComplianceFramework.DIFI]: {
        compliant: norwegianSpecific.languageCompliance.multilingualCompliance &&
                  wcagResult.compliant,
        score: (norwegianSpecific.languageCompliance.norwegianSupport ? 50 : 0) +
               (wcagResult.score * 0.5),
        criticalIssues: norwegianSpecific.languageCompliance.norwegianSupport ? 0 : 1,
        warnings: 0,
        recommendations: [
          'Ensure Norwegian language support (Bokmål and Nynorsk)',
          'Follow DigDir design guidelines',
          'Implement WCAG 2.1 AA minimum'
        ]
      },
      [ComplianceFramework.SIKKERHETSLOVEN]: {
        compliant: nsmResult.compliant && norwegianSpecific.dataLocalization.compliant,
        score: Math.min(nsmResult.score, norwegianSpecific.dataLocalization.compliant ? 100 : 70),
        criticalIssues: nsmResult.vulnerabilities.filter(v => v.severity === 'critical').length +
                       (norwegianSpecific.dataLocalization.compliant ? 0 : 1),
        warnings: norwegianSpecific.dataLocalization.issues.length,
        recommendations: [
          ...nsmResult.recommendations,
          ...norwegianSpecific.dataLocalization.issues
        ]
      },
      [ComplianceFramework.FORVALTNINGSLOVEN]: {
        compliant: Object.values(norwegianSpecific.governmentIntegration).some(v => v),
        score: Object.values(norwegianSpecific.governmentIntegration).filter(v => v).length * 25,
        criticalIssues: 0,
        warnings: Object.values(norwegianSpecific.governmentIntegration).filter(v => !v).length,
        recommendations: [
          'Integrate with ID-porten for authentication',
          'Consider Altinn integration for government services',
          'Support BankID for strong authentication'
        ]
      }
    };
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(frameworks: NorwegianResult['frameworks']): number {
    const weights = {
      [ComplianceFramework.GDPR]: 0.25,
      [ComplianceFramework.NSM]: 0.25,
      [ComplianceFramework.WCAG]: 0.20,
      [ComplianceFramework.PERSONVERN]: 0.15,
      [ComplianceFramework.DIFI]: 0.10,
      [ComplianceFramework.SIKKERHETSLOVEN]: 0.03,
      [ComplianceFramework.FORVALTNINGSLOVEN]: 0.02
    };

    const weightedScore = Object.entries(frameworks).reduce((total, [framework, data]) => {
      const weight = weights[framework as ComplianceFramework] || 0;
      return total + (data.score * weight);
    }, 0);

    return Math.round(weightedScore);
  }

  /**
   * Determine overall compliance
   */
  private determineOverallCompliance(
    frameworks: NorwegianResult['frameworks'],
    targetLevel: NorwegianComplianceLevel
  ): boolean {
    const requiredFrameworks = this.getRequiredFrameworks(targetLevel);
    
    return requiredFrameworks.every(framework => {
      const frameworkData = frameworks[framework];
      return frameworkData.compliant && frameworkData.criticalIssues === 0;
    });
  }

  /**
   * Get required frameworks for compliance level
   */
  private getRequiredFrameworks(level: NorwegianComplianceLevel): ComplianceFramework[] {
    switch (level) {
      case NorwegianComplianceLevel.BASIC:
        return [ComplianceFramework.GDPR, ComplianceFramework.WCAG];
      
      case NorwegianComplianceLevel.ENHANCED:
        return [
          ComplianceFramework.GDPR,
          ComplianceFramework.NSM,
          ComplianceFramework.WCAG,
          ComplianceFramework.PERSONVERN
        ];
      
      case NorwegianComplianceLevel.GOVERNMENT:
        return [
          ComplianceFramework.GDPR,
          ComplianceFramework.NSM,
          ComplianceFramework.WCAG,
          ComplianceFramework.PERSONVERN,
          ComplianceFramework.DIFI,
          ComplianceFramework.FORVALTNINGSLOVEN
        ];
      
      case NorwegianComplianceLevel.CRITICAL:
        return Object.values(ComplianceFramework);
      
      default:
        return [ComplianceFramework.GDPR, ComplianceFramework.WCAG];
    }
  }

  /**
   * Check certification readiness
   */
  private checkCertificationReadiness(
    gdprResult: GDPRResult,
    nsmResult: NSMResult,
    wcagResult: WCAGResult,
    norwegianSpecific: NorwegianResult['norwegianSpecific'],
    targetLevel: NorwegianComplianceLevel
  ): NorwegianResult['certificationReadiness'] {
    return {
      iso27001: nsmResult.score >= 90 && nsmResult.vulnerabilities.length === 0,
      nsmSikkerhetsgodkjent: nsmResult.certificationReady &&
                            norwegianSpecific.dataLocalization.dataInNorway,
      wcagCertification: wcagResult.compliant && wcagResult.score >= 95,
      gdprCompliance: gdprResult.compliant && gdprResult.score >= 85 &&
                     norwegianSpecific.personalDataHandling.compliant
    };
  }

  /**
   * Generate comprehensive remediation plan
   */
  private generateRemediationPlan(
    gdprResult: GDPRResult,
    nsmResult: NSMResult,
    wcagResult: WCAGResult,
    norwegianSpecific: NorwegianResult['norwegianSpecific'],
    targetLevel: NorwegianComplianceLevel
  ): NorwegianResult['remediation'] {
    const priority: string[] = [];
    const immediate: string[] = [];
    const recommended: string[] = [];
    const longTerm: string[] = [];

    // GDPR critical issues
    gdprResult.issues.filter(i => i.severity === 'error').forEach(issue => {
      priority.push(`GDPR: ${issue.message}`);
    });

    // NSM critical vulnerabilities
    nsmResult.vulnerabilities.filter(v => v.severity === 'critical').forEach(vuln => {
      priority.push(`Security: ${vuln.description}`);
    });

    // WCAG critical accessibility issues
    Object.values(wcagResult.principles).forEach(principle => {
      principle.issues.filter(i => i.severity === 'error').forEach(issue => {
        immediate.push(`Accessibility: ${issue.message}`);
      });
    });

    // Norwegian-specific issues
    norwegianSpecific.personalDataHandling.issues.forEach(issue => {
      immediate.push(`Norwegian compliance: ${issue}`);
    });

    // Data localization issues
    norwegianSpecific.dataLocalization.issues.forEach(issue => {
      if (targetLevel >= NorwegianComplianceLevel.GOVERNMENT) {
        priority.push(`Data localization: ${issue}`);
      } else {
        recommended.push(`Data localization: ${issue}`);
      }
    });

    // Government integration recommendations
    if (!norwegianSpecific.governmentIntegration.bankidCompliance) {
      recommended.push('Implement BankID authentication integration');
    }
    if (!norwegianSpecific.governmentIntegration.idPortenCompliance) {
      recommended.push('Integrate with ID-porten for government authentication');
    }

    // Language support
    if (!norwegianSpecific.languageCompliance.multilingualCompliance) {
      recommended.push('Implement proper Norwegian language support');
    }

    // Long-term improvements
    longTerm.push('Regular compliance audits and monitoring');
    longTerm.push('Staff training on Norwegian privacy and security requirements');
    longTerm.push('Continuous security monitoring and threat detection');
    longTerm.push('Regular accessibility audits with disabled users');

    return {
      priority,
      immediate,
      recommended,
      longTerm
    };
  }

  /**
   * Estimate compliance timeline
   */
  private estimateComplianceTimeline(
    remediation: NorwegianResult['remediation']
  ): NorwegianResult['timeline'] {
    const phases = [
      {
        name: 'Critical Issues',
        duration: Math.max(5, remediation.priority.length * 2),
        dependencies: []
      },
      {
        name: 'Immediate Fixes',
        duration: Math.max(3, remediation.immediate.length * 1),
        dependencies: ['Critical Issues']
      },
      {
        name: 'Recommended Improvements',
        duration: Math.max(10, remediation.recommended.length * 2),
        dependencies: ['Immediate Fixes']
      },
      {
        name: 'Long-term Implementation',
        duration: Math.max(30, remediation.longTerm.length * 7),
        dependencies: ['Recommended Improvements']
      }
    ];

    const estimatedDays = phases.reduce((total, phase) => total + phase.duration, 0);

    return {
      estimatedDays,
      phases
    };
  }

  /**
   * Helper methods for mapping between compliance levels
   */
  private mapToNSMClassification(level: NorwegianComplianceLevel): NSMClassification {
    switch (level) {
      case NorwegianComplianceLevel.BASIC:
        return NSMClassification.UGRADERT;
      case NorwegianComplianceLevel.ENHANCED:
        return NSMClassification.BEGRENSET;
      case NorwegianComplianceLevel.GOVERNMENT:
        return NSMClassification.KONFIDENSIELT;
      case NorwegianComplianceLevel.CRITICAL:
        return NSMClassification.HEMMELIG;
      default:
        return NSMClassification.BEGRENSET;
    }
  }

  private mapToWCAGLevel(level: NorwegianComplianceLevel): WCAGLevel {
    switch (level) {
      case NorwegianComplianceLevel.BASIC:
        return WCAGLevel.AA;
      case NorwegianComplianceLevel.ENHANCED:
      case NorwegianComplianceLevel.GOVERNMENT:
      case NorwegianComplianceLevel.CRITICAL:
        return WCAGLevel.AAA;
      default:
        return WCAGLevel.AA;
    }
  }
}

/**
 * Generate Norwegian compliance component
 */
export async function generateNorwegianComplianceComponent(
  options: z.infer<typeof norwegianComplianceOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate comprehensive compliance service
  const serviceContent = `
${options.typescript ? `
import type { 
  NorwegianComplianceLevel,
  ComplianceFramework,
  NorwegianResult,
  ComplianceDashboard
} from '../types/norwegian-compliance';
` : ''}
import { NorwegianValidator } from '../lib/norwegian-validator';

/**
 * Norwegian Compliance Service for ${options.projectName}
 * Comprehensive compliance management for Norwegian standards
 */
export class NorwegianComplianceService {
  private validator = new NorwegianValidator();
  private complianceHistory${options.typescript ? ': NorwegianResult[]' : ''} = [];

  /**
   * Run comprehensive compliance audit
   */
  async auditCompliance(
    targetLevel${options.typescript ? ': NorwegianComplianceLevel' : ''} = 'enhanced'
  )${options.typescript ? ': Promise<NorwegianResult>' : ''} {
    // In a real implementation, this would scan the entire codebase
    const mockCodebase = \`
      // Mock codebase for demonstration
      import { BankID } from '@bankid/react';
      import { encrypt } from 'crypto';
      
      const personalNumber = '12345678901'; // This would be flagged
      const handleAuth = () => BankID.authenticate();
    \`;
    
    const result = await this.validator.validateNorwegianCompliance(
      mockCodebase,
      'src/app.ts',
      targetLevel
    );
    
    this.complianceHistory.push(result);
    return result;
  }

  /**
   * Generate compliance dashboard
   */
  generateDashboard(
    result${options.typescript ? ': NorwegianResult' : ''}
  )${options.typescript ? ': ComplianceDashboard' : ''} {
    const frameworks = Object.entries(result.frameworks).map(([name, data]) => ({
      name,
      score: data.score,
      compliant: data.compliant,
      criticalIssues: data.criticalIssues,
      warnings: data.warnings
    }));

    return {
      overallScore: result.overallScore,
      compliant: result.overallCompliant,
      level: result.complianceLevel,
      frameworks,
      certificationStatus: {
        iso27001: result.certificationReadiness.iso27001,
        nsmApproved: result.certificationReadiness.nsmSikkerhetsgodkjent,
        wcagCertified: result.certificationReadiness.wcagCertification,
        gdprCompliant: result.certificationReadiness.gdprCompliance
      },
      nextActions: result.remediation.priority.slice(0, 5),
      timeline: result.timeline.estimatedDays
    };
  }

  /**
   * Generate Norwegian compliance report
   */
  generateComplianceReport(
    result${options.typescript ? ': NorwegianResult' : ''}
  )${options.typescript ? ': string' : ''} {
    return \`
# Norsk Etterlevelsesrapport - ${options.projectName}

## Sammendrag
- **Total poengsum**: \${result.overallScore}/100
- **Etterlevelse**: \${result.overallCompliant ? 'Godkjent' : 'Ikke godkjent'}
- **Nivå**: \${result.complianceLevel}
- **Dato**: \${new Date().toLocaleDateString('nb-NO')}

## Rammeverk Status

### GDPR (Personvernforordningen)
- Poengsum: \${result.frameworks.gdpr.score}/100
- Status: \${result.frameworks.gdpr.compliant ? '✅ Godkjent' : '❌ Ikke godkjent'}
- Kritiske problemer: \${result.frameworks.gdpr.criticalIssues}
- Advarsler: \${result.frameworks.gdpr.warnings}

### NSM Sikkerhet
- Poengsum: \${result.frameworks.nsm.score}/100
- Status: \${result.frameworks.nsm.compliant ? '✅ Godkjent' : '❌ Ikke godkjent'}
- Kritiske sårbarheter: \${result.frameworks.nsm.criticalIssues}

### WCAG Tilgjengelighet
- Poengsum: \${result.frameworks.wcag.score}/100
- Status: \${result.frameworks.wcag.compliant ? '✅ Godkjent' : '❌ Ikke godkjent'}
- Tilgjengelighetsfeil: \${result.frameworks.wcag.criticalIssues}

### Norske Spesifikasjoner

#### Personopplysninger
- Status: \${result.norwegianSpecific.personalDataHandling.compliant ? '✅' : '❌'}
- Problemer: \${result.norwegianSpecific.personalDataHandling.issues.length}

#### Offentlig Integrasjon
- BankID: \${result.norwegianSpecific.governmentIntegration.bankidCompliance ? '✅' : '❌'}
- ID-porten: \${result.norwegianSpecific.governmentIntegration.idPortenCompliance ? '✅' : '❌'}
- Altinn: \${result.norwegianSpecific.governmentIntegration.altinnIntegration ? '✅' : '❌'}

#### Datalokalisering
- Data i Norge: \${result.norwegianSpecific.dataLocalization.dataInNorway ? '✅' : '❌'}
- EU-etterlevelse: \${result.norwegianSpecific.dataLocalization.eudataCompliance ? '✅' : '❌'}

#### Språkstøtte
- Norsk støtte: \${result.norwegianSpecific.languageCompliance.norwegianSupport ? '✅' : '❌'}
- Bokmål: \${result.norwegianSpecific.languageCompliance.bokmaalSupport ? '✅' : '❌'}
- Flerspråklig: \${result.norwegianSpecific.languageCompliance.multilingualCompliance ? '✅' : '❌'}

## Sertifiseringsklarhet
- **ISO 27001**: \${result.certificationReadiness.iso27001 ? '✅ Klar' : '❌ Ikke klar'}
- **NSM Sikkerhetsgodkjent**: \${result.certificationReadiness.nsmSikkerhetsgodkjent ? '✅ Klar' : '❌ Ikke klar'}
- **WCAG Sertifisering**: \${result.certificationReadiness.wcagCertification ? '✅ Klar' : '❌ Ikke klar'}
- **GDPR Etterlevelse**: \${result.certificationReadiness.gdprCompliance ? '✅ Klar' : '❌ Ikke klar'}

## Handlingsplan

### Prioritet (kritiske problemer)
\${result.remediation.priority.map(item => \`- \${item}\`).join('\\n')}

### Umiddelbare tiltak
\${result.remediation.immediate.map(item => \`- \${item}\`).join('\\n')}

### Anbefalte forbedringer
\${result.remediation.recommended.map(item => \`- \${item}\`).join('\\n')}

## Tidsplan
- **Estimert tid**: \${result.timeline.estimatedDays} dager
- **Faser**: \${result.timeline.phases.length}

\${result.timeline.phases.map(phase => 
  \`### \${phase.name}\\n- Varighet: \${phase.duration} dager\\n- Avhengigheter: \${phase.dependencies.join(', ') || 'Ingen'}\`
).join('\\n\\n')}

## Konklusjon
\${result.overallCompliant 
  ? 'Systemet oppfyller de norske etterlevelseskravene for det valgte nivået.' 
  : 'Systemet krever forbedringer for å oppfylle norske etterlevelseskrav.'}

**Neste steg**: \${result.remediation.priority[0] || 'Fortsett med anbefalt vedlikehold'}

---
*Rapport generert av ${options.projectName} Norwegian Compliance Validator*
*\${new Date().toISOString()}*
    \`;
  }

  /**
   * Monitor compliance over time
   */
  async monitorCompliance()${options.typescript ? ': Promise<void>' : ''} {
    // Run weekly compliance checks
    setInterval(async () => {
      const result = await this.auditCompliance();
      
      // Alert on degradation
      if (this.complianceHistory.length > 1) {
        const previous = this.complianceHistory[this.complianceHistory.length - 2];
        const current = result;
        
        if (current.overallScore < previous.overallScore - 5) {
          console.warn('Compliance score degradation detected!');
          // TODO: Send alert to compliance team
        }
      }
    }, 7 * 24 * 60 * 60 * 1000); // Weekly
  }

  /**
   * Get compliance history
   */
  getComplianceHistory()${options.typescript ? ': NorwegianResult[]' : ''} {
    return this.complianceHistory;
  }
}

// Export singleton instance
export const norwegianComplianceService = new NorwegianComplianceService();`;

  files.set('services/norwegian-compliance-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'Norwegian compliance service created successfully'
  };
}

// Component options schema
const norwegianComplianceOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

// Export validator instance
export const norwegianValidator = new NorwegianValidator();
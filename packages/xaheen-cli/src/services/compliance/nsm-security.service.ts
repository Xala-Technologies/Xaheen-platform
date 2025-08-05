import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { createHash } from 'crypto';

/**
 * NSM Security Classification Service
 * Implements Norwegian National Security Authority (NSM) security requirements
 * and security classification validation for Norwegian government and enterprise systems
 */

// NSM Security Classification Levels
export const NSMClassificationSchema = z.enum([
  'OPEN', // Åpen - Public information
  'RESTRICTED', // Begrenset - Internal use only
  'CONFIDENTIAL', // Konfidensielt - Sensitive information
  'SECRET', // Hemmelig - Highly sensitive information
  'TOP_SECRET', // Strengt hemmelig - Most sensitive information
]);

export const NSMSecurityDomainSchema = z.enum([
  'civilian', // Sivil sektor
  'defense', // Forsvar
  'intelligence', // Etterretning
  'critical_infrastructure', // Kritisk infrastruktur
  'government', // Offentlig forvaltning
  'healthcare', // Helsevesen
  'finance', // Finans
  'energy', // Energi
  'transport', // Transport
  'telecommunications', // Telekommunikasjon
]);

export const NSMSecurityControlSchema = z.enum([
  // Access Control (Tilgangskontroll)
  'AC_IDENTIFICATION', // Identifikasjon
  'AC_AUTHENTICATION', // Autentisering
  'AC_AUTHORIZATION', // Autorisasjon
  'AC_SESSION_MANAGEMENT', // Sesjonsbehandling
  'AC_PRIVILEGED_ACCESS', // Privilegert tilgang
  
  // Audit and Accountability (Revisjon og ansvarlighet)
  'AU_AUDIT_EVENTS', // Revisjonsbegivenheter
  'AU_AUDIT_CONTENT', // Revisjonsinnhold
  'AU_AUDIT_STORAGE', // Revisjonslagring
  'AU_AUDIT_PROCESSING', // Revisjonsbehandling
  'AU_AUDIT_MONITORING', // Revisjonsovervåkning
  
  // Configuration Management (Konfigurasjonsstyring)
  'CM_BASELINE_CONFIGURATION', // Grunnkonfigurasjon
  'CM_CONFIGURATION_CHANGE_CONTROL', // Endringskontroll
  'CM_SECURITY_IMPACT_ANALYSIS', // Sikkerhetskonsekvensanalyse
  'CM_ACCESS_RESTRICTIONS', // Tilgangsbegrensninger
  
  // Contingency Planning (Beredskap)
  'CP_CONTINGENCY_PLAN', // Beredskapsplan
  'CP_CONTINGENCY_TRAINING', // Beredskapsopplæring
  'CP_BACKUP_RECOVERY', // Sikkerhetskopi og gjenoppretting
  'CP_SYSTEM_RECOVERY', // Systemgjenoppretting
  
  // Identification and Authentication (Identifikasjon og autentisering)
  'IA_USER_IDENTIFICATION', // Brukeridentifikasjon
  'IA_DEVICE_IDENTIFICATION', // Enhetsidentifikasjon
  'IA_AUTHENTICATOR_MANAGEMENT', // Autentiseringsbehandling
  'IA_AUTHENTICATION_REQUIREMENTS', // Autentiseringskrav
  
  // Incident Response (Hendelsesrespons)
  'IR_INCIDENT_RESPONSE_POLICY', // Policy for hendelsesrespons
  'IR_INCIDENT_RESPONSE_TRAINING', // Opplæring i hendelsesrespons
  'IR_INCIDENT_RESPONSE_TESTING', // Testing av hendelsesrespons
  'IR_INCIDENT_HANDLING', // Hendelseshåndtering
  
  // Maintenance (Vedlikehold)
  'MA_SYSTEM_MAINTENANCE', // Systemvedlikehold
  'MA_CONTROLLED_MAINTENANCE', // Kontrollert vedlikehold
  'MA_MAINTENANCE_TOOLS', // Vedlikeholdsverktøy
  'MA_REMOTE_MAINTENANCE', // Fjernstyrt vedlikehold
  
  // Media Protection (Mediebeskyttelse)
  'MP_MEDIA_ACCESS', // Medietilgang
  'MP_MEDIA_MARKING', // Mediemerking
  'MP_MEDIA_STORAGE', // Medielagring
  'MP_MEDIA_TRANSPORT', // Medietransport
  'MP_MEDIA_SANITIZATION', // Medierensing
  
  // Physical and Environmental Protection (Fysisk og miljømessig beskyttelse)
  'PE_PHYSICAL_ACCESS_AUTHORIZATIONS', // Fysiske tilgangsautorisasjoner
  'PE_PHYSICAL_ACCESS_CONTROL', // Fysisk tilgangskontroll
  'PE_ACCESS_CONTROL_FOR_TRANSMISSION_MEDIUM', // Tilgangskontroll for overføringsmedium
  'PE_ACCESS_CONTROL_FOR_DISPLAY_MEDIUM', // Tilgangskontroll for visningsmedium
  
  // Planning (Planlegging)
  'PL_SECURITY_PLANNING', // Sikkerhetsplanlegging
  'PL_SYSTEM_SECURITY_PLAN', // Systemsikkerhetsplan
  'PL_RULES_OF_BEHAVIOR', // Oppførselsregler
  'PL_INFORMATION_SECURITY_ARCHITECTURE', // Informasjonssikkerhetsarkitektur
  
  // Personnel Security (Personellsikkerhet)
  'PS_POSITION_CATEGORIZATION', // Posisjonskategorisering
  'PS_PERSONNEL_SCREENING', // Personellscreening
  'PS_PERSONNEL_TERMINATION', // Personellterminering
  'PS_PERSONNEL_TRANSFER', // Personelloverføring
  
  // Risk Assessment (Risikovurdering)
  'RA_SECURITY_CATEGORIZATION', // Sikkerhetskategorisering
  'RA_SECURITY_CONTROL_ASSESSMENT', // Vurdering av sikkerhetskontroller
  'RA_CONTINUOUS_MONITORING', // Kontinuerlig overvåkning
  'RA_RISK_ASSESSMENT', // Risikovurdering
  
  // System and Services Acquisition (System- og tjenesteanskaffelse)
  'SA_SYSTEM_AND_SERVICES_ACQUISITION_POLICY', // Policy for system- og tjenesteanskaffelse
  'SA_ALLOCATION_OF_RESOURCES', // Ressursallokering
  'SA_SYSTEM_DEVELOPMENT_LIFE_CYCLE', // Systemutviklingslivssyklus
  'SA_ACQUISITIONS', // Anskaffelser
  
  // System and Communications Protection (System- og kommunikasjonsbeskyttelse)
  'SC_APPLICATION_PARTITIONING', // Applikasjonspartisjonering
  'SC_SECURITY_FUNCTION_ISOLATION', // Isolering av sikkerhetsfunksjoner
  'SC_DENIAL_OF_SERVICE_PROTECTION', // Beskyttelse mot tjenestenekt
  'SC_RESOURCE_AVAILABILITY', // Ressurstilgjengelighet
  'SC_CRYPTOGRAPHIC_PROTECTION', // Kryptografisk beskyttelse
  
  // System and Information Integrity (System- og informasjonsintegritet)
  'SI_SYSTEM_AND_INFORMATION_INTEGRITY_POLICY', // Policy for system- og informasjonsintegritet
  'SI_FLAW_REMEDIATION', // Feilretting
  'SI_MALICIOUS_CODE_PROTECTION', // Beskyttelse mot ondsinnet kode
  'SI_INFORMATION_SYSTEM_MONITORING', // Overvåkning av informasjonssystem
  'SI_SECURITY_ALERTS_ADVISORIES', // Sikkerhetsalarmer og råd
]);

export type NSMClassification = z.infer<typeof NSMClassificationSchema>;
export type NSMSecurityDomain = z.infer<typeof NSMSecurityDomainSchema>;
export type NSMSecurityControl = z.infer<typeof NSMSecurityControlSchema>;

// NSM Configuration Schema
export const NSMConfigurationSchema = z.object({
  organizationName: z.string(),
  organizationType: NSMSecurityDomainSchema,
  registrationNumber: z.string().optional(), // Organisasjonsnummer
  securityOfficer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    clearanceLevel: NSMClassificationSchema,
  }),
  defaultClassification: NSMClassificationSchema.default('RESTRICTED'),
  dataProcessingLocation: z.enum(['norway', 'eu', 'global']).default('norway'),
  cloudServices: z.object({
    approved: z.boolean().default(false),
    provider: z.string().optional(),
    certifications: z.array(z.string()).default([]),
  }),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('low'),
  complianceFrameworks: z.array(z.string()).default(['NSM', 'ISO27001', 'GDPR']),
  incidentReporting: z.object({
    enabled: z.boolean().default(true),
    nsmNotification: z.boolean().default(true),
    automaticReporting: z.boolean().default(false),
  }),
  norwegianLanguageRequirement: z.boolean().default(true),
});

export type NSMConfiguration = z.infer<typeof NSMConfigurationSchema>;

// Security Assessment Interfaces
export interface NSMSecurityAssessment {
  assessmentId: string;
  organizationId: string;
  assessmentDate: Date;
  assessor: string;
  classification: NSMClassification;
  domain: NSMSecurityDomain;
  
  controlAssessment: {
    [key in NSMSecurityControl]?: {
      implemented: boolean;
      effectiveness: 'not_effective' | 'partially_effective' | 'effective';
      evidence: string[];
      gaps: string[];
      recommendations: string[];
    };
  };
  
  riskAssessment: {
    identifiedRisks: NSMRisk[];
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    acceptableRisk: boolean;
    mitigationRequired: boolean;
  };
  
  complianceStatus: {
    overallCompliance: 'compliant' | 'partially_compliant' | 'non_compliant';
    criticalNonCompliance: NSMNonCompliance[];
    majorNonCompliance: NSMNonCompliance[];
    minorNonCompliance: NSMNonCompliance[];
  };
  
  recommendations: NSMRecommendation[];
  nextAssessmentDate: Date;
  certificationStatus: 'certified' | 'conditionally_certified' | 'not_certified';
}

export interface NSMRisk {
  id: string;
  category: 'confidentiality' | 'integrity' | 'availability' | 'accountability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number; // 1-25 (likelihood x impact)
  description: string;
  threatSource: string;
  vulnerability: string;
  existingControls: string[];
  proposedMitigations: string[];
  residualRisk: number;
  acceptanceStatus: 'accepted' | 'mitigated' | 'transferred' | 'avoided';
}

export interface NSMNonCompliance {
  id: string;
  control: NSMSecurityControl;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_deviation';
  norwegianReference: string; // Reference to Norwegian regulation/standard
}

export interface NSMRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  rationale: string;
  implementation: string[];
  estimatedCost: string;
  timeline: string;
  complianceImpact: string;
  riskReduction: number; // Percentage
  norwegianContext: string;
}

export class NSMSecurityService {
  private config: NSMConfiguration;
  private assessmentHistory: NSMSecurityAssessment[] = [];

  constructor(config: NSMConfiguration) {
    this.config = NSMConfigurationSchema.parse(config);
  }

  /**
   * Perform comprehensive NSM security assessment
   */
  async performSecurityAssessment(options: {
    classification?: NSMClassification;
    includeRiskAssessment?: boolean;
    includeControlAssessment?: boolean;
    generateCertificationReport?: boolean;
  } = {}): Promise<NSMSecurityAssessment> {
    const assessmentId = createHash('sha256')
      .update(`${Date.now()}-${this.config.organizationName}-NSM`)
      .digest('hex')
      .substring(0, 16);

    console.log(chalk.cyan(`🛡️  Starting NSM Security Assessment (${assessmentId})`));
    console.log(chalk.gray(`Organization: ${this.config.organizationName}`));
    console.log(chalk.gray(`Domain: ${this.config.organizationType}`));
    console.log(chalk.gray(`Classification: ${options.classification || this.config.defaultClassification}`));

    const classification = options.classification || this.config.defaultClassification;
    
    // 1. Control Assessment
    const controlAssessment = options.includeControlAssessment !== false 
      ? await this.assessSecurityControls(classification)
      : {};

    // 2. Risk Assessment
    const riskAssessment = options.includeRiskAssessment !== false
      ? await this.performRiskAssessment(classification)
      : {
          identifiedRisks: [],
          overallRiskLevel: 'low' as const,
          acceptableRisk: true,
          mitigationRequired: false,
        };

    // 3. Compliance Assessment
    const complianceStatus = await this.assessCompliance(controlAssessment, classification);

    // 4. Generate Recommendations
    const recommendations = this.generateSecurityRecommendations(
      controlAssessment,
      riskAssessment,
      complianceStatus
    );

    // 5. Determine Certification Status
    const certificationStatus = this.determineCertificationStatus(complianceStatus, riskAssessment);

    const assessment: NSMSecurityAssessment = {
      assessmentId,
      organizationId: this.config.organizationName,
      assessmentDate: new Date(),
      assessor: 'Xaheen NSM Security Service',
      classification,
      domain: this.config.organizationType,
      controlAssessment,
      riskAssessment,
      complianceStatus,
      recommendations,
      nextAssessmentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      certificationStatus,
    };

    this.assessmentHistory.push(assessment);

    // Display results
    this.displayAssessmentResults(assessment);

    // Generate certification report if requested
    if (options.generateCertificationReport) {
      await this.generateCertificationReport(assessment);
    }

    return assessment;
  }

  /**
   * Assess security controls based on NSM requirements
   */
  private async assessSecurityControls(classification: NSMClassification): Promise<NSMSecurityAssessment['controlAssessment']> {
    const controlAssessment: NSMSecurityAssessment['controlAssessment'] = {};

    // Define required controls based on classification level
    const requiredControls = this.getRequiredControls(classification);

    for (const control of requiredControls) {
      // Simulate control assessment (in real implementation, this would check actual system state)
      const assessment = await this.assessIndividualControl(control);
      controlAssessment[control] = assessment;
    }

    return controlAssessment;
  }

  /**
   * Get required controls based on classification level
   */
  private getRequiredControls(classification: NSMClassification): NSMSecurityControl[] {
    const baseControls: NSMSecurityControl[] = [
      'AC_IDENTIFICATION',
      'AC_AUTHENTICATION',
      'AC_AUTHORIZATION',
      'AU_AUDIT_EVENTS',
      'AU_AUDIT_CONTENT',
      'CM_BASELINE_CONFIGURATION',
      'IA_USER_IDENTIFICATION',
      'IA_AUTHENTICATOR_MANAGEMENT',
      'PL_SECURITY_PLANNING',
      'RA_SECURITY_CATEGORIZATION',
      'SC_CRYPTOGRAPHIC_PROTECTION',
      'SI_SYSTEM_AND_INFORMATION_INTEGRITY_POLICY',
    ];

    const restrictedControls: NSMSecurityControl[] = [
      ...baseControls,
      'AC_SESSION_MANAGEMENT',
      'AU_AUDIT_STORAGE',
      'CM_CONFIGURATION_CHANGE_CONTROL',
      'CP_CONTINGENCY_PLAN',
      'IR_INCIDENT_RESPONSE_POLICY',
      'PE_PHYSICAL_ACCESS_CONTROL',
      'PS_PERSONNEL_SCREENING',
      'RA_CONTINUOUS_MONITORING',
      'SC_DENIAL_OF_SERVICE_PROTECTION',
      'SI_MALICIOUS_CODE_PROTECTION',
    ];

    const confidentialControls: NSMSecurityControl[] = [
      ...restrictedControls,
      'AC_PRIVILEGED_ACCESS',
      'AU_AUDIT_MONITORING',
      'CM_SECURITY_IMPACT_ANALYSIS',
      'CP_BACKUP_RECOVERY',
      'IA_DEVICE_IDENTIFICATION',
      'IR_INCIDENT_HANDLING',
      'MA_CONTROLLED_MAINTENANCE',
      'MP_MEDIA_MARKING',
      'PE_PHYSICAL_ACCESS_AUTHORIZATIONS',
      'PS_POSITION_CATEGORIZATION',
      'RA_RISK_ASSESSMENT',
      'SC_SECURITY_FUNCTION_ISOLATION',
      'SI_INFORMATION_SYSTEM_MONITORING',
    ];

    const secretControls: NSMSecurityControl[] = [
      ...confidentialControls,
      'AU_AUDIT_PROCESSING',
      'CM_ACCESS_RESTRICTIONS',
      'CP_CONTINGENCY_TRAINING',
      'IA_AUTHENTICATION_REQUIREMENTS',
      'IR_INCIDENT_RESPONSE_TRAINING',
      'MA_MAINTENANCE_TOOLS',
      'MP_MEDIA_STORAGE',
      'MP_MEDIA_TRANSPORT',
      'PE_ACCESS_CONTROL_FOR_TRANSMISSION_MEDIUM',
      'PS_PERSONNEL_TERMINATION',
      'SA_SYSTEM_DEVELOPMENT_LIFE_CYCLE',
      'SC_APPLICATION_PARTITIONING',
      'SI_FLAW_REMEDIATION',
    ];

    const topSecretControls: NSMSecurityControl[] = [
      ...secretControls,
      'CP_SYSTEM_RECOVERY',
      'IR_INCIDENT_RESPONSE_TESTING',
      'MA_REMOTE_MAINTENANCE',
      'MP_MEDIA_ACCESS',
      'MP_MEDIA_SANITIZATION',
      'PE_ACCESS_CONTROL_FOR_DISPLAY_MEDIUM',
      'PS_PERSONNEL_TRANSFER',
      'SA_ALLOCATION_OF_RESOURCES',
      'SC_RESOURCE_AVAILABILITY',
      'SI_SECURITY_ALERTS_ADVISORIES',
    ];

    switch (classification) {
      case 'OPEN':
        return baseControls;
      case 'RESTRICTED':
        return restrictedControls;
      case 'CONFIDENTIAL':
        return confidentialControls;
      case 'SECRET':
        return secretControls;
      case 'TOP_SECRET':
        return topSecretControls;
      default:
        return baseControls;
    }
  }

  /**
   * Assess individual security control
   */
  private async assessIndividualControl(control: NSMSecurityControl): Promise<{
    implemented: boolean;
    effectiveness: 'not_effective' | 'partially_effective' | 'effective';
    evidence: string[];
    gaps: string[];
    recommendations: string[];
  }> {
    // This is a simplified assessment - in real implementation, this would check actual system configuration
    const implemented = Math.random() > 0.2; // 80% implementation rate
    const effectiveness = implemented 
      ? (Math.random() > 0.3 ? 'effective' : 'partially_effective')
      : 'not_effective';

    const evidence = implemented ? [
      `${control} configuration files present`,
      `${control} logging enabled`,
      `${control} monitoring active`,
    ] : [];

    const gaps = !implemented || effectiveness !== 'effective' ? [
      effectiveness === 'not_effective' ? `${control} not implemented` : `${control} partially implemented`,
      'Documentation incomplete',
      'Regular review process missing',
    ] : [];

    const recommendations = gaps.length > 0 ? [
      `Implement complete ${control} solution`,
      'Update security documentation',
      'Establish regular review process',
      'Provide staff training',
    ] : [];

    return {
      implemented,
      effectiveness,
      evidence,
      gaps,
      recommendations,
    };
  }

  /**
   * Perform risk assessment
   */
  private async performRiskAssessment(classification: NSMClassification): Promise<NSMSecurityAssessment['riskAssessment']> {
    const risks: NSMRisk[] = await this.identifyRisks(classification);
    
    // Calculate overall risk level
    const riskScores = risks.map(r => r.riskScore);
    const maxRisk = Math.max(...riskScores, 0);
    const avgRisk = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0;

    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (maxRisk >= 20 || avgRisk >= 15) {
      overallRiskLevel = 'critical';
    } else if (maxRisk >= 15 || avgRisk >= 10) {
      overallRiskLevel = 'high';
    } else if (maxRisk >= 10 || avgRisk >= 6) {
      overallRiskLevel = 'medium';
    } else {
      overallRiskLevel = 'low';
    }

    // Risk tolerance check
    const riskToleranceThreshold = {
      'low': 5,
      'medium': 10,
      'high': 15,
    }[this.config.riskTolerance];

    const acceptableRisk = maxRisk <= riskToleranceThreshold;
    const mitigationRequired = !acceptableRisk || overallRiskLevel === 'critical';

    return {
      identifiedRisks: risks,
      overallRiskLevel,
      acceptableRisk,
      mitigationRequired,
    };
  }

  /**
   * Identify security risks
   */
  private async identifyRisks(classification: NSMClassification): Promise<NSMRisk[]> {
    const commonRisks: Partial<NSMRisk>[] = [
      {
        category: 'confidentiality',
        description: 'Unauthorized access to classified information',
        threatSource: 'External attacker or insider threat',
        vulnerability: 'Weak access controls or unpatched systems',
      },
      {
        category: 'integrity',
        description: 'Unauthorized modification of critical data',
        threatSource: 'Malicious actor or system error',
        vulnerability: 'Insufficient integrity controls',
      },
      {
        category: 'availability',
        description: 'System or service disruption',
        threatSource: 'DoS attack, system failure, or natural disaster',
        vulnerability: 'Single points of failure',
      },
      {
        category: 'accountability',
        description: 'Insufficient audit trail for actions',
        threatSource: 'System design flaw or configuration error',
        vulnerability: 'Inadequate logging and monitoring',
      },
    ];

    const risks: NSMRisk[] = [];
    
    for (let i = 0; i < commonRisks.length; i++) {
      const baseRisk = commonRisks[i];
      
      // Risk scoring based on classification level
      const classificationMultiplier = {
        'OPEN': 1,
        'RESTRICTED': 2,
        'CONFIDENTIAL': 3,
        'SECRET': 4,
        'TOP_SECRET': 5,
      }[classification];

      const likelihood = Math.min(5, Math.ceil(Math.random() * 3 + classificationMultiplier * 0.5));
      const impact = Math.min(5, Math.ceil(Math.random() * 3 + classificationMultiplier * 0.5));
      const riskScore = likelihood * impact;

      const risk: NSMRisk = {
        id: `NSM-RISK-${String(i + 1).padStart(3, '0')}`,
        category: baseRisk.category!,
        severity: riskScore >= 15 ? 'critical' : riskScore >= 10 ? 'high' : riskScore >= 6 ? 'medium' : 'low',
        likelihood: ['very_low', 'low', 'medium', 'high', 'very_high'][likelihood - 1] as any,
        impact: ['negligible', 'minor', 'moderate', 'major', 'catastrophic'][impact - 1] as any,
        riskScore,
        description: baseRisk.description!,
        threatSource: baseRisk.threatSource!,
        vulnerability: baseRisk.vulnerability!,
        existingControls: ['Access control system', 'Audit logging', 'Network monitoring'],
        proposedMitigations: [
          'Implement additional access controls',
          'Enhanced monitoring and alerting',
          'Regular security assessments',
          'Staff security training',
        ],
        residualRisk: Math.max(1, riskScore - 5), // After mitigation
        acceptanceStatus: riskScore <= 10 ? 'accepted' : 'mitigated',
      };

      risks.push(risk);
    }

    return risks;
  }

  /**
   * Assess overall compliance
   */
  private async assessCompliance(
    controlAssessment: NSMSecurityAssessment['controlAssessment'],
    classification: NSMClassification
  ): Promise<NSMSecurityAssessment['complianceStatus']> {
    const nonCompliances: { critical: NSMNonCompliance[], major: NSMNonCompliance[], minor: NSMNonCompliance[] } = {
      critical: [],
      major: [],
      minor: [],
    };

    // Assess each control for compliance
    for (const [control, assessment] of Object.entries(controlAssessment)) {
      if (!assessment.implemented) {
        const severity = this.getControlCriticalityLevel(control as NSMSecurityControl, classification);
        const nonCompliance: NSMNonCompliance = {
          id: `NSM-NC-${control}`,
          control: control as NSMSecurityControl,
          severity,
          description: `${control} is not implemented`,
          evidence: [`Control assessment shows not implemented`],
          impact: this.getControlImpactDescription(control as NSMSecurityControl),
          recommendation: assessment.recommendations.join('; '),
          deadline: new Date(Date.now() + (severity === 'critical' ? 30 : severity === 'major' ? 90 : 180) * 24 * 60 * 60 * 1000),
          status: 'open',
          norwegianReference: this.getNorwegianReference(control as NSMSecurityControl),
        };

        nonCompliances[severity].push(nonCompliance);
      } else if (assessment.effectiveness !== 'effective') {
        const severity = assessment.effectiveness === 'not_effective' ? 'major' : 'minor';
        const nonCompliance: NSMNonCompliance = {
          id: `NSM-NC-${control}-EFF`,
          control: control as NSMSecurityControl,
          severity,
          description: `${control} is not effective`,
          evidence: assessment.gaps,
          impact: `Reduced security effectiveness for ${control}`,
          recommendation: assessment.recommendations.join('; '),
          deadline: new Date(Date.now() + (severity === 'major' ? 90 : 180) * 24 * 60 * 60 * 1000),
          status: 'open',
          norwegianReference: this.getNorwegianReference(control as NSMSecurityControl),
        };

        nonCompliances[severity].push(nonCompliance);
      }
    }

    // Determine overall compliance
    let overallCompliance: 'compliant' | 'partially_compliant' | 'non_compliant';
    if (nonCompliances.critical.length > 0) {
      overallCompliance = 'non_compliant';
    } else if (nonCompliances.major.length > 0 || nonCompliances.minor.length > 5) {
      overallCompliance = 'partially_compliant';
    } else {
      overallCompliance = 'compliant';
    }

    return {
      overallCompliance,
      criticalNonCompliance: nonCompliances.critical,
      majorNonCompliance: nonCompliances.major,
      minorNonCompliance: nonCompliances.minor,
    };
  }

  /**
   * Get control criticality level based on classification
   */
  private getControlCriticalityLevel(control: NSMSecurityControl, classification: NSMClassification): 'critical' | 'major' | 'minor' {
    const criticalControls = [
      'AC_IDENTIFICATION',
      'AC_AUTHENTICATION',
      'SC_CRYPTOGRAPHIC_PROTECTION',
      'AU_AUDIT_EVENTS',
    ];

    const majorControls = [
      'AC_AUTHORIZATION',
      'AU_AUDIT_CONTENT',
      'CM_BASELINE_CONFIGURATION',
      'IA_USER_IDENTIFICATION',
      'PL_SECURITY_PLANNING',
    ];

    if (criticalControls.includes(control)) {
      return 'critical';
    } else if (majorControls.includes(control)) {
      return classification === 'SECRET' || classification === 'TOP_SECRET' ? 'critical' : 'major';
    } else {
      return 'minor';
    }
  }

  /**
   * Get control impact description
   */
  private getControlImpactDescription(control: NSMSecurityControl): string {
    const impactMap: Record<string, string> = {
      'AC_IDENTIFICATION': 'Cannot verify user identity, compromising accountability',
      'AC_AUTHENTICATION': 'Cannot verify user credentials, allowing unauthorized access',
      'AC_AUTHORIZATION': 'Cannot enforce access permissions, risking data exposure',
      'AU_AUDIT_EVENTS': 'Cannot track security-relevant events, hindering incident response',
      'SC_CRYPTOGRAPHIC_PROTECTION': 'Data transmitted and stored without encryption, risking confidentiality',
      // Add more mappings as needed
    };

    return impactMap[control] || `Security control ${control} not implemented, reducing overall security posture`;
  }

  /**
   * Get Norwegian regulation reference
   */
  private getNorwegianReference(control: NSMSecurityControl): string {
    const referenceMap: Record<string, string> = {
      'AC_IDENTIFICATION': 'NSM Grunnprinsipper for IKT-sikkerhet 2.1',
      'AC_AUTHENTICATION': 'NSM Grunnprinsipper for IKT-sikkerhet 2.2',
      'AU_AUDIT_EVENTS': 'NSM Grunnprinsipper for IKT-sikkerhet 4.1',
      'SC_CRYPTOGRAPHIC_PROTECTION': 'NSM Kryptografiske anbefalinger 1.0',
      // Add more mappings as needed
    };

    return referenceMap[control] || 'NSM Grunnprinsipper for IKT-sikkerhet';
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    controlAssessment: NSMSecurityAssessment['controlAssessment'],
    riskAssessment: NSMSecurityAssessment['riskAssessment'],
    complianceStatus: NSMSecurityAssessment['complianceStatus']
  ): NSMRecommendation[] {
    const recommendations: NSMRecommendation[] = [];

    // Critical compliance recommendations
    if (complianceStatus.criticalNonCompliance.length > 0) {
      recommendations.push({
        id: 'NSM-REC-001',
        priority: 'critical',
        category: 'Critical Compliance',
        title: 'Address Critical NSM Non-Compliance Issues',
        description: `${complianceStatus.criticalNonCompliance.length} critical compliance issues require immediate attention to maintain NSM certification.`,
        rationale: 'Critical security controls are fundamental to NSM compliance and national security requirements.',
        implementation: [
          'Immediately review all critical findings',
          'Assign dedicated security personnel to address each issue',
          'Implement temporary compensating controls if needed',
          'Document all remediation actions for NSM reporting',
          'Schedule emergency security assessment within 14 days',
        ],
        estimatedCost: '500,000 - 2,000,000 NOK',
        timeline: '1-2 weeks',
        complianceImpact: 'Prevents loss of NSM certification and potential regulatory sanctions',
        riskReduction: 70,
        norwegianContext: 'NSM kan pålegge sanksjoner eller tilbaketrekke sertifisering ved kritiske avvik',
      });
    }

    // High-risk mitigation recommendation
    if (riskAssessment.overallRiskLevel === 'critical' || riskAssessment.overallRiskLevel === 'high') {
      recommendations.push({
        id: 'NSM-REC-002',
        priority: 'high',
        category: 'Risk Mitigation',
        title: 'Implement High-Priority Risk Mitigations',
        description: 'Several high-risk vulnerabilities require immediate mitigation to reduce exposure to security threats.',
        rationale: 'Current risk level exceeds organizational risk tolerance and NSM acceptable risk thresholds.',
        implementation: [
          'Deploy additional security controls for high-risk areas',
          'Implement enhanced monitoring and alerting',
          'Conduct regular vulnerability assessments',
          'Develop incident response procedures for identified threats',
          'Establish continuous security monitoring',
        ],
        estimatedCost: '300,000 - 1,500,000 NOK',
        timeline: '4-8 weeks',
        complianceImpact: 'Reduces overall risk profile to acceptable levels',
        riskReduction: 60,
        norwegianContext: 'Ivaretar nasjonal sikkerhet i henhold til NSMs risikomodell',
      });
    }

    // Norwegian-specific recommendations
    if (this.config.norwegianLanguageRequirement) {
      recommendations.push({
        id: 'NSM-REC-003',
        priority: 'medium',
        category: 'Norwegian Requirements',
        title: 'Enhance Norwegian Language Support and Localization',
        description: 'Improve Norwegian language support for security interfaces and documentation.',
        rationale: 'Norwegian government and enterprise requirements mandate native language support for security systems.',
        implementation: [
          'Translate all security interfaces to Norwegian',
          'Provide Norwegian security documentation',
          'Train security personnel in Norwegian security terminology',
          'Implement Norwegian-specific incident reporting procedures',
          'Establish communication with Datatilsynet and NSM in Norwegian',
        ],
        estimatedCost: '200,000 - 800,000 NOK',
        timeline: '6-12 weeks',
        complianceImpact: 'Meets Norwegian government language requirements',
        riskReduction: 20,
        norwegianContext: 'Oppfyller språkkrav i henhold til norsk forvaltning og NSM-retningslinjer',
      });
    }

    return recommendations;
  }

  /**
   * Determine certification status
   */
  private determineCertificationStatus(
    complianceStatus: NSMSecurityAssessment['complianceStatus'],
    riskAssessment: NSMSecurityAssessment['riskAssessment']
  ): 'certified' | 'conditionally_certified' | 'not_certified' {
    if (complianceStatus.criticalNonCompliance.length > 0 || riskAssessment.overallRiskLevel === 'critical') {
      return 'not_certified';
    } else if (complianceStatus.majorNonCompliance.length > 0 || riskAssessment.overallRiskLevel === 'high') {
      return 'conditionally_certified';
    } else {
      return 'certified';
    }
  }

  /**
   * Display assessment results
   */
  private displayAssessmentResults(assessment: NSMSecurityAssessment): void {
    console.log(chalk.cyan('\n🛡️  NSM Security Assessment Results\n'));

    // Overall Status
    const statusColor = assessment.certificationStatus === 'certified' ? chalk.green :
                       assessment.certificationStatus === 'conditionally_certified' ? chalk.yellow : 
                       chalk.red;
    
    console.log(`Certification Status: ${statusColor(assessment.certificationStatus.toUpperCase())}`);
    console.log(`Overall Compliance: ${assessment.complianceStatus.overallCompliance.toUpperCase()}`);
    console.log(`Risk Level: ${assessment.riskAssessment.overallRiskLevel.toUpperCase()}`);

    // Compliance Summary
    console.log(chalk.cyan('\n📋 Compliance Summary:'));
    console.log(chalk.red(`  Critical Issues: ${assessment.complianceStatus.criticalNonCompliance.length}`));
    console.log(chalk.yellow(`  Major Issues: ${assessment.complianceStatus.majorNonCompliance.length}`));
    console.log(chalk.blue(`  Minor Issues: ${assessment.complianceStatus.minorNonCompliance.length}`));

    // Risk Summary
    console.log(chalk.cyan('\n⚠️  Risk Summary:'));
    console.log(chalk.gray(`  Identified Risks: ${assessment.riskAssessment.identifiedRisks.length}`));
    console.log(chalk.gray(`  Overall Risk Level: ${assessment.riskAssessment.overallRiskLevel}`));
    console.log(chalk.gray(`  Acceptable Risk: ${assessment.riskAssessment.acceptableRisk ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  Mitigation Required: ${assessment.riskAssessment.mitigationRequired ? 'Yes' : 'No'}`));

    // Next Steps
    console.log(chalk.cyan('\n📖 Next Steps:'));
    if (assessment.complianceStatus.criticalNonCompliance.length > 0) {
      console.log(chalk.red('  1. Address all critical compliance issues immediately'));
    }
    if (assessment.riskAssessment.overallRiskLevel === 'critical' || assessment.riskAssessment.overallRiskLevel === 'high') {
      console.log(chalk.yellow('  2. Implement high-priority risk mitigations'));
    }
    console.log(chalk.gray(`  3. Next assessment scheduled: ${assessment.nextAssessmentDate.toLocaleDateString()}`));

    console.log(chalk.gray(`\n📄 Detailed report available at: ./compliance-reports/nsm-assessment-${assessment.assessmentId}.json`));
  }

  /**
   * Generate certification report
   */
  async generateCertificationReport(assessment: NSMSecurityAssessment): Promise<string> {
    const reportPath = `./compliance-reports/nsm-certification-${assessment.assessmentId}.md`;
    await fs.ensureDir(path.dirname(reportPath));

    const report = `# NSM Security Certification Report

**Organization:** ${this.config.organizationName}
**Assessment Date:** ${assessment.assessmentDate.toISOString()}
**Assessment ID:** ${assessment.assessmentId}
**Classification Level:** ${assessment.classification}
**Domain:** ${assessment.domain}

## Executive Summary

This NSM security assessment evaluated the organization's compliance with Norwegian National Security Authority requirements for ${assessment.classification} classified systems.

**Certification Status:** ${assessment.certificationStatus.toUpperCase()}
**Overall Compliance:** ${assessment.complianceStatus.overallCompliance.toUpperCase()}
**Risk Level:** ${assessment.riskAssessment.overallRiskLevel.toUpperCase()}

## Compliance Assessment

### Critical Non-Compliance Issues: ${assessment.complianceStatus.criticalNonCompliance.length}
${assessment.complianceStatus.criticalNonCompliance.map(nc => `
#### ${nc.id}: ${nc.description}
- **Control:** ${nc.control}
- **Impact:** ${nc.impact}
- **Recommendation:** ${nc.recommendation}
- **Deadline:** ${nc.deadline.toLocaleDateString()}
- **Norwegian Reference:** ${nc.norwegianReference}
`).join('\n')}

### Major Non-Compliance Issues: ${assessment.complianceStatus.majorNonCompliance.length}
${assessment.complianceStatus.majorNonCompliance.map(nc => `
#### ${nc.id}: ${nc.description}
- **Control:** ${nc.control}
- **Impact:** ${nc.impact}
- **Recommendation:** ${nc.recommendation}
- **Deadline:** ${nc.deadline.toLocaleDateString()}
`).join('\n')}

## Risk Assessment

### Overall Risk Profile
- **Risk Level:** ${assessment.riskAssessment.overallRiskLevel.toUpperCase()}
- **Acceptable Risk:** ${assessment.riskAssessment.acceptableRisk ? 'Yes' : 'No'}
- **Mitigation Required:** ${assessment.riskAssessment.mitigationRequired ? 'Yes' : 'No'}

### High-Risk Items
${assessment.riskAssessment.identifiedRisks
  .filter(risk => risk.severity === 'critical' || risk.severity === 'high')
  .map(risk => `
#### ${risk.id}: ${risk.description}
- **Severity:** ${risk.severity.toUpperCase()}
- **Risk Score:** ${risk.riskScore}/25
- **Threat Source:** ${risk.threatSource}
- **Proposed Mitigations:** ${risk.proposedMitigations.join(', ')}
`).join('\n')}

## Recommendations

${assessment.recommendations.map(rec => `
### ${rec.title}
**Priority:** ${rec.priority.toUpperCase()}
**Category:** ${rec.category}

${rec.description}

**Rationale:** ${rec.rationale}

**Implementation Steps:**
${rec.implementation.map(step => `- ${step}`).join('\n')}

**Estimated Cost:** ${rec.estimatedCost}
**Timeline:** ${rec.timeline}
**Risk Reduction:** ${rec.riskReduction}%
**Norwegian Context:** ${rec.norwegianContext}
`).join('\n')}

## Certification Decision

Based on this assessment, the organization is **${assessment.certificationStatus.toUpperCase()}** for NSM security requirements at the ${assessment.classification} classification level.

${assessment.certificationStatus === 'not_certified' ? 
  '**Certification cannot be granted** due to critical compliance gaps and unacceptable risk levels. Immediate remediation is required.' :
  assessment.certificationStatus === 'conditionally_certified' ?
  '**Conditional certification** is granted subject to addressing identified major issues within specified timelines.' :
  '**Full certification** is granted. Continue regular assessments to maintain compliance.'
}

## Next Steps

1. Address all critical and major findings according to specified timelines
2. Implement recommended risk mitigations
3. Establish continuous monitoring and regular assessments
4. Report progress to NSM according to certification requirements
5. Schedule next assessment for ${assessment.nextAssessmentDate.toLocaleDateString()}

---
*This report was generated by the Xaheen NSM Security Service in compliance with Norwegian National Security Authority requirements.*
`;

    await fs.writeFile(reportPath, report);
    console.log(chalk.green(`\n📋 NSM Certification Report generated: ${reportPath}`));
    
    return reportPath;
  }

  /**
   * Export assessment results
   */
  async exportAssessmentResults(assessment: NSMSecurityAssessment, outputPath?: string): Promise<string> {
    const reportPath = outputPath || `./compliance-reports/nsm-assessment-${assessment.assessmentId}.json`;
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, assessment, { spaces: 2 });
    
    return reportPath;
  }
}
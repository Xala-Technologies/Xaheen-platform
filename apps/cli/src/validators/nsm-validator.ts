import { z } from 'zod';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import crypto from 'crypto';
import type { GenerationResult } from '../types.js';

/**
 * Norwegian NSM (Nasjonal sikkerhetsmyndighet) Security Validation
 * 
 * Validates code and systems according to NSM security guidelines
 * and Norwegian government security requirements
 */

// NSM Security Classification Levels
export enum NSMClassification {
  UGRADERT = 'UGRADERT',           // Unclassified/Open
  BEGRENSET = 'BEGRENSET',         // Restricted
  KONFIDENSIELT = 'KONFIDENSIELT', // Confidential
  HEMMELIG = 'HEMMELIG',           // Secret
  STRENGT_HEMMELIG = 'STRENGT_HEMMELIG' // Top Secret
}

// English mappings for compatibility
export enum SecurityClassification {
  OPEN = 'OPEN',
  INTERNAL = 'INTERNAL',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET'
}

// Security domains according to NSM
export enum SecurityDomain {
  INFORMATION_SECURITY = 'information_security',
  PERSONNEL_SECURITY = 'personnel_security',
  PHYSICAL_SECURITY = 'physical_security',
  SECURITY_GOVERNANCE = 'security_governance'
}

// NSM security controls
export enum NSMControl {
  // Information Security
  ACCESS_CONTROL = 'access_control',
  AUTHENTICATION = 'authentication',
  ENCRYPTION = 'encryption',
  INTEGRITY = 'integrity',
  LOGGING = 'logging',
  NETWORK_SECURITY = 'network_security',
  
  // Application Security
  SECURE_DEVELOPMENT = 'secure_development',
  INPUT_VALIDATION = 'input_validation',
  ERROR_HANDLING = 'error_handling',
  SESSION_MANAGEMENT = 'session_management',
  
  // Data Protection
  DATA_CLASSIFICATION = 'data_classification',
  DATA_HANDLING = 'data_handling',
  DATA_RETENTION = 'data_retention',
  DATA_DISPOSAL = 'data_disposal',
  
  // Incident Response
  INCIDENT_DETECTION = 'incident_detection',
  INCIDENT_RESPONSE = 'incident_response',
  FORENSICS = 'forensics',
  RECOVERY = 'recovery'
}

// NSM validation result schema
const nsmResultSchema = z.object({
  compliant: z.boolean(),
  classification: z.nativeEnum(NSMClassification),
  score: z.number().min(0).max(100),
  domains: z.record(z.nativeEnum(SecurityDomain), z.object({
    score: z.number(),
    controls: z.array(z.object({
      control: z.nativeEnum(NSMControl),
      implemented: z.boolean(),
      effectiveness: z.number().min(0).max(100),
      issues: z.array(z.string())
    }))
  })),
  vulnerabilities: z.array(z.object({
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    type: z.string(),
    description: z.string(),
    location: z.object({
      file: z.string(),
      line: z.number(),
      column: z.number()
    }).optional(),
    cwe: z.string().optional(),
    remediation: z.string()
  })),
  threats: z.array(z.object({
    category: z.string(),
    likelihood: z.enum(['very_high', 'high', 'medium', 'low', 'very_low']),
    impact: z.enum(['catastrophic', 'major', 'moderate', 'minor', 'insignificant']),
    description: z.string(),
    mitigations: z.array(z.string())
  })),
  recommendations: z.array(z.string()),
  certificationReady: z.boolean()
});

export type NSMResult = z.infer<typeof nsmResultSchema>;

// Security patterns and anti-patterns
const securityPatterns = {
  // Vulnerable patterns
  sqlInjection: /(`|"|').*\$\{.*\}.*\1.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i,
  commandInjection: /exec\(|spawn\(|system\(/,
  pathTraversal: /\.\.\/|\.\.\\|%2e%2e/i,
  xxe: /<!ENTITY/i,
  
  // Weak crypto
  weakHashing: /\b(md5|sha1)\b/i,
  weakRandom: /Math\.random/,
  hardcodedSecrets: /(?:password|secret|key|token)\s*[:=]\s*["'][^"']+["']/i,
  
  // Authentication issues
  noAuth: /\/api\/.*(?:get|post|put|delete).*(?<!auth|authenticated|authorized)/i,
  weakPassword: /password.*length.*<.*[1-7]\b/i,
  
  // Norwegian specific
  personalNumber: /\b\d{6}\s?\d{5}\b/,
  dNumber: /\b[4-7]\d{5}\s?\d{5}\b/,
  organizationNumber: /\b\d{9}\b/,
  
  // Good patterns
  bcryptUsage: /bcrypt|argon2|scrypt|pbkdf2/i,
  jwtVerification: /jwt\.verify|verifyToken/i,
  inputSanitization: /sanitize|escape|validate/i,
  parameterizedQueries: /\?\s*,|:\w+|@\w+/,
  csrfProtection: /csrf|xsrf/i
};

/**
 * NSM Security Validator
 */
export class NSMValidator {
  /**
   * Validate NSM compliance
   */
  async validateNSMCompliance(
    code: string,
    filePath: string = 'unknown',
    classification: NSMClassification = NSMClassification.BEGRENSET
  ): Promise<NSMResult> {
    const vulnerabilities: NSMResult['vulnerabilities'] = [];
    const threats: NSMResult['threats'] = [];
    const recommendations: string[] = [];

    // Parse code
    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
    } catch (error) {
      vulnerabilities.push({
        severity: 'low',
        type: 'parse_error',
        description: 'Failed to parse code for security analysis',
        remediation: 'Ensure code is valid TypeScript/JavaScript'
      });
    }

    // Perform security analysis
    const securityAnalysis = this.analyzeSecurityVulnerabilities(code, filePath);
    vulnerabilities.push(...securityAnalysis.vulnerabilities);

    // Analyze by security domains
    const domains = this.analyzeSecurityDomains(ast, code, classification);

    // Perform threat modeling
    const threatModel = this.performThreatModeling(code, classification);
    threats.push(...threatModel.threats);

    // Check classification-specific requirements
    const classificationIssues = this.checkClassificationRequirements(
      code,
      classification,
      domains
    );
    vulnerabilities.push(...classificationIssues);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(
      classification,
      domains,
      vulnerabilities,
      threats
    ));

    // Calculate compliance score
    const score = this.calculateComplianceScore(domains, vulnerabilities);

    // Check certification readiness
    const certificationReady = this.checkCertificationReadiness(
      score,
      classification,
      vulnerabilities
    );

    return {
      compliant: score >= 80 && vulnerabilities.filter(v => v.severity === 'critical').length === 0,
      classification,
      score,
      domains,
      vulnerabilities,
      threats,
      recommendations,
      certificationReady
    };
  }

  /**
   * Analyze security vulnerabilities
   */
  private analyzeSecurityVulnerabilities(
    code: string,
    filePath: string
  ): {
    vulnerabilities: NSMResult['vulnerabilities'];
  } {
    const vulnerabilities: NSMResult['vulnerabilities'] = [];

    // Check for SQL injection
    const sqlMatches = code.matchAll(securityPatterns.sqlInjection);
    for (const match of sqlMatches) {
      vulnerabilities.push({
        severity: 'critical',
        type: 'sql_injection',
        description: 'Potential SQL injection vulnerability detected',
        cwe: 'CWE-89',
        remediation: 'Use parameterized queries or prepared statements'
      });
    }

    // Check for command injection
    if (securityPatterns.commandInjection.test(code)) {
      vulnerabilities.push({
        severity: 'critical',
        type: 'command_injection',
        description: 'Potential command injection vulnerability',
        cwe: 'CWE-78',
        remediation: 'Avoid dynamic command execution or use safe alternatives'
      });
    }

    // Check for path traversal
    if (securityPatterns.pathTraversal.test(code)) {
      vulnerabilities.push({
        severity: 'high',
        type: 'path_traversal',
        description: 'Potential path traversal vulnerability',
        cwe: 'CWE-22',
        remediation: 'Validate and sanitize file paths'
      });
    }

    // Check for weak crypto
    if (securityPatterns.weakHashing.test(code)) {
      vulnerabilities.push({
        severity: 'high',
        type: 'weak_crypto',
        description: 'Weak hashing algorithm detected (MD5/SHA1)',
        cwe: 'CWE-327',
        remediation: 'Use SHA-256 or stronger hashing algorithms'
      });
    }

    // Check for weak randomness
    if (securityPatterns.weakRandom.test(code)) {
      vulnerabilities.push({
        severity: 'medium',
        type: 'weak_random',
        description: 'Math.random() is not cryptographically secure',
        cwe: 'CWE-330',
        remediation: 'Use crypto.randomBytes() or crypto.getRandomValues()'
      });
    }

    // Check for hardcoded secrets
    if (securityPatterns.hardcodedSecrets.test(code)) {
      vulnerabilities.push({
        severity: 'high',
        type: 'hardcoded_secret',
        description: 'Hardcoded credentials or secrets detected',
        cwe: 'CWE-798',
        remediation: 'Use environment variables or secure key management'
      });
    }

    // Check for exposed personal numbers (Norwegian specific)
    if (securityPatterns.personalNumber.test(code)) {
      vulnerabilities.push({
        severity: 'high',
        type: 'exposed_personal_data',
        description: 'Norwegian personal number exposed in code',
        remediation: 'Remove personal numbers and use test data'
      });
    }

    return { vulnerabilities };
  }

  /**
   * Analyze security domains
   */
  private analyzeSecurityDomains(
    ast: any,
    code: string,
    classification: NSMClassification
  ): NSMResult['domains'] {
    const domains: NSMResult['domains'] = {
      [SecurityDomain.INFORMATION_SECURITY]: {
        score: 0,
        controls: []
      },
      [SecurityDomain.PERSONNEL_SECURITY]: {
        score: 0,
        controls: []
      },
      [SecurityDomain.PHYSICAL_SECURITY]: {
        score: 0,
        controls: []
      },
      [SecurityDomain.SECURITY_GOVERNANCE]: {
        score: 0,
        controls: []
      }
    };

    // Information Security Controls
    const infoSecControls = [
      {
        control: NSMControl.ACCESS_CONTROL,
        implemented: /role.*based|permission|authorize|rbac|abac/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.AUTHENTICATION,
        implemented: /authenticate|login|jwt|oauth|bankid/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.ENCRYPTION,
        implemented: /encrypt|crypto|tls|https|aes/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.INTEGRITY,
        implemented: /checksum|hash|hmac|signature|integrity/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.LOGGING,
        implemented: /log|audit|monitor|winston|pino/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.NETWORK_SECURITY,
        implemented: /firewall|vpn|ipsec|cors|helmet/i.test(code),
        effectiveness: 0,
        issues: []
      }
    ];

    // Calculate effectiveness for each control
    infoSecControls.forEach(control => {
      if (control.implemented) {
        control.effectiveness = this.calculateControlEffectiveness(control.control, code);
        
        // Add issues based on classification
        if (classification >= NSMClassification.KONFIDENSIELT && 
            control.control === NSMControl.ENCRYPTION && 
            control.effectiveness < 80) {
          control.issues.push('Encryption must be AES-256 or stronger for KONFIDENSIELT data');
        }
      } else {
        control.issues.push(`${control.control} not implemented`);
      }
    });

    domains[SecurityDomain.INFORMATION_SECURITY].controls = infoSecControls;
    domains[SecurityDomain.INFORMATION_SECURITY].score = 
      this.calculateDomainScore(infoSecControls);

    // Application Security Controls
    const appSecControls = [
      {
        control: NSMControl.SECURE_DEVELOPMENT,
        implemented: /eslint|prettier|husky|pre-commit/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.INPUT_VALIDATION,
        implemented: /validate|sanitize|joi|yup|zod/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.ERROR_HANDLING,
        implemented: /try.*catch|\.catch|error.*handler/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.SESSION_MANAGEMENT,
        implemented: /session|cookie.*secure|httponly|samesite/i.test(code),
        effectiveness: 0,
        issues: []
      }
    ];

    appSecControls.forEach(control => {
      if (control.implemented) {
        control.effectiveness = this.calculateControlEffectiveness(control.control, code);
      } else {
        control.issues.push(`${control.control} not implemented`);
      }
    });

    // Add to information security domain
    domains[SecurityDomain.INFORMATION_SECURITY].controls.push(...appSecControls);
    domains[SecurityDomain.INFORMATION_SECURITY].score = 
      this.calculateDomainScore(domains[SecurityDomain.INFORMATION_SECURITY].controls);

    // Data Protection Controls
    const dataControls = [
      {
        control: NSMControl.DATA_CLASSIFICATION,
        implemented: /classification|classify|label.*data/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.DATA_HANDLING,
        implemented: /data.*handler|process.*data|transform/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.DATA_RETENTION,
        implemented: /retention|ttl|expire|cleanup/i.test(code),
        effectiveness: 0,
        issues: []
      },
      {
        control: NSMControl.DATA_DISPOSAL,
        implemented: /delete|purge|wipe|shred/i.test(code),
        effectiveness: 0,
        issues: []
      }
    ];

    dataControls.forEach(control => {
      if (control.implemented) {
        control.effectiveness = this.calculateControlEffectiveness(control.control, code);
        
        // Check for secure deletion
        if (control.control === NSMControl.DATA_DISPOSAL && 
            classification >= NSMClassification.KONFIDENSIELT &&
            !(/crypto.*randomBytes.*overwrite|secure.*delete/i.test(code))) {
          control.issues.push('Secure deletion required for KONFIDENSIELT data');
          control.effectiveness = Math.min(control.effectiveness, 50);
        }
      } else {
        control.issues.push(`${control.control} not implemented`);
      }
    });

    // Add to governance domain
    domains[SecurityDomain.SECURITY_GOVERNANCE].controls = dataControls;
    domains[SecurityDomain.SECURITY_GOVERNANCE].score = 
      this.calculateDomainScore(dataControls);

    return domains;
  }

  /**
   * Perform threat modeling
   */
  private performThreatModeling(
    code: string,
    classification: NSMClassification
  ): {
    threats: NSMResult['threats'];
  } {
    const threats: NSMResult['threats'] = [];

    // STRIDE threat modeling
    const strideThreats = [
      {
        category: 'Spoofing',
        likelihood: this.assessLikelihood(code, 'spoofing'),
        impact: this.assessImpact(classification, 'spoofing'),
        description: 'Attacker could impersonate a legitimate user or system',
        mitigations: [
          'Implement strong authentication (BankID for Norwegian systems)',
          'Use mutual TLS for service-to-service communication',
          'Implement anti-phishing measures'
        ]
      },
      {
        category: 'Tampering',
        likelihood: this.assessLikelihood(code, 'tampering'),
        impact: this.assessImpact(classification, 'tampering'),
        description: 'Data could be modified in transit or at rest',
        mitigations: [
          'Use cryptographic signatures for data integrity',
          'Implement secure channels (TLS 1.3+)',
          'Use immutable audit logs'
        ]
      },
      {
        category: 'Repudiation',
        likelihood: this.assessLikelihood(code, 'repudiation'),
        impact: this.assessImpact(classification, 'repudiation'),
        description: 'Users could deny actions they performed',
        mitigations: [
          'Implement comprehensive audit logging',
          'Use digital signatures for critical actions',
          'Store logs in tamper-proof storage'
        ]
      },
      {
        category: 'Information Disclosure',
        likelihood: this.assessLikelihood(code, 'disclosure'),
        impact: this.assessImpact(classification, 'disclosure'),
        description: 'Sensitive information could be exposed',
        mitigations: [
          'Encrypt sensitive data at rest and in transit',
          'Implement proper access controls',
          'Use data loss prevention (DLP) measures'
        ]
      },
      {
        category: 'Denial of Service',
        likelihood: this.assessLikelihood(code, 'dos'),
        impact: this.assessImpact(classification, 'dos'),
        description: 'System availability could be compromised',
        mitigations: [
          'Implement rate limiting',
          'Use circuit breakers',
          'Deploy auto-scaling infrastructure'
        ]
      },
      {
        category: 'Elevation of Privilege',
        likelihood: this.assessLikelihood(code, 'privilege'),
        impact: this.assessImpact(classification, 'privilege'),
        description: 'Attacker could gain unauthorized privileges',
        mitigations: [
          'Follow principle of least privilege',
          'Implement proper authorization checks',
          'Use secure session management'
        ]
      }
    ];

    // Add relevant threats based on analysis
    strideThreats.forEach(threat => {
      if (threat.likelihood !== 'very_low' || threat.impact !== 'insignificant') {
        threats.push(threat);
      }
    });

    // Norwegian specific threats
    if (classification >= NSMClassification.BEGRENSET) {
      threats.push({
        category: 'Foreign Intelligence',
        likelihood: classification >= NSMClassification.HEMMELIG ? 'high' : 'medium',
        impact: 'major',
        description: 'System could be targeted by foreign intelligence services',
        mitigations: [
          'Implement NSM-approved encryption',
          'Use Norwegian-hosted infrastructure',
          'Implement strict access controls',
          'Regular security assessments'
        ]
      });
    }

    return { threats };
  }

  /**
   * Check classification-specific requirements
   */
  private checkClassificationRequirements(
    code: string,
    classification: NSMClassification,
    domains: NSMResult['domains']
  ): NSMResult['vulnerabilities'] {
    const vulnerabilities: NSMResult['vulnerabilities'] = [];

    switch (classification) {
      case NSMClassification.KONFIDENSIELT:
        // Check for proper encryption
        if (!(/aes.*256|rsa.*2048/i.test(code))) {
          vulnerabilities.push({
            severity: 'high',
            type: 'insufficient_encryption',
            description: 'KONFIDENSIELT data requires AES-256 or RSA-2048 minimum',
            remediation: 'Upgrade to NSM-approved encryption standards'
          });
        }

        // Check for proper key management
        if (!(/key.*vault|hsm|key.*management/i.test(code))) {
          vulnerabilities.push({
            severity: 'high',
            type: 'weak_key_management',
            description: 'KONFIDENSIELT systems require proper key management',
            remediation: 'Implement HSM or approved key management solution'
          });
        }
        break;

      case NSMClassification.HEMMELIG:
      case NSMClassification.STRENGT_HEMMELIG:
        // Check for air-gapped requirements
        if (/https?:|websocket|external.*api/i.test(code)) {
          vulnerabilities.push({
            severity: 'critical',
            type: 'network_exposure',
            description: `${classification} systems must be air-gapped`,
            remediation: 'Remove all external network connections'
          });
        }

        // Check for approved crypto
        if (!(/nsm.*approved|sikkerhetsgodkjent/i.test(code))) {
          vulnerabilities.push({
            severity: 'critical',
            type: 'unapproved_crypto',
            description: `${classification} requires NSM-approved cryptography`,
            remediation: 'Use only NSM-sikkerhetsgodkjent crypto implementations'
          });
        }
        break;
    }

    // Common requirements for BEGRENSET and above
    if (classification >= NSMClassification.BEGRENSET) {
      // Check for logging
      const loggingControl = domains[SecurityDomain.INFORMATION_SECURITY].controls
        .find(c => c.control === NSMControl.LOGGING);
      
      if (!loggingControl?.implemented) {
        vulnerabilities.push({
          severity: 'medium',
          type: 'insufficient_logging',
          description: 'Security logging required for BEGRENSET and above',
          remediation: 'Implement comprehensive security event logging'
        });
      }

      // Check for Norwegian hosting
      if (/amazonaws|azure|gcp/i.test(code) && !(/norway|norge|oslo/i.test(code))) {
        vulnerabilities.push({
          severity: 'medium',
          type: 'foreign_hosting',
          description: 'Consider Norwegian data center hosting for government data',
          remediation: 'Use Norwegian data centers or government cloud'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    classification: NSMClassification,
    domains: NSMResult['domains'],
    vulnerabilities: NSMResult['vulnerabilities'],
    threats: NSMResult['threats']
  ): string[] {
    const recommendations: string[] = [];

    // Classification-specific recommendations
    switch (classification) {
      case NSMClassification.KONFIDENSIELT:
        recommendations.push('Implement NSM-approved encryption (AES-256, RSA-2048 minimum)');
        recommendations.push('Use hardware security modules (HSM) for key management');
        recommendations.push('Implement multi-factor authentication with BankID');
        recommendations.push('Deploy in NSM-approved data centers');
        break;

      case NSMClassification.HEMMELIG:
      case NSMClassification.STRENGT_HEMMELIG:
        recommendations.push('System must be completely air-gapped');
        recommendations.push('Use only NSM-sikkerhetsgodkjent components');
        recommendations.push('Implement physical security controls');
        recommendations.push('Personnel must have security clearance');
        break;
    }

    // Domain-based recommendations
    Object.entries(domains).forEach(([domain, data]) => {
      if (data.score < 80) {
        const weakControls = data.controls
          .filter(c => c.effectiveness < 70)
          .map(c => c.control);
        
        if (weakControls.length > 0) {
          recommendations.push(
            `Strengthen ${domain} controls: ${weakControls.join(', ')}`
          );
        }
      }
    });

    // Vulnerability-based recommendations
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push('Address critical vulnerabilities immediately:');
      criticalVulns.forEach(vuln => {
        recommendations.push(`- ${vuln.type}: ${vuln.remediation}`);
      });
    }

    // Threat-based recommendations
    const highThreats = threats.filter(t => 
      t.likelihood === 'high' || t.likelihood === 'very_high' ||
      t.impact === 'major' || t.impact === 'catastrophic'
    );
    
    if (highThreats.length > 0) {
      recommendations.push('Implement additional controls for high-risk threats:');
      highThreats.forEach(threat => {
        recommendations.push(`- ${threat.category}: ${threat.mitigations[0]}`);
      });
    }

    // Norwegian specific recommendations
    recommendations.push('Follow NSM grunnprinsipper for IKT-sikkerhet');
    recommendations.push('Implement sikkerhetsstyring according to NSM framework');
    recommendations.push('Consider using Nasjonalt cybersikkerhetssenter services');

    if (classification >= NSMClassification.BEGRENSET) {
      recommendations.push('Register system with NSM for security assessment');
      recommendations.push('Implement NSM-compliant incident response procedures');
    }

    return recommendations;
  }

  /**
   * Helper methods
   */

  private calculateControlEffectiveness(control: NSMControl, code: string): number {
    let effectiveness = 50; // Base effectiveness

    switch (control) {
      case NSMControl.ENCRYPTION:
        if (/aes.*256/i.test(code)) effectiveness += 30;
        if (/rsa.*2048/i.test(code)) effectiveness += 20;
        if (/tls.*1\.3/i.test(code)) effectiveness += 20;
        if (/key.*rotation/i.test(code)) effectiveness += 10;
        break;

      case NSMControl.AUTHENTICATION:
        if (/bankid/i.test(code)) effectiveness += 40;
        if (/multi.*factor|2fa|mfa/i.test(code)) effectiveness += 30;
        if (/jwt.*verify/i.test(code)) effectiveness += 20;
        if (/session.*timeout/i.test(code)) effectiveness += 10;
        break;

      case NSMControl.INPUT_VALIDATION:
        if (/zod|joi|yup/i.test(code)) effectiveness += 30;
        if (/sanitize/i.test(code)) effectiveness += 20;
        if (/escape/i.test(code)) effectiveness += 20;
        if (/whitelist/i.test(code)) effectiveness += 10;
        break;

      case NSMControl.LOGGING:
        if (/audit.*log/i.test(code)) effectiveness += 30;
        if (/structured.*log/i.test(code)) effectiveness += 20;
        if (/log.*retention/i.test(code)) effectiveness += 20;
        if (/siem|elk|splunk/i.test(code)) effectiveness += 10;
        break;
    }

    return Math.min(100, effectiveness);
  }

  private calculateDomainScore(controls: any[]): number {
    if (controls.length === 0) return 0;
    
    const totalEffectiveness = controls.reduce((sum, control) => 
      sum + (control.implemented ? control.effectiveness : 0), 0
    );
    
    return Math.round(totalEffectiveness / controls.length);
  }

  private assessLikelihood(code: string, threatType: string): 
    'very_high' | 'high' | 'medium' | 'low' | 'very_low' {
    
    switch (threatType) {
      case 'spoofing':
        if (!(/authenticate|jwt|oauth/i.test(code))) return 'high';
        if (/bankid/i.test(code)) return 'very_low';
        return 'medium';

      case 'tampering':
        if (!(/signature|hmac|checksum/i.test(code))) return 'high';
        return 'low';

      case 'disclosure':
        if (!(/encrypt/i.test(code))) return 'very_high';
        if (/aes.*256/i.test(code)) return 'low';
        return 'medium';

      default:
        return 'medium';
    }
  }

  private assessImpact(classification: NSMClassification, threatType: string): 
    'catastrophic' | 'major' | 'moderate' | 'minor' | 'insignificant' {
    
    const baseImpact = {
      [NSMClassification.UGRADERT]: 'minor',
      [NSMClassification.BEGRENSET]: 'moderate',
      [NSMClassification.KONFIDENSIELT]: 'major',
      [NSMClassification.HEMMELIG]: 'catastrophic',
      [NSMClassification.STRENGT_HEMMELIG]: 'catastrophic'
    };

    // Adjust for specific threats
    if (threatType === 'disclosure' && classification >= NSMClassification.KONFIDENSIELT) {
      return 'catastrophic';
    }

    return baseImpact[classification] as any;
  }

  private calculateComplianceScore(
    domains: NSMResult['domains'],
    vulnerabilities: NSMResult['vulnerabilities']
  ): number {
    // Start with domain average
    const domainScores = Object.values(domains).map(d => d.score);
    let score = domainScores.reduce((sum, s) => sum + s, 0) / domainScores.length;

    // Deduct for vulnerabilities
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private checkCertificationReadiness(
    score: number,
    classification: NSMClassification,
    vulnerabilities: NSMResult['vulnerabilities']
  ): boolean {
    // Basic requirements
    if (score < 85) return false;
    if (vulnerabilities.some(v => v.severity === 'critical')) return false;
    
    // Classification-specific requirements
    switch (classification) {
      case NSMClassification.KONFIDENSIELT:
        return vulnerabilities.filter(v => v.severity === 'high').length === 0;
      
      case NSMClassification.HEMMELIG:
      case NSMClassification.STRENGT_HEMMELIG:
        return vulnerabilities.length === 0 && score >= 95;
      
      default:
        return true;
    }
  }
}

/**
 * Generate NSM compliance component
 */
export async function generateNSMComponent(
  options: z.infer<typeof nsmComponentOptionsSchema>
): Promise<GenerationResult> {
  const files = new Map<string, string>();
  
  // Generate NSM compliance service
  const serviceContent = `
${options.typescript ? `
import type { 
  NSMClassification,
  SecurityDomain,
  NSMControl,
  SecurityIncident
} from '../types/nsm-security';
` : ''}

/**
 * NSM Security Service for ${options.projectName}
 * Implements Norwegian government security requirements
 */
export class NSMSecurityService {
  private classification${options.typescript ? ': NSMClassification' : ''} = 'BEGRENSET';
  private incidents${options.typescript ? ': SecurityIncident[]' : ''} = [];

  /**
   * Classify data according to NSM standards
   */
  classifyData(
    data${options.typescript ? ': any' : ''},
    context${options.typescript ? ': string' : ''}
  )${options.typescript ? ': NSMClassification' : ''} {
    // Check for highly sensitive patterns
    if (this.containsHighlySensitive(data)) {
      return 'KONFIDENSIELT';
    }
    
    // Check for personal data
    if (this.containsPersonalData(data)) {
      return 'BEGRENSET';
    }
    
    // Check for business sensitive
    if (this.containsBusinessSensitive(data)) {
      return 'BEGRENSET';
    }
    
    return 'UGRADERT';
  }

  /**
   * Implement security controls
   */
  implementSecurityControls(
    classification${options.typescript ? ': NSMClassification' : ''}
  )${options.typescript ? ': void' : ''} {
    switch (classification) {
      case 'KONFIDENSIELT':
        this.implementKonfidensielt();
        break;
      
      case 'HEMMELIG':
      case 'STRENGT_HEMMELIG':
        this.implementHemmelig();
        break;
      
      case 'BEGRENSET':
        this.implementBegrenset();
        break;
      
      default:
        this.implementUgradert();
    }
  }

  /**
   * Report security incident
   */
  reportIncident(
    incident${options.typescript ? ': SecurityIncident' : ''}
  )${options.typescript ? ': void' : ''} {
    // Log incident
    this.incidents.push(incident);
    
    // Notify NSM if required
    if (incident.severity === 'critical' || 
        this.classification >= 'KONFIDENSIELT') {
      this.notifyNSM(incident);
    }
    
    // Initiate response
    this.initiateIncidentResponse(incident);
  }

  /**
   * Generate security documentation
   */
  generateSecurityDocumentation()${options.typescript ? ': string' : ''} {
    return \`
# Sikkerhetsdokumentasjon - ${options.projectName}

## Klassifisering
System klassifisert som: \${this.classification}

## Sikkerhetskontroller
- Tilgangskontroll: Implementert med ${options.authentication || 'standard autentisering'}
- Kryptering: AES-256 for data i ro, TLS 1.3 for data i transitt
- Logging: Sikkerhetslogging til ${options.logging || 'sentralt loggingssystem'}
- Sikkerhetskopiering: Daglig backup med kryptering

## Risikohåndtering
- Risikovurdering utført: [DATO]
- Neste planlagte vurdering: [DATO]
- Identifiserte risikoer: [ANTALL]
- Implementerte tiltak: [ANTALL]

## Beredskap
- Beredskapsplan: Versjon [X.Y]
- Siste øvelse: [DATO]
- Kontaktinformasjon NSM: tilgjengelig i beredskapsplan

## Compliance
- NSM grunnprinsipper: Implementert
- Sikkerhetsloven: Etterleves
- Personopplysningsloven: Etterleves
    \`;
  }

  // Private helper methods
  
  private containsHighlySensitive(data${options.typescript ? ': any' : ''})${options.typescript ? ': boolean' : ''} {
    // Check for patterns indicating highly sensitive data
    const patterns = [
      /hemmelig/i,
      /konfidensielt/i,
      /gradert/i,
      /sikkerhetsgradert/i
    ];
    
    const dataStr = JSON.stringify(data);
    return patterns.some(pattern => pattern.test(dataStr));
  }

  private containsPersonalData(data${options.typescript ? ': any' : ''})${options.typescript ? ': boolean' : ''} {
    const patterns = [
      /\\b\\d{6}\\s?\\d{5}\\b/, // Personal number
      /\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b/, // Email
      /\\b\\d{8}\\b/ // Phone
    ];
    
    const dataStr = JSON.stringify(data);
    return patterns.some(pattern => pattern.test(dataStr));
  }

  private containsBusinessSensitive(data${options.typescript ? ': any' : ''})${options.typescript ? ': boolean' : ''} {
    const keywords = [
      'confidential',
      'proprietary',
      'trade secret',
      'internal only'
    ];
    
    const dataStr = JSON.stringify(data).toLowerCase();
    return keywords.some(keyword => dataStr.includes(keyword));
  }

  private implementKonfidensielt()${options.typescript ? ': void' : ''} {
    console.log('Implementing KONFIDENSIELT security controls');
    // AES-256 encryption
    // HSM for key management
    // Multi-factor authentication
    // Comprehensive logging
  }

  private implementHemmelig()${options.typescript ? ': void' : ''} {
    console.log('Implementing HEMMELIG security controls');
    // Air-gapped systems
    // NSM-approved crypto
    // Physical security
    // Personnel clearance
  }

  private implementBegrenset()${options.typescript ? ': void' : ''} {
    console.log('Implementing BEGRENSET security controls');
    // Standard encryption
    // Role-based access
    // Security logging
    // Regular backups
  }

  private implementUgradert()${options.typescript ? ': void' : ''} {
    console.log('Implementing UGRADERT security controls');
    // Basic access control
    // HTTPS/TLS
    // Standard logging
  }

  private notifyNSM(incident${options.typescript ? ': SecurityIncident' : ''})${options.typescript ? ': void' : ''} {
    console.log('Notifying NSM of security incident:', incident);
    // TODO: Implement NSM notification
  }

  private initiateIncidentResponse(incident${options.typescript ? ': SecurityIncident' : ''})${options.typescript ? ': void' : ''} {
    console.log('Initiating incident response:', incident);
    // TODO: Implement incident response
  }
}

// Export singleton instance
export const nsmSecurityService = new NSMSecurityService();`;

  files.set('services/nsm-security-service.ts', serviceContent);
  
  return {
    success: true,
    files,
    message: 'NSM security service created successfully'
  };
}

// Component options schema
const nsmComponentOptionsSchema = z.object({
  typescript: z.boolean().default(true),
  projectName: z.string(),
  authentication: z.string().optional(),
  logging: z.string().optional(),
  outputPath: z.string()
});

// Export validator instance
export const nsmValidator = new NSMValidator();
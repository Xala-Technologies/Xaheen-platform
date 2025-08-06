/**
 * Norwegian NSM Compliance Validator
 * 
 * Validates compliance with Norwegian National Security Authority (NSM) requirements:
 * - Data classification (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
 * - Norwegian localization support
 * - Security patterns and practices
 * - GDPR compliance
 * - Government accessibility standards
 * 
 * @author DevOps Expert Agent
 * @since 2025-08-06
 */

import { ValidationRule, ValidationIssue, ValidationContext } from './comprehensive-validator';
import { createASTAnalyzer } from './ast-analyzer';
import * as path from 'path';
import * as fs from 'fs-extra';

// =============================================================================
// NSM COMPLIANCE CONFIGURATION
// =============================================================================

interface NSMConfig {
  readonly classifications: NSMClassification[];
  readonly sensitiveDataPatterns: SensitiveDataPattern[];
  readonly norwegianPatterns: NorwegianPattern[];
  readonly securityRequirements: SecurityRequirement[];
  readonly gdprRequirements: GDPRRequirement[];
}

interface NSMClassification {
  readonly level: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly description: string;
  readonly requirements: string[];
}

interface SensitiveDataPattern {
  readonly pattern: RegExp;
  readonly type: string;
  readonly requiredClassification: NSMClassification['level'];
  readonly description: string;
}

interface NorwegianPattern {
  readonly pattern: RegExp;
  readonly type: string;
  readonly requirement: string;
}

interface SecurityRequirement {
  readonly id: string;
  readonly pattern: RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
}

interface GDPRRequirement {
  readonly id: string;
  readonly pattern: RegExp;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly article: string;
}

const NSM_CONFIG: NSMConfig = {
  classifications: [
    {
      level: 'OPEN',
      description: 'Information that can be made public',
      requirements: ['No special protection needed', 'Standard accessibility requirements']
    },
    {
      level: 'RESTRICTED',
      description: 'Information with limited distribution',
      requirements: ['Access controls', 'Basic encryption', 'Audit logging']
    },
    {
      level: 'CONFIDENTIAL',
      description: 'Information that could damage national interests if disclosed',
      requirements: ['Strong encryption', 'Multi-factor authentication', 'Comprehensive audit trail']
    },
    {
      level: 'SECRET',
      description: 'Information that could seriously damage national security',
      requirements: ['End-to-end encryption', 'Air-gapped systems', 'Continuous monitoring']
    }
  ],
  sensitiveDataPatterns: [
    {
      pattern: /(personnummer|fødselsnummer|national\s*id|ssn|social\s*security)/gi,
      type: 'National ID',
      requiredClassification: 'RESTRICTED',
      description: 'Norwegian personal identification numbers require RESTRICTED classification'
    },
    {
      pattern: /(password|passord|secret|hemmelighet|nøkkel|key)/gi,
      type: 'Authentication',
      requiredClassification: 'CONFIDENTIAL',
      description: 'Authentication credentials require CONFIDENTIAL classification'
    },
    {
      pattern: /(email|epost|e-post|telefon|phone|adresse|address)/gi,
      type: 'Personal Information',
      requiredClassification: 'RESTRICTED',
      description: 'Personal contact information requires RESTRICTED classification'
    },
    {
      pattern: /(helse|health|medical|medisinsk|sykdom|illness)/gi,
      type: 'Health Information',
      requiredClassification: 'CONFIDENTIAL',
      description: 'Health information requires CONFIDENTIAL classification'
    }
  ],
  norwegianPatterns: [
    {
      pattern: /[æøåÆØÅ]/g,
      type: 'Norwegian characters',
      requirement: 'Components with Norwegian text should support i18n'
    },
    {
      pattern: /(Altinn|NAV|Skatteetaten|Brønnøysund|DIFI)/gi,
      type: 'Norwegian government services',
      requirement: 'Government service integration requires proper authentication and logging'
    },
    {
      pattern: /(kroner|kr|NOK|øre)/gi,
      type: 'Norwegian currency',
      requirement: 'Currency handling should use Norwegian locale formatting'
    }
  ],
  securityRequirements: [
    {
      id: 'no-hardcoded-secrets',
      pattern: /(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']+["']/gi,
      severity: 'error',
      message: 'Hardcoded secrets detected - use environment variables or secure key management'
    },
    {
      id: 'secure-communication',
      pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
      severity: 'warning',
      message: 'Insecure HTTP detected - use HTTPS for external communication'
    },
    {
      id: 'input-validation',
      pattern: /dangerouslySetInnerHTML/gi,
      severity: 'error',
      message: 'Dangerous HTML insertion detected - validate and sanitize all input'
    }
  ],
  gdprRequirements: [
    {
      id: 'consent-tracking',
      pattern: /(consent|samtykke)/gi,
      severity: 'warning',
      message: 'Consent handling detected - ensure GDPR Article 7 compliance',
      article: 'Article 7'
    },
    {
      id: 'data-retention',
      pattern: /(delete|slett|remove|fjern).*?(user|bruker|data)/gi,
      severity: 'warning',
      message: 'Data deletion detected - implement proper data retention policies per GDPR Article 17',
      article: 'Article 17'
    },
    {
      id: 'data-export',
      pattern: /(export|eksporter|download|last.*ned).*?(data|user|bruker)/gi,
      severity: 'warning',
      message: 'Data export detected - ensure GDPR Article 20 data portability compliance',
      article: 'Article 20'
    }
  ]
};

// =============================================================================
// NSM COMPLIANCE RULES
// =============================================================================

export const nsmComplianceRules: ValidationRule[] = [
  // Data classification requirement
  {
    id: 'nsm-data-classification',
    name: 'NSM Data Classification Required',
    category: 'nsm-security',
    severity: 'error',
    description: 'Components handling sensitive data must have NSM classification comment',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check if file contains sensitive data patterns
      let hasSensitiveData = false;
      let requiredClassification: NSMClassification['level'] = 'OPEN';
      let sensitiveTypes: string[] = [];
      
      for (const pattern of NSM_CONFIG.sensitiveDataPatterns) {
        if (pattern.pattern.test(sourceCode)) {
          hasSensitiveData = true;
          sensitiveTypes.push(pattern.type);
          
          // Use highest required classification
          const levels = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
          if (levels.indexOf(pattern.requiredClassification) > levels.indexOf(requiredClassification)) {
            requiredClassification = pattern.requiredClassification;
          }
        }
      }
      
      // Check for existing classification comment
      const classificationRegex = /\/\*\s*NSM:\s*(OPEN|RESTRICTED|CONFIDENTIAL|SECRET)\s*[^*]*\*\//i;
      const existingClassification = sourceCode.match(classificationRegex);
      
      if (hasSensitiveData) {
        if (!existingClassification) {
          issues.push({
            ruleId: 'nsm-data-classification',
            message: `Sensitive data detected (${sensitiveTypes.join(', ')}) - requires NSM classification comment (minimum: ${requiredClassification})`,
            severity: 'error',
            line: 1,
            file: filePath,
            category: 'nsm-security',
            fix: {
              description: `Add NSM ${requiredClassification} classification comment`,
              oldText: '',
              newText: `/* NSM: ${requiredClassification} - Contains ${sensitiveTypes.join(', ').toLowerCase()} */\n`
            }
          });
        } else {
          const currentLevel = existingClassification[1].toUpperCase() as NSMClassification['level'];
          const levels = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
          
          if (levels.indexOf(currentLevel) < levels.indexOf(requiredClassification)) {
            const lineNumber = sourceCode.substring(0, existingClassification.index!).split('\n').length;
            
            issues.push({
              ruleId: 'nsm-data-classification',
              message: `NSM classification level ${currentLevel} is insufficient for detected sensitive data - requires minimum ${requiredClassification}`,
              severity: 'error',
              line: lineNumber,
              file: filePath,
              category: 'nsm-security',
              fix: {
                description: `Update classification to ${requiredClassification}`,
                oldText: existingClassification[0],
                newText: `/* NSM: ${requiredClassification} - Contains ${sensitiveTypes.join(', ').toLowerCase()} */`
              }
            });
          }
        }
      }
      
      return issues;
    },
    autofix: (sourceCode: string, issues: ValidationIssue[]): string => {
      let fixed = sourceCode;
      
      for (const issue of issues) {
        if (issue.fix) {
          if (issue.fix.oldText === '') {
            // Add classification at the top
            fixed = issue.fix.newText + fixed;
          } else {
            // Replace existing classification
            fixed = fixed.replace(issue.fix.oldText, issue.fix.newText);
          }
        }
      }
      
      return fixed;
    }
  },

  // Norwegian localization support
  {
    id: 'nsm-norwegian-localization',
    name: 'Norwegian Localization Support',
    category: 'nsm-security',
    severity: 'warning',
    description: 'Components with Norwegian content should support proper internationalization',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      let hasNorwegianContent = false;
      const norwegianTypes: string[] = [];
      
      for (const pattern of NSM_CONFIG.norwegianPatterns) {
        if (pattern.pattern.test(sourceCode)) {
          hasNorwegianContent = true;
          norwegianTypes.push(pattern.type);
        }
      }
      
      if (hasNorwegianContent) {
        // Check for i18n support
        const hasI18nSupport = /(?:useTranslation|t\(|i18n|react-i18next|next-i18next)/.test(sourceCode);
        const hasNorwegianLocale = /(?:nb-NO|no|nor|norwegian)/i.test(sourceCode);
        
        if (!hasI18nSupport) {
          issues.push({
            ruleId: 'nsm-norwegian-localization',
            message: `Norwegian content detected (${norwegianTypes.join(', ')}) without i18n support - implement internationalization`,
            severity: 'warning',
            line: 1,
            file: filePath,
            category: 'nsm-security',
            fix: {
              description: 'Add i18n support for Norwegian content',
              oldText: '',
              newText: "import { useTranslation } from 'react-i18next';\n"
            }
          });
        }
        
        if (hasI18nSupport && !hasNorwegianLocale) {
          issues.push({
            ruleId: 'nsm-norwegian-localization',
            message: 'i18n detected but missing Norwegian locale configuration',
            severity: 'info',
            line: 1,
            file: filePath,
            category: 'nsm-security'
          });
        }
      }
      
      return issues;
    }
  },

  // Security requirements validation
  {
    id: 'nsm-security-requirements',
    name: 'NSM Security Requirements',
    category: 'nsm-security',
    severity: 'error',
    description: 'Code must follow NSM security requirements',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      for (const requirement of NSM_CONFIG.securityRequirements) {
        let match;
        while ((match = requirement.pattern.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          
          issues.push({
            ruleId: requirement.id,
            message: requirement.message,
            severity: requirement.severity,
            line: lineNumber,
            file: filePath,
            category: 'nsm-security'
          });
        }
      }
      
      return issues;
    }
  },

  // GDPR compliance validation
  {
    id: 'nsm-gdpr-compliance',
    name: 'GDPR Compliance Requirements',
    category: 'nsm-security',
    severity: 'warning',
    description: 'Ensure GDPR compliance for personal data handling',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      for (const requirement of NSM_CONFIG.gdprRequirements) {
        let match;
        while ((match = requirement.pattern.exec(sourceCode)) !== null) {
          const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
          
          issues.push({
            ruleId: requirement.id,
            message: `${requirement.message} (${requirement.article})`,
            severity: requirement.severity,
            line: lineNumber,
            file: filePath,
            category: 'nsm-security'
          });
        }
      }
      
      return issues;
    }
  },

  // Government service integration
  {
    id: 'nsm-government-services',
    name: 'Government Service Integration Standards',
    category: 'nsm-security',
    severity: 'warning',
    description: 'Government service integrations must follow NSM standards',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for government service references
      const govServicePattern = /(Altinn|NAV|Skatteetaten|Brønnøysund|DIFI)/gi;
      let match;
      
      while ((match = govServicePattern.exec(sourceCode)) !== null) {
        const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
        const serviceName = match[1];
        
        // Check for proper authentication patterns
        const hasAuth = /(?:auth|token|authenticate|login)/i.test(sourceCode);
        const hasLogging = /(?:log|audit|track)/i.test(sourceCode);
        const hasErrorHandling = /(?:try|catch|error|exception)/i.test(sourceCode);
        
        if (!hasAuth) {
          issues.push({
            ruleId: 'nsm-government-services',
            message: `${serviceName} integration detected without authentication - implement proper auth`,
            severity: 'error',
            line: lineNumber,
            file: filePath,
            category: 'nsm-security'
          });
        }
        
        if (!hasLogging) {
          issues.push({
            ruleId: 'nsm-government-services',
            message: `${serviceName} integration should include audit logging`,
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'nsm-security'
          });
        }
        
        if (!hasErrorHandling) {
          issues.push({
            ruleId: 'nsm-government-services',
            message: `${serviceName} integration should include proper error handling`,
            severity: 'warning',
            line: lineNumber,
            file: filePath,
            category: 'nsm-security'
          });
        }
      }
      
      return issues;
    }
  },

  // Data protection validation
  {
    id: 'nsm-data-protection',
    name: 'Data Protection Standards',
    category: 'nsm-security',
    severity: 'error',
    description: 'Ensure proper data protection measures',
    validate: (context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] => {
      const issues: ValidationIssue[] = [];
      
      // Check for encryption requirements
      const hasPersonalData = NSM_CONFIG.sensitiveDataPatterns.some(p => p.pattern.test(sourceCode));
      
      if (hasPersonalData) {
        const hasEncryption = /(?:encrypt|crypto|cipher|hash|bcrypt|scrypt)/i.test(sourceCode);
        const hasSecureStorage = /(?:secure|vault|keystore|HSM)/i.test(sourceCode);
        
        if (!hasEncryption && !hasSecureStorage) {
          issues.push({
            ruleId: 'nsm-data-protection',
            message: 'Personal data detected without encryption - implement data protection measures',
            severity: 'error',
            line: 1,
            file: filePath,
            category: 'nsm-security'
          });
        }
      }
      
      // Check for data transmission security
      const hasDataTransmission = /(?:fetch|axios|xhr|websocket|socket)/i.test(sourceCode);
      const hasHTTPS = /https:\/\//.test(sourceCode);
      const hasHTTP = /http:\/\/(?!localhost|127\.0\.0\.1)/.test(sourceCode);
      
      if (hasDataTransmission && hasHTTP) {
        issues.push({
          ruleId: 'nsm-data-protection',
          message: 'Data transmission over insecure HTTP detected - use HTTPS',
          severity: 'error',
          line: 1,
          file: filePath,
          category: 'nsm-security'
        });
      }
      
      return issues;
    }
  }
];

// =============================================================================
// NSM COMPLIANCE VALIDATOR CLASS
// =============================================================================

export class NSMComplianceValidator {
  private rules: ValidationRule[];
  private config: NSMConfig;

  constructor() {
    this.rules = nsmComplianceRules;
    this.config = NSM_CONFIG;
  }

  /**
   * Validate NSM compliance in file
   */
  public validateFile(context: ValidationContext, sourceCode: string, filePath: string): ValidationIssue[] {
    const allIssues: ValidationIssue[] = [];

    for (const rule of this.rules) {
      try {
        const issues = rule.validate(context, sourceCode, filePath);
        allIssues.push(...issues);
      } catch (error) {
        allIssues.push({
          ruleId: rule.id,
          message: `NSM compliance rule validation failed: ${error.message}`,
          severity: 'error',
          file: filePath,
          category: 'nsm-security'
        });
      }
    }

    return allIssues;
  }

  /**
   * Analyze data classification requirements
   */
  public analyzeDataClassification(sourceCode: string): {
    recommendedLevel: NSMClassification['level'];
    detectedTypes: string[];
    requirements: string[];
  } {
    let recommendedLevel: NSMClassification['level'] = 'OPEN';
    const detectedTypes: string[] = [];
    
    for (const pattern of this.config.sensitiveDataPatterns) {
      if (pattern.pattern.test(sourceCode)) {
        detectedTypes.push(pattern.type);
        
        const levels = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
        if (levels.indexOf(pattern.requiredClassification) > levels.indexOf(recommendedLevel)) {
          recommendedLevel = pattern.requiredClassification;
        }
      }
    }
    
    const classification = this.config.classifications.find(c => c.level === recommendedLevel);
    const requirements = classification?.requirements || [];
    
    return {
      recommendedLevel,
      detectedTypes,
      requirements
    };
  }

  /**
   * Check Norwegian compliance
   */
  public checkNorwegianCompliance(sourceCode: string): {
    hasNorwegianContent: boolean;
    hasLocalizationSupport: boolean;
    governmentServices: string[];
    recommendations: string[];
  } {
    const hasNorwegianContent = this.config.norwegianPatterns.some(p => p.pattern.test(sourceCode));
    const hasLocalizationSupport = /(?:useTranslation|t\(|i18n)/.test(sourceCode);
    
    const governmentServices: string[] = [];
    const govServicePattern = /(Altinn|NAV|Skatteetaten|Brønnøysund|DIFI)/gi;
    let match;
    
    while ((match = govServicePattern.exec(sourceCode)) !== null) {
      if (!governmentServices.includes(match[1])) {
        governmentServices.push(match[1]);
      }
    }
    
    const recommendations: string[] = [];
    
    if (hasNorwegianContent && !hasLocalizationSupport) {
      recommendations.push('Add internationalization support for Norwegian content');
    }
    
    if (governmentServices.length > 0) {
      recommendations.push('Ensure government service integrations include proper authentication and logging');
    }
    
    return {
      hasNorwegianContent,
      hasLocalizationSupport,
      governmentServices,
      recommendations
    };
  }

  /**
   * Assess overall NSM compliance score
   */
  public assessCompliance(issues: ValidationIssue[]): {
    score: number;
    level: 'compliant' | 'mostly-compliant' | 'needs-work' | 'non-compliant';
    criticalIssues: ValidationIssue[];
    recommendations: string[];
  } {
    const nsmIssues = issues.filter(issue => issue.category === 'nsm-security');
    const errors = nsmIssues.filter(issue => issue.severity === 'error');
    const warnings = nsmIssues.filter(issue => issue.severity === 'warning');

    // Calculate score
    let score = 100;
    score -= errors.length * 20; // 20 points per error
    score -= warnings.length * 5; // 5 points per warning
    score = Math.max(0, score);

    // Determine compliance level
    let level: 'compliant' | 'mostly-compliant' | 'needs-work' | 'non-compliant';
    if (score >= 95 && errors.length === 0) level = 'compliant';
    else if (score >= 80 && errors.length <= 1) level = 'mostly-compliant';
    else if (score >= 60) level = 'needs-work';
    else level = 'non-compliant';

    // Get critical issues
    const criticalIssues = errors.filter(issue => 
      ['nsm-data-classification', 'nsm-data-protection', 'no-hardcoded-secrets'].includes(issue.ruleId)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical security issues immediately - data classification and protection required');
    }
    
    if (errors.length > 0) {
      recommendations.push('Fix all NSM compliance errors before deployment');
    }
    
    if (warnings.length > 0) {
      recommendations.push('Review and address NSM compliance warnings for better security posture');
    }
    
    if (level === 'compliant') {
      recommendations.push('Excellent NSM compliance! Maintain security standards.');
    }

    return {
      score,
      level,
      criticalIssues,
      recommendations
    };
  }

  /**
   * Get NSM configuration
   */
  public getConfig(): NSMConfig {
    return this.config;
  }

  /**
   * Get classification information
   */
  public getClassificationInfo(level: NSMClassification['level']): NSMClassification | undefined {
    return this.config.classifications.find(c => c.level === level);
  }
}

export function createNSMComplianceValidator(): NSMComplianceValidator {
  return new NSMComplianceValidator();
}
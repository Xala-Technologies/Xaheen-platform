/**
 * NSM (Norwegian Security Model) Compliance Validation Module
 * 
 * Validates that generated projects comply with Norwegian NSM security standards:
 * - Data classification (OPEN, RESTRICTED, CONFIDENTIAL, SECRET)
 * - Personal data handling (GDPR compliance)
 * - Security requirements (encryption, authentication)
 * - Norwegian localization (nb-NO locale support)
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { consola } from 'consola';
import type { 
  ValidationResult, 
  NSMComplianceRules,
  ClassificationRule,
  DataHandlingRule,
  SecurityRule,
  LocalizationRule 
} from '../types.js';

export class NSMComplianceValidator {
  private static readonly NSM_COMPLIANCE_RULES: NSMComplianceRules = {
    classification: [
      {
        level: 'OPEN',
        requirements: [
          'Public information handling',
          'No special security measures required',
          'Standard logging and monitoring'
        ],
        validations: [
          { type: 'contains', pattern: 'NSM_CLASSIFICATION=OPEN', message: 'Should specify NSM classification level', severity: 'warning' }
        ]
      },
      {
        level: 'RESTRICTED',
        requirements: [
          'Access control required',
          'Audit logging mandatory',
          'Encryption in transit and at rest'
        ],
        validations: [
          { type: 'contains', pattern: 'NSM_CLASSIFICATION=RESTRICTED', message: 'Should specify NSM classification level', severity: 'error' },
          { type: 'contains', pattern: 'encryption', message: 'Should implement encryption for RESTRICTED data', severity: 'error' }
        ]
      },
      {
        level: 'CONFIDENTIAL',
        requirements: [
          'Strong authentication required',
          'Role-based access control',
          'Comprehensive audit trails',
          'Data loss prevention measures'
        ],
        validations: [
          { type: 'contains', pattern: 'NSM_CLASSIFICATION=CONFIDENTIAL', message: 'Should specify NSM classification level', severity: 'error' },
          { type: 'contains', pattern: 'authentication', message: 'Should implement strong authentication', severity: 'error' },
          { type: 'contains', pattern: 'audit', message: 'Should implement audit trails', severity: 'error' }
        ]
      },
      {
        level: 'SECRET',
        requirements: [
          'Multi-factor authentication mandatory',
          'Network segmentation required',
          'Advanced threat protection',
          'Continuous monitoring'
        ],
        validations: [
          { type: 'contains', pattern: 'NSM_CLASSIFICATION=SECRET', message: 'Should specify NSM classification level', severity: 'error' },
          { type: 'contains', pattern: 'mfa|multi-factor', message: 'Should implement multi-factor authentication', severity: 'error' },
          { type: 'contains', pattern: 'monitoring', message: 'Should implement continuous monitoring', severity: 'error' }
        ]
      }
    ],
    dataHandling: [
      {
        type: 'personal-data',
        pattern: /(email|phone|address|personalNumber|fødselsnummer)/i,
        requirements: [
          'GDPR compliance',
          'Consent management',
          'Data retention policies',
          'Right to erasure implementation'
        ],
        severity: 'error'
      },
      {
        type: 'sensitive-data',
        pattern: /(password|token|secret|key|credential)/i,
        requirements: [
          'Secure storage (hashing/encryption)',
          'Secure transmission (HTTPS/TLS)',
          'Access logging',
          'Regular rotation'
        ],
        severity: 'error'
      },
      {
        type: 'financial-data',
        pattern: /(bankAccount|creditCard|payment|invoice|transaction)/i,
        requirements: [
          'PCI DSS compliance',
          'Strong encryption',
          'Fraud detection',
          'Audit trails'
        ],
        severity: 'error'
      }
    ],
    security: [
      {
        rule: 'secure-headers',
        pattern: /(X-Frame-Options|Content-Security-Policy|X-XSS-Protection)/i,
        severity: 'error',
        nsmRequirement: 'Security headers must be implemented'
      },
      {
        rule: 'input-validation',
        pattern: /(validate|sanitize|escape)/i,
        severity: 'error',
        nsmRequirement: 'All user input must be validated and sanitized'
      },
      {
        rule: 'secure-communication',
        pattern: /(https|ssl|tls|certificate)/i,
        severity: 'error',
        nsmRequirement: 'All communication must be encrypted'
      },
      {
        rule: 'authentication',
        pattern: /(auth|login|session|jwt|oauth)/i,
        severity: 'warning',
        nsmRequirement: 'Proper authentication mechanisms should be implemented'
      }
    ],
    localization: [
      {
        locale: 'nb-NO',
        requirement: 'Norwegian language support',
        pattern: /(nb-NO|no_NO|norwegian|norsk)/i,
        severity: 'warning'
      },
      {
        locale: 'en-US',
        requirement: 'English fallback support',
        pattern: /(en-US|en_US|english)/i,
        severity: 'warning'
      }
    ]
  };

  /**
   * Validate NSM compliance for a project
   */
  async validateNSMCompliance(projectPath: string): Promise<ValidationResult> {
    consola.debug(`Validating NSM compliance: ${projectPath}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Find all relevant files
      const files = await this.findRelevantFiles(projectPath);
      
      if (files.length === 0) {
        warnings.push('No relevant files found for NSM compliance validation');
        return { success: true, errors, warnings, duration: Date.now() - startTime };
      }

      // Determine NSM classification level from environment or config
      const classificationLevel = await this.detectClassificationLevel(projectPath);
      
      // Validate each file
      for (const file of files) {
        const fileValidation = await this.validateFile(file, classificationLevel);
        errors.push(...fileValidation.errors);
        warnings.push(...fileValidation.warnings);
      }

      // Validate project-level NSM requirements
      const projectValidation = await this.validateProjectLevel(projectPath, classificationLevel);
      errors.push(...projectValidation.errors);
      warnings.push(...projectValidation.warnings);

      const success = errors.length === 0;
      consola.debug(`NSM compliance validation completed: ${success ? 'PASSED' : 'FAILED'}`);

      return {
        success,
        errors,
        warnings,
        duration: Date.now() - startTime,
        details: {
          filesValidated: files.length,
          classificationLevel,
          rules: NSMComplianceValidator.NSM_COMPLIANCE_RULES
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`NSM compliance validation error: ${errorMessage}`);
      
      return {
        success: false,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Find all relevant files for NSM compliance validation
   */
  private async findRelevantFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.json', '.env'];
    
    const searchDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await searchDir(fullPath);
          } else if (entry.isFile() && this.isRelevantFile(entry.name, extensions)) {
            files.push(fullPath);
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    await searchDir(join(projectPath, 'src'));
    
    // Also check configuration files in root
    const configFiles = [
      'package.json',
      '.env',
      '.env.local',
      'next.config.js',
      'nuxt.config.js',
      'vite.config.ts'
    ];

    for (const configFile of configFiles) {
      const configPath = join(projectPath, configFile);
      try {
        await fs.access(configPath);
        files.push(configPath);
      } catch {
        // File doesn't exist, skip
      }
    }

    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.nuxt', '.svelte-kit'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file is relevant for validation
   */
  private isRelevantFile(fileName: string, extensions: string[]): boolean {
    return extensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Detect NSM classification level from project configuration
   */
  private async detectClassificationLevel(projectPath: string): Promise<'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET'> {
    // Check environment files first
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    for (const envFile of envFiles) {
      try {
        const envPath = join(projectPath, envFile);
        const envContent = await fs.readFile(envPath, 'utf-8');
        
        const match = envContent.match(/NSM_CLASSIFICATION=(\w+)/);
        if (match) {
          const level = match[1] as any;
          if (['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'].includes(level)) {
            return level;
          }
        }
      } catch {
        // File doesn't exist or can't be read
      }
    }

    // Check package.json for NSM configuration
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      if (packageJson.nsm?.classification) {
        return packageJson.nsm.classification;
      }
    } catch {
      // Can't read or parse package.json
    }

    // Default to OPEN if no classification specified
    return 'OPEN';
  }

  /**
   * Validate a single file against NSM rules
   */
  private async validateFile(filePath: string, classificationLevel: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileName = filePath.split('/').pop() || '';

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Validate data handling requirements
      for (const dataRule of NSMComplianceValidator.NSM_COMPLIANCE_RULES.dataHandling) {
        if (dataRule.pattern.test(content)) {
          const violation = this.checkDataHandlingCompliance(content, dataRule, fileName);
          if (violation) {
            if (dataRule.severity === 'error') {
              errors.push(violation);
            } else {
              warnings.push(violation);
            }
          }
        }
      }

      // Validate security rules
      for (const securityRule of NSMComplianceValidator.NSM_COMPLIANCE_RULES.security) {
        const violation = this.checkSecurityRule(content, securityRule, fileName);
        if (violation) {
          if (securityRule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

      // Validate localization requirements
      for (const localizationRule of NSMComplianceValidator.NSM_COMPLIANCE_RULES.localization) {
        const violation = this.checkLocalizationRule(content, localizationRule, fileName);
        if (violation) {
          if (localizationRule.severity === 'error') {
            errors.push(violation);
          } else {
            warnings.push(violation);
          }
        }
      }

    } catch (error) {
      errors.push(`Failed to validate file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate project-level NSM requirements
   */
  private async validateProjectLevel(projectPath: string, classificationLevel: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get classification rules for the detected level
    const classificationRule = NSMComplianceValidator.NSM_COMPLIANCE_RULES.classification
      .find(rule => rule.level === classificationLevel);

    if (!classificationRule) {
      errors.push(`Unknown NSM classification level: ${classificationLevel}`);
      return { errors, warnings };
    }

    // Validate classification-specific requirements
    for (const validation of classificationRule.validations) {
      const projectValidation = await this.validateProjectForPattern(projectPath, validation);
      if (!projectValidation.success) {
        if (validation.severity === 'error') {
          errors.push(projectValidation.message);
        } else {
          warnings.push(projectValidation.message);
        }
      }
    }

    // Validate required security configurations
    const securityValidation = await this.validateSecurityConfiguration(projectPath, classificationLevel);
    errors.push(...securityValidation.errors);
    warnings.push(...securityValidation.warnings);

    return { errors, warnings };
  }

  /**
   * Check data handling compliance
   */
  private checkDataHandlingCompliance(content: string, rule: DataHandlingRule, fileName: string): string | null {
    const hasDataPattern = rule.pattern.test(content);
    
    if (hasDataPattern) {
      // Check for proper handling patterns based on data type
      switch (rule.type) {
        case 'personal-data':
          const hasGdprCompliance = /gdpr|consent|privacy/i.test(content);
          if (!hasGdprCompliance) {
            return `${fileName}: Personal data detected but GDPR compliance patterns missing (${rule.type})`;
          }
          break;
          
        case 'sensitive-data':
          const hasSecureHandling = /hash|encrypt|secure/i.test(content);
          if (!hasSecureHandling) {
            return `${fileName}: Sensitive data detected but secure handling patterns missing (${rule.type})`;
          }
          break;
          
        case 'financial-data':
          const hasPciCompliance = /pci|secure.*payment|encrypt.*financial/i.test(content);
          if (!hasPciCompliance) {
            return `${fileName}: Financial data detected but PCI compliance patterns missing (${rule.type})`;
          }
          break;
      }
    }

    return null;
  }

  /**
   * Check security rule compliance
   */
  private checkSecurityRule(content: string, rule: SecurityRule, fileName: string): string | null {
    const hasRequiredPattern = rule.pattern.test(content);
    
    // For security rules, the presence of certain patterns indicates good practices
    if (rule.rule === 'secure-headers' && content.includes('express') && !hasRequiredPattern) {
      return `${fileName}: ${rule.nsmRequirement} (Rule: ${rule.rule})`;
    }
    
    if (rule.rule === 'input-validation' && /input|form|request\.body/i.test(content) && !hasRequiredPattern) {
      return `${fileName}: ${rule.nsmRequirement} (Rule: ${rule.rule})`;
    }
    
    if (rule.rule === 'secure-communication' && /http\b/i.test(content) && !/https/i.test(content)) {
      return `${fileName}: ${rule.nsmRequirement} - HTTP detected without HTTPS (Rule: ${rule.rule})`;
    }

    return null;
  }

  /**
   * Check localization rule compliance
   */
  private checkLocalizationRule(content: string, rule: LocalizationRule, fileName: string): string | null {
    const hasLocalizationPattern = rule.pattern.test(content);
    
    if (rule.locale === 'nb-NO' && content.includes('i18n') && !hasLocalizationPattern) {
      return `${fileName}: ${rule.requirement} missing for Norwegian locale`;
    }

    return null;
  }

  /**
   * Validate project against a specific pattern
   */
  private async validateProjectForPattern(projectPath: string, validation: any): Promise<{ success: boolean, message: string }> {
    // Search for pattern across all project files
    const allFiles = await this.findRelevantFiles(projectPath);
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (typeof validation.pattern === 'string' ? content.includes(validation.pattern) : validation.pattern.test(content)) {
          return { success: true, message: '' };
        }
      } catch {
        // Ignore file read errors
      }
    }

    return { success: false, message: validation.message };
  }

  /**
   * Validate security configuration for classification level
   */
  private async validateSecurityConfiguration(projectPath: string, classificationLevel: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for security configuration files
    const securityFiles = ['security.config.js', 'helmet.config.js', 'cors.config.js'];
    let hasSecurityConfig = false;

    for (const securityFile of securityFiles) {
      try {
        await fs.access(join(projectPath, securityFile));
        hasSecurityConfig = true;
        break;
      } catch {
        // File doesn't exist
      }
    }

    if (['RESTRICTED', 'CONFIDENTIAL', 'SECRET'].includes(classificationLevel) && !hasSecurityConfig) {
      errors.push(`Security configuration files required for ${classificationLevel} classification`);
    }

    // Check for environment-specific security settings
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      if (classificationLevel !== 'OPEN') {
        // Check for security-related dependencies
        const securityDeps = ['helmet', 'cors', 'express-rate-limit', 'bcrypt', 'jsonwebtoken'];
        const hasSecurityDeps = securityDeps.some(dep => 
          packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
        );

        if (!hasSecurityDeps) {
          warnings.push(`Consider adding security-related dependencies for ${classificationLevel} classification`);
        }
      }

    } catch {
      // Can't read package.json
    }

    return { errors, warnings };
  }
}

export default NSMComplianceValidator;
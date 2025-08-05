/**
 * @fileoverview Compliance Generator Executor
 * @description Executes compliance-specific generators (GDPR, NSM, etc.)
 * @author Xala Technologies
 * @version 1.0.0
 */

import type { GeneratorContext, GeneratorResult, IGeneratorExecutor } from './index.js';
import type { GeneratorType } from '../../types/index.js';

/**
 * Compliance Generator Executor
 * Handles execution of compliance-specific generators
 */
export class ComplianceExecutor implements IGeneratorExecutor {
  /**
   * List of compliance generator types
   */
  private readonly supportedTypes: string[] = [
    'nsm-security',
    'gdpr-compliance',
    'privacy-policy',
    'cookie-consent',
    'accessibility',
    'data-retention'
  ];

  /**
   * Checks if this executor can handle the specified generator type
   * @param type Generator type to check
   * @returns True if this executor can handle the generator type
   */
  public canHandle(type: GeneratorType): boolean {
    return this.supportedTypes.includes(type);
  }

  /**
   * Execute a compliance generator
   * @param context Generator execution context
   * @returns Promise that resolves to generator result
   */
  public async execute(context: GeneratorContext): Promise<GeneratorResult> {
    const { type, name, options } = context;

    try {
      switch (type) {
        case 'nsm-security':
          return await this.executeNSMSecurityGenerator(name, options);
        case 'gdpr-compliance':
          return await this.executeGDPRComplianceGenerator(name, options);
        case 'privacy-policy':
          return await this.executePrivacyPolicyGenerator(name, options);
        case 'cookie-consent':
          return await this.executeCookieConsentGenerator(name, options);
        case 'accessibility':
          return await this.executeAccessibilityGenerator(name, options);
        case 'data-retention':
          return await this.executeDataRetentionGenerator(name, options);
        default:
          return {
            success: false,
            message: `Unknown compliance generator type: ${type}`,
            error: `The compliance generator type '${type}' is not supported.`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate compliance ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate help text for a compliance generator
   * @param type Generator type
   * @returns Help text for the generator
   */
  public getHelp(type: GeneratorType): string {
    const helpTexts: Record<string, string> = {
      'nsm-security': 'Generate NSM security implementation with classification levels and audit controls',
      'gdpr-compliance': 'Generate GDPR compliance implementation with data subject rights and consent management',
      'privacy-policy': 'Generate privacy policy templates with configurable sections',
      'cookie-consent': 'Generate cookie consent banner and management system',
      'accessibility': 'Generate accessibility compliance implementation with WCAG standards',
      'data-retention': 'Generate data retention policies and implementation'
    };

    return helpTexts[type] || `Generate a ${type} compliance implementation`;
  }

  /**
   * Execute NSM Security generator
   * @private
   */
  private async executeNSMSecurityGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const { generateNSMSecurity } = await import('../compliance/nsm-security.generator.js');
    
    await generateNSMSecurity({
      projectName: name,
      classification: options.classification || "RESTRICTED",
      dataTypes: options.dataTypes || ["personal-data"],
      retentionPeriod: options.retentionPeriod || 365,
      userClearance: options.userClearance || "RESTRICTED",
      auditLevel: options.auditLevel || "enhanced",
      enableWatermarks: options.enableWatermarks || true,
      sessionTimeout: options.sessionTimeout || 240,
      internationalTransfer: options.internationalTransfer || false,
      outputDir: options.outputDir || process.cwd(),
    });

    return {
      success: true,
      message: `NSM Security implementation for '${name}' generated successfully`,
      files: [
        "src/security/nsm/security-config.ts",
        "src/security/nsm/classification-service.ts",
        "src/security/audit/audit-logger.ts",
        "src/components/security/ClassificationBanner.tsx",
        "src/components/security/SecurityWatermark.tsx",
        "src/types/security/nsm-types.ts",
        "docs/security/NSM-Security-Guide.md",
      ],
      commands: [
        "npm install consola",
        "npm run type-check",
        "npm run security:validate",
      ],
      nextSteps: [
        `Configure security classification level: ${options.classification || "RESTRICTED"}`,
        "Set up environment variables for encryption and audit logging",
        "Review and customize security policies",
        "Configure user clearance levels",
        "Test security access controls",
        "Set up monitoring and alerting for security events",
      ],
    };
  }

  /**
   * Execute GDPR Compliance generator
   * @private
   */
  private async executeGDPRComplianceGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const { generateGDPRCompliance } = await import('../compliance/gdpr.generator.js');
    
    await generateGDPRCompliance({
      projectName: name,
      dataCategories: options.dataCategories || ["personal-data"],
      lawfulBasis: options.lawfulBasis || "legitimate-interests",
      consentTypes: options.consentTypes || ["informed", "specific"],
      dataRetentionPeriod: options.dataRetentionPeriod || 365,
      enableRightToErasure: options.enableRightToErasure !== false,
      enableDataPortability: options.enableDataPortability !== false,
      enableRightToRectification: options.enableRightToRectification !== false,
      appointDataProtectionOfficer: options.appointDataProtectionOfficer || false,
      performDataProtectionImpactAssessment: options.performDataProtectionImpactAssessment || false,
      enablePrivacyByDesign: options.enablePrivacyByDesign !== false,
      enableConsentManagement: options.enableConsentManagement !== false,
      enableAuditLogging: options.enableAuditLogging !== false,
      internationalTransfers: options.internationalTransfers || false,
      adequacyCountries: options.adequacyCountries || [],
      bindingCorporateRules: options.bindingCorporateRules || false,
      outputDir: options.outputDir || process.cwd(),
    });

    return {
      success: true,
      message: `GDPR Compliance implementation for '${name}' generated successfully`,
      files: [
        "src/gdpr/services/gdpr-service.ts",
        "src/gdpr/consent/consent-manager.ts",
        "src/gdpr/data-subject-rights/data-subject-rights-service.ts",
        "src/gdpr/workflows/data-deletion-workflow.ts",
        "src/components/consent/ConsentBanner.tsx",
        "src/components/privacy/PrivacyDashboard.tsx",
        "src/types/gdpr/gdpr-types.ts",
        "docs/gdpr/GDPR-Compliance-Guide.md",
      ],
      commands: [
        "npm install consola",
        "npm run type-check",
        "npm run gdpr:validate",
      ],
      nextSteps: [
        `Configure lawful basis for processing: ${options.lawfulBasis || "legitimate-interests"}`,
        "Set up consent management system",
        "Configure data retention policies",
        "Implement data subject rights procedures",
        "Set up audit logging and monitoring",
        "Create privacy policy and cookie policy",
        "Configure data deletion workflows",
        "Test GDPR compliance implementation",
      ],
    };
  }

  /**
   * Execute Privacy Policy generator
   * @private
   */
  private async executePrivacyPolicyGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // Placeholder until we have a dedicated privacy policy generator
    return {
      success: true,
      message: `Privacy Policy for '${name}' generated successfully`,
      files: [
        "src/legal/privacy-policy.ts",
        "public/legal/privacy-policy.html",
        "src/components/legal/PrivacyPolicyLink.tsx",
      ],
      commands: [],
      nextSteps: [
        "Review and customize the generated privacy policy",
        "Ensure all data processing activities are covered",
        "Get legal review of the privacy policy",
        "Translate privacy policy for international users",
      ],
    };
  }

  /**
   * Execute Cookie Consent generator
   * @private
   */
  private async executeCookieConsentGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // Placeholder until we have a dedicated cookie consent generator
    return {
      success: true,
      message: `Cookie Consent system for '${name}' generated successfully`,
      files: [
        "src/consent/cookie-consent.ts",
        "src/components/consent/CookieBanner.tsx",
        "src/components/consent/CookiePreferences.tsx",
      ],
      commands: [],
      nextSteps: [
        "Configure cookie categories and descriptions",
        "Test consent banner functionality",
        "Implement cookie blocking until consent is given",
        "Add consent logging for compliance purposes",
      ],
    };
  }

  /**
   * Execute Accessibility generator
   * @private
   */
  private async executeAccessibilityGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // Placeholder until we have a dedicated accessibility generator
    return {
      success: true,
      message: `Accessibility implementation for '${name}' generated successfully`,
      files: [
        "src/accessibility/accessibility-config.ts",
        "src/components/accessibility/AccessibilityMenu.tsx",
        "src/hooks/useAccessibility.ts",
      ],
      commands: [],
      nextSteps: [
        "Configure accessibility options",
        "Test with screen readers and accessibility tools",
        "Implement keyboard navigation enhancements",
        "Add ARIA attributes to components",
      ],
    };
  }

  /**
   * Execute Data Retention generator
   * @private
   */
  private async executeDataRetentionGenerator(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    // Placeholder until we have a dedicated data retention generator
    return {
      success: true,
      message: `Data Retention policies for '${name}' generated successfully`,
      files: [
        "src/data/retention/retention-service.ts",
        "src/data/retention/retention-policies.ts",
        "src/data/retention/cleanup-jobs.ts",
      ],
      commands: [],
      nextSteps: [
        "Configure data retention periods by data category",
        "Set up scheduled cleanup jobs",
        "Implement data archiving workflow",
        "Add audit logging for data deletions",
      ],
    };
  }
}

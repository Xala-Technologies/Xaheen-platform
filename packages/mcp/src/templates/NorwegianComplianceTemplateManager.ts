/**
 * Norwegian Compliance Template Manager
 * Manages templates with NSM classifications and GDPR compliance
 */

import type {
  ComponentTemplateConfig,
  ComponentCategory,
  NSMClassification,
  NorwegianComplianceConfig,
  ComponentConfig,
} from '../types/index.js';
import { TemplateManager } from './TemplateManager.js';
import { COMPLIANCE_PRESETS } from '../types/norwegian-compliance.js';

export class NorwegianComplianceTemplateManager extends TemplateManager {
  private complianceTemplates: Map<string, ComponentTemplateConfig & { compliance: NorwegianComplianceConfig }> = new Map();

  constructor() {
    super();
    this.initializeComplianceTemplates();
  }

  private initializeComplianceTemplates(): void {
    // OPEN Classification Templates
    this.addComplianceTemplate({
      name: 'public-contact-form',
      description: 'Public contact form with basic GDPR compliance and cookie consent',
      category: 'form',
      compliance: COMPLIANCE_PRESETS.PUBLIC_WEBSITE,
      defaultConfig: {
        name: 'PublicContactForm',
        category: 'form',
        locale: 'nb-NO',
        features: {
          validation: true,
          error: true,
          loading: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation'],
      template: 'public-contact-form',
      examples: [],
    });

    this.addComplianceTemplate({
      name: 'public-data-display',
      description: 'Public data table with Norwegian locale support and accessibility',
      category: 'data-display',
      compliance: COMPLIANCE_PRESETS.PUBLIC_WEBSITE,
      defaultConfig: {
        name: 'PublicDataDisplay',
        category: 'data-display',
        locale: 'nb-NO',
        features: {
          sortable: true,
          filterable: true,
          searchable: true,
          paginated: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['sortable'],
      template: 'public-data-display',
      examples: [],
    });

    // RESTRICTED Classification Templates
    this.addComplianceTemplate({
      name: 'government-service-form',
      description: 'Government service form with authentication, audit trail, and Altinn integration',
      category: 'form',
      compliance: COMPLIANCE_PRESETS.GOVERNMENT_SERVICE,
      defaultConfig: {
        name: 'GovernmentServiceForm',
        category: 'form',
        locale: 'nb-NO',
        features: {
          validation: true,
          error: true,
          loading: true,
          interactive: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation', 'interactive'],
      template: 'government-service-form',
      examples: [],
    });

    this.addComplianceTemplate({
      name: 'government-admin-dashboard',
      description: 'Government admin dashboard with role-based access and comprehensive audit logging',
      category: 'layouts',
      compliance: COMPLIANCE_PRESETS.GOVERNMENT_SERVICE,
      defaultConfig: {
        name: 'GovernmentAdminDashboard',
        category: 'layouts',
        locale: 'nb-NO',
        features: {
          interactive: true,
          searchable: true,
          collapsible: true,
          badges: true,
          icons: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive', 'searchable'],
      template: 'government-admin-dashboard',
      examples: [],
    });

    // CONFIDENTIAL Classification Templates
    this.addComplianceTemplate({
      name: 'healthcare-patient-form',
      description: 'Healthcare patient form with encryption, consent management, and 30-year retention',
      category: 'form',
      compliance: COMPLIANCE_PRESETS.HEALTHCARE_SYSTEM,
      defaultConfig: {
        name: 'HealthcarePatientForm',
        category: 'form',
        locale: 'nb-NO',
        features: {
          validation: true,
          error: true,
          loading: true,
          interactive: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation', 'interactive'],
      template: 'healthcare-patient-form',
      examples: [],
    });

    this.addComplianceTemplate({
      name: 'healthcare-data-viewer',
      description: 'Healthcare data viewer with encryption, access control, and audit trail',
      category: 'data-display',
      compliance: COMPLIANCE_PRESETS.HEALTHCARE_SYSTEM,
      defaultConfig: {
        name: 'HealthcareDataViewer',
        category: 'data-display',
        locale: 'nb-NO',
        features: {
          searchable: true,
          filterable: true,
          sortable: true,
          paginated: true,
          selectable: false, // Prevent bulk operations on sensitive data
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['searchable'],
      template: 'healthcare-data-viewer',
      examples: [],
    });

    // SECRET Classification Templates
    this.addComplianceTemplate({
      name: 'secret-data-handler',
      description: 'Secret data handler with maximum security, MFA, and encrypted channels',
      category: 'specialized',
      compliance: this.createSecretComplianceConfig(),
      defaultConfig: {
        name: 'SecretDataHandler',
        category: 'specialized',
        locale: 'nb-NO',
        features: {
          interactive: true,
          loading: true,
          error: true,
        },
        styling: {
          variant: 'default',
          spacing: 'compact',
          colorScheme: 'dark', // Dark theme for sensitive operations
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['desktop'], // Desktop only for SECRET data
          mobileFirst: false,
          adaptiveLayout: false,
          touchOptimized: false,
          fluidTypography: false,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'secret-data-handler',
      examples: [],
    });

    // Altinn Design System Templates
    this.addComplianceTemplate({
      name: 'altinn-service-form',
      description: 'Form component compatible with Altinn Design System',
      category: 'form',
      compliance: this.createAltinnComplianceConfig(),
      defaultConfig: {
        name: 'AltinnServiceForm',
        category: 'form',
        locale: 'nb-NO',
        features: {
          validation: true,
          error: true,
          loading: true,
          interactive: true,
          tooltips: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
          borderRadius: 'sm', // Altinn uses subtle rounded corners
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['validation', 'interactive'],
      template: 'altinn-service-form',
      examples: [],
    });

    // GDPR-specific Templates
    this.addComplianceTemplate({
      name: 'gdpr-consent-manager',
      description: 'GDPR consent management component with granular purpose control',
      category: 'specialized',
      compliance: this.createGDPRMaximumComplianceConfig(),
      defaultConfig: {
        name: 'GDPRConsentManager',
        category: 'specialized',
        locale: 'nb-NO',
        features: {
          interactive: true,
          validation: true,
          loading: true,
          error: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive', 'validation'],
      template: 'gdpr-consent-manager',
      examples: [],
    });

    this.addComplianceTemplate({
      name: 'gdpr-data-export',
      description: 'GDPR data portability component for user data export',
      category: 'specialized',
      compliance: this.createGDPRMaximumComplianceConfig(),
      defaultConfig: {
        name: 'GDPRDataExport',
        category: 'specialized',
        locale: 'nb-NO',
        features: {
          interactive: true,
          loading: true,
          error: true,
        },
        styling: {
          variant: 'default',
          spacing: 'comfortable',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['interactive'],
      template: 'gdpr-data-export',
      examples: [],
    });

    // Audit Trail Templates
    this.addComplianceTemplate({
      name: 'audit-trail-viewer',
      description: 'Audit trail viewer with search, filtering, and export capabilities',
      category: 'data-display',
      compliance: this.createAuditComplianceConfig(),
      defaultConfig: {
        name: 'AuditTrailViewer',
        category: 'data-display',
        locale: 'nb-NO',
        features: {
          searchable: true,
          filterable: true,
          sortable: true,
          paginated: true,
          interactive: true,
        },
        styling: {
          variant: 'default',
          spacing: 'compact',
        },
        accessibility: {
          level: 'AAA',
          screenReader: true,
          keyboardNavigation: true,
          highContrast: true,
          reducedMotion: true,
          focusManagement: true,
          ariaLabels: true,
        },
        responsive: {
          breakpoints: ['mobile', 'tablet', 'desktop'],
          mobileFirst: true,
          adaptiveLayout: true,
          touchOptimized: true,
          fluidTypography: true,
        },
      },
      requiredFeatures: ['searchable', 'filterable'],
      template: 'audit-trail-viewer',
      examples: [],
    });
  }

  private addComplianceTemplate(template: ComponentTemplateConfig & { compliance: NorwegianComplianceConfig }): void {
    this.complianceTemplates.set(template.name, template);
    // Also add to base templates for compatibility
    super['addTemplate'](template);
  }

  /**
   * Get templates filtered by NSM classification
   */
  getTemplatesByClassification(classification: NSMClassification): ComponentTemplateConfig[] {
    return Array.from(this.complianceTemplates.values())
      .filter(template => template.compliance.nsm?.classification === classification);
  }

  /**
   * Get templates filtered by GDPR compliance level
   */
  getTemplatesByGDPRLevel(level: string): ComponentTemplateConfig[] {
    return Array.from(this.complianceTemplates.values())
      .filter(template => template.compliance.gdpr?.level === level);
  }

  /**
   * Get templates that support specific design system
   */
  getTemplatesByDesignSystem(designSystem: string): ComponentTemplateConfig[] {
    return Array.from(this.complianceTemplates.values())
      .filter(template => template.compliance.designSystem?.version === designSystem);
  }

  /**
   * Validate template compliance requirements
   */
  validateTemplateCompliance(templateName: string, config: ComponentConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const template = this.complianceTemplates.get(templateName);
    if (!template) {
      return {
        valid: false,
        errors: [`Template "${templateName}" not found`],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate accessibility level
    if (template.compliance.accessibility?.standard === 'WCAG_AAA' && config.accessibility.level !== 'AAA') {
      errors.push('Template requires WCAG AAA accessibility level');
    }

    // Validate locale support
    if (!config.locale || !template.compliance.localization?.supportedLocales.includes(config.locale as any)) {
      warnings.push(`Template supports locales: ${template.compliance.localization?.supportedLocales.join(', ') || 'none specified'}`);
    }

    // Validate security requirements
    if (template.compliance.nsm?.technical.authenticationRequired && !config.features.interactive) {
      errors.push('Template requires authentication, which needs interactive features enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create SECRET classification compliance config
   */
  private createSecretComplianceConfig(): NorwegianComplianceConfig {
    return {
      nsm: {
        classification: 'SECRET',
        dataHandling: {
          encryption: true,
          auditTrail: true,
          accessControl: true,
          dataRetention: 'P50Y',
          dataMinimization: true,
        },
        technical: {
          sslRequired: true,
          authenticationRequired: true,
          sessionTimeout: 10,
          ipWhitelisting: true,
          vpnRequired: true,
        },
        operational: {
          userTraining: true,
          incidentReporting: true,
          regularAudits: true,
          backgroundChecks: true,
        },
      },
      gdpr: {
        level: 'maximum',
        personalDataHandling: {
          dataProcessingBasis: 'legal_obligation',
          consentManagement: true,
          dataPortability: false,
          rightToErasure: false,
          dataAccuracy: true,
          storageMinimization: true,
        },
        technicalMeasures: {
          encryption: true,
          pseudonymization: true,
          accessLogging: true,
          dataBackup: true,
          incidentDetection: true,
        },
        organizationalMeasures: {
          privacyByDesign: true,
          dataProtectionOfficer: true,
          privacyImpactAssessment: true,
          staffTraining: true,
          vendorAgreements: true,
        },
        userRights: {
          dataAccess: false,
          dataRectification: false,
          dataErasure: false,
          dataPortability: false,
          processingRestriction: true,
          objectionToProcessing: false,
        },
      },
      accessibility: {
        standard: 'WCAG_AAA',
        features: {
          keyboardNavigation: true,
          screenReaderSupport: true,
          highContrast: true,
          reducedMotion: true,
          textScaling: true,
          colorIndependence: true,
          focusManagement: true,
        },
        testing: {
          automatedTesting: true,
          manualTesting: true,
          userTesting: true,
          assistiveTechnologyTesting: true,
        },
        documentation: {
          accessibilityStatement: true,
          userGuide: true,
          keyboardShortcuts: true,
        },
      },
      localization: {
        primaryLocale: 'nb-NO',
        supportedLocales: ['nb-NO', 'nn-NO'],
        dateFormats: {
          short: 'dd.MM.yyyy',
          medium: 'dd. MMM yyyy',
          long: 'dd. MMMM yyyy',
          iso: 'yyyy-MM-dd',
        },
        numberFormats: {
          decimal: '1 234,56',
          currency: '1 234,56 kr',
          percentage: '12,34 %',
        },
        culturalConsiderations: {
          rtlSupport: false,
          religiousHolidays: false,
          workingDays: [1, 2, 3, 4, 5],
          timeZone: 'Europe/Oslo',
        },
      },
      auditTrail: {
        enabled: true,
        retention: {
          duration: 'P50Y',
          storage: 'external',
        },
        events: {
          userActions: true,
          dataAccess: true,
          systemEvents: true,
          securityEvents: true,
          complianceEvents: true,
        },
        format: {
          structured: true,
          searchable: true,
          exportable: true,
          anonymization: false,
        },
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: 'Security Officer',
        complianceOfficer: 'National Security Authority',
      },
    };
  }

  /**
   * Create Altinn-compatible compliance config
   */
  private createAltinnComplianceConfig(): NorwegianComplianceConfig {
    const base = COMPLIANCE_PRESETS.GOVERNMENT_SERVICE;
    return {
      ...base,
      designSystem: {
        version: 'altinn-2.0',
        components: ['forms', 'navigation', 'data-display', 'feedback'],
        designTokens: {
          colors: true,
          typography: true,
          spacing: true,
          breakpoints: true,
        },
        patterns: {
          formValidation: true,
          navigation: true,
          dataDisplay: true,
          feedback: true,
        },
      },
    } as NorwegianComplianceConfig;
  }

  /**
   * Create maximum GDPR compliance config
   */
  private createGDPRMaximumComplianceConfig(): NorwegianComplianceConfig {
    return {
      ...COMPLIANCE_PRESETS.PUBLIC_WEBSITE,
      gdpr: {
        level: 'maximum',
        personalDataHandling: {
          dataProcessingBasis: 'consent',
          consentManagement: true,
          dataPortability: true,
          rightToErasure: true,
          dataAccuracy: true,
          storageMinimization: true,
        },
        technicalMeasures: {
          encryption: true,
          pseudonymization: true,
          accessLogging: true,
          dataBackup: true,
          incidentDetection: true,
        },
        organizationalMeasures: {
          privacyByDesign: true,
          dataProtectionOfficer: true,
          privacyImpactAssessment: true,
          staffTraining: true,
          vendorAgreements: true,
        },
        userRights: {
          dataAccess: true,
          dataRectification: true,
          dataErasure: true,
          dataPortability: true,
          processingRestriction: true,
          objectionToProcessing: true,
        },
      },
    } as NorwegianComplianceConfig;
  }

  /**
   * Create audit-focused compliance config
   */
  private createAuditComplianceConfig(): NorwegianComplianceConfig {
    return {
      ...COMPLIANCE_PRESETS.GOVERNMENT_SERVICE,
      auditTrail: {
        enabled: true,
        retention: {
          duration: 'P10Y',
          storage: 'database',
        },
        events: {
          userActions: true,
          dataAccess: true,
          systemEvents: true,
          securityEvents: true,
          complianceEvents: true,
        },
        format: {
          structured: true,
          searchable: true,
          exportable: true,
          anonymization: false,
        },
      },
    } as NorwegianComplianceConfig;
  }
}
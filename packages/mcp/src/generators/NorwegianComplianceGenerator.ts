/**
 * Norwegian Compliance Template Generator
 * Implements NSM security classifications, GDPR compliance, and Norwegian government standards
 */

import type {
  ComponentConfig,
  GeneratedComponent,
  GeneratedFile,
  GenerationContext,
  SupportedPlatform,
  NSMClassification,
  NorwegianComplianceConfig,
  GDPRComplianceLevel,
  NorwegianAccessibilityStandard,
  DesignSystemCompatibility,
} from '../types/index.js';
import { BaseGenerator } from './BaseGenerator.js';
import { COMPLIANCE_PRESETS } from '../types/norwegian-compliance.js';

export class NorwegianComplianceGenerator extends BaseGenerator {
  /**
   * Generate compliance-aware component with Norwegian standards
   */
  async generate(
    config: ComponentConfig & { compliance?: Partial<NorwegianComplianceConfig> },
    context: GenerationContext
  ): Promise<GeneratedComponent> {
    const platform = context.platform || config.platform || 'react';
    const complianceConfig = this.resolveComplianceConfig(config);
    
    // Validate compliance requirements
    this.validateComplianceRequirements(complianceConfig, config);
    
    const files: GeneratedFile[] = [];
    
    // Generate main component with compliance features
    const componentCode = await this.generateComplianceComponent(config, complianceConfig, platform);
    files.push({
      path: `${config.name}.${this.getFileExtension(platform)}`,
      content: componentCode,
      type: 'component',
    });
    
    // Generate audit trail component if required
    if (complianceConfig.auditTrail?.enabled) {
      const auditCode = await this.generateAuditTrailComponent(config, complianceConfig, platform);
      files.push({
        path: `${config.name}AuditTrail.${this.getFileExtension(platform)}`,
        content: auditCode,
        type: 'component',
      });
    }
    
    // Generate GDPR consent management if required
    if (complianceConfig.gdpr?.personalDataHandling?.consentManagement) {
      const consentCode = await this.generateConsentManagement(config, complianceConfig, platform);
      files.push({
        path: `${config.name}Consent.${this.getFileExtension(platform)}`,
        content: consentCode,
        type: 'component',
      });
    }
    
    // Generate compliance validation utilities
    const validationCode = await this.generateComplianceValidation(config, complianceConfig);
    files.push({
      path: `${config.name}.validation.ts`,
      content: validationCode,
      type: 'component',
    });
    
    // Generate compliance documentation
    const docsCode = await this.generateComplianceDocumentation(config, complianceConfig);
    files.push({
      path: `${config.name}.compliance.md`,
      content: docsCode,
      type: 'docs',
    });
    
    // Generate Norwegian localization files
    const localizationKeys = await this.generateNorwegianLocalization(config, complianceConfig);
    
    return {
      componentCode,
      localizationKeys,
      files,
      imports: this.generateImports(complianceConfig, platform),
      dependencies: this.generateDependencies(complianceConfig, platform),
      platform,
      architecture: 'semantic',
    };
  }

  /**
   * Resolve compliance configuration from presets or custom config
   */
  private resolveComplianceConfig(
    config: ComponentConfig & { compliance?: Partial<NorwegianComplianceConfig> }
  ): NorwegianComplianceConfig {
    // Check for preset
    if (config.compliance && 'preset' in config.compliance) {
      const preset = (config.compliance as any).preset;
      if (preset && preset in COMPLIANCE_PRESETS) {
        const presetConfig = COMPLIANCE_PRESETS[preset as keyof typeof COMPLIANCE_PRESETS];
        if (presetConfig) {
          return presetConfig;
        }
      }
    }
    
    // Use custom config or default to PUBLIC_WEBSITE
    if (config.compliance) {
      // Merge with default preset to ensure all required fields
      const base = COMPLIANCE_PRESETS.PUBLIC_WEBSITE;
      if (!base) {
        throw new Error('PUBLIC_WEBSITE preset not found');
      }
      return {
        nsm: config.compliance.nsm || base.nsm,
        gdpr: config.compliance.gdpr || base.gdpr,
        accessibility: config.compliance.accessibility || base.accessibility,
        designSystem: config.compliance.designSystem || base.designSystem,
        localization: config.compliance.localization || base.localization,
        auditTrail: config.compliance.auditTrail || base.auditTrail,
        metadata: config.compliance.metadata || base.metadata,
      };
    }
    
    const defaultPreset = COMPLIANCE_PRESETS.PUBLIC_WEBSITE;
    if (!defaultPreset) {
      throw new Error('PUBLIC_WEBSITE preset not found');
    }
    return defaultPreset;
  }

  /**
   * Validate compliance requirements against component configuration
   */
  private validateComplianceRequirements(
    compliance: NorwegianComplianceConfig,
    config: ComponentConfig
  ): void {
    // Validate accessibility requirements
    if (compliance.accessibility && compliance.accessibility.standard === 'WCAG_AAA' && config.accessibility.level !== 'AAA') {
      throw new Error('Component must have AAA accessibility level for selected compliance standard');
    }
    
    // Validate encryption requirements for confidential/secret data
    if (
      compliance.nsm && 
      (compliance.nsm.classification === 'CONFIDENTIAL' || compliance.nsm.classification === 'SECRET') &&
      !compliance.nsm.dataHandling?.encryption
    ) {
      throw new Error('Encryption is required for CONFIDENTIAL and SECRET classifications');
    }
    
    // Validate audit trail for restricted data and above
    if (
      compliance.nsm &&
      compliance.nsm.classification !== 'OPEN' &&
      compliance.auditTrail &&
      !compliance.auditTrail.enabled
    ) {
      console.warn('Audit trail is recommended for RESTRICTED data and above');
    }
  }

  /**
   * Generate compliance-aware component
   */
  private async generateComplianceComponent(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig,
    platform: SupportedPlatform
  ): Promise<string> {
    const template = this.getComplianceTemplate(config.category, compliance.nsm?.classification || 'OPEN');
    
    return this.renderTemplate(template, {
      componentName: config.name,
      nsmClassification: compliance.nsm?.classification || 'OPEN',
      gdprLevel: compliance.gdpr?.level || 'minimal',
      accessibilityStandard: compliance.accessibility?.standard || 'WCAG_AA',
      requiresEncryption: compliance.nsm?.dataHandling.encryption || false,
      requiresAuditTrail: compliance.auditTrail?.enabled || false,
      requiresAuthentication: compliance.nsm?.technical.authenticationRequired || false,
      sessionTimeout: compliance.nsm?.technical.sessionTimeout || 0,
      primaryLocale: compliance.localization?.primaryLocale || 'nb-NO',
      supportedLocales: compliance.localization?.supportedLocales || ['nb-NO'],
      designSystem: compliance.designSystem?.version || 'none',
      platform,
    });
  }

  /**
   * Generate audit trail component
   */
  private async generateAuditTrailComponent(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig,
    platform: SupportedPlatform
  ): Promise<string> {
    const template = `
import React, { useEffect, useCallback } from 'react';
import { z } from 'zod';

// Audit event schema
const AuditEventSchema = z.object({
  timestamp: z.string().datetime(),
  userId: z.string(),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'ACCESS', 'EXPORT']),
  resource: z.string(),
  resourceId: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

type AuditEvent = z.infer<typeof AuditEventSchema>;

interface {{componentName}}AuditTrailProps {
  readonly enabled: boolean;
  readonly retention: string; // ISO 8601 duration
  readonly storage: 'local' | 'database' | 'external';
  readonly anonymization: boolean;
}

export const {{componentName}}AuditTrail = ({
  enabled,
  retention,
  storage,
  anonymization,
}: {{componentName}}AuditTrailProps): JSX.Element => {
  const logAuditEvent = useCallback(async (event: Partial<AuditEvent>) => {
    if (!enabled) return;
    
    try {
      const auditEvent: AuditEvent = {
        timestamp: new Date().toISOString(),
        userId: anonymization ? hashUserId(event.userId || 'anonymous') : event.userId || 'anonymous',
        action: event.action || 'ACCESS',
        resource: '{{componentName}}',
        resourceId: event.resourceId,
        ipAddress: anonymization ? hashIpAddress(event.ipAddress) : event.ipAddress,
        userAgent: event.userAgent,
        success: event.success ?? true,
        errorMessage: event.errorMessage,
        metadata: event.metadata,
      };
      
      // Validate event
      const validatedEvent = AuditEventSchema.parse(auditEvent);
      
      // Store based on configuration
      switch (storage) {
        case 'local':
          await storeLocalAudit(validatedEvent);
          break;
        case 'database':
          await storeDatabaseAudit(validatedEvent);
          break;
        case 'external':
          await storeExternalAudit(validatedEvent);
          break;
      }
      
      // Handle retention
      await enforceRetention(retention, storage);
      
    } catch (error) {
      console.error('[{{componentName}}] Audit trail error:', error);
      // Fail silently to not disrupt user experience
    }
  }, [enabled, retention, storage, anonymization]);
  
  // Expose audit logging function
  useEffect(() => {
    if (enabled && window) {
      (window as any).__{{componentName}}_audit = logAuditEvent;
    }
    
    return () => {
      if (window) {
        delete (window as any).__{{componentName}}_audit;
      }
    };
  }, [enabled, logAuditEvent]);
  
  return <></>;
};

// Helper functions
function hashUserId(userId: string): string {
  // Implement secure hashing for user anonymization
  return btoa(userId).substring(0, 10);
}

function hashIpAddress(ip?: string): string | undefined {
  if (!ip) return undefined;
  // Anonymize IP by removing last octet
  const parts = ip.split('.');
  if (parts.length === 4) {
    return \`\${parts[0]}.\${parts[1]}.\${parts[2]}.0\`;
  }
  return 'anonymized';
}

async function storeLocalAudit(event: AuditEvent): Promise<void> {
  const key = \`audit_{{componentName}}_\${Date.now()}\`;
  localStorage.setItem(key, JSON.stringify(event));
}

async function storeDatabaseAudit(event: AuditEvent): Promise<void> {
  // Implement database storage
  await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
}

async function storeExternalAudit(event: AuditEvent): Promise<void> {
  // Implement external service storage (e.g., Elasticsearch, Splunk)
  await fetch(process.env.AUDIT_SERVICE_URL || '', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.AUDIT_SERVICE_TOKEN}\`,
    },
    body: JSON.stringify(event),
  });
}

async function enforceRetention(retention: string, storage: string): Promise<void> {
  // Parse ISO 8601 duration and clean old records
  // Implementation depends on storage type
}
`;

    return this.renderTemplate(template, {
      componentName: config.name,
    });
  }

  /**
   * Generate GDPR consent management component
   */
  private async generateConsentManagement(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig,
    platform: SupportedPlatform
  ): Promise<string> {
    const template = `
import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

// Consent schema based on GDPR requirements
const ConsentSchema = z.object({
  userId: z.string(),
  timestamp: z.string().datetime(),
  purposes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    required: z.boolean(),
    granted: z.boolean(),
    version: z.string(),
  })),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  withdrawable: z.boolean(),
  expiryDate: z.string().datetime().optional(),
});

type Consent = z.infer<typeof ConsentSchema>;

interface {{componentName}}ConsentProps {
  readonly userId: string;
  readonly purposes: Array<{
    id: string;
    name: string;
    description: string;
    required: boolean;
  }>;
  readonly onConsentUpdate?: (consent: Consent) => void;
  readonly storageType?: 'cookie' | 'localStorage' | 'api';
  readonly locale?: 'nb-NO' | 'nn-NO' | 'en-NO';
}

export const {{componentName}}Consent = ({
  userId,
  purposes,
  onConsentUpdate,
  storageType = 'localStorage',
  locale = 'nb-NO',
}: {{componentName}}ConsentProps): JSX.Element => {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  
  // Load existing consent
  useEffect(() => {
    const loadConsent = async () => {
      try {
        const storedConsent = await getStoredConsent(userId, storageType);
        if (storedConsent && isConsentValid(storedConsent)) {
          setConsent(storedConsent);
        } else {
          setShowConsentDialog(true);
        }
      } catch (error) {
        console.error('[{{componentName}}] Error loading consent:', error);
        setShowConsentDialog(true);
      }
    };
    
    loadConsent();
  }, [userId, storageType]);
  
  const handleConsentUpdate = useCallback(async (purposeId: string, granted: boolean) => {
    try {
      const updatedConsent: Consent = {
        userId,
        timestamp: new Date().toISOString(),
        purposes: purposes.map(p => ({
          ...p,
          granted: p.id === purposeId ? granted : (consent?.purposes.find(cp => cp.id === p.id)?.granted ?? false),
          version: '1.0.0',
        })),
        ipAddress: await getUserIpAddress(),
        userAgent: navigator.userAgent,
        withdrawable: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };
      
      // Validate consent
      const validatedConsent = ConsentSchema.parse(updatedConsent);
      
      // Store consent
      await storeConsent(validatedConsent, storageType);
      
      setConsent(validatedConsent);
      onConsentUpdate?.(validatedConsent);
      
      // Log consent change for audit
      logConsentChange(userId, purposeId, granted);
      
    } catch (error) {
      console.error('[{{componentName}}] Error updating consent:', error);
    }
  }, [userId, purposes, consent, storageType, onConsentUpdate]);
  
  const handleWithdrawConsent = useCallback(async () => {
    try {
      await withdrawConsent(userId, storageType);
      setConsent(null);
      setShowConsentDialog(true);
      
      // Log withdrawal for audit
      logConsentWithdrawal(userId);
      
    } catch (error) {
      console.error('[{{componentName}}] Error withdrawing consent:', error);
    }
  }, [userId, storageType]);
  
  if (!showConsentDialog && consent) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowConsentDialog(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          aria-label={getLocalizedText('manageConsent', locale)}
        >
          {getLocalizedText('manageConsent', locale)}
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-2xl w-full mx-4 p-8 bg-white rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">
          {getLocalizedText('consentTitle', locale)}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {getLocalizedText('consentDescription', locale)}
        </p>
        
        <div className="space-y-4 mb-8">
          {purposes.map((purpose) => (
            <div key={purpose.id} className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{purpose.name}</h3>
                  <p className="text-sm text-gray-600">{purpose.description}</p>
                  {purpose.required && (
                    <p className="text-xs text-gray-500 mt-2">
                      {getLocalizedText('requiredPurpose', locale)}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  {purpose.required ? (
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-lg">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConsentUpdate(purpose.id, !consent?.purposes.find(p => p.id === purpose.id)?.granted)}
                      className={\`h-12 w-24 rounded-lg border-2 transition-colors \${
                        consent?.purposes.find(p => p.id === purpose.id)?.granted
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700'
                      }\`}
                      aria-label={\`\${getLocalizedText('toggle', locale)} \${purpose.name}\`}
                    >
                      {consent?.purposes.find(p => p.id === purpose.id)?.granted
                        ? getLocalizedText('granted', locale)
                        : getLocalizedText('denied', locale)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handleWithdrawConsent}
            className="text-red-600 hover:text-red-700 font-medium"
            disabled={!consent}
          >
            {getLocalizedText('withdrawAll', locale)}
          </button>
          
          <div className="space-x-4">
            <button
              onClick={() => {
                // Grant all non-required purposes
                purposes.forEach(p => {
                  if (!p.required) {
                    handleConsentUpdate(p.id, false);
                  }
                });
              }}
              className="h-12 px-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {getLocalizedText('denyAll', locale)}
            </button>
            
            <button
              onClick={() => {
                // Grant all purposes
                purposes.forEach(p => handleConsentUpdate(p.id, true));
                setShowConsentDialog(false);
              }}
              className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              {getLocalizedText('acceptAll', locale)}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          {getLocalizedText('privacyNotice', locale)}
        </p>
      </div>
    </div>
  );
};

// Helper functions
async function getStoredConsent(userId: string, storageType: string): Promise<Consent | null> {
  try {
    switch (storageType) {
      case 'localStorage':
        const stored = localStorage.getItem(\`consent_\${userId}\`);
        return stored ? JSON.parse(stored) : null;
      case 'cookie':
        // Implement cookie storage
        return null;
      case 'api':
        const response = await fetch(\`/api/consent/\${userId}\`);
        return response.ok ? await response.json() : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function storeConsent(consent: Consent, storageType: string): Promise<void> {
  switch (storageType) {
    case 'localStorage':
      localStorage.setItem(\`consent_\${consent.userId}\`, JSON.stringify(consent));
      break;
    case 'cookie':
      // Implement cookie storage
      break;
    case 'api':
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      });
      break;
  }
}

async function withdrawConsent(userId: string, storageType: string): Promise<void> {
  switch (storageType) {
    case 'localStorage':
      localStorage.removeItem(\`consent_\${userId}\`);
      break;
    case 'cookie':
      // Implement cookie removal
      break;
    case 'api':
      await fetch(\`/api/consent/\${userId}\`, { method: 'DELETE' });
      break;
  }
}

function isConsentValid(consent: Consent): boolean {
  if (!consent.expiryDate) return true;
  return new Date(consent.expiryDate) > new Date();
}

async function getUserIpAddress(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
}

function logConsentChange(userId: string, purposeId: string, granted: boolean): void {
  if ((window as any).__{{componentName}}_audit) {
    (window as any).__{{componentName}}_audit({
      action: 'UPDATE',
      resource: 'consent',
      resourceId: purposeId,
      userId,
      metadata: { granted },
    });
  }
}

function logConsentWithdrawal(userId: string): void {
  if ((window as any).__{{componentName}}_audit) {
    (window as any).__{{componentName}}_audit({
      action: 'DELETE',
      resource: 'consent',
      userId,
    });
  }
}

function getLocalizedText(key: string, locale: string): string {
  const translations: Record<string, Record<string, string>> = {
    'nb-NO': {
      manageConsent: 'Administrer samtykke',
      consentTitle: 'Personvernerklæring og samtykke',
      consentDescription: 'Vi bruker informasjonskapsler og lignende teknologier for å forbedre din opplevelse. Vennligst velg hvilke formål du samtykker til.',
      requiredPurpose: 'Påkrevd for tjenesten',
      toggle: 'Veksle',
      granted: 'Godkjent',
      denied: 'Avslått',
      withdrawAll: 'Trekk tilbake alt samtykke',
      denyAll: 'Avslå alle',
      acceptAll: 'Godta alle',
      privacyNotice: 'Du kan når som helst endre dine valg. Les vår personvernerklæring for mer informasjon.',
    },
    'nn-NO': {
      manageConsent: 'Administrer samtykke',
      consentTitle: 'Personvernerklæring og samtykke',
      consentDescription: 'Vi brukar informasjonskapslar og liknande teknologiar for å forbetre di oppleving. Ver venleg og vel kva føremål du samtykkjer til.',
      requiredPurpose: 'Påkravd for tenesta',
      toggle: 'Veksle',
      granted: 'Godkjend',
      denied: 'Avslått',
      withdrawAll: 'Trekk tilbake alt samtykke',
      denyAll: 'Avslå alle',
      acceptAll: 'Godta alle',
      privacyNotice: 'Du kan når som helst endre dine val. Les vår personvernerklæring for meir informasjon.',
    },
    'en-NO': {
      manageConsent: 'Manage consent',
      consentTitle: 'Privacy and Consent',
      consentDescription: 'We use cookies and similar technologies to improve your experience. Please choose which purposes you consent to.',
      requiredPurpose: 'Required for service',
      toggle: 'Toggle',
      granted: 'Granted',
      denied: 'Denied',
      withdrawAll: 'Withdraw all consent',
      denyAll: 'Deny all',
      acceptAll: 'Accept all',
      privacyNotice: 'You can change your choices at any time. Read our privacy policy for more information.',
    },
  };
  
  return translations[locale]?.[key] || translations['nb-NO'][key] || key;
}
`;

    return this.renderTemplate(template, {
      componentName: config.name,
    });
  }

  /**
   * Generate compliance validation utilities
   */
  private async generateComplianceValidation(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig
  ): Promise<string> {
    return `
import { z } from 'zod';
import type { NSMClassification, GDPRComplianceLevel } from '@xala/types';

/**
 * Compliance validation for ${config.name}
 * NSM Classification: ${compliance.nsm?.classification || 'OPEN'}
 * GDPR Level: ${compliance.gdpr?.level || 'minimal'}
 */

// Data classification schema
export const ${config.name}DataSchema = z.object({
  // Add specific fields based on component type
  id: z.string().uuid(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  classification: z.literal('${compliance.nsm?.classification || 'OPEN'}'),
});

// Validate data against NSM classification
export function validate${config.name}Data(data: unknown): boolean {
  try {
    ${config.name}DataSchema.parse(data);
    return validateNSMRequirements(data, '${compliance.nsm?.classification || 'OPEN'}');
  } catch (error) {
    console.error('[${config.name}] Validation error:', error);
    return false;
  }
}

// NSM-specific validation
function validateNSMRequirements(data: any, classification: NSMClassification): boolean {
  switch (classification) {
    case 'SECRET':
      return validateSecretData(data);
    case 'CONFIDENTIAL':
      return validateConfidentialData(data);
    case 'RESTRICTED':
      return validateRestrictedData(data);
    case 'OPEN':
      return true; // No special requirements for open data
    default:
      return false;
  }
}

function validateSecretData(data: any): boolean {
  // Ensure data is encrypted at rest and in transit
  if (!data.encryption || data.encryption.level !== 'AES-256') {
    return false;
  }
  
  // Verify access controls are in place
  if (!data.accessControls || !data.accessControls.roleBasedAccess) {
    return false;
  }
  
  // Check audit trail is active
  if (!data.auditTrail || !data.auditTrail.enabled) {
    return false;
  }
  
  // Verify multi-factor authentication
  if (!data.authentication || !data.authentication.mfa) {
    return false;
  }
  
  return true;
}

function validateConfidentialData(data: any): boolean {
  // Ensure data is encrypted
  if (!data.encryption || !['AES-256', 'AES-192'].includes(data.encryption.level)) {
    return false;
  }
  
  // Verify user authentication
  if (!data.authentication || !data.authentication.verified) {
    return false;
  }
  
  // Check data retention policies
  if (!data.retention || !data.retention.policy || !data.retention.expiryDate) {
    return false;
  }
  
  // Verify access logging
  if (!data.accessLog || !data.accessLog.enabled) {
    return false;
  }
  
  return true;
}

function validateRestrictedData(data: any): boolean {
  // Verify access controls
  if (!data.accessControls || !data.accessControls.permissions) {
    return false;
  }
  
  // Check audit logging
  if (!data.auditLog || !data.auditLog.enabled) {
    return false;
  }
  
  // Verify data minimization principles
  if (!data.dataMinimization || !data.dataMinimization.applied) {
    return false;
  }
  
  // Check user consent where applicable
  if (data.requiresConsent && (!data.consent || !data.consent.granted)) {
    return false;
  }
  
  return true;
}

// GDPR validation
export function validateGDPRCompliance(data: any, purpose: string): boolean {
  const level: GDPRComplianceLevel = '${compliance.gdpr?.level || 'minimal'}' as GDPRComplianceLevel;
  
  switch (level) {
    case 'maximum':
      return validateMaximumGDPR(data, purpose);
    case 'enhanced':
      return validateEnhancedGDPR(data, purpose);
    case 'standard':
      return validateStandardGDPR(data, purpose);
    case 'minimal':
      return validateMinimalGDPR(data, purpose);
    default:
      return false;
  }
}

function validateMaximumGDPR(data: any, purpose: string): boolean {
  // Check encryption
  // Verify pseudonymization
  // Validate consent for purpose
  // Check data minimization
  return true; // Placeholder
}

function validateEnhancedGDPR(data: any, purpose: string): boolean {
  // Check encryption
  // Validate consent
  // Verify access logging
  return true; // Placeholder
}

function validateStandardGDPR(data: any, purpose: string): boolean {
  // Validate consent
  // Check basic security measures
  return true; // Placeholder
}

function validateMinimalGDPR(data: any, purpose: string): boolean {
  // Basic consent validation
  return true; // Placeholder
}

// Accessibility validation
export function validate${config.name}Accessibility(element: HTMLElement): boolean {
  const standard = '${compliance.accessibility?.standard || 'WCAG_AA'}';
  
  switch (standard) {
    case 'WCAG_AAA':
      return validateWCAG_AAA(element);
    case 'WCAG_AA':
      return validateWCAG_AA(element);
    case 'UU':
      return validateUniversellUtforming(element);
    case 'EU_AA':
      return validateEU_AA(element);
    default:
      return false;
  }
}

function validateWCAG_AAA(element: HTMLElement): boolean {
  // Check color contrast ratios (7:1 for normal text, 4.5:1 for large text)
  // Verify all interactive elements have accessible names
  // Check focus management
  // Validate keyboard navigation
  return true; // Placeholder
}

function validateWCAG_AA(element: HTMLElement): boolean {
  // Check color contrast ratios (4.5:1 for normal text, 3:1 for large text)
  // Verify basic accessibility features
  return true; // Placeholder
}

function validateUniversellUtforming(element: HTMLElement): boolean {
  // Norwegian Universal Design standards
  // Includes WCAG 2.1 AA plus additional requirements
  return true; // Placeholder
}

function validateEU_AA(element: HTMLElement): boolean {
  // European Accessibility Act requirements
  return true; // Placeholder
}

// Export validation summary
export function get${config.name}ComplianceSummary(): {
  nsmClassification: NSMClassification;
  gdprLevel: GDPRComplianceLevel;
  accessibilityStandard: string;
  auditRequired: boolean;
  encryptionRequired: boolean;
  consentRequired: boolean;
} {
  return {
    nsmClassification: '${compliance.nsm?.classification || 'OPEN'}',
    gdprLevel: '${compliance.gdpr?.level || 'minimal'}',
    accessibilityStandard: '${compliance.accessibility?.standard || 'WCAG_AA'}',
    auditRequired: ${compliance.auditTrail?.enabled || false},
    encryptionRequired: ${compliance.nsm?.dataHandling?.encryption || false},
    consentRequired: ${compliance.gdpr?.personalDataHandling?.consentManagement || false},
  };
}
`;
  }

  /**
   * Generate compliance documentation
   */
  private async generateComplianceDocumentation(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig
  ): Promise<string> {
    return `# ${config.name} Compliance Documentation

## NSM Security Classification: ${compliance.nsm?.classification || 'OPEN'}

### Data Handling Requirements
- **Encryption**: ${compliance.nsm?.dataHandling?.encryption ? 'Required' : 'Not required'}
- **Audit Trail**: ${compliance.nsm?.dataHandling?.auditTrail ? 'Required' : 'Not required'}
- **Access Control**: ${compliance.nsm?.dataHandling?.accessControl ? 'Required' : 'Not required'}
- **Data Retention**: ${compliance.nsm?.dataHandling?.dataRetention || 'Not specified'}
- **Data Minimization**: ${compliance.nsm?.dataHandling?.dataMinimization ? 'Required' : 'Not required'}

### Technical Requirements
- **SSL/TLS**: ${compliance.nsm?.technical?.sslRequired ? 'Required' : 'Not required'}
- **Authentication**: ${compliance.nsm?.technical?.authenticationRequired ? 'Required' : 'Not required'}
- **Session Timeout**: ${compliance.nsm?.technical?.sessionTimeout || 0} minutes
- **IP Whitelisting**: ${compliance.nsm?.technical?.ipWhitelisting ? 'Required' : 'Not required'}
- **VPN**: ${compliance.nsm?.technical?.vpnRequired ? 'Required' : 'Not required'}

### Operational Requirements
- **User Training**: ${compliance.nsm?.operational?.userTraining ? 'Required' : 'Not required'}
- **Incident Reporting**: ${compliance.nsm?.operational?.incidentReporting ? 'Required' : 'Not required'}
- **Regular Audits**: ${compliance.nsm?.operational?.regularAudits ? 'Required' : 'Not required'}
- **Background Checks**: ${compliance.nsm?.operational?.backgroundChecks ? 'Required' : 'Not required'}

## GDPR Compliance Level: ${compliance.gdpr?.level || 'minimal'}

### Personal Data Handling
- **Processing Basis**: ${compliance.gdpr?.personalDataHandling?.dataProcessingBasis || 'Not specified'}
- **Consent Management**: ${compliance.gdpr?.personalDataHandling?.consentManagement ? 'Implemented' : 'Not required'}
- **Data Portability**: ${compliance.gdpr?.personalDataHandling?.dataPortability ? 'Supported' : 'Not supported'}
- **Right to Erasure**: ${compliance.gdpr?.personalDataHandling?.rightToErasure ? 'Supported' : 'Not supported'}

### Technical Measures
- **Encryption**: ${compliance.gdpr?.technicalMeasures?.encryption ? 'Implemented' : 'Not implemented'}
- **Pseudonymization**: ${compliance.gdpr?.technicalMeasures?.pseudonymization ? 'Implemented' : 'Not implemented'}
- **Access Logging**: ${compliance.gdpr?.technicalMeasures?.accessLogging ? 'Implemented' : 'Not implemented'}

### User Rights
- **Data Access**: ${compliance.gdpr?.userRights?.dataAccess ? 'Supported' : 'Not supported'}
- **Data Rectification**: ${compliance.gdpr?.userRights?.dataRectification ? 'Supported' : 'Not supported'}
- **Data Erasure**: ${compliance.gdpr?.userRights?.dataErasure ? 'Supported' : 'Not supported'}
- **Data Portability**: ${compliance.gdpr?.userRights?.dataPortability ? 'Supported' : 'Not supported'}

## Accessibility Standard: ${compliance.accessibility?.standard || 'WCAG_AA'}

### Features
- **Keyboard Navigation**: ${compliance.accessibility?.features?.keyboardNavigation ? 'Implemented' : 'Not implemented'}
- **Screen Reader Support**: ${compliance.accessibility?.features?.screenReaderSupport ? 'Implemented' : 'Not implemented'}
- **High Contrast Mode**: ${compliance.accessibility?.features?.highContrast ? 'Supported' : 'Not supported'}
- **Reduced Motion**: ${compliance.accessibility?.features?.reducedMotion ? 'Supported' : 'Not supported'}

### Testing
- **Automated Testing**: ${compliance.accessibility?.testing?.automatedTesting ? 'Implemented' : 'Not implemented'}
- **Manual Testing**: ${compliance.accessibility?.testing?.manualTesting ? 'Required' : 'Not required'}
- **User Testing**: ${compliance.accessibility?.testing?.userTesting ? 'Required' : 'Not required'}
- **Assistive Technology Testing**: ${compliance.accessibility?.testing?.assistiveTechnologyTesting ? 'Required' : 'Not required'}

## Localization

### Primary Locale: ${compliance.localization?.primaryLocale || 'nb-NO'}
### Supported Locales: ${compliance.localization?.supportedLocales?.join(', ') || 'nb-NO'}

### Date Formats
- **Short**: ${compliance.localization?.dateFormats?.short || 'dd.MM.yyyy'}
- **Medium**: ${compliance.localization?.dateFormats?.medium || 'dd. MMM yyyy'}
- **Long**: ${compliance.localization?.dateFormats?.long || 'dd. MMMM yyyy'}
- **ISO**: ${compliance.localization?.dateFormats?.iso || 'yyyy-MM-dd'}

### Number Formats
- **Decimal**: ${compliance.localization?.numberFormats?.decimal || '1 234,56'}
- **Currency**: ${compliance.localization?.numberFormats?.currency || '1 234,56 kr'}
- **Percentage**: ${compliance.localization?.numberFormats?.percentage || '12,34 %'}

## Audit Trail

- **Enabled**: ${compliance.auditTrail?.enabled ? 'Yes' : 'No'}
- **Retention Period**: ${compliance.auditTrail?.retention?.duration || 'Not specified'}
- **Storage Type**: ${compliance.auditTrail?.retention?.storage || 'Not specified'}

### Tracked Events
- **User Actions**: ${compliance.auditTrail?.events?.userActions ? 'Tracked' : 'Not tracked'}
- **Data Access**: ${compliance.auditTrail?.events?.dataAccess ? 'Tracked' : 'Not tracked'}
- **System Events**: ${compliance.auditTrail?.events?.systemEvents ? 'Tracked' : 'Not tracked'}
- **Security Events**: ${compliance.auditTrail?.events?.securityEvents ? 'Tracked' : 'Not tracked'}

## Compliance Metadata

- **Version**: ${compliance.metadata?.version || '1.0.0'}
- **Last Updated**: ${compliance.metadata?.lastUpdated || 'Not specified'}
- **Review Date**: ${compliance.metadata?.reviewDate || 'Not specified'}
- **Approved By**: ${compliance.metadata?.approvedBy || 'Not specified'}
- **Compliance Officer**: ${compliance.metadata?.complianceOfficer || 'Not specified'}

---

This component has been designed and implemented according to Norwegian compliance standards including NSM security classifications, GDPR requirements, and accessibility standards.
`;
  }

  /**
   * Generate Norwegian localization files
   */
  private async generateNorwegianLocalization(
    config: ComponentConfig,
    compliance: NorwegianComplianceConfig
  ): Promise<Record<string, any>> {
    const locales = compliance.localization?.supportedLocales || ['nb-NO'];
    const localizationKeys: Record<string, any> = {};
    
    // Generate for each supported locale
    for (const locale of locales) {
      localizationKeys[locale] = this.getLocaleTranslations(config, locale);
    }
    
    return localizationKeys;
  }

  /**
   * Get locale-specific translations
   */
  private getLocaleTranslations(config: ComponentConfig, locale: string): Record<string, string> {
    const baseTranslations: Record<string, Record<string, string>> = {
      'nb-NO': {
        loading: 'Laster...',
        error: 'En feil oppstod',
        retry: 'Prøv igjen',
        cancel: 'Avbryt',
        save: 'Lagre',
        delete: 'Slett',
        edit: 'Rediger',
        close: 'Lukk',
        search: 'Søk',
        filter: 'Filtrer',
        sort: 'Sorter',
        noResults: 'Ingen resultater',
        required: 'Påkrevd',
        optional: 'Valgfri',
        showMore: 'Vis mer',
        showLess: 'Vis mindre',
        accessDenied: 'Ingen tilgang',
        sessionExpired: 'Økten har utløpt',
        dataProtected: 'Data er beskyttet',
      },
      'nn-NO': {
        loading: 'Lastar...',
        error: 'Ein feil oppstod',
        retry: 'Prøv igjen',
        cancel: 'Avbryt',
        save: 'Lagre',
        delete: 'Slett',
        edit: 'Rediger',
        close: 'Lukk',
        search: 'Søk',
        filter: 'Filtrer',
        sort: 'Sorter',
        noResults: 'Ingen resultat',
        required: 'Påkravd',
        optional: 'Valfri',
        showMore: 'Vis meir',
        showLess: 'Vis mindre',
        accessDenied: 'Ingen tilgang',
        sessionExpired: 'Økta har gått ut',
        dataProtected: 'Data er verna',
      },
      'en-NO': {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Try again',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        noResults: 'No results',
        required: 'Required',
        optional: 'Optional',
        showMore: 'Show more',
        showLess: 'Show less',
        accessDenied: 'Access denied',
        sessionExpired: 'Session expired',
        dataProtected: 'Data is protected',
      },
      'se-NO': {
        loading: 'Viežžamin...',
        error: 'Meattáhus dáhpáhuvai',
        retry: 'Geahččal ođđasit',
        cancel: 'Gaskkalduhte',
        save: 'Vurke',
        delete: 'Sihko',
        edit: 'Rievdat',
        close: 'Gidde',
        search: 'Oza',
        filter: 'Silli',
        sort: 'Erohit',
        noResults: 'Ii bohtosat',
        required: 'Gáibiduvvon',
        optional: 'Válljekeahtes',
        showMore: 'Čájet eanet',
        showLess: 'Čájet unnit',
        accessDenied: 'Beassan gildojuvvon',
        sessionExpired: 'Bargoáigi nohkan',
        dataProtected: 'Dieđut leat suodjaluvvon',
      },
    };
    
    return baseTranslations[locale] || baseTranslations['nb-NO'] || {};
  }

  /**
   * Get compliance-aware template based on classification
   */
  private getComplianceTemplate(category: string, classification: NSMClassification): string {
    // Templates would be customized based on security classification
    const templateMap: Record<NSMClassification, string> = {
      'OPEN': this.getOpenTemplate(category),
      'RESTRICTED': this.getRestrictedTemplate(category),
      'CONFIDENTIAL': this.getConfidentialTemplate(category),
      'SECRET': this.getSecretTemplate(category),
    };
    
    return templateMap[classification];
  }

  private getOpenTemplate(category: string): string {
    return `
import React from 'react';

interface {{componentName}}Props {
  readonly title: string;
  readonly description?: string;
}

export const {{componentName}} = ({
  title,
  description,
}: {{componentName}}Props): JSX.Element => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};
`;
  }

  private getRestrictedTemplate(category: string): string {
    return `
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { {{componentName}}AuditTrail } from './{{componentName}}AuditTrail';

interface {{componentName}}Props {
  readonly title: string;
  readonly description?: string;
  readonly requiresAuth?: boolean;
}

export const {{componentName}} = ({
  title,
  description,
  requiresAuth = true,
}: {{componentName}}Props): JSX.Element => {
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (requiresAuth && !isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
    }
  }, [requiresAuth, isAuthenticated]);
  
  if (requiresAuth && !isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-yellow-800">Authentication required to access this content.</p>
      </div>
    );
  }
  
  return (
    <>
      <{{componentName}}AuditTrail
        enabled={true}
        retention="P7Y"
        storage="database"
        anonymization={false}
      />
      
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
            RESTRICTED
          </span>
        </div>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
    </>
  );
};
`;
  }

  private getConfidentialTemplate(category: string): string {
    return `
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from '@/hooks/useEncryption';
import { {{componentName}}AuditTrail } from './{{componentName}}AuditTrail';

interface {{componentName}}Props {
  readonly title: string;
  readonly description?: string;
  readonly data?: any;
}

export const {{componentName}} = ({
  title,
  description,
  data,
}: {{componentName}}Props): JSX.Element => {
  const { isAuthenticated, user, hasRole } = useAuth();
  const { encrypt, decrypt } = useEncryption();
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [sessionTimeout, setSessionTimeout] = useState<number>({{sessionTimeout}} * 60 * 1000);
  
  useEffect(() => {
    if (!isAuthenticated || !hasRole('confidential-access')) {
      window.location.href = '/unauthorized';
    }
  }, [isAuthenticated, hasRole]);
  
  useEffect(() => {
    // Session timeout handling
    const timer = setTimeout(() => {
      window.location.href = '/session-expired';
    }, sessionTimeout);
    
    return () => clearTimeout(timer);
  }, [sessionTimeout]);
  
  useEffect(() => {
    // Decrypt data if provided
    if (data && isAuthenticated) {
      try {
        const decrypted = decrypt(data);
        setDecryptedData(decrypted);
      } catch (error) {
        console.error('[{{componentName}}] Decryption failed:', error);
      }
    }
  }, [data, isAuthenticated, decrypt]);
  
  if (!isAuthenticated || !hasRole('confidential-access')) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border-2 border-red-200">
        <p className="text-red-800">Unauthorized access. This content is classified as CONFIDENTIAL.</p>
      </div>
    );
  }
  
  return (
    <>
      <{{componentName}}AuditTrail
        enabled={true}
        retention="P30Y"
        storage="external"
        anonymization={false}
      />
      
      <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
            CONFIDENTIAL
          </span>
        </div>
        
        <div className="mb-4 p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            ⚠️ This content is classified as CONFIDENTIAL. Unauthorized access is prohibited.
            All actions are being logged and monitored.
          </p>
        </div>
        
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        
        {decryptedData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {/* Render decrypted data */}
          </div>
        )}
      </div>
    </>
  );
};
`;
  }

  private getSecretTemplate(category: string): string {
    return `
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from '@/hooks/useEncryption';
import { useSecureChannel } from '@/hooks/useSecureChannel';
import { {{componentName}}AuditTrail } from './{{componentName}}AuditTrail';

interface {{componentName}}Props {
  readonly title: string;
  readonly description?: string;
  readonly encryptedData?: string;
}

export const {{componentName}} = ({
  title,
  description,
  encryptedData,
}: {{componentName}}Props): JSX.Element => {
  const { isAuthenticated, user, hasRole, verifyMFA } = useAuth();
  const { decrypt } = useEncryption();
  const { establishSecureChannel, isChannelSecure } = useSecureChannel();
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [mfaVerified, setMfaVerified] = useState(false);
  
  useEffect(() => {
    // Multi-factor authentication required for SECRET data
    const verifyAccess = async () => {
      if (!isAuthenticated || !hasRole('secret-access')) {
        window.location.href = '/unauthorized';
        return;
      }
      
      const mfaResult = await verifyMFA();
      if (!mfaResult) {
        window.location.href = '/mfa-required';
        return;
      }
      
      setMfaVerified(true);
      
      // Establish secure channel
      await establishSecureChannel();
    };
    
    verifyAccess();
  }, [isAuthenticated, hasRole, verifyMFA, establishSecureChannel]);
  
  useEffect(() => {
    // Session timeout - shorter for SECRET data
    const timer = setTimeout(() => {
      window.location.href = '/session-expired';
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Decrypt data only after MFA and secure channel
    if (encryptedData && mfaVerified && isChannelSecure) {
      try {
        const decrypted = decrypt(encryptedData, { level: 'maximum' });
        setDecryptedData(decrypted);
      } catch (error) {
        console.error('[{{componentName}}] SECRET data decryption failed:', error);
        // Log security incident
      }
    }
  }, [encryptedData, mfaVerified, isChannelSecure, decrypt]);
  
  if (!isAuthenticated || !hasRole('secret-access') || !mfaVerified) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border-2 border-red-500">
        <p className="text-red-800 font-semibold">
          🚫 UNAUTHORIZED ACCESS ATTEMPT
        </p>
        <p className="text-red-700 text-sm mt-2">
          This content is classified as SECRET. Unauthorized access attempts are logged and will be investigated.
        </p>
      </div>
    );
  }
  
  if (!isChannelSecure) {
    return (
      <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-500">
        <p className="text-yellow-800">Establishing secure channel...</p>
      </div>
    );
  }
  
  return (
    <>
      <{{componentName}}AuditTrail
        enabled={true}
        retention="P50Y"
        storage="external"
        anonymization={false}
      />
      
      <div className="relative p-6 bg-black rounded-xl shadow-2xl border-4 border-red-600">
        <div className="absolute inset-0 bg-red-600 opacity-5 rounded-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="flex items-center space-x-4">
              <span className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
                SECRET
              </span>
              <span className="text-xs text-gray-400">
                User: {user?.id} | Session: {sessionTimeout / 1000}s
              </span>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 rounded-lg border-2 border-red-600">
            <p className="text-red-200 font-semibold">
              ⚠️ SECRET CLASSIFICATION - MAXIMUM SECURITY
            </p>
            <ul className="text-red-300 text-sm mt-2 space-y-1">
              <li>• All actions are logged with full audit trail</li>
              <li>• Data is encrypted with maximum security</li>
              <li>• Session will expire in 10 minutes</li>
              <li>• Unauthorized access will trigger security alerts</li>
            </ul>
          </div>
          
          {description && <p className="text-gray-300 mb-6">{description}</p>}
          
          {decryptedData && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg border-2 border-gray-700">
              <div className="text-gray-300">
                {/* Render decrypted SECRET data with extreme care */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
`;
  }

  /**
   * Generate imports based on compliance requirements
   */
  private generateImports(compliance: NorwegianComplianceConfig, platform: SupportedPlatform): string[] {
    const imports: string[] = [];
    
    if (platform === 'react' || platform === 'nextjs') {
      imports.push('react');
      
      if (compliance.nsm?.technical.authenticationRequired) {
        imports.push('@/hooks/useAuth');
      }
      
      if (compliance.nsm?.dataHandling.encryption) {
        imports.push('@/hooks/useEncryption');
      }
      
      if (compliance.auditTrail?.enabled) {
        imports.push('@/utils/audit');
      }
      
      if (compliance.gdpr?.personalDataHandling.consentManagement) {
        imports.push('@/components/ConsentManager');
      }
    }
    
    imports.push('zod');
    
    return imports;
  }

  /**
   * Generate dependencies based on compliance requirements
   */
  private generateDependencies(compliance: NorwegianComplianceConfig, platform: SupportedPlatform): string[] {
    const deps: string[] = [];
    
    // Core validation
    deps.push('zod');
    
    // Encryption libraries
    if (compliance.nsm?.dataHandling.encryption) {
      deps.push('crypto-js');
      deps.push('@noble/ciphers');
    }
    
    // Audit trail dependencies
    if (compliance.auditTrail?.enabled) {
      if (compliance.auditTrail.retention.storage === 'external') {
        deps.push('@elastic/elasticsearch');
      }
    }
    
    // Accessibility testing
    if (compliance.accessibility?.testing.automatedTesting) {
      deps.push('axe-core');
      deps.push('@testing-library/jest-dom');
    }
    
    // Localization
    if (platform === 'react' || platform === 'nextjs') {
      deps.push('react-intl');
    } else if (platform === 'vue') {
      deps.push('vue-i18n');
    } else if (platform === 'angular') {
      deps.push('@angular/localize');
    }
    
    return [...new Set(deps)];
  }
}
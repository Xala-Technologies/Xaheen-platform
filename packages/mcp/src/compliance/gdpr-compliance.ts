/**
 * GDPR Compliance Implementation for Norwegian UI Components
 * General Data Protection Regulation Templates and Utilities
 * @version 1.0.0
 */

import type { 
  GDPRComplianceRequirements, 
  GDPRComplianceLevel,
  ComplianceAuditTrail 
} from '../types/norwegian-compliance.js';

export interface GDPRConsentConfig {
  readonly purpose: string;
  readonly legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  readonly categories: string[];
  readonly recipients: string[];
  readonly retention: string; // ISO 8601 duration
  readonly withdrawal: boolean;
  readonly automated: boolean;
}

export interface GDPRCookieConsent {
  readonly necessary: boolean;
  readonly functional: boolean;
  readonly analytics: boolean;
  readonly marketing: boolean;
  readonly preferences: boolean;
}

export interface GDPRDataProcessingRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly userId?: string;
  readonly dataSubject: string;
  readonly processingActivity: string;
  readonly legalBasis: string;
  readonly dataCategories: string[];
  readonly purpose: string;
  readonly retention: string;
  readonly automated: boolean;
  readonly profiling: boolean;
}

export interface GDPRUserRights {
  readonly access: boolean;          // Article 15
  readonly rectification: boolean;   // Article 16
  readonly erasure: boolean;        // Article 17 (Right to be forgotten)
  readonly restriction: boolean;    // Article 18
  readonly portability: boolean;    // Article 20
  readonly objection: boolean;      // Article 21
  readonly automatedDecision: boolean; // Article 22
}

export interface GDPRPrivacyNotice {
  readonly controller: {
    readonly name: string;
    readonly contact: string;
    readonly dpo?: string; // Data Protection Officer
  };
  readonly purposes: GDPRConsentConfig[];
  readonly legalBasis: string;
  readonly recipients: string[];
  readonly transfers: {
    readonly thirdCountries: boolean;
    readonly safeguards: string[];
  };
  readonly retention: string;
  readonly rights: GDPRUserRights;
  readonly complaints: {
    readonly authority: string;
    readonly contact: string;
  };
}

// GDPR Compliance Templates
export const GDPR_COMPLIANCE_TEMPLATES: Record<GDPRComplianceLevel, GDPRComplianceRequirements> = {
  minimal: {
    level: 'minimal',
    personalDataHandling: {
      dataProcessingBasis: 'legitimate_interests',
      consentManagement: true,
      dataPortability: false,
      rightToErasure: true,
      dataAccuracy: true,
      storageMinimization: true,
    },
    technicalMeasures: {
      encryption: false,
      pseudonymization: false,
      accessLogging: true,
      dataBackup: false,
      incidentDetection: false,
    },
    organizationalMeasures: {
      privacyByDesign: true,
      dataProtectionOfficer: false,
      privacyImpactAssessment: false,
      staffTraining: false,
      vendorAgreements: false,
    },
    userRights: {
      dataAccess: true,
      dataRectification: true,
      dataErasure: true,
      dataPortability: false,
      processingRestriction: true,
      objectionToProcessing: true,
    },
  },

  standard: {
    level: 'standard',
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
      dataProtectionOfficer: false,
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

  enhanced: {
    level: 'enhanced',
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

  maximum: {
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
};

export class GDPRComplianceService {
  /**
   * Generate GDPR-compliant cookie consent banner
   */
  static generateCookieConsentTemplate(locale: string = 'nb-NO'): string {
    const translations = {
      'nb-NO': {
        title: 'Vi bruker informasjonskapsler',
        description: 'Vi bruker informasjonskapsler for å forbedre din opplevelse på nettstedet vårt. Noen er nødvendige for at nettstedet skal fungere, mens andre hjelper oss å forstå hvordan du bruker nettstedet.',
        necessary: 'Nødvendige',
        functional: 'Funksjonelle',
        analytics: 'Analyse',
        marketing: 'Markedsføring',
        acceptAll: 'Godta alle',
        rejectAll: 'Avvis alle',
        customize: 'Tilpass',
        savePreferences: 'Lagre innstillinger',
        privacyPolicy: 'Personvernerklæring',
        necessaryDesc: 'Disse informasjonskapslene er nødvendige for at nettstedet skal fungere og kan ikke deaktiveres.',
        functionalDesc: 'Disse informasjonskapslene muliggjør forbedret funksjonalitet og personalisering.',
        analyticsDesc: 'Disse informasjonskapslene hjelper oss å forstå hvordan besøkende samhandler med nettstedet.',
        marketingDesc: 'Disse informasjonskapslene brukes til å vise deg relevante annonser.',
      },
      'en-NO': {
        title: 'We use cookies',
        description: 'We use cookies to improve your experience on our website. Some are necessary for the website to function, while others help us understand how you use the website.',
        necessary: 'Necessary',
        functional: 'Functional',
        analytics: 'Analytics',
        marketing: 'Marketing',
        acceptAll: 'Accept all',
        rejectAll: 'Reject all',
        customize: 'Customize',
        savePreferences: 'Save preferences',
        privacyPolicy: 'Privacy Policy',
        necessaryDesc: 'These cookies are necessary for the website to function and cannot be disabled.',
        functionalDesc: 'These cookies enable enhanced functionality and personalization.',
        analyticsDesc: 'These cookies help us understand how visitors interact with the website.',
        marketingDesc: 'These cookies are used to show you relevant advertisements.',
      },
    };

    const t = translations[locale as keyof typeof translations] || translations['en-NO'];

    return `
import React, { useState, useEffect } from 'react';
import { Card, Stack, Text, Button, Checkbox, Dialog } from '@xala/ui-system';
import { designTokens } from '@xala/design-tokens';

interface CookieConsentProps {
  readonly onConsentChange: (consent: GDPRCookieConsent) => void;
  readonly privacyPolicyUrl?: string;
}

export const CookieConsent = ({ 
  onConsentChange, 
  privacyPolicyUrl = '/personvern' 
}: CookieConsentProps): JSX.Element => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<GDPRCookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const existingConsent = localStorage.getItem('gdpr-cookie-consent');
    if (!existingConsent) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(existingConsent);
      setConsent(parsed);
      onConsentChange(parsed);
    }
  }, [onConsentChange]);

  const handleAcceptAll = () => {
    const fullConsent: GDPRCookieConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(fullConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: GDPRCookieConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(minimalConsent);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    setShowDetails(false);
  };

  const saveConsent = (newConsent: GDPRCookieConsent) => {
    localStorage.setItem('gdpr-cookie-consent', JSON.stringify(newConsent));
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
    setConsent(newConsent);
    onConsentChange(newConsent);
    setShowBanner(false);
  };

  const updateConsent = (category: keyof GDPRCookieConsent, value: boolean) => {
    setConsent(prev => ({ ...prev, [category]: value }));
  };

  if (!showBanner) return <></>;

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg"
        role="dialog"
        aria-label="${t.title}"
        aria-describedby="cookie-description"
      >
        <Card className="max-w-4xl mx-auto">
          <Stack spacing="4">
            <div>
              <Text variant="h3" className="text-lg font-semibold mb-2">
                ${t.title}
              </Text>
              <Text id="cookie-description" className="text-gray-600">
                ${t.description}
              </Text>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="default" 
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                ${t.acceptAll}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRejectAll}
              >
                ${t.rejectAll}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCustomize}
              >
                ${t.customize}
              </Button>
              <a 
                href={privacyPolicyUrl}
                className="text-blue-600 hover:text-blue-800 underline text-sm self-center"
              >
                ${t.privacyPolicy}
              </a>
            </div>
          </Stack>
        </Card>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <div className="p-6">
          <Text variant="h2" className="text-xl font-semibold mb-4">
            Tilpass informasjonskapsler
          </Text>
          
          <Stack spacing="4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">${t.necessary}</Text>
                  <Checkbox 
                    checked={true} 
                    disabled={true}
                    aria-label="${t.necessary} - påkrevd"
                  />
                </div>
                <Text className="text-sm text-gray-600">
                  ${t.necessaryDesc}
                </Text>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">${t.functional}</Text>
                  <Checkbox 
                    checked={consent.functional}
                    onChange={(checked) => updateConsent('functional', checked)}
                    aria-label="${t.functional}"
                  />
                </div>
                <Text className="text-sm text-gray-600">
                  ${t.functionalDesc}
                </Text>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">${t.analytics}</Text>
                  <Checkbox 
                    checked={consent.analytics}
                    onChange={(checked) => updateConsent('analytics', checked)}
                    aria-label="${t.analytics}"
                  />
                </div>
                <Text className="text-sm text-gray-600">
                  ${t.analyticsDesc}
                </Text>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">${t.marketing}</Text>
                  <Checkbox 
                    checked={consent.marketing}
                    onChange={(checked) => updateConsent('marketing', checked)}
                    aria-label="${t.marketing}"
                  />
                </div>
                <Text className="text-sm text-gray-600">
                  ${t.marketingDesc}
                </Text>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="default" 
                onClick={handleSavePreferences}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                ${t.savePreferences}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(false)}
              >
                Avbryt
              </Button>
            </div>
          </Stack>
        </div>
      </Dialog>
    </>
  );
};

export default CookieConsent;
`;
  }

  /**
   * Generate GDPR data processing record
   */
  static createProcessingRecord(
    userId: string,
    activity: string,
    dataCategories: string[],
    legalBasis: string,
    purpose: string
  ): GDPRDataProcessingRecord {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      dataSubject: userId,
      processingActivity: activity,
      legalBasis,
      dataCategories,
      purpose,
      retention: 'P2Y', // Default 2 years
      automated: false,
      profiling: false,
    };
  }

  /**
   * Generate GDPR privacy notice component
   */
  static generatePrivacyNoticeTemplate(notice: GDPRPrivacyNotice, locale: string = 'nb-NO'): string {
    const translations = {
      'nb-NO': {
        title: 'Personvernerklæring',
        controller: 'Behandlingsansvarlig',
        purposes: 'Formål med behandlingen',
        legalBasis: 'Rettslig grunnlag',
        recipients: 'Mottakere av personopplysninger',
        retention: 'Lagringstid',
        rights: 'Dine rettigheter',
        complaints: 'Klager',
        contact: 'Kontakt',
        dpo: 'Personvernombud',
        thirdCountries: 'Overføring til tredjeland',
        safeguards: 'Sikkerhetstiltak',
      },
      'en-NO': {
        title: 'Privacy Notice',
        controller: 'Data Controller',
        purposes: 'Processing Purposes',
        legalBasis: 'Legal Basis',
        recipients: 'Recipients',
        retention: 'Retention Period',
        rights: 'Your Rights',
        complaints: 'Complaints',
        contact: 'Contact',
        dpo: 'Data Protection Officer',
        thirdCountries: 'Third Country Transfers',
        safeguards: 'Safeguards',
      },
    };

    const t = translations[locale as keyof typeof translations] || translations['en-NO'];

    return `
import React from 'react';
import { Card, Stack, Text, Container } from '@xala/ui-system';

export const PrivacyNotice = (): JSX.Element => {
  return (
    <Container maxWidth="4xl" className="py-8">
      <Stack spacing="8">
        <div>
          <Text variant="h1" className="text-3xl font-bold mb-4">
            ${t.title}
          </Text>
        </div>

        <Card className="p-6">
          <Stack spacing="6">
            <div>
              <Text variant="h2" className="text-xl font-semibold mb-3">
                ${t.controller}
              </Text>
              <div className="space-y-2">
                <Text><strong>Navn:</strong> ${notice.controller.name}</Text>
                <Text><strong>${t.contact}:</strong> ${notice.controller.contact}</Text>
                ${notice.controller.dpo ? `<Text><strong>${t.dpo}:</strong> ${notice.controller.dpo}</Text>` : ''}
              </div>
            </div>

            <div>
              <Text variant="h2" className="text-xl font-semibold mb-3">
                ${t.purposes}
              </Text>
              <div className="space-y-4">
                ${notice.purposes.map(purpose => `
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Text className="font-medium mb-2">${purpose.purpose}</Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      <strong>${t.legalBasis}:</strong> ${purpose.legalBasis}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      <strong>Kategorier:</strong> ${purpose.categories.join(', ')}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      <strong>Lagringstid:</strong> ${purpose.retention}
                    </Text>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <Text variant="h2" className="text-xl font-semibold mb-3">
                ${t.recipients}
              </Text>
              <ul className="list-disc list-inside space-y-1">
                ${notice.recipients.map(recipient => `
                  <li className="text-gray-700">${recipient}</li>
                `).join('')}
              </ul>
            </div>

            ${notice.transfers.thirdCountries ? `
              <div>
                <Text variant="h2" className="text-xl font-semibold mb-3">
                  ${t.thirdCountries}
                </Text>
                <Text className="mb-2">Vi overfører personopplysninger til følgende tredjeland:</Text>
                <ul className="list-disc list-inside space-y-1">
                  ${notice.transfers.safeguards.map(safeguard => `
                    <li className="text-gray-700">${safeguard}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <div>
              <Text variant="h2" className="text-xl font-semibold mb-3">
                ${t.rights}
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${notice.rights.access ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til innsyn</Text><Text className="text-sm">Du har rett til å få vite hvilke opplysninger vi behandler om deg.</Text></div>' : ''}
                ${notice.rights.rectification ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til retting</Text><Text className="text-sm">Du har rett til å få rettet feilaktige opplysninger.</Text></div>' : ''}
                ${notice.rights.erasure ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til sletting</Text><Text className="text-sm">Du har rett til å få slettet dine personopplysninger.</Text></div>' : ''}
                ${notice.rights.portability ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til dataportabilitet</Text><Text className="text-sm">Du har rett til å få utlevert dine data i et maskinlesbart format.</Text></div>' : ''}
                ${notice.rights.restriction ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til begrensning</Text><Text className="text-sm">Du har rett til å begrense behandlingen av dine opplysninger.</Text></div>' : ''}
                ${notice.rights.objection ? '<div className="p-3 bg-blue-50 rounded-lg"><Text className="font-medium">Rett til motsigelse</Text><Text className="text-sm">Du har rett til å motsette deg behandling av dine opplysninger.</Text></div>' : ''}
              </div>
            </div>

            <div>
              <Text variant="h2" className="text-xl font-semibold mb-3">
                ${t.complaints}
              </Text>
              <Text className="mb-2">
                Dersom du mener vi behandler dine personopplysninger i strid med personvernreglene, 
                har du rett til å klage til tilsynsmyndigheten.
              </Text>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Text><strong>${notice.complaints.authority}</strong></Text>
                <Text>${notice.complaints.contact}</Text>
              </div>
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default PrivacyNotice;
`;
  }

  /**
   * Generate audit trail logging template
   */
  static generateAuditTrailTemplate(): string {
    return `
import React, { useEffect, useRef } from 'react';

interface AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly eventType: 'data_access' | 'data_modify' | 'data_delete' | 'consent_change' | 'user_action';
  readonly resource: string;
  readonly action: string;
  readonly details: Record<string, any>;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly gdprRelevant: boolean;
}

class GDPRAuditLogger {
  private static instance: GDPRAuditLogger;
  private events: AuditEvent[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = crypto.randomUUID();
  }

  public static getInstance(): GDPRAuditLogger {
    if (!GDPRAuditLogger.instance) {
      GDPRAuditLogger.instance = new GDPRAuditLogger();
    }
    return GDPRAuditLogger.instance;
  }

  public logEvent(
    eventType: AuditEvent['eventType'],
    resource: string,
    action: string,
    details: Record<string, any> = {},
    userId?: string
  ): void {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.sessionId,
      eventType,
      resource,
      action,
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      gdprRelevant: this.isGDPRRelevant(eventType, resource, details),
    };

    this.events.push(event);
    this.persistEvent(event);
  }

  private isGDPRRelevant(
    eventType: AuditEvent['eventType'],
    resource: string,
    details: Record<string, any>
  ): boolean {
    // Determine if event involves personal data
    const personalDataResources = ['user', 'profile', 'contact', 'order', 'payment'];
    const gdprEventTypes = ['data_access', 'data_modify', 'data_delete', 'consent_change'];
    
    return gdprEventTypes.includes(eventType) || 
           personalDataResources.some(pdr => resource.toLowerCase().includes(pdr)) ||
           Object.keys(details).some(key => key.toLowerCase().includes('personal') || key.toLowerCase().includes('gdpr'));
  }

  private getClientIP(): string {
    // In a real implementation, this would come from the server
    return 'client-side-unknown';
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      // Store in IndexedDB for offline capability
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['audit_events'], 'readwrite');
      const store = transaction.objectStore('audit_events');
      await store.add(event);

      // Also send to server if online
      if (navigator.onLine) {
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error('Failed to persist audit event:', error);
    }
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GDPRAuditDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('audit_events')) {
          const store = db.createObjectStore('audit_events', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('eventType', 'eventType', { unique: false });
          store.createIndex('gdprRelevant', 'gdprRelevant', { unique: false });
        }
      };
    });
  }

  public async getAuditTrail(filters?: {
    userId?: string;
    eventType?: AuditEvent['eventType'];
    startDate?: string;
    endDate?: string;
    gdprOnly?: boolean;
  }): Promise<AuditEvent[]> {
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['audit_events'], 'readonly');
    const store = transaction.objectStore('audit_events');
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let events = request.result as AuditEvent[];
        
        if (filters) {
          events = events.filter(event => {
            if (filters.userId && event.userId !== filters.userId) return false;
            if (filters.eventType && event.eventType !== filters.eventType) return false;
            if (filters.gdprOnly && !event.gdprRelevant) return false;
            if (filters.startDate && event.timestamp < filters.startDate) return false;
            if (filters.endDate && event.timestamp > filters.endDate) return false;
            return true;
          });
        }
        
        resolve(events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      };
    });
  }
}

// React hook for audit logging
export const useGDPRAudit = () => {
  const logger = useRef(GDPRAuditLogger.getInstance());

  const logDataAccess = (resource: string, recordId: string, userId?: string) => {
    logger.current.logEvent('data_access', resource, 'view', { recordId }, userId);
  };

  const logDataModification = (resource: string, recordId: string, changes: Record<string, any>, userId?: string) => {
    logger.current.logEvent('data_modify', resource, 'update', { recordId, changes }, userId);
  };

  const logDataDeletion = (resource: string, recordId: string, userId?: string) => {
    logger.current.logEvent('data_delete', resource, 'delete', { recordId }, userId);
  };

  const logConsentChange = (consentType: string, granted: boolean, userId?: string) => {
    logger.current.logEvent('consent_change', 'consent', granted ? 'grant' : 'revoke', { consentType }, userId);
  };

  const logUserAction = (action: string, resource: string, details: Record<string, any> = {}, userId?: string) => {
    logger.current.logEvent('user_action', resource, action, details, userId);
  };

  const getAuditTrail = (filters?: Parameters<typeof logger.current.getAuditTrail>[0]) => {
    return logger.current.getAuditTrail(filters);
  };

  return {
    logDataAccess,
    logDataModification,
    logDataDeletion,
    logConsentChange,
    logUserAction,
    getAuditTrail,
  };
};

export default GDPRAuditLogger;
`;
  }

  /**
   * Get GDPR compliance template by level
   */
  static getComplianceTemplate(level: GDPRComplianceLevel): GDPRComplianceRequirements {
    return GDPR_COMPLIANCE_TEMPLATES[level];
  }

  /**
   * Validate GDPR compliance
   */
  static validateCompliance(
    level: GDPRComplianceLevel,
    implementation: any
  ): { compliant: boolean; violations: string[] } {
    const template = this.getComplianceTemplate(level);
    const violations: string[] = [];

    // Check technical measures
    if (template.technicalMeasures.encryption && !implementation.encryption) {
      violations.push('Data encryption is required for this compliance level');
    }

    if (template.technicalMeasures.pseudonymization && !implementation.pseudonymization) {
      violations.push('Data pseudonymization is required for this compliance level');
    }

    if (template.technicalMeasures.accessLogging && !implementation.accessLogging) {
      violations.push('Access logging is required for this compliance level');
    }

    // Check organizational measures
    if (template.organizationalMeasures.privacyByDesign && !implementation.privacyByDesign) {
      violations.push('Privacy by design implementation is required');
    }

    if (template.organizationalMeasures.dataProtectionOfficer && !implementation.dpo) {
      violations.push('Data Protection Officer appointment is required for this compliance level');
    }

    // Check user rights implementation
    if (template.userRights.dataAccess && !implementation.dataAccessRights) {
      violations.push('Data access rights implementation is required');
    }

    if (template.userRights.dataErasure && !implementation.dataErasureRights) {
      violations.push('Data erasure rights (right to be forgotten) implementation is required');
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}

export default GDPRComplianceService;
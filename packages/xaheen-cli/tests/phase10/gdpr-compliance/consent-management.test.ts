/**
 * GDPR Consent Management Tests
 * 
 * Tests GDPR compliance for consent management, data subject rights,
 * and privacy by design principles as per GDPR Articles 7, 17, and 25.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadPhase10Config, GDPRTestSubject } from '../config/test-config';
import { GDPRConsentManager } from '../utils/gdpr-consent-manager';
import { DataSubjectRightsHandler } from '../utils/data-subject-rights-handler';
import { ComplianceLogger } from '../utils/compliance-logger';
import { PrivacyImpactAssessment } from '../utils/privacy-impact-assessment';

const config = loadPhase10Config();
const logger = new ComplianceLogger('GDPR-Consent-Management');

describe('GDPR Consent Management Tests', () => {
  let consentManager: GDPRConsentManager;
  let rightsHandler: DataSubjectRightsHandler;
  let privacyAssessment: PrivacyImpactAssessment;
  let testSubjects: GDPRTestSubject[];

  beforeAll(async () => {
    // Initialize GDPR compliance components
    consentManager = new GDPRConsentManager({
      databaseUrl: config.gdpr.consentDatabaseUrl,
      auditingEnabled: true
    });

    rightsHandler = new DataSubjectRightsHandler({
      deletionQueueUrl: config.gdpr.deletionQueueUrl,
      processingLogUrl: config.gdpr.processingLogUrl
    });

    privacyAssessment = new PrivacyImpactAssessment();
    testSubjects = config.gdpr.testSubjects;
    
    // Verify GDPR infrastructure
    const isReady = await consentManager.verifyInfrastructure();
    if (!isReady) {
      throw new Error('GDPR compliance infrastructure not ready');
    }
    
    logger.info('GDPR compliance infrastructure initialized', {
      testSubjects: testSubjects.length,
      consentDatabase: 'connected',
      rightsHandling: 'enabled'
    });
  });

  afterAll(async () => {
    await consentManager.cleanup();
    await rightsHandler.cleanup();
    logger.info('GDPR consent management tests completed');
  });

  describe('Consent Collection and Management (GDPR Article 7)', () => {
    it('should collect valid consent with all required elements', async () => {
      const testSubject = testSubjects[0];
      
      const consentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [
          {
            purpose: 'service_delivery',
            description: 'Providing the requested CLI generation services',
            dataCategories: ['contact', 'usage_data'],
            retention: '3Y'
          },
          {
            purpose: 'service_improvement',
            description: 'Improving CLI features based on usage patterns',
            dataCategories: ['usage_data', 'preferences'],
            retention: '2Y'
          }
        ],
        legalBasis: 'consent',
        consentMethodology: {
          type: 'explicit_opt_in',
          interface: 'web_form',
          language: 'nb-NO',
          accessibility: 'wcag_aa_compliant'
        },
        dataController: {
          name: 'Xaheen Enterprise',
          email: 'privacy@xaheen.com',
          dpoEmail: 'dpo@xaheen.com'
        }
      };

      logger.info('Collecting GDPR consent', {
        dataSubjectId: testSubject.id,
        purposes: consentRequest.processingPurposes.length
      });

      const consent = await consentManager.collectConsent(consentRequest);

      expect(consent).toMatchObject({
        consentId: expect.stringMatching(/^consent-[a-f0-9-]{36}$/),
        dataSubjectId: testSubject.id,
        status: 'given',
        consentDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        legalBasis: 'consent',
        processingPurposes: expect.arrayContaining([
          expect.objectContaining({
            purpose: 'service_delivery',
            consented: true,
            consentDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
          })
        ]),
        consentEvidence: {
          method: 'explicit_opt_in',
          ipAddress: expect.stringMatching(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/),
          userAgent: expect.any(String),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          checksum: expect.stringMatching(/^[a-f0-9]{64}$/) // SHA-256 hash
        },
        withdrawalInfo: {
          method: 'email_link',
          url: expect.stringContaining('https://'),
          instructions: expect.stringContaining('withdraw consent')
        },
        validity: {
          isValid: true,
          validFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          requiresRenewal: true,
          renewalDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }
      });

      logger.info('GDPR consent collected successfully', {
        consentId: consent.consentId,
        status: consent.status,
        purposes: consent.processingPurposes.length,
        valid: consent.validity.isValid
      });
    }, 30000);

    it('should validate consent granularity and specificity', async () => {
      const testSubject = testSubjects[1];
      
      // Test granular consent with specific purposes
      const granularConsentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [
          {
            purpose: 'template_generation',
            description: 'Generate code templates based on user specifications',
            dataCategories: ['preferences', 'project_data'],
            retention: '1Y',
            required: true
          },
          {
            purpose: 'analytics',
            description: 'Analyze usage patterns to improve service quality',
            dataCategories: ['usage_data'],
            retention: '2Y',
            required: false
          },
          {
            purpose: 'marketing',
            description: 'Send information about new features and updates',
            dataCategories: ['contact'],
            retention: '3Y',
            required: false
          }
        ],
        granularConsent: true
      };

      const consent = await consentManager.collectConsent(granularConsentRequest);

      // User should be able to consent to specific purposes
      expect(consent.processingPurposes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            purpose: 'template_generation',
            consented: true,
            required: true
          }),
          expect.objectContaining({
            purpose: 'analytics',
            consented: expect.any(Boolean), // May be true or false
            required: false
          }),
          expect.objectContaining({
            purpose: 'marketing',
            consented: expect.any(Boolean), // May be true or false
            required: false
          })
        ])
      );

      // Verify granularity is preserved
      expect(consent.consentMetadata.granular).toBe(true);
      expect(consent.consentMetadata.unbundled).toBe(true);

      logger.info('Granular consent validation successful', {
        consentId: consent.consentId,
        granular: consent.consentMetadata.granular,
        purposes: consent.processingPurposes.length
      });
    });

    it('should reject invalid or coerced consent', async () => {
      const testSubject = testSubjects[0];
      
      // Test pre-ticked consent (should be rejected)
      const invalidConsentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'Service delivery',
          dataCategories: ['contact']
        }],
        consentMethodology: {
          type: 'pre_ticked', // Invalid method
          coerced: true
        }
      };

      await expect(consentManager.collectConsent(invalidConsentRequest))
        .rejects.toThrow(/invalid consent method|coerced consent|pre-ticked not allowed/i);

      // Test bundled consent for unrelated purposes (should be rejected)
      const bundledConsentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [
          {
            purpose: 'service_delivery',
            description: 'Provide CLI services',
            dataCategories: ['contact', 'usage_data']
          },
          {
            purpose: 'third_party_marketing', // Unrelated purpose
            description: 'Share data with partners for marketing',
            dataCategories: ['contact', 'personal']
          }
        ],
        bundledConsent: true, // Forces all-or-nothing consent
        granularConsent: false
      };

      await expect(consentManager.collectConsent(bundledConsentRequest))
        .rejects.toThrow(/bundled consent not allowed|unrelated purposes|granular consent required/i);

      logger.info('Invalid consent properly rejected');
    });

    it('should handle consent withdrawal (GDPR Article 7.3)', async () => {
      const testSubject = testSubjects[1];
      
      // First, collect consent
      const consentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'Provide CLI services',
          dataCategories: ['contact', 'usage_data'],
          retention: '1Y'
        }]
      };

      const consent = await consentManager.collectConsent(consentRequest);
      expect(consent.status).toBe('given');

      // Now withdraw consent
      const withdrawalRequest = {
        consentId: consent.consentId,
        dataSubjectId: testSubject.id,
        withdrawalReason: 'No longer need the service',
        withdrawalMethod: 'email_link',
        effectiveDate: new Date().toISOString()
      };

      logger.info('Withdrawing GDPR consent', {
        consentId: consent.consentId,
        dataSubjectId: testSubject.id
      });

      const withdrawal = await consentManager.withdrawConsent(withdrawalRequest);

      expect(withdrawal).toMatchObject({
        consentId: consent.consentId,
        status: 'withdrawn',
        withdrawalDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        withdrawalMethod: 'email_link',
        effectiveDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        dataProcessingStopped: true,
        deletionScheduled: true,
        deletionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        withdrawalEvidence: {
          method: 'email_link',
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          checksum: expect.stringMatching(/^[a-f0-9]{64}$/)
        }
      });

      // Verify consent status is updated
      const updatedConsent = await consentManager.getConsent(consent.consentId);
      expect(updatedConsent.status).toBe('withdrawn');
      expect(updatedConsent.withdrawalInfo.withdrawn).toBe(true);

      // Verify data processing stops immediately
      const processingStatus = await consentManager.getProcessingStatus(testSubject.id);
      expect(processingStatus.activeProcessing).toBe(false);
      expect(processingStatus.stoppedDate).toBeDefined();

      logger.info('Consent withdrawal processed successfully', {
        consentId: withdrawal.consentId,
        status: withdrawal.status,
        processingStoppedImmediately: withdrawal.dataProcessingStopped,
        deletionScheduled: withdrawal.deletionScheduled
      });
    });

    it('should maintain consent audit trail', async () => {
      const auditLogsBefore = await logger.getAuditLogs();
      const initialCount = auditLogsBefore.length;

      const testSubject = testSubjects[0];
      
      // Collect consent
      const consentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'audit_test',
          description: 'Testing audit trail',
          dataCategories: ['contact']
        }]
      };

      const consent = await consentManager.collectConsent(consentRequest);
      
      // Modify consent (add new purpose)
      await consentManager.updateConsent(consent.consentId, {
        addPurposes: [{
          purpose: 'additional_service',
          description: 'Additional service offering',
          dataCategories: ['preferences']
        }]
      });

      // Withdraw consent
      await consentManager.withdrawConsent({
        consentId: consent.consentId,
        dataSubjectId: testSubject.id,
        withdrawalReason: 'Audit test completion'
      });

      const auditLogsAfter = await logger.getAuditLogs();
      const newLogs = auditLogsAfter.slice(initialCount);

      // Verify all consent lifecycle events are logged
      const expectedEvents = ['CONSENT_COLLECTED', 'CONSENT_UPDATED', 'CONSENT_WITHDRAWN'];
      expectedEvents.forEach(event => {
        const eventLog = newLogs.find(log => log.event === event);
        expect(eventLog).toBeDefined();
        expect(eventLog).toMatchObject({
          event,
          consentId: consent.consentId,
          dataSubjectId: testSubject.id,
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          metadata: expect.any(Object)
        });
      });

      logger.info('Consent audit trail validation successful', {
        consentId: consent.consentId,
        auditEvents: newLogs.length,
        lifecycleEvents: expectedEvents.length
      });
    });
  });

  describe('Data Subject Rights (GDPR Articles 15-22)', () => {
    it('should handle data subject access requests (Article 15)', async () => {
      const testSubject = testSubjects[0];
      
      // First collect some data
      const consent = await consentManager.collectConsent({
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'CLI service delivery',
          dataCategories: ['contact', 'usage_data', 'preferences']
        }]
      });

      // Simulate some data processing
      await rightsHandler.simulateDataProcessing(testSubject.id, {
        templateGenerations: 5,
        commandExecutions: 15,
        preferences: { theme: 'dark', language: 'nb-NO' }
      });

      // Submit data access request
      const accessRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        requestType: 'data_access',
        scope: 'all_data', // or specific categories
        format: 'structured_json',
        deliveryMethod: 'secure_download'
      };

      logger.info('Processing data subject access request', {
        dataSubjectId: testSubject.id,
        scope: accessRequest.scope
      });

      const accessResponse = await rightsHandler.processAccessRequest(accessRequest);

      expect(accessResponse).toMatchObject({
        requestId: expect.stringMatching(/^sar-[a-f0-9-]{36}$/),
        dataSubjectId: testSubject.id,
        status: 'completed',
        completedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        responseWithin30Days: true,
        dataPackage: {
          personalData: {
            identityData: {
              dataSubjectId: testSubject.id,
              email: testSubject.email,
              registrationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            },
            contactData: {
              email: testSubject.email,
              lastUpdated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            },
            usageData: {
              templateGenerations: 5,
              commandExecutions: 15,
              lastActivity: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            },
            preferences: {
              theme: 'dark',
              language: 'nb-NO'
            }
          },
          processingInfo: {
            purposes: expect.arrayContaining([
              expect.objectContaining({
                purpose: 'service_delivery',
                legalBasis: 'consent',
                dataCategories: ['contact', 'usage_data', 'preferences']
              })
            ]),
            retention: {
              policy: expect.any(String),
              expectedDeletion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            }
          },
          thirdPartySharing: [],
          consentHistory: expect.arrayContaining([
            expect.objectContaining({
              consentId: consent.consentId,
              status: 'given',
              date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            })
          ])
        },
        deliveryInfo: {
          method: 'secure_download',
          downloadUrl: expect.stringContaining('https://'),
          expiryDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          accessCode: expect.stringMatching(/^[A-Z0-9]{8}$/)
        }
      });

      logger.info('Data subject access request completed', {
        requestId: accessResponse.requestId,
        dataCategories: Object.keys(accessResponse.dataPackage.personalData).length,
        deliveryMethod: accessResponse.deliveryInfo.method
      });
    }, 60000);

    it('should handle right to rectification requests (Article 16)', async () => {
      const testSubject = testSubjects[1];
      
      // Create data with incorrect information
      const consent = await consentManager.collectConsent({
        dataSubjectId: testSubject.id,
        email: 'old.email@example.com', // Will be corrected
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'CLI services',
          dataCategories: ['contact', 'preferences']
        }]
      });

      // Submit rectification request
      const rectificationRequest = {
        dataSubjectId: testSubject.id,
        requestType: 'rectification',
        corrections: [
          {
            field: 'email',
            currentValue: 'old.email@example.com',
            correctedValue: 'corrected.email@example.com',
            reason: 'Email address was incorrectly entered during registration'
          },
          {
            field: 'preferences.language',
            currentValue: 'en',
            correctedValue: 'nb-NO',
            reason: 'Preferred language is Norwegian, not English'
          }
        ]
      };

      const rectificationResponse = await rightsHandler.processRectificationRequest(rectificationRequest);

      expect(rectificationResponse).toMatchObject({
        requestId: expect.stringMatching(/^rect-[a-f0-9-]{36}$/),
        dataSubjectId: testSubject.id,
        status: 'completed',
        corrections: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            corrected: true,
            oldValue: 'old.email@example.com',
            newValue: 'corrected.email@example.com',
            correctionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
          })
        ]),
        thirdPartyNotifications: expect.any(Array),
        completedWithin30Days: true
      });

      // Verify data was actually corrected
      const accessRequest = await rightsHandler.processAccessRequest({
        dataSubjectId: testSubject.id,
        requestType: 'data_access',
        scope: 'contact_data'
      });

      expect(accessRequest.dataPackage.personalData.contactData.email)
        .toBe('corrected.email@example.com');

      logger.info('Rectification request completed successfully', {
        requestId: rectificationResponse.requestId,
        corrections: rectificationResponse.corrections.length
      });
    });

    it('should handle right to erasure requests (Article 17)', async () => {
      const testSubject = testSubjects[2] || {
        id: 'test-erasure-subject',
        email: 'erasure.test@example.com',
        consentDate: '2024-01-01T00:00:00Z',
        dataCategories: ['personal', 'contact'],
        lawfulBasis: 'consent'
      };
      
      // Create data to be erased
      const consent = await consentManager.collectConsent({
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'CLI services for erasure test',
          dataCategories: ['contact', 'usage_data']
        }]
      });

      // Simulate data processing
      await rightsHandler.simulateDataProcessing(testSubject.id, {
        templateGenerations: 3,
        preferences: { theme: 'light' }
      });

      // Submit erasure request
      const erasureRequest = {
        dataSubjectId: testSubject.id,
        requestType: 'erasure',
        erasureReason: 'consent_withdrawn',
        scope: 'all_personal_data',
        urgency: 'standard' // or 'urgent' for child data
      };

      logger.info('Processing right to erasure request', {
        dataSubjectId: testSubject.id,
        reason: erasureRequest.erasureReason
      });

      const erasureResponse = await rightsHandler.processErasureRequest(erasureRequest);

      expect(erasureResponse).toMatchObject({
        requestId: expect.stringMatching(/^erasure-[a-f0-9-]{36}$/),
        dataSubjectId: testSubject.id,
        status: 'completed',
        erasureDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        erasedData: {
          personalData: true,
          contactData: true,
          usageData: true,
          preferences: true,
          consentRecords: true
        },
        retainedData: {
          auditLogs: true, // Legal requirement to retain audit trail
          anonymizedStatistics: false
        },
        certificateOfErasure: {
          issued: true,
          certificateId: expect.stringMatching(/^cert-[a-f0-9-]{36}$/),
          issuedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          verificationMethod: 'cryptographic_proof'
        },
        thirdPartyNotifications: expect.any(Array),
        completedWithin30Days: true
      });

      // Verify data is actually erased
      const postErasureAccess = await rightsHandler.processAccessRequest({
        dataSubjectId: testSubject.id,
        requestType: 'data_access',
        scope: 'all_data'
      });

      expect(postErasureAccess.dataPackage.personalData).toEqual({});
      expect(postErasureAccess.status).toBe('no_data_found');

      // Verify audit trail is preserved (legal requirement)
      const auditLogs = await logger.getAuditLogs();
      const erasureLog = auditLogs.find(log => 
        log.event === 'DATA_ERASURE_COMPLETED' && log.dataSubjectId === testSubject.id
      );
      expect(erasureLog).toBeDefined();

      logger.info('Right to erasure completed successfully', {
        requestId: erasureResponse.requestId,
        certificateIssued: erasureResponse.certificateOfErasure.issued,
        auditPreserved: erasureLog !== undefined
      });
    }, 90000);

    it('should handle data portability requests (Article 20)', async () => {
      const testSubject = testSubjects[0];
      
      // Create portable data
      const consent = await consentManager.collectConsent({
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'service_delivery',
          description: 'CLI services',
          dataCategories: ['contact', 'usage_data', 'preferences']
        }],
        legalBasis: 'consent' // Required for portability
      });

      await rightsHandler.simulateDataProcessing(testSubject.id, {
        templateGenerations: 10,
        preferences: { theme: 'dark', language: 'nb-NO' },
        projectSettings: { framework: 'react', styling: 'tailwind' }
      });

      // Submit portability request
      const portabilityRequest = {
        dataSubjectId: testSubject.id,
        requestType: 'portability',
        format: 'json', // or 'csv', 'xml'
        deliveryMethod: 'secure_download',
        includeMetadata: true
      };

      const portabilityResponse = await rightsHandler.processPortabilityRequest(portabilityRequest);

      expect(portabilityResponse).toMatchObject({
        requestId: expect.stringMatching(/^port-[a-f0-9-]{36}$/),
        dataSubjectId: testSubject.id,
        status: 'completed',
        format: 'json',
        portableData: {
          userProvidedData: {
            email: testSubject.email,
            preferences: {
              theme: 'dark',
              language: 'nb-NO'
            },
            projectSettings: {
              framework: 'react',
              styling: 'tailwind'
            }
          },
          systemGeneratedData: {
            usageStatistics: {
              templateGenerations: 10,
              totalCommands: expect.any(Number),
              joinDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            }
          },
          metadata: {
            exportDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
            dataVersion: expect.any(String),
            legalBasis: 'consent',
            structuredFormat: 'machine_readable'
          }
        },
        deliveryInfo: {
          downloadUrl: expect.stringContaining('https://'),
          format: 'application/json',
          checksum: expect.stringMatching(/^[a-f0-9]{64}$/),
          expiryDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }
      });

      // Verify data is in structured, machine-readable format
      expect(portabilityResponse.portableData.metadata.structuredFormat).toBe('machine_readable');
      expect(portabilityResponse.deliveryInfo.format).toBe('application/json');

      logger.info('Data portability request completed', {
        requestId: portabilityResponse.requestId,
        format: portabilityResponse.format,
        dataSize: JSON.stringify(portabilityResponse.portableData).length
      });
    });
  });

  describe('Privacy by Design (GDPR Article 25)', () => {
    it('should conduct Privacy Impact Assessment (PIA)', async () => {
      const processingActivity = {
        name: 'CLI Template Generation',
        description: 'Generate code templates based on user input',
        dataCategories: ['usage_data', 'preferences', 'project_data'],
        dataSubjects: ['developers', 'enterprise_users'],
        purposes: ['service_delivery', 'service_improvement'],
        legalBasis: 'consent',
        dataFlows: [
          {
            from: 'user_input',
            to: 'template_engine',
            dataType: 'project_specifications'
          },
          {
            from: 'template_engine',
            to: 'output_storage',
            dataType: 'generated_templates'
          }
        ],
        risks: [
          {
            type: 'data_exposure',
            likelihood: 'low',
            impact: 'medium',
            description: 'Generated templates might contain sensitive project information'
          }
        ]
      };

      const pia = await privacyAssessment.conductAssessment(processingActivity);

      expect(pia).toMatchObject({
        assessmentId: expect.stringMatching(/^pia-[a-f0-9-]{36}$/),
        processingActivity: processingActivity.name,
        assessmentDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        riskLevel: expect.stringMatching(/^(low|medium|high)$/),
        necessityTest: {
          necessary: true,
          proportionate: true,
          justification: expect.any(String)
        },
        riskAssessment: {
          identifiedRisks: expect.arrayContaining([
            expect.objectContaining({
              type: 'data_exposure',
              riskScore: expect.any(Number),
              mitigationMeasures: expect.any(Array)
            })
          ]),
          residualRisk: expect.stringMatching(/^(low|medium|high)$/),
          acceptableRisk: true
        },
        safeguards: {
          technical: expect.arrayContaining([
            'encryption_at_rest',
            'encryption_in_transit',
            'access_controls'
          ]),
          organizational: expect.arrayContaining([
            'staff_training',
            'data_breach_procedures',
            'regular_audits'
          ])
        },
        recommendations: expect.any(Array),
        dpoReview: {
          required: false, // Low risk processing
          completed: expect.any(Boolean)
        }
      });

      expect(pia.riskLevel).toBe('low');
      expect(pia.riskAssessment.acceptableRisk).toBe(true);

      logger.info('Privacy Impact Assessment completed', {
        assessmentId: pia.assessmentId,
        riskLevel: pia.riskLevel,
        safeguards: pia.safeguards.technical.length + pia.safeguards.organizational.length
      });
    });

    it('should implement data minimization principles', async () => {
      const testSubject = testSubjects[0];
      
      // Test that only necessary data is collected
      const minimalConsentRequest = {
        dataSubjectId: testSubject.id,
        email: testSubject.email,
        processingPurposes: [{
          purpose: 'template_generation',
          description: 'Generate code templates',
          dataCategories: ['project_preferences'], // Minimal necessary data
          dataMinimization: true
        }]
      };

      const consent = await consentManager.collectConsent(minimalConsentRequest);

      // Verify only necessary data categories are included
      expect(consent.processingPurposes[0].dataCategories).toEqual(['project_preferences']);
      expect(consent.processingPurposes[0].dataCategories).not.toContain('personal_identification');
      expect(consent.processingPurposes[0].dataCategories).not.toContain('financial_data');

      // Test data minimization in processing
      const processingResult = await rightsHandler.processWithMinimization(testSubject.id, {
        requestedData: ['name', 'email', 'phone', 'address', 'preferences'],
        purpose: 'template_generation'
      });

      expect(processingResult).toMatchObject({
        processedData: ['preferences'], // Only necessary for the purpose
        excludedData: ['name', 'phone', 'address'], // Not necessary
        includedData: ['email'], // Necessary for service delivery
        minimizationApplied: true,
        justification: expect.any(String)
      });

      logger.info('Data minimization principles validated', {
        requestedCategories: 5,
        processedCategories: processingResult.processedData.length,
        minimizationApplied: processingResult.minimizationApplied
      });
    });

    it('should implement privacy by default settings', async () => {
      const testSubject = testSubjects[1];
      
      // Test default privacy settings
      const defaultPrivacySettings = await consentManager.getDefaultPrivacySettings(testSubject.id);

      expect(defaultPrivacySettings).toMatchObject({
        dataSubjectId: testSubject.id,
        privacySettings: {
          dataSharingEnabled: false, // Default: no sharing
          analyticsEnabled: false,   // Default: no analytics
          marketingEnabled: false,   // Default: no marketing
          profileVisible: false,     // Default: private profile
          dataRetention: 'minimum',  // Default: minimum retention
          encryptionEnabled: true,   // Default: encryption on
          auditLogging: true        // Default: audit logging on
        },
        appliedByDefault: true,
        canBeChanged: true,
        lastUpdated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      // Verify privacy-friendly defaults are actually applied
      expect(defaultPrivacySettings.privacySettings.dataSharingEnabled).toBe(false);
      expect(defaultPrivacySettings.privacySettings.marketingEnabled).toBe(false);
      expect(defaultPrivacySettings.privacySettings.encryptionEnabled).toBe(true);

      logger.info('Privacy by default settings validated', {
        dataSubjectId: testSubject.id,
        privacyFriendlyDefaults: Object.values(defaultPrivacySettings.privacySettings)
          .filter(setting => setting === false).length, // Count privacy-protective defaults
        securityDefaults: defaultPrivacySettings.privacySettings.encryptionEnabled
      });
    });
  });
});
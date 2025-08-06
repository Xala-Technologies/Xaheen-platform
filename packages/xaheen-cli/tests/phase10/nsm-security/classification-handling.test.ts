/**
 * NSM Security Classification Tests
 * 
 * Tests NSM (Norwegian National Security Authority) security classification handling
 * for OPEN, RESTRICTED, CONFIDENTIAL, and SECRET data levels.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { loadPhase10Config, NSMClassification } from '../config/test-config';
import { NSMSecurityHandler } from '../utils/nsm-security-handler';
import { ComplianceLogger } from '../utils/compliance-logger';
import { TemplateGenerator } from '../utils/template-generator';
import { AuditLogger } from '../utils/audit-logger';

const config = loadPhase10Config();
const logger = new ComplianceLogger('NSM-Security-Classification');

describe('NSM Security Classification Tests', () => {
  let nsmHandler: NSMSecurityHandler;
  let templateGenerator: TemplateGenerator;
  let auditLogger: AuditLogger;

  beforeAll(async () => {
    // Initialize NSM security handler
    nsmHandler = new NSMSecurityHandler({
      auditEndpoint: config.nsm.auditEndpoint,
      encryptionKeys: config.nsm.encryptionKeys,
      classifications: config.nsm.classifications
    });

    templateGenerator = new TemplateGenerator();
    auditLogger = new AuditLogger({
      endpoint: config.nsm.auditEndpoint
    });
    
    // Verify NSM security infrastructure
    const isReady = await nsmHandler.verifySecurityInfrastructure();
    if (!isReady) {
      throw new Error('NSM security infrastructure not ready');
    }
    
    logger.info('NSM security infrastructure initialized', {
      classifications: config.nsm.classifications,
      auditingEnabled: true
    });
  });

  afterAll(async () => {
    await nsmHandler.cleanup();
    await auditLogger.flush();
    logger.info('NSM security classification tests completed');
  });

  describe('Classification Validation', () => {
    it('should validate OPEN classification handling', async () => {
      const testData = {
        content: 'This is public information available to everyone.',
        metadata: {
          title: 'Public Information Document',
          author: 'Xaheen CLI Test Suite',
          created: new Date().toISOString()
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'OPEN');

      expect(classified).toMatchObject({
        classification: 'OPEN',
        content: testData.content,
        metadata: expect.objectContaining({
          ...testData.metadata,
          classification: 'OPEN',
          securityMarking: 'ÅPEN',
          accessLevel: 'public',
          encryptionRequired: false,
          handlingInstructions: expect.arrayContaining([
            'No special handling required',
            'May be shared publicly'
          ])
        }),
        encryptionInfo: {
          encrypted: false,
          algorithm: null,
          keyId: null
        },
        auditInfo: {
          classificationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          classifiedBy: 'Xaheen CLI Test Suite',
          reviewDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }
      });

      logger.info('OPEN classification validated', {
        classification: classified.classification,
        securityMarking: classified.metadata.securityMarking,
        encrypted: classified.encryptionInfo.encrypted
      });
    });

    it('should validate RESTRICTED classification handling', async () => {
      const testData = {
        content: 'This information is restricted to authorized personnel only.',
        metadata: {
          title: 'Restricted Information Document',
          author: 'Xaheen CLI Test Suite',
          created: new Date().toISOString()
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'RESTRICTED');

      expect(classified).toMatchObject({
        classification: 'RESTRICTED',
        metadata: expect.objectContaining({
          classification: 'RESTRICTED',
          securityMarking: 'BEGRENSET',
          accessLevel: 'restricted',
          encryptionRequired: true,
          handlingInstructions: expect.arrayContaining([
            'Authorized personnel only',
            'Must be encrypted in transit and at rest',
            'Requires access logging'
          ]),
          accessControl: expect.objectContaining({
            requiredClearanceLevel: 'restricted',
            authorizedRoles: expect.any(Array),
            accessLogging: true
          })
        }),
        encryptionInfo: {
          encrypted: true,
          algorithm: 'AES-256-GCM',
          keyId: expect.stringMatching(/^nsm-restricted-key-\d+$/),
          encryptedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }
      });

      // Verify encryption
      expect(classified.content).not.toBe(testData.content);
      expect(classified.content).toMatch(/^[a-zA-Z0-9+/]+=*$/); // Base64 encrypted

      logger.info('RESTRICTED classification validated', {
        classification: classified.classification,
        securityMarking: classified.metadata.securityMarking,
        encrypted: classified.encryptionInfo.encrypted,
        algorithm: classified.encryptionInfo.algorithm
      });
    });

    it('should validate CONFIDENTIAL classification handling', async () => {
      const testData = {
        content: 'This information is confidential and requires security clearance.',
        metadata: {
          title: 'Confidential Information Document',
          author: 'Xaheen CLI Test Suite',
          created: new Date().toISOString()
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'CONFIDENTIAL');

      expect(classified).toMatchObject({
        classification: 'CONFIDENTIAL',
        metadata: expect.objectContaining({
          classification: 'CONFIDENTIAL',
          securityMarking: 'FORTROLIG',
          accessLevel: 'confidential',
          encryptionRequired: true,
          handlingInstructions: expect.arrayContaining([
            'Security clearance required',
            'Strong encryption mandatory',
            'Detailed audit logging required',
            'Access requires two-factor authentication'
          ]),
          accessControl: expect.objectContaining({
            requiredClearanceLevel: 'confidential',
            authorizedRoles: expect.any(Array),
            accessLogging: true,
            twoFactorRequired: true,
            segregationOfDuties: true
          })
        }),
        encryptionInfo: {
          encrypted: true,
          algorithm: 'AES-256-GCM',
          keyId: expect.stringMatching(/^nsm-confidential-key-\d+$/),
          keyDerivation: 'PBKDF2-SHA256',
          iterations: 100000
        }
      });

      // Verify stronger encryption for confidential data
      expect(classified.content).not.toBe(testData.content);
      expect(classified.encryptionInfo.keyDerivation).toBe('PBKDF2-SHA256');
      expect(classified.encryptionInfo.iterations).toBe(100000);

      logger.info('CONFIDENTIAL classification validated', {
        classification: classified.classification,
        securityMarking: classified.metadata.securityMarking,
        keyDerivation: classified.encryptionInfo.keyDerivation,
        iterations: classified.encryptionInfo.iterations
      });
    });

    it('should validate SECRET classification handling', async () => {
      const testData = {
        content: 'This information is classified as SECRET and requires highest security measures.',
        metadata: {
          title: 'Secret Information Document',
          author: 'Xaheen CLI Test Suite',
          created: new Date().toISOString()
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'SECRET');

      expect(classified).toMatchObject({
        classification: 'SECRET',
        metadata: expect.objectContaining({
          classification: 'SECRET',
          securityMarking: 'HEMMELIG',
          accessLevel: 'secret',
          encryptionRequired: true,
          handlingInstructions: expect.arrayContaining([
            'Highest security clearance required',
            'Hardware security module encryption',
            'Real-time audit monitoring',
            'Biometric authentication required',
            'Air-gapped systems only',
            'Need-to-know basis only'
          ]),
          accessControl: expect.objectContaining({
            requiredClearanceLevel: 'secret',
            authorizedRoles: expect.any(Array),
            accessLogging: true,
            biometricRequired: true,
            needToKnow: true,
            airgapRequired: true
          })
        }),
        encryptionInfo: {
          encrypted: true,
          algorithm: 'AES-256-GCM',
          keyId: expect.stringMatching(/^nsm-secret-key-\d+$/),
          keyDerivation: 'PBKDF2-SHA512',
          iterations: 1000000,
          hsmProtected: true,
          keyEscrow: true
        }
      });

      // Verify highest level encryption for secret data
      expect(classified.encryptionInfo.hsmProtected).toBe(true);
      expect(classified.encryptionInfo.keyEscrow).toBe(true);
      expect(classified.encryptionInfo.keyDerivation).toBe('PBKDF2-SHA512');
      expect(classified.encryptionInfo.iterations).toBe(1000000);

      logger.info('SECRET classification validated', {
        classification: classified.classification,
        securityMarking: classified.metadata.securityMarking,
        hsmProtected: classified.encryptionInfo.hsmProtected,
        keyEscrow: classified.encryptionInfo.keyEscrow
      });
    });

    it('should reject invalid classification levels', async () => {
      const testData = {
        content: 'Test content',
        metadata: { title: 'Test Document' }
      };

      await expect(nsmHandler.classifyData(testData, 'INVALID' as NSMClassification))
        .rejects.toThrow(/invalid classification|unsupported security level/i);

      logger.info('Invalid classification properly rejected');
    });
  });

  describe('Template Generation with Security Classifications', () => {
    it('should generate OPEN template with appropriate security markers', async () => {
      const templateConfig = {
        type: 'component',
        name: 'PublicDataDisplay',
        classification: 'OPEN' as NSMClassification,
        metadata: {
          purpose: 'Display public information',
          dataTypes: ['public_announcements', 'general_information']
        }
      };

      const template = await templateGenerator.generateWithClassification(templateConfig);

      expect(template).toMatchObject({
        name: 'PublicDataDisplay',
        classification: 'OPEN',
        content: expect.stringContaining('// SECURITY CLASSIFICATION: ÅPEN (OPEN)'),
        metadata: expect.objectContaining({
          securityMarking: 'ÅPEN',
          handlingInstructions: expect.arrayContaining([
            'No special security handling required'
          ])
        }),
        securityFeatures: {
          encryption: false,
          accessControl: false,
          auditLogging: 'basic'
        }
      });

      // Verify template content includes proper markers
      expect(template.content).toContain('* @security OPEN');
      expect(template.content).toContain('* @classification ÅPEN');
      expect(template.content).not.toContain('encryptData');
      expect(template.content).not.toContain('requiresClearance');

      logger.info('OPEN template generated with security markers', {
        templateName: template.name,
        classification: template.classification,
        securityFeatures: template.securityFeatures
      });
    });

    it('should generate RESTRICTED template with encryption and access control', async () => {
      const templateConfig = {
        type: 'component',
        name: 'RestrictedDataHandler',
        classification: 'RESTRICTED' as NSMClassification,
        metadata: {
          purpose: 'Handle restricted government data',
          dataTypes: ['internal_reports', 'personnel_data']
        }
      };

      const template = await templateGenerator.generateWithClassification(templateConfig);

      expect(template).toMatchObject({
        name: 'RestrictedDataHandler',
        classification: 'RESTRICTED',
        content: expect.stringContaining('// SECURITY CLASSIFICATION: BEGRENSET (RESTRICTED)'),
        metadata: expect.objectContaining({
          securityMarking: 'BEGRENSET',
          handlingInstructions: expect.arrayContaining([
            'Requires authorized access only',
            'Must be encrypted'
          ])
        }),
        securityFeatures: {
          encryption: true,
          accessControl: true,
          auditLogging: 'detailed',
          clearanceRequired: 'restricted'
        }
      });

      // Verify template includes security functions
      expect(template.content).toContain('* @security RESTRICTED');
      expect(template.content).toContain('* @classification BEGRENSET');
      expect(template.content).toContain('encryptData');
      expect(template.content).toContain('checkAccess');
      expect(template.content).toContain('auditAccess');

      logger.info('RESTRICTED template generated with security features', {
        templateName: template.name,
        classification: template.classification,
        securityFeatures: template.securityFeatures
      });
    });

    it('should generate CONFIDENTIAL template with enhanced security', async () => {
      const templateConfig = {
        type: 'service',
        name: 'ConfidentialDataService',
        classification: 'CONFIDENTIAL' as NSMClassification,
        metadata: {
          purpose: 'Process confidential government data',
          dataTypes: ['classified_reports', 'sensitive_analysis']
        }
      };

      const template = await templateGenerator.generateWithClassification(templateConfig);

      expect(template.securityFeatures).toMatchObject({
        encryption: true,
        accessControl: true,
        auditLogging: 'comprehensive',
        clearanceRequired: 'confidential',
        twoFactorAuth: true,
        dataLossPrevention: true
      });

      // Verify template includes enhanced security functions
      expect(template.content).toContain('* @security CONFIDENTIAL');
      expect(template.content).toContain('* @classification FORTROLIG');
      expect(template.content).toContain('requireTwoFactorAuth');
      expect(template.content).toContain('preventDataLeakage');
      expect(template.content).toContain('comprehensiveAudit');

      logger.info('CONFIDENTIAL template generated with enhanced security', {
        templateName: template.name,
        classification: template.classification,
        securityFeatures: template.securityFeatures
      });
    });

    it('should generate SECRET template with maximum security measures', async () => {
      const templateConfig = {
        type: 'service',
        name: 'SecretDataProcessor',
        classification: 'SECRET' as NSMClassification,
        metadata: {
          purpose: 'Process secret government data',
          dataTypes: ['national_security', 'classified_intelligence']
        }
      };

      const template = await templateGenerator.generateWithClassification(templateConfig);

      expect(template.securityFeatures).toMatchObject({
        encryption: true,
        accessControl: true,
        auditLogging: 'real-time',
        clearanceRequired: 'secret',
        biometricAuth: true,
        airgapRequired: true,
        hsmEncryption: true,
        needToKnowBasis: true
      });

      // Verify template includes maximum security functions
      expect(template.content).toContain('* @security SECRET');
      expect(template.content).toContain('* @classification HEMMELIG');
      expect(template.content).toContain('requireBiometricAuth');
      expect(template.content).toContain('enforceAirgap');
      expect(template.content).toContain('hsmEncryption');
      expect(template.content).toContain('needToKnowAccess');

      logger.info('SECRET template generated with maximum security', {
        templateName: template.name,
        classification: template.classification,
        securityFeatures: template.securityFeatures
      });
    });

    it('should prevent cross-classification data mixing', async () => {
      const openData = await nsmHandler.classifyData(
        { content: 'Open data', metadata: { title: 'Open' } },
        'OPEN'
      );

      const secretData = await nsmHandler.classifyData(
        { content: 'Secret data', metadata: { title: 'Secret' } },
        'SECRET'
      );

      // Attempt to mix classifications should fail
      await expect(nsmHandler.combineClassifiedData([openData, secretData]))
        .rejects.toThrow(/classification mismatch|security violation|mixed classifications/i);

      logger.info('Cross-classification mixing properly prevented');
    });
  });

  describe('Audit and Compliance', () => {
    it('should generate comprehensive audit logs for all classifications', async () => {
      const auditLogsBefore = await auditLogger.getClassificationLogs();
      const initialCount = auditLogsBefore.length;

      // Test each classification level
      const classifications: NSMClassification[] = ['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'];
      
      for (const classification of classifications) {
        const testData = {
          content: `Test content for ${classification}`,
          metadata: { title: `${classification} Test Document` }
        };

        await nsmHandler.classifyData(testData, classification);
      }

      const auditLogsAfter = await auditLogger.getClassificationLogs();
      expect(auditLogsAfter.length).toBe(initialCount + classifications.length);

      // Verify each classification generated proper audit log
      const newLogs = auditLogsAfter.slice(initialCount);
      
      classifications.forEach((classification, index) => {
        const log = newLogs[index];
        expect(log).toMatchObject({
          event: 'NSM_DATA_CLASSIFICATION',
          classification: classification,
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          user: 'Xaheen CLI Test Suite',
          success: true,
          metadata: expect.objectContaining({
            documentTitle: `${classification} Test Document`,
            encryptionApplied: classification !== 'OPEN',
            accessControlApplied: classification !== 'OPEN'
          })
        });
      });

      logger.info('Comprehensive audit logs generated', {
        classificationsProcessed: classifications.length,
        auditLogsGenerated: newLogs.length
      });
    });

    it('should track security violations and failed access attempts', async () => {
      // Attempt unauthorized access to SECRET data
      const secretData = await nsmHandler.classifyData(
        { content: 'Secret information', metadata: { title: 'Secret Doc' } },
        'SECRET'
      );

      // Simulate unauthorized access attempt
      await expect(nsmHandler.accessClassifiedData(secretData.id, {
        userId: 'unauthorized-user',
        clearanceLevel: 'restricted', // Insufficient clearance
        authMethod: 'password' // Insufficient auth for SECRET
      })).rejects.toThrow(/insufficient clearance|access denied|unauthorized/i);

      // Verify security violation was logged
      const securityLogs = await auditLogger.getSecurityViolationLogs();
      const recentViolation = securityLogs[securityLogs.length - 1];

      expect(recentViolation).toMatchObject({
        event: 'SECURITY_VIOLATION',
        violationType: 'INSUFFICIENT_CLEARANCE',
        userId: 'unauthorized-user',
        targetResource: secretData.id,
        targetClassification: 'SECRET',
        userClearance: 'restricted',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        blocked: true,
        metadata: expect.objectContaining({
          requiredClearance: 'secret',
          requiredAuth: 'biometric',
          providedAuth: 'password'
        })
      });

      logger.info('Security violation properly logged', {
        violationType: recentViolation.violationType,
        targetClassification: recentViolation.targetClassification,
        blocked: recentViolation.blocked
      });
    });

    it('should validate classification review and declassification procedures', async () => {
      // Create classified data with review date
      const reviewDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      const testData = {
        content: 'Data requiring periodic review',
        metadata: {
          title: 'Review Test Document',
          reviewDate: reviewDate.toISOString()
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'CONFIDENTIAL');

      // Verify review date is set
      expect(classified.auditInfo.reviewDate).toBeDefined();
      expect(new Date(classified.auditInfo.reviewDate)).toBeInstanceOf(Date);

      // Test review process
      const reviewResult = await nsmHandler.conductClassificationReview(classified.id);

      expect(reviewResult).toMatchObject({
        documentId: classified.id,
        currentClassification: 'CONFIDENTIAL',
        reviewDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        reviewStatus: 'completed',
        recommendation: expect.stringMatching(/^(maintain|downgrade|declassify)$/),
        nextReviewDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        reviewedBy: expect.any(String)
      });

      logger.info('Classification review process validated', {
        documentId: classified.id,
        reviewStatus: reviewResult.reviewStatus,
        recommendation: reviewResult.recommendation
      });
    });

    it('should enforce data retention and destruction policies', async () => {
      // Create data with retention policy
      const testData = {
        content: 'Data with retention policy',
        metadata: {
          title: 'Retention Test Document',
          retentionPeriod: '3Y', // 3 years
          destructionRequired: true
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'RESTRICTED');

      // Verify retention policy is applied
      expect(classified.metadata.retentionInfo).toMatchObject({
        retentionPeriod: '3Y',
        createdDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        destructionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        destructionRequired: true,
        destructionMethod: 'secure_deletion'
      });

      // Test destruction process (simulated)
      const destructionResult = await nsmHandler.scheduleDestruction(classified.id);

      expect(destructionResult).toMatchObject({
        documentId: classified.id,
        scheduled: true,
        destructionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        destructionMethod: 'secure_deletion',
        verification: 'certificate_required'
      });

      logger.info('Data retention and destruction policy validated', {
        documentId: classified.id,
        retentionPeriod: classified.metadata.retentionInfo.retentionPeriod,
        destructionScheduled: destructionResult.scheduled
      });
    });
  });

  describe('Integration Testing', () => {
    it('should integrate with Norwegian government security standards', async () => {
      // Test integration with Norwegian security framework
      const testData = {
        content: 'Data for Norwegian government integration',
        metadata: {
          title: 'Government Integration Test',
          agency: 'Digitaliseringsdirektoratet',
          sector: 'public'
        }
      };

      const classified = await nsmHandler.classifyData(testData, 'RESTRICTED');

      // Verify Norwegian-specific metadata
      expect(classified.metadata).toMatchObject({
        norwegianCompliance: true,
        securityFramework: 'NSM',
        language: 'nb-NO',
        jurisdiction: 'Norway',
        regulatoryFramework: 'Sikkerhetsloven',
        complianceStandards: expect.arrayContaining([
          'NSM Grunnprinsipper for IKT-sikkerhet',
          'Sikkerhetsloven',
          'Personopplysningsloven'
        ])
      });

      logger.info('Norwegian government security standards integration validated', {
        norwegianCompliance: classified.metadata.norwegianCompliance,
        securityFramework: classified.metadata.securityFramework,
        regulatoryFramework: classified.metadata.regulatoryFramework
      });
    });

    it('should validate end-to-end classification workflow', async () => {
      // Complete workflow: Create -> Classify -> Access -> Review -> Archive
      const workflowData = {
        content: 'End-to-end workflow test data',
        metadata: {
          title: 'Workflow Test Document',
          creator: 'Xaheen CLI Test Suite'
        }
      };

      // Step 1: Classify
      const classified = await nsmHandler.classifyData(workflowData, 'CONFIDENTIAL');
      expect(classified.classification).toBe('CONFIDENTIAL');

      // Step 2: Access (authorized)
      const accessResult = await nsmHandler.accessClassifiedData(classified.id, {
        userId: 'authorized-user',
        clearanceLevel: 'confidential',
        authMethod: 'two_factor',
        purpose: 'legitimate_access'
      });
      expect(accessResult.granted).toBe(true);

      // Step 3: Review
      const reviewResult = await nsmHandler.conductClassificationReview(classified.id);
      expect(reviewResult.reviewStatus).toBe('completed');

      // Step 4: Archive
      const archiveResult = await nsmHandler.archiveClassifiedData(classified.id, {
        archiveLocation: 'secure_storage',
        retainMetadata: true
      });
      expect(archiveResult.archived).toBe(true);

      // Verify complete audit trail
      const auditTrail = await auditLogger.getDocumentAuditTrail(classified.id);
      const expectedEvents = ['classification', 'access', 'review', 'archive'];
      
      expectedEvents.forEach(event => {
        const eventLog = auditTrail.find(log => log.event.toLowerCase().includes(event));
        expect(eventLog).toBeDefined();
      });

      logger.info('End-to-end classification workflow validated', {
        documentId: classified.id,
        workflowSteps: expectedEvents.length,
        auditEvents: auditTrail.length
      });
    });
  });
});
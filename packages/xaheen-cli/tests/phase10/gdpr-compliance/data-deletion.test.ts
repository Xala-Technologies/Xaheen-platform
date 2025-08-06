/**
 * GDPR Data Deletion Tests
 * 
 * Tests automated data deletion workflows, retention policies,
 * and right to erasure implementation as per GDPR Article 17.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { loadPhase10Config } from '../config/test-config';
import { DataDeletionService } from '../utils/data-deletion-service';
import { RetentionPolicyManager } from '../utils/retention-policy-manager';
import { ComplianceLogger } from '../utils/compliance-logger';
import { DataInventoryService } from '../utils/data-inventory-service';

const config = loadPhase10Config();
const logger = new ComplianceLogger('GDPR-Data-Deletion');

describe('GDPR Data Deletion Tests', () => {
  let deletionService: DataDeletionService;
  let retentionManager: RetentionPolicyManager;
  let dataInventory: DataInventoryService;

  beforeAll(async () => {
    // Initialize data deletion infrastructure
    deletionService = new DataDeletionService({
      deletionQueueUrl: config.gdpr.deletionQueueUrl,
      storageBackends: ['postgresql', 'redis', 'filesystem'],
      certificationRequired: true
    });

    retentionManager = new RetentionPolicyManager({
      policyDatabase: config.gdpr.processingLogUrl,
      automaticDeletion: true
    });

    dataInventory = new DataInventoryService({
      scanInterval: '24h',
      deepScan: true
    });
    
    // Verify deletion infrastructure
    const isReady = await deletionService.verifyInfrastructure();
    if (!isReady) {
      throw new Error('Data deletion infrastructure not ready');
    }
    
    logger.info('GDPR data deletion infrastructure initialized', {
      deletionService: 'ready',
      retentionPolicies: 'active',
      dataInventory: 'scanning'
    });
  });

  afterAll(async () => {
    await deletionService.cleanup();
    await retentionManager.cleanup();
    logger.info('GDPR data deletion tests completed');
  });

  describe('Automated Data Deletion', () => {
    it('should delete data automatically based on retention policies', async () => {
      // Create test data with short retention period
      const testDataSubject = 'test-auto-deletion-subject';
      const testData = {
        dataSubjectId: testDataSubject,
        email: 'auto.deletion@example.com',
        createdDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days ago
        dataCategories: ['contact', 'usage_data'],
        retentionPolicy: {
          category: 'user_data',
          retentionPeriod: '30D', // 30 days
          autoDelete: true
        },
        lastActivityDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() // 31 days ago
      };

      // Store test data
      await dataInventory.storeTestData(testData);

      logger.info('Running automated deletion scan', {
        dataSubjectId: testDataSubject,
        retentionPeriod: testData.retentionPolicy.retentionPeriod,
        dataAge: '32 days'
      });

      // Run automated deletion scan
      const deletionScan = await deletionService.runAutomatedDeletionScan();

      expect(deletionScan).toMatchObject({
        scanId: expect.stringMatching(/^scan-[a-f0-9-]{36}$/),
        scanDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        recordsScanned: expect.any(Number),
        recordsMarkedForDeletion: expect.any(Number),
        deletionScheduled: expect.any(Number),
        retentionPolicyViolations: expect.any(Array)
      });

      // Verify test data was marked for deletion
      const markedRecords = deletionScan.retentionPolicyViolations.find(
        violation => violation.dataSubjectId === testDataSubject
      );

      expect(markedRecords).toMatchObject({
        dataSubjectId: testDataSubject,
        violationType: 'retention_period_exceeded',
        retentionPeriod: '30D',
        actualAge: expect.stringContaining('32'),
        scheduledDeletion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        deletionMethod: 'secure_deletion'
      });

      // Execute scheduled deletions
      const deletionExecution = await deletionService.executeScheduledDeletions();

      expect(deletionExecution.deletedRecords).toContain(testDataSubject);

      // Verify data is actually deleted
      const postDeletionScan = await dataInventory.findDataBySubject(testDataSubject);
      expect(postDeletionScan.found).toBe(false);
      expect(postDeletionScan.records).toHaveLength(0);

      logger.info('Automated deletion completed successfully', {
        scanId: deletionScan.scanId,
        recordsDeleted: deletionExecution.deletedRecords.length,
        dataRemoved: postDeletionScan.found === false
      });
    }, 60000);

    it('should respect data retention hierarchies and legal holds', async () => {
      const testDataSubject = 'test-legal-hold-subject';
      
      // Create data with conflicting retention requirements
      const testData = {
        dataSubjectId: testDataSubject,
        email: 'legal.hold@example.com',
        createdDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // 400 days ago
        dataCategories: ['financial', 'audit', 'legal'],
        retentionPolicies: [
          {
            category: 'user_data',
            retentionPeriod: '1Y', // User data: 1 year
            source: 'privacy_policy',
            priority: 1
          },
          {
            category: 'financial_records',
            retentionPeriod: '7Y', // Financial: 7 years (Norwegian law)
            source: 'norwegian_accounting_act',
            priority: 2,
            legalRequirement: true
          },
          {
            category: 'audit_trail',
            retentionPeriod: '10Y', // Audit: 10 years
            source: 'nsm_security_requirements',
            priority: 3,
            legalRequirement: true
          }
        ],
        legalHolds: [
          {
            holdId: 'litigation-hold-2024-001',
            reason: 'Ongoing legal proceedings',
            appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            expectedReleaseDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      await dataInventory.storeTestData(testData);

      // Run deletion analysis
      const retentionAnalysis = await retentionManager.analyzeRetentionRequirements(testDataSubject);

      expect(retentionAnalysis).toMatchObject({
        dataSubjectId: testDataSubject,
        effectiveRetentionPeriod: '10Y', // Longest legal requirement wins
        retentionReason: 'nsm_security_requirements',
        canDeleteNow: false,
        blockers: expect.arrayContaining([
          expect.objectContaining({
            type: 'legal_hold',
            reason: 'Ongoing legal proceedings'
          }),
          expect.objectContaining({
            type: 'legal_requirement',
            source: 'norwegian_accounting_act'
          })
        ]),
        earliestDeletionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      // Verify data cannot be deleted due to legal holds
      const deletionAttempt = await deletionService.attemptDeletion(testDataSubject);

      expect(deletionAttempt).toMatchObject({
        dataSubjectId: testDataSubject,
        deletionAllowed: false,
        reason: 'legal_hold_active',
        blockers: expect.arrayContaining([
          'litigation-hold-2024-001'
        ])
      });

      logger.info('Legal hold and retention hierarchy respected', {
        dataSubjectId: testDataSubject,
        effectiveRetention: retentionAnalysis.effectiveRetentionPeriod,
        deletionBlocked: deletionAttempt.deletionAllowed === false,
        blockers: deletionAttempt.blockers.length
      });
    });

    it('should implement secure deletion methods', async () => {
      const testDataSubject = 'test-secure-deletion-subject';
      
      // Create data with different security classifications
      const testData = {
        dataSubjectId: testDataSubject,
        email: 'secure.deletion@example.com',
        classifications: [
          {
            dataType: 'personal_data',
            classification: 'RESTRICTED',
            deletionMethod: 'cryptographic_erasure'
          },
          {
            dataType: 'biometric_data',
            classification: 'CONFIDENTIAL',
            deletionMethod: 'multi_pass_overwrite'
          },
          {
            dataType: 'financial_data',
            classification: 'SECRET',
            deletionMethod: 'degaussing_required'
          }
        ],
        storageLocations: [
          { type: 'database', location: 'postgresql://primary', encrypted: true },
          { type: 'cache', location: 'redis://cache', encrypted: true },
          { type: 'filesystem', location: '/secure/storage/', encrypted: true },
          { type: 'backup', location: 'tape://backup-01', encrypted: true }
        ]
      };

      await dataInventory.storeTestData(testData);

      // Execute secure deletion
      logger.info('Executing secure deletion with multiple methods', {
        dataSubjectId: testDataSubject,
        classifications: testData.classifications.length,
        storageLocations: testData.storageLocations.length
      });

      const secureDeletion = await deletionService.executeSecureDeletion(testDataSubject, {
        certificationRequired: true,
        verificationRequired: true,
        auditTrail: true
      });

      expect(secureDeletion).toMatchObject({
        deletionId: expect.stringMatching(/^secure-del-[a-f0-9-]{36}$/),
        dataSubjectId: testDataSubject,
        status: 'completed',
        deletionMethods: expect.arrayContaining([
          expect.objectContaining({
            dataType: 'personal_data',
            method: 'cryptographic_erasure',
            status: 'completed',
            verification: {
              verified: true,
              method: 'key_destruction_verified'
            }
          }),
          expect.objectContaining({
            dataType: 'biometric_data',
            method: 'multi_pass_overwrite',
            status: 'completed',
            passes: 7, // DoD 5220.22-M standard
            verification: {
              verified: true,
              method: 'read_verification'
            }
          })
        ]),
        storageCleanup: expect.arrayContaining([
          expect.objectContaining({
            location: 'postgresql://primary',
            method: 'sql_delete_with_vacuum',
            verified: true
          }),
          expect.objectContaining({
            location: 'redis://cache',
            method: 'key_expiration',
            verified: true
          })
        ]),
        certificate: {
          issued: true,
          certificateId: expect.stringMatching(/^cert-[a-f0-9-]{36}$/),
          issuedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          standard: 'NIST_SP_800-88',
          signatureValid: true
        },
        auditTrail: {
          recorded: true,
          events: expect.any(Number),
          immutable: true
        }
      });

      // Verify complete data removal
      const verificationScan = await dataInventory.performDeepScan(testDataSubject);

      expect(verificationScan).toMatchObject({
        dataSubjectId: testDataSubject,
        scanDepth: 'comprehensive',
        dataFound: false,
        locationsScanned: expect.any(Number),
        deletionVerified: true,
        residualData: []
      });

      logger.info('Secure deletion completed and verified', {
        deletionId: secureDeletion.deletionId,
        methods: secureDeletion.deletionMethods.length,
        certificateIssued: secureDeletion.certificate.issued,
        verificationPassed: verificationScan.deletionVerified
      });
    }, 90000);
  });

  describe('Right to Erasure Implementation', () => {
    it('should process erasure requests within legal timeframes', async () => {
      const testDataSubject = 'test-erasure-timeframe-subject';
      
      // Create comprehensive data set
      const testData = {
        dataSubjectId: testDataSubject,
        email: 'erasure.timeframe@example.com',
        personalData: {
          name: 'Test Subject',
          phone: '+47 12345678',
          address: 'Test Address, Oslo, Norway'
        },
        processingData: {
          preferences: { theme: 'dark', language: 'nb-NO' },
          usageHistory: Array.from({ length: 100 }, (_, i) => ({
            action: `command_${i}`,
            timestamp: new Date(Date.now() - i * 60000).toISOString()
          })),
          generatedTemplates: 25
        },
        metadata: {
          accountCreated: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dataSize: '2.5MB'
        }
      };

      await dataInventory.storeTestData(testData);

      // Submit erasure request
      const erasureRequest = {
        dataSubjectId: testDataSubject,
        requestType: 'right_to_erasure',
        requestDate: new Date().toISOString(),
        grounds: 'consent_withdrawn',
        urgency: 'standard', // 30 days for standard, 72 hours for children
        scope: 'complete_erasure',
        contactMethod: 'email',
        identityVerified: true
      };

      logger.info('Processing right to erasure request', {
        dataSubjectId: testDataSubject,
        grounds: erasureRequest.grounds,
        urgency: erasureRequest.urgency
      });

      const erasureResponse = await deletionService.processErasureRequest(erasureRequest);

      expect(erasureResponse).toMatchObject({
        requestId: expect.stringMatching(/^erasure-req-[a-f0-9-]{36}$/),
        dataSubjectId: testDataSubject,
        status: 'accepted',
        acceptedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        legalDeadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // 30 days from request
        estimatedCompletion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        erasureScope: {
          personalData: true,
          processingData: true,
          backups: true,
          thirdPartyData: true,
          auditLogs: false // Retained for legal compliance
        },
        confirmation: {
          method: 'email',
          address: testData.email,
          language: 'nb-NO'
        }
      });

      // Verify deadline calculation (30 days for standard requests)
      const requestDate = new Date(erasureRequest.requestDate);
      const deadline = new Date(erasureResponse.legalDeadline);
      const daysDifference = Math.ceil((deadline.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeLessThanOrEqual(30);

      // Execute erasure
      const executionResult = await deletionService.executeErasureRequest(erasureResponse.requestId);

      expect(executionResult).toMatchObject({
        requestId: erasureResponse.requestId,
        status: 'completed',
        completionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        withinDeadline: true,
        erasedData: {
          personalDataRecords: expect.any(Number),
          processingRecords: expect.any(Number),
          backupRecords: expect.any(Number),
          totalSize: expect.stringMatching(/^\d+\.?\d*\s?(MB|KB|GB)$/)
        },
        retainedData: {
          auditLogs: expect.any(Number),
          legalObligations: expect.any(Array)
        }
      });

      expect(executionResult.withinDeadline).toBe(true);

      logger.info('Right to erasure completed within legal timeframe', {
        requestId: executionResult.requestId,
        completedWithinDeadline: executionResult.withinDeadline,
        totalDataErased: executionResult.erasedData.totalSize
      });
    }, 120000);

    it('should handle child data with expedited deletion (72 hours)', async () => {
      const childDataSubject = 'test-child-data-subject';
      
      // Create child data (special protection required)
      const childData = {
        dataSubjectId: childDataSubject,
        email: 'child.test@example.com',
        personalData: {
          name: 'Child Test Subject',
          age: 15, // Under 18
          parentalConsent: true,
          parentEmail: 'parent@example.com'
        },
        specialCategory: 'child_data',
        processingBasis: 'parental_consent',
        createdDate: new Date().toISOString()
      };

      await dataInventory.storeTestData(childData);

      // Submit expedited erasure request for child data
      const childErasureRequest = {
        dataSubjectId: childDataSubject,
        requestType: 'right_to_erasure',
        requestDate: new Date().toISOString(),
        grounds: 'parental_consent_withdrawn',
        urgency: 'child_data', // Expedited processing required
        requester: 'parent',
        parentalAuthorization: true,
        scope: 'complete_erasure'
      };

      const childErasureResponse = await deletionService.processErasureRequest(childErasureRequest);

      expect(childErasureResponse).toMatchObject({
        requestId: expect.stringMatching(/^child-erasure-[a-f0-9-]{36}$/),
        dataSubjectId: childDataSubject,
        status: 'expedited',
        priority: 'highest',
        legalDeadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // 72 hours
        specialProtections: {
          childData: true,
          expeditedProcessing: true,
          parentalNotification: true
        }
      });

      // Verify 72-hour deadline for child data
      const requestDate = new Date(childErasureRequest.requestDate);
      const deadline = new Date(childErasureResponse.legalDeadline);
      const hoursDifference = (deadline.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
      
      expect(hoursDifference).toBeLessThanOrEqual(72);

      // Execute expedited deletion
      const expeditedExecution = await deletionService.executeErasureRequest(
        childErasureResponse.requestId,
        { expedited: true, priority: 'highest' }
      );

      expect(expeditedExecution.withinDeadline).toBe(true);
      expect(expeditedExecution.status).toBe('completed');

      logger.info('Child data erasure completed within 72 hours', {
        requestId: expeditedExecution.requestId,
        hoursToCompletion: hoursDifference,
        withinDeadline: expeditedExecution.withinDeadline
      });
    });

    it('should handle partial erasure when legal obligations exist', async () => {
      const testDataSubject = 'test-partial-erasure-subject';
      
      // Create data with mixed legal obligations
      const mixedData = {
        dataSubjectId: testDataSubject,
        email: 'partial.erasure@example.com',
        dataCategories: [
          {
            type: 'marketing_preferences',
            legalBasis: 'consent',
            canErase: true,
            retention: 'consent_based'
          },
          {
            type: 'financial_transactions',
            legalBasis: 'legal_obligation',
            canErase: false,
            retention: '7Y',
            norwegianLaw: 'Bokføringsloven'
          },
          {
            type: 'audit_logs',
            legalBasis: 'legal_obligation',
            canErase: false,
            retention: '10Y',
            securityRequirement: 'NSM Framework'
          },
          {
            type: 'user_preferences',
            legalBasis: 'consent',
            canErase: true,
            retention: 'consent_based'
          }
        ]
      };

      await dataInventory.storeTestData(mixedData);

      const partialErasureRequest = {
        dataSubjectId: testDataSubject,
        requestType: 'right_to_erasure',
        scope: 'all_erasable_data',
        acknowledgePartialErasure: true
      };

      const partialErasureResponse = await deletionService.processErasureRequest(partialErasureRequest);

      expect(partialErasureResponse).toMatchObject({
        requestId: expect.stringMatching(/^partial-erasure-[a-f0-9-]{36}$/),
        dataSubjectId: testDataSubject,
        status: 'partial_erasure_only',
        erasableData: expect.arrayContaining([
          expect.objectContaining({
            type: 'marketing_preferences',
            canErase: true,
            reason: 'consent_based'
          }),
          expect.objectContaining({
            type: 'user_preferences',
            canErase: true,
            reason: 'consent_based'
          })
        ]),
        retainedData: expect.arrayContaining([
          expect.objectContaining({
            type: 'financial_transactions',
            canErase: false,
            reason: 'legal_obligation',
            legalBasis: 'Bokføringsloven'
          }),
          expect.objectContaining({
            type: 'audit_logs',
            canErase: false,
            reason: 'security_requirement',
            legalBasis: 'NSM Framework'
          })
        ]),
        explanation: expect.stringContaining('Some data cannot be erased due to legal obligations')
      });

      // Execute partial erasure
      const partialExecution = await deletionService.executeErasureRequest(partialErasureResponse.requestId);

      expect(partialExecution).toMatchObject({
        requestId: partialErasureResponse.requestId,
        status: 'partially_completed',
        erasedCategories: ['marketing_preferences', 'user_preferences'],
        retainedCategories: ['financial_transactions', 'audit_logs'],
        partialErasureConfirmation: {
          sent: true,
          explanation: expect.stringContaining('legal obligations'),
          dataSubjectInformed: true
        }
      });

      // Verify only erasable data was deleted
      const postErasureInventory = await dataInventory.findDataBySubject(testDataSubject);
      
      expect(postErasureInventory.found).toBe(true);
      expect(postErasureInventory.records).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'financial_transactions' }),
          expect.objectContaining({ type: 'audit_logs' })
        ])
      );
      
      expect(postErasureInventory.records).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'marketing_preferences' }),
          expect.objectContaining({ type: 'user_preferences' })
        ])
      );

      logger.info('Partial erasure completed correctly', {
        requestId: partialExecution.requestId,
        erasedCategories: partialExecution.erasedCategories.length,
        retainedCategories: partialExecution.retainedCategories.length,
        dataSubjectInformed: partialExecution.partialErasureConfirmation.dataSubjectInformed
      });
    });
  });

  describe('Deletion Monitoring and Reporting', () => {
    it('should generate comprehensive deletion reports', async () => {
      // Generate monthly deletion report
      const deletionReport = await deletionService.generateDeletionReport({
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        includeMetrics: true,
        includeCompliance: true
      });

      expect(deletionReport).toMatchObject({
        reportId: expect.stringMatching(/^del-report-[a-f0-9-]{36}$/),
        reportPeriod: expect.objectContaining({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        }),
        summary: {
          totalDeletionRequests: expect.any(Number),
          automaticDeletions: expect.any(Number),
          manualDeletions: expect.any(Number),
          partialDeletions: expect.any(Number),
          averageProcessingTime: expect.any(Number), // hours
          complianceRate: expect.any(Number) // percentage
        },
        deletionMethods: expect.objectContaining({
          cryptographic_erasure: expect.any(Number),
          multi_pass_overwrite: expect.any(Number),
          sql_delete: expect.any(Number),
          key_destruction: expect.any(Number)
        }),
        legalCompliance: {
          withinDeadline: expect.any(Number),
          overdueRequests: expect.any(Number),
          childDataRequests: expect.any(Number),
          expeditedProcessing: expect.any(Number)
        },
        dataVolume: {
          totalDataDeleted: expect.stringMatching(/^\d+\.?\d*\s?(MB|GB|TB)$/),
          largestDeletion: expect.stringMatching(/^\d+\.?\d*\s?(MB|GB|TB)$/),
          averageDeletionSize: expect.stringMatching(/^\d+\.?\d*\s?(MB|KB|GB)$/)
        },
        auditInfo: {
          certificatesIssued: expect.any(Number),
          auditTrailsCreated: expect.any(Number),
          verificationsPassed: expect.any(Number)
        }
      });

      expect(deletionReport.summary.complianceRate).toBeGreaterThanOrEqual(95);

      logger.info('Deletion report generated successfully', {
        reportId: deletionReport.reportId,
        totalRequests: deletionReport.summary.totalDeletionRequests,
        complianceRate: deletionReport.summary.complianceRate,
        dataDeleted: deletionReport.dataVolume.totalDataDeleted
      });
    });

    it('should monitor deletion queue health and performance', async () => {
      const queueHealth = await deletionService.monitorDeletionQueue();

      expect(queueHealth).toMatchObject({
        queueStatus: 'healthy',
        queueDepth: expect.any(Number),
        averageProcessingTime: expect.any(Number),
        oldestRequest: expect.any(String),
        processingRate: expect.any(Number), // requests per hour
        failureRate: expect.any(Number),    // percentage
        alerts: expect.any(Array),
        recommendations: expect.any(Array)
      });

      // Verify queue is performing within acceptable parameters
      expect(queueHealth.failureRate).toBeLessThan(5); // Less than 5% failures
      expect(queueHealth.processingRate).toBeGreaterThan(10); // At least 10 requests per hour

      if (queueHealth.alerts.length > 0) {
        logger.warn('Deletion queue alerts detected', {
          alerts: queueHealth.alerts,
          queueDepth: queueHealth.queueDepth
        });
      }

      logger.info('Deletion queue health monitored', {
        status: queueHealth.queueStatus,
        queueDepth: queueHealth.queueDepth,
        processingRate: queueHealth.processingRate,
        alerts: queueHealth.alerts.length
      });
    });

    it('should validate deletion completeness and integrity', async () => {
      const testDataSubject = 'test-integrity-validation-subject';
      
      // Create data across multiple storage systems
      const distributedData = {
        dataSubjectId: testDataSubject,
        email: 'integrity.test@example.com',
        storageLocations: [
          { system: 'primary_db', records: 15 },
          { system: 'cache_layer', records: 8 },
          { system: 'search_index', records: 12 },
          { system: 'backup_storage', records: 15 },
          { system: 'log_files', records: 45 }
        ]
      };

      await dataInventory.storeDistributedTestData(distributedData);

      // Execute deletion
      const deletionResult = await deletionService.executeSecureDeletion(testDataSubject, {
        verificationRequired: true,
        integrityCheck: true
      });

      // Validate deletion integrity
      const integrityValidation = await deletionService.validateDeletionIntegrity(
        deletionResult.deletionId
      );

      expect(integrityValidation).toMatchObject({
        deletionId: deletionResult.deletionId,
        dataSubjectId: testDataSubject,
        integrityStatus: 'verified',
        validationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        storageSystemsVerified: expect.arrayContaining([
          expect.objectContaining({
            system: 'primary_db',
            recordsDeleted: 15,
            verificationMethod: 'sql_count_query',
            verified: true
          }),
          expect.objectContaining({
            system: 'cache_layer',
            recordsDeleted: 8,
            verificationMethod: 'key_existence_check',
            verified: true
          })
        ]),
        completenessScore: 100, // All records deleted
        residualDataFound: false,
        integrityHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        certificate: {
          issued: true,
          validationComplete: true
        }
      });

      expect(integrityValidation.completenessScore).toBe(100);
      expect(integrityValidation.residualDataFound).toBe(false);

      logger.info('Deletion integrity validation completed', {
        deletionId: integrityValidation.deletionId,
        completenessScore: integrityValidation.completenessScore,
        systemsVerified: integrityValidation.storageSystemsVerified.length,
        residualData: integrityValidation.residualDataFound
      });
    });
  });
});
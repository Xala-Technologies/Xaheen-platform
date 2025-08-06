/**
 * Digipost Document Submission Tests
 * 
 * Tests document delivery through Digipost with full compliance metadata.
 * Uses official Digipost test API with document simulation.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadPhase10Config, DigipostTestRecipient } from '../config/test-config';
import { DigipostClient } from '../utils/digipost-client';
import { ComplianceLogger } from '../utils/compliance-logger';
import { createTestDocument, createComplianceMetadata } from '../utils/document-helpers';

const config = loadPhase10Config();
const logger = new ComplianceLogger('Digipost-Document-Submission');

describe('Digipost Document Submission Tests', () => {
  let digipostClient: DigipostClient;
  let testRecipients: DigipostTestRecipient[];

  beforeAll(async () => {
    // Initialize Digipost client with test configuration
    digipostClient = new DigipostClient({
      endpoint: config.digipost.testEndpoint,
      apiKey: config.digipost.apiKey,
      testMode: true
    });

    testRecipients = config.digipost.testRecipients;
    
    // Verify test environment connectivity
    const isConnected = await digipostClient.verifyConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to Digipost test environment');
    }
    
    logger.info('Digipost test environment connected', {
      endpoint: config.digipost.testEndpoint,
      testRecipients: testRecipients.length,
      supportedTypes: config.digipost.documentTypes
    });
  });

  afterAll(async () => {
    await digipostClient.cleanup();
    logger.info('Digipost document submission tests completed');
  });

  describe('Document Preparation', () => {
    it('should create valid PDF document with compliance metadata', async () => {
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Test Compliance Document',
        content: 'This is a test document for compliance validation.',
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          dataSubjects: ['test-subject-1'],
          legalBasis: 'consent',
          retentionPeriod: '7Y',
          creator: 'Xaheen CLI Test Suite'
        })
      });

      expect(testDocument).toMatchObject({
        id: expect.any(String),
        type: 'PDF',
        title: 'Test Compliance Document',
        size: expect.any(Number),
        checksum: expect.stringMatching(/^[a-f0-9]{64}$/), // SHA-256
        metadata: expect.objectContaining({
          classification: 'OPEN',
          dataSubjects: ['test-subject-1'],
          legalBasis: 'consent',
          retentionPeriod: '7Y',
          creator: 'Xaheen CLI Test Suite',
          createdDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
      });

      expect(testDocument.size).toBeGreaterThan(0);
      expect(testDocument.size).toBeLessThan(50 * 1024 * 1024); // 50MB limit

      logger.info('PDF document created with compliance metadata', {
        documentId: testDocument.id,
        type: testDocument.type,
        size: testDocument.size,
        classification: testDocument.metadata.classification
      });
    });

    it('should create valid HTML document with accessibility compliance', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Accessible Test Document</title>
        </head>
        <body>
          <header>
            <h1>Test Document</h1>
          </header>
          <main>
            <section aria-labelledby="content-heading">
              <h2 id="content-heading">Document Content</h2>
              <p>This is an accessible HTML document for testing purposes.</p>
              <table>
                <caption>Test Data Table</caption>
                <thead>
                  <tr>
                    <th scope="col">Column 1</th>
                    <th scope="col">Column 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Data 1</td>
                    <td>Data 2</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </main>
        </body>
        </html>
      `;

      const testDocument = await createTestDocument({
        type: 'HTML',
        title: 'Accessible Test Document',
        content: htmlContent,
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          accessibility: {
            wcagLevel: 'AAA',
            validated: true,
            validationDate: new Date().toISOString()
          }
        })
      });

      expect(testDocument.metadata.accessibility).toMatchObject({
        wcagLevel: 'AAA',
        validated: true,
        validationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      logger.info('HTML document created with accessibility compliance', {
        documentId: testDocument.id,
        wcagLevel: testDocument.metadata.accessibility.wcagLevel,
        validated: testDocument.metadata.accessibility.validated
      });
    });

    it('should validate document against security classifications', async () => {
      // Test RESTRICTED document
      const restrictedDocument = await createTestDocument({
        type: 'PDF',
        title: 'Restricted Test Document',
        content: 'This document contains restricted information.',
        metadata: createComplianceMetadata({
          classification: 'RESTRICTED',
          dataSubjects: ['test-subject-restricted'],
          legalBasis: 'legal_obligation',
          encryptionRequired: true
        })
      });

      expect(restrictedDocument.metadata.classification).toBe('RESTRICTED');
      expect(restrictedDocument.metadata.encryptionRequired).toBe(true);
      expect(restrictedDocument.encrypted).toBe(true);

      // Test CONFIDENTIAL document
      const confidentialDocument = await createTestDocument({
        type: 'PDF',
        title: 'Confidential Test Document',
        content: 'This document contains confidential information.',
        metadata: createComplianceMetadata({
          classification: 'CONFIDENTIAL',
          dataSubjects: ['test-subject-confidential'],
          legalBasis: 'legal_obligation',
          encryptionRequired: true,
          accessControl: ['admin', 'legal']
        })
      });

      expect(confidentialDocument.metadata.classification).toBe('CONFIDENTIAL');
      expect(confidentialDocument.metadata.accessControl).toContain('admin');
      expect(confidentialDocument.metadata.accessControl).toContain('legal');

      logger.info('Security classification validation successful', {
        restrictedDoc: restrictedDocument.id,
        confidentialDoc: confidentialDocument.id
      });
    });
  });

  describe('Document Submission', () => {
    it('should submit PDF document successfully to test recipient', async () => {
      const testRecipient = testRecipients[0];
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Test PDF Submission',
        content: 'This is a test PDF document for submission testing.',
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          purpose: 'testing',
          dataSubjects: [testRecipient.personalNumber]
        })
      });

      logger.info('Submitting PDF document to Digipost', {
        recipient: testRecipient.name,
        personalNumber: testRecipient.personalNumber,
        documentId: testDocument.id
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument,
        options: {
          requireAuth: true,
          deliveryTime: 'immediate',
          notificationSettings: {
            email: true,
            sms: false
          }
        }
      });

      expect(submission).toMatchObject({
        submissionId: expect.stringMatching(/^[a-f0-9-]{36}$/), // UUID format
        status: 'submitted',
        deliveryMethod: 'digipost',
        estimatedDelivery: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        trackingUrl: expect.stringContaining('digipost.no'),
        recipient: expect.objectContaining({
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name
        }),
        document: expect.objectContaining({
          id: testDocument.id,
          title: testDocument.title,
          type: 'PDF'
        })
      });

      logger.info('PDF document submitted successfully', {
        submissionId: submission.submissionId,
        status: submission.status,
        trackingUrl: submission.trackingUrl
      });
    }, 60000);

    it('should submit HTML document with Norwegian language settings', async () => {
      const testRecipient = testRecipients[0];
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="nb-NO">
        <head>
          <meta charset="UTF-8">
          <title>Norsk Testdokument</title>
        </head>
        <body>
          <h1>Testdokument på norsk</h1>
          <p>Dette er et testdokument skrevet på norsk bokmål.</p>
          <p>Dokumentet inneholder æøå og andre norske tegn.</p>
        </body>
        </html>
      `;

      const testDocument = await createTestDocument({
        type: 'HTML',
        title: 'Norsk Testdokument',
        content: htmlContent,
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          language: 'nb-NO',
          purpose: 'testing_norwegian_content'
        })
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument,
        options: {
          language: 'nb-NO',
          requireAuth: true
        }
      });

      expect(submission.status).toBe('submitted');
      expect(submission.document.metadata.language).toBe('nb-NO');

      logger.info('Norwegian HTML document submitted successfully', {
        submissionId: submission.submissionId,
        language: submission.document.metadata.language
      });
    }, 60000);

    it('should handle large document submission (within limits)', async () => {
      const testRecipient = testRecipients[0];
      
      // Create a larger test document (but within Digipost limits)
      const largeContent = 'Large document content. '.repeat(10000); // ~250KB
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Large Test Document',
        content: largeContent,
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          purpose: 'testing_large_document'
        })
      });

      expect(testDocument.size).toBeGreaterThan(100000); // > 100KB
      expect(testDocument.size).toBeLessThan(50 * 1024 * 1024); // < 50MB

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument
      });

      expect(submission.status).toBe('submitted');

      logger.info('Large document submitted successfully', {
        submissionId: submission.submissionId,
        documentSize: testDocument.size
      });
    }, 120000); // Longer timeout for large documents

    it('should reject oversized documents', async () => {
      const testRecipient = testRecipients[0];
      
      // Create an oversized test document (> 50MB limit)
      const oversizedContent = 'X'.repeat(51 * 1024 * 1024); // 51MB
      
      await expect(createTestDocument({
        type: 'PDF',
        title: 'Oversized Test Document',
        content: oversizedContent,
        metadata: createComplianceMetadata({
          classification: 'OPEN'
        })
      })).rejects.toThrow(/document too large|size limit|exceeds maximum/i);

      logger.info('Oversized document properly rejected');
    });
  });

  describe('Delivery Tracking', () => {
    it('should track document delivery status', async () => {
      const testRecipient = testRecipients[0];
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Trackable Test Document',
        content: 'This document will be tracked for delivery status.',
        metadata: createComplianceMetadata({
          classification: 'OPEN',
          tracking: true
        })
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument,
        options: {
          trackDelivery: true
        }
      });

      // Track delivery status
      const deliveryStatus = await digipostClient.getDeliveryStatus(submission.submissionId);

      expect(deliveryStatus).toMatchObject({
        submissionId: submission.submissionId,
        status: expect.stringMatching(/^(submitted|processing|delivered|failed)$/),
        statusHistory: expect.arrayContaining([
          expect.objectContaining({
            status: 'submitted',
            timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
            description: expect.any(String)
          })
        ]),
        lastUpdated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      logger.info('Document delivery tracking working', {
        submissionId: submission.submissionId,
        currentStatus: deliveryStatus.status,
        statusHistory: deliveryStatus.statusHistory.length
      });
    }, 60000);

    it('should provide delivery confirmation when document is read', async () => {
      const testRecipient = testRecipients[0];
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Confirmation Test Document',
        content: 'This document requires read confirmation.',
        metadata: createComplianceMetadata({
          classification: 'RESTRICTED',
          requireConfirmation: true
        })
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument,
        options: {
          requireReadConfirmation: true,
          trackDelivery: true
        }
      });

      // In test environment, simulate document being read
      await digipostClient.simulateDocumentRead(submission.submissionId);

      const deliveryStatus = await digipostClient.getDeliveryStatus(submission.submissionId);
      const readConfirmation = deliveryStatus.statusHistory.find(s => s.status === 'read');

      expect(readConfirmation).toBeDefined();
      expect(readConfirmation).toMatchObject({
        status: 'read',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        confirmationMethod: expect.any(String)
      });

      logger.info('Read confirmation received', {
        submissionId: submission.submissionId,
        readTimestamp: readConfirmation!.timestamp
      });
    }, 60000);

    it('should handle delivery failures gracefully', async () => {
      // Use invalid recipient to simulate delivery failure
      const invalidRecipient = {
        personalNumber: '00000000000', // Invalid personal number
        name: 'Invalid Test User',
        address: {
          street: 'Invalid Street',
          postalCode: '0000',
          city: 'Invalid City'
        }
      };

      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Failure Test Document',
        content: 'This document should fail delivery.',
        metadata: createComplianceMetadata({
          classification: 'OPEN'
        })
      });

      await expect(digipostClient.submitDocument({
        recipient: invalidRecipient,
        document: testDocument
      })).rejects.toThrow(/invalid recipient|delivery failed|not found/i);

      logger.info('Delivery failure handled correctly');
    });
  });

  describe('Compliance Validation', () => {
    it('should validate GDPR compliance metadata', async () => {
      const testRecipient = testRecipients[0];
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'GDPR Compliant Document',
        content: 'This document contains personal data and must be GDPR compliant.',
        metadata: createComplianceMetadata({
          classification: 'RESTRICTED',
          dataSubjects: [testRecipient.personalNumber],
          personalDataCategories: ['identification', 'contact'],
          legalBasis: 'consent',
          consentId: 'consent-12345',
          retentionPeriod: '3Y',
          dataProcessingPurpose: 'service_delivery',
          gdprCompliant: true
        })
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument
      });

      // Validate GDPR metadata is preserved
      expect(submission.document.metadata).toMatchObject({
        gdprCompliant: true,
        dataSubjects: [testRecipient.personalNumber],
        personalDataCategories: ['identification', 'contact'],
        legalBasis: 'consent',
        consentId: 'consent-12345',
        retentionPeriod: '3Y',
        dataProcessingPurpose: 'service_delivery'
      });

      logger.info('GDPR compliance metadata validated', {
        submissionId: submission.submissionId,
        gdprCompliant: submission.document.metadata.gdprCompliant,
        legalBasis: submission.document.metadata.legalBasis
      });
    }, 60000);

    it('should enforce NSM security classifications', async () => {
      const testRecipient = testRecipients[0];
      
      // Test SECRET classification (should require special handling)
      const secretDocument = await createTestDocument({
        type: 'PDF',
        title: 'Secret Classification Test',
        content: 'This document has SECRET classification.',
        metadata: createComplianceMetadata({
          classification: 'SECRET',
          encryptionRequired: true,
          accessControl: ['secret_clearance'],
          auditRequired: true
        })
      });

      // SECRET documents should require additional verification
      await expect(digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: secretDocument
      })).rejects.toThrow(/secret classification|clearance required|not authorized/i);

      logger.info('NSM SECRET classification properly enforced');
    });

    it('should generate proper audit trails', async () => {
      const auditLogsBefore = await logger.getAuditLogs();
      const initialCount = auditLogsBefore.length;

      const testRecipient = testRecipients[0];
      
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Audit Trail Test Document',
        content: 'This document submission should generate audit logs.',
        metadata: createComplianceMetadata({
          classification: 'RESTRICTED',
          auditRequired: true
        })
      });

      const submission = await digipostClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument
      });

      const auditLogsAfter = await logger.getAuditLogs();
      expect(auditLogsAfter.length).toBeGreaterThan(initialCount);

      const recentLogs = auditLogsAfter.slice(initialCount);
      const documentSubmissionLog = recentLogs.find(log => 
        log.event === 'DIGIPOST_DOCUMENT_SUBMISSION'
      );

      expect(documentSubmissionLog).toMatchObject({
        event: 'DIGIPOST_DOCUMENT_SUBMISSION',
        submissionId: submission.submissionId,
        recipient: testRecipient.personalNumber,
        documentId: testDocument.id,
        classification: 'RESTRICTED',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        success: true,
        metadata: expect.objectContaining({
          documentType: 'PDF',
          documentSize: testDocument.size,
          endpoint: expect.stringContaining('digipost.no')
        })
      });

      logger.info('Audit trail generation working correctly', {
        submissionId: submission.submissionId,
        auditLogsGenerated: auditLogsAfter.length - initialCount
      });
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle invalid document formats', async () => {
      const testRecipient = testRecipients[0];
      
      await expect(createTestDocument({
        type: 'INVALID_TYPE' as any,
        title: 'Invalid Document',
        content: 'This document has an invalid type.',
        metadata: createComplianceMetadata({
          classification: 'OPEN'
        })
      })).rejects.toThrow(/unsupported document type|invalid format/i);

      logger.info('Invalid document format properly rejected');
    });

    it('should handle network connectivity issues', async () => {
      const timeoutClient = new DigipostClient({
        endpoint: config.digipost.testEndpoint,
        apiKey: config.digipost.apiKey,
        testMode: true,
        timeout: 1 // 1ms timeout
      });

      await expect(timeoutClient.verifyConnection())
        .rejects.toThrow(/timeout|network|connection/i);

      logger.info('Network timeout handling working correctly');
    });

    it('should handle API authentication failures', async () => {
      const invalidClient = new DigipostClient({
        endpoint: config.digipost.testEndpoint,
        apiKey: 'invalid-api-key',
        testMode: true
      });

      const testRecipient = testRecipients[0];
      const testDocument = await createTestDocument({
        type: 'PDF',
        title: 'Auth Test Document',
        content: 'This submission should fail due to invalid API key.',
        metadata: createComplianceMetadata({
          classification: 'OPEN'
        })
      });

      await expect(invalidClient.submitDocument({
        recipient: {
          personalNumber: testRecipient.personalNumber,
          name: testRecipient.name,
          address: testRecipient.address
        },
        document: testDocument
      })).rejects.toThrow(/authentication|unauthorized|invalid api key/i);

      logger.info('API authentication failure handled correctly');
    });
  });
});
/**
 * DIGDIR Service Reporting Tests
 * 
 * Tests reporting to Norwegian Agency for Digital Government (DIGDIR)
 * for digital service registration, usage metrics, and compliance reporting.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadPhase10Config } from '../config/test-config';
import { DIGDIRClient } from '../utils/digdir-client';
import { ComplianceLogger } from '../utils/compliance-logger';
import { ServiceMetricsCollector } from '../utils/service-metrics-collector';
import { SchemaValidator } from '../utils/schema-validator';

const config = loadPhase10Config();
const logger = new ComplianceLogger('DIGDIR-Service-Reporting');

describe('DIGDIR Service Reporting Tests', () => {
  let digdirClient: DIGDIRClient;
  let metricsCollector: ServiceMetricsCollector;
  let schemaValidator: SchemaValidator;

  beforeAll(async () => {
    // Initialize DIGDIR client
    digdirClient = new DIGDIRClient({
      endpoint: config.digdir.reportingEndpoint,
      apiKey: config.digdir.apiKey,
      serviceId: config.digdir.serviceId
    });

    metricsCollector = new ServiceMetricsCollector();
    schemaValidator = new SchemaValidator({
      schemaBaseUrl: config.digdir.schemaValidationUrl
    });
    
    // Verify DIGDIR connectivity
    const isConnected = await digdirClient.verifyConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to DIGDIR reporting endpoint');
    }
    
    logger.info('DIGDIR reporting environment connected', {
      endpoint: config.digdir.reportingEndpoint,
      serviceId: config.digdir.serviceId
    });
  });

  afterAll(async () => {
    await digdirClient.cleanup();
    logger.info('DIGDIR service reporting tests completed');
  });

  describe('Service Registration', () => {
    it('should register digital service with DIGDIR', async () => {
      const serviceRegistration = {
        serviceId: config.digdir.serviceId,
        serviceName: 'Xaheen CLI',
        serviceDescription: 'Enterprise-grade CLI for Norwegian government compliance',
        serviceType: 'digital_tool',
        serviceCategory: 'development_tool',
        version: '1.0.0',
        provider: {
          organizationNumber: '123456789', // Test organization
          organizationName: 'Xaheen Enterprise',
          contactEmail: 'compliance@xaheen.com',
          contactPhone: '+47 12345678'
        },
        technicalDetails: {
          platform: 'Node.js',
          frameworks: ['TypeScript', 'Vitest', 'Playwright'],
          deployment: 'npm_package',
          supportedPlatforms: ['Windows', 'macOS', 'Linux'],
          systemRequirements: {
            nodeVersion: '>=18.0.0',
            memory: '512MB',
            storage: '100MB'
          }
        },
        complianceFeatures: {
          bankidIntegration: true,
          altinnIntegration: true,
          digipostIntegration: true,
          nsmCompliance: true,
          gdprCompliance: true,
          wcagAAA: true
        },
        serviceEndpoints: [
          {
            type: 'cli_command',
            endpoint: 'xaheen generate',
            description: 'Generate compliant templates and components'
          },
          {
            type: 'cli_command',
            endpoint: 'xaheen validate',
            description: 'Validate compliance with Norwegian standards'
          }
        ],
        dataProcessing: {
          processesPersonalData: false,
          dataCategories: [],
          legalBasis: null,
          dataRetention: 'not_applicable'
        },
        security: {
          encryptionInTransit: true,
          encryptionAtRest: true,
          authenticationRequired: false,
          auditLogging: true,
          securityStandards: ['NSM Grunnprinsipper']
        }
      };

      logger.info('Registering service with DIGDIR', {
        serviceId: serviceRegistration.serviceId,
        serviceName: serviceRegistration.serviceName
      });

      const registration = await digdirClient.registerService(serviceRegistration);

      expect(registration).toMatchObject({
        registrationId: expect.stringMatching(/^[a-f0-9-]{36}$/), // UUID format
        serviceId: config.digdir.serviceId,
        status: 'registered',
        registrationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        validUntil: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        complianceCertificate: {
          issued: true,
          certificateId: expect.any(String),
          validStandards: expect.arrayContaining([
            'BankID Integration',
            'Altinn Integration',
            'NSM Security Framework',
            'GDPR Compliance',
            'WCAG 2.2 AAA'
          ])
        },
        reportingSchedule: {
          usageMetrics: 'monthly',
          complianceReport: 'quarterly',
          securityReport: 'annually'
        }
      });

      logger.info('Service registered successfully with DIGDIR', {
        registrationId: registration.registrationId,
        status: registration.status,
        certificateId: registration.complianceCertificate.certificateId
      });
    }, 60000);

    it('should validate service registration against DIGDIR schema', async () => {
      const serviceData = {
        serviceId: 'test-service-schema-validation',
        serviceName: 'Schema Validation Test Service',
        serviceDescription: 'Test service for schema validation',
        serviceType: 'digital_tool',
        serviceCategory: 'testing_tool',
        version: '1.0.0',
        provider: {
          organizationNumber: '123456789',
          organizationName: 'Test Organization',
          contactEmail: 'test@example.no',
          contactPhone: '+47 87654321'
        }
      };

      // Validate against official DIGDIR schema
      const validationResult = await schemaValidator.validateServiceRegistration(
        serviceData,
        'digital-service/v1.0/service-registration.json'
      );

      expect(validationResult).toMatchObject({
        valid: true,
        schemaVersion: 'v1.0',
        validationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        errors: [],
        warnings: expect.any(Array) // May have warnings but no errors
      });

      logger.info('Service registration schema validation passed', {
        schemaVersion: validationResult.schemaVersion,
        valid: validationResult.valid,
        warnings: validationResult.warnings.length
      });
    });

    it('should handle service registration updates', async () => {
      const initialRegistration = {
        serviceId: 'test-service-update',
        serviceName: 'Updatable Test Service',
        serviceDescription: 'Initial description',
        version: '1.0.0'
      };

      // Initial registration
      const registration = await digdirClient.registerService(initialRegistration);
      expect(registration.status).toBe('registered');

      // Update service information
      const updatedInfo = {
        serviceId: 'test-service-update',
        serviceName: 'Updated Test Service',
        serviceDescription: 'Updated description with new features',
        version: '1.1.0',
        updateReason: 'Feature enhancement and bug fixes'
      };

      const updateResult = await digdirClient.updateServiceRegistration(
        registration.registrationId,
        updatedInfo
      );

      expect(updateResult).toMatchObject({
        registrationId: registration.registrationId,
        status: 'updated',
        version: '1.1.0',
        updateDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        changeLog: expect.arrayContaining([
          expect.objectContaining({
            field: 'serviceName',
            oldValue: 'Updatable Test Service',
            newValue: 'Updated Test Service'
          })
        ])
      });

      logger.info('Service registration updated successfully', {
        registrationId: registration.registrationId,
        newVersion: updateResult.version,
        changesCount: updateResult.changeLog.length
      });
    }, 60000);
  });

  describe('Usage Metrics Reporting', () => {
    it('should collect and report service usage metrics', async () => {
      // Collect sample usage metrics
      const usageMetrics = await metricsCollector.collectUsageMetrics({
        serviceId: config.digdir.serviceId,
        reportingPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        metrics: {
          totalUsers: 150,
          activeUsers: 120,
          newUsers: 30,
          sessionsTotal: 450,
          averageSessionDuration: 1800, // 30 minutes in seconds
          commandExecutions: {
            'xaheen generate': 280,
            'xaheen validate': 120,
            'xaheen create': 180,
            'xaheen deploy': 95
          },
          templateGenerations: {
            'react-component': 120,
            'nextjs-page': 85,
            'api-service': 60,
            'database-model': 45
          },
          complianceChecks: {
            bankid: 95,
            altinn: 60,
            gdpr: 140,
            wcag: 180,
            nsm: 25
          },
          errors: {
            total: 15,
            categories: {
              'validation_error': 8,
              'network_error': 4,
              'auth_error': 2,
              'other': 1
            }
          },
          performance: {
            averageResponseTime: 250, // milliseconds
            p95ResponseTime: 500,
            p99ResponseTime: 1000,
            uptime: 99.95 // percentage
          }
        }
      });

      expect(usageMetrics).toMatchObject({
        serviceId: config.digdir.serviceId,
        reportingPeriod: expect.objectContaining({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        }),
        summary: {
          totalUsers: 150,
          activeUsers: 120,
          userGrowthRate: 25.0, // (30/120) * 100
          totalSessions: 450,
          averageSessionDuration: 1800
        },
        featureUsage: expect.objectContaining({
          mostUsedCommand: 'xaheen generate',
          mostUsedTemplate: 'react-component',
          complianceCheckUsage: expect.any(Object)
        }),
        quality: {
          errorRate: 0.033, // 15/(450*1.1) approximation
          uptime: 99.95,
          performanceScore: 'excellent'
        }
      });

      // Submit metrics to DIGDIR
      const reportSubmission = await digdirClient.submitUsageReport(usageMetrics);

      expect(reportSubmission).toMatchObject({
        reportId: expect.stringMatching(/^[a-f0-9-]{36}$/),
        serviceId: config.digdir.serviceId,
        reportType: 'usage_metrics',
        submissionDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        status: 'accepted',
        validation: {
          passed: true,
          warnings: expect.any(Array),
          errors: []
        }
      });

      logger.info('Usage metrics reported successfully', {
        reportId: reportSubmission.reportId,
        totalUsers: usageMetrics.summary.totalUsers,
        activeUsers: usageMetrics.summary.activeUsers,
        status: reportSubmission.status
      });
    }, 60000);

    it('should validate usage metrics against DIGDIR schema', async () => {
      const usageData = {
        serviceId: config.digdir.serviceId,
        reportingPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        metrics: {
          totalUsers: 100,
          activeUsers: 80,
          sessions: 300
        }
      };

      const validationResult = await schemaValidator.validateUsageReport(
        usageData,
        'digital-service/v1.0/usage-report.json'
      );

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);

      logger.info('Usage metrics schema validation passed', {
        valid: validationResult.valid,
        schemaVersion: validationResult.schemaVersion
      });
    });

    it('should aggregate metrics across multiple reporting periods', async () => {
      const quarterlyMetrics = await metricsCollector.aggregateQuarterlyMetrics({
        serviceId: config.digdir.serviceId,
        year: 2024,
        quarter: 1,
        monthlyReports: [
          { month: 1, totalUsers: 150, activeUsers: 120 },
          { month: 2, totalUsers: 170, activeUsers: 140 },
          { month: 3, totalUsers: 190, activeUsers: 160 }
        ]
      });

      expect(quarterlyMetrics).toMatchObject({
        serviceId: config.digdir.serviceId,
        reportingPeriod: {
          type: 'quarterly',
          year: 2024,
          quarter: 1
        },
        aggregatedMetrics: {
          averageMonthlyUsers: 170, // (150+170+190)/3
          averageActiveUsers: 140,  // (120+140+160)/3
          userGrowthRate: 26.67,    // ((190-150)/150)*100
          totalNewUsers: 40         // 190-150
        },
        trends: {
          userGrowth: 'increasing',
          activityLevel: 'high',
          engagement: 'stable'
        }
      });

      logger.info('Quarterly metrics aggregated successfully', {
        quarter: `${quarterlyMetrics.reportingPeriod.year}Q${quarterlyMetrics.reportingPeriod.quarter}`,
        averageUsers: quarterlyMetrics.aggregatedMetrics.averageMonthlyUsers,
        growthRate: quarterlyMetrics.aggregatedMetrics.userGrowthRate
      });
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate comprehensive compliance report', async () => {
      const complianceReport = await digdirClient.generateComplianceReport({
        serviceId: config.digdir.serviceId,
        reportingPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z'
        },
        complianceAreas: [
          'bankid_integration',
          'altinn_integration',
          'digipost_integration',
          'nsm_security',
          'gdpr_compliance',
          'wcag_accessibility'
        ]
      });

      expect(complianceReport).toMatchObject({
        reportId: expect.stringMatching(/^[a-f0-9-]{36}$/),
        serviceId: config.digdir.serviceId,
        reportType: 'compliance_report',
        reportingPeriod: expect.objectContaining({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z'
        }),
        overallComplianceScore: expect.any(Number),
        complianceDetails: {
          bankid_integration: {
            status: 'compliant',
            score: expect.any(Number),
            lastTested: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
            certificates: expect.arrayContaining([
              expect.objectContaining({
                type: 'bankid_integration',
                valid: true,
                expiryDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
              })
            ])
          },
          gdpr_compliance: {
            status: 'compliant',
            score: expect.any(Number),
            dataProcessingActivities: expect.any(Array),
            consentManagement: {
              implemented: true,
              validationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            },
            rightToErasure: {
              implemented: true,
              responseTime: 'within_30_days'
            }
          },
          wcag_accessibility: {
            status: 'compliant',
            level: 'AAA',
            score: expect.any(Number),
            lastAudit: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
            violations: 0,
            recommendations: expect.any(Array)
          }
        },
        recommendations: expect.any(Array),
        actionItems: expect.any(Array),
        nextReviewDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      expect(complianceReport.overallComplianceScore).toBeGreaterThanOrEqual(95);

      logger.info('Compliance report generated successfully', {
        reportId: complianceReport.reportId,
        overallScore: complianceReport.overallComplianceScore,
        complianceAreas: Object.keys(complianceReport.complianceDetails).length
      });
    }, 90000);

    it('should validate compliance report against DIGDIR schema', async () => {
      const complianceData = {
        serviceId: config.digdir.serviceId,
        reportType: 'compliance_report',
        overallComplianceScore: 98.5,
        complianceDetails: {
          gdpr_compliance: {
            status: 'compliant',
            score: 100
          }
        }
      };

      const validationResult = await schemaValidator.validateComplianceReport(
        complianceData,
        'digital-service/v1.0/compliance-report.json'
      );

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);

      logger.info('Compliance report schema validation passed', {
        valid: validationResult.valid,
        overallScore: complianceData.overallComplianceScore
      });
    });

    it('should track compliance improvements over time', async () => {
      const complianceTrends = await digdirClient.getComplianceTrends({
        serviceId: config.digdir.serviceId,
        timeRange: {
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z'
        }
      });

      expect(complianceTrends).toMatchObject({
        serviceId: config.digdir.serviceId,
        trendAnalysis: {
          overallTrend: expect.stringMatching(/^(improving|stable|declining)$/),
          scoreHistory: expect.arrayContaining([
            expect.objectContaining({
              date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
              score: expect.any(Number)
            })
          ]),
          improvementAreas: expect.any(Array),
          consistentlyCompliantAreas: expect.any(Array)
        },
        recommendations: expect.any(Array)
      });

      logger.info('Compliance trends analyzed', {
        overallTrend: complianceTrends.trendAnalysis.overallTrend,
        dataPoints: complianceTrends.trendAnalysis.scoreHistory.length
      });
    });
  });

  describe('Data Quality and Validation', () => {
    it('should validate report data quality before submission', async () => {
      const reportData = {
        serviceId: config.digdir.serviceId,
        metrics: {
          totalUsers: 100,
          activeUsers: 120, // Invalid: more active than total
          sessions: -5      // Invalid: negative value
        }
      };

      const qualityCheck = await digdirClient.validateReportQuality(reportData);

      expect(qualityCheck).toMatchObject({
        valid: false,
        qualityScore: expect.any(Number),
        issues: expect.arrayContaining([
          expect.objectContaining({
            type: 'data_inconsistency',
            field: 'activeUsers',
            message: expect.stringContaining('cannot exceed totalUsers')
          }),
          expect.objectContaining({
            type: 'invalid_value',
            field: 'sessions',
            message: expect.stringContaining('cannot be negative')
          })
        ]),
        suggestions: expect.any(Array)
      });

      expect(qualityCheck.qualityScore).toBeLessThan(70);

      logger.info('Data quality validation working correctly', {
        valid: qualityCheck.valid,
        qualityScore: qualityCheck.qualityScore,
        issuesFound: qualityCheck.issues.length
      });
    });

    it('should handle missing or incomplete data gracefully', async () => {
      const incompleteData = {
        serviceId: config.digdir.serviceId,
        // Missing required fields
      };

      const submissionResult = await digdirClient.submitUsageReport(incompleteData);

      expect(submissionResult).toMatchObject({
        status: 'rejected',
        reason: 'incomplete_data',
        missingFields: expect.arrayContaining([
          'reportingPeriod',
          'metrics'
        ]),
        suggestions: expect.any(Array)
      });

      logger.info('Incomplete data properly rejected', {
        status: submissionResult.status,
        missingFields: submissionResult.missingFields.length
      });
    });

    it('should provide data completeness assessment', async () => {
      const testData = {
        serviceId: config.digdir.serviceId,
        reportingPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        metrics: {
          totalUsers: 100,
          activeUsers: 80
          // Missing other metrics
        }
      };

      const completenessAssessment = await digdirClient.assessDataCompleteness(testData);

      expect(completenessAssessment).toMatchObject({
        completenessScore: expect.any(Number),
        requiredFields: {
          present: expect.any(Array),
          missing: expect.any(Array)
        },
        optionalFields: {
          present: expect.any(Array),
          missing: expect.any(Array)
        },
        recommendations: expect.any(Array)
      });

      expect(completenessAssessment.completenessScore).toBeLessThan(100);
      expect(completenessAssessment.requiredFields.missing.length).toBeGreaterThan(0);

      logger.info('Data completeness assessment working correctly', {
        completenessScore: completenessAssessment.completenessScore,
        missingRequiredFields: completenessAssessment.requiredFields.missing.length
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API authentication failures', async () => {
      const invalidClient = new DIGDIRClient({
        endpoint: config.digdir.reportingEndpoint,
        apiKey: 'invalid-api-key',
        serviceId: config.digdir.serviceId
      });

      await expect(invalidClient.verifyConnection())
        .rejects.toThrow(/authentication|unauthorized|invalid api key/i);

      logger.info('API authentication failure handled correctly');
    });

    it('should handle network connectivity issues', async () => {
      const timeoutClient = new DIGDIRClient({
        endpoint: config.digdir.reportingEndpoint,
        apiKey: config.digdir.apiKey,
        serviceId: config.digdir.serviceId,
        timeout: 1 // 1ms timeout
      });

      await expect(timeoutClient.verifyConnection())
        .rejects.toThrow(/timeout|network|connection/i);

      logger.info('Network timeout handled correctly');
    });

    it('should implement retry mechanism for transient failures', async () => {
      let attempts = 0;
      const mockClient = new DIGDIRClient({
        endpoint: config.digdir.reportingEndpoint,
        apiKey: config.digdir.apiKey,
        serviceId: config.digdir.serviceId,
        retryConfig: {
          maxRetries: 3,
          backoffMs: 100,
          retryCondition: (error: any) => {
            attempts++;
            return attempts < 3; // Fail first 2 attempts, succeed on 3rd
          }
        }
      });

      // This should eventually succeed after retries
      const result = await expect(mockClient.verifyConnection()).resolves.toBeDefined();
      expect(attempts).toBeGreaterThanOrEqual(2);

      logger.info('Retry mechanism working correctly', {
        attempts,
        finalResult: result
      });
    });

    it('should maintain audit trail of failed submissions', async () => {
      const invalidData = {
        serviceId: 'invalid-service-id',
        invalidField: 'invalid-value'
      };

      try {
        await digdirClient.submitUsageReport(invalidData);
      } catch (error) {
        // Expected to fail
      }

      const auditLogs = await logger.getAuditLogs();
      const failedSubmissionLog = auditLogs.find(log => 
        log.event === 'DIGDIR_SUBMISSION_FAILED'
      );

      expect(failedSubmissionLog).toMatchObject({
        event: 'DIGDIR_SUBMISSION_FAILED',
        serviceId: 'invalid-service-id',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        error: expect.any(String),
        metadata: expect.objectContaining({
          endpoint: config.digdir.reportingEndpoint,
          attemptNumber: expect.any(Number)
        })
      });

      logger.info('Failed submission audit trail working correctly', {
        loggedFailure: failedSubmissionLog !== undefined
      });
    });
  });
});
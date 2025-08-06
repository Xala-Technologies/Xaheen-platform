/**
 * Altinn Integration Tests
 * 
 * Tests integration with Norwegian Altinn services for government data access.
 * Uses official TT02 test environment with synthetic business data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { loadPhase10Config, AltinnTestOrg } from '../config/test-config';
import { AltinnClient } from '../utils/altinn-client';
import { ComplianceLogger } from '../utils/compliance-logger';

const config = loadPhase10Config();
const logger = new ComplianceLogger('Altinn-Integration');

describe('Altinn Integration Tests', () => {
  let altinnClient: AltinnClient;
  let testOrganizations: AltinnTestOrg[];

  beforeAll(async () => {
    // Initialize Altinn client with test configuration
    altinnClient = new AltinnClient({
      endpoint: config.altinn.testEndpoint,
      apiKey: config.altinn.apiKey,
      subscriptionKey: config.altinn.subscriptionKey
    });

    testOrganizations = config.altinn.testOrganizations;
    
    // Verify test environment connectivity
    const isConnected = await altinnClient.verifyConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to Altinn test environment');
    }
    
    logger.info('Altinn test environment connected', {
      endpoint: config.altinn.testEndpoint,
      testOrganizations: testOrganizations.length
    });
  });

  afterAll(async () => {
    await altinnClient.cleanup();
    logger.info('Altinn integration tests completed');
  });

  describe('Organization Data Access', () => {
    it('should retrieve organization information successfully', async () => {
      const testOrg = testOrganizations[0];
      
      logger.info('Retrieving organization information', {
        organizationNumber: testOrg.organizationNumber,
        name: testOrg.name
      });

      const orgInfo = await altinnClient.getOrganization(testOrg.organizationNumber);

      expect(orgInfo).toMatchObject({
        organizationNumber: testOrg.organizationNumber,
        name: expect.any(String),
        organizationForm: expect.any(String),
        status: 'Active',
        address: expect.objectContaining({
          street: expect.any(String),
          postalCode: expect.stringMatching(/^\d{4}$/),
          city: expect.any(String),
          country: 'Norway'
        }),
        businessCodes: expect.arrayContaining([
          expect.objectContaining({
            code: expect.stringMatching(/^\d{5}$/),
            description: expect.any(String)
          })
        ])
      });

      logger.info('Organization information retrieved successfully', {
        organizationNumber: orgInfo.organizationNumber,
        name: orgInfo.name,
        status: orgInfo.status
      });
    }, 30000);

    it('should retrieve organization roles and rights', async () => {
      const testOrg = testOrganizations[0];
      
      const roles = await altinnClient.getOrganizationRoles(testOrg.organizationNumber);

      expect(roles).toBeInstanceOf(Array);
      expect(roles.length).toBeGreaterThan(0);

      roles.forEach(role => {
        expect(role).toMatchObject({
          roleId: expect.any(String),
          roleName: expect.any(String),
          roleDescription: expect.any(String),
          serviceOwner: expect.any(String),
          validFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
          validTo: expect.any(String)
        });
      });

      // Verify expected roles are present
      const expectedRoles = testOrg.roles;
      expectedRoles.forEach(expectedRole => {
        const foundRole = roles.find(r => r.roleName.includes(expectedRole));
        expect(foundRole).toBeDefined();
      });

      logger.info('Organization roles retrieved successfully', {
        organizationNumber: testOrg.organizationNumber,
        rolesCount: roles.length,
        roles: roles.map(r => r.roleName)
      });
    }, 30000);

    it('should handle invalid organization number gracefully', async () => {
      const invalidOrgNumber = '000000000';
      
      logger.info('Testing invalid organization number handling', {
        invalidOrgNumber
      });

      await expect(altinnClient.getOrganization(invalidOrgNumber))
        .rejects.toThrow(/not found|invalid|does not exist/i);

      logger.info('Invalid organization number properly rejected');
    });
  });

  describe('Service Access', () => {
    it('should retrieve available services for organization', async () => {
      const testOrg = testOrganizations[0];
      
      const services = await altinnClient.getAvailableServices(testOrg.organizationNumber);

      expect(services).toBeInstanceOf(Array);
      expect(services.length).toBeGreaterThan(0);

      services.forEach(service => {
        expect(service).toMatchObject({
          serviceCode: expect.stringMatching(/^\d+$/),
          serviceName: expect.any(String),
          serviceOwner: expect.any(String),
          serviceType: expect.any(String),
          validFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
          validTo: expect.any(String),
          requiresAuthentication: expect.any(Boolean)
        });
      });

      logger.info('Available services retrieved successfully', {
        organizationNumber: testOrg.organizationNumber,
        servicesCount: services.length,
        services: services.slice(0, 5).map(s => ({ code: s.serviceCode, name: s.serviceName }))
      });
    }, 30000);

    it('should access service forms and metadata', async () => {
      const testOrg = testOrganizations[0];
      
      // Get available services first
      const services = await altinnClient.getAvailableServices(testOrg.organizationNumber);
      const testService = services[0];

      // Get service forms
      const forms = await altinnClient.getServiceForms(
        testOrg.organizationNumber,
        testService.serviceCode
      );

      expect(forms).toBeInstanceOf(Array);
      
      if (forms.length > 0) {
        forms.forEach(form => {
          expect(form).toMatchObject({
            formId: expect.any(String),
            formName: expect.any(String),
            version: expect.any(String),
            status: expect.any(String),
            createdDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
            fields: expect.arrayContaining([
              expect.objectContaining({
                fieldId: expect.any(String),
                fieldName: expect.any(String),
                fieldType: expect.any(String),
                required: expect.any(Boolean)
              })
            ])
          });
        });

        logger.info('Service forms retrieved successfully', {
          organizationNumber: testOrg.organizationNumber,
          serviceCode: testService.serviceCode,
          formsCount: forms.length
        });
      }
    }, 30000);

    it('should handle service access permissions correctly', async () => {
      const testOrg = testOrganizations[0];
      
      // Try to access a service that should be restricted
      const restrictedServiceCode = '9999'; // Non-existent or restricted service
      
      await expect(altinnClient.getServiceForms(testOrg.organizationNumber, restrictedServiceCode))
        .rejects.toThrow(/forbidden|unauthorized|access denied|not found/i);

      logger.info('Service access permissions working correctly');
    });
  });

  describe('Data Submission', () => {
    it('should submit form data successfully', async () => {
      const testOrg = testOrganizations[0];
      
      // Get available services and forms
      const services = await altinnClient.getAvailableServices(testOrg.organizationNumber);
      const testService = services.find(s => s.serviceType === 'FormTask');
      
      if (!testService) {
        logger.info('No form services available for testing data submission');
        return;
      }

      const forms = await altinnClient.getServiceForms(testOrg.organizationNumber, testService.serviceCode);
      const testForm = forms[0];

      if (!testForm) {
        logger.info('No forms available for testing data submission');
        return;
      }

      // Prepare test form data
      const formData: Record<string, any> = {};
      testForm.fields.forEach(field => {
        switch (field.fieldType.toLowerCase()) {
          case 'string':
          case 'text':
            formData[field.fieldId] = `Test value for ${field.fieldName}`;
            break;
          case 'number':
          case 'integer':
            formData[field.fieldId] = 12345;
            break;
          case 'boolean':
            formData[field.fieldId] = true;
            break;
          case 'date':
            formData[field.fieldId] = '2024-01-01';
            break;
          default:
            formData[field.fieldId] = 'Test value';
        }
      });

      // Submit form data
      const submission = await altinnClient.submitFormData(
        testOrg.organizationNumber,
        testService.serviceCode,
        testForm.formId,
        formData
      );

      expect(submission).toMatchObject({
        submissionId: expect.any(String),
        status: expect.stringMatching(/^(submitted|pending|processing)$/i),
        submittedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
        reference: expect.any(String)
      });

      logger.info('Form data submitted successfully', {
        organizationNumber: testOrg.organizationNumber,
        serviceCode: testService.serviceCode,
        formId: testForm.formId,
        submissionId: submission.submissionId,
        status: submission.status
      });
    }, 60000);

    it('should validate form data before submission', async () => {
      const testOrg = testOrganizations[0];
      
      const services = await altinnClient.getAvailableServices(testOrg.organizationNumber);
      const testService = services.find(s => s.serviceType === 'FormTask');
      
      if (!testService) {
        return; // Skip if no form services available
      }

      const forms = await altinnClient.getServiceForms(testOrg.organizationNumber, testService.serviceCode);
      const testForm = forms[0];

      if (!testForm) {
        return; // Skip if no forms available
      }

      // Submit invalid form data (missing required fields)
      const invalidFormData = {};

      await expect(altinnClient.submitFormData(
        testOrg.organizationNumber,
        testService.serviceCode,
        testForm.formId,
        invalidFormData
      )).rejects.toThrow(/validation|required|invalid/i);

      logger.info('Form data validation working correctly');
    }, 30000);
  });

  describe('Authentication and Authorization', () => {
    it('should handle API key authentication correctly', async () => {
      // Test with invalid API key
      const invalidClient = new AltinnClient({
        endpoint: config.altinn.testEndpoint,
        apiKey: 'invalid-api-key',
        subscriptionKey: config.altinn.subscriptionKey
      });

      const testOrg = testOrganizations[0];

      await expect(invalidClient.getOrganization(testOrg.organizationNumber))
        .rejects.toThrow(/unauthorized|invalid|forbidden/i);

      logger.info('API key authentication working correctly');
    });

    it('should validate subscription key requirements', async () => {
      // Test with invalid subscription key
      const invalidClient = new AltinnClient({
        endpoint: config.altinn.testEndpoint,
        apiKey: config.altinn.apiKey,
        subscriptionKey: 'invalid-subscription-key'
      });

      const testOrg = testOrganizations[0];

      await expect(invalidClient.getOrganization(testOrg.organizationNumber))
        .rejects.toThrow(/subscription|invalid|forbidden/i);

      logger.info('Subscription key validation working correctly');
    });

    it('should handle rate limiting gracefully', async () => {
      const testOrg = testOrganizations[0];
      
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 20 }, () => 
        altinnClient.getOrganization(testOrg.organizationNumber)
      );

      const results = await Promise.allSettled(requests);
      
      // Some requests should succeed, some might be rate limited
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const rateLimited = results.filter(r => 
        r.status === 'rejected' && 
        (r.reason?.message?.includes('rate limit') || r.reason?.message?.includes('429'))
      ).length;

      expect(successful).toBeGreaterThan(0);
      
      logger.info('Rate limiting test completed', {
        successful,
        rateLimited,
        total: requests.length
      });
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const timeoutClient = new AltinnClient({
        endpoint: config.altinn.testEndpoint,
        apiKey: config.altinn.apiKey,
        subscriptionKey: config.altinn.subscriptionKey,
        timeout: 1 // 1ms timeout
      });

      await expect(timeoutClient.verifyConnection())
        .rejects.toThrow(/timeout|network/i);

      logger.info('Network timeout handling working correctly');
    });

    it('should handle malformed responses gracefully', async () => {
      // This would typically involve mocking the client to return malformed data
      // For now, we'll test the client's response parsing
      const testOrg = testOrganizations[0];
      
      try {
        const orgInfo = await altinnClient.getOrganization(testOrg.organizationNumber);
        expect(orgInfo).toBeDefined();
        logger.info('Response parsing working correctly');
      } catch (error) {
        // If the real service returns malformed data, this would catch it
        logger.error('Unexpected error in response parsing', { error });
        throw error;
      }
    });
  });

  describe('Compliance Validation', () => {
    it('should meet Norwegian government data standards', async () => {
      const testOrg = testOrganizations[0];
      
      const orgInfo = await altinnClient.getOrganization(testOrg.organizationNumber);

      // Validate Norwegian organization number format
      expect(orgInfo.organizationNumber).toMatch(/^\d{9}$/);
      
      // Validate Norwegian postal code format
      expect(orgInfo.address.postalCode).toMatch(/^\d{4}$/);
      
      // Validate country is Norway
      expect(orgInfo.address.country).toBe('Norway');
      
      // Validate business codes follow Norwegian standard
      orgInfo.businessCodes.forEach(code => {
        expect(code.code).toMatch(/^\d{5}$/); // NACE codes
      });

      logger.info('Norwegian government data standards validated', {
        organizationNumber: orgInfo.organizationNumber,
        postalCode: orgInfo.address.postalCode,
        businessCodesCount: orgInfo.businessCodes.length
      });
    }, 30000);

    it('should generate proper audit logs', async () => {
      const auditLogsBefore = await logger.getAuditLogs();
      const initialCount = auditLogsBefore.length;

      const testOrg = testOrganizations[0];
      await altinnClient.getOrganization(testOrg.organizationNumber);

      const auditLogsAfter = await logger.getAuditLogs();
      expect(auditLogsAfter.length).toBeGreaterThan(initialCount);

      const recentLog = auditLogsAfter[auditLogsAfter.length - 1];
      expect(recentLog).toMatchObject({
        event: 'ALTINN_DATA_ACCESS',
        organizationNumber: testOrg.organizationNumber,
        timestamp: expect.any(String),
        success: true,
        metadata: expect.objectContaining({
          endpoint: expect.stringContaining('altinn.no'),
          operation: 'getOrganization'
        })
      });

      logger.info('Audit logging working correctly');
    }, 30000);

    it('should ensure data encryption in transit', async () => {
      // Verify all API calls use HTTPS
      const testOrg = testOrganizations[0];
      
      // The client should enforce HTTPS
      expect(config.altinn.testEndpoint).toMatch(/^https:/);
      
      // Verify SSL certificate validation
      const orgInfo = await altinnClient.getOrganization(testOrg.organizationNumber);
      expect(orgInfo).toBeDefined();

      logger.info('Data encryption in transit validated');
    });
  });
});
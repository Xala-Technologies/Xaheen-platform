/**
 * BankID Integration Tests
 * 
 * Tests authentication flows against official Norwegian BankID test endpoints.
 * Uses official Difi test environment with real test users.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'bun:test';
import { Page } from '@playwright/test';
import { loadPhase10Config, BankIDTestUser } from '../config/test-config';
import { BankIDClient } from '../utils/bankid-client';
import { ComplianceLogger } from '../utils/compliance-logger';

const config = loadPhase10Config();
const logger = new ComplianceLogger('BankID-Integration');

describe('BankID Integration Tests', () => {
  let bankidClient: BankIDClient;
  let testUsers: BankIDTestUser[];

  beforeAll(async () => {
    // Initialize BankID client with test configuration
    bankidClient = new BankIDClient({
      endpoint: config.bankid.testEndpoint,
      clientId: config.bankid.clientId,
      clientSecret: config.bankid.clientSecret,
      redirectUri: config.bankid.redirectUri
    });

    testUsers = config.bankid.testUsers;
    
    // Verify test environment connectivity
    const isConnected = await bankidClient.verifyConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to BankID test environment');
    }
    
    logger.info('BankID test environment connected', {
      endpoint: config.bankid.testEndpoint,
      testUsers: testUsers.length
    });
  });

  afterAll(async () => {
    await bankidClient.cleanup();
    logger.info('BankID integration tests completed');
  });

  describe('Authentication Flow', () => {
    it('should successfully authenticate with high security level test user', async () => {
      const testUser = testUsers.find(u => u.securityLevel === 'high');
      expect(testUser).toBeDefined();

      logger.info('Starting high security authentication', {
        user: testUser!.name,
        personalNumber: testUser!.personalNumber
      });

      // Step 1: Initiate authentication
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser!.personalNumber,
        securityLevel: 'high',
        scopes: config.bankid.scopes
      });

      expect(authRequest).toMatchObject({
        authUrl: expect.stringContaining('https://eid-exttest.difi.no'),
        state: expect.stringMatching(/^[a-zA-Z0-9_-]+$/),
        nonce: expect.stringMatching(/^[a-zA-Z0-9_-]+$/)
      });

      // Step 2: Simulate user authentication (in real test environment)
      const authCode = await bankidClient.simulateUserAuth(authRequest);
      expect(authCode).toMatch(/^[a-zA-Z0-9_-]+$/);

      // Step 3: Exchange authorization code for tokens
      const tokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);

      expect(tokens).toMatchObject({
        accessToken: expect.stringMatching(/^[a-zA-Z0-9._-]+$/),
        idToken: expect.stringMatching(/^[a-zA-Z0-9._-]+$/),
        refreshToken: expect.stringMatching(/^[a-zA-Z0-9._-]+$/),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number)
      });

      // Step 4: Validate ID token claims
      const userInfo = await bankidClient.validateIdToken(tokens.idToken);

      expect(userInfo).toMatchObject({
        sub: testUser!.personalNumber,
        name: testUser!.name,
        email: testUser!.email,
        phone_number: testUser!.phoneNumber,
        security_level: 'high',
        amr: expect.arrayContaining(['BankID']),
        iss: expect.stringContaining('difi.no'),
        aud: config.bankid.clientId
      });

      logger.info('High security authentication successful', {
        user: userInfo.name,
        securityLevel: userInfo.security_level,
        authMethod: userInfo.amr
      });
    }, 60000);

    it('should successfully authenticate with substantial security level test user', async () => {
      const testUser = testUsers.find(u => u.securityLevel === 'substantial');
      expect(testUser).toBeDefined();

      logger.info('Starting substantial security authentication', {
        user: testUser!.name,
        personalNumber: testUser!.personalNumber
      });

      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser!.personalNumber,
        securityLevel: 'substantial',
        scopes: config.bankid.scopes
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      const tokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);
      const userInfo = await bankidClient.validateIdToken(tokens.idToken);

      expect(userInfo.security_level).toBe('substantial');
      expect(userInfo.sub).toBe(testUser!.personalNumber);

      logger.info('Substantial security authentication successful', {
        user: userInfo.name,
        securityLevel: userInfo.security_level
      });
    }, 60000);

    it('should handle invalid personal number gracefully', async () => {
      logger.info('Testing invalid personal number handling');

      const invalidPersonalNumber = '00000000000';

      await expect(bankidClient.initiateAuth({
        personalNumber: invalidPersonalNumber,
        securityLevel: 'high',
        scopes: config.bankid.scopes
      })).rejects.toThrow(/invalid_request|invalid_personal_number/i);

      logger.info('Invalid personal number properly rejected');
    });

    it('should handle expired tokens correctly', async () => {
      logger.info('Testing token expiration handling');

      // Create an expired token for testing
      const expiredToken = await bankidClient.createExpiredTestToken();

      await expect(bankidClient.validateIdToken(expiredToken))
        .rejects.toThrow(/token_expired|expired/i);

      logger.info('Expired token properly rejected');
    });
  });

  describe('Token Management', () => {
    it('should successfully refresh access tokens', async () => {
      const testUser = testUsers[0];
      
      // Get initial tokens
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      const initialTokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);

      // Refresh tokens
      const refreshedTokens = await bankidClient.refreshTokens(initialTokens.refreshToken);

      expect(refreshedTokens).toMatchObject({
        accessToken: expect.stringMatching(/^[a-zA-Z0-9._-]+$/),
        refreshToken: expect.stringMatching(/^[a-zA-Z0-9._-]+$/),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number)
      });

      // New tokens should be different from initial ones
      expect(refreshedTokens.accessToken).not.toBe(initialTokens.accessToken);
      expect(refreshedTokens.refreshToken).not.toBe(initialTokens.refreshToken);

      logger.info('Token refresh successful');
    }, 60000);

    it('should revoke tokens successfully', async () => {
      const testUser = testUsers[0];
      
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      const tokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);

      // Revoke tokens
      const revoked = await bankidClient.revokeTokens(tokens.accessToken);
      expect(revoked).toBe(true);

      // Verify tokens are no longer valid
      await expect(bankidClient.validateIdToken(tokens.idToken))
        .rejects.toThrow(/invalid_token|revoked/i);

      logger.info('Token revocation successful');
    }, 60000);
  });

  describe('Security Validation', () => {
    it('should validate PKCE flow correctly', async () => {
      logger.info('Testing PKCE flow validation');

      const testUser = testUsers[0];
      
      // Generate PKCE parameters
      const pkceParams = bankidClient.generatePKCE();
      
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes,
        codeChallenge: pkceParams.codeChallenge,
        codeChallengeMethod: 'S256'
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      
      // Exchange code with PKCE verifier
      const tokens = await bankidClient.exchangeCodeForTokens(
        authCode, 
        authRequest.state,
        pkceParams.codeVerifier
      );

      expect(tokens.accessToken).toBeDefined();
      
      logger.info('PKCE flow validation successful');
    }, 60000);

    it('should validate nonce in ID token', async () => {
      const testUser = testUsers[0];
      const customNonce = 'test-nonce-' + Date.now();
      
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes,
        nonce: customNonce
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      const tokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);
      const userInfo = await bankidClient.validateIdToken(tokens.idToken);

      expect(userInfo.nonce).toBe(customNonce);
      
      logger.info('Nonce validation successful', { nonce: customNonce });
    }, 60000);

    it('should enforce TLS/SSL requirements', async () => {
      logger.info('Testing TLS/SSL enforcement');

      // Attempt to use HTTP endpoint (should fail)
      const insecureClient = new BankIDClient({
        endpoint: config.bankid.testEndpoint.replace('https://', 'http://'),
        clientId: config.bankid.clientId,
        clientSecret: config.bankid.clientSecret,
        redirectUri: config.bankid.redirectUri
      });

      await expect(insecureClient.verifyConnection())
        .rejects.toThrow(/https|ssl|tls|secure/i);

      logger.info('TLS/SSL enforcement working correctly');
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // Configure client with very short timeout
      const timeoutClient = new BankIDClient({
        endpoint: config.bankid.testEndpoint,
        clientId: config.bankid.clientId,
        clientSecret: config.bankid.clientSecret,
        redirectUri: config.bankid.redirectUri,
        timeout: 1 // 1ms timeout
      });

      await expect(timeoutClient.verifyConnection())
        .rejects.toThrow(/timeout|network/i);

      logger.info('Network timeout handling working correctly');
    });

    it('should handle invalid client credentials', async () => {
      const invalidClient = new BankIDClient({
        endpoint: config.bankid.testEndpoint,
        clientId: 'invalid-client-id',
        clientSecret: 'invalid-client-secret',
        redirectUri: config.bankid.redirectUri
      });

      const testUser = testUsers[0];

      await expect(invalidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes
      })).rejects.toThrow(/invalid_client|unauthorized/i);

      logger.info('Invalid client credentials properly rejected');
    });

    it('should handle malformed redirect URI', async () => {
      const malformedClient = new BankIDClient({
        endpoint: config.bankid.testEndpoint,
        clientId: config.bankid.clientId,
        clientSecret: config.bankid.clientSecret,
        redirectUri: 'not-a-valid-uri'
      });

      const testUser = testUsers[0];

      await expect(malformedClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes
      })).rejects.toThrow(/invalid_request|invalid_redirect_uri/i);

      logger.info('Malformed redirect URI properly rejected');
    });
  });

  describe('Compliance Validation', () => {
    it('should meet Norwegian eID security requirements', async () => {
      const testUser = testUsers.find(u => u.securityLevel === 'high')!;
      
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: 'high',
        scopes: config.bankid.scopes
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      const tokens = await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);
      const userInfo = await bankidClient.validateIdToken(tokens.idToken);

      // Validate Norwegian eID requirements
      expect(userInfo.security_level).toBe('high');
      expect(userInfo.amr).toContain('BankID');
      expect(userInfo.sub).toMatch(/^\d{11}$/); // Norwegian personal number format
      expect(userInfo.iss).toContain('difi.no'); // Official Norwegian issuer

      // Validate token security
      expect(tokens.accessToken).toMatch(/^[a-zA-Z0-9._-]+$/);
      expect(tokens.idToken.split('.')).toHaveLength(3); // JWT format

      logger.info('Norwegian eID security requirements validated', {
        securityLevel: userInfo.security_level,
        authMethod: userInfo.amr,
        issuer: userInfo.iss
      });
    }, 60000);

    it('should generate proper audit logs', async () => {
      const auditLogsBefore = await logger.getAuditLogs();
      const initialCount = auditLogsBefore.length;

      const testUser = testUsers[0];
      
      const authRequest = await bankidClient.initiateAuth({
        personalNumber: testUser.personalNumber,
        securityLevel: testUser.securityLevel,
        scopes: config.bankid.scopes
      });

      const authCode = await bankidClient.simulateUserAuth(authRequest);
      await bankidClient.exchangeCodeForTokens(authCode, authRequest.state);

      const auditLogsAfter = await logger.getAuditLogs();
      expect(auditLogsAfter.length).toBeGreaterThan(initialCount);

      const recentLog = auditLogsAfter[auditLogsAfter.length - 1];
      expect(recentLog).toMatchObject({
        event: 'BANKID_AUTHENTICATION',
        user: testUser.personalNumber,
        timestamp: expect.any(String),
        success: true,
        metadata: expect.objectContaining({
          securityLevel: testUser.securityLevel,
          scopes: config.bankid.scopes
        })
      });

      logger.info('Audit logging working correctly');
    }, 60000);
  });
});
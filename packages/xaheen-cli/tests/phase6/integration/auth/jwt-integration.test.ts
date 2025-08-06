/**
 * JWT Authentication Integration Tests
 * 
 * Tests JWT token generation, validation, and authentication flows
 * including token expiration, refresh, and security validation.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  TestContextManager,
  TestDataGenerator,
  ServiceTestUtils,
  type TestContext,
} from '../../utils/test-helpers';
import { authServicesConfig } from '../../config/test-config';
import { jwtTestTokens } from '../../mocks/auth-servers.mock';

// Mock JWT library functions
const mockJwtLibrary = {
  sign: (payload: any, secret: string, options: any = {}) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
  verify: (token: string, secret: string) => {
    try {
      const [header, payload, signature] = token.split('.');
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // Check expiration
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        throw new Error('Token expired');
      }
      
      return decodedPayload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  },
  
  decode: (token: string) => {
    try {
      const [header, payload] = token.split('.');
      return {
        header: JSON.parse(Buffer.from(header, 'base64url').toString()),
        payload: JSON.parse(Buffer.from(payload, 'base64url').toString()),
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }
  },
};

describe('JWT Authentication Integration Tests', () => {
  let testContext: TestContext;
  const jwtConfig = authServicesConfig.jwt;
  
  beforeEach(async () => {
    testContext = await TestContextManager.createContext('jwt-auth', jwtConfig);
  });
  
  afterEach(async () => {
    if (testContext) {
      await TestContextManager.cleanupContext(testContext.testId);
    }
  });
  
  afterAll(async () => {
    await TestContextManager.cleanupAll();
  });
  
  describe('JWT Token Generation', () => {
    test('should generate valid JWT tokens', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      const issuer = jwtConfig.credentials!.issuer;
      const audience = jwtConfig.credentials!.audience;
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        name: testUser.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        iss: issuer,
        aud: audience,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      // Verify token structure
      const decoded = mockJwtLibrary.decode(token);
      expect(decoded.header.alg).toBe('HS256');
      expect(decoded.header.typ).toBe('JWT');
      expect(decoded.payload.sub).toBe(testUser.id);
      expect(decoded.payload.email).toBe(testUser.email);
      expect(decoded.payload.iss).toBe(issuer);
      expect(decoded.payload.aud).toBe(audience);
    });
    
    test('should generate tokens with custom expiration', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      const shortExpirationPayload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60, // 1 minute
      };
      
      const longExpirationPayload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      };
      
      const shortToken = mockJwtLibrary.sign(shortExpirationPayload, secret);
      const longToken = mockJwtLibrary.sign(longExpirationPayload, secret);
      
      const shortDecoded = mockJwtLibrary.decode(shortToken);
      const longDecoded = mockJwtLibrary.decode(longToken);
      
      expect(shortDecoded.payload.exp).toBeLessThan(longDecoded.payload.exp);
      expect(longDecoded.payload.exp - shortDecoded.payload.exp).toBe(86400 - 60);
    });
    
    test('should generate tokens with custom claims', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: 'user',
        permissions: ['read', 'write'],
        organizationId: 'org_123',
        customClaim: 'custom_value',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      const decoded = mockJwtLibrary.decode(token);
      
      expect(decoded.payload.role).toBe('user');
      expect(decoded.payload.permissions).toEqual(['read', 'write']);
      expect(decoded.payload.organizationId).toBe('org_123');
      expect(decoded.payload.customClaim).toBe('custom_value');
    });
  });
  
  describe('JWT Token Validation', () => {
    test('should validate valid JWT tokens', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        name: testUser.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      
      expect(() => {
        const verified = mockJwtLibrary.verify(token, secret);
        expect(verified.sub).toBe(testUser.id);
        expect(verified.email).toBe(testUser.email);
      }).not.toThrow();
    });
    
    test('should reject tokens with invalid signatures', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      const wrongSecret = 'wrong_secret_key';
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      
      expect(() => {
        mockJwtLibrary.verify(token, wrongSecret);
      }).toThrow('Token verification failed');
    });
    
    test('should reject expired tokens', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      const expiredPayload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      };
      
      const expiredToken = mockJwtLibrary.sign(expiredPayload, secret);
      
      expect(() => {
        mockJwtLibrary.verify(expiredToken, secret);
      }).toThrow('Token expired');
    });
    
    test('should reject malformed tokens', async () => {
      const secret = jwtConfig.credentials!.secret;
      
      const malformedTokens = [
        'invalid.token',
        'invalid.token.format.extra',
        'notbase64.notbase64.notbase64',
        '',
        null,
        undefined,
      ];
      
      malformedTokens.forEach((token) => {
        expect(() => {
          mockJwtLibrary.verify(token as any, secret);
        }).toThrow();
      });
    });
  });
  
  describe('JWT Authentication Flow', () => {
    test('should implement complete login flow', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      // Step 1: User authentication (mocked)
      const authenticateUser = async (email: string, password: string) => {
        // In real implementation, verify against database
        if (email === testUser.email && password === 'correct_password') {
          return testUser;
        }
        throw new Error('Invalid credentials');
      };
      
      // Step 2: Generate access and refresh tokens
      const generateTokens = (user: typeof testUser) => {
        const accessTokenPayload = {
          sub: user.id,
          email: user.email,
          name: user.name,
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
        };
        
        const refreshTokenPayload = {
          sub: user.id,
          type: 'refresh',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
        };
        
        return {
          accessToken: mockJwtLibrary.sign(accessTokenPayload, secret),
          refreshToken: mockJwtLibrary.sign(refreshTokenPayload, secret),
        };
      };
      
      // Step 3: Complete flow
      const user = await authenticateUser(testUser.email, 'correct_password');
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Verify tokens
      const accessTokenData = mockJwtLibrary.verify(accessToken, secret);
      const refreshTokenData = mockJwtLibrary.verify(refreshToken, secret);
      
      expect(accessTokenData.sub).toBe(testUser.id);
      expect(accessTokenData.type).toBe('access');
      expect(refreshTokenData.sub).toBe(testUser.id);
      expect(refreshTokenData.type).toBe('refresh');
      
      // Access token should expire sooner than refresh token
      expect(accessTokenData.exp).toBeLessThan(refreshTokenData.exp);
    });
    
    test('should implement token refresh flow', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      // Step 1: Create a valid refresh token
      const refreshTokenPayload = {
        sub: testUser.id,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
      };
      
      const refreshToken = mockJwtLibrary.sign(refreshTokenPayload, secret);
      
      // Step 2: Implement token refresh
      const refreshAccessToken = (refreshToken: string) => {
        const refreshData = mockJwtLibrary.verify(refreshToken, secret);
        
        if (refreshData.type !== 'refresh') {
          throw new Error('Invalid token type');
        }
        
        const newAccessTokenPayload = {
          sub: refreshData.sub,
          email: testUser.email,
          name: testUser.name,
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
        };
        
        return mockJwtLibrary.sign(newAccessTokenPayload, secret);
      };
      
      // Step 3: Test refresh flow
      const newAccessToken = refreshAccessToken(refreshToken);
      const newAccessTokenData = mockJwtLibrary.verify(newAccessToken, secret);
      
      expect(newAccessTokenData.sub).toBe(testUser.id);
      expect(newAccessTokenData.type).toBe('access');
      expect(newAccessTokenData.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
    
    test('should implement logout flow with token blacklisting', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      // Mock token blacklist (in real implementation, use Redis or database)
      const tokenBlacklist = new Set<string>();
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        jti: `jwt_${Date.now()}_${Math.random()}`, // JWT ID for blacklisting
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      
      // Logout function
      const logout = (token: string) => {
        const decoded = mockJwtLibrary.verify(token, secret);
        if (decoded.jti) {
          tokenBlacklist.add(decoded.jti);
        }
      };
      
      // Token validation with blacklist check
      const validateToken = (token: string) => {
        const decoded = mockJwtLibrary.verify(token, secret);
        if (decoded.jti && tokenBlacklist.has(decoded.jti)) {
          throw new Error('Token has been revoked');
        }
        return decoded;
      };
      
      // Test flow
      expect(() => validateToken(token)).not.toThrow();
      
      logout(token);
      
      expect(() => validateToken(token)).toThrow('Token has been revoked');
    });
  });
  
  describe('JWT Security Tests', () => {
    test('should use secure algorithms', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      const payload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const token = mockJwtLibrary.sign(payload, secret);
      const decoded = mockJwtLibrary.decode(token);
      
      // Should use HS256 (or other secure algorithms)
      expect(decoded.header.alg).toBe('HS256');
      expect(decoded.header.typ).toBe('JWT');
      
      // Should not use 'none' algorithm
      expect(decoded.header.alg).not.toBe('none');
    });
    
    test('should validate required claims', async () => {
      const secret = jwtConfig.credentials!.secret;
      
      const validateRequiredClaims = (token: string, requiredClaims: string[]) => {
        const decoded = mockJwtLibrary.verify(token, secret);
        
        for (const claim of requiredClaims) {
          if (!(claim in decoded)) {
            throw new Error(`Missing required claim: ${claim}`);
          }
        }
        
        return decoded;
      };
      
      const testUser = TestDataGenerator.generateTestUser();
      
      // Token with all required claims
      const validPayload = {
        sub: testUser.id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const validToken = mockJwtLibrary.sign(validPayload, secret);
      
      expect(() => {
        validateRequiredClaims(validToken, ['sub', 'email', 'iat', 'exp']);
      }).not.toThrow();
      
      // Token missing required claims
      const invalidPayload = {
        sub: testUser.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        // Missing email
      };
      
      const invalidToken = mockJwtLibrary.sign(invalidPayload, secret);
      
      expect(() => {
        validateRequiredClaims(invalidToken, ['sub', 'email', 'iat', 'exp']);
      }).toThrow('Missing required claim: email');
    });
    
    test('should validate audience and issuer claims', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      const expectedIssuer = jwtConfig.credentials!.issuer;
      const expectedAudience = jwtConfig.credentials!.audience;
      
      const validateIssuerAndAudience = (token: string, expectedIssuer: string, expectedAudience: string) => {
        const decoded = mockJwtLibrary.verify(token, secret);
        
        if (decoded.iss && decoded.iss !== expectedIssuer) {
          throw new Error(`Invalid issuer: expected ${expectedIssuer}, got ${decoded.iss}`);
        }
        
        if (decoded.aud && decoded.aud !== expectedAudience) {
          throw new Error(`Invalid audience: expected ${expectedAudience}, got ${decoded.aud}`);
        }
        
        return decoded;
      };
      
      // Valid token
      const validPayload = {
        sub: testUser.id,
        email: testUser.email,
        iss: expectedIssuer,
        aud: expectedAudience,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      
      const validToken = mockJwtLibrary.sign(validPayload, secret);
      
      expect(() => {
        validateIssuerAndAudience(validToken, expectedIssuer, expectedAudience);
      }).not.toThrow();
      
      // Invalid issuer
      const invalidIssuerPayload = {
        ...validPayload,
        iss: 'invalid_issuer',
      };
      
      const invalidIssuerToken = mockJwtLibrary.sign(invalidIssuerPayload, secret);
      
      expect(() => {
        validateIssuerAndAudience(invalidIssuerToken, expectedIssuer, expectedAudience);
      }).toThrow('Invalid issuer');
      
      // Invalid audience
      const invalidAudiencePayload = {
        ...validPayload,
        aud: 'invalid_audience',
      };
      
      const invalidAudienceToken = mockJwtLibrary.sign(invalidAudiencePayload, secret);
      
      expect(() => {
        validateIssuerAndAudience(invalidAudienceToken, expectedIssuer, expectedAudience);
      }).toThrow('Invalid audience');
    });
    
    test('should handle concurrent token operations safely', async () => {
      const testUser = TestDataGenerator.generateTestUser();
      const secret = jwtConfig.credentials!.secret;
      
      // Simulate concurrent token operations
      const operations = Array.from({ length: 10 }, (_, index) => {
        return async () => {
          const payload = {
            sub: testUser.id,
            email: testUser.email,
            index,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          };
          
          const token = mockJwtLibrary.sign(payload, secret);
          const verified = mockJwtLibrary.verify(token, secret);
          
          expect(verified.sub).toBe(testUser.id);
          expect(verified.index).toBe(index);
          
          return { token, verified };
        };
      });
      
      // Execute all operations concurrently
      const results = await Promise.all(operations.map(op => op()));
      
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.verified.index).toBe(index);
      });
    });
  });
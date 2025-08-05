/**
 * Authentication Services Mock Servers
 * 
 * Mock implementations for authentication service providers including
 * OAuth2, JWT, Firebase, and other authentication systems.
 */

import { MockServerResponse } from '../utils/test-helpers';

// Mock responses for OAuth2 providers
export const googleOAuth2Responses: Record<string, MockServerResponse> = {
  // OAuth2 Authorization endpoint
  'GET /oauth2/v2/auth': {
    status: 302,
    headers: {
      'Location': 'http://localhost:3000/auth/callback?code=mock_auth_code&state=test_state',
      'Content-Type': 'text/html',
    },
    body: '<html><body>Redirecting...</body></html>',
  },
  
  // Token exchange endpoint
  'POST /oauth2/v4/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, max-age=0',
    },
    body: {
      access_token: 'ya29.mock_access_token_for_testing',
      expires_in: 3599,
      refresh_token: 'mock_refresh_token',
      scope: 'openid email profile',
      token_type: 'Bearer',
      id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoidGVzdF9jbGllbnRfaWQiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwMDM1OTksImVtYWlsIjoidGVzdC51c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVGVzdCJ9.mock_signature',
    },
  },
  
  // Token info endpoint
  'GET /oauth2/v1/tokeninfo': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      issued_to: 'test_client_id',
      audience: 'test_client_id',
      user_id: '1234567890',
      scope: 'openid email profile',
      expires_in: 3599,
      email: 'test.user@example.com',
      verified_email: true,
    },
  },
  
  // User info endpoint
  'GET /oauth2/v2/userinfo': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      id: '1234567890',
      email: 'test.user@example.com',
      verified_email: true,
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTest',
      locale: 'en',
    },
  },
  
  // Revoke token endpoint
  'POST /o/oauth2/revoke': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {},
  },
};

export const githubOAuth2Responses: Record<string, MockServerResponse> = {
  // OAuth2 Authorization endpoint
  'GET /login/oauth/authorize': {
    status: 302,
    headers: {
      'Location': 'http://localhost:3000/auth/callback?code=mock_github_code&state=test_state',
      'Content-Type': 'text/html',
    },
    body: '<html><body>Redirecting...</body></html>',
  },
  
  // Access token endpoint
  'POST /login/oauth/access_token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: {
      access_token: 'gho_mock_github_access_token_for_testing',
      token_type: 'bearer',
      scope: 'user:email',
    },
  },
  
  // User endpoint (GitHub API)
  'GET /user': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      login: 'testuser',
      id: 12345,
      node_id: 'MDQ6VXNlcjEyMzQ1',
      avatar_url: 'https://github.com/images/error/testuser_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/testuser',
      html_url: 'https://github.com/testuser',
      type: 'User',
      site_admin: false,
      name: 'Test User',
      company: 'Test Company',
      blog: 'https://testuser.example.com',
      location: 'Oslo, Norway',
      email: 'test.user@example.com',
      hireable: null,
      bio: 'Test user for integration testing',
      twitter_username: 'testuser',
      public_repos: 10,
      public_gists: 2,
      followers: 50,
      following: 25,
      created_at: '2020-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',
    },
  },
  
  // User emails endpoint
  'GET /user/emails': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: [
      {
        email: 'test.user@example.com',
        primary: true,
        verified: true,
        visibility: 'public',
      },
      {
        email: 'test.user.alt@example.com',
        primary: false,
        verified: true,
        visibility: 'private',
      },
    ],
  },
};

export const appleOAuth2Responses: Record<string, MockServerResponse> = {
  // Apple ID Authorization
  'POST /auth/authorize': {
    status: 302,
    headers: {
      'Location': 'http://localhost:3000/auth/callback?code=mock_apple_code&state=test_state',
      'Content-Type': 'text/html',
    },
    body: '<html><body>Redirecting...</body></html>',
  },
  
  // Token endpoint
  'POST /auth/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_apple_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_apple_refresh_token',
      id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoidGVzdF9hcHBsZV9jbGllbnRfaWQiLCJzdWIiOiIwMDEyMzQuNTY3ODkwIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwMDM1OTksImVtYWlsIjoidGVzdC51c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciJ9.mock_apple_signature',
    },
  },
  
  // Keys endpoint for JWT verification
  'GET /auth/keys': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      keys: [
        {
          kty: 'RSA',
          kid: 'mock_key_id',
          use: 'sig',
          alg: 'RS256',
          n: 'mock_public_key_n_parameter',
          e: 'AQAB',
        },
      ],
    },
  },
};

// Firebase Auth mock responses
export const firebaseAuthResponses: Record<string, MockServerResponse> = {
  // Sign up with email/password
  'POST /v1/accounts:signUp': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      idToken: 'mock_firebase_id_token',
      email: 'test.user@example.com',
      refreshToken: 'mock_firebase_refresh_token',
      expiresIn: '3600',
      localId: 'mock_firebase_local_id',
    },
  },
  
  // Sign in with email/password
  'POST /v1/accounts:signInWithPassword': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      idToken: 'mock_firebase_id_token',
      email: 'test.user@example.com',
      refreshToken: 'mock_firebase_refresh_token',
      expiresIn: '3600',
      localId: 'mock_firebase_local_id',
      registered: true,
    },
  },
  
  // Get user data
  'POST /v1/accounts:lookup': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      users: [
        {
          localId: 'mock_firebase_local_id',
          email: 'test.user@example.com',
          emailVerified: true,
          displayName: 'Test User',
          photoUrl: 'https://example.com/photo.jpg',
          createdAt: '1609459200000',
          lastLoginAt: '1699999999000',
          providerUserInfo: [
            {
              providerId: 'password',
              email: 'test.user@example.com',
            },
          ],
        },
      ],
    },
  },
  
  // Refresh token
  'POST /v1/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_firebase_access_token',
      expires_in: '3600',
      token_type: 'Bearer',
      refresh_token: 'mock_firebase_new_refresh_token',
      id_token: 'mock_firebase_new_id_token',
      user_id: 'mock_firebase_local_id',
      project_id: 'test-project-id',
    },
  },
  
  // Send email verification
  'POST /v1/accounts:sendOobCode': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'test.user@example.com',
    },
  },
  
  // Reset password
  'POST /v1/accounts:sendOobCode': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: 'test.user@example.com',
    },
  },
};

// Supabase Auth mock responses
export const supabaseAuthResponses: Record<string, MockServerResponse> = {
  // Sign up
  'POST /auth/v1/signup': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_supabase_access_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1700003599,
      refresh_token: 'mock_supabase_refresh_token',
      user: {
        id: 'mock_supabase_user_id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test.user@example.com',
        email_confirmed_at: '2023-01-01T12:00:00.000Z',
        phone: '',
        confirmed_at: '2023-01-01T12:00:00.000Z',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          name: 'Test User',
        },
        identities: [
          {
            id: 'mock_supabase_user_id',
            user_id: 'mock_supabase_user_id',
            identity_data: {
              email: 'test.user@example.com',
              sub: 'mock_supabase_user_id',
            },
            provider: 'email',
            last_sign_in_at: '2023-01-01T12:00:00.000Z',
            created_at: '2023-01-01T12:00:00.000Z',
            updated_at: '2023-01-01T12:00:00.000Z',
          },
        ],
        created_at: '2023-01-01T12:00:00.000Z',
        updated_at: '2023-01-01T12:00:00.000Z',
      },
    },
  },
  
  // Sign in with password
  'POST /auth/v1/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_supabase_access_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1700003599,
      refresh_token: 'mock_supabase_refresh_token',
      user: {
        id: 'mock_supabase_user_id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test.user@example.com',
        email_confirmed_at: '2023-01-01T12:00:00.000Z',
        phone: '',
        confirmed_at: '2023-01-01T12:00:00.000Z',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          name: 'Test User',
        },
        identities: [
          {
            id: 'mock_supabase_user_id',
            user_id: 'mock_supabase_user_id',
            identity_data: {
              email: 'test.user@example.com',
              sub: 'mock_supabase_user_id',
            },
            provider: 'email',
            last_sign_in_at: '2023-01-01T12:00:00.000Z',
            created_at: '2023-01-01T12:00:00.000Z',
            updated_at: '2023-01-01T12:00:00.000Z',
          },
        ],
        created_at: '2023-01-01T12:00:00.000Z',
        updated_at: '2023-01-01T12:00:00.000Z',
      },
    },
  },
  
  // Get user
  'GET /auth/v1/user': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock_supabase_access_token',
    },
    body: {
      id: 'mock_supabase_user_id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test.user@example.com',
      email_confirmed_at: '2023-01-01T12:00:00.000Z',
      phone: '',
      confirmed_at: '2023-01-01T12:00:00.000Z',
      last_sign_in_at: '2023-01-01T12:00:00.000Z',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        name: 'Test User',
      },
      identities: [
        {
          id: 'mock_supabase_user_id',
          user_id: 'mock_supabase_user_id',
          identity_data: {
            email: 'test.user@example.com',
            sub: 'mock_supabase_user_id',
          },
          provider: 'email',
          last_sign_in_at: '2023-01-01T12:00:00.000Z',
          created_at: '2023-01-01T12:00:00.000Z',
          updated_at: '2023-01-01T12:00:00.000Z',
        },
      ],
      created_at: '2023-01-01T12:00:00.000Z',
      updated_at: '2023-01-01T12:00:00.000Z',
    },
  },
  
  // Refresh token
  'POST /auth/v1/token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_supabase_new_access_token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1700003599,
      refresh_token: 'mock_supabase_new_refresh_token',
      user: {
        id: 'mock_supabase_user_id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test.user@example.com',
        email_confirmed_at: '2023-01-01T12:00:00.000Z',
        phone: '',
        confirmed_at: '2023-01-01T12:00:00.000Z',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          name: 'Test User',
        },
        identities: [
          {
            id: 'mock_supabase_user_id',
            user_id: 'mock_supabase_user_id',
            identity_data: {
              email: 'test.user@example.com',
              sub: 'mock_supabase_user_id',
            },
            provider: 'email',
            last_sign_in_at: '2023-01-01T12:00:00.000Z',
            created_at: '2023-01-01T12:00:00.000Z',
            updated_at: '2023-01-01T12:00:00.000Z',
          },
        ],
        created_at: '2023-01-01T12:00:00.000Z',
        updated_at: '2023-01-01T12:00:00.000Z',
      },
    },
  },
  
  // Sign out
  'POST /auth/v1/logout': {
    status: 204,
    headers: {},
    body: null,
  },
};

// BankID mock responses (Norwegian digital identity)
export const bankIdResponses: Record<string, MockServerResponse> = {
  // Authorization endpoint
  'GET /authorize': {
    status: 302,
    headers: {
      'Location': 'http://localhost:3000/auth/callback?code=mock_bankid_code&state=test_state',
      'Content-Type': 'text/html',
    },
    body: '<html><body>BankID authentication redirect...</body></html>',
  },
  
  // Token endpoint
  'POST /token': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      access_token: 'mock_bankid_access_token',
      token_type: 'Bearer',
      expires_in: 300,
      refresh_token: 'mock_bankid_refresh_token',
      scope: 'openid profile',
      id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvaWRjLXZlcjIuZGlmaS5ubyIsImF1ZCI6InRlc3RfY2xpZW50X2lkIiwic3ViIjoiMDk0NzgxMjM0NTYiLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MTcwMDAwMzU5OSwidWlkIjoiMDk0NzgxMjM0NTYiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZ2l2ZW5fbmFtZSI6IlRlc3QifQ.mock_bankid_signature',
    },
  },
  
  // UserInfo endpoint
  'GET /userinfo': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      sub: '09478123456',
      uid: '09478123456', // Norwegian national ID (11 digits)
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      locale: 'nb',
    },
  },
  
  // Health check endpoint
  'GET /health': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  },
};

// JWT token utilities for testing
export const jwtTestTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfaWQiLCJlbWFpbCI6InRlc3QudXNlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MTcwMDAwMzU5OSwiaXNzIjoieGFoZWVuLXRlc3QiLCJhdWQiOiJ4YWhlZW4tdGVzdC11c2VycyJ9.mock_signature',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfaWQiLCJlbWFpbCI6InRlc3QudXNlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMCwiaXNzIjoieGFoZWVuLXRlc3QiLCJhdWQiOiJ4YWhlZW4tdGVzdC11c2VycyJ9.mock_expired_signature',
  invalidToken: 'invalid.jwt.token',
  malformedToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.mock_signature',
};

// Health check responses for all auth services
export const authHealthCheckResponses: Record<string, MockServerResponse> = {
  'GET /health': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status: 'ok',
      service: 'auth-mock-server',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 3600),
    },
  },
  
  'GET /status': {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      healthy: true,
      services: {
        database: 'healthy',
        cache: 'healthy',
        external_apis: 'healthy',
      },
    },
  },
};

// Export all mock responses
export const authMockResponses = {
  google: googleOAuth2Responses,
  github: githubOAuth2Responses,
  apple: appleOAuth2Responses,
  firebase: firebaseAuthResponses,
  supabase: supabaseAuthResponses,
  bankid: bankIdResponses,
  jwt: jwtTestTokens,
  health: authHealthCheckResponses,
} as const;
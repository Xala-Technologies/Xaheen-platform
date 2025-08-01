/**
 * Vipps Authentication Integration
 * Generates Vipps authentication components and services for Norwegian applications
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

/**
 * Generation result interface
 */
export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Authentication options interface
 */
export interface AuthOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  environment?: 'test' | 'production';
  redirectUrl?: string;
  scopes?: string[];
  webhookEndpoint?: string;
  includeProfile?: boolean;
  useSession?: boolean;
  sessionStorage?: 'cookie' | 'database' | 'redis';
}

/**
 * Vipps environment configuration
 */
export interface VippsConfig {
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  webhookSecret: string;
  environment: 'test' | 'production';
}

/**
 * Vipps user profile interface
 */
export interface VippsUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    street_address?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  birthdate?: string;
  other_addresses?: Array<{
    address_type: string;
    street_address?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  }>;
  accounts?: Array<{
    account_type: string;
    account_name?: string;
    account_number?: string;
    bank_name?: string;
  }>;
}

/**
 * Vipps SDK configuration
 */
export class VippsSdkConfig {
  private config: VippsConfig;

  constructor(environment: 'test' | 'production' = 'test') {
    this.config = this.getEnvironmentConfig(environment);
  }

  /**
   * Get environment-specific configuration
   */
  private getEnvironmentConfig(environment: 'test' | 'production'): VippsConfig {
    const baseConfigs = {
      test: {
        apiBaseUrl: 'https://apitest.vipps.no',
        authUrl: 'https://apitest.vipps.no/access-management-1.0/access/oauth2/auth',
        tokenUrl: 'https://apitest.vipps.no/access-management-1.0/access/oauth2/token',
        userInfoUrl: 'https://apitest.vipps.no/vipps-userinfo-api/userinfo',
      },
      production: {
        apiBaseUrl: 'https://api.vipps.no',
        authUrl: 'https://api.vipps.no/access-management-1.0/access/oauth2/auth',
        tokenUrl: 'https://api.vipps.no/access-management-1.0/access/oauth2/token',
        userInfoUrl: 'https://api.vipps.no/vipps-userinfo-api/userinfo',
      },
    };

    return {
      clientId: process.env.VIPPS_CLIENT_ID || '',
      clientSecret: process.env.VIPPS_CLIENT_SECRET || '',
      webhookSecret: process.env.VIPPS_WEBHOOK_SECRET || '',
      environment,
      ...baseConfigs[environment],
    };
  }

  /**
   * Get configuration object
   */
  getConfig(): VippsConfig {
    return this.config;
  }

  /**
   * Validate configuration
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.clientId) {
      errors.push('VIPPS_CLIENT_ID environment variable is required');
    }

    if (!this.config.clientSecret) {
      errors.push('VIPPS_CLIENT_SECRET environment variable is required');
    }

    if (!this.config.webhookSecret) {
      errors.push('VIPPS_WEBHOOK_SECRET environment variable is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Generate Vipps authentication component
 * @param options - Authentication options
 * @returns Generation result
 */
export async function generateVippsAuthComponent(options: AuthOptions): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    files: [],
    errors: [],
    warnings: [],
  };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      environment = 'test',
      redirectUrl,
      scopes = ['openid', 'name', 'email', 'phoneNumber'],
      includeProfile = true,
    } = options;

    // Determine output directory
    const outputDir = outputPath || path.join(
      process.cwd(),
      'src',
      'components',
      'auth'
    );

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load template
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'templates',
      'integrations',
      'auth',
      'vipps-login.tsx.hbs'
    );

    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      template = getDefaultVippsLoginTemplate(framework, typescript);
    }

    // Generate component content
    const compiledTemplate = Handlebars.compile(template);
    const componentContent = compiledTemplate({
      projectName,
      framework,
      typescript,
      environment,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/vipps/callback`,
      scopes,
      includeProfile,
      vippsConfig: new VippsSdkConfig(environment).getConfig(),
    });

    // Write component file
    const extension = typescript ? '.tsx' : '.jsx';
    const componentFile = path.join(outputDir, `VippsLogin${extension}`);
    fs.writeFileSync(componentFile, componentContent, 'utf-8');
    result.files.push(componentFile);

    // Generate callback component if needed
    if (framework === 'nextjs' || framework === 'react') {
      const callbackContent = generateVippsCallbackComponent({
        ...options,
        template: 'callback',
      });

      const callbackFile = path.join(outputDir, `VippsCallback${extension}`);
      fs.writeFileSync(callbackFile, callbackContent, 'utf-8');
      result.files.push(callbackFile);
    }

    // Generate types file if TypeScript
    if (typescript) {
      const typesContent = generateVippsTypes();
      const typesFile = path.join(outputDir, 'vipps.types.ts');
      fs.writeFileSync(typesFile, typesContent, 'utf-8');
      result.files.push(typesFile);
    }

    result.success = true;

  } catch (error: any) {
    result.errors?.push(`Vipps component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate Vipps authentication service
 * @param options - Authentication options
 * @returns Generation result
 */
export async function generateVippsAuthService(options: AuthOptions): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    files: [],
    errors: [],
    warnings: [],
  };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      environment = 'test',
      webhookEndpoint,
      includeProfile = true,
      useSession = true,
      sessionStorage = 'cookie',
    } = options;

    // Determine output directory
    const outputDir = outputPath || path.join(
      process.cwd(),
      'src',
      'services',
      'auth'
    );

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load template
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'templates',
      'integrations',
      'auth',
      'vipps-service.ts.hbs'
    );

    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      template = getDefaultVippsServiceTemplate(framework, typescript);
    }

    // Generate service content
    const compiledTemplate = Handlebars.compile(template);
    const serviceContent = compiledTemplate({
      projectName,
      framework,
      typescript,
      environment,
      webhookEndpoint: webhookEndpoint || '/api/webhooks/vipps',
      includeProfile,
      useSession,
      sessionStorage,
      vippsConfig: new VippsSdkConfig(environment).getConfig(),
    });

    // Write service file
    const extension = typescript ? '.ts' : '.js';
    const serviceFile = path.join(outputDir, `vipps${extension}`);
    fs.writeFileSync(serviceFile, serviceContent, 'utf-8');
    result.files.push(serviceFile);

    // Generate webhook handler if requested
    if (webhookEndpoint) {
      const webhookContent = generateVippsWebhookHandler(options);
      const webhookFile = path.join(outputDir, `vipps-webhook${extension}`);
      fs.writeFileSync(webhookFile, webhookContent, 'utf-8');
      result.files.push(webhookFile);
    }

    // Generate environment configuration
    const envContent = generateVippsEnvConfig(environment);
    const envFile = path.join(process.cwd(), '.env.vipps.example');
    
    if (!fs.existsSync(envFile)) {
      fs.writeFileSync(envFile, envContent, 'utf-8');
      result.files.push(envFile);
    } else {
      result.warnings?.push('Environment configuration file already exists');
    }

    result.success = true;

  } catch (error: any) {
    result.errors?.push(`Vipps service generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Helper functions
 */

function getDefaultVippsLoginTemplate(framework: string, typescript: boolean): string {
  return `import React, { useState } from 'react';
{{#if typescript}}
import type { VippsAuthOptions, VippsUserProfile } from './vipps.types';
{{/if}}

{{#if typescript}}
interface VippsLoginProps {
  onSuccess?: (user: VippsUserProfile) => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
  scopes?: string[];
  className?: string;
}
{{/if}}

export const VippsLogin{{#if typescript}}: React.FC<VippsLoginProps>{{/if}} = ({
  onSuccess,
  onError,
  redirectUrl = '{{redirectUrl}}',
  scopes = {{{JSON scopes}}},
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleVippsLogin = async () => {
    setIsLoading(true);
    
    try {
      const authUrl = new URL('{{vippsConfig.authUrl}}');
      authUrl.searchParams.set('client_id', '{{vippsConfig.clientId}}');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUrl);
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('state', generateState());
      
      // Store state for validation
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vipps_auth_state', authUrl.searchParams.get('state') || '');
      }
      
      // Redirect to Vipps
      window.location.href = authUrl.toString();
      
    } catch (error) {
      setIsLoading(false);
      onError?.(error as Error);
    }
  };

  const generateState = () => {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  };

  return (
    <button
      onClick={handleVippsLogin}
      disabled={isLoading}
      className={\`vipps-login-button \${className}\`}
      style={{
        backgroundColor: '#ff5b24',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {isLoading ? (
        <>
          <div className="spinner" />
          Kobler til Vipps...
        </>
      ) : (
        <>
          <VippsIcon />
          Logg inn med Vipps
        </>
      )}
    </button>
  );
};

const VippsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L9 8l3-3z"/>
  </svg>
);`;
}

function getDefaultVippsServiceTemplate(framework: string, typescript: boolean): string {
  return `{{#if typescript}}
import type { VippsConfig, VippsUserProfile, VippsTokenResponse } from './vipps.types';
{{/if}}

export class VippsAuthService {
  private config{{#if typescript}}: VippsConfig{{/if}};
  
  constructor(config{{#if typescript}}: VippsConfig{{/if}}) {
    this.config = config;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code{{#if typescript}}: string{{/if}}, redirectUri{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<VippsTokenResponse>{{/if}} {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${btoa(\`\${this.config.clientId}:\${this.config.clientSecret}\`)}\`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(\`Token exchange failed: \${response.statusText}\`);
    }

    return response.json();
  }

  /**
   * Get user profile from Vipps
   */
  async getUserProfile(accessToken{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<VippsUserProfile>{{/if}} {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
      },
    });

    if (!response.ok) {
      throw new Error(\`Failed to fetch user profile: \${response.statusText}\`);
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload{{#if typescript}}: string{{/if}},
    signature{{#if typescript}}: string{{/if}},
    secret{{#if typescript}}: string{{/if}}
  ){{#if typescript}}: boolean{{/if}} {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<VippsTokenResponse>{{/if}} {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${btoa(\`\${this.config.clientId}:\${this.config.clientSecret}\`)}\`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(\`Token refresh failed: \${response.statusText}\`);
    }

    return response.json();
  }

  /**
   * Revoke access token
   */
  async revokeToken(token{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<void>{{/if}} {
    await fetch(\`\${this.config.apiBaseUrl}/access-management-1.0/access/oauth2/revoke\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${btoa(\`\${this.config.clientId}:\${this.config.clientSecret}\`)}\`,
      },
      body: new URLSearchParams({
        token,
      }),
    });
  }
}

// Initialize service with environment configuration
export const vippsAuth = new VippsAuthService({
  clientId: process.env.VIPPS_CLIENT_ID || '',
  clientSecret: process.env.VIPPS_CLIENT_SECRET || '',
  apiBaseUrl: '{{vippsConfig.apiBaseUrl}}',
  authUrl: '{{vippsConfig.authUrl}}',
  tokenUrl: '{{vippsConfig.tokenUrl}}',
  userInfoUrl: '{{vippsConfig.userInfoUrl}}',
  webhookSecret: process.env.VIPPS_WEBHOOK_SECRET || '',
  environment: '{{environment}}',
});`;
}

function generateVippsCallbackComponent(options: AuthOptions): string {
  const { typescript = true, framework = 'react' } = options;

  return `import React, { useEffect, useState } from 'react';
import { useRouter } from '${framework === 'nextjs' ? 'next/router' : 'react-router-dom'}';
${typescript ? "import type { VippsUserProfile } from './vipps.types';" : ''}

${typescript ? `
interface VippsCallbackProps {
  onSuccess?: (user: VippsUserProfile) => void;
  onError?: (error: Error) => void;
}
` : ''}

export const VippsCallback${typescript ? ': React.FC<VippsCallbackProps>' : ''} = ({
  onSuccess,
  onError,
}) => {
  const [status, setStatus] = useState${typescript ? '<"loading" | "success" | "error">' : ''}('loading');
  const [error, setError] = useState${typescript ? '<string | null>' : ''}(null);
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = sessionStorage.getItem('vipps_auth_state');

        if (!code) {
          throw new Error('Authorization code not found');
        }

        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Exchange code for token
        const response = await fetch('/api/auth/vipps/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri: window.location.origin + window.location.pathname,
          }),
        });

        if (!response.ok) {
          throw new Error('Token exchange failed');
        }

        const { user } = await response.json();
        
        setStatus('success');
        onSuccess?.(user);
        
        // Clean up
        sessionStorage.removeItem('vipps_auth_state');
        
        // Redirect to dashboard or home
        router.push('/dashboard');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus('error');
        onError?.(new Error(errorMessage));
      }
    };

    handleCallback();
  }, [onSuccess, onError, router]);

  if (status === 'loading') {
    return (
      <div className="vipps-callback-loading">
        <div className="spinner" />
        <p>Behandler Vipps-autentisering...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="vipps-callback-error">
        <h2>Autentisering feilet</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/login')}>
          Prøv igjen
        </button>
      </div>
    );
  }

  return (
    <div className="vipps-callback-success">
      <h2>Autentisering vellykket!</h2>
      <p>Du blir videresendt...</p>
    </div>
  );
};`;
}

function generateVippsTypes(): string {
  return `export interface VippsConfig {
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  webhookSecret: string;
  environment: 'test' | 'production';
}

export interface VippsTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

export interface VippsUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    street_address?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  birthdate?: string;
  other_addresses?: Array<{
    address_type: string;
    street_address?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  }>;
  accounts?: Array<{
    account_type: string;
    account_name?: string;
    account_number?: string;
    bank_name?: string;
  }>;
}

export interface VippsAuthOptions {
  clientId: string;
  redirectUrl: string;
  scopes: string[];
  state?: string;
}

export interface VippsWebhookPayload {
  eventType: 'user.profile.updated' | 'user.consent.revoked';
  userId: string;
  timestamp: string;
  data: any;
}`;
}

function generateVippsWebhookHandler(options: AuthOptions): string {
  const { typescript = true, framework = 'nextjs' } = options;

  if (framework === 'nextjs') {
    return `${typescript ? "import type { NextApiRequest, NextApiResponse } from 'next';" : ''}
import { vippsAuth } from '../services/auth/vipps';
${typescript ? "import type { VippsWebhookPayload } from '../types/vipps.types';" : ''}

export default async function handler(
  req${typescript ? ': NextApiRequest' : ''},
  res${typescript ? ': NextApiResponse' : ''}
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-vipps-signature'] ${typescript ? 'as string' : ''};
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = vippsAuth.verifyWebhookSignature(
      payload,
      signature,
      process.env.VIPPS_WEBHOOK_SECRET || ''
    );

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const webhookData${typescript ? ': VippsWebhookPayload' : ''} = req.body;

    // Handle different webhook events
    switch (webhookData.eventType) {
      case 'user.profile.updated':
        await handleProfileUpdate(webhookData);
        break;
      case 'user.consent.revoked':
        await handleConsentRevoked(webhookData);
        break;
      default:
        console.log('Unhandled webhook event:', webhookData.eventType);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleProfileUpdate(data${typescript ? ': VippsWebhookPayload' : ''}) {
  // Update user profile in database
  console.log('Profile updated for user:', data.userId);
  // TODO: Implement database update logic
}

async function handleConsentRevoked(data${typescript ? ': VippsWebhookPayload' : ''}) {
  // Remove user data as required by GDPR
  console.log('Consent revoked for user:', data.userId);
  // TODO: Implement data cleanup logic
}`;
  }

  return `// Webhook handler for ${framework}
// TODO: Implement webhook handler for ${framework}`;
}

function generateVippsEnvConfig(environment: 'test' | 'production'): string {
  return `# Vipps Configuration (${environment.toUpperCase()})
VIPPS_CLIENT_ID=your_vipps_client_id_here
VIPPS_CLIENT_SECRET=your_vipps_client_secret_here
VIPPS_WEBHOOK_SECRET=your_webhook_secret_here
VIPPS_ENVIRONMENT=${environment}

# Optional: Override default URLs
${environment === 'test' ? '# ' : ''}VIPPS_API_BASE_URL=https://api${environment === 'test' ? 'test' : ''}.vipps.no
${environment === 'test' ? '# ' : ''}VIPPS_AUTH_URL=https://api${environment === 'test' ? 'test' : ''}.vipps.no/access-management-1.0/access/oauth2/auth
${environment === 'test' ? '# ' : ''}VIPPS_TOKEN_URL=https://api${environment === 'test' ? 'test' : ''}.vipps.no/access-management-1.0/access/oauth2/token
${environment === 'test' ? '# ' : ''}VIPPS_USERINFO_URL=https://api${environment === 'test' ? 'test' : ''}.vipps.no/vipps-userinfo-api/userinfo

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
VIPPS_REDIRECT_URL=\${NEXT_PUBLIC_APP_URL}/auth/vipps/callback
VIPPS_WEBHOOK_URL=\${NEXT_PUBLIC_APP_URL}/api/webhooks/vipps`;
}
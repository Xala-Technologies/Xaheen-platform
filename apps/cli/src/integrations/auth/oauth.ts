/**
 * OAuth Provider Integration
 * Generates OAuth authentication components and services for multiple providers
 * Supports Google, GitHub, Microsoft, and other major OAuth providers
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
  providers?: OAuthProvider[];
  redirectUrl?: string;
  scopes?: Record<string, string[]>;
  includeRefresh?: boolean;
  useSession?: boolean;
  sessionStorage?: 'cookie' | 'database' | 'redis';
  enablePKCE?: boolean;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'discord' | 'twitter' | 'facebook' | 'linkedin' | 'apple';

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  name: string;
  displayName: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  defaultScopes: string[];
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  color: string;
  icon: string;
  supportsPKCE: boolean;
  supportsRefresh: boolean;
}

/**
 * OAuth user profile interface (normalized)
 */
export interface OAuthUserProfile {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  provider: OAuthProvider;
  raw: any; // Original provider response
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string; // For OpenID Connect providers
}

/**
 * OAuth provider configurations
 */
export class OAuthProviderConfigs {
  private static configs: Record<OAuthProvider, Omit<OAuthProviderConfig, 'clientId' | 'clientSecret' | 'redirectUri'>> = {
    google: {
      name: 'google',
      displayName: 'Google',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: ['openid', 'email', 'profile'],
      defaultScopes: ['openid', 'email', 'profile'],
      color: '#4285f4',
      icon: 'google',
      supportsPKCE: true,
      supportsRefresh: true,
    },
    github: {
      name: 'github',
      displayName: 'GitHub',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      scopes: ['user:email', 'read:user'],
      defaultScopes: ['read:user', 'user:email'],
      color: '#333333',
      icon: 'github',
      supportsPKCE: false,
      supportsRefresh: false,
    },
    microsoft: {
      name: 'microsoft',
      displayName: 'Microsoft',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      defaultScopes: ['openid', 'profile', 'email'],
      color: '#0078d4',
      icon: 'microsoft',
      supportsPKCE: true,
      supportsRefresh: true,
    },
    discord: {
      name: 'discord',
      displayName: 'Discord',
      authUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
      userInfoUrl: 'https://discord.com/api/users/@me',
      scopes: ['identify', 'email'],
      defaultScopes: ['identify', 'email'],
      color: '#5865f2',
      icon: 'discord',
      supportsPKCE: true,
      supportsRefresh: true,
    },
    twitter: {
      name: 'twitter',
      displayName: 'Twitter',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      userInfoUrl: 'https://api.twitter.com/2/users/me',
      scopes: ['tweet.read', 'users.read'],
      defaultScopes: ['tweet.read', 'users.read'],
      color: '#1da1f2',
      icon: 'twitter',
      supportsPKCE: true,
      supportsRefresh: true,
    },
    facebook: {
      name: 'facebook',
      displayName: 'Facebook',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/v18.0/me',
      scopes: ['email', 'public_profile'],
      defaultScopes: ['email', 'public_profile'],
      color: '#1877f2',
      icon: 'facebook',
      supportsPKCE: false,
      supportsRefresh: false,
    },
    linkedin: {
      name: 'linkedin',
      displayName: 'LinkedIn',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      userInfoUrl: 'https://api.linkedin.com/v2/people/~',
      scopes: ['r_liteprofile', 'r_emailaddress'],
      defaultScopes: ['r_liteprofile', 'r_emailaddress'],
      color: '#0a66c2',
      icon: 'linkedin',
      supportsPKCE: false,
      supportsRefresh: true,
    },
    apple: {
      name: 'apple',
      displayName: 'Apple',
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      userInfoUrl: '', // Apple provides user info in the ID token
      scopes: ['name', 'email'],
      defaultScopes: ['name', 'email'],
      color: '#000000',
      icon: 'apple',
      supportsPKCE: true,
      supportsRefresh: true,
    },
  };

  static getConfig(provider: OAuthProvider): Omit<OAuthProviderConfig, 'clientId' | 'clientSecret' | 'redirectUri'> {
    return this.configs[provider];
  }

  static getAllConfigs(): Record<OAuthProvider, Omit<OAuthProviderConfig, 'clientId' | 'clientSecret' | 'redirectUri'>> {
    return this.configs;
  }

  static createConfig(
    provider: OAuthProvider,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): OAuthProviderConfig {
    const baseConfig = this.getConfig(provider);
    return {
      ...baseConfig,
      clientId,
      clientSecret,
      redirectUri,
    };
  }
}

/**
 * Generate OAuth authentication component
 * @param provider - OAuth provider name
 * @param options - Authentication options
 * @returns Generation result
 */
export async function generateOAuthComponent(
  provider: OAuthProvider,
  options: AuthOptions
): Promise<GenerationResult> {
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
      redirectUrl,
      scopes,
      enablePKCE = true,
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

    // Get provider configuration
    const providerConfig = OAuthProviderConfigs.getConfig(provider);
    if (!providerConfig) {
      result.errors?.push(`Unsupported OAuth provider: ${provider}`);
      return result;
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
      'oauth-login.tsx.hbs'
    );

    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      template = getDefaultOAuthLoginTemplate(framework, typescript);
    }

    // Generate component content
    const compiledTemplate = Handlebars.compile(template);
    const componentContent = compiledTemplate({
      projectName,
      provider,
      providerConfig,
      framework,
      typescript,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/${provider}/callback`,
      scopes: scopes?.[provider] || providerConfig.defaultScopes,
      enablePKCE: enablePKCE && providerConfig.supportsPKCE,
    });

    // Write component file
    const extension = typescript ? '.tsx' : '.jsx';
    const componentName = `${provider.charAt(0).toUpperCase() + provider.slice(1)}Login`;
    const componentFile = path.join(outputDir, `${componentName}${extension}`);
    fs.writeFileSync(componentFile, componentContent, 'utf-8');
    result.files.push(componentFile);

    // Generate callback component
    const callbackContent = generateOAuthCallbackComponent(provider, options);
    const callbackName = `${provider.charAt(0).toUpperCase() + provider.slice(1)}Callback`;
    const callbackFile = path.join(outputDir, `${callbackName}${extension}`);
    fs.writeFileSync(callbackFile, callbackContent, 'utf-8');
    result.files.push(callbackFile);

    // Generate types file if TypeScript
    if (typescript) {
      const typesContent = generateOAuthTypes(provider);
      const typesFile = path.join(outputDir, `${provider}.types.ts`);
      fs.writeFileSync(typesFile, typesContent, 'utf-8');
      result.files.push(typesFile);
    }

    result.success = true;

  } catch (error: any) {
    result.errors?.push(`OAuth component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate OAuth authentication service
 * @param provider - OAuth provider name
 * @param options - Authentication options
 * @returns Generation result
 */
export async function generateOAuthService(
  provider: OAuthProvider,
  options: AuthOptions
): Promise<GenerationResult> {
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
      includeRefresh = true,
      useSession = true,
      sessionStorage = 'cookie',
      enablePKCE = true,
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

    // Get provider configuration
    const providerConfig = OAuthProviderConfigs.getConfig(provider);
    if (!providerConfig) {
      result.errors?.push(`Unsupported OAuth provider: ${provider}`);
      return result;
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
      'oauth-service.ts.hbs'
    );

    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      template = getDefaultOAuthServiceTemplate(framework, typescript);
    }

    // Generate service content
    const compiledTemplate = Handlebars.compile(template);
    const serviceContent = compiledTemplate({
      projectName,
      provider,
      providerConfig,
      framework,
      typescript,
      includeRefresh: includeRefresh && providerConfig.supportsRefresh,
      useSession,
      sessionStorage,
      enablePKCE: enablePKCE && providerConfig.supportsPKCE,
    });

    // Write service file
    const extension = typescript ? '.ts' : '.js';
    const serviceFile = path.join(outputDir, `${provider}${extension}`);
    fs.writeFileSync(serviceFile, serviceContent, 'utf-8');
    result.files.push(serviceFile);

    // Generate environment configuration
    const envContent = generateOAuthEnvConfig(provider, providerConfig);
    const envFile = path.join(process.cwd(), `.env.${provider}.example`);
    
    if (!fs.existsSync(envFile)) {
      fs.writeFileSync(envFile, envContent, 'utf-8');
      result.files.push(envFile);
    } else {
      result.warnings?.push(`${provider} environment configuration file already exists`);
    }

    result.success = true;

  } catch (error: any) {
    result.errors?.push(`OAuth service generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Helper functions
 */

function getDefaultOAuthLoginTemplate(framework: string, typescript: boolean): string {
  return `import React, { useState } from 'react';
{{#if typescript}}
import type { {{capitalize provider}}UserProfile } from './{{provider}}.types';
{{/if}}

{{#if typescript}}
interface {{capitalize provider}}LoginProps {
  onSuccess?: (user: {{capitalize provider}}UserProfile) => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
  scopes?: string[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'icon';
}
{{/if}}

export const {{capitalize provider}}Login{{#if typescript}}: React.FC<{{capitalize provider}}LoginProps>{{/if}} = ({
  onSuccess,
  onError,
  redirectUrl = '{{redirectUrl}}',
  scopes = {{{json scopes}}},
  className = '',
  size = 'medium',
  variant = 'default',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handle{{capitalize provider}}Login = async () => {
    setIsLoading(true);
    
    try {
      // Generate state and PKCE parameters
      const state = generateSecureState();
      {{#if enablePKCE}}
      const { codeVerifier, codeChallenge } = await generatePKCE();
      {{/if}}
      
      // Store parameters for callback validation
      sessionStorage.setItem('{{provider}}_auth_state', state);
      {{#if enablePKCE}}
      sessionStorage.setItem('{{provider}}_code_verifier', codeVerifier);
      {{/if}}
      sessionStorage.setItem('{{provider}}_redirect_url', redirectUrl);
      
      // Construct authorization URL
      const authUrl = new URL('{{providerConfig.authUrl}}');
      authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_{{uppercase provider}}_CLIENT_ID || '');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUrl);
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('state', state);
      
      {{#if enablePKCE}}
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      {{/if}}
      
      {{#if (eq provider "google")}}
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      {{/if}}
      
      {{#if (eq provider "microsoft")}}
      authUrl.searchParams.set('prompt', 'select_account');
      {{/if}}
      
      // Redirect to OAuth provider
      window.location.href = authUrl.toString();
      
    } catch (error) {
      setIsLoading(false);
      console.error('{{capitalize provider}} login error:', error);
      onError?.(error as Error);
    }
  };

  const generateSecureState = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
  };

  {{#if enablePKCE}}
  const generatePKCE = async () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))))
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
    
    return { codeVerifier, codeChallenge };
  };
  {{/if}}

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { padding: '8px 16px', fontSize: '14px', height: '36px' };
      case 'large':
        return { padding: '16px 32px', fontSize: '18px', height: '56px' };
      default:
        return { padding: '12px 24px', fontSize: '16px', height: '48px' };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();
    const baseStyles = {
      ...sizeStyles,
      fontWeight: '600',
      borderRadius: '8px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.6 : 1,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: '{{providerConfig.color}}',
          border: '2px solid {{providerConfig.color}}',
        };
      case 'icon':
        return {
          ...baseStyles,
          backgroundColor: '{{providerConfig.color}}',
          color: 'white',
          width: sizeStyles.height,
          padding: '0',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '{{providerConfig.color}}',
          color: 'white',
        };
    }
  };

  return (
    <button
      onClick={handle{{capitalize provider}}Login}
      disabled={isLoading}
      className={\`{{provider}}-login-button \${className}\`}
      style={getVariantStyles()}
      onMouseEnter={(e) => {
        if (!isLoading) {
          const currentBg = e.target.style.backgroundColor;
          if (currentBg === '{{providerConfig.color}}') {
            e.target.style.backgroundColor = '{{providerConfig.color}}dd';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.target.style.backgroundColor = variant === 'outline' ? 'transparent' : '{{providerConfig.color}}';
        }
      }}
      aria-label="Sign in with {{providerConfig.displayName}}"
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          {variant !== 'icon' && <span>Signing in...</span>}
        </>
      ) : (
        <>
          <{{capitalize provider}}Icon />
          {variant !== 'icon' && <span>Continue with {{providerConfig.displayName}}</span>}
        </>
      )}
    </button>
  );
};

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
      style={{ animation: 'spin 1s linear infinite' }}
    />
    <style jsx>{\`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    \`}</style>
  </svg>
);

const {{capitalize provider}}Icon = () => (
  ${getProviderIcon('{{provider}}')}
);`;
}

function getDefaultOAuthServiceTemplate(framework: string, typescript: boolean): string {
  return `{{#if typescript}}
import type { 
  {{capitalize provider}}Config, 
  {{capitalize provider}}UserProfile, 
  OAuthTokenResponse 
} from './{{provider}}.types';
{{/if}}

export class {{capitalize provider}}AuthService {
  private config{{#if typescript}}: {{capitalize provider}}Config{{/if}};
  private tokenCache{{#if typescript}}: Map<string, { token: string; expires: number }>{{/if}} = new Map();
  
  constructor(config{{#if typescript}}: {{capitalize provider}}Config{{/if}}) {
    this.config = config;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code{{#if typescript}}: string{{/if}},
    redirectUri{{#if typescript}}: string{{/if}},
    {{#if enablePKCE}}codeVerifier{{#if typescript}}?: string{{/if}},{{/if}}
    state{{#if typescript}}?: string{{/if}}
  ){{#if typescript}}: Promise<OAuthTokenResponse & { user?: {{capitalize provider}}UserProfile }>{{/if}} {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        {{#if enablePKCE}}
        ...(codeVerifier && { code_verifier: codeVerifier }),
        {{/if}}
      });

      const response = await fetch('{{providerConfig.tokenUrl}}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': '{{projectName}}/1.0',
        },
        body: tokenParams.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(\`Token exchange failed: \${response.status} \${response.statusText} - \${errorData}\`);
      }

      const tokenData{{#if typescript}}: OAuthTokenResponse{{/if}} = await response.json();

      // Cache the token
      if (tokenData.access_token && tokenData.expires_in) {
        this.tokenCache.set(tokenData.access_token, {
          token: tokenData.access_token,
          expires: Date.now() + (tokenData.expires_in * 1000),
        });
      }

      // Fetch user profile
      let user{{#if typescript}}: {{capitalize provider}}UserProfile | undefined{{/if}};
      if (tokenData.access_token) {
        try {
          user = await this.getUserProfile(tokenData.access_token);
        } catch (profileError) {
          console.warn('Failed to fetch user profile:', profileError);
        }
      }

      return { ...tokenData, user };

    } catch (error) {
      console.error('{{capitalize provider}} token exchange error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from {{providerConfig.displayName}}
   */
  async getUserProfile(accessToken{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<{{capitalize provider}}UserProfile>{{/if}} {
    try {
      {{#unless (eq provider "apple")}}
      const response = await fetch('{{providerConfig.userInfoUrl}}', {
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Accept': 'application/json',
          'User-Agent': '{{projectName}}/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(\`Failed to fetch user profile: \${response.status} \${response.statusText}\`);
      }

      const profile = await response.json();
      {{else}}
      // Apple provides user info in the ID token
      const profile = {}; // Extract from ID token
      {{/unless}}
      
      return this.normalizeUserProfile(profile);

    } catch (error) {
      console.error('{{capitalize provider}} profile fetch error:', error);
      throw error;
    }
  }

  {{#if includeRefresh}}
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<OAuthTokenResponse>{{/if}} {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch('{{providerConfig.tokenUrl}}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: tokenParams.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(\`Token refresh failed: \${response.status} \${response.statusText} - \${errorData}\`);
      }

      const tokenData{{#if typescript}}: OAuthTokenResponse{{/if}} = await response.json();

      // Update token cache
      if (tokenData.access_token && tokenData.expires_in) {
        this.tokenCache.set(tokenData.access_token, {
          token: tokenData.access_token,
          expires: Date.now() + (tokenData.expires_in * 1000),
        });
      }

      return tokenData;

    } catch (error) {
      console.error('{{capitalize provider}} token refresh error:', error);
      throw error;
    }
  }
  {{/if}}

  /**
   * Normalize user profile from {{providerConfig.displayName}} format
   */
  private normalizeUserProfile(profile{{#if typescript}}: any{{/if}}){{#if typescript}}: {{capitalize provider}}UserProfile{{/if}} {
    const normalized{{#if typescript}}: {{capitalize provider}}UserProfile{{/if}} = {
      id: '',
      provider: '{{provider}}',
      raw: profile,
    };

    {{#if (eq provider "google")}}
    normalized.id = profile.id || profile.sub;
    normalized.email = profile.email;
    normalized.name = profile.name;
    normalized.firstName = profile.given_name;
    normalized.lastName = profile.family_name;
    normalized.avatar = profile.picture;
    {{else if (eq provider "github")}}
    normalized.id = profile.id?.toString();
    normalized.email = profile.email;
    normalized.name = profile.name;
    normalized.username = profile.login;
    normalized.avatar = profile.avatar_url;
    {{else if (eq provider "microsoft")}}
    normalized.id = profile.id;
    normalized.email = profile.mail || profile.userPrincipalName;
    normalized.name = profile.displayName;
    normalized.firstName = profile.givenName;
    normalized.lastName = profile.surname;
    {{else if (eq provider "discord")}}
    normalized.id = profile.id;
    normalized.email = profile.email;
    normalized.username = profile.username;
    normalized.name = profile.global_name || profile.username;
    normalized.avatar = profile.avatar ? \`https://cdn.discordapp.com/avatars/\${profile.id}/\${profile.avatar}.png\` : null;
    {{else}}
    // Add normalization logic for {{provider}}
    normalized.id = profile.id?.toString() || '';
    normalized.email = profile.email;
    normalized.name = profile.name;
    {{/if}}

    return normalized;
  }

  /**
   * Revoke access token
   */
  async revokeToken(token{{#if typescript}}: string{{/if}}){{#if typescript}}: Promise<void>{{/if}} {
    try {
      // Remove from cache
      this.tokenCache.delete(token);
      
      {{#if (eq provider "google")}}
      await fetch(\`https://oauth2.googleapis.com/revoke?token=\${token}\`, {
        method: 'POST',
      });
      {{else if (eq provider "github")}}
      // GitHub doesn't have a revoke endpoint
      console.log('GitHub tokens expire automatically');
      {{else}}
      // Add revocation logic for {{provider}} if available
      {{/if}}

    } catch (error) {
      console.error('{{capitalize provider}} token revocation error:', error);
    }
  }

  /**
   * Check if token is valid
   */
  isTokenValid(token{{#if typescript}}: string{{/if}}){{#if typescript}}: boolean{{/if}} {
    const cached = this.tokenCache.get(token);
    if (!cached) return false;
    return Date.now() < cached.expires;
  }
}

// Export service instance
const {{provider}}Config{{#if typescript}}: {{capitalize provider}}Config{{/if}} = {
  clientId: process.env.{{uppercase provider}}_CLIENT_ID || '',
  clientSecret: process.env.{{uppercase provider}}_CLIENT_SECRET || '',
  redirectUri: process.env.{{uppercase provider}}_REDIRECT_URI || '',
  scopes: {{{json providerConfig.defaultScopes}}},
};

export const {{provider}}Auth = new {{capitalize provider}}AuthService({{provider}}Config);`;
}

function generateOAuthCallbackComponent(provider: OAuthProvider, options: AuthOptions): string {
  const { typescript = true, framework = 'react' } = options;

  return `import React, { useEffect, useState } from 'react';
${framework === 'nextjs' ? "import { useRouter } from 'next/router';" : "import { useNavigate } from 'react-router-dom';"}
${typescript ? `import type { ${provider.charAt(0).toUpperCase() + provider.slice(1)}UserProfile } from './${provider}.types';` : ''}

${typescript ? `
interface ${provider.charAt(0).toUpperCase() + provider.slice(1)}CallbackProps {
  onSuccess?: (user: ${provider.charAt(0).toUpperCase() + provider.slice(1)}UserProfile) => void;
  onError?: (error: Error) => void;
  successRedirectUrl?: string;
  errorRedirectUrl?: string;
  className?: string;
}

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  user: ${provider.charAt(0).toUpperCase() + provider.slice(1)}UserProfile | null;
  error: string | null;
}
` : ''}

export const ${provider.charAt(0).toUpperCase() + provider.slice(1)}Callback${typescript ? `: React.FC<${provider.charAt(0).toUpperCase() + provider.slice(1)}CallbackProps>` : ''} = ({
  onSuccess,
  onError,
  successRedirectUrl = '/dashboard',
  errorRedirectUrl = '/login',
  className = '',
}) => {
  const [state, setState] = useState${typescript ? '<CallbackState>' : ''}({
    status: 'loading',
    user: null,
    error: null,
  });

  ${framework === 'nextjs' ? 'const router = useRouter();' : 'const navigate = useNavigate();'}

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || \`OAuth error: \${error}\`);
        }

        if (!code) {
          throw new Error('Authorization code not found');
        }

        if (!state) {
          throw new Error('State parameter not found');
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('${provider}_auth_state');
        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Get stored parameters
        const storedRedirectUrl = sessionStorage.getItem('${provider}_redirect_url');
        const codeVerifier = sessionStorage.getItem('${provider}_code_verifier');
        
        // Exchange code for token
        const response = await fetch('/api/auth/${provider}/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri: storedRedirectUrl || window.location.origin + window.location.pathname,
            codeVerifier,
            state,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Token exchange failed');
        }

        const { user } = await response.json();
        
        setState({
          status: 'success',
          user,
          error: null,
        });

        onSuccess?.(user);

        // Clean up session storage
        sessionStorage.removeItem('${provider}_auth_state');
        sessionStorage.removeItem('${provider}_redirect_url');
        sessionStorage.removeItem('${provider}_code_verifier');

        // Redirect
        setTimeout(() => {
          ${framework === 'nextjs' ? 'router.push(successRedirectUrl);' : 'navigate(successRedirectUrl);'}
        }, 2000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        
        setState({
          status: 'error',
          user: null,
          error: errorMessage,
        });

        onError?.(new Error(errorMessage));

        // Clean up session storage
        sessionStorage.removeItem('${provider}_auth_state');
        sessionStorage.removeItem('${provider}_redirect_url');
        sessionStorage.removeItem('${provider}_code_verifier');

        setTimeout(() => {
          ${framework === 'nextjs' ? 'router.push(errorRedirectUrl);' : 'navigate(errorRedirectUrl);'}
        }, 3000);
      }
    };

    handleCallback();
  }, [onSuccess, onError, successRedirectUrl, errorRedirectUrl${framework === 'nextjs' ? ', router' : ', navigate'}]);

  if (state.status === 'loading') {
    return (
      <div className={\`${provider}-callback-loading \${className}\`}>
        <div>Processing ${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={\`${provider}-callback-error \${className}\`}>
        <h2>Authentication Failed</h2>
        <p>{state.error}</p>
        <button onClick={() => ${framework === 'nextjs' ? 'router.push(errorRedirectUrl)' : 'navigate(errorRedirectUrl)'}}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={\`${provider}-callback-success \${className}\`}>
      <h2>Authentication Successful!</h2>
      <p>Welcome{state.user?.name && \`, \${state.user.name}\`}!</p>
      <p>Redirecting...</p>
    </div>
  );
};`;
}

function generateOAuthTypes(provider: OAuthProvider): string {
  const providerConfig = OAuthProviderConfigs.getConfig(provider);
  return `export interface ${provider.charAt(0).toUpperCase() + provider.slice(1)}Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface ${provider.charAt(0).toUpperCase() + provider.slice(1)}UserProfile {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  provider: '${provider}';
  raw: any;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

export interface ${provider.charAt(0).toUpperCase() + provider.slice(1)}AuthOptions {
  redirectUrl: string;
  scopes: string[];
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}`;
}

function generateOAuthEnvConfig(provider: OAuthProvider, providerConfig: any): string {
  return `# ${providerConfig.displayName} OAuth Configuration
${provider.toUpperCase()}_CLIENT_ID=your_${provider}_client_id_here
${provider.toUpperCase()}_CLIENT_SECRET=your_${provider}_client_secret_here
${provider.toUpperCase()}_REDIRECT_URI=\${NEXT_PUBLIC_APP_URL}/auth/${provider}/callback

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default scopes (comma-separated)
${provider.toUpperCase()}_SCOPES=${providerConfig.defaultScopes.join(',')}`;
}

function getProviderIcon(provider: string): string {
  const icons = {
    google: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>`,
    github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>`,
    microsoft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
    </svg>`,
    discord: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
    </svg>`,
    // Add more provider icons as needed
  };
  
  return icons[provider] || `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
  </svg>`;
}

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "5.3.1", "content": "Create apps/cli/src/integrations/auth/oauth.ts", "status": "completed", "priority": "high"}, {"id": "5.3.2", "content": "Add OAuth provider configuration for Google, GitHub, Microsoft", "status": "completed", "priority": "high"}, {"id": "5.3.3", "content": "Add generateOAuthComponent(provider: string, options: AuthOptions): GenerationResult function", "status": "completed", "priority": "high"}, {"id": "5.3.4", "content": "Add generateOAuthService(provider: string, options: AuthOptions): GenerationResult function", "status": "completed", "priority": "high"}, {"id": "5.3.5", "content": "Create apps/cli/templates/integrations/auth/oauth-login.tsx.hbs template", "status": "in_progress", "priority": "high"}, {"id": "5.3.6", "content": "Create apps/cli/templates/integrations/auth/oauth-callback.tsx.hbs template", "status": "pending", "priority": "high"}, {"id": "5.3.7", "content": "Create apps/cli/templates/integrations/auth/oauth-service.ts.hbs template", "status": "pending", "priority": "high"}, {"id": "5.3.8", "content": "Add OAuth scope configuration and management", "status": "completed", "priority": "high"}, {"id": "5.3.9", "content": "Add OAuth token refresh handling", "status": "completed", "priority": "high"}, {"id": "5.3.10", "content": "Add OAuth user profile normalization", "status": "completed", "priority": "high"}]
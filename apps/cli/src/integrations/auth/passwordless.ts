/**
 * Passwordless Authentication Integration
 * Generates magic link and SMS-based authentication components and services
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

export interface AuthOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  methods?: ('magic-link' | 'sms')[];
  emailProvider?: 'sendgrid' | 'resend' | 'ses' | 'nodemailer';
  smsProvider?: 'twilio' | 'aws-sns' | 'vonage';
  tokenExpiry?: number;
  useSession?: boolean;
  sessionStorage?: 'cookie' | 'database' | 'redis';
}

export async function generatePasswordlessComponent(options: AuthOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      methods = ['magic-link', 'sms'],
      tokenExpiry = 15,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'components', 'auth');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const extension = typescript ? '.tsx' : '.jsx';

    // Generate main passwordless component
    const mainContent = `import React, { useState } from 'react';
${typescript ? "import type { PasswordlessUser } from './passwordless.types';" : ''}

${typescript ? `
interface PasswordlessAuthProps {
  onSuccess?: (user: PasswordlessUser) => void;
  onError?: (error: Error) => void;
  methods?: ('magic-link' | 'sms')[];
  className?: string;
}
` : ''}

export const PasswordlessAuth${typescript ? ': React.FC<PasswordlessAuthProps>' : ''} = ({
  onSuccess,
  onError,
  methods = ${JSON.stringify(methods)},
  className = '',
}) => {
  const [method, setMethod] = useState${typescript ? "<'magic-link' | 'sms' | null>" : ''}(null);
  const [step, setStep] = useState${typescript ? "<'input' | 'verify'>" : ''}('input');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e${typescript ? ': React.FormEvent' : ''}) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === 'input') {
        await fetch('/api/auth/passwordless/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, identifier }),
        });
        setStep('verify');
      } else {
        const response = await fetch('/api/auth/passwordless/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, identifier, code }),
        });
        
        if (response.ok) {
          const { user } = await response.json();
          onSuccess?.(user);
        } else {
          throw new Error('Invalid verification code');
        }
      }
    } catch (error) {
      onError?.(error ${typescript ? 'as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  if (!method) {
    return (
      <div className={\`passwordless-auth \${className}\`}>
        <h2>Sign in</h2>
        <div className="method-selection">
          ${methods.includes('magic-link') ? `
          <button onClick={() => setMethod('magic-link')}>
            📧 Continue with Email
          </button>
          ` : ''}
          ${methods.includes('sms') ? `
          <button onClick={() => setMethod('sms')}>
            📱 Continue with Phone
          </button>
          ` : ''}
        </div>
      </div>
    );
  }

  return (
    <div className={\`passwordless-auth \${className}\`}>
      <form onSubmit={handleSubmit}>
        {step === 'input' ? (
          <>
            <h2>{method === 'magic-link' ? 'Enter your email' : 'Enter your phone number'}</h2>
            <input
              type={method === 'magic-link' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={method === 'magic-link' ? 'your@email.com' : '+1234567890'}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : \`Send \${method === 'magic-link' ? 'Magic Link' : 'Code'}\`}
            </button>
          </>
        ) : (
          <>
            <h2>Enter verification code</h2>
            <p>We sent a code to {identifier}</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </>
        )}
        <button type="button" onClick={() => { setMethod(null); setStep('input'); }}>
          Back
        </button>
      </form>
    </div>
  );
};`;

    fs.writeFileSync(path.join(outputDir, `PasswordlessAuth${extension}`), mainContent, 'utf-8');
    result.files.push(path.join(outputDir, `PasswordlessAuth${extension}`));

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Passwordless component generation failed: ${error.message}`);
  }

  return result;
}

export async function generatePasswordlessService(options: AuthOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      typescript = true,
      emailProvider = 'resend',
      smsProvider = 'twilio',
      tokenExpiry = 15,
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'services', 'auth');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const serviceContent = `${typescript ? "import type { PasswordlessUser } from './passwordless.types';" : ''}
import crypto from 'crypto';

export class PasswordlessAuthService {
  private tokenStore${typescript ? ': Map<string, { identifier: string; method: string; expires: number }>' : ''} = new Map();

  /**
   * Generate and send magic link or SMS code
   */
  async sendChallenge(
    method${typescript ? ": 'magic-link' | 'sms'" : ''},
    identifier${typescript ? ': string' : ''}
  )${typescript ? ': Promise<{ success: boolean; token?: string }>' : ''} {
    const token = this.generateToken();
    const expires = Date.now() + (${tokenExpiry} * 60 * 1000);
    
    this.tokenStore.set(token, { identifier, method, expires });

    if (method === 'magic-link') {
      await this.sendMagicLink(identifier, token);
    } else {
      await this.sendSMSCode(identifier, token);
    }

    return { success: true, token };
  }

  /**
   * Verify challenge token or code
   */
  async verifyChallenge(
    method${typescript ? ": 'magic-link' | 'sms'" : ''},
    identifier${typescript ? ': string' : ''},
    code${typescript ? ': string' : ''}
  )${typescript ? ': Promise<{ success: boolean; user?: PasswordlessUser }>' : ''} {
    // Find valid token
    for (const [token, data] of this.tokenStore.entries()) {
      if (data.identifier === identifier && data.method === method && Date.now() < data.expires) {
        if (method === 'magic-link' && token === code) {
          this.tokenStore.delete(token);
          return {
            success: true,
            user: {
              id: this.generateUserId(identifier),
              email: method === 'magic-link' ? identifier : undefined,
              phone: method === 'sms' ? identifier : undefined,
              provider: 'passwordless',
            },
          };
        } else if (method === 'sms' && this.verifyCode(token, code)) {
          this.tokenStore.delete(token);
          return {
            success: true,
            user: {
              id: this.generateUserId(identifier),
              email: method === 'magic-link' ? identifier : undefined,
              phone: method === 'sms' ? identifier : undefined,
              provider: 'passwordless',
            },
          };
        }
      }
    }

    return { success: false };
  }

  private generateToken()${typescript ? ': string' : ''} {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateUserId(identifier${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 16);
  }

  private async sendMagicLink(email${typescript ? ': string' : ''}, token${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    ${emailProvider === 'resend' ? `
    // Resend implementation
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'auth@example.com',
      to: email,
      subject: 'Sign in to ${projectName}',
      html: \`<p>Click <a href="\${process.env.NEXT_PUBLIC_APP_URL}/auth/passwordless/verify?token=\${token}">here</a> to sign in.</p>\`,
    });
    ` : `
    // Email sending implementation for ${emailProvider}
    console.log('Magic link sent to:', email, 'Token:', token);
    `}
  }

  private async sendSMSCode(phone${typescript ? ': string' : ''}, token${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    const code = token.substring(0, 6).toUpperCase();
    
    ${smsProvider === 'twilio' ? `
    // Twilio implementation
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: \`Your ${projectName} verification code is: \${code}\`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    ` : `
    // SMS sending implementation for ${smsProvider}
    console.log('SMS code sent to:', phone, 'Code:', code);
    `}
  }

  private verifyCode(token${typescript ? ': string' : ''}, inputCode${typescript ? ': string' : ''})${typescript ? ': boolean' : ''} {
    const expectedCode = token.substring(0, 6).toUpperCase();
    return inputCode.toUpperCase() === expectedCode;
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens()${typescript ? ': void' : ''} {
    const now = Date.now();
    for (const [token, data] of this.tokenStore.entries()) {
      if (now >= data.expires) {
        this.tokenStore.delete(token);
      }
    }
  }
}

export const passwordlessAuth = new PasswordlessAuthService();`;

    const extension = typescript ? '.ts' : '.js';
    fs.writeFileSync(path.join(outputDir, `passwordless${extension}`), serviceContent, 'utf-8');
    result.files.push(path.join(outputDir, `passwordless${extension}`));

    if (typescript) {
      const typesContent = `export interface PasswordlessUser {
  id: string;
  email?: string;
  phone?: string;
  provider: 'passwordless';
}

export interface PasswordlessConfig {
  tokenExpiry: number;
  emailProvider: 'sendgrid' | 'resend' | 'ses' | 'nodemailer';
  smsProvider: 'twilio' | 'aws-sns' | 'vonage';
}`;

      fs.writeFileSync(path.join(outputDir, 'passwordless.types.ts'), typesContent, 'utf-8');
      result.files.push(path.join(outputDir, 'passwordless.types.ts'));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Passwordless service generation failed: ${error.message}`);
  }

  return result;
}
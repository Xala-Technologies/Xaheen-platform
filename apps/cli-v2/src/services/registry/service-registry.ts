/**
 * Service Registry Implementation
 * 
 * Central registry for managing service templates and definitions.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import type { IServiceRegistry, ServiceTemplate, ServiceType } from '../../types/index.js';
import { ServiceTemplateSchema } from '../../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ServiceRegistry implements IServiceRegistry {
  private templates: Map<string, ServiceTemplate> = new Map();
  private initialized = false;
  private templatesPath: string;

  constructor() {
    // Service templates are stored in src/services/templates/definitions
    this.templatesPath = path.join(__dirname, '../templates/definitions');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    consola.debug('Initializing service registry...');

    try {
      await this.loadServiceTemplates();
      this.initialized = true;
      consola.debug(`Service registry initialized with ${this.templates.size} templates`);
    } catch (error) {
      consola.error('Failed to initialize service registry:', error);
      throw new Error('Service registry initialization failed');
    }
  }

  async getTemplate(type: ServiceType | string, provider: string): Promise<ServiceTemplate | null> {
    const key = `${type}:${provider}`;
    return this.templates.get(key) || null;
  }

  async listTemplates(type?: ServiceType | string): Promise<ServiceTemplate[]> {
    const templates = Array.from(this.templates.values());
    
    if (type) {
      return templates.filter(t => t.type === type);
    }
    
    return templates;
  }

  async registerTemplate(template: ServiceTemplate): Promise<void> {
    // Validate template
    const result = ServiceTemplateSchema.safeParse(template);
    if (!result.success) {
      throw new Error(`Invalid template: ${result.error.message}`);
    }

    const key = `${template.type}:${template.provider}`;
    this.templates.set(key, template);
    
    consola.debug(`Registered template: ${key}`);
  }

  private async loadServiceTemplates(): Promise<void> {
    // Create templates directory if it doesn't exist
    await fs.ensureDir(this.templatesPath);

    // Load built-in templates
    await this.loadBuiltInTemplates();

    // Load custom templates from JSON files
    const files = await fs.readdir(this.templatesPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(this.templatesPath, file);
        const content = await fs.readJson(filePath);
        
        // Validate and register template
        const result = ServiceTemplateSchema.safeParse(content);
        if (result.success) {
          await this.registerTemplate(result.data);
        } else {
          consola.warn(`Invalid template in ${file}:`, result.error.message);
        }
      } catch (error) {
        consola.warn(`Failed to load template ${file}:`, error);
      }
    }
  }

  private async loadBuiltInTemplates(): Promise<void> {
    // Built-in templates for common services
    const builtInTemplates: ServiceTemplate[] = [
      // Authentication
      {
        name: 'better-auth',
        type: 'auth',
        provider: 'better-auth',
        version: '1.0.0',
        description: 'Modern authentication library for TypeScript',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/auth.ts',
            template: `import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: '{{database}}'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: {{config.requireEmailVerification}}
  },
  socialProviders: {
    {{#if config.providers.google}}
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    },
    {{/if}}
    {{#if config.providers.github}}
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }
    {{/if}}
  }
});

export type Auth = typeof auth;`,
            priority: 100
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "better-auth": "^1.0.0",
    "@better-auth/prisma-adapter": "^1.0.0"
  }
}`,
            priority: 90
          }
        ],
        envVariables: [
          {
            name: 'BETTER_AUTH_SECRET',
            description: 'Secret key for Better Auth',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'BETTER_AUTH_URL',
            description: 'URL for Better Auth',
            required: true,
            type: 'url',
            defaultValue: 'http://localhost:3000'
          }
        ],
        dependencies: [
          {
            serviceType: 'database',
            required: true
          }
        ],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Configure authentication providers in .env file'
          },
          {
            type: 'command',
            description: 'Generate Prisma schema for auth tables',
            command: 'npx prisma generate'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit'],
        databases: ['postgresql', 'mysql', 'sqlite'],
        platforms: ['web'],
        tags: ['authentication', 'security', 'user-management']
      },

      // Database - PostgreSQL
      {
        name: 'postgresql',
        type: 'database',
        provider: 'postgresql',
        version: '16.0.0',
        description: 'PostgreSQL database with Prisma ORM',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'prisma/schema.prisma',
            template: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
            priority: 90
          },
          {
            type: 'file-create',
            target: 'src/lib/prisma.ts',
            template: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;`,
            priority: 90
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}`,
            priority: 80
          }
        ],
        envVariables: [
          {
            name: 'DATABASE_URL',
            description: 'PostgreSQL connection string',
            required: true,
            type: 'url',
            sensitive: true,
            defaultValue: 'postgresql://user:password@localhost:5432/mydb'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'command',
            description: 'Install Prisma dependencies',
            command: 'npm install'
          },
          {
            type: 'command',
            description: 'Generate Prisma client',
            command: 'npx prisma generate'
          },
          {
            type: 'manual',
            description: 'Set up PostgreSQL database and update DATABASE_URL'
          }
        ],
        frameworks: [],
        databases: [],
        platforms: ['web', 'mobile', 'desktop'],
        tags: ['database', 'sql', 'orm', 'prisma']
      },

      // Payments - Stripe
      {
        name: 'stripe',
        type: 'payments',
        provider: 'stripe',
        version: '16.0.0',
        description: 'Stripe payment processing',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/stripe.ts',
            template: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true
});

export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: params.priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer: params.customerId
  });
}

export async function createCustomer(params: {
  email: string;
  name?: string;
}) {
  return stripe.customers.create({
    email: params.email,
    name: params.name
  });
}`,
            priority: 80
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "stripe": "^16.0.0"
  }
}`,
            priority: 75
          }
        ],
        envVariables: [
          {
            name: 'STRIPE_SECRET_KEY',
            description: 'Stripe secret key',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'STRIPE_PUBLISHABLE_KEY',
            description: 'Stripe publishable key',
            required: true,
            type: 'string'
          },
          {
            name: 'STRIPE_WEBHOOK_SECRET',
            description: 'Stripe webhook secret',
            required: false,
            type: 'secret',
            sensitive: true
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Set up Stripe account and add API keys to .env'
          },
          {
            type: 'manual',
            description: 'Configure Stripe webhooks for subscription events'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit'],
        databases: [],
        platforms: ['web'],
        tags: ['payments', 'billing', 'subscriptions', 'stripe']
      },

      // Email - Resend
      {
        name: 'resend',
        type: 'email',
        provider: 'resend',
        version: '3.0.0',
        description: 'Modern email API for developers',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/email.ts',
            template: `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.EMAIL_FROM || 'noreply@example.com'
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to {{name}}!',
    html: \`
      <h1>Welcome, \${name}!</h1>
      <p>Thanks for signing up. We're excited to have you on board.</p>
    \`
  });
}`,
            priority: 70,
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "resend": "^3.0.0"
  }
}`
          }
        ],
        envVariables: [
          {
            name: 'RESEND_API_KEY',
            description: 'Resend API key',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'EMAIL_FROM',
            description: 'Default from email address',
            required: false,
            type: 'string',
            defaultValue: 'noreply@example.com'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Sign up for Resend and get your API key'
          },
          {
            type: 'manual',
            description: 'Verify your domain in Resend dashboard'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express', 'hono'],
        databases: [],
        platforms: ['web'],
        tags: ['email', 'transactional', 'notifications']
      },

      // Analytics - PostHog
      {
        name: 'posthog',
        type: 'analytics',
        provider: 'posthog',
        version: '1.0.0',
        description: 'Open-source product analytics',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/analytics.ts',
            template: `import posthog from 'posthog-js';

let posthogClient: ReturnType<typeof posthog.init> | null = null;

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (posthogClient) return posthogClient;

  posthogClient = posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    }
  });

  return posthogClient;
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (!posthogClient) initAnalytics();
  posthogClient?.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (!posthogClient) initAnalytics();
  posthogClient?.identify(userId, properties);
}

export function resetUser() {
  if (!posthogClient) initAnalytics();
  posthogClient?.reset();
}`,
            priority: 60
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "posthog-js": "^1.0.0"
  }
}`
          }
        ],
        envVariables: [
          {
            name: 'NEXT_PUBLIC_POSTHOG_KEY',
            description: 'PostHog project API key',
            required: true,
            type: 'string',
            sensitive: false
          },
          {
            name: 'NEXT_PUBLIC_POSTHOG_HOST',
            description: 'PostHog API host',
            required: false,
            type: 'url',
            defaultValue: 'https://app.posthog.com'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Create a PostHog account and get your project API key'
          },
          {
            type: 'manual',
            description: 'Initialize analytics in your app entry point'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'react', 'vue'],
        databases: [],
        platforms: ['web'],
        tags: ['analytics', 'tracking', 'product-analytics']
      },

      // Monitoring - Sentry
      {
        name: 'sentry',
        type: 'monitoring',
        provider: 'sentry',
        version: '7.0.0',
        description: 'Error tracking and performance monitoring',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/monitoring.ts',
            template: `import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false
      })
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUser() {
  Sentry.setUser(null);
}`,
            priority: 50
          },
          {
            type: 'file-create',
            target: 'sentry.client.config.ts',
            template: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});`,
            priority: 50
          },
          {
            type: 'file-create',
            target: 'sentry.server.config.ts',
            template: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});`,
            priority: 50
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "@sentry/nextjs": "^7.0.0"
  }
}`
          }
        ],
        envVariables: [
          {
            name: 'SENTRY_DSN',
            description: 'Sentry Data Source Name',
            required: true,
            type: 'url',
            sensitive: true
          },
          {
            name: 'SENTRY_ORG',
            description: 'Sentry organization slug',
            required: false,
            type: 'string'
          },
          {
            name: 'SENTRY_PROJECT',
            description: 'Sentry project slug',
            required: false,
            type: 'string'
          },
          {
            name: 'SENTRY_AUTH_TOKEN',
            description: 'Sentry authentication token for source maps',
            required: false,
            type: 'secret',
            sensitive: true
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Create a Sentry account and project'
          },
          {
            type: 'manual',
            description: 'Configure Sentry in your next.config.js'
          },
          {
            type: 'command',
            description: 'Install Sentry wizard',
            command: 'npx @sentry/wizard@latest -i nextjs'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit'],
        databases: [],
        platforms: ['web'],
        tags: ['monitoring', 'error-tracking', 'performance', 'observability']
      },

      // Cache - Redis
      {
        name: 'redis',
        type: 'cache',
        provider: 'redis',
        version: '4.0.0',
        description: 'In-memory data structure store',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/cache.ts',
            template: `import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  
  await redisClient.connect();
  
  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(
  key: string, 
  value: any, 
  expirationSeconds?: number
): Promise<void> {
  try {
    const client = await getRedisClient();
    const stringValue = JSON.stringify(value);
    
    if (expirationSeconds) {
      await client.setEx(key, expirationSeconds, stringValue);
    } else {
      await client.set(key, stringValue);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function cacheFlush(): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.flushAll();
  } catch (error) {
    console.error('Cache flush error:', error);
  }
}`,
            priority: 85
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
            priority: 70,
  "dependencies": {
    "redis": "^4.0.0"
  }
}`
          }
        ],
        envVariables: [
          {
            name: 'REDIS_URL',
            description: 'Redis connection URL',
            required: true,
            type: 'url',
            sensitive: true,
            defaultValue: 'redis://localhost:6379'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Set up Redis server locally or use a cloud service'
          },
          {
            type: 'manual',
            description: 'Update REDIS_URL with your connection string'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express', 'hono'],
        databases: [],
        platforms: ['web'],
        tags: ['cache', 'redis', 'performance', 'session-store']
      },

      // Storage - AWS S3
      {
        name: 'aws-s3',
        type: 'storage',
        provider: 's3',
        version: '3.0.0',
        description: 'AWS S3 object storage',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/storage.ts',
            template: `import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType
  });

  return s3Client.send(command);
}

export async function getFile(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return s3Client.send(command);
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return s3Client.send(command);
}

export async function getSignedUploadUrl(
  key: string,
  expiresIn: number = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}`,
            priority: 75
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0"
  }
}`,
            priority: 70
          }
        ],
        envVariables: [
          {
            name: 'AWS_ACCESS_KEY_ID',
            description: 'AWS Access Key ID',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'AWS_SECRET_ACCESS_KEY',
            description: 'AWS Secret Access Key',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'AWS_REGION',
            description: 'AWS Region',
            required: false,
            type: 'string',
            defaultValue: 'us-east-1'
          },
          {
            name: 'S3_BUCKET_NAME',
            description: 'S3 Bucket Name',
            required: true,
            type: 'string'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Create an S3 bucket in AWS Console'
          },
          {
            type: 'manual',
            description: 'Create IAM user with S3 access and get credentials'
          },
          {
            type: 'manual',
            description: 'Configure CORS settings for your S3 bucket if needed'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express', 'hono'],
        databases: [],
        platforms: ['web'],
        tags: ['storage', 's3', 'aws', 'files', 'uploads']
      },

      // Storage - Cloudinary
      {
        name: 'cloudinary',
        type: 'storage',
        provider: 'cloudinary',
        version: '2.0.0',
        description: 'Cloudinary image and video management',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/cloudinary.ts',
            template: `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(
  filePath: string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: any[];
  }
) {
  return cloudinary.uploader.upload(filePath, {
    folder: options?.folder || 'uploads',
    public_id: options?.publicId,
    transformation: options?.transformation
  });
}

export async function uploadVideo(
  filePath: string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: any[];
  }
) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    folder: options?.folder || 'videos',
    public_id: options?.publicId,
    transformation: options?.transformation
  });
}

export async function deleteAsset(publicId: string, resourceType: 'image' | 'video' = 'image') {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: string | 'auto';
    crop?: string;
  }
) {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    quality: options?.quality || 'auto',
    format: options?.format || 'auto',
    crop: options?.crop || 'limit',
    secure: true
  });
}

export function getVideoThumbnail(publicId: string, options?: any) {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { width: options?.width || 400, crop: 'limit' },
      { start_offset: options?.offset || '0' }
    ]
  });
}`,
            priority: 75
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "cloudinary": "^2.0.0"
  }
}`,
            priority: 70
          }
        ],
        envVariables: [
          {
            name: 'CLOUDINARY_CLOUD_NAME',
            description: 'Cloudinary Cloud Name',
            required: true,
            type: 'string'
          },
          {
            name: 'CLOUDINARY_API_KEY',
            description: 'Cloudinary API Key',
            required: true,
            type: 'string'
          },
          {
            name: 'CLOUDINARY_API_SECRET',
            description: 'Cloudinary API Secret',
            required: true,
            type: 'secret',
            sensitive: true
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Sign up for Cloudinary and get your credentials'
          },
          {
            type: 'manual',
            description: 'Configure upload presets in Cloudinary dashboard'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express', 'hono'],
        databases: [],
        platforms: ['web'],
        tags: ['storage', 'cloudinary', 'images', 'video', 'media']
      },

      // Queue - BullMQ
      {
        name: 'bullmq',
        type: 'queue',
        provider: 'bullmq',
        version: '5.0.0',
        description: 'BullMQ job queue with Redis backend',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/queue.ts',
            template: `import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Define queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  IMAGE_PROCESSING: 'image-processing',
  DATA_IMPORT: 'data-import',
  NOTIFICATIONS: 'notifications'
} as const;

// Create queues
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });
export const imageQueue = new Queue(QUEUE_NAMES.IMAGE_PROCESSING, { connection });
export const dataQueue = new Queue(QUEUE_NAMES.DATA_IMPORT, { connection });
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, { connection });

// Queue events for monitoring
export const emailQueueEvents = new QueueEvents(QUEUE_NAMES.EMAIL, { connection });
export const imageQueueEvents = new QueueEvents(QUEUE_NAMES.IMAGE_PROCESSING, { connection });

// Helper function to add job with defaults
export async function addJob<T>(
  queue: Queue,
  name: string,
  data: T,
  options?: {
    delay?: number;
    attempts?: number;
    backoff?: { type: 'exponential' | 'fixed'; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  }
) {
  return queue.add(name, data, {
    attempts: options?.attempts || 3,
    backoff: options?.backoff || { type: 'exponential', delay: 2000 },
    removeOnComplete: options?.removeOnComplete ?? 100,
    removeOnFail: options?.removeOnFail ?? 50,
    delay: options?.delay
  });
}

// Get queue metrics
export async function getQueueMetrics(queue: Queue) {
  const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
    queue.getPausedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + delayed + paused
  };
}

// Clean old jobs
export async function cleanQueue(queue: Queue, grace: number = 3600000) {
  await queue.clean(grace, 100, 'completed');
  await queue.clean(grace, 100, 'failed');
}`,
            priority: 80
          },
          {
            type: 'file-create',
            target: 'src/workers/email.worker.ts',
            template: `import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { QUEUE_NAMES } from '../lib/queue.js';
// Import your email service
// import { sendEmail } from '../lib/email.js';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job: Job) => {
    const { to, subject, html, text } = job.data;
    
    console.log(\`Processing email job \${job.id}: \${subject} to \${to}\`);
    
    // Send email using your email service
    // await sendEmail({ to, subject, html, text });
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { sent: true, timestamp: new Date() };
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000 // Max 10 jobs per second
    }
  }
);

emailWorker.on('completed', (job) => {
  console.log(\`Email job \${job.id} completed\`);
});

emailWorker.on('failed', (job, err) => {
  console.error(\`Email job \${job?.id} failed:\`, err);
});

console.log('Email worker started');`,
            priority: 75
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0"
  },
  "scripts": {
    "worker:email": "tsx src/workers/email.worker.ts",
    "workers": "concurrently \\"npm:worker:*\\""
  }
}`,
            priority: 70
          }
        ],
        envVariables: [
          {
            name: 'REDIS_URL',
            description: 'Redis connection URL for BullMQ',
            required: true,
            type: 'url',
            sensitive: true,
            defaultValue: 'redis://localhost:6379'
          }
        ],
        dependencies: [
          {
            serviceType: 'cache',
            provider: 'redis',
            required: true
          }
        ],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Ensure Redis is running for BullMQ'
          },
          {
            type: 'manual',
            description: 'Create additional workers for other queues as needed'
          },
          {
            type: 'command',
            description: 'Install concurrently for running multiple workers',
            command: 'npm install -D concurrently'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express', 'hono'],
        databases: [],
        platforms: ['web'],
        tags: ['queue', 'jobs', 'background', 'bullmq', 'redis']
      },

      // Realtime - Socket.io
      {
        name: 'socket.io',
        type: 'realtime',
        provider: 'socket.io',
        version: '4.0.0',
        description: 'Socket.io for real-time bidirectional communication',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/socket-server.ts',
            template: `import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Server as HTTPServer } from 'http';
import type { Express } from 'express';

let io: Server | null = null;

export function initializeSocketServer(
  app?: Express,
  httpServer?: HTTPServer
) {
  const server = httpServer || createServer(app);
  
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(\`Client connected: \${socket.id}\`);

    // Join user to their personal room
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(\`Socket \${socket.id} joined room \${roomId}\`);
    });

    // Leave room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(\`Socket \${socket.id} left room \${roomId}\`);
    });

    // Handle messages
    socket.on('message', async (data: {
      room: string;
      message: string;
      userId: string;
    }) => {
      // Broadcast to room
      io?.to(data.room).emit('new-message', {
        id: Date.now().toString(),
        message: data.message,
        userId: data.userId,
        timestamp: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing', (data: { room: string; userId: string }) => {
      socket.to(data.room).emit('user-typing', {
        userId: data.userId,
        typing: true
      });
    });

    socket.on('stop-typing', (data: { room: string; userId: string }) => {
      socket.to(data.room).emit('user-typing', {
        userId: data.userId,
        typing: false
      });
    });

    // Handle presence
    socket.on('user-online', (userId: string) => {
      socket.broadcast.emit('user-status', {
        userId,
        status: 'online'
      });
    });

    socket.on('disconnect', () => {
      console.log(\`Client disconnected: \${socket.id}\`);
    });
  });

  return { server, io };
}

// Helper functions for server-side emissions
export function emitToRoom(room: string, event: string, data: any) {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  io.to(room).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  io.to(\`user:\${userId}\`).emit(event, data);
}

export function broadcastToAll(event: string, data: any) {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  io.emit(event, data);
}

export { io };`,
            priority: 85
          },
          {
            type: 'file-create',
            target: 'src/lib/socket-client.ts',
            template: `import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(userId?: string) {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    transports: ['websocket', 'polling'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
    
    if (userId) {
      socket?.emit('user-online', userId);
      socket?.emit('join-room', \`user:\${userId}\`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function joinRoom(roomId: string) {
  if (!socket?.connected) {
    console.error('Socket not connected');
    return;
  }
  socket.emit('join-room', roomId);
}

export function leaveRoom(roomId: string) {
  if (!socket?.connected) {
    console.error('Socket not connected');
    return;
  }
  socket.emit('leave-room', roomId);
}

export function sendMessage(room: string, message: string, userId: string) {
  if (!socket?.connected) {
    console.error('Socket not connected');
    return;
  }
  socket.emit('message', { room, message, userId });
}

export function startTyping(room: string, userId: string) {
  if (!socket?.connected) return;
  socket.emit('typing', { room, userId });
}

export function stopTyping(room: string, userId: string) {
  if (!socket?.connected) return;
  socket.emit('stop-typing', { room, userId });
}

export function onMessage(callback: (data: any) => void) {
  if (!socket) return;
  socket.on('new-message', callback);
}

export function onUserTyping(callback: (data: any) => void) {
  if (!socket) return;
  socket.on('user-typing', callback);
}

export function onUserStatus(callback: (data: any) => void) {
  if (!socket) return;
  socket.on('user-status', callback);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export { socket };`,
            priority: 80
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "socket.io": "^4.0.0",
    "socket.io-client": "^4.0.0"
  }
}`,
            priority: 70
          }
        ],
        envVariables: [
          {
            name: 'SOCKET_PORT',
            description: 'Port for Socket.io server',
            required: false,
            type: 'number',
            defaultValue: '3001'
          },
          {
            name: 'CLIENT_URL',
            description: 'Client URL for CORS',
            required: false,
            type: 'url',
            defaultValue: 'http://localhost:3000'
          },
          {
            name: 'NEXT_PUBLIC_SOCKET_URL',
            description: 'Socket server URL for client',
            required: true,
            type: 'url',
            defaultValue: 'http://localhost:3001'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Set up Socket.io server (standalone or with your HTTP server)'
          },
          {
            type: 'manual',
            description: 'Configure authentication middleware for Socket.io'
          },
          {
            type: 'manual',
            description: 'Implement room-based logic for your use case'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit', 'express'],
        databases: [],
        platforms: ['web'],
        tags: ['realtime', 'websocket', 'socket.io', 'chat', 'notifications']
      },

      // Realtime - Pusher
      {
        name: 'pusher',
        type: 'realtime',
        provider: 'pusher',
        version: '5.0.0',
        description: 'Pusher Channels for real-time features',
        injectionPoints: [
          {
            type: 'file-create',
            target: 'src/lib/pusher-server.ts',
            template: `import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
});

// Trigger an event to a channel
export async function triggerEvent(
  channel: string,
  event: string,
  data: any
) {
  return pusherServer.trigger(channel, event, data);
}

// Trigger to multiple channels
export async function triggerBatch(
  channels: string[],
  event: string,
  data: any
) {
  return pusherServer.trigger(channels, event, data);
}

// Trigger to a private channel
export async function triggerPrivate(
  userId: string,
  event: string,
  data: any
) {
  return pusherServer.trigger(\`private-user-\${userId}\`, event, data);
}

// Trigger to a presence channel
export async function triggerPresence(
  channelName: string,
  event: string,
  data: any
) {
  return pusherServer.trigger(\`presence-\${channelName}\`, event, data);
}

// Authenticate private/presence channels
export function authenticateChannel(
  socketId: string,
  channel: string,
  presenceData?: {
    user_id: string;
    user_info?: Record<string, any>;
  }
) {
  if (channel.startsWith('presence-') && presenceData) {
    return pusherServer.authorizeChannel(socketId, channel, presenceData);
  }
  
  return pusherServer.authorizeChannel(socketId, channel);
}

// Get channel info
export async function getChannelInfo(channel: string) {
  return pusherServer.get({
    path: \`/channels/\${channel}\`,
    params: { info: 'subscription_count,user_count' }
  });
}

// Get all channels
export async function getChannels() {
  return pusherServer.get({
    path: '/channels',
    params: {}
  });
}`,
            priority: 85
          },
          {
            type: 'file-create',
            target: 'src/lib/pusher-client.ts',
            template: `import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export function initializePusher(userId?: string) {
  if (pusherClient) {
    return pusherClient;
  }

  pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    auth: {
      params: { user_id: userId }
    }
  });

  // Enable logging in development
  if (process.env.NODE_ENV === 'development') {
    Pusher.logToConsole = true;
  }

  return pusherClient;
}

export function subscribeToChannel(channelName: string) {
  if (!pusherClient) {
    throw new Error('Pusher not initialized');
  }
  
  return pusherClient.subscribe(channelName);
}

export function subscribeToPrivateChannel(channelName: string) {
  if (!pusherClient) {
    throw new Error('Pusher not initialized');
  }
  
  return pusherClient.subscribe(\`private-\${channelName}\`);
}

export function subscribeToPresenceChannel(channelName: string) {
  if (!pusherClient) {
    throw new Error('Pusher not initialized');
  }
  
  return pusherClient.subscribe(\`presence-\${channelName}\`);
}

export function unsubscribe(channelName: string) {
  if (!pusherClient) return;
  
  pusherClient.unsubscribe(channelName);
}

export function bind(channel: any, event: string, callback: (data: any) => void) {
  channel.bind(event, callback);
}

export function unbind(channel: any, event: string, callback?: (data: any) => void) {
  if (callback) {
    channel.unbind(event, callback);
  } else {
    channel.unbind(event);
  }
}

export function disconnect() {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}

// Hook for React
export function usePusherEvent(
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) {
  if (typeof window === 'undefined') return;
  
  const channel = subscribeToChannel(channelName);
  
  // Subscribe to event
  bind(channel, eventName, callback);
  
  // Cleanup
  return () => {
    unbind(channel, eventName, callback);
    unsubscribe(channelName);
  };
}

export { pusherClient };`,
            priority: 80
          },
          {
            type: 'json-merge',
            target: 'package.json',
            template: `{
  "dependencies": {
    "pusher": "^5.0.0",
    "pusher-js": "^8.0.0"
  }
}`,
            priority: 70
          }
        ],
        envVariables: [
          {
            name: 'PUSHER_APP_ID',
            description: 'Pusher App ID',
            required: true,
            type: 'string'
          },
          {
            name: 'PUSHER_SECRET',
            description: 'Pusher Secret',
            required: true,
            type: 'secret',
            sensitive: true
          },
          {
            name: 'NEXT_PUBLIC_PUSHER_KEY',
            description: 'Pusher Key (public)',
            required: true,
            type: 'string'
          },
          {
            name: 'NEXT_PUBLIC_PUSHER_CLUSTER',
            description: 'Pusher Cluster',
            required: true,
            type: 'string',
            defaultValue: 'eu'
          }
        ],
        dependencies: [],
        postInjectionSteps: [
          {
            type: 'manual',
            description: 'Create Pusher account and app at pusher.com'
          },
          {
            type: 'manual',
            description: 'Create API endpoint for channel authentication (/api/pusher/auth)'
          },
          {
            type: 'manual',
            description: 'Implement presence channel logic if needed'
          }
        ],
        frameworks: ['next', 'remix', 'nuxt', 'sveltekit'],
        databases: [],
        platforms: ['web'],
        tags: ['realtime', 'pusher', 'websocket', 'channels', 'presence']
      }
    ];

    // Register built-in templates
    for (const template of builtInTemplates) {
      await this.registerTemplate(template);
    }
  }
}
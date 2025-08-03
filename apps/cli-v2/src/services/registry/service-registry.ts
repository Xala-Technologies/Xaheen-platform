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
}`
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
}`
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
  "dependencies": {
    "stripe": "^16.0.0"
  }
}`
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
      }
    ];

    // Register built-in templates
    for (const template of builtInTemplates) {
      await this.registerTemplate(template);
    }
  }
}
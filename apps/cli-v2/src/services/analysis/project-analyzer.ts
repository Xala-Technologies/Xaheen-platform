/**
 * Project Analyzer Service
 * 
 * Analyzes existing projects to detect framework, services,
 * and configuration for intelligent service addition.
 * 
 * @author DevOps Expert Agent
 * @since 2025-01-03
 */

import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'node:path';

export interface ProjectInfo {
  isValid: boolean;
  name: string;
  framework?: string;
  backend?: string;
  database?: string;
  platform?: string;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  typescript: boolean;
  services: string[];
  features?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export class ProjectAnalyzer {
  async analyzeProject(projectPath: string): Promise<ProjectInfo> {
    try {
      // Check if directory exists
      if (!(await fs.pathExists(projectPath))) {
        return this.invalidProject();
      }

      // Check for package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        return this.invalidProject();
      }

      const packageJson = await fs.readJson(packageJsonPath);
      
      // Basic project info
      const projectInfo: ProjectInfo = {
        isValid: true,
        name: packageJson.name || path.basename(projectPath),
        typescript: await this.detectTypeScript(projectPath),
        services: [],
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {}
      };

      // Detect package manager
      projectInfo.packageManager = await this.detectPackageManager(projectPath);

      // Detect framework
      projectInfo.framework = await this.detectFramework(projectInfo);

      // Detect backend
      projectInfo.backend = await this.detectBackend(projectInfo);

      // Detect database
      projectInfo.database = await this.detectDatabase(projectInfo);

      // Detect existing services
      projectInfo.services = await this.detectServices(projectPath, projectInfo);

      // Detect platform
      projectInfo.platform = await this.detectPlatform(projectInfo);

      return projectInfo;

    } catch (error) {
      consola.debug('Project analysis error:', error);
      return this.invalidProject();
    }
  }

  private invalidProject(): ProjectInfo {
    return {
      isValid: false,
      name: '',
      typescript: false,
      services: []
    };
  }

  private async detectTypeScript(projectPath: string): Promise<boolean> {
    return fs.pathExists(path.join(projectPath, 'tsconfig.json'));
  }

  private async detectPackageManager(projectPath: string): Promise<'npm' | 'pnpm' | 'yarn' | 'bun'> {
    if (await fs.pathExists(path.join(projectPath, 'bun.lockb'))) return 'bun';
    if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) return 'yarn';
    if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
    return 'npm';
  }

  private async detectFramework(projectInfo: ProjectInfo): Promise<string | undefined> {
    const deps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };

    // Next.js
    if (deps['next']) return 'next';
    
    // Nuxt
    if (deps['nuxt'] || deps['@nuxt/kit']) return 'nuxt';
    
    // Remix
    if (deps['@remix-run/react'] || deps['@remix-run/node']) return 'remix';
    
    // SvelteKit
    if (deps['@sveltejs/kit']) return 'sveltekit';
    
    // SolidStart
    if (deps['solid-start'] || deps['@solidjs/start']) return 'solid-start';
    
    // Qwik City
    if (deps['@builder.io/qwik-city']) return 'qwik-city';
    
    // Angular
    if (deps['@angular/core']) return 'angular';
    
    // React (without framework)
    if (deps['react'] && !deps['next'] && !deps['@remix-run/react']) return 'react';
    
    // Vue (without framework)
    if (deps['vue'] && !deps['nuxt']) return 'vue';
    
    // Svelte (without framework)
    if (deps['svelte'] && !deps['@sveltejs/kit']) return 'svelte';

    return undefined;
  }

  private async detectBackend(projectInfo: ProjectInfo): Promise<string | undefined> {
    const deps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };

    // Hono
    if (deps['hono']) return 'hono';
    
    // Express
    if (deps['express']) return 'express';
    
    // Fastify
    if (deps['fastify']) return 'fastify';
    
    // NestJS
    if (deps['@nestjs/core']) return 'nest';
    
    // AdonisJS
    if (deps['@adonisjs/core']) return 'adonis';
    
    // Next.js API routes (if Next.js is detected)
    if (projectInfo.framework === 'next') {
      const apiDir = path.join(process.cwd(), 'pages/api');
      const appApiDir = path.join(process.cwd(), 'app/api');
      if (await fs.pathExists(apiDir) || await fs.pathExists(appApiDir)) {
        return 'next-api';
      }
    }
    
    // Nuxt server routes
    if (projectInfo.framework === 'nuxt') {
      const serverDir = path.join(process.cwd(), 'server');
      if (await fs.pathExists(serverDir)) {
        return 'nuxt-api';
      }
    }

    return undefined;
  }

  private async detectDatabase(projectInfo: ProjectInfo): Promise<string | undefined> {
    const deps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };

    // Check for ORMs first
    if (deps['@prisma/client'] || deps['prisma']) {
      // Check Prisma schema for provider
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      if (await fs.pathExists(schemaPath)) {
        const schema = await fs.readFile(schemaPath, 'utf-8');
        if (schema.includes('provider = "postgresql"')) return 'postgresql';
        if (schema.includes('provider = "mysql"')) return 'mysql';
        if (schema.includes('provider = "sqlite"')) return 'sqlite';
        if (schema.includes('provider = "mongodb"')) return 'mongodb';
      }
    }

    // Direct database clients
    if (deps['pg'] || deps['postgres']) return 'postgresql';
    if (deps['mysql'] || deps['mysql2']) return 'mysql';
    if (deps['sqlite3'] || deps['better-sqlite3']) return 'sqlite';
    if (deps['mongodb']) return 'mongodb';
    if (deps['redis'] || deps['ioredis']) return 'redis';
    
    // Database services
    if (deps['@supabase/supabase-js']) return 'supabase';
    if (deps['@planetscale/database']) return 'planetscale';
    if (deps['@neondatabase/serverless']) return 'neon';

    return undefined;
  }

  private async detectServices(projectPath: string, projectInfo: ProjectInfo): Promise<string[]> {
    const services: string[] = [];
    const deps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };

    // Auth
    if (deps['better-auth'] || deps['@clerk/nextjs'] || deps['@auth/core'] || 
        deps['next-auth'] || deps['@supabase/auth-helpers-nextjs']) {
      services.push('auth');
    }

    // Database (already detected)
    if (projectInfo.database) {
      services.push('database');
    }

    // Payments
    if (deps['stripe'] || deps['@stripe/stripe-js']) {
      services.push('payments');
    }

    // Email
    if (deps['@sendgrid/mail'] || deps['resend'] || deps['nodemailer'] || 
        deps['@react-email/components']) {
      services.push('email');
    }

    // SMS
    if (deps['twilio']) {
      services.push('sms');
    }

    // Storage
    if (deps['@aws-sdk/client-s3'] || deps['@uploadthing/react'] || 
        deps['@vercel/blob'] || deps['cloudinary']) {
      services.push('storage');
    }

    // Cache
    if (deps['redis'] || deps['ioredis'] || deps['@upstash/redis']) {
      services.push('cache');
    }

    // Queue
    if (deps['bull'] || deps['bullmq'] || deps['bee-queue']) {
      services.push('queue');
    }

    // Search
    if (deps['@algolia/client-search'] || deps['@elastic/elasticsearch'] || 
        deps['meilisearch']) {
      services.push('search');
    }

    // Analytics
    if (deps['@vercel/analytics'] || deps['posthog-js'] || deps['mixpanel-browser']) {
      services.push('analytics');
    }

    // Monitoring
    if (deps['@sentry/nextjs'] || deps['@sentry/node']) {
      services.push('monitoring');
    }

    // Real-time
    if (deps['pusher-js'] || deps['socket.io-client'] || deps['@supabase/realtime-js']) {
      services.push('realtime');
    }

    // AI
    if (deps['openai'] || deps['@anthropic-ai/sdk'] || deps['@google/generative-ai']) {
      services.push('ai');
    }

    // CMS
    if (deps['@sanity/client'] || deps['contentful'] || deps['@strapi/strapi']) {
      services.push('cms');
    }

    // i18n
    if (deps['next-i18next'] || deps['react-i18next'] || deps['vue-i18n']) {
      services.push('i18n');
    }

    return services;
  }

  private async detectPlatform(projectInfo: ProjectInfo): Promise<string> {
    const deps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };

    // React Native
    if (deps['react-native']) return 'mobile';
    
    // Electron
    if (deps['electron']) return 'desktop';
    
    // Tauri
    if (deps['@tauri-apps/api']) return 'desktop';

    // Default to web
    return 'web';
  }
}
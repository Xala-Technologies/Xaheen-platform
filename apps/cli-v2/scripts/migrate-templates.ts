#!/usr/bin/env bun

/**
 * Template Migration Script
 * 
 * Migrates templates from the existing CLI to CLI v2's new template system.
 * This script analyzes, copies, and adapts templates while maintaining structure.
 * 
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import fs from 'fs-extra';
import path from 'node:path';
import { glob } from 'glob';
import { consola } from 'consola';

interface TemplateMigrationConfig {
  sourceDir: string;
  targetDir: string;
  dryRun: boolean;
  verbose: boolean;
}

interface TemplateMapping {
  sourcePath: string;
  targetPath: string;
  category: string;
  type: 'file' | 'component' | 'config';
  framework?: string;
  provider?: string;
}

class TemplateMigrator {
  private config: TemplateMigrationConfig;
  private mappings: TemplateMapping[] = [];

  constructor(config: TemplateMigrationConfig) {
    this.config = config;
  }

  async migrate() {
    consola.start('Starting template migration...');

    // Analyze existing templates
    await this.analyzeTemplates();

    // Create mappings
    await this.createMappings();

    // Migrate templates
    if (!this.config.dryRun) {
      await this.copyTemplates();
    }

    // Generate template registry entries
    await this.generateRegistryEntries();

    consola.success(`Migration completed! ${this.mappings.length} templates processed.`);
  }

  private async analyzeTemplates() {
    consola.info('Analyzing existing templates...');

    const templateFiles = await glob('**/*.hbs', {
      cwd: this.config.sourceDir,
      ignore: ['node_modules/**', 'dist/**']
    });

    consola.info(`Found ${templateFiles.length} template files`);

    if (this.config.verbose) {
      templateFiles.forEach(file => consola.log(`  - ${file}`));
    }
  }

  private async createMappings() {
    consola.info('Creating template mappings...');

    const categories = [
      'frontend',
      'backend', 
      'database',
      'auth',
      'api',
      'deployment',
      'components',
      'examples',
      'integrations',
      'localization'
    ];

    for (const category of categories) {
      await this.mapCategory(category);
    }

    consola.info(`Created ${this.mappings.length} template mappings`);
  }

  private async mapCategory(category: string) {
    const categoryPath = path.join(this.config.sourceDir, category);
    
    if (!(await fs.pathExists(categoryPath))) {
      return;
    }

    const files = await glob('**/*.hbs', { cwd: categoryPath });
    
    for (const file of files) {
      const mapping = this.createMapping(category, file);
      if (mapping) {
        this.mappings.push(mapping);
      }
    }
  }

  private createMapping(category: string, filePath: string): TemplateMapping | null {
    const sourcePath = path.join(this.config.sourceDir, category, filePath);
    
    // Determine target category and type
    const { targetCategory, type, framework, provider } = this.analyzeFilePath(category, filePath);
    
    if (!targetCategory) {
      return null;
    }

    const targetPath = this.generateTargetPath(targetCategory, type, filePath, framework, provider);

    return {
      sourcePath,
      targetPath,
      category: targetCategory,
      type,
      framework,
      provider
    };
  }

  private analyzeFilePath(category: string, filePath: string) {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    
    let targetCategory = category;
    let type: 'file' | 'component' | 'config' = 'file';
    let framework: string | undefined;
    let provider: string | undefined;

    // Map old categories to new structure
    switch (category) {
      case 'frontend':
        if (parts.includes('react')) framework = 'react';
        if (parts.includes('next')) framework = 'next';
        if (parts.includes('nuxt')) framework = 'nuxt';
        if (parts.includes('svelte')) framework = 'svelte';
        if (parts.includes('solid')) framework = 'solid';
        if (parts.includes('angular')) framework = 'angular';
        if (parts.includes('vue')) framework = 'vue';
        break;

      case 'backend':
        targetCategory = 'backend';
        if (parts.includes('express')) provider = 'express';
        if (parts.includes('fastify')) provider = 'fastify';
        if (parts.includes('next')) provider = 'next';
        if (parts.includes('django')) provider = 'django';
        if (parts.includes('laravel')) provider = 'laravel';
        if (parts.includes('dotnet')) provider = 'dotnet';
        break;

      case 'db':
        targetCategory = 'database';
        if (parts.includes('prisma')) provider = 'prisma';
        if (parts.includes('drizzle')) provider = 'drizzle';
        if (parts.includes('mongoose')) provider = 'mongoose';
        break;

      case 'api':
        targetCategory = 'api';
        if (parts.includes('trpc')) provider = 'trpc';
        if (parts.includes('orpc')) provider = 'orpc';
        if (parts.includes('graphql')) provider = 'graphql';
        break;

      case 'auth':
        targetCategory = 'auth';
        if (parts.includes('nextauth')) provider = 'nextauth';
        if (parts.includes('clerk')) provider = 'clerk';
        if (parts.includes('better-auth')) provider = 'better-auth';
        break;

      case 'deploy':
      case 'deployment':
        targetCategory = 'deployment';
        if (parts.includes('docker')) provider = 'docker';
        if (parts.includes('vercel')) provider = 'vercel';
        if (parts.includes('netlify')) provider = 'netlify';
        break;
    }

    // Determine file type
    if (fileName.includes('component') || fileName.includes('.tsx') || fileName.includes('.vue')) {
      type = 'component';
    } else if (fileName.includes('config') || fileName.includes('.json') || fileName.includes('.yml')) {
      type = 'config';
    }

    return { targetCategory, type, framework, provider };
  }

  private generateTargetPath(
    category: string, 
    type: 'file' | 'component' | 'config',
    originalPath: string,
    framework?: string,
    provider?: string
  ): string {
    const fileName = path.basename(originalPath);
    
    // Create directory structure
    const parts = [category];
    
    if (framework || provider) {
      parts.push(framework || provider || 'default');
    }
    
    parts.push(`${type}s`);
    parts.push(fileName);

    return path.join(this.config.targetDir, ...parts);
  }

  private async copyTemplates() {
    consola.info('Copying templates...');

    let copied = 0;
    let skipped = 0;

    for (const mapping of this.mappings) {
      try {
        // Ensure target directory exists
        await fs.ensureDir(path.dirname(mapping.targetPath));

        // Check if target already exists
        if (await fs.pathExists(mapping.targetPath)) {
          if (this.config.verbose) {
            consola.warn(`Skipping existing file: ${mapping.targetPath}`);
          }
          skipped++;
          continue;
        }

        // Copy and potentially transform template
        const content = await fs.readFile(mapping.sourcePath, 'utf-8');
        const transformedContent = await this.transformTemplate(content, mapping);
        
        await fs.writeFile(mapping.targetPath, transformedContent);
        
        if (this.config.verbose) {
          consola.success(`Copied: ${mapping.sourcePath} -> ${mapping.targetPath}`);
        }
        
        copied++;
      } catch (error) {
        consola.error(`Failed to copy ${mapping.sourcePath}:`, error);
      }
    }

    consola.info(`Copied ${copied} templates, skipped ${skipped} existing files`);
  }

  private async transformTemplate(content: string, mapping: TemplateMapping): Promise<string> {
    // Apply any necessary transformations to the template content
    let transformed = content;

    // Fix common handlebars syntax issues
    transformed = this.fixHandlebarsSyntax(transformed);

    // Add template metadata comment
    const metadata = [
      `{{!-- Template: ${path.basename(mapping.targetPath)} --}}`,
      `{{!-- Category: ${mapping.category} --}}`,
      `{{!-- Type: ${mapping.type} --}}`,
      ...(mapping.framework ? [`{{!-- Framework: ${mapping.framework} --}}`] : []),
      ...(mapping.provider ? [`{{!-- Provider: ${mapping.provider} --}}`] : []),
      `{{!-- Migrated from: ${mapping.sourcePath} --}}`,
      ''
    ].join('\n');

    return metadata + transformed;
  }

  private fixHandlebarsSyntax(content: string): string {
    // Fix common syntax issues found in existing templates
    let fixed = content;

    // Fix template string interpolation in line 87 of express template
    fixed = fixed.replace(
      'console.log("template string");',
      'console.log(`🚀 Server running on port ${port}`);'
    );

    // Fix missing backtick in Next.js layout template
    fixed = fixed.replace(
      'className="" ${geistMono.variable} antialiased`}',
      'className={`${geistSans.variable} ${geistMono.variable} antialiased`}'
    );

    // Add other syntax fixes as needed
    return fixed;
  }

  private async generateRegistryEntries() {
    consola.info('Generating template registry entries...');

    const registryEntries: Record<string, any[]> = {};

    for (const mapping of this.mappings) {
      const key = `${mapping.category}${mapping.provider ? `-${mapping.provider}` : ''}`;
      
      if (!registryEntries[key]) {
        registryEntries[key] = [];
      }

      const entry = {
        serviceType: mapping.category,
        provider: mapping.provider || 'default',
        templates: {
          [mapping.type]: path.relative(this.config.targetDir, mapping.targetPath)
        }
      };

      registryEntries[key].push(entry);
    }

    // Write registry entries to file
    const registryPath = path.join(this.config.targetDir, 'template-registry-migrations.json');
    await fs.writeJson(registryPath, registryEntries, { spaces: 2 });

    consola.success(`Generated template registry entries: ${registryPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const sourceDir = path.resolve(__dirname, '../../cli/templates');
  const targetDir = path.resolve(__dirname, '../src/templates');

  if (!(await fs.pathExists(sourceDir))) {
    consola.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const migrator = new TemplateMigrator({
    sourceDir,
    targetDir,
    dryRun,
    verbose
  });

  try {
    await migrator.migrate();
  } catch (error) {
    consola.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { TemplateMigrator };
export type { TemplateMigrationConfig, TemplateMapping };
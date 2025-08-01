import path from 'path';
import { promises as fs } from 'fs';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { fileExists, ensureDir, writeFile, readFile } from '../utils/fs.js';
import { ExtractedText } from '../localization/text-extractor.js';
import { ProjectConfig } from '../types/project.js';

// Migration source types
export type MigrationSource = 'lovable' | 'bolt' | 'generic-react' | 'create-react-app' | 'vite';

// Project analysis result
export interface ProjectAnalysis {
  source: MigrationSource;
  framework: string;
  version?: string;
  language: 'javascript' | 'typescript';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  structure: ProjectStructure;
  components: ComponentInfo[];
  pages: PageInfo[];
  assets: AssetInfo[];
  configuration: ConfigurationInfo;
  buildTool: string;
  styling: StylingInfo;
  stateManagement?: StateManagementInfo;
  routing?: RoutingInfo;
  testing?: TestingInfo;
  texts: ExtractedText[];
}

// Project structure
export interface ProjectStructure {
  srcDir: string;
  componentsDir: string;
  pagesDir?: string;
  stylesDir?: string;
  assetsDir?: string;
  publicDir?: string;
  configFiles: string[];
  hasTypeScript: boolean;
  hasTests: boolean;
}

// Component information
export interface ComponentInfo {
  name: string;
  path: string;
  type: 'functional' | 'class' | 'hook';
  props?: ComponentProp[];
  dependencies: string[];
  styles?: string;
  tests?: string[];
  stories?: string;
  hasState: boolean;
  hooks: string[];
  complexity: number;
}

// Component prop
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// Page information
export interface PageInfo {
  name: string;
  path: string;
  route: string;
  components: string[];
  hasLayout: boolean;
  hasAuth: boolean;
  dataFetching?: 'ssr' | 'ssg' | 'client';
  seo: {
    title?: string;
    description?: string;
  };
}

// Asset information
export interface AssetInfo {
  name: string;
  path: string;
  type: 'image' | 'font' | 'video' | 'audio' | 'document';
  size: number;
  used: boolean;
}

// Configuration information
export interface ConfigurationInfo {
  eslint?: any;
  prettier?: any;
  typescript?: any;
  tailwind?: any;
  vite?: any;
  webpack?: any;
  next?: any;
  babel?: any;
}

// Styling information
export interface StylingInfo {
  type: 'css' | 'scss' | 'less' | 'styled-components' | 'emotion' | 'tailwind' | 'css-modules';
  files: string[];
  variables?: Record<string, string>;
  mixins?: string[];
}

// State management information
export interface StateManagementInfo {
  type: 'redux' | 'zustand' | 'context' | 'mobx' | 'recoil' | 'none';
  files: string[];
  stores?: string[];
}

// Routing information
export interface RoutingInfo {
  type: 'react-router' | 'next-router' | 'reach-router' | 'none';
  routes: RouteInfo[];
  guards?: string[];
}

export interface RouteInfo {
  path: string;
  component: string;
  protected: boolean;
  params?: string[];
}

// Testing information
export interface TestingInfo {
  framework: 'jest' | 'vitest' | 'mocha' | 'cypress' | 'playwright';
  files: string[];
  coverage: boolean;
  e2e: boolean;
}

// Migration options
export interface MigrationOptions {
  outputPath: string;
  preserveStructure: boolean;
  createBackup: boolean;
  migrateTests: boolean;
  migrateStories: boolean;
  convertToTypeScript: boolean;
  addLocalization: boolean;
  addCompliance: boolean;
  targetPlatform: 'nextjs' | 'react';
  targetStyling: 'tailwind' | 'styled-components' | 'css-modules';
  dryRun: boolean;
}

// Migration result
export interface MigrationResult {
  success: boolean;
  analysis: ProjectAnalysis;
  migratedFiles: string[];
  skippedFiles: string[];
  errors: MigrationError[];
  warnings: MigrationWarning[];
  summary: MigrationSummary;
  rollbackData?: RollbackData;
}

// Migration error
export interface MigrationError {
  file: string;
  type: 'parse' | 'transform' | 'write' | 'dependency';
  message: string;
  originalError?: Error;
}

// Migration warning
export interface MigrationWarning {
  file: string;
  type: 'deprecated' | 'manual-review' | 'compatibility';
  message: string;
  suggestion?: string;
}

// Migration summary
export interface MigrationSummary {
  totalFiles: number;
  migratedFiles: number;
  skippedFiles: number;
  errors: number;
  warnings: number;
  duration: number;
  changes: {
    components: number;
    pages: number;
    styles: number;
    tests: number;
    configurations: number;
  };
}

// Rollback data
export interface RollbackData {
  backupPath: string;
  operations: RollbackOperation[];
}

export interface RollbackOperation {
  type: 'create' | 'modify' | 'delete';
  path: string;
  originalContent?: string;
}

// Migration progress callback
export type ProgressCallback = (progress: {
  stage: string;
  current: number;
  total: number;
  message: string;
}) => void;

// Abstract base migration adapter
export abstract class BaseMigrationAdapter {
  protected options: MigrationOptions;
  protected rollbackData: RollbackData;
  
  constructor(options: MigrationOptions) {
    this.options = options;
    this.rollbackData = {
      backupPath: '',
      operations: [],
    };
  }
  
  // Abstract methods to be implemented by subclasses
  abstract canMigrate(projectPath: string): Promise<boolean>;
  abstract analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  abstract transformComponent(component: ComponentInfo, analysis: ProjectAnalysis): Promise<string>;
  abstract transformPage(page: PageInfo, analysis: ProjectAnalysis): Promise<string>;
  abstract transformStyles(styling: StylingInfo, analysis: ProjectAnalysis): Promise<Record<string, string>>;
  
  // Main migration method
  async migrate(
    sourcePath: string,
    progressCallback?: ProgressCallback
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      analysis: {} as ProjectAnalysis,
      migratedFiles: [],
      skippedFiles: [],
      errors: [],
      warnings: [],
      summary: {
        totalFiles: 0,
        migratedFiles: 0,
        skippedFiles: 0,
        errors: 0,
        warnings: 0,
        duration: 0,
        changes: {
          components: 0,
          pages: 0,
          styles: 0,
          tests: 0,
          configurations: 0,
        },
      },
    };
    
    try {
      // Stage 1: Validation
      progressCallback?.({
        stage: 'validation',
        current: 1,
        total: 6,
        message: 'Validating source project...',
      });
      
      if (!await this.canMigrate(sourcePath)) {
        throw new Error('Source project is not compatible with this migration adapter');
      }
      
      // Stage 2: Analysis
      progressCallback?.({
        stage: 'analysis',
        current: 2,
        total: 6,
        message: 'Analyzing project structure...',
      });
      
      result.analysis = await this.analyzeProject(sourcePath);
      result.summary.totalFiles = this.countTotalFiles(result.analysis);
      
      // Stage 3: Backup
      if (this.options.createBackup) {
        progressCallback?.({
          stage: 'backup',
          current: 3,
          total: 6,
          message: 'Creating backup...',
        });
        
        await this.createBackup(sourcePath);
      }
      
      // Stage 4: Setup output directory
      progressCallback?.({
        stage: 'setup',
        current: 4,
        total: 6,
        message: 'Setting up output directory...',
      });
      
      await this.setupOutputDirectory();
      
      // Stage 5: Migration
      progressCallback?.({
        stage: 'migration',
        current: 5,
        total: 6,
        message: 'Migrating files...',
      });
      
      if (this.options.dryRun) {
        await this.performDryRun(result);
      } else {
        await this.performMigration(result);
      }
      
      // Stage 6: Finalization
      progressCallback?.({
        stage: 'finalization',
        current: 6,
        total: 6,
        message: 'Finalizing migration...',
      });
      
      await this.finalizeMigration(result);
      
      result.success = result.errors.length === 0;
      result.summary.duration = Date.now() - startTime;
      
      if (!this.options.dryRun && this.options.createBackup) {
        result.rollbackData = this.rollbackData;
      }
      
      logger.info(`Migration completed in ${result.summary.duration}ms`);
      
    } catch (error) {
      logger.error('Migration failed:', error);
      result.errors.push({
        file: '',
        type: 'parse',
        message: error instanceof Error ? error.message : 'Unknown error',
        originalError: error instanceof Error ? error : undefined,
      });
    }
    
    return result;
  }
  
  // Create backup of source project
  protected async createBackup(sourcePath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      path.dirname(this.options.outputPath),
      `backup-${path.basename(sourcePath)}-${timestamp}`
    );
    
    this.rollbackData.backupPath = backupPath;
    
    await this.copyDirectory(sourcePath, backupPath);
    
    logger.info(`Backup created at: ${backupPath}`);
  }
  
  // Setup output directory
  protected async setupOutputDirectory(): Promise<void> {
    await ensureDir(this.options.outputPath);
    
    // Create standard directory structure for Xala projects
    const dirs = [
      'src',
      'src/components',
      'src/pages',
      'src/styles',
      'src/utils',
      'src/hooks',
      'src/types',
      'src/locales',
      'public',
      'docs',
    ];
    
    for (const dir of dirs) {
      await ensureDir(path.join(this.options.outputPath, dir));
    }
  }
  
  // Perform dry run migration
  protected async performDryRun(result: MigrationResult): Promise<void> {
    logger.info('Performing dry run migration...');
    
    // Simulate migration without writing files
    for (const component of result.analysis.components) {
      try {
        await this.transformComponent(component, result.analysis);
        result.summary.changes.components++;
        result.migratedFiles.push(component.path);
      } catch (error) {
        result.errors.push({
          file: component.path,
          type: 'transform',
          message: error instanceof Error ? error.message : 'Transform failed',
          originalError: error instanceof Error ? error : undefined,
        });
      }
    }
    
    for (const page of result.analysis.pages) {
      try {
        await this.transformPage(page, result.analysis);
        result.summary.changes.pages++;
        result.migratedFiles.push(page.path);
      } catch (error) {
        result.errors.push({
          file: page.path,
          type: 'transform',
          message: error instanceof Error ? error.message : 'Transform failed',
          originalError: error instanceof Error ? error : undefined,
        });
      }
    }
    
    result.summary.migratedFiles = result.migratedFiles.length;
  }
  
  // Perform actual migration
  protected async performMigration(result: MigrationResult): Promise<void> {
    logger.info('Performing migration...');
    
    // Migrate components
    for (const component of result.analysis.components) {
      try {
        const transformedContent = await this.transformComponent(component, result.analysis);
        const outputPath = this.getComponentOutputPath(component);
        
        await this.writeFile(outputPath, transformedContent);
        
        this.rollbackData.operations.push({
          type: 'create',
          path: outputPath,
        });
        
        result.summary.changes.components++;
        result.migratedFiles.push(outputPath);
        
        // Migrate tests if requested
        if (this.options.migrateTests && component.tests?.length) {
          await this.migrateComponentTests(component, result);
        }
        
        // Migrate stories if requested
        if (this.options.migrateStories && component.stories) {
          await this.migrateComponentStories(component, result);
        }
        
      } catch (error) {
        result.errors.push({
          file: component.path,
          type: 'transform',
          message: error instanceof Error ? error.message : 'Component migration failed',
          originalError: error instanceof Error ? error : undefined,
        });
      }
    }
    
    // Migrate pages
    for (const page of result.analysis.pages) {
      try {
        const transformedContent = await this.transformPage(page, result.analysis);
        const outputPath = this.getPageOutputPath(page);
        
        await this.writeFile(outputPath, transformedContent);
        
        this.rollbackData.operations.push({
          type: 'create',
          path: outputPath,
        });
        
        result.summary.changes.pages++;
        result.migratedFiles.push(outputPath);
        
      } catch (error) {
        result.errors.push({
          file: page.path,
          type: 'transform',
          message: error instanceof Error ? error.message : 'Page migration failed',
          originalError: error instanceof Error ? error : undefined,
        });
      }
    }
    
    // Migrate styles
    try {
      const transformedStyles = await this.transformStyles(result.analysis.styling, result.analysis);
      
      for (const [fileName, content] of Object.entries(transformedStyles)) {
        const outputPath = path.join(this.options.outputPath, 'src', 'styles', fileName);
        await this.writeFile(outputPath, content);
        
        result.summary.changes.styles++;
        result.migratedFiles.push(outputPath);
      }
      
    } catch (error) {
      result.errors.push({
        file: 'styles',
        type: 'transform',
        message: error instanceof Error ? error.message : 'Style migration failed',
        originalError: error instanceof Error ? error : undefined,
      });
    }
    
    // Generate configuration files
    await this.generateConfigurationFiles(result);
    
    result.summary.migratedFiles = result.migratedFiles.length;
  }
  
  // Finalize migration
  protected async finalizeMigration(result: MigrationResult): Promise<void> {
    // Generate package.json
    await this.generatePackageJson(result.analysis);
    
    // Generate README
    await this.generateReadme(result);
    
    // Generate localization files if requested
    if (this.options.addLocalization) {
      await this.generateLocalizationFiles(result.analysis.texts);
    }
    
    // Generate compliance documentation if requested
    if (this.options.addCompliance) {
      await this.generateComplianceDocumentation();
    }
  }
  
  // Helper methods
  protected getComponentOutputPath(component: ComponentInfo): string {
    const componentName = path.basename(component.path, path.extname(component.path));
    const ext = this.options.convertToTypeScript ? '.tsx' : '.jsx';
    return path.join(this.options.outputPath, 'src', 'components', `${componentName}${ext}`);
  }
  
  protected getPageOutputPath(page: PageInfo): string {
    const pageName = path.basename(page.path, path.extname(page.path));
    const ext = this.options.convertToTypeScript ? '.tsx' : '.jsx';
    
    if (this.options.targetPlatform === 'nextjs') {
      return path.join(this.options.outputPath, 'pages', `${pageName}${ext}`);
    } else {
      return path.join(this.options.outputPath, 'src', 'pages', `${pageName}${ext}`);
    }
  }
  
  protected async writeFile(filePath: string, content: string): Promise<void> {
    await ensureDir(path.dirname(filePath));
    await writeFile(filePath, content);
  }
  
  protected async copyDirectory(src: string, dest: string): Promise<void> {
    await ensureDir(dest);
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        const content = await readFile(srcPath);
        await writeFile(destPath, content);
      }
    }
  }
  
  protected countTotalFiles(analysis: ProjectAnalysis): number {
    return analysis.components.length + 
           analysis.pages.length + 
           analysis.styling.files.length + 
           analysis.assets.length;
  }
  
  // Abstract helper methods
  protected abstract migrateComponentTests(component: ComponentInfo, result: MigrationResult): Promise<void>;
  protected abstract migrateComponentStories(component: ComponentInfo, result: MigrationResult): Promise<void>;
  protected abstract generateConfigurationFiles(result: MigrationResult): Promise<void>;
  protected abstract generatePackageJson(analysis: ProjectAnalysis): Promise<void>;
  
  // Common implementations
  protected async generateReadme(result: MigrationResult): Promise<void> {
    const readme = `# Migrated Project

This project has been migrated to Xala UI System using the scaffolding tool.

## Migration Summary

- **Source**: ${result.analysis.source}
- **Framework**: ${result.analysis.framework}
- **Target Platform**: ${this.options.targetPlatform}
- **Components Migrated**: ${result.summary.changes.components}
- **Pages Migrated**: ${result.summary.changes.pages}
- **Files Migrated**: ${result.summary.migratedFiles}

## Features Added

${this.options.addLocalization ? '- ✅ Multi-language localization (Norwegian Bokmål default)' : ''}
${this.options.addCompliance ? '- ✅ Norwegian compliance (NSM, GDPR, WCAG AAA)' : ''}
${this.options.convertToTypeScript ? '- ✅ TypeScript conversion' : ''}
- ✅ Modern React patterns
- ✅ SOLID principles
- ✅ Enterprise standards

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
\`\`\`

## Norwegian Compliance

This project follows Norwegian government standards:
- NSM security classification: OPEN
- GDPR compliant data handling
- WCAG AAA accessibility standards

Generated with Xala Scaffold on ${new Date().toISOString()}
`;
    
    await this.writeFile(path.join(this.options.outputPath, 'README.md'), readme);
  }
  
  protected async generateLocalizationFiles(texts: ExtractedText[]): Promise<void> {
    // This would integrate with the localization system
    // For now, create basic structure
    const localesDir = path.join(this.options.outputPath, 'src', 'locales');
    
    const locales = ['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR'];
    
    for (const locale of locales) {
      const localeFile = {
        locale,
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
        },
        translations: {
          common: {
            welcome: locale === 'nb-NO' ? 'Velkommen' : 'Welcome',
            loading: locale === 'nb-NO' ? 'Laster...' : 'Loading...',
          },
        },
      };
      
      await this.writeFile(
        path.join(localesDir, `${locale}.json`),
        JSON.stringify(localeFile, null, 2)
      );
    }
  }
  
  protected async generateComplianceDocumentation(): Promise<void> {
    const docsDir = path.join(this.options.outputPath, 'docs');
    
    const complianceDoc = `# Norwegian Compliance Documentation

This project follows Norwegian government standards and regulations.

## NSM Security Classification

- **Classification Level**: OPEN
- **Data Handling**: All data is handled according to NSM guidelines
- **Access Control**: Role-based access control implemented

## GDPR Compliance

- **Data Protection**: Personal data is protected according to GDPR
- **User Rights**: Users have full control over their data
- **Audit Trail**: All data operations are logged

## WCAG AAA Accessibility

- **Screen Reader**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: AAA level color contrast ratios
- **RTL Support**: Right-to-left layout for Arabic

## Implementation

This project uses:
- \`@xala-technologies/ui-system\` for compliant components
- \`@xala-technologies/foundation\` for core services
- \`@xala-technologies/norwegian-compliance\` for compliance utilities

Generated on ${new Date().toISOString()}
`;
    
    await this.writeFile(path.join(docsDir, 'COMPLIANCE.md'), complianceDoc);
  }
  
  // Rollback functionality
  async rollback(): Promise<void> {
    if (!this.rollbackData.backupPath) {
      throw new Error('No backup available for rollback');
    }
    
    logger.info('Rolling back migration...');
    
    // Remove created files
    for (const operation of this.rollbackData.operations) {
      if (operation.type === 'create' && await fileExists(operation.path)) {
        await fs.unlink(operation.path);
      }
    }
    
    // Restore from backup if needed
    if (await fileExists(this.rollbackData.backupPath)) {
      await this.copyDirectory(this.rollbackData.backupPath, this.options.outputPath);
    }
    
    logger.info('Migration rolled back successfully');
  }
}
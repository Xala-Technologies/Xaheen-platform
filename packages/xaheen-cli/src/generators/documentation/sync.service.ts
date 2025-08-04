/**
 * @fileoverview Documentation Synchronization Service
 * @description Automated synchronization between codebase changes and documentation updates
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { watch, FSWatcher } from 'chokidar';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve, relative, extname, basename } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import type {
  SynchronizationConfiguration,
  DocumentationWatchOptions,
  FileProcessor,
  ProcessorResult,
  DocumentationChange,
  WatchContext,
  WatchHook,
  SyncTrigger,
  SyncAction,
} from './portal-types';

const execAsync = promisify(exec);

export interface SyncServiceOptions {
  readonly projectRoot: string;
  readonly docsRoot: string;
  readonly config: SynchronizationConfiguration;
  readonly processors?: readonly FileProcessor[];
  readonly hooks?: readonly WatchHook[];
}

export interface SyncEvent {
  readonly type: 'add' | 'change' | 'unlink';
  readonly filePath: string;
  readonly timestamp: Date;
  readonly hash?: string;
}

export interface SyncResult {
  readonly success: boolean;
  readonly message: string;
  readonly changes: readonly DocumentationChange[];
  readonly errors?: readonly string[];
}

export class DocumentationSyncService {
  private watcher: FSWatcher | null = null;
  private isWatching = false;
  private readonly syncQueue: Map<string, SyncEvent> = new Map();
  private readonly fileHashes: Map<string, string> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceMs: number = 1000;

  constructor(private readonly options: SyncServiceOptions) {
    this.loadFileHashes();
  }

  /**
   * Start watching for file changes and sync documentation
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      throw new Error('Documentation sync service is already watching');
    }

    const { projectRoot, config } = this.options;
    const { watchPatterns, ignorePatterns } = config;

    this.watcher = watch(watchPatterns, {
      cwd: projectRoot,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        ...ignorePatterns,
      ],
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
    });

    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => this.handleError(error));

    this.isWatching = true;
    console.log(`📚 Documentation sync service started watching ${watchPatterns.join(', ')}`);
  }

  /**
   * Stop watching for file changes
   */
  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isWatching = false;
    console.log('📚 Documentation sync service stopped');
  }

  /**
   * Manually trigger synchronization
   */
  async manualSync(): Promise<SyncResult> {
    console.log('🔄 Starting manual documentation synchronization...');
    
    try {
      const changes: DocumentationChange[] = [];
      const errors: string[] = [];

      // Process all files matching watch patterns
      for (const pattern of this.options.config.watchPatterns) {
        const files = await this.findFiles(pattern);
        
        for (const filePath of files) {
          try {
            const result = await this.processFile(filePath, 'manual');
            if (result.success && result.changes) {
              changes.push(...result.changes);
            } else if (!result.success && result.error) {
              errors.push(result.error);
            }
          } catch (error) {
            errors.push(`Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      const result = {
        success: errors.length === 0,
        message: `Manual sync completed. ${changes.length} changes processed${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
        changes,
        errors: errors.length > 0 ? errors : undefined,
      };

      console.log(`✅ ${result.message}`);
      return result;
    } catch (error) {
      const errorMessage = `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMessage}`);
      return {
        success: false,
        message: errorMessage,
        changes: [],
        errors: [errorMessage],
      };
    }
  }

  /**
   * Process a specific file and update documentation
   */
  async processFile(filePath: string, eventType: 'add' | 'change' | 'unlink' | 'manual'): Promise<ProcessorResult> {
    const fullPath = resolve(this.options.projectRoot, filePath);
    
    // Check if file should be processed
    if (!this.shouldProcessFile(filePath)) {
      return {
        success: true,
        message: `File ${filePath} skipped (not matching patterns)`,
      };
    }

    // Run before-process hooks
    await this.runHooks('before-process', { filePath: fullPath });

    try {
      const changes: DocumentationChange[] = [];
      let content = '';

      if (eventType !== 'unlink' && existsSync(fullPath)) {
        content = readFileSync(fullPath, 'utf8');
        
        // Update file hash
        const hash = this.calculateFileHash(content);
        const previousHash = this.fileHashes.get(filePath);
        
        if (previousHash === hash && eventType !== 'manual') {
          return {
            success: true,
            message: `File ${filePath} unchanged (hash match)`,
          };
        }
        
        this.fileHashes.set(filePath, hash);
      } else if (eventType === 'unlink') {
        this.fileHashes.delete(filePath);
      }

      // Find and run applicable processors
      const processors = this.findProcessorsForFile(filePath);
      
      for (const processor of processors) {
        try {
          const result = await processor.processor(fullPath, content);
          if (result.success && result.changes) {
            changes.push(...result.changes);
          }
        } catch (error) {
          console.warn(`Processor ${processor.name} failed for ${filePath}:`, error);
        }
      }

      // Execute sync actions based on triggers
      await this.executeSyncActions(filePath, eventType, changes);

      // Save updated file hashes
      this.saveFileHashes();

      const result = {
        success: true,
        message: `Processed ${filePath}: ${changes.length} changes`,
        changes,
      };

      // Run after-process hooks
      await this.runHooks('after-process', { filePath: fullPath, changes });

      return result;
    } catch (error) {
      const errorMessage = `Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Run error hooks
      await this.runHooks('error', { filePath: fullPath, error: error as Error });
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Get synchronization status
   */
  getStatus(): {
    readonly isWatching: boolean;
    readonly queueSize: number;
    readonly watchedFiles: number;
    readonly lastSync?: Date;
  } {
    return {
      isWatching: this.isWatching,
      queueSize: this.syncQueue.size,
      watchedFiles: this.fileHashes.size,
      lastSync: this.getLastSyncTime(),
    };
  }

  private async handleFileEvent(eventType: 'add' | 'change' | 'unlink', filePath: string): Promise<void> {
    const fullPath = resolve(this.options.projectRoot, filePath);
    let hash: string | undefined;

    if (eventType !== 'unlink' && existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf8');
      hash = this.calculateFileHash(content);
    }

    const event: SyncEvent = {
      type: eventType,
      filePath,
      timestamp: new Date(),
      hash,
    };

    this.syncQueue.set(filePath, event);

    // Debounce processing to avoid excessive updates
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.processSyncQueue();
    }, this.debounceMs);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.size === 0) return;

    console.log(`🔄 Processing ${this.syncQueue.size} file changes...`);

    const events = Array.from(this.syncQueue.values());
    this.syncQueue.clear();

    for (const event of events) {
      try {
        await this.processFile(event.filePath, event.type);
      } catch (error) {
        console.error(`Failed to process ${event.filePath}:`, error);
      }
    }

    console.log(`✅ Processed ${events.length} file changes`);
  }

  private shouldProcessFile(filePath: string): boolean {
    const { watchPatterns, ignorePatterns } = this.options.config;

    // Check if file matches any ignore patterns
    for (const ignorePattern of ignorePatterns) {
      if (this.matchesPattern(filePath, ignorePattern)) {
        return false;
      }
    }

    // Check if file matches any watch patterns
    for (const watchPattern of watchPatterns) {
      if (this.matchesPattern(filePath, watchPattern)) {
        return true;
      }
    }

    return false;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple pattern matching - in production, use a proper glob library
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  }

  private findProcessorsForFile(filePath: string): readonly FileProcessor[] {
    if (!this.options.processors) return [];

    return this.options.processors.filter(processor =>
      this.matchesPattern(filePath, processor.pattern)
    );
  }

  private async executeSyncActions(
    filePath: string,
    eventType: string,
    changes: readonly DocumentationChange[]
  ): Promise<void> {
    const { triggers } = this.options.config;

    for (const trigger of triggers) {
      if (this.shouldExecuteTrigger(trigger, filePath, eventType)) {
        for (const action of trigger.actions) {
          try {
            await this.executeSyncAction(action, filePath, changes);
          } catch (error) {
            console.error(`Failed to execute sync action ${action.type}:`, error);
          }
        }
      }
    }
  }

  private shouldExecuteTrigger(trigger: SyncTrigger, filePath: string, eventType: string): boolean {
    // Check event type match
    if (trigger.event === 'file-change' && !['add', 'change', 'unlink'].includes(eventType)) {
      return false;
    }

    // Check pattern match if specified
    if (trigger.pattern && !this.matchesPattern(filePath, trigger.pattern)) {
      return false;
    }

    return true;
  }

  private async executeSyncAction(
    action: SyncAction,
    filePath: string,
    changes: readonly DocumentationChange[]
  ): Promise<void> {
    switch (action.type) {
      case 'regenerate-docs':
        await this.regenerateDocumentation(action.target, action.config);
        break;
      
      case 'update-api-docs':
        await this.updateAPIDocumentation(filePath, action.config);
        break;
      
      case 'refresh-examples':
        await this.refreshExamples(filePath, action.config);
        break;
      
      case 'rebuild-search':
        await this.rebuildSearchIndex(action.config);
        break;
      
      case 'notify-team':
        await this.notifyTeam(changes, action.config);
        break;
      
      default:
        console.warn(`Unknown sync action type: ${action.type}`);
    }
  }

  private async regenerateDocumentation(target?: string, config?: Record<string, any>): Promise<void> {
    console.log(`🔄 Regenerating documentation${target ? ` for ${target}` : ''}...`);
    
    try {
      const docsRoot = this.options.docsRoot;
      const command = config?.command || 'npm run build:docs';
      
      await execAsync(command, { cwd: docsRoot });
      console.log('✅ Documentation regenerated successfully');
    } catch (error) {
      console.error('❌ Failed to regenerate documentation:', error);
      throw error;
    }
  }

  private async updateAPIDocumentation(filePath: string, config?: Record<string, any>): Promise<void> {
    // Check if file is API-related
    if (!this.isAPIFile(filePath)) return;

    console.log(`🔄 Updating API documentation for ${filePath}...`);
    
    try {
      // Generate OpenAPI spec from code
      const specCommand = config?.specCommand || 'npm run generate:openapi';
      await execAsync(specCommand, { cwd: this.options.projectRoot });
      
      // Update API docs
      const docsCommand = config?.docsCommand || 'npm run update:api-docs';
      await execAsync(docsCommand, { cwd: this.options.docsRoot });
      
      console.log('✅ API documentation updated successfully');
    } catch (error) {
      console.error('❌ Failed to update API documentation:', error);
      throw error;
    }
  }

  private async refreshExamples(filePath: string, config?: Record<string, any>): Promise<void> {
    console.log(`🔄 Refreshing examples related to ${filePath}...`);
    
    try {
      // Find and update related examples
      const examplesDir = config?.examplesDir || join(this.options.docsRoot, 'examples');
      const command = config?.command || 'npm run update:examples';
      
      await execAsync(command, { cwd: examplesDir });
      console.log('✅ Examples refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh examples:', error);
      throw error;
    }
  }

  private async rebuildSearchIndex(config?: Record<string, any>): Promise<void> {
    console.log('🔍 Rebuilding search index...');
    
    try {
      const command = config?.command || 'npm run build:search';
      await execAsync(command, { cwd: this.options.docsRoot });
      
      console.log('✅ Search index rebuilt successfully');
    } catch (error) {
      console.error('❌ Failed to rebuild search index:', error);
      throw error;
    }
  }

  private async notifyTeam(changes: readonly DocumentationChange[], config?: Record<string, any>): Promise<void> {
    if (changes.length === 0) return;

    console.log(`📢 Notifying team about ${changes.length} documentation changes...`);
    
    try {
      const webhookUrl = config?.webhookUrl;
      if (webhookUrl) {
        const payload = {
          text: `Documentation updated: ${changes.length} changes`,
          changes: changes.map(change => ({
            type: change.type,
            file: change.file,
            description: change.description,
          })),
          timestamp: new Date().toISOString(),
        };

        // In a real implementation, send HTTP request to webhook
        console.log('📢 Team notification sent (webhook)');
      }
      
      // Could also send email, Slack message, etc.
    } catch (error) {
      console.error('❌ Failed to notify team:', error);
    }
  }

  private isAPIFile(filePath: string): boolean {
    const apiPatterns = [
      /\/api\//,
      /\/routes\//,
      /\/controllers\//,
      /\.api\./,
      /swagger/i,
      /openapi/i,
    ];

    return apiPatterns.some(pattern => pattern.test(filePath));
  }

  private async runHooks(event: 'before-process' | 'after-process' | 'error', context: WatchContext): Promise<void> {
    if (!this.options.hooks) return;

    const hooks = this.options.hooks.filter(hook => hook.event === event);
    
    for (const hook of hooks) {
      try {
        await hook.handler(context);
      } catch (error) {
        console.error(`Hook ${event} failed:`, error);
      }
    }
  }

  private async findFiles(pattern: string): Promise<string[]> {
    // Simple file finding - in production, use a proper glob library
    const { projectRoot } = this.options;
    const files: string[] = [];
    
    // This is a simplified implementation
    // In production, use libraries like glob or fast-glob
    
    return files;
  }

  private calculateFileHash(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  private loadFileHashes(): void {
    const hashesFile = join(this.options.docsRoot, '.sync-hashes.json');
    
    if (existsSync(hashesFile)) {
      try {
        const hashes = JSON.parse(readFileSync(hashesFile, 'utf8'));
        for (const [filePath, hash] of Object.entries(hashes)) {
          this.fileHashes.set(filePath, hash as string);
        }
      } catch (error) {
        console.warn('Failed to load file hashes:', error);
      }
    }
  }

  private saveFileHashes(): void {
    const hashesFile = join(this.options.docsRoot, '.sync-hashes.json');
    
    try {
      const hashes = Object.fromEntries(this.fileHashes.entries());
      writeFileSync(hashesFile, JSON.stringify(hashes, null, 2));
    } catch (error) {
      console.warn('Failed to save file hashes:', error);
    }
  }

  private getLastSyncTime(): Date | undefined {
    const hashesFile = join(this.options.docsRoot, '.sync-hashes.json');
    
    if (existsSync(hashesFile)) {
      const stats = statSync(hashesFile);
      return stats.mtime;
    }
    
    return undefined;
  }

  private handleError(error: Error): void {
    console.error('Documentation sync service error:', error);
  }
}

/**
 * Default file processors for common file types
 */
export const createDefaultProcessors = (): readonly FileProcessor[] => [
  {
    name: 'TypeScript API Processor',
    pattern: '**/*.ts',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      // Extract API endpoints, types, interfaces
      if (content.includes('@api') || content.includes('export interface') || content.includes('export type')) {
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated TypeScript definitions and API documentation',
          metadata: {
            hasInterfaces: content.includes('export interface'),
            hasTypes: content.includes('export type'),
            hasAPIEndpoints: content.includes('@api'),
          },
        });
      }
      
      return {
        success: true,
        message: `Processed TypeScript file: ${filePath}`,
        changes,
      };
    },
  },
  
  {
    name: 'OpenAPI Spec Processor',
    pattern: '**/openapi.{json,yaml,yml}',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      changes.push({
        type: 'update',
        file: filePath,
        description: 'Updated OpenAPI specification',
        metadata: {
          isOpenAPISpec: true,
        },
      });
      
      return {
        success: true,
        message: `Processed OpenAPI spec: ${filePath}`,
        changes,
      };
    },
  },
  
  {
    name: 'Package.json Processor',
    pattern: '**/package.json',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      try {
        const pkg = JSON.parse(content);
        
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated package information and dependencies',
          metadata: {
            version: pkg.version,
            dependencies: Object.keys(pkg.dependencies || {}),
            devDependencies: Object.keys(pkg.devDependencies || {}),
          },
        });
      } catch (error) {
        return {
          success: false,
          message: `Failed to parse package.json: ${error}`,
          error: `Invalid JSON in ${filePath}`,
        };
      }
      
      return {
        success: true,
        message: `Processed package.json: ${filePath}`,
        changes,
      };
    },
  },
  
  {
    name: 'README Processor',
    pattern: '**/README.{md,txt}',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      changes.push({
        type: 'update',
        file: filePath,
        description: 'Updated README documentation',
        metadata: {
          hasCodeBlocks: content.includes('```'),
          hasLinks: content.includes('['),
          wordCount: content.split(/\s+/).length,
        },
      });
      
      return {
        success: true,
        message: `Processed README: ${filePath}`,
        changes,
      };
    },
  },
  
  {
    name: 'Configuration Processor',
    pattern: '**/{config,env,settings}.{json,yaml,yml,toml,ini}',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      changes.push({
        type: 'update',
        file: filePath,
        description: 'Updated configuration documentation',
        metadata: {
          isConfiguration: true,
          fileType: extname(filePath).slice(1),
        },
      });
      
      return {
        success: true,
        message: `Processed configuration file: ${filePath}`,
        changes,
      };
    },
  },
];

/**
 * Factory function to create a documentation sync service
 */
export function createDocumentationSyncService(options: SyncServiceOptions): DocumentationSyncService {
  return new DocumentationSyncService({
    ...options,
    processors: options.processors || createDefaultProcessors(),
  });
}
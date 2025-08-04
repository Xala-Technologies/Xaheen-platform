/**
 * @fileoverview Documentation Watcher Service
 * @description Advanced file watching service for real-time documentation updates
 * @author Xaheen Enterprise
 * @version 1.0.0
 */

import { watch, FSWatcher } from 'chokidar';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve, relative, extname, basename, dirname } from 'path';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import type {
  DocumentationWatchOptions,
  FileProcessor,
  ProcessorResult,
  DocumentationChange,
  WatchContext,
  WatchHook,
} from './portal-types';

const execAsync = promisify(exec);

export interface WatcherConfig {
  readonly projectRoot: string;
  readonly docsRoot: string;
  readonly outputDir: string;
  readonly watchPatterns: readonly string[];
  readonly ignorePatterns: readonly string[];
  readonly debounceMs: number;
  readonly maxConcurrentJobs: number;
  readonly enableHotReload: boolean;
  readonly enableNotifications: boolean;
}

export interface WatchEvent {
  readonly type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  readonly path: string;
  readonly stats?: any;
  readonly timestamp: Date;
}

export interface ProcessingJob {
  readonly id: string;
  readonly filePath: string;
  readonly eventType: WatchEvent['type'];
  readonly priority: 'low' | 'normal' | 'high';
  readonly retryCount: number;
  readonly createdAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
  readonly error?: Error;
  readonly result?: ProcessorResult;
}

export interface WatcherStats {
  readonly isRunning: boolean;
  readonly filesWatched: number;
  readonly eventsProcessed: number;
  readonly jobsQueued: number;
  readonly jobsProcessing: number;
  readonly jobsCompleted: number;
  readonly jobsFailed: number;
  readonly averageProcessingTime: number;
  readonly lastEventTime?: Date;
  readonly uptime: number;
}

export class DocumentationWatcherService extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private isRunning = false;
  private jobQueue: Map<string, ProcessingJob> = new Map();
  private processingJobs: Set<string> = new Set();
  private processors: Map<string, FileProcessor> = new Map();
  private hooks: Map<string, WatchHook[]> = new Map();
  private stats: WatcherStats;
  private startTime: Date;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private hotReloadProcess: ChildProcess | null = null;
  private fileHashes: Map<string, string> = new Map();
  private eventHistory: WatchEvent[] = [];
  private maxHistorySize = 1000;

  constructor(private readonly config: WatcherConfig) {
    super();
    this.startTime = new Date();
    this.stats = this.initializeStats();
    this.setupErrorHandling();
  }

  /**
   * Start the documentation watcher
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Documentation watcher is already running');
    }

    this.emit('starting');
    console.log('📚 Starting documentation watcher...');

    try {
      await this.initializeWatcher();
      await this.startHotReloadServer();
      
      this.isRunning = true;
      this.stats = { ...this.stats, isRunning: true };
      
      console.log(`✅ Documentation watcher started`);
      console.log(`📁 Watching: ${this.config.watchPatterns.join(', ')}`);
      console.log(`🚫 Ignoring: ${this.config.ignorePatterns.join(', ')}`);
      
      this.emit('started');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the documentation watcher
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.emit('stopping');
    console.log('📚 Stopping documentation watcher...');

    try {
      // Stop file watcher
      if (this.watcher) {
        await this.watcher.close();
        this.watcher = null;
      }

      // Stop hot reload server
      if (this.hotReloadProcess) {
        this.hotReloadProcess.kill();
        this.hotReloadProcess = null;
      }

      // Clear timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();

      // Wait for pending jobs to complete (with timeout)
      await this.waitForJobsToComplete(5000);

      this.isRunning = false;
      this.stats = { ...this.stats, isRunning: false };
      
      console.log('✅ Documentation watcher stopped');
      this.emit('stopped');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Add a file processor
   */
  addProcessor(processor: FileProcessor): void {
    this.processors.set(processor.name, processor);
    console.log(`📄 Added processor: ${processor.name} (pattern: ${processor.pattern})`);
  }

  /**
   * Remove a file processor
   */
  removeProcessor(name: string): void {
    this.processors.delete(name);
    console.log(`🗑️ Removed processor: ${name}`);
  }

  /**
   * Add a hook
   */
  addHook(hook: WatchHook): void {
    if (!this.hooks.has(hook.event)) {
      this.hooks.set(hook.event, []);
    }
    this.hooks.get(hook.event)!.push(hook);
    console.log(`🪝 Added hook for event: ${hook.event}`);
  }

  /**
   * Get current statistics
   */
  getStats(): WatcherStats {
    const now = new Date();
    const uptime = Math.round((now.getTime() - this.startTime.getTime()) / 1000);
    
    const completedJobs = Array.from(this.jobQueue.values()).filter(job => job.status === 'completed');
    const averageProcessingTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          if (job.startedAt && job.completedAt) {
            return sum + (job.completedAt.getTime() - job.startedAt.getTime());
          }
          return sum;
        }, 0) / completedJobs.length
      : 0;

    return {
      ...this.stats,
      jobsQueued: Array.from(this.jobQueue.values()).filter(job => job.status === 'pending').length,
      jobsProcessing: this.processingJobs.size,
      jobsCompleted: completedJobs.length,
      jobsFailed: Array.from(this.jobQueue.values()).filter(job => job.status === 'failed').length,
      averageProcessingTime: Math.round(averageProcessingTime),
      uptime,
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 50): readonly WatchEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Get job queue status
   */
  getJobQueue(): readonly ProcessingJob[] {
    return Array.from(this.jobQueue.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Manually trigger processing for a specific file
   */
  async processFile(filePath: string, eventType: WatchEvent['type'] = 'change'): Promise<ProcessorResult> {
    const jobId = this.generateJobId();
    const job: ProcessingJob = {
      id: jobId,
      filePath,
      eventType,
      priority: 'high',
      retryCount: 0,
      createdAt: new Date(),
      status: 'pending',
    };

    this.jobQueue.set(jobId, job);
    return await this.executeJob(job);
  }

  /**
   * Clear job history
   */
  clearJobHistory(): void {
    const activeJobs = Array.from(this.jobQueue.values()).filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );
    
    this.jobQueue.clear();
    activeJobs.forEach(job => this.jobQueue.set(job.id, job));
    
    console.log('🧹 Cleared job history');
  }

  private async initializeWatcher(): Promise<void> {
    const { projectRoot, watchPatterns, ignorePatterns } = this.config;

    this.watcher = watch(watchPatterns, {
      cwd: projectRoot,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        ...ignorePatterns,
      ],
      ignoreInitial: false,
      persistent: true,
      followSymlinks: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher
      .on('add', (path, stats) => this.handleFileEvent('add', path, stats))
      .on('change', (path, stats) => this.handleFileEvent('change', path, stats))
      .on('unlink', (path) => this.handleFileEvent('unlink', path))
      .on('addDir', (path, stats) => this.handleFileEvent('addDir', path, stats))
      .on('unlinkDir', (path) => this.handleFileEvent('unlinkDir', path))
      .on('error', (error) => this.handleWatcherError(error))
      .on('ready', () => {
        console.log('👀 File watcher is ready');
        this.emit('watcher-ready');
      });

    // Wait for watcher to be ready
    await new Promise<void>((resolve) => {
      this.watcher!.on('ready', resolve);
    });
  }

  private async startHotReloadServer(): Promise<void> {
    if (!this.config.enableHotReload) return;

    try {
      // Start a simple hot reload server
      const serverScript = this.createHotReloadScript();
      this.hotReloadProcess = spawn('node', ['-e', serverScript], {
        stdio: 'pipe',
        cwd: this.config.docsRoot,
      });

      this.hotReloadProcess.on('error', (error) => {
        console.warn('⚠️ Hot reload server error:', error.message);
      });

      console.log('🔥 Hot reload server started');
    } catch (error) {
      console.warn('⚠️ Failed to start hot reload server:', error);
    }
  }

  private createHotReloadScript(): string {
    return `
      const http = require('http');
      const WebSocket = require('ws');
      
      const server = http.createServer();
      const wss = new WebSocket.Server({ server });
      
      wss.on('connection', (ws) => {
        console.log('Hot reload client connected');
        
        ws.on('close', () => {
          console.log('Hot reload client disconnected');
        });
      });
      
      server.listen(3001, () => {
        console.log('Hot reload server listening on port 3001');
      });
      
      // Keep the process alive
      process.on('SIGTERM', () => {
        wss.close();
        server.close();
        process.exit(0);
      });
    `;
  }

  private async handleFileEvent(
    type: WatchEvent['type'],
    filePath: string,
    stats?: any
  ): Promise<void> {
    const event: WatchEvent = {
      type,
      path: filePath,
      stats,
      timestamp: new Date(),
    };

    // Add to event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    this.stats = {
      ...this.stats,
      eventsProcessed: this.stats.eventsProcessed + 1,
      lastEventTime: event.timestamp,
    };

    this.emit('file-event', event);

    // Skip directory events for now
    if (type === 'addDir' || type === 'unlinkDir') return;

    // Check if file should be processed
    if (!this.shouldProcessFile(filePath)) return;

    // Debounce rapid file changes
    const debounceKey = filePath;
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }

    this.debounceTimers.set(debounceKey, setTimeout(async () => {
      await this.queueFileForProcessing(filePath, type);
      this.debounceTimers.delete(debounceKey);
    }, this.config.debounceMs));
  }

  private async queueFileForProcessing(
    filePath: string,
    eventType: WatchEvent['type']
  ): Promise<void> {
    const jobId = this.generateJobId();
    const priority = this.calculateJobPriority(filePath, eventType);
    
    const job: ProcessingJob = {
      id: jobId,
      filePath,
      eventType,
      priority,
      retryCount: 0,
      createdAt: new Date(),
      status: 'pending',
    };

    this.jobQueue.set(jobId, job);
    this.emit('job-queued', job);

    // Start processing if we have capacity
    if (this.processingJobs.size < this.config.maxConcurrentJobs) {
      await this.processNextJob();
    }
  }

  private async processNextJob(): Promise<void> {
    // Find the highest priority pending job
    const pendingJobs = Array.from(this.jobQueue.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority] ||
               a.createdAt.getTime() - b.createdAt.getTime();
      });

    const job = pendingJobs[0];
    if (!job) return;

    try {
      await this.executeJob(job);
    } catch (error) {
      console.error(`Failed to execute job ${job.id}:`, error);
    }

    // Process next job if we have capacity
    if (this.processingJobs.size < this.config.maxConcurrentJobs) {
      setImmediate(() => this.processNextJob());
    }
  }

  private async executeJob(job: ProcessingJob): Promise<ProcessorResult> {
    this.processingJobs.add(job.id);
    job.status = 'processing';
    job.startedAt = new Date();
    
    this.jobQueue.set(job.id, job);
    this.emit('job-started', job);

    try {
      const result = await this.processJobFile(job);
      
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      
      this.jobQueue.set(job.id, job);
      this.emit('job-completed', job);

      // Trigger hot reload if enabled
      if (this.config.enableHotReload && result.success) {
        this.triggerHotReload(job.filePath);
      }

      return result;
    } catch (error) {
      job.status = 'failed';
      job.error = error as Error;
      job.completedAt = new Date();
      
      this.jobQueue.set(job.id, job);
      this.emit('job-failed', job);

      // Retry logic
      if (job.retryCount < 3) {
        setTimeout(() => {
          job.retryCount++;
          job.status = 'pending';
          job.startedAt = undefined;
          job.completedAt = undefined;
          job.error = undefined;
          
          this.jobQueue.set(job.id, job);
          this.processNextJob();
        }, 1000 * Math.pow(2, job.retryCount)); // Exponential backoff
      }

      throw error;
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  private async processJobFile(job: ProcessingJob): Promise<ProcessorResult> {
    const { filePath, eventType } = job;
    const fullPath = resolve(this.config.projectRoot, filePath);

    // Run before-process hooks
    await this.runHooks('before-process', {
      filePath: fullPath,
      content: existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : undefined,
    });

    try {
      const changes: DocumentationChange[] = [];
      let content = '';

      // Read file content if it exists
      if (eventType !== 'unlink' && existsSync(fullPath)) {
        content = readFileSync(fullPath, 'utf8');
        
        // Check if file actually changed
        const hash = this.calculateFileHash(content);
        const previousHash = this.fileHashes.get(filePath);
        
        if (previousHash === hash && eventType === 'change') {
          return {
            success: true,
            message: `File ${filePath} unchanged (hash match)`,
          };
        }
        
        this.fileHashes.set(filePath, hash);
      } else if (eventType === 'unlink') {
        this.fileHashes.delete(filePath);
      }

      // Find applicable processors
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

      const result: ProcessorResult = {
        success: true,
        message: `Processed ${filePath}: ${changes.length} changes`,
        changes,
      };

      // Run after-process hooks
      await this.runHooks('after-process', {
        filePath: fullPath,
        content,
        changes,
      });

      return result;
    } catch (error) {
      const errorMessage = `Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Run error hooks
      await this.runHooks('error', {
        filePath: fullPath,
        error: error as Error,
      });
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  private shouldProcessFile(filePath: string): boolean {
    // Check against ignore patterns
    for (const ignorePattern of this.config.ignorePatterns) {
      if (this.matchesPattern(filePath, ignorePattern)) {
        return false;
      }
    }

    // Check if any processor can handle this file
    return this.findProcessorsForFile(filePath).length > 0;
  }

  private findProcessorsForFile(filePath: string): readonly FileProcessor[] {
    return Array.from(this.processors.values()).filter(processor =>
      this.matchesPattern(filePath, processor.pattern)
    );
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple pattern matching - in production, use a proper glob library
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  }

  private calculateJobPriority(filePath: string, eventType: WatchEvent['type']): ProcessingJob['priority'] {
    // High priority for API files, configuration, and package.json
    if (filePath.includes('package.json') || 
        filePath.includes('openapi') || 
        filePath.includes('swagger') ||
        filePath.includes('/api/')) {
      return 'high';
    }

    // Normal priority for source code
    if (filePath.endsWith('.ts') || 
        filePath.endsWith('.js') || 
        filePath.endsWith('.tsx') || 
        filePath.endsWith('.jsx')) {
      return 'normal';
    }

    // Low priority for other files
    return 'low';
  }

  private calculateFileHash(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async runHooks(event: WatchHook['event'], context: WatchContext): Promise<void> {
    const hooks = this.hooks.get(event) || [];
    
    for (const hook of hooks) {
      try {
        await hook.handler(context);
      } catch (error) {
        console.error(`Hook ${event} failed:`, error);
        this.emit('hook-error', { event, error });
      }
    }
  }

  private triggerHotReload(filePath: string): void {
    if (!this.hotReloadProcess) return;

    try {
      // Send reload message to hot reload server
      // This would typically send a message through WebSocket
      console.log(`🔥 Hot reload triggered for: ${filePath}`);
      this.emit('hot-reload', { filePath });
    } catch (error) {
      console.warn('Failed to trigger hot reload:', error);
    }
  }

  private async waitForJobsToComplete(timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    
    while (this.processingJobs.size > 0 && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.processingJobs.size > 0) {
      console.warn(`⚠️ ${this.processingJobs.size} jobs still processing after timeout`);
    }
  }

  private handleWatcherError(error: Error): void {
    console.error('📚 Watcher error:', error);
    this.emit('watcher-error', error);
  }

  private setupErrorHandling(): void {
    this.on('error', (error) => {
      console.error('📚 Documentation watcher error:', error);
    });

    process.on('SIGINT', async () => {
      console.log('\n📚 Received SIGINT, shutting down gracefully...');
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      console.log('\n📚 Received SIGTERM, shutting down gracefully...');
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  }

  private initializeStats(): WatcherStats {
    return {
      isRunning: false,
      filesWatched: 0,
      eventsProcessed: 0,
      jobsQueued: 0,
      jobsProcessing: 0,
      jobsCompleted: 0,
      jobsFailed: 0,
      averageProcessingTime: 0,
      uptime: 0,
    };
  }
}

/**
 * Factory function to create a documentation watcher service
 */
export function createDocumentationWatcher(config: WatcherConfig): DocumentationWatcherService {
  return new DocumentationWatcherService(config);
}

/**
 * Default processors for common documentation patterns
 */
export const createDefaultWatcherProcessors = (): readonly FileProcessor[] => [
  {
    name: 'Markdown Documentation Processor',
    pattern: '**/*.md',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      // Extract frontmatter and content
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (frontmatterMatch) {
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated markdown documentation with frontmatter',
          metadata: {
            hasFrontmatter: true,
            wordCount: frontmatterMatch[2].split(/\s+/).length,
            headings: (content.match(/^#+\s+.+$/gm) || []).length,
          },
        });
      } else {
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated markdown documentation',
          metadata: {
            hasFrontmatter: false,
            wordCount: content.split(/\s+/).length,
            headings: (content.match(/^#+\s+.+$/gm) || []).length,
          },
        });
      }
      
      return {
        success: true,
        message: `Processed markdown file: ${filePath}`,
        changes,
      };
    },
  },

  {
    name: 'TypeScript API Documentation Processor',
    pattern: '**/*.{ts,tsx}',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      // Extract exports, interfaces, types, and JSDoc comments
      const exports = content.match(/export\s+(interface|type|class|function|const)\s+\w+/g) || [];
      const interfaces = content.match(/export\s+interface\s+\w+/g) || [];
      const types = content.match(/export\s+type\s+\w+/g) || [];
      const jsdocComments = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
      
      if (exports.length > 0) {
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated TypeScript API documentation',
          metadata: {
            exports: exports.length,
            interfaces: interfaces.length,
            types: types.length,
            jsdocComments: jsdocComments.length,
            hasAPIDecorators: content.includes('@api') || content.includes('@ApiProperty'),
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
    name: 'JSON Configuration Processor',
    pattern: '**/*.json',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      try {
        const data = JSON.parse(content);
        
        // Special handling for package.json
        if (basename(filePath) === 'package.json') {
          changes.push({
            type: 'update',
            file: filePath,
            description: 'Updated package.json configuration',
            metadata: {
              version: data.version,
              dependencies: Object.keys(data.dependencies || {}),
              devDependencies: Object.keys(data.devDependencies || {}),
              scripts: Object.keys(data.scripts || {}),
            },
          });
        }
        // OpenAPI specifications
        else if (filePath.includes('openapi') || filePath.includes('swagger') || data.openapi || data.swagger) {
          changes.push({
            type: 'update',
            file: filePath,
            description: 'Updated OpenAPI specification',
            metadata: {
              version: data.info?.version,
              title: data.info?.title,
              pathCount: Object.keys(data.paths || {}).length,
              componentCount: Object.keys(data.components?.schemas || {}).length,
            },
          });
        }
        // Generic JSON config
        else {
          changes.push({
            type: 'update',
            file: filePath,
            description: 'Updated JSON configuration',
            metadata: {
              keys: Object.keys(data),
            },
          });
        }
      } catch (error) {
        return {
          success: false,
          message: `Invalid JSON in ${filePath}: ${error}`,
          error: `JSON parsing failed: ${error}`,
        };
      }
      
      return {
        success: true,
        message: `Processed JSON file: ${filePath}`,
        changes,
      };
    },
  },

  {
    name: 'YAML Configuration Processor',
    pattern: '**/*.{yml,yaml}',
    processor: async (filePath: string, content: string): Promise<ProcessorResult> => {
      const changes: DocumentationChange[] = [];
      
      // For now, just detect if it's a configuration file
      // In production, you'd use a YAML parser
      if (content.includes('version:') || content.includes('config:') || content.includes('spec:')) {
        changes.push({
          type: 'update',
          file: filePath,
          description: 'Updated YAML configuration',
          metadata: {
            isConfiguration: true,
            lineCount: content.split('\n').length,
          },
        });
      }
      
      return {
        success: true,
        message: `Processed YAML file: ${filePath}`,
        changes,
      };
    },
  },
];

/**
 * Create default hooks for common documentation workflows
 */
export const createDefaultWatcherHooks = (): readonly WatchHook[] => [
  {
    event: 'before-process',
    handler: async (context: WatchContext) => {
      console.log(`🔄 Processing file: ${relative(process.cwd(), context.filePath)}`);
    },
  },

  {
    event: 'after-process',
    handler: async (context: WatchContext) => {
      if (context.changes && context.changes.length > 0) {
        console.log(`✅ Processed ${relative(process.cwd(), context.filePath)}: ${context.changes.length} changes`);
      }
    },
  },

  {
    event: 'error',
    handler: async (context: WatchContext) => {
      console.error(`❌ Error processing ${relative(process.cwd(), context.filePath)}:`, context.error?.message);
    },
  },
];

export { DocumentationWatcherService };
export type { WatcherConfig, WatchEvent, ProcessingJob, WatcherStats };
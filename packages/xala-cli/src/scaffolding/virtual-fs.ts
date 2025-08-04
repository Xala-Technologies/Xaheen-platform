/**
 * @fileoverview Virtual Filesystem for Safe Staging
 * @description Provides a staging environment for file operations before committing to disk
 */

import { promises as fs, accessSync, readFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { Volume, IFs } from 'memfs';
import { upath } from 'upath';
import { logger } from '../utils/logger.js';
import { VirtualFileSystem, ScaffoldingOperation, ScaffoldingError } from './types.js';

export class VirtualFS implements VirtualFileSystem {
  private readonly volume: Volume;
  private readonly memFs: IFs;
  private readonly operations: ScaffoldingOperation[] = [];
  private readonly backups: Map<string, string> = new Map();
  private readonly basePath: string;
  
  constructor(basePath: string) {
    this.basePath = upath.resolve(basePath);
    this.volume = new Volume();
    this.memFs = this.volume as unknown as IFs;
    this.volume.mkdirpSync('/');
  }

  get files(): Map<string, string> {
    const fileMap = new Map<string, string>();
    
    const addFilesToMap = (dirPath: string) => {
      try {
        const entries = this.memFs.readdirSync(dirPath) as string[];
        
        for (const entry of entries) {
          const fullPath = upath.join(dirPath, entry);
          const stat = this.memFs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            addFilesToMap(fullPath);
          } else {
            const content = this.memFs.readFileSync(fullPath, 'utf8') as string;
            const relativePath = upath.relative('/', fullPath);
            fileMap.set(relativePath, content);
          }
        }
      } catch (error) {
        // Directory might not exist or be empty
      }
    };

    addFilesToMap('/');
    return fileMap;
  }

  writeFile(path: string, content: string): void {
    const normalizedPath = this.normalizePath(path);
    const virtualPath = this.toVirtualPath(normalizedPath);
    
    // Ensure directory exists
    const dir = dirname(virtualPath);
    if (!this.memFs.existsSync(dir)) {
      this.volume.mkdirpSync(dir);
    }

    // Write to virtual filesystem
    this.memFs.writeFileSync(virtualPath, content, 'utf8');
    
    // Record operation
    this.operations.push({
      type: 'create',
      path: normalizedPath,
      content
    });

    logger.debug(`Virtual write: ${normalizedPath}`);
  }

  readFile(path: string): string | undefined {
    const normalizedPath = this.normalizePath(path);
    const virtualPath = this.toVirtualPath(normalizedPath);
    
    try {
      if (this.memFs.existsSync(virtualPath)) {
        return this.memFs.readFileSync(virtualPath, 'utf8') as string;
      }
      
      // Try reading from actual filesystem if not in virtual (sync version)
      const actualPath = this.toActualPath(normalizedPath);
      if (this.actualFileExistsSync(actualPath)) {
        const content = readFileSync(actualPath, 'utf8');
        // Cache in virtual filesystem for future reads
        this.writeFile(normalizedPath, content);
        return content;
      }
    } catch (error) {
      logger.debug(`Failed to read file ${normalizedPath}: ${error}`);
    }
    
    return undefined;
  }

  deleteFile(path: string): void {
    const normalizedPath = this.normalizePath(path);
    const virtualPath = this.toVirtualPath(normalizedPath);
    
    if (this.memFs.existsSync(virtualPath)) {
      this.memFs.unlinkSync(virtualPath);
    }
    
    // Record operation
    this.operations.push({
      type: 'delete',
      path: normalizedPath
    });

    logger.debug(`Virtual delete: ${normalizedPath}`);
  }

  hasFile(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    const virtualPath = this.toVirtualPath(normalizedPath);
    return this.memFs.existsSync(virtualPath);
  }

  async commit(): Promise<void> {
    logger.info(`Committing ${this.operations.length} operations to filesystem`);
    
    try {
      // Create backups first
      await this.createBackups();
      
      // Execute operations
      for (const operation of this.operations) {
        await this.executeOperation(operation);
      }
      
      logger.success('All operations committed successfully');
      this.clearOperations();
    } catch (error) {
      logger.error('Failed to commit operations, attempting rollback');
      await this.rollback();
      throw new ScaffoldingError(
        `Failed to commit virtual filesystem changes: ${error instanceof Error ? error.message : String(error)}`,
        'VFS_COMMIT_FAILED'
      );
    }
  }

  rollback(): void {
    logger.info('Rolling back virtual filesystem changes');
    
    try {
      // Restore from backups
      for (const [path, content] of this.backups) {
        try {
          fs.writeFile(path, content, 'utf8');
        } catch (error) {
          logger.warn(`Failed to restore backup for ${path}: ${error}`);
        }
      }
      
      this.clearOperations();
      this.backups.clear();
      logger.success('Rollback completed');
    } catch (error) {
      logger.error(`Rollback failed: ${error}`);
      throw new ScaffoldingError(
        `Failed to rollback virtual filesystem changes: ${error instanceof Error ? error.message : String(error)}`,
        'VFS_ROLLBACK_FAILED'
      );
    }
  }

  // ===== ADVANCED OPERATIONS =====

  async copyFile(source: string, destination: string): Promise<void> {
    const content = this.readFile(source);
    if (content === undefined) {
      throw new ScaffoldingError(`Source file not found: ${source}`, 'FILE_NOT_FOUND');
    }
    this.writeFile(destination, content);
  }

  async moveFile(source: string, destination: string): Promise<void> {
    await this.copyFile(source, destination);
    this.deleteFile(source);
  }

  async createDirectory(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path);
    const virtualPath = this.toVirtualPath(normalizedPath);
    
    if (!this.memFs.existsSync(virtualPath)) {
      this.volume.mkdirpSync(virtualPath);
    }
  }

  listFiles(directory: string = '/'): readonly string[] {
    const virtualPath = this.toVirtualPath(directory);
    
    try {
      const entries = this.memFs.readdirSync(virtualPath) as string[];
      const files: string[] = [];
      
      for (const entry of entries) {
        const fullPath = upath.join(virtualPath, entry);
        const stat = this.memFs.statSync(fullPath);
        
        if (stat.isFile()) {
          const relativePath = upath.relative('/', fullPath);
          files.push(this.fromVirtualPath(relativePath));
        }
      }
      
      return files;
    } catch (error) {
      return [];
    }
  }

  async getDiff(): Promise<readonly string[]> {
    const diffs: string[] = [];
    
    for (const operation of this.operations) {
      switch (operation.type) {
        case 'create':
          diffs.push(`+ ${operation.path}`);
          break;
        case 'delete':
          diffs.push(`- ${operation.path}`);
          break;
        case 'update':
          diffs.push(`~ ${operation.path}`);
          break;
      }
    }
    
    return diffs;
  }

  // ===== PRIVATE METHODS =====

  private normalizePath(path: string): string {
    return upath.normalize(path);
  }

  private toVirtualPath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    return '/' + path;
  }

  private fromVirtualPath(virtualPath: string): string {
    return virtualPath.startsWith('/') ? virtualPath.slice(1) : virtualPath;
  }

  private toActualPath(path: string): string {
    return upath.resolve(this.basePath, path);
  }

  private async actualFileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private actualFileExistsSync(path: string): boolean {
    try {
      accessSync(path);
      return true;
    } catch {
      return false;
    }
  }

  private async createBackups(): Promise<void> {
    for (const operation of this.operations) {
      if (operation.type === 'create' || operation.type === 'update') {
        const actualPath = this.toActualPath(operation.path);
        
        try {
          if (await this.actualFileExists(actualPath)) {
            const content = await fs.readFile(actualPath, 'utf8');
            this.backups.set(actualPath, content);
          }
        } catch (error) {
          logger.debug(`Failed to create backup for ${actualPath}: ${error}`);
        }
      }
    }
  }

  private async executeOperation(operation: ScaffoldingOperation): Promise<void> {
    const actualPath = this.toActualPath(operation.path);
    
    switch (operation.type) {
      case 'create':
        if (operation.content !== undefined) {
          // Ensure directory exists
          const dir = dirname(actualPath);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(actualPath, operation.content, 'utf8');
        }
        break;
        
      case 'update':
        if (operation.content !== undefined) {
          await fs.writeFile(actualPath, operation.content, 'utf8');
        }
        break;
        
      case 'delete':
        try {
          await fs.unlink(actualPath);
        } catch (error) {
          // File might not exist, which is fine for delete operations
          logger.debug(`File already deleted or doesn't exist: ${actualPath}`);
        }
        break;
    }
  }

  private clearOperations(): void {
    this.operations.length = 0;
  }
}

/**
 * Factory function to create a new virtual filesystem
 */
export function createVirtualFS(basePath: string): VirtualFileSystem {
  return new VirtualFS(basePath);
}
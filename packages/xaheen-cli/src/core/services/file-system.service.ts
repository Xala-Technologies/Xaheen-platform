/**
 * File System Service Implementation
 * Single Responsibility: Handles all file system operations
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { IFileSystem, ILogger } from '../interfaces/index.js';

export class FileSystemService implements IFileSystem {
  constructor(private readonly logger: ILogger) {}

  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await this.ensureDirectory(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
      this.logger.success(`Generated: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }

  public async ensureDirectory(dirPath: string): Promise<void> {
    try {
      const exists = await this.exists(dirPath);
      if (!exists) {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.info(`Created directory: ${dirPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create directory: ${dirPath}`, error);
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }

  public async copyFile(source: string, destination: string): Promise<void> {
    try {
      await this.ensureDirectory(path.dirname(destination));
      await fs.copyFile(source, destination);
      this.logger.info(`Copied file: ${source} -> ${destination}`);
    } catch (error) {
      this.logger.error(`Failed to copy file: ${source} -> ${destination}`, error);
      throw new Error(`Failed to copy file: ${source} -> ${destination}`);
    }
  }

  public async listFiles(dirPath: string, pattern?: RegExp): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      let result = files
        .filter(file => file.isFile())
        .map(file => path.join(dirPath, file.name));

      if (pattern) {
        result = result.filter(file => pattern.test(file));
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to list files in: ${dirPath}`, error);
      throw new Error(`Failed to list files in: ${dirPath}`);
    }
  }
}

export class MockFileSystemService implements IFileSystem {
  private readonly files = new Map<string, string>();
  private readonly directories = new Set<string>();

  constructor(private readonly logger: ILogger) {}

  public async exists(filePath: string): Promise<boolean> {
    return this.files.has(filePath) || this.directories.has(filePath);
  }

  public async readFile(filePath: string): Promise<string> {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`File not found: ${filePath}`);
    }
    return content;
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    this.files.set(filePath, content);
    this.logger.success(`Generated: ${filePath}`);
  }

  public async ensureDirectory(dirPath: string): Promise<void> {
    this.directories.add(dirPath);
    this.logger.info(`Created directory: ${dirPath}`);
  }

  public async deleteFile(filePath: string): Promise<void> {
    this.files.delete(filePath);
    this.logger.info(`Deleted file: ${filePath}`);
  }

  public getFiles(): Map<string, string> {
    return new Map(this.files);
  }

  public clear(): void {
    this.files.clear();
    this.directories.clear();
  }
}
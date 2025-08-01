import { promises as fs, constants } from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { logger } from './logger.js';

// Check if file exists
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Check if directory exists
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

// Safe file reading with encoding detection
export async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  try {
    const content = await fs.readFile(filePath, encoding);
    return content;
  } catch (error) {
    logger.error(`Failed to read file: ${filePath}`, error);
    throw error;
  }
}

// Atomic file writing with temp files
export async function writeFile(filePath: string, content: string, options?: { backup?: boolean }): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const backupPath = `${filePath}.backup`;
  
  try {
    // Create backup if requested
    if (options?.backup && await fileExists(filePath)) {
      await fs.copyFile(filePath, backupPath);
    }
    
    // Write to temp file first
    await fs.writeFile(tempPath, content, 'utf-8');
    
    // Atomic rename
    await fs.rename(tempPath, filePath);
    
    logger.debug(`File written: ${filePath}`);
  } catch (error) {
    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {});
    
    logger.error(`Failed to write file: ${filePath}`, error);
    throw error;
  }
}

// Create directory with parent directories
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug(`Directory ensured: ${dirPath}`);
  } catch (error) {
    logger.error(`Failed to create directory: ${dirPath}`, error);
    throw error;
  }
}

// Copy file with permission preservation
export async function copyFile(src: string, dest: string, options?: { overwrite?: boolean }): Promise<void> {
  try {
    // Check if destination exists
    if (!options?.overwrite && await fileExists(dest)) {
      throw new Error(`File already exists: ${dest}`);
    }
    
    // Ensure destination directory exists
    await ensureDir(path.dirname(dest));
    
    // Copy file preserving permissions
    await fs.copyFile(src, dest, options?.overwrite ? 0 : constants.COPYFILE_EXCL);
    
    // Copy file stats (permissions, timestamps)
    const stats = await fs.stat(src);
    await fs.chmod(dest, stats.mode);
    await fs.utimes(dest, stats.atime, stats.mtime);
    
    logger.debug(`File copied: ${src} -> ${dest}`);
  } catch (error) {
    logger.error(`Failed to copy file: ${src} -> ${dest}`, error);
    throw error;
  }
}

// Copy directory recursively
export async function copyDirectory(src: string, dest: string, options?: { overwrite?: boolean; filter?: (path: string) => boolean }): Promise<void> {
  try {
    await ensureDir(dest);
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // Apply filter if provided
      if (options?.filter && !options.filter(srcPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath, options);
      } else {
        await copyFile(srcPath, destPath, options);
      }
    }
    
    logger.debug(`Directory copied: ${src} -> ${dest}`);
  } catch (error) {
    logger.error(`Failed to copy directory: ${src} -> ${dest}`, error);
    throw error;
  }
}

// Template variable replacement
export async function processTemplate(
  templatePath: string,
  outputPath: string,
  variables: Record<string, any>
): Promise<void> {
  try {
    let content = await readFile(templatePath);
    
    // Replace variables in the format {{variable}}
    content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        return String(variables[key]);
      }
      logger.warn(`Template variable not found: ${key}`);
      return match;
    });
    
    // Replace variables in the format <%= variable %>
    content = content.replace(/<%=\s*(\w+)\s*%>/g, (match, key) => {
      if (key in variables) {
        return String(variables[key]);
      }
      logger.warn(`Template variable not found: ${key}`);
      return match;
    });
    
    await writeFile(outputPath, content);
    logger.debug(`Template processed: ${templatePath} -> ${outputPath}`);
  } catch (error) {
    logger.error(`Failed to process template: ${templatePath}`, error);
    throw error;
  }
}

// File conflict resolution
export enum ConflictResolution {
  OVERWRITE = 'overwrite',
  SKIP = 'skip',
  BACKUP = 'backup',
  MERGE = 'merge',
}

export async function resolveFileConflict(
  filePath: string,
  newContent: string,
  resolution: ConflictResolution
): Promise<void> {
  if (!(await fileExists(filePath))) {
    await writeFile(filePath, newContent);
    return;
  }
  
  switch (resolution) {
    case ConflictResolution.OVERWRITE:
      await writeFile(filePath, newContent);
      break;
      
    case ConflictResolution.SKIP:
      logger.info(`Skipped existing file: ${filePath}`);
      break;
      
    case ConflictResolution.BACKUP:
      await writeFile(filePath, newContent, { backup: true });
      break;
      
    case ConflictResolution.MERGE:
      // TODO: Implement merge logic
      logger.warn(`Merge not implemented, using overwrite for: ${filePath}`);
      await writeFile(filePath, newContent);
      break;
  }
}

// Calculate file hash
export async function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// Find files by pattern
export async function findFiles(
  directory: string,
  pattern: RegExp | ((path: string) => boolean),
  options?: { recursive?: boolean; maxDepth?: number }
): Promise<string[]> {
  const files: string[] = [];
  const { recursive = true, maxDepth = Infinity } = options || {};
  
  async function walk(dir: string, depth = 0): Promise<void> {
    if (depth > maxDepth) return;
    
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && recursive) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const matches = typeof pattern === 'function' 
          ? pattern(fullPath)
          : pattern.test(fullPath);
          
        if (matches) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(directory);
  return files;
}

// Remove directory recursively
export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    logger.debug(`Directory removed: ${dirPath}`);
  } catch (error) {
    logger.error(`Failed to remove directory: ${dirPath}`, error);
    throw error;
  }
}

// Get directory size
export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;
  
  async function calculateSize(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await calculateSize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
      }
    }
  }
  
  await calculateSize(dirPath);
  return totalSize;
}
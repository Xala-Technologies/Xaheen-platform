/**
 * ESM Compatibility Utilities
 * 
 * Provides polyfills for CommonJS globals in ESM environment
 * 
 * @author Xaheen CLI
 * @since 2025-01-06
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get the directory name of the current module (ESM equivalent of __dirname)
 * 
 * @param importMetaUrl - import.meta.url from the calling module
 * @returns The directory path of the current module
 */
export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * Get the file name of the current module (ESM equivalent of __filename)
 * 
 * @param importMetaUrl - import.meta.url from the calling module
 * @returns The file path of the current module
 */
export function getFilename(importMetaUrl: string): string {
  return fileURLToPath(importMetaUrl);
}

/**
 * For environments that don't support import.meta.url, this provides a fallback
 * Note: This should only be used in development/testing environments
 */
export function createDirnameFallback(currentFilePath: string): string {
  return dirname(currentFilePath);
}

// Legacy CommonJS compatibility for existing code
// These should be gradually replaced with the functions above
export const __dirname = process.cwd(); // Fallback for environments without proper ESM support
export const __filename = process.argv[1]; // Fallback for environments without proper ESM support
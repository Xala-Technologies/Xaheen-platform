/**
 * Template Cache System for improved performance
 * Inspired by shadcn-ui MCP server's caching approach
 */

import { promises as fs } from 'fs';
import path from 'path';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expires: number;
}

interface TemplateMetadata {
  path: string;
  lastModified: number;
  size: number;
  checksum?: string;
}

export class TemplateCache {
  private cache = new Map<string, CacheEntry>();
  private templateMetadata = new Map<string, TemplateMetadata>();
  private defaultTTL = 1000 * 60 * 15; // 15 minutes default TTL
  
  constructor(private baseCachePath?: string) {
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 1000 * 60 * 5); // Cleanup every 5 minutes
  }

  /**
   * Get cached item with TTL and file modification checks
   */
  async get<T>(key: string, filePath?: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.templateMetadata.delete(key);
      return null;
    }
    
    // If file path provided, check if file has been modified
    if (filePath) {
      const isStale = await this.isFileStale(key, filePath);
      if (isStale) {
        this.cache.delete(key);
        this.templateMetadata.delete(key);
        return null;
      }
    }
    
    return entry.data as T;
  }

  /**
   * Set cache entry with optional TTL
   */
  async set<T>(key: string, data: T, ttl?: number, filePath?: string): Promise<void> {
    const expires = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires
    });
    
    // Store file metadata if path provided
    if (filePath) {
      await this.updateFileMetadata(key, filePath);
    }
  }

  /**
   * Check if a file has been modified since caching
   */
  private async isFileStale(key: string, filePath: string): Promise<boolean> {
    try {
      const metadata = this.templateMetadata.get(key);
      if (!metadata) {
        return true; // No metadata means we should refresh
      }
      
      const stats = await fs.stat(filePath);
      return stats.mtime.getTime() > metadata.lastModified;
    } catch {
      return true; // If we can't stat the file, consider it stale
    }
  }

  /**
   * Update file metadata for cache invalidation
   */
  private async updateFileMetadata(key: string, filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      this.templateMetadata.set(key, {
        path: filePath,
        lastModified: stats.mtime.getTime(),
        size: stats.size
      });
    } catch {
      // Ignore errors when updating metadata
    }
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    this.templateMetadata.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.templateMetadata.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; expires: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      expires: entry.expires
    }));
    
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      entries
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => {
      this.cache.delete(key);
      this.templateMetadata.delete(key);
    });
    
    if (toDelete.length > 0) {
      console.log(`TemplateCache: Cleaned up ${toDelete.length} expired entries`);
    }
  }

  /**
   * Warm up cache with commonly used templates
   */
  async warmUp(templatePaths: Array<{ key: string; path: string; loader: () => Promise<any> }>): Promise<void> {
    console.log(`TemplateCache: Warming up cache with ${templatePaths.length} templates...`);
    
    const promises = templatePaths.map(async ({ key, path: filePath, loader }) => {
      try {
        const data = await loader();
        await this.set(key, data, undefined, filePath);
      } catch (error) {
        console.error(`TemplateCache: Failed to warm up ${key}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
    console.log(`TemplateCache: Warm up completed. Cache size: ${this.cache.size}`);
  }

  /**
   * Create a cache key from multiple parameters
   */
  static createKey(...parts: (string | number | boolean | undefined | null)[]): string {
    return parts
      .filter(part => part !== undefined && part !== null)
      .map(part => String(part).toLowerCase())
      .join(':');
  }
}

// Singleton instance
export const templateCache = new TemplateCache();

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache a function result with automatic key generation
   */
  async memoize<T>(
    fn: () => Promise<T>,
    keyParts: (string | number | boolean)[],
    ttl?: number,
    filePath?: string
  ): Promise<T> {
    const key = TemplateCache.createKey(...keyParts);
    
    // Try to get from cache first
    const cached = await templateCache.get<T>(key, filePath);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function and cache result
    const result = await fn();
    await templateCache.set(key, result, ttl, filePath);
    
    return result;
  },

  /**
   * Cache template content with file path validation
   */
  async cacheTemplate(
    templatePath: string,
    loader: () => Promise<string>,
    ttl?: number
  ): Promise<string> {
    const key = TemplateCache.createKey('template', templatePath);
    return cacheUtils.memoize(loader, ['template', templatePath], ttl, templatePath);
  },

  /**
   * Cache component metadata
   */
  async cacheMetadata<T>(
    componentName: string,
    platform: string,
    loader: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return cacheUtils.memoize(
      loader,
      ['metadata', componentName, platform],
      ttl
    );
  }
};
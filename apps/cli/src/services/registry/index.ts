/**
 * Service Registry System Exports
 * 
 * Main entry point for the enhanced service registry system.
 * Provides comprehensive service management capabilities for the Xaheen platform.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

// Core implementations
export * from './core';

// Schema definitions
export * from './schemas';

// Interface definitions
export * from './interfaces';

// Utility functions
export * from './utils';

// Default registry instance factory
import { EnhancedServiceRegistry } from './core/enhanced-service-registry';

/**
 * Create a new enhanced service registry instance
 */
export function createServiceRegistry(
  basePath?: string,
  options?: {
    enableAnalytics?: boolean;
    enableCache?: boolean;
    autoBackup?: boolean;
    backupInterval?: number;
  }
): EnhancedServiceRegistry {
  return new EnhancedServiceRegistry(basePath, options);
}

/**
 * Create a default service registry instance with standard configuration
 */
export function createDefaultServiceRegistry(): EnhancedServiceRegistry {
  return createServiceRegistry(undefined, {
    enableAnalytics: true,
    enableCache: true,
    autoBackup: true,
    backupInterval: 24 * 60 * 60 * 1000 // 24 hours
  });
}
/**
 * Service Registry Utilities
 * 
 * Utility functions and helpers for the service registry system.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

export * from './service-id-generator';
export * from './template-validator';
export * from './dependency-analyzer';
export * from './compatibility-checker';

// Re-export utility from the existing services/utils for backward compatibility
export { generateId } from '../../utils/id-generator';
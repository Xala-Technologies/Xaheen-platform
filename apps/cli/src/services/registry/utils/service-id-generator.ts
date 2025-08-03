/**
 * Service ID Generator Utility
 * 
 * Generates unique, deterministic, and human-readable service identifiers.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import { createHash } from 'node:crypto';
import type { ServiceType } from '../schemas';

/**
 * Generate a unique service ID based on type and provider
 */
export function generateServiceId(type: ServiceType, provider: string, version?: string): string {
  const base = `${type}-${provider}`;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (version) {
    return `${base}-${version}-${timestamp}-${random}`;
  }
  
  return `${base}-${timestamp}-${random}`;
}

/**
 * Generate a deterministic service ID based on content hash
 */
export function generateDeterministicServiceId(
  type: ServiceType,
  provider: string,
  content: Record<string, unknown>
): string {
  const contentString = JSON.stringify(content, Object.keys(content).sort());
  const hash = createHash('sha256').update(contentString).digest('hex').substring(0, 12);
  
  return `${type}-${provider}-${hash}`;
}

/**
 * Generate a template ID
 */
export function generateTemplateId(
  type: ServiceType,
  provider: string,
  version?: string
): string {
  const base = `template-${type}-${provider}`;
  const timestamp = Date.now();
  
  if (version) {
    const versionHash = createHash('md5').update(version).digest('hex').substring(0, 8);
    return `${base}-${versionHash}-${timestamp}`;
  }
  
  return `${base}-${timestamp}`;
}

/**
 * Generate a bundle ID
 */
export function generateBundleId(name: string, version?: string): string {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const timestamp = Date.now();
  
  if (version) {
    const versionHash = createHash('md5').update(version).digest('hex').substring(0, 8);
    return `bundle-${sanitizedName}-${versionHash}-${timestamp}`;
  }
  
  return `bundle-${sanitizedName}-${timestamp}`;
}

/**
 * Generate a metadata ID
 */
export function generateMetadataId(serviceId: string): string {
  return `metadata-${serviceId}`;
}

/**
 * Generate an analytics ID
 */
export function generateAnalyticsId(serviceId: string): string {
  return `analytics-${serviceId}`;
}

/**
 * Parse service ID to extract components
 */
export function parseServiceId(serviceId: string): {
  type?: ServiceType;
  provider?: string;
  version?: string;
  timestamp?: number;
  hash?: string;
} | null {
  // Pattern for standard service ID: type-provider-version?-timestamp-random
  const standardPattern = /^([^-]+)-([^-]+)(?:-([^-]+))?-(\d+)-([a-z0-9]+)$/;
  const match = serviceId.match(standardPattern);
  
  if (match) {
    const [, type, provider, version, timestamp, hash] = match;
    return {
      type: type as ServiceType,
      provider,
      version: version !== timestamp ? version : undefined,
      timestamp: parseInt(timestamp),
      hash
    };
  }
  
  // Pattern for deterministic service ID: type-provider-hash
  const deterministicPattern = /^([^-]+)-([^-]+)-([a-f0-9]{12})$/;
  const deterministicMatch = serviceId.match(deterministicPattern);
  
  if (deterministicMatch) {
    const [, type, provider, hash] = deterministicMatch;
    return {
      type: type as ServiceType,
      provider,
      hash
    };
  }
  
  return null;
}

/**
 * Validate service ID format
 */
export function isValidServiceId(serviceId: string): boolean {
  return parseServiceId(serviceId) !== null;
}

/**
 * Generate a short service ID for display purposes
 */
export function generateShortServiceId(serviceId: string): string {
  const parsed = parseServiceId(serviceId);
  if (parsed && parsed.type && parsed.provider) {
    return `${parsed.type}:${parsed.provider}`;
  }
  
  // Fallback to first 12 characters
  return serviceId.substring(0, 12);
}

/**
 * Generate a human-readable service name
 */
export function generateServiceDisplayName(
  type: ServiceType,
  provider: string,
  version?: string
): string {
  const typeFormatted = type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const providerFormatted = provider.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  if (version) {
    return `${typeFormatted} (${providerFormatted} v${version})`;
  }
  
  return `${typeFormatted} (${providerFormatted})`;
}
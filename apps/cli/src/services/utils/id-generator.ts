/**
 * ID Generator Utility
 * Generates unique identifiers for services and fragments
 */

import { randomBytes } from "node:crypto";

/**
 * Generate a unique ID
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  const id = `${timestamp}-${random}`;
  
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate a service ID
 */
export function generateServiceId(serviceType: string, provider: string): string {
  return generateId(`${serviceType}-${provider}`);
}

/**
 * Generate a fragment ID
 */
export function generateFragmentId(fragmentType: string, name: string): string {
  return generateId(`${fragmentType}-${name}`);
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  // Simple validation - IDs should be non-empty strings with reasonable length
  return typeof id === "string" && id.length > 0 && id.length <= 100;
}
/**
 * Service Registry Definitions Index
 * 
 * Centralized index of all enhanced service definitions for the Xaheen platform.
 * Provides easy discovery and loading of service templates.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from 'node:path';
import fs from 'fs-extra';
import type { ServiceTemplateEnhanced, ServiceType } from '../schemas';

/**
 * Service definition categories and their available services
 */
export const SERVICE_CATEGORIES = {
  // Authentication & Authorization
  auth: ['better-auth', 'clerk'],
  rbac: ['casbin'],
  
  // Payment & Billing
  payment: ['stripe'],
  billing: ['stripe'],
  
  // Communication & Notifications
  notification: ['resend'],
  email: ['resend'],
  
  // Data & Storage
  database: ['postgresql'],
  cache: ['redis'],
  
  // Monitoring & Analytics
  analytics: ['posthog'],
  monitoring: ['sentry'],
  
  // Infrastructure & DevOps
  'error-tracking': ['sentry'],
  'session-store': ['redis'],
  'message-broker': ['redis']
} as const;

/**
 * Service type to category mapping
 */
export const SERVICE_TYPE_CATEGORIES: Record<ServiceType, string> = {
  // Core Infrastructure
  'database': 'data-storage',
  'cache': 'data-storage',
  'storage': 'data-storage',
  'messaging': 'communication',
  'api': 'integration',
  
  // Authentication & Authorization
  'auth': 'security',
  'rbac': 'security',
  'session': 'security',
  'oauth': 'security',
  'mfa': 'security',
  
  // Business & Financial
  'payment': 'business',
  'billing': 'business',
  'subscription': 'business',
  'invoice': 'business',
  'accounting': 'business',
  
  // Communication
  'notification': 'communication',
  'email': 'communication',
  'sms': 'communication',
  'push': 'communication',
  'webhook': 'communication',
  
  // Monitoring & Analytics
  'analytics': 'observability',
  'monitoring': 'observability',
  'logging': 'observability',
  'error-tracking': 'observability',
  'performance': 'observability',
  'health-check': 'observability',
  
  // Multi-tenancy
  'tenant-management': 'multi-tenancy',
  'tenant-isolation': 'multi-tenancy',
  'tenant-provisioning': 'multi-tenancy',
  
  // Content & Media
  'cdn': 'content',
  'file-upload': 'content',
  'image-processing': 'content',
  'video-streaming': 'content',
  
  // Search & Discovery
  'search': 'data-processing',
  'indexing': 'data-processing',
  'recommendation': 'data-processing',
  
  // Compliance & Security
  'gdpr': 'compliance',
  'audit': 'compliance',
  'encryption': 'security',
  'backup': 'operations',
  'security': 'security',
  
  // Integration
  'crm': 'integration',
  'erp': 'integration',
  'accounting-software': 'integration',
  'third-party-api': 'integration',
  
  // DevOps
  'ci-cd': 'devops',
  'containerization': 'devops',
  'orchestration': 'devops',
  'scaling': 'devops',
  
  // Norwegian Compliance
  'altinn': 'norwegian-compliance',
  'bankid': 'norwegian-compliance',
  'vipps': 'norwegian-compliance',
  'nsm-compliance': 'norwegian-compliance',
  
  // AI & ML
  'ai-assistant': 'ai-ml',
  'ml-pipeline': 'ai-ml',
  'data-processing': 'ai-ml',
  'recommendation-engine': 'ai-ml'
};

/**
 * Essential SaaS service bundles
 */
export const SAAS_ESSENTIAL_SERVICES = {
  'minimal': [
    'auth/better-auth',
    'database/postgresql',
    'notification/resend'
  ],
  'starter': [
    'auth/better-auth',
    'database/postgresql',
    'payment/stripe',
    'notification/resend',
    'analytics/posthog',
    'monitoring/sentry'
  ],
  'professional': [
    'auth/better-auth',
    'rbac/casbin',
    'database/postgresql',
    'cache/redis',
    'payment/stripe',
    'notification/resend',
    'analytics/posthog',
    'monitoring/sentry'
  ],
  'enterprise': [
    'auth/clerk',
    'rbac/casbin',
    'database/postgresql',
    'cache/redis',
    'payment/stripe',
    'notification/resend',
    'analytics/posthog',
    'monitoring/sentry'
  ]
} as const;

/**
 * Framework compatibility matrix
 */
export const FRAMEWORK_COMPATIBILITY = {
  'next': ['auth/better-auth', 'auth/clerk', 'payment/stripe', 'notification/resend', 'database/postgresql', 'cache/redis', 'analytics/posthog', 'monitoring/sentry', 'rbac/casbin'],
  'react': ['auth/better-auth', 'auth/clerk', 'payment/stripe', 'notification/resend', 'analytics/posthog', 'monitoring/sentry', 'rbac/casbin'],
  'svelte': ['auth/better-auth', 'payment/stripe', 'notification/resend', 'analytics/posthog', 'monitoring/sentry'],
  'vue': ['analytics/posthog', 'monitoring/sentry'],
  'node': ['database/postgresql', 'cache/redis', 'notification/resend', 'monitoring/sentry', 'rbac/casbin'],
  'express': ['database/postgresql', 'cache/redis', 'notification/resend', 'monitoring/sentry', 'rbac/casbin']
} as const;

/**
 * Load a service definition by type and provider
 */
export async function loadServiceDefinition(
  type: string,
  provider: string
): Promise<ServiceTemplateEnhanced | null> {
  try {
    const definitionPath = path.join(__dirname, type, `${provider}.json`);
    
    if (!(await fs.pathExists(definitionPath))) {
      return null;
    }
    
    const definition = await fs.readJson(definitionPath);
    return definition as ServiceTemplateEnhanced;
  } catch (error) {
    console.error(`Failed to load service definition ${type}/${provider}:`, error);
    return null;
  }
}

/**
 * Load all service definitions from a category
 */
export async function loadServicesByCategory(category: string): Promise<ServiceTemplateEnhanced[]> {
  const services: ServiceTemplateEnhanced[] = [];
  const categoryServices = SERVICE_CATEGORIES[category as keyof typeof SERVICE_CATEGORIES];
  
  if (!categoryServices) {
    return services;
  }
  
  for (const provider of categoryServices) {
    const definition = await loadServiceDefinition(category, provider);
    if (definition) {
      services.push(definition);
    }
  }
  
  return services;
}

/**
 * Load all available service definitions
 */
export async function loadAllServiceDefinitions(): Promise<ServiceTemplateEnhanced[]> {
  const services: ServiceTemplateEnhanced[] = [];
  
  for (const [category, providers] of Object.entries(SERVICE_CATEGORIES)) {
    for (const provider of providers) {
      const definition = await loadServiceDefinition(category, provider);
      if (definition) {
        services.push(definition);
      }
    }
  }
  
  return services;
}

/**
 * Get services compatible with a specific framework
 */
export function getFrameworkCompatibleServices(framework: string): string[] {
  return FRAMEWORK_COMPATIBILITY[framework as keyof typeof FRAMEWORK_COMPATIBILITY] || [];
}

/**
 * Get recommended service bundle for SaaS application type
 */
export function getRecommendedServiceBundle(bundleType: keyof typeof SAAS_ESSENTIAL_SERVICES): string[] {
  return [...SAAS_ESSENTIAL_SERVICES[bundleType]];
}

/**
 * Search services by keywords or tags
 */
export async function searchServices(
  query: string,
  options?: {
    category?: string;
    framework?: string;
    tags?: string[];
  }
): Promise<ServiceTemplateEnhanced[]> {
  const allServices = await loadAllServiceDefinitions();
  const queryLower = query.toLowerCase();
  
  return allServices.filter(service => {
    // Text search
    const matchesQuery = 
      service.name.toLowerCase().includes(queryLower) ||
      service.displayName.toLowerCase().includes(queryLower) ||
      service.description.toLowerCase().includes(queryLower) ||
      service.keywords.some(keyword => keyword.toLowerCase().includes(queryLower));
    
    if (!matchesQuery) return false;
    
    // Category filter
    if (options?.category) {
      const serviceCategory = SERVICE_TYPE_CATEGORIES[service.type];
      if (serviceCategory !== options.category) return false;
    }
    
    // Framework filter
    if (options?.framework) {
      const compatibleServices = getFrameworkCompatibleServices(options.framework);
      const serviceKey = `${service.type}/${service.provider}`;
      if (!compatibleServices.includes(serviceKey)) return false;
    }
    
    // Tags filter
    if (options?.tags && options.tags.length > 0) {
      const hasMatchingTag = options.tags.some(tag => 
        service.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
}

/**
 * Get service definition file paths for all services
 */
export function getServiceDefinitionPaths(): Record<string, string> {
  const paths: Record<string, string> = {};
  
  for (const [category, providers] of Object.entries(SERVICE_CATEGORIES)) {
    for (const provider of providers) {
      const key = `${category}/${provider}`;
      paths[key] = path.join(__dirname, category, `${provider}.json`);
    }
  }
  
  return paths;
}

/**
 * Validate service definition structure
 */
export async function validateServiceDefinition(
  definition: unknown
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (!definition || typeof definition !== 'object') {
    errors.push('Service definition must be an object');
    return { valid: false, errors };
  }
  
  const service = definition as any;
  
  // Required fields validation
  const requiredFields = ['id', 'name', 'type', 'provider', 'version', 'description'];
  for (const field of requiredFields) {
    if (!service[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Type validation
  if (service.type && !Object.keys(SERVICE_TYPE_CATEGORIES).includes(service.type)) {
    errors.push(`Invalid service type: ${service.type}`);
  }
  
  // Arrays validation
  const arrayFields = ['frameworks', 'platforms', 'injectionPoints', 'envVariables', 'dependencies'];
  for (const field of arrayFields) {
    if (service[field] && !Array.isArray(service[field])) {
      errors.push(`${field} must be an array`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Export service metadata for runtime access
export const SERVICE_METADATA = {
  categories: SERVICE_CATEGORIES,
  typeCategories: SERVICE_TYPE_CATEGORIES,
  essentialBundles: SAAS_ESSENTIAL_SERVICES,
  frameworkCompatibility: FRAMEWORK_COMPATIBILITY
} as const;
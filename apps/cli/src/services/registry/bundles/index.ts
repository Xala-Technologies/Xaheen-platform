/**
 * Service Bundle Definitions Index
 * 
 * Centralized index of all service bundle definitions for SaaS applications.
 * Provides easy discovery and loading of predefined service combinations.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from 'node:path';
import fs from 'fs-extra';
import type { ServiceBundle, BundleType } from '../schemas';

/**
 * Available SaaS bundle types
 */
export const SAAS_BUNDLE_TYPES = {
  'saas-starter': {
    name: 'SaaS Starter',
    description: 'Essential services for launching a basic SaaS application',
    serviceCount: 3,
    complexity: 'simple',
    targetAudience: 'indie-hackers',
    estimatedSetupTime: '30 minutes'
  },
  'saas-professional': {
    name: 'SaaS Professional',
    description: 'Comprehensive services for scaling SaaS applications',
    serviceCount: 8,
    complexity: 'moderate',
    targetAudience: 'small-teams',
    estimatedSetupTime: '2 hours'
  },
  'saas-enterprise': {
    name: 'SaaS Enterprise',
    description: 'Enterprise-grade platform with advanced compliance',
    serviceCount: 8,
    complexity: 'complex',
    targetAudience: 'enterprises',
    estimatedSetupTime: '1 day'
  },
  'fintech-saas': {
    name: 'FinTech SaaS',
    description: 'Financial technology platform with banking-grade security',
    serviceCount: 9,
    complexity: 'complex',
    targetAudience: 'fintech-companies',
    estimatedSetupTime: '2 days'
  },
  'marketplace-saas': {
    name: 'Marketplace SaaS',
    description: 'Multi-vendor marketplace with commission tracking',
    serviceCount: 10,
    complexity: 'complex',
    targetAudience: 'platform-businesses',
    estimatedSetupTime: '1.5 days'
  },
  'healthcare-saas': {
    name: 'Healthcare SaaS',
    description: 'HIPAA-compliant healthcare platform with EHR capabilities',
    serviceCount: 9,
    complexity: 'complex',
    targetAudience: 'healthcare-providers',
    estimatedSetupTime: '3 days'
  }
} as const;

/**
 * Bundle comparison matrix
 */
export const BUNDLE_COMPARISON = {
  features: {
    'Authentication': {
      'saas-starter': 'Basic email/password',
      'saas-professional': 'OAuth + MFA',
      'saas-enterprise': 'Enterprise SSO + Organizations'
    },
    'Database': {
      'saas-starter': 'PostgreSQL basic',
      'saas-professional': 'PostgreSQL + read replicas',
      'saas-enterprise': 'PostgreSQL cluster + partitioning'
    },
    'Payments': {
      'saas-starter': 'Not included',
      'saas-professional': 'Stripe subscriptions',
      'saas-enterprise': 'Stripe Connect + marketplace'
    },
    'Authorization': {
      'saas-starter': 'Basic user roles',
      'saas-professional': 'RBAC with multi-tenant',
      'saas-enterprise': 'Advanced RBAC + ABAC'
    },
    'Caching': {
      'saas-starter': 'Not included',
      'saas-professional': 'Redis with session store',
      'saas-enterprise': 'Redis cluster + Sentinel'
    },
    'Monitoring': {
      'saas-starter': 'Optional Sentry',
      'saas-professional': 'Full monitoring stack',
      'saas-enterprise': 'Enterprise monitoring + compliance'
    },
    'Compliance': {
      'saas-starter': 'Basic GDPR',
      'saas-professional': 'GDPR + PCI-DSS + SOC2',
      'saas-enterprise': 'Full compliance suite + audit'
    },
    'Norwegian Integrations': {
      'saas-starter': 'Not included',
      'saas-professional': 'Not included',
      'saas-enterprise': 'BankID + Vipps + Altinn'
    }
  },
  pricing: {
    'saas-starter': {
      setup: 'Free',
      monthly: '$0-50',
      users: 'Up to 1,000'
    },
    'saas-professional': {
      setup: 'Free',
      monthly: '$100-500',
      users: 'Up to 10,000'
    },
    'saas-enterprise': {
      setup: 'Custom',
      monthly: '$1,000+',
      users: 'Unlimited'
    }
  }
} as const;

/**
 * Bundle recommendations based on use case
 */
export const BUNDLE_RECOMMENDATIONS = {
  'mvp-launch': {
    recommended: 'saas-starter',
    reason: 'Perfect for validating your SaaS idea with minimal complexity',
    alternatives: []
  },
  'growing-business': {
    recommended: 'saas-professional',
    reason: 'Comprehensive features for scaling your validated SaaS business',
    alternatives: ['saas-starter']
  },
  'enterprise-deployment': {
    recommended: 'saas-enterprise',
    reason: 'Enterprise-grade security, compliance, and multi-tenancy',
    alternatives: ['saas-professional']
  },
  'norwegian-market': {
    recommended: 'saas-enterprise',
    reason: 'Includes BankID, Vipps, and Altinn integrations for Norwegian market',
    alternatives: ['saas-professional']
  },
  'fintech-application': {
    recommended: 'saas-enterprise',
    reason: 'Advanced compliance features required for financial services',
    alternatives: []
  },
  'b2b-saas': {
    recommended: 'saas-professional',
    reason: 'Multi-tenant RBAC and team management features',
    alternatives: ['saas-enterprise']
  },
  'marketplace': {
    recommended: 'saas-enterprise',
    reason: 'Stripe Connect and advanced multi-tenancy for marketplace model',
    alternatives: ['saas-professional']
  }
} as const;

/**
 * Framework compatibility for bundles
 */
export const BUNDLE_FRAMEWORK_COMPATIBILITY = {
  'saas-starter': ['next', 'react'],
  'saas-professional': ['next', 'react'],
  'saas-enterprise': ['next']
} as const;

/**
 * Load a service bundle by name
 */
export async function loadServiceBundle(bundleName: string): Promise<ServiceBundle | null> {
  try {
    const bundlePath = path.join(__dirname, `${bundleName}.json`);
    
    if (!(await fs.pathExists(bundlePath))) {
      return null;
    }
    
    const bundle = await fs.readJson(bundlePath);
    return bundle as ServiceBundle;
  } catch (error) {
    console.error(`Failed to load service bundle ${bundleName}:`, error);
    return null;
  }
}

/**
 * Load all available service bundles
 */
export async function loadAllServiceBundles(): Promise<ServiceBundle[]> {
  const bundles: ServiceBundle[] = [];
  
  // Load all standard SaaS bundles
  for (const bundleName of Object.keys(SAAS_BUNDLE_TYPES)) {
    const bundle = await loadServiceBundle(bundleName);
    if (bundle) {
      bundles.push(bundle);
    }
  }
  
  return bundles;
}

/**
 * Load specialized service bundles by category
 */
export async function loadBundlesByCategory(category: string): Promise<ServiceBundle[]> {
  const categoryBundles: Record<string, string[]> = {
    'saas': ['saas-starter', 'saas-professional', 'saas-enterprise'],
    'fintech': ['fintech-saas'],
    'marketplace': ['marketplace-saas'],
    'healthcare': ['healthcare-saas'],
    'enterprise': ['saas-enterprise', 'fintech-saas', 'healthcare-saas'],
    'starter': ['saas-starter'],
    'professional': ['saas-professional', 'marketplace-saas'],
    'compliance': ['fintech-saas', 'healthcare-saas', 'saas-enterprise']
  };

  const bundleNames = categoryBundles[category] || [];
  const bundles: ServiceBundle[] = [];
  
  for (const bundleName of bundleNames) {
    const bundle = await loadServiceBundle(bundleName);
    if (bundle) {
      bundles.push(bundle);
    }
  }
  
  return bundles;
}

/**
 * Get available bundle categories
 */
export function getAvailableBundleCategories(): Record<string, { name: string; description: string; bundles: string[] }> {
  return {
    'saas': {
      name: 'SaaS Platforms',
      description: 'General-purpose SaaS application bundles',
      bundles: ['saas-starter', 'saas-professional', 'saas-enterprise']
    },
    'fintech': {
      name: 'Financial Technology',
      description: 'Banking and financial services platforms',
      bundles: ['fintech-saas']
    },
    'marketplace': {
      name: 'Marketplace Platforms',
      description: 'Multi-vendor marketplace and platform businesses',
      bundles: ['marketplace-saas']
    },
    'healthcare': {
      name: 'Healthcare & Medical',
      description: 'HIPAA-compliant healthcare and medical platforms',
      bundles: ['healthcare-saas']
    },
    'enterprise': {
      name: 'Enterprise Solutions',
      description: 'Enterprise-grade platforms with advanced compliance',
      bundles: ['saas-enterprise', 'fintech-saas', 'healthcare-saas']
    },
    'compliance': {
      name: 'Compliance-Ready',
      description: 'Platforms with built-in regulatory compliance',
      bundles: ['fintech-saas', 'healthcare-saas', 'saas-enterprise']
    }
  };
}

/**
 * Get bundle recommendation based on requirements
 */
export function getBundleRecommendation(requirements: {
  useCase?: keyof typeof BUNDLE_RECOMMENDATIONS;
  framework?: string;
  expectedUsers?: number;
  budget?: 'low' | 'medium' | 'high';
  compliance?: string[];
  region?: string;
}): {
  recommended: string;
  reason: string;
  alternatives: string[];
  confidence: number;
} {
  let recommended = 'saas-starter';
  let reason = 'Default recommendation for new SaaS applications';
  let alternatives: string[] = [];
  let confidence = 0.5;

  // Use case based recommendation
  if (requirements.useCase && BUNDLE_RECOMMENDATIONS[requirements.useCase]) {
    const useCase = BUNDLE_RECOMMENDATIONS[requirements.useCase];
    recommended = useCase.recommended;
    reason = useCase.reason;
    alternatives = useCase.alternatives;
    confidence = 0.8;
  }

  // Framework compatibility
  if (requirements.framework && !BUNDLE_FRAMEWORK_COMPATIBILITY[recommended as keyof typeof BUNDLE_FRAMEWORK_COMPATIBILITY]?.includes(requirements.framework)) {
    // Find compatible bundle
    for (const [bundleName, frameworks] of Object.entries(BUNDLE_FRAMEWORK_COMPATIBILITY)) {
      if (frameworks.includes(requirements.framework)) {
        alternatives.push(bundleName);
      }
    }
  }

  // User scale consideration
  if (requirements.expectedUsers) {
    if (requirements.expectedUsers > 10000 && recommended === 'saas-starter') {
      recommended = 'saas-professional';
      reason = 'High user count requires professional features';
      confidence = 0.9;
    }
    if (requirements.expectedUsers > 50000 && recommended !== 'saas-enterprise') {
      recommended = 'saas-enterprise';
      reason = 'Very high user count requires enterprise scalability';
      confidence = 0.95;
    }
  }

  // Budget consideration
  if (requirements.budget === 'low' && recommended !== 'saas-starter') {
    alternatives.unshift(recommended);
    recommended = 'saas-starter';
    reason = 'Low budget constraint suggests starter bundle';
    confidence = 0.7;
  }

  // Compliance requirements
  if (requirements.compliance && requirements.compliance.length > 2) {
    if (recommended !== 'saas-enterprise') {
      alternatives.unshift(recommended);
      recommended = 'saas-enterprise';
      reason = 'Multiple compliance requirements need enterprise features';
      confidence = 0.9;
    }
  }

  // Regional considerations
  if (requirements.region === 'norway' && recommended !== 'saas-enterprise') {
    alternatives.unshift(recommended);
    recommended = 'saas-enterprise';
    reason = 'Norwegian market requires enterprise bundle for BankID/Vipps integration';
    confidence = 0.95;
  }

  return {
    recommended,
    reason,
    alternatives: [...new Set(alternatives)], // Remove duplicates
    confidence
  };
}

/**
 * Compare bundles by feature
 */
export function compareBundles(bundleA: string, bundleB: string): {
  differences: Array<{
    feature: string;
    bundleA: string;
    bundleB: string;
    advantage: 'bundleA' | 'bundleB' | 'neutral';
  }>;
  recommendation: string;
  reason: string;
} {
  const differences: Array<{
    feature: string;
    bundleA: string;
    bundleB: string;
    advantage: 'bundleA' | 'bundleB' | 'neutral';
  }> = [];

  for (const [feature, bundleFeatures] of Object.entries(BUNDLE_COMPARISON.features)) {
    const featureA = bundleFeatures[bundleA as keyof typeof bundleFeatures] || 'Not available';
    const featureB = bundleFeatures[bundleB as keyof typeof bundleFeatures] || 'Not available';
    
    if (featureA !== featureB) {
      let advantage: 'bundleA' | 'bundleB' | 'neutral' = 'neutral';
      
      // Simple heuristic for determining advantage
      if (featureA === 'Not available' || featureA.includes('Not included')) {
        advantage = 'bundleB';
      } else if (featureB === 'Not available' || featureB.includes('Not included')) {
        advantage = 'bundleA';
      } else if (featureA.includes('Enterprise') || featureA.includes('Advanced') || featureA.includes('Full')) {
        advantage = 'bundleA';
      } else if (featureB.includes('Enterprise') || featureB.includes('Advanced') || featureB.includes('Full')) {
        advantage = 'bundleB';
      }
      
      differences.push({
        feature,
        bundleA: featureA,
        bundleB: featureB,
        advantage
      });
    }
  }

  // Determine overall recommendation
  const bundleAAdvantages = differences.filter(d => d.advantage === 'bundleA').length;
  const bundleBAdvantages = differences.filter(d => d.advantage === 'bundleB').length;
  
  let recommendation: string;
  let reason: string;
  
  if (bundleAAdvantages > bundleBAdvantages) {
    recommendation = bundleA;
    reason = `${bundleA} has more advanced features (${bundleAAdvantages} vs ${bundleBAdvantages})`;
  } else if (bundleBAdvantages > bundleAAdvantages) {
    recommendation = bundleB;
    reason = `${bundleB} has more advanced features (${bundleBAdvantages} vs ${bundleAAdvantages})`;
  } else {
    recommendation = bundleA.includes('starter') ? bundleB : bundleA;
    reason = 'Similar feature sets, recommend more comprehensive bundle';
  }

  return {
    differences,
    recommendation,
    reason
  };
}

/**
 * Get bundle upgrade path
 */
export function getBundleUpgradePath(currentBundle: string): {
  nextBundle?: string;
  reason?: string;
  newFeatures: string[];
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedMigrationTime: string;
} {
  const upgradePaths = {
    'saas-starter': {
      nextBundle: 'saas-professional',
      reason: 'Add payments, caching, and advanced monitoring',
      newFeatures: [
        'Stripe subscription billing',
        'Redis caching and session management',
        'Advanced rate limiting',
        'Role-based access control',
        'Comprehensive monitoring'
      ],
      migrationComplexity: 'moderate' as const,
      estimatedMigrationTime: '4-8 hours'
    },
    'saas-professional': {
      nextBundle: 'saas-enterprise',
      reason: 'Add enterprise security, compliance, and multi-tenancy',
      newFeatures: [
        'Enterprise authentication with organizations',
        'Advanced RBAC with attribute-based access',
        'Redis clustering and high availability',
        'Comprehensive compliance suite',
        'Norwegian government integrations',
        'Enterprise monitoring and audit logging'
      ],
      migrationComplexity: 'complex' as const,
      estimatedMigrationTime: '1-3 days'
    }
  };

  const upgrade = upgradePaths[currentBundle as keyof typeof upgradePaths];
  
  if (!upgrade) {
    return {
      newFeatures: [],
      migrationComplexity: 'simple',
      estimatedMigrationTime: 'N/A - already at highest tier'
    };
  }

  return upgrade;
}

/**
 * Validate bundle configuration
 */
export async function validateBundleConfiguration(
  bundleName: string,
  config: Record<string, unknown>
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const bundle = await loadServiceBundle(bundleName);
  if (!bundle) {
    errors.push(`Bundle ${bundleName} not found`);
    return { valid: false, errors, warnings };
  }

  // Validate required configuration
  for (const configItem of bundle.configurationTemplate) {
    if (configItem.required && !config[configItem.name]) {
      errors.push(`Required configuration missing: ${configItem.name}`);
    }

    const value = config[configItem.name];
    if (value && configItem.validation) {
      // Basic validation
      if (configItem.validation.pattern && typeof value === 'string') {
        const regex = new RegExp(configItem.validation.pattern);
        if (!regex.test(value)) {
          errors.push(`Invalid format for ${configItem.name}`);
        }
      }

      if (configItem.validation.min && typeof value === 'number' && value < configItem.validation.min) {
        errors.push(`${configItem.name} must be at least ${configItem.validation.min}`);
      }

      if (configItem.validation.max && typeof value === 'number' && value > configItem.validation.max) {
        errors.push(`${configItem.name} must be at most ${configItem.validation.max}`);
      }
    }
  }

  // Check framework compatibility
  if (config.framework && !BUNDLE_FRAMEWORK_COMPATIBILITY[bundleName as keyof typeof BUNDLE_FRAMEWORK_COMPATIBILITY]?.includes(config.framework as string)) {
    warnings.push(`Framework ${config.framework} may not be fully compatible with ${bundleName}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Export bundle metadata for runtime access
export const BUNDLE_METADATA = {
  types: SAAS_BUNDLE_TYPES,
  comparison: BUNDLE_COMPARISON,
  recommendations: BUNDLE_RECOMMENDATIONS,
  frameworkCompatibility: BUNDLE_FRAMEWORK_COMPATIBILITY
} as const;

// Export bundle resolver and related functionality
export { BundleResolver } from './bundle-resolver';
export type {
  DependencyResolutionStrategy,
  BundleResolverConfig,
  ServiceResolutionContext
} from './bundle-resolver';
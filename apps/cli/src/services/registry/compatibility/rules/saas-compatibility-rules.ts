/**
 * SaaS Compatibility Rules
 * 
 * Specialized compatibility rules for SaaS applications,
 * focusing on essential service combinations and best practices.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type { CompatibilityRule } from '../../schemas/service-compatibility.schema';

/**
 * Essential SaaS service requirements rules
 */
export const SAAS_ESSENTIAL_RULES: CompatibilityRule[] = [
  {
    id: 'saas-001',
    name: 'SaaS Database Requirement',
    description: 'SaaS applications require a persistent database for user and tenant data',
    type: 'require',
    severity: 'critical',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'database',
      provider: '*',
      tags: ['persistent']
    },
    reason: 'SaaS applications need persistent storage for user data, tenant information, and application state',
    resolution: 'Add a database service (PostgreSQL recommended for SaaS)',
    category: 'saas-essentials',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'database', 'essential'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-002',
    name: 'SaaS Authentication Requirement',
    description: 'SaaS applications require robust authentication and user management',
    type: 'require',
    severity: 'critical',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'auth',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'SaaS applications need secure authentication, user management, and tenant isolation',
    resolution: 'Add an authentication service (Better Auth recommended)',
    category: 'saas-essentials',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'auth', 'essential'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-003',
    name: 'SaaS Payment Processing Requirement',
    description: 'Commercial SaaS applications require payment processing capabilities',
    type: 'recommend',
    severity: 'error',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas', 'commercial']
    },
    target: {
      type: 'payment',
      provider: '*',
      tags: ['subscription']
    },
    reason: 'Commercial SaaS needs payment processing for subscriptions and billing',
    resolution: 'Add a payment service (Stripe recommended for global SaaS)',
    category: 'saas-essentials',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'payment', 'commercial'],
    priority: 95,
    weight: 0.95,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      },
      {
        type: 'configuration',
        key: 'businessModel',
        operator: 'contains',
        value: ['commercial', 'subscription', 'freemium'],
        description: 'Commercial business model'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-004',
    name: 'SaaS Monitoring and Analytics',
    description: 'SaaS applications require monitoring, error tracking, and analytics',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'monitoring',
      provider: '*',
      tags: ['analytics']
    },
    reason: 'SaaS applications need monitoring for uptime, performance, and user analytics',
    resolution: 'Add monitoring services (Sentry for errors, PostHog for analytics)',
    category: 'saas-essentials',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'monitoring', 'analytics'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-005',
    name: 'SaaS Notification System',
    description: 'SaaS applications require notification capabilities for user engagement',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'notification',
      provider: '*',
      tags: ['email']
    },
    reason: 'SaaS applications need email notifications for onboarding, alerts, and communication',
    resolution: 'Add a notification service (Resend recommended for email)',
    category: 'saas-essentials',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'notification', 'email'],
    priority: 80,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * SaaS performance and scaling rules
 */
export const SAAS_PERFORMANCE_RULES: CompatibilityRule[] = [
  {
    id: 'saas-perf-001',
    name: 'SaaS Caching Strategy',
    description: 'High-traffic SaaS applications benefit significantly from caching layers',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'cache',
      provider: 'redis',
      tags: ['performance']
    },
    reason: 'Caching reduces database load and improves response times for SaaS applications',
    resolution: 'Add Redis caching for database queries and session storage',
    category: 'saas-performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'cache', 'performance'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'expectedLoad',
        operator: 'contains',
        value: ['medium', 'high', 'enterprise'],
        description: 'Medium to high load expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-perf-002',
    name: 'SaaS Database Optimization',
    description: 'PostgreSQL is optimal for SaaS applications requiring complex queries and JSON data',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'database',
      provider: 'postgresql',
      tags: ['optimization']
    },
    reason: 'PostgreSQL provides JSONB, advanced indexing, and excellent multi-tenant support',
    resolution: 'Use PostgreSQL as the primary database for SaaS applications',
    category: 'saas-performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'database', 'postgresql'],
    priority: 90,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'applicationType',
        operator: 'equals',
        value: 'saas',
        description: 'Application type is SaaS'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-perf-003',
    name: 'SaaS CDN and Asset Optimization',
    description: 'SaaS applications should use CDN for global performance',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    reason: 'CDN improves global performance and reduces server load for static assets',
    category: 'saas-performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'cdn', 'performance'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'globalAudience',
        operator: 'equals',
        value: true,
        description: 'Global audience expected'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * SaaS security and compliance rules
 */
export const SAAS_SECURITY_RULES: CompatibilityRule[] = [
  {
    id: 'saas-sec-001',
    name: 'SaaS RBAC Requirement',
    description: 'Multi-tenant SaaS applications require role-based access control',
    type: 'require',
    severity: 'error',
    source: {
      type: 'auth',
      provider: '*',
      tags: ['saas']
    },
    target: {
      type: 'rbac',
      provider: '*',
      tags: ['tenant-aware']
    },
    reason: 'Multi-tenant SaaS needs fine-grained access control and tenant isolation',
    resolution: 'Add RBAC service (Casbin recommended for complex permission models)',
    category: 'saas-security',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'rbac', 'security'],
    priority: 95,
    weight: 0.95,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'multiTenant',
        operator: 'equals',
        value: true,
        description: 'Multi-tenancy enabled'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-sec-002',
    name: 'SaaS Data Encryption',
    description: 'SaaS applications should encrypt sensitive data at rest and in transit',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['saas']
    },
    reason: 'Data encryption is essential for customer trust and compliance',
    resolution: 'Enable database encryption and use HTTPS for all communications',
    category: 'saas-security',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'encryption', 'security'],
    priority: 90,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'handlesSensitiveData',
        operator: 'equals',
        value: true,
        description: 'Application handles sensitive data'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-sec-003',
    name: 'SaaS Audit Logging',
    description: 'SaaS applications require comprehensive audit trails',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['saas']
    },
    reason: 'Audit logs are necessary for compliance, debugging, and security monitoring',
    resolution: 'Implement audit logging for all user actions and data changes',
    category: 'saas-security',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'audit', 'compliance'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'complianceRequired',
        operator: 'equals',
        value: true,
        description: 'Compliance requirements exist'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * SaaS business logic rules
 */
export const SAAS_BUSINESS_RULES: CompatibilityRule[] = [
  {
    id: 'saas-biz-001',
    name: 'SaaS Subscription Management',
    description: 'SaaS applications with subscriptions need billing and subscription management',
    type: 'require',
    severity: 'error',
    source: {
      type: 'payment',
      provider: '*',
      tags: ['saas']
    },
    reason: 'Subscription-based SaaS needs recurring billing and subscription lifecycle management',
    resolution: 'Implement subscription management with payment provider integration',
    category: 'saas-business',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'subscription', 'billing'],
    priority: 95,
    weight: 0.95,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'businessModel',
        operator: 'contains',
        value: ['subscription', 'freemium'],
        description: 'Subscription-based business model'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-biz-002',
    name: 'SaaS Multi-Tenant Data Isolation',
    description: 'Multi-tenant SaaS requires strict data isolation between tenants',
    type: 'require',
    severity: 'critical',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Data leakage between tenants is a critical security and compliance risk',
    resolution: 'Implement proper tenant isolation at database level (RLS or schema separation)',
    category: 'saas-business',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'multi-tenant', 'isolation'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'multiTenant',
        operator: 'equals',
        value: true,
        description: 'Multi-tenancy enabled'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-biz-003',
    name: 'SaaS Feature Flagging',
    description: 'SaaS applications benefit from feature flags for gradual rollouts and A/B testing',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'frontend',
      provider: '*',
      tags: ['saas']
    },
    reason: 'Feature flags enable safe deployments and experimentation in SaaS environments',
    resolution: 'Implement feature flag system for controlled feature rollouts',
    category: 'saas-business',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'feature-flags', 'deployment'],
    priority: 70,
    weight: 0.6,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'teamSize',
        operator: 'contains',
        value: ['medium', 'large'],
        description: 'Medium to large development team'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * SaaS integration and API rules
 */
export const SAAS_INTEGRATION_RULES: CompatibilityRule[] = [
  {
    id: 'saas-int-001',
    name: 'SaaS API Gateway',
    description: 'Complex SaaS applications benefit from API gateway for rate limiting and monitoring',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'backend',
      provider: '*',
      tags: ['saas', 'api']
    },
    reason: 'API gateway provides rate limiting, authentication, and monitoring for SaaS APIs',
    resolution: 'Implement API gateway for better API management and security',
    category: 'saas-integration',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'api-gateway', 'rate-limiting'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'apiComplexity',
        operator: 'contains',
        value: ['medium', 'high'],
        description: 'Medium to high API complexity'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'saas-int-002',
    name: 'SaaS Webhook System',
    description: 'SaaS applications should provide webhooks for customer integrations',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'backend',
      provider: '*',
      tags: ['saas']
    },
    reason: 'Webhooks enable customers to integrate SaaS applications with their systems',
    resolution: 'Implement webhook system for event notifications and integrations',
    category: 'saas-integration',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['saas', 'webhooks', 'integration'],
    priority: 70,
    weight: 0.6,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'customerIntegrations',
        operator: 'equals',
        value: true,
        description: 'Customer integrations are needed'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Aggregated SaaS compatibility rules
 */
export const SAAS_COMPATIBILITY_RULES: CompatibilityRule[] = [
  ...SAAS_ESSENTIAL_RULES,
  ...SAAS_PERFORMANCE_RULES,
  ...SAAS_SECURITY_RULES,
  ...SAAS_BUSINESS_RULES,
  ...SAAS_INTEGRATION_RULES
];

/**
 * Get SaaS rules by category
 */
export function getSaaSRulesByCategory(category: string): CompatibilityRule[] {
  return SAAS_COMPATIBILITY_RULES.filter(rule => rule.category?.includes('saas') && rule.category.includes(category));
}

/**
 * Get essential SaaS rules
 */
export function getEssentialSaaSRules(): CompatibilityRule[] {
  return SAAS_ESSENTIAL_RULES;
}

/**
 * Get SaaS rules by severity
 */
export function getSaaSRulesBySeverity(severity: 'critical' | 'error' | 'warning' | 'info'): CompatibilityRule[] {
  return SAAS_COMPATIBILITY_RULES.filter(rule => rule.severity === severity);
}
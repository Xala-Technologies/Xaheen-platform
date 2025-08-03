/**
 * Multi-Tenant Compatibility Rules
 * 
 * Specialized rules for multi-tenant architecture validation,
 * focusing on data isolation, scaling patterns, and tenant management.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type { CompatibilityRule } from '../../schemas/service-compatibility.schema';

/**
 * Data isolation strategy rules
 */
export const DATA_ISOLATION_RULES: CompatibilityRule[] = [
  {
    id: 'mt-iso-001',
    name: 'Row-Level Security Strategy',
    description: 'PostgreSQL RLS provides excellent tenant data isolation with performance benefits',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['row-level-security']
    },
    reason: 'RLS policies automatically filter data by tenant without application-level changes',
    resolution: 'Implement PostgreSQL RLS with tenant-aware policies',
    category: 'multi-tenant-isolation',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'rls', 'isolation', 'postgresql'],
    priority: 95,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'equals',
        value: 'row-level-security',
        description: 'Using row-level security strategy'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-iso-002',
    name: 'Schema-per-Tenant Strategy',
    description: 'Schema-per-tenant provides complete data isolation but requires careful scaling consideration',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['schema-per-tenant']
    },
    reason: 'Complete isolation but may not scale beyond 1000 tenants efficiently',
    resolution: 'Use schema-per-tenant for high-isolation requirements with <1000 tenants',
    category: 'multi-tenant-isolation',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'schema-per-tenant', 'isolation'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'equals',
        value: 'schema-per-tenant',
        description: 'Using schema-per-tenant strategy'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-iso-003',
    name: 'Database-per-Tenant Strategy',
    description: 'Database-per-tenant provides maximum isolation but highest operational complexity',
    type: 'conflict',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['database-per-tenant']
    },
    reason: 'Highest isolation but significant operational overhead and cost',
    resolution: 'Consider for high-security requirements or use only for largest enterprise tenants',
    category: 'multi-tenant-isolation',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'database-per-tenant', 'complexity'],
    priority: 70,
    weight: 0.6,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'equals',
        value: 'database-per-tenant',
        description: 'Using database-per-tenant strategy'
      },
      {
        type: 'configuration',
        key: 'maxTenants',
        operator: 'version',
        value: '>100',
        description: 'More than 100 tenants expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-iso-004',
    name: 'Shared Database Strategy Limitations',
    description: 'Shared database strategy requires careful application-level tenant filtering',
    type: 'conflict',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['shared-database']
    },
    reason: 'Risk of data leakage without proper application-level controls',
    resolution: 'Implement strict tenant filtering in application code and use database constraints',
    category: 'multi-tenant-isolation',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'shared-database', 'risk'],
    priority: 80,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'equals',
        value: 'shared-database',
        description: 'Using shared database strategy'
      },
      {
        type: 'configuration',
        key: 'isolationLevel',
        operator: 'equals',
        value: 'strict',
        description: 'Strict isolation required'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Tenant scaling rules
 */
export const TENANT_SCALING_RULES: CompatibilityRule[] = [
  {
    id: 'mt-scale-001',
    name: 'High-Scale Multi-Tenancy with PostgreSQL',
    description: 'PostgreSQL with proper indexing and RLS can scale to thousands of tenants',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['high-scale']
    },
    reason: 'PostgreSQL handles high tenant counts efficiently with proper optimization',
    resolution: 'Use tenant-aware indexing and connection pooling for high-scale scenarios',
    category: 'multi-tenant-scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'scaling', 'postgresql'],
    priority: 90,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'maxTenants',
        operator: 'version',
        value: '>1000',
        description: 'More than 1000 tenants expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-scale-002',
    name: 'Connection Pooling for Multi-Tenancy',
    description: 'Multi-tenant applications require careful connection pooling strategy',
    type: 'require',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Without proper pooling, tenant connections can overwhelm database',
    resolution: 'Implement tenant-aware connection pooling with PgBouncer or similar',
    category: 'multi-tenant-scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'connection-pooling', 'performance'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'maxTenants',
        operator: 'version',
        value: '>100',
        description: 'More than 100 tenants expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-scale-003',
    name: 'Cache Strategy for Multi-Tenant Applications',
    description: 'Multi-tenant applications benefit from tenant-aware caching strategies',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'cache',
      provider: 'redis',
      tags: ['multi-tenant']
    },
    reason: 'Tenant-specific caching improves performance and reduces database load',
    resolution: 'Implement tenant-namespaced caching with Redis',
    category: 'multi-tenant-scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'caching', 'performance'],
    priority: 80,
    weight: 0.75,
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
    id: 'mt-scale-004',
    name: 'Horizontal Sharding for Enterprise Multi-Tenancy',
    description: 'Enterprise-scale multi-tenancy may require horizontal sharding strategies',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: '*',
      tags: ['enterprise-scale']
    },
    reason: 'Single database instance may not handle enterprise tenant loads',
    resolution: 'Implement tenant-based sharding for enterprise deployments',
    category: 'multi-tenant-scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'sharding', 'enterprise'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'expectedLoad',
        operator: 'equals',
        value: 'enterprise',
        description: 'Enterprise load expected'
      },
      {
        type: 'configuration',
        key: 'maxTenants',
        operator: 'version',
        value: '>10000',
        description: 'More than 10,000 tenants expected'
      }
    ],
    conditionLogic: 'OR'
  }
];

/**
 * Tenant authentication and authorization rules
 */
export const TENANT_AUTH_RULES: CompatibilityRule[] = [
  {
    id: 'mt-auth-001',
    name: 'Tenant-Aware Authentication',
    description: 'Multi-tenant applications require tenant context in authentication flow',
    type: 'require',
    severity: 'error',
    source: {
      type: 'auth',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Users must be authenticated within specific tenant context',
    resolution: 'Configure authentication to include tenant identification',
    category: 'multi-tenant-auth',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'auth', 'tenant-context'],
    priority: 95,
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
    id: 'mt-auth-002',
    name: 'Tenant-Aware RBAC Integration',
    description: 'Multi-tenant RBAC requires tenant-specific role and permission management',
    type: 'require',
    severity: 'error',
    source: {
      type: 'rbac',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Roles and permissions must be scoped to specific tenants',
    resolution: 'Implement tenant-aware RBAC with Casbin or similar system',
    category: 'multi-tenant-auth',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'rbac', 'permissions'],
    priority: 90,
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
    id: 'mt-auth-003',
    name: 'Cross-Tenant Access Prevention',
    description: 'Strong multi-tenant security requires prevention of cross-tenant data access',
    type: 'require',
    severity: 'critical',
    source: {
      type: 'auth',
      provider: '*',
      tags: ['multi-tenant']
    },
    target: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Data leakage between tenants is a critical security vulnerability',
    resolution: 'Implement strong tenant isolation at database and application levels',
    category: 'multi-tenant-auth',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'security', 'isolation'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'isolationLevel',
        operator: 'equals',
        value: 'strict',
        description: 'Strict isolation required'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Tenant management and operations rules
 */
export const TENANT_MANAGEMENT_RULES: CompatibilityRule[] = [
  {
    id: 'mt-mgmt-001',
    name: 'Tenant Provisioning Automation',
    description: 'Multi-tenant SaaS requires automated tenant provisioning and setup',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'backend',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Manual tenant setup does not scale for SaaS applications',
    resolution: 'Implement automated tenant provisioning with database setup and configuration',
    category: 'multi-tenant-management',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'provisioning', 'automation'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'expectedTenantGrowth',
        operator: 'contains',
        value: ['medium', 'high'],
        description: 'Medium to high tenant growth expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-mgmt-002',
    name: 'Tenant Data Migration Strategy',
    description: 'Multi-tenant applications need strategies for tenant data migration and backup',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Tenant data migration and backup requires specific strategies per tenancy model',
    resolution: 'Implement tenant-aware backup and migration procedures',
    category: 'multi-tenant-management',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'migration', 'backup'],
    priority: 80,
    weight: 0.75,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'businessCritical',
        operator: 'equals',
        value: true,
        description: 'Business critical application'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-mgmt-003',
    name: 'Tenant Monitoring and Analytics',
    description: 'Multi-tenant applications require tenant-specific monitoring and usage analytics',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'monitoring',
      provider: '*',
      tags: ['multi-tenant']
    },
    reason: 'Per-tenant metrics are essential for SaaS business intelligence and optimization',
    resolution: 'Implement tenant-aware monitoring with PostHog or similar analytics platform',
    category: 'multi-tenant-management',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'monitoring', 'analytics'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'businessModel',
        operator: 'contains',
        value: ['subscription', 'usage-based'],
        description: 'Usage-based or subscription business model'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Tenant compliance and security rules
 */
export const TENANT_COMPLIANCE_RULES: CompatibilityRule[] = [
  {
    id: 'mt-comp-001',
    name: 'GDPR Compliance for Multi-Tenant Data',
    description: 'Multi-tenant applications must ensure GDPR compliance per tenant',
    type: 'require',
    severity: 'critical',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant', 'gdpr']
    },
    reason: 'GDPR requires tenant-specific data protection and deletion capabilities',
    resolution: 'Implement tenant-aware GDPR compliance with data anonymization and deletion',
    category: 'multi-tenant-compliance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'gdpr', 'compliance'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'gdprCompliance',
        operator: 'equals',
        value: true,
        description: 'GDPR compliance required'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-comp-002',
    name: 'Data Residency for Multi-Tenant Applications',
    description: 'Some tenants may require data to be stored in specific geographic regions',
    type: 'recommend',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant', 'data-residency']
    },
    reason: 'Regulatory requirements may mandate data residency per tenant',
    resolution: 'Plan for multi-region deployment or tenant-specific data residency options',
    category: 'multi-tenant-compliance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'data-residency', 'compliance'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'globalTenants',
        operator: 'equals',
        value: true,
        description: 'Global tenants with residency requirements'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mt-comp-003',
    name: 'Audit Trail for Multi-Tenant Operations',
    description: 'Multi-tenant applications require comprehensive audit trails per tenant',
    type: 'require',
    severity: 'warning',
    source: {
      type: 'database',
      provider: '*',
      tags: ['multi-tenant', 'audit']
    },
    reason: 'Audit trails must be tenant-aware for compliance and security investigations',
    resolution: 'Implement tenant-scoped audit logging for all data operations',
    category: 'multi-tenant-compliance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['multi-tenant', 'audit', 'compliance'],
    priority: 85,
    weight: 0.8,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'auditRequired',
        operator: 'equals',
        value: true,
        description: 'Audit requirements exist'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Aggregated multi-tenant compatibility rules
 */
export const MULTI_TENANT_COMPATIBILITY_RULES: CompatibilityRule[] = [
  ...DATA_ISOLATION_RULES,
  ...TENANT_SCALING_RULES,
  ...TENANT_AUTH_RULES,
  ...TENANT_MANAGEMENT_RULES,
  ...TENANT_COMPLIANCE_RULES
];

/**
 * Get multi-tenant rules by strategy
 */
export function getMultiTenantRulesByStrategy(strategy: string): CompatibilityRule[] {
  return MULTI_TENANT_COMPATIBILITY_RULES.filter(rule => 
    rule.tags.includes(strategy) || 
    rule.conditions.some(condition => 
      condition.key === 'tenancyStrategy' && condition.value === strategy
    )
  );
}

/**
 * Get multi-tenant rules by category
 */
export function getMultiTenantRulesByCategory(category: string): CompatibilityRule[] {
  return MULTI_TENANT_COMPATIBILITY_RULES.filter(rule => 
    rule.category?.includes('multi-tenant') && rule.category.includes(category)
  );
}

/**
 * Get critical multi-tenant rules
 */
export function getCriticalMultiTenantRules(): CompatibilityRule[] {
  return MULTI_TENANT_COMPATIBILITY_RULES.filter(rule => rule.severity === 'critical');
}

/**
 * Get multi-tenant rules for specific tenant count
 */
export function getMultiTenantRulesForScale(maxTenants: number): CompatibilityRule[] {
  return MULTI_TENANT_COMPATIBILITY_RULES.filter(rule => {
    const scaleCondition = rule.conditions.find(c => c.key === 'maxTenants');
    if (!scaleCondition) return true;
    
    const threshold = parseInt(scaleCondition.value.toString().replace(/[^\d]/g, ''));
    const operator = scaleCondition.operator;
    
    switch (operator) {
      case 'version': // Using version operator for numeric comparisons
        if (scaleCondition.value.toString().startsWith('>')) {
          return maxTenants > threshold;
        }
        return true;
      default:
        return true;
    }
  });
}
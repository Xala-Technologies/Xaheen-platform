/**
 * Database Compatibility Rules
 * 
 * Comprehensive set of compatibility rules for database services,
 * focusing on multi-tenant architectures and SaaS requirements.
 * 
 * @author Database Expert Agent
 * @since 2025-08-03
 */

import type { CompatibilityRule } from '../../schemas/service-compatibility.schema';

/**
 * PostgreSQL compatibility rules
 */
export const POSTGRESQL_RULES: CompatibilityRule[] = [
  {
    id: 'pg-001',
    name: 'PostgreSQL + Better Auth Integration',
    description: 'PostgreSQL provides excellent support for Better Auth with JSONB and advanced indexing',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['relational']
    },
    target: {
      type: 'auth',
      provider: 'better-auth',
      tags: ['typescript']
    },
    reason: 'PostgreSQL JSONB support and ACID compliance work perfectly with Better Auth',
    resolution: 'Configure Better Auth to use PostgreSQL as primary database',
    category: 'authentication',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'auth', 'jsonb'],
    priority: 95,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [],
    conditionLogic: 'AND'
  },
  {
    id: 'pg-002',
    name: 'PostgreSQL Row-Level Security for Multi-Tenancy',
    description: 'PostgreSQL RLS provides native multi-tenant data isolation',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['multi-tenant']
    },
    reason: 'Native RLS eliminates need for application-level tenant filtering',
    resolution: 'Implement PostgreSQL RLS policies for tenant data isolation',
    category: 'multi-tenancy',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'multi-tenant', 'rls', 'security'],
    priority: 90,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'multiTenant',
        operator: 'equals',
        value: true,
        description: 'Multi-tenancy is enabled'
      },
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
    id: 'pg-003',
    name: 'PostgreSQL + Prisma ORM Compatibility',
    description: 'Prisma provides excellent PostgreSQL support with type safety and migrations',
    type: 'enhance',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['orm']
    },
    reason: 'Prisma offers native PostgreSQL features support and type-safe queries',
    category: 'orm-integration',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'orm', 'prisma', 'typescript'],
    priority: 85,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'orm',
        operator: 'equals',
        value: 'prisma',
        description: 'Using Prisma ORM'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'pg-004',
    name: 'PostgreSQL + Drizzle ORM Compatibility',
    description: 'Drizzle ORM provides lightweight, TypeScript-first PostgreSQL integration',
    type: 'enhance',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['orm']
    },
    reason: 'Drizzle offers excellent PostgreSQL support with minimal overhead',
    category: 'orm-integration',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'orm', 'drizzle', 'typescript'],
    priority: 82,
    weight: 0.85,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'orm',
        operator: 'equals',
        value: 'drizzle',
        description: 'Using Drizzle ORM'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'pg-005',
    name: 'PostgreSQL + Redis Caching Strategy',
    description: 'Redis complements PostgreSQL perfectly for caching and session storage',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['caching']
    },
    target: {
      type: 'cache',
      provider: 'redis',
      tags: ['performance']
    },
    reason: 'Redis provides fast caching layer to reduce PostgreSQL load',
    resolution: 'Configure Redis as cache layer and session store',
    category: 'performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'cache', 'performance'],
    priority: 80,
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
    id: 'pg-006',
    name: 'PostgreSQL GDPR Compliance Support',
    description: 'PostgreSQL provides excellent features for GDPR compliance',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'postgresql',
      tags: ['compliance']
    },
    reason: 'PostgreSQL supports data anonymization, audit trails, and secure deletion',
    category: 'compliance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'gdpr', 'compliance'],
    priority: 88,
    weight: 0.95,
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
  }
];

/**
 * MySQL compatibility rules
 */
export const MYSQL_RULES: CompatibilityRule[] = [
  {
    id: 'mysql-001',
    name: 'MySQL Limited RLS Support',
    description: 'MySQL has limited native row-level security compared to PostgreSQL',
    type: 'conflict',
    severity: 'warning',
    source: {
      type: 'database',
      provider: 'mysql',
      tags: ['multi-tenant']
    },
    reason: 'MySQL lacks native row-level security features',
    resolution: 'Use application-level filtering or consider PostgreSQL for RLS',
    category: 'multi-tenancy',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'multi-tenant', 'limitation'],
    priority: 75,
    weight: 0.7,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'equals',
        value: 'row-level-security',
        description: 'Attempting to use row-level security'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mysql-002',
    name: 'MySQL Schema-per-Tenant Support',
    description: 'MySQL supports schema-per-tenant (database-per-tenant) effectively',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'mysql',
      tags: ['multi-tenant']
    },
    reason: 'MySQL handles multiple databases efficiently for tenant separation',
    category: 'multi-tenancy',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'multi-tenant', 'schema-per-tenant'],
    priority: 80,
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
    id: 'mysql-003',
    name: 'MySQL + Prisma Integration',
    description: 'Prisma provides good MySQL support with some limitations',
    type: 'enhance',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'mysql',
      tags: ['orm']
    },
    reason: 'Prisma supports MySQL but with fewer advanced features than PostgreSQL',
    category: 'orm-integration',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'orm', 'prisma'],
    priority: 75,
    weight: 0.75,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'orm',
        operator: 'equals',
        value: 'prisma',
        description: 'Using Prisma ORM'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * SQLite compatibility rules
 */
export const SQLITE_RULES: CompatibilityRule[] = [
  {
    id: 'sqlite-001',
    name: 'SQLite Production Limitations',
    description: 'SQLite is not suitable for production SaaS applications with multiple concurrent users',
    type: 'conflict',
    severity: 'critical',
    source: {
      type: 'database',
      provider: 'sqlite',
      tags: ['production']
    },
    reason: 'SQLite does not support concurrent writes and horizontal scaling',
    resolution: 'Use PostgreSQL or MySQL for production SaaS applications',
    category: 'scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'production', 'limitation'],
    priority: 100,
    weight: 1.0,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'environment',
        key: 'environment',
        operator: 'equals',
        value: 'production',
        description: 'Production environment'
      },
      {
        type: 'configuration',
        key: 'expectedLoad',
        operator: 'contains',
        value: ['medium', 'high', 'enterprise'],
        description: 'Medium to high load expected'
      }
    ],
    conditionLogic: 'OR'
  },
  {
    id: 'sqlite-002',
    name: 'SQLite Multi-Tenancy Limitation',
    description: 'SQLite only supports database-per-tenant strategy effectively',
    type: 'conflict',
    severity: 'error',
    source: {
      type: 'database',
      provider: 'sqlite',
      tags: ['multi-tenant']
    },
    reason: 'SQLite lacks advanced multi-tenancy features like RLS',
    resolution: 'Use database-per-tenant or switch to PostgreSQL',
    category: 'multi-tenancy',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'multi-tenant', 'limitation'],
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
      },
      {
        type: 'configuration',
        key: 'tenancyStrategy',
        operator: 'not_equals',
        value: 'database-per-tenant',
        description: 'Not using database-per-tenant strategy'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'sqlite-003',
    name: 'SQLite Development Use Case',
    description: 'SQLite is excellent for development and prototyping',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'sqlite',
      tags: ['development']
    },
    reason: 'SQLite provides zero-configuration setup for development',
    category: 'development',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'development', 'prototyping'],
    priority: 85,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'environment',
        key: 'environment',
        operator: 'contains',
        value: ['development', 'testing'],
        description: 'Development or testing environment'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Redis compatibility rules
 */
export const REDIS_RULES: CompatibilityRule[] = [
  {
    id: 'redis-001',
    name: 'Redis + Better Auth Session Storage',
    description: 'Redis provides optimal session storage for Better Auth',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'cache',
      provider: 'redis',
      tags: ['session-store']
    },
    target: {
      type: 'auth',
      provider: 'better-auth',
      tags: ['sessions']
    },
    reason: 'Redis offers fast, scalable session management with TTL support',
    resolution: 'Configure Better Auth to use Redis for session storage',
    category: 'performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['cache', 'auth', 'sessions'],
    priority: 90,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [],
    conditionLogic: 'AND'
  },
  {
    id: 'redis-002',
    name: 'Redis Caching Layer',
    description: 'Redis provides excellent caching for database queries',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'cache',
      provider: 'redis',
      tags: ['caching']
    },
    reason: 'Redis reduces database load and improves response times',
    category: 'performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['cache', 'performance', 'scaling'],
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
    id: 'redis-003',
    name: 'Redis + PostgreSQL Performance',
    description: 'Redis caching significantly improves PostgreSQL performance',
    type: 'enhance',
    severity: 'info',
    source: {
      type: 'cache',
      provider: 'redis',
      tags: ['performance']
    },
    target: {
      type: 'database',
      provider: 'postgresql',
      tags: ['caching']
    },
    reason: 'Redis reduces PostgreSQL query load and improves response times',
    category: 'performance',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['cache', 'database', 'performance'],
    priority: 82,
    weight: 0.85,
    active: true,
    deprecated: false,
    conditions: [],
    conditionLogic: 'AND'
  }
];

/**
 * MongoDB compatibility rules
 */
export const MONGODB_RULES: CompatibilityRule[] = [
  {
    id: 'mongo-001',
    name: 'MongoDB Multi-Tenant Document Strategy',
    description: 'MongoDB supports flexible multi-tenant patterns with document-level tenant fields',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'mongodb',
      tags: ['multi-tenant']
    },
    reason: 'MongoDB document model allows flexible tenant data organization',
    category: 'multi-tenancy',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'multi-tenant', 'document'],
    priority: 80,
    weight: 0.8,
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
    id: 'mongo-002',
    name: 'MongoDB Horizontal Scaling',
    description: 'MongoDB provides excellent native sharding and horizontal scaling',
    type: 'recommend',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'mongodb',
      tags: ['scaling']
    },
    reason: 'MongoDB sharding is built-in and handles distribution automatically',
    category: 'scaling',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'scaling', 'sharding'],
    priority: 85,
    weight: 0.9,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'expectedLoad',
        operator: 'contains',
        value: ['high', 'enterprise'],
        description: 'High load expected'
      }
    ],
    conditionLogic: 'AND'
  },
  {
    id: 'mongo-003',
    name: 'MongoDB ACID Transaction Support',
    description: 'MongoDB supports ACID transactions for strong consistency',
    type: 'enhance',
    severity: 'info',
    source: {
      type: 'database',
      provider: 'mongodb',
      tags: ['transactions']
    },
    reason: 'MongoDB 4.0+ provides ACID transactions for critical operations',
    category: 'consistency',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['database', 'transactions', 'consistency'],
    priority: 75,
    weight: 0.75,
    active: true,
    deprecated: false,
    conditions: [
      {
        type: 'configuration',
        key: 'consistencyLevel',
        operator: 'equals',
        value: 'strong',
        description: 'Strong consistency required'
      }
    ],
    conditionLogic: 'AND'
  }
];

/**
 * Aggregated database compatibility rules
 */
export const DATABASE_COMPATIBILITY_RULES: CompatibilityRule[] = [
  ...POSTGRESQL_RULES,
  ...MYSQL_RULES,
  ...SQLITE_RULES,
  ...REDIS_RULES,
  ...MONGODB_RULES
];

/**
 * Get rules for specific database provider
 */
export function getDatabaseRules(provider: string): CompatibilityRule[] {
  switch (provider.toLowerCase()) {
    case 'postgresql':
      return POSTGRESQL_RULES;
    case 'mysql':
      return MYSQL_RULES;
    case 'sqlite':
      return SQLITE_RULES;
    case 'redis':
      return REDIS_RULES;
    case 'mongodb':
      return MONGODB_RULES;
    default:
      return [];
  }
}

/**
 * Get rules by category
 */
export function getDatabaseRulesByCategory(category: string): CompatibilityRule[] {
  return DATABASE_COMPATIBILITY_RULES.filter(rule => rule.category === category);
}

/**
 * Get critical database rules
 */
export function getCriticalDatabaseRules(): CompatibilityRule[] {
  return DATABASE_COMPATIBILITY_RULES.filter(rule => rule.severity === 'critical');
}
/**
 * Xaheen Developer Bank - Licensing System Types
 * Feature-gated licensing for CLI generators and tools
 */

export type LicenseTier = 'frontend' | 'backend' | 'fullstack' | 'enterprise';

export type FeatureFlag = 
  // Core Features
  | 'feature.frontend'
  | 'feature.backend'
  | 'feature.fullstack'
  
  // Platform Support
  | 'platform.react'
  | 'platform.nextjs'
  | 'platform.vue'
  | 'platform.angular'
  | 'platform.svelte'
  | 'platform.electron'
  | 'platform.react-native'
  
  // Generator Categories
  | 'generator.components'
  | 'generator.layouts'
  | 'generator.forms'
  | 'generator.data-tables'
  | 'generator.charts'
  | 'generator.auth'
  | 'generator.api'
  | 'generator.database'
  | 'generator.microservices'
  
  // Add-On Packs
  | 'addon.multi-tenancy'
  | 'addon.payments'
  | 'addon.monitoring'
  | 'addon.logging'
  | 'addon.ai-generators'
  | 'addon.mcp-tools'
  | 'addon.enhanced-prompts'
  
  // Enterprise Features
  | 'enterprise.compliance'
  | 'enterprise.norwegian-compliance'
  | 'enterprise.gdpr'
  | 'enterprise.bankid'
  | 'enterprise.vipps'
  | 'enterprise.altinn'
  | 'enterprise.audit-trails'
  | 'enterprise.security-classification'
  
  // Infrastructure & DevOps
  | 'infra.docker'
  | 'infra.kubernetes'
  | 'infra.terraform'
  | 'infra.azure'
  | 'infra.aws'
  | 'infra.gcp'
  
  // Testing & Quality
  | 'testing.unit'
  | 'testing.integration'
  | 'testing.e2e'
  | 'testing.performance'
  | 'testing.security'
  
  // Advanced Features
  | 'advanced.custom-generators'
  | 'advanced.plugin-system'
  | 'advanced.enterprise-templates'
  | 'advanced.white-labeling';

export interface LicenseData {
  /** License identifier */
  id: string;
  
  /** Customer/organization identifier */
  customerId: string;
  
  /** License tier */
  tier: LicenseTier;
  
  /** Enabled feature flags */
  features: FeatureFlag[];
  
  /** License expiration date (ISO string) */
  expiresAt: string;
  
  /** License issue date (ISO string) */
  issuedAt: string;
  
  /** Maximum number of developers/seats */
  maxSeats?: number;
  
  /** Current seat usage */
  currentSeats?: number;
  
  /** License metadata */
  metadata: {
    customerName: string;
    customerEmail: string;
    organizationName?: string;
    licenseType: 'trial' | 'paid' | 'enterprise' | 'development';
    billingPeriod?: 'monthly' | 'yearly';
  };
}

export interface SignedLicense {
  /** Base64 encoded license data */
  data: string;
  
  /** Digital signature */
  signature: string;
  
  /** Signature algorithm */
  algorithm: 'RS256' | 'HS256';
}

export interface LicenseValidationResult {
  /** Whether the license is valid */
  valid: boolean;
  
  /** License data if valid */
  license?: LicenseData;
  
  /** Validation error message */
  error?: string;
  
  /** Detailed validation issues */
  issues?: string[];
}

export interface FeatureCheckResult {
  /** Whether the feature is allowed */
  allowed: boolean;
  
  /** Reason if not allowed */
  reason?: string;
  
  /** Suggested upgrade action */
  upgradeAction?: {
    tier: LicenseTier;
    upgradeUrl: string;
    pricing: {
      monthly: number;
      yearly: number;
    };
  };
}

export interface LicenseUsageMetrics {
  /** Feature usage counts */
  featureUsage: Record<FeatureFlag, number>;
  
  /** Generator usage counts */
  generatorUsage: Record<string, number>;
  
  /** Last usage timestamp */
  lastUsed: string;
  
  /** Total CLI invocations */
  totalInvocations: number;
}

export interface LicenseTierDefinition {
  /** Tier name */
  name: string;
  
  /** Tier description */
  description: string;
  
  /** Included features */
  features: FeatureFlag[];
  
  /** Pricing information */
  price?: {
    monthly: number;
    yearly: number;
  };
}

export interface AddonPackDefinition {
  /** Pack name */
  name: string;
  
  /** Pack description */
  description: string;
  
  /** Additional features provided */
  features: FeatureFlag[];
  
  /** Pricing information */
  price: {
    monthly: number;
    yearly: number;
  };
  
  /** Compatible tiers */
  compatibleTiers: LicenseTier[];
}

export interface LicenseConfiguration {
  /** License server URL */
  serverUrl: string;
  
  /** Public key for signature verification */
  publicKey: string;
  
  /** License file path */
  licensePath: string;
  
  /** Enable telemetry */
  telemetryEnabled: boolean;
  
  /** Grace period for expired licenses (days) */
  gracePeriodDays: number;
  
  /** Warning threshold before expiration (days) */
  warningThresholdDays: number;
  
  /** Enable development mode (bypasses license checks) */
  developmentMode?: boolean;
}

// Pre-defined license tiers with their included features
export const LICENSE_TIERS: Record<LicenseTier, LicenseTierDefinition> = {
  frontend: {
    name: 'Frontend Developer',
    description: 'Frontend components and UI generators',
    features: [
      'feature.frontend',
      'platform.react',
      'platform.nextjs',
      'platform.vue',
      'generator.components',
      'generator.layouts',
      'generator.forms',
      'testing.unit',
    ],
    price: {
      monthly: 29,
      yearly: 290,
    },
  },
  backend: {
    name: 'Backend Developer',
    description: 'API, database, and server-side generators',
    features: [
      'feature.backend',
      'generator.api',
      'generator.database',
      'generator.auth',
      'infra.docker',
      'testing.unit',
      'testing.integration',
    ],
    price: {
      monthly: 39,
      yearly: 390,
    },
  },
  fullstack: {
    name: 'Full-Stack Developer',
    description: 'Complete frontend and backend development suite',
    features: [
      'feature.frontend',
      'feature.backend',
      'feature.fullstack',
      'platform.react',
      'platform.nextjs',
      'platform.vue',
      'platform.angular',
      'platform.svelte',
      'generator.components',
      'generator.layouts',
      'generator.forms',
      'generator.api',
      'generator.database',
      'generator.auth',
      'generator.microservices',
      'infra.docker',
      'testing.unit',
      'testing.integration',
      'testing.e2e',
    ],
    price: {
      monthly: 59,
      yearly: 590,
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'All features plus enterprise compliance and support',
    features: [
      'feature.frontend',
      'feature.backend',
      'feature.fullstack',
      'platform.react',
      'platform.nextjs',
      'platform.vue',
      'platform.angular',
      'platform.svelte',
      'platform.electron',
      'platform.react-native',
      'generator.components',
      'generator.layouts',
      'generator.forms',
      'generator.data-tables',
      'generator.charts',
      'generator.api',
      'generator.database',
      'generator.auth',
      'generator.microservices',
      'enterprise.compliance',
      'enterprise.norwegian-compliance',
      'enterprise.gdpr',
      'enterprise.bankid',
      'enterprise.vipps',
      'enterprise.altinn',
      'enterprise.audit-trails',
      'enterprise.security-classification',
      'infra.docker',
      'infra.kubernetes',
      'infra.terraform',
      'infra.azure',
      'infra.aws',
      'infra.gcp',
      'testing.unit',
      'testing.integration',
      'testing.e2e',
      'testing.performance',
      'testing.security',
      'advanced.custom-generators',
      'advanced.plugin-system',
      'advanced.enterprise-templates',
      'advanced.white-labeling',
    ],
    price: {
      monthly: 199,
      yearly: 1990,
    },
  },
};

// Add-on packs for additional features
export const ADDON_PACKS: Record<string, AddonPackDefinition> = {
  'multi-tenancy': {
    name: 'Multi-Tenancy Pack',
    description: 'Multi-tenant architecture patterns and generators',
    features: ['addon.multi-tenancy'],
    price: {
      monthly: 19,
      yearly: 190,
    },
    compatibleTiers: ['backend', 'fullstack', 'enterprise'],
  },
  'payments': {
    name: 'Payments Integration Pack',
    description: 'Payment processing generators and integrations',
    features: ['addon.payments'],
    price: {
      monthly: 29,
      yearly: 290,
    },
    compatibleTiers: ['backend', 'fullstack', 'enterprise'],
  },
  'monitoring': {
    name: 'Monitoring & Observability Pack',
    description: 'Monitoring, logging, and observability tools',
    features: ['addon.monitoring', 'addon.logging'],
    price: {
      monthly: 19,
      yearly: 190,
    },
    compatibleTiers: ['backend', 'fullstack', 'enterprise'],
  },
  'ai-tools': {
    name: 'AI Tools Pack',
    description: 'AI-powered generators and enhanced prompts',
    features: ['addon.ai-generators', 'addon.mcp-tools', 'addon.enhanced-prompts'],
    price: {
      monthly: 39,
      yearly: 390,
    },
    compatibleTiers: ['frontend', 'backend', 'fullstack', 'enterprise'],
  },
  'norwegian-compliance': {
    name: 'Norwegian Compliance Pack',
    description: 'BankID, Vipps, Altinn, and Norwegian regulatory compliance',
    features: [
      'enterprise.norwegian-compliance',
      'enterprise.bankid',
      'enterprise.vipps',
      'enterprise.altinn',
    ],
    price: {
      monthly: 49,
      yearly: 490,
    },
    compatibleTiers: ['fullstack', 'enterprise'],
  },
};

export interface ExpirationStatus {
  /** Whether license is expired */
  expired: boolean;
  
  /** Whether license is expiring soon */
  expiring: boolean;
  
  /** Days until expiration (negative if expired) */
  daysUntilExpiration: number;
  
  /** Whether in grace period */
  inGracePeriod: boolean;
}

export interface LicenseInfo {
  /** License tier */
  tier: LicenseTier;
  
  /** Customer information */
  customer: {
    name: string;
    email: string;
    organization?: string;
  };
  
  /** License status */
  status: 'active' | 'expired' | 'expiring' | 'trial';
  
  /** Expiration information */
  expiration: ExpirationStatus;
  
  /** Available features */
  features: FeatureFlag[];
  
  /** Usage information */
  usage?: {
    totalInvocations: number;
    lastUsed: string;
  };
}

// Default configuration
export const DEFAULT_LICENSE_CONFIG: LicenseConfiguration = {
  serverUrl: 'https://license.xala.tech',
  publicKey: '', // Will be loaded from environment or config
  licensePath: '', // Will be set to ~/.xaheen/license.json
  telemetryEnabled: true,
  gracePeriodDays: 7,
  warningThresholdDays: 30,
  developmentMode: false,
};

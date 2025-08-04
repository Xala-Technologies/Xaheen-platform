export interface SaaSAdminPortalOptions {
  name: string;
  framework: 'nextjs' | 'react' | 'angular' | 'vue';
  backend: 'nestjs' | 'express' | 'fastify';
  database: 'postgresql' | 'mysql' | 'mongodb';
  features: SaaSAdminFeature[];
  authentication: 'jwt' | 'oauth' | 'bankid' | 'firebase';
  analytics: 'google' | 'mixpanel' | 'amplitude' | 'custom';
  environment?: 'development' | 'staging' | 'production';
  tenantModel: 'multi-tenant' | 'single-tenant';
  rbacModel: 'role-based' | 'attribute-based' | 'permission-based';
}

export interface TenantManagementOptions {
  name: string;
  tenantModel: 'multi-tenant' | 'single-tenant' | 'hybrid';
  isolationLevel: 'database' | 'schema' | 'row-level';
  customization: {
    branding: boolean;
    domains: boolean;
    configuration: boolean;
  };
  provisioning: 'automatic' | 'manual' | 'approval';
  onboarding: OnboardingFeature[];
}

export interface SubscriptionManagementOptions {
  name: string;
  billingProvider: 'stripe' | 'paypal' | 'vipps' | 'custom';
  subscriptionModel: 'fixed' | 'usage-based' | 'tiered' | 'hybrid';
  licenseModel: 'seat-based' | 'feature-based' | 'usage-based' | 'enterprise';
  features: SubscriptionFeature[];
  currencies: string[];
  taxHandling: 'inclusive' | 'exclusive' | 'region-based';
}

export interface RBACOptions {
  name: string;
  model: 'role-based' | 'attribute-based' | 'permission-based' | 'hybrid';
  hierarchical: boolean;
  inheritance: boolean;
  features: RBACFeature[];
  defaultRoles: DefaultRole[];
}

export type SaaSAdminFeature = 
  | 'tenant-dashboard'
  | 'user-management'
  | 'role-management'
  | 'analytics'
  | 'billing'
  | 'support'
  | 'compliance'
  | 'audit-logs'
  | 'api-management'
  | 'monitoring';

export type OnboardingFeature = 
  | 'setup-wizard'
  | 'data-import'
  | 'configuration-wizard'
  | 'branding-setup'
  | 'user-invitations'
  | 'integration-setup';

export type SubscriptionFeature = 
  | 'plans'
  | 'billing'
  | 'invoicing'
  | 'usage-tracking'
  | 'metering'
  | 'dunning'
  | 'taxes'
  | 'discounts'
  | 'trials';

export type RBACFeature = 
  | 'roles'
  | 'permissions'
  | 'groups'
  | 'inheritance'
  | 'delegation'
  | 'audit'
  | 'conditions'
  | 'temporal';

export interface DefaultRole {
  name: string;
  permissions: string[];
  description: string;
  system?: boolean;
}

export interface GenerationResult {
  files: string[];
  commands: string[];
  nextSteps: string[];
  warnings?: string[];
}
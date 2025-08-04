export interface SubscriptionManagementOptions {
  name: string;
  billingProvider: 'stripe' | 'paypal' | 'vipps' | 'adyen' | 'chargebee' | 'custom';
  subscriptionModel: 'fixed' | 'usage-based' | 'tiered' | 'per-seat' | 'hybrid';
  billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'custom';
  features: SubscriptionFeature[];
  currencies: string[];
  taxHandling: TaxHandling;
  dunningManagement: boolean;
  prorationHandling: boolean;
  freeTrial: TrialOptions;
  webhookHandling: boolean;
}

export interface LicenseManagementOptions {
  name: string;
  licenseModel: 'seat-based' | 'feature-based' | 'usage-based' | 'concurrent' | 'enterprise';
  enforcement: 'client-side' | 'server-side' | 'hybrid';
  validation: ValidationOptions;
  features: LicenseFeature[];
  restrictions: LicenseRestriction[];
  reporting: boolean;
  analytics: boolean;
  compliance: ComplianceStandard[];
}

export interface BillingIntegrationOptions {
  name: string;
  provider: 'stripe' | 'paypal' | 'vipps' | 'adyen' | 'chargebee';
  environment: 'sandbox' | 'production';
  features: BillingFeature[];
  webhookUrl: string;
  currencies: string[];
  paymentMethods: PaymentMethod[];
  taxCalculation: boolean;
  invoiceGeneration: boolean;
}

export interface UsageTrackingOptions {
  name: string;
  meteringModel: 'api-calls' | 'storage' | 'bandwidth' | 'compute-time' | 'custom';
  aggregation: 'real-time' | 'batch' | 'hybrid';
  storage: 'database' | 'time-series' | 'analytics';
  reporting: ReportingOptions;
  alerts: AlertOptions;
  billing: boolean;
}

export type SubscriptionFeature = 
  | 'plans'
  | 'billing'
  | 'invoicing'
  | 'usage-tracking'
  | 'metering'
  | 'dunning'
  | 'taxes'
  | 'discounts'
  | 'trials'
  | 'add-ons'
  | 'proration'
  | 'cancellation'
  | 'upgrades'
  | 'downgrades';

export type LicenseFeature = 
  | 'key-generation'
  | 'validation'
  | 'enforcement'
  | 'audit-trail'
  | 'reporting'
  | 'analytics'
  | 'compliance'
  | 'restrictions'
  | 'expiration'
  | 'renewal';

export type BillingFeature = 
  | 'payment-processing'
  | 'subscription-management'
  | 'invoice-generation'
  | 'tax-calculation'
  | 'dunning-management'
  | 'refunds'
  | 'chargebacks'
  | 'reporting'
  | 'webhooks'
  | 'analytics';

export interface TaxHandling {
  enabled: boolean;
  provider?: 'avalara' | 'taxjar' | 'stripe-tax' | 'custom';
  inclusive: boolean;
  regionBased: boolean;
}

export interface TrialOptions {
  enabled: boolean;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  requiresCreditCard: boolean;
  autoConvert: boolean;
}

export interface ValidationOptions {
  frequency: 'real-time' | 'periodic' | 'on-demand';
  encryption: 'aes256' | 'rsa' | 'custom';
  signature: boolean;
  offline: boolean;
}

export interface LicenseRestriction {
  type: 'ip-address' | 'domain' | 'hardware' | 'concurrent-users' | 'feature-access';
  value: string | number;
  enforcement: 'strict' | 'flexible';
}

export interface ReportingOptions {
  enabled: boolean;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  formats: ('json' | 'csv' | 'pdf')[];
  recipients: string[];
}

export interface AlertOptions {
  enabled: boolean;
  thresholds: ThresholdAlert[];
  channels: ('email' | 'slack' | 'webhook')[];
}

export interface ThresholdAlert {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type PaymentMethod = 
  | 'credit-card'
  | 'debit-card'
  | 'bank-transfer'
  | 'paypal'
  | 'vipps'
  | 'apple-pay'
  | 'google-pay'
  | 'sepa'
  | 'ach';

export type ComplianceStandard = 
  | 'gdpr'
  | 'ccpa'
  | 'hipaa'
  | 'sox'
  | 'pci-dss'
  | 'iso27001'
  | 'fedramp';

export interface GenerationResult {
  files: string[];
  commands: string[];
  nextSteps: string[];
  warnings?: string[];
}
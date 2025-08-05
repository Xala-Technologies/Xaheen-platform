/**
 * GCP Generator Interfaces
 * Segregated interfaces following Interface Segregation Principle
 */

// Base configuration interface
export interface GCPBaseConfig {
  readonly projectId: string;
  readonly region: string;
  readonly zone?: string;
  readonly environment: "development" | "staging" | "production" | "all";
  readonly labels?: Record<string, string>;
}

// Service-specific interfaces following Interface Segregation Principle
export interface GCPComputeConfig {
  readonly cloudFunctions: GCPCloudFunctionsConfig;
  readonly cloudRun: GCPCloudRunConfig;
}

export interface GCPStorageConfig {
  readonly cloudStorage: GCPCloudStorageConfig;
  readonly firestore: GCPFirestoreConfig;
}

export interface GCPSecurityConfig {
  readonly firebaseAuth: GCPFirebaseAuthConfig;
  readonly iam: GCPIAMConfig;
  readonly secretManager: GCPSecretManagerConfig;
}

export interface GCPNetworkingConfig {
  readonly vpc: GCPVPCConfig;
  readonly loadBalancer: GCPLoadBalancerConfig;
  readonly firewall: GCPFirewallConfig;
}

export interface GCPObservabilityConfig {
  readonly monitoring: GCPMonitoringConfig;
  readonly logging: GCPLoggingConfig;
  readonly tracing: GCPTracingConfig;
}

// Detailed service configurations
export interface GCPCloudFunctionsConfig {
  readonly enabled: boolean;
  readonly runtime: "nodejs20" | "nodejs18" | "python311" | "python39" | "go121" | "java17";
  readonly memory: "128MB" | "256MB" | "512MB" | "1GB" | "2GB" | "4GB" | "8GB";
  readonly timeout: number;
  readonly minInstances?: number;
  readonly maxInstances?: number;
  readonly triggers: readonly GCPFunctionTrigger[];
  readonly environmentVariables?: Record<string, string>;
  readonly secrets?: readonly string[];
}

export interface GCPCloudRunConfig {
  readonly enabled: boolean;
  readonly services: readonly GCPCloudRunService[];
  readonly scaling: GCPScalingConfig;
  readonly networking: GCPNetworkingServiceConfig;
}

export interface GCPCloudStorageConfig {
  readonly enabled: boolean;
  readonly buckets: readonly GCPStorageBucket[];
  readonly lifecycle: boolean;
  readonly versioning: boolean;
  readonly encryption: boolean;
}

export interface GCPFirestoreConfig {
  readonly enabled: boolean;
  readonly mode: "NATIVE" | "DATASTORE";
  readonly locationId: string;
  readonly collections: readonly GCPFirestoreCollection[];
  readonly securityRules: boolean;
}

export interface GCPFirebaseAuthConfig {
  readonly enabled: boolean;
  readonly providers: readonly GCPAuthProvider[];
  readonly customClaims: boolean;
  readonly emailVerification: boolean;
  readonly multiTenant: boolean;
}

export interface GCPIAMConfig {
  readonly serviceAccounts: readonly GCPServiceAccount[];
  readonly customRoles: readonly GCPCustomRole[];
  readonly bindings: readonly GCPIAMBinding[];
}

export interface GCPSecretManagerConfig {
  readonly enabled: boolean;
  readonly secrets: readonly GCPSecret[];
  readonly automaticReplication: boolean;
}

export interface GCPVPCConfig {
  readonly enabled: boolean;
  readonly subnets: readonly GCPSubnet[];
  readonly autoCreateSubnets: boolean;
}

export interface GCPLoadBalancerConfig {
  readonly enabled: boolean;
  readonly type: "APPLICATION" | "NETWORK" | "INTERNAL";
  readonly backends: readonly GCPBackendService[];
}

export interface GCPFirewallConfig {
  readonly enabled: boolean;
  readonly rules: readonly GCPFirewallRule[];
  readonly defaultAction: "ALLOW" | "DENY";
}

export interface GCPMonitoringConfig {
  readonly enabled: boolean;
  readonly dashboards: readonly GCPDashboard[];
  readonly alertPolicies: readonly GCPAlertPolicy[];
}

export interface GCPLoggingConfig {
  readonly enabled: boolean;
  readonly sinks: readonly GCPLogSink[];
  readonly metrics: readonly GCPLogMetric[];
}

export interface GCPTracingConfig {
  readonly enabled: boolean;
  readonly samplingRate: number;
}

// Supporting types
export interface GCPFunctionTrigger {
  readonly type: "http" | "pubsub" | "storage" | "firestore" | "auth";
  readonly resource?: string;
  readonly eventType?: string;
}

export interface GCPCloudRunService {
  readonly name: string;
  readonly image: string;
  readonly port: number;
  readonly cpu: string;
  readonly memory: string;
}

export interface GCPScalingConfig {
  readonly minInstances: number;
  readonly maxInstances: number;
  readonly concurrency: number;
  readonly cpuThrottling: boolean;
}

export interface GCPNetworkingServiceConfig {
  readonly ingress: "all" | "internal" | "internal-and-cloud-load-balancing";
  readonly vpcAccess?: string;
  readonly customDomains?: readonly string[];
}

export interface GCPStorageBucket {
  readonly name: string;
  readonly location: string;
  readonly storageClass: "STANDARD" | "NEARLINE" | "COLDLINE" | "ARCHIVE";
  readonly lifecycleRules?: readonly GCPLifecycleRule[];
}

export interface GCPLifecycleRule {
  readonly action: "Delete" | "SetStorageClass";
  readonly condition: {
    readonly age?: number;
    readonly createdBefore?: string;
    readonly numNewerVersions?: number;
  };
}

export interface GCPFirestoreCollection {
  readonly name: string;
  readonly fields: readonly GCPFirestoreField[];
  readonly indexes?: readonly GCPFirestoreIndex[];
}

export interface GCPFirestoreField {
  readonly name: string;
  readonly type: "string" | "number" | "boolean" | "array" | "map" | "reference" | "geopoint" | "timestamp";
  readonly required: boolean;
}

export interface GCPFirestoreIndex {
  readonly fields: readonly string[];
  readonly order: readonly ("ASCENDING" | "DESCENDING")[];
}

export interface GCPAuthProvider {
  readonly type: "google" | "facebook" | "twitter" | "github" | "email" | "phone" | "anonymous";
  readonly enabled: boolean;
  readonly config?: Record<string, unknown>;
}

export interface GCPServiceAccount {
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
  readonly roles: readonly string[];
}

export interface GCPCustomRole {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly stage: "ALPHA" | "BETA" | "GA";
}

export interface GCPIAMBinding {
  readonly role: string;
  readonly members: readonly string[];
  readonly condition?: GCPIAMCondition;
}

export interface GCPIAMCondition {
  readonly title: string;
  readonly description: string;
  readonly expression: string;
}

export interface GCPSecret {
  readonly name: string;
  readonly value?: string;
  readonly secretRef?: string;
  readonly labels?: Record<string, string>;
}

export interface GCPSubnet {
  readonly name: string;
  readonly ipCidrRange: string;
  readonly region: string;
  readonly privateIpGoogleAccess: boolean;
  readonly secondaryIpRanges?: readonly GCPSecondaryRange[];
}

export interface GCPSecondaryRange {
  readonly rangeName: string;
  readonly ipCidrRange: string;
}

export interface GCPBackendService {
  readonly name: string;
  readonly protocol: "HTTP" | "HTTPS" | "HTTP2" | "TCP" | "SSL";
  readonly healthCheck: string;
  readonly backends: readonly GCPBackend[];
}

export interface GCPBackend {
  readonly group: string;
  readonly balancingMode: "UTILIZATION" | "RATE" | "CONNECTION";
  readonly capacityScaler: number;
}

export interface GCPFirewallRule {
  readonly name: string;
  readonly direction: "INGRESS" | "EGRESS";
  readonly priority: number;
  readonly action: "ALLOW" | "DENY";
  readonly targets: readonly string[];
  readonly sources: readonly string[];
  readonly ports: readonly string[];
}

export interface GCPDashboard {
  readonly name: string;
  readonly displayName: string;
  readonly tiles: readonly GCPDashboardTile[];
}

export interface GCPDashboardTile {
  readonly widget: GCPDashboardWidget;
  readonly xPos: number;
  readonly yPos: number;
  readonly width: number;
  readonly height: number;
}

export interface GCPDashboardWidget {
  readonly title: string;
  readonly type: "scorecard" | "xyChart" | "text";
  readonly config: Record<string, unknown>;
}

export interface GCPAlertPolicy {
  readonly displayName: string;
  readonly conditions: readonly GCPAlertCondition[];
  readonly notificationChannels: readonly string[];
  readonly documentation?: GCPAlertDocumentation;
}

export interface GCPAlertCondition {
  readonly displayName: string;
  readonly conditionThreshold: GCPThresholdCondition;
}

export interface GCPThresholdCondition {
  readonly filter: string;
  readonly comparison: "COMPARISON_EQ" | "COMPARISON_GT" | "COMPARISON_LT";
  readonly thresholdValue: number;
  readonly duration: string;
}

export interface GCPAlertDocumentation {
  readonly content: string;
  readonly mimeType: string;
}

export interface GCPLogSink {
  readonly name: string;
  readonly destination: string;
  readonly filter: string;
  readonly description?: string;
}

export interface GCPLogMetric {
  readonly name: string;
  readonly description: string;
  readonly filter: string;
  readonly metricDescriptor: GCPMetricDescriptor;
}

export interface GCPMetricDescriptor {
  readonly metricKind: "GAUGE" | "DELTA" | "CUMULATIVE";
  readonly valueType: "BOOL" | "INT64" | "DOUBLE" | "STRING" | "DISTRIBUTION";
  readonly unit: string;
}
/**
 * Terraform Generator Interfaces
 * Following Interface Segregation Principle
 */

// Base configuration interface
export interface TerraformBaseConfig {
  readonly cloudProvider: "aws" | "azure" | "gcp" | "multi-cloud";
  readonly region: string;
  readonly environment: "development" | "staging" | "production" | "all";
  readonly projectName: string;
  readonly tags?: Record<string, string>;
}

// Remote state configuration
export interface TerraformRemoteStateConfig {
  readonly backend: "s3" | "azurerm" | "gcs" | "local";
  readonly bucket?: string;
  readonly container?: string;
  readonly prefix?: string;
  readonly region?: string;
  readonly encryption?: boolean;
  readonly versioning?: boolean;
}

// Service-specific configurations following ISP
export interface TerraformNetworkingConfig {
  readonly vpc: TerraformVPCConfig;
  readonly subnets: TerraformSubnetsConfig;
  readonly routing: TerraformRoutingConfig;
  readonly security: TerraformNetworkSecurityConfig;
}

export interface TerraformComputeConfig {
  readonly instances: readonly TerraformComputeInstance[];
  readonly loadBalancers: readonly TerraformLoadBalancer[];
  readonly autoScaling: TerraformAutoScalingConfig;
  readonly containerServices: TerraformContainerConfig;
}

export interface TerraformStorageConfig {
  readonly databases: readonly TerraformDatabaseConfig[];
  readonly objectStorage: TerraformObjectStorageConfig;
  readonly fileStorage: TerraformFileStorageConfig;
  readonly caching: TerraformCachingConfig;
}

export interface TerraformSecurityConfig {
  readonly iam: TerraformIAMConfig;
  readonly encryption: TerraformEncryptionConfig;
  readonly secrets: TerraformSecretsConfig;
  readonly certificates: TerraformCertificatesConfig;
  readonly waf: TerraformWAFConfig;
}

export interface TerraformObservabilityConfig {
  readonly monitoring: TerraformMonitoringConfig;
  readonly logging: TerraformLoggingConfig;
  readonly alerting: TerraformAlertingConfig;
  readonly tracing: TerraformTracingConfig;
}

// Detailed service configurations
export interface TerraformVPCConfig {
  readonly enabled: boolean;
  readonly cidrBlock: string;
  readonly enableDnsHostnames: boolean;
  readonly enableDnsSupport: boolean;
  readonly enableNatGateway: boolean;
  readonly enableVpnGateway: boolean;
}

export interface TerraformSubnetsConfig {
  readonly type: "public" | "private" | "both";
  readonly availabilityZones: number;
  readonly publicSubnets: readonly string[];
  readonly privateSubnets: readonly string[];
  readonly databaseSubnets?: readonly string[];
}

export interface TerraformRoutingConfig {
  readonly createInternetGateway: boolean;
  readonly createNatGateway: boolean;
  readonly natGatewayPerAz: boolean;
  readonly customRoutes?: readonly TerraformCustomRoute[];
}

export interface TerraformNetworkSecurityConfig {
  readonly defaultSecurityGroups: boolean;
  readonly customSecurityGroups: readonly TerraformSecurityGroup[];
  readonly networkAcls: readonly TerraformNetworkAcl[];
}

export interface TerraformComputeInstance {
  readonly name: string;
  readonly instanceType: string;
  readonly imageId?: string;
  readonly keyName?: string;
  readonly userData?: string;
  readonly subnetType: "public" | "private";
  readonly securityGroups: readonly string[];
  readonly iamProfile?: string;
  readonly monitoring: boolean;
  readonly ebsOptimized?: boolean;
  readonly rootVolume: TerraformVolumeConfig;
  readonly additionalVolumes?: readonly TerraformVolumeConfig[];
}

export interface TerraformLoadBalancer {
  readonly name: string;
  readonly type: "application" | "network" | "gateway";
  readonly internal: boolean;
  readonly subnets: readonly string[];
  readonly securityGroups: readonly string[];
  readonly listeners: readonly TerraformLoadBalancerListener[];
  readonly targetGroups: readonly TerraformTargetGroup[];
}

export interface TerraformAutoScalingConfig {
  readonly enabled: boolean;
  readonly minSize: number;
  readonly maxSize: number;
  readonly desiredCapacity: number;
  readonly healthCheckType: "EC2" | "ELB";
  readonly healthCheckGracePeriod: number;
  readonly policies: readonly TerraformScalingPolicy[];
}

export interface TerraformContainerConfig {
  readonly ecs?: TerraformECSConfig;
  readonly kubernetes?: TerraformKubernetesConfig;
  readonly serverless?: TerraformServerlessConfig;
}

export interface TerraformDatabaseConfig {
  readonly name: string;
  readonly engine: "postgresql" | "mysql" | "mariadb" | "oracle" | "sqlserver" | "mongodb" | "redis" | "elasticsearch";
  readonly version: string;
  readonly instanceClass: string;
  readonly allocatedStorage: number;
  readonly maxAllocatedStorage?: number;
  readonly encrypted: boolean;
  readonly multiAz: boolean;
  readonly backupRetention: number;
  readonly backupWindow: string;
  readonly maintenanceWindow: string;
  readonly subnetGroup?: string;
  readonly parameterGroup?: string;
  readonly optionGroup?: string;
  readonly securityGroups: readonly string[];
  readonly monitoring: boolean;
  readonly performanceInsights?: boolean;
  readonly deletionProtection: boolean;
}

export interface TerraformObjectStorageConfig {
  readonly enabled: boolean;
  readonly buckets: readonly TerraformStorageBucket[];
  readonly crossRegionReplication?: boolean;
  readonly lifecycle: boolean;
  readonly versioning: boolean;
}

export interface TerraformFileStorageConfig {
  readonly enabled: boolean;
  readonly type: "efs" | "fsx" | "azure-files" | "gcp-filestore";
  readonly performanceMode?: "generalPurpose" | "maxIO";
  readonly throughputMode?: "provisioned" | "bursting";
  readonly encrypted: boolean;
}

export interface TerraformCachingConfig {
  readonly enabled: boolean;
  readonly engine: "redis" | "memcached";
  readonly nodeType: string;
  readonly numNodes: number;
  readonly parameterGroup?: string;
  readonly subnetGroup: string;
  readonly securityGroups: readonly string[];
}

export interface TerraformIAMConfig {
  readonly roles: readonly TerraformIAMRole[];
  readonly policies: readonly TerraformIAMPolicy[];
  readonly users?: readonly TerraformIAMUser[];
  readonly groups?: readonly TerraformIAMGroup[];
}

export interface TerraformEncryptionConfig {
  readonly kmsKeys: readonly TerraformKMSKey[];
  readonly defaultEncryption: boolean;
  readonly encryptionAtTransit: boolean;
  readonly encryptionAtRest: boolean;
}

export interface TerraformSecretsConfig {
  readonly enabled: boolean;
  readonly secrets: readonly TerraformSecret[];
  readonly automaticRotation: boolean;
  readonly crossRegionReplication?: boolean;
}

export interface TerraformCertificatesConfig {
  readonly enabled: boolean;
  readonly domains: readonly string[];
  readonly validationMethod: "DNS" | "EMAIL";
  readonly autoRenewal: boolean;
}

export interface TerraformWAFConfig {
  readonly enabled: boolean;
  readonly type: "cloudfront" | "application-load-balancer" | "api-gateway";
  readonly rules: readonly TerraformWAFRule[];
  readonly rateLimiting: boolean;
  readonly geoBlocking?: readonly string[];
}

export interface TerraformMonitoringConfig {
  readonly enabled: boolean;
  readonly dashboards: readonly TerraformDashboard[];
  readonly customMetrics: readonly TerraformCustomMetric[];
  readonly logGroups: readonly TerraformLogGroup[];
}

export interface TerraformLoggingConfig {
  readonly enabled: boolean;
  readonly cloudTrail: boolean;
  readonly vpcFlowLogs: boolean;
  readonly applicationLogs: boolean;
  readonly retention: number;
  readonly logDestination?: string;
}

export interface TerraformAlertingConfig {
  readonly enabled: boolean;
  readonly alarms: readonly TerraformAlarm[];
  readonly notificationChannels: readonly TerraformNotificationChannel[];
  readonly escalationPolicies?: readonly TerraformEscalationPolicy[];
}

export interface TerraformTracingConfig {
  readonly enabled: boolean;
  readonly service: "x-ray" | "jaeger" | "zipkin";
  readonly samplingRate: number;
  readonly retention: number;
}

// Supporting types
export interface TerraformCustomRoute {
  readonly destinationCidr: string;
  readonly target: string;
  readonly priority?: number;
}

export interface TerraformSecurityGroup {
  readonly name: string;
  readonly description: string;
  readonly ingress: readonly TerraformSecurityGroupRule[];
  readonly egress: readonly TerraformSecurityGroupRule[];
}

export interface TerraformSecurityGroupRule {
  readonly fromPort: number;
  readonly toPort: number;
  readonly protocol: string;
  readonly cidrBlocks?: readonly string[];
  readonly sourceSecurityGroup?: string;
  readonly description?: string;
}

export interface TerraformNetworkAcl {
  readonly name: string;
  readonly rules: readonly TerraformNetworkAclRule[];
  readonly subnets: readonly string[];
}

export interface TerraformNetworkAclRule {
  readonly number: number;
  readonly protocol: string;
  readonly action: "allow" | "deny";
  readonly fromPort?: number;
  readonly toPort?: number;
  readonly cidrBlock: string;
}

export interface TerraformVolumeConfig {
  readonly size: number;
  readonly type: "gp2" | "gp3" | "io1" | "io2" | "st1" | "sc1";
  readonly encrypted: boolean;
  readonly deleteOnTermination: boolean;
  readonly iops?: number;
  readonly throughput?: number;
}

export interface TerraformLoadBalancerListener {
  readonly port: number;
  readonly protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP";
  readonly certificateArn?: string;
  readonly defaultActions: readonly TerraformListenerAction[];
}

export interface TerraformListenerAction {
  readonly type: "forward" | "redirect" | "fixed-response";
  readonly targetGroupArn?: string;
  readonly redirectUrl?: string;
  readonly statusCode?: number;
}

export interface TerraformTargetGroup {
  readonly name: string;
  readonly port: number;
  readonly protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP";
  readonly healthCheck: TerraformHealthCheck;
  readonly stickiness?: TerraformStickiness;
}

export interface TerraformHealthCheck {
  readonly enabled: boolean;
  readonly path?: string;
  readonly interval: number;
  readonly timeout: number;
  readonly healthyThreshold: number;
  readonly unhealthyThreshold: number;
  readonly matcher?: string;
}

export interface TerraformStickiness {
  readonly enabled: boolean;
  readonly type: "lb_cookie" | "app_cookie";
  readonly duration?: number;
  readonly cookieName?: string;
}

export interface TerraformScalingPolicy {
  readonly name: string;
  readonly adjustmentType: "ChangeInCapacity" | "ExactCapacity" | "PercentChangeInCapacity";
  readonly scalingAdjustment: number;
  readonly cooldown: number;
  readonly metricType: string;
  readonly threshold: number;
  readonly comparisonOperator: string;
}

export interface TerraformECSConfig {
  readonly clusterName: string;
  readonly services: readonly TerraformECSService[];
  readonly capacityProviders: readonly string[];
}

export interface TerraformECSService {
  readonly name: string;
  readonly taskDefinition: string;
  readonly desiredCount: number;
  readonly launchType: "EC2" | "FARGATE";
  readonly networkMode: "bridge" | "host" | "awsvpc" | "none";
}

export interface TerraformKubernetesConfig {
  readonly clusterName: string;
  readonly version: string;
  readonly nodeGroups: readonly TerraformNodeGroup[];
  readonly addons: readonly string[];
}

export interface TerraformNodeGroup {
  readonly name: string;
  readonly instanceTypes: readonly string[];
  readonly minSize: number;
  readonly maxSize: number;
  readonly desiredSize: number;
  readonly diskSize: number;
}

export interface TerraformServerlessConfig {
  readonly functions: readonly TerraformServerlessFunction[];
  readonly apiGateway?: TerraformAPIGateway;
}

export interface TerraformServerlessFunction {
  readonly name: string;
  readonly runtime: string;
  readonly handler: string;
  readonly memory: number;
  readonly timeout: number;
  readonly environment?: Record<string, string>;
}

export interface TerraformAPIGateway {
  readonly name: string;
  readonly description: string;
  readonly stages: readonly TerraformAPIStage[];
}

export interface TerraformAPIStage {
  readonly name: string;
  readonly deploymentId: string;
  readonly variables?: Record<string, string>;
}

export interface TerraformStorageBucket {
  readonly name: string;
  readonly acl: "private" | "public-read" | "public-read-write";
  readonly versioning: boolean;
  readonly encryption: boolean;
  readonly lifecycleRules?: readonly TerraformLifecycleRule[];
  readonly corsRules?: readonly TerraformCORSRule[];
}

export interface TerraformLifecycleRule {
  readonly id: string;
  readonly enabled: boolean;
  readonly expiration?: number;
  readonly transitions?: readonly TerraformTransition[];
}

export interface TerraformTransition {
  readonly days: number;
  readonly storageClass: string;
}

export interface TerraformCORSRule {
  readonly allowedHeaders?: readonly string[];
  readonly allowedMethods: readonly string[];
  readonly allowedOrigins: readonly string[];
  readonly exposeHeaders?: readonly string[];
  readonly maxAgeSeconds: number;
}

export interface TerraformIAMRole {
  readonly name: string;
  readonly assumeRolePolicy: string;
  readonly policies: readonly string[];
  readonly maxSessionDuration?: number;
}

export interface TerraformIAMPolicy {
  readonly name: string;
  readonly description: string;
  readonly policy: string;
}

export interface TerraformIAMUser {
  readonly name: string;
  readonly path?: string;
  readonly policies?: readonly string[];
  readonly groups?: readonly string[];
}

export interface TerraformIAMGroup {
  readonly name: string;
  readonly path?: string;
  readonly policies: readonly string[];
}

export interface TerraformKMSKey {
  readonly description: string;
  readonly usage: "ENCRYPT_DECRYPT" | "SIGN_VERIFY";
  readonly policy?: string;
  readonly rotationEnabled: boolean;
}

export interface TerraformSecret {
  readonly name: string;
  readonly description?: string;
  readonly value?: string;
  readonly generatePassword?: boolean;
  readonly passwordLength?: number;
}

export interface TerraformWAFRule {
  readonly name: string;
  readonly priority: number;
  readonly action: "ALLOW" | "BLOCK" | "COUNT";
  readonly statement: Record<string, unknown>;
}

export interface TerraformDashboard {
  readonly name: string;
  readonly widgets: readonly TerraformWidget[];
}

export interface TerraformWidget {
  readonly type: "metric" | "log" | "text";
  readonly properties: Record<string, unknown>;
}

export interface TerraformCustomMetric {
  readonly name: string;
  readonly namespace: string;
  readonly dimensions?: Record<string, string>;
}

export interface TerraformLogGroup {
  readonly name: string;
  readonly retention: number;
  readonly kmsKey?: string;
}

export interface TerraformAlarm {
  readonly name: string;
  readonly description?: string;
  readonly metricName: string;
  readonly namespace: string;
  readonly statistic: string;
  readonly period: number;
  readonly evaluationPeriods: number;
  readonly threshold: number;
  readonly comparisonOperator: string;
  readonly alarmActions?: readonly string[];
}

export interface TerraformNotificationChannel {
  readonly name: string;
  readonly type: "email" | "sms" | "slack" | "webhook";
  readonly endpoint: string;
}

export interface TerraformEscalationPolicy {
  readonly name: string;
  readonly rules: readonly TerraformEscalationRule[];
}

export interface TerraformEscalationRule {
  readonly delay: number;
  readonly targets: readonly string[];
}
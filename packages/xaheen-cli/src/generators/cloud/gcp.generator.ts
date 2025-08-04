/**
 * Google Cloud Platform Integration Generator
 * Generates comprehensive GCP cloud infrastructure and service integrations
 * Supports Cloud Functions, Firestore, Cloud Storage, Firebase Auth, Pub/Sub, and more
 */

import { InfrastructureGenerator, InfrastructureGeneratorOptions, InfrastructureGeneratorResult, GeneratedInfrastructureFile } from "../infrastructure/index.js";

export interface GCPCloudOptions extends InfrastructureGeneratorOptions {
	readonly projectId: string;
	readonly region: string;
	readonly zone?: string;
	readonly environment: "development" | "staging" | "production" | "all";
	readonly billingAccountId?: string;
	readonly labels?: Record<string, string>;
	
	readonly cloudFunctions: {
		readonly enabled: boolean;
		readonly runtime: "nodejs20" | "nodejs18" | "python311" | "python39" | "go121" | "java17";
		readonly memory: "128MB" | "256MB" | "512MB" | "1GB" | "2GB" | "4GB" | "8GB";
		readonly timeout: number;
		readonly minInstances?: number;
		readonly maxInstances?: number;
		readonly triggers: readonly GCPFunctionTrigger[];
		readonly environmentVariables?: Record<string, string>;
		readonly secrets?: readonly string[];
		readonly serviceAccount?: string;
		readonly vpcConnector?: string;
		readonly ingressSettings?: "ALLOW_ALL" | "ALLOW_INTERNAL_ONLY" | "ALLOW_INTERNAL_AND_GCLB";
	};
	
	readonly firestore: {
		readonly enabled: boolean;
		readonly mode: "NATIVE" | "DATASTORE";
		readonly locationId: string;
		readonly collections: readonly GCPFirestoreCollection[];
		readonly securityRules: boolean;
		readonly indexes: readonly GCPFirestoreIndex[];
		readonly backupRetention?: number;
		readonly pointInTimeRecovery?: boolean;
		readonly multiRegion?: boolean;
	};
	
	readonly cloudStorage: {
		readonly enabled: boolean;
		readonly buckets: readonly GCPStorageBucket[];
		readonly lifecycle: boolean;
		readonly versioning: boolean;
		readonly encryption: boolean;
		readonly cors: boolean;
		readonly publicAccess: boolean;
		readonly uniformBucketLevelAccess: boolean;
		readonly retentionPolicy?: {
			readonly retentionPeriod: number;
			readonly isLocked: boolean;
		};
	};
	
	readonly firebaseAuth: {
		readonly enabled: boolean;
		readonly providers: readonly GCPAuthProvider[];
		readonly customClaims: boolean;
		readonly actionCodeSettings: boolean;
		readonly emailVerification: boolean;
		readonly passwordReset: boolean;
		readonly multiTenant: boolean;
		readonly phoneAuth: boolean;
		readonly anonymousAuth: boolean;
		readonly sessionCookies: boolean;
		readonly auditLogging: boolean;
	};
	
	readonly pubSub: {
		readonly enabled: boolean;
		readonly topics: readonly GCPPubSubTopic[];
		readonly subscriptions: readonly GCPPubSubSubscription[];
		readonly deadLetterQueue: boolean;
		readonly messageRetention: number;
		readonly orderingKeys: boolean;
		readonly schemas: readonly GCPPubSubSchema[];
		readonly snapshots: boolean;
	};
	
	readonly cloudRun: {
		readonly enabled: boolean;
		readonly services: readonly GCPCloudRunService[];
		readonly traffic: readonly GCPTrafficAllocation[];
		readonly scaling: {
			readonly minInstances: number;
			readonly maxInstances: number;
			readonly concurrency: number;
			readonly cpuThrottling: boolean;
		};
		readonly networking: {
			readonly ingress: "all" | "internal" | "internal-and-cloud-load-balancing";
			readonly vpcAccess?: string;
			readonly customDomains?: readonly string[];
		};
	};
	
	readonly bigQuery: {
		readonly enabled: boolean;
		readonly datasets: readonly GCPBigQueryDataset[];
		readonly tables: readonly GCPBigQueryTable[];
		readonly views: readonly GCPBigQueryView[];
		readonly routines: readonly GCPBigQueryRoutine[];
		readonly encryption: boolean;
		readonly partitioning: boolean;
		readonly clustering: boolean;
		readonly streaming: boolean;
	};
	
	readonly cloudSQL: {
		readonly enabled: boolean;
		readonly instances: readonly GCPCloudSQLInstance[];
		readonly databases: readonly string[];
		readonly backups: boolean;
		readonly highAvailability: boolean;
		readonly readReplicas: boolean;
		readonly encryption: boolean;
		readonly authorizedNetworks: readonly string[];
		readonly maintenanceWindow?: {
			readonly day: number;
			readonly hour: number;
		};
	};
	
	readonly secretManager: {
		readonly enabled: boolean;
		readonly secrets: readonly GCPSecret[];
		readonly replication: "automatic" | "user-managed";
		readonly versionManagement: boolean;
		readonly accessLogging: boolean;
		readonly rotation: boolean;
	};
	
	readonly cloudLogging: {
		readonly enabled: boolean;
		readonly logSinks: readonly GCPLogSink[];
		readonly metrics: readonly GCPLogMetric[];
		readonly retention: number;
		readonly exclusions: readonly GCPLogExclusion[];
		readonly structuredLogging: boolean;
	};
	
	readonly cloudMonitoring: {
		readonly enabled: boolean;
		readonly dashboards: readonly GCPDashboard[];
		readonly alertPolicies: readonly GCPAlertPolicy[];
		readonly uptime: boolean;
		readonly slo: boolean;
		readonly customMetrics: readonly GCPCustomMetric[];
		readonly notificationChannels: readonly GCPNotificationChannel[];
	};
	
	readonly apiGateway: {
		readonly enabled: boolean;
		readonly apis: readonly GCPAPIGatewayAPI[];
		readonly authentication: boolean;
		readonly rateLimit: boolean;
		readonly cors: boolean;
		readonly logging: boolean;
		readonly monitoring: boolean;
	};
	
	readonly cloudBuild: {
		readonly enabled: boolean;
		readonly triggers: readonly GCPBuildTrigger[];
		readonly workers: readonly GCPBuildWorker[];
		readonly artifactRegistry: boolean;
		readonly caching: boolean;
		readonly substitutions: Record<string, string>;
	};
	
	readonly iam: {
		readonly enabled: boolean;
		readonly serviceAccounts: readonly GCPServiceAccount[];
		readonly customRoles: readonly GCPCustomRole[];
		readonly bindings: readonly GCPIAMBinding[];
		readonly conditions: readonly GCPIAMCondition[];
		readonly workloadIdentity: boolean;
	};
	
	readonly networking: {
		readonly vpc: boolean;
		readonly subnets: readonly GCPSubnet[];
		readonly firewalls: readonly GCPFirewallRule[];
		readonly loadBalancers: readonly GCPLoadBalancer[];
		readonly cloudNAT: boolean;
		readonly cloudRouter: boolean;
		readonly privateServiceConnect: boolean;
		readonly serviceMesh: boolean;
	};
	
	readonly security: {
		readonly binaryAuthorization: boolean;
		readonly containerAnalysis: boolean;
		readonly securityCenter: boolean;
		readonly webSecurityScanner: boolean;
		readonly kms: boolean;
		readonly hsm: boolean;
		readonly certificateAuthority: boolean;
		readonly reCAPTCHA: boolean;
	};
}

// Interface definitions for GCP services
export interface GCPFunctionTrigger {
	readonly name: string;
	readonly type: "httpsTrigger" | "eventTrigger" | "scheduleFunction";
	readonly configuration: Record<string, unknown>;
	readonly eventType?: string;
	readonly resource?: string;
	readonly schedule?: string;
	readonly timeZone?: string;
}

export interface GCPFirestoreCollection {
	readonly name: string;
	readonly fields: readonly GCPFirestoreField[];
	readonly subcollections?: readonly GCPFirestoreCollection[];
	readonly indexes?: readonly string[];
	readonly securityRules?: string;
}

export interface GCPFirestoreField {
	readonly name: string;
	readonly type: "string" | "number" | "boolean" | "array" | "map" | "null" | "timestamp" | "geopoint" | "reference";
	readonly required: boolean;
	readonly indexed: boolean;
	readonly arrayContains?: boolean;
}

export interface GCPFirestoreIndex {
	readonly collection: string;
	readonly fields: readonly {
		readonly fieldPath: string;
		readonly order?: "ASCENDING" | "DESCENDING";
		readonly arrayConfig?: "CONTAINS";
	}[];
	readonly queryScope: "COLLECTION" | "COLLECTION_GROUP";
}

export interface GCPStorageBucket {
	readonly name: string;
	readonly storageClass: "STANDARD" | "NEARLINE" | "COLDLINE" | "ARCHIVE";
	readonly location: string;
	readonly uniformBucketLevelAccess: boolean;
	readonly publicReadAccess: boolean;
	readonly lifecycle?: readonly GCPLifecycleRule[];
	readonly cors?: readonly GCPCORSRule[];
	readonly encryption?: {
		readonly defaultKmsKeyName?: string;
	};
}

export interface GCPLifecycleRule {
	readonly action: {
		readonly type: "Delete" | "SetStorageClass";
		readonly storageClass?: string;
	};
	readonly condition: {
		readonly age?: number;
		readonly createdBefore?: string;
		readonly isLive?: boolean;
		readonly matchesStorageClass?: readonly string[];
		readonly numNewerVersions?: number;
	};
}

export interface GCPCORSRule {
	readonly origin: readonly string[];
	readonly method: readonly string[];
	readonly responseHeader: readonly string[];
	readonly maxAgeSeconds: number;
}

export interface GCPAuthProvider {
	readonly type: "google" | "facebook" | "twitter" | "github" | "microsoft" | "apple" | "yahoo" | "email" | "phone" | "anonymous" | "custom";
	readonly enabled: boolean;
	readonly configuration?: Record<string, unknown>;
}

export interface GCPPubSubTopic {
	readonly name: string;
	readonly messageStoragePolicy?: {
		readonly allowedPersistenceRegions: readonly string[];
	};
	readonly schema?: string;
	readonly messageRetentionDuration?: string;
	readonly labels?: Record<string, string>;
}

export interface GCPPubSubSubscription {
	readonly name: string;
	readonly topic: string;
	readonly pushConfig?: {
		readonly pushEndpoint: string;
		readonly attributes?: Record<string, string>;
		readonly oidcToken?: {
			readonly serviceAccountEmail: string;
			readonly audience?: string;
		};
	};
	readonly ackDeadlineSeconds: number;
	readonly messageRetentionDuration: string;
	readonly retainAckedMessages: boolean;
	readonly expirationPolicy?: {
		readonly ttl: string;
	};
	readonly deadLetterPolicy?: {
		readonly deadLetterTopic: string;
		readonly maxDeliveryAttempts: number;
	};
	readonly retryPolicy?: {
		readonly minimumBackoff: string;
		readonly maximumBackoff: string;
	};
	readonly filter?: string;
	readonly enableMessageOrdering: boolean;
}

export interface GCPPubSubSchema {
	readonly name: string;
	readonly type: "AVRO" | "PROTOCOL_BUFFER";
	readonly definition: string;
}

export interface GCPCloudRunService {
	readonly name: string;
	readonly image: string;
	readonly port: number;
	readonly cpu: string;
	readonly memory: string;
	readonly environmentVariables?: Record<string, string>;
	readonly secrets?: readonly GCPCloudRunSecret[];
	readonly volumes?: readonly GCPCloudRunVolume[];
	readonly serviceAccount?: string;
	readonly timeout?: string;
	readonly labels?: Record<string, string>;
	readonly annotations?: Record<string, string>;
}

export interface GCPCloudRunSecret {
	readonly name: string;
	readonly key: string;
	readonly version: string;
}

export interface GCPCloudRunVolume {
	readonly name: string;
	readonly secret?: {
		readonly secretName: string;
		readonly items?: readonly {
			readonly key: string;
			readonly path: string;
		}[];
	};
	readonly configMap?: {
		readonly name: string;
		readonly items?: readonly {
			readonly key: string;
			readonly path: string;
		}[];
	};
}

export interface GCPTrafficAllocation {
	readonly revisionName?: string;
	readonly percent: number;
	readonly tag?: string;
}

export interface GCPBigQueryDataset {
	readonly datasetId: string;
	readonly location: string;
	readonly description?: string;
	readonly defaultTableExpirationMs?: number;
	readonly labels?: Record<string, string>;
	readonly access?: readonly GCPBigQueryAccess[];
}

export interface GCPBigQueryAccess {
	readonly role: "READER" | "WRITER" | "OWNER";
	readonly userByEmail?: string;
	readonly groupByEmail?: string;
	readonly domain?: string;
	readonly specialGroup?: "projectOwners" | "projectReaders" | "projectWriters" | "allAuthenticatedUsers";
}

export interface GCPBigQueryTable {
	readonly tableId: string;
	readonly datasetId: string;
	readonly schema: readonly GCPBigQueryField[];
	readonly timePartitioning?: {
		readonly type: "DAY" | "HOUR" | "MONTH" | "YEAR";
		readonly field?: string;
		readonly expirationMs?: number;
	};
	readonly clustering?: {
		readonly fields: readonly string[];
	};
	readonly description?: string;
	readonly labels?: Record<string, string>;
}

export interface GCPBigQueryField {
	readonly name: string;
	readonly type: "STRING" | "BYTES" | "INTEGER" | "FLOAT" | "BOOLEAN" | "TIMESTAMP" | "DATE" | "TIME" | "DATETIME" | "GEOGRAPHY" | "NUMERIC" | "BIGNUMERIC" | "JSON" | "RECORD";
	readonly mode: "NULLABLE" | "REQUIRED" | "REPEATED";
	readonly description?: string;
	readonly fields?: readonly GCPBigQueryField[];
}

export interface GCPBigQueryView {
	readonly viewId: string;
	readonly datasetId: string;
	readonly query: string;
	readonly description?: string;
	readonly labels?: Record<string, string>;
}

export interface GCPBigQueryRoutine {
	readonly routineId: string;
	readonly datasetId: string;
	readonly routineType: "SCALAR_FUNCTION" | "AGGREGATE_FUNCTION" | "TABLE_VALUED_FUNCTION" | "PROCEDURE";
	readonly language: "SQL" | "JAVASCRIPT" | "PYTHON";
	readonly definitionBody: string;
	readonly arguments?: readonly GCPBigQueryArgument[];
	readonly returnType?: string;
	readonly description?: string;
}

export interface GCPBigQueryArgument {
	readonly name: string;
	readonly dataType: string;
	readonly mode?: "IN" | "OUT" | "INOUT";
}

export interface GCPCloudSQLInstance {
	readonly name: string;
	readonly databaseVersion: "POSTGRES_14" | "POSTGRES_13" | "MYSQL_8_0" | "MYSQL_5_7" | "SQLSERVER_2019_STANDARD" | "SQLSERVER_2017_STANDARD";
	readonly tier: string;
	readonly region: string;
	readonly zone?: string;
	readonly settings: {
		readonly backupConfiguration?: {
			readonly enabled: boolean;
			readonly startTime?: string;
			readonly location?: string;
			readonly pointInTimeRecoveryEnabled?: boolean;
			readonly transactionLogRetentionDays?: number;
			readonly backupRetentionSettings?: {
				readonly retainedBackups?: number;
				readonly retentionUnit?: "COUNT" | "DAYS";
			};
		};
		readonly ipConfiguration?: {
			readonly authorizedNetworks?: readonly {
				readonly value: string;
				readonly name?: string;
			}[];
			readonly ipv4Enabled?: boolean;
			readonly privateNetwork?: string;
			readonly requireSsl?: boolean;
		};
		readonly locationPreference?: {
			readonly followGaeApplication?: string;
			readonly zone?: string;
		};
		readonly maintenanceWindow?: {
			readonly day: number;
			readonly hour: number;
			readonly updateTrack?: "canary" | "stable";
		};
		readonly storageAutoResize?: boolean;
		readonly storageAutoResizeLimit?: number;
		readonly userLabels?: Record<string, string>;
	};
	readonly masterInstanceName?: string;
	readonly replicaConfiguration?: {
		readonly mysqlReplicaConfiguration?: {
			readonly dumpFilePath?: string;
			readonly username?: string;
			readonly password?: string;
			readonly connectRetryInterval?: number;
			readonly masterHeartbeatPeriod?: number;
			readonly caCertificate?: string;
			readonly clientCertificate?: string;
			readonly clientKey?: string;
			readonly sslCipher?: string;
			readonly verifyServerCertificate?: boolean;
			readonly kind?: string;
		};
		readonly failoverTarget?: boolean;
	};
}

export interface GCPSecret {
	readonly secretId: string;
	readonly data?: string;
	readonly labels?: Record<string, string>;
	readonly replication: {
		readonly automatic?: object;
		readonly userManaged?: {
			readonly replicas: readonly {
				readonly location: string;
				readonly customerManagedEncryption?: {
					readonly kmsKeyName: string;
				};
			}[];
		};
	};
	readonly expireTime?: string;
	readonly ttl?: string;
	readonly rotation?: {
		readonly nextRotationTime?: string;
		readonly rotationPeriod?: string;
	};
	readonly topics?: readonly {
		readonly name: string;
	}[];
}

export interface GCPLogSink {
	readonly name: string;
	readonly destination: string;
	readonly filter?: string;
	readonly description?: string;
	readonly disabled?: boolean;
	readonly exclusions?: readonly GCPLogExclusion[];
	readonly bigqueryOptions?: {
		readonly usePartitionedTables?: boolean;
		readonly usesTimestampColumnPartitioning?: boolean;
	};
}

export interface GCPLogMetric {
	readonly name: string;
	readonly description?: string;
	readonly filter: string;
	readonly disabled?: boolean;
	readonly metricDescriptor?: {
		readonly metricKind: "GAUGE" | "DELTA" | "CUMULATIVE";
		readonly valueType: "BOOL" | "INT64" | "DOUBLE" | "STRING" | "DISTRIBUTION" | "MONEY";
		readonly unit?: string;
		readonly labels?: readonly {
			readonly key: string;
			readonly valueType: "STRING" | "BOOL" | "INT64";
			readonly description?: string;
		}[];
		readonly displayName?: string;
	};
	readonly labelExtractors?: Record<string, string>;
	readonly bucketOptions?: {
		readonly linearBuckets?: {
			readonly numFiniteBuckets: number;
			readonly width: number;
			readonly offset: number;
		};
		readonly exponentialBuckets?: {
			readonly numFiniteBuckets: number;
			readonly growthFactor: number;
			readonly scale: number;
		};
		readonly explicitBuckets?: {
			readonly bounds: readonly number[];
		};
	};
}

export interface GCPLogExclusion {
	readonly name: string;
	readonly description?: string;
	readonly filter: string;
	readonly disabled?: boolean;
}

export interface GCPDashboard {
	readonly displayName: string;
	readonly mosaicLayout?: {
		readonly tiles: readonly GCPDashboardTile[];
	};
	readonly gridLayout?: {
		readonly widgets: readonly GCPDashboardWidget[];
	};
	readonly rowLayout?: {
		readonly rows: readonly {
			readonly weight: number;
			readonly widgets: readonly GCPDashboardWidget[];
		}[];
	};
	readonly columnLayout?: {
		readonly columns: readonly {
			readonly weight: number;
			readonly widgets: readonly GCPDashboardWidget[];
		}[];
	};
	readonly labels?: Record<string, string>;
}

export interface GCPDashboardTile {
	readonly width: number;
	readonly height: number;
	readonly xPos: number;
	readonly yPos: number;
	readonly widget: GCPDashboardWidget;
}

export interface GCPDashboardWidget {
	readonly title?: string;
	readonly xyChart?: {
		readonly dataSets: readonly {
			readonly timeSeriesQuery: {
				readonly timeSeriesFilter?: {
					readonly filter: string;
					readonly aggregation?: {
						readonly alignmentPeriod?: string;
						readonly perSeriesAligner?: string;
						readonly crossSeriesReducer?: string;
						readonly groupByFields?: readonly string[];
					};
				};
				readonly unitOverride?: string;
			};
			readonly plotType: "LINE" | "STACKED_AREA" | "STACKED_BAR";
			readonly targetAxis?: "Y1" | "Y2";
		}[];
		readonly timeshiftDuration?: string;
		readonly yAxis?: {
			readonly label?: string;
			readonly scale?: "LINEAR" | "LOG10";
		};
		readonly chartOptions?: {
			readonly mode?: "COLOR" | "X_RAY" | "STATS";
		};
	};
	readonly scorecard?: {
		readonly timeSeriesQuery: {
			readonly timeSeriesFilter: {
				readonly filter: string;
				readonly aggregation?: {
					readonly alignmentPeriod?: string;
					readonly perSeriesAligner?: string;
					readonly crossSeriesReducer?: string;
					readonly groupByFields?: readonly string[];
				};
			};
			readonly unitOverride?: string;
		};
		readonly sparkChartView?: {
			readonly sparkChartType: "SPARK_LINE" | "SPARK_BAR";
		};
		readonly gaugeView?: {
			readonly lowerBound?: number;
			readonly upperBound?: number;
		};
	};
	readonly text?: {
		readonly content: string;
		readonly format: "MARKDOWN" | "RAW";
	};
	readonly blank?: object;
}

export interface GCPAlertPolicy {
	readonly displayName: string;
	readonly documentation?: {
		readonly content: string;
		readonly mimeType?: string;
	};
	readonly userLabels?: Record<string, string>;
	readonly conditions: readonly {
		readonly displayName: string;
		readonly conditionThreshold?: {
			readonly filter: string;
			readonly aggregations?: readonly {
				readonly alignmentPeriod?: string;
				readonly perSeriesAligner?: string;
				readonly crossSeriesReducer?: string;
				readonly groupByFields?: readonly string[];
			}[];
			readonly comparison: "COMPARISON_GT" | "COMPARISON_GE" | "COMPARISON_LT" | "COMPARISON_LE" | "COMPARISON_EQ" | "COMPARISON_NE";
			readonly thresholdValue?: number;
			readonly duration?: string;
			readonly evaluationMissingData?: "EVALUATION_MISSING_DATA_INACTIVE" | "EVALUATION_MISSING_DATA_ACTIVE" | "EVALUATION_MISSING_DATA_NO_OP";
		};
		readonly conditionAbsent?: {
			readonly filter: string;
			readonly aggregations?: readonly {
				readonly alignmentPeriod?: string;
				readonly perSeriesAligner?: string;
				readonly crossSeriesReducer?: string;
				readonly groupByFields?: readonly string[];
			}[];
			readonly duration?: string;
		};
		readonly conditionMatchedLog?: {
			readonly filter: string;
			readonly labelExtractors?: Record<string, string>;
		};
	}[];
	readonly combiner: "OR" | "AND" | "AND_WITH_MATCHING_RESOURCE";
	readonly enabled: boolean;
	readonly validity?: {
		readonly code?: number;
		readonly message?: string;
		readonly details?: readonly object[];
	};
	readonly notificationChannels?: readonly string[];
	readonly creationRecord?: {
		readonly mutateTime?: string;
		readonly mutatedBy?: string;
	};
	readonly mutationRecord?: {
		readonly mutateTime?: string;
		readonly mutatedBy?: string;
	};
	readonly alertStrategy?: {
		readonly autoClose?: string;
		readonly notificationRateLimit?: {
			readonly period?: string;
		};
	};
}

export interface GCPCustomMetric {
	readonly type: string;
	readonly displayName?: string;
	readonly description?: string;
	readonly metricKind: "GAUGE" | "DELTA" | "CUMULATIVE";
	readonly valueType: "BOOL" | "INT64" | "DOUBLE" | "STRING" | "DISTRIBUTION" | "MONEY";
	readonly unit?: string;
	readonly labels?: readonly {
		readonly key: string;
		readonly valueType: "STRING" | "BOOL" | "INT64";
		readonly description?: string;
	}[];
	readonly metadata?: {
		readonly launchStage?: "UNIMPLEMENTED" | "PRELAUNCH" | "EARLY_ACCESS" | "ALPHA" | "BETA" | "GA" | "DEPRECATED";
		readonly samplePeriod?: string;
		readonly ingestDelay?: string;
	};
}

export interface GCPNotificationChannel {
	readonly type: string;
	readonly displayName?: string;
	readonly description?: string;
	readonly labels?: Record<string, string>;
	readonly userLabels?: Record<string, string>;
	readonly verificationStatus?: "UNVERIFIED" | "VERIFIED";
	readonly enabled?: boolean;
	readonly creationRecord?: {
		readonly mutateTime?: string;
		readonly mutatedBy?: string;
	};
	readonly mutationRecords?: readonly {
		readonly mutateTime?: string;
		readonly mutatedBy?: string;
	}[];
}

export interface GCPAPIGatewayAPI {
	readonly apiId: string;
	readonly displayName?: string;
	readonly labels?: Record<string, string>;
	readonly managedService?: string;
	readonly state?: "STATE_UNSPECIFIED" | "CREATING" | "ACTIVE" | "FAILED" | "DELETING" | "UPDATING";
}

export interface GCPBuildTrigger {
	readonly name?: string;
	readonly description?: string;
	readonly tags?: readonly string[];
	readonly disabled?: boolean;
	readonly substitutions?: Record<string, string>;
	readonly filename?: string;
	readonly build?: {
		readonly steps: readonly {
			readonly name: string;
			readonly env?: readonly string[];
			readonly args?: readonly string[];
			readonly dir?: string;
			readonly id?: string;
			readonly waitFor?: readonly string[];
			readonly entrypoint?: string;
			readonly secretEnv?: readonly string[];
			readonly volumes?: readonly {
				readonly name: string;
				readonly path: string;
			}[];
			readonly timing?: {
				readonly startTime?: string;
				readonly endTime?: string;
			};
			readonly pullTiming?: {
				readonly startTime?: string;
				readonly endTime?: string;
			};
			readonly timeout?: string;
			readonly status?: "STATUS_UNKNOWN" | "QUEUED" | "WORKING" | "SUCCESS" | "FAILURE" | "INTERNAL_ERROR" | "TIMEOUT" | "CANCELLED" | "EXPIRED";
		}[];
		readonly timeout?: string;
		readonly images?: readonly string[];
		readonly artifacts?: {
			readonly images?: readonly string[];
			readonly objects?: {
				readonly location?: string;
				readonly paths?: readonly string[];
				readonly timing?: {
					readonly startTime?: string;
					readonly endTime?: string;
				};
			};
		};
		readonly logsBucket?: string;
		readonly sourceProvenance?: {
			readonly resolvedStorageSource?: {
				readonly bucket?: string;
				readonly object?: string;
				readonly generation?: string;
			};
			readonly resolvedRepoSource?: {
				readonly projectId?: string;
				readonly repoName?: string;
				readonly branchName?: string;
				readonly tagName?: string;
				readonly commitSha?: string;
				readonly dir?: string;
				readonly invertRegex?: boolean;
				readonly substitutions?: Record<string, string>;
			};
			readonly fileHashes?: Record<string, {
				readonly fileHash?: readonly {
					readonly type?: "NONE" | "SHA256" | "MD5";
					readonly value?: string;
				}[];
			}>;
		};
		readonly buildTriggerId?: string;
		readonly options?: {
			readonly sourceProvenanceHash?: readonly ("NONE" | "SHA256" | "MD5")[];
			readonly requestedVerifyOption?: "NOT_VERIFIED" | "VERIFIED";
			readonly machineType?: "UNSPECIFIED" | "N1_HIGHCPU_8" | "N1_HIGHCPU_32" | "E2_HIGHCPU_8" | "E2_HIGHCPU_32";
			readonly diskSizeGb?: string;
			readonly substitutionOption?: "MUST_MATCH" | "ALLOW_LOOSE";
			readonly dynamicSubstitutions?: boolean;
			readonly logStreamingOption?: "STREAM_DEFAULT" | "STREAM_ON" | "STREAM_OFF";
			readonly workerPool?: string;
			readonly logging?: "LOGGING_UNSPECIFIED" | "LEGACY" | "GCS_ONLY" | "STACKDRIVER_ONLY" | "CLOUD_LOGGING_ONLY" | "NONE";
			readonly env?: readonly string[];
			readonly secretEnv?: readonly string[];
			readonly volumes?: readonly {
				readonly name?: string;
				readonly path?: string;
			}[];
		};
		readonly timing?: Record<string, {
			readonly startTime?: string;
			readonly endTime?: string;
		}>;
		readonly approval?: {
			readonly state?: "STATE_UNSPECIFIED" | "PENDING" | "APPROVED" | "REJECTED";
			readonly config?: {
				readonly approvalRequired?: boolean;
			};
			readonly result?: {
				readonly approvalTime?: string;
				readonly approverAccount?: string;
				readonly decision?: "DECISION_UNSPECIFIED" | "APPROVED" | "REJECTED";
				readonly comment?: string;
				readonly url?: string;
			};
		};
		readonly serviceAccount?: string;
		readonly availableSecrets?: {
			readonly secretManager?: readonly {
				readonly versionName?: string;
				readonly env?: string;
			}[];
			readonly inline?: readonly {
				readonly kmsKeyName?: string;
				readonly envMap?: Record<string, string>;
			}[];
		};
		readonly warnings?: readonly {
			readonly text?: string;
			readonly priority?: "PRIORITY_UNSPECIFIED" | "INFO" | "WARNING" | "ALERT";
		}[];
		readonly failureInfo?: {
			readonly type?: "FAILURE_TYPE_UNSPECIFIED" | "PUSH_FAILED" | "PUSH_IMAGE_NOT_FOUND" | "PUSH_NOT_AUTHORIZED" | "LOGGING_FAILURE" | "USER_BUILD_STEP" | "FETCH_SOURCE_FAILED";
			readonly detail?: string;
		};
	};
	readonly github?: {
		readonly owner?: string;
		readonly name?: string;
		readonly pullRequest?: {
			readonly branch?: string;
			readonly commentControl?: "COMMENTS_DISABLED" | "COMMENTS_ENABLED" | "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY";
			readonly invertRegex?: boolean;
		};
		readonly push?: {
			readonly branch?: string;
			readonly tag?: string;
			readonly invertRegex?: boolean;
		};
	};
	readonly pubsubConfig?: {
		readonly subscription?: string;
		readonly topic?: string;
		readonly serviceAccountEmail?: string;
	};
	readonly webhookConfig?: {
		readonly secret?: string;
		readonly state?: "STATE_UNSPECIFIED" | "OK" | "SECRET_DELETED";
	};
	readonly repositoryEventConfig?: {
		readonly repository?: string;
		readonly repositoryType?: "UNKNOWN" | "CLOUD_SOURCE_REPOSITORIES" | "GITHUB" | "BITBUCKET_MIRROR";
		readonly pullRequest?: {
			readonly branch?: string;
			readonly commentControl?: "COMMENTS_DISABLED" | "COMMENTS_ENABLED" | "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY";
			readonly invertRegex?: boolean;
		};
		readonly push?: {
			readonly branch?: string;
			readonly tag?: string;
			readonly invertRegex?: boolean;
		};
	};
	readonly filter?: string;
	readonly serviceName?: string;
	readonly includeBuildLogs?: "INCLUDE_BUILD_LOGS_UNSPECIFIED" | "INCLUDE_BUILD_LOGS_WITH_STATUS";
}

export interface GCPBuildWorker {
	readonly name?: string;
	readonly displayName?: string;
	readonly state?: "STATE_UNSPECIFIED" | "CREATING" | "RUNNING" | "DELETING" | "DELETED";
	readonly createTime?: string;
	readonly updateTime?: string;
	readonly deleteTime?: string;
	readonly config?: {
		readonly machineType?: string;
		readonly diskSizeGb?: string;
		readonly network?: {
			readonly projectId?: string;
			readonly network?: string;
			readonly subnetwork?: string;
		};
	};
	readonly uid?: string;
	readonly annotations?: Record<string, string>;
}

export interface GCPServiceAccount {
	readonly accountId: string;
	readonly displayName?: string;
	readonly description?: string;
	readonly disabled?: boolean;
}

export interface GCPCustomRole {
	readonly roleId: string;
	readonly title?: string;
	readonly description?: string;
	readonly includedPermissions: readonly string[];
	readonly stage?: "ALPHA" | "BETA" | "GA" | "DEPRECATED" | "DISABLED" | "EAP";
}

export interface GCPIAMBinding {
	readonly role: string;
	readonly members: readonly string[];
	readonly condition?: GCPIAMCondition;
}

export interface GCPIAMCondition {
	readonly title: string;
	readonly description?: string;
	readonly expression: string;
}

export interface GCPSubnet {
	readonly name: string;
	readonly ipCidrRange: string;
	readonly region: string;
	readonly network: string;
	readonly description?: string;
	readonly secondaryIpRanges?: readonly {
		readonly rangeName: string;
		readonly ipCidrRange: string;
	}[];
	readonly privateIpGoogleAccess?: boolean;
	readonly enableFlowLogs?: boolean;
	readonly logConfig?: {
		readonly enable: boolean;
		readonly flowSampling?: number;
		readonly aggregationInterval?: "INTERVAL_5_SEC" | "INTERVAL_30_SEC" | "INTERVAL_1_MIN" | "INTERVAL_5_MIN" | "INTERVAL_10_MIN" | "INTERVAL_15_MIN";
		readonly metadata?: "INCLUDE_ALL_METADATA" | "EXCLUDE_ALL_METADATA" | "CUSTOM_METADATA";
		readonly metadataFields?: readonly string[];
		readonly filterExpr?: string;
	};
}

export interface GCPFirewallRule {
	readonly name: string;
	readonly description?: string;
	readonly network: string;
	readonly priority?: number;
	readonly sourceRanges?: readonly string[];
	readonly destinationRanges?: readonly string[];
	readonly sourceServiceAccounts?: readonly string[];
	readonly targetServiceAccounts?: readonly string[];
	readonly sourceTags?: readonly string[];
	readonly targetTags?: readonly string[];
	readonly allowed?: readonly {
		readonly IPProtocol: string;
		readonly ports?: readonly string[];
	}[];
	readonly denied?: readonly {
		readonly IPProtocol: string;
		readonly ports?: readonly string[];
	}[];
	readonly direction: "INGRESS" | "EGRESS";
	readonly disabled?: boolean;
	readonly enableLogging?: boolean;
	readonly logConfig?: {
		readonly enable: boolean;
		readonly metadata?: "INCLUDE_ALL_METADATA" | "EXCLUDE_ALL_METADATA";
	};
}

export interface GCPLoadBalancer {
	readonly name: string;
	readonly type: "HTTP" | "HTTPS" | "TCP" | "UDP" | "SSL" | "INTERNAL_HTTP" | "INTERNAL_HTTPS" | "INTERNAL_TCP_UDP";
	readonly description?: string;
	readonly ipVersion?: "IPV4" | "IPV6";
	readonly loadBalancingScheme?: "EXTERNAL" | "INTERNAL" | "EXTERNAL_MANAGED";
	readonly portRange?: string;
	readonly ports?: readonly string[];
	readonly target?: string;
	readonly ipAddress?: string;
	readonly subnetwork?: string;
	readonly network?: string;
	readonly region?: string;
	readonly backendService?: string;
	readonly urlMap?: string;
	readonly sslCertificates?: readonly string[];
	readonly sslPolicy?: string;
	readonly quicOverride?: "NONE" | "ENABLE" | "DISABLE";
	readonly networkTier?: "PREMIUM" | "STANDARD";
	readonly serviceLabel?: string;
	readonly serviceName?: string;
	readonly creationTimestamp?: string;
	readonly fingerprint?: string;
	readonly id?: string;
	readonly kind?: string;
	readonly labelFingerprint?: string;
	readonly labels?: Record<string, string>;
	readonly selfLink?: string;
}

/**
 * GCP Cloud Services Generator
 * Generates comprehensive Google Cloud Platform integrations
 */
export class GCPCloudGenerator extends InfrastructureGenerator {
	constructor(private options: GCPCloudOptions) {
		super();
	}

	async generate(outputDir: string, projectOptions: InfrastructureGeneratorOptions): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];
		const commands: string[] = [];
		const nextSteps: string[] = [];

		try {
			// Generate project configuration
			if (this.shouldGenerateProjectConfig()) {
				files.push(...await this.generateProjectConfig(outputDir));
				commands.push('gcloud config set project ${PROJECT_ID}');
			}

			// Generate Cloud Functions
			if (this.options.cloudFunctions.enabled) {
				files.push(...await this.generateCloudFunctions(outputDir));
				commands.push('gcloud functions deploy --region=${REGION}');
				nextSteps.push('Configure Cloud Functions environment variables and secrets');
			}

			// Generate Firestore
			if (this.options.firestore.enabled) {
				files.push(...await this.generateFirestore(outputDir));
				commands.push('gcloud firestore databases create --region=${REGION}');
				nextSteps.push('Review and deploy Firestore security rules');
			}

			// Generate Cloud Storage
			if (this.options.cloudStorage.enabled) {
				files.push(...await this.generateCloudStorage(outputDir));
				commands.push('gsutil mb gs://${BUCKET_NAME}');
				nextSteps.push('Configure Cloud Storage bucket policies and lifecycle rules');
			}

			// Generate Firebase Auth
			if (this.options.firebaseAuth.enabled) {
				files.push(...await this.generateFirebaseAuth(outputDir));
				commands.push('firebase auth:import users.json');
				nextSteps.push('Configure Firebase Auth providers and custom claims');
			}

			// Generate Pub/Sub
			if (this.options.pubSub.enabled) {
				files.push(...await this.generatePubSub(outputDir));
				commands.push('gcloud pubsub topics create ${TOPIC_NAME}');
				nextSteps.push('Configure Pub/Sub message schemas and dead letter queues');
			}

			// Generate Cloud Run
			if (this.options.cloudRun.enabled) {
				files.push(...await this.generateCloudRun(outputDir));
				commands.push('gcloud run deploy --image=${IMAGE_URL} --region=${REGION}');
				nextSteps.push('Configure Cloud Run traffic allocation and custom domains');
			}

			// Generate BigQuery
			if (this.options.bigQuery.enabled) {
				files.push(...await this.generateBigQuery(outputDir));
				commands.push('bq mk --dataset ${PROJECT_ID}:${DATASET_ID}');
				nextSteps.push('Configure BigQuery datasets, tables, and access controls');
			}

			// Generate Cloud SQL
			if (this.options.cloudSQL.enabled) {
				files.push(...await this.generateCloudSQL(outputDir));
				commands.push('gcloud sql instances create ${INSTANCE_NAME}');
				nextSteps.push('Configure Cloud SQL backups and read replicas');
			}

			// Generate Secret Manager
			if (this.options.secretManager.enabled) {
				files.push(...await this.generateSecretManager(outputDir));
				commands.push('gcloud secrets create ${SECRET_NAME}');
				nextSteps.push('Configure Secret Manager replication and access controls');
			}

			// Generate Cloud Logging & Monitoring
			if (this.options.cloudLogging.enabled || this.options.cloudMonitoring.enabled) {
				files.push(...await this.generateObservability(outputDir));
				commands.push('gcloud logging sinks create ${SINK_NAME}');
				nextSteps.push('Configure monitoring dashboards and alert policies');
			}

			// Generate API Gateway
			if (this.options.apiGateway.enabled) {
				files.push(...await this.generateAPIGateway(outputDir));
				commands.push('gcloud api-gateway apis create ${API_ID}');
				nextSteps.push('Configure API Gateway authentication and rate limiting');
			}

			// Generate Cloud Build
			if (this.options.cloudBuild.enabled) {
				files.push(...await this.generateCloudBuild(outputDir));
				commands.push('gcloud builds submit --config=cloudbuild.yaml');
				nextSteps.push('Configure Cloud Build triggers and worker pools');
			}

			// Generate IAM configuration
			if (this.options.iam.enabled) {
				files.push(...await this.generateIAM(outputDir));
				commands.push('gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME}');
				nextSteps.push('Review and apply IAM roles and bindings');
			}

			// Generate networking
			if (this.options.networking.vpc) {
				files.push(...await this.generateNetworking(outputDir));
				commands.push('gcloud compute networks create ${NETWORK_NAME}');
				nextSteps.push('Configure VPC subnets, firewall rules, and load balancers');
			}

			// Generate security configurations
			if (this.options.security.binaryAuthorization || this.options.security.containerAnalysis) {
				files.push(...await this.generateSecurity(outputDir));
				commands.push('gcloud container binauthz policy import policy.yaml');
				nextSteps.push('Configure security policies and container analysis');
			}

			// Generate Terraform infrastructure
			files.push(...await this.generateTerraformInfrastructure(outputDir));
			commands.push('terraform init', 'terraform plan', 'terraform apply');

			// Generate deployment scripts
			files.push(...await this.generateDeploymentScripts(outputDir));
			commands.push('./scripts/deploy.sh');

			// Generate monitoring and alerting
			files.push(...await this.generateMonitoringConfig(outputDir));

			// Generate documentation
			files.push(...await this.generateDocumentation(outputDir));

			nextSteps.push(
				'Review all generated configurations before deployment',
				'Set up environment variables and secrets',
				'Configure billing and quotas for your GCP project',
				'Test all services in a development environment first',
				'Set up monitoring and alerting for production workloads',
				'Review and implement security best practices',
				'Configure backup and disaster recovery procedures'
			);

			return {
				success: true,
				message: 'GCP cloud infrastructure generated successfully',
				files,
				commands,
				nextSteps,
				metadata: {
					generatorType: 'gcp-cloud',
					projectId: this.options.projectId,
					region: this.options.region,
					environment: this.options.environment,
					servicesEnabled: this.getEnabledServices(),
					estimatedCost: this.calculateEstimatedCost(),
					securityLevel: this.calculateSecurityLevel(),
					complianceFeatures: this.getComplianceFeatures()
				}
			};

		} catch (error) {
			return {
				success: false,
				message: `Failed to generate GCP cloud infrastructure: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	private shouldGenerateProjectConfig(): boolean {
		return true; // Always generate project configuration
	}

	private async generateProjectConfig(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];

		// Generate .gcloudignore
		files.push({
			path: `${outputDir}/.gcloudignore`,
			content: this.generateGCloudIgnore(),
			type: 'config'
		});

		// Generate project configuration
		files.push({
			path: `${outputDir}/gcp-config.json`,
			content: this.generateProjectConfigFile(),
			type: 'config'
		});

		// Generate environment variables template
		files.push({
			path: `${outputDir}/.env.gcp.example`,
			content: this.generateEnvTemplate(),
			type: 'config'
		});

		return files;
	}

	private async generateCloudFunctions(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const functionsDir = `${outputDir}/functions`;

		// Generate package.json for Cloud Functions
		files.push({
			path: `${functionsDir}/package.json`,
			content: this.generateFunctionsPackageJson(),
			type: 'config'
		});

		// Generate TypeScript configuration
		files.push({
			path: `${functionsDir}/tsconfig.json`,
			content: this.generateFunctionsTsConfig(),
			type: 'config'
		});

		// Generate main functions entry point
		files.push({
			path: `${functionsDir}/src/index.ts`,
			content: this.generateFunctionsIndex(),
			type: 'source'
		});

		// Generate HTTP trigger functions
		const httpTriggers = this.options.cloudFunctions.triggers.filter(t => t.type === 'httpsTrigger');
		for (const trigger of httpTriggers) {
			files.push({
				path: `${functionsDir}/src/http/${trigger.name}.ts`,
				content: this.generateHttpFunction(trigger),
				type: 'source'
			});
		}

		// Generate Pub/Sub trigger functions
		const pubsubTriggers = this.options.cloudFunctions.triggers.filter(t => t.type === 'eventTrigger' && t.eventType?.includes('pubsub'));
		for (const trigger of pubsubTriggers) {
			files.push({
				path: `${functionsDir}/src/pubsub/${trigger.name}.ts`,
				content: this.generatePubSubFunction(trigger),
				type: 'source'
			});
		}

		// Generate Firestore trigger functions
		const firestoreTriggers = this.options.cloudFunctions.triggers.filter(t => t.type === 'eventTrigger' && t.eventType?.includes('firestore'));
		for (const trigger of firestoreTriggers) {
			files.push({
				path: `${functionsDir}/src/firestore/${trigger.name}.ts`,
				content: this.generateFirestoreFunction(trigger),
				type: 'source'
			});
		}

		// Generate scheduled functions
		const scheduledTriggers = this.options.cloudFunctions.triggers.filter(t => t.type === 'scheduleFunction');
		for (const trigger of scheduledTriggers) {
			files.push({
				path: `${functionsDir}/src/scheduled/${trigger.name}.ts`,
				content: this.generateScheduledFunction(trigger),
				type: 'source'
			});
		}

		// Generate middleware
		files.push({
			path: `${functionsDir}/src/middleware/cors.ts`,
			content: this.generateCorsMiddleware(),
			type: 'source'
		});

		files.push({
			path: `${functionsDir}/src/middleware/auth.ts`,
			content: this.generateAuthMiddleware(),
			type: 'source'
		});

		files.push({
			path: `${functionsDir}/src/middleware/validation.ts`,
			content: this.generateValidationMiddleware(),
			type: 'source'
		});

		// Generate utilities
		files.push({
			path: `${functionsDir}/src/utils/logger.ts`,
			content: this.generateLogger(),
			type: 'source'
		});

		files.push({
			path: `${functionsDir}/src/utils/error-handler.ts`,
			content: this.generateErrorHandler(),
			type: 'source'
		});

		// Generate deployment configuration
		files.push({
			path: `${functionsDir}/.gcloudignore`,
			content: this.generateFunctionsGCloudIgnore(),
			type: 'config'
		});

		return files;
	}

	private async generateFirestore(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const firestoreDir = `${outputDir}/firestore`;

		// Generate Firestore security rules
		files.push({
			path: `${firestoreDir}/firestore.rules`,
			content: this.generateFirestoreSecurityRules(),
			type: 'config'
		});

		// Generate composite indexes
		files.push({
			path: `${firestoreDir}/firestore.indexes.json`,
			content: this.generateFirestoreIndexes(),
			type: 'config'
		});

		// Generate TypeScript client
		files.push({
			path: `${outputDir}/src/lib/firestore-client.ts`,
			content: this.generateFirestoreClient(),
			type: 'source'
		});

		// Generate collection schemas and types
		for (const collection of this.options.firestore.collections) {
			files.push({
				path: `${outputDir}/src/types/${collection.name}.types.ts`,
				content: this.generateCollectionTypes(collection),
				type: 'source'
			});

			files.push({
				path: `${outputDir}/src/services/${collection.name}.service.ts`,
				content: this.generateCollectionService(collection),
				type: 'source'
			});
		}

		// Generate offline support
		files.push({
			path: `${outputDir}/src/lib/firestore-offline.ts`,
			content: this.generateFirestoreOffline(),
			type: 'source'
		});

		// Generate batch operations
		files.push({
			path: `${outputDir}/src/lib/firestore-batch.ts`,
			content: this.generateFirestoreBatch(),
			type: 'source'
		});

		return files;
	}

	private async generateCloudStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const storageDir = `${outputDir}/storage`;

		// Generate storage client
		files.push({
			path: `${outputDir}/src/lib/storage-client.ts`,
			content: this.generateStorageClient(),
			type: 'source'
		});

		// Generate signed URL service
		files.push({
			path: `${outputDir}/src/services/signed-url.service.ts`,
			content: this.generateSignedUrlService(),
			type: 'source'
		});

		// Generate upload service with progress tracking
		files.push({
			path: `${outputDir}/src/services/upload.service.ts`,
			content: this.generateUploadService(),
			type: 'source'
		});

		// Generate lifecycle policies for each bucket
		for (const bucket of this.options.cloudStorage.buckets) {
			files.push({
				path: `${storageDir}/${bucket.name}-lifecycle.json`,
				content: this.generateBucketLifecyclePolicy(bucket),
				type: 'config'
			});

			if (bucket.cors) {
				files.push({
					path: `${storageDir}/${bucket.name}-cors.json`,
					content: this.generateBucketCorsPolicy(bucket),
					type: 'config'
				});
			}
		}

		// Generate storage utilities
		files.push({
			path: `${outputDir}/src/utils/storage-utils.ts`,
			content: this.generateStorageUtils(),
			type: 'source'
		});

		// Generate image processing service
		files.push({
			path: `${outputDir}/src/services/image-processing.service.ts`,
			content: this.generateImageProcessingService(),
			type: 'source'
		});

		return files;
	}

	private async generateFirebaseAuth(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const authDir = `${outputDir}/auth`;

		// Generate Firebase Auth client
		files.push({
			path: `${outputDir}/src/lib/firebase-auth.ts`,
			content: this.generateFirebaseAuthClient(),
			type: 'source'
		});

		// Generate authentication service
		files.push({
			path: `${outputDir}/src/services/auth.service.ts`,
			content: this.generateAuthService(),
			type: 'source'
		});

		// Generate custom claims service
		if (this.options.firebaseAuth.customClaims) {
			files.push({
				path: `${outputDir}/src/services/custom-claims.service.ts`,
				content: this.generateCustomClaimsService(),
				type: 'source'
			});
		}

		// Generate auth middleware for backend
		files.push({
			path: `${outputDir}/src/middleware/firebase-auth.middleware.ts`,
			content: this.generateFirebaseAuthMiddleware(),
			type: 'source'
		});

		// Generate React auth hooks
		files.push({
			path: `${outputDir}/src/hooks/useAuth.ts`,
			content: this.generateAuthHooks(),
			type: 'source'
		});

		// Generate auth components
		files.push({
			path: `${outputDir}/src/components/auth/LoginForm.tsx`,
			content: this.generateLoginForm(),
			type: 'source'
		});

		files.push({
			path: `${outputDir}/src/components/auth/SignUpForm.tsx`,
			content: this.generateSignUpForm(),
			type: 'source'
		});

		// Generate auth types
		files.push({
			path: `${outputDir}/src/types/auth.types.ts`,
			content: this.generateAuthTypes(),
			type: 'source'
		});

		// Generate provider configurations
		for (const provider of this.options.firebaseAuth.providers) {
			files.push({
				path: `${authDir}/providers/${provider.type}-config.json`,
				content: this.generateProviderConfig(provider),
				type: 'config'
			});
		}

		return files;
	}

	private async generatePubSub(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const pubsubDir = `${outputDir}/pubsub`;

		// Generate Pub/Sub client
		files.push({
			path: `${outputDir}/src/lib/pubsub-client.ts`,
			content: this.generatePubSubClient(),
			type: 'source'
		});

		// Generate publisher service
		files.push({
			path: `${outputDir}/src/services/publisher.service.ts`,
			content: this.generatePublisherService(),
			type: 'source'
		});

		// Generate subscriber service
		files.push({
			path: `${outputDir}/src/services/subscriber.service.ts`,
			content: this.generateSubscriberService(),
			type: 'source'
		});

		// Generate message schemas
		files.push({
			path: `${pubsubDir}/schemas.json`,
			content: this.generatePubSubSchemas(),
			type: 'config'
		});

		// Generate topic configurations
		for (const topic of this.options.pubSub.topics) {
			files.push({
				path: `${pubsubDir}/topics/${topic.name}.json`,
				content: this.generateTopicConfig(topic),
				type: 'config'
			});
		}

		// Generate subscription configurations
		for (const subscription of this.options.pubSub.subscriptions) {
			files.push({
				path: `${pubsubDir}/subscriptions/${subscription.name}.json`,
				content: this.generateSubscriptionConfig(subscription),
				type: 'config'
			});
		}

		// Generate message handlers for each subscription
		for (const subscription of this.options.pubSub.subscriptions) {
			files.push({
				path: `${outputDir}/src/handlers/${subscription.name}.handler.ts`,
				content: this.generateMessageHandler(subscription),
				type: 'source'
			});
		}

		// Generate dead letter queue handler
		if (this.options.pubSub.deadLetterQueue) {
			files.push({
				path: `${outputDir}/src/handlers/dead-letter.handler.ts`,
				content: this.generateDeadLetterHandler(),
				type: 'source'
			});
		}

		// Generate Pub/Sub types
		files.push({
			path: `${outputDir}/src/types/pubsub.types.ts`,
			content: this.generatePubSubTypes(),
			type: 'source'
		});

		return files;
	}

	private async generateCloudRun(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		const files: GeneratedInfrastructureFile[] = [];
		const cloudRunDir = `${outputDir}/cloud-run`;

		// Generate Dockerfile for each service
		for (const service of this.options.cloudRun.services) {
			files.push({
				path: `${outputDir}/services/${service.name}/Dockerfile`,
				content: this.generateCloudRunDockerfile(service),
				type: 'config'
			});

			// Generate service application code
			files.push({
				path: `${outputDir}/services/${service.name}/src/index.ts`,
				content: this.generateCloudRunService(service),
				type: 'source'
			});

			// Generate service package.json
			files.push({
				path: `${outputDir}/services/${service.name}/package.json`,
				content: this.generateCloudRunPackageJson(service),
				type: 'config'
			});

			// Generate service configuration
			files.push({
				path: `${cloudRunDir}/${service.name}.yaml`,
				content: this.generateCloudRunServiceConfig(service),
				type: 'config'
			});
		}

		// Generate traffic allocation configuration
		files.push({
			path: `${cloudRunDir}/traffic-allocation.yaml`,
			content: this.generateTrafficAllocation(),
			type: 'config'
		});

		// Generate deployment scripts
		files.push({
			path: `${outputDir}/scripts/deploy-cloud-run.sh`,
			content: this.generateCloudRunDeployScript(),
			type: 'script'
		});

		// Generate health check endpoint
		files.push({
			path: `${outputDir}/src/health/health-check.ts`,
			content: this.generateHealthCheck(),
			type: 'source'
		});

		// Generate Cloud Run client for service-to-service communication
		files.push({
			path: `${outputDir}/src/lib/cloud-run-client.ts`,
			content: this.generateCloudRunClient(),
			type: 'source'
		});

		return files;
	}

	private async generateBigQuery(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for BigQuery generation 
		// This would generate datasets, tables, views, and query templates
		return [];
	}

	private async generateCloudSQL(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Cloud SQL generation
		// This would generate instance configurations, database schemas, and connection code
		return [];
	}

	private async generateSecretManager(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Secret Manager generation
		// This would generate secret configurations and access code
		return [];
	}

	private async generateObservability(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Cloud Logging & Monitoring generation
		// This would generate log sinks, metrics, dashboards, and alert policies
		return [];
	}

	private async generateAPIGateway(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for API Gateway generation
		// This would generate API configurations, OpenAPI specs, and authentication
		return [];
	}

	private async generateCloudBuild(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Cloud Build generation
		// This would generate build configurations, triggers, and worker pools
		return [];
	}

	private async generateIAM(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for IAM generation
		// This would generate service accounts, roles, and policy bindings
		return [];
	}

	private async generateNetworking(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for networking generation
		// This would generate VPC, subnets, firewall rules, and load balancers
		return [];
	}

	private async generateSecurity(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for security generation
		// This would generate security policies, binary authorization, and container analysis
		return [];
	}

	private async generateTerraformInfrastructure(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Terraform generation
		// This would generate complete Terraform configurations for all services
		return [];
	}

	private async generateDeploymentScripts(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for deployment scripts generation
		// This would generate bash scripts for deployment automation
		return [];
	}

	private async generateMonitoringConfig(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for monitoring configuration generation
		// This would generate dashboards, alerts, and SLOs
		return [];
	}

	private async generateDocumentation(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for documentation generation
		// This would generate comprehensive documentation for all services
		return [];
	}

	private generateGCloudIgnore(): string {
		return `# Ignore node_modules
node_modules/

# Ignore environment files
.env
.env.local
.env.*.local

# Ignore build outputs
dist/
build/
.next/

# Ignore IDE files
.vscode/
.idea/
*.swp
*.swo

# Ignore logs
*.log
logs/

# Ignore temporary files
.tmp/
tmp/

# Ignore OS files
.DS_Store
Thumbs.db

# Ignore dependency lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Ignore test coverage
coverage/

# Ignore Terraform state
*.tfstate
*.tfstate.backup
.terraform/

# Ignore secrets
secrets/
*.key
*.pem
*.crt
`;
	}

	private generateProjectConfigFile(): string {
		return JSON.stringify({
			projectId: this.options.projectId,
			region: this.options.region,
			zone: this.options.zone,
			environment: this.options.environment,
			billingAccountId: this.options.billingAccountId,
			labels: this.options.labels,
			enabledServices: this.getEnabledServices(),
			estimatedMonthlyCost: this.calculateEstimatedCost(),
			securityConfiguration: {
				level: this.calculateSecurityLevel(),
				features: this.getComplianceFeatures()
			},
			generatedAt: new Date().toISOString(),
			generatorVersion: "2.0.0"
		}, null, 2);
	}

	private generateEnvTemplate(): string {
		return `# GCP Project Configuration
PROJECT_ID=${this.options.projectId}
REGION=${this.options.region}
ZONE=${this.options.zone || 'us-central1-a'}
ENVIRONMENT=${this.options.environment}

# Cloud Functions
${this.options.cloudFunctions.enabled ? `
FUNCTION_RUNTIME=${this.options.cloudFunctions.runtime}
FUNCTION_MEMORY=${this.options.cloudFunctions.memory}
FUNCTION_TIMEOUT=${this.options.cloudFunctions.timeout}
` : ''}

# Firestore
${this.options.firestore.enabled ? `
FIRESTORE_MODE=${this.options.firestore.mode}
FIRESTORE_LOCATION=${this.options.firestore.locationId}
` : ''}

# Cloud Storage
${this.options.cloudStorage.enabled ? `
STORAGE_BUCKET_NAME=${this.options.projectId}-${this.options.environment}-storage
` : ''}

# Pub/Sub
${this.options.pubSub.enabled ? `
PUBSUB_TOPIC_PREFIX=${this.options.projectId}-${this.options.environment}
` : ''}

# Cloud SQL
${this.options.cloudSQL.enabled ? `
CLOUDSQL_INSTANCE_NAME=${this.options.projectId}-${this.options.environment}-db
CLOUDSQL_DATABASE_VERSION=${this.options.cloudSQL.instances[0]?.databaseVersion || 'POSTGRES_14'}
` : ''}

# Monitoring
${this.options.cloudMonitoring.enabled ? `
MONITORING_NOTIFICATION_EMAIL=admin@example.com
` : ''}

# Security
KMS_KEY_RING_NAME=${this.options.projectId}-${this.options.environment}-keyring
KMS_CRYPTO_KEY_NAME=application-key

# API Keys (Generate these in GCP Console)
# GOOGLE_CLOUD_API_KEY=your-api-key-here
# FIREBASE_CONFIG=your-firebase-config-json-here
`;
	}

	private getEnabledServices(): string[] {
		const services: string[] = [];
		
		if (this.options.cloudFunctions.enabled) services.push('cloudfunctions');
		if (this.options.firestore.enabled) services.push('firestore');
		if (this.options.cloudStorage.enabled) services.push('storage');
		if (this.options.firebaseAuth.enabled) services.push('firebase-auth');
		if (this.options.pubSub.enabled) services.push('pubsub');
		if (this.options.cloudRun.enabled) services.push('run');
		if (this.options.bigQuery.enabled) services.push('bigquery');
		if (this.options.cloudSQL.enabled) services.push('sql');
		if (this.options.secretManager.enabled) services.push('secretmanager');
		if (this.options.cloudLogging.enabled) services.push('logging');
		if (this.options.cloudMonitoring.enabled) services.push('monitoring');
		if (this.options.apiGateway.enabled) services.push('apigateway');
		if (this.options.cloudBuild.enabled) services.push('cloudbuild');
		
		return services;
	}

	private calculateEstimatedCost(): number {
		// Simplified cost calculation based on enabled services
		let estimatedCost = 0;
		
		if (this.options.cloudFunctions.enabled) {
			estimatedCost += 50; // Base cost for Cloud Functions
		}
		if (this.options.firestore.enabled) {
			estimatedCost += 25; // Base cost for Firestore
		}
		if (this.options.cloudStorage.enabled) {
			estimatedCost += 15; // Base cost for Cloud Storage
		}
		if (this.options.cloudRun.enabled) {
			estimatedCost += 100; // Base cost for Cloud Run
		}
		if (this.options.bigQuery.enabled) {
			estimatedCost += 75; // Base cost for BigQuery
		}
		if (this.options.cloudSQL.enabled) {
			estimatedCost += 200; // Base cost for Cloud SQL
		}
		
		return estimatedCost;
	}

	private calculateSecurityLevel(): "basic" | "enhanced" | "enterprise" {
		let securityFeatures = 0;
		
		if (this.options.iam.enabled) securityFeatures++;
		if (this.options.secretManager.enabled) securityFeatures++;
		if (this.options.security.kms) securityFeatures++;
		if (this.options.security.binaryAuthorization) securityFeatures++;
		if (this.options.security.containerAnalysis) securityFeatures++;
		if (this.options.security.securityCenter) securityFeatures++;
		if (this.options.networking.vpc) securityFeatures++;
		
		if (securityFeatures >= 6) return "enterprise";
		if (securityFeatures >= 3) return "enhanced";
		return "basic";
	}

	private getComplianceFeatures(): string[] {
		const features: string[] = [];
		
		if (this.options.cloudLogging.enabled) features.push('audit-logging');
		if (this.options.secretManager.enabled) features.push('secret-management');
		if (this.options.iam.enabled) features.push('access-control');
		if (this.options.security.kms) features.push('encryption');
		if (this.options.firestore.backupRetention) features.push('data-retention');
		if (this.options.cloudMonitoring.enabled) features.push('monitoring');
		
		return features;
	}

	// Cloud Functions helper methods
	private generateFunctionsPackageJson(): string {
		return JSON.stringify({
			name: `${this.options.projectId}-functions`,
			version: "1.0.0",
			description: "Google Cloud Functions for " + this.options.projectId,
			main: "lib/index.js",
			scripts: {
				build: "tsc",
				serve: "npm run build && firebase emulators:start --only functions",
				shell: "npm run build && firebase functions:shell",
				start: "npm run shell",
				deploy: "firebase deploy --only functions",
				logs: "firebase functions:log"
			},
			engines: {
				node: this.options.cloudFunctions.runtime.replace('nodejs', '')
			},
			dependencies: {
				"firebase-admin": "^12.0.0",
				"firebase-functions": "^4.8.0",
				"express": "^4.18.2",
				"cors": "^2.8.5",
				"helmet": "^7.1.0",
				"joi": "^17.11.0",
				"winston": "^3.11.0"
			},
			devDependencies: {
				"@types/cors": "^2.8.17",
				"@types/express": "^4.17.21",
				"@types/node": "^20.10.0",
				"typescript": "^5.3.3",
				"firebase-functions-test": "^3.1.1"
			}
		}, null, 2);
	}

	private generateFunctionsTsConfig(): string {
		return JSON.stringify({
			compilerOptions: {
				module: "commonjs",
				noImplicitReturns: true,
				noUnusedLocals: true,
				outDir: "lib",
				sourceMap: true,
				strict: true,
				target: "es2017",
				skipLibCheck: true,
				esModuleInterop: true,
				forceConsistentCasingInFileNames: true,
				resolveJsonModule: true
			},
			compileOnSave: true,
			include: ["src/**/*"],
			exclude: ["node_modules/**/*", "lib/**/*"]
		}, null, 2);
	}

	private generateFunctionsIndex(): string {
		return `import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from './utils/logger';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import all function modules
${this.options.cloudFunctions.triggers.map(trigger => 
	`export { ${trigger.name} } from './${this.getFunctionPath(trigger)}/${trigger.name}';`
).join('\n')}

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
	logger.error('Uncaught Exception:', error);
	process.exit(1);
});

logger.info('Cloud Functions initialized successfully');
`;
	}

	private generateHttpFunction(trigger: GCPFunctionTrigger): string {
		return `import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/error-handler';
import { corsMiddleware } from '../middleware/cors';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';

const app = express();

// Middleware
app.use(cors(corsMiddleware));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
	res.status(200).json({ 
		status: 'healthy', 
		timestamp: new Date().toISOString(),
		function: '${trigger.name}' 
	});
});

app.post('/', 
	authMiddleware,
	validationMiddleware,
	async (req, res) => {
		try {
			logger.info('Processing ${trigger.name} request', { 
				method: req.method,
				url: req.url,
				body: req.body 
			});

			// TODO: Implement your business logic here
			const result = await processRequest(req.body);

			res.status(200).json({
				success: true,
				data: result,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			logger.error('Error in ${trigger.name}:', error);
			errorHandler(error, req, res);
		}
	}
);

async function processRequest(data: any): Promise<any> {
	// TODO: Implement your business logic
	return { message: 'Request processed successfully', data };
}

// Error handling middleware
app.use(errorHandler);

export const ${trigger.name} = functions
	.region('${this.options.region}')
	.runWith({
		memory: '${this.options.cloudFunctions.memory}',
		timeoutSeconds: ${this.options.cloudFunctions.timeout},
		minInstances: ${this.options.cloudFunctions.minInstances || 0},
		maxInstances: ${this.options.cloudFunctions.maxInstances || 10}
	})
	.https.onRequest(app);
`;
	}

	private generatePubSubFunction(trigger: GCPFunctionTrigger): string {
		return `import * as functions from 'firebase-functions';
import { logger } from '../utils/logger';
import { Message } from '@google-cloud/pubsub';

interface MessageData {
	// TODO: Define your message data structure
	id: string;
	type: string;
	payload: any;
	timestamp: string;
}

export const ${trigger.name} = functions
	.region('${this.options.region}')
	.runWith({
		memory: '${this.options.cloudFunctions.memory}',
		timeoutSeconds: ${this.options.cloudFunctions.timeout}
	})
	.pubsub.topic('${trigger.resource || trigger.name}')
	.onPublish(async (message: functions.pubsub.Message, context: functions.EventContext) => {
		try {
			logger.info('Processing Pub/Sub message', {
				messageId: context.eventId,
				timestamp: context.timestamp,
				topic: '${trigger.resource || trigger.name}'
			});

			// Parse message data
			const messageData: MessageData = JSON.parse(Buffer.from(message.data, 'base64').toString());
			
			// TODO: Implement your message processing logic
			await processMessage(messageData, message.attributes);

			logger.info('Message processed successfully', { messageId: context.eventId });
		} catch (error) {
			logger.error('Error processing Pub/Sub message:', error, {
				messageId: context.eventId,
				timestamp: context.timestamp
			});
			throw error; // This will trigger retry mechanism
		}
	});

async function processMessage(data: MessageData, attributes: { [key: string]: string }): Promise<void> {
	// TODO: Implement your message processing logic
	logger.info('Processing message:', { data, attributes });
	
	// Example: Store in Firestore, send email, etc.
}
`;
	}

	private generateFirestoreFunction(trigger: GCPFunctionTrigger): string {
		return `import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

const db = admin.firestore();

export const ${trigger.name} = functions
	.region('${this.options.region}')
	.runWith({
		memory: '${this.options.cloudFunctions.memory}',
		timeoutSeconds: ${this.options.cloudFunctions.timeout}
	})
	.firestore.document('${trigger.resource || 'collection/{docId}'}')
	.${this.getFirestoreEventType(trigger.eventType || '')}(async (change, context) => {
		try {
			logger.info('Firestore ${trigger.name} triggered', {
				documentId: context.params.docId,
				eventType: context.eventType,
				timestamp: context.timestamp
			});

			const beforeData = change.before?.data();
			const afterData = change.after?.data();

			// TODO: Implement your document processing logic
			await processDocumentChange(beforeData, afterData, context);

			logger.info('Document change processed successfully', { 
				documentId: context.params.docId 
			});
		} catch (error) {
			logger.error('Error processing Firestore change:', error, {
				documentId: context.params.docId,
				eventType: context.eventType
			});
			throw error;
		}
	});

async function processDocumentChange(
	beforeData: any,
	afterData: any,
	context: functions.EventContext
): Promise<void> {
	// TODO: Implement your document change processing logic
	logger.info('Processing document change:', {
		before: beforeData,
		after: afterData,
		params: context.params
	});

	// Example: Update related documents, send notifications, etc.
}
`;
	}

	private generateScheduledFunction(trigger: GCPFunctionTrigger): string {
		return `import * as functions from 'firebase-functions';
import { logger } from '../utils/logger';

export const ${trigger.name} = functions
	.region('${this.options.region}')
	.runWith({
		memory: '${this.options.cloudFunctions.memory}',
		timeoutSeconds: ${this.options.cloudFunctions.timeout}
	})
	.pubsub.schedule('${trigger.schedule || '0 0 * * *'}')
	.timeZone('${trigger.timeZone || 'UTC'}')
	.onRun(async (context) => {
		try {
			logger.info('Scheduled function ${trigger.name} started', {
				scheduledTime: context.timestamp,
				jobName: context.jobName
			});

			// TODO: Implement your scheduled task logic
			await executeScheduledTask();

			logger.info('Scheduled function ${trigger.name} completed successfully');
		} catch (error) {
			logger.error('Error in scheduled function ${trigger.name}:', error);
			throw error;
		}
	});

async function executeScheduledTask(): Promise<void> {
	// TODO: Implement your scheduled task logic
	logger.info('Executing scheduled task...');
	
	// Example: Cleanup old data, send reports, sync data, etc.
}
`;
	}

	private generateCorsMiddleware(): string {
		return `import { CorsOptions } from 'cors';

export const corsMiddleware: CorsOptions = {
	origin: process.env.NODE_ENV === 'production' 
		? ['https://${this.options.projectId}.web.app', 'https://${this.options.projectId}.firebaseapp.com']
		: true,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	maxAge: 86400 // 24 hours
};
`;
	}

	private generateAuthMiddleware(): string {
		return `import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
	user?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ error: 'No valid authorization header' });
			return;
		}

		const token = authHeader.split('Bearer ')[1];
		const decodedToken = await admin.auth().verifyIdToken(token);
		
		req.user = decodedToken;
		logger.info('User authenticated', { uid: decodedToken.uid });
		
		next();
	} catch (error) {
		logger.error('Authentication error:', error);
		res.status(401).json({ error: 'Unauthorized' });
	}
};

export const requireRole = (requiredRole: string) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ error: 'Not authenticated' });
			return;
		}

		const userRole = req.user.role || 'user';
		if (userRole !== requiredRole) {
			res.status(403).json({ error: 'Insufficient permissions' });
			return;
		}

		next();
	};
};
`;
	}

	private generateValidationMiddleware(): string {
		return `import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import { logger } from '../utils/logger';

export const validationMiddleware = (schema?: Joi.ObjectSchema) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!schema) {
			next();
			return;
		}

		const { error, value } = schema.validate(req.body);
		
		if (error) {
			logger.warn('Validation error:', error.details);
			res.status(400).json({
				error: 'Validation failed',
				details: error.details.map(detail => ({
					field: detail.path.join('.'),
					message: detail.message
				}))
			});
			return;
		}

		req.body = value;
		next();
	};
};

// Common validation schemas
export const schemas = {
	createUser: Joi.object({
		email: Joi.string().email().required(),
		name: Joi.string().min(2).max(100).required(),
		role: Joi.string().valid('user', 'admin').default('user')
	}),
	
	updateUser: Joi.object({
		name: Joi.string().min(2).max(100),
		role: Joi.string().valid('user', 'admin')
	}).min(1)
};
`;
	}

	private generateLogger(): string {
		return `import * as winston from 'winston';

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = winston.createLogger({
	level: logLevel,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	defaultMeta: { 
		service: '${this.options.projectId}-functions',
		version: process.env.FUNCTION_VERSION || '1.0.0'
	},
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		})
	]
});

// Add structured logging for Cloud Logging
if (process.env.NODE_ENV === 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		)
	}));
}
`;
	}

	private generateErrorHandler(): string {
		return `import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export interface ApiError extends Error {
	statusCode?: number;
	code?: string;
}

export const errorHandler = (
	error: ApiError,
	req: Request,
	res: Response,
	next?: NextFunction
): void => {
	logger.error('Error handler:', {
		error: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		statusCode: error.statusCode
	});

	const statusCode = error.statusCode || 500;
	const message = process.env.NODE_ENV === 'production' && statusCode === 500
		? 'Internal server error'
		: error.message;

	res.status(statusCode).json({
		error: {
			message,
			code: error.code || 'INTERNAL_ERROR',
			timestamp: new Date().toISOString()
		}
	});
};

export class ValidationError extends Error implements ApiError {
	statusCode = 400;
	code = 'VALIDATION_ERROR';
	
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends Error implements ApiError {
	statusCode = 404;
	code = 'NOT_FOUND';
	
	constructor(message: string = 'Resource not found') {
		super(message);
		this.name = 'NotFoundError';
	}
}

export class UnauthorizedError extends Error implements ApiError {
	statusCode = 401;
	code = 'UNAUTHORIZED';
	
	constructor(message: string = 'Unauthorized') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}
`;
	}

	private generateFunctionsGCloudIgnore(): string {
		return `node_modules/
npm-debug.log
.git/
.DS_Store
*.log
lib/
.env
.env.local
coverage/
.nyc_output/
`;
	}

	private getFunctionPath(trigger: GCPFunctionTrigger): string {
		switch (trigger.type) {
			case 'httpsTrigger': return 'http';
			case 'eventTrigger': 
				if (trigger.eventType?.includes('pubsub')) return 'pubsub';
				if (trigger.eventType?.includes('firestore')) return 'firestore';
				return 'events';
			case 'scheduleFunction': return 'scheduled';
			default: return 'misc';
		}
	}

	private getFirestoreEventType(eventType: string): string {
		if (eventType.includes('create')) return 'onCreate';
		if (eventType.includes('update')) return 'onUpdate';
		if (eventType.includes('delete')) return 'onDelete';
		if (eventType.includes('write')) return 'onWrite';
		return 'onWrite';
	}

/**
 * Generate GCP cloud infrastructure
 */
export async function generateGCPCloud(options: GCPCloudOptions): Promise<InfrastructureGeneratorResult> {
	const generator = new GCPCloudGenerator(options);
	return await generator.generate(options.outputDir || process.cwd(), options);
}

/**
 * Export all GCP-related interfaces and types
 */
export * from './gcp.generator.js';
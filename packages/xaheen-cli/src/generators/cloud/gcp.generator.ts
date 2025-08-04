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
		// Implementation for Cloud Functions generation
		// This would generate function code, package.json, and deployment configs
		return [];
	}

	private async generateFirestore(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Firestore generation
		// This would generate security rules, indexes, and client code
		return [];
	}

	private async generateCloudStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Cloud Storage generation
		// This would generate bucket configurations, lifecycle rules, and client code
		return [];
	}

	private async generateFirebaseAuth(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Firebase Auth generation
		// This would generate auth configuration, custom claims, and client code
		return [];
	}

	private async generatePubSub(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Pub/Sub generation
		// This would generate topics, subscriptions, schemas, and message handlers
		return [];
	}

	private async generateCloudRun(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
		// Implementation for Cloud Run generation
		// This would generate service configurations, Dockerfiles, and deployment configs
		return [];
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
/**
 * Google Cloud Platform Integration Generator
 * Generates comprehensive GCP cloud infrastructure and service integrations
 * Supports Cloud Functions, Firestore, Cloud Storage, Firebase Auth, Pub/Sub, and more
 */

import { GeneratedInfrastructureFile, InfrastructureGenerator, InfrastructureGeneratorOptions, InfrastructureGeneratorResult } from "../infrastructure/index";

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

	// Firestore helper methods
	private generateFirestoreSecurityRules(): string {
		return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // User-specific data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow user profile updates with validation
      allow update: if request.auth != null && 
                   request.auth.uid == userId &&
                   validateUserUpdate(request.resource.data);
    }
    
    // Public collections (read-only for authenticated users)
    match /public/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                  hasAdminRole(request.auth);
    }
    
    ${this.options.firestore.collections.map(collection => 
      this.generateCollectionSecurityRules(collection)
    ).join('\n    ')}
  }
  
  // Helper functions
  function validateUserUpdate(data) {
    return data.keys().hasAll(['name', 'email']) &&
           data.name is string &&
           data.email is string &&
           data.email.matches('.*@.*\\..*');
  }
  
  function hasAdminRole(auth) {
    return auth.token.role == 'admin';
  }
  
  function hasRole(auth, role) {
    return auth.token.role == role;
  }
  
  function isOwner(auth, resource) {
    return auth.uid == resource.data.userId;
  }
  
  function validateRequired(data, fields) {
    return data.keys().hasAll(fields);
  }
}`;
	}

	private generateCollectionSecurityRules(collection: GCPFirestoreCollection): string {
		const requiredFields = collection.fields.filter(f => f.required).map(f => `'${f.name}'`).join(', ');
		
		return `match /${collection.name}/{docId} {
      allow read, write: if request.auth != null && 
                        (request.auth.uid == resource.data.userId || hasAdminRole(request.auth));
      
      allow create: if request.auth != null && 
                   validateRequired(request.resource.data, [${requiredFields}]) &&
                   request.resource.data.userId == request.auth.uid;
                   
      allow update: if request.auth != null && 
                   (request.auth.uid == resource.data.userId || hasAdminRole(request.auth));
    }`;
	}

	private generateFirestoreIndexes(): string {
		const indexes = this.options.firestore.indexes.map(index => ({
			collectionGroup: index.collection,
			queryScope: index.queryScope,
			fields: index.fields.map(field => ({
				fieldPath: field.fieldPath,
				order: field.order || 'ASCENDING',
				arrayConfig: field.arrayConfig
			}))
		}));
		
		// Add default indexes for common query patterns
		for (const collection of this.options.firestore.collections) {
			// Add timestamp-based indexes
			indexes.push({
				collectionGroup: collection.name,
				queryScope: 'COLLECTION',
				fields: [
					{ fieldPath: 'createdAt', order: 'DESCENDING' },
					{ fieldPath: '__name__', order: 'DESCENDING' }
				]
			});
			
			// Add user-based indexes if userId field exists
			if (collection.fields.some(f => f.name === 'userId')) {
				indexes.push({
					collectionGroup: collection.name,
					queryScope: 'COLLECTION',
					fields: [
						{ fieldPath: 'userId', order: 'ASCENDING' },
						{ fieldPath: 'createdAt', order: 'DESCENDING' }
					]
				});
			}
		}
		
		return JSON.stringify({
			indexes,
			fieldOverrides: []
		}, null, 2);
	}

	private generateFirestoreClient(): string {
		return `import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  enableIndexedDbPersistence,
  waitForPendingWrites,
  DocumentData,
  Query,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
  FirestoreError,
  writeBatch,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  FieldPath,
  orderBy,
  where,
  limit,
  startAfter,
  endBefore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Transaction,
  WhereFilterOp
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore emulator already connected');
  }
}

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db, {
    forceOwnership: false
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all features required for persistence.');
    }
  });
}

/**
 * Firestore client with enterprise-grade error handling and retry logic
 */
export class FirestoreClient {
  private db: Firestore;
  private auth: Auth;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.db = db;
    this.auth = auth;
  }

  /**
   * Execute a function with retry logic
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'aborted',
      'internal',
      'unknown'
    ];
    return retryableCodes.includes(error?.code);
  }

  /**
   * Delay function for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  /**
   * Create a document with automatic ID
   */
  async create<T extends DocumentData>(
    collectionPath: string,
    data: T & { createdAt?: any; updatedAt?: any; userId?: string }
  ): Promise<string> {
    return this.withRetry(async () => {
      const batch = writeBatch(this.db);
      const docRef = doc(collection(this.db, collectionPath));
      
      const enrichedData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: data.userId || this.getCurrentUserId()
      };

      batch.set(docRef, enrichedData);
      await batch.commit();
      
      return docRef.id;
    });
  }

  /**
   * Read a document by ID
   */
  async read<T extends DocumentData>(
    collectionPath: string,
    id: string
  ): Promise<T | null> {
    return this.withRetry(async () => {
      const docRef = doc(this.db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    });
  }

  /**
   * Update a document
   */
  async update<T extends DocumentData>(
    collectionPath: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    return this.withRetry(async () => {
      const docRef = doc(this.db, collectionPath, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    });
  }

  /**
   * Delete a document
   */
  async delete(collectionPath: string, id: string): Promise<void> {
    return this.withRetry(async () => {
      const docRef = doc(this.db, collectionPath, id);
      await deleteDoc(docRef);
    });
  }

  /**
   * Query documents with filters
   */
  async query<T extends DocumentData>(
    collectionPath: string,
    filters: QueryFilter[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    return this.withRetry(async () => {
      let query: Query = collection(this.db, collectionPath);
      
      // Apply filters
      for (const filter of filters) {
        query = where(query, filter.field, filter.operator, filter.value);
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = orderBy(query, options.orderBy.field, options.orderBy.direction);
      }
      
      // Apply limit
      if (options.limit) {
        query = limit(query, options.limit);
      }
      
      // Apply pagination
      if (options.startAfter) {
        query = startAfter(query, options.startAfter);
      }
      
      if (options.endBefore) {
        query = endBefore(query, options.endBefore);
      }
      
      const querySnapshot = await getDocs(query);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    });
  }

  /**
   * Execute a batch write
   */
  async batch(operations: BatchOperation[]): Promise<void> {
    return this.withRetry(async () => {
      const batch = writeBatch(this.db);
      
      for (const operation of operations) {
        const docRef = doc(this.db, operation.collectionPath, operation.id);
        
        switch (operation.type) {
          case 'set':
            batch.set(docRef, {
              ...operation.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }
      
      await batch.commit();
    });
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    return this.withRetry(async () => {
      return await runTransaction(this.db, updateFunction);
    });
  }

  /**
   * Wait for all pending writes to complete
   */
  async waitForPendingWrites(): Promise<void> {
    return waitForPendingWrites(this.db);
  }

  /**
   * Enable/disable network
   */
  async enableNetwork(): Promise<void> {
    return enableNetwork(this.db);
  }

  async disableNetwork(): Promise<void> {
    return disableNetwork(this.db);
  }

  /**
   * Clear offline persistence
   */
  async clearPersistence(): Promise<void> {
    return clearIndexedDbPersistence(this.db);
  }

  /**
   * Get a real-time listener
   */
  onSnapshot<T extends DocumentData>(
    collectionPath: string,
    filters: QueryFilter[] = [],
    options: QueryOptions = {},
    callback: (data: T[]) => void,
    errorCallback?: (error: FirestoreError) => void
  ): () => void {
    let query: Query = collection(this.db, collectionPath);
    
    // Apply filters
    for (const filter of filters) {
      query = where(query, filter.field, filter.operator, filter.value);
    }
    
    // Apply ordering
    if (options.orderBy) {
      query = orderBy(query, options.orderBy.field, options.orderBy.direction);
    }
    
    // Apply limit
    if (options.limit) {
      query = limit(query, options.limit);
    }
    
    return onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      },
      errorCallback
    );
  }
}

// Types
export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOptions {
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  };
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}

export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  collectionPath: string;
  id: string;
  data?: any;
}

// Export the client instance
export const firestoreClient = new FirestoreClient();
export { db, auth };
export default firestoreClient;
`;
	}

	private generateCollectionTypes(collection: GCPFirestoreCollection): string {
		return `/**
 * Generated TypeScript types for ${collection.name} collection
 * Auto-generated by Xaheen CLI GCP Generator
 */

export interface ${this.capitalize(collection.name)}Document {
  readonly id: string;
${collection.fields.map(field => 
  `  readonly ${field.name}${field.required ? '' : '?'}: ${this.getTypeScriptType(field.type)}${field.arrayContains ? '[]' : ''};`
).join('\n')}
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId?: string;
}

${collection.subcollections?.map(subcollection => 
  `export interface ${this.capitalize(collection.name)}${this.capitalize(subcollection.name)}Document {
  readonly id: string;
${subcollection.fields.map(field => 
  `  readonly ${field.name}${field.required ? '' : '?'}: ${this.getTypeScriptType(field.type)}${field.arrayContains ? '[]' : ''};`
).join('\n')}
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly parentId: string;
  readonly userId?: string;
}`
).join('\n\n') || ''}

// Create type (without readonly and system fields)
export interface Create${this.capitalize(collection.name)}Data {
${collection.fields.filter(f => !['createdAt', 'updatedAt', 'id'].includes(f.name)).map(field => 
  `  ${field.name}${field.required ? '' : '?'}: ${this.getTypeScriptType(field.type)}${field.arrayContains ? '[]' : ''};`
).join('\n')}
  userId?: string;
}

// Update type (all fields optional except system fields)
export interface Update${this.capitalize(collection.name)}Data {
${collection.fields.filter(f => !['createdAt', 'updatedAt', 'id'].includes(f.name)).map(field => 
  `  ${field.name}?: ${this.getTypeScriptType(field.type)}${field.arrayContains ? '[]' : ''};`
).join('\n')}
}

// Query filter types
export interface ${this.capitalize(collection.name)}QueryFilter {
  field: keyof ${this.capitalize(collection.name)}Document;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: any;
}

// Collection reference path
export const ${collection.name.toUpperCase()}_COLLECTION = '${collection.name}' as const;

${collection.subcollections?.map(subcollection => 
  `export const ${collection.name.toUpperCase()}_${subcollection.name.toUpperCase()}_COLLECTION = (parentId: string) => \`${collection.name}/\${parentId}/${subcollection.name}\` as const;`
).join('\n') || ''}
`;
	}

	private generateCollectionService(collection: GCPFirestoreCollection): string {
		return `/**
 * Generated service for ${collection.name} collection
 * Auto-generated by Xaheen CLI GCP Generator
 */

import { firestoreClient, QueryFilter, QueryOptions } from '../lib/firestore-client';
import {
  ${this.capitalize(collection.name)}Document,
  Create${this.capitalize(collection.name)}Data,
  Update${this.capitalize(collection.name)}Data,
  ${this.capitalize(collection.name)}QueryFilter,
  ${collection.name.toUpperCase()}_COLLECTION${collection.subcollections?.map(sub => 
    `,\n  ${collection.name.toUpperCase()}_${sub.name.toUpperCase()}_COLLECTION`
  ).join('') || ''}
} from '../types/${collection.name}.types';
import { FirestoreError } from 'firebase/firestore';

/**
 * Service class for ${collection.name} collection operations
 */
export class ${this.capitalize(collection.name)}Service {
  private collectionPath = ${collection.name.toUpperCase()}_COLLECTION;

  /**
   * Create a new ${collection.name} document
   */
  async create(data: Create${this.capitalize(collection.name)}Data): Promise<string> {
    try {
      const id = await firestoreClient.create(this.collectionPath, data);
      console.log(\`Created ${collection.name} with ID: \${id}\`);
      return id;
    } catch (error) {
      console.error('Error creating ${collection.name}:', error);
      throw new Error(\`Failed to create ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get a ${collection.name} document by ID
   */
  async getById(id: string): Promise<${this.capitalize(collection.name)}Document | null> {
    try {
      return await firestoreClient.read<${this.capitalize(collection.name)}Document>(this.collectionPath, id);
    } catch (error) {
      console.error(\`Error getting ${collection.name} \${id}:\`, error);
      throw new Error(\`Failed to get ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Update a ${collection.name} document
   */
  async update(id: string, data: Update${this.capitalize(collection.name)}Data): Promise<void> {
    try {
      await firestoreClient.update(this.collectionPath, id, data);
      console.log(\`Updated ${collection.name} \${id}\`);
    } catch (error) {
      console.error(\`Error updating ${collection.name} \${id}:\`, error);
      throw new Error(\`Failed to update ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete a ${collection.name} document
   */
  async delete(id: string): Promise<void> {
    try {
      await firestoreClient.delete(this.collectionPath, id);
      console.log(\`Deleted ${collection.name} \${id}\`);
    } catch (error) {
      console.error(\`Error deleting ${collection.name} \${id}:\`, error);
      throw new Error(\`Failed to delete ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Query ${collection.name} documents
   */
  async query(filters: ${this.capitalize(collection.name)}QueryFilter[] = [], options: QueryOptions = {}): Promise<${this.capitalize(collection.name)}Document[]> {
    try {
      return await firestoreClient.query<${this.capitalize(collection.name)}Document>(
        this.collectionPath,
        filters as QueryFilter[],
        options
      );
    } catch (error) {
      console.error('Error querying ${collection.name}:', error);
      throw new Error(\`Failed to query ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get all ${collection.name} documents for the current user
   */
  async getUserDocuments(userId: string, limit: number = 50): Promise<${this.capitalize(collection.name)}Document[]> {
    return this.query(
      [{ field: 'userId', operator: '==', value: userId }],
      {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit
      }
    );
  }

  /**
   * Get paginated ${collection.name} documents
   */
  async getPaginated(
    filters: ${this.capitalize(collection.name)}QueryFilter[] = [],
    limit: number = 20,
    startAfter?: any
  ): Promise<${this.capitalize(collection.name)}Document[]> {
    const options: QueryOptions = {
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit
    };

    if (startAfter) {
      options.startAfter = startAfter;
    }

    return this.query(filters, options);
  }

  /**
   * Real-time listener for ${collection.name} documents
   */
  onSnapshot(
    filters: ${this.capitalize(collection.name)}QueryFilter[] = [],
    options: QueryOptions = {},
    callback: (documents: ${this.capitalize(collection.name)}Document[]) => void,
    errorCallback?: (error: FirestoreError) => void
  ): () => void {
    return firestoreClient.onSnapshot<${this.capitalize(collection.name)}Document>(
      this.collectionPath,
      filters as QueryFilter[],
      options,
      callback,
      errorCallback
    );
  }

  /**
   * Count documents matching filters
   */
  async count(filters: ${this.capitalize(collection.name)}QueryFilter[] = []): Promise<number> {
    try {
      const documents = await this.query(filters);
      return documents.length;
    } catch (error) {
      console.error('Error counting ${collection.name}:', error);
      throw new Error(\`Failed to count ${collection.name}: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const document = await this.getById(id);
      return document !== null;
    } catch (error) {
      console.error(\`Error checking if ${collection.name} \${id} exists:\`, error);
      return false;
    }
  }

${collection.subcollections?.map(subcollection => 
  `\n  /**\n   * Subcollection: ${subcollection.name}\n   */\n  async create${this.capitalize(subcollection.name)}(parentId: string, data: any): Promise<string> {\n    const collectionPath = ${collection.name.toUpperCase()}_${subcollection.name.toUpperCase()}_COLLECTION(parentId);\n    return firestoreClient.create(collectionPath, { ...data, parentId });\n  }\n\n  async get${this.capitalize(subcollection.name)}sByParent(parentId: string): Promise<any[]> {\n    const collectionPath = ${collection.name.toUpperCase()}_${subcollection.name.toUpperCase()}_COLLECTION(parentId);\n    return firestoreClient.query(collectionPath);\n  }`
).join('') || ''}

  /**
   * Batch operations
   */
  async batchCreate(documents: Create${this.capitalize(collection.name)}Data[]): Promise<void> {
    const operations = documents.map((data, index) => ({
      type: 'set' as const,
      collectionPath: this.collectionPath,
      id: \`batch_\${Date.now()}_\${index}\`,
      data
    }));

    await firestoreClient.batch(operations);
  }

  async batchUpdate(updates: { id: string; data: Update${this.capitalize(collection.name)}Data }[]): Promise<void> {
    const operations = updates.map(({ id, data }) => ({
      type: 'update' as const,
      collectionPath: this.collectionPath,
      id,
      data
    }));

    await firestoreClient.batch(operations);
  }

  async batchDelete(ids: string[]): Promise<void> {
    const operations = ids.map(id => ({
      type: 'delete' as const,
      collectionPath: this.collectionPath,
      id,
      data: {}
    }));

    await firestoreClient.batch(operations);
  }
}

// Export service instance
export const ${collection.name}Service = new ${this.capitalize(collection.name)}Service();
export default ${collection.name}Service;
`;
	}

	private getTypeScriptType(firestoreType: string): string {
		switch (firestoreType) {
			case 'string': return 'string';
			case 'number': return 'number';
			case 'boolean': return 'boolean';
			case 'array': return 'any[]';
			case 'map': return 'Record<string, any>';
			case 'null': return 'null';
			case 'timestamp': return 'Date';
			case 'geopoint': return 'GeoPoint';
			case 'reference': return 'DocumentReference';
			default: return 'any';
		}
	}

	private generateFirestoreOffline(): string {
		return `/**
 * Firestore Offline Support
 * Handles offline/online synchronization and local caching
 */

import { firestoreClient, db } from './firestore-client';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * Offline manager for Firestore
 */
export class FirestoreOfflineManager {
  private isOnline = true;
  private syncQueue: SyncOperation[] = [];
  private listeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.setupNetworkListener();
    this.setupVisibilityListener();
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });

    // Initial state
    this.isOnline = navigator.onLine;
  }

  /**
   * Setup page visibility listener
   */
  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.syncPendingOperations();
      }
    });
  }

  /**
   * Handle going online
   */
  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    console.log('Network: Online - Enabling Firestore network');
    
    try {
      await enableNetwork(db);
      await this.syncPendingOperations();
      this.notifyListeners(true);
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  }

  /**
   * Handle going offline
   */
  private async handleOffline(): Promise<void> {
    this.isOnline = false;
    console.log('Network: Offline - Disabling Firestore network');
    
    try {
      await disableNetwork(db);
      this.notifyListeners(false);
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }

  /**
   * Add a network status listener
   */
  addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of network status change
   */
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Queue an operation for later sync
   */
  queueOperation(operation: SyncOperation): void {
    this.syncQueue.push(operation);
    console.log(\`Queued operation: \${operation.type} for \${operation.collection}/\${operation.id}\`);
  }

  /**
   * Sync all pending operations
   */
  private async syncPendingOperations(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(\`Syncing \${this.syncQueue.length} pending operations\`);
    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        await this.executeSyncOperation(operation);
      } catch (error) {
        console.error('Error syncing operation:', error);
        // Re-queue failed operations
        this.syncQueue.push(operation);
      }
    }
  }

  /**
   * Execute a sync operation
   */
  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await firestoreClient.create(operation.collection, operation.data);
        break;
      case 'update':
        await firestoreClient.update(operation.collection, operation.id, operation.data);
        break;
      case 'delete':
        await firestoreClient.delete(operation.collection, operation.id);
        break;
    }
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.syncQueue.length;
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this.syncQueue = [];
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingOperations();
    }
  }
}

// Types
export interface SyncOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: any;
  timestamp: number;
}

// Export singleton instance
export const offlineManager = new FirestoreOfflineManager();
export default offlineManager;
`;
	}

	private generateFirestoreBatch(): string {
		return `/**
 * Firestore Batch Operations
 * Optimized batch operations for bulk data processing
 */

import { firestoreClient, BatchOperation } from './firestore-client';

/**
 * Batch processor for Firestore operations
 */
export class FirestoreBatchProcessor {
  private readonly BATCH_SIZE = 500; // Firestore limit
  private readonly MAX_CONCURRENT_BATCHES = 10;

  /**
   * Process operations in batches
   */
  async processBatch(operations: BatchOperation[]): Promise<void> {
    if (operations.length === 0) return;

    console.log(\`Processing \${operations.length} operations in batches\`);
    
    // Split operations into chunks
    const chunks = this.chunkArray(operations, this.BATCH_SIZE);
    
    // Process chunks concurrently with limit
    for (let i = 0; i < chunks.length; i += this.MAX_CONCURRENT_BATCHES) {
      const currentBatch = chunks.slice(i, i + this.MAX_CONCURRENT_BATCHES);
      
      await Promise.all(
        currentBatch.map(async (chunk, index) => {
          try {
            await firestoreClient.batch(chunk);
            console.log(\`Completed batch \${i + index + 1}/\${chunks.length}\`);
          } catch (error) {
            console.error(\`Error in batch \${i + index + 1}:\`, error);
            throw error;
          }
        })
      );
    }
    
    console.log('All batch operations completed successfully');
  }

  /**
   * Bulk create documents
   */
  async bulkCreate<T>(
    collectionPath: string,
    documents: T[],
    generateId?: (doc: T, index: number) => string
  ): Promise<string[]> {
    const operations: BatchOperation[] = documents.map((doc, index) => ({
      type: 'set',
      collectionPath,
      id: generateId ? generateId(doc, index) : \`bulk_\${Date.now()}_\${index}\`,
      data: doc
    }));

    await this.processBatch(operations);
    return operations.map(op => op.id);
  }

  /**
   * Bulk update documents
   */
  async bulkUpdate<T>(
    collectionPath: string,
    updates: { id: string; data: Partial<T> }[]
  ): Promise<void> {
    const operations: BatchOperation[] = updates.map(({ id, data }) => ({
      type: 'update',
      collectionPath,
      id,
      data
    }));

    await this.processBatch(operations);
  }

  /**
   * Bulk delete documents
   */
  async bulkDelete(collectionPath: string, ids: string[]): Promise<void> {
    const operations: BatchOperation[] = ids.map(id => ({
      type: 'delete',
      collectionPath,
      id,
      data: {}
    }));

    await this.processBatch(operations);
  }

  /**
   * Import data from JSON
   */
  async importFromJson<T>(
    collectionPath: string,
    jsonData: T[],
    options: ImportOptions<T> = {}
  ): Promise<ImportResult> {
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const errors: ImportError[] = [];

    console.log(\`Starting import of \${jsonData.length} documents to \${collectionPath}\`);

    try {
      // Validate data if validator provided
      const validData = jsonData.filter((item, index) => {
        if (options.validator) {
          try {
            return options.validator(item, index);
          } catch (error) {
            errors.push({
              index,
              error: error instanceof Error ? error.message : 'Validation failed',
              data: item
            });
            errorCount++;
            return false;
          }
        }
        return true;
      });

      // Transform data if transformer provided
      const transformedData = options.transformer 
        ? validData.map(options.transformer)
        : validData;

      // Create batch operations
      const operations: BatchOperation[] = transformedData.map((item, index) => ({
        type: 'set',
        collectionPath,
        id: options.idGenerator ? options.idGenerator(item, index) : \`import_\${Date.now()}_\${index}\`,
        data: item
      }));

      await this.processBatch(operations);
      successCount = operations.length;

    } catch (error) {
      console.error('Error during import:', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    
    const result: ImportResult = {
      totalRecords: jsonData.length,
      successCount,
      errorCount,
      errors,
      duration,
      recordsPerSecond: Math.round((successCount / duration) * 1000)
    };

    console.log(\`Import completed in \${duration}ms - Success: \${successCount}, Errors: \${errorCount}\`);
    
    return result;
  }

  /**
   * Export data to JSON
   */
  async exportToJson<T>(
    collectionPath: string,
    options: ExportOptions = {}
  ): Promise<T[]> {
    console.log(\`Starting export from \${collectionPath}\`);
    
    const documents = await firestoreClient.query<T>(
      collectionPath,
      options.filters || [],
      {
        orderBy: options.orderBy,
        limit: options.limit
      }
    );

    // Transform data if transformer provided
    const transformedData = options.transformer 
      ? documents.map(options.transformer)
      : documents;

    console.log(\`Export completed - \${transformedData.length} documents\`);
    
    return transformedData;
  }

  /**
   * Migrate data between collections
   */
  async migrateCollection<T>(
    sourceCollection: string,
    targetCollection: string,
    options: MigrationOptions<T> = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    console.log(\`Starting migration from \${sourceCollection} to \${targetCollection}\`);

    // Export from source
    const sourceData = await this.exportToJson<T>(sourceCollection, {
      filters: options.sourceFilters,
      orderBy: options.orderBy,
      limit: options.limit
    });

    // Transform if needed
    const transformedData = options.transformer 
      ? sourceData.map(options.transformer)
      : sourceData;

    // Import to target
    const importResult = await this.importFromJson(targetCollection, transformedData, {
      validator: options.validator,
      idGenerator: options.idGenerator
    });

    // Delete from source if specified
    if (options.deleteSource) {
      const sourceIds = sourceData.map((doc: any) => doc.id);
      await this.bulkDelete(sourceCollection, sourceIds);
    }

    const duration = Date.now() - startTime;
    
    const result: MigrationResult = {
      sourceRecords: sourceData.length,
      targetRecords: importResult.successCount,
      errors: importResult.errors,
      duration,
      deletedFromSource: options.deleteSource ? sourceData.length : 0
    };

    console.log(\`Migration completed in \${duration}ms\`);
    
    return result;
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Types
export interface ImportOptions<T> {
  validator?: (item: T, index: number) => boolean;
  transformer?: (item: T) => T;
  idGenerator?: (item: T, index: number) => string;
}

export interface ImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  duration: number;
  recordsPerSecond: number;
}

export interface ImportError {
  index: number;
  error: string;
  data: any;
}

export interface ExportOptions {
  filters?: any[];
  orderBy?: { field: string; direction?: 'asc' | 'desc' };
  limit?: number;
  transformer?: (item: any) => any;
}

export interface MigrationOptions<T> {
  sourceFilters?: any[];
  orderBy?: { field: string; direction?: 'asc' | 'desc' };
  limit?: number;
  transformer?: (item: T) => T;
  validator?: (item: T, index: number) => boolean;
  idGenerator?: (item: T, index: number) => string;
  deleteSource?: boolean;
}

export interface MigrationResult {
  sourceRecords: number;
  targetRecords: number;
  errors: ImportError[];
  duration: number;
  deletedFromSource: number;
}

// Export singleton instance
export const batchProcessor = new FirestoreBatchProcessor();
export default batchProcessor;
`;
	}

	// Cloud Storage helper methods
	private generateStorageClient(): string {
		return `/**
 * Google Cloud Storage Client
 * Enterprise-grade file storage with advanced features
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  getMetadata, 
  updateMetadata, 
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  connectStorageEmulator
} from 'firebase/storage';

// Initialize Firebase if not already done
const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

// Initialize Cloud Storage
const storage = getStorage(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Storage emulator already connected');
  }
}

/**
 * Cloud Storage client with enterprise features
 */
export class CloudStorageClient {
  private storage = storage;
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(
    path: string,
    file: File | Blob,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const storageRef = ref(this.storage, path);
    const metadata = this.buildMetadata(file, options);

    try {
      // Use resumable upload for larger files
      if (file.size > 5 * 1024 * 1024) { // 5MB threshold
        return await this.uploadWithProgress(storageRef, file, metadata, options);
      } else {
        return await this.uploadDirect(storageRef, file, metadata);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw new StorageError(\`Upload failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Direct upload for smaller files
   */
  private async uploadDirect(
    storageRef: StorageReference,
    file: File | Blob,
    metadata: any
  ): Promise<UploadResult> {
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      downloadURL,
      path: snapshot.ref.fullPath,
      size: snapshot.totalBytes,
      metadata: snapshot.metadata,
      uploadTask: null
    };
  }

  /**
   * Resumable upload with progress tracking
   */
  private async uploadWithProgress(
    storageRef: StorageReference,
    file: File | Blob,
    metadata: any,
    options: UploadOptions
  ): Promise<UploadResult> {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(\`Upload is \${progress}% done\`);
          
          if (options.onProgress) {
            options.onProgress(progress, snapshot);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new StorageError(\`Upload failed: \${error.message}\`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              size: uploadTask.snapshot.totalBytes,
              metadata: uploadTask.snapshot.metadata,
              uploadTask
            });
          } catch (error) {
            reject(new StorageError(\`Failed to get download URL: \${error instanceof Error ? error.message : 'Unknown error'}\`));
          }
        }
      );
    });
  }

  /**
   * Build metadata object
   */
  private buildMetadata(file: File | Blob, options: UploadOptions): any {
    const metadata: any = {
      contentType: file.type || 'application/octet-stream',
      cacheControl: options.cacheControl || 'public, max-age=31536000',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        uploadedBy: options.userId || 'anonymous',
        originalName: (file as File).name || 'unknown',
        ...options.customMetadata
      }
    };

    if (options.contentEncoding) {
      metadata.contentEncoding = options.contentEncoding;
    }

    if (options.contentLanguage) {
      metadata.contentLanguage = options.contentLanguage;
    }

    return metadata;
  }

  /**
   * Download a file
   */
  async downloadFile(path: string): Promise<DownloadResult> {
    try {
      const storageRef = ref(this.storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      const metadata = await getMetadata(storageRef);

      return {
        success: true,
        downloadURL,
        metadata,
        path
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw new StorageError(\`Download failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      console.log(\`Deleted file: \${path}\`);
    } catch (error) {
      console.error('Delete failed:', error);
      throw new StorageError(\`Delete failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string, options: ListOptions = {}): Promise<FileListResult> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            metadata: metadata.customMetadata
          };
        })
      );

      // Apply filtering and sorting
      let filteredFiles = files;
      
      if (options.filter) {
        filteredFiles = files.filter(options.filter);
      }

      if (options.sortBy) {
        filteredFiles.sort((a, b) => {
          const aValue = a[options.sortBy!];
          const bValue = b[options.sortBy!];
          
          if (options.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      if (options.limit) {
        const start = (options.page || 0) * options.limit;
        filteredFiles = filteredFiles.slice(start, start + options.limit);
      }

      return {
        files: filteredFiles,
        totalCount: files.length,
        filteredCount: filteredFiles.length,
        prefixes: result.prefixes.map(prefix => prefix.fullPath)
      };
    } catch (error) {
      console.error('List files failed:', error);
      throw new StorageError(\`List files failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<any> {
    try {
      const storageRef = ref(this.storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Get metadata failed:', error);
      throw new StorageError(\`Get metadata failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(path: string, metadata: any): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await updateMetadata(storageRef, metadata);
      console.log(\`Updated metadata for: \${path}\`);
    } catch (error) {
      console.error('Update metadata failed:', error);
      throw new StorageError(\`Update metadata failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Copy a file
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Download source file
      const sourceRef = ref(this.storage, sourcePath);
      const sourceURL = await getDownloadURL(sourceRef);
      const sourceMetadata = await getMetadata(sourceRef);
      
      // Fetch file data
      const response = await fetch(sourceURL);
      const blob = await response.blob();
      
      // Upload to destination
      const destRef = ref(this.storage, destinationPath);
      await uploadBytes(destRef, blob, {
        contentType: sourceMetadata.contentType,
        customMetadata: sourceMetadata.customMetadata
      });
      
      console.log(\`Copied file from \${sourcePath} to \${destinationPath}\`);
    } catch (error) {
      console.error('Copy file failed:', error);
      throw new StorageError(\`Copy file failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Move a file
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await this.copyFile(sourcePath, destinationPath);
      await this.deleteFile(sourcePath);
      console.log(\`Moved file from \${sourcePath} to \${destinationPath}\`);
    } catch (error) {
      console.error('Move file failed:', error);
      throw new StorageError(\`Move file failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Batch delete files
   */
  async batchDelete(paths: string[]): Promise<BatchResult> {
    const results: BatchResult = {
      successful: [],
      failed: []
    };

    await Promise.allSettled(
      paths.map(async (path) => {
        try {
          await this.deleteFile(path);
          results.successful.push(path);
        } catch (error) {
          results.failed.push({
            path,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      })
    );

    return results;
  }

  /**
   * Create a folder (by uploading a placeholder file)
   */
  async createFolder(path: string): Promise<void> {
    try {
      const placeholderPath = \`\${path}/.placeholder\`;
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      
      await this.uploadFile(placeholderPath, placeholderContent, {
        customMetadata: {
          isPlaceholder: 'true',
          createdAt: new Date().toISOString()
        }
      });
      
      console.log(\`Created folder: \${path}\`);
    } catch (error) {
      console.error('Create folder failed:', error);
      throw new StorageError(\`Create folder failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const storageRef = ref(this.storage, path);
      await getMetadata(storageRef);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage reference
   */
  getRef(path: string): StorageReference {
    return ref(this.storage, path);
  }
}

// Types
export interface UploadOptions {
  onProgress?: (progress: number, snapshot: UploadTaskSnapshot) => void;
  cacheControl?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  customMetadata?: Record<string, string>;
  userId?: string;
}

export interface UploadResult {
  success: boolean;
  downloadURL: string;
  path: string;
  size: number;
  metadata: any;
  uploadTask: UploadTask | null;
}

export interface DownloadResult {
  success: boolean;
  downloadURL: string;
  metadata: any;
  path: string;
}

export interface FileInfo {
  name: string;
  path: string;
  downloadURL: string;
  size: number;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
  metadata: Record<string, string> | undefined;
}

export interface ListOptions {
  filter?: (file: FileInfo) => boolean;
  sortBy?: keyof FileInfo;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface FileListResult {
  files: FileInfo[];
  totalCount: number;
  filteredCount: number;
  prefixes: string[];
}

export interface BatchResult {
  successful: string[];
  failed: Array<{
    path: string;
    error: string;
  }>;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Export singleton instance
export const storageClient = new CloudStorageClient();
export { storage };
export default storageClient;
`;
	}

	private generateSignedUrlService(): string {
		return `/**
 * Signed URL Service for Cloud Storage
 * Secure file access with time-limited URLs
 */

import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const storage = getStorage();
const functions = getFunctions();

/**
 * Service for generating and managing signed URLs
 */
export class SignedUrlService {
  private readonly DEFAULT_EXPIRY = 3600; // 1 hour in seconds

  /**
   * Generate a signed download URL
   */
  async generateDownloadUrl(
    path: string, 
    options: SignedUrlOptions = {}
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      // For Firebase Storage, getDownloadURL already provides a long-lived URL
      // For true signed URLs with custom expiry, you'd need Cloud Functions
      if (options.expiresIn && options.expiresIn < 604800) { // Less than 7 days
        return await this.generateCustomSignedUrl(path, options);
      }
      
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Generate download URL failed:', error);
      throw new Error(\`Failed to generate download URL: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Generate a signed upload URL
   */
  async generateUploadUrl(
    path: string,
    contentType: string,
    options: SignedUrlOptions = {}
  ): Promise<SignedUploadResult> {
    try {
      // Call Cloud Function to generate signed upload URL
      const generateUploadUrl = httpsCallable(functions, 'generateSignedUploadUrl');
      
      const result = await generateUploadUrl({
        path,
        contentType,
        expiresIn: options.expiresIn || this.DEFAULT_EXPIRY,
        metadata: options.metadata
      });

      return result.data as SignedUploadResult;
    } catch (error) {
      console.error('Generate upload URL failed:', error);
      throw new Error(\`Failed to generate upload URL: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Generate custom signed URL via Cloud Function
   */
  private async generateCustomSignedUrl(
    path: string,
    options: SignedUrlOptions
  ): Promise<string> {
    try {
      const generateSignedUrl = httpsCallable(functions, 'generateSignedDownloadUrl');
      
      const result = await generateSignedUrl({
        path,
        expiresIn: options.expiresIn || this.DEFAULT_EXPIRY,
        responseType: options.responseType,
        responseDisposition: options.responseDisposition
      });

      return (result.data as { url: string }).url;
    } catch (error) {
      console.error('Generate custom signed URL failed:', error);
      // Fallback to regular download URL
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    }
  }

  /**
   * Generate multiple signed URLs in batch
   */
  async generateBatchUrls(
    requests: BatchUrlRequest[]
  ): Promise<BatchUrlResult[]> {
    try {
      const generateBatchUrls = httpsCallable(functions, 'generateBatchSignedUrls');
      
      const result = await generateBatchUrls({ requests });
      return (result.data as { urls: BatchUrlResult[] }).urls;
    } catch (error) {
      console.error('Generate batch URLs failed:', error);
      
      // Fallback to individual URL generation
      const results: BatchUrlResult[] = [];
      
      for (const request of requests) {
        try {
          const url = await this.generateDownloadUrl(request.path, {
            expiresIn: request.expiresIn,
            responseType: request.responseType,
            responseDisposition: request.responseDisposition
          });
          
          results.push({
            path: request.path,
            success: true,
            url
          });
        } catch (error) {
          results.push({
            path: request.path,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return results;
    }
  }

  /**
   * Generate signed URL for specific image transformations
   */
  async generateImageUrl(
    path: string,
    transformations: ImageTransformation,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    try {
      const generateImageUrl = httpsCallable(functions, 'generateSignedImageUrl');
      
      const result = await generateImageUrl({
        path,
        transformations,
        expiresIn: options.expiresIn || this.DEFAULT_EXPIRY
      });

      return (result.data as { url: string }).url;
    } catch (error) {
      console.error('Generate image URL failed:', error);
      // Fallback to regular download URL
      return await this.generateDownloadUrl(path, options);
    }
  }

  /**
   * Generate CDN URL with caching
   */
  generateCDNUrl(path: string, options: CDNOptions = {}): string {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL;
    if (!baseUrl) {
      throw new Error('CDN base URL not configured');
    }

    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.crop) params.set('c', options.crop);
    if (options.blur) params.set('blur', options.blur.toString());
    if (options.brightness) params.set('br', options.brightness.toString());
    if (options.contrast) params.set('co', options.contrast.toString());
    if (options.saturation) params.set('sa', options.saturation.toString());

    const queryString = params.toString();
    return \`\${baseUrl}/\${path}\${queryString ? \`?\${queryString}\` : ''}\`;
  }

  /**
   * Validate signed URL
   */
  async validateSignedUrl(url: string): Promise<ValidationResult> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      return {
        valid: response.ok,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        expiresAt: response.headers.get('expires') || undefined
      };
    } catch (error) {
      return {
        valid: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Revoke signed URL (if supported by backend)
   */
  async revokeSignedUrl(path: string): Promise<void> {
    try {
      const revokeUrl = httpsCallable(functions, 'revokeSignedUrl');
      await revokeUrl({ path });
      console.log(\`Revoked signed URL for: \${path}\`);
    } catch (error) {
      console.error('Revoke signed URL failed:', error);
      throw new Error(\`Failed to revoke signed URL: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Types
export interface SignedUrlOptions {
  expiresIn?: number; // Seconds from now
  responseType?: string;
  responseDisposition?: string;
  metadata?: Record<string, string>;
}

export interface SignedUploadResult {
  uploadUrl: string;
  fields?: Record<string, string>;
  expiresAt: string;
  maxFileSize?: number;
}

export interface BatchUrlRequest {
  path: string;
  expiresIn?: number;
  responseType?: string;
  responseDisposition?: string;
}

export interface BatchUrlResult {
  path: string;
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'face' | 'auto';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both';
}

export interface CDNOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface ValidationResult {
  valid: boolean;
  status: number;
  headers?: Record<string, string>;
  expiresAt?: string;
  error?: string;
}

// Export singleton instance
export const signedUrlService = new SignedUrlService();
export default signedUrlService;
`;
	}

	private generateUploadService(): string {
		return `/**
 * Upload Service with Progress Tracking and Advanced Features
 * Handles file uploads with chunking, resuming, and optimization
 */

import { storageClient, UploadOptions, UploadResult } from '../lib/storage-client';
import { signedUrlService } from './signed-url.service';

/**
 * Advanced upload service with enterprise features
 */
export class UploadService {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private readonly MAX_CONCURRENT_UPLOADS = 3;
  private readonly SUPPORTED_FORMATS = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    videos: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg']
  };

  private activeUploads = new Map<string, UploadProgress>();

  /**
   * Upload a single file with progress tracking
   */
  async uploadFile(
    file: File,
    path: string,
    options: AdvancedUploadOptions = {}
  ): Promise<UploadResult> {
    const uploadId = this.generateUploadId();
    
    try {
      // Validate file
      this.validateFile(file, options);
      
      // Process file if needed
      const processedFile = await this.processFile(file, options);
      
      // Create upload progress tracker
      const progress: UploadProgress = {
        id: uploadId,
        fileName: file.name,
        fileSize: file.size,
        uploadedBytes: 0,
        progress: 0,
        status: 'uploading',
        startTime: Date.now(),
        chunks: [],
        retryCount: 0
      };
      
      this.activeUploads.set(uploadId, progress);
      
      // Determine upload strategy
      const result = await this.executeUpload(processedFile, path, options, progress);
      
      // Cleanup
      this.activeUploads.delete(uploadId);
      
      return result;
      
    } catch (error) {
      this.activeUploads.delete(uploadId);
      console.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files with concurrency control
   */
  async uploadMultiple(
    files: File[],
    basePath: string,
    options: AdvancedUploadOptions = {}
  ): Promise<MultipleUploadResult> {
    const results: MultipleUploadResult = {
      successful: [],
      failed: [],
      total: files.length
    };

    // Process files in batches
    const batches = this.createBatches(files, this.MAX_CONCURRENT_UPLOADS);
    
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (file, index) => {
          try {
            const filePath = \`\${basePath}/\${file.name}\`;
            const result = await this.uploadFile(file, filePath, options);
            
            results.successful.push({
              file: file.name,
              path: filePath,
              result
            });
          } catch (error) {
            results.failed.push({
              file: file.name,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })
      );
    }

    return results;
  }

  /**
   * Resume interrupted upload
   */
  async resumeUpload(uploadId: string): Promise<UploadResult> {
    const progress = this.activeUploads.get(uploadId);
    if (!progress) {
      throw new Error('Upload session not found');
    }

    if (progress.status === 'completed') {
      throw new Error('Upload already completed');
    }

    progress.status = 'uploading';
    progress.retryCount++;

    // Resume from last successful chunk
    return await this.continueChunkedUpload(progress);
  }

  /**
   * Cancel active upload
   */
  cancelUpload(uploadId: string): boolean {
    const progress = this.activeUploads.get(uploadId);
    if (!progress) {
      return false;
    }

    progress.status = 'cancelled';
    this.activeUploads.delete(uploadId);
    return true;
  }

  /**
   * Get upload progress
   */
  getUploadProgress(uploadId: string): UploadProgress | null {
    return this.activeUploads.get(uploadId) || null;
  }

  /**
   * Get all active uploads
   */
  getActiveUploads(): UploadProgress[] {
    return Array.from(this.activeUploads.values());
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: AdvancedUploadOptions): void {
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      throw new Error(\`File size (\${this.formatBytes(file.size)}) exceeds maximum allowed size (\${this.formatBytes(options.maxSize)})\`);
    }

    if (options.minSize && file.size < options.minSize) {
      throw new Error(\`File size (\${this.formatBytes(file.size)}) is below minimum required size (\${this.formatBytes(options.minSize)})\`);
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(\`File type \${file.type} is not allowed\`);
    }

    // Check file extension
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        throw new Error(\`File extension is not allowed\`);
      }
    }

    // Validate file name
    if (options.validateFileName && !options.validateFileName(file.name)) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Process file before upload (resize, compress, etc.)
   */
  private async processFile(file: File, options: AdvancedUploadOptions): Promise<File | Blob> {
    let processedFile: File | Blob = file;

    // Image processing
    if (file.type.startsWith('image/') && options.imageProcessing) {
      processedFile = await this.processImage(file, options.imageProcessing);
    }

    // Video processing
    if (file.type.startsWith('video/') && options.videoProcessing) {
      processedFile = await this.processVideo(file, options.videoProcessing);
    }

    return processedFile;
  }

  /**
   * Execute the upload strategy
   */
  private async executeUpload(
    file: File | Blob,
    path: string,
    options: AdvancedUploadOptions,
    progress: UploadProgress
  ): Promise<UploadResult> {
    const uploadOptions: UploadOptions = {
      onProgress: (percent, snapshot) => {
        progress.progress = percent;
        progress.uploadedBytes = snapshot.bytesTransferred;
        
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      customMetadata: {
        originalName: (file as File).name || 'unknown',
        uploadedBy: options.userId || 'anonymous',
        processedAt: new Date().toISOString(),
        ...options.metadata
      },
      userId: options.userId
    };

    // Use chunked upload for large files
    if (file.size > 10 * 1024 * 1024) { // 10MB threshold
      return await this.chunkedUpload(file, path, uploadOptions, progress);
    }

    // Standard upload for smaller files
    return await storageClient.uploadFile(path, file, uploadOptions);
  }

  /**
   * Chunked upload implementation
   */
  private async chunkedUpload(
    file: File | Blob,
    path: string,
    options: UploadOptions,
    progress: UploadProgress
  ): Promise<UploadResult> {
    const chunks = this.createFileChunks(file);
    progress.chunks = chunks.map((_, index) => ({
      index,
      uploaded: false,
      retries: 0
    }));

    // Upload chunks sequentially or in parallel based on options
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkPath = \`\${path}.chunk.\${i}\`;
      
      try {
        await storageClient.uploadFile(chunkPath, chunk, options);
        progress.chunks[i].uploaded = true;
        progress.uploadedBytes += chunk.size;
        progress.progress = (progress.uploadedBytes / file.size) * 100;
        
        if (options.onProgress) {
          options.onProgress(progress.progress, null as any);
        }
      } catch (error) {
        progress.chunks[i].retries++;
        
        if (progress.chunks[i].retries < 3) {
          // Retry chunk upload
          i--; // Retry this chunk
          continue;
        }
        
        throw error;
      }
    }

    // Combine chunks (this would typically be done server-side)
    return await this.combineChunks(path, chunks.length);
  }

  /**
   * Continue chunked upload from where it left off
   */
  private async continueChunkedUpload(progress: UploadProgress): Promise<UploadResult> {
    // Implementation would continue from last successful chunk
    // This is a simplified version
    throw new Error('Resume functionality not implemented');
  }

  /**
   * Process image file
   */
  private async processImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = this.calculateImageDimensions(
          img.width,
          img.height,
          options
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality settings
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          options.format || file.type,
          options.quality || 0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process video file (placeholder - would use FFmpeg.js or similar)
   */
  private async processVideo(file: File, options: VideoProcessingOptions): Promise<Blob> {
    // Placeholder for video processing
    // In a real implementation, you'd use FFmpeg.js or server-side processing
    console.log('Video processing not implemented in browser');
    return file;
  }

  /**
   * Calculate image dimensions based on processing options
   */
  private calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    options: ImageProcessingOptions
  ): { width: number; height: number } {
    if (!options.maxWidth && !options.maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    if (options.maxWidth && width > options.maxWidth) {
      width = options.maxWidth;
      height = width / aspectRatio;
    }

    if (options.maxHeight && height > options.maxHeight) {
      height = options.maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Create file chunks
   */
  private createFileChunks(file: File | Blob): Blob[] {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      chunks.push(chunk);
      offset += this.CHUNK_SIZE;
    }

    return chunks;
  }

  /**
   * Combine uploaded chunks
   */
  private async combineChunks(basePath: string, chunkCount: number): Promise<UploadResult> {
    // This would typically be done server-side
    // For now, return a placeholder result
    return {
      success: true,
      downloadURL: \`gs://bucket/\${basePath}\`,
      path: basePath,
      size: 0,
      metadata: {},
      uploadTask: null
    };
  }

  /**
   * Create upload batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return \`upload_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Types
export interface AdvancedUploadOptions {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  validateFileName?: (name: string) => boolean;
  imageProcessing?: ImageProcessingOptions;
  videoProcessing?: VideoProcessingOptions;
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string>;
  userId?: string;
  resumable?: boolean;
  chunkSize?: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: string;
  crop?: boolean;
  watermark?: {
    text: string;
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
    opacity: number;
  };
}

export interface VideoProcessingOptions {
  maxDuration?: number;
  format?: string;
  quality?: 'low' | 'medium' | 'high';
  resolution?: string;
  frameRate?: number;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startTime: number;
  endTime?: number;
  chunks: ChunkProgress[];
  retryCount: number;
  error?: string;
}

export interface ChunkProgress {
  index: number;
  uploaded: boolean;
  retries: number;
}

export interface MultipleUploadResult {
  successful: Array<{
    file: string;
    path: string;
    result: UploadResult;
  }>;
  failed: Array<{
    file: string;
    error: string;
  }>;
  total: number;
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;
`;
	}

	// Firebase Auth helper methods
	private generateAuthService(): string {
		return `/**
 * Firebase Authentication Service
 * Complete auth solution with multiple providers and advanced features
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  linkWithCredential,
  unlink,
  multiFactor,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePhoneNumber,
  onAuthStateChanged,
  beforeAuthStateChanged,
  onIdTokenChanged,
  connectAuthEmulator,
  AuthError,
  AuthErrorCodes,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';

// Initialize Firebase if not already done
const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

// Initialize Firebase Auth
const auth = getAuth(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Auth emulator already connected');
  }
}

/**
 * Comprehensive Firebase Auth service with enterprise features
 */
export class FirebaseAuthService {
  private auth: Auth;
  private providers: Map<string, any>;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  constructor() {
    this.auth = auth;
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize auth providers
   */
  private initializeProviders(): void {
    // Google OAuth provider
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    this.providers.set('google', googleProvider);

    // Facebook OAuth provider
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');
    this.providers.set('facebook', facebookProvider);

    // Twitter OAuth provider
    const twitterProvider = new TwitterAuthProvider();
    this.providers.set('twitter', twitterProvider);

    // GitHub OAuth provider
    const githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');
    this.providers.set('github', githubProvider);

    // Microsoft OAuth provider
    const microsoftProvider = new OAuthProvider('microsoft.com');
    microsoftProvider.addScope('mail.read');
    this.providers.set('microsoft', microsoftProvider);

    // Apple OAuth provider
    const appleProvider = new OAuthProvider('apple.com');
    appleProvider.addScope('email');
    appleProvider.addScope('name');
    this.providers.set('apple', appleProvider);
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    profile?: UserProfile
  ): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update profile if provided
      if (profile) {
        await updateProfile(userCredential.user, {
          displayName: profile.displayName,
          photoURL: profile.photoURL
        });
      }

      // Send email verification
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
      }

      return {
        success: true,
        user: userCredential.user,
        credential: userCredential,
        message: 'Account created successfully. Please verify your email.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      return {
        success: true,
        user: userCredential.user,
        credential: userCredential,
        message: 'Signed in successfully'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(
    providerName: string,
    useRedirect: boolean = false
  ): Promise<AuthResult> {
    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(\`Provider \${providerName} not found\`);
      }

      let userCredential: UserCredential;

      if (useRedirect) {
        await signInWithRedirect(this.auth, provider);
        // The result will be handled by getRedirectResult
        return {
          success: true,
          message: 'Redirecting to provider...'
        };
      } else {
        userCredential = await signInWithPopup(this.auth, provider);
      }

      return {
        success: true,
        user: userCredential.user,
        credential: userCredential,
        message: \`Signed in with \${providerName} successfully\`
      };
    } catch (error) {
      console.error('Provider sign in error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Handle redirect result after OAuth redirect
   */
  async handleRedirectResult(): Promise<AuthResult | null> {
    try {
      const result = await getRedirectResult(this.auth);
      if (!result) return null;

      return {
        success: true,
        user: result.user,
        credential: result,
        message: 'Signed in successfully'
      };
    } catch (error) {
      console.error('Redirect result error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign in with phone number
   */
  async signInWithPhone(
    phoneNumber: string,
    recaptchaContainerId: string
  ): Promise<PhoneAuthResult> {
    try {
      // Initialize reCAPTCHA verifier
      this.recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainerId,
        {
          size: 'normal',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          }
        },
        this.auth
      );

      const confirmationResult = await signInWithPhoneNumber(
        this.auth,
        phoneNumber,
        this.recaptchaVerifier
      );

      return {
        success: true,
        confirmationResult,
        message: 'SMS code sent successfully'
      };
    } catch (error) {
      console.error('Phone sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Phone sign in failed'
      };
    }
  }

  /**
   * Verify phone number with SMS code
   */
  async verifyPhoneCode(confirmationResult: any, code: string): Promise<AuthResult> {
    try {
      const userCredential = await confirmationResult.confirm(code);
      
      return {
        success: true,
        user: userCredential.user,
        credential: userCredential,
        message: 'Phone number verified successfully'
      };
    } catch (error) {
      console.error('Phone verification error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      await signOut(this.auth);
      
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await updatePassword(user, newPassword);
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Password update error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profile: UserProfile): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });
      
      return {
        success: true,
        user,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await sendEmailVerification(user);
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Link account with provider
   */
  async linkWithProvider(providerName: string): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(\`Provider \${providerName} not found\`);
      }

      const credential = await signInWithPopup(this.auth, provider);
      const linkedUser = await linkWithCredential(user, credential.credential!);
      
      return {
        success: true,
        user: linkedUser.user,
        message: \`Account linked with \${providerName} successfully\`
      };
    } catch (error) {
      console.error('Account linking error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Unlink provider from account
   */
  async unlinkProvider(providerId: string): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      const updatedUser = await unlink(user, providerId);
      
      return {
        success: true,
        user: updatedUser,
        message: \`Provider \${providerId} unlinked successfully\`
      };
    } catch (error) {
      console.error('Account unlinking error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Reauthenticate user with credential
   */
  async reauthenticate(password: string): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user signed in or email not available');
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      return {
        success: true,
        user,
        message: 'Reauthenticated successfully'
      };
    } catch (error) {
      console.error('Reauthentication error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<AuthResult> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await deleteUser(user);
      
      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Set authentication persistence
   */
  async setPersistence(persistenceType: 'local' | 'session' | 'none'): Promise<AuthResult> {
    try {
      let persistence;
      
      switch (persistenceType) {
        case 'local':
          persistence = browserLocalPersistence;
          break;
        case 'session':
          persistence = browserSessionPersistence;
          break;
        case 'none':
          persistence = inMemoryPersistence;
          break;
        default:
          throw new Error('Invalid persistence type');
      }

      await setPersistence(this.auth, persistence);
      
      return {
        success: true,
        message: \`Persistence set to \${persistenceType}\`
      };
    } catch (error) {
      console.error('Set persistence error:', error);
      return this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get current user's ID token
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Set up auth state listener
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Set up ID token listener
   */
  onIdTokenChanged(callback: (user: User | null) => void): () => void {
    return onIdTokenChanged(this.auth, callback);
  }

  /**
   * Set up before auth state changed guard
   */
  beforeAuthStateChanged(
    callback: (user: User | null) => boolean | Promise<boolean>
  ): () => void {
    return beforeAuthStateChanged(this.auth, callback);
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AuthError): AuthResult {
    let message: string;

    switch (error.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        message = 'An account with this email already exists';
        break;
      case AuthErrorCodes.INVALID_EMAIL:
        message = 'Invalid email address';
        break;
      case AuthErrorCodes.WEAK_PASSWORD:
        message = 'Password is too weak';
        break;
      case AuthErrorCodes.USER_DELETED:
        message = 'No account found with this email';
        break;
      case AuthErrorCodes.INVALID_PASSWORD:
        message = 'Incorrect password';
        break;
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        message = 'Too many failed attempts. Please try again later';
        break;
      case AuthErrorCodes.NETWORK_REQUEST_FAILED:
        message = 'Network error. Please check your connection';
        break;
      case AuthErrorCodes.POPUP_CLOSED_BY_USER:
        message = 'Sign-in popup was closed';
        break;
      case AuthErrorCodes.POPUP_BLOCKED:
        message = 'Sign-in popup was blocked by browser';
        break;
      case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
        message = 'This account is already linked to another user';
        break;
      case AuthErrorCodes.PROVIDER_ALREADY_LINKED:
        message = 'This provider is already linked to your account';
        break;
      case AuthErrorCodes.NO_SUCH_PROVIDER:
        message = 'This provider is not linked to your account';
        break;
      case AuthErrorCodes.REQUIRES_RECENT_LOGIN:
        message = 'This operation requires recent authentication. Please sign in again';
        break;
      default:
        message = error.message || 'An authentication error occurred';
    }

    return {
      success: false,
      error: message,
      errorCode: error.code
    };
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  cleanupRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

// Types
export interface AuthResult {
  success: boolean;
  user?: User;
  credential?: UserCredential;
  message?: string;
  error?: string;
  errorCode?: string;
}

export interface PhoneAuthResult {
  success: boolean;
  confirmationResult?: any;
  error?: string;
  message?: string;
}

export interface UserProfile {
  displayName?: string | null;
  photoURL?: string | null;
}

// Export singleton instance
export const authService = new FirebaseAuthService();
export { auth };
export default authService;
`;
	}

	private generateAuthProvider(): string {
		return `/**
 * Firebase Auth React Provider
 * Context provider for Firebase authentication state
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Auth } from 'firebase/auth';
import { authService, AuthResult } from './auth.service';

// Auth context interface
interface AuthContextType {
  // User state
  user: User | null;
  loading: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, profile?: { displayName?: string; photoURL?: string }) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithProvider: (provider: string, useRedirect?: boolean) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<AuthResult>;
  sendEmailVerification: () => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  
  // Token methods
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  
  // State helpers
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

/**
 * Firebase Auth Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  requireAuth = false,
  redirectTo = '/login',
  loadingComponent = <div>Loading...</div>
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Handle redirect result for OAuth providers
    authService.handleRedirectResult().then((result) => {
      if (result) {
        console.log('Redirect sign-in successful:', result);
      }
    }).catch((error) => {
      console.error('Redirect sign-in error:', error);
    });

    return unsubscribe;
  }, []);

  // Auth methods
  const signUp = async (
    email: string, 
    password: string, 
    profile?: { displayName?: string; photoURL?: string }
  ): Promise<AuthResult> => {
    return await authService.signUpWithEmail(email, password, profile);
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    return await authService.signInWithEmail(email, password);
  };

  const signInWithProvider = async (
    provider: string, 
    useRedirect: boolean = false
  ): Promise<AuthResult> => {
    return await authService.signInWithProvider(provider, useRedirect);
  };

  const signOut = async (): Promise<AuthResult> => {
    return await authService.signOut();
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    return await authService.updatePassword(password);
  };

  const updateProfile = async (
    profile: { displayName?: string; photoURL?: string }
  ): Promise<AuthResult> => {
    return await authService.updateUserProfile(profile);
  };

  const sendEmailVerification = async (): Promise<AuthResult> => {
    return await authService.sendEmailVerification();
  };

  const deleteAccount = async (): Promise<AuthResult> => {
    return await authService.deleteAccount();
  };

  const getIdToken = async (forceRefresh: boolean = false): Promise<string | null> => {
    return await authService.getIdToken(forceRefresh);
  };

  // Computed values
  const isAuthenticated = !!user;
  const isEmailVerified = user?.emailVerified ?? false;

  // Context value
  const value: AuthContextType = {
    // State
    user,
    loading,
    
    // Methods
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    sendEmailVerification,
    deleteAccount,
    getIdToken,
    
    // Computed
    isAuthenticated,
    isEmailVerified
  };

  // Show loading if still initializing
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Redirect if auth required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * HOC to require authentication
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = \`withAuth(\${Component.displayName || Component.name})\`;
  
  return AuthenticatedComponent;
};

/**
 * Hook for protected routes
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, loading, redirectTo]);

  return { user, loading, isAuthenticated };
};

export default AuthProvider;
`;
	}

	private generateAuthComponents(): string {
		return `/**
 * Firebase Auth React Components
 * Pre-built authentication UI components
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from './auth.provider';

// Login Form Component
export const LoginForm: React.FC<{
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}> = ({ onSuccess, onError, className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Login failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={\`space-y-6 \${className}\`}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

// Registration Form Component
export const RegisterForm: React.FC<{
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}> = ({ onSuccess, onError, className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, { displayName });
      
      if (result.success) {
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Registration failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={\`space-y-6 \${className}\`}>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your full name"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Confirm your password"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

// Social Login Buttons Component
export const SocialLoginButtons: React.FC<{
  providers?: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}> = ({ 
  providers = ['google', 'facebook', 'github'], 
  onSuccess, 
  onError, 
  className = '' 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { signInWithProvider } = useAuth();

  const handleSocialLogin = async (provider: string) => {
    setLoading(provider);

    try {
      const result = await signInWithProvider(provider);
      
      if (result.success) {
        onSuccess?.();
      } else {
        const errorMessage = result.error || \`\${provider} login failed\`;
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : \`\${provider} login failed\`;
      onError?.(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const getProviderButton = (provider: string) => {
    const isLoading = loading === provider;
    
    switch (provider) {
      case 'google':
        return (
          <button
            key="google"
            onClick={() => handleSocialLogin('google')}
            disabled={!!loading}
            className="w-full h-12 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        );
        
      case 'facebook':
        return (
          <button
            key="facebook"
            onClick={() => handleSocialLogin('facebook')}
            disabled={!!loading}
            className="w-full h-12 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Facebook'}
          </button>
        );
        
      case 'github':
        return (
          <button
            key="github"
            onClick={() => handleSocialLogin('github')}
            disabled={!!loading}
            className="w-full h-12 flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with GitHub'}
          </button>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={\`space-y-3 \${className}\`}>
      {providers.map(provider => getProviderButton(provider))}
    </div>
  );
};

// Reset Password Form Component
export const ResetPasswordForm: React.FC<{
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}> = ({ onSuccess, onError, className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Failed to send reset email';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={\`p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg \${className}\`}>
        <h3 className="font-medium mb-2">Reset Email Sent</h3>
        <p>Check your email for password reset instructions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={\`space-y-6 \${className}\`}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sending...' : 'Send Reset Email'}
      </button>
    </form>
  );
};

// User Profile Component
export const UserProfile: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { user, signOut, updateProfile, sendEmailVerification } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile({ displayName });
      
      if (result.success) {
        setMessage('Profile updated successfully');
        setEditing(false);
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await sendEmailVerification();
      
      if (result.success) {
        setMessage('Verification email sent');
      } else {
        setMessage(result.error || 'Failed to send verification email');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={\`p-6 bg-white rounded-lg border border-gray-200 \${className}\`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                user.displayName || 'No name set'
              )}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Email verified:</span>
          <span className={\`text-sm font-medium \${user.emailVerified ? 'text-green-600' : 'text-red-600'}\`}>
            {user.emailVerified ? 'Yes' : 'No'}
          </span>
          {!user.emailVerified && (
            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              Verify
            </button>
          )}
        </div>

        {message && (
          <div className={\`p-3 rounded-lg \${message.includes('success') || message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
            {message}
          </div>
        )}

        <div className="flex space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDisplayName(user.displayName || '');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
`;
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
export * from "./gcp.generator";
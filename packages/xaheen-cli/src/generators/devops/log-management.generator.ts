import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import { TemplateManager } from "../../services/templates/template-loader";
import { BaseGenerator } from "../base.generator";

export interface LogManagementGeneratorOptions {
	readonly projectName: string;
	readonly namespace: string;
	readonly environment: "development" | "staging" | "production";
	readonly loggingStack:
		| "elk"
		| "loki"
		| "fluentd"
		| "fluent-bit"
		| "splunk"
		| "datadog"
		| "azure-monitor";
	readonly enableStructuredLogging: boolean;
	readonly enableLogAggregation: boolean;
	readonly enableLogParsing: boolean;
	readonly enableLogAlerts: boolean;
	readonly enableLogAnalytics: boolean;
	readonly enableLogCorrelation: boolean;
	readonly enableLogEncryption: boolean;
	readonly enableLogCompression: boolean;
	readonly retention: {
		readonly application: string;
		readonly system: string;
		readonly security: string;
		readonly audit: string;
	};
	readonly storage: {
		readonly backend: "elasticsearch" | "s3" | "gcs" | "azure-blob" | "kafka";
		readonly size: string;
		readonly storageClass?: string;
		readonly indexStrategy: "daily" | "weekly" | "monthly";
	};
	readonly applications: readonly LoggedApplication[];
	readonly logSources: readonly LogSource[];
	readonly parsers: readonly LogParser[];
	readonly filters: readonly LogFilter[];
	readonly outputs: readonly LogOutput[];
	readonly dashboards: readonly LogDashboard[];
	readonly alerts: readonly LogAlert[];
	readonly compliance: {
		readonly enabled: boolean;
		readonly gdprCompliant: boolean;
		readonly norwegianCompliant: boolean;
		readonly pciCompliant: boolean;
		readonly hipaaCompliant: boolean;
		readonly dataClassification:
			| "public"
			| "internal"
			| "confidential"
			| "restricted";
		readonly auditLogging: boolean;
		readonly dataRetention: string;
		readonly encryptionAtRest: boolean;
		readonly encryptionInTransit: boolean;
		readonly accessControls: boolean;
	};
	readonly resources: {
		readonly logstash: ResourceRequirements;
		readonly elasticsearch: ResourceRequirements;
		readonly kibana: ResourceRequirements;
		readonly fluentd: ResourceRequirements;
	};
	readonly ingress: {
		readonly enabled: boolean;
		readonly className?: string;
		readonly annotations?: Record<string, string>;
		readonly hosts: readonly string[];
		readonly tls?: boolean;
	};
}

export interface LoggedApplication {
	readonly name: string;
	readonly namespace: string;
	readonly logLevel: "debug" | "info" | "warn" | "error" | "fatal";
	readonly logFormat: "json" | "text" | "combined" | "custom";
	readonly logPaths: readonly string[];
	readonly multiline: boolean;
	readonly customFields: Record<string, string>;
	readonly sensitiveFields: readonly string[];
	readonly samplingRate?: number;
}

export interface LogSource {
	readonly name: string;
	readonly type:
		| "file"
		| "syslog"
		| "http"
		| "tcp"
		| "udp"
		| "kafka"
		| "kubernetes";
	readonly path?: string;
	readonly port?: number;
	readonly format: string;
	readonly parser: string;
	readonly tags: readonly string[];
	readonly filters: readonly string[];
}

export interface LogParser {
	readonly name: string;
	readonly type: "grok" | "json" | "regex" | "multiline" | "csv" | "xml";
	readonly pattern: string;
	readonly fields: Record<string, string>;
	readonly timeFormat?: string;
	readonly timeField?: string;
}

export interface LogFilter {
	readonly name: string;
	readonly type: "drop" | "mutate" | "geoip" | "date" | "ruby" | "aggregate";
	readonly condition: string;
	readonly actions: readonly FilterAction[];
}

export interface FilterAction {
	readonly type: "add_field" | "remove_field" | "rename" | "convert" | "gsub";
	readonly source?: string;
	readonly target?: string;
	readonly value?: string;
}

export interface LogOutput {
	readonly name: string;
	readonly type: "elasticsearch" | "s3" | "kafka" | "http" | "file";
	readonly endpoint: string;
	readonly index?: string;
	readonly authentication?: {
		readonly type: "basic" | "apikey" | "oauth";
		readonly credentials: Record<string, string>;
	};
	readonly bufferSize?: string;
	readonly flushInterval?: string;
}

export interface LogDashboard {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly visualizations: readonly LogVisualization[];
	readonly filters: readonly DashboardFilter[];
}

export interface LogVisualization {
	readonly name: string;
	readonly type: "line" | "bar" | "pie" | "table" | "heatmap" | "histogram";
	readonly query: string;
	readonly aggregation: string;
	readonly timeRange: string;
}

export interface DashboardFilter {
	readonly field: string;
	readonly values: readonly string[];
	readonly operator: "is" | "is_not" | "contains" | "exists";
}

export interface LogAlert {
	readonly name: string;
	readonly description: string;
	readonly query: string;
	readonly condition: {
		readonly operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
		readonly threshold: number;
		readonly timeWindow: string;
	};
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly actions: readonly AlertAction[];
}

export interface AlertAction {
	readonly type: "email" | "slack" | "webhook" | "pagerduty";
	readonly target: string;
	readonly template?: string;
}

export interface ResourceRequirements {
	readonly requests: {
		readonly cpu: string;
		readonly memory: string;
		readonly storage?: string;
	};
	readonly limits: {
		readonly cpu: string;
		readonly memory: string;
		readonly storage?: string;
	};
}

export class LogManagementGenerator extends BaseGenerator<LogManagementGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: LogManagementGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate logging stack configuration
			await this.generateLoggingStack(options);

			// Generate log collection configuration
			await this.generateLogCollection(options);

			// Generate log parsing and filtering
			await this.generateLogProcessing(options);

			// Generate log storage configuration
			await this.generateLogStorage(options);

			// Generate dashboards and visualizations
			await this.generateLogDashboards(options);

			// Generate alerts and monitoring
			await this.generateLogAlerts(options);

			// Generate Kubernetes manifests
			await this.generateKubernetesManifests(options);

			// Generate compliance configuration
			await this.generateComplianceConfig(options);

			// Generate application logging configuration
			await this.generateApplicationLogging(options);

			// Generate deployment scripts
			await this.generateDeploymentScripts(options);

			// Generate documentation
			await this.generateDocumentation(options);

			this.logger.success(
				"Log management configuration generated successfully",
			);
		} catch (error) {
			this.logger.error(
				"Failed to generate log management configuration",
				error,
			);
			throw error;
		}
	}

	private async validateOptions(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.namespace) {
			throw new Error("Namespace is required");
		}

		if (options.applications.length === 0) {
			throw new Error(
				"At least one application must be configured for logging",
			);
		}

		if (options.logSources.length === 0) {
			throw new Error("At least one log source must be configured");
		}
	}

	private async generateLoggingStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		switch (options.loggingStack) {
			case "elk":
				await this.generateELKStack(options);
				break;
			case "loki":
				await this.generateLokiStack(options);
				break;
			case "fluentd":
				await this.generateFluentdStack(options);
				break;
			case "fluent-bit":
				await this.generateFluentBitStack(options);
				break;
			case "splunk":
				await this.generateSplunkStack(options);
				break;
			case "datadog":
				await this.generateDatadogStack(options);
				break;
			case "azure-monitor":
				await this.generateAzureMonitorStack(options);
				break;
		}
	}

	private async generateELKStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Generate Elasticsearch configuration
		const elasticsearchConfig = {
			apiVersion: "elasticsearch.k8s.elastic.co/v1",
			kind: "Elasticsearch",
			metadata: {
				name: `${options.projectName}-elasticsearch`,
				namespace: options.namespace,
			},
			spec: {
				version: "8.11.0",
				nodeSets: [
					{
						name: "default",
						count: options.environment === "production" ? 3 : 1,
						config: {
							"node.store.allow_mmap": false,
							"xpack.security.enabled": options.enableLogEncryption,
							"xpack.security.transport.ssl.enabled":
								options.enableLogEncryption,
							"xpack.security.http.ssl.enabled": options.enableLogEncryption,
							"indices.lifecycle.poll_interval": "1m",
							"cluster.routing.allocation.disk.threshold_enabled": true,
							"cluster.routing.allocation.disk.watermark.low": "85%",
							"cluster.routing.allocation.disk.watermark.high": "90%",
						},
						podTemplate: {
							spec: {
								containers: [
									{
										name: "elasticsearch",
										resources: options.resources.elasticsearch,
										env: [
											{
												name: "ES_JAVA_OPTS",
												value: "-Xms2g -Xmx2g",
											},
										],
									},
								],
							},
						},
						volumeClaimTemplates: [
							{
								metadata: {
									name: "elasticsearch-data",
								},
								spec: {
									accessModes: ["ReadWriteOnce"],
									storageClassName: options.storage.storageClass,
									resources: {
										requests: {
											storage: options.storage.size,
										},
									},
								},
							},
						],
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/elk/elasticsearch.yaml.hbs",
			"logging/elasticsearch.yaml",
			elasticsearchConfig,
		);

		// Generate Kibana configuration
		const kibanaConfig = {
			apiVersion: "kibana.k8s.elastic.co/v1",
			kind: "Kibana",
			metadata: {
				name: `${options.projectName}-kibana`,
				namespace: options.namespace,
			},
			spec: {
				version: "8.11.0",
				count: 1,
				elasticsearchRef: {
					name: `${options.projectName}-elasticsearch`,
				},
				config: {
					"server.publicBaseUrl": options.ingress.enabled
						? `https://${options.ingress.hosts[0]}`
						: undefined,
					"xpack.security.enabled": options.enableLogEncryption,
					"xpack.encryptedSavedObjects.encryptionKey":
						"${KIBANA_ENCRYPTION_KEY}",
					"logging.appenders.file.type": "file",
					"logging.appenders.file.fileName":
						"/usr/share/kibana/logs/kibana.log",
					"logging.appenders.file.layout.type": "json",
				},
				podTemplate: {
					spec: {
						containers: [
							{
								name: "kibana",
								resources: options.resources.kibana,
							},
						],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/elk/kibana.yaml.hbs",
			"logging/kibana.yaml",
			kibanaConfig,
		);

		// Generate Logstash configuration
		await this.generateLogstashConfig(options);

		// Generate index lifecycle policies
		await this.generateIndexLifecyclePolicies(options);
	}

	private async generateLogstashConfig(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		const logstashConfig = {
			input: {
				beats: {
					port: 5044,
				},
				http: {
					port: 8080,
					codec: "json",
				},
				tcp: {
					port: 5000,
					codec: "json_lines",
				},
			},
			filter: this.generateLogstashFilters(options),
			output: {
				elasticsearch: {
					hosts: [`${options.projectName}-elasticsearch-es-http:9200`],
					index: this.getElasticsearchIndex(options),
					template_name: `${options.projectName}-template`,
					template_pattern: `${options.projectName}-*`,
					user: "${ELASTICSEARCH_USERNAME}",
					password: "${ELASTICSEARCH_PASSWORD}",
					ssl: options.enableLogEncryption,
					ssl_certificate_verification: options.enableLogEncryption,
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/elk/logstash-config.yaml.hbs",
			"logging/logstash-config.yaml",
			logstashConfig,
		);

		// Generate Logstash deployment
		const logstashDeployment = {
			apiVersion: "apps/v1",
			kind: "Deployment",
			metadata: {
				name: `${options.projectName}-logstash`,
				namespace: options.namespace,
				labels: {
					app: "logstash",
					project: options.projectName,
				},
			},
			spec: {
				replicas: options.environment === "production" ? 3 : 1,
				selector: {
					matchLabels: {
						app: "logstash",
						project: options.projectName,
					},
				},
				template: {
					metadata: {
						labels: {
							app: "logstash",
							project: options.projectName,
						},
					},
					spec: {
						containers: [
							{
								name: "logstash",
								image: "docker.elastic.co/logstash/logstash:8.11.0",
								ports: [
									{ containerPort: 5044, name: "beats" },
									{ containerPort: 8080, name: "http" },
									{ containerPort: 5000, name: "tcp" },
								],
								volumeMounts: [
									{
										name: "config",
										mountPath: "/usr/share/logstash/pipeline",
									},
								],
								resources: options.resources.logstash,
								env: [
									{
										name: "LS_JAVA_OPTS",
										value: "-Xms1g -Xmx1g",
									},
								],
							},
						],
						volumes: [
							{
								name: "config",
								configMap: {
									name: `${options.projectName}-logstash-config`,
								},
							},
						],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/elk/logstash-deployment.yaml.hbs",
			"logging/logstash-deployment.yaml",
			logstashDeployment,
		);
	}

	private async generateLokiStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		const lokiConfig = {
			auth_enabled: false,
			server: {
				http_listen_port: 3100,
				grpc_listen_port: 9095,
			},
			common: {
				path_prefix: "/loki",
				storage: {
					filesystem: {
						chunks_directory: "/loki/chunks",
						rules_directory: "/loki/rules",
					},
				},
				replication_factor: 1,
				ring: {
					instance_addr: "127.0.0.1",
					kvstore: {
						store: "inmemory",
					},
				},
			},
			query_range: {
				results_cache: {
					cache: {
						embedded_cache: {
							enabled: true,
							max_size_mb: 100,
						},
					},
				},
			},
			schema_config: {
				configs: [
					{
						from: "2020-10-24",
						store: "boltdb-shipper",
						object_store: "filesystem",
						schema: "v11",
						index: {
							prefix: `${options.projectName}_index_`,
							period: "24h",
						},
					},
				],
			},
			ruler: {
				alertmanager_url: "http://alertmanager:9093",
			},
			limits_config: {
				reject_old_samples: true,
				reject_old_samples_max_age: "168h",
				retention_period: options.retention.application,
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/loki/loki-config.yaml.hbs",
			"logging/loki-config.yaml",
			lokiConfig,
		);

		// Generate Promtail configuration
		const promtailConfig = {
			server: {
				http_listen_port: 9080,
				grpc_listen_port: 0,
			},
			positions: {
				filename: "/tmp/positions.yaml",
			},
			clients: [
				{
					url: `http://${options.projectName}-loki:3100/loki/api/v1/push`,
				},
			],
			scrape_configs: options.applications.map((app) => ({
				job_name: app.name,
				static_configs: [
					{
						targets: ["localhost"],
						labels: {
							job: app.name,
							environment: options.environment,
							project: options.projectName,
							__path__: app.logPaths.join(","),
						},
					},
				],
				pipeline_stages: [
					{
						json: {
							expressions:
								app.logFormat === "json"
									? {
											timestamp: "timestamp",
											level: "level",
											message: "message",
										}
									: undefined,
						},
					},
					{
						labels: {
							level: "",
						},
					},
				],
			})),
		};

		await this.templateManager.renderTemplate(
			"devops/logging/loki/promtail-config.yaml.hbs",
			"logging/promtail-config.yaml",
			promtailConfig,
		);
	}

	private async generateLogCollection(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Generate Filebeat configuration
		const filebeatConfig = {
			filebeat: {
				inputs: options.applications.map((app) => ({
					type: "log",
					enabled: true,
					paths: app.logPaths,
					fields: {
						app: app.name,
						environment: options.environment,
						project: options.projectName,
						...app.customFields,
					},
					fields_under_root: false,
					json: {
						keys_under_root: app.logFormat === "json",
						add_error_key: true,
						message_key: "message",
					},
					multiline: app.multiline
						? {
								pattern: "^\\d{4}-\\d{2}-\\d{2}",
								negate: true,
								match: "after",
							}
						: undefined,
					processors: [
						{
							drop_fields: {
								fields: app.sensitiveFields,
							},
						},
						{
							add_host_metadata: {
								when: {
									not: {
										contains: {
											tags: "forwarded",
										},
									},
								},
							},
						},
					],
				})),
				config: {
					modules: {
						path: "${path.config}/modules.d/*.yml",
						reload: {
							enabled: false,
						},
					},
				},
			},
			output: {
				logstash: {
					hosts: [`${options.projectName}-logstash:5044`],
					compression_level: options.enableLogCompression ? 3 : 0,
				},
			},
			processors: [
				{
					add_cloud_metadata: {
						timeout: "3s",
					},
				},
				{
					add_kubernetes_metadata: {
						host: "${NODE_NAME}",
						matchers: [
							{
								logs_path: {
									logs_path: "/var/log/containers/",
									resource_type: "container",
								},
							},
						],
					},
				},
			],
			logging: {
				level: options.environment === "development" ? "debug" : "info",
				to_files: true,
				files: {
					path: "/var/log/filebeat",
					name: "filebeat",
					keepfiles: 7,
					permissions: "0644",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/filebeat/filebeat.yml.hbs",
			"logging/filebeat.yml",
			filebeatConfig,
		);
	}

	private async generateLogProcessing(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Generate log parsing rules
		const parsingRules = {
			parsers: options.parsers.map((parser) => ({
				name: parser.name,
				type: parser.type,
				pattern: parser.pattern,
				fields: parser.fields,
				time_format: parser.timeFormat,
				time_field: parser.timeField,
			})),
			filters: options.filters.map((filter) => ({
				name: filter.name,
				type: filter.type,
				condition: filter.condition,
				actions: filter.actions,
			})),
		};

		await this.templateManager.renderTemplate(
			"devops/logging/processing/parsing-rules.yaml.hbs",
			"logging/parsing-rules.yaml",
			parsingRules,
		);

		// Generate Grok patterns
		const grokPatterns = options.parsers
			.filter((parser) => parser.type === "grok")
			.map((parser) => `${parser.name.toUpperCase()} ${parser.pattern}`)
			.join("\n");

		await this.templateManager.renderTemplate(
			"devops/logging/processing/grok-patterns.hbs",
			"logging/grok-patterns",
			{ patterns: grokPatterns },
		);
	}

	private async generateLogStorage(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Generate index templates
		const indexTemplate = {
			index_patterns: [`${options.projectName}-*`],
			template: {
				settings: {
					number_of_shards: options.environment === "production" ? 3 : 1,
					number_of_replicas: options.environment === "production" ? 2 : 0,
					"index.lifecycle.name": `${options.projectName}-policy`,
					"index.lifecycle.rollover_alias": `${options.projectName}-logs`,
					"index.codec": options.enableLogCompression
						? "best_compression"
						: "default",
					"index.refresh_interval": "5s",
					"index.translog.durability": "request",
				},
				mappings: {
					properties: {
						"@timestamp": { type: "date" },
						"@version": { type: "keyword" },
						message: { type: "text" },
						level: { type: "keyword" },
						app: { type: "keyword" },
						environment: { type: "keyword" },
						project: { type: "keyword" },
						host: {
							properties: {
								name: { type: "keyword" },
								ip: { type: "ip" },
							},
						},
						kubernetes: {
							properties: {
								pod: { type: "keyword" },
								container: { type: "keyword" },
								namespace: { type: "keyword" },
							},
						},
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/storage/index-template.json.hbs",
			"logging/index-template.json",
			indexTemplate,
		);
	}

	private async generateLogDashboards(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		for (const dashboard of options.dashboards) {
			const kibanaObjects = {
				objects: [
					{
						id: `${dashboard.name}-dashboard`,
						type: "dashboard",
						attributes: {
							title: dashboard.title,
							description: dashboard.description,
							panelsJSON: JSON.stringify(
								dashboard.visualizations.map((viz, index) => ({
									gridData: {
										x: (index % 2) * 24,
										y: Math.floor(index / 2) * 15,
										w: 24,
										h: 15,
										i: index.toString(),
									},
									panelIndex: index.toString(),
									version: "8.11.0",
									panelRefName: `panel_${index}`,
								})),
							),
							optionsJSON: JSON.stringify({
								useMargins: true,
								syncColors: false,
								hidePanelTitles: false,
							}),
							version: 1,
							timeRestore: false,
							kibanaSavedObjectMeta: {
								searchSourceJSON: JSON.stringify({
									query: {
										query: "",
										language: "kuery",
									},
									filter: dashboard.filters.map((filter) => ({
										meta: {
											alias: null,
											disabled: false,
											negate: false,
											controlledBy: "1",
											group: "1",
											index: `${options.projectName}-*`,
											key: filter.field,
											type: "phrase",
											params: {
												query: filter.values[0],
											},
										},
										query: {
											match_phrase: {
												[filter.field]: filter.values[0],
											},
										},
									})),
								}),
							},
						},
						references: dashboard.visualizations.map((viz, index) => ({
							name: `panel_${index}`,
							type: "visualization",
							id: `${dashboard.name}-${viz.name}-viz`,
						})),
					},
					...dashboard.visualizations.map((viz, index) => ({
						id: `${dashboard.name}-${viz.name}-viz`,
						type: "visualization",
						attributes: {
							title: viz.name,
							visState: JSON.stringify({
								title: viz.name,
								type: viz.type,
								params: {
									grid: { categoryLines: false, style: { color: "#eee" } },
									categoryAxes: [
										{
											id: "CategoryAxis-1",
											type: "category",
											position: "bottom",
											show: true,
											style: {},
											scale: { type: "linear" },
											labels: { show: true, truncate: 100 },
											title: {},
										},
									],
									valueAxes: [
										{
											id: "ValueAxis-1",
											type: "value",
											position: "left",
											show: true,
											style: {},
											scale: { type: "linear", mode: "normal" },
											labels: {
												show: true,
												rotate: 0,
												filter: false,
												truncate: 100,
											},
											title: { text: "Count" },
										},
									],
									seriesParams: [
										{
											show: true,
											type: viz.type,
											mode: "stacked",
											data: { label: "Count", id: "1" },
											valueAxis: "ValueAxis-1",
											drawLinesBetweenPoints: true,
											showCircles: true,
										},
									],
									addTooltip: true,
									addLegend: true,
									legendPosition: "right",
									times: [],
									addTimeMarker: false,
								},
								aggs: [
									{
										id: "1",
										enabled: true,
										type: "count",
										schema: "metric",
										params: {},
									},
									{
										id: "2",
										enabled: true,
										type: "date_histogram",
										schema: "segment",
										params: {
											field: "@timestamp",
											timeRange: { from: "now-1h", to: "now" },
											useNormalizedEsInterval: true,
											interval: "auto",
											drop_partials: false,
											min_doc_count: 1,
											extended_bounds: {},
										},
									},
								],
							}),
							uiStateJSON: "{}",
							kibanaSavedObjectMeta: {
								searchSourceJSON: JSON.stringify({
									index: `${options.projectName}-*`,
									query: {
										query: viz.query,
										language: "kuery",
									},
									filter: [],
								}),
							},
						},
					})),
				],
				version: "8.11.0",
			};

			await this.templateManager.renderTemplate(
				"devops/logging/dashboards/kibana-objects.json.hbs",
				`logging/dashboards/${dashboard.name}-objects.json`,
				kibanaObjects,
			);
		}
	}

	private async generateLogAlerts(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		const alertRules = {
			groups: [
				{
					name: `${options.projectName}-log-alerts`,
					rules: options.alerts.map((alert) => ({
						alert: alert.name,
						expr: this.convertQueryToPromQL(alert.query),
						for: alert.condition.timeWindow,
						labels: {
							severity: alert.severity,
							project: options.projectName,
							environment: options.environment,
						},
						annotations: {
							summary: alert.description,
							description: `{{ $labels.instance }} - {{ $value }}`,
						},
					})),
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/logging/alerts/alert-rules.yaml.hbs",
			"logging/alert-rules.yaml",
			alertRules,
		);

		// Generate ElastAlert rules
		for (const alert of options.alerts) {
			const elastAlertRule = {
				name: alert.name,
				type: "frequency",
				index: `${options.projectName}-*`,
				num_events: alert.condition.threshold,
				timeframe: {
					minutes: parseInt(alert.condition.timeWindow.replace(/[^\d]/g, "")),
				},
				filter: [
					{
						query_string: {
							query: alert.query,
						},
					},
				],
				alert: alert.actions.map((action) => {
					switch (action.type) {
						case "email":
							return {
								email: {
									to: [action.target],
									subject: `Alert: ${alert.name}`,
									body: action.template || "Alert triggered: {0}",
								},
							};
						case "slack":
							return {
								slack: {
									webhook_url: action.target,
									channel: "#alerts",
									text: action.template || `Alert: ${alert.name}`,
								},
							};
						default:
							return {
								post: {
									url: action.target,
									body: action.template || `{"alert": "${alert.name}"}`,
								},
							};
					}
				}),
			};

			await this.templateManager.renderTemplate(
				"devops/logging/alerts/elastalert-rule.yaml.hbs",
				`logging/alerts/${alert.name}.yaml`,
				elastAlertRule,
			);
		}
	}

	private async generateKubernetesManifests(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Generate DaemonSet for log collection
		const logCollectorDaemonSet = {
			apiVersion: "apps/v1",
			kind: "DaemonSet",
			metadata: {
				name: `${options.projectName}-log-collector`,
				namespace: options.namespace,
				labels: {
					app: "log-collector",
					project: options.projectName,
				},
			},
			spec: {
				selector: {
					matchLabels: {
						app: "log-collector",
						project: options.projectName,
					},
				},
				template: {
					metadata: {
						labels: {
							app: "log-collector",
							project: options.projectName,
						},
					},
					spec: {
						serviceAccountName: `${options.projectName}-log-collector`,
						tolerations: [
							{
								key: "node-role.kubernetes.io/master",
								effect: "NoSchedule",
							},
						],
						containers: [
							{
								name: "filebeat",
								image: "docker.elastic.co/beats/filebeat:8.11.0",
								args: ["-c", "/etc/filebeat.yml", "-e"],
								env: [
									{
										name: "NODE_NAME",
										valueFrom: {
											fieldRef: {
												fieldPath: "spec.nodeName",
											},
										},
									},
								],
								securityContext: {
									runAsUser: 0,
									privileged: true,
								},
								resources: options.resources.fluentd,
								volumeMounts: [
									{
										name: "config",
										mountPath: "/etc/filebeat.yml",
										subPath: "filebeat.yml",
										readOnly: true,
									},
									{
										name: "data",
										mountPath: "/usr/share/filebeat/data",
									},
									{
										name: "varlibdockercontainers",
										mountPath: "/var/lib/docker/containers",
										readOnly: true,
									},
									{
										name: "varlog",
										mountPath: "/var/log",
										readOnly: true,
									},
								],
							},
						],
						volumes: [
							{
								name: "config",
								configMap: {
									name: `${options.projectName}-filebeat-config`,
								},
							},
							{
								name: "varlibdockercontainers",
								hostPath: {
									path: "/var/lib/docker/containers",
								},
							},
							{
								name: "varlog",
								hostPath: {
									path: "/var/log",
								},
							},
							{
								name: "data",
								hostPath: {
									path: `/var/lib/filebeat-data-${options.projectName}`,
									type: "DirectoryOrCreate",
								},
							},
						],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/k8s/log-collector-daemonset.yaml.hbs",
			"logging/k8s/log-collector-daemonset.yaml",
			logCollectorDaemonSet,
		);
	}

	private async generateComplianceConfig(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		if (!options.compliance.enabled) {
			return;
		}

		const complianceConfig = {
			dataClassification: options.compliance.dataClassification,
			retention: {
				application: options.retention.application,
				system: options.retention.system,
				security: options.retention.security,
				audit: options.retention.audit,
			},
			encryption: {
				atRest: options.compliance.encryptionAtRest,
				inTransit: options.compliance.encryptionInTransit,
			},
			accessControls: {
				rbac: options.compliance.accessControls,
				roles: [
					{
						name: "log-viewer",
						permissions: ["read:logs"],
						indices: [`${options.projectName}-*`],
					},
					{
						name: "log-admin",
						permissions: ["*"],
						indices: [`${options.projectName}-*`],
					},
				],
			},
			auditLogging: {
				enabled: options.compliance.auditLogging,
				events: ["search", "index", "delete", "admin"],
				retention: options.retention.audit,
			},
			dataProcessing: {
				anonymization: {
					enabled: options.compliance.gdprCompliant,
					fields: ["user_id", "email", "ip_address"],
					method: "hash",
				},
				retention: {
					automatic: true,
					policies: [
						{
							name: "application-logs",
							pattern: `${options.projectName}-app-*`,
							retention: options.retention.application,
						},
						{
							name: "system-logs",
							pattern: `${options.projectName}-system-*`,
							retention: options.retention.system,
						},
					],
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/compliance/compliance-config.yaml.hbs",
			"logging/compliance-config.yaml",
			complianceConfig,
		);
	}

	private async generateApplicationLogging(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		for (const app of options.applications) {
			const loggingConfig = {
				level: app.logLevel,
				format: app.logFormat,
				output: app.logFormat === "json" ? "structured" : "text",
				fields: {
					service: app.name,
					version: "1.0.0",
					environment: options.environment,
					project: options.projectName,
					...app.customFields,
				},
				correlation: {
					enabled: options.enableLogCorrelation,
					traceHeader: "x-trace-id",
					spanHeader: "x-span-id",
				},
				sampling: {
					enabled: app.samplingRate !== undefined,
					rate: app.samplingRate || 1.0,
				},
				sensitive: {
					fields: app.sensitiveFields,
					redaction: "***REDACTED***",
				},
			};

			await this.templateManager.renderTemplate(
				"devops/logging/application/logging-config.json.hbs",
				`logging/applications/${app.name}-logging.json`,
				loggingConfig,
			);
		}
	}

	private async generateDeploymentScripts(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		const deployScript = `#!/bin/bash
set -e

NAMESPACE="${options.namespace}"
PROJECT="${options.projectName}"

echo "Deploying log management for \$PROJECT..."

# Create namespace if it doesn't exist
kubectl create namespace \$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy Elastic Cloud on Kubernetes operator
kubectl apply -f https://download.elastic.co/downloads/eck/2.10.0/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.10.0/operator.yaml

# Wait for operator to be ready
kubectl wait --for=condition=ready pod -l control-plane=elastic-operator -n elastic-system --timeout=300s

# Deploy Elasticsearch and Kibana
kubectl apply -f logging/elasticsearch.yaml -n \$NAMESPACE
kubectl apply -f logging/kibana.yaml -n \$NAMESPACE

# Deploy Logstash
kubectl apply -f logging/logstash-config.yaml -n \$NAMESPACE
kubectl apply -f logging/logstash-deployment.yaml -n \$NAMESPACE

# Deploy log collectors
kubectl apply -f logging/k8s/ -n \$NAMESPACE

# Deploy monitoring
kubectl apply -f logging/alert-rules.yaml -n \$NAMESPACE

echo "Deployment completed!"
echo "Kibana will be available at:"
echo "  kubectl port-forward svc/\$PROJECT-kibana-kb-http 5601:5601 -n \$NAMESPACE"
`;

		await this.templateManager.renderTemplate(
			"devops/logging/scripts/deploy.sh.hbs",
			"scripts/deploy-logging.sh",
			{ script: deployScript, executable: true },
		);
	}

	private async generateDocumentation(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		const documentation = {
			title: `${options.projectName} - Log Management Setup`,
			stack: options.loggingStack,
			applications: options.applications,
			storage: options.storage,
			retention: options.retention,
			compliance: options.compliance,
			dashboards: options.dashboards,
			alerts: options.alerts,
			deployment: {
				commands: [
					"./scripts/deploy-logging.sh",
					`kubectl port-forward svc/${options.projectName}-kibana-kb-http 5601:5601 -n ${options.namespace}`,
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/logging/docs/README.md.hbs",
			"logging/README.md",
			documentation,
		);
	}

	// Helper methods
	private generateLogstashFilters(
		options: LogManagementGeneratorOptions,
	): any[] {
		return options.filters.map((filter) => {
			switch (filter.type) {
				case "grok":
					return {
						grok: {
							match: { message: filter.condition },
						},
					};
				case "mutate":
					return {
						mutate: {
							...Object.fromEntries(
								filter.actions.map((action) => [
									action.type,
									{ [action.target!]: action.value },
								]),
							),
						},
					};
				case "date":
					return {
						date: {
							match: ["timestamp", "ISO8601"],
						},
					};
				default:
					return {};
			}
		});
	}

	private getElasticsearchIndex(
		options: LogManagementGeneratorOptions,
	): string {
		const dateFormat = {
			daily: "%{+YYYY.MM.dd}",
			weekly: "%{+YYYY.ww}",
			monthly: "%{+YYYY.MM}",
		};

		return `${options.projectName}-%{[@metadata][beat]}-${dateFormat[options.storage.indexStrategy]}`;
	}

	private convertQueryToPromQL(query: string): string {
		// Simple conversion logic - in practice, this would be more sophisticated
		return query
			.replace(/elasticsearch/g, "elasticsearch_logs")
			.replace(/level:/g, "level=")
			.replace(/app:/g, "app=");
	}

	private async generateFluentdStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for Fluentd stack
	}

	private async generateFluentBitStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for Fluent Bit stack
	}

	private async generateSplunkStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for Splunk stack
	}

	private async generateDatadogStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for Datadog stack
	}

	private async generateAzureMonitorStack(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for Azure Monitor stack
	}

	private async generateIndexLifecyclePolicies(
		options: LogManagementGeneratorOptions,
	): Promise<void> {
		// Implementation for index lifecycle management
	}
}

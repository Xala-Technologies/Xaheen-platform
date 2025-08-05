import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import { TemplateManager } from "../../services/templates/template-loader";
import { BaseGenerator } from "../base.generator";

export interface DistributedTracingGeneratorOptions {
	readonly projectName: string;
	readonly namespace: string;
	readonly environment: "development" | "staging" | "production";
	readonly tracingBackend:
		| "jaeger"
		| "zipkin"
		| "tempo"
		| "aws-xray"
		| "azure-app-insights";
	readonly enableOpenTelemetry: boolean;
	readonly enableJaegerOperator: boolean;
	readonly enableServiceMesh: boolean;
	readonly samplingRate: number;
	readonly retention: {
		readonly traces: string;
		readonly spans: string;
	};
	readonly storage: {
		readonly backend: "memory" | "cassandra" | "elasticsearch" | "kafka" | "s3";
		readonly size: string;
		readonly storageClass?: string;
	};
	readonly applications: readonly TracedApplication[];
	readonly services: readonly TracedService[];
	readonly ingress: {
		readonly enabled: boolean;
		readonly className?: string;
		readonly annotations?: Record<string, string>;
		readonly hosts: readonly string[];
		readonly tls?: boolean;
	};
	readonly security: {
		readonly enableAuth: boolean;
		readonly enableTLS: boolean;
		readonly secretName?: string;
	};
	readonly resources: {
		readonly collector: ResourceRequirements;
		readonly query: ResourceRequirements;
		readonly storage: ResourceRequirements;
		readonly agent: ResourceRequirements;
	};
	readonly compliance: {
		readonly dataRetention: string;
		readonly gdprCompliant: boolean;
		readonly norwegianCompliant: boolean;
		readonly encryptionAtRest: boolean;
		readonly encryptionInTransit: boolean;
	};
}

export interface TracedApplication {
	readonly name: string;
	readonly namespace: string;
	readonly serviceName: string;
	readonly version: string;
	readonly language:
		| "node"
		| "python"
		| "java"
		| "go"
		| "dotnet"
		| "php"
		| "rust";
	readonly framework?: string;
	readonly instrumentations: readonly string[];
	readonly samplingRules: readonly SamplingRule[];
	readonly spanProcessors: readonly SpanProcessor[];
	readonly customTags: Record<string, string>;
}

export interface TracedService {
	readonly name: string;
	readonly port: number;
	readonly protocol: "http" | "grpc" | "tcp";
	readonly dependencies: readonly string[];
	readonly criticalPath: boolean;
	readonly sla: {
		readonly responseTime: string;
		readonly errorRate: number;
		readonly availability: number;
	};
}

export interface SamplingRule {
	readonly service: string;
	readonly operation?: string;
	readonly rate: number;
	readonly maxTracesPerSecond?: number;
}

export interface SpanProcessor {
	readonly type: "batch" | "simple";
	readonly exportTimeout?: string;
	readonly maxExportBatchSize?: number;
	readonly scheduleDelay?: string;
}

export interface ResourceRequirements {
	readonly requests: {
		readonly cpu: string;
		readonly memory: string;
	};
	readonly limits: {
		readonly cpu: string;
		readonly memory: string;
	};
}

export class DistributedTracingGenerator extends BaseGenerator<DistributedTracingGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: DistributedTracingGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate OpenTelemetry configuration
			if (options.enableOpenTelemetry) {
				await this.generateOpenTelemetryConfig(options);
			}

			// Generate tracing backend configuration
			await this.generateTracingBackend(options);

			// Generate application instrumentation
			await this.generateApplicationInstrumentation(options);

			// Generate service mesh integration
			if (options.enableServiceMesh) {
				await this.generateServiceMeshConfig(options);
			}

			// Generate Kubernetes manifests
			await this.generateKubernetesManifests(options);

			// Generate monitoring and alerting
			await this.generateTracingMonitoring(options);

			// Generate compliance configuration
			await this.generateComplianceConfig(options);

			// Generate deployment scripts
			await this.generateDeploymentScripts(options);

			// Generate documentation
			await this.generateDocumentation(options);

			this.logger.success(
				"Distributed tracing configuration generated successfully",
			);
		} catch (error) {
			this.logger.error(
				"Failed to generate distributed tracing configuration",
				error,
			);
			throw error;
		}
	}

	private async validateOptions(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.namespace) {
			throw new Error("Namespace is required");
		}

		if (options.samplingRate < 0 || options.samplingRate > 1) {
			throw new Error("Sampling rate must be between 0 and 1");
		}

		if (options.applications.length === 0) {
			throw new Error(
				"At least one application must be configured for tracing",
			);
		}
	}

	private async generateOpenTelemetryConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const otelConfig = {
			receivers: {
				otlp: {
					protocols: {
						grpc: {
							endpoint: "0.0.0.0:4317",
						},
						http: {
							endpoint: "0.0.0.0:4318",
						},
					},
				},
				jaeger: {
					protocols: {
						grpc: {
							endpoint: "0.0.0.0:14250",
						},
						thrift_http: {
							endpoint: "0.0.0.0:14268",
						},
					},
				},
			},
			processors: {
				batch: {
					timeout: "1s",
					send_batch_size: 1024,
					send_batch_max_size: 2048,
				},
				memory_limiter: {
					limit_mib: 512,
				},
				resource: {
					attributes: [
						{
							key: "environment",
							value: options.environment,
							action: "upsert",
						},
						{
							key: "project",
							value: options.projectName,
							action: "upsert",
						},
					],
				},
			},
			exporters: this.getExporterConfig(options),
			service: {
				pipelines: {
					traces: {
						receivers: ["otlp", "jaeger"],
						processors: ["memory_limiter", "resource", "batch"],
						exporters: [options.tracingBackend],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/otel-collector-config.yaml.hbs",
			"tracing/otel-collector-config.yaml",
			otelConfig,
		);
	}

	private async generateTracingBackend(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		switch (options.tracingBackend) {
			case "jaeger":
				await this.generateJaegerConfig(options);
				break;
			case "zipkin":
				await this.generateZipkinConfig(options);
				break;
			case "tempo":
				await this.generateTempoConfig(options);
				break;
			case "aws-xray":
				await this.generateXRayConfig(options);
				break;
			case "azure-app-insights":
				await this.generateAppInsightsConfig(options);
				break;
		}
	}

	private async generateJaegerConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const jaegerConfig = {
			apiVersion: "jaegertracing.io/v1",
			kind: "Jaeger",
			metadata: {
				name: `${options.projectName}-jaeger`,
				namespace: options.namespace,
				labels: {
					app: "jaeger",
					project: options.projectName,
					environment: options.environment,
				},
			},
			spec: {
				strategy:
					options.environment === "production" ? "production" : "allInOne",
				storage: this.getJaegerStorageConfig(options),
				query: {
					options: {
						"query.max-clock-skew-adjustment": "1s",
					},
					resources: options.resources.query,
				},
				collector: {
					options: {
						"collector.num-workers": "50",
						"collector.queue-size": "2000",
					},
					resources: options.resources.collector,
				},
				agent: {
					strategy: "sidecar",
					resources: options.resources.agent,
				},
				sampling: {
					options: {
						"sampling.strategies-file": "/etc/jaeger/sampling_strategies.json",
					},
				},
				ui: {
					options: {
						"query.ui-config": "/etc/jaeger/ui-config.json",
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/jaeger-operator.yaml.hbs",
			"tracing/jaeger.yaml",
			jaegerConfig,
		);

		// Generate sampling strategies
		const samplingStrategies = {
			default_strategy: {
				type: "probabilistic",
				param: options.samplingRate,
			},
			per_service_strategies: options.applications.map((app) => ({
				service: app.serviceName,
				type: "probabilistic",
				param: app.samplingRules[0]?.rate || options.samplingRate,
				max_traces_per_second: app.samplingRules[0]?.maxTracesPerSecond || 100,
			})),
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/jaeger-sampling-strategies.json.hbs",
			"tracing/jaeger-sampling-strategies.json",
			samplingStrategies,
		);
	}

	private async generateTempoConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const tempoConfig = {
			server: {
				http_listen_port: 3200,
				grpc_listen_port: 9095,
			},
			distributor: {
				receivers: {
					jaeger: {
						protocols: {
							thrift_http: {
								endpoint: "0.0.0.0:14268",
							},
							grpc: {
								endpoint: "0.0.0.0:14250",
							},
						},
					},
					otlp: {
						protocols: {
							http: {
								endpoint: "0.0.0.0:4318",
							},
							grpc: {
								endpoint: "0.0.0.0:4317",
							},
						},
					},
				},
			},
			ingester: {
				lifecycler: {
					address: "127.0.0.1",
					ring: {
						kvstore: {
							store: "inmemory",
						},
						replication_factor: 1,
					},
				},
			},
			storage: {
				trace: {
					backend: options.storage.backend,
					local:
						options.storage.backend === "memory"
							? {
									path: "/tmp/tempo/traces",
								}
							: undefined,
					s3:
						options.storage.backend === "s3"
							? {
									bucket: "${TEMPO_S3_BUCKET}",
									endpoint: "${TEMPO_S3_ENDPOINT}",
									access_key: "${TEMPO_S3_ACCESS_KEY}",
									secret_key: "${TEMPO_S3_SECRET_KEY}",
								}
							: undefined,
				},
			},
			compactor: {
				compaction: {
					compacted_block_retention: options.retention.traces,
				},
			},
			querier: {
				frontend_worker: {
					frontend_address: "127.0.0.1:9095",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/tempo-config.yaml.hbs",
			"tracing/tempo-config.yaml",
			tempoConfig,
		);
	}

	private async generateApplicationInstrumentation(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		for (const app of options.applications) {
			await this.generateLanguageSpecificInstrumentation(app, options);
		}
	}

	private async generateLanguageSpecificInstrumentation(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const instrumentationConfig = {
			serviceName: app.serviceName,
			serviceVersion: app.version,
			environment: options.environment,
			tracingBackend: options.tracingBackend,
			samplingRate: options.samplingRate,
			instrumentations: app.instrumentations,
			customTags: app.customTags,
			exporterEndpoint: this.getExporterEndpoint(options.tracingBackend),
			spanProcessors: app.spanProcessors,
		};

		const templatePath = `devops/tracing/instrumentation/${app.language}-instrumentation.hbs`;
		const outputPath = `tracing/instrumentation/${app.name}-${app.language}-instrumentation.js`;

		await this.templateManager.renderTemplate(
			templatePath,
			outputPath,
			instrumentationConfig,
		);

		// Generate language-specific configuration files
		await this.generateLanguageConfig(app, options);
	}

	private async generateLanguageConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		switch (app.language) {
			case "node":
				await this.generateNodeConfig(app, options);
				break;
			case "python":
				await this.generatePythonConfig(app, options);
				break;
			case "java":
				await this.generateJavaConfig(app, options);
				break;
			case "go":
				await this.generateGoConfig(app, options);
				break;
			case "dotnet":
				await this.generateDotNetConfig(app, options);
				break;
		}
	}

	private async generateNodeConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const nodeConfig = {
			dependencies: [
				"@opentelemetry/api",
				"@opentelemetry/sdk-node",
				"@opentelemetry/auto-instrumentations-node",
				"@opentelemetry/exporter-jaeger",
				"@opentelemetry/exporter-otlp-http",
				"@opentelemetry/instrumentation-http",
				"@opentelemetry/instrumentation-express",
			],
			environment: {
				OTEL_SERVICE_NAME: app.serviceName,
				OTEL_SERVICE_VERSION: app.version,
				OTEL_RESOURCE_ATTRIBUTES: `service.name=${app.serviceName},service.version=${app.version},environment=${options.environment}`,
				OTEL_EXPORTER_OTLP_ENDPOINT: this.getExporterEndpoint(
					options.tracingBackend,
				),
				OTEL_TRACES_SAMPLER: "traceidratio",
				OTEL_TRACES_SAMPLER_ARG: options.samplingRate.toString(),
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/node/package-additions.json.hbs",
			`tracing/${app.name}/package-additions.json`,
			nodeConfig,
		);
	}

	private async generateServiceMeshConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Generate Istio configuration for distributed tracing
		const istioTracingConfig = {
			apiVersion: "install.istio.io/v1alpha1",
			kind: "IstioOperator",
			metadata: {
				name: "tracing-config",
				namespace: options.namespace,
			},
			spec: {
				meshConfig: {
					defaultProviders: {
						tracing: [options.tracingBackend],
					},
					extensionProviders: [
						{
							name: options.tracingBackend,
							envoyOtelAls: {
								service: `${options.projectName}-otel-collector.${options.namespace}.svc.cluster.local`,
								port: 4317,
							},
						},
					],
				},
				values: {
					pilot: {
						traceSampling: options.samplingRate * 100,
					},
					telemetry: {
						v2: {
							prometheus: {
								configOverride: {
									disable_host_header_fallback: true,
								},
							},
						},
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/istio/istio-tracing.yaml.hbs",
			"tracing/istio-tracing.yaml",
			istioTracingConfig,
		);

		// Generate Telemetry v2 configuration
		const telemetryConfig = {
			apiVersion: "telemetry.istio.io/v1alpha1",
			kind: "Telemetry",
			metadata: {
				name: "tracing-config",
				namespace: options.namespace,
			},
			spec: {
				tracing: [
					{
						providers: [
							{
								name: options.tracingBackend,
							},
						],
						customTags: Object.entries(
							options.applications[0]?.customTags || {},
						).reduce(
							(acc, [key, value]) => {
								acc[key] = {
									literal: {
										value: value,
									},
								};
								return acc;
							},
							{} as Record<string, any>,
						),
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/istio/telemetry-config.yaml.hbs",
			"tracing/telemetry-config.yaml",
			telemetryConfig,
		);
	}

	private async generateKubernetesManifests(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Generate OpenTelemetry Collector deployment
		const otelCollectorDeployment = {
			apiVersion: "apps/v1",
			kind: "Deployment",
			metadata: {
				name: `${options.projectName}-otel-collector`,
				namespace: options.namespace,
				labels: {
					app: "otel-collector",
					project: options.projectName,
					component: "tracing",
				},
			},
			spec: {
				replicas: options.environment === "production" ? 3 : 1,
				selector: {
					matchLabels: {
						app: "otel-collector",
						project: options.projectName,
					},
				},
				template: {
					metadata: {
						labels: {
							app: "otel-collector",
							project: options.projectName,
							component: "tracing",
						},
					},
					spec: {
						containers: [
							{
								name: "otel-collector",
								image: "otel/opentelemetry-collector-contrib:0.88.0",
								args: ["--config=/etc/otel-collector-config.yaml"],
								ports: [
									{ containerPort: 4317, name: "otlp-grpc" },
									{ containerPort: 4318, name: "otlp-http" },
									{ containerPort: 14268, name: "jaeger-http" },
									{ containerPort: 14250, name: "jaeger-grpc" },
									{ containerPort: 8888, name: "metrics" },
								],
								volumeMounts: [
									{
										name: "config",
										mountPath: "/etc/otel-collector-config.yaml",
										subPath: "otel-collector-config.yaml",
									},
								],
								resources: options.resources.collector,
								livenessProbe: {
									httpGet: {
										path: "/",
										port: 8888,
									},
									initialDelaySeconds: 30,
									periodSeconds: 30,
								},
								readinessProbe: {
									httpGet: {
										path: "/",
										port: 8888,
									},
									initialDelaySeconds: 5,
									periodSeconds: 10,
								},
							},
						],
						volumes: [
							{
								name: "config",
								configMap: {
									name: `${options.projectName}-otel-collector-config`,
								},
							},
						],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/k8s/otel-collector-deployment.yaml.hbs",
			"tracing/k8s/otel-collector-deployment.yaml",
			otelCollectorDeployment,
		);

		// Generate service
		const otelCollectorService = {
			apiVersion: "v1",
			kind: "Service",
			metadata: {
				name: `${options.projectName}-otel-collector`,
				namespace: options.namespace,
				labels: {
					app: "otel-collector",
					project: options.projectName,
				},
			},
			spec: {
				selector: {
					app: "otel-collector",
					project: options.projectName,
				},
				ports: [
					{ port: 4317, targetPort: 4317, name: "otlp-grpc" },
					{ port: 4318, targetPort: 4318, name: "otlp-http" },
					{ port: 14268, targetPort: 14268, name: "jaeger-http" },
					{ port: 14250, targetPort: 14250, name: "jaeger-grpc" },
					{ port: 8888, targetPort: 8888, name: "metrics" },
				],
				type: "ClusterIP",
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/k8s/otel-collector-service.yaml.hbs",
			"tracing/k8s/otel-collector-service.yaml",
			otelCollectorService,
		);
	}

	private async generateTracingMonitoring(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Generate ServiceMonitor for Prometheus
		const serviceMonitor = {
			apiVersion: "monitoring.coreos.com/v1",
			kind: "ServiceMonitor",
			metadata: {
				name: `${options.projectName}-tracing`,
				namespace: options.namespace,
				labels: {
					app: "tracing",
					project: options.projectName,
				},
			},
			spec: {
				selector: {
					matchLabels: {
						app: "otel-collector",
						project: options.projectName,
					},
				},
				endpoints: [
					{
						port: "metrics",
						interval: "30s",
						path: "/metrics",
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/monitoring/service-monitor.yaml.hbs",
			"tracing/monitoring/service-monitor.yaml",
			serviceMonitor,
		);

		// Generate Grafana dashboard
		const grafanaDashboard = {
			dashboard: {
				id: null,
				title: `${options.projectName} - Distributed Tracing`,
				tags: ["tracing", options.projectName],
				timezone: "browser",
				panels: [
					{
						id: 1,
						title: "Request Rate",
						type: "graph",
						targets: [
							{
								expr: `sum(rate(traces_received_total{service=~"${options.projectName}.*"}[5m])) by (service)`,
								legendFormat: "{{service}}",
							},
						],
						yAxes: [
							{
								label: "Requests/sec",
							},
						],
					},
					{
						id: 2,
						title: "Error Rate",
						type: "graph",
						targets: [
							{
								expr: `sum(rate(traces_received_total{service=~"${options.projectName}.*",status_code!~"2.."}[5m])) by (service) / sum(rate(traces_received_total{service=~"${options.projectName}.*"}[5m])) by (service)`,
								legendFormat: "{{service}}",
							},
						],
						yAxes: [
							{
								label: "Error Rate",
								max: 1,
								min: 0,
							},
						],
					},
					{
						id: 3,
						title: "Response Time (P95)",
						type: "graph",
						targets: [
							{
								expr: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service=~"${options.projectName}.*"}[5m])) by (service, le))`,
								legendFormat: "{{service}}",
							},
						],
						yAxes: [
							{
								label: "Response Time (s)",
							},
						],
					},
				],
				time: {
					from: "now-1h",
					to: "now",
				},
				refresh: "5s",
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/monitoring/grafana-dashboard.json.hbs",
			"tracing/monitoring/grafana-dashboard.json",
			grafanaDashboard,
		);
	}

	private async generateComplianceConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		if (
			!options.compliance.gdprCompliant &&
			!options.compliance.norwegianCompliant
		) {
			return;
		}

		const complianceConfig = {
			dataRetention: options.compliance.dataRetention,
			encryption: {
				atRest: options.compliance.encryptionAtRest,
				inTransit: options.compliance.encryptionInTransit,
			},
			dataProcessing: {
				anonymization: {
					enabled: true,
					fields: ["user_id", "email", "ip_address"],
					method: "hash",
				},
				retention: {
					traces: options.compliance.dataRetention,
					logs: options.compliance.dataRetention,
					metrics: "1y",
				},
			},
			access: {
				rbac: {
					enabled: true,
					roles: [
						{
							name: "tracing-viewer",
							permissions: ["read:traces", "read:spans"],
						},
						{
							name: "tracing-admin",
							permissions: ["*"],
						},
					],
				},
				audit: {
					enabled: true,
					events: ["access", "query", "export", "delete"],
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/compliance/compliance-config.yaml.hbs",
			"tracing/compliance-config.yaml",
			complianceConfig,
		);
	}

	private async generateDeploymentScripts(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const deployScript = `#!/bin/bash
set -e

NAMESPACE="${options.namespace}"
PROJECT="${options.projectName}"

echo "Deploying distributed tracing for \$PROJECT..."

# Create namespace if it doesn't exist
kubectl create namespace \$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply OpenTelemetry Collector configuration
kubectl apply -f tracing/otel-collector-config.yaml -n \$NAMESPACE

# Deploy OpenTelemetry Collector
kubectl apply -f tracing/k8s/ -n \$NAMESPACE

# Deploy tracing backend
kubectl apply -f tracing/jaeger.yaml -n \$NAMESPACE || true
kubectl apply -f tracing/tempo-config.yaml -n \$NAMESPACE || true

# Deploy service mesh configuration
kubectl apply -f tracing/istio-tracing.yaml || true
kubectl apply -f tracing/telemetry-config.yaml -n \$NAMESPACE || true

# Deploy monitoring
kubectl apply -f tracing/monitoring/ -n \$NAMESPACE

echo "Deployment completed!"
echo "Tracing UI will be available at:"
echo "  Jaeger: http://jaeger-query.\$NAMESPACE.svc.cluster.local:16686"
echo "  Tempo: http://tempo.\$NAMESPACE.svc.cluster.local:3200"
`;

		await this.templateManager.renderTemplate(
			"devops/tracing/scripts/deploy.sh.hbs",
			"scripts/deploy-tracing.sh",
			{ script: deployScript, executable: true },
		);
	}

	private async generateDocumentation(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		const documentation = {
			title: `${options.projectName} - Distributed Tracing Setup`,
			tracingBackend: options.tracingBackend,
			applications: options.applications,
			services: options.services,
			configuration: {
				samplingRate: options.samplingRate,
				retention: options.retention,
				storage: options.storage,
			},
			monitoring: {
				dashboards: [
					"Grafana Dashboard: /tracing/monitoring/grafana-dashboard.json",
				],
				alerts: ["Service Monitor: /tracing/monitoring/service-monitor.yaml"],
			},
			compliance: options.compliance,
			deployment: {
				commands: [
					"./scripts/deploy-tracing.sh",
					"kubectl port-forward svc/jaeger-query 16686:16686 -n " +
						options.namespace,
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/tracing/docs/README.md.hbs",
			"tracing/README.md",
			documentation,
		);
	}

	// Helper methods
	private getExporterConfig(
		options: DistributedTracingGeneratorOptions,
	): Record<string, any> {
		const exporters: Record<string, any> = {};

		switch (options.tracingBackend) {
			case "jaeger":
				exporters.jaeger = {
					endpoint: "http://jaeger-collector:14268/api/traces",
				};
				break;
			case "tempo":
				exporters.otlp = {
					endpoint: "http://tempo:4317",
					tls: { insecure: true },
				};
				break;
			case "zipkin":
				exporters.zipkin = {
					endpoint: "http://zipkin:9411/api/v2/spans",
				};
				break;
		}

		return exporters;
	}

	private getExporterEndpoint(backend: string): string {
		const endpoints: Record<string, string> = {
			jaeger: "http://jaeger-collector:14268/api/traces",
			tempo: "http://tempo:4317",
			zipkin: "http://zipkin:9411/api/v2/spans",
			"aws-xray": "https://xray.us-east-1.amazonaws.com",
			"azure-app-insights": "https://dc.services.visualstudio.com/v2/track",
		};

		return endpoints[backend] || "http://localhost:4317";
	}

	private getJaegerStorageConfig(
		options: DistributedTracingGeneratorOptions,
	): any {
		switch (options.storage.backend) {
			case "elasticsearch":
				return {
					type: "elasticsearch",
					elasticsearch: {
						serverUrls: ["http://elasticsearch:9200"],
						indexPrefix: options.projectName,
					},
				};
			case "cassandra":
				return {
					type: "cassandra",
					cassandra: {
						servers: ["cassandra:9042"],
						keyspace: options.projectName,
					},
				};
			default:
				return {
					type: "memory",
					options: {
						memory: {
							"memory.max-traces": 10000,
						},
					},
				};
		}
	}

	private async generatePythonConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for Python tracing configuration
	}

	private async generateJavaConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for Java tracing configuration
	}

	private async generateGoConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for Go tracing configuration
	}

	private async generateDotNetConfig(
		app: TracedApplication,
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for .NET tracing configuration
	}

	private async generateZipkinConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for Zipkin configuration
	}

	private async generateXRayConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for AWS X-Ray configuration
	}

	private async generateAppInsightsConfig(
		options: DistributedTracingGeneratorOptions,
	): Promise<void> {
		// Implementation for Azure App Insights configuration
	}
}

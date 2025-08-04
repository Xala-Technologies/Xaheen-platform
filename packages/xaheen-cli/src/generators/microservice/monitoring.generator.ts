/**
 * Monitoring and Observability Generator
 * Generates monitoring, logging, and observability configurations
 */

import type { GeneratedFile, MicroserviceOptions } from "./types.js";

export class MonitoringGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Prometheus configuration
		files.push(this.generatePrometheusConfig(options));

		// Grafana dashboard
		files.push(this.generateGrafanaDashboard(options));

		// Grafana datasource
		files.push(this.generateGrafanaDatasource(options));

		// Alert rules
		files.push(this.generateAlertRules(options));

		// Logging configuration
		files.push(this.generateLoggingConfig(options));

		// OpenTelemetry configuration
		if (options.tracing) {
			files.push(this.generateOpenTelemetryConfig(options));
		}

		return files;
	}

	private generatePrometheusConfig(
		options: MicroserviceOptions,
	): GeneratedFile {
		const content = `# Prometheus configuration for ${options.name}

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: '${options.name}-monitor'
    environment: 'production'

# Alert manager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Load rules once and periodically evaluate them
rule_files:
  - "alerts/*.yml"

# Scrape configurations
scrape_configs:
  # Scrape Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Scrape the microservice
  - job_name: '${options.name}'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['${options.name}:9090']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: '${options.name}'

  # Scrape Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  ${
		options.database === "postgresql"
			? `# Scrape PostgreSQL Exporter
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']`
			: ""
	}

  ${
		options.database === "mongodb"
			? `# Scrape MongoDB Exporter
  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['mongodb-exporter:9216']`
			: ""
	}

  ${
		options.database === "redis"
			? `# Scrape Redis Exporter
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']`
			: ""
	}

  ${
		options.messaging === "rabbitmq"
			? `# Scrape RabbitMQ Exporter
  - job_name: 'rabbitmq-exporter'
    static_configs:
      - targets: ['rabbitmq-exporter:9419']`
			: ""
	}

  ${
		options.messaging === "kafka"
			? `# Scrape Kafka Exporter
  - job_name: 'kafka-exporter'
    static_configs:
      - targets: ['kafka-exporter:9308']`
			: ""
	}

  # Kubernetes service discovery (if running in K8s)
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\\d+)?;(\\d+)
        replacement: \$1:\$2
        target_label: __address__
      - action: labelmap
        regex: __meta_kubernetes_pod_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: kubernetes_pod_name`;

		return {
			path: `${options.name}/monitoring/prometheus.yml`,
			content,
			type: "config",
		};
	}

	private generateGrafanaDashboard(
		options: MicroserviceOptions,
	): GeneratedFile {
		const dashboard = {
			dashboard: {
				id: null,
				uid: `${options.name}-dashboard`,
				title: `${options.name} Microservice Dashboard`,
				tags: ["microservice", options.name],
				timezone: "browser",
				schemaVersion: 16,
				version: 0,
				refresh: "10s",
				panels: [
					{
						id: 1,
						gridPos: { h: 8, w: 12, x: 0, y: 0 },
						type: "graph",
						title: "Request Rate",
						targets: [
							{
								expr: `rate(http_requests_total{job="${options.name}"}[5m])`,
								legendFormat: "{{method}} {{route}} {{status}}",
							},
						],
						yaxes: [{ format: "reqps", show: true }, { show: false }],
					},
					{
						id: 2,
						gridPos: { h: 8, w: 12, x: 12, y: 0 },
						type: "graph",
						title: "Request Duration",
						targets: [
							{
								expr: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="${options.name}"}[5m]))`,
								legendFormat: "95th percentile",
							},
							{
								expr: `histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job="${options.name}"}[5m]))`,
								legendFormat: "50th percentile",
							},
						],
						yaxes: [{ format: "s", show: true }, { show: false }],
					},
					{
						id: 3,
						gridPos: { h: 8, w: 8, x: 0, y: 8 },
						type: "stat",
						title: "Error Rate",
						targets: [
							{
								expr: `sum(rate(http_requests_total{job="${options.name}",status=~"5.."}[5m])) / sum(rate(http_requests_total{job="${options.name}"}[5m])) * 100`,
							},
						],
						format: "percent",
						thresholds: {
							mode: "absolute",
							steps: [
								{ color: "green", value: null },
								{ color: "yellow", value: 1 },
								{ color: "red", value: 5 },
							],
						},
					},
					{
						id: 4,
						gridPos: { h: 8, w: 8, x: 8, y: 8 },
						type: "gauge",
						title: "CPU Usage",
						targets: [
							{
								expr: `process_cpu_seconds_total{job="${options.name}"}`,
							},
						],
						format: "percent",
						max: 100,
						thresholds: {
							mode: "absolute",
							steps: [
								{ color: "green", value: null },
								{ color: "yellow", value: 70 },
								{ color: "red", value: 90 },
							],
						},
					},
					{
						id: 5,
						gridPos: { h: 8, w: 8, x: 16, y: 8 },
						type: "gauge",
						title: "Memory Usage",
						targets: [
							{
								expr: `process_resident_memory_bytes{job="${options.name}"} / 1024 / 1024`,
							},
						],
						format: "mbytes",
						max: 1024,
						thresholds: {
							mode: "absolute",
							steps: [
								{ color: "green", value: null },
								{ color: "yellow", value: 512 },
								{ color: "red", value: 768 },
							],
						},
					},
				],
			},
		};

		return {
			path: `${options.name}/monitoring/grafana/dashboards/${options.name}-dashboard.json`,
			content: JSON.stringify(dashboard, null, 2),
			type: "config",
		};
	}

	private generateGrafanaDatasource(
		options: MicroserviceOptions,
	): GeneratedFile {
		const datasource = {
			apiVersion: 1,
			datasources: [
				{
					name: "Prometheus",
					type: "prometheus",
					access: "proxy",
					url: "http://prometheus:9090",
					isDefault: true,
					editable: true,
				},
				{
					name: "Loki",
					type: "loki",
					access: "proxy",
					url: "http://loki:3100",
					editable: true,
				},
				options.tracing
					? {
							name: "Jaeger",
							type: "jaeger",
							access: "proxy",
							url: "http://jaeger:16686",
							editable: true,
						}
					: null,
			].filter(Boolean),
		};

		return {
			path: `${options.name}/monitoring/grafana/datasources/datasources.yaml`,
			content: JSON.stringify(datasource, null, 2).replace(/\.json/g, ".yaml"),
			type: "config",
		};
	}

	private generateAlertRules(options: MicroserviceOptions): GeneratedFile {
		const content = `# Alert rules for ${options.name}

groups:
  - name: ${options.name}_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{job="${options.name}",status=~"5.."}[5m])) 
          / 
          sum(rate(http_requests_total{job="${options.name}"}[5m])) 
          > 0.05
        for: 5m
        labels:
          severity: critical
          service: ${options.name}
        annotations:
          summary: "High error rate detected for ${options.name}"
          description: "Error rate is {{ \$value | humanizePercentage }} for the last 5 minutes"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95, 
            rate(http_request_duration_seconds_bucket{job="${options.name}"}[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
          service: ${options.name}
        annotations:
          summary: "High response time for ${options.name}"
          description: "95th percentile response time is {{ \$value }}s"

      # Service down
      - alert: ServiceDown
        expr: up{job="${options.name}"} == 0
        for: 1m
        labels:
          severity: critical
          service: ${options.name}
        annotations:
          summary: "${options.name} service is down"
          description: "The service has been down for more than 1 minute"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          process_resident_memory_bytes{job="${options.name}"} 
          / 1024 / 1024 > 512
        for: 5m
        labels:
          severity: warning
          service: ${options.name}
        annotations:
          summary: "High memory usage for ${options.name}"
          description: "Memory usage is {{ \$value }}MB"

      # High CPU usage
      - alert: HighCPUUsage
        expr: |
          rate(process_cpu_seconds_total{job="${options.name}"}[5m]) * 100 > 80
        for: 5m
        labels:
          severity: warning
          service: ${options.name}
        annotations:
          summary: "High CPU usage for ${options.name}"
          description: "CPU usage is {{ \$value }}%"

      ${
				options.database
					? `# Database connection issues
      - alert: DatabaseConnectionFailure
        expr: |
          increase(database_connection_errors_total{job="${options.name}"}[5m]) > 5
        for: 5m
        labels:
          severity: critical
          service: ${options.name}
        annotations:
          summary: "Database connection failures for ${options.name}"
          description: "{{ \$value }} connection failures in the last 5 minutes"`
					: ""
			}

      ${
				options.messaging
					? `# Message queue issues
      - alert: MessageQueueBacklog
        expr: |
          message_queue_backlog{job="${options.name}"} > 1000
        for: 10m
        labels:
          severity: warning
          service: ${options.name}
        annotations:
          summary: "Message queue backlog for ${options.name}"
          description: "{{ \$value }} messages in backlog"`
					: ""
			}`;

		return {
			path: `${options.name}/monitoring/alerts/alerts.yml`,
			content,
			type: "config",
		};
	}

	private generateLoggingConfig(options: MicroserviceOptions): GeneratedFile {
		const content = `# Logging configuration for ${options.name}

# Filebeat configuration
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"
      - decode_json_fields:
          fields: ["message"]
          target: "json"
          overwrite_keys: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "${options.name}-%{+yyyy.MM.dd}"

# Fluentd configuration
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter ${options.name}.**>
  @type parser
  key_name log
  <parse>
    @type json
  </parse>
</filter>

<filter ${options.name}.**>
  @type record_transformer
  <record>
    service ${options.name}
    hostname \${hostname}
    environment \${ENV}
  </record>
</filter>

<match ${options.name}.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
  logstash_prefix ${options.name}
  <buffer>
    @type file
    path /var/log/fluentd-buffers/${options.name}.buffer
    flush_mode interval
    flush_interval 10s
  </buffer>
</match>

# Loki configuration for Grafana
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

ingester:
  wal:
    enabled: true
    dir: /tmp/wal
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /tmp/loki/boltdb-shipper-active
    cache_location: /tmp/loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /tmp/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s`;

		return {
			path: `${options.name}/monitoring/logging-config.yml`,
			content,
			type: "config",
		};
	}

	private generateOpenTelemetryConfig(
		options: MicroserviceOptions,
	): GeneratedFile {
		const content = `# OpenTelemetry Collector configuration for ${options.name}

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  
  prometheus:
    config:
      scrape_configs:
        - job_name: '${options.name}'
          scrape_interval: 10s
          static_configs:
            - targets: ['${options.name}:9090']

  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:14250
      thrift_http:
        endpoint: 0.0.0.0:14268
      thrift_compact:
        endpoint: 0.0.0.0:6831
      thrift_binary:
        endpoint: 0.0.0.0:6832

  zipkin:
    endpoint: 0.0.0.0:9411

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
    send_batch_max_size: 2048

  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128

  resource:
    attributes:
      - key: service.name
        value: ${options.name}
        action: upsert
      - key: service.version
        from_attribute: app.version
        action: insert
      - key: deployment.environment
        from_attribute: env
        action: insert

  attributes:
    actions:
      - key: http.user_agent
        action: delete
      - key: password
        action: delete
      - key: token
        action: delete

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: ${options.name}

  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true

  logging:
    loglevel: info

  otlp:
    endpoint: otel-backend:4317
    tls:
      insecure: true

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp, jaeger, zipkin]
      processors: [memory_limiter, batch, resource, attributes]
      exporters: [jaeger, logging]
    
    metrics:
      receivers: [otlp, prometheus]
      processors: [memory_limiter, batch, resource]
      exporters: [prometheus, logging]
    
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [logging]`;

		return {
			path: `${options.name}/monitoring/otel-collector-config.yml`,
			content,
			type: "config",
		};
	}
}

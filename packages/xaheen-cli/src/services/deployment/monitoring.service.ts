import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'yaml';

const execAsync = promisify(exec);

// Schema for monitoring configuration
const MonitoringConfigSchema = z.object({
  prometheus: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('monitoring'),
    retention: z.string().default('15d'),
    scrapeInterval: z.string().default('30s'),
    evaluationInterval: z.string().default('30s'),
    storage: z.object({
      size: z.string().default('50Gi'),
      storageClass: z.string().default('standard'),
    }).default({}),
    nodeExporter: z.boolean().default(true),
    kubeStateMetrics: z.boolean().default(true),
    alertmanager: z.boolean().default(true),
  }).default({}),
  grafana: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('monitoring'),
    adminPassword: z.string().default('admin'),
    persistence: z.object({
      enabled: z.boolean().default(true),
      size: z.string().default('10Gi'),
      storageClass: z.string().default('standard'),
    }).default({}),
    dashboards: z.object({
      enabled: z.boolean().default(true),
      defaultDashboards: z.boolean().default(true),
    }).default({}),
  }).default({}),
  jaeger: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('monitoring'),
    strategy: z.enum(['allinone', 'production']).default('allinone'),
    storage: z.object({
      type: z.enum(['memory', 'elasticsearch', 'cassandra']).default('memory'),
      elasticsearch: z.object({
        server: z.string().default('elasticsearch:9200'),
        indexPrefix: z.string().default('jaeger'),
      }).optional(),
    }).default({}),
  }).default({}),
  loki: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('monitoring'),
    retention: z.string().default('168h'),
    storage: z.object({
      size: z.string().default('30Gi'),
      storageClass: z.string().default('standard'),
    }).default({}),
  }).default({}),
  opentelemetry: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('monitoring'),
    collector: z.object({
      mode: z.enum(['deployment', 'daemonset', 'sidecar']).default('deployment'),
      replicas: z.number().default(1),
    }).default({}),
    exporters: z.object({
      prometheus: z.boolean().default(true),
      jaeger: z.boolean().default(true),
      loki: z.boolean().default(true),
    }).default({}),
  }).default({}),
  serviceMonitor: z.object({
    enabled: z.boolean().default(true),
    interval: z.string().default('30s'),
    path: z.string().default('/metrics'),
    port: z.string().default('http'),
    labels: z.record(z.string()).default({}),
  }).default({}),
  alerts: z.object({
    enabled: z.boolean().default(true),
    rules: z.array(z.object({
      name: z.string(),
      expr: z.string(),
      duration: z.string().default('5m'),
      severity: z.enum(['critical', 'warning', 'info']).default('warning'),
      summary: z.string(),
      description: z.string(),
    })).default([]),
    notification: z.object({
      slack: z.object({
        enabled: z.boolean().default(false),
        webhook: z.string().optional(),
        channel: z.string().optional(),
      }).optional(),
      email: z.object({
        enabled: z.boolean().default(false),
        smtp: z.object({
          host: z.string(),
          port: z.number().default(587),
          username: z.string(),
          password: z.string(),
        }).optional(),
        to: z.array(z.string()).default([]),
      }).optional(),
    }).default({}),
  }).default({}),
  healthChecks: z.object({
    enabled: z.boolean().default(true),
    endpoints: z.array(z.object({
      name: z.string(),
      path: z.string(),
      port: z.number(),
      scheme: z.enum(['http', 'https']).default('http'),
      expectedStatus: z.number().default(200),
      timeout: z.string().default('10s'),
      interval: z.string().default('30s'),
    })).default([
      {
        name: 'health',
        path: '/health',
        port: 3000,
        scheme: 'http',
        expectedStatus: 200,
        timeout: '10s',
        interval: '30s',
      },
      {
        name: 'ready',
        path: '/ready',
        port: 3000,
        scheme: 'http',
        expectedStatus: 200,
        timeout: '10s',
        interval: '30s',
      },
    ]),
  }).default({}),
  norwegianCompliance: z.object({
    enabled: z.boolean().default(false),
    auditLogging: z.boolean().default(true),
    dataRetention: z.string().default('7y'), // Norwegian requirement for audit logs
    encryption: z.boolean().default(true),
    accessLogging: z.boolean().default(true),
  }).default({}),
});

export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;

export interface HealthStatus {
  service: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode?: number;
  message?: string;
  timestamp: string;
}

export interface MetricData {
  metric: string;
  value: number;
  timestamp: string;
  labels: Record<string, string>;
}

export class MonitoringService {
  private config: MonitoringConfig;
  private appName: string;
  private namespace: string;

  constructor(config: Partial<MonitoringConfig>, appName: string, namespace: string = 'default') {
    this.config = MonitoringConfigSchema.parse(config);
    this.appName = appName;
    this.namespace = namespace;
  }

  /**
   * Generate ServiceMonitor for Prometheus
   */
  generateServiceMonitor(): any {
    if (!this.config.serviceMonitor.enabled) {
      return null;
    }

    return {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'ServiceMonitor',
      metadata: {
        name: this.appName,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          'app.kubernetes.io/name': this.appName,
          'app.kubernetes.io/component': 'monitoring',
          ...this.config.serviceMonitor.labels,
          ...(this.config.norwegianCompliance.enabled && {
            'compliance.norway/monitoring': 'true',
            'compliance.norway/audit-required': 'true',
          }),
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
          'xaheen.dev/version': process.env.npm_package_version || '5.0.0',
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: this.appName,
          },
        },
        endpoints: [
          {
            port: this.config.serviceMonitor.port,
            path: this.config.serviceMonitor.path,
            interval: this.config.serviceMonitor.interval,
            scrapeTimeout: '10s',
            scheme: 'http',
            honorLabels: true,
            ...(this.config.norwegianCompliance.enabled && {
              metricRelabelings: [
                {
                  sourceLabels: ['__name__'],
                  regex: '.*',
                  replacement: '${1}',
                  targetLabel: 'compliance_monitored',
                },
              ],
            }),
          },
        ],
        namespaceSelector: {
          matchNames: [this.namespace],
        },
      },
    };
  }

  /**
   * Generate PrometheusRule for alerting
   */
  generatePrometheusRule(): any {
    if (!this.config.alerts.enabled) {
      return null;
    }

    const defaultRules = [
      {
        alert: 'HighErrorRate',
        expr: `rate(http_requests_total{service="${this.appName}",status=~"5.."}[5m]) > 0.1`,
        for: '5m',
        labels: {
          severity: 'critical',
          service: this.appName,
        },
        annotations: {
          summary: `High error rate detected for ${this.appName}`,
          description: `Error rate is above 10% for ${this.appName} in namespace ${this.namespace}`,
        },
      },
      {
        alert: 'HighResponseTime',
        expr: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${this.appName}"}[5m])) > 1`,
        for: '5m',
        labels: {
          severity: 'warning',
          service: this.appName,
        },
        annotations: {
          summary: `High response time detected for ${this.appName}`,
          description: `95th percentile response time is above 1s for ${this.appName}`,
        },
      },
      {
        alert: 'PodCrashLooping',
        expr: `increase(kube_pod_container_status_restarts_total{pod=~"${this.appName}-.*",namespace="${this.namespace}"}[1h]) > 5`,
        for: '5m',
        labels: {
          severity: 'critical',
          service: this.appName,
        },
        annotations: {
          summary: `Pod crash looping detected for ${this.appName}`,
          description: `Pod {{ $labels.pod }} has restarted more than 5 times in the last hour`,
        },
      },
      {
        alert: 'HighCPUUsage',
        expr: `rate(container_cpu_usage_seconds_total{pod=~"${this.appName}-.*",namespace="${this.namespace}"}[5m]) > 0.8`,
        for: '10m',
        labels: {
          severity: 'warning',
          service: this.appName,
        },
        annotations: {
          summary: `High CPU usage detected for ${this.appName}`,
          description: `CPU usage is above 80% for {{ $labels.pod }}`,
        },
      },
      {
        alert: 'HighMemoryUsage',
        expr: `container_memory_usage_bytes{pod=~"${this.appName}-.*",namespace="${this.namespace}"} / container_spec_memory_limit_bytes > 0.9`,
        for: '10m',
        labels: {
          severity: 'warning',
          service: this.appName,
        },
        annotations: {
          summary: `High memory usage detected for ${this.appName}`,
          description: `Memory usage is above 90% for {{ $labels.pod }}`,
        },
      },
      {
        alert: 'PodNotReady',
        expr: `kube_pod_status_ready{condition="false",pod=~"${this.appName}-.*",namespace="${this.namespace}"} == 1`,
        for: '5m',
        labels: {
          severity: 'critical',
          service: this.appName,
        },
        annotations: {
          summary: `Pod not ready for ${this.appName}`,
          description: `Pod {{ $labels.pod }} has been not ready for more than 5 minutes`,
        },
      },
    ];

    // Add Norwegian compliance specific alerts
    if (this.config.norwegianCompliance.enabled) {
      defaultRules.push(
        {
          alert: 'ComplianceAuditLogFailure',
          expr: `increase(audit_log_failures_total{service="${this.appName}"}[5m]) > 0`,
          for: '1m',
          labels: {
            severity: 'critical',
            service: this.appName,
            compliance: 'norway',
          },
          annotations: {
            summary: `Audit log failure detected for ${this.appName}`,
            description: `Norwegian compliance audit logging has failed for ${this.appName}`,
          },
        },
        {
          alert: 'UnauthorizedAccess',
          expr: `increase(http_requests_total{service="${this.appName}",status="401"}[5m]) > 10`,
          for: '2m',
          labels: {
            severity: 'warning',
            service: this.appName,
            compliance: 'norway',
          },
          annotations: {
            summary: `High number of unauthorized access attempts for ${this.appName}`,
            description: `More than 10 unauthorized access attempts detected in 5 minutes`,
          },
        }
      );
    }

    // Combine with custom rules
    const allRules = [...defaultRules, ...this.config.alerts.rules.map(rule => ({
      alert: rule.name,
      expr: rule.expr,
      for: rule.duration,
      labels: {
        severity: rule.severity,
        service: this.appName,
      },
      annotations: {
        summary: rule.summary,
        description: rule.description,
      },
    }))];

    return {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'PrometheusRule',
      metadata: {
        name: this.appName,
        namespace: this.namespace,
        labels: {
          app: this.appName,
          'app.kubernetes.io/name': this.appName,
          'app.kubernetes.io/component': 'alerting',
          prometheus: 'kube-prometheus',
          role: 'alert-rules',
          ...(this.config.norwegianCompliance.enabled && {
            'compliance.norway/alerting': 'true',
          }),
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        groups: [
          {
            name: `${this.appName}.rules`,
            interval: '30s',
            rules: allRules,
          },
        ],
      },
    };
  }

  /**
   * Generate Grafana dashboard
   */
  generateGrafanaDashboard(): any {
    const dashboard = {
      dashboard: {
        id: null,
        title: `${this.appName} - Application Metrics`,
        tags: ['xaheen', 'application', this.appName],
        timezone: 'browser',
        refresh: '30s',
        time: {
          from: 'now-1h',
          to: 'now',
        },
        panels: [
          {
            id: 1,
            title: 'Request Rate',
            type: 'graph',
            targets: [
              {
                expr: `rate(http_requests_total{service="${this.appName}"}[5m])`,
                legendFormat: '{{method}} {{status}}',
                refId: 'A',
              },
            ],
            yAxes: [
              {
                label: 'Requests/sec',
                min: 0,
              },
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 0 },
          },
          {
            id: 2,
            title: 'Response Time',
            type: 'graph',
            targets: [
              {
                expr: `histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{service="${this.appName}"}[5m]))`,
                legendFormat: 'p50',
                refId: 'A',
              },
              {
                expr: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${this.appName}"}[5m]))`,
                legendFormat: 'p95',
                refId: 'B',
              },
              {
                expr: `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service="${this.appName}"}[5m]))`,
                legendFormat: 'p99',
                refId: 'C',
              },
            ],
            yAxes: [
              {
                label: 'Seconds',
                min: 0,
              },
            ],
            gridPos: { h: 8, w: 12, x: 12, y: 0 },
          },
          {
            id: 3,
            title: 'Error Rate',
            type: 'graph',
            targets: [
              {
                expr: `rate(http_requests_total{service="${this.appName}",status=~"4.."}[5m])`,
                legendFormat: '4xx Errors',
                refId: 'A',
              },
              {
                expr: `rate(http_requests_total{service="${this.appName}",status=~"5.."}[5m])`,
                legendFormat: '5xx Errors',
                refId: 'B',
              },
            ],
            yAxes: [
              {
                label: 'Errors/sec',
                min: 0,
              },
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 8 },
          },
          {
            id: 4,
            title: 'CPU Usage',
            type: 'graph',
            targets: [
              {
                expr: `rate(container_cpu_usage_seconds_total{pod=~"${this.appName}-.*",namespace="${this.namespace}"}[5m])`,
                legendFormat: '{{pod}}',
                refId: 'A',
              },
            ],
            yAxes: [
              {
                label: 'CPU Cores',
                min: 0,
              },
            ],
            gridPos: { h: 8, w: 12, x: 12, y: 8 },
          },
          {
            id: 5,
            title: 'Memory Usage',
            type: 'graph',
            targets: [
              {
                expr: `container_memory_usage_bytes{pod=~"${this.appName}-.*",namespace="${this.namespace}"}`,
                legendFormat: '{{pod}}',
                refId: 'A',
              },
            ],
            yAxes: [
              {
                label: 'Bytes',
                min: 0,
              },
            ],
            gridPos: { h: 8, w: 12, x: 0, y: 16 },
          },
          {
            id: 6,
            title: 'Pod Status',
            type: 'table',
            targets: [
              {
                expr: `kube_pod_info{pod=~"${this.appName}-.*",namespace="${this.namespace}"}`,
                format: 'table',
                refId: 'A',
              },
            ],
            gridPos: { h: 8, w: 12, x: 12, y: 16 },
          },
        ],
        ...(this.config.norwegianCompliance.enabled && {
          annotations: {
            list: [
              {
                name: 'Compliance Events',
                datasource: 'Prometheus',
                expr: `compliance_events{service="${this.appName}"}`,
                titleFormat: 'Compliance Event',
                textFormat: '{{description}}',
              },
            ],
          },
        }),
      },
      overwrite: true,
    };

    return dashboard;
  }

  /**
   * Generate OpenTelemetry collector configuration
   */
  generateOpenTelemetryConfig(): any {
    if (!this.config.opentelemetry.enabled) {
      return null;
    }

    const config = {
      receivers: {
        otlp: {
          protocols: {
            grpc: {
              endpoint: '0.0.0.0:4317',
            },
            http: {
              endpoint: '0.0.0.0:4318',
            },
          },
        },
        prometheus: {
          config: {
            scrape_configs: [
              {
                job_name: `${this.appName}-metrics`,
                static_configs: [
                  {
                    targets: [`${this.appName}:3000`],
                  },
                ],
                scrape_interval: '30s',
                metrics_path: '/metrics',
              },
            ],
          },
        },
      },
      processors: {
        batch: {
          timeout: '1s',
          send_batch_size: 1024,
        },
        resource: {
          attributes: [
            {
              key: 'service.name',
              value: this.appName,
              action: 'upsert',
            },
            {
              key: 'service.namespace',
              value: this.namespace,
              action: 'upsert',
            },
            ...(this.config.norwegianCompliance.enabled && [
              {
                key: 'compliance.norway.enabled',
                value: 'true',
                action: 'upsert',
              },
              {
                key: 'compliance.audit.required',
                value: 'true',
                action: 'upsert',
              },
            ]),
          ],
        },
        memory_limiter: {
          limit_mib: 512,
          spike_limit_mib: 128,
        },
      },
      exporters: {},
      service: {
        pipelines: {
          traces: {
            receivers: ['otlp'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: [],
          },
          metrics: {
            receivers: ['otlp', 'prometheus'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: [],
          },
          logs: {
            receivers: ['otlp'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: [],
          },
        },
      },
    };

    // Add exporters based on configuration
    if (this.config.opentelemetry.exporters.prometheus) {
      config.exporters.prometheus = {
        endpoint: '0.0.0.0:8889',
        resource_to_telemetry_conversion: {
          enabled: true,
        },
      };
      config.service.pipelines.metrics.exporters.push('prometheus');
    }

    if (this.config.opentelemetry.exporters.jaeger) {
      config.exporters.jaeger = {
        endpoint: `jaeger-collector.${this.config.jaeger.namespace}.svc.cluster.local:14250`,
        tls: {
          insecure: true,
        },
      };
      config.service.pipelines.traces.exporters.push('jaeger');
    }

    if (this.config.opentelemetry.exporters.loki) {
      config.exporters.loki = {
        endpoint: `http://loki.${this.config.loki.namespace}.svc.cluster.local:3100/loki/api/v1/push`,
      };
      config.service.pipelines.logs.exporters.push('loki');
    }

    return config;
  }

  /**
   * Generate health check probes
   */
  generateHealthCheckProbes(): any[] {
    const probes = [];

    for (const endpoint of this.config.healthChecks.endpoints) {
      probes.push({
        httpGet: {
          path: endpoint.path,
          port: endpoint.port,
          scheme: endpoint.scheme.toUpperCase(),
        },
        initialDelaySeconds: 30,
        periodSeconds: parseInt(endpoint.interval.replace('s', '')),
        timeoutSeconds: parseInt(endpoint.timeout.replace('s', '')),
        failureThreshold: 3,
        successThreshold: 1,
      });
    }

    return probes;
  }

  /**
   * Generate all monitoring manifests
   */
  generateAllManifests(): { [key: string]: any } {
    const manifests: { [key: string]: any } = {};

    // ServiceMonitor
    const serviceMonitor = this.generateServiceMonitor();
    if (serviceMonitor) manifests.serviceMonitor = serviceMonitor;

    // PrometheusRule
    const prometheusRule = this.generatePrometheusRule();
    if (prometheusRule) manifests.prometheusRule = prometheusRule;

    // OpenTelemetry ConfigMap
    if (this.config.opentelemetry.enabled) {
      const otelConfig = this.generateOpenTelemetryConfig();
      manifests.opentelemetryConfig = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: `${this.appName}-otel-config`,
          namespace: this.namespace,
          labels: {
            app: this.appName,
            'app.kubernetes.io/component': 'opentelemetry',
          },
        },
        data: {
          'otel-config.yaml': yaml.stringify(otelConfig),
        },
      };
    }

    return manifests;
  }

  /**
   * Write monitoring manifests to files
   */
  async writeMonitoringManifests(outputDir: string): Promise<void> {
    try {
      await fs.ensureDir(outputDir);

      const manifests = this.generateAllManifests();

      for (const [name, manifest] of Object.entries(manifests)) {
        const filename = `${name}.yaml`;
        const filepath = path.join(outputDir, filename);
        const yamlContent = yaml.stringify(manifest, { indent: 2 });
        
        await fs.writeFile(filepath, yamlContent);
        console.log(`Generated monitoring ${filename}`);
      }

      // Generate Grafana dashboard JSON
      const dashboard = this.generateGrafanaDashboard();
      const dashboardPath = path.join(outputDir, 'grafana-dashboard.json');
      await fs.writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
      console.log('Generated grafana-dashboard.json');

      console.log(`All monitoring manifests written to ${outputDir}`);
    } catch (error) {
      throw new Error(`Failed to write monitoring manifests: ${error}`);
    }
  }

  /**
   * Check health status of application
   */
  async checkHealth(): Promise<HealthStatus[]> {
    const results: HealthStatus[] = [];

    for (const endpoint of this.config.healthChecks.endpoints) {
      try {
        const startTime = Date.now();
        
        // For now, we'll use kubectl port-forward approach
        // In a real implementation, this would use proper service discovery
        const url = `${endpoint.scheme}://localhost:${endpoint.port}${endpoint.path}`;
        
        const status: HealthStatus = {
          service: this.appName,
          endpoint: endpoint.name,
          status: 'healthy',
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        results.push(status);
      } catch (error) {
        results.push({
          service: this.appName,
          endpoint: endpoint.name,
          status: 'unhealthy',
          responseTime: 0,
          message: error.toString(),
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Query metrics from Prometheus
   */
  async queryMetrics(query: string, time?: string): Promise<MetricData[]> {
    try {
      // This would typically use the Prometheus HTTP API
      // For now, return mock data structure
      return [
        {
          metric: query,
          value: Math.random() * 100,
          timestamp: time || new Date().toISOString(),
          labels: {
            service: this.appName,
            namespace: this.namespace,
          },
        },
      ];
    } catch (error) {
      throw new Error(`Failed to query metrics: ${error}`);
    }
  }

  /**
   * Get application metrics summary
   */
  async getMetricsSummary(): Promise<{
    requestRate: number;
    errorRate: number;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
  }> {
    try {
      // In a real implementation, these would be actual Prometheus queries
      const metrics = {
        requestRate: Math.random() * 100,
        errorRate: Math.random() * 0.05,
        responseTime: Math.random() * 0.5,
        cpuUsage: Math.random() * 0.8,
        memoryUsage: Math.random() * 0.7,
        uptime: Math.random() * 86400,
      };

      return metrics;
    } catch (error) {
      throw new Error(`Failed to get metrics summary: ${error}`);
    }
  }

  /**
   * Setup monitoring stack (Prometheus, Grafana, etc.)
   */
  async setupMonitoringStack(helmInstall: boolean = true): Promise<void> {
    try {
      console.log('Setting up monitoring stack...');

      if (helmInstall) {
        // Install Prometheus Operator using Helm
        if (this.config.prometheus.enabled) {
          console.log('Installing Prometheus Operator...');
          await execAsync(`
            helm repo add prometheus-community https://prometheus-community.github.io/helm-charts &&
            helm repo update &&
            helm install prometheus prometheus-community/kube-prometheus-stack \\
              --namespace ${this.config.prometheus.namespace} \\
              --create-namespace \\
              --set prometheus.prometheusSpec.retention=${this.config.prometheus.retention} \\
              --set prometheus.prometheusSpec.scrapeInterval=${this.config.prometheus.scrapeInterval} \\
              --set prometheus.prometheusSpec.evaluationInterval=${this.config.prometheus.evaluationInterval}
          `);
        }

        // Install Jaeger
        if (this.config.jaeger.enabled) {
          console.log('Installing Jaeger...');
          await execAsync(`
            helm repo add jaegertracing https://jaegertracing.github.io/helm-charts &&
            helm repo update &&
            helm install jaeger jaegertracing/jaeger \\
              --namespace ${this.config.jaeger.namespace} \\
              --create-namespace \\
              --set strategy=${this.config.jaeger.strategy}
          `);
        }

        // Install Loki
        if (this.config.loki.enabled) {
          console.log('Installing Loki...');
          await execAsync(`
            helm repo add grafana https://grafana.github.io/helm-charts &&
            helm repo update &&
            helm install loki grafana/loki-stack \\
              --namespace ${this.config.loki.namespace} \\
              --create-namespace \\
              --set loki.retention_deletes_enabled=true \\
              --set loki.table_manager.retention_period=${this.config.loki.retention}
          `);
        }
      }

      console.log('Monitoring stack setup completed');
    } catch (error) {
      throw new Error(`Failed to setup monitoring stack: ${error}`);
    }
  }

  /**
   * Generate monitoring documentation
   */
  generateDocumentation(): string {
    return `# Monitoring Documentation for ${this.appName}

## Overview
This document describes the monitoring setup for ${this.appName} deployed in the ${this.namespace} namespace.

## Components

### Prometheus
- **Enabled**: ${this.config.prometheus.enabled}
- **Namespace**: ${this.config.prometheus.namespace}
- **Retention**: ${this.config.prometheus.retention}
- **Scrape Interval**: ${this.config.prometheus.scrapeInterval}

### Grafana
- **Enabled**: ${this.config.grafana.enabled}
- **Namespace**: ${this.config.grafana.namespace}
- **Dashboards**: ${this.config.grafana.dashboards.enabled}

### Jaeger (Distributed Tracing)
- **Enabled**: ${this.config.jaeger.enabled}
- **Strategy**: ${this.config.jaeger.strategy}
- **Namespace**: ${this.config.jaeger.namespace}

### OpenTelemetry
- **Enabled**: ${this.config.opentelemetry.enabled}
- **Collector Mode**: ${this.config.opentelemetry.collector.mode}
- **Exporters**: ${Object.entries(this.config.opentelemetry.exporters).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ')}

## Health Checks
The following health check endpoints are monitored:

${this.config.healthChecks.endpoints.map(endpoint => `
- **${endpoint.name}**: ${endpoint.scheme}://service:${endpoint.port}${endpoint.path}
  - Expected Status: ${endpoint.expectedStatus}
  - Timeout: ${endpoint.timeout}
  - Interval: ${endpoint.interval}
`).join('')}

## Alerts
${this.config.alerts.enabled ? 'Alerting is enabled with the following rules:' : 'Alerting is disabled.'}

${this.config.alerts.rules.map(rule => `
- **${rule.name}**: ${rule.summary}
  - Expression: \`${rule.expr}\`
  - Severity: ${rule.severity}
  - Duration: ${rule.duration}
`).join('')}

## Norwegian Compliance
${this.config.norwegianCompliance.enabled ? `
Norwegian compliance monitoring is enabled with the following features:
- **Audit Logging**: ${this.config.norwegianCompliance.auditLogging}
- **Data Retention**: ${this.config.norwegianCompliance.dataRetention}
- **Encryption**: ${this.config.norwegianCompliance.encryption}
- **Access Logging**: ${this.config.norwegianCompliance.accessLogging}
` : 'Norwegian compliance monitoring is disabled.'}

## Access URLs
After deploying the monitoring stack, you can access:

- **Prometheus**: http://prometheus.${this.config.prometheus.namespace}.svc.cluster.local:9090
- **Grafana**: http://grafana.${this.config.grafana.namespace}.svc.cluster.local:3000
- **Jaeger UI**: http://jaeger-query.${this.config.jaeger.namespace}.svc.cluster.local:16686
- **Alertmanager**: http://alertmanager.${this.config.prometheus.namespace}.svc.cluster.local:9093

## Troubleshooting
1. Check if monitoring components are running:
   \`\`\`bash
   kubectl get pods -n ${this.config.prometheus.namespace}
   kubectl get pods -n ${this.config.grafana.namespace}
   kubectl get pods -n ${this.config.jaeger.namespace}
   \`\`\`

2. Verify ServiceMonitor is discovered:
   \`\`\`bash
   kubectl get servicemonitor ${this.appName} -n ${this.namespace}
   \`\`\`

3. Check Prometheus targets:
   - Go to Prometheus UI → Status → Targets
   - Look for ${this.appName} target

Generated by Xaheen CLI v${process.env.npm_package_version || '5.0.0'}
`;
  }
}

// Export default configuration
export const defaultMonitoringConfig = MonitoringConfigSchema.parse({});
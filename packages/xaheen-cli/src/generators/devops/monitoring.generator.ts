import { BaseGenerator } from '../base.generator';
import { TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';

export interface MonitoringGeneratorOptions {
  readonly projectName: string;
  readonly namespace: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly enablePrometheus: boolean;
  readonly enableGrafana: boolean;
  readonly enableLoki: boolean;
  readonly enableTempo: boolean;
  readonly enableOpenTelemetry: boolean;
  readonly enableJaeger: boolean;
  readonly enableAlertManager: boolean;
  readonly enablePrometheusOperator: boolean;
  readonly enableServiceMonitor: boolean;
  readonly enablePodMonitor: boolean;
  readonly enableNodeExporter: boolean;
  readonly enableKubeStateMetrics: boolean;
  readonly enableBlackboxExporter: boolean;
  readonly applications: readonly MonitoredApplication[];
  readonly dashboards: readonly GrafanaDashboard[];
  readonly alerts: readonly PrometheusAlert[];
  readonly retention: {
    readonly prometheus: string;
    readonly loki: string;
    readonly tempo: string;
  };
  readonly storage: {
    readonly prometheus: string;
    readonly loki: string;
    readonly tempo: string;
    readonly grafana: string;
  };
  readonly ingress: {
    readonly enabled: boolean;
    readonly className?: string;
    readonly annotations?: Record<string, string>;
    readonly hosts: readonly IngressHost[];
    readonly tls?: readonly IngressTLS[];
  };
  readonly authentication: {
    readonly grafana: GrafanaAuth;
    readonly prometheus?: BasicAuth;
    readonly alertmanager?: BasicAuth;
  };
  readonly notifications: readonly NotificationChannel[];
  readonly resources: ResourceRequirements;
  readonly security: SecurityConfig;
  readonly compliance: {
    readonly enabled: boolean;
    readonly gdprCompliant: boolean;
    readonly norwegianCompliant: boolean;
    readonly dataRetention: string;
    readonly encryptionAtRest: boolean;
    readonly encryptionInTransit: boolean;
  };
}

export interface MonitoredApplication {
  readonly name: string;
  readonly namespace: string;
  readonly port: number;
  readonly path: string;
  readonly labels: Record<string, string>;
  readonly scrapeInterval: string;
  readonly scrapeTimeout: string;
  readonly metricRelabelings?: readonly MetricRelabeling[];
  readonly honorTimestamps?: boolean;
  readonly honorLabels?: boolean;
}

export interface GrafanaDashboard {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly panels: readonly DashboardPanel[];
  readonly variables: readonly DashboardVariable[];
  readonly refresh: string;
  readonly timeRange: {
    readonly from: string;
    readonly to: string;
  };
}

export interface DashboardPanel {
  readonly id: number;
  readonly title: string;
  readonly type: 'graph' | 'stat' | 'gauge' | 'table' | 'heatmap' | 'logs' | 'traces';
  readonly targets: readonly PromQLTarget[];
  readonly gridPos: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  };
  readonly options?: any;
  readonly fieldConfig?: any;
}

export interface DashboardVariable {
  readonly name: string;
  readonly type: 'query' | 'constant' | 'datasource' | 'interval' | 'custom';
  readonly query?: string;
  readonly options?: readonly string[];
  readonly current?: string;
  readonly multi?: boolean;
  readonly includeAll?: boolean;
}

export interface PromQLTarget {
  readonly expr: string;
  readonly legendFormat?: string;
  readonly refId: string;
  readonly interval?: string;
  readonly format?: 'time_series' | 'table' | 'heatmap';
}

export interface PrometheusAlert {
  readonly name: string;
  readonly expr: string;
  readonly for: string;
  readonly labels: Record<string, string>;
  readonly annotations: Record<string, string>;
  readonly severity: 'critical' | 'warning' | 'info';
}

export interface MetricRelabeling {
  readonly sourceLabels: readonly string[];
  readonly targetLabel: string;
  readonly action: 'replace' | 'keep' | 'drop' | 'labelmap' | 'labeldrop' | 'labelkeep';
  readonly regex?: string;
  readonly replacement?: string;
}

export interface IngressHost {
  readonly host: string;
  readonly paths: readonly {
    readonly path: string;
    readonly pathType: 'Exact' | 'Prefix' | 'ImplementationSpecific';
    readonly service: string;
    readonly port: number;
  }[];
}

export interface IngressTLS {
  readonly secretName: string;
  readonly hosts: readonly string[];
}

export interface GrafanaAuth {
  readonly adminUser: string;
  readonly adminPassword?: string;
  readonly secretName?: string;
  readonly oauth?: {
    readonly enabled: boolean;
    readonly provider: 'github' | 'gitlab' | 'google' | 'azure' | 'okta' | 'keycloak';
    readonly clientId: string;
    readonly clientSecret: string;
    readonly scopes: readonly string[];
  };
  readonly ldap?: {
    readonly enabled: boolean;
    readonly configSecret: string;
  };
}

export interface BasicAuth {
  readonly username: string;
  readonly password?: string;
  readonly secretName?: string;
}

export interface NotificationChannel {
  readonly name: string;
  readonly type: 'slack' | 'email' | 'webhook' | 'pagerduty' | 'msteams' | 'discord';
  readonly settings: Record<string, any>;
  readonly sendResolved?: boolean;
}

export interface ResourceRequirements {
  readonly prometheus: {
    readonly requests: { readonly cpu: string; readonly memory: string };
    readonly limits: { readonly cpu: string; readonly memory: string };
  };
  readonly grafana: {
    readonly requests: { readonly cpu: string; readonly memory: string };
    readonly limits: { readonly cpu: string; readonly memory: string };
  };
  readonly loki: {
    readonly requests: { readonly cpu: string; readonly memory: string };
    readonly limits: { readonly cpu: string; readonly memory: string };
  };
  readonly tempo: {
    readonly requests: { readonly cpu: string; readonly memory: string };
    readonly limits: { readonly cpu: string; readonly memory: string };
  };
}

export interface SecurityConfig {
  readonly enableNetworkPolicies: boolean;
  readonly enablePodSecurityPolicies: boolean;
  readonly enableRBAC: boolean;
  readonly enableServiceMesh: boolean;
  readonly enableTLS: boolean;
  readonly tlsSecretName?: string;
  readonly runAsNonRoot: boolean;
  readonly readOnlyRootFilesystem: boolean;
  readonly allowPrivilegeEscalation: boolean;
  readonly capabilities: {
    readonly add?: readonly string[];
    readonly drop?: readonly string[];
  };
}

export class MonitoringGenerator extends BaseGenerator<MonitoringGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: MonitoringGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const projectContext = await this.analyzer.analyze(process.cwd());
      
      // Create monitoring directory structure
      await this.createMonitoringStructure(options);
      
      // Generate Prometheus 3.0 configuration
      if (options.enablePrometheus) {
        await this.generatePrometheusConfig(options);
      }
      
      // Generate Prometheus Operator resources
      if (options.enablePrometheusOperator) {
        await this.generatePrometheusOperator(options);
      }
      
      // Generate Grafana configuration
      if (options.enableGrafana) {
        await this.generateGrafanaConfig(options);
      }
      
      // Generate Loki configuration
      if (options.enableLoki) {
        await this.generateLokiConfig(options);
      }
      
      // Generate Tempo configuration
      if (options.enableTempo) {
        await this.generateTempoConfig(options);
      }
      
      // Generate OpenTelemetry configuration
      if (options.enableOpenTelemetry) {
        await this.generateOpenTelemetryConfig(options);
      }
      
      // Generate AlertManager configuration
      if (options.enableAlertManager) {
        await this.generateAlertManagerConfig(options);
      }
      
      // Generate ServiceMonitors and PodMonitors
      if (options.enableServiceMonitor || options.enablePodMonitor) {
        await this.generateMonitoringResources(options);
      }
      
      // Generate exporters
      await this.generateExporters(options);
      
      // Generate dashboards
      await this.generateDashboards(options);
      
      // Generate alert rules
      await this.generateAlertRules(options);
      
      // Generate network policies
      if (options.security.enableNetworkPolicies) {
        await this.generateNetworkPolicies(options);
      }
      
      // Generate RBAC
      if (options.security.enableRBAC) {
        await this.generateRBAC(options);
      }
      
      // Generate ingress
      if (options.ingress.enabled) {
        await this.generateIngress(options);
      }
      
      // Generate Helm chart
      await this.generateHelmChart(options);
      
      // Generate Kustomization
      await this.generateKustomization(options);
      
      // Generate Docker Compose for local development
      await this.generateDockerCompose(options);
      
      this.logger.success('Monitoring stack generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate monitoring stack', error);
      throw error;
    }
  }

  private async validateOptions(options: MonitoringGeneratorOptions): Promise<void> {
    if (!options.projectName) {
      throw new Error('Project name is required');
    }
    
    if (!options.namespace) {
      throw new Error('Namespace is required');
    }
    
    if (!options.enablePrometheus && !options.enableLoki && !options.enableTempo) {
      throw new Error('At least one monitoring component must be enabled');
    }
    
    if (options.enableGrafana && !options.authentication.grafana.adminUser) {
      throw new Error('Grafana admin user is required when Grafana is enabled');
    }
  }

  private async createMonitoringStructure(options: MonitoringGeneratorOptions): Promise<void> {
    const directories = [
      'monitoring',
      'monitoring/prometheus',
      'monitoring/grafana',
      'monitoring/grafana/dashboards',
      'monitoring/grafana/datasources',
      'monitoring/grafana/provisioning',
      'monitoring/loki',
      'monitoring/tempo',
      'monitoring/alertmanager',
      'monitoring/opentelemetry',
      'monitoring/exporters',
      'monitoring/rules',
      'monitoring/charts',
      'monitoring/kustomize',
      'monitoring/docker'
    ];

    for (const dir of directories) {
      await this.templateManager.renderTemplate(
        'devops/monitoring/structure/.gitkeep.hbs',
        `${dir}/.gitkeep`,
        {}
      );
    }
  }

  private async generatePrometheusConfig(options: MonitoringGeneratorOptions): Promise<void> {
    // Prometheus 3.0 configuration with new features
    const prometheusConfig = {
      global: {
        scrape_interval: '15s',
        scrape_timeout: '10s',
        evaluation_interval: '15s',
        external_labels: {
          cluster: options.projectName,
          environment: options.environment,
          region: 'norway-east'
        }
      },
      
      // New Prometheus 3.0 features
      remote_write_v2: {
        enabled: true,
        receivers: []
      },
      
      utf8_support: {
        enabled: true
      },
      
      native_histograms: {
        enabled: true
      },
      
      // OpenTelemetry native ingestion
      otlp: {
        protocols: {
          grpc: {
            endpoint: '0.0.0.0:4317'
          },
          http: {
            endpoint: '0.0.0.0:4318'
          }
        }
      },
      
      rule_files: [
        'rules/*.yml',
        'rules/*.yaml'
      ],
      
      scrape_configs: [
        // Prometheus self-monitoring
        {
          job_name: 'prometheus',
          static_configs: [{
            targets: ['localhost:9090']
          }],
          scrape_interval: '5s',
          metrics_path: '/metrics'
        },
        
        // Kubernetes API server
        {
          job_name: 'kubernetes-apiservers',
          kubernetes_sd_configs: [{
            role: 'endpoints'
          }],
          scheme: 'https',
          tls_config: {
            ca_file: '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'
          },
          bearer_token_file: '/var/run/secrets/kubernetes.io/serviceaccount/token',
          relabel_configs: [
            {
              source_labels: ['__meta_kubernetes_namespace', '__meta_kubernetes_service_name', '__meta_kubernetes_endpoint_port_name'],
              action: 'keep',
              regex: 'default;kubernetes;https'
            }
          ]
        },
        
        // Kubernetes nodes
        {
          job_name: 'kubernetes-nodes',
          kubernetes_sd_configs: [{
            role: 'node'
          }],
          scheme: 'https',
          tls_config: {
            ca_file: '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'
          },
          bearer_token_file: '/var/run/secrets/kubernetes.io/serviceaccount/token',
          relabel_configs: [
            {
              action: 'labelmap',
              regex: '__meta_kubernetes_node_label_(.+)'
            }
          ]
        },
        
        // Kubernetes pods
        {
          job_name: 'kubernetes-pods',
          kubernetes_sd_configs: [{
            role: 'pod'
          }],
          relabel_configs: [
            {
              source_labels: ['__meta_kubernetes_pod_annotation_prometheus_io_scrape'],
              action: 'keep',
              regex: 'true'
            },
            {
              source_labels: ['__meta_kubernetes_pod_annotation_prometheus_io_path'],
              action: 'replace',
              target_label: '__metrics_path__',
              regex: '(.+)'
            },
            {
              source_labels: ['__address__', '__meta_kubernetes_pod_annotation_prometheus_io_port'],
              action: 'replace',
              regex: '([^:]+)(?::\\d+)?;(\\d+)',
              replacement: '${1}:${2}',
              target_label: '__address__'
            }
          ]
        },
        
        // Application-specific scrape configs
        ...options.applications.map(app => ({
          job_name: app.name,
          kubernetes_sd_configs: [{
            role: 'endpoints'
          }],
          relabel_configs: [
            {
              source_labels: ['__meta_kubernetes_service_name'],
              action: 'keep',
              regex: app.name
            },
            {
              source_labels: ['__meta_kubernetes_namespace'],
              action: 'keep',
              regex: app.namespace
            }
          ],
          scrape_interval: app.scrapeInterval,
          scrape_timeout: app.scrapeTimeout,
          metrics_path: app.path,
          metric_relabel_configs: app.metricRelabelings || []
        }))
      ],
      
      alerting: {
        alertmanagers: [
          {
            static_configs: [{
              targets: ['alertmanager:9093']
            }]
          }
        ]
      },
      
      storage: {
        tsdb: {
          retention_time: options.retention.prometheus,
          retention_size: options.storage.prometheus,
          // New Prometheus 3.0 WAL compression
          wal_compression: true,
          // Enhanced query performance
          query_log_file: '/prometheus/query.log',
          // GDPR compliance settings
          ...(options.compliance.enabled && {
            allow_overlapping_blocks: false,
            max_block_duration: '2h'
          })
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/prometheus/prometheus.yml.hbs',
      'monitoring/prometheus/prometheus.yml',
      prometheusConfig
    );

    // Generate Kubernetes deployment
    const prometheusDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'prometheus',
        namespace: options.namespace,
        labels: {
          app: 'prometheus',
          version: '3.0'
        }
      },
      spec: {
        replicas: options.environment === 'production' ? 2 : 1,
        strategy: {
          type: 'Recreate'
        },
        selector: {
          matchLabels: {
            app: 'prometheus'
          }
        },
        template: {
          metadata: {
            labels: {
              app: 'prometheus'
            }
          },
          spec: {
            serviceAccountName: 'prometheus',
            securityContext: options.security.runAsNonRoot ? {
              runAsNonRoot: true,
              runAsUser: 65534,
              fsGroup: 65534
            } : {},
            containers: [
              {
                name: 'prometheus',
                image: 'prom/prometheus:v3.0.0', // Prometheus 3.0
                args: [
                  '--config.file=/etc/prometheus/prometheus.yml',
                  '--storage.tsdb.path=/prometheus/',
                  '--web.console.libraries=/etc/prometheus/console_libraries',
                  '--web.console.templates=/etc/prometheus/consoles',
                  '--web.enable-lifecycle',
                  '--web.enable-admin-api',
                  '--storage.tsdb.retention.time=' + options.retention.prometheus,
                  '--storage.tsdb.retention.size=' + options.storage.prometheus,
                  '--web.enable-remote-write-receiver', // New in 3.0
                  '--enable-feature=otlp-write-receiver', // OpenTelemetry support
                  '--enable-feature=native-histograms' // Native histograms
                ],
                ports: [
                  {
                    containerPort: 9090,
                    name: 'http'
                  }
                ],
                livenessProbe: {
                  httpGet: {
                    path: '/-/healthy',
                    port: 9090
                  },
                  initialDelaySeconds: 30,
                  timeoutSeconds: 30
                },
                readinessProbe: {
                  httpGet: {
                    path: '/-/ready',
                    port: 9090
                  },
                  initialDelaySeconds: 30,
                  timeoutSeconds: 30
                },
                resources: options.resources.prometheus,
                securityContext: {
                  allowPrivilegeEscalation: options.security.allowPrivilegeEscalation,
                  readOnlyRootFilesystem: options.security.readOnlyRootFilesystem,
                  capabilities: {
                    drop: options.security.capabilities.drop || ['ALL'],
                    add: options.security.capabilities.add || []
                  }
                },
                volumeMounts: [
                  {
                    name: 'config-volume',
                    mountPath: '/etc/prometheus'
                  },
                  {
                    name: 'storage-volume',
                    mountPath: '/prometheus'
                  }
                ]
              }
            ],
            volumes: [
              {
                name: 'config-volume',
                configMap: {
                  name: 'prometheus-config'
                }
              },
              {
                name: 'storage-volume',
                persistentVolumeClaim: {
                  claimName: 'prometheus-storage'
                }
              }
            ]
          }
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/prometheus/deployment.yaml.hbs',
      'monitoring/prometheus/deployment.yaml',
      prometheusDeployment
    );
  }

  private async generateGrafanaConfig(options: MonitoringGeneratorOptions): Promise<void> {
    // Grafana LGTM stack configuration
    const grafanaConfig = {
      apiVersion: 1,
      
      datasources: [
        // Prometheus datasource
        {
          name: 'Prometheus',
          type: 'prometheus',
          access: 'proxy',
          url: 'http://prometheus:9090',
          isDefault: true,
          editable: false,
          jsonData: {
            httpMethod: 'POST',
            manageAlerts: true,
            prometheusType: 'Prometheus',
            prometheusVersion: '3.0.0',
            cacheLevel: 'High',
            disableRecordingRules: false,
            incrementalQuerying: true,
            exemplarTraceIdDestinations: options.enableTempo ? [
              {
                name: 'trace_id',
                datasourceUid: 'tempo'
              }
            ] : undefined
          }
        },
        
        // Loki datasource
        ...(options.enableLoki ? [{
          name: 'Loki',
          type: 'loki',
          access: 'proxy',
          url: 'http://loki:3100',
          editable: false,
          jsonData: {
            derivedFields: options.enableTempo ? [
              {
                datasourceUid: 'tempo',
                matcherRegex: 'trace_id=(\\w+)',
                name: 'TraceID',
                url: '$${__value.raw}'
              }
            ] : undefined
          }
        }] : []),
        
        // Tempo datasource
        ...(options.enableTempo ? [{
          name: 'Tempo',
          type: 'tempo',
          access: 'proxy',
          url: 'http://tempo:3200',
          uid: 'tempo',
          editable: false,
          jsonData: {
            tracesToLogs: {
              datasourceUid: 'loki',
              tags: ['job', 'instance', 'pod', 'namespace'],
              mappedTags: [
                { key: 'service.name', value: 'service' }
              ],
              mapTagNamesEnabled: true,
              spanStartTimeShift: '1h',
              spanEndTimeShift: '1h',
              filterByTraceID: true,
              filterBySpanID: true
            },
            tracesToMetrics: {
              datasourceUid: 'prometheus',
              tags: [
                { key: 'service.name', value: 'service' },
                { key: 'service.namespace', value: 'namespace' }
              ],
              queries: [
                {
                  name: 'Sample query',
                  query: 'sum(rate(traces_spanmetrics_latency_bucket[$__interval]))'
                }
              ]
            },
            serviceMap: {
              datasourceUid: 'prometheus'
            },
            search: {
              hide: false
            },
            nodeGraph: {
              enabled: true
            }
          }
        }] : [])
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/grafana/datasources.yaml.hbs',
      'monitoring/grafana/datasources/datasources.yaml',
      grafanaConfig
    );

    // Generate Grafana deployment
    const grafanaDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'grafana',
        namespace: options.namespace,
        labels: {
          app: 'grafana'
        }
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: 'grafana'
          }
        },
        template: {
          metadata: {
            labels: {
              app: 'grafana'
            }
          },
          spec: {
            securityContext: options.security.runAsNonRoot ? {
              runAsNonRoot: true,
              runAsUser: 472,
              fsGroup: 472
            } : {},
            containers: [
              {
                name: 'grafana',
                image: 'grafana/grafana:10.2.0',
                ports: [
                  {
                    containerPort: 3000,
                    name: 'http'
                  }
                ],
                env: [
                  {
                    name: 'GF_SECURITY_ADMIN_USER',
                    value: options.authentication.grafana.adminUser
                  },
                  {
                    name: 'GF_SECURITY_ADMIN_PASSWORD',
                    valueFrom: options.authentication.grafana.secretName ? {
                      secretKeyRef: {
                        name: options.authentication.grafana.secretName,
                        key: 'admin-password'
                      }
                    } : {
                      value: options.authentication.grafana.adminPassword || 'admin'
                    }
                  },
                  // GDPR compliance
                  ...(options.compliance.gdprCompliant ? [
                    {
                      name: 'GF_ANALYTICS_REPORTING_ENABLED',
                      value: 'false'
                    },
                    {
                      name: 'GF_ANALYTICS_CHECK_FOR_UPDATES',
                      value: 'false'
                    }
                  ] : [])
                ],
                resources: options.resources.grafana,
                securityContext: {
                  allowPrivilegeEscalation: options.security.allowPrivilegeEscalation,
                  readOnlyRootFilesystem: false, // Grafana needs write access
                  capabilities: {
                    drop: options.security.capabilities.drop || ['ALL']
                  }
                },
                volumeMounts: [
                  {
                    name: 'grafana-storage',
                    mountPath: '/var/lib/grafana'
                  },
                  {
                    name: 'grafana-datasources',
                    mountPath: '/etc/grafana/provisioning/datasources'
                  },
                  {
                    name: 'grafana-dashboards',
                    mountPath: '/etc/grafana/provisioning/dashboards'
                  }
                ]
              }
            ],
            volumes: [
              {
                name: 'grafana-storage',
                persistentVolumeClaim: {
                  claimName: 'grafana-storage'
                }
              },
              {
                name: 'grafana-datasources',
                configMap: {
                  name: 'grafana-datasources'
                }
              },
              {
                name: 'grafana-dashboards',
                configMap: {
                  name: 'grafana-dashboards'
                }
              }
            ]
          }
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/grafana/deployment.yaml.hbs',
      'monitoring/grafana/deployment.yaml',
      grafanaDeployment
    );
  }

  private async generateOpenTelemetryConfig(options: MonitoringGeneratorOptions): Promise<void> {
    const otelConfig = {
      receivers: {
        otlp: {
          protocols: {
            grpc: {
              endpoint: '0.0.0.0:4317'
            },
            http: {
              endpoint: '0.0.0.0:4318'
            }
          }
        },
        prometheus: {
          config: {
            scrape_configs: [
              {
                job_name: 'otel-collector',
                scrape_interval: '10s',
                static_configs: [
                  { targets: ['localhost:8888'] }
                ]
              }
            ]
          }
        },
        k8s_cluster: {
          auth_type: 'serviceAccount'
        },
        kubeletstats: {
          collection_interval: '20s',
          auth_type: 'serviceAccount',
          endpoint: 'https://${K8S_NODE_NAME}:10250',
          insecure_skip_verify: true
        }
      },
      
      processors: {
        batch: {
          timeout: '1s',
          send_batch_size: 1024
        },
        memory_limiter: {
          limit_mib: 512
        },
        resource: {
          attributes: [
            {
              key: 'environment',
              value: options.environment,
              action: 'upsert'
            },
            {
              key: 'cluster',
              value: options.projectName,
              action: 'upsert'
            }
          ]
        },
        ...(options.compliance.enabled ? {
          redaction: {
            allow_all_keys: false,
            blocked_values: [
              'password', 'secret', 'key', 'token',
              'ssn', 'credit_card', 'email'
            ]
          }
        } : {})
      },
      
      exporters: {
        ...(options.enablePrometheus ? {
          prometheus: {
            endpoint: '0.0.0.0:8889'
          },
          prometheusremotewrite: {
            endpoint: 'http://prometheus:9090/api/v1/write',
            tls: {
              insecure: true
            }
          }
        } : {}),
        
        ...(options.enableLoki ? {
          loki: {
            endpoint: 'http://loki:3100/loki/api/v1/push',
            format: 'json'
          }
        } : {}),
        
        ...(options.enableTempo ? {
          otlp: {
            endpoint: 'tempo:4317',
            tls: {
              insecure: true
            }
          }
        } : {}),
        
        logging: {
          loglevel: 'info'
        }
      },
      
      service: {
        pipelines: {
          traces: {
            receivers: ['otlp'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: options.enableTempo ? ['otlp', 'logging'] : ['logging']
          },
          metrics: {
            receivers: ['otlp', 'prometheus', 'k8s_cluster', 'kubeletstats'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: options.enablePrometheus ? 
              ['prometheus', 'prometheusremotewrite', 'logging'] : 
              ['logging']
          },
          logs: {
            receivers: ['otlp'],
            processors: ['memory_limiter', 'resource', 'batch'],
            exporters: options.enableLoki ? ['loki', 'logging'] : ['logging']
          }
        },
        extensions: ['health_check', 'pprof', 'zpages'],
        telemetry: {
          logs: {
            level: 'info'
          },
          metrics: {
            address: '0.0.0.0:8888'
          }
        }
      },
      
      extensions: {
        health_check: {
          endpoint: '0.0.0.0:13133'
        },
        pprof: {
          endpoint: '0.0.0.0:1777'
        },
        zpages: {
          endpoint: '0.0.0.0:55679'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/opentelemetry/otel-collector.yaml.hbs',
      'monitoring/opentelemetry/otel-collector.yaml',
      { config: otelConfig }
    );

    // Generate OpenTelemetry Collector deployment
    const otelDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'otel-collector',
        namespace: options.namespace,
        labels: {
          app: 'otel-collector'
        }
      },
      spec: {
        replicas: options.environment === 'production' ? 2 : 1,
        selector: {
          matchLabels: {
            app: 'otel-collector'
          }
        },
        template: {
          metadata: {
            labels: {
              app: 'otel-collector'
            }
          },
          spec: {
            serviceAccountName: 'otel-collector',
            securityContext: options.security.runAsNonRoot ? {
              runAsNonRoot: true,
              runAsUser: 10001,
              fsGroup: 10001
            } : {},
            containers: [
              {
                name: 'otel-collector',
                image: 'otel/opentelemetry-collector-contrib:0.89.0',
                command: ['/otelcol-contrib'],
                args: ['--config=/conf/otel-collector.yaml'],
                ports: [
                  { containerPort: 4317, name: 'otlp-grpc' },
                  { containerPort: 4318, name: 'otlp-http' },
                  { containerPort: 8888, name: 'metrics' },
                  { containerPort: 13133, name: 'health' }
                ],
                env: [
                  {
                    name: 'K8S_NODE_NAME',
                    valueFrom: {
                      fieldRef: {
                        fieldPath: 'spec.nodeName'
                      }
                    }
                  }
                ],
                resources: {
                  requests: {
                    cpu: '100m',
                    memory: '256Mi'
                  },
                  limits: {
                    cpu: '500m',
                    memory: '512Mi'
                  }
                },
                securityContext: {
                  allowPrivilegeEscalation: options.security.allowPrivilegeEscalation,
                  readOnlyRootFilesystem: options.security.readOnlyRootFilesystem,
                  capabilities: {
                    drop: options.security.capabilities.drop || ['ALL']
                  }
                },
                volumeMounts: [
                  {
                    name: 'config',
                    mountPath: '/conf'
                  }
                ],
                livenessProbe: {
                  httpGet: {
                    path: '/',
                    port: 13133
                  },
                  initialDelaySeconds: 30,
                  timeoutSeconds: 5
                }
              }
            ],
            volumes: [
              {
                name: 'config',
                configMap: {
                  name: 'otel-collector-config'
                }
              }
            ]
          }
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/opentelemetry/deployment.yaml.hbs',
      'monitoring/opentelemetry/deployment.yaml',
      otelDeployment
    );
  }

  // Additional methods for generating other components...
  private async generateLokiConfig(options: MonitoringGeneratorOptions): Promise<void> {
    // Loki 3.0 configuration with enhanced features
    const lokiConfig = {
      auth_enabled: false,
      
      server: {
        http_listen_port: 3100,
        grpc_listen_port: 9095,
        grpc_server_max_recv_msg_size: 104857600,
        grpc_server_max_send_msg_size: 104857600
      },
      
      common: {
        instance_addr: '127.0.0.1',
        path_prefix: '/tmp/loki',
        storage: {
          filesystem: {
            chunks_directory: '/tmp/loki/chunks',
            rules_directory: '/tmp/loki/rules'
          }
        },
        // New in Loki 3.0
        replication_factor: options.environment === 'production' ? 3 : 1,
        ring: {
          kvstore: {
            store: 'inmemory'
          }
        }
      },
      
      query_range: {
        results_cache: {
          cache: {
            embedded_cache: {
              enabled: true,
              max_size_mb: 100
            }
          }
        }
      },
      
      schema_config: {
        configs: [
          {
            from: '2020-10-24',
            store: 'boltdb-shipper',
            object_store: 'filesystem',
            schema: 'v11',
            index: {
              prefix: 'index_',
              period: '24h'
            }
          }
        ]
      },
      
      limits_config: {
        retention_period: options.retention.loki,
        ingestion_rate_mb: 16,
        ingestion_burst_size_mb: 32,
        per_stream_rate_limit: '5MB',
        per_stream_rate_limit_burst: '20MB',
        // GDPR compliance
        ...(options.compliance.gdprCompliant && {
          max_global_streams_per_user: 10000,
          max_query_length: '721h', // 30 days
          max_query_parallelism: 32
        })
      },
      
      // New Loki 3.0 features
      pattern_ingester: {
        enabled: true
      },
      
      bloom_compactor: {
        enabled: true
      },
      
      // Norwegian compliance features
      ...(options.compliance.norwegianCompliant && {
        analytics: {
          reporting_enabled: false
        },
        usage_stats: {
          enabled: false
        }
      })
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/loki/loki.yaml.hbs',
      'monitoring/loki/loki.yaml',
      { config: lokiConfig }
    );
  }

  private async generateTempoConfig(options: MonitoringGeneratorOptions): Promise<void> {
    // Tempo configuration with TraceQL support
    const tempoConfig = {
      server: {
        http_listen_port: 3200,
        grpc_listen_port: 9095
      },
      
      distributor: {
        receivers: {
          otlp: {
            protocols: {
              grpc: {
                endpoint: '0.0.0.0:4317'
              },
              http: {
                endpoint: '0.0.0.0:4318'
              }
            }
          },
          jaeger: {
            protocols: {
              grpc: {
                endpoint: '0.0.0.0:14250'
              },
              thrift_http: {
                endpoint: '0.0.0.0:14268'
              }
            }
          }
        }
      },
      
      ingester: {
        max_block_duration: '5m',
        max_block_bytes: 1000000,
        complete_block_timeout: '10m'
      },
      
      compactor: {
        compaction: {
          compaction_window: '1h',
          max_compaction_objects: 1000000,
          block_retention: options.retention.tempo,
          compacted_block_retention: '10m'
        }
      },
      
      storage: {
        trace: {
          backend: 'local',
          local: {
            path: '/tmp/tempo/blocks'
          },
          wal: {
            path: '/tmp/tempo/wal'
          }
        }
      },
      
      querier: {
        frontend_worker: {
          frontend_address: 'tempo-query-frontend:9095'
        }
      },
      
      query_frontend: {
        search: {
          duration_slo: '5s',
          throughput_bytes_slo: 1073741824
        },
        trace_by_id: {
          duration_slo: '5s'
        }
      },
      
      // New TraceQL features
      search: {
        enabled: true
      },
      
      metrics_generator: {
        registry: {
          external_labels: {
            source: 'tempo',
            cluster: options.projectName,
            environment: options.environment
          }
        },
        storage: {
          path: '/tmp/tempo/generator/wal',
          remote_write: options.enablePrometheus ? [
            {
              url: 'http://prometheus:9090/api/v1/write',
              send_exemplars: true
            }
          ] : []
        },
        traces_storage: {
          path: '/tmp/tempo/generator/traces'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/tempo/tempo.yaml.hbs',
      'monitoring/tempo/tempo.yaml',
      { config: tempoConfig }
    );
  }

  private async generateAlertManagerConfig(options: MonitoringGeneratorOptions): Promise<void> {
    const alertManagerConfig = {
      global: {
        smtp_smarthost: 'localhost:587',
        smtp_from: `alerts@${options.projectName}.no`
      },
      
      route: {
        group_by: ['alertname'],
        group_wait: '10s',
        group_interval: '10s',
        repeat_interval: '1h',
        receiver: 'web.hook'
      },
      
      receivers: options.notifications.map(channel => ({
        name: channel.name,
        ...(channel.type === 'slack' && {
          slack_configs: [
            {
              api_url: channel.settings.webhook_url,
              channel: channel.settings.channel,
              title: 'Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}',
              text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}',
              send_resolved: channel.sendResolved ?? true
            }
          ]
        }),
        ...(channel.type === 'email' && {
          email_configs: [
            {
              to: channel.settings.to,
              subject: 'Alert: {{ .GroupLabels.alertname }}',
              body: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
            }
          ]
        }),
        ...(channel.type === 'webhook' && {
          webhook_configs: [
            {
              url: channel.settings.url,
              send_resolved: channel.sendResolved ?? true
            }
          ]
        })
      })),
      
      // Norwegian compliance
      ...(options.compliance.norwegianCompliant && {
        inhibit_rules: [
          {
            source_match: { severity: 'critical' },
            target_match: { severity: 'warning' },
            equal: ['alertname', 'dev', 'instance']
          }
        ]
      })
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/alertmanager/alertmanager.yml.hbs',
      'monitoring/alertmanager/alertmanager.yml',
      alertManagerConfig
    );
  }

  private async generateDashboards(options: MonitoringGeneratorOptions): Promise<void> {
    // Generate default dashboards
    const defaultDashboards = [
      {
        name: 'kubernetes-overview',
        title: 'Kubernetes Cluster Overview',
        description: 'Overview of Kubernetes cluster metrics',
        tags: ['kubernetes', 'cluster'],
        panels: [
          {
            id: 1,
            title: 'Cluster CPU Usage',
            type: 'stat',
            targets: [
              {
                expr: '(1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100',
                legendFormat: 'CPU Usage %',
                refId: 'A'
              }
            ],
            gridPos: { x: 0, y: 0, w: 6, h: 4 }
          },
          {
            id: 2,
            title: 'Cluster Memory Usage',
            type: 'stat',
            targets: [
              {
                expr: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
                legendFormat: 'Memory Usage %',
                refId: 'A'
              }
            ],
            gridPos: { x: 6, y: 0, w: 6, h: 4 }
          },
          {
            id: 3,
            title: 'Pod Count',
            type: 'stat',
            targets: [
              {
                expr: 'sum(kube_pod_info)',
                legendFormat: 'Total Pods',
                refId: 'A'
              }
            ],
            gridPos: { x: 12, y: 0, w: 6, h: 4 }
          }
        ],
        variables: [],
        refresh: '30s',
        timeRange: { from: 'now-1h', to: 'now' }
      }
    ];

    // Add custom dashboards
    const allDashboards = [...defaultDashboards, ...options.dashboards];

    for (const dashboard of allDashboards) {
      await this.templateManager.renderTemplate(
        'devops/monitoring/grafana/dashboard.json.hbs',
        `monitoring/grafana/dashboards/${dashboard.name}.json`,
        dashboard
      );
    }
  }

  private async generateAlertRules(options: MonitoringGeneratorOptions): Promise<void> {
    const defaultAlerts = [
      {
        name: 'HighCPUUsage',
        expr: '(1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100 > 90',
        for: '5m',
        labels: { severity: 'warning' },
        annotations: {
          summary: 'High CPU usage detected',
          description: 'CPU usage is above 90% for more than 5 minutes'
        },
        severity: 'warning' as const
      },
      {
        name: 'HighMemoryUsage',
        expr: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90',
        for: '5m',
        labels: { severity: 'warning' },
        annotations: {
          summary: 'High memory usage detected',
          description: 'Memory usage is above 90% for more than 5 minutes'
        },
        severity: 'warning' as const
      },
      {
        name: 'PodCrashLooping',
        expr: 'rate(kube_pod_container_status_restarts_total[5m]) * 60 * 5 > 0',
        for: '0m',
        labels: { severity: 'critical' },
        annotations: {
          summary: 'Pod is crash looping',
          description: 'Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping'
        },
        severity: 'critical' as const
      }
    ];

    const allAlerts = [...defaultAlerts, ...options.alerts];
    
    const alertRules = {
      groups: [
        {
          name: `${options.projectName}.rules`,
          rules: allAlerts.map(alert => ({
            alert: alert.name,
            expr: alert.expr,
            for: alert.for,
            labels: {
              severity: alert.severity,
              ...alert.labels
            },
            annotations: alert.annotations
          }))
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/rules/alerts.yml.hbs',
      'monitoring/rules/alerts.yml',
      alertRules
    );
  }

  private async generateMonitoringResources(options: MonitoringGeneratorOptions): Promise<void> {
    // Generate ServiceMonitors for applications
    for (const app of options.applications) {
      const serviceMonitor = {
        apiVersion: 'monitoring.coreos.com/v1',
        kind: 'ServiceMonitor',
        metadata: {
          name: `${app.name}-metrics`,
          namespace: app.namespace,
          labels: {
            app: app.name,
            monitoring: 'enabled'
          }
        },
        spec: {
          selector: {
            matchLabels: app.labels
          },
          endpoints: [
            {
              port: 'metrics',
              path: app.path,
              interval: app.scrapeInterval,
              scrapeTimeout: app.scrapeTimeout,
              honorTimestamps: app.honorTimestamps,
              honorLabels: app.honorLabels,
              metricRelabelings: app.metricRelabelings
            }
          ]
        }
      };

      await this.templateManager.renderTemplate(
        'devops/monitoring/servicemonitor.yaml.hbs',
        `monitoring/servicemonitors/${app.name}-servicemonitor.yaml`,
        serviceMonitor
      );
    }
  }

  private async generateExporters(options: MonitoringGeneratorOptions): Promise<void> {
    // Generate Node Exporter if enabled
    if (options.enableNodeExporter) {
      const nodeExporter = {
        apiVersion: 'apps/v1',
        kind: 'DaemonSet',
        metadata: {
          name: 'node-exporter',
          namespace: options.namespace,
          labels: {
            app: 'node-exporter'
          }
        },
        spec: {
          selector: {
            matchLabels: {
              app: 'node-exporter'
            }
          },
          template: {
            metadata: {
              labels: {
                app: 'node-exporter'
              }
            },
            spec: {
              hostPID: true,
              hostIPC: true,
              hostNetwork: true,
              containers: [
                {
                  name: 'node-exporter',
                  image: 'prom/node-exporter:v1.7.0',
                  args: [
                    '--path.procfs=/host/proc',
                    '--path.sysfs=/host/sys',
                    '--path.rootfs=/host/root',
                    '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
                  ],
                  ports: [
                    {
                      containerPort: 9100,
                      name: 'metrics'
                    }
                  ],
                  resources: {
                    requests: {
                      cpu: '100m',
                      memory: '128Mi'
                    },
                    limits: {
                      cpu: '200m',
                      memory: '256Mi'
                    }
                  },
                  volumeMounts: [
                    {
                      name: 'proc',
                      mountPath: '/host/proc',
                      readOnly: true
                    },
                    {
                      name: 'sys',
                      mountPath: '/host/sys',
                      readOnly: true
                    },
                    {
                      name: 'root',
                      mountPath: '/host/root',
                      readOnly: true
                    }
                  ]
                }
              ],
              volumes: [
                {
                  name: 'proc',
                  hostPath: { path: '/proc' }
                },
                {
                  name: 'sys',
                  hostPath: { path: '/sys' }
                },
                {
                  name: 'root',
                  hostPath: { path: '/' }
                }
              ]
            }
          }
        }
      };

      await this.templateManager.renderTemplate(
        'devops/monitoring/exporters/node-exporter.yaml.hbs',
        'monitoring/exporters/node-exporter.yaml',
        nodeExporter
      );
    }
  }

  private async generateNetworkPolicies(options: MonitoringGeneratorOptions): Promise<void> {
    const networkPolicy = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: 'monitoring-network-policy',
        namespace: options.namespace
      },
      spec: {
        podSelector: {
          matchLabels: {
            monitoring: 'enabled'
          }
        },
        policyTypes: ['Ingress', 'Egress'],
        ingress: [
          {
            from: [
              {
                namespaceSelector: {
                  matchLabels: {
                    name: options.namespace
                  }
                }
              }
            ],
            ports: [
              { protocol: 'TCP', port: 9090 }, // Prometheus
              { protocol: 'TCP', port: 3000 }, // Grafana
              { protocol: 'TCP', port: 3100 }, // Loki
              { protocol: 'TCP', port: 3200 }, // Tempo
              { protocol: 'TCP', port: 9093 }  // AlertManager
            ]
          }
        ],
        egress: [
          {
            to: [],
            ports: [
              { protocol: 'TCP', port: 53 },
              { protocol: 'UDP', port: 53 }
            ]
          }
        ]
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/network-policy.yaml.hbs',
      'monitoring/network-policy.yaml',
      networkPolicy
    );
  }

  private async generateRBAC(options: MonitoringGeneratorOptions): Promise<void> {
    const rbacResources = {
      serviceAccount: {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: {
          name: 'monitoring-sa',
          namespace: options.namespace
        }
      },
      clusterRole: {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'ClusterRole',
        metadata: {
          name: 'monitoring-reader'
        },
        rules: [
          {
            apiGroups: [''],
            resources: ['nodes', 'nodes/metrics', 'services', 'endpoints', 'pods'],
            verbs: ['get', 'list', 'watch']
          },
          {
            apiGroups: ['extensions'],
            resources: ['ingresses'],
            verbs: ['get', 'list', 'watch']
          },
          {
            apiGroups: ['networking.k8s.io'],
            resources: ['ingresses'],
            verbs: ['get', 'list', 'watch']
          }
        ]
      },
      clusterRoleBinding: {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'ClusterRoleBinding',
        metadata: {
          name: 'monitoring-reader'
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'monitoring-reader'
        },
        subjects: [
          {
            kind: 'ServiceAccount',
            name: 'monitoring-sa',
            namespace: options.namespace
          }
        ]
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/rbac.yaml.hbs',
      'monitoring/rbac.yaml',
      rbacResources
    );
  }

  private async generateIngress(options: MonitoringGeneratorOptions): Promise<void> {
    if (!options.ingress.enabled) return;

    const ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'monitoring-ingress',
        namespace: options.namespace,
        annotations: {
          'nginx.ingress.kubernetes.io/auth-type': 'basic',
          'nginx.ingress.kubernetes.io/auth-secret': 'monitoring-auth',
          'nginx.ingress.kubernetes.io/auth-realm': 'Authentication Required',
          'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
          ...options.ingress.annotations
        }
      },
      spec: {
        ingressClassName: options.ingress.className,
        tls: options.ingress.tls,
        rules: options.ingress.hosts.map(host => ({
          host: host.host,
          http: {
            paths: host.paths.map(path => ({
              path: path.path,
              pathType: path.pathType,
              backend: {
                service: {
                  name: path.service,
                  port: {
                    number: path.port
                  }
                }
              }
            }))
          }
        }))
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/ingress.yaml.hbs',
      'monitoring/ingress.yaml',
      ingress
    );
  }

  private async generateHelmChart(options: MonitoringGeneratorOptions): Promise<void> {
    const helmChart = {
      apiVersion: 'v2',
      name: `${options.projectName}-monitoring`,
      description: 'Comprehensive monitoring stack with Prometheus 3.0, Grafana LGTM, and OpenTelemetry',
      type: 'application',
      version: '1.0.0',
      appVersion: '1.0.0',
      keywords: ['monitoring', 'prometheus', 'grafana', 'loki', 'tempo', 'opentelemetry'],
      home: `https://${options.projectName}.no`,
      sources: [`https://github.com/${options.projectName}/monitoring`],
      maintainers: [
        {
          name: 'DevOps Team',
          email: `devops@${options.projectName}.no`
        }
      ],
      dependencies: [
        {
          name: 'prometheus',
          version: '25.8.0',
          repository: 'https://prometheus-community.github.io/helm-charts',
          condition: 'prometheus.enabled'
        },
        {
          name: 'grafana',
          version: '7.0.19',
          repository: 'https://grafana.github.io/helm-charts',
          condition: 'grafana.enabled'
        },
        {
          name: 'loki',
          version: '5.36.2',
          repository: 'https://grafana.github.io/helm-charts',
          condition: 'loki.enabled'
        },
        {
          name: 'tempo',
          version: '1.7.1',
          repository: 'https://grafana.github.io/helm-charts',
          condition: 'tempo.enabled'
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/charts/Chart.yaml.hbs',
      'monitoring/charts/Chart.yaml',
      helmChart
    );
  }

  private async generateKustomization(options: MonitoringGeneratorOptions): Promise<void> {
    const kustomization = {
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization',
      
      namespace: options.namespace,
      
      resources: [
        'prometheus/deployment.yaml',
        'grafana/deployment.yaml',
        'loki/deployment.yaml',
        'tempo/deployment.yaml',
        'opentelemetry/deployment.yaml',
        'exporters/node-exporter.yaml',
        'rbac.yaml',
        'network-policy.yaml',
        'ingress.yaml'
      ],
      
      configMapGenerator: [
        {
          name: 'prometheus-config',
          files: ['prometheus/prometheus.yml']
        },
        {
          name: 'grafana-datasources',
          files: ['grafana/datasources/datasources.yaml']
        },
        {
          name: 'otel-collector-config',
          files: ['opentelemetry/otel-collector.yaml']
        }
      ],
      
      secretGenerator: [
        {
          name: 'grafana-admin',
          literals: [
            `admin-user=${options.authentication.grafana.adminUser}`,
            `admin-password=${options.authentication.grafana.adminPassword || 'admin'}`
          ]
        }
      ],
      
      images: [
        {
          name: 'prom/prometheus',
          newTag: 'v3.0.0'
        },
        {
          name: 'grafana/grafana',
          newTag: '10.2.0'
        },
        {
          name: 'grafana/loki',
          newTag: '3.0.0'
        },
        {
          name: 'grafana/tempo',
          newTag: '2.3.0'
        }
      ],
      
      commonLabels: {
        app: 'monitoring',
        version: '1.0.0',
        environment: options.environment
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/kustomize/kustomization.yaml.hbs',
      'monitoring/kustomize/kustomization.yaml',
      kustomization
    );
  }

  private async generateDockerCompose(options: MonitoringGeneratorOptions): Promise<void> {
    const dockerCompose = {
      version: '3.8',
      
      services: {
        ...(options.enablePrometheus && {
          prometheus: {
            image: 'prom/prometheus:v3.0.0',
            container_name: 'prometheus',
            ports: ['9090:9090'],
            volumes: [
              './prometheus/prometheus.yml:/etc/prometheus/prometheus.yml',
              'prometheus_data:/prometheus'
            ],
            command: [
              '--config.file=/etc/prometheus/prometheus.yml',
              '--storage.tsdb.path=/prometheus',
              '--web.console.libraries=/etc/prometheus/console_libraries',
              '--web.console.templates=/etc/prometheus/consoles',
              '--storage.tsdb.retention.time=' + options.retention.prometheus,
              '--web.enable-lifecycle',
              '--web.enable-remote-write-receiver',
              '--enable-feature=otlp-write-receiver',
              '--enable-feature=native-histograms'
            ],
            networks: ['monitoring']
          }
        }),
        
        ...(options.enableGrafana && {
          grafana: {
            image: 'grafana/grafana:10.2.0',
            container_name: 'grafana',
            ports: ['3000:3000'],
            environment: {
              GF_SECURITY_ADMIN_USER: options.authentication.grafana.adminUser,
              GF_SECURITY_ADMIN_PASSWORD: options.authentication.grafana.adminPassword || 'admin'
            },
            volumes: [
              'grafana_data:/var/lib/grafana',
              './grafana/datasources:/etc/grafana/provisioning/datasources',
              './grafana/dashboards:/etc/grafana/provisioning/dashboards'
            ],
            networks: ['monitoring']
          }
        }),
        
        ...(options.enableLoki && {
          loki: {
            image: 'grafana/loki:3.0.0',
            container_name: 'loki',
            ports: ['3100:3100'],
            volumes: [
              './loki/loki.yaml:/etc/loki/local-config.yaml',
              'loki_data:/tmp/loki'
            ],
            command: ['-config.file=/etc/loki/local-config.yaml'],
            networks: ['monitoring']
          }
        }),
        
        ...(options.enableTempo && {
          tempo: {
            image: 'grafana/tempo:2.3.0',
            container_name: 'tempo',
            ports: ['3200:3200', '4317:4317', '4318:4318'],
            volumes: [
              './tempo/tempo.yaml:/etc/tempo.yaml',
              'tempo_data:/tmp/tempo'
            ],
            command: ['-config.file=/etc/tempo.yaml'],
            networks: ['monitoring']
          }
        }),
        
        ...(options.enableOpenTelemetry && {
          'otel-collector': {
            image: 'otel/opentelemetry-collector-contrib:0.89.0',
            container_name: 'otel-collector',
            ports: ['4317:4317', '4318:4318', '8888:8888'],
            volumes: [
              './opentelemetry/otel-collector.yaml:/etc/otel-collector.yaml'
            ],
            command: ['--config=/etc/otel-collector.yaml'],
            depends_on: options.enablePrometheus ? ['prometheus'] : [],
            networks: ['monitoring']
          }
        })
      },
      
      volumes: {
        prometheus_data: {},
        grafana_data: {},
        loki_data: {},
        tempo_data: {}
      },
      
      networks: {
        monitoring: {
          driver: 'bridge'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/docker/docker-compose.yml.hbs',
      'monitoring/docker/docker-compose.yml',
      dockerCompose
    );
  }

  private async generatePrometheusOperator(options: MonitoringGeneratorOptions): Promise<void> {
    // Generate Prometheus CRD
    const prometheus = {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'Prometheus',
      metadata: {
        name: 'main',
        namespace: options.namespace,
        labels: {
          prometheus: 'main'
        }
      },
      spec: {
        replicas: options.environment === 'production' ? 2 : 1,
        version: 'v3.0.0',
        serviceAccountName: 'prometheus',
        securityContext: options.security.runAsNonRoot ? {
          runAsNonRoot: true,
          runAsUser: 65534,
          fsGroup: 65534
        } : {},
        serviceMonitorSelector: {
          matchLabels: {
            monitoring: 'enabled'
          }
        },
        podMonitorSelector: {
          matchLabels: {
            monitoring: 'enabled'
          }
        },
        ruleSelector: {
          matchLabels: {
            prometheus: 'main'
          }
        },
        retention: options.retention.prometheus,
        retentionSize: options.storage.prometheus,
        storage: {
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: options.storage.prometheus
                }
              }
            }
          }
        },
        resources: options.resources.prometheus,
        // New Prometheus 3.0 features
        additionalScrapeConfigs: {
          name: 'additional-scrape-configs',
          key: 'prometheus-additional.yaml'
        },
        remoteWrite: [
          {
            url: 'http://mimir:8080/api/v1/push',
            headers: {
              'X-Scope-OrgID': options.projectName
            }
          }
        ],
        enableFeatures: [
          'otlp-write-receiver',
          'native-histograms',
          'remote-write-receiver'
        ]
      }
    };

    await this.templateManager.renderTemplate(
      'devops/monitoring/prometheus/prometheus-crd.yaml.hbs',
      'monitoring/prometheus/prometheus-crd.yaml',
      prometheus
    );
  }
}
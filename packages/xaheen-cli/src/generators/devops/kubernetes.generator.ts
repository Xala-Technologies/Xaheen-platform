import { BaseGenerator } from '../base.generator';
import { TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';

export interface KubernetesGeneratorOptions {
  readonly appName: string;
  readonly namespace: string;
  readonly image: string;
  readonly imageTag: string;
  readonly port: number;
  readonly targetPort: number;
  readonly replicas: number;
  readonly environment: 'development' | 'staging' | 'production';
  readonly enableIngress: boolean;
  readonly enableHPA: boolean;
  readonly enableConfigMap: boolean;
  readonly enableSecrets: boolean;
  readonly enableServiceMesh: boolean;
  readonly enablePrometheus: boolean;
  readonly enableLogging: boolean;
  readonly enableNetworkPolicies: boolean;
  readonly enablePodSecurityPolicies: boolean;
  readonly enableHelm: boolean;
  readonly enableIstio: boolean;
  readonly clusterIssuer?: string;
  readonly ingressClassName?: string;
  readonly hostName?: string;
  readonly tlsSecretName?: string;
  readonly resources: {
    readonly requests: {
      readonly cpu: string;
      readonly memory: string;
    };
    readonly limits: {
      readonly cpu: string;
      readonly memory: string;
    };
  };
  readonly hpa: {
    readonly minReplicas: number;
    readonly maxReplicas: number;
    readonly targetCPUUtilization: number;
    readonly targetMemoryUtilization: number;
  };
  readonly probes: {
    readonly liveness: {
      readonly path: string;
      readonly initialDelaySeconds: number;
      readonly periodSeconds: number;
    };
    readonly readiness: {
      readonly path: string;
      readonly initialDelaySeconds: number;
      readonly periodSeconds: number;
    };
  };
  readonly storage?: {
    readonly enabled: boolean;
    readonly size: string;
    readonly storageClass: string;
    readonly accessMode: 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany';
  };
  readonly configMapData?: Record<string, string>;
  readonly secrets?: Record<string, string>;
  readonly annotations?: Record<string, string>;
  readonly labels?: Record<string, string>;
}

export interface KubernetesManifests {
  readonly deployment: any;
  readonly service: any;
  readonly ingress?: any;
  readonly hpa?: any;
  readonly configMap?: any;
  readonly secrets?: any;
  readonly networkPolicy?: any;
  readonly podSecurityPolicy?: any;
  readonly serviceAccount?: any;
  readonly rbac?: any;
}

export class KubernetesGenerator extends BaseGenerator<KubernetesGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: KubernetesGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const manifests = await this.generateManifests(options);
      const projectContext = await this.analyzer.analyze(process.cwd());
      
      // Generate namespace
      await this.generateNamespace(options);
      
      // Generate deployment
      await this.generateDeployment(options, manifests, projectContext);
      
      // Generate service
      await this.generateService(options, manifests);
      
      // Generate ingress if enabled
      if (options.enableIngress) {
        await this.generateIngress(options, manifests);
      }
      
      // Generate HPA if enabled
      if (options.enableHPA) {
        await this.generateHPA(options, manifests);
      }
      
      // Generate ConfigMap if enabled
      if (options.enableConfigMap) {
        await this.generateConfigMap(options, manifests);
      }
      
      // Generate Secrets if enabled
      if (options.enableSecrets) {
        await this.generateSecrets(options, manifests);
      }
      
      // Generate network policies if enabled
      if (options.enableNetworkPolicies) {
        await this.generateNetworkPolicy(options);
      }
      
      // Generate pod security policies if enabled
      if (options.enablePodSecurityPolicies) {
        await this.generatePodSecurityPolicy(options);
      }
      
      // Generate service mesh configuration if enabled
      if (options.enableServiceMesh || options.enableIstio) {
        await this.generateServiceMesh(options);
      }
      
      // Generate monitoring configuration if enabled
      if (options.enablePrometheus) {
        await this.generateMonitoring(options);
      }
      
      // Generate logging configuration if enabled
      if (options.enableLogging) {
        await this.generateLogging(options);
      }
      
      // Generate Helm charts if enabled
      if (options.enableHelm) {
        await this.generateHelmChart(options, manifests);
      }
      
      // Generate Kustomization files
      await this.generateKustomization(options);
      
      // Generate deployment scripts
      await this.generateDeploymentScripts(options);
      
      this.logger.success('Kubernetes configuration generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate Kubernetes configuration', error);
      throw error;
    }
  }

  private async validateOptions(options: KubernetesGeneratorOptions): Promise<void> {
    if (!options.appName) {
      throw new Error('App name is required');
    }
    
    if (!options.namespace) {
      throw new Error('Namespace is required');
    }
    
    if (!options.image) {
      throw new Error('Container image is required');
    }
    
    if (!options.port || options.port < 1 || options.port > 65535) {
      throw new Error('Valid port number is required');
    }
    
    if (options.replicas < 1) {
      throw new Error('Replicas must be at least 1');
    }
  }

  private async generateManifests(options: KubernetesGeneratorOptions): Promise<KubernetesManifests> {
    const commonLabels = {
      app: options.appName,
      version: options.imageTag,
      environment: options.environment,
      ...options.labels
    };

    const commonAnnotations = {
      'deployment.kubernetes.io/revision': '1',
      'kubectl.kubernetes.io/last-applied-configuration': '',
      ...options.annotations
    };

    return {
      deployment: this.createDeploymentManifest(options, commonLabels, commonAnnotations),
      service: this.createServiceManifest(options, commonLabels),
      ingress: options.enableIngress ? this.createIngressManifest(options, commonLabels) : undefined,
      hpa: options.enableHPA ? this.createHPAManifest(options, commonLabels) : undefined,
      configMap: options.enableConfigMap ? this.createConfigMapManifest(options, commonLabels) : undefined,
      secrets: options.enableSecrets ? this.createSecretsManifest(options, commonLabels) : undefined,
      networkPolicy: options.enableNetworkPolicies ? this.createNetworkPolicyManifest(options, commonLabels) : undefined,
      podSecurityPolicy: options.enablePodSecurityPolicies ? this.createPodSecurityPolicyManifest(options) : undefined,
      serviceAccount: this.createServiceAccountManifest(options, commonLabels),
      rbac: this.createRBACManifest(options, commonLabels)
    };
  }

  private createDeploymentManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>,
    annotations: Record<string, string>
  ): any {
    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels,
        annotations
      },
      spec: {
        replicas: options.replicas,
        selector: {
          matchLabels: {
            app: options.appName
          }
        },
        template: {
          metadata: {
            labels,
            annotations: {
              ...annotations,
              'prometheus.io/scrape': options.enablePrometheus ? 'true' : 'false',
              'prometheus.io/port': options.port.toString(),
              'prometheus.io/path': '/metrics'
            }
          },
          spec: {
            serviceAccountName: options.appName,
            securityContext: {
              runAsNonRoot: true,
              runAsUser: 1000,
              fsGroup: 2000
            },
            containers: [
              {
                name: options.appName,
                image: `${options.image}:${options.imageTag}`,
                imagePullPolicy: 'Always',
                ports: [
                  {
                    name: 'http',
                    containerPort: options.targetPort,
                    protocol: 'TCP'
                  }
                ],
                env: this.getEnvironmentVariables(options),
                resources: options.resources,
                livenessProbe: {
                  httpGet: {
                    path: options.probes.liveness.path,
                    port: 'http'
                  },
                  initialDelaySeconds: options.probes.liveness.initialDelaySeconds,
                  periodSeconds: options.probes.liveness.periodSeconds
                },
                readinessProbe: {
                  httpGet: {
                    path: options.probes.readiness.path,
                    port: 'http'
                  },
                  initialDelaySeconds: options.probes.readiness.initialDelaySeconds,
                  periodSeconds: options.probes.readiness.periodSeconds
                },
                volumeMounts: this.getVolumeMounts(options),
                securityContext: {
                  allowPrivilegeEscalation: false,
                  readOnlyRootFilesystem: true,
                  capabilities: {
                    drop: ['ALL']
                  }
                }
              }
            ],
            volumes: this.getVolumes(options)
          }
        }
      }
    };
  }

  private createServiceManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels,
        annotations: options.enablePrometheus ? {
          'prometheus.io/scrape': 'true',
          'prometheus.io/port': options.port.toString(),
          'prometheus.io/path': '/metrics'
        } : {}
      },
      spec: {
        type: 'ClusterIP',
        ports: [
          {
            port: options.port,
            targetPort: 'http',
            protocol: 'TCP',
            name: 'http'
          }
        ],
        selector: {
          app: options.appName
        }
      }
    };
  }

  private createIngressManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels,
        annotations: {
          'kubernetes.io/ingress.class': options.ingressClassName || 'nginx',
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
          'cert-manager.io/cluster-issuer': options.clusterIssuer || 'letsencrypt-prod',
          ...(options.annotations || {})
        }
      },
      spec: {
        tls: options.tlsSecretName ? [
          {
            hosts: [options.hostName],
            secretName: options.tlsSecretName
          }
        ] : [],
        rules: [
          {
            host: options.hostName,
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: options.appName,
                      port: {
                        number: options.port
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    };
  }

  private createHPAManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: options.appName
        },
        minReplicas: options.hpa.minReplicas,
        maxReplicas: options.hpa.maxReplicas,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: options.hpa.targetCPUUtilization
              }
            }
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: options.hpa.targetMemoryUtilization
              }
            }
          }
        ]
      }
    };
  }

  private createConfigMapManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${options.appName}-config`,
        namespace: options.namespace,
        labels
      },
      data: {
        'app.conf': JSON.stringify({
          port: options.port,
          environment: options.environment,
          ...options.configMapData
        }, null, 2)
      }
    };
  }

  private createSecretsManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: `${options.appName}-secrets`,
        namespace: options.namespace,
        labels
      },
      type: 'Opaque',
      data: Object.entries(options.secrets || {}).reduce((acc, [key, value]) => {
        acc[key] = Buffer.from(value).toString('base64');
        return acc;
      }, {} as Record<string, string>)
    };
  }

  private createNetworkPolicyManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: `${options.appName}-network-policy`,
        namespace: options.namespace,
        labels
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: options.appName
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
              {
                protocol: 'TCP',
                port: options.targetPort
              }
            ]
          }
        ],
        egress: [
          {
            to: [],
            ports: [
              {
                protocol: 'TCP',
                port: 53
              },
              {
                protocol: 'UDP',
                port: 53
              }
            ]
          }
        ]
      }
    };
  }

  private createPodSecurityPolicyManifest(options: KubernetesGeneratorOptions): any {
    return {
      apiVersion: 'policy/v1beta1',
      kind: 'PodSecurityPolicy',
      metadata: {
        name: `${options.appName}-psp`
      },
      spec: {
        privileged: false,
        allowPrivilegeEscalation: false,
        requiredDropCapabilities: ['ALL'],
        volumes: ['configMap', 'emptyDir', 'projected', 'secret', 'downwardAPI', 'persistentVolumeClaim'],
        runAsUser: {
          rule: 'MustRunAsNonRoot'
        },
        seLinux: {
          rule: 'RunAsAny'
        },
        fsGroup: {
          rule: 'RunAsAny'
        }
      }
    };
  }

  private createServiceAccountManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels
      }
    };
  }

  private createRBACManifest(
    options: KubernetesGeneratorOptions,
    labels: Record<string, string>
  ): any {
    return {
      role: {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Role',
        metadata: {
          name: options.appName,
          namespace: options.namespace,
          labels
        },
        rules: [
          {
            apiGroups: [''],
            resources: ['pods', 'services', 'configmaps'],
            verbs: ['get', 'list', 'watch']
          }
        ]
      },
      roleBinding: {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: {
          name: options.appName,
          namespace: options.namespace,
          labels
        },
        subjects: [
          {
            kind: 'ServiceAccount',
            name: options.appName,
            namespace: options.namespace
          }
        ],
        roleRef: {
          kind: 'Role',
          name: options.appName,
          apiGroup: 'rbac.authorization.k8s.io'
        }
      }
    };
  }

  private async generateNamespace(options: KubernetesGeneratorOptions): Promise<void> {
    const namespaceManifest = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: options.namespace,
        labels: {
          name: options.namespace,
          environment: options.environment
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/namespace.yaml.hbs',
      `k8s/${options.namespace}-namespace.yaml`,
      namespaceManifest
    );
  }

  private async generateDeployment(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests,
    projectContext: any
  ): Promise<void> {
    await this.templateManager.renderTemplate(
      'devops/kubernetes/deployment.yaml.hbs',
      `k8s/${options.appName}-deployment.yaml`,
      {
        manifest: manifests.deployment,
        options,
        projectContext
      }
    );
  }

  private async generateService(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    await this.templateManager.renderTemplate(
      'devops/kubernetes/service.yaml.hbs',
      `k8s/${options.appName}-service.yaml`,
      {
        manifest: manifests.service,
        options
      }
    );
  }

  private async generateIngress(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    if (!manifests.ingress) return;

    await this.templateManager.renderTemplate(
      'devops/kubernetes/ingress.yaml.hbs',
      `k8s/${options.appName}-ingress.yaml`,
      {
        manifest: manifests.ingress,
        options
      }
    );
  }

  private async generateHPA(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    if (!manifests.hpa) return;

    await this.templateManager.renderTemplate(
      'devops/kubernetes/hpa.yaml.hbs',
      `k8s/${options.appName}-hpa.yaml`,
      {
        manifest: manifests.hpa,
        options
      }
    );
  }

  private async generateConfigMap(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    if (!manifests.configMap) return;

    await this.templateManager.renderTemplate(
      'devops/kubernetes/configmap.yaml.hbs',
      `k8s/${options.appName}-configmap.yaml`,
      {
        manifest: manifests.configMap,
        options
      }
    );
  }

  private async generateSecrets(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    if (!manifests.secrets) return;

    await this.templateManager.renderTemplate(
      'devops/kubernetes/secrets.yaml.hbs',
      `k8s/${options.appName}-secrets.yaml`,
      {
        manifest: manifests.secrets,
        options
      }
    );
  }

  private async generateNetworkPolicy(options: KubernetesGeneratorOptions): Promise<void> {
    const networkPolicy = this.createNetworkPolicyManifest(options, {});

    await this.templateManager.renderTemplate(
      'devops/kubernetes/network-policy.yaml.hbs',
      `k8s/${options.appName}-network-policy.yaml`,
      {
        manifest: networkPolicy,
        options
      }
    );
  }

  private async generatePodSecurityPolicy(options: KubernetesGeneratorOptions): Promise<void> {
    const psp = this.createPodSecurityPolicyManifest(options);

    await this.templateManager.renderTemplate(
      'devops/kubernetes/pod-security-policy.yaml.hbs',
      `k8s/${options.appName}-psp.yaml`,
      {
        manifest: psp,
        options
      }
    );
  }

  private async generateServiceMesh(options: KubernetesGeneratorOptions): Promise<void> {
    // Generate Istio configuration
    const virtualService = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: options.appName,
        namespace: options.namespace
      },
      spec: {
        hosts: [options.hostName || options.appName],
        http: [
          {
            route: [
              {
                destination: {
                  host: options.appName,
                  port: {
                    number: options.port
                  }
                }
              }
            ]
          }
        ]
      }
    };

    const destinationRule = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'DestinationRule',
      metadata: {
        name: options.appName,
        namespace: options.namespace
      },
      spec: {
        host: options.appName,
        trafficPolicy: {
          tls: {
            mode: 'ISTIO_MUTUAL'
          }
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/istio/virtual-service.yaml.hbs',
      `k8s/istio/${options.appName}-virtual-service.yaml`,
      { manifest: virtualService, options }
    );

    await this.templateManager.renderTemplate(
      'devops/kubernetes/istio/destination-rule.yaml.hbs',
      `k8s/istio/${options.appName}-destination-rule.yaml`,
      { manifest: destinationRule, options }
    );
  }

  private async generateMonitoring(options: KubernetesGeneratorOptions): Promise<void> {
    const serviceMonitor = {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'ServiceMonitor',
      metadata: {
        name: options.appName,
        namespace: options.namespace,
        labels: {
          app: options.appName
        }
      },
      spec: {
        selector: {
          matchLabels: {
            app: options.appName
          }
        },
        endpoints: [
          {
            port: 'http',
            path: '/metrics',
            interval: '30s'
          }
        ]
      }
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/monitoring/service-monitor.yaml.hbs',
      `k8s/monitoring/${options.appName}-service-monitor.yaml`,
      { manifest: serviceMonitor, options }
    );
  }

  private async generateLogging(options: KubernetesGeneratorOptions): Promise<void> {
    const fluentdConfig = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${options.appName}-fluentd-config`,
        namespace: options.namespace
      },
      data: {
        'fluent.conf': `
<source>
  @type tail
  path /var/log/containers/*${options.appName}*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.*
  read_from_head true
  <parse>
    @type kubernetes
  </parse>
</source>

<match kubernetes.**>
  @type elasticsearch
  host elasticsearch.logging.svc.cluster.local
  port 9200
  index_name ${options.appName}
</match>
        `
      }
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/logging/fluentd-config.yaml.hbs',
      `k8s/logging/${options.appName}-fluentd-config.yaml`,
      { manifest: fluentdConfig, options }
    );
  }

  private async generateHelmChart(
    options: KubernetesGeneratorOptions,
    manifests: KubernetesManifests
  ): Promise<void> {
    // Generate Chart.yaml
    const chartYaml = {
      apiVersion: 'v2',
      name: options.appName,
      description: `Helm chart for ${options.appName}`,
      type: 'application',
      version: '0.1.0',
      appVersion: options.imageTag
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/helm/Chart.yaml.hbs',
      `helm/${options.appName}/Chart.yaml`,
      chartYaml
    );

    // Generate values.yaml
    const valuesYaml = {
      replicaCount: options.replicas,
      image: {
        repository: options.image.split(':')[0],
        tag: options.imageTag,
        pullPolicy: 'Always'
      },
      service: {
        type: 'ClusterIP',
        port: options.port
      },
      ingress: {
        enabled: options.enableIngress,
        className: options.ingressClassName || 'nginx',
        annotations: options.annotations || {},
        hosts: options.hostName ? [{ host: options.hostName, paths: [{ path: '/', pathType: 'Prefix' }] }] : [],
        tls: options.tlsSecretName ? [{ secretName: options.tlsSecretName, hosts: [options.hostName] }] : []
      },
      resources: options.resources,
      autoscaling: {
        enabled: options.enableHPA,
        minReplicas: options.hpa.minReplicas,
        maxReplicas: options.hpa.maxReplicas,
        targetCPUUtilizationPercentage: options.hpa.targetCPUUtilization
      }
    };

    await this.templateManager.renderTemplate(
      'devops/kubernetes/helm/values.yaml.hbs',
      `helm/${options.appName}/values.yaml`,
      valuesYaml
    );

    // Generate templates
    const templateData = { manifests, options };
    
    await this.templateManager.renderTemplate(
      'devops/kubernetes/helm/templates/deployment.yaml.hbs',
      `helm/${options.appName}/templates/deployment.yaml`,
      templateData
    );

    await this.templateManager.renderTemplate(
      'devops/kubernetes/helm/templates/service.yaml.hbs',
      `helm/${options.appName}/templates/service.yaml`,
      templateData
    );
  }

  private async generateKustomization(options: KubernetesGeneratorOptions): Promise<void> {
    const kustomization = {
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization',
      resources: [
        `${options.namespace}-namespace.yaml`,
        `${options.appName}-deployment.yaml`,
        `${options.appName}-service.yaml`
      ],
      commonLabels: {
        app: options.appName,
        version: options.imageTag
      },
      images: [
        {
          name: options.image.split(':')[0],
          newTag: options.imageTag
        }
      ]
    };

    if (options.enableIngress) {
      kustomization.resources.push(`${options.appName}-ingress.yaml`);
    }

    if (options.enableHPA) {
      kustomization.resources.push(`${options.appName}-hpa.yaml`);
    }

    if (options.enableConfigMap) {
      kustomization.resources.push(`${options.appName}-configmap.yaml`);
    }

    if (options.enableSecrets) {
      kustomization.resources.push(`${options.appName}-secrets.yaml`);
    }

    await this.templateManager.renderTemplate(
      'devops/kubernetes/kustomization.yaml.hbs',
      'k8s/kustomization.yaml',
      kustomization
    );
  }

  private async generateDeploymentScripts(options: KubernetesGeneratorOptions): Promise<void> {
    const deployScript = `#!/bin/bash
set -e

echo "Deploying ${options.appName} to Kubernetes cluster..."

# Apply namespace first
kubectl apply -f k8s/${options.namespace}-namespace.yaml

# Apply all manifests
kubectl apply -f k8s/

# Wait for deployment to be ready
kubectl rollout status deployment/${options.appName} -n ${options.namespace}

echo "Deployment completed successfully!"
`;

    const undeployScript = `#!/bin/bash
set -e

echo "Removing ${options.appName} from Kubernetes cluster..."

# Delete all resources
kubectl delete -f k8s/ --ignore-not-found=true

echo "Undeployment completed successfully!"
`;

    await this.templateManager.renderTemplate(
      'devops/kubernetes/scripts/deploy.sh.hbs',
      'scripts/k8s-deploy.sh',
      { script: deployScript, executable: true }
    );

    await this.templateManager.renderTemplate(
      'devops/kubernetes/scripts/undeploy.sh.hbs',
      'scripts/k8s-undeploy.sh',
      { script: undeployScript, executable: true }
    );
  }

  private getEnvironmentVariables(options: KubernetesGeneratorOptions): any[] {
    const baseEnv = [
      {
        name: 'NODE_ENV',
        value: options.environment
      },
      {
        name: 'PORT',
        value: options.targetPort.toString()
      }
    ];

    if (options.enableConfigMap) {
      baseEnv.push({
        name: 'CONFIG_PATH',
        valueFrom: {
          configMapKeyRef: {
            name: `${options.appName}-config`,
            key: 'app.conf'
          }
        }
      });
    }

    if (options.enableSecrets) {
      baseEnv.push({
        name: 'DATABASE_URL',
        valueFrom: {
          secretKeyRef: {
            name: `${options.appName}-secrets`,
            key: 'database-url'
          }
        }
      });
    }

    return baseEnv;
  }

  private getVolumeMounts(options: KubernetesGeneratorOptions): any[] {
    const mounts = [
      {
        name: 'tmp',
        mountPath: '/tmp'
      }
    ];

    if (options.storage?.enabled) {
      mounts.push({
        name: 'data',
        mountPath: '/app/data'
      });
    }

    if (options.enableConfigMap) {
      mounts.push({
        name: 'config',
        mountPath: '/app/config'
      });
    }

    return mounts;
  }

  private getVolumes(options: KubernetesGeneratorOptions): any[] {
    const volumes = [
      {
        name: 'tmp',
        emptyDir: {}
      }
    ];

    if (options.storage?.enabled) {
      volumes.push({
        name: 'data',
        persistentVolumeClaim: {
          claimName: `${options.appName}-pvc`
        }
      });
    }

    if (options.enableConfigMap) {
      volumes.push({
        name: 'config',
        configMap: {
          name: `${options.appName}-config`
        }
      });
    }

    return volumes;
  }
}
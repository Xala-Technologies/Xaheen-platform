import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'yaml';

const execAsync = promisify(exec);

// Schema for Kubernetes configuration
const KubernetesConfigSchema = z.object({
  namespace: z.string().default('default'),
  appName: z.string(),
  version: z.string().default('1.0.0'),
  image: z.object({
    repository: z.string(),
    tag: z.string().default('latest'),
    pullPolicy: z.enum(['Always', 'IfNotPresent', 'Never']).default('IfNotPresent'),
    pullSecrets: z.array(z.string()).default([]),
  }),
  deployment: z.object({
    replicaCount: z.number().default(3),
    strategy: z.object({
      type: z.enum(['RollingUpdate', 'Recreate']).default('RollingUpdate'),
      rollingUpdate: z.object({
        maxUnavailable: z.string().default('25%'),
        maxSurge: z.string().default('25%'),
      }).default({}),
    }).default({}),
    resources: z.object({
      requests: z.object({
        cpu: z.string().default('100m'),
        memory: z.string().default('128Mi'),
      }).default({}),
      limits: z.object({
        cpu: z.string().default('500m'),
        memory: z.string().default('512Mi'),
      }).default({}),
    }).default({}),
    nodeSelector: z.record(z.string()).default({}),
    tolerations: z.array(z.any()).default([]),
    affinity: z.any().optional(),
  }).default({}),
  service: z.object({
    type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName']).default('ClusterIP'),
    port: z.number().default(80),
    targetPort: z.number().default(3000),
    nodePort: z.number().optional(),
    annotations: z.record(z.string()).default({}),
  }).default({}),
  ingress: z.object({
    enabled: z.boolean().default(false),
    className: z.string().default('nginx'),
    annotations: z.record(z.string()).default({
      'nginx.ingress.kubernetes.io/rewrite-target': '/',
      'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
      'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
    }),
    hosts: z.array(z.object({
      host: z.string(),
      paths: z.array(z.object({
        path: z.string().default('/'),
        pathType: z.enum(['Exact', 'Prefix', 'ImplementationSpecific']).default('Prefix'),
      })).default([{ path: '/', pathType: 'Prefix' }]),
    })).default([]),
    tls: z.array(z.object({
      secretName: z.string(),
      hosts: z.array(z.string()),
    })).default([]),
  }).default({}),
  configMap: z.object({
    enabled: z.boolean().default(true),
    data: z.record(z.string()).default({}),
  }).default({}),
  secrets: z.object({
    enabled: z.boolean().default(false),
    data: z.record(z.string()).default({}),
  }).default({}),
  persistence: z.object({
    enabled: z.boolean().default(false),
    storageClass: z.string().default('standard'),
    accessMode: z.enum(['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany']).default('ReadWriteOnce'),
    size: z.string().default('10Gi'),
    mountPath: z.string().default('/data'),
  }).default({}),
  autoscaling: z.object({
    enabled: z.boolean().default(false),
    minReplicas: z.number().default(2),
    maxReplicas: z.number().default(10),
    targetCPUUtilizationPercentage: z.number().default(80),
    targetMemoryUtilizationPercentage: z.number().optional(),
  }).default({}),
  podDisruptionBudget: z.object({
    enabled: z.boolean().default(true),
    minAvailable: z.string().default('50%'),
    maxUnavailable: z.string().optional(),
  }).default({}),
  networkPolicy: z.object({
    enabled: z.boolean().default(false),
    ingress: z.array(z.any()).default([]),
    egress: z.array(z.any()).default([]),
  }).default({}),
  serviceAccount: z.object({
    create: z.boolean().default(true),
    name: z.string().optional(),
    annotations: z.record(z.string()).default({}),
  }).default({}),
  rbac: z.object({
    create: z.boolean().default(false),
    rules: z.array(z.any()).default([]),
  }).default({}),
  security: z.object({
    runAsNonRoot: z.boolean().default(true),
    runAsUser: z.number().default(1001),
    runAsGroup: z.number().default(1001),
    fsGroup: z.number().default(1001),
    readOnlyRootFilesystem: z.boolean().default(true),
    allowPrivilegeEscalation: z.boolean().default(false),
    dropCapabilities: z.array(z.string()).default(['ALL']),
    addCapabilities: z.array(z.string()).default([]),
  }).default({}),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    serviceMonitor: z.object({
      enabled: z.boolean().default(true),
      interval: z.string().default('30s'),
      path: z.string().default('/metrics'),
      port: z.string().default('http'),
    }).default({}),
    prometheusRule: z.object({
      enabled: z.boolean().default(true),
      rules: z.array(z.any()).default([]),
    }).default({}),
  }).default({}),
  norwegianCompliance: z.object({
    enabled: z.boolean().default(false),
    dataClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
    auditLogging: z.boolean().default(true),
    networkPolicies: z.boolean().default(true),
    podSecurityStandards: z.boolean().default(true),
  }).default({}),
});

export type KubernetesConfig = z.infer<typeof KubernetesConfigSchema>;

export interface DeploymentStatus {
  name: string;
  namespace: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
  conditions: Array<{
    type: string;
    status: string;
    reason?: string;
    message?: string;
  }>;
}

export interface PodStatus {
  name: string;
  ready: string;
  status: string;
  restarts: number;
  age: string;
  node?: string;
}

export class KubernetesService {
  private config: KubernetesConfig;

  constructor(config: Partial<KubernetesConfig> & { appName: string }) {
    this.config = KubernetesConfigSchema.parse(config);
  }

  /**
   * Generate Kubernetes deployment manifest
   */
  generateDeployment(): any {
    const { appName, version, image, deployment, security, norwegianCompliance } = this.config;

    const manifest = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'application',
          'app.kubernetes.io/part-of': appName,
          'app.kubernetes.io/managed-by': 'xaheen-cli',
          ...(norwegianCompliance.enabled && {
            'compliance.norway/enabled': 'true',
            'compliance.norway/classification': norwegianCompliance.dataClassification,
            'compliance.gdpr/enabled': 'true',
          }),
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
          'xaheen.dev/generated-by': 'xaheen-cli',
          'xaheen.dev/version': process.env.npm_package_version || '5.0.0',
          ...(norwegianCompliance.enabled && {
            'compliance.norway/audit-required': 'true',
            'compliance.norway/data-classification': norwegianCompliance.dataClassification,
          }),
        },
      },
      spec: {
        replicas: deployment.replicaCount,
        strategy: deployment.strategy,
        selector: {
          matchLabels: {
            app: appName,
            version: version,
          },
        },
        template: {
          metadata: {
            labels: {
              app: appName,
              version: version,
              'app.kubernetes.io/name': appName,
              'app.kubernetes.io/version': version,
              ...(norwegianCompliance.enabled && {
                'compliance.norway/classification': norwegianCompliance.dataClassification,
              }),
            },
            annotations: {
              'prometheus.io/scrape': 'true',
              'prometheus.io/port': '3000',
              'prometheus.io/path': '/metrics',
              ...(norwegianCompliance.enabled && {
                'compliance.norway/audit-log': 'true',
              }),
            },
          },
          spec: {
            serviceAccountName: this.config.serviceAccount.name || appName,
            securityContext: {
              runAsNonRoot: security.runAsNonRoot,
              runAsUser: security.runAsUser,
              runAsGroup: security.runAsGroup,
              fsGroup: security.fsGroup,
              ...(norwegianCompliance.enabled && {
                seccompProfile: {
                  type: 'RuntimeDefault',
                },
              }),
            },
            containers: [{
              name: appName,
              image: `${image.repository}:${image.tag}`,
              imagePullPolicy: image.pullPolicy,
              ports: [{
                name: 'http',
                containerPort: this.config.service.targetPort,
                protocol: 'TCP',
              }],
              env: [
                {
                  name: 'NODE_ENV',
                  value: 'production',
                },
                {
                  name: 'PORT',
                  value: this.config.service.targetPort.toString(),
                },
                {
                  name: 'POD_NAME',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.name',
                    },
                  },
                },
                {
                  name: 'POD_NAMESPACE',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.namespace',
                    },
                  },
                },
                {
                  name: 'POD_IP',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'status.podIP',
                    },
                  },
                },
              ],
              resources: deployment.resources,
              securityContext: {
                runAsNonRoot: security.runAsNonRoot,
                runAsUser: security.runAsUser,
                runAsGroup: security.runAsGroup,
                readOnlyRootFilesystem: security.readOnlyRootFilesystem,
                allowPrivilegeEscalation: security.allowPrivilegeEscalation,
                capabilities: {
                  drop: security.dropCapabilities,
                  ...(security.addCapabilities.length > 0 && {
                    add: security.addCapabilities,
                  }),
                },
              },
              livenessProbe: {
                httpGet: {
                  path: '/health',
                  port: 'http',
                },
                initialDelaySeconds: 30,
                periodSeconds: 10,
                timeoutSeconds: 5,
                failureThreshold: 3,
              },
              readinessProbe: {
                httpGet: {
                  path: '/ready',
                  port: 'http',
                },
                initialDelaySeconds: 5,
                periodSeconds: 5,
                timeoutSeconds: 3,
                failureThreshold: 3,
              },
              startupProbe: {
                httpGet: {
                  path: '/health',
                  port: 'http',
                },
                initialDelaySeconds: 10,
                periodSeconds: 10,
                timeoutSeconds: 5,
                failureThreshold: 30,
              },
              volumeMounts: [
                {
                  name: 'tmp',
                  mountPath: '/tmp',
                },
                {
                  name: 'var-cache',
                  mountPath: '/var/cache',
                },
                ...(this.config.configMap.enabled ? [{
                  name: 'config',
                  mountPath: '/app/config',
                  readOnly: true,
                }] : []),
                ...(this.config.secrets.enabled ? [{
                  name: 'secrets',
                  mountPath: '/app/secrets',
                  readOnly: true,
                }] : []),
                ...(this.config.persistence.enabled ? [{
                  name: 'data',
                  mountPath: this.config.persistence.mountPath,
                }] : []),
              ],
            }],
            volumes: [
              {
                name: 'tmp',
                emptyDir: {},
              },
              {
                name: 'var-cache',
                emptyDir: {},
              },
              ...(this.config.configMap.enabled ? [{
                name: 'config',
                configMap: {
                  name: appName,
                },
              }] : []),
              ...(this.config.secrets.enabled ? [{
                name: 'secrets',
                secret: {
                  secretName: appName,
                },
              }] : []),
              ...(this.config.persistence.enabled ? [{
                name: 'data',
                persistentVolumeClaim: {
                  claimName: `${appName}-data`,
                },
              }] : []),
            ],
            nodeSelector: deployment.nodeSelector,
            tolerations: deployment.tolerations,
            ...(deployment.affinity && { affinity: deployment.affinity }),
            ...(image.pullSecrets.length > 0 && {
              imagePullSecrets: image.pullSecrets.map(secret => ({ name: secret })),
            }),
          },
        },
      },
    };

    return manifest;
  }

  /**
   * Generate Kubernetes service manifest
   */
  generateService(): any {
    const { appName, version, service } = this.config;

    return {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'service',
        },
        annotations: {
          ...service.annotations,
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        type: service.type,
        ports: [{
          name: 'http',
          port: service.port,
          targetPort: 'http',
          protocol: 'TCP',
          ...(service.nodePort && service.type === 'NodePort' && {
            nodePort: service.nodePort,
          }),
        }],
        selector: {
          app: appName,
          version: version,
        },
      },
    };
  }

  /**
   * Generate Kubernetes ingress manifest
   */
  generateIngress(): any | null {
    const { appName, version, ingress, service } = this.config;

    if (!ingress.enabled || ingress.hosts.length === 0) {
      return null;
    }

    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'ingress',
        },
        annotations: {
          ...ingress.annotations,
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        ingressClassName: ingress.className,
        rules: ingress.hosts.map(host => ({
          host: host.host,
          http: {
            paths: host.paths.map(path => ({
              path: path.path,
              pathType: path.pathType,
              backend: {
                service: {
                  name: appName,
                  port: {
                    number: service.port,
                  },
                },
              },
            })),
          },
        })),
        ...(ingress.tls.length > 0 && {
          tls: ingress.tls,
        }),
      },
    };
  }

  /**
   * Generate ConfigMap manifest
   */
  generateConfigMap(): any | null {
    const { appName, version, configMap } = this.config;

    if (!configMap.enabled) {
      return null;
    }

    return {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'config',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      data: configMap.data,
    };
  }

  /**
   * Generate Secret manifest
   */
  generateSecret(): any | null {
    const { appName, version, secrets } = this.config;

    if (!secrets.enabled) {
      return null;
    }

    return {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'secret',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      type: 'Opaque',
      data: Object.fromEntries(
        Object.entries(secrets.data).map(([key, value]) => [
          key,
          Buffer.from(value).toString('base64'),
        ])
      ),
    };
  }

  /**
   * Generate HorizontalPodAutoscaler manifest
   */
  generateHPA(): any | null {
    const { appName, version, autoscaling } = this.config;

    if (!autoscaling.enabled) {
      return null;
    }

    const metrics = [
      {
        type: 'Resource',
        resource: {
          name: 'cpu',
          target: {
            type: 'Utilization',
            averageUtilization: autoscaling.targetCPUUtilizationPercentage,
          },
        },
      },
    ];

    if (autoscaling.targetMemoryUtilizationPercentage) {
      metrics.push({
        type: 'Resource',
        resource: {
          name: 'memory',
          target: {
            type: 'Utilization',
            averageUtilization: autoscaling.targetMemoryUtilizationPercentage,
          },
        },
      });
    }

    return {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'autoscaler',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: appName,
        },
        minReplicas: autoscaling.minReplicas,
        maxReplicas: autoscaling.maxReplicas,
        metrics,
      },
    };
  }

  /**
   * Generate PodDisruptionBudget manifest
   */
  generatePDB(): any | null {
    const { appName, version, podDisruptionBudget } = this.config;

    if (!podDisruptionBudget.enabled) {
      return null;
    }

    return {
      apiVersion: 'policy/v1',
      kind: 'PodDisruptionBudget',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'pdb',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: appName,
            version: version,
          },
        },
        ...(podDisruptionBudget.minAvailable && {
          minAvailable: podDisruptionBudget.minAvailable,
        }),
        ...(podDisruptionBudget.maxUnavailable && {
          maxUnavailable: podDisruptionBudget.maxUnavailable,
        }),
      },
    };
  }

  /**
   * Generate ServiceAccount manifest
   */
  generateServiceAccount(): any | null {
    const { appName, version, serviceAccount } = this.config;

    if (!serviceAccount.create) {
      return null;
    }

    return {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: serviceAccount.name || appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'serviceaccount',
        },
        annotations: {
          ...serviceAccount.annotations,
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
    };
  }

  /**
   * Generate NetworkPolicy manifest for Norwegian compliance
   */
  generateNetworkPolicy(): any | null {
    const { appName, version, networkPolicy, norwegianCompliance } = this.config;

    if (!networkPolicy.enabled && !norwegianCompliance.enabled) {
      return null;
    }

    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: appName,
        namespace: this.config.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'networkpolicy',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
          ...(norwegianCompliance.enabled && {
            'compliance.norway/network-isolation': 'true',
          }),
        },
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: appName,
            version: version,
          },
        },
        policyTypes: ['Ingress', 'Egress'],
        ingress: [
          {
            from: [
              {
                namespaceSelector: {
                  matchLabels: {
                    name: this.config.namespace,
                  },
                },
              },
              {
                namespaceSelector: {
                  matchLabels: {
                    'name': 'ingress-nginx',
                  },
                },
              },
            ],
            ports: [
              {
                protocol: 'TCP',
                port: this.config.service.targetPort,
              },
            ],
          },
          ...networkPolicy.ingress,
        ],
        egress: [
          {
            to: [],
            ports: [
              {
                protocol: 'TCP',
                port: 53,
              },
              {
                protocol: 'UDP',
                port: 53,
              },
            ],
          },
          {
            to: [],
            ports: [
              {
                protocol: 'TCP',
                port: 443,
              },
              {
                protocol: 'TCP',
                port: 80,
              },
            ],
          },
          ...networkPolicy.egress,
        ],
      },
    };
  }

  /**
   * Generate all Kubernetes manifests
   */
  generateAllManifests(): { [key: string]: any } {
    const manifests: { [key: string]: any } = {};

    // Core resources
    manifests.deployment = this.generateDeployment();
    manifests.service = this.generateService();

    // Optional resources
    const ingress = this.generateIngress();
    if (ingress) manifests.ingress = ingress;

    const configMap = this.generateConfigMap();
    if (configMap) manifests.configMap = configMap;

    const secret = this.generateSecret();
    if (secret) manifests.secret = secret;

    const hpa = this.generateHPA();
    if (hpa) manifests.hpa = hpa;

    const pdb = this.generatePDB();
    if (pdb) manifests.pdb = pdb;

    const serviceAccount = this.generateServiceAccount();
    if (serviceAccount) manifests.serviceAccount = serviceAccount;

    const networkPolicy = this.generateNetworkPolicy();
    if (networkPolicy) manifests.networkPolicy = networkPolicy;

    return manifests;
  }

  /**
   * Write manifests to files
   */
  async writeManifests(outputDir: string): Promise<void> {
    try {
      await fs.ensureDir(outputDir);

      const manifests = this.generateAllManifests();

      for (const [name, manifest] of Object.entries(manifests)) {
        const filename = `${name}.yaml`;
        const filepath = path.join(outputDir, filename);
        const yamlContent = yaml.stringify(manifest, { indent: 2 });
        
        await fs.writeFile(filepath, yamlContent);
        console.log(`Generated ${filename}`);
      }

      console.log(`All Kubernetes manifests written to ${outputDir}`);
    } catch (error) {
      throw new Error(`Failed to write manifests: ${error}`);
    }
  }

  /**
   * Apply manifests to Kubernetes cluster
   */
  async apply(manifestsDir: string, dryRun: boolean = false): Promise<void> {
    try {
      const command = `kubectl apply -f ${manifestsDir} --namespace=${this.config.namespace}${dryRun ? ' --dry-run=client' : ''}`;
      
      console.log(`Applying manifests: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('Warnings:', stderr);
      }
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to apply manifests: ${error}`);
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(): Promise<DeploymentStatus> {
    try {
      const { stdout } = await execAsync(
        `kubectl get deployment ${this.config.appName} -n ${this.config.namespace} -o json`
      );
      
      const deployment = JSON.parse(stdout);
      
      return {
        name: deployment.metadata.name,
        namespace: deployment.metadata.namespace,
        ready: `${deployment.status.readyReplicas || 0}/${deployment.status.replicas || 0}`,
        upToDate: deployment.status.updatedReplicas || 0,
        available: deployment.status.availableReplicas || 0,
        age: this.calculateAge(deployment.metadata.creationTimestamp),
        conditions: deployment.status.conditions || [],
      };
    } catch (error) {
      throw new Error(`Failed to get deployment status: ${error}`);
    }
  }

  /**
   * Get pod status
   */
  async getPodStatus(): Promise<PodStatus[]> {
    try {
      const { stdout } = await execAsync(
        `kubectl get pods -l app=${this.config.appName} -n ${this.config.namespace} -o json`
      );
      
      const response = JSON.parse(stdout);
      
      return response.items.map((pod: any) => ({
        name: pod.metadata.name,
        ready: `${pod.status.containerStatuses?.filter((c: any) => c.ready).length || 0}/${pod.status.containerStatuses?.length || 0}`,
        status: pod.status.phase,
        restarts: pod.status.containerStatuses?.reduce((acc: number, c: any) => acc + c.restartCount, 0) || 0,
        age: this.calculateAge(pod.metadata.creationTimestamp),
        node: pod.spec.nodeName,
      }));
    } catch (error) {
      throw new Error(`Failed to get pod status: ${error}`);
    }
  }

  /**
   * Scale deployment
   */
  async scale(replicas: number): Promise<void> {
    try {
      const command = `kubectl scale deployment ${this.config.appName} --replicas=${replicas} -n ${this.config.namespace}`;
      
      console.log(`Scaling deployment: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to scale deployment: ${error}`);
    }
  }

  /**
   * Rollback deployment
   */
  async rollback(revision?: number): Promise<void> {
    try {
      const command = `kubectl rollout undo deployment ${this.config.appName} -n ${this.config.namespace}${revision ? ` --to-revision=${revision}` : ''}`;
      
      console.log(`Rolling back deployment: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to rollback deployment: ${error}`);
    }
  }

  // Private helper methods
  private calculateAge(timestamp: string): string {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h${diffMinutes}m`;
    return `${diffMinutes}m`;
  }
}

// Export default configuration
export const defaultKubernetesConfig = KubernetesConfigSchema.parse({
  appName: 'sample-app',
});
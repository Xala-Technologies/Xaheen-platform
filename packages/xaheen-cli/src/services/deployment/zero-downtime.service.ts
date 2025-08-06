import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'yaml';
import { KubernetesService, KubernetesConfig } from "./kubernetes.service";

const execAsync = promisify(exec);

// Schema for zero-downtime deployment configuration
const ZeroDowntimeConfigSchema = z.object({
  strategy: z.enum(['blue-green', 'canary', 'rolling']).default('rolling'),
  blueGreen: z.object({
    enabled: z.boolean().default(false),
    autoPromote: z.boolean().default(false),
    scaleDownDelaySeconds: z.number().default(30),
    prePromotionAnalysis: z.object({
      enabled: z.boolean().default(true),
      templates: z.array(z.object({
        templateName: z.string(),
        args: z.array(z.object({
          name: z.string(),
          value: z.string(),
        })).default([]),
      })).default([]),
    }).default({}),
    postPromotionAnalysis: z.object({
      enabled: z.boolean().default(true),
      templates: z.array(z.object({
        templateName: z.string(),
        args: z.array(z.object({
          name: z.string(),
          value: z.string(),
        })).default([]),
      })).default([]),
    }).default({}),
  }).default({}),
  canary: z.object({
    enabled: z.boolean().default(false),
    steps: z.array(z.object({
      setWeight: z.number().optional(),
      pause: z.object({
        duration: z.string().optional(),
      }).optional(),
      analysis: z.object({
        templates: z.array(z.object({
          templateName: z.string(),
          args: z.array(z.object({
            name: z.string(),
            value: z.string(),
          })).default([]),
        })).default([]),
        args: z.array(z.object({
          name: z.string(),
          value: z.string(),
        })).default([]),
      }).optional(),
    })).default([
      { setWeight: 20 },
      { pause: { duration: '10s' } },
      { setWeight: 40 },
      { pause: { duration: '10s' } },
      { setWeight: 60 },
      { pause: { duration: '10s' } },
      { setWeight: 80 },
      { pause: { duration: '10s' } },
    ]),
    analysis: z.object({
      templates: z.array(z.object({
        templateName: z.string(),
        clusterScope: z.boolean().default(false),
      })).default([]),
      args: z.array(z.object({
        name: z.string(),
        value: z.string(),
      })).default([]),
    }).default({}),
    trafficRouting: z.object({
      nginx: z.object({
        enabled: z.boolean().default(true),
        stableIngress: z.string(),
        annotationPrefix: z.string().default('nginx.ingress.kubernetes.io'),
        additionalIngressAnnotations: z.record(z.string()).default({}),
      }).optional(),
      istio: z.object({
        enabled: z.boolean().default(false),
        virtualService: z.object({
          name: z.string(),
          routes: z.array(z.string()).default([]),
        }),
        destinationRule: z.object({
          name: z.string(),
          canarySubsetName: z.string().default('canary'),
          stableSubsetName: z.string().default('stable'),
        }).optional(),
      }).optional(),
    }).default({}),
  }).default({}),
  rolling: z.object({
    maxUnavailable: z.string().default('25%'),
    maxSurge: z.string().default('25%'),
  }).default({}),
  analysis: z.object({
    enabled: z.boolean().default(true),
    templates: z.array(z.object({
      templateName: z.string(),
      clusterScope: z.boolean().default(false),
    })).default([]),
    args: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).default([]),
    successCondition: z.string().default('result[0] >= 0.95'),
    failureCondition: z.string().default('result[0] < 0.90'),
    interval: z.string().default('10s'),
    count: z.number().default(5),
    failureLimit: z.number().default(3),
    inconclusiveLimit: z.number().default(3),
  }).default({}),
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    httpHeaders: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).default([]),
    timeoutSeconds: z.number().default(10),
    successThreshold: z.number().default(1),
    failureThreshold: z.number().default(3),
    periodSeconds: z.number().default(10),
    initialDelaySeconds: z.number().default(30),
  }).default({}),
  rollback: z.object({
    automatic: z.boolean().default(true),
    onFailure: z.boolean().default(true),
    onAnalysisFailure: z.boolean().default(true),
  }).default({}),
  notifications: z.object({
    enabled: z.boolean().default(false),
    slack: z.object({
      enabled: z.boolean().default(false),
      webhookUrl: z.string().optional(),
      channel: z.string().optional(),
    }).optional(),
    email: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string()).default([]),
    }).optional(),
  }).default({}),
  norwegianCompliance: z.object({
    enabled: z.boolean().default(false),
    changeApproval: z.boolean().default(true),
    auditTrail: z.boolean().default(true),
    rollbackPolicy: z.boolean().default(true),
  }).default({}),
});

export type ZeroDowntimeConfig = z.infer<typeof ZeroDowntimeConfigSchema>;

export interface DeploymentResult {
  success: boolean;
  strategy: string;
  startTime: string;
  endTime: string;
  duration: number;
  rolloutHash: string;
  previousVersion?: string;
  currentVersion: string;
  rollbackAvailable: boolean;
  healthChecksPassed: boolean;
  analysisResults?: {
    success: boolean;
    metrics: any[];
    errors?: string[];
  };
  notifications?: {
    sent: boolean;
    channels: string[];
  };
}

export interface RolloutStatus {
  name: string;
  namespace: string;
  status: 'Progressing' | 'Healthy' | 'Degraded' | 'Paused' | 'Error';
  strategy: string;
  replicas: string;
  ready: string;
  current: string;
  desired: string;
  age: string;
  conditions: Array<{
    type: string;
    status: string;
    reason?: string;
    message?: string;
  }>;
  canaryWeight?: number;
  analysisRuns?: Array<{
    name: string;
    status: string;
    successful?: number;
    failed?: number;
    inconclusive?: number;
  }>;
}

export class ZeroDowntimeService {
  private config: ZeroDowntimeConfig;
  private kubernetesConfig: KubernetesConfig;
  private kubernetesService: KubernetesService;

  constructor(config: Partial<ZeroDowntimeConfig>, kubernetesConfig: KubernetesConfig) {
    this.config = ZeroDowntimeConfigSchema.parse(config);
    this.kubernetesConfig = kubernetesConfig;
    this.kubernetesService = new KubernetesService(kubernetesConfig);
  }

  /**
   * Generate Argo Rollouts configuration
   */
  generateRollout(): any {
    const { appName, version, image, deployment, security, norwegianCompliance } = this.kubernetesConfig;
    const { strategy } = this.config;

    const rollout = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Rollout',
      metadata: {
        name: appName,
        namespace: this.kubernetesConfig.namespace,
        labels: {
          app: appName,
          version: version,
          'app.kubernetes.io/name': appName,
          'app.kubernetes.io/version': version,
          'app.kubernetes.io/component': 'rollout',
          'app.kubernetes.io/part-of': appName,
          'app.kubernetes.io/managed-by': 'argo-rollouts',
          ...(norwegianCompliance.enabled && {
            'compliance.norway/enabled': 'true',
            'compliance.norway/classification': norwegianCompliance.dataClassification,
          }),
        },
        annotations: {
          'rollout.argoproj.io/revision': '1',
          'xaheen.dev/generated-by': 'xaheen-cli',
          'xaheen.dev/version': process.env.npm_package_version || '5.0.0',
          ...(norwegianCompliance.enabled && {
            'compliance.norway/change-approval': this.config.norwegianCompliance.changeApproval.toString(),
            'compliance.norway/audit-trail': this.config.norwegianCompliance.auditTrail.toString(),
          }),
        },
      },
      spec: {
        replicas: deployment.replicaCount,
        strategy: this.generateDeploymentStrategy(),
        selector: {
          matchLabels: {
            app: appName,
          },
        },
        template: {
          metadata: {
            labels: {
              app: appName,
              version: version,
              'app.kubernetes.io/name': appName,
              'app.kubernetes.io/version': version,
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
            serviceAccountName: this.kubernetesConfig.serviceAccount.name || appName,
            securityContext: {
              runAsNonRoot: security.runAsNonRoot,
              runAsUser: security.runAsUser,
              runAsGroup: security.runAsGroup,
              fsGroup: security.fsGroup,
            },
            containers: [{
              name: appName,
              image: `${image.repository}:${image.tag}`,
              imagePullPolicy: image.pullPolicy,
              ports: [{
                name: 'http',
                containerPort: this.kubernetesConfig.service.targetPort,
                protocol: 'TCP',
              }],
              env: [
                {
                  name: 'NODE_ENV',
                  value: 'production',
                },
                {
                  name: 'PORT',
                  value: this.kubernetesConfig.service.targetPort.toString(),
                },
              ],
              resources: deployment.resources,
              securityContext: {
                runAsNonRoot: security.runAsNonRoot,
                runAsUser: security.runAsUser,
                readOnlyRootFilesystem: security.readOnlyRootFilesystem,
                allowPrivilegeEscalation: security.allowPrivilegeEscalation,
                capabilities: {
                  drop: security.dropCapabilities,
                },
              },
              livenessProbe: {
                httpGet: {
                  path: '/health',
                  port: 'http',
                  ...(this.config.healthCheck.httpHeaders.length > 0 && {
                    httpHeaders: this.config.healthCheck.httpHeaders,
                  }),
                },
                initialDelaySeconds: this.config.healthCheck.initialDelaySeconds,
                periodSeconds: this.config.healthCheck.periodSeconds,
                timeoutSeconds: this.config.healthCheck.timeoutSeconds,
                failureThreshold: this.config.healthCheck.failureThreshold,
                successThreshold: this.config.healthCheck.successThreshold,
              },
              readinessProbe: {
                httpGet: {
                  path: '/ready',
                  port: 'http',
                  ...(this.config.healthCheck.httpHeaders.length > 0 && {
                    httpHeaders: this.config.healthCheck.httpHeaders,
                  }),
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
            }],
            nodeSelector: deployment.nodeSelector,
            tolerations: deployment.tolerations,
            ...(deployment.affinity && { affinity: deployment.affinity }),
          },
        },
        ...(this.config.rollback.automatic && {
          rollbackWindow: {
            revisions: 5,
          },
        }),
      },
    };

    return rollout;
  }

  /**
   * Generate deployment strategy based on configuration
   */
  private generateDeploymentStrategy(): any {
    const { strategy } = this.config;

    switch (strategy) {
      case 'blue-green':
        return this.generateBlueGreenStrategy();
      case 'canary':
        return this.generateCanaryStrategy();
      case 'rolling':
      default:
        return this.generateRollingStrategy();
    }
  }

  /**
   * Generate blue-green deployment strategy
   */
  private generateBlueGreenStrategy(): any {
    const { blueGreen } = this.config;

    return {
      blueGreen: {
        activeService: this.kubernetesConfig.appName,
        previewService: `${this.kubernetesConfig.appName}-preview`,
        autoPromote: blueGreen.autoPromote,
        scaleDownDelaySeconds: blueGreen.scaleDownDelaySeconds,
        ...(blueGreen.prePromotionAnalysis.enabled && {
          prePromotionAnalysis: {
            templates: blueGreen.prePromotionAnalysis.templates,
            args: this.mergeAnalysisArgs(blueGreen.prePromotionAnalysis.templates),
          },
        }),
        ...(blueGreen.postPromotionAnalysis.enabled && {
          postPromotionAnalysis: {
            templates: blueGreen.postPromotionAnalysis.templates,
            args: this.mergeAnalysisArgs(blueGreen.postPromotionAnalysis.templates),
          },
        }),
      },
    };
  }

  /**
   * Generate canary deployment strategy
   */
  private generateCanaryStrategy(): any {
    const { canary } = this.config;

    const strategy: any = {
      canary: {
        canaryService: `${this.kubernetesConfig.appName}-canary`,
        stableService: this.kubernetesConfig.appName,
        steps: canary.steps,
        ...(canary.analysis.templates.length > 0 && {
          analysis: {
            templates: canary.analysis.templates,
            args: canary.analysis.args,
            startingStep: 2,
          },
        }),
      },
    };

    // Add traffic routing configuration
    if (canary.trafficRouting.nginx?.enabled) {
      strategy.canary.trafficRouting = {
        nginx: {
          stableIngress: canary.trafficRouting.nginx.stableIngress,
          annotationPrefix: canary.trafficRouting.nginx.annotationPrefix,
          additionalIngressAnnotations: canary.trafficRouting.nginx.additionalIngressAnnotations,
        },
      };
    } else if (canary.trafficRouting.istio?.enabled) {
      strategy.canary.trafficRouting = {
        istio: {
          virtualService: canary.trafficRouting.istio.virtualService,
          ...(canary.trafficRouting.istio.destinationRule && {
            destinationRule: canary.trafficRouting.istio.destinationRule,
          }),
        },
      };
    }

    return strategy;
  }

  /**
   * Generate rolling deployment strategy
   */
  private generateRollingStrategy(): any {
    const { rolling } = this.config;

    return {
      rollingUpdate: {
        maxUnavailable: rolling.maxUnavailable,
        maxSurge: rolling.maxSurge,
      },
    };
  }

  /**
   * Generate analysis templates for deployment validation
   */
  generateAnalysisTemplates(): any[] {
    const templates = [];

    // Success rate analysis template
    templates.push({
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisTemplate',
      metadata: {
        name: `${this.kubernetesConfig.appName}-success-rate`,
        namespace: this.kubernetesConfig.namespace,
        labels: {
          app: this.kubernetesConfig.appName,
          'app.kubernetes.io/component': 'analysis',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        args: [
          {
            name: 'service-name',
            value: this.kubernetesConfig.appName,
          },
          {
            name: 'namespace',
            value: this.kubernetesConfig.namespace,
          },
        ],
        metrics: [
          {
            name: 'success-rate',
            interval: this.config.analysis.interval,
            count: this.config.analysis.count,
            successCondition: this.config.analysis.successCondition,
            failureCondition: this.config.analysis.failureCondition,
            failureLimit: this.config.analysis.failureLimit,
            inconclusiveLimit: this.config.analysis.inconclusiveLimit,
            provider: {
              prometheus: {
                address: 'http://prometheus:9090',
                query: `
                  sum(rate(http_requests_total{service="{{args.service-name}}",namespace="{{args.namespace}}",status!~"5.."}[2m])) /
                  sum(rate(http_requests_total{service="{{args.service-name}}",namespace="{{args.namespace}}"}[2m]))
                `.trim(),
              },
            },
          },
        ],
      },
    });

    // Response time analysis template
    templates.push({
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisTemplate',
      metadata: {
        name: `${this.kubernetesConfig.appName}-response-time`,
        namespace: this.kubernetesConfig.namespace,
        labels: {
          app: this.kubernetesConfig.appName,
          'app.kubernetes.io/component': 'analysis',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        args: [
          {
            name: 'service-name',
            value: this.kubernetesConfig.appName,
          },
          {
            name: 'namespace',
            value: this.kubernetesConfig.namespace,
          },
        ],
        metrics: [
          {
            name: 'response-time-p95',
            interval: this.config.analysis.interval,
            count: this.config.analysis.count,
            successCondition: 'result[0] < 0.5',
            failureCondition: 'result[0] > 1.0',
            failureLimit: this.config.analysis.failureLimit,
            provider: {
              prometheus: {
                address: 'http://prometheus:9090',
                query: `
                  histogram_quantile(0.95,
                    sum(rate(http_request_duration_seconds_bucket{service="{{args.service-name}}",namespace="{{args.namespace}}"}[2m])) by (le)
                  )
                `.trim(),
              },
            },
          },
        ],
      },
    });

    // CPU utilization analysis template
    templates.push({
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'AnalysisTemplate',
      metadata: {
        name: `${this.kubernetesConfig.appName}-cpu-usage`,
        namespace: this.kubernetesConfig.namespace,
        labels: {
          app: this.kubernetesConfig.appName,
          'app.kubernetes.io/component': 'analysis',
        },
        annotations: {
          'xaheen.dev/generated-by': 'xaheen-cli',
        },
      },
      spec: {
        args: [
          {
            name: 'service-name',
            value: this.kubernetesConfig.appName,
          },
          {
            name: 'namespace',
            value: this.kubernetesConfig.namespace,
          },
        ],
        metrics: [
          {
            name: 'cpu-usage',
            interval: this.config.analysis.interval,
            count: this.config.analysis.count,
            successCondition: 'result[0] < 0.8',
            failureCondition: 'result[0] > 0.9',
            failureLimit: this.config.analysis.failureLimit,
            provider: {
              prometheus: {
                address: 'http://prometheus:9090',
                query: `
                  sum(rate(container_cpu_usage_seconds_total{pod=~"{{args.service-name}}-.*",namespace="{{args.namespace}}"}[2m])) /
                  sum(container_spec_cpu_quota{pod=~"{{args.service-name}}-.*",namespace="{{args.namespace}}"} / 100000)
                `.trim(),
              },
            },
          },
        ],
      },
    });

    return templates;
  }

  /**
   * Generate services for blue-green or canary deployments
   */
  generateDeploymentServices(): any[] {
    const services = [];
    const { strategy } = this.config;

    // Generate main service (always needed)
    const mainService = this.kubernetesService.generateService();
    services.push(mainService);

    if (strategy === 'blue-green') {
      // Generate preview service for blue-green
      const previewService = {
        ...mainService,
        metadata: {
          ...mainService.metadata,
          name: `${this.kubernetesConfig.appName}-preview`,
        },
      };
      services.push(previewService);
    } else if (strategy === 'canary') {
      // Generate canary service
      const canaryService = {
        ...mainService,
        metadata: {
          ...mainService.metadata,
          name: `${this.kubernetesConfig.appName}-canary`,
        },
        spec: {
          ...mainService.spec,
          selector: {
            app: this.kubernetesConfig.appName,
            'rollouts-pod-template-hash': '', // This will be set by Argo Rollouts
          },
        },
      };
      services.push(canaryService);
    }

    return services;
  }

  /**
   * Deploy with zero-downtime strategy
   */
  async deploy(options: {
    newImage: string;
    dryRun?: boolean;
    skipAnalysis?: boolean;
    autoPromote?: boolean;
  }): Promise<DeploymentResult> {
    try {
      const { newImage, dryRun = false, skipAnalysis = false, autoPromote } = options;
      const startTime = new Date().toISOString();

      console.log(`Starting ${this.config.strategy} deployment...`);
      console.log(`New image: ${newImage}`);

      if (dryRun) {
        console.log('Dry run - no changes will be made');
        return {
          success: true,
          strategy: this.config.strategy,
          startTime,
          endTime: new Date().toISOString(),
          duration: 0,
          rolloutHash: 'dry-run-hash',
          currentVersion: newImage.split(':')[1] || 'latest',
          rollbackAvailable: false,
          healthChecksPassed: true,
        };
      }

      // Update rollout with new image
      await this.updateRolloutImage(newImage);

      // Wait for rollout to complete
      const rolloutResult = await this.waitForRollout(skipAnalysis);

      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

      // Send notifications if enabled
      let notificationResult;
      if (this.config.notifications.enabled) {
        notificationResult = await this.sendDeploymentNotification(rolloutResult, newImage);
      }

      const result: DeploymentResult = {
        success: rolloutResult.success,
        strategy: this.config.strategy,
        startTime,
        endTime,
        duration,
        rolloutHash: rolloutResult.hash,
        currentVersion: newImage.split(':')[1] || 'latest',
        rollbackAvailable: true,
        healthChecksPassed: rolloutResult.healthChecksPassed,
        ...(rolloutResult.analysisResults && { analysisResults: rolloutResult.analysisResults }),
        ...(notificationResult && { notifications: notificationResult }),
      };

      console.log(`Deployment ${result.success ? 'completed successfully' : 'failed'}`);
      console.log(`Duration: ${Math.round(duration / 1000)}s`);

      return result;
    } catch (error) {
      throw new Error(`Deployment failed: ${error}`);
    }
  }

  /**
   * Get rollout status
   */
  async getRolloutStatus(): Promise<RolloutStatus> {
    try {
      const { stdout } = await execAsync(
        `kubectl get rollout ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace} -o json`
      );

      const rollout = JSON.parse(stdout);
      const status = rollout.status || {};

      return {
        name: rollout.metadata.name,
        namespace: rollout.metadata.namespace,
        status: this.mapRolloutStatus(status.phase || 'Unknown'),
        strategy: this.config.strategy,
        replicas: `${status.readyReplicas || 0}/${status.replicas || 0}`,
        ready: `${status.readyReplicas || 0}`,
        current: `${status.currentPodHash || 'unknown'}`,
        desired: `${status.stableRS || 'unknown'}`,
        age: this.calculateAge(rollout.metadata.creationTimestamp),
        conditions: status.conditions || [],
        ...(status.canaryStatus && {
          canaryWeight: status.canaryStatus.weights?.canary || 0,
        }),
        ...(status.blueGreen && {
          // Add blue-green specific status
        }),
      };
    } catch (error) {
      throw new Error(`Failed to get rollout status: ${error}`);
    }
  }

  /**
   * Promote deployment (for blue-green or canary)
   */
  async promote(): Promise<void> {
    try {
      const command = `kubectl argo rollouts promote ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace}`;
      
      console.log(`Promoting rollout: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to promote rollout: ${error}`);
    }
  }

  /**
   * Pause deployment
   */
  async pause(): Promise<void> {
    try {
      const command = `kubectl argo rollouts pause ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace}`;
      
      console.log(`Pausing rollout: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to pause rollout: ${error}`);
    }
  }

  /**
   * Resume deployment
   */
  async resume(): Promise<void> {
    try {
      const command = `kubectl argo rollouts resume ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace}`;
      
      console.log(`Resuming rollout: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to resume rollout: ${error}`);
    }
  }

  /**
   * Abort deployment
   */
  async abort(): Promise<void> {
    try {
      const command = `kubectl argo rollouts abort ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace}`;
      
      console.log(`Aborting rollout: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);

      // Automatic rollback if configured
      if (this.config.rollback.automatic) {
        console.log('Performing automatic rollback...');
        await this.rollback();
      }
    } catch (error) {
      throw new Error(`Failed to abort rollout: ${error}`);
    }
  }

  /**
   * Rollback deployment
   */
  async rollback(revision?: number): Promise<void> {
    try {
      let command = `kubectl argo rollouts undo ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace}`;
      
      if (revision) {
        command += ` --to-revision=${revision}`;
      }
      
      console.log(`Rolling back: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);

      // Log audit trail for Norwegian compliance
      if (this.config.norwegianCompliance.auditTrail) {
        await this.logAuditEvent('ROLLBACK', {
          rollout: this.kubernetesConfig.appName,
          namespace: this.kubernetesConfig.namespace,
          revision: revision?.toString() || 'previous',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      throw new Error(`Failed to rollback: ${error}`);
    }
  }

  /**
   * Write all deployment manifests
   */
  async writeDeploymentManifests(outputDir: string): Promise<void> {
    try {
      await fs.ensureDir(outputDir);

      // Generate and write rollout
      const rollout = this.generateRollout();
      const rolloutPath = path.join(outputDir, 'rollout.yaml');
      await fs.writeFile(rolloutPath, yaml.stringify(rollout, { indent: 2 }));

      // Generate and write services
      const services = this.generateDeploymentServices();
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const servicePath = path.join(outputDir, `service${i === 0 ? '' : `-${i}`}.yaml`);
        await fs.writeFile(servicePath, yaml.stringify(service, { indent: 2 }));
      }

      // Generate and write analysis templates
      const analysisTemplates = this.generateAnalysisTemplates();
      for (let i = 0; i < analysisTemplates.length; i++) {
        const template = analysisTemplates[i];
        const templatePath = path.join(outputDir, `analysis-template-${template.metadata.name}.yaml`);
        await fs.writeFile(templatePath, yaml.stringify(template, { indent: 2 }));
      }

      console.log(`Zero-downtime deployment manifests written to ${outputDir}`);
    } catch (error) {
      throw new Error(`Failed to write deployment manifests: ${error}`);
    }
  }

  // Private helper methods
  private mergeAnalysisArgs(templates: any[]): any[] {
    const args = [];
    for (const template of templates) {
      args.push(...template.args);
    }
    return args;
  }

  private async updateRolloutImage(newImage: string): Promise<void> {
    const command = `kubectl argo rollouts set image ${this.kubernetesConfig.appName} ${this.kubernetesConfig.appName}=${newImage} -n ${this.kubernetesConfig.namespace}`;
    
    console.log(`Updating rollout image: ${command}`);
    const { stdout } = await execAsync(command);
    
    console.log(stdout);
  }

  private async waitForRollout(skipAnalysis: boolean): Promise<{
    success: boolean;
    hash: string;
    healthChecksPassed: boolean;
    analysisResults?: any;
  }> {
    try {
      // Wait for rollout to complete
      const waitCommand = `kubectl argo rollouts wait ${this.kubernetesConfig.appName} -n ${this.kubernetesConfig.namespace} --timeout=600s`;
      
      console.log('Waiting for rollout to complete...');
      const { stdout } = await execAsync(waitCommand);
      
      // Get rollout hash
      const status = await this.getRolloutStatus();
      
      return {
        success: status.status === 'Healthy',
        hash: status.current,
        healthChecksPassed: true, // Health checks are part of rollout success
        // Analysis results would be retrieved here if needed
      };
    } catch (error) {
      return {
        success: false,
        hash: 'failed',
        healthChecksPassed: false,
      };
    }
  }

  private async sendDeploymentNotification(result: any, newImage: string): Promise<any> {
    // Placeholder for notification implementation
    console.log(`Deployment notification: ${result.success ? 'SUCCESS' : 'FAILURE'} - ${newImage}`);
    
    return {
      sent: true,
      channels: ['console'],
    };
  }

  private mapRolloutStatus(phase: string): RolloutStatus['status'] {
    switch (phase.toLowerCase()) {
      case 'healthy':
        return 'Healthy';
      case 'progressing':
        return 'Progressing';
      case 'degraded':
        return 'Degraded';
      case 'paused':
        return 'Paused';
      default:
        return 'Error';
    }
  }

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

  private async logAuditEvent(event: string, data: any): Promise<void> {
    // Placeholder for audit logging implementation
    console.log(`AUDIT: ${event}`, data);
  }
}

// Export default configuration
export const defaultZeroDowntimeConfig = ZeroDowntimeConfigSchema.parse({});
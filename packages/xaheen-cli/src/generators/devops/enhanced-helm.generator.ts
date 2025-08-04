import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";

export interface EnhancedHelmGeneratorOptions {
	readonly chartName: string;
	readonly chartVersion: string;
	readonly appVersion: string;
	readonly description: string;
	readonly namespace: string;
	readonly image: {
		readonly repository: string;
		readonly tag: string;
		readonly pullPolicy: "Always" | "IfNotPresent" | "Never";
		readonly pullSecrets?: readonly string[];
	};
	readonly service: {
		readonly enabled: boolean;
		readonly type: "ClusterIP" | "NodePort" | "LoadBalancer" | "ExternalName";
		readonly port: number;
		readonly targetPort: number;
		readonly nodePort?: number;
		readonly annotations?: Record<string, string>;
	};
	readonly ingress: {
		readonly enabled: boolean;
		readonly className?: string;
		readonly annotations?: Record<string, string>;
		readonly hosts: readonly IngressHost[];
		readonly tls?: readonly IngressTLS[];
	};
	readonly autoscaling: {
		readonly enabled: boolean;
		readonly minReplicas: number;
		readonly maxReplicas: number;
		readonly targetCPUUtilizationPercentage: number;
		readonly targetMemoryUtilizationPercentage?: number;
		readonly behavior?: HPA_Behavior;
	};
	readonly resources: {
		readonly limits: {
			readonly cpu: string;
			readonly memory: string;
		};
		readonly requests: {
			readonly cpu: string;
			readonly memory: string;
		};
	};
	readonly persistence: {
		readonly enabled: boolean;
		readonly storageClass?: string;
		readonly accessMode: "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany";
		readonly size: string;
		readonly mountPath: string;
	};
	readonly configMaps: readonly ConfigMapConfig[];
	readonly secrets: readonly SecretConfig[];
	readonly serviceAccount: {
		readonly create: boolean;
		readonly annotations?: Record<string, string>;
		readonly name?: string;
	};
	readonly rbac: {
		readonly create: boolean;
		readonly rules?: readonly RBACRule[];
	};
	readonly podSecurityContext: {
		readonly runAsNonRoot: boolean;
		readonly runAsUser?: number;
		readonly runAsGroup?: number;
		readonly fsGroup?: number;
	};
	readonly securityContext: {
		readonly allowPrivilegeEscalation: boolean;
		readonly capabilities?: {
			readonly drop?: readonly string[];
			readonly add?: readonly string[];
		};
		readonly readOnlyRootFilesystem: boolean;
		readonly runAsNonRoot: boolean;
		readonly runAsUser?: number;
	};
	readonly probes: {
		readonly liveness: {
			readonly enabled: boolean;
			readonly httpGet?: {
				readonly path: string;
				readonly port: number;
			};
			readonly exec?: {
				readonly command: readonly string[];
			};
			readonly initialDelaySeconds: number;
			readonly periodSeconds: number;
			readonly timeoutSeconds: number;
			readonly failureThreshold: number;
		};
		readonly readiness: {
			readonly enabled: boolean;
			readonly httpGet?: {
				readonly path: string;
				readonly port: number;
			};
			readonly exec?: {
				readonly command: readonly string[];
			};
			readonly initialDelaySeconds: number;
			readonly periodSeconds: number;
			readonly timeoutSeconds: number;
			readonly failureThreshold: number;
		};
		readonly startup?: {
			readonly enabled: boolean;
			readonly httpGet?: {
				readonly path: string;
				readonly port: number;
			};
			readonly exec?: {
				readonly command: readonly string[];
			};
			readonly initialDelaySeconds: number;
			readonly periodSeconds: number;
			readonly timeoutSeconds: number;
			readonly failureThreshold: number;
		};
	};
	readonly monitoring: {
		readonly serviceMonitor: {
			readonly enabled: boolean;
			readonly labels?: Record<string, string>;
			readonly interval?: string;
			readonly scrapeTimeout?: string;
		};
		readonly prometheusRule: {
			readonly enabled: boolean;
			readonly rules?: readonly PrometheusRule[];
		};
	};
	readonly networkPolicy: {
		readonly enabled: boolean;
		readonly policyTypes?: readonly string[];
		readonly ingress?: readonly NetworkPolicyRule[];
		readonly egress?: readonly NetworkPolicyRule[];
	};
	readonly podDisruptionBudget: {
		readonly enabled: boolean;
		readonly minAvailable?: number | string;
		readonly maxUnavailable?: number | string;
	};
	readonly environment: "development" | "staging" | "production";
	readonly extraEnvVars?: readonly EnvVar[];
	readonly extraVolumes?: readonly VolumeConfig[];
	readonly extraVolumeMounts?: readonly VolumeMountConfig[];
	readonly nodeSelector?: Record<string, string>;
	readonly tolerations?: readonly Toleration[];
	readonly affinity?: Affinity;
	readonly podAnnotations?: Record<string, string>;
	readonly podLabels?: Record<string, string>;
	readonly deploymentAnnotations?: Record<string, string>;
	readonly deploymentLabels?: Record<string, string>;
	readonly metrics: {
		readonly enabled: boolean;
		readonly port: number;
		readonly path: string;
	};
	readonly lifecycle?: {
		readonly preStop?: {
			readonly exec?: {
				readonly command: readonly string[];
			};
		};
		readonly postStart?: {
			readonly exec?: {
				readonly command: readonly string[];
			};
		};
	};
}

export interface IngressHost {
	readonly host: string;
	readonly paths: readonly IngressPath[];
}

export interface IngressPath {
	readonly path: string;
	readonly pathType: "Exact" | "Prefix" | "ImplementationSpecific";
}

export interface IngressTLS {
	readonly secretName: string;
	readonly hosts: readonly string[];
}

export interface HPA_Behavior {
	readonly scaleDown?: {
		readonly stabilizationWindowSeconds?: number;
		readonly policies?: readonly ScalingPolicy[];
	};
	readonly scaleUp?: {
		readonly stabilizationWindowSeconds?: number;
		readonly policies?: readonly ScalingPolicy[];
	};
}

export interface ScalingPolicy {
	readonly type: "Percent" | "Pods";
	readonly value: number;
	readonly periodSeconds: number;
}

export interface ConfigMapConfig {
	readonly name: string;
	readonly data: Record<string, string>;
	readonly mountPath?: string;
}

export interface SecretConfig {
	readonly name: string;
	readonly type: "Opaque" | "kubernetes.io/tls" | "kubernetes.io/dockerconfigjson";
	readonly data?: Record<string, string>;
	readonly stringData?: Record<string, string>;
	readonly mountPath?: string;
}

export interface RBACRule {
	readonly apiGroups: readonly string[];
	readonly resources: readonly string[];
	readonly verbs: readonly string[];
}

export interface PrometheusRule {
	readonly alert: string;
	readonly expr: string;
	readonly for: string;
	readonly labels?: Record<string, string>;
	readonly annotations?: Record<string, string>;
}

export interface NetworkPolicyRule {
	readonly from?: readonly NetworkPolicyPeer[];
	readonly to?: readonly NetworkPolicyPeer[];
	readonly ports?: readonly NetworkPolicyPort[];
}

export interface NetworkPolicyPeer {
	readonly podSelector?: {
		readonly matchLabels?: Record<string, string>;
	};
	readonly namespaceSelector?: {
		readonly matchLabels?: Record<string, string>;
	};
	readonly ipBlock?: {
		readonly cidr: string;
		readonly except?: readonly string[];
	};
}

export interface NetworkPolicyPort {
	readonly protocol: "TCP" | "UDP" | "SCTP";
	readonly port: number | string;
}

export interface EnvVar {
	readonly name: string;
	readonly value?: string;
	readonly valueFrom?: {
		readonly secretKeyRef?: {
			readonly name: string;
			readonly key: string;
		};
		readonly configMapKeyRef?: {
			readonly name: string;
			readonly key: string;
		};
		readonly fieldRef?: {
			readonly fieldPath: string;
		};
	};
}

export interface VolumeConfig {
	readonly name: string;
	readonly configMap?: {
		readonly name: string;
	};
	readonly secret?: {
		readonly secretName: string;
	};
	readonly emptyDir?: {};
	readonly hostPath?: {
		readonly path: string;
		readonly type?: string;
	};
}

export interface VolumeMountConfig {
	readonly name: string;
	readonly mountPath: string;
	readonly readOnly?: boolean;
}

export interface Toleration {
	readonly key?: string;
	readonly operator?: "Equal" | "Exists";
	readonly value?: string;
	readonly effect?: "NoSchedule" | "PreferNoSchedule" | "NoExecute";
	readonly tolerationSeconds?: number;
}

export interface Affinity {
	readonly nodeAffinity?: {
		readonly requiredDuringSchedulingIgnoredDuringExecution?: {
			readonly nodeSelectorTerms: readonly NodeSelectorTerm[];
		};
		readonly preferredDuringSchedulingIgnoredDuringExecution?: readonly PreferredSchedulingTerm[];
	};
	readonly podAffinity?: {
		readonly requiredDuringSchedulingIgnoredDuringExecution?: readonly PodAffinityTerm[];
		readonly preferredDuringSchedulingIgnoredDuringExecution?: readonly WeightedPodAffinityTerm[];
	};
	readonly podAntiAffinity?: {
		readonly requiredDuringSchedulingIgnoredDuringExecution?: readonly PodAffinityTerm[];
		readonly preferredDuringSchedulingIgnoredDuringExecution?: readonly WeightedPodAffinityTerm[];
	};
}

export interface NodeSelectorTerm {
	readonly matchExpressions?: readonly NodeSelectorRequirement[];
	readonly matchFields?: readonly NodeSelectorRequirement[];
}

export interface NodeSelectorRequirement {
	readonly key: string;
	readonly operator: "In" | "NotIn" | "Exists" | "DoesNotExist" | "Gt" | "Lt";
	readonly values?: readonly string[];
}

export interface PreferredSchedulingTerm {
	readonly weight: number;
	readonly preference: NodeSelectorTerm;
}

export interface PodAffinityTerm {
	readonly labelSelector?: {
		readonly matchLabels?: Record<string, string>;
		readonly matchExpressions?: readonly LabelSelectorRequirement[];
	};
	readonly namespaces?: readonly string[];
	readonly topologyKey: string;
}

export interface WeightedPodAffinityTerm {
	readonly weight: number;
	readonly podAffinityTerm: PodAffinityTerm;
}

export interface LabelSelectorRequirement {
	readonly key: string;
	readonly operator: "In" | "NotIn" | "Exists" | "DoesNotExist";
	readonly values?: readonly string[];
}

export class EnhancedHelmGenerator extends BaseGenerator<EnhancedHelmGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate Chart.yaml
			await this.generateChartYaml(options);

			// Generate values.yaml files for each environment
			await this.generateValuesFiles(options);

			// Generate templates
			await this.generateTemplates(options);

			// Generate helpers
			await this.generateHelpers(options);

			// Generate tests
			await this.generateTests(options);

			// Generate documentation
			await this.generateDocumentation(options);

			// Generate deployment scripts
			await this.generateDeploymentScripts(options);

			// Generate CI/CD integration
			await this.generateCICDIntegration(options);

			this.logger.success("Enhanced Helm chart generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate Helm chart", error);
			throw error;
		}
	}

	private async validateOptions(options: EnhancedHelmGeneratorOptions): Promise<void> {
		if (!options.chartName) {
			throw new Error("Chart name is required");
		}

		if (!options.chartVersion) {
			throw new Error("Chart version is required");
		}

		if (!options.appVersion) {
			throw new Error("App version is required");
		}

		if (options.ingress.enabled && options.ingress.hosts.length === 0) {
			throw new Error("At least one ingress host is required when ingress is enabled");
		}

		if (options.autoscaling.enabled && options.autoscaling.minReplicas >= options.autoscaling.maxReplicas) {
			throw new Error("minReplicas must be less than maxReplicas");
		}
	}

	private async generateChartYaml(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const chart = {
			apiVersion: "v2",
			name: options.chartName,
			description: options.description,
			type: "application",
			version: options.chartVersion,
			appVersion: options.appVersion,
			kubeVersion: ">=1.25.0",
			keywords: [
				options.chartName,
				"microservice",
				"kubernetes",
				"helm"
			],
			home: `https://github.com/your-org/${options.chartName}`,
			sources: [
				`https://github.com/your-org/${options.chartName}`
			],
			maintainers: [
				{
					name: "Development Team",
					email: "dev@your-org.com"
				}
			],
			annotations: {
				"category": "Application",
				"licenses": "MIT"
			},
			dependencies: this.getDependencies(options)
		};

		await this.templateManager.renderTemplate(
			"devops/helm/Chart.yaml.hbs",
			`helm/${options.chartName}/Chart.yaml`,
			chart
		);
	}

	private async generateValuesFiles(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Generate base values.yaml
		const baseValues = this.generateBaseValues(options);
		await this.templateManager.renderTemplate(
			"devops/helm/values.yaml.hbs",
			`helm/${options.chartName}/values.yaml`,
			baseValues
		);

		// Generate environment-specific values
		const environments = ["development", "staging", "production"];
		for (const env of environments) {
			const envValues = this.generateEnvironmentValues(options, env);
			await this.templateManager.renderTemplate(
				"devops/helm/values-environment.yaml.hbs",
				`helm/${options.chartName}/values-${env}.yaml`,
				envValues
			);
		}
	}

	private generateBaseValues(options: EnhancedHelmGeneratorOptions): any {
		return {
			replicaCount: options.autoscaling.enabled ? options.autoscaling.minReplicas : 1,
			image: {
				repository: options.image.repository,
				pullPolicy: options.image.pullPolicy,
				tag: options.image.tag
			},
			imagePullSecrets: options.image.pullSecrets?.map(name => ({ name })) || [],
			nameOverride: "",
			fullnameOverride: "",
			serviceAccount: {
				create: options.serviceAccount.create,
				annotations: options.serviceAccount.annotations || {},
				name: options.serviceAccount.name || ""
			},
			podAnnotations: options.podAnnotations || {},
			podLabels: options.podLabels || {},
			podSecurityContext: options.podSecurityContext,
			securityContext: options.securityContext,
			service: {
				type: options.service.type,
				port: options.service.port,
				targetPort: options.service.targetPort,
				nodePort: options.service.nodePort,
				annotations: options.service.annotations || {}
			},
			ingress: {
				enabled: options.ingress.enabled,
				className: options.ingress.className || "",
				annotations: options.ingress.annotations || {},
				hosts: options.ingress.hosts,
				tls: options.ingress.tls || []
			},
			resources: options.resources,
			autoscaling: {
				enabled: options.autoscaling.enabled,
				minReplicas: options.autoscaling.minReplicas,
				maxReplicas: options.autoscaling.maxReplicas,
				targetCPUUtilizationPercentage: options.autoscaling.targetCPUUtilizationPercentage,
				targetMemoryUtilizationPercentage: options.autoscaling.targetMemoryUtilizationPercentage,
				behavior: options.autoscaling.behavior
			},
			persistence: {
				enabled: options.persistence.enabled,
				storageClass: options.persistence.storageClass || "",
				accessMode: options.persistence.accessMode,
				size: options.persistence.size,
				mountPath: options.persistence.mountPath
			},
			configMaps: options.configMaps,
			secrets: options.secrets,
			rbac: {
				create: options.rbac.create,
				rules: options.rbac.rules || []
			},
			probes: {
				liveness: options.probes.liveness,
				readiness: options.probes.readiness,
				startup: options.probes.startup
			},
			monitoring: {
				serviceMonitor: options.monitoring.serviceMonitor,
				prometheusRule: options.monitoring.prometheusRule
			},
			networkPolicy: options.networkPolicy,
			podDisruptionBudget: options.podDisruptionBudget,
			extraEnvVars: options.extraEnvVars || [],
			extraVolumes: options.extraVolumes || [],
			extraVolumeMounts: options.extraVolumeMounts || [],
			nodeSelector: options.nodeSelector || {},
			tolerations: options.tolerations || [],
			affinity: options.affinity || {},
			metrics: options.metrics,
			lifecycle: options.lifecycle || {}
		};
	}

	private generateEnvironmentValues(options: EnhancedHelmGeneratorOptions, environment: string): any {
		const baseValues = this.generateBaseValues(options);

		switch (environment) {
			case "development":
				return {
					...baseValues,
					replicaCount: 1,
					image: {
						...baseValues.image,
						pullPolicy: "Always"
					},
					resources: {
						limits: {
							cpu: "500m",
							memory: "512Mi"
						},
						requests: {
							cpu: "100m",
							memory: "128Mi"
						}
					},
					autoscaling: {
						...baseValues.autoscaling,
						enabled: false
					},
					ingress: {
						...baseValues.ingress,
						annotations: {
							...baseValues.ingress.annotations,
							"nginx.ingress.kubernetes.io/rewrite-target": "/"
						}
					}
				};

			case "staging":
				return {
					...baseValues,
					replicaCount: 2,
					resources: {
						limits: {
							cpu: "1000m",
							memory: "1Gi"
						},
						requests: {
							cpu: "500m",
							memory: "512Mi"
						}
					},
					autoscaling: {
						...baseValues.autoscaling,
						minReplicas: 2,
						maxReplicas: 5
					}
				};

			case "production":
				return {
					...baseValues,
					replicaCount: 3,
					resources: {
						limits: {
							cpu: "2000m",
							memory: "2Gi"
						},
						requests: {
							cpu: "1000m",
							memory: "1Gi"
						}
					},
					autoscaling: {
						...baseValues.autoscaling,
						enabled: true,
						minReplicas: 3,
						maxReplicas: 20,
						behavior: {
							scaleDown: {
								stabilizationWindowSeconds: 300,
								policies: [
									{
										type: "Percent",
										value: 10,
										periodSeconds: 60
									}
								]
							},
							scaleUp: {
								stabilizationWindowSeconds: 60,
								policies: [
									{
										type: "Percent",
										value: 50,
										periodSeconds: 60
									}
								]
							}
						}
					},
					podDisruptionBudget: {
						enabled: true,
						minAvailable: 2
					}
				};

			default:
				return baseValues;
		}
	}

	private async generateTemplates(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Generate deployment template
		await this.generateDeploymentTemplate(options);

		// Generate service template
		await this.generateServiceTemplate(options);

		// Generate ingress template
		if (options.ingress.enabled) {
			await this.generateIngressTemplate(options);
		}

		// Generate HPA template
		if (options.autoscaling.enabled) {
			await this.generateHPATemplate(options);
		}

		// Generate PVC template
		if (options.persistence.enabled) {
			await this.generatePVCTemplate(options);
		}

		// Generate ConfigMap templates
		for (const configMap of options.configMaps) {
			await this.generateConfigMapTemplate(options, configMap);
		}

		// Generate Secret templates
		for (const secret of options.secrets) {
			await this.generateSecretTemplate(options, secret);
		}

		// Generate ServiceAccount template
		if (options.serviceAccount.create) {
			await this.generateServiceAccountTemplate(options);
		}

		// Generate RBAC templates
		if (options.rbac.create) {
			await this.generateRBACTemplates(options);
		}

		// Generate monitoring templates
		if (options.monitoring.serviceMonitor.enabled) {
			await this.generateServiceMonitorTemplate(options);
		}

		if (options.monitoring.prometheusRule.enabled) {
			await this.generatePrometheusRuleTemplate(options);
		}

		// Generate NetworkPolicy template
		if (options.networkPolicy.enabled) {
			await this.generateNetworkPolicyTemplate(options);
		}

		// Generate PodDisruptionBudget template
		if (options.podDisruptionBudget.enabled) {
			await this.generatePDBTemplate(options);
		}
	}

	private async generateDeploymentTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const deployment = {
			apiVersion: "apps/v1",
			kind: "Deployment",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}",
				annotations: options.deploymentAnnotations
			},
			spec: {
				replicas: "{{ if not .Values.autoscaling.enabled }}{{ .Values.replicaCount }}{{ end }}",
				selector: {
					matchLabels: "{{- include \"" + options.chartName + ".selectorLabels\" . | nindent 6 }}"
				},
				template: {
					metadata: {
						annotations: "{{ with .Values.podAnnotations }}{{- toYaml . | nindent 8 }}{{ end }}",
						labels: "{{- include \"" + options.chartName + ".selectorLabels\" . | nindent 8 }}"
					},
					spec: {
						imagePullSecrets: "{{ with .Values.imagePullSecrets }}{{- toYaml . | nindent 8 }}{{ end }}",
						serviceAccountName: "{{ include \"" + options.chartName + ".serviceAccountName\" . }}",
						securityContext: "{{- toYaml .Values.podSecurityContext | nindent 8 }}",
						containers: [
							{
								name: options.chartName,
								securityContext: "{{- toYaml .Values.securityContext | nindent 12 }}",
								image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}",
								imagePullPolicy: "{{ .Values.image.pullPolicy }}",
								ports: [
									{
										name: "http",
										containerPort: "{{ .Values.service.targetPort }}",
										protocol: "TCP"
									}
								],
								livenessProbe: this.generateProbeTemplate("liveness"),
								readinessProbe: this.generateProbeTemplate("readiness"),
								startupProbe: this.generateProbeTemplate("startup"),
								resources: "{{- toYaml .Values.resources | nindent 12 }}",
								env: "{{ with .Values.extraEnvVars }}{{- toYaml . | nindent 12 }}{{ end }}",
								volumeMounts: this.generateVolumeMountsTemplate(options),
								lifecycle: "{{ with .Values.lifecycle }}{{- toYaml . | nindent 12 }}{{ end }}"
							}
						],
						volumes: this.generateVolumesTemplate(options),
						nodeSelector: "{{ with .Values.nodeSelector }}{{- toYaml . | nindent 8 }}{{ end }}",
						affinity: "{{ with .Values.affinity }}{{- toYaml . | nindent 8 }}{{ end }}",
						tolerations: "{{ with .Values.tolerations }}{{- toYaml . | nindent 8 }}{{ end }}"
					}
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/deployment.yaml.hbs",
			`helm/${options.chartName}/templates/deployment.yaml`,
			deployment
		);
	}

	private async generateServiceTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const service = {
			apiVersion: "v1",
			kind: "Service",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}",
				annotations: "{{ with .Values.service.annotations }}{{- toYaml . | nindent 4 }}{{ end }}"
			},
			spec: {
				type: "{{ .Values.service.type }}",
				ports: [
					{
						port: "{{ .Values.service.port }}",
						targetPort: "http",
						protocol: "TCP",
						name: "http",
						nodePort: "{{ if eq .Values.service.type \"NodePort\" }}{{ .Values.service.nodePort }}{{ end }}"
					}
				],
				selector: "{{- include \"" + options.chartName + ".selectorLabels\" . | nindent 4 }}"
			}
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/service.yaml.hbs",
			`helm/${options.chartName}/templates/service.yaml`,
			service
		);
	}

	private async generateIngressTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const ingress = {
			condition: "{{ if .Values.ingress.enabled }}",
			apiVersion: "networking.k8s.io/v1",
			kind: "Ingress",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}",
				annotations: "{{ with .Values.ingress.annotations }}{{- toYaml . | nindent 4 }}{{ end }}"
			},
			spec: {
				ingressClassName: "{{ .Values.ingress.className }}",
				tls: "{{ with .Values.ingress.tls }}{{- toYaml . | nindent 4 }}{{ end }}",
				rules: "{{ range .Values.ingress.hosts }}",
				ruleTemplate: {
					host: "{{ .host | quote }}",
					http: {
						paths: "{{ range .paths }}",
						pathTemplate: {
							path: "{{ .path }}",
							pathType: "{{ .pathType }}",
							backend: {
								service: {
									name: "{{ include \"" + options.chartName + ".fullname\" $ }}",
									port: {
										number: "{{ $.Values.service.port }}"
									}
								}
							}
						},
						pathTemplateEnd: "{{ end }}"
					}
				},
				rulesEnd: "{{ end }}",
				endCondition: "{{ end }}"
			}
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/ingress.yaml.hbs",
			`helm/${options.chartName}/templates/ingress.yaml`,
			ingress
		);
	}

	private async generateHPATemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const hpa = {
			condition: "{{ if .Values.autoscaling.enabled }}",
			apiVersion: "autoscaling/v2",
			kind: "HorizontalPodAutoscaler",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}"
			},
			spec: {
				scaleTargetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: "{{ include \"" + options.chartName + ".fullname\" . }}"
				},
				minReplicas: "{{ .Values.autoscaling.minReplicas }}",
				maxReplicas: "{{ .Values.autoscaling.maxReplicas }}",
				metrics: [
					{
						type: "Resource",
						resource: {
							name: "cpu",
							target: {
								type: "Utilization",
								averageUtilization: "{{ .Values.autoscaling.targetCPUUtilizationPercentage }}"
							}
						}
					}
				],
				behavior: "{{ with .Values.autoscaling.behavior }}{{- toYaml . | nindent 4 }}{{ end }}"
			},
			endCondition: "{{ end }}"
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/hpa.yaml.hbs",
			`helm/${options.chartName}/templates/hpa.yaml`,
			hpa
		);
	}

	private async generateServiceMonitorTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const serviceMonitor = {
			condition: "{{ if .Values.monitoring.serviceMonitor.enabled }}",
			apiVersion: "monitoring.coreos.com/v1",
			kind: "ServiceMonitor",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}",
				additionalLabels: "{{ with .Values.monitoring.serviceMonitor.labels }}{{- toYaml . | nindent 4 }}{{ end }}"
			},
			spec: {
				selector: {
					matchLabels: "{{- include \"" + options.chartName + ".selectorLabels\" . | nindent 6 }}"
				},
				endpoints: [
					{
						port: "http",
						path: "{{ .Values.metrics.path }}",
						interval: "{{ .Values.monitoring.serviceMonitor.interval | default \"30s\" }}",
						scrapeTimeout: "{{ .Values.monitoring.serviceMonitor.scrapeTimeout | default \"10s\" }}"
					}
				]
			},
			endCondition: "{{ end }}"
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/servicemonitor.yaml.hbs",
			`helm/${options.chartName}/templates/servicemonitor.yaml`,
			serviceMonitor
		);
	}

	private async generateHelpers(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const helpers = `
{{/*
Expand the name of the chart.
*/}}
{{- define "${options.chartName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "${options.chartName}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${options.chartName}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${options.chartName}.labels" -}}
helm.sh/chart: {{ include "${options.chartName}.chart" . }}
{{ include "${options.chartName}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.podLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${options.chartName}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${options.chartName}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "${options.chartName}.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "${options.chartName}.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the persistent volume claim
*/}}
{{- define "${options.chartName}.pvcName" -}}
{{- if .Values.persistence.existingClaim }}
{{- .Values.persistence.existingClaim }}
{{- else }}
{{- include "${options.chartName}.fullname" . }}-data
{{- end }}
{{- end }}

{{/*
Create the image pull policy
*/}}
{{- define "${options.chartName}.imagePullPolicy" -}}
{{- if .Values.image.tag }}
{{- if eq .Values.image.tag "latest" }}
{{- "Always" }}
{{- else }}
{{- .Values.image.pullPolicy | default "IfNotPresent" }}
{{- end }}
{{- else }}
{{- "IfNotPresent" }}
{{- end }}
{{- end }}

{{/*
Generate environment variables
*/}}
{{- define "${options.chartName}.envVars" -}}
{{- range .Values.extraEnvVars }}
- name: {{ .name }}
  {{- if .value }}
  value: {{ .value | quote }}
  {{- else if .valueFrom }}
  valueFrom:
    {{- toYaml .valueFrom | nindent 4 }}
  {{- end }}
{{- end }}
{{- end }}
		`.trim();

		await this.templateManager.renderTemplate(
			"devops/helm/templates/helpers.tpl.hbs",
			`helm/${options.chartName}/templates/_helpers.tpl`,
			{ helpers }
		);
	}

	private async generateTests(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const test = {
			apiVersion: "v1",
			kind: "Pod",
			metadata: {
				name: "{{ include \"" + options.chartName + ".fullname\" . }}-test",
				labels: "{{- include \"" + options.chartName + ".labels\" . | nindent 4 }}",
				annotations: {
					"helm.sh/hook": "test"
				}
			},
			spec: {
				restartPolicy: "Never",
				containers: [
					{
						name: "test",
						image: "busybox:1.36",
						command: ["wget"],
						args: [
							"--no-check-certificate",
							"-q",
							"-O",
							"-",
							"{{ include \"" + options.chartName + ".fullname\" . }}:{{ .Values.service.port }}{{ .Values.probes.readiness.httpGet.path | default \"/\" }}"
						]
					}
				]
			}
		};

		await this.templateManager.renderTemplate(
			"devops/helm/templates/tests/test-connection.yaml.hbs",
			`helm/${options.chartName}/templates/tests/test-connection.yaml`,
			test
		);
	}

	private async generateDocumentation(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const readme = {
			chartName: options.chartName,
			description: options.description,
			version: options.chartVersion,
			appVersion: options.appVersion,
			requirements: {
				kubernetes: ">=1.25.0",
				helm: ">=3.8.0"
			},
			installation: {
				repository: `helm repo add my-repo https://charts.example.com`,
				install: `helm install ${options.chartName} my-repo/${options.chartName}`,
				upgrade: `helm upgrade ${options.chartName} my-repo/${options.chartName}`,
				uninstall: `helm uninstall ${options.chartName}`
			},
			configuration: this.generateConfigurationDocs(options),
			examples: this.generateExamples(options)
		};

		await this.templateManager.renderTemplate(
			"devops/helm/README.md.hbs",
			`helm/${options.chartName}/README.md`,
			readme
		);
	}

	private async generateDeploymentScripts(options: EnhancedHelmGeneratorOptions): Promise<void> {
		const deployScript = `#!/bin/bash
set -e

NAMESPACE="${options.namespace}"
CHART_PATH="helm/${options.chartName}"
RELEASE_NAME="${options.chartName}"
ENVIRONMENT=\${1:-development}

echo "Deploying \${RELEASE_NAME} to \${ENVIRONMENT} environment..."

# Create namespace if it doesn't exist
kubectl create namespace \$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Add any required Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Deploy the chart
helm upgrade --install \$RELEASE_NAME \$CHART_PATH \\
  --namespace \$NAMESPACE \\
  --values \$CHART_PATH/values-\$ENVIRONMENT.yaml \\
  --wait \\
  --timeout=300s

echo "Deployment completed!"
echo "Get status: helm status \$RELEASE_NAME -n \$NAMESPACE"
echo "Get values: helm get values \$RELEASE_NAME -n \$NAMESPACE"
`;

		await this.templateManager.renderTemplate(
			"devops/helm/scripts/deploy.sh.hbs",
			`scripts/deploy-helm.sh`,
			{ script: deployScript, executable: true }
		);
	}

	private async generateCICDIntegration(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Generate GitHub Actions workflow for Helm
		const helmWorkflow = {
			name: "Helm Chart CI/CD",
			on: {
				push: {
					paths: [`helm/${options.chartName}/**`]
				},
				pull_request: {
					paths: [`helm/${options.chartName}/**`]
				}
			},
			jobs: {
				lint: {
					runs_on: "ubuntu-latest",
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4",
							with: {
								fetch_depth: 0
							}
						},
						{
							name: "Set up Helm",
							uses: "azure/setup-helm@v3",
							with: {
								version: "v3.13.0"
							}
						},
						{
							name: "Lint chart",
							run: `helm lint helm/${options.chartName}`
						},
						{
							name: "Validate templates",
							run: `helm template ${options.chartName} helm/${options.chartName} --validate`
						}
					]
				},
				test: {
					runs_on: "ubuntu-latest",
					needs: ["lint"],
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						{
							name: "Set up Helm",
							uses: "azure/setup-helm@v3"
						},
						{
							name: "Install chart-testing",
							uses: "helm/chart-testing-action@v2.6.1"
						},
						{
							name: "List changed charts",
							id: "list-changed",
							run: `ct list-changed --chart-dirs helm --target-branch ${{ github.event.repository.default_branch }}`
						},
						{
							name: "Run chart tests",
							run: `ct install --chart-dirs helm`
						}
					]
				},
				release: {
					runs_on: "ubuntu-latest",
					needs: ["test"],
					if: "github.ref == 'refs/heads/main'",
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4",
							with: {
								fetch_depth: 0
							}
						},
						{
							name: "Configure Git",
							run: `
								git config user.name "$GITHUB_ACTOR"
								git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
							`
						},
						{
							name: "Install Helm",
							uses: "azure/setup-helm@v3"
						},
						{
							name: "Package and release chart",
							uses: "helm/chart-releaser-action@v1.6.0",
							env: {
								CR_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
							}
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/helm/github-actions/helm-ci.yml.hbs",
			`.github/workflows/helm-${options.chartName}.yml`,
			helmWorkflow
		);
	}

	// Helper methods
	private getDependencies(options: EnhancedHelmGeneratorOptions): any[] {
		const dependencies: any[] = [];

		if (options.monitoring.serviceMonitor.enabled || options.monitoring.prometheusRule.enabled) {
			dependencies.push({
				name: "kube-prometheus-stack",
				version: ">=45.0.0",
				repository: "https://prometheus-community.github.io/helm-charts",
				condition: "monitoring.enabled"
			});
		}

		return dependencies;
	}

	private generateProbeTemplate(probeType: string): any {
		return {
			condition: `{{ if .Values.probes.${probeType}.enabled }}`,
			httpGet: `{{ if .Values.probes.${probeType}.httpGet }}`,
			httpGetContent: {
				path: `{{ .Values.probes.${probeType}.httpGet.path }}`,
				port: "http"
			},
			httpGetEnd: "{{ end }}",
			exec: `{{ if .Values.probes.${probeType}.exec }}`,
			execContent: {
				command: `{{- toYaml .Values.probes.${probeType}.exec.command | nindent 12 }}`
			},
			execEnd: "{{ end }}",
			initialDelaySeconds: `{{ .Values.probes.${probeType}.initialDelaySeconds }}`,
			periodSeconds: `{{ .Values.probes.${probeType}.periodSeconds }}`,
			timeoutSeconds: `{{ .Values.probes.${probeType}.timeoutSeconds }}`,
			failureThreshold: `{{ .Values.probes.${probeType}.failureThreshold }}`,
			endCondition: "{{ end }}"
		};
	}

	private generateVolumeMountsTemplate(options: EnhancedHelmGeneratorOptions): any[] {
		const volumeMounts: any[] = [];

		if (options.persistence.enabled) {
			volumeMounts.push({
				name: "data",
				mountPath: "{{ .Values.persistence.mountPath }}"
			});
		}

		volumeMounts.push({
			condition: "{{ with .Values.extraVolumeMounts }}",
			content: "{{- toYaml . | nindent 12 }}",
			endCondition: "{{ end }}"
		});

		return volumeMounts;
	}

	private generateVolumesTemplate(options: EnhancedHelmGeneratorOptions): any[] {
		const volumes: any[] = [];

		if (options.persistence.enabled) {
			volumes.push({
				name: "data",
				persistentVolumeClaim: {
					claimName: "{{ include \"" + options.chartName + ".pvcName\" . }}"
				}
			});
		}

		volumes.push({
			condition: "{{ with .Values.extraVolumes }}",
			content: "{{- toYaml . | nindent 8 }}",
			endCondition: "{{ end }}"
		});

		return volumes;
	}

	private generateConfigurationDocs(options: EnhancedHelmGeneratorOptions): any {
		return {
			sections: [
				{
					name: "Global Configuration",
					parameters: [
						{
							name: "replicaCount",
							description: "Number of replicas",
							default: "1"
						},
						{
							name: "image.repository",
							description: "Container image repository",
							default: options.image.repository
						},
						{
							name: "image.tag",
							description: "Container image tag",
							default: options.image.tag
						}
					]
				},
				{
					name: "Service Configuration",
					parameters: [
						{
							name: "service.type",
							description: "Kubernetes service type",
							default: options.service.type
						},
						{
							name: "service.port",
							description: "Service port",
							default: options.service.port.toString()
						}
					]
				},
				{
					name: "Ingress Configuration",
					parameters: [
						{
							name: "ingress.enabled",
							description: "Enable ingress",
							default: options.ingress.enabled.toString()
						},
						{
							name: "ingress.className",
							description: "Ingress class name",
							default: options.ingress.className || "nginx"
						}
					]
				}
			]
		};
	}

	private generateExamples(options: EnhancedHelmGeneratorOptions): any {
		return {
			basic: `helm install ${options.chartName} ./${options.chartName}`,
			withValues: `helm install ${options.chartName} ./${options.chartName} --values values-production.yaml`,
			upgrade: `helm upgrade ${options.chartName} ./${options.chartName} --reuse-values`,
			customValues: `helm install ${options.chartName} ./${options.chartName} --set replicaCount=3 --set ingress.enabled=true`
		};
	}

	// Additional template generation methods would be implemented here
	private async generatePVCTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for PVC template
	}

	private async generateConfigMapTemplate(options: EnhancedHelmGeneratorOptions, configMap: ConfigMapConfig): Promise<void> {
		// Implementation for ConfigMap template
	}

	private async generateSecretTemplate(options: EnhancedHelmGeneratorOptions, secret: SecretConfig): Promise<void> {
		// Implementation for Secret template
	}

	private async generateServiceAccountTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for ServiceAccount template
	}

	private async generateRBACTemplates(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for RBAC templates
	}

	private async generatePrometheusRuleTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for PrometheusRule template
	}

	private async generateNetworkPolicyTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for NetworkPolicy template
	}

	private async generatePDBTemplate(options: EnhancedHelmGeneratorOptions): Promise<void> {
		// Implementation for PodDisruptionBudget template
	}
}
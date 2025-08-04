import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";

export interface KubernetesGeneratorOptions {
	readonly appName: string;
	readonly namespace: string;
	readonly image: string;
	readonly imageTag: string;
	readonly port: number;
	readonly targetPort: number;
	readonly replicas: number;
	readonly environment: "development" | "staging" | "production";
	readonly enableIngress: boolean;
	readonly enableHPA: boolean;
	readonly enableVPA: boolean;
	readonly enablePDB: boolean;
	readonly enableConfigMap: boolean;
	readonly enableSecrets: boolean;
	readonly enableServiceMesh: boolean;
	readonly enablePrometheus: boolean;
	readonly enableLogging: boolean;
	readonly enableTracing: boolean;
	readonly enableNetworkPolicies: boolean;
	readonly enablePodSecurityPolicies: boolean;
	readonly enableHelm: boolean;
	readonly enableIstio: boolean;
	readonly enableArgoCD: boolean;
	readonly enableFluxCD: boolean;
	readonly enableKeda: boolean;
	readonly enableCertManager: boolean;
	readonly enableExternalSecrets: boolean;
	readonly enableMultiCluster: boolean;
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
		readonly accessMode: "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany";
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
	readonly vpa?: any;
	readonly pdb?: any;
	readonly configMap?: any;
	readonly secrets?: any;
	readonly networkPolicy?: any;
	readonly podSecurityPolicy?: any;
	readonly serviceAccount?: any;
	readonly rbac?: any;
	readonly pvc?: any;
	readonly kedaScaler?: any;
	readonly certManager?: any;
	readonly externalSecrets?: any;
	readonly argoApplication?: any;
	readonly fluxKustomization?: any;
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

			// Generate VPA if enabled
			if (options.enableVPA) {
				await this.generateVPA(options, manifests);
			}

			// Generate PDB if enabled
			if (options.enablePDB) {
				await this.generatePDB(options, manifests);
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

			// Generate KEDA autoscaling if enabled
			if (options.enableKeda) {
				await this.generateKedaScaler(options, manifests);
			}

			// Generate Cert-Manager configuration if enabled
			if (options.enableCertManager) {
				await this.generateCertManager(options);
			}

			// Generate External Secrets if enabled
			if (options.enableExternalSecrets) {
				await this.generateExternalSecrets(options);
			}

			// Generate ArgoCD application if enabled
			if (options.enableArgoCD) {
				await this.generateArgoApplication(options, manifests);
			}

			// Generate FluxCD configuration if enabled
			if (options.enableFluxCD) {
				await this.generateFluxKustomization(options, manifests);
			}

			// Generate tracing configuration if enabled
			if (options.enableTracing) {
				await this.generateTracingConfig(options);
			}

			// Generate multi-cluster configuration if enabled
			if (options.enableMultiCluster) {
				await this.generateMultiClusterConfig(options);
			}

			// Generate Kustomization files
			await this.generateKustomization(options);

			// Generate deployment scripts
			await this.generateDeploymentScripts(options);

			// Generate GitOps workflows
			await this.generateGitOpsWorkflows(options);

			// Generate security policies
			await this.generateSecurityPolicies(options);

			// Generate disaster recovery configuration
			await this.generateDisasterRecovery(options);

			this.logger.success("Kubernetes configuration generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate Kubernetes configuration", error);
			throw error;
		}
	}

	private async validateOptions(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		if (!options.appName) {
			throw new Error("App name is required");
		}

		if (!options.namespace) {
			throw new Error("Namespace is required");
		}

		if (!options.image) {
			throw new Error("Container image is required");
		}

		if (!options.port || options.port < 1 || options.port > 65535) {
			throw new Error("Valid port number is required");
		}

		if (options.replicas < 1) {
			throw new Error("Replicas must be at least 1");
		}
	}

	private async generateManifests(
		options: KubernetesGeneratorOptions,
	): Promise<KubernetesManifests> {
		const commonLabels = {
			app: options.appName,
			version: options.imageTag,
			environment: options.environment,
			...options.labels,
		};

		const commonAnnotations = {
			"deployment.kubernetes.io/revision": "1",
			"kubectl.kubernetes.io/last-applied-configuration": "",
			...options.annotations,
		};

		return {
			deployment: this.createDeploymentManifest(
				options,
				commonLabels,
				commonAnnotations,
			),
			service: this.createServiceManifest(options, commonLabels),
			ingress: options.enableIngress
				? this.createIngressManifest(options, commonLabels)
				: undefined,
			hpa: options.enableHPA
				? this.createHPAManifest(options, commonLabels)
				: undefined,
			vpa: options.enableVPA
				? this.createVPAManifest(options, commonLabels)
				: undefined,
			pdb: options.enablePDB
				? this.createPDBManifest(options, commonLabels)
				: undefined,
			configMap: options.enableConfigMap
				? this.createConfigMapManifest(options, commonLabels)
				: undefined,
			secrets: options.enableSecrets
				? this.createSecretsManifest(options, commonLabels)
				: undefined,
			networkPolicy: options.enableNetworkPolicies
				? this.createNetworkPolicyManifest(options, commonLabels)
				: undefined,
			podSecurityPolicy: options.enablePodSecurityPolicies
				? this.createPodSecurityPolicyManifest(options)
				: undefined,
			serviceAccount: this.createServiceAccountManifest(options, commonLabels),
			rbac: this.createRBACManifest(options, commonLabels),
			pvc: options.storage?.enabled
				? this.createPVCManifest(options, commonLabels)
				: undefined,
			kedaScaler: options.enableKeda
				? this.createKedaScalerManifest(options, commonLabels)
				: undefined,
			certManager: options.enableCertManager
				? this.createCertManagerManifest(options, commonLabels)
				: undefined,
			externalSecrets: options.enableExternalSecrets
				? this.createExternalSecretsManifest(options, commonLabels)
				: undefined,
			argoApplication: options.enableArgoCD
				? this.createArgoApplicationManifest(options, commonLabels)
				: undefined,
			fluxKustomization: options.enableFluxCD
				? this.createFluxKustomizationManifest(options, commonLabels)
				: undefined,
		};
	}

	private createDeploymentManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
		annotations: Record<string, string>,
	): any {
		return {
			apiVersion: "apps/v1",
			kind: "Deployment",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
				annotations,
			},
			spec: {
				replicas: options.replicas,
				selector: {
					matchLabels: {
						app: options.appName,
					},
				},
				template: {
					metadata: {
						labels,
						annotations: {
							...annotations,
							"prometheus.io/scrape": options.enablePrometheus
								? "true"
								: "false",
							"prometheus.io/port": options.port.toString(),
							"prometheus.io/path": "/metrics",
						},
					},
					spec: {
						serviceAccountName: options.appName,
						securityContext: {
							runAsNonRoot: true,
							runAsUser: 1000,
							fsGroup: 2000,
						},
						containers: [
							{
								name: options.appName,
								image: `${options.image}:${options.imageTag}`,
								imagePullPolicy: "Always",
								ports: [
									{
										name: "http",
										containerPort: options.targetPort,
										protocol: "TCP",
									},
								],
								env: this.getEnvironmentVariables(options),
								resources: options.resources,
								livenessProbe: {
									httpGet: {
										path: options.probes.liveness.path,
										port: "http",
									},
									initialDelaySeconds:
										options.probes.liveness.initialDelaySeconds,
									periodSeconds: options.probes.liveness.periodSeconds,
								},
								readinessProbe: {
									httpGet: {
										path: options.probes.readiness.path,
										port: "http",
									},
									initialDelaySeconds:
										options.probes.readiness.initialDelaySeconds,
									periodSeconds: options.probes.readiness.periodSeconds,
								},
								volumeMounts: this.getVolumeMounts(options),
								securityContext: {
									allowPrivilegeEscalation: false,
									readOnlyRootFilesystem: true,
									capabilities: {
										drop: ["ALL"],
									},
								},
							},
						],
						volumes: this.getVolumes(options),
					},
				},
			},
		};
	}

	private createServiceManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "v1",
			kind: "Service",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
				annotations: options.enablePrometheus
					? {
							"prometheus.io/scrape": "true",
							"prometheus.io/port": options.port.toString(),
							"prometheus.io/path": "/metrics",
						}
					: {},
			},
			spec: {
				type: "ClusterIP",
				ports: [
					{
						port: options.port,
						targetPort: "http",
						protocol: "TCP",
						name: "http",
					},
				],
				selector: {
					app: options.appName,
				},
			},
		};
	}

	private createIngressManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "networking.k8s.io/v1",
			kind: "Ingress",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
				annotations: {
					"kubernetes.io/ingress.class": options.ingressClassName || "nginx",
					"nginx.ingress.kubernetes.io/rewrite-target": "/",
					"cert-manager.io/cluster-issuer":
						options.clusterIssuer || "letsencrypt-prod",
					...(options.annotations || {}),
				},
			},
			spec: {
				tls: options.tlsSecretName
					? [
							{
								hosts: [options.hostName],
								secretName: options.tlsSecretName,
							},
						]
					: [],
				rules: [
					{
						host: options.hostName,
						http: {
							paths: [
								{
									path: "/",
									pathType: "Prefix",
									backend: {
										service: {
											name: options.appName,
											port: {
												number: options.port,
											},
										},
									},
								},
							],
						},
					},
				],
			},
		};
	}

	private createHPAManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "autoscaling/v2",
			kind: "HorizontalPodAutoscaler",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
			},
			spec: {
				scaleTargetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: options.appName,
				},
				minReplicas: options.hpa.minReplicas,
				maxReplicas: options.hpa.maxReplicas,
				metrics: [
					{
						type: "Resource",
						resource: {
							name: "cpu",
							target: {
								type: "Utilization",
								averageUtilization: options.hpa.targetCPUUtilization,
							},
						},
					},
					{
						type: "Resource",
						resource: {
							name: "memory",
							target: {
								type: "Utilization",
								averageUtilization: options.hpa.targetMemoryUtilization,
							},
						},
					},
				],
			},
		};
	}

	private createConfigMapManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: {
				name: `${options.appName}-config`,
				namespace: options.namespace,
				labels,
			},
			data: {
				"app.conf": JSON.stringify(
					{
						port: options.port,
						environment: options.environment,
						...options.configMapData,
					},
					null,
					2,
				),
			},
		};
	}

	private createSecretsManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "v1",
			kind: "Secret",
			metadata: {
				name: `${options.appName}-secrets`,
				namespace: options.namespace,
				labels,
			},
			type: "Opaque",
			data: Object.entries(options.secrets || {}).reduce(
				(acc, [key, value]) => {
					acc[key] = Buffer.from(value).toString("base64");
					return acc;
				},
				{} as Record<string, string>,
			),
		};
	}

	private createNetworkPolicyManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "networking.k8s.io/v1",
			kind: "NetworkPolicy",
			metadata: {
				name: `${options.appName}-network-policy`,
				namespace: options.namespace,
				labels,
			},
			spec: {
				podSelector: {
					matchLabels: {
						app: options.appName,
					},
				},
				policyTypes: ["Ingress", "Egress"],
				ingress: [
					{
						from: [
							{
								namespaceSelector: {
									matchLabels: {
										name: options.namespace,
									},
								},
							},
						],
						ports: [
							{
								protocol: "TCP",
								port: options.targetPort,
							},
						],
					},
				],
				egress: [
					{
						to: [],
						ports: [
							{
								protocol: "TCP",
								port: 53,
							},
							{
								protocol: "UDP",
								port: 53,
							},
						],
					},
				],
			},
		};
	}

	private createPodSecurityPolicyManifest(
		options: KubernetesGeneratorOptions,
	): any {
		return {
			apiVersion: "policy/v1beta1",
			kind: "PodSecurityPolicy",
			metadata: {
				name: `${options.appName}-psp`,
			},
			spec: {
				privileged: false,
				allowPrivilegeEscalation: false,
				requiredDropCapabilities: ["ALL"],
				volumes: [
					"configMap",
					"emptyDir",
					"projected",
					"secret",
					"downwardAPI",
					"persistentVolumeClaim",
				],
				runAsUser: {
					rule: "MustRunAsNonRoot",
				},
				seLinux: {
					rule: "RunAsAny",
				},
				fsGroup: {
					rule: "RunAsAny",
				},
			},
		};
	}

	private createServiceAccountManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "v1",
			kind: "ServiceAccount",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
			},
		};
	}

	private createRBACManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			role: {
				apiVersion: "rbac.authorization.k8s.io/v1",
				kind: "Role",
				metadata: {
					name: options.appName,
					namespace: options.namespace,
					labels,
				},
				rules: [
					{
						apiGroups: [""],
						resources: ["pods", "services", "configmaps"],
						verbs: ["get", "list", "watch"],
					},
				],
			},
			roleBinding: {
				apiVersion: "rbac.authorization.k8s.io/v1",
				kind: "RoleBinding",
				metadata: {
					name: options.appName,
					namespace: options.namespace,
					labels,
				},
				subjects: [
					{
						kind: "ServiceAccount",
						name: options.appName,
						namespace: options.namespace,
					},
				],
				roleRef: {
					kind: "Role",
					name: options.appName,
					apiGroup: "rbac.authorization.k8s.io",
				},
			},
		};
	}

	private async generateNamespace(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const namespaceManifest = {
			apiVersion: "v1",
			kind: "Namespace",
			metadata: {
				name: options.namespace,
				labels: {
					name: options.namespace,
					environment: options.environment,
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/namespace.yaml.hbs",
			`k8s/${options.namespace}-namespace.yaml`,
			namespaceManifest,
		);
	}

	private async generateDeployment(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
		projectContext: any,
	): Promise<void> {
		await this.templateManager.renderTemplate(
			"devops/kubernetes/deployment.yaml.hbs",
			`k8s/${options.appName}-deployment.yaml`,
			{
				manifest: manifests.deployment,
				options,
				projectContext,
			},
		);
	}

	private async generateService(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		await this.templateManager.renderTemplate(
			"devops/kubernetes/service.yaml.hbs",
			`k8s/${options.appName}-service.yaml`,
			{
				manifest: manifests.service,
				options,
			},
		);
	}

	private async generateIngress(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.ingress) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/ingress.yaml.hbs",
			`k8s/${options.appName}-ingress.yaml`,
			{
				manifest: manifests.ingress,
				options,
			},
		);
	}

	private async generateHPA(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.hpa) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/hpa.yaml.hbs",
			`k8s/${options.appName}-hpa.yaml`,
			{
				manifest: manifests.hpa,
				options,
			},
		);
	}

	private async generateConfigMap(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.configMap) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/configmap.yaml.hbs",
			`k8s/${options.appName}-configmap.yaml`,
			{
				manifest: manifests.configMap,
				options,
			},
		);
	}

	private async generateSecrets(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.secrets) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/secrets.yaml.hbs",
			`k8s/${options.appName}-secrets.yaml`,
			{
				manifest: manifests.secrets,
				options,
			},
		);
	}

	private async generateNetworkPolicy(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const networkPolicy = this.createNetworkPolicyManifest(options, {});

		await this.templateManager.renderTemplate(
			"devops/kubernetes/network-policy.yaml.hbs",
			`k8s/${options.appName}-network-policy.yaml`,
			{
				manifest: networkPolicy,
				options,
			},
		);
	}

	private async generatePodSecurityPolicy(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const psp = this.createPodSecurityPolicyManifest(options);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/pod-security-policy.yaml.hbs",
			`k8s/${options.appName}-psp.yaml`,
			{
				manifest: psp,
				options,
			},
		);
	}

	private async generateServiceMesh(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		// Generate Istio configuration
		const virtualService = {
			apiVersion: "networking.istio.io/v1beta1",
			kind: "VirtualService",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
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
										number: options.port,
									},
								},
							},
						],
					},
				],
			},
		};

		const destinationRule = {
			apiVersion: "networking.istio.io/v1beta1",
			kind: "DestinationRule",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
			},
			spec: {
				host: options.appName,
				trafficPolicy: {
					tls: {
						mode: "ISTIO_MUTUAL",
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/istio/virtual-service.yaml.hbs",
			`k8s/istio/${options.appName}-virtual-service.yaml`,
			{ manifest: virtualService, options },
		);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/istio/destination-rule.yaml.hbs",
			`k8s/istio/${options.appName}-destination-rule.yaml`,
			{ manifest: destinationRule, options },
		);
	}

	private async generateMonitoring(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const serviceMonitor = {
			apiVersion: "monitoring.coreos.com/v1",
			kind: "ServiceMonitor",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels: {
					app: options.appName,
				},
			},
			spec: {
				selector: {
					matchLabels: {
						app: options.appName,
					},
				},
				endpoints: [
					{
						port: "http",
						path: "/metrics",
						interval: "30s",
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/monitoring/service-monitor.yaml.hbs",
			`k8s/monitoring/${options.appName}-service-monitor.yaml`,
			{ manifest: serviceMonitor, options },
		);
	}

	private async generateLogging(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const fluentdConfig = {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: {
				name: `${options.appName}-fluentd-config`,
				namespace: options.namespace,
			},
			data: {
				"fluent.conf": `
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
        `,
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/logging/fluentd-config.yaml.hbs",
			`k8s/logging/${options.appName}-fluentd-config.yaml`,
			{ manifest: fluentdConfig, options },
		);
	}

	private async generateHelmChart(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		// Generate Chart.yaml
		const chartYaml = {
			apiVersion: "v2",
			name: options.appName,
			description: `Helm chart for ${options.appName}`,
			type: "application",
			version: "0.1.0",
			appVersion: options.imageTag,
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/helm/Chart.yaml.hbs",
			`helm/${options.appName}/Chart.yaml`,
			chartYaml,
		);

		// Generate values.yaml
		const valuesYaml = {
			replicaCount: options.replicas,
			image: {
				repository: options.image.split(":")[0],
				tag: options.imageTag,
				pullPolicy: "Always",
			},
			service: {
				type: "ClusterIP",
				port: options.port,
			},
			ingress: {
				enabled: options.enableIngress,
				className: options.ingressClassName || "nginx",
				annotations: options.annotations || {},
				hosts: options.hostName
					? [
							{
								host: options.hostName,
								paths: [{ path: "/", pathType: "Prefix" }],
							},
						]
					: [],
				tls: options.tlsSecretName
					? [{ secretName: options.tlsSecretName, hosts: [options.hostName] }]
					: [],
			},
			resources: options.resources,
			autoscaling: {
				enabled: options.enableHPA,
				minReplicas: options.hpa.minReplicas,
				maxReplicas: options.hpa.maxReplicas,
				targetCPUUtilizationPercentage: options.hpa.targetCPUUtilization,
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/helm/values.yaml.hbs",
			`helm/${options.appName}/values.yaml`,
			valuesYaml,
		);

		// Generate templates
		const templateData = { manifests, options };

		await this.templateManager.renderTemplate(
			"devops/kubernetes/helm/templates/deployment.yaml.hbs",
			`helm/${options.appName}/templates/deployment.yaml`,
			templateData,
		);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/helm/templates/service.yaml.hbs",
			`helm/${options.appName}/templates/service.yaml`,
			templateData,
		);
	}

	private async generateKustomization(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const kustomization = {
			apiVersion: "kustomize.config.k8s.io/v1beta1",
			kind: "Kustomization",
			resources: [
				`${options.namespace}-namespace.yaml`,
				`${options.appName}-deployment.yaml`,
				`${options.appName}-service.yaml`,
			],
			commonLabels: {
				app: options.appName,
				version: options.imageTag,
			},
			images: [
				{
					name: options.image.split(":")[0],
					newTag: options.imageTag,
				},
			],
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
			"devops/kubernetes/kustomization.yaml.hbs",
			"k8s/kustomization.yaml",
			kustomization,
		);
	}

	private async generateDeploymentScripts(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
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
			"devops/kubernetes/scripts/deploy.sh.hbs",
			"scripts/k8s-deploy.sh",
			{ script: deployScript, executable: true },
		);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/scripts/undeploy.sh.hbs",
			"scripts/k8s-undeploy.sh",
			{ script: undeployScript, executable: true },
		);
	}

	private getEnvironmentVariables(options: KubernetesGeneratorOptions): any[] {
		const baseEnv = [
			{
				name: "NODE_ENV",
				value: options.environment,
			},
			{
				name: "PORT",
				value: options.targetPort.toString(),
			},
		];

		if (options.enableConfigMap) {
			baseEnv.push({
				name: "CONFIG_PATH",
				valueFrom: {
					configMapKeyRef: {
						name: `${options.appName}-config`,
						key: "app.conf",
					},
				},
			});
		}

		if (options.enableSecrets) {
			baseEnv.push({
				name: "DATABASE_URL",
				valueFrom: {
					secretKeyRef: {
						name: `${options.appName}-secrets`,
						key: "database-url",
					},
				},
			});
		}

		return baseEnv;
	}

	private getVolumeMounts(options: KubernetesGeneratorOptions): any[] {
		const mounts = [
			{
				name: "tmp",
				mountPath: "/tmp",
			},
		];

		if (options.storage?.enabled) {
			mounts.push({
				name: "data",
				mountPath: "/app/data",
			});
		}

		if (options.enableConfigMap) {
			mounts.push({
				name: "config",
				mountPath: "/app/config",
			});
		}

		return mounts;
	}

	private getVolumes(options: KubernetesGeneratorOptions): any[] {
		const volumes = [
			{
				name: "tmp",
				emptyDir: {},
			},
		];

		if (options.storage?.enabled) {
			volumes.push({
				name: "data",
				persistentVolumeClaim: {
					claimName: `${options.appName}-pvc`,
				},
			});
		}

		if (options.enableConfigMap) {
			volumes.push({
				name: "config",
				configMap: {
					name: `${options.appName}-config`,
				},
			});
		}

		return volumes;
	}

	/**
	 * Generate VPA (Vertical Pod Autoscaler) manifest
	 */
	private async generateVPA(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.vpa) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/vpa.yaml.hbs",
			`k8s/${options.appName}-vpa.yaml`,
			{
				manifest: manifests.vpa,
				options,
			},
		);
	}

	/**
	 * Generate PDB (Pod Disruption Budget) manifest
	 */
	private async generatePDB(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.pdb) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/pdb.yaml.hbs",
			`k8s/${options.appName}-pdb.yaml`,
			{
				manifest: manifests.pdb,
				options,
			},
		);
	}

	/**
	 * Generate KEDA ScaledObject
	 */
	private async generateKedaScaler(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.kedaScaler) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/keda/scaledobject.yaml.hbs",
			`k8s/keda/${options.appName}-scaledobject.yaml`,
			{
				manifest: manifests.kedaScaler,
				options,
			},
		);
	}

	/**
	 * Generate Cert-Manager Certificate
	 */
	private async generateCertManager(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const certificate = {
			apiVersion: "cert-manager.io/v1",
			kind: "Certificate",
			metadata: {
				name: `${options.appName}-tls`,
				namespace: options.namespace,
			},
			spec: {
				secretName: options.tlsSecretName || `${options.appName}-tls`,
				issuerRef: {
					name: options.clusterIssuer || "letsencrypt-prod",
					kind: "ClusterIssuer",
				},
				dnsNames: [options.hostName || `${options.appName}.example.com`],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/cert-manager/certificate.yaml.hbs",
			`k8s/cert-manager/${options.appName}-certificate.yaml`,
			{ manifest: certificate, options },
		);

		// Generate ClusterIssuer
		const clusterIssuer = {
			apiVersion: "cert-manager.io/v1",
			kind: "ClusterIssuer",
			metadata: {
				name: options.clusterIssuer || "letsencrypt-prod",
			},
			spec: {
				acme: {
					server: "https://acme-v02.api.letsencrypt.org/directory",
					email: "${ACME_EMAIL}",
					privateKeySecretRef: {
						name: "letsencrypt-prod",
					},
					solvers: [
						{
							http01: {
								ingress: {
									class: options.ingressClassName || "nginx",
								},
							},
						},
					],
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/cert-manager/cluster-issuer.yaml.hbs",
			`k8s/cert-manager/cluster-issuer.yaml`,
			{ manifest: clusterIssuer, options },
		);
	}

	/**
	 * Generate External Secrets configuration
	 */
	private async generateExternalSecrets(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const secretStore = {
			apiVersion: "external-secrets.io/v1beta1",
			kind: "SecretStore",
			metadata: {
				name: `${options.appName}-secret-store`,
				namespace: options.namespace,
			},
			spec: {
				provider: {
					aws: {
						service: "SecretsManager",
						region: "${AWS_REGION}",
						auth: {
							secretRef: {
								accessKeyID: {
									name: "aws-secret",
									key: "access-key-id",
								},
								secretAccessKey: {
									name: "aws-secret",
									key: "secret-access-key",
								},
							},
						},
					},
				},
			},
		};

		const externalSecret = {
			apiVersion: "external-secrets.io/v1beta1",
			kind: "ExternalSecret",
			metadata: {
				name: `${options.appName}-external-secret`,
				namespace: options.namespace,
			},
			spec: {
				refreshInterval: "1h",
				secretStoreRef: {
					name: `${options.appName}-secret-store`,
					kind: "SecretStore",
				},
				target: {
					name: `${options.appName}-secrets`,
					creationPolicy: "Owner",
				},
				data: [
					{
						secretKey: "database-url",
						remoteRef: {
							key: `${options.appName}/database-url`,
						},
					},
					{
						secretKey: "api-key",
						remoteRef: {
							key: `${options.appName}/api-key`,
						},
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/external-secrets/secret-store.yaml.hbs",
			`k8s/external-secrets/${options.appName}-secret-store.yaml`,
			{ manifest: secretStore, options },
		);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/external-secrets/external-secret.yaml.hbs",
			`k8s/external-secrets/${options.appName}-external-secret.yaml`,
			{ manifest: externalSecret, options },
		);
	}

	/**
	 * Generate ArgoCD Application
	 */
	private async generateArgoApplication(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.argoApplication) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/argocd/application.yaml.hbs",
			`argocd/${options.appName}-application.yaml`,
			{
				manifest: manifests.argoApplication,
				options,
			},
		);

		// Generate ArgoCD AppProject
		const appProject = {
			apiVersion: "argoproj.io/v1alpha1",
			kind: "AppProject",
			metadata: {
				name: options.appName,
				namespace: "argocd",
			},
			spec: {
				description: `Project for ${options.appName}`,
				sourceRepos: ["*"],
				destinations: [
					{
						namespace: options.namespace,
						server: "https://kubernetes.default.svc",
					},
				],
				clusterResourceWhitelist: [
					{
						group: "",
						kind: "Namespace",
					},
				],
				namespaceResourceWhitelist: [
					{
						group: "",
						kind: "*",
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/argocd/appproject.yaml.hbs",
			`argocd/${options.appName}-appproject.yaml`,
			{ manifest: appProject, options },
		);
	}

	/**
	 * Generate FluxCD Kustomization
	 */
	private async generateFluxKustomization(
		options: KubernetesGeneratorOptions,
		manifests: KubernetesManifests,
	): Promise<void> {
		if (!manifests.fluxKustomization) return;

		await this.templateManager.renderTemplate(
			"devops/kubernetes/flux/kustomization.yaml.hbs",
			`flux/${options.appName}-kustomization.yaml`,
			{
				manifest: manifests.fluxKustomization,
				options,
			},
		);

		// Generate Flux GitRepository
		const gitRepository = {
			apiVersion: "source.toolkit.fluxcd.io/v1beta2",
			kind: "GitRepository",
			metadata: {
				name: options.appName,
				namespace: "flux-system",
			},
			spec: {
				interval: "1m",
				url: "${GIT_REPOSITORY_URL}",
				ref: {
					branch: "main",
				},
				secretRef: {
					name: "git-credentials",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/flux/gitrepository.yaml.hbs",
			`flux/${options.appName}-gitrepository.yaml`,
			{ manifest: gitRepository, options },
		);
	}

	/**
	 * Generate tracing configuration
	 */
	private async generateTracingConfig(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const jaegerConfig = {
			apiVersion: "jaegertracing.io/v1",
			kind: "Jaeger",
			metadata: {
				name: "jaeger",
				namespace: options.namespace,
			},
			spec: {
				strategy: "production",
				storage: {
					type: "elasticsearch",
					elasticsearch: {
						nodeCount: 3,
						storage: {
							size: "10Gi",
						},
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/tracing/jaeger.yaml.hbs",
			`k8s/tracing/jaeger.yaml`,
			{ manifest: jaegerConfig, options },
		);

		// Generate OpenTelemetry Collector
		const otelCollector = {
			apiVersion: "opentelemetry.io/v1alpha1",
			kind: "OpenTelemetryCollector",
			metadata: {
				name: "otel-collector",
				namespace: options.namespace,
			},
			spec: {
				config: `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  jaeger:
    endpoint: jaeger-collector:14250
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
        `,
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/tracing/otel-collector.yaml.hbs",
			`k8s/tracing/otel-collector.yaml`,
			{ manifest: otelCollector, options },
		);
	}

	/**
	 * Generate multi-cluster configuration
	 */
	private async generateMultiClusterConfig(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const admiraltyConfig = {
			apiVersion: "multicluster.admiralty.io/v1alpha1",
			kind: "MultiClusterService",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
			},
			spec: {
				template: {
					metadata: {
						labels: {
							app: options.appName,
							"multicluster.admiralty.io/clusterset": "default",
						},
					},
					spec: {
						containers: [
							{
								name: options.appName,
								image: `${options.image}:${options.imageTag}`,
							},
						],
					},
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/multicluster/multicluster-service.yaml.hbs",
			`k8s/multicluster/${options.appName}-multicluster-service.yaml`,
			{ manifest: admiraltyConfig, options },
		);

		// Generate Cluster Role for cross-cluster access
		const clusterRole = {
			apiVersion: "rbac.authorization.k8s.io/v1",
			kind: "ClusterRole",
			metadata: {
				name: `${options.appName}-multicluster`,
			},
			rules: [
				{
					apiGroups: [""],
					resources: ["pods", "services"],
					verbs: ["get", "list", "watch"],
				},
				{
					apiGroups: ["multicluster.admiralty.io"],
					resources: ["*"],
					verbs: ["*"],
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/multicluster/cluster-role.yaml.hbs",
			`k8s/multicluster/cluster-role.yaml`,
			{ manifest: clusterRole, options },
		);
	}

	/**
	 * Generate GitOps workflows
	 */
	private async generateGitOpsWorkflows(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const workflowConfig = {
			name: `${options.appName}-gitops`,
			trigger: {
				push: {
					branches: ["main", "develop"],
					paths: [`apps/${options.appName}/**`],
				},
				pullRequest: {
					branches: ["main"],
				},
			},
			jobs: {
				validate: {
					steps: [
						"Validate YAML syntax",
						"Run security scans",
						"Validate resource limits",
						"Check naming conventions",
					],
				},
				deploy: {
					environment: options.environment,
					steps: [
						"Deploy to staging",
						"Run integration tests",
						"Deploy to production",
						"Verify deployment",
					],
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/gitops/github-workflow.yml.hbs",
			`.github/workflows/${options.appName}-gitops.yml`,
			workflowConfig,
		);

		await this.templateManager.renderTemplate(
			"devops/kubernetes/gitops/gitlab-ci.yml.hbs",
			`.gitlab-ci.yml`,
			workflowConfig,
		);
	}

	/**
	 * Generate security policies
	 */
	private async generateSecurityPolicies(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		// Generate OPA Gatekeeper policies
		const constraintTemplate = {
			apiVersion: "templates.gatekeeper.sh/v1beta1",
			kind: "ConstraintTemplate",
			metadata: {
				name: "k8srequiredlabels",
			},
			spec: {
				crd: {
					spec: {
						names: {
							kind: "K8sRequiredLabels",
						},
						validation: {
							properties: {
								labels: {
									type: "array",
									items: { type: "string" },
								},
							},
						},
					},
				},
				targets: [
					{
						target: "admission.k8s.gatekeeper.sh",
						rego: `
package k8srequiredlabels

violation[{"msg": msg}] {
  required := input.parameters.labels
  provided := input.review.object.metadata.labels
  missing := required[_]
  not provided[missing]
  msg := sprintf("Missing required label: %v", [missing])
}
            `,
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/security/constraint-template.yaml.hbs",
			`k8s/security/constraint-template.yaml`,
			{ manifest: constraintTemplate, options },
		);

		// Generate Falco rules
		const falcoRules = {
			customRules: `
- rule: Suspicious Activity in ${options.appName}
  desc: Detect suspicious activity in ${options.appName} containers
  condition: >
    container.name="${options.appName}" and
    (proc.name in (nc, ncat, netcat, telnet, wget, curl) or
     (proc.name=bash and proc.args contains "-i"))
  output: >
    Suspicious activity in ${options.appName} container 
    (command=%proc.cmdline container=%container.name)
  priority: WARNING
  tags: [container, ${options.appName}]
      `,
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/security/falco-rules.yaml.hbs",
			`k8s/security/falco-rules.yaml`,
			falcoRules,
		);
	}

	/**
	 * Generate disaster recovery configuration
	 */
	private async generateDisasterRecovery(
		options: KubernetesGeneratorOptions,
	): Promise<void> {
		const veleroConfig = {
			apiVersion: "velero.io/v1",
			kind: "Schedule",
			metadata: {
				name: `${options.appName}-backup`,
				namespace: "velero",
			},
			spec: {
				schedule: "0 2 * * *",
				template: {
					includedNamespaces: [options.namespace],
					labelSelector: {
						matchLabels: {
							app: options.appName,
						},
					},
					storageLocation: "default",
					ttl: "720h0m0s",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/disaster-recovery/velero-schedule.yaml.hbs",
			`k8s/disaster-recovery/${options.appName}-backup-schedule.yaml`,
			{ manifest: veleroConfig, options },
		);

		// Generate disaster recovery runbook
		const runbook = {
			title: `Disaster Recovery Runbook for ${options.appName}`,
			procedures: [
				{
					name: "Backup Verification",
					steps: [
						"Check backup status",
						"Verify backup integrity",
						"Test restore procedure",
					],
				},
				{
					name: "Failover Procedure",
					steps: [
						"Switch DNS to backup cluster",
						"Restore from backup",
						"Verify application functionality",
						"Monitor system health",
					],
				},
				{
					name: "Recovery Procedure",
					steps: [
						"Assess damage",
						"Restore from latest backup",
						"Verify data integrity",
						"Resume normal operations",
					],
				},
			],
		};

		await this.templateManager.renderTemplate(
			"devops/kubernetes/disaster-recovery/runbook.md.hbs",
			`docs/disaster-recovery-runbook.md`,
			runbook,
		);
	}

	// Create the new manifest methods
	private createVPAManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "autoscaling.k8s.io/v1",
			kind: "VerticalPodAutoscaler",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
			},
			spec: {
				targetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: options.appName,
				},
				updatePolicy: {
					updateMode: "Auto",
				},
				resourcePolicy: {
					containerPolicies: [
						{
							containerName: options.appName,
							minAllowed: {
								cpu: "100m",
								memory: "128Mi",
							},
							maxAllowed: {
								cpu: "2",
								memory: "2Gi",
							},
						},
					],
				},
			},
		};
	}

	private createPDBManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "policy/v1",
			kind: "PodDisruptionBudget",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
			},
			spec: {
				minAvailable: Math.floor(options.replicas * 0.5),
				selector: {
					matchLabels: {
						app: options.appName,
					},
				},
			},
		};
	}

	private createPVCManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "v1",
			kind: "PersistentVolumeClaim",
			metadata: {
				name: `${options.appName}-pvc`,
				namespace: options.namespace,
				labels,
			},
			spec: {
				accessModes: [options.storage?.accessMode || "ReadWriteOnce"],
				resources: {
					requests: {
						storage: options.storage?.size || "10Gi",
					},
				},
				storageClassName: options.storage?.storageClass || "standard",
			},
		};
	}

	private createKedaScalerManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "keda.sh/v1alpha1",
			kind: "ScaledObject",
			metadata: {
				name: options.appName,
				namespace: options.namespace,
				labels,
			},
			spec: {
				scaleTargetRef: {
					name: options.appName,
				},
				minReplicaCount: options.hpa.minReplicas,
				maxReplicaCount: options.hpa.maxReplicas,
				triggers: [
					{
						type: "prometheus",
						metadata: {
							serverAddress: "http://prometheus:9090",
							metricName: "http_requests_per_second",
							threshold: "10",
							query: `rate(http_requests_total{job="${options.appName}"}[1m])`,
						},
					},
				],
			},
		};
	}

	private createCertManagerManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "cert-manager.io/v1",
			kind: "Certificate",
			metadata: {
				name: `${options.appName}-tls`,
				namespace: options.namespace,
				labels,
			},
			spec: {
				secretName: options.tlsSecretName || `${options.appName}-tls`,
				issuerRef: {
					name: options.clusterIssuer || "letsencrypt-prod",
					kind: "ClusterIssuer",
				},
				dnsNames: [options.hostName || `${options.appName}.example.com`],
			},
		};
	}

	private createExternalSecretsManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "external-secrets.io/v1beta1",
			kind: "ExternalSecret",
			metadata: {
				name: `${options.appName}-external-secret`,
				namespace: options.namespace,
				labels,
			},
			spec: {
				refreshInterval: "1h",
				secretStoreRef: {
					name: `${options.appName}-secret-store`,
					kind: "SecretStore",
				},
				target: {
					name: `${options.appName}-secrets`,
					creationPolicy: "Owner",
				},
				data: [
					{
						secretKey: "database-url",
						remoteRef: {
							key: `${options.appName}/database-url`,
						},
					},
				],
			},
		};
	}

	private createArgoApplicationManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "argoproj.io/v1alpha1",
			kind: "Application",
			metadata: {
				name: options.appName,
				namespace: "argocd",
				labels,
			},
			spec: {
				project: options.appName,
				source: {
					repoURL: "${GIT_REPOSITORY_URL}",
					targetRevision: "HEAD",
					path: `k8s`,
					kustomize: {
						images: [`${options.image}:${options.imageTag}`],
					},
				},
				destination: {
					server: "https://kubernetes.default.svc",
					namespace: options.namespace,
				},
				syncPolicy: {
					automated: {
						prune: true,
						selfHeal: true,
					},
					syncOptions: ["CreateNamespace=true"],
				},
			},
		};
	}

	private createFluxKustomizationManifest(
		options: KubernetesGeneratorOptions,
		labels: Record<string, string>,
	): any {
		return {
			apiVersion: "kustomize.toolkit.fluxcd.io/v1beta2",
			kind: "Kustomization",
			metadata: {
				name: options.appName,
				namespace: "flux-system",
				labels,
			},
			spec: {
				interval: "1m",
				sourceRef: {
					kind: "GitRepository",
					name: options.appName,
				},
				path: "./k8s",
				prune: true,
				targetNamespace: options.namespace,
			},
		};
	}
}

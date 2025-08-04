import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
export class HelmGenerator extends BaseGenerator {
	templateManager;
	analyzer;
	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}
	async generate(options) {
		try {
			await this.validateOptions(options);
			const projectContext = await this.analyzer.analyze(process.cwd());
			// Create Helm chart directory structure
			await this.createChartStructure(options);
			// Generate Chart.yaml
			await this.generateChartYaml(options);
			// Generate values.yaml
			await this.generateValuesYaml(options, projectContext);
			// Generate values schema
			await this.generateValuesSchema(options);
			// Generate template files
			await this.generateTemplates(options);
			// Generate helper templates
			await this.generateHelpers(options);
			// Generate NOTES.txt
			await this.generateNotes(options);
			// Generate hooks if specified
			if (options.hooks && options.hooks.length > 0) {
				await this.generateHooks(options);
			}
			// Generate tests if specified
			if (options.tests && options.tests.length > 0) {
				await this.generateTests(options);
			}
			// Generate environment-specific values files
			await this.generateEnvironmentValues(options);
			// Generate deployment scripts
			await this.generateDeploymentScripts(options);
			// Generate CI/CD pipeline configurations
			await this.generateCIPipelines(options);
			// Generate monitoring and observability
			if (options.monitoring?.enabled) {
				await this.generateMonitoring(options);
			}
			// Generate backup configuration
			if (options.backup?.enabled) {
				await this.generateBackup(options);
			}
			// Generate security policies
			if (options.security?.enabled) {
				await this.generateSecurity(options);
			}
			// Generate README.md
			await this.generateReadme(options);
			this.logger.success("Helm chart generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate Helm chart", error);
			throw error;
		}
	}
	async validateOptions(options) {
		if (!options.chartName) {
			throw new Error("Chart name is required");
		}
		if (!options.chartVersion) {
			throw new Error("Chart version is required");
		}
		if (!options.appVersion) {
			throw new Error("App version is required");
		}
		if (!options.image?.repository) {
			throw new Error("Image repository is required");
		}
		if (!options.service?.port) {
			throw new Error("Service port is required");
		}
		// Validate semantic versioning
		const semverRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		if (!semverRegex.test(options.chartVersion)) {
			throw new Error("Chart version must follow semantic versioning");
		}
	}
	async createChartStructure(options) {
		const directories = [
			`helm/${options.chartName}`,
			`helm/${options.chartName}/templates`,
			`helm/${options.chartName}/templates/tests`,
			`helm/${options.chartName}/charts`,
			`helm/${options.chartName}/crds`,
			`helm/${options.chartName}/values`,
			`helm/${options.chartName}/ci`,
		];
		for (const dir of directories) {
			await this.templateManager.renderTemplate(
				"devops/helm/structure/.gitkeep.hbs",
				`${dir}/.gitkeep`,
				{},
			);
		}
	}
	async generateChartYaml(options) {
		const chartData = {
			apiVersion: options.apiVersion,
			name: options.chartName,
			description: options.description,
			type: options.type,
			version: options.chartVersion,
			appVersion: options.appVersion,
			keywords: options.keywords,
			home: options.home,
			sources: options.sources,
			dependencies: options.dependencies,
			maintainers: options.maintainers,
			icon: `https://raw.githubusercontent.com/helm/helm-www/main/static/img/helm.png`,
			annotations: {
				category: "Application",
				licenses: "MIT",
				...options.annotations,
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/Chart.yaml.hbs",
			`helm/${options.chartName}/Chart.yaml`,
			chartData,
		);
	}
	async generateValuesYaml(options, projectContext) {
		const values = {
			// Global values
			global: {
				imageRegistry: "",
				imagePullSecrets: [],
				storageClass: "",
			},
			// Application configuration
			nameOverride: "",
			fullnameOverride: "",
			// Image configuration
			image: {
				registry: "docker.io",
				repository: options.image.repository,
				tag: options.image.tag,
				digest: "",
				pullPolicy: options.image.pullPolicy,
				pullSecrets: [],
			},
			// Deployment configuration
			replicaCount: 1,
			strategy: {
				type: "RollingUpdate",
				rollingUpdate: {
					maxUnavailable: "25%",
					maxSurge: "25%",
				},
			},
			// Pod configuration
			podAnnotations: {},
			podLabels: options.labels || {},
			podSecurityContext: options.security?.enabled
				? {
						runAsNonRoot: options.security.runAsNonRoot ?? true,
						runAsUser: options.security.runAsUser ?? 1000,
						runAsGroup: options.security.runAsGroup ?? 3000,
						fsGroup: options.security.fsGroup ?? 2000,
					}
				: {},
			securityContext: options.security?.enabled
				? {
						allowPrivilegeEscalation:
							options.security.allowPrivilegeEscalation ?? false,
						readOnlyRootFilesystem:
							options.security.readOnlyRootFilesystem ?? true,
						runAsNonRoot: options.security.runAsNonRoot ?? true,
						runAsUser: options.security.runAsUser ?? 1000,
						capabilities: {
							drop: options.security.capabilities?.drop ?? ["ALL"],
							add: options.security.capabilities?.add ?? [],
						},
					}
				: {},
			// Service configuration
			service: {
				type: options.service.type,
				port: options.service.port,
				targetPort: options.service.targetPort || options.service.port,
				protocol: options.service.protocol || "TCP",
				annotations: {},
				labels: {},
			},
			// Ingress configuration
			ingress: {
				enabled: options.ingress?.enabled ?? false,
				className: options.ingress?.className || "nginx",
				annotations: {
					"nginx.ingress.kubernetes.io/rewrite-target": "/",
					"cert-manager.io/cluster-issuer": "letsencrypt-prod",
					...options.ingress?.annotations,
				},
				hosts: options.ingress?.hosts || [
					{
						host: `${options.chartName}.example.com`,
						paths: [
							{
								path: "/",
								pathType: "Prefix",
							},
						],
					},
				],
				tls: options.ingress?.tls || [],
			},
			// Resource configuration
			resources: options.resources || {
				limits: {
					cpu: "500m",
					memory: "512Mi",
				},
				requests: {
					cpu: "250m",
					memory: "256Mi",
				},
			},
			// Lifecycle configuration
			livenessProbe: {
				httpGet: {
					path: "/health",
					port: "http",
				},
				initialDelaySeconds: 30,
				periodSeconds: 10,
				timeoutSeconds: 5,
				failureThreshold: 6,
				successThreshold: 1,
			},
			readinessProbe: {
				httpGet: {
					path: "/ready",
					port: "http",
				},
				initialDelaySeconds: 5,
				periodSeconds: 10,
				timeoutSeconds: 5,
				failureThreshold: 6,
				successThreshold: 1,
			},
			startupProbe: {
				httpGet: {
					path: "/startup",
					port: "http",
				},
				initialDelaySeconds: 10,
				periodSeconds: 10,
				timeoutSeconds: 5,
				failureThreshold: 30,
				successThreshold: 1,
			},
			// Autoscaling configuration
			autoscaling: {
				enabled: options.autoscaling?.enabled ?? false,
				minReplicas: options.autoscaling?.minReplicas ?? 1,
				maxReplicas: options.autoscaling?.maxReplicas ?? 100,
				targetCPUUtilizationPercentage:
					options.autoscaling?.targetCPUUtilizationPercentage ?? 80,
				targetMemoryUtilizationPercentage:
					options.autoscaling?.targetMemoryUtilizationPercentage,
			},
			// Persistence configuration
			persistence: {
				enabled: options.persistence?.enabled ?? false,
				storageClass: options.persistence?.storageClass || "standard",
				accessModes: [options.persistence?.accessMode || "ReadWriteOnce"],
				size: options.persistence?.size || "10Gi",
				annotations: options.persistence?.annotations || {},
				selector: {},
			},
			// Volume mounts
			volumeMounts: [],
			volumes: [],
			// Node selection
			nodeSelector: {},
			tolerations: [],
			affinity: {},
			topologySpreadConstraints: [],
			// Service account
			serviceAccount: {
				create: true,
				automount: true,
				annotations: {},
				name: "",
			},
			// RBAC
			rbac: {
				create: true,
				rules: [],
			},
			// Pod disruption budget
			podDisruptionBudget: {
				enabled: false,
				minAvailable: 1,
				maxUnavailable: "",
			},
			// Network policy
			networkPolicy: {
				enabled: false,
				ingress: [],
				egress: [],
			},
			// Monitoring
			metrics: {
				enabled: options.monitoring?.enabled ?? false,
				serviceMonitor: {
					enabled: options.monitoring?.serviceMonitor ?? false,
					namespace: "",
					interval: "30s",
					scrapeTimeout: "10s",
				},
				prometheusRule: {
					enabled: options.monitoring?.prometheusRule ?? false,
					namespace: "",
					rules: [],
				},
			},
			// Custom values from options
			...this.transformHelmValues(options.values),
		};
		await this.templateManager.renderTemplate(
			"devops/helm/values.yaml.hbs",
			`helm/${options.chartName}/values.yaml`,
			values,
		);
	}
	async generateValuesSchema(options) {
		const schema = {
			$schema: "https://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				global: {
					type: "object",
					properties: {
						imageRegistry: { type: "string" },
						imagePullSecrets: { type: "array", items: { type: "string" } },
						storageClass: { type: "string" },
					},
				},
				nameOverride: { type: "string" },
				fullnameOverride: { type: "string" },
				image: {
					type: "object",
					properties: {
						registry: { type: "string" },
						repository: { type: "string" },
						tag: { type: "string" },
						digest: { type: "string" },
						pullPolicy: {
							type: "string",
							enum: ["Always", "IfNotPresent", "Never"],
						},
						pullSecrets: { type: "array", items: { type: "string" } },
					},
					required: ["repository", "tag"],
				},
				replicaCount: { type: "integer", minimum: 1 },
				service: {
					type: "object",
					properties: {
						type: {
							type: "string",
							enum: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"],
						},
						port: { type: "integer", minimum: 1, maximum: 65535 },
						targetPort: { type: "integer", minimum: 1, maximum: 65535 },
						protocol: { type: "string", enum: ["TCP", "UDP"] },
					},
					required: ["type", "port"],
				},
				resources: {
					type: "object",
					properties: {
						limits: {
							type: "object",
							properties: {
								cpu: { type: "string" },
								memory: { type: "string" },
							},
						},
						requests: {
							type: "object",
							properties: {
								cpu: { type: "string" },
								memory: { type: "string" },
							},
						},
					},
				},
				autoscaling: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						minReplicas: { type: "integer", minimum: 1 },
						maxReplicas: { type: "integer", minimum: 1 },
						targetCPUUtilizationPercentage: {
							type: "integer",
							minimum: 1,
							maximum: 100,
						},
						targetMemoryUtilizationPercentage: {
							type: "integer",
							minimum: 1,
							maximum: 100,
						},
					},
				},
			},
			required: ["image", "service"],
		};
		await this.templateManager.renderTemplate(
			"devops/helm/values.schema.json.hbs",
			`helm/${options.chartName}/values.schema.json`,
			schema,
		);
	}
	async generateTemplates(options) {
		const templates = [
			"deployment.yaml",
			"service.yaml",
			"serviceaccount.yaml",
			"configmap.yaml",
			"secret.yaml",
		];
		// Generate conditional templates
		if (options.ingress?.enabled) {
			templates.push("ingress.yaml");
		}
		if (options.autoscaling?.enabled) {
			templates.push("hpa.yaml");
		}
		if (options.persistence?.enabled) {
			templates.push("pvc.yaml");
		}
		if (options.monitoring?.serviceMonitor) {
			templates.push("servicemonitor.yaml");
		}
		if (options.monitoring?.prometheusRule) {
			templates.push("prometheusrule.yaml");
		}
		for (const template of templates) {
			await this.templateManager.renderTemplate(
				`devops/helm/templates/${template}.hbs`,
				`helm/${options.chartName}/templates/${template}`,
				{
					options,
					chartName: options.chartName,
					namespace: options.namespace,
					labels: options.labels,
					annotations: options.annotations,
				},
			);
		}
		// Generate RBAC templates
		await this.templateManager.renderTemplate(
			"devops/helm/templates/rbac.yaml.hbs",
			`helm/${options.chartName}/templates/rbac.yaml`,
			{ options },
		);
		// Generate Network Policy if needed
		await this.templateManager.renderTemplate(
			"devops/helm/templates/networkpolicy.yaml.hbs",
			`helm/${options.chartName}/templates/networkpolicy.yaml`,
			{ options },
		);
		// Generate Pod Disruption Budget
		await this.templateManager.renderTemplate(
			"devops/helm/templates/poddisruptionbudget.yaml.hbs",
			`helm/${options.chartName}/templates/poddisruptionbudget.yaml`,
			{ options },
		);
	}
	async generateHelpers(options) {
		const helpers = {
			chartName: options.chartName,
			templates: {
				name: `{{- define "${options.chartName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}`,
				fullname: `{{- define "${options.chartName}.fullname" -}}
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
{{- end }}`,
				chart: `{{- define "${options.chartName}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}`,
				labels: `{{- define "${options.chartName}.labels" -}}
helm.sh/chart: {{ include "${options.chartName}.chart" . }}
{{ include "${options.chartName}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}`,
				selectorLabels: `{{- define "${options.chartName}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${options.chartName}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}`,
				serviceAccountName: `{{- define "${options.chartName}.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "${options.chartName}.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}`,
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/templates/_helpers.tpl.hbs",
			`helm/${options.chartName}/templates/_helpers.tpl`,
			helpers,
		);
	}
	async generateNotes(options) {
		const notes = {
			chartName: options.chartName,
			serviceType: options.service.type,
			servicePort: options.service.port,
			ingressEnabled: options.ingress?.enabled ?? false,
			ingressHost:
				options.ingress?.hosts?.[0]?.host || `${options.chartName}.example.com`,
			monitoringEnabled: options.monitoring?.enabled ?? false,
		};
		await this.templateManager.renderTemplate(
			"devops/helm/templates/NOTES.txt.hbs",
			`helm/${options.chartName}/templates/NOTES.txt`,
			notes,
		);
	}
	async generateHooks(options) {
		if (!options.hooks) return;
		for (const hook of options.hooks) {
			const hookData = {
				name: hook.name,
				hook: hook.hook,
				weight: hook.weight || 0,
				deletePolicy: hook.deletePolicy || "before-hook-creation",
				chartName: options.chartName,
				namespace: options.namespace,
			};
			await this.templateManager.renderTemplate(
				"devops/helm/templates/hooks/hook.yaml.hbs",
				`helm/${options.chartName}/templates/hooks/${hook.name}.yaml`,
				hookData,
			);
		}
	}
	async generateTests(options) {
		if (!options.tests) return;
		for (const test of options.tests) {
			const testData = {
				name: test.name,
				command: test.command,
				image: test.image || "busybox:1.36",
				env: test.env || {},
				chartName: options.chartName,
				namespace: options.namespace,
			};
			await this.templateManager.renderTemplate(
				"devops/helm/templates/tests/test.yaml.hbs",
				`helm/${options.chartName}/templates/tests/${test.name}.yaml`,
				testData,
			);
		}
		// Generate default connection test
		const connectionTest = {
			name: "connection-test",
			command: [
				"wget",
				"--no-verbose",
				"--tries=1",
				"--spider",
				`http://{{ include "${options.chartName}.fullname" . }}:{{ .Values.service.port }}/health`,
			],
			image: "busybox:1.36",
			chartName: options.chartName,
		};
		await this.templateManager.renderTemplate(
			"devops/helm/templates/tests/test.yaml.hbs",
			`helm/${options.chartName}/templates/tests/connection-test.yaml`,
			connectionTest,
		);
	}
	async generateEnvironmentValues(options) {
		const environments = ["development", "staging", "production"];
		for (const env of environments) {
			const envValues = this.getEnvironmentSpecificValues(options, env);
			await this.templateManager.renderTemplate(
				"devops/helm/values/values-env.yaml.hbs",
				`helm/${options.chartName}/values/values-${env}.yaml`,
				{
					environment: env,
					values: envValues,
				},
			);
		}
	}
	async generateDeploymentScripts(options) {
		const scripts = {
			install: this.generateInstallScript(options),
			upgrade: this.generateUpgradeScript(options),
			rollback: this.generateRollbackScript(options),
			uninstall: this.generateUninstallScript(options),
			test: this.generateTestScript(options),
			lint: this.generateLintScript(options),
			package: this.generatePackageScript(options),
			deploy: this.generateDeployScript(options),
		};
		for (const [scriptName, scriptContent] of Object.entries(scripts)) {
			await this.templateManager.renderTemplate(
				"devops/helm/scripts/script.sh.hbs",
				`helm/${options.chartName}/scripts/${scriptName}.sh`,
				{
					scriptName,
					scriptContent,
					executable: true,
					chartName: options.chartName,
				},
			);
		}
	}
	async generateCIPipelines(options) {
		// Generate GitHub Actions workflow
		const githubWorkflow = {
			name: `${options.chartName} Helm Chart`,
			on: {
				push: {
					branches: ["main", "develop"],
					paths: [`helm/${options.chartName}/**`],
				},
				pullRequest: {
					branches: ["main"],
					paths: [`helm/${options.chartName}/**`],
				},
			},
			jobs: {
				lint: {
					"runs-on": "ubuntu-latest",
					steps: [
						{ uses: "actions/checkout@v4" },
						{
							name: "Set up Helm",
							uses: "azure/setup-helm@v3",
							with: { version: "3.12.0" },
						},
						{
							name: "Lint Helm Chart",
							run: `helm lint helm/${options.chartName}`,
						},
						{
							name: "Template Helm Chart",
							run: `helm template ${options.chartName} helm/${options.chartName}`,
						},
					],
				},
				test: {
					"runs-on": "ubuntu-latest",
					needs: "lint",
					steps: [
						{ uses: "actions/checkout@v4" },
						{
							name: "Create Kind Cluster",
							uses: "helm/kind-action@v1.7.0",
						},
						{
							name: "Install Chart",
							run: `helm install ${options.chartName} helm/${options.chartName} --wait --timeout=300s`,
						},
						{
							name: "Run Tests",
							run: `helm test ${options.chartName}`,
						},
					],
				},
				package: {
					"runs-on": "ubuntu-latest",
					needs: ["lint", "test"],
					if: "github.ref == 'refs/heads/main'",
					steps: [
						{ uses: "actions/checkout@v4" },
						{
							name: "Package Chart",
							run: `helm package helm/${options.chartName}`,
						},
						{
							name: "Upload Chart",
							uses: "actions/upload-artifact@v3",
							with: {
								name: `${options.chartName}-chart`,
								path: `${options.chartName}-*.tgz`,
							},
						},
					],
				},
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/ci/github-workflow.yml.hbs",
			`.github/workflows/${options.chartName}-helm.yml`,
			githubWorkflow,
		);
		// Generate GitLab CI
		const gitlabCI = {
			stages: ["validate", "test", "package", "deploy"],
			variables: {
				HELM_VERSION: "3.12.0",
				CHART_PATH: `helm/${options.chartName}`,
			},
			"validate-chart": {
				stage: "validate",
				image: "alpine/helm:3.12.0",
				script: ["helm lint $CHART_PATH", "helm template $CHART_PATH"],
			},
			"test-chart": {
				stage: "test",
				image: "alpine/helm:3.12.0",
				services: ["docker:dind"],
				script: [
					"apk add --no-cache docker",
					"helm install test-release $CHART_PATH --dry-run",
				],
			},
			"package-chart": {
				stage: "package",
				image: "alpine/helm:3.12.0",
				script: [
					"helm package $CHART_PATH",
					`helm repo index . --url https://charts.example.com`,
				],
				artifacts: {
					paths: [`${options.chartName}-*.tgz`, "index.yaml"],
				},
				only: ["main"],
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/ci/gitlab-ci.yml.hbs",
			`.gitlab-ci.yml`,
			gitlabCI,
		);
	}
	async generateMonitoring(options) {
		if (!options.monitoring?.enabled) return;
		// Generate Grafana dashboard
		const dashboard = {
			dashboard: {
				id: null,
				title: `${options.chartName} Dashboard`,
				tags: [options.chartName, "kubernetes", "helm"],
				timezone: "browser",
				panels: [
					{
						id: 1,
						title: "Pod CPU Usage",
						type: "graph",
						targets: [
							{
								expr: `rate(container_cpu_usage_seconds_total{pod=~"${options.chartName}.*"}[5m])`,
								legendFormat: "{{pod}}",
							},
						],
					},
					{
						id: 2,
						title: "Pod Memory Usage",
						type: "graph",
						targets: [
							{
								expr: `container_memory_usage_bytes{pod=~"${options.chartName}.*"}`,
								legendFormat: "{{pod}}",
							},
						],
					},
					{
						id: 3,
						title: "HTTP Request Rate",
						type: "graph",
						targets: [
							{
								expr: `rate(http_requests_total{job="${options.chartName}"}[5m])`,
								legendFormat: "{{method}} {{status}}",
							},
						],
					},
				],
				time: {
					from: "now-1h",
					to: "now",
				},
				refresh: "30s",
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/monitoring/grafana-dashboard.json.hbs",
			`helm/${options.chartName}/dashboards/${options.chartName}-dashboard.json`,
			dashboard,
		);
		// Generate Prometheus rules
		const prometheusRules = {
			groups: [
				{
					name: `${options.chartName}.rules`,
					rules: [
						{
							alert: `${options.chartName}PodCrashLooping`,
							expr: `rate(kube_pod_container_status_restarts_total{pod=~"${options.chartName}.*"}[5m]) * 60 * 5 > 0`,
							for: "0m",
							labels: {
								severity: "critical",
							},
							annotations: {
								summary: `${options.chartName} pod is crash looping`,
								description:
									"Pod {{ $labels.pod }} is crash looping in namespace {{ $labels.namespace }}",
							},
						},
						{
							alert: `${options.chartName}HighMemoryUsage`,
							expr: `container_memory_usage_bytes{pod=~"${options.chartName}.*"} / container_spec_memory_limit_bytes > 0.9`,
							for: "2m",
							labels: {
								severity: "warning",
							},
							annotations: {
								summary: `${options.chartName} high memory usage`,
								description: "Pod {{ $labels.pod }} memory usage is above 90%",
							},
						},
						{
							alert: `${options.chartName}HighCPUUsage`,
							expr: `rate(container_cpu_usage_seconds_total{pod=~"${options.chartName}.*"}[5m]) / container_spec_cpu_quota * container_spec_cpu_period > 0.9`,
							for: "2m",
							labels: {
								severity: "warning",
							},
							annotations: {
								summary: `${options.chartName} high CPU usage`,
								description: "Pod {{ $labels.pod }} CPU usage is above 90%",
							},
						},
					],
				},
			],
		};
		await this.templateManager.renderTemplate(
			"devops/helm/monitoring/prometheus-rules.yaml.hbs",
			`helm/${options.chartName}/rules/${options.chartName}-rules.yaml`,
			prometheusRules,
		);
	}
	async generateBackup(options) {
		if (!options.backup?.enabled) return;
		const backupConfig = {
			apiVersion: "velero.io/v1",
			kind: "Schedule",
			metadata: {
				name: `${options.chartName}-backup`,
				namespace: "velero",
			},
			spec: {
				schedule: options.backup.schedule || "0 2 * * *",
				template: {
					includedNamespaces: [options.namespace],
					labelSelector: {
						matchLabels: {
							"app.kubernetes.io/name": options.chartName,
						},
					},
					storageLocation: "default",
					ttl: options.backup.retention || "720h0m0s",
				},
			},
		};
		await this.templateManager.renderTemplate(
			"devops/helm/backup/velero-schedule.yaml.hbs",
			`helm/${options.chartName}/backup/velero-schedule.yaml`,
			{ manifest: backupConfig, options },
		);
	}
	async generateSecurity(options) {
		if (!options.security?.enabled) return;
		// Generate Pod Security Policy
		const psp = {
			apiVersion: "policy/v1beta1",
			kind: "PodSecurityPolicy",
			metadata: {
				name: `${options.chartName}-psp`,
			},
			spec: {
				privileged: false,
				allowPrivilegeEscalation:
					options.security.allowPrivilegeEscalation ?? false,
				requiredDropCapabilities: options.security.capabilities?.drop ?? [
					"ALL",
				],
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
		await this.templateManager.renderTemplate(
			"devops/helm/security/pod-security-policy.yaml.hbs",
			`helm/${options.chartName}/security/pod-security-policy.yaml`,
			{ manifest: psp, options },
		);
		// Generate Network Policy
		const networkPolicy = {
			apiVersion: "networking.k8s.io/v1",
			kind: "NetworkPolicy",
			metadata: {
				name: `${options.chartName}-network-policy`,
				namespace: options.namespace,
			},
			spec: {
				podSelector: {
					matchLabels: {
						"app.kubernetes.io/name": options.chartName,
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
								port: options.service.port,
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
		await this.templateManager.renderTemplate(
			"devops/helm/security/network-policy.yaml.hbs",
			`helm/${options.chartName}/security/network-policy.yaml`,
			{ manifest: networkPolicy, options },
		);
	}
	async generateReadme(options) {
		const readme = {
			chartName: options.chartName,
			description: options.description,
			version: options.chartVersion,
			appVersion: options.appVersion,
			maintainers: options.maintainers,
			sources: options.sources,
			keywords: options.keywords,
			dependencies: options.dependencies,
			values: options.values,
			service: options.service,
			ingress: options.ingress,
			monitoring: options.monitoring,
			security: options.security,
			backup: options.backup,
		};
		await this.templateManager.renderTemplate(
			"devops/helm/README.md.hbs",
			`helm/${options.chartName}/README.md`,
			readme,
		);
	}
	// Helper methods
	transformHelmValues(values) {
		return values.reduce((acc, value) => {
			const keys = value.key.split(".");
			let current = acc;
			for (let i = 0; i < keys.length - 1; i++) {
				if (!current[keys[i]]) {
					current[keys[i]] = {};
				}
				current = current[keys[i]];
			}
			current[keys[keys.length - 1]] = value.value;
			return acc;
		}, {});
	}
	getEnvironmentSpecificValues(options, env) {
		const baseValues = {
			global: {
				environment: env,
			},
		};
		if (env === "development") {
			return {
				...baseValues,
				replicaCount: 1,
				image: {
					pullPolicy: "Always",
				},
				resources: {
					limits: {
						cpu: "200m",
						memory: "256Mi",
					},
					requests: {
						cpu: "100m",
						memory: "128Mi",
					},
				},
				ingress: {
					enabled: false,
				},
				autoscaling: {
					enabled: false,
				},
			};
		} else if (env === "staging") {
			return {
				...baseValues,
				replicaCount: 2,
				image: {
					pullPolicy: "IfNotPresent",
				},
				resources: {
					limits: {
						cpu: "500m",
						memory: "512Mi",
					},
					requests: {
						cpu: "250m",
						memory: "256Mi",
					},
				},
				ingress: {
					enabled: true,
					hosts: [
						{
							host: `${options.chartName}-staging.example.com`,
							paths: [{ path: "/", pathType: "Prefix" }],
						},
					],
				},
				autoscaling: {
					enabled: true,
					minReplicas: 2,
					maxReplicas: 5,
				},
			};
		} else if (env === "production") {
			return {
				...baseValues,
				replicaCount: 3,
				image: {
					pullPolicy: "IfNotPresent",
				},
				resources: options.resources || {
					limits: {
						cpu: "1",
						memory: "1Gi",
					},
					requests: {
						cpu: "500m",
						memory: "512Mi",
					},
				},
				ingress: {
					enabled: options.ingress?.enabled ?? true,
					hosts: options.ingress?.hosts || [
						{
							host: `${options.chartName}.example.com`,
							paths: [{ path: "/", pathType: "Prefix" }],
						},
					],
					tls: options.ingress?.tls || [
						{
							secretName: `${options.chartName}-tls`,
							hosts: [`${options.chartName}.example.com`],
						},
					],
				},
				autoscaling: {
					enabled: options.autoscaling?.enabled ?? true,
					minReplicas: options.autoscaling?.minReplicas ?? 3,
					maxReplicas: options.autoscaling?.maxReplicas ?? 10,
					targetCPUUtilizationPercentage:
						options.autoscaling?.targetCPUUtilizationPercentage ?? 80,
				},
				persistence: {
					enabled: options.persistence?.enabled ?? true,
					size: options.persistence?.size ?? "10Gi",
				},
				monitoring: {
					enabled: options.monitoring?.enabled ?? true,
					serviceMonitor: {
						enabled: options.monitoring?.serviceMonitor ?? true,
					},
				},
			};
		}
		return baseValues;
	}
	generateInstallScript(options) {
		return `#!/bin/bash
set -e

NAMESPACE=\${1:-${options.namespace}}
RELEASE_NAME=\${2:-${options.chartName}}
VALUES_FILE=\${3:-values.yaml}

echo "Installing ${options.chartName} chart..."

helm install \$RELEASE_NAME . \\
  --namespace \$NAMESPACE \\
  --create-namespace \\
  --values \$VALUES_FILE \\
  --wait \\
  --timeout=300s

echo "Installation completed successfully!"
helm status \$RELEASE_NAME --namespace \$NAMESPACE
`;
	}
	generateUpgradeScript(options) {
		return `#!/bin/bash
set -e

NAMESPACE=\${1:-${options.namespace}}
RELEASE_NAME=\${2:-${options.chartName}}
VALUES_FILE=\${3:-values.yaml}

echo "Upgrading ${options.chartName} chart..."

helm upgrade \$RELEASE_NAME . \\
  --namespace \$NAMESPACE \\
  --values \$VALUES_FILE \\
  --wait \\
  --timeout=300s

echo "Upgrade completed successfully!"
helm status \$RELEASE_NAME --namespace \$NAMESPACE
`;
	}
	generateRollbackScript(options) {
		return `#!/bin/bash
set -e

NAMESPACE=\${1:-${options.namespace}}
RELEASE_NAME=\${2:-${options.chartName}}
REVISION=\${3:-}

echo "Rolling back ${options.chartName} chart..."

if [ -z "\$REVISION" ]; then
  helm rollback \$RELEASE_NAME --namespace \$NAMESPACE
else
  helm rollback \$RELEASE_NAME \$REVISION --namespace \$NAMESPACE
fi

echo "Rollback completed successfully!"
helm status \$RELEASE_NAME --namespace \$NAMESPACE
`;
	}
	generateUninstallScript(options) {
		return `#!/bin/bash
set -e

NAMESPACE=\${1:-${options.namespace}}
RELEASE_NAME=\${2:-${options.chartName}}

echo "Uninstalling ${options.chartName} chart..."

helm uninstall \$RELEASE_NAME --namespace \$NAMESPACE

echo "Uninstallation completed successfully!"
`;
	}
	generateTestScript(options) {
		return `#!/bin/bash
set -e

NAMESPACE=\${1:-${options.namespace}}
RELEASE_NAME=\${2:-${options.chartName}}

echo "Testing ${options.chartName} chart..."

helm test \$RELEASE_NAME --namespace \$NAMESPACE

echo "Tests completed successfully!"
`;
	}
	generateLintScript(options) {
		return `#!/bin/bash
set -e

echo "Linting ${options.chartName} chart..."

helm lint .

echo "Lint completed successfully!"
`;
	}
	generatePackageScript(options) {
		return `#!/bin/bash
set -e

OUTPUT_DIR=\${1:-../packages}

echo "Packaging ${options.chartName} chart..."

mkdir -p \$OUTPUT_DIR
helm package . --destination \$OUTPUT_DIR

echo "Package created successfully in \$OUTPUT_DIR"
`;
	}
	generateDeployScript(options) {
		return `#!/bin/bash
set -e

ENVIRONMENT=\${1:-${options.environment}}
NAMESPACE=\${2:-${options.namespace}}
RELEASE_NAME=\${3:-${options.chartName}}

echo "Deploying ${options.chartName} to \$ENVIRONMENT environment..."

VALUES_FILE="values/values-\$ENVIRONMENT.yaml"

if [ ! -f "\$VALUES_FILE" ]; then
  echo "Values file \$VALUES_FILE not found, using default values.yaml"
  VALUES_FILE="values.yaml"
fi

# Check if release exists
if helm list --namespace \$NAMESPACE | grep -q \$RELEASE_NAME; then
  echo "Release exists, upgrading..."
  helm upgrade \$RELEASE_NAME . \\
    --namespace \$NAMESPACE \\
    --values \$VALUES_FILE \\
    --wait \\
    --timeout=300s
else
  echo "Release does not exist, installing..."
  helm install \$RELEASE_NAME . \\
    --namespace \$NAMESPACE \\
    --create-namespace \\
    --values \$VALUES_FILE \\
    --wait \\
    --timeout=300s
fi

echo "Deployment completed successfully!"
helm status \$RELEASE_NAME --namespace \$NAMESPACE
`;
	}
}
//# sourceMappingURL=helm.generator.js.map

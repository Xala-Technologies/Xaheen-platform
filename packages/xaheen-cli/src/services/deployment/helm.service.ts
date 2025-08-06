import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import yaml from 'yaml';
import { KubernetesConfig, KubernetesService } from "./kubernetes.service";

const execAsync = promisify(exec);

// Schema for Helm chart configuration
const HelmConfigSchema = z.object({
  chart: z.object({
    name: z.string(),
    version: z.string().default('0.1.0'),
    appVersion: z.string().default('1.0.0'),
    description: z.string().default('A Helm chart for Kubernetes'),
    type: z.enum(['application', 'library']).default('application'),
    keywords: z.array(z.string()).default(['web', 'application']),
    home: z.string().optional(),
    sources: z.array(z.string()).default([]),
    maintainers: z.array(z.object({
      name: z.string(),
      email: z.string().optional(),
      url: z.string().optional(),
    })).default([{
      name: 'Xaheen CLI',
      email: 'support@xala.dev',
    }]),
    icon: z.string().optional(),
    apiVersion: z.string().default('v2'),
    condition: z.string().optional(),
    tags: z.array(z.string()).default([]),
    deprecated: z.boolean().default(false),
    annotations: z.record(z.string()).default({}),
  }),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    repository: z.string().optional(),
    condition: z.string().optional(),
    tags: z.array(z.string()).default([]),
    enabled: z.boolean().default(true),
    importValues: z.array(z.any()).default([]),
    alias: z.string().optional(),
  })).default([]),
  values: z.any().default({}),
  templates: z.object({
    notes: z.string().default(''),
    hooks: z.array(z.object({
      name: z.string(),
      weight: z.number().default(0),
      hookEvents: z.array(z.string()),
      deletePolicy: z.array(z.string()).default([]),
    })).default([]),
  }).default({}),
  tests: z.array(z.object({
    name: z.string(),
    command: z.array(z.string()),
    image: z.string().default('curlimages/curl:latest'),
  })).default([]),
  norwegianCompliance: z.object({
    enabled: z.boolean().default(false),
    auditHooks: z.boolean().default(true),
    securityPolicies: z.boolean().default(true),
    dataGovernance: z.boolean().default(true),
  }).default({}),
});

export type HelmConfig = z.infer<typeof HelmConfigSchema>;

export interface HelmRelease {
  name: string;
  namespace: string;
  revision: string;
  updated: string;
  status: string;
  chart: string;
  appVersion: string;
}

export interface HelmChart {
  name: string;
  version: string;
  appVersion: string;
  description: string;
}

export class HelmService {
  private config: HelmConfig;
  private kubernetesConfig: KubernetesConfig;
  private kubernetesService: KubernetesService;

  constructor(config: Partial<HelmConfig> & { chart: { name: string } }, kubernetesConfig: KubernetesConfig) {
    this.config = HelmConfigSchema.parse(config);
    this.kubernetesConfig = kubernetesConfig;
    this.kubernetesService = new KubernetesService(kubernetesConfig);
  }

  /**
   * Generate Helm chart structure
   */
  async generateChart(outputDir: string): Promise<void> {
    try {
      const chartDir = path.join(outputDir, this.config.chart.name);
      
      // Create chart directory structure
      await fs.ensureDir(chartDir);
      await fs.ensureDir(path.join(chartDir, 'templates'));
      await fs.ensureDir(path.join(chartDir, 'charts'));
      
      // Generate Chart.yaml
      await this.generateChartYaml(chartDir);
      
      // Generate values.yaml
      await this.generateValuesYaml(chartDir);
      
      // Generate templates
      await this.generateTemplates(chartDir);
      
      // Generate NOTES.txt
      await this.generateNotes(chartDir);
      
      // Generate tests
      await this.generateTests(chartDir);
      
      // Generate .helmignore
      await this.generateHelmignore(chartDir);
      
      // Generate hooks if Norwegian compliance is enabled
      if (this.config.norwegianCompliance.enabled) {
        await this.generateComplianceHooks(chartDir);
      }
      
      console.log(`Helm chart generated at ${chartDir}`);
    } catch (error) {
      throw new Error(`Failed to generate Helm chart: ${error}`);
    }
  }

  /**
   * Generate Chart.yaml
   */
  private async generateChartYaml(chartDir: string): Promise<void> {
    const chartYaml = {
      apiVersion: this.config.chart.apiVersion,
      name: this.config.chart.name,
      description: this.config.chart.description,
      type: this.config.chart.type,
      version: this.config.chart.version,
      appVersion: this.config.chart.appVersion,
      keywords: this.config.chart.keywords,
      ...(this.config.chart.home && { home: this.config.chart.home }),
      sources: this.config.chart.sources,
      maintainers: this.config.chart.maintainers,
      ...(this.config.chart.icon && { icon: this.config.chart.icon }),
      ...(this.config.chart.condition && { condition: this.config.chart.condition }),
      ...(this.config.chart.tags.length > 0 && { tags: this.config.chart.tags }),
      deprecated: this.config.chart.deprecated,
      annotations: {
        'category': 'Application',
        'xaheen.dev/generated-by': 'xaheen-cli',
        'xaheen.dev/version': process.env.npm_package_version || '5.0.0',
        ...this.config.chart.annotations,
        ...(this.config.norwegianCompliance.enabled && {
          'compliance.norway/enabled': 'true',
          'compliance.gdpr/enabled': 'true',
          'security.audit/required': 'true',
        }),
      },
      ...(this.config.dependencies.length > 0 && { dependencies: this.config.dependencies }),
    };

    const filepath = path.join(chartDir, 'Chart.yaml');
    await fs.writeFile(filepath, yaml.stringify(chartYaml, { indent: 2 }));
  }

  /**
   * Generate values.yaml with comprehensive defaults
   */
  private async generateValuesYaml(chartDir: string): Promise<void> {
    const values = {
      // Global configuration
      global: {
        imageRegistry: '',
        imagePullSecrets: [],
        storageClass: '',
      },

      // Application configuration
      nameOverride: '',
      fullnameOverride: '',

      // Image configuration
      image: {
        registry: 'docker.io',
        repository: this.kubernetesConfig.image.repository,
        tag: this.kubernetesConfig.image.tag,
        pullPolicy: this.kubernetesConfig.image.pullPolicy,
        pullSecrets: this.kubernetesConfig.image.pullSecrets,
      },

      // Deployment configuration
      replicaCount: this.kubernetesConfig.deployment.replicaCount,
      
      updateStrategy: {
        type: this.kubernetesConfig.deployment.strategy.type,
        rollingUpdate: this.kubernetesConfig.deployment.strategy.rollingUpdate,
      },

      // Pod configuration
      podAnnotations: {},
      podLabels: {},
      podSecurityContext: {
        runAsNonRoot: this.kubernetesConfig.security.runAsNonRoot,
        runAsUser: this.kubernetesConfig.security.runAsUser,
        runAsGroup: this.kubernetesConfig.security.runAsGroup,
        fsGroup: this.kubernetesConfig.security.fsGroup,
      },

      securityContext: {
        runAsNonRoot: this.kubernetesConfig.security.runAsNonRoot,
        runAsUser: this.kubernetesConfig.security.runAsUser,
        runAsGroup: this.kubernetesConfig.security.runAsGroup,
        readOnlyRootFilesystem: this.kubernetesConfig.security.readOnlyRootFilesystem,
        allowPrivilegeEscalation: this.kubernetesConfig.security.allowPrivilegeEscalation,
        capabilities: {
          drop: this.kubernetesConfig.security.dropCapabilities,
          ...(this.kubernetesConfig.security.addCapabilities.length > 0 && {
            add: this.kubernetesConfig.security.addCapabilities,
          }),
        },
      },

      // Service configuration
      service: {
        type: this.kubernetesConfig.service.type,
        port: this.kubernetesConfig.service.port,
        targetPort: this.kubernetesConfig.service.targetPort,
        annotations: this.kubernetesConfig.service.annotations,
        ...(this.kubernetesConfig.service.nodePort && {
          nodePort: this.kubernetesConfig.service.nodePort,
        }),
      },

      // Ingress configuration
      ingress: {
        enabled: this.kubernetesConfig.ingress.enabled,
        className: this.kubernetesConfig.ingress.className,
        annotations: this.kubernetesConfig.ingress.annotations,
        hosts: this.kubernetesConfig.ingress.hosts,
        tls: this.kubernetesConfig.ingress.tls,
      },

      // Resource management
      resources: this.kubernetesConfig.deployment.resources,

      // Autoscaling
      autoscaling: {
        enabled: this.kubernetesConfig.autoscaling.enabled,
        minReplicas: this.kubernetesConfig.autoscaling.minReplicas,
        maxReplicas: this.kubernetesConfig.autoscaling.maxReplicas,
        targetCPUUtilizationPercentage: this.kubernetesConfig.autoscaling.targetCPUUtilizationPercentage,
        ...(this.kubernetesConfig.autoscaling.targetMemoryUtilizationPercentage && {
          targetMemoryUtilizationPercentage: this.kubernetesConfig.autoscaling.targetMemoryUtilizationPercentage,
        }),
      },

      // Node selection
      nodeSelector: this.kubernetesConfig.deployment.nodeSelector,
      tolerations: this.kubernetesConfig.deployment.tolerations,
      affinity: this.kubernetesConfig.deployment.affinity || {},

      // Service account
      serviceAccount: {
        create: this.kubernetesConfig.serviceAccount.create,
        annotations: this.kubernetesConfig.serviceAccount.annotations,
        name: this.kubernetesConfig.serviceAccount.name || '',
      },

      // RBAC
      rbac: {
        create: this.kubernetesConfig.rbac.create,
        rules: this.kubernetesConfig.rbac.rules,
      },

      // Pod Disruption Budget
      podDisruptionBudget: {
        enabled: this.kubernetesConfig.podDisruptionBudget.enabled,
        minAvailable: this.kubernetesConfig.podDisruptionBudget.minAvailable,
        maxUnavailable: this.kubernetesConfig.podDisruptionBudget.maxUnavailable,
      },

      // Network Policy
      networkPolicy: {
        enabled: this.kubernetesConfig.networkPolicy.enabled,
        ingress: this.kubernetesConfig.networkPolicy.ingress,
        egress: this.kubernetesConfig.networkPolicy.egress,
      },

      // Persistence
      persistence: {
        enabled: this.kubernetesConfig.persistence.enabled,
        storageClass: this.kubernetesConfig.persistence.storageClass,
        accessMode: this.kubernetesConfig.persistence.accessMode,
        size: this.kubernetesConfig.persistence.size,
        mountPath: this.kubernetesConfig.persistence.mountPath,
      },

      // ConfigMap
      configMap: {
        enabled: this.kubernetesConfig.configMap.enabled,
        data: this.kubernetesConfig.configMap.data,
      },

      // Secrets
      secrets: {
        enabled: this.kubernetesConfig.secrets.enabled,
        data: this.kubernetesConfig.secrets.data,
      },

      // Health checks
      livenessProbe: {
        enabled: true,
        path: '/health',
        initialDelaySeconds: 30,
        periodSeconds: 10,
        timeoutSeconds: 5,
        failureThreshold: 3,
      },

      readinessProbe: {
        enabled: true,
        path: '/ready',
        initialDelaySeconds: 5,
        periodSeconds: 5,
        timeoutSeconds: 3,
        failureThreshold: 3,
      },

      startupProbe: {
        enabled: true,
        path: '/health',
        initialDelaySeconds: 10,
        periodSeconds: 10,
        timeoutSeconds: 5,
        failureThreshold: 30,
      },

      // Monitoring
      monitoring: {
        enabled: this.kubernetesConfig.monitoring.enabled,
        serviceMonitor: this.kubernetesConfig.monitoring.serviceMonitor,
        prometheusRule: this.kubernetesConfig.monitoring.prometheusRule,
      },

      // Norwegian compliance
      norwegianCompliance: {
        enabled: this.kubernetesConfig.norwegianCompliance.enabled,
        dataClassification: this.kubernetesConfig.norwegianCompliance.dataClassification,
        auditLogging: this.kubernetesConfig.norwegianCompliance.auditLogging,
        networkPolicies: this.kubernetesConfig.norwegianCompliance.networkPolicies,
        podSecurityStandards: this.kubernetesConfig.norwegianCompliance.podSecurityStandards,
      },

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: this.kubernetesConfig.service.targetPort.toString(),
      },

      // Extra environment variables from ConfigMap/Secret
      envFrom: [],

      // Extra volumes
      extraVolumes: [],
      extraVolumeMounts: [],

      // Lifecycle hooks
      lifecycle: {},

      // Custom values
      ...this.config.values,
    };

    const filepath = path.join(chartDir, 'values.yaml');
    await fs.writeFile(filepath, yaml.stringify(values, { indent: 2 }));
  }

  /**
   * Generate Helm templates
   */
  private async generateTemplates(chartDir: string): Promise<void> {
    const templatesDir = path.join(chartDir, 'templates');

    // Generate helper template
    await this.generateHelpersTemplate(templatesDir);

    // Generate main Kubernetes manifests with Helm templating
    const manifests = this.kubernetesService.generateAllManifests();

    for (const [name, manifest] of Object.entries(manifests)) {
      const helmTemplate = this.convertToHelmTemplate(manifest, name);
      const filename = `${name}.yaml`;
      const filepath = path.join(templatesDir, filename);
      
      await fs.writeFile(filepath, helmTemplate);
    }

    console.log(`Generated ${Object.keys(manifests).length} Helm templates`);
  }

  /**
   * Generate _helpers.tpl
   */
  private async generateHelpersTemplate(templatesDir: string): Promise<void> {
    const helpers = `{{/*
Expand the name of the chart.
*/}}
{{- define "${this.config.chart.name}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "${this.config.chart.name}.fullname" -}}
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
{{- define "${this.config.chart.name}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${this.config.chart.name}.labels" -}}
helm.sh/chart: {{ include "${this.config.chart.name}.chart" . }}
{{ include "${this.config.chart.name}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.norwegianCompliance.enabled }}
compliance.norway/enabled: "true"
compliance.norway/classification: {{ .Values.norwegianCompliance.dataClassification | quote }}
compliance.gdpr/enabled: "true"
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${this.config.chart.name}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${this.config.chart.name}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "${this.config.chart.name}.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "${this.config.chart.name}.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate image name
*/}}
{{- define "${this.config.chart.name}.image" -}}
{{- $registry := .Values.image.registry -}}
{{- $repository := .Values.image.repository -}}
{{- $tag := .Values.image.tag | toString -}}
{{- if .Values.global.imageRegistry }}
{{- $registry = .Values.global.imageRegistry -}}
{{- end }}
{{- if $registry }}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- else }}
{{- printf "%s:%s" $repository $tag -}}
{{- end }}
{{- end }}

{{/*
Norwegian compliance annotations
*/}}
{{- define "${this.config.chart.name}.complianceAnnotations" -}}
{{- if .Values.norwegianCompliance.enabled }}
compliance.norway/audit-required: "true"
compliance.norway/data-classification: {{ .Values.norwegianCompliance.dataClassification | quote }}
{{- if .Values.norwegianCompliance.auditLogging }}
compliance.norway/audit-log: "true"
{{- end }}
{{- end }}
{{- end }}

{{/*
Security context
*/}}
{{- define "${this.config.chart.name}.securityContext" -}}
{{- if .Values.norwegianCompliance.enabled }}
seccompProfile:
  type: RuntimeDefault
{{- end }}
runAsNonRoot: {{ .Values.securityContext.runAsNonRoot }}
runAsUser: {{ .Values.securityContext.runAsUser }}
runAsGroup: {{ .Values.securityContext.runAsGroup }}
readOnlyRootFilesystem: {{ .Values.securityContext.readOnlyRootFilesystem }}
allowPrivilegeEscalation: {{ .Values.securityContext.allowPrivilegeEscalation }}
capabilities:
  drop:
  {{- range .Values.securityContext.capabilities.drop }}
  - {{ . }}
  {{- end }}
  {{- if .Values.securityContext.capabilities.add }}
  add:
  {{- range .Values.securityContext.capabilities.add }}
  - {{ . }}
  {{- end }}
  {{- end }}
{{- end }}
`;

    const filepath = path.join(templatesDir, '_helpers.tpl');
    await fs.writeFile(filepath, helpers);
  }

  /**
   * Generate NOTES.txt
   */
  private async generateNotes(chartDir: string): Promise<void> {
    const notes = `1. Get the application URL by running these commands:
{{- if .Values.ingress.enabled }}
{{- range $host := .Values.ingress.hosts }}
  {{- range .paths }}
  http{{ if $.Values.ingress.tls }}s{{ end }}://{{ $host.host }}{{ .path }}
  {{- end }}
{{- end }}
{{- else if contains "NodePort" .Values.service.type }}
  export NODE_PORT=$(kubectl get --namespace {{ .Release.Namespace }} -o jsonpath="{.spec.ports[0].nodePort}" services {{ include "${this.config.chart.name}.fullname" . }})
  export NODE_IP=$(kubectl get nodes --namespace {{ .Release.Namespace }} -o jsonpath="{.items[0].status.addresses[0].address}")
  echo http://$NODE_IP:$NODE_PORT
{{- else if contains "LoadBalancer" .Values.service.type }}
     NOTE: It may take a few minutes for the LoadBalancer IP to be available.
           You can watch the status of by running 'kubectl get --namespace {{ .Release.Namespace }} svc -w {{ include "${this.config.chart.name}.fullname" . }}'
  export SERVICE_IP=$(kubectl get svc --namespace {{ .Release.Namespace }} {{ include "${this.config.chart.name}.fullname" . }} --template "{{"{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"}}")
  echo http://$SERVICE_IP:{{ .Values.service.port }}
{{- else if contains "ClusterIP" .Values.service.type }}
  export POD_NAME=$(kubectl get pods --namespace {{ .Release.Namespace }} -l "app.kubernetes.io/name={{ include "${this.config.chart.name}.name" . }},app.kubernetes.io/instance={{ .Release.Name }}" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace {{ .Release.Namespace }} $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace {{ .Release.Namespace }} port-forward $POD_NAME 8080:$CONTAINER_PORT
{{- end }}

2. Check the status of your deployment:
   kubectl get deployment {{ include "${this.config.chart.name}.fullname" . }} -n {{ .Release.Namespace }}

3. View application logs:
   kubectl logs -l app.kubernetes.io/name={{ include "${this.config.chart.name}.name" . }} -n {{ .Release.Namespace }}

{{- if .Values.norwegianCompliance.enabled }}

Norwegian Compliance Information:
- Data Classification: {{ .Values.norwegianCompliance.dataClassification }}
- Audit Logging: {{ if .Values.norwegianCompliance.auditLogging }}Enabled{{ else }}Disabled{{ end }}
- Network Policies: {{ if .Values.norwegianCompliance.networkPolicies }}Enabled{{ else }}Disabled{{ end }}
- Pod Security Standards: {{ if .Values.norwegianCompliance.podSecurityStandards }}Enabled{{ else }}Disabled{{ end }}

Please ensure compliance with Norwegian data protection regulations.
{{- end }}

Generated by Xaheen CLI v${process.env.npm_package_version || '5.0.0'}
`;

    const filepath = path.join(chartDir, 'templates', 'NOTES.txt');
    await fs.writeFile(filepath, notes);
  }

  /**
   * Generate test templates
   */
  private async generateTests(chartDir: string): Promise<void> {
    const testsDir = path.join(chartDir, 'templates', 'tests');
    await fs.ensureDir(testsDir);

    // Default connection test
    const connectionTest = `apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "${this.config.chart.name}.fullname" . }}-test-connection"
  labels:
    {{- include "${this.config.chart.name}.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  restartPolicy: Never
  containers:
    - name: wget
      image: curlimages/curl:latest
      command: ['curl']
      args: ['{{ include "${this.config.chart.name}.fullname" . }}:{{ .Values.service.port }}/health']
  {{- with .Values.nodeSelector }}
  nodeSelector:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.tolerations }}
  tolerations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
`;

    const testFilepath = path.join(testsDir, 'test-connection.yaml');
    await fs.writeFile(testFilepath, connectionTest);

    // Additional custom tests
    for (const test of this.config.tests) {
      const customTest = `apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "${this.config.chart.name}.fullname" . }}-test-${test.name}"
  labels:
    {{- include "${this.config.chart.name}.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-weight": "1"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  restartPolicy: Never
  containers:
    - name: ${test.name}
      image: ${test.image}
      command: [${test.command.map(cmd => `'${cmd}'`).join(', ')}]
  {{- with .Values.nodeSelector }}
  nodeSelector:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.tolerations }}
  tolerations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
`;

      const customTestFilepath = path.join(testsDir, `test-${test.name}.yaml`);
      await fs.writeFile(customTestFilepath, customTest);
    }
  }

  /**
   * Generate .helmignore
   */
  private async generateHelmignore(chartDir: string): Promise<void> {
    const helmignore = `# Patterns to ignore when building packages.
# This supports shell glob matching, relative path matching, and
# negation (prefixed with !). Only one pattern per line.
.DS_Store
# Common VCS dirs
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
# Common backup files
*.swp
*.bak
*.tmp
*.orig
*~
# Various IDEs
.project
.idea/
*.tmproj
.vscode/
# OS generated files
Thumbs.db
.DS_Store
# Helm generated files
*.tgz
.helmignore
# Documentation
README.md
OWNERS
# Test files
*_test.go
test/
tests/
# CI/CD
.github/
.gitlab-ci.yml
.travis.yml
# Docker files
Dockerfile*
docker-compose*.yml
.dockerignore
# Development files
*.log
.env*
node_modules/
`;

    const filepath = path.join(chartDir, '.helmignore');
    await fs.writeFile(filepath, helmignore);
  }

  /**
   * Generate Norwegian compliance hooks
   */
  private async generateComplianceHooks(chartDir: string): Promise<void> {
    const hooksDir = path.join(chartDir, 'templates', 'hooks');
    await fs.ensureDir(hooksDir);

    // Pre-install compliance check hook
    const preInstallHook = `{{- if .Values.norwegianCompliance.enabled }}
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ include "${this.config.chart.name}.fullname" . }}-compliance-check"
  labels:
    {{- include "${this.config.chart.name}.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    metadata:
      name: "{{ include "${this.config.chart.name}.fullname" . }}-compliance-check"
      labels:
        {{- include "${this.config.chart.name}.selectorLabels" . | nindent 8 }}
    spec:
      restartPolicy: Never
      containers:
      - name: compliance-check
        image: alpine:3.19
        command:
        - /bin/sh
        - -c
        - |
          echo "Performing Norwegian compliance checks..."
          echo "Data Classification: {{ .Values.norwegianCompliance.dataClassification }}"
          echo "Audit Logging: {{ .Values.norwegianCompliance.auditLogging }}"
          echo "Network Policies: {{ .Values.norwegianCompliance.networkPolicies }}"
          echo "Pod Security Standards: {{ .Values.norwegianCompliance.podSecurityStandards }}"
          
          # Validate data classification
          if [[ "{{ .Values.norwegianCompliance.dataClassification }}" != "OPEN" ]] && 
             [[ "{{ .Values.norwegianCompliance.dataClassification }}" != "RESTRICTED" ]] && 
             [[ "{{ .Values.norwegianCompliance.dataClassification }}" != "CONFIDENTIAL" ]] && 
             [[ "{{ .Values.norwegianCompliance.dataClassification }}" != "SECRET" ]]; then
            echo "ERROR: Invalid data classification. Must be one of: OPEN, RESTRICTED, CONFIDENTIAL, SECRET"
            exit 1
          fi
          
          echo "✅ Norwegian compliance checks passed"
{{- end }}
`;

    const preInstallFilepath = path.join(hooksDir, 'pre-install-compliance.yaml');
    await fs.writeFile(preInstallFilepath, preInstallHook);

    // Post-install audit hook
    const postInstallHook = `{{- if and .Values.norwegianCompliance.enabled .Values.norwegianCompliance.auditLogging }}
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ include "${this.config.chart.name}.fullname" . }}-audit-log"
  labels:
    {{- include "${this.config.chart.name}.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    metadata:
      name: "{{ include "${this.config.chart.name}.fullname" . }}-audit-log"
      labels:
        {{- include "${this.config.chart.name}.selectorLabels" . | nindent 8 }}
    spec:
      restartPolicy: Never
      containers:
      - name: audit-log
        image: alpine:3.19
        command:
        - /bin/sh
        - -c
        - |
          echo "$(date -Iseconds) - AUDIT: Helm release {{ .Release.Name }} deployed in namespace {{ .Release.Namespace }}"
          echo "$(date -Iseconds) - AUDIT: Application: {{ include "${this.config.chart.name}.fullname" . }}"
          echo "$(date -Iseconds) - AUDIT: Version: {{ .Chart.AppVersion }}"
          echo "$(date -Iseconds) - AUDIT: Data Classification: {{ .Values.norwegianCompliance.dataClassification }}"
          echo "$(date -Iseconds) - AUDIT: Compliance Status: COMPLIANT"
          echo "✅ Audit log entry created"
{{- end }}
`;

    const postInstallFilepath = path.join(hooksDir, 'post-install-audit.yaml');
    await fs.writeFile(postInstallFilepath, postInstallHook);
  }

  /**
   * Convert Kubernetes manifest to Helm template
   */
  private convertToHelmTemplate(manifest: any, resourceType: string): string {
    // Add Helm template conditions and values
    let helmTemplate = yaml.stringify(manifest, { indent: 2 });

    // Replace hardcoded values with Helm template expressions
    const replacements = [
      // Basic replacements
      { pattern: new RegExp(this.kubernetesConfig.appName, 'g'), replacement: `{{ include "${this.config.chart.name}.fullname" . }}` },
      { pattern: new RegExp(this.kubernetesConfig.namespace, 'g'), replacement: '{{ .Release.Namespace }}' },
      { pattern: new RegExp(this.kubernetesConfig.version, 'g'), replacement: '{{ .Chart.AppVersion }}' },
      
      // Image replacements
      { pattern: new RegExp(`${this.kubernetesConfig.image.repository}:${this.kubernetesConfig.image.tag}`, 'g'), replacement: `{{ include "${this.config.chart.name}.image" . }}` },
      
      // Resource replacements
      { pattern: /"100m"/g, replacement: '{{ .Values.resources.requests.cpu | quote }}' },
      { pattern: /"128Mi"/g, replacement: '{{ .Values.resources.requests.memory | quote }}' },
      { pattern: /"500m"/g, replacement: '{{ .Values.resources.limits.cpu | quote }}' },
      { pattern: /"512Mi"/g, replacement: '{{ .Values.resources.limits.memory | quote }}' },
      
      // Replica count
      { pattern: /replicas: \d+/g, replacement: 'replicas: {{ .Values.replicaCount }}' },
      
      // Port replacements
      { pattern: new RegExp(`containerPort: ${this.kubernetesConfig.service.targetPort}`, 'g'), replacement: `containerPort: {{ .Values.service.targetPort }}` },
      { pattern: new RegExp(`port: ${this.kubernetesConfig.service.port}`, 'g'), replacement: `port: {{ .Values.service.port }}` },
    ];

    for (const { pattern, replacement } of replacements) {
      helmTemplate = helmTemplate.replace(pattern, replacement);
    }

    // Add conditional rendering for optional resources
    if (resourceType === 'ingress') {
      helmTemplate = `{{- if .Values.ingress.enabled }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'configMap') {
      helmTemplate = `{{- if .Values.configMap.enabled }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'secret') {
      helmTemplate = `{{- if .Values.secrets.enabled }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'hpa') {
      helmTemplate = `{{- if .Values.autoscaling.enabled }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'pdb') {
      helmTemplate = `{{- if .Values.podDisruptionBudget.enabled }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'serviceAccount') {
      helmTemplate = `{{- if .Values.serviceAccount.create }}\n${helmTemplate}{{- end }}`;
    } else if (resourceType === 'networkPolicy') {
      helmTemplate = `{{- if or .Values.networkPolicy.enabled .Values.norwegianCompliance.enabled }}\n${helmTemplate}{{- end }}`;
    }

    // Add template header
    const header = `# Generated by Xaheen CLI v${process.env.npm_package_version || '5.0.0'}
# ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} template for ${this.config.chart.name}
`;

    return header + helmTemplate;
  }

  /**
   * Install Helm release
   */
  async install(
    releaseName: string,
    chartPath: string,
    options: {
      namespace?: string;
      values?: string[];
      set?: string[];
      dryRun?: boolean;
      wait?: boolean;
      timeout?: string;
    } = {}
  ): Promise<void> {
    try {
      const {
        namespace = this.kubernetesConfig.namespace,
        values = [],
        set = [],
        dryRun = false,
        wait = true,
        timeout = '300s'
      } = options;

      let command = `helm install ${releaseName} ${chartPath}`;
      command += ` --namespace ${namespace}`;
      command += ` --create-namespace`;
      
      if (wait) command += ` --wait`;
      if (timeout) command += ` --timeout ${timeout}`;
      if (dryRun) command += ` --dry-run`;

      // Add values files
      for (const valueFile of values) {
        command += ` --values ${valueFile}`;
      }

      // Add set values
      for (const setValue of set) {
        command += ` --set ${setValue}`;
      }

      console.log(`Installing Helm release: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('Warnings:', stderr);
      }
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to install Helm chart: ${error}`);
    }
  }

  /**
   * Upgrade Helm release
   */
  async upgrade(
    releaseName: string,
    chartPath: string,
    options: {
      namespace?: string;
      values?: string[];
      set?: string[];
      dryRun?: boolean;
      wait?: boolean;
      timeout?: string;
      force?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const {
        namespace = this.kubernetesConfig.namespace,
        values = [],
        set = [],
        dryRun = false,
        wait = true,
        timeout = '300s',
        force = false
      } = options;

      let command = `helm upgrade ${releaseName} ${chartPath}`;
      command += ` --namespace ${namespace}`;
      
      if (wait) command += ` --wait`;
      if (timeout) command += ` --timeout ${timeout}`;
      if (dryRun) command += ` --dry-run`;
      if (force) command += ` --force`;

      // Add values files
      for (const valueFile of values) {
        command += ` --values ${valueFile}`;
      }

      // Add set values
      for (const setValue of set) {
        command += ` --set ${setValue}`;
      }

      console.log(`Upgrading Helm release: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('Warnings:', stderr);
      }
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to upgrade Helm chart: ${error}`);
    }
  }

  /**
   * Uninstall Helm release
   */
  async uninstall(releaseName: string, namespace?: string): Promise<void> {
    try {
      const ns = namespace || this.kubernetesConfig.namespace;
      const command = `helm uninstall ${releaseName} --namespace ${ns}`;
      
      console.log(`Uninstalling Helm release: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to uninstall Helm chart: ${error}`);
    }
  }

  /**
   * List Helm releases
   */
  async list(namespace?: string): Promise<HelmRelease[]> {
    try {
      const ns = namespace || this.kubernetesConfig.namespace;
      const command = `helm list --namespace ${ns} --output json`;
      
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout) as HelmRelease[];
    } catch (error) {
      throw new Error(`Failed to list Helm releases: ${error}`);
    }
  }

  /**
   * Get release status
   */
  async status(releaseName: string, namespace?: string): Promise<any> {
    try {
      const ns = namespace || this.kubernetesConfig.namespace;
      const command = `helm status ${releaseName} --namespace ${ns} --output json`;
      
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Failed to get Helm release status: ${error}`);
    }
  }

  /**
   * Test Helm release
   */
  async test(releaseName: string, namespace?: string): Promise<void> {
    try {
      const ns = namespace || this.kubernetesConfig.namespace;
      const command = `helm test ${releaseName} --namespace ${ns}`;
      
      console.log(`Testing Helm release: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to test Helm release: ${error}`);
    }
  }

  /**
   * Rollback Helm release
   */
  async rollback(releaseName: string, revision?: number, namespace?: string): Promise<void> {
    try {
      const ns = namespace || this.kubernetesConfig.namespace;
      let command = `helm rollback ${releaseName}`;
      
      if (revision) {
        command += ` ${revision}`;
      }
      
      command += ` --namespace ${ns}`;
      
      console.log(`Rolling back Helm release: ${command}`);
      const { stdout } = await execAsync(command);
      
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to rollback Helm release: ${error}`);
    }
  }
}

// Export default configuration
export const defaultHelmConfig = HelmConfigSchema.parse({
  chart: { name: 'sample-app' },
});
{{/*
Xaheen CLI - Helm Template Helpers
Norwegian Enterprise Grade with Multi-Environment Support
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "xaheen-cli.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "xaheen-cli.fullname" -}}
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
{{- define "xaheen-cli.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "xaheen-cli.labels" -}}
helm.sh/chart: {{ include "xaheen-cli.chart" . }}
{{ include "xaheen-cli.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: xaheen-platform
app.kubernetes.io/component: application
{{- if .Values.global.norwegianCompliance.enabled }}
nsm.classification: {{ .Values.global.norwegianCompliance.nsmClassification | quote }}
gdpr.compliant: {{ .Values.global.norwegianCompliance.gdprCompliant | quote }}
data.localization: {{ .Values.global.norwegianCompliance.dataLocalization | quote }}
norwegian.locale: {{ .Values.global.norwegianCompliance.norwegianLocale | quote }}
compliance.framework: "nsm"
{{- end }}
environment: {{ .Values.global.environment | quote }}
tier: {{ .Values.global.environment | quote }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "xaheen-cli.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xaheen-cli.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "xaheen-cli.serviceAccountName" -}}
{{- if .Values.security.serviceAccount.create }}
{{- default (include "xaheen-cli.fullname" .) .Values.security.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.security.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Norwegian Compliance Labels
*/}}
{{- define "xaheen-cli.norwegianComplianceLabels" -}}
{{- if .Values.global.norwegianCompliance.enabled }}
nsm.classification: {{ .Values.global.norwegianCompliance.nsmClassification | quote }}
gdpr.compliant: {{ .Values.global.norwegianCompliance.gdprCompliant | quote }}
data.localization: {{ .Values.global.norwegianCompliance.dataLocalization | quote }}
norwegian.locale: {{ .Values.global.norwegianCompliance.norwegianLocale | quote }}
compliance.framework: "nsm"
{{- end }}
{{- end }}

{{/*
Norwegian Compliance Annotations
*/}}
{{- define "xaheen-cli.norwegianComplianceAnnotations" -}}
{{- if .Values.global.norwegianCompliance.enabled }}
nsm.no/classification: {{ .Values.global.norwegianCompliance.nsmClassification | quote }}
gdpr.eu/article32: {{ .Values.global.norwegianCompliance.gdprCompliant | quote }}
{{- if eq .Values.global.norwegianCompliance.nsmClassification "RESTRICTED" "CONFIDENTIAL" "SECRET" }}
iso27001.compliance: "enabled"
{{- end }}
data.localization: {{ .Values.global.norwegianCompliance.dataLocalization | quote }}
norwegian.locale: {{ .Values.global.norwegianCompliance.norwegianLocale | quote }}
timezone: {{ .Values.global.norwegianCompliance.timezone | quote }}
{{- end }}
{{- end }}

{{/*
Security Labels
*/}}
{{- define "xaheen-cli.securityLabels" -}}
{{- if .Values.global.security.enabled }}
security.level: "high"
security.framework: {{ .Values.global.security.framework | quote }}
pod.security.standard: {{ .Values.global.security.podSecurityStandard | quote }}
{{- if .Values.global.security.networkPolicies }}
network.policy: "enabled"
{{- end }}
{{- end }}
{{- end }}

{{/*
Security Annotations
*/}}
{{- define "xaheen-cli.securityAnnotations" -}}
{{- if .Values.global.security.enabled }}
security.kubernetes.io/audit: "enabled"
seccomp.security.alpha.kubernetes.io/pod: runtime/default
{{- end }}
{{- end }}

{{/*
Monitoring Labels
*/}}
{{- define "xaheen-cli.monitoringLabels" -}}
{{- if .Values.global.monitoring.enabled }}
monitoring.prometheus.io/scrape: "true"
{{- if .Values.global.monitoring.opentelemetry }}
telemetry.opentelemetry.io/enabled: "true"
{{- end }}
{{- end }}
{{- end }}

{{/*
Monitoring Annotations
*/}}
{{- define "xaheen-cli.monitoringAnnotations" -}}
{{- if .Values.global.monitoring.enabled }}
prometheus.io/scrape: "true"
prometheus.io/port: {{ .Values.app.config.prometheus.port | quote }}
prometheus.io/path: {{ .Values.app.config.prometheus.path | quote }}
{{- end }}
{{- end }}

{{/*
Istio Labels
*/}}
{{- define "xaheen-cli.istioLabels" -}}
{{- if .Values.istio.enabled }}
{{- if eq .Values.global.serviceMesh.mode "ambient" }}
istio.io/dataplane-mode: ambient
{{- if .Values.istio.ambient.waypoint.enabled }}
istio.io/use-waypoint: {{ .Values.istio.ambient.waypoint.name | quote }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Istio Annotations
*/}}
{{- define "xaheen-cli.istioAnnotations" -}}
{{- if .Values.istio.enabled }}
istio.io/rev: default
{{- if eq .Values.global.serviceMesh.mode "ambient" }}
ambient.istio.io/redirection: enabled
sidecar.istio.io/inject: "false"
{{- else }}
sidecar.istio.io/inject: "true"
{{- end }}
{{- end }}
{{- end }}

{{/*
Vault Annotations
*/}}
{{- define "xaheen-cli.vaultAnnotations" -}}
{{- if .Values.vault.enabled }}
vault.hashicorp.com/agent-inject: "true"
vault.hashicorp.com/role: {{ .Values.security.serviceAccount.annotations."vault.hashicorp.com/role" | quote }}
{{- range .Values.vault.secrets }}
vault.hashicorp.com/agent-inject-secret-{{ .name }}: {{ .path | quote }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Redis Secret Name
*/}}
{{- define "redis.secretName" -}}
{{- if .Values.redis.auth.existingSecret }}
{{- .Values.redis.auth.existingSecret }}
{{- else }}
{{- printf "%s-redis" (include "xaheen-cli.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Redis Secret Password Key
*/}}
{{- define "redis.secretPasswordKey" -}}
{{- if .Values.redis.auth.existingSecretPasswordKey }}
{{- .Values.redis.auth.existingSecretPasswordKey }}
{{- else }}
redis-password
{{- end }}
{{- end }}

{{/*
PostgreSQL Secret Name
*/}}
{{- define "postgresql.secretName" -}}
{{- if .Values.postgresql.auth.existingSecret }}
{{- .Values.postgresql.auth.existingSecret }}
{{- else }}
{{- printf "%s-postgresql" (include "xaheen-cli.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Environment-specific resource limits
*/}}
{{- define "xaheen-cli.resources" -}}
{{- if eq .Values.global.environment "production" }}
{{- toYaml .Values.production.resources }}
{{- else if eq .Values.global.environment "staging" }}
{{- toYaml .Values.staging.resources }}
{{- else if eq .Values.global.environment "development" }}
{{- toYaml .Values.development.resources }}
{{- else }}
{{- toYaml .Values.deployment.podTemplate.resources }}
{{- end }}
{{- end }}

{{/*
Environment-specific replica count
*/}}
{{- define "xaheen-cli.replicaCount" -}}
{{- if eq .Values.global.environment "production" }}
{{- .Values.production.replicaCount | default .Values.deployment.replicaCount }}
{{- else if eq .Values.global.environment "staging" }}
{{- .Values.staging.replicaCount | default .Values.deployment.replicaCount }}
{{- else if eq .Values.global.environment "development" }}
{{- .Values.development.replicaCount | default .Values.deployment.replicaCount }}
{{- else }}
{{- .Values.deployment.replicaCount }}
{{- end }}
{{- end }}

{{/*
Environment-specific NSM classification
*/}}
{{- define "xaheen-cli.nsmClassification" -}}
{{- if eq .Values.global.environment "production" }}
{{- .Values.production.nsmClassification | default .Values.global.norwegianCompliance.nsmClassification }}
{{- else if eq .Values.global.environment "staging" }}
{{- .Values.staging.nsmClassification | default .Values.global.norwegianCompliance.nsmClassification }}
{{- else if eq .Values.global.environment "development" }}
{{- .Values.development.nsmClassification | default .Values.global.norwegianCompliance.nsmClassification }}
{{- else }}
{{- .Values.global.norwegianCompliance.nsmClassification }}
{{- end }}
{{- end }}

{{/*
Blue-Green Deployment Color
*/}}
{{- define "xaheen-cli.deploymentColor" -}}
{{- if .Values.blueGreen.enabled }}
{{- .Values.blueGreen.activeColor | default "blue" }}
{{- else }}
{{- "" }}
{{- end }}
{{- end }}

{{/*
Canary Deployment Weight
*/}}
{{- define "xaheen-cli.canaryWeight" -}}
{{- if .Values.canary.enabled }}
{{- .Values.canary.weight | default 10 }}
{{- else }}
{{- 100 }}
{{- end }}
{{- end }}

{{/*
Image Pull Policy based on tag
*/}}
{{- define "xaheen-cli.imagePullPolicy" -}}
{{- if eq .Values.image.tag "latest" }}
{{- "Always" }}
{{- else }}
{{- .Values.image.pullPolicy | default "IfNotPresent" }}
{{- end }}
{{- end }}

{{/*
Generate certificates for webhook if required
*/}}
{{- define "xaheen-cli.gen-certs" -}}
{{- $altNames := list ( printf "%s.%s" (include "xaheen-cli.name" .) .Release.Namespace ) ( printf "%s.%s.svc" (include "xaheen-cli.name" .) .Release.Namespace ) -}}
{{- $ca := genCA "xaheen-cli-ca" 365 -}}
{{- $cert := genSignedCert ( include "xaheen-cli.name" . ) nil $altNames 365 $ca -}}
tls.crt: {{ $cert.Cert | b64enc }}
tls.key: {{ $cert.Key | b64enc }}
ca.crt: {{ $ca.Cert | b64enc }}
{{- end }}

{{/*
Validate Norwegian compliance configuration
*/}}
{{- define "xaheen-cli.validateNorwegianCompliance" -}}
{{- if .Values.global.norwegianCompliance.enabled }}
{{- if not (has .Values.global.norwegianCompliance.nsmClassification (list "OPEN" "RESTRICTED" "CONFIDENTIAL" "SECRET")) }}
{{- fail "Invalid NSM classification. Must be one of: OPEN, RESTRICTED, CONFIDENTIAL, SECRET" }}
{{- end }}
{{- if not (hasPrefix "nb-" .Values.global.norwegianCompliance.norwegianLocale) }}
{{- printf "Warning: Norwegian locale '%s' does not start with 'nb-'" .Values.global.norwegianCompliance.norwegianLocale }}
{{- end }}
{{- if ne .Values.global.norwegianCompliance.dataLocalization "norway" }}
{{- fail "Data localization must be set to 'norway' for Norwegian compliance" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Validate environment configuration
*/}}
{{- define "xaheen-cli.validateEnvironment" -}}
{{- if not (has .Values.global.environment (list "production" "staging" "development")) }}
{{- fail "Invalid environment. Must be one of: production, staging, development" }}
{{- end }}
{{- end }}

{{/*
Generate resource name with environment suffix
*/}}
{{- define "xaheen-cli.resourceName" -}}
{{- $name := include "xaheen-cli.fullname" . -}}
{{- if ne .Values.global.environment "production" }}
{{- printf "%s-%s" $name .Values.global.environment }}
{{- else }}
{{- $name }}
{{- end }}
{{- end }}

{{/*
Calculate effective replica count based on canary/blue-green
*/}}
{{- define "xaheen-cli.effectiveReplicaCount" -}}
{{- $baseReplicas := include "xaheen-cli.replicaCount" . | int -}}
{{- if .Values.canary.enabled }}
{{- div (mul $baseReplicas .Values.canary.weight) 100 | int }}
{{- else }}
{{- $baseReplicas }}
{{- end }}
{{- end }}
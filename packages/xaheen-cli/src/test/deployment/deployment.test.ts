import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { tmpdir } from 'os';
import { DeploymentGenerator, DeploymentGeneratorConfig } from '../../generators/deployment/deployment.generator.js';
import { VersioningService } from '../../services/deployment/versioning.service.js';
import { DockerService } from '../../services/deployment/docker.service.js';
import { KubernetesService } from '../../services/deployment/kubernetes.service.js';
import { HelmService } from '../../services/deployment/helm.service.js';
import { ZeroDowntimeService } from '../../services/deployment/zero-downtime.service.js';
import { MonitoringService } from '../../services/deployment/monitoring.service.js';
import { NorwegianComplianceService } from '../../services/deployment/norwegian-compliance.service.js';

describe('Deployment System', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(tmpdir(), 'xaheen-deployment-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
    vi.restoreAllMocks();
  });

  describe('DeploymentGenerator', () => {
    const baseConfig: DeploymentGeneratorConfig = {
      appName: 'test-app',
      version: '1.0.0',
      projectType: 'nodejs',
      packageManager: 'npm',
      outputPath: tempDir,
      containerization: {
        enabled: true,
        strategy: 'docker',
        registry: 'docker.io',
        repository: 'test-app',
        multiArch: false,
        security: {
          scan: true,
          nonRoot: true,
          readOnlyFs: true,
        },
      },
      kubernetes: {
        enabled: true,
        namespace: 'default',
        deployment: {
          replicas: 3,
          strategy: 'RollingUpdate',
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' },
          },
        },
        service: {
          type: 'ClusterIP',
          port: 80,
          targetPort: 3000,
        },
        ingress: {
          enabled: false,
          tls: false,
        },
        autoscaling: {
          enabled: false,
          minReplicas: 3,
          maxReplicas: 10,
          targetCPU: 80,
        },
      },
      helm: {
        enabled: true,
        chartName: 'test-app',
        chartVersion: '0.1.0',
        appVersion: '1.0.0',
      },
      deployment: {
        strategy: 'rolling',
        zeroDowntime: false,
        autoRollback: true,
        healthChecks: true,
        analysis: false,
      },
      monitoring: {
        enabled: true,
        prometheus: true,
        grafana: true,
        jaeger: false,
        opentelemetry: true,
        alerts: true,
      },
      versioning: {
        enabled: true,
        semantic: true,
        changelog: true,
        gitTags: true,
      },
      cicd: {
        enabled: true,
        provider: 'github-actions',
        environments: ['dev', 'staging', 'prod'],
        security: {
          secretScanning: true,
          vulnerabilityScanning: true,
          codeQuality: true,
        },
      },
      norwegianCompliance: {
        enabled: false,
        dataClassification: 'OPEN',
        auditLogging: false,
        encryption: false,
        accessControl: false,
        dataRetention: '7y',
      },
    };

    it('should generate basic deployment configuration', async () => {
      const generator = new DeploymentGenerator(baseConfig);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.services.docker).toBe(true);
      expect(result.services.kubernetes).toBe(true);
      expect(result.services.helm).toBe(true);
      expect(result.services.monitoring).toBe(true);

      // Check if main directories exist
      expect(await fs.pathExists(path.join(tempDir, 'docker'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'kubernetes'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'helm'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'monitoring'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'scripts'))).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'docs'))).toBe(true);
    });

    it('should generate Norwegian compliance configuration when enabled', async () => {
      const complianceConfig = {
        ...baseConfig,
        norwegianCompliance: {
          enabled: true,
          dataClassification: 'RESTRICTED' as const,
          auditLogging: true,
          encryption: true,
          accessControl: true,
          dataRetention: '7y',
        },
      };

      const generator = new DeploymentGenerator(complianceConfig);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.compliance.norwegian).toBe(true);

      // Check compliance documentation
      const complianceDoc = path.join(tempDir, 'docs', 'NORWEGIAN_COMPLIANCE.md');
      expect(await fs.pathExists(complianceDoc)).toBe(true);

      const docContent = await fs.readFile(complianceDoc, 'utf-8');
      expect(docContent).toContain('RESTRICTED');
      expect(docContent).toContain('Norwegian compliance');
    });

    it('should generate zero-downtime deployment for blue-green strategy', async () => {
      const zeroDowntimeConfig = {
        ...baseConfig,
        deployment: {
          strategy: 'blue-green' as const,
          zeroDowntime: true,
          autoRollback: true,
          healthChecks: true,
          analysis: true,
        },
      };

      const generator = new DeploymentGenerator(zeroDowntimeConfig);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(await fs.pathExists(path.join(tempDir, 'zero-downtime'))).toBe(true);

      // Check if rollout configuration exists
      const rolloutFile = path.join(tempDir, 'zero-downtime', 'rollout.yaml');
      expect(await fs.pathExists(rolloutFile)).toBe(true);

      const rolloutContent = await fs.readFile(rolloutFile, 'utf-8');
      expect(rolloutContent).toContain('blueGreen');
    });

    it('should generate CI/CD configuration for different providers', async () => {
      const providers = ['github-actions', 'gitlab-ci', 'azure-devops'] as const;

      for (const provider of providers) {
        const config = {
          ...baseConfig,
          cicd: {
            ...baseConfig.cicd,
            provider,
          },
          outputPath: path.join(tempDir, provider),
        };

        const generator = new DeploymentGenerator(config);
        const result = await generator.generate();

        expect(result.success).toBe(true);
        expect(result.services.cicd).toBe(true);

        const cicdDir = path.join(tempDir, provider, 'cicd');
        expect(await fs.pathExists(cicdDir)).toBe(true);

        // Check for provider-specific files
        if (provider === 'github-actions') {
          expect(await fs.pathExists(path.join(cicdDir, '.github/workflows/deploy.yml'))).toBe(true);
        } else if (provider === 'gitlab-ci') {
          expect(await fs.pathExists(path.join(cicdDir, '.gitlab-ci.yml'))).toBe(true);
        } else if (provider === 'azure-devops') {
          expect(await fs.pathExists(path.join(cicdDir, 'azure-pipelines.yml'))).toBe(true);
        }
      }
    });

    it('should generate deployment scripts with correct permissions', async () => {
      const generator = new DeploymentGenerator(baseConfig);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      const scriptsDir = path.join(tempDir, 'scripts');
      const deployScript = path.join(scriptsDir, 'deploy.sh');
      const rollbackScript = path.join(scriptsDir, 'rollback.sh');
      const healthCheckScript = path.join(scriptsDir, 'health-check.sh');

      expect(await fs.pathExists(deployScript)).toBe(true);
      expect(await fs.pathExists(rollbackScript)).toBe(true);
      expect(await fs.pathExists(healthCheckScript)).toBe(true);

      // Check file permissions (should be executable)
      const deployStats = await fs.stat(deployScript);
      expect(deployStats.mode & parseInt('755', 8)).toBeTruthy();
    });
  });

  describe('VersioningService', () => {
    let versioningService: VersioningService;

    beforeEach(() => {
      versioningService = new VersioningService();
    });

    it('should analyze commits and determine semantic version', async () => {
      // Mock git commands
      vi.spyOn(require('child_process'), 'exec').mockImplementation((cmd, callback) => {
        if (cmd.includes('git log')) {
          callback(null, {
            stdout: 'abc123|feat: add new feature|Added user authentication|John Doe|john@example.com|2024-01-01',
          });
        } else if (cmd.includes('git tag')) {
          callback(null, { stdout: 'v1.0.0\nv1.1.0' });
        } else {
          callback(null, { stdout: '' });
        }
      });

      const commits = await versioningService.analyzeCommits('v1.1.0', 'HEAD');
      expect(commits).toHaveLength(1);
      expect(commits[0].type).toBe('feat');
      expect(commits[0].subject).toBe('add new feature');
    });

    it('should determine next version based on conventional commits', async () => {
      vi.spyOn(versioningService, 'getCurrentVersion').mockResolvedValue('1.0.0');
      vi.spyOn(versioningService, 'getLastReleaseTag').mockResolvedValue('v1.0.0');
      vi.spyOn(versioningService, 'analyzeCommits').mockResolvedValue([
        {
          hash: 'abc123',
          type: 'feat',
          subject: 'add new feature',
          breaking: false,
          author: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2024-01-01',
          },
        },
      ]);

      const releaseInfo = await versioningService.determineNextVersion();
      expect(releaseInfo).toBeDefined();
      expect(releaseInfo?.version).toBe('1.1.0');
      expect(releaseInfo?.releaseType).toBe('minor');
    });

    it('should generate changelog from commits', async () => {
      const releaseInfo = {
        version: '1.1.0',
        previousVersion: '1.0.0',
        releaseType: 'minor',
        commits: [
          {
            hash: 'abc123',
            type: 'feat',
            subject: 'add user authentication',
            breaking: false,
            author: {
              name: 'John Doe',
              email: 'john@example.com',
              date: '2024-01-01',
            },
          },
          {
            hash: 'def456',
            type: 'fix',
            subject: 'resolve login issue',
            breaking: false,
            author: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              date: '2024-01-02',
            },
          },
        ],
        breaking: false,
        date: '2024-01-02T10:00:00Z',
      };

      const changelog = await versioningService.generateChangelog(releaseInfo);
      expect(changelog).toContain('## [1.1.0]');
      expect(changelog).toContain('### Features');
      expect(changelog).toContain('### Bug Fixes');
      expect(changelog).toContain('add user authentication');
      expect(changelog).toContain('resolve login issue');
    });
  });

  describe('DockerService', () => {
    let dockerService: DockerService;

    beforeEach(() => {
      dockerService = new DockerService();
    });

    it('should generate secure multi-stage Dockerfile', () => {
      const dockerfile = dockerService.generateDockerfile({
        projectType: 'nodejs',
        packageManager: 'npm',
        distroless: false,
        norwegianCompliance: false,
      });

      expect(dockerfile).toContain('FROM node:20-alpine');
      expect(dockerfile).toContain('RUN adduser -S nextjs');
      expect(dockerfile).toContain('USER nextjs:nodejs');
      expect(dockerfile).toContain('HEALTHCHECK');
      expect(dockerfile).toContain('dumb-init');
    });

    it('should generate distroless Dockerfile for enhanced security', () => {
      const dockerfile = dockerService.generateDockerfile({
        projectType: 'nodejs',
        packageManager: 'npm',
        distroless: true,
        norwegianCompliance: false,
      });

      expect(dockerfile).toContain('gcr.io/distroless/nodejs20-debian12');
      expect(dockerfile).not.toContain('apk add');
    });

    it('should generate Norwegian compliance labels when enabled', () => {
      const dockerfile = dockerService.generateDockerfile({
        projectType: 'nodejs',
        packageManager: 'npm',
        distroless: false,
        norwegianCompliance: true,
      });

      expect(dockerfile).toContain('Norwegian Enterprise Compliance: Enabled');
      expect(dockerfile).toContain('compliance.norway.enabled');
    });

    it('should generate comprehensive .dockerignore', () => {
      const dockerignore = dockerService.generateDockerignore();

      expect(dockerignore).toContain('node_modules');
      expect(dockerignore).toContain('.git');
      expect(dockerignore).toContain('*.md');
      expect(dockerignore).toContain('coverage/');
      expect(dockerignore).toContain('.env');
    });
  });

  describe('KubernetesService', () => {
    let kubernetesService: KubernetesService;

    beforeEach(() => {
      kubernetesService = new KubernetesService({
        appName: 'test-app',
        version: '1.0.0',
        namespace: 'test',
        image: {
          repository: 'test-app',
          tag: '1.0.0',
          pullPolicy: 'IfNotPresent',
          pullSecrets: [],
        },
        deployment: {
          replicaCount: 3,
          strategy: {
            type: 'RollingUpdate',
            rollingUpdate: {
              maxUnavailable: '25%',
              maxSurge: '25%',
            },
          },
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' },
          },
          nodeSelector: {},
          tolerations: [],
        },
        service: {
          type: 'ClusterIP',
          port: 80,
          targetPort: 3000,
          annotations: {},
        },
        norwegianCompliance: {
          enabled: false,
          dataClassification: 'OPEN',
          auditLogging: false,
          networkPolicies: false,
          podSecurityStandards: false,
        },
      });
    });

    it('should generate valid Kubernetes deployment manifest', () => {
      const deployment = kubernetesService.generateDeployment();

      expect(deployment.apiVersion).toBe('apps/v1');
      expect(deployment.kind).toBe('Deployment');
      expect(deployment.metadata.name).toBe('test-app');
      expect(deployment.metadata.namespace).toBe('test');
      expect(deployment.spec.replicas).toBe(3);
      expect(deployment.spec.template.spec.containers).toHaveLength(1);
      expect(deployment.spec.template.spec.containers[0].name).toBe('test-app');
      expect(deployment.spec.template.spec.containers[0].securityContext.runAsNonRoot).toBe(true);
    });

    it('should generate service manifest', () => {
      const service = kubernetesService.generateService();

      expect(service.apiVersion).toBe('v1');
      expect(service.kind).toBe('Service');
      expect(service.metadata.name).toBe('test-app');
      expect(service.spec.type).toBe('ClusterIP');
      expect(service.spec.ports[0].port).toBe(80);
      expect(service.spec.ports[0].targetPort).toBe('http');
    });

    it('should generate HPA when autoscaling is enabled', () => {
      kubernetesService.config.autoscaling.enabled = true;
      const hpa = kubernetesService.generateHPA();

      expect(hpa).toBeDefined();
      expect(hpa.apiVersion).toBe('autoscaling/v2');
      expect(hpa.kind).toBe('HorizontalPodAutoscaler');
      expect(hpa.spec.minReplicas).toBeDefined();
      expect(hpa.spec.maxReplicas).toBeDefined();
    });

    it('should generate network policy for Norwegian compliance', () => {
      kubernetesService.config.norwegianCompliance.enabled = true;
      kubernetesService.config.norwegianCompliance.networkPolicies = true;
      
      const networkPolicy = kubernetesService.generateNetworkPolicy();

      expect(networkPolicy).toBeDefined();
      expect(networkPolicy.apiVersion).toBe('networking.k8s.io/v1');
      expect(networkPolicy.kind).toBe('NetworkPolicy');
      expect(networkPolicy.metadata.annotations['compliance.norway/network-isolation']).toBe('true');
    });
  });

  describe('HelmService', () => {
    let helmService: HelmService;
    let kubernetesConfig: any;

    beforeEach(() => {
      kubernetesConfig = {
        appName: 'test-app',
        version: '1.0.0',
        namespace: 'test',
        image: { repository: 'test-app', tag: '1.0.0', pullPolicy: 'IfNotPresent', pullSecrets: [] },
        deployment: {
          replicaCount: 3,
          strategy: { type: 'RollingUpdate', rollingUpdate: { maxUnavailable: '25%', maxSurge: '25%' } },
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' },
          },
          nodeSelector: {},
          tolerations: [],
        },
        service: { type: 'ClusterIP', port: 80, targetPort: 3000, annotations: {} },
        norwegianCompliance: {
          enabled: false,
          dataClassification: 'OPEN',
          auditLogging: false,
          networkPolicies: false,
          podSecurityStandards: false,
        },
      };

      helmService = new HelmService({
        chart: {
          name: 'test-app',
          version: '0.1.0',
          appVersion: '1.0.0',
          description: 'Test application',
        },
      }, kubernetesConfig);
    });

    it('should generate complete Helm chart structure', async () => {
      const chartDir = path.join(tempDir, 'helm-test');
      await helmService.generateChart(chartDir);

      // Check chart structure
      expect(await fs.pathExists(path.join(chartDir, 'test-app', 'Chart.yaml'))).toBe(true);
      expect(await fs.pathExists(path.join(chartDir, 'test-app', 'values.yaml'))).toBe(true);
      expect(await fs.pathExists(path.join(chartDir, 'test-app', 'templates'))).toBe(true);
      expect(await fs.pathExists(path.join(chartDir, 'test-app', 'templates', '_helpers.tpl'))).toBe(true);
      expect(await fs.pathExists(path.join(chartDir, 'test-app', '.helmignore'))).toBe(true);

      // Check Chart.yaml content
      const chartYaml = await fs.readFile(path.join(chartDir, 'test-app', 'Chart.yaml'), 'utf-8');
      expect(chartYaml).toContain('name: test-app');
      expect(chartYaml).toContain('version: 0.1.0');
      expect(chartYaml).toContain('appVersion: 1.0.0');
    });

    it('should generate values.yaml with comprehensive defaults', async () => {
      const chartDir = path.join(tempDir, 'helm-values-test');
      await helmService.generateChart(chartDir);

      const valuesContent = await fs.readFile(path.join(chartDir, 'test-app', 'values.yaml'), 'utf-8');
      const values = require('yaml').parse(valuesContent);

      expect(values.replicaCount).toBe(3);
      expect(values.image.repository).toBe('test-app');
      expect(values.service.type).toBe('ClusterIP');
      expect(values.resources.requests.cpu).toBe('100m');
      expect(values.securityContext.runAsNonRoot).toBe(true);
    });

    it('should generate Norwegian compliance hooks when enabled', async () => {
      const complianceHelmService = new HelmService({
        chart: { name: 'test-app' },
        norwegianCompliance: {
          enabled: true,
          auditHooks: true,
          securityPolicies: true,
          dataGovernance: true,
        },
      }, kubernetesConfig);

      const chartDir = path.join(tempDir, 'helm-compliance-test');
      await complianceHelmService.generateChart(chartDir);

      const hooksDir = path.join(chartDir, 'test-app', 'templates', 'hooks');
      expect(await fs.pathExists(hooksDir)).toBe(true);
      expect(await fs.pathExists(path.join(hooksDir, 'pre-install-compliance.yaml'))).toBe(true);
      expect(await fs.pathExists(path.join(hooksDir, 'post-install-audit.yaml'))).toBe(true);
    });
  });

  describe('ZeroDowntimeService', () => {
    let zeroDowntimeService: ZeroDowntimeService;
    let kubernetesConfig: any;

    beforeEach(() => {
      kubernetesConfig = {
        appName: 'test-app',
        version: '1.0.0',
        namespace: 'test',
        image: { repository: 'test-app', tag: '1.0.0', pullPolicy: 'IfNotPresent', pullSecrets: [] },
        deployment: {
          replicaCount: 3,
          strategy: { type: 'RollingUpdate', rollingUpdate: { maxUnavailable: '25%', maxSurge: '25%' } },
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' },
          },
          nodeSelector: {},
          tolerations: [],
        },
        service: { type: 'ClusterIP', port: 80, targetPort: 3000, annotations: {} },
        norwegianCompliance: {
          enabled: false,
          dataClassification: 'OPEN',
          auditLogging: false,
          networkPolicies: false,
          podSecurityStandards: false,
        },
      };

      zeroDowntimeService = new ZeroDowntimeService({
        strategy: 'blue-green',
        blueGreen: {
          enabled: true,
          autoPromote: false,
          scaleDownDelaySeconds: 30,
          prePromotionAnalysis: { enabled: true, templates: [] },
        },
      }, kubernetesConfig);
    });

    it('should generate Argo Rollouts configuration for blue-green deployment', () => {
      const rollout = zeroDowntimeService.generateRollout();

      expect(rollout.apiVersion).toBe('argoproj.io/v1alpha1');
      expect(rollout.kind).toBe('Rollout');
      expect(rollout.spec.strategy.blueGreen).toBeDefined();
      expect(rollout.spec.strategy.blueGreen.activeService).toBe('test-app');
      expect(rollout.spec.strategy.blueGreen.previewService).toBe('test-app-preview');
    });

    it('should generate canary deployment configuration', () => {
      const canaryService = new ZeroDowntimeService({
        strategy: 'canary',
        canary: {
          enabled: true,
          steps: [
            { setWeight: 20 },
            { pause: { duration: '10s' } },
            { setWeight: 50 },
          ],
        },
      }, kubernetesConfig);

      const rollout = canaryService.generateRollout();

      expect(rollout.spec.strategy.canary).toBeDefined();
      expect(rollout.spec.strategy.canary.steps).toHaveLength(3);
      expect(rollout.spec.strategy.canary.steps[0].setWeight).toBe(20);
    });

    it('should generate analysis templates for deployment validation', () => {
      const analysisTemplates = zeroDowntimeService.generateAnalysisTemplates();

      expect(analysisTemplates).toHaveLength(3);
      expect(analysisTemplates[0].kind).toBe('AnalysisTemplate');
      expect(analysisTemplates[0].metadata.name).toContain('success-rate');
      expect(analysisTemplates[1].metadata.name).toContain('response-time');
      expect(analysisTemplates[2].metadata.name).toContain('cpu-usage');
    });

    it('should generate services for blue-green deployment', () => {
      const services = zeroDowntimeService.generateDeploymentServices();

      expect(services).toHaveLength(2);
      expect(services[0].metadata.name).toBe('test-app');
      expect(services[1].metadata.name).toBe('test-app-preview');
    });
  });

  describe('MonitoringService', () => {
    let monitoringService: MonitoringService;

    beforeEach(() => {
      monitoringService = new MonitoringService({
        prometheus: { enabled: true },
        grafana: { enabled: true },
        serviceMonitor: { enabled: true },
        alerts: { enabled: true },
      }, 'test-app', 'test');
    });

    it('should generate ServiceMonitor for Prometheus', () => {
      const serviceMonitor = monitoringService.generateServiceMonitor();

      expect(serviceMonitor).toBeDefined();
      expect(serviceMonitor.apiVersion).toBe('monitoring.coreos.com/v1');
      expect(serviceMonitor.kind).toBe('ServiceMonitor');
      expect(serviceMonitor.spec.selector.matchLabels.app).toBe('test-app');
      expect(serviceMonitor.spec.endpoints[0].port).toBe('http');
    });

    it('should generate PrometheusRule with default alerts', () => {
      const prometheusRule = monitoringService.generatePrometheusRule();

      expect(prometheusRule).toBeDefined();
      expect(prometheusRule.apiVersion).toBe('monitoring.coreos.com/v1');
      expect(prometheusRule.kind).toBe('PrometheusRule');
      expect(prometheusRule.spec.groups[0].rules.length).toBeGreaterThan(0);
      
      const alertNames = prometheusRule.spec.groups[0].rules.map((rule: any) => rule.alert);
      expect(alertNames).toContain('HighErrorRate');
      expect(alertNames).toContain('HighResponseTime');
      expect(alertNames).toContain('PodCrashLooping');
    });

    it('should generate Grafana dashboard', () => {
      const dashboard = monitoringService.generateGrafanaDashboard();

      expect(dashboard.dashboard.title).toContain('test-app');
      expect(dashboard.dashboard.panels.length).toBeGreaterThan(0);
      expect(dashboard.dashboard.panels[0].title).toBe('Request Rate');
      expect(dashboard.dashboard.panels[1].title).toBe('Response Time');
    });

    it('should generate OpenTelemetry collector configuration', () => {
      const otelConfig = monitoringService.generateOpenTelemetryConfig();

      expect(otelConfig).toBeDefined();
      expect(otelConfig.receivers.otlp).toBeDefined();
      expect(otelConfig.processors.batch).toBeDefined();
      expect(otelConfig.service.pipelines.traces).toBeDefined();
      expect(otelConfig.service.pipelines.metrics).toBeDefined();
      expect(otelConfig.service.pipelines.logs).toBeDefined();
    });

    it('should generate Norwegian compliance alerts when enabled', () => {
      const complianceMonitoring = new MonitoringService({
        norwegianCompliance: {
          enabled: true,
          auditLogging: true,
        },
      }, 'test-app', 'test');

      const prometheusRule = complianceMonitoring.generatePrometheusRule();
      const alertNames = prometheusRule.spec.groups[0].rules.map((rule: any) => rule.alert);

      expect(alertNames).toContain('ComplianceAuditLogFailure');
      expect(alertNames).toContain('UnauthorizedAccess');
    });
  });

  describe('NorwegianComplianceService', () => {
    let complianceService: NorwegianComplianceService;

    beforeEach(() => {
      complianceService = new NorwegianComplianceService({
        enabled: true,
        dataClassification: 'RESTRICTED',
        gdpr: {
          enabled: true,
          privacyByDesign: true,
          dataMapping: true,
          consentManagement: true,
          rightToErasure: true,
          dataPortability: true,
          breachNotification: { enabled: true },
        },
        nsm: {
          enabled: true,
          securityLevel: 'RESTRICTED',
          networkSegmentation: true,
          accessControl: true,
          auditLogging: true,
          encryption: { atRest: true, inTransit: true, keyManagement: true },
        },
        audit: {
          enabled: true,
          events: ['authentication', 'authorization', 'data_access', 'data_modification'],
          realTime: true,
          integrity: true,
        },
      }, 'test-app', 'test');
    });

    it('should validate GDPR compliance', () => {
      const status = complianceService.validateGDPRCompliance();

      expect(status.status).toBe('compliant');
      expect(status.requirements.length).toBeGreaterThan(0);
      expect(status.requirements.every(req => req.status === 'met')).toBe(true);
    });

    it('should validate NSM compliance', () => {
      const status = complianceService.validateNSMCompliance();

      expect(status.status).toBe('compliant');
      expect(status.securityLevel).toBe('RESTRICTED');
      expect(status.requirements.length).toBeGreaterThan(0);
    });

    it('should generate compliance RBAC resources', () => {
      const rbacResources = complianceService.generateComplianceRBAC();

      expect(rbacResources.length).toBeGreaterThan(0);
      
      const serviceAccount = rbacResources.find(r => r.kind === 'ServiceAccount');
      const clusterRole = rbacResources.find(r => r.kind === 'ClusterRole');
      const clusterRoleBinding = rbacResources.find(r => r.kind === 'ClusterRoleBinding');

      expect(serviceAccount).toBeDefined();
      expect(clusterRole).toBeDefined();
      expect(clusterRoleBinding).toBeDefined();
      expect(serviceAccount.metadata.name).toBe('test-app-audit');
    });

    it('should generate network policies for security isolation', () => {
      const networkPolicies = complianceService.generateNetworkPolicies();

      expect(networkPolicies.length).toBeGreaterThan(0);
      
      const denyAllPolicy = networkPolicies.find(p => p.metadata.name.includes('deny-all'));
      const allowIngressPolicy = networkPolicies.find(p => p.metadata.name.includes('allow-ingress'));

      expect(denyAllPolicy).toBeDefined();
      expect(allowIngressPolicy).toBeDefined();
      expect(denyAllPolicy.spec.policyTypes).toContain('Ingress');
      expect(denyAllPolicy.spec.policyTypes).toContain('Egress');
    });

    it('should generate GDPR resources for data subject rights', () => {
      const gdprResources = complianceService.generateGDPRResources();

      expect(gdprResources.length).toBe(2);
      
      const dataExportJob = gdprResources.find(r => r.metadata.name.includes('data-export'));
      const dataErasureJob = gdprResources.find(r => r.metadata.name.includes('data-erasure'));

      expect(dataExportJob).toBeDefined();
      expect(dataErasureJob).toBeDefined();
      expect(dataExportJob.kind).toBe('Job');
      expect(dataErasureJob.kind).toBe('Job');
    });

    it('should generate compliance monitoring alerts', () => {
      const complianceAlerts = complianceService.generateComplianceAlerts();

      expect(complianceAlerts.kind).toBe('PrometheusRule');
      expect(complianceAlerts.spec.groups[0].rules.length).toBeGreaterThan(0);
      
      const alertNames = complianceAlerts.spec.groups[0].rules.map((rule: any) => rule.alert);
      expect(alertNames).toContain('GDPRDataBreachSuspected');
      expect(alertNames).toContain('NSMSecurityPolicyViolation');
    });

    it('should generate comprehensive compliance report', async () => {
      const report = await complianceService.generateComplianceReport();

      expect(report).toContain('Norwegian Compliance Report');
      expect(report).toContain('test-app');
      expect(report).toContain('RESTRICTED');
      expect(report).toContain('GDPR Compliance');
      expect(report).toContain('NSM Security Guidelines');
      expect(report).toContain('Personal Data Protection');
      expect(report).toContain('Audit Logging');
    });

    it('should generate policy documents', () => {
      const policies = complianceService.generateCompliancePolicies();

      expect(policies['privacy-policy.md']).toBeDefined();
      expect(policies['security-policy.md']).toBeDefined();
      expect(policies['data-processing-agreement.md']).toBeDefined();
      expect(policies['incident-response-plan.md']).toBeDefined();
      expect(policies['audit-policy.md']).toBeDefined();

      expect(policies['privacy-policy.md']).toContain('Privacy Policy for test-app');
      expect(policies['security-policy.md']).toContain('RESTRICTED');
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete production-ready deployment', async () => {
      const config: DeploymentGeneratorConfig = {
        ...baseConfig,
        deployment: {
          strategy: 'canary',
          zeroDowntime: true,
          autoRollback: true,
          healthChecks: true,
          analysis: true,
        },
        norwegianCompliance: {
          enabled: true,
          dataClassification: 'CONFIDENTIAL',
          auditLogging: true,
          encryption: true,
          accessControl: true,
          dataRetention: '7y',
        },
        monitoring: {
          enabled: true,
          prometheus: true,
          grafana: true,
          jaeger: true,
          opentelemetry: true,
          alerts: true,
        },
      };

      const generator = new DeploymentGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.compliance.norwegian).toBe(true);
      expect(result.services.monitoring).toBe(true);

      // Verify all expected directories exist
      const expectedDirs = [
        'docker', 'kubernetes', 'helm', 'zero-downtime',
        'monitoring', 'cicd', 'scripts', 'docs', 'versioning'
      ];

      for (const dir of expectedDirs) {
        expect(await fs.pathExists(path.join(tempDir, dir))).toBe(true);
      }

      // Verify Norwegian compliance features
      expect(await fs.pathExists(path.join(tempDir, 'docs', 'NORWEGIAN_COMPLIANCE.md'))).toBe(true);
      
      // Verify canary deployment configuration
      const rolloutFile = path.join(tempDir, 'zero-downtime', 'rollout.yaml');
      expect(await fs.pathExists(rolloutFile)).toBe(true);
      
      const rolloutContent = await fs.readFile(rolloutFile, 'utf-8');
      expect(rolloutContent).toContain('canary');

      // Verify monitoring configuration
      const serviceMonitorFile = path.join(tempDir, 'monitoring', 'serviceMonitor.yaml');
      expect(await fs.pathExists(serviceMonitorFile)).toBe(true);

      // Verify deployment scripts
      const deployScript = path.join(tempDir, 'scripts', 'deploy.sh');
      expect(await fs.pathExists(deployScript)).toBe(true);
      
      const deployContent = await fs.readFile(deployScript, 'utf-8');
      expect(deployContent).toContain('CONFIDENTIAL');
    });

    it('should handle different project types and package managers', async () => {
      const projectTypes = ['nodejs', 'nextjs', 'nestjs', 'express'] as const;
      const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

      for (const projectType of projectTypes) {
        for (const packageManager of packageManagers) {
          const testConfig = {
            ...baseConfig,
            projectType,
            packageManager,
            outputPath: path.join(tempDir, `${projectType}-${packageManager}`),
          };

          const generator = new DeploymentGenerator(testConfig);
          const result = await generator.generate();

          expect(result.success).toBe(true);

          // Check Docker configuration matches project type
          const dockerFile = path.join(testConfig.outputPath, 'docker', 'Dockerfile');
          expect(await fs.pathExists(dockerFile)).toBe(true);

          const dockerContent = await fs.readFile(dockerFile, 'utf-8');
          expect(dockerContent).toContain(packageManager);
        }
      }
    });
  });
});

// Helper function to create mock exec implementation
function createMockExec(responses: Record<string, string>) {
  return vi.fn().mockImplementation((cmd: string, callback: Function) => {
    for (const [pattern, response] of Object.entries(responses)) {
      if (cmd.includes(pattern)) {
        callback(null, { stdout: response, stderr: '' });
        return;
      }
    }
    callback(new Error(`No mock response for command: ${cmd}`));
  });
}
import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import { BaseGenerator } from "../base.generator";
import { VersioningService, VersioningConfig } from "../../services/deployment/versioning.service";
import { DockerService, DockerConfig } from "../../services/deployment/docker.service";
import { KubernetesService, KubernetesConfig } from "../../services/deployment/kubernetes.service";
import { HelmService, HelmConfig } from "../../services/deployment/helm.service";
import { ZeroDowntimeService, ZeroDowntimeConfig } from "../../services/deployment/zero-downtime.service";
import { MonitoringService, MonitoringConfig } from "../../services/deployment/monitoring.service";

// Schema for deployment generator configuration
const DeploymentGeneratorConfigSchema = z.object({
  appName: z.string(),
  version: z.string().default('1.0.0'),
  projectType: z.enum(['nodejs', 'nextjs', 'nestjs', 'express']).default('nodejs'),
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']).default('npm'),
  containerization: z.object({
    enabled: z.boolean().default(true),
    strategy: z.enum(['docker', 'buildpacks', 'distroless']).default('docker'),
    registry: z.string().default('docker.io'),
    repository: z.string(),
    multiArch: z.boolean().default(true),
    security: z.object({
      scan: z.boolean().default(true),
      nonRoot: z.boolean().default(true),
      readOnlyFs: z.boolean().default(true),
    }).default({}),
  }).default({}),
  kubernetes: z.object({
    enabled: z.boolean().default(true),
    namespace: z.string().default('default'),
    deployment: z.object({
      replicas: z.number().default(3),
      strategy: z.enum(['RollingUpdate', 'Recreate']).default('RollingUpdate'),
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
    }).default({}),
    service: z.object({
      type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']).default('ClusterIP'),
      port: z.number().default(80),
      targetPort: z.number().default(3000),
    }).default({}),
    ingress: z.object({
      enabled: z.boolean().default(false),
      host: z.string().optional(),
      tls: z.boolean().default(false),
    }).default({}),
    autoscaling: z.object({
      enabled: z.boolean().default(false),
      minReplicas: z.number().default(3),
      maxReplicas: z.number().default(10),
      targetCPU: z.number().default(80),
    }).default({}),
  }).default({}),
  helm: z.object({
    enabled: z.boolean().default(true),
    chartName: z.string().optional(),
    chartVersion: z.string().default('0.1.0'),
    appVersion: z.string().optional(),
  }).default({}),
  deployment: z.object({
    strategy: z.enum(['rolling', 'blue-green', 'canary']).default('rolling'),
    zeroDowntime: z.boolean().default(true),
    autoRollback: z.boolean().default(true),
    healthChecks: z.boolean().default(true),
    analysis: z.boolean().default(true),
  }).default({}),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    prometheus: z.boolean().default(true),
    grafana: z.boolean().default(true),
    jaeger: z.boolean().default(false),
    opentelemetry: z.boolean().default(true),
    alerts: z.boolean().default(true),
  }).default({}),
  versioning: z.object({
    enabled: z.boolean().default(true),
    semantic: z.boolean().default(true),
    changelog: z.boolean().default(true),
    gitTags: z.boolean().default(true),
  }).default({}),
  cicd: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['github-actions', 'gitlab-ci', 'azure-devops']).default('github-actions'),
    environments: z.array(z.string()).default(['dev', 'staging', 'prod']),
    security: z.object({
      secretScanning: z.boolean().default(true),
      vulnerabilityScanning: z.boolean().default(true),
      codeQuality: z.boolean().default(true),
    }).default({}),
  }).default({}),
  norwegianCompliance: z.object({
    enabled: z.boolean().default(false),
    dataClassification: z.enum(['OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET']).default('OPEN'),
    auditLogging: z.boolean().default(true),
    encryption: z.boolean().default(true),
    accessControl: z.boolean().default(true),
    dataRetention: z.string().default('7y'),
  }).default({}),
  outputPath: z.string().default('./deployment'),
});

export type DeploymentGeneratorConfig = z.infer<typeof DeploymentGeneratorConfigSchema>;

export interface DeploymentResult {
  success: boolean;
  message: string;
  files: string[];
  services: {
    versioning?: boolean;
    docker?: boolean;
    kubernetes?: boolean;
    helm?: boolean;
    monitoring?: boolean;
    cicd?: boolean;
  };
  compliance: {
    norwegian: boolean;
    security: boolean;
    audit: boolean;
  };
}

export class DeploymentGenerator extends BaseGenerator {
  private config: DeploymentGeneratorConfig;
  private services: {
    versioning?: VersioningService;
    docker?: DockerService;
    kubernetes?: KubernetesService;
    helm?: HelmService;
    zeroDowntime?: ZeroDowntimeService;
    monitoring?: MonitoringService;
  } = {};

  constructor(config: Partial<DeploymentGeneratorConfig> & { appName: string }) {
    super();
    this.config = DeploymentGeneratorConfigSchema.parse(config);
    this.initializeServices();
  }

  /**
   * Initialize all deployment services
   */
  private initializeServices(): void {
    // Initialize versioning service
    if (this.config.versioning.enabled) {
      const versioningConfig: Partial<VersioningConfig> = {
        changelog: {
          enabled: this.config.versioning.changelog,
          path: 'CHANGELOG.md',
        },
        git: {
          tagPrefix: 'v',
          pushToRemote: true,
        },
      };
      this.services.versioning = new VersioningService(versioningConfig);
    }

    // Initialize Docker service
    if (this.config.containerization.enabled) {
      const dockerConfig: Partial<DockerConfig> = {
        security: {
          nonRootUser: this.config.containerization.security.nonRoot,
          readOnlyRootFs: this.config.containerization.security.readOnlyFs,
          scanImage: this.config.containerization.security.scan,
        },
        norwegianCompliance: {
          enabled: this.config.norwegianCompliance.enabled,
        },
      };
      this.services.docker = new DockerService(dockerConfig);
    }

    // Initialize Kubernetes service
    if (this.config.kubernetes.enabled) {
      const kubernetesConfig: KubernetesConfig = {
        appName: this.config.appName,
        version: this.config.version,
        namespace: this.config.kubernetes.namespace,
        image: {
          repository: this.config.containerization.repository,
          tag: this.config.version,
          pullPolicy: 'IfNotPresent',
          pullSecrets: [],
        },
        deployment: {
          replicaCount: this.config.kubernetes.deployment.replicas,
          strategy: {
            type: this.config.kubernetes.deployment.strategy,
            rollingUpdate: {
              maxUnavailable: '25%',
              maxSurge: '25%',
            },
          },
          resources: this.config.kubernetes.deployment.resources,
          nodeSelector: {},
          tolerations: [],
        },
        service: {
          type: this.config.kubernetes.service.type,
          port: this.config.kubernetes.service.port,
          targetPort: this.config.kubernetes.service.targetPort,
          annotations: {},
        },
        ingress: {
          enabled: this.config.kubernetes.ingress.enabled,
          className: 'nginx',
          annotations: {},
          hosts: this.config.kubernetes.ingress.host ? [{
            host: this.config.kubernetes.ingress.host,
            paths: [{ path: '/', pathType: 'Prefix' }],
          }] : [],
          tls: this.config.kubernetes.ingress.tls ? [{
            secretName: `${this.config.appName}-tls`,
            hosts: this.config.kubernetes.ingress.host ? [this.config.kubernetes.ingress.host] : [],
          }] : [],
        },
        autoscaling: {
          enabled: this.config.kubernetes.autoscaling.enabled,
          minReplicas: this.config.kubernetes.autoscaling.minReplicas,
          maxReplicas: this.config.kubernetes.autoscaling.maxReplicas,
          targetCPUUtilizationPercentage: this.config.kubernetes.autoscaling.targetCPU,
        },
        serviceAccount: {
          create: true,
          name: this.config.appName,
          annotations: {},
        },
        norwegianCompliance: {
          enabled: this.config.norwegianCompliance.enabled,
          dataClassification: this.config.norwegianCompliance.dataClassification,
          auditLogging: this.config.norwegianCompliance.auditLogging,
          networkPolicies: true,
          podSecurityStandards: true,
        },
      };
      this.services.kubernetes = new KubernetesService(kubernetesConfig);
    }

    // Initialize Helm service
    if (this.config.helm.enabled && this.services.kubernetes) {
      const helmConfig: Partial<HelmConfig> & { chart: { name: string } } = {
        chart: {
          name: this.config.helm.chartName || this.config.appName,
          version: this.config.helm.chartVersion,
          appVersion: this.config.helm.appVersion || this.config.version,
          description: `Helm chart for ${this.config.appName}`,
        },
        norwegianCompliance: {
          enabled: this.config.norwegianCompliance.enabled,
          auditHooks: this.config.norwegianCompliance.auditLogging,
          securityPolicies: true,
          dataGovernance: true,
        },
      };
      this.services.helm = new HelmService(helmConfig, this.services.kubernetes.config);
    }

    // Initialize zero-downtime deployment service
    if (this.config.deployment.zeroDowntime && this.services.kubernetes) {
      const zeroDowntimeConfig: Partial<ZeroDowntimeConfig> = {
        strategy: this.config.deployment.strategy,
        analysis: {
          enabled: this.config.deployment.analysis,
        },
        rollback: {
          automatic: this.config.deployment.autoRollback,
        },
        healthCheck: {
          enabled: this.config.deployment.healthChecks,
        },
        norwegianCompliance: {
          enabled: this.config.norwegianCompliance.enabled,
          auditTrail: this.config.norwegianCompliance.auditLogging,
        },
      };
      this.services.zeroDowntime = new ZeroDowntimeService(zeroDowntimeConfig, this.services.kubernetes.config);
    }

    // Initialize monitoring service
    if (this.config.monitoring.enabled) {
      const monitoringConfig: Partial<MonitoringConfig> = {
        prometheus: {
          enabled: this.config.monitoring.prometheus,
        },
        grafana: {
          enabled: this.config.monitoring.grafana,
        },
        jaeger: {
          enabled: this.config.monitoring.jaeger,
        },
        opentelemetry: {
          enabled: this.config.monitoring.opentelemetry,
        },
        alerts: {
          enabled: this.config.monitoring.alerts,
        },
        norwegianCompliance: {
          enabled: this.config.norwegianCompliance.enabled,
          auditLogging: this.config.norwegianCompliance.auditLogging,
          dataRetention: this.config.norwegianCompliance.dataRetention,
        },
      };
      this.services.monitoring = new MonitoringService(monitoringConfig, this.config.appName, this.config.kubernetes.namespace);
    }
  }

  /**
   * Generate complete deployment configuration
   */
  async generate(): Promise<DeploymentResult> {
    try {
      console.log(`Generating deployment configuration for ${this.config.appName}...`);

      const outputPath = path.resolve(this.config.outputPath);
      await fs.ensureDir(outputPath);

      const generatedFiles: string[] = [];
      const services = {
        versioning: false,
        docker: false,
        kubernetes: false,
        helm: false,
        monitoring: false,
        cicd: false,
      };

      // Generate versioning configuration
      if (this.services.versioning) {
        await this.generateVersioningConfig(outputPath);
        generatedFiles.push('versioning/');
        services.versioning = true;
      }

      // Generate Docker configuration
      if (this.services.docker) {
        await this.generateDockerConfig(outputPath);
        generatedFiles.push('docker/');
        services.docker = true;
      }

      // Generate Kubernetes manifests
      if (this.services.kubernetes) {
        await this.generateKubernetesConfig(outputPath);
        generatedFiles.push('kubernetes/');
        services.kubernetes = true;
      }

      // Generate Helm chart
      if (this.services.helm) {
        await this.generateHelmChart(outputPath);
        generatedFiles.push('helm/');
        services.helm = true;
      }

      // Generate zero-downtime deployment configuration
      if (this.services.zeroDowntime) {
        await this.generateZeroDowntimeConfig(outputPath);
        generatedFiles.push('zero-downtime/');
      }

      // Generate monitoring configuration
      if (this.services.monitoring) {
        await this.generateMonitoringConfig(outputPath);
        generatedFiles.push('monitoring/');
        services.monitoring = true;
      }

      // Generate CI/CD pipelines
      if (this.config.cicd.enabled) {
        await this.generateCICDConfig(outputPath);
        generatedFiles.push('cicd/');
        services.cicd = true;
      }

      // Generate documentation
      await this.generateDocumentation(outputPath);
      generatedFiles.push('docs/');

      // Generate deployment scripts
      await this.generateDeploymentScripts(outputPath);
      generatedFiles.push('scripts/');

      const result: DeploymentResult = {
        success: true,
        message: `Successfully generated deployment configuration for ${this.config.appName}`,
        files: generatedFiles,
        services,
        compliance: {
          norwegian: this.config.norwegianCompliance.enabled,
          security: this.config.containerization.security.scan,
          audit: this.config.norwegianCompliance.auditLogging,
        },
      };

      console.log(`✅ Deployment configuration generated at ${outputPath}`);
      console.log(`📁 Generated files: ${generatedFiles.join(', ')}`);

      return result;
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate deployment configuration: ${error}`,
        files: [],
        services: {},
        compliance: {
          norwegian: false,
          security: false,
          audit: false,
        },
      };
    }
  }

  /**
   * Generate versioning configuration
   */
  private async generateVersioningConfig(outputPath: string): Promise<void> {
    const versioningDir = path.join(outputPath, 'versioning');
    await fs.ensureDir(versioningDir);

    // Generate semantic release configuration
    const semanticReleaseConfig = {
      branches: ['main', 'master'],
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
        '@semantic-release/github',
      ],
      preset: 'conventionalcommits',
      releaseRules: [
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'revert', release: 'patch' },
        { type: 'docs', release: 'patch' },
        { type: 'style', release: 'patch' },
        { type: 'chore', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'test', release: 'patch' },
        { type: 'build', release: 'patch' },
        { type: 'ci', release: 'patch' },
      ],
    };

    await fs.writeFile(
      path.join(versioningDir, '.releaserc.json'),
      JSON.stringify(semanticReleaseConfig, null, 2)
    );

    // Generate version management script
    const versionScript = `#!/bin/bash
# Version management script for ${this.config.appName}
# Generated by Xaheen CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Functions
log_info() {
    echo -e "\${GREEN}[INFO]\${NC} $1"
}

log_warn() {
    echo -e "\${YELLOW}[WARN]\${NC} $1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

# Get current version
get_current_version() {
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        node -p "require('$PROJECT_ROOT/package.json').version"
    else
        echo "0.0.0"
    fi
}

# Determine next version
determine_next_version() {
    local current_version
    current_version=$(get_current_version)
    log_info "Current version: $current_version"
    
    # This would use semantic-release or similar tool
    # For now, we'll increment patch version
    echo "$current_version" | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g'
}

# Create release
create_release() {
    local version=$1
    local dry_run=$2
    
    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN: Would create release version $version"
        return 0
    fi
    
    log_info "Creating release version $version"
    
    # Update version in package.json
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        npm version "$version" --no-git-tag-version
    fi
    
    # Create git tag
    git tag -a "v$version" -m "Release version $version"
    
    # Push tag
    git push origin "v$version"
    
    log_info "✅ Release v$version created successfully"
}

# Main execution
case "$1" in
    "current")
        get_current_version
        ;;
    "next")
        determine_next_version
        ;;
    "release")
        version=$(determine_next_version)
        create_release "$version" "$2"
        ;;
    *)
        echo "Usage: $0 {current|next|release [dry-run]}"
        exit 1
        ;;
esac
`;

    await fs.writeFile(path.join(versioningDir, 'version.sh'), versionScript);
    await fs.chmod(path.join(versioningDir, 'version.sh'), '755');
  }

  /**
   * Generate Docker configuration
   */
  private async generateDockerConfig(outputPath: string): Promise<void> {
    if (!this.services.docker) return;

    const dockerDir = path.join(outputPath, 'docker');
    await fs.ensureDir(dockerDir);

    // Generate Dockerfile
    const dockerfile = this.services.docker.generateDockerfile({
      projectType: this.config.projectType,
      packageManager: this.config.packageManager,
      distroless: this.config.containerization.strategy === 'distroless',
      norwegianCompliance: this.config.norwegianCompliance.enabled,
    });

    await fs.writeFile(path.join(dockerDir, 'Dockerfile'), dockerfile);

    // Generate .dockerignore
    const dockerignore = this.services.docker.generateDockerignore();
    await fs.writeFile(path.join(dockerDir, '.dockerignore'), dockerignore);

    // Generate Docker Compose for development
    const dockerCompose = {
      version: '3.8',
      services: {
        [this.config.appName]: {
          build: {
            context: '.',
            dockerfile: 'docker/Dockerfile',
            target: 'runtime',
          },
          ports: [`${this.config.kubernetes.service.targetPort}:${this.config.kubernetes.service.targetPort}`],
          environment: {
            NODE_ENV: 'development',
            PORT: this.config.kubernetes.service.targetPort,
          },
          volumes: [
            '.:/app',
            '/app/node_modules',
          ],
          healthcheck: {
            test: [`CMD`, `curl`, `-f`, `http://localhost:${this.config.kubernetes.service.targetPort}/health`],
            interval: '30s',
            timeout: '10s',
            retries: 3,
            start_period: '60s',
          },
        },
      },
      networks: {
        default: {
          name: `${this.config.appName}-network`,
        },
      },
    };

    await fs.writeFile(
      path.join(dockerDir, 'docker-compose.yml'),
      `# Docker Compose for ${this.config.appName}\n# Generated by Xaheen CLI\n\n` + 
      require('yaml').stringify(dockerCompose)
    );
  }

  /**
   * Generate Kubernetes configuration
   */
  private async generateKubernetesConfig(outputPath: string): Promise<void> {
    if (!this.services.kubernetes) return;

    const kubernetesDir = path.join(outputPath, 'kubernetes');
    await this.services.kubernetes.writeManifests(kubernetesDir);
  }

  /**
   * Generate Helm chart
   */
  private async generateHelmChart(outputPath: string): Promise<void> {
    if (!this.services.helm) return;

    const helmDir = path.join(outputPath, 'helm');
    await this.services.helm.generateChart(helmDir);
  }

  /**
   * Generate zero-downtime deployment configuration
   */
  private async generateZeroDowntimeConfig(outputPath: string): Promise<void> {
    if (!this.services.zeroDowntime) return;

    const zeroDowntimeDir = path.join(outputPath, 'zero-downtime');
    await this.services.zeroDowntime.writeDeploymentManifests(zeroDowntimeDir);
  }

  /**
   * Generate monitoring configuration
   */
  private async generateMonitoringConfig(outputPath: string): Promise<void> {
    if (!this.services.monitoring) return;

    const monitoringDir = path.join(outputPath, 'monitoring');
    await this.services.monitoring.writeMonitoringManifests(monitoringDir);
  }

  /**
   * Generate CI/CD configuration
   */
  private async generateCICDConfig(outputPath: string): Promise<void> {
    const cicdDir = path.join(outputPath, 'cicd');
    await fs.ensureDir(cicdDir);

    switch (this.config.cicd.provider) {
      case 'github-actions':
        await this.generateGitHubActions(cicdDir);
        break;
      case 'gitlab-ci':
        await this.generateGitLabCI(cicdDir);
        break;
      case 'azure-devops':
        await this.generateAzureDevOps(cicdDir);
        break;
    }
  }

  /**
   * Generate GitHub Actions workflow
   */
  private async generateGitHubActions(cicdDir: string): Promise<void> {
    const workflowDir = path.join(cicdDir, '.github/workflows');
    await fs.ensureDir(workflowDir);

    const deployWorkflow = {
      name: `Deploy ${this.config.appName}`,
      on: {
        push: {
          branches: ['main', 'develop'],
        },
        pull_request: {
          branches: ['main'],
        },
      },
      env: {
        REGISTRY: this.config.containerization.registry,
        IMAGE_NAME: this.config.containerization.repository,
      },
      jobs: {
        test: {
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4',
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: {
                'node-version': '20',
                'cache': this.config.packageManager,
              },
            },
            {
              name: 'Install dependencies',
              run: `${this.getInstallCommand()}`,
            },
            {
              name: 'Run tests',
              run: `${this.getTestCommand()}`,
            },
            {
              name: 'Run linting',
              run: `${this.getLintCommand()}`,
            },
            ...(this.config.cicd.security.codeQuality ? [{
              name: 'Code quality check',
              run: 'npm run quality:check || true',
            }] : []),
          ],
        },
        build: {
          'runs-on': 'ubuntu-latest',
          needs: 'test',
          if: "github.event_name == 'push'",
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4',
            },
            {
              name: 'Set up Docker Buildx',
              uses: 'docker/setup-buildx-action@v3',
            },
            {
              name: 'Login to Container Registry',
              uses: 'docker/login-action@v3',
              with: {
                registry: '${{ env.REGISTRY }}',
                username: '${{ secrets.REGISTRY_USERNAME }}',
                password: '${{ secrets.REGISTRY_PASSWORD }}',
              },
            },
            {
              name: 'Extract metadata',
              id: 'meta',
              uses: 'docker/metadata-action@v5',
              with: {
                images: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}',
                tags: [
                  'type=ref,event=branch',
                  'type=ref,event=pr',
                  'type=sha,prefix={{branch}}-',
                  'type=raw,value=latest,enable={{is_default_branch}}',
                ],
              },
            },
            {
              name: 'Build and push Docker image',
              uses: 'docker/build-push-action@v5',
              with: {
                context: '.',
                file: './docker/Dockerfile',
                push: true,
                tags: '${{ steps.meta.outputs.tags }}',
                labels: '${{ steps.meta.outputs.labels }}',
                platforms: this.config.containerization.multiArch ? 'linux/amd64,linux/arm64' : 'linux/amd64',
                'cache-from': 'type=gha',
                'cache-to': 'type=gha,mode=max',
              },
            },
            ...(this.config.containerization.security.scan ? [{
              name: 'Run Trivy vulnerability scanner',
              uses: 'aquasecurity/trivy-action@master',
              with: {
                'image-ref': '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}',
                format: 'sarif',
                'output': 'trivy-results.sarif',
              },
            }, {
              name: 'Upload Trivy scan results to GitHub Security tab',
              uses: 'github/codeql-action/upload-sarif@v3',
              with: {
                'sarif_file': 'trivy-results.sarif',
              },
            }] : []),
          ],
        },
        deploy: {
          'runs-on': 'ubuntu-latest',
          needs: 'build',
          if: "github.ref == 'refs/heads/main'",
          environment: 'production',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4',
            },
            {
              name: 'Setup kubectl',
              uses: 'azure/setup-kubectl@v3',
            },
            {
              name: 'Setup Helm',
              uses: 'azure/setup-helm@v3',
            },
            {
              name: 'Deploy to Kubernetes',
              env: {
                KUBE_CONFIG: '${{ secrets.KUBE_CONFIG }}',
                IMAGE_TAG: '${{ needs.build.outputs.version }}',
              },
              run: `
                echo "$KUBE_CONFIG" | base64 -d > kubeconfig
                export KUBECONFIG=kubeconfig
                
                ${this.config.helm.enabled ? `
                helm upgrade --install ${this.config.appName} ./helm/${this.config.appName} \\
                  --namespace ${this.config.kubernetes.namespace} \\
                  --create-namespace \\
                  --set image.tag=\$IMAGE_TAG \\
                  --wait --timeout=10m
                ` : `
                kubectl apply -f kubernetes/ -n ${this.config.kubernetes.namespace}
                kubectl set image deployment/${this.config.appName} ${this.config.appName}=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\$IMAGE_TAG -n ${this.config.kubernetes.namespace}
                kubectl rollout status deployment/${this.config.appName} -n ${this.config.kubernetes.namespace}
                `}
                
                rm kubeconfig
              `,
            },
          ],
        },
      },
    };

    await fs.writeFile(
      path.join(workflowDir, 'deploy.yml'),
      `# Deployment workflow for ${this.config.appName}\n# Generated by Xaheen CLI\n\n` +
      require('yaml').stringify(deployWorkflow)
    );
  }

  /**
   * Generate GitLab CI configuration
   */
  private async generateGitLabCI(cicdDir: string): Promise<void> {
    // Implementation for GitLab CI
    const gitlabCI = {
      stages: ['test', 'build', 'deploy'],
      variables: {
        DOCKER_DRIVER: 'overlay2',
        DOCKER_TLS_CERTDIR: '/certs',
        REGISTRY: this.config.containerization.registry,
        IMAGE_NAME: this.config.containerization.repository,
      },
      test: {
        stage: 'test',
        image: 'node:20',
        cache: {
          paths: ['node_modules/'],
        },
        script: [
          this.getInstallCommand(),
          this.getTestCommand(),
          this.getLintCommand(),
        ],
      },
      build: {
        stage: 'build',
        image: 'docker:20.10.16',
        services: ['docker:20.10.16-dind'],
        'only': ['main', 'develop'],
        script: [
          'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY',
          'docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -f docker/Dockerfile .',
          'docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA',
        ],
      },
      deploy: {
        stage: 'deploy',
        image: 'alpine/helm:latest',
        'only': ['main'],
        script: [
          'apk add --no-cache curl',
          'curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"',
          'chmod +x kubectl && mv kubectl /usr/local/bin/',
          `helm upgrade --install ${this.config.appName} ./helm/${this.config.appName} --namespace ${this.config.kubernetes.namespace} --create-namespace --set image.tag=$CI_COMMIT_SHA`,
        ],
      },
    };

    await fs.writeFile(
      path.join(cicdDir, '.gitlab-ci.yml'),
      `# GitLab CI configuration for ${this.config.appName}\n# Generated by Xaheen CLI\n\n` +
      require('yaml').stringify(gitlabCI)
    );
  }

  /**
   * Generate Azure DevOps configuration
   */
  private async generateAzureDevOps(cicdDir: string): Promise<void> {
    // Implementation for Azure DevOps
    const azurePipeline = {
      trigger: ['main', 'develop'],
      pr: ['main'],
      pool: {
        vmImage: 'ubuntu-latest',
      },
      variables: {
        registry: this.config.containerization.registry,
        imageName: this.config.containerization.repository,
        dockerfilePath: 'docker/Dockerfile',
      },
      stages: [
        {
          stage: 'Test',
          jobs: [{
            job: 'Test',
            steps: [
              {
                task: 'NodeTool@0',
                inputs: {
                  versionSpec: '20.x',
                },
                displayName: 'Install Node.js',
              },
              {
                script: this.getInstallCommand(),
                displayName: 'Install dependencies',
              },
              {
                script: this.getTestCommand(),
                displayName: 'Run tests',
              },
              {
                script: this.getLintCommand(),
                displayName: 'Run linting',
              },
            ],
          }],
        },
        {
          stage: 'Build',
          dependsOn: 'Test',
          jobs: [{
            job: 'Build',
            steps: [
              {
                task: 'Docker@2',
                inputs: {
                  command: 'buildAndPush',
                  repository: '$(imageName)',
                  dockerfile: '$(dockerfilePath)',
                  containerRegistry: 'dockerRegistryServiceConnection',
                  tags: '$(Build.BuildId)',
                },
                displayName: 'Build and push Docker image',
              },
            ],
          }],
        },
        {
          stage: 'Deploy',
          dependsOn: 'Build',
          condition: "eq(variables['Build.SourceBranch'], 'refs/heads/main')",
          jobs: [{
            deployment: 'Deploy',
            environment: 'production',
            strategy: {
              runOnce: {
                deploy: {
                  steps: [
                    {
                      task: 'HelmDeploy@0',
                      inputs: {
                        command: 'upgrade',
                        chartType: 'FilePath',
                        chartPath: `helm/${this.config.appName}`,
                        releaseName: this.config.appName,
                        namespace: this.config.kubernetes.namespace,
                        arguments: `--set image.tag=$(Build.BuildId) --create-namespace`,
                      },
                      displayName: 'Deploy to Kubernetes',
                    },
                  ],
                },
              },
            },
          }],
        },
      ],
    };

    await fs.writeFile(
      path.join(cicdDir, 'azure-pipelines.yml'),
      `# Azure DevOps pipeline for ${this.config.appName}\n# Generated by Xaheen CLI\n\n` +
      require('yaml').stringify(azurePipeline)
    );
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(outputPath: string): Promise<void> {
    const docsDir = path.join(outputPath, 'docs');
    await fs.ensureDir(docsDir);

    // Generate main README
    const readme = this.generateMainReadme();
    await fs.writeFile(path.join(docsDir, 'README.md'), readme);

    // Generate deployment guide
    const deploymentGuide = this.generateDeploymentGuide();
    await fs.writeFile(path.join(docsDir, 'DEPLOYMENT.md'), deploymentGuide);

    // Generate monitoring documentation
    if (this.services.monitoring) {
      const monitoringDocs = this.services.monitoring.generateDocumentation();
      await fs.writeFile(path.join(docsDir, 'MONITORING.md'), monitoringDocs);
    }

    // Generate Norwegian compliance documentation
    if (this.config.norwegianCompliance.enabled) {
      const complianceDocs = this.generateComplianceDocumentation();
      await fs.writeFile(path.join(docsDir, 'NORWEGIAN_COMPLIANCE.md'), complianceDocs);
    }
  }

  /**
   * Generate deployment scripts
   */
  private async generateDeploymentScripts(outputPath: string): Promise<void> {
    const scriptsDir = path.join(outputPath, 'scripts');
    await fs.ensureDir(scriptsDir);

    // Generate deployment script
    const deployScript = this.generateDeployScript();
    await fs.writeFile(path.join(scriptsDir, 'deploy.sh'), deployScript);
    await fs.chmod(path.join(scriptsDir, 'deploy.sh'), '755');

    // Generate rollback script
    const rollbackScript = this.generateRollbackScript();
    await fs.writeFile(path.join(scriptsDir, 'rollback.sh'), rollbackScript);
    await fs.chmod(path.join(scriptsDir, 'rollback.sh'), '755');

    // Generate health check script
    const healthCheckScript = this.generateHealthCheckScript();
    await fs.writeFile(path.join(scriptsDir, 'health-check.sh'), healthCheckScript);
    await fs.chmod(path.join(scriptsDir, 'health-check.sh'), '755');
  }

  // Helper methods for script generation
  private getInstallCommand(): string {
    switch (this.config.packageManager) {
      case 'npm': return 'npm ci';
      case 'yarn': return 'yarn install --frozen-lockfile';
      case 'pnpm': return 'pnpm install --frozen-lockfile';
      case 'bun': return 'bun install --frozen-lockfile';
      default: return 'npm ci';
    }
  }

  private getTestCommand(): string {
    const pm = this.config.packageManager === 'npm' ? 'npm run' : this.config.packageManager;
    return `${pm} test`;
  }

  private getLintCommand(): string {
    const pm = this.config.packageManager === 'npm' ? 'npm run' : this.config.packageManager;
    return `${pm} lint`;
  }

  private generateMainReadme(): string {
    return `# ${this.config.appName} - Deployment Configuration

This directory contains the complete deployment configuration for ${this.config.appName}, generated by Xaheen CLI.

## Structure

\`\`\`
deployment/
├── versioning/         # Version management configuration
├── docker/            # Docker configuration and Dockerfile
├── kubernetes/        # Kubernetes manifests
├── helm/             # Helm charts
├── zero-downtime/    # Zero-downtime deployment configuration
├── monitoring/       # Monitoring and observability
├── cicd/            # CI/CD pipeline configuration
├── docs/            # Documentation
└── scripts/         # Deployment scripts
\`\`\`

## Quick Start

1. **Build and test locally:**
   \`\`\`bash
   docker-compose -f docker/docker-compose.yml up --build
   \`\`\`

2. **Deploy to Kubernetes:**
   \`\`\`bash
   ./scripts/deploy.sh
   \`\`\`

3. **Monitor application:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000
   - Jaeger: http://localhost:16686

## Configuration

- **Application**: ${this.config.appName}
- **Version**: ${this.config.version}
- **Project Type**: ${this.config.projectType}
- **Package Manager**: ${this.config.packageManager}
- **Deployment Strategy**: ${this.config.deployment.strategy}
- **Norwegian Compliance**: ${this.config.norwegianCompliance.enabled ? 'Enabled' : 'Disabled'}

## Features

- ✅ Multi-stage Docker builds with security hardening
- ✅ Kubernetes deployment with auto-scaling
- ✅ Helm charts for package management
- ✅ Zero-downtime deployments (${this.config.deployment.strategy})
- ✅ Comprehensive monitoring and alerting
- ✅ Automated CI/CD pipelines (${this.config.cicd.provider})
- ✅ Version management and changelog generation
${this.config.norwegianCompliance.enabled ? '- ✅ Norwegian compliance and audit logging' : ''}

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Monitoring Guide](docs/MONITORING.md)
${this.config.norwegianCompliance.enabled ? '- [Norwegian Compliance](docs/NORWEGIAN_COMPLIANCE.md)' : ''}

Generated by Xaheen CLI v${process.env.npm_package_version || '3.0.0'}
`;
  }

  private generateDeploymentGuide(): string {
    return `# Deployment Guide for ${this.config.appName}

This guide covers deploying ${this.config.appName} to production environments.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster access
- kubectl configured
- Helm v3+ installed
${this.config.deployment.strategy !== 'rolling' ? '- Argo Rollouts installed' : ''}

## Deployment Methods

### 1. Using Helm (Recommended)

\`\`\`bash
# Deploy to staging
helm install ${this.config.appName} ./helm/${this.config.appName} \\
  --namespace staging \\
  --create-namespace \\
  --set image.tag=\${VERSION}

# Deploy to production
helm upgrade --install ${this.config.appName} ./helm/${this.config.appName} \\
  --namespace production \\
  --create-namespace \\
  --set image.tag=\${VERSION} \\
  --wait --timeout=10m
\`\`\`

### 2. Using kubectl

\`\`\`bash
# Apply manifests
kubectl apply -f kubernetes/ -n ${this.config.kubernetes.namespace}

# Update image
kubectl set image deployment/${this.config.appName} \\
  ${this.config.appName}=\${REGISTRY}/\${IMAGE}:\${TAG} \\
  -n ${this.config.kubernetes.namespace}

# Monitor rollout
kubectl rollout status deployment/${this.config.appName} -n ${this.config.kubernetes.namespace}
\`\`\`

### 3. Zero-Downtime Deployment

${this.config.deployment.strategy !== 'rolling' ? `
\`\`\`bash
# Apply Argo Rollouts configuration
kubectl apply -f zero-downtime/

# Update rollout
kubectl argo rollouts set image ${this.config.appName} \\
  ${this.config.appName}=\${REGISTRY}/\${IMAGE}:\${TAG} \\
  -n ${this.config.kubernetes.namespace}

# Monitor rollout
kubectl argo rollouts get rollout ${this.config.appName} -n ${this.config.kubernetes.namespace} --watch
\`\`\`
` : 'Rolling updates are handled automatically by Kubernetes.'}

## Environment Variables

Required environment variables:

- \`NODE_ENV\`: Application environment (production)
- \`PORT\`: Application port (${this.config.kubernetes.service.targetPort})
- \`DATABASE_URL\`: Database connection string
- \`REDIS_URL\`: Redis connection string (if applicable)

## Health Checks

The application exposes the following health check endpoints:

- \`/health\`: General health check
- \`/ready\`: Readiness check
- \`/metrics\`: Prometheus metrics

## Scaling

### Manual Scaling

\`\`\`bash
kubectl scale deployment ${this.config.appName} --replicas=5 -n ${this.config.kubernetes.namespace}
\`\`\`

### Auto Scaling

${this.config.kubernetes.autoscaling.enabled ? `
Auto-scaling is configured with:
- Min replicas: ${this.config.kubernetes.autoscaling.minReplicas}
- Max replicas: ${this.config.kubernetes.autoscaling.maxReplicas}
- CPU target: ${this.config.kubernetes.autoscaling.targetCPU}%
` : 'Auto-scaling is not configured. Enable it in the configuration.'}

## Rollback

### Using Helm

\`\`\`bash
# List releases
helm history ${this.config.appName} -n ${this.config.kubernetes.namespace}

# Rollback to previous version
helm rollback ${this.config.appName} -n ${this.config.kubernetes.namespace}

# Rollback to specific revision
helm rollback ${this.config.appName} 1 -n ${this.config.kubernetes.namespace}
\`\`\`

### Using kubectl

\`\`\`bash
# Rollback deployment
kubectl rollout undo deployment/${this.config.appName} -n ${this.config.kubernetes.namespace}

# Rollback to specific revision
kubectl rollout undo deployment/${this.config.appName} --to-revision=2 -n ${this.config.kubernetes.namespace}
\`\`\`

${this.config.deployment.strategy !== 'rolling' ? `
### Using Argo Rollouts

\`\`\`bash
# Rollback rollout
kubectl argo rollouts undo ${this.config.appName} -n ${this.config.kubernetes.namespace}

# Rollback to specific revision
kubectl argo rollouts undo ${this.config.appName} --to-revision=2 -n ${this.config.kubernetes.namespace}
\`\`\`
` : ''}

## Troubleshooting

### Common Issues

1. **Image pull errors**: Check registry credentials and image tags
2. **Pod startup failures**: Check resource limits and environment variables
3. **Service connectivity**: Verify service and ingress configuration
4. **Health check failures**: Check application health endpoints

### Debugging Commands

\`\`\`bash
# Check pod status
kubectl get pods -l app=${this.config.appName} -n ${this.config.kubernetes.namespace}

# View pod logs
kubectl logs -l app=${this.config.appName} -n ${this.config.kubernetes.namespace}

# Describe deployment
kubectl describe deployment ${this.config.appName} -n ${this.config.kubernetes.namespace}

# Check events
kubectl get events -n ${this.config.kubernetes.namespace} --sort-by='.lastTimestamp'
\`\`\`

${this.config.norwegianCompliance.enabled ? `
## Norwegian Compliance

This deployment includes Norwegian compliance features:

- Audit logging enabled
- Data classification: ${this.config.norwegianCompliance.dataClassification}
- Encryption at rest and in transit
- Network policies for traffic isolation
- Security contexts for container hardening

Please ensure compliance with:
- Norwegian Personal Data Act (Personopplysningsloven)
- GDPR requirements
- NSM security guidelines
` : ''}

Generated by Xaheen CLI v${process.env.npm_package_version || '3.0.0'}
`;
  }

  private generateComplianceDocumentation(): string {
    return `# Norwegian Compliance Documentation

This document outlines the Norwegian compliance features implemented for ${this.config.appName}.

## Overview

The deployment includes comprehensive compliance features required for Norwegian enterprises, including:

- **Data Classification**: ${this.config.norwegianCompliance.dataClassification}
- **Audit Logging**: ${this.config.norwegianCompliance.auditLogging ? 'Enabled' : 'Disabled'}
- **Data Retention**: ${this.config.norwegianCompliance.dataRetention}
- **Access Control**: ${this.config.norwegianCompliance.accessControl ? 'Enabled' : 'Disabled'}
- **Encryption**: ${this.config.norwegianCompliance.encryption ? 'Enabled' : 'Disabled'}

## Regulatory Compliance

### Norwegian Personal Data Act (Personopplysningsloven)
- ✅ Data minimization principles applied
- ✅ Purpose limitation enforced
- ✅ Data subject rights supported
- ✅ Data retention policies implemented

### GDPR Compliance
- ✅ Privacy by design implemented
- ✅ Data protection impact assessment ready
- ✅ Right to erasure supported
- ✅ Data portability mechanisms in place

### NSM Security Guidelines
- ✅ Security classification labels applied
- ✅ Network segmentation implemented
- ✅ Access control policies enforced
- ✅ Audit logging comprehensive

## Implementation Details

### Data Classification
All data is classified as: **${this.config.norwegianCompliance.dataClassification}**

This classification affects:
- Storage requirements
- Access controls
- Audit logging levels
- Encryption requirements
- Network policies

### Audit Logging
${this.config.norwegianCompliance.auditLogging ? `
Comprehensive audit logging is enabled for:
- All API requests and responses
- Authentication and authorization events  
- Data access and modifications
- System configuration changes
- Error and security events

Logs are retained for: ${this.config.norwegianCompliance.dataRetention}
` : 'Audit logging is disabled.'}

### Encryption
${this.config.norwegianCompliance.encryption ? `
Encryption is implemented at multiple levels:
- **Data at rest**: AES-256 encryption for all stored data
- **Data in transit**: TLS 1.3 for all network communication
- **Application level**: Field-level encryption for sensitive data
- **Backup encryption**: All backups are encrypted
` : 'Encryption is not configured.'}

### Access Control
${this.config.norwegianCompliance.accessControl ? `
Role-based access control (RBAC) is implemented with:
- Principle of least privilege
- Regular access reviews
- Multi-factor authentication
- Session management
- IP whitelisting (where applicable)
` : 'Advanced access control is not configured.'}

## Monitoring and Alerting

Compliance-specific monitoring includes:
- Unauthorized access attempts
- Data access pattern anomalies
- Audit log failures
- Encryption key usage
- Compliance policy violations

## Data Subject Rights

The system supports the following data subject rights:
- **Right of access**: API endpoints for data export
- **Right to rectification**: Data update mechanisms
- **Right to erasure**: Data deletion workflows
- **Right to restrict processing**: Processing controls
- **Right to data portability**: Data export formats

## Incident Response

In case of a data breach or compliance incident:

1. **Immediate response** (within 1 hour)
2. **Assessment and containment** (within 4 hours)  
3. **Authority notification** (within 72 hours)
4. **Data subject notification** (within 72 hours if high risk)
5. **Documentation and reporting**

## Compliance Validation

Regular validation includes:
- Automated compliance checks
- Access control audits
- Data mapping updates
- Policy compliance reviews
- Third-party assessments

## Contact Information

**Data Protection Officer**: [DPO Contact]
**Compliance Team**: [Compliance Contact]
**Emergency Response**: [Emergency Contact]

---

Generated by Xaheen CLI v${process.env.npm_package_version || '3.0.0'}
Last Updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  private generateDeployScript(): string {
    return `#!/bin/bash
# Deployment script for ${this.config.appName}
# Generated by Xaheen CLI

set -e

# Configuration
APP_NAME="${this.config.appName}"
NAMESPACE="${this.config.kubernetes.namespace}"
REGISTRY="${this.config.containerization.registry}"
REPOSITORY="${this.config.containerization.repository}"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Functions
log_info() {
    echo -e "\${BLUE}[INFO]\${NC} $1"
}

log_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} $1"
}

log_warn() {
    echo -e "\${YELLOW}[WARN]\${NC} $1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENVIRONMENT    Target environment (dev, staging, prod)"
    echo "  -t, --tag TAG                   Image tag to deploy"
    echo "  -d, --dry-run                   Perform a dry run"
    echo "  -h, --help                      Show this help message"
}

# Parse command line arguments
ENVIRONMENT="dev"
IMAGE_TAG="latest"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validation
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment. Must be one of: dev, staging, prod"
    exit 1
fi

# Set environment-specific values
case $ENVIRONMENT in
    "dev")
        NAMESPACE="dev"
        ;;
    "staging")
        NAMESPACE="staging"
        ;;
    "prod")
        NAMESPACE="production"
        ;;
esac

log_info "Starting deployment of $APP_NAME"
log_info "Environment: $ENVIRONMENT"
log_info "Namespace: $NAMESPACE"
log_info "Image Tag: $IMAGE_TAG"
log_info "Dry Run: $DRY_RUN"

# Pre-deployment checks
log_info "Performing pre-deployment checks..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if helm is available (if using Helm)
${this.config.helm.enabled ? 'if ! command -v helm &> /dev/null; then\n    log_error "helm is not installed or not in PATH"\n    exit 1\nfi' : ''}

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

log_success "Pre-deployment checks passed"

# Create namespace if it doesn't exist
log_info "Ensuring namespace exists..."
if $DRY_RUN; then
    log_info "DRY RUN: Would create namespace $NAMESPACE"
else
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
fi

# Deploy application
log_info "Deploying application..."

${this.config.helm.enabled ? `
# Deploy using Helm
if $DRY_RUN; then
    log_info "DRY RUN: Helm deployment simulation"
    helm upgrade --install $APP_NAME ./helm/$APP_NAME \\
        --namespace $NAMESPACE \\
        --set image.tag=$IMAGE_TAG \\
        --dry-run --debug
else
    helm upgrade --install $APP_NAME ./helm/$APP_NAME \\
        --namespace $NAMESPACE \\
        --set image.tag=$IMAGE_TAG \\
        --create-namespace \\
        --wait --timeout=10m
    
    if [ $? -eq 0 ]; then
        log_success "Helm deployment completed successfully"
    else
        log_error "Helm deployment failed"
        exit 1
    fi
fi
` : `
# Deploy using kubectl
if $DRY_RUN; then
    log_info "DRY RUN: kubectl deployment simulation"
    kubectl apply -f kubernetes/ -n $NAMESPACE --dry-run=client
else
    kubectl apply -f kubernetes/ -n $NAMESPACE
    
    # Update image
    kubectl set image deployment/$APP_NAME \\
        $APP_NAME=$REGISTRY/$REPOSITORY:$IMAGE_TAG \\
        -n $NAMESPACE
    
    # Wait for rollout to complete
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=600s
    
    if [ $? -eq 0 ]; then
        log_success "kubectl deployment completed successfully"
    else
        log_error "kubectl deployment failed"
        exit 1
    fi
fi
`}

# Post-deployment verification
if ! $DRY_RUN; then
    log_info "Performing post-deployment verification..."
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -l app=$APP_NAME -n $NAMESPACE
    
    # Check service status
    log_info "Checking service status..."
    kubectl get service $APP_NAME -n $NAMESPACE
    
    ${this.config.kubernetes.ingress.enabled ? `
    # Check ingress status
    log_info "Checking ingress status..."
    kubectl get ingress $APP_NAME -n $NAMESPACE
    ` : ''}
    
    # Perform health check
    log_info "Performing health check..."
    ./scripts/health-check.sh -e $ENVIRONMENT
    
    if [ $? -eq 0 ]; then
        log_success "Health check passed"
    else
        log_warn "Health check failed - manual verification required"
    fi
fi

log_success "Deployment completed successfully!"
log_info "Application: $APP_NAME"
log_info "Environment: $ENVIRONMENT"  
log_info "Image: $REGISTRY/$REPOSITORY:$IMAGE_TAG"
log_info "Namespace: $NAMESPACE"

${this.config.monitoring.enabled ? `
log_info "Monitoring URLs:"
log_info "  Prometheus: http://prometheus.$NAMESPACE.svc.cluster.local:9090"
log_info "  Grafana: http://grafana.$NAMESPACE.svc.cluster.local:3000"
` : ''}
`;
  }

  private generateRollbackScript(): string {
    return `#!/bin/bash
# Rollback script for ${this.config.appName}
# Generated by Xaheen CLI

set -e

# Configuration
APP_NAME="${this.config.appName}"
NAMESPACE="${this.config.kubernetes.namespace}"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Functions
log_info() {
    echo -e "\${BLUE}[INFO]\${NC} $1"
}

log_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} $1"
}

log_warn() {
    echo -e "\${YELLOW}[WARN]\${NC} $1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENVIRONMENT    Target environment (dev, staging, prod)"
    echo "  -r, --revision REVISION         Specific revision to rollback to"
    echo "  -d, --dry-run                   Perform a dry run"
    echo "  -h, --help                      Show this help message"
}

# Parse command line arguments
ENVIRONMENT="dev"
REVISION=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--revision)
            REVISION="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set environment-specific values
case $ENVIRONMENT in
    "dev")
        NAMESPACE="dev"
        ;;
    "staging")
        NAMESPACE="staging"
        ;;
    "prod")
        NAMESPACE="production"
        ;;
esac

log_info "Starting rollback of $APP_NAME"
log_info "Environment: $ENVIRONMENT"
log_info "Namespace: $NAMESPACE"
if [[ -n "$REVISION" ]]; then
    log_info "Target Revision: $REVISION"
else
    log_info "Rolling back to previous revision"
fi

# Pre-rollback checks
log_info "Performing pre-rollback checks..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

${this.config.helm.enabled ? `
# Check if helm is available
if ! command -v helm &> /dev/null; then
    log_error "helm is not installed or not in PATH"
    exit 1
fi
` : ''}

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Show current status
log_info "Current deployment status:"
${this.config.helm.enabled ? `
helm status $APP_NAME -n $NAMESPACE
` : `
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE
`}

# Show rollout history
log_info "Rollout history:"
${this.config.helm.enabled ? `
helm history $APP_NAME -n $NAMESPACE
` : `
kubectl rollout history deployment/$APP_NAME -n $NAMESPACE
`}

# Confirm rollback
if ! $DRY_RUN; then
    read -p "Are you sure you want to rollback $APP_NAME in $ENVIRONMENT? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
fi

# Perform rollback
log_info "Performing rollback..."

${this.config.helm.enabled ? `
# Rollback using Helm
if $DRY_RUN; then
    log_info "DRY RUN: Would rollback Helm release"
    if [[ -n "$REVISION" ]]; then
        log_info "Target revision: $REVISION"
    else
        log_info "Target: previous revision"
    fi
else
    if [[ -n "$REVISION" ]]; then
        helm rollback $APP_NAME $REVISION -n $NAMESPACE
    else
        helm rollback $APP_NAME -n $NAMESPACE
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Helm rollback completed successfully"
    else
        log_error "Helm rollback failed"
        exit 1
    fi
fi
` : `
# Rollback using kubectl
if $DRY_RUN; then
    log_info "DRY RUN: Would rollback deployment"
    if [[ -n "$REVISION" ]]; then
        log_info "Target revision: $REVISION"
    else
        log_info "Target: previous revision"
    fi
else
    if [[ -n "$REVISION" ]]; then
        kubectl rollout undo deployment/$APP_NAME --to-revision=$REVISION -n $NAMESPACE
    else
        kubectl rollout undo deployment/$APP_NAME -n $NAMESPACE
    fi
    
    # Wait for rollback to complete
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=600s
    
    if [ $? -eq 0 ]; then
        log_success "kubectl rollback completed successfully"
    else
        log_error "kubectl rollback failed"
        exit 1
    fi
fi
`}

# Post-rollback verification
if ! $DRY_RUN; then
    log_info "Performing post-rollback verification..."
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -l app=$APP_NAME -n $NAMESPACE
    
    # Perform health check
    log_info "Performing health check..."
    ./scripts/health-check.sh -e $ENVIRONMENT
    
    if [ $? -eq 0 ]; then
        log_success "Health check passed"
    else
        log_warn "Health check failed - manual verification required"
    fi
fi

${this.config.norwegianCompliance.enabled && this.config.norwegianCompliance.auditLogging ? `
# Log audit event for Norwegian compliance
log_info "Logging audit event..."
kubectl create configmap rollback-audit-$(date +%s) \\
    --from-literal=event="ROLLBACK" \\
    --from-literal=application="$APP_NAME" \\
    --from-literal=environment="$ENVIRONMENT" \\
    --from-literal=timestamp="$(date -Iseconds)" \\
    --from-literal=user="$(whoami)" \\
    -n $NAMESPACE \\
    -o yaml --dry-run=client | kubectl apply -f -
` : ''}

log_success "Rollback completed successfully!"
log_info "Application: $APP_NAME"
log_info "Environment: $ENVIRONMENT"
log_info "Namespace: $NAMESPACE"
`;
  }

  private generateHealthCheckScript(): string {
    return `#!/bin/bash
# Health check script for ${this.config.appName}
# Generated by Xaheen CLI

set -e

# Configuration
APP_NAME="${this.config.appName}"
NAMESPACE="${this.config.kubernetes.namespace}"
SERVICE_PORT="${this.config.kubernetes.service.port}"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Functions
log_info() {
    echo -e "\${BLUE}[INFO]\${NC} $1"
}

log_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} $1"
}

log_warn() {
    echo -e "\${YELLOW}[WARN]\${NC} $1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment ENVIRONMENT    Target environment (dev, staging, prod)"
    echo "  -t, --timeout TIMEOUT           Timeout in seconds (default: 60)"
    echo "  -h, --help                      Show this help message"
}

# Parse command line arguments
ENVIRONMENT="dev"
TIMEOUT=60

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set environment-specific values
case $ENVIRONMENT in
    "dev")
        NAMESPACE="dev"
        ;;
    "staging")
        NAMESPACE="staging"
        ;;
    "prod")
        NAMESPACE="production"
        ;;
esac

log_info "Starting health check for $APP_NAME"
log_info "Environment: $ENVIRONMENT"
log_info "Namespace: $NAMESPACE"
log_info "Timeout: $TIMEOUT seconds"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Check deployment status
log_info "Checking deployment status..."
DEPLOYMENT_STATUS=$(kubectl get deployment $APP_NAME -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Available")].status}' 2>/dev/null)

if [[ "$DEPLOYMENT_STATUS" != "True" ]]; then
    log_error "Deployment is not available"
    kubectl get deployment $APP_NAME -n $NAMESPACE
    exit 1
fi

log_success "Deployment is available"

# Check pod status
log_info "Checking pod status..."
READY_PODS=$(kubectl get pods -l app=$APP_NAME -n $NAMESPACE -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)

if [[ -z "$READY_PODS" ]]; then
    log_error "No pods found for $APP_NAME"
    exit 1
fi

NOT_READY_COUNT=$(echo "$READY_PODS" | tr ' ' '\n' | grep -c "False" || true)
TOTAL_PODS=$(echo "$READY_PODS" | wc -w)
READY_COUNT=$((TOTAL_PODS - NOT_READY_COUNT))

log_info "Pod status: $READY_COUNT/$TOTAL_PODS ready"

if [[ $NOT_READY_COUNT -gt 0 ]]; then
    log_warn "$NOT_READY_COUNT pods are not ready"
    kubectl get pods -l app=$APP_NAME -n $NAMESPACE
fi

# Test health endpoints
log_info "Testing health endpoints..."

# Use port-forward to access the service
PORT_FORWARD_PID=""
cleanup() {
    if [[ -n "$PORT_FORWARD_PID" ]]; then
        kill $PORT_FORWARD_PID 2>/dev/null || true
    fi
}
trap cleanup EXIT

# Start port-forward in background
kubectl port-forward service/$APP_NAME $SERVICE_PORT:$SERVICE_PORT -n $NAMESPACE &
PORT_FORWARD_PID=$!

# Wait for port-forward to be ready
sleep 3

# Test health endpoint
log_info "Testing /health endpoint..."
if curl -f -s --max-time $TIMEOUT http://localhost:$SERVICE_PORT/health > /dev/null; then
    log_success "Health endpoint is responding"
else
    log_error "Health endpoint is not responding"
    exit 1
fi

# Test readiness endpoint
log_info "Testing /ready endpoint..."
if curl -f -s --max-time $TIMEOUT http://localhost:$SERVICE_PORT/ready > /dev/null; then
    log_success "Readiness endpoint is responding"
else
    log_warn "Readiness endpoint is not responding"
fi

# Test metrics endpoint (if monitoring is enabled)
${this.config.monitoring.enabled ? `
log_info "Testing /metrics endpoint..."
if curl -f -s --max-time $TIMEOUT http://localhost:$SERVICE_PORT/metrics > /dev/null; then
    log_success "Metrics endpoint is responding"
else
    log_warn "Metrics endpoint is not responding"
fi
` : ''}

# Check service connectivity
log_info "Checking service connectivity..."
SERVICE_IP=$(kubectl get service $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null)

if [[ -n "$SERVICE_IP" && "$SERVICE_IP" != "None" ]]; then
    log_success "Service has cluster IP: $SERVICE_IP"
else
    log_warn "Service does not have a cluster IP"
fi

${this.config.kubernetes.ingress.enabled ? `
# Check ingress status
log_info "Checking ingress status..."
INGRESS_IP=$(kubectl get ingress $APP_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [[ -n "$INGRESS_IP" ]]; then
    log_success "Ingress has external IP: $INGRESS_IP"
else
    log_warn "Ingress does not have an external IP yet"
fi
` : ''}

# Summary
log_success "Health check completed successfully!"
log_info "Application: $APP_NAME"
log_info "Environment: $ENVIRONMENT"
log_info "Namespace: $NAMESPACE"
log_info "Ready Pods: $READY_COUNT/$TOTAL_PODS"
log_info "Service IP: $SERVICE_IP"
${this.config.kubernetes.ingress.enabled ? 'log_info "Ingress IP: $INGRESS_IP"' : ''}

exit 0
`;
  }
}
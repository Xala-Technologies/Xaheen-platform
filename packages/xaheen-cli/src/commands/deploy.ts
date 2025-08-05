import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { select, text, confirm, multiselect } from '@clack/prompts';
import { DeploymentGenerator, DeploymentGeneratorConfig } from '../generators/deployment/deployment.generator.js';
import { VersioningService } from '../services/deployment/versioning.service.js';
import { DockerService } from '../services/deployment/docker.service.js';
import { KubernetesService } from '../services/deployment/kubernetes.service.js';
import { HelmService } from '../services/deployment/helm.service.js';
import { ZeroDowntimeService } from '../services/deployment/zero-downtime.service.js';
import { MonitoringService } from '../services/deployment/monitoring.service.js';

// Schema for CLI options
const DeployCommandOptionsSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['nodejs', 'nextjs', 'nestjs', 'express']).optional(),
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']).optional(),
  strategy: z.enum(['rolling', 'blue-green', 'canary']).optional(),
  registry: z.string().optional(),
  repository: z.string().optional(),
  namespace: z.string().optional(),
  environment: z.enum(['dev', 'staging', 'prod']).optional(),
  monitoring: z.boolean().optional(),
  compliance: z.boolean().optional(),
  output: z.string().optional(),
  interactive: z.boolean().default(true),
  dryRun: z.boolean().default(false),
});

type DeployCommandOptions = z.infer<typeof DeployCommandOptionsSchema>;

/**
 * Create deployment command
 */
export function createDeployCommand(): Command {
  const command = new Command('deploy');

  command
    .description('Generate production-ready deployment configurations')
    .option('-n, --name <name>', 'Application name')
    .option('-t, --type <type>', 'Project type (nodejs, nextjs, nestjs, express)')
    .option('-p, --package-manager <manager>', 'Package manager (npm, yarn, pnpm, bun)')
    .option('-s, --strategy <strategy>', 'Deployment strategy (rolling, blue-green, canary)')
    .option('-r, --registry <registry>', 'Container registry')
    .option('--repository <repository>', 'Container repository')
    .option('--namespace <namespace>', 'Kubernetes namespace')
    .option('-e, --environment <env>', 'Target environment (dev, staging, prod)')
    .option('--monitoring', 'Enable monitoring and observability')
    .option('--compliance', 'Enable Norwegian compliance features')
    .option('-o, --output <path>', 'Output directory', './deployment')
    .option('--no-interactive', 'Disable interactive mode')
    .option('--dry-run', 'Show what would be generated without creating files')
    .action(async (options: DeployCommandOptions) => {
      try {
        console.log(chalk.blue('\n🚀 Xaheen Deployment Generator\n'));

        const parsedOptions = DeployCommandOptionsSchema.parse(options);
        
        // Run deployment generation
        const config = parsedOptions.interactive
          ? await runInteractiveMode(parsedOptions)
          : await buildConfigFromOptions(parsedOptions);

        await generateDeployment(config, parsedOptions.dryRun);
      } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error}`));
        process.exit(1);
      }
    });

  // Add subcommands
  addVersionCommand(command);
  addDockerCommand(command);
  addKubernetesCommand(command);
  addHelmCommand(command);
  addMonitoringCommand(command);
  addStatusCommand(command);

  return command;
}

/**
 * Run interactive mode to collect configuration
 */
async function runInteractiveMode(options: DeployCommandOptions): Promise<DeploymentGeneratorConfig> {
  console.log(chalk.cyan('📋 Let\'s configure your deployment...\n'));

  // Application details
  const appName = options.name || await text({
    message: 'What is your application name?',
    placeholder: 'my-app',
    validate: (value) => {
      if (!value) return 'Application name is required';
      if (!/^[a-z0-9-]+$/.test(value)) return 'Application name must be lowercase alphanumeric with hyphens';
      return;
    },
  }) as string;

  const projectType = options.type || await select({
    message: 'What type of project is this?',
    options: [
      { value: 'nodejs', label: 'Node.js (Generic)' },
      { value: 'nextjs', label: 'Next.js' },
      { value: 'nestjs', label: 'NestJS' },
      { value: 'express', label: 'Express.js' },
    ],
  }) as 'nodejs' | 'nextjs' | 'nestjs' | 'express';

  const packageManager = options.packageManager || await select({
    message: 'Which package manager do you use?',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'Yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'Bun' },
    ],
  }) as 'npm' | 'yarn' | 'pnpm' | 'bun';

  // Container configuration
  const registry = options.registry || await text({
    message: 'Container registry URL?',
    placeholder: 'docker.io',
    initialValue: 'docker.io',
  }) as string;

  const repository = options.repository || await text({
    message: 'Container repository name?',
    placeholder: `${appName}`,
    initialValue: appName,
  }) as string;

  // Kubernetes configuration
  const namespace = options.namespace || await text({
    message: 'Kubernetes namespace?',
    placeholder: 'default',
    initialValue: 'default',
  }) as string;

  const deploymentStrategy = options.strategy || await select({
    message: 'Which deployment strategy do you prefer?',
    options: [
      { value: 'rolling', label: '🔄 Rolling Update (Default)' },
      { value: 'blue-green', label: '🔵 Blue-Green (Zero Downtime)' },
      { value: 'canary', label: '🐤 Canary (Gradual Rollout)' },
    ],
  }) as 'rolling' | 'blue-green' | 'canary';

  // Features selection
  const features = await multiselect({
    message: 'Which features would you like to enable?',
    options: [
      { value: 'monitoring', label: '📊 Monitoring & Observability (Prometheus, Grafana)', selected: true },
      { value: 'helm', label: '⎈ Helm Charts', selected: true },
      { value: 'autoscaling', label: '📈 Auto-scaling (HPA)', selected: false },
      { value: 'ingress', label: '🌐 Ingress (Load Balancer)', selected: false },
      { value: 'multiarch', label: '🏗️ Multi-architecture builds', selected: false },
      { value: 'security', label: '🔒 Security scanning', selected: true },
      { value: 'cicd', label: '🔄 CI/CD Pipeline', selected: true },
    ],
  }) as string[];

  // Environment configuration
  const environments = await multiselect({
    message: 'Which environments do you need?',
    options: [
      { value: 'dev', label: '🔧 Development', selected: true },
      { value: 'staging', label: '🧪 Staging', selected: true },
      { value: 'prod', label: '🚀 Production', selected: true },
    ],
  }) as string[];

  // Norwegian compliance
  const enableCompliance = options.compliance || await confirm({
    message: 'Enable Norwegian compliance features? (GDPR, NSM guidelines)',
  }) as boolean;

  let complianceLevel = 'OPEN';
  if (enableCompliance) {
    complianceLevel = await select({
      message: 'What data classification level?',
      options: [
        { value: 'OPEN', label: '🟢 OPEN (Public data)' },
        { value: 'RESTRICTED', label: '🟡 RESTRICTED (Internal use)' },
        { value: 'CONFIDENTIAL', label: '🟠 CONFIDENTIAL (Sensitive data)' },
        { value: 'SECRET', label: '🔴 SECRET (Highly sensitive)' },
      ],
    }) as string;
  }

  // CI/CD provider
  const cicdProvider = features.includes('cicd') ? await select({
    message: 'Which CI/CD provider?',
    options: [
      { value: 'github-actions', label: '🐙 GitHub Actions' },
      { value: 'gitlab-ci', label: '🦊 GitLab CI' },
      { value: 'azure-devops', label: '🔷 Azure DevOps' },
    ],
  }) as 'github-actions' | 'gitlab-ci' | 'azure-devops' : 'github-actions';

  // Build configuration
  const config: DeploymentGeneratorConfig = {
    appName,
    version: '1.0.0',
    projectType,
    packageManager,
    outputPath: options.output || './deployment',
    
    containerization: {
      enabled: true,
      strategy: 'docker',
      registry,
      repository,
      multiArch: features.includes('multiarch'),
      security: {
        scan: features.includes('security'),
        nonRoot: true,
        readOnlyFs: true,
      },
    },
    
    kubernetes: {
      enabled: true,
      namespace,
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
        enabled: features.includes('ingress'),
        tls: features.includes('ingress'),
      },
      autoscaling: {
        enabled: features.includes('autoscaling'),
        minReplicas: 3,
        maxReplicas: 10,
        targetCPU: 80,
      },
    },
    
    helm: {
      enabled: features.includes('helm'),
      chartName: appName,
      chartVersion: '0.1.0',
      appVersion: '1.0.0',
    },
    
    deployment: {
      strategy: deploymentStrategy,
      zeroDowntime: deploymentStrategy !== 'rolling',
      autoRollback: true,
      healthChecks: true,
      analysis: deploymentStrategy !== 'rolling',
    },
    
    monitoring: {
      enabled: features.includes('monitoring'),
      prometheus: features.includes('monitoring'),
      grafana: features.includes('monitoring'),
      jaeger: false,
      opentelemetry: features.includes('monitoring'),
      alerts: features.includes('monitoring'),
    },
    
    versioning: {
      enabled: true,
      semantic: true,
      changelog: true,
      gitTags: true,
    },
    
    cicd: {
      enabled: features.includes('cicd'),
      provider: cicdProvider,
      environments,
      security: {
        secretScanning: true,
        vulnerabilityScanning: features.includes('security'),
        codeQuality: true,
      },
    },
    
    norwegianCompliance: {
      enabled: enableCompliance,
      dataClassification: complianceLevel as any,
      auditLogging: enableCompliance,
      encryption: enableCompliance,
      accessControl: enableCompliance,
      dataRetention: '7y',
    },
  };

  return config;
}

/**
 * Build configuration from command line options
 */
async function buildConfigFromOptions(options: DeployCommandOptions): Promise<DeploymentGeneratorConfig> {
  // Detect current project if not specified
  let appName = options.name;
  let projectType = options.type;
  let packageManager = options.packageManager;

  if (!appName || !projectType || !packageManager) {
    const detected = await detectProjectInfo();
    appName = appName || detected.name;
    projectType = projectType || detected.type;
    packageManager = packageManager || detected.packageManager;
  }

  if (!appName) {
    throw new Error('Application name is required. Use --name option or run in interactive mode.');
  }

  const config: DeploymentGeneratorConfig = {
    appName,
    version: '1.0.0',
    projectType: projectType || 'nodejs',
    packageManager: packageManager || 'npm',
    outputPath: options.output || './deployment',
    
    containerization: {
      enabled: true,
      strategy: 'docker',
      registry: options.registry || 'docker.io',
      repository: options.repository || appName,
      multiArch: true,
      security: {
        scan: true,
        nonRoot: true,
        readOnlyFs: true,
      },
    },
    
    kubernetes: {
      enabled: true,
      namespace: options.namespace || 'default',
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
      chartName: appName,
      chartVersion: '0.1.0',
      appVersion: '1.0.0',
    },
    
    deployment: {
      strategy: options.strategy || 'rolling',
      zeroDowntime: (options.strategy && options.strategy !== 'rolling') || false,
      autoRollback: true,
      healthChecks: true,
      analysis: (options.strategy && options.strategy !== 'rolling') || false,
    },
    
    monitoring: {
      enabled: options.monitoring !== false,
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
      enabled: options.compliance || false,
      dataClassification: 'OPEN',
      auditLogging: options.compliance || false,
      encryption: options.compliance || false,
      accessControl: options.compliance || false,
      dataRetention: '7y',
    },
  };

  return config;
}

/**
 * Generate deployment configuration
 */
async function generateDeployment(config: DeploymentGeneratorConfig, dryRun: boolean): Promise<void> {
  console.log(chalk.cyan('\n🔧 Generating deployment configuration...\n'));

  if (dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be created\n'));
  }

  // Display configuration summary
  console.log(chalk.gray('Configuration Summary:'));
  console.log(chalk.gray(`  Application: ${config.appName}`));
  console.log(chalk.gray(`  Project Type: ${config.projectType}`));
  console.log(chalk.gray(`  Package Manager: ${config.packageManager}`));
  console.log(chalk.gray(`  Deployment Strategy: ${config.deployment.strategy}`));
  console.log(chalk.gray(`  Container Registry: ${config.containerization.registry}`));
  console.log(chalk.gray(`  Kubernetes Namespace: ${config.kubernetes.namespace}`));
  console.log(chalk.gray(`  Monitoring: ${config.monitoring.enabled ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.gray(`  Norwegian Compliance: ${config.norwegianCompliance.enabled ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.gray(`  Output Path: ${config.outputPath}\n`));

  if (dryRun) {
    console.log(chalk.green('✅ Configuration validated successfully!'));
    console.log(chalk.yellow('Use --no-dry-run to generate the actual files.'));
    return;
  }

  // Generate deployment configuration
  const generator = new DeploymentGenerator(config);
  const result = await generator.generate();

  if (result.success) {
    console.log(chalk.green('✅ Deployment configuration generated successfully!\n'));
    
    console.log(chalk.cyan('📁 Generated Files:'));
    result.files.forEach(file => {
      console.log(chalk.gray(`  • ${file}`));
    });

    console.log(chalk.cyan('\n🛠️ Services Configured:'));
    Object.entries(result.services).forEach(([service, enabled]) => {
      if (enabled) {
        console.log(chalk.green(`  ✓ ${service}`));
      }
    });

    console.log(chalk.cyan('\n🔒 Compliance Features:'));
    Object.entries(result.compliance).forEach(([feature, enabled]) => {
      if (enabled) {
        console.log(chalk.green(`  ✓ ${feature}`));
      }
    });

    console.log(chalk.cyan('\n📖 Next Steps:'));
    console.log(chalk.gray('  1. Review the generated configuration files'));
    console.log(chalk.gray('  2. Customize values as needed for your environment'));
    console.log(chalk.gray('  3. Build and push your container image'));
    console.log(chalk.gray('  4. Deploy using the generated scripts:'));
    console.log(chalk.yellow(`     cd ${config.outputPath} && ./scripts/deploy.sh`));
    console.log(chalk.gray('  5. Monitor your application using the provided dashboards'));

    if (config.norwegianCompliance.enabled) {
      console.log(chalk.yellow('\n⚠️  Norwegian Compliance Notice:'));
      console.log(chalk.gray('     Please review the compliance documentation'));
      console.log(chalk.gray('     and ensure your organization meets all requirements.'));
    }
  } else {
    console.error(chalk.red(`\n❌ ${result.message}`));
    process.exit(1);
  }
}

/**
 * Detect project information from current directory
 */
async function detectProjectInfo(): Promise<{
  name: string | null;
  type: 'nodejs' | 'nextjs' | 'nestjs' | 'express' | null;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | null;
}> {
  let name: string | null = null;
  let type: 'nodejs' | 'nextjs' | 'nestjs' | 'express' | null = null;
  let packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | null = null;

  try {
    // Try to read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      name = packageJson.name;

      // Detect project type from dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.next) {
        type = 'nextjs';
      } else if (deps['@nestjs/core']) {
        type = 'nestjs';
      } else if (deps.express) {
        type = 'express';
      } else {
        type = 'nodejs';
      }
    }

    // Detect package manager from lock files
    if (await fs.pathExists('bun.lockb')) {
      packageManager = 'bun';
    } else if (await fs.pathExists('pnpm-lock.yaml')) {
      packageManager = 'pnpm';
    } else if (await fs.pathExists('yarn.lock')) {
      packageManager = 'yarn';
    } else if (await fs.pathExists('package-lock.json')) {
      packageManager = 'npm';
    }

    // Fallback to directory name for app name
    if (!name) {
      name = path.basename(process.cwd());
    }
  } catch (error) {
    // Ignore detection errors
  }

  return { name, type, packageManager };
}

/**
 * Add version subcommand
 */
function addVersionCommand(parentCommand: Command): void {
  const versionCommand = new Command('version');
  
  versionCommand
    .description('Manage application versioning')
    .option('--current', 'Show current version')
    .option('--next', 'Show next version')
    .option('--release', 'Create a new release')
    .option('--dry-run', 'Show what would be done')
    .action(async (options) => {
      try {
        const versioningService = new VersioningService();

        if (options.current) {
          const version = await versioningService.getCurrentVersion();
          console.log(chalk.cyan(`Current version: ${version}`));
        } else if (options.next) {
          const releaseInfo = await versioningService.determineNextVersion();
          if (releaseInfo) {
            console.log(chalk.cyan(`Next version: ${releaseInfo.version} (${releaseInfo.releaseType})`));
          } else {
            console.log(chalk.yellow('No changes detected since last release'));
          }
        } else if (options.release) {
          const releaseInfo = await versioningService.performRelease({ dryRun: options.dryRun });
          if (releaseInfo) {
            console.log(chalk.green(`✅ Release ${releaseInfo.version} ${options.dryRun ? 'planned' : 'created'} successfully!`));
          } else {
            console.log(chalk.yellow('No changes to release'));
          }
        } else {
          console.log(chalk.yellow('Use --current, --next, or --release'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(versionCommand);
}

/**
 * Add docker subcommand
 */
function addDockerCommand(parentCommand: Command): void {
  const dockerCommand = new Command('docker');
  
  dockerCommand
    .description('Docker container operations')
    .option('--build', 'Build Docker image')
    .option('--scan', 'Scan image for vulnerabilities')
    .option('--tag <tag>', 'Image tag', 'latest')
    .option('--platform <platforms>', 'Target platforms (comma-separated)', 'linux/amd64')
    .action(async (options) => {
      try {
        const dockerService = new DockerService();

        if (options.build) {
          const platforms = options.platform.split(',');
          const buildResult = await dockerService.buildImage({
            tag: options.tag,
            platform: platforms,
          });
          console.log(chalk.green(`✅ Image built successfully: ${buildResult.repository}:${buildResult.tag}`));
          console.log(chalk.gray(`   Size: ${buildResult.size}`));
        }

        if (options.scan) {
          console.log(chalk.cyan('🔍 Scanning image for vulnerabilities...'));
          const scanResult = await dockerService.scanImage(options.tag);
          
          if (scanResult.passed) {
            console.log(chalk.green('✅ Security scan passed'));
          } else {
            console.log(chalk.red('❌ Security scan found issues'));
          }
          
          console.log(chalk.gray(`   High/Critical: ${scanResult.highSeverity}`));
          console.log(chalk.gray(`   Medium: ${scanResult.mediumSeverity}`));
          console.log(chalk.gray(`   Low: ${scanResult.lowSeverity}`));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(dockerCommand);
}

/**
 * Add kubernetes subcommand
 */
function addKubernetesCommand(parentCommand: Command): void {
  const k8sCommand = new Command('kubernetes');
  
  k8sCommand
    .alias('k8s')
    .description('Kubernetes deployment operations')
    .option('--apply', 'Apply manifests to cluster')
    .option('--status', 'Get deployment status')
    .option('--scale <replicas>', 'Scale deployment')
    .option('--rollback [revision]', 'Rollback deployment')
    .option('--namespace <namespace>', 'Kubernetes namespace', 'default')
    .option('--app-name <name>', 'Application name')
    .action(async (options) => {
      try {
        if (!options.appName) {
          const detected = await detectProjectInfo();
          options.appName = detected.name;
        }

        if (!options.appName) {
          throw new Error('Application name is required');
        }

        const kubernetesService = new KubernetesService({
          appName: options.appName,
          namespace: options.namespace,
        });

        if (options.apply) {
          await kubernetesService.apply('./deployment/kubernetes');
          console.log(chalk.green('✅ Manifests applied successfully'));
        }

        if (options.status) {
          const status = await kubernetesService.getDeploymentStatus();
          console.log(chalk.cyan('Deployment Status:'));
          console.log(chalk.gray(`  Name: ${status.name}`));
          console.log(chalk.gray(`  Namespace: ${status.namespace}`));
          console.log(chalk.gray(`  Ready: ${status.ready}`));
          console.log(chalk.gray(`  Available: ${status.available}`));
          console.log(chalk.gray(`  Age: ${status.age}`));
        }

        if (options.scale) {
          await kubernetesService.scale(parseInt(options.scale));
          console.log(chalk.green(`✅ Scaled to ${options.scale} replicas`));
        }

        if (options.rollback !== undefined) {
          const revision = options.rollback ? parseInt(options.rollback) : undefined;
          await kubernetesService.rollback(revision);
          console.log(chalk.green('✅ Rollback completed'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(k8sCommand);
}

/**
 * Add helm subcommand
 */
function addHelmCommand(parentCommand: Command): void {
  const helmCommand = new Command('helm');
  
  helmCommand
    .description('Helm chart operations')
    .option('--install', 'Install/upgrade Helm release')
    .option('--uninstall', 'Uninstall Helm release')
    .option('--status', 'Get release status')
    .option('--test', 'Run Helm tests')
    .option('--rollback [revision]', 'Rollback release')
    .option('--namespace <namespace>', 'Kubernetes namespace', 'default')
    .option('--release-name <name>', 'Helm release name')
    .option('--chart-path <path>', 'Path to Helm chart', './deployment/helm')
    .action(async (options) => {
      try {
        if (!options.releaseName) {
          const detected = await detectProjectInfo();
          options.releaseName = detected.name;
        }

        if (!options.releaseName) {
          throw new Error('Release name is required');
        }

        const helmService = new HelmService({
          chart: { name: options.releaseName }
        }, {} as any);

        if (options.install) {
          await helmService.install(options.releaseName, options.chartPath, {
            namespace: options.namespace,
          });
          console.log(chalk.green('✅ Helm release installed successfully'));
        }

        if (options.uninstall) {
          await helmService.uninstall(options.releaseName, options.namespace);
          console.log(chalk.green('✅ Helm release uninstalled'));
        }

        if (options.status) {
          const status = await helmService.status(options.releaseName, options.namespace);
          console.log(chalk.cyan('Release Status:'));
          console.log(JSON.stringify(status, null, 2));
        }

        if (options.test) {
          await helmService.test(options.releaseName, options.namespace);
          console.log(chalk.green('✅ Helm tests completed'));
        }

        if (options.rollback !== undefined) {
          const revision = options.rollback ? parseInt(options.rollback) : undefined;
          await helmService.rollback(options.releaseName, revision, options.namespace);
          console.log(chalk.green('✅ Rollback completed'));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(helmCommand);
}

/**
 * Add monitoring subcommand
 */
function addMonitoringCommand(parentCommand: Command): void {
  const monitoringCommand = new Command('monitoring');
  
  monitoringCommand
    .description('Monitoring and observability operations')
    .option('--setup', 'Setup monitoring stack')
    .option('--health', 'Check application health')
    .option('--metrics', 'Get metrics summary')
    .option('--app-name <name>', 'Application name')
    .option('--namespace <namespace>', 'Kubernetes namespace', 'default')
    .action(async (options) => {
      try {
        if (!options.appName) {
          const detected = await detectProjectInfo();
          options.appName = detected.name;
        }

        if (!options.appName) {
          throw new Error('Application name is required');
        }

        const monitoringService = new MonitoringService({}, options.appName, options.namespace);

        if (options.setup) {
          await monitoringService.setupMonitoringStack();
          console.log(chalk.green('✅ Monitoring stack setup completed'));
        }

        if (options.health) {
          const healthStatus = await monitoringService.checkHealth();
          console.log(chalk.cyan('Health Status:'));
          healthStatus.forEach(status => {
            const statusColor = status.status === 'healthy' ? chalk.green : chalk.red;
            console.log(`  ${statusColor(status.status.toUpperCase())} ${status.endpoint} (${status.responseTime}ms)`);
          });
        }

        if (options.metrics) {
          const metrics = await monitoringService.getMetricsSummary();
          console.log(chalk.cyan('Metrics Summary:'));
          console.log(chalk.gray(`  Request Rate: ${metrics.requestRate.toFixed(2)} req/s`));
          console.log(chalk.gray(`  Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`));
          console.log(chalk.gray(`  Response Time: ${(metrics.responseTime * 1000).toFixed(0)}ms`));
          console.log(chalk.gray(`  CPU Usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`));
          console.log(chalk.gray(`  Memory Usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`));
          console.log(chalk.gray(`  Uptime: ${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m`));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(monitoringCommand);
}

/**
 * Add status subcommand
 */
function addStatusCommand(parentCommand: Command): void {
  const statusCommand = new Command('status');
  
  statusCommand
    .description('Get overall deployment status')
    .option('--app-name <name>', 'Application name')
    .option('--namespace <namespace>', 'Kubernetes namespace', 'default')
    .option('--environment <env>', 'Environment to check')
    .action(async (options) => {
      try {
        if (!options.appName) {
          const detected = await detectProjectInfo();
          options.appName = detected.name;
        }

        if (!options.appName) {
          throw new Error('Application name is required');
        }

        console.log(chalk.cyan(`\n🔍 Deployment Status for ${options.appName}\n`));

        // Check Kubernetes deployment
        try {
          const kubernetesService = new KubernetesService({
            appName: options.appName,
            namespace: options.namespace,
          });
          
          const deploymentStatus = await kubernetesService.getDeploymentStatus();
          console.log(chalk.green('✅ Kubernetes Deployment'));
          console.log(chalk.gray(`   Ready: ${deploymentStatus.ready}`));
          console.log(chalk.gray(`   Available: ${deploymentStatus.available}`));
          console.log(chalk.gray(`   Age: ${deploymentStatus.age}`));
          
          const podStatus = await kubernetesService.getPodStatus();
          console.log(chalk.gray(`   Pods: ${podStatus.length} running`));
        } catch (error) {
          console.log(chalk.red('❌ Kubernetes Deployment'));
          console.log(chalk.gray(`   Error: ${error}`));
        }

        // Check monitoring
        try {
          const monitoringService = new MonitoringService({}, options.appName, options.namespace);
          const healthStatus = await monitoringService.checkHealth();
          const healthyCount = healthStatus.filter(s => s.status === 'healthy').length;
          
          if (healthyCount === healthStatus.length) {
            console.log(chalk.green('✅ Application Health'));
          } else {
            console.log(chalk.yellow('⚠️  Application Health'));
          }
          console.log(chalk.gray(`   Healthy endpoints: ${healthyCount}/${healthStatus.length}`));
        } catch (error) {
          console.log(chalk.red('❌ Application Health'));
          console.log(chalk.gray(`   Error: ${error}`));
        }

        console.log('');
      } catch (error) {
        console.error(chalk.red(`Error: ${error}`));
        process.exit(1);
      }
    });

  parentCommand.addCommand(statusCommand);
}
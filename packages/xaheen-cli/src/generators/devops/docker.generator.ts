import { BaseGenerator } from '../base.generator';
import { TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';

export interface DockerGeneratorOptions {
  readonly projectType: 'web' | 'api' | 'microservice' | 'fullstack';
  readonly runtime: 'node' | 'python' | 'go' | 'java' | 'dotnet' | 'php' | 'rust';
  readonly framework?: string;
  readonly enableMultiStage: boolean;
  readonly enableDevContainer: boolean;
  readonly enableSecurity: boolean;
  readonly enableHealthCheck: boolean;
  readonly enablePrometheus: boolean;
  readonly registryUrl?: string;
  readonly imageName: string;
  readonly imageTag: string;
  readonly nodeVersion?: string;
  readonly pythonVersion?: string;
  readonly goVersion?: string;
  readonly javaVersion?: string;
  readonly dotnetVersion?: string;
  readonly phpVersion?: string;
  readonly rustVersion?: string;
  readonly workdir: string;
  readonly port: number;
  readonly exposePorts: readonly number[];
  readonly environment: 'development' | 'staging' | 'production';
  readonly optimizeForSize: boolean;
  readonly enableNonRootUser: boolean;
  readonly customBuildArgs?: readonly string[];
}

export interface DockerConfig {
  readonly baseImage: string;
  readonly buildStages: readonly string[];
  readonly healthCheck: string;
  readonly securityScanning: boolean;
  readonly multiArchSupport: boolean;
  readonly buildContext: string;
  readonly ignorePatterns: readonly string[];
}

export class DockerGenerator extends BaseGenerator<DockerGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: DockerGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const dockerConfig = await this.generateDockerConfig(options);
      const projectContext = await this.analyzer.analyze(process.cwd());
      
      // Generate Dockerfile
      await this.generateDockerfile(options, dockerConfig, projectContext);
      
      // Generate docker-compose.yml
      await this.generateDockerCompose(options, dockerConfig);
      
      // Generate .dockerignore
      await this.generateDockerIgnore(options, dockerConfig);
      
      // Generate development container configuration
      if (options.enableDevContainer) {
        await this.generateDevContainer(options, dockerConfig);
      }
      
      // Generate Docker build scripts
      await this.generateBuildScripts(options, dockerConfig);
      
      // Generate security scanning configuration
      if (options.enableSecurity) {
        await this.generateSecurityScanning(options);
      }
      
      // Generate health check scripts
      if (options.enableHealthCheck) {
        await this.generateHealthCheck(options);
      }
      
      // Generate Prometheus metrics if enabled
      if (options.enablePrometheus) {
        await this.generatePrometheusConfig(options);
      }
      
      this.logger.success('Docker configuration generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate Docker configuration', error);
      throw error;
    }
  }

  private async validateOptions(options: DockerGeneratorOptions): Promise<void> {
    if (!options.imageName) {
      throw new Error('Image name is required');
    }
    
    if (!options.port || options.port < 1 || options.port > 65535) {
      throw new Error('Valid port number is required');
    }
    
    if (options.exposePorts.some(port => port < 1 || port > 65535)) {
      throw new Error('All exposed ports must be valid port numbers');
    }
  }

  private async generateDockerConfig(options: DockerGeneratorOptions): Promise<DockerConfig> {
    const baseImages = {
      node: `node:${options.nodeVersion || '20'}-alpine`,
      python: `python:${options.pythonVersion || '3.11'}-slim`,
      go: `golang:${options.goVersion || '1.21'}-alpine`,
      java: `openjdk:${options.javaVersion || '17'}-jre-slim`,
      dotnet: `mcr.microsoft.com/dotnet/aspnet:${options.dotnetVersion || '8.0'}`,
      php: `php:${options.phpVersion || '8.2'}-fpm-alpine`,
      rust: `rust:${options.rustVersion || '1.75'}-slim`
    };

    const buildStages = options.enableMultiStage ? ['builder', 'runtime'] : ['runtime'];
    
    return {
      baseImage: baseImages[options.runtime],
      buildStages,
      healthCheck: this.generateHealthCheckCommand(options),
      securityScanning: options.enableSecurity,
      multiArchSupport: true,
      buildContext: '.',
      ignorePatterns: this.getIgnorePatterns(options)
    };
  }

  private async generateDockerfile(
    options: DockerGeneratorOptions, 
    config: DockerConfig,
    projectContext: any
  ): Promise<void> {
    const templateData = {
      ...options,
      ...config,
      projectContext,
      timestamp: new Date().toISOString(),
      enableMultiStage: options.enableMultiStage,
      enableSecurity: options.enableSecurity,
      enableHealthCheck: options.enableHealthCheck,
      enableNonRootUser: options.enableNonRootUser,
      optimizeForSize: options.optimizeForSize
    };

    await this.templateManager.renderTemplate(
      'devops/docker/Dockerfile.hbs',
      'Dockerfile',
      templateData
    );
  }

  private async generateDockerCompose(
    options: DockerGeneratorOptions,
    config: DockerConfig
  ): Promise<void> {
    const services = {
      [options.imageName]: {
        build: {
          context: config.buildContext,
          dockerfile: 'Dockerfile',
          target: options.enableMultiStage ? 'runtime' : undefined
        },
        ports: [`${options.port}:${options.port}`],
        environment: this.getEnvironmentVariables(options),
        healthcheck: options.enableHealthCheck ? {
          test: config.healthCheck,
          interval: '30s',
          timeout: '10s',
          retries: 3,
          start_period: '40s'
        } : undefined,
        restart: 'unless-stopped'
      }
    };

    // Add additional services based on project type
    if (options.projectType === 'fullstack') {
      services['database'] = {
        image: 'postgres:15-alpine',
        environment: {
          POSTGRES_DB: '${DB_NAME}',
          POSTGRES_USER: '${DB_USER}',
          POSTGRES_PASSWORD: '${DB_PASSWORD}'
        },
        volumes: ['postgres_data:/var/lib/postgresql/data'],
        ports: ['5432:5432']
      };
      
      services['redis'] = {
        image: 'redis:7-alpine',
        ports: ['6379:6379'],
        volumes: ['redis_data:/data']
      };
    }

    // Add Prometheus if enabled
    if (options.enablePrometheus) {
      services['prometheus'] = {
        image: 'prom/prometheus:latest',
        ports: ['9090:9090'],
        volumes: ['./prometheus.yml:/etc/prometheus/prometheus.yml']
      };
    }

    const templateData = {
      services,
      volumes: this.getDockerVolumes(options),
      networks: {
        default: {
          driver: 'bridge'
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/docker/docker-compose.yml.hbs',
      'docker-compose.yml',
      templateData
    );
  }

  private async generateDockerIgnore(
    options: DockerGeneratorOptions,
    config: DockerConfig
  ): Promise<void> {
    const templateData = {
      patterns: config.ignorePatterns,
      runtime: options.runtime,
      projectType: options.projectType,
      customPatterns: [
        '# Logs',
        'logs',
        '*.log',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        '',
        '# Runtime data',
        'pids',
        '*.pid',
        '*.seed',
        '*.pid.lock',
        '',
        '# Coverage directory used by tools like istanbul',
        'coverage',
        '*.lcov',
        '',
        '# nyc test coverage',
        '.nyc_output',
        '',
        '# Dependency directories',
        'node_modules/',
        'jspm_packages/',
        '',
        '# Optional npm cache directory',
        '.npm',
        '',
        '# Optional REPL history',
        '.node_repl_history',
        '',
        '# Output of "npm pack"',
        '*.tgz',
        '',
        '# Yarn Integrity file',
        '.yarn-integrity',
        '',
        '# dotenv environment variables file',
        '.env',
        '.env.local',
        '.env.development.local',
        '.env.test.local',
        '.env.production.local',
        '',
        '# IDE',
        '.vscode/',
        '.idea/',
        '*.swp',
        '*.swo',
        '',
        '# OS',
        '.DS_Store',
        'Thumbs.db',
        '',
        '# Git',
        '.git',
        '.gitignore',
        '',
        '# Documentation',
        'docs/',
        '*.md',
        '',
        '# Tests',
        'test/',
        'tests/',
        '*.test.js',
        '*.spec.js'
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/docker/dockerignore.hbs',
      '.dockerignore',
      templateData
    );
  }

  private async generateDevContainer(
    options: DockerGeneratorOptions,
    config: DockerConfig
  ): Promise<void> {
    const devContainerConfig = {
      name: `${options.imageName}-dev`,
      dockerFile: '../Dockerfile',
      context: '..',
      target: options.enableMultiStage ? 'builder' : undefined,
      mounts: [
        'source=${localWorkspaceFolder}/node_modules,target=/app/node_modules,type=volume'
      ],
      customizations: {
        vscode: {
          extensions: this.getVSCodeExtensions(options.runtime),
          settings: {
            'terminal.integrated.shell.linux': '/bin/bash'
          }
        }
      },
      forwardPorts: [options.port, ...options.exposePorts],
      postCreateCommand: this.getPostCreateCommand(options),
      remoteUser: options.enableNonRootUser ? 'node' : 'root'
    };

    await this.templateManager.renderTemplate(
      'devops/docker/devcontainer.json.hbs',
      '.devcontainer/devcontainer.json',
      devContainerConfig
    );
  }

  private async generateBuildScripts(
    options: DockerGeneratorOptions,
    config: DockerConfig
  ): Promise<void> {
    const scripts = {
      build: this.generateBuildScript(options, config),
      run: this.generateRunScript(options),
      push: this.generatePushScript(options),
      clean: this.generateCleanScript(options)
    };

    for (const [scriptName, scriptContent] of Object.entries(scripts)) {
      await this.templateManager.renderTemplate(
        'devops/docker/scripts/docker-script.sh.hbs',
        `scripts/docker-${scriptName}.sh`,
        {
          scriptName,
          scriptContent,
          executable: true
        }
      );
    }
  }

  private async generateSecurityScanning(options: DockerGeneratorOptions): Promise<void> {
    const securityConfig = {
      scanners: {
        trivy: {
          image: 'aquasec/trivy:latest',
          command: 'trivy image --format json --output scan-results.json'
        },
        snyk: {
          image: 'snyk/snyk:docker',
          command: 'snyk container test --json > snyk-results.json'
        },
        clair: {
          enabled: true,
          config: './clair-config.yaml'
        }
      },
      policies: {
        allowedVulnerabilities: ['LOW'],
        blockedVulnerabilities: ['HIGH', 'CRITICAL'],
        maxAge: '30d'
      }
    };

    await this.templateManager.renderTemplate(
      'devops/docker/security/security-scan.yml.hbs',
      'security/docker-security-scan.yml',
      securityConfig
    );

    await this.templateManager.renderTemplate(
      'devops/docker/security/trivy-config.yaml.hbs',
      'security/trivy-config.yaml',
      securityConfig
    );
  }

  private async generateHealthCheck(options: DockerGeneratorOptions): Promise<void> {
    const healthCheckScript = this.getHealthCheckScript(options);
    
    await this.templateManager.renderTemplate(
      'devops/docker/health/healthcheck.sh.hbs',
      'docker/healthcheck.sh',
      {
        script: healthCheckScript,
        port: options.port,
        endpoint: this.getHealthCheckEndpoint(options),
        executable: true
      }
    );
  }

  private async generatePrometheusConfig(options: DockerGeneratorOptions): Promise<void> {
    const prometheusConfig = {
      global: {
        scrape_interval: '15s',
        evaluation_interval: '15s'
      },
      scrape_configs: [
        {
          job_name: options.imageName,
          static_configs: [
            {
              targets: [`localhost:${options.port}`]
            }
          ],
          metrics_path: '/metrics',
          scrape_interval: '5s'
        }
      ]
    };

    await this.templateManager.renderTemplate(
      'devops/docker/monitoring/prometheus.yml.hbs',
      'prometheus.yml',
      prometheusConfig
    );
  }

  private generateHealthCheckCommand(options: DockerGeneratorOptions): string {
    const healthCheckCommands = {
      node: `curl -f http://localhost:${options.port}/health || exit 1`,
      python: `curl -f http://localhost:${options.port}/health || exit 1`,
      go: `wget --no-verbose --tries=1 --spider http://localhost:${options.port}/health || exit 1`,
      java: `curl -f http://localhost:${options.port}/actuator/health || exit 1`,
      dotnet: `curl -f http://localhost:${options.port}/health || exit 1`,
      php: `curl -f http://localhost:${options.port}/health || exit 1`,
      rust: `curl -f http://localhost:${options.port}/health || exit 1`
    };

    return healthCheckCommands[options.runtime];
  }

  private getIgnorePatterns(options: DockerGeneratorOptions): readonly string[] {
    const commonPatterns = [
      'node_modules',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '.git',
      '.gitignore',
      'README.md',
      'Dockerfile',
      '.dockerignore',
      'docker-compose*.yml'
    ];

    const runtimeSpecific = {
      node: ['coverage', '.nyc_output', '.next', 'dist', 'build'],
      python: ['__pycache__', '*.pyc', '*.pyo', '*.pyd', '.pytest_cache', 'venv', '.venv'],
      go: ['*.exe', '*.exe~', '*.dll', '*.so', '*.dylib', 'vendor'],
      java: ['target', '*.jar', '*.war', '*.ear', '*.class'],
      dotnet: ['bin', 'obj', '*.dll', '*.exe', '*.pdb'],
      php: ['vendor', 'composer.lock'],
      rust: ['target', 'Cargo.lock']
    };

    return [...commonPatterns, ...runtimeSpecific[options.runtime]];
  }

  private getEnvironmentVariables(options: DockerGeneratorOptions): Record<string, string> {
    const baseEnv = {
      NODE_ENV: options.environment,
      PORT: options.port.toString()
    };

    if (options.projectType === 'fullstack') {
      return {
        ...baseEnv,
        DB_HOST: 'database',
        DB_PORT: '5432',
        DB_NAME: '${DB_NAME}',
        DB_USER: '${DB_USER}',
        DB_PASSWORD: '${DB_PASSWORD}',
        REDIS_URL: 'redis://redis:6379'
      };
    }

    return baseEnv;
  }

  private getDockerVolumes(options: DockerGeneratorOptions): Record<string, any> {
    const volumes: Record<string, any> = {};

    if (options.projectType === 'fullstack') {
      volumes['postgres_data'] = {};
      volumes['redis_data'] = {};
    }

    return volumes;
  }

  private getVSCodeExtensions(runtime: string): string[] {
    const commonExtensions = [
      'ms-vscode.vscode-docker',
      'ms-vscode.vscode-json',
      'ms-vscode.vscode-yaml'
    ];

    const runtimeExtensions = {
      node: ['ms-vscode.vscode-typescript-next', 'esbenp.prettier-vscode'],
      python: ['ms-python.python', 'ms-python.flake8'],
      go: ['golang.go'],
      java: ['redhat.java', 'vscjava.vscode-java-pack'],
      dotnet: ['ms-dotnettools.csharp'],
      php: ['felixfbecker.php-intellisense'],
      rust: ['rust-lang.rust-analyzer']
    };

    return [...commonExtensions, ...runtimeExtensions[runtime]];
  }

  private getPostCreateCommand(options: DockerGeneratorOptions): string {
    const commands = {
      node: 'npm install',
      python: 'pip install -r requirements.txt',
      go: 'go mod download',
      java: './mvnw dependency:resolve',
      dotnet: 'dotnet restore',
      php: 'composer install',
      rust: 'cargo build'
    };

    return commands[options.runtime];
  }

  private generateBuildScript(options: DockerGeneratorOptions, config: DockerConfig): string {
    const buildArgs = options.customBuildArgs ? options.customBuildArgs.join(' ') : '';
    const target = options.enableMultiStage ? '--target runtime' : '';
    
    return `#!/bin/bash
set -e

echo "Building Docker image: ${options.imageName}:${options.imageTag}"

docker build \\
  ${target} \\
  ${buildArgs} \\
  --build-arg NODE_ENV=${options.environment} \\
  --build-arg PORT=${options.port} \\
  --tag ${options.imageName}:${options.imageTag} \\
  --tag ${options.imageName}:latest \\
  ${config.buildContext}

echo "Build completed successfully!"
`;
  }

  private generateRunScript(options: DockerGeneratorOptions): string {
    return `#!/bin/bash
set -e

echo "Running Docker container: ${options.imageName}"

docker run \\
  --rm \\
  --name ${options.imageName}-dev \\
  -p ${options.port}:${options.port} \\
  ${options.exposePorts.map(port => `-p ${port}:${port}`).join(' ')} \\
  -e NODE_ENV=${options.environment} \\
  ${options.imageName}:latest
`;
  }

  private generatePushScript(options: DockerGeneratorOptions): string {
    const registry = options.registryUrl || 'docker.io';
    
    return `#!/bin/bash
set -e

echo "Pushing Docker image to registry: ${registry}"

# Tag for registry
docker tag ${options.imageName}:${options.imageTag} ${registry}/${options.imageName}:${options.imageTag}
docker tag ${options.imageName}:latest ${registry}/${options.imageName}:latest

# Push to registry
docker push ${registry}/${options.imageName}:${options.imageTag}
docker push ${registry}/${options.imageName}:latest

echo "Push completed successfully!"
`;
  }

  private generateCleanScript(options: DockerGeneratorOptions): string {
    return `#!/bin/bash
set -e

echo "Cleaning up Docker artifacts for: ${options.imageName}"

# Remove containers
docker rm -f ${options.imageName}-dev 2>/dev/null || true

# Remove images
docker rmi ${options.imageName}:${options.imageTag} 2>/dev/null || true
docker rmi ${options.imageName}:latest 2>/dev/null || true

# Clean up dangling images
docker image prune -f

echo "Cleanup completed!"
`;
  }

  private getHealthCheckScript(options: DockerGeneratorOptions): string {
    return `#!/bin/bash
# Health check script for ${options.imageName}

# Check if the application is responding
if curl -f http://localhost:${options.port}${this.getHealthCheckEndpoint(options)} > /dev/null 2>&1; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
`;
  }

  private getHealthCheckEndpoint(options: DockerGeneratorOptions): string {
    const endpoints = {
      node: '/health',
      python: '/health',
      go: '/health',
      java: '/actuator/health',
      dotnet: '/health',
      php: '/health',
      rust: '/health'
    };

    return endpoints[options.runtime];
  }
}
import { BaseGenerator } from '../base.generator';
import { TemplateLoader as TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';
import * as fs from 'fs-extra';

export interface GitLabCIGeneratorOptions {
  readonly projectName: string;
  readonly projectType: 'web' | 'api' | 'microservice' | 'fullstack' | 'mobile' | 'desktop';
  readonly runtime: 'node' | 'python' | 'go' | 'java' | 'dotnet' | 'php' | 'rust';
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'maven' | 'gradle' | 'dotnet' | 'pip' | 'cargo';
  readonly enableCI: boolean;
  readonly enableCD: boolean;
  readonly enableTesting: boolean;
  readonly enableSecurity: boolean;
  readonly enableCodeQuality: boolean;
  readonly enableDependencyScanning: boolean;
  readonly enableContainerScanning: boolean;
  readonly enableDAST: boolean;
  readonly enableSAST: boolean;
  readonly enableLicense: boolean;
  readonly enablePerformance: boolean;
  readonly enableReviews: boolean;
  readonly enablePages: boolean;
  readonly enableAutoDevOps: boolean;
  readonly stages: readonly string[];
  readonly images: {
    readonly default: string;
    readonly node?: string;
    readonly python?: string;
    readonly go?: string;
    readonly java?: string;
    readonly dotnet?: string;
    readonly php?: string;
    readonly rust?: string;
  };
  readonly services: readonly GitLabService[];
  readonly variables: Record<string, string>;
  readonly beforeScript: readonly string[];
  readonly afterScript: readonly string[];
  readonly cache: GitLabCache;
  readonly artifacts: GitLabArtifacts;
  readonly environments: readonly GitLabEnvironment[];
  readonly rules: readonly GitLabRule[];
  readonly includes: readonly GitLabInclude[];
  readonly tags: readonly string[];
  readonly runners: {
    readonly shared: boolean;
    readonly tags: readonly string[];
  };
}

export interface GitLabService {
  readonly name: string;
  readonly alias?: string;
  readonly entrypoint?: readonly string[];
  readonly command?: readonly string[];
}

export interface GitLabCache {
  readonly key: string;
  readonly paths: readonly string[];
  readonly policy: 'pull' | 'push' | 'pull-push';
  readonly when: 'on_success' | 'on_failure' | 'always';
}

export interface GitLabArtifacts {
  readonly name: string;
  readonly paths: readonly string[];
  readonly reports: {
    readonly junit?: readonly string[];
    readonly coverage_report?: {
      readonly coverage_format: string;
      readonly path: string;
    };
    readonly codequality?: readonly string[];
    readonly sast?: readonly string[];
    readonly dependency_scanning?: readonly string[];
    readonly container_scanning?: readonly string[];
    readonly dast?: readonly string[];
    readonly license_scanning?: readonly string[];
    readonly performance?: readonly string[];
  };
  readonly expire_in: string;
  readonly when: 'on_success' | 'on_failure' | 'always';
}

export interface GitLabEnvironment {
  readonly name: string;
  readonly url?: string;
  readonly action?: 'start' | 'prepare' | 'stop';
  readonly auto_stop_in?: string;
  readonly deployment_tier?: 'production' | 'staging' | 'testing' | 'development' | 'other';
}

export interface GitLabRule {
  readonly if?: string;
  readonly changes?: readonly string[];
  readonly exists?: readonly string[];
  readonly when?: 'on_success' | 'on_failure' | 'always' | 'manual' | 'delayed' | 'never';
  readonly allow_failure?: boolean;
}

export interface GitLabInclude {
  readonly local?: string;
  readonly project?: string;
  readonly ref?: string;
  readonly file?: string | readonly string[];
  readonly template?: string;
  readonly remote?: string;
}

export interface GitLabJob {
  readonly stage: string;
  readonly image?: string;
  readonly services?: readonly GitLabService[];
  readonly variables?: Record<string, string>;
  readonly before_script?: readonly string[];
  readonly script: readonly string[];
  readonly after_script?: readonly string[];
  readonly rules?: readonly GitLabRule[];
  readonly cache?: GitLabCache;
  readonly artifacts?: GitLabArtifacts;
  readonly environment?: GitLabEnvironment;
  readonly dependencies?: readonly string[];
  readonly needs?: readonly string[];
  readonly parallel?: number | { matrix: Record<string, readonly string[]> };
  readonly timeout?: string;
  readonly retry?: number | { max: number; when: readonly string[] };
  readonly interruptible?: boolean;
  readonly resource_group?: string;
}

export class GitLabCIGenerator extends BaseGenerator<GitLabCIGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: GitLabCIGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const projectContext = await this.analyzer.analyzeProject(process.cwd());
      
      // Generate main GitLab CI configuration
      await this.generateMainPipeline(options, projectContext);
      
      // Generate security scanning configurations
      if (options.enableSecurity) {
        await this.generateSecurityPipeline(options);
      }
      
      // Generate auto DevOps configuration
      if (options.enableAutoDevOps) {
        await this.generateAutoDevOpsPipeline(options);
      }
      
      // Generate include templates
      await this.generateIncludeTemplates(options);
      
      // Generate Docker configuration for GitLab Container Registry
      await this.generateDockerConfiguration(options);
      
      // Generate GitLab Pages configuration
      if (options.enablePages) {
        await this.generatePagesConfiguration(options);
      }
      
      // Generate deployment configurations
      await this.generateDeploymentConfigurations(options);
      
      // Generate GitLab CI/CD variables template
      await this.generateVariablesTemplate(options);
      
      this.logger.success('GitLab CI/CD configuration generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate GitLab CI/CD configuration', error);
      throw error;
    }
  }

  protected async validateOptions(options: GitLabCIGeneratorOptions): Promise<void> {
    if (!options.projectName) {
      throw new Error('Project name is required');
    }
    
    if (!options.runtime) {
      throw new Error('Runtime is required');
    }
    
    if (options.stages.length === 0) {
      throw new Error('At least one stage is required');
    }
    
    if (options.enableCD && options.environments.length === 0) {
      throw new Error('At least one environment is required for CD');
    }
  }

  private async generateMainPipeline(
    options: GitLabCIGeneratorOptions,
    projectContext: any
  ): Promise<void> {
    const pipeline = {
      default: {
        image: options.images.default,
        before_script: options.beforeScript,
        after_script: options.afterScript,
        cache: options.cache,
        artifacts: options.artifacts,
        tags: options.tags
      },
      variables: this.generateGlobalVariables(options),
      stages: options.stages,
      include: options.includes,
      services: options.services,
      workflow: {
        rules: this.generateWorkflowRules(options)
      },
      jobs: await this.generatePipelineJobs(options, projectContext)
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/gitlab-ci.yml.hbs',
      pipeline
    );
    await fs.writeFile('.gitlab-ci.yml', rendered);
  }

  private async generateSecurityPipeline(options: GitLabCIGeneratorOptions): Promise<void> {
    const securityJobs: Record<string, any> = {};

    if (options.enableSAST) {
      securityJobs['sast'] = {
        stage: 'test',
        include: [
          { template: 'Security/SAST.gitlab-ci.yml' }
        ]
      };
    }

    if (options.enableDependencyScanning) {
      securityJobs['dependency_scanning'] = {
        stage: 'test',
        include: [
          { template: 'Security/Dependency-Scanning.gitlab-ci.yml' }
        ]
      };
    }

    if (options.enableContainerScanning) {
      securityJobs['container_scanning'] = {
        stage: 'test',
        include: [
          { template: 'Security/Container-Scanning.gitlab-ci.yml' }
        ]
      };
    }

    if (options.enableDAST) {
      securityJobs['dast'] = {
        stage: 'dast',
        include: [
          { template: 'Security/DAST.gitlab-ci.yml' }
        ],
        variables: {
          DAST_WEBSITE: 'https://example.com',
          DAST_FULL_SCAN_ENABLED: 'true'
        }
      };
    }

    if (options.enableLicense) {
      securityJobs['license_scanning'] = {
        stage: 'test',
        include: [
          { template: 'Security/License-Scanning.gitlab-ci.yml' }
        ]
      };
    }

    const securityPipeline = {
      include: [
        { template: 'Security/SAST.gitlab-ci.yml' },
        { template: 'Security/Dependency-Scanning.gitlab-ci.yml' },
        { template: 'Security/Container-Scanning.gitlab-ci.yml' },
        { template: 'Security/DAST.gitlab-ci.yml' },
        { template: 'Security/License-Scanning.gitlab-ci.yml' }
      ],
      variables: {
        SECURE_ANALYZERS_PREFIX: 'registry.gitlab.com/gitlab-org/security-products/analyzers',
        SAST_EXCLUDED_PATHS: 'spec, test, tests, tmp',
        DEPENDENCY_SCANNING_DISABLED: 'false',
        CONTAINER_SCANNING_DISABLED: 'false',
        DAST_DISABLED: 'false',
        LICENSE_SCANNING_DISABLED: 'false'
      },
      ...securityJobs
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/security-pipeline.yml.hbs',
      securityPipeline
    );
    await fs.writeFile('.gitlab/ci/security.yml', rendered);
  }

  private async generateAutoDevOpsPipeline(options: GitLabCIGeneratorOptions): Promise<void> {
    const autoDevOps = {
      include: [
        { template: 'Auto-DevOps.gitlab-ci.yml' }
      ],
      variables: {
        AUTO_DEVOPS_DOMAIN: 'example.com',
        POSTGRES_ENABLED: 'false',
        POSTGRES_VERSION: '13.6-alpine',
        POSTGRES_DB: '$CI_ENVIRONMENT_SLUG',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'testing-password',
        'K8S_SECRET_*': 'base64-encoded-value'
      }
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/auto-devops.yml.hbs',
      autoDevOps
    );
    await fs.writeFile('.gitlab/ci/auto-devops.yml', rendered);
  }

  private async generateIncludeTemplates(options: GitLabCIGeneratorOptions): Promise<void> {
    // Build template
    const buildTemplate = {
      '.build_template': {
        stage: 'build',
        image: this.getRuntimeImage(options.runtime, options.images),
        before_script: this.getBuildBeforeScript(options),
        script: this.getBuildScript(options),
        artifacts: {
          name: '$CI_COMMIT_REF_SLUG-build',
          paths: [this.getBuildOutputPath(options)],
          expire_in: '1 week'
        },
        cache: {
          key: '$CI_COMMIT_REF_SLUG-build',
          paths: this.getCachePaths(options),
          policy: 'pull-push'
        }
      }
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/templates/build.yml.hbs',
      buildTemplate
    );
    await fs.writeFile('.gitlab/ci/build.yml', rendered);

    // Test template
    const testTemplate = {
      '.test_template': {
        stage: 'test',
        image: this.getRuntimeImage(options.runtime, options.images),
        before_script: this.getTestBeforeScript(options),
        script: this.getTestScript(options),
        artifacts: {
          reports: {
            junit: ['**/test-results.xml'],
            coverage_report: {
              coverage_format: 'cobertura',
              path: 'coverage/cobertura-coverage.xml'
            }
          },
          paths: ['coverage/'],
          expire_in: '1 week'
        },
        coverage: '/Lines\\s*:\\s*(\\d+(?:\\.\\d+)?)%/',
        cache: {
          key: '$CI_COMMIT_REF_SLUG-test',
          paths: this.getCachePaths(options),
          policy: 'pull'
        }
      }
    };

    const renderedTest = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/templates/test.yml.hbs',
      testTemplate
    );
    await fs.writeFile('.gitlab/ci/test.yml', renderedTest);

    // Deploy template
    const deployTemplate = {
      '.deploy_template': {
        stage: 'deploy',
        image: 'registry.gitlab.com/gitlab-org/kubectl-utils:latest',
        before_script: [
          'apt-get update -qq && apt-get install -y -qq git'
        ] as readonly string[],
        script: [
          'kubectl apply -f k8s/',
          'kubectl rollout status deployment/$CI_PROJECT_NAME'
        ] as readonly string[],
        environment: {
          name: '$ENVIRONMENT_NAME',
          url: '$ENVIRONMENT_URL'
        },
        rules: [
          {
            if: '$CI_COMMIT_BRANCH == "main"',
            when: 'manual'
          }
        ]
      }
    };

    const renderedDeploy = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/templates/deploy.yml.hbs',
      deployTemplate
    );
    await fs.writeFile('.gitlab/ci/deploy.yml', renderedDeploy);
  }

  private async generateDockerConfiguration(options: GitLabCIGeneratorOptions): Promise<void> {
    const dockerJobs = {
      'docker:build': {
        stage: 'build',
        image: 'docker:24.0.5',
        services: [{ name: "docker:24.0.5-dind" }],
        variables: {
          DOCKER_HOST: 'tcp://docker:2376',
          DOCKER_TLS_CERTDIR: '/certs',
          DOCKER_TLS_VERIFY: '1',
          DOCKER_CERT_PATH: '$DOCKER_TLS_CERTDIR/client'
        },
        before_script: [
          'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY'
        ] as readonly string[],
        script: [
          'docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .',
          'docker build -t $CI_REGISTRY_IMAGE:latest .',
          'docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA',
          'docker push $CI_REGISTRY_IMAGE:latest'
        ] as readonly string[],
        rules: [
          {
            if: '$CI_COMMIT_BRANCH == "main"'
          }
        ]
      },
      'docker:scan': {
        stage: 'test',
        image: 'docker:24.0.5',
        services: [{ name: "docker:24.0.5-dind" }],
        variables: {
          DOCKER_HOST: 'tcp://docker:2376',
          DOCKER_TLS_CERTDIR: '/certs',
          DOCKER_TLS_VERIFY: '1',
          DOCKER_CERT_PATH: '$DOCKER_TLS_CERTDIR/client'
        },
        before_script: [
          'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY'
        ] as readonly string[],
        script: [
          'docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA',
          'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --format json --output trivy-report.json $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA'
        ] as readonly string[],
        artifacts: {
          reports: {
            dependency_scanning: ['gl-dependency-scanning-report.json']
          },
          expire_in: '1 week'
        },
        dependencies: ['docker:build']
      }
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/docker.yml.hbs',
      dockerJobs
    );
    await fs.writeFile('.gitlab/ci/docker.yml', rendered);
  }

  private async generatePagesConfiguration(options: GitLabCIGeneratorOptions): Promise<void> {
    const pagesJob = {
      pages: {
        stage: 'deploy',
        image: this.getRuntimeImage(options.runtime, options.images),
        script: this.getPagesScript(options) as readonly string[],
        artifacts: {
          paths: ['public'],
          expire_in: '1 day'
        },
        rules: [
          {
            if: '$CI_COMMIT_BRANCH == "main"'
          }
        ]
      }
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/pages.yml.hbs',
      pagesJob
    );
    await fs.writeFile('.gitlab/ci/pages.yml', rendered);
  }

  private async generateDeploymentConfigurations(options: GitLabCIGeneratorOptions): Promise<void> {
    for (const env of options.environments) {
      const deploymentJob = {
        [`deploy:${env.name}`]: {
          stage: 'deploy',
          image: 'registry.gitlab.com/gitlab-org/kubectl-utils:latest',
          environment: {
            name: env.name,
            url: env.url,
            deployment_tier: env.deployment_tier,
            auto_stop_in: env.auto_stop_in
          },
          script: this.getDeploymentScript(options, env) as readonly string[],
          rules: this.getDeploymentRules(options, env),
          resource_group: env.name
        }
      };

      const rendered = await this.templateManager.renderTemplate(
        'devops/gitlab-ci/deploy-env.yml.hbs',
        deploymentJob
      );
      await fs.writeFile(`.gitlab/ci/deploy-${env.name}.yml`, rendered);
    }
  }

  private async generateVariablesTemplate(options: GitLabCIGeneratorOptions): Promise<void> {
    const variables = {
      // CI/CD variables
      CI: 'true',
      NODE_ENV: 'production',
      
      // Docker variables
      DOCKER_DRIVER: 'overlay2',
      DOCKER_TLS_CERTDIR: '/certs',
      
      // Security variables
      SECURE_ANALYZERS_PREFIX: 'registry.gitlab.com/gitlab-org/security-products/analyzers',
      SAST_EXCLUDED_PATHS: 'spec, test, tests, tmp',
      
      // Custom variables
      ...options.variables
    };

    const rendered = await this.templateManager.renderTemplate(
      'devops/gitlab-ci/variables.yml.hbs',
      variables
    );
    await fs.writeFile('.gitlab/ci/variables.yml', rendered);
  }

  private generateGlobalVariables(options: GitLabCIGeneratorOptions): Record<string, string> {
    return {
      CI: 'true',
      NODE_ENV: 'production',
      DOCKER_DRIVER: 'overlay2',
      ...options.variables
    };
  }

  private generateWorkflowRules(options: GitLabCIGeneratorOptions): GitLabRule[] {
    return [
      {
        if: '$CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS',
        when: 'never'
      },
      {
        if: '$CI_COMMIT_BRANCH || $CI_MERGE_REQUEST_IID'
      }
    ];
  }

  private async generatePipelineJobs(
    options: GitLabCIGeneratorOptions,
    projectContext: any
  ): Promise<Record<string, GitLabJob>> {
    const jobs: Record<string, GitLabJob> = {};

    // Build job
    if (options.enableCI) {
      jobs.build = {
        stage: 'build',
        image: this.getRuntimeImage(options.runtime, options.images),
        before_script: this.getBuildBeforeScript(options) as readonly string[],
        script: this.getBuildScript(options) as readonly string[],
        artifacts: {
          name: '$CI_COMMIT_REF_SLUG-build',
          paths: [this.getBuildOutputPath(options)],
          expire_in: '1 week',
          reports: {},
          when: 'on_success'
        },
        cache: {
          key: '$CI_COMMIT_REF_SLUG-build',
          paths: this.getCachePaths(options),
          policy: 'pull-push',
          when: 'on_success'
        }
      };
    }

    // Test jobs
    if (options.enableTesting) {
      jobs.test = {
        stage: 'test',
        image: this.getRuntimeImage(options.runtime, options.images),
        before_script: this.getTestBeforeScript(options) as readonly string[],
        script: this.getTestScript(options) as readonly string[],
        artifacts: {
          reports: {
            junit: ['**/test-results.xml'],
            coverage_report: {
              coverage_format: 'cobertura',
              path: 'coverage/cobertura-coverage.xml'
            }
          },
          paths: ['coverage/'],
          expire_in: '1 week',
          name: '$CI_COMMIT_REF_SLUG-test',
          when: 'on_success'
        },
        dependencies: ['build'],
        cache: {
          key: '$CI_COMMIT_REF_SLUG-test',
          paths: this.getCachePaths(options),
          policy: 'pull',
          when: 'on_success'
        }
      };
    }

    // Code quality job
    if (options.enableCodeQuality) {
      jobs.code_quality = {
        stage: 'test',
        image: 'docker:stable',
        services: [{ name: "docker:stable-dind" }],
        variables: {
          DOCKER_DRIVER: 'overlay2'
        },
        script: [
          'docker run --env SOURCE_CODE="$PWD" --volume "$PWD":/code --volume /var/run/docker.sock:/var/run/docker.sock "registry.gitlab.com/gitlab-org/ci-cd/codequality:latest" /code'
        ] as readonly string[],
        artifacts: {
          reports: {
            license_scanning: ['gl-license-scanning-report.json']
          },
          name: '$CI_COMMIT_REF_SLUG-code-quality',
          paths: ['gl-code-quality-report.json'],
          expire_in: '1 week',
          when: 'on_success'
        },
        rules: [
          {
            if: '$CODE_QUALITY_DISABLED',
            when: 'never'
          },
          {
            if: '$CI_COMMIT_TAG || $CI_COMMIT_BRANCH'
          }
        ]
      };
    }

    // Performance job
    if (options.enablePerformance) {
      jobs.performance = {
        stage: 'performance',
        image: 'docker:stable',
        services: [{ name: "docker:stable-dind" }],
        variables: {
          DOCKER_DRIVER: 'overlay2'
        },
        script: [
          'docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:14.1.0 --plugins.add ./lib/lighthouse.js --outputFolder output https://example.com'
        ] as readonly string[],
        artifacts: {
          reports: {
            performance: ['performance.json']
          },
          name: '$CI_COMMIT_REF_SLUG-performance',
          paths: ['output/'],
          expire_in: '1 week',
          when: 'on_success'
        },
        rules: [
          {
            if: '$PERFORMANCE_DISABLED',
            when: 'never'
          },
          {
            if: '$CI_COMMIT_BRANCH == "main"'
          }
        ]
      };
    }

    // Deployment jobs
    if (options.enableCD) {
      for (const env of options.environments) {
        jobs[`deploy:${env.name}`] = {
          stage: 'deploy',
          image: 'registry.gitlab.com/gitlab-org/kubectl-utils:latest',
          environment: env,
          script: this.getDeploymentScript(options, env) as readonly string[],
          dependencies: ['build'],
          rules: this.getDeploymentRules(options, env),
          resource_group: env.name
        };
      }
    }

    return jobs;
  }

  private getRuntimeImage(runtime: string, images: any): string {
    const runtimeImages = {
      node: images.node || 'node:20-alpine',
      python: images.python || 'python:3.11-slim',
      go: images.go || 'golang:1.21-alpine',
      java: images.java || 'openjdk:17-jdk-slim',
      dotnet: images.dotnet || 'mcr.microsoft.com/dotnet/sdk:8.0',
      php: images.php || 'php:8.2-cli-alpine',
      rust: images.rust || 'rust:1.75-slim'
    };
    return (runtimeImages as Record<string, string>)[runtime] || images.default;
  }

  private getBuildBeforeScript(options: GitLabCIGeneratorOptions): readonly string[] {
    const scripts = {
      node: ['node --version', 'npm --version'],
      python: ['python --version', 'pip --version'],
      go: ['go version'],
      java: ['java -version'],
      dotnet: ['dotnet --version'],
      php: ['php --version'],
      rust: ['rustc --version', 'cargo --version']
    };
    return scripts[options.runtime] || [];
  }

  private getBuildScript(options: GitLabCIGeneratorOptions): readonly string[] {
    const installCommands = {
      npm: 'npm ci',
      yarn: 'yarn install --frozen-lockfile',
      pnpm: 'pnpm install --frozen-lockfile',
      bun: 'bun install --frozen-lockfile',
      maven: 'mvn clean compile',
      gradle: './gradlew build -x test',
      dotnet: 'dotnet restore && dotnet build',
      pip: 'pip install -r requirements.txt',
      cargo: 'cargo build --release'
    };

    const buildCommands = {
      npm: 'npm run build',
      yarn: 'yarn build',
      pnpm: 'pnpm build',
      bun: 'bun run build',
      maven: 'mvn package -DskipTests',
      gradle: './gradlew build -x test',
      dotnet: 'dotnet publish -c Release -o out',
      pip: 'python setup.py build',
      cargo: 'cargo build --release'
    };

    return [
      installCommands[options.packageManager] || 'npm ci',
      buildCommands[options.packageManager] || 'npm run build'
    ];
  }

  private getTestBeforeScript(options: GitLabCIGeneratorOptions): readonly string[] {
    return this.getBuildBeforeScript(options);
  }

  private getTestScript(options: GitLabCIGeneratorOptions): readonly string[] {
    const installCommands = {
      npm: 'npm ci',
      yarn: 'yarn install --frozen-lockfile',
      pnpm: 'pnpm install --frozen-lockfile',
      bun: 'bun install --frozen-lockfile',
      maven: 'mvn clean test',
      gradle: './gradlew test',
      dotnet: 'dotnet test',
      pip: 'pip install -r requirements.txt && python -m pytest',
      cargo: 'cargo test'
    };

    const testCommands = {
      npm: 'npm test',
      yarn: 'yarn test',
      pnpm: 'pnpm test',
      bun: 'bun test',
      maven: 'mvn test',
      gradle: './gradlev test',
      dotnet: 'dotnet test',
      pip: 'python -m pytest --cov=. --cov-report=xml',
      cargo: 'cargo test'
    };

    return [
      installCommands[options.packageManager] || 'npm ci',
      testCommands[options.packageManager] || 'npm test'
    ];
  }

  private getPagesScript(options: GitLabCIGeneratorOptions): readonly string[] {
    const scripts = {
      web: [
        'npm ci',
        'npm run build',
        'cp -r dist/* public/'
      ],
      api: [
        'npm ci',
        'npm run docs',
        'cp -r docs/* public/'
      ]
    };

    return scripts[options.projectType] || [
      'mkdir public',
      'echo "Hello World" > public/index.html'
    ] as readonly string[];
  }

  private getDeploymentScript(options: GitLabCIGeneratorOptions, env: GitLabEnvironment): readonly string[] {
    const scripts = [
      'echo "Deploying to ' + env.name + '"',
      'kubectl version --client'
    ];

    switch (env.deployment_tier) {
      case 'production':
        scripts.push(
          'kubectl apply -f k8s/production/',
          'kubectl rollout status deployment/$CI_PROJECT_NAME-prod'
        );
        break;
      case 'staging':
        scripts.push(
          'kubectl apply -f k8s/staging/',
          'kubectl rollout status deployment/$CI_PROJECT_NAME-staging'
        );
        break;
      default:
        scripts.push(
          'kubectl apply -f k8s/',
          'kubectl rollout status deployment/$CI_PROJECT_NAME'
        );
    }

    return scripts;
  }

  private getDeploymentRules(options: GitLabCIGeneratorOptions, env: GitLabEnvironment): GitLabRule[] {
    const rules: GitLabRule[] = [];

    switch (env.deployment_tier) {
      case 'production':
        rules.push({
          if: '$CI_COMMIT_BRANCH == "main"',
          when: 'manual'
        });
        break;
      case 'staging':
        rules.push({
          if: '$CI_COMMIT_BRANCH == "develop"',
          when: 'on_success'
        });
        break;
      default:
        rules.push({
          if: '$CI_COMMIT_BRANCH',
          when: 'manual'
        });
    }

    return rules;
  }

  private getCachePaths(options: GitLabCIGeneratorOptions): string[] {
    const paths = {
      npm: ['node_modules/'],
      yarn: ['.yarn/cache/', 'node_modules/'],
      pnpm: ['.pnpm-store/', 'node_modules/'],
      bun: ['.bun/install/cache/', 'node_modules/'],
      maven: ['.m2/repository/'],
      gradle: ['.gradle/', 'build/'],
      dotnet: ['~/.nuget/packages/'],
      pip: ['~/.cache/pip/'],
      cargo: ['target/', '~/.cargo/']
    };
    return paths[options.packageManager] || ['node_modules/'];
  }

  private getBuildOutputPath(options: GitLabCIGeneratorOptions): string {
    const paths = {
      web: 'dist/',
      api: 'dist/',
      microservice: 'dist/',
      fullstack: 'dist/',
      mobile: 'build/',
      desktop: 'dist/'
    };
    return paths[options.projectType] || 'dist/';
  }
}
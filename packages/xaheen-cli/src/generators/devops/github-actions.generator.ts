import { BaseGenerator } from '../base.generator';
import { TemplateManager } from '../../services/templates/template-loader';
import { ProjectAnalyzer } from '../../services/analysis/project-analyzer';

export interface GitHubActionsGeneratorOptions {
  readonly projectName: string;
  readonly projectType: 'web' | 'api' | 'microservice' | 'fullstack' | 'mobile' | 'desktop';
  readonly runtime: 'node' | 'python' | 'go' | 'java' | 'dotnet' | 'php' | 'rust';
  readonly packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  readonly enableCI: boolean;
  readonly enableCD: boolean;
  readonly enableTesting: boolean;
  readonly enableLinting: boolean;
  readonly enableSecurity: boolean;
  readonly enableDependencyCheck: boolean;
  readonly enableCodeCoverage: boolean;
  readonly enablePerformanceTesting: boolean;
  readonly enableSemanticRelease: boolean;
  readonly enableDocker: boolean;
  readonly enableKubernetes: boolean;
  readonly enableNotifications: boolean;
  readonly enableCaching: boolean;
  readonly enableMatrix: boolean;
  readonly environments: readonly Environment[];
  readonly deploymentTargets: readonly DeploymentTarget[];
  readonly testFrameworks: readonly string[];
  readonly codeQualityTools: readonly string[];
  readonly securityTools: readonly string[];
  readonly registries: readonly Registry[];
  readonly secrets: readonly string[];
  readonly variables: readonly string[];
  readonly triggers: {
    readonly push: boolean;
    readonly pullRequest: boolean;
    readonly schedule: string[];
    readonly workflow_dispatch: boolean;
    readonly release: boolean;
  };
  readonly concurrency: {
    readonly group: string;
    readonly cancel_in_progress: boolean;
  };
  readonly timeouts: {
    readonly job: number;
    readonly step: number;
  };
}

export interface Environment {
  readonly name: string;
  readonly url?: string;
  readonly secrets: readonly string[];
  readonly variables: readonly string[];
  readonly protection_rules: {
    readonly required_reviewers?: readonly string[];
    readonly wait_timer?: number;
  };
}

export interface DeploymentTarget {
  readonly name: string;
  readonly type: 'aws' | 'azure' | 'gcp' | 'vercel' | 'netlify' | 'heroku' | 'kubernetes';
  readonly environment: string;
  readonly config: Record<string, any>;
}

export interface Registry {
  readonly name: string;
  readonly url: string;
  readonly username_secret: string;
  readonly password_secret: string;
}

export interface WorkflowJob {
  readonly name: string;
  readonly runs_on: string | string[];
  readonly needs?: string[];
  readonly if?: string;
  readonly environment?: string;
  readonly timeout_minutes?: number;
  readonly strategy?: {
    readonly matrix?: Record<string, any>;
    readonly fail_fast?: boolean;
    readonly max_parallel?: number;
  };
  readonly steps: readonly WorkflowStep[];
}

export interface WorkflowStep {
  readonly name: string;
  readonly uses?: string;
  readonly run?: string;
  readonly with?: Record<string, any>;
  readonly env?: Record<string, string>;
  readonly if?: string;
  readonly continue_on_error?: boolean;
  readonly timeout_minutes?: number;
}

export class GitHubActionsGenerator extends BaseGenerator<GitHubActionsGeneratorOptions> {
  private readonly templateManager: TemplateManager;
  private readonly analyzer: ProjectAnalyzer;

  constructor() {
    super();
    this.templateManager = new TemplateManager();
    this.analyzer = new ProjectAnalyzer();
  }

  async generate(options: GitHubActionsGeneratorOptions): Promise<void> {
    try {
      await this.validateOptions(options);
      
      const projectContext = await this.analyzer.analyze(process.cwd());
      
      // Generate main CI/CD workflow
      if (options.enableCI || options.enableCD) {
        await this.generateMainWorkflow(options, projectContext);
      }
      
      // Generate separate CI workflow if needed
      if (options.enableCI && options.enableCD) {
        await this.generateCIWorkflow(options, projectContext);
      }
      
      // Generate security scanning workflow
      if (options.enableSecurity) {
        await this.generateSecurityWorkflow(options);
      }
      
      // Generate dependency check workflow
      if (options.enableDependencyCheck) {
        await this.generateDependencyCheckWorkflow(options);
      }
      
      // Generate release workflow
      if (options.enableSemanticRelease) {
        await this.generateReleaseWorkflow(options);
      }
      
      // Generate performance testing workflow
      if (options.enablePerformanceTesting) {
        await this.generatePerformanceWorkflow(options);
      }
      
      // Generate deployment workflows for each environment
      for (const env of options.environments) {
        await this.generateDeploymentWorkflow(options, env);
      }
      
      // Generate reusable workflows
      await this.generateReusableWorkflows(options);
      
      // Generate composite actions
      await this.generateCompositeActions(options);
      
      // Generate workflow templates
      await this.generateWorkflowTemplates(options);
      
      this.logger.success('GitHub Actions workflows generated successfully');
      
    } catch (error) {
      this.logger.error('Failed to generate GitHub Actions workflows', error);
      throw error;
    }
  }

  private async validateOptions(options: GitHubActionsGeneratorOptions): Promise<void> {
    if (!options.projectName) {
      throw new Error('Project name is required');
    }
    
    if (!options.runtime) {
      throw new Error('Runtime is required');
    }
    
    if (options.environments.length === 0 && options.enableCD) {
      throw new Error('At least one environment is required for CD');
    }
  }

  private async generateMainWorkflow(
    options: GitHubActionsGeneratorOptions,
    projectContext: any
  ): Promise<void> {
    const workflow = {
      name: `${options.projectName} CI/CD`,
      on: this.generateTriggers(options),
      concurrency: options.concurrency,
      env: this.generateGlobalEnvironmentVariables(options),
      jobs: await this.generateMainWorkflowJobs(options, projectContext)
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/main-workflow.yml.hbs',
      '.github/workflows/main.yml',
      workflow
    );
  }

  private async generateCIWorkflow(
    options: GitHubActionsGeneratorOptions,
    projectContext: any
  ): Promise<void> {
    const workflow = {
      name: `${options.projectName} CI`,
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main', 'develop'] }
      },
      concurrency: {
        group: '${{ github.workflow }}-${{ github.ref }}',
        cancel_in_progress: true
      },
      jobs: await this.generateCIJobs(options, projectContext)
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/ci-workflow.yml.hbs',
      '.github/workflows/ci.yml',
      workflow
    );
  }

  private async generateSecurityWorkflow(options: GitHubActionsGeneratorOptions): Promise<void> {
    const workflow = {
      name: 'Security Scan',
      on: {
        push: { branches: ['main'] },
        pull_request: { branches: ['main'] },
        schedule: [{ cron: '0 2 * * 1' }] // Weekly on Monday at 2 AM
      },
      permissions: {
        security_events: 'write',
        actions: 'read',
        contents: 'read'
      },
      jobs: {
        security: {
          name: 'Security Scanning',
          runs_on: 'ubuntu-24.04',
          steps: this.generateSecuritySteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/security-workflow.yml.hbs',
      '.github/workflows/security.yml',
      workflow
    );
  }

  private async generateDependencyCheckWorkflow(options: GitHubActionsGeneratorOptions): Promise<void> {
    const workflow = {
      name: 'Dependency Check',
      on: {
        push: { branches: ['main'] },
        pull_request: { branches: ['main'] },
        schedule: [{ cron: '0 6 * * *' }] // Daily at 6 AM
      },
      jobs: {
        dependency_check: {
          name: 'Dependency Vulnerability Check',
          runs_on: 'ubuntu-24.04',
          steps: this.generateDependencyCheckSteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/dependency-check-workflow.yml.hbs',
      '.github/workflows/dependency-check.yml',
      workflow
    );
  }

  private async generateReleaseWorkflow(options: GitHubActionsGeneratorOptions): Promise<void> {
    const workflow = {
      name: 'Release',
      on: {
        push: { branches: ['main'] }
      },
      permissions: {
        contents: 'write',
        issues: 'write',
        pull_requests: 'write',
        packages: 'write'
      },
      jobs: {
        release: {
          name: 'Semantic Release',
          runs_on: 'ubuntu-24.04',
          steps: this.generateReleaseSteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/release-workflow.yml.hbs',
      '.github/workflows/release.yml',
      workflow
    );
  }

  private async generatePerformanceWorkflow(options: GitHubActionsGeneratorOptions): Promise<void> {
    const workflow = {
      name: 'Performance Tests',
      on: {
        push: { branches: ['main'] },
        pull_request: { branches: ['main'] },
        workflow_dispatch: {}
      },
      jobs: {
        performance: {
          name: 'Performance Testing',
          runs_on: 'ubuntu-24.04',
          steps: this.generatePerformanceSteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/performance-workflow.yml.hbs',
      '.github/workflows/performance.yml',
      workflow
    );
  }

  private async generateDeploymentWorkflow(
    options: GitHubActionsGeneratorOptions,
    environment: Environment
  ): Promise<void> {
    const workflow = {
      name: `Deploy to ${environment.name}`,
      on: {
        workflow_run: {
          workflows: [`${options.projectName} CI`],
          types: ['completed'],
          branches: [environment.name === 'production' ? 'main' : 'develop']
        },
        workflow_dispatch: {}
      },
      jobs: {
        deploy: {
          name: `Deploy to ${environment.name}`,
          runs_on: 'ubuntu-24.04',
          environment: {
            name: environment.name,
            url: environment.url
          },
          if: '${{ github.event.workflow_run.conclusion == \'success\' }}',
          steps: this.generateDeploymentSteps(options, environment)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/deployment-workflow.yml.hbs',
      `.github/workflows/deploy-${environment.name}.yml`,
      workflow
    );
  }

  private async generateReusableWorkflows(options: GitHubActionsGeneratorOptions): Promise<void> {
    // Build reusable workflow
    const buildWorkflow = {
      name: 'Build',
      on: {
        workflow_call: {
          inputs: {
            environment: {
              required: true,
              type: 'string'
            },
            cache_key: {
              required: false,
              type: 'string',
              default: 'default'
            }
          },
          secrets: {
            registry_username: { required: false },
            registry_password: { required: false }
          }
        }
      },
      jobs: {
        build: {
          name: 'Build Application',
          runs_on: 'ubuntu-24.04',
          steps: this.generateBuildSteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/reusable/build-workflow.yml.hbs',
      '.github/workflows/reusable-build.yml',
      buildWorkflow
    );

    // Test reusable workflow
    const testWorkflow = {
      name: 'Test',
      on: {
        workflow_call: {
          inputs: {
            test_type: {
              required: true,
              type: 'string'
            }
          }
        }
      },
      jobs: {
        test: {
          name: 'Run Tests',
          runs_on: 'ubuntu-24.04',
          strategy: options.enableMatrix ? {
            matrix: this.generateTestMatrix(options)
          } : undefined,
          steps: this.generateTestSteps(options)
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/reusable/test-workflow.yml.hbs',
      '.github/workflows/reusable-test.yml',
      testWorkflow
    );
  }

  private async generateCompositeActions(options: GitHubActionsGeneratorOptions): Promise<void> {
    // Setup action
    const setupAction = {
      name: `Setup ${options.projectName}`,
      description: `Setup environment for ${options.projectName}`,
      inputs: {
        runtime_version: {
          description: `${options.runtime} version`,
          required: false,
          default: this.getDefaultRuntimeVersion(options.runtime)
        },
        cache_dependency_path: {
          description: 'Path to dependency file for caching',
          required: false,
          default: this.getDefaultDependencyPath(options)
        }
      },
      runs: {
        using: 'composite',
        steps: this.generateSetupActionSteps(options)
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/actions/setup/action.yml.hbs',
      '.github/actions/setup/action.yml',
      setupAction
    );

    // Build action
    const buildAction = {
      name: `Build ${options.projectName}`,
      description: `Build ${options.projectName} application`,
      inputs: {
        environment: {
          description: 'Build environment',
          required: false,
          default: 'production'
        }
      },
      runs: {
        using: 'composite',
        steps: this.generateBuildActionSteps(options)
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/actions/build/action.yml.hbs',
      '.github/actions/build/action.yml',
      buildAction
    );
  }

  private async generateWorkflowTemplates(options: GitHubActionsGeneratorOptions): Promise<void> {
    const template = {
      name: `${options.projectName} Workflow Template`,
      description: 'Template for creating new workflows',
      iconName: 'rocket',
      categories: ['deployment'],
      filePatterns: ['*.yml', '*.yaml']
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/workflow-templates/template.properties.json.hbs',
      '.github/workflow-templates/main.properties.json',
      template
    );

    const templateWorkflow = {
      name: 'Template Workflow',
      on: {
        push: { branches: ['$default-branch'] },
        pull_request: { branches: ['$default-branch'] }
      },
      jobs: {
        build: {
          runs_on: 'ubuntu-24.04',
          steps: [
            { uses: 'actions/checkout@v4' },
            { name: 'Run a one-line script', run: 'echo Hello, world!' }
          ]
        }
      }
    };

    await this.templateManager.renderTemplate(
      'devops/github-actions/workflow-templates/template.yml.hbs',
      '.github/workflow-templates/main.yml',
      templateWorkflow
    );
  }

  private generateTriggers(options: GitHubActionsGeneratorOptions): any {
    const triggers: any = {};

    if (options.triggers.push) {
      triggers.push = { branches: ['main', 'develop'] };
    }

    if (options.triggers.pullRequest) {
      triggers.pull_request = { branches: ['main'] };
    }

    if (options.triggers.schedule.length > 0) {
      triggers.schedule = options.triggers.schedule.map(cron => ({ cron }));
    }

    if (options.triggers.workflow_dispatch) {
      triggers.workflow_dispatch = {};
    }

    if (options.triggers.release) {
      triggers.release = { types: ['published'] };
    }

    return triggers;
  }

  private generateGlobalEnvironmentVariables(options: GitHubActionsGeneratorOptions): Record<string, string> {
    const env: Record<string, string> = {
      NODE_ENV: 'production',
      CI: 'true'
    };

    if (options.enableDocker) {
      env.REGISTRY = 'ghcr.io';
      env.IMAGE_NAME = '\${{ github.repository }}';
    }

    return env;
  }

  private async generateMainWorkflowJobs(
    options: GitHubActionsGeneratorOptions,
    projectContext: any
  ): Promise<Record<string, WorkflowJob>> {
    const jobs: Record<string, WorkflowJob> = {};

    // Setup job
    jobs.setup = {
      name: 'Setup',
      runs_on: 'ubuntu-24.04',
      steps: this.generateSetupSteps(options)
    };

    // Build job
    jobs.build = {
      name: 'Build',
      runs_on: 'ubuntu-24.04',
      needs: ['setup'],
      steps: this.generateBuildSteps(options)
    };

    // Test jobs
    if (options.enableTesting) {
      jobs.test = {
        name: 'Test',
        runs_on: 'ubuntu-24.04',
        needs: ['build'],
        strategy: options.enableMatrix ? {
          matrix: this.generateTestMatrix(options),
          fail_fast: false
        } : undefined,
        steps: this.generateTestSteps(options)
      };
    }

    // Lint job
    if (options.enableLinting) {
      jobs.lint = {
        name: 'Lint',
        runs_on: 'ubuntu-24.04',
        needs: ['setup'],
        steps: this.generateLintSteps(options)
      };
    }

    // Security job
    if (options.enableSecurity) {
      jobs.security = {
        name: 'Security',
        runs_on: 'ubuntu-24.04',
        needs: ['setup'],
        steps: this.generateSecuritySteps(options)
      };
    }

    // Docker build job
    if (options.enableDocker) {
      jobs.docker = {
        name: 'Docker Build',
        runs_on: 'ubuntu-24.04',
        needs: ['test'],
        if: '${{ github.event_name == \'push\' && github.ref == \'refs/heads/main\' }}',
        steps: this.generateDockerSteps(options)
      };
    }

    return jobs;
  }

  private async generateCIJobs(
    options: GitHubActionsGeneratorOptions,
    projectContext: any
  ): Promise<Record<string, WorkflowJob>> {
    const jobs: Record<string, WorkflowJob> = {};

    jobs.ci = {
      name: 'Continuous Integration',
      runs_on: 'ubuntu-24.04',
      timeout_minutes: options.timeouts.job,
      steps: [
        ...this.generateSetupSteps(options),
        ...this.generateBuildSteps(options),
        ...(options.enableLinting ? this.generateLintSteps(options) : []),
        ...(options.enableTesting ? this.generateTestSteps(options) : []),
        ...(options.enableSecurity ? this.generateSecuritySteps(options) : [])
      ]
    };

    return jobs;
  }

  private generateSetupSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    const steps: WorkflowStep[] = [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4',
        with: {
          fetch_depth: 0
        }
      }
    ];

    // Runtime-specific setup
    switch (options.runtime) {
      case 'node':
        steps.push({
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v4',
          with: {
            node_version: '20',
            cache: options.packageManager
          }
        });
        break;
      case 'python':
        steps.push({
          name: 'Setup Python',
          uses: 'actions/setup-python@v5',
          with: {
            python_version: '3.11'
          }
        });
        break;
      case 'go':
        steps.push({
          name: 'Setup Go',
          uses: 'actions/setup-go@v5',
          with: {
            go_version: '1.21'
          }
        });
        break;
      case 'java':
        steps.push({
          name: 'Setup Java',
          uses: 'actions/setup-java@v4',
          with: {
            java_version: '17',
            distribution: 'temurin'
          }
        });
        break;
      case 'dotnet':
        steps.push({
          name: 'Setup .NET',
          uses: 'actions/setup-dotnet@v4',
          with: {
            dotnet_version: '8.0.x'
          }
        });
        break;
    }

    // Install dependencies
    steps.push({
      name: 'Install dependencies',
      run: this.getInstallCommand(options)
    });

    return steps;
  }

  private generateBuildSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    if (options.enableCaching) {
      steps.push({
        name: 'Cache build artifacts',
        uses: 'actions/cache@v4',
        with: {
          path: this.getCachePaths(options),
          key: '\${{ runner.os }}-build-\${{ hashFiles(\'' + this.getDefaultDependencyPath(options) + '\') }}'
        }
      });
    }

    steps.push({
      name: 'Build application',
      run: this.getBuildCommand(options),
      env: {
        NODE_ENV: 'production'
      }
    });

    // Upload build artifacts
    steps.push({
      name: 'Upload build artifacts',
      uses: 'actions/upload-artifact@v4',
      with: {
        name: 'build-artifacts',
        path: this.getBuildArtifactPath(options),
        retention_days: 30
      }
    });

    return steps;
  }

  private generateTestSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    if (options.testFrameworks.includes('unit')) {
      steps.push({
        name: 'Run unit tests',
        run: this.getTestCommand(options, 'unit'),
        timeout_minutes: options.timeouts.step
      });
    }

    if (options.testFrameworks.includes('integration')) {
      steps.push({
        name: 'Run integration tests',
        run: this.getTestCommand(options, 'integration'),
        timeout_minutes: options.timeouts.step
      });
    }

    if (options.testFrameworks.includes('e2e')) {
      steps.push({
        name: 'Run E2E tests',
        run: this.getTestCommand(options, 'e2e'),
        timeout_minutes: options.timeouts.step
      });
    }

    if (options.enableCodeCoverage) {
      steps.push({
        name: 'Upload coverage reports',
        uses: 'codecov/codecov-action@v4',
        with: {
          token: '${{ secrets.CODECOV_TOKEN }}',
          files: './coverage/lcov.info',
          flags: 'unittests',
          name: 'codecov-umbrella'
        }
      });
    }

    return steps;
  }

  private generateLintSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    options.codeQualityTools.forEach(tool => {
      switch (tool) {
        case 'eslint':
          steps.push({
            name: 'Run ESLint',
            run: `${options.packageManager} run lint`
          });
          break;
        case 'prettier':
          steps.push({
            name: 'Check code formatting',
            run: `${options.packageManager} run format:check`
          });
          break;
        case 'biome':
          steps.push({
            name: 'Run Biome',
            run: `${options.packageManager} run biome:check`
          });
          break;
        case 'sonarqube':
          steps.push({
            name: 'SonarQube Scan',
            uses: 'sonarqube-quality-gate-action@master',
            env: {
              SONAR_TOKEN: '${{ secrets.SONAR_TOKEN }}'
            }
          });
          break;
      }
    });

    return steps;
  }

  private generateSecuritySteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    options.securityTools.forEach(tool => {
      switch (tool) {
        case 'snyk':
          steps.push({
            name: 'Run Snyk security scan',
            uses: 'snyk/actions/node@master',
            env: {
              SNYK_TOKEN: '${{ secrets.SNYK_TOKEN }}'
            }
          });
          break;
        case 'codeql':
          steps.push({
            name: 'Initialize CodeQL',
            uses: 'github/codeql-action/init@v3',
            with: {
              languages: this.getCodeQLLanguages(options.runtime)
            }
          });
          steps.push({
            name: 'Perform CodeQL Analysis',
            uses: 'github/codeql-action/analyze@v3'
          });
          break;
        case 'semgrep':
          steps.push({
            name: 'Run Semgrep',
            uses: 'semgrep/semgrep-action@v1',
            env: {
              SEMGREP_APP_TOKEN: '${{ secrets.SEMGREP_APP_TOKEN }}'
            }
          });
          break;
        case 'trivy':
          steps.push({
            name: 'Run Trivy vulnerability scanner',
            uses: 'aquasecurity/trivy-action@master',
            with: {
              scan_type: 'fs',
              scan_ref: '.',
              format: 'sarif',
              output: 'trivy-results.sarif'
            }
          });
          break;
      }
    });

    return steps;
  }

  private generateDependencyCheckSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4'
      },
      {
        name: 'Setup Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          node_version: '20'
        }
      },
      {
        name: 'Check for known vulnerabilities',
        run: this.getDependencyCheckCommand(options)
      },
      {
        name: 'Upload dependency check results',
        uses: 'actions/upload-artifact@v4',
        if: 'always()',
        with: {
          name: 'dependency-check-results',
          path: 'dependency-check-report.json'
        }
      }
    ];
  }

  private generateReleaseSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4',
        with: {
          fetch_depth: 0,
          persist_credentials: false
        }
      },
      {
        name: 'Setup Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          node_version: '20'
        }
      },
      {
        name: 'Install dependencies',
        run: this.getInstallCommand(options)
      },
      {
        name: 'Build application',
        run: this.getBuildCommand(options)
      },
      {
        name: 'Semantic Release',
        uses: 'cycjimmy/semantic-release-action@v4',
        env: {
          GITHUB_TOKEN: '${{ secrets.SEMANTIC_RELEASE_TOKEN }}',
          NPM_TOKEN: '${{ secrets.NPM_TOKEN }}'
        }
      }
    ];
  }

  private generatePerformanceSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4'
      },
      {
        name: 'Setup Node.js',
        uses: 'actions/setup-node@v4',
        with: {
          node_version: '20'
        }
      },
      {
        name: 'Install dependencies',
        run: this.getInstallCommand(options)
      },
      {
        name: 'Build application',
        run: this.getBuildCommand(options)
      },
      {
        name: 'Run performance tests',
        run: 'npx k6 run performance/load-test.js',
        env: {
          K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM: 'true'
        }
      },
      {
        name: 'Upload performance results',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: 'performance-results',
          path: 'performance-results.json'
        }
      }
    ];
  }

  private generateDeploymentSteps(
    options: GitHubActionsGeneratorOptions,
    environment: Environment
  ): WorkflowStep[] {
    const steps: WorkflowStep[] = [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4'
      },
      {
        name: 'Download build artifacts',
        uses: 'actions/download-artifact@v4',
        with: {
          name: 'build-artifacts',
          path: './dist'
        }
      }
    ];

    // Add deployment-specific steps based on targets
    const target = options.deploymentTargets.find(t => t.environment === environment.name);
    if (target) {
      switch (target.type) {
        case 'vercel':
          steps.push({
            name: 'Deploy to Vercel',
            uses: 'amondnet/vercel-action@v25',
            with: {
              vercel_token: '${{ secrets.VERCEL_TOKEN }}',
              vercel_org_id: '${{ secrets.VERCEL_ORG_ID }}',
              vercel_project_id: '${{ secrets.VERCEL_PROJECT_ID }}',
              production: environment.name === 'production' ? 'true' : 'false'
            }
          });
          break;
        case 'aws':
          steps.push({
            name: 'Configure AWS credentials',
            uses: 'aws-actions/configure-aws-credentials@v4',
            with: {
              aws_access_key_id: '${{ secrets.AWS_ACCESS_KEY_ID }}',
              aws_secret_access_key: '${{ secrets.AWS_SECRET_ACCESS_KEY }}',
              aws_region: target.config.region || 'us-east-1'
            }
          });
          steps.push({
            name: 'Deploy to AWS',
            run: 'aws s3 sync ./dist s3://${{ secrets.AWS_S3_BUCKET }} --delete'
          });
          break;
        case 'kubernetes':
          if (options.enableKubernetes) {
            steps.push({
              name: 'Setup kubectl',
              uses: 'azure/setup-kubectl@v3'
            });
            steps.push({
              name: 'Deploy to Kubernetes',
              run: 'kubectl apply -f k8s/',
              env: {
                KUBECONFIG: '${{ secrets.KUBECONFIG }}'
              }
            });
          }
          break;
      }
    }

    return steps;
  }

  private generateDockerSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Set up Docker Buildx',
        uses: 'docker/setup-buildx-action@v3'
      },
      {
        name: 'Log in to Container Registry',
        uses: 'docker/login-action@v3',
        with: {
          registry: 'ghcr.io',
          username: '${{ github.actor }}',
          password: '${{ secrets.GITHUB_TOKEN }}'
        }
      },
      {
        name: 'Extract metadata',
        id: 'meta',
        uses: 'docker/metadata-action@v5',
        with: {
          images: 'ghcr.io/${{ github.repository }}',
          tags: [
            'type=ref,event=branch',
            'type=ref,event=pr',
            'type=sha,prefix={{branch}}-',
            'type=raw,value=latest,enable={{is_default_branch}}'
          ]
        }
      },
      {
        name: 'Build and push Docker image',
        uses: 'docker/build-push-action@v5',
        with: {
          context: '.',
          push: true,
          tags: '${{ steps.meta.outputs.tags }}',
          labels: '${{ steps.meta.outputs.labels }}',
          cache_from: 'type=gha',
          cache_to: 'type=gha,mode=max'
        }
      }
    ];
  }

  private generateSetupActionSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Setup runtime',
        uses: this.getRuntimeSetupAction(options.runtime),
        with: this.getRuntimeSetupConfig(options)
      },
      {
        name: 'Cache dependencies',
        uses: 'actions/cache@v4',
        with: {
          path: this.getCachePaths(options),
          key: '\${{ runner.os }}-deps-\${{ hashFiles(\'\${{ inputs.cache_dependency_path }}\') }}'
        }
      },
      {
        name: 'Install dependencies',
        run: this.getInstallCommand(options)
      }
    ];
  }

  private generateBuildActionSteps(options: GitHubActionsGeneratorOptions): WorkflowStep[] {
    return [
      {
        name: 'Build application',
        run: this.getBuildCommand(options),
        env: {
          NODE_ENV: '${{ inputs.environment }}'
        }
      },
      {
        name: 'Upload artifacts',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: 'build-${{ inputs.environment }}',
          path: this.getBuildArtifactPath(options)
        }
      }
    ];
  }

  private generateTestMatrix(options: GitHubActionsGeneratorOptions): Record<string, any> {
    const matrix: Record<string, any> = {};

    switch (options.runtime) {
      case 'node':
        matrix.node_version = ['18', '20', '22'];
        matrix.os = ['ubuntu-24.04', 'windows-latest', 'macos-latest'];
        break;
      case 'python':
        matrix.python_version = ['3.9', '3.10', '3.11', '3.12'];
        matrix.os = ['ubuntu-24.04', 'windows-latest', 'macos-latest'];
        break;
      case 'go':
        matrix.go_version = ['1.20', '1.21', '1.22'];
        matrix.os = ['ubuntu-24.04', 'windows-latest', 'macos-latest'];
        break;
    }

    return matrix;
  }

  // Helper methods
  private getDefaultRuntimeVersion(runtime: string): string {
    const versions = {
      node: '20',
      python: '3.11',
      go: '1.21',
      java: '17',
      dotnet: '8.0.x',
      php: '8.2',
      rust: '1.75.0'
    };
    return versions[runtime] || 'latest';
  }

  private getDefaultDependencyPath(options: GitHubActionsGeneratorOptions): string {
    const paths = {
      npm: 'package-lock.json',
      yarn: 'yarn.lock',
      pnpm: 'pnpm-lock.yaml',
      bun: 'bun.lockb'
    };
    return paths[options.packageManager] || 'package-lock.json';
  }

  private getInstallCommand(options: GitHubActionsGeneratorOptions): string {
    const commands = {
      npm: 'npm ci',
      yarn: 'yarn install --frozen-lockfile',
      pnpm: 'pnpm install --frozen-lockfile',
      bun: 'bun install --frozen-lockfile'
    };
    return commands[options.packageManager] || 'npm ci';
  }

  private getBuildCommand(options: GitHubActionsGeneratorOptions): string {
    return `${options.packageManager} run build`;
  }

  private getTestCommand(options: GitHubActionsGeneratorOptions, type: string): string {
    return `${options.packageManager} run test:${type}`;
  }

  private getDependencyCheckCommand(options: GitHubActionsGeneratorOptions): string {
    switch (options.packageManager) {
      case 'npm':
        return 'npm audit --audit-level=high --json > dependency-check-report.json';
      case 'yarn':
        return 'yarn audit --json > dependency-check-report.json';
      case 'pnpm':
        return 'pnpm audit --json > dependency-check-report.json';
      default:
        return 'npm audit --audit-level=high --json > dependency-check-report.json';
    }
  }

  private getCachePaths(options: GitHubActionsGeneratorOptions): string {
    const paths = {
      npm: '~/.npm',
      yarn: '~/.yarn/cache',
      pnpm: '~/.pnpm-store',
      bun: '~/.bun/install/cache'
    };
    return paths[options.packageManager] || '~/.npm';
  }

  private getBuildArtifactPath(options: GitHubActionsGeneratorOptions): string {
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

  private getRuntimeSetupAction(runtime: string): string {
    const actions = {
      node: 'actions/setup-node@v4',
      python: 'actions/setup-python@v5',
      go: 'actions/setup-go@v5',
      java: 'actions/setup-java@v4',
      dotnet: 'actions/setup-dotnet@v4'
    };
    return actions[runtime] || 'actions/setup-node@v4';
  }

  private getRuntimeSetupConfig(options: GitHubActionsGeneratorOptions): Record<string, any> {
    const config: Record<string, any> = {};
    
    switch (options.runtime) {
      case 'node':
        config.node_version = '${{ inputs.runtime_version }}';
        config.cache = options.packageManager;
        break;
      case 'python':
        config.python_version = '${{ inputs.runtime_version }}';
        break;
      case 'go':
        config.go_version = '${{ inputs.runtime_version }}';
        break;
      case 'java':
        config.java_version = '${{ inputs.runtime_version }}';
        config.distribution = 'temurin';
        break;
      case 'dotnet':
        config.dotnet_version = '${{ inputs.runtime_version }}';
        break;
    }
    
    return config;
  }

  private getCodeQLLanguages(runtime: string): string {
    const languages = {
      node: 'javascript',
      python: 'python',
      go: 'go',
      java: 'java',
      dotnet: 'csharp',
      php: 'php',
      rust: 'rust'
    };
    return languages[runtime] || 'javascript';
  }
}
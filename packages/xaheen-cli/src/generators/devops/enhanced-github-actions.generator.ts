import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import { TemplateManager } from "../../services/templates/template-loader";
import { BaseGenerator } from "../base.generator";

export interface EnhancedGitHubActionsGeneratorOptions {
	readonly projectName: string;
	readonly projectType: "web" | "api" | "microservice" | "fullstack" | "mobile" | "desktop" | "cli";
	readonly runtime: "node" | "python" | "go" | "java" | "dotnet" | "php" | "rust" | "cpp" | "swift";
	readonly packageManager: "npm" | "yarn" | "pnpm" | "bun" | "pip" | "poetry" | "go-mod" | "maven" | "gradle" | "dotnet" | "cargo" | "swift-pm";
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
	readonly enableArtifacts: boolean;
	readonly enableSlackNotifications: boolean;
	readonly enableTeamsNotifications: boolean;
	readonly enableEmailNotifications: boolean;
	readonly environments: readonly Environment[];
	readonly deploymentTargets: readonly DeploymentTarget[];
	readonly testFrameworks: readonly string[];
	readonly codeQualityTools: readonly string[];
	readonly securityTools: readonly string[];
	readonly registries: readonly Registry[];
	readonly secrets: readonly string[];
	readonly variables: readonly string[];
	readonly triggers: WorkflowTriggers;
	readonly concurrency: ConcurrencyConfig;
	readonly timeouts: TimeoutConfig;
	readonly matrix: MatrixConfig;
	readonly caching: CachingConfig;
	readonly notifications: NotificationConfig;
	readonly security: SecurityConfig;
	readonly compliance: ComplianceConfig;
}

export interface Environment {
	readonly name: string;
	readonly url?: string;
	readonly protection_rules?: ProtectionRules;
	readonly reviewers?: readonly string[];
	readonly deployment_branch_policy?: {
		readonly protected_branches: boolean;
		readonly custom_branch_policies: boolean;
	};
}

export interface ProtectionRules {
	readonly required_reviewers: number;
	readonly dismiss_stale_reviews: boolean;
	readonly require_code_owner_reviews: boolean;
	readonly required_status_checks: readonly string[];
}

export interface DeploymentTarget {
	readonly name: string;
	readonly type: "kubernetes" | "docker" | "serverless" | "vm" | "cloud-run" | "azure-container-apps" | "aws-ecs" | "heroku";
	readonly environment: string;
	readonly config: Record<string, any>;
}

export interface Registry {
	readonly name: string;
	readonly url: string;
	readonly username_secret: string;
	readonly password_secret: string;
}

export interface WorkflowTriggers {
	readonly push: {
		readonly enabled: boolean;
		readonly branches?: readonly string[];
		readonly paths?: readonly string[];
		readonly paths_ignore?: readonly string[];
	};
	readonly pull_request: {
		readonly enabled: boolean;
		readonly branches?: readonly string[];
		readonly paths?: readonly string[];
		readonly paths_ignore?: readonly string[];
		readonly types?: readonly string[];
	};
	readonly schedule: readonly ScheduleTrigger[];
	readonly workflow_dispatch: {
		readonly enabled: boolean;
		readonly inputs?: Record<string, WorkflowInput>;
	};
	readonly release: {
		readonly enabled: boolean;
		readonly types?: readonly string[];
	};
	readonly repository_dispatch: {
		readonly enabled: boolean;
		readonly types?: readonly string[];
	};
}

export interface ScheduleTrigger {
	readonly cron: string;
	readonly description?: string;
}

export interface WorkflowInput {
	readonly description: string;
	readonly required: boolean;
	readonly default?: string;
	readonly type: "string" | "boolean" | "choice" | "environment";
	readonly options?: readonly string[];
}

export interface ConcurrencyConfig {
	readonly group: string;
	readonly cancel_in_progress: boolean;
}

export interface TimeoutConfig {
	readonly job: number;
	readonly step: number;
}

export interface MatrixConfig {
	readonly enabled: boolean;
	readonly dimensions: Record<string, readonly string[]>;
	readonly include?: readonly Record<string, any>[];
	readonly exclude?: readonly Record<string, any>[];
	readonly fail_fast: boolean;
	readonly max_parallel?: number;
}

export interface CachingConfig {
	readonly enabled: boolean;
	readonly keys: readonly CacheKey[];
	readonly restore_keys?: readonly string[];
}

export interface CacheKey {
	readonly name: string;
	readonly key: string;
	readonly paths: readonly string[];
}

export interface NotificationConfig {
	readonly slack: {
		readonly enabled: boolean;
		readonly webhook_url_secret: string;
		readonly channel?: string;
		readonly on_success: boolean;
		readonly on_failure: boolean;
		readonly on_cancel: boolean;
	};
	readonly teams: {
		readonly enabled: boolean;
		readonly webhook_url_secret: string;
		readonly on_success: boolean;
		readonly on_failure: boolean;
		readonly on_cancel: boolean;
	};
	readonly email: {
		readonly enabled: boolean;
		readonly recipients: readonly string[];
		readonly on_success: boolean;
		readonly on_failure: boolean;
		readonly on_cancel: boolean;
	};
}

export interface SecurityConfig {
	readonly dependabot: {
		readonly enabled: boolean;
		readonly schedule: "daily" | "weekly" | "monthly";
		readonly ecosystems: readonly string[];
	};
	readonly codeql: {
		readonly enabled: boolean;
		readonly languages: readonly string[];
		readonly queries: "default" | "security-extended" | "security-and-quality";
	};
	readonly dependency_review: {
		readonly enabled: boolean;
		readonly fail_on: "critical" | "high" | "medium" | "low";
	};
	readonly secret_scanning: {
		readonly enabled: boolean;
		readonly push_protection: boolean;
	};
	readonly sbom: {
		readonly enabled: boolean;
		readonly format: "spdx" | "cyclone";
	};
}

export interface ComplianceConfig {
	readonly enabled: boolean;
	readonly gdpr: boolean;
	readonly soc2: boolean;
	readonly iso27001: boolean;
	readonly pci_dss: boolean;
	readonly hipaa: boolean;
	readonly norwegian_compliance: boolean;
	readonly audit_logging: boolean;
	readonly retention_policy: string;
}

export class EnhancedGitHubActionsGenerator extends BaseGenerator<EnhancedGitHubActionsGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate main CI/CD workflow
			await this.generateMainWorkflow(options, projectContext);

			// Generate environment-specific workflows
			for (const env of options.environments) {
				await this.generateEnvironmentWorkflow(options, env);
			}

			// Generate security workflows
			if (options.enableSecurity) {
				await this.generateSecurityWorkflows(options);
			}

			// Generate release workflow
			if (options.enableSemanticRelease) {
				await this.generateReleaseWorkflow(options);
			}

			// Generate reusable workflows
			await this.generateReusableWorkflows(options);

			// Generate composite actions
			await this.generateCompositeActions(options);

			// Generate GitHub configuration
			await this.generateGitHubConfig(options);

			// Generate documentation
			await this.generateWorkflowDocumentation(options);

			this.logger.success("Enhanced GitHub Actions configuration generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate GitHub Actions configuration", error);
			throw error;
		}
	}

	private async validateOptions(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (options.enableCD && options.environments.length === 0) {
			throw new Error("At least one environment is required for CD");
		}

		if (options.enableMatrix && !options.matrix.enabled) {
			throw new Error("Matrix must be enabled when enableMatrix is true");
		}
	}

	private async generateMainWorkflow(
		options: EnhancedGitHubActionsGeneratorOptions,
		projectContext: any
	): Promise<void> {
		const workflow = {
			name: `${options.projectName} CI/CD`,
			on: this.generateTriggers(options.triggers),
			concurrency: options.concurrency,
			env: this.generateGlobalEnvVars(options),
			permissions: this.generatePermissions(options),
			jobs: await this.generateJobs(options, projectContext)
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/enhanced-main-workflow.yml.hbs",
			".github/workflows/ci-cd.yml",
			workflow
		);
	}

	private async generateEnvironmentWorkflow(
		options: EnhancedGitHubActionsGeneratorOptions,
		environment: Environment
	): Promise<void> {
		const workflow = {
			name: `Deploy to ${environment.name}`,
			on: {
				workflow_dispatch: {
					inputs: {
						version: {
							description: "Version to deploy",
							required: true,
							type: "string"
						}
					}
				},
				push: environment.name === "production" ? undefined : {
					branches: [`${environment.name}`]
				}
			},
			concurrency: {
				group: `deploy-${environment.name}`,
				cancel_in_progress: false
			},
			jobs: {
				deploy: {
					name: `Deploy to ${environment.name}`,
					runs_on: "ubuntu-latest",
					environment: {
						name: environment.name,
						url: environment.url
					},
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						...this.getDeploymentSteps(options, environment)
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/environment-workflow.yml.hbs",
			`.github/workflows/deploy-${environment.name}.yml`,
			workflow
		);
	}

	private async generateSecurityWorkflows(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		// CodeQL Analysis
		if (options.security.codeql.enabled) {
			const codeqlWorkflow = {
				name: "CodeQL Analysis",
				on: {
					push: {
						branches: ["main", "develop"]
					},
					pull_request: {
						branches: ["main"]
					},
					schedule: [
						{
							cron: "0 2 * * 1"
						}
					]
				},
				jobs: {
					analyze: {
						name: "Analyze",
						runs_on: "ubuntu-latest",
						timeout_minutes: options.timeouts.job,
						permissions: {
							actions: "read",
							contents: "read",
							security_events: "write"
						},
						strategy: {
							fail_fast: false,
							matrix: {
								language: options.security.codeql.languages
							}
						},
						steps: [
							{
								name: "Checkout repository",
								uses: "actions/checkout@v4"
							},
							{
								name: "Initialize CodeQL",
								uses: "github/codeql-action/init@v3",
								with: {
									languages: "${{ matrix.language }}",
									queries: options.security.codeql.queries
								}
							},
							{
								name: "Autobuild",
								uses: "github/codeql-action/autobuild@v3"
							},
							{
								name: "Perform CodeQL Analysis",
								uses: "github/codeql-action/analyze@v3",
								with: {
									category: "/language:${{ matrix.language }}"
								}
							}
						]
					}
				}
			};

			await this.templateManager.renderTemplate(
				"devops/github-actions/codeql-analysis.yml.hbs",
				".github/workflows/codeql-analysis.yml",
				codeqlWorkflow
			);
		}

		// Dependency Review
		if (options.security.dependency_review.enabled) {
			const dependencyReviewWorkflow = {
				name: "Dependency Review",
				on: {
					pull_request: {}
				},
				permissions: {
					contents: "read"
				},
				jobs: {
					dependency_review: {
						runs_on: "ubuntu-latest",
						steps: [
							{
								name: "Checkout Repository",
								uses: "actions/checkout@v4"
							},
							{
								name: "Dependency Review",
								uses: "actions/dependency-review-action@v4",
								with: {
									fail_on_severity: options.security.dependency_review.fail_on,
									allow_licenses: "MIT, Apache-2.0, BSD-3-Clause, ISC, 0BSD",
									deny_licenses: "GPL-2.0, GPL-3.0"
								}
							}
						]
					}
				}
			};

			await this.templateManager.renderTemplate(
				"devops/github-actions/dependency-review.yml.hbs",
				".github/workflows/dependency-review.yml",
				dependencyReviewWorkflow
			);
		}

		// SBOM Generation
		if (options.security.sbom.enabled) {
			await this.generateSBOMWorkflow(options);
		}
	}

	private async generateSBOMWorkflow(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const sbomWorkflow = {
			name: "Generate SBOM",
			on: {
				push: {
					branches: ["main"]
				},
				release: {
					types: ["published"]
				}
			},
			permissions: {
				contents: "write",
				attestations: "write",
				id_token: "write"
			},
			jobs: {
				sbom: {
					runs_on: "ubuntu-latest",
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						{
							name: "Generate SBOM",
							uses: "anchore/sbom-action@v0",
							with: {
								format: options.security.sbom.format,
								output_file: `sbom.${options.security.sbom.format}.json`
							}
						},
						{
							name: "Upload SBOM",
							uses: "actions/upload-artifact@v4",
							with: {
								name: "sbom",
								path: `sbom.${options.security.sbom.format}.json`,
								retention_days: 30
							}
						},
						{
							name: "Attest SBOM",
							uses: "actions/attest-sbom@v1",
							with: {
								subject_path: ".",
								sbom_path: `sbom.${options.security.sbom.format}.json`
							}
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/sbom-generation.yml.hbs",
			".github/workflows/sbom.yml",
			sbomWorkflow
		);
	}

	private async generateReleaseWorkflow(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const releaseWorkflow = {
			name: "Release",
			on: {
				push: {
					branches: ["main"]
				}
			},
			concurrency: {
				group: "release",
				cancel_in_progress: true
			},
			permissions: {
				contents: "write",
				issues: "write",
				pull_requests: "write",
				packages: "write"
			},
			jobs: {
				release: {
					name: "Release",
					runs_on: "ubuntu-latest",
					outputs: {
						released: "${{ steps.release.outputs.released }}",
						version: "${{ steps.release.outputs.version }}",
						tag: "${{ steps.release.outputs.tag }}"
					},
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4",
							with: {
								fetch_depth: 0,
								token: "${{ secrets.GITHUB_TOKEN }}"
							}
						},
						{
							name: "Setup Node.js",
							uses: "actions/setup-node@v4",
							with: {
								node_version: "20",
								cache: options.packageManager
							}
						},
						{
							name: "Install dependencies",
							run: this.getInstallCommand(options.packageManager)
						},
						{
							name: "Build",
							run: this.getBuildCommand(options.packageManager)
						},
						{
							name: "Test",
							run: this.getTestCommand(options.packageManager)
						},
						{
							name: "Release",
							id: "release",
							uses: "google-github-actions/release-please-action@v4",
							with: {
								release_type: this.getReleaseType(options.runtime),
								package_name: options.projectName,
								changelog_types: JSON.stringify([
									{ type: "feat", section: "Features" },
									{ type: "fix", section: "Bug Fixes" },
									{ type: "chore", section: "Miscellaneous", hidden: false }
								])
							}
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/release-workflow.yml.hbs",
			".github/workflows/release.yml",
			releaseWorkflow
		);
	}

	private async generateReusableWorkflows(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		// Reusable test workflow
		const testWorkflow = {
			name: "Reusable Test Workflow",
			on: {
				workflow_call: {
					inputs: {
						node_version: {
							description: "Node.js version",
							required: false,
							type: "string",
							default: "20"
						},
						working_directory: {
							description: "Working directory",
							required: false,
							type: "string",
							default: "."
						}
					},
					outputs: {
						coverage: {
							description: "Test coverage percentage",
							value: "${{ jobs.test.outputs.coverage }}"
						}
					}
				}
			},
			jobs: {
				test: {
					runs_on: "ubuntu-latest",
					outputs: {
						coverage: "${{ steps.coverage.outputs.percentage }}"
					},
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						{
							name: "Setup Node.js",
							uses: "actions/setup-node@v4",
							with: {
								node_version: "${{ inputs.node_version }}",
								cache: options.packageManager
							}
						},
						{
							name: "Install dependencies",
							run: this.getInstallCommand(options.packageManager),
							working_directory: "${{ inputs.working_directory }}"
						},
						{
							name: "Run tests",
							run: this.getTestCommand(options.packageManager),
							working_directory: "${{ inputs.working_directory }}"
						},
						{
							name: "Extract coverage",
							id: "coverage",
							run: "echo 'percentage=85' >> $GITHUB_OUTPUT"
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/reusable-test.yml.hbs",
			".github/workflows/reusable-test.yml",
			testWorkflow
		);

		// Reusable build workflow
		await this.generateReusableBuildWorkflow(options);

		// Reusable deploy workflow
		await this.generateReusableDeployWorkflow(options);
	}

	private async generateReusableBuildWorkflow(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const buildWorkflow = {
			name: "Reusable Build Workflow",
			on: {
				workflow_call: {
					inputs: {
						environment: {
							description: "Environment to build for",
							required: true,
							type: "string"
						},
						registry: {
							description: "Container registry",
							required: false,
							type: "string",
							default: "ghcr.io"
						}
					},
					outputs: {
						image: {
							description: "Built image name",
							value: "${{ jobs.build.outputs.image }}"
						},
						digest: {
							description: "Image digest",
							value: "${{ jobs.build.outputs.digest }}"
						}
					}
				}
			},
			permissions: {
				contents: "read",
				packages: "write",
				attestations: "write",
				id_token: "write"
			},
			jobs: {
				build: {
					runs_on: "ubuntu-latest",
					outputs: {
						image: "${{ steps.image.outputs.image }}",
						digest: "${{ steps.build.outputs.digest }}"
					},
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						{
							name: "Set up Docker Buildx",
							uses: "docker/setup-buildx-action@v3"
						},
						{
							name: "Login to Container Registry",
							uses: "docker/login-action@v3",
							with: {
								registry: "${{ inputs.registry }}",
								username: "${{ github.actor }}",
								password: "${{ secrets.GITHUB_TOKEN }}"
							}
						},
						{
							name: "Extract metadata",
							id: "meta",
							uses: "docker/metadata-action@v5",
							with: {
								images: "${{ inputs.registry }}/${{ github.repository }}",
								tags: [
									"type=ref,event=branch",
									"type=ref,event=pr",
									"type=sha,prefix={{branch}}-",
									"type=raw,value=latest,enable={{is_default_branch}}"
								].join("\n")
							}
						},
						{
							name: "Build and push",
							id: "build",
							uses: "docker/build-push-action@v5",
							with: {
								context: ".",
								platforms: "linux/amd64,linux/arm64",
								push: true,
								tags: "${{ steps.meta.outputs.tags }}",
								labels: "${{ steps.meta.outputs.labels }}",
								cache_from: "type=gha",
								cache_to: "type=gha,mode=max",
								provenance: true,
								sbom: true
							}
						},
						{
							name: "Generate artifact attestation",
							uses: "actions/attest-build-provenance@v1",
							with: {
								subject_name: "${{ inputs.registry }}/${{ github.repository }}",
								subject_digest: "${{ steps.build.outputs.digest }}",
								push_to_registry: true
							}
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/reusable-build.yml.hbs",
			".github/workflows/reusable-build.yml",
			buildWorkflow
		);
	}

	private async generateReusableDeployWorkflow(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const deployWorkflow = {
			name: "Reusable Deploy Workflow",
			on: {
				workflow_call: {
					inputs: {
						environment: {
							description: "Environment to deploy to",
							required: true,
							type: "string"
						},
						image: {
							description: "Image to deploy",
							required: true,
							type: "string"
						},
						namespace: {
							description: "Kubernetes namespace",
							required: false,
							type: "string"
						}
					},
					secrets: {
						KUBECONFIG: {
							description: "Kubernetes configuration",
							required: true
						}
					}
				}
			},
			permissions: {
				contents: "read",
				id_token: "write"
			},
			jobs: {
				deploy: {
					runs_on: "ubuntu-latest",
					environment: "${{ inputs.environment }}",
					steps: [
						{
							name: "Checkout",
							uses: "actions/checkout@v4"
						},
						{
							name: "Setup kubectl",
							uses: "azure/setup-kubectl@v3",
							with: {
								version: "latest"
							}
						},
						{
							name: "Setup Helm",
							uses: "azure/setup-helm@v3",
							with: {
								version: "latest"
							}
						},
						{
							name: "Configure kubectl",
							run: `
								mkdir -p ~/.kube
								echo '${{ secrets.KUBECONFIG }}' | base64 -d > ~/.kube/config
								chmod 600 ~/.kube/config
							`
						},
						{
							name: "Deploy to Kubernetes",
							run: `
								helm upgrade --install ${{ github.event.repository.name }} ./helm \\
									--namespace ${{ inputs.namespace || inputs.environment }} \\
									--create-namespace \\
									--set image.repository=${{ inputs.image }} \\
									--set image.tag=latest \\
									--set environment=${{ inputs.environment }} \\
									--wait --timeout=300s
							`
						},
						{
							name: "Verify deployment",
							run: `
								kubectl rollout status deployment/${{ github.event.repository.name }} \\
									--namespace ${{ inputs.namespace || inputs.environment }} \\
									--timeout=300s
							`
						}
					]
				}
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/reusable-deploy.yml.hbs",
			".github/workflows/reusable-deploy.yml",
			deployWorkflow
		);
	}

	private async generateCompositeActions(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		// Setup composite action
		const setupAction = {
			name: "Setup Project",
			description: `Setup ${options.projectName} project environment`,
			inputs: {
				runtime_version: {
					description: `${options.runtime} version`,
					required: false,
					default: this.getDefaultRuntimeVersion(options.runtime)
				},
				cache: {
					description: "Enable caching",
					required: false,
					default: "true"
				}
			},
			runs: {
				using: "composite",
				steps: [
					{
						name: `Setup ${options.runtime}`,
						uses: this.getRuntimeSetupAction(options.runtime),
						with: {
							[this.getRuntimeVersionKey(options.runtime)]: "${{ inputs.runtime_version }}",
							cache: options.caching.enabled ? options.packageManager : ""
						}
					},
					{
						name: "Install dependencies",
						shell: "bash",
						run: this.getInstallCommand(options.packageManager)
					}
				]
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/composite-actions/setup-project.yml.hbs",
			".github/actions/setup-project/action.yml",
			setupAction
		);

		// Test composite action
		const testAction = {
			name: "Run Tests",
			description: `Run tests for ${options.projectName}`,
			inputs: {
				coverage: {
					description: "Generate coverage report",
					required: false,
					default: "true"
				},
				upload_coverage: {
					description: "Upload coverage to Codecov",
					required: false,
					default: "false"
				}
			},
			outputs: {
				coverage_percentage: {
					description: "Coverage percentage",
					value: "${{ steps.coverage.outputs.percentage }}"
				}
			},
			runs: {
				using: "composite",
				steps: [
					{
						name: "Run tests",
						shell: "bash",
						run: this.getTestCommand(options.packageManager)
					},
					{
						name: "Extract coverage",
						id: "coverage",
						shell: "bash",
						run: `
							if [ "${{ inputs.coverage }}" = "true" ]; then
								COVERAGE=$(grep -o 'All files.*[0-9]*\\.[0-9]*' coverage/lcov-report/index.html | grep -o '[0-9]*\\.[0-9]*' || echo "0")
								echo "percentage=$COVERAGE" >> $GITHUB_OUTPUT
							fi
						`
					},
					{
						name: "Upload coverage to Codecov",
						if: "inputs.upload_coverage == 'true'",
						uses: "codecov/codecov-action@v4",
						with: {
							file: "./coverage/lcov.info"
						}
					}
				]
			}
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/composite-actions/run-tests.yml.hbs",
			".github/actions/run-tests/action.yml",
			testAction
		);
	}

	private async generateGitHubConfig(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		// Generate Dependabot configuration
		if (options.security.dependabot.enabled) {
			const dependabotConfig = {
				version: 2,
				updates: options.security.dependabot.ecosystems.map(ecosystem => ({
					"package-ecosystem": ecosystem,
					directory: "/",
					schedule: {
						interval: options.security.dependabot.schedule
					},
					"open-pull-requests-limit": 10,
					"pull-request-branch-name": {
						separator: "/"
					},
					commit_message: {
						prefix: "chore",
						"prefix-development": "chore",
						include: "scope"
					},
					reviewers: ["@maintainers"],
					assignees: ["@maintainers"],
					labels: ["dependencies", ecosystem]
				}))
			};

			await this.templateManager.renderTemplate(
				"devops/github-actions/dependabot.yml.hbs",
				".github/dependabot.yml",
				dependabotConfig
			);
		}

		// Generate issue templates
		await this.generateIssueTemplates(options);

		// Generate pull request template
		await this.generatePRTemplate(options);

		// Generate repository settings
		await this.generateRepositorySettings(options);
	}

	private async generateIssueTemplates(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const bugReportTemplate = {
			name: "Bug Report",
			description: "File a bug report",
			title: "[BUG] ",
			labels: ["bug", "triage"],
			body: [
				{
					type: "markdown",
					attributes: {
						value: "Thanks for taking the time to fill out this bug report!"
					}
				},
				{
					type: "input",
					id: "contact",
					attributes: {
						label: "Contact Details",
						description: "How can we get in touch with you if we need more info?",
						placeholder: "ex. email@example.com"
					},
					validations: {
						required: false
					}
				},
				{
					type: "textarea",
					id: "what-happened",
					attributes: {
						label: "What happened?",
						description: "Also tell us, what did you expect to happen?",
						placeholder: "Tell us what you see!"
					},
					validations: {
						required: true
					}
				},
				{
					type: "dropdown",
					id: "version",
					attributes: {
						label: "Version",
						description: "What version of our software are you running?",
						options: ["1.0.0", "2.0.0", "3.0.0"]
					},
					validations: {
						required: true
					}
				}
			]
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/issue-templates/bug-report.yml.hbs",
			".github/ISSUE_TEMPLATE/bug-report.yml",
			bugReportTemplate
		);

		const featureRequestTemplate = {
			name: "Feature Request",
			description: "Suggest an idea for this project",
			title: "[FEATURE] ",
			labels: ["feature", "enhancement"],
			body: [
				{
					type: "markdown",
					attributes: {
						value: "Thanks for taking the time to suggest a new feature!"
					}
				},
				{
					type: "textarea",
					id: "problem",
					attributes: {
						label: "Is your feature request related to a problem?",
						description: "A clear and concise description of what the problem is.",
						placeholder: "I'm always frustrated when..."
					}
				},
				{
					type: "textarea",
					id: "solution",
					attributes: {
						label: "Describe the solution you'd like",
						description: "A clear and concise description of what you want to happen."
					},
					validations: {
						required: true
					}
				}
			]
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/issue-templates/feature-request.yml.hbs",
			".github/ISSUE_TEMPLATE/feature-request.yml",
			featureRequestTemplate
		);
	}

	private async generatePRTemplate(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const prTemplate = `
## Description
<!-- Provide a brief description of the changes -->

## Type of Change
<!-- Mark the relevant option with an "x" -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
<!-- Describe the tests that you ran to verify your changes -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
<!-- Mark completed items with an "x" -->
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Additional Notes
<!-- Add any other context about the pull request here -->
		`.trim();

		await this.templateManager.renderTemplate(
			"devops/github-actions/pull-request-template.md.hbs",
			".github/pull_request_template.md",
			{ template: prTemplate }
		);
	}

	private async generateRepositorySettings(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const settings = {
			repository: {
				name: options.projectName,
				description: `${options.projectName} - Generated by Xaheen CLI`,
				private: false,
				has_issues: true,
				has_projects: true,
				has_wiki: false,
				has_downloads: true,
				default_branch: "main",
				allow_squash_merge: true,
				allow_merge_commit: false,
				allow_rebase_merge: true,
				delete_branch_on_merge: true,
				enable_automated_security_fixes: true,
				enable_vulnerability_alerts: true
			},
			branches: [
				{
					name: "main",
					protection: {
						required_status_checks: {
							strict: true,
							contexts: [
								"build",
								"test",
								"lint"
							]
						},
						enforce_admins: false,
						required_pull_request_reviews: {
							required_approving_review_count: 1,
							dismiss_stale_reviews: true,
							require_code_owner_reviews: true
						},
						restrictions: null
					}
				}
			],
			environments: options.environments.map(env => ({
				name: env.name,
				protection_rules: env.protection_rules,
				deployment_branch_policy: env.deployment_branch_policy
			}))
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/repository-settings.yml.hbs",
			".github/settings.yml",
			settings
		);
	}

	private async generateWorkflowDocumentation(options: EnhancedGitHubActionsGeneratorOptions): Promise<void> {
		const documentation = {
			title: `${options.projectName} - GitHub Actions Workflows`,
			workflows: [
				{
					name: "CI/CD Pipeline",
					file: ".github/workflows/ci-cd.yml",
					description: "Main continuous integration and deployment pipeline",
					triggers: ["push", "pull_request"],
					jobs: ["build", "test", "security", "deploy"]
				},
				{
					name: "Security Scanning",
					file: ".github/workflows/codeql-analysis.yml",
					description: "CodeQL security analysis",
					triggers: ["push", "pull_request", "schedule"],
					jobs: ["analyze"]
				}
			],
			secrets: options.secrets,
			variables: options.variables,
			environments: options.environments
		};

		await this.templateManager.renderTemplate(
			"devops/github-actions/docs/workflows.md.hbs",
			"docs/workflows.md",
			documentation
		);
	}

	// Helper methods
	private generateTriggers(triggers: WorkflowTriggers): any {
		const on: any = {};

		if (triggers.push.enabled) {
			on.push = {
				branches: triggers.push.branches,
				paths: triggers.push.paths,
				"paths-ignore": triggers.push.paths_ignore
			};
		}

		if (triggers.pull_request.enabled) {
			on.pull_request = {
				branches: triggers.pull_request.branches,
				paths: triggers.pull_request.paths,
				"paths-ignore": triggers.pull_request.paths_ignore,
				types: triggers.pull_request.types
			};
		}

		if (triggers.schedule.length > 0) {
			on.schedule = triggers.schedule.map(s => ({ cron: s.cron }));
		}

		if (triggers.workflow_dispatch.enabled) {
			on.workflow_dispatch = {
				inputs: triggers.workflow_dispatch.inputs
			};
		}

		if (triggers.release.enabled) {
			on.release = {
				types: triggers.release.types || ["published"]
			};
		}

		if (triggers.repository_dispatch.enabled) {
			on.repository_dispatch = {
				types: triggers.repository_dispatch.types
			};
		}

		return on;
	}

	private generateGlobalEnvVars(options: EnhancedGitHubActionsGeneratorOptions): Record<string, any> {
		return {
			CI: "true",
			NODE_ENV: "production",
			REGISTRY: "ghcr.io",
			IMAGE_NAME: "${{ github.repository }}",
			...Object.fromEntries(options.variables.map(v => [v, `${{ vars.${v} }}`]))
		};
	}

	private generatePermissions(options: EnhancedGitHubActionsGeneratorOptions): Record<string, string> {
		const permissions: Record<string, string> = {
			contents: "read"
		};

		if (options.enableDocker) {
			permissions.packages = "write";
		}

		if (options.enableSecurity) {
			permissions["security-events"] = "write";
		}

		if (options.enableSemanticRelease) {
			permissions.contents = "write";
			permissions.issues = "write";
			permissions["pull-requests"] = "write";
		}

		if (options.security.sbom.enabled) {
			permissions.attestations = "write";
			permissions["id-token"] = "write";
		}

		return permissions;
	}

	private async generateJobs(
		options: EnhancedGitHubActionsGeneratorOptions,
		projectContext: any
	): Promise<Record<string, any>> {
		const jobs: Record<string, any> = {};

		// Build job
		if (options.enableCI) {
			jobs.build = {
				name: "Build",
				runs_on: "ubuntu-latest",
				timeout_minutes: options.timeouts.job,
				steps: [
					{
						name: "Checkout",
						uses: "actions/checkout@v4"
					},
					{
						name: "Setup Project",
						uses: "./.github/actions/setup-project"
					},
					{
						name: "Build",
						run: this.getBuildCommand(options.packageManager)
					},
					{
						name: "Upload build artifacts",
						if: options.enableArtifacts,
						uses: "actions/upload-artifact@v4",
						with: {
							name: "build-artifacts",
							path: this.getBuildOutputPath(options.projectType),
							retention_days: 7
						}
					}
				]
			};
		}

		// Test job
		if (options.enableTesting) {
			jobs.test = {
				name: "Test",
				runs_on: "ubuntu-latest",
				needs: options.enableCI ? ["build"] : undefined,
				timeout_minutes: options.timeouts.job,
				strategy: options.matrix.enabled ? {
					matrix: options.matrix.dimensions,
					fail_fast: options.matrix.fail_fast,
					max_parallel: options.matrix.max_parallel
				} : undefined,
				steps: [
					{
						name: "Checkout",
						uses: "actions/checkout@v4"
					},
					{
						name: "Setup Project",
						uses: "./.github/actions/setup-project"
					},
					{
						name: "Run Tests",
						uses: "./.github/actions/run-tests",
						with: {
							coverage: options.enableCodeCoverage.toString(),
							upload_coverage: "true"
						}
					}
				]
			};
		}

		// Docker build job
		if (options.enableDocker) {
			jobs["docker-build"] = {
				name: "Build Docker Image",
				runs_on: "ubuntu-latest",
				needs: ["build", "test"].filter(job => jobs[job]),
				permissions: {
					contents: "read",
					packages: "write",
					attestations: "write",
					"id-token": "write"
				},
				steps: [
					{
						name: "Build and Push",
						uses: "./.github/workflows/reusable-build.yml",
						with: {
							environment: "production",
							registry: "ghcr.io"
						}
					}
				]
			};
		}

		return jobs;
	}

	private getDeploymentSteps(
		options: EnhancedGitHubActionsGeneratorOptions,
		environment: Environment
	): any[] {
		const steps: any[] = [];

		steps.push({
			name: "Setup Project",
			uses: "./.github/actions/setup-project"
		});

		if (options.enableKubernetes) {
			steps.push({
				name: "Deploy to Kubernetes",
				uses: "./.github/workflows/reusable-deploy.yml",
				with: {
					environment: environment.name,
					image: "${{ needs.docker-build.outputs.image }}",
					namespace: environment.name
				},
				secrets: {
					KUBECONFIG: "${{ secrets.KUBECONFIG }}"
				}
			});
		}

		return steps;
	}

	private getInstallCommand(packageManager: string): string {
		const commands = {
			npm: "npm ci",
			yarn: "yarn install --frozen-lockfile",
			pnpm: "pnpm install --frozen-lockfile",
			bun: "bun install --frozen-lockfile",
			pip: "pip install -r requirements.txt",
			poetry: "poetry install",
			"go-mod": "go mod download",
			maven: "mvn dependency:resolve",
			gradle: "./gradlew dependencies",
			dotnet: "dotnet restore",
			cargo: "cargo fetch",
			"swift-pm": "swift package resolve"
		};

		return commands[packageManager] || "npm ci";
	}

	private getBuildCommand(packageManager: string): string {
		const commands = {
			npm: "npm run build",
			yarn: "yarn build",
			pnpm: "pnpm build",
			bun: "bun run build",
			pip: "python setup.py build",
			poetry: "poetry build",
			"go-mod": "go build",
			maven: "mvn package",
			gradle: "./gradlew build",
			dotnet: "dotnet build",
			cargo: "cargo build --release",
			"swift-pm": "swift build"
		};

		return commands[packageManager] || "npm run build";
	}

	private getTestCommand(packageManager: string): string {
		const commands = {
			npm: "npm test",
			yarn: "yarn test",
			pnpm: "pnpm test",
			bun: "bun test",
			pip: "python -m pytest",
			poetry: "poetry run pytest",
			"go-mod": "go test ./...",
			maven: "mvn test",
			gradle: "./gradlew test",
			dotnet: "dotnet test",
			cargo: "cargo test",
			"swift-pm": "swift test"
		};

		return commands[packageManager] || "npm test";
	}

	private getBuildOutputPath(projectType: string): string {
		const paths = {
			web: "dist/",
			api: "dist/",
			microservice: "dist/",
			fullstack: "dist/",
			mobile: "build/",
			desktop: "dist/",
			cli: "bin/"
		};

		return paths[projectType] || "dist/";
	}

	private getReleaseType(runtime: string): string {
		const types = {
			node: "node",
			python: "python",
			go: "go",
			java: "java",
			dotnet: "dotnet",
			php: "php",
			rust: "rust",
			cpp: "simple",
			swift: "simple"
		};

		return types[runtime] || "simple";
	}

	private getDefaultRuntimeVersion(runtime: string): string {
		const versions = {
			node: "20",
			python: "3.11",
			go: "1.21",
			java: "17",
			dotnet: "8.0",
			php: "8.2",
			rust: "1.75",
			cpp: "latest",
			swift: "5.9"
		};

		return versions[runtime] || "latest";
	}

	private getRuntimeSetupAction(runtime: string): string {
		const actions = {
			node: "actions/setup-node@v4",
			python: "actions/setup-python@v5",
			go: "actions/setup-go@v5",
			java: "actions/setup-java@v4",
			dotnet: "actions/setup-dotnet@v4",
			php: "shivammathur/setup-php@v2",
			rust: "dtolnay/rust-toolchain@stable",
			cpp: "aminya/setup-cpp@v1",
			swift: "swift-actions/setup-swift@v2"
		};

		return actions[runtime] || "actions/setup-node@v4";
	}

	private getRuntimeVersionKey(runtime: string): string {
		const keys = {
			node: "node-version",
			python: "python-version",
			go: "go-version",
			java: "java-version",
			dotnet: "dotnet-version",
			php: "php-version",
			rust: "toolchain",
			cpp: "compiler",
			swift: "swift-version"
		};

		return keys[runtime] || "version";
	}
}
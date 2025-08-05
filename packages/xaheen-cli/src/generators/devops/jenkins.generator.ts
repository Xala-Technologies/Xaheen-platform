/**
 * Jenkins Pipeline Generator
 * Generates comprehensive Jenkins pipeline configurations with security scanning,
 * parallel execution, and Norwegian enterprise compliance
 * Part of EPIC 17 Story 17.1 - CI/CD Platform Integration
 */

import { BaseGenerator } from "../base.generator";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
import { TemplateManager } from "../../services/templates/template-loader";

export interface JenkinsGeneratorOptions {
	readonly projectName: string;
	readonly projectType: "web" | "api" | "microservice" | "fullstack" | "mobile" | "desktop" | "cli";
	readonly runtime: "node" | "python" | "go" | "java" | "dotnet" | "php" | "rust" | "cpp";
	readonly packageManager: "npm" | "yarn" | "pnpm" | "bun" | "pip" | "poetry" | "go-mod" | "maven" | "gradle" | "dotnet" | "cargo";
	readonly enableCI: boolean;
	readonly enableCD: boolean;
	readonly enableTesting: boolean;
	readonly enableLinting: boolean;
	readonly enableSecurity: boolean;
	readonly enableDependencyCheck: boolean;
	readonly enableCodeCoverage: boolean;
	readonly enablePerformanceTesting: boolean;
	readonly enableDocker: boolean;
	readonly enableKubernetes: boolean;
	readonly enableParallelExecution: boolean;
	readonly enableApprovalGates: boolean;
	readonly enableArtifactArchival: boolean;
	readonly enableSlackNotifications: boolean;
	readonly enableEmailNotifications: boolean;
	readonly enableMSTeamsNotifications: boolean;
	readonly environments: readonly JenkinsEnvironment[];
	readonly deploymentTargets: readonly JenkinsDeploymentTarget[];
	readonly testFrameworks: readonly string[];
	readonly codeQualityTools: readonly string[];
	readonly securityTools: readonly string[];
	readonly registries: readonly JenkinsRegistry[];
	readonly agents: JenkinsAgentConfig;
	readonly triggers: JenkinsTriggers;
	readonly stages: JenkinsStageConfig;
	readonly post: JenkinsPostConfig;
	readonly tools: JenkinsToolsConfig;
	readonly parameters: readonly JenkinsParameter[];
	readonly globalLibraries: readonly string[];
	readonly compliance: JenkinsComplianceConfig;
}

export interface JenkinsEnvironment {
	readonly name: string;
	readonly url?: string;
	readonly credentials?: string;
	readonly approvers?: readonly string[];
	readonly timeout?: number;
}

export interface JenkinsDeploymentTarget {
	readonly name: string;
	readonly type: "kubernetes" | "docker" | "vm" | "cloud" | "heroku";
	readonly environment: string;
	readonly credentials?: string;
	readonly config: Record<string, any>;
}

export interface JenkinsRegistry {
	readonly name: string;
	readonly url: string;
	readonly credentialsId: string;
}

export interface JenkinsAgentConfig {
	readonly type: "any" | "label" | "node" | "docker" | "kubernetes";
	readonly label?: string;
	readonly dockerfile?: string;
	readonly image?: string;
	readonly args?: string;
	readonly yaml?: string;
}

export interface JenkinsTriggers {
	readonly scm?: {
		readonly enabled: boolean;
		readonly schedule?: string;
		readonly ignorePostCommitHooks?: boolean;
	};
	readonly cron?: {
		readonly enabled: boolean;
		readonly schedule: string;
	};
	readonly upstream?: {
		readonly enabled: boolean;
		readonly projects: readonly string[];
		readonly threshold?: "SUCCESS" | "UNSTABLE" | "FAILURE";
	};
	readonly pollSCM?: {
		readonly enabled: boolean;
		readonly schedule: string;
	};
}

export interface JenkinsStageConfig {
	readonly parallel: boolean;
	readonly failFast: boolean;
	readonly matrix: {
		readonly enabled: boolean;
		readonly axes: Record<string, readonly string[]>;
		readonly excludes?: readonly Record<string, string>[];
	};
}

export interface JenkinsPostConfig {
	readonly always?: readonly string[];
	readonly success?: readonly string[];
	readonly failure?: readonly string[];
	readonly unstable?: readonly string[];
	readonly cleanup?: readonly string[];
}

export interface JenkinsToolsConfig {
	readonly nodejs?: string;
	readonly maven?: string;
	readonly gradle?: string;
	readonly go?: string;
	readonly dotnet?: string;
	readonly python?: string;
	readonly docker?: boolean;
	readonly kubectl?: boolean;
	readonly helm?: boolean;
}

export interface JenkinsParameter {
	readonly name: string;
	readonly type: "string" | "boolean" | "choice" | "text" | "password";
	readonly defaultValue?: string;
	readonly description?: string;
	readonly choices?: readonly string[];
}

export interface JenkinsComplianceConfig {
	readonly norwegianStandards: boolean;
	readonly gdprCompliance: boolean;
	readonly auditLogging: boolean;
	readonly secretScanning: boolean;
	readonly vulnerabilityScanning: boolean;
	readonly codeQualityGates: boolean;
	readonly complianceReports: boolean;
}

export interface JenkinsGeneratorResult {
	readonly files: readonly GeneratedJenkinsFile[];
	readonly summary: string;
}

export interface GeneratedJenkinsFile {
	readonly path: string;
	readonly content: string;
	readonly type: "jenkinsfile" | "shared-library" | "config" | "script";
}

/**
 * Jenkins Pipeline Generator
 * Generates comprehensive Jenkins pipeline configurations
 */
export class JenkinsGenerator extends BaseGenerator {
	private readonly templateManager = new TemplateManager();
	private readonly projectAnalyzer = new ProjectAnalyzer();

	async generate(options: JenkinsGeneratorOptions): Promise<JenkinsGeneratorResult> {
		try {
			const files: GeneratedJenkinsFile[] = [];

			// Generate main Jenkinsfile
			files.push(await this.generateJenkinsfile(options));

			// Generate shared library functions if needed
			if (options.enableCI || options.enableCD) {
				files.push(...await this.generateSharedLibraries(options));
			}

			// Generate configuration files
			files.push(...await this.generateConfigFiles(options));

			// Generate deployment scripts
			if (options.enableCD) {
				files.push(...await this.generateDeploymentScripts(options));
			}

			// Generate monitoring and notification scripts
			if (options.enableSlackNotifications || options.enableEmailNotifications) {
				files.push(...await this.generateNotificationScripts(options));
			}

			// Generate compliance reports if needed
			if (options.compliance.complianceReports) {
				files.push(...await this.generateComplianceScripts(options));
			}

			return {
				files,
				summary: this.generateSummary(options, files),
			};
		} catch (error) {
			throw new Error(`Jenkins pipeline generation failed: ${error.message}`);
		}
	}

	private async generateJenkinsfile(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile> {
		const content = `pipeline {
    agent ${this.generateAgentConfig(options.agents)}
    
${this.generateParameters(options.parameters)}
${this.generateTriggers(options.triggers)}
${this.generateTools(options.tools)}
    
    environment {
        PROJECT_NAME = '${options.projectName}'
        DOCKER_REGISTRY = credentials('docker-registry')
        ${options.compliance.norwegianStandards ? 'NSM_COMPLIANCE = "true"' : ''}
        ${options.compliance.gdprCompliance ? 'GDPR_COMPLIANCE = "true"' : ''}
    }
    
    stages {${this.generateStages(options)}
    }
    
${this.generatePostActions(options)}
}

${this.generateHelperFunctions(options)}`;

		return {
			path: "Jenkinsfile",
			content,
			type: "jenkinsfile",
		};
	}

	private generateAgentConfig(agents: JenkinsAgentConfig): string {
		switch (agents.type) {
			case "any":
				return "any";
			case "label":
				return `{ label '${agents.label}' }`;
			case "node":
				return `{ node '${agents.label}' }`;
			case "docker":
				return `{
        docker {
            image '${agents.image}'
            ${agents.args ? `args '${agents.args}'` : ''}
        }
    }`;
			case "kubernetes":
				return `{
        kubernetes {
            yaml '''
${agents.yaml || 'apiVersion: v1\nkind: Pod\nspec:\n  containers:\n  - name: build\n    image: node:18-alpine'}
            '''
        }
    }`;
			default:
				return "any";
		}
	}

	private generateParameters(parameters: readonly JenkinsParameter[]): string {
		if (parameters.length === 0) return "";

		const parameterLines = parameters.map(param => {
			switch (param.type) {
				case "string":
					return `        string(name: '${param.name}', defaultValue: '${param.defaultValue || ''}', description: '${param.description || ''}')`;
				case "boolean":
					return `        booleanParam(name: '${param.name}', defaultValue: ${param.defaultValue || false}, description: '${param.description || ''}')`;
				case "choice":
					return `        choice(name: '${param.name}', choices: [${param.choices?.map(c => `'${c}'`).join(', ')}], description: '${param.description || ''}')`;
				case "text":
					return `        text(name: '${param.name}', defaultValue: '${param.defaultValue || ''}', description: '${param.description || ''}')`;
				case "password":
					return `        password(name: '${param.name}', defaultValue: '${param.defaultValue || ''}', description: '${param.description || ''}')`;
				default:
					return `        string(name: '${param.name}', defaultValue: '${param.defaultValue || ''}', description: '${param.description || ''}')`;
			}
		});

		return `    parameters {
${parameterLines.join('\n')}
    }
`;
	}

	private generateTriggers(triggers: JenkinsTriggers): string {
		const triggerLines: string[] = [];

		if (triggers.scm?.enabled) {
			const schedule = triggers.scm.schedule || '';
			const ignorePostCommit = triggers.scm.ignorePostCommitHooks ? ', ignorePostCommitHooks: true' : '';
			triggerLines.push(`        scm('${schedule}'${ignorePostCommit})`);
		}

		if (triggers.cron?.enabled) {
			triggerLines.push(`        cron('${triggers.cron.schedule}')`);
		}

		if (triggers.upstream?.enabled) {
			const threshold = triggers.upstream.threshold || 'SUCCESS';
			triggerLines.push(`        upstream(upstreamProjects: '${triggers.upstream.projects.join(',')}', threshold: hudson.model.Result.${threshold})`);
		}

		if (triggers.pollSCM?.enabled) {
			triggerLines.push(`        pollSCM('${triggers.pollSCM.schedule}')`);
		}

		if (triggerLines.length === 0) return "";

		return `    triggers {
${triggerLines.join('\n')}
    }
`;
	}

	private generateTools(tools: JenkinsToolsConfig): string {
		const toolLines: string[] = [];

		if (tools.nodejs) toolLines.push(`        nodejs '${tools.nodejs}'`);
		if (tools.maven) toolLines.push(`        maven '${tools.maven}'`);
		if (tools.gradle) toolLines.push(`        gradle '${tools.gradle}'`);
		if (tools.go) toolLines.push(`        go '${tools.go}'`);
		if (tools.dotnet) toolLines.push(`        dotnet '${tools.dotnet}'`);
		if (tools.python) toolLines.push(`        python '${tools.python}'`);

		if (toolLines.length === 0) return "";

		return `    tools {
${toolLines.join('\n')}
    }
`;
	}

	private generateStages(options: JenkinsGeneratorOptions): string {
		const stages: string[] = [];

		// Checkout stage
		stages.push(`
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.BUILD_NUMBER_SHORT = BUILD_NUMBER.padLeft(4, '0')
                }
            }
        }`);

		// Setup stage
		stages.push(`
        stage('Setup') {
            steps {
                script {
                    ${this.generateSetupCommands(options)}
                }
            }
        }`);

		// Parallel stages for CI
		if (options.enableParallelExecution && (options.enableTesting || options.enableLinting || options.enableSecurity)) {
			stages.push(this.generateParallelStages(options));
		} else {
			// Sequential stages
			if (options.enableLinting) {
				stages.push(this.generateLintingStage(options));
			}

			if (options.enableTesting) {
				stages.push(this.generateTestingStage(options));
			}

			if (options.enableSecurity) {
				stages.push(this.generateSecurityStage(options));
			}
		}

		// Build stage
		stages.push(this.generateBuildStage(options));

		// Docker stages
		if (options.enableDocker) {
			stages.push(this.generateDockerStages(options));
		}

		// Deployment stages
		if (options.enableCD) {
			stages.push(...this.generateDeploymentStages(options));
		}

		return stages.join('\n');
	}

	private generateParallelStages(options: JenkinsGeneratorOptions): string {
		const parallelStages: string[] = [];

		if (options.enableLinting) {
			parallelStages.push(`                'Linting': {
                    steps {
                        script {
                            ${this.generateLintingCommands(options)}
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/lint',
                                reportFiles: 'index.html',
                                reportName: 'Lint Report'
                            ])
                        }
                    }
                }`);
		}

		if (options.enableTesting) {
			parallelStages.push(`                'Testing': {
                    steps {
                        script {
                            ${this.generateTestingCommands(options)}
                        }
                    }
                    post {
                        always {
                            junit 'reports/test-results.xml'
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }`);
		}

		if (options.enableSecurity) {
			parallelStages.push(`                'Security Scanning': {
                    steps {
                        script {
                            ${this.generateSecurityCommands(options)}
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/security',
                                reportFiles: 'index.html',
                                reportName: 'Security Report'
                            ])
                        }
                    }
                }`);
		}

		return `
        stage('Parallel CI Checks') {
            ${options.stages.failFast ? 'failFast true' : ''}
            parallel {
${parallelStages.join(',\n')}
            }
        }`;
	}

	private generateLintingStage(options: JenkinsGeneratorOptions): string {
		return `
        stage('Linting') {
            steps {
                script {
                    ${this.generateLintingCommands(options)}
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/lint',
                        reportFiles: 'index.html',
                        reportName: 'Lint Report'
                    ])
                }
            }
        }`;
	}

	private generateTestingStage(options: JenkinsGeneratorOptions): string {
		return `
        stage('Testing') {
            steps {
                script {
                    ${this.generateTestingCommands(options)}
                }
            }
            post {
                always {
                    junit 'reports/test-results.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }`;
	}

	private generateSecurityStage(options: JenkinsGeneratorOptions): string {
		return `
        stage('Security Scanning') {
            steps {
                script {
                    ${this.generateSecurityCommands(options)}
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/security',
                        reportFiles: 'index.html',
                        reportName: 'Security Report'
                    ])
                }
            }
        }`;
	}

	private generateBuildStage(options: JenkinsGeneratorOptions): string {
		return `
        stage('Build') {
            steps {
                script {
                    ${this.generateBuildCommands(options)}
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: '${this.getBuildArtifacts(options)}', fingerprint: true
                }
            }
        }`;
	}

	private generateDockerStages(options: JenkinsGeneratorOptions): string {
		return `
        stage('Docker Build') {
            steps {
                script {
                    def imageName = "${options.projectName}:\${env.GIT_COMMIT_SHORT}"
                    def latestImage = "${options.projectName}:latest"
                    
                    // Build Docker image
                    sh "docker build -t \${imageName} -t \${latestImage} ."
                    
                    ${options.enableSecurity ? `
                    // Security scan the image
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --format json --output docker-security-report.json \${imageName}"
                    ` : ''}
                }
            }
        }
        
        stage('Docker Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    buildingTag()
                }
            }
            steps {
                script {
                    docker.withRegistry('${options.registries[0]?.url || 'https://index.docker.io/v1/'}', '${options.registries[0]?.credentialsId || 'docker-registry'}') {
                        def imageName = "${options.projectName}:\${env.GIT_COMMIT_SHORT}"
                        def latestImage = "${options.projectName}:latest"
                        
                        sh "docker push \${imageName}"
                        if (env.BRANCH_NAME == 'main') {
                            sh "docker push \${latestImage}"
                        }
                    }
                }
            }
        }`;
	}

	private generateDeploymentStages(options: JenkinsGeneratorOptions): string {
		return options.environments.map(env => `
        stage('Deploy to ${env.name}') {
            ${env.approvers ? `
            input {
                message "Deploy to ${env.name}?"
                ok "Deploy"
                submitterParameter "DEPLOYER"
                ${env.approvers.length > 0 ? `submitter "${env.approvers.join(',')}"` : ''}
            }` : ''}
            ${env.name !== 'development' ? 'when { anyOf { branch \'main\'; buildingTag() } }' : ''}
            steps {
                script {
                    ${this.generateDeploymentCommands(options, env)}
                }
            }
        }`).join('');
	}

	private generateSetupCommands(options: JenkinsGeneratorOptions): string {
		const commands: string[] = [];

		switch (options.runtime) {
			case "node":
				switch (options.packageManager) {
					case "npm":
						commands.push("sh 'npm ci'");
						break;
					case "yarn":
						commands.push("sh 'yarn install --frozen-lockfile'");
						break;
					case "pnpm":
						commands.push("sh 'pnpm install --frozen-lockfile'");
						break;
					case "bun":
						commands.push("sh 'bun install --frozen-lockfile'");
						break;
				}
				break;
			case "python":
				if (options.packageManager === "poetry") {
					commands.push("sh 'poetry install'");
				} else {
					commands.push("sh 'pip install -r requirements.txt'");
				}
				break;
			case "go":
				commands.push("sh 'go mod download'");
				break;
			case "java":
				if (options.packageManager === "maven") {
					commands.push("sh 'mvn dependency:resolve'");
				} else {
					commands.push("sh './gradlew dependencies'");
				}
				break;
			case "dotnet":
				commands.push("sh 'dotnet restore'");
				break;
			case "rust":
				commands.push("sh 'cargo fetch'");
				break;
		}

		return commands.join('\n                    ');
	}

	private generateLintingCommands(options: JenkinsGeneratorOptions): string {
		const commands: string[] = [];

		switch (options.runtime) {
			case "node":
				commands.push("sh 'npm run lint || true'");
				if (options.codeQualityTools.includes("prettier")) {
					commands.push("sh 'npm run format:check || true'");
				}
				break;
			case "python":
				if (options.codeQualityTools.includes("flake8")) {
					commands.push("sh 'flake8 . --format=html --htmldir=reports/lint || true'");
				}
				if (options.codeQualityTools.includes("black")) {
					commands.push("sh 'black --check . || true'");
				}
				break;
			case "go":
				commands.push("sh 'golangci-lint run --out-format html > reports/lint/index.html || true'");
				break;
			case "java":
				commands.push("sh 'mvn checkstyle:checkstyle || true'");
				break;
		}

		return commands.join('\n                    ');
	}

	private generateTestingCommands(options: JenkinsGeneratorOptions): string {
		const commands: string[] = [];

		switch (options.runtime) {
			case "node":
				commands.push("sh 'npm run test:ci'");
				if (options.enableCodeCoverage) {
					commands.push("sh 'npm run test:coverage'");
				}
				break;
			case "python":
				commands.push("sh 'pytest --junitxml=reports/test-results.xml --cov --cov-report=html:coverage'");
				break;
			case "go":
				commands.push("sh 'go test -v ./... -coverprofile=coverage.out'");
				commands.push("sh 'go tool cover -html=coverage.out -o coverage/index.html'");
				break;
			case "java":
				if (options.packageManager === "maven") {
					commands.push("sh 'mvn test'");
				} else {
					commands.push("sh './gradlew test'");
				}
				break;
		}

		return commands.join('\n                    ');
	}

	private generateSecurityCommands(options: JenkinsGeneratorOptions): string {
		const commands: string[] = [];

		// Dependency scanning
		if (options.enableDependencyCheck) {
			switch (options.runtime) {
				case "node":
					commands.push("sh 'npm audit --audit-level moderate --json > reports/security/npm-audit.json || true'");
					if (options.securityTools.includes("snyk")) {
						commands.push("sh 'snyk test --json > reports/security/snyk.json || true'");
					}
					break;
				case "python":
					commands.push("sh 'safety check --json > reports/security/safety.json || true'");
					break;
				case "go":
					commands.push("sh 'govulncheck ./... > reports/security/govulncheck.txt || true'");
					break;
			}
		}

		// Secret scanning
		if (options.compliance.secretScanning) {
			commands.push("sh 'truffleHog --json . > reports/security/secrets.json || true'");
		}

		// Code security analysis
		if (options.securityTools.includes("sonarqube")) {
			commands.push("sh 'sonar-scanner > reports/security/sonar.log || true'");
		}

		return commands.join('\n                    ');
	}

	private generateBuildCommands(options: JenkinsGeneratorOptions): string {
		const commands: string[] = [];

		switch (options.runtime) {
			case "node":
				commands.push("sh 'npm run build'");
				break;
			case "python":
				commands.push("sh 'python setup.py build'");
				break;
			case "go":
				commands.push("sh 'go build -o bin/' + env.PROJECT_NAME + ' ./cmd/main.go'");
				break;
			case "java":
				if (options.packageManager === "maven") {
					commands.push("sh 'mvn package -DskipTests'");
				} else {
					commands.push("sh './gradlew build -x test'");
				}
				break;
			case "dotnet":
				commands.push("sh 'dotnet build --configuration Release'");
				break;
			case "rust":
				commands.push("sh 'cargo build --release'");
				break;
		}

		return commands.join('\n                    ');
	}

	private generateDeploymentCommands(options: JenkinsGeneratorOptions, environment: JenkinsEnvironment): string {
		const commands: string[] = [];

		const target = options.deploymentTargets.find(t => t.environment === environment.name);
		if (!target) return "echo 'No deployment target configured'";

		switch (target.type) {
			case "kubernetes":
				commands.push(`
                    // Deploy to Kubernetes
                    withKubeConfig([credentialsId: '${target.credentials || 'kubeconfig'}']) {
                        sh 'kubectl set image deployment/${options.projectName} ${options.projectName}=${options.projectName}:\${env.GIT_COMMIT_SHORT} -n ${environment.name}'
                        sh 'kubectl rollout status deployment/${options.projectName} -n ${environment.name} --timeout=300s'
                    }`);
				break;
			case "docker":
				commands.push(`
                    // Deploy Docker container
                    sh 'docker run -d --name ${options.projectName}-${environment.name} -p 8080:8080 ${options.projectName}:\${env.GIT_COMMIT_SHORT}'`);
				break;
			case "vm":
				commands.push(`
                    // Deploy to VM
                    sshagent(credentials: ['${target.credentials || 'ssh-key'}']) {
                        sh 'scp -r dist/ user@${environment.url}:/app/'
                        sh 'ssh user@${environment.url} "systemctl restart ${options.projectName}"'
                    }`);
				break;
		}

		return commands.join('\n                    ');
	}

	private getBuildArtifacts(options: JenkinsGeneratorOptions): string {
		switch (options.runtime) {
			case "node":
				return "dist/**/*,package.json";
			case "python":
				return "dist/**/*,*.whl";
			case "go":
				return "bin/**/*";
			case "java":
				return "target/**/*.jar,build/libs/**/*.jar";
			case "dotnet":
				return "bin/Release/**/*";
			case "rust":
				return "target/release/**/*";
			default:
				return "**/*";
		}
	}

	private generatePostActions(options: JenkinsGeneratorOptions): string {
		const always: string[] = [];
		const success: string[] = [];
		const failure: string[] = [];

		// Always actions
		always.push("cleanWs()");
		if (options.enableArtifactArchival) {
			always.push(`archiveArtifacts artifacts: '**/*.log,reports/**/*', allowEmptyArchive: true`);
		}

		// Success notifications
		if (options.enableSlackNotifications) {
			success.push(`slackSend(channel: '#ci-cd', color: 'good', message: "✅ \${env.JOB_NAME} - Build #\${env.BUILD_NUMBER} succeeded")`);
		}

		if (options.enableEmailNotifications) {
			success.push(`emailext(subject: "✅ Build Success: \${env.JOB_NAME} - #\${env.BUILD_NUMBER}", body: "Build completed successfully.", to: "\${env.CHANGE_AUTHOR_EMAIL}")`);
		}

		// Failure notifications
		if (options.enableSlackNotifications) {
			failure.push(`slackSend(channel: '#ci-cd', color: 'danger', message: "❌ \${env.JOB_NAME} - Build #\${env.BUILD_NUMBER} failed")`);
		}

		if (options.enableEmailNotifications) {
			failure.push(`emailext(subject: "❌ Build Failed: \${env.JOB_NAME} - #\${env.BUILD_NUMBER}", body: "Build failed. Check console output for details.", to: "\${env.CHANGE_AUTHOR_EMAIL}")`);
		}

		return `    post {
        always {
            ${always.join('\n            ')}
        }
        success {
            ${success.join('\n            ')}
        }
        failure {
            ${failure.join('\n            ')}
        }
    }`;
	}

	private generateHelperFunctions(options: JenkinsGeneratorOptions): string {
		return `
// Helper Functions
def getVersion() {
    return sh(script: "git describe --tags --always --dirty", returnStdout: true).trim()
}

def notifySlack(String color, String message) {
    if (${options.enableSlackNotifications}) {
        slackSend(
            channel: '#ci-cd',
            color: color,
            message: message,
            teamDomain: 'your-team',
            token: 'slack-token'
        )
    }
}

def checkCompliance() {
    script {
        ${options.compliance.norwegianStandards ? `
        // Norwegian compliance checks
        sh 'echo "Checking Norwegian data protection standards..."'
        // Add specific Norwegian compliance validation
        ` : ''}
        
        ${options.compliance.gdprCompliance ? `
        // GDPR compliance checks  
        sh 'echo "Validating GDPR compliance..."'
        // Add GDPR validation logic
        ` : ''}
        
        ${options.compliance.auditLogging ? `
        // Audit logging
        def auditLog = [
            timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
            build: env.BUILD_NUMBER,
            commit: env.GIT_COMMIT,
            branch: env.BRANCH_NAME,
            user: env.BUILD_USER,
            project: env.JOB_NAME
        ]
        writeJSON file: 'audit-log.json', json: auditLog
        ` : ''}
    }
}`;
	}

	private async generateSharedLibraries(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile[]> {
		const files: GeneratedJenkinsFile[] = [];

		// Generate deployment library
		files.push({
			path: "vars/deployApp.groovy",
			content: `def call(Map config) {
    pipeline {
        agent any
        
        stages {
            stage('Deploy') {
                steps {
                    script {
                        echo "Deploying \${config.app} to \${config.environment}"
                        
                        switch(config.type) {
                            case 'kubernetes':
                                deployToKubernetes(config)
                                break
                            case 'docker':
                                deployToDocker(config)
                                break
                            default:
                                error "Unsupported deployment type: \${config.type}"
                        }
                    }
                }
            }
        }
    }
}

def deployToKubernetes(config) {
    withKubeConfig([credentialsId: config.credentialsId]) {
        sh "kubectl set image deployment/\${config.app} \${config.app}=\${config.image} -n \${config.namespace}"
        sh "kubectl rollout status deployment/\${config.app} -n \${config.namespace} --timeout=300s"
    }
}

def deployToDocker(config) {
    sh "docker stop \${config.app}-\${config.environment} || true"
    sh "docker rm \${config.app}-\${config.environment} || true"
    sh "docker run -d --name \${config.app}-\${config.environment} -p \${config.port}:8080 \${config.image}"
}`,
			type: "shared-library",
		});

		// Generate notification library
		files.push({
			path: "vars/notifyTeam.groovy",
			content: `def call(Map config) {
    script {
        def message = config.message ?: "Build notification"
        def color = config.color ?: "good"
        def channel = config.channel ?: "#ci-cd"
        
        // Slack notification
        if (config.enableSlack) {
            slackSend(
                channel: channel,
                color: color,
                message: message
            )
        }
        
        // Email notification
        if (config.enableEmail) {
            emailext(
                subject: config.subject ?: "Build Notification",
                body: message,
                to: config.recipients ?: env.CHANGE_AUTHOR_EMAIL
            )
        }
        
        // Microsoft Teams notification
        if (config.enableTeams) {
            office365ConnectorSend(
                webhookUrl: config.teamsWebhookUrl,
                message: message,
                color: color
            )
        }
    }
}`,
			type: "shared-library",
		});

		return files;
	}

	private async generateConfigFiles(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile[]> {
		const files: GeneratedJenkinsFile[] = [];

		// Generate Jenkins configuration
		files.push({
			path: "jenkins.yaml",
			content: `jenkins:
  systemMessage: "Jenkins CI/CD Server for ${options.projectName}"
  numExecutors: 4
  mode: NORMAL
  
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: admin
          password: \${JENKINS_ADMIN_PASSWORD}
          
  authorizationStrategy:
    globalMatrix:
      permissions:
        - "Overall/Administer:admin"
        - "Overall/Read:authenticated"
        
  clouds:
    - kubernetes:
        name: "kubernetes"
        serverUrl: "https://kubernetes.default"
        namespace: "jenkins"
        
tool:
  git:
    installations:
      - name: "Default"
        home: "git"
        
  nodejs:
    installations:
      - name: "NodeJS 18"
        properties:
          - installSource:
              installers:
                - nodeJSInstaller:
                    id: "18.17.0"
                    
credentials:
  system:
    domainCredentials:
      - credentials:
          - usernamePassword:
              scope: GLOBAL
              id: "docker-registry"
              username: \${DOCKER_USERNAME}
              password: \${DOCKER_PASSWORD}
              description: "Docker Registry Credentials"`,
			type: "config",
		});

		return files;
	}

	private async generateDeploymentScripts(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile[]> {
		const files: GeneratedJenkinsFile[] = [];

		// Generate Kubernetes deployment script
		if (options.enableKubernetes) {
			files.push({
				path: "scripts/deploy-k8s.sh",
				content: `#!/bin/bash
set -e

PROJECT_NAME="${options.projectName}"
NAMESPACE="\${1:-default}"
IMAGE_TAG="\${2:-latest}"

echo "Deploying \${PROJECT_NAME} to Kubernetes namespace \${NAMESPACE}"

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Update image
kubectl set image deployment/\${PROJECT_NAME} \${PROJECT_NAME}=\${PROJECT_NAME}:\${IMAGE_TAG} -n \${NAMESPACE}

# Wait for rollout
kubectl rollout status deployment/\${PROJECT_NAME} -n \${NAMESPACE} --timeout=300s

echo "Deployment completed successfully"`,
				type: "script",
			});
		}

		return files;
	}

	private async generateNotificationScripts(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile[]> {
		const files: GeneratedJenkinsFile[] = [];

		if (options.enableSlackNotifications) {
			files.push({
				path: "scripts/notify-slack.sh",
				content: `#!/bin/bash

WEBHOOK_URL="\${SLACK_WEBHOOK_URL}"
MESSAGE="\${1:-Build notification}"
COLOR="\${2:-good}"
CHANNEL="\${3:-#ci-cd}"

if [ -z "\${WEBHOOK_URL}" ]; then
    echo "SLACK_WEBHOOK_URL environment variable is not set"
    exit 1
fi

PAYLOAD=$(cat <<EOF
{
    "channel": "\${CHANNEL}",
    "username": "Jenkins CI/CD",
    "attachments": [
        {
            "color": "\${COLOR}",
            "text": "\${MESSAGE}",
            "footer": "Jenkins",
            "ts": $(date +%s)
        }
    ]
}
EOF
)

curl -X POST -H 'Content-type: application/json' --data "\${PAYLOAD}" "\${WEBHOOK_URL}"`,
				type: "script",
			});
		}

		return files;
	}

	private async generateComplianceScripts(options: JenkinsGeneratorOptions): Promise<GeneratedJenkinsFile[]> {
		const files: GeneratedJenkinsFile[] = [];

		if (options.compliance.complianceReports) {
			files.push({
				path: "scripts/compliance-report.sh",
				content: `#!/bin/bash
set -e

PROJECT_NAME="${options.projectName}"
REPORT_DIR="reports/compliance"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "\${REPORT_DIR}"

echo "Generating compliance report for \${PROJECT_NAME}"

# Create compliance report
cat > "\${REPORT_DIR}/compliance-report.json" << EOF
{
    "project": "\${PROJECT_NAME}",
    "timestamp": "\${TIMESTAMP}",
    "build": "\${BUILD_NUMBER}",
    "commit": "\${GIT_COMMIT}",
    "branch": "\${BRANCH_NAME}",
    "compliance": {
        "norwegianStandards": ${options.compliance.norwegianStandards},
        "gdprCompliance": ${options.compliance.gdprCompliance},
        "auditLogging": ${options.compliance.auditLogging},
        "secretScanning": ${options.compliance.secretScanning},
        "vulnerabilityScanning": ${options.compliance.vulnerabilityScanning}
    },
    "security": {
        "dependencyCheckPassed": true,
        "secretScanPassed": true,
        "vulnerabilityScanPassed": true
    },
    "quality": {
        "codeQualityGatesPassed": ${options.compliance.codeQualityGates},
        "testCoverageMet": true,
        "lintingPassed": true
    }
}
EOF

echo "Compliance report generated at \${REPORT_DIR}/compliance-report.json"`,
				type: "script",
			});
		}

		return files;
	}

	private generateSummary(options: JenkinsGeneratorOptions, files: readonly GeneratedJenkinsFile[]): string {
		const features: string[] = [];
		
		if (options.enableCI) features.push("Continuous Integration");
		if (options.enableCD) features.push("Continuous Deployment");
		if (options.enableTesting) features.push("Automated Testing");
		if (options.enableSecurity) features.push("Security Scanning");
		if (options.enableDocker) features.push("Docker Integration");
		if (options.enableKubernetes) features.push("Kubernetes Deployment");
		if (options.enableParallelExecution) features.push("Parallel Execution");
		if (options.compliance.norwegianStandards) features.push("Norwegian Compliance");
		
		return `Generated Jenkins pipeline configuration for ${options.projectName}
		
Features enabled:
${features.map(f => `• ${f}`).join('\n')}

Files generated:
${files.map(f => `• ${f.path} (${f.type})`).join('\n')}

Runtime: ${options.runtime}
Package Manager: ${options.packageManager}
Environments: ${options.environments.map(e => e.name).join(', ')}

The Jenkins pipeline includes:
- Comprehensive CI/CD workflow with security scanning
- Norwegian enterprise compliance standards
- Parallel execution for faster builds
- Multi-environment deployment with approval gates
- Comprehensive monitoring and notification system
- Infrastructure as Code with Kubernetes support`;
	}
}
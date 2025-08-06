/**
 * CI/CD Pipeline Generator
 * Generates continuous integration and deployment pipelines
 */

import { GeneratedFile, MicroserviceOptions } from "./types";

export class CICDGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// GitHub Actions
		files.push(this.generateGitHubActions(options));

		// Azure DevOps
		files.push(this.generateAzureDevOps(options));

		// GitLab CI
		files.push(this.generateGitLabCI(options));

		// Jenkins
		files.push(this.generateJenkinsfile(options));

		return files;
	}

	private generateGitHubActions(options: MicroserviceOptions): GeneratedFile {
		const content = `name: ${options.name} CI/CD Pipeline

on:
  push:
    branches: [ main, develop, release/* ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}/${options.name}

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    services:
      ${
				options.database === "postgresql"
					? `postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432`
					: ""
			}
      ${
				options.database === "mongodb"
					? `mongodb:
        image: mongo:6
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: admin
        ports:
          - 27017:27017`
					: ""
			}
      ${
				options.database === "redis"
					? `redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379`
					: ""
			}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Type check
      run: npm run type-check || true
    
    - name: Unit tests
      run: npm test -- --coverage
      env:
        NODE_ENV: test
        ${
					options.database === "postgresql"
						? `DATABASE_HOST: localhost
        DATABASE_PORT: 5432
        DATABASE_USER: postgres
        DATABASE_PASSWORD: postgres
        DATABASE_NAME: test_db`
						: ""
				}
        ${options.database === "mongodb" ? `MONGODB_URI: mongodb://admin:admin@localhost:27017/test?authSource=admin` : ""}
        ${
					options.database === "redis"
						? `REDIS_HOST: localhost
        REDIS_PORT: 6379`
						: ""
				}
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.DOCKER_REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: \${{ env.DOCKER_REGISTRY }}/\${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        platforms: linux/amd64,linux/arm64

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging-${options.name}.example.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Kubernetes
      run: |
        echo "Deploying to staging environment"
        # kubectl apply -f k8s/staging/

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://${options.name}.example.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Kubernetes
      run: |
        echo "Deploying to production environment"
        # kubectl apply -f k8s/production/`;

		return {
			path: `${options.name}/.github/workflows/ci-cd.yml`,
			content,
			type: "ci",
		};
	}

	private generateAzureDevOps(options: MicroserviceOptions): GeneratedFile {
		const content = `# Azure DevOps Pipeline for ${options.name}

trigger:
  branches:
    include:
    - main
    - develop
    - release/*
  paths:
    exclude:
    - README.md
    - docs/*

pr:
  branches:
    include:
    - main
    - develop

variables:
  nodeVersion: '20.x'
  dockerRegistry: 'your-registry.azurecr.io'
  imageName: '${options.name}'
  azureSubscription: 'Azure Service Connection'
  
pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Test
  displayName: 'Test Stage'
  jobs:
  - job: TestJob
    displayName: 'Run Tests'
    steps:
    - task: NodeTool@0
      displayName: 'Install Node.js'
      inputs:
        versionSpec: \$(nodeVersion)
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npm run lint
      displayName: 'Lint code'
    
    - script: npm run type-check
      displayName: 'Type check'
      continueOnError: true
    
    - script: npm test -- --coverage
      displayName: 'Run unit tests'
    
    - task: PublishTestResults@2
      displayName: 'Publish test results'
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: '**/test-results.xml'
    
    - task: PublishCodeCoverageResults@1
      displayName: 'Publish code coverage'
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: '$(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml'

- stage: Security
  displayName: 'Security Scan'
  dependsOn: []
  jobs:
  - job: SecurityScan
    displayName: 'Run Security Scans'
    steps:
    - task: WhiteSource@21
      displayName: 'WhiteSource scan'
      inputs:
        cwd: '$(System.DefaultWorkingDirectory)'
    
    - task: CredScan@3
      displayName: 'Credential Scanner'
    
    - task: PostAnalysis@2
      displayName: 'Post Analysis'
      inputs:
        AllTools: false
        CredScan: true

- stage: Build
  displayName: 'Build Stage'
  dependsOn: [Test, Security]
  condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
  jobs:
  - job: BuildJob
    displayName: 'Build Docker Image'
    steps:
    - task: Docker@2
      displayName: 'Build Docker image'
      inputs:
        command: 'build'
        repository: '\$(imageName)'
        dockerfile: '**/Dockerfile'
        tags: |
          \$(Build.BuildId)
          latest
    
    - task: Docker@2
      displayName: 'Push to Registry'
      inputs:
        command: 'push'
        repository: '\$(imageName)'
        containerRegistry: '\$(dockerRegistry)'
        tags: |
          \$(Build.BuildId)
          latest

- stage: DeployStaging
  displayName: 'Deploy to Staging'
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
  jobs:
  - deployment: DeployToStaging
    displayName: 'Deploy to Staging'
    environment: 'staging'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: KubernetesManifest@0
            displayName: 'Deploy to Kubernetes'
            inputs:
              action: 'deploy'
              namespace: 'staging'
              manifests: |
                k8s/staging/*.yaml

- stage: DeployProduction
  displayName: 'Deploy to Production'
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployToProduction
    displayName: 'Deploy to Production'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: KubernetesManifest@0
            displayName: 'Deploy to Kubernetes'
            inputs:
              action: 'deploy'
              namespace: 'production'
              manifests: |
                k8s/production/*.yaml`;

		return {
			path: `${options.name}/azure-pipelines.yml`,
			content,
			type: "ci",
		};
	}

	private generateGitLabCI(options: MicroserviceOptions): GeneratedFile {
		const content = `# GitLab CI/CD Pipeline for ${options.name}

stages:
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_NAME: \$CI_REGISTRY_IMAGE/${options.name}

cache:
  paths:
    - node_modules/
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline

test:unit:
  stage: test
  image: node:\${NODE_VERSION}
  ${
		options.database === "postgresql"
			? `services:
    - postgres:15-alpine
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_HOST: postgres`
			: ""
	}
  ${
		options.database === "mongodb"
			? `services:
    - mongo:6
  variables:
    MONGODB_URI: mongodb://mongo:27017/test`
			: ""
	}
  ${
		options.database === "redis"
			? `services:
    - redis:7-alpine
  variables:
    REDIS_HOST: redis`
			: ""
	}
  script:
    - npm run lint
    - npm run type-check || true
    - npm test -- --coverage
  coverage: '/Lines\\s*:\\s*(\\d+\\.?\\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: junit.xml
    paths:
      - coverage/

test:e2e:
  stage: test
  image: node:\${NODE_VERSION}
  script:
    - npm run test:e2e
  allow_failure: true

security:scan:
  stage: security
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs --no-progress --format json --output trivy-report.json .
    - trivy fs --no-progress --severity HIGH,CRITICAL --exit-code 1 .
  artifacts:
    reports:
      container_scanning: trivy-report.json
  allow_failure: true

security:dependency:
  stage: security
  image: node:\${NODE_VERSION}
  script:
    - npm audit --audit-level=high
  allow_failure: true

build:docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
  script:
    - docker build -t \$IMAGE_NAME:latest .
    - docker tag \$IMAGE_NAME:latest \$IMAGE_NAME:\$CI_COMMIT_SHA
    - docker push \$IMAGE_NAME:latest
    - docker push \$IMAGE_NAME:\$CI_COMMIT_SHA
  only:
    - main
    - develop
    - /^release\\/.*$/

deploy:staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context \$K8S_CONTEXT_STAGING
    - kubectl set image deployment/${options.name} ${options.name}=\$IMAGE_NAME:\$CI_COMMIT_SHA -n staging
    - kubectl rollout status deployment/${options.name} -n staging
  environment:
    name: staging
    url: https://staging-${options.name}.example.com
  only:
    - develop

deploy:production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context \$K8S_CONTEXT_PRODUCTION
    - kubectl set image deployment/${options.name} ${options.name}=\$IMAGE_NAME:\$CI_COMMIT_SHA -n production
    - kubectl rollout status deployment/${options.name} -n production
  environment:
    name: production
    url: https://${options.name}.example.com
  when: manual
  only:
    - main`;

		return {
			path: `${options.name}/.gitlab-ci.yml`,
			content,
			type: "ci",
		};
	}

	private generateJenkinsfile(options: MicroserviceOptions): GeneratedFile {
		const content = `// Jenkinsfile for ${options.name}

pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = '${options.name}'
        SCANNER_HOME = tool 'SonarQubeScanner'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                nodejs(nodeJSInstallationName: "NodeJS-\${NODE_VERSION}") {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Lint') {
                    steps {
                        nodejs(nodeJSInstallationName: "NodeJS-\${NODE_VERSION}") {
                            sh 'npm run lint'
                        }
                    }
                }
                
                stage('Type Check') {
                    steps {
                        nodejs(nodeJSInstallationName: "NodeJS-\${NODE_VERSION}") {
                            sh 'npm run type-check || true'
                        }
                    }
                }
                
                stage('Unit Tests') {
                    steps {
                        nodejs(nodeJSInstallationName: "NodeJS-\${NODE_VERSION}") {
                            sh 'npm test -- --coverage'
                        }
                        junit 'test-results.xml'
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
            }
        }
        
        stage('Security Scan') {
            steps {
                nodejs(nodeJSInstallationName: "NodeJS-\${NODE_VERSION}") {
                    sh 'npm audit --audit-level=high'
                }
                
                withSonarQubeEnv('SonarQube') {
                    sh "\${SCANNER_HOME}/bin/sonar-scanner"
                }
                
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch pattern: "release/.*", comparator: "REGEXP"
                }
            }
            steps {
                script {
                    docker.withRegistry("https://\${DOCKER_REGISTRY}", 'docker-credentials') {
                        def image = docker.build("\${IMAGE_NAME}:\${env.BUILD_ID}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    kubernetesDeploy(
                        configs: 'k8s/staging/*.yaml',
                        kubeconfigId: 'kubeconfig-staging'
                    )
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Yes, deploy to production"
            }
            steps {
                script {
                    kubernetesDeploy(
                        configs: 'k8s/production/*.yaml',
                        kubeconfigId: 'kubeconfig-production'
                    )
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                color: 'good',
                message: "Build Successful: \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Build Failed: \${env.JOB_NAME} - \${env.BUILD_NUMBER}"
            )
        }
    }
}`;

		return {
			path: `${options.name}/Jenkinsfile`,
			content,
			type: "ci",
		};
	}
}

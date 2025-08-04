import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";
export class DockerGenerator extends BaseGenerator {
	templateManager;
	analyzer;
	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}
	async generate(options) {
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
			// Generate tracing configuration if enabled
			if (options.enableTracing) {
				await this.generateTracingConfig(options);
			}
			// Generate logging configuration if enabled
			if (options.enableLogging) {
				await this.generateLoggingConfig(options);
			}
			// Generate secrets management if enabled
			if (options.enableSecrets) {
				await this.generateSecretsManagement(options);
			}
			// Generate vulnerability scanning if enabled
			if (options.enableVulnerabilityScanning) {
				await this.generateVulnerabilityScanning(options);
			}
			// Generate multi-architecture build support if enabled
			if (options.enableMultiArch) {
				await this.generateMultiArchSupport(options);
			}
			// Generate caching configuration if enabled
			if (options.enableCaching) {
				await this.generateCachingConfig(options, config);
			}
			// Generate container registry integration
			await this.generateRegistryIntegration(options);
			// Generate monitoring and observability stack
			await this.generateObservabilityStack(options);
			this.logger.success("Docker configuration generated successfully");
		} catch (error) {
			this.logger.error("Failed to generate Docker configuration", error);
			throw error;
		}
	}
	async validateOptions(options) {
		if (!options.imageName) {
			throw new Error("Image name is required");
		}
		if (!options.port || options.port < 1 || options.port > 65535) {
			throw new Error("Valid port number is required");
		}
		if (options.exposePorts.some((port) => port < 1 || port > 65535)) {
			throw new Error("All exposed ports must be valid port numbers");
		}
	}
	async generateDockerConfig(options) {
		const baseImages = {
			node: `node:${options.nodeVersion || "20"}-alpine`,
			python: `python:${options.pythonVersion || "3.11"}-slim`,
			go: `golang:${options.goVersion || "1.21"}-alpine`,
			java: `openjdk:${options.javaVersion || "17"}-jre-slim`,
			dotnet: `mcr.microsoft.com/dotnet/aspnet:${options.dotnetVersion || "8.0"}`,
			php: `php:${options.phpVersion || "8.2"}-fpm-alpine`,
			rust: `rust:${options.rustVersion || "1.75"}-slim`,
			alpine: "alpine:3.18",
			distroless: "gcr.io/distroless/static-debian11",
		};
		const buildStages = options.enableMultiStage
			? ["dependencies", "builder", "runtime"]
			: ["runtime"];
		return {
			baseImage: baseImages[options.runtime],
			buildStages,
			healthCheck: this.generateHealthCheckCommand(options),
			securityScanning: options.enableSecurity,
			vulnerabilityScanning: options.enableVulnerabilityScanning,
			multiArchSupport: options.enableMultiArch,
			cachingStrategy: options.enableCaching ? "registry" : "none",
			buildContext: ".",
			ignorePatterns: this.getIgnorePatterns(options),
			labels: {
				"org.opencontainers.image.title": options.imageName,
				"org.opencontainers.image.description": `${options.projectType} application`,
				"org.opencontainers.image.version": options.imageTag,
				"org.opencontainers.image.created": new Date().toISOString(),
				"org.opencontainers.image.source":
					"https://github.com/your-org/your-repo",
				"org.opencontainers.image.licenses": "MIT",
				"org.opencontainers.image.vendor": "Xaheen Enterprise",
				...options.labels,
			},
			secrets: options.secrets || [],
			buildSecrets: options.buildSecrets || [],
			networkMode: options.networkMode || "bridge",
			volumes: options.volumes || [],
			environmentVariables: {
				NODE_ENV: options.environment,
				PORT: options.port.toString(),
				...options.environmentVariables,
			},
			initProcess: options.initProcess || false,
			oomKillDisable: options.oomKillDisable || false,
			privileged: options.privileged || false,
			readonlyRootfs: options.readonlyRootfs || true,
			user: options.user || (options.enableNonRootUser ? "1000:1000" : "root"),
			workingDir: options.workingDir || options.workdir,
			entrypoint: options.entrypoint || [],
			command: options.command || [],
		};
	}
	async generateDockerfile(options, config, projectContext) {
		const templateData = {
			...options,
			...config,
			projectContext,
			timestamp: new Date().toISOString(),
			enableMultiStage: options.enableMultiStage,
			enableSecurity: options.enableSecurity,
			enableHealthCheck: options.enableHealthCheck,
			enableNonRootUser: options.enableNonRootUser,
			optimizeForSize: options.optimizeForSize,
		};
		await this.templateManager.renderTemplate(
			"devops/docker/Dockerfile.hbs",
			"Dockerfile",
			templateData,
		);
	}
	async generateDockerCompose(options, config) {
		const services = {
			[options.imageName]: {
				build: {
					context: config.buildContext,
					dockerfile: "Dockerfile",
					target: options.enableMultiStage ? "runtime" : undefined,
				},
				ports: [`${options.port}:${options.port}`],
				environment: this.getEnvironmentVariables(options),
				healthcheck: options.enableHealthCheck
					? {
							test: config.healthCheck,
							interval: "30s",
							timeout: "10s",
							retries: 3,
							start_period: "40s",
						}
					: undefined,
				restart: "unless-stopped",
			},
		};
		// Add additional services based on project type
		if (options.projectType === "fullstack") {
			services["database"] = {
				image: "postgres:15-alpine",
				environment: {
					POSTGRES_DB: "${DB_NAME}",
					POSTGRES_USER: "${DB_USER}",
					POSTGRES_PASSWORD: "${DB_PASSWORD}",
				},
				volumes: ["postgres_data:/var/lib/postgresql/data"],
				ports: ["5432:5432"],
			};
			services["redis"] = {
				image: "redis:7-alpine",
				ports: ["6379:6379"],
				volumes: ["redis_data:/data"],
			};
		}
		// Add Prometheus if enabled
		if (options.enablePrometheus) {
			services["prometheus"] = {
				image: "prom/prometheus:latest",
				ports: ["9090:9090"],
				volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"],
			};
		}
		const templateData = {
			services,
			volumes: this.getDockerVolumes(options),
			networks: {
				default: {
					driver: "bridge",
				},
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/docker-compose.yml.hbs",
			"docker-compose.yml",
			templateData,
		);
	}
	async generateDockerIgnore(options, config) {
		const templateData = {
			patterns: config.ignorePatterns,
			runtime: options.runtime,
			projectType: options.projectType,
			customPatterns: [
				"# Logs",
				"logs",
				"*.log",
				"npm-debug.log*",
				"yarn-debug.log*",
				"yarn-error.log*",
				"",
				"# Runtime data",
				"pids",
				"*.pid",
				"*.seed",
				"*.pid.lock",
				"",
				"# Coverage directory used by tools like istanbul",
				"coverage",
				"*.lcov",
				"",
				"# nyc test coverage",
				".nyc_output",
				"",
				"# Dependency directories",
				"node_modules/",
				"jspm_packages/",
				"",
				"# Optional npm cache directory",
				".npm",
				"",
				"# Optional REPL history",
				".node_repl_history",
				"",
				'# Output of "npm pack"',
				"*.tgz",
				"",
				"# Yarn Integrity file",
				".yarn-integrity",
				"",
				"# dotenv environment variables file",
				".env",
				".env.local",
				".env.development.local",
				".env.test.local",
				".env.production.local",
				"",
				"# IDE",
				".vscode/",
				".idea/",
				"*.swp",
				"*.swo",
				"",
				"# OS",
				".DS_Store",
				"Thumbs.db",
				"",
				"# Git",
				".git",
				".gitignore",
				"",
				"# Documentation",
				"docs/",
				"*.md",
				"",
				"# Tests",
				"test/",
				"tests/",
				"*.test.js",
				"*.spec.js",
			],
		};
		await this.templateManager.renderTemplate(
			"devops/docker/dockerignore.hbs",
			".dockerignore",
			templateData,
		);
	}
	async generateDevContainer(options, config) {
		const devContainerConfig = {
			name: `${options.imageName}-dev`,
			dockerFile: "../Dockerfile",
			context: "..",
			target: options.enableMultiStage ? "builder" : undefined,
			mounts: [
				"source=${localWorkspaceFolder}/node_modules,target=/app/node_modules,type=volume",
			],
			customizations: {
				vscode: {
					extensions: this.getVSCodeExtensions(options.runtime),
					settings: {
						"terminal.integrated.shell.linux": "/bin/bash",
					},
				},
			},
			forwardPorts: [options.port, ...options.exposePorts],
			postCreateCommand: this.getPostCreateCommand(options),
			remoteUser: options.enableNonRootUser ? "node" : "root",
		};
		await this.templateManager.renderTemplate(
			"devops/docker/devcontainer.json.hbs",
			".devcontainer/devcontainer.json",
			devContainerConfig,
		);
	}
	async generateBuildScripts(options, config) {
		const scripts = {
			build: this.generateBuildScript(options, config),
			run: this.generateRunScript(options),
			push: this.generatePushScript(options),
			clean: this.generateCleanScript(options),
		};
		for (const [scriptName, scriptContent] of Object.entries(scripts)) {
			await this.templateManager.renderTemplate(
				"devops/docker/scripts/docker-script.sh.hbs",
				`scripts/docker-${scriptName}.sh`,
				{
					scriptName,
					scriptContent,
					executable: true,
				},
			);
		}
	}
	async generateSecurityScanning(options) {
		const securityConfig = {
			scanners: {
				trivy: {
					image: "aquasec/trivy:latest",
					command: "trivy image --format json --output scan-results.json",
				},
				snyk: {
					image: "snyk/snyk:docker",
					command: "snyk container test --json > snyk-results.json",
				},
				clair: {
					enabled: true,
					config: "./clair-config.yaml",
				},
			},
			policies: {
				allowedVulnerabilities: ["LOW"],
				blockedVulnerabilities: ["HIGH", "CRITICAL"],
				maxAge: "30d",
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/security/security-scan.yml.hbs",
			"security/docker-security-scan.yml",
			securityConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/security/trivy-config.yaml.hbs",
			"security/trivy-config.yaml",
			securityConfig,
		);
	}
	async generateHealthCheck(options) {
		const healthCheckScript = this.getHealthCheckScript(options);
		await this.templateManager.renderTemplate(
			"devops/docker/health/healthcheck.sh.hbs",
			"docker/healthcheck.sh",
			{
				script: healthCheckScript,
				port: options.port,
				endpoint: this.getHealthCheckEndpoint(options),
				executable: true,
			},
		);
	}
	async generatePrometheusConfig(options) {
		const prometheusConfig = {
			global: {
				scrape_interval: "15s",
				evaluation_interval: "15s",
			},
			scrape_configs: [
				{
					job_name: options.imageName,
					static_configs: [
						{
							targets: [`localhost:${options.port}`],
						},
					],
					metrics_path: "/metrics",
					scrape_interval: "5s",
				},
			],
		};
		await this.templateManager.renderTemplate(
			"devops/docker/monitoring/prometheus.yml.hbs",
			"prometheus.yml",
			prometheusConfig,
		);
	}
	generateHealthCheckCommand(options) {
		const healthCheckCommands = {
			node: `curl -f http://localhost:${options.port}/health || exit 1`,
			python: `curl -f http://localhost:${options.port}/health || exit 1`,
			go: `wget --no-verbose --tries=1 --spider http://localhost:${options.port}/health || exit 1`,
			java: `curl -f http://localhost:${options.port}/actuator/health || exit 1`,
			dotnet: `curl -f http://localhost:${options.port}/health || exit 1`,
			php: `curl -f http://localhost:${options.port}/health || exit 1`,
			rust: `curl -f http://localhost:${options.port}/health || exit 1`,
		};
		return healthCheckCommands[options.runtime];
	}
	getIgnorePatterns(options) {
		const commonPatterns = [
			"node_modules",
			"npm-debug.log*",
			"yarn-debug.log*",
			"yarn-error.log*",
			".env",
			".env.local",
			".env.development.local",
			".env.test.local",
			".env.production.local",
			".git",
			".gitignore",
			"README.md",
			"Dockerfile",
			".dockerignore",
			"docker-compose*.yml",
		];
		const runtimeSpecific = {
			node: ["coverage", ".nyc_output", ".next", "dist", "build"],
			python: [
				"__pycache__",
				"*.pyc",
				"*.pyo",
				"*.pyd",
				".pytest_cache",
				"venv",
				".venv",
			],
			go: ["*.exe", "*.exe~", "*.dll", "*.so", "*.dylib", "vendor"],
			java: ["target", "*.jar", "*.war", "*.ear", "*.class"],
			dotnet: ["bin", "obj", "*.dll", "*.exe", "*.pdb"],
			php: ["vendor", "composer.lock"],
			rust: ["target", "Cargo.lock"],
		};
		return [...commonPatterns, ...runtimeSpecific[options.runtime]];
	}
	getEnvironmentVariables(options) {
		const baseEnv = {
			NODE_ENV: options.environment,
			PORT: options.port.toString(),
		};
		if (options.projectType === "fullstack") {
			return {
				...baseEnv,
				DB_HOST: "database",
				DB_PORT: "5432",
				DB_NAME: "${DB_NAME}",
				DB_USER: "${DB_USER}",
				DB_PASSWORD: "${DB_PASSWORD}",
				REDIS_URL: "redis://redis:6379",
			};
		}
		return baseEnv;
	}
	getDockerVolumes(options) {
		const volumes = {};
		if (options.projectType === "fullstack") {
			volumes["postgres_data"] = {};
			volumes["redis_data"] = {};
		}
		return volumes;
	}
	getVSCodeExtensions(runtime) {
		const commonExtensions = [
			"ms-vscode.vscode-docker",
			"ms-vscode.vscode-json",
			"ms-vscode.vscode-yaml",
		];
		const runtimeExtensions = {
			node: ["ms-vscode.vscode-typescript-next", "esbenp.prettier-vscode"],
			python: ["ms-python.python", "ms-python.flake8"],
			go: ["golang.go"],
			java: ["redhat.java", "vscjava.vscode-java-pack"],
			dotnet: ["ms-dotnettools.csharp"],
			php: ["felixfbecker.php-intellisense"],
			rust: ["rust-lang.rust-analyzer"],
		};
		return [...commonExtensions, ...runtimeExtensions[runtime]];
	}
	getPostCreateCommand(options) {
		const commands = {
			node: "npm install",
			python: "pip install -r requirements.txt",
			go: "go mod download",
			java: "./mvnw dependency:resolve",
			dotnet: "dotnet restore",
			php: "composer install",
			rust: "cargo build",
		};
		return commands[options.runtime];
	}
	generateBuildScript(options, config) {
		const buildArgs = options.customBuildArgs
			? options.customBuildArgs.join(" ")
			: "";
		const target = options.enableMultiStage ? "--target runtime" : "";
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
	generateRunScript(options) {
		return `#!/bin/bash
set -e

echo "Running Docker container: ${options.imageName}"

docker run \\
  --rm \\
  --name ${options.imageName}-dev \\
  -p ${options.port}:${options.port} \\
  ${options.exposePorts.map((port) => `-p ${port}:${port}`).join(" ")} \\
  -e NODE_ENV=${options.environment} \\
  ${options.imageName}:latest
`;
	}
	generatePushScript(options) {
		const registry = options.registryUrl || "docker.io";
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
	generateCleanScript(options) {
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
	getHealthCheckScript(options) {
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
	getHealthCheckEndpoint(options) {
		const endpoints = {
			node: "/health",
			python: "/health",
			go: "/health",
			java: "/actuator/health",
			dotnet: "/health",
			php: "/health",
			rust: "/health",
			alpine: "/health",
			distroless: "/health",
		};
		return endpoints[options.runtime] || "/health";
	}
	/**
	 * Generate tracing configuration (Jaeger, OpenTelemetry)
	 */
	async generateTracingConfig(options) {
		const tracingConfig = {
			jaeger: {
				serviceName: options.imageName,
				agentHost: "jaeger-agent",
				agentPort: 6832,
				collectorEndpoint: "http://jaeger-collector:14268/api/traces",
				samplingType: "const",
				samplingParam: options.environment === "production" ? 0.1 : 1,
			},
			opentelemetry: {
				serviceName: options.imageName,
				serviceVersion: options.imageTag,
				exporterEndpoint: "http://otel-collector:4317",
				instrumentations: ["http", "express", "redis", "postgresql"],
			},
			environment: options.environment,
		};
		await this.templateManager.renderTemplate(
			"devops/docker/tracing/jaeger-config.yml.hbs",
			"tracing/jaeger-config.yml",
			tracingConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/tracing/otel-config.yml.hbs",
			"tracing/otel-config.yml",
			tracingConfig,
		);
	}
	/**
	 * Generate logging configuration (Fluentd, Logstash)
	 */
	async generateLoggingConfig(options) {
		const loggingConfig = {
			fluentd: {
				tag: options.imageName,
				host: "fluentd",
				port: 24224,
				bufferSize: "1m",
				flushInterval: "10s",
			},
			logstash: {
				host: "logstash",
				port: 5000,
				format: "json",
			},
			structured: {
				format: "json",
				level: options.environment === "development" ? "debug" : "info",
				timestamp: true,
				colorize: options.environment === "development",
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/logging/fluentd.conf.hbs",
			"logging/fluentd.conf",
			loggingConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/logging/logstash.conf.hbs",
			"logging/logstash.conf",
			loggingConfig,
		);
	}
	/**
	 * Generate secrets management configuration
	 */
	async generateSecretsManagement(options) {
		const secretsConfig = {
			provider: "docker-secrets",
			secrets:
				options.secrets?.map((secret) => ({
					name: secret,
					external: true,
					file: `/run/secrets/${secret}`,
				})) || [],
			buildSecrets:
				options.buildSecrets?.map((secret) => ({
					name: secret,
					source: `build-${secret}`,
					target: `/tmp/${secret}`,
				})) || [],
			vault: {
				enabled: false,
				address: "https://vault:8200",
				path: "secret/data",
				role: options.imageName,
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/secrets/secrets-config.yml.hbs",
			"secrets/secrets-config.yml",
			secretsConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/secrets/docker-secrets.sh.hbs",
			"scripts/docker-secrets.sh",
			{
				...secretsConfig,
				executable: true,
			},
		);
	}
	/**
	 * Generate vulnerability scanning configuration
	 */
	async generateVulnerabilityScanning(options) {
		const scanningConfig = {
			trivy: {
				image: "aquasec/trivy:latest",
				severity: "HIGH,CRITICAL",
				ignoreUnfixed: true,
				format: "json",
				output: "trivy-results.json",
				cacheDir: ".trivycache",
			},
			grype: {
				image: "anchore/grype:latest",
				output: "json",
				file: "grype-results.json",
			},
			snyk: {
				image: "snyk/snyk:docker",
				severityThreshold: "high",
				output: "snyk-results.json",
			},
			clair: {
				enabled: true,
				host: "clair-scanner",
				port: 6060,
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/security/vulnerability-scan.yml.hbs",
			"security/vulnerability-scan.yml",
			scanningConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/security/scan-script.sh.hbs",
			"scripts/vulnerability-scan.sh",
			{
				...scanningConfig,
				imageName: options.imageName,
				imageTag: options.imageTag,
				executable: true,
			},
		);
	}
	/**
	 * Generate multi-architecture build support
	 */
	async generateMultiArchSupport(options) {
		const multiArchConfig = {
			platforms: ["linux/amd64", "linux/arm64", "linux/arm/v7"],
			builder: "multiarch-builder",
			buildx: true,
			push: true,
			imageName: options.imageName,
			imageTag: options.imageTag,
			registryUrl: options.registryUrl || "docker.io",
		};
		await this.templateManager.renderTemplate(
			"devops/docker/multiarch/buildx-config.yml.hbs",
			"multiarch/buildx-config.yml",
			multiArchConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/multiarch/build-multiarch.sh.hbs",
			"scripts/build-multiarch.sh",
			{
				...multiArchConfig,
				executable: true,
			},
		);
	}
	/**
	 * Generate caching configuration
	 */
	async generateCachingConfig(options, config) {
		const cachingConfig = {
			strategy: config.cachingStrategy,
			registry: options.registryUrl || "docker.io",
			cacheFrom: [
				`${options.registryUrl || "docker.io"}/${options.imageName}:cache`,
				`${options.registryUrl || "docker.io"}/${options.imageName}:latest`,
			],
			cacheTo: `${options.registryUrl || "docker.io"}/${options.imageName}:cache`,
			buildkit: true,
			inlineCache: config.cachingStrategy === "inline",
			localCache: config.cachingStrategy === "local",
			registryCache: config.cachingStrategy === "registry",
		};
		await this.templateManager.renderTemplate(
			"devops/docker/caching/cache-config.yml.hbs",
			"caching/cache-config.yml",
			cachingConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/caching/build-with-cache.sh.hbs",
			"scripts/build-with-cache.sh",
			{
				...cachingConfig,
				imageName: options.imageName,
				imageTag: options.imageTag,
				executable: true,
			},
		);
	}
	/**
	 * Generate container registry integration
	 */
	async generateRegistryIntegration(options) {
		const registryConfig = {
			registry: options.registryUrl || "docker.io",
			imageName: options.imageName,
			imageTag: options.imageTag,
			credentials: {
				username: "${REGISTRY_USERNAME}",
				password: "${REGISTRY_PASSWORD}",
				email: "${REGISTRY_EMAIL}",
			},
			repositories: [
				{
					name: "production",
					url: options.registryUrl || "docker.io",
					public: false,
				},
				{
					name: "staging",
					url: `${options.registryUrl || "docker.io"}/staging`,
					public: false,
				},
			],
			retentionPolicy: {
				keepLatest: 10,
				keepTaggedVersions: true,
				deleteUntagged: true,
				maxAge: "30d",
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/registry/registry-config.yml.hbs",
			"registry/registry-config.yml",
			registryConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/registry/push-to-registry.sh.hbs",
			"scripts/push-to-registry.sh",
			{
				...registryConfig,
				executable: true,
			},
		);
		await this.templateManager.renderTemplate(
			"devops/docker/registry/cleanup-registry.sh.hbs",
			"scripts/cleanup-registry.sh",
			{
				...registryConfig,
				executable: true,
			},
		);
	}
	/**
	 * Generate comprehensive observability stack
	 */
	async generateObservabilityStack(options) {
		const observabilityConfig = {
			prometheus: {
				enabled: options.enablePrometheus,
				port: 9090,
				scrapeInterval: "15s",
				targets: [`${options.imageName}:${options.port}`],
			},
			grafana: {
				enabled: true,
				port: 3000,
				defaultUser: "admin",
				defaultPassword: "${GRAFANA_PASSWORD}",
				datasources: [
					{
						name: "Prometheus",
						type: "prometheus",
						url: "http://prometheus:9090",
					},
					{
						name: "Loki",
						type: "loki",
						url: "http://loki:3100",
					},
				],
			},
			loki: {
				enabled: options.enableLogging,
				port: 3100,
				retentionPeriod: "744h",
			},
			jaeger: {
				enabled: options.enableTracing,
				port: 16686,
				collectorPort: 14268,
				agentPort: 6832,
			},
			alertmanager: {
				enabled: true,
				port: 9093,
				webhookUrl: "${ALERT_WEBHOOK_URL}",
			},
		};
		await this.templateManager.renderTemplate(
			"devops/docker/observability/observability-stack.yml.hbs",
			"observability/observability-stack.yml",
			observabilityConfig,
		);
		await this.templateManager.renderTemplate(
			"devops/docker/observability/prometheus-rules.yml.hbs",
			"observability/prometheus-rules.yml",
			{
				...observabilityConfig,
				serviceName: options.imageName,
			},
		);
		await this.templateManager.renderTemplate(
			"devops/docker/observability/grafana-dashboard.json.hbs",
			"observability/grafana-dashboard.json",
			{
				...observabilityConfig,
				serviceName: options.imageName,
			},
		);
	}
}
//# sourceMappingURL=docker.generator.js.map

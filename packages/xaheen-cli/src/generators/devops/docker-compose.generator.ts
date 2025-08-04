import { BaseGenerator } from "../base.generator";
import { TemplateManager } from "../../services/templates/template-loader";
import { ProjectAnalyzer } from "../../services/analysis/project-analyzer";

export interface DockerComposeService {
	readonly name: string;
	readonly image?: string;
	readonly build?: {
		readonly context: string;
		readonly dockerfile?: string;
		readonly target?: string;
		readonly args?: Record<string, string>;
		readonly secrets?: readonly string[];
	};
	readonly ports?: readonly string[];
	readonly environment?: Record<string, string> | readonly string[];
	readonly volumes?: readonly string[];
	readonly networks?: readonly string[];
	readonly dependsOn?:
		| readonly string[]
		| Record<string, { readonly condition: string }>;
	readonly healthcheck?: {
		readonly test: string | readonly string[];
		readonly interval?: string;
		readonly timeout?: string;
		readonly retries?: number;
		readonly startPeriod?: string;
	};
	readonly restart?: "no" | "always" | "on-failure" | "unless-stopped";
	readonly deploy?: {
		readonly replicas?: number;
		readonly resources?: {
			readonly limits?: {
				readonly cpus?: string;
				readonly memory?: string;
			};
			readonly reservations?: {
				readonly cpus?: string;
				readonly memory?: string;
			};
		};
		readonly updateConfig?: {
			readonly parallelism?: number;
			readonly delay?: string;
			readonly order?: "start-first" | "stop-first";
		};
		readonly rollbackConfig?: {
			readonly parallelism?: number;
			readonly delay?: string;
			readonly order?: "start-first" | "stop-first";
		};
	};
	readonly command?: string | readonly string[];
	readonly entrypoint?: string | readonly string[];
	readonly workingDir?: string;
	readonly user?: string;
	readonly privileged?: boolean;
	readonly readOnly?: boolean;
	readonly secrets?: readonly string[];
	readonly configs?: readonly string[];
	readonly labels?: Record<string, string>;
	readonly logging?: {
		readonly driver: string;
		readonly options?: Record<string, string>;
	};
	readonly securityOpt?: readonly string[];
	readonly capAdd?: readonly string[];
	readonly capDrop?: readonly string[];
	readonly devices?: readonly string[];
	readonly sysctls?: Record<string, string>;
	readonly ulimits?: Record<
		string,
		number | { readonly soft: number; readonly hard: number }
	>;
}

export interface DockerComposeNetwork {
	readonly name: string;
	readonly driver?: "bridge" | "overlay" | "host" | "none" | "macvlan";
	readonly driverOpts?: Record<string, string>;
	readonly ipam?: {
		readonly config?: ReadonlyArray<{
			readonly subnet?: string;
			readonly gateway?: string;
			readonly ipRange?: string;
		}>;
	};
	readonly external?: boolean;
	readonly attachable?: boolean;
	readonly labels?: Record<string, string>;
}

export interface DockerComposeVolume {
	readonly name: string;
	readonly driver?: string;
	readonly driverOpts?: Record<string, string>;
	readonly external?: boolean;
	readonly labels?: Record<string, string>;
}

export interface DockerComposeSecret {
	readonly name: string;
	readonly file?: string;
	readonly external?: boolean;
	readonly labels?: Record<string, string>;
}

export interface DockerComposeConfig {
	readonly name: string;
	readonly file?: string;
	readonly external?: boolean;
	readonly labels?: Record<string, string>;
}

export interface DockerComposeGeneratorOptions {
	readonly projectName: string;
	readonly version: "3.8" | "3.9";
	readonly services: readonly DockerComposeService[];
	readonly networks?: readonly DockerComposeNetwork[];
	readonly volumes?: readonly DockerComposeVolume[];
	readonly secrets?: readonly DockerComposeSecret[];
	readonly configs?: readonly DockerComposeConfig[];
	readonly environment: "development" | "staging" | "production";
	readonly enableSwarm?: boolean;
	readonly enableTraefik?: boolean;
	readonly enableObservability?: boolean;
	readonly enableLogging?: boolean;
	readonly enableBackup?: boolean;
	readonly enableSSL?: boolean;
	readonly domain?: string;
	readonly emailForSSL?: string;
	readonly labels?: Record<string, string>;
}

export class DockerComposeGenerator extends BaseGenerator<DockerComposeGeneratorOptions> {
	private readonly templateManager: TemplateManager;
	private readonly analyzer: ProjectAnalyzer;

	constructor() {
		super();
		this.templateManager = new TemplateManager();
		this.analyzer = new ProjectAnalyzer();
	}

	async generate(options: DockerComposeGeneratorOptions): Promise<void> {
		try {
			await this.validateOptions(options);

			const projectContext = await this.analyzer.analyze(process.cwd());

			// Generate main docker-compose.yml
			await this.generateMainCompose(options, projectContext);

			// Generate environment-specific overrides
			await this.generateEnvironmentOverrides(options);

			// Generate development compose file
			await this.generateDevelopmentCompose(options);

			// Generate production compose file
			await this.generateProductionCompose(options);

			// Generate Traefik configuration if enabled
			if (options.enableTraefik) {
				await this.generateTraefikConfig(options);
			}

			// Generate observability stack if enabled
			if (options.enableObservability) {
				await this.generateObservabilityStack(options);
			}

			// Generate logging stack if enabled
			if (options.enableLogging) {
				await this.generateLoggingStack(options);
			}

			// Generate backup configuration if enabled
			if (options.enableBackup) {
				await this.generateBackupConfig(options);
			}

			// Generate SSL configuration if enabled
			if (options.enableSSL) {
				await this.generateSSLConfig(options);
			}

			// Generate helper scripts
			await this.generateHelperScripts(options);

			// Generate environment files
			await this.generateEnvironmentFiles(options);

			// Generate Docker Swarm configuration if enabled
			if (options.enableSwarm) {
				await this.generateSwarmConfig(options);
			}

			this.logger.success(
				"Docker Compose configuration generated successfully",
			);
		} catch (error) {
			this.logger.error(
				"Failed to generate Docker Compose configuration",
				error,
			);
			throw error;
		}
	}

	private async validateOptions(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		if (!options.projectName) {
			throw new Error("Project name is required");
		}

		if (!options.services || options.services.length === 0) {
			throw new Error("At least one service is required");
		}

		// Validate service dependencies
		const serviceNames = new Set(options.services.map((s) => s.name));
		for (const service of options.services) {
			if (service.dependsOn) {
				const deps = Array.isArray(service.dependsOn)
					? service.dependsOn
					: Object.keys(service.dependsOn);
				for (const dep of deps) {
					if (!serviceNames.has(dep)) {
						throw new Error(
							`Service "${service.name}" depends on unknown service "${dep}"`,
						);
					}
				}
			}
		}
	}

	private async generateMainCompose(
		options: DockerComposeGeneratorOptions,
		projectContext: any,
	): Promise<void> {
		const composeData = {
			version: options.version,
			name: options.projectName,
			services: this.transformServices(options.services),
			networks: this.transformNetworks(options.networks || []),
			volumes: this.transformVolumes(options.volumes || []),
			secrets: this.transformSecrets(options.secrets || []),
			configs: this.transformConfigs(options.configs || []),
			labels: options.labels || {},
			projectContext,
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/docker-compose.yml.hbs",
			"docker-compose.yml",
			composeData,
		);
	}

	private async generateEnvironmentOverrides(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const environments = ["development", "staging", "production"];

		for (const env of environments) {
			const overrideData = {
				version: options.version,
				services: this.getEnvironmentServiceOverrides(options.services, env),
				networks:
					env === "production" ? this.getProductionNetworks() : undefined,
				environment: env,
			};

			await this.templateManager.renderTemplate(
				"devops/docker-compose/docker-compose.override.yml.hbs",
				`docker-compose.${env}.yml`,
				overrideData,
			);
		}
	}

	private async generateDevelopmentCompose(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const devServices = this.addDevelopmentServices(options.services);

		const devData = {
			version: options.version,
			services: {
				...this.transformServices(devServices),
				// Add hot reload and development tools
				...this.getDevelopmentToolServices(),
			},
			volumes: {
				...this.transformVolumes(options.volumes || []),
				// Add development volumes
				node_modules: {},
				".tmp": {},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/docker-compose.dev.yml.hbs",
			"docker-compose.dev.yml",
			devData,
		);
	}

	private async generateProductionCompose(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const prodData = {
			version: options.version,
			services: this.getProductionServices(options.services),
			networks: this.getProductionNetworks(),
			volumes: this.getProductionVolumes(options.volumes || []),
			secrets: this.transformSecrets(options.secrets || []),
			configs: this.transformConfigs(options.configs || []),
			deploy: {
				replicas: 3,
				updateConfig: {
					parallelism: 1,
					delay: "10s",
					order: "start-first",
				},
				rollbackConfig: {
					parallelism: 1,
					delay: "10s",
					order: "stop-first",
				},
				restartPolicy: {
					condition: "on-failure",
					delay: "5s",
					maxAttempts: 3,
					window: "120s",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/docker-compose.prod.yml.hbs",
			"docker-compose.prod.yml",
			prodData,
		);
	}

	private async generateTraefikConfig(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const traefikConfig = {
			api: {
				dashboard: true,
				insecure: options.environment === "development",
			},
			entryPoints: {
				web: {
					address: ":80",
					http: {
						redirections: {
							entryPoint: {
								to: "websecure",
								scheme: "https",
							},
						},
					},
				},
				websecure: {
					address: ":443",
				},
			},
			certificatesResolvers: options.enableSSL
				? {
						letsencrypt: {
							acme: {
								email: options.emailForSSL,
								storage: "/letsencrypt/acme.json",
								httpChallenge: {
									entryPoint: "web",
								},
							},
						},
					}
				: undefined,
			providers: {
				docker: {
					endpoint: "unix:///var/run/docker.sock",
					exposedByDefault: false,
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/traefik/traefik.yml.hbs",
			"traefik/traefik.yml",
			traefikConfig,
		);

		// Generate Traefik service
		const traefikService = {
			version: options.version,
			services: {
				traefik: {
					image: "traefik:v3.0",
					command: ["--configFile=/etc/traefik/traefik.yml"],
					ports: ["80:80", "443:443", "8080:8080"],
					volumes: [
						"/var/run/docker.sock:/var/run/docker.sock:ro",
						"./traefik:/etc/traefik:ro",
						"letsencrypt:/letsencrypt",
					],
					networks: ["traefik"],
					labels: {
						"traefik.enable": "true",
						"traefik.http.routers.dashboard.rule": `Host(\`traefik.${options.domain || "localhost"}\`)`,
						"traefik.http.routers.dashboard.tls": "true",
						"traefik.http.routers.dashboard.tls.certresolver": "letsencrypt",
					},
				},
			},
			networks: {
				traefik: {
					external: true,
				},
			},
			volumes: {
				letsencrypt: {},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/traefik/docker-compose.traefik.yml.hbs",
			"docker-compose.traefik.yml",
			traefikService,
		);
	}

	private async generateObservabilityStack(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const observabilityServices = {
			prometheus: {
				image: "prom/prometheus:latest",
				ports: ["9090:9090"],
				volumes: [
					"./observability/prometheus.yml:/etc/prometheus/prometheus.yml:ro",
					"prometheus_data:/prometheus",
				],
				command: [
					"--config.file=/etc/prometheus/prometheus.yml",
					"--storage.tsdb.path=/prometheus",
					"--web.console.libraries=/etc/prometheus/console_libraries",
					"--web.console.templates=/etc/prometheus/consoles",
					"--storage.tsdb.retention.time=200h",
					"--web.enable-lifecycle",
				],
				networks: ["monitoring"],
			},
			grafana: {
				image: "grafana/grafana:latest",
				ports: ["3000:3000"],
				environment: {
					GF_SECURITY_ADMIN_PASSWORD: "${GRAFANA_PASSWORD:-admin}",
				},
				volumes: [
					"grafana_data:/var/lib/grafana",
					"./observability/grafana/provisioning:/etc/grafana/provisioning:ro",
				],
				networks: ["monitoring"],
				dependsOn: ["prometheus"],
			},
			alertmanager: {
				image: "prom/alertmanager:latest",
				ports: ["9093:9093"],
				volumes: [
					"./observability/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro",
				],
				command: [
					"--config.file=/etc/alertmanager/alertmanager.yml",
					"--storage.path=/alertmanager",
					"--web.external-url=http://localhost:9093",
				],
				networks: ["monitoring"],
			},
			jaeger: {
				image: "jaegertracing/all-in-one:latest",
				ports: ["16686:16686", "14268:14268"],
				environment: {
					COLLECTOR_OTLP_ENABLED: "true",
				},
				networks: ["monitoring"],
			},
		};

		const observabilityStack = {
			version: options.version,
			services: observabilityServices,
			networks: {
				monitoring: {
					driver: "bridge",
				},
			},
			volumes: {
				prometheus_data: {},
				grafana_data: {},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/observability/docker-compose.observability.yml.hbs",
			"docker-compose.observability.yml",
			observabilityStack,
		);

		// Generate Prometheus configuration
		const prometheusConfig = {
			global: {
				scrape_interval: "15s",
				evaluation_interval: "15s",
			},
			rule_files: ["alerts.yml"],
			scrape_configs: options.services.map((service) => ({
				job_name: service.name,
				static_configs: [
					{
						targets: [
							`${service.name}:${this.extractPort(service.ports?.[0]) || 3000}`,
						],
					},
				],
				metrics_path: "/metrics",
				scrape_interval: "5s",
			})),
			alerting: {
				alertmanagers: [
					{
						static_configs: [
							{
								targets: ["alertmanager:9093"],
							},
						],
					},
				],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/observability/prometheus.yml.hbs",
			"observability/prometheus.yml",
			prometheusConfig,
		);
	}

	private async generateLoggingStack(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const loggingServices = {
			elasticsearch: {
				image: "docker.elastic.co/elasticsearch/elasticsearch:8.11.0",
				environment: {
					"discovery.type": "single-node",
					"xpack.security.enabled": "false",
					ES_JAVA_OPTS: "-Xms512m -Xmx512m",
				},
				volumes: ["elasticsearch_data:/usr/share/elasticsearch/data"],
				ports: ["9200:9200"],
				networks: ["logging"],
			},
			kibana: {
				image: "docker.elastic.co/kibana/kibana:8.11.0",
				ports: ["5601:5601"],
				environment: {
					ELASTICSEARCH_HOSTS: "http://elasticsearch:9200",
				},
				networks: ["logging"],
				dependsOn: ["elasticsearch"],
			},
			logstash: {
				image: "docker.elastic.co/logstash/logstash:8.11.0",
				volumes: [
					"./logging/logstash/pipeline:/usr/share/logstash/pipeline:ro",
					"./logging/logstash/config:/usr/share/logstash/config:ro",
				],
				ports: ["5000:5000"],
				networks: ["logging"],
				dependsOn: ["elasticsearch"],
			},
			fluentd: {
				image: "fluent/fluentd:v1.16-debian-1",
				volumes: ["./logging/fluentd:/fluentd/etc:ro"],
				ports: ["24224:24224"],
				networks: ["logging"],
				dependsOn: ["elasticsearch"],
			},
		};

		const loggingStack = {
			version: options.version,
			services: loggingServices,
			networks: {
				logging: {
					driver: "bridge",
				},
			},
			volumes: {
				elasticsearch_data: {},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/logging/docker-compose.logging.yml.hbs",
			"docker-compose.logging.yml",
			loggingStack,
		);
	}

	private async generateBackupConfig(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const backupConfig = {
			services: {
				backup: {
					image: "alpine:latest",
					volumes: [
						"/var/run/docker.sock:/var/run/docker.sock:ro",
						"./backups:/backups",
						...(options.volumes?.map((v) => `${v.name}:/data/${v.name}:ro`) ||
							[]),
					],
					environment: {
						BACKUP_SCHEDULE: "0 2 * * *",
						RETENTION_DAYS: "30",
						S3_BUCKET: "${BACKUP_S3_BUCKET}",
						AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}",
						AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}",
					},
					command: ["/backup-script.sh"],
					restart: "unless-stopped",
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/backup/docker-compose.backup.yml.hbs",
			"docker-compose.backup.yml",
			backupConfig,
		);

		// Generate backup script
		const backupScript = `#!/bin/bash
set -e

# Install dependencies
apk add --no-cache docker-cli aws-cli

# Backup function
backup_service() {
    local service_name=$1
    local backup_path="/backups/\${service_name}_\$(date +%Y%m%d_%H%M%S).tar.gz"
    
    echo "Backing up \${service_name}..."
    docker exec \${service_name} tar czf - /data | gzip > \${backup_path}
    
    # Upload to S3 if configured
    if [ -n "\${S3_BUCKET}" ]; then
        aws s3 cp \${backup_path} s3://\${S3_BUCKET}/backups/
    fi
    
    echo "Backup completed: \${backup_path}"
}

# Clean old backups
cleanup_old_backups() {
    find /backups -type f -name "*.tar.gz" -mtime +\${RETENTION_DAYS:-30} -delete
    echo "Cleaned up old backups"
}

# Main execution
for service in \$(docker-compose ps --services); do
    backup_service \${service}
done

cleanup_old_backups
`;

		await this.templateManager.renderTemplate(
			"devops/docker-compose/backup/backup-script.sh.hbs",
			"backup/backup-script.sh",
			{ script: backupScript, executable: true },
		);
	}

	private async generateSSLConfig(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		if (!options.domain || !options.emailForSSL) {
			this.logger.warn("SSL enabled but domain or email not provided");
			return;
		}

		const sslConfig = {
			certbot: {
				image: "certbot/certbot:latest",
				volumes: [
					"letsencrypt:/etc/letsencrypt",
					"certbot_www:/var/www/certbot",
				],
				command: [
					"certonly",
					"--webroot",
					"--webroot-path=/var/www/certbot",
					"--email",
					options.emailForSSL,
					"--agree-tos",
					"--no-eff-email",
					"-d",
					options.domain,
				],
			},
			nginx: {
				image: "nginx:alpine",
				ports: ["80:80", "443:443"],
				volumes: [
					"./ssl/nginx.conf:/etc/nginx/nginx.conf:ro",
					"letsencrypt:/etc/letsencrypt:ro",
					"certbot_www:/var/www/certbot:ro",
				],
				dependsOn: ["certbot"],
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/ssl/docker-compose.ssl.yml.hbs",
			"docker-compose.ssl.yml",
			{ services: sslConfig, volumes: { letsencrypt: {}, certbot_www: {} } },
		);
	}

	private async generateHelperScripts(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const scripts = {
			start: this.generateStartScript(options),
			stop: this.generateStopScript(options),
			restart: this.generateRestartScript(options),
			logs: this.generateLogsScript(options),
			backup: this.generateBackupScript(options),
			restore: this.generateRestoreScript(options),
			scale: this.generateScaleScript(options),
			update: this.generateUpdateScript(options),
		};

		for (const [scriptName, scriptContent] of Object.entries(scripts)) {
			await this.templateManager.renderTemplate(
				"devops/docker-compose/scripts/script.sh.hbs",
				`scripts/${scriptName}.sh`,
				{
					scriptName,
					scriptContent,
					executable: true,
				},
			);
		}
	}

	private async generateEnvironmentFiles(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const environments = ["development", "staging", "production"];

		for (const env of environments) {
			const envVars = this.getEnvironmentVariables(options, env);

			await this.templateManager.renderTemplate(
				"devops/docker-compose/env/env.hbs",
				`.env.${env}`,
				{ variables: envVars, environment: env },
			);
		}

		// Generate .env.example
		const exampleVars = this.getExampleEnvironmentVariables(options);
		await this.templateManager.renderTemplate(
			"devops/docker-compose/env/env.example.hbs",
			".env.example",
			{ variables: exampleVars },
		);
	}

	private async generateSwarmConfig(
		options: DockerComposeGeneratorOptions,
	): Promise<void> {
		const swarmConfig = {
			version: options.version,
			services: this.getSwarmServices(options.services),
			networks: {
				overlay_network: {
					driver: "overlay",
					attachable: true,
				},
			},
			volumes: this.getSwarmVolumes(options.volumes || []),
			secrets: this.transformSecrets(options.secrets || []),
			configs: this.transformConfigs(options.configs || []),
			deploy: {
				placement: {
					constraints: ["node.role == manager"],
				},
			},
		};

		await this.templateManager.renderTemplate(
			"devops/docker-compose/swarm/docker-compose.swarm.yml.hbs",
			"docker-compose.swarm.yml",
			swarmConfig,
		);

		// Generate Swarm deployment script
		const deployScript = `#!/bin/bash
set -e

echo "Deploying to Docker Swarm..."

# Initialize swarm if not already done
docker swarm init || true

# Create networks
docker network create --driver overlay traefik || true
docker network create --driver overlay monitoring || true
docker network create --driver overlay logging || true

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml ${options.projectName}

echo "Deployment completed!"
`;

		await this.templateManager.renderTemplate(
			"devops/docker-compose/swarm/deploy-swarm.sh.hbs",
			"scripts/deploy-swarm.sh",
			{ script: deployScript, executable: true },
		);
	}

	// Helper methods for transforming data
	private transformServices(
		services: readonly DockerComposeService[],
	): Record<string, any> {
		return services.reduce(
			(acc, service) => {
				acc[service.name] = {
					...service,
					// Remove name as it's used as the key
					name: undefined,
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private transformNetworks(
		networks: readonly DockerComposeNetwork[],
	): Record<string, any> {
		return networks.reduce(
			(acc, network) => {
				acc[network.name] = {
					...network,
					name: undefined,
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private transformVolumes(
		volumes: readonly DockerComposeVolume[],
	): Record<string, any> {
		return volumes.reduce(
			(acc, volume) => {
				acc[volume.name] = {
					...volume,
					name: undefined,
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private transformSecrets(
		secrets: readonly DockerComposeSecret[],
	): Record<string, any> {
		return secrets.reduce(
			(acc, secret) => {
				acc[secret.name] = {
					...secret,
					name: undefined,
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private transformConfigs(
		configs: readonly DockerComposeConfig[],
	): Record<string, any> {
		return configs.reduce(
			(acc, config) => {
				acc[config.name] = {
					...config,
					name: undefined,
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private getEnvironmentServiceOverrides(
		services: readonly DockerComposeService[],
		env: string,
	): Record<string, any> {
		// Return environment-specific service overrides
		return services.reduce(
			(acc, service) => {
				if (env === "development") {
					acc[service.name] = {
						volumes: [...(service.volumes || []), "./src:/app/src:ro"],
						environment: {
							...service.environment,
							NODE_ENV: "development",
							DEBUG: "*",
						},
					};
				} else if (env === "production") {
					acc[service.name] = {
						restart: "unless-stopped",
						deploy: {
							replicas: 3,
							resources: service.deploy?.resources || {
								limits: { memory: "512M" },
								reservations: { memory: "256M" },
							},
						},
					};
				}
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private getProductionNetworks(): Record<string, any> {
		return {
			frontend: {
				driver: "bridge",
			},
			backend: {
				driver: "bridge",
				internal: true,
			},
		};
	}

	private addDevelopmentServices(
		services: readonly DockerComposeService[],
	): DockerComposeService[] {
		return services.map((service) => ({
			...service,
			volumes: [
				...(service.volumes || []),
				"./src:/app/src:ro",
				"./package.json:/app/package.json:ro",
			],
			environment: {
				...service.environment,
				NODE_ENV: "development",
				DEBUG: "*",
			},
		}));
	}

	private getDevelopmentToolServices(): Record<string, any> {
		return {
			"redis-commander": {
				image: "rediscommander/redis-commander:latest",
				ports: ["8081:8081"],
				environment: {
					REDIS_HOSTS: "local:redis:6379",
				},
				dependsOn: ["redis"],
			},
			mailhog: {
				image: "mailhog/mailhog:latest",
				ports: ["1025:1025", "8025:8025"],
			},
		};
	}

	private getProductionServices(
		services: readonly DockerComposeService[],
	): Record<string, any> {
		return services.reduce(
			(acc, service) => {
				acc[service.name] = {
					...service,
					restart: "unless-stopped",
					logging: {
						driver: "json-file",
						options: {
							"max-size": "10m",
							"max-file": "3",
						},
					},
					deploy: {
						replicas: 3,
						resources: {
							limits: { memory: "512M", cpus: "0.5" },
							reservations: { memory: "256M", cpus: "0.25" },
						},
						updateConfig: {
							parallelism: 1,
							delay: "10s",
							order: "start-first",
						},
						rollbackConfig: {
							parallelism: 1,
							delay: "10s",
							order: "stop-first",
						},
						restartPolicy: {
							condition: "on-failure",
							delay: "5s",
							maxAttempts: 3,
						},
					},
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private getProductionVolumes(
		volumes: readonly DockerComposeVolume[],
	): Record<string, any> {
		const prodVolumes = this.transformVolumes(volumes);

		// Add production-specific volumes
		prodVolumes["nginx_cache"] = {};
		prodVolumes["ssl_certs"] = {};

		return prodVolumes;
	}

	private getSwarmServices(
		services: readonly DockerComposeService[],
	): Record<string, any> {
		return services.reduce(
			(acc, service) => {
				acc[service.name] = {
					...service,
					networks: ["overlay_network"],
					deploy: {
						mode: "replicated",
						replicas: 3,
						placement: {
							constraints: ["node.role == worker"],
						},
						resources: {
							limits: { memory: "512M", cpus: "0.5" },
							reservations: { memory: "256M", cpus: "0.25" },
						},
						updateConfig: {
							parallelism: 1,
							delay: "10s",
							order: "start-first",
						},
						rollbackConfig: {
							parallelism: 1,
							delay: "10s",
							order: "stop-first",
						},
						restartPolicy: {
							condition: "on-failure",
							delay: "5s",
							maxAttempts: 3,
						},
					},
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private getSwarmVolumes(
		volumes: readonly DockerComposeVolume[],
	): Record<string, any> {
		return volumes.reduce(
			(acc, volume) => {
				acc[volume.name] = {
					driver: "local",
					driverOpts: {
						type: "nfs",
						o: "addr=nfs-server,rw",
						device: `:/path/to/${volume.name}`,
					},
				};
				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private extractPort(portMapping?: string): number | undefined {
		if (!portMapping) return undefined;
		const match = portMapping.match(/(\d+):/);
		return match ? parseInt(match[1], 10) : undefined;
	}

	private generateStartScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash
set -e

ENV=\${1:-development}

echo "Starting ${options.projectName} in \$ENV environment..."

# Load environment variables
if [ -f ".env.\$ENV" ]; then
    export \$(cat .env.\$ENV | xargs)
fi

# Start services
if [ "\$ENV" = "production" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
elif [ "\$ENV" = "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
else
    docker-compose -f docker-compose.yml -f docker-compose.\$ENV.yml up -d
fi

echo "Services started successfully!"
docker-compose ps
`;
	}

	private generateStopScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash
set -e

echo "Stopping ${options.projectName}..."

docker-compose down

echo "Services stopped successfully!"
`;
	}

	private generateRestartScript(
		options: DockerComposeGeneratorOptions,
	): string {
		return `#!/bin/bash
set -e

ENV=\${1:-development}

echo "Restarting ${options.projectName}..."

./scripts/stop.sh
./scripts/start.sh \$ENV

echo "Services restarted successfully!"
`;
	}

	private generateLogsScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash

SERVICE=\${1:-""}
FOLLOW=\${2:-"--follow"}

if [ -n "\$SERVICE" ]; then
    docker-compose logs \$FOLLOW \$SERVICE
else
    docker-compose logs \$FOLLOW
fi
`;
	}

	private generateBackupScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash
set -e

TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/\$TIMESTAMP"

mkdir -p \$BACKUP_DIR

echo "Creating backup at \$BACKUP_DIR..."

# Backup volumes
docker-compose exec database pg_dump -U postgres database > \$BACKUP_DIR/database.sql
docker run --rm -v redis_data:/data -v \$BACKUP_DIR:/backup alpine tar czf /backup/redis.tar.gz -C /data .

echo "Backup completed!"
`;
	}

	private generateRestoreScript(
		options: DockerComposeGeneratorOptions,
	): string {
		return `#!/bin/bash
set -e

BACKUP_DIR=\${1:-""}

if [ -z "\$BACKUP_DIR" ]; then
    echo "Usage: ./scripts/restore.sh <backup_directory>"
    exit 1
fi

echo "Restoring from \$BACKUP_DIR..."

# Stop services
docker-compose down

# Restore volumes
if [ -f "\$BACKUP_DIR/database.sql" ]; then
    docker-compose up -d database
    sleep 10
    docker-compose exec -T database psql -U postgres database < \$BACKUP_DIR/database.sql
fi

if [ -f "\$BACKUP_DIR/redis.tar.gz" ]; then
    docker run --rm -v redis_data:/data -v \$BACKUP_DIR:/backup alpine tar xzf /backup/redis.tar.gz -C /data
fi

# Start all services
docker-compose up -d

echo "Restore completed!"
`;
	}

	private generateScaleScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash
set -e

SERVICE=\${1:-""}
REPLICAS=\${2:-1}

if [ -z "\$SERVICE" ]; then
    echo "Usage: ./scripts/scale.sh <service> <replicas>"
    exit 1
fi

echo "Scaling \$SERVICE to \$REPLICAS replicas..."

docker-compose up -d --scale \$SERVICE=\$REPLICAS

echo "Scaling completed!"
docker-compose ps
`;
	}

	private generateUpdateScript(options: DockerComposeGeneratorOptions): string {
		return `#!/bin/bash
set -e

echo "Updating ${options.projectName}..."

# Pull latest images
docker-compose pull

# Recreate services with new images
docker-compose up -d --force-recreate

# Clean up old images
docker image prune -f

echo "Update completed!"
docker-compose ps
`;
	}

	private getEnvironmentVariables(
		options: DockerComposeGeneratorOptions,
		env: string,
	): Record<string, string> {
		const baseVars = {
			PROJECT_NAME: options.projectName,
			ENVIRONMENT: env,
			COMPOSE_PROJECT_NAME: options.projectName,
		};

		if (env === "development") {
			return {
				...baseVars,
				DEBUG: "true",
				LOG_LEVEL: "debug",
				DATABASE_URL: "postgresql://user:password@localhost:5432/devdb",
				REDIS_URL: "redis://localhost:6379",
			};
		} else if (env === "production") {
			return {
				...baseVars,
				DEBUG: "false",
				LOG_LEVEL: "info",
				DATABASE_URL: "${DATABASE_URL}",
				REDIS_URL: "${REDIS_URL}",
				SECRET_KEY: "${SECRET_KEY}",
				API_KEY: "${API_KEY}",
			};
		}

		return baseVars;
	}

	private getExampleEnvironmentVariables(
		options: DockerComposeGeneratorOptions,
	): Record<string, string> {
		return {
			PROJECT_NAME: options.projectName,
			ENVIRONMENT: "development",
			DATABASE_URL: "postgresql://user:password@database:5432/mydb",
			REDIS_URL: "redis://redis:6379",
			SECRET_KEY: "your-secret-key-here",
			API_KEY: "your-api-key-here",
			GRAFANA_PASSWORD: "admin",
			BACKUP_S3_BUCKET: "your-backup-bucket",
			AWS_ACCESS_KEY_ID: "your-aws-access-key",
			AWS_SECRET_ACCESS_KEY: "your-aws-secret-key",
			ALERT_WEBHOOK_URL: "https://hooks.slack.com/your-webhook",
		};
	}
}

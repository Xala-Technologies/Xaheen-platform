import { BaseGenerator } from "../base.generator";
export interface DockerGeneratorOptions {
	readonly projectType:
		| "web"
		| "api"
		| "microservice"
		| "fullstack"
		| "worker"
		| "batch"
		| "cronjob";
	readonly runtime:
		| "node"
		| "python"
		| "go"
		| "java"
		| "dotnet"
		| "php"
		| "rust"
		| "alpine"
		| "distroless";
	readonly framework?: string;
	readonly enableMultiStage: boolean;
	readonly enableDevContainer: boolean;
	readonly enableSecurity: boolean;
	readonly enableHealthCheck: boolean;
	readonly enablePrometheus: boolean;
	readonly enableTracing: boolean;
	readonly enableLogging: boolean;
	readonly enableSecrets: boolean;
	readonly enableVulnerabilityScanning: boolean;
	readonly enableMultiArch: boolean;
	readonly enableCaching: boolean;
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
	readonly environment: "development" | "staging" | "production";
	readonly optimizeForSize: boolean;
	readonly enableNonRootUser: boolean;
	readonly customBuildArgs?: readonly string[];
	readonly secrets?: readonly string[];
	readonly buildSecrets?: readonly string[];
	readonly labels?: Record<string, string>;
	readonly environmentVariables?: Record<string, string>;
	readonly volumes?: readonly {
		readonly source: string;
		readonly target: string;
		readonly type: "bind" | "volume" | "tmpfs";
		readonly readonly?: boolean;
	}[];
	readonly networkMode?: "bridge" | "host" | "none" | "container" | string;
	readonly dependsOn?: readonly string[];
	readonly initProcess?: boolean;
	readonly oomKillDisable?: boolean;
	readonly privileged?: boolean;
	readonly readonlyRootfs?: boolean;
	readonly user?: string;
	readonly workingDir?: string;
	readonly entrypoint?: readonly string[];
	readonly command?: readonly string[];
}
export interface DockerConfig {
	readonly baseImage: string;
	readonly buildStages: readonly string[];
	readonly healthCheck: string;
	readonly securityScanning: boolean;
	readonly vulnerabilityScanning: boolean;
	readonly multiArchSupport: boolean;
	readonly cachingStrategy: "none" | "inline" | "registry" | "local";
	readonly buildContext: string;
	readonly ignorePatterns: readonly string[];
	readonly labels: Record<string, string>;
	readonly secrets: readonly string[];
	readonly buildSecrets: readonly string[];
	readonly networkMode: string;
	readonly volumes: ReadonlyArray<{
		readonly source: string;
		readonly target: string;
		readonly type: "bind" | "volume" | "tmpfs";
		readonly readonly?: boolean;
	}>;
	readonly environmentVariables: Record<string, string>;
	readonly initProcess: boolean;
	readonly oomKillDisable: boolean;
	readonly privileged: boolean;
	readonly readonlyRootfs: boolean;
	readonly user: string;
	readonly workingDir: string;
	readonly entrypoint: readonly string[];
	readonly command: readonly string[];
}
export declare class DockerGenerator extends BaseGenerator<DockerGeneratorOptions> {
	private readonly templateManager;
	private readonly analyzer;
	constructor();
	generate(options: DockerGeneratorOptions): Promise<void>;
	private validateOptions;
	private generateDockerConfig;
	private generateDockerfile;
	private generateDockerCompose;
	private generateDockerIgnore;
	private generateDevContainer;
	private generateBuildScripts;
	private generateSecurityScanning;
	private generateHealthCheck;
	private generatePrometheusConfig;
	private generateHealthCheckCommand;
	private getIgnorePatterns;
	private getEnvironmentVariables;
	private getDockerVolumes;
	private getVSCodeExtensions;
	private getPostCreateCommand;
	private generateBuildScript;
	private generateRunScript;
	private generatePushScript;
	private generateCleanScript;
	private getHealthCheckScript;
	private getHealthCheckEndpoint;
	/**
	 * Generate tracing configuration (Jaeger, OpenTelemetry)
	 */
	private generateTracingConfig;
	/**
	 * Generate logging configuration (Fluentd, Logstash)
	 */
	private generateLoggingConfig;
	/**
	 * Generate secrets management configuration
	 */
	private generateSecretsManagement;
	/**
	 * Generate vulnerability scanning configuration
	 */
	private generateVulnerabilityScanning;
	/**
	 * Generate multi-architecture build support
	 */
	private generateMultiArchSupport;
	/**
	 * Generate caching configuration
	 */
	private generateCachingConfig;
	/**
	 * Generate container registry integration
	 */
	private generateRegistryIntegration;
	/**
	 * Generate comprehensive observability stack
	 */
	private generateObservabilityStack;
}
//# sourceMappingURL=docker.generator.d.ts.map

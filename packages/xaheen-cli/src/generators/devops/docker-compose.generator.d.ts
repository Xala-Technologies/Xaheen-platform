import { BaseGenerator } from '../base.generator';
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
    readonly dependsOn?: readonly string[] | Record<string, {
        readonly condition: string;
    }>;
    readonly healthcheck?: {
        readonly test: string | readonly string[];
        readonly interval?: string;
        readonly timeout?: string;
        readonly retries?: number;
        readonly startPeriod?: string;
    };
    readonly restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
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
            readonly order?: 'start-first' | 'stop-first';
        };
        readonly rollbackConfig?: {
            readonly parallelism?: number;
            readonly delay?: string;
            readonly order?: 'start-first' | 'stop-first';
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
    readonly ulimits?: Record<string, number | {
        readonly soft: number;
        readonly hard: number;
    }>;
}
export interface DockerComposeNetwork {
    readonly name: string;
    readonly driver?: 'bridge' | 'overlay' | 'host' | 'none' | 'macvlan';
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
    readonly version: '3.8' | '3.9';
    readonly services: readonly DockerComposeService[];
    readonly networks?: readonly DockerComposeNetwork[];
    readonly volumes?: readonly DockerComposeVolume[];
    readonly secrets?: readonly DockerComposeSecret[];
    readonly configs?: readonly DockerComposeConfig[];
    readonly environment: 'development' | 'staging' | 'production';
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
export declare class DockerComposeGenerator extends BaseGenerator<DockerComposeGeneratorOptions> {
    private readonly templateManager;
    private readonly analyzer;
    constructor();
    generate(options: DockerComposeGeneratorOptions): Promise<void>;
    private validateOptions;
    private generateMainCompose;
    private generateEnvironmentOverrides;
    private generateDevelopmentCompose;
    private generateProductionCompose;
    private generateTraefikConfig;
    private generateObservabilityStack;
    private generateLoggingStack;
    private generateBackupConfig;
    private generateSSLConfig;
    private generateHelperScripts;
    private generateEnvironmentFiles;
    private generateSwarmConfig;
    private transformServices;
    private transformNetworks;
    private transformVolumes;
    private transformSecrets;
    private transformConfigs;
    private getEnvironmentServiceOverrides;
    private getProductionNetworks;
    private addDevelopmentServices;
    private getDevelopmentToolServices;
    private getProductionServices;
    private getProductionVolumes;
    private getSwarmServices;
    private getSwarmVolumes;
    private extractPort;
    private generateStartScript;
    private generateStopScript;
    private generateRestartScript;
    private generateLogsScript;
    private generateBackupScript;
    private generateRestoreScript;
    private generateScaleScript;
    private generateUpdateScript;
    private getEnvironmentVariables;
    private getExampleEnvironmentVariables;
}
//# sourceMappingURL=docker-compose.generator.d.ts.map
import { BaseGenerator } from '../base.generator';
export interface HelmValue {
    readonly key: string;
    readonly value: any;
    readonly description?: string;
    readonly type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
}
export interface HelmDependency {
    readonly name: string;
    readonly version: string;
    readonly repository: string;
    readonly condition?: string;
    readonly tags?: readonly string[];
    readonly import?: readonly string[];
    readonly alias?: string;
}
export interface HelmHook {
    readonly name: string;
    readonly hook: 'pre-install' | 'post-install' | 'pre-delete' | 'post-delete' | 'pre-upgrade' | 'post-upgrade' | 'pre-rollback' | 'post-rollback' | 'test';
    readonly weight?: number;
    readonly deletePolicy?: 'before-hook-creation' | 'hook-succeeded' | 'hook-failed';
}
export interface HelmTest {
    readonly name: string;
    readonly command: readonly string[];
    readonly image?: string;
    readonly env?: Record<string, string>;
}
export interface HelmGeneratorOptions {
    readonly chartName: string;
    readonly chartVersion: string;
    readonly appVersion: string;
    readonly apiVersion: 'v1' | 'v2';
    readonly type: 'application' | 'library';
    readonly description: string;
    readonly keywords?: readonly string[];
    readonly home?: string;
    readonly sources?: readonly string[];
    readonly maintainers?: ReadonlyArray<{
        readonly name: string;
        readonly email?: string;
        readonly url?: string;
    }>;
    readonly dependencies?: readonly HelmDependency[];
    readonly values: readonly HelmValue[];
    readonly hooks?: readonly HelmHook[];
    readonly tests?: readonly HelmTest[];
    readonly environment: 'development' | 'staging' | 'production';
    readonly namespace: string;
    readonly labels?: Record<string, string>;
    readonly annotations?: Record<string, string>;
    readonly image: {
        readonly repository: string;
        readonly tag: string;
        readonly pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
    };
    readonly service: {
        readonly type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
        readonly port: number;
        readonly targetPort?: number;
        readonly protocol?: 'TCP' | 'UDP';
    };
    readonly ingress?: {
        readonly enabled: boolean;
        readonly className?: string;
        readonly annotations?: Record<string, string>;
        readonly hosts: ReadonlyArray<{
            readonly host: string;
            readonly paths: ReadonlyArray<{
                readonly path: string;
                readonly pathType: 'Exact' | 'Prefix' | 'ImplementationSpecific';
            }>;
        }>;
        readonly tls?: ReadonlyArray<{
            readonly secretName: string;
            readonly hosts: readonly string[];
        }>;
    };
    readonly resources?: {
        readonly limits?: {
            readonly cpu?: string;
            readonly memory?: string;
        };
        readonly requests?: {
            readonly cpu?: string;
            readonly memory?: string;
        };
    };
    readonly autoscaling?: {
        readonly enabled: boolean;
        readonly minReplicas?: number;
        readonly maxReplicas?: number;
        readonly targetCPUUtilizationPercentage?: number;
        readonly targetMemoryUtilizationPercentage?: number;
    };
    readonly persistence?: {
        readonly enabled: boolean;
        readonly storageClass?: string;
        readonly accessMode?: 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany';
        readonly size?: string;
        readonly annotations?: Record<string, string>;
    };
    readonly security?: {
        readonly enabled: boolean;
        readonly runAsUser?: number;
        readonly runAsGroup?: number;
        readonly fsGroup?: number;
        readonly runAsNonRoot?: boolean;
        readonly readOnlyRootFilesystem?: boolean;
        readonly allowPrivilegeEscalation?: boolean;
        readonly capabilities?: {
            readonly add?: readonly string[];
            readonly drop?: readonly string[];
        };
    };
    readonly monitoring?: {
        readonly enabled: boolean;
        readonly serviceMonitor?: boolean;
        readonly prometheusRule?: boolean;
        readonly grafanaDashboard?: boolean;
    };
    readonly backup?: {
        readonly enabled: boolean;
        readonly schedule?: string;
        readonly retention?: string;
        readonly storageClass?: string;
    };
}
export declare class HelmGenerator extends BaseGenerator<HelmGeneratorOptions> {
    private readonly templateManager;
    private readonly analyzer;
    constructor();
    generate(options: HelmGeneratorOptions): Promise<void>;
    private validateOptions;
    private createChartStructure;
    private generateChartYaml;
    private generateValuesYaml;
    private generateValuesSchema;
    private generateTemplates;
    private generateHelpers;
    private generateNotes;
    private generateHooks;
    private generateTests;
    private generateEnvironmentValues;
    private generateDeploymentScripts;
    private generateCIPipelines;
    private generateMonitoring;
    private generateBackup;
    private generateSecurity;
    private generateReadme;
    private transformHelmValues;
    private getEnvironmentSpecificValues;
    private generateInstallScript;
    private generateUpgradeScript;
    private generateRollbackScript;
    private generateUninstallScript;
    private generateTestScript;
    private generateLintScript;
    private generatePackageScript;
    private generateDeployScript;
}
//# sourceMappingURL=helm.generator.d.ts.map
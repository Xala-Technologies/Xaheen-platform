import { BaseGenerator } from '../base.generator';
export interface KubernetesGeneratorOptions {
    readonly appName: string;
    readonly namespace: string;
    readonly image: string;
    readonly imageTag: string;
    readonly port: number;
    readonly targetPort: number;
    readonly replicas: number;
    readonly environment: 'development' | 'staging' | 'production';
    readonly enableIngress: boolean;
    readonly enableHPA: boolean;
    readonly enableVPA: boolean;
    readonly enablePDB: boolean;
    readonly enableConfigMap: boolean;
    readonly enableSecrets: boolean;
    readonly enableServiceMesh: boolean;
    readonly enablePrometheus: boolean;
    readonly enableLogging: boolean;
    readonly enableTracing: boolean;
    readonly enableNetworkPolicies: boolean;
    readonly enablePodSecurityPolicies: boolean;
    readonly enableHelm: boolean;
    readonly enableIstio: boolean;
    readonly enableArgoCD: boolean;
    readonly enableFluxCD: boolean;
    readonly enableKeda: boolean;
    readonly enableCertManager: boolean;
    readonly enableExternalSecrets: boolean;
    readonly enableMultiCluster: boolean;
    readonly clusterIssuer?: string;
    readonly ingressClassName?: string;
    readonly hostName?: string;
    readonly tlsSecretName?: string;
    readonly resources: {
        readonly requests: {
            readonly cpu: string;
            readonly memory: string;
        };
        readonly limits: {
            readonly cpu: string;
            readonly memory: string;
        };
    };
    readonly hpa: {
        readonly minReplicas: number;
        readonly maxReplicas: number;
        readonly targetCPUUtilization: number;
        readonly targetMemoryUtilization: number;
    };
    readonly probes: {
        readonly liveness: {
            readonly path: string;
            readonly initialDelaySeconds: number;
            readonly periodSeconds: number;
        };
        readonly readiness: {
            readonly path: string;
            readonly initialDelaySeconds: number;
            readonly periodSeconds: number;
        };
    };
    readonly storage?: {
        readonly enabled: boolean;
        readonly size: string;
        readonly storageClass: string;
        readonly accessMode: 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany';
    };
    readonly configMapData?: Record<string, string>;
    readonly secrets?: Record<string, string>;
    readonly annotations?: Record<string, string>;
    readonly labels?: Record<string, string>;
}
export interface KubernetesManifests {
    readonly deployment: any;
    readonly service: any;
    readonly ingress?: any;
    readonly hpa?: any;
    readonly vpa?: any;
    readonly pdb?: any;
    readonly configMap?: any;
    readonly secrets?: any;
    readonly networkPolicy?: any;
    readonly podSecurityPolicy?: any;
    readonly serviceAccount?: any;
    readonly rbac?: any;
    readonly pvc?: any;
    readonly kedaScaler?: any;
    readonly certManager?: any;
    readonly externalSecrets?: any;
    readonly argoApplication?: any;
    readonly fluxKustomization?: any;
}
export declare class KubernetesGenerator extends BaseGenerator<KubernetesGeneratorOptions> {
    private readonly templateManager;
    private readonly analyzer;
    constructor();
    generate(options: KubernetesGeneratorOptions): Promise<void>;
    private validateOptions;
    private generateManifests;
    private createDeploymentManifest;
    private createServiceManifest;
    private createIngressManifest;
    private createHPAManifest;
    private createConfigMapManifest;
    private createSecretsManifest;
    private createNetworkPolicyManifest;
    private createPodSecurityPolicyManifest;
    private createServiceAccountManifest;
    private createRBACManifest;
    private generateNamespace;
    private generateDeployment;
    private generateService;
    private generateIngress;
    private generateHPA;
    private generateConfigMap;
    private generateSecrets;
    private generateNetworkPolicy;
    private generatePodSecurityPolicy;
    private generateServiceMesh;
    private generateMonitoring;
    private generateLogging;
    private generateHelmChart;
    private generateKustomization;
    private generateDeploymentScripts;
    private getEnvironmentVariables;
    private getVolumeMounts;
    private getVolumes;
    /**
     * Generate VPA (Vertical Pod Autoscaler) manifest
     */
    private generateVPA;
    /**
     * Generate PDB (Pod Disruption Budget) manifest
     */
    private generatePDB;
    /**
     * Generate KEDA ScaledObject
     */
    private generateKedaScaler;
    /**
     * Generate Cert-Manager Certificate
     */
    private generateCertManager;
    /**
     * Generate External Secrets configuration
     */
    private generateExternalSecrets;
    /**
     * Generate ArgoCD Application
     */
    private generateArgoApplication;
    /**
     * Generate FluxCD Kustomization
     */
    private generateFluxKustomization;
    /**
     * Generate tracing configuration
     */
    private generateTracingConfig;
    /**
     * Generate multi-cluster configuration
     */
    private generateMultiClusterConfig;
    /**
     * Generate GitOps workflows
     */
    private generateGitOpsWorkflows;
    /**
     * Generate security policies
     */
    private generateSecurityPolicies;
    /**
     * Generate disaster recovery configuration
     */
    private generateDisasterRecovery;
    private createVPAManifest;
    private createPDBManifest;
    private createPVCManifest;
    private createKedaScalerManifest;
    private createCertManagerManifest;
    private createExternalSecretsManifest;
    private createArgoApplicationManifest;
    private createFluxKustomizationManifest;
}
//# sourceMappingURL=kubernetes.generator.d.ts.map
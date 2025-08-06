/**
 * GCP Networking Service Implementation
 * Handles VPC, Load Balancer, and Firewall following Single Responsibility Principle
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index";
import { 
  IGCPNetworkingService, 
  ValidationResult,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig, 
  GCPNetworkingConfig
} from "../interfaces/index.js";
import { BaseGCPService } from "./base-service";

export class GCPNetworkingService extends BaseGCPService implements IGCPNetworkingService {
  private readonly networkingConfig: GCPNetworkingConfig;

  constructor(
    baseConfig: GCPBaseConfig,
    networkingConfig: GCPNetworkingConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.networkingConfig = networkingConfig;
  }

  get name(): string {
    return "gcp-networking";
  }

  isEnabled(): boolean {
    return this.networkingConfig.vpc.enabled || 
           this.networkingConfig.loadBalancer.enabled ||
           this.networkingConfig.firewall.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.networkingConfig.vpc.enabled) {
      files.push(...await this.generateVPC(outputDir));
    }

    if (this.networkingConfig.loadBalancer.enabled) {
      files.push(...await this.generateLoadBalancer(outputDir));
    }

    if (this.networkingConfig.firewall.enabled) {
      files.push(...await this.generateFirewall(outputDir));
    }

    return files;
  }

  async generateVPC(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/vpc.tf`,
        "# VPC Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateLoadBalancer(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/load-balancer.tf`,
        "# Load Balancer Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateFirewall(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/firewall.tf`,
        "# Firewall Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async validateNetworkingConfig(): Promise<ValidationResult> {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  protected async validateServiceConfig(): Promise<ValidationResult> {
    return this.validateNetworkingConfig();
  }
}
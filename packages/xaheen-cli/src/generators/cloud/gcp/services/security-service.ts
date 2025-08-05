/**
 * GCP Security Service Implementation
 * Handles Firebase Auth, IAM, and Secret Manager following Single Responsibility Principle
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index.js";
import { 
  IGCPSecurityService, 
  ValidationResult,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig, 
  GCPSecurityConfig
} from "../interfaces/index.js";
import { BaseGCPService } from "./base-service.js";

export class GCPSecurityService extends BaseGCPService implements IGCPSecurityService {
  private readonly securityConfig: GCPSecurityConfig;

  constructor(
    baseConfig: GCPBaseConfig,
    securityConfig: GCPSecurityConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.securityConfig = securityConfig;
  }

  get name(): string {
    return "gcp-security";
  }

  isEnabled(): boolean {
    return this.securityConfig.firebaseAuth.enabled || 
           this.securityConfig.iam.serviceAccounts.length > 0 ||
           this.securityConfig.secretManager.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.securityConfig.firebaseAuth.enabled) {
      files.push(...await this.generateFirebaseAuth(outputDir));
    }

    if (this.securityConfig.iam.serviceAccounts.length > 0) {
      files.push(...await this.generateIAM(outputDir));
    }

    if (this.securityConfig.secretManager.enabled) {
      files.push(...await this.generateSecretManager(outputDir));
    }

    return files;
  }

  async generateFirebaseAuth(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/firebase-auth.tf`,
        "# Firebase Auth Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateIAM(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/iam.tf`,
        "# IAM Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async generateSecretManager(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    return [
      this.createFile(
        `${outputDir}/terraform/secret-manager.tf`,
        "# Secret Manager Terraform configuration (placeholder)",
        "terraform"
      )
    ];
  }

  async validateSecurityConfig(): Promise<ValidationResult> {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  protected async validateServiceConfig(): Promise<ValidationResult> {
    return this.validateSecurityConfig();
  }
}
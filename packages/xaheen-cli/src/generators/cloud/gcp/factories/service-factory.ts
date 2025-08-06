/**
 * GCP Service Factory Implementation
 * Following Factory Pattern and Dependency Inversion Principle
 */

import { 
  IGCPServiceFactory,
  IGCPComputeService,
  IGCPStorageService,
  IGCPSecurityService,
  IGCPNetworkingService,
  IGCPObservabilityService,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig,
  GCPComputeConfig,
  GCPStorageConfig,
  GCPSecurityConfig,
  GCPNetworkingConfig,
  GCPObservabilityConfig
} from "../interfaces/index.js";
import { GCPComputeService } from "../services/compute-service";
import { GCPStorageService } from "../services/storage-service";
import { GCPSecurityService } from "../services/security-service";
import { GCPNetworkingService } from "../services/networking-service";
import { GCPObservabilityService } from "../services/observability-service";
import { GCPTemplateGenerator } from "../templates/template-generator";
import { GCPConfigurationManager } from "../config/configuration-manager";

export class GCPServiceFactory implements IGCPServiceFactory {
  private readonly baseConfig: GCPBaseConfig;
  private readonly templateGenerator: IGCPTemplateGenerator;
  private readonly configManager: IGCPConfigurationManager;

  constructor(baseConfig: GCPBaseConfig) {
    this.baseConfig = baseConfig;
    this.templateGenerator = new GCPTemplateGenerator();
    this.configManager = new GCPConfigurationManager();
  }

  createComputeService(config: GCPComputeConfig): IGCPComputeService {
    return new GCPComputeService(
      this.baseConfig,
      config,
      this.templateGenerator,
      this.configManager
    );
  }

  createStorageService(config: GCPStorageConfig): IGCPStorageService {
    return new GCPStorageService(
      this.baseConfig,
      config,
      this.templateGenerator,
      this.configManager
    );
  }

  createSecurityService(config: GCPSecurityConfig): IGCPSecurityService {
    return new GCPSecurityService(
      this.baseConfig,
      config,
      this.templateGenerator,
      this.configManager
    );
  }

  createNetworkingService(config: GCPNetworkingConfig): IGCPNetworkingService {
    return new GCPNetworkingService(
      this.baseConfig,
      config,
      this.templateGenerator,
      this.configManager
    );
  }

  createObservabilityService(config: GCPObservabilityConfig): IGCPObservabilityService {
    return new GCPObservabilityService(
      this.baseConfig,
      config,
      this.templateGenerator,
      this.configManager
    );
  }

  // Static factory method for easy instantiation
  static create(baseConfig: GCPBaseConfig): GCPServiceFactory {
    return new GCPServiceFactory(baseConfig);
  }

  // Method to create all services at once
  createAllServices(config: {
    compute: GCPComputeConfig;
    storage: GCPStorageConfig;
    security: GCPSecurityConfig;
    networking: GCPNetworkingConfig;
    observability: GCPObservabilityConfig;
  }): {
    compute: IGCPComputeService;
    storage: IGCPStorageService;
    security: IGCPSecurityService;
    networking: IGCPNetworkingService;
    observability: IGCPObservabilityService;
  } {
    return {
      compute: this.createComputeService(config.compute),
      storage: this.createStorageService(config.storage),
      security: this.createSecurityService(config.security),
      networking: this.createNetworkingService(config.networking),
      observability: this.createObservabilityService(config.observability)
    };
  }

  // Method to create services based on what's enabled
  createEnabledServices(config: {
    compute?: GCPComputeConfig;
    storage?: GCPStorageConfig;
    security?: GCPSecurityConfig;
    networking?: GCPNetworkingConfig;
    observability?: GCPObservabilityConfig;
  }): {
    compute?: IGCPComputeService;
    storage?: IGCPStorageService;
    security?: IGCPSecurityService;
    networking?: IGCPNetworkingService;
    observability?: IGCPObservabilityService;
  } {
    const services: Record<string, any> = {};

    if (config.compute && (config.compute.cloudFunctions.enabled || config.compute.cloudRun.enabled)) {
      services.compute = this.createComputeService(config.compute);
    }

    if (config.storage && (config.storage.cloudStorage.enabled || config.storage.firestore.enabled)) {
      services.storage = this.createStorageService(config.storage);
    }

    if (config.security && (config.security.firebaseAuth.enabled || config.security.iam.serviceAccounts.length > 0)) {
      services.security = this.createSecurityService(config.security);
    }

    if (config.networking && (config.networking.vpc.enabled || config.networking.loadBalancer.enabled)) {
      services.networking = this.createNetworkingService(config.networking);
    }

    if (config.observability && (config.observability.monitoring.enabled || config.observability.logging.enabled)) {
      services.observability = this.createObservabilityService(config.observability);
    }

    return services;
  }
}
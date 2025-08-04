import { BaseGenerator } from '../base.generator';
import { GeneratorOptions, FileOperation } from '../../types';
import { join } from 'path';

interface AzureGeneratorOptions extends GeneratorOptions {
  readonly servicesToGenerate: readonly AzureService[];
  readonly resourceGroupName: string;
  readonly location: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly subscriptionId: string;
  readonly tenantId: string;
  readonly useEntraId: boolean;
  readonly enableDiagnostics: boolean;
  readonly enableKeyVault: boolean;
  readonly enableServiceBus: boolean;
  readonly enableSqlDatabase: boolean;
  readonly enableAzureFunctions: boolean;
  readonly enableDevOps: boolean;
  readonly enableAiServices: boolean;
  readonly aiServices?: readonly AzureAiService[];
  readonly customDomain?: string;
  readonly tags?: Record<string, string>;
}

type AzureService = 
  | 'functions'
  | 'service-bus'
  | 'sql-database'
  | 'active-directory'
  | 'key-vault'
  | 'devops-pipelines'
  | 'ai-services'
  | 'app-service'
  | 'storage-account'
  | 'cosmos-db'
  | 'redis-cache'
  | 'application-insights'
  | 'log-analytics'
  | 'api-management'
  | 'event-grid'
  | 'event-hubs'
  | 'notification-hubs'
  | 'search-service'
  | 'container-registry'
  | 'kubernetes-service';

type AzureAiService = 
  | 'openai'
  | 'cognitive-services'
  | 'document-intelligence'
  | 'speech'
  | 'vision'
  | 'language'
  | 'translator'
  | 'bot-service'
  | 'machine-learning'
  | 'custom-vision';

export class AzureGenerator extends BaseGenerator {
  readonly name = 'azure';
  readonly description = 'Generate Azure cloud infrastructure and services with comprehensive coverage';

  constructor() {
    super();
  }

  async generate(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    try {
      this.validateOptions(options);
      
      const operations: FileOperation[] = [];
      
      // Generate base Azure configuration
      operations.push(...await this.generateBaseConfiguration(options));
      
      // Generate selected services
      for (const service of options.servicesToGenerate) {
        operations.push(...await this.generateService(service, options));
      }
      
      // Generate infrastructure as code (Terraform/ARM)
      operations.push(...await this.generateInfrastructure(options));
      
      // Generate deployment scripts
      operations.push(...await this.generateDeploymentScripts(options));
      
      // Generate monitoring and diagnostics
      if (options.enableDiagnostics) {
        operations.push(...await this.generateMonitoring(options));
      }
      
      // Generate security configurations
      operations.push(...await this.generateSecurityConfig(options));
      
      // Generate DevOps pipelines
      if (options.enableDevOps) {
        operations.push(...await this.generateDevOpsPipelines(options));
      }
      
      return operations;
    } catch (error) {
      throw new Error(`Azure generator failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateOptions(options: AzureGeneratorOptions): void {
    if (!options.servicesToGenerate || options.servicesToGenerate.length === 0) {
      throw new Error('At least one Azure service must be selected');
    }
    
    if (!options.resourceGroupName) {
      throw new Error('Resource group name is required');
    }
    
    if (!options.location) {
      throw new Error('Azure location is required');
    }
    
    if (!options.subscriptionId) {
      throw new Error('Azure subscription ID is required');
    }
    
    if (!options.tenantId) {
      throw new Error('Azure tenant ID is required');
    }
    
    if (options.enableAiServices && (!options.aiServices || options.aiServices.length === 0)) {
      throw new Error('AI services must be specified when AI services are enabled');
    }
  }

  private async generateBaseConfiguration(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Azure configuration file
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'azure.config.ts'),
      content: await this.renderTemplate('cloud/azure/configs/azure.config.ts.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        environment: options.environment,
        subscriptionId: options.subscriptionId,
        tenantId: options.tenantId,
        useEntraId: options.useEntraId,
        enableDiagnostics: options.enableDiagnostics,
        customDomain: options.customDomain,
        tags: options.tags || {}
      })
    });
    
    // Azure client factory
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'azure-client.factory.ts'),
      content: await this.renderTemplate('cloud/azure/core/azure-client.factory.ts.hbs', {
        subscriptionId: options.subscriptionId,
        tenantId: options.tenantId,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Azure types
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'types/azure.types.ts'),
      content: await this.renderTemplate('cloud/azure/types/azure.types.ts.hbs', {
        servicesToGenerate: options.servicesToGenerate,
        aiServices: options.aiServices || []
      })
    });
    
    // Environment configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, '.env.azure.example'),
      content: await this.renderTemplate('cloud/azure/configs/env.azure.example.hbs', {
        subscriptionId: options.subscriptionId,
        tenantId: options.tenantId,
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        environment: options.environment
      })
    });
    
    // Package.json dependencies
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'package.azure.json'),
      content: await this.renderTemplate('cloud/azure/configs/package.azure.json.hbs', {
        servicesToGenerate: options.servicesToGenerate,
        enableAiServices: options.enableAiServices,
        aiServices: options.aiServices || []
      })
    });
    
    return operations;
  }

  private async generateService(service: AzureService, options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    switch (service) {
      case 'functions':
        if (options.enableAzureFunctions) {
          operations.push(...await this.generateAzureFunctions(options));
        }
        break;
        
      case 'service-bus':
        if (options.enableServiceBus) {
          operations.push(...await this.generateServiceBus(options));
        }
        break;
        
      case 'sql-database':
        if (options.enableSqlDatabase) {
          operations.push(...await this.generateSqlDatabase(options));
        }
        break;
        
      case 'active-directory':
        if (options.useEntraId) {
          operations.push(...await this.generateActiveDirectory(options));
        }
        break;
        
      case 'key-vault':
        if (options.enableKeyVault) {
          operations.push(...await this.generateKeyVault(options));
        }
        break;
        
      case 'ai-services':
        if (options.enableAiServices) {
          operations.push(...await this.generateAiServices(options));
        }
        break;
        
      case 'app-service':
        operations.push(...await this.generateAppService(options));
        break;
        
      case 'storage-account':
        operations.push(...await this.generateStorageAccount(options));
        break;
        
      case 'cosmos-db':
        operations.push(...await this.generateCosmosDb(options));
        break;
        
      case 'redis-cache':
        operations.push(...await this.generateRedisCache(options));
        break;
        
      case 'application-insights':
        operations.push(...await this.generateApplicationInsights(options));
        break;
        
      case 'log-analytics':
        operations.push(...await this.generateLogAnalytics(options));
        break;
        
      case 'api-management':
        operations.push(...await this.generateApiManagement(options));
        break;
        
      case 'event-grid':
        operations.push(...await this.generateEventGrid(options));
        break;
        
      case 'event-hubs':
        operations.push(...await this.generateEventHubs(options));
        break;
        
      case 'notification-hubs':
        operations.push(...await this.generateNotificationHubs(options));
        break;
        
      case 'search-service':
        operations.push(...await this.generateSearchService(options));
        break;
        
      case 'container-registry':
        operations.push(...await this.generateContainerRegistry(options));
        break;
        
      case 'kubernetes-service':
        operations.push(...await this.generateKubernetesService(options));
        break;
    }
    
    return operations;
  }

  private async generateAzureFunctions(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Function app configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'functions/host.json'),
      content: await this.renderTemplate('cloud/azure/functions/host.json.hbs', {
        environment: options.environment,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Function app local settings
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'functions/local.settings.json'),
      content: await this.renderTemplate('cloud/azure/functions/local.settings.json.hbs', {
        subscriptionId: options.subscriptionId,
        resourceGroupName: options.resourceGroupName
      })
    });
    
    // HTTP trigger function
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'functions/src/http-trigger.ts'),
      content: await this.renderTemplate('cloud/azure/functions/http-trigger.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableServiceBus: options.enableServiceBus
      })
    });
    
    // Timer trigger function
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'functions/src/timer-trigger.ts'),
      content: await this.renderTemplate('cloud/azure/functions/timer-trigger.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Service Bus trigger function
    if (options.enableServiceBus) {
      operations.push({
        type: 'create',
        path: join(options.outputPath, 'functions/src/service-bus-trigger.ts'),
        content: await this.renderTemplate('cloud/azure/functions/service-bus-trigger.ts.hbs', {
          enableDiagnostics: options.enableDiagnostics
        })
      });
    }
    
    // Function utilities
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'functions/src/utils/function-utils.ts'),
      content: await this.renderTemplate('cloud/azure/functions/utils/function-utils.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateServiceBus(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Service Bus client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'service-bus/service-bus.client.ts'),
      content: await this.renderTemplate('cloud/azure/service-bus/service-bus.client.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics,
        enableKeyVault: options.enableKeyVault
      })
    });
    
    // Message sender
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'service-bus/message-sender.ts'),
      content: await this.renderTemplate('cloud/azure/service-bus/message-sender.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Message receiver
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'service-bus/message-receiver.ts'),
      content: await this.renderTemplate('cloud/azure/service-bus/message-receiver.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Dead letter handler
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'service-bus/dead-letter-handler.ts'),
      content: await this.renderTemplate('cloud/azure/service-bus/dead-letter-handler.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateSqlDatabase(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Database connection
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'database/azure-sql.connection.ts'),
      content: await this.renderTemplate('cloud/azure/database/azure-sql.connection.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Entity Framework setup
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'database/entity-framework.setup.ts'),
      content: await this.renderTemplate('cloud/azure/database/entity-framework.setup.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Database migrations
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'database/migrations/initial-migration.ts'),
      content: await this.renderTemplate('cloud/azure/database/migrations/initial-migration.ts.hbs', {
        environment: options.environment
      })
    });
    
    // Database repository pattern
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'database/repositories/base.repository.ts'),
      content: await this.renderTemplate('cloud/azure/database/repositories/base.repository.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateActiveDirectory(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Azure AD authentication
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'auth/azure-ad.auth.ts'),
      content: await this.renderTemplate('cloud/azure/auth/azure-ad.auth.ts.hbs', {
        tenantId: options.tenantId,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // JWT token validation
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'auth/jwt-validator.ts'),
      content: await this.renderTemplate('cloud/azure/auth/jwt-validator.ts.hbs', {
        tenantId: options.tenantId,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Role-based access control
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'auth/rbac.middleware.ts'),
      content: await this.renderTemplate('cloud/azure/auth/rbac.middleware.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Graph API client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'auth/graph-api.client.ts'),
      content: await this.renderTemplate('cloud/azure/auth/graph-api.client.ts.hbs', {
        tenantId: options.tenantId,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateKeyVault(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Key Vault client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'key-vault/key-vault.client.ts'),
      content: await this.renderTemplate('cloud/azure/key-vault/key-vault.client.ts.hbs', {
        tenantId: options.tenantId,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Secrets manager
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'key-vault/secrets.manager.ts'),
      content: await this.renderTemplate('cloud/azure/key-vault/secrets.manager.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Certificates manager
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'key-vault/certificates.manager.ts'),
      content: await this.renderTemplate('cloud/azure/key-vault/certificates.manager.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Key encryption manager
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'key-vault/encryption.manager.ts'),
      content: await this.renderTemplate('cloud/azure/key-vault/encryption.manager.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateAiServices(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    if (!options.aiServices) {
      return operations;
    }
    
    for (const aiService of options.aiServices) {
      operations.push(...await this.generateAiService(aiService, options));
    }
    
    // AI services factory
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'ai-services/ai-services.factory.ts'),
      content: await this.renderTemplate('cloud/azure/ai-services/ai-services.factory.ts.hbs', {
        aiServices: options.aiServices,
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateAiService(service: AzureAiService, options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    switch (service) {
      case 'openai':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/openai/azure-openai.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/openai/azure-openai.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'cognitive-services':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/cognitive-services/cognitive-services.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/cognitive-services/cognitive-services.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'document-intelligence':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/document-intelligence/document-intelligence.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/document-intelligence/document-intelligence.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'speech':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/speech/speech.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/speech/speech.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'vision':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/vision/vision.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/vision/vision.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'language':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/language/language.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/language/language.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'translator':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/translator/translator.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/translator/translator.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'bot-service':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/bot-service/bot-service.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/bot-service/bot-service.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'machine-learning':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/machine-learning/ml.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/machine-learning/ml.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
        
      case 'custom-vision':
        operations.push({
          type: 'create',
          path: join(options.outputPath, 'ai-services/custom-vision/custom-vision.client.ts'),
          content: await this.renderTemplate('cloud/azure/ai-services/custom-vision/custom-vision.client.ts.hbs', {
            enableKeyVault: options.enableKeyVault,
            enableDiagnostics: options.enableDiagnostics
          })
        });
        break;
    }
    
    return operations;
  }

  private async generateAppService(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // App Service configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'app-service/app-service.config.ts'),
      content: await this.renderTemplate('cloud/azure/app-service/app-service.config.ts.hbs', {
        environment: options.environment,
        enableDiagnostics: options.enableDiagnostics,
        customDomain: options.customDomain
      })
    });
    
    // Deployment slots configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'app-service/deployment-slots.config.ts'),
      content: await this.renderTemplate('cloud/azure/app-service/deployment-slots.config.ts.hbs', {
        environment: options.environment
      })
    });
    
    return operations;
  }

  private async generateStorageAccount(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Storage client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'storage/storage.client.ts'),
      content: await this.renderTemplate('cloud/azure/storage/storage.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    // Blob storage operations
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'storage/blob-storage.service.ts'),
      content: await this.renderTemplate('cloud/azure/storage/blob-storage.service.ts.hbs', {
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateCosmosDb(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Cosmos DB client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'cosmos-db/cosmos-db.client.ts'),
      content: await this.renderTemplate('cloud/azure/cosmos-db/cosmos-db.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateRedisCache(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Redis cache client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'redis-cache/redis-cache.client.ts'),
      content: await this.renderTemplate('cloud/azure/redis-cache/redis-cache.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateApplicationInsights(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Application Insights client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'monitoring/application-insights.client.ts'),
      content: await this.renderTemplate('cloud/azure/monitoring/application-insights.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault
      })
    });
    
    return operations;
  }

  private async generateLogAnalytics(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Log Analytics client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'monitoring/log-analytics.client.ts'),
      content: await this.renderTemplate('cloud/azure/monitoring/log-analytics.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault
      })
    });
    
    return operations;
  }

  private async generateApiManagement(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // API Management configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'api-management/apim.config.ts'),
      content: await this.renderTemplate('cloud/azure/api-management/apim.config.ts.hbs', {
        customDomain: options.customDomain,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateEventGrid(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Event Grid client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'event-grid/event-grid.client.ts'),
      content: await this.renderTemplate('cloud/azure/event-grid/event-grid.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateEventHubs(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Event Hubs client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'event-hubs/event-hubs.client.ts'),
      content: await this.renderTemplate('cloud/azure/event-hubs/event-hubs.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateNotificationHubs(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Notification Hubs client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'notification-hubs/notification-hubs.client.ts'),
      content: await this.renderTemplate('cloud/azure/notification-hubs/notification-hubs.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateSearchService(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Search service client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'search-service/search-service.client.ts'),
      content: await this.renderTemplate('cloud/azure/search-service/search-service.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateContainerRegistry(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Container Registry client
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'container-registry/acr.client.ts'),
      content: await this.renderTemplate('cloud/azure/container-registry/acr.client.ts.hbs', {
        enableKeyVault: options.enableKeyVault,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateKubernetesService(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // AKS configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'kubernetes-service/aks.config.ts'),
      content: await this.renderTemplate('cloud/azure/kubernetes-service/aks.config.ts.hbs', {
        environment: options.environment,
        enableDiagnostics: options.enableDiagnostics
      })
    });
    
    return operations;
  }

  private async generateInfrastructure(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Terraform main configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'infrastructure/terraform/main.tf'),
      content: await this.renderTemplate('cloud/azure/infrastructure/terraform/main.tf.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        servicesToGenerate: options.servicesToGenerate,
        environment: options.environment,
        tags: options.tags || {}
      })
    });
    
    // ARM template
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'infrastructure/arm/azuredeploy.json'),
      content: await this.renderTemplate('cloud/azure/infrastructure/arm/azuredeploy.json.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        servicesToGenerate: options.servicesToGenerate,
        environment: options.environment
      })
    });
    
    // Bicep template
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'infrastructure/bicep/main.bicep'),
      content: await this.renderTemplate('cloud/azure/infrastructure/bicep/main.bicep.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        servicesToGenerate: options.servicesToGenerate,
        environment: options.environment
      })
    });
    
    return operations;
  }

  private async generateDeploymentScripts(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // PowerShell deployment script
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'scripts/deploy.ps1'),
      content: await this.renderTemplate('cloud/azure/scripts/deploy.ps1.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        subscriptionId: options.subscriptionId,
        environment: options.environment
      })
    });
    
    // Bash deployment script
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'scripts/deploy.sh'),
      content: await this.renderTemplate('cloud/azure/scripts/deploy.sh.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        subscriptionId: options.subscriptionId,
        environment: options.environment
      })
    });
    
    return operations;
  }

  private async generateMonitoring(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Monitoring dashboard
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'monitoring/dashboard.json'),
      content: await this.renderTemplate('cloud/azure/monitoring/dashboard.json.hbs', {
        resourceGroupName: options.resourceGroupName,
        servicesToGenerate: options.servicesToGenerate
      })
    });
    
    // Alerts configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'monitoring/alerts.config.ts'),
      content: await this.renderTemplate('cloud/azure/monitoring/alerts.config.ts.hbs', {
        servicesToGenerate: options.servicesToGenerate,
        environment: options.environment
      })
    });
    
    return operations;
  }

  private async generateSecurityConfig(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Security configuration
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'security/security.config.ts'),
      content: await this.renderTemplate('cloud/azure/security/security.config.ts.hbs', {
        useEntraId: options.useEntraId,
        enableKeyVault: options.enableKeyVault,
        environment: options.environment
      })
    });
    
    // Network security groups
    operations.push({
      type: 'create',
      path: join(options.outputPath, 'security/network-security-groups.tf'),
      content: await this.renderTemplate('cloud/azure/security/network-security-groups.tf.hbs', {
        resourceGroupName: options.resourceGroupName,
        location: options.location,
        environment: options.environment
      })
    });
    
    return operations;
  }

  private async generateDevOpsPipelines(options: AzureGeneratorOptions): Promise<readonly FileOperation[]> {
    const operations: FileOperation[] = [];
    
    // Azure DevOps build pipeline
    operations.push({
      type: 'create',
      path: join(options.outputPath, '.azure-pipelines/build.yml'),
      content: await this.renderTemplate('cloud/azure/devops/build.yml.hbs', {
        servicesToGenerate: options.servicesToGenerate,
        environment: options.environment
      })
    });
    
    // Azure DevOps deployment pipeline
    operations.push({
      type: 'create',
      path: join(options.outputPath, '.azure-pipelines/deploy.yml'),
      content: await this.renderTemplate('cloud/azure/devops/deploy.yml.hbs', {
        resourceGroupName: options.resourceGroupName,
        subscriptionId: options.subscriptionId,
        environment: options.environment
      })
    });
    
    // GitHub Actions workflow
    operations.push({
      type: 'create',
      path: join(options.outputPath, '.github/workflows/azure-deploy.yml'),
      content: await this.renderTemplate('cloud/azure/github/azure-deploy.yml.hbs', {
        resourceGroupName: options.resourceGroupName,
        subscriptionId: options.subscriptionId,
        environment: options.environment
      })
    });
    
    return operations;
  }
}
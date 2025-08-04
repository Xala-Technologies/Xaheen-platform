/**
 * Azure Cloud Platform Integration Generator
 * Generates comprehensive Azure cloud infrastructure and service integrations
 * Supports App Service, Functions, Cosmos DB, Storage, AI services, and more
 */

import { InfrastructureGenerator, InfrastructureGeneratorOptions, InfrastructureGeneratorResult, GeneratedInfrastructureFile } from "../infrastructure/index.js";

export interface AzureCloudOptions extends InfrastructureGeneratorOptions {
	readonly subscriptionId: string;
	readonly resourceGroupName: string;
	readonly location: string;
	readonly environment: "development" | "staging" | "production" | "all";
	readonly appService: {
		readonly enabled: boolean;
		readonly sku: "F1" | "B1" | "B2" | "B3" | "S1" | "S2" | "S3" | "P1" | "P2" | "P3";
		readonly runtime: "node" | "python" | "dotnet" | "java";
		readonly version: string;
		readonly customDomains?: readonly string[];
		readonly ssl: boolean;
	};
	readonly functions: {
		readonly enabled: boolean;
		readonly runtime: "node" | "python" | "dotnet" | "java" | "powershell";
		readonly version: string;
		readonly triggers: readonly AzureFunctionTrigger[];
		readonly bindings: readonly AzureFunctionBinding[];
	};
	readonly storage: {
		readonly enabled: boolean;
		readonly accountType: "Standard_LRS" | "Standard_GRS" | "Standard_RAGRS" | "Premium_LRS";
		readonly blobStorage: boolean;
		readonly fileStorage: boolean;
		readonly tableStorage: boolean;
		readonly queueStorage: boolean;
		readonly staticWebsite: boolean;
		readonly cdnEnabled: boolean;
	};
	readonly database: {
		readonly enabled: boolean;
		readonly type: "cosmosdb" | "sqlserver" | "mysql" | "postgresql";
		readonly tier: "Free" | "Basic" | "Standard" | "Premium";
		readonly consistencyLevel?: "Session" | "Strong" | "BoundedStaleness" | "ConsistentPrefix" | "Eventual";
		readonly multiRegion: boolean;
		readonly backup: boolean;
	};
	readonly keyVault: {
		readonly enabled: boolean;
		readonly sku: "standard" | "premium";
		readonly accessPolicies: readonly AzureKeyVaultAccessPolicy[];
		readonly secrets: readonly string[];
		readonly certificates: readonly string[];
		readonly keys: readonly string[];
	};
	readonly cognitiveServices: {
		readonly enabled: boolean;
		readonly services: readonly AzureCognitiveService[];
		readonly customVision: boolean;
		readonly speechServices: boolean;
		readonly languageServices: boolean;
		readonly openAI: boolean;
	};
	readonly monitoring: {
		readonly applicationInsights: boolean;
		readonly logAnalytics: boolean;
		readonly alerts: boolean;
		readonly dashboards: boolean;
		readonly availability: boolean;
	};
	readonly security: {
		readonly managedIdentity: boolean;
		readonly rbac: boolean;
		readonly networkSecurity: boolean;
		readonly privateEndpoints: boolean;
		readonly waf: boolean;
	};
	readonly networking: {
		readonly vnet: boolean;
		readonly subnets: readonly AzureSubnet[];
		readonly nsg: boolean;
		readonly loadBalancer: boolean;
		readonly applicationGateway: boolean;
		readonly frontDoor: boolean;
	};
	readonly devOps: {
		readonly enabled: boolean;
		readonly pipelines: boolean;
		readonly artifacts: boolean;
		readonly repos: boolean;
		readonly boards: boolean;
	};
}

export interface AzureFunctionTrigger {
	readonly name: string;
	readonly type: "httpTrigger" | "blobTrigger" | "queueTrigger" | "timerTrigger" | "cosmosDBTrigger" | "eventHubTrigger" | "serviceBusTrigger";
	readonly configuration: Record<string, string>;
}

export interface AzureFunctionBinding {
	readonly name: string;
	readonly type: "http" | "blob" | "queue" | "cosmosDB" | "eventHub" | "serviceBus" | "table";
	readonly direction: "in" | "out" | "inout";
	readonly configuration: Record<string, string>;
}

export interface AzureKeyVaultAccessPolicy {
	readonly objectId: string;
	readonly permissions: {
		readonly keys?: readonly string[];
		readonly secrets?: readonly string[];
		readonly certificates?: readonly string[];
	};
}

export interface AzureCognitiveService {
	readonly name: string;
	readonly kind: "ComputerVision" | "Face" | "TextAnalytics" | "LUIS" | "QnAMaker" | "SpeechServices" | "TranslatorText" | "OpenAI";
	readonly sku: "F0" | "S0" | "S1" | "S2" | "S3" | "S4";
}

export interface AzureSubnet {
	readonly name: string;
	readonly addressPrefix: string;
	readonly serviceEndpoints?: readonly string[];
	readonly delegations?: readonly string[];
}

/**
 * Azure Cloud Platform Generator
 * Generates comprehensive Azure infrastructure and service configurations
 */
export class AzureCloudGenerator extends InfrastructureGenerator {
	readonly type = "azure-cloud";
	readonly supportedPlatforms = ["azure"] as const;

	async generate(
		projectPath: string,
		options: AzureCloudOptions,
	): Promise<InfrastructureGeneratorResult> {
		const files: GeneratedInfrastructureFile[] = [];
		const commands: string[] = [];

		try {
			// Generate ARM template
			files.push(this.generateARMTemplate(options));
			files.push(this.generateARMParameters(options));

			// Generate Terraform configuration
			files.push(this.generateTerraformMain(options));
			files.push(this.generateTerraformVariables(options));

			// Generate Azure CLI scripts
			files.push(this.generateAzureCLIScript(options));

			// Generate App Service configuration
			if (options.appService.enabled) {
				files.push(...this.generateAppServiceFiles(options));
			}

			// Generate Azure Functions
			if (options.functions.enabled) {
				files.push(...this.generateFunctionFiles(options));
			}

			// Generate storage configurations
			if (options.storage.enabled) {
				files.push(...this.generateStorageFiles(options));
			}

			// Generate database configurations
			if (options.database.enabled) {
				files.push(...this.generateDatabaseFiles(options));
			}

			// Generate Key Vault configuration
			if (options.keyVault.enabled) {
				files.push(...this.generateKeyVaultFiles(options));
			}

			// Generate Cognitive Services
			if (options.cognitiveServices.enabled) {
				files.push(...this.generateCognitiveServicesFiles(options));
			}

			// Generate monitoring configuration
			if (options.monitoring.applicationInsights) {
				files.push(...this.generateMonitoringFiles(options));
			}

			// Generate networking configuration
			if (options.networking.vnet) {
				files.push(...this.generateNetworkingFiles(options));
			}

			// Generate DevOps configuration
			if (options.devOps.enabled) {
				files.push(...this.generateDevOpsFiles(options));
			}

			// Generate TypeScript SDK integration
			files.push(...this.generateTypeScriptIntegration(options));

			commands.push(
				"az login",
				"az account set --subscription " + options.subscriptionId,
				"az group create --name " + options.resourceGroupName + " --location " + options.location,
				"az deployment group create --resource-group " + options.resourceGroupName + " --template-file azure/arm-template.json --parameters @azure/parameters.json"
			);

			const nextSteps = this.generateNextSteps(options);

			return {
				success: true,
				files,
				commands,
				message: `Azure cloud integration generated successfully for ${options.location}`,
				nextSteps,
			};
		} catch (error) {
			return {
				success: false,
				files: [],
				commands: [],
				message: `Failed to generate Azure cloud integration: ${error instanceof Error ? error.message : "Unknown error"}`,
				nextSteps: ["Check the error message and try again"],
			};
		}
	}

	/**
	 * Generate ARM template for Azure resources
	 */
	private generateARMTemplate(options: AzureCloudOptions): GeneratedInfrastructureFile {
		const template = {
			"$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
			"contentVersion": "1.0.0.0",
			"parameters": {
				"projectName": {
					"type": "string",
					"metadata": {
						"description": "Name of the project"
					}
				},
				"environment": {
					"type": "string",
					"allowedValues": ["development", "staging", "production"],
					"metadata": {
						"description": "Environment name"
					}
				},
				"location": {
					"type": "string",
					"defaultValue": "[resourceGroup().location]",
					"metadata": {
						"description": "Location for all resources"
					}
				}
			},
			"variables": {
				"namePrefix": "[concat(parameters('projectName'), '-', parameters('environment'))]",
				"storageAccountName": "[concat(toLower(replace(variables('namePrefix'), '-', '')), 'storage')]",
				"appServicePlanName": "[concat(variables('namePrefix'), '-asp')]",
				"webAppName": "[concat(variables('namePrefix'), '-app')]",
				"functionAppName": "[concat(variables('namePrefix'), '-func')]",
				"keyVaultName": "[concat(variables('namePrefix'), '-kv')]",
				"applicationInsightsName": "[concat(variables('namePrefix'), '-ai')]"
			},
			"resources": this.generateARMResources(options),
			"outputs": this.generateARMOutputs(options)
		};

		return {
			path: "azure/arm-template.json",
			content: JSON.stringify(template, null, 2),
			type: "config",
			language: "json",
		};
	}

	/**
	 * Generate ARM template resources
	 */
	private generateARMResources(options: AzureCloudOptions): Record<string, unknown>[] {
		const resources: Record<string, unknown>[] = [];

		// Storage Account
		if (options.storage.enabled) {
			resources.push({
				"type": "Microsoft.Storage/storageAccounts",
				"apiVersion": "2021-06-01",
				"name": "[variables('storageAccountName')]",
				"location": "[parameters('location')]",
				"sku": {
					"name": options.storage.accountType
				},
				"kind": "StorageV2",
				"properties": {
					"supportsHttpsTrafficOnly": true,
					"encryption": {
						"services": {
							"file": { "enabled": true },
							"blob": { "enabled": true }
						},
						"keySource": "Microsoft.Storage"
					},
					"accessTier": "Hot"
				}
			});
		}

		// App Service Plan
		if (options.appService.enabled) {
			resources.push({
				"type": "Microsoft.Web/serverfarms",
				"apiVersion": "2021-02-01",
				"name": "[variables('appServicePlanName')]",
				"location": "[parameters('location')]",
				"sku": {
					"name": options.appService.sku,
					"tier": this.getAppServiceTier(options.appService.sku)
				},
				"kind": "app",
				"properties": {
					"reserved": options.appService.runtime === "node" || options.appService.runtime === "python"
				}
			});

			// Web App
			resources.push({
				"type": "Microsoft.Web/sites",
				"apiVersion": "2021-02-01",
				"name": "[variables('webAppName')]",
				"location": "[parameters('location')]",
				"dependsOn": [
					"[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]"
				],
				"kind": "app",
				"properties": {
					"serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]",
					"siteConfig": this.generateAppServiceSiteConfig(options),
					"httpsOnly": true
				}
			});
		}

		// Function App
		if (options.functions.enabled && options.storage.enabled) {
			resources.push({
				"type": "Microsoft.Web/sites",
				"apiVersion": "2021-02-01",
				"name": "[variables('functionAppName')]",
				"location": "[parameters('location')]",
				"kind": "functionapp",
				"dependsOn": [
					"[resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName'))]"
				],
				"properties": {
					"siteConfig": this.generateFunctionAppSiteConfig(options)
				}
			});
		}

		// Key Vault
		if (options.keyVault.enabled) {
			resources.push({
				"type": "Microsoft.KeyVault/vaults",
				"apiVersion": "2021-06-01-preview",
				"name": "[variables('keyVaultName')]",
				"location": "[parameters('location')]",
				"properties": {
					"sku": {
						"family": "A",
						"name": options.keyVault.sku
					},
					"tenantId": "[subscription().tenantId]",
					"accessPolicies": [],
					"enabledForDeployment": true,
					"enabledForTemplateDeployment": true,
					"enabledForDiskEncryption": true,
					"enableSoftDelete": true,
					"softDeleteRetentionInDays": 90,
					"enablePurgeProtection": true
				}
			});
		}

		// Application Insights
		if (options.monitoring.applicationInsights) {
			resources.push({
				"type": "Microsoft.Insights/components",
				"apiVersion": "2020-02-02",
				"name": "[variables('applicationInsightsName')]",
				"location": "[parameters('location')]",
				"kind": "web",
				"properties": {
					"Application_Type": "web",
					"publicNetworkAccessForIngestion": "Enabled",
					"publicNetworkAccessForQuery": "Enabled"
				}
			});
		}

		// Cosmos DB
		if (options.database.enabled && options.database.type === "cosmosdb") {
			resources.push({
				"type": "Microsoft.DocumentDB/databaseAccounts",
				"apiVersion": "2021-06-15",
				"name": "[concat(variables('namePrefix'), '-cosmos')]",
				"location": "[parameters('location')]",
				"kind": "GlobalDocumentDB",
				"properties": {
					"consistencyPolicy": {
						"defaultConsistencyLevel": options.database.consistencyLevel || "Session"
					},
					"locations": [
						{
							"locationName": "[parameters('location')]",
							"failoverPriority": 0,
							"isZoneRedundant": false
						}
					],
					"databaseAccountOfferType": "Standard",
					"capabilities": [
						{
							"name": "EnableServerless"
						}
					]
				}
			});
		}

		// Cognitive Services
		if (options.cognitiveServices.enabled) {
			for (const service of options.cognitiveServices.services) {
				resources.push({
					"type": "Microsoft.CognitiveServices/accounts",
					"apiVersion": "2021-10-01",
					"name": `[concat(variables('namePrefix'), '-${service.name.toLowerCase()}')]`,
					"location": "[parameters('location')]",
					"sku": {
						"name": service.sku
					},
					"kind": service.kind,
					"properties": {
						"customSubDomainName": `[concat(variables('namePrefix'), '-${service.name.toLowerCase()}')]`,
						"publicNetworkAccess": "Enabled"
					}
				});
			}
		}

		return resources;
	}

	/**
	 * Generate ARM template outputs
	 */
	private generateARMOutputs(options: AzureCloudOptions): Record<string, unknown> {
		const outputs: Record<string, unknown> = {};

		if (options.appService.enabled) {
			outputs.webAppUrl = {
				"type": "string",
				"value": "[concat('https://', reference(variables('webAppName')).defaultHostName)]"
			};
		}

		if (options.storage.enabled) {
			outputs.storageAccountName = {
				"type": "string",
				"value": "[variables('storageAccountName')]"
			};

			outputs.storageConnectionString = {
				"type": "string",
				"value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('storageAccountName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName')), '2021-06-01').keys[0].value)]"
			};
		}

		if (options.keyVault.enabled) {
			outputs.keyVaultUrl = {
				"type": "string",
				"value": "[reference(variables('keyVaultName')).vaultUri]"
			};
		}

		if (options.monitoring.applicationInsights) {
			outputs.applicationInsightsInstrumentationKey = {
				"type": "string",
				"value": "[reference(variables('applicationInsightsName')).InstrumentationKey]"
			};

			outputs.applicationInsightsConnectionString = {
				"type": "string",
				"value": "[reference(variables('applicationInsightsName')).ConnectionString]"
			};
		}

		return outputs;
	}

	/**
	 * Generate ARM parameters file
	 */
	private generateARMParameters(options: AzureCloudOptions): GeneratedInfrastructureFile {
		const parameters = {
			"$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
			"contentVersion": "1.0.0.0",
			"parameters": {
				"projectName": {
					"value": "xaheen-project"
				},
				"environment": {
					"value": options.environment === "all" ? "development" : options.environment
				},
				"location": {
					"value": options.location
				}
			}
		};

		return {
			path: "azure/parameters.json",
			content: JSON.stringify(parameters, null, 2),
			type: "config",
			language: "json",
		};
	}

	/**
	 * Generate Terraform main configuration
	 */
	private generateTerraformMain(options: AzureCloudOptions): GeneratedInfrastructureFile {
		const content = `# Azure Cloud Platform Terraform Configuration
# Generated by Xaheen CLI Azure Generator

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = var.subscription_id
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = local.common_tags
}

# Local values
locals {
  name_prefix = "\${var.project_name}-\${var.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    CreatedBy   = "xaheen-cli"
  }
}

${options.storage.enabled ? this.generateTerraformStorageAccount(options) : ""}

${options.appService.enabled ? this.generateTerraformAppService(options) : ""}

${options.functions.enabled ? this.generateTerraformFunctionApp(options) : ""}

${options.database.enabled ? this.generateTerraformDatabase(options) : ""}

${options.keyVault.enabled ? this.generateTerraformKeyVault(options) : ""}

${options.cognitiveServices.enabled ? this.generateTerraformCognitiveServices(options) : ""}

${options.monitoring.applicationInsights ? this.generateTerraformApplicationInsights(options) : ""}

${options.networking.vnet ? this.generateTerraformNetworking(options) : ""}`;

		return {
			path: "terraform/azure/main.tf",
			content,
			type: "config",
			language: "terraform",
		};
	}

	/**
	 * Generate Terraform variables
	 */
	private generateTerraformVariables(options: AzureCloudOptions): GeneratedInfrastructureFile {
		const content = `# Azure Terraform Variables
# Generated by Xaheen CLI Azure Generator

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "${options.resourceGroupName}"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "${options.location}"
}

${options.appService.enabled ? `
variable "app_service_sku" {
  description = "App Service plan SKU"
  type        = string
  default     = "${options.appService.sku}"
}

variable "app_service_runtime" {
  description = "App Service runtime"
  type        = string
  default     = "${options.appService.runtime}"
}
` : ""}

${options.storage.enabled ? `
variable "storage_account_type" {
  description = "Storage account replication type"
  type        = string
  default     = "${options.storage.accountType}"
}
` : ""}

${options.database.enabled ? `
variable "database_type" {
  description = "Database type"
  type        = string
  default     = "${options.database.type}"
}
` : ""}`;

		return {
			path: "terraform/azure/variables.tf",
			content,
			type: "config",
			language: "terraform",
		};
	}

	/**
	 * Generate Azure CLI deployment script
	 */
	private generateAzureCLIScript(options: AzureCloudOptions): GeneratedInfrastructureFile {
		const content = `#!/bin/bash
# Azure Cloud Platform Deployment Script
# Generated by Xaheen CLI Azure Generator

set -e

# Configuration
RESOURCE_GROUP="${options.resourceGroupName}"
LOCATION="${options.location}"
SUBSCRIPTION_ID="${options.subscriptionId}"

echo "🚀 Starting Azure deployment..."

# Login and set subscription
echo "📝 Logging in to Azure..."
az login
az account set --subscription $SUBSCRIPTION_ID

# Create resource group
echo "🏗️  Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy ARM template
echo "📦 Deploying ARM template..."
az deployment group create \\
  --resource-group $RESOURCE_GROUP \\
  --template-file azure/arm-template.json \\
  --parameters @azure/parameters.json

${options.storage.enabled ? `
# Configure storage account
echo "💾 Configuring storage account..."
STORAGE_ACCOUNT=$(az storage account list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
az storage cors add \\
  --account-name $STORAGE_ACCOUNT \\
  --services b \\
  --methods GET POST PUT DELETE OPTIONS \\
  --origins "*" \\
  --allowed-headers "*" \\
  --max-age 86400
` : ""}

${options.appService.enabled ? `
# Configure App Service
echo "🌐 Configuring App Service..."
WEB_APP_NAME=$(az webapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
az webapp config appsettings set \\
  --resource-group $RESOURCE_GROUP \\
  --name $WEB_APP_NAME \\
  --settings NODE_ENV=production
` : ""}

${options.functions.enabled ? `
# Deploy Function App
echo "⚡ Deploying Function App..."
FUNCTION_APP_NAME=$(az functionapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
func azure functionapp publish $FUNCTION_APP_NAME
` : ""}

${options.keyVault.enabled ? `
# Configure Key Vault access
echo "🔐 Configuring Key Vault..."
KEY_VAULT_NAME=$(az keyvault list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
CURRENT_USER=$(az account show --query user.name -o tsv)
az keyvault set-policy \\
  --name $KEY_VAULT_NAME \\
  --upn $CURRENT_USER \\
  --secret-permissions get list set delete
` : ""}

echo "✅ Azure deployment completed successfully!"
echo "🌐 Check your resources in the Azure Portal:"
echo "   https://portal.azure.com/#@/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"`;

		return {
			path: "scripts/deploy-azure.sh",
			content,
			type: "script",
			language: "bash",
		};
	}

	/**
	 * Generate App Service files
	 */
	private generateAppServiceFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Web.config for Node.js
		if (options.appService.runtime === "node") {
			files.push({
				path: "azure/web.config",
				content: this.generateWebConfig(options),
				type: "config",
				language: "xml",
			});
		}

		// App Service configuration
		files.push({
			path: "azure/app-service-config.json",
			content: JSON.stringify({
				runtime: options.appService.runtime,
				version: options.appService.version,
				httpsOnly: true,
				minTlsVersion: "1.2",
				ftpsState: "Disabled",
				scmType: "GitHubAction",
				appSettings: {
					"WEBSITE_NODE_DEFAULT_VERSION": options.appService.version,
					"WEBSITE_NPM_DEFAULT_VERSION": "latest",
					"NODE_ENV": "production"
				}
			}, null, 2),
			type: "config",
			language: "json",
		});

		return files;
	}

	/**
	 * Generate Azure Functions files
	 */
	private generateFunctionFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// host.json
		files.push({
			path: "azure-functions/host.json",
			content: JSON.stringify({
				version: "2.0",
				logging: {
					applicationInsights: {
						samplingSettings: {
							isEnabled: true
						}
					}
				},
				extensionBundle: {
					id: "Microsoft.Azure.Functions.ExtensionBundle",
					version: "[2.*, 3.0.0)"
				}
			}, null, 2),
			type: "config",
			language: "json",
		});

		// Function example for each trigger type
		for (const trigger of options.functions.triggers) {
			files.push({
				path: `azure-functions/${trigger.name}/function.json`,
				content: JSON.stringify({
					bindings: [
						{
							name: trigger.name,
							type: trigger.type,
							direction: "in",
							...trigger.configuration
						},
						...options.functions.bindings.map(binding => ({
							name: binding.name,
							type: binding.type,
							direction: binding.direction,
							...binding.configuration
						}))
					]
				}, null, 2),
				type: "config",
				language: "json",
			});

			// Function implementation
			files.push({
				path: `azure-functions/${trigger.name}/index.${options.functions.runtime === "node" ? "js" : "py"}`,
				content: this.generateFunctionImplementation(trigger, options),
				type: "config",
				language: options.functions.runtime === "node" ? "typescript" : "yaml",
			});
		}

		// package.json for Node.js functions
		if (options.functions.runtime === "node") {
			files.push({
				path: "azure-functions/package.json",
				content: JSON.stringify({
					name: "azure-functions",
					version: "1.0.0",
					description: "Azure Functions generated by Xaheen CLI",
					main: "index.js",
					scripts: {
						start: "func start",
						test: "echo \"No tests yet\""
					},
					dependencies: {
						"@azure/functions": "^3.5.1"
					},
					devDependencies: {
						"@types/node": "^18.0.0",
						"typescript": "^4.9.0"
					}
				}, null, 2),
				type: "config",
				language: "json",
			});
		}

		return files;
	}

	/**
	 * Generate storage files
	 */
	private generateStorageFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Storage client configuration
		files.push({
			path: "src/azure/storage/client.ts",
			content: this.generateStorageClient(options),
			type: "config",
			language: "typescript",
		});

		// Blob storage service
		if (options.storage.blobStorage) {
			files.push({
				path: "src/azure/storage/blob-service.ts",
				content: this.generateBlobService(options),
				type: "config",
				language: "typescript",
			});
		}

		// Queue storage service
		if (options.storage.queueStorage) {
			files.push({
				path: "src/azure/storage/queue-service.ts",
				content: this.generateQueueService(options),
				type: "config",
				language: "typescript",
			});
		}

		// Table storage service
		if (options.storage.tableStorage) {
			files.push({
				path: "src/azure/storage/table-service.ts",
				content: this.generateTableService(options),
				type: "config",
				language: "typescript",
			});
		}

		return files;
	}

	/**
	 * Generate database files
	 */
	private generateDatabaseFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		switch (options.database.type) {
			case "cosmosdb":
				files.push({
					path: "src/azure/database/cosmos-client.ts",
					content: this.generateCosmosClient(options),
					type: "config",
					language: "typescript",
				});
				break;
			case "sqlserver":
				files.push({
					path: "src/azure/database/sql-client.ts",
					content: this.generateSQLClient(options),
					type: "config",
					language: "typescript",
				});
				break;
		}

		return files;
	}

	/**
	 * Generate Key Vault files
	 */
	private generateKeyVaultFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		files.push({
			path: "src/azure/keyvault/client.ts",
			content: this.generateKeyVaultClient(options),
			type: "config",
			language: "typescript",
		});

		files.push({
			path: "src/azure/keyvault/secrets-service.ts",
			content: this.generateSecretsService(options),
			type: "config",
			language: "typescript",
		});

		return files;
	}

	/**
	 * Generate Cognitive Services files
	 */
	private generateCognitiveServicesFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Generate service clients for each cognitive service
		for (const service of options.cognitiveServices.services) {
			files.push({
				path: `src/azure/cognitive/${service.name.toLowerCase()}-client.ts`,
				content: this.generateCognitiveServiceClient(service, options),
				type: "config",
				language: "typescript",
			});
		}

		// OpenAI integration if enabled
		if (options.cognitiveServices.openAI) {
			files.push({
				path: "src/azure/cognitive/openai-service.ts",
				content: this.generateOpenAIService(options),
				type: "config",
				language: "typescript",
			});
		}

		return files;
	}

	/**
	 * Generate monitoring files
	 */
	private generateMonitoringFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		files.push({
			path: "src/azure/monitoring/application-insights.ts",
			content: this.generateApplicationInsights(options),
			type: "config",
			language: "typescript",
		});

		if (options.monitoring.logAnalytics) {
			files.push({
				path: "src/azure/monitoring/log-analytics.ts",
				content: this.generateLogAnalytics(options),
				type: "config",
				language: "typescript",
			});
		}

		return files;
	}

	/**
	 * Generate networking files
	 */
	private generateNetworkingFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		files.push({
			path: "terraform/azure/networking.tf",
			content: this.generateTerraformNetworking(options),
			type: "config",
			language: "terraform",
		});

		return files;
	}

	/**
	 * Generate DevOps files
	 */
	private generateDevOpsFiles(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		if (options.devOps.pipelines) {
			files.push({
				path: "azure-pipelines.yml",
				content: this.generateAzurePipeline(options),
				type: "ci",
				language: "yaml",
			});
		}

		return files;
	}

	/**
	 * Generate TypeScript integration files
	 */
	private generateTypeScriptIntegration(options: AzureCloudOptions): GeneratedInfrastructureFile[] {
		const files: GeneratedInfrastructureFile[] = [];

		// Main Azure SDK configuration
		files.push({
			path: "src/azure/config.ts",
			content: this.generateAzureConfig(options),
			type: "config",
			language: "typescript",
		});

		// Azure services index
		files.push({
			path: "src/azure/index.ts",
			content: this.generateAzureIndex(options),
			type: "config",
			language: "typescript",
		});

		// Types definitions
		files.push({
			path: "src/azure/types.ts",
			content: this.generateAzureTypes(options),
			type: "config",
			language: "typescript",
		});

		return files;
	}

	// Helper methods for generating specific configurations

	private getAppServiceTier(sku: string): string {
		const tierMap: Record<string, string> = {
			"F1": "Free",
			"B1": "Basic", "B2": "Basic", "B3": "Basic",
			"S1": "Standard", "S2": "Standard", "S3": "Standard",
			"P1": "Premium", "P2": "Premium", "P3": "Premium"
		};
		return tierMap[sku] || "Free";
	}

	private generateAppServiceSiteConfig(options: AzureCloudOptions): Record<string, unknown> {
		const config: Record<string, unknown> = {
			"linuxFxVersion": options.appService.runtime === "node" ? `NODE|${options.appService.version}` : undefined,
			"appSettings": [
				{ "name": "WEBSITE_NODE_DEFAULT_VERSION", "value": options.appService.version },
				{ "name": "NODE_ENV", "value": "production" }
			],
			"minTlsVersion": "1.2",
			"ftpsState": "Disabled",
			"httpLoggingEnabled": true,
			"requestTracingEnabled": true,
			"detailedErrorLoggingEnabled": true
		};

		return config;
	}

	private generateFunctionAppSiteConfig(options: AzureCloudOptions): Record<string, unknown> {
		return {
			"appSettings": [
				{ "name": "AzureWebJobsStorage", "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('storageAccountName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName')), '2021-06-01').keys[0].value)]" },
				{ "name": "FUNCTIONS_EXTENSION_VERSION", "value": "~4" },
				{ "name": "FUNCTIONS_WORKER_RUNTIME", "value": options.functions.runtime },
				{ "name": "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING", "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', variables('storageAccountName'), ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('storageAccountName')), '2021-06-01').keys[0].value)]" },
				{ "name": "WEBSITE_CONTENTSHARE", "value": "[toLower(variables('functionAppName'))]" }
			]
		};
	}

	private generateWebConfig(options: AzureCloudOptions): string {
		return `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering removeServerHeader="true"/>
    </security>
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By"/>
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>`;
	}

	private generateFunctionImplementation(trigger: AzureFunctionTrigger, options: AzureCloudOptions): string {
		if (options.functions.runtime === "node") {
			return `const { app } = require('@azure/functions');

app.${trigger.type}('${trigger.name}', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(\`\${trigger.name} function processed request for url "\${request.url}"\`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: \`Hello, \${name}!\` };
    }
});`;
		} else {
			return `import logging
import azure.functions as func

def main(${trigger.name}: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = ${trigger.name}.params.get('name')
    if not name:
        try:
            req_body = ${trigger.name}.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}!")
    else:
        return func.HttpResponse(
             "Please pass a name on the query string or in the request body",
             status_code=400
        )`;
		}
	}

	private generateStorageClient(options: AzureCloudOptions): string {
		return `/**
 * Azure Storage Client Configuration
 * Generated by Xaheen CLI Azure Generator
 */

import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import { TableClient } from '@azure/data-tables';

export interface AzureStorageConfig {
  readonly accountName: string;
  readonly accountKey: string;
  readonly connectionString: string;
}

export class AzureStorageClient {
  private readonly config: AzureStorageConfig;
  private blobServiceClient?: BlobServiceClient;
  private queueServiceClient?: QueueServiceClient;

  constructor(config: AzureStorageConfig) {
    this.config = config;
  }

  /**
   * Get Blob Service Client
   */
  getBlobServiceClient(): BlobServiceClient {
    if (!this.blobServiceClient) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        this.config.connectionString
      );
    }
    return this.blobServiceClient;
  }

  /**
   * Get Queue Service Client
   */
  getQueueServiceClient(): QueueServiceClient {
    if (!this.queueServiceClient) {
      this.queueServiceClient = QueueServiceClient.fromConnectionString(
        this.config.connectionString
      );
    }
    return this.queueServiceClient;
  }

  /**
   * Get Table Client
   */
  getTableClient(tableName: string): TableClient {
    return TableClient.fromConnectionString(
      this.config.connectionString,
      tableName
    );
  }
}

// Export singleton instance
export const azureStorage = new AzureStorageClient({
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || ''
});`;
	}

	private generateBlobService(options: AzureCloudOptions): string {
		return `/**
 * Azure Blob Storage Service
 * Generated by Xaheen CLI Azure Generator
 */

import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { azureStorage } from './client.js';

export interface BlobUploadOptions {
  readonly containerName: string;
  readonly blobName: string;
  readonly data: Buffer | string;
  readonly contentType?: string;
  readonly metadata?: Record<string, string>;
}

export interface BlobDownloadOptions {
  readonly containerName: string;
  readonly blobName: string;
}

export class AzureBlobService {
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.blobServiceClient = azureStorage.getBlobServiceClient();
  }

  /**
   * Upload blob to container
   */
  async uploadBlob(options: BlobUploadOptions): Promise<void> {
    try {
      const containerClient = this.getContainerClient(options.containerName);
      await containerClient.createIfNotExists({
        access: 'container'
      });

      const blockBlobClient = containerClient.getBlockBlobClient(options.blobName);
      
      await blockBlobClient.upload(options.data, options.data.length, {
        blobHTTPHeaders: {
          blobContentType: options.contentType || 'application/octet-stream'
        },
        metadata: options.metadata
      });
    } catch (error) {
      console.error('Error uploading blob:', error);
      throw new Error(\`Failed to upload blob: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Download blob from container
   */
  async downloadBlob(options: BlobDownloadOptions): Promise<Buffer> {
    try {
      const containerClient = this.getContainerClient(options.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(options.blobName);
      
      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error('No data received from blob');
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading blob:', error);
      throw new Error(\`Failed to download blob: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete blob from container
   */
  async deleteBlob(options: BlobDownloadOptions): Promise<void> {
    try {
      const containerClient = this.getContainerClient(options.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(options.blobName);
      
      await blockBlobClient.delete();
    } catch (error) {
      console.error('Error deleting blob:', error);
      throw new Error(\`Failed to delete blob: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * List blobs in container
   */
  async listBlobs(containerName: string): Promise<string[]> {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blobNames: string[] = [];
      
      for await (const blob of containerClient.listBlobsFlat()) {
        blobNames.push(blob.name);
      }
      
      return blobNames;
    } catch (error) {
      console.error('Error listing blobs:', error);
      throw new Error(\`Failed to list blobs: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  private getContainerClient(containerName: string): ContainerClient {
    return this.blobServiceClient.getContainerClient(containerName);
  }
}

// Export singleton instance
export const azureBlobService = new AzureBlobService();`;
	}

	private generateQueueService(options: AzureCloudOptions): string {
		return `/**
 * Azure Queue Storage Service
 * Generated by Xaheen CLI Azure Generator
 */

import { QueueServiceClient, QueueClient } from '@azure/storage-queue';
import { azureStorage } from './client.js';

export interface QueueMessage {
  readonly messageText: string;
  readonly visibilityTimeoutInSeconds?: number;
  readonly messageTimeToLiveInSeconds?: number;
}

export class AzureQueueService {
  private readonly queueServiceClient: QueueServiceClient;

  constructor() {
    this.queueServiceClient = azureStorage.getQueueServiceClient();
  }

  /**
   * Send message to queue
   */
  async sendMessage(queueName: string, message: QueueMessage): Promise<void> {
    try {
      const queueClient = this.getQueueClient(queueName);
      await queueClient.createIfNotExists();
      
      await queueClient.sendMessage(
        message.messageText,
        {
          visibilityTimeoutInSeconds: message.visibilityTimeoutInSeconds,
          messageTimeToLiveInSeconds: message.messageTimeToLiveInSeconds
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(\`Failed to send message: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Receive messages from queue
   */
  async receiveMessages(queueName: string, maxMessages: number = 1): Promise<unknown[]> {
    try {
      const queueClient = this.getQueueClient(queueName);
      const response = await queueClient.receiveMessages({ numberOfMessages: maxMessages });
      
      return response.receivedMessageItems || [];
    } catch (error) {
      console.error('Error receiving messages:', error);
      throw new Error(\`Failed to receive messages: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete message from queue
   */
  async deleteMessage(queueName: string, messageId: string, popReceipt: string): Promise<void> {
    try {
      const queueClient = this.getQueueClient(queueName);
      await queueClient.deleteMessage(messageId, popReceipt);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error(\`Failed to delete message: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  private getQueueClient(queueName: string): QueueClient {
    return this.queueServiceClient.getQueueClient(queueName);
  }
}

// Export singleton instance  
export const azureQueueService = new AzureQueueService();`;
	}

	private generateTableService(options: AzureCloudOptions): string {
		return `/**
 * Azure Table Storage Service
 * Generated by Xaheen CLI Azure Generator
 */

import { TableClient, odata } from '@azure/data-tables';
import { azureStorage } from './client.js';

export interface TableEntity {
  readonly partitionKey: string;
  readonly rowKey: string;
  readonly [key: string]: unknown;
}

export class AzureTableService {
  /**
   * Get table client for specific table
   */
  getTableClient(tableName: string): TableClient {
    return azureStorage.getTableClient(tableName);
  }

  /**
   * Create entity in table
   */
  async createEntity(tableName: string, entity: TableEntity): Promise<void> {
    try {
      const tableClient = this.getTableClient(tableName);
      await tableClient.createTable();
      await tableClient.createEntity(entity);
    } catch (error) {
      console.error('Error creating entity:', error);
      throw new Error(\`Failed to create entity: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get entity from table
   */
  async getEntity(tableName: string, partitionKey: string, rowKey: string): Promise<TableEntity | null> {
    try {
      const tableClient = this.getTableClient(tableName);
      const entity = await tableClient.getEntity(partitionKey, rowKey);
      return entity as TableEntity;
    } catch (error) {
      if (error instanceof Error && error.message.includes('ResourceNotFound')) {
        return null;
      }
      console.error('Error getting entity:', error);
      throw new Error(\`Failed to get entity: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Update entity in table
   */
  async updateEntity(tableName: string, entity: TableEntity, mode: 'merge' | 'replace' = 'merge'): Promise<void> {
    try {
      const tableClient = this.getTableClient(tableName);
      await tableClient.updateEntity(entity, mode);
    } catch (error) {
      console.error('Error updating entity:', error);
      throw new Error(\`Failed to update entity: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete entity from table
   */
  async deleteEntity(tableName: string, partitionKey: string, rowKey: string): Promise<void> {
    try {
      const tableClient = this.getTableClient(tableName);
      await tableClient.deleteEntity(partitionKey, rowKey);
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw new Error(\`Failed to delete entity: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Query entities from table
   */
  async queryEntities(tableName: string, filter?: string): Promise<TableEntity[]> {
    try {
      const tableClient = this.getTableClient(tableName);
      const entities: TableEntity[] = [];
      
      const queryOptions = filter ? { filter } : {};
      
      for await (const entity of tableClient.listEntities(queryOptions)) {
        entities.push(entity as TableEntity);
      }
      
      return entities;
    } catch (error) {
      console.error('Error querying entities:', error);
      throw new Error(\`Failed to query entities: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export singleton instance
export const azureTableService = new AzureTableService();`;
	}

	private generateCosmosClient(options: AzureCloudOptions): string {
		return `/**
 * Azure Cosmos DB Client
 * Generated by Xaheen CLI Azure Generator
 */

import { CosmosClient, Database, Container } from '@azure/cosmos';

export interface CosmosConfig {
  readonly endpoint: string;
  readonly key: string;
  readonly databaseId: string;
}

export class AzureCosmosClient {
  private readonly client: CosmosClient;
  private readonly databaseId: string;

  constructor(config: CosmosConfig) {
    this.client = new CosmosClient({
      endpoint: config.endpoint,
      key: config.key
    });
    this.databaseId = config.databaseId;
  }

  /**
   * Get database instance
   */
  getDatabase(): Database {
    return this.client.database(this.databaseId);
  }

  /**
   * Get container instance
   */
  getContainer(containerId: string): Container {
    return this.getDatabase().container(containerId);
  }

  /**
   * Create item in container
   */
  async createItem<T>(containerId: string, item: T): Promise<T> {
    try {
      const container = this.getContainer(containerId);
      const { resource } = await container.items.create(item);
      return resource as T;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(\`Failed to create item: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Read item from container
   */
  async readItem<T>(containerId: string, id: string, partitionKey: string): Promise<T | null> {
    try {
      const container = this.getContainer(containerId);
      const { resource } = await container.item(id, partitionKey).read<T>();
      return resource || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('NotFound')) {
        return null;
      }
      console.error('Error reading item:', error);
      throw new Error(\`Failed to read item: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Update item in container
   */
  async updateItem<T>(containerId: string, item: T & { id: string }): Promise<T> {
    try {
      const container = this.getContainer(containerId);
      const { resource } = await container.item(item.id).replace(item);
      return resource as T;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error(\`Failed to update item: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete item from container
   */
  async deleteItem(containerId: string, id: string, partitionKey: string): Promise<void> {
    try {
      const container = this.getContainer(containerId);
      await container.item(id, partitionKey).delete();
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(\`Failed to delete item: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Query items from container
   */
  async queryItems<T>(containerId: string, query: string, parameters?: { name: string; value: unknown }[]): Promise<T[]> {
    try {
      const container = this.getContainer(containerId);
      const querySpec = {
        query,
        parameters: parameters || []
      };
      
      const { resources } = await container.items.query<T>(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error querying items:', error);
      throw new Error(\`Failed to query items: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export singleton instance
export const azureCosmosClient = new AzureCosmosClient({
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || '',
  key: process.env.AZURE_COSMOS_KEY || '',
  databaseId: process.env.AZURE_COSMOS_DATABASE_ID || 'xaheen-db'
});`;
	}

	private generateSQLClient(options: AzureCloudOptions): string {
		return `/**
 * Azure SQL Database Client
 * Generated by Xaheen CLI Azure Generator
 */

import sql from 'mssql';

export interface SQLConfig {
  readonly server: string;
  readonly database: string;
  readonly user: string;
  readonly password: string;
  readonly port?: number;
  readonly encrypt?: boolean;
  readonly trustServerCertificate?: boolean;
}

export class AzureSQLClient {
  private pool?: sql.ConnectionPool;
  private readonly config: sql.config;

  constructor(config: SQLConfig) {
    this.config = {
      server: config.server,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port || 1433,
      options: {
        encrypt: config.encrypt !== false,
        trustServerCertificate: config.trustServerCertificate || false
      }
    };
  }

  /**
   * Get connection pool
   */
  async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      this.pool = new sql.ConnectionPool(this.config);
      await this.pool.connect();
    }
    return this.pool;
  }

  /**
   * Execute query
   */
  async query<T = unknown>(queryText: string, parameters?: Record<string, unknown>): Promise<T[]> {
    try {
      const pool = await this.getPool();
      const request = pool.request();
      
      // Add parameters if provided
      if (parameters) {
        for (const [key, value] of Object.entries(parameters)) {
          request.input(key, value);
        }
      }
      
      const result = await request.query(queryText);
      return result.recordset as T[];
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error(\`Failed to execute query: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Execute stored procedure
   */
  async executeStoredProcedure<T = unknown>(procedureName: string, parameters?: Record<string, unknown>): Promise<T[]> {
    try {
      const pool = await this.getPool();
      const request = pool.request();
      
      // Add parameters if provided
      if (parameters) {
        for (const [key, value] of Object.entries(parameters)) {
          request.input(key, value);
        }
      }
      
      const result = await request.execute(procedureName);
      return result.recordset as T[];
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      throw new Error(\`Failed to execute stored procedure: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<sql.Transaction> {
    try {
      const pool = await this.getPool();
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      return transaction;
    } catch (error) {
      console.error('Error beginning transaction:', error);
      throw new Error(\`Failed to begin transaction: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = undefined;
    }
  }
}

// Export singleton instance
export const azureSQLClient = new AzureSQLClient({
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  encrypt: true,
  trustServerCertificate: false
});`;
	}

	private generateKeyVaultClient(options: AzureCloudOptions): string {
		return `/**
 * Azure Key Vault Client
 * Generated by Xaheen CLI Azure Generator
 */

import { SecretClient } from '@azure/keyvault-secrets';
import { CertificateClient } from '@azure/keyvault-certificates';
import { KeyClient } from '@azure/keyvault-keys';
import { DefaultAzureCredential } from '@azure/identity';

export interface KeyVaultConfig {
  readonly vaultUrl: string;
}

export class AzureKeyVaultClient {
  private readonly secretClient: SecretClient;
  private readonly certificateClient: CertificateClient;
  private readonly keyClient: KeyClient;
  private readonly credential: DefaultAzureCredential;

  constructor(config: KeyVaultConfig) {
    this.credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(config.vaultUrl, this.credential);
    this.certificateClient = new CertificateClient(config.vaultUrl, this.credential);
    this.keyClient = new KeyClient(config.vaultUrl, this.credential);
  }

  /**
   * Get secret from Key Vault
   */
  async getSecret(secretName: string): Promise<string | null> {
    try {
      const secret = await this.secretClient.getSecret(secretName);
      return secret.value || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('NotFound')) {
        return null;
      }
      console.error('Error getting secret:', error);
      throw new Error(\`Failed to get secret: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Set secret in Key Vault
   */
  async setSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      await this.secretClient.setSecret(secretName, secretValue);
    } catch (error) {
      console.error('Error setting secret:', error);
      throw new Error(\`Failed to set secret: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Delete secret from Key Vault
   */
  async deleteSecret(secretName: string): Promise<void> {
    try {
      const deletePoller = await this.secretClient.beginDeleteSecret(secretName);
      await deletePoller.pollUntilDone();
    } catch (error) {
      console.error('Error deleting secret:', error);
      throw new Error(\`Failed to delete secret: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * List secrets in Key Vault
   */
  async listSecrets(): Promise<string[]> {
    try {
      const secretNames: string[] = [];
      for await (const secretProperties of this.secretClient.listPropertiesOfSecrets()) {
        secretNames.push(secretProperties.name);
      }
      return secretNames;
    } catch (error) {
      console.error('Error listing secrets:', error);
      throw new Error(\`Failed to list secrets: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get certificate from Key Vault
   */
  async getCertificate(certificateName: string): Promise<unknown> {
    try {
      const certificate = await this.certificateClient.getCertificate(certificateName);
      return certificate;
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw new Error(\`Failed to get certificate: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get key from Key Vault
   */
  async getKey(keyName: string): Promise<unknown> {
    try {
      const key = await this.keyClient.getKey(keyName);
      return key;
    } catch (error) {
      console.error('Error getting key:', error);
      throw new Error(\`Failed to get key: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export singleton instance
export const azureKeyVaultClient = new AzureKeyVaultClient({
  vaultUrl: process.env.AZURE_KEY_VAULT_URL || ''
});`;
	}

	private generateSecretsService(options: AzureCloudOptions): string {
		return `/**
 * Azure Key Vault Secrets Service
 * Generated by Xaheen CLI Azure Generator
 */

import { azureKeyVaultClient } from './client.js';

export interface SecretDefinition {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly defaultValue?: string;
}

export class AzureSecretsService {
  private readonly keyVault = azureKeyVaultClient;

  /**
   * Initialize secrets with default values
   */
  async initializeSecrets(secrets: readonly SecretDefinition[]): Promise<void> {
    try {
      for (const secret of secrets) {
        const existingSecret = await this.keyVault.getSecret(secret.name);
        
        if (!existingSecret && secret.defaultValue) {
          await this.keyVault.setSecret(secret.name, secret.defaultValue);
          console.log(\`Initialized secret: \${secret.name}\`);
        }
      }
    } catch (error) {
      console.error('Error initializing secrets:', error);
      throw new Error(\`Failed to initialize secrets: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get configuration from secrets
   */
  async getConfiguration(secretNames: readonly string[]): Promise<Record<string, string>> {
    try {
      const configuration: Record<string, string> = {};
      
      for (const secretName of secretNames) {
        const secretValue = await this.keyVault.getSecret(secretName);
        if (secretValue) {
          configuration[secretName] = secretValue;
        }
      }
      
      return configuration;
    } catch (error) {
      console.error('Error getting configuration:', error);
      throw new Error(\`Failed to get configuration: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Update configuration secrets
   */
  async updateConfiguration(configuration: Record<string, string>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(configuration)) {
        await this.keyVault.setSecret(key, value);
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw new Error(\`Failed to update configuration: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Validate required secrets exist
   */
  async validateSecrets(requiredSecrets: readonly string[]): Promise<boolean> {
    try {
      for (const secretName of requiredSecrets) {
        const secretValue = await this.keyVault.getSecret(secretName);
        if (!secretValue) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error validating secrets:', error);
      return false;
    }
  }
}

// Export singleton instance
export const azureSecretsService = new AzureSecretsService();`;
	}

	private generateCognitiveServiceClient(service: AzureCognitiveService, options: AzureCloudOptions): string {
		return `/**
 * Azure ${service.kind} Client
 * Generated by Xaheen CLI Azure Generator
 */

import { AzureKeyCredential } from '@azure/core-auth';

export interface ${service.kind}Config {
  readonly endpoint: string;
  readonly key: string;
}

export class Azure${service.kind}Client {
  private readonly endpoint: string;
  private readonly credential: AzureKeyCredential;

  constructor(config: ${service.kind}Config) {
    this.endpoint = config.endpoint;
    this.credential = new AzureKeyCredential(config.key);
  }

  /**
   * Analyze data using ${service.kind}
   */
  async analyze(data: string): Promise<unknown> {
    try {
      // Implementation depends on specific service
      const response = await fetch(\`\${this.endpoint}/analyze\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.credential.key
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing data:', error);
      throw new Error(\`Failed to analyze data: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export singleton instance
export const azure${service.kind}Client = new Azure${service.kind}Client({
  endpoint: process.env.AZURE_${service.kind.toUpperCase()}_ENDPOINT || '',
  key: process.env.AZURE_${service.kind.toUpperCase()}_KEY || ''
});`;
	}

	private generateOpenAIService(options: AzureCloudOptions): string {
		return `/**
 * Azure OpenAI Service
 * Generated by Xaheen CLI Azure Generator
 */

import { OpenAIApi, Configuration } from 'openai';

export interface AzureOpenAIConfig {
  readonly apiKey: string;
  readonly resourceName: string;
  readonly deploymentId: string;
  readonly apiVersion?: string;
}

export class AzureOpenAIService {
  private readonly openai: OpenAIApi;
  private readonly deploymentId: string;

  constructor(config: AzureOpenAIConfig) {
    const configuration = new Configuration({
      apiKey: config.apiKey,
      basePath: \`https://\${config.resourceName}.openai.azure.com/openai/deployments/\${config.deploymentId}\`,
      baseOptions: {
        headers: {
          'api-key': config.apiKey
        },
        params: {
          'api-version': config.apiVersion || '2023-05-15'
        }
      }
    });
    
    this.openai = new OpenAIApi(configuration);
    this.deploymentId = config.deploymentId;
  }

  /**
   * Generate chat completion
   */
  async chatCompletion(messages: { role: string; content: string }[], options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: this.deploymentId,
        messages: messages,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1
      });

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw new Error(\`Failed to generate chat completion: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Generate text completion
   */
  async textCompletion(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: this.deploymentId,
        prompt: prompt,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1
      });

      return response.data.choices[0]?.text || '';
    } catch (error) {
      console.error('Error generating text completion:', error);
      throw new Error(\`Failed to generate text completion: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Generate embeddings
   */
  async generateEmbeddings(input: string | string[]): Promise<number[][]> {
    try {
      const response = await this.openai.createEmbedding({
        model: this.deploymentId,
        input: input
      });

      return response.data.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(\`Failed to generate embeddings: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }
}

// Export singleton instance
export const azureOpenAIService = new AzureOpenAIService({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
  deploymentId: process.env.AZURE_OPENAI_DEPLOYMENT_ID || '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15'
});`;
	}

	private generateApplicationInsights(options: AzureCloudOptions): string {
		return `/**
 * Azure Application Insights Client
 * Generated by Xaheen CLI Azure Generator
 */

import { TelemetryClient } from 'applicationinsights';
import * as appInsights from 'applicationinsights';

export interface ApplicationInsightsConfig {
  readonly instrumentationKey: string;
  readonly connectionString: string;
}

export class AzureApplicationInsights {
  private client?: TelemetryClient;
  private readonly config: ApplicationInsightsConfig;

  constructor(config: ApplicationInsightsConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize Application Insights
   */
  private initialize(): void {
    appInsights.setup(this.config.connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(false)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    this.client = appInsights.defaultClient;
  }

  /**
   * Track custom event
   */
  trackEvent(name: string, properties?: Record<string, string>, measurements?: Record<string, number>): void {
    if (this.client) {
      this.client.trackEvent({
        name,
        properties,
        measurements
      });
    }
  }

  /**
   * Track exception
   */
  trackException(exception: Error, properties?: Record<string, string>): void {
    if (this.client) {
      this.client.trackException({ exception, properties });
    }
  }

  /**
   * Track trace/log
   */
  trackTrace(message: string, severity?: number, properties?: Record<string, string>): void {
    if (this.client) {
      this.client.trackTrace({ message, severity, properties });
    }
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, properties?: Record<string, string>): void {
    if (this.client) {
      this.client.trackMetric({ name, value, properties });
    }
  }

  /**
   * Track dependency
   */
  trackDependency(name: string, data: string, duration: number, success: boolean, dependencyTypeName?: string): void {
    if (this.client) {
      this.client.trackDependency({
        name,
        data,
        duration,
        success,
        dependencyTypeName
      });
    }
  }

  /**
   * Flush telemetry
   */
  flush(): void {
    if (this.client) {
      this.client.flush();
    }
  }
}

// Export singleton instance
export const azureApplicationInsights = new AzureApplicationInsights({
  instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || ''
});`;
	}

	private generateLogAnalytics(options: AzureCloudOptions): string {
		return `/**
 * Azure Log Analytics Client  
 * Generated by Xaheen CLI Azure Generator
 */

import { LogsQueryClient } from '@azure/monitor-query';
import { DefaultAzureCredential } from '@azure/identity';

export interface LogAnalyticsConfig {
  readonly workspaceId: string;
}

export class AzureLogAnalytics {
  private readonly client: LogsQueryClient;
  private readonly workspaceId: string;

  constructor(config: LogAnalyticsConfig) {
    const credential = new DefaultAzureCredential();
    this.client = new LogsQueryClient(credential);
    this.workspaceId = config.workspaceId;
  }

  /**
   * Execute KQL query
   */
  async query(kqlQuery: string, timespan?: { start: Date; end: Date }): Promise<unknown[]> {
    try {
      const result = await this.client.queryWorkspace(
        this.workspaceId,
        kqlQuery,
        timespan ? { duration: timespan } : { duration: { hours: 24 } }
      );

      return result.tables[0]?.rows || [];
    } catch (error) {
      console.error('Error executing Log Analytics query:', error);
      throw new Error(\`Failed to execute query: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  /**
   * Get application logs
   */
  async getApplicationLogs(appName: string, hours: number = 24): Promise<unknown[]> {
    const kqlQuery = \`
      AppTraces
      | where AppRoleName == '\${appName}'
      | where TimeGenerated >= ago(\${hours}h)
      | order by TimeGenerated desc
      | limit 1000
    \`;

    return this.query(kqlQuery);
  }

  /**
   * Get error logs
   */
  async getErrorLogs(appName: string, hours: number = 24): Promise<unknown[]> {
    const kqlQuery = \`
      AppExceptions
      | where AppRoleName == '\${appName}'
      | where TimeGenerated >= ago(\${hours}h)
      | order by TimeGenerated desc
      | limit 1000
    \`;

    return this.query(kqlQuery);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(appName: string, hours: number = 24): Promise<unknown[]> {
    const kqlQuery = \`
      AppMetrics
      | where AppRoleName == '\${appName}'
      | where TimeGenerated >= ago(\${hours}h)
      | summarize avg(Value) by Name, bin(TimeGenerated, 1h)
      | order by TimeGenerated desc
    \`;

    return this.query(kqlQuery);
  }
}

// Export singleton instance
export const azureLogAnalytics = new AzureLogAnalytics({
  workspaceId: process.env.AZURE_LOG_ANALYTICS_WORKSPACE_ID || ''
});`;
	}

	// Helper methods for Terraform generation

	private generateTerraformStorageAccount(options: AzureCloudOptions): string {
		return `# Storage Account
resource "azurerm_storage_account" "main" {
  name                     = "\${replace(local.name_prefix, "-", "")}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.storage_account_type

  enable_https_traffic_only = true
  min_tls_version          = "TLS1_2"

  blob_properties {
    cors_rule {
      allowed_origins    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
      allowed_headers    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 86400
    }
  }

  tags = local.common_tags
}`;
	}

	private generateTerraformAppService(options: AzureCloudOptions): string {
		return `# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "\${local.name_prefix}-asp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = local.common_tags
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = "\${local.name_prefix}-app"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "${options.appService.version}"
    }
    
    always_on = true
    http2_enabled = true
    minimum_tls_version = "1.2"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "${options.appService.version}"
    "NODE_ENV" = "production"
  }

  https_only = true

  tags = local.common_tags
}`;
	}

	private generateTerraformFunctionApp(options: AzureCloudOptions): string {
		return `# Function App
resource "azurerm_linux_function_app" "main" {
  name                = "\${local.name_prefix}-func"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "${options.functions.version}"
    }
  }

  app_settings = {
    "FUNCTIONS_EXTENSION_VERSION" = "~4"
    "FUNCTIONS_WORKER_RUNTIME"    = "${options.functions.runtime}"
  }

  tags = local.common_tags
}`;
	}

	private generateTerraformDatabase(options: AzureCloudOptions): string {
		if (options.database.type === "cosmosdb") {
			return `# Cosmos DB
resource "azurerm_cosmosdb_account" "main" {
  name                = "\${local.name_prefix}-cosmos"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level       = "${options.database.consistencyLevel || "Session"}"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  capabilities {
    name = "EnableServerless"
  }

  tags = local.common_tags
}`;
		}
		return "";
	}

	private generateTerraformKeyVault(options: AzureCloudOptions): string {
		return `# Key Vault
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                        = "\${local.name_prefix}-kv"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "${options.keyVault.sku}"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Create", "Delete", "Update", "Import", "Backup", "Restore"
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Backup", "Restore"
    ]

    certificate_permissions = [
      "Get", "List", "Create", "Delete", "Update", "Import"
    ]
  }

  tags = local.common_tags
}`;
	}

	private generateTerraformCognitiveServices(options: AzureCloudOptions): string {
		let resources = "";
		for (const service of options.cognitiveServices.services) {
			resources += `
# Cognitive Service: ${service.name}
resource "azurerm_cognitive_account" "${service.name.toLowerCase()}" {
  name                = "\${local.name_prefix}-${service.name.toLowerCase()}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "${service.kind}"

  sku_name = "${service.sku}"

  tags = local.common_tags
}
`;
		}
		return resources;
	}

	private generateTerraformApplicationInsights(options: AzureCloudOptions): string {
		return `# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "\${local.name_prefix}-ai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = local.common_tags
}`;
	}

	private generateTerraformNetworking(options: AzureCloudOptions): string {
		return `# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "\${local.name_prefix}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = local.common_tags
}

# Subnets
${options.networking.subnets.map((subnet, index) => `
resource "azurerm_subnet" "${subnet.name}" {
  name                 = "${subnet.name}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["${subnet.addressPrefix}"]
}
`).join('')}`;
	}

	private generateAzurePipeline(options: AzureCloudOptions): string {
		return `# Azure DevOps Pipeline
# Generated by Xaheen CLI Azure Generator

trigger:
- main

variables:
  azureSubscription: '${options.subscriptionId}'
  resourceGroupName: '${options.resourceGroupName}'
  location: '${options.location}'

stages:
- stage: Build
  displayName: 'Build Stage'
  jobs:
  - job: Build
    displayName: 'Build Job'
    pool:
      vmImage: 'ubuntu-latest'
    
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - script: |
        npm ci
        npm run build
        npm run test
      displayName: 'Build and Test'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '$(Build.SourcesDirectory)'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
        replaceExistingArchive: true
      displayName: 'Archive Files'
    
    - publish: '$(Build.ArtifactStagingDirectory)'
      artifact: 'drop'
      displayName: 'Publish Artifact'

- stage: Deploy
  displayName: 'Deploy Stage'
  dependsOn: Build
  condition: succeeded()
  
  jobs:
  - deployment: Deploy
    displayName: 'Deploy Job'
    pool:
      vmImage: 'ubuntu-latest'
    environment: 'production'
    
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureResourceManagerTemplateDeployment@3
            inputs:
              deploymentScope: 'Resource Group'
              azureResourceManagerConnection: '$(azureSubscription)'
              subscriptionId: '${options.subscriptionId}'
              action: 'Create Or Update Resource Group'
              resourceGroupName: '$(resourceGroupName)'
              location: '$(location)'
              templateLocation: 'Linked artifact'
              csmFile: '$(Pipeline.Workspace)/drop/azure/arm-template.json'
              csmParametersFile: '$(Pipeline.Workspace)/drop/azure/parameters.json'
              deploymentMode: 'Incremental'
            displayName: 'Deploy ARM Template'
          
          ${options.appService.enabled ? `
          - task: AzureWebApp@1
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'webAppLinux'
              appName: '$(resourceGroupName)-app'
              package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
              runtimeStack: 'NODE|${options.appService.version}'
            displayName: 'Deploy Web App'
          ` : ''}
          
          ${options.functions.enabled ? `
          - task: AzureFunctionApp@1
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'functionAppLinux'
              appName: '$(resourceGroupName)-func'
              package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
              runtimeStack: 'NODE|${options.functions.version}'
            displayName: 'Deploy Function App'
          ` : ''}`;
	}

	private generateAzureConfig(options: AzureCloudOptions): string {
		return `/**
 * Azure SDK Configuration
 * Generated by Xaheen CLI Azure Generator
 */

export const azureConfig = {
  subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || '${options.subscriptionId}',
  resourceGroupName: process.env.AZURE_RESOURCE_GROUP_NAME || '${options.resourceGroupName}',
  location: process.env.AZURE_LOCATION || '${options.location}',
  
  ${options.storage.enabled ? `
  storage: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || ''
  },
  ` : ''}
  
  ${options.keyVault.enabled ? `
  keyVault: {
    url: process.env.AZURE_KEY_VAULT_URL || ''
  },
  ` : ''}
  
  ${options.database.enabled && options.database.type === 'cosmosdb' ? `
  cosmosDb: {
    endpoint: process.env.AZURE_COSMOS_ENDPOINT || '',
    key: process.env.AZURE_COSMOS_KEY || '',
    databaseId: process.env.AZURE_COSMOS_DATABASE_ID || 'xaheen-db'
  },
  ` : ''}
  
  ${options.monitoring.applicationInsights ? `
  applicationInsights: {
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '',
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || ''
  },
  ` : ''}
  
  ${options.cognitiveServices.enabled ? `
  cognitiveServices: {
    ${options.cognitiveServices.services.map(service => `
    ${service.name.toLowerCase()}: {
      endpoint: process.env.AZURE_${service.kind.toUpperCase()}_ENDPOINT || '',
      key: process.env.AZURE_${service.kind.toUpperCase()}_KEY || ''
    }`).join(',')}
    ${options.cognitiveServices.openAI ? `,
    openAI: {
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
      deploymentId: process.env.AZURE_OPENAI_DEPLOYMENT_ID || '',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15'
    }` : ''}
  },
  ` : ''}
} as const;

export type AzureConfig = typeof azureConfig;`;
	}

	private generateAzureIndex(options: AzureCloudOptions): string {
		return `/**
 * Azure Services Index
 * Generated by Xaheen CLI Azure Generator
 */

export { azureConfig } from './config.js';
export type { AzureConfig } from './config.js';

${options.storage.enabled ? `
// Storage Services
export { azureStorage } from './storage/client.js';
${options.storage.blobStorage ? `export { azureBlobService } from './storage/blob-service.js';` : ''}
${options.storage.queueStorage ? `export { azureQueueService } from './storage/queue-service.js';` : ''}
${options.storage.tableStorage ? `export { azureTableService } from './storage/table-service.js';` : ''}
` : ''}

${options.database.enabled ? `
// Database Services
${options.database.type === 'cosmosdb' ? `export { azureCosmosClient } from './database/cosmos-client.js';` : ''}
${options.database.type === 'sqlserver' ? `export { azureSQLClient } from './database/sql-client.js';` : ''}
` : ''}

${options.keyVault.enabled ? `
// Key Vault Services
export { azureKeyVaultClient } from './keyvault/client.js';
export { azureSecretsService } from './keyvault/secrets-service.js';
` : ''}

${options.cognitiveServices.enabled ? `
// Cognitive Services
${options.cognitiveServices.services.map(service => `export { azure${service.kind}Client } from './cognitive/${service.name.toLowerCase()}-client.js';`).join('\n')}
${options.cognitiveServices.openAI ? `export { azureOpenAIService } from './cognitive/openai-service.js';` : ''}
` : ''}

${options.monitoring.applicationInsights ? `
// Monitoring Services
export { azureApplicationInsights } from './monitoring/application-insights.js';
${options.monitoring.logAnalytics ? `export { azureLogAnalytics } from './monitoring/log-analytics.js';` : ''}
` : ''}

// Types
export * from './types.js';`;
	}

	private generateAzureTypes(options: AzureCloudOptions): string {
		return `/**
 * Azure Types Definitions
 * Generated by Xaheen CLI Azure Generator
 */

${options.storage.enabled ? `
// Storage Types
${options.storage.blobStorage ? `
export interface BlobUploadOptions {
  readonly containerName: string;
  readonly blobName: string;
  readonly data: Buffer | string;
  readonly contentType?: string;
  readonly metadata?: Record<string, string>;
}

export interface BlobDownloadOptions {
  readonly containerName: string;
  readonly blobName: string;
}
` : ''}

${options.storage.queueStorage ? `
export interface QueueMessage {
  readonly messageText: string;
  readonly visibilityTimeoutInSeconds?: number;
  readonly messageTimeToLiveInSeconds?: number;
}
` : ''}

${options.storage.tableStorage ? `
export interface TableEntity {
  readonly partitionKey: string;
  readonly rowKey: string;
  readonly [key: string]: unknown;
}
` : ''}
` : ''}

${options.database.enabled && options.database.type === 'cosmosdb' ? `
// Cosmos DB Types
export interface CosmosConfig {
  readonly endpoint: string;
  readonly key: string;
  readonly databaseId: string;
}
` : ''}

${options.keyVault.enabled ? `
// Key Vault Types
export interface KeyVaultConfig {
  readonly vaultUrl: string;
}

export interface SecretDefinition {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly defaultValue?: string;
}
` : ''}

${options.cognitiveServices.enabled ? `
// Cognitive Services Types
${options.cognitiveServices.services.map(service => `
export interface ${service.kind}Config {
  readonly endpoint: string;
  readonly key: string;
}
`).join('')}

${options.cognitiveServices.openAI ? `
export interface AzureOpenAIConfig {
  readonly apiKey: string;
  readonly resourceName: string;
  readonly deploymentId: string;
  readonly apiVersion?: string;
}
` : ''}
` : ''}

${options.monitoring.applicationInsights ? `
// Monitoring Types
export interface ApplicationInsightsConfig {
  readonly instrumentationKey: string;
  readonly connectionString: string;
}

${options.monitoring.logAnalytics ? `
export interface LogAnalyticsConfig {
  readonly workspaceId: string;
}
` : ''}
` : ''}

// Common Types
export interface AzureServiceResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface AzureServiceConfig {
  readonly endpoint: string;
  readonly credential: string;
}`;
	}

	/**
	 * Generate next steps based on configuration
	 */
	private generateNextSteps(options: AzureCloudOptions): string[] {
		const steps = [
			"Review the generated Azure configuration files",
			"Set up Azure CLI: az login",
			"Set subscription: az account set --subscription " + options.subscriptionId,
			"Create resource group: az group create --name " + options.resourceGroupName + " --location " + options.location,
			"Deploy ARM template: az deployment group create --resource-group " + options.resourceGroupName + " --template-file azure/arm-template.json",
		];

		if (options.storage.enabled) {
			steps.push("Configure storage account CORS settings");
		}

		if (options.appService.enabled) {
			steps.push("Deploy application to App Service");
		}

		if (options.functions.enabled) {
			steps.push("Deploy Azure Functions using func CLI");
		}

		if (options.keyVault.enabled) {
			steps.push("Configure Key Vault access policies");
			steps.push("Add required secrets to Key Vault");
		}

		if (options.cognitiveServices.enabled) {
			steps.push("Test Cognitive Services endpoints");
		}

		if (options.monitoring.applicationInsights) {
			steps.push("Verify Application Insights telemetry");
		}

		if (options.devOps.enabled) {
			steps.push("Set up Azure DevOps pipeline");
		}

		steps.push(
			"Test all Azure service integrations",
			"Set up monitoring and alerts",
			"Configure backup and disaster recovery",
			"Review security settings and compliance"
		);

		return steps;
	}
}

/**
 * Factory function to create AzureCloudGenerator instance
 */
export function createAzureCloudGenerator(): AzureCloudGenerator {
	return new AzureCloudGenerator();
}
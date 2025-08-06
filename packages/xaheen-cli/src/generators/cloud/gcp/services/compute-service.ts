/**
 * GCP Compute Service Implementation
 * Handles Cloud Functions and Cloud Run following Single Responsibility Principle
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index";
import { 
  IGCPComputeService, 
  ValidationResult,
  ValidationError,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig, 
  GCPComputeConfig, 
  GCPCloudFunctionsConfig,
  GCPCloudRunConfig
} from "../interfaces/index.js";
import { BaseGCPService } from "./base-service";

export class GCPComputeService extends BaseGCPService implements IGCPComputeService {
  private readonly computeConfig: GCPComputeConfig;

  constructor(
    baseConfig: GCPBaseConfig,
    computeConfig: GCPComputeConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.computeConfig = computeConfig;
  }

  get name(): string {
    return "gcp-compute";
  }

  isEnabled(): boolean {
    return this.computeConfig.cloudFunctions.enabled || this.computeConfig.cloudRun.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.computeConfig.cloudFunctions.enabled) {
      files.push(...await this.generateCloudFunctions(outputDir));
    }

    if (this.computeConfig.cloudRun.enabled) {
      files.push(...await this.generateCloudRun(outputDir));
    }

    return files;
  }

  async generateCloudFunctions(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    const config = this.computeConfig.cloudFunctions;

    // Generate Terraform configuration
    files.push(this.createFile(
      `${outputDir}/terraform/cloud-functions.tf`,
      this.generateCloudFunctionsTerraform(config),
      "terraform"
    ));

    // Generate deployment script
    files.push(this.createFile(
      `${outputDir}/scripts/deploy-functions.sh`,
      this.generateFunctionsDeployScript(config),
      "script"
    ));

    // Generate package.json for Node.js functions
    if (config.runtime.startsWith("nodejs")) {
      files.push(this.createFile(
        `${outputDir}/functions/package.json`,
        this.generateFunctionsPackageJson(config),
        "json"
      ));
    }

    // Generate sample function code
    files.push(this.createFile(
      `${outputDir}/functions/index.${this.getFileExtension(config.runtime)}`,
      this.generateSampleFunctionCode(config),
      "script"
    ));

    return files;
  }

  async generateCloudRun(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    const config = this.computeConfig.cloudRun;

    // Generate Terraform configuration
    files.push(this.createFile(
      `${outputDir}/terraform/cloud-run.tf`,
      this.generateCloudRunTerraform(config),
      "terraform"
    ));

    // Generate deployment script
    files.push(this.createFile(
      `${outputDir}/scripts/deploy-cloud-run.sh`,
      this.generateCloudRunDeployScript(config),
      "script"
    ));

    // Generate Dockerfile for each service
    for (const service of config.services) {
      files.push(this.createFile(
        `${outputDir}/services/${service.name}/Dockerfile`,
        this.generateDockerfile(service),
        "script"
      ));
    }

    // Generate Cloud Run YAML configuration
    files.push(this.createFile(
      `${outputDir}/cloud-run/service.yaml`,
      this.generateCloudRunServiceYaml(config),
      "yaml"
    ));

    return files;
  }

  async validateComputeConfig(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings = [];

    // Validate Cloud Functions config
    if (this.computeConfig.cloudFunctions.enabled) {
      const functionsValidation = this.validateCloudFunctionsConfig(this.computeConfig.cloudFunctions);
      errors.push(...functionsValidation);
    }

    // Validate Cloud Run config
    if (this.computeConfig.cloudRun.enabled) {
      const cloudRunValidation = this.validateCloudRunConfig(this.computeConfig.cloudRun);
      errors.push(...cloudRunValidation);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async validateServiceConfig(): Promise<ValidationResult> {
    return this.validateComputeConfig();
  }

  private validateCloudFunctionsConfig(config: GCPCloudFunctionsConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    const runtimeValidation = this.validateEnum(
      config.runtime,
      ["nodejs20", "nodejs18", "python311", "python39", "go121", "java17"],
      "cloudFunctions.runtime"
    );
    if (runtimeValidation) errors.push(runtimeValidation);

    const memoryValidation = this.validateEnum(
      config.memory,
      ["128MB", "256MB", "512MB", "1GB", "2GB", "4GB", "8GB"],
      "cloudFunctions.memory"
    );
    if (memoryValidation) errors.push(memoryValidation);

    const timeoutValidation = this.validateRange(
      config.timeout,
      1,
      540,
      "cloudFunctions.timeout"
    );
    if (timeoutValidation) errors.push(timeoutValidation);

    if (config.triggers.length === 0) {
      errors.push({
        field: "cloudFunctions.triggers",
        message: "At least one trigger must be configured",
        severity: "error"
      });
    }

    return errors;
  }

  private validateCloudRunConfig(config: GCPCloudRunConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.services.length === 0) {
      errors.push({
        field: "cloudRun.services",
        message: "At least one service must be configured",
        severity: "error"
      });
    }

    const minInstancesValidation = this.validateRange(
      config.scaling.minInstances,
      0,
      1000,
      "cloudRun.scaling.minInstances"
    );
    if (minInstancesValidation) errors.push(minInstancesValidation);

    const maxInstancesValidation = this.validateRange(
      config.scaling.maxInstances,
      1,
      1000,
      "cloudRun.scaling.maxInstances"
    );
    if (maxInstancesValidation) errors.push(maxInstancesValidation);

    if (config.scaling.minInstances > config.scaling.maxInstances) {
      errors.push({
        field: "cloudRun.scaling",
        message: "minInstances cannot be greater than maxInstances",
        severity: "error"
      });
    }

    return errors;
  }

  private generateCloudFunctionsTerraform(config: GCPCloudFunctionsConfig): string {
    return `
# Cloud Functions Configuration
resource "google_cloudfunctions2_function" "functions" {
  for_each = var.cloud_functions

  name        = each.key
  location    = var.region
  description = "Generated Cloud Function"

  build_config {
    runtime     = "${config.runtime}"
    entry_point = "main"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.functions_source[each.key].name
      }
    }
  }

  service_config {
    max_instance_count    = ${config.maxInstances || 100}
    min_instance_count    = ${config.minInstances || 0}
    available_memory      = "${config.memory}"
    timeout_seconds       = ${config.timeout}
    available_cpu        = "1"
    max_instance_request_concurrency = 80
    
    ${config.environmentVariables ? `
    environment_variables = {
      ${Object.entries(config.environmentVariables).map(([key, value]) => `${key} = "${value}"`).join('\n      ')}
    }
    ` : ''}

    ${config.serviceAccount ? `service_account_email = "${config.serviceAccount}"` : ''}
    ${config.vpcConnector ? `vpc_connector = "${config.vpcConnector}"` : ''}
    ${config.ingressSettings ? `ingress_settings = "${config.ingressSettings}"` : ''}
  }

  labels = {
    ${Object.entries(this.addLabels()).map(([key, value]) => `${key} = "${value}"`).join('\n    ')}
  }
}

# Source bucket for Cloud Functions
resource "google_storage_bucket" "functions_source" {
  name     = "${this.getResourceName("functions-source")}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Function source objects
resource "google_storage_bucket_object" "functions_source" {
  for_each = var.cloud_functions

  name   = "\${each.key}-source.zip"
  bucket = google_storage_bucket.functions_source.name
  source = "./functions/\${each.key}.zip"
}
`;
  }

  private generateCloudRunTerraform(config: GCPCloudRunConfig): string {
    return `
# Cloud Run Services
resource "google_cloud_run_v2_service" "services" {
  for_each = var.cloud_run_services

  name     = each.key
  location = var.region
  ingress  = "${config.networking.ingress.toUpperCase()}"

  template {
    scaling {
      min_instance_count = ${config.scaling.minInstances}
      max_instance_count = ${config.scaling.maxInstances}
    }

    containers {
      image = each.value.image
      ports {
        container_port = each.value.port
      }

      resources {
        limits = {
          cpu    = each.value.cpu
          memory = each.value.memory
        }
      }

      ${config.networking.vpcAccess ? `
      vpc_access {
        connector = "${config.networking.vpcAccess}"
        egress    = "PRIVATE_RANGES_ONLY"
      }
      ` : ''}
    }

    max_instance_request_concurrency = ${config.scaling.concurrency}
    execution_environment           = "EXECUTION_ENVIRONMENT_GEN2"
    ${config.scaling.cpuThrottling ? 'cpu_throttling = true' : ''}
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  labels = {
    ${Object.entries(this.addLabels()).map(([key, value]) => `${key} = "${value}"`).join('\n    ')}
  }
}

# IAM for Cloud Run services
resource "google_cloud_run_service_iam_member" "invoker" {
  for_each = var.cloud_run_services

  service  = google_cloud_run_v2_service.services[each.key].name
  location = google_cloud_run_v2_service.services[each.key].location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
`;
  }

  private generateFunctionsDeployScript(config: GCPCloudFunctionsConfig): string {
    return `#!/bin/bash
set -e

echo "Deploying Cloud Functions..."

# Set project
gcloud config set project ${this.config.projectId}

# Deploy functions
${config.triggers.map(trigger => `
gcloud functions deploy function-${trigger.type} \\
  --runtime ${config.runtime} \\
  --trigger-${trigger.type} \\
  --memory ${config.memory} \\
  --timeout ${config.timeout}s \\
  --region ${this.config.region} \\
  --source ./functions \\
  --entry-point main
`).join('\n')}

echo "Cloud Functions deployed successfully!"
`;
  }

  private generateCloudRunDeployScript(config: GCPCloudRunConfig): string {
    return `#!/bin/bash
set -e

echo "Deploying Cloud Run services..."

# Set project
gcloud config set project ${this.config.projectId}

${config.services.map(service => `
# Deploy ${service.name}
echo "Deploying ${service.name}..."
gcloud run deploy ${service.name} \\
  --image ${service.image} \\
  --platform managed \\
  --region ${this.config.region} \\
  --memory ${service.memory} \\
  --cpu ${service.cpu} \\
  --port ${service.port} \\
  --min-instances ${config.scaling.minInstances} \\
  --max-instances ${config.scaling.maxInstances} \\
  --concurrency ${config.scaling.concurrency} \\
  --ingress ${config.networking.ingress} \\
  --allow-unauthenticated
`).join('\n')}

echo "Cloud Run services deployed successfully!"
`;
  }

  private generateFunctionsPackageJson(config: GCPCloudFunctionsConfig): string {
    return JSON.stringify({
      name: "gcp-cloud-functions",
      version: "1.0.0",
      description: "Generated Cloud Functions",
      main: "index.js",
      engines: {
        node: config.runtime.replace("nodejs", "")
      },
      dependencies: {
        "@google-cloud/functions-framework": "^3.0.0"
      },
      scripts: {
        start: "functions-framework --target=main",
        deploy: "./scripts/deploy-functions.sh"
      }
    }, null, 2);
  }

  private generateSampleFunctionCode(config: GCPCloudFunctionsConfig): string {
    if (config.runtime.startsWith("nodejs")) {
      return `const functions = require('@google-cloud/functions-framework');

functions.http('main', (req, res) => {
  console.log('Function triggered');
  res.status(200).send('Hello from Cloud Function!');
});
`;
    } else if (config.runtime.startsWith("python")) {
      return `import functions_framework

@functions_framework.http
def main(request):
    print('Function triggered')
    return 'Hello from Cloud Function!'
`;
    } else if (config.runtime.startsWith("go")) {
      return `package main

import (
    "fmt"
    "net/http"
    "github.com/GoogleCloudPlatform/functions-framework-go/functions"
)

func init() {
    functions.HTTP("main", hello)
}

func hello(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Function triggered")
    fmt.Fprint(w, "Hello from Cloud Function!")
}
`;
    }

    return `// Sample function code for ${config.runtime}`;
  }

  private generateDockerfile(service: any): string {
    return `FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE ${service.port}

USER node

CMD ["npm", "start"]
`;
  }

  private generateCloudRunServiceYaml(config: GCPCloudRunConfig): string {
    return `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cloud-run-service
  annotations:
    run.googleapis.com/ingress: ${config.networking.ingress}
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "${config.scaling.minInstances}"
        autoscaling.knative.dev/maxScale: "${config.scaling.maxInstances}"
        run.googleapis.com/cpu-throttling: "${config.scaling.cpuThrottling}"
    spec:
      containerConcurrency: ${config.scaling.concurrency}
      containers:
      - image: gcr.io/${this.config.projectId}/sample-service
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
`;
  }

  private getFileExtension(runtime: string): string {
    if (runtime.startsWith("nodejs")) return "js";
    if (runtime.startsWith("python")) return "py";
    if (runtime.startsWith("go")) return "go";
    if (runtime.startsWith("java")) return "java";
    return "txt";
  }
}
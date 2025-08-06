/**
 * GCP Storage Service Implementation
 * Handles Cloud Storage and Firestore following Single Responsibility Principle
 */

import { GeneratedInfrastructureFile } from "../../../infrastructure/index";
import { 
  IGCPStorageService, 
  ValidationResult,
  ValidationError,
  IGCPTemplateGenerator,
  IGCPConfigurationManager
} from "../interfaces/service-interfaces.js";
import { 
  GCPBaseConfig, 
  GCPStorageConfig, 
  GCPCloudStorageConfig,
  GCPFirestoreConfig,
  GCPStorageBucket,
  GCPFirestoreCollection
} from "../interfaces/index.js";
import { BaseGCPService } from "./base-service";

export class GCPStorageService extends BaseGCPService implements IGCPStorageService {
  private readonly storageConfig: GCPStorageConfig;

  constructor(
    baseConfig: GCPBaseConfig,
    storageConfig: GCPStorageConfig,
    templateGenerator: IGCPTemplateGenerator,
    configManager: IGCPConfigurationManager
  ) {
    super(baseConfig, templateGenerator, configManager);
    this.storageConfig = storageConfig;
  }

  get name(): string {
    return "gcp-storage";
  }

  isEnabled(): boolean {
    return this.storageConfig.cloudStorage.enabled || this.storageConfig.firestore.enabled;
  }

  async generateFiles(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];

    if (this.storageConfig.cloudStorage.enabled) {
      files.push(...await this.generateCloudStorage(outputDir));
    }

    if (this.storageConfig.firestore.enabled) {
      files.push(...await this.generateFirestore(outputDir));
    }

    return files;
  }

  async generateCloudStorage(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    const config = this.storageConfig.cloudStorage;

    // Generate Terraform configuration
    files.push(this.createFile(
      `${outputDir}/terraform/cloud-storage.tf`,
      this.generateCloudStorageTerraform(config),
      "terraform"
    ));

    // Generate bucket policies
    files.push(this.createFile(
      `${outputDir}/storage/bucket-policies.json`,
      this.generateBucketPolicies(config),
      "json"
    ));

    // Generate lifecycle configuration
    if (config.lifecycle) {
      files.push(this.createFile(
        `${outputDir}/storage/lifecycle-rules.json`,
        this.generateLifecycleRules(config),
        "json"
      ));
    }

    // Generate CORS configuration
    if (config.cors) {
      files.push(this.createFile(
        `${outputDir}/storage/cors-config.json`,
        this.generateCORSConfig(config),
        "json"
      ));
    }

    // Generate management scripts
    files.push(this.createFile(
      `${outputDir}/scripts/storage-management.sh`,
      this.generateStorageManagementScript(config),
      "script"
    ));

    return files;
  }

  async generateFirestore(outputDir: string): Promise<GeneratedInfrastructureFile[]> {
    const files: GeneratedInfrastructureFile[] = [];
    const config = this.storageConfig.firestore;

    // Generate Terraform configuration
    files.push(this.createFile(
      `${outputDir}/terraform/firestore.tf`,
      this.generateFirestoreTerraform(config),
      "terraform"
    ));

    // Generate security rules
    if (config.securityRules) {
      files.push(this.createFile(
        `${outputDir}/firestore/firestore.rules`,
        this.generateFirestoreRules(config),
        "script"
      ));
    }

    // Generate indexes configuration
    files.push(this.createFile(
      `${outputDir}/firestore/firestore.indexes.json`,
      this.generateFirestoreIndexes(config),
      "json"
    ));

    // Generate data models
    files.push(this.createFile(
      `${outputDir}/firestore/models.ts`,
      this.generateFirestoreModels(config),
      "script"
    ));

    // Generate SDK configuration
    files.push(this.createFile(
      `${outputDir}/firestore/config.ts`,
      this.generateFirestoreSDKConfig(config),
      "script"
    ));

    return files;
  }

  async validateStorageConfig(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings = [];

    // Validate Cloud Storage config
    if (this.storageConfig.cloudStorage.enabled) {
      const storageValidation = this.validateCloudStorageConfig(this.storageConfig.cloudStorage);
      errors.push(...storageValidation);
    }

    // Validate Firestore config
    if (this.storageConfig.firestore.enabled) {
      const firestoreValidation = this.validateFirestoreConfig(this.storageConfig.firestore);
      errors.push(...firestoreValidation);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async validateServiceConfig(): Promise<ValidationResult> {
    return this.validateStorageConfig();
  }

  private validateCloudStorageConfig(config: GCPCloudStorageConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.buckets.length === 0) {
      errors.push({
        field: "cloudStorage.buckets",
        message: "At least one bucket must be configured",
        severity: "error"
      });
    }

    // Validate each bucket
    config.buckets.forEach((bucket, index) => {
      const bucketErrors = this.validateStorageBucket(bucket, `cloudStorage.buckets[${index}]`);
      errors.push(...bucketErrors);
    });

    return errors;
  }

  private validateFirestoreConfig(config: GCPFirestoreConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    const modeValidation = this.validateEnum(
      config.mode,
      ["NATIVE", "DATASTORE"],
      "firestore.mode"
    );
    if (modeValidation) errors.push(modeValidation);

    const locationValidation = this.validateRequired(
      config.locationId,
      "firestore.locationId"
    );
    if (locationValidation) errors.push(locationValidation);

    // Validate collections
    config.collections.forEach((collection, index) => {
      const collectionErrors = this.validateFirestoreCollection(collection, `firestore.collections[${index}]`);
      errors.push(...collectionErrors);
    });

    return errors;
  }

  private validateStorageBucket(bucket: GCPStorageBucket, fieldPrefix: string): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameValidation = this.validateRequired(bucket.name, `${fieldPrefix}.name`);
    if (nameValidation) errors.push(nameValidation);

    const locationValidation = this.validateRequired(bucket.location, `${fieldPrefix}.location`);
    if (locationValidation) errors.push(locationValidation);

    const storageClassValidation = this.validateEnum(
      bucket.storageClass,
      ["STANDARD", "NEARLINE", "COLDLINE", "ARCHIVE"],
      `${fieldPrefix}.storageClass`
    );
    if (storageClassValidation) errors.push(storageClassValidation);

    return errors;
  }

  private validateFirestoreCollection(collection: GCPFirestoreCollection, fieldPrefix: string): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameValidation = this.validateRequired(collection.name, `${fieldPrefix}.name`);
    if (nameValidation) errors.push(nameValidation);

    if (collection.fields.length === 0) {
      errors.push({
        field: `${fieldPrefix}.fields`,
        message: "Collection must have at least one field",
        severity: "error"
      });
    }

    return errors;
  }

  private generateCloudStorageTerraform(config: GCPCloudStorageConfig): string {
    return `
# Cloud Storage Buckets
${config.buckets.map(bucket => `
resource "google_storage_bucket" "${bucket.name.replace(/-/g, '_')}" {
  name          = "${bucket.name}"
  location      = "${bucket.location}"
  storage_class = "${bucket.storageClass}"

  ${config.uniformBucketLevelAccess ? 'uniform_bucket_level_access = true' : ''}
  ${config.versioning ? `
  versioning {
    enabled = true
  }
  ` : ''}

  ${config.encryption ? `
  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }
  ` : ''}

  ${config.lifecycle && bucket.lifecycleRules ? `
  lifecycle_rule {
    ${bucket.lifecycleRules.map(rule => `
    condition {
      ${rule.condition.age ? `age = ${rule.condition.age}` : ''}
      ${rule.condition.createdBefore ? `created_before = "${rule.condition.createdBefore}"` : ''}
      ${rule.condition.numNewerVersions ? `num_newer_versions = ${rule.condition.numNewerVersions}` : ''}
    }
    action {
      type = "${rule.action}"
      ${rule.action === "SetStorageClass" ? `storage_class = "NEARLINE"` : ''}
    }
    `).join('')}
  }
  ` : ''}

  ${bucket.retentionPolicy ? `
  retention_policy {
    retention_period = ${bucket.retentionPolicy.retentionPeriod}
    is_locked        = ${bucket.retentionPolicy.isLocked}
  }
  ` : ''}

  labels = {
    ${Object.entries(this.addLabels()).map(([key, value]) => `${key} = "${value}"`).join('\n    ')}
  }
}

${!config.publicAccess ? `
# Prevent public access
resource "google_storage_bucket_iam_binding" "${bucket.name.replace(/-/g, '_')}_prevent_public" {
  bucket = google_storage_bucket.${bucket.name.replace(/-/g, '_')}.name
  role   = "roles/storage.objectViewer"
  members = [
    "projectEditor:${this.config.projectId}",
    "projectOwner:${this.config.projectId}",
  ]
}
` : ''}
`).join('\n')}

${config.cors ? `
# CORS configuration
resource "google_storage_bucket_cors" "cors" {
  for_each = { for bucket in var.storage_buckets : bucket.name => bucket }

  bucket = google_storage_bucket[each.key].name
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}
` : ''}

${config.encryption ? `
# KMS key for encryption
resource "google_kms_crypto_key" "storage_key" {
  name     = "${this.getResourceName('storage-key')}"
  key_ring = google_kms_key_ring.storage_keyring.id
  purpose  = "ENCRYPT_DECRYPT"

  version_template {
    algorithm = "GOOGLE_SYMMETRIC_ENCRYPTION"
  }
}

resource "google_kms_key_ring" "storage_keyring" {
  name     = "${this.getResourceName('storage-keyring')}"
  location = var.region
}
` : ''}
`;
  }

  private generateFirestoreTerraform(config: GCPFirestoreConfig): string {
    return `
# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = "${config.locationId}"
  type        = "${config.mode}"

  ${config.pointInTimeRecovery ? 'point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_ENABLED"' : ''}
  ${config.deleteProtectionState ? 'delete_protection_state = "DELETE_PROTECTION_ENABLED"' : ''}
}

# Firestore Indexes
${config.collections.filter(col => col.indexes && col.indexes.length > 0).map(collection => 
  collection.indexes!.map((index, i) => `
resource "google_firestore_index" "${collection.name}_index_${i}" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "${collection.name}"

  ${index.fields.map((field, j) => `
  fields {
    field_path = "${field}"
    order      = "${index.order[j] || 'ASCENDING'}"
  }
  `).join('')}
}
  `).join('')
).join('')}

# Security Rules Deployment
resource "google_firebaserules_ruleset" "firestore" {
  source {
    files {
      name    = "firestore.rules"
      content = file("./firestore/firestore.rules")
    }
  }
}

resource "google_firebaserules_release" "firestore" {
  name         = "cloud.firestore"
  ruleset_name = google_firebaserules_ruleset.firestore.name
}
`;
  }

  private generateBucketPolicies(config: GCPCloudStorageConfig): string {
    const policies = config.buckets.map(bucket => ({
      bucket: bucket.name,
      bindings: [
        {
          role: "roles/storage.objectViewer",
          members: config.publicAccess ? ["allUsers"] : [`projectViewer:${this.config.projectId}`]
        },
        {
          role: "roles/storage.objectCreator",
          members: [`projectEditor:${this.config.projectId}`]
        }
      ]
    }));

    return JSON.stringify({ policies }, null, 2);
  }

  private generateLifecycleRules(config: GCPCloudStorageConfig): string {
    const rules = config.buckets.flatMap(bucket => 
      bucket.lifecycleRules || []
    );

    return JSON.stringify({ lifecycle: { rule: rules } }, null, 2);
  }

  private generateCORSConfig(config: GCPCloudStorageConfig): string {
    const corsConfig = {
      cors: [
        {
          origin: ["*"],
          method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
          responseHeader: ["Content-Type", "x-goog-resumable"],
          maxAgeSeconds: 3600
        }
      ]
    };

    return JSON.stringify(corsConfig, null, 2);
  }

  private generateFirestoreRules(config: GCPFirestoreConfig): string {
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Generated security rules for Firestore
    
    ${config.collections.map(collection => `
    // Rules for ${collection.name} collection
    match /${collection.name}/{document} {
      allow read, write: if request.auth != null;
      
      // Validate document structure
      allow create: if validateDocument(resource.data);
      allow update: if validateDocument(request.resource.data);
    }
    `).join('\n')}
    
    // Validation functions
    function validateDocument(data) {
      return data.keys().hasAll(['createdAt', 'updatedAt']) &&
             data.createdAt is timestamp &&
             data.updatedAt is timestamp;
    }
    
    // User-specific data access
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
  }

  private generateFirestoreIndexes(config: GCPFirestoreConfig): string {
    const indexes = {
      indexes: config.collections.flatMap(collection => 
        (collection.indexes || []).map(index => ({
          collectionGroup: collection.name,
          queryScope: "COLLECTION",
          fields: index.fields.map((field, i) => ({
            fieldPath: field,
            order: index.order[i] || "ASCENDING"
          }))
        }))
      )
    };

    return JSON.stringify(indexes, null, 2);
  }

  private generateFirestoreModels(config: GCPFirestoreConfig): string {
    return `// Generated Firestore TypeScript models

export interface BaseDocument {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
}

${config.collections.map(collection => `
export interface ${this.capitalize(collection.name)}Document extends BaseDocument {
  ${collection.fields.map(field => `
  ${field.name}${field.required ? '' : '?'}: ${this.getTypeScriptType(field.type)};`).join('')}
}

export class ${this.capitalize(collection.name)}Model {
  static readonly COLLECTION_NAME = '${collection.name}';
  
  static create(data: Omit<${this.capitalize(collection.name)}Document, 'id' | 'createdAt' | 'updatedAt'>): ${this.capitalize(collection.name)}Document {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  static update(data: Partial<${this.capitalize(collection.name)}Document>): Partial<${this.capitalize(collection.name)}Document> {
    return {
      ...data,
      updatedAt: new Date()
    };
  }
}
`).join('\n')}
`;
  }

  private generateFirestoreSDKConfig(config: GCPFirestoreConfig): string {
    return `// Generated Firestore SDK configuration

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  projectId: '${this.config.projectId}',
  // Add other Firebase config values as needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Collection references
${config.collections.map(collection => `
export const ${collection.name}Collection = '${collection.name}';`).join('')}

// Helper functions
export const getCollectionPath = (collectionName: string): string => {
  return collectionName;
};

export const getDocumentPath = (collectionName: string, documentId: string): string => {
  return \`\${collectionName}/\${documentId}\`;
};
`;
  }

  private generateStorageManagementScript(config: GCPCloudStorageConfig): string {
    return `#!/bin/bash
set -e

echo "Managing Cloud Storage buckets..."

# Set project
gcloud config set project ${this.config.projectId}

${config.buckets.map(bucket => `
# Create bucket ${bucket.name}
echo "Creating bucket ${bucket.name}..."
gsutil mb -p ${this.config.projectId} -c ${bucket.storageClass} -l ${bucket.location} gs://${bucket.name}

${config.versioning ? `
# Enable versioning
gsutil versioning set on gs://${bucket.name}
` : ''}

${config.lifecycle ? `
# Apply lifecycle configuration
gsutil lifecycle set lifecycle-rules.json gs://${bucket.name}
` : ''}

${config.cors ? `
# Apply CORS configuration
gsutil cors set cors-config.json gs://${bucket.name}
` : ''}
`).join('\n')}

echo "Storage management completed!"
`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getTypeScriptType(firestoreType: string): string {
    switch (firestoreType) {
      case "string": return "string";
      case "number": return "number";
      case "boolean": return "boolean";
      case "array": return "any[]";
      case "map": return "Record<string, any>";
      case "reference": return "DocumentReference";
      case "geopoint": return "GeoPoint";
      case "timestamp": return "Date";
      default: return "any";
    }
  }
}
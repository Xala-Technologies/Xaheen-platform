import { z } from 'zod';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { GenerationResult } from '../../types.js';

/**
 * API Key Management System
 * 
 * Provides secure storage, retrieval, rotation, and monitoring
 * of API keys across different environments
 */

// API Key configuration schema
const apiKeyOptionsSchema = z.object({
  services: z.array(z.string()),
  environment: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  storageType: z.enum(['env', 'file', 'vault', 'keychain']).default('env'),
  encryptionEnabled: z.boolean().default(true),
  rotationEnabled: z.boolean().default(true),
  rotationDays: z.number().default(90),
  auditEnabled: z.boolean().default(true),
  monitoringEnabled: z.boolean().default(true),
  alertingEnabled: z.boolean().default(true),
  typescript: z.boolean().default(true),
  projectName: z.string(),
  outputPath: z.string()
});

export type ApiKeyOptions = z.infer<typeof apiKeyOptionsSchema>;

// Service configuration type
interface ServiceConfig {
  name: string;
  displayName: string;
  envPrefix: string;
  requiredKeys: string[];
  optionalKeys?: string[];
  rotatable: boolean;
  expirationDays?: number;
  validationRegex?: Record<string, string>;
}

/**
 * API Key Manager
 */
export class ApiKeyManager {
  private readonly algorithm = 'aes-256-gcm';
  private encryptionKey: Buffer;
  private services: Map<string, ServiceConfig>;

  constructor() {
    // Initialize encryption key from environment or generate
    const masterKey = process.env.API_KEY_MASTER_KEY || this.generateMasterKey();
    this.encryptionKey = Buffer.from(masterKey, 'hex');
    
    // Initialize service configurations
    this.services = new Map([
      ['stripe', {
        name: 'stripe',
        displayName: 'Stripe',
        envPrefix: 'STRIPE',
        requiredKeys: ['SECRET_KEY', 'PUBLISHABLE_KEY'],
        optionalKeys: ['WEBHOOK_SECRET'],
        rotatable: true,
        validationRegex: {
          SECRET_KEY: /^sk_(test|live)_[0-9a-zA-Z]{24,}$/,
          PUBLISHABLE_KEY: /^pk_(test|live)_[0-9a-zA-Z]{24,}$/
        }
      }],
      ['vipps', {
        name: 'vipps',
        displayName: 'Vipps',
        envPrefix: 'VIPPS',
        requiredKeys: ['CLIENT_ID', 'CLIENT_SECRET', 'SUBSCRIPTION_KEY', 'MERCHANT_SERIAL_NUMBER'],
        optionalKeys: ['WEBHOOK_SECRET'],
        rotatable: true,
        expirationDays: 365
      }],
      ['slack', {
        name: 'slack',
        displayName: 'Slack',
        envPrefix: 'SLACK',
        requiredKeys: ['BOT_TOKEN', 'SIGNING_SECRET'],
        optionalKeys: ['APP_TOKEN', 'CLIENT_ID', 'CLIENT_SECRET'],
        rotatable: true,
        validationRegex: {
          BOT_TOKEN: /^xoxb-[0-9]{10,}-[0-9]{10,}-[0-9a-zA-Z]{24,}$/,
          APP_TOKEN: /^xapp-[0-9]{1,}-[0-9]{10,}-[0-9]{10,}-[0-9a-zA-Z]{64,}$/
        }
      }],
      ['teams', {
        name: 'teams',
        displayName: 'Microsoft Teams',
        envPrefix: 'TEAMS',
        requiredKeys: ['APP_ID', 'APP_SECRET', 'TENANT_ID'],
        optionalKeys: ['BOT_ID', 'BOT_PASSWORD'],
        rotatable: true
      }],
      ['github', {
        name: 'github',
        displayName: 'GitHub',
        envPrefix: 'GITHUB',
        requiredKeys: ['TOKEN'],
        optionalKeys: ['APP_ID', 'PRIVATE_KEY', 'WEBHOOK_SECRET'],
        rotatable: true,
        validationRegex: {
          TOKEN: /^(ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36,}$/
        }
      }],
      ['altinn', {
        name: 'altinn',
        displayName: 'Altinn',
        envPrefix: 'ALTINN',
        requiredKeys: ['CLIENT_ID', 'CLIENT_SECRET', 'SUBSCRIPTION_KEY'],
        optionalKeys: ['ORGANIZATION_NUMBER'],
        rotatable: false,
        expirationDays: 730 // 2 years
      }],
      ['bankid', {
        name: 'bankid',
        displayName: 'BankID',
        envPrefix: 'BANKID',
        requiredKeys: ['CLIENT_CERT', 'CLIENT_KEY', 'CA_CERT'],
        optionalKeys: ['PASSPHRASE'],
        rotatable: false,
        expirationDays: 365
      }]
    ]);
  }

  /**
   * Generate master encryption key
   */
  private generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt API key
   */
  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt API key
   */
  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate API key format
   */
  validateKeyFormat(service: string, keyType: string, value: string): boolean {
    const config = this.services.get(service);
    if (!config || !config.validationRegex) return true;
    
    const regex = config.validationRegex[keyType];
    if (!regex) return true;
    
    return regex.test(value);
  }

  /**
   * Generate configuration files
   */
  async generateConfigFiles(options: ApiKeyOptions): Promise<GenerationResult> {
    const files = new Map<string, string>();

    // Generate main API key manager
    const managerContent = `
${options.typescript ? `
import type { ApiKey, ApiKeyStore, ApiKeyRotation, ApiKeyAudit } from '../types/api-keys';
` : ''}
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * API Key Manager for ${options.projectName}
 * Manages API keys with encryption, rotation, and auditing
 */
export class ApiKeyManager {
  private readonly storageType = '${options.storageType}';
  private readonly environment = '${options.environment}';
  private readonly encryptionEnabled = ${options.encryptionEnabled};
  private keys${options.typescript ? ': Map<string, ApiKey>' : ''} = new Map();
  ${options.auditEnabled ? `private auditLog${options.typescript ? ': ApiKeyAudit[]' : ''} = [];` : ''}

  constructor() {
    this.loadKeys();
  }

  /**
   * Load API keys from storage
   */
  private async loadKeys() {
    try {
      ${options.storageType === 'env' ? `
      // Load from environment variables
      ${options.services.map(service => {
        const config = this.services.get(service);
        if (!config) return '';
        return `
      // ${config.displayName} keys
      ${config.requiredKeys.map(key => `
      if (process.env.${config.envPrefix}_${key}) {
        this.keys.set('${service}_${key.toLowerCase()}', {
          service: '${service}',
          key: '${key.toLowerCase()}',
          value: process.env.${config.envPrefix}_${key}!,
          encrypted: false,
          created: new Date(),
          ${options.rotationEnabled ? `lastRotated: new Date(),` : ''}
          environment: this.environment
        });
      }
      `).join('')}
      ${config.optionalKeys?.map(key => `
      if (process.env.${config.envPrefix}_${key}) {
        this.keys.set('${service}_${key.toLowerCase()}', {
          service: '${service}',
          key: '${key.toLowerCase()}',
          value: process.env.${config.envPrefix}_${key}!,
          encrypted: false,
          created: new Date(),
          ${options.rotationEnabled ? `lastRotated: new Date(),` : ''}
          environment: this.environment
        });
      }
      `).join('') || ''}`;
      }).join('')}
      ` : options.storageType === 'file' ? `
      // Load from encrypted file
      const configPath = path.join(process.cwd(), '.api-keys', \`\${this.environment}.json\`);
      try {
        const data = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(data);
        
        for (const [key, value] of Object.entries(config)) {
          if (this.encryptionEnabled && value.encrypted) {
            // Decrypt the value
            const decrypted = await this.decrypt(value);
            this.keys.set(key, { ...value, value: decrypted });
          } else {
            this.keys.set(key, value);
          }
        }
      } catch (error) {
        console.warn('No existing API key file found');
      }
      ` : options.storageType === 'vault' ? `
      // Load from HashiCorp Vault or similar
      // TODO: Implement vault integration
      console.log('Loading keys from vault...');
      ` : `
      // Load from system keychain
      // TODO: Implement keychain integration
      console.log('Loading keys from keychain...');
      `}
      
      ${options.auditEnabled ? `
      // Log key loading
      this.audit('keys_loaded', {
        count: this.keys.size,
        environment: this.environment,
        storageType: this.storageType
      });
      ` : ''}
    } catch (error) {
      console.error('Failed to load API keys:', error);
      throw error;
    }
  }

  /**
   * Get API key
   */
  async get(service${options.typescript ? ': string' : ''}, keyName${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<string | null>' : ''} {
    const key = \`\${service}_\${keyName.toLowerCase()}\`;
    const apiKey = this.keys.get(key);
    
    if (!apiKey) {
      ${options.auditEnabled ? `
      this.audit('key_not_found', { service, keyName });
      ` : ''}
      return null;
    }

    ${options.rotationEnabled ? `
    // Check if key needs rotation
    if (this.shouldRotate(apiKey)) {
      ${options.auditEnabled ? `
      this.audit('key_rotation_needed', { service, keyName });
      ` : ''}
      // TODO: Trigger rotation workflow
    }
    ` : ''}

    ${options.auditEnabled ? `
    this.audit('key_accessed', { service, keyName });
    ` : ''}

    return apiKey.value;
  }

  /**
   * Set API key
   */
  async set(
    service${options.typescript ? ': string' : ''}, 
    keyName${options.typescript ? ': string' : ''}, 
    value${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const key = \`\${service}_\${keyName.toLowerCase()}\`;
    
    ${options.encryptionEnabled ? `
    // Encrypt the value if enabled
    const encrypted = await this.encrypt(value);
    ` : ''}

    const apiKey${options.typescript ? ': ApiKey' : ''} = {
      service,
      key: keyName.toLowerCase(),
      value: ${options.encryptionEnabled ? 'encrypted.encrypted' : 'value'},
      ${options.encryptionEnabled ? `
      encrypted: true,
      iv: encrypted.iv,
      tag: encrypted.tag,
      ` : `encrypted: false,`}
      created: new Date(),
      ${options.rotationEnabled ? `lastRotated: new Date(),` : ''}
      environment: this.environment
    };

    this.keys.set(key, apiKey);
    
    // Save to storage
    await this.saveKeys();
    
    ${options.auditEnabled ? `
    this.audit('key_set', { service, keyName });
    ` : ''}
  }

  /**
   * Delete API key
   */
  async delete(service${options.typescript ? ': string' : ''}, keyName${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<boolean>' : ''} {
    const key = \`\${service}_\${keyName.toLowerCase()}\`;
    const deleted = this.keys.delete(key);
    
    if (deleted) {
      await this.saveKeys();
      ${options.auditEnabled ? `
      this.audit('key_deleted', { service, keyName });
      ` : ''}
    }
    
    return deleted;
  }

  ${options.rotationEnabled ? `
  /**
   * Rotate API key
   */
  async rotate(
    service${options.typescript ? ': string' : ''}, 
    keyName${options.typescript ? ': string' : ''}, 
    newValue${options.typescript ? ': string' : ''}
  )${options.typescript ? ': Promise<void>' : ''} {
    const key = \`\${service}_\${keyName.toLowerCase()}\`;
    const apiKey = this.keys.get(key);
    
    if (!apiKey) {
      throw new Error(\`Key not found: \${key}\`);
    }

    // Store old value for rollback
    const oldValue = apiKey.value;
    
    try {
      // Update with new value
      await this.set(service, keyName, newValue);
      
      ${options.auditEnabled ? `
      this.audit('key_rotated', { 
        service, 
        keyName,
        previousRotation: apiKey.lastRotated 
      });
      ` : ''}
    } catch (error) {
      // Rollback on error
      await this.set(service, keyName, oldValue);
      throw error;
    }
  }

  /**
   * Check if key should be rotated
   */
  private shouldRotate(apiKey${options.typescript ? ': ApiKey' : ''})${options.typescript ? ': boolean' : ''} {
    if (!apiKey.lastRotated) return true;
    
    const daysSinceRotation = Math.floor(
      (Date.now() - apiKey.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceRotation >= ${options.rotationDays};
  }
  ` : ''}

  /**
   * List all keys for a service
   */
  list(service${options.typescript ? '?: string' : ''})${options.typescript ? ': ApiKey[]' : ''} {
    const keys${options.typescript ? ': ApiKey[]' : ''} = [];
    
    for (const [key, apiKey] of this.keys.entries()) {
      if (!service || apiKey.service === service) {
        // Don't expose actual values in list
        keys.push({
          ...apiKey,
          value: '***'
        });
      }
    }
    
    return keys;
  }

  /**
   * Validate all keys
   */
  async validate()${options.typescript ? ': Promise<{ valid: boolean; errors: string[] }>' : ''} {
    const errors${options.typescript ? ': string[]' : ''} = [];
    
    // Check required keys for each service
    ${options.services.map(service => {
      const config = this.services.get(service);
      if (!config) return '';
      return `
    // Validate ${config.displayName} keys
    ${config.requiredKeys.map(key => `
    if (!this.keys.has('${service}_${key.toLowerCase()}')) {
      errors.push('Missing required key: ${config.envPrefix}_${key}');
    }
    `).join('')}`;
    }).join('')}
    
    ${options.auditEnabled ? `
    this.audit('keys_validated', { 
      valid: errors.length === 0,
      errorCount: errors.length 
    });
    ` : ''}
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  ${options.encryptionEnabled ? `
  /**
   * Encrypt value
   */
  private async encrypt(value${options.typescript ? ': string' : ''})${options.typescript ? ': Promise<{ encrypted: string; iv: string; tag: string }>' : ''} {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.API_KEY_MASTER_KEY || this.generateKey(), 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt value
   */
  private async decrypt(apiKey${options.typescript ? ': any' : ''})${options.typescript ? ': Promise<string>' : ''} {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.API_KEY_MASTER_KEY || this.generateKey(), 'hex');
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(apiKey.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(apiKey.tag, 'hex'));
    
    let decrypted = decipher.update(apiKey.value, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate encryption key
   */
  private generateKey()${options.typescript ? ': string' : ''} {
    return crypto.randomBytes(32).toString('hex');
  }
  ` : ''}

  /**
   * Save keys to storage
   */
  private async saveKeys() {
    ${options.storageType === 'file' ? `
    const configPath = path.join(process.cwd(), '.api-keys', \`\${this.environment}.json\`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    
    // Convert Map to object
    const config${options.typescript ? ': Record<string, any>' : ''} = {};
    for (const [key, value] of this.keys.entries()) {
      config[key] = value;
    }
    
    // Write to file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    ` : `
    // Storage type ${options.storageType} save not implemented
    `}
  }

  ${options.auditEnabled ? `
  /**
   * Audit log entry
   */
  private audit(action${options.typescript ? ': string' : ''}, details${options.typescript ? ': any' : ''} = {}) {
    const entry${options.typescript ? ': ApiKeyAudit' : ''} = {
      timestamp: new Date(),
      action,
      details,
      environment: this.environment,
      user: process.env.USER || 'unknown'
    };
    
    this.auditLog.push(entry);
    
    ${options.monitoringEnabled ? `
    // Send to monitoring service
    this.sendToMonitoring(entry);
    ` : ''}
    
    // Log to console in development
    if (this.environment === 'development') {
      console.log('[API Key Audit]', action, details);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filter${options.typescript ? '?: { action?: string; from?: Date; to?: Date }' : ''} = {})${options.typescript ? ': ApiKeyAudit[]' : ''} {
    let log = [...this.auditLog];
    
    if (filter.action) {
      log = log.filter(entry => entry.action === filter.action);
    }
    
    if (filter.from) {
      log = log.filter(entry => entry.timestamp >= filter.from);
    }
    
    if (filter.to) {
      log = log.filter(entry => entry.timestamp <= filter.to);
    }
    
    return log;
  }
  ` : ''}

  ${options.monitoringEnabled ? `
  /**
   * Send to monitoring service
   */
  private async sendToMonitoring(entry${options.typescript ? ': any' : ''}) {
    // TODO: Implement monitoring integration
    // Example: Datadog, New Relic, CloudWatch, etc.
    
    ${options.alertingEnabled ? `
    // Check for alert conditions
    if (this.shouldAlert(entry)) {
      await this.sendAlert(entry);
    }
    ` : ''}
  }
  ` : ''}

  ${options.alertingEnabled ? `
  /**
   * Check if alert should be sent
   */
  private shouldAlert(entry${options.typescript ? ': any' : ''})${options.typescript ? ': boolean' : ''} {
    // Alert on specific actions
    const alertActions = [
      'key_deleted',
      'key_rotation_failed',
      'unauthorized_access',
      'validation_failed'
    ];
    
    return alertActions.includes(entry.action);
  }

  /**
   * Send alert
   */
  private async sendAlert(entry${options.typescript ? ': any' : ''}) {
    // TODO: Implement alerting integration
    // Example: Slack, Email, PagerDuty, etc.
    console.error('[ALERT]', entry.action, entry.details);
  }
  ` : ''}
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();

// Export configuration for all services
export const API_KEY_CONFIG = {
  ${options.services.map(service => {
    const config = this.services.get(service);
    if (!config) return '';
    return `
  ${service}: {
    ${config.requiredKeys.map(key => `${key}: process.env.${config.envPrefix}_${key}`).join(',\n    ')},
    ${config.optionalKeys?.map(key => `${key}: process.env.${config.envPrefix}_${key}`).join(',\n    ') || ''}
  }`;
  }).join(',')}
};`;

    files.set('config/api-key-manager.ts', managerContent);

    // Generate environment template
    const envTemplate = `# API Keys for ${options.projectName}
# Environment: ${options.environment}

${options.services.map(service => {
  const config = this.services.get(service);
  if (!config) return '';
  return `
# ${config.displayName}
${config.requiredKeys.map(key => `${config.envPrefix}_${key}=`).join('\n')}
${config.optionalKeys?.map(key => `${config.envPrefix}_${key}=`).join('\n') || ''}`;
}).join('\n')}

${options.encryptionEnabled ? `
# Encryption Master Key (generate with: openssl rand -hex 32)
API_KEY_MASTER_KEY=
` : ''}

${options.monitoringEnabled ? `
# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_SERVICE=datadog
MONITORING_API_KEY=
` : ''}

${options.alertingEnabled ? `
# Alerting Configuration
ALERTING_ENABLED=true
ALERTING_WEBHOOK=
ALERTING_EMAIL=
` : ''}`;

    files.set(`.env.${options.environment}.template`, envTemplate);

    // Generate TypeScript types if enabled
    if (options.typescript) {
      const typesContent = `
/**
 * API Key Types
 */

export interface ApiKey {
  service: string;
  key: string;
  value: string;
  encrypted: boolean;
  iv?: string;
  tag?: string;
  created: Date;
  lastRotated?: Date;
  expiresAt?: Date;
  environment: string;
  metadata?: Record<string, any>;
}

export interface ApiKeyStore {
  get(service: string, key: string): Promise<string | null>;
  set(service: string, key: string, value: string): Promise<void>;
  delete(service: string, key: string): Promise<boolean>;
  list(service?: string): ApiKey[];
  validate(): Promise<{ valid: boolean; errors: string[] }>;
}

export interface ApiKeyRotation {
  rotate(service: string, key: string, newValue: string): Promise<void>;
  shouldRotate(apiKey: ApiKey): boolean;
  getRotationSchedule(): RotationSchedule[];
}

export interface RotationSchedule {
  service: string;
  key: string;
  nextRotation: Date;
  rotationInterval: number;
}

export interface ApiKeyAudit {
  timestamp: Date;
  action: string;
  details: any;
  environment: string;
  user: string;
  ip?: string;
  userAgent?: string;
}

export interface ApiKeyMonitoring {
  trackAccess(service: string, key: string): void;
  trackRotation(service: string, key: string): void;
  trackError(service: string, key: string, error: any): void;
  getMetrics(): ApiKeyMetrics;
}

export interface ApiKeyMetrics {
  totalKeys: number;
  keysPerService: Record<string, number>;
  accessCount: Record<string, number>;
  rotationCount: Record<string, number>;
  errorCount: Record<string, number>;
  lastAccess: Record<string, Date>;
  lastRotation: Record<string, Date>;
}

export type ApiKeyEnvironment = 'development' | 'test' | 'staging' | 'production';
export type ApiKeyStorageType = 'env' | 'file' | 'vault' | 'keychain';

export interface ApiKeyConfig {
  environment: ApiKeyEnvironment;
  storageType: ApiKeyStorageType;
  encryptionEnabled: boolean;
  rotationEnabled: boolean;
  rotationDays: number;
  auditEnabled: boolean;
  monitoringEnabled: boolean;
  alertingEnabled: boolean;
}`;

      files.set('types/api-keys.ts', typesContent);
    }

    // Generate API key validation script
    const validationScript = `
#!/usr/bin/env node
/**
 * API Key Validation Script
 * Validates all required API keys are present and properly formatted
 */

const { apiKeyManager } = require('./config/api-key-manager');

async function validateApiKeys() {
  console.log('🔐 Validating API Keys...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  try {
    const result = await apiKeyManager.validate();
    
    if (result.valid) {
      console.log('✅ All API keys are valid');
      
      // List configured services
      const services = [...new Set(apiKeyManager.list().map(k => k.service))];
      console.log('\\nConfigured services:');
      services.forEach(service => {
        const keys = apiKeyManager.list(service);
        console.log(\`  - \${service}: \${keys.length} keys\`);
      });
    } else {
      console.error('❌ API key validation failed');
      console.error('\\nErrors:');
      result.errors.forEach(error => {
        console.error(\`  - \${error}\`);
      });
      process.exit(1);
    }
    
    ${options.rotationEnabled ? `
    // Check for keys needing rotation
    console.log('\\n🔄 Checking key rotation...');
    const keysNeedingRotation = apiKeyManager.list()
      .filter(key => apiKeyManager.shouldRotate(key));
    
    if (keysNeedingRotation.length > 0) {
      console.warn(\`⚠️  \${keysNeedingRotation.length} keys need rotation:\`);
      keysNeedingRotation.forEach(key => {
        console.warn(\`  - \${key.service}:\${key.key}\`);
      });
    } else {
      console.log('✅ All keys are up to date');
    }
    ` : ''}
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

// Run validation
validateApiKeys();`;

    files.set('scripts/validate-api-keys.js', validationScript);

    return {
      success: true,
      files,
      message: 'API key management system generated successfully'
    };
  }
}

// Export the manager instance
export const apiKeyManager = new ApiKeyManager();
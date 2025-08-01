/**
 * Database Schema Generator
 * 
 * AI-powered database schema generation with Norwegian compliance and
 * enterprise patterns. Supports multiple database systems and ORMs.
 * 
 * Features:
 * - Intelligent schema design from requirements
 * - Multi-database support (PostgreSQL, MySQL, SQLite, MongoDB)
 * - ORM integration (Prisma, TypeORM, Drizzle)
 * - Norwegian compliance (GDPR, data residency)
 * - Relationship inference
 * - Index optimization
 * - Audit trail support
 * - Multi-tenant architecture
 * - Data validation rules
 * - Migration generation
 */

import { 
  ILoggingService, 
  IConfigurationService,
  IFileSystemService 
} from '../../architecture/interfaces.js';
import { BaseGenerator } from '../base-generator.js';
import { AIServiceFactory } from '../../ai/services/AIServiceFactory.js';
import { NorwegianCompliance, LocaleCode } from '../../types/compliance.js';
import { TemplateEngine } from '../../templates/template-engine.js';

/**
 * Database schema options
 */
export interface IDatabaseSchemaOptions {
  name: string;
  description: string;
  database: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  orm: 'prisma' | 'typeorm' | 'drizzle' | 'mongoose';
  features: Array<
    'audit-trail' | 
    'multi-tenant' | 
    'soft-delete' | 
    'versioning' | 
    'encryption' |
    'gdpr-compliance' |
    'row-level-security'
  >;
  entities: IEntityDefinition[];
  compliance: NorwegianCompliance;
  output: {
    path: string;
    format: 'schema' | 'models' | 'migrations' | 'all';
  };
}

/**
 * Entity definition
 */
export interface IEntityDefinition {
  name: string;
  description: string;
  fields: IFieldDefinition[];
  relations?: IRelationDefinition[];
  indexes?: IIndexDefinition[];
  constraints?: IConstraintDefinition[];
  audit?: boolean;
  multiTenant?: boolean;
  softDelete?: boolean;
  encrypted?: string[]; // field names to encrypt
}

/**
 * Field definition
 */
export interface IFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'uuid' | 'enum' | 'array';
  required: boolean;
  unique?: boolean;
  default?: any;
  length?: number;
  precision?: number;
  scale?: number;
  enum?: string[];
  validation?: IValidationRule[];
  gdprCategory?: 'personal' | 'sensitive' | 'anonymous';
  encrypted?: boolean;
}

/**
 * Relation definition
 */
export interface IRelationDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  target: string;
  field?: string;
  references?: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

/**
 * Index definition
 */
export interface IIndexDefinition {
  name?: string;
  fields: string[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
  where?: string;
}

/**
 * Constraint definition
 */
export interface IConstraintDefinition {
  name?: string;
  type: 'check' | 'unique' | 'foreign-key' | 'exclusion';
  expression?: string;
  fields?: string[];
}

/**
 * Validation rule
 */
export interface IValidationRule {
  type: 'min' | 'max' | 'length' | 'pattern' | 'custom';
  value: any;
  message?: string;
}

/**
 * Schema generation result
 */
export interface ISchemaGenerationResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: 'schema' | 'model' | 'migration' | 'seed';
  }>;
  entities: IEntityDefinition[];
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
  indexes: Array<{
    entity: string;
    fields: string[];
    type: string;
  }>;
  compliance: {
    gdprCompliant: boolean;
    encryptedFields: string[];
    auditEnabled: boolean;
    dataResidency: string;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Database Schema Generator
 */
export class DatabaseSchemaGenerator extends BaseGenerator {
  private aiServiceFactory?: AIServiceFactory;
  private templateEngine: TemplateEngine;

  constructor(
    logger: ILoggingService,
    config: IConfigurationService,
    fileSystem: IFileSystemService
  ) {
    super(logger, config, fileSystem);
    this.templateEngine = new TemplateEngine(logger, config, fileSystem);
  }

  /**
   * Generate database schema from natural language
   */
  async generateFromDescription(description: string, options: Partial<IDatabaseSchemaOptions>): Promise<ISchemaGenerationResult> {
    try {
      this.logger.info('Generating database schema from description', { description });

      // Initialize AI services
      await this.initializeAIServices();

      // Analyze requirements
      const analysis = await this.analyzeRequirements(description);

      // Generate entities
      const entities = await this.generateEntities(analysis, options);

      // Infer relationships
      const relationships = await this.inferRelationships(entities);

      // Apply relationships to entities
      this.applyRelationships(entities, relationships);

      // Optimize indexes
      await this.optimizeIndexes(entities);

      // Apply compliance requirements
      await this.applyCompliance(entities, options.compliance);

      // Generate schema files
      const files = await this.generateSchemaFiles(entities, options);

      // Validate schema
      const validation = await this.validateSchema(entities, options);

      return {
        success: validation.valid,
        files,
        entities,
        relationships,
        indexes: this.extractIndexes(entities),
        compliance: {
          gdprCompliant: this.checkGDPRCompliance(entities),
          encryptedFields: this.getEncryptedFields(entities),
          auditEnabled: entities.some(e => e.audit),
          dataResidency: 'norway' // Norwegian data residency
        },
        warnings: validation.warnings,
        errors: validation.errors
      };

    } catch (error) {
      this.logger.error('Failed to generate database schema', error as Error);
      return {
        success: false,
        files: [],
        entities: [],
        relationships: [],
        indexes: [],
        compliance: {
          gdprCompliant: false,
          encryptedFields: [],
          auditEnabled: false,
          dataResidency: 'unknown'
        },
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Generate database schema
   */
  async generateSchema(options: IDatabaseSchemaOptions): Promise<ISchemaGenerationResult> {
    try {
      this.logger.info('Generating database schema', { 
        database: options.database,
        orm: options.orm,
        entityCount: options.entities.length 
      });

      // Validate options
      this.validateOptions(options);

      // Apply features to entities
      this.applyFeatures(options.entities, options.features);

      // Apply compliance
      await this.applyCompliance(options.entities, options.compliance);

      // Generate schema files
      const files = await this.generateSchemaFiles(options.entities, options);

      // Validate schema
      const validation = await this.validateSchema(options.entities, options);

      return {
        success: validation.valid,
        files,
        entities: options.entities,
        relationships: this.extractRelationships(options.entities),
        indexes: this.extractIndexes(options.entities),
        compliance: {
          gdprCompliant: this.checkGDPRCompliance(options.entities),
          encryptedFields: this.getEncryptedFields(options.entities),
          auditEnabled: options.entities.some(e => e.audit),
          dataResidency: 'norway'
        },
        warnings: validation.warnings,
        errors: validation.errors
      };

    } catch (error) {
      this.logger.error('Failed to generate database schema', error as Error);
      return {
        success: false,
        files: [],
        entities: [],
        relationships: [],
        indexes: [],
        compliance: {
          gdprCompliant: false,
          encryptedFields: [],
          auditEnabled: false,
          dataResidency: 'unknown'
        },
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // === Private Helper Methods ===

  /**
   * Initialize AI services
   */
  private async initializeAIServices(): Promise<void> {
    if (!this.aiServiceFactory) {
      this.aiServiceFactory = new AIServiceFactory(
        this.logger,
        this.config,
        this.fileSystem
      );
      await this.aiServiceFactory.initializeServices();
    }
  }

  /**
   * Analyze requirements
   */
  private async analyzeRequirements(description: string): Promise<any> {
    const aiService = this.aiServiceFactory!.createAICodeGeneratorService();
    
    const prompt = `Analyze the following database requirements and extract entities, fields, and relationships:

${description}

Return a structured analysis with:
1. Entities (tables/collections)
2. Fields for each entity with types
3. Relationships between entities
4. Business rules and constraints
5. Compliance requirements (GDPR, audit trail, etc.)`;

    const response = await aiService.generateCode({
      description: prompt,
      type: 'analysis',
      language: 'json',
      framework: 'database',
      compliance: {
        nsmClassification: 'OPEN',
        gdprCompliant: true,
        wcagLevel: 'AAA',
        supportedLanguages: ['nb-NO', 'en-US'],
        auditTrail: true
      },
      locale: 'en-US',
      features: []
    });

    return JSON.parse(response.code);
  }

  /**
   * Generate entities from analysis
   */
  private async generateEntities(analysis: any, options: Partial<IDatabaseSchemaOptions>): Promise<IEntityDefinition[]> {
    const entities: IEntityDefinition[] = [];

    for (const entityData of analysis.entities || []) {
      const entity: IEntityDefinition = {
        name: this.toPascalCase(entityData.name),
        description: entityData.description || '',
        fields: await this.generateFields(entityData.fields || []),
        relations: [],
        indexes: [],
        constraints: [],
        audit: entityData.requiresAudit || options.features?.includes('audit-trail'),
        multiTenant: entityData.multiTenant || options.features?.includes('multi-tenant'),
        softDelete: entityData.softDelete || options.features?.includes('soft-delete')
      };

      // Add default fields
      this.addDefaultFields(entity, options);

      // Add indexes for common queries
      this.addDefaultIndexes(entity);

      entities.push(entity);
    }

    return entities;
  }

  /**
   * Generate fields
   */
  private async generateFields(fieldData: any[]): Promise<IFieldDefinition[]> {
    const fields: IFieldDefinition[] = [];

    for (const field of fieldData) {
      const fieldDef: IFieldDefinition = {
        name: this.toCamelCase(field.name),
        type: this.mapFieldType(field.type),
        required: field.required !== false,
        unique: field.unique || false,
        default: field.default,
        length: field.length,
        validation: this.generateValidation(field),
        gdprCategory: this.classifyGDPRData(field.name, field.type),
        encrypted: this.shouldEncrypt(field)
      };

      if (field.enum) {
        fieldDef.type = 'enum';
        fieldDef.enum = field.enum;
      }

      fields.push(fieldDef);
    }

    return fields;
  }

  /**
   * Map field type
   */
  private mapFieldType(type: string): IFieldDefinition['type'] {
    const typeMap: Record<string, IFieldDefinition['type']> = {
      'text': 'string',
      'varchar': 'string',
      'int': 'number',
      'integer': 'number',
      'float': 'number',
      'decimal': 'number',
      'boolean': 'boolean',
      'bool': 'boolean',
      'date': 'date',
      'datetime': 'date',
      'timestamp': 'date',
      'json': 'json',
      'jsonb': 'json',
      'uuid': 'uuid',
      'array': 'array'
    };

    return typeMap[type.toLowerCase()] || 'string';
  }

  /**
   * Generate validation rules
   */
  private generateValidation(field: any): IValidationRule[] {
    const rules: IValidationRule[] = [];

    if (field.minLength) {
      rules.push({
        type: 'length',
        value: { min: field.minLength },
        message: `Minimum length is ${field.minLength}`
      });
    }

    if (field.maxLength) {
      rules.push({
        type: 'length',
        value: { max: field.maxLength },
        message: `Maximum length is ${field.maxLength}`
      });
    }

    if (field.pattern) {
      rules.push({
        type: 'pattern',
        value: field.pattern,
        message: field.patternMessage || 'Invalid format'
      });
    }

    // Norwegian-specific validations
    if (field.name.toLowerCase().includes('orgnr')) {
      rules.push({
        type: 'pattern',
        value: '^[0-9]{9}$',
        message: 'Invalid Norwegian organization number'
      });
    }

    if (field.name.toLowerCase().includes('phone') && field.norwegian) {
      rules.push({
        type: 'pattern',
        value: '^(\\+47)?[2-9]\\d{7}$',
        message: 'Invalid Norwegian phone number'
      });
    }

    return rules;
  }

  /**
   * Classify GDPR data
   */
  private classifyGDPRData(fieldName: string, fieldType: string): IFieldDefinition['gdprCategory'] {
    const name = fieldName.toLowerCase();

    // Sensitive personal data
    const sensitiveFields = [
      'health', 'medical', 'religion', 'ethnicity', 'political',
      'union', 'biometric', 'genetic', 'sexual'
    ];
    
    if (sensitiveFields.some(field => name.includes(field))) {
      return 'sensitive';
    }

    // Personal data
    const personalFields = [
      'name', 'email', 'phone', 'address', 'ssn', 'birthdate',
      'nationality', 'photo', 'salary', 'account'
    ];

    if (personalFields.some(field => name.includes(field))) {
      return 'personal';
    }

    return 'anonymous';
  }

  /**
   * Should encrypt field
   */
  private shouldEncrypt(field: any): boolean {
    const name = field.name.toLowerCase();
    
    // Always encrypt sensitive data
    if (field.sensitive || field.encrypted) {
      return true;
    }

    // Encrypt specific field types
    const encryptFields = [
      'ssn', 'social_security', 'credit_card', 'bank_account',
      'password', 'pin', 'secret', 'private_key'
    ];

    return encryptFields.some(f => name.includes(f));
  }

  /**
   * Add default fields
   */
  private addDefaultFields(entity: IEntityDefinition, options: Partial<IDatabaseSchemaOptions>): void {
    // ID field
    if (!entity.fields.find(f => f.name === 'id')) {
      entity.fields.unshift({
        name: 'id',
        type: options.database === 'mongodb' ? 'string' : 'uuid',
        required: true,
        unique: true,
        gdprCategory: 'anonymous'
      });
    }

    // Timestamps
    entity.fields.push(
      {
        name: 'createdAt',
        type: 'date',
        required: true,
        default: 'now()',
        gdprCategory: 'anonymous'
      },
      {
        name: 'updatedAt',
        type: 'date',
        required: true,
        default: 'now()',
        gdprCategory: 'anonymous'
      }
    );

    // Multi-tenant field
    if (entity.multiTenant) {
      entity.fields.push({
        name: 'tenantId',
        type: 'uuid',
        required: true,
        gdprCategory: 'anonymous'
      });
    }

    // Soft delete field
    if (entity.softDelete) {
      entity.fields.push({
        name: 'deletedAt',
        type: 'date',
        required: false,
        gdprCategory: 'anonymous'
      });
    }

    // Audit fields
    if (entity.audit) {
      entity.fields.push(
        {
          name: 'createdBy',
          type: 'uuid',
          required: false,
          gdprCategory: 'anonymous'
        },
        {
          name: 'updatedBy',
          type: 'uuid',
          required: false,
          gdprCategory: 'anonymous'
        }
      );
    }
  }

  /**
   * Add default indexes
   */
  private addDefaultIndexes(entity: IEntityDefinition): void {
    // Index for timestamps
    entity.indexes?.push({
      fields: ['createdAt'],
      type: 'btree'
    });

    // Index for soft delete
    if (entity.softDelete) {
      entity.indexes?.push({
        fields: ['deletedAt'],
        where: 'deletedAt IS NULL'
      });
    }

    // Index for multi-tenant
    if (entity.multiTenant) {
      entity.indexes?.push({
        fields: ['tenantId'],
        type: 'btree'
      });
    }

    // Index for unique fields
    entity.fields
      .filter(f => f.unique && f.name !== 'id')
      .forEach(field => {
        entity.indexes?.push({
          fields: [field.name],
          unique: true
        });
      });
  }

  /**
   * Infer relationships
   */
  private async inferRelationships(entities: IEntityDefinition[]): Promise<IRelationDefinition[]> {
    const relationships: IRelationDefinition[] = [];

    for (const entity of entities) {
      for (const field of entity.fields) {
        // Check for foreign key pattern
        if (field.name.endsWith('Id') && field.name !== 'id' && field.name !== 'tenantId') {
          const targetName = field.name.slice(0, -2);
          const targetEntity = entities.find(e => 
            e.name.toLowerCase() === targetName.toLowerCase() ||
            e.name.toLowerCase() === this.toPascalCase(targetName).toLowerCase()
          );

          if (targetEntity) {
            relationships.push({
              name: targetName,
              type: 'many-to-one',
              target: targetEntity.name,
              field: field.name,
              references: 'id',
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE'
            });
          }
        }
      }
    }

    // Detect many-to-many relationships (through junction tables)
    for (const entity of entities) {
      if (this.isJunctionTable(entity, entities)) {
        const relations = entity.fields
          .filter(f => f.name.endsWith('Id') && f.name !== 'id')
          .map(f => f.name.slice(0, -2));

        if (relations.length === 2) {
          relationships.push({
            name: `${relations[0]}_${relations[1]}`,
            type: 'many-to-many',
            target: this.toPascalCase(relations[1]),
            field: entity.name
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Check if entity is a junction table
   */
  private isJunctionTable(entity: IEntityDefinition, allEntities: IEntityDefinition[]): boolean {
    const foreignKeys = entity.fields.filter(f => 
      f.name.endsWith('Id') && f.name !== 'id' && f.name !== 'tenantId'
    );

    // Junction table typically has 2 foreign keys and minimal other fields
    return foreignKeys.length === 2 && entity.fields.length <= 6;
  }

  /**
   * Apply relationships to entities
   */
  private applyRelationships(entities: IEntityDefinition[], relationships: IRelationDefinition[]): void {
    for (const relationship of relationships) {
      const sourceEntity = entities.find(e => 
        e.fields.some(f => f.name === relationship.field)
      );

      if (sourceEntity && !sourceEntity.relations) {
        sourceEntity.relations = [];
      }

      if (sourceEntity) {
        sourceEntity.relations!.push(relationship);

        // Add reverse relationship
        const targetEntity = entities.find(e => e.name === relationship.target);
        if (targetEntity) {
          if (!targetEntity.relations) {
            targetEntity.relations = [];
          }

          const reverseType = relationship.type === 'one-to-many' ? 'many-to-one' :
                             relationship.type === 'many-to-one' ? 'one-to-many' :
                             relationship.type;

          targetEntity.relations.push({
            name: sourceEntity.name.toLowerCase() + 's',
            type: reverseType,
            target: sourceEntity.name
          });
        }
      }
    }
  }

  /**
   * Optimize indexes
   */
  private async optimizeIndexes(entities: IEntityDefinition[]): Promise<void> {
    for (const entity of entities) {
      // Add composite indexes for common query patterns
      const foreignKeys = entity.fields.filter(f => 
        f.name.endsWith('Id') && f.name !== 'id'
      );

      if (foreignKeys.length > 1) {
        // Add composite index for foreign keys
        entity.indexes?.push({
          fields: foreignKeys.map(f => f.name),
          type: 'btree'
        });
      }

      // Add indexes for frequently queried fields
      const indexableFields = entity.fields.filter(f => 
        ['email', 'username', 'code', 'slug'].some(pattern => 
          f.name.toLowerCase().includes(pattern)
        )
      );

      for (const field of indexableFields) {
        if (!entity.indexes?.some(idx => 
          idx.fields.length === 1 && idx.fields[0] === field.name
        )) {
          entity.indexes?.push({
            fields: [field.name],
            type: 'btree'
          });
        }
      }
    }
  }

  /**
   * Apply compliance requirements
   */
  private async applyCompliance(entities: IEntityDefinition[], compliance?: NorwegianCompliance): Promise<void> {
    if (!compliance) return;

    for (const entity of entities) {
      // Apply encryption to sensitive fields
      if (compliance.nsmClassification !== 'OPEN') {
        for (const field of entity.fields) {
          if (field.gdprCategory === 'sensitive' || 
              field.gdprCategory === 'personal') {
            field.encrypted = true;
            
            if (!entity.encrypted) {
              entity.encrypted = [];
            }
            entity.encrypted.push(field.name);
          }
        }
      }

      // Enable audit trail for compliance
      if (compliance.auditTrail) {
        entity.audit = true;
      }

      // Add GDPR compliance fields
      if (compliance.gdprCompliant) {
        // Add consent tracking
        entity.fields.push({
          name: 'gdprConsent',
          type: 'json',
          required: false,
          gdprCategory: 'anonymous',
          validation: []
        });

        // Add data retention
        entity.fields.push({
          name: 'dataRetentionDate',
          type: 'date',
          required: false,
          gdprCategory: 'anonymous',
          validation: []
        });
      }
    }
  }

  /**
   * Apply features to entities
   */
  private applyFeatures(entities: IEntityDefinition[], features: IDatabaseSchemaOptions['features']): void {
    for (const entity of entities) {
      if (features.includes('audit-trail')) {
        entity.audit = true;
      }
      if (features.includes('multi-tenant')) {
        entity.multiTenant = true;
      }
      if (features.includes('soft-delete')) {
        entity.softDelete = true;
      }
      if (features.includes('encryption')) {
        // Encrypt all personal/sensitive data
        entity.fields.forEach(field => {
          if (field.gdprCategory !== 'anonymous') {
            field.encrypted = true;
          }
        });
      }
    }
  }

  /**
   * Generate schema files
   */
  private async generateSchemaFiles(
    entities: IEntityDefinition[], 
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    // Generate based on ORM
    switch (options.orm) {
      case 'prisma':
        files.push(...await this.generatePrismaSchema(entities, options));
        break;
      case 'typeorm':
        files.push(...await this.generateTypeORMEntities(entities, options));
        break;
      case 'drizzle':
        files.push(...await this.generateDrizzleSchema(entities, options));
        break;
      case 'mongoose':
        files.push(...await this.generateMongooseModels(entities, options));
        break;
    }

    // Generate migrations if requested
    if (options.output?.format === 'migrations' || options.output?.format === 'all') {
      files.push(...await this.generateMigrations(entities, options));
    }

    // Generate seed data
    if (options.output?.format === 'all') {
      files.push(...await this.generateSeedData(entities, options));
    }

    return files;
  }

  /**
   * Generate Prisma schema
   */
  private async generatePrismaSchema(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    let schema = `// Generated Prisma Schema with Norwegian Compliance
// Database: ${options.database || 'postgresql'}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "${options.database || 'postgresql'}"
  url      = env("DATABASE_URL")
}

`;

    // Add enums
    const enums = new Set<string>();
    for (const entity of entities) {
      for (const field of entity.fields) {
        if (field.type === 'enum' && field.enum) {
          const enumName = `${entity.name}${this.toPascalCase(field.name)}`;
          if (!enums.has(enumName)) {
            schema += `enum ${enumName} {\n`;
            field.enum.forEach(value => {
              schema += `  ${value}\n`;
            });
            schema += `}\n\n`;
            enums.add(enumName);
          }
        }
      }
    }

    // Add models
    for (const entity of entities) {
      schema += `model ${entity.name} {\n`;
      
      // Add fields
      for (const field of entity.fields) {
        const fieldType = this.getPrismaType(field, entity.name);
        const modifiers = [];
        
        if (field.name === 'id') {
          modifiers.push('@id');
          if (field.type === 'uuid') {
            modifiers.push('@default(uuid())');
          } else {
            modifiers.push('@default(autoincrement())');
          }
        }
        
        if (field.unique && field.name !== 'id') {
          modifiers.push('@unique');
        }
        
        if (field.default === 'now()') {
          modifiers.push('@default(now())');
        } else if (field.default !== undefined) {
          modifiers.push(`@default(${JSON.stringify(field.default)})`);
        }
        
        if (field.name === 'updatedAt') {
          modifiers.push('@updatedAt');
        }

        const optional = field.required ? '' : '?';
        const modifierStr = modifiers.length > 0 ? ` ${modifiers.join(' ')}` : '';
        
        schema += `  ${field.name} ${fieldType}${optional}${modifierStr}\n`;
      }

      // Add relations
      if (entity.relations) {
        for (const relation of entity.relations) {
          if (relation.type === 'one-to-many') {
            schema += `  ${relation.name} ${relation.target}[]\n`;
          } else if (relation.type === 'many-to-one') {
            schema += `  ${relation.name} ${relation.target}? @relation(fields: [${relation.field}], references: [${relation.references || 'id'}])\n`;
          } else if (relation.type === 'one-to-one') {
            schema += `  ${relation.name} ${relation.target}? @relation(fields: [${relation.field}], references: [${relation.references || 'id'}])\n`;
          }
        }
      }

      // Add indexes
      if (entity.indexes && entity.indexes.length > 0) {
        schema += '\n';
        for (const index of entity.indexes) {
          if (index.unique) {
            schema += `  @@unique([${index.fields.join(', ')}])\n`;
          } else {
            schema += `  @@index([${index.fields.join(', ')}])\n`;
          }
        }
      }

      // Add map for table name if different
      if (entity.name !== entity.name.toLowerCase()) {
        schema += `  @@map("${this.toSnakeCase(entity.name)}")\n`;
      }

      schema += `}\n\n`;
    }

    files.push({
      path: `${options.output?.path || './prisma'}/schema.prisma`,
      content: schema,
      type: 'schema'
    });

    // Generate Prisma client extensions for encryption if needed
    if (entities.some(e => e.encrypted?.length)) {
      files.push({
        path: `${options.output?.path || './prisma'}/encryption.ts`,
        content: this.generatePrismaEncryptionExtension(entities),
        type: 'model'
      });
    }

    return files;
  }

  /**
   * Get Prisma type
   */
  private getPrismaType(field: IFieldDefinition, entityName: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Int',
      'boolean': 'Boolean',
      'date': 'DateTime',
      'json': 'Json',
      'uuid': 'String',
      'array': 'String[]'
    };

    if (field.type === 'enum' && field.enum) {
      return `${entityName}${this.toPascalCase(field.name)}`;
    }

    if (field.type === 'number' && (field.precision || field.scale)) {
      return 'Decimal';
    }

    return typeMap[field.type] || 'String';
  }

  /**
   * Generate Prisma encryption extension
   */
  private generatePrismaEncryptionExtension(entities: IEntityDefinition[]): string {
    return `import { Prisma } from '@prisma/client';
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

export function encryptField(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptField(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Prisma middleware for automatic encryption/decryption
export const encryptionMiddleware: Prisma.Middleware = async (params, next) => {
  const encryptedFields: Record<string, string[]> = {
${entities
  .filter(e => e.encrypted?.length)
  .map(e => `    ${e.name}: [${e.encrypted!.map(f => `'${f}'`).join(', ')}]`)
  .join(',\n')}
  };

  // Encrypt on create/update
  if (params.action === 'create' || params.action === 'update' || params.action === 'createMany' || params.action === 'updateMany') {
    const model = params.model;
    if (model && encryptedFields[model]) {
      const fields = encryptedFields[model];
      const data = params.args.data;
      
      if (data) {
        for (const field of fields) {
          if (data[field] && typeof data[field] === 'string') {
            data[field] = encryptField(data[field]);
          }
        }
      }
    }
  }

  const result = await next(params);

  // Decrypt on read
  if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
    const model = params.model;
    if (model && encryptedFields[model] && result) {
      const fields = encryptedFields[model];
      
      const decryptData = (item: any) => {
        for (const field of fields) {
          if (item[field] && typeof item[field] === 'string') {
            try {
              item[field] = decryptField(item[field]);
            } catch (error) {
              console.error(\`Failed to decrypt field \${field}\`, error);
            }
          }
        }
      };

      if (Array.isArray(result)) {
        result.forEach(decryptData);
      } else {
        decryptData(result);
      }
    }
  }

  return result;
};
`;
  }

  /**
   * Generate TypeORM entities
   */
  private async generateTypeORMEntities(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    for (const entity of entities) {
      const content = `import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import crypto from 'crypto';

@Entity('${this.toSnakeCase(entity.name)}')
${entity.indexes?.map(idx => 
  `@Index([${idx.fields.map(f => `'${f}'`).join(', ')}]${idx.unique ? ', { unique: true }' : ''})`
).join('\n') || ''}
export class ${entity.name} {
${entity.fields.map(field => this.generateTypeORMField(field, entity)).join('\n\n')}
${entity.relations?.map(relation => this.generateTypeORMRelation(relation)).join('\n\n') || ''}
${entity.encrypted?.length ? this.generateTypeORMEncryption(entity) : ''}
}`;

      files.push({
        path: `${options.output?.path || './src/entities'}/${this.toKebabCase(entity.name)}.entity.ts`,
        content,
        type: 'model'
      });
    }

    return files;
  }

  /**
   * Generate TypeORM field
   */
  private generateTypeORMField(field: IFieldDefinition, entity: IEntityDefinition): string {
    const decorators: string[] = [];
    const columnOptions: string[] = [];

    if (field.name === 'id') {
      if (field.type === 'uuid') {
        decorators.push(`  @PrimaryGeneratedColumn('uuid')`);
      } else {
        decorators.push(`  @PrimaryGeneratedColumn()`);
      }
    } else if (field.name === 'createdAt') {
      decorators.push(`  @CreateDateColumn()`);
    } else if (field.name === 'updatedAt') {
      decorators.push(`  @UpdateDateColumn()`);
    } else {
      // Column options
      if (field.type === 'string' && field.length) {
        columnOptions.push(`length: ${field.length}`);
      }
      if (!field.required) {
        columnOptions.push('nullable: true');
      }
      if (field.unique) {
        columnOptions.push('unique: true');
      }
      if (field.default !== undefined) {
        columnOptions.push(`default: ${JSON.stringify(field.default)}`);
      }
      if (field.type === 'enum' && field.enum) {
        columnOptions.push(`enum: [${field.enum.map(e => `'${e}'`).join(', ')}]`);
      }

      const typeMap: Record<string, string> = {
        'string': 'varchar',
        'number': 'int',
        'boolean': 'boolean',
        'date': 'timestamp',
        'json': 'json',
        'uuid': 'uuid',
        'enum': 'enum'
      };

      const columnType = typeMap[field.type] || 'varchar';
      const optionsStr = columnOptions.length > 0 ? `, { ${columnOptions.join(', ')} }` : '';
      
      decorators.push(`  @Column('${columnType}'${optionsStr})`);
    }

    const tsType = this.getTypeScriptType(field);
    const optional = field.required ? '' : '?';
    
    return `${decorators.join('\n')}
  ${field.name}${optional}: ${tsType};`;
  }

  /**
   * Generate TypeORM relation
   */
  private generateTypeORMRelation(relation: IRelationDefinition): string {
    switch (relation.type) {
      case 'many-to-one':
        return `  @ManyToOne(() => ${relation.target}, ${this.toCamelCase(relation.target)} => ${this.toCamelCase(relation.target)}.${relation.name})
  @JoinColumn({ name: '${relation.field}' })
  ${relation.name}: ${relation.target};`;
      
      case 'one-to-many':
        return `  @OneToMany(() => ${relation.target}, ${this.toCamelCase(relation.target)} => ${this.toCamelCase(relation.target)}.${relation.name})
  ${relation.name}: ${relation.target}[];`;
      
      default:
        return '';
    }
  }

  /**
   * Generate TypeORM encryption
   */
  private generateTypeORMEncryption(entity: IEntityDefinition): string {
    return `
  @BeforeInsert()
  @BeforeUpdate()
  encryptFields() {
    const encryptedFields = [${entity.encrypted!.map(f => `'${f}'`).join(', ')}];
    
    for (const field of encryptedFields) {
      if (this[field] && typeof this[field] === 'string') {
        this[field] = this.encrypt(this[field]);
      }
    }
  }

  private encrypt(text: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }`;
  }

  /**
   * Generate Drizzle schema
   */
  private async generateDrizzleSchema(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    for (const entity of entities) {
      const imports = this.getDrizzleImports(entity, options);
      
      const content = `import { ${imports.join(', ')} } from 'drizzle-orm/${options.database}';

export const ${this.toCamelCase(entity.name)} = ${options.database}Table('${this.toSnakeCase(entity.name)}', {
${entity.fields.map(field => this.generateDrizzleField(field, options)).join(',\n')}
});

${entity.relations?.length ? this.generateDrizzleRelations(entity) : ''}

export type ${entity.name} = typeof ${this.toCamelCase(entity.name)}.$inferSelect;
export type New${entity.name} = typeof ${this.toCamelCase(entity.name)}.$inferInsert;
`;

      files.push({
        path: `${options.output?.path || './src/db/schema'}/${this.toKebabCase(entity.name)}.ts`,
        content,
        type: 'schema'
      });
    }

    // Generate index file
    const indexContent = entities.map(e => 
      `export * from './${this.toKebabCase(e.name)}';`
    ).join('\n');

    files.push({
      path: `${options.output?.path || './src/db/schema'}/index.ts`,
      content: indexContent,
      type: 'schema'
    });

    return files;
  }

  /**
   * Get Drizzle imports
   */
  private getDrizzleImports(entity: IEntityDefinition, options: Partial<IDatabaseSchemaOptions>): string[] {
    const imports = new Set<string>();
    
    switch (options.database) {
      case 'postgresql':
        imports.add('pgTable');
        break;
      case 'mysql':
        imports.add('mysqlTable');
        break;
      case 'sqlite':
        imports.add('sqliteTable');
        break;
    }

    // Add field type imports
    entity.fields.forEach(field => {
      switch (field.type) {
        case 'string':
          imports.add(field.length ? 'varchar' : 'text');
          break;
        case 'number':
          imports.add('integer');
          break;
        case 'boolean':
          imports.add('boolean');
          break;
        case 'date':
          imports.add('timestamp');
          break;
        case 'json':
          imports.add('json');
          break;
        case 'uuid':
          imports.add('uuid');
          break;
      }
    });

    if (entity.indexes?.length) {
      imports.add('index');
    }

    if (entity.fields.some(f => f.unique)) {
      imports.add('unique');
    }

    return Array.from(imports);
  }

  /**
   * Generate Drizzle field
   */
  private generateDrizzleField(field: IFieldDefinition, options: Partial<IDatabaseSchemaOptions>): string {
    let fieldDef = `  ${field.name}: `;

    switch (field.type) {
      case 'string':
        if (field.length) {
          fieldDef += `varchar({ length: ${field.length} })`;
        } else {
          fieldDef += 'text()';
        }
        break;
      case 'number':
        fieldDef += 'integer()';
        break;
      case 'boolean':
        fieldDef += 'boolean()';
        break;
      case 'date':
        fieldDef += 'timestamp()';
        break;
      case 'json':
        fieldDef += 'json()';
        break;
      case 'uuid':
        fieldDef += field.name === 'id' ? 
          "uuid().primaryKey().defaultRandom()" : 
          "uuid()";
        break;
      case 'enum':
        // For enums, we'd need to define them separately
        fieldDef += `text()`;
        break;
    }

    // Add modifiers
    const modifiers: string[] = [];
    
    if (field.required && field.name !== 'id') {
      modifiers.push('notNull()');
    }
    
    if (field.unique && field.name !== 'id') {
      modifiers.push('unique()');
    }
    
    if (field.default !== undefined) {
      if (field.default === 'now()') {
        modifiers.push('defaultNow()');
      } else {
        modifiers.push(`default(${JSON.stringify(field.default)})`);
      }
    }

    if (modifiers.length > 0) {
      fieldDef += `.${modifiers.join('.')}`;
    }

    return fieldDef;
  }

  /**
   * Generate Drizzle relations
   */
  private generateDrizzleRelations(entity: IEntityDefinition): string {
    return `export const ${this.toCamelCase(entity.name)}Relations = relations(${this.toCamelCase(entity.name)}, ({ one, many }) => ({
${entity.relations!.map(relation => {
  if (relation.type === 'many-to-one') {
    return `  ${relation.name}: one(${this.toCamelCase(relation.target)}, {
    fields: [${this.toCamelCase(entity.name)}.${relation.field}],
    references: [${this.toCamelCase(relation.target)}.${relation.references || 'id'}],
  })`;
  } else if (relation.type === 'one-to-many') {
    return `  ${relation.name}: many(${this.toCamelCase(relation.target)})`;
  }
  return '';
}).filter(Boolean).join(',\n')}
}));`;
  }

  /**
   * Generate Mongoose models
   */
  private async generateMongooseModels(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    for (const entity of entities) {
      const content = `import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

export interface I${entity.name} extends Document {
${entity.fields.map(field => 
  `  ${field.name}${field.required ? '' : '?'}: ${this.getTypeScriptType(field)};`
).join('\n')}
}

const ${entity.name}Schema = new Schema<I${entity.name}>({
${entity.fields.filter(f => f.name !== 'id').map(field => 
  this.generateMongooseField(field)
).join(',\n')}
}, {
  timestamps: true,
  ${entity.softDelete ? 'paranoid: true,' : ''}
  ${entity.multiTenant ? 'discriminatorKey: \'tenantId\',' : ''}
});

${entity.indexes?.map(idx => 
  `${entity.name}Schema.index({ ${idx.fields.map(f => `${f}: 1`).join(', ')} }${idx.unique ? ', { unique: true }' : ''});`
).join('\n') || ''}

${entity.encrypted?.length ? this.generateMongooseEncryption(entity) : ''}

export const ${entity.name} = model<I${entity.name}>('${entity.name}', ${entity.name}Schema);
`;

      files.push({
        path: `${options.output?.path || './src/models'}/${this.toKebabCase(entity.name)}.model.ts`,
        content,
        type: 'model'
      });
    }

    return files;
  }

  /**
   * Generate Mongoose field
   */
  private generateMongooseField(field: IFieldDefinition): string {
    const fieldOptions: string[] = [];

    // Type mapping
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'date': 'Date',
      'json': 'Schema.Types.Mixed',
      'uuid': 'String',
      'array': '[String]'
    };

    fieldOptions.push(`type: ${typeMap[field.type] || 'String'}`);

    if (field.required) {
      fieldOptions.push('required: true');
    }

    if (field.unique) {
      fieldOptions.push('unique: true');
    }

    if (field.default !== undefined) {
      if (field.default === 'now()') {
        fieldOptions.push('default: Date.now');
      } else {
        fieldOptions.push(`default: ${JSON.stringify(field.default)}`);
      }
    }

    if (field.length) {
      fieldOptions.push(`maxlength: ${field.length}`);
    }

    if (field.enum) {
      fieldOptions.push(`enum: [${field.enum.map(e => `'${e}'`).join(', ')}]`);
    }

    // Add validation
    if (field.validation?.length) {
      const validators = field.validation.map(rule => {
        switch (rule.type) {
          case 'min':
            return `min: ${rule.value}`;
          case 'max':
            return `max: ${rule.value}`;
          case 'pattern':
            return `match: ${rule.value}`;
          default:
            return '';
        }
      }).filter(Boolean);

      if (validators.length > 0) {
        fieldOptions.push(...validators);
      }
    }

    return `  ${field.name}: {
    ${fieldOptions.join(',\n    ')}
  }`;
  }

  /**
   * Generate Mongoose encryption
   */
  private generateMongooseEncryption(entity: IEntityDefinition): string {
    return `// Encryption middleware
${entity.name}Schema.pre('save', function(next) {
  const encryptedFields = [${entity.encrypted!.map(f => `'${f}'`).join(', ')}];
  
  for (const field of encryptedFields) {
    if (this.isModified(field) && this[field]) {
      this[field] = encrypt(this[field]);
    }
  }
  
  next();
});

${entity.name}Schema.post('init', function() {
  const encryptedFields = [${entity.encrypted!.map(f => `'${f}'`).join(', ')}];
  
  for (const field of encryptedFields) {
    if (this[field]) {
      this[field] = decrypt(this[field]);
    }
  }
});

function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}`;
  }

  /**
   * Generate migrations
   */
  private async generateMigrations(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    // Generate SQL migration
    let upSql = '-- Migration: Create tables with Norwegian compliance\n\n';
    let downSql = '-- Rollback: Drop tables\n\n';

    for (const entity of entities) {
      // Create table
      upSql += `CREATE TABLE ${this.toSnakeCase(entity.name)} (\n`;
      
      const columns: string[] = [];
      for (const field of entity.fields) {
        columns.push(this.generateSQLColumn(field, options.database));
      }
      
      upSql += columns.join(',\n') + '\n);\n\n';

      // Add indexes
      if (entity.indexes) {
        for (const index of entity.indexes) {
          const indexName = index.name || `idx_${this.toSnakeCase(entity.name)}_${index.fields.join('_')}`;
          upSql += `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX ${indexName} ON ${this.toSnakeCase(entity.name)} (${index.fields.join(', ')})`;
          if (index.where) {
            upSql += ` WHERE ${index.where}`;
          }
          upSql += ';\n';
        }
        upSql += '\n';
      }

      // Drop table
      downSql += `DROP TABLE IF EXISTS ${this.toSnakeCase(entity.name)};\n`;
    }

    // Add audit table if needed
    if (entities.some(e => e.audit)) {
      upSql += this.generateAuditTable(options.database);
      downSql += 'DROP TABLE IF EXISTS audit_log;\n';
    }

    files.push({
      path: `${options.output?.path || './migrations'}/${timestamp}_create_schema.sql`,
      content: upSql + '\n-- Rollback\n-- ' + downSql.replace(/\n/g, '\n-- '),
      type: 'migration'
    });

    // Generate ORM-specific migration
    if (options.orm === 'typeorm') {
      files.push({
        path: `${options.output?.path || './migrations'}/${timestamp}-CreateSchema.ts`,
        content: this.generateTypeORMMigration(entities, timestamp),
        type: 'migration'
      });
    }

    return files;
  }

  /**
   * Generate SQL column
   */
  private generateSQLColumn(field: IFieldDefinition, database?: string): string {
    let column = `  ${this.toSnakeCase(field.name)} `;

    // Type mapping
    switch (field.type) {
      case 'string':
        column += field.length ? `VARCHAR(${field.length})` : 'TEXT';
        break;
      case 'number':
        if (field.precision && field.scale) {
          column += `DECIMAL(${field.precision}, ${field.scale})`;
        } else {
          column += 'INTEGER';
        }
        break;
      case 'boolean':
        column += 'BOOLEAN';
        break;
      case 'date':
        column += database === 'postgresql' ? 'TIMESTAMP WITH TIME ZONE' : 'TIMESTAMP';
        break;
      case 'json':
        column += database === 'postgresql' ? 'JSONB' : 'JSON';
        break;
      case 'uuid':
        column += database === 'postgresql' ? 'UUID' : 'VARCHAR(36)';
        break;
      case 'enum':
        if (database === 'postgresql' && field.enum) {
          // Would need to create enum type first
          column += 'VARCHAR(50)';
        } else {
          column += 'VARCHAR(50)';
        }
        break;
      case 'array':
        column += database === 'postgresql' ? 'TEXT[]' : 'TEXT';
        break;
    }

    // Constraints
    if (field.name === 'id') {
      column += ' PRIMARY KEY';
      if (field.type !== 'uuid' && database === 'postgresql') {
        column = `  ${this.toSnakeCase(field.name)} SERIAL PRIMARY KEY`;
      }
    }

    if (field.required) {
      column += ' NOT NULL';
    }

    if (field.unique && field.name !== 'id') {
      column += ' UNIQUE';
    }

    if (field.default !== undefined) {
      if (field.default === 'now()') {
        column += database === 'postgresql' ? ' DEFAULT CURRENT_TIMESTAMP' : ' DEFAULT CURRENT_TIMESTAMP';
      } else {
        column += ` DEFAULT ${field.type === 'string' ? `'${field.default}'` : field.default}`;
      }
    }

    return column;
  }

  /**
   * Generate audit table
   */
  private generateAuditTable(database?: string): string {
    return `CREATE TABLE audit_log (
  id ${database === 'postgresql' ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  user_id VARCHAR(100),
  changes ${database === 'postgresql' ? 'JSONB' : 'JSON'},
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nsm_classification VARCHAR(20) DEFAULT 'OPEN'
);

CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log (user_id);
CREATE INDEX idx_audit_log_created ON audit_log (created_at);

`;
  }

  /**
   * Generate TypeORM migration
   */
  private generateTypeORMMigration(entities: IEntityDefinition[], timestamp: string): string {
    return `import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateSchema${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
${entities.map(entity => `    await queryRunner.createTable(
      new Table({
        name: '${this.toSnakeCase(entity.name)}',
        columns: [
${entity.fields.map(field => this.generateTypeORMMigrationColumn(field)).join(',\n')}
        ],
      }),
      true
    );

${entity.indexes?.map(index => `    await queryRunner.createIndex(
      '${this.toSnakeCase(entity.name)}',
      new Index({
        name: '${index.name || `idx_${this.toSnakeCase(entity.name)}_${index.fields.join('_')}`}',
        columnNames: [${index.fields.map(f => `'${f}'`).join(', ')}],
        isUnique: ${index.unique || false}
      })
    );`).join('\n\n') || ''}`).join('\n\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${entities.reverse().map(entity => 
  `    await queryRunner.dropTable('${this.toSnakeCase(entity.name)}');`
).join('\n')}
  }
}`;
  }

  /**
   * Generate TypeORM migration column
   */
  private generateTypeORMMigrationColumn(field: IFieldDefinition): string {
    const column: any = {
      name: field.name,
      type: this.getTypeORMColumnType(field),
      isNullable: !field.required
    };

    if (field.name === 'id') {
      column.isPrimary = true;
      if (field.type === 'uuid') {
        column.generationStrategy = 'uuid';
      } else {
        column.isGenerated = true;
        column.generationStrategy = 'increment';
      }
    }

    if (field.unique && field.name !== 'id') {
      column.isUnique = true;
    }

    if (field.default !== undefined) {
      column.default = field.default === 'now()' ? 'CURRENT_TIMESTAMP' : field.default;
    }

    if (field.length) {
      column.length = field.length;
    }

    return `          {
            name: '${column.name}',
            type: '${column.type}',
            ${Object.entries(column)
              .filter(([key]) => key !== 'name' && key !== 'type')
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join(',\n            ')}
          }`;
  }

  /**
   * Get TypeORM column type
   */
  private getTypeORMColumnType(field: IFieldDefinition): string {
    const typeMap: Record<string, string> = {
      'string': field.length ? 'varchar' : 'text',
      'number': field.precision ? 'decimal' : 'int',
      'boolean': 'boolean',
      'date': 'timestamp',
      'json': 'json',
      'uuid': 'uuid',
      'enum': 'enum',
      'array': 'simple-array'
    };

    return typeMap[field.type] || 'varchar';
  }

  /**
   * Generate seed data
   */
  private async generateSeedData(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    // Generate seed data with Norwegian test data
    const seedData = await this.generateNorwegianTestData(entities);

    if (options.orm === 'prisma') {
      files.push({
        path: `${options.output?.path || './prisma'}/seed.ts`,
        content: this.generatePrismaSeed(seedData),
        type: 'seed'
      });
    } else {
      files.push({
        path: `${options.output?.path || './seeds'}/seed-data.json`,
        content: JSON.stringify(seedData, null, 2),
        type: 'seed'
      });
    }

    return files;
  }

  /**
   * Generate Norwegian test data
   */
  private async generateNorwegianTestData(entities: IEntityDefinition[]): Promise<any> {
    const seedData: Record<string, any[]> = {};

    for (const entity of entities) {
      const records: any[] = [];

      // Generate 5 sample records
      for (let i = 0; i < 5; i++) {
        const record: any = {};

        for (const field of entity.fields) {
          if (field.name === 'id') {
            record[field.name] = field.type === 'uuid' ? 
              `550e8400-e29b-41d4-a716-44665544000${i}` : i + 1;
          } else if (field.name === 'createdAt' || field.name === 'updatedAt') {
            record[field.name] = new Date().toISOString();
          } else if (field.name === 'tenantId') {
            record[field.name] = '550e8400-e29b-41d4-a716-446655440001';
          } else {
            record[field.name] = this.generateFieldValue(field, i);
          }
        }

        records.push(record);
      }

      seedData[entity.name] = records;
    }

    return seedData;
  }

  /**
   * Generate field value
   */
  private generateFieldValue(field: IFieldDefinition, index: number): any {
    // Norwegian test data
    const norwegianNames = ['Ole', 'Kari', 'Per', 'Anne', 'Lars'];
    const norwegianCities = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'];
    const norwegianStreets = ['Karl Johans gate', 'Storgata', 'Kirkegata', 'Torggata', 'Dronningens gate'];

    const name = field.name.toLowerCase();

    if (name.includes('name') && name.includes('first')) {
      return norwegianNames[index % norwegianNames.length];
    }

    if (name.includes('name') && name.includes('last')) {
      return ['Hansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen'][index % 5];
    }

    if (name.includes('email')) {
      return `${norwegianNames[index % 5].toLowerCase()}@example.no`;
    }

    if (name.includes('phone')) {
      return `+47 ${40 + index}${String(index).padStart(6, '0')}`;
    }

    if (name.includes('address') || name.includes('street')) {
      return `${norwegianStreets[index % 5]} ${index + 1}`;
    }

    if (name.includes('city')) {
      return norwegianCities[index % norwegianCities.length];
    }

    if (name.includes('postal') || name.includes('zip')) {
      return String(1000 + index * 100).padStart(4, '0');
    }

    if (name.includes('orgnr')) {
      return String(900000000 + index).slice(0, 9);
    }

    // Default values by type
    switch (field.type) {
      case 'string':
        return `${field.name} ${index + 1}`;
      case 'number':
        return index + 1;
      case 'boolean':
        return index % 2 === 0;
      case 'date':
        return new Date().toISOString();
      case 'json':
        return { key: `value_${index}` };
      case 'enum':
        return field.enum ? field.enum[index % field.enum.length] : null;
      default:
        return null;
    }
  }

  /**
   * Generate Prisma seed
   */
  private generatePrismaSeed(seedData: any): string {
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Norwegian test data...');

${Object.entries(seedData).map(([entity, records]) => `
  // Seed ${entity}
  const ${this.toCamelCase(entity)}Data = ${JSON.stringify(records, null, 2)};
  
  for (const data of ${this.toCamelCase(entity)}Data) {
    await prisma.${this.toCamelCase(entity)}.create({ data });
  }
  
  console.log('✅ Created ${records.length} ${entity} records');`).join('\n')}

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
  }

  /**
   * Validate options
   */
  private validateOptions(options: IDatabaseSchemaOptions): void {
    if (!options.name) {
      throw new Error('Schema name is required');
    }

    if (!options.database) {
      throw new Error('Database type is required');
    }

    if (!options.orm) {
      throw new Error('ORM type is required');
    }

    if (!options.entities || options.entities.length === 0) {
      throw new Error('At least one entity is required');
    }

    // Validate entity definitions
    for (const entity of options.entities) {
      if (!entity.name) {
        throw new Error('Entity name is required');
      }

      if (!entity.fields || entity.fields.length === 0) {
        throw new Error(`Entity ${entity.name} must have at least one field`);
      }

      // Validate field definitions
      for (const field of entity.fields) {
        if (!field.name) {
          throw new Error(`Field name is required in entity ${entity.name}`);
        }

        if (!field.type) {
          throw new Error(`Field type is required for ${field.name} in entity ${entity.name}`);
        }
      }
    }
  }

  /**
   * Validate schema
   */
  private async validateSchema(
    entities: IEntityDefinition[],
    options: Partial<IDatabaseSchemaOptions>
  ): Promise<{ valid: boolean; warnings: string[]; errors: string[] }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for missing indexes on foreign keys
    for (const entity of entities) {
      const foreignKeys = entity.fields.filter(f => 
        f.name.endsWith('Id') && f.name !== 'id'
      );

      for (const fk of foreignKeys) {
        const hasIndex = entity.indexes?.some(idx => 
          idx.fields.includes(fk.name)
        );

        if (!hasIndex) {
          warnings.push(`Missing index on foreign key ${entity.name}.${fk.name}`);
        }
      }
    }

    // Check for GDPR compliance
    for (const entity of entities) {
      const personalData = entity.fields.filter(f => 
        f.gdprCategory === 'personal' || f.gdprCategory === 'sensitive'
      );

      if (personalData.length > 0 && !entity.audit) {
        warnings.push(`Entity ${entity.name} contains personal data but audit trail is not enabled`);
      }

      for (const field of personalData) {
        if (options.compliance?.nsmClassification !== 'OPEN' && !field.encrypted) {
          errors.push(`Personal data field ${entity.name}.${field.name} should be encrypted for NSM classification ${options.compliance?.nsmClassification}`);
        }
      }
    }

    // Check for naming conventions
    for (const entity of entities) {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
        warnings.push(`Entity name ${entity.name} should be in PascalCase`);
      }

      for (const field of entity.fields) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(field.name)) {
          warnings.push(`Field name ${entity.name}.${field.name} should be in camelCase`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Extract relationships
   */
  private extractRelationships(entities: IEntityDefinition[]): Array<{
    from: string;
    to: string;
    type: string;
  }> {
    const relationships: Array<{ from: string; to: string; type: string }> = [];

    for (const entity of entities) {
      if (entity.relations) {
        for (const relation of entity.relations) {
          relationships.push({
            from: entity.name,
            to: relation.target,
            type: relation.type
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Extract indexes
   */
  private extractIndexes(entities: IEntityDefinition[]): Array<{
    entity: string;
    fields: string[];
    type: string;
  }> {
    const indexes: Array<{ entity: string; fields: string[]; type: string }> = [];

    for (const entity of entities) {
      if (entity.indexes) {
        for (const index of entity.indexes) {
          indexes.push({
            entity: entity.name,
            fields: index.fields,
            type: index.unique ? 'unique' : index.type || 'btree'
          });
        }
      }
    }

    return indexes;
  }

  /**
   * Check GDPR compliance
   */
  private checkGDPRCompliance(entities: IEntityDefinition[]): boolean {
    for (const entity of entities) {
      const hasPersonalData = entity.fields.some(f => 
        f.gdprCategory === 'personal' || f.gdprCategory === 'sensitive'
      );

      if (hasPersonalData) {
        // Check for required GDPR fields
        const hasConsent = entity.fields.some(f => 
          f.name.toLowerCase().includes('consent') || 
          f.name.toLowerCase().includes('gdpr')
        );

        const hasRetention = entity.fields.some(f => 
          f.name.toLowerCase().includes('retention')
        );

        if (!hasConsent || !hasRetention) {
          return false;
        }

        // Check for encryption
        const sensitiveFields = entity.fields.filter(f => 
          f.gdprCategory === 'sensitive'
        );

        if (sensitiveFields.some(f => !f.encrypted)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get encrypted fields
   */
  private getEncryptedFields(entities: IEntityDefinition[]): string[] {
    const encryptedFields: string[] = [];

    for (const entity of entities) {
      if (entity.encrypted) {
        entity.encrypted.forEach(field => {
          encryptedFields.push(`${entity.name}.${field}`);
        });
      }
    }

    return encryptedFields;
  }

  /**
   * Get TypeScript type
   */
  private getTypeScriptType(field: IFieldDefinition): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'date': 'Date',
      'json': 'any',
      'uuid': 'string',
      'array': 'string[]'
    };

    if (field.type === 'enum' && field.enum) {
      return field.enum.map(e => `'${e}'`).join(' | ');
    }

    return typeMap[field.type] || 'string';
  }
}
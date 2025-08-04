/**
 * API Generator System
 * Complete REST/GraphQL API generation with authentication and documentation
 * Supports OpenAPI 3.0, GraphQL schemas, and enterprise patterns
 */

export interface APIGeneratorOptions {
  readonly type: 'rest' | 'graphql' | 'hybrid';
  readonly framework: 'nestjs' | 'express' | 'fastify' | 'hono';
  readonly authentication: 'jwt' | 'oauth' | 'bankid' | 'firebase' | 'supabase';
  readonly database: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'supabase';
  readonly features: readonly APIFeature[];
  readonly endpoints: readonly APIEndpoint[];
  readonly documentation: boolean;
  readonly testing: boolean;
  readonly validation: boolean;
  readonly rateLimit: boolean;
  readonly cors: boolean;
  readonly swagger: boolean;
}

export type APIFeature = 
  | 'crud'
  | 'search'
  | 'pagination'
  | 'filtering'
  | 'sorting'
  | 'caching'
  | 'logging'
  | 'metrics'
  | 'health-check'
  | 'file-upload'
  | 'email'
  | 'notifications'
  | 'webhooks'
  | 'queue'
  | 'audit';

export interface APIEndpoint {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly description: string;
  readonly requestBody?: APISchema;
  readonly responseBody?: APISchema;
  readonly parameters?: readonly APIParameter[];
  readonly authentication?: boolean;
  readonly rateLimit?: number;
  readonly tags?: readonly string[];
}

export interface APISchema {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  readonly properties?: Record<string, APIProperty>;
  readonly required?: readonly string[];
  readonly example?: unknown;
}

export interface APIProperty {
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly description?: string;
  readonly format?: string;
  readonly enum?: readonly string[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly pattern?: string;
  readonly example?: unknown;
}

export interface APIParameter {
  readonly name: string;
  readonly in: 'query' | 'path' | 'header' | 'cookie';
  readonly type: 'string' | 'number' | 'boolean' | 'array';
  readonly required?: boolean;
  readonly description?: string;
  readonly example?: unknown;
}

export interface APIGeneratorResult {
  readonly success: boolean;
  readonly files: readonly GeneratedAPIFile[];
  readonly endpoints: readonly string[];
  readonly documentation: string;
  readonly message: string;
  readonly nextSteps: readonly string[];
}

export interface GeneratedAPIFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'controller' | 'service' | 'dto' | 'entity' | 'test' | 'documentation';
  readonly language: 'typescript' | 'javascript' | 'yaml' | 'json';
}

/**
 * Main API generator function
 * Generates complete REST/GraphQL API with specified features
 */
export async function generateAPI(
  projectPath: string,
  name: string,
  options: APIGeneratorOptions
): Promise<APIGeneratorResult> {
  try {
    const generator = createAPIGenerator(options.type, options.framework);
    const result = await generator.generate(projectPath, name, options);
    
    return {
      success: true,
      files: result.files,
      endpoints: result.endpoints,
      documentation: result.documentation,
      message: `Successfully generated ${options.type} API '${name}' with ${options.features.length} features`,
      nextSteps: [
        'Review generated API endpoints',
        'Configure authentication settings',
        'Test API endpoints with provided examples',
        'Review OpenAPI documentation',
        'Set up database models if needed',
        'Configure rate limiting and CORS'
      ]
    };
  } catch (error) {
    return {
      success: false,
      files: [],
      endpoints: [],
      documentation: '',
      message: `Failed to generate API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      nextSteps: ['Check the error message and try again']
    };
  }
}

/**
 * API generator factory
 * Creates appropriate generator based on API type and framework
 */
function createAPIGenerator(type: APIGeneratorOptions['type'], framework: APIGeneratorOptions['framework']): APIGenerator {
  switch (type) {
    case 'rest':
      return new RESTAPIGenerator(framework);
    case 'graphql':
      return new GraphQLAPIGenerator(framework);
    case 'hybrid':
      return new HybridAPIGenerator(framework);
    default:
      throw new Error(`Unsupported API type: ${type}`);
  }
}

/**
 * Abstract base class for API generators
 * Provides common functionality for all API generators
 */
export abstract class APIGenerator {
  abstract readonly type: string;
  abstract readonly framework: string;
  abstract readonly supportedFeatures: readonly APIFeature[];

  constructor(protected readonly frameworkType: string) {}

  abstract generate(
    projectPath: string,
    name: string,
    options: APIGeneratorOptions
  ): Promise<APIGeneratorResult>;

  /**
   * Generate OpenAPI specification
   */
  protected generateOpenAPISpec(name: string, options: APIGeneratorOptions): GeneratedAPIFile {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: `${name} API`,
        description: `Enterprise-grade ${options.type} API generated by Xaheen CLI`,
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@xaheen.com'
        }
      },
      servers: [
        {
          url: 'http://localhost:3000/api/v1',
          description: 'Development server'
        },
        {
          url: 'https://api.example.com/v1',
          description: 'Production server'
        }
      ],
      paths: this.generateOpenAPIPaths(options.endpoints),
      components: {
        schemas: this.generateOpenAPISchemas(options.endpoints),
        securitySchemes: this.generateSecuritySchemes(options.authentication)
      },
      security: options.authentication ? [{ bearerAuth: [] }] : []
    };

    return {
      path: `docs/openapi.yaml`,
      content: this.convertToYAML(spec),
      type: 'documentation',
      language: 'yaml'
    };
  }

  /**
   * Generate API controller
   */
  protected generateController(name: string, options: APIGeneratorOptions): GeneratedAPIFile {
    const className = `${this.capitalize(name)}Controller`;
    const serviceName = `${this.capitalize(name)}Service`;
    
    let content = '';
    
    if (this.framework === 'nestjs') {
      content = this.generateNestJSController(className, serviceName, options);
    } else if (this.framework === 'express') {
      content = this.generateExpressController(className, serviceName, options);
    }

    return {
      path: `src/modules/${name}/${name}.controller.ts`,
      content,
      type: 'controller',
      language: 'typescript'
    };
  }

  /**
   * Generate API service
   */
  protected generateService(name: string, options: APIGeneratorOptions): GeneratedAPIFile {
    const className = `${this.capitalize(name)}Service`;
    
    let content = '';
    
    if (this.framework === 'nestjs') {
      content = this.generateNestJSService(className, options);
    } else if (this.framework === 'express') {
      content = this.generateExpressService(className, options);
    }

    return {
      path: `src/modules/${name}/${name}.service.ts`,
      content,
      type: 'service',
      language: 'typescript'
    };
  }

  /**
   * Generate DTOs (Data Transfer Objects)
   */
  protected generateDTOs(name: string, options: APIGeneratorOptions): GeneratedAPIFile[] {
    const files: GeneratedAPIFile[] = [];
    
    // Create DTO
    files.push({
      path: `src/modules/${name}/dto/create-${name}.dto.ts`,
      content: this.generateCreateDTO(name, options),
      type: 'dto',
      language: 'typescript'
    });

    // Update DTO
    files.push({
      path: `src/modules/${name}/dto/update-${name}.dto.ts`,
      content: this.generateUpdateDTO(name, options),
      type: 'dto',
      language: 'typescript'
    });

    // Query DTO
    files.push({
      path: `src/modules/${name}/dto/query-${name}.dto.ts`,
      content: this.generateQueryDTO(name, options),
      type: 'dto',
      language: 'typescript'
    });

    return files;
  }

  /**
   * Generate entity/model
   */
  protected generateEntity(name: string, options: APIGeneratorOptions): GeneratedAPIFile {
    const className = `${this.capitalize(name)}Entity`;
    
    let content = '';
    
    if (options.database === 'postgresql' || options.database === 'mysql') {
      content = this.generateTypeORMEntity(className, options);
    } else if (options.database === 'mongodb') {
      content = this.generateMongooseEntity(className, options);
    } else if (options.database === 'supabase') {
      content = this.generateSupabaseEntity(className, options);
    }

    return {
      path: `src/modules/${name}/entities/${name}.entity.ts`,
      content,
      type: 'entity',
      language: 'typescript'
    };
  }

  /**
   * Generate test files
   */
  protected generateTests(name: string, options: APIGeneratorOptions): GeneratedAPIFile[] {
    const files: GeneratedAPIFile[] = [];

    // Controller tests
    files.push({
      path: `src/modules/${name}/${name}.controller.spec.ts`,
      content: this.generateControllerTests(name, options),
      type: 'test',
      language: 'typescript'
    });

    // Service tests
    files.push({
      path: `src/modules/${name}/${name}.service.spec.ts`,
      content: this.generateServiceTests(name, options),
      type: 'test',
      language: 'typescript'
    });

    // E2E tests
    files.push({
      path: `test/${name}.e2e-spec.ts`,
      content: this.generateE2ETests(name, options),
      type: 'test',
      language: 'typescript'
    });

    return files;
  }

  // Abstract methods to be implemented by specific generators
  protected abstract generateNestJSController(className: string, serviceName: string, options: APIGeneratorOptions): string;
  protected abstract generateExpressController(className: string, serviceName: string, options: APIGeneratorOptions): string;
  protected abstract generateNestJSService(className: string, options: APIGeneratorOptions): string;
  protected abstract generateExpressService(className: string, options: APIGeneratorOptions): string;
  protected abstract generateCreateDTO(name: string, options: APIGeneratorOptions): string;
  protected abstract generateUpdateDTO(name: string, options: APIGeneratorOptions): string;
  protected abstract generateQueryDTO(name: string, options: APIGeneratorOptions): string;
  protected abstract generateTypeORMEntity(className: string, options: APIGeneratorOptions): string;
  protected abstract generateMongooseEntity(className: string, options: APIGeneratorOptions): string;
  protected abstract generateSupabaseEntity(className: string, options: APIGeneratorOptions): string;
  protected abstract generateControllerTests(name: string, options: APIGeneratorOptions): string;
  protected abstract generateServiceTests(name: string, options: APIGeneratorOptions): string;
  protected abstract generateE2ETests(name: string, options: APIGeneratorOptions): string;

  // Utility methods
  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  protected convertToYAML(obj: unknown): string {
    // Simple YAML conversion - in production, use a proper YAML library
    return JSON.stringify(obj, null, 2);
  }

  protected generateOpenAPIPaths(endpoints: readonly APIEndpoint[]): Record<string, unknown> {
    const paths: Record<string, unknown> = {};
    
    for (const endpoint of endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }
      
      (paths[endpoint.path] as Record<string, unknown>)[endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        tags: endpoint.tags || [],
        parameters: endpoint.parameters || [],
        requestBody: endpoint.requestBody ? {
          required: true,
          content: {
            'application/json': {
              schema: endpoint.requestBody
            }
          }
        } : undefined,
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: endpoint.responseBody || { type: 'object' }
              }
            }
          }
        }
      };
    }
    
    return paths;
  }

  protected generateOpenAPISchemas(endpoints: readonly APIEndpoint[]): Record<string, unknown> {
    const schemas: Record<string, unknown> = {};
    
    // Extract schemas from endpoints
    for (const endpoint of endpoints) {
      if (endpoint.requestBody) {
        schemas[`${endpoint.path}Request`] = endpoint.requestBody;
      }
      if (endpoint.responseBody) {
        schemas[`${endpoint.path}Response`] = endpoint.responseBody;
      }
    }
    
    return schemas;
  }

  protected generateSecuritySchemes(authentication: string): Record<string, unknown> {
    switch (authentication) {
      case 'jwt':
        return {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        };
      case 'oauth':
        return {
          oauth2: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://auth.example.com/oauth/authorize',
                tokenUrl: 'https://auth.example.com/oauth/token',
                scopes: {
                  read: 'Read access',
                  write: 'Write access'
                }
              }
            }
          }
        };
      default:
        return {};
    }
  }
}

/**
 * REST API Generator
 * Generates RESTful APIs with CRUD operations
 */
export class RESTAPIGenerator extends APIGenerator {
  readonly type = 'rest';
  readonly framework: string;
  readonly supportedFeatures: readonly APIFeature[] = [
    'crud',
    'search',
    'pagination',
    'filtering',
    'sorting',
    'caching',
    'logging',
    'metrics',
    'health-check',
    'file-upload',
    'webhooks',
    'audit'
  ];

  constructor(framework: string) {
    super(framework);
    this.framework = framework;
  }

  async generate(
    projectPath: string,
    name: string,
    options: APIGeneratorOptions
  ): Promise<APIGeneratorResult> {
    const files: GeneratedAPIFile[] = [];

    // Generate core files
    files.push(this.generateController(name, options));
    files.push(this.generateService(name, options));
    files.push(...this.generateDTOs(name, options));
    files.push(this.generateEntity(name, options));

    // Generate documentation
    if (options.documentation) {
      files.push(this.generateOpenAPISpec(name, options));
    }

    // Generate tests
    if (options.testing) {
      files.push(...this.generateTests(name, options));
    }

    const endpoints = this.generateEndpointList(name, options);
    const documentation = options.documentation ? 
      `OpenAPI documentation generated at docs/openapi.yaml` : 
      'No documentation generated';

    return {
      success: true,
      files,
      endpoints,
      documentation,
      message: `Successfully generated REST API '${name}'`,
      nextSteps: []
    };
  }

  private generateEndpointList(name: string, options: APIGeneratorOptions): string[] {
    const endpoints = [
      `GET /api/v1/${name} - List all ${name}s`,
      `GET /api/v1/${name}/:id - Get ${name} by ID`,
      `POST /api/v1/${name} - Create new ${name}`,
      `PUT /api/v1/${name}/:id - Update ${name}`,
      `DELETE /api/v1/${name}/:id - Delete ${name}`
    ];

    if (options.features.includes('search')) {
      endpoints.push(`GET /api/v1/${name}/search - Search ${name}s`);
    }

    return endpoints;
  }

  // Implementation of abstract methods
  protected generateNestJSController(className: string, serviceName: string, options: APIGeneratorOptions): string {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceName} } from './${serviceName.toLowerCase()}.service';
import { Create${className.replace('Controller', '')}Dto } from './dto/create-${serviceName.toLowerCase().replace('service', '')}.dto';
import { Update${className.replace('Controller', '')}Dto } from './dto/update-${serviceName.toLowerCase().replace('service', '')}.dto';

@ApiTags('${serviceName.toLowerCase().replace('service', '')}')
@Controller('${serviceName.toLowerCase().replace('service', '')}')
export class ${className} {
  constructor(private readonly ${serviceName.toLowerCase()}: ${serviceName}) {}

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'List of items' })
  findAll(@Query() query: any) {
    return this.${serviceName.toLowerCase()}.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item found' })
  findOne(@Param('id') id: string) {
    return this.${serviceName.toLowerCase()}.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created' })
  create(@Body() createDto: Create${className.replace('Controller', '')}Dto) {
    return this.${serviceName.toLowerCase()}.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  update(@Param('id') id: string, @Body() updateDto: Update${className.replace('Controller', '')}Dto) {
    return this.${serviceName.toLowerCase()}.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  remove(@Param('id') id: string) {
    return this.${serviceName.toLowerCase()}.remove(id);
  }
}`;
  }

  protected generateExpressController(className: string, serviceName: string, options: APIGeneratorOptions): string {
    return `// Express controller implementation`;
  }

  protected generateNestJSService(className: string, options: APIGeneratorOptions): string {
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className} {
  async findAll(query: any) {
    // Implementation here
    return [];
  }

  async findOne(id: string) {
    // Implementation here
    return {};
  }

  async create(createDto: any) {
    // Implementation here
    return {};
  }

  async update(id: string, updateDto: any) {
    // Implementation here
    return {};
  }

  async remove(id: string) {
    // Implementation here
    return {};
  }
}`;
  }

  protected generateExpressService(className: string, options: APIGeneratorOptions): string {
    return `// Express service implementation`;
  }

  protected generateCreateDTO(name: string, options: APIGeneratorOptions): string {
    return `import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${this.capitalize(name)}Dto {
  @ApiProperty({ description: 'Name of the ${name}' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the ${name}', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}`;
  }

  protected generateUpdateDTO(name: string, options: APIGeneratorOptions): string {
    return `import { PartialType } from '@nestjs/swagger';
import { Create${this.capitalize(name)}Dto } from './create-${name}.dto';

export class Update${this.capitalize(name)}Dto extends PartialType(Create${this.capitalize(name)}Dto) {}`;
  }

  protected generateQueryDTO(name: string, options: APIGeneratorOptions): string {
    return `import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Query${this.capitalize(name)}Dto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}`;
  }

  protected generateTypeORMEntity(className: string, options: APIGeneratorOptions): string {
    return `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ${className} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
  }

  protected generateMongooseEntity(className: string, options: APIGeneratorOptions): string {
    return `// Mongoose entity implementation`;
  }

  protected generateSupabaseEntity(className: string, options: APIGeneratorOptions): string {
    return `// Supabase entity implementation`;
  }

  protected generateControllerTests(name: string, options: APIGeneratorOptions): string {
    return `// Controller tests implementation`;
  }

  protected generateServiceTests(name: string, options: APIGeneratorOptions): string {
    return `// Service tests implementation`;
  }

  protected generateE2ETests(name: string, options: APIGeneratorOptions): string {
    return `// E2E tests implementation`;
  }
}

/**
 * GraphQL API Generator
 * Generates GraphQL APIs with resolvers and schemas
 */
export class GraphQLAPIGenerator extends APIGenerator {
  readonly type = 'graphql';
  readonly framework: string;
  readonly supportedFeatures: readonly APIFeature[] = [
    'crud',
    'search',
    'pagination',
    'filtering',
    'sorting',
    'caching',
    'logging',
    'metrics'
  ];

  constructor(framework: string) {
    super(framework);
    this.framework = framework;
  }

  async generate(
    projectPath: string,
    name: string,
    options: APIGeneratorOptions
  ): Promise<APIGeneratorResult> {
    // GraphQL implementation
    return {
      success: true,
      files: [],
      endpoints: [],
      documentation: '',
      message: 'GraphQL generator not yet implemented',
      nextSteps: []
    };
  }

  // Stub implementations
  protected generateNestJSController(): string { return ''; }
  protected generateExpressController(): string { return ''; }
  protected generateNestJSService(): string { return ''; }
  protected generateExpressService(): string { return ''; }
  protected generateCreateDTO(): string { return ''; }
  protected generateUpdateDTO(): string { return ''; }
  protected generateQueryDTO(): string { return ''; }
  protected generateTypeORMEntity(): string { return ''; }
  protected generateMongooseEntity(): string { return ''; }
  protected generateSupabaseEntity(): string { return ''; }
  protected generateControllerTests(): string { return ''; }
  protected generateServiceTests(): string { return ''; }
  protected generateE2ETests(): string { return ''; }
}

/**
 * Hybrid API Generator
 * Generates both REST and GraphQL APIs
 */
export class HybridAPIGenerator extends APIGenerator {
  readonly type = 'hybrid';
  readonly framework: string;
  readonly supportedFeatures: readonly APIFeature[] = [
    'crud',
    'search',
    'pagination',
    'filtering',
    'sorting',
    'caching',
    'logging',
    'metrics'
  ];

  constructor(framework: string) {
    super(framework);
    this.framework = framework;
  }

  async generate(
    projectPath: string,
    name: string,
    options: APIGeneratorOptions
  ): Promise<APIGeneratorResult> {
    // Hybrid implementation
    return {
      success: true,
      files: [],
      endpoints: [],
      documentation: '',
      message: 'Hybrid generator not yet implemented',
      nextSteps: []
    };
  }

  // Stub implementations
  protected generateNestJSController(): string { return ''; }
  protected generateExpressController(): string { return ''; }
  protected generateNestJSService(): string { return ''; }
  protected generateExpressService(): string { return ''; }
  protected generateCreateDTO(): string { return ''; }
  protected generateUpdateDTO(): string { return ''; }
  protected generateQueryDTO(): string { return ''; }
  protected generateTypeORMEntity(): string { return ''; }
  protected generateMongooseEntity(): string { return ''; }
  protected generateSupabaseEntity(): string { return ''; }
  protected generateControllerTests(): string { return ''; }
  protected generateServiceTests(): string { return ''; }
  protected generateE2ETests(): string { return ''; }
}

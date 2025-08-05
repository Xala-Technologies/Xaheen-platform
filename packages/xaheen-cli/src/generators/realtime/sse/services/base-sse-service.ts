/**
 * Base SSE Service Implementation
 * Following Single Responsibility and Open/Closed Principles
 */

import { GeneratedFile } from "../../../types/generator.types.js";
import { 
  ISSEService, 
  SSEValidationResult, 
  SSEValidationError, 
  SSEValidationWarning,
  ISSETemplateGenerator,
  ISSEConfigurationManager
} from "../interfaces/service-interfaces.js";
import { SSEBaseConfig } from "../interfaces/index.js";

export abstract class BaseSSEService implements ISSEService {
  protected readonly config: SSEBaseConfig;
  protected readonly templateGenerator: ISSETemplateGenerator;
  protected readonly configManager: ISSEConfigurationManager;

  constructor(
    config: SSEBaseConfig,
    templateGenerator: ISSETemplateGenerator,
    configManager: ISSEConfigurationManager
  ) {
    this.config = config;
    this.templateGenerator = templateGenerator;
    this.configManager = configManager;
  }

  abstract get name(): string;
  abstract isEnabled(): boolean;
  abstract generateFiles(outputDir: string): Promise<GeneratedFile[]>;

  async validate(): Promise<SSEValidationResult> {
    const errors: SSEValidationError[] = [];
    const warnings: SSEValidationWarning[] = [];

    // Base validation
    if (!this.config.projectName) {
      errors.push({
        field: "projectName",
        message: "Project name is required",
        severity: "error",
        code: "MISSING_PROJECT_NAME"
      });
    }

    if (!this.config.framework) {
      errors.push({
        field: "framework",
        message: "Framework is required",
        severity: "error",
        code: "MISSING_FRAMEWORK"
      });
    }

    // Validate framework
    const validFrameworks = ["nestjs", "express", "fastify", "hono"];
    if (this.config.framework && !validFrameworks.includes(this.config.framework)) {
      errors.push({
        field: "framework",
        message: `Invalid framework. Must be one of: ${validFrameworks.join(", ")}`,
        severity: "error",
        code: "INVALID_FRAMEWORK"
      });
    }

    // Validate environment
    const validEnvironments = ["development", "staging", "production"];
    if (this.config.environment && !validEnvironments.includes(this.config.environment)) {
      errors.push({
        field: "environment",
        message: `Invalid environment. Must be one of: ${validEnvironments.join(", ")}`,
        severity: "error",
        code: "INVALID_ENVIRONMENT"
      });
    }

    // Validate port
    if (this.config.port && (this.config.port < 1 || this.config.port > 65535)) {
      errors.push({
        field: "port",
        message: "Port must be between 1 and 65535",
        severity: "error",
        code: "INVALID_PORT"
      });
    }

    // Service-specific validation
    const serviceValidation = await this.validateServiceConfig();
    errors.push(...serviceValidation.errors);
    warnings.push(...serviceValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected abstract validateServiceConfig(): Promise<SSEValidationResult>;

  protected createFile(
    path: string, 
    content: string, 
    type: "controller" | "service" | "module" | "middleware" | "types" | "client" | "test" | "config" = "service"
  ): GeneratedFile {
    return {
      path,
      content,
      type
    };
  }

  protected validateRequired<T>(
    value: T | undefined, 
    fieldName: string, 
    code?: string,
    message?: string
  ): SSEValidationError | null {
    if (!value) {
      return {
        field: fieldName,
        message: message || `${fieldName} is required`,
        severity: "error",
        code: code || `MISSING_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateEnum<T extends string>(
    value: T, 
    allowedValues: readonly T[], 
    fieldName: string,
    code?: string
  ): SSEValidationError | null {
    if (!allowedValues.includes(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
        severity: "error",
        code: code || `INVALID_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateRange(
    value: number, 
    min: number, 
    max: number, 
    fieldName: string,
    code?: string
  ): SSEValidationError | null {
    if (value < min || value > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max}`,
        severity: "error",
        code: code || `INVALID_RANGE_${fieldName.toUpperCase()}`
      };
    }
    return null;
  }

  protected validateUrl(
    url: string, 
    fieldName: string,
    code?: string
  ): SSEValidationError | null {
    try {
      new URL(url);
      return null;
    } catch {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid URL`,
        severity: "error",
        code: code || `INVALID_URL_${fieldName.toUpperCase()}`
      };
    }
  }

  protected createWarning(
    field: string, 
    message: string, 
    recommendation: string
  ): SSEValidationWarning {
    return {
      field,
      message,
      recommendation
    };
  }

  protected getServiceName(): string {
    return `${this.config.projectName}-${this.name}`;
  }

  protected getClassName(suffix: string = ""): string {
    const baseName = this.config.projectName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return `${baseName}${suffix}`;
  }

  protected getFilename(suffix: string, extension: string = "ts"): string {
    return `${this.config.projectName}-${suffix}.${extension}`;
  }

  protected generateImportStatement(modules: Record<string, string[]>): string {
    return Object.entries(modules)
      .map(([module, imports]) => {
        if (imports.length === 1) {
          return `import { ${imports[0]} } from '${module}';`;
        }
        return `import {\n  ${imports.join(',\n  ')}\n} from '${module}';`;
      })
      .join('\n');
  }

  protected generateTypeDefinition(
    typeName: string, 
    properties: Record<string, string>,
    exported = true
  ): string {
    const exportKeyword = exported ? 'export ' : '';
    const props = Object.entries(properties)
      .map(([key, type]) => `  readonly ${key}: ${type};`)
      .join('\n');
    
    return `${exportKeyword}interface ${typeName} {\n${props}\n}`;
  }

  protected generateClassDefinition(
    className: string,
    methods: string[],
    constructor?: string,
    properties?: string[],
    interfaces?: string[],
    exported = true
  ): string {
    const exportKeyword = exported ? 'export ' : '';
    const implementsClause = interfaces ? ` implements ${interfaces.join(', ')}` : '';
    
    let classBody = '';
    
    if (properties && properties.length > 0) {
      classBody += properties.join('\n  ') + '\n\n  ';
    }
    
    if (constructor) {
      classBody += constructor + '\n\n  ';
    }
    
    classBody += methods.join('\n\n  ');
    
    return `${exportKeyword}class ${className}${implementsClause} {\n  ${classBody}\n}`;
  }

  protected generateMethod(
    name: string,
    parameters: Record<string, string>,
    returnType: string,
    body: string,
    isAsync = false,
    visibility: 'public' | 'private' | 'protected' = 'public'
  ): string {
    const asyncKeyword = isAsync ? 'async ' : '';
    const params = Object.entries(parameters)
      .map(([param, type]) => `${param}: ${type}`)
      .join(', ');
    
    return `${visibility} ${asyncKeyword}${name}(${params}): ${returnType} {\n    ${body}\n  }`;
  }

  protected generateFrameworkSpecificContent(content: Record<string, string>): string {
    const framework = this.config.framework;
    return content[framework] || content['default'] || '';
  }

  protected generateEnvironmentVariables(prefix: string = ''): Record<string, string> {
    const envPrefix = prefix ? `${prefix}_` : '';
    return {
      [`${envPrefix}PROJECT_NAME`]: this.config.projectName,
      [`${envPrefix}FRAMEWORK`]: this.config.framework,
      [`${envPrefix}ENVIRONMENT`]: this.config.environment,
      [`${envPrefix}PORT`]: (this.config.port || 3000).toString()
    };
  }

  protected generateDocumentation(
    title: string,
    description: string,
    examples?: string[],
    configuration?: Record<string, string>
  ): string {
    let doc = `# ${title}\n\n${description}\n\n`;
    
    if (examples && examples.length > 0) {
      doc += `## Examples\n\n${examples.join('\n\n')}\n\n`;
    }
    
    if (configuration) {
      doc += `## Configuration\n\n`;
      doc += Object.entries(configuration)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join('\n');
      doc += '\n\n';
    }
    
    return doc;
  }

  protected replaceTemplateVariables(
    template: string, 
    variables: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  protected async readTemplate(templatePath: string): Promise<string> {
    // In a real implementation, this would read from template files
    // For now, we'll generate templates programmatically
    return "";
  }
}
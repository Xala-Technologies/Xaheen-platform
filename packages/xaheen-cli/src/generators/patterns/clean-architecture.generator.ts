/**
 * @fileoverview Clean Architecture Pattern Generator
 * @description Comprehensive Clean Architecture implementation with layered architecture, use cases, and interfaces
 * @author Xaheen CLI
 * @version 2.0.0
 */

import type {
  GeneratorOptions,
  GeneratorResult,
  ProjectInfo,
} from "../../types/index.js";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

/**
 * Clean Architecture Layer Types
 */
export type CleanArchitectureLayerType = 
  | "use-case"
  | "interface-adapter"
  | "framework-driver"
  | "entity"
  | "repository-interface"
  | "repository-implementation"
  | "controller"
  | "presenter"
  | "gateway"
  | "external-interface"
  | "dto"
  | "mapper";

/**
 * Clean Architecture Pattern Types
 */
export type CleanArchitecturePatternType =
  | "complete-feature"
  | "use-case-only"
  | "repository-pattern"
  | "gateway-pattern"
  | "adapter-pattern"
  | "dependency-injection";

/**
 * Clean Architecture Generator Options
 */
export interface CleanArchitectureGeneratorOptions extends GeneratorOptions {
  readonly layerType: CleanArchitectureLayerType;
  readonly patternType: CleanArchitecturePatternType;
  readonly featureName: string;
  readonly entityName?: string;
  readonly fields?: readonly CleanArchitectureField[];
  readonly dependencies?: readonly DependencySpec[];
  readonly useCases?: readonly UseCaseSpec[];
  readonly interfaces?: readonly InterfaceSpec[];
  readonly adapters?: readonly AdapterSpec[];
  readonly includeTests?: boolean;
  readonly includeDocs?: boolean;
  readonly framework?: "nestjs" | "express" | "fastify" | "generic";
}

/**
 * Clean Architecture Field Definition
 */
export interface CleanArchitectureField {
  readonly name: string;
  readonly type: string;
  readonly isRequired: boolean;
  readonly isReadonly?: boolean;
  readonly validation?: readonly ValidationRule[];
  readonly description?: string;
}

/**
 * Dependency Specification
 */
export interface DependencySpec {
  readonly name: string;
  readonly type: string;
  readonly isOptional: boolean;
  readonly description?: string;
}

/**
 * Use Case Specification
 */
export interface UseCaseSpec {
  readonly name: string;
  readonly description: string;
  readonly inputType: string;
  readonly outputType: string;
  readonly dependencies: readonly string[];
  readonly businessRules?: readonly string[];
}

/**
 * Interface Specification
 */
export interface InterfaceSpec {
  readonly name: string;
  readonly methods: readonly InterfaceMethod[];
  readonly description?: string;
}

/**
 * Interface Method
 */
export interface InterfaceMethod {
  readonly name: string;
  readonly parameters: readonly Parameter[];
  readonly returnType: string;
  readonly isAsync: boolean;
  readonly description?: string;
}

/**
 * Parameter Definition
 */
export interface Parameter {
  readonly name: string;
  readonly type: string;
  readonly isOptional: boolean;
}

/**
 * Adapter Specification
 */
export interface AdapterSpec {
  readonly name: string;
  readonly implements: string;
  readonly dependencies: readonly string[];
  readonly description?: string;
}

/**
 * Validation Rule Definition
 */
export interface ValidationRule {
  readonly type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
  readonly value?: string | number;
  readonly message: string;
}

/**
 * Clean Architecture Pattern Generator
 */
export class CleanArchitectureGenerator {
  private readonly projectPath: string;
  private readonly templatesPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.templatesPath = join(__dirname, "../../templates/patterns/clean-architecture");
  }

  /**
   * Generate Clean Architecture pattern based on type
   */
  async generate(
    name: string,
    options: CleanArchitectureGeneratorOptions,
    projectInfo?: ProjectInfo
  ): Promise<GeneratorResult> {
    try {
      const { layerType, patternType, featureName } = options;

      // Ensure clean architecture structure exists
      await this.ensureCleanArchitectureStructure(featureName);

      switch (patternType) {
        case "complete-feature":
          return await this.generateCompleteFeature(name, options);
        case "use-case-only":
          return await this.generateUseCase(name, options);
        case "repository-pattern":
          return await this.generateRepositoryPattern(name, options);
        case "gateway-pattern":
          return await this.generateGatewayPattern(name, options);
        case "adapter-pattern":
          return await this.generateAdapterPattern(name, options);
        case "dependency-injection":
          return await this.generateDependencyInjection(name, options);
        default:
          return await this.generateByLayer(name, options);
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate Clean Architecture pattern: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate complete feature with all layers
   */
  private async generateCompleteFeature(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, entityName = name, fields = [], useCases = [], includeTests = true } = options;
    const files: string[] = [];

    // Generate Entities (Domain Layer)
    const entityContent = this.generateEntity(entityName, fields);
    files.push(await this.writeFile(this.getEntityPath(featureName, entityName), entityContent));

    // Generate Use Cases (Application Layer)
    for (const useCase of useCases) {
      const useCaseContent = this.generateUseCaseClass(useCase, entityName);
      files.push(await this.writeFile(this.getUseCasePath(featureName, useCase.name), useCaseContent));

      const useCaseInterfaceContent = this.generateUseCaseInterface(useCase);
      files.push(await this.writeFile(this.getUseCaseInterfacePath(featureName, useCase.name), useCaseInterfaceContent));
    }

    // Generate Repository Interface (Application Layer)
    const repositoryInterfaceContent = this.generateRepositoryInterface(entityName, fields);
    files.push(await this.writeFile(this.getRepositoryInterfacePath(featureName, entityName), repositoryInterfaceContent));

    // Generate Repository Implementation (Infrastructure Layer)
    const repositoryImplContent = this.generateRepositoryImplementation(entityName, fields, options);
    files.push(await this.writeFile(this.getRepositoryImplementationPath(featureName, entityName), repositoryImplContent));

    // Generate Controller (Interface Adapters Layer)
    const controllerContent = this.generateController(entityName, useCases, options);
    files.push(await this.writeFile(this.getControllerPath(featureName, entityName), controllerContent));

    // Generate DTOs (Interface Adapters Layer)
    const createDtoContent = this.generateCreateDTO(entityName, fields);
    files.push(await this.writeFile(this.getCreateDTOPath(featureName, entityName), createDtoContent));

    const updateDtoContent = this.generateUpdateDTO(entityName, fields);
    files.push(await this.writeFile(this.getUpdateDTOPath(featureName, entityName), updateDtoContent));

    const responseDtoContent = this.generateResponseDTO(entityName, fields);
    files.push(await this.writeFile(this.getResponseDTOPath(featureName, entityName), responseDtoContent));

    // Generate Mappers (Interface Adapters Layer)
    const mapperContent = this.generateMapper(entityName, fields);
    files.push(await this.writeFile(this.getMapperPath(featureName, entityName), mapperContent));

    // Generate Module (Framework Layer)
    const moduleContent = this.generateFeatureModule(featureName, entityName, useCases, options);
    files.push(await this.writeFile(this.getModulePath(featureName), moduleContent));

    // Generate Tests if requested
    if (includeTests) {
      for (const useCase of useCases) {
        const testContent = this.generateUseCaseTest(useCase, entityName);
        files.push(await this.writeFile(this.getUseCaseTestPath(featureName, useCase.name), testContent));
      }

      const controllerTestContent = this.generateControllerTest(entityName, useCases);
      files.push(await this.writeFile(this.getControllerTestPath(featureName, entityName), controllerTestContent));

      const repositoryTestContent = this.generateRepositoryTest(entityName, fields);
      files.push(await this.writeFile(this.getRepositoryTestPath(featureName, entityName), repositoryTestContent));
    }

    // Generate Architecture Documentation
    const archDocContent = this.generateArchitectureDocumentation(featureName, entityName, useCases);
    files.push(await this.writeFile(this.getArchitectureDocPath(featureName), archDocContent));

    return {
      success: true,
      message: `Complete Clean Architecture feature '${featureName}' generated successfully`,
      files,
      commands: [
        "npm run type-check",
        "npm run lint",
        "npm run test:unit",
        "npm run build",
      ],
      nextSteps: [
        `Navigate to src/features/${featureName} to explore the generated structure`,
        "Implement business logic in use cases",
        "Configure database connections in repository implementations",
        "Add validation logic to DTOs",
        "Implement error handling and logging",
        "Add integration tests for complete workflows",
        "Review and customize the generated architecture documentation",
      ],
    };
  }

  /**
   * Generate use case only
   */
  private async generateUseCase(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, useCases = [], includeTests = true } = options;
    const files: string[] = [];

    if (useCases.length === 0) {
      // Generate a basic use case if none specified
      const basicUseCase: UseCaseSpec = {
        name: name,
        description: `${name} use case`,
        inputType: `${this.pascalCase(name)}Input`,
        outputType: `${this.pascalCase(name)}Output`,
        dependencies: [],
      };

      const useCaseContent = this.generateUseCaseClass(basicUseCase, name);
      files.push(await this.writeFile(this.getUseCasePath(featureName, name), useCaseContent));

      const useCaseInterfaceContent = this.generateUseCaseInterface(basicUseCase);
      files.push(await this.writeFile(this.getUseCaseInterfacePath(featureName, name), useCaseInterfaceContent));

      // Generate Input/Output DTOs
      const inputDtoContent = this.generateUseCaseInputDTO(name, []);
      files.push(await this.writeFile(this.getUseCaseInputDTOPath(featureName, name), inputDtoContent));

      const outputDtoContent = this.generateUseCaseOutputDTO(name, []);
      files.push(await this.writeFile(this.getUseCaseOutputDTOPath(featureName, name), outputDtoContent));

      if (includeTests) {
        const testContent = this.generateUseCaseTest(basicUseCase, name);
        files.push(await this.writeFile(this.getUseCaseTestPath(featureName, name), testContent));
      }
    } else {
      for (const useCase of useCases) {
        const useCaseContent = this.generateUseCaseClass(useCase, name);
        files.push(await this.writeFile(this.getUseCasePath(featureName, useCase.name), useCaseContent));

        const useCaseInterfaceContent = this.generateUseCaseInterface(useCase);
        files.push(await this.writeFile(this.getUseCaseInterfacePath(featureName, useCase.name), useCaseInterfaceContent));

        if (includeTests) {
          const testContent = this.generateUseCaseTest(useCase, name);
          files.push(await this.writeFile(this.getUseCaseTestPath(featureName, useCase.name), testContent));
        }
      }
    }

    return {
      success: true,
      message: `Use case '${name}' generated successfully in ${featureName} feature`,
      files,
      commands: [
        "npm run type-check",
        "npm run test:unit",
      ],
      nextSteps: [
        "Implement use case business logic",
        "Add input validation",
        "Handle error cases",
        "Add logging and monitoring",
        "Wire up dependencies in DI container",
      ],
    };
  }

  /**
   * Generate repository pattern
   */
  private async generateRepositoryPattern(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, entityName = name, fields = [], includeTests = true } = options;
    const files: string[] = [];

    // Generate Repository Interface
    const repositoryInterfaceContent = this.generateRepositoryInterface(entityName, fields);
    files.push(await this.writeFile(this.getRepositoryInterfacePath(featureName, entityName), repositoryInterfaceContent));

    // Generate Repository Implementation
    const repositoryImplContent = this.generateRepositoryImplementation(entityName, fields, options);
    files.push(await this.writeFile(this.getRepositoryImplementationPath(featureName, entityName), repositoryImplContent));

    // Generate Repository Factory
    const repositoryFactoryContent = this.generateRepositoryFactory(entityName, options);
    files.push(await this.writeFile(this.getRepositoryFactoryPath(featureName, entityName), repositoryFactoryContent));

    if (includeTests) {
      const repositoryTestContent = this.generateRepositoryTest(entityName, fields);
      files.push(await this.writeFile(this.getRepositoryTestPath(featureName, entityName), repositoryTestContent));
    }

    return {
      success: true,
      message: `Repository pattern for '${entityName}' generated successfully in ${featureName} feature`,
      files,
      commands: [
        "npm run type-check",
        "npm run test:unit",
      ],
      nextSteps: [
        "Implement repository methods",
        "Configure database connections",
        "Add query optimization",
        "Implement caching strategy",
        "Add transaction support",
      ],
    };
  }

  /**
   * Generate gateway pattern
   */
  private async generateGatewayPattern(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, interfaces = [], includeTests = true } = options;
    const files: string[] = [];

    // Generate Gateway Interface
    const gatewayInterfaceContent = this.generateGatewayInterface(name, interfaces);
    files.push(await this.writeFile(this.getGatewayInterfacePath(featureName, name), gatewayInterfaceContent));

    // Generate Gateway Implementation
    const gatewayImplContent = this.generateGatewayImplementation(name, interfaces, options);
    files.push(await this.writeFile(this.getGatewayImplementationPath(featureName, name), gatewayImplContent));

    // Generate Gateway Config
    const gatewayConfigContent = this.generateGatewayConfig(name, options);
    files.push(await this.writeFile(this.getGatewayConfigPath(featureName, name), gatewayConfigContent));

    if (includeTests) {
      const gatewayTestContent = this.generateGatewayTest(name, interfaces);
      files.push(await this.writeFile(this.getGatewayTestPath(featureName, name), gatewayTestContent));
    }

    return {
      success: true,
      message: `Gateway pattern '${name}' generated successfully in ${featureName} feature`,
      files,
      commands: [
        "npm run type-check",
        "npm run test:unit",
      ],
      nextSteps: [
        "Implement gateway methods",
        "Configure external service connections",
        "Add error handling and retry logic",
        "Implement authentication if needed",
        "Add monitoring and logging",
      ],
    };
  }

  /**
   * Generate adapter pattern
   */
  private async generateAdapterPattern(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, adapters = [], includeTests = true } = options;
    const files: string[] = [];

    for (const adapter of adapters) {
      // Generate Adapter Interface
      const adapterInterfaceContent = this.generateAdapterInterface(adapter);
      files.push(await this.writeFile(this.getAdapterInterfacePath(featureName, adapter.name), adapterInterfaceContent));

      // Generate Adapter Implementation
      const adapterImplContent = this.generateAdapterImplementation(adapter, options);
      files.push(await this.writeFile(this.getAdapterImplementationPath(featureName, adapter.name), adapterImplContent));

      if (includeTests) {
        const adapterTestContent = this.generateAdapterTest(adapter);
        files.push(await this.writeFile(this.getAdapterTestPath(featureName, adapter.name), adapterTestContent));
      }
    }

    return {
      success: true,
      message: `Adapter pattern '${name}' generated successfully in ${featureName} feature`,
      files,
      commands: [
        "npm run type-check",
        "npm run test:unit",
      ],
      nextSteps: [
        "Implement adapter methods",
        "Add data transformation logic",
        "Handle external service integration",
        "Add error handling",
        "Configure dependency injection",
      ],
    };
  }

  /**
   * Generate dependency injection configuration
   */
  private async generateDependencyInjection(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { featureName, dependencies = [] } = options;
    const files: string[] = [];

    // Generate DI Container Configuration
    const diConfigContent = this.generateDIConfiguration(featureName, dependencies, options);
    files.push(await this.writeFile(this.getDIConfigPath(featureName), diConfigContent));

    // Generate Service Locator
    const serviceLocatorContent = this.generateServiceLocator(featureName, dependencies);
    files.push(await this.writeFile(this.getServiceLocatorPath(featureName), serviceLocatorContent));

    // Generate Factory for complex objects
    const factoryContent = this.generateDIFactory(featureName, dependencies);
    files.push(await this.writeFile(this.getDIFactoryPath(featureName), factoryContent));

    return {
      success: true,
      message: `Dependency injection configuration generated successfully for ${featureName} feature`,
      files,
      commands: [
        "npm run type-check",
        "npm run build",
      ],
      nextSteps: [
        "Configure dependency bindings",
        "Register services with DI container",
        "Set up lifecycle management",
        "Add configuration validation",
        "Test dependency resolution",
      ],
    };
  }

  /**
   * Generate by specific layer
   */
  private async generateByLayer(
    name: string,
    options: CleanArchitectureGeneratorOptions
  ): Promise<GeneratorResult> {
    const { layerType, featureName } = options;

    switch (layerType) {
      case "entity":
        return await this.generateEntityLayer(name, options);
      case "use-case":
        return await this.generateUseCase(name, options);
      case "repository-interface":
        return await this.generateRepositoryInterfaceLayer(name, options);
      case "repository-implementation":
        return await this.generateRepositoryImplementationLayer(name, options);
      case "controller":
        return await this.generateControllerLayer(name, options);
      case "presenter":
        return await this.generatePresenterLayer(name, options);
      case "gateway":
        return await this.generateGatewayLayer(name, options);
      case "external-interface":
        return await this.generateExternalInterfaceLayer(name, options);
      case "dto":
        return await this.generateDTOLayer(name, options);
      case "mapper":
        return await this.generateMapperLayer(name, options);
      default:
        return {
          success: false,
          message: `Unknown layer type: ${layerType}`,
          error: `Layer type '${layerType}' is not supported`,
        };
    }
  }

  // Layer-specific generation methods
  private async generateEntityLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, fields = [], includeTests = true } = options;
    const files: string[] = [];

    const entityContent = this.generateEntity(name, fields);
    files.push(await this.writeFile(this.getEntityPath(featureName, name), entityContent));

    if (includeTests) {
      const entityTestContent = this.generateEntityTest(name, fields);
      files.push(await this.writeFile(this.getEntityTestPath(featureName, name), entityTestContent));
    }

    return {
      success: true,
      message: `Entity '${name}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement entity business logic", "Add validation rules", "Configure relationships"],
    };
  }

  private async generateRepositoryInterfaceLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, entityName = name, fields = [] } = options;
    const files: string[] = [];

    const repositoryInterfaceContent = this.generateRepositoryInterface(entityName, fields);
    files.push(await this.writeFile(this.getRepositoryInterfacePath(featureName, entityName), repositoryInterfaceContent));

    return {
      success: true,
      message: `Repository interface for '${entityName}' generated successfully`,
      files,
      commands: ["npm run type-check"],
      nextSteps: ["Implement repository interface", "Add custom query methods", "Define transaction boundaries"],
    };
  }

  private async generateRepositoryImplementationLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, entityName = name, fields = [], includeTests = true } = options;
    const files: string[] = [];

    const repositoryImplContent = this.generateRepositoryImplementation(entityName, fields, options);
    files.push(await this.writeFile(this.getRepositoryImplementationPath(featureName, entityName), repositoryImplContent));

    if (includeTests) {
      const repositoryTestContent = this.generateRepositoryTest(entityName, fields);
      files.push(await this.writeFile(this.getRepositoryTestPath(featureName, entityName), repositoryTestContent));
    }

    return {
      success: true,
      message: `Repository implementation for '${entityName}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement repository methods", "Configure database connections", "Add error handling"],
    };
  }

  private async generateControllerLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, useCases = [], includeTests = true } = options;
    const files: string[] = [];

    const controllerContent = this.generateController(name, useCases, options);
    files.push(await this.writeFile(this.getControllerPath(featureName, name), controllerContent));

    if (includeTests) {
      const controllerTestContent = this.generateControllerTest(name, useCases);
      files.push(await this.writeFile(this.getControllerTestPath(featureName, name), controllerTestContent));
    }

    return {
      success: true,
      message: `Controller '${name}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement controller endpoints", "Add request validation", "Configure error handling"],
    };
  }

  private async generatePresenterLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, fields = [], includeTests = true } = options;
    const files: string[] = [];

    const presenterContent = this.generatePresenter(name, fields);
    files.push(await this.writeFile(this.getPresenterPath(featureName, name), presenterContent));

    const presenterInterfaceContent = this.generatePresenterInterface(name, fields);
    files.push(await this.writeFile(this.getPresenterInterfacePath(featureName, name), presenterInterfaceContent));

    if (includeTests) {
      const presenterTestContent = this.generatePresenterTest(name, fields);
      files.push(await this.writeFile(this.getPresenterTestPath(featureName, name), presenterTestContent));
    }

    return {
      success: true,
      message: `Presenter '${name}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement presentation logic", "Add data formatting", "Configure view models"],
    };
  }

  private async generateGatewayLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, interfaces = [], includeTests = true } = options;
    const files: string[] = [];

    const gatewayInterfaceContent = this.generateGatewayInterface(name, interfaces);
    files.push(await this.writeFile(this.getGatewayInterfacePath(featureName, name), gatewayInterfaceContent));

    const gatewayImplContent = this.generateGatewayImplementation(name, interfaces, options);
    files.push(await this.writeFile(this.getGatewayImplementationPath(featureName, name), gatewayImplContent));

    if (includeTests) {
      const gatewayTestContent = this.generateGatewayTest(name, interfaces);
      files.push(await this.writeFile(this.getGatewayTestPath(featureName, name), gatewayTestContent));
    }

    return {
      success: true,
      message: `Gateway '${name}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement gateway methods", "Configure external service connections", "Add error handling"],
    };
  }

  private async generateExternalInterfaceLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, interfaces = [] } = options;
    const files: string[] = [];

    for (const interfaceSpec of interfaces) {
      const interfaceContent = this.generateExternalInterface(interfaceSpec);
      files.push(await this.writeFile(this.getExternalInterfacePath(featureName, interfaceSpec.name), interfaceContent));
    }

    return {
      success: true,
      message: `External interfaces generated successfully`,
      files,
      commands: ["npm run type-check"],
      nextSteps: ["Implement interface contracts", "Add service integration", "Configure authentication"],
    };
  }

  private async generateDTOLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, fields = [] } = options;
    const files: string[] = [];

    const createDtoContent = this.generateCreateDTO(name, fields);
    files.push(await this.writeFile(this.getCreateDTOPath(featureName, name), createDtoContent));

    const updateDtoContent = this.generateUpdateDTO(name, fields);
    files.push(await this.writeFile(this.getUpdateDTOPath(featureName, name), updateDtoContent));

    const responseDtoContent = this.generateResponseDTO(name, fields);
    files.push(await this.writeFile(this.getResponseDTOPath(featureName, name), responseDtoContent));

    return {
      success: true,
      message: `DTOs for '${name}' generated successfully`,
      files,
      commands: ["npm run type-check"],
      nextSteps: ["Add validation decorators", "Configure serialization", "Add API documentation"],
    };
  }

  private async generateMapperLayer(name: string, options: CleanArchitectureGeneratorOptions): Promise<GeneratorResult> {
    const { featureName, fields = [], includeTests = true } = options;
    const files: string[] = [];

    const mapperContent = this.generateMapper(name, fields);
    files.push(await this.writeFile(this.getMapperPath(featureName, name), mapperContent));

    if (includeTests) {
      const mapperTestContent = this.generateMapperTest(name, fields);
      files.push(await this.writeFile(this.getMapperTestPath(featureName, name), mapperTestContent));
    }

    return {
      success: true,
      message: `Mapper for '${name}' generated successfully`,
      files,
      commands: ["npm run type-check", "npm run test:unit"],
      nextSteps: ["Implement mapping logic", "Add validation", "Handle nested objects"],
    };
  }

  // Path generation methods
  private getFeaturePath(featureName: string): string {
    return join(this.projectPath, "src", "features", featureName);
  }

  private getEntityPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "domain", "entities", `${entityName.toLowerCase()}.entity.ts`);
  }

  private getUseCasePath(featureName: string, useCaseName: string): string {
    return join(this.getFeaturePath(featureName), "application", "use-cases", `${this.kebabCase(useCaseName)}.use-case.ts`);
  }

  private getUseCaseInterfacePath(featureName: string, useCaseName: string): string {
    return join(this.getFeaturePath(featureName), "application", "interfaces", `${this.kebabCase(useCaseName)}.interface.ts`);
  }

  private getRepositoryInterfacePath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "application", "interfaces", `${entityName.toLowerCase()}.repository.interface.ts`);
  }

  private getRepositoryImplementationPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "repositories", `${entityName.toLowerCase()}.repository.ts`);
  }

  private getControllerPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "controllers", `${entityName.toLowerCase()}.controller.ts`);
  }

  private getCreateDTOPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "dto", `create-${entityName.toLowerCase()}.dto.ts`);
  }

  private getUpdateDTOPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "dto", `update-${entityName.toLowerCase()}.dto.ts`);
  }

  private getResponseDTOPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "dto", `${entityName.toLowerCase()}-response.dto.ts`);
  }

  private getMapperPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "mappers", `${entityName.toLowerCase()}.mapper.ts`);
  }

  private getModulePath(featureName: string): string {
    return join(this.getFeaturePath(featureName), `${featureName.toLowerCase()}.module.ts`);
  }

  private getGatewayInterfacePath(featureName: string, gatewayName: string): string {
    return join(this.getFeaturePath(featureName), "application", "interfaces", `${gatewayName.toLowerCase()}.gateway.interface.ts`);
  }

  private getGatewayImplementationPath(featureName: string, gatewayName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "gateways", `${gatewayName.toLowerCase()}.gateway.ts`);
  }

  private getGatewayConfigPath(featureName: string, gatewayName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "config", `${gatewayName.toLowerCase()}.config.ts`);
  }

  private getAdapterInterfacePath(featureName: string, adapterName: string): string {
    return join(this.getFeaturePath(featureName), "application", "interfaces", `${adapterName.toLowerCase()}.adapter.interface.ts`);
  }

  private getAdapterImplementationPath(featureName: string, adapterName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "adapters", `${adapterName.toLowerCase()}.adapter.ts`);
  }

  private getPresenterPath(featureName: string, presenterName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "presenters", `${presenterName.toLowerCase()}.presenter.ts`);
  }

  private getPresenterInterfacePath(featureName: string, presenterName: string): string {
    return join(this.getFeaturePath(featureName), "application", "interfaces", `${presenterName.toLowerCase()}.presenter.interface.ts`);
  }

  private getExternalInterfacePath(featureName: string, interfaceName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "external", `${interfaceName.toLowerCase()}.interface.ts`);
  }

  private getDIConfigPath(featureName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "di", "container.config.ts");
  }

  private getServiceLocatorPath(featureName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "di", "service-locator.ts");
  }

  private getDIFactoryPath(featureName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "di", "factory.ts");
  }

  private getRepositoryFactoryPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "factories", `${entityName.toLowerCase()}-repository.factory.ts`);
  }

  private getUseCaseInputDTOPath(featureName: string, useCaseName: string): string {
    return join(this.getFeaturePath(featureName), "application", "dto", `${this.kebabCase(useCaseName)}-input.dto.ts`);
  }

  private getUseCaseOutputDTOPath(featureName: string, useCaseName: string): string {
    return join(this.getFeaturePath(featureName), "application", "dto", `${this.kebabCase(useCaseName)}-output.dto.ts`);
  }

  private getArchitectureDocPath(featureName: string): string {
    return join(this.getFeaturePath(featureName), "README.md");
  }

  // Test path methods
  private getEntityTestPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "domain", "entities", `${entityName.toLowerCase()}.entity.spec.ts`);
  }

  private getUseCaseTestPath(featureName: string, useCaseName: string): string {
    return join(this.getFeaturePath(featureName), "application", "use-cases", `${this.kebabCase(useCaseName)}.use-case.spec.ts`);
  }

  private getRepositoryTestPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "repositories", `${entityName.toLowerCase()}.repository.spec.ts`);
  }

  private getControllerTestPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "controllers", `${entityName.toLowerCase()}.controller.spec.ts`);
  }

  private getGatewayTestPath(featureName: string, gatewayName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "gateways", `${gatewayName.toLowerCase()}.gateway.spec.ts`);
  }

  private getAdapterTestPath(featureName: string, adapterName: string): string {
    return join(this.getFeaturePath(featureName), "infrastructure", "adapters", `${adapterName.toLowerCase()}.adapter.spec.ts`);
  }

  private getPresenterTestPath(featureName: string, presenterName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "presenters", `${presenterName.toLowerCase()}.presenter.spec.ts`);
  }

  private getMapperTestPath(featureName: string, entityName: string): string {
    return join(this.getFeaturePath(featureName), "interface-adapters", "mappers", `${entityName.toLowerCase()}.mapper.spec.ts`);
  }

  /**
   * Ensure clean architecture structure exists
   */
  private async ensureCleanArchitectureStructure(featureName: string): Promise<void> {
    const featurePath = this.getFeaturePath(featureName);
    const directories = [
      "domain/entities",
      "application/use-cases",
      "application/interfaces",
      "application/dto",
      "interface-adapters/controllers",
      "interface-adapters/presenters",
      "interface-adapters/dto",
      "interface-adapters/mappers",
      "infrastructure/repositories",
      "infrastructure/gateways",
      "infrastructure/adapters",
      "infrastructure/external",
      "infrastructure/config",
      "infrastructure/di",
      "infrastructure/factories",
    ];

    for (const dir of directories) {
      const fullPath = join(featurePath, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /**
   * Write file and return relative path
   */
  private async writeFile(filePath: string, content: string): Promise<string> {
    const fs = await import("fs/promises");
    const dir = join(filePath, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await fs.writeFile(filePath, content, "utf-8");
    return filePath.replace(this.projectPath + "/", "");
  }

  // Content generation methods (simplified for brevity - would be much more comprehensive in production)
  private generateEntity(name: string, fields: readonly CleanArchitectureField[]): string {
    const fieldsCode = fields.map(field => 
      `  private _${field.name}: ${field.type};`
    ).join('\n');

    const gettersCode = fields.map(field => 
      `  get ${field.name}(): ${field.type} {\n    return this._${field.name};\n  }`
    ).join('\n\n');

    return `/**
 * ${name} Entity
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

export class ${this.pascalCase(name)} {
  private readonly _id: string;
${fieldsCode}

  constructor(
    id: string,
${fields.map(field => `    ${field.name}: ${field.type}`).join(',\n')}
  ) {
    this._id = id;
${fields.map(field => `    this._${field.name} = ${field.name};`).join('\n')}
  }

  get id(): string {
    return this._id;
  }

${gettersCode}

  // Business methods
  update(${fields.map(field => `${field.name}?: ${field.type}`).join(', ')}): void {
${fields.map(field => `    if (${field.name} !== undefined) this._${field.name} = ${field.name};`).join('\n')}
  }
}
`;
  }

  private generateUseCaseClass(useCase: UseCaseSpec, entityName: string): string {
    const dependenciesCode = useCase.dependencies.map(dep => 
      `    private readonly ${this.camelCase(dep)}: ${this.pascalCase(dep)},`
    ).join('\n');

    return `/**
 * ${useCase.name} Use Case
 * ${useCase.description}
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

import { Injectable } from '@nestjs/common';
import { ${useCase.inputType} } from '../dto/${this.kebabCase(useCase.name)}-input.dto';
import { ${useCase.outputType} } from '../dto/${this.kebabCase(useCase.name)}-output.dto';

@Injectable()
export class ${this.pascalCase(useCase.name)}UseCase {
  constructor(
${dependenciesCode}
  ) {}

  async execute(input: ${useCase.inputType}): Promise<${useCase.outputType}> {
    // TODO: Implement use case logic
${useCase.businessRules?.map(rule => `    // ${rule}`).join('\n') || ''}
    
    throw new Error('Use case not implemented');
  }
}
`;
  }

  private generateUseCaseInterface(useCase: UseCaseSpec): string {
    return `/**
 * ${useCase.name} Use Case Interface
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

import { ${useCase.inputType} } from '../dto/${this.kebabCase(useCase.name)}-input.dto';
import { ${useCase.outputType} } from '../dto/${this.kebabCase(useCase.name)}-output.dto';

export interface I${this.pascalCase(useCase.name)}UseCase {
  execute(input: ${useCase.inputType}): Promise<${useCase.outputType}>;
}
`;
  }

  private generateRepositoryInterface(entityName: string, fields: readonly CleanArchitectureField[]): string {
    return `/**
 * ${entityName} Repository Interface
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

import { ${this.pascalCase(entityName)} } from '../../domain/entities/${entityName.toLowerCase()}.entity';

export interface I${this.pascalCase(entityName)}Repository {
  findById(id: string): Promise<${this.pascalCase(entityName)} | null>;
  findAll(): Promise<${this.pascalCase(entityName)}[]>;
  save(entity: ${this.pascalCase(entityName)}): Promise<${this.pascalCase(entityName)}>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
`;
  }

  private generateRepositoryImplementation(
    entityName: string, 
    fields: readonly CleanArchitectureField[], 
    options: CleanArchitectureGeneratorOptions
  ): string {
    const framework = options.framework || "nestjs";
    const decorator = framework === "nestjs" ? "@Injectable()" : "";
    const imports = framework === "nestjs" ? "import { Injectable } from '@nestjs/common';" : "";

    return `/**
 * ${entityName} Repository Implementation
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

${imports}
import { I${this.pascalCase(entityName)}Repository } from '../../application/interfaces/${entityName.toLowerCase()}.repository.interface';
import { ${this.pascalCase(entityName)} } from '../../domain/entities/${entityName.toLowerCase()}.entity';

${decorator}
export class ${this.pascalCase(entityName)}Repository implements I${this.pascalCase(entityName)}Repository {
  async findById(id: string): Promise<${this.pascalCase(entityName)} | null> {
    // TODO: Implement database query
    throw new Error('Method not implemented');
  }

  async findAll(): Promise<${this.pascalCase(entityName)}[]> {
    // TODO: Implement database query
    throw new Error('Method not implemented');
  }

  async save(entity: ${this.pascalCase(entityName)}): Promise<${this.pascalCase(entityName)}> {
    // TODO: Implement database save
    throw new Error('Method not implemented');
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement database delete
    throw new Error('Method not implemented');
  }

  async exists(id: string): Promise<boolean> {
    // TODO: Implement existence check
    throw new Error('Method not implemented');
  }
}
`;
  }

  private generateController(
    entityName: string, 
    useCases: readonly UseCaseSpec[], 
    options: CleanArchitectureGeneratorOptions
  ): string {
    const framework = options.framework || "nestjs";
    const controllerDecorator = framework === "nestjs" ? "@Controller()" : "";
    const imports = framework === "nestjs" ? 
      "import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';" : "";

    const endpointsCode = useCases.map(useCase => 
      `  @Post('${this.kebabCase(useCase.name)}')\n  async ${this.camelCase(useCase.name)}(@Body() input: ${useCase.inputType}): Promise<${useCase.outputType}> {\n    return await this.${this.camelCase(useCase.name)}UseCase.execute(input);\n  }`
    ).join('\n\n');

    const constructorDeps = useCases.map(useCase => 
      `    private readonly ${this.camelCase(useCase.name)}UseCase: ${this.pascalCase(useCase.name)}UseCase,`
    ).join('\n');

    return `/**
 * ${entityName} Controller
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

${imports}
${useCases.map(useCase => `import { ${this.pascalCase(useCase.name)}UseCase } from '../../application/use-cases/${this.kebabCase(useCase.name)}.use-case';`).join('\n')}
${useCases.map(useCase => `import { ${useCase.inputType} } from '../dto/${this.kebabCase(useCase.name)}-input.dto';`).join('\n')}
${useCases.map(useCase => `import { ${useCase.outputType} } from '../dto/${this.kebabCase(useCase.name)}-output.dto';`).join('\n')}

${controllerDecorator}
export class ${this.pascalCase(entityName)}Controller {
  constructor(
${constructorDeps}
  ) {}

${endpointsCode}
}
`;
  }

  private generateCreateDTO(entityName: string, fields: readonly CleanArchitectureField[]): string {
    const fieldsCode = fields.map(field => 
      `  ${field.isReadonly ? 'readonly ' : ''}${field.name}${field.isRequired ? '' : '?'}: ${field.type};`
    ).join('\n');

    return `/**
 * Create ${entityName} DTO
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

export class Create${this.pascalCase(entityName)}Dto {
${fieldsCode}
}
`;
  }

  private generateUpdateDTO(entityName: string, fields: readonly CleanArchitectureField[]): string {
    const fieldsCode = fields.map(field => 
      `  ${field.isReadonly ? 'readonly ' : ''}${field.name}?: ${field.type};`
    ).join('\n');

    return `/**
 * Update ${entityName} DTO
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

export class Update${this.pascalCase(entityName)}Dto {
${fieldsCode}
}
`;
  }

  private generateResponseDTO(entityName: string, fields: readonly CleanArchitectureField[]): string {
    const fieldsCode = fields.map(field => 
      `  readonly ${field.name}: ${field.type};`
    ).join('\n');

    return `/**
 * ${entityName} Response DTO
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

export class ${this.pascalCase(entityName)}ResponseDto {
  readonly id: string;
${fieldsCode}
}
`;
  }

  private generateMapper(entityName: string, fields: readonly CleanArchitectureField[]): string {
    return `/**
 * ${entityName} Mapper
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

import { ${this.pascalCase(entityName)} } from '../../domain/entities/${entityName.toLowerCase()}.entity';
import { Create${this.pascalCase(entityName)}Dto } from '../dto/create-${entityName.toLowerCase()}.dto';
import { ${this.pascalCase(entityName)}ResponseDto } from '../dto/${entityName.toLowerCase()}-response.dto';

export class ${this.pascalCase(entityName)}Mapper {
  static toEntity(dto: Create${this.pascalCase(entityName)}Dto, id: string): ${this.pascalCase(entityName)} {
    return new ${this.pascalCase(entityName)}(
      id,
${fields.map(field => `      dto.${field.name}`).join(',\n')}
    );
  }

  static toResponseDto(entity: ${this.pascalCase(entityName)}): ${this.pascalCase(entityName)}ResponseDto {
    return {
      id: entity.id,
${fields.map(field => `      ${field.name}: entity.${field.name}`).join(',\n')}
    };
  }
}
`;
  }

  private generateFeatureModule(
    featureName: string, 
    entityName: string, 
    useCases: readonly UseCaseSpec[], 
    options: CleanArchitectureGeneratorOptions
  ): string {
    const providers = [
      `${this.pascalCase(entityName)}Repository`,
      ...useCases.map(useCase => `${this.pascalCase(useCase.name)}UseCase`)
    ];

    const controllers = [`${this.pascalCase(entityName)}Controller`];

    return `/**
 * ${featureName} Feature Module
 * Generated by Xaheen CLI - Clean Architecture Generator
 */

import { Module } from '@nestjs/common';
import { ${this.pascalCase(entityName)}Controller } from './interface-adapters/controllers/${entityName.toLowerCase()}.controller';
import { ${this.pascalCase(entityName)}Repository } from './infrastructure/repositories/${entityName.toLowerCase()}.repository';
${useCases.map(useCase => `import { ${this.pascalCase(useCase.name)}UseCase } from './application/use-cases/${this.kebabCase(useCase.name)}.use-case';`).join('\n')}

@Module({
  controllers: [${controllers.join(', ')}],
  providers: [
    ${providers.join(',\n    ')},
    {
      provide: 'I${this.pascalCase(entityName)}Repository',
      useClass: ${this.pascalCase(entityName)}Repository,
    },
  ],
  exports: [${providers.join(', ')}],
})
export class ${this.pascalCase(featureName)}Module {}
`;
  }

  // Simplified implementations of other generation methods
  private generateUseCaseInputDTO(name: string, fields: readonly CleanArchitectureField[]): string {
    return `export class ${this.pascalCase(name)}Input {\n  // TODO: Define input fields\n}`;
  }

  private generateUseCaseOutputDTO(name: string, fields: readonly CleanArchitectureField[]): string {
    return `export class ${this.pascalCase(name)}Output {\n  // TODO: Define output fields\n}`;
  }

  private generateRepositoryFactory(entityName: string, options: CleanArchitectureGeneratorOptions): string {
    return `export class ${this.pascalCase(entityName)}RepositoryFactory {\n  // TODO: Implement factory\n}`;
  }

  private generateGatewayInterface(name: string, interfaces: readonly InterfaceSpec[]): string {
    return `export interface I${this.pascalCase(name)}Gateway {\n  // TODO: Define gateway methods\n}`;
  }

  private generateGatewayImplementation(name: string, interfaces: readonly InterfaceSpec[], options: CleanArchitectureGeneratorOptions): string {
    return `export class ${this.pascalCase(name)}Gateway implements I${this.pascalCase(name)}Gateway {\n  // TODO: Implement gateway\n}`;
  }

  private generateGatewayConfig(name: string, options: CleanArchitectureGeneratorOptions): string {
    return `export class ${this.pascalCase(name)}Config {\n  // TODO: Define configuration\n}`;
  }

  private generateAdapterInterface(adapter: AdapterSpec): string {
    return `export interface I${this.pascalCase(adapter.name)}Adapter {\n  // TODO: Define adapter methods\n}`;
  }

  private generateAdapterImplementation(adapter: AdapterSpec, options: CleanArchitectureGeneratorOptions): string {
    return `export class ${this.pascalCase(adapter.name)}Adapter implements I${this.pascalCase(adapter.name)}Adapter {\n  // TODO: Implement adapter\n}`;
  }

  private generatePresenter(name: string, fields: readonly CleanArchitectureField[]): string {
    return `export class ${this.pascalCase(name)}Presenter {\n  // TODO: Implement presenter\n}`;
  }

  private generatePresenterInterface(name: string, fields: readonly CleanArchitectureField[]): string {
    return `export interface I${this.pascalCase(name)}Presenter {\n  // TODO: Define presenter methods\n}`;
  }

  private generateExternalInterface(interfaceSpec: InterfaceSpec): string {
    return `export interface ${this.pascalCase(interfaceSpec.name)} {\n  // TODO: Define external interface\n}`;
  }

  private generateDIConfiguration(featureName: string, dependencies: readonly DependencySpec[], options: CleanArchitectureGeneratorOptions): string {
    return `export class ${this.pascalCase(featureName)}DIConfig {\n  // TODO: Configure dependency injection\n}`;
  }

  private generateServiceLocator(featureName: string, dependencies: readonly DependencySpec[]): string {
    return `export class ${this.pascalCase(featureName)}ServiceLocator {\n  // TODO: Implement service locator\n}`;
  }

  private generateDIFactory(featureName: string, dependencies: readonly DependencySpec[]): string {
    return `export class ${this.pascalCase(featureName)}Factory {\n  // TODO: Implement factory\n}`;
  }

  private generateArchitectureDocumentation(featureName: string, entityName: string, useCases: readonly UseCaseSpec[]): string {
    return `# ${this.pascalCase(featureName)} Feature - Clean Architecture

This feature was generated using the Xaheen CLI Clean Architecture Generator.

## Architecture Overview

This feature follows Clean Architecture principles with the following layers:

### 1. Domain Layer (Entities)
- \`${entityName.toLowerCase()}.entity.ts\` - Core business entity

### 2. Application Layer (Use Cases)
${useCases.map(useCase => `- \`${this.kebabCase(useCase.name)}.use-case.ts\` - ${useCase.description}`).join('\n')}

### 3. Interface Adapters Layer
- Controllers - Handle HTTP requests
- DTOs - Data transfer objects
- Mappers - Convert between layers
- Presenters - Format response data

### 4. Infrastructure Layer
- Repository implementations
- External service adapters
- Database configurations

### 5. Framework Layer
- Module configuration
- Dependency injection setup

## Dependency Flow

\`\`\`
Framework → Interface Adapters → Application → Domain
         ↓                    ↓            ↓
Infrastructure ← Infrastructure ← Infrastructure
\`\`\`

## Getting Started

1. Implement the business logic in use cases
2. Configure database connections in repositories
3. Add validation to DTOs
4. Implement error handling
5. Add tests for each layer
6. Configure dependency injection

## Testing Strategy

- Unit tests for entities and use cases
- Integration tests for repositories
- End-to-end tests for controllers
- Mock external dependencies in tests
`;
  }

  // Test generation methods (simplified)
  private generateEntityTest(name: string, fields: readonly CleanArchitectureField[]): string {
    return `describe('${this.pascalCase(name)} Entity', () => {\n  it('should create entity', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateUseCaseTest(useCase: UseCaseSpec, entityName: string): string {
    return `describe('${this.pascalCase(useCase.name)} Use Case', () => {\n  it('should execute use case', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateRepositoryTest(entityName: string, fields: readonly CleanArchitectureField[]): string {
    return `describe('${this.pascalCase(entityName)} Repository', () => {\n  it('should save and retrieve entity', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateControllerTest(entityName: string, useCases: readonly UseCaseSpec[]): string {
    return `describe('${this.pascalCase(entityName)} Controller', () => {\n  it('should handle requests', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateGatewayTest(name: string, interfaces: readonly InterfaceSpec[]): string {
    return `describe('${this.pascalCase(name)} Gateway', () => {\n  it('should integrate with external service', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateAdapterTest(adapter: AdapterSpec): string {
    return `describe('${this.pascalCase(adapter.name)} Adapter', () => {\n  it('should adapt interface', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generatePresenterTest(name: string, fields: readonly CleanArchitectureField[]): string {
    return `describe('${this.pascalCase(name)} Presenter', () => {\n  it('should present data', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  private generateMapperTest(name: string, fields: readonly CleanArchitectureField[]): string {
    return `describe('${this.pascalCase(name)} Mapper', () => {\n  it('should map between objects', () => {\n    // TODO: Implement test\n  });\n});`;
  }

  // Utility methods
  private pascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private camelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}